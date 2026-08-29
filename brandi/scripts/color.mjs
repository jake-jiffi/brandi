/**
 * Brandi colour engine. Zero dependencies, Node stdlib only.
 *
 * Everything a brand needs to make colour decisions defensibly:
 *   - sRGB <-> linear <-> OKLab <-> OKLCH   (Ottosson, https://bottosson.github.io/posts/oklab/)
 *   - WCAG 2.2 contrast ratio               (https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio)
 *   - APCA Lc, W3 revision 0.1.9            (https://github.com/Myndex/SAPC-APCA)
 *   - sRGB gamut mapping by chroma reduction (CSS Color 4 sec. 13)
 *   - 12-step tonal ramps with Radix step semantics
 *   - Machado 2009 colour-vision-deficiency simulation
 *
 * Colour is stored internally as OKLCH {L: 0..1, C: 0..~0.4, h: 0..360}.
 * OKLCH is used rather than HSL because HSL lightness is not perceptual:
 * hsl(60 100% 50%) (yellow) and hsl(240 100% 50%) (blue) claim the same
 * lightness and differ by a contrast ratio of about 8:1. Ramps built in HSL
 * are therefore not comparable across hues; ramps built in OKLCH are.
 */

// ---------------------------------------------------------------------------
// Parsing and formatting
// ---------------------------------------------------------------------------

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Parse a hex string to {r,g,b,a} with channels in 0..1. Throws on garbage. */
export function parseHex(hex) {
  const m = HEX_RE.exec(String(hex).trim());
  if (!m) throw new TypeError(`not a hex colour: ${JSON.stringify(hex)}`);
  let h = m[1];
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  const hasAlpha = h.length === 8;
  return {
    r: ((hasAlpha ? n >>> 24 : n >>> 16) & 255) / 255,
    g: ((hasAlpha ? n >>> 16 : n >>> 8) & 255) / 255,
    b: ((hasAlpha ? n >>> 8 : n) & 255) / 255,
    a: hasAlpha ? (n & 255) / 255 : 1,
  };
}

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const to255 = (x) => Math.round(clamp01(x) * 255);

/** Format {r,g,b} (0..1) as #rrggbb, uppercase. Channels are clamped. */
export function toHex({ r, g, b }) {
  return (
    '#' +
    [r, g, b]
      .map((c) => to255(c).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** Format an OKLCH colour as a CSS `oklch()` string. */
export function formatOklch({ L, C, h }, { precision = 4 } = {}) {
  const p = (x, d) => Number(x.toFixed(d));
  return `oklch(${p(L * 100, 2)}% ${p(C, precision)} ${p(((h % 360) + 360) % 360, 2)})`;
}

// ---------------------------------------------------------------------------
// Transfer functions and colour space conversion
// ---------------------------------------------------------------------------

/** sRGB gamma-encoded channel -> linear-light. */
export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Linear-light channel -> sRGB gamma-encoded. */
export function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** Linear-light sRGB -> OKLab. */
export function linearRgbToOklab({ r, g, b }) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/** OKLab -> linear-light sRGB. May fall outside 0..1 (out of gamut). */
export function oklabToLinearRgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

/**
 * Reject an OKLCH triple that cannot mean anything.
 *
 * Negative chroma is not "a bit less colour": it renders the opposite hue, so
 * {C: -0.1, h: 200} silently produces a red where a teal was asked for. NaN
 * propagates all the way to the string "#NANNANNAN" in a deliverable. Both are
 * caller mistakes, and both are much cheaper to catch here than to debug from
 * a rendered artboard.
 */
function assertOklch(lch, where) {
  if (!lch || typeof lch !== 'object') throw new TypeError(`${where}: expected an OKLCH object`);
  const { L, C, h } = lch;
  for (const [name, v] of [['L', L], ['C', C], ['h', h]]) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new TypeError(`${where}: ${name} must be a finite number, got ${JSON.stringify(v)}`);
    }
  }
  if (C < 0) throw new RangeError(`${where}: chroma must not be negative (got ${C}); a negative chroma renders the opposite hue`);
  return lch;
}

/** OKLab -> OKLCH (polar form). */
export function oklabToOklch({ L, a, b }) {
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  // A neutral has no meaningful hue; report 0 rather than atan2 noise.
  return { L, C, h: C < 1e-7 ? 0 : h };
}

/** OKLCH -> OKLab. */
export function oklchToOklab({ L, C, h }) {
  const rad = (h * Math.PI) / 180;
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
}

/** Hex or {r,g,b} -> OKLCH. */
export function toOklch(input) {
  const rgb = typeof input === 'string' ? parseHex(input) : input;
  if (rgb && typeof rgb.L === 'number' && typeof rgb.C === 'number') return assertOklch(rgb, 'toOklch');
  if (!rgb || typeof rgb !== 'object') throw new TypeError(`toOklch: expected a hex string or {r,g,b}, got ${JSON.stringify(input)}`);
  const lin = {
    r: srgbToLinear(rgb.r),
    g: srgbToLinear(rgb.g),
    b: srgbToLinear(rgb.b),
  };
  return oklabToOklch(linearRgbToOklab(lin));
}

/** OKLCH -> gamma-encoded sRGB {r,g,b} in 0..1. Not gamut mapped; may clip. */
export function oklchToRgb(lch) {
  const lin = oklabToLinearRgb(oklchToOklab(lch));
  return {
    r: linearToSrgb(lin.r),
    g: linearToSrgb(lin.g),
    b: linearToSrgb(lin.b),
  };
}

const EPS = 1e-6;

/** True when an OKLCH colour lands inside sRGB without clipping. */
export function inSrgbGamut(lch) {
  assertOklch(lch, 'inSrgbGamut');
  const lin = oklabToLinearRgb(oklchToOklab(lch));
  return (
    lin.r >= -EPS && lin.r <= 1 + EPS &&
    lin.g >= -EPS && lin.g <= 1 + EPS &&
    lin.b >= -EPS && lin.b <= 1 + EPS
  );
}

/**
 * Map an OKLCH colour into sRGB by reducing chroma, holding lightness and hue.
 * This is the CSS Color 4 approach: hue and lightness are the perceptually
 * load-bearing parts of a brand colour, so chroma is what gives way.
 * Naive per-channel clipping instead shifts hue, which is why it is not used.
 */
export function gamutMapOklch(lch) {
  assertOklch(lch, 'gamutMapOklch');
  if (inSrgbGamut(lch)) return { ...lch };
  // Pure black and white are always representable at any hue.
  if (lch.L <= 0) return { L: 0, C: 0, h: lch.h };
  if (lch.L >= 1) return { L: 1, C: 0, h: lch.h };
  let lo = 0;
  let hi = lch.C;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgbGamut({ L: lch.L, C: mid, h: lch.h })) lo = mid;
    else hi = mid;
  }
  return { L: lch.L, C: lo, h: lch.h };
}

/** OKLCH -> #rrggbb, gamut mapped first so the hex is a faithful rendering. */
export function oklchToHex(lch) {
  return toHex(oklchToRgb(gamutMapOklch(lch)));
}

/** Largest in-gamut chroma for a given lightness and hue. */
export function maxChroma(L, h) {
  return gamutMapOklch({ L, C: 0.5, h }).C;
}

// ---------------------------------------------------------------------------
// Parsing colour out of real source code
// ---------------------------------------------------------------------------

/** The CSS named colours worth recognising in a brand audit. */
const NAMED = Object.freeze({
  black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#008000', blue: '#0000FF',
  yellow: '#FFFF00', orange: '#FFA500', purple: '#800080', pink: '#FFC0CB', grey: '#808080',
  gray: '#808080', silver: '#C0C0C0', navy: '#000080', teal: '#008080', maroon: '#800000',
  olive: '#808000', lime: '#00FF00', aqua: '#00FFFF', cyan: '#00FFFF', fuchsia: '#FF00FF',
  magenta: '#FF00FF', indigo: '#4B0082', violet: '#EE82EE', gold: '#FFD700',
  crimson: '#DC143C', salmon: '#FA8072', tomato: '#FF6347', coral: '#FF7F50',
  rebeccapurple: '#663399',
});

const hslToHex = (h, sPct, lPct) => {
  const sat = sPct / 100;
  const lig = lPct / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x]
    : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = lig - c / 2;
  return toHex({ r: r1 + m, g: g1 + m, b: b1 + m });
};

/**
 * Every colour literal in a piece of source, whatever notation it is written in.
 *
 * A palette check that only understands hex is evadable by typing the same
 * wrong colour as `rgb(31 111 74)`, which makes the enforcement theatre. Each
 * result carries its original text so a report can quote what is actually on
 * the line.
 *
 * @returns {Array<{hex: string, raw: string, index: number, notation: string}>}
 */
export function extractColors(text) {
  const out = [];
  const push = (hex, raw, index, notation) => { if (hex) out.push({ hex, raw, index, notation }); };

  // Fragment references are never colours, whatever they spell: `href="#abc"`
  // points at an element and `url(#fade)` at a filter. Both are common in SVG,
  // where real colours sit in `fill` and `stroke` instead.
  const fragment = /(?:\bhref\s*=\s*["'`]|\burl\(\s*["'`]?)$/i;

  // Six and eight digits are otherwise unambiguous. Four-digit #RGBA is dropped
  // entirely: legal CSS, vanishingly rare in practice, and indistinguishable
  // from a ticket number, which is what it turned out to be every time.
  for (const m of text.matchAll(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6})(?![0-9a-fA-F])/g)) {
    if (fragment.test(text.slice(Math.max(0, m.index - 12), m.index))) continue;
    try { push(toHex(parseHex(m[0])), m[0], m.index, 'hex'); } catch { /* not a colour */ }
  }
  // A three-digit hex is only a colour if something says so. `#847` is a colour
  // in `color:#847` and a ticket in `see #847`, and they are the same six
  // characters. Three signals settle it, any one of which is enough. Measured
  // against a 566MB monorepo: without them, thousands of issue references were
  // reported as off-palette colours, which is what made the report unreadable.
  const declaration = /(?:^|[;{\s])[-a-zA-Z]+\s*:[^;{}[\]]*$/;
  const LOOKBACK = 240;
  // `url(#clip)` is a fragment reference and `(#648)` is a ticket. Neither is a
  // colour, and a bracket on both sides is what says so: a CSS value never has
  // one. `issue #744` is the same thing said in words.
  const bracketed = (before, after) => /[([]$/.test(before) && /^[)\]]/.test(after);
  // `fixed` is deliberately absent: it is a real keyword in the `background`
  // shorthand, so `background: fixed #333` would lose a colour.
  const referenceWord = /\b(issues?|prs?|pull|closes?|fixes|resolves?|see|refs?|bugs?|tickets?|related|discussion|comment)\s+$/i;
  for (const m of text.matchAll(/#([0-9a-fA-F]{3})(?![0-9a-fA-F])/g)) {
    // 1. A hex letter. Issue and PR numbers are decimal, so `#fff` is never one.
    let isColour = /[a-fA-F]/.test(m[1]);
    // 2. A value position: `:`, `=`, a quote, `(` or `,` immediately before it.
    if (!isColour) isColour = /[:=("'`,]\s{0,4}$/.test(text.slice(Math.max(0, m.index - 6), m.index));
    // 3. Somewhere in the value of a declaration on this line, which is what
    //    `border: 1px solid #111` needs: nothing adjacent to it marks it, and
    //    all-decimal greys like #111 and #000 are common in shorthand. The `[`
    //    exclusion is what keeps `- feat: something ([#892])` out.
    if (!isColour) {
      // Bounded, because minified CSS is one line: taking the whole prefix made
      // this quadratic, and a 1MB bundle took a minute and a half. A property
      // name sits within a couple of hundred characters of its value or it is
      // not the property this hex belongs to.
      let line = text.slice(Math.max(0, m.index - LOOKBACK), m.index);
      const nl = line.lastIndexOf('\n');
      if (nl >= 0) line = line.slice(nl + 1);
      else if (m.index > LOOKBACK) line = line.replace(/^\S*/, ''); // a token the window cut in half
      isColour = declaration.test(line);
    }
    // Said plainly to be a reference, whatever else the line looks like.
    const before = text.slice(Math.max(0, m.index - 16), m.index);
    if (bracketed(before, text.slice(m.index + 4, m.index + 5))
      || referenceWord.test(before) || fragment.test(before)) continue;
    if (!isColour) continue;
    try { push(toHex(parseHex(m[0])), m[0], m.index, 'hex'); } catch { /* not a colour */ }
  }
  for (const m of text.matchAll(/\brgba?\(\s*([^)]*)\)/gi)) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3);
    if (parts.length !== 3 || parts.some((p) => !/^-?[\d.]+%?$/.test(p))) continue;
    const ch = parts.map((p) => (p.endsWith('%') ? (parseFloat(p) / 100) : parseFloat(p) / 255));
    if (ch.some((v) => !Number.isFinite(v))) continue;
    push(toHex({ r: ch[0], g: ch[1], b: ch[2] }), m[0], m.index, 'rgb');
  }
  for (const m of text.matchAll(/\bhsla?\(\s*([^)]*)\)/gi)) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3);
    if (parts.length !== 3) continue;
    const h = parseFloat(parts[0]);
    const sp = parseFloat(parts[1]);
    const lp = parseFloat(parts[2]);
    if (![h, sp, lp].every(Number.isFinite)) continue;
    push(hslToHex(h, sp, lp), m[0], m.index, 'hsl');
  }
  for (const m of text.matchAll(/\boklch\(\s*([^)]*)\)/gi)) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3);
    if (parts.length !== 3) continue;
    const L = parts[0].endsWith('%') ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
    const C = parseFloat(parts[1]);
    const h = parseFloat(parts[2]);
    if (![L, C, h].every(Number.isFinite) || C < 0) continue;
    try { push(oklchToHex(gamutMapOklch({ L, C, h })), m[0], m.index, 'oklch'); } catch { /* skip */ }
  }
  for (const m of text.matchAll(/(?<![\w-])(?:color|background(?:-color)?|border-color|fill|stroke|outline-color)\s*:\s*([a-z]+)\b/gi)) {
    const hex = NAMED[m[1].toLowerCase()];
    if (hex) push(hex, m[1], m.index, 'named');
  }
  return out.sort((a, b) => a.index - b.index);
}

// ---------------------------------------------------------------------------
// Contrast: WCAG 2.2
// ---------------------------------------------------------------------------

/** WCAG 2.2 relative luminance. https://www.w3.org/TR/WCAG22/#dfn-relative-luminance */
export function relativeLuminance(input) {
  const rgb = typeof input === 'string' ? parseHex(input) : input;
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.2 contrast ratio, 1..21. Order independent. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * WCAG 2.2 pass/fail for a foreground/background pair.
 * 1.4.3 Contrast (Minimum), AA:  4.5 normal, 3.0 large
 * 1.4.6 Contrast (Enhanced), AAA: 7.0 normal, 4.5 large
 * 1.4.11 Non-text Contrast, AA:  3.0
 * "Large" is >=24px, or >=18.66px when bold.
 */
export function wcagCheck(fg, bg, { size = 'normal' } = {}) {
  const ratio = contrastRatio(fg, bg);
  const large = size === 'large';
  return {
    ratio: Number(ratio.toFixed(2)),
    AA: ratio >= (large ? 3 : 4.5),
    AAA: ratio >= (large ? 4.5 : 7),
    nonText: ratio >= 3,
    size,
  };
}

// ---------------------------------------------------------------------------
// Contrast: APCA (W3 revision 0.1.9)
// ---------------------------------------------------------------------------

const APCA = {
  trc: 2.4,
  Rco: 0.2126729,
  Gco: 0.7151522,
  Bco: 0.072175,
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,
  blkThrs: 0.022,
  blkClmp: 1.414,
  scale: 1.14,
  loOffset: 0.027,
  deltaYmin: 0.0005,
  loClip: 0.1,
};

function apcaY(input) {
  const rgb = typeof input === 'string' ? parseHex(input) : input;
  // APCA uses a simple 2.4 power curve, deliberately NOT the sRGB piecewise
  // transfer function. This is a documented difference from WCAG 2, not a bug.
  const y =
    APCA.Rco * Math.pow(clamp01(rgb.r), APCA.trc) +
    APCA.Gco * Math.pow(clamp01(rgb.g), APCA.trc) +
    APCA.Bco * Math.pow(clamp01(rgb.b), APCA.trc);
  return y < APCA.blkThrs ? y + Math.pow(APCA.blkThrs - y, APCA.blkClmp) : y;
}

/**
 * APCA lightness contrast, Lc. Positive = dark text on light background,
 * negative = light text on dark. Range is roughly -108..106.
 * Argument order matters, unlike WCAG.
 */
export function apcaContrast(text, background) {
  const Ytxt = apcaY(text);
  const Ybg = apcaY(background);
  if (Math.abs(Ybg - Ytxt) < APCA.deltaYmin) return 0;
  let sapc;
  let out;
  if (Ybg > Ytxt) {
    sapc = (Math.pow(Ybg, APCA.normBG) - Math.pow(Ytxt, APCA.normTXT)) * APCA.scale;
    out = sapc < APCA.loClip ? 0 : sapc - APCA.loOffset;
  } else {
    sapc = (Math.pow(Ybg, APCA.revBG) - Math.pow(Ytxt, APCA.revTXT)) * APCA.scale;
    out = sapc > -APCA.loClip ? 0 : sapc + APCA.loOffset;
  }
  return Number((out * 100).toFixed(2));
}

/**
 * Minimum body-text size and weight APCA permits at a given |Lc|.
 * Derived from the APCA readability conformance bronze tier.
 * Returned as guidance, not a pass/fail: APCA is not a normative WCAG 2 rule.
 */
export function apcaGuidance(lc) {
  const a = Math.abs(lc);
  if (a >= 90) return { tier: 'Lc 90+', use: 'any body text, including small' };
  if (a >= 75) return { tier: 'Lc 75+', use: 'body text at 18px/400 and above' };
  if (a >= 60) return { tier: 'Lc 60+', use: 'body text at 24px/400, or 18px/600' };
  if (a >= 45) return { tier: 'Lc 45+', use: 'large headings only, 36px/400+' };
  if (a >= 30) return { tier: 'Lc 30+', use: 'non-text elements and disabled states only' };
  if (a >= 15) return { tier: 'Lc 15+', use: 'invisible to most readers; decorative only' };
  return { tier: 'Lc <15', use: 'not usable for anything a reader must perceive' };
}

/** Both contrast systems for one pair, plus a plain-language verdict. */
export function contrastReport(fg, bg, { size = 'normal' } = {}) {
  const wcag = wcagCheck(fg, bg, { size });
  const lc = apcaContrast(fg, bg);
  return {
    fg: typeof fg === 'string' ? fg.toUpperCase() : toHex(fg),
    bg: typeof bg === 'string' ? bg.toUpperCase() : toHex(bg),
    wcag,
    apca: { lc, ...apcaGuidance(lc) },
    verdict: wcag.AAA ? 'AAA' : wcag.AA ? 'AA' : wcag.nonText ? 'non-text only' : 'fail',
  };
}

/**
 * The best label colour for a background.
 *
 * WCAG and APCA disagree on exactly the colours this system exists to handle.
 * On a mid-tone green like #338637, WCAG prefers black (Lc 55, which fails the
 * house bar for a label) while white already reaches Lc -77 (which passes).
 * Picking by the metric you are not enforcing is how a system ends up warning
 * about a problem it created for itself, so the default is APCA: it is the bar
 * every label rule here is written against.
 *
 * Both figures come back either way, so a caller judging by WCAG can still do so.
 */
export function bestTextOn(bg, candidates = ['#FFFFFF', '#000000'], { metric = 'apca' } = {}) {
  if (metric !== 'apca' && metric !== 'wcag') throw new TypeError(`unknown metric: ${metric}`);
  let best = null;
  for (const c of candidates) {
    // Compare at full precision and round only for reporting. Comparing the
    // rounded figure makes a near-tie (#018907: 4.582529 vs 4.582623) pick the
    // wrong one, which is the sort of bug that only ever shows up in a sweep.
    const exact = contrastRatio(c, bg);
    const lc = apcaContrast(c, bg);
    const score = metric === 'apca' ? Math.abs(lc) : exact;
    if (!best || score > best.score) {
      best = { color: c.toUpperCase(), ratio: Number(exact.toFixed(2)), apca: lc, score, metric };
    }
  }
  delete best.score;
  return best;
}

// ---------------------------------------------------------------------------
// Colour vision deficiency simulation (Machado, Oliveira & Fernandes 2009)
// ---------------------------------------------------------------------------

const CVD_MATRICES = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** Simulate how a colour appears under protanopia, deuteranopia or tritanopia. */
export function simulateCvd(input, type) {
  const M = CVD_MATRICES[type];
  if (!M) throw new TypeError(`unknown CVD type: ${type}`);
  const rgb = typeof input === 'string' ? parseHex(input) : input;
  const lin = [srgbToLinear(rgb.r), srgbToLinear(rgb.g), srgbToLinear(rgb.b)];
  const out = M.map((row) => row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]);
  return toHex({
    r: linearToSrgb(clamp01(out[0])),
    g: linearToSrgb(clamp01(out[1])),
    b: linearToSrgb(clamp01(out[2])),
  });
}

/**
 * Do two colours stay distinguishable for the three common dichromacies?
 * Uses OKLab Euclidean distance, which is designed for exactly this kind of
 * small-difference judgement. 0.10 is a deliberately conservative floor: it is
 * comfortably above the ~0.02 just-noticeable-difference, because two brand
 * colours that merely differ are not enough. They must read as different.
 * Roughly 1 in 12 men and 1 in 200 women have a colour vision deficiency
 * (https://www.colourblindawareness.org/colour-blindness/), and red-green
 * types account for the overwhelming majority.
 */
export function cvdSafePair(a, b, { threshold = 0.1 } = {}) {
  const results = {};
  let safe = true;
  for (const type of ['normal', 'protanopia', 'deuteranopia', 'tritanopia']) {
    const sa = type === 'normal' ? a : simulateCvd(a, type);
    const sb = type === 'normal' ? b : simulateCvd(b, type);
    const la = toOklch(sa);
    const lb = toOklch(sb);
    const oa = oklchToOklab(la);
    const ob = oklchToOklab(lb);
    const d = Math.hypot(oa.L - ob.L, oa.a - ob.a, oa.b - ob.b);
    const ok = d >= threshold;
    if (!ok) safe = false;
    results[type] = { distance: Number(d.toFixed(4)), ok };
  }
  return { safe, threshold, results };
}

// ---------------------------------------------------------------------------
// Tonal ramps
// ---------------------------------------------------------------------------

/**
 * Radix Colors step semantics. Reproduced because a 12-step ramp is only
 * useful if every step has a job; an undocumented ramp becomes 12 arbitrary
 * blues. https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
 */
export const STEP_ROLES = Object.freeze([
  { step: 1, role: 'app-background', use: 'Page background' },
  { step: 2, role: 'subtle-background', use: 'Subtle page background, striped rows' },
  { step: 3, role: 'ui-background', use: 'UI component background at rest' },
  { step: 4, role: 'ui-background-hover', use: 'UI component background, hovered' },
  { step: 5, role: 'ui-background-active', use: 'UI component background, pressed or selected' },
  { step: 6, role: 'border-subtle', use: 'Subtle borders and separators' },
  { step: 7, role: 'border', use: 'UI component border, focus ring' },
  { step: 8, role: 'border-hover', use: 'UI component border, hovered' },
  { step: 9, role: 'solid', use: 'Solid background. This is the brand colour itself' },
  { step: 10, role: 'solid-hover', use: 'Solid background, hovered' },
  { step: 11, role: 'text-low', use: 'Low-contrast text, secondary copy' },
  { step: 12, role: 'text-high', use: 'High-contrast text' },
]);

/**
 * A ramp has three zones, and only the first is a smooth gradient.
 *
 *   Zone A, steps 1-8   surfaces and borders. A fixed lightness spine, tinted
 *                       with the brand hue. Independent of the brand colour's
 *                       own lightness, so it behaves the same for navy and for
 *                       lemon yellow.
 *   Zone B, steps 9-10  the solids. Step 9 IS the brand colour, untouched.
 *   Zone C, steps 11-12 text. Fixed lightness chosen to clear WCAG AA and AAA
 *                       against zone A.
 *
 * Lightness is therefore NOT monotonic from step 8 to step 9, and that is
 * deliberate: a bright brand colour is lighter than its own borders. Radix
 * does the same thing (yellow-8 #EBBC00 is darker than yellow-9 #FFE629).
 * Forcing monotonicity across that boundary would either move the brand
 * colour or crush steps 1-8 into a band too narrow to see.
 */
const SPINE = {
  light: { a: [0.9925, 0.98, 0.962, 0.943, 0.921, 0.895, 0.86, 0.805], text: [0.545, 0.31] },
  dark: { a: [0.178, 0.213, 0.253, 0.285, 0.317, 0.354, 0.41, 0.497], text: [0.77, 0.945] },
};

// Chroma as a fraction of the brand colour's chroma, so a muted brand gets
// muted surfaces and a vivid one gets livelier surfaces.
const ZONE_A_CURVE = [0.05, 0.1, 0.2, 0.28, 0.36, 0.44, 0.54, 0.7];

// ...but capped in absolute terms, because a surface that carries a vivid
// brand's full chroma stops being a surface and starts being a colour block.
const ZONE_A_CAP = {
  light: [0.006, 0.012, 0.022, 0.032, 0.042, 0.055, 0.072, 0.105],
  dark: [0.012, 0.02, 0.032, 0.042, 0.052, 0.065, 0.085, 0.115],
};

const TEXT_CHROMA = [
  { factor: 0.85, cap: 0.14 }, // step 11
  { factor: 0.45, cap: 0.07 }, // step 12
];

function buildStep(i, L, C, h) {
  // The stored L/C/h triple has to be in gamut *as stored*, so a consumer that
  // reads the oklch() string gets the same colour as the hex. Rounding is
  // therefore done first and always downward on chroma: rounding to nearest
  // can add up to 5e-5 of chroma, which is enough to push a colour that sat
  // exactly on the sRGB boundary just outside it.
  const rl = Number(L.toFixed(4));
  const rh = Number((((h % 360) + 360) % 360).toFixed(2));
  const target = Math.min(C, maxChroma(rl, rh));
  let rc = Math.floor(target * 1e4) / 1e4;
  while (rc > 0 && !inSrgbGamut({ L: rl, C: rc, h: rh })) rc = Number((rc - 1e-4).toFixed(4));
  const safe = { L: rl, C: Math.max(rc, 0), h: rh };
  return {
    step: i + 1,
    role: STEP_ROLES[i].role,
    use: STEP_ROLES[i].use,
    hex: oklchToHex(safe),
    oklch: formatOklch(safe),
    L: safe.L,
    C: safe.C,
    h: safe.h,
  };
}

/**
 * The nearest colour on the brand's own hue at which a label survives on top
 * of it, and the label colour to use.
 *
 * Mid-lightness brand colours (most greens, teals and oranges) are the awkward
 * case: white is not quite light enough against them and black is not quite dark
 * enough, so a button filled with the brand colour has a label nobody can read
 * comfortably. Rather than telling the user their brand colour is wrong, this
 * finds the smallest move along the lightness axis that fixes it, keeping hue
 * and as much chroma as sRGB allows. The result is recognisably the same colour.
 *
 * @param {string|object} seed
 * @param {{targetLc?: number}} opts  APCA Lc to reach. 75 suits body-sized labels.
 */
export function accessibleSolid(seed, { targetLc = 75 } = {}) {
  const base = gamutMapOklch(toOklch(seed));
  const at = (L) => oklchToHex(gamutMapOklch({ L, C: Math.min(base.C, maxChroma(L, base.h)), h: base.h }));

  const baseHex = oklchToHex(base);
  // Judged by APCA, so chosen by APCA. Choosing by WCAG here produced the
  // "adjusted: true, moved: 0" no-op the review found.
  const already = bestTextOn(baseHex, ['#FFFFFF', '#000000'], { metric: 'apca' });
  const baseLc = apcaContrast(already.color, baseHex);
  if (Math.abs(baseLc) >= targetLc) {
    return { hex: baseHex, text: already.color, lc: baseLc, moved: 0, adjusted: false };
  }

  const options = [];
  for (const [text, direction] of [['#FFFFFF', -1], ['#000000', 1]]) {
    // Walk L away from the seed until the label clears the target, then bisect
    // back to the closest point that still clears it.
    let lo = base.L;
    let hi = direction < 0 ? 0 : 1;
    if (Math.abs(apcaContrast(text, at(hi))) < targetLc) continue; // unreachable this way
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (Math.abs(apcaContrast(text, at(mid))) >= targetLc) hi = mid;
      else lo = mid;
    }
    const hex = at(hi);
    options.push({ hex, text, lc: apcaContrast(text, hex), moved: Number(Math.abs(hi - base.L).toFixed(4)), adjusted: true });
  }

  if (options.length === 0) {
    return { hex: baseHex, text: already.color, lc: baseLc, moved: 0, adjusted: false, unreachable: true };
  }
  options.sort((a, b) => a.moved - b.moved);
  return options[0];
}

/**
 * Build a 12-step tonal ramp from one brand colour.
 * Step 9 is the brand colour, exactly, gamut mapped. Everything else is derived.
 *
 * @param {string|object} seed  brand colour, hex or OKLCH
 * @param {{mode?: 'light'|'dark', name?: string}} opts
 */
export function tonalRamp(seed, { mode = 'light', name = 'brand' } = {}) {
  if (mode !== 'light' && mode !== 'dark') throw new TypeError(`unknown mode: ${mode}`);
  const base = gamutMapOklch(toOklch(seed));
  const spine = SPINE[mode];
  const caps = ZONE_A_CAP[mode];
  const h = base.h;

  const steps = [];

  // Zone A: surfaces and borders.
  spine.a.forEach((L, i) => {
    steps.push(buildStep(i, L, Math.min(base.C * ZONE_A_CURVE[i], caps[i]), h));
  });

  // Zone B: the solids. Step 10 is the same colour, one notch more emphatic:
  // darker in light mode, lighter in dark mode, and slightly more saturated
  // either way, which is what "hovered" reads as.
  steps.push(buildStep(8, base.L, base.C, h));
  const l10 = mode === 'light'
    ? Math.max(base.L - 0.03, 0.03)
    : Math.min(base.L + 0.03, 0.97);
  steps.push(buildStep(9, l10, base.C * 1.05, h));

  // Zone C: text.
  spine.text.forEach((L, i) => {
    const { factor, cap } = TEXT_CHROMA[i];
    steps.push(buildStep(10 + i, L, Math.min(base.C * factor, cap), h));
  });

  const app = steps[0].hex;
  const solid = steps[8].hex;
  const onSolid = bestTextOn(solid);
  const strong = accessibleSolid(base, { targetLc: 75 });
  // The hovered fill has to keep the label too. Deriving hover from the raw
  // ramp step while keeping the accessible fill's label colour is how a
  // specification sheet ends up documenting a state that breaks the rule
  // printed two lines above it.
  const strongBase = gamutMapOklch(toOklch(strong.hex));
  const hoverL = mode === 'light'
    ? Math.max(strongBase.L - 0.03, 0.02)
    : Math.min(strongBase.L + 0.03, 0.98);
  const hoverCandidate = oklchToHex(gamutMapOklch({ L: hoverL, C: Math.min(strongBase.C, maxChroma(hoverL, strongBase.h)), h: strongBase.h }));
  const strongHover = Math.abs(apcaContrast(strong.text, hoverCandidate)) >= 60
    ? { hex: hoverCandidate, text: strong.text, lc: apcaContrast(strong.text, hoverCandidate) }
    : { hex: strong.hex, text: strong.text, lc: strong.lc, unchanged: true };

  // A focus indicator has a real job under WCAG 2.2 and must clear 3:1 against
  // the surface it sits on (1.4.11). Zone A borders are deliberately subtle and
  // do not, so the ring is picked from the steps that do rather than assumed.
  const ringCandidates = [steps[8], steps[9], steps[10], steps[11]];
  const focusStep = ringCandidates.find((s) => contrastRatio(s.hex, app) >= 3) ?? steps[11];

  const warnings = [];
  if (contrastRatio(solid, app) < 3) {
    warnings.push(
      `In ${mode} mode the brand colour (${solid}) has only ` +
        `${contrastRatio(solid, app).toFixed(2)}:1 against the page background ` +
        `(${app}). It cannot carry meaning on its own here. Pair it with a shape, ` +
        `a label, or step ${focusStep.step} for anything a reader must notice.`,
    );
  }
  if (Math.abs(apcaContrast(onSolid.color, solid)) < 60) {
    warnings.push(
      `Text on the solid brand colour reaches only Lc ` +
        `${apcaContrast(onSolid.color, solid)}, which is short of the Lc 60 a ` +
        `button label needs. Use ${strong.hex} for filled controls (${strong.text} ` +
        `text, Lc ${strong.lc}) and keep ${solid} for large areas of colour.`,
    );
  }

  return {
    name,
    mode,
    seed: oklchToHex(base),
    steps,
    /** What to put on top of step 9, and whether it is legible. */
    onSolid: { ...onSolid, apca: apcaContrast(onSolid.color, solid) },
    /** A fill for buttons and chips, where the label has to survive. */
    solidStrong: strong,
    /** The hovered version of that fill, where the label still has to survive. */
    solidStrongHover: strongHover,
    /** A focus ring that actually meets WCAG 1.4.11 against step 1. */
    focusRing: { hex: focusStep.hex, step: focusStep.step, ratio: Number(contrastRatio(focusStep.hex, app).toFixed(2)) },
    /** The pairings a design system actually relies on, checked. */
    checks: {
      textHighOnApp: contrastReport(steps[11].hex, app),
      textLowOnApp: contrastReport(steps[10].hex, app),
      borderOnApp: contrastReport(steps[7].hex, app),
      solidOnApp: contrastReport(solid, app),
      textOnSolid: contrastReport(onSolid.color, solid),
      focusOnApp: contrastReport(focusStep.hex, app),
    },
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Harmony
// ---------------------------------------------------------------------------

const HARMONY_OFFSETS = {
  complementary: [180],
  analogous: [-30, 30],
  'split-complementary': [150, 210],
  triadic: [120, 240],
  tetradic: [90, 180, 270],
};

/**
 * Derive accent hues from a base colour, holding lightness and chroma constant.
 * Holding L and C is what makes a set of accents read as one family: vary the
 * hue and only the hue, so no accent shouts louder than its siblings.
 */
/**
 * CMYK from sRGB, uncalibrated, and honest about it.
 *
 * There is no correct answer without a destination profile: the same numbers
 * separate differently on coated stock, uncoated stock and a vinyl cutter. This
 * is the naive device conversion every tool uses as a starting point, and it is
 * a starting point. The book prints it next to the sentence that says so, and
 * `verified` in the brand file stays false until somebody has held a printed
 * proof next to a guide under D50 light.
 *
 * Anything better than this is a press check, not an algorithm.
 */
export function toCmyk(input) {
  const hex = typeof input === 'string' ? toHex(parseHex(input)) : toHex(input);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100, uncalibrated: true };
  const round = (x) => Math.round(x * 1000) / 10;
  return {
    c: round((1 - r - k) / (1 - k)),
    m: round((1 - g - k) / (1 - k)),
    y: round((1 - b - k) / (1 - k)),
    k: round(k),
    uncalibrated: true,
  };
}

/** `40/12/0/8`, the way a printer writes it. */
export const cmykString = (c) => `${Math.round(c.c)}/${Math.round(c.m)}/${Math.round(c.y)}/${Math.round(c.k)}`;

/**
 * A categorical chart palette that survives colour-blindness.
 *
 * A brand palette is built for hierarchy: one colour leads and the rest defer.
 * A chart palette is built for discrimination, where every colour has to be
 * told apart from every other one at 4px, by everybody. They are different
 * jobs, so this is a different set, anchored on the brand hue rather than
 * borrowed from it.
 *
 * Candidates are walked around the hue circle and kept only when they stay
 * distinguishable from every colour already chosen under normal vision AND
 * under deuteranopia, which is the common form. Lightness alternates so that a
 * greyscale print, or a monitor nobody calibrated, still separates them.
 */
export function dataVizPalette(seed, { count = 6, mode = 'light' } = {}) {
  const base = toOklch(seed);
  const chosen = [];
  const distinct = (hex) => chosen.every((c) => {
    if (contrastRatio(hex, c) < 1.12 && Math.abs(toOklch(hex).h - toOklch(c).h) < 25) return false;
    return cvdSafePair(hex, c, { threshold: 0.075 }).safe;
  });

  // Start on the brand hue so the chart belongs to the brand, then step by an
  // angle that does not divide the circle evenly, which avoids landing back on
  // a hue already taken.
  const step = 137.5;
  const lightnesses = mode === 'dark' ? [0.72, 0.6] : [0.58, 0.72];
  for (let i = 0; chosen.length < count && i < 64; i++) {
    const h = (base.h + i * step) % 360;
    const L = lightnesses[chosen.length % lightnesses.length];
    const C = Math.min(maxChroma(L, h) * 0.85, 0.15);
    const hex = oklchToHex(gamutMapOklch({ L, C, h }));
    if (distinct(hex)) chosen.push(hex);
  }
  return chosen;
}

export function harmonise(seed, scheme = 'analogous', { count } = {}) {
  const base = gamutMapOklch(toOklch(seed));
  const offsets = HARMONY_OFFSETS[scheme];
  if (!offsets) throw new TypeError(`unknown harmony scheme: ${scheme}`);
  const picked = typeof count === 'number' ? offsets.slice(0, count) : offsets;
  return picked.map((deg) => {
    const h = ((base.h + deg) % 360 + 360) % 360;
    // Equal chroma is the goal, but some hues simply cannot hold as much
    // chroma at this lightness in sRGB. Take the most the gamut allows.
    const C = Math.min(base.C, maxChroma(base.L, h));
    const lch = { L: base.L, C, h };
    return { hex: oklchToHex(lch), oklch: formatOklch(lch), offset: deg, scheme };
  });
}

/**
 * A neutral ramp that carries a trace of the brand hue. Pure #808080 greys
 * beside a warm brand colour read as dirty; a few points of chroma at the
 * brand hue makes the greys belong to the palette.
 */
export function neutralRamp(seed, { mode = 'light', chroma = 0.006, name = 'neutral' } = {}) {
  const base = toOklch(seed);
  return tonalRamp({ L: base.L, C: chroma, h: base.h }, { mode, name });
}

export default {
  parseHex, toHex, formatOklch,
  srgbToLinear, linearToSrgb,
  linearRgbToOklab, oklabToLinearRgb, oklabToOklch, oklchToOklab,
  toOklch, oklchToRgb, oklchToHex, inSrgbGamut, gamutMapOklch, maxChroma,
  relativeLuminance, contrastRatio, wcagCheck, extractColors,
  apcaContrast, apcaGuidance, contrastReport, bestTextOn,
  simulateCvd, cvdSafePair, accessibleSolid,
  tonalRamp, neutralRamp, harmonise, STEP_ROLES,
};
