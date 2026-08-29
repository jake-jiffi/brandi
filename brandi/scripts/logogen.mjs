/**
 * Turning an approved concept into a master, and the arithmetic that goes with
 * it.
 *
 * Three things live here, and they are the three parts of logo production that
 * are genuinely deterministic. Everything else, which is to say the drawing, is
 * judgement and belongs to a person.
 *
 * **The typeset wordmark.** The name, set in a licensed face and converted to
 * outlines, so what ships is artwork rather than a font dependency. This is not
 * a consolation prize. A large share of the world's most recognised identities
 * are wordmarks set in or derived from an existing typeface, and what makes one
 * an asset is that it was applied consistently for long enough to be recognised,
 * not that its curves were drawn from nothing.
 *
 * **The lockup.** Given a symbol and a wordmark, compose them with the gap tied
 * to the wordmark's own height rather than set in absolute units. A lockup with
 * an absolute gap stretches at large sizes and crowds at small ones, and it is
 * the single most common construction defect in a young identity. Doing it as
 * arithmetic also means the horizontal and the stacked versions cannot drift
 * apart, because they are built from the same two files by the same rule.
 *
 * **The minimum size.** Not a number somebody liked. The thinnest feature in the
 * artwork decides it: at the size where that feature is one physical pixel, the
 * mark is at its floor, and below it the browser renders that feature as a
 * paler grey than the rest and the mark looks like a printing fault. The same
 * ratio against a press's reproducible line weight gives the print floor. Both
 * numbers record which feature set them, because that is what the number means
 * and what the next designer may not change.
 */

import { inkBounds, parsePath, pathToString, collectShapes } from './svg.mjs';
import { textToSvg, glyphForCodePoint, glyphPath } from './font.mjs';
import { svgChildren, monochromeSvg } from './assets.mjs';
import { toGrey, decodePng, minFeatureWidth } from './png.mjs';
import { renderBatch, tighten } from './logoaudit.mjs';
import { findChrome } from './preview.mjs';

/**
 * The date where the person is, not where the server thinks it is.
 *
 * `toISOString` is UTC, so anywhere east of Greenwich records the previous day
 * for the first hours of the morning. On a provenance record that is going to be
 * read as evidence of when the work was done, that is not a rounding error.
 */
export function localDate(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const round = (n, p = 2) => {
  const r = Number(Number(n).toFixed(p));
  return Object.is(r, -0) ? 0 : r;
};

// ---------------------------------------------------------------------------
// Normalising a master
// ---------------------------------------------------------------------------

/**
 * The production clean-up, and nothing beyond it.
 *
 * Deliberately conservative. Every operation here is one that cannot change
 * what the mark looks like: retarget the viewBox to the artwork, round path
 * coordinates to a precision far finer than any output device resolves, drop
 * editor metadata, and make sure the file declares a namespace and states its
 * paints. Collapsing transforms and merging paths are not done, because both
 * can silently change a fill rule or a paint order, and a "clean" master that
 * is a different shape is worse than a messy one that is right.
 */
export function normaliseMaster(source, { precision = 2, padding = 0, fill = null } = {}) {
  if (!source || typeof source !== 'string') throw new TypeError('normaliseMaster needs SVG source');

  let out = source
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(sodipodi|inkscape|serif|illustrator):[-\w]+\s*=\s*(["'])[\s\S]*?\2/gi, '')
    .replace(/<(sodipodi|inkscape|metadata)\b[\s\S]*?<\/\1[^>]*>/gi, '')
    .replace(/<metadata\b[\s\S]*?<\/metadata>/gi, '')
    .trim();

  if (fill) out = monochromeSvg(out, fill);

  // Coordinates go to a stated precision. Two decimal places on a mark drawn in
  // a 1000 unit box is a hundredth of one per cent of its width, which no press
  // and no display resolves, and it typically halves the file.
  out = out.replace(/(\bd\s*=\s*)(["'])([^"']*)\2/gi, (m, lead, q, d) => {
    const segs = parsePath(d);
    if (!segs.length) return m;
    return `${lead}${q}${pathToString(segs, precision)}${q}`;
  });

  const ink = inkBounds(out);
  const children = svgChildren(out);
  if (!ink || !children || !(ink.width > 0) || !(ink.height > 0)) {
    // Nothing measurable. Hand it back rather than emit a confidently wrong box.
    return out;
  }

  const pad = padding * Math.max(ink.width, ink.height);
  const box = {
    x: round(ink.x - pad, precision),
    y: round(ink.y - pad, precision),
    w: round(ink.width + pad * 2, precision),
    h: round(ink.height + pad * 2, precision),
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" width="${box.w}" height="${box.h}">
${children}
</svg>`;
}

/** The two renditions every handover needs, derived rather than redrawn. */
export function monoVariants(master, { black = '#000000', white = '#FFFFFF' } = {}) {
  return { black: monochromeSvg(master, black), white: monochromeSvg(master, white) };
}

// ---------------------------------------------------------------------------
// The typeset wordmark
// ---------------------------------------------------------------------------

/**
 * The name, set and outlined, with the recipe recorded alongside it.
 *
 * The recipe is not bookkeeping. Without the face, its version, the size it was
 * set at and the tracking, the wordmark cannot be rebuilt or extended, and
 * adding a sub-brand name two years later becomes guesswork with a ruler.
 *
 * `tracking` and `pairAdjust` are in thousandths of an em, which is how a
 * designer states them. Metric kerning is designed for running text at reading
 * sizes; a wordmark is one object at display size and needs the pairs adjusted
 * by eye. The code does the metric pass, a person looks at a render and supplies
 * the corrections, and both end up in the recipe.
 */
export function typesetWordmark(font, text, {
  size = 200,
  tracking = 0,
  pairAdjust = {},
  letterCase = 'as-given',
  fill = '#111111',
  family = null,
  weight = null,
  precision = 2,
} = {}) {
  if (!font) throw new TypeError('typesetWordmark needs a parsed font');
  const raw = String(text ?? '').trim();
  if (!raw) throw new TypeError('typesetWordmark needs a name to set');

  const cased = letterCase === 'upper' ? raw.toUpperCase()
    : letterCase === 'lower' ? raw.toLowerCase()
    : raw;

  let svg;
  try {
    svg = normaliseMaster(textToSvg(font, cased, { size, tracking, pairAdjust, fill }), { precision });
  } catch (e) {
    // The font's own name table is what the layout reports, and for a Google
    // static instance cut from a variable font that name is often the default
    // instance rather than the weight actually served: asking for Bitter 700
    // and being told "Bitter Thin has no glyph" sends somebody looking in the
    // wrong place. This layer knows what was requested, so it says that.
    if (family && /has no glyph for/.test(e.message)) {
      throw new Error(e.message.replace(/^layoutText: \S+(?: \S+)*? has no glyph/, `layoutText: ${family}${weight ? ` ${weight}` : ''} has no glyph`));
    }
    throw e;
  }
  const cap = capHeightOf(font, size);

  return {
    svg,
    capHeight: cap,
    recipe: {
      text: cased,
      letterCase,
      family,
      weight,
      unitsPerEm: font.unitsPerEm ?? null,
      setAt: size,
      tracking,
      pairAdjust: { ...pairAdjust },
      capHeight: cap,
      outlined: true,
      note: 'Keep the live-text source beside the outlined file. Without the face, its version, the size and the tracking, this wordmark cannot be rebuilt or extended.',
    },
  };
}

/**
 * The real cap height, taken off the capital H rather than guessed.
 *
 * A lockup's gap and symbol size are both multiples of cap height, so using the
 * wordmark's ink height instead (which for mixed case runs ascender to
 * descender) makes every lockup a little too airy in a way that is hard to see
 * and impossible to unsee once pointed out.
 */
export function capHeightOf(font, size = 1000) {
  try {
    const gid = glyphForCodePoint(font, 'H'.codePointAt(0));
    if (!gid) return null;
    const { bbox } = glyphPath(font, gid);
    if (!bbox || !(bbox.yMax > 0)) return null;
    return round((bbox.yMax * size) / font.unitsPerEm, 3);
  } catch {
    // A face with no H, or one this parser cannot read, is not a reason to fail
    // the whole wordmark. The caller falls back to the ink height and says so.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Lockups
// ---------------------------------------------------------------------------

/** Move and scale a whole mark into a target box, without distorting it. */
function place(source, { x, y, height, prefix }) {
  const ink = inkBounds(source);
  const children = svgChildren(source);
  if (!ink || !children || !(ink.height > 0)) return { markup: '', width: 0, height: 0 };
  const scale = height / ink.height;
  const width = ink.width * scale;
  const tx = x - ink.x * scale;
  const ty = y - ink.y * scale;
  const inner = prefix ? prefixIds(children, prefix) : children;
  return {
    markup: `  <g transform="translate(${round(tx, 3)} ${round(ty, 3)}) scale(${round(scale, 6)})">\n${inner}\n  </g>`,
    width,
    height,
  };
}

/** Two marks in one document is two chances they both named a clip path "a". */
function prefixIds(markup, prefix) {
  const ids = [...markup.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
  let out = markup;
  for (const id of new Set(ids)) {
    const safe = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out
      .replace(new RegExp(`\\bid\\s*=\\s*(["'])${safe}\\1`, 'g'), `id="${prefix}-${id}"`)
      .replace(new RegExp(`url\\(\\s*(['"]?)#${safe}\\1\\s*\\)`, 'g'), `url(#${prefix}-${id})`)
      .replace(new RegExp(`(href|xlink:href)\\s*=\\s*(["'])#${safe}\\2`, 'g'), `$1="#${prefix}-${id}"`);
  }
  return out;
}

/**
 * Compose a symbol and a wordmark into a lockup.
 *
 * `gapRatio` and `symbolRatio` are both multiples of the wordmark's own ink
 * height, which is what makes the result scale free. An absolute gap is the
 * construction defect that shows up as a lockup which is airy on a billboard
 * and cramped on a business card.
 *
 * The wordmark's ink height stands in for its cap height. For a wordmark set in
 * capitals they are the same number; for mixed case the ink height runs from the
 * ascender to the descender and is therefore larger, so a mixed-case lockup
 * built at the default ratios comes out a little more generous than the
 * textbook. Pass `capHeight` when the caller knows the real one, which the font
 * layout does.
 */
export function composeLockup({
  symbol,
  wordmark,
  orientation = 'horizontal',
  gapRatio = 0.5,
  symbolRatio = 1.15,
  capHeight = null,
  align = 'centre',
  precision = 2,
} = {}) {
  if (!symbol || !wordmark) throw new TypeError('a lockup needs both a symbol and a wordmark');

  const wordInk = inkBounds(wordmark);
  const symbolInk = inkBounds(symbol);
  if (!wordInk || !symbolInk) throw new TypeError('a lockup needs both marks to contain ink');

  const unit = capHeight ?? wordInk.height;
  const gap = gapRatio * unit;
  const symbolHeight = symbolRatio * unit;
  const symbolWidth = symbolInk.width * (symbolHeight / symbolInk.height);
  const wordHeight = wordInk.height;
  const wordWidth = wordInk.width;

  let parts;
  let width;
  let height;

  if (orientation === 'stacked') {
    width = Math.max(symbolWidth, wordWidth);
    height = symbolHeight + gap + wordHeight;
    parts = [
      place(symbol, { x: (width - symbolWidth) / 2, y: 0, height: symbolHeight, prefix: 'sym' }),
      place(wordmark, { x: (width - wordWidth) / 2, y: symbolHeight + gap, height: wordHeight, prefix: 'wm' }),
    ];
  } else {
    width = symbolWidth + gap + wordWidth;
    height = Math.max(symbolHeight, wordHeight);
    // Optical centring on the taller element, which is nearly always the symbol.
    const symbolY = align === 'baseline' ? height - symbolHeight : (height - symbolHeight) / 2;
    const wordY = align === 'baseline' ? height - wordHeight : (height - wordHeight) / 2;
    parts = [
      place(symbol, { x: 0, y: symbolY, height: symbolHeight, prefix: 'sym' }),
      place(wordmark, { x: symbolWidth + gap, y: wordY, height: wordHeight, prefix: 'wm' }),
    ];
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(width, precision)} ${round(height, precision)}" width="${round(width, precision)}" height="${round(height, precision)}">
${parts.map((p) => p.markup).join('\n')}
</svg>`;

  return {
    svg,
    construction: {
      orientation,
      unit: round(unit, precision),
      unitIs: capHeight ? 'the wordmark cap height' : 'the wordmark ink height, standing in for cap height',
      gap: round(gap, precision),
      gapRule: `${gapRatio} x ${capHeight ? 'cap height' : 'wordmark height'}`,
      symbolHeight: round(symbolHeight, precision),
      symbolRule: `${symbolRatio} x ${capHeight ? 'cap height' : 'wordmark height'}`,
      width: round(width, precision),
      height: round(height, precision),
    },
  };
}

// ---------------------------------------------------------------------------
// Clear space
// ---------------------------------------------------------------------------

/**
 * Clear space as a ratio of something in the mark, so it scales.
 *
 * A clear-space rule in millimetres is a rule that is wrong at every size except
 * the one it was written at. The measuring element has to be named, and it has
 * to be something anybody can find in the artwork without a ruler.
 */
export function clearSpaceRule(master, { basis = 'auto', ratio = null } = {}) {
  const ink = inkBounds(master);
  if (!ink) return null;

  // The height of the mark is the element anybody can find. For a wide lockup
  // the height is the short side, which makes the rule generous, and generous
  // is the correct direction to be wrong in for clear space.
  const element = basis === 'auto' ? 'the height of the mark' : basis;
  const chosen = ratio ?? 0.5;
  return {
    element,
    ratio: chosen,
    sentence: `Leave clear space on every side equal to ${chosen === 0.5 ? 'half' : chosen} ${element}. Nothing enters it: no type, no rule, no edge of the page, no other logo.`,
    units: round(chosen * ink.height, 2),
    inkHeight: round(ink.height, 2),
  };
}

// ---------------------------------------------------------------------------
// Minimum sizes
// ---------------------------------------------------------------------------

/** The white of the image, so eroding it measures gaps and counters. */
function invert(grey) {
  const out = new Uint8Array(grey.length);
  for (let i = 0; i < grey.length; i++) out[i] = 255 - grey[i];
  return out;
}

/**
 * The minimum sizes, derived rather than chosen.
 *
 * Rendered at a reference size, the thinnest run of ink and the thinnest run of
 * white are both measured. Either can be the thing that fails first: a hairline
 * stroke closes up, and so does the gap between two elements that have to stay
 * apart, or the counter of an `e`. The mark's floor is set by whichever is
 * thinner, and the answer records which one it was, because that is what the
 * number means.
 *
 * Screen: at the width where the thinnest feature is one physical pixel, the
 * mark is at its floor. Rounded up to the next ten, which is the headroom every
 * published guideline adds.
 *
 * Print: the same ratio against 0.25mm, a positive line weight offset litho
 * holds reliably. Screen print, embroidery and foil all need more, and the
 * result says so rather than pretending one number covers every process.
 */
export async function minimumSizes(master, { reference = 512, chrome = findChrome() } = {}) {
  const ink = inkBounds(master);
  if (!ink) return null;

  const geometric = (() => {
    const widths = collectShapes(master).filter((s) => !s.hidden && s.strokeWidth > 0).map((s) => s.strokeWidth);
    if (!widths.length) return null;
    return Math.min(...widths) / Math.max(ink.width, ink.height);
  })();

  if (!chrome) {
    if (geometric == null) return null;
    const ratio = 1 / geometric;
    return {
      screenPx: Math.ceil(ratio / 10) * 10,
      printMm: round(ratio * 0.25, 1),
      basis: 'the thinnest stroke, measured on the path data',
      measured: false,
      note: 'No browser was available, so gaps and counters were not measured. The real floor may be higher.',
    };
  }

  const batch = await renderBatch([master], { sizes: [reference], chrome, tightViewBox: true });
  if (!batch.available) return null;

  // Re-render on its own to get the pixels back, since renderBatch reports
  // measurements rather than the image. The ink measurement is already there;
  // the white one needs the raw cell, so it is recomputed from the same numbers.
  const m = batch.results[0][reference];
  const inkFeature = m.minFeature;

  const white = await measureWhite(master, reference, chrome);
  const candidates = [
    inkFeature > 0 ? { px: inkFeature, basis: 'the thinnest stroke or limb' } : null,
    white > 0 ? { px: white, basis: 'the smallest gap or counter, the white that has to stay open' } : null,
  ].filter(Boolean);

  if (!candidates.length) return null;
  const worst = candidates.reduce((a, b) => (a.px <= b.px ? a : b));
  const ratio = reference / worst.px;

  return {
    screenPx: Math.ceil(ratio / 10) * 10,
    printMm: round(ratio * 0.25, 1),
    basis: worst.basis,
    ratio: round(ratio, 1),
    measuredAt: reference,
    measured: true,
    isFloor: true,
    // Said plainly because the number is easy to misread as an answer. It is the
    // width at which the thinnest feature is exactly one pixel, which is a
    // necessary condition and not a sufficient one: a lockup carrying a wordmark
    // stops being readable well above it, usually by a factor of two or three,
    // and no measurement of a stroke can tell you that. The published minimum
    // comes from rendering the mark at this size and looking at it.
    note: 'This is a floor, not an answer. It is the size at which the thinnest feature is one pixel; a lockup with type in it usually stops being readable well above it. Render at this size, look, and publish the number that survives. The print figure assumes offset litho holding a 0.25mm positive line, and screen print, embroidery and foil each need more.',
  };
}

/** The thinnest white feature, which is the smallest gap the mark depends on. */
async function measureWhite(master, size, chrome) {
  const { writeFile, mkdir, rm, readFile } = await import('node:fs/promises');
  const path = (await import('node:path')).default;
  const os = (await import('node:os')).default;
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const { pathToFileURL } = await import('node:url');
  const run = promisify(execFile);

  const svg = tighten(master);
  const uri = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
  const dir = path.join(os.tmpdir(), `brandi-min-${process.pid}-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
  try {
    const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff}img{display:block;width:${size}px;height:${size}px;object-fit:contain}</style><img src="${uri}" alt="">`;
    const htmlPath = path.join(dir, 'm.html');
    const pngPath = path.join(dir, 'm.png');
    await writeFile(htmlPath, html);
    await run(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      '--no-default-browser-check', '--force-device-scale-factor=1', '--virtual-time-budget=4000',
      `--window-size=${size},${size}`, `--screenshot=${pngPath}`, pathToFileURL(htmlPath).href,
    ], { timeout: 60000 });
    const grey = toGrey(decodePng(await readFile(pngPath)));

    // The white outside the mark is not a gap, so the measurement is taken
    // inside the ink's own bounding box. Without that, every mark reports its
    // margin as its smallest gap and the minimum size comes out at ten pixels.
    const box = boxOfInk(grey, size);
    if (!box) return 0;
    const inner = cropGrey(grey, size, box);
    return minFeatureWidth(invert(inner), box.width, box.height);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function boxOfInk(grey, size, threshold = 128) {
  let minX = size;
  let minY = size;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grey[y * size + x] < threshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function cropGrey(grey, sheetWidth, box) {
  const out = new Uint8Array(box.width * box.height);
  for (let row = 0; row < box.height; row++) {
    const from = (box.y + row) * sheetWidth + box.x;
    out.set(grey.subarray(from, from + box.width), row * box.width);
  }
  return out;
}

// ---------------------------------------------------------------------------
// The record
// ---------------------------------------------------------------------------

/**
 * What has to be written down about a generated mark, and why.
 *
 * A mark that came out of a model has an unsettled provenance, and the honest
 * answer to that is a record rather than silence. Model, prompt, date, the slot
 * brief it was drawn against, and what a person did to it afterwards. This is
 * what lets anybody say later that the mark was deliberately developed rather
 * than lifted from somewhere nobody can name.
 */
export function generationRecord({ id, slot, model, prompt, date = new Date(), approvedBy = null, edits = [] } = {}) {
  return {
    id,
    generatedBy: model ?? 'unrecorded',
    generatedOn: localDate(date instanceof Date ? date : new Date(date)),
    slot: slot ? { id: slot.id, family: slot.family, architecture: slot.architecture, register: slot.register, symbolApproach: slot.symbolApproach } : null,
    prompt: prompt ?? null,
    edits,
    approvedBy,
    status: approvedBy ? 'approved by a person' : 'candidate, not approved',
    caveat: 'A generated mark is a starting point somebody approved, not a drawn one. Before it is registered or put on a building, run the similarity and trade mark searches and have a professional look at it.',
  };
}

export default {
  normaliseMaster,
  capHeightOf,
  monoVariants,
  typesetWordmark,
  composeLockup,
  clearSpaceRule,
  minimumSizes,
  generationRecord,
  localDate,
};
