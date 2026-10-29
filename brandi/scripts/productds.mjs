/**
 * Brandi product layer: the Design System artifact, assembled for publishing.
 *
 * Writes the folder an Artifact publish sends (project/...) and prints the calls, the way
 * `brandi canvas` does for a canvas: the written system, tokens.json, every component card, the
 * bundle, the type file, the fonts, the starter, a cover, and design-system.json written last. The
 * Design System type refuses some paths (package.json, tsconfig.json and dot-files at any depth, the
 * type's own files) and generates others itself (tokens.css, manifest.json, api/), so those never go.
 * Pictures under assets/ are uploads the index names: the command lists them, and a second run with
 * the upload results writes their records.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { textureMove } from './producttokens.mjs';

const REFUSED = /(^|\/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|bunfig\.toml|tsconfig\.json|deno\.json|CLAUDE\.md|AGENTS\.md)$/;
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', '.turbo', '.git']);
const RENAME = { 'package.json': 'package.json.txt', 'tsconfig.json': 'tsconfig.json.txt' };
const CALL_PATHS = 250;
const CALL_BYTES = 15 * 1024 * 1024;
// The publish infers a type from the extension, and has none for these: each goes as text/plain, through `files`,
// because a call's file_path carries no type. Four calls were rewritten by hand, 189 files, before this.
const PLAIN_TEXT = /\.(ts|tsx|mts|cts|py)$/i;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Every file of the starter the type will take, with the two manifests renamed so they survive. */
export function starterFiles(starter) {
  const out = [];
  const walk = (dir, rel) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name) || entry.name.endsWith('.tsbuildinfo') || entry.name === 'next-env.d.ts') continue;
      if (entry.isSymbolicLink()) continue;
      const from = path.join(dir, entry.name);
      const to = rel ? `${rel}/${entry.name}` : entry.name;
      // canvas/dist and canvas/previews are build output: the bundle and its rendered previews.
      if (entry.isDirectory()) { if (!(rel === 'canvas' && (entry.name === 'dist' || entry.name === 'previews'))) walk(from, to); continue; }
      const name = RENAME[entry.name] ?? entry.name;
      const target = rel ? `${rel}/${name}` : name;
      if (REFUSED.test(target)) continue;
      out.push({ from, to: target });
    }
  };
  walk(starter, '');
  return out;
}

/**
 * A cover from the tokens: identity colour blocks, one pattern picked from the radius scale, and the
 * name in the display face. A sound first cover; the person can ask for another.
 */
export function coverPage(tokens, system, { tagline } = {}) {
  const has = (n) => tokens.color.tokens.some((t) => t.name === n);
  const blocks = ['brand', has('highlight') ? 'highlight' : null, has('rail') ? 'rail' : 'text-strong', has('selected') ? 'selected' : 'surface-sunken', has('series-2') ? 'series-2' : null].filter(Boolean);
  const radius = (tokens.radius?.tokens ?? []).find((t) => t.name === 'radius-control')?.value ?? '8px';
  const soft = /9999|999px|50%/.test(radius) || Number.parseFloat(radius) >= 12;
  const name = system.name;
  const longest = Math.max(...name.split(/(?<=[ -])/).map((w) => w.length), name.length > 16 ? Math.ceil(name.length / 2) : name.length);
  const size = Math.max(64, Math.min(120, Math.floor(440 / (longest * 0.6))));
  const lines = longest < name.length ? name.split(' ').reduce((acc, w) => { const last = acc.at(-1); if (last && (last + ' ' + w).length <= longest) acc[acc.length - 1] = `${last} ${w}`; else acc.push(w); return acc; }, []) : [name];
  const pattern = soft
    ? Array.from({ length: 18 }, (_, i) => `<circle class="dot c${i % 2 ? 1 : 3}" cx="${552 + (i % 6) * 64}" cy="${36 + Math.floor(i / 6) * 64}" r="12"></circle>`).join('')
    : Array.from({ length: 16 }, (_, i) => `<rect class="tile c${i % 3 === 0 ? 1 : 3}" x="${560 + (i % 8) * 48}" y="${200 + Math.floor(i / 8) * 40}" width="${i % 5 === 0 ? 88 : 40}" height="32"></rect>`).join('');
  const derivation = [
    `blocks: ${blocks.map((b, i) => `${b} ${['320x208', '144x144', '144x96', '96x96', '96x64'][i]}`).join(', ')}`,
    'arrangement: one tall slab with satellites, right of x = 480',
    `pattern: ${soft ? 'discs on a 64px pitch, because pressable things are pills here (radius-control)' : 'tiles cut by radius-sm on a 48px pitch, because the system is modular and square-cornered'}`,
    `steps and radii: spacing 16, 32 and 64px; ${soft ? 'pill' : 'radius-sm and radius-md'}`,
  ];
  const css = [
    ...blocks.map((b, i) => `.c${i}{fill:var(--${b})}`),
    '.slab{rx:var(--radius-lg)}', '.sat{rx:var(--radius-md)}', '.tile{rx:var(--radius-sm)}',
    '.name{margin:0;font-family:var(--font-display);font-weight:400;color:var(--text-strong);letter-spacing:-0.01em}',
    '.tag{margin:8px 0 0;font-family:var(--font-sans);font-size:14px;line-height:20px;color:var(--text-muted)}',
  ].join('');
  const svg = [
    '<svg width="960" height="288" viewBox="0 0 960 288" aria-hidden="true" style="position:absolute;inset:0">',
    `<!--\n  ${derivation.join('\n  ')}\n-->`.replace(/--(?!>)/g, '-'),
    `<rect class="c0 slab" x="608" y="40" width="320" height="208"></rect>`,
    blocks[1] ? `<rect class="c1 sat" x="496" y="40" width="96" height="96"></rect>` : '',
    `<rect class="c2 sat" x="496" y="152" width="96" height="96"></rect>`,
    blocks[3] ? `<rect class="c3 sat" x="880" y="0" width="80" height="24"></rect>` : '',
    pattern,
    '</svg>',
  ].join('');
  const tag = tagline ?? `The product system every ${name} product is built from.`;
  return [
    '<!-- @dsCard height=288 -->',
    '<!doctype html>',
    `<html lang="${system.lang ?? 'en'}">`,
    '<head><meta charset="utf-8"><title>Cover</title></head>',
    `<body style="margin:0"><div style="position:relative;width:960px;height:288px;overflow:hidden;background:var(--canvas)"><style>${css}</style>${svg}`,
    `<div style="position:absolute;left:40px;bottom:40px;max-width:440px"><h1 class="name" style="font-size:${size}px;line-height:${lines.length > 1 ? 0.95 : 0.92}">${lines.map(esc).join('<br>')}</h1><p class="tag">${esc(tag)}</p></div>`,
    '</div></body>',
    '</html>',
    '',
  ].join('\n');
}

/** design-system.json: a new index, or the live one with only Brandi's keys changed. */
export function designSystemIndex({ live = null, system, title, by = 'Claude', note, now = new Date(), assetGroups = {} }) {
  const prev = live && typeof live === 'object' ? structuredClone(live) : null;
  const index = prev ?? {
    v: 3,
    layout: 'files',
    createdOnFiles: { v: 1, at: now.toISOString() },
    title,
    namespace: system.global,
    libraries: [],
    sections: {},
    groups: [],
    assetGroups: {},
    blobs: {},
    docs: { readme: 'project/README.md', sections: [] },
  };
  index.namespace = system.global;
  index.libraries = [{ name: 'react', version: '18' }, { name: 'react-dom', version: '18' }];
  // A live index from a system with no picture groups yet may carry no list of them.
  if (!Array.isArray(index.groups)) index.groups = [];
  for (const [group, entry] of Object.entries(assetGroups)) {
    const was = index.assetGroups?.[group] ?? { name: group, tile: 'm', order: [], files: {} };
    index.assetGroups = { ...index.assetGroups, [group]: { ...was, ...entry, files: { ...was.files, ...entry.files }, order: [...new Set([...(was.order ?? []), ...(entry.order ?? [])])] } };
    if (!index.groups.includes(group)) index.groups.push(group);
  }
  index.lastChange = { by, at: now.toISOString(), via: 'Claude Code · brandi product ds', note: note ?? `Published ${system.name} ${system.version}` };
  return index;
}

const assetKey = (name) => name.replace(/[^A-Za-z0-9_./-]/g, (c) => `~${c.charCodeAt(0).toString(16).padStart(2, '0')}`);

/**
 * Write the publish folder and return the calls. `blobs` maps an asset path ("Logos/mark.svg") to
 * the upload result ({ id, size, type }), from uploading each listed picture with asset: true.
 */
export function assembleDesignSystem({ productDir, starter, outDir, title, live = null, blobs = {}, by, tagline, all = false }) {
  const system = JSON.parse(readFileSync(path.join(starter, 'system', 'system.json'), 'utf8'));
  const tokens = JSON.parse(readFileSync(path.join(productDir, 'tokens.json'), 'utf8'));
  const docs = path.join(productDir, 'docs');
  if (!existsSync(path.join(docs, 'README.md'))) throw new Error('No product/docs/README.md. Write the README and the sections first (04-written-system.md): they are the brand book the Design System opens on.');
  const project = path.join(outDir, 'project');
  // What the last staging held, file by file, so a republish against the live index sends only what changed.
  const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
  const before = new Map();
  if (existsSync(project)) {
    for (const rel of readdirSync(project, { recursive: true })) {
      const file = path.join(project, rel);
      if (rel !== 'design-system.json' && statSync(file).isFile()) before.set(rel.split(path.sep).join('/'), sha(file));
    }
  }
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(project, { recursive: true });
  const files = [];
  const put = (rel, content) => {
    const file = path.join(project, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    if (Buffer.isBuffer(content) || typeof content === 'string') writeFileSync(file, content);
    else cpSync(content.from, file);
    files.push(rel);
  };
  // The written system: README first, then the sections in reading order.
  for (const f of readdirSync(docs).filter((x) => x.endsWith('.md')).sort()) put(f, readFileSync(path.join(docs, f), 'utf8'));
  put('tokens.json', `${JSON.stringify(tokens, null, 2)}\n`);
  const comps = path.join(productDir, 'components');
  for (const f of ['bundle.js', 'bundle.css', 'index.d.ts']) put(`components/${f}`, readFileSync(path.join(comps, f)));
  for (const d of readdirSync(comps, { withFileTypes: true }).filter((x) => x.isDirectory() && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(x.name) && x.name !== 'previews')) {
    for (const f of ['README.md', 'preview.html']) if (existsSync(path.join(comps, d.name, f))) put(`components/${d.name}/${f}`, readFileSync(path.join(comps, d.name, f)));
  }
  put('components/Cover/preview.html', coverPage(tokens, system, { tagline }));
  for (const font of tokens.type?.fonts ?? []) {
    const from = path.join(productDir, 'fonts', path.basename(font.file));
    if (existsSync(from)) put(`fonts/${path.basename(font.file)}`, { from });
  }
  // The texture move's file, beside the fonts at the path tokens.css names it by, so a canvas can install it.
  const texture = textureMove(tokens);
  if (texture && existsSync(path.join(productDir, texture.file))) put(texture.file, { from: path.join(productDir, texture.file) });
  for (const f of starterFiles(starter)) put(`starter/${f.to}`, { from: f.from });

  // Pictures go to the asset store; their group READMEs are files.
  const uploads = [];
  const assets = path.join(productDir, 'assets');
  const assetGroups = {};
  if (existsSync(assets)) {
    for (const group of readdirSync(assets, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const order = [];
      const records = {};
      for (const f of readdirSync(path.join(assets, group.name)).sort()) {
        const from = path.join(assets, group.name, f);
        if (/\.md$/i.test(f)) { put(`assets/${group.name}/${f}`, { from }); continue; }
        if (!/\.(png|jpe?g|gif|webp|svg|mp4|webm|pdf)$/i.test(f)) continue;
        const key = `${group.name}/${f}`;
        order.push(f);
        if (blobs[key]) records[assetKey(f)] = { name: f, blob: blobs[key].id, size: blobs[key].size ?? statSync(from).size, type: blobs[key].type };
        else uploads.push({ group: group.name, file: f, path: from });
      }
      assetGroups[group.name] = { name: group.name, tile: 'm', order, files: records };
    }
  }
  const index = designSystemIndex({ live, system, title, by, assetGroups });
  writeFileSync(path.join(project, 'design-system.json'), `${JSON.stringify(index, null, 2)}\n`);

  // A republish (the live index given) sends what changed since the last staging, and null for what went: the type
  // keeps every file it is not sent. 56 of 541 files changed in one round. `all` sends everything.
  const republish = Boolean(live) && before.size > 0 && !all;
  const unchanged = republish ? files.filter((rel) => before.get(rel) === sha(path.join(project, rel))) : [];
  const gone = republish ? [...before.keys()].filter((rel) => !files.includes(rel)) : [];

  // Calls: up to 250 paths and 15 MB each, the index alone in the last.
  const calls = [];
  let current = null;
  for (const rel of files.filter((r) => !unchanged.includes(r))) {
    const bytes = statSync(path.join(project, rel)).size;
    // One path short of the limit, so a call can still take the plain file it may borrow below.
    if (!current || current.files.length >= CALL_PATHS - 1 || current.bytes + bytes > CALL_BYTES) { current = { files: [], bytes: 0 }; calls.push(current); }
    current.files.push(rel);
    current.bytes += bytes;
  }
  // A call leads with a file whose type the extension gives. One made only of typed-as-text files borrows a
  // plain one from an earlier call that has two.
  for (const c of calls) {
    if (c.files.some((f) => !PLAIN_TEXT.test(f))) continue;
    const donor = calls.find((d) => d !== c && d.files.filter((f) => !PLAIN_TEXT.test(f)).length > 1);
    if (!donor) throw new Error(`A publish call holds only TypeScript or Python files (${c.files[0]} and others), and no other call has a file to lead it.`);
    const size = (f) => statSync(path.join(project, f)).size;
    const lent = donor.files.filter((f) => !PLAIN_TEXT.test(f)).sort((a, b) => size(a) - size(b))[0];
    donor.files.splice(donor.files.indexOf(lent), 1);
    c.files.unshift(lent);
  }
  const dataCalls = calls.length;
  calls.push({ files: ['design-system.json'], bytes: 0, index: true });
  const publishCalls = calls.map((c, i) => {
    const first = c.files.find((f) => !PLAIN_TEXT.test(f));
    const rest = c.files.filter((f) => f !== first);
    const map = Object.fromEntries(rest.map((r) => [`project/${r}`, PLAIN_TEXT.test(r) ? { from: `project/${r}`, contentType: 'text/plain' } : `project/${r}`]));
    // What went rides with the last call that carries files, or with the index when nothing else changed.
    if (gone.length && i === Math.max(dataCalls - 1, 0) && (dataCalls > 0 || c.index)) for (const r of gone) map[`project/${r}`] = null;
    return { root: outDir, file_path: path.join(project, first), files: map };
  });
  return { system, files, calls: publishCalls, uploads, index, unchanged, gone };
}

export default { assembleDesignSystem, designSystemIndex, coverPage, starterFiles };
