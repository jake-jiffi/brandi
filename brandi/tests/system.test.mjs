import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../scripts/system.mjs';
import * as C from '../scripts/color.mjs';

const SEEDS = ['#2563EB', '#16A34A', '#DC2626', '#FACC15', '#0B2545', '#C026D3', '#0D9488'];

describe('buildSystem: input validation', () => {
  test('demands a primary colour', () => {
    assert.throws(() => S.buildSystem({}), TypeError);
  });

  test('rejects unknown stances', () => {
    assert.throws(() => S.buildSystem({ primary: '#000', shape: 'blobby' }), TypeError);
    assert.throws(() => S.buildSystem({ primary: '#000', motion: 'chaotic' }), TypeError);
  });

  test('rejects a spacing base that fights every UI kit', () => {
    assert.throws(() => S.buildSystem({ primary: '#000', spaceBase: 5 }), RangeError);
    assert.throws(() => S.buildSystem({ primary: '#000', spaceBase: 10 }), RangeError);
  });

  test('refuses a third accent', () => {
    assert.throws(() => S.buildSystem({ primary: '#000', accentCount: 3 }), RangeError);
    assert.throws(() => S.buildSystem({ primary: '#000', accentCount: -1 }), RangeError);
  });

  test('rejects a colour it cannot parse', () => {
    assert.throws(() => S.buildSystem({ primary: 'brand blue' }), TypeError);
  });
});

describe('buildSystem: structure', () => {
  const sys = S.buildSystem({ primary: '#2563EB', type: { display: 'Fraunces', body: 'Source Sans 3' } });

  test('produces every palette family with both themes', () => {
    for (const family of ['brand', 'neutral', 'accent1']) {
      assert.ok(sys.palettes[family], `missing ${family}`);
      assert.equal(sys.palettes[family].light.steps.length, 12);
      assert.equal(sys.palettes[family].dark.steps.length, 12);
    }
  });

  test('produces all four status families', () => {
    assert.deepEqual(Object.keys(sys.status).sort(), ['danger', 'info', 'success', 'warning']);
  });

  test('status colours keep their learned hues', () => {
    assert.ok(Math.abs(C.toOklch(sys.status.danger.seed).h - S.STATUS_HUES.danger) < 2, 'danger must stay red');
    assert.ok(Math.abs(C.toOklch(sys.status.success.seed).h - S.STATUS_HUES.success) < 2, 'success must stay green');
  });

  test('status colours borrow the brand saturation level', () => {
    const muted = S.buildSystem({ primary: '#6B7280' });
    const vivid = S.buildSystem({ primary: '#7C3AED' });
    assert.ok(
      C.toOklch(muted.status.danger.seed).C < C.toOklch(vivid.status.danger.seed).C,
      'a muted brand should get muted status colours',
    );
  });

  test('accents are derived when not supplied, and honoured when they are', () => {
    const derived = S.buildSystem({ primary: '#2563EB', accentCount: 2 });
    assert.ok(derived.palettes.accent1 && derived.palettes.accent2);
    const explicit = S.buildSystem({ primary: '#2563EB', accents: ['#F97316'] });
    assert.equal(explicit.palettes.accent1.seed, '#F97316');
    assert.equal(explicit.meta.harmony, 'explicit');
  });

  test('an accentless brand is allowed', () => {
    const none = S.buildSystem({ primary: '#2563EB', accentCount: 0 });
    assert.equal(none.palettes.accent1, undefined);
    assert.equal(none.audit.ok, true);
  });

  test('spacing is named by pixel value and sits on the grid', () => {
    for (const s of sys.space) {
      assert.equal(s.name, String(s.px));
      assert.equal(s.rem, Number((s.px / 16).toFixed(4)));
    }
    assert.ok(sys.space.some((s) => s.px === 16));
  });

  test('an 8px base produces a coarser scale than a 4px base', () => {
    const four = S.buildSystem({ primary: '#2563EB', spaceBase: 4 });
    const eight = S.buildSystem({ primary: '#2563EB', spaceBase: 8 });
    assert.ok(eight.space.length < four.space.length);
    assert.ok(!eight.space.some((s) => s.px === 2), '8px systems have no 2px step');
  });

  test('the shape stance drives the whole radius ramp', () => {
    const sharp = S.buildSystem({ primary: '#2563EB', shape: 'sharp' });
    assert.ok(sharp.radius.filter((r) => r.name !== 'full').every((r) => r.px === 0), 'sharp means sharp everywhere');
    const pill = S.buildSystem({ primary: '#2563EB', shape: 'pill' });
    assert.ok(pill.radius.find((r) => r.name === 'md').px > sharp.radius.find((r) => r.name === 'md').px);
    assert.equal(pill.radius.at(-1).name, 'full');
  });

  test('the motion stance scales every duration', () => {
    const still = S.buildSystem({ primary: '#2563EB', motion: 'still' });
    assert.ok(still.motion.durations.every((d) => d.ms === 0));
    const lively = S.buildSystem({ primary: '#2563EB', motion: 'lively' });
    const fluid = S.buildSystem({ primary: '#2563EB', motion: 'fluid' });
    assert.ok(
      lively.motion.durations.find((d) => d.name === 'base').ms >
        fluid.motion.durations.find((d) => d.name === 'base').ms,
    );
  });

  test('shadows are tinted with the brand hue, never pure black', () => {
    for (const e of sys.elevation) {
      if (e.value === 'none') continue;
      assert.ok(!/rgb\(0 0 0/.test(e.value), `${e.name} uses a flat black shadow`);
      assert.match(e.value, /rgb\(\d+ \d+ \d+ \/ [\d.]+\)/);
    }
  });

  test('is deterministic', () => {
    assert.deepEqual(S.buildSystem({ primary: '#2563EB' }), S.buildSystem({ primary: '#2563EB' }));
  });
});

describe('semantic layer', () => {
  const sys = S.buildSystem({ primary: '#2563EB' });

  test('light and dark expose exactly the same keys', () => {
    assert.deepEqual(Object.keys(sys.semantic.light).sort(), Object.keys(sys.semantic.dark).sort());
  });

  test('almost everything is an alias, not a raw value', () => {
    const raw = Object.entries(sys.semantic.light).filter(([, v]) => !String(v).startsWith('{'));
    // The only legitimate exceptions are the two values computed from contrast
    // rather than picked from a ramp.
    assert.deepEqual(raw.map(([k]) => k).sort(), ['accent.on-solid', 'accent.solid-strong']);
  });

  test('every alias resolves to a real colour', () => {
    for (const mode of ['light', 'dark']) {
      for (const [key, value] of Object.entries(sys.semantic[mode])) {
        const hex = S.resolveToken(value, sys, mode);
        assert.match(hex, /^#[0-9A-F]{6}$/i, `${mode} ${key} did not resolve (${value})`);
      }
    }
  });

  test('a role may point at a different step in each theme', () => {
    // A raised surface sits on step 1 in light and step 2 in dark: cards go
    // lighter than the page in dark mode, not darker.
    assert.notEqual(sys.semantic.light['surface.raised'], sys.semantic.dark['surface.raised']);
  });

  test('resolveToken leaves non-aliases alone', () => {
    assert.equal(S.resolveToken('#ABCDEF', sys), '#ABCDEF');
    assert.equal(S.resolveToken('{space.4}', sys), '{space.4}');
  });
});

describe('audit', () => {
  for (const seed of SEEDS) {
    test(`${seed}: the system passes its own accessibility checks`, () => {
      const sys = S.buildSystem({ primary: seed, type: { display: 'Fraunces', body: 'Source Sans 3' } });
      const errors = sys.audit.findings.filter((f) => f.level === 'error');
      assert.equal(errors.length, 0, errors.map((e) => `${e.area}: ${e.message}`).join('\n'));
      assert.equal(sys.audit.ok, true);
    });

    test(`${seed}: body text really does clear AA in both themes`, () => {
      const sys = S.buildSystem({ primary: seed });
      for (const mode of ['light', 'dark']) {
        const fg = S.resolveToken(sys.semantic[mode]['text.primary'], sys, mode);
        const bg = S.resolveToken(sys.semantic[mode]['surface.page'], sys, mode);
        assert.ok(C.contrastRatio(fg, bg) >= 4.5, `${seed} ${mode}: ${C.contrastRatio(fg, bg).toFixed(2)}:1`);
      }
    });
  }

  test('always notes that success and danger need more than colour', () => {
    const sys = S.buildSystem({ primary: '#2563EB' });
    assert.ok(
      sys.audit.findings.some((f) => f.area.startsWith('colour-vision') && /icon and a word/.test(f.fix)),
      'the system must say colour alone is not enough for status',
    );
  });

  test('reports missing typefaces rather than pretending they were chosen', () => {
    const sys = S.buildSystem({ primary: '#2563EB' });
    assert.ok(sys.audit.findings.some((f) => f.area === 'type' && /No typefaces/.test(f.message)));
  });

  test('surfaces the palette warnings it was given', () => {
    const sys = S.buildSystem({ primary: '#FACC15' });
    assert.ok(sys.audit.findings.some((f) => f.area.startsWith('palette')), 'a bright yellow brand has caveats');
  });
});

describe('concentricRadius', () => {
  test('an inner corner is the outer radius minus the gap', () => {
    assert.equal(S.concentricRadius(16, 4), 12);
    assert.equal(S.concentricRadius(12, 12), 0);
  });
  test('never goes negative', () => {
    assert.equal(S.concentricRadius(4, 12), 0);
  });
});

describe('stances are documented', () => {
  test('every shape and motion stance explains itself', () => {
    for (const [name, s] of Object.entries(S.SHAPE_STANCES)) {
      assert.ok(s.note.length > 20, `${name} needs guidance, not just a number`);
    }
    for (const [name, m] of Object.entries(S.MOTION_STANCES)) {
      assert.ok(m.note.length > 20, `${name} needs guidance`);
    }
  });
});
