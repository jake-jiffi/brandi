import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../scripts/type.mjs';

const close = (a, b, tol = 1e-4) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} within ${tol} of ${b}`);

describe('ratios', () => {
  test('every ratio is above 1 and carries guidance', () => {
    for (const [name, r] of Object.entries(T.RATIOS)) {
      assert.ok(r.value > 1, `${name} must be a growth ratio`);
      assert.ok(r.note.length > 10, `${name} needs usable guidance`);
    }
  });

  test('the musical intervals are the real values', () => {
    close(T.RATIOS['perfect-fourth'].value, 1.333, 0.001);
    close(T.RATIOS['perfect-fifth'].value, 1.5, 0.001);
    close(T.RATIOS.golden.value, 1.618, 0.001);
  });
});

describe('typeScale', () => {
  test('base is exactly the base size', () => {
    const s = T.typeScale({ basePx: 16, ratio: 'major-third' });
    assert.equal(s.byName.base.px, 16);
    assert.equal(s.byName.base.offset, 0);
  });

  test('follows the ratio exactly above body size', () => {
    const s = T.typeScale({ basePx: 16, ratio: 1.25, fluid: false });
    close(s.byName.md.px, 16 * 1.25, 0.01);
    close(s.byName.lg.px, 16 * 1.25 ** 2, 0.01);
    close(s.byName['4xl'].px, 16 * 1.25 ** 6, 0.01);
  });

  test('compresses the ratio below body size so the small end still exists', () => {
    const s = T.typeScale({ basePx: 16, ratio: 1.25, fluid: false });
    close(s.byName.sm.px, 16 / Math.sqrt(1.25), 0.01);
    close(s.byName.xs.px, 16 / 1.25, 0.01);
    assert.ok(s.byName.xs.px >= 12, 'compression is what keeps xs above the floor');
    // At the full ratio, xs would have been 10.24px and unusable.
    assert.ok(16 * 1.25 ** -2 < 12);
  });

  test('sizes increase monotonically', () => {
    const s = T.typeScale({ basePx: 16, ratio: 'minor-third' });
    for (let i = 1; i < s.steps.length; i++) {
      assert.ok(s.steps[i].px > s.steps[i - 1].px, `${s.steps[i].name} must exceed ${s.steps[i - 1].name}`);
    }
  });

  test('every step is named, described and has a line height', () => {
    for (const st of T.typeScale().steps) {
      assert.ok(st.name.length > 0);
      assert.ok(st.use.length > 5, `${st.name} needs a stated job`);
      assert.ok(st.lineHeight >= 1 && st.lineHeight <= 2);
      assert.match(st.letterSpacing, /^-?[\d.]+em$/);
    }
  });

  test('body copy never gets less than 1.5 line height', () => {
    const s = T.typeScale({ basePx: 16 });
    for (const st of s.steps) {
      if (st.px <= 16) assert.ok(st.lineHeight >= 1.5, `${st.name} at ${st.px}px has ${st.lineHeight}`);
    }
  });

  test('display type gets tighter leading than body type', () => {
    const s = T.typeScale({ basePx: 16, ratio: 'perfect-fourth' });
    assert.ok(s.byName['4xl'].lineHeight < s.byName.base.lineHeight);
    assert.ok(s.byName['4xl'].letterSpacing.startsWith('-'), 'display should tighten tracking');
  });

  test('a dual-ratio scale grows headings faster than body copy', () => {
    const s = T.typeScale({ basePx: 16, baseMaxPx: 18, ratio: 'minor-third', ratioMax: 'perfect-fourth' });
    assert.ok(s.byName['3xl'].maxPx > s.byName['3xl'].px * 1.5);
    assert.equal(s.byName.base.px, 16);
    assert.equal(s.byName.base.maxPx, 18);
  });

  test('warns when body copy is set below the browser default', () => {
    const s = T.typeScale({ basePx: 14 });
    assert.ok(s.warnings.some((w) => /16px/.test(w)), 'should name the floor');
  });

  test('drops steps that fall below the legibility floor rather than shipping them', () => {
    const s = T.typeScale({ basePx: 16, ratio: 'perfect-fourth' });
    assert.ok(s.dropped.length > 0, 'a tight ratio pushes the bottom step under 12px');
    assert.equal(s.byName['2xs'], undefined, 'a dropped step must not appear by name');
    for (const st of s.steps) assert.ok(st.px >= 12, `${st.name} at ${st.px}px survived the floor`);
    assert.match(s.dropped[0].reason, /legibility floor/);
  });

  test('keeps every step when the ratio leaves room for them', () => {
    const s = T.typeScale({ basePx: 16, ratio: 'minor-third' });
    assert.deepEqual(s.dropped, []);
    assert.equal(s.steps.length, T.STEPS.length);
  });

  test('warns when the small end of the scale is starved entirely', () => {
    const s = T.typeScale({ basePx: 13, ratio: 'perfect-fifth' });
    assert.equal(s.steps.some((x) => x.offset < 0), false);
    assert.ok(s.warnings.some((w) => /below body size/.test(w)), s.warnings.join(' | '));
  });

  test('warns when the scale spans an unusable range', () => {
    const s = T.typeScale({ basePx: 16, ratio: 'golden' });
    assert.ok(s.warnings.some((w) => /distinguishable/.test(w)));
  });

  test('a sane scale produces no warnings', () => {
    for (const ratio of ['minor-third', 'major-third', 'perfect-fourth']) {
      const s = T.typeScale({ basePx: 16, ratio });
      assert.deepEqual(s.warnings, [], `${ratio} should be uncontroversial`);
    }
  });

  test('rejects nonsense input', () => {
    assert.throws(() => T.typeScale({ ratio: 'diminished-ninth' }), TypeError);
    assert.throws(() => T.typeScale({ ratio: 0.9 }), RangeError);
    assert.throws(() => T.typeScale({ ratio: 1 }), RangeError);
    assert.throws(() => T.typeScale({ ratioMax: 'nope' }), TypeError);
  });

  test('is deterministic', () => {
    assert.deepEqual(T.typeScale({ basePx: 17, ratio: 1.22 }), T.typeScale({ basePx: 17, ratio: 1.22 }));
  });
});

describe('fluid()', () => {
  test('hits the minimum size exactly at the minimum viewport', () => {
    const css = T.fluid(16, 24, { minVw: 400, maxVw: 1200, rootPx: 16 });
    const m = /clamp\(([\d.]+)rem, ([-\d.]+)rem \+ ([\d.]+)vw, ([\d.]+)rem\)/.exec(css);
    assert.ok(m, `unexpected shape: ${css}`);
    const [, lo, intercept, vw, hi] = m.map(Number);
    close(lo * 16, 16, 0.01);
    close(hi * 16, 24, 0.01);
    // Evaluate the middle term at 400px wide.
    close(intercept * 16 + (vw / 100) * 400, 16, 0.02);
    close(intercept * 16 + (vw / 100) * 1200, 24, 0.02);
  });

  test('always keeps a rem term so browser zoom still works', () => {
    // A pure-vw preferred value silently defeats WCAG 1.4.4.
    for (const [a, b] of [[14, 18], [16, 64], [12, 13]]) {
      assert.match(T.fluid(a, b), /rem \+ [\d.]+vw/);
    }
  });

  test('orders the clamp bounds correctly even when min exceeds max', () => {
    const css = T.fluid(24, 16);
    const m = /clamp\(([\d.]+)rem, .*, ([\d.]+)rem\)/.exec(css);
    assert.ok(Number(m[1]) < Number(m[2]), 'clamp lower bound must be the smaller number');
  });

  test('rejects an impossible viewport range', () => {
    assert.throws(() => T.fluid(16, 24, { minVw: 1200, maxVw: 400 }), RangeError);
    assert.throws(() => T.fluid(16, 24, { minVw: 800, maxVw: 800 }), RangeError);
  });
});

describe('lineHeightFor', () => {
  test('holds the body value at and below body size', () => {
    assert.equal(T.lineHeightFor(16), 1.55);
    assert.equal(T.lineHeightFor(12), 1.55);
  });

  test('tightens as size grows, monotonically', () => {
    let prev = Infinity;
    for (const px of [16, 20, 24, 32, 40, 56, 72, 96]) {
      const lh = T.lineHeightFor(px);
      assert.ok(lh <= prev, `${px}px got ${lh}, looser than the size below it`);
      prev = lh;
    }
  });

  test('never collapses below the display floor', () => {
    assert.ok(T.lineHeightFor(400) >= 1.0);
  });
});

describe('measure', () => {
  test('66 characters is comfortable', () => {
    const m = T.measure(66);
    assert.equal(m.comfortable, true);
    assert.equal(m.css, '66ch');
  });

  test('flags a column that is too wide or too narrow', () => {
    assert.equal(T.measure(90).comfortable, false);
    assert.match(T.measure(90).verdict, /too wide/);
    assert.equal(T.measure(30).comfortable, false);
    assert.match(T.measure(30).verdict, /too narrow/);
  });

  test('gives a px estimate for grid planning', () => {
    assert.equal(T.measure(66, { fontSizePx: 16 }).approxPx, 528);
  });

  test('cites its source rather than asserting folklore', () => {
    assert.match(T.measure().source, /Bringhurst/);
  });

  test('rejects absurd values', () => {
    assert.throws(() => T.measure(5), RangeError);
    assert.throws(() => T.measure(500), RangeError);
  });
});

describe('unit conversion at 96 px per inch', () => {
  test('12pt is 16px, the print body floor meeting the screen body floor', () => {
    assert.equal(T.ptToPx(12), 16);
    assert.equal(T.pxToPt(16), 12);
  });

  test('round-trips', () => {
    for (const pt of [8, 9, 10, 11, 12, 18, 24, 36, 60]) {
      close(T.pxToPt(T.ptToPx(pt)), pt, 0.01);
    }
  });
});

describe('WCAG text spacing stress', () => {
  test('emits every value 1.4.12 requires', () => {
    const css = T.textSpacingStressCss();
    assert.match(css, /line-height: 1\.5/);
    assert.match(css, /letter-spacing: 0\.12em/);
    assert.match(css, /word-spacing: 0\.16em/);
    assert.match(css, /margin-bottom: 2em/);
  });
});

describe('floors', () => {
  test('states the non-negotiables', () => {
    assert.equal(T.FLOORS.bodyScreenPx, 16);
    assert.equal(T.FLOORS.bodyPrintPt, 12);
    assert.equal(T.FLOORS.targetMinPx, 24);
    assert.equal(T.FLOORS.targetComfortablePx, 44);
  });
});
