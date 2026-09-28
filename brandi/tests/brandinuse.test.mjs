/**
 * What a person remembers a brand book by: the drawings they loved and the
 * brand on real things. On a real run both were made and neither reached the
 * book, so these tests hold the paths that carry them there.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { artboard } from '../scripts/canvas.mjs';
import { wordmarkArtboard } from '../scripts/artboards.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { systemInputFromBrand } from '../scripts/brandfile.mjs';
import { slotBrief, refinementBrief } from '../scripts/logospec.mjs';
import { dealSlots } from '../scripts/media.mjs';
import * as L from '../scripts/logo.mjs';

const run = promisify(execFile);
const CLI = path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs');
const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');
const DRAWING = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 50 C10 20 90 20 90 50" fill="none" stroke="${fill}" stroke-width="4"/></svg>`;

let dir;
const cli = async (args) => {
  try {
    const { stdout } = await run(process.execPath, [CLI, ...args, '--json'], { cwd: dir, timeout: 240000 });
    return JSON.parse(stdout);
  } catch (e) {
    return { failed: true, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
};

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'brandi-in-use-'));
  await mkdir(path.join(dir, 'brand', 'illustration'), { recursive: true });
  const brand = JSON.parse(await readFile(FIXTURE, 'utf8'));
  brand.identity.illustration = { style: 'One line, drawn by hand. Objects, not people.', themes: ['Bath day'] };
  await writeFile(path.join(dir, 'brand', 'brand.json'), JSON.stringify(brand, null, 2));
  await writeFile(path.join(dir, 'brand', 'illustration', 'bath.svg'), DRAWING('#1F1D1A'));
  await writeFile(path.join(dir, 'brand', 'illustration', 'brush.svg'), DRAWING('#1F6F4A'));
  await writeFile(path.join(dir, 'brand', 'illustration', 'notes.txt'), 'not a drawing');
  await writeFile(path.join(dir, 'outside.svg'), DRAWING('#000'));
});
after(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
});

describe('the illustration library', () => {
  test('records finished drawings by set, and refuses what the book could not print', async () => {
    const added = await cli(['illustration', 'add', 'brand/illustration/bath.svg', 'brand/illustration/brush.svg', '--set', 'Bath day']);
    assert.deepEqual(added.library, [
      { file: 'brand/illustration/bath.svg', set: 'Bath day' },
      { file: 'brand/illustration/brush.svg', set: 'Bath day' },
    ]);
    assert.match((await cli(['illustration', 'add', 'brand/illustration/notes.txt'])).out, /SVG, PNG, JPEG and WebP/);
    assert.match((await cli(['illustration', 'add', 'nope.svg'])).out, /No such file/);
    // Recording the same file again replaces it rather than listing it twice.
    const again = await cli(['illustration', 'add', 'brand/illustration/bath.svg', '--set', 'Bath day', '--title', 'The bath']);
    assert.equal(again.library.length, 2);
    assert.equal(again.library.find((i) => i.file.endsWith('bath.svg')).title, 'The bath');
  });

  test('the book prints the drawings themselves, after the Illustration page', async () => {
    const r = await cli(['book']);
    assert.ok(!r.failed, r.out);
    const html = await readFile(path.join(dir, 'brand', 'brand-book.html'), 'utf8');
    const ids = [...html.matchAll(/<section class="page(?: divider)?" id="([\w-]+)"/g)].map((m) => m[1]);
    assert.equal(ids[ids.indexOf('illustration') + 1], 'illustration-library');
    const page = /<section class="page" id="illustration-library"[^>]*>([\s\S]*?)<\/section>/.exec(html)[1];
    assert.equal((page.match(/<img src="data:image\/svg\+xml;base64,/g) ?? []).length, 2);
    assert.match(page, /alt="The bath"/);
    assert.match(page, /Bath day/);
  });

  test('the handover carries every drawing, filed by set', async () => {
    const out = path.join(dir, 'handover');
    const r = await cli(['handoff', '--out', out]);
    assert.ok(!r.failed, r.out);
    assert.ok(existsSync(path.join(out, 'illustration', 'bath-day', 'bath.svg')));
    assert.ok(existsSync(path.join(out, 'illustration', 'bath-day', 'brush.svg')));
    assert.match(await readFile(path.join(out, 'index.html'), 'utf8'), /The illustration library/);
  });

  test('the companion skill says where the library is', async () => {
    const out = path.join(dir, 'skill');
    const r = await cli(['guardian', '--out', out]);
    assert.ok(!r.failed, r.out);
    const skill = await readFile(path.join(out, 'SKILL.md'), 'utf8');
    assert.match(skill, /## Illustration/);
    assert.match(skill, /2 drawings, in these sets: Bath day/);
    assert.match(skill, /brand\/illustration/);
  });

  test('a file outside the project is refused, because nothing could carry it', async () => {
    assert.match((await cli(['illustration', 'add', path.join(dir, '..', path.basename(dir) + '-elsewhere.svg')])).out, /No such file|outside the project/);
    await writeFile(path.join(tmpdir(), 'brandi-elsewhere.svg'), DRAWING('#000'));
    assert.match((await cli(['illustration', 'add', path.join(tmpdir(), 'brandi-elsewhere.svg')])).out, /outside the project/);
    await rm(path.join(tmpdir(), 'brandi-elsewhere.svg'), { force: true });
  });
});

describe('validate says when the book would end without the things people remember', () => {
  test('no real thing, and a style with no drawings, are both reported once proof exists', async () => {
    const canvas = path.join(dir, 'brand', 'canvas');
    await mkdir(canvas, { recursive: true });
    await writeFile(path.join(canvas, 'Main.dc.html'), artboard({ name: 'Main', fonts: null, body: '<div style="width:600px;height:400px;display:flex;gap:8px"><img src="x.png" alt=""></div>' }));
    const brandFile = path.join(dir, 'brand', 'brand.json');
    const withLibrary = await readFile(brandFile, 'utf8');
    const bare = JSON.parse(withLibrary);
    delete bare.identity.illustration.library;
    await writeFile(brandFile, JSON.stringify(bare));
    const r = await cli(['validate', '--dir', 'brand/canvas']);
    await writeFile(brandFile, withLibrary);
    const ids = JSON.stringify(r);
    assert.match(ids, /no-real-world-proof/);
    assert.match(ids, /illustration-not-recorded/);
    const after = JSON.stringify(await cli(['validate', '--dir', 'brand/canvas']));
    assert.equal(/illustration-not-recorded/.test(after), false, 'recording the library clears it');
    await rm(canvas, { recursive: true, force: true });
  });
});

describe("the forge draws in the brand's own hand", () => {
  test('the house style is the chosen direction and two sentences of the drawing style', () => {
    const style = L.houseStyle({ identity: { school: 'Bookplate, coloured in.', illustration: { style: 'One line, drawn by hand. Closed shapes. No shading.' } } });
    assert.equal(style, 'The chosen direction: Bookplate, coloured in. Its drawing: One line, drawn by hand. Closed shapes.');
    assert.equal(L.houseStyle({ identity: {} }), null);
  });

  test('every slot brief, refinement brief and spark prompt carries it', () => {
    const brief = { name: 'Tinyhuman Books', style: 'Its drawing: One line, drawn by hand.' };
    const slot = { id: 'A1', familyName: 'Wordmark', question: 'q', architectureName: 'Wordmark only', registerName: 'r', faces: ['Bitter'], signals: 's', risk: 'x', deRisk: 'y', smallGrade: 'monogram', mustNotBe: [] };
    assert.match(slotBrief(slot, brief), /The brand's own hand, which this mark has to sit beside: Its drawing: One line, drawn by hand\. Vary the idea, not the hand\./);
    assert.match(refinementBrief({ ...slot, refines: 'A1', refinesFile: 'a.svg', task: 't', gate: 'g' }, brief), /The brand's own hand: Its drawing/);
    const forge = { round: 1, brand: brief, slots: [slot] };
    const [spark] = dealSlots({}, { kinds: ['ideation'], forge }).slots;
    assert.match(spark.prompt, /Draw it in the brand's own hand\. Its drawing: One line, drawn by hand\./);
    const plain = dealSlots({}, { kinds: ['ideation'], forge: { ...forge, brand: { name: 'X' } } }).slots[0];
    assert.equal(/own hand/.test(plain.prompt), false, 'no style recorded, nothing invented');
  });
});

const fixtureSystem = buildSystem(systemInputFromBrand(JSON.parse(await readFile(FIXTURE, 'utf8'))));

describe('the logo sheet specifies the real mark', () => {
  const system = fixtureSystem;
  const master = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100"><path d="M0 0H200V100H0Z" fill="#1F6F4A"/></svg>';

  test('draws the master in one ink at every size, instead of typesetting the name', () => {
    const sheet = wordmarkArtboard(system, { brandName: 'Muddy Paws', markSvg: master });
    assert.match(sheet, /The approved master, drawn from its master file/);
    assert.equal(/Set in .* tracking\. A typeset wordmark/.test(sheet), false);
    assert.ok((sheet.match(/fill="currentColor"/g) ?? []).length >= 8, 'the master is drawn throughout, in currentColor');
    assert.match(sheet, /width: 176px/, 'sized by height at its own 2:1 ratio');
    // Misuse: the outline is drawn as a stroke, and "retype it" shows the name typed.
    assert.match(sheet, /stroke-width="1" vector-effect="non-scaling-stroke"/);
    assert.match(sheet, /filter: drop-shadow/);
    assert.equal(/If a drawn mark is coming/.test(sheet), false, 'the brief for a mark nobody has drawn goes once there is one');
    assert.equal(/approximated at/.test(sheet), false);
  });

  test('still typesets the name when there is no master', () => {
    assert.match(wordmarkArtboard(system, { brandName: 'Muddy Paws' }), /A typeset wordmark is a real identity/);
  });
});

describe('a lockup reads the cap height of the wordmark it is given', () => {
  test('from the file, not from whichever wordmark was set last', async () => {
    const project = await mkdtemp(path.join(tmpdir(), 'brandi-lockup-'));
    await mkdir(path.join(project, 'brand', 'logo'), { recursive: true });
    await writeFile(path.join(project, 'symbol.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0 0H100V100H0Z" fill="#111111"/></svg>');
    await writeFile(path.join(project, 'word.svg'), '<svg data-cap-height="70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100"><path d="M0 10H400V100H0Z" fill="#111111"/></svg>');
    // A stale recipe from some other wordmark, as a parallel agent left it.
    await writeFile(path.join(project, 'brand', 'logo', 'logo.json'), JSON.stringify({ ...L.emptyState({ name: 'X' }), wordmark: { capHeight: 5, file: 'brand/logo/master/wordmark.svg' } }));
    const res = await L.buildLockup(project, { symbol: 'symbol.svg', wordmark: 'word.svg', out: 'lockup.svg' });
    assert.equal(res.construction.unitIs, 'the wordmark cap height');
    assert.equal(res.construction.unit, 70);
    await rm(project, { recursive: true, force: true });
  });

  test('only the master wordmark writes the recorded recipe', async () => {
    const src = await readFile(path.join(import.meta.dirname, '..', 'scripts', 'logo.mjs'), 'utf8');
    const body = /export async function buildWordmark[\s\S]*?\n}\n/.exec(src)[0];
    assert.match(body, /if \(dest === master\) \{\s*state\.wordmark =/);
    assert.match(body, /data-cap-height/);
  });
});
