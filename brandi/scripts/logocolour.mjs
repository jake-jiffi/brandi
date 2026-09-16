/**
 * The colour stage of the logo forge.
 *
 * One rule holds this whole file together, and it is a rule about sequence
 * rather than about taste: **you have to love the mark as a silhouette before
 * colour enters.** The concept round is black on white. Colour is a later
 * stage, it is gated on a master a person has approved and on a palette the
 * system has resolved, and a colourway may never carry meaning the silhouette
 * cannot carry alone.
 *
 * So the geometry stays the single source. There is one mark, and a colourway
 * is a VIEW of it: a mapping from the inks the mark was drawn in to the roles
 * the brand's palette defines. No colourway holds a hex of its own. Change the
 * palette and every colourway follows; change the mark and the mapping is
 * checked against it before anything is rendered.
 *
 * A region is an ink the artist actually put down, not a node and not a path
 * command. A mark drawn in one ink has one region and can only take the
 * treatments a one-region mark can take, which this says plainly rather than
 * inventing a boundary to colour.
 */

import { collectShapes, describeSvg } from './svg.mjs';
import { renderBatch } from './logoaudit.mjs';
import { monochromeSvg } from './assets.mjs';
import {
  contrastReport, simulateCvd, cvdSafePair, relativeLuminance,
  linearToSrgb, toHex, parseHex, bestTextOn,
} from './color.mjs';
import { CONTEXTS } from './logospec.mjs';

/** Everything that paints, matched the way `monochromeSvg` matches it. */
const PAINT = /(fill|stroke|stop-color|flood-color|lighting-color)\s*[:=]\s*(["']?)(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-z]+)\2/gi;

const NAMED = { black: '#000000', white: '#ffffff' };

/**
 * One spelling for one colour, so `#111` and `#111111` are one region.
 *
 * Anything this cannot canonicalise is returned lowercased and used as written,
 * which keeps an `rgb()` or an exotic keyword working as its own region rather
 * than being silently merged with something else.
 */
export function canonicalPaint(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (NAMED[raw]) return NAMED[raw];
  const m = /^#([0-9a-f]{3,8})$/.exec(raw);
  if (!m) return raw;
  const h = m[1];
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  if (h.length === 4) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  if (h.length === 6) return `#${h}`;
  if (h.length === 8) return `#${h.slice(0, 6)}`;
  return raw;
}

// ---------------------------------------------------------------------------
// The roles a colourway may name
// ---------------------------------------------------------------------------

/**
 * The palette roles a colourway is allowed to name, each resolved to a hex.
 *
 * Deliberately the same vocabulary the print swatches use. A colourway and a
 * Pantone are the same decision in two media, and naming them differently is
 * how a mark ends up printed in a colour the screen never sanctioned.
 */
export function colourRoles(system) {
  const out = new Map();
  for (const sw of system?.print?.swatches ?? []) {
    if (sw.role && sw.hex) out.set(sw.role, sw.hex);
  }
  const brand = system?.palettes?.brand?.light;
  if (brand?.onSolid?.color) out.set('brand.on-solid', brand.onSolid.color);
  if (brand?.solidStrong?.hex) out.set('brand.solid-strong', brand.solidStrong.hex);
  return out;
}

/** The hex a role resolves to, or null when the palette does not define it. */
export const resolveRole = (system, role) => colourRoles(system).get(role) ?? null;

// ---------------------------------------------------------------------------
// Regions
// ---------------------------------------------------------------------------

/**
 * The inks a mark was drawn in, largest first.
 *
 * `share` is the area of the shapes carrying that ink as a fraction of the area
 * of all painted shapes, measured on bounding boxes. Bounding boxes over-state
 * a diagonal and under-state nothing, which is accurate enough to order two
 * inks and is not accurate enough to quote as coverage, so it is only ever used
 * to order them and to name the larger one.
 *
 * `unpainted` is the hole this has to report rather than paper over. A shape
 * with no explicit fill anywhere above it is painted black by the SVG initial
 * value, and there is no literal in the file to map to a role, so it cannot be
 * given one. The concept draw block already requires an explicit fill on every
 * painted node; this is where that requirement is collected.
 */
export function regionsOf(svg) {
  const literal = new Set(
    describeSvg(svg).paints.map(canonicalPaint),
  );
  const byInk = new Map();
  const unpainted = [];

  for (const shape of collectShapes(svg)) {
    if (shape.hidden || !shape.paints) continue;
    const area = shape.bbox ? Math.abs(shape.bbox.width * shape.bbox.height) : 0;
    for (const paint of [shape.fill, shape.stroke]) {
      if (!paint || paint === 'none' || String(paint).startsWith('url(')) continue;
      const ink = canonicalPaint(paint);
      if (!literal.has(ink)) {
        if (!unpainted.includes(shape.tag)) unpainted.push(shape.tag);
        continue;
      }
      const entry = byInk.get(ink) ?? { ink, shapes: 0, area: 0 };
      entry.shapes++;
      entry.area += area;
      byInk.set(ink, entry);
    }
  }

  const total = [...byInk.values()].reduce((n, r) => n + r.area, 0);
  const regions = [...byInk.values()]
    .sort((a, b) => b.area - a.area || a.ink.localeCompare(b.ink))
    .map((r, i) => ({
      id: `region-${i + 1}`,
      ink: r.ink,
      shapes: r.shapes,
      share: total > 0 ? Number((r.area / total).toFixed(4)) : 0,
    }));

  return { regions, unpainted };
}

/** A region said in a way a finding can name it. */
export const describeRegion = (r) =>
  `${r.id} (drawn in ${r.ink}, ${Math.round(r.share * 100)} per cent of the drawing)`;

// ---------------------------------------------------------------------------
// Applying a colourway
// ---------------------------------------------------------------------------

/**
 * Replace every ink in the mark with the colour the map gives for it.
 *
 * The same single pass `monochromeSvg` makes, with a map instead of one colour.
 * `none` and `url(...)` survive untouched, because a shape that was deliberately
 * unpainted becoming solid is how a mark fills in, and a gradient reference is
 * not an ink.
 */
export function recolourSvg(svg, inkToColour) {
  return String(svg).replace(PAINT, (m, prop, q, value) => {
    if (/^none$/i.test(value) || /^url\(/i.test(value)) return m;
    const to = inkToColour[canonicalPaint(value)];
    if (!to) return m;
    return `${prop}${m.includes(':') && !m.includes('=') ? ':' : '='}${q}${to}${q}`;
  });
}

/**
 * Resolve a recorded colourway into the colours it actually paints.
 *
 * Refuses rather than guesses. A mapping that names a role the palette does not
 * define, or an ink the master no longer carries, is a mapping written against
 * a different brand or a different mark, and rendering it would produce a file
 * that looks finished and is not the system.
 */
export function resolveColourway(colourway, { system, regions }) {
  const roles = colourRoles(system);
  const known = new Map(regions.map((r) => [r.ink, r]));
  const errors = [];
  const inkToColour = {};
  const parts = [];

  for (const entry of colourway.regions ?? []) {
    const ink = canonicalPaint(entry.ink);
    const hex = roles.get(entry.role);
    if (!hex) {
      errors.push(`${colourway.id} maps ${entry.region ?? ink} to "${entry.role}", which this palette does not define. It has: ${[...roles.keys()].join(', ')}.`);
      continue;
    }
    if (!known.has(ink)) {
      errors.push(`${colourway.id} maps an ink the mark no longer carries (${ink}). The master has: ${regions.map((r) => r.ink).join(', ') || 'nothing painted'}. Plan the colourways again against the current master.`);
      continue;
    }
    inkToColour[ink] = hex;
    parts.push({ ...entry, ink, hex, region: known.get(ink).id, share: known.get(ink).share });
  }

  const uncovered = regions.filter((r) => !(r.ink in inkToColour));
  if (uncovered.length) {
    errors.push(`${colourway.id} says nothing about ${uncovered.map(describeRegion).join(' or ')}. Every region the mark carries needs a role, or the mark renders half in the palette and half as drawn.`);
  }

  const groundHex = colourway.ground ? roles.get(colourway.ground) : null;
  if (colourway.ground && !groundHex) {
    errors.push(`${colourway.id} sits on "${colourway.ground}", which this palette does not define.`);
  }

  return { ok: errors.length === 0, errors, inkToColour, parts, ground: groundHex ?? null };
}

/** The mark, painted in a colourway. */
export function renderColourway(master, colourway, { system, regions }) {
  const resolved = resolveColourway(colourway, { system, regions });
  if (!resolved.ok) throw new Error(resolved.errors.join('\n'));
  return recolourSvg(master, resolved.inkToColour);
}

/**
 * The same colourway with every colour reduced to its own grey.
 *
 * Not the flat one-ink collapse: this keeps each colour's LIGHTNESS and throws
 * away only its hue, which is what a black and white printer, a photocopier and
 * a monochrome screen do. It is the picture that answers Jake's rule on the
 * board: if two parts of the mark stop being two parts here, colour was doing
 * the work the shape should have been doing.
 */
export function greyscaleSvg(svg) {
  return String(svg).replace(PAINT, (m, prop, q, value) => {
    if (/^none$/i.test(value) || /^url\(/i.test(value)) return m;
    let hex;
    try { hex = greyOf(canonicalPaint(value)); } catch { return m; }
    return `${prop}${m.includes(':') && !m.includes('=') ? ':' : '='}${q}${hex}${q}`;
  });
}

/** One colour, flattened to the grey of the same luminance. */
export function greyOf(hex) {
  parseHex(hex);
  const c = linearToSrgb(relativeLuminance(hex));
  return toHex({ r: c, g: c, b: c });
}

// ---------------------------------------------------------------------------
// Dealing the treatments
// ---------------------------------------------------------------------------

/**
 * A small set of colourways, each a different structural idea.
 *
 * Four treatments every mark can take, and two more that exist only when the
 * mark's own geometry offers a boundary to put a second colour on. A mark drawn
 * in one ink gets four and is told so, rather than having a region invented for
 * it so the set can reach six.
 *
 * The two-colour pair look like one idea in two hues and are not. `two-colour`
 * asks the second part to recede into ink; `two-colour-accent` asks it to stand
 * up. Those are opposite answers to the same question about the mark, and a
 * person looking at a board can only tell them apart by seeing both.
 */
export function planColourways({ regions, system }) {
  const roles = colourRoles(system);
  const notes = [];
  const out = [];
  const all = (role) => regions.map((r) => ({ region: r.id, ink: r.ink, role }));

  if (!regions.length) {
    return { colourways: [], notes: ['The master has no painted region this can map, so there is nothing to colour.'] };
  }

  if (roles.has('brand.solid')) {
    out.push({
      id: 'brand-on-paper',
      name: 'Brand on paper',
      idea: 'The mark positive, in the brand colour, on the page. The default on everything printed on white and everything on a light screen.',
      basis: 'every region in one role',
      ground: 'neutral.paper',
      regions: all('brand.solid'),
    });
    out.push({
      id: 'reversed-on-brand',
      name: 'Reversed out of the brand ground',
      idea: 'The mark is the paper and the brand colour is the field. A coloured panel, a tote, a van door.',
      basis: 'every region in one role',
      ground: 'brand.solid',
      regions: all('neutral.paper'),
    });
    out.push({
      id: 'ink-on-brand',
      name: 'Ink on the brand ground',
      idea: 'The same field, the opposite mark: ink rather than a knockout. Some marks hold here and some go muddy, and the only way to know is to look at both.',
      basis: 'every region in one role',
      ground: 'brand.solid',
      regions: all('neutral.ink'),
    });
  } else {
    notes.push('The palette defines no brand.solid, so none of the brand-coloured treatments could be dealt.');
  }

  if (roles.has('neutral.ink') && roles.has('neutral.paper')) {
    out.push({
    id: 'one-ink',
    name: 'One ink',
    idea: 'Etching, foil, letterpress, embroidery, a rubber stamp, a one-colour press. This is the rendition the silhouette has to survive on its own.',
    basis: 'every region in one role',
    ground: 'neutral.paper',
    regions: all('neutral.ink'),
    });
  } else {
    notes.push('The palette defines no neutral ink on paper, so the one-ink treatment could not be dealt. That is the rendition a one-colour press gets, so the palette is the thing to fix.');
  }

  if (regions.length >= 2 && roles.has('brand.solid') && roles.has('neutral.ink')) {
    const [first, ...rest] = regions;
    out.push({
      id: 'two-colour',
      name: 'Two colour, the second part receding',
      idea: `The mark's own boundary between ${first.id} and ${rest.map((r) => r.id).join(', ')} carries the split. The brand colour leads and the rest stays in ink.`,
      basis: `the split follows the ${regions.length} inks the mark was drawn in, not a node chosen for it`,
      ground: 'neutral.paper',
      regions: [
        { region: first.id, ink: first.ink, role: 'brand.solid' },
        ...rest.map((r) => ({ region: r.id, ink: r.ink, role: 'neutral.ink' })),
      ],
    });
    if (roles.has('accent1.solid')) {
      out.push({
        id: 'two-colour-accent',
        name: 'Two colour, the second part standing up',
        idea: 'The same boundary, with the accent instead of ink. The opposite answer to the same question: whether the second part of the mark should recede or assert.',
        basis: `the split follows the ${regions.length} inks the mark was drawn in, not a node chosen for it`,
        ground: 'neutral.paper',
        regions: [
          { region: first.id, ink: first.ink, role: 'brand.solid' },
          ...rest.map((r) => ({ region: r.id, ink: r.ink, role: 'accent1.solid' })),
        ],
      });
    }
  } else {
    notes.push('The master is drawn in one ink, so it has one region and no boundary to put a second colour on. The two-colour treatments were not dealt, because inventing a region to colour would be inventing a decision the mark does not contain.');
  }

  return { colourways: out, notes };
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

const finding = (severity, id, message, extra = {}) => ({ severity, id, message, ...extra });

/** The grounds any mark on this brand will meet, whatever the colourway says. */
export function groundsOf(system) {
  const roles = colourRoles(system);
  return ['neutral.paper', 'brand.solid', 'neutral.ink']
    .filter((r) => roles.has(r))
    .map((r) => ({ role: r, hex: roles.get(r) }));
}

const CVD = Object.freeze(['protanopia', 'deuteranopia', 'tritanopia']);

/**
 * Everything about a colourway that can be settled by arithmetic.
 *
 * The rendered half, which is the one-colour test, is not here: it needs a
 * browser and it is threaded in by the caller as `oneColour`. Everything below
 * runs anywhere.
 *
 * The colour vision judgement is `cvdSafePair`'s, at its own threshold, rather
 * than a second opinion invented here. Its 0.1 in OKLab is deliberately
 * conservative: two brand colours that merely differ are not enough, they have
 * to read as different.
 */
export function auditColourway(colourway, { master, system, regions, oneColour = null, cvdThreshold = 0.1 }) {
  const resolved = resolveColourway(colourway, { system, regions });
  if (!resolved.ok) {
    return {
      id: colourway.id,
      findings: resolved.errors.map((e) => finding('error', 'unresolvable', e, {
        fix: 'Rerun `brandi logo colour plan`, which deals the mapping against the master and the palette that exist now.',
      })),
      contexts: [],
      contrast: [],
      cvd: [],
      paints: 0,
      verdict: 'rejected',
    };
  }

  const painted = renderColourway(master, colourway, { system, regions });
  const findings = [];
  const inks = [...new Set(resolved.parts.map((p) => p.hex))];

  // --- The paint ceiling of each application context ----------------------
  // Exactly the ceilings the concept audit uses, applied to the number of
  // colours this colourway actually puts down. A colourway is the only thing in
  // this pipeline that can raise that number, so it is the only thing that can
  // exceed them.
  //
  // Exceeding one is `deferred`, not `fail`, and for the same reason a lockup
  // failing the favicon is deferred: the SET covers the context, not this file.
  // A two-colour treatment cannot be foil stamped and is not defective, because
  // the one-ink treatment is what goes to the foil house. Failing it here would
  // reject every colourway that is not one ink, which is every colourway worth
  // dealing. What IS an error is a context no treatment in the set covers, and
  // that is decided by `auditColourways`, which can see the set.
  const contexts = CONTEXTS
    .filter((ctx) => ctx.maxColours != null)
    .map((ctx) => {
      const over = inks.length > ctx.maxColours;
      return {
        context: ctx.id,
        name: ctx.name,
        status: over ? 'deferred' : 'pass',
        paints: inks.length,
        ceiling: ctx.maxColours,
        reasons: over ? [`${inks.length} colours against a ceiling of ${ctx.maxColours}`] : [],
      };
    });
  for (const row of contexts.filter((r) => r.status === 'deferred')) {
    findings.push(finding('note', 'over-paint-ceiling', `${row.paints} colours is more than ${row.name} can take, which is ${row.ceiling}, so another treatment carries that context.`, {
      fix: 'Every extra colour here is a thread change, a plate or a die. Keep the one-ink treatment for it.',
      basis: 'logospec CONTEXTS',
    }));
  }

  // --- Contrast against every ground it will sit on -----------------------
  // The colourway's OWN ground is always in this list, even when it is not one
  // of the three the brand habitually uses. Deriving "own" from membership of
  // that list meant a treatment drawn for an accent ground had no own-ground
  // row at all, so the check below had nothing to fire on and the one thing
  // that had to be measured was the one thing that was not.
  const grounds = groundsOf(system);
  if (colourway.ground && resolved.ground && !grounds.some((g) => g.role === colourway.ground)) {
    grounds.push({ role: colourway.ground, hex: resolved.ground });
  }
  const contrast = [];
  for (const ground of grounds) {
    for (const hex of inks) {
      const report = contrastReport(hex, ground.hex);
      contrast.push({
        ground: ground.role,
        groundHex: ground.hex,
        hex,
        ratio: report.wcag.ratio,
        apca: report.apca.lc,
        verdict: report.verdict,
        own: colourway.ground === ground.role,
      });
    }
  }
  // A mark only has to hold on the ground the colourway puts it on. The other
  // grounds are reported so the system can be checked, and are not failures of
  // this treatment: that is what the other treatments are for.
  for (const row of contrast.filter((c) => c.own && c.ratio < 3)) {
    findings.push(finding('error', 'low-contrast', `${row.hex} on ${row.groundHex} is ${row.ratio.toFixed(2)}:1, which is under the 3:1 a graphic needs to be seen.`, {
      fix: 'A mark at this contrast disappears in bright light, in print and under a photocopier. Change the role or change the ground.',
      basis: 'WCAG 2.2 1.4.11 non-text contrast',
    }));
  }
  // A treatment that names no ground at all was never measured against one, and
  // saying nothing about that reads exactly like passing.
  if (!colourway.ground) {
    findings.push(finding('warn', 'no-ground', 'This treatment names no ground, so its contrast was not measured against one.', {
      fix: 'Give it a ground role, e.g. neutral.paper. A mark is only readable relative to what it sits on.',
    }));
  }

  // --- Colour vision deficiency -------------------------------------------
  // Two questions, not one. Does each colour stay apart from the ground, and
  // do two regions of the mark stay apart from each other. The second is the
  // one that matters here, because it is the one a colourway can break.
  const cvd = CVD.map((type) => ({
    type,
    inks: inks.map((hex) => ({ hex, as: simulateCvd(hex, type) })),
    ground: resolved.ground ? simulateCvd(resolved.ground, type) : null,
  }));
  for (let i = 0; i < inks.length; i++) {
    for (let j = i + 1; j < inks.length; j++) {
      const pair = cvdSafePair(inks[i], inks[j], { threshold: cvdThreshold });
      const broken = CVD.filter((t) => !pair.results[t].ok);
      if (!broken.length) continue;
      const a = resolved.parts.find((p) => p.hex === inks[i]);
      const b = resolved.parts.find((p) => p.hex === inks[j]);
      findings.push(finding('error', 'cvd-collapse', `Under ${broken.join(' and ')}, ${inks[i]} and ${inks[j]} read as one colour, so ${a?.region ?? inks[i]} and ${b?.region ?? inks[j]} become one shape.`, {
        fix: 'Separate the two regions by lightness as well as by hue, or take the split out and let the shape carry it.',
        basis: 'Machado, Oliveira and Fernandes 2009, via color.mjs cvdSafePair',
      }));
    }
  }

  // --- The one-colour test -------------------------------------------------
  // Threaded in from the render. Without a browser it is not run, and the
  // verdict says unverified rather than pretending the mark passed.
  if (oneColour?.findings?.length) findings.push(...oneColour.findings);

  const errors = findings.filter((f) => f.severity === 'error').length;
  const verdict = errors > 0 ? 'rejected'
    : !oneColour?.available ? 'unverified'
    : findings.some((f) => f.severity === 'warn') ? 'usable-with-notes'
    : 'usable';

  return {
    id: colourway.id,
    findings,
    contexts,
    contrast,
    cvd,
    paints: inks.length,
    inks,
    ground: resolved.ground,
    svg: painted,
    verdict,
  };
}

// ---------------------------------------------------------------------------
// The one-colour test, on the render
// ---------------------------------------------------------------------------

/**
 * Whether colour is doing structural work, measured rather than argued about.
 *
 * The mark is rendered twice on the SAME ground: once in its colourway, once
 * with every ink collapsed to one. Count the separate solid areas in each. More
 * areas in colour than in one ink means two parts of the mark were only being
 * told apart by hue, and they merge the moment it is etched, foil stamped,
 * faxed or printed on a one-colour press.
 *
 * This is the arithmetic form of the rule the whole stage exists to enforce: a
 * colourway may not carry meaning the silhouette cannot carry alone. It is the
 * check `auditRenderMetrics` already makes on a concept, run here against the
 * ground the colourway actually sits on rather than against white.
 *
 * All of them in one browser pass, because a check that is slow enough to skip
 * is a check that gets skipped.
 */
export async function oneColourTest(entries, { chrome, size = 256 } = {}) {
  if (!entries.length) return new Map();
  const sources = [];
  const backgrounds = [];
  for (const e of entries) {
    const ground = e.ground ?? '#FFFFFF';
    sources.push(e.svg, monochromeSvg(e.svg, bestTextOn(ground).color));
    backgrounds.push(ground, ground);
  }

  // Half of one tenth of one per cent of the cell: at 256px that is 33 pixels,
  // far under the smallest area any real part of a mark occupies and far over
  // the antialiasing slivers on a boundary between two hues.
  const batch = await renderBatch(sources, { sizes: [size], chrome, backgrounds, minAreaRatio: 0.0005 });
  const out = new Map();
  if (!batch.available) {
    for (const e of entries) out.set(e.id, { available: false, findings: [] });
    return out;
  }

  entries.forEach((e, i) => {
    const colour = batch.results[i * 2]?.[size];
    const collapsed = batch.results[i * 2 + 1]?.[size];
    if (!colour || !collapsed) {
      out.set(e.id, { available: false, findings: [] });
      return;
    }
    const findings = [];
    if (colour.colourRegions > collapsed.solidRegions) {
      findings.push(finding('error', 'colour-carries',
        `The mark reads as ${colour.colourRegions} shapes in this colourway and ${collapsed.solidRegions} in one ink, so ${e.regionNames ?? 'its regions'} are being told apart by colour alone.`, {
          fix: 'They merge in etching, foil, embroidery, fax and one-colour print, and they merge for anyone who cannot separate those two hues. Separate them with a gap or a change of shape, or drop the split.',
          basis: 'rampstack APP:112-113',
        }));
    }
    out.set(e.id, {
      available: true,
      findings,
      colourRegions: colour.colourRegions,
      inkRegions: collapsed.solidRegions,
    });
  });
  return out;
}

// ---------------------------------------------------------------------------
// The set
// ---------------------------------------------------------------------------

/**
 * Audit a whole set of colourways, which is the only level at which some of
 * this can be decided.
 *
 * A treatment that cannot be foil stamped is not defective; a SET with nothing
 * that can be foil stamped is. The per-colourway pass defers a context it
 * cannot serve, and this is where a context nobody serves becomes an error
 * against the set.
 */
export async function auditColourways(colourways, { master, system, regions, chrome } = {}) {
  const audited = colourways.map((c) => auditColourway(c, { master, system, regions }));

  const renderable = audited
    .filter((a) => a.svg)
    .map((a) => ({
      id: a.id,
      svg: a.svg,
      ground: a.ground,
      regionNames: regions.map((r) => `${r.id} (${r.ink})`).join(' and '),
    }));
  const one = await oneColourTest(renderable, { chrome });
  let rendered = false;
  for (const a of audited) {
    const result = one.get(a.id);
    if (!result) continue;
    if (result.available) rendered = true;
    a.oneColour = result;
    a.findings.push(...result.findings);
    const errors = a.findings.filter((f) => f.severity === 'error').length;
    a.verdict = errors > 0 ? 'rejected'
      : !result.available ? 'unverified'
      : a.findings.some((f) => f.severity === 'warn') ? 'usable-with-notes'
      : 'usable';
  }

  // Which contexts the SET covers. A context every treatment defers is a
  // context this brand has no artwork for, and that is the finding.
  const live = audited.filter((a) => a.verdict !== 'rejected');
  const coverage = CONTEXTS.filter((ctx) => ctx.maxColours != null).map((ctx) => {
    const served = live.filter((a) => a.contexts.some((r) => r.context === ctx.id && r.status === 'pass'));
    return { context: ctx.id, name: ctx.name, ceiling: ctx.maxColours, servedBy: served.map((a) => a.id) };
  });
  const gaps = coverage.filter((c) => !c.servedBy.length).map((c) => finding('error', 'context-uncovered',
    `Nothing in this set can be used for ${c.name}, which takes ${c.ceiling} colour${c.ceiling === 1 ? '' : 's'}.`, {
      fix: 'Keep a treatment with few enough roles for it. The one-ink treatment covers every single-colour context on its own.',
      basis: 'logospec CONTEXTS',
    }));

  return { colourways: audited, coverage, findings: gaps, rendered };
}


export default {
  canonicalPaint,
  colourRoles,
  resolveRole,
  regionsOf,
  describeRegion,
  recolourSvg,
  resolveColourway,
  renderColourway,
  greyscaleSvg,
  greyOf,
  planColourways,
  groundsOf,
  auditColourway,
  oneColourTest,
  auditColourways,
};
