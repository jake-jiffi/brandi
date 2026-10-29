/**
 * Brandi product layer: the canvas boards a system generates for itself.
 *
 * Foundations (colour, type, shape, icons) come from the tokens; one board per component group comes
 * from the definitions' own examples, so the canvas and the cards cannot show different things. Each
 * board gets a dark twin that imports it with the theme flipped, a contents board leads (Main), and
 * canvas.json lays the rows out under title notes. Heights are measured in a real browser, because a
 * frame shorter than its content clips. A group's board taller than the canvas takes (8000px) is split
 * between its components into parts that each fit.
 *
 * Generated boards carry a marker and are rewritten on every run. Boards a person authored (screens,
 * states, options) are never touched; they keep their place below the generated rows.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, unlinkSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { artboard, canvasManifest, FRAME_LIMIT } from './canvas.mjs';
import { loadDefinitions, resolveNs, resolveLogicNs, GROUPS } from './productdocs.mjs';
import { auditProductTokens } from './producttokens.mjs';
import { previewArtboard } from './preview.mjs';

export const MARKER = 'generated from the resolved system by brandi product boards';
const W = 1440;
// A board's padding, so its content box is W less twice this: 1328px at 1440.
const PAD = 56;
const ROW_GAP_X = 120;
const NOTE_GAP = 300;
const ROW_GAP_Y = 420;
// Room left under the canvas's limit, so a part measured just under it still fits once fonts settle.
const MEASURE_MARGIN = 400;
// The shell's gap between its sections, which a section's own measured height leaves out.
const SECTION_GAP = 40;
// Prose on a board is capped at the system's measure, about 70 characters at the text's own size. A cap in ch
// is the width of a zero, which ran a contents line to about 98 characters at 1440.

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

function shell(system, title, body, { props = true, note = '' } = {}) {
  const h1 = `<h1 style="margin: 0; font-family: var(--font-display); font-size: 36px; line-height: 42px; font-weight: 400; color: var(--text-strong);">${esc(title)}</h1>`;
  return [
    `<x-import component-from-global-scope="${system.global}.Root" theme="{{theme}}">`,
    `<main style="box-sizing: border-box; width: ${W}px; padding: ${PAD}px; display: flex; flex-direction: column; gap: 40px; background: var(--canvas); color: var(--text); font-family: var(--font-sans);">`,
    // No eyebrow over the heading: a label stacked above a title is a template tell. The board's name
    // strip on the canvas already says which system it belongs to. A note (a part's "Part 2 of 4") sits
    // under it in the body face, since a brand's display face may never set numerals.
    note ? `<header style="display: flex; flex-direction: column; gap: 8px;">${h1}<p style="margin: 0; font-size: 16px; line-height: 24px; color: var(--text-muted);">${esc(note)}</p></header>` : h1,
    body,
    '</main>',
    '</x-import>',
  ].join('\n');
}

const boardLogic = (extra = '') => `renderVals() {\n  return Object.assign({ theme: this.props.dark ? "dark" : "light" }${extra ? `, ${extra}` : ''});\n}`;

function board(system, name, title, body, { height = 900, logic, heading = title, note = '' } = {}) {
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
      body: shell(system, heading, body, { note }),
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
    // A state's step from its base is not a contrast to print beside it.
    const rows = audit.rows.filter((r) => r.fg === name && r.ratio !== null && r.kind !== 'step');
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
  if (brand.length) sections.push(section('Brand values', `<p style="margin: 0; text-wrap: pretty; font-size: 14px; line-height: 20px; color: var(--text-muted); max-width: var(--measure, 30em);">The brand's own colours. Screens never use them directly: every surface, text and action takes a role above, which is solved for contrast in both themes.</p>\n<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px;">\n${brand.map((t) => tile(t.name, value(t), t.usage, '')).join('\n')}\n</div>`));
  return board(system, 'FoundationsColour1440', 'Colour', `<p style="margin: 0; text-wrap: pretty; font-size: 16px; line-height: 24px; color: var(--text-muted); max-width: var(--measure, 30em);">Every role a screen uses, in its group, with its value in both themes and the lowest contrast the audit measured for it. ${audit.pairs} pairs checked, ${audit.fails.length} below their floor.</p>\n${sections.filter(Boolean).join('\n')}`);
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
  // Each corner says whose it is: the brand's, with where it was measured, or the kit's, with how it chose.
  const whose = (t) => (t.source ? `The brand's: ${t.source}` : t.derived ? `The kit's: ${t.derived}` : t.name === 'radius-pill' ? "The kit's: the full round, the same for every brand" : '');
  const note = 'margin: 0; text-wrap: pretty; font-size: 12px; line-height: 16px; color: var(--text-muted);';
  const radii = (tokens.radius?.tokens ?? []).map((t) => `<div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-start; width: 200px;"><div style="width: 120px; height: 72px; background: var(--surface); border: 1px solid var(--line-control); border-radius: ${esc(t.value)};"></div><p style="margin: 0; text-wrap: pretty; font-family: var(--font-mono); font-size: 12px; line-height: 16px; color: var(--text-muted);">${esc(t.name)} · ${esc(t.value)}</p>${t.usage ? `<p style="margin: 0; text-wrap: pretty; font-size: 13px; line-height: 18px; color: var(--text);">${esc(t.usage)}</p>` : ''}${whose(t) ? `<p style="${note}">${esc(whose(t))}</p>` : ''}</div>`).join('\n');
  const shell = tokens.radius?.shell;
  const moves = tokens.radius?.moves ?? [];
  const form = shell
    ? `The rail ${shell.form === 'floating' ? 'floats, 8px in from the window edge' : 'meets the window edge, square'}. The brand's: ${shell.source}`
    : "The rail meets the window edge, square. The kit's: the plainest form, with no shell named";
  const carried = moves.length ? moves.map((m) => `${m.name}, on ${m.where.join(' and ')}. The brand's: ${m.source}`) : ["No shape move of the brand's own is carried yet."];
  const texture = moves.find((m) => m.kind === 'texture' && m.file);
  const shellNotes = [
    ...[form, ...carried].map((line) => `<p style="margin: 0; text-wrap: pretty; font-size: 14px; line-height: 20px; color: var(--text); max-width: var(--measure, 40em);">${esc(line)}</p>`),
    // The texture as a screen carries it, laid on the brand colour by the class tokens.css defines.
    texture ? `<div class="brand-texture" style="width: 480px; height: 120px; border-radius: var(--radius-md); background: var(--brand);"></div><p style="${note}">.brand-texture on the brand colour, at strength ${esc(texture.strength)}</p>` : '',
  ].filter(Boolean).join('\n');
  const shadows = (tokens.shadow?.tokens ?? []).map((t) => `<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;"><div style="width: 160px; height: 96px; background: var(--surface); border-radius: var(--radius-md); box-shadow: var(--${t.name});"></div><p style="margin: 0; text-wrap: pretty; font-family: var(--font-mono); font-size: 12px; line-height: 16px; color: var(--text-muted);">${esc(t.name)}</p>${t.usage ? `<p style="margin: 0; max-width: 200px; text-wrap: pretty; font-size: 12px; line-height: 16px; color: var(--text-muted);">${esc(t.usage)}</p>` : ''}</div>`).join('\n');
  const sizes = (tokens.size?.tokens ?? []).map((t) => `<li style="font-size: 13px; line-height: 20px;"><span style="font-family: var(--font-mono);">${esc(t.name)}</span> · ${esc(t.value)}${t.usage ? `: ${esc(t.usage)}` : ''}</li>`).join('\n');
  return board(system, 'FoundationsShape1440', 'Space, corners and depth', [
    section('Spacing', `<div style="display: flex; flex-direction: column; gap: 10px;">\n${spacing}\n</div>`),
    section('Corners', `<div style="display: flex; flex-wrap: wrap; gap: 24px;">\n${radii}\n</div>`),
    section('The shell and the brand\'s own shapes', `<div style="display: flex; flex-direction: column; gap: 8px;">\n${shellNotes}\n</div>`),
    section('Shadows', `<div style="display: flex; flex-wrap: wrap; gap: 40px; padding: 8px;">\n${shadows}\n</div>`),
    section('Sizes', `<ul style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 2px; color: var(--text);">\n${sizes}\n</ul>`),
  ].join('\n'));
}

/** The icon board: the whole vocabulary, mounted from the bundle by name. */
export function iconBoard(system) {
  const body = `<p style="margin: 0; text-wrap: pretty; font-size: 16px; line-height: 24px; color: var(--text-muted); max-width: var(--measure, 30em);">One set, by name, in the colour of the text beside it. A board or a product names an icon from this list and nothing else.</p>
<div style="display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 16px;">
<sc-for list="{{icons}}" as="icon" hint-placeholder-count="24"><div style="display: flex; flex-direction: column; gap: 8px; align-items: center; padding: 16px 8px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface);"><x-import component-from-global-scope="${system.global}.Icon" name="{{icon.name}}" size="{{icon.size}}"></x-import><p style="margin: 0; text-wrap: pretty; font-size: 12px; line-height: 16px; color: var(--text-muted); text-align: center; overflow-wrap: anywhere;">{{icon.name}}</p></div></sc-for>
</div>`;
  return board(system, 'FoundationsIcons1440', 'Icons', body, { logic: boardLogic(`{ icons: (window.${system.global}.ICON_NAMES || []).map((name) => ({ name, size: 24 })) }`) });
}

/**
 * A component's holes, renamed into its own scope on a group board: `{{rows}}` becomes `{{c3_rows}}`.
 * Loop variables (`as="a"`) and the board's `theme` stay as they are.
 */
export function scopeHoles(markup, prefix) {
  const locals = new Set([...markup.matchAll(/\sas="([A-Za-z_]\w*)"/g)].map((m) => m[1]));
  return markup.replace(/\{\{([A-Za-z_]\w*)/g, (hole, root) => (root === 'theme' || locals.has(root) ? hole : `{{${prefix}_${root}`));
}

/**
 * One board per catalogue group, built from each component's own examples. Each component keeps its
 * own scope: its values and logic outputs are prefixed, and its logic runs with its own slice of state.
 * Merged into one object, two components' keys collided ("three", "groups", "retry") and boards
 * showed another component's data or failed to render.
 */
export function componentBoards(defs, system) {
  return GROUPS.map((group) => groupBoard(system, group, defs.filter((d) => d.group === group))).filter(Boolean);
}

const groupWord = (group) => (group === 'The assistant' ? 'Assistant' : group);

/**
 * How far an example is drawn down to fit the board: the board's content box over the width its own root
 * declares (`style="width: 1440px"`), or null when it fits or sizes to the board. Zoom, not a transform,
 * so its layout box shrinks with it: nothing is clipped, and the example still lays out at its own width,
 * so a shell drawn at 1440 keeps its 1440 layout.
 */
function fitOf(markup) {
  const root = /^\s*<[a-z][\w-]*\b[^>]*>/i.exec(markup)?.[0] ?? '';
  const width = Number(/(?:^|;)\s*width:\s*(\d+(?:\.\d+)?)px/.exec(/\sstyle="([^"]*)"/.exec(root)?.[1] ?? '')?.[1]);
  const room = W - 2 * PAD;
  return width > room ? Math.floor((room / width) * 10000) / 10000 : null;
}

/**
 * One group's board, or one part of it (`part`: { index, count }). The first part keeps the group's own name,
 * so links to it hold; each later part is named for its first component, and every part's title says which of
 * how many it is.
 */
function groupBoard(system, group, members, part = null) {
  if (!members.length) return null;
  const vals = {};
  const state = {};
  const scopes = [];
  const body = members.map((d, i) => {
    const prefix = `c${i}`;
    for (const ex of d.examples) for (const [k, v] of Object.entries(ex.vals ?? {})) vals[`${prefix}_${k}`] = v;
    if (d.state) state[prefix] = d.state;
    if (d.logic) scopes.push(`scoped(${JSON.stringify(prefix)}, (self) => ({ ${resolveLogicNs(d.logic, system.global)} }));`);
    return [
      `<section data-board-section="${esc(d.name)}" style="display: flex; flex-direction: column; gap: 20px; padding-top: 32px; border-top: 1px solid var(--line);">`,
      `<header style="display: flex; flex-direction: column; gap: 4px;"><h2 style="margin: 0; font-size: 20px; line-height: 28px; font-weight: 600; color: var(--text-strong);">${esc(d.name)}</h2><p style="margin: 0; text-wrap: pretty; font-size: 14px; line-height: 20px; color: var(--text-muted); max-width: var(--measure, 30em);">${esc(d.job)}${d.status === 'to build' ? ' To build, not yet proven.' : ''}</p></header>`,
      ...d.examples.map((ex) => {
        const markup = resolveNs(ex.markup, system.global).trim();
        // An example wider than the board is drawn smaller, and its title says so: clipped, it lost its right edge.
        const fit = fitOf(markup);
        return `<div style="display: flex; flex-direction: column; gap: 10px;"><h3 style="margin: 0; font-size: 13px; line-height: 18px; font-weight: 600; color: var(--text-muted);">${esc(ex.title)}${fit ? `, drawn at ${Math.floor(fit * 100)}% to fit` : ''}</h3><div style="${ex.layout === 'stack' ? 'display: flex; flex-direction: column; gap: 12px; align-items: flex-start;' : ex.layout === 'block' ? 'display: block;' : 'display: flex; flex-wrap: wrap; gap: 12px; align-items: center;'}${fit ? ` zoom: ${fit};` : ''}">${scopeHoles(markup, prefix)}</div></div>`;
      }),
      '</section>',
    ].join('\n');
  }).join('\n');
  const name = `Components${pascal(groupWord(group))}${part && part.index > 1 ? pascal(members[0].name) : ''}1440`;
  // The canvas label keeps "2 of 4"; the heading, set in the display face, does not, because a brand's display
  // face may never set numerals. The part number goes under it in the body face.
  const heading = `Components: ${group === 'The assistant' ? 'the assistant' : group.toLowerCase()}`;
  const split = part && part.count > 1;
  const title = `${heading}${split ? `, ${part.index} of ${part.count}` : ''}`;
  const logic = [
    `state = ${JSON.stringify(state)};`,
    'renderVals() {',
    `  const vals = Object.assign(${JSON.stringify(vals)}, { theme: this.props.dark ? "dark" : "light" });`,
    '  const scoped = (prefix, build) => {',
    '    const slice = this.state[prefix] || {};',
    '    const self = { props: this.props, state: slice, setState: (patch) => this.setState({ [prefix]: Object.assign({}, this.state[prefix] || {}, typeof patch === "function" ? patch(this.state[prefix] || {}) : patch) }) };',
    '    const made = build(self);',
    '    for (const key in made) vals[prefix + "_" + key] = made[key];',
    '  };',
    ...scopes.map((line) => `  ${line}`),
    '  return vals;',
    '}',
  ].join('\n');
  return { ...board(system, name, title, body, { logic, heading, note: split ? `Part ${part.index} of ${part.count}` : '' }), group, members: members.map((d) => d.name) };
}

/**
 * How a group's board splits so each part fits the canvas: its components packed in order, each part at most the
 * limit less a margin, measured. `sections` is each component's measured height, in order; the rest of `total`
 * (the title and the padding) comes with every part. A component too tall to fit even alone is reported, and
 * takes a part of its own.
 */
export function packParts({ total, sections, limit = FRAME_LIMIT.max, margin = MEASURE_MARGIN }) {
  const names = Object.keys(sections);
  const budget = limit - margin;
  if (total <= budget || names.length < 2) return { parts: [names], tooTall: total > limit && names.length === 1 ? [{ name: names[0], height: total }] : [] };
  const overhead = Math.max(0, total - names.reduce((n, k) => n + sections[k] + SECTION_GAP, 0));
  const parts = [];
  const tooTall = [];
  let current = [];
  let height = overhead;
  for (const k of names) {
    const h = sections[k] + SECTION_GAP;
    if (current.length && height + h > budget) {
      parts.push(current);
      current = [];
      height = overhead;
    }
    current.push(k);
    height += h;
    if (overhead + h > limit) tooTall.push({ name: k, height: Math.round(overhead + h) });
  }
  parts.push(current);
  return { parts, tooTall };
}

/** A group's board split into parts, in order: each a board of its own, titled "n of m". */
export function partBoards(defs, system, group, parts) {
  const byName = new Map(defs.filter((d) => d.group === group).map((d) => [d.name, d]));
  return parts.map((names, i) => groupBoard(system, group, names.map((n) => byName.get(n)).filter(Boolean), { index: i + 1, count: parts.length }));
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
  return board(system, 'Main', 'Contents', `<p style="margin: 0; text-wrap: pretty; font-size: 16px; line-height: 24px; color: var(--text-muted); max-width: var(--measure, 30em);">The ${esc(system.name)} product system on one canvas: the foundations, every component mounted live, then each product's screens, states and options. Light boards with their dark twins beside them.</p>\n<ol style="margin: 0; padding: 0; list-style: none;">\n${body}\n</ol>`);
}

const GENERATED_NOTES = new Set(['foundations', 'components']);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * The sections a person made on the canvas, in canvas order, for the contents board: each title note in
 * canvas.json with the authored boards under it, linked to its first. A board sits under the nearest note above it
 * that starts at or left of it. Boards under no note keep a section per name, as before there were notes, and a
 * board new since the last run, not yet placed, comes last. A note reads "Label · what it holds", as the generated
 * ones do. Read before this, Main listed only Foundations and Components, and a rerun undid any link to the rest.
 */
export function authoredSections(existing, authored) {
  const at = (a) => [a.y, a.x ?? 0];
  const before = (a, b) => a[0] - b[0] || a[1] - b[1];
  const notes = (existing?.annotations ?? []).filter((n) => !GENERATED_NOTES.has(n.id) && /^title/.test(n.kind ?? '') && Number.isFinite(n.y) && typeof n.text === 'string');
  const placed = (existing?.artboards ?? []).filter((a) => authored.includes(a.file) && Number.isFinite(a.y)).sort((a, b) => before(at(a), at(b)));
  const under = new Map(notes.map((n) => [n, []]));
  const loose = new Map();
  const group = (f, where) => {
    const name = /^([A-Z][a-z0-9]+)/.exec(f)?.[1] ?? f.replace(/\.dc\.html$/, '');
    if (!loose.has(name)) loose.set(name, { at: where, files: [] });
    loose.get(name).files.push(f);
  };
  for (const a of placed) {
    const note = notes.filter((n) => n.y <= a.y && (n.x ?? 0) <= (a.x ?? 0)).sort((m, n) => before(at(n), at(m)))[0];
    if (note) under.get(note).push(a.file);
    else group(a.file, at(a));
  }
  for (const f of authored) if (!placed.some((a) => a.file === f)) group(f, [Infinity, 0]);
  const sections = [];
  for (const [n, files] of under) {
    if (!files.length) continue;
    const [label, ...rest] = n.text.split(' · ');
    const holds = rest.join(' · ').trim().replace(/[.\s]+$/, '');
    sections.push({ at: at(n), label: label.trim(), first: files[0], note: `${holds ? `${holds}. ` : ''}${plural(files.length, 'board')}.` });
  }
  for (const [label, g] of loose) sections.push({ at: g.at, label, first: g.files[0], note: `${plural(g.files.length, 'board')}.` });
  return sections.sort((a, b) => before(a.at, b.at)).map(({ at: _, ...s }) => s);
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
  let components = componentBoards(defs, system);
  const sections = [
    { label: 'Foundations', first: foundations[0].file, note: 'Colour, type, space, corners, depth and icons, from the tokens.' },
    { label: 'Components', first: components[0]?.file ?? foundations[0].file, note: `${defs.length} components in ${components.length} groups, mounted from the bundle.` },
  ];
  const authored = readdirSync(canvas).filter((f) => f.endsWith('.dc.html') && f !== 'Main.dc.html').sort();
  let existing = null;
  try { existing = JSON.parse(readFileSync(path.join(canvas, 'canvas.json'), 'utf8')); } catch { /* first run */ }
  sections.push(...authoredSections(existing, authored));
  const main = contentsBoard(system, sections);
  const lights = [main, ...foundations, ...components];
  for (const b of lights) writeFileSync(path.join(canvas, b.file), b.source);

  // Measure each light board as rendered, then write it again at its true height.
  const heights = {};
  const sectionsOf = {};
  // Measured from a folder of its own, removed after: the pages once stayed in the canvas folder. A
  // rendered page sets its base to the canvas, so it loads the system from there wherever it sits.
  rmSync(path.join(productDir, 'canvas', '.measure'), { recursive: true, force: true });
  const measuring = measure && existsSync(path.join(starter, 'node_modules', 'playwright'));
  const measureAll = async (list) => {
    const pagesDir = mkdtempSync(path.join(os.tmpdir(), 'brandi-measure-'));
    const pages = [];
    for (const b of list) {
      const res = await previewArtboard(path.join(canvas, b.file), { outDir: pagesDir, width: W, height: 900, png: false });
      pages.push({ url: pathToFileURL(res.html).href, width: W, label: b.name });
    }
    writeFileSync(path.join(pagesDir, 'pages.json'), JSON.stringify(pages));
    const run = spawnSync(process.execPath, [path.join('tools', 'measure-boards.mjs'), '--pages', path.join(pagesDir, 'pages.json')], { cwd: starter, encoding: 'utf8', timeout: 600000 });
    try {
      const { __sections = {}, ...measured } = JSON.parse(run.stdout.trim().split('\n').pop());
      Object.assign(heights, measured);
      Object.assign(sectionsOf, __sections);
    } catch { log(`could not measure the boards: ${(run.stderr || run.stdout).slice(-300)}`); }
    rmSync(pagesDir, { recursive: true, force: true });
  };
  if (measuring) await measureAll(lights);

  // A group's board taller than the canvas takes is split between its components, packed in order by their
  // measured heights. A starter whose measuring tool reports no sections splits them evenly instead, and the
  // parts are measured again either way. A component too tall to fit alone is reported, never clipped quietly.
  const tooTall = [];
  const parts = [];
  components = components.flatMap((b) => {
    const total = heights[b.name];
    if (typeof total !== 'number' || total <= FRAME_LIMIT.max - MEASURE_MARGIN) return [b];
    const even = Object.fromEntries(b.members.map((m) => [m, (total - 200) / b.members.length - SECTION_GAP]));
    const packed = packParts({ total, sections: sectionsOf[b.name] ?? even });
    for (const t of packed.tooTall) {
      tooTall.push({ board: b.name, component: t.name, height: t.height });
      log(`${t.name} is ${t.height}px tall on its own, past the canvas's ${FRAME_LIMIT.max}px: give it fewer examples or a shorter frame.`);
    }
    if (packed.parts.length < 2) return [b];
    unlinkSync(path.join(canvas, b.file));
    const split = partBoards(defs, system, b.group, packed.parts);
    for (const p of split) writeFileSync(path.join(canvas, p.file), p.source);
    parts.push(...split);
    log(`${b.title} is ${total}px tall, past the canvas's ${FRAME_LIMIT.max}px: split into ${split.length} boards.`);
    return split;
  });
  if (measuring && parts.length) await measureAll(parts);
  for (const p of parts) if (typeof heights[p.name] === 'number' && heights[p.name] > FRAME_LIMIT.max) tooTall.push({ board: p.name, component: null, height: heights[p.name] });

  const generated = [main, ...foundations, ...components];
  const heightOf = (b) => (typeof heights[b.name] === 'number' ? Math.max(400, heights[b.name]) : 1600);
  const rewrite = (b) => b.source.replace(/"\$preview":\{"width":1440,"height":\d+\}/, `"$preview":{"width":1440,"height":${heightOf(b)}}`);
  for (const b of generated) writeFileSync(path.join(canvas, b.file), rewrite(b));
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
  return { boards: [...generated, ...twins].map((b) => b.file), measured: Object.keys(heights).length, shifted: shift, tooTall, manifest };
}

export default { writeBoards, colourBoard, typeBoard, shapeBoard, iconBoard, componentBoards, packParts, partBoards, twin, contentsBoard, authoredSections, MARKER };
