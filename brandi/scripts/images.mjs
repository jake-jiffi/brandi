/**
 * Catalogue what the photographs ACTUALLY are, before anyone plans what to do
 * with them.
 *
 * ===================== THE FAILURE THIS EXISTS FOR =====================
 *
 * A client hands over a folder. The natural next move is to start planning: a
 * full-bleed hero here, a banner there, a square for social. Every one of those
 * decisions is a decision about the SHAPE of a photograph, and none of them can
 * be made from a file count.
 *
 * Measured on a real engagement: of 200 photographs in the client's social
 * archive, 112 were portrait and 65 square. Twenty-three were landscape. A
 * full-bleed 3:1 hero applied to that set shows 22% of a 2:3 portrait, dead
 * centre, so a candid of two people at a counter arrives as two decapitated
 * torsos. The same folder's newest and most deliberate photographs, the ones
 * somebody went out and shot on purpose, were HEIC straight off a phone, which
 * most tooling skips in silence while reporting the archive as the whole set.
 *
 * ========================== WHAT IT DECIDES ============================
 *
 * Three things are measurable, and are decided here deterministically:
 *
 *   1. HOW MUCH OF THE FRAME SURVIVES a given slot. A cover crop shows
 *      `min(source, slot) / max(source, slot)` of the picture. That turns "this
 *      looks wrong" into "you are throwing away 78% of the photograph".
 *   2. HOW BIG it can be shown before it goes soft, on screen at 1x and 2x.
 *   3. HOW BIG it can be PRINTED at 300dpi, which is the question a flyer, a
 *      shopfront and a vehicle wrap each ask and a website never does.
 *
 * One thing is NOT measurable and must never be guessed: WHERE THE SUBJECT IS.
 * A 70% crop that keeps two faces is fine and a 90% crop that slices one is not,
 * and pixels cannot tell you which. So `subject` is written null and filled in
 * by whoever LOOKS at the picture. `--check` fails while any photograph in the
 * set is unreviewed, so "nobody looked" is a visible state rather than a silent
 * default.
 *
 * The idea, the crop arithmetic and the reviewed/unreviewed mechanism are taken
 * from Palate's `palate-assets.mjs`, which solved this first. What is different
 * here: no dependency, because Brandi has none; slots that are brand surfaces
 * rather than website sections; print resolution, because a brand meets paper;
 * and a summary that survives a folder of five hundred files, because a
 * per-file report of five hundred images is a report nobody reads.
 */

import { readdir, stat, writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { imageSize } from './imagesize.mjs';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.heic', '.heif', '.tif', '.tiff', '.bmp']);
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.webm', '.avi']);
const VECTOR_EXT = new Set(['.svg']);

/**
 * The surfaces a brand actually lands on, as width/height.
 *
 * These are not website sections. A brand meets a shopfront, a van, a flyer and
 * a phone, and those have wildly different shapes: a shopfront band is 3:1 and a
 * phone screen is 0.46:1, which is a factor of six. A photograph cannot serve
 * both, and knowing that before the plan is written is the entire point.
 */
export const SLOTS = Object.freeze([
  { name: 'shopfront band', ratio: 3 / 1, print: true, note: 'Read at twenty metres, so the subject has to survive being small.' },
  { name: 'vehicle panel', ratio: 7 / 3, print: true, note: 'A door seam and a wheel arch cut through it.' },
  { name: 'open graph card', ratio: 1200 / 630 },
  { name: 'deck slide', ratio: 16 / 9 },
  { name: 'business card', ratio: 89 / 51, print: true },
  { name: 'social square', ratio: 1 / 1 },
  { name: 'avatar circle', ratio: 1 / 1, note: 'Cropped to a circle, so the corners are gone before anyone sees it.' },
  { name: 'A4 flyer', ratio: 1 / 1.414, print: true, note: 'Portrait. The one most client photography actually suits.' },
  { name: 'social story', ratio: 9 / 16 },
  { name: 'phone screen', ratio: 390 / 844 },
]);

/** A cover crop keeps the smaller aspect over the larger. 2:3 into 3:1 is 0.22. */
export function visibleFraction(sourceRatio, slotRatio) {
  if (!(sourceRatio > 0) || !(slotRatio > 0)) return 0;
  return Math.min(sourceRatio, slotRatio) / Math.max(sourceRatio, slotRatio);
}

export function orientationOf(ratio) {
  if (ratio < 0.9) return 'portrait';
  if (ratio <= 1.1) return 'square';
  if (ratio < 2.2) return 'landscape';
  return 'panoramic';
}

/**
 * Photograph or furniture.
 *
 * Crop loss is a question about photography and nothing else. "This 16px
 * favicon shows 33% of the frame in a shopfront band" is arithmetically true and
 * useless, and a report opening with five favicons is a report nobody finishes.
 */
export function kindOf(relPath, meta) {
  const p = relPath.toLowerCase();
  if (/(^|\/)(brand|icons?|favicons?|logos?)\//.test(p)) return 'furniture';
  if (/favicon|apple-touch|android-chrome|mstile|maskable|logo|wordmark|monogram|sprite|badge|screenshot|screen shot/.test(p)) return 'furniture';
  if (meta.format === 'png' && meta.width <= 512 && Math.abs(meta.width - meta.height) <= 2) return 'furniture';
  if (meta.width <= 128 || meta.height <= 128) return 'furniture';
  return 'photo';
}

/** Largest CSS width before it upscales. At 2x you need twice the pixels. */
export const maxCssWidth = (px) => ({ at1x: px, at2x: Math.floor(px / 2) });

/**
 * Largest print size at 300dpi, in millimetres.
 *
 * The question a website never asks and every brand does. A 1080px social export
 * is 91mm wide on paper, which is a business card and not a flyer, and finding
 * that out at the printer is finding it out too late.
 */
export function printableMm(width, height, dpi = 300) {
  const mm = (px) => Math.round((px / dpi) * 25.4);
  return { widthMm: mm(width), heightMm: mm(height), dpi };
}

/** Does it hold at A4, at A5, or only on a card? Named, so nobody has to divide. */
export function printVerdict(widthMm, heightMm) {
  const long = Math.max(widthMm, heightMm);
  const short = Math.min(widthMm, heightMm);
  if (long >= 297 && short >= 210) return 'A4 or larger';
  if (long >= 210 && short >= 148) return 'A5';
  if (long >= 105) return 'a card, no bigger';
  return 'too small to print at any useful size';
}

/** Everything a measurement can support on its own, with the reason attached. */
export function assess(meta, { slots = SLOTS, kind = 'photo' } = {}) {
  const ratio = meta.width / meta.height;
  const base = {
    kind,
    ratio: +ratio.toFixed(3),
    orientation: orientationOf(ratio),
    megapixels: +((meta.width * meta.height) / 1e6).toFixed(1),
  };

  // Furniture is measured and recorded, never judged on crop: those questions
  // only mean something about a photograph.
  if (kind !== 'photo') {
    return { ...base, maxCssWidth: maxCssWidth(meta.width), fits: [], print: null, notes: [], subject: null, treatment: null, reviewed: true };
  }

  const css = maxCssWidth(meta.width);
  const mm = printableMm(meta.width, meta.height);
  const print = { ...mm, verdict: printVerdict(mm.widthMm, mm.heightMm) };

  const fits = slots.map((s) => {
    const visible = visibleFraction(ratio, s.ratio);
    return {
      slot: s.name,
      ratio: +s.ratio.toFixed(3),
      visible: +visible.toFixed(3),
      verdict: visible >= 0.7 ? 'ok' : visible >= 0.5 ? 'risky' : 'destructive',
    };
  });

  const notes = [];
  if (base.orientation === 'portrait') {
    notes.push('Portrait. Never letterbox it: give it a portrait or square slot, or set it beside text rather than behind it.');
  }
  if (meta.width < 1600) {
    notes.push(`Only ${meta.width}px wide, so ${css.at2x}px is its honest limit on a retina screen.`);
  }
  if (print.verdict === 'too small to print at any useful size' || print.verdict === 'a card, no bigger') {
    notes.push(`At 300dpi this is ${mm.widthMm}x${mm.heightMm}mm: ${print.verdict}.`);
  }
  const destructive = fits.filter((f) => f.verdict === 'destructive').map((f) => f.slot);
  if (destructive.length) notes.push(`Destroys the frame in: ${destructive.join(', ')}.`);

  return {
    ...base,
    maxCssWidth: css,
    print,
    fits,
    notes,
    // Not measurable from pixels. Filled in by whoever looks at the picture.
    subject: null,
    treatment: null,
    reviewed: false,
  };
}

async function walk(dir, out = { images: [], video: [], vector: [] }, depth = 0) {
  if (depth > 12) return out;
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out, depth + 1);
    else {
      const ext = path.extname(e.name).toLowerCase();
      if (IMAGE_EXT.has(ext)) out.images.push(p);
      else if (VIDEO_EXT.has(ext)) out.video.push(p);
      else if (VECTOR_EXT.has(ext)) out.vector.push(p);
    }
  }
  return out;
}

/**
 * Catalogue a directory.
 *
 * `prior` carries forward any review somebody has already done: re-measuring
 * must never silently discard the half that took a person looking at the
 * picture.
 */
export async function catalogueImages(dir, { slots = SLOTS, prior = {} } = {}) {
  const found = await walk(dir);
  const assets = {};
  let unreadable = 0;

  for (const f of found.images) {
    const key = path.relative(dir, f);
    const size = await imageSize(f);
    if (size.error) {
      unreadable++;
      assets[key] = { error: size.error, reviewed: false };
      continue;
    }
    let bytes = 0;
    try { bytes = (await stat(f)).size; } catch { /* size is a nicety */ }
    const meta = { ...size, bytes };
    const kind = kindOf(key, meta);
    const a = { ...meta, ...assess(meta, { slots, kind }) };
    const was = prior[key];
    if (was?.reviewed) {
      a.subject = was.subject ?? null;
      a.treatment = was.treatment ?? null;
      a.reviewed = true;
    }
    assets[key] = a;
  }

  const readable = Object.entries(assets).filter(([, a]) => !a.error);
  const photos = readable.filter(([, a]) => a.kind === 'photo');
  const byOrientation = {};
  for (const [, a] of photos) byOrientation[a.orientation] = (byOrientation[a.orientation] ?? 0) + 1;
  const byPrint = {};
  for (const [, a] of photos) byPrint[a.print.verdict] = (byPrint[a.print.verdict] ?? 0) + 1;

  // Which slot the set as a whole actually suits, which is the fact that decides
  // the layout. Scored as the mean visible fraction across every photograph.
  const slotFit = slots.map((s) => {
    const scores = photos.map(([, a]) => a.fits.find((f) => f.slot === s.name)?.visible ?? 0);
    const mean = scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : 0;
    const destroys = scores.filter((v) => v < 0.5).length;
    return { slot: s.name, ratio: +s.ratio.toFixed(3), meanVisible: +mean.toFixed(3), destroys };
  }).sort((a, b) => b.meanVisible - a.meanVisible);

  return {
    version: 1,
    dir,
    counts: {
      images: found.images.length,
      measured: readable.length,
      photos: photos.length,
      furniture: readable.length - photos.length,
      unreadable,
      reviewed: photos.filter(([, a]) => a.reviewed).length,
      byOrientation,
      byPrint,
      video: found.video.length,
      vector: found.vector.length,
      // A browser decodes neither HEIC nor HEIF, so an artboard referencing one
      // renders a broken image and says nothing about it.
      browserBlocked: readable.filter(([, a]) => a.format === 'heic').length,
      rotated: readable.filter(([, a]) => a.rotated).length,
    },
    slotFit,
    slots: slots.map((s) => ({ name: s.name, ratio: +s.ratio.toFixed(3), note: s.note ?? null })),
    assets,
  };
}

/**
 * The summary, which is the point.
 *
 * Somebody has to see the SHAPE of the set in one screen, because "most of these
 * are portrait" is the fact that decides the whole plan. A folder of five
 * hundred photographs listed one per line is a file listing, not a catalogue.
 */
export function summarise(doc) {
  const c = doc.counts;
  const lines = [`${c.measured} of ${c.images} images measured in ${doc.dir}`];

  lines.push(`  ${c.photos} photographs, ${c.furniture} logo or interface furniture (measured, not judged on crop)`);
  if (c.unreadable) lines.push(`  ${c.unreadable} unreadable, recorded rather than skipped`);
  if (c.video) lines.push(`  ${c.video} video files, which this does not measure and a brand system has to decide about`);
  if (c.browserBlocked) {
    lines.push('', `${c.browserBlocked} of these cannot be shown in a browser at all: HEIC is not a format Chrome decodes.`);
    lines.push('That matters more than the count suggests. The photographs somebody went out and shot on');
    lines.push('purpose arrive off a phone as HEIC while the archive is JPEG, so these are usually the best');
    lines.push('images in the set and the only ones that can carry a printed surface. Convert them before');
    lines.push('any artboard references them, or they are silently absent from every mockup:');
    lines.push('  sips -s format jpeg -Z 2400 <file>.HEIC --out <file>.jpg      (macOS)');
    lines.push('  magick <file>.HEIC -resize 2400x2400\\> <file>.jpg            (ImageMagick)');
  }
  if (c.rotated) {
    lines.push('', `${c.rotated} were stored one way round and are meant to be seen another, and are measured as seen.`);
  }
  if (c.vector) lines.push(`  ${c.vector} vector files, which are logo candidates rather than photography`);

  if (c.photos) {
    const orient = Object.entries(c.byOrientation).sort((a, b) => b[1] - a[1]);
    const [topShape, topCount] = orient[0];
    lines.push('', `Shape: ${orient.map(([k, v]) => `${v} ${k}`).join(', ')}.`);
    const pct = Math.round((topCount / c.photos) * 100);
    if (pct >= 60) {
      lines.push(`${pct}% of this set is ${topShape}. That is the fact that decides the layout, and it decides it before anybody draws anything.`);
    }

    lines.push('', 'Print, at 300dpi:');
    for (const [verdict, n] of Object.entries(c.byPrint).sort((a, b) => b[1] - a[1])) {
      lines.push(`  ${String(n).padStart(4)}  ${verdict}`);
    }

    lines.push('', 'Which surfaces this set actually suits, best first:');
    for (const s of doc.slotFit) {
      const flag = s.destroys ? `  (${s.destroys} destroyed)` : '';
      lines.push(`  ${String(Math.round(s.meanVisible * 100)).padStart(3)}%  ${s.slot}${flag}`);
    }

    const worst = doc.slotFit.at(-1);
    if (worst && worst.destroys > c.photos * 0.4) {
      lines.push('', `A ${worst.slot} would destroy ${worst.destroys} of ${c.photos} photographs. If the plan calls for one, the photography has to be reshot rather than cropped.`);
    }

    if (c.reviewed < c.photos) {
      lines.push('', `${c.photos - c.reviewed} of ${c.photos} photographs have never been looked at.`);
      lines.push('Pixels give you shape and crop loss. They cannot tell you where the subject is, and a crop');
      lines.push('that keeps two faces measures the same as one that slices them. View them, then record');
      lines.push('`subject` and `treatment` against each.');
    }
  }

  return lines.join('\n');
}

export default { catalogueImages, summarise, assess, visibleFraction, orientationOf, kindOf, printableMm, printVerdict, SLOTS };
