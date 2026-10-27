/**
 * Brandi product layer: every output a component's one definition feeds.
 *
 * Each component in the kit has a definition beside it (components/system/<name>.def.mjs): its job,
 * props, behaviour rules, examples and scripted checks. From that one file this writes the README
 * the Design System shows, the preview board the canvas and the gates render, and the preview page
 * the Design System's card viewer runs. They cannot disagree, because nothing else feeds them, and
 * the build stops on an em dash or a definition missing what a card needs.
 */

import { readdir, readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { artboard } from './canvas.mjs';
import { googleFontsUrl } from './artboards.mjs';

const GENERIC = /^(ui-[a-z-]+|system-ui|-apple-system|serif|sans-serif|monospace|Georgia|"Times New Roman"|Arial|"Segoe UI"|Menlo|Consolas|"SF Mono")$/i;

/**
 * The Google Fonts stylesheet for the faces a tokens file names and ships no file for. A canvas board
 * may load Google Fonts in its helmet and nothing else from the network, so a hosted face reaches the
 * board this way; a face the system ships as a file comes through tokens.css instead.
 */
export function hostedFontsUrl(tokens) {
  const shipped = new Set((tokens.type?.fonts ?? []).map((f) => f.family));
  const faces = Object.values(tokens.type?.families ?? {})
    .map((stack) => String(stack).split(',')[0].trim())
    .filter((f) => f && !GENERIC.test(f))
    .map((f) => f.replace(/^["']|["']$/g, ''))
    .filter((f) => !shipped.has(f));
  return faces.length ? googleFontsUrl(faces, { weights: [400, 500, 600, 700] }) : null;
}

export const NOTE_ORDER = ['Behaviour', 'Layout', 'States', 'Copy', 'Rules', 'Review', 'Accepted', 'Open'];
export const GROUPS = [
  'Foundations', 'Brand', 'Actions', 'Inputs', 'Forms', 'Status', 'Data', 'Charts', 'Feedback',
  'Overlays', 'Navigation', 'The assistant',
];

const EM_DASH = /—/;

/** Load every definition in a components folder, sorted by name. */
export async function loadDefinitions(dir) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.def.mjs')).sort();
  const defs = [];
  for (const f of files) {
    const mod = await import(`${pathToFileURL(path.join(dir, f)).href}?t=${Date.now()}`);
    defs.push({ ...mod.default, file: f });
  }
  return defs.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * What a definition must carry before any output is written from it. Returns problems as
 * sentences; an empty list means the definition is complete.
 */
export function checkDefinition(def) {
  const problems = [];
  const where = def.file ?? def.name ?? 'a definition';
  if (!/^[A-Z][A-Za-z0-9]*$/.test(def.name ?? '')) problems.push(`${where}: name must be the component's export, in PascalCase`);
  if (!GROUPS.includes(def.group)) problems.push(`${where}: group must be one of ${GROUPS.join(', ')}`);
  if (!def.job || !/[.]$/.test(def.job.trim())) problems.push(`${where}: job must be one sentence, ending in a full stop`);
  if (!['proven', 'to build'].includes(def.status)) problems.push(`${where}: status is "proven" or "to build"`);
  if (!Array.isArray(def.props)) problems.push(`${where}: props must be a list (empty when it takes none)`);
  for (const p of def.props ?? []) {
    if (!p.name || !p.type || !p.doc) problems.push(`${where}: prop ${p.name ?? '?'} needs a name, a type and a doc line`);
  }
  if (!Array.isArray(def.examples) || !def.examples.length) problems.push(`${where}: at least one example, so the preview shows something`);
  const ids = new Set();
  for (const ex of def.examples ?? []) {
    if (!/^[a-z][a-z0-9-]*$/.test(ex.id ?? '')) problems.push(`${where}: example ids are lower-case words with hyphens`);
    if (ids.has(ex.id)) problems.push(`${where}: example id ${ex.id} is used twice`);
    ids.add(ex.id);
    if (!ex.title || !ex.markup) problems.push(`${where}: example ${ex.id} needs a title and markup`);
    if (/component-from-global-scope="(?!NS\.)/.test(ex.markup ?? '')) problems.push(`${where}: example ${ex.id} must mount through NS.<Export>, which becomes the system's namespace`);
  }
  for (const c of def.checks ?? []) {
    if (!c.name || typeof c.run !== 'function') problems.push(`${where}: check ${c.name ?? '?'} needs a name and a run function`);
    if (c.example && !ids.has(c.example)) problems.push(`${where}: check "${c.name}" names example ${c.example}, which does not exist`);
  }
  const text = JSON.stringify({ ...def, checks: (def.checks ?? []).map((c) => c.name) });
  if (EM_DASH.test(text)) problems.push(`${where}: an em dash; use a comma, a full stop or brackets`);
  return problems;
}

const mdCell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** The README the Design System shows for one component. Its first sentence is the summary. */
export function componentReadme(def, system) {
  const ns = system.global;
  const lines = [`# ${def.name}`, '', def.job.trim(), ''];
  if (def.status === 'to build') {
    lines.push('*To build, not yet proven: no review round has checked it.*', '');
  }
  if (def.summary) lines.push(def.summary.trim(), '');
  lines.push('## Props', '');
  if (def.props.length) {
    lines.push('| Prop | Type | Default | What it does |', '| --- | --- | --- | --- |');
    for (const p of def.props) lines.push(`| \`${p.name}\` | \`${mdCell(p.type)}\` | ${p.default ? `\`${mdCell(p.default)}\`` : ''} | ${mdCell(p.doc)} |`);
  } else {
    lines.push('None.');
  }
  lines.push('');
  for (const t of def.tables ?? []) {
    lines.push(`## ${t.title}`, '', `| ${t.head.map(mdCell).join(' | ')} |`, `| ${t.head.map(() => '---').join(' | ')} |`);
    for (const row of t.rows) lines.push(`| ${row.map(mdCell).join(' | ')} |`);
    lines.push('');
  }
  for (const key of NOTE_ORDER) {
    const items = def.notes?.[key];
    if (!items?.length) continue;
    lines.push(`## ${key}`, '');
    for (const item of items) lines.push(`- ${item}`);
    lines.push('');
  }
  const first = def.examples[0];
  lines.push('## On a canvas', '', `Mount it inside \`${ns}.Root\`, which carries the theme:`, '', '```html', resolveNs(first.markup, ns).trim(), '```', '');
  if (def.checks?.length) {
    lines.push('## Scripted checks', '');
    for (const c of def.checks) lines.push(`- ${c.name}`);
    lines.push('');
  }
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

export const resolveNs = (markup, ns) => String(markup).replace(/(["'])NS\./g, `$1${ns}.`);

// A preview is a document of its own: one main landmark and one h1, so a page-level accessibility scan
// reads it as a page. The h1 is visually hidden: the board's frame and the card already name it.
const hiddenHeading = (name) => `<h1 style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;">${name}</h1>`;

const LAYOUTS = {
  row: 'display: flex; flex-wrap: wrap; gap: 12px; align-items: center;',
  stack: 'display: flex; flex-direction: column; gap: 12px; align-items: flex-start;',
  block: 'display: block;',
};

/**
 * The preview board: every example of one component on one board, inside Root, with a dark tweak.
 * Gates and checks render it light and dark through ?props={"dark":true}; each example sits in a
 * section a check can scope to with [data-example="<id>"].
 */
export function previewBoard(def, system) {
  const ns = system.global;
  const width = def.frame?.width ?? 960;
  const sections = def.examples.map((ex) => [
    `<section data-example="${ex.id}" style="display: flex; flex-direction: column; gap: 12px; ${ex.width ? `width: ${ex.width}px;` : ''}">`,
    `<h2 style="margin: 0; font-family: var(--font-sans); font-size: 13px; line-height: 18px; font-weight: 600; color: var(--text-muted);">${ex.title}</h2>`,
    `<div style="${LAYOUTS[ex.layout ?? 'row'] ?? LAYOUTS.row}">`,
    resolveNs(ex.markup, ns).trim(),
    '</div>',
    '</section>',
  ].join('\n'));
  const body = [
    `<x-import component-from-global-scope="${ns}.Root" theme="{{theme}}">`,
    `<main style="box-sizing: border-box; width: ${width}px; padding: 24px; display: flex; flex-direction: column; gap: 28px; background: var(--canvas); color: var(--text); font-family: var(--font-sans);">`,
    hiddenHeading(def.name),
    ...sections,
    '</main>',
    '</x-import>',
  ].join('\n');
  const vals = Object.assign({}, ...def.examples.map((ex) => ex.vals ?? {}));
  const logic = [
    `state = ${JSON.stringify(def.state ?? {})};`,
    'renderVals() {',
    `  return Object.assign(${JSON.stringify(vals)}, { theme: this.props.dark ? "dark" : "light" }${def.logic ? `, (() => { const self = this; return { ${def.logic} }; })()` : ''});`,
    '}',
  ].join('\n');
  return artboard({
    name: `${def.name}Preview`,
    title: `${def.name}`,
    lang: system.lang ?? 'en',
    system: system.namespace,
    ...(system.fontsUrl ? { fonts: system.fontsUrl } : {}),
    body,
    props: { dark: { editor: 'boolean', default: false } },
    preview: { width, height: def.frame?.height ?? 600 },
    logic,
  });
}

const SHIM_SOURCE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'runtime', 'dc-shim.js');

/** The card height the Design System gives a preview: its examples stacked, with their titles. */
export function cardHeight(def) {
  if (def.card?.height) return def.card.height;
  return Math.min(1200, 48 + def.examples.reduce((h, ex, i) => h + (i ? 28 : 0) + 30 + (ex.height ?? 56), 0));
}

/**
 * A component's preview.html for the Design System's card viewer. The page preloads tokens.css,
 * the fonts, bundle.css, React 18 and the bundle; this adds the examples as board markup and the
 * runtime shim inline, so nothing else has to be found by path. Root gets no theme here: the
 * viewer's own theme switch decides light or dark.
 */
export function previewPage(def, system) {
  const ns = system.global;
  const sections = def.examples.map((ex) => [
    `<section data-example="${ex.id}" style="display: flex; flex-direction: column; gap: 12px;">`,
    `<h2 style="margin: 0; font-family: var(--font-sans); font-size: 13px; line-height: 18px; font-weight: 600; color: var(--text-muted);">${ex.title}</h2>`,
    `<div style="${LAYOUTS[ex.layout ?? 'row'] ?? LAYOUTS.row}">`,
    resolveNs(ex.markup, ns).trim(),
    '</div>',
    '</section>',
  ].join('\n')).join('\n');
  const vals = Object.assign({}, ...def.examples.map((ex) => ex.vals ?? {}));
  const shim = readFileSync(SHIM_SOURCE, 'utf8').replace(/<\/script/gi, '<\\/script');
  return [
    `<!-- @dsCard group="${def.group}" height=${cardHeight(def)} -->`,
    '<!doctype html>',
    `<html lang="${system.lang ?? 'en'}">`,
    '<head>',
    '<meta charset="utf-8">',
    `<title>${def.name}</title>`,
    '</head>',
    '<body style="margin: 0;">',
    '<x-dc>',
    `<x-import component-from-global-scope="${ns}.Root" background="none">`,
    '<main style="box-sizing: border-box; padding: 24px; display: flex; flex-direction: column; gap: 28px; color: var(--text); font-family: var(--font-sans);">',
    hiddenHeading(def.name),
    sections,
    '</main>',
    '</x-import>',
    '</x-dc>',
    `<script type="text/x-dc" data-dc-script>\nclass Component extends DCLogic {\n  state = ${JSON.stringify(def.state ?? {})};\n  renderVals() {\n    return Object.assign(${JSON.stringify(vals)}${def.logic ? `, (() => { const self = this; return { ${def.logic} }; })()` : ''});\n  }\n}\n</script>`,
    `<script>\n${shim}\n</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

const tsDoc = (text, indent) => (text ? `${indent}/** ${String(text).replace(/\*\//g, '* /')} */\n` : '');

/**
 * components/index.d.ts for the Design System: the namespace's every export with its props, as
 * types that document. Written from the definitions (the same source as the cards), and compiled
 * under strict TypeScript at bundle time. `icons` is the vocabulary's names; a definition's own
 * shared types go in its `types` list.
 */
export function typesFile(defs, system, { icons = [], numberStyles = [] } = {}) {
  const ns = system.global;
  const lines = [
    `// ${system.name} components ${system.version}: types as docs, generated from each component's definition by brandi product bundle.`,
    `// Mount on a canvas with component-from-global-scope="${ns}.<Export>", inside ${ns}.Root. React 18 comes from the page.`,
    'import type { ComponentType, ReactNode } from "react"',
    '',
    `declare namespace ${ns} {`,
    `  type IconName = ${icons.length ? icons.map((n) => JSON.stringify(n)).join(' | ') : 'string'}`,
    `  type NumberStyle = ${numberStyles.length ? numberStyles.map((n) => JSON.stringify(n)).join(' | ') : 'string'}`,
    '  const ICON_NAMES: readonly IconName[]',
    '  const NUMBER_STYLES: readonly NumberStyle[]',
    '  function formatNumber(value: number | string | null | undefined, style?: NumberStyle, options?: { locale?: string; currency?: string; digits?: number }): string',
    '  /** Wraps every board: the theme, the providers, and the theme copied to the page for portals. */',
    '  const Root: ComponentType<{ theme?: "light" | "dark"; background?: "canvas" | "surface" | "none"; shortcuts?: boolean; children?: ReactNode }>',
  ];
  for (const def of defs) {
    for (const t of def.types ?? []) lines.push(`  ${t}`);
    lines.push('', tsDoc(def.job, '  ').trimEnd(), `  interface ${def.name}Props {`);
    for (const p of def.props) lines.push(`${tsDoc(`${p.doc}${p.default ? ` Default ${p.default}.` : ''}`, '    ')}    ${p.name}${p.required ? '' : '?'}: ${p.type}`);
    if (!def.props.some((p) => p.name === 'children')) lines.push('    children?: ReactNode');
    if (!def.props.some((p) => p.name === 'className')) lines.push('    className?: string');
    lines.push('  }', `  const ${def.name}: ComponentType<${def.name}Props>`);
  }
  lines.push('}', '', 'declare global {', `  interface Window { ${ns}: typeof ${ns} }`, '}', '', 'export {}', '');
  return lines.filter((l, i, all) => !(l === '' && all[i - 1] === '')).join('\n');
}

export default { loadDefinitions, checkDefinition, componentReadme, previewBoard, previewPage, typesFile, cardHeight, resolveNs, hostedFontsUrl, NOTE_ORDER, GROUPS };
