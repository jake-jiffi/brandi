import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { cleanSvg, tighten, toInk, clearSpaceRatio, brandSources, brandConstant, brandModule, shrinkStill, BRAND_MARKER } from '../scripts/productbrand.mjs';
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

  test("Brandi's clear-space sentence becomes the share of the logo's height", () => {
    assert.equal(clearSpaceRatio('Leave clear space on every side equal to half the height of the mark. Nothing enters it.'), 0.5);
    assert.equal(clearSpaceRatio('equal to 0.75 the height of the mark'), 0.75);
    assert.equal(clearSpaceRatio('Keep it clear.'), null);
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
    assert.equal(brandSources({ product: {}, brand: null }), null);
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
    assert.deepEqual(out.stills, [], 'nothing left to copy into public/');
    await rm(dir, { recursive: true, force: true });
  });
});
