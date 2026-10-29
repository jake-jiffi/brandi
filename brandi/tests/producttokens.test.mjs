import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as P from '../scripts/producttokens.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { toStarterGlobals } from '../scripts/productglobals.mjs';
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

describe("stateOf: one fill's states all move the same way, each further than the last", () => {
  // A dark navy-like fill, a mid fill, a cream and a near-white: a dark fill whose hover went darker while
  // its press, needing more, flipped lighter read as two different buttons.
  for (const [fill, label] of [['#101436', '#ffffff'], ['#1A1A2E', '#ffffff'], ['#2F4F8F', '#ffffff'], ['#E8E4D8', '#111111'], ['#F5F5F5', '#111111'], ['#FFD23F', '#111111']]) {
    test(`${fill} with a ${label} label`, () => {
      const hover = P.stateOf(fill, label, 0.05, P.STEP.hover);
      const pressed = P.stateOf(fill, label, 0.09, P.STEP.pressed);
      const selected = P.stateOf(fill, label, 0.1, P.STEP.selected);
      const side = (hex) => Math.sign(toOklch(hex).L - toOklch(fill).L);
      assert.equal(new Set([side(hover), side(pressed), side(selected)]).size, 1, `hover ${hover}, pressed ${pressed} and selected ${selected} sit on one side of ${fill}`);
      assert.notEqual(side(hover), 0, 'and off the fill');
      assert.ok(contrastRatio(pressed, fill) > contrastRatio(hover, fill), `pressed ${pressed} (${contrastRatio(pressed, fill).toFixed(2)}) goes further than hover ${hover} (${contrastRatio(hover, fill).toFixed(2)})`);
      assert.ok(contrastRatio(selected, fill) >= contrastRatio(pressed, fill), 'and selected at least as far as pressed');
      assert.ok(contrastRatio(selected, fill) >= P.STEP.selected, 'the deepest step is reached');
      assert.equal(P.stateDirection(fill, label), side(hover), 'the direction is decided once for the fill');
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

describe('states the eye can see, from any base', () => {
  test('a pure black rail and primary still get a hover, a selected row, a hairline and a press', () => {
    // Black is the primary in light only: on a dark page a black button would not stand off it.
    const tokens = P.buildProductTokens(system, { roles: { rail: { light: '#000000', dark: '#000000' }, primary: { light: '#000000' } } });
    const at = (n, m) => P.resolveColour(tokens, n, m);
    for (const m of ['light', 'dark']) {
      // A fixed step of lightness from black came out #000000 to #030303: no visible state at all.
      assert.ok(contrastRatio(at('rail-hover', m), at('rail', m)) >= P.STEP.hover, `${m} rail hover`);
      assert.ok(contrastRatio(at('rail-selected', m), at('rail', m)) >= P.STEP.selected, `${m} rail selected`);
      assert.ok(contrastRatio(at('rail-line', m), at('rail', m)) >= P.STEP.line, `${m} rail line`);
    }
    assert.equal(at('primary', 'light').toLowerCase(), '#000000');
    assert.ok(contrastRatio(at('primary-hover', 'light'), '#000000') >= P.STEP.hover, 'black primary hover');
    assert.ok(contrastRatio(at('primary-pressed', 'light'), '#000000') >= P.STEP.pressed, 'black primary pressed');
    const audit = P.auditProductTokens(tokens);
    assert.ok(audit.rows.some((r) => r.fg === 'rail-selected' && r.bg === 'rail' && r.kind === 'step'), 'the audit measures the step');
    assert.equal(audit.fails.length, 0, JSON.stringify(audit.fails));
  });
});

describe('brand rules the tokens keep', () => {
  test('a colour the brand bars from dark grounds takes no chart series there, nor does its hue', () => {
    const accented = buildSystem({ primary: '#1F6F4A', accents: ['#D63384'], type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' } });
    const series = (t, m) => Array.from({ length: 6 }, (_, i) => P.resolveColour(t, `series-${i + 1}`, m));
    const near = (hex) => Math.min(Math.abs(toOklch(hex).h - toOklch('#D63384').h), 360 - Math.abs(toOklch(hex).h - toOklch('#D63384').h)) < 25;
    const free = P.buildProductTokens(accented, {});
    assert.ok(series(free, 'dark').some(near), 'without the rule the accent is a dark series');
    const kept = P.buildProductTokens(accented, { charts: { avoid: { dark: ['#D63384'] } } });
    assert.equal(series(kept, 'dark').some(near), false, `no dark series in its hue: ${series(kept, 'dark').join(', ')}`);
    assert.ok(series(kept, 'light').some(near), 'light keeps it');
    assert.equal(new Set(series(kept, 'dark').map((h) => h.toUpperCase())).size, 6, 'six distinct series still');
    assert.equal(P.auditProductTokens(kept).fails.length, 0);
  });

  test("a tag on a barred hue is kept out of a name's hash in both themes, because a person cannot choose their name", () => {
    const accented = buildSystem({ primary: '#1F6F4A', accents: ['#D63384'], type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' } });
    const gap = (a, b) => { const d = Math.abs(toOklch(a).h - toOklch(b).h); return Math.min(d, 360 - d); };
    const kept = P.buildProductTokens(accented, { charts: { avoid: { dark: ['#D63384'] } } });
    const lightNear = Array.from({ length: 6 }, (_, i) => i + 1).filter((n) => gap(P.resolveColour(kept, `series-${n}`, 'light'), '#D63384') < 25).map((n) => `tag-${n}`);
    assert.ok(lightNear.length > 0, 'light keeps a series on the barred hue');
    assert.deepEqual(kept.meta.avoidTags, lightNear, 'its tag is left out of the draw, though only dark bars the hue');
    assert.deepEqual(P.buildProductTokens(accented, {}).meta.avoidTags, [], 'with nothing barred, every tag is in the draw');
  });

  test('a display face set only in capitals takes them in the title styles, and nowhere else', () => {
    const caps = P.buildProductTokens(system, { displayCase: 'upper' });
    const styles = caps.type.groups.flatMap((g) => g.styles);
    for (const n of ['hero', 'display', 'title']) assert.equal(styles.find((s) => s.name === n).textTransform, 'uppercase', n);
    assert.equal(styles.find((s) => s.name === 'heading').textTransform, undefined, 'headings keep the body face as it is');
    assert.equal(P.buildProductTokens(system, {}).type.groups.flatMap((g) => g.styles).find((s) => s.name === 'title').textTransform, undefined);
    assert.match(toStarterGlobals(caps), /@utility type-title \{[^}]*text-transform: uppercase;/, 'the starter sets it');
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

describe('chart series', () => {
  test('six series are six colours in both themes, whatever the brand hue', () => {
    // Dark once drew series-6 in series-1's colour: its colour-vision-safe palette ran out of hues and wrapped.
    for (const h of [0, 27, 55, 78, 110, 148, 190, 245, 280, 320]) {
      for (const L of [0.3, 0.8]) {
        const primary = oklchToHex(gamutMapOklch({ L, C: 0.15, h }));
        const tokens = P.buildProductTokens(buildSystem({ primary, accentCount: 1 }));
        for (const theme of ['light', 'dark']) {
          const series = tokens.color.tokens.filter((t) => /^series-/.test(t.name)).map((t) => t.value[theme].toUpperCase());
          assert.equal(series.length, 6);
          assert.equal(new Set(series).size, 6, `${primary} ${theme}: ${series.join(' ')}`);
        }
      }
    }
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

describe('faces the system ships as files', () => {
  test('product.json can list them, and a bad entry is refused with the reason', () => {
    const system = buildSystem({ primary: '#1F6F4A', type: { display: 'Bitter', body: 'Karla' } });
    const fonts = [{ family: 'Karla', file: 'fonts/Karla-Variable.woff2', weight: '300 800', style: 'normal' }, { family: 'Bitter', file: 'fonts/Bitter-Book.otf', weight: 400 }];
    const t = P.buildProductTokens(system, { fonts });
    assert.deepEqual(t.type.fonts, [{ family: 'Karla', file: 'fonts/Karla-Variable.woff2', weight: '300 800', style: 'normal' }, { family: 'Bitter', file: 'fonts/Bitter-Book.otf', weight: '400', style: 'normal' }]);
    assert.match(P.toProductCss(t), /@font-face \{ font-family: "Karla"; src: url\("fonts\/Karla-Variable\.woff2"\)/);
    for (const bad of [{ family: '"Karla"', file: 'fonts/a.woff2' }, { family: 'Karla', file: '../a.woff2' }, { family: 'Karla', file: 'fonts/a.exe' }, { family: 'Karla', file: 'fonts/a.woff2', weight: 'bold' }, { family: 'Karla', file: 'fonts/a.woff2', style: 'slanted' }]) {
      assert.throws(() => P.buildProductTokens(system, { fonts: [bad] }), TypeError, JSON.stringify(bad));
    }
    assert.deepEqual(P.buildProductTokens(system).type.fonts, []);
  });
});


describe('the shape of what a person can press', () => {
  test('a pill by default, the control radius or a value of its own when the brand says so', () => {
    const system = buildSystem({ primary: '#1F6F4A', accentCount: 1 });
    const radius = (shape) => Object.fromEntries(P.buildProductTokens(system, { shape }).radius.tokens.map((t) => [t.name, t.value]));
    assert.equal(radius(undefined)['radius-action'], '9999px', 'if it is a pill, you can press it');
    const control = radius({ action: 'control' });
    assert.equal(control['radius-action'], control['radius-control'], 'buttons that match the inputs');
    assert.equal(radius({ action: '6px' })['radius-action'], '6px');
  });
});

describe("the brand's measured shapes", () => {
  const system = buildSystem({ primary: '#1F6F4A', accentCount: 1 });
  const build = (shape) => P.buildProductTokens(system, { shape });
  const byName = (t) => Object.fromEntries(t.radius.tokens.map((x) => [x.name, x]));
  const sized = (t) => Object.fromEntries(t.size.tokens.map((x) => [x.name, x.value]));
  const measured = {
    action: 'control',
    families: { press: { px: 6, source: "the site's buttons" }, card: { px: 16, source: 'the cards on p11' }, frame: { px: 0, source: 'the photos on p48' } },
  };

  test('a measured family sets its role with its source, and nothing derived goes rounder than the largest measured radius', () => {
    const r = byName(build(measured));
    assert.equal(r['radius-action'].value, '6px');
    assert.match(r['radius-action'].source, /site/);
    assert.equal(r['radius-control'].value, '6px', 'buttons that match the inputs: the inputs take the measured press');
    assert.equal(r['radius-md'].value, '16px');
    assert.equal(r['radius-frame'].value, '0px');
    assert.ok(parseFloat(r['radius-lg'].value) <= 16, 'a pane is never rounder than a card');
    assert.match(r['radius-lg'].derived, /scale/, 'and says how the kit got it');
    assert.ok(parseFloat(r['radius-sm'].value) <= 6, 'a badge is never rounder than a control');
    for (const x of Object.values(r)) if (x.name !== 'radius-pill') assert.ok(parseFloat(x.value) <= 16, `${x.name} is ${x.value}`);
    // Measured nothing, nothing is held: a pane takes the scale's xl step, no rounder than its card.
    const xl = Math.round(system.radius.find((s) => s.name === 'xl').px);
    const lg = Math.round(system.radius.find((s) => s.name === 'lg').px);
    assert.equal(byName(build({}))['radius-lg'].value, `${Math.min(xl, lg)}px`);
  });

  test("the shell's form: the rail meets the window edge, square, unless the brand draws floating panels", () => {
    const edge = build(measured);
    assert.equal(byName(edge)['radius-rail'].value, '0px');
    assert.equal(sized(edge)['shell-inset'], '0px');
    assert.equal(sized(edge)['rail-outline'], '0px');
    // Transparent, not none: Tailwind lists the rail's shadow with the ring shadows, where none is not a shadow.
    assert.deepEqual(edge.shadow.tokens.find((s) => s.name === 'shadow-rail').value, { light: '0 0 #0000', dark: '0 0 #0000' });
    const floating = build({ ...measured, shell: { form: 'floating', source: "the brand's own app" } });
    assert.equal(byName(floating)['radius-rail'].value, byName(floating)['radius-lg'].value, 'a floating rail takes the pane radius');
    assert.equal(sized(floating)['shell-inset'], '8px');
    assert.equal(sized(floating)['rail-outline'], '1px');
    assert.deepEqual(floating.shadow.tokens.find((s) => s.name === 'shadow-rail').value, floating.shadow.tokens.find((s) => s.name === 'shadow-xs').value);
    assert.match(P.toProductCss(edge), /--shell-inset: 0px;/);
  });

  test("every choice nobody measured is listed as the kit's, and so are a shell and a shape move the brand never named", () => {
    const bare = P.shapeKitDefaults(build({})).map((d) => d.choice);
    for (const c of ['radius-action', 'radius-control', 'radius-md', 'radius-lg', 'radius-frame', 'radius-rail', 'shell', 'moves']) assert.ok(bare.includes(c), `${c} in ${bare}`);
    const full = P.shapeKitDefaults(build({
      ...measured,
      families: { ...measured.families, pane: { px: 12, source: 'the panels on p20' } },
      shell: { form: 'edge', source: "the site's nav bar" },
      moves: [{ name: 'The paper ground', source: 'every page of the guidelines', where: ['the website hero'] }],
    })).map((d) => d.choice);
    for (const c of ['radius-action', 'radius-control', 'radius-md', 'radius-lg', 'radius-frame', 'radius-rail', 'shell', 'moves']) assert.ok(!full.includes(c), `${c} still listed: ${full}`);
    assert.ok(P.shapeKitDefaults(build({})).every((d) => d.how), 'each says how the kit chose it');
  });

  test("the rail's edge shows against the page: its own line on a light canvas, the page's hairline where rail and canvas sit close", () => {
    const sys = buildSystem({ primary: '#1F6F4A', accentCount: 1 });
    // Near-neighbour colours: a pilot's exact values stay out of the public repo.
    const t = P.buildProductTokens(sys, { roles: { rail: { light: '#050505', dark: '#050505' }, canvas: { light: '#F2F2F2', dark: '#141414' } } });
    const role = (name, theme) => P.resolveColour(t, name, theme);
    assert.equal(role('rail-edge', 'light'), role('rail-line', 'light'), 'a black rail on a light canvas: its own line');
    assert.equal(role('rail-edge', 'dark'), role('line', 'dark'), 'on a near-black canvas: the page hairline');
    assert.ok(contrastRatio(role('rail-edge', 'dark'), '#141414') > 1.2 && contrastRatio(role('rail-edge', 'dark'), '#050505') > 1.2, 'which shows against both');
  });

  test('a square photo holds nothing else: frames are left out of the largest measured radius', () => {
    const r = byName(build({ families: { frame: { px: 0, source: 'every photo is square' } } }));
    assert.equal(r['radius-frame'].value, '0px');
    assert.equal(r['radius-md'].value, byName(build({}))['radius-md'].value, 'cards still come from the scale');
  });

  test('a tokens file written before shapes carried a source lists every radius as the kit\'s', () => {
    const old = { radius: { tokens: [{ name: 'radius-control', value: '10px' }, { name: 'radius-pill', value: '9999px' }] } };
    const listed = P.shapeKitDefaults(old);
    assert.deepEqual(listed.map((d) => d.choice), ['radius-control', 'shell', 'moves'], 'the pill is the kit\'s rule, not a brand choice');
    assert.match(listed[0].how, /no source/);
  });

  test('a family is refused without a source, outside the families, or a shell outside its two forms', () => {
    for (const bad of [{ families: { card: { px: 12 } } }, { families: { corner: { px: 4, source: 'x' } } }, { families: { card: { px: 'pill', source: 'x' } } }, { shell: { form: 'round', source: 'x' } }, { shell: { form: 'edge' } }, { moves: [{ name: 'Paper' }] }]) {
      assert.throws(() => build(bad), TypeError, JSON.stringify(bad));
    }
    assert.equal(byName(build({ families: { press: { px: 'pill', source: 'the chips on p9' } } }))['radius-action'].value, '9999px');
  });
});

describe('the faces a system ships as files', () => {
  test('each @font-face names the format its file is in', () => {
    const tokens = P.buildProductTokens(buildSystem({ primary: '#1F6F4A', accentCount: 1 }), {
      fonts: [{ family: 'Brand Sans', file: 'fonts/BrandSans.woff2', weight: '400 700', style: 'normal' }, { family: 'Brand Display', file: 'fonts/BrandDisplay.otf', weight: '400', style: 'normal' }],
    });
    const css = P.toProductCss(tokens);
    assert.match(css, /url\("fonts\/BrandSans\.woff2"\) format\("woff2"\)/);
    assert.match(css, /url\("fonts\/BrandDisplay\.otf"\) format\("opentype"\)/, 'an OTF declared as woff2 is skipped by a strict browser');
  });
});
