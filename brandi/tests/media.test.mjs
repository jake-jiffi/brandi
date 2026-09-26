/**
 * Generated media through Higgsfield.
 *
 * Nothing here talks to Higgsfield or spends a credit. A fake command line
 * stands in for it, answering the way the real one was observed to answer on
 * 2026-09-26 (a list of jobs from `generate create --json --wait`, `Error:` and
 * `Hint:` lines and exit 4 on a refusal), and a local server stands in for the
 * CDN the results come from. What is tested is Brandi's side of the contract:
 * that it asks for the right things, refuses to spend past a budget, never
 * uploads a file from outside the project, keeps what it paid for, and never
 * lets a raster logo spark into the brand.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, chmod, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

import * as M from '../scripts/media.mjs';
import { renderBrandDeck } from '../scripts/branddeck.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { systemInputFromBrand } from '../scripts/brandfile.mjs';
import { writeRights } from '../scripts/logo.mjs';

const run = promisify(execFile);
const CLI = path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs');
const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');

let dir;
let fake;
let server;
let base;
let fixture;
let catalogueFile;

const P = (name, extra = {}) => ({ name, type: 'string', default: null, required: false, ...extra });
const RATIOS = ['1:1', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '9:16', '16:9', '21:9'];
/** A small catalogue in the shape `model get --json` answers with. */
const CATALOGUE = [
  { job_type: 'nano_banana_pro', display_name: 'Nano Banana Pro', type: 'image', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: RATIOS }), P('resolution', { enum: ['1k', '2k', '4k'] }), P('image_references', { type: 'array' })] },
  { job_type: 'nano_banana_flash', display_name: 'Nano Banana 2', type: 'image', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: RATIOS }), P('resolution', { enum: ['1k', '2k'] })] },
  { job_type: 'gpt_image_2_5', display_name: 'GPT Image 2.5', type: 'image', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: ['1:1', '16:9'] }), P('quality', { enum: ['low', 'medium', 'high', 'xhigh', 'max'] }), P('background', { enum: ['auto', 'opaque', 'transparent'] })] },
  { job_type: 'recraft_v4_1', display_name: 'Recraft V4.1', type: 'image', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: RATIOS }), P('colors', { type: 'array' }), P('background_color'), P('model_type', { enum: ['standard', 'vector'] }), P('resolution', { enum: ['1k', '2k'] })] },
  { job_type: 'kling_omni_image', display_name: 'Kling O1 Image', type: 'image', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: RATIOS })] },
  { job_type: 'topaz_image', display_name: 'Topaz', type: 'image', params: [P('image_references', { required: true }), P('output_width', { required: true })] },
  { job_type: 'kling3_0', display_name: 'Kling v3.0', type: 'video', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: ['16:9', '9:16', '1:1'] }), P('duration', { type: 'integer' }), P('mode', { enum: ['std', 'pro', '4k'] }), P('sound', { enum: ['on', 'off'] }), P('start_image'), P('end_image')] },
  { job_type: 'kling3_5', display_name: 'Kling v3.5', type: 'video', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: ['16:9', '9:16', '1:1'] }), P('duration', { type: 'integer' }), P('mode', { enum: ['std', 'pro', '4k'] }), P('sound', { enum: ['on', 'off'] }), P('start_image'), P('end_image')] },
  { job_type: 'kling3_5_turbo', display_name: 'Kling 3.5 Turbo', type: 'video', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: ['16:9'] }), P('start_image'), P('end_image')] },
  { job_type: 'veo3_1', display_name: 'Google Veo 3.1', type: 'video', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: ['16:9', '9:16'] }), P('quality', { enum: ['basic', 'high', 'ultra'] }), P('start_image')] },
  { job_type: 'seedance_2_5', display_name: 'Seedance 2.5', type: 'video', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: ['16:9', '9:16'] }), P('mode', { enum: ['t2v', 'omni_reference'] }), P('generate_audio', { type: 'boolean' }), P('resolution', { enum: ['480p', '720p', '1080p'] })] },
  { job_type: 'openai_hazel', display_name: 'OpenAI Hazel', type: 'image', params: [P('prompt', { required: true }), P('aspect_ratio', { enum: ['1:1', '3:2', '2:3', 'auto'] }), P('quality', { enum: ['low', 'medium', 'high'] })] },
  { job_type: 'seedance1_5', display_name: 'Seedance 1.5 Pro', type: 'video', params: [P('prompt', { required: true }), P('duration', { type: 'integer', enum: [4, 8, 12] }), P('start_image'), P('end_image'), P('resolution', { enum: ['480p', '1080p'] })] },
  { job_type: 'sonilo_music', display_name: 'Sonilo Music', type: 'audio', params: [P('prompt', { required: true }), P('duration', { required: true })] },
  { job_type: 'text2speech_v2', display_name: 'Text to Speech V2', type: 'audio', params: [P('prompt', { required: true }), P('variant', { required: true }), P('voice_id', { required: true }), P('voice_type', { required: true })] },
  { job_type: 'hunyuan3d_v3_image_to_3d', display_name: 'Hunyuan3D v3 Image to 3D', type: '3d', params: [P('image_references', { required: true }), P('enable_pbr', { type: 'boolean' })] },
];
const catalogue = { fetched: '2026-09-26T00:00:00.000Z', models: CATALOGUE };

const FAKE = `#!/usr/bin/env node
const fs = require('fs');
const { randomUUID } = require('crypto');
const args = process.argv.slice(2);
if (process.env.FAKE_HF_LOG) fs.appendFileSync(process.env.FAKE_HF_LOG, JSON.stringify(args) + '\\n');
const mode = process.env.FAKE_HF_MODE || 'ready';
const base = process.env.FAKE_HF_BASE || 'http://127.0.0.1:1';
const out = (x) => { process.stdout.write(JSON.stringify(x, null, 2) + '\\n'); process.exit(0); };
const refuse = (m, h) => { process.stderr.write('Error: ' + m + '\\n' + (h ? 'Hint: ' + h + '\\n' : '')); process.exit(4); };
const job = (type, id) => {
  const video = type === 'kling3_0';
  const prompt = (args.find((a) => a.startsWith('--prompt=')) || '').slice(9);
  return {
    id, job_type: type, display_name: 'Fake ' + type, created_at: '2026-09-26T00:00:00Z',
    status: mode === 'job-failed' ? 'failed' : 'completed',
    params: { prompt },
    result_url: base + (mode === 'lost' ? '/missing.png' : video ? '/v.mp4' : '/r.png'),
    min_result_url: video ? null : base + '/r_min.webp',
    thumbnail_url: video ? base + '/t.webp' : undefined,
  };
};
if (args[0] === '--version') { process.stdout.write('higgsfield 9.9.9 (fake)\\n'); process.exit(0); }
if (args[0] === 'account' && args[1] === 'status') {
  if (mode === 'signed-out') refuse('Not logged in.', 'Run: hf auth login');
  if (mode === 'no-workspace') refuse('No workspace selected.', 'Run: hf workspace set <workspace_id>');
  out({ credits: Number(process.env.FAKE_HF_CREDITS || 1000), email: 'someone@example.com', subscription_plan_type: 'ultra' });
}
if (args[0] === 'generate' && args[1] === 'cost') {
  if (args[2] === 'bad_model') refuse('No model with job_type "bad_model".');
  out({ credits: Number(process.env.FAKE_HF_COST || 2) });
}
if (args[0] === 'generate' && args[1] === 'create') {
  if (mode === 'fail-create') refuse('Something broke upstream.');
  out([job(args[2], randomUUID())]);
}
if (args[0] === 'generate' && args[1] === 'get') out(job('nano_banana_pro', args[2]));
if (args[0] === 'model') {
  if (mode === 'no-catalogue' || !process.env.FAKE_HF_CATALOGUE) refuse('catalogue unavailable');
  const cat = JSON.parse(fs.readFileSync(process.env.FAKE_HF_CATALOGUE, 'utf8'));
  if (args[1] === 'list') out(cat.map(({ job_type, display_name, type }) => ({ job_type, display_name, type })));
  if (args[1] === 'get') { const m = cat.find((x) => x.job_type === args[2]); if (!m) refuse('No model with job_type "' + args[2] + '".'); out(m); }
}
refuse('unknown command ' + args.join(' '));
`;

const env = (extra = {}) => ({
  ...process.env,
  HIGGSFIELD_PATH: fake,
  FAKE_HF_BASE: base,
  FAKE_HF_CATALOGUE: catalogueFile,
  FFMPEG_PATH: path.join(dir, 'no-ffmpeg'),
  ...extra,
});

/** Run the real CLI against the fake. Returns parsed JSON, failures included. */
async function cli(args, { cwd, extra = {} } = {}) {
  try {
    const { stdout } = await run(process.execPath, [CLI, ...args, '--json'], { cwd, env: env(extra), timeout: 120000 });
    return { code: 0, ...JSON.parse(stdout) };
  } catch (e) {
    if (e.stdout) return { code: e.code, ...JSON.parse(e.stdout) };
    throw e;
  }
}

/**
 * A project with a brand file and, unless told otherwise, a catalogue read a
 * moment ago. Without it every `plan` reads the catalogue afresh, which is a
 * burst of a dozen and more processes, and a burst like that starves the
 * headless-browser tests running beside this file into timing out. Only the
 * tests about reading the catalogue read it.
 */
async function project(name, brand = fixture, { withCatalogue = true } = {}) {
  const root = path.join(dir, name);
  await mkdir(path.join(root, 'brand', 'media'), { recursive: true });
  await writeFile(path.join(root, 'brand', 'brand.json'), JSON.stringify(brand, null, 2));
  if (withCatalogue) {
    await writeFile(path.join(root, 'brand', 'media', 'catalogue.json'), JSON.stringify({ fetched: new Date().toISOString(), models: CATALOGUE, errors: [] }));
  }
  return root;
}

before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'brandi-media-'));
  fake = path.join(dir, 'bin', 'higgsfield');
  await mkdir(path.dirname(fake), { recursive: true });
  await writeFile(fake, FAKE);
  await chmod(fake, 0o755);
  fixture = JSON.parse(await readFile(FIXTURE, 'utf8'));
  catalogueFile = path.join(dir, 'catalogue.json');
  await writeFile(catalogueFile, JSON.stringify(CATALOGUE));
  server = createServer((req, res) => {
    if (req.url.startsWith('/missing')) { res.writeHead(404); res.end(); return; }
    res.writeHead(200);
    res.end(Buffer.from(`bytes of ${req.url}`));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  await rm(dir, { recursive: true, force: true });
});

const withMode = (mode, extra = {}) => (bin, args, opts) => run(bin, args, { ...opts, env: env({ FAKE_HF_MODE: mode, ...extra }) });

// ---------------------------------------------------------------------------

describe('finding it, and never demanding it', () => {
  test('HIGGSFIELD_PATH wins, and a path that is not there means not installed', () => {
    assert.equal(M.findHiggsfield({ env: { HIGGSFIELD_PATH: fake, PATH: '' } }), fake);
    assert.equal(M.findHiggsfield({ env: { HIGGSFIELD_PATH: path.join(dir, 'nope'), PATH: path.dirname(fake) } }), null);
  });

  test('found on PATH under its own names, and never as `hf`, which is Hugging Face on many machines', async () => {
    const only = path.join(dir, 'only-hf');
    await mkdir(only, { recursive: true });
    await writeFile(path.join(only, 'hf'), '#!/bin/sh\n');
    await chmod(path.join(only, 'hf'), 0o755);
    assert.equal(M.findHiggsfield({ env: { PATH: only } }), null);
    const higgs = path.join(dir, 'higgs-only');
    await mkdir(higgs, { recursive: true });
    await writeFile(path.join(higgs, 'higgs'), '#!/bin/sh\n');
    await chmod(path.join(higgs, 'higgs'), 0o755);
    assert.equal(M.findHiggsfield({ env: { PATH: `${only}${path.delimiter}${higgs}` } }), path.join(higgs, 'higgs'));
  });

  test('not installed is an answer with the install steps, not an error', async () => {
    const p = await M.probeHiggsfield({ env: { HIGGSFIELD_PATH: path.join(dir, 'nope') } });
    assert.equal(p.available, false);
    assert.equal(p.state, 'not-installed');
    assert.ok(p.suggest.includes('npm install -g @higgsfield/cli'));
    assert.ok(p.suggest.includes('higgsfield auth login'));
    assert.match(M.statusText(p), /works completely without it/);
  });

  test('ready reports the plan and the credits', async () => {
    const p = await M.probeHiggsfield({ env: env(), exec: withMode('ready', { FAKE_HF_CREDITS: '6937.66' }) });
    assert.equal(p.available, true);
    assert.equal(p.plan, 'ultra');
    assert.equal(p.credits, 6937.66);
    assert.match(M.statusText(p), /6,937 credits/);
  });

  test('signed out and no workspace each get their own next step', async () => {
    const out = await M.probeHiggsfield({ env: env(), exec: withMode('signed-out') });
    assert.equal(out.state, 'signed-out');
    assert.deepEqual(out.suggest, ['higgsfield auth login']);
    assert.match(out.reason, /Not logged in\. \(Run: hf auth login\)/);
    const ws = await M.probeHiggsfield({ env: env(), exec: withMode('no-workspace') });
    assert.equal(ws.state, 'no-workspace');
    assert.ok(ws.suggest.some((s) => s.startsWith('higgsfield workspace set')));
  });

  test('`brandi media status` exits 0 whether or not it is there', async () => {
    const root = await project('status');
    const none = await cli(['media', 'status'], { cwd: root, extra: { HIGGSFIELD_PATH: path.join(dir, 'nope') } });
    assert.equal(none.code, 0);
    assert.equal(none.available, false);
    const ready = await cli(['media', 'status'], { cwd: root });
    assert.equal(ready.code, 0);
    assert.equal(ready.available, true);
  });
});

describe('dealing what the brand file calls for', () => {
  test('photography per image-bearing surface, shaped by the surface', () => {
    const { slots } = M.dealSlots(fixture, { kinds: ['photo'] });
    const ids = slots.map((s) => s.id);
    assert.deepEqual(ids, ['photo-home-page', 'photo-phone', 'photo-a4-flyer']);
    assert.equal(slots[0].params.aspect_ratio, '16:9');
    assert.equal(slots[1].params.aspect_ratio, '4:5', 'a phone frame is portrait whatever its surface is called');
    assert.equal(slots[2].params.aspect_ratio, '2:3');
    assert.equal(slots[0].params.resolution, '4k');
    for (const s of slots) {
      assert.equal(s.prompt, null, 'the prompt is judgement, so it is written, not dealt');
      assert.equal(M.slotState(s), 'needs-prompt');
      assert.match(s.brief, /#1F6F4A/, 'the palette reaches the brief');
      assert.match(s.brief, /Never: Stock photography/, 'and so do the refusals');
      assert.match(s.brief, /No text, lettering, logos/);
      assert.match(s.brief, /labelled as generated/);
    }
  });

  test('no art direction, no photographs, and it says why', () => {
    const b = structuredClone(fixture);
    b.identity.imagery.direction = null;
    const { slots, notes } = M.dealSlots(b, { kinds: ['photo'] });
    assert.equal(slots.length, 0);
    assert.match(notes.join(' '), /would be inventing one/);
  });

  test('a blank scene for every physical surface, and none for one already mocked up', () => {
    const { slots } = M.dealSlots(fixture, { kinds: ['scene'] });
    assert.deepEqual(slots.map((s) => s.id), ['scene-bay-instructions', 'scene-shopfront']);
    assert.match(slots[1].brief, /must be BLANK/);
    assert.match(slots[1].brief, /brandi mockup grid/);
    assert.equal(/Real dogs, mid-action/.test(slots[1].brief), false, 'a blank shopfront is not OF the photo direction');
    const b = structuredClone(fixture);
    b.identity.mockups = [{ name: 'Shopfront', photo: 'x.jpg', surfaces: [] }];
    assert.deepEqual(M.dealSlots(b, { kinds: ['scene'] }).slots.map((s) => s.id), ['scene-bay-instructions']);
  });

  test('no illustration style, no illustration: absent is honest', () => {
    const { slots, notes } = M.dealSlots(fixture, { kinds: ['illustration'] });
    assert.equal(slots.length, 0);
    assert.match(notes.join(' '), /would invent one/);
    const b = structuredClone(fixture);
    b.identity.illustration = { style: 'Single-weight line drawings', themes: ['The bay', 'The dryer'] };
    const dealt = M.dealSlots(b, { kinds: ['illustration'] }).slots;
    assert.equal(dealt.length, 2);
    assert.deepEqual(dealt[0].params.colors, ['#1F6F4A', '#D4823A'], 'the palette goes to the model as hard colours');
  });

  test('the sting starts on the ground and ends on the rendered master, or is not dealt', () => {
    const none = M.dealSlots(fixture, { kinds: ['motion'], frames: { master: false } });
    assert.deepEqual(none.slots.map((s) => s.id), ['motion-hero'], 'loops need only the direction');
    assert.match(none.notes.join(' '), /No logo sting dealt/);
    const frames = {
      master: true, error: null,
      'ground-16x9': 'brand/media/frames/ground-16x9.png', 'mark-16x9': 'brand/media/frames/mark-16x9.png',
    };
    const sting = M.dealSlots(fixture, { kinds: ['motion'], frames }).slots.find((s) => s.id === 'motion-sting');
    assert.deepEqual(sting.refs, { start_image: 'brand/media/frames/ground-16x9.png', end_image: 'brand/media/frames/mark-16x9.png' });
    assert.match(sting.brief, /must END exactly on the end frame/);
    assert.match(sting.brief, /Never redraw, morph, restyle/);
    assert.match(sting.brief, /Water settles/, 'the motion principle reaches the brief');
    const blocked = M.dealSlots(fixture, { kinds: ['motion'], frames: { master: true, error: 'no browser' } }).slots.find((s) => s.id === 'motion-sting');
    assert.equal(M.slotState(blocked), 'blocked');
  });

  test('sound, voice and 3D only when asked for', () => {
    assert.equal(M.dealSlots(fixture).slots.some((s) => ['sound', 'voice', 'object'].includes(s.kind)), false);
    const { slots } = M.dealSlots(fixture, { kinds: ['sound', 'voice'] });
    assert.deepEqual(slots.map((s) => s.id), ['sound-mnemonic', 'voice-line']);
    assert.match(slots[1].brief, /The good kind of wet dog/);
  });

  test('an unknown kind is refused by name', () => {
    assert.throws(() => M.parseKinds('photo,film'), /Unknown kind: film/);
    assert.deepEqual(M.parseKinds(undefined), [...M.DEFAULT_KINDS]);
  });
});

describe('logo sparks', () => {
  const forge = {
    round: 1,
    brand: { name: 'Muddy Paws', oneLiner: 'For dog owners who would rather not: warm water and a proper dryer.' },
    slots: [
      { id: 'A1', familyName: 'Wordmark', architectureName: 'Wordmark only', registerName: 'Geometric sans', symbolApproach: null, signals: 'Modern', mustNotBe: ['paw print', 'swoosh'] },
      { id: 'B1', familyName: 'Monogram', architectureName: 'Letterform', registerName: 'Didone', symbolApproach: 'Initial', symbolBrief: 'An M.', signals: 'Old', mustNotBe: [] },
      { id: 'C1', familyName: 'Symbol', architectureName: 'Symbol and wordmark', registerName: 'Humanist', symbolApproach: 'Pictorial', signals: 'Warm', mustNotBe: [] },
      { id: 'A1p', refines: 'A1', architectureName: 'Wordmark only' },
    ],
  };

  test('one spark per concept slot, each from a different model, never from a refinement', () => {
    const { slots } = M.dealSlots(fixture, { kinds: ['ideation'], forge });
    assert.deepEqual(slots.map((s) => s.id), ['idea-A1', 'idea-B1', 'idea-C1']);
    assert.equal(new Set(slots.map((s) => s.model)).size, 3, 'rotating the model is half the variety');
    assert.equal(slots[0].forgeSlot, 'A1');
    assert.equal(M.slotState(slots[0]), 'ready', 'a spark wall is a fan-out, so its prompts are dealt');
    assert.match(slots[0].prompt, /Flat solid black on pure white/);
    assert.match(slots[0].prompt, /spell it exactly "Muddy Paws"/);
    assert.match(slots[0].prompt, /Avoid: paw print; swoosh/);
    assert.match(slots[0].prompt, /For dog owners who would rather not\. /, 'the gist, not the whole positioning');
  });

  test('a model other than the kind default gets only its own parameters', () => {
    const { slots } = M.dealSlots(fixture, { kinds: ['ideation'], forge: { ...forge, slots: Array.from({ length: 7 }, (_, i) => ({ ...forge.slots[0], id: `X${i}` })) } });
    const hazel = slots.find((s) => s.model === 'openai_hazel');
    assert.ok(hazel);
    assert.equal('resolution' in hazel.params, false, 'openai_hazel has no resolution, and passing one gets the job refused');
    const added = M.newSlot('custom', { kind: 'photo', model: 'seedream_v5_pro' });
    assert.equal(added.params.resolution, undefined, 'nano_banana_pro\'s 4k is not seedream\'s to take');
  });

  test('no forge round, no sparks, and it says what to run', () => {
    const { slots, notes } = M.dealSlots(fixture, { kinds: ['ideation'], forge: null });
    assert.equal(slots.length, 0);
    assert.match(notes.join(' '), /brandi logo plan/);
  });

  test('a spark can be picked and can never be approved into the brand', async () => {
    const plan = { slots: [{ id: 'idea-A1', kind: 'ideation', results: [{ id: 'idea-A1-1', file: 'x.png' }] }] };
    await assert.rejects(
      M.approveResults({ brand: structuredClone(fixture), plan, ids: ['idea-A1-1'], approvedBy: 'Jake', brandDir: dir, projectRoot: dir }),
      /Sparks are references the forge redraws in vector, never part of the brand/,
    );
  });

  test('the generation manifest records the sparks a round drew on', async () => {
    const root = path.join(dir, 'rights');
    await mkdir(path.join(root, 'brand', 'media'), { recursive: true });
    await writeFile(path.join(root, 'brand', 'media', 'plan.json'), JSON.stringify({
      slots: [
        { id: 'idea-C1', kind: 'ideation', forgeSlot: 'C1', results: [{ id: 'idea-C1-1', picked: true, model: 'flux_2', modelName: 'FLUX.2', jobId: 'job-123', file: 'brand/media/ideation/idea-C1-1.png' }] },
        { id: 'idea-A1', kind: 'ideation', forgeSlot: 'A1', results: [{ id: 'idea-A1-1', picked: false, jobId: 'job-999' }] },
      ],
    }));
    await writeRights(root, { master: { chosenFrom: 'C1p', round: 2, provenance: {} } });
    const manifest = await readFile(path.join(root, 'brand', 'logo', 'rights', 'generation-manifest.md'), 'utf8');
    assert.match(manifest, /Sketches the round drew on/);
    assert.match(manifest, /idea-C1-1 \| C1 \(the master's slot\) \| FLUX\.2 \| job-123/);
    assert.equal(manifest.includes('job-999'), false, 'an unpicked spark did not shape anything');
  });
});

describe('dealing again keeps what was written and what was paid for', () => {
  test('authored prompts, overrides and results survive; the brief follows the brand', () => {
    const first = M.dealSlots(fixture, { kinds: ['photo'] }).slots;
    const slot = first[0];
    M.setSlotField(slot, 'prompt', 'A wet kelpie mid-shake.');
    M.setSlotField(slot, 'params.aspect_ratio', '21:9');
    slot.results.push({ id: 'photo-home-page-1', file: 'a.png', credits: 4 });
    const b = structuredClone(fixture);
    b.identity.colour.primary = '#225588';
    const merged = M.mergePlan({ slots: first }, M.dealSlots(b, { kinds: ['photo'] }).slots);
    const again = merged.find((s) => s.id === slot.id);
    assert.equal(again.prompt, 'A wet kelpie mid-shake.');
    assert.equal(again.params.aspect_ratio, '21:9');
    assert.equal(again.params.resolution, '4k', 'dealt values nobody touched still follow the deal');
    assert.equal(again.results.length, 1);
    assert.match(again.brief, /#225588/);
    assert.ok(M.promptIsStale(again), 'a prompt written against the old palette is flagged, not silently kept');
  });

  test('a dealt slot the brand no longer needs is dropped, unless it has results', () => {
    const first = M.dealSlots(fixture, { kinds: ['scene'] }).slots;
    first[0].results.push({ id: 'scene-bay-instructions-1', credits: 2 });
    const added = M.newSlot('extra-shot', { kind: 'photo', prompt: 'x' });
    const b = structuredClone(fixture);
    b.applications = [];
    const merged = M.mergePlan({ slots: [...first, added] }, M.dealSlots(b, { kinds: ['scene'] }).slots);
    assert.deepEqual(merged.map((s) => s.id), ['scene-bay-instructions', 'extra-shot']);
    assert.ok(merged[0].retired);
    assert.equal(M.slotState(merged[0]), 'retired');
  });
});

describe('editing a slot', () => {
  const slot = () => M.newSlot('s', { kind: 'photo' });

  test('parameters that would change how the CLI behaves are refused', () => {
    for (const bad of ['json', 'wait', 'prompt', 'help', 'image']) {
      assert.throws(() => M.setSlotField(slot(), `params.${bad}`, 'x'), /cannot be set/);
    }
    assert.throws(() => M.setSlotField(slot(), 'params.image_references', '["a.png"]'), /refs\.image_references/);
    assert.throws(() => M.setSlotField(slot(), 'params.wait-timeout', '1m'), /cannot be set/);
  });

  test('values are JSON when they parse, strings when they do not, and null removes', () => {
    const s = slot();
    M.setSlotField(s, 'params.duration', '5');
    M.setSlotField(s, 'params.colors', '["#111111"]');
    M.setSlotField(s, 'params.aspect_ratio', '4:5');
    assert.equal(s.params.duration, 5);
    assert.deepEqual(s.params.colors, ['#111111']);
    assert.equal(s.params.aspect_ratio, '4:5');
    M.setSlotField(s, 'params.resolution', 'null');
    assert.equal('resolution' in s.params, false);
  });

  test('models, counts, roles and ids are checked', () => {
    assert.throws(() => M.setSlotField(slot(), 'model', 'rm -rf'), /not a model id/);
    assert.throws(() => M.setSlotField(slot(), 'count', '0'), /1 to 8/);
    assert.throws(() => M.setSlotField(slot(), 'refs.mask', 'a.png'), /not a media role/);
    assert.throws(() => M.setSlotField(slot(), 'colour', 'x'), /Cannot set/);
    assert.throws(() => M.newSlot('../x', { kind: 'photo' }), /lower case/);
    assert.throws(() => M.newSlot('x', { kind: 'film' }), /--kind is one of/);
  });
});

describe('the command line for a slot', () => {
  test('every value in the equals form, so a prompt starting with -- stays a prompt', async () => {
    const s = M.newSlot('p', { kind: 'photo', prompt: '--wait for it' });
    const args = await M.argvFor(s, { projectRoot: dir, op: 'create' });
    assert.deepEqual(args.slice(0, 3), ['generate', 'create', M.KINDS.photo.model]);
    assert.ok(args.includes('--prompt=--wait for it'));
    assert.ok(args.includes('--resolution=4k'));
    assert.ok(args.includes('--json'));
    // The CLI's own flags take the spaced form; `--wait-timeout=10m` is read as
    // a model parameter and the job is refused. Found against the real CLI.
    const at = args.indexOf('--wait-timeout');
    assert.ok(at > 0 && args[at + 1] === '10m', args.join(' '));
    assert.ok(args.includes('--wait'));
  });

  test('pricing never waits, and arrays go as JSON', async () => {
    const s = M.newSlot('i', { kind: 'illustration', prompt: 'x', params: { colors: ['#1F6F4A'] } });
    const args = await M.argvFor(s, { projectRoot: dir, op: 'cost' });
    assert.equal(args[1], 'cost');
    assert.ok(args.includes('--colors=["#1F6F4A"]'));
    assert.equal(args.includes('--wait'), false);
  });

  test('a slot that needs a prompt and has none is refused, one that takes a file is not', async () => {
    await assert.rejects(M.argvFor(M.newSlot('p', { kind: 'photo' }), { projectRoot: dir }), /no prompt/);
    const root = path.join(dir, 'argv');
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, 'mark.png'), 'x');
    const obj = M.newSlot('o', { kind: 'object', refs: { image_references: ['mark.png'] } });
    const args = await M.argvFor(obj, { projectRoot: root });
    assert.equal(args.some((a) => a.startsWith('--prompt')), false);
    assert.ok(args.includes(`--image-references=${path.join(root, 'mark.png')}`));
  });

  test('nothing outside the project is ever uploaded, however it is reached', async () => {
    const root = path.join(dir, 'guard');
    await mkdir(root, { recursive: true });
    const secret = path.join(dir, 'secret.png');
    await writeFile(secret, 'x');
    await symlink(secret, path.join(root, 'inside.png'));
    await assert.rejects(M.resolveRef('../secret.png', root), /outside the project/);
    await assert.rejects(M.resolveRef('inside.png', root), /outside the project/, 'a symlink is not a string');
    await assert.rejects(M.resolveRef('nothing.png', root), /not on disk/);
    assert.equal(await M.resolveRef('0b1f48b6-8333-4da6-8d77-4b9f0c075503', root), '0b1f48b6-8333-4da6-8d77-4b9f0c075503');
  });

  test('job answers in every shape the CLI gives them', () => {
    assert.equal(M.parseJobs('[{"id":"a"}]').length, 1);
    assert.equal(M.parseJobs('{"id":"a"}')[0].id, 'a');
    assert.equal(M.parseJobs('{"jobs":[{"id":"a"},{"id":"b"}]}').length, 2);
    assert.throws(() => M.parseJobs('{"credits":2}'), /not a job/);
    assert.equal(M.extensionOf('https://x/y/hf_1.mp4'), '.mp4');
    assert.equal(M.extensionOf('https://x/y/hf_1.JPEG'), '.jpg');
    assert.equal(M.extensionOf('https://x/y/z?format=png'), '.bin');
  });

  test('the CLI\'s refusals come back as one readable line', () => {
    assert.equal(M.cleanError({ stderr: 'Error: Missing required params: duration\nHint: Run: hf model get sonilo_music\n' }), 'Missing required params: duration (Run: hf model get sonilo_music)');
    assert.match(M.cleanError({ killed: true, signal: 'SIGTERM' }), /timed out/);
  });
});

describe('running', () => {
  const planFor = async (name, slots) => {
    const root = await project(name);
    const brandDir = path.join(root, 'brand');
    const plan = { ...M.emptyPlan(), slots };
    return { root, brandDir, plan };
  };

  test('prices, creates, downloads the file and its preview, and records what it cost', async () => {
    const photo = M.newSlot('photo-x', { kind: 'photo', prompt: 'a dog', count: 2 });
    const { root, brandDir, plan } = await planFor('run-ok', [photo]);
    const exec = withMode('ready', { FAKE_HF_COST: '4' });
    const est = await M.estimate([photo], { bin: fake, exec, projectRoot: root });
    assert.equal(est.total, 8);
    let saves = 0;
    const { made, failed } = await M.runSlots(est.priced, { bin: fake, exec, brandDir, projectRoot: root, save: async () => { saves++; } });
    assert.equal(failed.length, 0);
    assert.deepEqual(made.map((r) => r.id), ['photo-x-1', 'photo-x-2']);
    assert.equal(made[0].file, 'brand/media/photo/photo-x-1.png');
    assert.equal(made[0].preview, 'brand/media/photo/photo-x-1.preview.webp');
    assert.equal(made[0].previewKind, 'image');
    assert.equal(made[0].credits, 4);
    assert.equal(made[0].prompt, 'a dog');
    assert.ok(existsSync(path.join(root, made[1].file)));
    assert.ok(saves >= 2, 'saved after every job, so an interrupted run keeps what it got');
    assert.equal(M.spentOf(plan), 8);
    assert.equal(M.slotState(photo), 'done');
    assert.equal(M.callsFor(photo), 0);
    assert.equal(M.callsFor(photo, { force: true }), 2);
  });

  test('a video without ffmpeg falls back to Higgsfield\'s first frame, and says so', async () => {
    const v = M.newSlot('motion-x', { kind: 'motion', prompt: 'x' });
    const { root, brandDir } = await planFor('run-video', [v]);
    const { made } = await M.runSlots([{ slot: v, calls: 1, each: 8.75 }], { bin: fake, exec: withMode('ready'), brandDir, projectRoot: root, ffmpeg: null, save: async () => {} });
    assert.equal(made[0].file, 'brand/media/motion/motion-x-1.mp4');
    assert.equal(made[0].previewKind, 'first-frame');
  });

  test('a refused create stops the slot and records why, without trying again', async () => {
    const s = M.newSlot('p', { kind: 'photo', prompt: 'x', count: 3 });
    const { root, brandDir } = await planFor('run-fail', [s]);
    const log = path.join(root, 'calls.log');
    const { made, failed } = await M.runSlots([{ slot: s, calls: 3, each: 2 }], {
      bin: fake, exec: withMode('fail-create', { FAKE_HF_LOG: log }), brandDir, projectRoot: root, save: async () => {},
    });
    assert.equal(made.length, 0);
    assert.equal(failed.length, 1);
    assert.match(s.failures[0].error, /Something broke upstream/);
    const creates = (await readFile(log, 'utf8')).trim().split('\n').filter((l) => l.includes('"create"'));
    assert.equal(creates.length, 1, 'a slot that failed does not keep spending into the same failure');
  });

  test('a finished job that did not download keeps its job id and says how to recover it', async () => {
    const s = M.newSlot('p', { kind: 'photo', prompt: 'x' });
    const { root, brandDir } = await planFor('run-lost', [s]);
    const { failed } = await M.runSlots([{ slot: s, calls: 1, each: 2 }], { bin: fake, exec: withMode('lost'), brandDir, projectRoot: root, save: async () => {} });
    assert.match(failed[0].error, /brandi media import [0-9a-f-]{36} --slot p/);
    assert.ok(s.failures[0].jobId);
  });

  test('a job that ended badly is recorded as a failure, not a result', async () => {
    const s = M.newSlot('p', { kind: 'photo', prompt: 'x' });
    const { root, brandDir } = await planFor('run-bad', [s]);
    const { made, failed } = await M.runSlots([{ slot: s, calls: 1, each: 2 }], { bin: fake, exec: withMode('job-failed'), brandDir, projectRoot: root, save: async () => {} });
    assert.equal(made.length, 0);
    assert.match(failed[0].error, /ended failed/);
  });

  test('a model that cannot be priced is reported and not run', async () => {
    const s = M.newSlot('p', { kind: 'photo', prompt: 'x', model: 'bad_model' });
    const est = await M.estimate([s], { bin: fake, exec: withMode('ready'), projectRoot: dir });
    assert.equal(est.priced.length, 0);
    assert.match(est.errors[0].error, /No model with job_type "bad_model"/);
  });
});

describe('the whole thing through the command line', () => {
  let root;

  before(async () => {
    root = await project('journey');
  });

  test('plan deals, nothing runs without prompts, and the budget refuses before anything is created', async () => {
    const plan = await cli(['media', 'plan'], { cwd: root });
    assert.equal(plan.ok, true);
    assert.ok(plan.slots.some((s) => s.id === 'photo-home-page'));
    assert.ok(existsSync(path.join(root, 'brand', 'media', 'plan.json')));

    const nothing = await cli(['media', 'run'], { cwd: root });
    assert.equal(nothing.ok, false);
    assert.match(nothing.error, /Nothing to run/);

    await cli(['media', 'set', 'photo-home-page', 'prompt', 'A wet kelpie mid-shake in a tiled bay.'], { cwd: root });
    const log = path.join(root, 'calls.log');
    const refused = await cli(['media', 'run', 'photo-home-page', '--budget', '3'], { cwd: root, extra: { FAKE_HF_LOG: log, FAKE_HF_COST: '4' } });
    assert.equal(refused.ok, false);
    assert.match(refused.error, /Refused before anything was created/);
    assert.equal(refused.total, 8);
    const calls = (await readFile(log, 'utf8')).trim().split('\n');
    assert.equal(calls.some((l) => l.includes('"create"')), false, 'a refused budget created nothing');
  });

  test('an account that cannot cover the run is refused too', async () => {
    const r = await cli(['media', 'run', 'photo-home-page'], { cwd: root, extra: { FAKE_HF_CREDITS: '5', FAKE_HF_COST: '4' } });
    assert.equal(r.ok, false);
    assert.match(r.error, /account has 5/);
  });

  test('without Higgsfield the plan still works and the run says how to get it', async () => {
    const r = await cli(['media', 'run', 'photo-home-page'], { cwd: root, extra: { HIGGSFIELD_PATH: path.join(dir, 'nope') } });
    assert.equal(r.ok, false);
    assert.match(r.error, /npm install -g @higgsfield\/cli/);
    const list = await cli(['media', 'list'], { cwd: root, extra: { HIGGSFIELD_PATH: path.join(dir, 'nope') } });
    assert.equal(list.ok, true);
  });

  test('run, board, approve by name, and the book and the handover carry it', async () => {
    const ran = await cli(['media', 'run', 'photo-home-page'], { cwd: root });
    assert.equal(ran.ok, true, ran.error);
    assert.deepEqual(ran.made.map((m) => m.id), ['photo-home-page-1', 'photo-home-page-2']);

    const again = await cli(['media', 'run', 'photo-home-page'], { cwd: root });
    assert.equal(again.ok, false, 'a slot with its results is not paid for twice without --force');
    assert.match(again.error, /already has its results/);

    const board = await cli(['media', 'board'], { cwd: root });
    assert.deepEqual(board.boards.map((b) => b.file), ['Main.dc.html', 'MediaPhoto.dc.html']);
    assert.ok(existsSync(path.join(root, 'brand', 'media', 'canvas', 'photo-home-page-1.webp')), 'boards embed the preview, not the 4K file');
    const validated = await cli(['validate', '--dir', 'brand/media/canvas'], { cwd: root });
    assert.equal((validated.errors ?? []).length, 0, JSON.stringify(validated.errors));

    const nameless = await cli(['media', 'approve', 'photo-home-page-2'], { cwd: root });
    assert.equal(nameless.ok, false);
    assert.match(nameless.error, /approved-by/);

    const approved = await cli(['media', 'approve', 'photo-home-page-2', '--approved-by', 'Jake'], { cwd: root });
    assert.equal(approved.ok, true, approved.error);
    const brand = JSON.parse(await readFile(path.join(root, 'brand', 'brand.json'), 'utf8'));
    const rec = brand.identity.media.find((m) => m.id === 'photo-home-page-2');
    assert.equal(rec.approvedBy, 'Jake');
    assert.equal(rec.provenance, 'generated');
    assert.equal(rec.file, 'brand/media/approved/photo/photo-home-page-2.png');
    assert.ok(existsSync(path.join(root, rec.file)));

    const book = await cli(['book'], { cwd: root });
    assert.equal(book.ok, true, book.error);
    const html = await readFile(path.join(root, 'brand', 'brand-book.html'), 'utf8');
    assert.match(html, /id="photography-samples"/);
    assert.match(html, /Generated with Fake [a-z0-9_]+, approved by Jake/);
    assert.match(html, /They are not photographs of the business/);

    const handoff = await cli(['handoff', '--out', 'handover'], { cwd: root });
    assert.ok(handoff.present.some((p) => p.id === 'media'), JSON.stringify(handoff.present?.map((p) => p.id)));
    assert.ok(existsSync(path.join(root, 'handover', 'media', 'photo', 'photo-home-page-2.png')));
  });

  test('a job made directly with higgsfield is imported and recorded like any other', async () => {
    const r = await cli(['media', 'import', '11111111-2222-4333-8444-555555555555', '--kind', 'photo', '--title', 'Product shot'], { cwd: root });
    assert.equal(r.ok, true, r.error);
    assert.equal(r.slot, 'import-11111111');
    const dup = await cli(['media', 'import', '11111111-2222-4333-8444-555555555555', '--slot', 'import-11111111'], { cwd: root });
    assert.equal(dup.ok, false);
    assert.match(dup.failed[0].error, /already recorded/);
    const junk = await cli(['media', 'import', 'not-a-job', '--slot', 'import-11111111'], { cwd: root });
    assert.match(junk.failed[0].error, /not a Higgsfield job id/);
  });

  test('pick shortlists, and --clear takes it back', async () => {
    const picked = await cli(['media', 'pick', 'photo-home-page-1'], { cwd: root });
    assert.deepEqual(picked.picked, ['photo-home-page-1']);
    const plan = JSON.parse(await readFile(path.join(root, 'brand', 'media', 'plan.json'), 'utf8'));
    assert.equal(plan.slots.find((s) => s.id === 'photo-home-page').results[0].picked, true);
    await cli(['media', 'pick', 'photo-home-page-1', '--clear'], { cwd: root });
    const after = JSON.parse(await readFile(path.join(root, 'brand', 'media', 'plan.json'), 'utf8'));
    assert.equal(after.slots.find((s) => s.id === 'photo-home-page').results[0].picked, false);
  });

  test('dealing one kind again does not retire the others', async () => {
    await cli(['media', 'plan', '--kinds', 'sound'], { cwd: root });
    const plan = JSON.parse(await readFile(path.join(root, 'brand', 'media', 'plan.json'), 'utf8'));
    const ids = plan.slots.map((s) => s.id);
    assert.ok(ids.includes('photo-home-page') && ids.includes('sound-mnemonic'), ids.join(', '));
    assert.equal(plan.slots.find((s) => s.id === 'photo-home-page').results.length, 2);
  });
});

describe('the book', () => {
  const system = () => buildSystem(systemInputFromBrand(fixture));
  const px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  test('no approved media, no extra pages: an empty "in practice" page is padding', () => {
    const { html } = renderBrandDeck({ brand: fixture, system: system() });
    assert.equal(/photography-samples|motion-samples/.test(html), false);
  });

  test('approved media gets its pages, each labelled as generated and by whom', () => {
    const media = [
      { id: 'photo-a-1', kind: 'photo', title: 'The bay', file: 'a.png', src: px, modelName: 'Nano Banana Pro', approvedBy: 'Jake' },
      { id: 'motion-sting-1', kind: 'motion', title: 'Logo sting', file: 'brand/media/approved/motion/motion-sting-1.mp4', src: px, previewKind: 'strip', modelName: 'Kling v3.0', approvedBy: 'Jake' },
      { id: 'idea-A1-1', kind: 'ideation', file: 'x.png', src: px, approvedBy: 'Jake' },
    ];
    const { html } = renderBrandDeck({ brand: fixture, system: system(), media });
    assert.match(html, /id="photography-samples"/);
    assert.match(html, /id="motion-samples"/);
    assert.match(html, /Generated with Nano Banana Pro, approved by Jake/);
    assert.match(html, /shown as its start, middle and end frames/);
    assert.match(html, /object-fit:contain/, 'a strip is contained, never cropped by cover');
    assert.equal(html.includes('idea-A1-1'), false, 'a logo spark never reaches the book, even if someone wrote it in');
  });
});

describe('boards', () => {
  test('one per kind with results, sparks told to go to the forge, previews not masters', () => {
    const plan = {
      ...M.emptyPlan(),
      slots: [
        { id: 'photo-a', kind: 'photo', title: 'A', results: [{ id: 'photo-a-1', file: 'brand/media/photo/photo-a-1.png', preview: 'brand/media/photo/photo-a-1.preview.webp', credits: 4 }] },
        { id: 'idea-A1', kind: 'ideation', title: 'Spark', results: [{ id: 'idea-A1-1', file: 'brand/media/ideation/idea-A1-1.svg', preview: null, picked: true }] },
        { id: 'sound-x', kind: 'sound', title: 'S', results: [{ id: 'sound-x-1', file: 'brand/media/sound/sound-x-1.mp3', preview: null }] },
        { id: 'empty', kind: 'scene', results: [] },
      ],
    };
    const { boards, copies } = M.mediaBoards(plan, { brandName: 'Muddy Paws', approved: new Set(['photo-a-1']) });
    assert.deepEqual(boards.map((b) => b.file), ['Main.dc.html', 'MediaPhoto.dc.html', 'MediaSound.dc.html', 'MediaIdeation.dc.html']);
    const ideation = boards.find((b) => b.file === 'MediaIdeation.dc.html').source;
    assert.match(ideation, /the forge redraws each picked spark in vector/);
    assert.match(ideation, /tag--picked/);
    assert.match(boards.find((b) => b.file === 'MediaPhoto.dc.html').source, /tag--approved/);
    assert.deepEqual(copies.map((c) => c.from), ['brand/media/photo/photo-a-1.preview.webp', 'brand/media/ideation/idea-A1-1.svg']);
    assert.match(boards.find((b) => b.file === 'MediaSound.dc.html').source, /sound-x-1\.mp3/, 'a file with no picture is named, not dropped');
  });
});

describe('frames rendered from the master', () => {
  test('the mark is sized to the frame and its own width and height are replaced', () => {
    const html = M.frameHtml('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><rect width="300" height="100"/></svg>', { w: 1920, h: 1080, ground: '#1F6F4A' });
    assert.match(html, /background:#1F6F4A/);
    assert.match(html, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 300 100" width="806" height="269">/);
    assert.equal(html.includes('<?xml'), false);
  });

  test('without a master, a palette or a browser, it says which', async () => {
    assert.equal((await M.renderFrames({ masterSvg: null })).master, false);
    assert.match((await M.renderFrames({ masterSvg: '<svg/>', system: null })).error, /palette has not resolved/);
    assert.match((await M.renderFrames({ masterSvg: '<svg/>', system: {}, chrome: null })).error, /no Chromium/);
  });

  test('a contact strip needs ffmpeg and a real video, and is null rather than an error without', async () => {
    assert.equal(await M.contactStrip('x.mp4', 'y.jpg', { ffmpeg: null }), null);
    const ffmpeg = M.findFfmpeg();
    if (!ffmpeg) return;
    const video = path.join(dir, 'clip.mp4');
    await run(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=green:s=320x180:d=1', '-pix_fmt', 'yuv420p', video]);
    const strip = await M.contactStrip(video, path.join(dir, 'strip.jpg'), { ffmpeg });
    assert.equal(strip, path.join(dir, 'strip.jpg'));
    assert.equal(await M.contactStrip(path.join(dir, 'secret.png'), path.join(dir, 'no.jpg'), { ffmpeg }), null);
  });
});

describe('choosing the model live, and dictating only what is earned', () => {
  test('family, version and tier come from the display name, where the version lives', () => {
    assert.deepEqual(M.modelIdentity({ display_name: 'Nano Banana 2' }), { family: 'nano banana', version: [2], tier: 2 });
    assert.deepEqual(M.modelIdentity({ display_name: 'Nano Banana Pro' }), { family: 'nano banana', version: [], tier: 4 });
    assert.deepEqual(M.modelIdentity({ display_name: 'FLUX.2' }), { family: 'flux', version: [2], tier: 2 });
    assert.deepEqual(M.modelIdentity({ display_name: 'Kling v3.0' }), { family: 'kling', version: [3, 0], tier: 2 });
    assert.deepEqual(M.modelIdentity({ display_name: 'Google Veo 3.1 Lite' }), { family: 'veo', version: [3, 1], tier: 0 });
    assert.deepEqual(M.modelIdentity({ display_name: 'Seedream 5.0 Pro' }), { family: 'seedream', version: [5, 0], tier: 4 });
  });

  test('a model is matched to a job by what it takes, not what it is called', () => {
    const get = (id) => CATALOGUE.find((m) => m.job_type === id);
    assert.equal(M.meets(get('kling3_0'), 'sting'), true);
    assert.equal(M.meets(get('veo3_1'), 'sting'), false, 'no end frame, so it cannot land on the mark');
    assert.equal(M.meets(get('veo3_1'), 'motion'), true);
    assert.equal(M.meets(get('topaz_image'), 'photo'), false, 'an upscaler needs an input it will not be given');
    assert.equal(M.meets(get('recraft_v4_1'), 'illustration'), true);
    assert.equal(M.meets(get('nano_banana_pro'), 'illustration'), false, 'no hard palette');
    assert.equal(M.meets(get('recraft_v4_1'), 'icon'), true);
    assert.equal(M.meets(get('text2speech_v2'), 'voice'), true, 'it may require what the job supplies');
    assert.equal(M.meets(get('sonilo_music'), 'voice'), false);
    assert.equal(M.meets(get('text2speech_v2'), 'sound'), false);
    assert.equal(M.meets(get('hunyuan3d_v3_image_to_3d'), 'object'), true);
    assert.equal(M.candidatesFor('ideation', catalogue).some((m) => m.job_type === 'kling_omni_image'), false, 'excluded on evidence');
  });

  test('a newer version of the same family at the same tier is taken without asking; a lower tier is only flagged', () => {
    const c = M.chooseModel('sting', { catalogue, fallback: 'kling3_0' });
    assert.equal(c.model, 'kling3_5');
    assert.equal(c.source, 'newer-in-family');
    assert.equal(c.notes.some((n) => n.includes('kling3_5_turbo')), false, 'a turbo is not newer than the model it is a cheaper cut of');
    const photo = M.chooseModel('photo', { catalogue, fallback: 'nano_banana_pro' });
    assert.equal(photo.model, 'nano_banana_pro', 'Nano Banana 2 is newer and a lower tier than Pro: a judgement, not a switch');
    assert.equal(M.newerInFamily('nano_banana_pro', 'photo', catalogue).upgrade, null);
  });

  test('a fallback that has gone, or cannot do the job, gives way to the strongest capable model', () => {
    const gone = M.chooseModel('photo', { catalogue, fallback: 'retired_model' });
    assert.equal(gone.source, 'strongest-candidate');
    assert.equal(gone.model, M.candidatesFor('photo', catalogue)[0].job_type);
    assert.match(gone.notes[0], /not in the catalogue/);
  });

  test('a pin is dictation: honoured, and told when its family has moved on', () => {
    const c = M.chooseModel('sting', { catalogue, pin: { model: 'kling3_0' }, fallback: 'kling3_0' });
    assert.equal(c.model, 'kling3_0');
    assert.equal(c.source, 'pinned');
    assert.match(c.notes[0], /newer versions: kling3_5/);
    const missing = M.chooseModel('sting', { catalogue, pin: { model: 'kling9' }, fallback: 'kling3_0' });
    assert.equal(missing.model, 'kling3_5');
    assert.match(missing.notes[0], /not in the catalogue any more/);
    assert.equal(M.chooseModel('sting', { catalogue: null, fallback: 'kling3_0' }).model, 'kling3_0', 'no catalogue, the fallback');
  });

  test('pinning needs a reason and a model that can do the job, unless forced', () => {
    const plan = M.emptyPlan();
    assert.throws(() => M.pinModel(plan, 'sting', 'kling3_0', { catalogue }), /needs its reason/);
    assert.throws(() => M.pinModel(plan, 'sting', 'veo3_1', { why: 'nicer', catalogue }), /cannot do the sting job/);
    assert.throws(() => M.pinModel(plan, 'sting', 'nope', { why: 'x', catalogue }), /not in the catalogue/);
    assert.throws(() => M.pinModel(plan, 'film', 'kling3_0', { why: 'x' }), /not a job/);
    const pin = M.pinModel(plan, 'sting', 'veo3_1', { why: 'the client wants Veo', catalogue, force: true });
    assert.equal(pin.model, 'veo3_1');
    assert.equal(plan.models.sting.why, 'the client wants Veo');
  });

  test('parameters are fitted to the chosen model, at the top of every quality ladder', () => {
    const get = (id) => CATALOGUE.find((m) => m.job_type === id);
    const sting = M.fitParams({ aspect_ratio: '4:5', duration: 5, $silent: true, colors: ['#111111'] }, get('kling3_5'));
    assert.deepEqual(sting.params, { aspect_ratio: '1:1', duration: 5, sound: 'off', mode: '4k' });
    assert.deepEqual(sting.dropped, ['colors']);
    assert.equal(M.fitParams({}, get('gpt_image_2_5')).params.quality, 'max');
    assert.equal(M.fitParams({}, get('veo3_1')).params.quality, 'ultra');
    assert.equal(M.fitParams({}, get('nano_banana_pro')).params.resolution, '4k');
    const seedance = M.fitParams({ $silent: true }, get('seedance_2_5')).params;
    assert.equal(seedance.resolution, '1080p');
    assert.equal(seedance.generate_audio, false);
    assert.equal('mode' in seedance, false, 't2v and omni_reference are not a quality ladder');
    assert.equal(M.fitParams({ resolution: '1k' }, get('nano_banana_pro')).params.resolution, '1k', 'an explicit ask wins');
    assert.deepEqual(M.fitParams({}, get('nano_banana_pro'), { quality: 'standard' }).params, {}, 'sparks are not maxed');
  });

  test('dealt slots land on the live choice with fitted parameters', () => {
    const frames = { master: true, 'ground-16x9': 'g.png', 'mark-16x9': 'm.png' };
    const { slots, notes } = M.dealSlots(fixture, { kinds: ['photo', 'motion'], frames, catalogue });
    const sting = slots.find((s) => s.id === 'motion-sting');
    assert.equal(sting.model, 'kling3_5');
    assert.deepEqual(sting.params, { aspect_ratio: '16:9', duration: 5, sound: 'off', mode: '4k' });
    const photo = slots.find((s) => s.id === 'photo-home-page');
    assert.equal(photo.model, 'gpt_image_2_5');
    assert.deepEqual(photo.params, { aspect_ratio: '16:9', quality: 'max' }, 'fitted to what this model takes, at its top rung');
    assert.ok(notes.some((n) => n.includes('kling3_0 -> kling3_5')));
    const pinned = M.dealSlots(fixture, { kinds: ['motion'], frames, catalogue, pins: { motion: { model: 'veo3_1' } } }).slots;
    const hero = pinned.find((s) => s.id === 'motion-hero');
    assert.equal(hero.model, 'veo3_1');
    assert.deepEqual(hero.params, { aspect_ratio: '16:9', quality: 'ultra' }, 'Kling\'s mode and sound are not carried to Veo');
    assert.equal(pinned.find((s) => s.id === 'motion-sting').model, 'kling3_5', 'a pin is for one job, not the kind');
  });

  test('the spark wall is built from every capable family, newest in each, observed order first', () => {
    const rot = M.ideationRotation(catalogue);
    const ids = rot.map((r) => r.model);
    assert.deepEqual(ids, ['nano_banana_pro', 'gpt_image_2_5', 'recraft_v4_1', 'openai_hazel']);
    assert.deepEqual(rot.find((r) => r.model === 'recraft_v4_1').params, { aspect_ratio: '1:1', resolution: '1k', colors: ['#111111'], background_color: '#FFFFFF', model_type: 'vector' });
    assert.equal(rot.find((r) => r.model === 'gpt_image_2_5').params.quality, 'high', 'sparks are sketches: high, not max');
    assert.deepEqual(M.ideationRotation(null), [...M.IDEATION_MODELS]);
  });

  test('what is new since the last look is named, and a day-old catalogue is stale', () => {
    const before = { models: CATALOGUE.filter((m) => m.job_type !== 'kling3_5') };
    assert.deepEqual(M.newSince(before, catalogue).map((m) => m.job_type), ['kling3_5']);
    assert.deepEqual(M.newSince(null, catalogue), [], 'the first look has nothing to compare with');
    assert.equal(M.catalogueIsStale({ fetched: '2026-09-25T00:00:00Z' }, new Date('2026-09-26T01:00:00Z')), true);
    assert.equal(M.catalogueIsStale({ fetched: '2026-09-26T00:00:00Z' }, new Date('2026-09-26T01:00:00Z')), false);
  });

  test('fetching reads the list, then every model, and keeps going past one that fails', async () => {
    const got = await M.fetchCatalogue({ bin: fake, exec: withMode('ready') });
    assert.equal(got.models.length, CATALOGUE.length);
    assert.ok(got.models.find((m) => m.job_type === 'kling3_0').params.some((p) => p.name === 'end_image'));
  });
});

describe('the live choice through the command line', () => {
  test('models shows what can do each job and what was chosen; use pins with a reason; plan follows', async () => {
    const root = await project('live', fixture, { withCatalogue: false });
    const models = await cli(['media', 'models', '--refresh'], { cwd: root });
    assert.equal(models.ok, true, models.error);
    assert.equal(models.needs.sting.chosen, 'kling3_5');
    assert.deepEqual(models.needs.sting.candidates.includes('veo3_1'), false);
    assert.ok(existsSync(path.join(root, 'brand', 'media', 'catalogue.json')));

    const refused = await cli(['media', 'use', 'sting', 'veo3_1', '--why', 'prettier'], { cwd: root });
    assert.equal(refused.ok, false);
    assert.match(refused.error, /cannot do the sting job/);

    const pinned = await cli(['media', 'use', 'motion', 'veo3_1', '--why', 'Won the A/B on the hero loop'], { cwd: root });
    assert.equal(pinned.ok, true, pinned.error);
    const plan = await cli(['media', 'plan', '--kinds', 'motion'], { cwd: root });
    const hero = plan.slots.find((s) => s.id === 'motion-hero');
    assert.equal(hero.model, 'veo3_1');
    assert.equal(hero.params.quality, 'ultra');

    await cli(['media', 'set', 'motion-hero', 'params.aspect_ratio', '9:16'], { cwd: root });
    const moved = await cli(['media', 'set', 'motion-hero', 'model', 'kling3_5'], { cwd: root });
    assert.deepEqual(moved.slot.params, { aspect_ratio: '9:16', duration: 5, sound: 'off', mode: '4k' }, 'refitted to Kling, and the hand-set ratio kept');
  });

  test('a catalogue that cannot be read falls back and says so, rather than failing the plan', async () => {
    const root = await project('no-catalogue', fixture, { withCatalogue: false });
    const plan = await cli(['media', 'plan', '--refresh'], { cwd: root, extra: { FAKE_HF_MODE: 'no-catalogue' } });
    assert.equal(plan.ok, true, plan.error);
    assert.equal(plan.catalogue, null);
    assert.match(plan.notes.join(' ') + JSON.stringify(plan), /fallback|catalogue could not be read/);
  });
});

describe('trials, and fitting what was asked for', () => {
  test('a trial takes each family\'s top tier and its newest version, with the current model first', () => {
    const ids = M.trialModels('photo', catalogue, { include: 'nano_banana_pro' });
    assert.equal(ids[0], 'nano_banana_pro');
    assert.ok(ids.includes('nano_banana_flash'), 'the newest version is the one a tier ranking hides');
    assert.ok(ids.includes('gpt_image_2_5') && ids.includes('openai_hazel'));
    assert.equal(ids.includes('topaz_image'), false);
    const sting = M.trialModels('sting', catalogue, { include: 'kling3_0' });
    assert.equal(sting[0], 'kling3_0', 'the control first');
    assert.ok(sting.includes('kling3_5') && sting.includes('seedance1_5'));
    assert.equal(sting.includes('veo3_1'), false, 'no end frame, no place in a sting trial');
  });

  test('a trial slot is the same job on another model, refitted, one result', () => {
    const base = M.dealSlots(fixture, { kinds: ['photo'], catalogue }).slots[0];
    M.setSlotField(base, 'prompt', 'A wet kelpie.');
    const hazel = CATALOGUE.find((m) => m.job_type === 'openai_hazel');
    const t = M.trialSlot(base, hazel);
    assert.equal(t.id, 'trial-photo-home-page-openai-hazel');
    assert.equal(t.prompt, 'A wet kelpie.');
    assert.equal(t.count, 1);
    assert.equal(t.trialOf, 'photo-home-page');
    assert.deepEqual(t.params, { aspect_ratio: '3:2', quality: 'high' }, '16:9 is not on offer, so the nearest; high is its top rung');
    assert.equal(base.results.length, 0);
  });

  test('a number the model does not offer becomes the nearest one it does', () => {
    const sd = CATALOGUE.find((m) => m.job_type === 'seedance1_5');
    assert.equal(M.fitParams({ duration: 5 }, sd).params.duration, 4);
    assert.equal(M.fitParams({ duration: 11 }, sd).params.duration, 12);
  });

  test('`media trial` and `media add` fit to the model through the command line', async () => {
    const root = await project('trial');
    await cli(['media', 'plan', '--kinds', 'photo'], { cwd: root });
    await cli(['media', 'set', 'photo-home-page', 'prompt', 'A wet kelpie.'], { cwd: root });
    const trial = await cli(['media', 'trial', 'photo-home-page', '--models', 'gpt_image_2_5,openai_hazel,not_a_model'], { cwd: root });
    assert.equal(trial.ok, true, trial.error);
    assert.deepEqual(trial.trial.map((t) => t.model), ['gpt_image_2_5', 'openai_hazel']);
    assert.match(trial.skipped[0], /not_a_model: not in the catalogue/);
    const again = await cli(['media', 'trial', 'photo-home-page', '--models', 'openai_hazel'], { cwd: root });
    assert.match(again.skipped[0], /already trialled/);
    const added = await cli(['media', 'add', 'hazel-shot', '--kind', 'photo', '--model', 'openai_hazel', '--prompt', 'x', '--params', '{"aspect_ratio":"16:9"}'], { cwd: root });
    assert.deepEqual(added.slot.params, { aspect_ratio: '3:2', quality: 'high' }, 'a hand-given 16:9 is fitted, not passed through to be refused');
    const spark = await cli(['media', 'trial', 'nope'], { cwd: root });
    assert.equal(spark.ok, false);
  });

  test('a sting that lands on its end frame scores high, one that drifts does not', async () => {
    const ffmpeg = M.findFfmpeg();
    if (!ffmpeg) return;
    const end = path.join(dir, 'end.png');
    const other = path.join(dir, 'other.png');
    await run(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x1F6F4A:s=320x180,drawbox=x=100:y=70:w=120:h=40:color=white:t=fill', '-frames:v', '1', end]);
    await run(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x2E8B57:s=320x180', '-frames:v', '1', other]);
    const lands = path.join(dir, 'lands.mp4');
    await run(ffmpeg, ['-v', 'error', '-y', '-loop', '1', '-i', end, '-t', '1', '-pix_fmt', 'yuv420p', lands]);
    const score = await M.landingScore(lands, end, { ffmpeg });
    assert.ok(score >= M.LANDING_SSIM, `a video that ends on the frame scored ${score}`);
    const drifts = await M.landingScore(lands, other, { ffmpeg });
    assert.ok(drifts < M.LANDING_SSIM, `a different frame scored ${drifts}`);
    assert.equal(await M.landingScore(lands, path.join(dir, 'missing.png'), { ffmpeg }), null);
  });
});

describe('what an adversary tried', () => {
  test('one run at a time: a live lock refuses a second run and any plan edit, a dead one does not', async () => {
    const root = await project('locked');
    const brandDir = path.join(root, 'brand');
    const release = await M.takeRunLock(brandDir, 'run photo-home-page');
    assert.equal((await M.runningNow(brandDir)).pid, process.pid);
    await assert.rejects(M.takeRunLock(brandDir, 'another'), /two at once lose each other's results/);
    const set = await cli(['media', 'set', 'x', 'prompt', 'y'], { cwd: root });
    assert.equal(set.ok, false);
    assert.match(set.error, /holds the plan/);
    await release();
    assert.equal(await M.runningNow(brandDir), null);
    await writeFile(path.join(brandDir, 'media', 'run.lock'), JSON.stringify({ pid: 2 ** 22 + 12345, what: 'run' }));
    assert.equal(await M.runningNow(brandDir), null, 'a lock whose process has gone is not a lock');
  });

  test('a parameter that names a file goes through the upload guard, as a reference does', async () => {
    const root = path.join(dir, 'param-guard');
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, 'mask.png'), 'x');
    const out = M.newSlot('p', { kind: 'photo', prompt: 'x', params: { mask: '../secret.png' } });
    await assert.rejects(M.argvFor(out, { projectRoot: root }), /outside the project/);
    const inside = M.newSlot('q', { kind: 'photo', prompt: 'x', params: { mask: './mask.png', style: 'a/b testing' } });
    const args = await M.argvFor(inside, { projectRoot: root });
    assert.ok(args.includes(`--mask=${path.join(root, 'mask.png')}`));
    assert.ok(args.includes('--style=a/b testing'), 'a string with a slash that is not a file is just a string');
  });

  test('a hand-edited plan cannot steer a download outside the media folder', async () => {
    const job = { id: 'j', result_url: `${base}/r.png`, status: 'completed' };
    await assert.rejects(M.saveJob(job, { id: 'x', kind: '../../escape', results: [] }, { brandDir: dir, projectRoot: dir }), /not a kind/);
    await assert.rejects(M.saveJob(job, { id: '../x', kind: 'photo', results: [] }, { brandDir: dir, projectRoot: dir }), /not a usable slot id/);
  });

  test('a brand file whose identity.media is not a list neither crashes approve nor the book', async () => {
    const b = structuredClone(fixture);
    b.identity.media = { oops: true };
    const root = await project('hostile-media', b);
    const brandDir = path.join(root, 'brand');
    await mkdir(path.join(brandDir, 'media', 'photo'), { recursive: true });
    await writeFile(path.join(brandDir, 'media', 'photo', 'p-1.png'), 'x');
    const plan = { slots: [{ id: 'p', kind: 'photo', results: [{ id: 'p-1', file: 'brand/media/photo/p-1.png' }] }] };
    const recs = await M.approveResults({ brand: b, plan, ids: ['p-1'], approvedBy: 'Jake', brandDir, projectRoot: root });
    assert.equal(recs.length, 1);
    assert.ok(Array.isArray(b.identity.media));
    const book = await cli(['book'], { cwd: root });
    assert.equal(book.ok, true, book.error);
  });

  test('a board never falls back to a full-size raster, only to an SVG', () => {
    const plan = { ...M.emptyPlan(), slots: [{ id: 'p', kind: 'photo', results: [{ id: 'p-1', file: 'brand/media/photo/p-1.png', preview: null }, { id: 'p-2', file: 'brand/media/photo/p-2.svg', preview: null }] }] };
    const { copies, boards } = M.mediaBoards(plan);
    assert.deepEqual(copies.map((c) => c.from), ['brand/media/photo/p-2.svg']);
    assert.match(boards.find((b) => b.file === 'MediaPhoto.dc.html').source, /p-1\.png/, 'the raster is named instead');
  });
});
