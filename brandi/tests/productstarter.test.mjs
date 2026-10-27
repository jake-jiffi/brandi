import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { systemIdentity, fontsModule, generatedFiles, writeStarter, buildBundle, definitionsHash, railTone, refreshKitFiles, KIT_MANIFEST, GENERATED, KIT } from '../scripts/productstarter.mjs';
import { toStarterGlobals } from '../scripts/productglobals.mjs';
import { buildProductTokens } from '../scripts/producttokens.mjs';
import { buildSystem } from '../scripts/system.mjs';

const tokens = buildProductTokens(buildSystem({ primary: '#1F6F4A', accents: ['#D9822B'], type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' } }), { name: 'Acme product system' });
const identity = systemIdentity({}, { brandName: 'Muddy Paws & Co' });

describe('who the system is', () => {
  test('the canvas folder and the bundle global come from the brand name', () => {
    assert.equal(identity.namespace, 'muddy-paws-co');
    assert.equal(identity.global, 'MuddyPawsCo');
    assert.equal(identity.locale, 'en-AU');
    assert.equal(identity.currency, 'AUD');
    assert.equal(identity.lang, 'en-AU');
  });

  test('product.json can set any of it, and a name the canvas would skip is refused', () => {
    const set = systemIdentity({ productName: 'Rosters', namespace: 'acme', global: 'Acme', locale: 'en-NZ', currency: 'NZD' }, { brandName: 'X' });
    assert.deepEqual([set.name, set.namespace, set.global, set.locale, set.currency, set.lang], ['Rosters', 'acme', 'Acme', 'en-NZ', 'NZD', 'en-NZ']);
    assert.throws(() => systemIdentity({ namespace: 'Acme Corp' }), RangeError);
    assert.throws(() => systemIdentity({ global: 'acme' }), RangeError);
  });

  test('a brand name that starts with a digit still gives a valid global', () => {
    assert.match(systemIdentity({}, { brandName: '7 Eleven' }).global, /^[A-Z][A-Za-z0-9]*$/);
  });
});

describe('the brand faces through next/font', () => {
  test('hosted faces load from next/font/google with the weights the type styles use', () => {
    const src = fontsModule(tokens);
    assert.match(src, /import \{ Karla \} from "next\/font\/google"/);
    assert.match(src, /import \{ JetBrains_Mono \} from "next\/font\/google"/);
    assert.match(src, /variable: "--font-brand-sans"/);
    assert.match(src, /export const fontVariables = \[sansFace\.variable, displayFace\.variable, monoFace\.variable\]/);
    const used = new Set(tokens.type.groups.flatMap((g) => g.styles.filter((s) => (s.family ?? g.family) === 'sans').map((s) => String(s.fontWeight ?? 400))));
    const loaded = JSON.parse(/sansFace = Karla\(\{ subsets: \["latin"\], weight: (\[[^\]]*\])/.exec(src)[1]);
    assert.deepEqual(new Set(loaded), used, 'exactly the weights the styles ask for');
  });

  test('a face the system ships as a file loads through next/font/local', () => {
    const local = structuredClone(tokens);
    local.type.fonts = [{ family: 'Karla', file: 'fonts/Karla-Regular.woff2', weight: '400', style: 'normal' }];
    const src = fontsModule(local);
    assert.match(src, /import localFont from "next\/font\/local"/);
    assert.match(src, /path: "\.\/fonts\/Karla-Regular\.woff2"/);
    assert.equal(/import \{ Karla \}/.test(src), false);
  });

  test('a role whose stack starts with a system face sets nothing', () => {
    const sys = structuredClone(tokens);
    sys.type.families.mono = 'ui-monospace, Menlo, monospace';
    assert.equal(/monoFace/.test(fontsModule(sys)), false);
  });
});

describe('the files the system owns in a starter', () => {
  test('every generated file is written, and globals.css is the one generator\'s output', () => {
    const files = generatedFiles(tokens, identity);
    assert.deepEqual([...files.keys()].sort(), [...GENERATED].sort());
    assert.equal(files.get('app/globals.css'), toStarterGlobals(tokens));
    assert.match(files.get('lib/format-locale.js'), /export const LOCALE = "en-AU"\nexport const CURRENCY = "AUD"/);
    assert.match(files.get('lib/product.ts'), /name: "Muddy Paws & Co"/);
    assert.equal(JSON.parse(files.get('system/system.json')).global, 'MuddyPawsCo');
    assert.match(files.get('tools/build-globals.mjs'), /export function toStarterGlobals/);
  });

  test('a fresh starter gets the whole kit; a second run rewrites only the generated files', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-starter-'));
    const out = path.join(dir, 'starter');
    const first = await writeStarter({ out, tokens, identity });
    assert.equal(first.fresh, true);
    for (const f of ['package.json', 'tools/build-canvas.mjs', 'components/system/button.tsx', 'components/ui/dialog.tsx', 'components/system/index.ts', 'app/globals.css']) {
      assert.ok(existsSync(path.join(out, f)), f);
    }
    assert.equal(existsSync(path.join(out, 'node_modules')), false);
    assert.match(await readFile(path.join(out, 'components/system/index.ts'), 'utf8'), /export \{ Button \} from "\.\/button"/);
    // A product's own component, and an edit to a kit file, survive a refresh.
    await writeFile(path.join(out, 'components/system/custom-panel.tsx'), 'export function CustomPanel() { return null }\n');
    await writeFile(path.join(out, 'components/system/button.tsx'), '// edited by the product\nexport const Button = () => null\n');
    const second = await writeStarter({ out, tokens: { ...tokens, name: 'Renamed' }, identity });
    assert.equal(second.fresh, false);
    assert.match(await readFile(path.join(out, 'components/system/button.tsx'), 'utf8'), /edited by the product/);
    assert.match(await readFile(path.join(out, 'components/system/index.ts'), 'utf8'), /CustomPanel/);
    assert.equal(JSON.parse(await readFile(path.join(out, 'system/tokens.json'), 'utf8')).name, 'Renamed');
    // --kit copies the kit's own files again.
    await writeStarter({ out, tokens, identity, refreshKit: true });
    assert.equal(/edited by the product/.test(await readFile(path.join(out, 'components/system/button.tsx'), 'utf8')), false);
    assert.ok(existsSync(path.join(out, 'components/system/custom-panel.tsx')), 'a product file is never deleted');
    await rm(dir, { recursive: true, force: true });
  });

  test('the bundle step says what to do when the starter is not installed', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-bundle-'));
    await mkdir(path.join(dir, 'system'), { recursive: true });
    await assert.rejects(buildBundle({ starter: dir, productDir: dir }), /Run npm install there first/);
    await rm(dir, { recursive: true, force: true });
  });

  test('the kit never carries a generated index or an installed node_modules', () => {
    assert.equal(readdirSync(KIT).includes('node_modules'), false);
  });
});

describe('the canvas build', () => {
  test("a board's camel-cased aria and data attributes reach an element under their real names", async () => {
    // The canvas hands a component aria-label as ariaLabel. The runtime shim puts it back for elements.
    // The kit is "type": "module" and the shim is CommonJS for esbuild, so it is evaluated as esbuild sees it.
    const created = [];
    const window = { React: { createElement: (type, props) => { created.push({ type, props }); return null; }, Fragment: 'F' } };
    const module = { exports: {} };
    new Function('module', 'exports', 'window', await readFile(path.join(KIT, 'canvas', 'shims', 'jsx-runtime.js'), 'utf8'))(module, module.exports, window);
    {
      const runtime = module.exports;
      runtime.jsx('button', { ariaLabel: 'Close', ariaLabelledby: 'title', dataTestid: 'x', 'aria-describedby': 'hint', children: 'X' });
      assert.deepEqual(created[0].props, { 'aria-label': 'Close', 'aria-labelledby': 'title', 'data-testid': 'x', 'aria-describedby': 'hint', children: 'X' });
      const Comp = () => null;
      runtime.jsx(Comp, { ariaLabel: 'Kept' });
      assert.deepEqual(created[1].props, { ariaLabel: 'Kept' }, 'a component still gets the prop it was given');
      runtime.jsx('span', { 'aria-label': 'Real', ariaLabel: 'Camel' });
      assert.equal(created[2].props['aria-label'], 'Real', 'a real attribute name wins over a camel-cased one');
    }
  });
});

describe("a product repo's previews", () => {
  test('the definitions fingerprint is the documented hash, and moves when any definition does', async () => {
    const { createHash } = await import('node:crypto');
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-defs-'));
    await writeFile(path.join(dir, 'b.def.mjs'), 'export default { name: "B" }\n');
    await writeFile(path.join(dir, 'a.def.mjs'), 'export default { name: "A" }\n');
    await writeFile(path.join(dir, 'a.tsx'), 'not a definition');
    const expected = createHash('sha256').update('a.def.mjs\nexport default { name: "A" }\n\nb.def.mjs\nexport default { name: "B" }\n\n', 'utf8').digest('hex');
    assert.deepEqual(definitionsHash(dir), { sha256: expected, files: 2 });
    await writeFile(path.join(dir, 'b.def.mjs'), 'export default { name: "B", job: "Changed." }\n');
    assert.notEqual(definitionsHash(dir).sha256, expected);
    await rm(dir, { recursive: true, force: true });
  });
});

describe('what lib/product.ts reads off the system', () => {
  test("the rail's tone comes from the tokens, aliases followed", () => {
    const of = (rail, text) => ({ color: { tokens: [{ name: 'surface', value: { light: '#FCFDFC', dark: '#191919' } }, { name: 'rail', value: { light: rail, dark: '#111111' } }, { name: 'rail-text-strong', value: { light: text, dark: '#FFFFFF' } }] } });
    assert.equal(railTone(of('#0F1B3C', '#FFFFFF')), 'dark', 'a navy rail');
    assert.equal(railTone(of('{surface}', '#2F3130')), 'light', 'a rail that is the surface');
    assert.equal(railTone({ color: { tokens: [] } }), 'light');
  });

  test('the lockup name style is the brand\'s choice, "label" unless product.json says "eyebrow"', () => {
    assert.equal(systemIdentity({}, { brandName: 'Acme' }).lockupName, 'label');
    assert.equal(systemIdentity({ lockup: { name: 'eyebrow' } }, { brandName: 'Acme' }).lockupName, 'eyebrow');
  });

  test("the generated file is the kit's own, with the product's values in it, so its types are the ones the components compile against", () => {
    const kitFile = readFileSync(path.join(KIT, 'lib', 'product.ts'), 'utf8');
    assert.equal(railTone(tokens), 'light', 'the fixture rail is light, as the kit file says');
    const generated = generatedFiles(tokens, { name: 'Product', lang: 'en', locale: 'en-AU', currency: 'AUD' }).get('lib/product.ts');
    assert.equal(generated, kitFile);
    // A literal type here (as const) narrows railTone to "light", and the components that compare it with "dark" stop compiling.
    assert.doesNotMatch(generated, /as const/);
  });
});

describe('a kit refresh takes back what the kit dropped', () => {
  const kitOf = async (dir, files) => {
    for (const [rel, text] of Object.entries(files)) { await mkdir(path.dirname(path.join(dir, rel)), { recursive: true }); await writeFile(path.join(dir, rel), text); }
    return dir;
  };
  test('a file the last kit wrote and the new kit lacks goes, unless someone changed it', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'brandi-kitfiles-'));
    const out = path.join(root, 'starter');
    const v1 = await kitOf(path.join(root, 'v1'), { 'app/page.tsx': 'old home', 'app/help/page.tsx': 'help', 'lib/x.ts': 'x' });
    assert.deepEqual(refreshKitFiles(out, v1), { removed: [], kept: [] });
    assert.ok(existsSync(path.join(out, KIT_MANIFEST)), 'the manifest is written');
    const v2 = await kitOf(path.join(root, 'v2'), { 'lib/x.ts': 'x2' });
    await writeFile(path.join(out, 'app', 'help', 'page.tsx'), 'help, changed by the product');
    await mkdir(path.join(out, '.next', 'types'), { recursive: true });
    const result = refreshKitFiles(out, v2);
    assert.deepEqual(result, { removed: ['app/page.tsx'], kept: ['app/help/page.tsx'] });
    assert.equal(existsSync(path.join(out, 'app', 'page.tsx')), false);
    assert.equal(existsSync(path.join(out, '.next', 'types')), false, "a route gone clears Next.js's route types");
    assert.equal(await readFile(path.join(out, 'lib', 'x.ts'), 'utf8'), 'x2');
    await rm(root, { recursive: true, force: true });
  });

  test("a starter older than the manifest loses the kit's old placeholder home page, and only that exact file", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'brandi-kitfiles-'));
    const out = path.join(root, 'starter');
    const kit = await kitOf(path.join(root, 'kit'), { 'app/(app)/page.tsx': 'the worked example' });
    const placeholder = 'import { Button } from "@/components/system"\n\nexport default function Page() {\n  return (\n    <main id="main" tabIndex={-1} className="p-8">\n      <h1 className="type-title">Starter</h1>\n      <Button variant="primary" icon="Check">Approve</Button>\n    </main>\n  )\n}\n';
    await kitOf(out, { 'app/page.tsx': placeholder });
    assert.deepEqual(refreshKitFiles(out, kit).removed, ['app/page.tsx']);
    await kitOf(out, { 'app/page.tsx': 'a home page the product wrote' });
    await rm(path.join(out, KIT_MANIFEST));
    assert.deepEqual(refreshKitFiles(out, kit), { removed: [], kept: ['app/page.tsx'] });
    await rm(root, { recursive: true, force: true });
  });
});

