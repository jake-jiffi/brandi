/**
 * Brandi product layer: the starter's globals.css.
 *
 * The production starter (Next.js, Tailwind CSS 4, shadcn/ui) takes its every
 * value from the system's tokens.json, through this one generator. The skill
 * runs it, and the starter ships a copy as tools/build-globals.mjs, so the
 * system and every product built on it regenerate the same file the same way
 * and cannot drift. Nobody hand-edits a value in globals.css: the next
 * regeneration silently undoes it.
 *
 * What it writes, in order:
 *   1. Tailwind, animations and shadcn's variants
 *   2. The tokens: light, dark, and the ones that never change
 *   3. shadcn's variables, pointed at the tokens
 *   4. A Tailwind theme where only the system's colours, radii, shadows and
 *      fonts exist (`--color-*: initial` removes Tailwind's palette, so
 *      `bg-blue-500` silently does nothing rather than going off-brand)
 *   5. Type styles as type-* utilities
 *   6. Base styles, including the focus outline and reduced motion
 *   7. Forced colours (Windows High Contrast)
 *
 * It runs on its own too, which is how a product regenerates the file and how
 * CI checks it has not drifted:
 *
 *   node tools/build-globals.mjs path/to/tokens.json app/globals.css
 *   node tools/build-globals.mjs path/to/tokens.json app/globals.css --check
 *
 * --check writes nothing and exits 1 when the file on disk differs from what
 * the tokens produce. Node built-ins only, so the file can be copied into any
 * product as it is.
 */

import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** shadcn's variable names, and the product role each one points at. */
export const SHADCN = Object.freeze([
  ['background', 'canvas'], ['foreground', 'text'],
  ['card', 'surface'], ['card-foreground', 'text'],
  ['popover', 'surface-raised'], ['popover-foreground', 'text'],
  ['primary-foreground', 'on-primary'],
  ['secondary', 'surface-sunken'], ['secondary-foreground', 'text-strong'],
  ['muted', 'surface-sunken'], ['muted-foreground', 'text-muted'],
  ['accent', 'surface-sunken'], ['accent-foreground', 'text-strong'],
  ['destructive', 'danger-solid'], ['destructive-foreground', 'on-danger'],
  ['border', 'line'], ['input', 'line-control'], ['ring', 'focus'],
  ['chart-1', 'series-1'], ['chart-2', 'series-2'], ['chart-3', 'series-3'],
  ['chart-4', 'series-4'], ['chart-5', 'series-5'], ['chart-6', 'series-6'],
  ['sidebar', 'rail'], ['sidebar-foreground', 'rail-text'],
  ['sidebar-primary', 'brand'], ['sidebar-primary-foreground', 'on-brand'],
  ['sidebar-accent', 'rail-selected'], ['sidebar-accent-foreground', 'rail-text-strong'],
  ['sidebar-border', 'rail-line'], ['sidebar-ring', 'rail-focus'],
]);

const STATIC_FAMILIES = ['spacing', 'radius', 'size', 'zIndex', 'duration', 'easing', 'opacity'];

/**
 * A brand value: the brand book's exact colour, which interface code never uses directly. Tokens
 * mark them; an older file without the mark is read by name, sparing brand-hover, which is a role.
 */
const BRAND_PREFIXED_ROLES = new Set(['brand-hover']);
const isBrandValue = (t) => t.brand === true || (t.brand === undefined && t.name.startsWith('brand-') && !BRAND_PREFIXED_ROLES.has(t.name));

/** Families that are a system or generic fallback, never the brand's own face. */
const GENERIC_FAMILY = /^(ui-[a-z-]+|system-ui|-apple-system|serif|sans-serif|monospace|Georgia|"Times New Roman"|Arial|"Segoe UI"|Menlo|Consolas|"SF Mono")$/i;

/**
 * The --font-* line for one role. When the stack starts with the brand's face,
 * next/font's variable stands in for it and the rest stay as fallbacks. The face
 * itself is the variable's own fallback: where next/font has not run (a canvas
 * board, a component preview) an undefined variable would void the whole stack
 * and the browser would fall back to its default serif. When the brand has no
 * face for the role, the stack is used as it is: dropping its first entry would
 * throw away a real fallback.
 */
function fontLine(role, variable, stack, fallback) {
  const parts = String(stack ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return `  --font-${role}: ${fallback};`;
  if (GENERIC_FAMILY.test(parts[0])) return `  --font-${role}: ${parts.join(', ')};`;
  return `  --font-${role}: var(${variable}, ${parts[0]}), ${parts.slice(1).join(', ') || fallback};`;
}

const cssVal = (v) => {
  const alias = /^\{(.+)\}$/.exec(String(v));
  return alias ? `var(--${alias[1]})` : v;
};
const block = (pairs) => pairs.map(([n, v]) => `  --${n}: ${cssVal(v)};`).join('\n');
const escapeName = (n) => n.replace(/\./g, '\\.');

function styleUtility(s, fam) {
  const lines = [
    `  font-family: --theme(--font-${fam});`,
    `  font-size: ${s.fontSize};`,
    `  line-height: ${s.lineHeight};`,
    `  font-weight: ${s.fontWeight ?? 400};`,
  ];
  if (s.letterSpacing != null) lines.push(`  letter-spacing: ${s.letterSpacing};`);
  if (s.name === 'eyebrow') lines.push('  text-transform: uppercase;');
  if (s.name.startsWith('kpi')) lines.push('  font-variant-numeric: tabular-nums;');
  if (fam === 'display') lines.push('  font-synthesis: none;');
  return `@utility type-${s.name} {\n${lines.join('\n')}\n}`;
}

/**
 * Render globals.css from a product tokens object.
 *
 * @param {object} tokens  product tokens (the shape `brandi product tokens` writes)
 * @param {{shadcn?: string[][]}} opts  override the shadcn mapping only for a
 *   system whose role names differ from the product layer's
 */
export function toStarterGlobals(tokens, { shadcn = SHADCN } = {}) {
  const colours = tokens.color.tokens;
  const names = new Set(colours.map((t) => t.name));
  const missing = shadcn.filter(([, role]) => !names.has(role)).map(([, role]) => role);
  if (missing.length) throw new Error(`globals.css needs these roles, which the tokens do not have: ${[...new Set(missing)].join(', ')}`);

  const light = [];
  const dark = [];
  for (const t of colours) {
    if (typeof t.value === 'string') {
      light.push([t.name, t.value]);
      continue;
    }
    const l = t.value.light;
    const d = t.value.dark ?? l;
    light.push([t.name, l]);
    // Re-declare in dark when the value differs, or when it is an alias: an
    // alias has to resolve inside the dark scope, or it picks up the light value.
    if (d !== l || /^\{/.test(String(l))) dark.push([t.name, d]);
  }
  const shadows = tokens.shadow?.tokens ?? [];
  const statics = STATIC_FAMILIES.flatMap((fam) => (tokens[fam]?.tokens ?? []).map((t) => [escapeName(t.name), t.value]));
  const styles = (tokens.type?.groups ?? []).flatMap((g) => g.styles.map((s) => [s, s.family ?? g.family]));
  const fam = tokens.type?.families ?? {};

  return `/*
 * ${tokens.name}: globals.css for Next.js, Tailwind CSS 4 and shadcn/ui.
 * Generated from the design system's tokens.json by tools/build-globals.mjs. Change the tokens there, then regenerate.
 * 1. Tailwind, animations and shadcn's variants
 * 2. Tokens: light, dark, and the ones that never change
 * 3. shadcn/ui variables, pointed at the tokens
 * 4. Tailwind theme: only the system's colours, radii, shadows and fonts exist
 * 5. Type styles as type-* utilities
 * 6. Base styles
 * 7. Windows High Contrast (forced colours)
 */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

/* Dark mode follows a .dark class (next-themes) or data-theme="dark", like the design system. */
@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));

/* 2. Tokens ----------------------------------------------------------------- */
:root,
[data-theme="light"] {
  color-scheme: light;
${block(light)}
${block(shadows.map((t) => [t.name, t.value.light]))}
}

.dark,
[data-theme="dark"] {
  color-scheme: dark;
${block(dark)}
${block(shadows.map((t) => [t.name, t.value.dark]))}
}

:root {
${block(statics)}
}

/* 3. shadcn/ui variables. Declared on every theme scope so a nested .dark region resolves its own values. */
:root,
.dark,
[data-theme="light"],
[data-theme="dark"] {
  --radius: var(--radius-md);
${block(shadcn.map(([a, b]) => [a, `{${b}}`]))}
}

/* 4. Tailwind theme -------------------------------------------------------- */
@theme inline {
  /* Only role tokens become utilities. Brand values stay CSS variables, so nobody writes text-brand-primary. */
  --color-*: initial;
  --color-transparent: transparent;
  --color-current: currentColor;
${colours.filter((t) => !isBrandValue(t)).map((t) => `  --color-${t.name}: var(--${t.name});`).join('\n')}
${shadcn.filter(([a]) => !names.has(a)).map(([a]) => `  --color-${a}: var(--${a});`).join('\n')}

  --radius-*: initial;
${(tokens.radius?.tokens ?? []).filter((t) => t.name !== 'radius-pill').map((t) => `  --${t.name}: var(--${t.name});`).join('\n')}
  /* Kept so components added later still have corners. Check them against the corner rules. */
  --radius-2xl: var(--radius-xl);
  --radius-3xl: var(--radius-xl);
  --radius-4xl: 9999px;

  --shadow-*: initial;
${shadows.filter((t) => t.name.startsWith('shadow-')).map((t) => `  --shadow-${t.name.slice(7)}: var(--${t.name});`).join('\n')}

  /* next/font sets --font-brand-sans, --font-brand-display and --font-brand-mono in app/fonts.ts. */
${fontLine('sans', '--font-brand-sans', fam.sans, 'ui-sans-serif, system-ui, sans-serif')}
${fontLine('heading', '--font-brand-sans', fam.sans, 'ui-sans-serif, system-ui, sans-serif')}
${fontLine('display', '--font-brand-display', fam.display, 'Georgia, serif')}
${fontLine('mono', '--font-brand-mono', fam.mono, 'ui-monospace, monospace')}

  /* max-w-measure caps prose at about 70 characters. Not max-w-prose: a ch is the width of a zero. */
  --container-measure: var(--measure);
  /* max-w-content: reading and settings pages cap here (content-max) */
  --container-content: var(--content-max);

  --ease-standard: var(--ease-standard);
  --ease-exit: var(--ease-exit);
  /* Breakpoints stay Tailwind's: sm 640 (bp-phone), lg 1024 (bp-tablet), xl 1280 (bp-desktop), 2xl 1536 (bp-wide). */
}

/* 5. Type styles: use these instead of combining text-sm, font-* and leading-*. */
${styles.map(([s, f]) => styleUtility(s, f)).join('\n')}

/* Loading states: under a second, people see nothing; after that the skeleton fades in. */
@utility appear-late {
  animation: appear-late 150ms var(--ease-standard) 800ms both;
}
@keyframes appear-late {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 6. Base ----------------------------------------------------------------- */
@layer base {
  * {
    @apply border-border;
    /* The resting outline colour is the focus colour where the element sits, so a ring that fades in
       with transition-colors starts in its own colour: --ring is computed at the root, and on a rail
       with its own focus colour the ring flashed the page's colour first. */
    outline-color: var(--focus);
  }
  html {
    @apply font-sans;
    font-synthesis: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body {
    @apply bg-background text-foreground type-body;
  }
  /* No word left alone on the last line of a paragraph, and no heading broken into one long line and one
     short one. A component that sets its own wrap keeps it. */
  p, li, dd, dt, figcaption, blockquote, label {
    text-wrap: pretty;
  }
  h1, h2, h3, h4, h5, h6 {
    text-wrap: balance;
  }
  /* The focus ring is an outline with an offset: it follows the radius and survives forced colours,
     where a box-shadow ring disappears. An ancestor that clips its overflow clips it like any ring,
     so inside a scroll container inset it with a negative offset. */
  :focus-visible {
    outline: var(--focus-width) solid var(--focus);
    outline-offset: var(--focus-offset);
  }
  ::selection {
    background: var(--highlight);
    color: var(--on-highlight);
  }
  /* Tailwind 4 leaves buttons on the default cursor. Anything you can press shows the hand. */
  button:not(:disabled), [role="button"]:not([aria-disabled="true"]), [role="tab"], [role="switch"], [role="checkbox"], [role="menuitem"], [role="option"], summary, label[for] {
    cursor: pointer;
  }
  :disabled, [aria-disabled="true"] {
    cursor: not-allowed;
  }
  [aria-busy="true"] {
    cursor: progress;
  }
  /* Reduced motion keeps the state change (fades) and drops the movement: tw-animate-css slides and zooms through these variables. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      --tw-enter-translate-x: 0 !important;
      --tw-enter-translate-y: 0 !important;
      --tw-enter-scale: 1 !important;
      --tw-enter-rotate: 0 !important;
      --tw-exit-translate-x: 0 !important;
      --tw-exit-translate-y: 0 !important;
      --tw-exit-scale: 1 !important;
      --tw-exit-rotate: 0 !important;
      scroll-behavior: auto !important;
    }
    .animate-pulse, [data-slot="skeleton"] {
      animation: none !important;
    }
    /* A spinner that stopped would look like a hang, so it slows right down instead. */
    .animate-spin {
      animation-duration: 2.4s !important;
    }
    [data-slot="button"]:active {
      translate: none !important;
    }
  }
}

/* 7. Windows High Contrast ------------------------------------------------- */
/* Forced colours remove background tints, so the states that were only a tint become outlines and system colours.
   Unlayered on purpose: it wins over every utility, whatever a component sets. */
@media (forced-colors: active) {
  :focus-visible {
    outline: 2px solid CanvasText;
    outline-offset: 2px;
  }
  /* the current or chosen thing: the page in the rail, the open tab, a selected row, the menu or list option in hand */
  [data-slot="sidebar-menu-button"][data-active="true"],
  [data-slot="tabs-trigger"][data-state="active"],
  [data-slot="table-row"][data-state="selected"],
  [data-slot="filter-chip"][aria-pressed="true"],
  [data-slot="section-nav-link"][aria-current="true"],
  [data-slot="dropdown-menu-item"]:focus,
  [data-slot="dropdown-menu-checkbox-item"]:focus,
  [data-slot="dropdown-menu-radio-item"]:focus,
  [data-slot="dropdown-menu-sub-trigger"]:focus,
  [data-slot="select-item"]:focus,
  [data-slot="command-item"][data-selected="true"] {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  /* focus on something that is also current: a double line, so both still read */
  [data-slot="sidebar-menu-button"][data-active="true"]:focus-visible,
  [data-slot="tabs-trigger"][data-state="active"]:focus-visible,
  [data-slot="filter-chip"][aria-pressed="true"]:focus-visible,
  [data-slot="section-nav-link"][aria-current="true"]:focus-visible {
    outline: 3px double CanvasText;
    outline-offset: 1px;
  }
  /* line tabs scroll sideways, which would clip an outline drawn outside them */
  [data-slot="tabs-list"][data-variant="line"] [data-slot="tabs-trigger"]:focus-visible {
    outline-offset: -3px;
  }
  [data-slot="tabs-trigger"][data-state="active"]::after,
  [data-slot="progress-indicator"] {
    forced-color-adjust: none;
    background: Highlight;
  }
  [data-slot="progress"] {
    border: 1px solid CanvasText;
  }
  [data-slot="switch"] {
    border-color: ButtonText;
  }
  [data-slot="switch-thumb"] {
    forced-color-adjust: none;
    background: ButtonText;
  }
  [data-slot="switch"][data-state="checked"] {
    forced-color-adjust: none;
    background: Highlight;
    border-color: Highlight;
  }
  [data-slot="switch"][data-state="checked"] [data-slot="switch-thumb"] {
    background: HighlightText;
  }
  /* "needs you" counts and badges keep their meaning as a marked area */
  .bg-highlight {
    forced-color-adjust: none;
    background: Mark;
    color: MarkText;
  }
  [data-slot="badge-dot"] {
    forced-color-adjust: none;
    background: CanvasText;
  }
}
`;
}

/**
 * The command line, for when this file runs as tools/build-globals.mjs.
 * Returns the exit code rather than calling process.exit, so it can be tested.
 */
export function runCli(argv) {
  const [tokensPath, outPath, ...rest] = argv;
  if (!tokensPath || !outPath) {
    console.error('usage: node build-globals.mjs <tokens.json> <globals.css> [--check]');
    return 2;
  }
  const css = toStarterGlobals(JSON.parse(readFileSync(resolve(tokensPath), 'utf8')));
  if (rest.includes('--check')) {
    const current = existsSync(resolve(outPath)) ? readFileSync(resolve(outPath), 'utf8') : '';
    if (current === css) return 0;
    console.error(`${outPath} has drifted from ${tokensPath}. Regenerate it; never edit token values in it by hand.`);
    return 1;
  }
  writeFileSync(resolve(outPath), css);
  console.log(`wrote ${outPath}`);
  return 0;
}

// Node reports this module by its real path, so the path it was run by is
// resolved the same way: run from a symlinked folder (macOS's /var is one),
// a plain comparison never matches and the tool silently does nothing.
const runPath = process.argv[1] && existsSync(process.argv[1]) ? realpathSync(process.argv[1]) : null;
if (runPath && import.meta.url === pathToFileURL(runPath).href) {
  process.exitCode = runCli(process.argv.slice(2));
}

export default { toStarterGlobals, runCli, SHADCN };
