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
 *   node preview.mjs <file.dc.html> [--width 1200] [--height 2400] [--png out.png]
 *   node preview.mjs --dir <folder> --out <folder>   render every artboard
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
 */
export function toPreviewHtml(source, { width, height, label } = {}) {
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
  return out;
}

async function screenshot(chrome, htmlPath, pngPath, { width = 1200, height = 2400 } = {}) {
  // No `--user-data-dir`. On a machine where the user already has Chrome open,
  // a second instance asking for a profile contends for it whether that profile
  // is fresh or shared: measured at 2.2 seconds without one against 120 seconds
  // and up with. Web fonts still need the virtual time budget, so that stays.
  await run(chrome, [
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
  ], { timeout: 45000 });
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
  await writeFile(htmlPath, toPreviewHtml(source, { width, height, label: path.basename(file) }));

  let pngPath = null;
  const chrome = findChrome();
  if (png && chrome) {
    pngPath = path.join(dir, `${stem}.png`);
    await screenshot(chrome, htmlPath, pngPath, { width, height });
  }
  return { html: htmlPath, png: pngPath, chrome: Boolean(chrome) };
}

async function main(argv) {
  const args = new Map();
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args.set(argv[i].slice(2), argv[i + 1]?.startsWith('--') ? true : argv[++i]);
    else positional.push(argv[i]);
  }

  const width = Number(args.get('width') ?? 1200);
  const height = Number(args.get('height') ?? 2400);

  if (args.has('dir')) {
    const dir = args.get('dir');
    const out = args.get('out') ?? path.join(dir, '_preview');
    const files = (await readdir(dir)).filter((f) => f.endsWith('.dc.html'));
    if (!files.length) {
      console.error(`no .dc.html files in ${dir}`);
      process.exit(1);
    }
    for (const f of files) {
      const res = await previewArtboard(path.join(dir, f), { outDir: out, width, height });
      console.log(`${f} -> ${res.png ?? res.html}`);
    }
    if (!findChrome()) console.error('note: no headless browser found, wrote HTML previews only');
    return;
  }

  if (!positional.length) {
    console.error('usage: preview.mjs <file.dc.html> [--width N] [--height N]  |  --dir <folder> [--out <folder>]');
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

export default { toPreviewHtml, previewArtboard, findChrome };
