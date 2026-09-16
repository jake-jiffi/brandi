/**
 * The brand book as a presentation deck: 1920x1080 landscape pages, one idea
 * per page, that wear the brand the way an agency's guidelines do.
 *
 * Like the print book, this is a VIEW of brand.json and the resolved system.
 * Every value on a page is read from one of those two; a field that is absent
 * renders as a bracketed placeholder that cannot be mistaken for finished work,
 * and a page whose data is entirely absent is listed in the contents as
 * "[not yet recorded]" rather than quietly dropped. Nothing is invented.
 *
 * The deck is generated, so page numbers are known before the contents page is
 * rendered: pages are planned first, numbered, and only then written out.
 */

import { resolveToken } from './system.mjs';
import { contrastRatio, wcagCheck, apcaContrast, bestTextOn, simulateCvd, parseHex } from './color.mjs';
import { googleFontsUrl, parseRatio, primaryButtonLabel, iconPrimitives } from './artboards.mjs';
import { PROVENANCE, localDate } from './brandfile.mjs';
import { regionsOf, resolveColourway, renderColourway, greyscaleSvg, greyOf, colourRoles } from './logocolour.mjs';

export const PAGE_W = 1920;
export const PAGE_H = 1080;

/** The marker every placeholder carries, so a reader (or a test) can find them all. */
export const PLACEHOLDER = 'Not recorded yet';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const has = (v) => v != null && v !== '' && (!Array.isArray(v) || v.length > 0);

/** A bracketed placeholder. It looks unfinished because it is. */
const todo = (what) => `<span class="todo">[${PLACEHOLDER}: ${esc(what)}]</span>`;

const rgbOf = (hex) => {
  try {
    const { r, g, b } = parseHex(hex);
    return [r, g, b].map((c) => Math.round(c * 255)).join('/');
  } catch {
    return '';
  }
};

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const CHAPTERS = [
  { id: 'framework', title: 'Brand framework', lede: 'What the brand stands for, how it speaks, and what it will not say. Read this before anything else.' },
  { id: 'logo', title: 'Logo', lede: 'The one element nobody may improvise with. Size, clear space and placement are rules, not suggestions.' },
  { id: 'colour', title: 'Colour', lede: 'A small palette used in the right proportions, measured for contrast so nothing here is a guess.' },
  { id: 'typography', title: 'Typography', lede: 'Two faces, one scale, and a hierarchy that tells the reader what to look at first.' },
  { id: 'assets', title: 'Brand assets', lede: 'Imagery, icons, shape and the supporting device: the things that make the work recognisable before anyone reads a word.' },
  { id: 'system', title: 'System', lede: 'Spacing, layout, motion and accessibility, as tokens the code is built from.' },
  { id: 'in-use', title: 'Brand in use', lede: 'The system meeting real work, which is the only place it can be judged.' },
  { id: 'governance', title: 'Rules and decisions', lede: 'What not to do, what was decided and why, and what nobody has answered yet.' },
];

// ---------------------------------------------------------------------------
// Pairing matrix, computed with the same contrast maths the system uses.
// ---------------------------------------------------------------------------

/**
 * Text colours as rows, backgrounds as columns, each cell the AA verdict for
 * normal text (4.5:1). The set is the brand's working colours: ink, muted ink,
 * the brand solid, each accent solid, the brand tint, the page and white.
 */
export function pairingMatrix(system) {
  const sem = system.semantic.light;
  const r = (k) => resolveToken(sem[k], system, 'light');
  const colours = [];
  const add = (name, hex) => {
    const h = String(hex).toUpperCase();
    if (!colours.some((c) => c.hex === h)) colours.push({ name, hex: h });
  };
  add('Ink', r('text.primary'));
  add('Muted ink', r('text.secondary'));
  add('Brand', system.palettes.brand.light.steps[8].hex);
  for (const [family, pal] of Object.entries(system.palettes)) {
    if (/^accent/.test(family)) add(family.replace(/^accent(\d+)$/, 'Accent $1'), pal.light.steps[8].hex);
  }
  add('Brand tint', system.palettes.brand.light.steps[2].hex);
  add('Page', r('surface.page'));
  add('White', '#FFFFFF');
  const cells = colours.map((text) => colours.map((bg) => wcagCheck(text.hex, bg.hex).AA));
  // A colour that fails as text on every background it does not share its own
  // hue with must never carry text. Say so in words, because a grid of crosses
  // is easy to skim past.
  const neverText = colours
    .filter((c, i) => !cells[i].some((ok, j) => ok && j !== i))
    .map((c) => c.name);
  return { colours, cells, neverText };
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

function deckCss(system, tokens) {
  const { display, body, mono } = tokens.fonts;
  return `
:root {
  --s: 1;
  --primary: ${tokens.primary};
  --on-primary: ${tokens.onPrimary};
  --paper: ${tokens.paper};
  --ink: ${tokens.ink};
  --muted: ${tokens.muted};
  --rule: ${tokens.rule};
  --tint: ${tokens.tint};
  --tint-2: ${tokens.tint2};
  --inverted: ${tokens.inverted};
  --on-inverted: ${tokens.onInverted};
  --accent: ${tokens.accent};
  --ground: ${tokens.ground};
  --radius: ${tokens.radiusPx}px;
  --display: ${display};
  --body: ${body};
  --mono: ${mono};
}
@media (max-width: 1960px) { :root { --s: 0.66; } }
@media (max-width: 1300px) { :root { --s: 0.5; } }
@media (max-width: 1000px) { :root { --s: 0.33; } }
@media (max-width: 700px) { :root { --s: 0.19; } }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  margin: 0; background: var(--ground); color: var(--ink);
  font-family: var(--body); font-size: 20px; line-height: 1.5;
  -webkit-font-smoothing: antialiased; text-wrap: pretty; overflow-x: hidden;
}
.deck { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 24px 16px; }
.slide { width: calc(${PAGE_W}px * var(--s)); height: calc(${PAGE_H}px * var(--s)); overflow: hidden; flex: none; box-shadow: 0 2px 24px rgba(0,0,0,.12); }
.page {
  width: ${PAGE_W}px; height: ${PAGE_H}px; transform: scale(var(--s)); transform-origin: top left;
  position: relative; overflow: hidden; background: var(--paper); color: var(--ink);
}
h1, h2, h3 { font-family: var(--display); font-weight: 700; margin: 0; letter-spacing: -0.02em; line-height: 1.05; }
h1 { font-size: 56px; }
h2 { font-size: 30px; }
h3 { font-size: 22px; letter-spacing: -0.01em; }
p { margin: 0; }
ul { margin: 0; padding-left: 1.1em; }
li + li { margin-top: .3em; }
a { color: inherit; }
a:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
.mono { font-family: var(--mono); font-size: 13px; letter-spacing: 0.02em; font-variant-numeric: tabular-nums; }
.label { font-family: var(--mono); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.todo { font-family: var(--mono); font-size: 15px; color: var(--muted); }
.big { font-family: var(--display); font-weight: 700; letter-spacing: -0.025em; line-height: 1.02; text-wrap: balance; }
.footer {
  position: absolute; left: 96px; right: 96px; bottom: 44px; display: flex; justify-content: space-between; align-items: center;
  font-family: var(--mono); font-size: 13px; letter-spacing: 0.04em; color: var(--muted);
}
.folio { font-family: var(--mono); font-size: 14px; }
.corner-mark { position: absolute; top: 48px; right: 96px; height: 32px; display: flex; align-items: center; }
.corner-mark svg { height: 32px; width: auto; display: block; }
.corner-mark img { height: 32px; width: auto; display: block; }
.two { display: grid; grid-template-columns: 560px minmax(0, 1fr); width: 100%; height: 100%; }
.rail { background: var(--tint); padding: 88px 64px 120px 96px; display: flex; flex-direction: column; gap: 28px; }
.rail p { font-size: 19px; line-height: 1.5; max-width: 34ch; }
.rail p + p { margin-top: -10px; }
.canvas { padding: 88px 96px 120px 72px; display: flex; flex-direction: column; gap: 28px; min-width: 0; }
.canvas--centre { justify-content: center; }
.full { width: 100%; height: 100%; padding: 96px; display: flex; flex-direction: column; }
.glyph { display: inline-block; vertical-align: middle; flex: none; }
/* Off-screen for the eye, present for a screen reader and for the PDF's text
   layer. The pairing matrix draws its verdicts as SVG paths so the PDF needs no
   embedded symbol font, and a drawn path has no accessible name: without this
   the grid is 49 cells a screen reader reads as nothing at all. */
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0;
}
/* A real table, so the verdict arrives with its row and column. Overrides the
   document's table rules, which are for reading columns of prose. */
table.pairing { table-layout: fixed; border-collapse: separate; border-spacing: 3px; font-size: 13px; }
table.pairing th, table.pairing td { padding: 8px; border: 0; vertical-align: middle; font-family: var(--body); font-size: 13px; letter-spacing: 0; text-transform: none; text-align: left; }
table.pairing thead th { vertical-align: bottom; }
table.pairing td { text-align: center; }
.mark { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
.mark svg { width: 100%; height: 100%; display: block; }
.mark img { width: 100%; height: 100%; object-fit: contain; display: block; }
.wordmark { font-family: var(--display); font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; line-height: 1; }
.card { border: 1px solid var(--rule); padding: 24px; display: flex; flex-direction: column; gap: 10px; border-radius: var(--radius); background: var(--paper); }
.card h3 { font-size: 22px; }
.card p { font-size: 16px; color: var(--muted); line-height: 1.45; }
table { width: 100%; border-collapse: collapse; font-size: 15px; }
th { text-align: left; font-weight: 400; font-family: var(--mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); padding: 0 12px 8px 0; border-bottom: 1px solid var(--ink); }
td { padding: 8px 12px 8px 0; border-bottom: 1px solid var(--rule); vertical-align: top; }
.tick { color: ${tokens.pass}; font-weight: 700; }
.cross { color: ${tokens.fail}; font-weight: 700; }
.pill { display: inline-flex; align-items: center; border: 1px solid var(--rule); padding: 4px 12px; font-family: var(--mono); font-size: 12px; letter-spacing: 0.04em; border-radius: 999px; }
.toc { columns: 3; column-gap: 56px; }
.toc-chapter { break-inside: avoid; page-break-inside: avoid; padding-bottom: 22px; }
.toc a { display: flex; justify-content: space-between; gap: 16px; text-decoration: none; padding: 4px 0; font-size: 16px; }
.toc a.chapter { font-family: var(--display); font-weight: 700; font-size: 21px; padding-bottom: 6px; }
.toc a span:last-child { font-family: var(--mono); font-size: 14px; }
.toc a.chapter span:last-child { font-family: var(--display); font-size: 21px; }
/* A phone reads the pages reflowed, not as thumbnails: the rail stacks above
   the canvas, fixed grids collapse to one column and the type comes back to a
   readable size. Print never matches this query, so the PDF is untouched. */
@media (max-width: 600px) {
  .deck { gap: 16px; padding: 16px; }
  .slide { width: 100%; height: auto; }
  .page { width: 100%; height: auto; min-height: 0; transform: none; overflow: visible; }
  .page > div[style], .page .two, .page .full { height: auto !important; min-height: 0 !important; }
  .page div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
  .page div[style*="min-height"] { min-height: 0 !important; }
  .two { display: block; }
  .rail, .canvas, .full, .page > div > div[style*="padding"] { padding: 24px 20px !important; }
  .page h1 { font-size: 32px !important; }
  .page h2 { font-size: 22px !important; }
  .page h3 { font-size: 18px !important; }
  .page p, .page li, .page td, .page .rail p { font-size: 16px !important; max-width: none !important; }
  .page .big { font-size: 26px !important; }
  .page .mono, .page .label, .page .todo { font-size: 12px !important; }
  .page .mark { max-width: 100% !important; height: auto !important; }
  .page .mark svg { height: auto; }
  .page .wordmark { font-size: 28px !important; }
  /* Nine columns on a phone: the cells shrink, so the drawn verdicts have to
     shrink with them or they spill across their neighbours. The wrapper
     scrolls sideways rather than the page. */
  table.pairing th, table.pairing td { padding: 3px !important; font-size: 11px !important; }
  table.pairing td { height: 34px !important; }
  table.pairing .glyph { width: 18px; height: 18px; }
  .footer { position: static; margin-top: 16px; padding: 0 20px 20px; }
  .corner-mark { display: none; }
  .toc { columns: 1; }
}
@media print {
  html { --s: 1 !important; }
  body { background: none; overflow: visible; }
  .deck { display: block; padding: 0; gap: 0; }
  .slide { width: ${PAGE_W}px; height: ${PAGE_H}px; box-shadow: none; break-after: page; page-break-after: always; }
  .slide:last-child { break-after: auto; page-break-after: auto; }
  .page { transform: none; }
  a { text-decoration: none; }
}
@page { size: ${PAGE_W}px ${PAGE_H}px; margin: 0; }
`;
}

/**
 * Scale each fixed-size page to the viewport so the deck reads on a phone
 * without a horizontal scrollbar. Print ignores this: the print rules pin the
 * scale back to 1 with !important, which beats the inline value set here.
 */
const SCALE_SCRIPT = `
(function () {
  function fit() {
    var s = Math.min(1, (window.innerWidth - 32) / ${PAGE_W});
    document.documentElement.style.setProperty('--s', String(s));
  }
  fit();
  window.addEventListener('resize', fit);
})();
`;

// ---------------------------------------------------------------------------
// Page shells
// ---------------------------------------------------------------------------

/**
 * The running footer. On a page split into coloured panels each slot takes the
 * colour its panel needs, and the centre line is dropped when it would cross a
 * panel edge.
 */
function footer(ctx, chapter, n, { left, centre, right } = {}) {
  const base = ctx.footerColour ?? 'var(--muted)';
  const c = (v) => (v === false ? null : v ?? base);
  return `<div class="footer" style="color:${base}">
    <span style="color:${c(left)}">${esc(chapter)}</span>
    <span style="color:${c(centre) ?? 'transparent'}">${centre === false ? '' : `${esc(ctx.name)} brand guidelines / v${esc(ctx.version)}`}</span>
    <span class="folio" style="color:${c(right)}">${n}</span>
  </div>`;
}

function cornerMark(ctx) {
  if (!ctx.logo.file) return '';
  return `<div class="corner-mark" aria-hidden="true">${ctx.logo.markup}</div>`;
}

/**
 * Two-panel content page: rail left, canvas right, footer, corner mark. The
 * canvas starts below the corner mark on every page; `centre` composes a
 * short canvas vertically instead of leaving the lower half dead.
 */
function contentPage(ctx, { id, chapter, title, rail, canvas, n, centre = false }) {
  return `<section class="page" id="${id}">
  <div class="two">
    <div class="rail">
      <h1>${esc(title)}</h1>
      ${rail}
    </div>
    <div class="canvas${centre ? ' canvas--centre' : ''}">
      ${canvas}
    </div>
  </div>
  ${cornerMark(ctx)}
  ${footer(ctx, chapter, n)}
</section>`;
}

/**
 * Tick and cross, drawn as paths rather than typed as U+2713 / U+2715, so the
 * PDF never falls back to a system font for them. A cross on a ground its
 * colour barely clears gets a contrasting outline behind it.
 */
function tick(colour, size = 22) {
  return `<svg class="glyph" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5" fill="none" stroke="${colour}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function cross(colour, size = 22, outline = null) {
  const path = (stroke, width) => `<path d="M5 5 19 19M19 5 5 19" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
  return `<svg class="glyph" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${outline ? path(outline, 6) : ''}${path(colour, 3)}</svg>`;
}

/** A page that is one sentence. */
function statementPage(ctx, { id, chapter, title, eyebrow, statement, n, ground = 'var(--primary)', colour = 'var(--on-primary)' }) {
  return `<section class="page" id="${id}" style="background:${ground};color:${colour}">
  <div class="full" style="justify-content:center;align-items:center;text-align:center;gap:48px">
    <h1 class="label" style="color:inherit;opacity:.8;font-family:var(--body);font-size:22px;letter-spacing:0;text-transform:none;font-weight:400">${esc(eyebrow ?? title)}</h1>
    <p class="big" style="font-size:108px;max-width:16ch">${statement}</p>
  </div>
  ${footer({ ...ctx, footerColour: colour }, chapter, n)}
</section>`;
}

function dividerPage(ctx, chapter, n) {
  return `<section class="page divider" id="chapter-${chapter.id}" style="background:var(--primary);color:var(--on-primary)">
  <div class="full" style="justify-content:space-between">
    <h1 class="big" style="font-size:152px">${esc(chapter.title)}</h1>
    <p style="font-size:26px;line-height:1.4;max-width:34ch">${esc(chapter.lede)}</p>
  </div>
  <div class="footer" style="color:var(--on-primary);opacity:.85"><span></span><span></span><span class="folio">${n}</span></div>
</section>`;
}

// ---------------------------------------------------------------------------
// The logo, in every form the deck needs it
// ---------------------------------------------------------------------------

/**
 * Work out the aspect ratio of an inline SVG from its viewBox or size, so the
 * mark can be drawn at a known height. Falls back to 3:1, which is the shape
 * of most wordmarks.
 */
function svgAspect(markup) {
  const vb = /viewBox\s*=\s*"([^"]+)"/i.exec(markup);
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/).map(Number);
    if (p.length === 4 && p[2] > 0 && p[3] > 0) return p[2] / p[3];
  }
  const w = /<svg[^>]*\swidth\s*=\s*"([\d.]+)/i.exec(markup);
  const h = /<svg[^>]*\sheight\s*=\s*"([\d.]+)/i.exec(markup);
  if (w && h && Number(h[1]) > 0) return Number(w[1]) / Number(h[1]);
  return 3;
}

function logoContext(brand, assets, tokens) {
  const files = (brand.identity?.logo?.files ?? []).filter(Boolean)
    .map((f) => ({ path: typeof f === 'string' ? f : f?.path, role: typeof f === 'string' ? null : f?.role }))
    .filter((f) => f.path);
  const primary = files.find((f) => assets[f.path]) ?? null;
  const name = brand.meta?.name ?? 'Brand';
  if (primary) {
    const asset = assets[primary.path].kind === 'raster'
      ? { ...assets[primary.path], markup: assets[primary.path].markup.replace(/\sstyle="[^"]*"/, '') }
      : assets[primary.path];
    return {
      file: primary.path,
      role: primary.role,
      kind: asset.kind,
      markup: asset.markup,
      aspect: asset.kind === 'svg' ? svgAspect(asset.markup) : 3,
      named: files.length,
      embedded: files.filter((f) => assets[f.path]).length,
      /**
       * The mark at a given height in px, held inside maxW when one is given,
       * optionally filtered or recoloured.
       */
      at: (h, { filter = '', colour = null, maxW = null } = {}) => {
        const aspect = asset.kind === 'svg' ? svgAspect(asset.markup) : 3;
        const height = maxW && h * aspect > maxW ? maxW / aspect : h;
        return `<span class="mark" role="img" aria-label="${esc(name)}" style="height:${Math.round(height)}px;width:${Math.round(height * aspect)}px;${filter ? `filter:${filter};` : ''}${colour ? `color:${colour};` : ''}">${asset.markup}</span>`;
      },
      /** The mark at a given width in px. */
      atWidth: (w, opts = {}) => {
        const aspect = asset.kind === 'svg' ? svgAspect(asset.markup) : 3;
        return logoContext(brand, assets, tokens).at(w / aspect, opts);
      },
    };
  }
  return {
    file: null,
    named: files.length,
    embedded: 0,
    aspect: null,
    // A typeset wordmark is about 0.58em per character at bold display
    // weights, so a width bound becomes a font-size bound.
    at: (h, { colour = null, maxW = null } = {}) => {
      const size = Math.round(Math.min(h * 0.9, maxW ? maxW / (name.length * 0.58) : Infinity));
      return `<span class="wordmark" role="img" aria-label="${esc(name)}" style="font-size:${size}px;${colour ? `color:${colour};` : ''}">${esc(name)}</span>`;
    },
    atWidth: (w, opts = {}) => `<span class="wordmark" role="img" aria-label="${esc(name)}" style="font-size:${Math.round(w / (name.length * 0.58))}px;${opts.colour ? `color:${opts.colour};` : ''}">${esc(name)}</span>`,
    typesetNote: files.length
      ? `${files.length} logo file${files.length === 1 ? '' : 's'} recorded but not found on disk (${files.map((f) => f.path).join(', ')}), so the typeset wordmark stands in. Regenerate from the project that holds the files.`
      : 'No logo file recorded, so the wordmark below is the name typeset in the display face. It is a real identity as long as the tracking is a decision, and everything on the following pages still applies once a drawn mark arrives.',
    tokens,
  };
}


/**
 * The approved colourways, drawn from the mapping rather than read off disk.
 *
 * The mapping is the record and the artwork is derived from it, so the deck
 * paints the mark itself: it cannot go stale against the palette, and it works
 * on a machine that has the brand file and the master and nothing else.
 *
 * Anything that will not resolve is reported rather than skipped. A colourway
 * naming a role the palette dropped is exactly the contradiction the book is
 * supposed to surface, not hide.
 */
function colourwayContext(brand, ctxLogo, system) {
  const declared = (brand.identity?.logo?.colourways ?? []).filter(Boolean);
  const approved = declared.filter((c) => c.approvedBy);
  const roles = colourRoles(system);
  const ground = (role) => roles.get(role) ?? null;

  if (!approved.length || !ctxLogo.file || ctxLogo.kind !== 'svg') {
    return {
      approved: [],
      declared: declared.length,
      unapproved: declared.length - approved.length,
      why: !ctxLogo.file || ctxLogo.kind !== 'svg'
        ? 'there is no vector master to paint, so no colourway can be drawn'
        : declared.length
          ? `${declared.length - approved.length} colourway${declared.length - approved.length === 1 ? ' has' : 's have'} been dealt and nobody has approved one`
          : 'no colourway has been approved',
    };
  }

  const { regions } = regionsOf(ctxLogo.markup);
  const out = [];
  const problems = [];
  for (const c of approved) {
    const check = resolveColourway(c, { system, regions });
    if (!check.ok) { problems.push(check.errors[0]); continue; }
    const markup = renderColourway(ctxLogo.markup, c, { system, regions });
    const groundHex = ground(c.ground);
    out.push({
      id: c.id,
      name: c.name ?? c.id,
      approvedBy: c.approvedBy,
      ground: c.ground,
      groundHex,
      // The greyscale proof has to sit on the greyscale of its OWN ground, the
      // way the Colourways board does it. On the page's paper a reversed
      // treatment, whose mark greys out to near white, renders nothing at all.
      greyGroundHex: groundHex ? greyOf(groundHex) : null,
      mapping: c.regions.map((r) => `${r.region ?? r.ink} in ${r.role}`).join(', '),
      markup,
      grey: greyscaleSvg(markup),
    });
  }
  return { approved: out, declared: declared.length, unapproved: declared.length - approved.length, problems, why: null };
}

// ---------------------------------------------------------------------------
// Pages, chapter by chapter
// ---------------------------------------------------------------------------

/**
 * A tile per recorded misuse, each DRAWING the fault.
 *
 * Three of them used to draw a correct lockup: `letter-spacing` and
 * `font-family` do nothing to an <img> or an <svg>, so "crowd it" and "retype
 * it" rendered an ordinary mark, and anything the list did not recognise got
 * `opacity: .45`, which is not a misuse, it is a faded logo. A tile that shows
 * the right thing under the word "Never" teaches the opposite of the rule.
 *
 * So a fault is either drawn properly or the tile says it cannot be drawn here.
 * Saying so is honest; showing the correct mark is not.
 */
function logoMisuseTiles(ctx, entries) {
  const mark = (style) => `<span style="display:inline-block;${style}">${ctx.logo.at(44, { maxW: 300 })}</span>`;
  const pictureFor = (what) => {
    const t = String(what).toLowerCase();
    if (/stretch|condense/.test(t)) return mark('transform:scaleX(1.4);transform-origin:left center');
    if (/squash|squeeze/.test(t)) return mark('transform:scaleY(0.6);transform-origin:left center');
    if (/rotate|angle|tilt/.test(t)) return mark('transform:rotate(-7deg);transform-origin:left center');
    if (/recolour|recolor|colour it|different colour/.test(t)) return mark('filter:hue-rotate(150deg) saturate(3);color:#C026D3');
    if (/shadow|glow|bevel/.test(t)) return mark('filter:drop-shadow(3px 4px 0 rgba(0,0,0,.4))');
    if (/outline/.test(t)) return mark('filter:contrast(0.2) brightness(1.4)');
    // Retyping is only a drawable fault when there is real artwork to depart
    // from: on a brand whose mark IS the name typeset, this tile would show
    // the correct lockup and call it wrong.
    if (/retype|typing|reconstruct|body face/.test(t)) {
      return ctx.logo.file
        ? `<span class="wordmark" style="font-family:var(--display);font-weight:700;font-size:30px;letter-spacing:0.02em;color:var(--ink)">${esc(ctx.name)}</span>`
        : null;
    }
    if (/photograph|photo|busy/.test(t)) return mark('background:repeating-linear-gradient(135deg,#8a8a8a 0 12px,#3a3a3a 12px 24px);padding:8px 14px');
    if (/box|container|frame/.test(t)) return mark('border:3px solid currentColor;padding:6px 14px');
    // Crowding is a fault of what is AROUND the mark, so the tile has to draw
    // the neighbours hard against it.
    if (/crowd|clear space/.test(t)) {
      const jam = (s) => `<span class="label" style="color:var(--ink);white-space:nowrap">${s}</span>`;
      return `<div style="display:flex;align-items:center;gap:0;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);padding:0;max-width:100%">
        ${jam('OPEN 7 DAYS')}${mark('')}${jam('BOOK NOW')}
      </div>`;
    }
    if (/stroke|thin|weight/.test(t)) return mark('font-weight:400;filter:contrast(0.6)');
    return null;
  };
  // "the mark-only version above 96px" is about WHICH FILE is used, and this
  // book holds one lockup, not its parts. Nothing here can show it.
  const cannotDraw = `<div data-undrawable="yes" style="flex:1;width:100%;display:flex;align-items:center;justify-content:center;border:1px dashed var(--rule);background:repeating-linear-gradient(45deg,var(--tint) 0 8px,transparent 8px 16px)">
    <span class="mono" style="font-size:12px;color:var(--muted);text-align:center;padding:0 14px;line-height:1.5">This one cannot be drawn.<br>The rule is below.</span>
  </div>`;
  const cells = entries.map((m) => {
    if (m == null) return '';
    const what = typeof m === 'string' ? m : (m.what ?? m.rule ?? m.misuse ?? '');
    if (!what) return '';
    const why = typeof m === 'string' ? null : m.why;
    const clean = String(what).replace(/^do not /i, '');
    const picture = pictureFor(clean);
    return `<div class="card" data-misuse-drawn="${picture ? 'yes' : 'no'}" style="min-height:250px;justify-content:space-between;overflow:hidden">
      <div style="flex:1;display:flex;align-items:${picture ? 'center' : 'stretch'};overflow:hidden;padding:8px 0">${picture ?? cannotDraw}</div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        ${cross(ctx.tokens.fail, 20)}
        <p style="font-size:15px;line-height:1.35;color:var(--ink)">Never ${esc(clean)}.${why ? ` <span style="color:var(--muted)">${esc(why)}</span>` : ''}</p>
      </div>
    </div>`;
  }).filter(Boolean);
  return { html: `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">${cells.join('')}</div>`, count: cells.length };
}

function railText(...paras) {
  return paras.filter(has).map((p) => `<p>${p}</p>`).join('');
}

/**
 * A simple diagram of a signature move whose rule can be drawn: an image that
 * leaves the frame on two edges, a band across the frame, or a shape held in
 * one corner. Anything else stays as the sentence. Returns null when nothing
 * in the recorded words is drawable; nothing is guessed.
 */
function deviceDiagram(move) {
  const text = `${move.name ?? ''} ${move.primitive ?? ''}`.toLowerCase();
  const W = 560;
  const H = 360;
  const frame = (kind, inner) => ({
    kind,
    svg: `<svg class="device-diagram" data-kind="${kind}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagram of the recorded device: ${esc(move.name ?? '')}"><defs><clipPath id="device-clip"><rect width="${W}" height="${H}"/></clipPath></defs><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="var(--paper)" stroke="var(--ink)"/><g clip-path="url(#device-clip)">${inner}</g><text x="16" y="${H - 16}" font-family="var(--mono)" font-size="12" fill="var(--muted)">the frame</text></svg>`,
  });
  if (/crop|bleed|past .*edge|leaves the frame|off the edge|out of frame|two edges|two sides/.test(text)) {
    // The image block leaves the frame at the top and the right.
    return frame('crop past two edges', `<rect x="${W * 0.36}" y="-60" width="${W * 0.9}" height="${H * 0.78}" fill="var(--primary)"/><ellipse cx="${W * 0.74}" cy="${H * 0.28}" rx="${W * 0.3}" ry="${H * 0.26}" fill="var(--tint)" opacity=".55"/><text x="${W * 0.36 + 16}" y="${H * 0.78 - 76}" font-family="var(--mono)" font-size="12" fill="var(--on-primary)">image, cropped past the top and right edges</text>`);
  }
  if (/\bband\b|stripe|\bbar\b|horizontal rule|a line across/.test(text)) {
    return frame('band', `<rect x="-20" y="${H * 0.42}" width="${W + 40}" height="${H * 0.18}" fill="var(--primary)"/><text x="16" y="${H * 0.42 - 12}" font-family="var(--mono)" font-size="12" fill="var(--muted)">the band, edge to edge</text>`);
  }
  if (/circle|\bdot\b|block|square|shape|blob|corner|tile/.test(text)) {
    const s = Math.round(H * 0.42);
    return frame('shape', `<rect x="${W - s - 32}" y="32" width="${s}" height="${s}" rx="${/circle|dot|blob/.test(text) ? s / 2 : 0}" fill="var(--primary)"/><text x="16" y="${H * 0.5}" font-family="var(--mono)" font-size="12" fill="var(--muted)">the shape, held in one corner</text>`);
  }
  return null;
}

/**
 * An easing curve drawn from its cubic-bezier control points, so the motion
 * page shows the curve rather than four numbers. Null when the value is not a
 * cubic-bezier (a keyword like ease-out stays as its name).
 */
function easingCurve(value, colour, size = 120) {
  const m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/i.exec(String(value ?? ''));
  if (!m) return null;
  const [x1, y1, x2, y2] = m.slice(1).map(Number);
  const px = (x) => (x * size).toFixed(1);
  const py = (y) => (size - y * size).toFixed(1);
  const pad = Math.round(size * 0.3);
  return `<svg class="easing-curve" width="${size + pad}" height="${size + pad * 2}" viewBox="${-pad / 2} ${-pad} ${size + pad} ${size + pad * 2}" aria-hidden="true"><rect x="0" y="0" width="${size}" height="${size}" fill="none" stroke="var(--rule)"/><path d="M0 ${size} L${px(x1)} ${py(y1)} M${size} 0 L${px(x2)} ${py(y2)}" stroke="var(--rule)" stroke-width="1"/><path d="M0 ${size} C ${px(x1)} ${py(y1)}, ${px(x2)} ${py(y2)}, ${size} 0" fill="none" stroke="${colour}" stroke-width="3" stroke-linecap="round"/></svg>`;
}

function planPages(ctx) {
  const { brand, system, tokens, artboards } = ctx;
  const st = brand.strategy ?? {};
  const id = brand.identity ?? {};
  const voice = brand.voice ?? {};
  const gov = brand.governance ?? {};
  const msg = st.messaging ?? {};
  const logo = id.logo ?? {};
  const name = ctx.name;
  const r = ctx.r;
  const pages = [];
  const page = (spec) => pages.push(spec);
  const absent = (title, what) => ({ title, absent: what });

  // --- 1. Brand framework ---------------------------------------------------
  page({ chapter: 'framework', divider: true });
  page({
    chapter: 'framework', id: 'purpose', title: 'Purpose',
    render: (n) => contentPage(ctx, {
      id: 'purpose', chapter: 'Brand framework', title: 'Purpose', n,
      rail: railText(
        'The one sentence the brand rests on. Every choice in this document should be traceable back to it.',
        has(st.narrative) ? esc(st.narrative) : null,
      ),
      canvas: `<div style="display:flex;flex-direction:column;justify-content:center;height:100%;gap:40px">
        <p class="big" style="font-size:72px;max-width:18ch">${has(st.purpose) ? esc(st.purpose) : todo('the one sentence this brand rests on')}</p>
        ${has(st.problem) ? `<div><span class="label">The problem it exists to solve</span><p style="font-size:22px;max-width:50ch;margin-top:8px">${esc(st.problem)}</p></div>` : ''}
      </div>`,
    }),
  });
  page({
    chapter: 'framework', id: 'driver', title: 'Driver, mission, positioning',
    render: (n) => {
      const cols = [
        ['Driver', st.purpose, 'the purpose that drives the brand'],
        ['Mission', st.promise, 'the promise the brand makes'],
        ['Positioning', st.positioning, 'a positioning statement'],
      ];
      const grounds = ['var(--primary)', 'var(--tint-2)', 'var(--tint)'];
      const colours = ['var(--on-primary)', 'var(--ink)', 'var(--ink)'];
      // The statement sits in the middle of its column at a size that fills
      // it, not stranded at the foot under an empty band.
      return `<section class="page" id="driver">
  <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%;height:100%">
    ${cols.map(([t, v, what], i) => `<div style="background:${grounds[i]};color:${colours[i]};padding:88px 64px 120px;display:flex;flex-direction:column;gap:48px">
      ${i === 0 ? `<h1 style="font-size:64px">${t}</h1>` : `<h2 style="font-size:64px">${t}</h2>`}
      <div style="flex:1;display:flex;align-items:center"><p class="big" style="font-size:${String(v ?? '').length > 120 ? 36 : 44}px;font-weight:400;line-height:1.2;letter-spacing:-0.01em">${has(v) ? esc(v) : todo(what)}</p></div>
    </div>`).join('')}
  </div>
  ${footer({ ...ctx, footerColour: 'var(--ink)' }, 'Brand framework', n, { left: 'var(--on-primary)', centre: false })}
</section>`;
    },
  });
  const competitors = has(st.competitors) ? st.competitors : [];
  page({
    chapter: 'framework', id: 'field', title: 'The field',
    ...(competitors.length || has(voice.elevatorPitch) ? {} : absent('The field', 'competitors or an elevator pitch')),
    render: (n) => contentPage(ctx, {
      id: 'field', chapter: 'Brand framework', title: 'The field', n, centre: true,
      rail: railText(
        'Who else the customer could choose, what each of them owns, and the gap this brand stands in. Positioning is only a claim until it is held against the alternatives.',
        has(st.category) ? `<strong>Category.</strong> ${esc(st.category)}` : null,
      ),
      canvas: `${competitors.length ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(3, competitors.length)},minmax(0,1fr));gap:20px">
          ${competitors.map((c) => `<div class="card" style="gap:16px;padding:32px">
            <h3 style="font-size:26px">${esc(c.name ?? c)}</h3>
            <div><span class="label">They own</span><p style="font-size:17px;color:var(--ink);margin-top:6px">${has(c.owns) ? esc(c.owns) : todo('what they own')}</p></div>
            <div><span class="label">The gap</span><p style="font-size:17px;color:var(--ink);margin-top:6px">${has(c.gap) ? esc(c.gap) : todo('the gap they leave')}</p></div>
          </div>`).join('')}
        </div>` : `<p>${todo('the competitors and what each owns (strategy.competitors)')}</p>`}
        <div style="margin-top:24px"><span class="label">Said out loud</span><p class="big" style="font-size:40px;font-weight:400;line-height:1.2;margin-top:12px;max-width:28ch">${has(voice.elevatorPitch) ? esc(voice.elevatorPitch) : todo('the elevator pitch (voice.elevatorPitch)')}</p></div>`,
    }),
  });
  const pillars = has(msg.pillars) ? msg.pillars : null;
  // Type steps down when the pillars carry a lot, so a long list stays on its
  // fixed-size page instead of running under the footer.
  const pillarText = (pillars ?? []).reduce((m, pil) => Math.max(m, [pil.why ?? '', ...(pil.proof ?? [])].join(' ').length), 0);
  const pillarDense = pillarText > 260 || (pillars ?? []).some((pil) => (pil.proof ?? []).length > 3);
  page({
    chapter: 'framework', id: 'pillars', title: 'Pillars',
    ...(pillars ? {} : absent('Pillars', 'messaging pillars')),
    render: (n) => `<section class="page" id="pillars" style="background:var(--tint)">
  <div class="full" style="gap:72px;padding-bottom:120px">
    <h1 style="font-size:72px">Pillars</h1>
    <div style="display:grid;grid-template-columns:repeat(${Math.min(4, Math.max(2, pillars?.length ?? 2))},minmax(0,1fr));gap:0;flex:1;align-items:stretch">
      ${(pillars ?? []).map((pil, i) => `<div style="padding:0 40px 0 ${i ? 40 : 0}px;border-left:${i ? '1px solid var(--rule)' : 'none'};display:flex;flex-direction:column;gap:${pillarDense ? 24 : 40}px">
        <h2 style="font-size:${pillarDense ? 40 : 52}px;min-height:2.1em">${esc(pil.claim ?? pil.name ?? '')}</h2>
        <div><span class="label">Why it matters</span><p style="font-size:${pillarDense ? 19 : 23}px;line-height:1.4;margin-top:10px">${has(pil.why) ? esc(pil.why) : todo('why this pillar matters')}</p></div>
        <div><span class="label">How it shows up in practice</span>${has(pil.proof) ? `<ul style="font-size:${pillarDense ? 19 : 23}px;line-height:1.4;margin-top:10px">${pil.proof.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : `<p style="margin-top:10px">${todo('proof for this pillar; until there is some it is a slogan')}</p>`}</div>
      </div>`).join('')}
    </div>
  </div>
  ${cornerMark(ctx)}
  ${footer({ ...ctx, footerColour: 'var(--ink)' }, 'Brand framework', n)}
</section>`,
  });
  const attributes = has(st.personality?.attributes) ? st.personality.attributes : null;
  page({
    chapter: 'framework', id: 'personality', title: 'Personality',
    ...(attributes ? {} : absent('Personality', 'personality attributes')),
    render: (n) => `<section class="page" id="personality" style="background:var(--tint-2)">
  <div class="full" style="gap:56px">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:64px">
      <h1 style="font-size:72px">Personality</h1>
      <p style="font-size:20px;max-width:58ch;color:var(--muted)">How the brand behaves when nobody is watching. Each trait is paired with the thing it is not, because that is where the line gets crossed.${has(st.personality?.archetype) ? ` <strong style="color:var(--ink)">${esc(st.personality.archetype)}.</strong>` : ''}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(${Math.min(4, Math.max(2, attributes?.length ?? 2))},minmax(0,1fr));gap:24px;flex:1;align-items:stretch;margin-bottom:40px">
      ${(attributes ?? []).map((a) => `<div class="card" style="padding:48px;gap:20px;justify-content:space-between">
        <div style="display:flex;flex-direction:column;gap:16px">
          <h2 style="font-size:64px">${esc(a.name ?? a)}</h2>
          ${a.notThis ? `<p style="font-size:24px;color:var(--ink)"><span class="label">Not</span> ${esc(a.notThis)}</p>` : ''}
        </div>
        <p style="font-size:24px;line-height:1.4;color:var(--ink)">${has(a.meaning) ? esc(a.meaning) : todo('what this trait means in practice')}</p>
      </div>`).join('')}
    </div>
  </div>
  ${cornerMark(ctx)}
  ${footer({ ...ctx, footerColour: 'var(--ink)' }, 'Brand framework', n)}
</section>`,
  });
  page({
    chapter: 'framework', id: 'proposition', title: 'Proposition',
    ...(has(msg.primary) ? {} : absent('Proposition', 'a primary message')),
    render: (n) => statementPage(ctx, { id: 'proposition', chapter: 'Brand framework', title: 'Proposition', statement: esc(msg.primary ?? ''), n }),
  });
  const traits = has(voice.attributes) ? voice.attributes : null;
  page({
    chapter: 'framework', id: 'tone', title: 'Tone of voice',
    ...(traits ? {} : absent('Tone of voice', 'voice attributes')),
    render: (n) => {
      // The tone statement is RECORDED or it is absent. Joining the trait names
      // into a sentence ("Plain, Warm and Useful.") reads as a written line and
      // is not one, and a deck that manufactures its own headline cannot be
      // trusted about anything else on the page.
      //
      // Example lines belong to the trait that records them. They used to be
      // dealt round-robin out of voice.examples and vocabulary.hardThings, so
      // "We have stopped. She was not coping…" appeared as an example of
      // "Plain": an attribution nobody made, printed as if somebody had.
      const forTrait = (a) => (Array.isArray(a?.examples) ? a.examples.filter(has).slice(0, 2) : []);
      return `<section class="page" id="tone">
  <div style="display:grid;grid-template-columns:840px minmax(0,1fr);width:100%;height:100%">
    <div style="background:var(--primary);color:var(--on-primary);padding:96px;display:flex;flex-direction:column;justify-content:space-between">
      <h1 style="font-size:64px">Tone of voice</h1>
      <div style="display:flex;flex-direction:column;gap:20px">
        <p class="big" style="font-size:44px;max-width:16ch">${has(voice.statement) ? esc(voice.statement) : todo('a one-line tone statement (voice.statement)')}</p>
        <p style="font-size:18px;opacity:.9;max-width:44ch">${has(st.personality?.archetype) ? `${esc(st.personality.archetype)}. ` : ''}Voice is constant. Tone moves with the reader${has(voice.tone) ? ', and the situations are on the next page' : ''}.</p>
      </div>
    </div>
    <div style="padding:96px 96px 120px 72px;display:flex;flex-direction:column;gap:32px">
      <h2 style="font-size:44px">Voice traits</h2>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:36px 48px">
        ${(traits ?? []).map((a) => `<div class="voice-trait" style="display:flex;flex-direction:column;gap:10px;min-width:0">
          <h3 style="font-size:34px">${esc(a.name ?? a)}${a.notThis ? ` <span style="font-family:var(--body);font-weight:400;font-size:18px;color:var(--muted)">not ${esc(a.notThis)}</span>` : ''}</h3>
          <p style="font-size:19px;line-height:1.45">${has(a.doThis) ? esc(a.doThis) : has(a.meaning) ? esc(a.meaning) : todo('what this trait sounds like')}</p>
          ${forTrait(a).length ? `<p class="voice-example" style="font-size:17px;font-style:italic;color:var(--muted);line-height:1.4">${forTrait(a).map((x) => `&ldquo;${esc(x)}&rdquo;`).join('<br>')}</p>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </div>
  ${footer(ctx, 'Brand framework', n, { left: 'var(--on-primary)', centre: false })}
</section>`;
    },
  });
  const situations = has(voice.tone) ? voice.tone : null;
  page({
    chapter: 'framework', id: 'tone-situations', title: 'Tone by situation',
    ...(situations ? {} : absent('Tone by situation', 'tone by situation (voice.tone)')),
    render: (n) => contentPage(ctx, {
      id: 'tone-situations', chapter: 'Brand framework', title: 'Tone by situation', n, centre: true,
      rail: railText(
        'The same voice, dialled to who is reading and what state they are in. When two of these disagree, the reader\'s state wins.',
        has(voice.mechanics?.sentenceLength) ? `<strong>Always.</strong> ${esc(voice.mechanics.sentenceLength)}` : null,
      ),
      // The hard-things lines live HERE, where the brand file puts them: a
      // situation and the sentence said in it. They used to be dealt out on
      // the tone page as though a voice trait had claimed them.
      canvas: `<table style="font-size:20px"><thead><tr><th style="width:24%">When</th><th style="width:30%">The reader feels</th><th>So we sound</th></tr></thead><tbody>
        ${(situations ?? []).slice(0, 8).map((t) => `<tr><td style="padding:16px 16px 16px 0"><strong>${esc(t.situation ?? t.when ?? '')}</strong></td><td style="padding:16px 16px 16px 0;color:var(--muted)">${esc(t.reader ?? '')}</td><td style="padding:16px 0">${esc(t.sound ?? t.tone ?? '')}</td></tr>`).join('')}
      </tbody></table>
      ${has(voice.vocabulary?.hardThings) ? `<div class="hard-things" style="display:flex;flex-direction:column;gap:16px;margin-top:8px">
        <h2 style="font-size:30px">How we say hard things</h2>
        <div style="display:grid;grid-template-columns:repeat(${Math.min(2, voice.vocabulary.hardThings.length)},minmax(0,1fr));gap:20px">
          ${voice.vocabulary.hardThings.slice(0, 4).map((h) => `<div class="card" style="gap:8px"><h3 style="font-size:19px">${esc(h.situation ?? '')}</h3><p style="font-size:17px;font-style:italic;color:var(--ink);line-height:1.4">&ldquo;${esc(h.say ?? '')}&rdquo;</p></div>`).join('')}
        </div>
      </div>` : ''}`,
    }),
  });
  page({
    chapter: 'framework', id: 'key-messaging', title: 'Key messaging',
    render: (n) => {
      const dedupe = (xs) => [...new Set(xs.filter(has).map(String))];
      const columns = [
        ['The brand', dedupe([msg.primary, voice.tagline?.line ?? msg.tagline, st.positioning, ...(st.distinctiveAssets ?? []).map((a) => a.asset)]), 'lines about the brand'],
        ['The problem', dedupe([st.problem, ...(st.competitors ?? []).map((c) => c.gap)]), 'lines about the problem'],
        ['The service', dedupe([...(msg.pillars ?? []).flatMap((p) => p.proof ?? []), ...(st.differentiators ?? []).map((d) => d.claim ?? d)]), 'lines about the service'],
        ['The result', dedupe([st.promise, ...(voice.keyMessages ?? []).map((m) => m.message)]), 'lines about the result'],
      ];
      return `<section class="page" id="key-messaging" style="background:var(--tint)">
  <div class="full" style="gap:72px;padding-bottom:120px">
    <h1 style="font-size:72px">Key messaging</h1>
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));flex:1;align-items:stretch">
      ${columns.map(([t, lines, what], i) => `<div style="padding:0 32px 0 ${i ? 32 : 0}px;border-left:${i ? '1px solid var(--rule)' : 'none'};display:flex;flex-direction:column;gap:32px">
        <h2 style="font-size:44px">${t}</h2>
        <div style="display:flex;flex-direction:column;gap:16px;font-size:21px;line-height:1.4">${lines.length ? lines.slice(0, 9).map((l) => `<p>${esc(l)}</p>`).join('') : `<p>${todo(what)}</p>`}</div>
      </div>`).join('')}
    </div>
  </div>
  ${cornerMark(ctx)}
  ${footer({ ...ctx, footerColour: 'var(--ink)' }, 'Brand framework', n)}
</section>`;
    },
  });
  page({
    chapter: 'framework', id: 'writing', title: 'Writing guidance',
    render: (n) => {
      const mech = voice.mechanics ?? {};
      const like = [mech.sentenceLength, mech.contractions, mech.headings, mech.buttons].filter(has);
      const useWords = voice.vocabulary?.use ?? [];
      const avoidWords = (voice.vocabulary?.avoid ?? []).map((w) => (typeof w === 'string' ? w : w.word)).filter(Boolean);
      const bad = (voice.examples ?? []).map((e) => e.bad).filter(Boolean)[0];
      const good = (voice.examples ?? []).map((e) => e.good).filter(Boolean)[0];
      return `<section class="page" id="writing">
  <div style="display:grid;grid-template-columns:1fr 1fr;width:100%;height:100%">
    <div style="background:var(--primary);color:var(--on-primary);padding:96px;display:flex;flex-direction:column;gap:40px">
      <h1 style="font-size:64px">Write like this</h1>
      ${like.length ? `<ul style="font-size:22px;line-height:1.45;max-width:36ch;display:flex;flex-direction:column;gap:12px">${like.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : `<p>${todo('voice mechanics: sentence length, contractions, headings, buttons')}</p>`}
      ${useWords.length ? `<p style="font-size:18px;opacity:.9"><span class="label" style="color:inherit;opacity:.8">We say</span><br>${useWords.map(esc).join(' &middot; ')}</p>` : ''}
      ${good ? `<p style="font-size:20px;font-style:italic;max-width:36ch;margin-top:auto">${esc(good)}</p>` : ''}
    </div>
    <div style="background:var(--tint);padding:96px;display:flex;flex-direction:column;gap:40px">
      <h2 style="font-size:64px">Not like this</h2>
      ${avoidWords.length ? `<p style="font-size:22px;line-height:1.45;max-width:36ch"><span class="label">We never say</span><br>${avoidWords.map(esc).join(' &middot; ')}</p>` : `<p>${todo('the words this brand never uses')}</p>`}
      ${bad ? `<p style="font-size:20px;font-style:italic;color:var(--muted);max-width:36ch;margin-top:auto">${esc(bad)}</p>` : ''}
    </div>
  </div>
  ${footer({ ...ctx, footerColour: 'var(--ink)' }, 'Brand framework', n, { left: 'var(--on-primary)', centre: false })}
</section>`;
    },
  });

  // --- 2. Logo --------------------------------------------------------------
  const L = ctx.logo;
  page({ chapter: 'logo', divider: true });
  page({
    chapter: 'logo', id: 'our-logo', title: 'Our logo',
    render: (n) => contentPage(ctx, {
      id: 'our-logo', chapter: 'Logo', title: 'Our logo', n,
      rail: railText(
        has(logo.rationale) ? esc(logo.rationale) : todo('the story behind the mark (identity.logo.rationale)'),
        L.file ? `${esc(L.file)}${L.role ? ` (${esc(L.role)})` : ''}. ${L.embedded < L.named ? `${L.named - L.embedded} of ${L.named} recorded logo files could not be found on disk.` : 'The artwork is the file, not a picture of it.'}` : `<span class="todo">[${PLACEHOLDER}: the logo artwork. ${esc(L.typesetNote)}]</span>`,
        has(logo.placement) ? `<strong>Placement.</strong> ${esc(logo.placement)}` : null,
      ),
      canvas: `<div style="flex:1;display:flex;align-items:center;justify-content:center">${L.at(320, { maxW: 1150 })}</div>`,
    }),
  });
  page({
    chapter: 'logo', id: 'variants', title: 'Variants on backgrounds',
    render: (n) => {
      const variants = has(logo.variants) ? logo.variants : [{ name: L.file ? 'Primary' : 'Wordmark', use: null }];
      // A supplied file is shown in its own colours only on the light ground.
      // On the brand colour and on dark it is reversed by filter, unless the
      // variant is itself the reversed artwork, which is drawn as supplied.
      const reverse = L.file ? 'brightness(0) invert(1)' : '';
      const grounds = [
        ['Light', 'var(--paper)', () => ({})],
        ['Primary', 'var(--primary)', (reversed) => ({ colour: 'var(--on-primary)', filter: reversed ? '' : reverse })],
        ['Dark', 'var(--inverted)', (reversed) => ({ colour: 'var(--on-inverted)', filter: reversed ? '' : reverse })],
        ['One colour', 'var(--paper)', () => ({ colour: 'var(--ink)', filter: L.file ? 'brightness(0)' : '' })],
      ];
      const rowH = variants.length > 3 ? 170 : 210;
      return contentPage(ctx, {
        id: 'variants', chapter: 'Logo', title: 'Variants on backgrounds', n, centre: true,
        rail: railText(
          `Each recorded variant on the four grounds it will meet: the page, the brand colour, a dark surface and one colour.`,
          L.file ? 'On the brand colour, on dark and in one colour the artwork is shown as a silhouette made by filter, for reference only. Use the supplied reversed and one-colour artwork in production, never a filter.' : esc(L.typesetNote),
          has(logo.monochrome?.rule) ? `<strong>One colour.</strong> ${esc(logo.monochrome.rule)}` : null,
        ),
        canvas: `<div style="display:flex;flex-direction:column;gap:14px">
          <div style="display:grid;grid-template-columns:200px repeat(4,minmax(0,1fr));gap:0 4px"><span></span>${grounds.map(([g]) => `<span class="label">${g}</span>`).join('')}</div>
          ${variants.slice(0, 4).map((v) => {
            const file = v.file && (ctx.assets[v.file] || Object.keys(ctx.assets).find((k) => k.endsWith(`/${v.file}`)));
            const shown = file ? ctx.assets[file === true ? v.file : file] ?? ctx.assets[v.file] : null;
            const reversed = Boolean(shown) && /revers|knock|white|inverse/i.test(String(v.name ?? ''));
            const draw = (opts) => (shown
              ? `<span class="mark" role="img" aria-label="${esc(v.name ?? name)}" style="height:${Math.round(Math.min(72, 240 / (shown.kind === 'svg' ? svgAspect(shown.markup) : 3)))}px;width:${Math.round(Math.min(72 * (shown.kind === 'svg' ? svgAspect(shown.markup) : 3), 240))}px;${opts.filter ? `filter:${opts.filter};` : ''}${opts.colour ? `color:${opts.colour};` : ''}">${shown.markup}</span>`
              : L.at(64, { ...opts, maxW: 180 }));
            const fallback = !shown && v.file && L.file;
            return `<div style="display:grid;grid-template-columns:200px repeat(4,minmax(0,1fr));gap:0 4px;align-items:stretch">
              <div style="display:flex;flex-direction:column;justify-content:center;gap:4px;padding-right:16px"><strong style="font-size:16px">${esc(v.name ?? v)}</strong>${v.use ? `<span style="font-size:13px;color:var(--muted);line-height:1.3">${esc(v.use)}</span>` : ''}${fallback ? `<span class="todo" style="font-size:12px">[${PLACEHOLDER}: ${esc(v.file)} not on disk; primary shown]</span>` : ''}</div>
              ${grounds.map(([, g, optsFor], gi) => `<div data-ground="${['light', 'primary', 'dark', 'mono'][gi]}" style="background:${g};min-height:${rowH}px;display:flex;align-items:center;justify-content:center;padding:20px;overflow:hidden;border:1px solid var(--rule)">${draw(optsFor(reversed))}</div>`).join('')}
            </div>`;
          }).join('')}
        </div>`,
      });
    },
  });
  page({
    chapter: 'logo', id: 'colourways', title: 'Colourways',
    render: (n) => {
      const cw = ctx.colourways;
      const list = cw.approved;
      const rows = list.slice(0, 3);
      // The canvas column with its padding taken off, which is the space the
      // logo pages either side of this one fill. The proofs are sized to it
      // rather than to a fixed number, because one approved treatment has to
      // carry the page as well as three do and at a fixed size it did not.
      const BAND_W = PAGE_W - 560 - 96 - 72;
      const BAND_H = PAGE_H - 88 - 120;
      const NAME_W = 230;
      const LABEL_H = 34;
      // One treatment gets the hero arrangement: its name across the top, the
      // mark on its own ground at the size the logo page shows it, and the two
      // proofs stacked beside it. Three equal columns down the full height
      // would be three tall empty panels, because a mark in a 306px column
      // cannot grow to meet them however tall they are.
      const single = rows.length === 1;
      const spill = list.length > 3 ? 46 : 0;
      // The mark is as large as its ground will hold in both directions, so a
      // wordmark is limited by the width and a tall mark by the height.
      const aspect = ctx.logo.aspect ?? 3;
      // The small renders go in a strip of their own, the way the Colourways
      // board does it, rather than one 16 pixel object alone in a full column
      // the size of the ones beside it. They are at real size, so a wide mark
      // takes only the sizes that fit rather than being scaled down to fit.
      const STRIP_W = 200;
      const SIZES = [16, 32, 64].filter((_, i, all) => {
        const upto = all.slice(0, i + 1);
        return upto.reduce((w, px) => w + px * aspect, 0) + 14 * i + 32 <= STRIP_W;
      });
      const SIZE_WORDS = ['sixteen', 'thirty-two', 'sixty-four'];
      // The column headings are printed once above the rows, not on every row.
      const HEAD_H = LABEL_H;
      const rowH = Math.floor((BAND_H - spill - HEAD_H - 22 * (rows.length - 1)) / rows.length);
      const cellW = Math.floor((BAND_W - NAME_W - STRIP_W - 14 * 3) / 2);
      const HERO_H = BAND_H - 70;
      const heroW = Math.floor((BAND_W - 14) * 0.7);
      const sideW = BAND_W - 14 - heroW;
      const boxFor = (w, h) => Math.max(24, Math.round(Math.min(h - 50, (w - 50) / aspect)));
      const cell = (inner, bg, label, grow = 1) => `<div style="display:flex;flex-direction:column;gap:8px;flex:${grow};min-width:0;min-height:0">
        ${label ? `<span class="label">${esc(label)}</span>` : ''}
        <div style="background:${bg};border:1px solid var(--rule);flex:1;display:flex;align-items:center;justify-content:center;padding:24px">${inner}</div>
      </div>`;
      const draw = (markup, alt, box) => `<span class="mark" role="img" aria-label="${esc(alt)}" style="height:${box}px;width:${Math.round(box * aspect)}px;max-width:100%">${markup}</span>`;
      const tiny = (c) => `<span class="mark" role="img" aria-label="${esc(`${c.name}, at sixteen pixels`)}" style="height:16px;width:${Math.round(16 * aspect)}px">${c.markup}</span>`;
      const strip = (c) => SIZES.map((px, i) => `<span class="mark" role="img" aria-label="${esc(`${c.name}, at ${SIZE_WORDS[i]} pixels`)}" style="flex:none;height:${px}px;width:${Math.round(px * aspect)}px">${c.markup}</span>`).join('');
      const sizeLabel = SIZES.length === 1
        ? '16 pixels'
        : `${SIZES.slice(0, -1).join(', ')} and ${SIZES[SIZES.length - 1]} pixels`;
      const ROW_COLS = `${NAME_W}px repeat(2,minmax(0,1fr)) ${STRIP_W}px`;
      const headRow = `            <div style="display:grid;grid-template-columns:${ROW_COLS};gap:0 14px;flex:none">
              <span></span><span class="label">On its ground</span><span class="label">Greyscale</span><span class="label">${esc(sizeLabel)}</span>
            </div>`;
      const nameCol = (c) => `<div style="display:flex;flex-direction:column;justify-content:center;gap:6px;padding-right:16px">
                <strong style="font-size:19px">${esc(c.name)}</strong>
                <span style="font-size:13px;color:var(--muted);line-height:1.35">${esc(c.mapping)}${c.ground ? `<br>on ${esc(c.ground)}` : ''}</span>
              </div>`;
      const nameLine = (c) => `<div style="display:flex;align-items:baseline;gap:18px;flex-wrap:wrap">
              <strong style="font-size:24px">${esc(c.name)}</strong>
              <span style="font-size:14px;color:var(--muted)">${esc(c.mapping)}${c.ground ? `, on ${esc(c.ground)}` : ''}</span>
            </div>`;
      return contentPage(ctx, {
        id: 'colourways', chapter: 'Logo', title: 'Colourways', n, centre: true,
        rail: railText(
          'A colourway is recorded as a mapping from the inks the mark was drawn in to roles in this palette, never as fixed colours, so every treatment moves when the palette moves.',
          'Colour came after the silhouette was approved, and it may not carry meaning the silhouette cannot carry alone. Each treatment is shown beside its own greyscale and at sixteen pixels for exactly that reason: if the mark stops being the mark as you move right, the colour was doing the shape\'s job.',
          list.length ? `Approved by ${esc([...new Set(list.map((c) => c.approvedBy))].join(', '))}.` : null,
          cw.problems?.length ? `<span class="todo">[${PLACEHOLDER}: ${esc(cw.problems[0])}]</span>` : null,
        ),
        canvas: list.length
          ? `<div style="display:flex;flex-direction:column;gap:22px;flex:1;min-height:0">
${single ? '' : `${headRow}\n`}${rows.map((c) => (single
            ? `            ${nameLine(c)}
            <div style="display:grid;grid-template-columns:7fr 3fr;gap:0 14px;align-items:stretch;flex:1;min-height:0">
              ${cell(draw(c.markup, c.name, boxFor(heroW, HERO_H - LABEL_H)), c.groundHex ?? 'var(--paper)', 'On its ground')}
              <div style="min-width:0;display:flex;flex-direction:column;gap:14px">
                ${cell(draw(c.grey, `${c.name}, greyscale`, boxFor(sideW, (HERO_H - 14) * 0.75 - LABEL_H)), c.greyGroundHex ?? 'var(--paper)', 'Greyscale', 3)}
                ${cell(tiny(c), c.groundHex ?? 'var(--paper)', '16 pixels', 1)}
              </div>
            </div>`
            : `            <div style="display:grid;grid-template-columns:${ROW_COLS};gap:0 14px;align-items:stretch;flex:1;min-height:0">
              ${nameCol(c)}
              ${cell(draw(c.markup, c.name, boxFor(cellW, rowH)), c.groundHex ?? 'var(--paper)', null)}
              ${cell(draw(c.grey, `${c.name}, greyscale`, boxFor(cellW, rowH)), c.greyGroundHex ?? 'var(--paper)', null)}
              ${cell(`<div style="display:flex;align-items:center;justify-content:center;gap:14px;width:100%">${strip(c)}</div>`, c.groundHex ?? 'var(--paper)', null)}
            </div>`)).join('\n')}
${list.length > 3 ? `            <p style="font-size:15px;color:var(--muted)">${list.length - 3} more approved ${list.length - 3 === 1 ? 'treatment is' : 'treatments are'} recorded and not drawn here: ${esc(list.slice(3).map((c) => c.name).join(', '))}. The asset pack carries every one of them.</p>` : ''}
          </div>`
          : `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px;max-width:60ch">
            <p style="font-size:26px;line-height:1.4">${todo(`an approved colourway; ${esc(cw.why)}`)}</p>
            <p style="font-size:20px;line-height:1.5;color:var(--muted)">Until one is approved the mark is used in the variants on the previous page. Colour is a stage, not a setting: it opens once a person has approved the silhouette, and the treatments are dealt from this palette rather than chosen by eye.</p>
            <p style="font-size:20px;line-height:1.5;color:var(--muted)">Run <span class="mono">brandi logo colour plan</span>, look at the boards, then <span class="mono">brandi logo colour approve &lt;id&gt; --approved-by "name"</span>.</p>
          </div>`,
      });
    },
  });
  page({
    chapter: 'logo', id: 'clear-space', title: 'Clear space',
    render: (n) => {
      const H = 180;
      const ratio = L.file ? 0.5 : 0.72;
      const X = Math.round(H * ratio);
      const box = (extra) => `<span style="position:absolute;width:${X}px;height:${X}px;background:${r('control.bg-active')};${extra}"></span>`;
      return contentPage(ctx, {
        id: 'clear-space', chapter: 'Logo', title: 'Clear space', n,
        rail: railText(
          has(logo.clearSpace) ? esc(logo.clearSpace) : todo('a clear space rule, expressed as an element of the mark so it scales'),
          'Nothing enters the clear space: no type, no rule, no edge of a photograph, no other logo. It is a minimum, and more is always allowed.',
          `<span class="mono">X is drawn at ${ratio} of the mark height for this diagram${L.file ? '' : ', an approximation of the cap height'}. The rule in words is what binds; measure it against the outlined artwork before it reaches a signwriter.</span>`,
        ),
        canvas: `<div style="flex:1;display:flex;align-items:center;justify-content:center">
          <div style="position:relative;display:inline-block;padding:${X}px;border:1px dashed var(--accent)">
            ${box(`top:0;left:50%;margin-left:-${Math.round(X / 2)}px`)}${box(`bottom:0;left:50%;margin-left:-${Math.round(X / 2)}px`)}${box(`left:0;top:50%;margin-top:-${Math.round(X / 2)}px`)}${box(`right:0;top:50%;margin-top:-${Math.round(X / 2)}px`)}
            <span class="mono" style="position:absolute;top:${Math.round(X / 2) - 8}px;left:50%;margin-left:${Math.round(X / 2) + 10}px;color:var(--muted)">X</span>
            <span class="mono" style="position:absolute;left:${Math.round(X / 2) - 6}px;top:50%;margin-top:${Math.round(X / 2) + 6}px;color:var(--muted)">X</span>
            <div style="border:1px solid var(--rule);display:inline-flex;align-items:center;justify-content:center;height:${H}px;padding:0 16px">${L.at(H * 0.8, { maxW: 700 })}</div>
          </div>
        </div>`,
      });
    },
  });
  page({
    chapter: 'logo', id: 'minimum-size', title: 'Minimum size',
    render: (n) => {
      const sizes = has(logo.minSizes) ? logo.minSizes : [];
      const preferred = sizes.find((m) => /primary/i.test(m.variant ?? '')) ?? sizes[0] ?? null;
      const general = logo.minSize ?? null;
      const pref = preferred ? { px: preferred.screenPx, mm: preferred.printMm, basis: preferred.basis, label: preferred.variant } : null;
      const abs = general && (general.screenPx || general.printMm) && (!pref || general.screenPx !== pref.px) ? { px: general.screenPx, mm: general.printMm } : null;
      const floorPx = Number(pref?.px ?? abs?.px ?? 0) || null;
      // The recorded figure is applied to the mark's longer side: the width of
      // a horizontal lockup, the height of a stacked one. A wordmark measured
      // by its height would be several times the size anyone meant.
      const wide = (L.aspect ?? 3) >= 1.5;
      const side = wide ? 'wide' : 'high';
      const draw = (px) => (wide ? L.atWidth(Math.min(px, 1100)) : L.at(Math.min(px, 600)));
      // Multipliers chosen so a 140px floor runs in one line across the canvas.
      const ladder = floorPx ? [2.5, 1.75, 1.25, 1].map((k) => Math.round(floorPx * k)) : [350, 245, 175, 140];
      const stepAt = (px) => `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px">${draw(px)}<span class="mono" style="color:var(--muted)">${px}px ${side}</span></div>`;
      return contentPage(ctx, {
        id: 'minimum-size', chapter: 'Logo', title: 'Minimum size', n,
        rail: railText(
          `Below these sizes the counters close and the detail goes. The recorded figure is the mark's ${wide ? 'width' : 'height'}, shown here in screen pixels at actual size; the print figure is the same measure in millimetres.`,
          pref ? `<strong>Preferred minimum${pref.label ? ` (${esc(pref.label)})` : ''}.</strong> ${pref.mm ? `${esc(pref.mm)}mm` : ''}${pref.mm && pref.px ? ' / ' : ''}${pref.px ? `${esc(pref.px)}px` : ''} ${side}.${pref.basis ? ` ${esc(pref.basis)}` : ''}` : todo('a preferred minimum size in mm and px (identity.logo.minSizes)'),
          abs ? `<strong>Absolute minimum.</strong> ${abs.mm ? `${esc(abs.mm)}mm` : ''}${abs.mm && abs.px ? ' / ' : ''}${abs.px ? `${esc(abs.px)}px` : ''} ${side}.` : todo('an absolute minimum size (identity.logo.minSize)'),
          sizes.length > 1 ? `<span class="mono">Other variants: ${sizes.filter((m) => m !== preferred).map((m) => `${esc(m.variant)} ${m.printMm ? `${m.printMm}mm` : ''}${m.printMm && m.screenPx ? ' / ' : ''}${m.screenPx ? `${m.screenPx}px` : ''}`).join('; ')}.</span>` : null,
        ),
        canvas: `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:40px">
          <div class="ladder" style="display:flex;align-items:flex-end;gap:32px 36px;flex-wrap:wrap">
            ${ladder.map(stepAt).join('')}
            ${abs?.px ? `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px;border-left:2px solid var(--accent);padding-left:16px">${draw(Number(abs.px))}<span class="mono" style="color:var(--muted)">absolute<br>${abs.px}px${abs.mm ? ` / ${abs.mm}mm` : ''}</span></div>` : ''}
          </div>
          ${pref?.px ? `<p class="mono" style="color:var(--muted);border-top:1px solid var(--rule);padding-top:16px">The preferred minimum is the last step of the ladder: ${pref.px}px${pref.mm ? ` / ${pref.mm}mm` : ''}. Nothing is drawn smaller than the absolute minimum, marked in orange.</p>` : ''}
        </div>`,
      });
    },
  });
  const misuse = has(logo.misuse) ? logo.misuse : [];
  page({
    chapter: 'logo', id: 'misuse', title: 'Logo misuse',
    render: (n) => {
      const tiles = logoMisuseTiles(ctx, misuse);
      return contentPage(ctx, {
        id: 'misuse', chapter: 'Logo', title: 'Logo misuse', n, centre: true,
        rail: railText(
          'Drawn, not described, because a rule somebody has seen broken is a rule they remember.',
          tiles.count ? `${tiles.count} misuses recorded.${tiles.count < 6 ? ` Six is the floor, because below that people invent their own. ${todo('at least six specific misuses')}` : ''}` : todo('at least six specific misuses, because people invent their own otherwise'),
        ),
        canvas: tiles.html,
      });
    },
  });
  const cob = logo.cobranding;
  page({
    chapter: 'logo', id: 'cobranding', title: 'Co-branding',
    render: (n) => {
      // The gap is drawn as a measuring element, the way the clear-space page
      // draws X: a recorded pixel value is drawn at that width, and a gap
      // expressed as an element of the mark is drawn at the same X as clear
      // space and labelled with the rule in words.
      const H = 120;
      const gapPx = /(\d+(?:\.\d+)?)\s*px/i.exec(String(cob?.gap ?? ''));
      const X = gapPx ? Math.round(Number(gapPx[1])) : Math.round(H * (L.file ? 0.5 : 0.72));
      const align = /baseline|bottom|foot/i.test(String(cob?.alignment ?? '')) ? 'flex-end' : /top|cap/i.test(String(cob?.alignment ?? '')) ? 'flex-start' : 'center';
      return contentPage(ctx, {
        id: 'cobranding', chapter: 'Logo', title: 'Co-branding', n, centre: true,
        rail: railText(
          has(cob?.rule) ? esc(cob.rule) : todo('a co-branding rule (identity.logo.cobranding.rule): how the mark sits beside a partner logo, what aligns to what, and the gap between them'),
          has(cob?.alignment) ? `<strong>Alignment.</strong> ${esc(cob.alignment)}` : null,
          has(cob?.gap) ? `<strong>Gap.</strong> ${esc(cob.gap)}` : null,
          has(cob?.partnerMax) ? `<strong>Partner size.</strong> ${esc(cob.partnerMax)}` : null,
          `<span class="mono">The gap is drawn ${gapPx ? `at the recorded ${X}px` : `at ${L.file ? 0.5 : 0.72} of the mark height, the same X as the clear-space page`}; the rule in words binds.</span>`,
        ),
        canvas: `<div style="display:flex;align-items:${align};gap:0;border:1px dashed var(--accent);padding:${X}px;align-self:flex-start">
          ${L.at(H, { maxW: 520 })}
          <span class="cobranding-gap" data-gap="${X}" style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-end;width:${X}px;height:${H}px;background:${r('control.bg-active')};flex:none"><span class="mono" style="color:var(--muted);transform:translateY(${X > 40 ? 0 : 28}px)">${gapPx ? `${X}px` : 'X'}</span></span>
          <span style="display:inline-flex;align-items:center;justify-content:center;width:${Math.round(H * 3)}px;height:${H}px;border:1px dashed var(--rule);color:var(--muted)" class="mono">[PARTNER LOGO${has(cob?.partnerMax) ? `, ${esc(cob.partnerMax)}` : ''}]</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px"><span class="mono" style="color:var(--muted)">${has(cob?.alignment) ? `Alignment: ${esc(cob.alignment)}.` : 'Aligned on the centre line until an alignment is recorded.'}</span></div>
        ${has(cob?.rule) ? '' : `<p class="mono" style="color:var(--muted)">Until the rule is decided, partner lockups are made by hand and approved by ${esc(brand.meta?.owner ?? 'the brand owner')}.</p>`}`,
      });
    },
  });
  const tagline = voice.tagline?.line ?? msg.tagline ?? null;
  // The recorded rule decides whether a lockup is drawn at all. A boolean
  // `voice.tagline.locked` wins; otherwise the sentence is read for a refusal.
  const lockupForbidden = voice.tagline?.locked === false
    || (voice.tagline?.locked !== true && /\bnever\b|not locked|no lockup|does not lock|never locked/i.test(String(voice.tagline?.lockup ?? '')));
  page({
    chapter: 'logo', id: 'tagline-lockup', title: lockupForbidden ? 'Tagline' : 'Tagline lockup',
    ...(has(tagline) ? {} : absent('Tagline lockup', 'a tagline')),
    render: (n) => contentPage(ctx, {
      id: 'tagline-lockup', chapter: 'Logo', title: lockupForbidden ? 'Tagline' : 'Tagline lockup', n, centre: true,
      rail: railText(
        has(voice.tagline?.lockup) ? esc(voice.tagline.lockup) : lockupForbidden ? 'The tagline is never locked to the mark.' : todo('how the tagline locks up with the mark (voice.tagline.lockup)'),
        lockupForbidden ? '<strong>No lockup.</strong> The tagline stands alone in headline position, as shown. Nothing on this page may be reproduced with the mark attached to it.' : null,
        has(voice.tagline?.usage) ? `<strong>Where.</strong> ${esc(voice.tagline.usage)}` : null,
      ),
      canvas: lockupForbidden
        ? `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:32px">
        <span class="label">Headline position, alone</span>
        <p class="big" style="font-size:96px;max-width:14ch">${esc(tagline ?? '')}</p>
      </div>`
        : `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:64px">
        <div><span class="label">Large format</span><div style="display:flex;flex-direction:column;align-items:flex-start;gap:20px;margin-top:16px">${L.at(120, { maxW: 900 })}<span style="font-family:var(--display);font-size:34px;letter-spacing:-0.01em">${esc(tagline ?? '')}</span></div></div>
        <div><span class="label">Small format</span><div style="display:flex;align-items:center;gap:32px;margin-top:16px">${L.at(64, { maxW: 420 })}<span style="font-family:var(--display);font-size:24px;letter-spacing:-0.01em;max-width:18ch;line-height:1.15">${esc(tagline ?? '')}</span></div></div>
      </div>`,
    }),
  });
  const favicon = logo.favicon && ctx.assets[logo.favicon] ? ctx.assets[logo.favicon] : null;
  page({
    chapter: 'logo', id: 'favicon', title: 'Favicon and app icon',
    ...(favicon || has(logo.favicon) ? {} : absent('Favicon and app icon', 'a favicon file')),
    render: (n) => contentPage(ctx, {
      id: 'favicon', chapter: 'Logo', title: 'Favicon and app icon', n,
      centre: true,
      rail: railText(
        favicon ? `${esc(logo.favicon)}. Shown at 16, 32, 64 and 180 pixels, which are the sizes a browser tab, a bookmark, a dock and a home screen actually use, and once large so the detail can be checked.` : todo(`the favicon artwork; ${esc(logo.favicon ?? 'no path recorded')} is recorded but not on disk`),
      ),
      canvas: `<div style="display:flex;align-items:flex-end;gap:64px">
        <div style="display:flex;flex-direction:column;gap:12px;align-items:center">
          <span style="width:480px;height:480px;display:inline-flex;overflow:hidden;border-radius:${Math.round(480 * 0.22)}px;background:${favicon ? 'transparent' : 'var(--tint)'};border:1px solid var(--rule)" class="mark">${favicon ? favicon.markup : ''}</span>
          <span class="mono" style="color:var(--muted)">shown at 480px for detail</span>
        </div>
        <div style="display:flex;align-items:flex-end;gap:48px;padding-bottom:36px">
        ${[16, 32, 64, 180].map((px) => `<div style="display:flex;flex-direction:column;gap:10px;align-items:center">
          <span style="width:${px}px;height:${px}px;display:inline-flex;overflow:hidden;border-radius:${Math.round(px * 0.22)}px;background:${favicon ? 'transparent' : 'var(--tint)'};border:1px solid var(--rule)" class="mark">${favicon ? favicon.markup : ''}</span>
          <span class="mono" style="color:var(--muted)">${px}px</span>
        </div>`).join('')}
        </div>
      </div>`,
    }),
  });

  // --- 3. Colour ------------------------------------------------------------
  // A recorded Pantone value already says "PMS"; the template says it once.
  const pms = (v) => String(v).replace(/^\s*(PMS|Pantone)\s+/i, '');
  page({ chapter: 'colour', divider: true });
  page({
    chapter: 'colour', id: 'primary-palette', title: 'Primary palette',
    render: (n) => {
      const sw = system.print.swatches;
      const familyOf = (role) => role.split('.')[0];
      const ramp = (fam) => (system.palettes[fam] ?? system.palettes.brand).light.steps;
      // A placeholder on a colour block takes the block's text colour; the
      // muted grey all but disappears on the accent and on ink.
      const onBlock = (html) => html.replace('class="todo"', 'class="todo" style="color:inherit;opacity:.8"');
      const prettyRole = (role) => role.replace('brand.solid', 'Brand').replace(/^accent(\d+)\.solid$/, 'Accent $1').replace('neutral.paper', 'Paper').replace('neutral.ink', 'Ink');
      return `<section class="page" id="primary-palette">
  <div style="display:grid;grid-template-columns:repeat(${sw.length},minmax(0,1fr));width:100%;height:100%">
    ${sw.map((w, i) => {
      const fg = bestTextOn(w.hex).color;
      const steps = ramp(familyOf(w.role));
      const tints = /neutral/.test(w.role) ? [] : steps.slice(0, 8);
      return `<div style="display:flex;flex-direction:column;background:${w.hex};color:${fg}">
        <div style="flex:1;padding:88px 40px 40px;display:flex;flex-direction:column;justify-content:space-between">
          ${i === 0 ? '<h1 style="font-size:36px">Primary palette</h1>' : '<span></span>'}
          <div style="display:flex;flex-direction:column;gap:14px">
            <h2 style="font-size:44px">${esc(prettyRole(w.role))}</h2>
            <div class="mono" style="display:flex;flex-direction:column;gap:5px;font-size:14px;opacity:.95;min-height:150px">
              <span>HEX ${esc(w.hex)}</span>
              <span>RGB ${rgbOf(w.hex)}</span>
              <span>CMYK ${esc(w.cmykString)}${w.computed ? ' (computed)' : ''}</span>
              <span>PMS ${w.pantoneCoated ? esc(pms(w.pantoneCoated)) : onBlock(todo('coated match'))} / ${w.pantoneUncoated ? esc(pms(w.pantoneUncoated)) : onBlock(todo('uncoated match'))}</span>
            </div>
          </div>
        </div>
        ${tints.length ? `<div style="display:grid;grid-template-columns:repeat(${tints.length},1fr);height:120px">${tints.map((t) => `<div style="background:${t.hex};display:flex;align-items:flex-end;padding:6px 4px"><span class="mono" style="font-size:10px;color:${bestTextOn(t.hex).color}">${t.step}</span></div>`).join('')}</div>` : '<div style="height:120px"></div>'}
        <div style="height:96px"></div>
      </div>`;
    }).join('')}
  </div>
  ${footer({ ...ctx, footerColour: bestTextOn(sw.at(-1).hex).color }, 'Colour', n, { left: bestTextOn(sw[0].hex).color, centre: sw.length % 2 ? bestTextOn(sw[Math.floor(sw.length / 2)].hex).color : false, right: bestTextOn(sw.at(-1).hex).color })}
</section>`;
    },
  });
  page({
    chapter: 'colour', id: 'production', title: 'Colour off the screen',
    render: (n) => {
      const print = system.print;
      const dash = '<span style="color:var(--muted)">-</span>';
      const cell = (v) => (v ? esc(v) : dash);
      const unverified = print.swatches.filter((w) => !w.verified).map((w) => w.role);
      return contentPage(ctx, {
        id: 'production', chapter: 'Colour', title: 'Colour off the screen', n, centre: true,
        rail: railText(
          'For the printer, the signwriter and the embroiderer. A screen value is a suggestion to them; these are the matches somebody has to have held next to a guide.',
          has(id.colour?.print?.profile) ? `<strong>Separation.</strong> ${esc(id.colour.print.profile)}` : todo('a separation profile (identity.colour.print.profile); ask the printer which one they run'),
          `<span class="mono">${esc(print.caveat)}</span>`,
          unverified.length ? `<strong>Unverified.</strong> ${unverified.map(esc).join(', ')}. Verified means a printed proof was held next to a guide, not that a number was typed in.` : null,
        ),
        canvas: `<table style="font-size:15px"><thead><tr><th></th><th>Role</th><th>Hex</th><th>CMYK</th><th>Pantone C</th><th>Pantone U</th><th>RAL</th><th>Vinyl</th><th>Thread</th></tr></thead><tbody>
          ${print.swatches.map((w) => `<tr>
            <td style="width:44px"><span style="display:block;width:32px;height:32px;background:${esc(w.hex)};border:1px solid var(--rule);border-radius:var(--radius)"></span></td>
            <td class="mono">${esc(w.role)}</td><td class="mono">${esc(w.hex)}</td>
            <td class="mono">${esc(w.cmykString)}${w.computed ? ' <span style="color:var(--muted)">computed</span>' : ''}</td>
            <td class="mono">${w.pantoneCoated ? esc(pms(w.pantoneCoated)) : dash}</td><td class="mono">${w.pantoneUncoated ? esc(pms(w.pantoneUncoated)) : dash}</td>
            <td class="mono">${cell(w.ral)}</td><td class="mono">${cell(w.vinyl)}</td><td class="mono">${cell(w.thread)}</td>
          </tr>`).join('')}
        </tbody></table>
        ${print.swatches.filter((w) => w.note).map((w) => `<p style="font-size:15px;color:var(--muted)"><span class="mono">${esc(w.role)}</span> ${esc(w.note)}</p>`).join('')}
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
          <h2 style="font-size:26px">Chart colour</h2>
          <p style="font-size:15px;color:var(--muted);max-width:70ch">${esc(system.dataViz.note)}</p>
          <div style="display:grid;grid-template-columns:repeat(${system.dataViz.categorical.length},1fr);gap:4px">${system.dataViz.categorical.map((h) => `<div style="height:72px;background:${esc(h)};display:flex;align-items:flex-end;padding:6px"><span class="mono" style="font-size:11px;color:${bestTextOn(h).color}">${esc(h)}</span></div>`).join('')}</div>
        </div>`,
      });
    },
  });
  page({
    chapter: 'colour', id: 'ramps', title: 'Extended ramps',
    render: (n) => contentPage(ctx, {
      id: 'ramps', chapter: 'Colour', title: 'Extended ramps', n, centre: true,
      rail: railText(
        'Twelve steps per family. Steps 1 and 2 are backgrounds, 3 to 5 are fills, 6 to 8 are borders, 9 is the colour itself and 10 its hover, 11 and 12 carry text.',
        has(id.colour?.ratio) ? `<strong>Proportion.</strong> ${esc(id.colour.ratio)}` : null,
      ),
      canvas: `<div style="display:flex;flex-direction:column;gap:18px">
        ${Object.entries({ ...system.palettes, ...system.status }).map(([fam, pal]) => `<div style="display:flex;flex-direction:column;gap:6px">
          <span class="label">${esc(fam)}</span>
          <div style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:2px">${pal.light.steps.map((s) => `<div style="background:${s.hex};height:${Object.keys(system.status).length + Object.keys(system.palettes).length > 6 ? 72 : 88}px;display:flex;align-items:flex-end;padding:4px"><span class="mono" style="font-size:9px;color:${bestTextOn(s.hex).color}">${s.hex}</span></div>`).join('')}</div>
        </div>`).join('')}
      </div>`,
    }),
  });
  page({
    chapter: 'colour', id: 'colour-usage', title: 'Colour usage',
    render: (n) => {
      const groups = [
        ['Text', ['text.primary', 'text.secondary', 'text.brand', 'text.link', 'text.inverted']],
        ['Fills', ['surface.page', 'surface.subtle', 'surface.raised', 'surface.inverted', 'accent.bg', 'control.bg']],
        ['Accents', ['accent.solid', 'accent.solid-hover', 'accent.solid-strong', 'accent.border', 'focus.ring']],
        ['Utility', ['success.solid', 'warning.solid', 'danger.solid', 'info.solid']],
      ];
      return contentPage(ctx, {
        id: 'colour-usage', chapter: 'Colour', title: 'Colour usage', n, centre: true,
        rail: railText('By role, from the semantic tokens. Build with these names, never with a raw ramp step: a token can move when the palette moves, a hex cannot.'),
        canvas: `<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:32px">
          ${groups.map(([t, keys]) => `<div style="display:flex;flex-direction:column;gap:18px"><h2 style="font-size:30px">${t}</h2>
            ${keys.filter((k) => system.semantic.light[k] != null).map((k) => `<div style="display:flex;align-items:center;gap:16px"><span style="width:88px;height:88px;flex:none;background:${r(k)};border:1px solid var(--rule);border-radius:var(--radius)"></span><div style="display:flex;flex-direction:column;gap:4px"><span class="mono" style="font-size:15px">--${k.replace('.', '-')}</span><span class="mono" style="color:var(--muted);font-size:14px">${r(k)}</span></div></div>`).join('')}
          </div>`).join('')}
        </div>`,
      });
    },
  });
  page({
    chapter: 'colour', id: 'pairings', title: 'Colour pairings',
    render: (n) => {
      const m = pairingMatrix(system);
      // A cross drawn in a text colour that fails on its ground is, by
      // definition, hard to see there; it gets an outline in the ground's own
      // best text colour so the verdict stays legible.
      const glyph = (ok, text, bg) => (ok
        ? tick(text, 30)
        : cross(text, 30, contrastRatio(text, bg) < 3 ? bestTextOn(bg).color : null));
      const cellH = Math.max(64, Math.floor(700 / (m.colours.length + 1)));
      return contentPage(ctx, {
        id: 'pairings', chapter: 'Colour', title: 'Colour pairings', n, centre: true,
        rail: railText(
          'Text colours as rows, backgrounds as columns. A tick means the pair clears WCAG 2.2 AA for normal text (4.5:1), measured when this deck was generated, not asserted.',
          m.neverText.length ? `<strong>${m.neverText.map(esc).join(' and ')} ${m.neverText.length > 1 ? 'are' : 'is'} not to be used for text under any circumstances.</strong>` : 'Every colour here can carry text on at least one background.',
        ),
        // A real table with row and column headers, because the verdict has to
        // reach a screen reader as well as an eye. Each cell also carries the
        // word, hidden: the glyph is a drawn path (so the PDF needs no embedded
        // symbol font) and a drawn path has no accessible name of its own.
        // The wrapper scrolls rather than the page: nine columns at 390px is
        // wider than a phone, and a page that scrolls sideways was R2-N-10.
        canvas: `<div style="overflow-x:auto;max-width:100%;min-width:0">
        <table class="pairing pairing-matrix" style="width:100%">
          <caption class="sr-only">Which text colour clears WCAG 2.2 AA for normal text on which background</caption>
          <thead><tr>
            <th scope="col" style="width:150px"><span class="sr-only">Text colour</span><span class="label" aria-hidden="true">Text on</span></th>
            ${m.colours.map((c) => `<th scope="col" style="background:${c.hex};color:${bestTextOn(c.hex).color};height:56px">${esc(c.name)}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${m.colours.map((text, i) => `<tr>
              <th scope="row" style="background:${text.hex};color:${bestTextOn(text.hex).color}">${esc(text.name)}</th>
              ${m.cells[i].map((ok, j) => `<td data-pair="${ok ? 'pass' : 'fail'}" style="background:${m.colours[j].hex};height:${cellH}px">${glyph(ok, text.hex, m.colours[j].hex)}<span class="sr-only">${ok ? 'passes' : 'fails'}</span></td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
        </div>`,
      });
    },
  });
  if (system.semantic.dark) {
    const rd = (k) => resolveToken(system.semantic.dark[k], system, 'dark');
    page({
      chapter: 'colour', id: 'scalability', title: 'Dial up, dial down',
      render: (n) => `<section class="page" id="scalability">
  <div style="display:grid;grid-template-columns:560px 1fr 1fr;width:100%;height:100%">
    <div class="rail">
      <h1>Dial up, dial down</h1>
      <p>The same palette carries two registers. Dialled up, the brand colour is the ground and the type sits on it. Dialled down, the dark surface takes over and the brand colour becomes an accent. Neither is a different brand.</p>
    </div>
    <div style="background:var(--primary);color:var(--on-primary);padding:96px 72px;display:flex;flex-direction:column;justify-content:space-between">
      <h2 style="font-size:34px">Dialled up</h2>
      <p class="big" style="font-size:64px">Type on the brand colour</p>
      <span class="mono" style="opacity:.85">ground ${tokens.primary} / type ${tokens.onPrimary}</span>
    </div>
    <div style="background:${rd('surface.page')};color:${rd('text.primary')};padding:96px 72px;display:flex;flex-direction:column;justify-content:space-between">
      <h2 style="font-size:34px">Dialled down</h2>
      <p class="big" style="font-size:64px;color:${rd('text.brand')}">Type in the brand tint</p>
      <span class="mono" style="opacity:.85">ground ${rd('surface.page')} / type ${rd('text.brand')}</span>
    </div>
  </div>
  ${footer({ ...ctx, footerColour: 'var(--ink)' }, 'Colour', n, { centre: false, right: rd('text.primary') })}
</section>`,
    });
  }

  // --- 4. Typography --------------------------------------------------------
  const fonts = system.type.fonts;
  const scale = system.type.scale;
  const licences = id.type?.licences ?? [];
  const licenceOf = (family) => licences.find((l) => String(l.family).toLowerCase() === String(family).toLowerCase());
  const specimenText = [voice.boilerplate?.words100, voice.boilerplate?.words50, st.narrative, voice.boilerplate?.words25, st.positioning].find(has) ?? null;
  const facePage = (idp, title, role, family, useRule) => ({
    chapter: 'typography', id: idp, title,
    ...(family ? {} : absent(title, `a ${role} typeface`)),
    render: (n) => {
      const lic = licenceOf(family);
      const stack = role === 'display' ? tokens.fonts.display : tokens.fonts.body;
      const fallback = stack.split(',').slice(1).join(',').trim();
      const lead = scale.byName['2xl'] ?? scale.steps.at(-1);
      const body = scale.byName.base;
      return contentPage(ctx, {
        id: idp, chapter: 'Typography', title, n,
        rail: railText(
          `<strong>${esc(family)} ${useRule}</strong>`,
          role === 'display'
            ? `Set at ${esc(lead.letterSpacing)} tracking and ${lead.lineHeight} line height at the page-heading size. Tighter as it gets larger.`
            : `Set at ${esc(body.letterSpacing)} tracking and ${body.lineHeight} line height at ${body.px}px. A measure of ${system.type.measure.chars} characters.`,
          lic ? `<strong>Licence.</strong> ${esc(lic.source ?? '')}${lic.permits ? `. ${esc(lic.permits)}` : ''}` : todo(`the licence for ${family}`),
          `<span class="mono">Fallback stack: ${esc(fallback)}</span>`,
        ),
        canvas: `<div style="display:flex;flex-direction:column;gap:36px;justify-content:center;height:100%">
          <p style="font-family:${stack};font-size:200px;line-height:1;letter-spacing:-0.03em;font-weight:${role === 'display' ? 700 : 400}">${esc(family)}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start">
            <p style="font-family:${stack};font-size:30px;line-height:1.3;word-break:break-all;font-weight:${role === 'display' ? 700 : 400}">AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 1234567890</p>
            <p style="font-family:${stack};font-size:18px;line-height:1.5">${specimenText ? esc(specimenText) : todo('a paragraph of real brand copy to set as the specimen (voice.boilerplate)')}</p>
          </div>
        </div>`,
      });
    },
  });
  page({ chapter: 'typography', divider: true });
  page(facePage('primary-typeface', 'Primary typeface', 'display', fonts.display, 'is used for headings and display.'));
  page(facePage('secondary-typeface', 'Secondary typeface', 'body', fonts.body, 'is used for body copy, sub-headings and interface text.'));
  page({
    chapter: 'typography', id: 'hierarchy', title: 'Typography hierarchy',
    render: (n) => {
      const quote = (voice.examples ?? []).map((e) => e.good).filter(Boolean)[0] ?? msg.primary ?? null;
      const rows = [
        ['Display', fonts.display, tokens.fonts.display, scale.byName['3xl']?.maxPx ?? 72, 700, msg.primary ?? st.purpose],
        ['Heading', fonts.display, tokens.fonts.display, scale.byName.xl?.maxPx ?? 40, 700, st.positioning ?? st.purpose],
        ['Subheading', fonts.body, tokens.fonts.body, scale.byName.lg?.maxPx ?? 28, 700, (st.audiences ?? [])[0]?.need ?? st.promise],
        ['Body', fonts.body, tokens.fonts.body, scale.byName.base?.maxPx ?? 17, 400, specimenText],
        ['Pull quote', fonts.display, tokens.fonts.display, scale.byName['2xl']?.maxPx ?? 48, 400, quote],
      ];
      return contentPage(ctx, {
        id: 'hierarchy', chapter: 'Typography', title: 'Typography hierarchy', n,
        rail: railText(
          'Hierarchy comes from face, size and weight together. The display face carries headings and pull quotes; the body face carries everything a reader has to get through.',
          `<strong>Do.</strong> Keep the main heading dominant, the subheading supportive and the body legible. Set columns in characters, not pixels.`,
          `<strong>Do not.</strong> Mix faces within one level, make two levels look alike, or carry hierarchy with colour alone.`,
        ),
        canvas: `<div style="display:flex;flex-direction:column;gap:22px;justify-content:center;height:100%">
          ${rows.map(([label, face, stack, px, weight, sample]) => `<div style="display:grid;grid-template-columns:180px minmax(0,1fr);gap:24px;align-items:baseline;border-bottom:1px solid var(--rule);padding-bottom:14px">
            <span class="mono" style="color:var(--muted)">${label}<br>${esc(face ?? '')} ${weight} / ${Math.round(px)}px</span>
            <p style="font-family:${stack};font-size:${Math.min(px, 64)}px;font-weight:${weight};line-height:1.15;letter-spacing:${px > 30 ? '-0.02em' : '0'};overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${has(sample) ? esc(sample) : todo(`copy for the ${label.toLowerCase()} sample`)}</p>
          </div>`).join('')}
        </div>`,
      });
    },
  });
  page({
    chapter: 'typography', id: 'type-scale', title: 'Type scale',
    render: (n) => {
      // The sample column is capped at SAMPLE_CAP so a 95px step does not
      // force the row wider than the page. The column head used to say the
      // samples were set at their desktop size while two of them were not:
      // the cap is stated where it applies, and nowhere else.
      const SAMPLE_CAP = 64;
      const capped = scale.steps.filter((s) => s.maxPx > SAMPLE_CAP);
      return contentPage(ctx, {
        id: 'type-scale', chapter: 'Typography', title: 'Type scale', n, centre: true,
        rail: railText(
          `A ${esc(scale.ratioName ? scale.ratioName.replace(/-/g, ' ') : scale.ratio)} scale from ${scale.basePx}px. Each step is fluid between the mobile and desktop sizes; the print size is the desktop size in points. Each step is set in its own face${capped.length ? '' : ' at its desktop size'}.`,
          capped.length ? `<span class="mono">The sample is shown at its desktop size up to ${SAMPLE_CAP}px. ${capped.map((s) => esc(s.name)).join(' and ')} ${capped.length > 1 ? 'are' : 'is'} larger than that, so ${capped.length > 1 ? 'those samples are' : 'that sample is'} drawn at ${SAMPLE_CAP}px to fit the row. The real size is in the Desktop column.</span>` : null,
          scale.dropped?.length ? `<span class="mono">Not issued: ${scale.dropped.map((d) => `${esc(d.name)} at ${d.px}px`).join(', ')}. A size nobody may responsibly use is not a size.</span>` : null,
          `<span class="mono">Weights: ${system.type.weights.map((w) => `${esc(w.name)} ${w.value}`).join(', ')}.</span>`,
        ),
        // Steps above the body size are display steps and are set in the
        // display face; the rest in the body face, as the hierarchy page does.
        canvas: `<table style="font-size:15px"><thead><tr><th>Step</th><th style="width:40%">${capped.length ? `Set in its own face, up to ${SAMPLE_CAP}px` : 'Set at its desktop size'}</th><th>Mobile</th><th>Desktop</th><th>Print</th><th>Line height</th><th>Tracking</th><th>Use</th></tr></thead><tbody>
        ${scale.steps.slice().reverse().map((s) => {
    const display = s.maxPx > (scale.byName.base?.maxPx ?? 17);
    return `<tr><td class="mono">${esc(s.name)}</td><td data-sample="${s.name}" data-drawn="${Math.min(s.maxPx, SAMPLE_CAP)}" style="font-family:${display ? tokens.fonts.display : tokens.fonts.body};font-weight:${display ? 700 : 400};font-size:${Math.min(s.maxPx, SAMPLE_CAP)}px;line-height:1.1;white-space:nowrap;padding:6px 12px 6px 0">${esc(name)}</td><td class="mono">${s.px}px</td><td class="mono">${s.maxPx}px</td><td class="mono">${(s.maxPx * 0.75).toFixed(1)}pt</td><td class="mono">${s.lineHeight}</td><td class="mono">${esc(s.letterSpacing)}</td><td style="font-size:14px">${esc(s.use)}</td></tr>`;
  }).join('')}
      </tbody></table>`,
      });
    },
  });
  page({
    chapter: 'typography', id: 'type-examples', title: 'Typography examples of use',
    render: (n) => {
      const cta = primaryButtonLabel(voice.mechanics?.buttons, null);
      const aud = (st.audiences ?? [])[0];
      const priceOrHours = (brand.applications ?? []).map((a) => a.hours ?? a.price ?? a.pricing).find(has) ?? null;
      const tile = (inner) => `<div class="card" style="min-height:300px;justify-content:center;gap:16px">${inner}</div>`;
      const tiles = [
        tile(`<p class="big" style="font-size:40px">${has(msg.primary) ? esc(msg.primary) : todo('the primary message')}</p>`),
        tile(`<span class="label">Section one</span><h3 style="font-size:26px">${aud?.name ? esc(aud.name) : todo('an audience')}</h3><p>${aud?.need ? esc(aud.need) : todo('what they need')}</p>`),
        tile(`<h3 style="font-size:30px">${has(st.promise) ? esc(st.promise) : todo('the promise')}</h3><span style="align-self:flex-start;background:var(--primary);color:var(--on-primary);padding:14px 24px;border-radius:var(--radius);font-weight:700;font-size:16px">${cta ? esc(cta) : todo('a button label (voice.mechanics.buttons)')}</span>`),
        tile(`<p style="font-size:18px;line-height:1.5">${has(voice.boilerplate?.words25) ? esc(voice.boilerplate.words25) : todo('the 25-word boilerplate')}</p>`),
        tile(`<span class="label">Price or hours</span><p style="font-size:18px">${priceOrHours ? esc(priceOrHours) : todo('a price or opening hours block; none recorded in the applications')}</p>`),
        tile(`<p style="font-family:var(--display);font-size:30px;line-height:1.2">${(voice.examples ?? []).map((e) => e.good).filter(Boolean)[1] ? esc((voice.examples ?? []).map((e) => e.good).filter(Boolean)[1]) : todo('a second voice example')}</p>`),
      ];
      return contentPage(ctx, {
        id: 'type-examples', chapter: 'Typography', title: 'Typography examples of use', n, centre: true,
        rail: railText('Six compositions from real brand copy: a headline, a section intro, a call to action, boilerplate, a data block and a quote. Conceptual, not final artwork.'),
        canvas: `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">${tiles.join('')}</div>`,
      });
    },
  });

  // --- 5. Brand assets ------------------------------------------------------
  const img = id.imagery ?? {};
  const ico = id.iconography ?? {};
  page({ chapter: 'assets', divider: true });
  page({
    chapter: 'assets', id: 'imagery', title: 'Imagery',
    render: (n) => {
      const shots = img.shotList?.length ? img.shotList : (brand.applications ?? [])
        .filter((a) => a && (a.surface || a.name))
        .map((a) => ({ shot: `[${String(a.name ?? a.surface).toUpperCase()}: the hero image for this surface]`, why: a.purpose ?? null, surface: a.name ?? a.surface }));
      return contentPage(ctx, {
        id: 'imagery', chapter: 'Brand assets', title: 'Imagery', n, centre: true,
        rail: railText(
          has(img.direction) ? esc(img.direction) : todo('an imagery direction'),
          has(img.treatment) ? `<strong>Treatment.</strong> ${esc(img.treatment)}` : null,
          img.rights?.ownership || img.rights?.modelReleases ? `<strong>Rights.</strong> ${esc(img.rights.ownership ?? '')} ${esc(img.rights.modelReleases ?? '')}` : todo('usage rights and model releases'),
        ),
        canvas: `<h2 style="font-size:36px">Shot list</h2>
        <p style="font-size:17px;color:var(--muted);max-width:60ch">${img.shotList?.length ? 'Recorded against the surfaces that need them.' : 'Derived from the applications, because every surface that carries an image needs one that exists. Bracketed because nothing has been shot yet.'}</p>
        ${shots.length ? `<table style="font-size:18px"><thead><tr><th>Surface</th><th>Shot</th><th>Why</th></tr></thead><tbody>${shots.slice(0, 8).map((sh) => `<tr><td style="padding:14px 16px 14px 0"><strong>${esc(sh.surface ?? '')}</strong></td><td style="padding:14px 16px 14px 0">${esc(sh.shot)}</td><td style="padding:14px 0;color:var(--muted)">${sh.why ? esc(sh.why) : ''}</td></tr>`).join('')}</tbody></table>` : `<p>${todo('a shot list')}</p>`}`,
      });
    },
  });
  page({
    chapter: 'assets', id: 'photography', title: 'Photography',
    ...(has(img.dos) || has(img.donts) ? {} : absent('Photography', 'photography rules')),
    // Each rule is a tile with its verdict drawn, the way the agency guides
    // set their yes / no grids. Text tiles, because nothing has been shot.
    render: (n) => {
      // Fewer rules get bigger tiles; a long list steps down so it stays on the page.
      const dense = Math.max((img.dos ?? []).length, (img.donts ?? []).length) > 4;
      const tiles = (items, ok, colour) => `<div style="display:flex;flex-direction:column;gap:${dense ? 10 : 16}px;margin-top:${dense ? 16 : 40}px">${items.map((d) => `<div class="card photo-tile" data-verdict="${ok ? 'yes' : 'no'}" style="background:transparent;border-color:${colour};color:${colour};flex-direction:row;align-items:flex-start;gap:16px;padding:${dense ? '16px 20px' : '28px'};min-height:${dense ? 0 : 120}px">${ok ? tick(colour, dense ? 22 : 28) : cross(colour, dense ? 22 : 28)}<p style="font-size:${dense ? 18 : 22}px;line-height:1.35;color:${colour}">${esc(d)}</p></div>`).join('')}</div>`;
      return `<section class="page" id="photography">
  <div style="display:grid;grid-template-columns:560px 1fr 1fr;width:100%;height:100%">
    <div class="rail"><h1>Photography</h1><p>What a photograph from this brand does, and what it never does. Anything not on the left is a question for whoever commissions the shoot.</p><p><span class="mono">Text tiles until the library has photographs to show.</span></p></div>
    <div style="background:var(--primary);color:var(--on-primary);padding:88px 64px 120px;display:flex;flex-direction:column;gap:28px">
      <h2 style="font-size:40px">Yes, use me</h2>
      ${has(img.dos) ? tiles(img.dos, true, 'var(--on-primary)') : `<p>${todo('what photography does')}</p>`}
    </div>
    <div style="background:var(--inverted);color:var(--on-inverted);padding:88px 64px 120px;display:flex;flex-direction:column;gap:28px">
      <h2 style="font-size:40px">Do not use me</h2>
      ${has(img.donts) ? tiles(img.donts, false, 'var(--on-inverted)') : `<p>${todo('what photography never does')}</p>`}
    </div>
  </div>
  ${footer({ ...ctx, footerColour: 'var(--ink)' }, 'Brand assets', n, { centre: false, right: 'var(--on-inverted)' })}
</section>`;
    },
  });
  if (has(id.illustration)) {
    const il = id.illustration;
    page({
      chapter: 'assets', id: 'illustration', title: 'Illustration',
      render: (n) => {
        const tile = (text, ok) => `<div class="card illustration-tile" data-verdict="${ok ? 'do' : 'dont'}" style="flex-direction:row;align-items:flex-start;gap:14px;padding:22px 24px;min-height:96px">${ok ? tick(tokens.pass, 24) : cross(tokens.fail, 24)}<p style="font-size:18px;line-height:1.4;color:var(--ink)">${esc(text)}</p></div>`;
        return contentPage(ctx, {
          id: 'illustration', chapter: 'Brand assets', title: 'Illustration', n, centre: true,
          rail: railText(has(il.style) ? esc(il.style) : todo('an illustration style'), 'Themes, and the rules, laid out as tiles so a stranger can hold a drawing against them.'),
          canvas: `${has(il.themes) ? `<div><h2 style="font-size:30px">Themes</h2><div style="display:grid;grid-template-columns:repeat(${Math.min(4, il.themes.length)},minmax(0,1fr));gap:16px;margin-top:16px">${il.themes.map((t) => `<div class="card illustration-theme" style="background:var(--tint);border-color:transparent;min-height:120px;justify-content:center;align-items:center;text-align:center"><p style="font-family:var(--display);font-size:24px;color:var(--ink);font-weight:700">${esc(t)}</p></div>`).join('')}</div></div>` : `<p>${todo('illustration themes (identity.illustration.themes)')}</p>`}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
            <div style="display:flex;flex-direction:column;gap:14px"><h2 style="font-size:30px">Do</h2>${has(il.dos) ? il.dos.map((d) => tile(d, true)).join('') : `<p>${todo('illustration dos')}</p>`}</div>
            <div style="display:flex;flex-direction:column;gap:14px"><h2 style="font-size:30px">Do not</h2>${has(il.donts) ? il.donts.map((d) => tile(d, false)).join('') : `<p>${todo('illustration do-nots')}</p>`}</div>
          </div>`,
        });
      },
    });
  }
  page({
    chapter: 'assets', id: 'icons', title: 'Icons',
    render: (n) => {
      const p = iconPrimitives({ grid: ico.grid, strokePx: ico.strokePx, style: ico.style, shape: system.meta.shape });
      const big = 432;
      const cell = big / p.grid;
      return contentPage(ctx, {
        id: 'icons', chapter: 'Brand assets', title: 'Icons', n, centre: true,
        rail: railText(
          has(ico.style) ? esc(ico.style) : todo('an icon style'),
          `Drawn on a ${p.grid}px grid at a ${p.stroke}px stroke with ${p.cap} terminals and ${p.join} corners. Icons are drawn, never typed: emoji render differently on every platform.`,
          has(ico.source) ? `<strong>Source.</strong> ${esc(ico.source)}` : null,
          has(ico.starterSet) ? `<strong>Starter set.</strong> ${esc(ico.starterSet)}` : null,
        ),
        canvas: `<div style="display:grid;grid-template-columns:${big}px minmax(0,1fr);gap:56px;align-items:center">
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="position:relative;width:${big}px;height:${big}px;background-image:linear-gradient(var(--rule) 1px,transparent 1px),linear-gradient(90deg,var(--rule) 1px,transparent 1px);background-size:${cell}px ${cell}px;border:1px solid var(--rule)">${p.draw(p.icons[0][1], big, tokens.ink)}</div>
            <span class="mono" style="color:var(--muted)">${p.grid}px grid, ${p.stroke}px stroke, shown at ${Math.round(big / p.grid)}x</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px">
            ${p.icons.map(([nm, d]) => `<div class="card" style="align-items:center;gap:18px;padding:40px 12px 24px">${p.draw(d, 72, tokens.ink)}<span class="mono" style="color:var(--muted);font-size:14px">${esc(nm)}</span></div>`).join('')}
          </div>
          <div style="grid-column:1 / -1;display:flex;gap:40px;align-items:center;margin-top:8px">
            ${[24, 32, 48].map((s) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px">${p.draw(p.icons[0][1], s, tokens.ink)}<span class="mono" style="color:var(--muted)">${s}px</span></div>`).join('')}
            <span style="font-size:15px;color:var(--muted);max-width:44ch">At actual size: ${p.grid}px is the smallest an icon is drawn at, and the stroke never thins below ${p.stroke}px.</span>
          </div>
        </div>`,
      });
    },
  });
  page({
    chapter: 'assets', id: 'shape', title: 'Shape and corners',
    render: (n) => {
      const radii = system.radius.filter((x) => x.name !== 'full');
      const mid = radii.find((x) => x.name === 'md') ?? radii[Math.floor(radii.length / 2)];
      const sharp = radii[0];
      const round = radii.at(-1);
      const trio = [['Too sharp', sharp], ['Just right', mid], ['Too curved', round]];
      return contentPage(ctx, {
        id: 'shape', chapter: 'Brand assets', title: 'Shape and corners', n,
        rail: railText(
          `<strong>${esc(system.meta.shape)}.</strong> ${esc(system.meta.shapeNote)}`,
          `Cards and controls take --radius-${esc(mid.name)} (${mid.px}px). A box nested inside another takes the outer radius minus the gap between them, or the inner corner reads as too round.`,
          `<span class="mono">Tokens: ${radii.map((x) => `${esc(x.name)} ${x.px}`).join(', ')}, full 9999.</span>`,
        ),
        canvas: `<div style="flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px;align-items:center">
          ${trio.map(([label, x], i) => `<div style="display:flex;flex-direction:column;gap:16px;align-items:center">
            <div style="width:100%;aspect-ratio:1;background:${i === 1 ? 'var(--primary)' : 'var(--tint)'};border-radius:${Math.min(x.px * 4, 200)}px;border:${i === 1 ? 'none' : '1px solid var(--rule)'}"></div>
            <h2 style="font-size:26px">${label}</h2><span class="mono" style="color:var(--muted)">--radius-${esc(x.name)} ${x.px}px, shown at 4x</span>
          </div>`).join('')}
        </div>`,
      });
    },
  });
  const move = (id.signatureMoves ?? [])[0];
  const diagram = move ? deviceDiagram(move) : null;
  page({
    chapter: 'assets', id: 'device', title: 'Supporting graphic device',
    ...(move ? {} : absent('Supporting graphic device', 'a signature move')),
    render: (n) => contentPage(ctx, {
      id: 'device', chapter: 'Brand assets', title: 'Supporting graphic device', n, centre: true,
      rail: railText(
        `<strong>${esc(move?.name ?? '')}.</strong> ${has(move?.howItWorks) ? esc(move.howItWorks) : ''}`,
        has(move?.brokenConvention) ? `<strong>What it breaks.</strong> ${esc(move.brokenConvention)}` : null,
        diagram ? `<span class="mono">The diagram is a literal picture of the recorded rule (${diagram.kind}), not artwork.</span>` : null,
      ),
      canvas: `<div style="display:grid;grid-template-columns:${diagram ? '560px minmax(0,1fr)' : '1fr'};gap:56px;align-items:center">
        ${diagram ? `<div>${diagram.svg}</div>` : ''}
        <div style="display:flex;flex-direction:column;gap:32px">
          <div><span class="label">The thing to build</span><p class="big" style="font-size:${diagram ? 32 : 40}px;margin-top:12px;max-width:26ch">${has(move?.primitive) ? esc(move.primitive) : todo('the primitive')}</p></div>
          <div><span class="label">Where it lands${move?.useSites?.length ? ` (${move.useSites.length})` : ''}</span><p style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${move?.useSites?.length ? move.useSites.map((u) => `<span class="pill">${esc(u)}</span>`).join('') : todo('use sites')}</p></div>
          ${(id.signatureMoves ?? []).length > 1 ? `<p style="color:var(--muted);font-size:15px">Also recorded: ${(id.signatureMoves ?? []).slice(1).map((m) => esc(m.name)).join(', ')}.</p>` : ''}
        </div>
      </div>`,
    }),
  });

  // --- 6. System ------------------------------------------------------------
  page({ chapter: 'system', divider: true });
  page({
    chapter: 'system', id: 'space-layout', title: 'Spacing and layout',
    render: (n) => {
      const bps = system.layout.breakpoints;
      const widest = Math.max(...bps.map((b) => b.px), system.layout.contentMaxPx);
      return contentPage(ctx, {
        id: 'space-layout', chapter: 'System', title: 'Spacing and layout', n, centre: true,
        rail: railText(
          `A ${system.meta.spaceBase}px base. Tokens are named by their pixel value, so --space-16 is 16px and needs no arithmetic.`,
          esc(system.layout.note),
          `<span class="mono">--content-max ${system.layout.contentMaxPx}px: the measure of ${system.type.measure.chars} characters plus a ${system.layout.gutterPx}px gutter each side.</span>`,
        ),
        canvas: `<h2 style="font-size:30px">Space <span class="mono" style="font-size:13px;color:var(--muted);font-weight:400">drawn at three quarters, so the whole scale fits on one line</span></h2>
        <div style="display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap">${system.space.filter((x) => x.px).map((x) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><span style="width:${Math.round(x.px * 0.75)}px;height:${Math.round(x.px * 0.75)}px;background:var(--tint);border:1px solid var(--rule)"></span><span class="mono" style="font-size:12px">${x.px}</span></div>`).join('')}</div>
        <h2 style="font-size:30px;margin-top:16px">Breakpoints</h2>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${bps.map((b) => `<div style="display:grid;grid-template-columns:150px minmax(0,1fr);gap:16px;align-items:center"><span class="mono" style="font-size:14px">--bp-${esc(b.name)} ${b.px}px</span><div style="height:36px;width:${Math.round((b.px / widest) * 100)}%;background:var(--primary);color:var(--on-primary);display:flex;align-items:center;padding:0 12px;border-radius:var(--radius)"><span style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(b.use)}</span></div></div>`).join('')}
          <div style="display:grid;grid-template-columns:150px minmax(0,1fr);gap:16px;align-items:center"><span class="mono" style="font-size:14px">--content-max ${system.layout.contentMaxPx}px</span><div style="height:36px;width:${Math.round((system.layout.contentMaxPx / widest) * 100)}%;border:1px dashed var(--ink);display:flex;align-items:center;padding:0 12px;border-radius:var(--radius)"><span style="font-size:14px;white-space:nowrap">the reading column</span></div></div>
        </div>`,
      });
    },
  });
  page({
    chapter: 'system', id: 'motion', title: 'Motion',
    render: (n) => {
      const longest = Math.max(...system.motion.durations.map((d) => d.ms), 1);
      return contentPage(ctx, {
        id: 'motion', chapter: 'System', title: 'Motion', n, centre: true,
        rail: railText(
          has(id.motionPrinciple) ? `<strong>${esc(id.motionPrinciple)}</strong>` : `<strong>${esc(system.meta.motion)}.</strong>`,
          esc(system.meta.motionNote),
          has(id.motionSignature?.name) ? `<strong>${esc(id.motionSignature.name)}.</strong> ${esc(id.motionSignature.description ?? '')}${id.motionSignature.durationMs ? ` <span class="mono">${id.motionSignature.durationMs}ms</span>` : ''}${has(id.motionSignature.easing) ? ` <span class="mono">${esc(id.motionSignature.easing)}</span>` : ''}` : null,
          'Every transition honours prefers-reduced-motion.',
        ),
        // Durations as bars to scale and easings as drawn curves: a curve is
        // read at a glance, four numbers are not.
        canvas: `<div style="display:flex;flex-direction:column;gap:40px">
          <div><h2 style="font-size:30px">Durations</h2><div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">${system.motion.durations.map((d) => `<div style="display:grid;grid-template-columns:200px 90px minmax(0,1fr);gap:16px;align-items:center"><span class="mono" style="font-size:14px">--duration-${esc(d.name)}</span><span class="mono" style="font-size:14px">${d.ms}ms</span><div style="display:flex;align-items:center;gap:12px"><span style="display:block;height:20px;width:${Math.max(2, Math.round((d.ms / longest) * 60))}%;background:var(--primary);border-radius:var(--radius)"></span><span style="font-size:14px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.use)}</span></div></div>`).join('')}</div></div>
          <div><h2 style="font-size:30px">Easings</h2><div style="display:grid;grid-template-columns:repeat(${Math.min(4, Object.keys(system.motion.easings).length)},minmax(0,1fr));gap:24px;margin-top:16px">${Object.entries(system.motion.easings).map(([k, e]) => `<div style="display:flex;flex-direction:column;gap:8px">${easingCurve(e.value, tokens.primary) ?? ''}<span class="mono" style="font-size:14px">--ease-${esc(k)}</span><span class="mono" style="font-size:12px;color:var(--muted)">${esc(e.value)}</span><span style="font-size:14px;color:var(--muted)">${esc(e.use)}</span></div>`).join('')}</div></div>
        </div>`,
      });
    },
  });
  page({
    chapter: 'system', id: 'accessibility', title: 'Accessibility',
    render: (n) => {
      const measured = [
        ['Body text on the page', 'text.primary', 'surface.page', 4.5],
        ['Secondary text on the page', 'text.secondary', 'surface.page', 4.5],
        ['Brand-coloured text', 'text.brand', 'surface.page', 4.5],
        ['Label on the brand fill (normal text)', 'accent.on-solid', 'accent.solid', 4.5],
        ['The focus ring', 'focus.ring', 'surface.page', 3],
      ];
      const rows = ['light', 'dark'].flatMap((mode) => measured.map(([label, fg, bg, min]) => {
        const f = resolveToken(system.semantic[mode][fg], system, mode);
        const b = resolveToken(system.semantic[mode][bg], system, mode);
        const ratio = contrastRatio(f, b);
        return `<tr><td style="font-size:16px;padding:12px 12px 12px 0">${esc(label)}</td><td class="mono" style="padding:12px 12px 12px 0"><span style="display:inline-block;width:18px;height:18px;vertical-align:middle;margin-right:8px;background:${b};border:1px solid var(--rule)"><span style="display:block;width:8px;height:8px;margin:5px;background:${f}"></span></span>${mode}</td><td class="mono" style="padding:12px 12px 12px 0">${f} on ${b}</td><td class="mono" style="padding:12px 12px 12px 0">${ratio.toFixed(2)}:1</td><td class="mono" style="padding:12px 12px 12px 0">Lc ${apcaContrast(f, b)}</td><td class="mono" style="padding:12px 12px 12px 0">needs ${min}:1</td><td class="${ratio >= min ? 'tick' : 'cross'}" style="padding:12px 0">${ratio >= min ? 'pass' : 'FAIL'}</td></tr>`;
      })).join('');
      const problems = system.audit.findings.filter((f) => f.level !== 'info');
      return contentPage(ctx, {
        id: 'accessibility', chapter: 'System', title: 'Accessibility', n, centre: true,
        rail: railText(
          system.audit.ok ? 'Every pairing here was measured when this deck was generated, and every one passed. Nothing is a claim; the numbers are the evidence.' : '<strong>This system does not currently pass its own audit.</strong> The failures are marked FAIL and listed below. Nothing has been hidden or rounded in its favour.',
          `Focus is visible on every interactive element: a ${system.focus.widthPx}px outline at ${system.focus.offsetPx}px offset. Targets are 24px at least, 44px where there is room. Nothing is carried by colour alone. WCAG 2.2 1.4.1, 1.4.3, 1.4.11, 2.4.7, 2.5.8.`,
          problems.length ? `<strong>Known problems.</strong> ${problems.map((f) => esc(f.message)).join(' ')}` : null,
        ),
        canvas: `<table style="font-size:16px"><thead><tr><th>Pairing</th><th>Theme</th><th>Values</th><th>Measured</th><th>APCA</th><th>Required</th><th></th></tr></thead><tbody>${rows}</tbody></table>
        <div style="display:flex;gap:40px;align-items:center;margin-top:16px"><span class="label">Colour vision</span>${['protanopia', 'deuteranopia', 'tritanopia'].map((t) => `<div style="display:flex;flex-direction:column;gap:6px"><span class="mono" style="color:var(--muted)">${t}</span><div style="display:flex;width:220px;height:40px">${['success', 'warning', 'danger'].map((k) => `<div style="flex:1;background:${simulateCvd(r(`${k}.solid`), t)}"></div>`).join('')}</div></div>`).join('')}<span style="font-size:15px;color:var(--muted);max-width:30ch">Status is never carried by colour alone: every state gets an icon and a word.</span></div>`,
      });
    },
  });
  page({
    chapter: 'system', id: 'implementation', title: 'Implementation',
    render: (n) => contentPage(ctx, {
      id: 'implementation', chapter: 'System', title: 'Implementation', n, centre: true,
      rail: railText(
        'Everything in this deck is generated from brand/brand.json. The token files are generated from the same source, so the deck and the code cannot disagree.',
        '<strong>The one rule.</strong> Build with the semantic tokens, never with a raw ramp step. If a component needs something the semantic layer does not have, add it to the semantic layer.',
      ),
      canvas: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        ${[
    ['brand/tokens/tokens.json', 'Design Tokens Community Group format, for a build pipeline.'],
    ['brand/tokens/tokens.css', 'Custom properties, both themes. This is what most work imports.'],
    ['brand/tokens/tailwind.css', 'A Tailwind v4 theme block.'],
    ['brand/tokens/tokens.ts', 'Typed values, for anything that needs them in JavaScript.'],
    ['brand/system.json', 'The resolved system: every ramp, every token, audited.'],
    ['brand/brand.json', 'The source. Every page here is a view of it; fix it there and regenerate.'],
  ].map(([file, what]) => `<div class="card" style="padding:28px;gap:12px;min-height:140px;justify-content:center"><span class="mono" style="font-size:16px;color:var(--ink)">${file}</span><p style="font-size:17px;color:var(--ink)">${what}</p></div>`).join('')}
      </div>
      <div style="margin-top:16px"><span class="label">The names to reach for</span><p style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px">${['--surface-page', '--text-primary', '--accent-solid', '--space-16', '--radius-md', '--duration-fast'].map((t) => `<span class="pill" style="font-size:15px;padding:8px 16px">${t}</span>`).join('')}</p></div>`,
    }),
  });

  // --- 7. Brand in use ------------------------------------------------------
  // The applications page carries every recorded surface with its purpose and
  // notes, drawn or not; the pages after it show the ones that have been drawn.
  const apps = (brand.applications ?? []).filter((a) => a && (a.name || a.surface));
  page({ chapter: 'in-use', divider: true });
  page({
    chapter: 'in-use', id: 'applications', title: 'Applications',
    ...(apps.length ? {} : absent('Applications', 'the applications this system will be tested on')),
    render: (n) => contentPage(ctx, {
      id: 'applications', chapter: 'Brand in use', title: 'Applications', n, centre: true,
      rail: railText(
        'Every surface the brand has to work on, what each is for, and the notes that decide how it is drawn. The pages that follow show the ones drawn so far.',
        artboards.length
          ? `<span class="mono">${artboards.length} drawn: ${artboards.map((a) => esc(a.file)).join(', ')}.</span>`
          : todo('proof artboards. None were found in brand/canvas apart from the generated specification sheets'),
        artboards.length ? null : 'Draw the applications as .dc.html artboards in brand/canvas, or composite the brand onto photographs with brandi mockup build. Regenerate the book and each one gets a page here.',
      ),
      canvas: `<div style="display:grid;grid-template-columns:repeat(${apps.length > 4 ? 3 : 2},minmax(0,1fr));gap:20px">
        ${apps.slice(0, 9).map((a) => {
    const drawn = a.file && artboards.some((b) => b.file === a.file);
    return `<div class="card application-tile" style="padding:28px;gap:12px;min-height:200px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><h3 style="font-size:24px">${esc(a.name ?? a.surface)}</h3><span class="pill" style="flex:none;${drawn ? 'background:var(--primary);color:var(--on-primary);border-color:var(--primary)' : ''}">${drawn ? 'drawn' : 'not yet drawn'}</span></div>
          <span class="mono" style="color:var(--muted)">${[a.surface, a.frame, a.file].filter(has).map(esc).join(' / ')}</span>
          ${has(a.purpose) ? `<p style="font-size:16px;color:var(--ink)">${esc(a.purpose)}</p>` : ''}
          ${has(a.notes) ? `<p style="font-size:15px;color:var(--muted)">${esc(a.notes)}</p>` : ''}
        </div>`;
  }).join('')}
      </div>`,
    }),
  });
  artboards.forEach((a, i) => {
    // Numbered, so two stems that differ only in case or punctuation cannot
    // share an id.
    const pid = `in-use-${i + 1}-${a.stem.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const taller = a.renderedH && a.h && a.renderedH > a.h;
    const shaped = Number.isFinite(a.w) && Number.isFinite(a.renderedH) && a.w > 0 && a.renderedH > 0;
    const frameH = PAGE_H - 120 - 120;
    page({
      chapter: 'in-use', id: pid, title: a.title,
      render: (n) => contentPage(ctx, {
        id: pid, chapter: 'Brand in use', title: a.title, n, centre: true,
        rail: railText(
          // Never claim the brand is on the photograph when it is not: the
          // artboard records whether anything was composited onto it.
          a.kind !== 'mockup'
            ? 'A proof artboard from the brand canvas, rendered as it was drawn.'
            : a.composited === false
              ? 'A photograph of the surface, with nothing composited onto it: no artwork is recorded for its surfaces.'
              : 'A mockup: the brand composited onto a real photograph of the surface.',
          has(a.purpose) ? esc(a.purpose) : null,
          has(a.notes) ? esc(a.notes) : null,
          `<span class="mono">${esc(a.file)}${a.w && a.h ? ` / ${a.w}x${a.h}` : ''}${taller ? `, rendered at its full height of ${a.renderedH}px` : ''}</span>`,
        ),
        // The frame takes the artboard's own shape, bounded by the page in BOTH
        // directions. A fixed 840px box letterboxed a 1400x582 composite into
        // half a page of nothing; bounding only the height then letterboxed a
        // 390x844 phone sideways across a page of nothing. The width bound is
        // the height bound carried through the artboard's own ratio, so the box
        // is the shape of the thing inside it whichever way it is long.
        canvas: a.png
          ? `<div style="${shaped ? `aspect-ratio:${a.w} / ${a.renderedH};max-width:${Math.round(frameH * (a.w / a.renderedH))}px;width:100%;align-self:center;height:auto;` : `height:${frameH}px;`}max-height:${frameH}px;margin-top:32px;display:flex;align-items:flex-start;justify-content:center;overflow:hidden;border:1px solid var(--rule);background:var(--tint-2)"><img src="${a.png}" alt="${esc(a.kind === 'mockup' ? `Mockup: ${a.title}` : `Artboard: ${a.title}`)}" style="max-width:100%;max-height:100%;object-fit:contain;object-position:top"></div>`
          : `<p>${todo(`a rendering of ${a.file}: ${a.reason ?? 'no headless browser was available to render it'}`)}</p>`,
      }),
    });
  });

  // --- 8. Rules and decisions -----------------------------------------------
  page({ chapter: 'governance', divider: true });
  page({
    chapter: 'governance', id: 'anti-patterns', title: 'What not to do',
    render: (n) => {
      // The brand's own recorded anti-patterns when it has any: nine rules
      // identical in every brand's book are the house style, not this brand's.
      const own = has(gov.antiPatterns) ? gov.antiPatterns.filter(has).map(String) : null;
      // And never ban a face this brand itself uses. The generic list said
      // "Montserrat is banned outright" in a book whose type page reads
      // "Montserrat is used for headings", because the brand keeps a refused
      // face under the waiver the system explicitly allows. A rule the book
      // breaks on its own type page is not a rule.
      const ourFaces = [id.type?.display, id.type?.body, id.type?.mono, ...Object.values(system.type.fonts ?? {})];
      const ours = new Set(ourFaces.filter(has).map((f) => String(f).split(',')[0].replace(/["']/g, '').trim().toLowerCase()));
      const stillBanned = ['Inter', 'Roboto', 'Arial', 'Poppins', 'Montserrat'].filter((f) => !ours.has(f.toLowerCase()));
      const generic = [
        'No gradient backgrounds, and never a purple or indigo one.',
        'No blurred gradient orbs standing in for an idea.',
        'No emoji as icons. Icons are drawn.',
        'No rounded card with a left accent stripe.',
        'No three-column feature grid as the default structure.',
        'No 01 / 02 / 03 numbering unless the content is a sequence.',
        'No invented statistics, testimonials or logos. A bracketed placeholder is honest; a fabrication is not.',
        'No lorem ipsum, and no "Welcome to our website".',
        stillBanned.length
          ? `No default typefaces. ${stillBanned.join(', ')} ${stillBanned.length > 1 ? 'are' : 'is'} banned outright.`
          : null,
      ].filter(Boolean);
      const rules = own?.length ? own : generic;
      return contentPage(ctx, {
        id: 'anti-patterns', chapter: 'Rules and decisions', title: 'What not to do', n, centre: true,
        rail: railText(
          'The specific habits that would make this brand look like everyone else. Just do not do these things.',
          own?.length ? null : '<span class="mono">These are the house rules. Record this brand\'s own under governance.antiPatterns and they replace them.</span>',
          has(gov.nonGoals) ? `<strong>What this system is not.</strong> ${gov.nonGoals.map(esc).join(' ')}` : null,
        ),
        canvas: `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px">
        ${rules.map((t) => `<div class="card" data-rule-source="${own?.length ? 'brand' : 'house'}" style="min-height:230px;justify-content:center;padding:32px"><div style="display:flex;gap:14px;align-items:flex-start">${cross(tokens.fail, 24)}<p style="color:var(--ink);font-size:19px;line-height:1.4">${esc(t)}</p></div></div>`).join('')}
      </div>`,
      });
    },
  });
  page({
    chapter: 'governance', id: 'decisions', title: 'Decisions and open questions',
    render: (n) => {
      const open = (gov.openQuestions ?? []).filter((q) => q.status === 'open');
      const counts = Object.keys(PROVENANCE).map((k) => [k, (brand.evidence ?? []).filter((e) => e.provenance === k).length]).filter(([, c]) => c > 0);
      return contentPage(ctx, {
        id: 'decisions', chapter: 'Rules and decisions', title: 'Decisions and open questions', n, centre: true,
        rail: railText(
          'What was decided, why, and what nobody has answered yet. A change nobody wrote down becomes an inconsistency the next person has to guess about.',
          `<strong>Where this came from.</strong> ${counts.length ? counts.map(([k, c]) => `${esc(PROVENANCE[k].label)} ${c}`).join(', ') : 'no evidence recorded'}. Every statement in this deck is traceable to one of those; anything assumed is a working assumption, not a finding.`,
          has(gov.trademark?.notice) ? `<strong>Trademark.</strong> ${esc(gov.trademark.notice)}` : null,
        ),
        canvas: `<h2>Decision log</h2>
        ${has(gov.decisions) ? `<table><thead><tr><th>Date</th><th>Decision</th><th>Because</th></tr></thead><tbody>${gov.decisions.slice(0, 6).map((d) => `<tr><td class="mono" style="white-space:nowrap">${esc(d.date)}</td><td style="font-size:15px">${esc(d.decision)}</td><td style="font-size:14px;color:var(--muted)">${esc(d.rationale)}</td></tr>`).join('')}</tbody></table>` : `<p>${todo('a decision log')}</p>`}
        <h2>Open questions</h2>
        ${open.length ? `<table><thead><tr><th>Question</th><th>Assumed meanwhile</th><th>Who can answer</th></tr></thead><tbody>${open.slice(0, 5).map((q) => `<tr><td style="font-size:15px">${esc(q.question)}</td><td style="font-size:14px">${esc(q.assumedMeanwhile ?? 'nothing')}</td><td style="font-size:14px;color:var(--muted)">${esc(q.whoCanAnswer ?? 'unassigned')}</td></tr>`).join('')}</tbody></table>` : '<p style="color:var(--muted)">None open.</p>'}`,
      });
    },
  });

  return pages;
}

// ---------------------------------------------------------------------------

/**
 * Render the deck.
 *
 * @param {object} input
 * @param {object} input.brand       brand.json
 * @param {object} input.system      the resolved system
 * @param {object} [input.assets]    logo path -> {kind, markup}, inlined by the caller
 * @param {object[]} [input.artboards] proof artboards and mockups already rendered:
 *   {file, stem, title, kind: 'proof'|'mockup', png: data URI|null, reason, w, h, purpose, notes}
 * @returns {{html: string, pages: object[]}} the document and the page list in order
 */
export function renderBrandDeck({ brand, system, assets = {}, artboards = [] }) {
  const name = brand.meta?.name ?? 'Unnamed brand';
  const sem = system.semantic.light;
  const r = (k) => resolveToken(sem[k], system, 'light');
  const f = system.type.fonts;
  const tokens = {
    primary: r('accent.solid'),
    onPrimary: sem['accent.on-solid'],
    paper: r('surface.page'),
    ink: r('text.primary'),
    muted: r('text.secondary'),
    rule: r('border.subtle'),
    tint: r('accent.bg'),
    tint2: system.palettes.brand.light.steps[1].hex,
    inverted: r('surface.inverted'),
    onInverted: r('text.inverted'),
    accent: (system.palettes.accent1 ?? system.palettes.brand).light.solidStrong.hex,
    ground: r('surface.subtle'),
    pass: r('success.text'),
    fail: r('danger.text'),
    radiusPx: (system.radius.find((x) => x.name === 'md') ?? system.radius[0]).px,
    fonts: {
      display: f.display ? `'${f.display}', Georgia, serif` : 'Georgia, serif',
      body: f.body ? `'${f.body}', system-ui, sans-serif` : 'system-ui, sans-serif',
      mono: f.mono ? `'${f.mono}', ui-monospace, Menlo, monospace` : 'ui-monospace, Menlo, monospace',
    },
  };
  const ctx = {
    brand, system, assets, artboards, tokens, r, name,
    version: brand.meta?.version ?? '0.1.0',
    logo: logoContext(brand, assets, tokens),
  };
  ctx.colourways = colourwayContext(brand, ctx.logo, system);

  // Plan, then number, then render. Front matter takes pages 1 to 3.
  const planned = planPages(ctx);
  const pages = [
    { id: 'cover', title: name, chapter: 'front' },
    { id: 'intro', title: 'About this document', chapter: 'front' },
    { id: 'contents', title: 'Contents', chapter: 'front' },
  ];
  for (const p of planned) {
    if (p.absent) { pages.push({ id: p.id, title: p.title, chapter: p.chapter, absent: p.absent, n: null }); continue; }
    if (p.divider) {
      const ch = CHAPTERS.find((c) => c.id === p.chapter);
      pages.push({ id: `chapter-${ch.id}`, title: ch.title, chapter: ch.id, divider: true, render: (n) => dividerPage(ctx, ch, n) });
      continue;
    }
    pages.push(p);
  }
  let n = 0;
  for (const p of pages) if (!p.absent) p.n = ++n;
  const total = n;

  // `brandi.updated` is a UTC instant. Slicing its first ten characters printed
  // the UTC day on a cover whose locale is en-AU, which is yesterday for the
  // first ten hours of every Melbourne morning.
  const stamped = brand.brandi?.updated ? new Date(brand.brandi.updated) : null;
  const date = brand.meta?.effectiveDate
    ?? (stamped && !Number.isNaN(stamped.getTime()) ? localDate(stamped) : null);
  const cover = `<section class="page" id="cover" style="background:var(--primary);color:var(--on-primary)">
  <div class="full" style="justify-content:space-between">
    <div style="display:flex;align-items:flex-start">${ctx.logo.file
      ? `<span style="display:inline-flex;background:var(--paper);padding:40px 56px;border-radius:var(--radius)">${ctx.logo.at(180, { maxW: 1300 })}</span>`
      : ctx.logo.at(220, { colour: 'var(--on-primary)', maxW: 1400 })}</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <h1 class="big" style="font-size:112px;font-weight:400">Brand guidelines</h1>
      <div class="mono" style="text-align:right;line-height:1.7;opacity:.9">Version ${esc(ctx.version)}<br>${date ? esc(date) : todo('an effective date')}</div>
    </div>
  </div>
</section>`;

  const intro = `<section class="page" id="intro" style="background:var(--tint);color:var(--ink)">
  <div class="full" style="justify-content:center">
    <h1 class="big" style="font-size:64px;max-width:22ch;font-weight:400;line-height:1.15">This document gives the ${esc(name)} team, and anyone working with it, the guidance to use the brand correctly and consistently across everything it produces.</h1>
    <p style="font-size:22px;margin-top:48px;max-width:50ch;color:var(--muted)">It is generated from brand.json, so every value here is the value the code is built from. If something is wrong, fix the source and regenerate. It is a living document: version ${esc(ctx.version)}.</p>
  </div>
  <div class="footer"><span></span><span></span><span class="folio">2</span></div>
</section>`;

  // Each chapter and its entries are one block that never breaks across a
  // column, so a chapter's pages are always listed under its heading.
  const tocItems = [];
  for (const ch of CHAPTERS) {
    const own = pages.filter((p) => p.chapter === ch.id && !p.divider);
    const div = pages.find((p) => p.divider && p.chapter === ch.id);
    if (!div) continue;
    const entries = [`<a class="chapter" href="#chapter-${ch.id}"><span>${esc(ch.title)}</span><span>${div.n}</span></a>`];
    for (const p of own) {
      entries.push(p.absent
        ? `<a href="#contents" aria-disabled="true" style="color:var(--muted)"><span>${esc(p.title)}</span><span class="todo" style="font-size:12px">[not yet recorded]</span></a>`
        : `<a href="#${p.id}"><span>${esc(p.title)}</span><span>${p.n}</span></a>`);
    }
    tocItems.push(`<div class="toc-chapter" data-chapter="${ch.id}">${entries.join('')}</div>`);
  }
  const contents = `<section class="page" id="contents" style="background:var(--tint-2);color:var(--ink)">
  <div class="full" style="gap:56px">
    <h1 style="font-size:72px">Contents</h1>
    <nav class="toc" aria-label="Contents">${tocItems.join('')}</nav>
  </div>
  ${cornerMark(ctx)}
  <div class="footer"><span></span><span>${esc(name)} brand guidelines / v${esc(ctx.version)}</span><span class="folio">3</span></div>
</section>`;

  const closing = `<section class="page" id="closing" style="background:var(--primary);color:var(--on-primary)">
  <div class="full" style="justify-content:space-between">
    <h1 class="big" style="font-size:96px;max-width:14ch">Thank you for using the brand correctly.</h1>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:64px">
      <div class="mono" style="line-height:1.8;opacity:.9;max-width:60ch">
        ${esc(name)} brand guidelines, version ${esc(ctx.version)}${date ? `, ${esc(date)}` : ''}.<br>
        ${brand.governance?.colophon?.madeBy ? esc(brand.governance.colophon.madeBy) : 'Built with Brandi'}, generated from brand/brand.json.<br>
        ${brand.meta?.owner ? `Held by ${esc(brand.meta.owner)}. ` : ''}${brand.governance?.colophon?.contact ? `Ask ${esc(brand.governance.colophon.contact)}.` : ''}<br>
        This is a living document. Edit the source, bump the version, regenerate.
      </div>
      ${ctx.logo.file
        ? `<span style="display:inline-flex;background:var(--paper);padding:24px 32px;border-radius:var(--radius)">${ctx.logo.at(64, { maxW: 480 })}</span>`
        : ctx.logo.at(72, { colour: 'var(--on-primary)', maxW: 520 })}
    </div>
  </div>
  <div class="footer" style="color:var(--on-primary);opacity:.85"><span></span><span></span><span class="folio">${total + 1}</span></div>
</section>`;
  pages.push({ id: 'closing', title: 'Closing', chapter: 'back', n: total + 1 });

  const rendered = [cover, intro, contents];
  for (const p of pages) {
    if (p.absent || ['cover', 'intro', 'contents', 'closing'].includes(p.id)) continue;
    rendered.push(p.render(p.n));
  }
  rendered.push(closing);

  const fontsUrl = googleFontsUrl([f.display, f.body, f.mono]);
  const html = `<!doctype html>
<html lang="${esc(brand.meta?.locale ?? 'en-AU')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="brandi: generated from the resolved system">
<title>${esc(name)} brand guidelines</title>
${fontsUrl ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(fontsUrl)}">` : ''}
<style>${deckCss(system, tokens)}</style>
</head>
<body>
<div class="deck">
${rendered.map((p) => `<div class="slide">\n${p}\n</div>`).join('\n')}
</div>
<script>${SCALE_SCRIPT}</script>
</body>
</html>
`;

  return {
    html,
    pages: pages.map((p) => ({ n: p.n, id: p.id, title: p.title, chapter: p.chapter, divider: Boolean(p.divider), absent: p.absent ?? null })),
  };
}

export default { renderBrandDeck, pairingMatrix, PAGE_W, PAGE_H, PLACEHOLDER };
