/**
 * The concept round as artboards, for the `/design` canvas.
 *
 * This is where a person actually decides, so the design of these boards is a
 * design decision in itself, and the decision is: the boards stay out of the
 * way. Neutral type, neutral ground, no brand expression anywhere in the chrome.
 * A presentation styled in one of the directions being presented puts a thumb on
 * the scale, and everybody can feel it without being able to name it.
 *
 * Every mark is drawn black on white, at the same size, on the same ground.
 * Colour comes later in the journey, deliberately: a weak silhouette rescued by
 * a good palette is a decision you find out about eighteen months later, on a
 * one-colour press.
 *
 * The favicon wall is the important board. Everybody agrees the 16 pixel test
 * matters and almost nobody runs it, because it means exporting twelve files and
 * looking at them in a browser. Here it is the second thing you see, drawn in
 * real browser-tab chrome at real size, and it settles most of the round on its
 * own.
 *
 * Frames are computed from the content rather than assumed. A frame smaller than
 * its artboard clips, and clipping is the one canvas failure that cannot be
 * recovered without re-seeding.
 */

import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import { artboard, FRAMES } from './canvas.mjs';
import { monochromeSvg } from './assets.mjs';
import { greyscaleSvg, greyOf, groundsOf } from './logocolour.mjs';
import { relativeLuminance } from './color.mjs';
import { inkBounds, viewBox, parseXml, walk } from './svg.mjs';
import { findChrome } from './preview.mjs';

const run = promisify(execFile);

/** The phrase `brandi check` looks for so it does not audit its own output. */
const GENERATED = 'generated from the resolved system';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * A mark, ready to be dropped inside another document.
 *
 * Ids are prefixed, because twelve marks on one board is twelve chances that two
 * of them both called a clip path "a", and the second one silently wins for
 * both. That failure looks like a design problem and is not one.
 */
export function inlineSvg(source, { prefix, colour = null, width, height, label = '' } = {}) {
  if (!source) return '';
  let out = String(source)
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  if (prefix) {
    const ids = new Set();
    walk(parseXml(out), (n) => {
      if (n.attrs.id) ids.add(n.attrs.id);
    });
    for (const id of ids) {
      const safe = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out
        .replace(new RegExp(`\\bid\\s*=\\s*(["'])${safe}\\1`, 'g'), `id="${prefix}-${id}"`)
        .replace(new RegExp(`url\\(\\s*(['"]?)#${safe}\\1\\s*\\)`, 'g'), `url(#${prefix}-${id})`)
        .replace(new RegExp(`(href|xlink:href)\\s*=\\s*(["'])#${safe}\\2`, 'g'), `$1="#${prefix}-${id}"`);
    }
  }

  if (colour) out = monochromeSvg(out, colour);

  // The source's own width and height fight the container, so they are replaced
  // rather than removed: a bare viewBox with no size renders at 300x150 in some
  // layouts and at zero in others.
  const size = [
    width != null ? `width="${width}"` : null,
    height != null ? `height="${height}"` : null,
  ].filter(Boolean).join(' ');

  out = out.replace(/<svg\b([^>]*)>/i, (m, attrs) => {
    const cleaned = attrs
      .replace(/\s(width|height)\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')
      .replace(/\srole\s*=\s*(["'][^"']*["'])/gi, '');
    const a11y = label ? ` role="img" aria-label="${esc(label)}"` : ' role="presentation" aria-hidden="true"';
    return `<svg${cleaned} ${size}${a11y} style="display:block">`;
  });
  return out;
}

/** The largest side of a mark, so a row of them can be set to one optical size. */
function aspect(source) {
  const vb = viewBox(source) ?? inkBounds(source);
  if (!vb || !(vb.width > 0) || !(vb.height > 0)) return 1;
  return vb.width / vb.height;
}

/** Fit a mark into a box without stretching it. */
function boxed(source, { prefix, colour, box, label }) {
  const a = aspect(source);
  const width = a >= 1 ? box : Math.round(box * a);
  const height = a >= 1 ? Math.round(box / a) : box;
  return inlineSvg(source, { prefix, colour, width, height, label });
}

const INK = '#111111';
const REVERSE_GROUND = '#111111';
const PAPER = '#FFFFFF';

/**
 * Deliberately plain. Archivo is a neutral grotesque on the Google Fonts public
 * catalogue, and the chrome around a decision should not be making an argument.
 */
const BOARD_FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&display=swap';

const boardCss = () => `
  * { box-sizing: border-box; }
  .board {
    font-family: 'Archivo', ui-sans-serif, sans-serif;
    background: ${PAPER};
    color: ${INK};
    padding: 56px;
    min-height: 100%;
    -webkit-font-smoothing: antialiased;
  }
  .eyebrow {
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    color: #6B6B6B; font-weight: 500;
  }
  h1 { font-size: 40px; line-height: 1.1; margin: 10px 0 0; font-weight: 600; letter-spacing: -0.02em; }
  h2 { font-size: 15px; margin: 0; font-weight: 600; letter-spacing: -0.01em; }
  .lede { font-size: 16px; line-height: 1.5; max-width: 62ch; color: #3A3A3A; margin: 14px 0 0; }
  .rule { height: 1px; background: #E4E4E4; margin: 36px 0; }
  .grid { display: grid; gap: 28px; }
  .cell { border: 1px solid #E4E4E4; padding: 22px; display: flex; flex-direction: column; gap: 14px; }
  .cell__art { display: flex; align-items: center; justify-content: center; min-height: 200px; }
  .cell__id { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6B6B6B; }
  .cell__meta { font-size: 12px; line-height: 1.5; color: #3A3A3A; }
  .cell__meta b { font-weight: 600; color: ${INK}; }
  .verdict { display: inline-block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 3px 8px; border: 1px solid currentColor; }
  .v-contender { color: #1B6B3A; }
  .v-notes { color: #8A5A00; }
  .v-weak { color: #8A2B14; }
  .v-rejected { color: #8A2B14; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid #E4E4E4; vertical-align: top; }
  th { font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #6B6B6B; }
  /* A table with no caption reaches a screen reader as an unnamed grid of
     cells, so every table these boards emit carries one. */
  caption { text-align: left; font-size: 13px; color: #3A3A3A; padding: 0 0 10px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
`;

const head = (eyebrow, title, lede) => `  <div>
    <span class="eyebrow">${esc(eyebrow)}</span>
    <h1>${esc(title)}</h1>
    ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
  </div>
  <div class="rule"></div>`;

const VERDICT_CLASS = {
  contender: 'v-contender',
  'contender-with-notes': 'v-notes',
  unverified: 'v-notes',
  'not-a-primary': 'v-weak',
  rejected: 'v-rejected',
};

const VERDICT_LABEL = {
  contender: 'clears every test',
  'contender-with-notes': 'clears, with notes',
  // Not a verdict, an admission. Without a browser the geometry pass runs alone
  // and cannot see a hairline drawn as a thin filled rectangle, so the mark is
  // unmeasured rather than passing.
  unverified: 'not measured, no browser',
  'not-a-primary': 'not a primary mark',
  rejected: 'ruled out',
};

/**
 * The verdict, said in a way that cannot be misread.
 *
 * A wordmark clears every test because the favicon and the app icon were handed
 * to a small-grade asset, which is correct and is also not what "clears every
 * test" sounds like. Anybody reading the board would take it to mean the mark
 * works at sixteen pixels, and it does not: something else has to.
 */
const verdictLabel = (audit) => {
  const base = VERDICT_LABEL[audit?.verdict] ?? audit?.verdict ?? '';
  if (audit?.verdict === 'unverified') return base;
  const deferred = (audit?.contexts ?? []).filter((r) => r.status === 'deferred').length;
  if (deferred && (audit.verdict === 'contender' || audit.verdict === 'contender-with-notes')) {
    return `${base}, needs a small mark`;
  }
  return base;
};

// ---------------------------------------------------------------------------
// The boards
// ---------------------------------------------------------------------------

/**
 * The index. It states the question being asked, which is the thing most concept
 * presentations leave implicit and then get a useless answer to.
 */
export function indexBoard({ plan, candidates, audits, brandName }) {
  const byFamily = new Map();
  for (const c of candidates) {
    if (!byFamily.has(c.family)) byFamily.set(c.family, []);
    byFamily.get(c.family).push(c);
  }
  const counted = (v) => audits.filter((a) => a.verdict === v).length;

  const body = `<div class="board">
${head(`${brandName} / logo round ${plan.round ?? 1}`, 'Pick directions, not a logo',
  'Nothing here is finished. Each of these is an idea drawn far enough to judge, and the job today is to keep two or three of them alive. Choosing a winner from a first round is how brands end up with the safest option in the set.')}
  <div class="grid" style="grid-template-columns: repeat(2, 1fr);">
${[...byFamily.entries()].map(([family, list]) => {
  const f = plan.slots.find((s) => s.family === family);
  return `    <div class="cell">
      <span class="cell__id">${esc(f?.familyName ?? family)} &middot; ${list.length}</span>
      <h2>${esc(f?.question ?? '')}</h2>
      <p class="cell__meta">${list.map((c) => `<b>${esc(c.id)}</b> ${esc(c.registerName ?? c.register ?? '')}`).join(' &middot; ')}</p>
    </div>`;
}).join('\n')}
  </div>
  <div class="rule"></div>
  <table>
    <tr><th>Board</th><th>What it is for</th></tr>
    <tr><td><b>Range</b></td><td>Every concept at one size, black on white. The silhouette, with nothing helping it.</td></tr>
    <tr><td><b>Favicons</b></td><td>The same marks at 16, 32 and 64 pixels in real tab chrome. Most rounds are settled here.</td></tr>
    <tr><td><b>Reversed</b></td><td>Knocked out of a dark ground, which is where about half of all marks fall apart.</td></tr>
    <tr><td><b>Audit</b></td><td>What the arithmetic found, before anybody said what they liked.</td></tr>
  </table>
  <div class="rule"></div>
  <p class="lede"><b>${candidates.length} concepts.</b> ${counted('contender')} clear every mechanical test, ${counted('contender-with-notes')} clear with notes, ${counted('not-a-primary')} cannot carry as a primary mark, and ${counted('rejected')} are ruled out. The ruled-out ones are still shown, because seeing what failed is part of seeing the range.</p>
${counted('unverified') ? `  <p class="lede"><b>${counted('unverified')} of these were not measured.</b> There was no browser available to render them, so only the geometry could be checked, and the geometry alone cannot see a hairline drawn as a filled shape. Treat those as unknown rather than as passing.</p>
` : ''}  <p class="lede">Every mark here was generated, then ${counted('unverified') ? 'measured where a browser allowed it' : 'measured'}, then kept or dropped on the measurement. A person picks. Nothing becomes the brand's mark because a machine liked it.</p>
</div>`;

  return {
    height: 1100,
    source: artboard({
      name: 'Main',
      body,
      css: boardCss(),
      fonts: BOARD_FONTS,
      systemNote: `Logo concept round, ${GENERATED} and the concept plan.\nDo not hand-edit: the next round regenerates it.`,
    }),
  };
}

/** Every concept at one size, black on white. */
export function rangeBoard({ candidates, audits, brandName, columns = 4, box = 200 }) {
  const auditOf = (id) => audits.find((a) => a.id === id);
  const rows = Math.ceil(candidates.length / columns);

  const body = `<div class="board">
${head(`${brandName} / range`, 'The range, in black',
  'One size, one ground, no colour. A mark that only works once it is coloured is a mark that fails on an invoice, a stamp and a shirt.')}
  <div class="grid" style="grid-template-columns: repeat(${columns}, 1fr);">
${candidates.map((c) => {
  const a = auditOf(c.id);
  return `    <div class="cell">
      <div class="cell__art">${boxed(c.svg, { prefix: `r-${c.id}`, colour: INK, box, label: `Concept ${c.id}` })}</div>
      <span class="cell__id">${esc(c.id)}</span>
      <p class="cell__meta"><b>${esc(c.architectureName ?? c.architecture ?? '')}</b><br>${esc(c.registerName ?? c.register ?? '')}${c.symbolApproach ? ` &middot; ${esc(c.symbolApproach)}` : ''}</p>
      ${c.signals ? `<p class="cell__meta">${esc(c.signals)}</p>` : ''}
      ${c.inCategory !== undefined ? `<p class="cell__meta" style="color:#6B6B6B;">${c.inCategory ? 'Inside the category convention' : 'Breaks the category convention'}</p>` : ''}
      ${a ? `<span class="verdict ${VERDICT_CLASS[a.verdict] ?? ''}">${esc(verdictLabel(a))}</span>` : ''}
    </div>`;
}).join('\n')}
  </div>
</div>`;

  return {
    height: 240 + rows * (box + 190),
    source: artboard({
      name: 'Range',
      body,
      css: boardCss(),
      fonts: BOARD_FONTS,
      systemNote: `Every concept at one size, ${GENERATED} plan.\nMarks are forced to black here regardless of how they were drawn.`,
    }),
  };
}

/** The 16 pixel wall, in real tab chrome. */
export function faviconBoard({ candidates, brandName, sizes = [16, 32, 64] }) {
  const tab = (c, px) => `      <div style="display:flex;align-items:center;gap:8px;background:#F1F1F1;border:1px solid #DDD;border-bottom:none;border-radius:8px 8px 0 0;padding:8px 12px;width:${Math.max(150, 70 + px * 2)}px;">
        <span style="flex:none;width:${px}px;height:${px}px;display:block;">${boxed(c.svg, { prefix: `f${px}-${c.id}`, colour: INK, box: px, label: '' })}</span>
        <span style="font-size:11px;color:#444;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(brandName)}</span>
      </div>`;

  const body = `<div class="board">
${head(`${brandName} / small sizes`, 'At the size people actually see it',
  'A browser tab is sixteen pixels. Most lockups do not survive it, and that is not a defect: it is what the small-grade mark is for. What matters here is whether anything is still identifiable, and whether the shapes stay apart.')}
${candidates.map((c) => `  <div style="display:flex;align-items:flex-end;gap:32px;padding:20px 0;border-bottom:1px solid #E4E4E4;">
    <span class="cell__id" style="width:44px;flex:none;">${esc(c.id)}</span>
${sizes.map((px) => tab(c, px)).join('\n')}
    <span style="flex:none;width:64px;height:64px;background:${REVERSE_GROUND};display:flex;align-items:center;justify-content:center;">${boxed(c.svg, { prefix: `fr-${c.id}`, colour: '#FFFFFF', box: 40, label: '' })}</span>
    <span class="cell__meta" style="flex:1;">${esc(c.architectureName ?? c.architecture ?? '')}</span>
  </div>`).join('\n')}
  <p class="lede" style="margin-top:28px;">The last square is the same mark reversed at 64 pixels, because a mark that only holds on white holds nowhere at night.</p>
</div>`;

  return {
    height: 380 + candidates.length * 105,
    source: artboard({
      name: 'Favicons',
      body,
      css: boardCss(),
      fonts: BOARD_FONTS,
      systemNote: `Small-size wall, ${GENERATED} plan.\nEvery mark is drawn at its real pixel size. Do not scale this artboard when reading it.`,
    }),
  };
}

/** Knocked out of a dark ground. */
export function reverseBoard({ candidates, brandName, columns = 4, box = 180 }) {
  const rows = Math.ceil(candidates.length / columns);
  const body = `<div class="board" style="background:${REVERSE_GROUND};color:#FFFFFF;">
  <div>
    <span class="eyebrow" style="color:#9A9A9A;">${esc(brandName)} / reversed</span>
    <h1 style="color:#FFFFFF;">Out of the dark</h1>
    <p class="lede" style="color:#C9C9C9;">Dark mode, night signage, a black envelope, a photograph. A mark defined by a white knockout disappears here, and a mark with fine counters fills in.</p>
  </div>
  <div class="rule" style="background:#3A3A3A;"></div>
  <div class="grid" style="grid-template-columns: repeat(${columns}, 1fr);">
${candidates.map((c) => `    <div class="cell" style="border-color:#3A3A3A;">
      <div class="cell__art">${boxed(c.svg, { prefix: `d-${c.id}`, colour: '#FFFFFF', box, label: `Concept ${c.id} reversed` })}</div>
      <span class="cell__id" style="color:#9A9A9A;">${esc(c.id)}</span>
    </div>`).join('\n')}
  </div>
</div>`;

  return {
    height: 260 + rows * (box + 120),
    source: artboard({
      name: 'Reversed',
      body,
      css: boardCss(),
      fonts: BOARD_FONTS,
      systemNote: `Reverse rendition, ${GENERATED} plan.\nThe ground is the darkest neutral, not the brand colour, because the brand colour is not decided yet.`,
    }),
  };
}

/**
 * What the arithmetic found.
 *
 * Shown to the person deciding, not hidden in a log, because "this one fails the
 * favicon" is an argument anybody can check, and "I prefer that one" is not.
 */
export function auditBoard({ candidates, audits, brandName }) {
  const rowFor = (a) => {
    const c = candidates.find((x) => x.id === a.id);
    const fails = a.contexts.filter((r) => r.status === 'fail');
    const deferred = a.contexts.filter((r) => r.status === 'deferred');
    const notes = a.findings.filter((f) => f.severity !== 'note');
    return `    <tr>
      <td><b>${esc(a.id)}</b><br><span style="color:#6B6B6B;">${esc(c?.registerName ?? c?.register ?? '')}</span></td>
      <td><span class="verdict ${VERDICT_CLASS[a.verdict] ?? ''}">${esc(verdictLabel(a))}</span></td>
      <td>${fails.length ? fails.map((r) => `<b>${esc(r.name)}</b>: ${esc(r.reasons[0] ?? '')}`).join('<br>') : '<span style="color:#6B6B6B;">none</span>'}</td>
      <td>${notes.length ? notes.map((f) => `${esc(f.message)}`).join('<br>') : '<span style="color:#6B6B6B;">nothing</span>'}</td>
      <td><span style="color:#6B6B6B;">${deferred.length ? esc(deferred.map((r) => r.name).join(', ')) : 'none'}</span></td>
    </tr>`;
  };

  const body = `<div class="board">
${head(`${brandName} / audit`, 'What the arithmetic found',
  'Run before anybody said what they liked, because a mark that has been praised is very hard to fail on a number afterwards.')}
  <table>
    <tr><th style="width:110px;">Concept</th><th style="width:130px;">Verdict</th><th>Failed</th><th>Notes</th><th style="width:180px;">Handed to another asset</th></tr>
${audits.map(rowFor).join('\n')}
  </table>
  <div class="rule"></div>
  <p class="lede"><b>Handed to another asset</b> is not a failure. A lockup cannot work at sixteen pixels and is still the right primary mark, because the small-grade version carries that context. The budget of two failures applies to the system of three assets, not to any one file.</p>
  <p class="lede">Each threshold is the thinnest stroke and the smallest gap a mark can carry in a given use, from a browser tab at sixteen pixels to embroidery and signage, before it stops reading. Where a number was derived rather than measured, the audit says so and gives the reasoning.</p>
</div>`;

  return {
    height: 460 + audits.length * 78,
    source: artboard({
      name: 'Audit',
      body,
      css: boardCss(),
      fonts: BOARD_FONTS,
      systemNote: `Mechanical audit, ${GENERATED} plan and the rendered measurements.\nDo not hand-edit: rerunning the audit regenerates it.`,
    }),
  };
}

/**
 * The whole round.
 *
 * Returns entries in the shape `canvasManifest` wants, with real frame sizes
 * computed from the content rather than a guess, because a frame smaller than
 * its artboard clips and that is not recoverable without a re-seed.
 */
export function conceptRoundBoards({ plan, candidates, audits = [], brandName = 'Brand' }) {
  if (!candidates.length) throw new TypeError('a concept round needs at least one candidate');
  const filled = audits.length ? audits : candidates.map((c) => ({ id: c.id, verdict: 'contender', findings: [], contexts: [] }));

  const columns = candidates.length <= 4 ? candidates.length : candidates.length <= 9 ? 3 : 4;
  const wide = FRAMES.desktopTall.w;

  const range = rangeBoard({ candidates, audits: filled, brandName, columns });
  const favicons = faviconBoard({ candidates, brandName });
  const reverse = reverseBoard({ candidates, brandName, columns });
  const audit = auditBoard({ candidates, audits: filled, brandName });
  const index = indexBoard({ plan, candidates, audits: filled, brandName });

  // No `page` field. The canvas shows one round at a time, and an artboard that
  // names a page the manifest does not list is refused outright by the design
  // helper: "the editor drops the field; list the pages or remove it". A
  // single-page canvas omits pages rather than naming its one page, which is
  // what the canvas format asks for.
  return [
    { file: 'Main.dc.html', source: index.source, w: 1200, h: index.height },
    { file: 'Range.dc.html', source: range.source, w: wide, h: range.height },
    { file: 'Favicons.dc.html', source: favicons.source, w: 1200, h: favicons.height },
    { file: 'Reversed.dc.html', source: reverse.source, w: wide, h: reverse.height },
    { file: 'Audit.dc.html', source: audit.source, w: 1440, h: audit.height },
  ];
}


// ---------------------------------------------------------------------------
// The colour stage
// ---------------------------------------------------------------------------

/**
 * The colourway boards.
 *
 * Same chrome as the concept boards, and for the same reason: a presentation
 * styled in one of the things being presented puts a thumb on the scale. The
 * only difference is that here the artwork carries colour and the chrome still
 * does not.
 *
 * Every treatment appears three times in one row: on its own ground, in
 * greyscale, and at sixteen pixels. That layout IS the rule. If the middle cell
 * stops looking like the mark, the colourway was carrying something the
 * silhouette cannot carry, and nobody has to be told that in words.
 */
const VERDICT_COLOUR = {
  usable: 'v-contender',
  'usable-with-notes': 'v-notes',
  unverified: 'v-notes',
  rejected: 'v-rejected',
};

const VERDICT_COLOUR_LABEL = {
  usable: 'clears every test',
  'usable-with-notes': 'clears, with notes',
  unverified: 'not measured, no browser',
  rejected: 'ruled out',
};

/** One treatment, drawn on its ground. */
const onGroundCell = (c, box, groundHex, prefix, label) =>
  `<div style="background:${groundHex};min-height:${box + 56}px;display:flex;align-items:center;justify-content:center;padding:28px;border:1px solid #E4E4E4;">${boxed(c.svg, { prefix, box, label })}</div>`;

/** The index: what the set is, and the rule it is here to make visible. */
export function colourIndexBoard({ colourways, regions, brandName, notes, masterApprovedBy, audits }) {
  const counted = (v) => audits.filter((a) => a?.verdict === v).length;
  const body = `<div class="board">
${head(`${brandName} / colour`, 'Colour, after the silhouette',
  'The concept round was black on white because a mark rescued by a good palette is a decision you find out about eighteen months later, on a one-colour press. The shape is approved. This is the stage where colour joins it, and nothing here may carry meaning the silhouette cannot carry alone.')}
  <p class="lede"><b>The mark was approved by ${esc(masterApprovedBy ?? 'nobody yet')}.</b> It is drawn in ${regions.length === 1 ? 'one ink' : `${regions.length} inks`}${regions.length ? `: ${regions.map((r) => `${r.id} (${r.ink})`).join(', ')}` : ''}. Every treatment below maps those inks to roles in this brand's palette. None of them holds a colour of its own, so all of them move when the palette moves.</p>
  <div class="rule"></div>
  <div class="grid" style="grid-template-columns: repeat(2, 1fr);">
${colourways.map((c) => {
  const a = audits.find((x) => x?.id === c.id);
  return `    <div class="cell">
      <span class="cell__id">${esc(c.id)}</span>
      <h2>${esc(c.name)}</h2>
      <p class="cell__meta">${esc(c.idea)}</p>
      <p class="cell__meta"><b>${esc(c.regions.map((r) => `${r.region} to ${r.role}`).join(', '))}</b><br>on ${esc(c.ground)} &middot; ${esc(c.basis)}</p>
      ${a ? `<span class="verdict ${VERDICT_COLOUR[a.verdict] ?? ''}" style="align-self:flex-start;">${esc(VERDICT_COLOUR_LABEL[a.verdict] ?? a.verdict)}</span>` : ''}
    </div>`;
}).join('\n')}
  </div>
  <div class="rule"></div>
  <table>
    <caption>What each board in this set is for.</caption>
    <tr><th>Board</th><th>What it is for</th></tr>
    <tr><td><b>Colourways</b></td><td>Each treatment on its ground, beside its own greyscale and its own 16 pixel render. The one board that settles this stage.</td></tr>
    <tr><td><b>Grounds</b></td><td>Every treatment on every ground this brand actually uses, with the contrast of each.</td></tr>
    <tr><td><b>Audit</b></td><td>The paint ceilings, the one-colour test and colour vision, run before anybody said what they liked.</td></tr>
  </table>
${notes.length ? `  <div class="rule"></div>\n${notes.map((n) => `  <p class="lede">${esc(n)}</p>`).join('\n')}` : ''}
  <div class="rule"></div>
  <p class="lede"><b>${counted('usable')} clear every test, ${counted('usable-with-notes')} clear with notes, and ${counted('rejected')} ${counted('rejected') === 1 ? 'is' : 'are'} ruled out.</b> A treatment is ruled out on arithmetic, never on taste, and a person still picks which of the survivors the brand uses.</p>
</div>`;

  return { height: 900, source: artboard({ name: 'Main', body, css: boardCss(), fonts: BOARD_FONTS, systemNote: `Colourway set, ${GENERATED} palette and the approved master.\nDo not hand-edit: replanning the colour stage regenerates it.` }) };
}

/**
 * Colour, greyscale, sixteen pixels. In that order, in one row, every time.
 *
 * The greyscale is each colour reduced to its OWN grey rather than flattened to
 * black, because that is what a photocopier and a monochrome screen do, and it
 * is the picture that shows whether two parts of the mark stop being two parts.
 */
export function colourwayStripBoard({ colourways, brandName, grounds, audits, box = 190 }) {
  const paper = grounds['neutral.paper'] ?? PAPER;
  const body = `<div class="board">
${head(`${brandName} / colourways`, 'Each treatment, its greyscale and its favicon',
  'Left is the treatment on the ground it is for. Middle is the same file with every colour reduced to its own grey, which is what a photocopier and a black and white printer make of it. Right is sixteen pixels, which is what a browser tab makes of it. If the mark stops being the mark as you move right, the colour was doing work the shape should have been doing.')}
  <div style="display:grid;grid-template-columns:150px repeat(3,minmax(0,1fr)) 190px;gap:0 10px;margin-bottom:10px;">
    <span></span><span class="label cell__id">On its ground</span><span class="label cell__id">Greyscale</span><span class="label cell__id">One ink</span><span class="label cell__id">16, 32 and 64 pixels</span>
  </div>
${colourways.map((c) => {
  const a = audits.find((x) => x?.id === c.id);
  const ground = grounds[c.ground] ?? paper;
  return `  <div style="display:grid;grid-template-columns:150px repeat(3,minmax(0,1fr)) 190px;gap:0 10px;align-items:stretch;margin-bottom:10px;">
    <div style="display:flex;flex-direction:column;justify-content:center;gap:6px;padding-right:12px;">
      <b style="font-size:14px;">${esc(c.name)}</b>
      <span class="cell__id">${esc(c.id)}</span>
      ${a ? `<span class="verdict ${VERDICT_COLOUR[a.verdict] ?? ''}" style="align-self:flex-start;">${esc(VERDICT_COLOUR_LABEL[a.verdict] ?? a.verdict)}</span>` : ''}
    </div>
    ${onGroundCell(c, box, ground, `cw-${c.id}`, `${c.name}`)}
    <div style="background:${greyOf(ground)};min-height:${box + 56}px;display:flex;align-items:center;justify-content:center;padding:28px;border:1px solid #E4E4E4;">${boxed(greyscaleSvg(c.svg), { prefix: `cg-${c.id}`, box, label: `${c.name}, greyscale` })}</div>
    <div style="background:${greyOf(ground) === '#FFFFFF' || relativeLuminance(greyOf(ground)) > 0.3 ? PAPER : INK};min-height:${box + 56}px;display:flex;align-items:center;justify-content:center;padding:28px;border:1px solid #E4E4E4;">${boxed(c.svg, { prefix: `ck-${c.id}`, colour: relativeLuminance(greyOf(ground)) > 0.3 ? INK : '#FFFFFF', box, label: `${c.name}, one ink` })}</div>
    <div style="display:flex;align-items:center;gap:14px;background:${ground};padding:0 16px;border:1px solid #E4E4E4;">
${[16, 32, 64].map((px) => `      <span style="flex:none;width:${px}px;height:${px}px;display:block;">${boxed(c.svg, { prefix: `c${px}-${c.id}`, box: px, label: '' })}</span>`).join('\n')}
    </div>
  </div>`;
}).join('\n')}
  <p class="lede" style="margin-top:24px;">The one-ink column is not the same picture as the greyscale one. Greyscale keeps each colour's lightness; one ink throws it away, which is what etching, foil, embroidery and a rubber stamp do. A mark that survives the middle column and not the third one has a problem the colourway cannot fix.</p>
</div>`;

  return { height: 420 + colourways.length * (box + 70), source: artboard({ name: 'Colourways', body, css: boardCss(), fonts: BOARD_FONTS, systemNote: `Colourway proofs, ${GENERATED} palette.\nEvery mark is the same geometry; only the paint differs. The 16px cells are at real size: do not scale this artboard when reading it.` }) };
}

/** Every treatment on every ground the brand uses, with the contrast of each. */
export function colourGroundsBoard({ colourways, brandName, grounds, audits, box = 110 }) {
  const list = Object.entries(grounds);
  const body = `<div class="board">
${head(`${brandName} / grounds`, 'On everything it will sit on',
  'A treatment is approved for the ground it was drawn for, and the others are shown so the gap is visible rather than discovered. The number under each is the WCAG contrast of the mark against that ground. Three to one is the floor for a graphic; under it the mark disappears in bright light and under a photocopier.')}
  <div style="display:grid;grid-template-columns:170px repeat(${list.length},minmax(0,1fr));gap:0 8px;margin-bottom:8px;">
    <span></span>${list.map(([role, hex]) => `<span class="label cell__id">${esc(role)} ${esc(hex)}</span>`).join('')}
  </div>
${colourways.map((c) => {
  const a = audits.find((x) => x?.id === c.id);
  return `  <div style="display:grid;grid-template-columns:170px repeat(${list.length},minmax(0,1fr));gap:0 8px;align-items:stretch;margin-bottom:8px;">
    <div style="display:flex;flex-direction:column;justify-content:center;gap:4px;padding-right:12px;"><b style="font-size:13px;">${esc(c.name)}</b><span class="cell__id">${esc(c.id)}</span></div>
${list.map(([role, hex]) => {
    const rows = (a?.contrast ?? []).filter((r) => r.ground === role);
    const worst = rows.length ? rows.reduce((lo, r) => (r.ratio < lo.ratio ? r : lo)) : null;
    const own = c.ground === role;
    return `    <div style="background:${hex};border:${own ? '2px solid #111111' : '1px solid #E4E4E4'};padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;">
      ${boxed(c.svg, { prefix: `g-${c.id}-${role.replace(/\W/g, '')}`, box, label: `${c.name} on ${role}` })}
      <span style="font-size:11px;font-family:ui-monospace,Menlo,monospace;color:${relativeLuminance(hex) > 0.4 ? '#3A3A3A' : '#E4E4E4'};">${worst ? `${worst.ratio.toFixed(2)}:1${worst.ratio < 3 ? ' too low' : ''}` : ''}${own ? ' &middot; its own ground' : ''}</span>
    </div>`;
  }).join('\n')}
  </div>`;
}).join('\n')}
  <p class="lede" style="margin-top:24px;">The bordered cell is the ground the treatment is for. Where a mark is shown on a ground it was not drawn for, the number says what happens, and the answer is usually to use the treatment that was drawn for it rather than to adjust this one.</p>
</div>`;

  return { height: 400 + colourways.length * (box + 80), source: artboard({ name: 'Grounds', body, css: boardCss(), fonts: BOARD_FONTS, systemNote: `Grounds and contrast, ${GENERATED} palette.\nEvery contrast figure is computed, not typed.` }) };
}

/** What the arithmetic found, including how each treatment reads under CVD. */
export function colourAuditBoard({ colourways, brandName, audits, coverage, setFindings }) {
  const rowFor = (c) => {
    const a = audits.find((x) => x?.id === c.id);
    if (!a) return '';
    const errors = a.findings.filter((f) => f.severity === 'error');
    const deferred = a.contexts.filter((r) => r.status === 'deferred');
    return `    <tr>
      <td><b>${esc(c.name)}</b><br><span style="color:#6B6B6B;">${esc(c.id)}</span></td>
      <td><span class="verdict ${VERDICT_COLOUR[a.verdict] ?? ''}">${esc(VERDICT_COLOUR_LABEL[a.verdict] ?? a.verdict)}</span></td>
      <td>${a.paints} ${a.paints === 1 ? 'colour' : 'colours'}<br><span style="color:#6B6B6B;">${(a.inks ?? []).map(esc).join('<br>')}</span></td>
      <td>${a.oneColour?.available ? `${a.oneColour.colourRegions} ${a.oneColour.colourRegions === 1 ? 'shape' : 'shapes'} in colour, ${a.oneColour.inkRegions} in one ink${a.oneColour.colourRegions > a.oneColour.inkRegions ? ', colour is carrying the split' : ''}` : '<span style="color:#6B6B6B;">not measured, no browser</span>'}</td>
      <td>${(a.cvd ?? []).map((v) => `<span style="display:inline-flex;gap:3px;align-items:center;margin-right:10px;">${v.inks.map((i) => `<span style="width:14px;height:14px;display:inline-block;background:${i.as};border:1px solid #CCC;"></span>`).join('')}<span style="font-size:10px;color:#6B6B6B;">${esc(v.type.slice(0, 5))}</span></span>`).join('')}</td>
      <td>${errors.length ? errors.map((f) => esc(f.message)).join('<br>') : '<span style="color:#6B6B6B;">nothing</span>'}</td>
      <td><span style="color:#6B6B6B;">${deferred.length ? esc(deferred.map((r) => r.name).join(', ')) : 'none'}</span></td>
    </tr>`;
  };

  const body = `<div class="board">
${head(`${brandName} / colour audit`, 'What the arithmetic found',
  'Run before anybody said which treatment they liked. The one-colour column is the test this whole stage exists for: if a treatment reads as more shapes in colour than it does in one ink, colour is carrying meaning the silhouette cannot carry, and it merges the moment the mark is etched, embroidered or faxed.')}
  <table>
    <caption>Every treatment, what the arithmetic found and what ruled it out.</caption>
    <tr><th style="width:150px;">Treatment</th><th style="width:120px;">Verdict</th><th style="width:110px;">Colours</th><th style="width:210px;">One colour</th><th style="width:220px;">Colour vision</th><th>Ruled out by</th><th style="width:150px;">Handed to another treatment</th></tr>
${colourways.map(rowFor).join('\n')}
  </table>
  <div class="rule"></div>
  <table>
    <caption>Every application context, its colour ceiling and the treatments that can serve it.</caption>
    <tr><th>Context</th><th>Colour ceiling</th><th>Which treatments can be used for it</th></tr>
${(coverage ?? []).map((c) => `    <tr><td><b>${esc(c.name)}</b></td><td>${c.ceiling}</td><td>${c.servedBy.length ? esc(c.servedBy.join(', ')) : '<span style="color:#8A2B14;">nothing in this set</span>'}</td></tr>`).join('\n')}
  </table>
${setFindings?.length ? `  <div class="rule"></div>\n${setFindings.map((f) => `  <p class="lede"><b>${esc(f.message)}</b> ${esc(f.fix ?? '')}</p>`).join('\n')}` : ''}
  <div class="rule"></div>
  <p class="lede"><b>Handed to another treatment</b> is not a failure. A two-colour mark cannot be foil stamped and is not defective, because the one-ink treatment is what goes to the foil house. What would be a failure is a context nothing in the set can serve, and the table above says whether there is one.</p>
  <p class="lede">The colour vision swatches are the treatment's own colours as they are seen under protanopia, deuteranopia and tritanopia. Two swatches in a row that look the same are two parts of the mark that look the same to roughly one man in twelve.</p>
</div>`;

  return { height: 620 + colourways.length * 96 + (coverage?.length ?? 0) * 40, source: artboard({ name: 'Audit', body, css: boardCss(), fonts: BOARD_FONTS, systemNote: `Colour audit, ${GENERATED} palette and the rendered measurements.\nDo not hand-edit: rerunning the audit regenerates it.` }) };
}

/** The colour stage as a canvas, in the shape `canvasManifest` wants. */
export function colourwayBoards({ colourways, regions, system, notes = [], brandName = 'Brand', masterApprovedBy = null, coverage = [], setFindings = [] }) {
  if (!colourways.length) throw new TypeError('the colour stage needs at least one colourway');
  const audits = colourways.map((c) => c.audit ?? null);
  const grounds = Object.fromEntries(groundsOf(system).map((g) => [g.role, g.hex]));

  const index = colourIndexBoard({ colourways, regions, brandName, notes, masterApprovedBy, audits });
  const strip = colourwayStripBoard({ colourways, brandName, grounds, audits });
  const ground = colourGroundsBoard({ colourways, brandName, grounds, audits });
  const audit = colourAuditBoard({ colourways, brandName, audits, coverage, setFindings });

  return [
    { file: 'Main.dc.html', source: index.source, w: 1200, h: index.height },
    { file: 'Colourways.dc.html', source: strip.source, w: FRAMES.desktopTall.w, h: strip.height },
    { file: 'Grounds.dc.html', source: ground.source, w: 1200, h: ground.height },
    { file: 'Audit.dc.html', source: audit.source, w: 1600, h: audit.height },
  ];
}

// ---------------------------------------------------------------------------
// Frames
// ---------------------------------------------------------------------------

/**
 * Ask the browser how tall each board actually is.
 *
 * The heights each board returns are an estimate built from the parts it knows
 * about, and an estimate is wrong the moment a brand name wraps or a finding
 * runs to three lines. A frame shorter than its artboard clips it, and clipping
 * is the one canvas failure that cannot be undone without re-seeding the whole
 * thing, so this is the wrong place to be approximately right.
 *
 * One page, every board stacked at its real width, and the browser reports each
 * one's height. One launch for the set rather than one per board.
 */
export async function fitFrames(boards, { chrome = findChrome(), timeout = 60000 } = {}) {
  if (!chrome || !boards.length) return boards;

  const sections = boards.map((b, i) => {
    // The artboard is a whole document. Only its style block and its <x-dc>
    // content are needed to measure it, and taking them apart here means the
    // measurement runs against exactly the markup that will be published.
    const style = /<style>([\s\S]*?)<\/style>/.exec(b.source)?.[1] ?? '';
    const inner = /<x-dc>([\s\S]*?)<\/x-dc>/.exec(b.source)?.[1] ?? '';
    return `<div class="probe" data-i="${i}" style="width:${b.w}px">
<style>${style}</style>
${inner}
</div>`;
  }).join('\n');

  const html = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0}.probe{position:relative;overflow:visible}</style>
${sections}
<div id="out"></div>
<script>
  var r = [];
  var probes = document.querySelectorAll('.probe');
  for (var i = 0; i < probes.length; i++) {
    r.push(probes[i].dataset.i + ':' + Math.ceil(probes[i].getBoundingClientRect().height));
  }
  document.getElementById('out').textContent = 'HEIGHTS[' + r.join(',') + ']';
</script>`;

  const dir = path.join(os.tmpdir(), `brandi-frames-${process.pid}-${Math.random().toString(36).slice(2)}`);
  await mkdir(dir, { recursive: true });
  try {
    const file = path.join(dir, 'probe.html');
    await writeFile(file, html);
    const { stdout } = await run(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      '--no-default-browser-check', '--force-device-scale-factor=1',
      '--virtual-time-budget=4000', '--window-size=1600,4000',
      '--dump-dom', pathToFileURL(file).href,
    ], { timeout, maxBuffer: 32 * 1024 * 1024 });

    const found = /HEIGHTS\[([^\]]*)\]/.exec(stdout);
    if (!found) return boards;
    const heights = new Map();
    for (const pair of found[1].split(',')) {
      const [i, h] = pair.split(':').map(Number);
      if (Number.isFinite(i) && Number.isFinite(h) && h > 0) heights.set(i, h);
    }
    // Never shrink below the estimate. A probe that measured short because a web
    // font had not arrived would clip, which is the failure this exists to stop.
    return boards.map((b, i) => (heights.has(i) ? { ...b, h: Math.max(b.h, heights.get(i)) } : b));
  } catch {
    // A measurement that did not happen leaves the estimate in place. It is
    // generous rather than tight, so the worst case is a frame with air in it.
    return boards;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export default {
  inlineSvg,
  indexBoard,
  rangeBoard,
  faviconBoard,
  reverseBoard,
  auditBoard,
  conceptRoundBoards,
  colourIndexBoard,
  colourwayStripBoard,
  colourGroundsBoard,
  colourAuditBoard,
  colourwayBoards,
  fitFrames,
};
