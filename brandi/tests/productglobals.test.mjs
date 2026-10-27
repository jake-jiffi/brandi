import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { toStarterGlobals, SHADCN } from '../scripts/productglobals.mjs';
import { buildProductTokens } from '../scripts/producttokens.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { systemInputFromBrand } from '../scripts/brandfile.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const brand = JSON.parse(readFileSync(path.join(ROOT, 'tests', 'fixtures', 'muddy-paws.json'), 'utf8'));
const tokens = buildProductTokens(buildSystem(systemInputFromBrand(brand)), { name: 'Muddy Paws product system' });
const css = toStarterGlobals(tokens);
const section = (from, to) => css.slice(css.indexOf(from), to ? css.indexOf(to, css.indexOf(from)) : undefined);

describe('toStarterGlobals', () => {
  test('declares every colour token in light, with aliases as var() references', () => {
    const light = section(':root,\n[data-theme="light"] {', '.dark,');
    for (const t of tokens.color.tokens) assert.ok(light.includes(`  --${t.name}: `), `light is missing ${t.name}`);
    assert.match(light, /--rail: var\(--surface\);/);
    assert.equal(/undefined|NaN|\{[a-z-]+\}/.test(css), false);
  });

  test('re-declares aliases in dark, so they resolve inside the dark scope rather than picking up light', () => {
    const dark = section('.dark,\n[data-theme="dark"] {', ':root {');
    assert.match(dark, /--rail: var\(--surface\);/);
    assert.match(dark, /--chart-track: var\(--surface-sunken\);/);
  });

  test('points every shadcn variable at a product role', () => {
    for (const [name, role] of SHADCN) assert.ok(css.includes(`  --${name}: var(--${role});`), `${name} is not mapped to ${role}`);
  });

  test('removes Tailwind\'s palette and never turns brand-* values into utilities', () => {
    const theme = section('@theme inline {', '/* 5.');
    assert.match(theme, /--color-\*: initial;/);
    assert.equal(/--color-brand-(?!hover:)/.test(theme), false, 'no brand value becomes a utility');
    assert.match(theme, /--color-brand-hover: var\(--brand-hover\);/, 'brand-hover is a role, so hover:bg-brand-hover works');
    assert.match(theme, /--color-text-muted: var\(--text-muted\);/);
  });

  test('writes a type utility per style, with tabular figures on figures and uppercase only on eyebrows', () => {
    for (const g of tokens.type.groups) for (const s of g.styles) assert.ok(css.includes(`@utility type-${s.name} {`), `no utility for ${s.name}`);
    assert.match(section('@utility type-kpi {', '}'), /tabular-nums/);
    assert.match(section('@utility type-eyebrow {', '}'), /text-transform: uppercase/);
    assert.equal(/text-transform/.test(section('@utility type-body {', '}')), false);
  });

  test('draws focus as an outline with an offset, and as CanvasText in forced colours', () => {
    assert.match(section('@layer base {'), /:focus-visible \{\n {4}outline: var\(--focus-width\) solid var\(--focus\);\n {4}outline-offset: var\(--focus-offset\);/);
    assert.match(section('@media (forced-colors: active) {'), /outline: 2px solid CanvasText;/);
  });

  test('uses next/font\'s variable for the brand\'s faces, and the plain stack where the brand has none', () => {
    assert.match(css, /--font-sans: var\(--font-brand-sans, Karla\), ui-sans-serif/, 'the face is the variable\'s fallback, so a board without next/font still gets it');
    const noMono = buildProductTokens(buildSystem({ primary: '#1F6F4A', type: { display: 'Bitter', body: 'Karla' } }));
    const out = toStarterGlobals(noMono);
    assert.match(out, /--font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;/);
  });

  test('refuses tokens that lack a role shadcn needs, rather than writing a dangling variable', () => {
    const broken = structuredClone(tokens);
    broken.color.tokens = broken.color.tokens.filter((t) => t.name !== 'line-control');
    assert.throws(() => toStarterGlobals(broken), /line-control/);
  });

  test('is deterministic', () => {
    assert.equal(toStarterGlobals(tokens), css);
  });
});

describe('the file runs on its own, as a product\'s tools/build-globals.mjs', () => {
  test('writes globals.css from a tokens file, and --check catches a hand edit', async () => {
    const { mkdtemp, writeFile, readFile, copyFile, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const run = promisify(execFile);
    const dir = await mkdtemp(path.join(tmpdir(), 'brandi-globals-'));
    try {
      // Copied out of the plugin, the way a product carries it.
      const tool = path.join(dir, 'build-globals.mjs');
      await copyFile(path.join(ROOT, 'scripts', 'productglobals.mjs'), tool);
      await writeFile(path.join(dir, 'tokens.json'), JSON.stringify(tokens));
      await run(process.execPath, [tool, path.join(dir, 'tokens.json'), path.join(dir, 'globals.css')]);
      assert.equal(await readFile(path.join(dir, 'globals.css'), 'utf8'), css);
      await run(process.execPath, [tool, path.join(dir, 'tokens.json'), path.join(dir, 'globals.css'), '--check']);
      await writeFile(path.join(dir, 'globals.css'), css.replace('--space-4: 16px;', '--space-4: 15px;'));
      await assert.rejects(
        run(process.execPath, [tool, path.join(dir, 'tokens.json'), path.join(dir, 'globals.css'), '--check']),
        (e) => e.code === 1 && /drifted/.test(e.stderr),
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
