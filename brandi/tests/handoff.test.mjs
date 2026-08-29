/**
 * The handover package.
 *
 * The thing worth testing here is not that files copy. It is that a partial
 * handover says what is missing rather than looking complete, because a folder
 * that quietly omits the asset pack looks exactly like one that never needed it.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildHandoff, PARTS } from '../scripts/handoff.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { systemInputFromBrand } from '../scripts/brandfile.mjs';

const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');
let dir; let brand; let system;

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'brandi-handoff-'));
  brand = JSON.parse(await readFile(FIXTURE, 'utf8'));
  system = buildSystem(systemInputFromBrand(brand));
});
after(async () => { await rm(dir, { recursive: true, force: true }); });

const makeBrandDir = async (name, files) => {
  const b = path.join(dir, name, 'brand');
  await mkdir(b, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(b, rel);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, content);
  }
  return b;
};

describe('every part is addressed to a person', () => {
  test('because a handover organised by file type is one nobody can use', () => {
    for (const p of PARTS) {
      assert.ok(p.who && p.who.length > 8, `${p.id} does not say who needs it`);
      assert.ok(p.what && p.what.length > 30, `${p.id} does not say what it is`);
      assert.ok(p.make, `${p.id} does not say how to produce it`);
    }
  });
});

describe('assembling', () => {
  test('a complete brand produces a package with an index', async () => {
    const brandDir = await makeBrandDir('complete', {
      'brand.json': JSON.stringify(brand),
      'brand-book.html': '<!doctype html><title>book</title>',
      'brand-book.pdf': '%PDF-1.4 fake',
      'tokens/tokens.css': ':root{--x:1}',
      'canvas/Main.dc.html': '<x-dc></x-dc>',
      'assets/svg/primary.svg': '<svg/>',
      'logo/master/primary.svg': '<svg/>',
    });
    const out = path.join(dir, 'complete', 'handover');
    const r = await buildHandoff({ brandDir, outDir: out, brand, system });

    assert.equal(r.absent.length, 0, JSON.stringify(r.absent));
    for (const p of PARTS) assert.ok(existsSync(path.join(out, p.dest)), `${p.dest} did not land`);

    const index = await readFile(r.index, 'utf8');
    assert.match(index, /Brand handover/);
    assert.match(index, /Muddy Paws/);
    for (const p of PARTS) assert.ok(index.includes(p.who), `the index does not say who ${p.id} is for`);
    assert.equal(index.includes('What is not here'), false, 'nothing is missing, so do not say so');
  });

  test('directories are copied whole, not as a name', async () => {
    const r = await buildHandoff({
      brandDir: await makeBrandDir('deep', {
        'brand.json': '{}',
        'brand-book.html': 'x',
        'assets/png/favicon-16.png': 'x',
        'assets/svg/black.svg': '<svg/>',
        'tokens/a.css': 'x',
        'canvas/Main.dc.html': 'x',
      }),
      outDir: path.join(dir, 'deep', 'handover'),
      brand,
      system,
    });
    assert.ok(existsSync(path.join(r.outDir, 'assets', 'png', 'favicon-16.png')));
    assert.ok(existsSync(path.join(r.outDir, 'assets', 'svg', 'black.svg')));
    const assets = r.present.find((p) => p.id === 'assets');
    assert.match(assets.size, /2 files/, 'it counts what it actually copied');
  });

  test('a partial handover names what is missing and how to make it', async () => {
    const r = await buildHandoff({
      brandDir: await makeBrandDir('partial', { 'brand.json': '{}', 'brand-book.html': 'x' }),
      outDir: path.join(dir, 'partial', 'handover'),
      brand,
      system,
    });
    const missing = r.absent.map((p) => p.id);
    assert.ok(missing.includes('assets'), 'no asset pack, and the package must say so');
    assert.ok(missing.includes('tokens'));
    const index = await readFile(r.index, 'utf8');
    assert.match(index, /What is not here/);
    assert.match(index, /brandi assets/, 'and it says the command that produces it');
  });

  test('the index opens on a machine that has downloaded nothing', async () => {
    const r = await buildHandoff({
      brandDir: await makeBrandDir('plain', { 'brand.json': '{}', 'brand-book.html': 'x' }),
      outDir: path.join(dir, 'plain', 'handover'),
      brand,
      system,
    });
    const index = await readFile(r.index, 'utf8');
    // A printer's machine is the one most likely to open this first, and it has
    // none of the brand's webfonts.
    assert.equal(/fonts\.googleapis\.com|@font-face/.test(index), false);
    assert.equal(/<script/.test(index), false, 'nothing to run, nothing to block');
    assert.match(index, /-apple-system/, 'a system stack, so it looks composed anywhere');
    assert.equal(index.includes('—'), false, 'the house rule reaches the handover too');
  });

  test('it assembles rather than generates, so an approved book is the book handed over', async () => {
    const brandDir = await makeBrandDir('approved', {
      'brand.json': '{}',
      'brand-book.html': '<!doctype html><title>the one that was approved</title>',
    });
    const out = path.join(dir, 'approved', 'handover');
    await buildHandoff({ brandDir, outDir: out, brand, system });
    assert.match(await readFile(path.join(out, 'brand-book.html'), 'utf8'), /the one that was approved/);
  });
});
