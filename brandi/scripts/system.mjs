/**
 * Brandi design-system builder.
 *
 * Takes the handful of decisions a brand actually makes (a primary colour, a
 * couple of accents, a type pairing, a ratio, a shape stance, a motion stance)
 * and resolves them into a complete system: every ramp, every semantic role,
 * every spacing step, with the accessibility work already done.
 *
 * The architecture is Nathan Curtis's three tiers, and the tiers are not
 * decorative:
 *
 *   Tier 1  primitives   raw values named for what they ARE (brand.9, space.4).
 *                        Identical in every theme. Nothing consumes them directly.
 *   Tier 2  semantic     named for what they DO (surface.page, text.primary).
 *                        This is the ONLY tier that changes between light and
 *                        dark. Components consume these.
 *   Tier 3  component    scoped overrides. Promote to tier 2 only when three or
 *                        more components need the same thing.
 *
 * https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676
 */

import {
  toOklch, oklchToHex, gamutMapOklch, tonalRamp, neutralRamp, harmonise,
  contrastRatio, apcaContrast, bestTextOn, cvdSafePair, accessibleSolid, formatOklch,
  toCmyk, dataVizPalette,
} from './color.mjs';
import { typeScale, measure, FLOORS, RATIOS } from './type.mjs';
import { BANNED_FONTS } from './canvas.mjs';

// ---------------------------------------------------------------------------
// Status colours
// ---------------------------------------------------------------------------

/**
 * Status hues are close to fixed, because "red means stop" is learned, not
 * designed, and a brand does not get to reassign it. What IS brand-controlled
 * is how saturated they are: a muted brand gets muted status colours, so a
 * validation error does not look like it came from a different product.
 */
export const STATUS_HUES = Object.freeze({
  danger: 27,
  warning: 78,
  success: 148,
  info: 245,
});

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

/** Radius stances. A brand picks one; the ramp follows from it. */
export const SHAPE_STANCES = Object.freeze({
  sharp: { base: 0, note: 'No radius anywhere. Reads as precise, editorial, technical.' },
  crisp: { base: 2, note: 'Barely there. Softens screens without looking soft.' },
  soft: { base: 6, note: 'The quiet default for product UI.' },
  rounded: { base: 10, note: 'Friendly, consumer, approachable.' },
  pill: { base: 16, note: 'Playful. Controls become capsules. Commit or it looks accidental.' },
});

const RADIUS_STEPS = [
  { name: 'none', factor: 0 },
  { name: 'xs', factor: 0.5 },
  { name: 'sm', factor: 0.75 },
  { name: 'md', factor: 1 },
  { name: 'lg', factor: 1.5 },
  { name: 'xl', factor: 2.25 },
  { name: '2xl', factor: 3.5 },
];

/**
 * The concentric radii rule: a rounded box nested inside another rounded box
 * looks wrong unless the inner radius is the outer radius minus the gap between
 * them. Equal radii make the inner corner look too round.
 */
export function concentricRadius(outerRadius, padding) {
  return Math.max(0, Number((outerRadius - padding).toFixed(2)));
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export const MOTION_STANCES = Object.freeze({
  still: { scale: 0, note: 'Almost nothing moves. State changes are instant.' },
  restrained: { scale: 0.75, note: 'Short, functional transitions. Nothing announces itself.' },
  fluid: { scale: 1, note: 'The default. Motion explains what changed.' },
  lively: { scale: 1.35, note: 'Motion is part of the personality. Needs choreography, not confetti.' },
});

const DURATIONS = [
  { name: 'instant', ms: 0, use: 'Anything that must feel like a direct manipulation' },
  { name: 'fast', ms: 120, use: 'Hover, focus, small state changes' },
  { name: 'base', ms: 200, use: 'The default. Dropdowns, tooltips, toggles' },
  { name: 'slow', ms: 320, use: 'Panels, drawers, anything crossing the screen' },
  { name: 'slower', ms: 480, use: 'Page and route transitions. Rarely anything else' },
];

/**
 * Named weights, tied to what `googleFontsUrl` requests, so the two cannot
 * drift into a system that documents a weight it never downloads.
 */
export const WEIGHTS = Object.freeze([
  { name: 'regular', value: 400, use: 'Body text, and everything that is not asking for attention' },
  { name: 'medium', value: 500, use: 'UI labels, buttons, table headers: emphasis without shouting' },
  { name: 'bold', value: 700, use: 'Display type and the one word in a sentence that carries it' },
]);

const EASINGS = {
  standard: { value: 'cubic-bezier(0.2, 0, 0, 1)', use: 'Movement within the screen' },
  enter: { value: 'cubic-bezier(0, 0, 0, 1)', use: 'Something arriving. Decelerates into place' },
  exit: { value: 'cubic-bezier(0.3, 0, 1, 1)', use: 'Something leaving. Accelerates away' },
  emphasis: { value: 'cubic-bezier(0.3, 0, 0, 1.2)', use: 'A single overshoot. One per screen at most' },
};

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

/**
 * Spacing tokens are named by their pixel value, not by an index. `space-16`
 * needs no mental arithmetic and survives a change of base unit; `space-4`
 * meaning 16px does not. The scale is deliberately non-linear at the top: the
 * difference between 4 and 8 matters, the difference between 192 and 196 does not.
 */
const SPACE_SCALES = {
  4: [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256],
  8: [0, 4, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256],
};

// ---------------------------------------------------------------------------

const round = (n, dp = 4) => Number(n.toFixed(dp));

function buildRamps(seedHex, { name }) {
  return {
    name,
    seed: seedHex,
    light: tonalRamp(seedHex, { mode: 'light', name }),
    dark: tonalRamp(seedHex, { mode: 'dark', name }),
  };
}

function statusSeed(hue, chroma, lightness) {
  return oklchToHex(gamutMapOklch({ L: lightness, C: chroma, h: hue }));
}

/**
 * Resolve a complete design system.
 *
 * @param {object} input
 * @param {string} input.primary          the brand colour, hex. Required.
 * @param {string[]} [input.accents]      explicit accent hexes, or omit to derive.
 * @param {string} [input.harmony]        harmony scheme used when deriving accents.
 * @param {number} [input.accentCount]    how many accents to derive. 0, 1 or 2.
 * @param {string} [input.neutralHue]     hex whose hue tints the greys. Defaults to primary.
 * @param {number} [input.neutralChroma]  how much the greys are tinted. 0 = pure grey.
 * @param {object} [input.type]           passed to typeScale, plus font families.
 * @param {string} [input.shape]          a SHAPE_STANCES key.
 * @param {string} [input.motion]         a MOTION_STANCES key.
 * @param {number} [input.spaceBase]      spacing unit in px. 4 or 8.
 */
export function buildSystem(input = {}) {
  const {
    primary,
    accents,
    harmony = 'analogous',
    accentCount = 1,
    neutralHue,
    neutralChroma = 0.006,
    type = {},
    shape = 'soft',
    motion = 'fluid',
    spaceBase = 4,
    measureChars = 66,
    print: printInput = null,
    dataViz: dataVizInput = null,
  } = input;

  if (!primary) throw new TypeError('buildSystem needs a primary colour');
  if (!SHAPE_STANCES[shape]) throw new TypeError(`unknown shape stance: ${shape}`);
  if (!MOTION_STANCES[motion]) throw new TypeError(`unknown motion stance: ${motion}`);
  if (spaceBase !== 4 && spaceBase !== 8) {
    throw new RangeError('spaceBase must be 4 or 8; anything else fights every UI kit ever built');
  }
  if (accentCount < 0 || accentCount > 2) {
    throw new RangeError('accentCount must be 0, 1 or 2. A third accent stops being an accent');
  }

  const base = gamutMapOklch(toOklch(primary));
  const primaryHex = oklchToHex(base);

  // --- Colour ------------------------------------------------------------
  const derivedAccents = accents?.length
    ? accents.map((hex) => oklchToHex(gamutMapOklch(toOklch(hex))))
    : harmonise(primaryHex, harmony, { count: accentCount }).map((a) => a.hex).slice(0, accentCount);

  const palettes = {
    brand: buildRamps(primaryHex, { name: 'brand' }),
    neutral: (() => {
      const light = neutralRamp(neutralHue ?? primaryHex, { mode: 'light', chroma: neutralChroma });
      return {
        name: 'neutral',
        seed: light.steps[8].hex,
        light,
        dark: neutralRamp(neutralHue ?? primaryHex, { mode: 'dark', chroma: neutralChroma }),
      };
    })(),
  };
  derivedAccents.forEach((hex, i) => {
    palettes[`accent${i + 1}`] = buildRamps(hex, { name: `accent${i + 1}` });
  });

  // Status colours borrow the brand's saturation level so a warning does not
  // look like it escaped from a different product, but keep their learned hues.
  const statusChroma = Math.min(Math.max(base.C, 0.09), 0.19);
  const status = {};
  for (const [name, hue] of Object.entries(STATUS_HUES)) {
    const seed = statusSeed(hue, statusChroma, name === 'warning' ? 0.78 : 0.58);
    status[name] = buildRamps(seed, { name });
  }

  // --- Type --------------------------------------------------------------
  const scale = typeScale({
    basePx: type.basePx ?? 16,
    baseMaxPx: type.baseMaxPx ?? null,
    ratio: type.ratio ?? 'major-third',
    ratioMax: type.ratioMax ?? null,
    minVw: type.minVw ?? 390,
    maxVw: type.maxVw ?? 1280,
  });

  const fonts = {
    display: type.display ?? null,
    body: type.body ?? null,
    mono: type.mono ?? null,
    ...(type.fonts ?? {}),
  };

  // --- Space -------------------------------------------------------------
  const space = SPACE_SCALES[spaceBase].map((px) => ({
    name: String(px),
    px,
    rem: round(px / 16, 4),
    onGrid: px === 0 || px % spaceBase === 0,
  }));

  // --- Shape -------------------------------------------------------------
  const radiusBase = SHAPE_STANCES[shape].base;
  const radius = RADIUS_STEPS.map(({ name, factor }) => ({
    name,
    px: round(radiusBase * factor, 2),
  }));
  radius.push({ name: 'full', px: 9999 });

  // --- Elevation ---------------------------------------------------------
  // Shadows are tinted with the brand hue at very low chroma. Pure black
  // shadows over a coloured surface read as dirt rather than depth.
  const shadowHue = base.h;
  const shadowRgb = (alpha) => {
    const c = toOklch(oklchToHex(gamutMapOklch({ L: 0.22, C: Math.min(0.04, base.C), h: shadowHue })));
    const hex = oklchToHex(c);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r} ${g} ${b} / ${alpha})`;
  };
  const elevation = [
    { name: 'none', value: 'none', use: 'Flat. The default for most things' },
    { name: 'sm', value: `0 1px 2px ${shadowRgb(0.06)}, 0 1px 1px ${shadowRgb(0.04)}`, use: 'A card that is merely not the page' },
    { name: 'md', value: `0 2px 4px ${shadowRgb(0.06)}, 0 4px 12px ${shadowRgb(0.08)}`, use: 'Menus, popovers' },
    { name: 'lg', value: `0 4px 8px ${shadowRgb(0.06)}, 0 12px 32px ${shadowRgb(0.1)}`, use: 'Dialogs' },
    { name: 'xl', value: `0 8px 16px ${shadowRgb(0.08)}, 0 24px 64px ${shadowRgb(0.12)}`, use: 'One per screen, at most' },
  ];

  // --- Motion ------------------------------------------------------------
  const motionScale = MOTION_STANCES[motion].scale;
  const durations = DURATIONS.map((d) => ({ ...d, ms: Math.round(d.ms * motionScale) }));

  // --- Layout ------------------------------------------------------------
  // Breakpoints belong to the content, not to a list of devices: the right one
  // is wherever this layout breaks, which you find by dragging the window. What
  // a system can honestly ship is a starting set plus the two numbers that are
  // actually derived from it. Without any, a developer gets a 1440 artboard, a
  // 390 artboard and no rule connecting them, and invents the rest.
  //
  // `contentMaxPx` is the measure the system already resolved, in pixels, plus
  // a gutter each side: the widest a single text column should ever be. `xl` is
  // where the fluid type scale stops growing, so the layout stops with it
  // instead of drifting past a ceiling the type has already reached.
  const gutterPx = spaceBase * 6;
  const contentMaxPx = Math.round(scale.measurePx ?? measure(measureChars, { fontSizePx: scale.basePx }).approxPx) + gutterPx * 2;
  const breakpoints = [
    { name: 'sm', px: 480, use: 'Above a large phone. Two columns of small controls become possible.' },
    { name: 'md', px: 768, use: 'Tablet portrait. A single column can become two.' },
    { name: 'lg', px: 1024, use: 'Laptop. Sidebars and three-column grids hold.' },
    { name: 'xl', px: scale.viewports.maxVw, use: 'Where the fluid type stops growing, so the layout stops with it.' },
  ];

  // --- Colour off the screen ---------------------------------------------
  // A brand that meets a printer, a signwriter or an embroiderer needs numbers
  // that are not hex. CMYK is computed and marked uncalibrated; Pantone, RAL,
  // vinyl and thread are never computed, because each is a decision made
  // against a physical guide under controlled light, and a guessed Pantone is
  // worse than an absent one: it gets ordered.
  // Step 9, the colour itself, NOT solidStrong.
  //
  // solidStrong is the variant adjusted so a label on it stays readable, which
  // is a screen problem. A printer wants the brand colour, and showing them the
  // adjusted one beside a Pantone that was matched against the real one is how
  // an ink gets ordered wrong. The two differ by a visible amount on exactly
  // the mid-lightness colours most likely to be a brand's accent.
  const printRoles = [
    ['brand.solid', palettes.brand.light.steps[8].hex],
    ...Object.entries(palettes).filter(([n]) => n !== 'brand' && n !== 'neutral')
      .map(([n, p2]) => [`${n}.solid`, p2.light.steps[8].hex]),
    ['neutral.paper', palettes.neutral.light.steps[0].hex],
    ['neutral.ink', palettes.neutral.light.steps[11].hex],
  ].filter(([, hex]) => hex);

  const recordedPrint = new Map((printInput?.swatches ?? []).map((sw) => [sw.role, sw]));
  const print = {
    profile: printInput?.profile ?? null,
    // Said in the book, every time, next to the numbers.
    caveat: 'CMYK here is an uncalibrated device conversion, which is a starting point and not a match. Confirm against a printed proof on the actual stock before anything is ordered.',
    swatches: printRoles.map(([role, hex]) => {
      const recorded = recordedPrint.get(role) ?? {};
      const p2 = toCmyk(hex);
      const cmyk = recorded.cmyk ?? [p2.c, p2.m, p2.y, p2.k];
      return {
        role,
        hex,
        cmyk,
        cmykString: `${Math.round(cmyk[0])}/${Math.round(cmyk[1])}/${Math.round(cmyk[2])}/${Math.round(cmyk[3])}`,
        computed: !recorded.cmyk,
        pantoneCoated: recorded.pantoneCoated ?? null,
        pantoneUncoated: recorded.pantoneUncoated ?? null,
        ral: recorded.ral ?? null,
        vinyl: recorded.vinyl ?? null,
        thread: recorded.thread ?? null,
        verified: recorded.verified === true,
        note: recorded.note ?? null,
      };
    }),
  };

  const dataViz = {
    categorical: dataVizInput?.categorical?.length
      ? dataVizInput.categorical
      : dataVizPalette(palettes.brand.light.steps[8].hex, { count: 6 }),
    // Sorted by lightness rather than by step number. The ramp deliberately
    // breaks monotonicity at 8 to 9, which is right for a UI scale and wrong
    // for a chart: a sequential scale that goes dark, light, dark reads as
    // three categories rather than one gradient.
    sequential: dataVizInput?.sequential?.length
      ? dataVizInput.sequential
      : palettes.brand.light.steps
        .slice()
        .sort((a, b) => toOklch(b.hex).L - toOklch(a.hex).L)
        .filter((_, i) => i % 2 === 0)
        .slice(0, 6)
        .map((st) => st.hex),
    note: 'A brand palette is built for hierarchy and a chart palette is built for discrimination. Categorical colours here are checked to stay apart under protanopia, deuteranopia and tritanopia, which the brand ramps are not.',
  };

  // --- Semantic mapping (tier 2) -----------------------------------------
  const semantic = buildSemantic({ palettes, status, mode: 'light' });
  const semanticDark = buildSemantic({ palettes, status, mode: 'dark' });

  const system = {
    meta: {
      builtBy: 'brandi',
      spaceBase,
      shape,
      shapeNote: SHAPE_STANCES[shape].note,
      motion,
      motionNote: MOTION_STANCES[motion].note,
      harmony: accents?.length ? 'explicit' : harmony,
    },
    palettes,
    status,
    print,
    dataViz,
    type: {
      fonts,
      scale,
      // The ladder the system actually loads.
      //
      // It was missing entirely: five token formats carried sizes, line heights
      // and letter spacing, and nothing said what weight a heading is. The
      // sheets meanwhile set 600 inline while requesting 400/500/700 from
      // Google Fonts, so the one weight the components used was the one weight
      // that was never fetched, and the browser synthesised it.
      //
      // Three steps, not six, because a face has to be loaded to be used and
      // every extra weight is a download. If a brand needs a semibold, load it
      // and add it here rather than writing 600 and hoping.
      weights: WEIGHTS,
      measure: measure(measureChars, { fontSizePx: scale.basePx }),
      floors: FLOORS,
    },
    space,
    radius,
    elevation,
    layout: {
      breakpoints,
      contentMaxPx,
      gutterPx,
      note: 'Breakpoints are a starting set. The real ones are wherever this layout breaks, and you find those by dragging the window rather than by naming devices.',
    },
    motion: { stance: motion, durations, easings: EASINGS },
    // The ring's geometry, so the brand book can state it because it is true
    // rather than because someone typed it. 2px at 2px offset is the smallest
    // ring that stays visible against a busy surface without looking like a
    // border; the offset is what keeps it off the control's own edge.
    focus: { widthPx: 2, offsetPx: 2, note: 'Outline, never a box-shadow: an outline is not clipped by overflow.' },
    semantic: { light: semantic, dark: semanticDark },
  };

  system.audit = auditSystem(system);
  return system;
}

/**
 * The tier-2 layer. Every entry is an alias to a primitive, never a raw value:
 * that is what makes the theme swap a one-line change instead of a rewrite.
 */
function buildSemantic({ palettes, status, mode }) {
  const n = (step) => `{color.neutral.${step}}`;
  const b = (step) => `{color.brand.${step}}`;
  const s = (name, step) => `{color.${name}.${step}}`;
  const brandRamp = palettes.brand[mode];

  // The ring has to clear 3:1 against the surface it actually sits on, which is
  // the NEUTRAL page, not the brand ramp's own step 1. tonalRamp cannot know
  // that: it only ever sees one family. Picking it here, where both ramps are
  // in hand, is what makes the guarantee true rather than nearly true.
  const page = palettes.neutral[mode].steps[0].hex;
  const ringStep = [9, 10, 11, 12].find((step) => contrastRatio(brandRamp.steps[step - 1].hex, page) >= 3)
    ?? 12;

  const map = {
    'surface.page': n(1),
    'surface.subtle': n(2),
    'surface.raised': mode === 'light' ? n(1) : n(2),
    'surface.sunken': n(2),
    'surface.overlay': mode === 'light' ? n(1) : n(3),
    'surface.inverted': n(12),

    'control.bg': n(3),
    'control.bg-hover': n(4),
    'control.bg-active': n(5),

    'border.subtle': n(6),
    'border.default': n(7),
    'border.strong': n(8),

    'text.primary': n(12),
    'text.secondary': n(11),
    'text.disabled': n(8),
    'text.inverted': n(1),
    'text.brand': b(11),
    'text.link': b(11),

    'accent.bg': b(3),
    'accent.bg-hover': b(4),
    'accent.border': b(7),
    'accent.solid': b(9),
    'accent.solid-hover': b(10),
    'accent.text': b(11),

    'focus.ring': `{color.brand.${ringStep}}`,
  };

  for (const name of Object.keys(status)) {
    map[`${name}.bg`] = s(name, 3);
    map[`${name}.border`] = s(name, 7);
    map[`${name}.solid`] = s(name, 9);
    map[`${name}.text`] = s(name, 11);
  }

  // The two values that cannot be aliases, because they are computed from the
  // contrast of the thing they sit on rather than chosen from the ramp.
  map['accent.on-solid'] = brandRamp.onSolid.color;
  map['accent.solid-strong'] = brandRamp.solidStrong.hex;

  return map;
}

/**
 * Resolve a semantic alias like `{color.brand.9}` against the built palettes.
 */
export function resolveToken(value, system, mode = 'light') {
  if (typeof value !== 'string' || !value.startsWith('{')) return value;
  const path = value.slice(1, -1).split('.');
  if (path[0] !== 'color') return value;
  const [, family, step] = path;
  const pal = system.palettes[family] ?? system.status[family];
  if (!pal) return value;
  const ramp = pal[mode];
  const found = ramp?.steps?.[Number(step) - 1];
  return found ? found.hex : value;
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

/**
 * Check the system against the rules it claims to follow, and report honestly.
 * A generator that cannot fail its own checks is not checking anything.
 */
export function auditSystem(system) {
  const findings = [];
  const push = (level, area, message, fix) => findings.push({ level, area, message, fix });

  for (const mode of ['light', 'dark']) {
    const sem = system.semantic[mode];
    const r = (key) => resolveToken(sem[key], system, mode);

    const pairs = [
      ['text.primary', 'surface.page', 4.5, 'body text on the page'],
      ['text.secondary', 'surface.page', 4.5, 'secondary text on the page'],
      ['text.primary', 'surface.raised', 4.5, 'body text on a card'],
      ['text.brand', 'surface.page', 4.5, 'brand-coloured text on the page'],
      ['focus.ring', 'surface.page', 3, 'the focus ring against the page'],
      ['border.strong', 'surface.page', 1.4, 'the strongest border against the page'],
    ];
    for (const [fg, bg, min, what] of pairs) {
      const ratio = contrastRatio(r(fg), r(bg));
      if (ratio < min) {
        // Enough precision that "3.00:1, below the 3:1 it needs" can never be
        // printed. A failure message a reader cannot believe gets ignored.
        const shown = ratio.toFixed(ratio < min && min - ratio < 0.01 ? 4 : 2);
        push('error', `contrast.${mode}`,
          `${what} is ${shown}:1, below the ${min}:1 it needs.`,
          `Darken ${fg} or lighten ${bg} in ${mode} mode.`);
      }
    }

    const onSolid = sem['accent.on-solid'];
    const solid = r('accent.solid');
    const lc = apcaContrast(onSolid, solid);
    if (Math.abs(lc) < 60) {
      push('warn', `contrast.${mode}`,
        `A label on the solid brand colour reaches only Lc ${lc}.`,
        `Use accent.solid-strong (${sem['accent.solid-strong']}) for filled buttons.`);
    }

    // A brand colour sitting on top of a status hue is a real problem, not a
    // theoretical one: a red brand's error states stop reading as errors,
    // because the whole interface is already that colour.
    for (const [name] of Object.entries(system.status)) {
      const statusHex = r(`${name}.solid`);
      const brandHex = r('accent.solid');
      const d = cvdSafePair(statusHex, brandHex).results.normal.distance;
      if (d < 0.09) {
        push('warn', `status.${mode}`,
          `The brand colour and the ${name} colour are nearly the same (${brandHex} and ${statusHex}).`,
          `A ${name} state will read as branding rather than as ${name}. Lean harder on the icon and the wording, and consider a ${name} colour further round the hue circle.`);
      }
    }

    // Success and danger are the pair that collapses for the most common
    // colour vision deficiencies, and they are also the pair that carries the
    // most consequence.
    const cvd = cvdSafePair(r('success.solid'), r('danger.solid'));
    if (!cvd.safe) {
      push('info', `colour-vision.${mode}`,
        'Success and danger are hard to tell apart with a red-green colour vision deficiency.',
        'This is expected for these hues. Never carry success or failure in colour alone: pair every status with an icon and a word.');
    }
  }

  for (const w of system.palettes.brand.light.warnings) push('warn', 'palette.light', w, null);
  for (const w of system.palettes.brand.dark.warnings) push('warn', 'palette.dark', w, null);
  for (const w of system.type.scale.warnings) push('warn', 'type', w, null);

  // A banned face was only ever caught later, when an artboard was validated or
  // real code was checked. By then it is in the brand file and in everyone's
  // head. Catch it where the decision is made.
  for (const [role, family] of Object.entries(system.type.fonts)) {
    if (!family) continue;
    const name = Array.isArray(family) ? family[0] : family;
    const hit = BANNED_FONTS.find((b) => b.toLowerCase() === String(name).trim().toLowerCase());
    if (hit) {
      push('warn', 'type',
        `${hit} is the ${role} face, and it is one of the typefaces that makes work look machine-generated.`,
        `It appears in so much AI-generated design that it now reads as a default rather than a choice. Pick a face with a point of view, or record in the decision log why this one is right for this brand despite that.`);
    }
  }

  if (!system.type.fonts.body || !system.type.fonts.display) {
    push('info', 'type', 'No typefaces chosen yet.', 'Pick a display face and a body face before this system is usable.');
  } else {
    push('info', 'type',
      `The design canvas and the generated sheets can load fonts from Google Fonts and nowhere else.`,
      `Run \`brandi fonts\` to confirm ${[system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono].filter(Boolean).join(', ')} are actually served. A face that is not there renders as the fallback with no warning anywhere.`);
  }

  const errors = findings.filter((f) => f.level === 'error').length;
  return { ok: errors === 0, errors, warnings: findings.filter((f) => f.level === 'warn').length, findings };
}

/**
 * The publish gate.
 *
 * A design system that fails its own audit must not reach a deliverable. This
 * is separate from `auditSystem` so it can be tested against a failing audit,
 * which the ramp generator currently makes unreachable through normal input:
 * defensive code nobody can exercise is defensive code nobody can trust.
 *
 * @param {object} system   a resolved system
 * @param {{force?: boolean}} opts
 * @returns {{ok: boolean, forced: boolean, message: string|null}}
 */
export function assertPublishable(system, { force = false } = {}) {
  const audit = system?.audit;
  if (!audit) {
    return { ok: false, forced: false, message: 'This system was never audited, so nothing about it is known.' };
  }
  if (audit.ok) return { ok: true, forced: false, message: null };
  const errors = (audit.findings ?? []).filter((f) => f.level === 'error');
  const detail = errors.map((x) => `  ${x.area}: ${x.message}${x.fix ? `\n      ${x.fix}` : ''}`).join('\n');
  if (force) {
    return {
      ok: true,
      forced: true,
      message: `Produced anyway, with ${errors.length} audit failure${errors.length === 1 ? '' : 's'} on record:\n${detail}`,
    };
  }
  return {
    ok: false,
    forced: false,
    message:
      'The design system fails its own audit, so it will not be published.\n' + detail +
      '\nFix it, or pass --force to produce the artefact anyway with the failures on record.',
  };
}

export default { buildSystem, auditSystem, assertPublishable, resolveToken, concentricRadius, SHAPE_STANCES, MOTION_STANCES, STATUS_HUES };
