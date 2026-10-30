import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import * as P from '../scripts/producttokens.mjs';
import { shapeBoard } from '../scripts/productboards.mjs';
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

  test("the brand's named colours may be a list of { name, hex } or a { name: hex } map, and nothing else", () => {
    const brandValues = (t) => t.color.tokens.filter((x) => x.brand).map((x) => [x.name, x.value.light]);
    const list = P.buildProductTokens(system, { brandColours: [{ name: 'acme-green', hex: '#5CBF1B' }, { name: 'acme-ink', hex: '#123' }] });
    const map = P.buildProductTokens(system, { brandColours: { 'acme-green': '#5CBF1B', 'acme-ink': '#123' } });
    assert.deepEqual(brandValues(list), [['brand-acme-green', '#5cbf1b'], ['brand-acme-ink', '#112233']]);
    assert.deepEqual(brandValues(map), brandValues(list), 'a map reads the same as the list');
    assert.throws(() => P.buildProductTokens(system, { brandColours: '#5CBF1B' }), /brandColours is a list of \{ name, hex \} or a \{ name: hex \} map/);
    assert.throws(() => P.buildProductTokens(system, { brandColours: [{ hex: '#5CBF1B' }] }), /brandColours/);
    assert.throws(() => P.buildProductTokens(system, { brandColours: { 'acme-green': null } }), /each with a name and a hex value/);
  });

  test("a root role given one value takes it in both themes, as a direction's role does, and is measured in both", () => {
    // A run wrote roles.rail as a plain hex, the form a direction takes, and the rail stayed the surface with no word.
    const one = P.buildProductTokens(system, { roles: { rail: '#1B5D40' } });
    assert.deepEqual(one, P.buildProductTokens(system, { roles: { rail: { light: '#1B5D40', dark: '#1B5D40' } } }), 'one value is both themes');
    for (const theme of ['light', 'dark']) assert.equal(P.resolveColour(one, 'rail', theme), '#1B5D40', theme);
    assert.deepEqual(one.meta.roles.rail, { light: '#1B5D40', dark: '#1B5D40' });
    const rows = P.auditProductTokens(one).rows.filter((r) => r.fg === 'rail-text' && r.bg === 'rail');
    assert.deepEqual(rows.map((r) => r.theme), ['light', 'dark'], "the rail's words are measured on it in both themes");
    // A brand colour by name, with or without brand-, as a direction takes it.
    const named = P.buildProductTokens(system, { brandColours: { 'acme-green': '#1B5D40' }, roles: { rail: 'brand-acme-green' } });
    assert.equal(P.resolveColour(named, 'rail', 'dark'), '#1b5d40');
  });

  test("a root role's one value fails loudly in the theme it cannot serve", () => {
    // A mid green as the primary in both themes: right in light, too dark to stand off the dark canvas.
    const audit = P.auditProductTokens(P.buildProductTokens(system, { roles: { primary: '#1F6E4A' } }));
    assert.equal(audit.ok, false);
    assert.ok(audit.fails.some((f) => f.theme === 'dark' && f.fg === 'primary'), JSON.stringify(audit.fails));
    assert.equal(audit.fails.some((f) => f.theme === 'light' && f.fg === 'primary'), false, 'and passes where it can');
  });

  test('an unknown role, or a value in a form the engine cannot read, is refused with its reason, never dropped', () => {
    const build = (roles) => () => P.buildProductTokens(system, { roles });
    assert.throws(build({ rial: '#123456' }), /roles\.rial is not a role product\.json decides: it decides primary, brand, highlight, canvas, ink, focus, rail/);
    assert.throws(build({ rial: null }), /roles\.rial is not a role/, 'a misspelt key is named even with nothing in it');
    assert.throws(build({ 'rail-text': { light: '#ffffff' } }), /roles\.rail-text is not a role product\.json decides/, 'a solved role is not decided here');
    assert.throws(build({ rail: { day: '#123456' } }), /roles\.rail is a colour or \{ light, dark \}: day is neither/);
    assert.throws(build({ rail: {} }), /roles\.rail is \{ light, dark \} with neither set/);
    assert.throws(build({ rail: 'acme-teal' }), /roles\.rail: a decided colour must be a hex value like #0F2A4A or one of the brand's colours \(primary, accent-1\), not "acme-teal"/);
    assert.throws(build({ rail: 12 }), /roles\.rail: a decided colour must be a hex value/);
    assert.throws(build({ rail: ['#123456'] }), /roles\.rail: a decided colour must be a hex value/);
    assert.equal(P.resolveColour(P.buildProductTokens(system, { roles: { rail: null } }), 'rail', 'light'), P.resolveColour(P.buildProductTokens(system), 'surface', 'light'), 'null leaves a role undecided');
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

describe("a coloured rail's quiet text", () => {
  // The detector's own test: grey ink is HSL saturation under 0.2 between 20% and 85% lightness, and a ground is a
  // colour when its channels spread 40 or more of 255. An emerald rail's group labels came out grey on it 52 times.
  const hsl = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const hi = Math.max(r, g, b), lo = Math.min(r, g, b), l = (hi + lo) / 2, d = hi - lo;
    return { l, s: d <= 0 || l <= 0 || l >= 1 ? 0 : d / (1 - Math.abs(2 * l - 1)) };
  };
  const readsGrey = (hex) => { const { l, s } = hsl(hex); return s < 0.2 && l > 0.2 && l < 0.85; };
  const hueGap = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

  test('on a chromatic rail, rail-text and rail-muted are tints of its own hue, never grey, and keep their floors', () => {
    // Near neighbours of real rails: an emerald, a navy, a plum, a maroon, a light yellow rail with dark words, and
    // a deep teal and a pale lavender, where the rail's own chroma alone still solved to a grey.
    for (const railHex of ['#124835', '#102B4B', '#5C2B87', '#7B202C', '#F3CA4D', '#012A23', '#E4D6FF']) {
      const tokens = P.buildProductTokens(system, { roles: { rail: { light: railHex, dark: railHex } } });
      const audit = P.auditProductTokens(tokens);
      for (const theme of ['light', 'dark']) {
        const at = (n) => P.resolveColour(tokens, n, theme);
        const muted = at('rail-muted');
        assert.equal(readsGrey(muted), false, `${railHex} ${theme}: rail-muted ${muted} reads grey on the rail`);
        assert.equal(readsGrey(at('rail-text')), false, `${railHex} ${theme}: rail-text ${at('rail-text')} reads grey on the rail`);
        assert.ok(hueGap(toOklch(muted).h, toOklch(railHex).h) < 20, `${railHex} ${theme}: rail-muted ${muted} is in the rail's hue`);
        assert.ok(contrastRatio(muted, at('rail')) >= 4.5 && contrastRatio(muted, at('rail-hover')) >= 4.5, `${railHex} ${theme}: rail-muted keeps 4.5:1`);
      }
      assert.deepEqual(audit.fails.filter((f) => f.fg.startsWith('rail')), [], `${railHex}: the rail's pairs all pass`);
    }
  });

  test('a mid-tone rail steps its hovered and selected items away from its words, so the words keep their floor on them', () => {
    // Near neighbours of brand colours runs gave the rail: a mid green, blue, purple and moss under light words, and a
    // sage under dark ones. Stepped lighter under light words, the green's selected item held them at 4.06:1.
    for (const railHex of ['#206E4B', '#2F5E9E', '#6B4C9A', '#3C6E2F', '#7FA88E']) {
      const tokens = P.buildProductTokens(system, { roles: { rail: railHex } });
      const onStates = P.auditProductTokens(tokens).fails.filter((f) => f.fg.startsWith('rail') && ['rail-hover', 'rail-selected'].includes(f.bg));
      assert.deepEqual(onStates.map((f) => `${f.theme} ${f.fg} on ${f.bg}`), [], `${railHex}: the words keep their floor on the hovered and selected items`);
      for (const theme of ['light', 'dark']) {
        const at = (n) => P.resolveColour(tokens, n, theme);
        assert.ok(contrastRatio(at('rail-selected'), at('rail')) >= P.STEP.selected, `${railHex} ${theme}: the selected item still stands apart from the rail`);
      }
    }
  });

  test("a black rail beside a vivid green brand keeps neutral words, in the page text's hue and chroma, above their floors", () => {
    // A near-black rail's words solved to a pale green tint (C 0.04) beside a vivid green brand.
    const green = buildSystem({ primary: '#58C21E', type: { display: 'Bitter', body: 'Karla' } });
    for (const roles of [{ rail: { light: '#0B0B0B', dark: '#0B0B0B' } }, { rail: { light: '#0B0B0B', dark: '#0B0B0B' }, ink: { light: '#050505' } }]) {
      const tokens = P.buildProductTokens(green, { roles });
      for (const theme of ['light', 'dark']) {
        const at = (n) => P.resolveColour(tokens, n, theme);
        const text = toOklch(at('text'));
        for (const role of ['rail-text', 'rail-muted']) {
          const c = toOklch(at(role));
          assert.ok(c.C <= text.C + 0.005, `${theme} ${role} ${at(role)} carries chroma ${c.C.toFixed(3)}, the page text ${text.C.toFixed(3)}`);
          if (text.C > 0.002) assert.ok(hueGap(c.h, text.h) < 20, `${theme} ${role} ${at(role)} is in the page text's hue`);
        }
        assert.ok(contrastRatio(at('rail-text'), at('rail-selected')) >= 7, `${theme} rail-text keeps 7:1 on the selected item`);
        assert.ok(contrastRatio(at('rail-muted'), at('rail-hover')) >= 4.5, `${theme} rail-muted keeps 4.5:1 on a hovered item`);
      }
      assert.deepEqual(P.auditProductTokens(tokens).fails.filter((f) => f.fg.startsWith('rail')), [], "the rail's pairs all pass");
    }
  });

  test('a rail with no colour of its own keeps its quiet text as it was', () => {
    const black = P.buildProductTokens(system, { roles: { rail: { light: '#000000', dark: '#000000' } } });
    const before = P.solveForContrast(P.mix('#000000', P.resolveColour(black, 'rail-text', 'light'), 0.55), ['#000000', P.resolveColour(black, 'rail-hover', 'light')], 4.5, { mode: 'floor' }).hex;
    assert.equal(P.resolveColour(black, 'rail-muted', 'light'), before, 'a black rail still mixes its muted text from its text');
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
    // A series keeps its hue in both themes, so a hue barred from one theme's grounds leaves the chart in both:
    // kept in light, its slot would have to change colour at night.
    assert.equal(series(kept, 'light').some(near), false, `nor a light one: ${series(kept, 'light').join(', ')}`);
    assert.equal(new Set(series(kept, 'dark').map((h) => h.toUpperCase())).size, 6, 'six distinct series still');
    assert.equal(P.auditProductTokens(kept).fails.length, 0);
  });

  test("a tag on a barred hue is kept out of a name's hash in both themes, because a person cannot choose their name", () => {
    const accented = buildSystem({ primary: '#1F6F4A', accents: ['#D63384'], type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' } });
    const gap = (a, b) => { const d = Math.abs(toOklch(a).h - toOklch(b).h); return Math.min(d, 360 - d); };
    const kept = P.buildProductTokens(accented, { charts: { avoid: { dark: ['#D63384'] } } });
    // Barred from dark only, the hue leaves the series in both themes, so no tag either theme draws sits on it.
    const tags = (m) => Array.from({ length: 6 }, (_, i) => P.resolveColour(kept, `tag-${i + 1}`, m));
    for (const m of ['light', 'dark']) assert.equal(tags(m).some((t) => gap(t, '#D63384') < 25), false, `no ${m} tag on the barred hue: ${tags(m).join(', ')}`);
    const onIt = Array.from({ length: 6 }, (_, i) => i + 1).filter((n) => ['light', 'dark'].some((m) => gap(P.resolveColour(kept, `series-${n}`, m), '#D63384') < 25)).map((n) => `tag-${n}`);
    assert.deepEqual(kept.meta.avoidTags, onIt, 'any tag whose series still sits on the hue is left out of the draw');
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

  test("each series keeps its hue in both themes, and none sits on the assistant's violet", () => {
    // Each theme once chose its own hues: series-3 was an ochre in light and a teal in dark, so a legend meant a
    // different colour at night, and a series sat on the ai violet, where a chart line read as the assistant's.
    const gap = (a, b) => { const d = Math.abs(toOklch(a).h - toOklch(b).h); return Math.min(d, 360 - d); };
    const cases = [
      ['the fixture', system, {}],
      ['the fixture, its accent barred from both themes', system, { charts: { avoid: { light: ['#D4823A'], dark: ['#D4823A'] } } }],
      ['a blue', buildSystem({ primary: '#2563EB', accentCount: 1 }), {}],
      ['a red', buildSystem({ primary: '#C2410C', accentCount: 1 }), {}],
      ['a violet, on the assistant\'s own hue', buildSystem({ primary: '#7C3AED', accentCount: 1 }), {}],
    ];
    for (const [label, sys, opts] of cases) {
      const tokens = P.buildProductTokens(sys, opts);
      const at = (n, m) => P.resolveColour(tokens, n, m);
      const row = (m) => Array.from({ length: 6 }, (_, i) => at(`series-${i + 1}`, m)).join(' ');
      for (let n = 1; n <= 6; n += 1) {
        const s = `series-${n}`;
        assert.ok(gap(at(s, 'light'), at(s, 'dark')) < 10, `${label}: ${s} is ${at(s, 'light')} in light and ${at(s, 'dark')} in dark\n light ${row('light')}\n dark  ${row('dark')}`);
        for (const m of ['light', 'dark']) {
          for (const ai of ['ai', 'ai-solid']) assert.ok(gap(at(s, m), at(ai, m)) >= 25, `${label}: ${m} ${s} ${at(s, m)} sits on ${ai} ${at(ai, m)}`);
        }
      }
      assert.equal(P.auditProductTokens(tokens).fails.length, 0, label);
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

describe('directions: a role a concept board moves, solved and carried as a class', () => {
  // Near neighbours of a run that drew its rail three ways: black, the brand's vivid green, and an emerald.
  const green = buildSystem({ primary: '#58C21E', type: { display: 'Bitter', body: 'Karla' } });
  const brandColours = { 'acme-green': '#58C21E', 'acme-black': '#0B0B0B', 'acme-emerald': '#134A36' };
  const base = { brandColours, roles: { rail: { light: '#0B0B0B', dark: '#0B0B0B' } } };
  const directions = [
    { name: 'A', roles: { rail: 'acme-black' }, note: 'The black rail.' },
    { name: 'B', roles: { rail: 'brand-acme-green' }, note: 'The green rail.' },
    { name: 'Emerald rail', roles: { rail: { light: '#134A36', dark: 'acme-emerald' } } },
  ];
  const tokens = P.buildProductTokens(green, { ...base, directions });
  const dir = (name, t = tokens) => t.meta.directions.find((d) => d.name === name);
  const blockOf = (css, selector) => css.slice(css.indexOf(`${selector} {`), css.indexOf('}', css.indexOf(`${selector} {`)) + 1);

  test("a concept that left a role undecided keeps its look after the pick, by naming that role null", () => {
    // A run picked a green rail over today's quiet one, and today's concept board could only keep its quiet rail by
    // typing the surface's hexes into a direction. Null is the role as it was before the pick: the kit's own.
    const picked = P.buildProductTokens(green, { brandColours, roles: { rail: 'acme-green' }, directions: [{ name: 'Quiet rail', roles: { rail: null } }] });
    const quiet = picked.meta.directions[0];
    const before = P.buildProductTokens(green, { brandColours });
    for (const m of ['light', 'dark']) {
      assert.equal(P.resolveColour({ ...picked, color: { tokens: picked.color.tokens.map((t) => (quiet[m][t.name] !== undefined ? { ...t, value: { ...t.value, [m]: quiet[m][t.name] } } : t)) } }, 'rail', m), P.resolveColour(before, 'rail', m), `${m}: the quiet concept's rail is the rail before the pick`);
    }
    assert.match(P.toProductCss(picked), /\.direction-quiet-rail \{[^}]*--rail: var\(--surface\)/, 'drawn by the class, as the surface it was');
    // Audited as the rail it draws: undecided, so held to the undecided rail's pairs, not the decided one's 7:1 and steps.
    assert.deepEqual(P.auditProductTokens(picked).fails.map((f) => `${f.theme} ${f.fg} on ${f.bg} (${f.direction})`), [], 'the quiet concept passes its audit');
    assert.throws(() => P.buildProductTokens(green, { brandColours, directions: [{ name: 'Q', roles: { rail: undefined } }] }), /names at least one role/, 'an undefined role is no role');
  });

  test('each is the system with its roles over the decided ones, and only what differs is kept, where the page does not read', () => {
    const b = dir('B');
    assert.equal(b.class, 'direction-b');
    assert.equal(b.note, 'The green rail.');
    assert.deepEqual(b.roles, { rail: { light: '#58c21e', dark: '#58c21e' } }, 'a brand colour named, with or without brand-');
    const solved = P.buildProductTokens(green, { ...base, roles: { rail: { light: '#58C21E', dark: '#58C21E' } } });
    for (const t of tokens.color.tokens) {
      // Kept in both themes when it moves in either: a light-only value left out of the dark rule would show at night.
      const seen = (set, theme) => P.resolveColour(set, t.name, theme).toLowerCase();
      const moved = ['light', 'dark'].some((theme) => seen(solved, theme) !== seen(tokens, theme));
      for (const theme of ['light', 'dark']) {
        assert.equal(t.name in b[theme], moved, `${theme} ${t.name}: kept only when the direction moves it`);
        if (moved) assert.equal(b[theme][t.name].toLowerCase(), solved.color.tokens.find((s) => s.name === t.name).value[theme].toLowerCase());
      }
    }
    assert.ok('rail-text' in b.light && !('surface' in b.light), 'the rail and its words move, the page does not');
    assert.deepEqual(dir('A').light, {}, "a direction that is today's system holds nothing");
    assert.deepEqual(dir('Emerald rail').roles, { rail: { light: '#134a36', dark: '#134a36' } });
    assert.equal(dir('Emerald rail').class, 'direction-emerald-rail');
    // The Design System page reads every family but type as a { tokens: [...] } list; directions sit in meta, which it does not read.
    for (const [key, family] of Object.entries(tokens)) {
      if (family && typeof family === 'object' && !['meta', 'type'].includes(key)) assert.ok(Array.isArray(family.tokens), `${key} is a list of tokens`);
    }
  });

  test("tokens.css draws each with a class, light and dark, and the rail's logo follows the rail it sets", () => {
    const css = P.toProductCss(tokens);
    const light = blockOf(css, '.direction-b');
    assert.match(light, /--rail: #58c21e;/i);
    assert.match(light, /--rail-text: #[0-9a-f]{6};/i);
    assert.doesNotMatch(light, /--surface:/, 'nothing the direction leaves alone');
    // The black rail takes the mark drawn for dark grounds; the green rail with dark words, the one for light grounds.
    assert.match(blockOf(css, ':root, [data-theme="light"]'), /--rail-mark-on-light: none;\n {2}--rail-mark-on-dark: flex;/);
    assert.match(light, /--rail-mark-on-light: flex;\n {2}--rail-mark-on-dark: none;/);
    assert.match(css, /\.dark \.direction-b, \[data-theme="dark"\] \.direction-b, \.direction-b\.dark, \.direction-b\[data-theme="dark"\] \{\n {2}--rail: #58c21e;/i);
    assert.equal(css.includes('.direction-a '), false, 'a direction with nothing to change writes no rule');
    assert.match(css, /\/\* Direction B: The green rail\. \*\//);
  });

  test('after the pick, the picked roles are the system and every direction still draws as it did', () => {
    const picked = P.buildProductTokens(green, { ...base, roles: { rail: { light: '#58C21E', dark: '#58C21E' } }, directions });
    assert.deepEqual(dir('B', picked).light, {}, 'the pick is the system now');
    for (const theme of ['light', 'dark']) {
      const before = { ...Object.fromEntries(tokens.color.tokens.map((t) => [t.name, P.resolveColour(tokens, t.name, theme)])) };
      const a = dir('A', picked)[theme];
      // Direction A, drawn on the new system with its class, is the old system again.
      const drawn = { ...picked, color: { ...picked.color, tokens: picked.color.tokens.map((t) => (t.name in a ? { ...t, value: { ...t.value, [theme]: a[t.name] } } : t)) } };
      for (const t of picked.color.tokens) assert.equal(P.resolveColour(drawn, t.name, theme).toLowerCase(), before[t.name].toLowerCase(), `${theme} ${t.name}`);
    }
  });

  test("a direction's failing pairs are reported under its name, and the system's own still pass", () => {
    // A decided colour is used as given, so a pale primary stays pale and fails to stand off the page.
    const pale = P.buildProductTokens(green, { ...base, directions: [{ name: 'Pale', roles: { primary: '#C8E6B5' } }] });
    const audit = P.auditProductTokens(pale);
    assert.ok(audit.fails.some((f) => f.direction === 'Pale' && f.fg === 'primary' && f.bg === 'surface'), JSON.stringify(audit.fails));
    assert.deepEqual(audit.fails.filter((f) => !f.direction), []);
    assert.equal(audit.ok, false);
    assert.ok(P.auditProductTokens(tokens).rows.some((r) => r.direction === 'B' && r.fg === 'rail-text' && r.bg === 'rail' && r.ok), "B's rail words are measured on its rail");
  });

  test('a direction is refused with its reason', () => {
    const build = (d) => () => P.buildProductTokens(green, { ...base, directions: d });
    assert.throws(build({ name: 'B' }), /directions is a list/);
    assert.throws(build([{ roles: { rail: '#58C21E' } }]), /a name/);
    assert.throws(build([{ name: 'B', roles: {} }]), /B: roles names at least one/);
    assert.throws(build([{ name: 'B', roles: { 'rail-text': '#000000' } }]), /B: rail-text is not a role a direction can move; it moves primary, brand, highlight, canvas, ink, focus, rail/);
    assert.throws(build([{ name: 'B', roles: { rail: 'acme-teal' } }]), /B: rail names acme-teal, which is not a hex value or one of the brand's colours \(acme-green, acme-black, acme-emerald\)/);
    assert.throws(build([{ name: 'B', roles: { rail: { dark: '#12345' } } }]), /direction B: rail names #12345, which is not a hex value/, 'a broken hex names its direction');
    assert.throws(build([{ name: 'B', roles: { rail: {} } }]), /direction B: rail is \{ light, dark \} with neither set/, 'an empty pair moves nothing, and says so');
    assert.throws(build([{ name: 'B', roles: { rail: '#58C21E' } }, { name: 'b', roles: { rail: '#134A36' } }]), /"b" makes direction-b a second time/);
  });

  test('a product.json from before directions solved roles, recording its picks under the key, still writes its tokens and is told how to draw one', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'brandi-directions-'));
    try {
      writeFileSync(path.join(dir, 'system.json'), JSON.stringify({ primary: '#58C21E', type: { display: 'Bitter', body: 'Karla' } }));
      const picks = { customer: { picked: 'A', boards: ['DirectionAppA390', 'DirectionAppB390'] }, staff: { picked: 'B', boards: ['DirectionConsoleA1440'] } };
      writeFileSync(path.join(dir, 'product.json'), JSON.stringify({ name: 'Acme product system', directions: picks }));
      const out = execFileSync(process.execPath, [path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs'), 'product', 'tokens', '--input', 'system.json', '--out', '.'], { cwd: dir, encoding: 'utf8' });
      assert.match(out, /product tokens written/);
      assert.match(out, /directions in product\.json records picks \(customer, staff\), not roles to solve, so no direction class was written/);
      const tokens = JSON.parse(readFileSync(path.join(dir, 'tokens.json'), 'utf8'));
      assert.equal(tokens.meta.directions, undefined);
      assert.deepEqual(JSON.parse(readFileSync(path.join(dir, 'product.json'), 'utf8')).directions, picks, 'the record is left as it was');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('neutrals the brand names in words', () => {
  test('a brand that speaks of sand neutrals with no sand value is told so; one that set its own neutral hue is not', () => {
    // The fixture's ratio says "sand neutrals" and its neutral hue is its primary green, so the neutrals came out a
    // green grey and nothing said why.
    const said = P.neutralsInWords(brand);
    assert.equal(said.length, 1);
    assert.match(said[0], /^The brand speaks of sand neutrals, and its record carries no sand value: the neutrals follow the neutral hue, its primary \(#1F6F4A\)\. Ask the brand for the sand it means/);
    assert.deepEqual(P.neutralsInWords({ ...brand, identity: { ...brand.identity, colour: { ...brand.identity.colour, neutralHue: '#C9B48A' } } }), [], 'a neutral hue of its own is the brand\'s');
    assert.deepEqual(P.neutralsInWords({ identity: { colour: { primary: '#1F6F4A', ratio: '60/30/10: cool neutrals, green actions' } } }), [], 'cool neutrals names no colour');
    // Once recorded as a question for the brand, it is not asked again on every run.
    assert.deepEqual(P.neutralsInWords(brand, { asked: [{ id: 'q2', question: 'What sand do the neutrals take?' }] }), []);
    assert.equal(P.neutralsInWords(brand, { asked: ['Which orange is the action?'] }).length, 1, 'a question about something else leaves it asked');
  });
});

describe("motion: a product built from a brand moves like the brand", () => {
  const signature = brand.identity.motionSignature;
  const from = 'identity.motionSignature in muddy-paws.json';
  const motion = (t) => Object.fromEntries([...t.duration.tokens, ...t.easing.tokens].map((x) => [x.name, x]));
  const KIT = { 'duration-fast': '120ms', 'duration-base': '180ms', 'duration-slow': '260ms', 'duration-scene': '1250ms', 'ease-standard': 'cubic-bezier(0.2, 0.8, 0.2, 1)', 'ease-exit': 'cubic-bezier(0.4, 0, 1, 1)' };

  test("the brand's curve is ease-standard and its duration sets the job nearest it, each with its source; the kit fills the rest, saying so", () => {
    // The fixture's signature: Settle, 240ms, a curve that decelerates into place and never overshoots.
    assert.deepEqual([signature.durationMs, signature.easing], [240, 'cubic-bezier(0.2, 0, 0, 1)']);
    const tokens = P.buildProductTokens(system, { motion: { ...signature, source: from } });
    const m = motion(tokens);
    assert.equal(m['ease-standard'].value, signature.easing);
    assert.equal(m['duration-slow'].value, '240ms', 'an arrival at 240ms is nearest the sheets and dialogs');
    for (const n of ['ease-standard', 'duration-slow']) {
      assert.equal(m[n].source, 'the motion signature, Settle (identity.motionSignature in muddy-paws.json)', n);
      assert.equal(m[n].derived, undefined, n);
    }
    // A hover or a press answers in the kit's 120ms: at 240ms a press would answer late.
    for (const n of ['duration-fast', 'duration-base', 'duration-scene', 'ease-exit']) {
      assert.equal(m[n].value, KIT[n], n);
      assert.equal(m[n].source, undefined, n);
      assert.ok(m[n].derived, n);
    }
    assert.equal(m['duration-fast'].derived, "the brand's 240ms sets duration-slow, the job nearest it");
    assert.match(m['ease-exit'].derived, /something leaving accelerates away/);
    const css = P.toProductCss(tokens);
    assert.match(css, /--ease-standard: cubic-bezier\(0\.2, 0, 0, 1\);/);
    assert.match(css, /--duration-slow: 240ms;/);
    assert.match(toStarterGlobals(tokens), /--duration-slow: 240ms;/, 'the starter moves the same way');
  });

  test('a brand with no signature keeps the kit\'s motion, every value recorded as the kit\'s', () => {
    for (const tokens of [P.buildProductTokens(system), P.buildProductTokens(system, { motion: null })]) {
      for (const [n, t] of Object.entries(motion(tokens))) {
        assert.equal(t.value, KIT[n], n);
        assert.equal(t.source, undefined, n);
        assert.ok(t.derived, n);
      }
      assert.equal(motion(tokens)['ease-standard'].derived, 'no motion signature in the brand');
      assert.equal(motion(tokens)['duration-slow'].derived, 'no motion signature in the brand');
    }
    // A signature with a name and no values moves nothing, and says which part it left out.
    const named = motion(P.buildProductTokens(system, { motion: { name: 'Drift', durationMs: null, easing: null, source: from } }));
    assert.equal(named['ease-standard'].value, KIT['ease-standard']);
    assert.equal(named['ease-standard'].derived, 'the motion signature, Drift, names no curve');
    assert.equal(named['duration-slow'].derived, 'the motion signature, Drift, names no duration');
  });

  test('each duration sets the job nearest it; feedback never takes a slow one, and a duration too slow for any job is held, with why', () => {
    const at = (ms) => motion(P.buildProductTokens(system, { motion: { name: 'Acme', durationMs: ms, easing: null, source: from } }));
    assert.equal(at(100)['duration-fast'].value, '100ms', 'a quick brand quickens its feedback');
    assert.ok(at(100)['duration-fast'].source);
    assert.equal(at(150)['duration-fast'].value, KIT['duration-fast'], 'a tie goes to the slower job, so feedback is never slowed to the midpoint');
    assert.equal(at(150)['duration-base'].value, '150ms');
    assert.equal(at(200)['duration-base'].value, '200ms');
    assert.equal(at(320)['duration-slow'].value, '320ms');
    const held = at(600);
    assert.equal(held['duration-slow'].value, '400ms');
    assert.equal(held['duration-slow'].source, undefined, 'a held value is not the brand\'s');
    assert.match(held['duration-slow'].derived, /^the brand's 600ms \(Acme\), held to 400ms: /);
    for (const n of ['duration-fast', 'duration-base']) assert.equal(held[n].value, KIT[n], n);
    assert.equal(at(60)['ease-standard'].value, KIT['ease-standard'], 'a duration alone leaves the curve the kit\'s');
  });

  test('a signature CSS cannot draw is refused with its reason, and a CSS keyword is a curve', () => {
    const build = (sig) => () => P.buildProductTokens(system, { motion: { name: 'Acme', source: from, ...sig } });
    assert.throws(build({ easing: 'a gentle settle' }), /motion signature \(identity\.motionSignature in muddy-paws\.json\): easing "a gentle settle" is not a curve CSS can draw: write cubic-bezier\(x1, y1, x2, y2\) or a keyword such as ease-out/);
    assert.throws(build({ easing: 'cubic-bezier(1.2, 0, 0, 1)' }), /not a curve CSS can draw/, 'x runs from 0 to 1');
    assert.throws(build({ easing: 'cubic-bezier(0.2, 0, 0)' }), /not a curve CSS can draw/);
    assert.throws(build({ durationMs: '240ms' }), /durationMs is a number of milliseconds above 0, got "240ms"/);
    assert.throws(build({ durationMs: 0 }), /durationMs is a number of milliseconds above 0/);
    // A number CSS cannot read passes Number() all the same.
    for (const bad of ['cubic-bezier(0x0, 0, 0, 1)', 'cubic-bezier(0.2, 0, 0, 1_0)', 'cubic-bezier(0.2, , 0, 1)']) assert.throws(build({ easing: bad }), /not a curve CSS can draw/, bad);
    // A misspelt field is the silent drop this guards against: the signature would move nothing and say nothing.
    assert.throws(build({ duration: 240, curve: 'ease-out' }), /motion signature \(identity\.motionSignature in muddy-paws\.json\): duration, curve is not part of a signature: it holds name, description, durationMs and easing/);
    assert.throws(() => P.buildProductTokens(system, { motion: 'Settle' }), /the brand's motion signature is \{ name, description, durationMs, easing \}, got "Settle"/);
    assert.equal(motion(P.buildProductTokens(system, { motion: { easing: 'ease-out', source: from } }))['ease-standard'].value, 'ease-out');
    assert.equal(motion(P.buildProductTokens(system, { motion: { easing: 'Cubic-Bezier(0.2,0,0,1)', source: from } }))['ease-standard'].value, 'Cubic-Bezier(0.2,0,0,1)', 'CSS reads a curve in any case, unspaced');
    assert.equal(motion(P.buildProductTokens(system, { motion: { easing: 'cubic-bezier(.2, 0, 0, 1e0)', source: from } }))['ease-standard'].value, 'cubic-bezier(.2, 0, 0, 1e0)');
  });
});

describe('brandi product tokens reads the brand and product.json on both routes', () => {
  const cli = path.join(ROOT, 'scripts', 'brandi.mjs');
  const run = (cwd, ...args) => spawnSync(process.execPath, [cli, 'product', 'tokens', ...args], { cwd, encoding: 'utf8' });
  const product = (dir, config) => { mkdirSync(path.join(dir, 'product'), { recursive: true }); writeFileSync(path.join(dir, 'product', 'product.json'), JSON.stringify(config)); };
  const written = (dir) => JSON.parse(readFileSync(path.join(dir, 'product', 'tokens.json'), 'utf8'));
  const value = (t, fam, n) => t[fam].tokens.find((x) => x.name === n).value;

  test("route A: brand.json's motion signature moves the product, a plain-hex rail is the rail, and both are said", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'brandi-tokens-a-'));
    mkdirSync(path.join(dir, 'brand'));
    writeFileSync(path.join(dir, 'brand', 'brand.json'), JSON.stringify(brand));
    product(dir, { name: 'Acme product system', roles: { rail: '#1B5D40' } });
    const res = run(dir);
    const tokens = written(dir);
    assert.equal(P.resolveColour(tokens, 'rail', 'dark'), '#1B5D40');
    assert.match(readFileSync(path.join(dir, 'product', 'tokens.css'), 'utf8'), /--rail: #1B5D40;/);
    assert.equal(value(tokens, 'easing', 'ease-standard'), 'cubic-bezier(0.2, 0, 0, 1)');
    assert.equal(value(tokens, 'duration', 'duration-slow'), '240ms');
    assert.equal(tokens.easing.tokens[0].source, 'the motion signature, Settle (identity.motionSignature in brand/brand.json)');
    assert.match(res.stdout, /\nMotion:\n {2}ease-standard {2}cubic-bezier\(0\.2, 0, 0, 1\) {2}the brand's: the motion signature, Settle/);
    assert.match(res.stdout, /\n {2}duration-fast {2}120ms {2}the kit's: /);
    rmSync(dir, { recursive: true, force: true });
  });

  test('route B: the input file carries the signature in the same form; without one the kit\'s motion is said to be the kit\'s; an unknown role stops the run', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'brandi-tokens-b-'));
    const input = { name: 'Acme', primary: '#1F6E4A', type: { display: 'Bitter', body: 'Karla' }, motionSignature: { name: 'Glide', durationMs: 200, easing: 'cubic-bezier(0.3, 0, 0, 1)' } };
    writeFileSync(path.join(dir, 'input.json'), JSON.stringify(input));
    product(dir, {});
    run(dir, '--input', 'input.json');
    assert.equal(value(written(dir), 'duration', 'duration-base'), '200ms');
    assert.equal(written(dir).duration.tokens.find((x) => x.name === 'duration-base').source, 'the motion signature, Glide (motionSignature in input.json)');
    writeFileSync(path.join(dir, 'input.json'), JSON.stringify({ ...input, motionSignature: undefined }));
    const plain = run(dir, '--input', 'input.json');
    assert.equal(value(written(dir), 'easing', 'ease-standard'), 'cubic-bezier(0.2, 0.8, 0.2, 1)');
    assert.match(plain.stdout, /\n {2}ease-standard {2}cubic-bezier\(0\.2, 0\.8, 0\.2, 1\) {2}the kit's: no motion signature in the brand/);
    product(dir, { roles: { rial: '#1B5D40' } });
    const bad = run(dir, '--input', 'input.json');
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /roles\.rial is not a role product\.json decides/);
    rmSync(dir, { recursive: true, force: true });
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

  test("a value a run filled keeps its source but is never shown as the brand's: the record lists it, and the shape board says it was filled", () => {
    // A run's own shell and button radius printed after "The brand's:" on the shape board, against 02's provenance rule.
    const tokens = build({
      families: { card: { px: 16, source: 'the guidelines, p12' }, press: { px: 10, source: 'buttons match the inputs, decided by the run', filled: true } },
      shell: { form: 'edge', source: 'decided by the run: no live site to measure', filled: true },
    });
    const listed = Object.fromEntries(P.shapeKitDefaults(tokens).map((d) => [d.choice, d.how]));
    assert.match(listed['radius-action'], /^filled by the run, not the brand's: buttons match the inputs/);
    assert.match(listed.shell, /^filled by the run, not the brand's: decided by the run/);
    assert.equal(listed['radius-md'], undefined, "the brand's own card radius is not listed");
    const board = shapeBoard(tokens, {}).source;
    assert.match(board, /Filled by the run, not the brand's: buttons match the inputs/);
    assert.match(board, /Filled by the run, not the brand's: decided by the run: no live site/);
    assert.match(board, /The brand's: the guidelines, p12/);
    assert.doesNotMatch(board, /The brand's: buttons match the inputs|The brand's: decided by the run/);
    assert.throws(() => build({ families: { card: { px: 16, source: 'p12', filled: 'yes' } } }), /filled is true for a value a run decided/);
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

  const paper = { name: 'The paper ground', source: "the guidelines' page grounds, p13", where: ['the sign-in hero'], file: 'textures/paper.jpg', kind: 'texture', strength: 0.35 };

  test("a texture move carries its file: tokens.css lays it on a layer multiplied over the element's own colour", () => {
    const tokens = build({ moves: [paper] });
    assert.deepEqual(tokens.radius.moves, [paper], 'the move travels in tokens.json as written');
    const css = P.toProductCss(tokens);
    const rule = /\.brand-texture::before \{([^}]*)\}/.exec(css)?.[1] ?? '';
    assert.match(rule, /background: url\("textures\/paper\.jpg"\) center \/ cover no-repeat/, 'the file, beside tokens.css as a canvas holds it');
    assert.match(rule, /mix-blend-mode: multiply/);
    assert.match(rule, /opacity: 0\.35/, "at the move's strength");
    assert.match(rule, /z-index: -1/, 'under the words');
    assert.match(css, /\.brand-texture \{[^}]*isolation: isolate/, "so the layer multiplies over the element's own colour, not the page behind it");
    assert.doesNotMatch(P.toProductCss(build({ moves: [{ name: 'An edge', source: 'p4', where: ['the email header'] }] })), /brand-texture/, 'a move with no file emits nothing');
  });

  test('a texture move is refused without its strength, outside textures/, or as a second texture', () => {
    for (const bad of [{ ...paper, strength: undefined }, { ...paper, strength: 1.5 }, { ...paper, file: '../brand/paper.jpg' }, { ...paper, kind: 'edge' }, { ...paper, kind: undefined }]) {
      assert.throws(() => build({ moves: [bad] }), TypeError, JSON.stringify(bad));
    }
    assert.throws(() => build({ moves: [paper, { ...paper, name: 'Halftone', file: 'textures/dots.png' }] }), /one texture/);
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
