/**
 * The asset pack: the files a printer, a developer and a social manager can
 * each take away on day one.
 *
 * Until this existed the system could only record paths to files somebody else
 * had made. `scan` read assets in and nothing wrote assets out, so the logo
 * chapter could be a list of filenames for files that existed nowhere, and the
 * favicon field pointed at a file that was never produced. Every one of those
 * people is blocked by that, and none of them can be unblocked by more prose.
 *
 * Everything here derives from ONE master SVG. Nothing is invented: there is no
 * mark generation, and the one honest answer to "there is no logo" is still the
 * typeset wordmark and a brief for whoever draws the real one. What this does
 * is take a mark that exists and produce every form of it that a real handover
 * contains.
 *
 * Rasterising uses the headless Chrome that already renders the PDF, so this
 * adds no dependency. The ICO is assembled by hand, because the format is a
 * small header wrapping PNGs and pulling in a library to write forty bytes of
 * struct would be the only dependency in the project.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import { findChrome } from './preview.mjs';
import { bestTextOn } from './color.mjs';

const run = promisify(execFile);

/**
 * What a handover actually contains, and why each one is there.
 *
 * These are not arbitrary sizes. 16 and 32 are the favicon pair a browser asks
 * for; 180 is what iOS wants for a home-screen icon; 192 and 512 are the PWA
 * manifest pair, and 512 is the one that gets masked, so it needs the safe
 * zone. 400 is a usable social avatar and 1200 is the open-graph width.
 */
export const RASTER_SIZES = Object.freeze([
  { px: 16, name: 'favicon-16', why: 'The browser tab, where only the silhouette survives.' },
  { px: 32, name: 'favicon-32', why: 'The other size a browser asks for, and the one most people see.' },
  { px: 180, name: 'apple-touch-icon', why: 'The iOS home screen. Square, no transparency, iOS rounds it itself.' },
  { px: 192, name: 'icon-192', why: 'The web app manifest.' },
  { px: 512, name: 'icon-512', why: 'The manifest again, and the one that gets masked.' },
  { px: 400, name: 'avatar-400', why: 'Social profiles, which crop to a circle.' },
  { px: 1200, name: 'social-1200', why: 'Open Graph and Twitter cards.' },
]);

/**
 * A maskable icon is cropped to a circle by some launchers and to a squircle by
 * others, so the mark has to survive a circle inscribed in the middle 80%.
 * Anything outside that radius may be cut, which is why the mark is scaled down
 * rather than the canvas scaled up.
 */
export const MASKABLE_SAFE_RATIO = 0.8;

// ---------------------------------------------------------------------------
// SVG transforms
// ---------------------------------------------------------------------------

/** Everything that paints, so a recolour catches all of it. */
const PAINT = /(fill|stroke|stop-color|flood-color|lighting-color)\s*[:=]\s*(["']?)(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-z]+)\2/gi;

/**
 * Recolour every painted value to one colour, leaving `none` alone.
 *
 * A monochrome variant is not a filter and not an opacity: it is the mark with
 * every ink replaced by one ink, which is what embroidery, foil and etching
 * actually do. `none` has to survive, because a shape that was deliberately
 * unpainted becoming solid is how a mark fills in.
 */
export function monochromeSvg(svg, colour) {
  return svg.replace(PAINT, (m, prop, q, value) => {
    if (/^none$/i.test(value) || /^url\(/i.test(value)) return m;
    return `${prop}${m.includes(':') && !m.includes('=') ? ':' : '='}${q}${colour}${q}`;
  });
}

/** The mark on its darkest ground, for reversing out. */
export const reversedSvg = (svg, colour = '#FFFFFF') => monochromeSvg(svg, colour);

/**
 * The source's own coordinate box, from its viewBox or its width and height.
 *
 * Everything downstream needs this. A mark is almost never square and every
 * icon slot is, so the only way to land it correctly is to know the box it was
 * drawn in and place it deliberately.
 */
export function svgBox(svg) {
  const vb = /viewBox\s*=\s*["']\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(svg);
  if (vb) return { x: Number(vb[1]), y: Number(vb[2]), w: Number(vb[3]), h: Number(vb[4]) };
  const w = /\bwidth\s*=\s*["']?([\d.]+)/i.exec(svg);
  const h = /\bheight\s*=\s*["']?([\d.]+)/i.exec(svg);
  if (w && h) return { x: 0, y: 0, w: Number(w[1]), h: Number(h[1]) };
  return null;
}

/** The markup between the outer svg tags: the drawing without its frame. */
export function svgChildren(svg) {
  const open = /<svg\b[^>]*>/i.exec(svg);
  const close = svg.toLowerCase().lastIndexOf('</svg>');
  if (!open || close < 0) return null;
  return svg.slice(open.index + open[0].length, close).trim();
}

/**
 * Place a mark squarely in a square, centred, at a uniform scale.
 *
 * Doing this with CSS and a nested `<svg>` looked right and was not: the
 * source's own `width` and `height` attributes won, so the mark came out
 * stretched and pushed into a corner. The first icons this produced were
 * visibly wrong, which is the argument for composing the canvas here rather
 * than hoping a browser resolves three competing sizing rules the way you
 * expected.
 *
 * `ratio` is the safe area. A maskable icon is cropped to a circle by some
 * launchers and a squircle by others, so the mark has to survive inside the
 * middle 80%; a plain icon uses more of the box.
 */
export function fitSvg(svg, { size = 512, ratio = 1, background = null } = {}) {
  const box = svgBox(svg);
  const children = svgChildren(svg);
  if (!box || !children || !box.w || !box.h) {
    // Not something we can measure. Hand it back untouched rather than emit a
    // confidently wrong icon.
    return svg;
  }
  const safe = size * ratio;
  const scale = Math.min(safe / box.w, safe / box.h);
  const tx = (size - box.w * scale) / 2 - box.x * scale;
  const ty = (size - box.h * scale) / 2 - box.y * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${background ? `  <rect width="${size}" height="${size}" fill="${background}"/>\n` : ''}  <g transform="translate(${Number(tx.toFixed(3))} ${Number(ty.toFixed(3))}) scale(${Number(scale.toFixed(6))})">
${children}
  </g>
</svg>`;
}

/** Kept for the maskable case, which is `fitSvg` with a ground and a safe area. */
export const padSvg = (svg, { background, ratio = MASKABLE_SAFE_RATIO, size = 512 }) =>
  fitSvg(svg, { size, ratio, background });

// ---------------------------------------------------------------------------
// Rasterising
// ---------------------------------------------------------------------------

/**
 * SVG to PNG through the browser that already renders the PDF.
 *
 * The page is exactly the icon and nothing else: no margin, no scrollbar, and a
 * transparent default so a mark meant to sit on any ground still can.
 */
async function rasterise(chrome, svg, pngPath, { size, background = null }) {
  const dir = path.join(os.tmpdir(), `brandi-asset-${process.pid}-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
  const htmlPath = path.join(dir, 'icon.html');
  await writeFile(htmlPath, `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;width:${size}px;height:${size}px;background:${background ?? 'transparent'}}
  svg{display:block;width:${size}px;height:${size}px}
</style>
${svg}`);
  try {
    // No `--user-data-dir`. Chrome takes 2 seconds without one and over 150
    // with, on a machine where the user already has Chrome open, because a
    // second instance contends for a profile whether the profile is fresh or
    // shared. Measured: 2.2s against 120s+. It was costing this command eight
    // minutes to produce fifteen small files.
    await run(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--no-first-run', '--no-default-browser-check',
      '--force-device-scale-factor=1',
      '--default-background-color=00000000',
      '--virtual-time-budget=1000',
      `--window-size=${size},${size}`,
      `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath).href,
    ], { timeout: 45000 });
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
  return existsSync(pngPath);
}

// ---------------------------------------------------------------------------
// ICO
// ---------------------------------------------------------------------------

/**
 * Assemble a multi-size .ico from PNGs.
 *
 * The format is a six-byte header, a sixteen-byte directory entry per image,
 * and then the images. PNG-in-ICO is understood by every browser still in use.
 * A size of 256 is written as 0, which is the format's way of saying "not 255
 * or less" and the one detail that catches people out.
 */
export function buildIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);  // palette
    e.writeUInt8(0, 3);  // reserved
    e.writeUInt16LE(1, 4);  // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// ---------------------------------------------------------------------------
// The pack
// ---------------------------------------------------------------------------

/**
 * Build the pack from one master SVG.
 *
 * Returns what it wrote and, just as importantly, what it could not: a run with
 * no browser still produces every vector variant and says plainly that the
 * rasters are missing, rather than reporting a complete pack that is not.
 */
export async function buildAssetPack({
  masterSvg, outDir, system, brandName = 'Brand', chrome = findChrome(),
  // A mark that survives at 16px is usually not the mark: counters close, thin
  // strokes vanish, and a droplet becomes a smudge. When a simplified drawing
  // is supplied it is used for the two favicon sizes and nothing else, and the
  // pack says which one it used so nobody has to guess by looking.
  faviconSvg = null,
} = {}) {
  const written = [];
  const skipped = [];
  const svg = String(masterSvg);
  if (!/<svg[\s>]/i.test(svg)) throw new TypeError('The master asset is not an SVG. Rasters cannot be derived from a raster.');

  const ink = system.palettes.neutral.light.steps[11].hex;
  const paper = system.palettes.neutral.light.steps[0].hex;
  const brandHex = system.palettes.brand.light.solidStrong.hex;
  const onBrand = bestTextOn(brandHex).color;

  await mkdir(path.join(outDir, 'svg'), { recursive: true });
  await mkdir(path.join(outDir, 'png'), { recursive: true });

  // --- Vectors, which are the masters everything else comes from ----------
  const variants = [
    ['primary', svg, 'The mark as drawn. Everything else is derived from this file, so it is the one to edit.'],
    ['black', monochromeSvg(svg, ink), 'One ink. Embroidery, foil, etching, a rubber stamp, a fax.'],
    ['white', reversedSvg(svg), 'Reversed out of anything dark. Check the counters at small sizes.'],
    ['brand', monochromeSvg(svg, brandHex), 'One colour, the brand one, for a single-colour print on the brand ground.'],
    ['on-brand', monochromeSvg(svg, onBrand), `For sitting on ${brandHex}, which needs ${onBrand === '#FFFFFF' ? 'white' : 'black'}.`],
  ];
  for (const [name, source, why] of variants) {
    const file = path.join(outDir, 'svg', `${name}.svg`);
    await writeFile(file, source.endsWith('\n') ? source : `${source}\n`);
    written.push({ file, kind: 'svg', name, why });
  }

  // --- Rasters, which need a browser --------------------------------------
  if (!chrome) {
    skipped.push({
      what: 'Every PNG, the favicon and the maskable icon',
      why: 'No Chromium-family browser was found, and rasterising is what one is for.',
      fix: 'Install Chrome or Chromium and run `brandi assets` again. The SVG variants above are complete and unaffected.',
    });
    return { written, skipped, ok: false };
  }

  const pngs = new Map();
  for (const size of RASTER_SIZES) {
    // A mark is not square and every one of these slots is, so each is composed
    // deliberately. The two that get masked also get a ground and a safe area.
    const maskable = size.name === 'icon-512' || size.name === 'apple-touch-icon';
    const tiny = size.px <= 32 && faviconSvg;
    const source = fitSvg(tiny ? String(faviconSvg) : svg, {
      size: size.px,
      ratio: maskable ? MASKABLE_SAFE_RATIO : 0.92,
      background: maskable ? paper : null,
    });
    const file = path.join(outDir, 'png', `${size.name}.png`);
    const made = await rasterise(chrome, source, file, {
      size: size.px,
      background: maskable ? paper : null,
    });
    if (made) {
      pngs.set(size.px, await readFile(file));
      written.push({ file, kind: 'png', name: size.name, why: tiny ? `${size.why} Drawn from the simplified mark, which is what survives here.` : size.why });
    } else {
      skipped.push({ what: `${size.name}.png`, why: 'The browser produced no file.', fix: 'Run again; if it persists the SVG may not be parseable on its own.' });
    }
  }

  // A reversed PNG, because the one everybody needs and nobody exports is the
  // mark on a dark ground for a social profile.
  const reversedPng = path.join(outDir, 'png', 'avatar-400-reversed.png');
  if (await rasterise(chrome, fitSvg(reversedSvg(svg), { size: 400, ratio: 0.92 }), reversedPng, { size: 400, background: ink })) {
    written.push({ file: reversedPng, kind: 'png', name: 'avatar-400-reversed', why: 'The same avatar for dark profiles and dark app themes.' });
  }

  // --- The favicon ---------------------------------------------------------
  const icoParts = [16, 32].filter((s) => pngs.has(s)).map((s) => ({ size: s, data: pngs.get(s) }));
  if (icoParts.length) {
    const icoPath = path.join(outDir, 'favicon.ico');
    await writeFile(icoPath, buildIco(icoParts));
    written.push({ file: icoPath, kind: 'ico', name: 'favicon', why: `Both sizes in one file, which is what a browser asks for at /favicon.ico.` });
  }

  // --- The manifest, so the icons are actually referenced ------------------
  const manifestPath = path.join(outDir, 'site.webmanifest');
  await writeFile(manifestPath, `${JSON.stringify({
    name: brandName,
    short_name: brandName,
    icons: [
      { src: 'png/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'png/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    theme_color: brandHex,
    background_color: paper,
    display: 'standalone',
  }, null, 2)}\n`);
  written.push({ file: manifestPath, kind: 'json', name: 'site.webmanifest', why: 'A produced icon nothing references is a produced icon nobody sees.' });

  return { written, skipped, ok: skipped.length === 0 };
}

export default { buildAssetPack, monochromeSvg, reversedSvg, fitSvg, padSvg, svgBox, svgChildren, buildIco, RASTER_SIZES };
