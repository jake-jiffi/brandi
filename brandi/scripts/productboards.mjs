/**
 * Brandi product layer: the canvas boards a system generates for itself.
 *
 * Foundations (colour, type, shape, icons) come from the tokens; one board per component group comes
 * from the definitions' own examples, so the canvas and the cards cannot show different things. Each
 * board gets a dark twin that imports it with the theme flipped, a contents board leads (Main), and
 * canvas.json lays the rows out under title notes. Heights are measured in a real browser, because a
 * frame shorter than its content clips.
 *
 * Generated boards carry a marker and are rewritten on every run. Boards a person authored (screens,
 * states, options) are never touched; they keep their place below the generated rows.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { artboard, canvasManifest } from './canvas.mjs';
import { loadDefinitions, resolveNs, resolveLogicNs, GROUPS } from './productdocs.mjs';
import { auditProductTokens } from './producttokens.mjs';
import { previewArtboard } from './preview.mjs';

export const MARKER = 'generated from the resolved system by brandi product boards';
const W = 1440;
const ROW_GAP_X = 120;
const NOTE_GAP = 300;
const ROW_GAP_Y = 420;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pascal = (s) => String(s).split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('');

const COLOUR_GROUPS = [
  ['Surfaces', /^(canvas|surface|surface-.+|scrim)$/],
  ['Rail', /^rail/],
  ['Text and links', /^(text.*|link.*)$/],
  ['Lines', /^line/],
  ['Actions and selection', /^(primary.*|on-primary|brand(-hover)?|on-brand|hover|pressed|selected.*|focus|highlight.*|on-highlight)$/],
  ['Status', /^(success|warning|danger|info|ai)(-.+)?$|^on-danger$/],
  ['Charts', /^(series-\d|chart-.+)$/],
  ['Tags', /^tag-/],
];

function shell(system, title, body, { props = true } = {}) {
  return [
    `<x-import component-from-global-scope="${system.global}.Root" theme="{{theme}}">`,
    `<main style="box-sizing: border-box; width: ${W}px; padding: 56px; display: flex; flex-direction: column; gap: 40px; background: var(--canvas); color: var(--text); font-family: var(--font-sans);">`,
    // No eyebrow over the heading: a label stacked above a title is a template tell. The board's name
    // strip on the canvas already says which system it belongs to.
    `<h1 style="margin: 0; font-family: var(--font-display); font-size: 36px; line-height: 42px; font-weight: 400; color: var(--text-strong);">${esc(title)}</h1>`,
    body,
    '</main>',
    '</x-import>',
  ].join('\n');
}

const boardLogic = (extra = '') => `renderVals() {\n  return Object.assign({ theme: this.props.dark ? "dark" : "light" }${extra ? `, ${extra}` : ''});\n}`;

function board(system, name, title, body, { height = 900, logic } = {}) {
  return {
    file: `${name}.dc.html`,
    name,
    title,
    source: artboard({
      name,
      title,
      lang: system.lang ?? 'en',
      system: system.namespace,
      ...(system.fontsUrl ? { fonts: system.fontsUrl } : {}),
      systemNote: `${MARKER}. Change the tokens or the definitions, then run brandi product boards again.`,
      body: shell(system, title, body),
      props: { dark: { editor: 'boolean', default: false } },
      preview: { width: W, height },
      logic: logic ?? boardLogic(),
    }),
  };
}

/** The colour board: every role in its group, with both themes' values and the contrast the audit measured. */
export function colourBoard(tokens, system) {
  const audit = auditProductTokens(tokens);
  const ratios = (name) => {
    const rows = audit.rows.filter((r) => r.fg === name && r.ratio !== null);
    const pick = (theme) => rows.filter((r) => r.theme === theme).sort((a, b) => a.ratio - b.ratio)[0];
    const l = pick('light');
    const d = pick('dark');
    return l || d ? `${l ? `${l.ratio}:1 on ${l.bg}` : ''}${l && d ? ' · ' : ''}${d ? `dark ${d.ratio}:1` : ''}` : '';
  };
  const shown = (v) => (/^\{(.+)\}$/.test(String(v)) ? `same as ${String(v).slice(1, -1)}` : v);
  const value = (t) => (typeof t.value === 'string' ? shown(t.value) : `${shown(t.value.light)} · dark ${shown(t.value.dark ?? t.value.light)}`);
  const roles = tokens.color.tokens.filter((t) => !(t.brand === true || (t.brand === undefined && t.name.startsWith('brand-') && t.name !== 'brand-hover')));
  const used = new Set();
  const sections = COLOUR_GROUPS.map(([label, re]) => {
    const list = roles.filter((t) => re.test(t.name) && !used.has(t.name));
    for (const t of list) used.add(t.name);
    if (!list.length) return '';
    return section(label, `<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px;">\n${list.map((t) => tile(t.name, value(t), t.usage, ratios(t.name))).join('\n')}\n</div>`);
  });
  const rest = roles.filter((t) => !used.has(t.name));
  if (rest.length) sections.push(section('Other roles', `<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px;">\n${rest.map((t) => tile(t.name, value(t), t.usage, ratios(t.name))).join('\n')}\n</div>`));
  const brand = tokens.color.tokens.filter((t) => t.brand === true || (t.brand === undefined && t.name.startsWith('brand-') && t.name !== 'brand-hover'));
  if (brand.length) sections.push(section('Brand values', `<p style="margin: 0; text-wrap: pretty; font-size: 14px; line-height: 20px; color: var(--text-muted); max-width: 70ch;">The brand's own colours. Screens never use them directly: every surface, text and action takes a role above, which is solved for contrast in both themes.</p>\n<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px;">\n${brand.map((t) => tile(t.name, value(t), t.usage, '')).join('\n')}\n</div>`));
  return board(system, 'FoundationsColour1440', 'Colour', `<p style="margin: 0; text-wrap: pretty; font-size: 16px; line-height: 24px; color: var(--text-muted); max-width: 70ch;">Every role a screen uses, in its group, with its value in both themes and the lowest contrast the audit measured for it. ${audit.pairs} pairs checked, ${audit.fails.length} below their floor.</p>\n${sections.filter(Boolean).join('\n')}`);
}

function section(label, inner) {
  return `<section style="display: flex; flex-direction: column; gap: 16px;">\n<h2 style="margin: 0; font-size: 18px; line-height: 24px; font-weight: 600; color: var(--text-strong);">${esc(label)}</h2>\n${inner}\n</section>`;
}

function tile(name, value, usage, ratio) {
  return [
    '<div style="display: flex; flex-direction: column; gap: 8px; min-width: 0;">',
    `<div style="height: 72px; border-radius: var(--radius-md); background: var(--${name}); border: 1px solid var(--line);"></div>`,
    `<p style="margin: 0; text-wrap: pretty; font-size: 13px; line-height: 18px; font-weight: 600; color: var(--text-strong); overflow-wrap: anywhere;">${esc(name)}</p>`,
    `<p style="margin: 0; text-wrap: pretty; font-family: var(--font-mono); font-size: 12px; line-height: 16px; color: var(--text-muted); overflow-wrap: anywhere;">${esc(value)}</p>`,
    ratio ? `<p style="margin: 0; text-wrap: pretty; font-size: 12px; line-height: 16px; color: var(--text-muted);">${esc(ratio)}</p>` : '',
    usage ? `<p style="margin: 0; text-wrap: pretty; font-size: 12px; line-height: 16px; color: var(--text-subtle);">${esc(usage)}</p>` : '',
    '</div>',
  ].filter(Boolean).join('\n');
}

/** The type board: every style, set in its own face and size, with its numbers. */
export function typeBoard(tokens, system) {
  const groups = (tokens.type?.groups ?? []).map((g) => section(g.name, g.styles.map((s) => {
    const fam = s.family ?? g.family;
    const sample = /kpi/.test(s.name) ? '$36,120' : s.name === 'eyebrow' ? 'Needs you' : s.name === 'code' ? 'formatNumber(2490.5, "currency")' : 'Bookings that need you today';
    return [
      '<div style="display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 24px; align-items: baseline; padding-block: 12px; border-top: 1px solid var(--line);">',
      `<p style="margin: 0; text-wrap: pretty; font-family: var(--font-mono); font-size: 12px; line-height: 16px; color: var(--text-muted);">type-${esc(s.name)}<br>${esc(s.fontSize)} / ${esc(s.lineHeight)} · ${esc(s.fontWeight ?? 400)}</p>`,
      `<p style="margin: 0; text-wrap: pretty; font-family: var(--font-${fam}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight ?? 400};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ''}${s.name === 'eyebrow' ? ' text-transform: uppercase;' : ''} color: var(--text-strong);">${esc(sample)}</p>`,
      '</div>',
    ].join('\n');
  }).join('\n')));
  const fam = tokens.type?.families ?? {};
  const faces = Object.entries(fam).map(([k, v]) => `<li style="font-size: 14px; line-height: 20px;"><strong style="font-weight: 600;">${esc(k)}</strong>: <span style="font-family: var(--font-mono); font-size: 12px;">${esc(v)}</span></li>`).join('\n');
  return board(system, 'FoundationsType1440', 'Type', `<ul style="margin: 0; padding-left: 20px; color: var(--text); display: flex; flex-direction: column; gap: 4px;">\n${faces}\n</ul>\n${groups.join('\n')}`);
}

/** The shape board: spacing, corners, shadows and sizes, drawn at their values. */
export function shapeBoard(tokens, system) {
  const spacing = (tokens.spacing?.tokens ?? []).map((t) => `<div style="display: grid; grid-template-columns: 160px minmax(0, 1fr); gap: 16px; align-items: center;"><p style="margin: 0; text-wrap: pretty; font-family: var(--font-mono); font-size: 12px; line-height: 16px; color: var(--text-muted);">${esc(t.name)} · ${esc(t.value)}</p><div style="height: 12px; width: ${esc(t.value)}; background: var(--primary); border-radius: var(--radius-xs);"></div></div>`).join('\n');
  const radii = (tokens.radius?.tokens ?? []).map((t) => `<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start;"><div style="width: 120px; height: 72px; background: var(--surface); border: 1px solid var(--line-control); border-radius: ${esc(t.value)};"></div><p style="margin: 0; text-wrap: pretty; font-family: var(--font-mono); font-size: 12px; line-height: 16px; color: var(--text-muted);">${esc(t.name)} · ${esc(t.value)}</p></div>`).join('\n');
  const shadows = (tokens.shadow?.tokens ?? []).map((t) => `<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;"><div style="width: 160px; height: 96px; background: var(--surface); border-radius: var(--radius-md); box-shadow: var(--${t.name});"></div><p style="margin: 0; text-wrap: pretty; font-family: var(--font-mono); font-size: 12px; line-height: 16px; color: var(--text-muted);">${esc(t.name)}</p></div>`).join('\n');
  const sizes = (tokens.size?.tokens ?? []).map((t) => `<li style="font-size: 13px; line-height: 20px;"><span style="font-family: var(--font-mono);">${esc(t.name)}</span> · ${esc(t.value)}${t.usage ? `: ${esc(t.usage)}` : ''}</li>`).join('\n');
  return board(system, 'FoundationsShape1440', 'Space, corners and depth', [
    section('Spacing', `<div style="display: flex; flex-direction: column; gap: 10px;">\n${spacing}\n</div>`),
    section('Corners', `<div style="display: flex; flex-wrap: wrap; gap: 24px;">\n${radii}\n</div>`),
    section('Shadows', `<div style="display: flex; flex-wrap: wrap; gap: 40px; padding: 8px;">\n${shadows}\n</div>`),
    section('Sizes', `<ul style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 2px; color: var(--text);">\n${sizes}\n</ul>`),
  ].join('\n'));
}

/** The icon board: the whole vocabulary, mounted from the bundle by name. */
export function iconBoard(system) {
  const body = `<p style="margin: 0; text-wrap: pretty; font-size: 16px; line-height: 24px; color: var(--text-muted); max-width: 70ch;">One set, by name, in the colour of the text beside it. A board or a product names an icon from this list and nothing else.</p>
<div style="display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 16px;">
<sc-for list="{{icons}}" as="icon" hint-placeholder-count="24"><div style="display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 16px 8px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface);"><x-import component-from-global-scope="${system.global}.Icon" name="{{icon.name}}" size="{{icon.size}}"></x-import><p style="margin: 0; text-wrap: pretty; font-size: 12px; line-height: 16px; color: var(--text-muted); text-align: center; overflow-wrap: anywhere;">{{icon.name}}</p></div></sc-for>
</div>`;
  return board(system, 'FoundationsIcons1440', 'Icons', body, { logic: boardLogic(`{ icons: (window.${system.global}.ICON_NAMES || []).map((name) => ({ name, size: 24 })) }`) });
}

/** One board per catalogue group, built from each component's own examples. */
export function componentBoards(defs, system) {
  const out = [];
  for (const group of GROUPS) {
    const members = defs.filter((d) => d.group === group);
    if (!members.length) continue;
    const vals = Object.assign({}, ...members.flatMap((d) => d.examples.map((ex) => ex.vals ?? {})));
    const logicParts = members.filter((d) => d.logic).map((d) => resolveLogicNs(d.logic, system.global));
    const state = Object.assign({}, ...members.map((d) => d.state ?? {}));
    const body = members.map((d) => [
      `<section style="display: flex; flex-direction: column; gap: 20px; padding-top: 32px; border-top: 1px solid var(--line);">`,
      `<header style="display: flex; flex-direction: column; gap: 4px;"><h2 style="margin: 0; font-size: 20px; line-height: 28px; font-weight: 600; color: var(--text-strong);">${esc(d.name)}</h2><p style="margin: 0; text-wrap: pretty; font-size: 14px; line-height: 20px; color: var(--text-muted); max-width: 70ch;">${esc(d.job)}${d.status === 'to build' ? ' To build, not yet proven.' : ''}</p></header>`,
      ...d.examples.map((ex) => `<div style="display: flex; flex-direction: column; gap: 10px;"><h3 style="margin: 0; font-size: 13px; line-height: 18px; font-weight: 600; color: var(--text-muted);">${esc(ex.title)}</h3><div style="${ex.layout === 'stack' ? 'display: flex; flex-direction: column; gap: 12px; align-items: flex-start;' : ex.layout === 'block' ? 'display: block;' : 'display: flex; flex-wrap: wrap; gap: 12px; align-items: center;'}">${resolveNs(ex.markup, system.global).trim()}</div></div>`),
      '</section>',
    ].join('\n')).join('\n');
    const name = `Components${pascal(group === 'The assistant' ? 'Assistant' : group)}1440`;
    const logic = `state = ${JSON.stringify(state)};\nrenderVals() {\n  return Object.assign(${JSON.stringify(vals)}, { theme: this.props.dark ? "dark" : "light" }${logicParts.length ? `, (() => { const self = this; return { ${logicParts.join(', ')} }; })()` : ''});\n}`;
    out.push(board(system, name, `Components: ${group === 'The assistant' ? 'the assistant' : group.toLowerCase()}`, body, { logic }));
  }
  return out;
}

/** A dark twin: one line importing its light board with the theme flipped, so the two cannot drift. */
export function twin(light, system, height) {
  const name = `${light.name}Dark`;
  return {
    file: `${name}.dc.html`,
    name,
    title: `${light.title} · dark`,
    source: artboard({
      name,
      title: `${light.title}, dark`,
      lang: system.lang ?? 'en',
      system: system.namespace,
      ...(system.fontsUrl ? { fonts: system.fontsUrl } : {}),
      systemNote: `${MARKER}. The dark twin of ${light.file}.`,
      body: `<dc-import name="${light.name}" dark="{{yes}}" hint-size="${W}px,${height}px"></dc-import>`,
      preview: { width: W, height },
      logic: 'renderVals() { return { yes: true }; }',
    }),
  };
}

/** The contents board: the system's sections, each linking to its first board. */
export function contentsBoard(system, sections) {
  const body = sections.map((s) => `<li style="display: flex; flex-direction: column; gap: 4px; padding-block: 16px; border-top: 1px solid var(--line);"><a href="${esc(s.first)}" style="font-size: 20px; line-height: 28px; font-weight: 600; color: var(--link);">${esc(s.label)}</a><span style="font-size: 14px; line-height: 20px; color: var(--text-muted);">${esc(s.note)}</span></li>`).join('\n');
  return board(system, 'Main', 'Contents', `<p style="margin: 0; text-wrap: pretty; font-size: 16px; line-height: 24px; color: var(--text-muted); max-width: 70ch;">The ${esc(system.name)} product system on one canvas: the foundations, every component mounted live, then each product's screens, states and options. Light boards with their dark twins beside them.</p>\n<ol style="margin: 0; padding: 0; list-style: none;">\n${body}\n</ol>`);
}

function isGenerated(file) {
  try { return readFileSync(file, 'utf8').slice(0, 2048).includes(MARKER); } catch { return false; }
}

/**
 * Write every generated board into the canvas folder, measure them, and lay out canvas.json: generated
 * rows on top under title notes, authored boards kept where they are, moved down only if a generated
 * row would cover them.
 */
export async function writeBoards({ productDir, starter, measure = true, log = () => {} }) {
  const canvas = path.join(productDir, 'canvas');
  mkdirSync(canvas, { recursive: true });
  const tokens = JSON.parse(readFileSync(path.join(productDir, 'tokens.json'), 'utf8'));
  const system = JSON.parse(readFileSync(path.join(starter, 'system', 'system.json'), 'utf8'));
  const defs = await loadDefinitions(path.join(starter, 'components', 'system'));

  for (const f of readdirSync(canvas).filter((x) => x.endsWith('.dc.html'))) if (isGenerated(path.join(canvas, f))) unlinkSync(path.join(canvas, f));

  const foundations = [colourBoard(tokens, system), typeBoard(tokens, system), shapeBoard(tokens, system), iconBoard(system)];
  const components = componentBoards(defs, system);
  const sections = [
    { label: 'Foundations', first: foundations[0].file, note: 'Colour, type, space, corners, depth and icons, from the tokens.' },
    { label: 'Components', first: components[0]?.file ?? foundations[0].file, note: `${defs.length} components in ${components.length} groups, mounted from the bundle.` },
  ];
  const authored = readdirSync(canvas).filter((f) => f.endsWith('.dc.html') && f !== 'Main.dc.html').sort();
  const surfaces = [...new Set(authored.map((f) => /^([A-Z][a-z0-9]+)/.exec(f)?.[1]).filter(Boolean))];
  for (const s of surfaces) sections.push({ label: s, first: authored.find((f) => f.startsWith(s)), note: `${authored.filter((f) => f.startsWith(s)).length} boards.` });
  const main = contentsBoard(system, sections);
  const lights = [main, ...foundations, ...components];
  for (const b of lights) writeFileSync(path.join(canvas, b.file), b.source);

  // Measure each light board as rendered, then write it again at its true height.
  const heights = {};
  if (measure && existsSync(path.join(starter, 'node_modules', 'playwright'))) {
    const pagesDir = path.join(productDir, 'canvas', '.measure');
    mkdirSync(pagesDir, { recursive: true });
    const pages = [];
    for (const b of lights) {
      const res = await previewArtboard(path.join(canvas, b.file), { outDir: pagesDir, width: W, height: 900, png: false });
      pages.push({ url: pathToFileURL(res.html).href, width: W, label: b.name });
    }
    writeFileSync(path.join(pagesDir, 'pages.json'), JSON.stringify(pages));
    const run = spawnSync(process.execPath, [path.join('tools', 'measure-boards.mjs'), '--pages', path.join(pagesDir, 'pages.json')], { cwd: starter, encoding: 'utf8', timeout: 600000 });
    try { Object.assign(heights, JSON.parse(run.stdout.trim().split('\n').pop())); } catch { log(`could not measure the boards: ${(run.stderr || run.stdout).slice(-300)}`); }
  }
  const heightOf = (b) => (typeof heights[b.name] === 'number' ? Math.max(400, heights[b.name]) : 1600);
  const rewrite = (b) => b.source.replace(/"\$preview":\{"width":1440,"height":\d+\}/, `"$preview":{"width":1440,"height":${heightOf(b)}}`);
  for (const b of lights) writeFileSync(path.join(canvas, b.file), rewrite(b));
  const twins = [...foundations, ...components].map((b) => twin(b, system, heightOf(b)));
  for (const t of twins) writeFileSync(path.join(canvas, t.file), t.source);

  // Layout: Main, then a row per light board with its twin beside it, under one title per section.
  const entries = [{ file: main.file, x: 0, y: 0, w: W, h: heightOf(main), title: 'Contents' }];
  const annotations = [];
  let y = heightOf(main) + ROW_GAP_Y;
  const row = (list, label, id) => {
    annotations.push({ id, x: 0, y, text: label, kind: 'title1', maxW: W * 2 + ROW_GAP_X });
    y += NOTE_GAP;
    for (const b of list) {
      const h = heightOf(b);
      entries.push({ file: b.file, x: 0, y, w: W, h, title: b.title });
      entries.push({ file: `${b.name}Dark.dc.html`, x: W + ROW_GAP_X, y, w: W, h, title: `${b.title} · dark` });
      y += h + ROW_GAP_Y;
    }
  };
  row(foundations, `Foundations · ${system.name}, light and dark`, 'foundations');
  row(components, 'Components · every variant and state, mounted live, light and dark', 'components');

  // Authored boards keep their own place; shift them below the generated rows if any would be covered.
  let existing = null;
  try { existing = JSON.parse(readFileSync(path.join(canvas, 'canvas.json'), 'utf8')); } catch { /* first run */ }
  const kept = (existing?.artboards ?? []).filter((a) => authored.includes(a.file));
  const top = kept.length ? Math.min(...kept.map((a) => a.y)) : Infinity;
  const shift = kept.length && top < y ? y - top + ROW_GAP_Y : 0;
  for (const a of kept) entries.push({ ...a, y: a.y + shift });
  let below = Math.max(y, ...kept.map((a) => a.y + shift + a.h + ROW_GAP_Y));
  for (const f of authored) {
    if (kept.some((a) => a.file === f)) continue;
    entries.push({ file: f, x: 0, y: below, w: W, h: 900 });
    below += 900 + ROW_GAP_Y;
  }
  const keptNotes = (existing?.annotations ?? []).filter((n) => !['foundations', 'components'].includes(n.id)).map((n) => ({ ...n, y: n.y + shift }));
  const manifest = canvasManifest(entries, {
    annotations: [...annotations, ...keptNotes],
    pages: existing?.pages,
    launch: { view: 'canvas' },
    // The namespace the boards load from is declared here, so they validate before any install;
    // an install record the folder already holds (with its address and files) is kept as it is.
    designSystems: (existing?.designSystems ?? []).some((d) => d.namespace === system.namespace)
      ? existing.designSystems
      : [...(existing?.designSystems ?? []), { title: `${system.name} product system`, namespace: system.namespace }],
  });
  writeFileSync(path.join(canvas, 'canvas.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return { boards: [...lights, ...twins].map((b) => b.file), measured: Object.keys(heights).length, shifted: shift, manifest };
}

export default { writeBoards, colourBoard, typeBoard, shapeBoard, iconBoard, componentBoards, twin, contentsBoard, MARKER };
