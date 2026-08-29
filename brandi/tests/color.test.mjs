import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../scripts/color.mjs';

const close = (a, b, tol = 1e-4, msg) =>
  assert.ok(Math.abs(a - b) <= tol, msg ?? `expected ${a} within ${tol} of ${b}`);

describe('hex parsing and formatting', () => {
  test('parses 6-digit hex', () => {
    const c = C.parseHex('#FF8000');
    close(c.r, 1);
    close(c.g, 128 / 255);
    close(c.b, 0);
    close(c.a, 1);
  });

  test('parses 3-digit shorthand as doubled nibbles', () => {
    assert.deepEqual(C.parseHex('#abc'), C.parseHex('#aabbcc'));
  });

  test('parses 8-digit hex with alpha', () => {
    const c = C.parseHex('#FF000080');
    close(c.r, 1);
    close(c.a, 128 / 255);
  });

  test('accepts a missing leading hash', () => {
    assert.deepEqual(C.parseHex('abc'), C.parseHex('#abc'));
  });

  test('rejects nonsense', () => {
    for (const bad of ['#12345', 'rebeccapurple', '', '#gg0000', null, undefined, '#12']) {
      assert.throws(() => C.parseHex(bad), TypeError, `should reject ${JSON.stringify(bad)}`);
    }
  });

  test('formats back to uppercase hex', () => {
    assert.equal(C.toHex(C.parseHex('#ff8000')), '#FF8000');
  });

  test('clamps out-of-range channels rather than emitting garbage', () => {
    assert.equal(C.toHex({ r: 2, g: -1, b: 0.5 }), '#FF0080');
  });
});

describe('sRGB transfer function', () => {
  test('is an involution within float tolerance', () => {
    for (let i = 0; i <= 255; i++) {
      const c = i / 255;
      close(C.linearToSrgb(C.srgbToLinear(c)), c, 1e-9);
    }
  });

  test('matches known anchor points', () => {
    close(C.srgbToLinear(0), 0);
    close(C.srgbToLinear(1), 1);
    close(C.srgbToLinear(0.5), 0.21404114, 1e-6);
  });
});

describe('OKLab / OKLCH', () => {
  test('white is L=1, a=0, b=0', () => {
    const lab = C.linearRgbToOklab({ r: 1, g: 1, b: 1 });
    close(lab.L, 1, 1e-6);
    close(lab.a, 0, 1e-6);
    close(lab.b, 0, 1e-6);
  });

  test('black is L=0', () => {
    const lab = C.linearRgbToOklab({ r: 0, g: 0, b: 0 });
    close(lab.L, 0, 1e-9);
  });

  test('sRGB red matches published OKLCH values', () => {
    // Reference: oklch(62.8% 0.2577 29.23) for #FF0000
    const lch = C.toOklch('#FF0000');
    close(lch.L, 0.6279, 1e-3);
    close(lch.C, 0.2577, 1e-3);
    close(lch.h, 29.23, 0.05);
  });

  test('sRGB blue matches published OKLCH values', () => {
    // Reference: oklch(45.2% 0.3132 264.05) for #0000FF
    const lch = C.toOklch('#0000FF');
    close(lch.L, 0.452, 1e-3);
    close(lch.C, 0.3132, 1e-3);
    close(lch.h, 264.05, 0.1);
  });

  test('greys report no hue rather than atan2 noise', () => {
    assert.equal(C.toOklch('#808080').h, 0);
    assert.ok(C.toOklch('#808080').C < 1e-6);
  });

  test('round-trips every colour it can represent', () => {
    const samples = [
      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
      '#123456', '#ABCDEF', '#7F3D2A', '#0A0A0A', '#FEFEFE',
      '#FF8800', '#00FFAA', '#8800FF', '#556B2F', '#D4AF37',
    ];
    for (const hex of samples) {
      assert.equal(C.oklchToHex(C.toOklch(hex)), hex.toUpperCase(), `round trip ${hex}`);
    }
  });

  test('round-trips a deterministic sweep of the cube', () => {
    let checked = 0;
    for (let r = 0; r < 256; r += 37) {
      for (let g = 0; g < 256; g += 41) {
        for (let b = 0; b < 256; b += 43) {
          const hex = C.toHex({ r: r / 255, g: g / 255, b: b / 255 });
          assert.equal(C.oklchToHex(C.toOklch(hex)), hex, `round trip ${hex}`);
          checked++;
        }
      }
    }
    assert.ok(checked > 100, 'sweep should cover a meaningful number of colours');
  });
});

describe('gamut mapping', () => {
  test('leaves in-gamut colours untouched', () => {
    const lch = C.toOklch('#3366CC');
    assert.deepEqual(C.gamutMapOklch(lch), { ...lch });
  });

  test('pulls an impossible chroma back into sRGB', () => {
    const wild = { L: 0.6, C: 0.45, h: 150 };
    assert.equal(C.inSrgbGamut(wild), false);
    const mapped = C.gamutMapOklch(wild);
    assert.equal(C.inSrgbGamut(mapped), true);
    assert.ok(mapped.C < wild.C, 'chroma should be reduced');
  });

  test('preserves lightness and hue while reducing chroma', () => {
    const wild = { L: 0.72, C: 0.4, h: 30 };
    const mapped = C.gamutMapOklch(wild);
    close(mapped.L, wild.L, 1e-9);
    close(mapped.h, wild.h, 1e-9);
  });

  test('handles the degenerate ends', () => {
    assert.equal(C.gamutMapOklch({ L: 0, C: 0.3, h: 200 }).C, 0);
    assert.equal(C.gamutMapOklch({ L: 1, C: 0.3, h: 200 }).C, 0);
  });

  test('maxChroma is in gamut and just barely so', () => {
    for (const h of [0, 60, 120, 180, 240, 300]) {
      const c = C.maxChroma(0.6, h);
      assert.ok(C.inSrgbGamut({ L: 0.6, C: c, h }), `L .6 h${h} at max chroma should fit`);
      assert.ok(!C.inSrgbGamut({ L: 0.6, C: c + 0.01, h }), `L .6 h${h} past max should not fit`);
    }
  });
});

describe('WCAG 2.2 contrast', () => {
  test('black on white is exactly 21:1', () => {
    close(C.contrastRatio('#000000', '#FFFFFF'), 21, 1e-9);
  });

  test('a colour against itself is 1:1', () => {
    close(C.contrastRatio('#3B82F6', '#3B82F6'), 1, 1e-9);
  });

  test('is order independent', () => {
    close(
      C.contrastRatio('#123456', '#EEEEEE'),
      C.contrastRatio('#EEEEEE', '#123456'),
      1e-12,
    );
  });

  test('matches published ratios', () => {
    // #777777 on white is the canonical 4.48:1 example.
    close(C.contrastRatio('#777777', '#FFFFFF'), 4.48, 0.01);
    // #767676 on white is the classic "just passes AA" grey.
    assert.ok(C.contrastRatio('#767676', '#FFFFFF') >= 4.5);
    assert.ok(C.contrastRatio('#777777', '#FFFFFF') < 4.5);
  });

  test('grades against the right thresholds', () => {
    const normal = C.wcagCheck('#767676', '#FFFFFF');
    assert.equal(normal.AA, true);
    assert.equal(normal.AAA, false);

    const large = C.wcagCheck('#949494', '#FFFFFF', { size: 'large' });
    assert.ok(large.ratio >= 3 && large.ratio < 4.5);
    assert.equal(large.AA, true, 'large text needs only 3:1');
    assert.equal(large.AAA, false);

    const asNormal = C.wcagCheck('#949494', '#FFFFFF');
    assert.equal(asNormal.AA, false, 'the same colour fails as normal-size text');
  });
});

describe('APCA', () => {
  test('black text on white matches the reference Lc 106.04', () => {
    close(C.apcaContrast('#000000', '#FFFFFF'), 106.04, 0.02);
  });

  test('white text on black matches the reference Lc -107.88', () => {
    close(C.apcaContrast('#FFFFFF', '#000000'), -107.88, 0.02);
  });

  test('matches independently derived values across the range', () => {
    // Derived by hand from the W3 0.1.9 formula and cross-checked against the
    // published APCA calculator. A grey is used because all three channels are
    // equal, so the luminance coefficients cancel and the arithmetic can be
    // followed on paper:
    //   Y(#888888) = (136/255)^2.4 = 0.221176
    //   BoW: ((1^0.56) - (0.221176^0.57)) * 1.14 - 0.027 = 0.6305
    //   WoB: ((0.221176^0.65) - (1^0.62)) * 1.14 + 0.027 = -0.6854
    close(C.apcaContrast('#888888', '#FFFFFF'), 63.06, 0.02);
    close(C.apcaContrast('#FFFFFF', '#888888'), -68.54, 0.02);
    close(C.apcaContrast('#666666', '#FFFFFF'), 78.75, 0.05);
    close(C.apcaContrast('#FFFFFF', '#666666'), -84.0, 0.05);
  });

  test('the same pair reads differently by polarity, which is the point of APCA', () => {
    // Dark-on-light and light-on-dark are not equivalent to the eye, and APCA
    // is the only one of the two systems here that models that.
    const bow = C.apcaContrast('#888888', '#FFFFFF');
    const wob = C.apcaContrast('#FFFFFF', '#888888');
    assert.ok(Math.abs(Math.abs(bow) - Math.abs(wob)) > 4, 'the asymmetry must survive');
    // WCAG, by contrast, cannot tell them apart at all.
    close(C.contrastRatio('#888888', '#FFFFFF'), C.contrastRatio('#FFFFFF', '#888888'), 1e-12);
  });

  test('is polarity aware, unlike WCAG', () => {
    const a = C.apcaContrast('#000000', '#FFFFFF');
    const b = C.apcaContrast('#FFFFFF', '#000000');
    assert.ok(a > 0 && b < 0, 'sign encodes polarity');
    assert.notEqual(Math.abs(a), Math.abs(b), 'magnitudes deliberately differ');
  });

  test('reports zero for identical colours', () => {
    assert.equal(C.apcaContrast('#445566', '#445566'), 0);
  });

  test('clips near-invisible pairs to zero rather than reporting a tiny value', () => {
    assert.equal(C.apcaContrast('#FFFFFF', '#FEFEFE'), 0);
  });

  test('guidance tightens as Lc falls', () => {
    assert.match(C.apcaGuidance(95).tier, /90/);
    assert.match(C.apcaGuidance(-95).tier, /90/, 'sign should not matter');
    assert.match(C.apcaGuidance(10).use, /not usable/);
  });
});

describe('contrastReport', () => {
  test('combines both systems with a plain verdict', () => {
    const r = C.contrastReport('#000000', '#FFFFFF');
    assert.equal(r.verdict, 'AAA');
    assert.equal(r.wcag.ratio, 21);
    assert.ok(r.apca.lc > 100);
  });

  test('calls a failure a failure', () => {
    assert.equal(C.contrastReport('#CCCCCC', '#FFFFFF').verdict, 'fail');
  });
});

describe('bestTextOn', () => {
  test('picks white on a dark ground', () => {
    assert.equal(C.bestTextOn('#111111').color, '#FFFFFF');
  });
  test('picks black on a light ground', () => {
    assert.equal(C.bestTextOn('#FFEE88').color, '#000000');
  });

  test('defaults to APCA, because APCA is the bar labels are held to', () => {
    // On a mid-tone green the two systems disagree: WCAG prefers black, which
    // reaches only Lc 33 and fails the house bar, while white reaches Lc -77.
    const pick = C.bestTextOn('#338637');
    assert.equal(pick.color, '#FFFFFF');
    assert.equal(pick.metric, 'apca');
    assert.ok(Math.abs(pick.apca) > 70);
    assert.equal(C.bestTextOn('#338637', ['#FFFFFF', '#000000'], { metric: 'wcag' }).color, '#000000');
  });

  test('reports both metrics whichever one it picked by', () => {
    const p = C.bestTextOn('#2563EB');
    assert.equal(typeof p.ratio, 'number');
    assert.equal(typeof p.apca, 'number');
  });

  test('rejects a metric it does not have', () => {
    assert.throws(() => C.bestTextOn('#FFFFFF', ['#000000'], { metric: 'vibes' }), TypeError);
  });
});

describe('colour vision deficiency', () => {
  test('leaves greys essentially unchanged', () => {
    for (const type of ['protanopia', 'deuteranopia', 'tritanopia']) {
      const out = C.toOklch(C.simulateCvd('#808080', type));
      assert.ok(out.C < 0.02, `${type} should not tint a neutral grey`);
    }
  });

  test('collapses red and green under deuteranopia', () => {
    const pair = C.cvdSafePair('#D32F2F', '#2E7D32');
    assert.equal(pair.results.normal.ok, true, 'they are obviously different to most people');
    assert.equal(pair.safe, false, 'but they must not be the only signal');
    assert.ok(
      pair.results.deuteranopia.distance < pair.results.normal.distance,
      'the difference shrinks under deuteranopia',
    );
  });

  test('passes a pair separated by lightness', () => {
    const pair = C.cvdSafePair('#0B1F33', '#F2F5F8');
    assert.equal(pair.safe, true);
  });

  test('uses the published Machado 2009 matrices at full severity', () => {
    // A regression guard on the constants themselves. If someone "tidies" a
    // digit, the simulation quietly stops meaning anything, and no visual test
    // would catch it. Checked by transforming the primaries and comparing
    // against values computed from the published matrices.
    // Deuteranopia row 1: 0.367322 R + 0.860646 G - 0.227968 B
    const linToHex = (r, g, b) => C.toHex({
      r: C.linearToSrgb(Math.max(0, Math.min(1, r))),
      g: C.linearToSrgb(Math.max(0, Math.min(1, g))),
      b: C.linearToSrgb(Math.max(0, Math.min(1, b))),
    });
    // Pure linear red through deuteranopia is column one of the matrix.
    const red = C.toHex({ r: 1, g: 0, b: 0 });
    assert.equal(C.simulateCvd(red, 'deuteranopia'), linToHex(0.367322, 0.280085, -0.01182));
    assert.equal(C.simulateCvd(red, 'protanopia'), linToHex(0.152286, 0.114503, -0.003882));
    assert.equal(C.simulateCvd(red, 'tritanopia'), linToHex(1.255528, -0.078411, 0.004733));
    // Pure linear green is column two.
    const green = C.toHex({ r: 0, g: 1, b: 0 });
    assert.equal(C.simulateCvd(green, 'deuteranopia'), linToHex(0.860646, 0.672501, 0.04294));
  });

  test('rejects an unknown deficiency name', () => {
    assert.throws(() => C.simulateCvd('#FFF', 'quadranopia'), TypeError);
  });
});

describe('tonal ramps', () => {
  const seeds = {
    blue: '#2563EB',
    yellow: '#FACC15',
    darkNavy: '#0B2545',
    red: '#DC2626',
    green: '#16A34A',
    magenta: '#C026D3',
    nearBlack: '#111111',
    brightLime: '#D9F99D',
  };

  for (const [name, hex] of Object.entries(seeds)) {
    for (const mode of ['light', 'dark']) {
      test(`${name} / ${mode}: 12 steps, valid hex, step 9 is the brand colour`, () => {
        const ramp = C.tonalRamp(hex, { mode, name });
        assert.equal(ramp.steps.length, 12);
        for (const s of ramp.steps) {
          assert.match(s.hex, /^#[0-9A-F]{6}$/, `step ${s.step} should be a hex colour`);
          assert.equal(typeof s.role, 'string');
        }
        assert.equal(ramp.steps[8].hex, C.oklchToHex(C.gamutMapOklch(C.toOklch(hex))));
      });

      test(`${name} / ${mode}: the surface zone is a smooth monotonic gradient`, () => {
        const Ls = C.tonalRamp(hex, { mode }).steps.slice(0, 8).map((s) => s.L);
        for (let i = 1; i < Ls.length; i++) {
          if (mode === 'light') {
            assert.ok(Ls[i] < Ls[i - 1], `light step ${i + 1} (${Ls[i]}) must be darker than step ${i} (${Ls[i - 1]})`);
          } else {
            assert.ok(Ls[i] > Ls[i - 1], `dark step ${i + 1} (${Ls[i]}) must be lighter than step ${i} (${Ls[i - 1]})`);
          }
        }
      });

      test(`${name} / ${mode}: the text zone runs the same direction`, () => {
        const s = C.tonalRamp(hex, { mode }).steps;
        if (mode === 'light') assert.ok(s[11].L < s[10].L, 'step 12 must be darker than step 11');
        else assert.ok(s[11].L > s[10].L, 'step 12 must be lighter than step 11');
      });

      test(`${name} / ${mode}: every step sits inside sRGB as stored`, () => {
        for (const s of C.tonalRamp(hex, { mode }).steps) {
          assert.ok(
            C.inSrgbGamut({ L: s.L, C: s.C, h: s.h }),
            `step ${s.step} (${s.oklch}) is out of gamut as stored`,
          );
        }
      });

      test(`${name} / ${mode}: the stored oklch and hex agree`, () => {
        for (const s of C.tonalRamp(hex, { mode }).steps) {
          assert.equal(C.oklchToHex({ L: s.L, C: s.C, h: s.h }), s.hex, `step ${s.step} mismatch`);
        }
      });

      test(`${name} / ${mode}: body text clears WCAG AA and headings clear AAA`, () => {
        const r = C.tonalRamp(hex, { mode });
        assert.ok(
          r.checks.textHighOnApp.wcag.AAA,
          `step 12 on step 1 must clear AAA, got ${r.checks.textHighOnApp.wcag.ratio}`,
        );
        assert.ok(
          r.checks.textLowOnApp.wcag.AA,
          `step 11 on step 1 must clear AA body text, got ${r.checks.textLowOnApp.wcag.ratio}`,
        );
      });

      test(`${name} / ${mode}: borders escalate rather than all looking the same`, () => {
        const r = C.tonalRamp(hex, { mode });
        const app = r.steps[0].hex;
        const [c6, c7, c8] = [5, 6, 7].map((i) => C.contrastRatio(r.steps[i].hex, app));
        assert.ok(c6 < c7 && c7 < c8, `steps 6/7/8 should get progressively stronger, got ${c6.toFixed(2)}/${c7.toFixed(2)}/${c8.toFixed(2)}`);
      });

      test(`${name} / ${mode}: the focus ring meets WCAG 1.4.11`, () => {
        const r = C.tonalRamp(hex, { mode });
        assert.ok(
          r.focusRing.ratio >= 3,
          `focus ring ${r.focusRing.hex} is only ${r.focusRing.ratio}:1 against the page`,
        );
      });

      test(`${name} / ${mode}: a filled control always has a readable label`, () => {
        const r = C.tonalRamp(hex, { mode });
        assert.ok(
          Math.abs(r.solidStrong.lc) >= 75,
          `solidStrong ${r.solidStrong.hex} only reaches Lc ${r.solidStrong.lc}`,
        );
        assert.equal(C.toOklch(r.solidStrong.hex).h.toFixed(0), C.toOklch(hex).h.toFixed(0),
          'the accessible fill must stay on the brand hue');
      });

      test(`${name} / ${mode}: a marginal solid is reported, not hidden`, () => {
        const r = C.tonalRamp(hex, { mode });
        const solidRatio = r.checks.solidOnApp.wcag.ratio;
        const labelLc = Math.abs(r.onSolid.apca);
        if (solidRatio < 3 || labelLc < 60) {
          assert.ok(r.warnings.length > 0, 'a compromised ramp must warn');
        } else {
          assert.equal(r.warnings.length, 0, `nothing wrong, so no warnings: ${r.warnings.join(' | ')}`);
        }
      });

      test(`${name} / ${mode}: hue holds across the ramp`, () => {
        const ramp = C.tonalRamp(hex, { mode });
        const base = C.toOklch(hex);
        for (const s of ramp.steps) {
          if (s.C < 0.005) continue; // hue is meaningless at near-zero chroma
          const d = Math.min(Math.abs(s.h - base.h), 360 - Math.abs(s.h - base.h));
          assert.ok(d < 1, `step ${s.step} drifted ${d.toFixed(2)} degrees off the brand hue`);
        }
      });
    }
  }

  test('the step roles are documented, in order, and complete', () => {
    assert.equal(C.STEP_ROLES.length, 12);
    C.STEP_ROLES.forEach((r, i) => {
      assert.equal(r.step, i + 1);
      assert.ok(r.role.length > 0 && r.use.length > 0);
    });
  });

  test('neutral ramps carry a trace of the brand hue, not pure grey', () => {
    const n = C.neutralRamp('#2563EB', { mode: 'light' });
    assert.ok(n.steps[8].C > 0, 'neutrals should be tinted');
    assert.ok(n.steps[8].C < 0.02, 'but only just');
  });

  test('is deterministic', () => {
    assert.deepEqual(C.tonalRamp('#2563EB'), C.tonalRamp('#2563EB'));
  });
});

describe('harmony', () => {
  test('complementary lands opposite on the hue circle', () => {
    const [c] = C.harmonise('#2563EB', 'complementary');
    const base = C.toOklch('#2563EB');
    const got = C.toOklch(c.hex);
    const d = Math.min(Math.abs(got.h - base.h), 360 - Math.abs(got.h - base.h));
    close(d, 180, 1.5);
  });

  test('accents share lightness so none shouts louder', () => {
    const base = C.toOklch('#2563EB');
    for (const a of C.harmonise('#2563EB', 'triadic')) {
      close(C.toOklch(a.hex).L, base.L, 0.01);
    }
  });

  test('never leaves sRGB', () => {
    for (const scheme of ['complementary', 'analogous', 'split-complementary', 'triadic', 'tetradic']) {
      for (const a of C.harmonise('#16A34A', scheme)) {
        assert.match(a.hex, /^#[0-9A-F]{6}$/);
        assert.ok(C.inSrgbGamut(C.toOklch(a.hex)));
      }
    }
  });

  test('honours a count limit', () => {
    assert.equal(C.harmonise('#2563EB', 'tetradic', { count: 2 }).length, 2);
  });

  test('rejects an unknown scheme', () => {
    assert.throws(() => C.harmonise('#2563EB', 'vibes'), TypeError);
  });
});

describe('accessibleSolid', () => {
  test('leaves a colour alone when its label already survives', () => {
    const a = C.accessibleSolid('#2563EB');
    assert.equal(a.adjusted, false);
    assert.equal(a.hex, '#2563EB');
    assert.equal(a.moved, 0);
  });

  test('nudges an awkward mid-lightness colour until the label works', () => {
    const a = C.accessibleSolid('#16A34A');
    assert.equal(a.adjusted, true);
    assert.ok(Math.abs(a.lc) >= 75, `expected Lc >= 75, got ${a.lc}`);
    assert.ok(a.moved > 0 && a.moved < 0.2, 'should be a small move, not a different colour');
  });

  test('moves as little as possible', () => {
    // Walking one step further from the seed than necessary would still pass,
    // so check that the returned colour is genuinely near the boundary.
    const seed = '#0D9488';
    const a = C.accessibleSolid(seed);
    const base = C.toOklch(seed);
    const back = C.toOklch(a.hex);
    const nudged = C.oklchToHex({ L: back.L + (back.L > base.L ? -0.02 : 0.02), C: back.C, h: back.h });
    assert.ok(Math.abs(C.apcaContrast(a.text, nudged)) < 75, 'should sit just past the threshold');
  });

  test('keeps hue and honours a custom target', () => {
    const a = C.accessibleSolid('#EA580C', { targetLc: 90 });
    assert.ok(Math.abs(a.lc) >= 90);
    const d = Math.abs(C.toOklch(a.hex).h - C.toOklch('#EA580C').h);
    assert.ok(Math.min(d, 360 - d) < 1.5, 'hue must hold');
  });

  test('reports honestly when the target cannot be reached on this hue', () => {
    const a = C.accessibleSolid('#808080', { targetLc: 200 });
    assert.equal(a.unreachable, true);
  });
});
