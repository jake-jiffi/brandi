/**
 * Brandi product layer: product tokens.
 *
 * Brandi resolves a brand into a system built for the brand's own surfaces: the
 * book, the site, a hero, a card. A product someone works in all day asks for
 * more, and asks for it more strictly.
 *
 *   More roles. A working screen needs a canvas, three surfaces, a sunken track,
 *   a raised layer, a rail, hover and pressed washes, selection, a highlight that
 *   means "this needs you", five status families with four roles each, six chart
 *   series, tags and a scrim. Brandi's semantic tier holds the brand's share of
 *   those; this file adds the rest.
 *
 *   Every pair checked. Brandi audits six pairs a theme, the ones a brand book
 *   can fail. A product fails on the pair nobody listed: quiet text on a sunken
 *   track, a control edge on a hovered row, a status word on its own tint. So
 *   every token here says what it sits on, as data, and the audit measures every
 *   one of those pairs in both themes. A wash is composited over the surface it
 *   sits on first, because contrastRatio ignores alpha: it scores a 4% wash as if
 *   it were solid.
 *
 *   Values that pass by construction. Text, line and focus roles are solved for
 *   contrast rather than picked from a ramp step and hoped for. Brandi's ramps
 *   are not monotonic in lightness (step 11 can be lighter than step 9, on
 *   purpose), so "use step 11" is not a guarantee of anything. The brand's hue
 *   and chroma are kept and only lightness moves, and only as far as it must.
 *   A value a person decided (an explicit role) is never moved: when it fails,
 *   the audit says so, and the decision log is where it gets resolved.
 *
 * The output's shape is the one the product generators read: color.tokens with
 * light and dark values, shadow, type groups, and the static families. Pairs
 * live on each colour token as `contrast: [{ on: [...], min, kind }]`. An `on`
 * entry written `hover@surface` is the hover wash laid over the surface.
 */

import { displayFallback } from './type.mjs';
import {
  toOklch, oklchToHex, gamutMapOklch, oklchToOklab, oklabToOklch,
  contrastRatio, cvdSafePair, tonalRamp, dataVizPalette,
} from './color.mjs';
import { railMarks } from './productglobals.mjs';

export const PRODUCT_TOKENS_VERSION = '1.0.0';

/** WCAG 2.2 floors by what the foreground is. */
export const FLOORS = Object.freeze({ text: 4.5, 'large-text': 3, 'non-text': 3 });

/**
 * How far past a floor a solved value lands. A browser rounds colour and a
 * screenshot tool rounds again; a value solved to exactly 4.50:1 can measure
 * 4.49:1 in the gate and fail a round for nothing.
 */
const MARGIN = 0.1;

/** The assistant's identity hue (violet), far from every status hue. */
const AI_HUE = 295;

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

const hex2 = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
const safeHue = (h) => (Number.isFinite(h) ? h : 0);

function rgba(hex) {
  const h = String(hex).replace('#', '');
  if (!/^([0-9a-f]{6}|[0-9a-f]{8})$/i.test(h)) throw new TypeError(`not a hex colour: ${hex}`);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

/** True for an 8-digit hex whose alpha is below 1. */
export const isTranslucent = (hex) => rgba(hex).a < 1;

/** The same colour with an alpha channel. */
export function withAlpha(hex, alpha) {
  const { r, g, b } = rgba(hex);
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${hex2(alpha * 255)}`;
}

/**
 * Lay a translucent colour over an opaque one, the way a browser does (in
 * gamma-encoded sRGB). The result is what a person actually sees, which is the
 * only thing worth measuring.
 */
export function composite(fg, bg) {
  const f = rgba(fg);
  const b = rgba(bg);
  if (b.a < 1) throw new TypeError(`cannot composite onto a translucent colour: ${bg}`);
  const m = (x, y) => x * f.a + y * (1 - f.a);
  return `#${hex2(m(f.r, b.r))}${hex2(m(f.g, b.g))}${hex2(m(f.b, b.b))}`;
}

/** Mix two colours in OKLab, so the midpoint looks like a midpoint. */
export function mix(a, b, t) {
  const ca = toOklch(a);
  const cb = toOklch(b);
  const A = oklchToOklab({ ...ca, h: safeHue(ca.h) });
  const B = oklchToOklab({ ...cb, h: safeHue(cb.h) });
  const lab = { L: A.L + (B.L - A.L) * t, a: A.a + (B.a - A.a) * t, b: A.b + (B.b - A.b) * t };
  const lch = oklabToOklch(lab);
  return oklchToHex(gamutMapOklch({ ...lch, h: safeHue(lch.h) }));
}

/** Move a colour's lightness, keeping hue and as much chroma as the gamut allows. */
export function shiftL(hex, dL) {
  const c = toOklch(hex);
  return oklchToHex(gamutMapOklch({ L: Math.min(1, Math.max(0, c.L + dL)), C: c.C, h: safeHue(c.h) }));
}

/**
 * The least contrast a state keeps from the colour it changes: a hover, a press, a selected row, a rail's
 * hairline. A fixed step of lightness moves almost no light near black, and a black rail's selected row
 * came out #030303 on #000000.
 */
export const STEP = Object.freeze({ hover: 1.1, pressed: 1.19, selected: 1.25, line: 1.15 });

/** A lightness step from `base` the eye can see: the given step, grown until it holds `min` against `base`. */
export function visibleShift(base, dL, min) {
  let hex = shiftL(base, dL);
  for (let k = 1; contrastRatio(hex, base) < min && k <= 40; k += 1) hex = shiftL(base, dL * (1 + k * 0.5));
  return hex;
}

/**
 * The colour nearest `seed` that clears `min` against every background.
 *
 * Hue and chroma stay; lightness moves towards whichever end can pass, and
 * stops at the first lightness that does. When the seed already passes it comes
 * back unchanged, so a brand colour that is good enough stays the brand colour.
 * When neither end can pass (a background in the middle of the range, where no
 * colour reaches 4.5:1 against both a light and a dark neighbour), the best
 * reachable value comes back marked `short`, and the audit reports it.
 *
 * Two modes, because two kinds of role want different things:
 *   nearest  keep the seed if it passes, else move it as little as possible.
 *            For colours that carry the brand: links, focus, status words,
 *            chart series. The brand colour stays the brand colour.
 *   floor    the quietest value that still passes, wherever the seed was. For
 *            the hierarchy: muted and subtle text, control edges, the chart
 *            comparison. A ramp step that happens to be darker than it needs to
 *            be would flatten the hierarchy into one grey, and Brandi's ramps
 *            are not monotonic, so "step 10" can be darker than "step 11".
 */
export function solveForContrast(seed, against, min, { margin = MARGIN, mode = 'nearest' } = {}) {
  const target = min + margin;
  const worst = (hex) => Math.min(...against.map((bg) => contrastRatio(hex, bg)));
  const seedWorst = worst(seed);
  if (mode === 'nearest' && seedWorst >= target) return { hex: seed, ratio: seedWorst, moved: false, short: false };

  const c = toOklch(seed);
  const h = safeHue(c.h);
  const at = (L) => oklchToHex(gamutMapOklch({ L, C: c.C, h }));
  const ends = [
    { end: 0, ratio: worst(at(0)) },
    { end: 1, ratio: worst(at(1)) },
  ];
  const passing = ends.filter((e) => e.ratio >= target);
  if (!passing.length) {
    const best = ends[0].ratio >= ends[1].ratio ? at(0) : at(1);
    return { hex: best, ratio: worst(best), moved: true, short: true };
  }
  // `pass` always holds a lightness that clears the target, so whatever the
  // search lands on is a pass; the search only decides how far to go.
  const search = (pass, fail) => {
    for (let i = 0; i < 40; i += 1) {
      const mid = (pass + fail) / 2;
      if (worst(at(mid)) >= target) pass = mid;
      else fail = mid;
    }
    return pass;
  };
  if (mode === 'floor') {
    // Search from the passing end towards the backgrounds, where contrast runs out.
    const bgL = against.reduce((s, bg) => s + toOklch(bg).L, 0) / against.length;
    const end = passing.length === 2 ? (bgL > 0.5 ? 0 : 1) : passing[0].end;
    const hex = at(search(end, bgL));
    return { hex, ratio: worst(hex), moved: hex.toLowerCase() !== String(seed).toLowerCase(), short: false };
  }
  let best = null;
  for (const { end } of passing) {
    const L = search(end, c.L);
    const move = Math.abs(L - c.L);
    if (!best || move < best.move) best = { hex: at(L), move };
  }
  return { hex: best.hex, ratio: worst(best.hex), moved: true, short: false };
}

/**
 * Which way a fill's states move, decided once per fill: away from the label's lightness, which keeps or gains
 * contrast, unless the deepest state (selected, STEP.selected) cannot be reached that way with a little room to
 * spare; then towards it. A dark navy cannot get far enough darker to be seen (1.16:1 against black at most), and
 * a cream fill reaches the deepest step only at white, where pressed and selected would both stop. Decided per
 * state, hover went darker while pressed, needing more, flipped lighter: one button's states moving opposite ways.
 */
export function stateDirection(fill, label) {
  const away = toOklch(label).L > toOklch(fill).L ? -1 : 1;
  const deepest = STEP.selected + 0.05;
  return contrastRatio(visibleShift(fill, away * 0.1, deepest), fill) >= deepest ? away : -away;
}

/**
 * A hover, pressed or selected state for a filled control: a step in the fill's one direction, each state further
 * than the last, solved so the label still reads. A state that quietly drops its label below 4.5:1 is the
 * failure this exists to prevent.
 */
export function stateOf(fill, label, amount, min = STEP.hover) {
  const hex = visibleShift(fill, stateDirection(fill, label) * amount, min);
  return contrastRatio(hex, label) >= FLOORS.text + MARGIN ? hex : solveForContrast(hex, [label], FLOORS.text).hex;
}

/** The candidate with the most contrast against `bg`. */
export function pickText(bg, candidates) {
  return candidates
    .map((hex) => ({ hex, ratio: contrastRatio(hex, bg) }))
    .sort((a, b) => b.ratio - a.ratio)[0];
}

/**
 * The first candidate, in order of preference, that reads on `bg`; the one with
 * the most contrast when none does. The brand's own ink goes first, so a label
 * on a brand fill is the brand's navy wherever navy passes, not whichever
 * near-black happens to score a fraction higher.
 */
export function pickLabel(bg, preferred) {
  const scored = preferred.map((hex) => ({ hex, ratio: contrastRatio(hex, bg) }));
  return scored.find((c) => c.ratio >= FLOORS.text + MARGIN) ?? scored.sort((a, b) => b.ratio - a.ratio)[0];
}

const hueGap = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/** The detector's own test for a coloured ground: its channels spread 40 or more of 255. */
const carriesColour = (hex) => {
  const { r, g, b } = rgba(hex);
  return Math.max(r, g, b) - Math.min(r, g, b) >= 40;
};

/** The detector's own grey: HSL saturation under 0.2, between 20% and 85% lightness. */
const readsGrey = (hex) => {
  const { r, g, b } = rgba(hex);
  const hi = Math.max(r, g, b) / 255;
  const lo = Math.min(r, g, b) / 255;
  const l = (hi + lo) / 2;
  const s = hi === lo ? 0 : (hi - lo) / (1 - Math.abs(2 * l - 1));
  return s < 0.2 && l > 0.2 && l < 0.85;
};

// ---------------------------------------------------------------------------
// The role list
// ---------------------------------------------------------------------------

export const STATUS_FAMILIES = Object.freeze(['success', 'warning', 'danger', 'info', 'ai']);
export const SERIES_COUNT = 6;

/**
 * Every role a product system carries, apart from the brand-* primitives, which
 * vary by brand. Generators, the drift check and the tests read this list, so a
 * role added here is a role every system gets.
 */
export const PRODUCT_ROLES = Object.freeze([
  'canvas', 'surface', 'surface-subtle', 'surface-sunken', 'surface-raised', 'surface-inverse', 'scrim',
  'rail', 'rail-text', 'rail-text-strong', 'rail-muted', 'rail-hover', 'rail-selected', 'rail-line', 'rail-edge', 'rail-focus',
  'text-strong', 'text', 'text-muted', 'text-subtle', 'text-inverse',
  'link', 'link-hover',
  'line', 'line-strong', 'line-control',
  'primary', 'primary-hover', 'primary-pressed', 'on-primary',
  'brand', 'brand-hover', 'on-brand',
  'hover', 'pressed',
  'selected', 'selected-strong', 'selected-line',
  'focus',
  'highlight', 'highlight-soft', 'on-highlight',
  ...STATUS_FAMILIES.flatMap((s) => [s, `${s}-surface`, `${s}-solid`, `${s}-line`]),
  'on-danger',
  ...Array.from({ length: SERIES_COUNT }, (_, i) => `series-${i + 1}`),
  'chart-grid', 'chart-compare', 'chart-track',
  ...Array.from({ length: SERIES_COUNT }, (_, i) => `tag-${i + 1}`), 'tag-grey',
]);

const SURFACES = ['surface', 'surface-subtle', 'surface-sunken', 'surface-raised', 'canvas'];

// ---------------------------------------------------------------------------
// Building
// ---------------------------------------------------------------------------

const steps = (ramp) => ramp.steps.map((s) => s.hex);
const hexOf = (c) => (typeof c === 'string' ? c : c?.hex);

/**
 * Resolve one theme's values.
 *
 * `roles` holds the brand-to-product decisions: explicit `{ light, dark }` hexes
 * for primary, brand, highlight, canvas, focus and rail. Anything not decided is
 * derived, and derived values are solved to pass.
 */
function themeValues(system, mode, roles, ai, brandInk, avoid = []) {
  const light = mode === 'light';
  const N = steps(system.palettes.neutral[mode]);
  const B = steps(system.palettes.brand[mode]);
  const accent = system.palettes.accent1 ? steps(system.palettes.accent1[mode]) : null;
  const S = (name) => (name === 'ai' ? steps(ai[mode]) : steps(system.status[name][mode]));
  const decided = (role) => roles[role]?.[mode] ?? null;
  const v = {};
  const notes = [];
  const solve = (role, seed, against, min, mode = 'nearest') => {
    const r = solveForContrast(seed, against, min, { mode });
    if (r.short) notes.push(`${role} (${mode}) cannot reach ${min}:1 against all of its backgrounds; best is ${r.ratio.toFixed(2)}:1.`);
    return r.hex;
  };

  // Surfaces. "Subtle" is always a step from the surface towards the canvas.
  // A decided canvas (a brand off-white, a brand navy at night) tints its own
  // surfaces: grey cards on a navy canvas read as a mistake, not a system.
  const canvas = decided('canvas');
  if (canvas && light) {
    v.canvas = canvas;
    v.surface = shiftL(canvas, 0.04);
    v['surface-raised'] = v.surface;
    v['surface-subtle'] = mix(canvas, v.surface, 0.6);
    v['surface-sunken'] = shiftL(canvas, -0.015);
  } else if (canvas) {
    v.canvas = canvas;
    v['surface-subtle'] = shiftL(canvas, 0.02);
    v.surface = shiftL(canvas, 0.045);
    v['surface-raised'] = shiftL(canvas, 0.08);
    v['surface-sunken'] = shiftL(canvas, -0.025);
  } else if (light) {
    v.surface = N[0];
    v['surface-raised'] = N[0];
    v['surface-subtle'] = N[1];
    v.canvas = mix(N[1], N[2], 0.5);
    v['surface-sunken'] = N[2];
  } else {
    v.canvas = N[0];
    v['surface-subtle'] = mix(v.canvas, N[1], 0.5);
    v.surface = N[1];
    v['surface-raised'] = N[2];
    v['surface-sunken'] = mix(v.canvas, '#000000', 0.35);
  }

  // The ink: a decided text colour (often the brand's darkest colour in light,
  // a pale brand tint in dark). Every quieter role is mixed from it towards the
  // surface and then solved, so the whole hierarchy carries the brand's hue.
  const ink = decided('ink');
  const toward = (t) => mix(v.surface, ink, t);
  v['surface-inverse'] = ink ?? N[11];
  v.scrim = light ? withAlpha(ink ?? N[11], 0.4) : withAlpha(mix(v.canvas, '#000000', 0.5), 0.8);
  const grounds = SURFACES.map((s) => v[s]);

  // Washes, before anything that has to read on a hovered row.
  v.hover = light ? withAlpha(ink ?? N[11], 0.04) : withAlpha('#ffffff', 0.063);
  v.pressed = light ? withAlpha(ink ?? N[11], 0.08) : withAlpha('#ffffff', 0.11);
  const hovered = composite(v.hover, v.surface);

  // Selection.
  v.selected = light ? B[1] : B[2];
  v['selected-strong'] = light ? B[2] : B[3];
  v['selected-line'] = B[8];

  // Text.
  v['text-strong'] = ink ?? N[11];
  v.text = ink ?? N[11];
  v['text-muted'] = solve('text-muted', ink ? toward(0.7) : N[10], [...grounds, v.selected, v['selected-strong'], hovered], 7, 'floor');
  v['text-subtle'] = solve('text-subtle', ink ? toward(0.5) : N[9], grounds, FLOORS.text, 'floor');
  v['text-inverse'] = ink ? (light ? v.surface : v.canvas) : N[0];
  v.link = solve('link', B[10], [v.surface, v['surface-subtle'], v.canvas], FLOORS.text);
  v['link-hover'] = solve('link-hover', shiftL(v.link, light ? -0.06 : 0.06), [v.surface, v['surface-subtle'], v.canvas], FLOORS.text);

  // Lines. A control edge has to be findable without its label: 3:1.
  v.line = ink ? toward(0.1) : N[5];
  v['line-strong'] = ink ? toward(0.2) : N[6];
  v['line-control'] = solve('line-control', ink ? toward(0.45) : N[7], [v.surface, v['surface-raised'], v['surface-sunken'], v.canvas, hovered], FLOORS['non-text'], 'floor');

  // The primary action. A decided primary is used as it is. A derived one has
  // to stand off the page (3:1) and carry a readable label (4.5:1), in that
  // order: in dark mode the brand's own colour is often too dark to see on the
  // canvas, so it lifts first and then takes a dark label.
  // Label candidates: white, the light theme's ink and the dark theme's deepest
  // neutral, so a mid-lightness fill can take the darkest label the system owns
  // before anyone considers moving the fill.
  const inks = [brandInk, '#ffffff', steps(system.palettes.neutral.light)[11], steps(system.palettes.neutral.dark)[0]].filter(Boolean);
  const labelOn = (bg) => pickLabel(bg, inks);
  if (decided('primary')) {
    v.primary = decided('primary');
  } else {
    const seed = light ? hexOf(system.palettes.brand.light.solidStrong) : B[8];
    // Also the tracks a meter fills, because Progress draws its default tone in primary.
    const standOff = [v.surface, v.canvas, v.line, v['surface-sunken']];
    let p = solve('primary', seed, standOff, FLOORS['non-text']);
    const label = labelOn(p);
    if (label.ratio < FLOORS.text + MARGIN) {
      // A label that pulls the fill towards the page (a dark label on a light page) can undo the 3:1
      // just solved. Then the label is the one at the far end, which pushes the fill away from the page.
      let q = solve('primary', p, [label.hex], FLOORS.text);
      if (standOff.some((g) => contrastRatio(q, g) < FLOORS['non-text'])) q = solve('primary', p, [light ? '#ffffff' : steps(system.palettes.neutral.dark)[0]], FLOORS.text);
      p = q;
    }
    v.primary = p;
  }
  v['on-primary'] = labelOn(v.primary).hex;
  v['primary-hover'] = stateOf(v.primary, v['on-primary'], 0.05, STEP.hover);
  v['primary-pressed'] = stateOf(v.primary, v['on-primary'], 0.09, STEP.pressed);

  // The brand fill: the brand's own colour as a secondary emphasis.
  v.brand = decided('brand') ?? B[8];
  v['on-brand'] = labelOn(v.brand).hex;
  v['brand-hover'] = stateOf(v.brand, v['on-brand'], 0.05, STEP.hover);

  // Focus clears 3:1 on every ground it can sit on, the selected tints included: a list row is often
  // selected and focused at once, and a dark focus colour once held 2.8:1 on the dark selected tint.
  v.focus = decided('focus') ?? solve('focus', B[8], [...grounds, v.selected, v['selected-strong']], FLOORS['non-text']);

  // Highlight: "this needs you". A fill, never text. The brand's accent is the
  // colour it keeps for where an eye needs to land, which is this job exactly,
  // so it is the default, and it is the same fill in both themes so the signal
  // does not change meaning at night. With no accent, a pale brand tint.
  const accentSeed = system.palettes.accent1 ? hexOf(system.palettes.accent1.light.steps[8]) : null;
  v.highlight = decided('highlight') ?? accentSeed ?? steps(system.palettes.brand.light)[3];
  const countLabel = labelOn(v.highlight);
  if (!decided('highlight') && countLabel.ratio < FLOORS.text + MARGIN) v.highlight = solve('highlight', v.highlight, [countLabel.hex], FLOORS.text);
  v['highlight-soft'] = light ? (accent ? accent[1] : B[1]) : mix(v.canvas, v.highlight, 0.18);
  v['on-highlight'] = labelOn(v.highlight).hex;

  // Status families. The word on its own tint has to read as well as on a card.
  for (const name of STATUS_FAMILIES) {
    const R = S(name);
    v[`${name}-surface`] = light ? R[1] : R[2];
    v[`${name}-solid`] = R[8];
    v[`${name}-line`] = R[5];
    v[name] = solve(name, R[10], [v.surface, v['surface-subtle'], v.canvas, v[`${name}-surface`]], FLOORS.text);
  }
  // The destructive button carries a label, so its fill is solved for one.
  const dangerLabel = labelOn(v['danger-solid']);
  if (dangerLabel.ratio < FLOORS.text + MARGIN) v['danger-solid'] = solve('danger-solid', v['danger-solid'], [dangerLabel.hex], FLOORS.text);
  v['on-danger'] = labelOn(v['danger-solid']).hex;

  // Charts. The brand's own colours take the first slots (the brand colour,
  // then its accents), so a chart reads as the brand's; Brandi's colour-vision-
  // checked palette fills the rest, skipping hues already taken. Each is then
  // lifted or dropped until it clears 3:1 on a card (a pale accent darkens into
  // a usable series), and neighbours that collapse under a colour-vision
  // deficiency are reported by the audit.
  const seed = hexOf(system.palettes.brand.light.steps[8]);
  // More candidates than slots, so a palette short of distinct hues never wraps around. In dark,
  // the colour-vision-safe generator finds as few as four, and series-6 came out in series-1's
  // colour; the brand's categorical palette, solved for the dark card, fills the rest.
  const categorical = (system.dataViz?.categorical ?? []).map(hexOf);
  const extra = dataVizPalette(seed, { count: SERIES_COUNT * 2, mode }).map(hexOf);
  const generated = [...new Set([...(light ? categorical : []), ...extra, ...categorical])];
  const accentSeeds = Object.keys(system.palettes).filter((k) => /^accent\d+$/.test(k))
    .map((k) => hexOf(system.palettes[k].light.steps[8]));
  // A colour the brand bars from this theme's grounds never becomes a series here, nor does its hue.
  const barred = (c) => avoid.some((a) => hueGap(safeHue(toOklch(a).h), safeHue(toOklch(c).h)) < 25);
  const palette = [];
  for (const c of [generated[0], ...accentSeeds, ...generated.slice(1)]) {
    const h = safeHue(toOklch(c).h);
    if (!barred(c) && palette.length < SERIES_COUNT && palette.every((p) => hueGap(safeHue(toOklch(p).h), h) >= 25)) palette.push(c);
  }
  for (const c of generated) if (!barred(c) && palette.length < SERIES_COUNT && !palette.includes(c)) palette.push(c);
  // Two candidates can solve to one colour; the next candidate takes the slot instead. Last come
  // spares a twelfth of the circle apart, past the colour-vision-safe set: the audit reports any
  // neighbours they leave hard to tell apart, which beats a chart with two series in one colour.
  const baseHue = safeHue(toOklch(seed).h);
  const spares = Array.from({ length: 12 }, (_, k) => oklchToHex(gamutMapOklch({ L: light ? 0.56 : 0.74, C: 0.13, h: (baseHue + 15 + k * 30) % 360 })));
  const candidates = [...new Set([...palette, ...generated, ...spares])].filter((c) => !barred(c));
  const taken = new Set();
  let next = 0;
  for (let i = 0; i < SERIES_COUNT; i += 1) {
    let value = null;
    while (next < candidates.length) {
      value = solve(`series-${i + 1}`, candidates[next++], [v.surface, v['surface-subtle']], FLOORS['non-text']);
      if (!taken.has(value.toUpperCase())) break;
    }
    value ??= solve(`series-${i + 1}`, candidates[i % candidates.length], [v.surface, v['surface-subtle']], FLOORS['non-text']);
    taken.add(value.toUpperCase());
    v[`series-${i + 1}`] = value;
  }
  v['chart-grid'] = ink ? toward(0.07) : (light ? N[3] : N[2]);
  v['chart-compare'] = solve('chart-compare', ink ? toward(0.45) : N[8], [v.surface], FLOORS['non-text'], 'floor');

  // Tags: pale fills on the series hues, so a category's tag and its line in a
  // chart are recognisably the same thing.
  for (let i = 0; i < SERIES_COUNT; i += 1) {
    const h = safeHue(toOklch(v[`series-${i + 1}`]).h);
    v[`tag-${i + 1}`] = oklchToHex(gamutMapOklch(light ? { L: 0.94, C: 0.035, h } : { L: 0.3, C: 0.05, h }));
  }
  v['tag-grey'] = ink ? toward(0.08) : N[3];

  // The rail. A decided rail is the brand's signature navigation surface; with
  // none, the rail is a quiet surface and its roles point at the ordinary ones.
  const railDecided = decided('rail');
  if (railDecided) {
    v.rail = railDecided;
    const darkRail = toOklch(v.rail).L < 0.5;
    // The hovered and selected items step lighter on a dark rail and darker on a light one, so a black rail's selected
    // item shows. A mid-tone rail stepped that way, towards its words, takes them under their floor: a mid green's
    // selected item held its light words at 4.06:1. There the states step the other way, away from the words.
    const words = labelOn(v.rail).hex;
    const states = (step) => ({ hover: visibleShift(v.rail, 0.05 * step, STEP.hover), selected: visibleShift(v.rail, 0.1 * step, STEP.selected), line: visibleShift(v.rail, 0.07 * step, STEP.line) });
    let railStates = states(darkRail ? 1 : -1);
    if (contrastRatio(words, railStates.hover) < FLOORS.text || contrastRatio(words, railStates.selected) < FLOORS.text) {
      const away = states(darkRail ? -1 : 1);
      if (Math.min(contrastRatio(words, away.hover), contrastRatio(words, away.selected)) > Math.min(contrastRatio(words, railStates.hover), contrastRatio(words, railStates.selected))) railStates = away;
    }
    v['rail-hover'] = railStates.hover;
    v['rail-selected'] = railStates.selected;
    v['rail-line'] = railStates.line;
    // The rail's edge against the page. Where the two already stand apart (3:1) its own line will do; where they sit
    // close, the page's hairline, which shows against both. A black rail on a near-black canvas had a 1.06:1 edge.
    v['rail-edge'] = contrastRatio(v.rail, v.canvas) >= FLOORS['non-text'] ? v['rail-line'] : '{line}';
    const railGrounds = [v.rail, v['rail-hover'], v['rail-selected']];
    const mutedGrounds = [v.rail, v['rail-hover']];
    // A rail that carries colour takes its words in its own hue, as tints of it: the rail's chroma, held between
    // 0.05 and 0.08 so a vivid rail's tints stay quiet, and raised a step at a time while the solved value still
    // reads grey. Mixed towards a brand-hued text instead, an emerald rail's group labels lost its chroma, and the
    // detector reported them as grey on colour 52 times. A rail with no colour (a black, a grey) keeps neutral words:
    // the hue and chroma the page's own text uses, and its quiet words a mix of its text and the rail. Tinted in the
    // brand's hue, a black rail's words came out a pale green beside a vivid green brand.
    const coloured = railGrounds.some(carriesColour);
    const hue = safeHue(toOklch(v.rail).h);
    const tint = (L, C) => oklchToHex(gamutMapOklch({ L, C, h: hue }));
    const tinted = (role, L, against, min, mode) => {
      let C = Math.min(Math.max(toOklch(v.rail).C, 0.05), 0.08);
      while (C < 0.16 && readsGrey(solveForContrast(tint(L, C), against, min, { mode }).hex)) C += 0.01;
      return solve(role, tint(L, C), against, min, mode);
    };
    const page = toOklch(v.text);
    const neutral = (L) => oklchToHex(gamutMapOklch({ L, C: page.C, h: safeHue(page.h) }));
    v['rail-text'] = coloured ? tinted('rail-text', darkRail ? 0.93 : 0.25, railGrounds, 7, 'nearest') : solve('rail-text', neutral(darkRail ? 0.93 : 0.25), railGrounds, 7);
    v['rail-text-strong'] = labelOn(v.rail).hex;
    v['rail-muted'] = coloured
      ? tinted('rail-muted', darkRail ? 0.8 : 0.4, mutedGrounds, FLOORS.text, 'floor')
      : solve('rail-muted', mix(v.rail, v['rail-text'], 0.55), mutedGrounds, FLOORS.text, 'floor');
    v['rail-focus'] = solve('rail-focus', v.highlight, railGrounds, FLOORS['non-text']);
  } else {
    v.rail = '{surface}';
    v['rail-hover'] = '{hover}';
    v['rail-selected'] = '{selected}';
    v['rail-line'] = '{line}';
    v['rail-edge'] = '{line}';
    v['rail-text'] = '{text-muted}';
    v['rail-text-strong'] = '{text-strong}';
    v['rail-muted'] = '{text-subtle}';
    v['rail-focus'] = '{focus}';
  }

  return { values: v, notes };
}

const USAGE = {
  canvas: 'Behind everything. Panes and cards sit on it.',
  surface: 'Cards, panes, inputs and table bodies.',
  'surface-subtle': 'Table heads, list panes and card footers: a step from the surface towards the canvas.',
  'surface-sunken': 'Tracks, segmented-control grounds and wells inside a surface.',
  'surface-raised': 'Menus, popovers, dialogs and sheets.',
  'surface-inverse': 'Tooltips and the rare inverted strip.',
  scrim: 'Behind a dialog or sheet.',
  rail: 'The navigation rail.',
  'rail-text': 'Navigation labels on the rail.',
  'rail-text-strong': 'The selected item and the product name on the rail.',
  'rail-muted': 'Group labels and quiet counts on the rail.',
  'rail-hover': 'A hovered rail item.',
  'rail-selected': 'The current rail item.',
  'rail-line': 'Dividers on the rail.',
  'rail-edge': 'The rail\'s edge against the page: its own line where the rail stands well apart from the canvas, the page\'s hairline where the two sit close.',
  'rail-focus': 'The focus ring on the rail, which needs its own colour when the rail is dark.',
  'text-strong': 'Titles and figures.',
  text: 'Body text, and text on selected rows, hovered rows and tags.',
  'text-muted': 'Supporting copy. Also the quiet text on selected rows, where text-subtle is not guaranteed.',
  'text-subtle': 'Meta, timestamps, placeholders, table heads and axis labels. The quietest text allowed.',
  'text-inverse': 'Text on surface-inverse.',
  link: 'Links in running text.',
  'link-hover': 'A hovered link.',
  line: 'Hairlines between rows and around cards.',
  'line-strong': 'Secondary-button and table edges.',
  'line-control': 'Input, select and checkbox edges: 3:1 on every surface, so a field is findable without its label.',
  primary: 'The one primary action per view.',
  'primary-hover': 'A hovered primary action.',
  'primary-pressed': 'A pressed primary action.',
  'on-primary': 'The label on a primary action.',
  brand: 'The brand colour as a fill: the brand button, the selected line, illustration.',
  'brand-hover': 'A hovered brand fill.',
  'on-brand': 'The label on a brand fill.',
  hover: 'The hover wash on rows, ghost buttons, menu items and chips. Composited before it is measured.',
  pressed: 'The pressed wash.',
  selected: 'Selected rows.',
  'selected-strong': 'The one item open beside a list.',
  'selected-line': 'The edge on the open item. Always with selected-strong, never alone.',
  focus: 'The focus ring: an outline with an offset, 3:1 on every ground.',
  highlight: 'Counts and badges that need the reader, search matches, selected text. A fill, never text.',
  'highlight-soft': 'A quieter highlight ground.',
  'on-highlight': 'Text on the highlight.',
  'on-danger': 'The label on a destructive button.',
  'chart-grid': 'Chart gridlines. Decorative.',
  'chart-compare': 'The comparison series: grey and dashed, 3:1 on a card.',
  'chart-track': 'The track behind progress and meters.',
  'tag-grey': 'A tag with no category colour.',
};

const statusUsage = (s) => ({
  [s]: `${s === 'ai' ? 'What the assistant made or suggested' : `The ${s} word`}: on a card and on its own tint.`,
  [`${s}-surface`]: `The ${s} tint behind a badge, banner or alert.`,
  [`${s}-solid`]: `Dots and fills for ${s}. Always with a word or an icon.`,
  [`${s}-line`]: `The edge of a ${s} banner or alert.`,
});

/** The pairs each token is measured against. */
function contrastFor(name, { railDecided }) {
  const textOn = (on, min = FLOORS.text) => [{ on, min, kind: 'text' }];
  const nonText = (on) => [{ on, min: FLOORS['non-text'], kind: 'non-text' }];
  // A state against the colour it changes: not a contrast floor, the least step an eye can see.
  const step = (on, min) => [{ on, min, kind: 'step' }];
  const tags = [...Array.from({ length: SERIES_COUNT }, (_, i) => `tag-${i + 1}`), 'tag-grey'];
  switch (name) {
    case 'text-strong': return textOn([...SURFACES, 'highlight-soft']);
    case 'text': return textOn([...SURFACES, 'hover@surface', 'selected', 'selected-strong', ...tags]);
    case 'text-muted': return textOn([...SURFACES, 'hover@surface', 'selected', 'selected-strong']);
    case 'text-subtle': return textOn(SURFACES);
    case 'text-inverse': return textOn(['surface-inverse']);
    case 'link': case 'link-hover': return textOn(['surface', 'surface-subtle', 'canvas']);
    case 'line-control': return nonText(['surface', 'surface-raised', 'surface-sunken', 'canvas', 'hover@surface']);
    case 'primary': return nonText(['surface', 'canvas', 'line', 'surface-sunken']);
    case 'on-primary': return textOn(['primary', 'primary-hover', 'primary-pressed']);
    case 'on-brand': return textOn(['brand', 'brand-hover']);
    case 'focus': return nonText([...SURFACES, 'selected', 'selected-strong']);
    case 'on-highlight': return textOn(['highlight']);
    case 'on-danger': return textOn(['danger-solid']);
    case 'chart-compare': return nonText(['surface']);
    case 'primary-hover': return step(['primary'], STEP.hover);
    case 'primary-pressed': return step(['primary'], STEP.pressed);
    case 'brand-hover': return step(['brand'], STEP.hover);
    default: break;
  }
  if (STATUS_FAMILIES.includes(name)) return textOn(['surface', 'surface-subtle', 'canvas', `${name}-surface`]);
  if (/^series-\d+$/.test(name)) return nonText(['surface', 'surface-subtle']);
  if (railDecided) {
    if (name === 'rail-text' || name === 'rail-text-strong') return textOn(['rail', 'rail-hover', 'rail-selected']);
    if (name === 'rail-muted') return textOn(['rail', 'rail-hover']);
    if (name === 'rail-focus') return nonText(['rail', 'rail-hover', 'rail-selected']);
    if (name === 'rail-hover') return step(['rail'], STEP.hover);
    if (name === 'rail-selected') return step(['rail'], STEP.selected);
    if (name === 'rail-line') return step(['rail'], STEP.line);
  }
  return [];
}

/** The type styles a working screen needs, sized for density rather than reading. */
function typeGroups({ displayForTitles, displayCase = null }) {
  const display = displayForTitles
    ? { family: 'display', fontWeight: 400 }
    : { family: 'sans', fontWeight: 700 };
  // A display face the brand only ever sets in capitals is set in capitals here too, opened up a little,
  // because capitals set at a lower-case face's tight tracking crowd.
  const caps = displayForTitles && displayCase === 'upper';
  const set = (style) => (caps ? { ...style, letterSpacing: '0.01em', textTransform: 'uppercase' } : style);
  return [
    {
      name: 'Display',
      family: display.family,
      note: displayForTitles
        ? 'The display face in three places only: the page title, a greeting or full-page headline, and the sign-in hero. One display moment per screen.'
        : 'The display face is not used in product screens; titles are the body face, bold.',
      styles: [
        set({ name: 'hero', fontSize: '48px', lineHeight: '52px', fontWeight: display.fontWeight, letterSpacing: '-0.02em', usage: 'Sign-in and onboarding heroes only.' }),
        set({ name: 'display', fontSize: '36px', lineHeight: '42px', fontWeight: display.fontWeight, letterSpacing: '-0.015em', usage: 'A greeting or a full-page headline.' }),
        set({ name: 'title', fontSize: '26px', lineHeight: '32px', fontWeight: display.fontWeight, letterSpacing: '-0.01em', usage: 'The page title.' }),
      ],
    },
    {
      name: 'Interface',
      family: 'sans',
      note: 'Body 14/20 is the default at every width, phones included: interface text is labels, rows and values, not reading. Reading text is body-lg.',
      styles: [
        { name: 'heading-lg', fontSize: '20px', lineHeight: '28px', fontWeight: 700, letterSpacing: '-0.01em', usage: 'Dialog and section headings.' },
        { name: 'heading', fontSize: '16px', lineHeight: '24px', fontWeight: 700, letterSpacing: '-0.01em', usage: 'Card headings.' },
        { name: 'heading-sm', fontSize: '14px', lineHeight: '20px', fontWeight: 700, letterSpacing: '-0.005em', usage: 'Small headings inside cards.' },
        { name: 'kpi', fontSize: '32px', lineHeight: '36px', fontWeight: 700, letterSpacing: '-0.02em', usage: 'Headline figures. Tabular figures.' },
        { name: 'kpi-sm', fontSize: '22px', lineHeight: '28px', fontWeight: 700, letterSpacing: '-0.01em', usage: 'Secondary figures. Tabular figures.' },
        { name: 'body-lg', fontSize: '16px', lineHeight: '24px', fontWeight: 400, letterSpacing: '-0.005em', usage: 'Reading: assistant answers, notes, help.' },
        { name: 'body', fontSize: '14px', lineHeight: '20px', fontWeight: 400, usage: 'The default interface size.' },
        { name: 'label', fontSize: '14px', lineHeight: '20px', fontWeight: 500, usage: 'Buttons, fields, navigation and tabs.' },
        { name: 'meta', fontSize: '13px', lineHeight: '18px', fontWeight: 400, usage: 'Secondary text.' },
        { name: 'caption', fontSize: '12px', lineHeight: '16px', fontWeight: 500, usage: 'Captions and small labels.' },
        { name: 'eyebrow', fontSize: '11px', lineHeight: '16px', fontWeight: 700, letterSpacing: '0.06em', usage: 'Table heads, rail groups and menu groups. Uppercase by style, sentence case in the source.' },
      ],
    },
    {
      name: 'Code',
      family: 'mono',
      note: 'Identifiers, keys and code.',
      styles: [
        { name: 'code', fontSize: '13px', lineHeight: '20px', fontWeight: 400, usage: 'Inline code and identifiers.' },
      ],
    },
  ];
}

const FALLBACK = {
  // The serif is only for a face with no name; a named one takes displayFallback's reading of it.
  display: 'Georgia, "Times New Roman", serif',
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};
const quote = (family) => (/\s/.test(family) ? `"${family}"` : family);

/** The families a brand's shapes are measured in, each the radius role it sets. */
export const SHAPE_FAMILIES = Object.freeze({
  press: 'radius-action',
  control: 'radius-control',
  card: 'radius-md',
  pane: 'radius-lg',
  frame: 'radius-frame',
});

/**
 * product.json's `shape`, checked. Each family is a radius in px (press may be "pill") and where it was
 * measured: the guidelines first, the brand's own live work where they are silent. `shell` is the rail's
 * form, and `moves` the brand's own shape moves the product carries. A shape with no source is a guess.
 */
export function checkShape(shape = {}) {
  const { families = {}, shell = null, moves = null } = shape ?? {};
  if (!families || typeof families !== 'object' || Array.isArray(families)) throw new TypeError('shape.families is an object of { px, source }, one per family');
  const named = (s) => typeof s === 'string' && s.trim() !== '';
  for (const [family, f] of Object.entries(families)) {
    if (!SHAPE_FAMILIES[family]) throw new TypeError(`shape.families.${family}: a family is one of ${Object.keys(SHAPE_FAMILIES).join(', ')}`);
    const pill = family === 'press' && f?.px === 'pill';
    if (!pill && !(typeof f?.px === 'number' && f.px >= 0)) throw new TypeError(`shape.families.${family}: px is a radius in pixels${family === 'press' ? ', or "pill"' : ''}`);
    if (!named(f.source)) throw new TypeError(`shape.families.${family}: source says where it was measured`);
    if (f.filled != null && typeof f.filled !== 'boolean') throw new TypeError(`shape.families.${family}: filled is true for a value a run decided to fill a gap, never the brand's`);
  }
  if (shell?.filled != null && typeof shell.filled !== 'boolean') throw new TypeError('shape.shell.filled is true for a form a run decided to fill a gap, never the brand\'s');
  if (shell != null && (!['edge', 'floating'].includes(shell.form) || !named(shell.source))) throw new TypeError('shape.shell is { form: "edge" or "floating", source }');
  if (moves != null && (!Array.isArray(moves) || moves.some((m) => !named(m?.name) || !named(m?.source) || !Array.isArray(m?.where) || !m.where.length))) {
    throw new TypeError('shape.moves is a list of { name, source, where: [the surfaces that carry it] }');
  }
  // A move that names its file is carried: copied beside tokens.css and into the starter, and laid on by a class.
  // The file sits in the product folder's textures/, as the faces sit in fonts/, so every copy finds it by one path.
  for (const m of moves ?? []) {
    if (m.file == null && m.kind == null && m.strength == null) continue;
    if (m.kind !== 'texture') throw new TypeError(`shape.moves "${m.name}": kind is "texture", the one kind a move's file is carried as`);
    if (typeof m.file !== 'string' || !/^textures\/[A-Za-z0-9_.-]+\.(png|jpe?g|webp|svg)$/.test(m.file)) throw new TypeError(`shape.moves "${m.name}": file is textures/<name>.jpg (or .png, .webp, .svg), in the product folder, got ${JSON.stringify(m.file)}`);
    if (!(typeof m.strength === 'number' && m.strength > 0 && m.strength <= 1)) throw new TypeError(`shape.moves "${m.name}": strength is the layer's opacity, above 0 and up to 1, set so the darkest mark under the words still clears 4.5:1`);
  }
  if ((moves ?? []).filter((m) => m.kind === 'texture').length > 1) throw new TypeError('shape.moves carries one texture: name the others without a file');
  return { ...shape, families, shell, moves };
}

/** The texture move a system carries, or null: the one move whose file is laid on by `.brand-texture`. */
export const textureMove = (tokens) => (tokens.radius?.moves ?? []).find((m) => m.kind === 'texture' && m.file) ?? null;

/**
 * Radii from the brand's measured shapes, renamed for the jobs a product gives them. A family the brand
 * was measured for takes the measurement and its source. Anything else is derived from the brand's scale,
 * never rounder than the largest radius measured, a pane never rounder than a card and a badge never
 * rounder than a control. `action` is the shape of whatever a person can press when press is not
 * measured: the pill by default ("if it is a pill, you can press it"), the control radius when the
 * brand's buttons match its inputs, or a value of its own. Each token says where it came from: `source`
 * for the brand's, `derived` for the kit's.
 */
function productRadii(system, shape = {}) {
  const { action = null, families, shell } = checkShape(shape);
  const step = Object.fromEntries((system.radius ?? []).map((r) => [r.name, r.px]));
  const px = (v) => (v === 'pill' ? '9999px' : typeof v === 'string' ? v : `${Math.round(v)}px`);
  // A square photo says nothing about a card, so frames are left out of the largest measured radius.
  const lengths = Object.entries(families).filter(([family]) => family !== 'frame').map(([, f]) => f.px).filter((v) => typeof v === 'number');
  const cap = lengths.length ? Math.max(...lengths) : Infinity;
  const measured = (family) => (families[family] ? { v: families[family].px, source: families[family].source, ...(families[family].filled ? { filled: true } : {}) } : null);
  const derive = (v, how, under = null) => {
    let out = Math.min(v ?? 0, cap);
    let said = out < (v ?? 0) ? `${how}, held to the largest measured radius (${px(cap)})` : how;
    if (under && out > under.v) [out, said] = [under.v, `${how}, held to ${under.name} (${px(under.v)})`];
    return { v: out, derived: said };
  };

  const press = measured('press');
  const control = measured('control')
    ?? (action === 'control' && press && press.v !== 'pill' ? { v: press.v, source: 'the measured press (radius-action), since buttons match the inputs (shape.action "control")' } : derive(step.md, `from the brand's scale, its md step (${px(step.md ?? 0)})`));
  const actionR = press
    ?? (action === 'control' ? { v: control.v, source: 'buttons match the inputs (shape.action "control")' }
      : action && action !== 'pill' ? { v: String(action), source: `shape.action "${action}"` }
        : action === 'pill' ? { v: 'pill', source: 'shape.action "pill"' }
          : { v: 'pill', derived: 'the pill: if it is a pill, you can press it' });
  const card = measured('card') ?? derive(step.lg, `from the brand's scale, its lg step (${px(step.lg ?? 0)})`);
  const pane = measured('pane') ?? derive(step.xl, `from the brand's scale, its xl step (${px(step.xl ?? 0)})`, { name: 'the card radius', v: card.v });
  const frame = measured('frame') ?? { v: 0, derived: 'square, the plainest form, with no photo measured' };
  // A list's items sit 4px in from its edge, so its corner is theirs plus 4px: concentric, never rounder than a card.
  const list = { v: Math.min(card.v, control.v + 4), derived: `the control radius plus the list's 4px padding${control.v + 4 > card.v ? ', held to the card radius' : ''}` };
  const sm = derive(step.sm, `from the brand's scale, its sm step (${px(step.sm ?? 0)})`, { name: 'the control radius', v: control.v });
  const xs = derive(step.xs, `from the brand's scale, its xs step (${px(step.xs ?? 0)})`, { name: 'radius-sm', v: sm.v });
  const xl = derive(step['2xl'], `from the brand's scale, its 2xl step (${px(step['2xl'] ?? 0)})`, { name: 'the pane radius', v: pane.v });
  const rail = shell
    ? { v: shell.form === 'floating' ? pane.v : 0, source: shell.source, ...(shell.filled ? { filled: true } : {}) }
    : { v: 0, derived: 'square, meeting the window edge: the plainest form, with no shell named' };

  // A value a run filled keeps its source and says it filled it, so no board or record shows it as the brand's.
  const token = (name, r, usage) => ({ name, value: px(r.v), usage, ...(r.source ? { source: r.source, ...(r.filled ? { filled: true } : {}) } : { derived: r.derived }) });
  return [
    token('radius-xs', xs, 'Checkboxes, keyboard keys, tooltips and tiny marks.'),
    token('radius-sm', sm, 'Badges and tags.'),
    token('radius-control', control, 'Inputs, selects and menu items.'),
    token('radius-md', card, 'Cards, popovers and toasts.'),
    token('radius-list', list, 'Menus, selects and listboxes: their items sit 4px inside them.'),
    token('radius-lg', pane, 'Panes and dialogs.'),
    token('radius-xl', xl, 'Sign-in and onboarding frames.'),
    token('radius-frame', frame, 'Photos and the frames around them.'),
    token('radius-rail', rail, 'The rail, the drawer it becomes on a phone, and sheets: what is attached to the window.'),
    token('radius-action', actionR, actionR.v === 'pill' ? 'Whatever a person can press: buttons, filter chips, segmented controls and the switch. If it is a pill, you can press it.' : 'Whatever a person can press: buttons, filter chips, segmented controls and the switch.'),
    { name: 'radius-pill', value: '9999px', usage: 'The full round, for avatars, dots and counts. Whatever a person can press takes radius-action.' },
  ];
}

/**
 * Every shape and shell choice the brand did not make, each with how the kit made it: a radius role no
 * family was measured for, the shell when the brand names none, and no shape move of the brand's own.
 * The round record lists them, so a reviewer can see where the kit speaks instead of the brand.
 */
export function shapeKitDefaults(tokens) {
  // The pill is the kit's rule for avatars and dots, not a brand choice. A token with no source is the kit's, old files' too.
  const out = (tokens.radius?.tokens ?? []).filter((t) => (!t.source || t.filled) && t.name !== 'radius-pill')
    .map((t) => ({ choice: t.name, value: t.value, how: t.filled ? `filled by the run, not the brand's: ${t.source}` : t.derived ?? 'no source recorded: written before shapes carried one' }));
  if (!tokens.radius?.shell) out.push({ choice: 'shell', value: 'edge', how: 'the rail meets the window edge, the plainest form, with no shell named' });
  else if (tokens.radius.shell.filled) out.push({ choice: 'shell', value: tokens.radius.shell.form, how: `filled by the run, not the brand's: ${tokens.radius.shell.source}` });
  if (!tokens.radius?.moves?.length) out.push({ choice: 'moves', value: 'none', how: 'no shape move of the brand\'s own is carried into the product' });
  return out;
}

/**
 * Build the product token set from a resolved Brandi system.
 *
 * @param {object} system  the output of buildSystem
 * @param {object} opts
 * @param {string} [opts.name]              the system's name
 * @param {{name: string, hex: string}[] | Record<string, string>} [opts.brandColours]  the brand book's named colours, as a list or a name-to-hex map
 * @param {object} [opts.roles]             decided roles: { primary, brand, highlight, canvas, ink, focus, rail }, each a colour for both themes or { light, dark }
 * @param {boolean} [opts.displayForTitles] whether the display face sets titles (default true)
 * @param {object} [opts.source]            where the brand came from, recorded in meta
 * @param {object[]} [opts.directions]      roles a concept board moves: [{ name, roles, note }] (checkDirections)
 * @param {object} [opts.motion]            the brand's motion signature: { name, durationMs, easing, source } (checkMotion)
 */
/**
 * The faces a system ships as files: { family, file, weight, style }. A hosted face (Google) has no
 * file and is named in the families only.
 */
export function checkFonts(fonts) {
  if (!Array.isArray(fonts)) throw new TypeError('fonts must be a list of { family, file, weight, style }');
  return fonts.map((f) => {
    if (!f || typeof f.family !== 'string' || !f.family.trim() || /["']/.test(f.family)) throw new TypeError(`a font needs a bare family name, got ${JSON.stringify(f?.family)}`);
    if (typeof f.file !== 'string' || !/^fonts\/[A-Za-z0-9_.-]+\.(woff2|woff|ttf|otf)$/.test(f.file)) throw new TypeError(`${f.family}: file must be fonts/<name>.woff2 (or .woff, .ttf, .otf), got ${JSON.stringify(f.file)}`);
    const weight = String(f.weight ?? '400');
    if (!/^\d{3}( \d{3})?$/.test(weight)) throw new TypeError(`${f.family}: weight is "400" or a range such as "300 900", got ${JSON.stringify(f.weight)}`);
    const style = f.style ?? 'normal';
    if (!['normal', 'italic', 'oblique'].includes(style)) throw new TypeError(`${f.family}: style is normal, italic or oblique`);
    return { family: f.family.trim(), file: f.file, weight, style };
  });
}

/** The kit's interface durations, fastest first: each the job it times. A character scene keeps its own length. */
const DURATIONS = Object.freeze([
  { name: 'duration-fast', ms: 120, usage: 'Hover, press, focus.' },
  { name: 'duration-base', ms: 180, usage: 'Menus, tabs and toggles.' },
  { name: 'duration-slow', ms: 260, usage: 'Sheets and dialogs.' },
]);

/** The longest a sheet or dialog may take to arrive in a product someone works in all day. */
export const MOTION_CEILING_MS = 400;

const CSS_CURVES = new Set(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']);
// A number as CSS writes one. Number() also reads 0x1 and 0b1, which a browser drops along with the whole declaration.
const CSS_NUMBER = /^[+-]?(\d+(\.\d+)?|\.\d+)(e[+-]?\d+)?$/i;

/** True for a curve CSS can draw: a keyword, or cubic-bezier with both x values between 0 and 1. */
function isCurve(s) {
  if (typeof s !== 'string') return false;
  if (CSS_CURVES.has(s.trim().toLowerCase())) return true;
  const m = /^cubic-bezier\(([^,()]*),([^,()]*),([^,()]*),([^,()]*)\)$/i.exec(s.trim());
  if (!m || !m.slice(1).every((n) => CSS_NUMBER.test(n.trim()))) return false;
  const [x1, , x2] = m.slice(1).map(Number);
  return x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1;
}

/**
 * Neutrals the brand names in words that its record does not carry: "sand neutrals" in the colour ratio, with the
 * neutral hue left as the primary, so the product's neutrals came out a green grey and nothing said so. Returns one
 * line per such word, for the run to ask the brand for the value; nothing when the record carries its own neutral.
 */
export function neutralsInWords(brand, { asked = [] } = {}) {
  const colour = brand?.identity?.colour ?? {};
  const hex = (v) => String(v ?? '').trim().toLowerCase();
  // A neutral hue the brand set apart from its primary is the brand's own; one that is the primary was filled in.
  if (colour.neutralHue && hex(colour.neutralHue) !== hex(colour.primary)) return [];
  const said = [colour.ratio, ...(brand?.strategy?.distinctiveAssets ?? []).map((a) => a?.asset), brand?.identity?.imagery?.treatment].filter((t) => typeof t === 'string');
  const plain = new Set(['cool', 'warm', 'neutral', 'grey', 'gray', 'soft', 'quiet', 'light', 'dark', 'the', 'and']);
  const words = new Set();
  for (const t of said) for (const m of t.matchAll(/\b([a-z]+) neutrals?\b/gi)) if (!plain.has(m[1].toLowerCase())) words.add(m[1].toLowerCase());
  // A word already recorded as a question for the brand, or a decision, is not asked again on every run.
  const recorded = asked.map((q) => (typeof q === 'string' ? q : JSON.stringify(q ?? '')).toLowerCase()).join('\n');
  return [...words].filter((w) => !new RegExp(`\\b${w}\\b`).test(recorded)).map((w) => `The brand speaks of ${w} neutrals, and its record carries no ${w} value: the neutrals follow ${colour.neutralHue ? `the neutral hue, its primary (${colour.neutralHue})` : 'its primary'}. Ask the brand for the ${w} it means and set identity.colour.neutralHue to it, or record the gap as an open question.`);
}

/** What a motion signature holds, as brand.json's identity.motionSignature does, and where it was read. */
const SIGNATURE_KEYS = Object.freeze(['name', 'description', 'durationMs', 'easing', 'source']);

/**
 * The brand's motion signature, checked: { name, description, durationMs, easing }, as brand.json's
 * identity.motionSignature holds it (route B's input file takes the same form), with `source` saying where it was
 * read. A field it does not hold is refused: a misspelt `duration` would leave the product on the kit's motion.
 */
export function checkMotion(motion) {
  if (motion == null) return null;
  if (typeof motion !== 'object' || Array.isArray(motion)) throw new TypeError(`the brand's motion signature is { name, description, durationMs, easing }, got ${JSON.stringify(motion)}`);
  const where = `motion signature${motion.source ? ` (${motion.source})` : ''}`;
  const other = Object.keys(motion).filter((k) => !SIGNATURE_KEYS.includes(k));
  if (other.length) throw new TypeError(`${where}: ${other.join(', ')} is not part of a signature: it holds name, description, durationMs and easing`);
  const { durationMs = null, easing = null } = motion;
  if (durationMs != null && !(typeof durationMs === 'number' && Number.isFinite(durationMs) && durationMs > 0)) {
    throw new TypeError(`${where}: durationMs is a number of milliseconds above 0, got ${JSON.stringify(durationMs)}`);
  }
  if (easing != null && !isCurve(easing)) {
    throw new TypeError(`${where}: easing ${JSON.stringify(easing)} is not a curve CSS can draw: write cubic-bezier(x1, y1, x2, y2) or a keyword such as ease-out`);
  }
  return { name: motion.name ?? null, durationMs, easing: easing?.trim() ?? null, source: motion.source ?? null };
}

/**
 * The product's durations and curves from the brand's signature, the kit's values filling what it leaves out. The
 * signature's curve is ease-standard. Its duration sets the job nearest it, a tie going to the slower job, so a
 * duration too slow for a hover or a press sets a menu's or a sheet's instead and feedback stays quick. Past
 * MOTION_CEILING_MS it is held there. Each token says where it came from, as a radius does: `source` for the brand's,
 * `derived` for the kit's.
 */
function productMotion(motion) {
  const sig = checkMotion(motion);
  const called = sig?.name ? `, ${sig.name}` : '';
  const whose = `the motion signature${called}${sig?.source ? ` (${sig.source})` : ''}`;
  const absent = (what) => (sig ? `the motion signature${called}${called ? ',' : ''} names no ${what}` : 'no motion signature in the brand');
  const ms = sig?.durationMs ?? null;
  const nearest = ms == null ? null : DURATIONS.reduce((best, d) => (Math.abs(d.ms - ms) <= Math.abs(best.ms - ms) ? d : best));
  const duration = DURATIONS.map((d) => {
    const t = { name: d.name, value: `${d.ms}ms`, usage: d.usage };
    if (d !== nearest) return { ...t, derived: ms == null ? absent('duration') : `the brand's ${ms}ms sets ${nearest.name}, the job nearest it` };
    if (ms > MOTION_CEILING_MS) return { ...t, value: `${MOTION_CEILING_MS}ms`, derived: `the brand's ${ms}ms${sig.name ? ` (${sig.name})` : ''}, held to ${MOTION_CEILING_MS}ms: past that a sheet or dialog keeps someone waiting` };
    return { ...t, value: `${ms}ms`, source: whose };
  });
  duration.push({ name: 'duration-scene', value: '1250ms', usage: 'A character scene, which then stops.', derived: "a signature times the interface, not a character's scene" });
  const easing = [
    sig?.easing
      ? { name: 'ease-standard', value: sig.easing, usage: 'Every transition.', source: whose }
      : { name: 'ease-standard', value: 'cubic-bezier(0.2, 0.8, 0.2, 1)', usage: 'Every transition.', derived: absent('curve') },
    { name: 'ease-exit', value: 'cubic-bezier(0.4, 0, 1, 1)', usage: 'Things leaving.', derived: "something leaving accelerates away; a signature's curve sets how things arrive" },
  ];
  return { duration, easing };
}

/** The roles a direction may move: the ones product.json's `roles` decides. */
export const DIRECTION_ROLES = Object.freeze(['primary', 'brand', 'highlight', 'canvas', 'ink', 'focus', 'rail']);

/**
 * One decided role as { light, dark }, in the forms product.json's roles and a direction both take: one colour for
 * both themes, or { light, dark } with either left out. `colour` reads one value and throws with the caller's reason.
 * Anything else is refused, never dropped: a plain hex at the root was once read as two undecided themes, and the rail
 * stayed the surface with no word.
 */
function bothThemes(v, colour, where) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return { light: colour(v), dark: colour(v) };
  const other = Object.keys(v).filter((k) => k !== 'light' && k !== 'dark');
  if (other.length) throw new TypeError(`${where} is a colour or { light, dark }: ${other.join(', ')} is neither`);
  const set = ['light', 'dark'].filter((m) => v[m] != null);
  if (!set.length) throw new TypeError(`${where} is { light, dark } with neither set: give one, or leave the role out`);
  return Object.fromEntries(set.map((m) => [m, colour(v[m])]));
}

/**
 * product.json's `directions`, checked: [{ name, roles, note }], each role a hex, one of the brand's colours by name
 * (with or without brand-), or { light, dark } of those. Returns each with its class (direction-<name>) and its roles
 * as { light, dark } hexes. `brandHex` maps a brand colour's name to its hex.
 */
export function checkDirections(directions, brandHex) {
  if (!Array.isArray(directions)) throw new TypeError('directions is a list of { name, roles, note }');
  const classes = new Set();
  return directions.map((d) => {
    if (typeof d?.name !== 'string' || !d.name.trim()) throw new TypeError('each direction needs a name, such as "B"');
    const slug = d.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const cls = `direction-${slug}`;
    if (!slug) throw new TypeError(`direction ${JSON.stringify(d.name)}: its name needs a letter or a digit, for its class`);
    if (classes.has(cls)) throw new TypeError(`"${d.name}" makes ${cls} a second time: give each direction a name of its own`);
    classes.add(cls);
    if (!d.roles || typeof d.roles !== 'object' || Array.isArray(d.roles) || !Object.keys(d.roles).length) {
      throw new TypeError(`direction ${d.name}: roles names at least one role the direction moves. A direction that only changes the layout needs no class`);
    }
    const colour = (role, v) => {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v))) return v;
      const key = String(v).toLowerCase().replace(/^brand-/, '');
      if (brandHex.has(key)) return brandHex.get(key);
      throw new TypeError(`direction ${d.name}: ${role} names ${v}, which is not a hex value or one of the brand's colours (${[...brandHex.keys()].join(', ')})`);
    };
    const roles = {};
    for (const [role, v] of Object.entries(d.roles)) {
      if (!DIRECTION_ROLES.includes(role)) throw new TypeError(`direction ${d.name}: ${role} is not a role a direction can move; it moves ${DIRECTION_ROLES.join(', ')}`);
      if (v === undefined) continue;
      // Null is the role undecided, as the kit solves it: a concept drawn before the pick keeps its look after it. A
      // run kept today's quiet rail only by typing the surface's hexes into a direction.
      roles[role] = v === null ? null : bothThemes(v, (x) => colour(role, x).toLowerCase(), `direction ${d.name}: ${role}`);
    }
    if (!Object.keys(roles).length) throw new TypeError(`direction ${d.name}: roles names at least one role the direction moves. A direction that only changes the layout needs no class`);
    return { name: d.name.trim(), class: cls, ...(d.note ? { note: String(d.note) } : {}), roles };
  });
}

export function buildProductTokens(system, { name = 'Product system', brandColours: brandColoursIn = null, roles: rolesIn = {}, displayForTitles = true, displayCase = null, charts = {}, source = null, fonts: fontFiles = [], shape = {}, directions = [], motion = null } = {}) {
  if (!system?.palettes?.brand || !system?.palettes?.neutral) throw new TypeError('buildProductTokens needs a resolved Brandi system');

  // Decided values arrive as people write them: "#fff" as often as "#FFFFFF",
  // and sometimes for one theme only. Expand the short form here so every
  // helper downstream sees six digits, and leave an undecided theme undecided.
  const expand = (hex) => {
    if (hex == null) return undefined;
    if (typeof hex !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) throw new TypeError(`a decided colour must be a hex value like #0F2A4A, not ${JSON.stringify(hex)}`);
    return hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
  };
  // People write the brand's colours as a list or as a name-to-hex map, and the reference showed neither, so both
  // are read. A map once reached `.map` and stopped the whole build with "brandColoursIn.map is not a function".
  const listed = brandColoursIn == null ? null
    : Array.isArray(brandColoursIn) ? brandColoursIn
      : typeof brandColoursIn === 'object' ? Object.entries(brandColoursIn).map(([name, hex]) => ({ name, hex }))
        : undefined;
  if (listed === undefined || listed?.some((c) => typeof c?.name !== 'string' || !c.name.trim() || c.hex == null)) {
    throw new TypeError('brandColours is a list of { name, hex } or a { name: hex } map, each with a name and a hex value');
  }
  const brandColours = listed ? listed.map((c) => ({ ...c, hex: expand(c.hex) })) : null;

  const primitives = (brandColours ?? [
    { name: 'primary', hex: hexOf(system.palettes.brand.seed) ?? hexOf(system.palettes.brand.light.steps[8]) },
    ...Object.keys(system.palettes).filter((k) => /^accent\d+$/.test(k)).map((k, i) => ({
      name: `accent-${i + 1}`,
      hex: hexOf(system.palettes[k].seed) ?? hexOf(system.palettes[k].light.steps[8]),
    })),
  ]).map((c) => ({
    name: `brand-${c.name}`,
    brand: true,
    value: { light: c.hex.toLowerCase(), dark: c.hex.toLowerCase() },
    usage: "The brand book's exact value. Roles alias it; interface code never uses it directly.",
    contrast: [],
  }));
  const brandHex = new Map(primitives.map((p) => [p.name.replace(/^brand-/, '').toLowerCase(), p.value.light]));

  // The decided roles, in the forms a direction's roles take: a hex or one of the brand's colours by name, for both
  // themes, or { light, dark } of those. A key the engine does not decide is refused by name rather than carried
  // unread, and so is a value it cannot read.
  const decidedColour = (role) => (v) => {
    if (typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return expand(v);
    const key = typeof v === 'string' ? v.toLowerCase().replace(/^brand-/, '') : null;
    if (brandHex.has(key)) return brandHex.get(key);
    throw new TypeError(`roles.${role}: a decided colour must be a hex value like #0F2A4A or one of the brand's colours (${[...brandHex.keys()].join(', ')}), not ${JSON.stringify(v)}`);
  };
  const roles = {};
  for (const [role, val] of Object.entries(rolesIn ?? {})) {
    if (!DIRECTION_ROLES.includes(role)) throw new TypeError(`roles.${role} is not a role product.json decides: it decides ${DIRECTION_ROLES.join(', ')}. Every other role is solved from these`);
    if (val == null) continue;
    roles[role] = bothThemes(val, decidedColour(role), `roles.${role}`);
  }

  // The assistant's family borrows the brand's saturation, like Brandi's status colours do.
  const base = toOklch(hexOf(system.palettes.brand.light.steps[8]));
  const aiSeed = oklchToHex(gamutMapOklch({ L: 0.55, C: Math.min(Math.max(base.C, 0.09), 0.19), h: AI_HUE }));
  const ai = { light: tonalRamp(aiSeed, { mode: 'light', name: 'ai' }), dark: tonalRamp(aiSeed, { mode: 'dark', name: 'ai' }) };

  // The brand's own dark ink, preferred for labels wherever it passes, so a label
  // on a brand fill is the brand's navy rather than a neutral near-black.
  const darkCandidates = [roles.ink?.light, roles.primary?.light, roles.rail?.light, ...(brandColours ?? []).map((c) => c.hex)].filter(Boolean);
  const brandInk = darkCandidates.filter((h) => toOklch(h).L < 0.3).sort((a, b) => toOklch(a).L - toOklch(b).L)[0] ?? null;
  // charts.avoid: colours the brand keeps off one theme's grounds (a pink barred from dark, say).
  const avoid = (m) => (charts?.avoid?.[m] ?? []).map(expand).filter(Boolean);
  const light = themeValues(system, 'light', roles, ai, brandInk, avoid('light'));
  const dark = themeValues(system, 'dark', roles, ai, brandInk, avoid('dark'));
  const railDecided = Boolean(roles.rail?.light || roles.rail?.dark);
  // A tag on a hue the brand keeps off either theme's grounds is never handed out by a name's hash (an avatar's
  // tint): a person cannot choose their name, so a tint the brand bars anywhere is left out of the draw everywhere.
  const barredHues = [...avoid('light'), ...avoid('dark')].map((c) => safeHue(toOklch(c).h));
  const avoidTags = Array.from({ length: SERIES_COUNT }, (_, i) => i + 1)
    .filter((n) => [light, dark].some((t) => barredHues.some((h) => hueGap(h, safeHue(toOklch(t.values[`series-${n}`]).h)) < 25)))
    .map((n) => `tag-${n}`);

  const usage = { ...USAGE, ...Object.assign({}, ...STATUS_FAMILIES.map(statusUsage)) };
  const roleTokens = PRODUCT_ROLES.map((role) => ({
    name: role,
    value: {
      light: role === 'chart-track' ? '{surface-sunken}' : light.values[role],
      dark: role === 'chart-track' ? '{surface-sunken}' : dark.values[role],
    },
    usage: usage[role] ?? (/^series-/.test(role) ? 'A chart series, in fixed order. 3:1 on a card.' : /^tag-/.test(role) ? 'A quiet category fill on the matching series hue, for places an outline does not fit (a calendar block, a board card). The Tag component itself is outlined, with the series colour as its dot, so it never looks like a status badge.' : ''),
    contrast: contrastFor(role, { railDecided }),
  }));

  // Shadows: tinted with the brand's ink in light, where a black shadow over a
  // coloured palette reads as dirt; plain and deeper in dark, where hairlines do
  // most of the separating.
  const ink = oklchToHex(gamutMapOklch({ L: 0.22, C: Math.min(0.04, base.C), h: safeHue(base.h) }));
  const a = (alpha) => withAlpha(ink, alpha);
  const k = (alpha) => withAlpha('#000000', alpha);
  const checkedShape = checkShape(shape);
  const floating = checkedShape.shell?.form === 'floating';
  const shadow = [
    ['shadow-xs', `0 1px 2px ${a(0.06)}`, `0 1px 2px ${k(0.4)}`, 'Small raised controls.'],
    ['shadow-sm', `0 1px 2px ${a(0.04)}, 0 2px 6px ${a(0.06)}`, `0 1px 3px ${k(0.5)}`, 'Cards on the canvas, and tooltips. None inside a pane.'],
    ['shadow-md', `0 1px 3px ${a(0.05)}, 0 8px 24px ${a(0.08)}`, `0 8px 24px ${k(0.5)}`, 'Menus and toggletips.'],
    ['shadow-lg', `0 4px 12px ${a(0.08)}, 0 16px 40px ${a(0.14)}`, `0 16px 40px ${k(0.65)}`, 'Popovers, toasts and a card being dragged.'],
    ['shadow-xl', `0 24px 64px ${a(0.2)}`, `0 24px 64px ${k(0.7)}`, 'Dialogs and sheets: one per screen at most.'],
  ].map(([n, l, d, u]) => ({ name: n, value: { light: l, dark: d }, usage: u }));

  const fonts = system.type?.fonts ?? {};
  const families = {
    display: [fonts.display, fonts.display ? displayFallback(fonts.display) : FALLBACK.display].filter(Boolean).map((f, i) => (i === 0 && fonts.display ? quote(f) : f)).join(', '),
    sans: [fonts.body, FALLBACK.sans].filter(Boolean).map((f, i) => (i === 0 && fonts.body ? quote(f) : f)).join(', '),
    mono: [fonts.mono, FALLBACK.mono].filter(Boolean).map((f, i) => (i === 0 && fonts.mono ? quote(f) : f)).join(', '),
  };

  const notes = [...light.notes, ...dark.notes];
  const moving = productMotion(motion);

  const tokens = {
    name,
    version: PRODUCT_TOKENS_VERSION,
    meta: {
      builtBy: 'brandi product',
      source,
      roles: Object.fromEntries(Object.entries(roles).filter(([, val]) => val)),
      avoidTags,
      notes,
    },
    color: {
      note: 'brand-* tokens are the brand book\'s exact values. Everything else is a product role built on them; use roles in interface code, never brand-* directly.',
      themes: [{ id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark' }],
      tokens: [...primitives, ...roleTokens],
    },
    type: {
      fonts: checkFonts(fontFiles),
      families,
      groups: typeGroups({ displayForTitles, displayCase }),
    },
    spacing: {
      note: '4px base, aligned with Tailwind, so p-5 in code is space-5 in a design. Use the steps; never invent a gap.',
      tokens: [[0.5, 2], [1, 4], [1.5, 6], [2, 8], [3, 12], [4, 16], [5, 20], [6, 24], [8, 32], [10, 40], [12, 48], [16, 64]]
        .map(([n, px]) => ({ name: `space-${n}`, value: `${px}px` })),
    },
    radius: {
      note: 'From the brand\'s measured shapes, renamed for the jobs a product gives them: each token says where it came from (source) or how the kit derived it (derived).',
      tokens: productRadii(system, shape),
      shell: checkedShape.shell,
      moves: checkedShape.moves ?? [],
    },
    // A floating rail lifts off the page as a small raised control does; one that meets the window edge casts nothing.
    shadow: { note: 'Ink-tinted and quiet in light; deeper and plain in dark.', tokens: [...shadow, { name: 'shadow-rail', value: floating ? { ...shadow.find((t) => t.name === 'shadow-xs').value } : { light: '0 0 #0000', dark: '0 0 #0000' }, usage: 'The rail: lifted when it floats, none when it meets the window edge (transparent, as a shadow list cannot hold none).' }] },
    size: {
      note: 'Controls grow on touch screens: 40, 44 and 48, and nothing pressable is under 40px there.',
      tokens: [
        ['control-sm', '32px', 'Compact buttons, inputs and chips in toolbars and tables. 40px on touch.'],
        ['control-md', '36px', 'The default control. 44px on touch.'],
        ['control-lg', '44px', 'Sign-in and the ask bar. 48px on touch.'],
        ['row-compact', '40px', 'Operations tables people scan all day.'],
        ['row', '48px', 'The default table row.'],
        ['rail-width', '240px', 'The full rail.'],
        ['rail-collapsed', '72px', 'The rail as icons, from 1024 to 1279px.'],
        ['shell-inset', floating ? '8px' : '0px', 'How far the rail and the drawer sit in from the window edge: 8px when the rail floats, none when it meets the edge.'],
        ['rail-outline', floating ? '1px' : '0px', 'The line round a floating rail. A rail that meets the edge keeps only the line on its inner side.'],
        ['header-height', '64px', 'The workspace header.'],
        ['icon-sm', '14px', 'Chips and meta lines.'],
        ['icon-md', '16px', 'Buttons, inputs, menus and tables.'],
        ['icon-lg', '20px', 'Empty states and the rail.'],
        ['content-max', '1200px', 'Reading and settings pages cap here. Tables and boards go full width.'],
        ['measure', '30em', 'Prose cap, about 70 characters. Never cap prose in ch. Check it against the real face with the detector\'s line-length rule.'],
        ['focus-width', '2px', 'The focus outline.'],
        ['focus-offset', '2px', 'The gap between a control and its focus outline.'],
      ].map(([n, val, u]) => ({ name: n, value: val, usage: u })),
    },
    zIndex: {
      note: 'Stacking order.',
      tokens: [['z-sticky', 10], ['z-rail', 20], ['z-dropdown', 40], ['z-sheet', 50], ['z-dialog', 60], ['z-popover', 65], ['z-toast', 70], ['z-tooltip', 80]]
        .map(([n, val]) => ({ name: n, value: String(val) })),
    },
    duration: {
      note: 'Short and calm. Reduced motion keeps fades and drops movement; spinners slow down rather than stop. Each token says where it came from: the brand\'s motion signature (source) or the kit (derived).',
      tokens: moving.duration,
    },
    easing: {
      note: 'One curve for nearly everything: the brand\'s own where its motion signature names one.',
      tokens: moving.easing,
    },
    breakpoint: {
      note: 'The shell measures its own width with container queries, so an artboard behaves like a browser window of the same size.',
      tokens: [
        ['bp-phone', '640px', 'Below: one column, tables become lists, the primary action moves to a bar at the foot.'],
        ['bp-tablet', '1024px', 'Below: the rail becomes a drawer behind a top bar; detail panes become sheets.'],
        ['bp-desktop', '1280px', 'Below: the rail collapses to icons.'],
        ['bp-wide', '1536px', 'Wide screens.'],
      ].map(([n, val, u]) => ({ name: n, value: val, usage: u })),
    },
    opacity: {
      note: '',
      tokens: [{ name: 'opacity-disabled', value: '0.5', usage: 'Never the only sign: a disabled control also says why nearby.' }],
    },
  };

  // Directions: the system again with each direction's roles over the decided ones, keeping only the variables that
  // move. They sit in meta, which the Design System page does not read, and tokens.css draws each as a class. A
  // board that set raw values on its root failed the drift check, and one rewritten through color-mix lost the
  // solved values.
  const checked = checkDirections(directions ?? [], brandHex);
  if (checked.length) {
    tokens.meta.directions = checked.map((d) => {
      const merged = { ...roles };
      for (const [role, v] of Object.entries(d.roles)) {
        if (v === null) delete merged[role];
        else merged[role] = { ...roles[role], ...v };
      }
      const solved = buildProductTokens(system, { name, brandColours: brandColoursIn, roles: merged, displayForTitles, displayCase, charts, source, fonts: fontFiles, shape });
      // Kept in both themes when it moves in either: a value left out of the dark rule would let the light one show at night.
      const seen = (t, m, set) => resolveColour(set, t.name, m).toLowerCase();
      const moved = solved.color.tokens.filter((t) => ['light', 'dark'].some((m) => seen(t, m, solved) !== seen(t, m, tokens)));
      const marks = ['light', 'dark'].map((m) => [railMarks(solved, m), railMarks(tokens, m)]);
      const marksMove = marks.some(([a, b]) => JSON.stringify(a) !== JSON.stringify(b));
      const values = (m, i) => ({
        ...Object.fromEntries(moved.map((t) => [t.name, t.value[m]])),
        ...(marksMove ? Object.fromEntries(marks[i][0]) : {}),
      });
      return { ...d, light: values('light', 0), dark: values('dark', 1) };
    });
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Auditing
// ---------------------------------------------------------------------------

/**
 * Resolve a colour token (or an `alias@ground` composite) to an opaque or
 * translucent hex for one theme.
 */
export function resolveColour(tokens, ref, theme) {
  const byName = new Map(tokens.color.tokens.map((t) => [t.name, t]));
  const seen = new Set();
  const walk = (r) => {
    if (r.includes('@')) {
      const [wash, ground] = r.split('@');
      return composite(walk(wash), walk(ground));
    }
    if (seen.has(r)) throw new Error(`alias loop at ${r}`);
    seen.add(r);
    const t = byName.get(r);
    if (!t) throw new Error(`unknown colour token: ${r}`);
    const val = typeof t.value === 'string' ? t.value : (t.value[theme] ?? t.value.light);
    const alias = /^\{(.+)\}$/.exec(val);
    return alias ? walk(alias[1]) : val;
  };
  return walk(ref);
}

/**
 * Measure every declared pair in every theme, then the checks a pair list
 * cannot express: a highlight that looks like a warning, a brand colour that
 * looks like a status, success and danger under colour-vision deficiency, and
 * chart neighbours that collapse into each other.
 */
/**
 * The token set a board with a direction's class draws: the direction's values over the system's, and the rail's pairs
 * declared when the direction decides a rail the system leaves quiet.
 */
function drawnWith(tokens, d) {
  // A direction that names the rail null draws it undecided, so it is held to the undecided rail's pairs: held to the
  // decided rail's, a quiet rail's hover and selected failed their steps on the surface, and a run typed hexes again.
  const railDecided = d.roles?.rail === null ? false : Boolean(tokens.meta?.roles?.rail || d.roles?.rail);
  const tokensOut = tokens.color.tokens.map((t) => {
    const value = ['light', 'dark'].some((m) => t.name in (d[m] ?? {})) ? { ...t.value, ...Object.fromEntries(['light', 'dark'].filter((m) => t.name in d[m]).map((m) => [m, d[m][t.name]])) } : t.value;
    return { ...t, value, contrast: PRODUCT_ROLES.includes(t.name) ? contrastFor(t.name, { railDecided }) : t.contrast };
  });
  return { ...tokens, color: { ...tokens.color, tokens: tokensOut } };
}

/** Every declared pair in one theme, each a row; `direction` names the direction the rows were measured for. */
function measurePairs(tokens, theme, direction = null) {
  const rows = [];
  const named = direction ? { direction } : {};
  for (const t of tokens.color.tokens) {
    for (const c of t.contrast ?? []) {
      for (const on of c.on) {
        // A pair that names a role the file does not define (a shipped product's tokens can) is a
        // failure to report, not a reason to stop measuring every other pair.
        let fg;
        let bg;
        try {
          fg = resolveColour(tokens, t.name, theme);
          bg = resolveColour(tokens, on, theme);
        } catch (e) {
          rows.push({ theme, ...named, fg: t.name, bg: on, ratio: null, min: c.min, kind: c.kind, ok: false, problem: e.message });
          continue;
        }
        if (isTranslucent(fg)) fg = composite(fg, bg);
        const ratio = contrastRatio(fg, bg);
        rows.push({ theme, ...named, fg: t.name, bg: on, ratio: Math.round(ratio * 100) / 100, min: c.min, kind: c.kind, ok: ratio >= c.min });
      }
    }
  }
  return rows;
}

export function auditProductTokens(tokens) {
  const themes = (tokens.color.themes ?? [{ id: 'light' }, { id: 'dark' }]).map((t) => t.id ?? t);
  const rows = [];
  const warnings = [];
  for (const theme of themes) {
    rows.push(...measurePairs(tokens, theme));
    // Each direction's pairs too, under its name: a concept board in front of the person is held to the same floors.
    for (const d of tokens.meta?.directions ?? []) rows.push(...measurePairs(drawnWith(tokens, d), theme, d.name));
    const has = (n) => tokens.color.tokens.some((t) => t.name === n);
    const at = (n) => resolveColour(tokens, n, theme);
    if (has('highlight') && has('warning-solid')) {
      const d = cvdSafePair(at('highlight'), at('warning-solid')).results.normal.distance;
      if (d < 0.09) warnings.push({ theme, area: 'highlight', message: `The highlight (${at('highlight')}) and warning (${at('warning-solid')}) look alike, so "needs you" and "heads up" will blur. Move one of them round the hue circle.` });
    }
    if (has('primary') && has('danger-solid')) {
      const d = cvdSafePair(at('primary'), at('danger-solid')).results.normal.distance;
      if (d < 0.09) warnings.push({ theme, area: 'status', message: 'The primary action and danger are nearly the same colour, so a destructive button will not stand out. Lean on the label and the confirmation.' });
    }
    if (has('success-solid') && has('danger-solid') && !cvdSafePair(at('success-solid'), at('danger-solid')).safe) {
      warnings.push({ theme, area: 'colour-vision', message: 'Success and danger are hard to tell apart with a red-green colour vision deficiency. Expected for these hues: never carry a status in colour alone.' });
    }
    for (let i = 1; i < SERIES_COUNT; i += 1) {
      const p = `series-${i}`;
      const q = `series-${i + 1}`;
      if (has(p) && has(q) && !cvdSafePair(at(p), at(q)).safe) {
        warnings.push({ theme, area: 'charts', message: `${p} and ${q} are hard to tell apart under a colour-vision deficiency. Label lines directly, or reorder the series.` });
      }
    }
  }
  const fails = rows.filter((r) => !r.ok);
  return {
    ok: fails.length === 0,
    colourTokens: tokens.color.tokens.length,
    pairs: rows.length,
    fails,
    warnings,
    notes: tokens.meta?.notes ?? [],
    rows,
  };
}

/** One line, in the form the gates print. */
export const auditSummary = (audit) => `colour tokens ${audit.colourTokens} | pairs checked ${audit.pairs} | fails ${audit.fails.length}`;

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const cssName = (n) => `--${n.replace(/\./g, '\\.')}`;
const cssValue = (v) => {
  const alias = /^\{(.+)\}$/.exec(String(v));
  return alias ? `var(--${alias[1]})` : v;
};

/**
 * tokens.css: the variables in both themes, the static ones, and a class per
 * type style. This is what a design system page, a canvas and the component
 * previews load. The starter gets its own globals.css from the same tokens.
 */
export function toProductCss(tokens) {
  const lines = [`/* ${tokens.name}, generated from tokens.json by brandi product. Change the tokens, then regenerate. */`];
  for (const f of tokens.type?.fonts ?? []) {
    // The format follows the file: an OTF declared as woff2 is skipped by a strict browser.
    const format = { woff2: 'woff2', woff: 'woff', otf: 'opentype', ttf: 'truetype' }[String(f.file).split('.').pop().toLowerCase()] ?? 'woff2';
    lines.push(`@font-face { font-family: "${f.family}"; src: url("${f.file}") format("${format}"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }`);
  }
  const block = (selector, theme) => {
    const out = [`${selector} {`];
    for (const t of tokens.color.tokens) out.push(`  ${cssName(t.name)}: ${cssValue(typeof t.value === 'string' ? t.value : t.value[theme])};`);
    for (const t of tokens.shadow?.tokens ?? []) out.push(`  ${cssName(t.name)}: ${t.value[theme]};`);
    for (const [n, v] of railMarks(tokens, theme)) out.push(`  ${cssName(n)}: ${v};`);
    out.push('}');
    return out.join('\n');
  };
  lines.push(block(':root, [data-theme="light"]', 'light'));
  lines.push(block('[data-theme="dark"]', 'dark'));
  // A direction's class, on the element just inside Root that holds a board: only the variables it moves, in the
  // theme around it. The dark rule outranks the light one wherever the board is dark.
  for (const d of tokens.meta?.directions ?? []) {
    const rule = (selector, values) => [`${selector} {`, ...Object.entries(values).map(([n, v]) => `  ${cssName(n)}: ${cssValue(v)};`), '}'].join('\n');
    if (!Object.keys(d.light ?? {}).length && !Object.keys(d.dark ?? {}).length) continue;
    const c = `.${d.class}`;
    lines.push(`/* Direction ${d.name}${d.note ? `: ${d.note}` : ''} */`.replace(/\*\/(?!$)/g, '* /'));
    lines.push(rule(c, d.light));
    lines.push(rule(`.dark ${c}, [data-theme="dark"] ${c}, ${c}.dark, ${c}[data-theme="dark"]`, d.dark));
  }
  const statics = ['spacing', 'radius', 'size', 'zIndex', 'duration', 'easing', 'breakpoint', 'opacity'];
  const out = [':root {'];
  for (const fam of statics) for (const t of tokens[fam]?.tokens ?? []) out.push(`  ${cssName(t.name)}: ${t.value};`);
  out.push(`  --font-display: ${tokens.type.families.display};`);
  out.push(`  --font-sans: ${tokens.type.families.sans};`);
  out.push(`  --font-mono: ${tokens.type.families.mono};`);
  out.push('}');
  lines.push(out.join('\n'));
  for (const g of tokens.type?.groups ?? []) {
    for (const s of g.styles) {
      const fam = s.family ?? g.family;
      const decl = [
        `font-family: var(--font-${fam})`,
        `font-size: ${s.fontSize}`,
        `line-height: ${s.lineHeight}`,
        `font-weight: ${s.fontWeight ?? 400}`,
        s.letterSpacing ? `letter-spacing: ${s.letterSpacing}` : null,
        s.name === 'eyebrow' ? 'text-transform: uppercase' : null,
        s.name.startsWith('kpi') ? 'font-variant-numeric: tabular-nums' : null,
        fam === 'display' ? 'font-synthesis: none' : null,
      ].filter(Boolean);
      lines.push(`.${s.name} { ${decl.join('; ')}; }`);
    }
  }
  // The brand's texture on a layer behind the words, multiplied over the element's own colour, never as its
  // background image: the detector reads past a background image to the page behind it. Its file sits beside
  // tokens.css, in textures/, wherever tokens.css is installed.
  const texture = textureMove(tokens);
  if (texture) {
    lines.push('.brand-texture { position: relative; isolation: isolate; }');
    lines.push(`.brand-texture::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none; background: url("${texture.file}") center / cover no-repeat; mix-blend-mode: multiply; opacity: ${texture.strength}; }`);
  }
  return lines.join('\n') + '\n';
}

export default {
  buildProductTokens, auditProductTokens, auditSummary, toProductCss, resolveColour, checkShape, shapeKitDefaults, textureMove, SHAPE_FAMILIES,
  solveForContrast, composite, mix, shiftL, withAlpha, pickText, isTranslucent,
  PRODUCT_ROLES, STATUS_FAMILIES, SERIES_COUNT, FLOORS, PRODUCT_TOKENS_VERSION,
};
