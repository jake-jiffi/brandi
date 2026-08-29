/**
 * The brand book: a single self-contained HTML file that reads well in a
 * browser and prints to a proper PDF.
 *
 * This is a VIEW of brand.json, not a source. Every value is read from the
 * brand file or the resolved system, so the book cannot disagree with the
 * tokens the code is built from. That is the failure this whole architecture
 * exists to prevent: a beautiful PDF that stopped being true six months ago.
 *
 * Where a section has no content yet, it says so and says what it needs.
 * A brand book with an empty section is honest; a brand book with an invented
 * one is worse than no brand book at all.
 */

import { resolveToken } from './system.mjs';
import { contrastRatio, apcaContrast, bestTextOn, simulateCvd } from './color.mjs';
import { googleFontsUrl, parseRatio } from './artboards.mjs';
import { PROVENANCE } from './brandfile.mjs';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** A placeholder that cannot be mistaken for finished work. */
const todo = (what) =>
  `<p class="todo">Not recorded yet: ${esc(what)}. This section is deliberately empty rather than invented.</p>`;

const has = (v) => v != null && v !== '' && (!Array.isArray(v) || v.length > 0);

// ---------------------------------------------------------------------------

function bookCss(system) {
  const s = system.semantic.light;
  const r = (k) => resolveToken(s[k], system, 'light');
  const f = system.type.fonts;
  const display = f.display ? `'${f.display}', Georgia, serif` : 'Georgia, serif';
  const body = f.body ? `'${f.body}', system-ui, sans-serif` : 'system-ui, sans-serif';
  const mono = f.mono ? `'${f.mono}', ui-monospace, Menlo, monospace` : 'ui-monospace, Menlo, monospace';
  const ink = r('text.primary');
  const muted = r('text.secondary');
  const rule = r('border.subtle');
  const accent = r('accent.solid');

  return `
:root {
  --ink: ${ink};
  --muted: ${muted};
  --rule: ${rule};
  --page: ${r('surface.page')};
  --accent: ${accent};
  --accent-strong: ${s['accent.solid-strong']};
  --display: ${display};
  --body: ${body};
  --mono: ${mono};
}
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  margin: 0;
  background: var(--page);
  color: var(--ink);
  font-family: var(--body);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-wrap: pretty;
}
.page {
  max-width: 210mm;
  margin: 0 auto;
  padding: 26mm 20mm;
  min-height: 297mm;
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.page + .page { border-top: 1px solid var(--rule); }
h1, h2, h3 { font-family: var(--display); font-weight: 700; margin: 0; letter-spacing: -0.02em; line-height: 1.06; }
h1 { font-size: 54px; }
h2 { font-size: 32px; }
h3 { font-size: 19px; letter-spacing: -0.01em; }
p { margin: 0; max-width: 68ch; }
a { color: var(--accent-strong); }
a:hover { color: var(--ink); }
ul, ol { margin: 0; padding-left: 1.15em; max-width: 68ch; }
li + li { margin-top: 0.35em; }
.eyebrow {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--muted);
}
.folio {
  font-family: var(--display); font-size: 64px; line-height: 1;
  color: var(--rule); letter-spacing: -0.04em;
}
.section-head { display: flex; align-items: flex-start; gap: 22px; border-bottom: 2px solid var(--ink); padding-bottom: 14px; }
.section-head__text { display: flex; flex-direction: column; gap: 5px; }
.lede { font-size: 18px; line-height: 1.5; color: var(--muted); max-width: 62ch; }
.mono { font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 12px; }
.stack { display: flex; flex-direction: column; gap: 12px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.card { border: 1px solid var(--rule); padding: 16px; display: flex; flex-direction: column; gap: 7px; }
.card h3 { font-size: 15px; }
.card p { font-size: 13px; color: var(--muted); }
.todo {
  font-family: var(--mono); font-size: 12px; color: var(--muted);
  border-left: 2px solid var(--rule); padding: 8px 0 8px 14px; max-width: 68ch;
}
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; font-weight: 400; font-family: var(--mono); font-size: 10px;
     letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);
     padding-bottom: 7px; border-bottom: 1px solid var(--ink); }
td { padding: 8px 0; border-bottom: 1px solid var(--rule); vertical-align: top; }
.swatch-row { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 2px; }
.swatch { min-height: 76px; padding: 9px 7px; display: flex; flex-direction: column; gap: 2px; font-size: 9px; }
.swatch .mono { font-size: 9px; }
.pill { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--rule);
        padding: 3px 9px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; }
.do-dont { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.do-dont > div { border-top: 2px solid var(--ink); padding-top: 10px; }
.do-dont .dont { border-top-color: var(--rule); color: var(--muted); }
.toc { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 30px; }
.toc a { display: flex; justify-content: space-between; gap: 12px; text-decoration: none;
         border-bottom: 1px solid var(--rule); padding: 6px 0; color: var(--ink); }
.toc a:hover { border-bottom-color: var(--ink); }
.toc span:last-child { font-family: var(--mono); font-size: 11px; color: var(--muted); }
@media print {
  .page { page-break-after: always; border-top: 0; padding: 18mm 16mm; min-height: auto; }
  .page:last-child { page-break-after: auto; }
  a { color: var(--ink); text-decoration: none; }
  body { font-size: 10.5pt; }
  h1 { font-size: 34pt; }
  h2 { font-size: 20pt; }
}
@page { size: A4; margin: 0; }
`;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

let sectionNumber = 0;
const sections = [];

function section(id, title, lede, bodyHtml) {
  sectionNumber += 1;
  const n = String(sectionNumber).padStart(2, '0');
  sections.push({ id, title, n });
  return `<section class="page" id="${id}">
  <div class="section-head">
    <span class="folio">${n}</span>
    <div class="section-head__text">
      <span class="eyebrow">${esc(title)}</span>
      ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
    </div>
  </div>
${bodyHtml}
</section>`;
}

function list(items, render) {
  if (!has(items)) return null;
  // An item a renderer could not make sense of produces no bullet at all. An
  // empty bullet is worse than a missing one: it looks like something was lost.
  const rendered = items.map((i) => (render ? render(i) : esc(i))).filter((x) => x && String(x).trim());
  if (!rendered.length) return null;
  return `<ul>${rendered.map((x) => `<li>${x}</li>`).join('')}</ul>`;
}

function rampBlock(system, family, pal, mode) {
  const cells = pal[mode].steps
    .map((st) => {
      const fg = bestTextOn(st.hex).color;
      return `      <div class="swatch" style="background:${st.hex};color:${fg}">
        <span class="mono">${st.step}</span>
        <span class="mono" style="margin-top:auto">${st.hex}</span>
        <span style="opacity:.72;line-height:1.2">${esc(st.role)}</span>
      </div>`;
    })
    .join('\n');
  return `  <div class="stack" style="gap:7px">
    <span class="eyebrow">${esc(family)} / ${mode}</span>
    <div class="swatch-row">
${cells}
    </div>
  </div>`;
}

/**
 * A misuse is either a plain sentence or a `{what, why, source}` object, because
 * the outline documents both shapes. Stringifying the object produced
 * "Do not [object Object]" in a client deliverable, which is the sort of thing
 * nobody notices until it is printed.
 */
function renderMisuse(m) {
  if (m == null) return '';
  if (typeof m === 'string') return `Do not ${esc(m.replace(/^do not /i, ''))}`;
  const what = m.what ?? m.rule ?? m.misuse;
  if (!what) return '';
  const why = m.why ? ` ${esc(m.why)}` : '';
  const seen = m.source === 'real' || m.source === true
    ? ' <span class="mono" style="font-size:10px">seen in the wild</span>'
    : '';
  return `Do not ${esc(String(what).replace(/^do not /i, ''))}.${why}${seen}`;
}

/**
 * Misuse, drawn.
 *
 * The book printed a bulleted list while the Logo sheet drew the same eight
 * properly, which is backwards: the book is the document of record and the one
 * a client reads. A rule somebody has seen broken is a rule they remember, and
 * a prose prohibition is a rule they route around. Each cell shows the wordmark
 * with the wrong thing done to it, under a cross, with the reason beneath.
 */
function misuseGrid(system, entries, brandName) {
  const { display, body } = { display: 'var(--display)', body: 'var(--body)' };
  const ink = resolveToken(system.semantic.light['text.primary'], system, 'light');
  const danger = resolveToken(system.semantic.light['danger.text'], system, 'light');

  // Keyed by intent, so a caption can be rewritten without breaking a drawing.
  const styleFor = (what) => {
    const t = String(what).toLowerCase();
    if (/stretch|condense/.test(t)) return 'transform:scaleX(1.4);transform-origin:left center';
    if (/squash|squeeze/.test(t)) return 'transform:scaleY(0.6);transform-origin:left center';
    if (/rotate|angle|tilt/.test(t)) return 'transform:rotate(-7deg);transform-origin:left center';
    if (/recolour|recolor|colour it|different colour/.test(t)) return 'color:#C026D3';
    if (/shadow|glow|bevel|outline/.test(t)) return 'text-shadow:2px 3px 0 rgba(0,0,0,.35)';
    if (/retype|typing|reconstruct|body face/.test(t)) return `font-family:${body}`;
    if (/photograph|photo|busy/.test(t)) return 'background:linear-gradient(135deg,#8a8a8a,#3a3a3a);padding:4px 8px;color:#fff';
    if (/box|container|frame/.test(t)) return 'border:2px solid currentColor;padding:4px 10px';
    if (/crowd|clear space/.test(t)) return 'letter-spacing:-0.06em';
    if (/stroke|thin|weight/.test(t)) return 'font-weight:400';
    return 'opacity:.55';
  };

  const cell = (m) => {
    // A brand file is hand-edited, so a null or an object with none of the
    // expected keys reaches here. Neither is a reason to lose the chapter.
    if (m == null) return '';
    const what = typeof m === 'string' ? m : (m.what ?? m.rule ?? m.misuse ?? '');
    if (!what) return '';
    const why = typeof m === 'string' ? null : m.why;
    const real = typeof m !== 'string' && (m.source === 'real' || m.source === true);
    const clean = String(what).replace(/^do not /i, '');
    return `<div style="border:1px solid var(--rule);padding:16px;display:flex;flex-direction:column;gap:10px;min-height:132px;break-inside:avoid">
      <div style="flex:1;display:flex;align-items:center;overflow:hidden">
        <span style="font-family:${display};font-weight:700;font-size:19px;letter-spacing:-.02em;color:${ink};white-space:nowrap;${styleFor(clean)}">${esc(brandName)}</span>
      </div>
      <div style="display:flex;gap:7px;align-items:flex-start">
        <span aria-hidden="true" style="color:${danger};font-size:14px;line-height:1.2;flex:none">&#10005;</span>
        <span style="font-size:12px;line-height:1.35">Never ${esc(clean)}.${why ? ` <span style="color:var(--muted)">${esc(why)}</span>` : ''}${real ? ' <span class="mono" style="font-size:10px">seen in the wild</span>' : ''}</span>
      </div>
    </div>`;
  };

  const cells = entries.map(cell).filter(Boolean);
  return `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">${cells.join('')}</div>
    ${cells.length < 6 ? `<p class="todo">${cells.length} misuses drawn. Six is the floor, because below that people invent their own.</p>` : ''}`;
}

/**
 * Show the supplied mark, at three sizes and on three grounds.
 *
 * A logo chapter that lists filenames is not a logo chapter. SVG is inlined so
 * it stays crisp and can be recoloured; raster comes in as a data URI so the
 * book stays a single self-contained file.
 */
function renderLogoAssets(brand, assets, r) {
  const files = (brand.identity?.logo?.files ?? []).filter(Boolean);
  const shown = files
    .map((f) => ({ path: typeof f === 'string' ? f : f.path, role: typeof f === 'string' ? null : f.role }))
    .filter((f) => f.path && assets[f.path]);

  if (!shown.length) {
    return files.length
      ? `<p class="todo">${files.length} logo file${files.length === 1 ? '' : 's'} recorded but not embedded: ${files.map((f) => esc(typeof f === 'string' ? f : f.path)).join(', ')}. Regenerate the book from the project that holds them so the mark appears here rather than only its filename.</p>`
      : todo('a logo file. Until there is one, the wordmark sheet on the canvas is the mark');
  }

  const primary = shown[0];
  const markup = assets[primary.path].markup;
  return `<div class="stack" style="gap:10px">
    <span class="eyebrow">The mark</span>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;border:1px solid ${r('border.subtle')}">
      <div style="background:${r('surface.page')};padding:26px;display:flex;align-items:center;justify-content:center;min-height:120px"><div style="max-width:180px;max-height:70px;display:flex">${markup}</div></div>
      <div style="background:${r('text.primary')};padding:26px;display:flex;align-items:center;justify-content:center;min-height:120px"><div style="max-width:180px;max-height:70px;display:flex;filter:invert(1) grayscale(1) contrast(2)">${markup}</div></div>
      <div style="background:${r('accent.solid')};padding:26px;display:flex;align-items:center;justify-content:center;min-height:120px"><div style="max-width:180px;max-height:70px;display:flex">${markup}</div></div>
    </div>
    <p style="font-size:12px;color:${r('text.secondary')}">${esc(primary.path)}${primary.role ? ` (${esc(primary.role)})` : ''}. The reversed panel is shown by inversion for reference only; use the supplied reversed artwork, not a filter, in production.</p>
  </div>`;
}

// ---------------------------------------------------------------------------

/**
 * Render the brand book.
 * @param {{brand: object, system: object, assets?: object}} input
 *   `assets` maps a logo path from brand.json to `{kind: 'svg'|'raster', markup}`,
 *   already inlined by the caller. Without it the logo chapter can only name
 *   filenames, which is the one thing a logo chapter must not do.
 */
export function renderBrandBook({ brand, system, assets = {} }) {
  sectionNumber = 0;
  sections.length = 0;

  const name = brand.meta?.name ?? 'Unnamed brand';
  const st = brand.strategy ?? {};
  const id = brand.identity ?? {};
  const voice = brand.voice ?? {};
  const gov = brand.governance ?? {};
  const sem = system.semantic.light;
  const r = (k) => resolveToken(sem[k], system, 'light');
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);

  const body = [];

  // --- Cover -------------------------------------------------------------
  body.push(`<section class="page" id="cover" style="justify-content:space-between;background:${r('accent.solid')};color:${sem['accent.on-solid']}">
  <div class="stack" style="gap:8px">
    <span class="eyebrow" style="color:inherit;opacity:.75">Brand system</span>
    ${has(brand.meta?.effectiveDate) ? `<span class="mono" style="opacity:.75">Effective ${esc(brand.meta.effectiveDate)}</span>` : ''}
  </div>
  <div class="stack" style="gap:14px">
    <h1 style="font-size:82px">${esc(name)}</h1>
    ${has(brand.meta?.tagline) ? `<p class="lede" style="color:inherit;opacity:.85;font-size:22px">${esc(brand.meta.tagline)}</p>` : ''}
  </div>
  <div class="stack" style="gap:4px">
    <span class="mono" style="opacity:.75">Version ${esc(brand.meta?.version ?? '0.1.0')}</span>
    ${has(brand.meta?.owner) ? `<span class="mono" style="opacity:.75">Held by ${esc(brand.meta.owner)}</span>` : ''}
    <span class="mono" style="opacity:.6">This document is a view of brand.json. Edit the source, not this file.</span>
  </div>
</section>`);

  // --- Idea --------------------------------------------------------------
  body.push(section('idea', 'The idea', null, `
  <div class="stack" style="gap:26px">
    ${has(st.purpose)
      ? `<p style="font-family:var(--display);font-size:34px;line-height:1.2;letter-spacing:-.02em;max-width:22ch">${esc(st.purpose)}</p>`
      : todo('the one sentence this brand rests on')}
    ${has(st.problem) ? `<div class="stack" style="gap:6px"><span class="eyebrow">The problem</span><p>${esc(st.problem)}</p></div>` : ''}
    ${has(st.promise) ? `<div class="stack" style="gap:6px"><span class="eyebrow">The promise</span><p>${esc(st.promise)}</p></div>` : ''}
    ${has(st.narrative) ? `<div class="stack" style="gap:6px"><span class="eyebrow">The story, as we tell it</span><p style="font-size:17px;line-height:1.6">${esc(st.narrative)}</p></div>` : ''}
    ${has(id.signature) ? `<div class="stack" style="gap:6px"><span class="eyebrow">The one thing to remember</span><p>${esc(id.signature)}</p></div>` : ''}
  </div>`));

  // --- Strategy ----------------------------------------------------------
  body.push(section('strategy', 'Strategy', 'Who this is for, what it stands against, and the ground it holds.', `
  <div class="stack" style="gap:24px">
    ${has(st.category) ? `<div class="stack" style="gap:6px"><span class="eyebrow">The category we compete in</span><p>${esc(st.category)}. This is the shelf a customer is choosing from, which is not always the one we would put ourselves on.</p></div>` : ''}
    ${has(st.positioning) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Positioning</span><p style="font-size:18px">${esc(st.positioning)}</p></div>` : todo('a positioning statement')}
    ${has(st.audiences) ? `<div class="stack" style="gap:8px"><span class="eyebrow">Audiences</span><div class="grid-3">
      ${st.audiences.map((a) => `<div class="card"><h3>${esc(a.name ?? a)}</h3>${a.need ? `<p>${esc(a.need)}</p>` : ''}${a.context ? `<p>${esc(a.context)}</p>` : ''}</div>`).join('')}
    </div></div>` : todo('who this is for')}
    ${has(st.differentiators) ? `<div class="stack" style="gap:6px"><span class="eyebrow">What makes it different</span>${list(st.differentiators, (d) => esc(d.claim ?? d))}</div>` : ''}
    ${has(st.competitors) ? `<div class="stack" style="gap:6px"><span class="eyebrow">The field</span><table><thead><tr><th>Who</th><th>What they own</th><th>Where the gap is</th></tr></thead><tbody>
      ${st.competitors.map((c) => `<tr><td>${esc(c.name ?? c)}</td><td>${esc(c.owns ?? '')}</td><td>${esc(c.gap ?? '')}</td></tr>`).join('')}
    </tbody></table></div>` : ''}
  </div>`));

  // --- Personality -------------------------------------------------------
  body.push(section('personality', 'Personality and values', 'How the brand behaves when nobody is watching.', `
  <div class="stack" style="gap:24px">
    ${has(st.personality?.attributes) ? `<div class="grid-3">
      ${st.personality.attributes.map((a) => `<div class="card"><h3>${esc(a.name ?? a)}</h3>${a.notThis ? `<p><strong>Not</strong> ${esc(a.notThis)}</p>` : ''}${a.meaning ? `<p>${esc(a.meaning)}</p>` : ''}</div>`).join('')}
    </div>` : todo('personality attributes, each with the thing it is not')}
    ${has(st.values) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Values</span>${list(st.values, (v) => `<strong>${esc(v.name ?? v)}</strong>${v.behaviour ? `. ${esc(v.behaviour)}` : ''}`)}</div>` : ''}
    ${has(st.personality?.archetype) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Archetype</span><p>${esc(st.personality.archetype)}. Archetypes are a generative prompt, not a validated model: useful for finding a register quickly, not evidence of anything.</p></div>` : ''}
  </div>`));

  // --- Messaging ----------------------------------------------------------
  const msg = st.messaging ?? {};
  body.push(section('messaging', 'Messaging', 'One thing to say, and what makes it believable.', `
  <div class="stack" style="gap:24px">
    ${has(msg.primary)
      ? `<div class="stack" style="gap:6px"><span class="eyebrow">The line</span><p style="font-family:var(--display);font-size:38px;line-height:1.15;letter-spacing:-.02em">${esc(msg.primary)}</p></div>`
      : todo('a primary message')}
    ${has(msg.pillars) ? `<div class="stack" style="gap:14px">
      <span class="eyebrow">What holds it up</span>
      <p class="lede" style="font-size:14px">Each pillar carries its own proof. A pillar with nothing under it is a slogan, and it belongs in the open questions until someone finds the evidence.</p>
      ${msg.pillars.map((pil, i) => `<div style="display:grid;grid-template-columns:minmax(0,26ch) minmax(0,1fr);gap:26px;border-top:1px solid var(--rule);padding-top:14px">
        <div class="stack" style="gap:4px">
          <span class="mono" style="color:var(--muted)">${String(i + 1).padStart(2, '0')}</span>
          <strong style="font-family:var(--display);font-size:21px;line-height:1.2">${esc(pil.claim ?? pil.name ?? '')}</strong>
        </div>
        <div>${has(pil.proof)
          ? list(pil.proof)
          : `<p class="todo">No proof recorded. Until there is some, this is a claim rather than a pillar.</p>`}</div>
      </div>`).join('')}
    </div>` : todo('the pillars that hold the message up')}
  </div>`));

  // --- Distinctive assets ------------------------------------------------
  body.push(section('assets', 'Distinctive assets', 'The things that identify this brand with the name covered up.', `
  <div class="stack" style="gap:20px">
    <p>An asset only counts once enough of the audience links it to this brand and to nothing else. Until then it is a design choice, not an asset. The way it becomes one is repetition without variation, over years.</p>
    ${has(st.distinctiveAssets) ? `<table><thead><tr><th>Asset</th><th>Where it appears</th><th>Status</th></tr></thead><tbody>
      ${st.distinctiveAssets.map((a) => `<tr><td>${esc(a.asset)}</td><td>${esc(a.where ?? '')}</td><td class="mono">${esc(a.status ?? 'building')}</td></tr>`).join('')}
    </tbody></table>` : todo('the assets this brand intends to own')}
  </div>`));

  // --- Direction ---------------------------------------------------------
  const moves = id.signatureMoves ?? [];
  if (moves.length) {
    body.push(section('signature-moves', 'Signature moves', 'What makes this recognisable with the name covered up.', `
  <div class="stack" style="gap:26px">
    <p>A logo tells you whose it is once you already know the logo. These are the things that do the work before anyone reads a word: repeatable, buildable, and applied often enough to become familiar. A move used once is a flourish.</p>
    ${moves.map((m) => `<div class="stack" style="gap:8px">
      <h3 style="margin:0">${esc(m.name)}</h3>
      ${m.primitive ? `<p><span class="eyebrow">The thing to build</span> ${esc(m.primitive)}</p>` : ''}
      ${m.howItWorks ? `<p>${esc(m.howItWorks)}</p>` : ''}
      ${m.brokenConvention ? `<p><span class="eyebrow">What it breaks</span> ${esc(m.brokenConvention)}</p>` : ''}
      ${m.useSites?.length
        ? `<p><span class="eyebrow">Where it lands (${m.useSites.length})</span> ${m.useSites.map((u) => `<span class="pill">${esc(u)}</span>`).join(' ')}</p>
           ${m.useSites.length < 8 ? `<p class="todo">Eight sites is the bar for a move to become familiar. This one has ${m.useSites.length}.</p>` : ''}`
        : '<p class="todo">No use sites recorded, so nobody knows where this is meant to appear.</p>'}
    </div>`).join('')}
  </div>`));
  }

  body.push(section('direction', 'Direction', 'Which shelf this sits on, and why that shelf.', `
  <div class="stack" style="gap:22px">
    ${has(id.school) ? `<div class="stack" style="gap:8px">
      <span class="eyebrow">The school</span>
      <p style="font-family:var(--display);font-size:30px;line-height:1.2;letter-spacing:-.02em">${esc(String(id.school).replace(/-/g, ' '))}</p>
    </div>` : todo('a visual direction')}
    ${has(id.schoolRationale) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Why this one</span><p>${esc(id.schoolRationale)}</p></div>` : ''}
    ${has(id.signature) ? `<div class="stack" style="gap:6px"><span class="eyebrow">The signature</span><p>${esc(id.signature)}</p><p style="color:var(--muted)">This is the element the brand is remembered by. It appears at scale wherever there is room, and it is the last thing to be cut when space runs out.</p></div>` : ''}
    <div class="stack" style="gap:6px">
      <span class="eyebrow">Committing</span>
      <p>A direction executed at thirty percent reads as hesitant; at eighty percent it reads as deliberate. When a choice is uncertain, the answer is more of what defines this direction, not less. The alternatives that were considered and rejected are in the decision log.</p>
    </div>
  </div>`));

  // --- Logo --------------------------------------------------------------
  const logo = id.logo ?? {};
  body.push(section('logo', 'Logo system', 'The one element nobody may improvise with.', `
  <div class="stack" style="gap:22px">
    ${renderLogoAssets(brand, assets, r)}
    ${has(logo.variants) ? `<div class="grid-2">${logo.variants.map((v) => `<div class="card"><h3>${esc(v.name ?? v)}</h3>${v.use ? `<p>${esc(v.use)}</p>` : ''}${v.file ? `<span class="mono">${esc(v.file)}</span>` : ''}</div>`).join('')}</div>` : todo('the lockup variants (primary, stacked, horizontal, mark only, reversed)')}
    <div class="grid-2">
      <div class="stack" style="gap:6px">
        <span class="eyebrow">Clear space</span>
        ${has(logo.clearSpace) ? `<p>${esc(logo.clearSpace)}</p>` : todo('clear space, expressed as a ratio of an element of the mark so it scales')}
      </div>
      <div class="stack" style="gap:6px">
        <span class="eyebrow">Minimum size</span>
        ${has(logo.minSize?.screenPx) || has(logo.minSize?.printMm)
          ? `<p>${logo.minSize.screenPx ? `${esc(logo.minSize.screenPx)}px on screen` : ''}${logo.minSize.screenPx && logo.minSize.printMm ? '. ' : ''}${logo.minSize.printMm ? `${esc(logo.minSize.printMm)}mm in print` : ''}</p>`
          : todo('a minimum size in both px and mm')}
      </div>
    </div>
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Misuse</span>
      ${has(logo.misuse) ? misuseGrid(system, logo.misuse, brand.meta?.name ?? 'Brand') : todo('at least six specific misuses, because people invent their own otherwise')}
    </div>
      ${has(id.logo?.placement) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Placement</span><p>${esc(id.logo.placement)}</p></div>` : ''}
    ${id.logo?.minSizes?.length ? `<div class="stack" style="gap:6px"><span class="eyebrow">Minimum size, per variant</span>
      <table><thead><tr><th>Variant</th><th>Print</th><th>Screen</th><th>What fails below this</th></tr></thead><tbody>
        ${id.logo.minSizes.map((m) => `<tr><td>${esc(m.variant)}</td><td class="mono">${m.printMm ? `${m.printMm}mm` : '-'}</td><td class="mono">${m.screenPx ? `${m.screenPx}px` : '-'}</td><td>${m.basis ? esc(m.basis) : '<span class="todo">no basis recorded, so this is a number somebody guessed</span>'}</td></tr>`).join('')}
      </tbody></table></div>` : ''}
    ${has(id.logo?.monochrome?.rule) || has(id.logo?.monochrome?.knockout) ? `<div class="stack" style="gap:6px"><span class="eyebrow">One colour</span>
      ${has(id.logo?.monochrome?.rule) ? `<p>${esc(id.logo.monochrome.rule)}</p>` : ''}
      ${has(id.logo?.monochrome?.knockout) ? `<p><span class="eyebrow">Reversed</span> ${esc(id.logo.monochrome.knockout)}</p>` : ''}
      ${id.logo?.monochrome?.minStrokeMm ? `<p>No stroke below <span class="mono">${id.logo.monochrome.minStrokeMm}mm</span>, which is where thread and etch stop holding a line.</p>` : ''}
    </div>` : ''}
  </div>`));

  // --- Colour ------------------------------------------------------------
  const contrastRows = [
    ['Body text on page', 'text.primary', 'surface.page', 4.5],
    ['Secondary text on page', 'text.secondary', 'surface.page', 4.5],
    ['Brand text on page', 'text.brand', 'surface.page', 4.5],
    ['Focus ring on page', 'focus.ring', 'surface.page', 3],
    ['Label on the brand fill (normal text)', 'accent.on-solid', 'accent.solid', 4.5],
  ]
    .map(([label, fg, bg, min]) => {
      const f = r(fg);
      const b = r(bg);
      const ratio = contrastRatio(f, b);
      return `<tr><td>${esc(label)}</td><td class="mono">${f} on ${b}</td><td class="mono">${ratio.toFixed(2)}:1</td><td class="mono">Lc ${apcaContrast(f, b)}</td><td class="mono">${ratio >= min ? 'pass' : 'FAIL'}</td></tr>`;
    })
    .join('');

  body.push(section('colour', 'Colour', 'Twelve steps per family. Step 9 is the colour itself.', `
  <div class="stack" style="gap:20px">
    ${(() => {
    const parts = parseRatio(id.colour?.ratio);
    if (!has(id.colour?.ratio)) return '';
    const fill = {
      brand: system.palettes.brand.light.solidStrong.hex,
      neutral: system.palettes.neutral.light.steps[2].hex,
      accent: (system.palettes.accent1 ?? system.palettes.brand).light.solidStrong.hex,
    };
    return `<div class="stack" style="gap:8px"><span class="eyebrow">Proportion</span>
      <p>${esc(id.colour.ratio)}. Proportion is as much of a brand as the values are. The same three colours in the wrong amounts is a different brand.</p>
      ${parts ? `<div style="display:flex;height:54px;border:1px solid var(--rule)">
        ${parts.map((pt) => `<div style="width:${pt.pct}%;background:${fill[pt.label] ?? fill.neutral};display:flex;align-items:flex-end;padding:6px"><span class="mono" style="font-size:10px;color:${bestTextOn(fill[pt.label] ?? fill.neutral).color}">${esc(pt.label)} ${pt.pct}%</span></div>`).join('')}
      </div>
      <p style="color:var(--muted)">This is surface area, not instance count. Hold a finished layout beside it and squint: the areas should read the same.</p>` : ''}
    </div>`;
  })()}
${Object.entries({ ...system.palettes, ...system.status }).map(([f, pal]) => rampBlock(system, f, pal, 'light')).join('\n')}
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Dark</span>
${Object.entries(system.palettes).map(([f, pal]) => rampBlock(system, f, pal, 'dark')).join('\n')}
    </div>
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Measured contrast</span>
      <table><thead><tr><th>Pairing</th><th>Values</th><th>WCAG 2.2</th><th>APCA</th><th></th></tr></thead><tbody>${contrastRows}</tbody></table>
    </div>
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Colour vision</span>
      <p>Roughly one man in twelve has a colour vision deficiency. Success and danger sit close together for the red-green types, so status is never carried by colour alone: every status state needs an icon and a word.</p>
      <div class="grid-3">
        ${['protanopia', 'deuteranopia', 'tritanopia'].map((t) => `<div class="stack" style="gap:5px"><span class="mono">${t}</span><div style="display:flex;height:34px">${['success', 'warning', 'danger'].map((k) => `<div style="flex:1;background:${simulateCvd(r(`${k}.solid`), t)}"></div>`).join('')}</div></div>`).join('')}
      </div>
    </div>
  </div>`));

  // --- Typography --------------------------------------------------------
  const scale = system.type.scale;
  const print = system.print;
  body.push(section('print', 'Colour off the screen', 'For the printer, the signwriter and the embroiderer.', `
  <div class="stack" style="gap:20px">
    <p class="todo">${esc(print.caveat)}</p>
    ${has(id.colour?.print?.profile) ? `<p><span class="eyebrow">Separation</span> ${esc(id.colour.print.profile)}</p>` : '<p class="todo">No separation profile recorded, so the CMYK below assumes nothing. Ask the printer which one they run and record it.</p>'}
    <table><thead><tr><th>Role</th><th>Hex</th><th>CMYK</th><th>Pantone C</th><th>Pantone U</th><th>RAL</th><th>Vinyl</th><th>Thread</th></tr></thead><tbody>
      ${print.swatches.map((w) => `<tr>
        <td class="mono">${esc(w.role)}</td>
        <td class="mono">${esc(w.hex)}</td>
        <td class="mono">${esc(w.cmykString)}${w.computed ? ' <span style="color:var(--muted)">computed</span>' : ''}</td>
        <td class="mono">${w.pantoneCoated ? esc(w.pantoneCoated) : '<span style="color:var(--muted)">not matched</span>'}</td>
        <td class="mono">${w.pantoneUncoated ? esc(w.pantoneUncoated) : '<span style="color:var(--muted)">not matched</span>'}</td>
        <td class="mono">${w.ral ? esc(w.ral) : '<span style="color:var(--muted)">-</span>'}</td>
        <td class="mono">${w.vinyl ? esc(w.vinyl) : '<span style="color:var(--muted)">-</span>'}</td>
        <td class="mono">${w.thread ? esc(w.thread) : '<span style="color:var(--muted)">-</span>'}</td>
      </tr>`).join('')}
    </tbody></table>
    ${print.swatches.filter((w) => w.note).map((w) => `<p><span class="eyebrow">${esc(w.role)}</span> ${esc(w.note)}</p>`).join('')}
    ${print.swatches.some((w) => !w.verified) ? `<p class="todo">Unverified: ${print.swatches.filter((w) => !w.verified).map((w) => esc(w.role)).join(', ')}. Verified means somebody held a printed proof next to a guide, not that a number was typed in.</p>` : ''}
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Chart colour</span>
      <p>${esc(system.dataViz.note)}</p>
      <div style="display:flex;gap:2px">${system.dataViz.categorical.map((h) => `<div style="flex:1;height:34px;background:${h}"></div>`).join('')}</div>
      <p class="mono" style="color:var(--muted)">${system.dataViz.categorical.map(esc).join('  ')}</p>
    </div>
  </div>`));

  body.push(section('typography', 'Typography', `A ${scale.ratioName ? scale.ratioName.replace(/-/g, ' ') : scale.ratio} scale from ${scale.basePx}px.`, `
  <div class="stack" style="gap:22px">
    <div class="grid-3">
      ${['display', 'body', 'mono'].map((role) => `<div class="stack" style="gap:6px">
        <span class="eyebrow">${role}</span>
        <div style="font-family:var(--${role === 'mono' ? 'mono' : role});font-size:40px;line-height:1.05;letter-spacing:-.02em">${role === 'mono' ? '0123456789' : 'Handgloves'}</div>
        <span class="mono">${esc(system.type.fonts[role] ?? 'not set')}</span>
      </div>`).join('')}
    </div>
    <table><thead><tr><th>Step</th><th>Size</th><th>Line height</th><th>Tracking</th><th>Use</th></tr></thead><tbody>
      ${scale.steps.slice().reverse().map((s2) => `<tr><td class="mono">${esc(s2.name)}</td><td class="mono">${s2.px}${s2.maxPx !== s2.px ? ` to ${s2.maxPx}` : ''}px</td><td class="mono">${s2.lineHeight}</td><td class="mono">${esc(s2.letterSpacing)}</td><td>${esc(s2.use)}</td></tr>`).join('')}
    </tbody></table>
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Weight</span>
      <p>A weight that is not downloaded is a weight the browser fakes, and a faked bold is thinner and wider than a real one. These are the weights the font request asks for. If the brand needs another, load it and add it to the system rather than writing the number and hoping.</p>
      <table><thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead><tbody>
        ${system.type.weights.map((w) => `<tr><td class="mono">--font-weight-${esc(w.name)}</td><td class="mono">${w.value}</td><td>${esc(w.use)}</td></tr>`).join('')}
      </tbody></table>
    </div>
    ${scale.dropped.length ? `<p class="todo">Steps not issued: ${scale.dropped.map((d) => `${d.name} at ${d.px}px`).join(', ')}. A size nobody may responsibly use is not a size.</p>` : ''}
    <div class="stack" style="gap:6px">
      <span class="eyebrow">Measure</span>
      <p>Body copy sits at ${system.type.measure.css}, which is inside the comfortable range of 45 to 75 characters (${esc(system.type.measure.source)}). Set columns in ch rather than pixels so the count holds when the face changes.</p>
    </div>
    ${has(id.type?.licences) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Licences</span><table><thead><tr><th>Family</th><th>Source</th><th>Permits</th></tr></thead><tbody>${id.type.licences.map((l) => `<tr><td>${esc(l.family)}</td><td>${esc(l.source ?? '')}</td><td>${esc(l.permits ?? '')}</td></tr>`).join('')}</tbody></table></div>` : todo('font licences, which matter the first time this brand ships anywhere commercial')}
  </div>`));

  // --- Shape, space, motion ---------------------------------------------
  body.push(section('form', 'Shape, space, layout and motion', `${system.meta.shape} shapes, a ${system.meta.spaceBase}px grid, ${system.layout.breakpoints.length} breakpoints, ${system.meta.motion} motion.`, `
  <div class="stack" style="gap:22px">
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Radius</span>
      <p>${esc(system.meta.shapeNote)} A box nested inside another takes the outer radius minus the gap between them, or the inner corner reads as too round.</p>
      <div style="display:flex;gap:12px;align-items:flex-end">
        ${system.radius.filter((x) => x.name !== 'full').map((x) => `<div class="stack" style="gap:5px;align-items:center"><div style="width:56px;height:56px;background:${r('accent.bg')};border:1px solid ${r('accent.border')};border-radius:${x.px}px"></div><span class="mono">${esc(x.name)}</span></div>`).join('')}
      </div>
    </div>
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Space</span>
      <p>Tokens are named by their pixel value, so <span class="mono">--space-16</span> is 16px and needs no arithmetic.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${system.space.filter((x) => x.px).map((x) => `<span class="pill">${x.px}</span>`).join('')}</div>
    </div>
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Layout</span>
      <p>${esc(system.layout.note)} A custom property cannot be used inside a media query, so these are numbers to type into one; <span class="mono">--content-max</span> can be referenced directly and is the measure of ${system.type.measure.chars} characters plus a ${system.layout.gutterPx}px gutter each side.</p>
      <table><thead><tr><th>Token</th><th>Width</th><th>What changes here</th></tr></thead><tbody>
        ${system.layout.breakpoints.map((b) => `<tr><td class="mono">--bp-${esc(b.name)}</td><td class="mono">${b.px}px</td><td>${esc(b.use)}</td></tr>`).join('')}
        <tr><td class="mono">--content-max</td><td class="mono">${system.layout.contentMaxPx}px</td><td>The widest a single column of text should ever be.</td></tr>
      </tbody></table>
    </div>
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Motion</span>
      ${has(id.motionPrinciple) ? `<p style="font-family:var(--display);font-size:20px;line-height:1.3">${esc(id.motionPrinciple)}</p>` : ''}
      ${has(id.motionSignature?.name) ? `<p><span class="eyebrow">${esc(id.motionSignature.name)}</span> ${esc(id.motionSignature.description ?? '')}${id.motionSignature.durationMs ? ` <span class="mono">${id.motionSignature.durationMs}ms</span>` : ''}${has(id.motionSignature.easing) ? ` <span class="mono">${esc(id.motionSignature.easing)}</span>` : ''}</p>` : ''}
      <p>${esc(system.meta.motionNote)} Every transition honours <span class="mono">prefers-reduced-motion</span>, which is a WCAG 2.2 requirement, not a nicety.</p>
      <table><thead><tr><th>Token</th><th>Duration</th><th>Use</th></tr></thead><tbody>
        ${system.motion.durations.map((d) => `<tr><td class="mono">--duration-${esc(d.name)}</td><td class="mono">${d.ms}ms</td><td>${esc(d.use)}</td></tr>`).join('')}
      </tbody></table>
    </div>
  </div>`));

  // --- Imagery and icons -------------------------------------------------
  const img = id.imagery ?? {};
  const ico = id.iconography ?? {};
  // What to go and photograph, derived from the surfaces that need an image
  // rather than invented. The direction says how to shoot; this says what, and
  // it is the thing a photographer asks for first. Recorded shots always win.
  const shotList = img.shotList?.length ? img.shotList : (brand.applications ?? [])
    .filter((a) => a && (a.surface || a.name))
    .map((a) => ({
      shot: `[${String(a.name ?? a.surface).toUpperCase()}: the hero image for this surface]`,
      why: a.purpose ?? null,
      surface: a.name ?? a.surface,
    }));

  body.push(section('imagery', 'Imagery and iconography', 'What the brand shows, and how it draws.', `
  <div class="stack" style="gap:22px">
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Imagery</span>
      ${has(img.direction) ? `<p>${esc(img.direction)}</p>` : todo('an imagery direction')}
      ${has(img.treatment) ? `<p><strong>Treatment.</strong> ${esc(img.treatment)}</p>` : ''}
      ${has(img.dos) || has(img.donts) ? `<div class="do-dont">
        <div><span class="eyebrow">Do</span>${list(img.dos) ?? ''}</div>
        <div class="dont"><span class="eyebrow">Do not</span>${list(img.donts) ?? ''}</div>
      </div>` : ''}
    </div>
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Icons</span>
      ${has(ico.style) ? `<p>${esc(ico.style)}. Drawn on a ${ico.grid ?? 24}px grid at ${ico.strokePx ?? 2}px stroke.</p>` : todo('an icon style')}
      <p>Icons are drawn, never typed. Emoji render differently on every platform and read as a tell.</p>
    </div>
      ${shotList.length ? `<div class="stack" style="gap:8px"><span class="eyebrow">Shot list</span>
      <p>${img.shotList?.length ? 'Recorded against the surfaces that need them.' : 'Derived from the applications, because every surface that carries an image needs one that exists. Bracketed because nothing here has been shot yet, and a shot list is what you take to a photographer.'}</p>
      <table><thead><tr><th>Surface</th><th>Shot</th><th>Why</th></tr></thead><tbody>
        ${shotList.map((sh) => `<tr><td>${esc(sh.surface ?? '-')}</td><td>${esc(sh.shot)}</td><td>${sh.why ? esc(sh.why) : ''}</td></tr>`).join('')}
      </tbody></table>
      ${img.rights?.modelReleases || img.rights?.ownership ? `<p><span class="eyebrow">Rights</span> ${esc(img.rights.ownership ?? '')} ${esc(img.rights.modelReleases ?? '')}</p>`
        : '<p class="todo">No usage rights or model releases recorded. Anyone recognisable in a shot needs a release, and a photographer owns the copyright unless the contract says otherwise. That is a question for whoever commissions the shoot, before the shoot.</p>'}
    </div>` : ''}
  </div>`));

  // --- Voice -------------------------------------------------------------
  body.push(section('voice', 'Voice and tone', 'Voice is constant. Tone moves with the reader.', `
  <div class="stack" style="gap:22px">
    ${has(voice.attributes) ? `<div class="grid-3">
      ${voice.attributes.map((a) => `<div class="card"><h3>${esc(a.name ?? a)}</h3>${a.notThis ? `<p><strong>Not</strong> ${esc(a.notThis)}</p>` : ''}${a.doThis ? `<p>${esc(a.doThis)}</p>` : ''}</div>`).join('')}
    </div>` : todo('voice attributes, each paired with what it is not')}
    ${has(voice.tone) ? `<div class="stack" style="gap:8px"><span class="eyebrow">Tone by situation</span>
      <table><thead><tr><th>When</th><th>The reader feels</th><th>So we sound</th></tr></thead><tbody>
        ${voice.tone.map((t) => `<tr><td>${esc(t.situation ?? t.when ?? '')}</td><td>${esc(t.reader ?? '')}</td><td>${esc(t.sound ?? t.tone ?? '')}</td></tr>`).join('')}
      </tbody></table></div>` : ''}
    ${has(voice.vocabulary?.use) || has(voice.vocabulary?.avoid) ? `<div class="do-dont">
      <div><span class="eyebrow">We say</span>${list(voice.vocabulary.use) ?? ''}</div>
      <div class="dont"><span class="eyebrow">We never say</span>${list(voice.vocabulary.avoid, (w) => esc(typeof w === 'string' ? w : w.word)) ?? ''}</div>
    </div>` : ''}
    ${has(voice.examples) ? `<div class="stack" style="gap:10px"><span class="eyebrow">In practice</span>
      ${voice.examples.map((e) => `<div class="do-dont">
        <div><span class="eyebrow">Yes</span><p>${esc(e.good ?? '')}</p></div>
        <div class="dont"><span class="eyebrow">No</span><p>${esc(e.bad ?? '')}</p></div>
      </div>`).join('')}
    </div>` : ''}
    ${has(Object.keys(voice.mechanics ?? {})) ? `<div class="stack" style="gap:8px"><span class="eyebrow">Mechanics</span>
      <p class="lede" style="font-size:14px">The small decisions, settled once, so nobody has to have the argument again.</p>
      <table><thead><tr><th>Question</th><th>Our answer</th></tr></thead><tbody>
        ${Object.entries(voice.mechanics).map(([k, v]) => `<tr><td style="white-space:nowrap">${esc(k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()))}</td><td>${esc(v)}</td></tr>`).join('')}
      </tbody></table></div>` : ''}
    ${has(voice.vocabulary?.hardThings) ? `<div class="stack" style="gap:8px"><span class="eyebrow">How we say hard things</span>
      <p class="lede" style="font-size:14px">The moments where tone is decided under pressure, written down in advance so it is not.</p>
      ${voice.vocabulary.hardThings.map((h) => `<div class="card"><h3>${esc(h.situation)}</h3><p style="color:var(--ink);font-size:14px">${esc(h.say)}</p></div>`).join('')}
    </div>` : ''}
    <p>Copy is design material. Name things by what a person controls, not by how the system is built. Errors say what happened and what to do next: they do not apologise and they are never vague. An empty screen is an invitation to act.</p>
      ${has(voice.boilerplate?.words25) || has(voice.boilerplate?.words50) || has(voice.boilerplate?.words100) ? `<div class="stack" style="gap:10px">
      <span class="eyebrow">Boilerplate</span>
      <p>Every one of these gets used unedited by somebody outside the company: a directory listing, a press release footer, an about page. Written once here so they do not each invent a different brand.</p>
      ${[['25 words', voice.boilerplate?.words25], ['50 words', voice.boilerplate?.words50], ['100 words', voice.boilerplate?.words100]]
        .filter(([, t]) => has(t))
        .map(([label, t]) => `<div class="stack" style="gap:4px"><span class="eyebrow">${label} (${String(t).trim().split(/\s+/).length} written)</span><p>${esc(t)}</p></div>`).join('')}
    </div>` : ''}
    ${has(voice.elevatorPitch) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Said out loud</span><p>${esc(voice.elevatorPitch)}</p></div>` : ''}
    ${voice.keyMessages?.length ? `<div class="stack" style="gap:6px"><span class="eyebrow">Key messages</span>
      <p>One per audience, each with the thing that makes it believable. A message with no proof is a claim, and a claim is what a competitor writes too.</p>
      <table><thead><tr><th>Audience</th><th>Message</th><th>Proof</th></tr></thead><tbody>
        ${voice.keyMessages.map((m) => `<tr><td>${esc(m.audience)}</td><td>${esc(m.message)}</td><td>${m.proof ? esc(m.proof) : '<span class="todo">no proof recorded</span>'}</td></tr>`).join('')}
      </tbody></table></div>` : ''}
    ${has(voice.tagline?.line) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Tagline</span>
      <p style="font-family:var(--display);font-size:28px;line-height:1.15">${esc(voice.tagline.line)}</p>
      ${has(voice.tagline.usage) ? `<p><span class="eyebrow">Where</span> ${esc(voice.tagline.usage)}</p>` : ''}
      ${has(voice.tagline.lockup) ? `<p><span class="eyebrow">Lockup</span> ${esc(voice.tagline.lockup)}</p>` : ''}
    </div>` : ''}
  </div>`));

  // --- Accessibility -----------------------------------------------------
  // Measured, not asserted. Printing "body text clears AA" while the system's
  // own audit says otherwise is the exact failure this whole architecture
  // exists to prevent, so every row here is a live measurement with a verdict.
  const a11yMeasured = [
    ['Body text on the page', 'text.primary', 'surface.page', 4.5, 'WCAG 2.2 1.4.3, AA, normal text'],
    ['Secondary text on the page', 'text.secondary', 'surface.page', 4.5, 'WCAG 2.2 1.4.3, AA, normal text'],
    ['Body text on a card', 'text.primary', 'surface.raised', 4.5, 'WCAG 2.2 1.4.3, AA, normal text'],
    ['Brand-coloured text', 'text.brand', 'surface.page', 4.5, 'WCAG 2.2 1.4.3, AA, normal text'],
    ['The focus ring', 'focus.ring', 'surface.page', 3, 'WCAG 2.2 1.4.11, AA, non-text'],
    ['The strongest border', 'border.strong', 'surface.page', 1.4, 'House minimum. Borders are not required to reach 3:1 unless they alone identify a control'],
  ];
  const a11yRows = ['light', 'dark'].flatMap((m) =>
    a11yMeasured.map(([label, fg, bg, min, cite]) => {
      const f = resolveToken(system.semantic[m][fg], system, m);
      const b = resolveToken(system.semantic[m][bg], system, m);
      const ratio = contrastRatio(f, b);
      const pass = ratio >= min;
      return `<tr>
        <td>${esc(label)}</td><td class="mono">${m}</td>
        <td class="mono">${f} on ${b}</td>
        <td class="mono">${ratio.toFixed(2)}:1</td>
        <td class="mono">needs ${min}:1</td>
        <td class="mono"><strong>${pass ? 'pass' : 'FAIL'}</strong></td>
      </tr><tr><td colspan="6" style="border-bottom:1px solid var(--rule);padding-top:0;font-size:11px;color:var(--muted)">${esc(cite)}</td></tr>`;
    }),
  ).join('');

  const label = resolveToken(sem['accent.on-solid'], system, 'light');
  const labelOn = resolveToken(sem['accent.solid'], system, 'light');
  const labelLc = apcaContrast(label, labelOn);
  const labelRatio = contrastRatio(label, labelOn);

  const auditProblems = system.audit.findings.filter((f) => f.level !== 'info');

  body.push(section('accessibility', 'Accessibility', 'Measured, and reported whichever way it came out.', `
  <div class="stack" style="gap:20px">
    ${system.audit.ok
      ? '<p>Every pairing below was measured when this book was generated, and every one of them passed. Nothing here is a claim; the numbers are the evidence.</p>'
      : `<p><strong>This system does not currently pass its own audit.</strong> The failures are in the table below, marked FAIL, and again under known problems. Nothing has been hidden or rounded in its favour.</p>`}
    <table><thead><tr><th>Pairing</th><th>Theme</th><th>Values</th><th>Measured</th><th>Required</th><th></th></tr></thead><tbody>${a11yRows}</tbody></table>

    <div class="stack" style="gap:6px">
      <span class="eyebrow">Labels on the brand colour</span>
      <p>${esc(label)} on ${esc(labelOn)} measures ${labelRatio.toFixed(2)}:1 and Lc ${labelLc}. A button label is normal-size text, so WCAG 1.4.3 asks 4.5:1 of it${labelRatio >= 4.5 ? ', which it clears' : ', which it does not clear'}. Filled controls therefore use <span class="mono">--accent-solid-strong</span> (${esc(sem['accent.solid-strong'])}), which reaches Lc ${system.palettes.brand.light.solidStrong.lc} and is the value the components sheet uses.</p>
    </div>

    <div class="stack" style="gap:6px">
      <span class="eyebrow">Requirements this system does not measure for you</span>
      <p>These depend on the page, not the palette, so the system cannot certify them. They are requirements, not achievements, and whoever builds the page owns them.</p>
      <ul>
        <li>Nothing is carried by colour alone. Every status state gets an icon and a word. <span class="mono">WCAG 2.2 1.4.1, AA</span></li>
        <li>Focus is visible on every interactive element: a ${system.focus.widthPx}px outline at ${system.focus.offsetPx}px offset, in ${esc(r('focus.ring'))}. ${esc(system.focus.note)} <span class="mono">WCAG 2.2 2.4.7, AA</span></li>
        <li>Interactive targets are at least 24px, and 44px wherever there is room. <span class="mono">WCAG 2.2 2.5.8, AA</span></li>
        <li>Layouts survive the reader forcing looser text spacing. <span class="mono">WCAG 2.2 1.4.12, AA</span></li>
        <li>Layouts survive 200% zoom and reflow to 320px. <span class="mono">WCAG 2.2 1.4.4 and 1.4.10, AA</span></li>
        <li>Motion honours <span class="mono">prefers-reduced-motion</span>. <span class="mono">WCAG 2.2 2.3.3 is Level AAA, so this is a house rule, and it is one worth keeping.</span></li>
      </ul>
    </div>

    ${auditProblems.length ? `<div class="stack" style="gap:6px"><span class="eyebrow">Known problems</span>${list(auditProblems.map((f) => `<strong>${f.level === 'error' ? 'Error' : 'Warning'}.</strong> ${esc(f.message)}${f.fix ? ` ${esc(f.fix)}` : ''}`))}</div>` : ''}
  </div>`));

  // --- Applications ------------------------------------------------------
  const apps = brand.applications ?? [];
  body.push(section('applications', 'Applications', 'The system meeting real work, which is the only place it can be judged.', `
  <div class="stack" style="gap:20px">
    ${has(apps) ? `<div class="grid-2">
      ${apps.map((a) => `<div class="card">
        <h3>${esc(a.name ?? a.surface ?? 'Application')}</h3>
        ${a.purpose ? `<p>${esc(a.purpose)}</p>` : ''}
        ${a.notes ? `<p>${esc(a.notes)}</p>` : ''}
        ${a.frame ? `<span class="mono">${esc(a.frame)}</span>` : ''}
        ${a.file ? `<span class="mono">${esc(a.file)}</span>` : ''}
      </div>`).join('')}
    </div>` : todo('the applications this system has actually been tested on')}
    <p>The live versions live on the design canvas, which is where they should be judged: a system
    that survives a specification sheet and fails a real page has not survived anything.</p>
  </div>`));

  // --- Implementation ----------------------------------------------------
  body.push(section('implementation', 'Implementation', 'The system as code. This is the part that keeps the rest true.', `
  <div class="stack" style="gap:18px">
    <p>Everything in this book is generated from <span class="mono">brand/brand.json</span>. The token files are generated from the same source, so the book and the code cannot disagree.</p>
    <table><thead><tr><th>File</th><th>What it is for</th></tr></thead><tbody>
      <tr><td class="mono">brand/tokens/tokens.json</td><td>Design Tokens Community Group format. Feed this to a build pipeline, checking first that it reads the current draft: the format is a Community Group Report, not a W3C standard, and it is still changing.</td></tr>
      <tr><td class="mono">brand/tokens/tokens.css</td><td>Custom properties, both themes. This is what most work imports.</td></tr>
      <tr><td class="mono">brand/tokens/tailwind.css</td><td>A Tailwind v4 theme block.</td></tr>
      <tr><td class="mono">brand/tokens/tokens.ts</td><td>Typed values, for anything that needs them in JavaScript.</td></tr>
    </tbody></table>
    <div class="stack" style="gap:6px">
      <span class="eyebrow">The one rule</span>
      <p>Build with the semantic tokens (<span class="mono">--surface-page</span>, <span class="mono">--text-primary</span>, <span class="mono">--accent-solid</span>), never with a raw ramp step. If a component needs something the semantic layer does not have, add it to the semantic layer. Reaching past it is how a design system quietly stops being one.</p>
    </div>
  </div>`));

  // --- Anti-patterns -----------------------------------------------------
  body.push(section('anti-patterns', 'What not to do', 'The specific habits that would make this brand look like everyone else.', `
  <div class="stack" style="gap:14px">
    <ul>
      <li>No gradient backgrounds, and never a purple or indigo one. A single-hue gradient under ten degrees of variance is fine; a rainbow is not.</li>
      <li>No blurred gradient orbs standing in for an idea.</li>
      <li>No emoji as icons. Icons are drawn.</li>
      <li>No rounded card with a left accent stripe. It is the most-generated component on the internet.</li>
      <li>No three-column feature grid as the default structure. Reach for a single-column narrative, a comparison, or a full-bleed demonstration first.</li>
      <li>No 01 / 02 / 03 numbering unless the content genuinely is a sequence.</li>
      <li>No invented statistics, testimonials or logos. A bracketed placeholder is honest; a fabrication is not.</li>
      <li>No lorem ipsum, and no "Welcome to our website".</li>
      <li>No default typefaces. ${esc(['Inter', 'Roboto', 'Arial', 'Poppins', 'Montserrat'].join(', '))} are banned outright.</li>
    </ul>
    ${has(gov.nonGoals) ? `<div class="stack" style="gap:6px"><span class="eyebrow">What this system is not</span>${list(gov.nonGoals)}</div>` : ''}
  </div>`));

  // --- Governance --------------------------------------------------------
  const evidenceCounts = Object.fromEntries(
    Object.keys(PROVENANCE).map((k) => [k, (brand.evidence ?? []).filter((e) => e.provenance === k).length]),
  );
  body.push(section('governance', 'Decisions and open questions', 'What was decided, why, and what nobody has answered yet.', `
  <div class="stack" style="gap:22px">
    ${has(gov.decisions) ? `<div class="stack" style="gap:8px"><span class="eyebrow">Decision log</span>
      <table><thead><tr><th>Date</th><th>Decision</th><th>Because</th></tr></thead><tbody>
        ${gov.decisions.map((d) => `<tr><td class="mono">${esc(d.date)}</td><td>${esc(d.decision)}</td><td>${esc(d.rationale)}</td></tr>`).join('')}
      </tbody></table></div>` : todo('a decision log, which is the thing that makes this document durable')}
    ${has(gov.openQuestions?.filter?.((q) => q.status === 'open')) ? `<div class="stack" style="gap:8px"><span class="eyebrow">Open questions</span>
      <table><thead><tr><th>Question</th><th>Why it matters</th><th>Assumed meanwhile</th><th>Who can answer</th></tr></thead><tbody>
        ${gov.openQuestions.filter((q) => q.status === 'open').map((q) => `<tr>
          <td>${esc(q.question)}</td><td>${esc(q.whyItMatters)}</td>
          <td>${esc(q.assumedMeanwhile ?? 'nothing')}</td><td>${esc(q.whoCanAnswer ?? 'unassigned')}</td>
        </tr>${q.changesIf ? `<tr><td colspan="4" style="padding-top:0;font-size:12px;color:var(--muted)"><strong>If the answer is different:</strong> ${esc(q.changesIf)}</td></tr>` : ''}`).join('')}
      </tbody></table></div>` : ''}
    <div class="stack" style="gap:8px">
      <span class="eyebrow">Where this came from</span>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${Object.entries(evidenceCounts).filter(([, n]) => n > 0).map(([k, n]) => `<span class="pill">${esc(PROVENANCE[k].label)} ${n}</span>`).join('') || '<span class="pill">no evidence recorded</span>'}
      </div>
      <p>Every statement in this book is traceable to one of those. Anything marked as assumed is a working assumption, not a finding, and is listed above so it can be corrected rather than inherited.</p>
    </div>
    ${has(gov.changeLog) ? `<div class="stack" style="gap:8px"><span class="eyebrow">Version history</span>
      <table><thead><tr><th>Version</th><th>Date</th><th>What changed</th></tr></thead><tbody>
        ${gov.changeLog.map((c) => `<tr><td class="mono">${esc(c.version)}</td><td class="mono">${esc(c.date)}</td><td>${esc(c.summary)}</td></tr>`).join('')}
      </tbody></table></div>` : ''}
    ${has(brand.meta?.legalName) || has(brand.meta?.owner) ? `<div class="stack" style="gap:6px"><span class="eyebrow">Held by</span>
      <p>${has(brand.meta?.legalName) ? `${esc(brand.meta.legalName)}. ` : ''}${has(brand.meta?.owner) ? `Changes are approved by ${esc(brand.meta.owner)}.` : ''}</p></div>` : ''}
    <div class="stack" style="gap:6px">
      <span class="eyebrow">What this book does not cover</span>
      <p>This book is generated, so it carries exactly what the brand file holds and nothing else.
      Sections a fuller engagement would add, and that are not generated here: a signature-moves
      page, motion studies as recordings rather than tokens, a photography shot list, packaging or
      environmental applications, and a migration plan for retiring the previous identity. Their
      absence is a scope decision, not an oversight, and each is worth adding by hand when the work
      calls for it.</p>
    </div>
    <div class="stack" style="gap:6px">
      <span class="eyebrow">Changing this</span>
      <p>Extending the system is normal. Drifting is not. The difference is a record: add the decision and the reason above, bump the version, regenerate the tokens. A change nobody wrote down becomes an inconsistency the next person has to guess about.</p>
    </div>
      ${gov.trademark ? `<div class="stack" style="gap:8px"><span class="eyebrow">Trademark</span>
      <p>Status, not advice. A search is a lawyer's job and this records what came back.</p>
      <table><thead><tr><th>Mark</th><th>Status</th><th>Where</th><th>Number</th></tr></thead><tbody>
        ${(gov.trademark.marks ?? []).map((m) => `<tr><td>${esc(m.mark)}</td><td>${esc(m.status ?? 'unknown')}</td><td>${esc(m.jurisdiction ?? '-')}</td><td class="mono">${esc(m.number ?? '-')}</td></tr>`).join('')
          || '<tr><td colspan="4" class="todo">No marks recorded. Nobody has searched, which is a risk somebody owns.</td></tr>'}
      </tbody></table>
      ${has(gov.trademark.notice) ? `<p><span class="eyebrow">Symbol</span> ${esc(gov.trademark.notice)}</p>` : ''}
      ${has(gov.trademark.usage) ? `<p><span class="eyebrow">Third parties</span> ${esc(gov.trademark.usage)}</p>` : ''}
    </div>` : '<p class="todo">No trademark status recorded. Whether the name is available is not a design question, and it is the one that can undo all of this.</p>'}
    ${gov.colophon ? `<div class="stack" style="gap:6px"><span class="eyebrow">Colophon</span>
      ${[['Made by', gov.colophon.madeBy], ['Ask', gov.colophon.contact], ['Approved by', gov.colophon.approvedBy], ['Next review', gov.colophon.reviewDate]]
        .filter(([, x]) => has(x)).map(([k, x]) => `<p><span class="eyebrow">${k}</span> ${esc(x)}</p>`).join('')}
    </div>` : ''}
  </div>`));

  // --- Contents (built last, inserted second) ----------------------------
  const toc = `<section class="page" id="contents">
  <div class="section-head"><span class="folio" aria-hidden="true">&nbsp;</span><div class="section-head__text"><span class="eyebrow">Contents</span></div></div>
  <nav class="toc">
${sections.map((s2) => `    <a href="#${s2.id}"><span>${esc(s2.title)}</span><span>${s2.n}</span></a>`).join('\n')}
  </nav>
  <p class="lede" style="margin-top:auto">This book is generated from <span class="mono">brand/brand.json</span>. If something here is wrong, fix the source and regenerate: editing this file directly means the next regeneration silently undoes the correction.</p>
</section>`;

  return `<!doctype html>
<html lang="${esc(brand.meta?.locale ?? 'en-AU')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="brandi: generated from the resolved system">
<title>${esc(name)} brand system</title>
${fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(fonts)}">` : ''}
<style>${bookCss(system)}</style>
</head>
<body>
${body[0]}
${toc}
${body.slice(1).join('\n')}
</body>
</html>
`;
}

export default { renderBrandBook };
