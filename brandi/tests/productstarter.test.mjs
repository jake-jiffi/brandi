import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import { systemIdentity, fontsModule, generatedFiles, writeStarter, buildBundle, installSystem, definitionsHash, railTone, refreshKitFiles, KIT_MANIFEST, GENERATED, KIT } from '../scripts/productstarter.mjs';
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

  test("boards ask Google only for the weights each hosted face's styles set, no italics, and nothing when every face ships as a file", () => {
    const url = (t) => JSON.parse(generatedFiles(t, identity).get('system/system.json')).fontsUrl;
    const hosted = url(tokens);
    // A display face with one weight, asked for 500 to 700 and italics, made Google refuse the whole stylesheet.
    assert.match(hosted, /family=Bitter:wght@400(&|$)/);
    assert.match(hosted, /family=Karla:wght@400;500;700(&|$)/);
    assert.doesNotMatch(hosted, /ital/);
    const shipped = structuredClone(tokens);
    shipped.type.fonts = ['Bitter', 'Karla', 'JetBrains Mono'].map((family) => ({ family, file: `fonts/${family.replace(/ /g, '')}.woff2`, weight: '400 700', style: 'normal' }));
    assert.equal(url(shipped), null, 'the faces come through tokens.css, so no board links Google Fonts');
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

  test('a starter that cannot be made is not started: nothing is written, and the message says so', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-starter-'));
    const out = path.join(dir, 'product', 'starter');
    // A mark product.json names is the product's own pick, so a missing one is a mistake to fix now.
    await assert.rejects(writeStarter({ out, tokens, identity, product: { brand: { marks: { full: 'assets/logo/missing.svg' } } }, productDir: path.join(dir, 'product') }), /^Error: Nothing was written to .*starter: the full mark: assets\/logo\/missing\.svg does not exist/);
    assert.equal(existsSync(out), false, 'no half-copied kit');
    // A texture move whose file is not in the product folder stops it the same way.
    const textured = buildProductTokens(buildSystem({ primary: '#1F6F4A' }), { shape: { moves: [{ name: 'The paper ground', source: 'p13', where: ['the sign-in hero'], file: 'textures/paper.jpg', kind: 'texture', strength: 0.3 }] } });
    await assert.rejects(writeStarter({ out, tokens: textured, identity, productDir: path.join(dir, 'product') }), /Nothing was written .*textures\/paper\.jpg/);
    assert.equal(existsSync(out), false);
    // With the file there, it travels into the starter, where globals.css finds it.
    await mkdir(path.join(dir, 'product', 'textures'), { recursive: true });
    await writeFile(path.join(dir, 'product', 'textures', 'paper.jpg'), 'jpeg bytes');
    const made = await writeStarter({ out, tokens: textured, identity, productDir: path.join(dir, 'product') });
    assert.ok(made.written.includes('textures/paper.jpg'));
    assert.equal(await readFile(path.join(out, 'textures', 'paper.jpg'), 'utf8'), 'jpeg bytes');
    assert.match(await readFile(path.join(out, 'app', 'globals.css'), 'utf8'), /url\("\.\.\/textures\/paper\.jpg"\)/);
    await rm(dir, { recursive: true, force: true });
  });

  test("a logo the brand record names that nobody has drawn does not stop the starter: lib/brand.ts carries the kit's stand-in under the brand's name, says it is not the brand's, and draws no character", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-starter-'));
    const out = path.join(dir, 'product', 'starter');
    const brand = JSON.parse(await readFile(path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json'), 'utf8'));
    const res = await writeStarter({ out, tokens, identity, brand, brandRoot: dir, productDir: path.join(dir, 'product') });
    assert.equal(res.placeholder, true);
    // The record's Reversed and Mark only variants are named and not drawn either, looked for beside the master.
    assert.deepEqual(res.brand.missing, ['assets/logos/muddy-paws-primary.svg', 'assets/logos/muddy-paws-reversed.svg', 'assets/logos/muddy-paws-mark.svg']);
    assert.equal(res.brand.character, false);
    const file = await readFile(path.join(out, 'lib', 'brand.ts'), 'utf8');
    assert.match(file, /export const STAND_IN_MARKS: Brand\["marks"\]/, 'the stand-in is in the file');
    assert.match(file, /\/\/ Not the brand's logo\. Muddy Paws has no drawn mark yet/);
    assert.match(file, /name: "Muddy Paws",\n  marks: STAND_IN_MARKS,/);
    assert.doesNotMatch(file, /name: "Product"|character: \{/, 'neither the kit\'s name nor its character');
    // A starter made before the stand-in sat with the types takes them from the kit, or BRAND names a constant it lacks.
    const old = file.replace(/\/\*\*\n \* The kit's stand-in mark[\s\S]*?\n\}\n/, '');
    assert.doesNotMatch(old, /STAND_IN_MARKS: Brand/);
    await writeFile(path.join(out, 'lib', 'brand.ts'), old);
    await writeStarter({ out, tokens, identity, brand, brandRoot: dir, productDir: path.join(dir, 'product') });
    assert.match(await readFile(path.join(out, 'lib', 'brand.ts'), 'utf8'), /export const STAND_IN_MARKS: Brand\["marks"\][\s\S]*marks: STAND_IN_MARKS,/);
    await rm(dir, { recursive: true, force: true });
  });

  test("a starter made before the kit's types carried the stand-in takes the kit's types again, so the kit's lockup builds for a brand with its own logo", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-starter-types-'));
    const out = path.join(dir, 'product', 'starter');
    const brand = JSON.parse(await readFile(path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json'), 'utf8'));
    await mkdir(path.join(dir, 'assets', 'logos'), { recursive: true });
    await writeFile(path.join(dir, 'assets', 'logos', 'muddy-paws-primary.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 24"><rect width="24" height="24" fill="#1F6F4A"/></svg>');
    const res = await writeStarter({ out, tokens, identity, brand, brandRoot: dir, productDir: path.join(dir, 'product') });
    assert.equal(res.placeholder, false, 'the brand has its own logo');
    // ProductLockup imports STAND_IN_MARKS from lib/brand.ts. A brand file generated before it sat with the types
    // kept its own older types, so a refreshed kit's lockup named a constant the file lacked and the bundle failed.
    const old = (await readFile(path.join(out, 'lib', 'brand.ts'), 'utf8')).replace(/\/\*\*\n \* The kit's stand-in mark[\s\S]*?\n\}\n/, '');
    assert.doesNotMatch(old, /STAND_IN_MARKS/);
    await writeFile(path.join(out, 'lib', 'brand.ts'), old);
    await writeStarter({ out, tokens, identity, brand, brandRoot: dir, productDir: path.join(dir, 'product') });
    const file = await readFile(path.join(out, 'lib', 'brand.ts'), 'utf8');
    assert.match(file, /export const STAND_IN_MARKS: Brand\["marks"\]/);
    assert.doesNotMatch(file, /marks: STAND_IN_MARKS,/, 'and BRAND keeps the brand\'s own marks');
    await rm(dir, { recursive: true, force: true });
  });

  test('the starter command on a brand whose logo is named and never drawn writes the starter, and says which files are missing and how to add them', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-starter-cli-'));
    await mkdir(path.join(dir, 'brand'), { recursive: true });
    await mkdir(path.join(dir, 'product'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'brand.json'), await readFile(path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json'), 'utf8'));
    await writeFile(path.join(dir, 'product', 'tokens.json'), JSON.stringify(tokens));
    const run = spawnSync(process.execPath, [path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs'), 'product', 'starter'], { cwd: dir, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.match(run.stdout, /Wrote the Muddy Paws starter/);
    assert.match(run.stdout, /Muddy Paws has no drawn logo yet/);
    assert.match(run.stdout, /assets\/logos\/muddy-paws-primary\.svg/, 'the missing file, by name');
    assert.match(run.stdout, /brandi logo wordmark/, 'and how to add one');
    assert.match(run.stdout, /no character, so Character draws nothing/);
    assert.match(await readFile(path.join(dir, 'product', 'starter', 'lib', 'brand.ts'), 'utf8'), /name: "Muddy Paws",\n  marks: STAND_IN_MARKS,/);
    await rm(dir, { recursive: true, force: true });
  });

  test("the starter command on a brand whose logo is one coloured file says the one ink is derived and what to ask the brand for, and takes the record's \"Mark only\" as the symbol", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-starter-onefile-'));
    await mkdir(path.join(dir, 'brand', 'assets', 'logos'), { recursive: true });
    await mkdir(path.join(dir, 'product'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'brand.json'), await readFile(path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json'), 'utf8'));
    await writeFile(path.join(dir, 'product', 'tokens.json'), JSON.stringify(tokens));
    await writeFile(path.join(dir, 'brand', 'assets', 'logos', 'muddy-paws-primary.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 48"><circle cx="24" cy="24" r="20" fill="#2E7D32"/><path d="M60 12h120v24H60z" fill="#1C1B1A"/></svg>');
    const starter = () => spawnSync(process.execPath, [path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs'), 'product', 'starter'], { cwd: dir, encoding: 'utf8' });
    const run = starter();
    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.match(run.stdout, /lib\/brand\.ts: full, full-ink, from brand\/brand\.json's logo master/);
    assert.match(run.stdout, /Derived, not the brand's own file: full-ink, made from assets\/logos\/muddy-paws-primary\.svg/);
    assert.match(run.stdout, /Ask the brand for its own one-ink SVG of the logo, and a version for dark grounds,/);
    assert.match(run.stdout, /Not drawn yet, so left out: assets\/logos\/muddy-paws-reversed\.svg, assets\/logos\/muddy-paws-mark\.svg\./, "the record's Reversed and Mark only variants, looked for beside the master");
    const brandTs = () => readFile(path.join(dir, 'product', 'starter', 'lib', 'brand.ts'), 'utf8');
    assert.match(await brandTs(), /\/\/ Derived, not the brand's own file: full-ink/);
    // The record's "Mark only" drawn: it is the symbol, at its own 24px minimum.
    await writeFile(path.join(dir, 'brand', 'assets', 'logos', 'muddy-paws-mark.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#2E7D32"/></svg>');
    const again = starter();
    assert.equal(again.status, 0, again.stderr || again.stdout);
    assert.match(again.stdout, /lib\/brand\.ts: full, symbol, full-ink, symbol-ink, from/);
    assert.match(await brandTs(), /symbolMinHeight: 24,/);
    await rm(dir, { recursive: true, force: true });
  });

  test('a fresh starter stopped part way is fresh again next run, so the kit is copied whole rather than "Refreshed"', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-starter-'));
    const out = path.join(dir, 'starter');
    await mkdir(path.join(out, '.brandi'), { recursive: true });
    await writeFile(path.join(out, 'package.json'), '{}');
    await writeFile(path.join(out, '.brandi', 'starter-pending'), 'started');
    const res = await writeStarter({ out, tokens, identity });
    assert.equal(res.fresh, true);
    assert.ok(existsSync(path.join(out, 'components', 'system', 'button.tsx')), 'the kit is copied');
    assert.equal(existsSync(path.join(out, '.brandi', 'starter-pending')), false, 'and the starter marked finished');
    assert.equal((await writeStarter({ out, tokens, identity })).fresh, false);
    await rm(dir, { recursive: true, force: true });
  });

  test('the system installs beside the boards with the files tokens.css names: its faces and its texture', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-install-'));
    const files = { 'dist/bundle.js': 'js', 'dist/bundle.css': 'css', 'starter/system/tokens.json': '{}', 'product/tokens.css': '@font-face {}', 'product/fonts/Brand.woff2': 'font', 'product/textures/paper.jpg': 'jpeg', 'product/textures/notes.txt': 'not an image' };
    for (const [rel, text] of Object.entries(files)) { await mkdir(path.dirname(path.join(dir, rel)), { recursive: true }); await writeFile(path.join(dir, rel), text); }
    const ds = path.join(dir, 'product', 'canvas', 'ds', 'acme');
    installSystem(ds, { dist: path.join(dir, 'dist'), starter: path.join(dir, 'starter'), productDir: path.join(dir, 'product') });
    for (const rel of ['components/bundle.js', 'components/bundle.css', 'tokens.json', 'tokens.css', 'fonts/Brand.woff2', 'textures/paper.jpg']) assert.ok(existsSync(path.join(ds, rel)), rel);
    assert.equal(existsSync(path.join(ds, 'textures', 'notes.txt')), false, 'only images');
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

  test("the rail and the top bar take the logo from the rail as it renders, never from a tone fixed when the bundle was built", () => {
    // railTone in the bundle drew the mark made for dark grounds on a green-rail direction's green rail.
    const kit = (f) => readFileSync(path.join(KIT, 'components', 'system', f), 'utf8');
    for (const f of ['sidebar.tsx', 'phone-top-bar.tsx']) {
      assert.doesNotMatch(kit(f), /railTone/, `${f} reads no tone fixed at build time`);
      assert.match(kit(f), /<(ProductLockup|Logo)\b[^>]*color="rail"/, `${f} asks for the rail's rendition`);
    }
    assert.match(kit('logo.tsx'), /var\(--rail-mark-on-light,flex\)[\s\S]*var\(--rail-mark-on-dark,none\)/, 'Logo shows each rendition by the variables the tokens set');
    assert.ok(['logo', 'sidebar', 'phone-top-bar'].every((n) => /--rail-mark-on-dark/.test(kit(`${n}.def.mjs`))), 'and each definition checks it in a browser');
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

  test('the tags the tokens keep out of a name\'s hash reach lib/product.ts, where Avatar reads them', () => {
    const barred = { ...tokens, meta: { ...tokens.meta, avoidTags: ['tag-3', 'tag-6'] } };
    const generated = generatedFiles(barred, { name: 'Product', lang: 'en', locale: 'en-AU', currency: 'AUD' }).get('lib/product.ts');
    assert.match(generated, /avoidTags: \["tag-3","tag-6"\]/);
    assert.match(readFileSync(path.join(KIT, 'components', 'system', 'avatar.tsx'), 'utf8'), /PRODUCT\.avoidTags/, 'Avatar leaves them out');
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

