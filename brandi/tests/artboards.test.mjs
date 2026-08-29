import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as A from '../scripts/artboards.mjs';
import { validateArtboard, BANNED_FONTS } from '../scripts/canvas.mjs';
import { buildSystem, resolveToken } from '../scripts/system.mjs';
import { systemInputFromBrand } from '../scripts/brandfile.mjs';
import { contrastRatio } from '../scripts/color.mjs';

const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');

const SEEDS = ['#1F6F4A', '#2563EB', '#FACC15', '#0B2545', '#DC2626'];

const sys = (primary = '#1F6F4A', extra = {}) =>
  buildSystem({
    primary,
    type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' },
    ...extra,
  });

describe('googleFontsUrl', () => {
  test('builds a valid css2 url from the faces in use', () => {
    const url = A.googleFontsUrl(['Bitter', 'Karla']);
    assert.match(url, /^https:\/\/fonts\.googleapis\.com\/css2\?/);
    assert.match(url, /family=Bitter:wght@400;500;700/);
    assert.match(url, /family=Karla:wght@400;500;700/);
    assert.match(url, /&display=swap$/);
  });

  test('encodes a multi-word family the way Google Fonts expects', () => {
    assert.match(A.googleFontsUrl(['Playfair Display']), /family=Playfair\+Display/);
    assert.equal(A.googleFontsUrl(['Playfair Display']).includes('%20'), false);
  });

  test('drops empties and duplicates', () => {
    const url = A.googleFontsUrl(['Bitter', null, 'Bitter', undefined]);
    assert.equal((url.match(/family=/g) ?? []).length, 1);
  });

  test('returns null when there is nothing to load', () => {
    assert.equal(A.googleFontsUrl([]), null);
    assert.equal(A.googleFontsUrl([null, undefined]), null);
  });
});

describe('every specification sheet', () => {
  for (const seed of SEEDS) {
    const sheets = A.specificationSheets(sys(seed), { brandName: 'Acme' });

    for (const sheet of sheets) {
      test(`${seed} ${sheet.file}: passes the canvas validator with no warnings`, () => {
        const r = validateArtboard(sheet.source, { name: sheet.file });
        assert.equal(r.ok, true, JSON.stringify(r.errors, null, 1));
        assert.deepEqual(r.warnings, [], JSON.stringify(r.warnings, null, 1));
      });

      test(`${seed} ${sheet.file}: is sized and named for the canvas`, () => {
        assert.match(sheet.file, /^[A-Z][A-Za-z]*\.dc\.html$/);
        assert.ok(sheet.w > 0 && sheet.h > 0);
        assert.ok(sheet.h > 800, 'a specification sheet that short is probably clipping');
      });
    }

    test(`${seed}: the five sheets have distinct names`, () => {
      assert.equal(new Set(sheets.map((s) => s.file)).size, sheets.length);
    });
  }
});

describe('palette sheet', () => {
  const system = sys();
  const src = A.paletteArtboard(system, { brandName: 'Acme' });

  test('shows every step of every family in both themes', () => {
    const families = Object.keys({ ...system.palettes, ...system.status });
    for (const family of families) {
      for (const mode of ['light', 'dark']) {
        for (const step of system.palettes[family]?.[mode].steps ?? system.status[family][mode].steps) {
          assert.ok(src.includes(step.hex), `${family}.${step.step} ${mode} (${step.hex}) is missing`);
        }
      }
    }
  });

  test('labels every swatch with its role, not just a number', () => {
    for (const role of ['app-background', 'solid', 'text-high', 'border-subtle']) {
      assert.ok(src.includes(role), `role ${role} should be named on the sheet`);
    }
  });

  test('every swatch label is legible on its own swatch', () => {
    // The sheet picks a text colour per swatch. If that ever regressed, the
    // sheet would silently become unreadable, which is the one thing a colour
    // specification must not be.
    for (const m of src.matchAll(/background: (#[0-9A-F]{6}); color: (#[0-9A-F]{6})/g)) {
      assert.ok(contrastRatio(m[2], m[1]) >= 3, `${m[2]} on ${m[1]} is only ${contrastRatio(m[2], m[1]).toFixed(2)}:1`);
    }
  });

  test('reports measured contrast rather than claiming compliance', () => {
    assert.match(src, /WCAG 2\.2/);
    assert.match(src, /APCA/);
    assert.match(src, /\d+\.\d\d:1/);
    assert.match(src, /measured, not assumed/);
  });

  test('shows the colour vision simulation and states the rule it implies', () => {
    assert.match(src, /protanopia/);
    assert.match(src, /deuteranopia/);
    assert.match(src, /tritanopia/);
    assert.match(src, /icon and a word/);
  });

  test('warns readers off the raw ramp', () => {
    assert.match(src, /semantic tokens/);
  });
});

describe('typography sheet', () => {
  const system = sys();
  const src = A.typographyArtboard(system, { brandName: 'Acme' });

  test('lists every issued step with its size, leading and tracking', () => {
    for (const step of system.type.scale.steps) {
      assert.ok(src.includes(step.name), `step ${step.name} missing`);
      assert.ok(src.includes(String(step.px)), `size ${step.px} missing`);
      assert.ok(src.includes(String(step.lineHeight)), `line height for ${step.name} missing`);
    }
  });

  test('names the faces and loads them from the one permitted host', () => {
    assert.ok(src.includes('Bitter') && src.includes('Karla'));
    assert.match(src, /https:\/\/fonts\.googleapis\.com\/css2/);
  });

  test('says which steps were dropped and why, rather than hiding the gap', () => {
    const tight = buildSystem({ primary: '#1F6F4A', type: { display: 'Bitter', body: 'Karla', ratio: 'perfect-fifth' } });
    assert.ok(tight.type.scale.dropped.length > 0, 'this ratio should drop a step');
    const s = A.typographyArtboard(tight);
    assert.match(s, /Steps not issued/);
    assert.ok(s.includes(tight.type.scale.dropped[0].name));
  });

  test('demonstrates the measure at the measure', () => {
    assert.ok(src.includes(system.type.measure.css));
    assert.match(src, /Bringhurst/);
  });

  test('handles a system with no typefaces chosen without breaking', () => {
    const bare = buildSystem({ primary: '#1F6F4A' });
    const s = A.typographyArtboard(bare);
    assert.equal(validateArtboard(s).ok, true);
    assert.match(s, /not chosen/);
  });
});

describe('components sheet', () => {
  const system = sys();

  for (const mode of ['light', 'dark']) {
    const src = A.componentsArtboard(system, { brandName: 'Acme', mode });

    test(`${mode}: draws every button state`, () => {
      for (const state of ['rest', 'hover', 'active', 'focus', 'disabled']) {
        assert.ok(src.includes(`>${state}<`), `state ${state} missing`);
      }
    });

    test(`${mode}: draws every field state, including error and disabled`, () => {
      for (const state of ['rest', 'focus', 'error', 'disabled']) {
        assert.ok(src.includes(`>${state}<`), `field state ${state} missing`);
      }
    });

    test(`${mode}: the error message says what happened, not "invalid input"`, () => {
      assert.match(src, /missing an @ symbol/);
      assert.equal(/invalid input/i.test(src.replace(/They do not apologise[^<]*/g, '')), false);
    });

    test(`${mode}: uses the accessible fill for the primary button, not the raw brand colour`, () => {
      assert.ok(src.includes(system.palettes.brand[mode].solidStrong.hex));
    });

    test(`${mode}: every status carries an icon and a word`, () => {
      for (const status of ['Danger', 'Warning', 'Success', 'Info']) {
        assert.ok(src.includes(status), `${status} missing`);
      }
      assert.equal((src.match(/<svg /g) ?? []).length >= 4, true, 'each status needs a drawn icon');
      assert.equal(/[\u{1F300}-\u{1FAFF}]/u.test(src), false, 'icons are drawn, never emoji');
    });

    test(`${mode}: the focus state shows a real focus ring`, () => {
      assert.ok(src.includes(`outline: 2px solid ${resolveToken(system.semantic[mode]['focus.ring'], system, mode)}`));
    });

    test(`${mode}: shadows are tinted, never flat black`, () => {
      assert.equal(/rgb\(0 0 0/.test(src), false);
    });
  }

  test('the two modes really differ', () => {
    const light = A.componentsArtboard(system, { mode: 'light' });
    const dark = A.componentsArtboard(system, { mode: 'dark' });
    assert.notEqual(light, dark);
    assert.ok(dark.includes(resolveToken(system.semantic.dark['surface.page'], system, 'dark')));
  });
});

describe('token sheet', () => {
  const system = sys();
  const src = A.tokenSheetArtboard(system, { brandName: 'Acme' });

  test('lists every semantic token by its CSS custom property name', () => {
    for (const key of Object.keys(system.semantic.light)) {
      assert.ok(src.includes(`--${key.replace(/\./g, '-')}`), `${key} missing`);
    }
  });

  test('shows both themes for every token', () => {
    const swatchPairs = [...src.matchAll(/width: 14px; height: 14px; background: (#[0-9A-F]{6})/g)];
    assert.ok(swatchPairs.length >= Object.keys(system.semantic.light).length * 2 - 4);
  });

  test('lists the spacing, radius and motion scales', () => {
    assert.ok(src.includes('--space-16'));
    assert.ok(src.includes('--radius-md'));
    assert.ok(src.includes('--duration-base'));
    assert.ok(src.includes('--ease-standard'));
  });
});

describe('house rules hold across the generated sheets', () => {
  const all = () => A.specificationSheets(sys()).map((s) => s.source).join('\n');

  test('no banned typeface is named as a primary face', () => {
    const src = all();
    for (const font of BANNED_FONTS) {
      assert.equal(
        new RegExp(`font-family: *'?${font}'?[,;]`, 'i').test(src),
        false,
        `${font} is used as a primary face`,
      );
    }
  });

  test('no emoji anywhere', () => {
    assert.equal(/\p{Extended_Pictographic}/u.test(all()), false);
  });

  test('no lorem ipsum and no filler headline', () => {
    assert.equal(/lorem ipsum/i.test(all()), false);
    assert.equal(/Welcome to our/i.test(all()), false);
  });

  test('every sheet sets its own background, so surplus frame is not transparent', () => {
    for (const sheet of A.specificationSheets(sys())) {
      assert.match(sheet.source, /body \{[\s\S]*?background: #[0-9A-F]{6}/, `${sheet.file} has no background`);
    }
  });

  test('generation is deterministic', () => {
    assert.equal(A.paletteArtboard(sys()), A.paletteArtboard(sys()));
  });
});

describe('against the worked fixture', () => {
  test('the real brand produces sheets that validate clean', async () => {
    const brand = JSON.parse(await readFile(FIXTURE, 'utf8'));
    const system = buildSystem(systemInputFromBrand(brand));
    for (const sheet of A.specificationSheets(system, { brandName: brand.meta.name })) {
      const r = validateArtboard(sheet.source, { name: sheet.file });
      assert.equal(r.ok, true, `${sheet.file}: ${JSON.stringify(r.errors)}`);
      assert.deepEqual(r.warnings, [], `${sheet.file}: ${JSON.stringify(r.warnings)}`);
      assert.ok(sheet.source.includes('Muddy Paws'), `${sheet.file} should carry the brand name`);
    }
  });
});

describe('wordmark and construction sheet', () => {
  const system = sys();
  const src = A.wordmarkArtboard(system, { brandName: 'Muddy Paws' });

  test('validates clean like every other sheet', () => {
    const r = validateArtboard(src, { name: 'Logo.dc.html' });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(r.warnings, [], JSON.stringify(r.warnings));
  });

  test('sets the name in the display face, with deliberate tracking', () => {
    assert.ok(src.includes('Muddy Paws'));
    assert.match(src, /letter-spacing: -0\.03em/);
    assert.ok(src.includes(system.type.fonts.display));
  });

  test('honours a custom tracking value', () => {
    assert.match(A.wordmarkArtboard(system, { tracking: '-0.06em' }), /letter-spacing: -0\.06em/);
  });

  test('specifies clear space as a ratio of the mark, not a fixed number', () => {
    assert.match(src, /cap height/);
    assert.match(src, /scales with the mark/);
    assert.match(src, /border: 1px dashed/);
  });

  test('is honest that the cap height is approximated', () => {
    assert.match(src, /approximated/);
    assert.match(src, /measure it against the outlined mark/);
  });

  test('shows all four treatments, including behaviour on a photograph', () => {
    for (const label of ['positive, on paper', 'reversed, on ink', 'on the brand colour', 'over a scrim']) {
      assert.ok(src.includes(label), `missing treatment: ${label}`);
    }
    assert.match(src, /\[PHOTOGRAPH\]/, 'the photograph is a marked placeholder, not a faked image');
  });

  test('shows minimum sizes at actual size, for screen and print', () => {
    assert.match(src, /36px, digital, comfortable/);
    assert.match(src, /24px, digital, minimum/);
    assert.match(src, /18px, print, minimum/);
  });

  test('draws at least eight specific misuses rather than describing them', () => {
    const misuses = [...src.matchAll(/Never ([^<]+)</g)].map((m) => m[1].trim());
    assert.ok(misuses.length >= 8, `only ${misuses.length} misuses drawn`);
    for (const expected of ['stretch', 'rotate', 'recolour', 'shadow']) {
      assert.ok(misuses.some((m) => m.includes(expected)), `${expected} should be shown`);
    }
  });

  test('the captions are English: an imperative after "Never", not a past participle', () => {
    // These shipped as "do not rotated" eight times over.
    for (const [, caption] of src.matchAll(/Never ([^<]+)</g)) {
      const verb = caption.trim().split(/[\s,:]/)[0];
      assert.doesNotMatch(verb, /ed$/, `"Never ${caption.trim()}" does not parse`);
    }
  });

  test('says a typeset wordmark is a real identity, not an apology', () => {
    assert.match(src, /real identity, not a/);
    assert.match(src, /If a drawn mark is coming/);
    assert.match(src, /16 pixels/, 'the brief must name the tests a mark has to pass');
  });

  test('joins the specification set', () => {
    const files = A.specificationSheets(system).map((s) => s.file);
    assert.ok(files.includes('Logo.dc.html'));
  });
});

/**
 * `sheets` used to write six artboards and no Main, so the tool's own output
 * failed the tool's own validator and the canvas seeder warned about the entry.
 */
describe('the contents page', () => {
  test('is the first sheet, and it is Main', () => {
    const sheets = A.specificationSheets(sys(), { brandName: 'Acme' });
    assert.equal(sheets[0].file, 'Main.dc.html');
  });

  test('states the resolved system rather than the intended one', () => {
    const src = A.specificationSheets(sys('#2563EB'), { brandName: 'Acme', version: '2.1.0' })[0].source;
    assert.match(src, /Acme design system/);
    assert.match(src, /v2\.1\.0/);
    assert.match(src, /major-third · 1\.25 · 16px base/, 'the type scale is a fact about the system');
    assert.match(src, /#[0-9A-F]{6}/, 'the primary is shown as the hex anyone will paste');
    for (const family of ['Bitter', 'Karla', 'JetBrains Mono']) {
      assert.ok(src.includes(family), `${family} is part of the system and belongs on its front page`);
    }
  });

  test('lists every other sheet in the set, so nothing is orphaned', () => {
    const sheets = A.specificationSheets(sys(), { brandName: 'Acme' });
    const contents = sheets[0].source;
    for (const s of sheets.slice(1)) {
      assert.ok(contents.includes(s.file), `${s.file} is in the set and must be on the contents page`);
    }
  });

  test('is tall enough for the longest stances, which wrap to two lines', () => {
    const wordy = buildSystem({
      primary: '#1F6F4A',
      type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' },
      shape: 'pill',
      motion: 'lively',
    });
    const [main] = A.specificationSheets(wordy, { brandName: 'A Deliberately Long Brand Name Co' });
    // Measured against the rendered page: the worst case fills about 1150px of a
    // 1286px frame. Clipping is the only failure a canvas cannot recover from.
    assert.ok(main.h >= 1250, `contents frame is ${main.h}px, which leaves no room for a wrapped row`);
  });

  test('carries the marker that says it was generated, so a rerun can replace it', () => {
    assert.ok(A.specificationSheets(sys())[0].source.includes(A.CONTENTS_MARKER));
  });

  test('is deterministic: no date, no counter, nothing that changes on a rerun', () => {
    const a = A.specificationSheets(sys(), { brandName: 'Acme', version: '1.0.0' })[0].source;
    const b = A.specificationSheets(sys(), { brandName: 'Acme', version: '1.0.0' })[0].source;
    assert.equal(a, b);
  });
});
