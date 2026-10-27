/**
 * Brandi product layer: the drift check, canvas against system against code.
 *
 * Run every round, before the reviewers start. Each difference is reported with both values and where
 * each lives, so it is fixed at the source (the tokens, the component definition, the pattern) and
 * never by patching a copy. The check passes only when the report is empty.
 *
 * Screens drawn on the canvas against the pattern definitions and the starter's routes need a person's
 * eye; the report says so rather than passing them in silence.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { toStarterGlobals } from './productglobals.mjs';
import { toProductCss } from './producttokens.mjs';
import { loadDefinitions } from './productdocs.mjs';
import { declaredFrame } from './preview.mjs';

const sum = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const rel = (root, file) => path.relative(root, file) || '.';
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
// Props every mounted component takes whatever its definition says: children, the slot's style, and the
// attributes React passes to the element.
const ALWAYS = new Set(['children', 'style', 'className', 'class', 'id', 'key', 'title', 'role', 'tabIndex']);

/** Run the check. Returns { differences, unchecked } where each difference is { area, where, found, expected }. */
export async function driftCheck({ productDir, starter }) {
  const differences = [];
  const add = (area, where, found, expected) => differences.push({ area, where, found, expected });
  const tokensFile = path.join(productDir, 'tokens.json');
  const tokens = JSON.parse(readFileSync(tokensFile, 'utf8'));
  const system = existsSync(path.join(starter, 'system', 'system.json')) ? JSON.parse(readFileSync(path.join(starter, 'system', 'system.json'), 'utf8')) : null;
  const ns = system?.namespace;

  // Token values copied into the canvas and the starter.
  const canvas = path.join(productDir, 'canvas');
  const ds = ns ? path.join(canvas, 'ds', ns) : null;
  if (ds && existsSync(path.join(ds, 'tokens.json'))) {
    const copy = JSON.parse(readFileSync(path.join(ds, 'tokens.json'), 'utf8'));
    const want = new Map(tokens.color.tokens.map((t) => [t.name, JSON.stringify(t.value)]));
    for (const t of copy.color?.tokens ?? []) {
      if (!want.has(t.name)) add('token', `${rel(productDir, ds)}/tokens.json ${t.name}`, JSON.stringify(t.value), 'no such role in product/tokens.json');
      else if (want.get(t.name) !== JSON.stringify(t.value)) add('token', `${rel(productDir, ds)}/tokens.json ${t.name} ${JSON.stringify(t.value)}`, '', `product/tokens.json ${t.name} ${want.get(t.name)}`);
    }
    for (const name of want.keys()) if (!(copy.color?.tokens ?? []).some((t) => t.name === name)) add('token', `${rel(productDir, ds)}/tokens.json`, `no ${name}`, `product/tokens.json has ${name}`);
  }
  if (ds && existsSync(path.join(ds, 'tokens.css')) && readFileSync(path.join(ds, 'tokens.css'), 'utf8') !== toProductCss(tokens)) {
    add('token', `${rel(productDir, ds)}/tokens.css`, 'differs from what product/tokens.json writes', 'regenerate with brandi product tokens, then reinstall');
  }
  const starterTokens = path.join(starter, 'system', 'tokens.json');
  if (existsSync(starterTokens) && sum(starterTokens) !== createHash('sha256').update(`${JSON.stringify(tokens, null, 2)}\n`).digest('hex')
    && JSON.stringify(JSON.parse(readFileSync(starterTokens, 'utf8'))) !== JSON.stringify(tokens)) {
    add('token', `${rel(productDir, starterTokens)}`, 'differs from product/tokens.json', 'brandi product starter rewrites it');
  }
  const globals = path.join(starter, 'app', 'globals.css');
  if (existsSync(globals) && readFileSync(globals, 'utf8') !== toStarterGlobals(tokens)) {
    add('globals', rel(productDir, globals), 'differs from what the tokens produce (a hand edit, or tokens that moved)', 'node tools/build-globals.mjs system/tokens.json app/globals.css');
  }

  // Copies of the bundle and its CSS, by checksum.
  const copies = [path.join(productDir, 'components'), path.join(starter, 'canvas', 'dist'), ds && path.join(ds, 'components'), path.join(productDir, 'components', 'previews', 'ds', ns ?? '', 'components')].filter((d) => d && existsSync(path.join(d, 'bundle.js')));
  for (const f of ['bundle.js', 'bundle.css']) {
    const sums = copies.filter((d) => existsSync(path.join(d, f))).map((d) => [d, sum(path.join(d, f))]);
    const [first] = sums;
    for (const [d, s] of sums.slice(1)) if (first && s !== first[1]) add('bundle', `${rel(productDir, path.join(d, f))} ${s.slice(0, 12)}`, '', `${rel(productDir, path.join(first[0], f))} ${first[1].slice(0, 12)}`);
  }

  // Components on boards, and their props, against the manifest and the definitions.
  const manifestFile = path.join(productDir, 'components', 'manifest.json');
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : null;
  const defs = existsSync(path.join(starter, 'components', 'system')) ? await loadDefinitions(path.join(starter, 'components', 'system')) : [];
  const propsOf = new Map(defs.map((d) => [d.name, new Set(d.props.map((p) => p.name))]));
  propsOf.set('Root', new Set(['theme', 'background', 'shortcuts']));
  const boards = existsSync(canvas) ? readdirSync(canvas).filter((f) => f.endsWith('.dc.html')).sort() : [];
  let canvasManifest = null;
  try { canvasManifest = JSON.parse(readFileSync(path.join(canvas, 'canvas.json'), 'utf8')); } catch { /* none yet */ }
  for (const f of boards) {
    const src = readFileSync(path.join(canvas, f), 'utf8');
    for (const m of src.matchAll(/<x-import\b([^>]*)>/g)) {
      const attrs = m[1];
      const target = /component-from-global-scope="([^"]+)"/.exec(attrs)?.[1];
      if (!target || !system) continue;
      const [global, name] = target.split('.');
      if (global !== system.global) { add('prop', f, target, `the system's namespace is ${system.global}`); continue; }
      if (manifest && !manifest.exports.includes(name)) { add('prop', f, target, `the manifest has no ${name}`); continue; }
      const known = propsOf.get(name);
      if (!known) continue;
      for (const a of attrs.matchAll(/\s([a-z][a-z0-9-]*)=/g)) {
        const attr = a[1];
        if (attr === 'component-from-global-scope' || attr.startsWith('aria-') || attr.startsWith('data-')) continue;
        const prop = camel(attr);
        if (!known.has(prop) && !ALWAYS.has(prop)) add('prop', f, `${target} ${attr}=`, `the definition has no ${prop}`);
      }
    }
    // Board sizes: canvas.json against the board's own $preview.
    const entry = canvasManifest?.artboards?.find((a) => a.file === f);
    const declared = declaredFrame(src);
    if (entry && declared && (entry.w !== declared.w || entry.h !== declared.h)) add('size', f, `canvas.json ${entry.w}x${entry.h}`, `$preview ${declared.w}x${declared.h}`);
    // Raw values typed into a board where a token exists.
    const markup = src.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<helmet>[\s\S]*?<\/helmet>/g, '');
    for (const m of markup.matchAll(/style="([^"]*)"/g)) {
      for (const raw of m[1].match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g) ?? []) add('raw', f, raw, 'a colour role through var(--<role>)');
    }
    if (f.startsWith('_probe')) add('publish', f, 'a probe board in the canvas folder', 'probe boards stay out of the canvas folder: every .dc.html there shows on the canvas');
  }
  if (existsSync(path.join(canvas, 'support.js'))) add('publish', 'support.js', 'the local runtime shim in the canvas folder', 'keep it out: the canvas supplies its own runtime');

  // Components in the starter against the catalogue.
  const sysDir = path.join(starter, 'components', 'system');
  if (existsSync(sysDir)) {
    const exported = new Set();
    // Root, the board provider, lives with the canvas build rather than in components/system.
    const canvasDir = path.join(starter, 'canvas');
    const sourcesOf = (dir) => (existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith('.tsx') && x !== 'entry.tsx').map((x) => path.join(dir, x)) : []);
    for (const file of [...sourcesOf(sysDir), ...sourcesOf(canvasDir)]) {
      for (const m of readFileSync(file, 'utf8').matchAll(/^export (?:const|function) ([A-Z]\w*)/gm)) exported.add(m[1]);
    }
    const carded = new Set(defs.map((d) => d.name));
    for (const name of [...exported].sort()) if (!carded.has(name) && !defs.some((d) => (d.parts ?? []).includes(name))) add('catalogue', `components/system: ${name}`, 'has no card (definition)', 'a definition beside it, or fold it into a component that has one');
    for (const name of [...carded].sort()) if (!exported.has(name)) add('catalogue', `${name}.def.mjs`, 'a card with no component', `components/system exports no ${name}`);
  }
  return { differences, unchecked: ['Screens on the canvas against the pattern definitions and the starter\'s routes: compare them by eye, page by page, and record the result.'] };
}

/** The report, one line per difference, in a shape a person can scan. */
export function driftReport({ differences, unchecked }) {
  const lines = [`drift: ${differences.length} difference${differences.length === 1 ? '' : 's'}, gate ${differences.length ? 'failed' : 'passed'}`];
  for (const d of differences) lines.push(`  ${d.area.padEnd(9)} ${d.where}${d.found ? `  ${d.found}` : ''}  ${d.expected}`);
  for (const u of unchecked) lines.push(`  not checked automatically: ${u}`);
  return lines.join('\n');
}

export default { driftCheck, driftReport };
