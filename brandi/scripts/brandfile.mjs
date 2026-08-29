/**
 * The brand file: `brand/brand.json`, the durable source of truth.
 *
 * Three things live in a brand system and they want different homes:
 *
 *   meaning         strategy, personality, narrative, the decisions and why
 *                   they were made. Prose, because that is what prose is for.
 *   rules           colours, type, spacing, voice constraints, logo rules.
 *                   Structured, because tools have to read them.
 *   implementation  tokens, CSS, components. Generated, never hand-edited.
 *
 * brand.json holds the second and enough of the first to regenerate the rest.
 * The brand book, the tokens and the enforcement skill are all VIEWS of this
 * file. That is the whole point: a PDF goes out of date the day it is made, a
 * source of truth does not.
 *
 * Nothing here validates taste. It validates that the file is internally
 * consistent, that every claim carries its provenance, and that nothing
 * downstream will read a field that is not there.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { parseHex } from './color.mjs';

export const BRAND_FILE_VERSION = '1.0.0';

/**
 * Where a statement came from. This is the rule that stops a brand system
 * inventing its own history: nothing enters a deliverable without one of these.
 */
export const PROVENANCE = Object.freeze({
  supplied: { weight: 1.0, label: 'Supplied', note: 'The client said it.' },
  extracted: { weight: 0.9, label: 'Extracted', note: 'Measured from a real artefact of theirs.' },
  published: { weight: 0.8, label: 'Published', note: 'Taken from their own public channels.' },
  decided: { weight: 1.0, label: 'Decided', note: 'Chosen during this process, on a date, by someone.' },
  assumed: { weight: 0.4, label: 'Assumed', note: 'A working assumption. Must be visible as one.' },
  open: { weight: 0.0, label: 'Open', note: 'Unresolved. Listed, not guessed at.' },
});

/** The phases of the journey, in order. State is a cursor over this list. */
export const PHASES = Object.freeze([
  { id: 'recon', name: 'Recon', outcome: 'Everything already on disk or online has been found and read.' },
  { id: 'intake', name: 'Intake', outcome: 'The four questions are answered and the evidence is logged.' },
  { id: 'strategy', name: 'Strategy', outcome: 'Positioning, audience and distinctive assets are written down.' },
  { id: 'territories', name: 'Territories', outcome: 'Three or four real directions are on a canvas and one is chosen.' },
  { id: 'identity', name: 'Identity', outcome: 'Colour, type, shape, motion and logo rules are resolved and audited.' },
  { id: 'voice', name: 'Voice', outcome: 'Voice attributes, tone matrix and vocabulary are written from evidence.' },
  { id: 'proof', name: 'Proof', outcome: 'The system survives a real website, app screen, deck, social and print.' },
  { id: 'publish', name: 'Publish', outcome: 'Tokens, brand book and the enforcement skill are on disk.' },
]);

/**
 * Treat anything that is not a list as an empty one, for iteration only.
 * A wrong type is reported separately by the structural checks; the point here
 * is that a malformed file must not be able to throw out of the validator,
 * because then nothing else gets reported and the user sees a stack trace
 * instead of the list of things to fix.
 */
const asArray = (v) => (Array.isArray(v) ? v : []);

const isHex = (v) => {
  try { parseHex(v); return true; } catch { return false; }
};

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

/** A brand file with nothing decided yet, but every slot present. */
export function emptyBrand({ name = null, slug = null, now = new Date() } = {}) {
  return {
    $schema: './brand.schema.json',
    brandi: {
      version: BRAND_FILE_VERSION,
      created: now.toISOString(),
      updated: now.toISOString(),
      phase: 'recon',
      completed: [],
    },
    meta: {
      name,
      slug: slug ?? (name ? slugify(name) : null),
      legalName: null,
      tagline: null,
      version: '0.1.0',
      effectiveDate: null,
      owner: null,
      locale: 'en-AU',
      categories: [],
    },
    evidence: [],
    strategy: {
      purpose: null,
      problem: null,
      audiences: [],
      category: null,
      competitors: [],
      positioning: null,
      differentiators: [],
      promise: null,
      values: [],
      personality: { attributes: [], archetype: null },
      narrative: null,
      messaging: { primary: null, pillars: [] },
      distinctiveAssets: [],
    },
    identity: {
      school: null,
      schoolRationale: null,
      signature: null,
      colour: {
        primary: null,
        accents: [],
        harmony: 'analogous',
        accentCount: 1,
        neutralHue: null,
        neutralChroma: 0.006,
        ratio: null,
      },
      type: {
        display: null,
        body: null,
        mono: null,
        basePx: 16,
        baseMaxPx: null,
        ratio: 'major-third',
        ratioMax: null,
        measureChars: 66,
        licences: [],
      },
      shape: 'soft',
      motion: 'fluid',
      spaceBase: 4,
      logo: {
        files: [],
        variants: [],
        clearSpace: null,
        minSize: { printMm: null, screenPx: null },
        misuse: [],
        favicon: null,
      },
      imagery: { direction: null, treatment: null, dos: [], donts: [] },
      iconography: { style: null, grid: 24, strokePx: 2, source: null },
    },
    voice: {
      attributes: [],
      tone: [],
      vocabulary: { use: [], avoid: [], hardThings: [] },
      mechanics: {},
      examples: [],
    },
    applications: [],
    governance: {
      decisions: [],
      openQuestions: [],
      nonGoals: [],
      changeLog: [],
    },
  };
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'brand';
}

// ---------------------------------------------------------------------------
// Evidence and decisions
// ---------------------------------------------------------------------------

/**
 * Record a statement together with where it came from. Anything that ends up
 * in a deliverable should be traceable to one of these.
 */
export function addEvidence(brand, { claim, provenance, source = null, confidence = null, field = null, now = new Date() }) {
  if (!claim) throw new TypeError('evidence needs a claim');
  if (!PROVENANCE[provenance]) {
    throw new TypeError(`unknown provenance "${provenance}". Use one of: ${Object.keys(PROVENANCE).join(', ')}`);
  }
  const entry = {
    id: `e${brand.evidence.length + 1}`,
    claim,
    provenance,
    source,
    field,
    confidence: confidence ?? (PROVENANCE[provenance].weight >= 0.8 ? 'high' : PROVENANCE[provenance].weight >= 0.4 ? 'medium' : 'low'),
    recorded: now.toISOString(),
  };
  brand.evidence.push(entry);
  return entry;
}

/** Record a decision, so a year from now someone can tell what was deliberate. */
export function addDecision(brand, { decision, rationale, alternatives = [], owner = null, now = new Date() }) {
  if (!decision || !rationale) throw new TypeError('a decision needs both the decision and the reason for it');
  const entry = {
    id: `d${brand.governance.decisions.length + 1}`,
    date: now.toISOString().slice(0, 10),
    decision,
    rationale,
    alternatives,
    owner,
  };
  brand.governance.decisions.push(entry);
  return entry;
}

/** Record something nobody has answered yet, rather than inventing an answer. */
export function addOpenQuestion(brand, { question, whyItMatters, assumedMeanwhile = null, whoCanAnswer = null, changesIf = null }) {
  if (!question || !whyItMatters) throw new TypeError('an open question needs the question and why it matters');
  const entry = {
    id: `q${brand.governance.openQuestions.length + 1}`,
    question,
    whyItMatters,
    assumedMeanwhile,
    whoCanAnswer,
    changesIf,
    status: 'open',
  };
  brand.governance.openQuestions.push(entry);
  return entry;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const REQUIRED_BY_PHASE = {
  intake: [['meta.name', 'The brand has no name.']],
  strategy: [
    ['meta.name', 'The brand has no name.'],
    ['strategy.purpose', 'No purpose. Every other decision hangs off this one.'],
    ['strategy.audiences.0', 'No audience. A brand for everyone is a brand for nobody.'],
  ],
  territories: [['strategy.positioning', 'No positioning statement, so the directions have nothing to be judged against.']],
  identity: [
    ['identity.school', 'No visual direction chosen.'],
    ['identity.colour.primary', 'No primary colour.'],
  ],
  voice: [['strategy.personality.attributes.0', 'No personality attributes, so voice has nothing to derive from.']],
  proof: [
    ['identity.type.body', 'No body typeface.'],
    ['identity.type.display', 'No display typeface.'],
  ],
  publish: [
    ['strategy.messaging.primary', 'No primary message.'],
    ['voice.attributes.0', 'No voice attributes.'],
    ['identity.logo.clearSpace', 'No clear space rule, which is the first thing anyone breaks.'],
  ],
};

const get = (obj, dotted) =>
  dotted.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/**
 * Check a brand file. Returns errors (the file is broken or inconsistent) and
 * warnings (it will work, but something is missing or unsupported).
 *
 * @param {object} brand
 * @param {{phase?: string}} opts  check readiness for a phase, not just validity
 */
export function validateBrand(brand, { phase = null } = {}) {
  const errors = [];
  const warnings = [];
  const err = (field, message, fix = null) => errors.push({ field, message, fix });
  const warn = (field, message, fix = null) => warnings.push({ field, message, fix });

  if (!brand || typeof brand !== 'object') {
    return { ok: false, errors: [{ field: '', message: 'Not an object.', fix: null }], warnings: [] };
  }
  if (!brand.brandi?.version) err('brandi.version', 'No version stamp, so nothing can tell how to read this file.');
  if (brand.brandi?.phase && !PHASES.some((p) => p.id === brand.brandi.phase)) {
    err('brandi.phase', `Unknown phase "${brand.brandi.phase}".`, `Use one of: ${PHASES.map((p) => p.id).join(', ')}`);
  }

  // --- Structure ---------------------------------------------------------
  for (const key of ['meta', 'evidence', 'strategy', 'identity', 'voice', 'governance']) {
    if (brand[key] == null) err(key, `The ${key} section is missing entirely.`);
  }
  for (const [field, value] of [
    ['evidence', brand.evidence],
    ['applications', brand.applications],
    ['strategy.audiences', brand.strategy?.audiences],
    ['strategy.competitors', brand.strategy?.competitors],
    ['strategy.distinctiveAssets', brand.strategy?.distinctiveAssets],
    ['identity.colour.accents', brand.identity?.colour?.accents],
    ['identity.logo.misuse', brand.identity?.logo?.misuse],
    ['identity.logo.files', brand.identity?.logo?.files],
    ['voice.attributes', brand.voice?.attributes],
    ['governance.decisions', brand.governance?.decisions],
    ['governance.openQuestions', brand.governance?.openQuestions],
  ]) {
    if (value != null && !Array.isArray(value)) err(field, `${field} must be a list, got ${typeof value}.`);
  }

  // --- Colour ------------------------------------------------------------
  const c = brand.identity?.colour;
  if (c?.primary && !isHex(c.primary)) {
    err('identity.colour.primary', `"${c.primary}" is not a hex colour.`, 'Use #RRGGBB.');
  }
  for (const [i, a] of asArray(c?.accents).entries()) {
    if (!isHex(a)) err(`identity.colour.accents.${i}`, `"${a}" is not a hex colour.`);
  }
  if (asArray(c?.accents).length > 2) {
    warn('identity.colour.accents', `${c.accents.length} accents. Past two, an accent stops accenting anything.`);
  }
  if (c?.neutralChroma != null && (c.neutralChroma < 0 || c.neutralChroma > 0.05)) {
    err('identity.colour.neutralChroma', 'Neutral chroma must be between 0 and 0.05. Above that they stop being neutrals.');
  }

  // --- Type --------------------------------------------------------------
  const t = brand.identity?.type;
  if (t?.basePx != null && t.basePx < 12) {
    err('identity.type.basePx', `Body copy at ${t.basePx}px is below the legibility floor.`);
  } else if (t?.basePx != null && t.basePx < 16) {
    warn('identity.type.basePx', `Body copy at ${t.basePx}px is below the browser default of 16px.`);
  }
  if (t?.display && t.display === t.body) {
    warn('identity.type.display', 'The display and body faces are the same, so there is no pairing, only a font.');
  }
  for (const face of ['display', 'body', 'mono']) {
    if (t?.[face] && !asArray(t.licences).some((l) => l && l.family === t[face])) {
      warn(`identity.type.${face}`, `No licence recorded for ${t[face]}.`, 'Record where it comes from and what the licence permits, before it ships.');
    }
  }

  // --- Structural stances ------------------------------------------------
  if (brand.identity?.spaceBase != null && ![4, 8].includes(brand.identity.spaceBase)) {
    err('identity.spaceBase', 'The spacing base must be 4 or 8.');
  }

  // --- Provenance --------------------------------------------------------
  for (const [i, e] of asArray(brand.evidence).entries()) {
    if (!e || typeof e !== 'object') { err(`evidence.${i}`, 'Evidence entries must be objects.'); continue; }
    if (!PROVENANCE[e.provenance]) err(`evidence.${i}.provenance`, `Unknown provenance "${e.provenance}".`);
    if (!e.claim) err(`evidence.${i}.claim`, 'Evidence with no claim.');
    if (e.provenance === 'assumed' && !e.claim) warn(`evidence.${i}`, 'An assumption with nothing written down is just a guess.');
  }

  // --- Strategy substance ------------------------------------------------
  for (const [i, p] of asArray(brand.strategy?.messaging?.pillars).entries()) {
    if (!asArray(p?.proof).length) {
      warn(
        `strategy.messaging.pillars.${i}`,
        `The pillar "${p?.claim ?? p?.name ?? i}" has no proof points.`,
        'Either find evidence for it or move it to the open questions. An unsupported pillar is a slogan.',
      );
    }
  }
  for (const [i, d] of asArray(brand.strategy?.distinctiveAssets).entries()) {
    if (!d?.asset) err(`strategy.distinctiveAssets.${i}.asset`, 'A distinctive asset with no asset.');
  }

  // --- Logo --------------------------------------------------------------
  const logo = brand.identity?.logo;
  if (asArray(logo?.files).length) {
    if (!asArray(logo.files).some((f) => /\.svg$/i.test(f?.path ?? f))) {
      warn('identity.logo.files', 'No vector logo file.', 'An SVG or EPS master is what stops the logo degrading at every size.');
    }
    if (!logo.clearSpace) warn('identity.logo.clearSpace', 'No clear space rule.');
    if (!logo.minSize?.screenPx && !logo.minSize?.printMm) warn('identity.logo.minSize', 'No minimum size.');
    if (asArray(logo.misuse).length < 6) {
      warn('identity.logo.misuse', `Only ${asArray(logo.misuse).length} documented misuses.`, 'A misuse page needs at least six or people invent their own.');
    }
  }

  // --- Voice -------------------------------------------------------------
  for (const [i, a] of asArray(brand.voice?.attributes).entries()) {
    if (!a?.notThis) {
      warn(`voice.attributes.${i}`, `"${a?.name ?? i}" has no opposite.`, 'An attribute nobody would claim the opposite of says nothing. "Friendly, not chummy" does.');
    }
  }

  // --- Phase readiness ---------------------------------------------------
  if (phase) {
    for (const [field, message] of REQUIRED_BY_PHASE[phase] ?? []) {
      const v = get(brand, field);
      if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
        err(field, message, `Fill ${field} before running the ${phase} phase.`);
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings, phase };
}

// ---------------------------------------------------------------------------
// Phases
// ---------------------------------------------------------------------------

/** The phase after this one, or null at the end. */
export function nextPhase(id) {
  const i = PHASES.findIndex((p) => p.id === id);
  return i >= 0 && i < PHASES.length - 1 ? PHASES[i + 1].id : null;
}

/** Mark a phase done and advance. Refuses to advance past a broken file. */
export function completePhase(brand, id, { now = new Date() } = {}) {
  if (!PHASES.some((p) => p.id === id)) {
    throw new TypeError(`Unknown phase "${id}". The phases are: ${PHASES.map((p) => p.id).join(', ')}.`);
  }
  const check = validateBrand(brand, { phase: id });
  if (!check.ok) {
    const e = new Error(`Cannot complete "${id}": ${check.errors.map((x) => x.message).join(' ')}`);
    e.findings = check;
    throw e;
  }
  if (!brand.brandi.completed.includes(id)) brand.brandi.completed.push(id);
  brand.brandi.phase = nextPhase(id) ?? id;
  brand.brandi.updated = now.toISOString();
  return brand.brandi.phase;
}

/** A plain-language progress report. */
export function status(brand) {
  const done = new Set(brand.brandi?.completed ?? []);
  return {
    name: brand.meta?.name ?? '(unnamed)',
    version: brand.meta?.version,
    phase: brand.brandi?.phase,
    updated: brand.brandi?.updated,
    phases: PHASES.map((p) => ({
      ...p,
      done: done.has(p.id),
      current: brand.brandi?.phase === p.id,
    })),
    counts: {
      evidence: brand.evidence?.length ?? 0,
      decisions: brand.governance?.decisions?.length ?? 0,
      openQuestions: (brand.governance?.openQuestions ?? []).filter((q) => q.status === 'open').length,
      applications: brand.applications?.length ?? 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Disk
// ---------------------------------------------------------------------------

/**
 * The block that holds the file's own version and phase used to be called
 * `atelier`, and the tool was renamed to Brandi. A brand file written before
 * that rename is not a broken file, it is an older file, and refusing to open
 * it would throw away the one artefact the whole system exists to accumulate.
 * It is migrated on read and rewritten on the next save.
 */
export function migrateBrand(parsed) {
  if (parsed && typeof parsed === 'object' && parsed.atelier && !parsed.brandi) {
    const { atelier, ...rest } = parsed;
    return { brandi: atelier, ...rest };
  }
  return parsed;
}

export async function loadBrand(file) {
  const raw = await readFile(file, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`${file} is not valid JSON: ${e.message}`);
  }
  return migrateBrand(parsed);
}

export async function saveBrand(file, brand, { now = new Date() } = {}) {
  brand.brandi ??= {};
  brand.brandi.updated = now.toISOString();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(brand, null, 2) + '\n');
  return file;
}

/** The inputs buildSystem needs, pulled out of a brand file. */
export function systemInputFromBrand(brand) {
  const c = brand.identity?.colour ?? {};
  const t = brand.identity?.type ?? {};
  return {
    primary: c.primary,
    accents: c.accents?.length ? c.accents : undefined,
    harmony: c.harmony ?? 'analogous',
    // An empty accents array means "derive them", not "have none". Wanting no
    // accent at all is a deliberate choice, so it has to be said out loud.
    accentCount: c.accents?.length ? c.accents.length : (c.accentCount ?? 1),
    neutralHue: c.neutralHue ?? undefined,
    neutralChroma: c.neutralChroma ?? 0.006,
    // Recorded print and chart colour beats computed print and chart colour.
    // A Pantone is a decision somebody made holding a guide, and nothing here
    // can derive one, so a recorded value always wins.
    print: c.print ?? null,
    dataViz: c.dataViz ?? null,
    shape: brand.identity?.shape ?? 'soft',
    motion: brand.identity?.motion ?? 'fluid',
    spaceBase: brand.identity?.spaceBase ?? 4,
    measureChars: t.measureChars ?? 66,
    type: {
      display: t.display ?? null,
      body: t.body ?? null,
      mono: t.mono ?? null,
      basePx: t.basePx ?? 16,
      baseMaxPx: t.baseMaxPx ?? null,
      ratio: t.ratio ?? 'major-third',
      ratioMax: t.ratioMax ?? null,
    },
  };
}

export default {
  emptyBrand, slugify, addEvidence, addDecision, addOpenQuestion,
  validateBrand, completePhase, nextPhase, status,
  loadBrand, saveBrand, systemInputFromBrand,
  PHASES, PROVENANCE, BRAND_FILE_VERSION,
};
