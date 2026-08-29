/**
 * Property tests over the colour and system engines.
 *
 * Example tests prove the cases someone thought of. These prove the properties
 * that must hold for every input, using a seeded generator so a failure is
 * reproducible rather than a one-off that vanishes on the next run.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../scripts/color.mjs';
import * as T from '../scripts/type.mjs';
import { buildSystem, resolveToken, SHAPE_STANCES, MOTION_STANCES } from '../scripts/system.mjs';
import { toDtcg, toCss } from '../scripts/tokens.mjs';
import { specificationSheets } from '../scripts/artboards.mjs';
import { validateArtboard } from '../scripts/canvas.mjs';

/** mulberry32: small, fast, and deterministic from a seed. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randomHex = (r) =>
  '#' + [0, 0, 0].map(() => Math.floor(r() * 256).toString(16).padStart(2, '0')).join('').toUpperCase();

const finite = (n) => Number.isFinite(n);

describe('colour: properties that hold for every colour', () => {
  test('nothing ever produces NaN or Infinity', () => {
    const r = rng(1);
    for (let i = 0; i < 3000; i++) {
      const hex = randomHex(r);
      const lch = C.toOklch(hex);
      assert.ok(finite(lch.L) && finite(lch.C) && finite(lch.h), `${hex} -> ${JSON.stringify(lch)}`);
      assert.ok(finite(C.relativeLuminance(hex)));
      assert.ok(finite(C.contrastRatio(hex, '#FFFFFF')));
      assert.ok(finite(C.apcaContrast(hex, '#FFFFFF')));
      assert.ok(finite(C.apcaContrast('#FFFFFF', hex)));
    }
  });

  test('hex round trips exactly, for every colour', () => {
    const r = rng(2);
    for (let i = 0; i < 3000; i++) {
      const hex = randomHex(r);
      assert.equal(C.oklchToHex(C.toOklch(hex)), hex, `round trip failed for ${hex}`);
    }
  });

  test('WCAG contrast stays inside 1 to 21 and is symmetric', () => {
    const r = rng(3);
    for (let i = 0; i < 2000; i++) {
      const a = randomHex(r);
      const b = randomHex(r);
      const ab = C.contrastRatio(a, b);
      assert.ok(ab >= 1 - 1e-9 && ab <= 21 + 1e-9, `${a}/${b} gave ${ab}`);
      assert.ok(Math.abs(ab - C.contrastRatio(b, a)) < 1e-12);
    }
  });

  test('APCA stays inside its documented range and is signed by polarity', () => {
    const r = rng(4);
    for (let i = 0; i < 2000; i++) {
      const text = randomHex(r);
      const bg = randomHex(r);
      const lc = C.apcaContrast(text, bg);
      assert.ok(Math.abs(lc) <= 108, `${text} on ${bg} gave Lc ${lc}`);
      if (lc !== 0) {
        const lighterBg = C.relativeLuminance(bg) > C.relativeLuminance(text);
        // Sign follows which side is lighter. Near-identical luminance is
        // clipped to zero, which is why zero is excluded above.
        if (Math.abs(C.relativeLuminance(bg) - C.relativeLuminance(text)) > 0.02) {
          assert.equal(lc > 0, lighterBg, `${text} on ${bg}: Lc ${lc} disagrees with which is lighter`);
        }
      }
    }
  });

  test('gamut mapping always terminates in gamut, and never moves hue or lightness', () => {
    const r = rng(5);
    for (let i = 0; i < 2000; i++) {
      const lch = { L: r(), C: r() * 0.5, h: r() * 360 };
      const mapped = C.gamutMapOklch(lch);
      assert.ok(C.inSrgbGamut(mapped), `${JSON.stringify(lch)} mapped to ${JSON.stringify(mapped)}, still out`);
      assert.ok(mapped.C <= lch.C + 1e-9, 'chroma may only be reduced');
      if (lch.L > 0 && lch.L < 1) {
        assert.ok(Math.abs(mapped.L - lch.L) < 1e-9, 'lightness must not move');
        assert.ok(Math.abs(mapped.h - lch.h) < 1e-9, 'hue must not move');
      }
    }
  });

  test('maxChroma is the boundary, from both sides', () => {
    const r = rng(6);
    for (let i = 0; i < 600; i++) {
      const L = 0.02 + r() * 0.96;
      const h = r() * 360;
      const c = C.maxChroma(L, h);
      assert.ok(finite(c) && c >= 0);
      assert.ok(C.inSrgbGamut({ L, C: c, h }), `L${L} h${h} c${c} should fit`);
      assert.ok(!C.inSrgbGamut({ L, C: c + 0.005, h }), `L${L} h${h} c${c}+0.005 should not fit`);
    }
  });

  test('bestTextOn always picks the better option by whichever metric was asked for', () => {
    const r = rng(7);
    for (let i = 0; i < 1500; i++) {
      const bg = randomHex(r);
      const byWcag = C.bestTextOn(bg, ['#FFFFFF', '#000000'], { metric: 'wcag' });
      const otherW = byWcag.color === '#FFFFFF' ? '#000000' : '#FFFFFF';
      assert.ok(C.contrastRatio(byWcag.color, bg) >= C.contrastRatio(otherW, bg) - 1e-9, `wrong WCAG pick on ${bg}`);

      const byApca = C.bestTextOn(bg);
      const otherA = byApca.color === '#FFFFFF' ? '#000000' : '#FFFFFF';
      assert.ok(
        Math.abs(C.apcaContrast(byApca.color, bg)) >= Math.abs(C.apcaContrast(otherA, bg)) - 1e-9,
        `wrong APCA pick on ${bg}`,
      );
    }
  });

  test('CVD simulation never leaves sRGB and never crashes', () => {
    const r = rng(8);
    for (let i = 0; i < 1200; i++) {
      const hex = randomHex(r);
      for (const type of ['protanopia', 'deuteranopia', 'tritanopia']) {
        const out = C.simulateCvd(hex, type);
        assert.match(out, /^#[0-9A-F]{6}$/, `${hex} ${type} -> ${out}`);
      }
    }
  });

  test('accessibleSolid either reaches the target or says it cannot', () => {
    const r = rng(9);
    for (let i = 0; i < 800; i++) {
      const hex = randomHex(r);
      const a = C.accessibleSolid(hex);
      assert.match(a.hex, /^#[0-9A-F]{6}$/);
      if (!a.unreachable) {
        assert.ok(Math.abs(a.lc) >= 75 - 0.5, `${hex} -> ${a.hex} only Lc ${a.lc}`);
      }
    }
  });
});

describe('ramps: properties that hold for every seed', () => {
  test('every seed produces a usable ramp in both themes', () => {
    const r = rng(10);
    for (let i = 0; i < 250; i++) {
      const seed = randomHex(r);
      for (const mode of ['light', 'dark']) {
        const ramp = C.tonalRamp(seed, { mode });
        assert.equal(ramp.steps.length, 12);

        const surfaces = ramp.steps.slice(0, 8).map((s) => s.L);
        for (let j = 1; j < surfaces.length; j++) {
          const ok = mode === 'light' ? surfaces[j] < surfaces[j - 1] : surfaces[j] > surfaces[j - 1];
          assert.ok(ok, `${seed} ${mode}: surface zone not monotonic at step ${j + 1}`);
        }

        for (const s of ramp.steps) {
          assert.match(s.hex, /^#[0-9A-F]{6}$/);
          assert.ok(C.inSrgbGamut({ L: s.L, C: s.C, h: s.h }), `${seed} ${mode} step ${s.step} out of gamut`);
          assert.equal(C.oklchToHex({ L: s.L, C: s.C, h: s.h }), s.hex, `${seed} ${mode} step ${s.step} hex disagrees with oklch`);
        }

        assert.ok(
          ramp.checks.textHighOnApp.wcag.AAA,
          `${seed} ${mode}: step 12 on step 1 is only ${ramp.checks.textHighOnApp.wcag.ratio}`,
        );
        assert.ok(
          ramp.checks.textLowOnApp.wcag.AA,
          `${seed} ${mode}: step 11 on step 1 is only ${ramp.checks.textLowOnApp.wcag.ratio}`,
        );
        assert.ok(ramp.focusRing.ratio >= 3, `${seed} ${mode}: focus ring only ${ramp.focusRing.ratio}:1`);
        assert.ok(Math.abs(ramp.solidStrong.lc) >= 75 - 0.5 || ramp.solidStrong.unreachable, `${seed} ${mode}: solidStrong Lc ${ramp.solidStrong.lc}`);
      }
    }
  });
});

describe('type: properties that hold for every configuration', () => {
  test('any base and ratio produce a usable, ordered, legible scale', () => {
    const r = rng(11);
    const ratios = Object.keys(T.RATIOS);
    for (let i = 0; i < 400; i++) {
      const basePx = 12 + Math.floor(r() * 10);
      const ratio = ratios[Math.floor(r() * ratios.length)];
      const scale = T.typeScale({ basePx, ratio });
      assert.ok(scale.steps.length >= 7, `${basePx}px ${ratio} left only ${scale.steps.length} steps`);
      for (let j = 1; j < scale.steps.length; j++) {
        assert.ok(scale.steps[j].px > scale.steps[j - 1].px, 'sizes must increase');
      }
      for (const s of scale.steps) {
        assert.ok(s.px >= T.FLOORS.anyScreenPx, `${s.name} at ${s.px}px is below the floor`);
        assert.ok(finite(s.lineHeight) && s.lineHeight >= 1 && s.lineHeight <= 2);
        assert.match(s.clamp, /^clamp\(/);
      }
      assert.equal(scale.byName.base.px, basePx);
    }
  });

  test('every fluid clamp hits its endpoints', () => {
    const r = rng(12);
    for (let i = 0; i < 500; i++) {
      const min = 10 + r() * 40;
      const max = min + r() * 60;
      const minVw = 320 + r() * 200;
      const maxVw = minVw + 200 + r() * 1200;
      const css = T.fluid(min, max, { minVw, maxVw });
      const m = /clamp\(([\d.]+)rem, (-?[\d.]+)rem \+ ([\d.]+)vw, ([\d.]+)rem\)/.exec(css);
      assert.ok(m, `unexpected shape: ${css}`);
      const [, lo, intercept, vw, hi] = m.map(Number);
      assert.ok(lo <= hi, 'clamp bounds must be ordered');
      assert.ok(Math.abs(intercept * 16 + (vw / 100) * minVw - min) < 0.05, `wrong at minVw: ${css}`);
      assert.ok(Math.abs(intercept * 16 + (vw / 100) * maxVw - max) < 0.05, `wrong at maxVw: ${css}`);
    }
  });
});

describe('the whole system, for arbitrary brands', () => {
  test('any combination of choices builds, audits clean, and emits valid artefacts', () => {
    const r = rng(13);
    const shapes = Object.keys(SHAPE_STANCES);
    const motions = Object.keys(MOTION_STANCES);
    const ratios = Object.keys(T.RATIOS);
    for (let i = 0; i < 60; i++) {
      const input = {
        primary: randomHex(r),
        accentCount: Math.floor(r() * 3),
        shape: shapes[Math.floor(r() * shapes.length)],
        motion: motions[Math.floor(r() * motions.length)],
        spaceBase: r() < 0.5 ? 4 : 8,
        neutralChroma: r() * 0.02,
        type: {
          display: 'Bitter',
          body: 'Karla',
          mono: 'JetBrains Mono',
          basePx: 15 + Math.floor(r() * 4),
          ratio: ratios[Math.floor(r() * ratios.length)],
        },
      };
      const sys = buildSystem(input);
      const label = JSON.stringify(input);

      assert.equal(sys.audit.errors, 0, `${label}\n${JSON.stringify(sys.audit.findings, null, 1)}`);

      // Every semantic token resolves, in both themes.
      for (const mode of ['light', 'dark']) {
        for (const [key, value] of Object.entries(sys.semantic[mode])) {
          assert.match(resolveToken(value, sys, mode), /^#[0-9A-F]{6}$/i, `${label}: ${mode} ${key}`);
        }
      }

      // The CSS is structurally sound and self-consistent.
      const css = toCss(sys);
      assert.equal((css.match(/\{/g) ?? []).length, (css.match(/\}/g) ?? []).length, `${label}: unbalanced CSS`);
      assert.equal(/\{color\./.test(css), false, `${label}: unresolved alias leaked into CSS`);
      const declared = new Set([...css.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]));
      for (const m of css.matchAll(/var\((--[\w-]+)\)/g)) {
        assert.ok(declared.has(m[1]), `${label}: ${m[1]} used but never declared`);
      }

      // The tokens serialise and every alias points somewhere real.
      const dtcg = toDtcg(sys);
      assert.doesNotThrow(() => JSON.parse(JSON.stringify(dtcg)), `${label}: DTCG not serialisable`);
      const get = (p) => p.split('.').reduce((o, k) => o?.[k], dtcg);
      const walk = (node) => {
        if (node && typeof node === 'object' && '$value' in node) {
          const vals = typeof node.$value === 'object' && !Array.isArray(node.$value) ? Object.values(node.$value) : [node.$value];
          for (const v of vals) {
            if (typeof v === 'string' && v.startsWith('{')) {
              assert.ok(get(v.slice(1, -1)), `${label}: dangling alias ${v}`);
            }
          }
          return;
        }
        for (const [k, v] of Object.entries(node ?? {})) if (!k.startsWith('$')) walk(v);
      };
      walk(dtcg);
    }
  });

  test('the specification sheets stay valid for arbitrary brands', () => {
    const r = rng(14);
    for (let i = 0; i < 20; i++) {
      const sys = buildSystem({
        primary: randomHex(r),
        accentCount: Math.floor(r() * 3),
        type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' },
      });
      for (const sheet of specificationSheets(sys, { brandName: 'Test' })) {
        const v = validateArtboard(sheet.source, { name: sheet.file });
        assert.equal(v.ok, true, `${sys.palettes.brand.seed} ${sheet.file}: ${JSON.stringify(v.errors)}`);
        assert.deepEqual(v.warnings, [], `${sys.palettes.brand.seed} ${sheet.file}: ${JSON.stringify(v.warnings)}`);
      }
    }
  });
});
