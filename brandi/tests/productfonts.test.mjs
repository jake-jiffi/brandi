import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { typeFaces, faceRequest, parseFaceCss, licenceName, fetchFonts } from '../scripts/productfonts.mjs';

// Nothing here touches the network: a server on 127.0.0.1 answers as Google Fonts does, for made-up faces.
const OFL = 'Copyright 2020 The Acme Project Authors\n\nThis Font Software is licensed under the SIL Open Font License, Version 1.1.\n';
const FACES = {
  'Acme Grotesk': { axes: [{ tag: 'wght', min: 100.0, max: 900.0, defaultValue: 400.0 }], fonts: ['100', '100i', '400', '400i', '900', '900i'], licence: { filename: 'OFL.txt', contents: OFL } },
  'Acme Condensed': { axes: [{ tag: 'wdth', min: 75.0, max: 100.0, defaultValue: 100.0 }], fonts: ['400'], licence: { filename: 'OFL.txt', contents: OFL } },
  'Acme Serif': { axes: [], fonts: ['400', '400i', '700'], licence: { filename: 'LICENSE.txt', contents: '\n                                 Apache License\n                           Version 2.0, January 2004\n' } },
  'Acme Tampered': { axes: [], fonts: ['400'], licence: { filename: 'OFL/../../../escaped-OFL.txt', contents: OFL } },
};
const slug = (f) => f.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const WOFF2 = Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(60, 7)]);

let server;
let base;
const asked = [];

/** The css2 answer: one block per subset per style asked, latin-ext first as Google lists it. */
function css2(query) {
  const [family, spec = 'wght@400'] = query.split(':');
  const face = FACES[family];
  if (!face) return null;
  const [axes, tuples] = spec.split('@');
  const styles = tuples.split(';').map((t) => (axes.startsWith('ital') ? t.split(',') : ['0', t]));
  return styles.flatMap(([ital, w]) => ['latin-ext', 'latin'].map((subset) => `/* ${subset} */\n@font-face {\n  font-family: '${family}';\n  font-style: ${ital === '1' ? 'italic' : 'normal'};\n  font-weight: ${w.replace('..', ' ')};\n  src: url(${base}/s/${slug(family)}-${ital}-${w.replace('..', '-')}-${subset}.woff2) format('woff2');\n  unicode-range: U+0000-00FF;\n}\n`)).join('');
}

before(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    asked.push(`${url.pathname}${url.search}`);
    const json = (body) => res.writeHead(200, { 'content-type': 'application/json' }).end(`)]}'\n${JSON.stringify(body)}`);
    if (url.pathname.startsWith('/metadata/fonts/')) {
      const family = decodeURIComponent(url.pathname.slice('/metadata/fonts/'.length));
      const face = FACES[family];
      return face ? json({ family, axes: face.axes, fonts: Object.fromEntries(face.fonts.map((k) => [k, {}])), license: 'ofl' }) : res.writeHead(404).end();
    }
    if (url.pathname === '/css2') {
      const body = css2(url.searchParams.get('family'));
      return body ? res.writeHead(200, { 'content-type': 'text/css' }).end(body) : res.writeHead(400).end();
    }
    if (url.pathname === '/download/list') {
      const face = FACES[url.searchParams.get('family')];
      return face ? json({ zipName: 'x.zip', manifest: { files: [face.licence, { filename: 'README.txt', contents: 'readme' }], fileRefs: [] } }) : res.writeHead(400).end();
    }
    if (url.pathname.startsWith('/s/')) return res.writeHead(200, { 'content-type': 'font/woff2' }).end(WOFF2);
    res.writeHead(404).end();
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

/** A tokens file's type, as product tokens writes it: each role's stack and the styles that set it. */
const tokens = ({ display = 'Acme Condensed', sans = 'Acme Grotesk', mono = null, fonts = [], italicBody = false } = {}) => ({
  type: {
    fonts,
    families: {
      display: display ? `"${display}", "Arial Narrow", sans-serif` : 'Georgia, "Times New Roman", serif',
      sans: sans ? `"${sans}", ui-sans-serif, system-ui, sans-serif` : 'ui-sans-serif, system-ui, sans-serif',
      mono: mono ? `"${mono}", ui-monospace, monospace` : 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    },
    groups: [
      { name: 'Display', family: 'display', styles: [{ name: 'title', fontWeight: 400 }] },
      { name: 'Interface', family: 'sans', styles: [{ name: 'heading', fontWeight: 700 }, { name: 'body', fontWeight: 400 }, { name: 'label', fontWeight: 500 }, ...(italicBody ? [{ name: 'quote', fontWeight: 400, fontStyle: 'italic' }] : [])] },
      { name: 'Code', family: 'mono', styles: [{ name: 'code', fontWeight: 400 }] },
    ],
  },
});

async function productDir() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-fonts-'));
  return dir;
}

describe('fetching the faces a product names from Google Fonts', () => {
  test('the faces are each role\'s own face, not a system one, with the weights and italics the type sets in it', () => {
    assert.deepEqual(typeFaces(tokens()), [
      { family: 'Acme Condensed', weights: [400], italics: [], fallback: '"Arial Narrow", sans-serif' },
      { family: 'Acme Grotesk', weights: [400, 500, 700], italics: [], fallback: 'ui-sans-serif, system-ui, sans-serif' },
    ]);
    assert.deepEqual(typeFaces(tokens({ display: 'Acme Grotesk', italicBody: true })).map(({ fallback, ...f }) => f), [{ family: 'Acme Grotesk', weights: [400, 500, 700], italics: [400] }], 'one face in two roles is one face');
  });

  test('a face with a weight axis is asked for its whole range; any other for the weights the type uses that it has', () => {
    const meta = (name) => ({ axes: FACES[name].axes, fonts: Object.fromEntries(FACES[name].fonts.map((k) => [k, {}])) });
    assert.deepEqual(faceRequest({ family: 'Acme Grotesk', weights: [400, 500, 700], italics: [] }, meta('Acme Grotesk')), { spec: 'wght@100..900', variable: true, missing: [] });
    assert.equal(faceRequest({ family: 'Acme Grotesk', weights: [400], italics: [400] }, meta('Acme Grotesk')).spec, 'ital,wght@0,100..900;1,100..900', 'italics only where the type uses them');
    assert.deepEqual(faceRequest({ family: 'Acme Condensed', weights: [400], italics: [] }, meta('Acme Condensed')), { spec: 'wght@400', variable: false, missing: [] }, 'a width axis is not a weight range');
    // Google refuses the whole stylesheet when one weight asked is missing, so a weight the face lacks is named, not asked.
    assert.deepEqual(faceRequest({ family: 'Acme Serif', weights: [400, 500, 700], italics: [400] }, meta('Acme Serif')), { spec: 'ital,wght@0,400;0,700;1,400', variable: false, missing: ['500'] });
    assert.equal(faceRequest({ family: 'Acme Serif', weights: [300], italics: [] }, meta('Acme Serif')).spec, 'wght@400', 'none of its weights used: the one nearest');
  });

  test('reads each block of a css2 answer, and names a licence from its file', () => {
    const blocks = parseFaceCss("/* latin-ext */\n@font-face {\n  font-family: 'Acme Grotesk';\n  font-style: normal;\n  font-weight: 100 900;\n  src: url(https://fonts.gstatic.com/s/a/v1/x.woff2) format('woff2');\n}\n/* latin */\n@font-face {\n  font-family: 'Acme Grotesk';\n  font-style: italic;\n  font-weight: 400;\n  font-stretch: 100%;\n  src: url(https://fonts.gstatic.com/s/a/v1/y.woff2) format('woff2');\n}\n");
    assert.deepEqual(blocks, [{ subset: 'latin-ext', style: 'normal', weight: '100 900', url: 'https://fonts.gstatic.com/s/a/v1/x.woff2' }, { subset: 'latin', style: 'italic', weight: '400', url: 'https://fonts.gstatic.com/s/a/v1/y.woff2' }]);
    assert.equal(licenceName('OFL.txt', OFL), 'SIL Open Font License 1.1');
    assert.equal(licenceName('LICENSE.txt', FACES['Acme Serif'].licence.contents), 'Apache License 2.0');
    assert.equal(licenceName('UFL.txt', 'UBUNTU FONT LICENCE Version 1.0'), 'Ubuntu Font Licence 1.0');
    assert.equal(licenceName('LICENCE.txt', 'Some terms'), 'the terms in LICENCE.txt');
  });

  test('writes the latin woff2 of each face with no file, and its licence, and returns the fonts entries with where the licence came from', async () => {
    const dir = await productDir();
    asked.length = 0;
    const run = await fetchFonts({ tokens: tokens(), productDir: dir, bases: { css: base, site: base }, date: new Date('2026-10-29T00:00:00Z') });
    assert.deepEqual(run.notHosted, []);
    assert.deepEqual(run.offline, []);
    assert.deepEqual(run.fetched.map((f) => f.family), ['Acme Condensed', 'Acme Grotesk']);
    const [cond, grot] = run.fetched;
    assert.deepEqual(grot.entries, [{ family: 'Acme Grotesk', file: 'fonts/acme-grotesk.woff2', weight: '100 900', style: 'normal', licence: grot.licence }], 'a variable face is one file, latin only');
    assert.deepEqual(grot.licence, { name: 'SIL Open Font License 1.1', file: 'fonts/acme-grotesk-OFL.txt', source: `${base}/download/list?family=Acme+Grotesk`, fetched: '2026-10-29' });
    assert.deepEqual(cond.entries.map((e) => [e.file, e.weight]), [['fonts/acme-condensed-400.woff2', '400']]);
    assert.deepEqual((await readdir(path.join(dir, 'fonts'))).sort(), ['acme-condensed-400.woff2', 'acme-condensed-OFL.txt', 'acme-grotesk-OFL.txt', 'acme-grotesk.woff2']);
    assert.deepEqual(await readFile(path.join(dir, 'fonts', 'acme-grotesk.woff2')), WOFF2);
    assert.equal(await readFile(path.join(dir, 'fonts', 'acme-grotesk-OFL.txt'), 'utf8'), OFL);
    assert.ok(asked.includes('/css2?family=Acme+Grotesk:wght@100..900'), asked.join('\n'));
    await rm(dir, { recursive: true, force: true });
  });

  test('a face already in product/fonts is left alone, listed or not; other subsets are asked for by name, latin last', async () => {
    const dir = await productDir();
    await mkdir(path.join(dir, 'fonts'), { recursive: true });
    await writeFile(path.join(dir, 'fonts', 'AcmeCondensed-Regular.otf'), 'x');
    const listed = tokens({ display: 'Acme Condensed', sans: 'Acme Serif', mono: 'Acme Grotesk', fonts: [{ family: 'Acme Grotesk', file: 'fonts/grotesk.woff2', weight: '100 900', style: 'normal' }] });
    await writeFile(path.join(dir, 'fonts', 'grotesk.woff2'), 'x');
    const run = await fetchFonts({ tokens: listed, productDir: dir, subsets: ['latin', 'latin-ext'], bases: { css: base, site: base } });
    assert.deepEqual(run.present, [{ family: 'Acme Condensed', why: 'has a file in product/fonts/ not yet listed under fonts: AcmeCondensed-Regular.otf' }, { family: 'Acme Grotesk', why: 'listed under fonts, with its file' }]);
    const serif = run.fetched[0];
    assert.equal(serif.family, 'Acme Serif');
    assert.deepEqual(serif.missing, ['500'], 'the label weight it lacks is named');
    assert.deepEqual(serif.entries.map((e) => e.file), ['fonts/acme-serif-400-latin-ext.woff2', 'fonts/acme-serif-700-latin-ext.woff2', 'fonts/acme-serif-400.woff2', 'fonts/acme-serif-700.woff2']);
    assert.equal(serif.licence.name, 'Apache License 2.0');
    // A file is the longest matching face's: a wider cut's file does not stand in for the face its name begins with.
    const wide = await productDir();
    await mkdir(path.join(wide, 'fonts'), { recursive: true });
    await writeFile(path.join(wide, 'fonts', 'acme-grotesk-wide.otf'), 'x');
    const both = await fetchFonts({ tokens: tokens({ display: 'Acme Grotesk Wide', sans: 'Acme Grotesk' }), productDir: wide, bases: { css: base, site: base } });
    assert.deepEqual(both.present.map((f) => f.family), ['Acme Grotesk Wide']);
    assert.deepEqual(both.fetched.map((f) => f.family), ['Acme Grotesk']);
    await rm(wide, { recursive: true, force: true });
    await rm(dir, { recursive: true, force: true });
  });

  test('a licence file is written by its own name into fonts/, whatever path the answer gives it', async () => {
    const dir = await productDir();
    const run = await fetchFonts({ tokens: tokens({ display: 'Acme Tampered', sans: null }), productDir: dir, bases: { css: base, site: base } });
    assert.equal(run.fetched[0].licence.file, 'fonts/acme-tampered-escaped-OFL.txt');
    assert.deepEqual((await readdir(dir)).sort(), ['fonts']);
    assert.deepEqual((await readdir(path.join(dir, 'fonts'))).sort(), ['acme-tampered-400.woff2', 'acme-tampered-escaped-OFL.txt']);
    await rm(dir, { recursive: true, force: true });
  });

  test('a face Google does not host is the person\'s to supply, and no network says what is missing and how to get it by hand', async () => {
    const dir = await productDir();
    const run = await fetchFonts({ tokens: tokens({ display: 'Acme Private Display' }), productDir: dir, bases: { css: base, site: base } });
    assert.deepEqual(run.notHosted, [{ family: 'Acme Private Display', fallback: '"Arial Narrow", sans-serif' }]);
    assert.deepEqual(run.fetched.map((f) => f.family), ['Acme Grotesk']);
    // A port just closed refuses the connection, as a machine with no network does.
    const closed = createServer();
    await new Promise((r) => closed.listen(0, '127.0.0.1', r));
    const nowhere = `http://127.0.0.1:${closed.address().port}`;
    await new Promise((r) => closed.close(r));
    const off = await fetchFonts({ tokens: tokens(), productDir: dir, bases: { css: nowhere, site: nowhere } });
    assert.deepEqual(off.fetched, []);
    assert.deepEqual(off.offline.map((o) => o.family), ['Acme Condensed'], 'the face the first run fetched is on disk now');
    assert.equal(off.offline[0].error, 'ECONNREFUSED');
    assert.equal(off.offline[0].css, 'https://fonts.googleapis.com/css2?family=Acme+Condensed:wght@400', 'the real address, for a person to open');
    assert.equal(off.offline[0].specimen, 'https://fonts.google.com/specimen/Acme+Condensed');
    await rm(dir, { recursive: true, force: true });
  });

  test('brandi product fonts writes the files, records them and an open question for a face to supply in product.json, and says what comes next', async () => {
    const dir = await productDir();
    const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'brandi.mjs');
    const input = path.join(dir, 'input.json');
    await writeFile(input, JSON.stringify({ name: 'Acme', primary: '#1F6F43', type: { display: 'Acme Private Display', body: 'Acme Grotesk' } }));
    await mkdir(path.join(dir, 'product'));
    await writeFile(path.join(dir, 'product', 'product.json'), JSON.stringify({ name: 'Acme product system', openQuestions: [{ id: 'pq1', question: 'Which payments provider?' }] }));
    // Not spawnSync: the fixture server answers from this process, which a synchronous child would block.
    const brandi = (...args) => new Promise((resolve) => execFile(process.execPath, [cli, 'product', 'fonts', ...args], { cwd: dir, env: { ...process.env, BRANDI_GOOGLE_FONTS: base } }, (e, stdout, stderr) => resolve({ status: e ? e.code : 0, stdout, stderr })));
    const res = await brandi('--input', input, '--json');
    assert.equal(res.status, 0, res.stderr || res.stdout);
    const json = JSON.parse(res.stdout);
    assert.deepEqual(json.fonts.map((f) => f.file), ['fonts/acme-grotesk.woff2']);
    const question = { id: 'pq2', question: 'Acme Private Display: the font files and their licence. Google Fonts does not host it, so the brand supplies both.', assumption: `The fallback stands in until they arrive: ${json.notHosted[0].fallback}.` };
    assert.deepEqual(json.openQuestions, [question]);
    const recorded = JSON.parse(await readFile(path.join(dir, 'product', 'product.json'), 'utf8'));
    assert.deepEqual(Object.keys(recorded), ['name', 'openQuestions', 'fonts'], 'the rest of product.json is kept, in its order');
    assert.deepEqual(recorded.fonts, json.fonts);
    assert.equal(recorded.fonts[0].licence.name, 'SIL Open Font License 1.1');
    assert.deepEqual(recorded.openQuestions, [{ id: 'pq1', question: 'Which payments provider?' }, question]);
    const human = await brandi('--input', input);
    assert.equal(human.status, 0, human.stderr);
    assert.match(human.stdout, /\n {2}Acme Grotesk: listed under fonts, with its file\.\n/, 'a second run finds the first run\'s files');
    assert.match(human.stdout, /\n {2}Acme Private Display: Google Fonts does not host it\. The brand supplies the files and the licence/);
    assert.match(human.stdout, /Then run `brandi product tokens`/);
    assert.equal(JSON.parse(await readFile(path.join(dir, 'product', 'product.json'), 'utf8')).openQuestions.length, 2, 'the question is asked once');
    await rm(dir, { recursive: true, force: true });
  });
});
