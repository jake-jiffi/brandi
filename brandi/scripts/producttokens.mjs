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

import {
  toOklch, oklchToHex, gamutMapOklch, oklchToOklab, oklabToOklch,
  contrastRatio, cvdSafePair, tonalRamp, dataVizPalette,
} from './color.mjs';

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
 * A hover or pressed state for a filled control. It moves away from the label's
 * lightness, which keeps or gains contrast, unless the fill is already near that
 * end (a near-black fill cannot get visibly darker); then it turns back, and is
 * solved so the label still reads. A state that quietly drops its label below
 * 4.5:1 is the failure this exists to prevent.
 */
export function stateOf(fill, label, amount) {
  const L = toOklch(fill).L;
  const away = toOklch(label).L > L ? -1 : 1;
  const room = away < 0 ? L : 1 - L;
  const dir = room >= amount + 0.04 ? away : -away;
  const hex = shiftL(fill, dir * amount);
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
  'rail', 'rail-text', 'rail-text-strong', 'rail-muted', 'rail-hover', 'rail-selected', 'rail-line', 'rail-focus',
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
function themeValues(system, mode, roles, ai, brandInk) {
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
    let p = solve('primary', seed, [v.surface, v.canvas], FLOORS['non-text']);
    const label = labelOn(p);
    if (label.ratio < FLOORS.text + MARGIN) p = solve('primary', p, [label.hex], FLOORS.text);
    v.primary = p;
  }
  v['on-primary'] = labelOn(v.primary).hex;
  v['primary-hover'] = stateOf(v.primary, v['on-primary'], 0.05);
  v['primary-pressed'] = stateOf(v.primary, v['on-primary'], 0.09);

  // The brand fill: the brand's own colour as a secondary emphasis.
  v.brand = decided('brand') ?? B[8];
  v['on-brand'] = labelOn(v.brand).hex;
  v['brand-hover'] = stateOf(v.brand, v['on-brand'], 0.05);

  // Focus clears 3:1 on every ground it can sit on.
  v.focus = decided('focus') ?? solve('focus', B[8], grounds, FLOORS['non-text']);

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
  const palette = [];
  for (const c of [generated[0], ...accentSeeds, ...generated.slice(1)]) {
    const h = safeHue(toOklch(c).h);
    if (palette.length < SERIES_COUNT && palette.every((p) => hueGap(safeHue(toOklch(p).h), h) >= 25)) palette.push(c);
  }
  for (const c of generated) if (palette.length < SERIES_COUNT && !palette.includes(c)) palette.push(c);
  // Two candidates can solve to one colour; the next candidate takes the slot instead. Last come
  // spares a twelfth of the circle apart, past the colour-vision-safe set: the audit reports any
  // neighbours they leave hard to tell apart, which beats a chart with two series in one colour.
  const baseHue = safeHue(toOklch(seed).h);
  const spares = Array.from({ length: 12 }, (_, k) => oklchToHex(gamutMapOklch({ L: light ? 0.56 : 0.74, C: 0.13, h: (baseHue + 15 + k * 30) % 360 })));
  const candidates = [...new Set([...palette, ...generated, ...spares])];
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
    const step = darkRail ? 1 : -1;
    v['rail-hover'] = shiftL(v.rail, 0.05 * step);
    v['rail-selected'] = shiftL(v.rail, 0.1 * step);
    v['rail-line'] = shiftL(v.rail, 0.07 * step);
    const railGrounds = [v.rail, v['rail-hover'], v['rail-selected']];
    const tint = oklchToHex(gamutMapOklch({ L: darkRail ? 0.93 : 0.25, C: 0.04, h: safeHue(toOklch(B[8]).h) }));
    v['rail-text'] = solve('rail-text', tint, railGrounds, 7);
    v['rail-text-strong'] = labelOn(v.rail).hex;
    v['rail-muted'] = solve('rail-muted', mix(v.rail, v['rail-text'], 0.55), [v.rail, v['rail-hover']], FLOORS.text, 'floor');
    v['rail-focus'] = solve('rail-focus', v.highlight, railGrounds, FLOORS['non-text']);
  } else {
    v.rail = '{surface}';
    v['rail-hover'] = '{hover}';
    v['rail-selected'] = '{selected}';
    v['rail-line'] = '{line}';
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
  const tags = [...Array.from({ length: SERIES_COUNT }, (_, i) => `tag-${i + 1}`), 'tag-grey'];
  switch (name) {
    case 'text-strong': return textOn([...SURFACES, 'highlight-soft']);
    case 'text': return textOn([...SURFACES, 'hover@surface', 'selected', 'selected-strong', ...tags]);
    case 'text-muted': return textOn([...SURFACES, 'hover@surface', 'selected', 'selected-strong']);
    case 'text-subtle': return textOn(SURFACES);
    case 'text-inverse': return textOn(['surface-inverse']);
    case 'link': case 'link-hover': return textOn(['surface', 'surface-subtle', 'canvas']);
    case 'line-control': return nonText(['surface', 'surface-raised', 'surface-sunken', 'canvas', 'hover@surface']);
    case 'primary': return nonText(['surface', 'canvas']);
    case 'on-primary': return textOn(['primary', 'primary-hover', 'primary-pressed']);
    case 'on-brand': return textOn(['brand', 'brand-hover']);
    case 'focus': return nonText(SURFACES);
    case 'on-highlight': return textOn(['highlight']);
    case 'on-danger': return textOn(['danger-solid']);
    case 'chart-compare': return nonText(['surface']);
    default: break;
  }
  if (STATUS_FAMILIES.includes(name)) return textOn(['surface', 'surface-subtle', 'canvas', `${name}-surface`]);
  if (/^series-\d+$/.test(name)) return nonText(['surface', 'surface-subtle']);
  if (railDecided) {
    if (name === 'rail-text' || name === 'rail-text-strong') return textOn(['rail', 'rail-hover', 'rail-selected']);
    if (name === 'rail-muted') return textOn(['rail', 'rail-hover']);
    if (name === 'rail-focus') return nonText(['rail', 'rail-hover', 'rail-selected']);
  }
  return [];
}

/** The type styles a working screen needs, sized for density rather than reading. */
function typeGroups({ displayForTitles }) {
  const display = displayForTitles
    ? { family: 'display', fontWeight: 400 }
    : { family: 'sans', fontWeight: 700 };
  return [
    {
      name: 'Display',
      family: display.family,
      note: displayForTitles
        ? 'The display face in three places only: the page title, a greeting or full-page headline, and the sign-in hero. One display moment per screen.'
        : 'The display face is not used in product screens; titles are the body face, bold.',
      styles: [
        { name: 'hero', fontSize: '48px', lineHeight: '52px', fontWeight: display.fontWeight, letterSpacing: '-0.02em', usage: 'Sign-in and onboarding heroes only.' },
        { name: 'display', fontSize: '36px', lineHeight: '42px', fontWeight: display.fontWeight, letterSpacing: '-0.015em', usage: 'A greeting or a full-page headline.' },
        { name: 'title', fontSize: '26px', lineHeight: '32px', fontWeight: display.fontWeight, letterSpacing: '-0.01em', usage: 'The page title.' },
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
  display: 'Georgia, "Times New Roman", serif',
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};
const quote = (family) => (/\s/.test(family) ? `"${family}"` : family);

/**
 * Radii from the brand's shape stance, renamed for the jobs a product gives them. `action` is the
 * shape of whatever a person can press: the pill by default ("if it is a pill, you can press it"),
 * the control radius when the brand's buttons match its inputs, or a value of its own.
 */
function productRadii(system, { action = 'pill' } = {}) {
  const by = Object.fromEntries((system.radius ?? []).map((r) => [r.name, r.px]));
  const r = (n) => `${Math.round(by[n] ?? 0)}px`;
  return [
    { name: 'radius-xs', value: r('xs'), usage: 'Checkboxes, keyboard keys and tiny marks.' },
    { name: 'radius-sm', value: r('sm'), usage: 'Badges, tags and tooltips.' },
    { name: 'radius-control', value: r('md'), usage: 'Inputs, selects and menu items.' },
    { name: 'radius-md', value: r('lg'), usage: 'Cards, menus and toasts.' },
    { name: 'radius-lg', value: r('xl'), usage: 'Panes, dialogs, sheets and the rail.' },
    { name: 'radius-xl', value: r('2xl'), usage: 'Sign-in and onboarding frames.' },
    { name: 'radius-action', value: action === 'pill' ? '9999px' : action === 'control' ? r('md') : String(action), usage: action === 'pill' ? 'Whatever a person can press: buttons, filter chips, segmented controls and the switch. If it is a pill, you can press it.' : 'Whatever a person can press: buttons, filter chips, segmented controls and the switch. Record the rule in the brand-to-product section.' },
    { name: 'radius-pill', value: '9999px', usage: 'The full round, for avatars, dots and counts. Whatever a person can press takes radius-action.' },
  ];
}

/**
 * Build the product token set from a resolved Brandi system.
 *
 * @param {object} system  the output of buildSystem
 * @param {object} opts
 * @param {string} [opts.name]              the system's name
 * @param {{name: string, hex: string}[]} [opts.brandColours]  the brand book's named colours
 * @param {object} [opts.roles]             decided roles: { primary, brand, highlight, canvas, focus, rail } as { light, dark }
 * @param {boolean} [opts.displayForTitles] whether the display face sets titles (default true)
 * @param {object} [opts.source]            where the brand came from, recorded in meta
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

export function buildProductTokens(system, { name = 'Product system', brandColours: brandColoursIn = null, roles: rolesIn = {}, displayForTitles = true, source = null, fonts: fontFiles = [], shape = {} } = {}) {
  if (!system?.palettes?.brand || !system?.palettes?.neutral) throw new TypeError('buildProductTokens needs a resolved Brandi system');

  // Decided values arrive as people write them: "#fff" as often as "#FFFFFF",
  // and sometimes for one theme only. Expand the short form here so every
  // helper downstream sees six digits, and leave an undecided theme undecided.
  const expand = (hex) => {
    if (hex == null) return undefined;
    if (typeof hex !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) throw new TypeError(`a decided colour must be a hex value like #0F2A4A, not ${JSON.stringify(hex)}`);
    return hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
  };
  const roles = Object.fromEntries(Object.entries(rolesIn ?? {}).filter(([, val]) => val)
    .map(([k, val]) => [k, { light: expand(val.light), dark: expand(val.dark) }]));
  const brandColours = brandColoursIn ? brandColoursIn.map((c) => ({ ...c, hex: expand(c.hex) })) : null;

  // The assistant's family borrows the brand's saturation, like Brandi's status colours do.
  const base = toOklch(hexOf(system.palettes.brand.light.steps[8]));
  const aiSeed = oklchToHex(gamutMapOklch({ L: 0.55, C: Math.min(Math.max(base.C, 0.09), 0.19), h: AI_HUE }));
  const ai = { light: tonalRamp(aiSeed, { mode: 'light', name: 'ai' }), dark: tonalRamp(aiSeed, { mode: 'dark', name: 'ai' }) };

  // The brand's own dark ink, preferred for labels wherever it passes, so a label
  // on a brand fill is the brand's navy rather than a neutral near-black.
  const darkCandidates = [roles.ink?.light, roles.primary?.light, roles.rail?.light, ...(brandColours ?? []).map((c) => c.hex)].filter(Boolean);
  const brandInk = darkCandidates.filter((h) => toOklch(h).L < 0.3).sort((a, b) => toOklch(a).L - toOklch(b).L)[0] ?? null;
  const light = themeValues(system, 'light', roles, ai, brandInk);
  const dark = themeValues(system, 'dark', roles, ai, brandInk);
  const railDecided = Boolean(roles.rail?.light || roles.rail?.dark);

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
  const shadow = [
    ['shadow-xs', `0 1px 2px ${a(0.06)}`, `0 1px 2px ${k(0.4)}`, 'Small raised controls.'],
    ['shadow-sm', `0 1px 2px ${a(0.04)}, 0 2px 6px ${a(0.06)}`, `0 1px 3px ${k(0.5)}`, 'Cards on the canvas. None inside a pane.'],
    ['shadow-md', `0 1px 3px ${a(0.05)}, 0 8px 24px ${a(0.08)}`, `0 8px 24px ${k(0.5)}`, 'The rail, menus and popovers.'],
    ['shadow-lg', `0 4px 12px ${a(0.08)}, 0 16px 40px ${a(0.14)}`, `0 16px 40px ${k(0.65)}`, 'Dialogs and sheets.'],
    ['shadow-xl', `0 24px 64px ${a(0.2)}`, `0 24px 64px ${k(0.7)}`, 'One per screen at most.'],
  ].map(([n, l, d, u]) => ({ name: n, value: { light: l, dark: d }, usage: u }));

  const fonts = system.type?.fonts ?? {};
  const families = {
    display: [fonts.display, FALLBACK.display].filter(Boolean).map((f, i) => (i === 0 && fonts.display ? quote(f) : f)).join(', '),
    sans: [fonts.body, FALLBACK.sans].filter(Boolean).map((f, i) => (i === 0 && fonts.body ? quote(f) : f)).join(', '),
    mono: [fonts.mono, FALLBACK.mono].filter(Boolean).map((f, i) => (i === 0 && fonts.mono ? quote(f) : f)).join(', '),
  };

  const notes = [...light.notes, ...dark.notes];

  return {
    name,
    version: PRODUCT_TOKENS_VERSION,
    meta: {
      builtBy: 'brandi product',
      source,
      roles: Object.fromEntries(Object.entries(roles).filter(([, val]) => val)),
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
      groups: typeGroups({ displayForTitles }),
    },
    spacing: {
      note: '4px base, aligned with Tailwind, so p-5 in code is space-5 in a design. Use the steps; never invent a gap.',
      tokens: [[0.5, 2], [1, 4], [1.5, 6], [2, 8], [3, 12], [4, 16], [5, 20], [6, 24], [8, 32], [10, 40], [12, 48], [16, 64]]
        .map(([n, px]) => ({ name: `space-${n}`, value: `${px}px` })),
    },
    radius: { note: 'From the brand\'s shape stance, renamed for the jobs a product gives them.', tokens: productRadii(system, shape) },
    shadow: { note: 'Ink-tinted and quiet in light; deeper and plain in dark.', tokens: shadow },
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
      note: 'Short and calm. Reduced motion keeps fades and drops movement; spinners slow down rather than stop.',
      tokens: [['duration-fast', '120ms', 'Hover, press, focus.'], ['duration-base', '180ms', 'Menus, tabs and toggles.'], ['duration-slow', '260ms', 'Sheets and dialogs.'], ['duration-scene', '1250ms', 'A character scene, which then stops.']]
        .map(([n, val, u]) => ({ name: n, value: val, usage: u })),
    },
    easing: {
      note: 'One curve for nearly everything.',
      tokens: [['ease-standard', 'cubic-bezier(0.2, 0.8, 0.2, 1)', 'Every transition.'], ['ease-exit', 'cubic-bezier(0.4, 0, 1, 1)', 'Things leaving.']]
        .map(([n, val, u]) => ({ name: n, value: val, usage: u })),
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
export function auditProductTokens(tokens) {
  const themes = (tokens.color.themes ?? [{ id: 'light' }, { id: 'dark' }]).map((t) => t.id ?? t);
  const rows = [];
  const warnings = [];
  for (const theme of themes) {
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
            rows.push({ theme, fg: t.name, bg: on, ratio: null, min: c.min, kind: c.kind, ok: false, problem: e.message });
            continue;
          }
          if (isTranslucent(fg)) fg = composite(fg, bg);
          const ratio = contrastRatio(fg, bg);
          rows.push({ theme, fg: t.name, bg: on, ratio: Math.round(ratio * 100) / 100, min: c.min, kind: c.kind, ok: ratio >= c.min });
        }
      }
    }
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
    lines.push(`@font-face { font-family: "${f.family}"; src: url("${f.file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }`);
  }
  const block = (selector, theme) => {
    const out = [`${selector} {`];
    for (const t of tokens.color.tokens) out.push(`  ${cssName(t.name)}: ${cssValue(typeof t.value === 'string' ? t.value : t.value[theme])};`);
    for (const t of tokens.shadow?.tokens ?? []) out.push(`  ${cssName(t.name)}: ${t.value[theme]};`);
    out.push('}');
    return out.join('\n');
  };
  lines.push(block(':root, [data-theme="light"]', 'light'));
  lines.push(block('[data-theme="dark"]', 'dark'));
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
  return lines.join('\n') + '\n';
}

export default {
  buildProductTokens, auditProductTokens, auditSummary, toProductCss, resolveColour,
  solveForContrast, composite, mix, shiftL, withAlpha, pickText, isTranslucent,
  PRODUCT_ROLES, STATUS_FAMILIES, SERIES_COUNT, FLOORS, PRODUCT_TOKENS_VERSION,
};
