/**
 * Brandi typography engine. Zero dependencies.
 *
 * Turns two decisions (a base size and a ratio) into a complete, accessible
 * type system: a named scale, fluid clamp() values that survive browser zoom,
 * line heights that change with size the way they should, and a measure that
 * keeps lines readable.
 *
 * Sources for the numbers, not vibes:
 *   - Measure of 45-75 characters: Bringhurst, "The Elements of Typographic
 *     Style", 2.1.2. 66 is his single-column ideal.
 *   - WCAG 2.2 1.4.12 Text Spacing: content must survive line-height 1.5,
 *     paragraph spacing 2x font size, letter-spacing 0.12em, word-spacing
 *     0.16em.  https://www.w3.org/TR/WCAG22/#text-spacing
 *   - WCAG 2.2 1.4.4 Resize Text: text must scale to 200% without loss.
 *     This is why every fluid size keeps a rem term rather than being pure vw.
 *     https://www.w3.org/TR/WCAG22/#resize-text
 *   - Modular scales: the ratios are musical intervals, a convention that
 *     predates the web. The claim they make text "harmonious" is a design
 *     convention, not a research finding; what they reliably give you is a
 *     small, defensible set of sizes instead of nineteen arbitrary ones.
 */

/** Named ratios, with the interval each is borrowed from. */
export const RATIOS = Object.freeze({
  'minor-second': { value: 1.067, note: 'Barely a step. Dense UI, data tables.' },
  'major-second': { value: 1.125, note: 'Tight. Long-form reading, documentation.' },
  'minor-third': { value: 1.2, note: 'The safe default for product UI.' },
  'major-third': { value: 1.25, note: 'Clear hierarchy without shouting. Marketing sites.' },
  'perfect-fourth': { value: 1.333, note: 'Confident editorial contrast.' },
  'augmented-fourth': { value: 1.414, note: 'Dramatic. Needs generous whitespace.' },
  'perfect-fifth': { value: 1.5, note: 'Poster-like. Few steps before it runs away.' },
  golden: { value: 1.618, note: 'Very dramatic. Two or three steps at most.' },
});

/**
 * Step names, from smallest to largest, with the job each does.
 * Named rather than numbered (`text-sm`, not `text-3`) because a name survives
 * inserting a step; a number does not.
 */
export const STEPS = Object.freeze([
  { name: '2xs', offset: -3, use: 'Legal lines, dense table metadata' },
  { name: 'xs', offset: -2, use: 'Captions, helper text, badges' },
  { name: 'sm', offset: -1, use: 'Secondary UI text, labels' },
  { name: 'base', offset: 0, use: 'Body copy. Everything is measured from here' },
  { name: 'md', offset: 1, use: 'Lead paragraphs, large UI text' },
  { name: 'lg', offset: 2, use: 'Card and section headings' },
  { name: 'xl', offset: 3, use: 'Sub-headings' },
  { name: '2xl', offset: 4, use: 'Page headings' },
  { name: '3xl', offset: 5, use: 'Hero headings' },
  { name: '4xl', offset: 6, use: 'Display, one per page at most' },
]);

/**
 * Minimum sizes that are not negotiable, gathered in one place so a generator
 * can check itself rather than hoping.
 */
export const FLOORS = Object.freeze({
  bodyScreenPx: 16,
  anyScreenPx: 12,
  bodyPrintPt: 12,
  // WCAG 2.2 2.5.8 Target Size (Minimum), AA. 44 is the AAA figure from 2.5.5
  // and the one most platforms adopted, so it is the one worth designing to.
  targetMinPx: 24,
  targetComfortablePx: 44,
});

const round = (n, dp = 4) => Number(n.toFixed(dp));

/**
 * Line height as a function of size. Big type needs proportionally less
 * leading than small type: at 14px, 1.5 is comfortable; at 64px the same
 * multiplier leaves a canyon between lines. The curve below interpolates
 * between a body value and a display value across the size range, and never
 * returns less than 1.5 for anything at or below body size. That floor is
 * what WCAG 1.4.12 assumes for readable copy.
 */
export function lineHeightFor(px, { bodyPx = 16, body = 1.55, display = 1.05 } = {}) {
  if (px <= bodyPx) return body;
  // Log interpolation, so the tightening slows down as sizes get very large.
  const t = Math.min(Math.log(px / bodyPx) / Math.log(72 / bodyPx), 1);
  return round(body + (display - body) * t, 3);
}

/**
 * Letter spacing as a function of size. Display type set at body tracking
 * looks loose; small type set at display tracking looks cramped. Expressed in
 * em so it scales with the size it is applied to.
 */
export function letterSpacingFor(px, { bodyPx = 16 } = {}) {
  if (px >= 48) return '-0.022em';
  if (px >= 32) return '-0.017em';
  if (px >= 24) return '-0.012em';
  if (px >= bodyPx) return '-0.006em';
  if (px >= 14) return '0em';
  return '0.01em';
}

/**
 * A fluid size as a CSS clamp(). The middle term deliberately keeps a rem
 * component: `clamp(1rem, 4vw, 2rem)` alone would ignore the user's browser
 * font size at most viewport widths, which fails WCAG 1.4.4.
 *
 * @param {number} minPx   size at minVw
 * @param {number} maxPx   size at maxVw
 * @param {{minVw?: number, maxVw?: number, rootPx?: number}} opts
 */
export function fluid(minPx, maxPx, { minVw = 390, maxVw = 1280, rootPx = 16 } = {}) {
  if (maxVw <= minVw) throw new RangeError('maxVw must exceed minVw');
  const minRem = minPx / rootPx;
  const maxRem = maxPx / rootPx;
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const interceptRem = (minPx - slope * minVw) / rootPx;
  const vw = round(slope * 100, 4);
  const lo = Math.min(minRem, maxRem);
  const hi = Math.max(minRem, maxRem);
  return `clamp(${round(lo, 4)}rem, ${round(interceptRem, 4)}rem + ${vw}vw, ${round(hi, 4)}rem)`;
}

/**
 * Build a complete type scale.
 *
 * @param {object} opts
 * @param {number} opts.basePx    body size at the small end. 16 is the floor
 *                                for body copy: it is the browser default and
 *                                anything smaller is a deliberate choice to
 *                                make reading harder.
 * @param {number} opts.baseMaxPx body size at the large end, for fluid scales.
 * @param {string|number} opts.ratio  a RATIOS key, or a raw number.
 * @param {number} opts.ratioMax  optional larger ratio at wide viewports, so
 *                                headings grow faster than body copy does.
 * @param {boolean} opts.fluid    emit clamp() values as well as fixed px.
 */
export function typeScale({
  basePx = 16,
  baseMaxPx = null,
  ratio = 'major-third',
  ratioMax = null,
  fluid: wantFluid = true,
  minVw = 390,
  maxVw = 1280,
  rootPx = 16,
} = {}) {
  const r = typeof ratio === 'number' ? ratio : RATIOS[ratio]?.value;
  if (!r) throw new TypeError(`unknown ratio: ${ratio}`);
  if (r <= 1) throw new RangeError('ratio must be greater than 1');
  const rMax = ratioMax == null ? r : (typeof ratioMax === 'number' ? ratioMax : RATIOS[ratioMax]?.value);
  if (!rMax) throw new TypeError(`unknown ratioMax: ${ratioMax}`);
  const baseMax = baseMaxPx ?? basePx;

  // Above body size the scale is a straight geometric series. Below it, the
  // ratio is compressed to its square root, because there is only about 4px of
  // usable range between 16px body copy and the 12px floor: a full-ratio step
  // down lands under the floor immediately and the small end of the scale
  // simply does not exist. Compressing keeps two or three usable small sizes,
  // which is what captions, labels and helper text actually need.
  const down = Math.sqrt(r);
  const downMax = Math.sqrt(rMax);
  const sizeAt = (base, up, dn, offset) =>
    base * Math.pow(offset < 0 ? dn : up, offset);

  const all = STEPS.map(({ name, offset, use }) => {
    const minPx = round(sizeAt(basePx, r, down, offset), 2);
    const maxPx = round(sizeAt(baseMax, rMax, downMax, offset), 2);
    const representative = Math.max(minPx, maxPx);
    const entry = {
      name,
      offset,
      use,
      px: minPx,
      maxPx,
      rem: round(minPx / rootPx, 4),
      lineHeight: lineHeightFor(representative, { bodyPx: basePx }),
      letterSpacing: letterSpacingFor(representative, { bodyPx: basePx }),
    };
    if (wantFluid) entry.clamp = fluid(minPx, maxPx, { minVw, maxVw, rootPx });
    return entry;
  });

  // A step below the 12px floor is not a small step, it is an unusable one.
  // Drop it rather than shipping a token nobody may responsibly apply, and say
  // which ones went, so the omission reads as a decision rather than a bug.
  const dropped = all
    .filter((s) => s.offset < 0 && s.px < FLOORS.anyScreenPx)
    .map((s) => ({ name: s.name, px: s.px, reason: `below the ${FLOORS.anyScreenPx}px legibility floor` }));
  const droppedNames = new Set(dropped.map((d) => d.name));
  const steps = all.filter((s) => !droppedNames.has(s.name));

  const warnings = [];
  if (basePx < 16) {
    warnings.push(
      `Body copy is set at ${basePx}px. 16px is the browser default and the ` +
        `practical floor for reading; below it, people zoom, and layouts that ` +
        `were never tested at zoom fall apart.`,
    );
  }
  if (!steps.some((s) => s.offset < 0)) {
    warnings.push(
      `No step survives below body size: every smaller size lands under the ` +
        `${FLOORS.anyScreenPx}px floor. Captions, labels and helper text have ` +
        `nowhere to go. Raise the base size or choose a tighter ratio.`,
    );
  }
  if (steps.at(-1).maxPx / steps[0].px > 14) {
    warnings.push(
      `The scale spans ${round(steps.at(-1).maxPx / steps[0].px, 1)}x from ` +
        `smallest to largest. Past about 14x the middle steps stop being ` +
        `distinguishable from their neighbours. Use fewer steps at a bigger ratio.`,
    );
  }

  return {
    basePx,
    baseMaxPx: baseMax,
    ratio: r,
    ratioMax: rMax,
    ratioName: typeof ratio === 'string' ? ratio : null,
    rootPx,
    viewports: { minVw, maxVw },
    steps,
    byName: Object.fromEntries(steps.map((s) => [s.name, s])),
    dropped,
    warnings,
  };
}

/**
 * Measure: how wide a column of text should be.
 *
 * `ch` is the honest unit here: it is defined as the advance width of "0" in
 * the actual rendered font, so `max-width: 66ch` means 66 characters in that
 * font, not in an average one. The px figure is an estimate only, useful for
 * grid planning, and assumes an average glyph advance of 0.5em, which holds
 * for most text faces to within about 10%.
 */
export function measure(chars = 66, { fontSizePx = 16, avgAdvanceEm = 0.5 } = {}) {
  if (chars < 20 || chars > 200) throw new RangeError('measure should be between 20 and 200 characters');
  const verdict =
    chars < 45 ? 'too narrow: the eye jumps back too often and rhythm breaks down'
      : chars > 75 ? 'too wide: the eye loses the start of the next line'
        : chars > 70 ? 'at the wide end of comfortable'
          : 'within the comfortable range';
  return {
    chars,
    css: `${chars}ch`,
    approxPx: Math.round(chars * fontSizePx * avgAdvanceEm),
    comfortable: chars >= 45 && chars <= 75,
    verdict,
    source: 'Bringhurst, The Elements of Typographic Style, 2.1.2',
  };
}

/**
 * WCAG 2.2 1.4.12 asks that content survive a reader forcing looser spacing.
 * This returns the CSS a layout must not break under, so it can be applied in
 * a test rather than remembered.
 */
export function textSpacingStressCss(selector = 'body *') {
  return `${selector} {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
${selector.replace(/\*$/, 'p')} {
  margin-bottom: 2em !important;
}`;
}

/** Points to CSS pixels at the 96 px/inch the design canvas authors in. */
export const ptToPx = (pt) => round((pt * 96) / 72, 2);
/** CSS pixels to points. */
export const pxToPt = (px) => round((px * 72) / 96, 2);

export default {
  RATIOS, STEPS, FLOORS,
  typeScale, fluid, lineHeightFor, letterSpacingFor, measure,
  textSpacingStressCss, ptToPx, pxToPt,
};
