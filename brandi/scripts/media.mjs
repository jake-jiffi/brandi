/**
 * Generated media, through the Higgsfield command line, when it is installed.
 *
 * Optional by construction. Brandi builds a complete brand without it, and the
 * only commands that stop without it are the ones whose whole job is to call it.
 * When it is there, it does the parts of an agency pack that a language model
 * cannot draw: photography in the art direction, the real-world surfaces a
 * mockup needs, motion, sound, a 3D object, and a wall of logo sparks from
 * several different image models.
 *
 * Three rules shape everything below.
 *
 * A person picks. A generated file is a candidate until somebody approves it by
 * name, exactly like a logo concept, and only approved files reach the book.
 *
 * The mark is never generated. Image models redraw letterforms and invent
 * detail, so the brand's own vector artwork is composited onto generated
 * scenes by `brandi mockup`, and a logo sting ends on a frame rendered from the
 * master itself. Logo sparks exist, but only as references the forge redraws in
 * vector: they can be picked and can never be approved.
 *
 * Credits are money. Every run is priced with `higgsfield generate cost` before
 * anything is created, and a run that would take the plan past its budget is
 * refused before a single job starts.
 */

import { readFile, writeFile, mkdir, copyFile, realpath, rm } from 'node:fs/promises';
import { existsSync, statSync, accessSync, constants as FS } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { localDate } from './brandfile.mjs';
import { artboard, canvasManifest } from './canvas.mjs';
import { monochromeSvg, svgBox } from './assets.mjs';
import { screenshot } from './preview.mjs';
import { bestTextOn } from './color.mjs';

const has = (v) => v != null && v !== '' && (!Array.isArray(v) || v.length > 0);
const text = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hash = (s) => createHash('sha1').update(String(s ?? '')).digest('hex').slice(0, 12);

// ---------------------------------------------------------------------------
// Finding it, and saying how to get it when it is not there
// ---------------------------------------------------------------------------

/**
 * The names the Higgsfield CLI installs. It also installs `hf`, which is never
 * looked for: `hf` is the Hugging Face command line on a great many machines,
 * and spending credits through the wrong tool is not a failure mode worth having.
 */
export const HIGGSFIELD_NAMES = Object.freeze(['higgsfield', 'higgs']);

export const INSTALL = Object.freeze(['npm install -g @higgsfield/cli', 'higgsfield auth login']);

export const DEFAULT_BUDGET = 400;

function executable(file) {
  try {
    if (!statSync(file).isFile()) return false;
    accessSync(file, FS.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * The binary, or null. `HIGGSFIELD_PATH` wins when it is set, including when it
 * is set to something that does not exist, so a test or a cautious user can
 * make a machine that has Higgsfield behave as one that does not.
 */
export function findHiggsfield({ env = process.env } = {}) {
  if (env.HIGGSFIELD_PATH !== undefined) return executable(env.HIGGSFIELD_PATH) ? env.HIGGSFIELD_PATH : null;
  for (const dir of String(env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    for (const name of HIGGSFIELD_NAMES) {
      const full = path.join(dir, name);
      if (executable(full)) return full;
    }
  }
  return null;
}

const execFileP = promisify(execFile);

export function execHiggsfield(bin, args, { timeout = 60000 } = {}) {
  return execFileP(bin, args, { timeout, maxBuffer: 64 * 1024 * 1024 });
}

/**
 * The CLI answers a problem with `Error: ...` and often `Hint: ...` on stderr,
 * and exits 4. Both lines are the useful part; the rest is noise.
 */
export function cleanError(e) {
  if (e?.killed || e?.signal === 'SIGTERM') return 'timed out waiting for Higgsfield';
  const raw = String(e?.stderr || e?.stdout || e?.message || e || '').trim();
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const main = (lines.find((l) => /^Error:/i.test(l)) ?? lines[0] ?? 'failed with no message').replace(/^Error:\s*/i, '');
  const hint = lines.find((l) => /^Hint:/i.test(l))?.replace(/^Hint:\s*/i, '');
  return hint ? `${main} (${hint})` : main;
}

/**
 * Is it installed, does it run, is somebody signed in, and how many credits.
 *
 * Never throws and never fails the caller: this is a question, and "no" is an
 * answer with a next step attached rather than an error.
 */
export async function probeHiggsfield({ env = process.env, exec = execHiggsfield } = {}) {
  const bin = findHiggsfield({ env });
  if (!bin) {
    return { available: false, state: 'not-installed', bin: null, version: null, reason: 'Higgsfield is not installed.', suggest: [...INSTALL] };
  }
  let version = null;
  try {
    const { stdout } = await exec(bin, ['--version'], { timeout: 20000 });
    version = String(stdout).trim().split('\n')[0] || null;
  } catch (e) {
    return { available: false, state: 'broken', bin, version: null, reason: `${bin} is there but would not run: ${cleanError(e)}`, suggest: [INSTALL[0]] };
  }
  let account;
  try {
    const { stdout } = await exec(bin, ['account', 'status', '--json'], { timeout: 30000 });
    account = JSON.parse(stdout);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { available: false, state: 'broken', bin, version, reason: '`higgsfield account status --json` did not answer with JSON.', suggest: ['higgsfield account status'] };
    }
    const reason = cleanError(e);
    const workspace = /workspace/i.test(reason);
    return {
      available: false,
      state: workspace ? 'no-workspace' : 'signed-out',
      bin,
      version,
      reason,
      suggest: workspace ? ['higgsfield workspace list', 'higgsfield workspace set <workspace_id>'] : ['higgsfield auth login'],
    };
  }
  const credits = Number(account?.credits);
  return {
    available: true,
    state: 'ready',
    bin,
    version,
    plan: account?.subscription_plan_type ?? null,
    credits: Number.isFinite(credits) ? credits : null,
    reason: null,
    suggest: [],
  };
}

/** What `brandi media status` says. One place, so the skill and the CLI agree. */
export function statusText(p) {
  if (p.available) {
    return [
      `Higgsfield is ready: ${p.plan ?? 'unknown'} plan, ${p.credits == null ? 'credits unknown' : `${Math.floor(p.credits).toLocaleString('en-AU')} credits`}.`,
      p.version ? `  ${p.version}` : null,
      '',
      'Brandi can generate the photography, the scenes for mockups, motion, sound, a 3D mark',
      'and a wall of logo sparks, in the brand\'s own direction. Start with: brandi media plan',
    ].filter((l) => l !== null).join('\n');
  }
  return [
    p.reason,
    '',
    'Brandi works completely without it. With it, the pack also gets photography in the art',
    'direction, real scenes for the mockups, a logo sting, sound, and logo sparks from several',
    'image models. To add it:',
    ...p.suggest.map((s) => `  ${s}`),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// What a pack can contain
// ---------------------------------------------------------------------------

/**
 * Each kind is a job the pack needs.
 *
 * `model` and `params` are the FALLBACK, used only when Higgsfield cannot be
 * asked what it has today. With the catalogue in hand the model is chosen live
 * (see `chooseModel`) and the parameters are fitted to whichever model wins, so
 * a better model that ships next month is used next month without anybody
 * editing this file.
 *
 * `quality: 'max'` takes the top rung of every quality parameter the chosen
 * model offers: resolution, quality, mode, bitrate. Anything that ships in the
 * pack gets it. Sparks do not, because they are sketches for a vector redraw
 * and a 4K sketch buys nothing the redraw keeps.
 *
 * The fallbacks themselves were chosen by trial on 2026-09-26, one prompt run
 * on the best model of every capable family and looked at side by side:
 * GPT Image 2.5 at max took photography (the tightest expression crop and the
 * brief's hands at the edge of frame; Nano Banana 2 a close second, Nano Banana
 * Pro's water read as rendered); Nano Banana 2 took scenes (all seven left the
 * sign panel blank, and it gave the cleanest square-on fascia at 5504px); Kling
 * 3.0 took the sting (of seven video models it landed on the mark at SSIM
 * 0.998 with the motion the brief asked for; three drifted, one redrew the
 * mark). A newer version of any of these is picked up without a code change,
 * and `brandi media trial` reruns the comparison for any brand.
 *
 * `prompt: false` for the operations that take a file rather than words.
 * `approvable: false` for the one kind that must never reach the book.
 */
export const KINDS = Object.freeze({
  photo: {
    media: 'image', model: 'gpt_image_2_5', params: { resolution: '4k', quality: 'max' }, count: 2, quality: 'max',
    what: 'Photography in the art direction, one shot per surface that carries a photograph.',
  },
  scene: {
    media: 'image', model: 'nano_banana_flash', params: { resolution: '4k' }, count: 1, quality: 'max',
    what: 'A real surface with nothing on it, for `brandi mockup` to put the real mark on.',
  },
  motion: {
    media: 'video', model: 'kling3_0', params: { mode: '4k', duration: 5, sound: 'off' }, count: 1, quality: 'max',
    intent: { duration: 5, $silent: true },
    what: 'A logo sting that ends on the real mark, and loops in the art direction.',
  },
  illustration: {
    media: 'image', model: 'recraft_v4_1', params: { model_type: 'standard', resolution: '2k' }, count: 2, quality: 'max',
    what: 'Illustration in the written style, with the palette passed as hard colours.',
  },
  icon: {
    media: 'image', model: 'recraft_v4_1', params: { model_type: 'vector' }, count: 1, quality: 'max',
    intent: { $vector: true },
    what: 'Icon exploration for whoever draws the set. Traced vectors, not production icons.',
  },
  sound: {
    media: 'audio', model: 'sonilo_music', params: { duration: 6 }, count: 2, quality: 'max',
    intent: { duration: 6 },
    what: 'A sonic mnemonic: a few seconds of sound that could only be this brand.',
  },
  voice: {
    media: 'audio', model: 'text2speech_v2', params: { variant: 'elevenlabs' }, count: 1, quality: 'max',
    what: 'The brand line read aloud, to hear whether the written voice holds up spoken.',
  },
  object: {
    media: '3d', model: 'hunyuan3d_v3_image_to_3d', params: { enable_pbr: true }, count: 1, prompt: false, quality: 'max',
    intent: { enable_pbr: true },
    what: 'The mark as a 3D object, for signage, merchandise and motion.',
  },
  edit: {
    media: 'image', model: 'topaz_image', params: {}, count: 1, prompt: false,
    what: 'An operation on a file that already exists: upscale, cut out, relight.',
  },
  ideation: {
    media: 'image', model: 'nano_banana_pro', params: { aspect_ratio: '1:1', resolution: '1k' }, count: 2, approvable: false, quality: 'standard',
    what: 'Logo sparks from several image models, for the forge to redraw in vector. Never the mark.',
  },
});

export const DEFAULT_KINDS = Object.freeze(['photo', 'scene', 'motion', 'illustration']);

const needsPrompt = (kind) => KINDS[kind]?.prompt !== false;
export const approvable = (kind) => KINDS[kind]?.approvable !== false;

/**
 * What a model has to be able to do for each job. These are dictated, because
 * they are facts about the job rather than preferences about a vendor: a sting
 * that cannot be given its end frame cannot land on the real mark, whatever
 * model it is. Model names are discovered; requirements are not.
 *
 * `params` must all exist. `mayRequire` lists what the job can supply if the
 * model insists on it; any other required parameter rules the model out,
 * which is how an upscaler or a relighter that needs an input image stays out
 * of the photography list.
 */
export const NEEDS = Object.freeze({
  photo: { type: 'image', prompt: true, params: ['aspect_ratio'] },
  scene: { type: 'image', prompt: true, params: ['aspect_ratio'] },
  motion: { type: 'video', prompt: true, params: ['aspect_ratio'] },
  sting: { type: 'video', prompt: true, params: ['start_image', 'end_image'] },
  illustration: { type: 'image', prompt: true, params: ['colors'] },
  icon: { type: 'image', prompt: true, enum: { model_type: 'vector' } },
  sound: { type: 'audio', prompt: true, params: ['duration'], without: ['voice_id', 'voice'] },
  voice: { type: 'audio', prompt: true, params: ['voice_id'], mayRequire: ['voice_type', 'variant'] },
  object: { type: '3d', params: ['image_references'] },
  ideation: { type: 'image', prompt: true, params: ['aspect_ratio'] },
});

/**
 * Models ruled out of a job on evidence, each with the evidence. Dictation,
 * where it is earned.
 */
export const EXCLUDED = Object.freeze({
  ideation: {
    kling_omni_image: 'Given a slot that refused the paw print, it drew a paw print, on a mockup card it had also been told not to draw (first spark wall, 2026-09-26).',
    image_auto: 'A router: what comes back is another model\'s house style, so it adds no variety of its own.',
  },
});

/**
 * The spark wall's preferred order, by family, from the first real wall. Only
 * an order: every capable family in the live catalogue is used, new ones
 * included, and a newer version in a family replaces the one named here.
 */
const IDEATION_ORDER = ['nano banana', 'gpt', 'seedream', 'flux', 'recraft', 'grok', 'openai hazel'];

/**
 * The wall used when there is no catalogue to read. With one, the rotation is
 * built live by `ideationRotation`.
 */
export const IDEATION_MODELS = Object.freeze([
  { model: 'nano_banana_pro', params: { aspect_ratio: '1:1', resolution: '1k' } },
  { model: 'gpt_image_2_5', params: { aspect_ratio: '1:1', quality: 'high', background: 'opaque' } },
  { model: 'seedream_v5_pro', params: { aspect_ratio: '1:1' } },
  { model: 'flux_2', params: { aspect_ratio: '1:1', variant: 'max' } },
  { model: 'recraft_v4_1', params: { aspect_ratio: '1:1', model_type: 'vector', colors: ['#111111'], background_color: '#FFFFFF' } },
  { model: 'grok_image_2_0', params: { aspect_ratio: '1:1' } },
  { model: 'openai_hazel', params: { aspect_ratio: '1:1', quality: 'high' } },
]);

// ---------------------------------------------------------------------------
// The live catalogue, and choosing from it
// ---------------------------------------------------------------------------

export const CATALOGUE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const cataloguePath = (brandDir) => path.join(brandDir, 'media', 'catalogue.json');

/**
 * Every generation model Higgsfield offers today, with the parameters each one
 * takes. One `model list`, then one `model get` per model, a few at a time.
 */
export async function fetchCatalogue({ bin, exec = execHiggsfield, concurrency = 6, now = new Date() }) {
  const { stdout } = await exec(bin, ['model', 'list', '--json'], { timeout: 60000 });
  const listed = JSON.parse(stdout);
  const wanted = (Array.isArray(listed) ? listed : []).filter((m) => m?.job_type && ['image', 'video', 'audio', '3d'].includes(m.type));
  const models = [];
  const errors = [];
  const queue = [...wanted];
  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, queue.length)) }, async () => {
    while (queue.length) {
      const m = queue.shift();
      try {
        const got = JSON.parse((await exec(bin, ['model', 'get', m.job_type, '--json'], { timeout: 60000 })).stdout);
        models.push({ job_type: m.job_type, display_name: got.display_name ?? m.display_name, type: got.type ?? m.type, params: got.params ?? [], rules: got.rules ?? [] });
      } catch (e) {
        errors.push({ job_type: m.job_type, error: e instanceof SyntaxError ? 'not JSON' : cleanError(e) });
      }
    }
  }));
  models.sort((a, b) => a.job_type.localeCompare(b.job_type));
  return { fetched: now.toISOString(), models, errors };
}

export async function loadCatalogue(brandDir) {
  try {
    return JSON.parse(await readFile(cataloguePath(brandDir), 'utf8'));
  } catch {
    return null;
  }
}

export async function saveCatalogue(brandDir, catalogue) {
  const file = cataloguePath(brandDir);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(catalogue, null, 2)}\n`);
}

export const catalogueIsStale = (catalogue, now = new Date()) => !catalogue?.fetched
  || now - new Date(catalogue.fetched) > CATALOGUE_MAX_AGE_MS;

/** Models in this catalogue that the last one did not have. The first place to look. */
export function newSince(previous, current) {
  if (!previous?.models?.length) return [];
  const seen = new Set(previous.models.map((m) => m.job_type));
  return (current?.models ?? []).filter((m) => !seen.has(m.job_type));
}

const TIERS = { ultra: 5, max: 5, prime: 4, pro: 4, plus: 3, flash: 1, turbo: 1, fast: 1, lite: 0, mini: 0 };
const GENERIC = new Set(['google', 'video', 'image', 'model', 'text', 'to', '3d', 'and', 'the']);

/**
 * A model's family, version and tier, read from its display name, which is
 * where the version actually lives: `nano_banana_flash` is "Nano Banana 2" and
 * `flux_2` is "FLUX.2". Heuristic, and used for exactly one thing without a
 * person: moving to a newer version of the SAME family at the same tier or
 * above. Everything across families is a judgement, and is left to one.
 */
export function modelIdentity(model) {
  const name = String(model?.display_name ?? model?.job_type ?? '').toLowerCase().replace(/([a-z])\.(\d)/g, '$1 $2');
  const words = name.split(/[\s_]+/).filter(Boolean);
  const version = [];
  let tier = 2;
  const family = [];
  for (const w of words) {
    const v = /^v?(\d+(?:\.\d+)*)$/.exec(w);
    if (v) { version.push(...v[1].split('.').map(Number)); continue; }
    if (w in TIERS) { tier = TIERS[w]; continue; }
    if (GENERIC.has(w)) continue;
    family.push(w);
  }
  return { family: family.join(' ') || String(model?.job_type ?? ''), version, tier };
}

function compareVersions(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

/** Can this model do this job, by what it takes rather than what it is called. */
export function meets(model, needName) {
  const need = NEEDS[needName];
  if (!need || !model) return false;
  if (need.type && model.type !== need.type) return false;
  const params = new Map((model.params ?? []).map((p) => [p.name, p]));
  if (need.prompt && !params.has('prompt')) return false;
  for (const p of need.params ?? []) if (!params.has(p)) return false;
  for (const p of need.without ?? []) if (params.has(p)) return false;
  for (const [k, v] of Object.entries(need.enum ?? {})) if (!params.get(k)?.enum?.includes(v)) return false;
  const supplied = new Set(['prompt', ...(need.params ?? []), ...(need.mayRequire ?? [])]);
  for (const p of params.values()) if (p.required && !supplied.has(p.name)) return false;
  return true;
}

/** Every model that can do the job, strongest tier and newest version first. */
export function candidatesFor(needName, catalogue) {
  const excluded = EXCLUDED[needName] ?? {};
  return (catalogue?.models ?? [])
    .filter((m) => !excluded[m.job_type] && meets(m, needName))
    .map((m) => ({ ...m, id: modelIdentity(m) }))
    .sort((a, b) => (b.id.tier - a.id.tier) || compareVersions(b.id.version, a.id.version) || a.job_type.localeCompare(b.job_type));
}

/**
 * Newer versions of a model's family that can also do the job. `upgrade` is
 * the newest at the same tier or above, which is safe to move to unattended;
 * `lower` are newer but a lower tier, which are worth a look and not a switch.
 */
export function newerInFamily(jobType, needName, catalogue) {
  const current = (catalogue?.models ?? []).find((m) => m.job_type === jobType);
  if (!current) return { upgrade: null, lower: [] };
  const me = modelIdentity(current);
  const newer = candidatesFor(needName, catalogue)
    .filter((m) => m.job_type !== jobType && m.id.family === me.family && me.version.length && m.id.version.length && compareVersions(m.id.version, me.version) > 0);
  const same = newer.filter((m) => m.id.tier >= me.tier);
  return { upgrade: same[0]?.job_type ?? null, lower: newer.filter((m) => m.id.tier < me.tier).map((m) => m.job_type) };
}

/**
 * The model for one job.
 *
 * A pin is dictation and is honoured, with a note if its family has moved on.
 * Otherwise the fallback is the starting point: kept if it still exists and
 * can still do the job, moved to a newer version of its family at the same
 * tier or above if one exists, and replaced by the strongest capable model if
 * it has gone. With no catalogue, the pin or the fallback, unchanged.
 */
export function chooseModel(needName, { catalogue = null, pin = null, fallback }) {
  const notes = [];
  if (!catalogue) return { model: pin?.model ?? fallback, source: pin?.model ? 'pinned' : 'fallback', notes };
  const has = (id) => (catalogue.models ?? []).find((m) => m.job_type === id);
  if (pin?.model) {
    if (has(pin.model)) {
      const { upgrade, lower } = newerInFamily(pin.model, needName, catalogue);
      if (upgrade || lower.length) notes.push(`${needName}: ${pin.model} is pinned, and its family has newer versions: ${[upgrade, ...lower].filter(Boolean).join(', ')}. Pinned stays pinned.`);
      return { model: pin.model, source: 'pinned', notes };
    }
    notes.push(`${needName}: the pinned ${pin.model} is not in the catalogue any more, so it was not used.`);
  }
  const cands = candidatesFor(needName, catalogue);
  let model = fallback;
  let source = 'fallback';
  if (!has(fallback) || !meets(has(fallback), needName) || EXCLUDED[needName]?.[fallback]) {
    model = cands[0]?.job_type ?? fallback;
    source = cands[0] ? 'strongest-candidate' : 'fallback';
    notes.push(`${needName}: ${fallback} is ${has(fallback) ? 'no longer able to do this job' : 'not in the catalogue'}; using ${model}.`);
  }
  const { upgrade } = newerInFamily(model, needName, catalogue);
  if (upgrade) {
    notes.push(`${needName}: ${model} -> ${upgrade}, a newer version of the same family.`);
    model = upgrade;
    source = 'newer-in-family';
  }
  // Measured against the model actually chosen: a 3.5 Turbo is not newer than
  // the 3.5 it is a cheaper cut of, only than the 3.0 that was replaced.
  const { lower } = newerInFamily(model, needName, catalogue);
  if (lower.length) notes.push(`${needName}: worth a look, not switched to: ${lower.join(', ')} (newer, but a lower tier than ${model}).`);
  return { model, source, notes };
}

const LADDER = ['low', 'basic', 'std', 'standard', 'medium', 'high', 'pro', 'xhigh', 'ultra', 'max', '4k'];
const SIZE = /^(\d+(?:\.\d+)?)([kp])$/i;
const sizeOf = (v) => {
  const m = SIZE.exec(String(v));
  return m ? Number(m[1]) * (m[2].toLowerCase() === 'k' ? 1000 : 1) : null;
};

/**
 * The top rung of a quality parameter, or null when its values are not a
 * ladder: seedance's `mode` is t2v or omni_reference, and neither is better.
 */
export function topOf(param) {
  const vals = (param?.enum ?? []).filter((v) => v !== 'auto');
  if (!vals.length) return null;
  if (vals.every((v) => sizeOf(v) != null)) return vals.reduce((a, b) => (sizeOf(b) > sizeOf(a) ? b : a));
  if (vals.every((v) => LADDER.includes(String(v).toLowerCase()))) {
    return vals.reduce((a, b) => (LADDER.indexOf(String(b).toLowerCase()) > LADDER.indexOf(String(a).toLowerCase()) ? b : a));
  }
  return null;
}

const ratioOf = (r) => {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(String(r));
  return m ? Number(m[1]) / Number(m[2]) : null;
};

/**
 * What the job wants, in the terms the chosen model takes. Anything the model
 * does not take is dropped, an aspect ratio it does not offer becomes its
 * nearest one, and with `quality: 'max'` every quality parameter goes to its
 * top rung unless the job asked for a particular value.
 */
export function fitParams(intent, model, { quality = 'max' } = {}) {
  const schema = new Map((model?.params ?? []).map((p) => [p.name, p]));
  const params = {};
  const dropped = [];
  for (const [k, v] of Object.entries(intent ?? {})) {
    if (k.startsWith('$') || v === undefined || v === null) continue;
    const p = schema.get(k);
    if (!p) { dropped.push(k); continue; }
    if (p.enum && !p.enum.includes(v)) {
      // The nearest the model offers: a 4:5 ratio becomes 3:4, a five-second
      // duration becomes four where the choices are 4, 8 and 12.
      const measure = k === 'aspect_ratio' ? ratioOf : (x) => (Number.isFinite(Number(x)) ? Number(x) : null);
      const want = measure(v);
      const near = want == null ? null : p.enum
        .filter((e) => measure(e) != null)
        .reduce((best, e) => (best == null || Math.abs(measure(e) - want) < Math.abs(measure(best) - want) ? e : best), null);
      if (near) params[k] = near;
      else dropped.push(k);
      continue;
    }
    params[k] = v;
  }
  if (intent?.$silent) {
    if (schema.get('sound')?.enum?.includes('off')) params.sound = 'off';
    if (schema.has('generate_audio')) params.generate_audio = false;
  }
  if (intent?.$vector && schema.get('model_type')?.enum?.includes('vector')) params.model_type = 'vector';
  if (quality === 'max') {
    for (const name of ['resolution', 'quality', 'mode', 'bitrate_mode']) {
      if (name in (intent ?? {})) continue;
      const top = topOf(schema.get(name));
      if (top != null) params[name] = top;
    }
  }
  return { params, dropped };
}

/**
 * Contenders for a trial: from every family that can do the job, its top tier
 * AND its newest version when those differ, because the newest is the one a
 * tier ranking hides (Nano Banana 2 against Nano Banana Pro, which it matched
 * on the first photography trial). The model the slot is on now always comes
 * first, so the trial has its control.
 */
export function trialModels(needName, catalogue, { include = null, top = 8 } = {}) {
  const families = new Map();
  for (const m of candidatesFor(needName, catalogue)) {
    const f = families.get(m.id.family) ?? { top: m, newest: m };
    if (m.id.tier > f.top.id.tier || (m.id.tier === f.top.id.tier && compareVersions(m.id.version, f.top.id.version) > 0)) f.top = m;
    if (compareVersions(m.id.version, f.newest.id.version) > 0) f.newest = m;
    families.set(m.id.family, f);
  }
  const ranked = [...families.values()]
    .sort((a, b) => (b.top.id.tier - a.top.id.tier) || compareVersions(b.top.id.version, a.top.id.version) || a.top.job_type.localeCompare(b.top.job_type))
    .flatMap((f) => (f.newest.job_type === f.top.job_type ? [f.top.job_type] : [f.top.job_type, f.newest.job_type]));
  const out = include ? [include, ...ranked.filter((j) => j !== include)] : ranked;
  return out.slice(0, top);
}

/** A copy of a slot on another model: same prompt, same references, parameters fitted anew. */
export function trialSlot(base, model, { quality = 'max' } = {}) {
  const slug2 = model.job_type.replace(/_/g, '-');
  return {
    ...structuredClone({ ...base, results: [], failures: [] }),
    id: `trial-${base.id}-${slug2}`.slice(0, 64),
    title: `${base.title ?? base.id}, on ${model.display_name ?? model.job_type}`,
    model: model.job_type,
    params: fitParams(base.intent ?? stripFlags(base.params), model, { quality }).params,
    origin: 'trial',
    trialOf: base.id,
    overrides: [],
    count: 1,
  };
}

/**
 * The spark wall's models, from the live catalogue: the best of every capable
 * family, the observed-good families first, anything new after them.
 */
export function ideationRotation(catalogue) {
  if (!catalogue) return [...IDEATION_MODELS];
  const best = new Map();
  for (const m of candidatesFor('ideation', catalogue)) {
    const cur = best.get(m.id.family);
    if (!cur || m.id.tier > cur.id.tier || (m.id.tier === cur.id.tier && compareVersions(m.id.version, cur.id.version) > 0)) best.set(m.id.family, m);
  }
  const rank = (f) => {
    const i = IDEATION_ORDER.findIndex((o) => f === o || f.startsWith(`${o} `));
    return i < 0 ? IDEATION_ORDER.length : i;
  };
  const intent = { aspect_ratio: '1:1', resolution: '1k', quality: 'high', background: 'opaque', colors: ['#111111'], background_color: '#FFFFFF', $vector: true };
  return [...best.values()]
    .sort((a, b) => rank(a.id.family) - rank(b.id.family) || a.job_type.localeCompare(b.job_type))
    .map((m) => ({ model: m.job_type, params: fitParams(intent, m, { quality: 'standard' }).params }));
}

/** Surfaces a photograph is laid out on, and the ratio its hero usually takes. */
const IMAGE_SURFACES = Object.freeze({
  web: '16:9', app: '4:5', social: '4:5', story: '9:16', email: '3:2', marketplace: '1:1',
  deck: '16:9', print: '2:3', product: '4:5',
});

/** Surfaces that exist in the world, where the mark has to be put on a real thing. */
const PHYSICAL_SURFACES = new Set([
  'signage', 'environment', 'vehicle', 'packaging', 'apparel', 'uniform', 'merchandise', 'merch',
  'stationery', 'card', 'print-collateral',
]);

/** Where the media reference roles go on the command line. */
export const REF_FLAGS = Object.freeze({
  image_references: '--image-references',
  video_references: '--video-references',
  audio_references: '--audio-references',
  start_image: '--start-image',
  end_image: '--end-image',
});

/**
 * Parameter names a slot may not set, because they would change how the CLI
 * behaves rather than what it makes, or because they are media and have to go
 * through the path guard in `refs`.
 */
const RESERVED_PARAMS = new Set(['json', 'wait', 'help', 'prompt', 'image', 'video', 'audio', ...Object.keys(REF_FLAGS)]);

// ---------------------------------------------------------------------------
// The brief: what the brand file already says, assembled for a prompt writer
// ---------------------------------------------------------------------------

function paletteHexes(brand) {
  const c = brand.identity?.colour ?? {};
  const norm = (h) => {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(h ?? '').trim());
    if (!m) return null;
    const v = m[1].length === 3 ? m[1].split('').map((x) => x + x).join('') : m[1];
    return `#${v.toUpperCase()}`;
  };
  return [c.primary, ...(c.accents ?? [])].map(norm).filter(Boolean);
}

function brandLines(brand) {
  const m = brand.meta ?? {};
  const st = brand.strategy ?? {};
  const id = brand.identity ?? {};
  const c = id.colour ?? {};
  const hexes = paletteHexes(brand);
  return [
    `Brand: ${m.name ?? '[unnamed]'}${text(m.tagline) ? `, "${m.tagline}"` : ''}.`,
    has(m.categories) ? `Category: ${m.categories.join(', ')}.` : (text(st.category) ? `Category: ${st.category}.` : null),
    text(st.positioning) ? `Positioning: ${st.positioning}` : null,
    text(id.school) ? `Visual school: ${id.school}.` : null,
    text(id.signature) ? `Signature element: ${id.signature}` : null,
    hexes.length ? `Palette: ${hexes.join(', ')} (the first is the brand colour).${text(c.ratio) ? ` Proportion: ${c.ratio}` : ''}` : null,
  ];
}

function imageryLines(brand) {
  const img = brand.identity?.imagery ?? {};
  return [
    text(img.direction) ? `Art direction: ${img.direction}` : null,
    text(img.treatment) ? `Treatment: ${img.treatment}` : null,
    has(img.dos) ? `Always: ${img.dos.join('; ')}.` : null,
    has(img.donts) ? `Never: ${img.donts.join('; ')}.` : null,
  ];
}

function motionLines(brand) {
  const id = brand.identity ?? {};
  const sig = id.motionSignature ?? {};
  return [
    text(id.motionPrinciple) ? `Motion principle: ${id.motionPrinciple}` : (text(id.motion) ? `Motion stance: ${id.motion}.` : null),
    text(sig.name) ? `Motion signature, ${sig.name}: ${sig.description ?? ''}${sig.durationMs ? ` ${sig.durationMs}ms` : ''}${text(sig.easing) ? `, ${sig.easing}` : ''}.` : null,
  ];
}

function personalityLines(brand) {
  const attrs = brand.strategy?.personality?.attributes ?? [];
  return [
    attrs.length ? `Personality: ${attrs.map((a) => (typeof a === 'string' ? a : `${a.name}${a.notThis ? `, not ${a.notThis}` : ''}`)).join('; ')}.` : null,
  ];
}

const NO_MARK = 'No text, lettering, logos, signage or watermarks anywhere in frame. The real mark is added afterwards from the vector master, never drawn by the model.';
const NOT_REAL = 'Nobody in frame may be presented as a real customer or member of staff: this is a sample of the direction, and it is labelled as generated wherever it appears.';

const brief = (...groups) => groups.flat().filter((l) => l !== null && l !== undefined && l !== '').join('\n');

// ---------------------------------------------------------------------------
// Dealing the slots a brand needs
// ---------------------------------------------------------------------------

const slug = (s) => String(s ?? '')
  .toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'x';

function slotOf(kind, id, { title, surface = null, brief: b, params = {}, refs = {}, model = null, count = null, prompt = null, blocked = null, need = kind, extra = {} }) {
  const k = KINDS[kind];
  return {
    id,
    kind,
    need,
    title,
    surface,
    // What the job wants, before any model is chosen. The parameters are fitted
    // from this, so a change of model refits rather than carrying another
    // model's settings across.
    intent: { ...(k.intent ?? {}), ...params },
    model: model ?? k.model,
    // A kind's default parameters belong to its default model. Handing them to
    // another model gets the job refused: openai_hazel has no resolution.
    params: model && model !== k.model ? { ...params } : { ...k.params, ...params },
    refs,
    count: count ?? k.count,
    brief: b,
    prompt,
    promptSource: prompt ? 'dealt' : null,
    briefAtPrompt: prompt ? hash(b) : null,
    origin: 'dealt',
    overrides: [],
    blocked,
    results: [],
    failures: [],
    ...extra,
  };
}

function surfaceOf(app) {
  return String(app?.surface ?? '').toLowerCase().trim();
}

function photoSlots(brand, notes) {
  const img = brand.identity?.imagery ?? {};
  if (!text(img.direction)) {
    notes.push('No photography dealt: identity.imagery.direction is empty, and generating photographs without an art direction would be inventing one. Write the direction first.');
    return [];
  }
  const apps = (brand.applications ?? []).filter((a) => a && typeof a === 'object');
  const shots = img.shotList?.length
    ? img.shotList.map((s) => ({ title: s.shot, surface: s.surface ?? null, why: s.why ?? null }))
    : apps.filter((a) => IMAGE_SURFACES[surfaceOf(a)]).map((a) => ({
      title: `${a.name ?? a.surface}: the hero photograph`, surface: surfaceOf(a), why: a.purpose ?? null, frame: a.frame ?? null,
    }));
  if (!shots.length) notes.push('No photography dealt: nothing in the shot list or the applications carries a photograph.');
  const seen = new Set();
  return shots.slice(0, 8).map((s) => {
    let id = `photo-${slug(s.title.split(':')[0])}`;
    while (seen.has(id)) id += '-b';
    seen.add(id);
    const surface = String(s.surface ?? '').toLowerCase();
    // A phone frame is portrait whatever its surface is called.
    const narrow = /^(\d+)\s*x\s*(\d+)$/i.exec(String(s.frame ?? ''));
    const ratio = narrow && Number(narrow[1]) < 600 ? '4:5' : (IMAGE_SURFACES[surface] ?? '3:2');
    return slotOf('photo', id, {
      title: s.title,
      surface: s.surface,
      params: { aspect_ratio: ratio },
      brief: brief(brandLines(brand), imageryLines(brand), [
        `The shot: ${s.title}${s.why ? `. Why it exists: ${s.why}` : ''}`,
        `Format: ${ratio}, for ${s.surface ?? 'general use'}.`,
        NO_MARK,
        NOT_REAL,
      ]),
    });
  });
}

function sceneSlots(brand, notes) {
  const mocked = new Set((brand.identity?.mockups ?? []).map((m) => String(m?.name ?? '').toLowerCase()));
  const apps = (brand.applications ?? []).filter((a) => a && typeof a === 'object' && PHYSICAL_SURFACES.has(surfaceOf(a)));
  const todo = apps.filter((a) => !mocked.has(String(a.name ?? '').toLowerCase()));
  if (!apps.length) notes.push('No scenes dealt: no application sits on a physical surface (signage, a vehicle, packaging, apparel, a shopfront).');
  return todo.map((a) => slotOf('scene', `scene-${slug(a.name ?? a.surface)}`, {
    title: `${a.name ?? a.surface}, blank, for the mockup`,
    surface: surfaceOf(a),
    params: { aspect_ratio: '3:2' },
    // The treatment, not the direction: the direction says what photographs are
    // OF, and a blank shopfront is not of that.
    brief: brief(brandLines(brand).slice(0, 2), imageryLines(brand).slice(1, 2), [
      `The surface: ${a.name ?? a.surface} (${surfaceOf(a)}), as it really exists for a business like this.${a.purpose ? ` It has to: ${a.purpose}` : ''}${a.notes ? ` Notes: ${a.notes}` : ''}`,
      'The panel where the mark goes must be BLANK, facing the camera closely enough that its four corners can be read, evenly lit, and at least a third of the frame.',
      NO_MARK,
      'Afterwards: brandi mockup grid <this file>, read the corners, and brandi mockup build composites the real artwork.',
    ]),
  }));
}

function motionSlots(brand, { frames, notes }) {
  const slots = [];
  const surfaces = new Set((brand.applications ?? []).map(surfaceOf));
  const vertical = surfaces.has('social') || surfaces.has('story');
  const master = frames?.master;
  if (!master) {
    notes.push('No logo sting dealt: no master SVG is recorded in identity.logo.files. `brandi logo master` records one, or record the logo the client supplied.');
  } else {
    const sting = (id, ratio, tag) => {
      const ground = frames[`ground-${tag}`];
      const mark = frames[`mark-${tag}`];
      return slotOf('motion', id, {
        need: 'sting',
        title: `Logo sting, ${ratio}`,
        surface: ratio === '9:16' ? 'social' : 'web',
        params: { aspect_ratio: ratio },
        refs: ground && mark ? { start_image: ground, end_image: mark } : {},
        blocked: ground && mark ? null : (frames.error ?? 'the start and end frames could not be rendered'),
        brief: brief(brandLines(brand).slice(0, 1), motionLines(brand), [
          'A logo sting. It opens on the empty brand ground (the start frame) and must END exactly on the end frame, which is the real mark rendered from the vector master.',
          'Never redraw, morph, restyle, recolour or add to the mark. The motion happens around it and settles into it.',
          `Format: ${ratio}, five seconds, no sound.`,
        ]),
      });
    };
    slots.push(sting('motion-sting', '16:9', '16x9'));
    if (vertical) slots.push(sting('motion-sting-vertical', '9:16', '9x16'));
  }
  if (text(brand.identity?.imagery?.direction)) {
    if (surfaces.has('web')) {
      slots.push(slotOf('motion', 'motion-hero', {
        title: 'Home page hero loop, 16:9',
        surface: 'web',
        params: { aspect_ratio: '16:9' },
        brief: brief(brandLines(brand), imageryLines(brand), motionLines(brand), [
          'A five-second loop for behind the home page headline: one continuous shot, nothing that fights type set over it.',
          NO_MARK,
        ]),
      }));
    }
    if (vertical) {
      slots.push(slotOf('motion', 'motion-social', {
        title: 'Social loop, 9:16',
        surface: 'social',
        params: { aspect_ratio: '9:16' },
        brief: brief(brandLines(brand), imageryLines(brand), motionLines(brand), [
          'A five-second vertical loop. Keep the top 14% and bottom 20% free: every platform puts its own chrome there.',
          NO_MARK,
        ]),
      }));
    }
  }
  return slots;
}

function illustrationSlots(brand, notes) {
  const il = brand.identity?.illustration;
  if (!il || !text(il.style)) {
    notes.push('No illustration dealt: identity.illustration has no style, and a generated illustration would invent one. Absent is an honest answer.');
    return [];
  }
  const themes = has(il.themes) ? il.themes.slice(0, 3) : ['sample'];
  const colors = paletteHexes(brand);
  return themes.map((t) => slotOf('illustration', `illustration-${slug(t)}`, {
    title: `Illustration: ${t}`,
    params: colors.length ? { colors } : {},
    brief: brief(brandLines(brand), [
      `Illustration style: ${il.style}`,
      `Theme: ${t}.`,
      has(il.dos) ? `Always: ${il.dos.join('; ')}.` : null,
      has(il.donts) ? `Never: ${il.donts.join('; ')}.` : null,
      'The palette goes to the model as hard colours; no colour outside it.',
      NO_MARK,
    ]),
  }));
}

function iconSlots(brand, notes) {
  const ico = brand.identity?.iconography ?? {};
  if (!text(ico.style)) {
    notes.push('No icons dealt: identity.iconography.style is empty.');
    return [];
  }
  return [slotOf('icon', 'icon-sheet', {
    title: 'Icon exploration sheet',
    params: { colors: ['#111111'], background_color: '#FFFFFF' },
    brief: brief(brandLines(brand).slice(0, 1), [
      `Icon style: ${ico.style}${ico.grid ? `, ${ico.grid}px grid` : ''}${ico.strokePx ? `, ${ico.strokePx}px stroke` : ''}.`,
      'Six to nine icons the business actually needs, one ink, on white, evenly spaced.',
      'Exploration for whoever draws the set. The traced vectors carry anti-alias fills and are not production icons.',
    ]),
  })];
}

function soundSlots(brand) {
  return [slotOf('sound', 'sound-mnemonic', {
    title: 'Sonic mnemonic',
    brief: brief(brandLines(brand).slice(0, 2), personalityLines(brand), motionLines(brand), [
      'Three to six seconds of sound that could only be this brand, usable under a logo sting and at the end of a video. No voice, no lyrics.',
    ]),
  })];
}

function voiceSlots(brand) {
  const line = text(brand.meta?.tagline) ?? text(brand.strategy?.messaging?.primary);
  return [slotOf('voice', 'voice-line', {
    title: 'The brand line, spoken',
    brief: brief(brandLines(brand).slice(0, 1), personalityLines(brand), [
      line ? `The words, which ARE the prompt: "${line}"` : 'The words: [the tagline or primary message, once one is written].',
      'Choose a voice first: higgsfield voices list, then set params.voice_id and params.voice_type on this slot.',
    ]),
  })];
}

function objectSlots(brand, { frames, notes }) {
  if (!frames?.master) {
    notes.push('No 3D mark dealt: no master SVG is recorded in identity.logo.files.');
    return [];
  }
  const square = frames['mark-1x1'];
  return [slotOf('object', 'object-mark', {
    title: 'The mark as a 3D object',
    refs: square ? { image_references: [square] } : {},
    blocked: square ? null : (frames.error ?? 'the square frame could not be rendered'),
    brief: 'Built from the square frame rendered from the vector master. No prompt: the geometry comes from the mark.',
  })];
}

/**
 * One spark per forge slot, each drawn by a different model in rotation.
 *
 * The forge's slot is the brief: its architecture, register, symbol approach
 * and refusals are what stop the wall converging. The prompt is dealt rather
 * than authored because a spark wall is a fan-out, and it says black on white
 * for the same reason the concept round does.
 */
function ideationSlots(forge, notes, rotation = IDEATION_MODELS) {
  const slots = (forge?.slots ?? []).filter((s) => s && s.architectureName && !s.refines);
  if (!slots.length) {
    notes.push('No logo sparks dealt: no concept round has been planned. Run `brandi logo plan` first, so the sparks follow its briefs.');
    return [];
  }
  const name = forge.brand?.name ?? 'Brand';
  // The forge's one-liner is often the whole positioning statement. A spark
  // needs the gist, so it gets the first clause, without its punctuation.
  const gist = text(forge.brand?.oneLiner)?.split(/(?<=[.:;!?])\s/)[0].replace(/[.:;\s]+$/, '') ?? null;
  return slots.map((s, i) => {
    const pick = rotation[i % rotation.length];
    const prompt = [
      `A logo concept sketch for "${name}".${gist ? ` ${gist}.` : ''}`,
      `${s.architectureName}. ${s.registerName ? `${s.registerName} lettering.` : ''}`,
      s.symbolApproach ? `Symbol: ${s.symbolApproach}. ${s.symbolBrief ?? ''}` : 'No symbol: the lettering carries it alone.',
      s.signals ? `It should signal: ${s.signals}` : null,
      'Flat solid black on pure white. One ink. No gradient, shading, texture, 3D, mockup, background scene or tagline.',
      `If the name is set, spell it exactly "${name}". Centred, with generous margin.`,
      has(s.mustNotBe) ? `Avoid: ${s.mustNotBe.join('; ')}.` : null,
    ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    return slotOf('ideation', `idea-${s.id}`, {
      title: `Spark for ${s.id}: ${s.familyName ?? s.architectureName}`,
      model: pick.model,
      params: pick.params,
      prompt,
      brief: `Forge slot ${s.id} (round ${forge.round}). The brief the vector redraw answers to: brand/logo/brief/slots/round-${String(forge.round).padStart(2, '0')}/${s.id}.md`,
      extra: { forgeSlot: s.id, forgeRound: forge.round },
    });
  });
}

/**
 * Every slot the brand file says the pack needs, and a note for every kind it
 * deliberately did not deal. A kind the brand has not written down is not
 * dealt: generating illustration with no illustration style is inventing one.
 */
const stripFlags = (o) => Object.fromEntries(Object.entries(o ?? {}).filter(([k]) => !k.startsWith('$')));

/**
 * Put a model on every dealt slot, and fit its parameters to that model. A
 * spark's model comes from the rotation instead, and is only fitted.
 */
export function applyModels(slots, { catalogue = null, pins = {} } = {}, notes = []) {
  const said = new Set(notes);
  const say = (n) => { if (!said.has(n)) { said.add(n); notes.push(n); } };
  for (const s of slots) {
    const k = KINDS[s.kind];
    if (s.kind !== 'ideation' && NEEDS[s.need]) {
      const choice = chooseModel(s.need, { catalogue, pin: pins?.[s.need], fallback: k.model });
      choice.notes.forEach(say);
      s.model = choice.model;
      s.modelSource = choice.source;
    }
    const m = catalogue?.models?.find((x) => x.job_type === s.model);
    if (m) s.params = fitParams(s.intent, m, { quality: k.quality }).params;
    else if (s.model !== k.model) s.params = stripFlags(s.intent);
  }
  return notes;
}

export function dealSlots(brand, { kinds = DEFAULT_KINDS, frames = {}, forge = null, catalogue = null, pins = {} } = {}) {
  const notes = [];
  const slots = [];
  const want = new Set(kinds);
  if (want.has('photo')) slots.push(...photoSlots(brand, notes));
  if (want.has('scene')) slots.push(...sceneSlots(brand, notes));
  if (want.has('motion')) slots.push(...motionSlots(brand, { frames, notes }));
  if (want.has('illustration')) slots.push(...illustrationSlots(brand, notes));
  if (want.has('icon')) slots.push(...iconSlots(brand, notes));
  if (want.has('sound')) slots.push(...soundSlots(brand));
  if (want.has('voice')) slots.push(...voiceSlots(brand));
  if (want.has('object')) slots.push(...objectSlots(brand, { frames, notes }));
  if (want.has('ideation')) slots.push(...ideationSlots(forge, notes, ideationRotation(catalogue)));
  applyModels(slots, { catalogue, pins }, notes);
  return { slots, notes };
}

export function parseKinds(value) {
  if (value == null || value === true) return [...DEFAULT_KINDS];
  const list = String(value).split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = list.filter((k) => !KINDS[k]);
  if (unknown.length) throw new Error(`Unknown kind${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}. Kinds: ${Object.keys(KINDS).join(', ')}.`);
  if (!list.length) throw new Error(`--kinds needs at least one of: ${Object.keys(KINDS).join(', ')}.`);
  return list;
}

// ---------------------------------------------------------------------------
// The plan file
// ---------------------------------------------------------------------------

export const planPath = (brandDir) => path.join(brandDir, 'media', 'plan.json');

export function emptyPlan() {
  return { brandi: 'media-plan', version: 1, budget: DEFAULT_BUDGET, models: {}, slots: [], notes: [] };
}

/**
 * Dictate the model for one job, with the reason written down. A pin that
 * cannot do the job is refused unless forced, because a sting pinned to a
 * model with no end frame cannot land on the mark however good the model is.
 */
export function pinModel(plan, needName, model, { why = null, catalogue = null, force = false, now = new Date() } = {}) {
  if (!NEEDS[needName]) throw new Error(`"${needName}" is not a job. Jobs: ${Object.keys(NEEDS).join(', ')}.`);
  if (!MODEL_ID.test(String(model ?? ''))) throw new Error(`"${model}" is not a model id. See: brandi media models`);
  if (!text(why)) throw new Error('A pin needs its reason: --why "what made this the one". Dictation without a reason is a default nobody can argue with.');
  const m = catalogue?.models?.find((x) => x.job_type === model);
  if (catalogue && !m && !force) throw new Error(`${model} is not in the catalogue. See: brandi media models --refresh`);
  if (m && !meets(m, needName) && !force) throw new Error(`${model} cannot do the ${needName} job as Brandi defines it (see brandi media models). Pass --force to pin it anyway.`);
  plan.models ??= {};
  plan.models[needName] = { model, why: why.trim(), pinnedOn: localDate(now) };
  return plan.models[needName];
}

export async function loadPlan(brandDir) {
  const file = planPath(brandDir);
  if (!existsSync(file)) return null;
  const plan = JSON.parse(await readFile(file, 'utf8'));
  plan.slots = (plan.slots ?? []).filter((s) => s && typeof s === 'object');
  for (const s of plan.slots) {
    s.results ??= [];
    s.failures ??= [];
    s.overrides ??= [];
    s.params ??= {};
    s.refs ??= {};
  }
  return plan;
}

const lockPath = (brandDir) => path.join(brandDir, 'media', 'run.lock');

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

/**
 * Who is running, if anybody. A run holds the plan in memory for minutes and
 * saves it as each job lands, so anything else that writes the plan meanwhile
 * is overwritten, and a paid-for job id with it. A lock whose process has gone
 * is not a lock.
 */
export async function runningNow(brandDir) {
  try {
    const held = JSON.parse(await readFile(lockPath(brandDir), 'utf8'));
    return held?.pid && alive(held.pid) ? held : null;
  } catch {
    return null;
  }
}

export async function takeRunLock(brandDir, what) {
  const held = await runningNow(brandDir);
  if (held) throw new Error(`Another media run (${held.what}, pid ${held.pid}) is still going, and two at once lose each other's results. Wait for it to finish.`);
  await mkdir(path.dirname(lockPath(brandDir)), { recursive: true });
  await writeFile(lockPath(brandDir), JSON.stringify({ pid: process.pid, what, since: new Date().toISOString() }));
  return async () => { await rm(lockPath(brandDir), { force: true }); };
}

export async function savePlan(brandDir, plan) {
  const file = planPath(brandDir);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(plan, null, 2)}\n`);
}

function getPath(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, dotted, value) {
  const keys = dotted.split('.');
  let o = obj;
  for (const k of keys.slice(0, -1)) o = (o[k] ??= {});
  if (value === undefined) delete o[keys.at(-1)];
  else o[keys.at(-1)] = value;
}

/**
 * Deal again without losing work.
 *
 * The brief and the dealt values follow the brand file, so a palette change
 * reaches the next run. What a person or the skill set by hand survives: an
 * authored prompt, and every field named in `overrides`. Nothing that has
 * results is ever dropped, because those results cost credits.
 */
export function mergePlan(existing, dealt) {
  const old = new Map((existing?.slots ?? []).map((s) => [s.id, s]));
  const slots = [];
  for (const d of dealt) {
    const o = old.get(d.id);
    old.delete(d.id);
    if (!o) { slots.push(d); continue; }
    const s = { ...d, results: o.results ?? [], failures: o.failures ?? [], overrides: o.overrides ?? [] };
    for (const field of s.overrides) setPath(s, field, getPath(o, field));
    if (o.promptSource === 'authored') {
      s.prompt = o.prompt;
      s.promptSource = 'authored';
      s.briefAtPrompt = o.briefAtPrompt;
    }
    slots.push(s);
  }
  for (const o of old.values()) {
    if (o.origin !== 'dealt' || o.results?.length) {
      slots.push(o.origin === 'dealt' ? { ...o, retired: 'The brand file no longer calls for this slot. Its results are kept.' } : o);
    }
  }
  return slots;
}

/** Where a slot stands, in one word. */
export function slotState(slot) {
  if (slot.retired) return 'retired';
  if (slot.blocked) return 'blocked';
  if ((slot.results?.length ?? 0) >= (slot.count ?? 1)) return 'done';
  if (needsPrompt(slot.kind) && !text(slot.prompt)) return 'needs-prompt';
  return 'ready';
}

/** An authored prompt written against a brief that has since changed. */
export const promptIsStale = (slot) => slot.promptSource === 'authored' && slot.briefAtPrompt && slot.briefAtPrompt !== hash(slot.brief);

export const spentOf = (plan) => (plan?.slots ?? [])
  .flatMap((s) => s.results ?? [])
  .reduce((n, r) => n + (Number(r.credits) || 0), 0);

// ---------------------------------------------------------------------------
// Editing a slot
// ---------------------------------------------------------------------------

const MODEL_ID = /^[a-z0-9][a-z0-9_]*$/;
const PARAM_KEY = /^[a-z][a-z0-9_]*$/;
const SLOT_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

function parseValue(raw) {
  if (raw === 'null') return null;
  if (typeof raw !== 'string') return raw;
  try { return JSON.parse(raw); } catch { return raw; }
}

/**
 * Change one field of one slot. The fields are deliberately few: the prompt,
 * the model, how many, the title, one parameter, or one media reference.
 */
export function setSlotField(slot, field, raw) {
  const mark = (f) => { if (!slot.overrides.includes(f)) slot.overrides.push(f); };
  if (field === 'prompt') {
    const p = String(raw ?? '').trim();
    if (!p) throw new Error('An empty prompt is not a prompt.');
    slot.prompt = p;
    slot.promptSource = 'authored';
    slot.briefAtPrompt = hash(slot.brief);
    return;
  }
  if (field === 'model') {
    if (!MODEL_ID.test(String(raw))) throw new Error(`"${raw}" is not a model id. See: higgsfield model list`);
    slot.model = String(raw);
    mark('model');
    return;
  }
  if (field === 'count') {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('count is a whole number from 1 to 8.');
    slot.count = n;
    mark('count');
    return;
  }
  if (field === 'title') {
    slot.title = String(raw);
    mark('title');
    return;
  }
  if (field.startsWith('params.')) {
    const key = field.slice(7);
    if (!PARAM_KEY.test(key) || RESERVED_PARAMS.has(key)) {
      throw new Error(`"${key}" cannot be set as a parameter.${REF_FLAGS[key] ? ` Media goes in refs.${key}, where the path is checked.` : ''}`);
    }
    const v = parseValue(raw);
    if (v === null) delete slot.params[key];
    else slot.params[key] = v;
    mark(field);
    return;
  }
  if (field.startsWith('refs.')) {
    const role = field.slice(5);
    if (!REF_FLAGS[role]) throw new Error(`"${role}" is not a media role. Roles: ${Object.keys(REF_FLAGS).join(', ')}.`);
    const v = parseValue(raw);
    if (v === null) delete slot.refs[role];
    else if (role.endsWith('_references')) slot.refs[role] = Array.isArray(v) ? v.map(String) : [String(v)];
    else if (typeof v === 'string') slot.refs[role] = v;
    else throw new Error(`refs.${role} takes one path or upload id.`);
    mark(field);
    return;
  }
  throw new Error(`Cannot set "${field}". Settable: prompt, model, count, title, params.<name>, refs.<role>.`);
}

/** A slot added by hand, for anything the dealer does not deal. */
export function newSlot(id, { kind, model, title, prompt, params = {}, refs = {}, count }) {
  if (!SLOT_ID.test(String(id ?? ''))) throw new Error(`A slot id is lower case letters, digits and hyphens, not "${id}".`);
  if (!KINDS[kind]) throw new Error(`--kind is one of: ${Object.keys(KINDS).join(', ')}.`);
  const s = slotOf(kind, id, { title: title ?? id, brief: 'Added by hand.', model: model ?? null });
  s.origin = 'added';
  for (const [k, v] of Object.entries(params ?? {})) setSlotField(s, `params.${k}`, v);
  for (const [k, v] of Object.entries(refs ?? {})) setSlotField(s, `refs.${k}`, v);
  if (model) setSlotField(s, 'model', model);
  if (count != null) setSlotField(s, 'count', count);
  if (prompt) setSlotField(s, 'prompt', prompt);
  return s;
}

// ---------------------------------------------------------------------------
// The command line for one slot
// ---------------------------------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function reallyInside(candidate, root) {
  try {
    const real = await realpath(candidate);
    const realRoot = await realpath(root);
    return real === realRoot || real.startsWith(realRoot + path.sep);
  } catch {
    return false;
  }
}

/**
 * A media reference becomes an upload, and an upload is a file leaving the
 * machine for a third party. So a path must resolve, through any symlinks, to
 * somewhere inside the project. An upload or job id passes through unchanged.
 */
export async function resolveRef(value, projectRoot) {
  const v = String(value ?? '').trim();
  if (UUID.test(v)) return v;
  const full = path.resolve(projectRoot, v);
  if (!existsSync(full)) throw new Error(`${v} is not on disk.`);
  if (!(await reallyInside(full, projectRoot))) {
    throw new Error(`${v} is outside the project. Only files inside it are ever uploaded.`);
  }
  return full;
}

const WAIT = { image: '10m', video: '30m', audio: '10m', '3d': '30m' };
export const waitMs = (slot) => (parseInt(WAIT[KINDS[slot.kind]?.media ?? 'image'], 10) + 2) * 60000;

const flagValue = (v) => (typeof v === 'string' ? v : JSON.stringify(v));

/**
 * The argv for `generate cost` or `generate create`. Every value goes in the
 * `--name=value` form, so a prompt that happens to start with `--` is a prompt
 * and not a flag.
 */
export async function argvFor(slot, { projectRoot, op = 'create' }) {
  const args = ['generate', op === 'cost' ? 'cost' : 'create', slot.model];
  if (needsPrompt(slot.kind) || text(slot.prompt)) {
    if (!text(slot.prompt)) throw new Error(`${slot.id} has no prompt yet.`);
    args.push(`--prompt=${slot.prompt}`);
  }
  for (const [k, v] of Object.entries(slot.params ?? {})) {
    if (!PARAM_KEY.test(k) || RESERVED_PARAMS.has(k)) throw new Error(`${slot.id}: "${k}" cannot be passed as a parameter.`);
    if (v === null || v === undefined) continue;
    // The CLI uploads any local path it is handed for a media parameter, a
    // mask or a sketch as much as a reference. So a string that names a file
    // on disk goes through the same guard as a reference does.
    if (typeof v === 'string' && /[\\/]/.test(v) && existsSync(path.resolve(projectRoot, v))) {
      args.push(`--${k}=${await resolveRef(v, projectRoot)}`);
      continue;
    }
    args.push(`--${k}=${flagValue(v)}`);
  }
  for (const [role, value] of Object.entries(slot.refs ?? {})) {
    const flag = REF_FLAGS[role];
    if (!flag) throw new Error(`${slot.id}: "${role}" is not a media role.`);
    for (const v of (Array.isArray(value) ? value : [value]).filter(Boolean)) {
      args.push(`${flag}=${await resolveRef(v, projectRoot)}`);
    }
  }
  args.push('--json');
  // The CLI's own flags take the spaced form. `--wait-timeout=10m` is read as a
  // model parameter called wait_timeout and the job is refused.
  if (op !== 'cost') args.push('--wait', '--wait-timeout', WAIT[KINDS[slot.kind]?.media ?? 'image']);
  return args;
}

/** `generate create --json` answers with a list of jobs; `generate get` with one. */
export function parseJobs(stdout) {
  const parsed = JSON.parse(String(stdout));
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.jobs)) return parsed.jobs;
  if (parsed && parsed.id) return [parsed];
  throw new Error('Higgsfield answered with something that is not a job.');
}

const KNOWN_EXT = /\.(png|jpe?g|webp|gif|avif|svg|mp4|mov|webm|mp3|wav|m4a|ogg|flac|glb|gltf|obj|fbx|usdz|zip)$/i;

export function extensionOf(url, fallback = '.bin') {
  try {
    const m = KNOWN_EXT.exec(new URL(url).pathname);
    return m ? m[0].toLowerCase().replace('.jpeg', '.jpg') : fallback;
  } catch {
    return fallback;
  }
}

export async function download(url, file, { fetchImpl = globalThis.fetch } = {}) {
  if (!/^https?:\/\//i.test(String(url))) throw new Error(`refusing to download "${url}": not an http(s) address`);
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(10 * 60 * 1000) });
  if (!res.ok) throw new Error(`download failed with HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
  return buf.length;
}

/** ffmpeg, when it is installed. Optional in the same way a browser is. */
export function findFfmpeg({ env = process.env } = {}) {
  if (env.FFMPEG_PATH !== undefined) return executable(env.FFMPEG_PATH) ? env.FFMPEG_PATH : null;
  for (const dir of String(env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    const full = path.join(dir, 'ffmpeg');
    if (executable(full)) return full;
  }
  return null;
}

/**
 * A video's poster as three frames side by side: the start, the middle and the
 * end. Higgsfield's own thumbnail is the first frame, and the first frame of a
 * logo sting is an empty ground by design, so on its own it shows nothing. The
 * strip shows the motion and, for a sting, the mark it lands on.
 */
export async function contactStrip(video, out, { ffmpeg, exec = execFileP } = {}) {
  if (!ffmpeg) return null;
  let duration = null;
  try {
    await exec(ffmpeg, ['-hide_banner', '-i', video], { timeout: 30000 });
  } catch (e) {
    // With no output named, ffmpeg exits non-zero after printing what it read.
    const m = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(String(e?.stderr ?? ''));
    if (m) duration = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  if (!(duration > 0)) return null;
  const args = ['-hide_banner', '-v', 'error', '-y'];
  for (const t of [0.05, duration / 2, Math.max(0, duration - 0.1)]) args.push('-ss', t.toFixed(2), '-i', video);
  args.push(
    '-filter_complex', '[0:v]scale=640:-2[a];[1:v]scale=640:-2[b];[2:v]scale=640:-2[c];[a][b][c]hstack=inputs=3',
    '-frames:v', '1', '-q:v', '3', out,
  );
  try {
    await exec(ffmpeg, args, { timeout: 60000 });
  } catch {
    return null;
  }
  return existsSync(out) ? out : null;
}

/**
 * Does a sting land on the mark? Its last frame against the end frame it was
 * given, by SSIM. Measured on the first A/B, six video models on one prompt:
 * the three that landed cleanly scored 0.997 to 0.998, and the three that did
 * not scored 0.983 to 0.994, one redrawing half the mark mid-sting and two
 * shifting the ground off the brand colour. 0.995 sits between them. A score
 * is a measurement, not a verdict: the person still looks.
 */
export const LANDING_SSIM = 0.995;

export async function landingScore(video, endFrame, { ffmpeg, exec = execFileP } = {}) {
  if (!ffmpeg || !endFrame || !existsSync(endFrame)) return null;
  const last = path.join(tmpdir(), `brandi-last-${process.pid}-${Math.random().toString(36).slice(2)}.png`);
  try {
    // No frame limit, and -update: every decoded frame overwrites the last, so
    // what is left is the true final frame whatever the container reports.
    await exec(ffmpeg, ['-hide_banner', '-v', 'error', '-y', '-sseof', '-1', '-i', video, '-update', '1', last], { timeout: 60000 });
    if (!existsSync(last)) return null;
    const { stderr } = await exec(ffmpeg, [
      '-hide_banner', '-i', last, '-i', endFrame,
      '-lavfi', '[0:v][1:v]scale2ref=flags=bicubic[a][b];[a]format=yuv420p[a2];[b]format=yuv420p[b2];[a2][b2]ssim',
      '-f', 'null', '-',
    ], { timeout: 60000 });
    const m = /All:([\d.]+)/.exec(String(stderr));
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  } finally {
    await rm(last, { force: true });
  }
}

const nextIndex = (slot) => (slot.results ?? []).reduce((n, r) => {
  const m = /-(\d+)$/.exec(r.id ?? '');
  return Math.max(n, m ? Number(m[1]) : 0);
}, 0) + 1;

/**
 * Fetch a finished job into the slot's folder: the full-size file, and the
 * small preview Higgsfield makes beside it (a full-resolution WebP for an
 * image, a poster for a video), which is what boards and the book embed. A 4K
 * PNG is five megabytes; its preview is a hundred kilobytes and looks the same.
 */
export async function saveJob(job, slot, { brandDir, projectRoot, credits = null, fetchImpl, ffmpeg = null, now = new Date() }) {
  // Both become parts of a path, and a hand-edited plan can say anything.
  if (!KINDS[slot.kind]) throw new Error(`${slot.id}: "${slot.kind}" is not a kind, so there is nowhere to put the file.`);
  if (!/^[A-Za-z0-9][A-Za-z0-9-]{0,80}$/.test(String(slot.id))) throw new Error(`"${slot.id}" is not a usable slot id.`);
  const id = `${slot.id}-${nextIndex(slot)}`;
  const dir = path.join(brandDir, 'media', slot.kind);
  const file = path.join(dir, `${id}${extensionOf(job.result_url)}`);
  await download(job.result_url, file, { fetchImpl });
  const previewUrl = job.min_result_url || job.thumbnail_url || null;
  let preview = null;
  let previewKind = null;
  if (/\.(mp4|mov|webm)$/i.test(file)) {
    preview = await contactStrip(file, path.join(dir, `${id}.preview.jpg`), { ffmpeg });
    if (preview) previewKind = 'strip';
  }
  if (!preview && previewUrl) {
    const p = path.join(dir, `${id}.preview${extensionOf(previewUrl, '.webp')}`);
    try {
      await download(previewUrl, p, { fetchImpl });
      preview = p;
      previewKind = job.min_result_url ? 'image' : 'first-frame';
    } catch { /* the preview is a convenience; the file is the result */ }
  }
  const rel = (f) => (f ? path.relative(projectRoot, f).split(path.sep).join('/') : null);
  let landing = null;
  if (slot.refs?.end_image && /\.(mp4|mov|webm)$/i.test(file)) {
    const end = await resolveRef(slot.refs.end_image, projectRoot).catch(() => null);
    const ssim = end && !UUID.test(end) ? await landingScore(file, end, { ffmpeg }) : null;
    if (ssim != null) landing = { ssim: Number(ssim.toFixed(4)), lands: ssim >= LANDING_SSIM };
  }
  const result = {
    id,
    file: rel(file),
    preview: rel(preview),
    previewKind,
    landing,
    jobId: job.id ?? null,
    model: job.job_type ?? slot.model,
    modelName: job.display_name ?? null,
    prompt: job.params?.prompt ?? slot.prompt ?? null,
    credits,
    created: job.created_at ?? now.toISOString(),
  };
  slot.results.push(result);
  return result;
}

// ---------------------------------------------------------------------------
// Running
// ---------------------------------------------------------------------------

/** How many creates a slot still needs. `force` runs a whole count again. */
export const callsFor = (slot, { force = false } = {}) => (force
  ? (slot.count ?? 1)
  : Math.max(0, (slot.count ?? 1) - (slot.results?.length ?? 0)));

/**
 * Price the selected slots without creating anything. Local media is uploaded
 * by the CLI to price it, so a reference that is refused is refused here.
 */
export async function estimate(slots, { bin, exec = execHiggsfield, projectRoot, force = false }) {
  const priced = [];
  const errors = [];
  for (const slot of slots) {
    const calls = callsFor(slot, { force });
    if (!calls) continue;
    try {
      const args = await argvFor(slot, { projectRoot, op: 'cost' });
      // Pricing uploads any local reference first, and a 4K frame on a slow
      // connection takes a while.
      const { stdout } = await exec(bin, args, { timeout: 240000 });
      const each = Number(JSON.parse(stdout).credits);
      if (!Number.isFinite(each)) throw new Error('no credit figure in the answer');
      priced.push({ slot, calls, each, total: each * calls });
    } catch (e) {
      errors.push({ id: slot.id, error: e instanceof SyntaxError ? 'the cost answer was not JSON' : cleanError(e) });
    }
  }
  return { priced, errors, total: priced.reduce((n, p) => n + p.total, 0) };
}

/**
 * Create, wait, download, record. Slots run a few at a time; the calls within
 * one slot run in order, so a slot that fails stops rather than retrying into
 * the same failure and spending as it goes. The plan is saved after every job,
 * because a video run is long and an interrupted one should keep what it got.
 */
export async function runSlots(priced, { bin, exec = execHiggsfield, brandDir, projectRoot, save, concurrency = 3, fetchImpl, ffmpeg = null, now = () => new Date() }) {
  const made = [];
  const failed = [];
  let saving = Promise.resolve();
  const persist = () => { saving = saving.then(() => save()); return saving; };

  const one = async ({ slot, calls, each }) => {
    for (let i = 0; i < calls; i++) {
      let jobs;
      try {
        const args = await argvFor(slot, { projectRoot, op: 'create' });
        const { stdout } = await exec(bin, args, { timeout: waitMs(slot) });
        jobs = parseJobs(stdout);
      } catch (e) {
        const error = e instanceof SyntaxError ? 'Higgsfield did not answer with JSON' : cleanError(e);
        slot.failures.push({ at: now().toISOString(), error });
        failed.push({ id: slot.id, error });
        await persist();
        return;
      }
      for (const job of jobs) {
        if (job.status !== 'completed' || !job.result_url) {
          const error = `job ${job.id ?? '?'} ended ${job.status ?? 'without a status'}`;
          slot.failures.push({ at: now().toISOString(), jobId: job.id ?? null, error });
          failed.push({ id: slot.id, error });
          continue;
        }
        try {
          made.push(await saveJob(job, slot, { brandDir, projectRoot, credits: each / jobs.length, fetchImpl, ffmpeg, now: now() }));
        } catch (e) {
          // The credits are spent whether or not the file arrived, so the job id
          // is kept where somebody can use it to fetch the result again.
          const error = `job ${job.id} finished but did not download (${e.message}). Recover it with: brandi media import ${job.id} --slot ${slot.id}`;
          slot.failures.push({ at: now().toISOString(), jobId: job.id ?? null, error });
          failed.push({ id: slot.id, error });
        }
      }
      await persist();
    }
  };

  const queue = [...priced];
  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, queue.length)) }, async () => {
    while (queue.length) await one(queue.shift());
  });
  await Promise.all(workers);
  await saving;
  return { made, failed };
}

/** Fetch a job that was made some other way, so it is recorded like any other. */
export async function importJob(jobId, slot, { bin, exec = execHiggsfield, brandDir, projectRoot, fetchImpl, ffmpeg = null }) {
  if (!UUID.test(String(jobId))) throw new Error(`"${jobId}" is not a Higgsfield job id.`);
  const { stdout } = await exec(bin, ['generate', 'get', jobId, '--json'], { timeout: 60000 });
  const [job] = parseJobs(stdout);
  if (job.status !== 'completed' || !job.result_url) throw new Error(`job ${jobId} is ${job.status ?? 'not finished'}, so there is nothing to fetch.`);
  if ((slot.results ?? []).some((r) => r.jobId === job.id)) throw new Error(`job ${jobId} is already recorded on ${slot.id}.`);
  return saveJob(job, slot, { brandDir, projectRoot, credits: null, fetchImpl, ffmpeg });
}

// ---------------------------------------------------------------------------
// Picking and approving
// ---------------------------------------------------------------------------

export function findResult(plan, id) {
  for (const slot of plan?.slots ?? []) {
    const result = (slot.results ?? []).find((r) => r.id === id);
    if (result) return { slot, result };
  }
  return null;
}

/**
 * Approve generated files into the brand, by name.
 *
 * The files are copied into `brand/media/approved/`, which is what the
 * handover carries, and recorded under `identity.media`, which is what the book
 * reads. A logo spark is refused: it is a reference for a vector redraw and it
 * never becomes part of the brand, however good it is.
 */
export async function approveResults({ brand, plan, ids, approvedBy, brandDir, projectRoot, now = new Date() }) {
  const approver = typeof approvedBy === 'string' && approvedBy.trim() ? approvedBy.trim() : null;
  if (!approver) throw new Error('Nothing recorded. A generated file becomes part of the brand when a person approves it: pass --approved-by "<their name>".');
  if (!ids.length) throw new Error('Name the results to approve, e.g. brandi media approve photo-home-page-2 --approved-by "Jake".');
  const found = [];
  for (const id of ids) {
    const hit = findResult(plan, id);
    if (!hit) throw new Error(`No result called ${id}. See: brandi media list`);
    if (!approvable(hit.slot.kind)) {
      throw new Error(`${id} is a logo spark. Sparks are references the forge redraws in vector, never part of the brand. Use: brandi media pick ${id}`);
    }
    if (!hit.result.file) throw new Error(`${id} has no file on disk to approve.`);
    found.push(hit);
  }
  brand.identity ??= {};
  brand.identity.media = (Array.isArray(brand.identity.media) ? brand.identity.media : []).filter((m) => !ids.includes(m?.id));
  const records = [];
  for (const { slot, result } of found) {
    const destDir = path.join(brandDir, 'media', 'approved', slot.kind);
    await mkdir(destDir, { recursive: true });
    const copy = async (rel) => {
      if (!rel) return null;
      const src = path.resolve(projectRoot, rel);
      if (!existsSync(src) || !(await reallyInside(src, projectRoot))) return null;
      const dest = path.join(destDir, path.basename(src));
      await copyFile(src, dest);
      return path.relative(projectRoot, dest).split(path.sep).join('/');
    };
    const file = await copy(result.file);
    if (!file) throw new Error(`${result.id}: ${result.file} is not on disk any more.`);
    const record = {
      id: result.id,
      kind: slot.kind,
      title: slot.title ?? null,
      surface: slot.surface ?? null,
      file,
      preview: await copy(result.preview),
      previewKind: result.previewKind ?? null,
      model: result.model,
      modelName: result.modelName ?? null,
      jobId: result.jobId ?? null,
      prompt: result.prompt ?? null,
      provenance: 'generated',
      approvedBy: approver,
      approvedOn: localDate(now),
    };
    brand.identity.media.push(record);
    records.push(record);
  }
  return records;
}

// ---------------------------------------------------------------------------
// Frames rendered from the master, for the sting and the 3D mark
// ---------------------------------------------------------------------------

export const FRAME_SPECS = Object.freeze([
  { name: 'ground-16x9', w: 1920, h: 1080, mark: false },
  { name: 'mark-16x9', w: 1920, h: 1080, mark: true },
  { name: 'ground-9x16', w: 1080, h: 1920, mark: false },
  { name: 'mark-9x16', w: 1080, h: 1920, mark: true },
  // Ink on paper, square: an image-to-3D model reads a silhouette best on white.
  { name: 'mark-1x1', w: 1080, h: 1080, mark: true, paper: true },
]);

/** The master sized to a share of the frame, with its root width and height replaced. */
export function frameHtml(svg, { w, h, ground, share = 0.42 }) {
  let markup = '';
  if (svg) {
    const box = svgBox(svg) ?? { w: 1, h: 1 };
    const aspect = box.w > 0 && box.h > 0 ? box.w / box.h : 1;
    const markW = Math.round(Math.min(w * share, h * share * aspect));
    const markH = Math.round(markW / aspect);
    markup = svg.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<svg\b([^>]*)>/i, (m, attrs) => {
      const rest = attrs.replace(/\s(width|height)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
      return `<svg${rest} width="${markW}" height="${markH}">`;
    });
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${ground}}body{display:flex;align-items:center;justify-content:center}</style></head><body>${markup}</body></html>`;
}

/**
 * Render the frames a sting starts and ends on. The end frame is the real mark,
 * so a video model asked to land on it lands on artwork a person approved
 * rather than on its own idea of the logo.
 */
export async function renderFrames({ masterSvg, system, brandDir, projectRoot, chrome }) {
  if (!masterSvg) return { master: false, error: 'no master SVG is recorded' };
  if (!system) return { master: true, error: 'the palette has not resolved, so there is no brand ground to render on. Run brandi system' };
  if (!chrome) return { master: true, error: 'no Chromium-family browser was found to render the frames' };
  const brandHex = system.palettes.brand.light.solidStrong.hex;
  const onBrand = bestTextOn(brandHex).color;
  const ink = system.palettes.neutral.light.steps[11].hex;
  const paper = system.palettes.neutral.light.steps[0].hex;
  const outDir = path.join(brandDir, 'media', 'frames');
  await mkdir(outDir, { recursive: true });
  const work = path.join(tmpdir(), `brandi-frames-${process.pid}-${Math.random().toString(36).slice(2)}`);
  await mkdir(work, { recursive: true });
  const frames = { master: true, error: null };
  try {
    for (const f of FRAME_SPECS) {
      const ground = f.paper ? paper : brandHex;
      const svg = f.mark ? monochromeSvg(masterSvg, f.paper ? ink : onBrand) : null;
      const html = path.join(work, `${f.name}.html`);
      const png = path.join(outDir, `${f.name}.png`);
      await writeFile(html, frameHtml(svg, { w: f.w, h: f.h, ground, share: f.name.includes('9x16') ? 0.6 : f.paper ? 0.7 : 0.42 }));
      try {
        await screenshot(chrome, html, png, { width: f.w, height: f.h });
      } catch { /* reported below by its absence */ }
      frames[f.name] = existsSync(png) ? path.relative(projectRoot, png).split(path.sep).join('/') : null;
    }
  } finally {
    await rm(work, { recursive: true, force: true });
  }
  if (FRAME_SPECS.some((f) => !frames[f.name])) frames.error = 'the browser did not produce every frame';
  return frames;
}

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------

const BOARD_FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&display=swap';
const BOARD_CSS = `
  * { box-sizing: border-box; }
  .board { font-family: 'Archivo', ui-sans-serif, sans-serif; background: #FFFFFF; color: #111111;
    padding: 56px; min-height: 100%; -webkit-font-smoothing: antialiased; }
  .eyebrow { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #6B6B6B; font-weight: 500; }
  h1 { font-size: 40px; line-height: 1.1; margin: 10px 0 0; font-weight: 600; letter-spacing: -0.02em; }
  .lede { font-size: 16px; line-height: 1.5; max-width: 70ch; color: #3A3A3A; margin: 14px 0 0; }
  .rule { height: 1px; background: #E4E4E4; margin: 32px 0; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
  .cell { border: 1px solid #E4E4E4; display: flex; flex-direction: column; }
  .cell__art { height: 424px; background: #F2F2F2; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .cell__art img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
  .cell__none { font-size: 14px; color: #6B6B6B; padding: 24px; text-align: center; }
  .cell__body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 6px; min-height: 90px; }
  .cell__id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-weight: 600; }
  .cell__meta { font-size: 12px; line-height: 1.45; color: #3A3A3A; }
  .tag { display: inline-block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px;
    border: 1px solid currentColor; margin-right: 6px; }
  .tag--approved { color: #1B6B3A; }
  .tag--picked { color: #8A5A00; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  caption { text-align: left; font-size: 13px; color: #3A3A3A; padding: 0 0 10px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #E4E4E4; }
  th { font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #6B6B6B; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
`;

const KIND_TITLES = {
  photo: 'Photography', scene: 'Scenes for the mockups', motion: 'Motion', illustration: 'Illustration',
  icon: 'Icon exploration', sound: 'Sound', voice: 'Voice', object: 'The mark in 3D', edit: 'Edits', ideation: 'Logo sparks',
};
const KIND_LEDES = {
  photo: 'Samples of the art direction. Approve the ones that show it best; they go into the book labelled as generated, never as photographs of the business.',
  scene: 'Blank real-world surfaces. Approve nothing here: read the corners of the good ones with brandi mockup grid, and the real mark is composited onto them.',
  motion: 'Poster frames. The files are beside the plan. A sting ends on the real mark; if it does not, it failed.',
  illustration: 'Samples of the written illustration style, drawn only in the palette.',
  icon: 'Traced exploration for whoever draws the set. Not production icons.',
  sound: 'Listen to the files beside the plan. Nothing to see here but the list.',
  voice: 'Listen to the files beside the plan.',
  object: 'Preview renders. The model files are beside the plan.',
  edit: 'Operations on files that already existed.',
  ideation: 'Sparks, not marks, from several image models. Pick the ones worth pursuing with brandi media pick; the forge redraws each picked spark in vector, and the raster never enters the brand.',
};

const boardName = (kind) => `Media${kind.charAt(0).toUpperCase()}${kind.slice(1)}`;

/**
 * One board per kind with results, and a Main board that says what is where.
 * Boards embed previews only: the canvas has a size limit and a 4K PNG is not a
 * preview.
 */
export function mediaBoards(plan, { brandName = 'Brand', approved = new Set(), kind = null } = {}) {
  const boards = [];
  const copies = [];
  const kinds = Object.keys(KINDS).filter((k) => !kind || k === kind);
  const summary = [];
  for (const k of kinds) {
    const slots = plan.slots.filter((s) => s.kind === k && s.results?.length);
    const results = slots.flatMap((s) => s.results.map((r) => ({ ...r, slot: s })));
    if (!results.length) continue;
    summary.push({ kind: k, count: results.length, approved: results.filter((r) => approved.has(r.id)).length, picked: results.filter((r) => r.picked).length });
    const cells = results.map((r) => {
      // The preview, or an SVG, which is small. Never the full raster: a 4K PNG
      // is five megabytes, and a board of them will not seed.
      const source = r.preview ?? (/\.svg$/i.test(r.file ?? '') ? r.file : null);
      let art = `<div class="cell__none">${esc(KINDS[k].media)} file<br><code>${esc(r.file ?? 'not downloaded')}</code></div>`;
      if (source) {
        const local = `${r.id}${path.extname(source).toLowerCase()}`;
        copies.push({ from: source, to: local });
        art = `<img src="${esc(local)}" alt="${esc(r.slot.title ?? r.id)}">`;
      }
      const tags = `${approved.has(r.id) ? '<span class="tag tag--approved">approved</span>' : ''}${r.picked ? '<span class="tag tag--picked">picked</span>' : ''}`;
      return `<div class="cell"><div class="cell__art">${art}</div><div class="cell__body">
        <span class="cell__id">${esc(r.id)}</span>
        <span class="cell__meta">${tags}${esc(r.slot.title ?? '')}</span>
        <span class="cell__meta">${esc(r.modelName ?? r.model ?? '')}${r.credits != null ? ` &middot; ~${Number(r.credits).toFixed(2).replace(/\.?0+$/, '')} credits` : ''}</span>
        ${r.landing ? `<span class="cell__meta">${r.landing.lands ? 'Lands on the mark' : '<b>Drifts off the mark</b>'}: last frame SSIM ${r.landing.ssim}</span>` : ''}
      </div></div>`;
    });
    const rows = Math.ceil(results.length / 3);
    const h = 56 * 2 + 190 + rows * 540 + (rows - 1) * 28;
    const body = `<div class="board">
  <div><span class="eyebrow">${esc(brandName)} &middot; generated with Higgsfield</span><h1>${esc(KIND_TITLES[k])}</h1><p class="lede">${esc(KIND_LEDES[k])}</p></div>
  <div class="rule"></div>
  <div class="grid">${cells.join('\n')}</div>
</div>`;
    boards.push({
      file: `${boardName(k)}.dc.html`,
      w: 1440,
      h,
      source: artboard({ name: boardName(k), body, css: BOARD_CSS, fonts: BOARD_FONTS, systemNote: 'Written by brandi media board. Do not hand-edit: the next board run rewrites it.' }),
    });
  }
  if (!boards.length) return { boards, copies };
  const spent = spentOf(plan);
  const main = `<div class="board">
  <div><span class="eyebrow">${esc(brandName)}</span><h1>Generated media</h1><p class="lede">Candidates, not decisions. Nothing here is part of the brand until a person approves it by name, and a logo spark never is: the forge redraws it in vector.</p></div>
  <div class="rule"></div>
  <table><caption>What was generated, and what has been chosen</caption><thead><tr><th>Board</th><th>Files</th><th>Approved</th><th>Picked</th></tr></thead>
  <tbody>${summary.map((s) => `<tr><td>${esc(KIND_TITLES[s.kind])}</td><td>${s.count}</td><td>${s.approved}</td><td>${s.picked}</td></tr>`).join('')}</tbody></table>
  <div class="rule"></div>
  <p class="lede">About ${Math.round(spent)} credits spent, against a budget of ${plan.budget ?? DEFAULT_BUDGET}. Approve with <code>brandi media approve &lt;id&gt; --approved-by "&lt;name&gt;"</code>; pick sparks with <code>brandi media pick &lt;id&gt;</code>.</p>
</div>`;
  boards.unshift({ file: 'Main.dc.html', w: 1440, h: 520 + summary.length * 44, source: artboard({ name: 'Main', body: main, css: BOARD_CSS, fonts: BOARD_FONTS, systemNote: 'Written by brandi media board.' }) });
  return { boards, copies };
}

export async function writeBoards(plan, { brandDir, projectRoot, brandName, approved, kind }) {
  const dir = path.join(brandDir, 'media', 'canvas');
  // The directory is generated and nothing else: stale boards for a kind that
  // has since gone would otherwise sit on the canvas looking current.
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const { boards, copies } = mediaBoards(plan, { brandName, approved, kind });
  for (const b of boards) await writeFile(path.join(dir, b.file), b.source);
  const missing = [];
  for (const c of copies) {
    const src = path.resolve(projectRoot, c.from);
    if (existsSync(src) && await reallyInside(src, projectRoot)) await copyFile(src, path.join(dir, c.to));
    else missing.push(c.from);
  }
  if (boards.length) {
    const manifest = canvasManifest(boards.map(({ file, w, h }) => ({ file, w, h })), { launch: { view: 'canvas' } });
    await writeFile(path.join(dir, 'canvas.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  }
  return { dir, boards: boards.map(({ file, w, h }) => ({ file, w, h })), missing };
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

export const USAGE = `brandi media: photography, scenes, motion, sound and logo sparks, through Higgsfield

Optional. Brandi builds the whole brand without it; these commands exist for when it is there.

  status                      is Higgsfield installed, signed in, and how many credits
  models [--refresh] [--need J]
                              today's catalogue: what can do each job, what is new, what is chosen
  use <job> <model> --why "..." [--force] | use <job> --clear
                              pin a model for a job, with the reason; jobs: ${Object.keys(NEEDS).join(', ')}
  trial <slot> [--models a,b,c] [--top N]
                              the same prompt on the best model of each capable family, to compare
  plan [--kinds a,b] [--budget N] [--refresh]
                              deal the slots the brand file calls for, into brand/media/plan.json,
                              each on the strongest current model that can do its job
                              kinds: ${Object.keys(KINDS).join(', ')}
                              default: ${DEFAULT_KINDS.join(', ')}
  list                        every slot, its state, and every result
  add <id> --kind K [--model M] [--title T] [--prompt P] [--params JSON] [--refs JSON] [--count N]
                              a slot for anything the plan does not deal, with any model
  set <id> <field> <value>    prompt | model | count | title | params.<name> | refs.<role>
  cost [ids...] [--force]     price what would run, without creating anything
  run [ids...] [--budget N] [--force] [--concurrency N]
                              price, check the budget, create, wait, download
  import <job_id>... --slot <id> | --kind K [--title T]
                              fetch a job made directly with higgsfield, and record it
  board [--kind K]            write boards to brand/media/canvas for the canvas
  pick <result>... [--clear]  shortlist results; picked sparks go to the forge
  approve <result>... --approved-by "Name"
                              copy into brand/media/approved and record under identity.media

Flags: --json on any of them. --dir <brand dir> as everywhere else.`;
