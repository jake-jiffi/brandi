import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as P from '../scripts/producttokens.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { systemInputFromBrand } from '../scripts/brandfile.mjs';
import { contrastRatio, toOklch, oklchToHex, gamutMapOklch } from '../scripts/color.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const brand = JSON.parse(readFileSync(path.join(ROOT, 'tests', 'fixtures', 'muddy-paws.json'), 'utf8'));
const system = buildSystem(systemInputFromBrand(brand));
const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;

describe('compositing: what a person actually sees', () => {
  test('contrastRatio ignores alpha, which is the whole reason composite exists', () => {
    // A 50% black wash scored as if it were solid black.
    assert.equal(contrastRatio('#00000080', '#ffffff'), 21);
    const seen = P.composite('#00000080', '#ffffff');
    assert.match(seen, /^#(7f7f7f|808080)$/);
    assert.ok(contrastRatio(seen, '#ffffff') < 4.5);
  });

  test('an opaque colour composites to itself, and a translucent ground is refused', () => {
    assert.equal(P.composite('#123456', '#ffffff'), '#123456');
    assert.throws(() => P.composite('#000000', '#ffffff80'), TypeError);
  });
});

describe('solveForContrast', () => {
  test('a seed that already passes comes back untouched, so the brand colour stays the brand colour', () => {
    const r = P.solveForContrast('#1F6F4A', ['#ffffff'], 4.5);
    assert.equal(r.hex, '#1F6F4A');
    assert.equal(r.moved, false);
  });

  test('a seed that fails is moved only as far as it must, and keeps its hue', () => {
    const r = P.solveForContrast('#84B4FC', ['#ffffff', '#F5F5F5'], 4.5);
    assert.ok(r.moved);
    assert.ok(contrastRatio(r.hex, '#ffffff') >= 4.5 && contrastRatio(r.hex, '#F5F5F5') >= 4.5);
    // The margin is small: a solved value lands just past the floor, not at black.
    assert.ok(contrastRatio(r.hex, '#F5F5F5') < 5.2, `overshot to ${r.hex}`);
    assert.ok(Math.abs(toOklch(r.hex).h - toOklch('#84B4FC').h) < 6);
  });

  test('floor mode finds the quietest passing value, even when the seed is far darker than it needs to be', () => {
    const nearest = P.solveForContrast('#222222', ['#ffffff'], 4.5);
    const floor = P.solveForContrast('#222222', ['#ffffff'], 4.5, { mode: 'floor' });
    assert.equal(nearest.hex, '#222222');
    assert.ok(floor.ratio >= 4.5 && floor.ratio < 5.2, `floor landed at ${floor.ratio}`);
  });

  test('an impossible target is reported short rather than faked', () => {
    // Nothing reaches 7:1 against both black and white.
    const r = P.solveForContrast('#777777', ['#000000', '#ffffff'], 7);
    assert.equal(r.short, true);
  });
});

describe('stateOf: hover and pressed never cost the label its contrast', () => {
  for (const [fill, label] of [['#D62828', '#ffffff'], ['#120A3F', '#ffffff'], ['#FFF389', '#111111'], ['#5B9BFC', '#120A3F']]) {
    test(`${fill} with a ${label} label`, () => {
      for (const amount of [0.05, 0.09]) {
        const s = P.stateOf(fill, label, amount);
        assert.notEqual(s.toLowerCase(), fill.toLowerCase(), 'a state has to look different from rest');
        assert.ok(contrastRatio(s, label) >= 4.5, `${s} drops the label to ${contrastRatio(s, label)}`);
      }
    });
  }
});

describe('buildProductTokens on a real brand file', () => {
  const tokens = P.buildProductTokens(system, { name: 'Muddy Paws' });
  const audit = P.auditProductTokens(tokens);

  test('carries every product role, in both themes, as a colour or an alias that resolves to one', () => {
    const names = new Set(tokens.color.tokens.map((t) => t.name));
    for (const role of P.PRODUCT_ROLES) {
      assert.ok(names.has(role), `missing ${role}`);
      for (const theme of ['light', 'dark']) assert.match(P.resolveColour(tokens, role, theme), HEX, `${role} (${theme})`);
    }
  });

  test('passes its own audit with every declared pair measured', () => {
    assert.equal(audit.fails.length, 0, audit.fails.map((f) => `${f.theme} ${f.fg} on ${f.bg} ${f.ratio}`).join('; '));
    assert.ok(audit.pairs > 150, `only ${audit.pairs} pairs`);
    assert.equal(P.auditSummary(audit), `colour tokens ${audit.colourTokens} | pairs checked ${audit.pairs} | fails 0`);
  });

  test('keeps a readable hierarchy: text, then muted, then subtle, each a distinct step', () => {
    for (const theme of ['light', 'dark']) {
      const on = P.resolveColour(tokens, 'surface', theme);
      const r = (n) => contrastRatio(P.resolveColour(tokens, n, theme), on);
      assert.ok(r('text') > r('text-muted') + 2, `${theme}: text and muted are too close`);
      assert.ok(r('text-muted') > r('text-subtle') + 1.5, `${theme}: muted and subtle are too close`);
      assert.ok(r('text-subtle') >= 4.5);
    }
  });

  test('measures washes over the surface they sit on, not as if they were solid', () => {
    const row = audit.rows.find((x) => x.theme === 'light' && x.fg === 'text' && x.bg === 'hover@surface');
    assert.ok(row, 'text on a hovered row is not measured');
    assert.ok(row.ratio < 21 && row.ratio > 4.5);
  });

  test('is deterministic', () => {
    assert.deepEqual(P.buildProductTokens(system, { name: 'Muddy Paws' }), tokens);
  });

  test('takes the accent as the highlight, the colour the brand keeps for where an eye needs to land', () => {
    assert.equal(P.resolveColour(tokens, 'highlight', 'light').toLowerCase(), system.palettes.accent1.light.steps[8].hex.toLowerCase());
  });

  test('without a signature rail, the rail roles point at the ordinary ones', () => {
    const rail = tokens.color.tokens.find((t) => t.name === 'rail');
    assert.equal(rail.value.light, '{surface}');
  });
});

describe('decided roles', () => {
  test('a decided primary is never moved, and its failure is reported, not fixed', () => {
    const tokens = P.buildProductTokens(system, { roles: { primary: { light: '#FFF389', dark: '#FFF389' } } });
    assert.equal(P.resolveColour(tokens, 'primary', 'light'), '#FFF389');
    const audit = P.auditProductTokens(tokens);
    assert.ok(audit.fails.some((f) => f.fg === 'primary' && f.bg === 'surface' && f.theme === 'light'));
  });

  test('a decided colour may be written short, or for one theme only', () => {
    const tokens = P.buildProductTokens(system, { roles: { ink: { light: '#123' }, canvas: { dark: '#0b1f17' } } });
    assert.equal(P.resolveColour(tokens, 'text', 'light'), '#112233');
    assert.match(P.resolveColour(tokens, 'text', 'dark'), HEX);
    assert.equal(P.resolveColour(tokens, 'canvas', 'dark'), '#0b1f17');
  });

  test('a decided colour that is not a hex value is refused with a reason, not half-built', () => {
    assert.throws(() => P.buildProductTokens(system, { roles: { primary: { light: 'navy' } } }), /must be a hex value/);
  });

  test('a signature rail gets its own text, muted and focus colours, and they pass on it', () => {
    const tokens = P.buildProductTokens(system, { roles: { rail: { light: '#123d2a', dark: '#0b2419' } } });
    const audit = P.auditProductTokens(tokens);
    assert.equal(audit.fails.length, 0);
    for (const n of ['rail-text', 'rail-text-strong', 'rail-muted', 'rail-focus']) {
      assert.ok(audit.rows.some((r) => r.fg === n && r.bg === 'rail'), `${n} is not measured on the rail`);
    }
  });
});

describe('brand fidelity: a decided canvas, ink and labels carry the brand', () => {
  // A navy brand with a pale blue, the shape of brand where generic answers go wrong.
  const navySystem = buildSystem({ primary: '#5B9BFC', accents: ['#FFF389'], accentCount: 1, neutralHue: '#120A3F' });
  const roles = {
    primary: { light: '#120A3F', dark: '#5B9BFC' },
    highlight: { light: '#FFF389', dark: '#FFF389' },
    canvas: { light: '#F5F5F5', dark: '#120A3F' },
    ink: { light: '#120A3F', dark: '#D7E5FD' },
  };
  const tokens = P.buildProductTokens(navySystem, { roles });
  const hue = (n, m) => toOklch(P.resolveColour(tokens, n, m)).h;
  const near = (a, b, tol = 20) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b)) < tol;

  test('passes its audit with the brand decisions in place', () => {
    assert.equal(P.auditProductTokens(tokens).fails.length, 0);
  });

  test('surfaces on a decided dark canvas take its hue, rather than sitting grey on a coloured ground', () => {
    for (const s of ['surface', 'surface-subtle', 'surface-raised']) assert.ok(near(hue(s, 'dark'), hue('canvas', 'dark')), `${s} drifted off the canvas hue`);
  });

  test('the ink is the text, and the quieter text roles keep its hue', () => {
    assert.equal(P.resolveColour(tokens, 'text', 'light'), '#120A3F');
    for (const n of ['text-muted', 'text-subtle']) assert.ok(near(hue(n, 'light'), hue('text', 'light'), 30), `${n} lost the ink's hue`);
  });

  test('labels prefer the brand\'s own ink wherever it passes', () => {
    assert.equal(P.resolveColour(tokens, 'on-highlight', 'light'), '#120A3F');
    assert.equal(P.resolveColour(tokens, 'on-primary', 'dark'), '#120A3F');
    assert.equal(P.resolveColour(tokens, 'on-primary', 'light').toLowerCase(), '#ffffff');
  });

  test('the brand\'s accent takes a chart slot next to the brand colour, darkened until it clears 3:1', () => {
    const s2 = P.resolveColour(tokens, 'series-2', 'light');
    assert.ok(near(toOklch(s2).h, toOklch('#FFF389').h, 25), `series-2 is ${s2}, not the accent's hue`);
    assert.ok(contrastRatio(s2, P.resolveColour(tokens, 'surface', 'light')) >= 3);
  });
});

describe('the audit holds across the colour space', () => {
  // Ten hues, two lightnesses, two chromas: brand colours from near-black to
  // pale, muted to loud. Every derived role has to pass on every one of them.
  for (const h of [0, 27, 55, 78, 110, 148, 190, 245, 280, 320]) {
    test(`brand hue ${h}`, () => {
      for (const L of [0.3, 0.8]) {
        for (const C of [0.05, 0.15]) {
          const primary = oklchToHex(gamutMapOklch({ L, C, h }));
          const audit = P.auditProductTokens(P.buildProductTokens(buildSystem({ primary, accentCount: 1 })));
          assert.equal(audit.fails.length, 0, `${primary}: ${audit.fails.map((f) => `${f.theme} ${f.fg} on ${f.bg} ${f.ratio}`).join('; ')}`);
          assert.equal(audit.notes.length, 0, `${primary}: ${audit.notes.join(' ')}`);
        }
      }
    });
  }
});

describe('the audit warns where a pair list cannot', () => {
  test('a red brand is told its primary and danger look alike', () => {
    const audit = P.auditProductTokens(P.buildProductTokens(buildSystem({ primary: '#D62828' })));
    assert.ok(audit.warnings.some((w) => w.area === 'status'));
  });

  test('a highlight that looks like the warning colour is called out, and a distinct one is not', () => {
    const warning = P.resolveColour(P.buildProductTokens(system), 'warning-solid', 'light');
    const same = P.auditProductTokens(P.buildProductTokens(system, { roles: { highlight: { light: warning, dark: warning } } }));
    assert.ok(same.warnings.some((w) => w.area === 'highlight'), 'a highlight identical to the warning colour went unremarked');
    const distinct = P.auditProductTokens(P.buildProductTokens(system, { roles: { highlight: { light: '#7FD1F4', dark: '#7FD1F4' } } }));
    assert.equal(distinct.warnings.some((w) => w.area === 'highlight'), false);
  });
});

describe('toProductCss and the shape the generators read', () => {
  const tokens = P.buildProductTokens(system, { name: 'Muddy Paws' });
  const css = P.toProductCss(tokens);

  test('writes both themes, the static values and a class per type style', () => {
    assert.match(css, /:root, \[data-theme="light"\] \{/);
    assert.match(css, /\[data-theme="dark"\] \{/);
    assert.match(css, /--space-0\\\.5: 2px;/);
    assert.match(css, /--rail: var\(--surface\);/);
    assert.match(css, /\.eyebrow \{[^}]*text-transform: uppercase/);
    assert.match(css, /\.kpi \{[^}]*tabular-nums/);
    assert.equal(/undefined|NaN/.test(css), false);
  });

  test('has the fields the globals and docs generators read', () => {
    for (const t of tokens.color.tokens) {
      assert.ok(t.value.light && t.value.dark, `${t.name} lacks a theme`);
      assert.ok(Array.isArray(t.contrast), `${t.name} has no contrast list`);
    }
    for (const fam of ['spacing', 'radius', 'size', 'zIndex', 'duration', 'easing', 'breakpoint', 'opacity']) {
      for (const t of tokens[fam].tokens) assert.ok(t.name && t.value, `${fam} token without a name or value`);
    }
    for (const t of tokens.shadow.tokens) assert.ok(t.value.light && t.value.dark);
    for (const g of tokens.type.groups) for (const s of g.styles) assert.ok(s.fontSize && s.lineHeight && s.name);
    assert.match(tokens.type.families.sans, /^Karla, /);
  });

  test('says where the display face goes, or that it does not', () => {
    const plain = P.buildProductTokens(system, { displayForTitles: false });
    assert.equal(plain.type.groups[0].family, 'sans');
    assert.equal(plain.type.groups[0].styles[0].fontWeight, 700);
  });
});

describe('an audit of a tokens file it did not write', () => {
  test('a pair naming a role the file does not define is a reported failure, and every other pair is still measured', () => {
    const t = P.buildProductTokens(buildSystem({ primary: '#1F6F4A', type: { display: 'Bitter', body: 'Karla' } }), { name: 'Acme' });
    const full = P.auditProductTokens(t).pairs;
    t.color.tokens = t.color.tokens.filter((x) => x.name !== 'tag-grey');
    const audit = P.auditProductTokens(t);
    const missing = audit.fails.filter((f) => /unknown colour token: tag-grey/.test(f.problem ?? ''));
    assert.ok(missing.length > 0, 'the dangling pair is reported');
    assert.equal(audit.ok, false);
    assert.ok(audit.pairs >= full - missing.length - 20, 'the rest are still measured');
  });
});
