#!/usr/bin/env node
/**
 * The logo forge: the state, the file layout, and the command line that drives
 * a concept round from a brief to an approved master.
 *
 * The working state lives in `brand/logo/logo.json`, not in `brand/brand.json`.
 * That split is deliberate. `brand.json` is what the brand IS, and a round of
 * twelve rejected sketches is not part of that; it is how the brand came to be.
 * Only the outcome crosses over: the master files, the variants, the clear-space
 * rule, the minimum sizes, and the record of who approved a generated mark.
 *
 * The division of labour, which is the whole design:
 *
 *   Code plans     the concept slots, so twelve concepts cannot converge on one
 *                  idea. Diversity is dealt, never requested.
 *   Claude draws   each slot, seeing only its own brief.
 *   Code measures  every candidate, before anybody says what they like.
 *   Code presents  the boards, deliberately neutral.
 *   A person picks. Always. Nothing becomes the mark because a machine liked it.
 *   Code produces  the master: normalised, outlined, measured, recorded.
 *
 * Usage:
 *   node logo.mjs plan     [--count 12] [--seed x] [--round 1]
 *   node logo.mjs refine   [<id>...] [--from 1]
 *   node logo.mjs wordmark --font "Bitter" [--weight 700] [--case upper] [--out f.svg]
 *   node logo.mjs lockup   --symbol a.svg --wordmark b.svg [--stacked] [--out f.svg]
 *   node logo.mjs import   <dir or files...> [--round 1] [--model "..."]
 *   node logo.mjs audit    [--round 1]
 *   node logo.mjs board    [--round 1]
 *   node logo.mjs pick     <id> [<id>...]
 *   node logo.mjs master   <id> [--approved-by "name"]
 *   node logo.mjs status
 */

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { planConcepts, slotBrief, refinementSlots, refinementBrief } from './logospec.mjs';
import { describeSvg } from './svg.mjs';
import { auditCandidates } from './logoaudit.mjs';
import { conceptRoundBoards, fitFrames } from './logoboard.mjs';
import { normaliseMaster, monoVariants, typesetWordmark, composeLockup, clearSpaceRule, minimumSizes, generationRecord, localDate } from './logogen.mjs';
import { canvasManifest } from './canvas.mjs';
import { loadBrand, saveBrand, addDecision } from './brandfile.mjs';
import { parseFont, fetchGoogleFont } from './font.mjs';

export const LOGO_STATE_VERSION = 1;

/** Where everything lives, relative to the project root. */
export const LAYOUT = Object.freeze({
  root: 'brand/logo',
  state: 'brand/logo/logo.json',
  brief: 'brand/logo/brief',
  slots: 'brand/logo/brief/slots',
  concepts: 'brand/logo/concepts',
  canvas: 'brand/logo/canvas',
  master: 'brand/logo/master',
  rights: 'brand/logo/rights',
});

const roundDir = (n) => `${LAYOUT.concepts}/round-${String(n).padStart(2, '0')}`;

/**
 * Resolve a path inside the project and refuse anything that leaves it.
 *
 * The forge reads SVG files whose names came from somewhere else, so a name
 * like `../../.ssh/id_rsa` has to stop here rather than in whatever reads it
 * next.
 */
export function within(root, target) {
  const base = path.resolve(root);
  const full = path.resolve(base, target);
  if (full !== base && !full.startsWith(base + path.sep)) {
    throw new Error(`refusing a path outside the project: ${target}`);
  }
  // Resolving the string is not enough. A symlink sitting INSIDE the project and
  // pointing outside it passes the test above and is then followed by every
  // read: a repository carrying `concepts/round-01/A1.svg -> ~/.ssh/id_rsa`
  // would have had that file's contents copied into the round and on into a
  // published canvas. Verified, before this existed.
  //
  // The nearest existing ancestor is what gets resolved, because the target of a
  // write does not exist yet and `realpath` on it would throw.
  let probe = full;
  while (probe !== path.dirname(probe) && !existsSync(probe)) probe = path.dirname(probe);
  let realBase;
  let realProbe;
  try {
    realBase = realpathSync(base);
    realProbe = realpathSync(probe);
  } catch {
    // Nothing resolvable to check against, so the string test above stands.
    return full;
  }
  if (realProbe !== realBase && !realProbe.startsWith(realBase + path.sep)) {
    throw new Error(`refusing a path that leaves the project through a symlink: ${target}`);
  }
  return full;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** An empty forge, with the brief it was given. */
export function emptyState({ name = 'Brand', category = null, oneLiner = null, audience = null } = {}) {
  return {
    version: LOGO_STATE_VERSION,
    brand: { name, category, oneLiner, audience },
    rounds: [],
    wordmark: null,
    master: null,
    rights: {
      searchesRun: [],
      note: 'No similarity or trade mark search has been run. Nothing here has been cleared for registration.',
    },
  };
}

export async function loadState(root = '.') {
  const file = within(root, LAYOUT.state);
  if (!existsSync(file)) return null;
  const parsed = JSON.parse(await readFile(file, 'utf8'));
  if (parsed.version !== LOGO_STATE_VERSION) {
    throw new Error(`logo.json is version ${parsed.version}, and this build understands ${LOGO_STATE_VERSION}`);
  }
  return parsed;
}

export async function saveState(root, state) {
  const file = within(root, LAYOUT.state);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(state, null, 2)}\n`);
  return file;
}

const roundOf = (state, n) => state.rounds.find((r) => r.round === n) ?? null;
const latestRound = (state) => (state.rounds.length ? state.rounds[state.rounds.length - 1] : null);

/**
 * What the brief knows, taking whatever `brand.json` already decided.
 *
 * Recon and Strategy have usually already answered most of this, and asking
 * again would be the tool failing to read its own files.
 */
export async function briefFromBrand(root = '.') {
  const file = within(root, 'brand/brand.json');
  if (!existsSync(file)) return {};
  try {
    const brand = await loadBrand(file);
    // The paths are exact rather than hopeful. An earlier version guessed at
    // `brand.brand.name`, found nothing, and dealt a whole round for a business
    // called "Brand" without saying anything was missing.
    const audience = Array.isArray(brand.strategy?.audiences) ? brand.strategy.audiences[0] : null;
    return {
      name: brand.meta?.name ?? null,
      category: brand.strategy?.category ?? brand.meta?.categories?.[0] ?? null,
      oneLiner: brand.strategy?.positioning ?? brand.strategy?.narrative ?? brand.strategy?.purpose ?? null,
      audience: typeof audience === 'string' ? audience : (audience?.name ?? audience?.need ?? null),
    };
  } catch {
    // A brand file that will not parse is a problem for `brandi status`, not a
    // reason the logo forge cannot start.
    return {};
  }
}

// ---------------------------------------------------------------------------
// plan
// ---------------------------------------------------------------------------

/**
 * Deal a round and write one brief per slot to disk.
 *
 * The briefs are files rather than arguments because each one goes to a
 * different agent, and an agent that can see the rest of the round converges on
 * it. One file, one slot, no sight of the others.
 */
export async function planRound(root, { count = 12, seed, round = null, brief = {} } = {}) {
  let state = (await loadState(root)) ?? emptyState(brief);
  state.brand = { ...state.brand, ...Object.fromEntries(Object.entries(brief).filter(([, v]) => v != null)) };

  const n = round ?? (latestRound(state)?.round ?? 0) + 1;
  const plan = planConcepts(state.brand, { count, seed });
  plan.round = n;

  const entry = {
    round: n,
    plannedOn: localDate(),
    seed: seed ?? null,
    count: plan.count,
    rules: plan.rules,
    slots: plan.slots,
    candidates: [],
    shortlist: [],
  };
  state.rounds = state.rounds.filter((r) => r.round !== n).concat(entry).sort((a, b) => a.round - b.round);

  const slotDir = within(root, `${LAYOUT.slots}/round-${String(n).padStart(2, '0')}`);
  await mkdir(slotDir, { recursive: true });
  const written = [];
  for (const slot of plan.slots) {
    const file = path.join(slotDir, `${slot.id}.md`);
    await writeFile(file, `${slotBrief(slot, state.brand)}\n`);
    written.push(file);
  }

  await mkdir(within(root, roundDir(n)), { recursive: true });
  await saveState(root, state);
  return { state, plan, slotFiles: written, conceptDir: within(root, roundDir(n)) };
}

/**
 * Deal a refinement round from the shortlist of the round before it.
 *
 * A refinement round is not a second concept round, and treating it as one is
 * how a good direction gets lost. Each shortlisted concept gets the same four
 * tasks, and each brief points at the exact file being refined, because unlike a
 * concept slot this work is explicitly derivative.
 */
export async function planRefinement(root, { ids = null, fromRound = null, round = null } = {}) {
  const state = await loadState(root);
  if (!state) throw new Error('no logo round has been planned yet. Run `logo plan` first.');

  const from = roundOf(state, fromRound ?? latestRound(state)?.round);
  if (!from) throw new Error(`there is no round ${fromRound}`);

  const chosen = ids ?? from.shortlist;
  if (!chosen.length) {
    throw new Error(`round ${from.round} has no shortlist yet. Run \`logo pick <id> ...\` first, or name the concepts to refine.`);
  }
  const unknown = chosen.filter((id) => !from.candidates.some((c) => c.id === id));
  if (unknown.length) throw new Error(`round ${from.round} has no concept called ${unknown.join(', ')}`);

  const n = round ?? (latestRound(state)?.round ?? 0) + 1;
  const slots = [];
  for (const id of chosen) {
    const candidate = from.candidates.find((c) => c.id === id);
    const slot = from.slots.find((s) => s.id === id) ?? {};
    slots.push(...refinementSlots({ ...slot, ...candidate, id }));
  }

  const entry = {
    round: n,
    kind: 'refinement',
    refines: from.round,
    plannedOn: localDate(),
    count: slots.length,
    rules: [
      'A refinement that nobody recognises as the same mark has failed, however good it is.',
      'The small-grade redraw is a redraw on the pixel grid, never a scaled copy.',
      'Still black on white. Colour is decided after the mark is right.',
    ],
    slots,
    candidates: [],
    shortlist: [],
  };
  state.rounds = state.rounds.filter((r) => r.round !== n).concat(entry).sort((a, b) => a.round - b.round);

  const slotDir = within(root, `${LAYOUT.slots}/round-${String(n).padStart(2, '0')}`);
  await mkdir(slotDir, { recursive: true });
  const written = [];
  for (const slot of slots) {
    const file = path.join(slotDir, `${slot.id}.md`);
    await writeFile(file, `${refinementBrief(slot, state.brand)}\n`);
    written.push(file);
  }

  await mkdir(within(root, roundDir(n)), { recursive: true });
  await saveState(root, state);
  return { state, round: n, refines: from.round, chosen, slots, slotFiles: written, conceptDir: within(root, roundDir(n)) };
}

/**
 * A name the project appears to go by, offered rather than assumed.
 *
 * A directory called `thornbury-cellar-door` is a strong hint and a poor brand
 * name: the capitalisation, the spacing and the ampersands are exactly the
 * details a wordmark is set in, and getting them from a slug means getting them
 * wrong. So this suggests and never decides, which is the same rule the rest of
 * the tool follows about inventing anything.
 */
export async function guessName(root = '.') {
  const pkg = within(root, 'package.json');
  if (existsSync(pkg)) {
    try {
      const name = JSON.parse(await readFile(pkg, 'utf8')).name;
      if (typeof name === 'string' && name.trim()) return titleFromSlug(name);
    } catch {
      // A package.json that will not parse is not worth a word here.
    }
  }
  const dir = path.basename(path.resolve(root));
  return dir && dir !== '/' ? titleFromSlug(dir) : null;
}

const titleFromSlug = (slug) =>
  String(slug)
    .replace(/^@[^/]+\//, '')
    .replace(/[-_.]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// import
// ---------------------------------------------------------------------------

/**
 * Take drawn SVGs into the round.
 *
 * A file is matched to its slot by its stem, so `A1.svg` is concept A1. Anything
 * that does not match a slot is reported rather than quietly kept, because an
 * unmatched file is nearly always a slot that was drawn under the wrong name and
 * would otherwise vanish from the round.
 */
export async function importConcepts(root, files, { round = null, model = null } = {}) {
  const state = await loadState(root);
  if (!state) throw new Error('no logo round has been planned yet. Run `logo plan` first.');
  const n = round ?? latestRound(state)?.round;
  const entry = roundOf(state, n);
  if (!entry) throw new Error(`there is no round ${n}`);

  const expanded = [];
  const escaped = [];
  for (const f of files) {
    const full = within(root, f);
    const s = await stat(full).catch(() => null);
    if (!s) throw new Error(`no such file: ${f}`);
    if (s.isDirectory()) {
      for (const name of (await readdir(full)).filter((x) => x.toLowerCase().endsWith('.svg')).sort()) {
        // Every file goes back through the guard. Checking only the directory
        // argument let a symlink INSIDE it point anywhere: the expanded paths
        // never touched `within` again, so a concept file linked to a file
        // outside the project was read and copied straight in.
        try {
          expanded.push(within(root, path.join(full, name)));
        } catch {
          escaped.push(name);
        }
      }
    } else {
      expanded.push(full);
    }
  }

  const outDir = within(root, roundDir(n));
  await mkdir(outDir, { recursive: true });

  const imported = [];
  const unmatched = [];
  const notSvg = [];
  for (const full of expanded) {
    const id = path.basename(full).replace(/\.svg$/i, '');
    const slot = entry.slots.find((s) => s.id.toLowerCase() === id.toLowerCase());
    if (!slot) {
      unmatched.push(path.basename(full));
      continue;
    }
    const raw = await readFile(full, 'utf8');
    // A file named `.svg` that is not one gets refused rather than copied in.
    // `normaliseMaster` hands back anything it cannot measure, so without this
    // an arbitrary file's contents landed in the round under a slot's name.
    if (!describeSvg(raw).hasRoot) {
      notSvg.push(path.basename(full));
      continue;
    }
    // Normalised on the way in, so every later measurement is of the same
    // artwork the boards show and the master is derived from.
    const svg = normaliseMaster(raw, { precision: 2 });
    const dest = path.join(outDir, `${slot.id}.svg`);
    await writeFile(dest, `${svg}\n`);
    imported.push({
      id: slot.id,
      file: path.relative(path.resolve(root), dest),
      provenance: generationRecord({ id: slot.id, slot, model, prompt: `${LAYOUT.slots}/round-${String(n).padStart(2, '0')}/${slot.id}.md` }),
    });
  }

  // Merged by id, not replaced. Re-importing one corrected file used to drop
  // every other candidate from the round: the SVGs stayed on disk but `audit`,
  // `board` and `pick` all read this list, so the rest of the round vanished and
  // "Imported 1 concepts" read like a successful add. A fan-out where agents
  // finish at different times hits this every time.
  const kept = entry.candidates.filter((c) => !imported.some((i) => i.id === c.id));
  const replaced = entry.candidates.filter((c) => imported.some((i) => i.id === c.id)).map((c) => c.id);
  entry.candidates = [...kept, ...imported].sort((a, b) => a.id.localeCompare(b.id));
  // A replaced concept's audit belongs to artwork that no longer exists.
  for (const c of entry.candidates) {
    if (replaced.includes(c.id)) delete c.audit;
  }
  if (replaced.length) {
    entry.auditedOn = null;
    delete entry.duplicates;
  }
  await saveState(root, state);
  return { imported, replaced, kept: kept.length, unmatched, notSvg, escaped, round: n, dir: outDir };
}

/** The candidates of a round, with their SVG source loaded. */
export async function loadCandidates(root, entry) {
  const out = [];
  for (const c of entry.candidates) {
    const slot = entry.slots.find((s) => s.id === c.id);
    const svg = await readFile(within(root, c.file), 'utf8');
    out.push({ ...slot, ...c, svg });
  }
  return out;
}

// ---------------------------------------------------------------------------
// audit
// ---------------------------------------------------------------------------

export async function auditRound(root, { round = null } = {}) {
  const state = await loadState(root);
  if (!state) throw new Error('no logo round has been planned yet.');
  const n = round ?? latestRound(state)?.round;
  const entry = roundOf(state, n);
  if (!entry) throw new Error(`there is no round ${n}`);
  if (!entry.candidates.length) throw new Error(`round ${n} has no concepts yet. Run \`logo import\` first.`);

  const candidates = await loadCandidates(root, entry);
  const result = await auditCandidates(candidates.map((c) => ({
    id: c.id,
    svg: c.svg,
    architecture: c.architecture,
    // Refinements of one parent are meant to resemble each other, so the
    // duplicate pass judges them against a much tighter bar than it uses
    // between unrelated concepts.
    refines: c.refines ?? null,
  })));

  for (const c of entry.candidates) {
    const a = result.candidates.find((x) => x.id === c.id);
    if (a) c.audit = { verdict: a.verdict, findings: a.findings, contexts: a.contexts, metrics: a.metrics };
  }
  entry.duplicates = result.duplicates;
  entry.auditedOn = localDate();
  entry.rendered = result.rendered;
  await saveState(root, state);
  return { round: n, ...result };
}

// ---------------------------------------------------------------------------
// board
// ---------------------------------------------------------------------------

export async function buildBoards(root, { round = null } = {}) {
  const state = await loadState(root);
  if (!state) throw new Error('no logo round has been planned yet.');
  const n = round ?? latestRound(state)?.round;
  const entry = roundOf(state, n);
  if (!entry) throw new Error(`there is no round ${n}`);
  if (!entry.candidates.length) throw new Error(`round ${n} has no concepts yet.`);

  const unaudited = entry.candidates.filter((c) => !c.audit).map((c) => c.id);
  if (unaudited.length) {
    // The boards say "measured before anybody said what they like" in their own
    // copy, and the audit board is titled "What the arithmetic found". Building
    // them from an unmeasured round printed a passing verdict for every mark as
    // fact on the one artefact a person decides from.
    throw new Error(
      `round ${n} has ${unaudited.length === entry.candidates.length ? 'not been audited' : `unaudited concepts (${unaudited.join(', ')})`}. `
      + 'The boards state that every mark was measured, so they will not be built from a round that was not. Run `logo audit` first.',
    );
  }

  const candidates = await loadCandidates(root, entry);
  const audits = entry.candidates.map((c) => ({ ...c.audit, id: c.id }));

  const plan = { ...entry, slots: entry.slots };
  let boards = conceptRoundBoards({ plan, candidates, audits, brandName: state.brand.name ?? 'Brand' });
  boards = await fitFrames(boards);

  const dir = within(root, LAYOUT.canvas);
  await mkdir(dir, { recursive: true });
  for (const b of boards) await writeFile(path.join(dir, b.file), b.source);
  // A fresh open lands on the whole canvas rather than one artboard, because
  // the point of the round is the range and a focused open shows one mark.
  const manifest = canvasManifest(boards.map(({ file, w, h }) => ({ file, w, h })), {
    launch: { view: 'canvas' },
  });
  await writeFile(path.join(dir, 'canvas.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  entry.canvas = path.relative(path.resolve(root), dir);
  await saveState(root, state);
  return { dir, boards: boards.map((b) => ({ file: b.file, w: b.w, h: b.h })) };
}

// ---------------------------------------------------------------------------
// pick
// ---------------------------------------------------------------------------

/**
 * Record the shortlist.
 *
 * Two or three, not one. Choosing a single winner out of a first round is how a
 * brand ends up with the safest thing in the set: the refinement round is where
 * an idea becomes a mark, and it needs more than one idea to be worth running.
 */
export async function pickDirections(root, ids, { round = null } = {}) {
  const state = await loadState(root);
  if (!state) throw new Error('no logo round has been planned yet.');
  const n = round ?? latestRound(state)?.round;
  const entry = roundOf(state, n);
  if (!entry) throw new Error(`there is no round ${n}`);

  const unknown = ids.filter((id) => !entry.candidates.some((c) => c.id === id));
  if (unknown.length) {
    const known = entry.candidates.map((c) => c.id);
    throw new Error(`round ${n} has no concept called ${unknown.join(', ')}. It has: ${known.join(', ') || 'nothing yet'}`);
  }

  entry.shortlist = [...new Set(ids)];
  entry.pickedOn = localDate();
  await saveState(root, state);
  return { round: n, shortlist: entry.shortlist, single: entry.shortlist.length === 1 };
}

// ---------------------------------------------------------------------------
// wordmark and lockup
// ---------------------------------------------------------------------------

export async function buildWordmark(root, { family, weight = 400, text = null, size = 200, tracking = 0, letterCase = 'as-given', pairAdjust = {}, out = null } = {}) {
  const state = (await loadState(root)) ?? emptyState(await briefFromBrand(root));
  const name = text ?? state.brand.name;
  if (!name) throw new Error('no name to set. Pass --text or run `logo plan` with a brand name.');
  if (!family) throw new Error('a wordmark needs a typeface. Pass --font "Family".');

  const { buffer, url } = await fetchGoogleFont(family, { weight });
  const font = parseFont(buffer);
  const built = typesetWordmark(font, name, { size, tracking, pairAdjust, letterCase, family, weight });

  const dest = out ? within(root, out) : within(root, `${LAYOUT.master}/wordmark.svg`);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, `${built.svg}\n`);

  state.wordmark = { ...built.recipe, source: url, file: path.relative(path.resolve(root), dest) };
  await saveState(root, state);
  return { file: dest, ...built };
}

export async function buildLockup(root, { symbol, wordmark, orientation = 'horizontal', gapRatio, symbolRatio, capHeight = null, out = null } = {}) {
  if (!symbol || !wordmark) throw new Error('a lockup needs --symbol and --wordmark');
  const symbolSvg = await readFile(within(root, symbol), 'utf8');
  const wordSvg = await readFile(within(root, wordmark), 'utf8');
  const state = (await loadState(root)) ?? emptyState(await briefFromBrand(root));

  const built = composeLockup({
    symbol: symbolSvg,
    wordmark: wordSvg,
    orientation,
    capHeight: capHeight ?? state.wordmark?.capHeight ?? null,
    ...(gapRatio != null ? { gapRatio } : {}),
    ...(symbolRatio != null ? { symbolRatio } : {}),
  });

  const dest = out ? within(root, out) : within(root, `${LAYOUT.master}/${orientation === 'stacked' ? 'stacked' : 'primary'}.svg`);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, `${normaliseMaster(built.svg)}\n`);
  return { file: dest, ...built };
}

// ---------------------------------------------------------------------------
// master
// ---------------------------------------------------------------------------

/**
 * Find a concept by id, in the round asked for or in whichever round has it.
 *
 * After a refinement round exists, the latest round is round two, and asking to
 * master `A1` from round one used to fail with "round 2 has no concept called
 * A1". True, unhelpful, and the exact command somebody types next. An id that
 * exists in exactly one round is not ambiguous, so it is used, and the caller is
 * told which round it came from.
 */
function findConcept(state, id, requestedRound) {
  if (requestedRound != null) {
    const entry = roundOf(state, requestedRound);
    if (!entry) throw new Error(`there is no round ${requestedRound}`);
    const candidate = entry.candidates.find((c) => c.id === id);
    if (!candidate) throw new Error(`round ${requestedRound} has no concept called ${id}`);
    return { entry, candidate };
  }

  const hits = state.rounds
    .map((entry) => ({ entry, candidate: entry.candidates.find((c) => c.id === id) }))
    .filter((h) => h.candidate);

  if (hits.length === 1) return hits[0];
  if (hits.length > 1) {
    throw new Error(`${id} exists in rounds ${hits.map((h) => h.entry.round).join(' and ')}. Say which with --round.`);
  }
  const known = state.rounds.flatMap((r) => r.candidates.map((c) => c.id));
  throw new Error(known.length
    ? `no concept called ${id}. This project has: ${known.join(', ')}`
    : `no concept called ${id}, and nothing has been imported yet. Run \`logo import\` first.`);
}

/**
 * Promote a concept to the master, and write the result into `brand.json`.
 *
 * `approvedBy` is not optional in spirit. A generated mark that nobody approved
 * is a candidate, and the record says so, because the one thing this product
 * must never do is imply a person signed off on something they never saw.
 */
export async function promoteToMaster(root, id, { round = null, approvedBy = null, chrome } = {}) {
  // An empty or whitespace name is nobody. Left as-is it rendered the manifest's
  // approval row as a blank, which reads like a field somebody forgot rather
  // than the loud refusal it has to be.
  const approver = typeof approvedBy === 'string' && approvedBy.trim() ? approvedBy.trim() : null;
  const state = await loadState(root);
  if (!state) throw new Error('no logo round has been planned yet.');
  const { entry, candidate } = findConcept(state, id, round);
  const n = entry.round;

  const raw = await readFile(within(root, candidate.file), 'utf8');
  const master = normaliseMaster(raw, { precision: 2 });
  const mono = monoVariants(master);
  const dir = within(root, LAYOUT.master);
  await mkdir(dir, { recursive: true });

  const files = {
    primary: path.join(dir, 'primary.svg'),
    black: path.join(dir, 'mono-black.svg'),
    white: path.join(dir, 'mono-white.svg'),
  };
  await writeFile(files.primary, `${master}\n`);
  await writeFile(files.black, `${mono.black}\n`);
  await writeFile(files.white, `${mono.white}\n`);

  const clear = clearSpaceRule(master);
  const minimums = await minimumSizes(master, chrome === undefined ? {} : { chrome });

  state.master = {
    chosenFrom: id,
    round: n,
    approvedBy: approver,
    approvedOn: approver ? localDate() : null,
    provenance: { ...candidate.provenance, approvedBy: approver, status: approver ? 'approved by a person' : 'candidate, not approved' },
    files: Object.fromEntries(Object.entries(files).map(([k, v]) => [k, path.relative(path.resolve(root), v)])),
    clearSpace: clear,
    minimumSizes: minimums,
  };
  await saveState(root, state);

  await writeRights(root, state);
  const brandWritten = await writeIntoBrand(root, state);

  return { id, round: n, files: state.master.files, clearSpace: clear, minimumSizes: minimums, approvedBy: approver, brandWritten };
}

/**
 * Push the outcome into `brand.json`, and only the outcome.
 *
 * The variants written here are exactly the ones that exist on disk. Declaring a
 * variant that was never drawn is the contradiction `brandi validate` exists to
 * catch, and producing it from the tool that is supposed to prevent it would be
 * the worst possible source.
 */
export async function writeIntoBrand(root, state) {
  const file = within(root, 'brand/brand.json');
  if (!existsSync(file)) return false;
  const brand = await loadBrand(file);

  // The shape is ensured rather than assumed. `brandi init` always produces it,
  // but this writes into a file it did not create, and a hand-edited or
  // half-migrated brand file is a real thing that should not crash the step
  // that was about to record the mark.
  brand.identity ??= {};
  brand.identity.logo ??= {};
  brand.governance ??= {};
  brand.governance.decisions ??= [];
  const logo = brand.identity.logo;

  logo.files = [
    { path: state.master.files.primary, role: 'primary' },
    { path: state.master.files.black, role: 'mono-black' },
    { path: state.master.files.white, role: 'mono-white' },
  ];
  logo.variants = [
    { name: 'Primary', use: 'Everywhere, unless another variant is specifically called for.', file: state.master.files.primary },
    { name: 'One colour, black', use: 'Etching, foil, single-colour print, fax, a black and white printer.', file: state.master.files.black },
    { name: 'Reversed', use: 'Knocked out of the dark surface token, and out of photography above the stated tonal window.', file: state.master.files.white },
  ];
  if (state.master.clearSpace) logo.clearSpace = state.master.clearSpace.sentence;
  if (state.master.minimumSizes) {
    logo.minSize = { screenPx: state.master.minimumSizes.screenPx, printMm: state.master.minimumSizes.printMm };
    logo.minSizes = [{
      variant: 'Primary',
      screenPx: state.master.minimumSizes.screenPx,
      printMm: state.master.minimumSizes.printMm,
      basis: state.master.minimumSizes.basis,
    }];
  }
  logo.provenance = state.master.provenance;

  addDecision(brand, {
    decision: `The mark is concept ${state.master.chosenFrom} from logo round ${state.master.round}.`,
    rationale: state.master.approvedBy
      ? `Generated against a planned concept brief, measured against the application context matrix, and approved by ${state.master.approvedBy}. A generated mark is a starting point somebody approved, not a drawn one, and it has not been cleared for registration.`
      : 'Generated against a planned concept brief and measured against the application context matrix. NOBODY HAS APPROVED IT YET, and it must not be published as the mark until somebody has.',
    alternatives: ['the other concepts in the round, kept under brand/logo/concepts'],
  });

  await saveBrand(file, brand);
  return true;
}

/** The paperwork a generated mark has to carry. */
export async function writeRights(root, state) {
  const dir = within(root, LAYOUT.rights);
  await mkdir(dir, { recursive: true });
  const p = state.master?.provenance ?? {};
  const manifest = `# Generation manifest

Written by \`brandi logo master\`. This is the record that lets anybody say later that the
mark was deliberately developed rather than lifted from somewhere nobody can name.

| | |
|---|---|
| Concept | ${state.master?.chosenFrom ?? '[none]'} |
| Round | ${state.master?.round ?? '[none]'} |
| Generated by | ${p.generatedBy ?? 'unrecorded'} |
| Generated on | ${p.generatedOn ?? 'unrecorded'} |
| Slot brief | ${p.prompt ?? 'unrecorded'} |
| Architecture | ${p.slot?.architecture ?? 'unrecorded'} |
| Register | ${p.slot?.register ?? 'unrecorded'} |
| Symbol approach | ${p.slot?.symbolApproach ?? 'none'} |
| Approved by | ${state.master?.approvedBy || '**NOBODY YET**'} |
| Status | ${p.status ?? 'candidate, not approved'} |

${p.caveat ?? ''}
`;

  const search = `# Similarity and trade mark search record

**Nothing below has been done.** This file is the checklist and the place to record the answers.
No search runs automatically, and an AI-assisted mark is not automatically original or safe to
register.

| Search | Where | Date | Who | Result |
|---|---|---|---|---|
| Australian trade marks | <https://search.ipaustralia.gov.au/trademarks/search> | | | |
| Image similarity, Australia | IP Australia image search, upload the mark itself | | | |
| Global brand database | <https://www.wipo.int/en/web/global-brand-database> | | | |
| Reverse image search | Any engine, the symbol alone with no wordmark | | | |
| Exact business name | Company and business name registers | | | |
| Phonetic and spelling variants | Same registers | | | |
| Category marks | The classes the business will actually trade in | | | |

IP Australia states plainly that a preliminary search is not a substitute for examination. For any
mark going on a building, a vehicle or a registration, a trade mark professional reviews it before
it ships.

## Distinctiveness, honestly

The generated concepts were checked against a category cliche list at brief time, and near
duplicates within the round were detected by perceptual hash. Neither of those is a search against
the world. Record here what a person actually looked at.
`;

  await writeFile(path.join(dir, 'generation-manifest.md'), manifest);
  const searchFile = path.join(dir, 'similarity-search-record.md');
  // Never overwrite a record somebody has filled in.
  if (!existsSync(searchFile)) await writeFile(searchFile, search);
  return dir;
}

// ---------------------------------------------------------------------------
// status
// ---------------------------------------------------------------------------

export async function forgeStatus(root = '.') {
  const state = await loadState(root);
  if (!state) return { started: false, next: 'logo plan' };
  const entry = latestRound(state);
  if (!entry) return { started: true, next: 'logo plan' };

  const drawn = entry.candidates.length;
  const audited = entry.candidates.filter((c) => c.audit).length;
  const next = drawn === 0 ? 'draw the slot briefs, then logo import'
    : audited < drawn ? 'logo audit'
    : entry.candidates.some((c) => c.audit?.verdict === 'unverified') ? 'logo audit, on a machine with a browser: nothing was rendered'
    : !entry.canvas ? 'logo board'
    : !entry.shortlist.length ? 'show the canvas and logo pick'
    : !state.master ? 'logo master <id> --approved-by "name"'
    : 'done';

  return {
    started: true,
    brand: state.brand,
    round: entry.round,
    planned: entry.slots.length,
    drawn,
    audited,
    verdicts: entry.candidates.reduce((acc, c) => {
      const v = c.audit?.verdict ?? 'not audited';
      acc[v] = (acc[v] ?? 0) + 1;
      return acc;
    }, {}),
    shortlist: entry.shortlist,
    master: state.master ? { from: state.master.chosenFrom, approvedBy: state.master.approvedBy } : null,
    next,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

/**
 * Flags that never take a value.
 *
 * Without this list a boolean flag swallows the next positional: `logo pick
 * --json A1 B2` reads A1 as the value of `--json`, drops it, and shortlists one
 * concept instead of two. The wrong answer, delivered confidently. `brandi.mjs`
 * learned the same lesson and keeps the same kind of list.
 */
const BOOLEAN_FLAGS = new Set(['json', 'stacked', 'help']);

/** Flags with values, flags without, and positionals, told apart properly. */
export function parseArgs(argv) {
  const flags = new Map();
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      positional.push(a);
      continue;
    }
    const [key, inline] = a.slice(2).split('=');
    const next = argv[i + 1];
    if (inline !== undefined) flags.set(key, inline);
    else if (BOOLEAN_FLAGS.has(key)) flags.set(key, true);
    else if (next === undefined || next.startsWith('--')) flags.set(key, true);
    else flags.set(key, argv[++i]);
  }
  return { flags, positional };
}

const intFlag = (flags, key, fallback) => {
  if (!flags.has(key)) return fallback;
  const raw = flags.get(key);
  const n = Number(raw);
  if (raw === true || !Number.isFinite(n)) throw new Error(`--${key} needs a number, got ${raw === true ? '(nothing)' : raw}`);
  return n;
};

const USAGE = `brandi logo: generate, measure and choose a mark

  plan     [--count 12] [--seed x] [--round N] [--name "X"] [--category "X"]
  refine   [<id>...] [--from N] [--round N]      the shortlist, four tasks each
  wordmark --font "Family" [--weight 700] [--case upper|lower] [--text "X"]
           [--size 200] [--tracking -15] [--out file.svg]
  lockup   --symbol a.svg --wordmark b.svg [--stacked] [--gap 0.5] [--symbol-ratio 1.15]
  import   <dir|file.svg...> [--round N] [--model "claude-opus-5"]
  audit    [--round N]
  board    [--round N]
  pick     <id> [<id>...]
  master   <id> [--approved-by "name"] [--round N]
  status

Add --json to read any result as data.`;

/** The `brandi logo` dispatcher, exported so brandi.mjs can delegate in-process. */
export async function main(argv) {
  const { flags, positional } = parseArgs(argv);
  const command = positional.shift();
  const root = flags.get('root') ?? '.';
  const asJson = flags.has('json');
  const say = (data, prose) => {
    if (asJson) console.log(JSON.stringify(data, null, 2));
    else console.log(prose);
  };

  switch (command) {
    case 'plan': {
      const brief = { ...(await briefFromBrand(root)) };
      for (const k of ['name', 'category', 'oneLiner', 'audience']) {
        if (flags.has(k) && flags.get(k) !== true) brief[k] = flags.get(k);
      }
      const res = await planRound(root, {
        count: intFlag(flags, 'count', 12),
        seed: flags.get('seed') === true ? undefined : flags.get('seed'),
        round: flags.has('round') ? intFlag(flags, 'round') : null,
        brief,
      });
      // Silence here dealt a whole round for a business called "Brand" once,
      // and nothing said the name had not been found.
      const guess = res.plan.name === 'Brand' ? await guessName(root) : null;
      const missing = [
        res.plan.name === 'Brand' ? 'the name (--name, or meta.name in brand.json)' : null,
        res.plan.category === 'general' ? 'the category (--category, or strategy.category)' : null,
      ].filter(Boolean);
      say(res.plan, [
        `Planned ${res.plan.count} concepts for ${res.plan.name} in round ${res.plan.round}.`,
        `Slot briefs: ${path.relative(path.resolve(root), path.dirname(res.slotFiles[0]))}/`,
        `Draw each one into ${path.relative(path.resolve(root), res.conceptDir)}/<ID>.svg, then run \`logo import\`.`,
        '',
        'Every slot carries a different architecture, register and symbol approach. Give each',
        'one to a different agent, and give it ONLY its own brief.',
        missing.length ? `\nNothing supplied ${missing.join(' or ')}, so the round was planned generically.\nA category is what tells each slot which cliches to refuse, so it is worth a moment.` : '',
        guess ? `\nThis directory is called "${guess}". If that is the business, plan again with --name.\nIt is not assumed, because a folder name is not a brand name and the mark gets set in it.` : '',
      ].filter(Boolean).join('\n'));
      break;
    }

    case 'refine': {
      const res = await planRefinement(root, {
        ids: positional.length ? positional : null,
        fromRound: flags.has('from') ? intFlag(flags, 'from') : null,
        round: flags.has('round') ? intFlag(flags, 'round') : null,
      });
      say(res, [
        `Round ${res.round} refines ${res.chosen.join(', ')} from round ${res.refines}: ${res.slots.length} slots.`,
        `Briefs: ${path.relative(path.resolve(root), path.dirname(res.slotFiles[0]))}/`,
        `Draw each into ${path.relative(path.resolve(root), res.conceptDir)}/<ID>.svg, then \`logo import\`.`,
        '',
        'Each brief points at the exact file it is refining, and says so. This is not a',
        'second concept round: an agent that comes back with a new idea has failed the task.',
      ].join('\n'));
      break;
    }

    case 'wordmark': {
      const res = await buildWordmark(root, {
        family: flags.get('font') === true ? null : flags.get('font'),
        weight: intFlag(flags, 'weight', 400),
        text: flags.get('text') === true ? null : flags.get('text'),
        size: intFlag(flags, 'size', 200),
        tracking: intFlag(flags, 'tracking', 0),
        letterCase: flags.get('case') === true ? 'as-given' : (flags.get('case') ?? 'as-given'),
        out: flags.get('out') === true ? null : flags.get('out'),
      });
      say(res.recipe, `Set and outlined in ${res.recipe.family} ${res.recipe.weight}, cap height ${res.recipe.capHeight}.\n${path.relative(path.resolve(root), res.file)}`);
      break;
    }

    case 'lockup': {
      const res = await buildLockup(root, {
        symbol: flags.get('symbol'),
        wordmark: flags.get('wordmark'),
        orientation: flags.has('stacked') ? 'stacked' : 'horizontal',
        gapRatio: flags.has('gap') ? intFlag(flags, 'gap') : undefined,
        symbolRatio: flags.has('symbol-ratio') ? intFlag(flags, 'symbol-ratio') : undefined,
        out: flags.get('out') === true ? null : flags.get('out'),
      });
      say(res.construction, `${res.construction.orientation} lockup, ${res.construction.width} x ${res.construction.height}.\nGap is ${res.construction.gapRule}, symbol is ${res.construction.symbolRule}.\n${path.relative(path.resolve(root), res.file)}`);
      break;
    }

    case 'import': {
      if (!positional.length) throw new Error('import needs a directory or some files');
      const res = await importConcepts(root, positional, {
        round: flags.has('round') ? intFlag(flags, 'round') : null,
        model: flags.get('model') === true ? null : flags.get('model'),
      });
      const lines = [
        `Imported ${res.imported.length} concept${res.imported.length === 1 ? '' : 's'} into round ${res.round}${res.kept ? `, alongside ${res.kept} already there` : ''}.`,
      ];
      if (res.replaced.length) {
        lines.push(`Replaced ${res.replaced.join(', ')}, so the round needs auditing again.`);
      }
      if (res.escaped.length) {
        lines.push(`Refused ${res.escaped.length} file(s) that leave the project through a symlink: ${res.escaped.join(', ')}`);
      }
      if (res.notSvg.length) {
        lines.push(`Refused ${res.notSvg.length} file(s) that are not SVG: ${res.notSvg.join(', ')}`);
      }
      if (res.unmatched.length) {
        lines.push(`Ignored ${res.unmatched.length} file(s) that match no slot: ${res.unmatched.join(', ')}`);
        lines.push('A file that matches no slot is nearly always a slot drawn under the wrong name.');
      }
      say(res, lines.join('\n'));
      break;
    }

    case 'audit': {
      const res = await auditRound(root, { round: flags.has('round') ? intFlag(flags, 'round') : null });
      const lines = [`Round ${res.round}, ${res.candidates.length} concepts${res.rendered ? '' : ' (no browser, so nothing was rendered)'}.`, ''];
      for (const c of res.candidates) {
        const fails = c.contexts.filter((r) => r.status === 'fail').map((r) => r.context);
        lines.push(`  ${c.id.padEnd(4)} ${c.verdict}${fails.length ? `  fails: ${fails.join(', ')}` : ''}`);
        for (const f of c.findings.filter((x) => x.severity === 'error')) lines.push(`         ${f.message}`);
      }
      if (res.duplicates.length) {
        lines.push('', res.duplicates.every((d) => d.kind === 'unchanged') ? 'Nothing changed:' : 'Same idea twice:');
        for (const d of res.duplicates) {
          lines.push(d.kind === 'unchanged'
            ? `  ${d.a} and ${d.b} are the same artwork, so the refinement was not done`
            : `  ${d.a} and ${d.b}${d.distance === 0 ? ', identical' : `, ${(d.distance * 100).toFixed(1)} per cent apart`}`);
        }
      }
      say(res, lines.join('\n'));
      break;
    }

    case 'board': {
      const res = await buildBoards(root, { round: flags.has('round') ? intFlag(flags, 'round') : null });
      say(res, [`Wrote ${res.boards.length} artboards to ${path.relative(path.resolve(root), res.dir)}/`, ...res.boards.map((b) => `  ${b.file}  ${b.w}x${b.h}`), '', 'Validate, seed and publish it, then show the link and ask which directions to keep.'].join('\n'));
      break;
    }

    case 'pick': {
      if (!positional.length) throw new Error('pick needs at least one concept id');
      const res = await pickDirections(root, positional, { round: flags.has('round') ? intFlag(flags, 'round') : null });
      say(res, res.single
        ? `Shortlisted ${res.shortlist.join(', ')}. One direction from a first round is usually the safest thing in the set: consider keeping a second alive through refinement.`
        : `Shortlisted ${res.shortlist.join(', ')}.`);
      break;
    }

    case 'master': {
      const id = positional.shift();
      if (!id) throw new Error('master needs a concept id');
      const res = await promoteToMaster(root, id, {
        round: flags.has('round') ? intFlag(flags, 'round') : null,
        approvedBy: flags.get('approved-by') === true ? null : (flags.get('approved-by') ?? null),
      });
      say(res, [
        `Concept ${res.id} from round ${res.round} is now the master.`,
        ...Object.entries(res.files).map(([k, v]) => `  ${k.padEnd(8)} ${v}`),
        res.clearSpace ? `\nClear space: ${res.clearSpace.sentence}` : '',
        res.minimumSizes
          ? `\nArithmetic floor: ${res.minimumSizes.screenPx}px on screen and ${res.minimumSizes.printMm}mm in print, set by ${res.minimumSizes.basis}.\nThat is the size at which the thinnest feature is one pixel, which is a floor and not\nan answer. Render at it, look, and publish the number that survives.`
          : '',
        res.approvedBy
          ? `\nApproved by ${res.approvedBy}.`
          : '\nNOBODY HAS APPROVED THIS. It is recorded as a candidate, and it must not be published\nas the mark until a person has looked at it and said so. Rerun with --approved-by "name".',
        res.brandWritten ? '\nWritten into brand/brand.json.' : '\nNo brand/brand.json found, so nothing was written into it.',
        '\nbrand/logo/rights/ holds the generation manifest and the search record. Neither search has been run.',
      ].filter(Boolean).join('\n'));
      break;
    }

    case 'status': {
      const res = await forgeStatus(root);
      if (!res.started) {
        say(res, 'No logo round yet. Run `logo plan`.');
        break;
      }
      say(res, [
        `${res.brand.name ?? 'Brand'}, round ${res.round}: ${res.drawn} of ${res.planned} drawn, ${res.audited} audited.`,
        Object.entries(res.verdicts).map(([k, v]) => `  ${v} ${k}`).join('\n'),
        res.shortlist.length ? `Shortlist: ${res.shortlist.join(', ')}` : 'Nothing shortlisted yet.',
        res.master ? `Master: ${res.master.from}, approved by ${res.master.approvedBy ?? 'NOBODY YET'}` : 'No master yet.',
        `Next: ${res.next}`,
      ].filter(Boolean).join('\n'));
      break;
    }

    default:
      console.log(USAGE);
      if (command) process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

export default {
  LAYOUT,
  LOGO_STATE_VERSION,
  emptyState,
  loadState,
  saveState,
  within,
  briefFromBrand,
  planRound,
  planRefinement,
  guessName,
  importConcepts,
  loadCandidates,
  auditRound,
  buildBoards,
  pickDirections,
  buildWordmark,
  buildLockup,
  promoteToMaster,
  writeIntoBrand,
  writeRights,
  forgeStatus,
  parseArgs,
};
