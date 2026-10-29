import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { assembleDesignSystem, designSystemIndex, coverPage, starterFiles } from '../scripts/productds.mjs';
import { buildProductTokens } from '../scripts/producttokens.mjs';
import { buildSystem } from '../scripts/system.mjs';

const tokens = buildProductTokens(buildSystem({ primary: '#1F6F4A', accents: ['#D9822B'], type: { display: 'Bitter', body: 'Karla' } }), { name: 'Acme product system' });
const system = { name: 'Acme', namespace: 'acme', global: 'Acme', version: '1.2.0', lang: 'en-AU' };

async function product() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-ds-'));
  const starter = path.join(dir, 'starter');
  for (const d of ['system', 'components/system', 'node_modules/x', 'canvas/dist', '.next', 'app']) await mkdir(path.join(starter, d), { recursive: true });
  await writeFile(path.join(starter, 'system', 'system.json'), JSON.stringify(system));
  await writeFile(path.join(starter, 'package.json'), '{}');
  await writeFile(path.join(starter, 'tsconfig.json'), '{}');
  await writeFile(path.join(starter, 'package-lock.json'), '{}');
  await writeFile(path.join(starter, '.gitignore'), 'node_modules');
  await writeFile(path.join(starter, 'node_modules', 'x', 'index.js'), '');
  await writeFile(path.join(starter, 'canvas', 'dist', 'bundle.js'), '');
  await writeFile(path.join(starter, 'app', 'page.tsx'), 'export default function P() { return null }');
  await writeFile(path.join(starter, 'components', 'system', 'button.tsx'), 'export function Button() { return null }');
  await mkdir(path.join(dir, 'components', 'Button'), { recursive: true });
  await mkdir(path.join(dir, 'components', 'previews'), { recursive: true });
  for (const f of ['bundle.js', 'bundle.css', 'index.d.ts', 'manifest.json']) await writeFile(path.join(dir, 'components', f), f);
  await writeFile(path.join(dir, 'components', 'Button', 'README.md'), '# Button\n\nThe pressable action.\n');
  await writeFile(path.join(dir, 'components', 'Button', 'preview.html'), '<!-- @dsCard group="Actions" height=120 -->\n<!doctype html>');
  await writeFile(path.join(dir, 'tokens.json'), JSON.stringify(tokens));
  await mkdir(path.join(dir, 'docs'));
  await writeFile(path.join(dir, 'docs', 'README.md'), '# Acme\n');
  await writeFile(path.join(dir, 'docs', '1-writing.md'), '# Writing\n');
  await mkdir(path.join(dir, 'assets', 'Logos'), { recursive: true });
  await writeFile(path.join(dir, 'assets', 'Logos', 'mark.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(path.join(dir, 'assets', 'Logos', 'README.md'), '# Logos\n');
  return { dir, starter };
}

describe('the Design System artifact, assembled', () => {
  test('the starter goes without node_modules, build output or dot-files, and with its manifests renamed', async () => {
    const { dir, starter } = await product();
    const files = starterFiles(starter).map((f) => f.to).sort();
    assert.ok(files.includes('package.json.txt') && files.includes('tsconfig.json.txt'));
    for (const bad of ['package.json', 'tsconfig.json', 'package-lock.json', '.gitignore']) assert.equal(files.includes(bad), false, bad);
    assert.equal(files.some((f) => f.startsWith('node_modules') || f.startsWith('.next') || f.startsWith('canvas/dist')), false);
    await rm(dir, { recursive: true, force: true });
  });

  test('every file at its path, the index alone in the last call, and pictures listed for upload', async () => {
    const { dir, starter } = await product();
    const out = path.join(dir, '.publish', 'ds');
    const res = assembleDesignSystem({ productDir: dir, starter, outDir: out, title: 'Acme product system' });
    for (const f of ['README.md', '1-writing.md', 'tokens.json', 'components/bundle.js', 'components/index.d.ts', 'components/Button/README.md', 'components/Button/preview.html', 'components/Cover/preview.html', 'starter/package.json.txt', 'starter/app/page.tsx', 'assets/Logos/README.md']) {
      assert.ok(existsSync(path.join(out, 'project', f)), f);
    }
    assert.equal(existsSync(path.join(out, 'project', 'components', 'manifest.json')), false, 'the type generates its own manifest');
    assert.equal(existsSync(path.join(out, 'project', 'tokens.css')), false, 'and its own tokens.css');
    assert.deepEqual(res.calls.at(-1), { root: out, file_path: path.join(out, 'project', 'design-system.json'), files: {} });
    assert.deepEqual(res.uploads.map((u) => `${u.group}/${u.file}`), ['Logos/mark.svg']);
    const index = JSON.parse(await readFile(path.join(out, 'project', 'design-system.json'), 'utf8'));
    assert.equal(index.namespace, 'Acme');
    assert.deepEqual(index.libraries, [{ name: 'react', version: '18' }, { name: 'react-dom', version: '18' }]);
    assert.deepEqual(index.groups, ['Logos', 'Licences'], 'every system carries its Licences group');

    const again = assembleDesignSystem({ productDir: dir, starter, outDir: out, title: 'Acme product system', blobs: { 'Logos/mark.svg': { id: 'abc123', size: 42, type: 'image/svg+xml' } } });
    assert.deepEqual(again.uploads, []);
    const recorded = JSON.parse(await readFile(path.join(out, 'project', 'design-system.json'), 'utf8'));
    assert.deepEqual(recorded.assetGroups.Logos.files['mark.svg'], { name: 'mark.svg', blob: 'abc123', size: 42, type: 'image/svg+xml' });
    await rm(dir, { recursive: true, force: true });
  });

  test('the written system goes README first, then the sections in their numbered order', async () => {
    const { dir, starter } = await product();
    // A plain sort puts every numbered section before README.md, and 10 before 2.
    await writeFile(path.join(dir, 'docs', '10-operating.md'), '# Operating\n');
    await writeFile(path.join(dir, 'docs', '2-screens.md'), '# Screens\n');
    const res = assembleDesignSystem({ productDir: dir, starter, outDir: path.join(dir, '.publish', 'ds'), title: 'Acme product system' });
    assert.deepEqual(res.files.slice(0, 4), ['README.md', '1-writing.md', '2-screens.md', '10-operating.md']);
    await rm(dir, { recursive: true, force: true });
  });

  test('the Licences group lists every face and the icon set with its licence, carries the texts, and names a face with none', async () => {
    const { dir, starter } = await product();
    // product fonts records each face's licence in product.json and fetches its text beside the face.
    await mkdir(path.join(dir, 'fonts'));
    await writeFile(path.join(dir, 'fonts', 'bitter.woff2'), Buffer.alloc(8));
    await writeFile(path.join(dir, 'fonts', 'bitter-OFL.txt'), 'SIL Open Font License, Version 1.1\n');
    await writeFile(path.join(dir, 'product.json'), JSON.stringify({ fonts: [
      { family: 'Bitter', file: 'fonts/bitter.woff2', licence: { name: 'SIL Open Font License 1.1', file: 'fonts/bitter-OFL.txt', source: 'https://fonts.google.com/download/list?family=Bitter' } },
      { family: 'Karla', file: 'fonts/karla.woff2' },
    ] }));
    await mkdir(path.join(starter, 'node_modules', 'lucide-react'), { recursive: true });
    await writeFile(path.join(starter, 'node_modules', 'lucide-react', 'package.json'), JSON.stringify({ name: 'lucide-react', version: '1.62.0', license: 'ISC' }));
    await writeFile(path.join(starter, 'node_modules', 'lucide-react', 'LICENSE'), 'ISC License\n');
    const out = path.join(dir, '.publish', 'ds');
    const res = assembleDesignSystem({ productDir: dir, starter, outDir: out, title: 'Acme product system' });
    const readme = await readFile(path.join(out, 'project', 'assets', 'Licences', 'README.md'), 'utf8');
    assert.match(readme, /Bitter \| SIL Open Font License 1\.1 \| `bitter-OFL\.txt`/);
    assert.match(readme, /Lucide icons \(lucide-react 1\.62\.0\) \| ISC \| `lucide-react-LICENSE\.txt`/);
    assert.match(readme, /Karla \| No licence recorded/);
    for (const f of ['bitter-OFL.txt', 'lucide-react-LICENSE.txt']) assert.ok(existsSync(path.join(out, 'project', 'assets', 'Licences', f)), f);
    const index = JSON.parse(await readFile(path.join(out, 'project', 'design-system.json'), 'utf8'));
    assert.deepEqual(index.groups, ['Logos', 'Licences']);
    assert.deepEqual(res.licences.missing, ['Karla']);
    await rm(dir, { recursive: true, force: true });
  });

  test("the brand's texture goes beside the fonts, at the path tokens.css names it by", async () => {
    const { dir, starter } = await product();
    const withMove = { ...tokens, radius: { ...tokens.radius, moves: [{ name: 'Paper grain', source: 'the guidelines', where: 'hero bands', kind: 'texture', file: 'textures/grain.jpg', strength: 0.5 }] } };
    await writeFile(path.join(dir, 'tokens.json'), JSON.stringify(withMove));
    await mkdir(path.join(dir, 'textures'));
    await writeFile(path.join(dir, 'textures', 'grain.jpg'), Buffer.alloc(32));
    await writeFile(path.join(dir, 'textures', 'unused.jpg'), Buffer.alloc(32));
    const out = path.join(dir, '.publish', 'ds');
    assembleDesignSystem({ productDir: dir, starter, outDir: out, title: 'Acme product system' });
    assert.ok(existsSync(path.join(out, 'project', 'textures', 'grain.jpg')));
    assert.equal(existsSync(path.join(out, 'project', 'textures', 'unused.jpg')), false, 'only the file the move names');
    await rm(dir, { recursive: true, force: true });
  });

  test('a republish against the live index sends what changed since the last staging, drops what went, and the index last', async () => {
    const { dir, starter } = await product();
    const out = path.join(dir, '.publish', 'ds');
    const live = { v: 3, title: 'Acme product system', createdOnFiles: { v: 1, at: '2026-10-01T00:00:00.000Z' } };
    assembleDesignSystem({ productDir: dir, starter, outDir: out, title: 'Acme product system' });
    await writeFile(path.join(dir, 'components', 'Button', 'README.md'), '# Button\n\nThe pressable action, now in the brand\'s shape.\n');
    await rm(path.join(dir, 'docs', '1-writing.md'));
    const sent = (res) => res.calls.flatMap((c) => [path.relative(path.join(out, 'project'), c.file_path), ...Object.keys(c.files).map((f) => f.replace(/^project\//, ''))]);
    const res = assembleDesignSystem({ productDir: dir, starter, outDir: out, title: 'Acme product system', live });
    assert.deepEqual(sent(res).sort(), ['1-writing.md', 'components/Button/README.md', 'design-system.json']);
    assert.equal(res.calls.flatMap((c) => Object.entries(c.files)).find(([k]) => k === 'project/1-writing.md')[1], null, 'a file that went is sent as null, so the system drops it');
    assert.equal(res.calls.at(-1).file_path, path.join(out, 'project', 'design-system.json'), 'the index still goes alone, last');
    assert.ok(res.unchanged.includes('components/bundle.js'));
    const all = assembleDesignSystem({ productDir: dir, starter, outDir: out, title: 'Acme product system', live, all: true });
    assert.ok(sent(all).includes('components/bundle.js'), '--all sends everything');
    await rm(dir, { recursive: true, force: true });
  });

  test('TypeScript and Python go as text/plain through files, and no call leads with one, even a call of nothing else', async () => {
    const { dir, starter } = await product();
    // Enough typed files that a call is made of nothing else: the last one, after the plain files run out.
    await mkdir(path.join(starter, 'components', 'many'), { recursive: true });
    for (let i = 0; i < 600; i++) await writeFile(path.join(starter, 'components', 'many', `part-${String(i).padStart(3, '0')}.tsx`), 'export {}');
    await mkdir(path.join(starter, 'scripts'), { recursive: true });
    await writeFile(path.join(starter, 'scripts', 'gen.py'), 'print(1)');
    const out = path.join(dir, '.publish', 'ds');
    const res = assembleDesignSystem({ productDir: dir, starter, outDir: out, title: 'Acme product system' });
    const typed = /\.(ts|tsx|py)$/;
    assert.ok(res.calls.length >= 3, `${res.calls.length} calls`);
    for (const [i, c] of res.calls.entries()) {
      assert.equal(typed.test(c.file_path), false, `call ${i + 1} leads with ${path.basename(c.file_path)}, which file_path cannot type`);
      assert.ok(Object.keys(c.files).length < 250, `call ${i + 1} holds ${Object.keys(c.files).length + 1} paths`);
      for (const [to, from] of Object.entries(c.files)) {
        if (typed.test(to)) assert.deepEqual(from, { from: to, contentType: 'text/plain' }, to);
        else assert.equal(from, to, to);
      }
    }
    const sent = res.calls.flatMap((c) => [path.relative(path.join(out, 'project'), c.file_path), ...Object.keys(c.files).map((k) => k.slice('project/'.length))]);
    assert.equal(new Set(sent).size, sent.length, 'nothing is sent twice');
    assert.deepEqual([...sent].sort(), [...res.files, 'design-system.json'].sort(), 'and nothing is left out');
    for (const f of ['components/index.d.ts', 'starter/app/page.tsx', 'starter/scripts/gen.py']) assert.ok(sent.includes(f), f);
    await rm(dir, { recursive: true, force: true });
  });

  test('without the written system there is nothing to open on, and it says so', async () => {
    const { dir, starter } = await product();
    await rm(path.join(dir, 'docs'), { recursive: true });
    assert.throws(() => assembleDesignSystem({ productDir: dir, starter, outDir: path.join(dir, 'out'), title: 'x' }), /product\/docs\/README\.md/);
    await rm(dir, { recursive: true, force: true });
  });

  test('a live index keeps its marker, title and every key Brandi does not own', () => {
    const live = { v: 3, layout: 'files', createdOnFiles: { v: 1, at: '2026-01-01T00:00:00Z' }, title: 'Their name', namespace: 'Old', libraries: [], sections: { x: 'y' }, groups: ['Icons'], assetGroups: { Icons: { name: 'Icons', tile: 's', order: ['a.svg'], files: { 'a.svg': { name: 'a.svg', blob: 'q' } } } }, blobs: {}, docs: { readme: 'project/README.md', sections: [] }, custom: 1 };
    const index = designSystemIndex({ live, system, title: 'New name', now: new Date('2026-10-28T00:00:00Z') });
    assert.deepEqual(index.createdOnFiles, live.createdOnFiles);
    assert.equal(index.title, 'Their name');
    assert.equal(index.custom, 1);
    assert.deepEqual(index.sections, { x: 'y' });
    assert.equal(index.namespace, 'Acme');
    assert.equal(index.lastChange.at, '2026-10-28T00:00:00.000Z');
    assert.deepEqual(index.assetGroups.Icons, live.assetGroups.Icons);
  });

  test('the cover is bound to tokens, names the system, and keeps its derivation', () => {
    const cover = coverPage(tokens, system);
    assert.match(cover.split('\n')[0], /^<!-- @dsCard height=288 -->$/);
    assert.match(cover, /\.c0\{fill:var\(--brand\)\}/);
    assert.match(cover, /<h1 class="name"[^>]*>Acme<\/h1>/);
    assert.match(cover, /blocks: brand/);
    assert.equal(/#[0-9a-fA-F]{6}\b/.test(cover), false, 'no raw colour in the cover');
  });
});
