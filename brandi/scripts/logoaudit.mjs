/**
 * The mechanical half of judging a mark.
 *
 * Most logo review is preference, and preference arrives before evidence: once
 * somebody has said they like a mark, it is very hard to fail it on arithmetic.
 * So the arithmetic runs first, and the concepts that cannot survive a favicon
 * or a single-colour press never reach the conversation.
 *
 * Three passes, in increasing cost:
 *
 *   structure   Can this file be used at all? Parse, viewBox, live text, raster
 *               images, external references, gradients. Reading only.
 *   geometry    Does the construction meet the numeric constraints of each
 *               application context? Stroke ratios, colour counts, optical
 *               centre. Measured off the path data, so it is scale free.
 *   rendered    What actually happens at 16 pixels. This is the one that cannot
 *               be reasoned about: a mark either holds together as separate
 *               shapes at thumbnail size or it turns into a grey blob, and the
 *               only way to know is to look at the pixels.
 *
 * The rendered pass puts every candidate at every size onto ONE sprite sheet and
 * takes ONE screenshot. Twelve candidates at four sizes is forty-eight images,
 * and launching a browser forty-eight times costs about two minutes against
 * about two seconds. The sheet is sliced by coordinates that were computed
 * before it was drawn.
 *
 * Every threshold carries its `basis`. Numbers from Rampstack's application
 * context matrix say so and cite the finding; numbers I derived say `derived`
 * and the docblock says how. A threshold with no stated origin is a number
 * somebody guessed, and this file is supposed to be the part that does not.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import { describeSvg, inkBounds, collectShapes, viewBox } from './svg.mjs';
import { decodePng, toGrey, inkCoverage, countRegions, minFeatureWidth, dHash, hamming, boundingBox } from './png.mjs';
import { fitSvg, svgChildren, monochromeSvg } from './assets.mjs';
import { findChrome } from './preview.mjs';
import { CONTEXTS, CONSTRAINTS, ARCHITECTURES } from './logospec.mjs';

const run = promisify(execFile);

/** The sizes every candidate is rendered at, and why each one is there. */
export const AUDIT_SIZES = Object.freeze([
  { px: 16, why: 'The favicon. The size that kills most concepts.' },
  { px: 32, why: 'The other favicon, and the one most people actually see.' },
  { px: 64, why: 'A feed avatar and a small app icon.' },
  { px: 256, why: 'The reference render. Everything smaller is compared against this.' },
]);

/**
 * Thresholds I derived rather than took from the research, with the reasoning.
 *
 * `minCoverage`: below this the mark is hairlines on a field of white and reads
 * as empty at small sizes. Measured against a set of real marks, a 256px render
 * of a workable symbol sits between 8 and 45 per cent ink.
 *
 * `maxCoverage`: above this there is more ink than ground, so the silhouette is
 * carried by the outer edge alone and every internal counter has closed.
 *
 * `maxCentreOffset`: a mark whose ink centre sits more than this fraction of the
 * box from the box centre looks off-centre inside a circular avatar crop, which
 * is the context where nobody can correct it.
 *
 * `nearDuplicate`: mean absolute difference between two 16x16 silhouettes, as a
 * fraction of full scale. Two measurements, both on real rounds. Twelve
 * synthetic marks: two copies of one mark scored 0.0000 and the closest pair of
 * genuinely different marks scored 0.2238. Seven marks drawn by agents for a
 * structural engineering practice: the closest pair was the two wordmarks of the
 * same name set in different faces, at 0.1656, which is the hardest honest case
 * there is and is exactly the pair that must NOT be called a duplicate. 0.08
 * leaves a factor of two under that, and the error it protects against is
 * telling somebody two real options are the same idea.
 *
 * `maxViewBoxSlack`: measured linearly. A mark spanning less than three quarters
 * of its own viewBox carries the remainder as dead margin into every icon size.
 */
export const DERIVED = Object.freeze({
  minCoverage: 0.02,
  maxCoverage: 0.65,
  maxCentreOffset: 0.08,
  nearDuplicate: 0.08,
  identical: 0.01,
  maxSegments: 400,
  maxViewBoxSlack: 0.25,
});

const finding = (severity, id, message, extra = {}) => ({ severity, id, message, ...extra });

// ---------------------------------------------------------------------------
// Pass one: structure
// ---------------------------------------------------------------------------

/**
 * Whether the file is usable at all.
 *
 * `role` decides how hard several of these bite. A candidate sketch carrying a
 * `<text>` element is a note, because it is about to be redrawn anyway; a master
 * carrying one is an error, because a master with live text renders in Georgia
 * on any machine without the face and nobody finds out until it is on a sign.
 */
export function auditStructure(source, { role = 'candidate', maxBytes = 512 * 1024 } = {}) {
  const out = [];
  const strict = role === 'master';

  if (typeof source !== 'string' || !source.trim()) {
    return [finding('error', 'empty', 'The file is empty.')];
  }
  if (Buffer.byteLength(source) > maxBytes) {
    // Returns here rather than falling through. The ceiling used to be
    // cosmetic: the file was reported as too big and then fully parsed anyway,
    // so a 56MB traced raster exhausted the heap in the check that existed to
    // stop it, and in a batch it took the whole round's audit down with it.
    return [finding('error', 'too-big', `The file is ${Math.round(Buffer.byteLength(source) / 1024)}KB, over the ${Math.round(maxBytes / 1024)}KB ceiling.`, {
      fix: 'A logo this size is almost always a traced raster or an embedded image. Nothing further was measured, because parsing a file this size is how the measurement itself falls over.',
    })];
  }

  const d = describeSvg(source);

  if (!d.hasRoot) {
    return [finding('error', 'not-svg', 'There is no <svg> element, so this is not a vector file.')];
  }

  // An SVG loaded as an image is parsed as strict XML, and strict XML has no
  // tolerance the scanner in svg.mjs deliberately has. A file with an unquoted
  // attribute or no namespace parses fine here, measures fine here, and then
  // renders as a completely blank box everywhere it is actually used, with no
  // error anywhere. That failure cost an hour to find once and is silent by
  // construction, so it is checked directly.
  if (!/<svg\b[^>]*\bxmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/i.test(source)) {
    out.push(finding('error', 'no-xmlns', 'The root <svg> has no xmlns declaration.', {
      fix: 'Add xmlns="http://www.w3.org/2000/svg". Chrome will still draw it from a data URI that names the type, but the file is not a conforming SVG document and editors, converters and a plain file:// link all refuse it.',
    }));
  }
  for (const m of source.matchAll(/<[A-Za-z][-\w]*\s[^>]*?([:A-Za-z_][-.:\w]*)\s*=\s*([^\s"'>][^\s>]*)/g)) {
    out.push(finding('error', 'unquoted-attribute', `The attribute ${m[1]}=${m[2]} is not quoted.`, {
      fix: 'Strict XML refuses this, so the whole file renders as nothing. Quote every attribute value.',
    }));
    break;
  }
  if (!d.viewBox) {
    out.push(finding('error', 'no-viewbox', 'There is no viewBox and no width and height.', {
      fix: 'Add an integer viewBox. Every downstream step centres and scales the mark by reading it.',
    }));
  }
  if (!d.ink) {
    out.push(finding('error', 'no-ink', 'Nothing in this file paints anything.'));
    return out;
  }

  if (d.hasText) {
    out.push(finding(strict ? 'error' : 'note', 'live-text', 'The mark contains a live <text> element, so it depends on a font being installed.', {
      fix: 'Convert the type to outlines. A wordmark that renders in Georgia on a machine without the face is not a wordmark.',
      basis: 'rampstack PKG:181',
    }));
  }
  if (d.hasImage) {
    out.push(finding('error', 'raster', 'The mark embeds a raster image, so it cannot be reproduced at signage scale or cut in vinyl.'));
  }
  if (d.hasScript) out.push(finding('error', 'script', 'The file contains a <script> element, which is stripped everywhere it is used.'));
  if (d.hasForeignObject) out.push(finding('error', 'foreign-object', 'The file contains a <foreignObject>, which does not survive rasterising.'));
  for (const ref of d.externalRefs) {
    out.push(finding('error', 'external-ref', `The file loads ${ref} from outside itself.`, { fix: 'Inline it. Nothing downstream has network access.' }));
  }
  for (const ref of d.danglingRefs) {
    out.push(finding('error', 'dangling-ref', `A paint points at #${ref}, which is not defined in this file.`, {
      fix: 'That shape renders as nothing. It is usually a gradient left behind when a definition block was deleted.',
    }));
  }
  if (d.usesGradient) {
    out.push(finding('error', 'gradient', 'The mark uses a gradient, which fails five of the ten application contexts.', {
      fix: 'Favicon, embroidered patch, single colour, apparel and foil all refuse it. Rebuild the mark in flat fills.',
      basis: 'rampstack APP:17,77,110,246,273',
    }));
  }
  if (d.usesCurrentColor) {
    out.push(finding(strict ? 'error' : 'warn', 'current-color', 'A paint is `currentColor`, which inherits from whatever the mark is placed inside.', {
      fix: 'State the colour. A mark whose colour is decided by its container has no colour of its own.',
    }));
  }
  if (d.hasStyleBlock && /\.[-\w]+\s*\{/.test(d.styleText)) {
    out.push(finding(strict ? 'error' : 'warn', 'css-classes', 'Paint is applied through CSS classes in a <style> block.', {
      fix: 'Put fill and stroke on the elements. Class-based paint does not survive recolouring into mono and reversed variants.',
    }));
  }

  // Ink outside the viewBox is ink nobody will ever see, and it is silent.
  const vb = d.viewBox;
  if (vb && d.ink) {
    const clipped =
      d.ink.x < vb.x - 0.5 || d.ink.y < vb.y - 0.5 ||
      d.ink.x + d.ink.width > vb.x + vb.width + 0.5 ||
      d.ink.y + d.ink.height > vb.y + vb.height + 0.5;
    if (clipped) {
      out.push(finding('error', 'clipped', 'Part of the mark sits outside the viewBox and is cropped away.', {
        fix: `The ink runs ${fmt(d.ink.x)} ${fmt(d.ink.y)} ${fmt(d.ink.width)} ${fmt(d.ink.height)} against a viewBox of ${fmt(vb.x)} ${fmt(vb.y)} ${fmt(vb.width)} ${fmt(vb.height)}.`,
      }));
    }
    // Measured linearly rather than by area, because that is how it bites: an
    // icon slot scales the mark by its viewBox, so a mark filling 70 per cent
    // of its box arrives 30 per cent smaller than it needed to be at every
    // size, and the 16px test is lost to packaging rather than to drawing.
    // A degenerate mark is skipped: it is already reported as having no ink to
    // speak of, and "fills 0 per cent of its viewBox" helps nobody.
    const fill = Math.max(d.ink.width / vb.width, d.ink.height / vb.height);
    if (!clipped && d.ink.width > 0 && d.ink.height > 0 && fill < 1 - DERIVED.maxViewBoxSlack) {
      out.push(finding('warn', 'viewbox-slack', `The mark spans only ${Math.round(fill * 100)} per cent of its viewBox.`, {
        fix: `Tighten the viewBox to the artwork. Every icon slot scales by the viewBox, so a favicon of this file draws the mark ${Math.round((1 - fill) * 100)} per cent smaller than it has to be.`,
        basis: 'derived',
      }));
    }
  }

  if (d.segments > DERIVED.maxSegments) {
    out.push(finding('warn', 'node-count', `${d.segments} path segments.`, {
      fix: 'A drawn mark is tens of segments. Hundreds means an auto-traced raster, which wobbles at large sizes.',
      basis: 'derived',
    }));
  }

  return out;
}

const fmt = (n) => Number(n.toFixed(2));

// ---------------------------------------------------------------------------
// Pass two: geometry
// ---------------------------------------------------------------------------

/** Distinct paint values that actually put ink down. */
export function paintCount(source) {
  const paints = new Set();
  for (const s of collectShapes(source)) {
    if (s.hidden || !s.paints) continue;
    if (s.fill && s.fill !== 'none') paints.add(String(s.fill).toLowerCase());
    if (s.stroke && s.stroke !== 'none') paints.add(String(s.stroke).toLowerCase());
  }
  return paints.size;
}

/**
 * The thinnest painted feature, as a fraction of the mark's larger dimension.
 *
 * Stroke width is the easy half. A filled shape can also be thin, and this only
 * measures strokes, so a hairline drawn as a long thin filled rectangle is not
 * caught here. The rendered pass catches that one, which is why both exist.
 */
export function strokeRatio(source) {
  const ink = inkBounds(source);
  if (!ink) return null;
  const span = Math.max(ink.width, ink.height);
  if (!(span > 0)) return null;
  const widths = collectShapes(source).filter((s) => !s.hidden && s.strokeWidth > 0).map((s) => s.strokeWidth);
  if (!widths.length) return null;
  return Math.min(...widths) / span;
}

/**
 * How far the ink's centre sits from the box's centre, as a fraction of the box.
 *
 * This matters for exactly one reason: a circular avatar crop centres on the
 * box, not on the artwork, so a mark that is optically off-centre is off-centre
 * on every social profile it ever appears on, and there is no way to correct it
 * from outside the file.
 */
export function centreOffset(source) {
  const vb = viewBox(source);
  const ink = inkBounds(source);
  if (!vb || !ink) return null;
  const dx = (ink.x + ink.width / 2 - (vb.x + vb.width / 2)) / vb.width;
  const dy = (ink.y + ink.height / 2 - (vb.y + vb.height / 2)) / vb.height;
  return { dx, dy, distance: Math.hypot(dx, dy) };
}

/**
 * The numeric constraints of each application context, measured on the geometry.
 *
 * Returns one row per context: `pass`, `fail` or `deferred`. `deferred` means
 * this architecture is expected to hand this context to a different asset, so it
 * is not a defect in this file. That distinction is the whole reason a lockup
 * survives the audit: a lockup fails the favicon, the app icon, the patch and
 * the square avatar, and is still the right primary mark, because the small
 * grade asset covers all four. Counting those as failures rejects the default
 * architecture, which is the mistake this function exists to avoid.
 */
export function auditContexts(source, { architecture = null, contexts = CONTEXTS, metrics = null } = {}) {
  const arch = ARCHITECTURES.find((a) => a.id === architecture) ?? null;
  const ratio = strokeRatio(source);
  const paints = paintCount(source);
  const gradient = describeSvg(source).usesGradient;
  const centre = centreOffset(source);
  const reference = metrics?.[256] ?? null;

  return contexts.map((ctx) => {
    const expectation = arch?.contexts?.[ctx.id] ?? null;
    const reasons = [];

    if (ctx.gradients === false && gradient) reasons.push('it uses a gradient');
    if (ctx.maxColours != null && paints > ctx.maxColours) {
      reasons.push(`${paints} paints against a ceiling of ${ctx.maxColours}`);
    }
    if (ctx.minStrokeRatio != null && ratio != null && ratio < ctx.minStrokeRatio) {
      reasons.push(`the thinnest stroke is ${(ratio * 100).toFixed(1)} per cent of the mark, under the ${(ctx.minStrokeRatio * 100).toFixed(1)} per cent this context needs`);
    }
    if (ctx.safeCircleRatio != null && centre && centre.distance > DERIVED.maxCentreOffset) {
      reasons.push(`the mark sits ${(centre.distance * 100).toFixed(1)} per cent off centre, and this context crops to a circle`);
    }

    // The stroke check above only sees strokes. A hairline drawn as a long thin
    // FILLED rectangle has no stroke width at all and walked straight past it,
    // which meant a mark that vanishes at 16px could be reported as passing the
    // favicon. The rendered measurement has no such blind spot, so where there
    // is a render, it decides.
    const at = ctx.renderAt;
    const m = at != null ? metrics?.[at] : null;
    if (m && ctx.minStrokeRatio != null) {
      const floor = ctx.minStrokeRatio * at;
      if (m.minFeature > 0 && m.minFeature < floor) {
        reasons.push(`the thinnest feature measures ${m.minFeature}px when rendered at ${at}px, under the ${floor.toFixed(1)}px this context needs`);
      }
      if (m.coverage < DERIVED.minCoverage) reasons.push(`almost no ink survives at ${at}px`);
    }
    if (m && reference && reference.regions > 1 && m.regions < reference.regions) {
      reasons.push(`the mark reads as ${reference.regions} shapes at 256px and ${m.regions} at ${at}px, so its counters close`);
    }
    if (m && ctx.maxRegions != null && m.regions > ctx.maxRegions) {
      reasons.push(`${m.regions} separate shapes at ${at}px, against a ceiling of ${ctx.maxRegions}`);
    }

    const failed = reasons.length > 0;
    // A context the architecture already hands to another asset is not this
    // file's problem, but it is still recorded so the system can be checked.
    const status = expectation === 'fallback' ? 'deferred' : failed ? 'fail' : 'pass';
    return { context: ctx.id, name: ctx.name, status, expectation, reasons, mechanical: ctx.mechanical };
  });
}

// ---------------------------------------------------------------------------
// Pass three: rendered
// ---------------------------------------------------------------------------

/** A copy of the mark whose viewBox is the artwork, so a render measures the mark. */
export function tighten(source, { padding = 0 } = {}) {
  const ink = inkBounds(source);
  const children = svgChildren(source);
  if (!ink || !children || !(ink.width > 0 || ink.height > 0)) return source;
  const p = padding * Math.max(ink.width, ink.height);
  const x = fmt(ink.x - p);
  const y = fmt(ink.y - p);
  const w = fmt(Math.max(ink.width + p * 2, 0.001));
  const h = fmt(Math.max(ink.height + p * 2, 0.001));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${children}</svg>`;
}

const dataUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;

const GAP = 8;

/**
 * Lay every candidate at every size on one sheet, shoot it once, slice it up.
 *
 * The gap is white and wide enough that antialiasing from one cell cannot reach
 * the next, because a stray dark pixel bleeding across a boundary would be
 * counted as a second region and would fail a mark for a rendering artefact.
 */
export function spriteLayout(count, sizes = AUDIT_SIZES.map((s) => s.px)) {
  const cells = [];
  let y = GAP;
  const rowHeight = Math.max(...sizes) + GAP;
  for (let i = 0; i < count; i++) {
    let x = GAP;
    for (const px of sizes) {
      cells.push({ index: i, px, x, y });
      x += px + GAP;
    }
    y += rowHeight;
  }
  const width = GAP + sizes.reduce((a, s) => a + s + GAP, 0);
  return { cells, width, height: y, rowHeight };
}

async function shoot(chrome, htmlPath, pngPath, width, height) {
  // No `--user-data-dir`: a second Chrome contending for a profile on a machine
  // where the user already has Chrome open costs two minutes rather than two
  // seconds, whether the profile is fresh or shared.
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
  ], { timeout: 120000 });
}

/**
 * Render a batch of marks at every audit size and measure each render.
 *
 * Each mark is placed with `fitSvg`, which is the same code the asset pack uses,
 * so what is measured here is what actually ships rather than an approximation
 * of it.
 */
export async function renderBatch(sources, { sizes = AUDIT_SIZES.map((s) => s.px), chrome = findChrome(), tightViewBox = true } = {}) {
  if (!chrome) return { available: false, results: sources.map(() => null) };

  const prepared = sources.map((s) => (tightViewBox ? tighten(s) : s));
  const { cells, width, height } = spriteLayout(sources.length, sizes);

  const imgs = cells.map((c) => {
    const svg = fitSvg(prepared[c.index], { size: c.px, ratio: 1, background: null });
    return `<img src="${dataUri(svg)}" style="position:absolute;left:${c.x}px;top:${c.y}px;width:${c.px}px;height:${c.px}px" alt="">`;
  }).join('\n');

  const html = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#fff}body{width:${width}px;height:${height}px;position:relative}</style>
${imgs}`;

  const dir = path.join(os.tmpdir(), `brandi-audit-${process.pid}-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
  try {
    const htmlPath = path.join(dir, 'sheet.html');
    const pngPath = path.join(dir, 'sheet.png');
    await writeFile(htmlPath, html);
    await shoot(chrome, htmlPath, pngPath, width, height);
    const sheet = decodePng(await readFile(pngPath));
    const grey = toGrey(sheet);

    const results = sources.map(() => ({}));
    for (const c of cells) {
      const cell = crop(grey, sheet.width, c.x, c.y, c.px, c.px);
      const colourCell = cropRgb(sheet, c.x, c.y, c.px, c.px);
      results[c.index][c.px] = measure(cell, colourCell, c.px);
    }
    return { available: true, results, sheetWidth: width, sheetHeight: height };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Lift one cell out of the sheet. */
function crop(grey, sheetWidth, x, y, w, h) {
  const out = new Uint8Array(w * h);
  for (let row = 0; row < h; row++) {
    const from = (y + row) * sheetWidth + x;
    out.set(grey.subarray(from, from + w), row * w);
  }
  return out;
}

/** The same lift, keeping the colour, as packed 24-bit values. */
function cropRgb({ data, channels, width }, x, y, w, h) {
  const out = new Uint32Array(w * h);
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const i = ((y + row) * width + (x + col)) * channels;
      if (channels >= 3) {
        out[row * w + col] = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      } else {
        const g = data[i];
        out[row * w + col] = (g << 16) | (g << 8) | g;
      }
    }
  }
  return out;
}

/**
 * Regions that are separated by COLOUR, not merely by ink.
 *
 * `countRegions` works on greyscale, and greyscale has already thrown hue away,
 * so two touching shapes in different inks are one region to it whether or not
 * the mark has been collapsed. That makes it structurally incapable of
 * answering the single-colour question, which is the point of this second
 * counter: two neighbouring pixels join only if their colours match, so two
 * touching shapes in different inks count as two.
 *
 * It lives here rather than in `png.mjs` because it is not a general image
 * utility. It exists to answer exactly one question, and quantising to 5 bits a
 * channel is what makes it survive antialiasing along the shared edge.
 */
/**
 * Which ink a pixel belongs to, for the one question being asked.
 *
 * The question is whether two areas are told apart by HUE, so hue is what is
 * classified. Quantising raw RGB was the third attempt and it still failed on
 * real work: a wordmark's strokes are thin enough that even their eroded
 * interiors are partly antialiased, so `#111111` and a `#3a3a3a` blend of it
 * landed in different buckets and a single-ink wordmark reported fifteen colours
 * against eleven. A blend of one ink towards white keeps that ink's hue, or
 * loses saturation and becomes neutral, so bucketing on hue puts the whole ramp
 * back together while still separating a green from a red.
 */
function inkBucket(v) {
  const r = ((v >> 16) & 255) / 255;
  const g = ((v >> 8) & 255) / 255;
  const b = (v & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  // Everything from black to white through grey is one ink, which is what a
  // one-colour press makes of it.
  if (chroma < 0.12) return 0;
  let hue;
  if (max === r) hue = ((g - b) / chroma + 6) % 6;
  else if (max === g) hue = (b - r) / chroma + 2;
  else hue = (r - g) / chroma + 4;
  // Twelve buckets of thirty degrees. Finer than that and two shades of one ink
  // separate; coarser and a green stops being distinguishable from a teal.
  return 1 + (Math.floor((hue * 60) / 30) % 12);
}

export function solidRegions(rgb, width, height, { background = 0xffffff, tolerance = 24 } = {}) {
  const q = inkBucket;
  const far = (v) => Math.max(
    Math.abs(((v >> 16) & 255) - ((background >> 16) & 255)),
    Math.abs(((v >> 8) & 255) - ((background >> 8) & 255)),
    Math.abs((v & 255) - (background & 255)),
  ) > tolerance;

  // Only the SOLID interior of each area is classified. Every curved edge is
  // antialiased into a ramp of intermediate colours, and treating each shade as
  // its own area counted 1,103 regions in a single-ink ring.
  const ink = new Uint8Array(width * height);
  for (let i = 0; i < ink.length; i++) ink[i] = far(rgb[i]) ? 1 : 0;
  const solid = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (!ink[i]) continue;
      if (ink[i - 1] && ink[i + 1] && ink[i - width] && ink[i + width]
        && ink[i - width - 1] && ink[i - width + 1] && ink[i + width - 1] && ink[i + width + 1]) {
        solid[i] = 1;
      }
    }
  }

  // BOTH counts come off the SAME eroded mask, which is the whole point.
  // Comparing an eroded colour count against a full-resolution greyscale one is
  // apples to oranges: erosion fragments a thin letter stroke into islands, so
  // a single-ink wordmark reported fifteen colour areas against eleven grey ones
  // and was rejected for a colour problem it did not have.
  const count = (joinOn) => {
    const seen = new Uint8Array(width * height);
    const stack = [];
    let regions = 0;
    for (let start2 = 0; start2 < width * height; start2++) {
      if (seen[start2] || !solid[start2]) continue;
      const colour = joinOn ? q(rgb[start2]) : 0;
      regions++;
      stack.length = 0;
      stack.push(start2);
      seen[start2] = 1;
      while (stack.length) {
        const p = stack.pop();
        const px = p % width;
        const py = (p - px) / width;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const n = ny * width + nx;
            if (seen[n] || !solid[n]) continue;
            if (joinOn && q(rgb[n]) !== colour) continue;
            seen[n] = 1;
            stack.push(n);
          }
        }
      }
    }
    return regions;
  };

  return { byColour: count(true), byInk: count(false) };
}

/** Kept for callers that only want the colour-aware half. */
export function countColourRegions(rgb, width, height, options) {
  return solidRegions(rgb, width, height, options).byColour;
}

function measure(grey, rgb, size) {
  const box = boundingBox(grey, size, size);
  return {
    coverage: inkCoverage(grey),
    regions: countRegions(grey, size, size),
    ...(rgb ? (() => {
      const r = solidRegions(rgb, size, size);
      return { colourRegions: r.byColour, solidRegions: r.byInk };
    })() : { colourRegions: null, solidRegions: null }),
    minFeature: minFeatureWidth(grey, size, size),
    // Hashed over the ink, not over the cell. A wide mark fitted into a square
    // leaves identical white bands above and below it, and every wide mark
    // therefore shares those bits with every other wide mark. Measured on a
    // twelve-concept round, that alone put five unrelated pairs inside the
    // near-duplicate threshold. Hashing the bounding box compares the marks'
    // compositions rather than their letterboxing.
    hash: box ? dHash(crop(grey, size, box.x, box.y, box.width, box.height), box.width, box.height) : dHash(grey, size, size),
    silhouette: box ? silhouette(crop(grey, size, box.x, box.y, box.width, box.height), box.width, box.height) : null,
    box,
  };
}

/**
 * What the pixels say, turned into findings.
 *
 * The region-collapse test is the one worth understanding. A mark is rendered at
 * 256 and at 16, and the number of separate dark regions is counted at each. If
 * the mark has four separate shapes at 256 and one at 16, its counters have
 * closed and it is a blob in a browser tab. That is the mechanical form of the
 * test everybody says to do and nobody does.
 */
export function auditRenderMetrics(metrics, { architecture = null, expectInk = true } = {}) {
  const out = [];
  if (!metrics) return out;
  const arch = ARCHITECTURES.find((a) => a.id === architecture) ?? null;
  const big = metrics[256] ?? metrics[Math.max(...Object.keys(metrics).map(Number))];
  const small = metrics[16];
  if (!big) return out;

  // The geometry says there is ink and the browser drew none. Whatever the
  // cause, the file is not renderable, and reporting it as a thin mark would
  // send somebody off thickening strokes that were never the problem.
  if (expectInk && big.coverage === 0) {
    return [finding('error', 'renders-empty', 'The geometry describes a mark, and a browser renders a blank box.', {
      fix: 'The file is almost certainly not well-formed XML: an unquoted attribute, a missing namespace, or a mismatched tag. Nothing else in this report is trustworthy until that is fixed.',
    })];
  }

  if (big.coverage < DERIVED.minCoverage) {
    out.push(finding('error', 'too-light', `The mark covers only ${(big.coverage * 100).toFixed(1)} per cent of its own box.`, {
      fix: 'It is hairlines on white. It will read as empty in a browser tab and disappear under thread.',
      basis: 'derived',
    }));
  }
  if (big.coverage > DERIVED.maxCoverage) {
    out.push(finding('warn', 'too-heavy', `The mark covers ${(big.coverage * 100).toFixed(0)} per cent of its box.`, {
      fix: 'There is more ink than ground, so only the outer edge carries the silhouette.',
      basis: 'derived',
    }));
  }

  // Hue doing structural work. `regions` counts connected DARK areas in
  // greyscale, which is what the mark becomes on a one-colour press;
  // `colourRegions` counts them with the hue kept. More regions in colour than
  // in black means two areas were being told apart by hue alone and they merge
  // the moment the mark is etched, foil stamped or printed in one ink.
  //
  // This used to live in `auditOneColour`, which nothing called. The check was
  // written, tested, documented in three places and never wired in, which is the
  // same failure it was written to catch: something that passes because of how
  // it was built rather than because of what it measures.
  if (big.colourRegions != null && big.solidRegions != null && big.colourRegions > big.solidRegions) {
    out.push(finding('error', 'colour-carries', `The mark reads as ${big.colourRegions} shapes in colour and ${big.solidRegions} in black.`, {
      fix: 'Areas are being separated by hue alone. They merge in etching, foil, fax and one-colour print. Separate them with a gap or a change of shape rather than a change of colour.',
      basis: 'rampstack APP:112-113',
    }));
  }

  if (small) {
    // A lockup is EXPECTED to fail at 16px; the small grade asset covers it.
    // Reporting that as a defect would reject every lockup.
    const deferred = arch?.contexts?.['favicon-16'] === 'fallback';
    const sev = deferred ? 'note' : 'error';

    if (big.regions > 1 && small.regions < big.regions) {
      out.push(finding(sev, 'regions-collapse', `The mark has ${big.regions} separate shapes at 256px and ${small.regions} at 16px.`, {
        fix: deferred
          ? 'Expected for this architecture. The small grade asset has to carry the favicon, and this confirms it.'
          : 'The counters close at favicon size. Open them, thicken the mark, or draw a dedicated 16px redraw.',
        basis: 'rampstack APP:23-27',
      }));
    }
    if (small.minFeature > 0 && small.minFeature < 2) {
      out.push(finding(sev, 'thin-at-16', `The thinnest feature is ${small.minFeature}px at favicon size.`, {
        fix: 'Anything under two pixels disappears in a browser tab.',
        basis: 'rampstack APP:16',
      }));
    }
    if (small.coverage < DERIVED.minCoverage) {
      out.push(finding(sev, 'empty-at-16', 'At 16px there is almost no ink left.', { basis: 'derived' }));
    }
    if (small.regions > CONSTRAINTS.maxRegionsAtFavicon) {
      out.push(finding('warn', 'busy-at-16', `${small.regions} separate shapes at 16px, against a ceiling of ${CONSTRAINTS.maxRegionsAtFavicon}.`, {
        fix: 'At thumbnail size this reads as texture rather than as a mark.',
        basis: 'rampstack APP:15',
      }));
    }
  }
  return out;
}

/**
 * The single-colour test, mechanically.
 *
 * Collapse every paint to one, render both, and count regions. If the collapsed
 * version has fewer separate shapes, then two areas were being told apart by
 * hue alone, and they merge the moment the mark is etched, foil stamped, faxed
 * or printed on a one-colour press. Whether the merged silhouette still reads as
 * the brand is a judgement; whether it merged at all is arithmetic.
 */
export async function auditOneColour(source, { chrome = findChrome(), size = 256 } = {}) {
  const mono = monochromeSvg(source, '#000000');
  const batch = await renderBatch([source, mono], { sizes: [size], chrome });
  if (!batch.available) return { available: false, findings: [] };
  const colour = batch.results[0][size];
  const black = batch.results[1][size];
  // The same comparison the audit runs, against an explicitly collapsed render
  // rather than against the greyscale of the colour one. Counting BOTH sides in
  // greyscale was the first attempt and it can never fire: greyscale has already
  // thrown the hue away, so the two numbers are equal by construction.
  const out = auditRenderMetrics({ 256: { ...colour, solidRegions: black.solidRegions } })
    .filter((f) => f.id === 'colour-carries');
  return { available: true, findings: out, colourRegions: colour.colourRegions, blackRegions: black.solidRegions };
}

// ---------------------------------------------------------------------------
// Near duplicates
// ---------------------------------------------------------------------------

/**
 * The mark reduced to a small grid of grey, which is what "the same idea" means.
 *
 * A perceptual hash was the first attempt and it is the wrong tool here. dHash
 * records where the image gets darker to the right, which carries real signal in
 * a photograph and almost none in a black shape on white: most cells of a simple
 * mark have no horizontal gradient at all, so unrelated marks agree on most bits
 * by both being sparse. On a real twelve-concept round it put five unrelated
 * pairs inside the threshold, including two horizontal bars against a leaf.
 *
 * Comparing the downsampled silhouettes directly is both simpler and stronger.
 * Box sampling rather than nearest neighbour, because a high-contrast mark
 * aliases badly and the aliasing is what would be compared.
 */
export function silhouette(grey, width, height, { grid = 16 } = {}) {
  const out = new Uint8Array(grid * grid);
  for (let gy = 0; gy < grid; gy++) {
    const y0 = Math.floor((gy * height) / grid);
    const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) * height) / grid));
    for (let gx = 0; gx < grid; gx++) {
      const x0 = Math.floor((gx * width) / grid);
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) * width) / grid));
      let sum = 0;
      let n = 0;
      for (let y = y0; y < y1 && y < height; y++) {
        for (let x = x0; x < x1 && x < width; x++) {
          sum += grey[y * width + x];
          n++;
        }
      }
      out[gy * grid + gx] = n ? Math.round(sum / n) : 255;
    }
  }
  return out;
}

/** Mean absolute difference between two silhouettes, as a fraction of full scale. */
export function silhouetteDistance(a, b) {
  if (!a || !b || a.length !== b.length) return 1;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / (a.length * 255);
}

/**
 * Pairs of candidates that are the same idea twice.
 *
 * A concept round with two near-identical entries does not offer twelve
 * choices, it offers eleven and wastes somebody's attention. Compared on the
 * 64px render, which is small enough that a difference in fine detail does not
 * register as a difference in idea.
 */
export function findNearDuplicates(results, {
  size = 64,
  threshold = DERIVED.nearDuplicate,
  ids = [],
  groups = [],
  sameGroupThreshold = DERIVED.identical,
} = {}) {
  const pairs = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const a = results[i]?.[size]?.silhouette;
      const b = results[j]?.[size]?.silhouette;
      if (!a || !b) continue;
      const distance = silhouetteDistance(a, b);

      // Two refinements of the same parent are SUPPOSED to look alike, so
      // reporting them as the same idea is noise that buries the real finding.
      // What is worth reporting inside a group is a pair that is effectively
      // the same file, because that means the refinement task was not done.
      const sameGroup = groups[i] != null && groups[i] === groups[j];
      const limit = sameGroup ? sameGroupThreshold : threshold;
      if (distance <= limit) {
        pairs.push({
          a: ids[i] ?? i,
          b: ids[j] ?? j,
          distance: Number(distance.toFixed(4)),
          kind: sameGroup ? 'unchanged' : 'converged',
        });
      }
    }
  }
  return pairs.sort((x, y) => x.distance - y.distance);
}

// ---------------------------------------------------------------------------
// The whole thing
// ---------------------------------------------------------------------------

/**
 * Errors block, warnings are argued with, notes are context.
 *
 * `rendered` is not optional in spirit. Without a browser the geometry pass runs
 * alone, and it only sees declared stroke widths: a hairline drawn as a thin
 * filled rectangle is invisible to it, which the context code says out loud.
 * Calling that `contender` told somebody on a machine with no Chrome that a mark
 * which vanishes at 16 pixels clears every test. It is `unverified` now, and the
 * boards say so.
 */
export function verdictOf(findings, contextRows = [], { rendered = true } = {}) {
  const errors = findings.filter((f) => f.severity === 'error').length;
  const failed = contextRows.filter((r) => r.status === 'fail').length;
  if (errors > 0) return 'rejected';
  if (failed > CONSTRAINTS.contextFailBudget) return 'not-a-primary';
  if (!rendered) return 'unverified';
  if (findings.some((f) => f.severity === 'warn') || failed > 0) return 'contender-with-notes';
  return 'contender';
}

/**
 * Audit a batch of candidates in one pass, which is the only way it is fast
 * enough to run on every concept rather than on the ones somebody already liked.
 */
export async function auditCandidates(candidates, { chrome = findChrome(), role = 'candidate' } = {}) {
  const sources = candidates.map((c) => c.svg);
  const batch = await renderBatch(sources, { chrome });

  const audited = candidates.map((c, i) => {
    const structure = auditStructure(c.svg, { role });
    const parseable = !structure.some((f) => ['empty', 'not-svg', 'no-ink'].includes(f.id));
    const metrics = batch.available ? batch.results[i] : null;
    const contexts = parseable ? auditContexts(c.svg, { architecture: c.architecture, metrics }) : [];
    const rendered = parseable ? auditRenderMetrics(metrics, { architecture: c.architecture }) : [];
    const findings = [...structure, ...rendered];
    return {
      id: c.id,
      architecture: c.architecture ?? null,
      findings,
      contexts,
      metrics: metrics ? serialiseMetrics(metrics) : null,
      verdict: verdictOf(findings, contexts, { rendered: batch.available }),
      rendered: batch.available,
    };
  });

  // Only contenders are compared. A perceptual hash of a near-empty or a
  // near-solid render carries almost no signal, so two already-rejected marks
  // collide with each other and with everything else, and the report fills up
  // with duplicate warnings about marks nobody is going to look at.
  const live = audited.map((a, i) => (a.verdict === 'rejected' ? -1 : i)).filter((i) => i >= 0);
  const duplicates = batch.available
    ? findNearDuplicates(live.map((i) => batch.results[i]), {
      ids: live.map((i) => candidates[i].id),
      groups: live.map((i) => candidates[i].refines ?? null),
    })
    : [];

  for (const pair of duplicates) {
    for (const a of audited) {
      if (a.id !== pair.a && a.id !== pair.b) continue;
      const other = a.id === pair.a ? pair.b : pair.a;
      a.findings.push(pair.kind === 'unchanged'
        ? finding('warn', 'unchanged', `This is the same artwork as ${other}, so the refinement it was asked for has not been done.`, {
          fix: 'Two refinements of one mark should differ in the thing each was asked to change.',
          basis: 'derived',
        })
        : finding('warn', 'near-duplicate', `This reads as the same idea as ${other}${pair.distance === 0 ? ', which is byte for byte the same silhouette' : `, ${(pair.distance * 100).toFixed(1)} per cent apart at 64px`}.`, {
          fix: 'Two entries showing the same idea do not offer two choices.',
          basis: 'derived',
        }));
    }
  }

  return { candidates: audited, duplicates, rendered: batch.available };
}

/** BigInt hashes do not survive JSON, so they leave as hex. */
function serialiseMetrics(metrics) {
  const out = {};
  for (const [size, m] of Object.entries(metrics)) {
    const { silhouette: _drop, ...rest } = m;
    out[size] = { ...rest, hash: m.hash?.toString(16) ?? null };
  }
  return out;
}

export default {
  AUDIT_SIZES,
  DERIVED,
  auditStructure,
  auditContexts,
  auditRenderMetrics,
  auditOneColour,
  auditCandidates,
  renderBatch,
  spriteLayout,
  tighten,
  strokeRatio,
  paintCount,
  centreOffset,
  findNearDuplicates,
  silhouette,
  silhouetteDistance,
  countColourRegions,
  solidRegions,
  verdictOf,
};
