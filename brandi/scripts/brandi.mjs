#!/usr/bin/env node
/**
 * The Brandi command line. Everything the brand-system skill does that can be
 * deterministic happens here, so the skill spends its turns on judgement rather
 * than on arithmetic it would get subtly wrong.
 *
 *   brandi init [--name "Acme"] [--dir brand]
 *   brandi status
 *   brandi scan [--root .]            find logos, tokens, sites, copy already on disk
 *   brandi set <path> <value>         edit one field of the brand file
 *   brandi evidence --claim ... --provenance supplied|extracted|published|decided|assumed|open
 *   brandi decision --decision ... --rationale ...
 *   brandi question --question ... --why ...
 *   brandi system                     resolve and audit the design system
 *   brandi tokens [--out brand/tokens] [--prefix acme] [--strict-dimensions]
 *   brandi sheets [--out <dir>]       write the specification artboards
 *   brandi canvas --dir <dir> --title "Acme brand" --out acme-brand.html
 *   brandi validate --dir <dir>       check artboards before they are published
 *   brandi book [--pdf] [--print]     the brand book: a 16:9 deck, or the A4 print book with --print
 *   brandi logo <plan|refine|wordmark|lockup|import|audit|board|pick|master|colour|status>
 *   brandi images <dir> [--check]      measure supplied photography before planning
 *   brandi mockup grid <photo>         read a surface's corners off a real photograph
 *   brandi mockup build                composite the brand onto the recorded surfaces
 *   brandi assets [--out <dir>]        derive the asset pack from the master SVG
 *   brandi handoff [--out <dir>]       assemble the package a client is given
 *   brandi guardian [--out <dir>]     emit the enforcement skill
 *   brandi fonts                      check the typefaces actually load from Google Fonts
 *   brandi check <paths...> [--limit N]  hold work against the brand
 *   brandi complete <phase>           mark a phase done and advance
 *
 * Every command prints a short human summary, and `--json` prints the machine
 * form instead, so the skill can read a result without parsing prose.
 */

import { readFile, writeFile, mkdir, mkdtemp, readdir, rm, stat, copyFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  emptyBrand, loadBrand, saveBrand, validateBrand, checkFieldPath, completePhase, status as brandStatus, migrateBrand,
  systemInputFromBrand, addDecision, addEvidence, addOpenQuestion, slugify, PHASES, PROVENANCE,
} from './brandfile.mjs';
import { buildSystem, assertPublishable } from './system.mjs';
import { toDtcg, toCss, toTailwind, toTypeScript } from './tokens.mjs';
import { specificationSheets, CONTENTS_MARKER } from './artboards.mjs';
import { artboard as artboardOf } from './canvas.mjs';
import { canvasManifest, validateCanvas, validateArtboard, findOverlaps, FRAMES } from './canvas.mjs';
import { extractColors } from './color.mjs';
import { locateDesignHelper, NOT_FOUND_MESSAGE } from './design-locate.mjs';
import { renderBrandBook, renderBrandDeck, pdfChromeArgs } from './brandbook.mjs';
import { toPreviewHtml, screenshot, findChrome, runChrome } from './preview.mjs';
import { emitGuardianSkill, checkFiles, checkPromises, linkForCodex, GENERATED_MARKER } from './guardian.mjs';
import { buildAssetPack } from './assets.mjs';
import { regionsOf, resolveColourway, renderColourway } from './logocolour.mjs';
import { buildHandoff } from './handoff.mjs';
import { catalogueImages, summarise } from './images.mjs';
import { gridPage, mockupBody, validateCorners } from './mockup.mjs';
import { imageSize } from './imagesize.mjs';

const run = promisify(execFile);
// fileURLToPath, not url.pathname: pathname percent-encodes spaces, so a
// checkout under "My Projects" silently resolves to a path that does not exist.
const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Argument handling
// ---------------------------------------------------------------------------

/**
 * Flags that never take a value. Without this list, `check --json path/x.css`
 * reads the path as the value of --json, drops it, and silently checks the
 * whole project instead: the wrong answer, delivered confidently.
 */
const BOOLEAN_FLAGS = new Set(['json', 'force', 'pdf', 'help', 'strict-dimensions', 'check']);

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  // Where each positional sat in the raw argv. A subcommand that parses its own
  // arguments needs the untouched tail, and reconstructing it from `positional`
  // is impossible because every flag has already been taken out.
  const positionalAt = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, inline] = a.slice(2).split('=');
      if (inline !== undefined) flags[k] = inline;
      else if (BOOLEAN_FLAGS.has(k)) flags[k] = true;
      else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) flags[k] = argv[++i];
      else flags[k] = true;
    } else {
      positional.push(a);
      positionalAt.push(i);
    }
  }
  return { flags, positional, positionalAt };
}

const out = { json: false };
function emit(human, machine) {
  if (out.json) console.log(JSON.stringify(machine ?? {}, null, 2));
  else console.log(human);
}
function fail(message, machine) {
  if (out.json) console.log(JSON.stringify({ ok: false, error: message, ...machine }, null, 2));
  else console.error(message);
  process.exitCode = 1;
}

/**
 * A numeric flag that is silently wrong is worse than one that is loudly
 * missing: `--limit abc` used to become NaN, and `slice(0, NaN)` prints an
 * empty report that looks like a clean bill of health.
 */
function intFlag(flags, name, fallback, { min = 1, max = 100000 } = {}) {
  if (flags[name] === undefined) return fallback;
  // A bare `--limit` parses as `true`, and `Number(true)` is 1: a silent report
  // of one finding is not what anyone typing that meant.
  const raw = flags[name] === true ? '' : String(flags[name]);
  const n = Number(raw);
  if (raw === '' || !Number.isInteger(n) || n < min || n > max) {
    throw new Error(`--${name} takes a whole number between ${min} and ${max}, not "${raw}".`);
  }
  return n;
}

/** "1 file", "2 files". A tool about craft should not print "1 files". */
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const brandPath = (flags) => path.resolve(flags.dir ?? 'brand', 'brand.json');

async function needBrand(flags) {
  const file = brandPath(flags);
  if (!existsSync(file)) {
    throw new Error(`No brand file at ${file}. Run: brandi init --name "Your brand"`);
  }
  return { file, brand: await loadBrand(file) };
}

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------

async function cmdInit(flags) {
  const file = brandPath(flags);
  if (existsSync(file) && !flags.force) {
    return fail(`${file} already exists. Pass --force to start over, which discards every decision in it.`);
  }
  const name = typeof flags.name === 'string' ? flags.name : null;
  const brand = emptyBrand({ name });
  await saveBrand(file, brand);
  await mkdir(path.join(path.dirname(file), 'assets', 'logos'), { recursive: true });
  await mkdir(path.join(path.dirname(file), 'canvas'), { recursive: true });
  // brand.json points its $schema at a sibling, so ship the sibling. A dangling
  // $schema is worse than none: the editor says nothing and nobody notices.
  const schemaSource = path.join(HERE, '..', 'schemas', 'brand.schema.json');
  if (existsSync(schemaSource)) {
    await copyFile(schemaSource, path.join(path.dirname(file), 'brand.schema.json'));
  }
  emit(
    `Created ${path.relative(process.cwd(), file)}${name ? ` for ${name}` : ''}.\n` +
      `Phase: recon. Next: brandi scan`,
    { ok: true, file, phase: brand.brandi.phase },
  );
}

// ---------------------------------------------------------------------------
// status
// ---------------------------------------------------------------------------

async function cmdStatus(flags) {
  const { brand } = await needBrand(flags);
  const s = brandStatus(brand);
  // A file with no brandi block has no phase, and the first phase is where it
  // is. Printing "vundefined" and "the undefined phase" told the reader nothing
  // about the one thing wrong with the file.
  const phase = s.phase ?? PHASES[0].id;
  const check = validateBrand(brand, { phase });
  const lines = [`${s.name}  ${s.version ? `v${s.version}` : '(no version)'}`, ''];
  for (const p of s.phases) {
    const mark = p.done ? '[x]' : (p.current || (!s.phase && p.id === phase)) ? '[>]' : '[ ]';
    lines.push(`${mark} ${p.name.padEnd(12)} ${p.outcome}`);
  }
  lines.push('');
  lines.push(`evidence ${s.counts.evidence} | decisions ${s.counts.decisions} | open questions ${s.counts.openQuestions}`);
  if (check.errors.length) {
    lines.push('', `Blocking the ${phase} phase:`);
    for (const e of check.errors) lines.push(`  ${e.field}: ${e.message}`);
  }
  if (!brand.brandi?.version) {
    lines.push('', 'This is not a complete brand file. Run `brandi init --force` to start it properly (which discards what is here), or add the missing sections by hand.');
  }
  if (check.warnings.length) {
    lines.push('', 'Worth fixing:');
    for (const w of check.warnings.slice(0, 8)) lines.push(`  ${w.field}: ${w.message}`);
  }
  // The JSON mirrors the text: a file with no phase is at the first one.
  emit(lines.join('\n'), {
    ok: true,
    ...s,
    phase,
    phases: s.phases.map((p) => ({ ...p, current: p.current || (!s.phase && p.id === phase) })),
    check,
  });
}

// ---------------------------------------------------------------------------
// scan
// ---------------------------------------------------------------------------

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'vendor', 'coverage', '.venv', '__pycache__', 'brand']);

async function walk(root, { maxDepth = 4, depth = 0 } = {}) {
  const results = [];
  let entries = [];
  try { entries = await readdir(root, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.well-known') continue;
    const full = path.join(root, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || depth >= maxDepth) continue;
      results.push(...await walk(full, { maxDepth, depth: depth + 1 }));
    } else {
      results.push(full);
    }
  }
  return results;
}

/**
 * Find what already exists before asking anyone anything. The single biggest
 * cause of a bad brand process is asking a client for material they have
 * already given you.
 */
async function cmdScan(flags) {
  const root = path.resolve(flags.root ?? '.');
  const files = await walk(root, { maxDepth: intFlag(flags, 'depth', 4, { min: 1, max: 32 }) });
  const rel = (f) => path.relative(root, f);

  const logos = files.filter((f) => /logo|wordmark|brandmark|lockup|favicon/i.test(path.basename(f)) && /\.(svg|png|jpe?g|webp|ai|eps|pdf)$/i.test(f));
  const vectors = logos.filter((f) => /\.svg$/i.test(f));
  const tokenFiles = files.filter((f) => /(tokens?|theme|variables|design-system|palette)\.(css|json|scss|ts|js|mjs)$/i.test(path.basename(f)));
  const tailwind = files.filter((f) => /^tailwind\.config\.(js|ts|mjs|cjs)$/i.test(path.basename(f)));
  // Colour lives wherever the project puts it, which in most real codebases is
  // not a stylesheet: inline styles in markup, className strings in components,
  // theme objects in TypeScript. Reading only .css found nothing at all in a
  // real repository whose twenty-one HTML files were full of hex.
  // Markup and components, not arbitrary source. A theme.ts is already caught by
  // the token-file pattern; a random module is noise, and scanning it turns
  // string constants and regex literals into "brand colours".
  const STYLE_BEARING = /\.(css|scss|sass|less|html?|jsx|tsx|vue|svelte|astro)$/i;
  const styles = files
    .filter((f) => STYLE_BEARING.test(f) && !tokenFiles.includes(f) && !/\.(test|spec)\./i.test(f))
    // Shallower files are more likely to be the real design surface than
    // something buried eight directories down.
    .sort((a, b) => a.split(path.sep).length - b.split(path.sep).length)
    .slice(0, 120);
  const fonts = files.filter((f) => /\.(woff2?|otf|ttf)$/i.test(f));
  const screenshots = files.filter((f) => /screenshot|screen|mockup|ui-/i.test(path.basename(f)) && /\.(png|jpe?g|webp)$/i.test(f));
  const copy = files.filter((f) => /\.(md|mdx|txt)$/i.test(f) && !/node_modules/.test(f)).slice(0, 60);
  const pkg = files.find((f) => path.basename(f) === 'package.json' && path.dirname(f) === root);

  let projectName = null;
  let homepage = null;
  if (pkg) {
    try {
      const parsed = JSON.parse(await readFile(pkg, 'utf8'));
      projectName = parsed.name ?? null;
      homepage = parsed.homepage ?? null;
    } catch { /* a broken package.json is not our problem here */ }
  }

  // Colours already in use. Existing usage beats a fresh invention: if a brand
  // has been using a colour for years, that recognition is an asset.
  //
  // A vector logo is the STRONGEST evidence there is, and reading only
  // stylesheets missed it entirely: someone who hands over a logo and a sentence
  // was being told nothing was found, when the thing they handed over contains
  // the palette. Logo colours are weighted far above incidental ones so the
  // ranking reflects what a colour actually means, not how often it was typed.
  const SOURCE_WEIGHT = { logo: 1000, token: 20, style: 1 };
  const hexScore = new Map();
  const hexWhere = new Map();
  const note = (hex, kind, file) => {
    hexScore.set(hex, (hexScore.get(hex) ?? 0) + SOURCE_WEIGHT[kind]);
    const seen = hexWhere.get(hex) ?? { kinds: new Set(), files: new Set() };
    seen.kinds.add(kind);
    if (seen.files.size < 3) seen.files.add(rel(file));
    hexWhere.set(hex, seen);
  };

  const fontFamilies = new Map();
  const noteFont = (name, kind) => {
    if (!name) return;
    // An unresolved interpolation is not a typeface. `font-family: ${body}` in a
    // template literal was being reported as a font called "${body".
    if (/[${}`<>()]/.test(name)) return;
    if (!/^[A-Za-z][A-Za-z0-9 .'-]*$/.test(name)) return;
    if (/^(var|inherit|initial|unset|system-ui|-apple-system|sans-serif|serif|monospace|cursive|fantasy|ui-)/i.test(name)) return;
    const prior = fontFamilies.get(name);
    if (!prior || SOURCE_WEIGHT[kind] > SOURCE_WEIGHT[prior]) fontFamilies.set(name, kind);
  };

  const readColours = async (file, kind) => {
    try {
      const text = await readFile(file, 'utf8');
      for (const c of extractColors(text)) note(c.hex.toUpperCase(), kind, file);
      // SVG carries type as an attribute, CSS as a declaration. Both matter.
      for (const m of text.matchAll(/font-family\s*[:=]\s*["']?([^;}"'\n>]+)/gi)) {
        noteFont(m[1].split(',')[0].replace(/['"]/g, '').trim(), kind);
      }
    } catch { /* unreadable file, skip */ }
  };

  for (const f of vectors.slice(0, 20)) await readColours(f, 'logo');
  for (const f of tokenFiles.slice(0, 40)) await readColours(f, 'token');
  for (const f of styles) await readColours(f, 'style');

  const NEUTRALISH = /^#(0{6}|F{6}|([0-9A-F])\2{5})$/;
  const colours = [...hexScore.entries()]
    .filter(([hex]) => !NEUTRALISH.test(hex))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([hex, score]) => {
      const where = hexWhere.get(hex);
      const kinds = [...where.kinds];
      return {
        hex,
        // `count` is kept for anything already reading it, but `from` is what
        // matters: a colour in the logo is a decision, one in a stylesheet may
        // be an accident.
        count: score,
        from: kinds.includes('logo') ? 'logo' : kinds.includes('token') ? 'tokens' : 'stylesheets',
        files: [...where.files],
      };
    });

  const found = {
    root,
    projectName,
    homepage,
    logos: logos.map(rel),
    vectorLogos: vectors.map(rel),
    tokenFiles: tokenFiles.map(rel),
    tailwindConfig: tailwind.map(rel),
    fonts: fonts.map(rel),
    screenshots: screenshots.map(rel),
    documents: copy.map(rel),
    coloursInUse: colours,
    fontFamiliesInUse: [...fontFamilies.keys()],
    typefacesFromLogo: [...fontFamilies.entries()].filter(([, k]) => k === 'logo').map(([n]) => n),
  };

  const summary = [
    `Scanned ${plural(files.length, 'file')} under ${rel(root) || '.'}`,
    '',
    `logos            ${logos.length}${vectors.length ? ` (${vectors.length} vector)` : ' (none vector)'}`,
    `token files      ${tokenFiles.length}${tailwind.length ? ` + tailwind config` : ''}`,
    `web fonts        ${fonts.length}`,
    `screenshots      ${screenshots.length}`,
    `documents        ${copy.length}`,
    `colours in use   ${colours.length ? colours.slice(0, 6).map((c) => `${c.hex} (${c.from})`).join('  ') : 'none found'}`,
    `typefaces in use ${[...fontFamilies.keys()].slice(0, 6).join(', ') || 'none found'}`,
  ];
  const fromLogo = colours.filter((c) => c.from === 'logo');
  if (fromLogo.length) {
    summary.push('');
    summary.push(
      `${fromLogo.length} colour${fromLogo.length === 1 ? '' : 's'} came out of the logo itself: ` +
        `${fromLogo.map((c) => c.hex).join(', ')}. That is the strongest evidence there is, so treat ` +
        `these as supplied rather than as candidates, and say so before proposing anything else.`,
    );
  }
  if (!logos.length && !tokenFiles.length && !colours.length) {
    summary.push('', 'Nothing to build on here. This is a from-nothing brand, which is fine: it just means every decision is a decision rather than an inheritance.');
  }
  emit(summary.join('\n'), { ok: true, ...found });
}

// ---------------------------------------------------------------------------
// set
// ---------------------------------------------------------------------------

/**
 * Fields that are genuinely numeric. Everything else stays a string.
 *
 * Guessing by shape turned a tagline of "2024" into the number 2024 and a brand
 * named "007" into 7. A brand file is mostly prose, so the safe default is
 * prose, and a caller who really wants a number can pass JSON.
 */
const NUMERIC_FIELDS = new Set([
  'identity.spaceBase',
  'identity.colour.neutralChroma',
  'identity.colour.accentCount',
  'identity.type.basePx',
  'identity.type.baseMaxPx',
  'identity.type.measureChars',
  'identity.iconography.grid',
  'identity.iconography.strokePx',
  'identity.logo.minSize.printMm',
  'identity.logo.minSize.screenPx',
]);

function coerce(value, field) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^[[{]/.test(value)) {
    try { return JSON.parse(value); } catch { /* treat as a string */ }
  }
  if (NUMERIC_FIELDS.has(field) && /^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

const getPath = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

async function cmdSet(flags, positional) {
  const [dotted, ...rest] = positional;
  if (!dotted || !rest.length) return fail('usage: brandi set <path> <value>');
  if (!/^[A-Za-z_$][\w$]*(\.[\w$-]+)*$/.test(dotted)) {
    return fail(`"${dotted}" is not a field path. Use dotted segments, e.g. identity.colour.primary`);
  }
  const { file, brand } = await needBrand(flags);
  // Against the plugin's own schema, not the copy `init` left beside the brand
  // file: that one is whatever version was current when the brand was started.
  const schema = JSON.parse(await readFile(path.join(HERE, '..', 'schemas', 'brand.schema.json'), 'utf8'));
  const raw = rest.join(' ');
  let shape = checkFieldPath(schema, dotted, coerce(raw, dotted));
  // true, false and null are read as JSON, but a text field refuses them as
  // the wrong shape, which would leave no way to write the word itself. When
  // the field takes text, the word is the text.
  if (!shape.ok && /^(true|false|null)$/.test(raw)) {
    const asText = checkFieldPath(schema, dotted, raw);
    if (asText.ok) shape = asText;
  }
  if (!shape.ok) return fail(shape.error, { field: dotted, suggestion: shape.suggestion ?? null });
  // The value as the schema shaped it: "22" offered to a number field is 22.
  const value = shape.value;
  const keys = dotted.split('.');

  // Walk by INDEX, not by indexOf: a repeated segment (voice.examples.0.examples)
  // made indexOf find the first occurrence and pick the wrong container type,
  // which silently discarded the write.
  // An index past the end of a list would pad it with nulls, and a list with
  // holes in it is a file every later command has to guess about. The index
  // equal to the length appends; anything beyond is refused.
  const tooFar = (list, k) => Array.isArray(list) && /^\d+$/.test(k) && Number(k) > list.length;
  let node = brand;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextIsIndex = /^\d+$/.test(keys[i + 1]);
    if (node[k] == null || typeof node[k] !== 'object') node[k] = nextIsIndex ? [] : {};
    if (tooFar(node[k], keys[i + 1])) {
      return fail(`${keys.slice(0, i + 1).join('.')} has ${node[k].length} entries, so index ${keys[i + 1]} would leave a gap. Use ${node[k].length} to append.`, { field: dotted });
    }
    node = node[k];
  }
  node[keys.at(-1)] = value;
  if (dotted === 'meta.name' && !brand.meta.slug) brand.meta.slug = slugify(String(value));
  // A banned face recorded in identity.type is caught where the decision is
  // made, not three commands later. The same one-line warning the forge gives.
  const warnings = [];
  if (/^identity\.type\.(display|body|mono)$/.test(dotted) && typeof value === 'string') {
    const { bannedFaceWarning } = await import('./logo.mjs');
    const w = bannedFaceWarning(value);
    if (w) { warnings.push(w); console.error(w); }
  }
  await saveBrand(file, brand);

  // Read it back off disk. A source of truth that confirms a write it discarded
  // is worse than one that refuses the write.
  const saved = await loadBrand(file);
  const written = getPath(saved, dotted);
  if (JSON.stringify(written) !== JSON.stringify(value)) {
    return fail(
      `${dotted} did not survive being written: expected ${JSON.stringify(value)}, ` +
        `the file now holds ${JSON.stringify(written)}. Nothing was reported as set.`,
    );
  }
  emit(`${dotted} = ${JSON.stringify(value)}`, { ok: true, field: dotted, value, warnings });
}

// ---------------------------------------------------------------------------
// evidence, decisions, open questions
// ---------------------------------------------------------------------------

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const listOf = (v) => (typeof v === 'string' ? v.split('|').map((x) => x.trim()).filter(Boolean) : []);

/**
 * Record where a statement came from. This is the command that makes the
 * provenance model usable rather than aspirational: without it the skill has
 * nowhere to put what it learns, and the brand book has nothing to cite.
 */
async function cmdEvidence(flags, positional) {
  const { file, brand } = await needBrand(flags);
  const claim = str(flags.claim) ?? str(positional.join(' '));
  const provenance = str(flags.provenance) ?? str(flags.from);
  if (!claim || !provenance) {
    return fail(
      'usage: brandi evidence --claim "..." --provenance <tier> [--source "..."] [--field strategy.purpose]\n' +
        `tiers: ${Object.entries(PROVENANCE).map(([k, v]) => `${k} (${v.note})`).join('\n       ')}`,
    );
  }
  let entry;
  try {
    entry = addEvidence(brand, {
      claim,
      provenance,
      source: str(flags.source),
      field: str(flags.field),
      confidence: str(flags.confidence),
    });
  } catch (e) {
    return fail(e.message);
  }
  await saveBrand(file, brand);
  emit(`${entry.id}  ${PROVENANCE[entry.provenance].label} (${entry.confidence})  ${entry.claim}`, { ok: true, entry });
}

async function cmdDecision(flags, positional) {
  const { file, brand } = await needBrand(flags);
  const decision = str(flags.decision) ?? str(positional.join(' '));
  const rationale = str(flags.rationale) ?? str(flags.because);
  if (!decision || !rationale) {
    return fail('usage: brandi decision --decision "..." --rationale "..." [--alternatives "a|b"] [--owner "..."]\nA decision without its reason is not a decision: a year from now nobody can tell what was deliberate.');
  }
  const entry = addDecision(brand, {
    decision,
    rationale,
    alternatives: listOf(flags.alternatives),
    owner: str(flags.owner),
  });
  await saveBrand(file, brand);
  emit(`${entry.id}  ${entry.date}  ${entry.decision}`, { ok: true, entry });
}

async function cmdQuestion(flags, positional) {
  const { file, brand } = await needBrand(flags);
  const question = str(flags.question) ?? str(positional.join(' '));
  const whyItMatters = str(flags.why) ?? str(flags.matters);
  if (!question || !whyItMatters) {
    return fail('usage: brandi question --question "..." --why "..." [--assumed "..."] [--who "..."] [--changes "..."]\nAn open question is how you avoid inventing an answer. Say what you assumed meanwhile.');
  }
  const entry = addOpenQuestion(brand, {
    question,
    whyItMatters,
    assumedMeanwhile: str(flags.assumed),
    whoCanAnswer: str(flags.who),
    changesIf: str(flags.changes),
  });
  await saveBrand(file, brand);
  emit(`${entry.id}  open  ${entry.question}${entry.assumedMeanwhile ? `\n     assuming meanwhile: ${entry.assumedMeanwhile}` : ''}`, { ok: true, entry });
}

// ---------------------------------------------------------------------------
// system
// ---------------------------------------------------------------------------

/**
 * Resolve the system for a command that is about to produce a deliverable.
 *
 * A failing audit stops here rather than being reported and then ignored. The
 * whole premise is that nothing untrue reaches a deliverable, and an audit that
 * gates nothing downstream is prose, not a gate. `--force` still exists, because
 * sometimes you need the artefact anyway, but it has to be asked for and it is
 * recorded in what the command prints.
 */
async function resolveSystem(flags, { gate = true } = {}) {
  const { file, brand } = await needBrand(flags);
  const check = validateBrand(brand, { phase: 'identity' });
  if (!check.ok) {
    const e = new Error(`The brand file is not ready to build a system:\n${check.errors.map((x) => `  ${x.field}: ${x.message}`).join('\n')}`);
    e.findings = check;
    throw e;
  }
  const system = buildSystem(systemInputFromBrand(brand));
  if (gate) {
    const gateResult = assertPublishable(system, { force: Boolean(flags.force) });
    if (!gateResult.ok) {
      const e = new Error(gateResult.message);
      e.findings = system.audit;
      throw e;
    }
    if (gateResult.forced) console.error(gateResult.message);
    return { file, brand, system, forced: gateResult.forced };
  }
  return { file, brand, system, forced: false };
}

async function cmdSystem(flags) {
  const { file, brand, system } = await resolveSystem(flags, { gate: false });
  const dir = path.dirname(file);
  await writeFile(path.join(dir, 'system.json'), JSON.stringify(system, null, 2) + '\n');

  const lines = [
    `${brand.meta.name ?? 'Brand'} design system resolved.`,
    '',
    `primary       ${system.palettes.brand.seed}`,
    `accents       ${Object.keys(system.palettes).filter((k) => k.startsWith('accent')).map((k) => system.palettes[k].seed).join(' ') || 'none'}`,
    `neutrals      ${system.palettes.neutral.seed} (tinted with the brand hue)`,
    `type          ${system.type.fonts.display ?? '?'} / ${system.type.fonts.body ?? '?'}${system.type.fonts.mono ? ` / ${system.type.fonts.mono}` : ''}`,
    `scale         ${system.type.scale.ratioName ?? system.type.scale.ratio} from ${system.type.scale.basePx}px, ${system.type.scale.steps.length} steps`,
    `shape         ${system.meta.shape} (${system.radius.find((r) => r.name === 'md').px}px base)`,
    `motion        ${system.meta.motion}`,
    `space         ${system.meta.spaceBase}px base, ${system.space.length} steps`,
    '',
    system.audit.ok ? 'Audit passed.' : `Audit FAILED with ${plural(system.audit.errors, 'error')}.`,
  ];
  for (const f of system.audit.findings) {
    lines.push(`  ${f.level.padEnd(5)} ${f.area.padEnd(20)} ${f.message}`);
    if (f.fix) lines.push(`        ${' '.repeat(20)} ${f.fix}`);
  }
  emit(lines.join('\n'), { ok: system.audit.ok, audit: system.audit, systemFile: path.join(dir, 'system.json') });
  if (!system.audit.ok) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// tokens
// ---------------------------------------------------------------------------

async function cmdTokens(flags) {
  const { file, brand, system } = await resolveSystem(flags);
  const dir = path.resolve(flags.out ?? path.join(path.dirname(file), 'tokens'));
  await mkdir(dir, { recursive: true });
  const written = [];
  const write = async (name, content) => {
    await writeFile(path.join(dir, name), content);
    written.push(path.relative(process.cwd(), path.join(dir, name)));
  };
  // The DTCG dimension type permits px and rem only, so em letter spacing is a
  // documented divergence. --strict-dimensions converts it, at the cost of
  // being exact only at each step's minimum size.
  const letterSpacingUnit = flags['strict-dimensions'] ? 'rem' : 'em';
  await write('tokens.json', JSON.stringify(toDtcg(system, { letterSpacingUnit }), null, 2) + '\n');
  await write('tokens.style-dictionary.json', JSON.stringify(toDtcg(system, { dimensionStyle: 'string', letterSpacingUnit }), null, 2) + '\n');
  await write('tokens.css', toCss(system, { prefix: typeof flags.prefix === 'string' ? flags.prefix : '' }));
  await write('tailwind.css', toTailwind(system));
  await write('tokens.ts', toTypeScript(system));
  emit(`Wrote ${written.length} token files:\n${written.map((w) => `  ${w}`).join('\n')}`, { ok: true, files: written });
}

// ---------------------------------------------------------------------------
// sheets
// ---------------------------------------------------------------------------

async function cmdSheets(flags) {
  const { file, brand, system } = await resolveSystem(flags);
  const dir = path.resolve(flags.out ?? path.join(path.dirname(file), 'canvas'));
  await mkdir(dir, { recursive: true });
  const all = specificationSheets(system, {
    brandName: brand.meta.name ?? 'Brand',
    version: brand.meta.version ?? null,
    // So the component sheet can label a button the way the brand says to,
    // rather than "Get started" like every other generated sheet.
    voice: brand.voice ?? null,
    // And so the production and verbal sheets have something to say. Passing
    // the whole brand rather than another six named fields: these sheets are
    // renderings OF the brand file, not of a subset somebody remembered.
    brand,
  });

  // Main is the entry artboard, and on a canvas that carries real design work it
  // belongs to the designer, not to the generator. So: regenerate the contents
  // page when the file on disk is a previous copy of it, keep an authored one,
  // and let `--force` overwrite either. Testing only for the file's existence
  // would freeze the generated contents at whatever the system said the first
  // time, which is the drift this whole tool exists to prevent.
  const mainPath = path.join(dir, 'Main.dc.html');
  const keptMain = !flags.force && existsSync(mainPath)
    && !(await readFile(mainPath, 'utf8')).includes(CONTENTS_MARKER);
  const contentsSize = all.find((s) => s.file === 'Main.dc.html');
  const sheets = all.filter((s) => !(s.file === 'Main.dc.html' && keptMain));
  for (const s of sheets) await writeFile(path.join(dir, s.file), s.source);

  const existing = (await readdir(dir)).filter((f) => f.endsWith('.dc.html'));
  const known = new Map(sheets.map((s) => [s.file, s]));

  // Keep whatever the previous manifest knew. Regenerating it from scratch
  // discarded every hand-placed position and, worse, gave every artboard Claude
  // authored a 1440x900 desktop frame: a 1600px-tall home page silently lost
  // its bottom 700px, which is the one canvas failure that cannot be recovered
  // without a re-seed.
  const manifestPath = path.join(dir, 'canvas.json');
  let previous = null;
  if (existsSync(manifestPath)) {
    try { previous = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { previous = null; }
  }
  const prior = new Map((previous?.artboards ?? []).map((a) => [a.file, a]));

  // Positions are only kept when the whole previous manifest was positioned and
  // the file set has not changed. Keeping some positions while auto-placing the
  // rest puts a preserved artboard exactly where a fresh one is about to land:
  // sizes are what matter (a frame too small clips, and that is unrecoverable),
  // positions are cosmetic and auto-layout handles them correctly.
  const sameFileSet = prior.size === existing.length && existing.every((f) => prior.has(f));
  const allPositioned = [...prior.values()].every((a) => Number.isFinite(a.x) && Number.isFinite(a.y));
  // A position is only valid for the size it was computed against. When a
  // generated sheet grows, or someone corrects an authored artboard's frame in
  // canvas.json, the old coordinates put it straight through its neighbour.
  const sameSizes = existing.every((f) => {
    const was = prior.get(f);
    const generated = known.get(f);
    if (!was) return false;
    if (generated) return was.w === generated.w && was.h === generated.h;
    return true;
  });
  const keepPositions = sameFileSet && allPositioned && sameSizes && prior.size > 0;

  // What the brand ALREADY SAYS an authored artboard is: `applications[].frame`
  // for a page somebody recorded, and the composite's own dimensions for a
  // mockup, which `mockupBody` wrote into the artboard.
  //
  // Without this, `sheets` gave a 390x844 phone and a 794x1123 flyer the
  // 1440x900 desktop frame and said "because nothing said otherwise" in a
  // project whose brand file said otherwise on the line above. The deck then
  // letterboxed all three.
  const recorded = new Map();
  // Two shapes, because `applications[]` items are free-form and both get
  // written: "1440x1600" by a person, [1440, 1600] by anything generating JSON.
  // Reading only the string meant `set applications '[{"frame":[1440,1600]}]'`
  // was accepted and then reported as "nothing said otherwise", which is the
  // one thing this must never say about a frame the brand file did record.
  // Both forms take the same 10 to 99999 range.
  const frameOf = (v) => {
    if (Array.isArray(v)) {
      const [w, h] = v.map(Number);
      const sane = (n) => Number.isInteger(n) && n >= 10 && n <= 99999;
      return v.length === 2 && sane(w) && sane(h) ? { w, h } : null;
    }
    const m = /^\s*(\d{2,5})\s*[x\u00d7]\s*(\d{2,5})\s*$/.exec(String(v ?? ''));
    return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
  };
  for (const f of existing) {
    if (known.has(f)) continue; // a generated sheet is sized by its generator
    const app = (brand.applications ?? []).find((a) => a && a.file === f);
    const fromApp = frameOf(app?.frame);
    if (fromApp) { recorded.set(f, { ...fromApp, why: `applications[].frame records ${fromApp.w}x${fromApp.h}` }); continue; }
    if (!/^Mockup/.test(f)) continue;
    const drawn = /<div style="position:relative;width:(\d+)px;height:(\d+)px/
      .exec(await readFile(path.join(dir, f), 'utf8'));
    if (drawn) recorded.set(f, { w: Number(drawn[1]), h: Number(drawn[2]), why: 'the composite is that size' });
  }

  const entries = existing.map((f) => {
    const generated = known.get(f);
    const was = prior.get(f);
    const says = recorded.get(f);
    // A size that is only in canvas.json because an earlier run defaulted it is
    // not a decision anybody made, so the brand file wins over it. A size
    // somebody actually chose is left alone.
    const wasDefaulted = was && was.w === FRAMES.desktop.w && was.h === FRAMES.desktop.h;
    const position = keepPositions && was ? { x: was.x, y: was.y } : {};
    if (generated) {
      // A generated sheet's size is always the freshly computed one. Main is the
      // exception on page: the contents sheet is the entry to the design page,
      // not another reference sheet filed behind it.
      const page = f === 'Main.dc.html' ? 'work' : 'spec';
      return { file: f, w: generated.w, h: generated.h, page, ...position };
    }
    // An authored Main replacing the generated contents page is a different
    // artboard at the same path, so the recorded size belongs to the file that
    // is gone. Inheriting it put a 1440x1600 home page in a 1200x1286 frame and
    // clipped 300px in silence, which is the one canvas failure that cannot be
    // recovered without a re-seed. Fall through to the default and say so.
    const staleGeneratedSize = f === 'Main.dc.html' && keptMain && was
      && was.w === contentsSize.w && was.h === contentsSize.h;
    if (was && !staleGeneratedSize && !(wasDefaulted && says) && Number.isFinite(was.w) && Number.isFinite(was.h)) {
      return { ...was, file: f, page: was.page ?? 'work', ...position };
    }
    // The brand file, or the composite itself, before the default.
    if (says) return { file: f, w: says.w, h: says.h, page: 'work', ...(was ? {} : position) };
    // New, authored, and nothing anywhere says how big it is. Default, and say
    // so rather than letting a too-small frame clip in silence.
    return { file: f, w: FRAMES.desktop.w, h: FRAMES.desktop.h, page: 'work', unsized: true };
  });

  const unsized = entries.filter((e) => e.unsized).map((e) => e.file);
  for (const e of entries) delete e.unsized;
  // Of those, the ones the brand file DOES record a frame for, in a form
  // nothing can read: "A3 portrait" is a real answer to a person and is not a
  // frame. They still default, because half-reading one would be worse, but
  // telling somebody nothing was said about a line they wrote sends them
  // looking in the wrong file. This is the same lookup the layout used above,
  // so the two cannot report different entries when a file is named twice.
  const frameInBrand = (f) => {
    const v = (brand.applications ?? []).find((a) => a && a.file === f)?.frame;
    return v == null || v === '' ? null : v;
  };
  const unreadable = unsized.filter((f) => frameInBrand(f) !== null);
  const guessed = unsized.filter((f) => frameInBrand(f) === null);
  // Which authored artboards took their frame from the brand file rather than
  // from the default, so the person can see it happened and correct it.
  const sized = entries
    .filter((e) => recorded.has(e.file) && recorded.get(e.file).w === e.w && recorded.get(e.file).h === e.h)
    .map((e) => `${e.file} ${e.w}x${e.h}, because ${recorded.get(e.file).why}`);

  // The specification page reads in the order the contents sheet lists ("In
  // this set"), not in the order readdir happened to return the files.
  const listed = new Map(all.map((s, i) => [s.file, i]));
  entries.sort((a, b) => {
    if (a.page !== b.page) return a.page === 'work' ? -1 : 1;
    if (a.page !== 'spec') return 0;
    return (listed.get(a.file) ?? 99) - (listed.get(b.file) ?? 99);
  });

  // Specification sheets go on their own page so they do not crowd the design.
  const pages = [{ id: 'work', name: 'Design' }, { id: 'spec', name: 'Specification' }];
  const hasWork = entries.some((e) => e.page === 'work');
  // Land on the design, not the specification. A previous `focused` launch is
  // kept when its artboard still exists, because that was a deliberate choice;
  // a page launch is recomputed, because the page set has just changed.
  const launch = previous?.launch?.view === 'focused' && existing.includes(previous.launch.file)
    ? previous.launch
    : { view: 'canvas', page: hasWork ? 'work' : 'spec' };
  // Five across on the specification page: nine tall sheets two across make a
  // strip that is unreadable at fit zoom. The design page keeps two.
  const columns = { work: 2, spec: 5 };
  const manifest = canvasManifest(entries, {
    columns,
    pages: hasWork ? pages : [{ id: 'spec', name: 'Specification' }],
    launch,
  });
  // If preserved positions no longer fit, throw them away and lay out fresh
  // rather than making the user delete a file to recover.
  let finalManifest = manifest;
  if (findOverlaps(manifest).length) {
    finalManifest = canvasManifest(
      entries.map(({ x, y, ...rest }) => rest),
      { columns, pages: hasWork ? pages : [{ id: 'spec', name: 'Specification' }], launch },
    );
  }
  const clashes = findOverlaps(finalManifest);
  if (clashes.length) {
    return fail(
      `The layout would overlap even after a fresh pass: ${clashes.map((c) => `${c.a} and ${c.b}`).join(', ')}.\n` +
        `That is a bug in the layout code, not in your files.`,
      { clashes },
    );
  }
  await writeFile(manifestPath, JSON.stringify(finalManifest, null, 2) + '\n');

  emit(
    `Wrote ${sheets.length} specification artboards to ${path.relative(process.cwd(), dir)}\n` +
      sheets.map((s) => `  ${s.file.padEnd(24)} ${s.w}x${s.h}`).join('\n') +
      (keptMain ? `\n  Main.dc.html             kept as it is. Pass --force to replace it with the generated contents page.` : '') +
      `\n  canvas.json              ${plural(finalManifest.artboards.length, 'artboard')}` +
      (sized.length ? `\n\nSized from the brand file:\n${sized.map((l) => `  ${l}`).join('\n')}` : '') +
      (guessed.length
        ? `\n\nSized as ${FRAMES.desktop.w}x${FRAMES.desktop.h} because nothing said otherwise: ${guessed.join(', ')}.\n` +
          `A frame smaller than its content clips, and clipping is not recoverable without a re-seed,\n` +
          `so record it as applications[].frame, or set the real size in canvas.json, before publishing.`
        : '') +
      (unreadable.length
        ? `\n\nSized as ${FRAMES.desktop.w}x${FRAMES.desktop.h} because the frame the brand file records is not one a layout can read:\n` +
          unreadable.map((f) => `  ${f}, where applications[].frame says ${JSON.stringify(frameInBrand(f))}`).join('\n') +
          `\nWrite it as "1440x1600" or [1440, 1600], or set the real size in canvas.json.`
        : ''),
    { ok: true, dir, files: sheets.map((s) => s.file), manifest: finalManifest, unsized, sized, unreadable },
  );
}

// ---------------------------------------------------------------------------
// validate
// ---------------------------------------------------------------------------

/**
 * The brand file that belongs to a canvas directory, if there is one.
 *
 * NOT brandPath(flags): here `--dir` names the canvas, not the brand
 * directory, so asking brandPath for it looked for brand/canvas/brand.json,
 * found nothing, and reported a clean deliverable that was not clean.
 * Returns null when the file is absent or is not JSON; a caller that needs to
 * report the latter reads it again itself.
 */
async function brandBesideCanvas(dir, flags) {
  const bf = [
    flags.brand && path.resolve(flags.brand),
    path.join(path.dirname(dir), 'brand.json'),
    path.resolve('brand', 'brand.json'),
  ].filter(Boolean).find((p) => existsSync(p));
  if (!bf) return null;
  try {
    return { file: bf, brand: migrateBrand(JSON.parse(await readFile(bf, 'utf8'))) };
  } catch (e) {
    // Only an unreadable brand file is this pass's business. A bare `catch {}`
    // here once swallowed a ReferenceError and printed "Clean." over eight
    // real errors, which is the worst thing a checker can do.
    if (!(e instanceof SyntaxError)) throw e;
    return null;
  }
}

/** The faces a brand records, so a validator can tell its own face from a stray one. */
const recordedFonts = (brand) => ['display', 'body', 'mono'].map((k) => brand?.identity?.type?.[k]).filter(Boolean);

async function cmdValidate(flags, positional) {
  const dir = path.resolve(flags.dir ?? positional[0] ?? 'brand/canvas');
  if (!existsSync(dir)) return fail(`No such directory: ${dir}`);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.dc.html'));
  if (!files.length) return fail(`No .dc.html artboards in ${dir}`);
  const artboards = [];
  for (const f of files) artboards.push({ file: f, source: await readFile(path.join(dir, f), 'utf8') });
  let manifest = null;
  const manifestPath = path.join(dir, 'canvas.json');
  if (existsSync(manifestPath)) {
    try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); } catch (e) {
      return fail(`canvas.json is not valid JSON: ${e.message}`);
    }
  }
  const near = await brandBesideCanvas(dir, flags);
  const result = validateCanvas({ artboards, manifest, brandFonts: recordedFonts(near?.brand) });

  // The artboards can all be correct and the deliverable still contradict the
  // brief: four logo variants documented and one drawn, a photographic
  // signature and no photograph. Those are the contradictions a client finds
  // first, so they belong in the same pass.
  let promises = { ok: true, findings: [] };
  if (near) {
    promises = await checkPromises({ brand: near.brand, root: path.dirname(path.dirname(near.file)), canvasDir: dir });
  }
  const lines = [`Checked ${plural(files.length, 'artboard')} in ${path.relative(process.cwd(), dir)}`];
  // Two kinds of error, and they used to share a heading that was wrong for
  // one of them: a missing support line will not render, a banned typeface
  // renders perfectly and reads as machine-made.
  const structural = result.errors.filter((e) => !e.rule);
  const slop = result.errors.filter((e) => e.rule);
  if (structural.length) {
    lines.push('', `${plural(structural.length, 'error')} (these will not render correctly):`);
    for (const e of structural) {
      lines.push(`  ${e.file}: ${e.message}`);
      if (e.fix) lines.push(`      ${e.fix}`);
    }
  }
  if (slop.length) {
    lines.push('', `${plural(slop.length, 'anti-slop error')} (these will render, and read as machine-made):`);
    for (const e of slop) {
      lines.push(`  ${e.file}: ${e.message}`);
      if (e.fix) lines.push(`      ${e.fix}`);
    }
  }
  if (result.warnings.length) {
    lines.push('', `${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'} (these will render, and look generic):`);
    for (const w of result.warnings) {
      lines.push(`  ${w.file}: ${w.message}`);
      if (w.fix) lines.push(`      ${w.fix}`);
    }
  }
  // Kept separate from the artboard findings, and worded differently, because
  // these are not rendering faults: every one of them is the brand file and the
  // deliverable saying different things.
  if (promises.findings.length) {
    const errs = promises.findings.filter((f) => f.level === 'error');
    const warns = promises.findings.filter((f) => f.level !== 'error');
    lines.push('', `The brief and the deliverable disagree in ${plural(promises.findings.length, 'place')}:`);
    for (const f of [...errs, ...warns]) {
      lines.push(`  ${f.level === 'error' ? 'ERROR' : 'warn '}  ${f.message}`);
      if (f.fix) lines.push(`         ${f.fix}`);
    }
    if (errs.length) lines.push('', 'A client reads the book and then looks at the work. This is where they find the gap first.');
  }

  const clean = result.ok && !result.warnings.length && !promises.findings.length;
  if (clean) lines.push('', 'Clean.');
  emit(lines.join('\n'), { ...result, ok: result.ok && promises.ok, dir, promises: promises.findings });
  if (!result.ok || !promises.ok) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// canvas
// ---------------------------------------------------------------------------

async function cmdCanvas(flags) {
  const dir = path.resolve(flags.dir ?? 'brand/canvas');
  const title = typeof flags.title === 'string' ? flags.title : null;
  if (!title) return fail('A canvas needs a --title. Name it as the client would, not "Design Canvas".');
  const outFile = path.resolve(flags.out ?? `${slugify(title)}.html`);

  const helper = await locateDesignHelper();
  if (!helper) return fail(NOT_FOUND_MESSAGE);

  const files = (await readdir(dir)).filter((f) => f.endsWith('.dc.html'));
  if (!files.length) return fail(`No .dc.html artboards in ${dir}`);

  // Never seed something that will not render. This is the whole reason the
  // validator exists.
  const artboards = [];
  for (const f of files) artboards.push({ file: f, source: await readFile(path.join(dir, f), 'utf8') });
  let manifest = null;
  if (existsSync(path.join(dir, 'canvas.json'))) {
    manifest = JSON.parse(await readFile(path.join(dir, 'canvas.json'), 'utf8'));
  }
  const near = await brandBesideCanvas(dir, flags);
  const check = validateCanvas({ artboards, manifest, brandFonts: recordedFonts(near?.brand) });
  if (!check.ok && !flags.force) {
    return fail(
      `Refusing to seed a canvas with ${plural(check.errors.length, 'error')}:\n` +
        check.errors.map((e) => `  ${e.file}: ${e.message}`).join('\n') +
        '\nFix them, or pass --force to seed anyway.',
      { errors: check.errors },
    );
  }

  const images = (await readdir(dir)).filter((f) => /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(f));
  const args = [
    helper.helper,
    '--template', helper.template,
    '--out', outFile,
    '--title', title,
  ];
  for (const f of files) args.push('--artboard', path.join(dir, f));
  for (const f of images) args.push('--image', path.join(dir, f));
  if (manifest) args.push('--canvas', path.join(dir, 'canvas.json'));

  let seedOut;
  try {
    seedOut = await run(process.execPath, args, { cwd: dir, timeout: 120000 });
  } catch (e) {
    return fail(`The canvas helper refused the seed:\n${e.stderr || e.stdout || e.message}`);
  }

  let checkOut;
  try {
    checkOut = await run(process.execPath, [helper.helper, '--check', outFile], { timeout: 60000 });
  } catch (e) {
    return fail(`The seeded canvas did not pass its own check:\n${e.stderr || e.stdout || e.message}`);
  }

  emit(
    [
      `Seeded ${path.relative(process.cwd(), outFile)}`,
      `  ${plural(files.length, 'artboard')}, ${plural(images.length, 'image')}, helper ${helper.version}`,
      seedOut.stdout.trim(),
      seedOut.stderr.trim() ? `warnings: ${seedOut.stderr.trim()}` : '',
      checkOut.stdout.trim(),
      check.warnings.length ? `\n${check.warnings.length} craft warnings, see: brandi validate --dir ${path.relative(process.cwd(), dir)}` : '',
      '',
      'Now publish it with the Artifact tool: file_path is the path above,',
      'contract "0.1.31", and a favicon of one or two emoji.',
    ].filter(Boolean).join('\n'),
    { ok: true, file: outFile, artboards: files, images, warnings: check.warnings },
  );
}

// ---------------------------------------------------------------------------
// book
// ---------------------------------------------------------------------------

/**
 * Inline the logo files the brand file names, so the book can actually show them.
 *
 * A path is tried against `brand/` first and then against the project root,
 * because in the case this whole tool exists for (someone hands over a logo and
 * a sentence) the logo is at `assets/logo.svg` in the project, not tucked inside
 * `brand/`. Resolution stops at the project root: a path in a data file must
 * never be able to read something outside the project it belongs to.
 */
/**
 * Is this path really inside the project, after the filesystem has had its say?
 *
 * `path.resolve` plus `startsWith` is a string comparison, and a symlink is not
 * a string. A link inside the project pointing anywhere on the disk passed that
 * test, and `loadLogoAssets` then read the target and inlined it into the brand
 * book, which is a document that gets handed to a client. Confirmed by putting
 * a marker in a file outside the project and finding it in the rendered book.
 *
 * The same class of bug was found independently in the logo forge on the same
 * day. If a guard is lexical, assume it is wrong.
 */
async function reallyInside(candidate, root) {
  try {
    const real = await realpath(candidate);
    const realRoot = await realpath(root);
    return real === realRoot || real.startsWith(realRoot + path.sep);
  } catch {
    return false;
  }
}

async function loadLogoAssets(brand, brandDir) {
  const assets = {};
  const MAX = 512 * 1024;
  const projectRoot = path.resolve(brandDir, '..');
  // The favicon is a logo file too: the deck has a page for it.
  const named = [...(brand.identity?.logo?.files ?? []), brand.identity?.logo?.favicon].filter(Boolean);
  for (const entry of named) {
    const rel = typeof entry === 'string' ? entry : entry?.path;
    if (!rel || path.isAbsolute(rel)) continue;
    const candidates = [path.resolve(brandDir, rel), path.resolve(projectRoot, rel)];
    let full = null;
    for (const c of candidates) {
      if (existsSync(c) && await reallyInside(c, projectRoot)) { full = c; break; }
    }
    if (!full) continue;
    try {
      const stats = await stat(full);
      if (!stats.isFile() || stats.size > MAX) continue;
      if (/\.svg$/i.test(full)) {
        const svg = await readFile(full, 'utf8');
        // Strip anything scriptable before it goes into a document someone opens.
        const safe = svg
          .replace(/<\?xml[\s\S]*?\?>/g, '')
          .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
          .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
        assets[rel] = { kind: 'svg', markup: safe.trim() };
      } else if (/\.(png|jpe?g|webp|gif|avif)$/i.test(full)) {
        const buf = await readFile(full);
        const ext = path.extname(full).slice(1).toLowerCase();
        const mime = ext === 'jpg' ? 'jpeg' : ext;
        assets[rel] = {
          kind: 'raster',
          markup: `<img src="data:image/${mime};base64,${buf.toString('base64')}" alt="${brand.meta?.name ?? 'Logo'}" style="max-width:100%;height:auto">`,
        };
      }
    } catch { /* an unreadable logo is reported by its absence, not by a crash */ }
  }
  return assets;
}

/**
 * The approved colourways, turned into artwork for one master.
 *
 * A colourway is a mapping from the inks the mark was drawn in to roles in the
 * palette, so it can only be applied to a drawing that still carries those
 * inks. A master that does not is skipped with the reason said out loud, rather
 * than being given a rendition that is half the colourway and half whatever it
 * was drawn in.
 */
function resolveApprovedColourways(brand, system, masterSvg, notes) {
  const declared = (brand.identity?.logo?.colourways ?? []).filter((c) => c && c.approvedBy);
  if (!declared.length) return [];
  const { regions } = regionsOf(masterSvg);
  const out = [];
  for (const c of declared) {
    const check = resolveColourway(c, { system, regions });
    if (!check.ok) {
      notes.push(`The ${c.name ?? c.id} colourway was not derived for this master: ${check.errors[0]}`);
      continue;
    }
    out.push({
      id: c.id,
      name: c.name ?? c.id,
      // The rendition the brand file itself points at, so it can be derived
      // again rather than left at the colour it was approved in.
      file: typeof c.file === 'string' ? c.file : null,
      svg: renderColourway(masterSvg, c, { system, regions }),
      why: `${c.name ?? c.id}, approved by ${c.approvedBy}. ${c.regions.map((r) => `${r.region ?? r.ink} in ${r.role}`).join(', ')}${c.ground ? `, drawn for ${c.ground}` : ''}. Derived from the mapping, so it follows the palette: never hand-edit it.`,
    });
  }
  return out;
}

/**
 * Redraw the rendition `brand.json` names for each approved colourway.
 *
 * A colourway is a mapping to palette roles and the artwork is derived from it,
 * so the file the record points at has to be derived again every time this
 * command runs. Without this it keeps the colour the palette held on the day it
 * was approved: the guardian then reports the recorded mark as off-palette and
 * the remedy it prints is this command, which is the one place the design's own
 * promise used to leak.
 *
 * Only a file already on disk is rewritten. This refreshes the rendition the
 * brand file points at; it does not decide where one should live, and it does
 * not put artwork somewhere nobody asked for it.
 */
async function refreshRecordedColourways(colourways, brandDir, done) {
  const projectRoot = path.resolve(brandDir, '..');
  const written = [];
  for (const c of colourways) {
    if (!c.file || path.isAbsolute(c.file) || done.has(c.file)) continue;
    // This writes over a file the brand file names, so it writes over exactly
    // the one shape `logo colour approve` writes and nothing else. A hand-edited
    // brand.json pointing a colourway's `file` at the master would otherwise
    // have this command paint the master in the colourway and lose the drawing.
    if (path.basename(c.file) !== `colourway-${c.id}.svg`) continue;
    // The same two spellings the guardian and `loadLogoAssets` both accept: a
    // brand file records paths relative to the project or to itself.
    const full = [path.resolve(projectRoot, c.file), path.resolve(brandDir, c.file)].find((p2) => existsSync(p2));
    if (!full || !/\.svg$/i.test(full) || !await reallyInside(full, projectRoot)) continue;
    await writeFile(full, `${c.svg}\n`);
    done.add(c.file);
    written.push(path.relative(process.cwd(), full));
  }
  return written;
}

/**
 * Produce the asset pack from the brand's own master SVG.
 *
 * The one thing this refuses to do is invent a mark. If there is no SVG on
 * disk, the answer is the typeset wordmark on the Logo sheet plus the brief for
 * whoever draws the real one, and saying so is more use than a generated shape
 * nobody chose.
 */
async function cmdAssets(flags) {
  const { file, brand, system } = await resolveSystem(flags);
  const brandDir = path.dirname(file);
  const assets = await loadLogoAssets(brand, brandDir);
  const svgEntries = Object.entries(assets).filter(([, a]) => a.kind === 'svg');

  if (!svgEntries.length) {
    const declared = (brand.identity?.logo?.files ?? []).length;
    return fail(
      declared
        ? `${plural(declared, 'logo file')} declared and no readable SVG among them.\nRasters cannot be derived from rasters, and a vector is what every one of these outputs needs.\nPut the master SVG on disk and record its path in identity.logo.files.`
        : 'No master SVG recorded, so there is nothing to derive a pack from.\nThat is a real answer, not a failure: the Logo sheet carries a typeset wordmark and a brief for whoever draws the mark. Come back here when it exists.',
    );
  }

  // A brand has more than one master. Stacked and mark-only are separate
  // artwork rather than crops of the primary, so each gets its own derived set
  // in its own directory. `role` on the file entry decides; the filename is
  // only consulted when nobody recorded one.
  const declared = (brand.identity?.logo?.files ?? []).map((e) => (typeof e === 'string' ? { path: e } : e));
  const roleOf = (entry) => {
    if (entry.role) return String(entry.role).toLowerCase();
    const n = path.basename(entry.path ?? '').toLowerCase();
    if (/favicon|simplified/.test(n)) return 'favicon';
    if (/stacked/.test(n)) return 'stacked';
    if (/mono|black|white|reverse/.test(n)) return 'derived';
    if (/mark[-_.]|[-_.]mark/.test(n)) return 'mark';
    return 'primary';
  };

  // A master is artwork somebody drew. `mono-black`, `mono-white` and reversed
  // are colourways this command produces from a master, so a file recorded
  // under one of those roles is an output of this pipeline arriving back at its
  // own input. Building a pack from each would derive five colourways of a
  // colourway. The logo forge upstream writes exactly these roles.
  const DERIVED_ROLES = new Set(['derived', 'mono-black', 'mono-white', 'mono', 'reversed', 'white', 'black', 'on-brand', 'brand']);

  const vectors = declared.filter((e) => e.path && assets[e.path]?.kind === 'svg');
  const byRole = new Map(vectors.map((e) => [roleOf(e), e]));
  // A file nobody declared a role for still deserves a pack.
  if (!byRole.size) byRole.set('primary', { path: svgEntries[0][0] });

  const faviconEntry = byRole.get('favicon');
  const faviconSvg = faviconEntry ? assets[faviconEntry.path].markup : null;
  const masters = [...byRole.entries()].filter(([role]) => role !== 'favicon' && !DERIVED_ROLES.has(role));
  if (!masters.length) {
    return fail(
      'Every recorded logo file is a colourway rather than a master.\n'
      + `Found: ${[...byRole.keys()].join(', ')}. This command derives the colourways, so it needs the drawing they came from.\n`
      + 'Record the master with role "primary" in identity.logo.files.',
    );
  }

  const baseOut = path.resolve(flags.out ?? path.join(brandDir, 'assets'));
  const rel = (f) => path.relative(process.cwd(), f);
  const packs = [];
  const colourwayNotes = [];
  // A colourway record names one file, so it is a rendition of one master. The
  // first master that can carry the mapping owns it, which in the one case the
  // forge produces is the master it was approved against.
  const refreshed = [];
  const refreshedPaths = new Set();
  for (const [role, entry] of masters) {
    const outDir = masters.length > 1 ? path.join(baseOut, role) : baseOut;
    const masterSvg = assets[entry.path].markup;
    const colourways = resolveApprovedColourways(brand, system, masterSvg, colourwayNotes);
    const result = await buildAssetPack({
      masterSvg,
      outDir,
      system,
      brandName: brand.meta?.name ?? 'Brand',
      // Only the primary gets the simplified favicon: a stacked lockup has no
      // business being the browser tab icon.
      faviconSvg: role === 'primary' ? faviconSvg : null,
      colourways,
    });
    packs.push({ role, master: entry.path, outDir, ...result });
    refreshed.push(...await refreshRecordedColourways(colourways, brandDir, refreshedPaths));
  }

  const total = packs.reduce((n, p2) => n + p2.written.length, 0);
  const lines = [`Built ${plural(total, 'file')} from ${plural(packs.length, 'master')}.`];
  if (faviconSvg) lines.push(`The favicon uses ${faviconEntry.path}, which is the drawing that survives at 16px.`);
  if (refreshed.length) lines.push(`Redrew ${plural(refreshed.length, 'recorded colourway rendition')} from the mapping, so ${refreshed.length === 1 ? 'it follows' : 'they follow'} the palette: ${refreshed.join(', ')}.`);
  for (const note of [...new Set(colourwayNotes)]) lines.push(note);
  for (const p2 of packs) {
    lines.push('', `${p2.role}  <-  ${p2.master}  ->  ${rel(p2.outDir)}`);
    for (const w of p2.written) lines.push(`  ${w.kind.padEnd(5)} ${path.basename(w.file).padEnd(26)} ${w.why}`);
    for (const sk of p2.skipped) lines.push(`  NOT PRODUCED  ${sk.what}`, `      ${sk.why}`, `      ${sk.fix}`);
  }
  lines.push('', 'Record the favicon path in identity.logo.favicon so the book and the promises check can see it.');
  const ok = packs.every((p2) => p2.ok);
  emit(lines.join('\n'), { ok, refreshed, packs: packs.map((p2) => ({ ...p2, outDir: rel(p2.outDir), written: p2.written.map((w) => ({ ...w, file: rel(w.file) })) })) });
  if (!ok) process.exitCode = 1;
}

/**
 * Assemble the handover.
 *
 * Deliberately does not generate anything. Running the pieces itself would mean
 * a `handoff` that silently rebuilds a book somebody had hand-checked, and the
 * one thing a handover must be is the thing that was approved.
 */
/**
 * `brandi logo <subcommand>`, delegated to the forge.
 *
 * In-process rather than spawned: a second node start costs more than the whole
 * subcommand for most of these, and an exit code that has to survive a child
 * process is an exit code that eventually does not.
 *
 * The raw argv is forwarded rather than the parsed flags, because the forge has
 * its own argument shapes and re-serialising them here would be a second parser
 * to keep in step with the first.
 */
/**
 * The logo forge parses its own arguments, so it gets the raw argv tail.
 *
 * It used to be handed the PARSED positionals, which meant every flag had
 * already been stripped: `brandi logo plan --count 12 --name "X"` planned twelve
 * concepts for a business called "Brand" and said nothing. It looked correct
 * because the two commands anybody tries first, `logo` and `logo status`, take
 * no flags at all.
 */
async function cmdLogo(flags, _positional, rawTail = []) {
  const { main: logoMain } = await import('./logo.mjs');
  // `brandi --json logo status` puts the flag before the subcommand, so it is
  // consumed here and never reaches the tail. Both spellings should do the same
  // thing: one that works and one that quietly does something else is the same
  // species of bug as the one that put this comment here.
  const tail = flags.json && !rawTail.includes('--json') ? [...rawTail, '--json'] : rawTail;
  await logoMain(tail);
}

/**
 * Catalogue supplied images before anything is planned.
 *
 * Recon reads logos, tokens and copy. It never measured a photograph, so every
 * decision about how photography would be used was made from an assumption
 * about what client photography looks like. Client photography is handheld
 * candids at phone ratios and social exports at social resolutions, and that is
 * knowable in under a second rather than guessable.
 */
async function cmdImages(flags, rest) {
  // `rest` is the tail after the command word, so the directory is rest[0].
  const dir = path.resolve(flags.dir ?? rest[0] ?? '.');
  if (!existsSync(dir)) return fail(`No such directory: ${dir}`);

  const outPath = path.resolve(flags.out ?? path.join(path.dirname(brandPath(flags)), 'images.json'));
  let prior = {};
  if (existsSync(outPath)) {
    // A recorded review is preserved across re-runs: re-measuring must never
    // discard the half that took somebody looking at the picture.
    try { prior = JSON.parse(await readFile(outPath, 'utf8')).assets ?? {}; } catch { prior = {}; }
  }

  const doc = await catalogueImages(dir, { prior });
  if (!doc.counts.images) {
    return fail(`No images under ${path.relative(process.cwd(), dir) || '.'}. Point this at the folder the client supplied.`);
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(doc, null, 2)}\n`);

  const lines = [summarise(doc), '', `Written to ${path.relative(process.cwd(), outPath)}`];
  emit(lines.join('\n'), doc);

  // `--check` makes "nobody looked" a failure rather than a silent default.
  if (flags.check) {
    const unreviewed = doc.counts.photos - doc.counts.reviewed;
    if (unreviewed) process.exitCode = 1;
  }
}

/**
 * What goes on a mockup surface, from the one string the brand file records.
 *
 * Two forms, because both are natural to record and neither should need a
 * second field to say which it is: markup starting with `<` is used as it
 * stands, and anything else is a path to a file in the project. A file is
 * COPIED beside the artboard and referenced, never inlined: an `<img>` cannot
 * run what an SVG might carry, and the canvas seeds relative files anyway.
 *
 * An absent value is an error rather than an empty box. The deck captions a
 * mockup as the brand composited onto a photograph, and an empty box under that
 * sentence is the tool asserting something that is not on the page.
 */
async function resolveArtwork(value, { projectRoot, brandDir, prefix }) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    return {
      error: 'no artwork recorded, so there is nothing to composite. Set the surface\'s `artwork` to '
        + 'inline markup (an <svg> or a <div> of type) or to the path of an .svg, .png, .jpg or .webp in this project.',
    };
  }
  // Inline markup is the author's own and is used as it stands, minus anything
  // scriptable: the artboard is a file somebody opens, and `loadLogoAssets`
  // strips the same things off a supplied SVG for the same reason.
  if (raw.startsWith('<')) {
    return {
      markup: raw
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
        .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, ''),
    };
  }
  if (path.isAbsolute(raw)) return { error: `artwork "${raw}" is an absolute path. Record it relative to the project.` };
  if (!/\.(svg|png|jpe?g|webp)$/i.test(raw)) {
    return { error: `artwork "${raw}" is neither markup (it does not start with "<") nor a path to an .svg, .png, .jpg or .webp file.` };
  }
  const candidates = [path.resolve(brandDir, raw), path.resolve(projectRoot, raw)];
  let full = null;
  for (const c of candidates) {
    if (existsSync(c) && await reallyInside(c, projectRoot)) { full = c; break; }
  }
  if (!full) return { error: `artwork "${raw}" is not a file inside this project.` };
  const stats = await stat(full);
  if (!stats.isFile()) return { error: `artwork "${raw}" is not a file.` };
  if (stats.size > 2 * 1024 * 1024) return { error: `artwork "${raw}" is ${Math.round(stats.size / 1024)}KB, which is too large to carry on an artboard. Keep it under 2MB.` };
  // The copied name is reduced to characters that need no escaping, so the
  // file on disk and the `src` that points at it cannot disagree about a space
  // or a quote.
  const local = `${prefix}-${path.basename(full).replace(/[^A-Za-z0-9._-]+/g, '-')}`;
  return {
    copy: { from: full, to: local },
    markup: `<img src="${local}" alt="" style="display:block;width:100%;height:100%;object-fit:contain">`,
  };
}

const MOCKUP_USAGE = `brandi mockup — put the brand on a real photograph

  brandi mockup grid <photo> [--rotate 0|90|180|270] [--out <file>]
      Write a page showing the photograph under a percentage grid, so the four
      corners of the surface are READ off the picture rather than estimated.
      The page must sit beside the photograph, which is where --out defaults.

  brandi mockup build [--file <brand.json>] [--dir <canvas dir>]
      Composite every mockup recorded under identity.mockups onto its
      photograph and write one artboard each into the brand canvas.

Recorded per mockup, under identity.mockups:
  photo      path to the photograph, relative to the project. Not HEIC.
  rotate     applied BEFORE the corners are read, if the phone stored it
             one way round and meant another.
  caption    the line printed across the foot of the artboard.
  surfaces[] one per panel the artwork goes on:
     corners four x,y percentages, clockwise from the surface's top left
     artwork inline markup (an <svg>, or a <div> of type), or the path to an
             .svg, .png, .jpg or .webp in this project. Required: without it
             there is nothing to composite and the mockup is refused.
     aspect  height over width of the artwork box. The panel's proportions.
     blend   multiply (a wrap, paint, print) or normal (a sticker, backlit)
     opacity 0 to 1
     reviewed true only once somebody rendered it and looked

  brandi set identity.mockups.0.surfaces.0.artwork "$(cat brand/logo/master.svg)"
  brandi set identity.mockups.0.surfaces.0.artwork brand/logo/master.svg`;

/**
 * `brandi mockup grid <photo>` and `brandi mockup build`.
 *
 * Two steps on purpose, and the gap between them is a person. The grid renders
 * the photograph under percentage rules so the four corners of a surface can be
 * READ off it; the build maps artwork onto the corners that were recorded. The
 * first attempt at this skipped the middle step and put a wordmark on the grass
 * beside a trailer, which is why it is not one command.
 */
async function cmdMockup(flags, rest) {
  const sub = rest[0] ?? 'build';

  if (flags.help || sub === 'help') {
    emit(MOCKUP_USAGE, { ok: true, usage: MOCKUP_USAGE });
    return;
  }

  if (sub === 'grid') {
    const photo = rest[1] ?? flags.photo;
    if (!photo) return fail('usage: brandi mockup grid <photo> [--rotate 0|90|180|270]');
    const full = path.resolve(photo);
    if (!existsSync(full)) return fail(`No such photograph: ${photo}`);

    const size = await imageSize(full);
    if (size.error) return fail(`Cannot measure ${photo}: ${size.error}`);
    if (size.format === 'heic') {
      return fail(
        `${photo} is HEIC, which no browser decodes, so it cannot appear in a mockup at all.\n`
        + 'Convert it first:\n'
        + `  sips -s format jpeg -Z 2400 "${photo}" --out "${photo.replace(/\.[^.]+$/, '')}.jpg"`,
      );
    }

    const out = path.resolve(flags.out ?? `${full.replace(/\.[^.]+$/, '')}-grid.html`);
    // The grid references the photograph by basename, so the page has to sit
    // beside it. Anything else renders a broken image and shows a grid over
    // nothing, which looks like the photograph is the problem.
    if (path.dirname(out) !== path.dirname(full)) {
      return fail(`The grid must be written beside the photograph, so it can reference it.\nTry --out ${path.join(path.dirname(full), 'grid.html')}`);
    }
    const rotate = Number(flags.rotate ?? 0);
    await writeFile(out, gridPage({
      photo: path.basename(full), width: size.width, height: size.height, rotate,
    }));
    emit([
      `Wrote ${path.relative(process.cwd(), out)}`,
      '',
      'Open it, and read the FOUR CORNERS of the surface the artwork goes on, clockwise from its',
      'top left, as x,y percentages. Then record them under identity.mockups in brand.json,',
      'with the artwork that goes on them:',
      '',
      '  brandi set identity.mockups.0.surfaces.0.corners \'[[12,30],[62,34],[60,58],[14,54]]\'',
      '  brandi set identity.mockups.0.surfaces.0.artwork brand/logo/master.svg',
      '',
      'If the photograph is on its side, pass --rotate 90, 180 or 270 and read the corners again:',
      'they have to be read from the picture as it will be composited.',
    ].join('\n'), { ok: true, out: path.relative(process.cwd(), out), width: size.width, height: size.height, rotate });
    return;
  }

  if (sub !== 'build') return fail(`Unknown subcommand "${sub}". Use grid or build.`);

  const { file, brand } = await resolveSystem(flags);
  const mockups = brand.identity?.mockups ?? [];
  if (!mockups.length) {
    return fail(
      'No mockups recorded. A mockup is a photograph plus four corners somebody read off it.\n'
      + 'Run `brandi mockup grid <photo>`, read the corners, and record them under identity.mockups.',
    );
  }

  const canvasDir = path.resolve(flags.dir ?? path.join(path.dirname(file), 'canvas'));
  await mkdir(canvasDir, { recursive: true });
  const projectRoot = path.resolve(path.dirname(file), '..');
  const written = [];
  const problems = [];

  for (const m of mockups) {
    const name = (m.name ?? 'Mockup').replace(/[^A-Za-z0-9]/g, '');
    const src = path.resolve(projectRoot, m.photo);
    if (!existsSync(src)) { problems.push(`${m.name ?? m.photo}: the photograph is not on disk.`); continue; }
    const size = await imageSize(src);
    if (size.error) { problems.push(`${m.name ?? m.photo}: ${size.error}`); continue; }
    if (size.format === 'heic') { problems.push(`${m.name ?? m.photo}: HEIC, which no browser decodes. Convert it.`); continue; }

    // Every surface is checked before anything renders, because a bow tie or a
    // repeated corner draws something that looks deliberate, and because a
    // surface with nothing on it used to composite an empty box and still
    // report success, under a deck caption claiming the brand was on the
    // photograph. Corners and artwork are both preconditions, not options.
    let bad = false;
    const surfaces = [];
    const copies = [];
    const inSurfaces = m.surfaces ?? [];
    if (!inSurfaces.length) {
      problems.push(`${m.name ?? m.photo}: no surfaces recorded, so there is nothing to composite.`);
      continue;
    }
    for (const [i, s] of inSurfaces.entries()) {
      const where = `${m.name ?? m.photo} / ${s?.name ?? `surface ${i}`}`;
      // A hand-edited file can hold a hole in the list. Say so, rather than
      // die on "Cannot read properties of null".
      if (!s || typeof s !== 'object') { problems.push(`${where}: this surface is ${s === null ? 'null' : typeof s}, not a record with corners and artwork.`); bad = true; continue; }
      const check = validateCorners((s.corners ?? []).map((c) => [c[0], c[1]]));
      if (!check.ok) { problems.push(`${where}: ${check.reason}`); bad = true; continue; }
      const art = await resolveArtwork(s.artwork, {
        projectRoot, brandDir: path.dirname(file), prefix: `${name.toLowerCase()}-art-${i}`,
      });
      if (art.error) { problems.push(`${where}: ${art.error}`); bad = true; continue; }
      if (art.copy) copies.push(art.copy);
      surfaces.push({ ...s, artwork: art.markup });
    }
    if (bad) continue;

    // The photograph and any artwork FILE travel with the artboard: the canvas
    // has no network and a relative path out of the canvas directory does not
    // survive seeding. Copied only once the whole mockup is known to be good,
    // so a refused mockup leaves nothing behind.
    const localPhoto = `${name.toLowerCase()}-${path.basename(src)}`;
    await copyFile(src, path.join(canvasDir, localPhoto));
    for (const c of copies) await copyFile(c.from, path.join(canvasDir, c.to));

    const body = mockupBody({
      photo: localPhoto,
      width: size.width,
      height: size.height,
      rotate: m.rotate ?? 0,
      caption: m.caption ?? null,
      surfaces,
    });
    const unreviewed = (m.surfaces ?? []).filter((s) => !s.reviewed).length;
    const file2 = path.join(canvasDir, `Mockup${name}.dc.html`);
    await writeFile(file2, artboardOf({
      name: `Mockup${name}`,
      body,
      systemNote: unreviewed
        ? `Composited from recorded corners. ${plural(unreviewed, 'surface')} not yet checked by looking at the render.`
        : 'Composited from corners read off the photograph and checked in the render.',
    }));
    written.push({ file: file2, photo: m.photo, surfaces: (m.surfaces ?? []).length, unreviewed });
  }

  const rel = (f) => path.relative(process.cwd(), f);
  const lines = [`Composited ${plural(written.length, 'mockup')} into ${rel(canvasDir)}`];
  for (const w of written) {
    lines.push(`  ${path.basename(w.file).padEnd(28)} ${plural(w.surfaces, 'surface')} on ${w.photo}`);
    if (w.unreviewed) lines.push(`      ${plural(w.unreviewed, 'surface')} never checked in the render. Corners nobody looked at are corners somebody typed.`);
  }
  if (problems.length) {
    lines.push('', 'Not composited:');
    for (const p2 of problems) lines.push(`  ${p2}`);
  }
  emit(lines.join('\n'), { ok: problems.length === 0, written: written.map((w) => ({ ...w, file: rel(w.file) })), problems });
  if (problems.length) process.exitCode = 1;
}

async function cmdHandoff(flags) {
  const { file, brand, system } = await resolveSystem(flags);
  const brandDir = path.dirname(file);
  const outDir = path.resolve(flags.out ?? path.join(path.dirname(brandDir), 'handover'));

  const result = await buildHandoff({ brandDir, outDir, brand, system });
  const rel = (f) => path.relative(process.cwd(), f);

  const lines = [`Assembled ${plural(result.present.length, 'part')} into ${rel(outDir)}`, ''];
  for (const p2 of result.present) lines.push(`  ${p2.dest.padEnd(18)} ${p2.size ?? ''}`.trimEnd(), `      for ${p2.who}`);
  if (result.absent.length) {
    lines.push('', 'Not in the package, and named rather than left out:');
    for (const p2 of result.absent) lines.push(`  ${p2.title}`, `      produce it with: ${p2.make}`);
  }
  lines.push('', `Open ${rel(result.index)}. It says who takes what, which is the part a folder of files cannot.`);

  // A handover missing the source of truth is not a handover.
  const fatal = result.absent.filter((p2) => p2.id === 'brand' || p2.id === 'book');
  if (fatal.length) {
    lines.push('', `Incomplete: ${fatal.map((p2) => p2.title.toLowerCase()).join(' and ')} missing. Everything else is generated from those.`);
  }
  emit(lines.join('\n'), {
    ok: fatal.length === 0,
    outDir: rel(outDir),
    index: rel(result.index),
    present: result.present.map((p2) => ({ id: p2.id, dest: p2.dest, who: p2.who, size: p2.size })),
    absent: result.absent.map((p2) => ({ id: p2.id, title: p2.title, make: p2.make })),
  });
  if (fatal.length) process.exitCode = 1;
}

/**
 * The scroll height of a rendered page, measured in headless Chrome, capped
 * at 8000px so a runaway layout cannot ask for a screenshot the size of a
 * wall. Falls back to the frame height when the probe cannot be read.
 * The probe waits for the load event and the fonts, not for animation
 * frames: under a virtual time budget a small headless window never ran the
 * frame callback, and every tall artboard came back at its frame height.
 */
async function documentHeight(chrome, htmlPath, width, fallback) {
  const probe = htmlPath.replace(/\.html$/, '.probe.html');
  const html = await readFile(htmlPath, 'utf8');
  // Measured at load, and again once the fonts settle, so a font that never
  // arrives (offline, a licensed face) still leaves the load-time height.
  const script = '<script>window.addEventListener("load",function(){var d=document.documentElement;function m(){d.setAttribute("data-scroll-height",String(d.scrollHeight));}m();document.fonts.ready.then(m);});</script>';
  await writeFile(probe, /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${script}</body>`) : `${html}${script}`);
  try {
    const { stdout } = await runChrome(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
      '--force-device-scale-factor=1', '--virtual-time-budget=4000', `--window-size=${width},${fallback}`, '--dump-dom', pathToFileURL(probe).href,
    ]);
    const m = /data-scroll-height="(\d+)"/.exec(stdout);
    return m ? Math.min(8000, Number(m[1])) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * The artboards the brand-in-use chapter shows: every authored artboard in
 * brand/canvas (the generated specification sheets are skipped by their
 * marker) and every mockup `brandi mockup build` wrote, rendered to PNG through
 * headless Chrome at the frame width canvas.json records and at the taller of
 * the frame and the document. Without a browser each one becomes a page that
 * says so, rather than a page that is missing.
 */
async function proofArtboards(brand, brandDir) {
  const canvasDir = path.join(brandDir, 'canvas');
  if (!existsSync(canvasDir)) return [];
  let manifest = null;
  try { manifest = JSON.parse(await readFile(path.join(canvasDir, 'canvas.json'), 'utf8')); } catch { manifest = null; }
  const frames = new Map((manifest?.artboards ?? []).map((a) => [a.file, a]));
  const apps = brand.applications ?? [];
  const chrome = findChrome();
  const out = [];
  for (const file of (await readdir(canvasDir)).filter((f) => f.endsWith('.dc.html')).sort()) {
    const full = path.join(canvasDir, file);
    const head = (await readFile(full, 'utf8')).slice(0, 4096);
    const mockup = /^Mockup/.test(file);
    if (!mockup && head.includes(GENERATED_MARKER)) continue;
    const stem = file.replace(/\.dc\.html$/, '');
    const source = await readFile(full, 'utf8');
    const app = apps.find((a) => a && a.file === file);
    // A mockup's frame is the photograph's own, and `mockupBody` wrote it into
    // the artboard. Falling back to the 1440x900 desktop frame letterboxed a
    // 1400x582 composite into half a page of nothing.
    const drawn = mockup ? /<div style="position:relative;width:(\d+)px;height:(\d+)px/.exec(source) : null;
    const frame = (drawn ? { w: Number(drawn[1]), h: Number(drawn[2]) } : null) ?? frames.get(file);
    const entry = {
      file, stem, kind: mockup ? 'mockup' : 'proof',
      title: app?.name ?? (mockup ? stem.replace(/^Mockup/, '') : stem),
      purpose: app?.purpose ?? null, notes: app?.notes ?? null,
      w: frame?.w ?? FRAMES.desktop.w, h: frame?.h ?? FRAMES.desktop.h,
      png: null, reason: null,
      // The caption says the brand is composited on the photograph, so ask the
      // artboard whether it is. `mockup build` refuses an artwork-less surface
      // now, but a file written before that, or by hand, can still be here.
      composited: mockup ? /data-artwork="yes"/.test(source) : null,
    };
    if (!chrome) {
      entry.reason = 'no headless browser on this machine';
    } else {
      const tmp = await mkdtemp(path.join(tmpdir(), 'brandi-book-'));
      try {
        // The preview is written to a scratch directory, so a photograph the
        // artboard references by a relative path (a mockup's, for one) is
        // resolved back to the canvas directory with a <base>.
        const base = `<base href="${pathToFileURL(canvasDir + path.sep).href}">`;
        const preview = toPreviewHtml(source, { width: entry.w, height: entry.h, label: file });
        const htmlPath = path.join(tmp, `${stem}.preview.html`);
        await writeFile(htmlPath, /<head[^>]*>/i.test(preview) ? preview.replace(/<head[^>]*>/i, (m) => `${m}${base}`) : `${base}${preview}`);
        // The frame is a minimum, not a crop: an artboard that runs past it is
        // rendered at its own scroll height, so the page shows it as drawn.
        entry.renderedH = Math.max(entry.h, await documentHeight(chrome, htmlPath, entry.w, entry.h));
        const pngPath = path.join(tmp, `${stem}.png`);
        await screenshot(chrome, htmlPath, pngPath, { width: entry.w, height: entry.renderedH });
        entry.png = `data:image/png;base64,${(await readFile(pngPath)).toString('base64')}`;
      } catch (e) {
        entry.reason = `the render failed: ${e.message}`;
      } finally {
        await rm(tmp, { recursive: true, force: true });
      }
    }
    out.push(entry);
  }
  return out;
}

async function cmdBook(flags) {
  const { file, brand, system } = await resolveSystem(flags);
  const dir = path.dirname(file);
  const assets = await loadLogoAssets(brand, dir);
  const print = Boolean(flags.print);
  let html;
  let pages;
  // The print book's <section class="page"> elements are sections that flow
  // over as many A4 sheets as they need, so its page count is only known once
  // a PDF exists. Until then the count is reported as sections.
  let sections = null;
  if (print) {
    html = renderBrandBook({ brand, system, assets });
    sections = (html.match(/<section class="page"/g) ?? []).length;
    pages = null;
  } else {
    const deck = renderBrandDeck({ brand, system, assets, artboards: await proofArtboards(brand, dir) });
    html = deck.html;
    pages = deck.pages.filter((p) => !p.absent).length;
  }
  const stem = print ? 'brand-book-print' : 'brand-book';
  const htmlPath = path.join(dir, `${stem}.html`);
  await writeFile(htmlPath, html);
  const written = [path.relative(process.cwd(), htmlPath)];
  const format = print ? 'print' : 'deck';

  let pdfPath = null;
  if (flags.pdf) {
    const chrome = findChrome();
    if (!chrome) {
      emit(`Wrote ${written.join(', ')}. No headless browser found, so no PDF.`, { ok: true, files: written, pdf: null, format, pages, sections });
      return;
    }
    pdfPath = path.join(dir, `${stem}.pdf`);
    try {
      await runChrome(chrome, pdfChromeArgs({ htmlUrl: pathToFileURL(htmlPath).href, pdfPath }), { timeout: 180000 });
      written.push(path.relative(process.cwd(), pdfPath));
      if (print) pages = ((await readFile(pdfPath, 'latin1')).match(/\/Type\s*\/Page(?![s])/g) ?? []).length;
    } catch (e) {
      emit(`Wrote ${written.join(', ')}. The PDF step failed: ${e.message}`, { ok: true, files: written, pdf: null, format, pages, sections });
      return;
    }
  }
  const named = (brand.identity?.logo?.files ?? []).length;
  const embedded = (brand.identity?.logo?.files ?? []).filter((f) => assets[typeof f === 'string' ? f : f?.path]).length;
  const count = pages != null ? plural(pages, 'page') : plural(sections, 'section');
  emit(
    `Wrote ${written.join('\n       ')}\n       ${count}, ${print ? 'A4 print book' : '1920x1080 deck'}.` +
      (named && embedded < named ? `\n\n${named - embedded} of ${named} logo files could not be embedded, so the logo chapter names them instead of showing them.` : '') +
      (print ? '' : '\nThe A4 print book is still available: brandi book --print.'),
    { ok: true, files: written, pdf: pdfPath, logosEmbedded: embedded, logosNamed: named, format, pages, sections },
  );
}

// ---------------------------------------------------------------------------
// fonts
// ---------------------------------------------------------------------------

/**
 * Confirm the chosen typefaces can actually be loaded.
 *
 * The canvas and every generated sheet load fonts from Google Fonts and nowhere
 * else. A licensed face like Söhne produces a 404, the browser silently falls
 * back, and the brand book renders in Georgia while the licences table proudly
 * names the foundry. Nothing anywhere reports it, which is exactly the kind of
 * quiet wrongness this project exists to refuse.
 */
async function cmdFonts(flags) {
  const { brand, system } = await resolveSystem(flags, { gate: false });
  const families = Object.entries(system.type.fonts).filter(([, v]) => v);
  if (!families.length) return emit('No typefaces chosen yet.', { ok: true, fonts: [] });

  const results = [];
  for (const [role, family] of families) {
    const name = Array.isArray(family) ? family[0] : family;
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(String(name).trim()).replace(/%20/g, '+')}:wght@400&display=swap`;
    let status = null;
    let error = null;
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(12000) });
      status = res.status;
    } catch (e) {
      error = e.message;
    }
    results.push({ role, family: name, onGoogleFonts: status === 200, status, error });
  }

  const missing = results.filter((r) => !r.onGoogleFonts && !r.error);
  const unknown = results.filter((r) => r.error);
  const lines = results.map((r) =>
    `  ${r.role.padEnd(8)} ${String(r.family).padEnd(28)} ${r.error ? `could not check (${r.error})` : r.onGoogleFonts ? 'available' : `NOT on Google Fonts (HTTP ${r.status})`}`,
  );
  if (missing.length) {
    lines.push('');
    lines.push(`${missing.map((r) => r.family).join(', ')} will not load on the design canvas or in the`);
    lines.push('generated sheets, and nothing will say so: the text simply renders in the fallback.');
    lines.push('Either choose a face Google Fonts serves, or embed it as a @font-face data: URI in');
    lines.push('the artboards and accept that the canvas is the only place it will be right.');
  }
  emit(lines.join('\n'), { ok: missing.length === 0, fonts: results, missing: missing.map((r) => r.family), uncheckable: unknown.map((r) => r.family) });
  if (missing.length) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// guardian
// ---------------------------------------------------------------------------

async function cmdGuardian(flags) {
  const { file, brand, system } = await resolveSystem(flags);
  const target = path.resolve(flags.out ?? path.join(process.env.HOME ?? '.', '.claude', 'skills', `${brand.meta.slug ?? 'brand'}-brand`));
  const written = await emitGuardianSkill({ brand, system, dir: target, brandFile: file });
  // The default location is Claude Code's. Codex reads ~/.agents/skills, so when
  // that exists the same emit is linked there too. An explicit --out is left
  // exactly where it was asked for.
  const codex = flags.out ? { linked: null, reason: '--out given' } : await linkForCodex(target);
  emit(
    [
      `Wrote the ${brand.meta.name ?? 'brand'} enforcement skill to ${target}`,
      ...written.map((w) => `  ${path.basename(w)}`),
      ...(codex.linked ? [`Linked it at ${codex.linked}, which is where Codex reads skills from.`] : []),
      ...(codex.reason && /already exists|could not link/.test(codex.reason) ? [`Not linked for Codex: ${codex.reason}.`] : []),
      '',
      `From now on, any Claude Code${codex.linked ? ' or Codex' : ''} session in a project that uses this brand can`,
      'load it and check its own work before shipping.',
    ].join('\n'),
    { ok: true, dir: target, files: written, linked: codex.linked, linkNote: codex.reason },
  );
}

async function cmdCheck(flags, positional) {
  const { brand, system } = await resolveSystem(flags);
  const targets = positional.length ? positional : ['.'];
  const result = await checkFiles({ brand, system, targets, root: process.cwd() });
  // Group before printing. Checking a large tree produced tens of thousands of
  // findings, and a report nobody can read is not a report: it is the exact
  // failure the guardian skill warns about, produced by the guardian itself.
  const byRule = {};
  const byFile = {};
  // Keyed by rule AND level: one rule can emit both (a recorded banned face
  // warns, a stray one errors), and "2 error banned-font" for one of each was
  // a summary that disagreed with its own findings list.
  for (const f of result.findings) {
    const key = `${f.rule}:${f.level}`;
    byRule[key] ??= { rule: f.rule, level: f.level, count: 0 };
    byRule[key].count++;
    byFile[f.file] = (byFile[f.file] ?? 0) + 1;
  }
  const rules = Object.values(byRule).sort((a, b) => b.count - a.count);
  const worstFiles = Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const limit = intFlag(flags, 'limit', 40);

  const lines = [`Checked ${plural(result.filesChecked, 'file')} against ${brand.meta.name ?? 'the brand'}.`];
  if (result.generatedSkipped?.length) {
    lines.push(`Skipped ${plural(result.generatedSkipped.length, 'file')} generated from the brand itself, which would only be checking its own arithmetic.`);
  }
  if (!result.findings.length) {
    lines.push('', 'Nothing off-brand found.');
  } else {
    lines.push('', `${plural(result.counts.error, 'error')}, ${plural(result.counts.warn, 'warning')}, ${plural(result.counts.info, 'note')}.`);
    lines.push('', 'By rule:', ...rules.map((r) => `  ${String(r.count).padStart(6)}  ${r.level.padEnd(5)} ${r.rule}`));
    if (result.findings.length > limit && worstFiles.length > 1) {
      lines.push('', 'Worst files:', ...worstFiles.map(([f, n]) => `  ${String(n).padStart(6)}  ${f}`));
    }
    lines.push('', result.findings.length > limit
      ? `The ${limit} most consequential, worst first. ${result.findings.length - limit} more; pass --limit to see further.`
      : 'Every finding, worst first:');
    for (const f of result.findings.slice(0, limit)) {
      lines.push('', `${f.level.toUpperCase()}  ${f.file}${f.line ? `:${f.line}` : ''}`);
      lines.push(`  ${f.message}`);
      if (f.fix) lines.push(`  ${f.fix}`);
    }
    if (result.findings.length > limit) {
      lines.push('', 'A count this large usually means the target is wider than the brand. Point it at the');
      lines.push('files that actually carry the brand rather than the whole tree, and fix by rule rather');
      lines.push('than by line.');
    }
  }

  emit(lines.join('\n'), { ...result, byRule: rules, worstFiles: worstFiles.map(([file, count]) => ({ file, count })) });
  if (result.findings.some((f) => f.level === 'error')) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// complete
// ---------------------------------------------------------------------------

async function cmdComplete(flags, positional) {
  const id = positional[0];
  if (!id) return fail(`usage: brandi complete <phase>. Phases: ${PHASES.map((p) => p.id).join(', ')}`);
  const { file, brand } = await needBrand(flags);
  let next;
  try {
    next = completePhase(brand, id);
  } catch (e) {
    return fail(e.message, { findings: e.findings });
  }
  if (flags.decision && flags.rationale) {
    addDecision(brand, { decision: String(flags.decision), rationale: String(flags.rationale) });
  }
  await saveBrand(file, brand);
  const done = PHASES.find((p) => p.id === id);
  const pending = PHASES.find((p) => !brand.brandi.completed.includes(p.id));
  emit(`${done.name} complete. Next: ${pending?.name ?? 'nothing, the system is published'}`, { ok: true, completed: id, phase: next });
}

// ---------------------------------------------------------------------------

const COMMANDS = {
  init: cmdInit,
  status: cmdStatus,
  scan: cmdScan,
  set: cmdSet,
  evidence: cmdEvidence,
  decision: cmdDecision,
  question: cmdQuestion,
  system: cmdSystem,
  tokens: cmdTokens,
  sheets: cmdSheets,
  validate: cmdValidate,
  canvas: cmdCanvas,
  book: cmdBook,
  fonts: cmdFonts,
  logo: cmdLogo,
  images: cmdImages,
  mockup: cmdMockup,
  assets: cmdAssets,
  handoff: cmdHandoff,
  guardian: cmdGuardian,
  check: cmdCheck,
  complete: cmdComplete,
};

async function main() {
  const argv = process.argv.slice(2);
  const { flags, positional, positionalAt } = parseArgs(argv);
  out.json = Boolean(flags.json);
  const [command, ...rest] = positional;
  if (!command || command === 'help' || flags.help) {
    // The whole header comment, not a fixed number of its lines: a count that
    // was right when it was written silently dropped the last three commands
    // added after it, and the drift test read the source rather than this.
    // `brandi logo --help` is the forge's question, not this file's, and
    // `brandi mockup --help` is the mockup's: a subcommand that asks for help
    // and gets the top-level help has not been answered.
    if (command === 'logo') return cmdLogo(flags, rest, ['--help']);
    if (command === 'mockup') return cmdMockup({ ...flags, help: true }, rest);
    const source = String(await readFile(fileURLToPath(import.meta.url)));
    // Drop the shebang and the comment opener by what they are, not by line
    // count: slicing a fixed number of lines printed `/**` as the first line.
    console.log(source.slice(0, source.indexOf(' */'))
      .split('\n')
      .filter((l) => !/^#!/.test(l) && !/^\/\*\*?\s*$/.test(l))
      .map((l) => l.replace(/^ \* ?/, ''))
      .join('\n')
      .trim());
    return;
  }
  const fn = COMMANDS[command];
  if (!fn) {
    return fail(`Unknown command "${command}". Try one of: ${Object.keys(COMMANDS).join(', ')}`);
  }
  // The logo forge parses its own arguments, so it gets the raw tail after the
  // command word, flags and all.
  const rawTail = positionalAt.length ? argv.slice(positionalAt[0] + 1) : [];
  await fn(flags, rest, rawTail);
}

main().catch((e) => {
  fail(e.message, { findings: e.findings });
});
