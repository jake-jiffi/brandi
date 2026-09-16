#!/usr/bin/env node
/**
 * Render `.dc.html` artboards to standalone HTML and PNG, so they can be looked
 * at before they are published.
 *
 * The canvas runtime is not available outside a published artifact, but an
 * artboard's content is ordinary HTML with inline styles, so a thin shim is
 * enough to see it: give the custom elements a display, drop the support.js
 * line the runtime would have replaced, and paint the frame at its real size.
 *
 * Screenshots go through headless Chrome, which is already on most machines, so
 * there is no browser dependency to install. Without Chrome the HTML preview
 * still works and can be opened by hand.
 *
 * Usage:
 *   node preview.mjs <file.dc.html> [--width 1200] [--height 2400] [--png false]
 *   node preview.mjs --dir <folder> --out <folder> [--png false]
 *
 * `--dir` is the fallback for a session with no /design canvas, so it has to
 * show the artboards as they are, not as a default guess: each one is rendered
 * at its own frame from canvas.json, and the preview carries a <base> pointing
 * back at the source directory so a relatively-referenced photograph resolves
 * instead of rendering as a broken-image icon.
 */

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const run = promisify(execFile);

/**
 * Where a headless-capable browser lives, on every machine this ships to.
 *
 * `CHROME_PATH` comes first so anyone with a browser somewhere unusual, or a
 * CI image with a pinned binary, can say so without editing the plugin.
 */
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
  '/snap/bin/chromium',
  // Windows, including the two Program Files locations that both get used
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : null,
].filter(Boolean);

/** Path to a headless-capable browser, or null. */
export function findChrome() {
  return CHROME_CANDIDATES.find((p) => existsSync(p)) ?? null;
}

/**
 * Turn artboard source into a standalone page.
 * Values a `{{hole}}` would supply are not available outside the runtime, so
 * they are shown as their binding, which is what the canvas editor does too.
 *
 * `base` is a directory URL. A preview written anywhere other than beside its
 * artboard resolves `src="laptop-desk.jpg"` against the preview's own
 * directory, where the photograph is not, so the page renders a broken-image
 * icon and says nothing about it. A <base> points those back at the source.
 */
export function toPreviewHtml(source, { width, height, label, base } = {}) {
  const shim = `
<style>
  x-dc { display: block; }
  helmet { display: none; }
  html, body { margin: 0; }
  ${width ? `body > x-dc { width: ${width}px; ${height ? `min-height: ${height}px;` : ''} overflow: hidden; }` : ''}
</style>`;
  let out = source.replace('<script src="./support.js"></script>', shim.trim());
  // The logic block is classic script referencing a class the runtime defines.
  out = out.replace(/<script data-dc-script[\s\S]*?<\/script>/g, '');
  if (label) {
    out = out.replace('<body>', `<body>\n<!-- preview of ${label} -->`);
  }
  // An artboard that sets its own base means it: the first base with an href
  // wins, so injecting ours ahead of it would silently redirect its images.
  if (base && !/<base\s[^>]*href=/i.test(out)) {
    const tag = `<base href="${base}">`;
    out = /<head[^>]*>/i.test(out) ? out.replace(/<head[^>]*>/i, (m) => `${m}${tag}`) : `${tag}${out}`;
  }
  return out;
}

/**
 * The size the artboard itself declares, through the `$preview` hint the canvas
 * puts in `data-props`. Second in line behind canvas.json, which is where a
 * frame is corrected, and ahead of any default.
 */
export function declaredFrame(source) {
  const attr = /data-props='([^']*)'/.exec(source);
  if (!attr) return null;
  let props;
  try {
    props = JSON.parse(attr[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  } catch {
    return null;
  }
  const w = Number(props?.$preview?.width);
  const h = Number(props?.$preview?.height);
  return Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0 ? { w, h } : null;
}

/**
 * Per-file frames from a canvas.json, keyed by file name. A directory with no
 * manifest, or an unreadable one, is not an error: the caller falls back.
 */
export async function manifestFrames(dir) {
  let manifest;
  try {
    manifest = JSON.parse(await readFile(path.join(dir, 'canvas.json'), 'utf8'));
  } catch {
    return new Map();
  }
  const out = new Map();
  for (const a of manifest?.artboards ?? []) {
    if (a && typeof a.file === 'string' && Number.isFinite(a.w) && Number.isFinite(a.h) && a.w > 0 && a.h > 0) {
      out.set(a.file, { w: a.w, h: a.h });
    }
  }
  return out;
}

/**
 * Run headless Chrome once, and once more if it dies.
 *
 * Under load (several headless browsers alive at once, which is what the test
 * suite and a busy machine both produce) a shot that takes 17 seconds alone
 * took 46 and was killed at the 45 second timeout. The timeout is now long
 * enough for a slow machine, and a process that is killed or crashes gets one
 * more go before the failure is reported.
 */
export async function runChrome(chrome, args, { timeout = 90000, retries = 1 } = {}) {
  let last;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await run(chrome, args, { timeout });
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

/** Screenshot a standalone HTML file at a fixed window size. */
export async function screenshot(chrome, htmlPath, pngPath, { width = 1200, height = 2400 } = {}) {
  // No `--user-data-dir`. On a machine where the user already has Chrome open,
  // a second instance asking for a profile contends for it whether that profile
  // is fresh or shared: measured at 2.2 seconds without one against 120 seconds
  // and up with. Web fonts still need the virtual time budget, so that stays.
  await runChrome(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=4000',
    `--window-size=${width},${height}`,
    `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ]);
}

async function mkdtempSafe() {
  const dir = path.join(os.tmpdir(), `brandi-preview-${process.pid}-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

/** Render one artboard to HTML, and to PNG when a browser is available. */
export async function previewArtboard(file, { outDir, width, height, png = true } = {}) {
  const source = await readFile(file, 'utf8');
  const stem = path.basename(file).replace(/\.dc\.html$/, '');
  const dir = outDir ?? path.dirname(file);
  await mkdir(dir, { recursive: true });
  const htmlPath = path.join(dir, `${stem}.preview.html`);
  const base = pathToFileURL(path.resolve(path.dirname(file)) + path.sep).href;
  await writeFile(htmlPath, toPreviewHtml(source, { width, height, label: path.basename(file), base }));

  let pngPath = null;
  const chrome = findChrome();
  if (png && chrome) {
    pngPath = path.join(dir, `${stem}.png`);
    await screenshot(chrome, htmlPath, pngPath, { width, height });
  }
  return { html: htmlPath, png: pngPath, chrome: Boolean(chrome) };
}

/**
 * The largest frame worth handing a browser, per axis.
 *
 * Frames now come from a file people edit by hand: the `sheets` message tells
 * them to "set the real size in canvas.json". A 1440 typed as 14400 used to be
 * harmless because the frame was ignored; it now asks Chrome for a bitmap it
 * will spend minutes on or fail outright, which is a bad way for the one
 * fallback a Codex session has to go wrong.
 */
export const MAX_FRAME = 20000;

export function clampFrame({ w, h }, label) {
  if (w <= MAX_FRAME && h <= MAX_FRAME) return { w, h };
  const out = { w: Math.min(w, MAX_FRAME), h: Math.min(h, MAX_FRAME) };
  // The frame can come from canvas.json or from the command line, so the note
  // names both rather than sending someone to the wrong one.
  console.error(
    `note: ${label} asks for ${w}x${h}, past the ${MAX_FRAME}px limit; rendering at ${out.w}x${out.h}. `
    + 'Check its frame in canvas.json, or the size you passed.',
  );
  return out;
}

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * One page listing every preview in the output directory.
 *
 * Without the canvas there is nothing that shows the set as a set: a Codex user
 * gets a directory of PNGs and has to open them one at a time, with no way to
 * tell which frame each was rendered at. Each tile is capped at 420px wide and
 * keeps its aspect ratio, so a 390x844 phone reads as a phone beside a
 * 1440x900 desktop instead of both arriving the same width.
 */
export function contactSheet(rendered, sourceDir) {
  const tiles = rendered.map((r) => {
    const shown = r.png
      ? `<img src="${escapeHtml(path.basename(r.png))}" alt="${escapeHtml(r.file)} at ${r.w}x${r.h}" width="${r.w}" height="${r.h}">`
      : r.reason
        ? `<p class="none">This one did not render: ${escapeHtml(r.reason)}</p>`
        : '<p class="none">No PNG for this one. Open the HTML preview instead.</p>';
    // A caption that links nowhere beats one that links to a file that was
    // never written.
    const name = r.html
      ? `<a href="${escapeHtml(path.basename(r.html))}">${escapeHtml(r.file)}</a>`
      : escapeHtml(r.file);
    return `  <figure>
    ${shown}
    <figcaption>${name} <span>${r.w}&times;${r.h}</span></figcaption>
  </figure>`;
  });
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Artboard previews</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; padding: 32px; font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p.where { margin: 0 0 32px; opacity: 0.7; }
  .sheet { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }
  /* flex-basis rather than a width, so a tile shrinks on a narrow window
     instead of pushing the page sideways. */
  figure { margin: 0; flex: 0 1 420px; min-width: 0; }
  img { display: block; width: auto; height: auto; max-width: 100%; border: 1px solid rgba(128,128,128,0.4); }
  figcaption { margin-top: 8px; font-size: 13px; }
  figcaption span { opacity: 0.6; }
  p.none { opacity: 0.7; }
</style>
</head>
<body>
<h1>${rendered.length} artboard${rendered.length === 1 ? '' : 's'}</h1>
<p class="where">Rendered from ${escapeHtml(sourceDir)}. Each is shown at its own frame.</p>
<div class="sheet">
${tiles.join('\n')}
</div>
</body>
</html>
`;
}

async function main(argv) {
  const args = new Map();
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args.set(argv[i].slice(2), argv[i + 1]?.startsWith('--') ? true : argv[++i]);
    else positional.push(argv[i]);
  }

  // A flag with no value parses as `true`, and Number(true) is 1, so
  // `--width --png false` asked for a one-pixel frame and got one in silence.
  // A size only counts when the flag actually carries one.
  const size = (k, fallback) => {
    const v = args.get(k);
    const n = typeof v === 'string' ? Number(v) : NaN;
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const given = (k) => size(k, 0) > 0;
  const width = size('width', 1200);
  const height = size('height', 2400);
  const wantPng = args.get('png') !== 'false';

  if (args.has('dir')) {
    const dir = args.get('dir');
    const out = args.get('out') ?? path.join(dir, '_preview');
    const files = (await readdir(dir)).filter((f) => f.endsWith('.dc.html')).sort();
    if (!files.length) {
      console.error(`no .dc.html files in ${dir}`);
      process.exit(1);
    }
    // A frame given on the command line is a deliberate override and wins.
    // Otherwise every artboard is rendered at its own size: canvas.json is the
    // record that gets corrected, the artboard's own $preview hint is next, and
    // the 1200x2400 default is the last resort rather than the only answer.
    const frames = await manifestFrames(dir);
    const override = given('width') || given('height');
    const rendered = [];
    for (const f of files) {
      const file = path.join(dir, f);
      // One artboard that will not render must not cost the other eleven.
      // Every frame now comes from a file someone can edit, so a single bad
      // entry used to take the whole set down with it. Reading the artboard to
      // find its declared size is part of that, so it sits inside the guard.
      let frame = { w: width, h: height };
      try {
        frame = clampFrame(override
          ? { w: width, h: height }
          : frames.get(f) ?? declaredFrame(await readFile(file, 'utf8')) ?? { w: width, h: height }, f);
        const res = await previewArtboard(file, { outDir: out, width: frame.w, height: frame.h, png: wantPng });
        rendered.push({ file: f, ...frame, ...res });
        console.log(`${f.padEnd(28)} ${`${frame.w}x${frame.h}`.padEnd(11)} ${res.png ?? res.html}`);
      } catch (e) {
        rendered.push({ file: f, ...frame, png: null, html: null, reason: e.message });
        console.log(`${f.padEnd(28)} ${`${frame.w}x${frame.h}`.padEnd(11)} FAILED: ${e.message}`);
      }
    }
    const index = path.join(out, 'index.html');
    await writeFile(index, contactSheet(rendered, dir));
    console.log(`\n${rendered.length} artboard${rendered.length === 1 ? '' : 's'}. Open them all at once:\n  ${index}`);
    if (wantPng && !findChrome()) console.error('note: no headless browser found, wrote HTML previews only');
    const failed = rendered.filter((r) => r.reason);
    if (failed.length) {
      // Exit 1: the set is incomplete, and saying so beats reporting a clean
      // run over a directory that is missing artboards.
      console.error(`${failed.length} of ${rendered.length} did not render: ${failed.map((r) => r.file).join(', ')}`);
      process.exit(1);
    }
    return;
  }

  if (!positional.length) {
    console.error('usage: preview.mjs <file.dc.html> [--width N] [--height N] [--png false]  |  --dir <folder> [--out <folder>] [--png false]');
    process.exit(1);
  }
  const res = await previewArtboard(positional[0], {
    outDir: args.get('out'),
    width,
    height,
    png: args.get('png') !== 'false',
  });
  console.log(res.png ?? res.html);
  if (!res.chrome) console.error('note: no headless browser found, wrote HTML preview only');
}

// Compare resolved paths rather than string-building a file:// URL, which
// breaks on any path containing a space.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

export default {
  toPreviewHtml, previewArtboard, screenshot, findChrome, runChrome,
  declaredFrame, manifestFrames, contactSheet, clampFrame, MAX_FRAME,
};
