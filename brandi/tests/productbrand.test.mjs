import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { cleanSvg, rasterMark, tighten, toInk, scopeClasses, clearSpaceRatio, brandSources, brandConstant, brandModule, shrinkStill, BRAND_MARKER } from '../scripts/productbrand.mjs';
import { encodePng } from '../scripts/png.mjs';
import { findChrome } from '../scripts/preview.mjs';
import { KIT } from '../scripts/productstarter.mjs';

const WIDE = '<?xml version="1.0"?><!-- exported --><svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><metadata>x</metadata><path onclick="steal()" d="M0 0h200v50H0z" fill="#123456"/></svg>';

describe('a mark, made safe to inline', () => {
  test('the prolog, comments, metadata, handlers and fixed size go; a viewBox is made from the size', () => {
    const svg = cleanSvg(WIDE, 'full.svg');
    assert.ok(svg.startsWith('<svg viewBox="0 0 200 50"'));
    for (const gone of ['<?xml', '<!--', 'metadata', 'onclick', 'width=', 'height=']) assert.equal(svg.includes(gone), false, gone);
    assert.match(svg, /fill="#123456"/);
  });

  test('a script or an outside reference is refused, naming the file', () => {
    assert.throws(() => cleanSvg('<svg viewBox="0 0 1 1"><script>x()</script></svg>', 'bad.svg'), /bad\.svg carries a script/);
    assert.throws(() => cleanSvg('<svg viewBox="0 0 1 1"><image href="https://x.example/a.png"/></svg>', 'linked.svg'), /linked\.svg links outside itself/);
    assert.doesNotThrow(() => cleanSvg('<svg viewBox="0 0 1 1"><use href="#a"/></svg>', 'inner.svg'), 'a reference inside the file is fine');
  });

  test('the one-ink rendition takes the text colour, even where the master set no fill', () => {
    assert.equal(toInk('<svg viewBox="0 0 1 1"><path fill="#000" stroke="black" d="M0 0"/><path style="fill:#000;stroke:none" d="M0 0"/></svg>'),
      '<svg fill="currentColor" viewBox="0 0 1 1"><path fill="currentColor" stroke="currentColor" d="M0 0"/><path style="fill:currentColor;stroke:none" d="M0 0"/></svg>');
  });

  test('the viewBox is cut to the ink, so clear space inside a brand file does not shrink the letters', () => {
    const padded = '<svg viewBox="0 0 200 100"><rect x="50" y="25" width="100" height="50" fill="#000"/></svg>';
    assert.match(tighten(padded), /viewBox="50 25 100 50"/);
    const tight = '<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#000"/></svg>';
    assert.equal(tighten(tight), tight, 'a tight file is left as it is');
    const moved = '<svg viewBox="0 0 100 100"><g transform="translate(10 20)"><rect width="30" height="40" fill="#000"/></g></svg>';
    assert.match(tighten(moved), /viewBox="10 20 30 40"/, 'transforms count');
  });

  test('a file keeps its class names to itself, so two renditions side by side keep their colours', () => {
    const navy = '<svg viewBox="0 0 1 1"><style>.cls-1{fill:#1d2b4f}.cls-10{fill:#6b9ee0}</style><path class="cls-1"/><path class="cls-10"/></svg>';
    const white = '<svg viewBox="0 0 1 1"><style>.cls-1{fill:#fff}</style><path class="cls-1"/></svg>';
    const a = scopeClasses(navy, 'brand-full-');
    const b = scopeClasses(white, 'brand-full-on-dark-');
    assert.match(a, /\.brand-full-cls-1\{fill:#1d2b4f\}\.brand-full-cls-10\{fill:#6b9ee0\}/);
    assert.match(a, /class="brand-full-cls-1"/);
    assert.match(b, /\.brand-full-on-dark-cls-1\{fill:#fff\}/);
    assert.equal(/\.cls-1\b/.test(a + b), false, 'no bare class rule is left to paint the page');
  });

  test('a PNG logo becomes a mark drawn in a viewBox of its own size; an ink rendition has to stay an SVG', async () => {
    const onePixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    const svg = rasterMark(onePixel, 'cropped.png');
    assert.match(svg, /^<svg [^>]*viewBox="0 0 1 1"><image href="data:image\/png;base64,iVBOR[^"]+" width="1" height="1"\/><\/svg>$/);
    assert.throws(() => rasterMark(Buffer.from('GIF89a and more bytes than that'), 'logo.gif'), /logo\.gif is not a PNG or an SVG/);
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-raster-'));
    await writeFile(path.join(dir, 'cropped.png'), onePixel);
    const out = brandConstant({ from: 'product/product.json', name: 'Acme', base: dir, files: { full: 'cropped.png' }, logo: {} });
    assert.match(out.source, /viewBox=\\?"0 0 1 1\\?"/, 'the brand constant carries it');
    assert.throws(() => brandConstant({ from: 'product/product.json', name: 'Acme', base: dir, files: { 'full-ink': 'cropped.png' }, logo: {} }), /has to be an SVG/);
    await rm(dir, { recursive: true, force: true });
  });

  test('simple class styles become attributes, so a mark carries no stylesheet into an email or a page', () => {
    const exported = '<svg viewBox="0 0 10 10"><defs><style>.cls-1{fill:#1d2b4f;}.cls-2,.cls-3{fill:#6b9ee0;stroke:#000;stroke-width:2px}.cls-3{fill:none}</style></defs><path class="cls-1" d="M0 0h1v1z"/><path class="cls-2" fill="#f00" d="M0 0h2v2z"/><path class="cls-3" style="stroke:#123" d="M0 0h3v3z"/></svg>';
    const out = cleanSvg(exported, 'full.svg');
    assert.equal(/<style|class=/.test(out), false, `no stylesheet and no class left: ${out}`);
    assert.match(out, /<path fill="#1d2b4f" d="M0 0h1v1z"\/>/);
    assert.match(out, /<path fill="#6b9ee0" d="M0 0h2v2z" stroke="#000" stroke-width="2px"\/>|<path [^>]*fill="#6b9ee0"[^>]*>/, 'the stylesheet beats a presentation attribute, as in the browser');
    assert.match(out, /<path[^>]*fill="none"[^>]*style="stroke:#123"|<path[^>]*style="stroke:#123"[^>]*fill="none"/, 'a later rule wins, and an inline style keeps its own property');
    assert.doesNotMatch(out, /<path[^>]*style="stroke:#123"[^>]*stroke="#000"/, 'the inline stroke is not overwritten');
    assert.doesNotMatch(out, /<defs>\s*<\/defs>/, 'an emptied defs goes too');
    const complex = '<svg viewBox="0 0 1 1"><style>svg .cls-1:hover{fill:red}</style><path class="cls-1"/></svg>';
    assert.match(cleanSvg(complex, 'complex.svg'), /<style>/, 'a selector it cannot inline leaves the stylesheet for scopeClasses');
  });

  test('the one-ink rendition rewrites colours inside a style block without swallowing the next rule', () => {
    assert.equal(toInk('<svg viewBox="0 0 1 1"><style>.a{fill:#000}.b{fill:#fff;stroke:#111}</style></svg>'),
      '<svg fill="currentColor" viewBox="0 0 1 1"><style>.a{fill:currentColor}.b{fill:currentColor;stroke:currentColor}</style></svg>');
  });

  test("Brandi's clear-space sentence becomes the share of the logo's height", () => {
    assert.equal(clearSpaceRatio('Leave clear space on every side equal to half the height of the mark. Nothing enters it.'), 0.5);
    assert.equal(clearSpaceRatio('equal to 0.75 the height of the mark'), 0.75);
    assert.equal(clearSpaceRatio('Keep it clear.'), null);
  });

  test("a clear space written as a multiple, a fraction or a percentage of the logo's height or width is read; anything else is not", () => {
    assert.equal(clearSpaceRatio('Twice the height of the logo on every side.'), 2);
    assert.equal(clearSpaceRatio('1.5x the logo height'), 1.5);
    assert.equal(clearSpaceRatio("25% of the mark's height all round"), 0.25);
    assert.equal(clearSpaceRatio('a third of the height of the lockup'), 1 / 3);
    assert.equal(clearSpaceRatio('Equal to the height of the logo.'), 1);
    // A width is a share of the height only once the mark's shape is known: 4 wide by 1 high, a tenth of the width is 0.4.
    assert.equal(clearSpaceRatio('10 per cent of the logo width', { aspect: 0.25 }), 0.4);
    assert.equal(clearSpaceRatio('10 per cent of the logo width'), null);
    // A part of the mark is not the mark: its size is not known from here.
    for (const words of ['One "e" of the signature on every side.', 'equal to half the height of the letter A', 'the height of the symbol', 'X, the cap height', "equal to the height of the logo's tagline", 'half the height of the logo symbol']) {
      assert.equal(clearSpaceRatio(words), null, words);
    }
  });
});

describe('where the marks come from', () => {
  test("product.json's brand block wins; brand.json's logo master is the fallback; neither leaves the placeholder", () => {
    const brand = { meta: { name: 'Fernpost' }, identity: { logo: { files: [{ path: 'brand/logo/master/primary.svg', role: 'primary' }, { path: 'brand/logo/master/mono-black.svg', role: 'mono-black' }], clearSpace: 'equal to half the height of the mark', minSize: { screenPx: 80 } } } };
    const fromProduct = brandSources({ product: { brand: { name: 'Override', marks: { full: 'assets/full.svg' } } }, brand, productDir: '/p', brandRoot: '/r' });
    assert.equal(fromProduct.from, 'product/product.json');
    assert.equal(fromProduct.name, 'Override');
    const fromBrand = brandSources({ product: {}, brand, productDir: '/p', brandRoot: '/r' });
    assert.deepEqual(fromBrand.files, { full: 'brand/logo/master/primary.svg' });
    assert.equal(fromBrand.inkFrom, 'brand/logo/master/mono-black.svg');
    assert.deepEqual(fromBrand.logo, { clearSpace: 0.5, minLongSide: 80 });
    assert.deepEqual(brandSources({ product: {}, brand: null }).files, {}, 'neither names a mark, so the stand-in carries it');
  });

  test("a logo the record names before anyone has drawn it never stops the starter: a missing file is listed, and with no full logo the kit's stand-in carries the brand's name", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-undrawn-'));
    await mkdir(path.join(dir, 'brand', 'assets', 'logos'), { recursive: true });
    const record = (files) => ({ meta: { name: 'Acme' }, identity: { logo: { files, clearSpace: 'equal to the height of the letter A', minSizes: [{ variant: 'Primary', screenPx: 140 }] } } });
    const from = (files) => brandSources({ product: {}, brand: record(files), productDir: path.join(dir, 'product'), brandRoot: dir });
    // A brand stage documents a logo before it is drawn; the run that met one stopped with "does not exist" and wrote nothing.
    const none = brandConstant(from([{ path: 'assets/logos/acme-primary.svg', role: 'primary' }]));
    assert.equal(none.placeholder, true);
    assert.deepEqual(none.missing, ['assets/logos/acme-primary.svg']);
    assert.match(none.source, /export const BRAND: Brand = \{\n  name: "Acme",\n  marks: STAND_IN_MARKS,\n  logo: \{ height: 24, minHeight: 16, symbolMinHeight: 16, clearSpace: 0\.25 \},\n\}/, "the stand-in, at the kit's sizes: the record's numbers are for the mark nobody has drawn");
    assert.match(none.source, /\/\/ Not the brand's logo\. Acme has no drawn mark yet[\s\S]*assets\/logos\/acme-primary\.svg/, 'the file says the mark is not the brand\'s, and which file is missing');
    assert.doesNotMatch(none.source, /character: \{/, 'and draws no character the brand never had');
    // The full logo drawn and the others not: the drawn one is used, and the rest are left out and named.
    await writeFile(path.join(dir, 'brand', 'assets', 'logos', 'acme-primary.svg'), WIDE);
    const some = brandConstant(from([{ path: 'assets/logos/acme-primary.svg', role: 'primary' }, { path: 'assets/logos/acme-reversed.svg', role: 'mono-white' }, { path: 'assets/logos/acme-black.svg', role: 'mono-black' }]));
    assert.equal(some.placeholder, false);
    assert.deepEqual(some.marks, ['full']);
    assert.deepEqual(some.missing, ['assets/logos/acme-reversed.svg', 'assets/logos/acme-black.svg']);
    assert.match(some.source, /\/\/ Not drawn yet, so left out: assets\/logos\/acme-reversed\.svg, assets\/logos\/acme-black\.svg\./);
    // A file product.json names is the product's own pick, so one missing there still stops it, naming the file.
    assert.throws(() => brandConstant(brandSources({ product: { brand: { marks: { full: 'assets/acme.svg' } } }, brand: null, productDir: path.join(dir, 'product') })), /assets\/acme\.svg does not exist/);
    await rm(dir, { recursive: true, force: true });
  });

  test("with no logo on record anywhere, lib/brand.ts still carries the brand's name, and a character only when the brand names one", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-nologo-'));
    const bare = brandConstant({ ...brandSources({ product: {}, brand: null, productDir: dir }), name: 'Acme' });
    assert.equal(bare.placeholder, true);
    assert.deepEqual(bare.missing, []);
    assert.equal(bare.character, false);
    assert.match(bare.source, /name: "Acme",\n  marks: STAND_IN_MARKS,/);
    assert.match(bare.source, /with no logo on record/);
    assert.doesNotMatch(bare.source, /character: \{/, "no placeholder character: a product showed one its brand never had");
    // A character product.json names comes through without any marks.
    await writeFile(path.join(dir, 'wave.svg'), '<svg viewBox="0 0 10 10"><path d="M1 1h9" fill="#2E7D32"/></svg>');
    const drawn = brandConstant(brandSources({ product: { brand: { name: 'Acme', character: { name: '[Acme drawings]', poses: { welcome: 'wave.svg' } } } }, brand: null, productDir: dir }));
    assert.equal(drawn.placeholder, true);
    assert.equal(drawn.character, true);
    assert.match(drawn.source, /name: "Acme",[\s\S]*character: \{\n    name: "\[Acme drawings\]",/);
    await rm(dir, { recursive: true, force: true });
  });

  test("brand.json's paths are read from the brand folder, and free-text roles find the master, the dark-ground file and the one ink", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-roles-'));
    await mkdir(path.join(dir, 'brand', 'assets', 'logos'), { recursive: true });
    const logo = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><path d="M0 0h120v60H0z" fill="${fill}"/></svg>`;
    for (const [f, fill] of [['primary.svg', '#1F6F4A'], ['outline-black.svg', '#000000'], ['outline-white.svg', '#ffffff'], ['outline-green.svg', '#2E7D32'], ['header.png', null]]) {
      if (fill) await writeFile(path.join(dir, 'brand', 'assets', 'logos', f), logo(fill));
    }
    // The roles a brand stage writes from the guidelines, not the logo forge's three words.
    const brand = { meta: { name: 'Acme' }, identity: { logo: { files: [
      { path: 'assets/logos/outline-green.svg', role: 'secondary: green logo outline on black' },
      { path: 'assets/logos/primary.svg', role: 'primary' },
      { path: 'assets/logos/outline-black.svg', role: 'secondary: black logo outline, one colour' },
      { path: 'assets/logos/outline-white.svg', role: 'secondary: black logo outline reversed to white' },
    ] } } };
    const src = brandSources({ product: {}, brand, productDir: path.join(dir, 'product'), brandRoot: dir });
    assert.deepEqual(src.files, { full: 'assets/logos/primary.svg', 'full-on-dark': 'assets/logos/outline-white.svg' }, 'white beats black, and a ground ("on black") is not an ink');
    assert.equal(src.inkFrom, 'assets/logos/outline-black.svg');
    assert.equal(src.base, path.join(dir, 'brand'), 'relative to the brand folder, where brand.json sits');
    assert.deepEqual(brandConstant(src).marks, ['full', 'full-on-dark', 'full-ink'], 'and every file is found');
    // A role that names a ground is weaker than one that does not, a picture weaker than an SVG, and "white
    // background" is a ground, not a reversed file.
    const ranked = brandSources({ brandRoot: dir, brand: { identity: { logo: { files: [
      { path: 'assets/logos/outline-green.svg', role: 'Primary logo for dark backgrounds' },
      { path: 'assets/logos/primary.svg', role: 'The primary logo' },
      { path: 'assets/logos/header.png', role: 'reversed logo, raster' },
      { path: 'assets/logos/outline-white.svg', role: 'reversed logo' },
      { path: 'assets/logos/outline-black.svg', role: 'white background version, one colour' },
    ] } } } });
    assert.deepEqual(ranked.files, { full: 'assets/logos/primary.svg', 'full-on-dark': 'assets/logos/outline-white.svg' });
    assert.equal(ranked.inkFrom, 'assets/logos/outline-black.svg');
    // A path written from the project root, as an older brand file may, still resolves there.
    const rooted = brandSources({ product: {}, brand: { identity: { logo: { files: [{ path: 'brand/assets/logos/primary.svg', role: 'Primary logo' }] } } }, brandRoot: dir });
    assert.equal(rooted.base, dir);
    assert.deepEqual(brandConstant(rooted).marks, ['full']);
    await rm(dir, { recursive: true, force: true });
  });

  test('a mark much wider than tall is refused as the symbol, so the icons rail shows its Home control', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-symbol-'));
    await writeFile(path.join(dir, 'full.svg'), WIDE);
    await writeFile(path.join(dir, 'signature.svg'), '<svg viewBox="0 0 238 100"><path d="M0 0h238v100H0z" fill="#1F6F4A"/></svg>');
    await writeFile(path.join(dir, 'square.svg'), '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="#1F6F4A"/></svg>');
    const wide = brandConstant({ from: 'product/product.json', name: 'Acme', base: dir, files: { full: 'full.svg', symbol: 'signature.svg', 'symbol-ink': 'signature.svg' }, logo: {} });
    assert.deepEqual(wide.marks, ['full'], 'no symbol rendition is kept');
    assert.match(wide.refused.join(' '), /symbol .*2\.38 times as wide as it is tall/);
    assert.match(wide.source, /\/\/ Not a symbol: /, 'lib/brand.ts says why');
    const square = brandConstant({ from: 'product/product.json', name: 'Acme', base: dir, files: { full: 'full.svg', symbol: 'square.svg' }, logo: {} });
    assert.deepEqual(square.marks, ['full', 'symbol']);
    assert.deepEqual(square.refused, []);
    await rm(dir, { recursive: true, force: true });
  });

  test('a pose drawn in one dark ink takes the text colour; a pose in a colour, or in several, keeps its own', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-ink-'));
    await writeFile(path.join(dir, 'line.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="99.5" height="106"><path d="M1 1h9" fill="#221f20"/><path d="M2 2h9" style="fill:#221F20;stroke:none"/><path d="M3 3h9" fill-rule="evenodd"/></svg>');
    await writeFile(path.join(dir, 'two.svg'), '<svg viewBox="0 0 10 10"><path d="M1 1h9" fill="#000000"/><path d="M2 2h9" fill="#ffffff"/></svg>');
    await writeFile(path.join(dir, 'green.svg'), '<svg viewBox="0 0 10 10"><path d="M1 1h9" fill="#2E7D32"/></svg>');
    const out = brandConstant({ from: 'product/product.json', name: 'Acme', base: dir, files: {}, logo: {}, character: { name: '[Drawings]', poses: { welcome: 'line.svg', done: 'two.svg', help: 'green.svg' } } });
    const pose = (state) => JSON.parse(new RegExp(`"${state}": ("(?:[^"\\\\]|\\\\.)*")`).exec(out.source)[1]);
    assert.doesNotMatch(pose('welcome'), /#221f20/i, 'the black ink is gone');
    assert.match(pose('welcome'), /<svg fill="currentColor"/, 'in its place the text colour, the unfilled path included');
    assert.match(pose('done'), /#ffffff/, 'two inks keep their colours');
    assert.match(pose('help'), /#2E7D32/, "one ink in the brand's green keeps it");
    assert.deepEqual(out.inkPoses, ['welcome']);
    assert.match(out.source, /\/\/ Drawn in one dark ink, so they take the text colour on any ground: welcome\./);
    await rm(dir, { recursive: true, force: true });
  });

  test('the minimum height comes from the long side, and every default kept is named', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-brand-'));
    await mkdir(path.join(dir, 'brand', 'logo'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'logo', 'primary.svg'), WIDE);
    await writeFile(path.join(dir, 'brand', 'logo', 'black.svg'), WIDE.replace('#123456', '#000000'));
    const out = brandConstant({ from: 'brand.json', name: 'Fernpost', files: { full: 'brand/logo/primary.svg' }, inkFrom: 'brand/logo/black.svg', logo: { clearSpace: 0.5, minLongSide: 80 }, base: dir });
    assert.match(out.source, /logo: \{ height: 24, minHeight: 20, symbolMinHeight: 20, clearSpace: 0\.5 \}/, '80px long side on a 4:1 mark is 20px tall');
    assert.deepEqual(out.kept, ['height']);
    assert.deepEqual(out.marks, ['full', 'full-ink']);
    assert.match(out.source, /"full-ink": "<svg fill=\\"currentColor\\"/);
    assert.throws(() => brandConstant({ from: 'product.json', files: { full: 'missing.svg' }, base: dir }), /missing\.svg does not exist/);
    await rm(dir, { recursive: true, force: true });
  });
});

describe("the logo's minimum and clear space, from the brand record", () => {
  // A route-A brand whose minimum sits only in minSizes, per variant, and whose clear space is written in words.
  const record = (logo = {}) => ({ meta: { name: 'Acme' }, identity: { logo: {
    files: [{ path: 'assets/logos/acme-shield.svg', role: 'primary' }, { path: 'assets/logos/acme-signature.svg', role: 'signature, internal' }],
    variants: [{ name: 'Acme Signature', file: 'acme-signature.svg' }, { name: 'Acme Shield Logo', file: 'acme-shield.svg' }],
    minSize: { printMm: 20, screenPx: null },
    minSizes: [{ variant: 'Acme Signature', screenPx: 30 }, { variant: 'Acme Shield Logo', printMm: 20, screenPx: 76 }],
    clearSpace: 'Shield logos, digital: one "e" of the signature on every side.',
    ...logo,
  } } });

  test('the minimum is the minSizes entry for the mark the starter draws, found through its variant', () => {
    const src = brandSources({ product: {}, brand: record(), productDir: '/p', brandRoot: '/r' });
    assert.equal(src.logo.minLongSide, 76, "the shield's, not the signature's");
    assert.match(src.notes.join('\n'), /minimum, 76px along the long side, from identity\.logo\.minSizes \(Acme Shield Logo\)/);
    // With no variant naming the file, an entry named for the primary stands for it, as the logo forge writes it.
    const forge = brandSources({ brand: record({ variants: [], minSizes: [{ variant: 'Primary', screenPx: 80 }] }), brandRoot: '/r' });
    assert.equal(forge.logo.minLongSide, 80);
    // Only another mark's minimum on record: the general one, and none here.
    assert.equal(brandSources({ brand: record({ variants: [], minSizes: [{ variant: 'Acme Signature', screenPx: 30 }] }), brandRoot: '/r' }).logo.minLongSide, undefined);
    assert.equal(brandSources({ brand: record({ minSizes: [], minSize: { screenPx: 64 } }), brandRoot: '/r' }).logo.minLongSide, 64);
  });

  test("clear space in words it cannot read is printed with the product.json key to set, and that key is read on route A", () => {
    const src = brandSources({ product: {}, brand: record(), productDir: '/p', brandRoot: '/r' });
    assert.equal(src.logo.clearSpace, undefined, 'never guessed');
    const said = src.notes.join('\n');
    assert.match(said, /one "e" of the signature on every side/, 'the words it found');
    assert.match(said, /product\.json "brand": \{ "logo": \{ "clearSpace": <a share of the logo's height> \} \}/);
    const set = brandSources({ product: { brand: { logo: { clearSpace: 0.3, minHeight: 45 } } }, brand: record(), productDir: '/p', brandRoot: '/r' });
    assert.equal(set.from, "brand/brand.json's logo master", 'the marks still come from the logo master');
    assert.equal(set.logo.clearSpace, 0.3);
    assert.equal(set.logo.minHeight, 45);
    assert.doesNotMatch(set.notes.join('\n'), /clearSpace/, 'nothing left to ask once it is set');
  });

  test('a clear space given as a share of the width is read against the drawn mark', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-clear-'));
    await writeFile(path.join(dir, 'full.svg'), WIDE);
    const out = brandConstant({ from: 'brand.json', name: 'Acme', files: { full: 'full.svg' }, logo: { clearSpaceWords: 'a tenth of the width of the logo' }, base: dir });
    assert.match(out.source, /clearSpace: 0\.4 \}/, 'a 4:1 mark: a tenth of its width is 0.4 of its height');
    await rm(dir, { recursive: true, force: true });
  });
});

describe("the illustration library beside the character's moments", () => {
  const library = [
    { file: 'brand/illustration/waving.svg', set: 'Core', title: 'Waving hello' },
    { file: 'brand/illustration/caught-up.svg', set: 'Core', title: 'All done for today' },
    { file: 'brand/illustration/bowl.svg', set: 'Core', title: 'Help' },
  ];
  const brand = { meta: { name: 'Acme' }, identity: { logo: { files: [{ path: 'assets/logos/acme.svg', role: 'primary' }] }, illustration: { library } } };

  test('the drawings are listed with the block to fill, and only an exact name is taken, saying so', () => {
    const src = brandSources({ product: {}, brand, productDir: '/w/product', brandRoot: '/w' });
    const ill = src.illustrations;
    assert.deepEqual(ill.drawings.map((d) => d.file), ['../brand/illustration/waving.svg', '../brand/illustration/caught-up.svg', '../brand/illustration/bowl.svg'], 'relative to product/, as product.json writes paths');
    assert.deepEqual(ill.taken, { 'caught-up': '../brand/illustration/caught-up.svg', help: '../brand/illustration/bowl.svg' }, 'a file name or a title that is a moment, and nothing else');
    assert.deepEqual(src.character.poses, { 'caught-up': '/w/brand/illustration/caught-up.svg', help: '/w/brand/illustration/bowl.svg' });
    assert.match(ill.block, /"brand": \{ "character": \{ "name": "\[the drawings' name\]", "poses": \{/);
    assert.match(ill.block, /"welcome": "",/, 'a moment nobody picked is left to fill');
    assert.match(ill.block, /"help": "\.\.\/brand\/illustration\/bowl\.svg"/);
    assert.equal(Object.keys(JSON.parse(`{${ill.block}}`).brand.character.poses).length, 8, 'the block is JSON, every moment in it');
  });

  test("a character product.json names is the pick: its paths are read from product/, and nothing is listed", () => {
    const src = brandSources({ product: { brand: { character: { name: 'Acme drawings', poses: { welcome: '../brand/illustration/waving.svg' } } } }, brand, productDir: '/w/product', brandRoot: '/w' });
    assert.deepEqual(src.character, { name: 'Acme drawings', poses: { welcome: '/w/brand/illustration/waving.svg' } });
    assert.equal(src.illustrations, null);
  });
});

describe('lib/brand.ts', () => {
  test("the kit's types stay, the placeholder goes, and a second run replaces its own output", async () => {
    const kit = await readFile(path.join(KIT, 'lib', 'brand.ts'), 'utf8');
    const first = brandModule(kit, `${BRAND_MARKER} from x.\nexport const BRAND: Brand = { name: "One" } as Brand\n`);
    assert.match(first, /export interface Brand \{/);
    assert.equal(first.includes('PLACEHOLDER'), false);
    const second = brandModule(first, `${BRAND_MARKER} from y.\nexport const BRAND: Brand = { name: "Two" } as Brand\n`);
    assert.equal((second.match(/export const BRAND/g) ?? []).length, 1);
    assert.match(second, /name: "Two"/);
    assert.equal(brandModule('export const BRAND = mine\n', 'anything'), null, "a file without either marker is the product's own");
  });

  test("the stand-in mark sits with the types, so a brand with no drawn logo keeps it while the kit's own brand and character go", async () => {
    const kit = await readFile(path.join(KIT, 'lib', 'brand.ts'), 'utf8');
    const file = brandModule(kit, brandConstant({ from: null, name: 'Acme', files: {}, logo: {} }).source);
    assert.match(file, /export const STAND_IN_MARKS: Brand\["marks"\] = \{/);
    assert.equal(file.includes('// PLACEHOLDER.'), false, "the kit's own brand is gone");
    assert.doesNotMatch(file, /const figure|name: "Placeholder"/, 'and its character with it');
    assert.equal((file.match(/export const BRAND\b/g) ?? []).length, 1);
  });
});

describe('character stills', () => {
  test('a large still is drawn down into the bundle, so a board on the canvas shows it', { skip: !findChrome() && 'no Chrome' }, async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-still-'));
    const width = 1000;
    const height = 1200;
    const data = Buffer.alloc(width * height * 4);
    for (let i = 0; i < data.length; i += 4) { data[i] = (i / 4) % width; data[i + 1] = 120; data[i + 2] = 200; data[i + 3] = 255; }
    const file = path.join(dir, 'pose.png');
    await writeFile(file, encodePng({ width, height, channels: 4, data }));
    const uri = await shrinkStill(file);
    assert.match(uri ?? '', /^data:image\/webp;base64,/);
    assert.ok(uri.length * 0.75 < 200 * 1024, `inlined at ${Math.round(uri.length * 0.75 / 1024)} KB`);
    const out = brandConstant({ from: 'product.json', name: 'Acme', files: {}, logo: {}, base: dir, character: { name: '[Character]', poses: { welcome: 'pose.png' } } }, { stills: new Map([[file, uri]]) });
    assert.match(out.source, /"welcome": "data:image\/webp;base64,/);
    assert.deepEqual(out.stills, [], 'nothing went in at full size');
    await rm(dir, { recursive: true, force: true });
  });

  test('a still Chrome could not draw down goes in whole, never as a path from the page root a board cannot reach', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-still-'));
    const data = Buffer.alloc(4 * 4 * 4, 200);
    await writeFile(path.join(dir, 'wave.png'), encodePng({ width: 4, height: 4, channels: 4, data }));
    const out = brandConstant({ from: 'product.json', name: 'Acme', files: {}, logo: {}, base: dir, character: { name: '[Character]', poses: { welcome: 'wave.png' }, flat: { welcome: 'wave.png' } } });
    assert.match(out.source, /"welcome": "data:image\/png;base64,iVBOR/, 'the file itself, as a data URI');
    assert.doesNotMatch(out.source, /"\/brand\//, 'no root-absolute path');
    assert.deepEqual(out.stills, ['wave.png'], 'named once as going in at full size');
    await rm(dir, { recursive: true, force: true });
  });
});
