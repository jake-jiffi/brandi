/**
 * Specification artboards: the parts of a brand book that are documentation
 * rather than design, generated from the resolved system so they cannot drift
 * from it.
 *
 * These deliberately look like specification sheets: a strict grid, hairline
 * rules, values set in a monospaced face, and no decoration. They are set in
 * the brand's own typefaces and coloured with the brand's own ramps, so they
 * demonstrate the system while they document it. The expressive artboards (the
 * landing page, the poster, the app screen) are authored by Claude, not here.
 */

import { artboard, FRAMES } from './canvas.mjs';
import { contrastRatio, apcaContrast, simulateCvd, bestTextOn } from './color.mjs';
import { resolveToken, WEIGHTS } from './system.mjs';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Build a Google Fonts stylesheet URL for the faces a system actually uses. */
export function googleFontsUrl(families, { weights = WEIGHTS.map((w) => w.value) } = {}) {
  const list = [...new Set(families.filter(Boolean).map((f) => (Array.isArray(f) ? f[0] : f)))];
  if (!list.length) return null;
  const q = list
    .map((f) => `family=${encodeURIComponent(String(f).trim()).replace(/%20/g, '+')}:wght@${weights.join(';')}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

const MONO_STACK = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

function fontStacks(system) {
  const f = system.type.fonts;
  const display = f.display ? `'${f.display}', Georgia, serif` : 'Georgia, serif';
  const body = f.body ? `'${f.body}', system-ui, sans-serif` : 'system-ui, sans-serif';
  const mono = f.mono ? `'${f.mono}', ${MONO_STACK}` : MONO_STACK;
  return { display, body, mono };
}

/**
 * The label a brand's own button rule demonstrates.
 *
 * `voice.mechanics.buttons` is prose, but the useful part of that prose is the
 * example the brand chose: "A verb the person would use. 'Book a groom', not
 * 'Submit'." The first quoted phrase is the brand's own answer, and the phrase
 * after "not" is the counter-example, so only what precedes it is taken. A
 * generated component sheet labelled "Get started" is the same sheet every
 * generator produces; this one at least says what the brand said.
 */
export function primaryButtonLabel(buttonsRule, fallback = 'Get started') {
  const rule = String(buttonsRule ?? '');
  if (!rule) return fallback;
  // "not", "never" and "avoid" all introduce the counter-example, and a rule
  // phrased "Never 'Submit'." would otherwise hand back the exact label it bans.
  const stop = rule.search(/\b(not|never|avoid|rather than|instead of)\b/i);
  const region = stop >= 0 ? rule.slice(0, stop) : rule;
  const quoted = region.match(/["'\u2018\u201C]([^"'\u2019\u201D]{2,32})["'\u2019\u201D]/);
  const label = quoted?.[1]?.trim();
  // A quoted fragment that is a whole sentence is guidance, not a label.
  return label && /^[^.!?]+$/.test(label) ? label : fallback;
}

/** Every state a control has, in the order a reader meets them. */
export const BUTTON_STATES = ['rest', 'hover', 'active', 'focus', 'disabled', 'loading'];

/** The shared chrome every specification sheet uses. */
function sheetCss(system, { mode = 'light' } = {}) {
  const s = system.semantic[mode];
  const page = resolveToken(s['surface.page'], system, mode);
  const ink = resolveToken(s['text.primary'], system, mode);
  const muted = resolveToken(s['text.secondary'], system, mode);
  const rule = resolveToken(s['border.subtle'], system, mode);
  const { display, body, mono } = fontStacks(system);
  return `
body {
  background: ${page};
  color: ${ink};
  font-family: ${body};
  font-size: 14px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
.sheet { padding: 56px 56px 72px; display: flex; flex-direction: column; gap: 48px; }
.sheet__head { display: flex; flex-direction: column; gap: 6px; border-bottom: 1px solid ${ink}; padding-bottom: 14px; }
.sheet__title { font-family: ${display}; font-size: 40px; line-height: 1.05; letter-spacing: -0.02em; margin: 0; }
.sheet__sub { color: ${muted}; font-size: 13px; max-width: 62ch; margin: 0; }
.eyebrow {
  font-family: ${mono}; font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: ${muted};
}
.block { display: flex; flex-direction: column; gap: 18px; }
.block__title { display: flex; align-items: baseline; gap: 14px; border-bottom: 1px solid ${rule}; padding-bottom: 8px; }
.block__title h2 { font-family: ${display}; font-size: 20px; margin: 0; letter-spacing: -0.01em; }
.block__note { color: ${muted}; font-size: 12px; max-width: 70ch; margin: 0; }
.mono { font-family: ${mono}; font-variant-numeric: tabular-nums; }
.grid { display: grid; gap: 2px; }
`;
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

function rampRow(system, family, pal, mode) {
  const steps = pal[mode].steps;
  const cells = steps
    .map((st) => {
      const text = bestTextOn(st.hex).color;
      return `      <div style="background: ${st.hex}; color: ${text}; padding: 14px 10px 12px; display: flex; flex-direction: column; gap: 2px; min-height: 92px;">
        <span class="mono" style="font-size: 10px; opacity: 0.72;">${st.step}</span>
        <span class="mono" style="font-size: 11px; margin-top: auto;">${st.hex}</span>
        <span style="font-size: 9px; opacity: 0.72; line-height: 1.25;">${esc(st.role)}</span>
      </div>`;
    })
    .join('\n');
  return `  <div class="block" style="gap: 8px;">
    <div style="display: flex; align-items: baseline; gap: 12px;">
      <span class="eyebrow">${esc(family)}</span>
      <span class="mono" style="font-size: 11px; opacity: 0.6;">${esc(pal[mode].steps[8].oklch)}</span>
    </div>
    <div class="grid" style="grid-template-columns: repeat(12, minmax(0, 1fr));">
${cells}
    </div>
  </div>`;
}

/**
 * The measured-contrast table.
 *
 * `mode` is which theme is being MEASURED. The sheet itself is painted light,
 * so a dark-theme table drawn in dark-theme chrome came out as pale grey on
 * white at about 1.8:1: the table certifying 16:1 contrast was itself
 * unreadable. The chrome therefore always comes from the light theme, and only
 * the measured values come from the theme under test.
 */
function contrastTable(system, mode) {
  const s = system.semantic[mode];
  const r = (k) => resolveToken(s[k], system, mode);
  const chrome = (k) => resolveToken(system.semantic.light[k], system, 'light');
  const pairs = [
    ['Body text on page', 'text.primary', 'surface.page', 4.5],
    ['Secondary text on page', 'text.secondary', 'surface.page', 4.5],
    ['Body text on a card', 'text.primary', 'surface.raised', 4.5],
    ['Brand text on page', 'text.brand', 'surface.page', 4.5],
    ['Focus ring on page', 'focus.ring', 'surface.page', 3],
    ['Label on the brand fill (normal text)', 'accent.on-solid', 'accent.solid', 4.5],
  ];
  const muted = chrome('text.secondary');
  const rule = chrome('border.subtle');
  const ink = chrome('text.primary');
  const rows = pairs
    .map(([label, fg, bg, min]) => {
      const f = r(fg);
      const b = r(bg);
      const ratio = contrastRatio(f, b);
      const lc = apcaContrast(f, b);
      const pass = ratio >= min;
      const mark = pass ? 'PASS' : 'FAIL';
      const markColor = pass ? chrome('success.text') : chrome('danger.text');
      return `        <tr>
          <td style="padding: 7px 0; border-bottom: 1px solid ${rule};">${esc(label)}</td>
          <td class="mono" style="padding: 7px 0; border-bottom: 1px solid ${rule};">
            <span style="display: inline-block; width: 11px; height: 11px; background: ${f}; border: 1px solid ${rule}; vertical-align: -1px;"></span>
            ${f} on ${b}
          </td>
          <td class="mono" style="padding: 7px 0; border-bottom: 1px solid ${rule}; text-align: right;">${ratio.toFixed(2)}:1</td>
          <td class="mono" style="padding: 7px 0; border-bottom: 1px solid ${rule}; text-align: right;">Lc ${lc}</td>
          <td class="mono" style="padding: 7px 0; border-bottom: 1px solid ${rule}; text-align: right; color: ${markColor};">${mark}</td>
        </tr>`;
    })
    .join('\n');
  return `    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr class="eyebrow" style="text-align: left;">
          <th style="padding-bottom: 6px; font-weight: 400;">Pairing</th>
          <th style="padding-bottom: 6px; font-weight: 400;">Values</th>
          <th style="padding-bottom: 6px; font-weight: 400; text-align: right;">WCAG 2.2</th>
          <th style="padding-bottom: 6px; font-weight: 400; text-align: right;">APCA</th>
          <th style="padding-bottom: 6px; font-weight: 400; text-align: right;">Required</th>
        </tr>
      </thead>
      <tbody style="color: ${ink};">
${rows}
      </tbody>
    </table>`;
}

function cvdStrip(system, mode) {
  const families = ['brand', ...Object.keys(system.status)];
  const rule = resolveToken(system.semantic[mode]['border.subtle'], system, mode);
  const cols = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];
  const rows = cols
    .map((type) => {
      const cells = families
        .map((f) => {
          const src = (system.palettes[f] ?? system.status[f])[mode].steps[8].hex;
          const shown = type === 'normal' ? src : simulateCvd(src, type);
          return `        <div style="background: ${shown}; height: 40px;"></div>`;
        })
        .join('\n');
      return `    <div style="display: flex; align-items: center; gap: 14px;">
      <span class="eyebrow" style="width: 110px; flex: none;">${type === 'normal' ? 'as designed' : type}</span>
      <div class="grid" style="grid-template-columns: repeat(${families.length}, minmax(0, 1fr)); flex: 1; gap: 2px;">
${cells}
      </div>
    </div>`;
    })
    .join('\n');
  const labels = families
    .map((f) => `        <span class="eyebrow" style="text-align: center;">${esc(f)}</span>`)
    .join('\n');
  return `  <div class="block">
    <div class="block__title"><h2>Colour vision</h2><span class="eyebrow">simulated</span></div>
    <p class="block__note">Roughly one in twelve men has a colour vision deficiency. Success and danger sit close together for the red-green types, which is exactly why status must never be carried by colour alone: every status needs an icon and a word as well.</p>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; gap: 14px;">
        <span style="width: 110px; flex: none;"></span>
        <div class="grid" style="grid-template-columns: repeat(${families.length}, minmax(0, 1fr)); flex: 1; gap: 2px;">
${labels}
        </div>
      </div>
${rows}
    </div>
  </div>`;
}

/** The colour system, both themes, with the accessibility work shown. */
export function paletteArtboard(system, { brandName = 'Brand', ratio = null } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const families = Object.entries({ ...system.palettes, ...system.status });

  // The proportion rule, drawn. It was stated in prose and drawn nowhere, and a
  // critic measured six artboards against it and found it held on none of them.
  const parts = parseRatio(ratio);
  const r0 = (k) => resolveToken(system.semantic.light[k], system, 'light');
  const proportionColour = {
    brand: system.palettes.brand.light.solidStrong.hex,
    neutral: system.palettes.neutral.light.steps[2].hex,
    accent: (system.palettes.accent1 ?? system.palettes.brand).light.solidStrong.hex,
  };
  const proportionBlock = parts ? `  <div class="block">
    <div class="block__title"><h2>Proportion</h2><span class="eyebrow">${esc(String(ratio))}</span></div>
    <p class="block__note">The same three colours in the wrong amounts is a different brand, so the amounts are part of the system. Hold a finished layout next to this bar and squint: the areas should read the same. This is a rule about surface area, not about how many times a colour appears.</p>
    <div style="display: flex; height: 62px; border: 1px solid ${r0('border.subtle')};">
${parts.map((pt) => `      <div style="width: ${pt.pct}%; background: ${proportionColour[pt.label] ?? proportionColour.neutral}; display: flex; align-items: flex-end; padding: 7px;">
        <span class="mono" style="font-size: 10px; color: ${bestTextOn(proportionColour[pt.label] ?? proportionColour.neutral).color};">${esc(pt.label)} ${pt.pct}%</span>
      </div>`).join('\n')}
    </div>
  </div>

` : '';

  const section = (mode) => `  <div class="block">
    <div class="block__title">
      <h2>${mode === 'light' ? 'Light' : 'Dark'}</h2>
      <span class="eyebrow">12 steps per family</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 20px;">
${families.map(([name, pal]) => rampRow(system, name, pal, mode)).join('\n')}
    </div>
  </div>
  <div class="block">
    <div class="block__title"><h2>Contrast, ${mode}</h2><span class="eyebrow">measured, not assumed</span></div>
${contrastTable(system, mode)}
  </div>`;

  const body = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)} / colour</span>
    <h1 class="sheet__title">Colour system</h1>
    <p class="sheet__sub">Step 9 is the brand colour itself. Steps 1 to 8 are surfaces and borders, 11 and 12 are text. Build with the semantic tokens, not these raw steps: reaching past the semantic layer is how a design system stops being one.</p>
  </div>
${proportionBlock}${section('light')}
${section('dark')}
${cvdStrip(system, 'light')}
</div>`;

  return artboard({
    name: 'Palette',
    body,
    css: sheetCss(system),
    fonts,
    systemNote: `Specification sheet, generated from the resolved system.\nEvery value here is measured. Do not hand-edit.`,
  });
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/** The type system as a specimen: the scale, the measure, the pairing at work. */
export function typographyArtboard(system, { brandName = 'Brand', sampleWord = 'Handgloves' } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const { display, body: bodyFace, mono } = fontStacks(system);
  const mode = 'light';
  const s = system.semantic[mode];
  const muted = resolveToken(s['text.secondary'], system, mode);
  const rule = resolveToken(s['border.subtle'], system, mode);
  const scale = system.type.scale;

  const rows = scale.steps
    .slice()
    .reverse()
    .map((st) => {
      const face = st.offset >= 2 ? display : bodyFace;
      return `    <div style="display: flex; align-items: baseline; gap: 28px; border-bottom: 1px solid ${rule}; padding: 16px 0;">
      <div class="mono" style="width: 210px; flex: none; font-size: 11px; color: ${muted}; line-height: 1.5;">
        <div style="color: inherit; letter-spacing: 0.08em; text-transform: uppercase;">${esc(st.name)}</div>
        <div>${st.px}px${st.maxPx !== st.px ? ` to ${st.maxPx}px` : ''}</div>
        <div>${st.lineHeight} / ${esc(st.letterSpacing)}</div>
      </div>
      <div style="flex: 1; min-width: 0; font-family: ${face}; font-size: ${st.px}px; line-height: ${st.lineHeight}; letter-spacing: ${st.letterSpacing}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc(sampleWord)}</div>
      <div style="width: 200px; flex: none; font-size: 11px; color: ${muted}; line-height: 1.4;">${esc(st.use)}</div>
    </div>`;
    })
    .join('\n');

  const measureCopy =
    'A column this wide holds roughly ' + scale.byName.base.px + ' pixel type at ' +
    system.type.measure.chars + ' characters a line. Below about forty-five characters the eye ' +
    'returns to the left margin too often and the rhythm of reading breaks. Above about ' +
    'seventy-five it loses its place on the way back. Neither failure announces itself: the page ' +
    'simply feels tiring, and nobody can say why.';

  const dropped = scale.dropped.length
    ? `<p class="block__note">Steps not issued: ${scale.dropped.map((d) => `${d.name} (${d.px}px, ${d.reason})`).join(', ')}. A size nobody may responsibly use is not a size.</p>`
    : '';

  const body = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)} / typography</span>
    <h1 class="sheet__title">Type system</h1>
    <p class="sheet__sub">A ${scale.ratioName ? esc(scale.ratioName).replace(/-/g, ' ') : scale.ratio.toFixed(3)} scale from a ${scale.basePx}px base. Line height loosens as type gets smaller and tightens as it gets larger, because a single multiplier cannot serve both.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>Faces</h2><span class="eyebrow">${Object.values(system.type.fonts).filter(Boolean).length} roles</span></div>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span class="eyebrow">Display</span>
        <div style="font-family: ${display}; font-size: 46px; line-height: 1.05; letter-spacing: -0.022em;">${esc(sampleWord)}</div>
        <div class="mono" style="font-size: 11px; color: ${muted};">${esc(system.type.fonts.display ?? 'not chosen')}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span class="eyebrow">Body</span>
        <div style="font-family: ${bodyFace}; font-size: 46px; line-height: 1.05; letter-spacing: -0.022em;">${esc(sampleWord)}</div>
        <div class="mono" style="font-size: 11px; color: ${muted};">${esc(system.type.fonts.body ?? 'not chosen')}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span class="eyebrow">Mono</span>
        <div style="font-family: ${mono}; font-size: 46px; line-height: 1.05; letter-spacing: -0.022em;">0123456789</div>
        <div class="mono" style="font-size: 11px; color: ${muted};">${esc(system.type.fonts.mono ?? 'system fallback')}</div>
      </div>
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Scale</h2><span class="eyebrow">${scale.steps.length} issued steps</span></div>
    ${dropped}
    <div style="display: flex; flex-direction: column;">
${rows}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Weight</h2><span class="eyebrow">${system.type.weights.length} loaded, and only these</span></div>
    <p class="block__note">A weight that is not downloaded is a weight the browser fakes, and a faked bold is thinner and wider than a real one. These three are what the font request asks for; if the brand needs a fourth, load it and add it to the system rather than writing the number and hoping.</p>
    <div style="display: flex; flex-direction: column; gap: 10px;">
${system.type.weights.map((w) => `      <div style="display: flex; align-items: baseline; gap: 18px;">
        <span class="mono" style="width: 190px; flex: none; font-size: 11px;">--font-weight-${esc(w.name)}</span>
        <span class="mono" style="width: 42px; flex: none; font-size: 11px; color: ${muted};">${w.value}</span>
        <span style="font-family: ${display}; font-weight: ${w.value}; font-size: 26px; flex: none;">${esc(brandName)}</span>
        <span style="font-size: 12px; color: ${muted};">${esc(w.use)}</span>
      </div>`).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Measure</h2><span class="eyebrow">${system.type.measure.css}</span></div>
    <p class="block__note">${esc(system.type.measure.source)}. Set columns in ch, not pixels: ch is the width of a zero in the face actually rendering, so the count holds when the face changes.</p>
    <p style="font-family: ${bodyFace}; font-size: ${scale.byName.base.px}px; line-height: ${scale.byName.base.lineHeight}; max-width: ${system.type.measure.css}; margin: 0;">${esc(measureCopy)}</p>
  </div>
</div>`;

  return artboard({
    name: 'Typography',
    body,
    css: sheetCss(system),
    fonts,
    systemNote: 'Specification sheet, generated from the resolved system.',
  });
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function svgIcon(name, color) {
  const common = `width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  const paths = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L14.7 3.9a2 2 0 0 0-3.4 0Z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  };
  return `<svg ${common}>${paths[name] ?? paths.info}</svg>`;
}

/**
 * Every component in every state. States are the point: a component documented
 * only in its resting state is a component nobody can build.
 */
export function componentsArtboard(system, { brandName = 'Brand', mode = 'light', voice = null } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const { body: bodyFace } = fontStacks(system);
  const s = system.semantic[mode];
  const r = (k) => resolveToken(s[k], system, mode);
  const radius = Object.fromEntries(system.radius.map((x) => [x.name, x.px === 9999 ? '9999px' : `${x.px}px`]));
  const brand = system.palettes.brand[mode];

  // Rest, hover, active and focus are the states everyone draws. Disabled and
  // loading are the two that get discovered in production, and loading is the
  // one that was missing here entirely: a button that fetches has a state
  // between pressed and done, and if the system does not name it, every
  // developer invents a different one.
  const spinner = (colour) => `<span style="width: 13px; height: 13px; flex: none; border-radius: 9999px; border: 2px solid ${colour}; border-top-color: transparent; opacity: .85; display: inline-block;"></span>`;

  const btn = (label, style, state) => {
    const base = `font-family: ${bodyFace}; font-size: 14px; font-weight: 500; line-height: 1; padding: 0 16px; height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: ${radius.md}; cursor: pointer; white-space: nowrap;`;
    const styles = {
      primary: {
        rest: `background: ${brand.solidStrong.hex}; color: ${brand.solidStrong.text}; border: 1px solid transparent;`,
        // Hover comes from solidStrongHover, not the raw ramp step: the label
        // has to survive every state, not just the resting one.
        hover: `background: ${brand.solidStrongHover.hex}; color: ${brand.solidStrongHover.text}; border: 1px solid transparent;`,
        active: `background: ${brand.solidStrongHover.hex}; color: ${brand.solidStrongHover.text}; border: 1px solid transparent; transform: translateY(1px);`,
        focus: `background: ${brand.solidStrong.hex}; color: ${brand.solidStrong.text}; border: 1px solid transparent; outline: 2px solid ${r('focus.ring')}; outline-offset: 2px;`,
        disabled: `background: ${r('control.bg')}; color: ${r('text.disabled')}; border: 1px solid transparent; cursor: not-allowed;`,
        loading: `background: ${brand.solidStrong.hex}; color: ${brand.solidStrong.text}; border: 1px solid transparent; cursor: progress;`,
      },
      secondary: {
        rest: `background: ${r('surface.raised')}; color: ${r('text.primary')}; border: 1px solid ${r('border.default')};`,
        hover: `background: ${r('control.bg-hover')}; color: ${r('text.primary')}; border: 1px solid ${r('border.strong')};`,
        active: `background: ${r('control.bg-active')}; color: ${r('text.primary')}; border: 1px solid ${r('border.strong')}; transform: translateY(1px);`,
        focus: `background: ${r('surface.raised')}; color: ${r('text.primary')}; border: 1px solid ${r('border.default')}; outline: 2px solid ${r('focus.ring')}; outline-offset: 2px;`,
        disabled: `background: ${r('surface.raised')}; color: ${r('text.disabled')}; border: 1px solid ${r('border.subtle')}; cursor: not-allowed;`,
        loading: `background: ${r('surface.raised')}; color: ${r('text.secondary')}; border: 1px solid ${r('border.default')}; cursor: progress;`,
      },
      quiet: {
        rest: `background: transparent; color: ${r('text.brand')}; border: 1px solid transparent;`,
        hover: `background: ${r('accent.bg')}; color: ${r('text.brand')}; border: 1px solid transparent;`,
        active: `background: ${r('accent.bg-hover')}; color: ${r('text.brand')}; border: 1px solid transparent;`,
        focus: `background: transparent; color: ${r('text.brand')}; border: 1px solid transparent; outline: 2px solid ${r('focus.ring')}; outline-offset: 2px;`,
        disabled: `background: transparent; color: ${r('text.disabled')}; border: 1px solid transparent; cursor: not-allowed;`,
        loading: `background: transparent; color: ${r('text.secondary')}; border: 1px solid transparent; cursor: progress;`,
      },
    };
    if (state === 'loading') {
      const ink = style === 'primary' ? brand.solidStrong.text : r('text.secondary');
      return `<span role="button" aria-busy="true" style="${base} ${styles[style][state]}">${spinner(ink)}${esc(label)}</span>`;
    }
    return `<span style="${base} ${styles[style][state]}">${esc(label)}</span>`;
  };


  const labels = {
    primary: primaryButtonLabel(voice?.mechanics?.buttons),
    secondary: 'Learn more',
    quiet: 'Skip',
  };

  const stateRow = (style) => `      <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <span class="eyebrow" style="width: 90px; flex: none;">${style}</span>
${BUTTON_STATES.map((st) => `        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">${btn(labels[style], style, st)}<span class="mono" style="font-size: 10px; opacity: 0.55;">${st}</span></div>`).join('\n')}
      </div>`;

  const statusRow = Object.entries(system.status)
    .map(([name]) => {
      const icon = name === 'success' ? 'check' : name === 'danger' ? 'alert' : name === 'warning' ? 'alert' : 'info';
      const bg = resolveToken(s[`${name}.bg`], system, mode);
      const border = resolveToken(s[`${name}.border`], system, mode);
      const text = resolveToken(s[`${name}.text`], system, mode);
      return `      <div style="display: flex; align-items: flex-start; gap: 10px; background: ${bg}; border: 1px solid ${border}; border-radius: ${radius.md}; padding: 12px 14px;">
        <span style="flex: none; line-height: 0; padding-top: 1px;">${svgIcon(icon, text)}</span>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <strong style="color: ${text}; font-size: 13px;">${esc(name[0].toUpperCase() + name.slice(1))}</strong>
          <span style="color: ${r('text.secondary')}; font-size: 12px;">Carried by an icon and a word, never by colour alone.</span>
        </div>
      </div>`;
    })
    .join('\n');

  const field = (label, state) => {
    const styles = {
      rest: `border: 1px solid ${r('border.default')}; background: ${r('surface.raised')};`,
      focus: `border: 1px solid ${r('focus.ring')}; background: ${r('surface.raised')}; outline: 2px solid ${r('focus.ring')}; outline-offset: 1px;`,
      error: `border: 1px solid ${resolveToken(s['danger.border'], system, mode)}; background: ${r('surface.raised')};`,
      disabled: `border: 1px solid ${r('border.subtle')}; background: ${r('control.bg')};`,
    };
    const help = {
      rest: `<span style="font-size: 11px; color: ${r('text.secondary')};">We only use this to send your receipt.</span>`,
      focus: `<span style="font-size: 11px; color: ${r('text.secondary')};">We only use this to send your receipt.</span>`,
      error: `<span style="font-size: 11px; color: ${resolveToken(s['danger.text'], system, mode)}; display: inline-flex; align-items: center; gap: 5px;">${svgIcon('alert', resolveToken(s['danger.text'], system, mode))}That address is missing an @ symbol.</span>`,
      disabled: `<span style="font-size: 11px; color: ${r('text.disabled')};">Sign in to change this.</span>`,
    };
    return `      <div style="display: flex; flex-direction: column; gap: 6px;">
        <label style="font-size: 12px; font-weight: 500; color: ${state === 'disabled' ? r('text.disabled') : r('text.primary')};">${esc(label)}</label>
        <div style="${styles[state]} border-radius: ${radius.md}; height: 40px; display: flex; align-items: center; padding: 0 12px; font-size: 14px; color: ${state === 'disabled' ? r('text.disabled') : r('text.primary')};">${state === 'error' ? 'jane.example.com' : 'jane@example.com'}</div>
        ${help[state]}
        <span class="mono" style="font-size: 10px; opacity: 0.55;">${state}</span>
      </div>`;
  };

  const body = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)} / components, ${mode}</span>
    <h1 class="sheet__title">Components and states</h1>
    <p class="sheet__sub">Every control is drawn in every state it can reach. A component documented only at rest is a component nobody can build, and the states are where a design system either holds together or does not.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>Buttons</h2><span class="eyebrow">3 emphases, ${BUTTON_STATES.length} states</span></div>
    <p class="block__note">${brand.solidStrong.adjusted
      ? `The primary fill uses ${brand.solidStrong.hex} rather than the raw brand colour ${brand.steps[8].hex}, because a label on the raw colour reaches only Lc ${brand.onSolid.apca}, and a button label has to survive. The adjusted fill reaches Lc ${brand.solidStrong.lc} on the same hue.`
      : `The primary fill is the brand colour itself: a ${brand.solidStrong.text === '#FFFFFF' ? 'white' : 'black'} label on it reaches Lc ${brand.solidStrong.lc}, comfortably past the Lc 60 a button label needs, so nothing had to be adjusted.`}</p>
    <div style="display: flex; flex-direction: column; gap: 20px;">
${['primary', 'secondary', 'quiet'].map(stateRow).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Fields</h2><span class="eyebrow">4 states</span></div>
    <p class="block__note">Errors say what happened and what to do. They do not apologise, and they never say "invalid input".</p>
    <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px;">
${['rest', 'focus', 'error', 'disabled'].map((st) => field('Email address', st)).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Waiting</h2><span class="eyebrow">the state everyone forgets</span></div>
    <p class="block__note">Anything that fetches has a state between pressed and done. Show the shape of what is coming, not a spinner over an empty page: a skeleton keeps the layout still, so nothing jumps when the content lands. Never animate faster than 1.5s, and honour <span class="mono">prefers-reduced-motion</span> by holding the shapes still rather than removing them.</p>
    <div style="display: flex; flex-direction: column; gap: 10px;" aria-busy="true">
${[100, 82, 64].map((w, i) => `      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="width: 34px; height: 34px; flex: none; border-radius: ${radius.md}; background: ${r('control.bg')};"></span>
        <span style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
          <span style="height: 10px; width: ${w}%; border-radius: ${radius.sm ?? radius.md}; background: ${r('control.bg')};"></span>
          <span style="height: 8px; width: ${Math.round(w * 0.55)}%; border-radius: ${radius.sm ?? radius.md}; background: ${r('control.bg')}; opacity: .7;"></span>
        </span>
        ${i === 0 ? `<span class="mono" style="font-size: 10px; color: ${r('text.secondary')}; flex: none;">aria-busy="true"</span>` : ''}
      </div>`).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Status</h2><span class="eyebrow">icon plus word, always</span></div>
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">
${statusRow}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Surface and elevation</h2><span class="eyebrow">${system.elevation.length} levels</span></div>
    <p class="block__note">Shadows are tinted with the brand hue at very low chroma. A pure black shadow over a coloured surface reads as dirt rather than depth.</p>
    <div style="display: flex; gap: 20px; flex-wrap: wrap; padding: 8px 0 24px;">
${system.elevation.map((e) => `      <div style="width: 168px; background: ${r('surface.raised')}; border: 1px solid ${r('border.subtle')}; border-radius: ${radius.lg}; box-shadow: ${e.value}; padding: 16px; display: flex; flex-direction: column; gap: 6px;">
        <span class="eyebrow">${esc(e.name)}</span>
        <span style="font-size: 11px; color: ${r('text.secondary')}; line-height: 1.4;">${esc(e.use)}</span>
      </div>`).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Radius and rhythm</h2><span class="eyebrow">${system.meta.shape}</span></div>
    <p class="block__note">${esc(system.meta.shapeNote)} A box nested inside another takes the outer radius minus the gap between them, or the inner corner looks too round.</p>
    <div style="display: flex; gap: 14px; align-items: flex-end;">
${system.radius.filter((x) => x.name !== 'full').map((x) => `      <div style="display: flex; flex-direction: column; gap: 6px; align-items: center;">
        <div style="width: 64px; height: 64px; background: ${r('accent.bg')}; border: 1px solid ${r('accent.border')}; border-radius: ${x.px}px;"></div>
        <span class="mono" style="font-size: 10px; opacity: 0.6;">${esc(x.name)} ${x.px}</span>
      </div>`).join('\n')}
    </div>
  </div>
</div>`;

  return artboard({
    name: mode === 'dark' ? 'ComponentsDark' : 'Components',
    body,
    css: sheetCss(system, { mode }),
    fonts,
    systemNote: 'Specification sheet, generated from the resolved system.',
  });
}

// ---------------------------------------------------------------------------
// Token sheet
// ---------------------------------------------------------------------------

/** The semantic layer, written out, so a developer never has to guess a name. */
export function tokenSheetArtboard(system, { brandName = 'Brand' } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const mode = 'light';
  const r = (k) => resolveToken(system.semantic[mode][k], system, mode);
  const rule = r('border.subtle');
  const muted = r('text.secondary');

  const groups = {};
  for (const key of Object.keys(system.semantic.light)) {
    const head = key.split('.')[0];
    (groups[head] ??= []).push(key);
  }

  const groupBlock = ([head, keys]) => `    <div style="display: flex; flex-direction: column; gap: 6px; break-inside: avoid;">
      <span class="eyebrow" style="border-bottom: 1px solid ${rule}; padding-bottom: 5px;">${esc(head)}</span>
${keys.map((k) => {
    const light = resolveToken(system.semantic.light[k], system, 'light');
    const dark = resolveToken(system.semantic.dark[k], system, 'dark');
    return `      <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; padding: 3px 0;">
        <span style="display: flex; flex: none; border: 1px solid ${rule};">
          <span style="width: 14px; height: 14px; background: ${light};"></span>
          <span style="width: 14px; height: 14px; background: ${dark};"></span>
        </span>
        <span class="mono" style="flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis;">--${esc(k.replace(/\./g, '-'))}</span>
        <span class="mono" style="color: ${muted}; flex: none;">${light}</span>
      </div>`;
  }).join('\n')}
    </div>`;

  const body = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)} / tokens</span>
    <h1 class="sheet__title">Semantic tokens</h1>
    <p class="sheet__sub">These are the names to build with. Each swatch shows light on the left and dark on the right. If you find yourself reaching for a raw ramp step in a component, this layer is missing a token: add one here rather than working around it.</p>
  </div>
  <div style="columns: 3; column-gap: 36px;">
${Object.entries(groups).map(groupBlock).join('\n')}
  </div>
  <div class="block">
    <div class="block__title"><h2>Layout</h2><span class="eyebrow">breakpoints and the column</span></div>
    <p class="block__note">${esc(system.layout.note)} A custom property cannot be used inside a media query, so these are numbers to type into one. <span class="mono">--content-max</span> is the measure plus a gutter each side, and it is the one to reference directly.</p>
    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
${system.layout.breakpoints.map((b) => `      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="mono" style="width: 92px; flex: none;">--bp-${esc(b.name)}</span>
        <span class="mono" style="width: 62px; flex: none; color: ${muted};">${b.px}px</span>
        <span style="width: 268px; flex: none; display: block;"><span style="display: block; height: 6px; width: ${Math.round((b.px / system.layout.breakpoints.at(-1).px) * 268)}px; background: ${r('accent.solid')};"></span></span>
        <span style="color: ${muted};">${esc(b.use)}</span>
      </div>`).join('\n')}
      <div style="display: flex; align-items: center; gap: 10px; padding-top: 6px;">
        <span class="mono" style="width: 92px; flex: none;">--content-max</span>
        <span class="mono" style="width: 62px; flex: none; color: ${muted};">${system.layout.contentMaxPx}px</span>
        <span style="width: 268px; flex: none;"></span>
        <span style="color: ${muted};">${system.type.measure.chars} characters at ${system.type.scale.basePx}px, plus a ${system.layout.gutterPx}px gutter each side.</span>
      </div>
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Scales</h2><span class="eyebrow">spacing, radius, motion</span></div>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; font-size: 11px;">
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span class="eyebrow">space (${system.meta.spaceBase}px base)</span>
${system.space.map((sp) => `        <div style="display: flex; align-items: center; gap: 8px;"><span class="mono" style="width: 92px;">--space-${sp.name}</span><span style="height: 8px; width: ${Math.min(sp.px, 160)}px; background: ${r('accent.solid')};"></span><span class="mono" style="color: ${muted};">${sp.px}</span></div>`).join('\n')}
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span class="eyebrow">radius</span>
${system.radius.map((x) => `        <div style="display: flex; align-items: center; gap: 8px;"><span class="mono" style="width: 100px;">--radius-${x.name}</span><span class="mono" style="color: ${muted};">${x.px === 9999 ? '9999px' : `${x.px}px`}</span></div>`).join('\n')}
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span class="eyebrow">motion (${esc(system.meta.motion)})</span>
${system.motion.durations.map((d) => `        <div style="display: flex; align-items: center; gap: 8px;"><span class="mono" style="width: 116px;">--duration-${d.name}</span><span class="mono" style="color: ${muted};">${d.ms}ms</span></div>`).join('\n')}
${Object.entries(system.motion.easings).map(([n, e]) => `        <div style="display: flex; align-items: center; gap: 8px;"><span class="mono" style="width: 116px;">--ease-${n}</span><span class="mono" style="color: ${muted}; font-size: 10px;">${esc(e.value)}</span></div>`).join('\n')}
      </div>
    </div>
  </div>
</div>`;

  return artboard({
    name: 'Tokens',
    body,
    css: sheetCss(system),
    fonts,
    systemNote: 'Specification sheet, generated from the resolved system.',
  });
}

/**
 * The contents page for a specification set.
 *
 * It exists because `brandi sheets` used to write six artboards and no
 * `Main.dc.html`, so the tool's own output tripped the tool's own validator and
 * the canvas seeder warned about it. A set of sheets with no front page is also
 * just worse: a reader lands on whichever artboard sorts first and has to infer
 * the system from a palette. This states the system in one screen, then says
 * what each sheet covers and where the machine-readable versions live.
 */
export const CONTENTS_MARKER = 'Contents page, generated from the resolved system.';

export function contentsArtboard(system, { brandName = 'Brand', version = null, sheets = [] } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const r = (k) => resolveToken(system.semantic.light[k], system, 'light');
  const muted = r('text.secondary');
  const rule = r('border.subtle');

  const swatch = (hex) =>
    `<span style="width: 13px; height: 13px; background: ${hex}; border: 1px solid ${rule}; flex: none;"></span>`;

  const brandSolid = system.palettes.brand?.light?.steps?.[8]?.hex;
  const accentSolid = (system.palettes.accent1 ?? system.palettes.brand)?.light?.steps?.[8]?.hex;
  const scale = system.type.scale;

  const facts = [
    ['Primary', brandSolid ? `${swatch(brandSolid)} ${brandSolid}` : '—'],
    ['Accent', accentSolid ? `${swatch(accentSolid)} ${accentSolid}` : '—'],
    ['Display', esc(system.type.fonts.display ?? '—')],
    ['Body', esc(system.type.fonts.body ?? '—')],
    ['Mono', esc(system.type.fonts.mono ?? '—')],
    ['Type scale', `${scale.ratioName} · ${scale.ratio} · ${scale.basePx}px base`],
    ['Measure', `${system.type.measure.chars} characters`],
    ['Spacing', `${system.meta.spaceBase}px base · ${system.space.length} steps`],
    ['Shape', `${esc(system.meta.shape)} · ${esc(system.meta.shapeNote)}`],
    ['Motion', `${esc(system.meta.motion)} · ${esc(system.meta.motionNote)}`],
    ['Focus', `${system.focus.widthPx}px outline, ${system.focus.offsetPx}px offset`],
    ['Ramps', `${Object.keys(system.palettes).length} palettes, ${Object.keys(system.status).length} status hues, 12 steps each`],
    ['Breakpoints', system.layout.breakpoints.map((b) => `${esc(b.name)} ${b.px}`).join(' · ')],
    ['Content column', `${system.layout.contentMaxPx}px max, ${system.layout.gutterPx}px gutter`],
  ];

  const factRow = ([k, v]) => `      <div style="display: flex; gap: 16px; align-items: baseline; padding: 7px 0; border-bottom: 1px solid ${rule};">
        <span class="eyebrow" style="flex: none; width: 108px;">${esc(k)}</span>
        <span style="display: flex; align-items: center; gap: 7px; font-size: 13px;">${v}</span>
      </div>`;

  const sheetRow = ([file, what]) => `      <div style="display: flex; gap: 16px; align-items: baseline; padding: 7px 0; border-bottom: 1px solid ${rule};">
        <span class="mono" style="flex: none; width: 168px; font-size: 12px;">${esc(file)}</span>
        <span style="font-size: 13px; color: ${muted};">${esc(what)}</span>
      </div>`;

  const elsewhere = [
    ['brand/brand.json', 'The source of truth. Evidence, decisions, open questions, and every choice that made this system.'],
    ['brand/tokens/', 'The same system as CSS custom properties, Tailwind, TypeScript, JSON and Style Dictionary.'],
    ['brand/brand-book.html', 'The written guidelines, in nineteen sections, including the misuse page.'],
    ['brandi check <paths>', 'Holds real work against this system: off-palette colour, off-brand type, banned vocabulary.'],
  ];

  const body = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)}${version ? ` / v${esc(version)}` : ''}</span>
    <h1 class="sheet__title">${esc(brandName)} design system</h1>
    <p class="sheet__sub">Everything on this canvas is generated from one file, so nothing here can drift from what the system actually resolves to. Start with the sheet you need; the values are the values.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>The system at a glance</h2><span class="eyebrow">resolved, not intended</span></div>
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 48px;">
${facts.map(factRow).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>In this set</h2><span class="eyebrow">${sheets.length} sheets</span></div>
    <div style="display: flex; flex-direction: column;">
${sheets.map(sheetRow).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Elsewhere</h2><span class="eyebrow">the same system, in other forms</span></div>
    <div style="display: flex; flex-direction: column;">
${elsewhere.map(sheetRow).join('\n')}
    </div>
  </div>
</div>`;

  return artboard({
    name: 'Main',
    body,
    css: sheetCss(system),
    fonts,
    systemNote: CONTENTS_MARKER,
  });
}

/**
 * Parse a declared colour ratio like "62/30/8" into parts that can be drawn.
 *
 * The book stated this rule in prose and drew nothing, and a critic measured
 * six artboards against it and found the declared proportion held on none of
 * them, with green running from 3.8% to 97.1%. A rule nobody can see is a rule
 * nobody checks. The research corpus called the rendered bar the single best
 * move a brand book can make, so it is drawn.
 */
export function parseRatio(ratio) {
  const parts = String(ratio ?? '').match(/\d{1,3}/g);
  if (!parts || parts.length < 2) return null;
  const nums = parts.slice(0, 3).map(Number);
  const total = nums.reduce((a, b) => a + b, 0);
  if (!total || total < 90 || total > 110) return null;
  const labels = ['brand', 'neutral', 'accent'];
  return nums.map((n, i) => ({ label: labels[i] ?? `part ${i + 1}`, pct: Math.round((n / total) * 1000) / 10 }));
}

/**
 * The verbal identity a copywriter can actually work from.
 *
 * Voice attributes and a tone matrix say how to write. They do not give anyone
 * the paragraph a directory listing needs at 4pm. Everything here is either
 * recorded in the brand file or shown as a bracketed slot at the right length,
 * because a boilerplate this tool invented would be a plausible fake, and the
 * whole system is built on not shipping those.
 */
export function voiceArtboard(system, { brandName = 'Brand', voice = {}, strategy = {} } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const r = (k) => resolveToken(system.semantic.light[k], system, 'light');
  const muted = r('text.secondary');
  const rule = r('border.subtle');
  const { body: bodyFace } = fontStacks(system);

  const slot = (text, words, what) => text
    ? `<p style="font-family: ${bodyFace}; font-size: 15px; line-height: 1.55; margin: 0; max-width: 68ch;">${esc(text)}</p>`
    : `<p style="font-family: ${bodyFace}; font-size: 15px; line-height: 1.55; margin: 0; max-width: 68ch; color: ${muted};">[${what} AT ${words} WORDS]<br><span style="font-size: 12px;">Not written yet. Bracketed on purpose: a version this tool invented would read as finished and be wrong about the business.</span></p>`;

  const wordCount = (t) => (t ? String(t).trim().split(/\s+/).length : 0);
  const lengths = [
    ['25 words', voice.boilerplate?.words25, 25, 'BOILERPLATE'],
    ['50 words', voice.boilerplate?.words50, 50, 'BOILERPLATE'],
    ['100 words', voice.boilerplate?.words100, 100, 'BOILERPLATE'],
  ];

  const messages = voice.keyMessages ?? [];
  const audiences = strategy.audiences ?? [];

  const body = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)} / verbal</span>
    <h1 class="sheet__title">Words that already exist</h1>
    <p class="sheet__sub">A voice guide tells somebody how to write. This gives them the thing already written, so the directory listing, the press release and the about page do not each get a different brand.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>Boilerplate</h2><span class="eyebrow">the same thing, three lengths</span></div>
    <p class="block__note">Every one of these gets used unedited by somebody outside the company. The 25 lands in directories and event programmes, the 50 in a press release footer, the 100 on an about page.</p>
    <div style="display: flex; flex-direction: column; gap: 22px;">
${lengths.map(([label, text, n, what]) => `      <div style="display: flex; flex-direction: column; gap: 7px; padding-bottom: 18px; border-bottom: 1px solid ${rule};">
        <span class="eyebrow">${label}${text ? ` <span style="text-transform: none; letter-spacing: 0;">(${wordCount(text)} written)</span>` : ''}</span>
        ${slot(text, n, what)}
      </div>`).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Said out loud</h2><span class="eyebrow">one breath</span></div>
    ${slot(voice.elevatorPitch, 40, 'ELEVATOR PITCH')}
  </div>

  <div class="block">
    <div class="block__title"><h2>Key messages</h2><span class="eyebrow">${messages.length ? `${messages.length} recorded` : `${audiences.length} audiences, no messages yet`}</span></div>
    <p class="block__note">One per audience, each with the thing that makes it believable. A message with no proof behind it is a claim, and a claim is what a competitor writes too.</p>
    <div style="display: flex; flex-direction: column; gap: 2px; background: ${rule};">
${(messages.length ? messages : audiences.map((a) => ({ audience: typeof a === 'string' ? a : a.name, message: null, proof: null })))
    .map((m) => `      <div style="background: ${r('surface.page')}; padding: 14px 0; display: grid; grid-template-columns: 180px 1fr 1fr; gap: 20px; align-items: start;">
        <span class="eyebrow">${esc(m.audience ?? 'audience')}</span>
        <span style="font-size: 13px;">${m.message ? esc(m.message) : `<span style="color:${muted}">[MESSAGE FOR THIS AUDIENCE]</span>`}</span>
        <span style="font-size: 12px; color: ${muted};">${m.proof ? esc(m.proof) : '[WHAT MAKES IT BELIEVABLE]'}</span>
      </div>`).join('\n') || `      <div style="background: ${r('surface.page')}; padding: 14px 0; color: ${muted}; font-size: 13px;">No audiences recorded, so there is nothing to write a message for yet.</div>`}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Tagline</h2><span class="eyebrow">${voice.tagline?.line ? 'and where it may go' : 'not set'}</span></div>
    ${voice.tagline?.line
      ? `<div style="font-family: ${fontStacks(system).display}; font-size: 34px; line-height: 1.15; letter-spacing: -0.02em; max-width: 22ch;">${esc(voice.tagline.line)}</div>`
      : `<p class="block__note">No tagline recorded. That is a legitimate answer: plenty of brands do not have one, and an invented one is worse than none.</p>`}
    ${voice.tagline?.usage ? `<p class="block__note"><span class="eyebrow">Where</span> ${esc(voice.tagline.usage)}</p>` : ''}
    ${voice.tagline?.lockup ? `<p class="block__note"><span class="eyebrow">Lockup</span> ${esc(voice.tagline.lockup)}</p>` : ''}
  </div>
</div>`;

  return artboard({ name: 'Voice', body, css: sheetCss(system), fonts, systemNote: CONTENTS_MARKER });
}

/**
 * A starter set of icons, drawn to the brand's own recorded spec.
 *
 * The iconography section used to be a rule with no icons: "drawn in-house, do
 * not mix icon sets", a 24px grid, a 2px stroke, and nothing to point at. An
 * in-house marketer opens the folder and finds a prohibition where the assets
 * should be.
 *
 * These are drawn here rather than pulled from a library on purpose. Shipping
 * somebody else's set would hand a licence obligation to everyone who installs
 * this plugin, and it would break the brand's own rule against mixing sets on
 * the first day. Eight primitives, drawn to whatever grid and stroke the brand
 * recorded, are enough to establish the terminals, the corner radius and the
 * optical weight so the next fifty match. They are a starting point that proves
 * the spec is buildable, not a complete set, and the sheet says so.
 */
export function iconsArtboard(system, { brandName = 'Brand', iconography = {} } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const r = (k) => resolveToken(system.semantic.light[k], system, 'light');
  const muted = r('text.secondary');
  const rule = r('border.subtle');
  const ink = r('text.primary');

  const grid = Number(iconography.grid) || 24;
  const stroke = Number(iconography.strokePx) || 2;
  // A recorded statement beats an inferred one. Saying "square terminals" and
  // getting round caps because the shape stance is `rounded` is the tool
  // overruling the brand, which is the one thing it must never do. The stance
  // is only consulted when nobody said.
  const style = String(iconography.style ?? '');
  const rounded = /\b(square|flat|butt|sharp)\b/i.test(style) ? false
    : /\bround/i.test(style) ? true
      : system.meta.shape !== 'sharp';
  const cap = rounded ? 'round' : 'butt';
  const join = rounded ? 'round' : 'miter';

  // Coordinates are expressed as fractions of the grid so the set redraws
  // correctly at 16, 20 or 32 without anybody editing a path.
  const u = (n) => Number((n * grid / 24).toFixed(2));
  const ICONS = [
    ['search', `<circle cx="${u(11)}" cy="${u(11)}" r="${u(7)}"/><path d="M${u(16)} ${u(16)} L${u(21)} ${u(21)}"/>`],
    ['close', `<path d="M${u(5)} ${u(5)} L${u(19)} ${u(19)} M${u(19)} ${u(5)} L${u(5)} ${u(19)}"/>`],
    ['check', `<path d="M${u(4)} ${u(13)} L${u(9)} ${u(18)} L${u(20)} ${u(6)}"/>`],
    ['arrow', `<path d="M${u(4)} ${u(12)} L${u(20)} ${u(12)} M${u(14)} ${u(6)} L${u(20)} ${u(12)} L${u(14)} ${u(18)}"/>`],
    ['menu', `<path d="M${u(4)} ${u(7)} L${u(20)} ${u(7)} M${u(4)} ${u(12)} L${u(20)} ${u(12)} M${u(4)} ${u(17)} L${u(20)} ${u(17)}"/>`],
    ['clock', `<circle cx="${u(12)}" cy="${u(12)}" r="${u(8)}"/><path d="M${u(12)} ${u(7)} L${u(12)} ${u(12)} L${u(16)} ${u(14)}"/>`],
    ['pin', `<path d="M${u(12)} ${u(21)} C${u(12)} ${u(21)} ${u(19)} ${u(14)} ${u(19)} ${u(10)} A${u(7)} ${u(7)} 0 1 0 ${u(5)} ${u(10)} C${u(5)} ${u(14)} ${u(12)} ${u(21)} ${u(12)} ${u(21)} Z"/><circle cx="${u(12)}" cy="${u(10)}" r="${u(2.5)}"/>`],
    ['phone', `<path d="M${u(6)} ${u(4)} L${u(10)} ${u(4)} L${u(12)} ${u(9)} L${u(9)} ${u(11)} C${u(10)} ${u(14)} ${u(10)} ${u(14)} ${u(13)} ${u(15)} L${u(15)} ${u(12)} L${u(20)} ${u(14)} L${u(20)} ${u(18)} C${u(13)} ${u(19)} ${u(5)} ${u(11)} ${u(6)} ${u(4)} Z"/>`],
  ];

  const draw = (body, size, colour) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 ${grid} ${grid}" fill="none" stroke="${colour}" stroke-width="${stroke}" stroke-linecap="${cap}" stroke-linejoin="${join}" aria-hidden="true">${body}</svg>`;

  const body = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)} / icons</span>
    <h1 class="sheet__title">A set to draw the rest against</h1>
    <p class="sheet__sub">Eight primitives on the ${grid}px grid at ${stroke}px, with ${cap} terminals. Drawn here rather than borrowed, because the rule says do not mix sets and a borrowed set breaks it on the first day. This is enough to fix the weight and the terminals; the next fifty match these.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>The set</h2><span class="eyebrow">${grid}px grid, ${stroke}px stroke</span></div>
    <div style="display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 2px; background: ${rule};">
${ICONS.map(([name, d]) => `      <div style="background: ${r('surface.page')}; padding: 20px 10px 12px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
        ${draw(d, 40, ink)}
        <span class="mono" style="font-size: 10px; color: ${muted};">${esc(name)}</span>
      </div>`).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>At the sizes they are used</h2><span class="eyebrow">the stroke is what breaks first</span></div>
    <p class="block__note">A ${stroke}px stroke on a ${grid}px grid is a ratio, not a pixel count. Scaled down it thins below a pixel and greys out; scaled up it looks spindly next to the type. Redraw at 16 rather than scaling to it.</p>
    <div style="display: flex; align-items: flex-end; gap: 34px;">
${[16, 20, 24, 32, 48].map((size) => `      <div style="display: flex; flex-direction: column; align-items: center; gap: 9px;">
        ${draw(ICONS[0][1], size, ink)}
        <span class="mono" style="font-size: 10px; color: ${muted};">${size}px</span>
      </div>`).join('\n')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>The rules they were drawn to</h2><span class="eyebrow">so the next one matches</span></div>
    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
${[
    ['Grid', `${grid} by ${grid}, with everything landing on a whole unit`],
    ['Stroke', `${stroke}px, the same on every icon, never adjusted to make one look right`],
    ['Terminals', `${cap}, matching the wordmark`],
    ['Corners', `${join}`],
    ['Fill', 'None. This is a line set, and one filled icon in a line set is the one you see'],
    ['Optical size', 'A circle is drawn slightly larger than a square to look the same size, which is why the clock and the search glass are not the same diameter'],
    ['Source', esc(iconography.source ?? 'Drawn in-house. Do not mix icon sets.')],
  ].map(([k, v]) => `      <div style="display: flex; gap: 16px; padding: 6px 0; border-bottom: 1px solid ${rule};">
        <span class="eyebrow" style="width: 120px; flex: none;">${esc(k)}</span>
        <span style="color: ${muted};">${esc(v)}</span>
      </div>`).join('\n')}
    </div>
  </div>
</div>`;

  return artboard({ name: 'Icons', body, css: sheetCss(system), fonts, systemNote: CONTENTS_MARKER });
}

/**
 * The sheet that goes to a printer, a signwriter and an embroiderer.
 *
 * Everything on it is a number that is not hex. This did not exist, and the
 * worked example made the absence obvious: a physical shop whose applications
 * are a 400mm shopfront wordmark, an A3 laminate and an A4 flyer, specified
 * only in RGB. The first question a signwriter asks is what the green is in
 * CMYK and whether there is a Pantone, and the answer was nowhere in the
 * deliverable.
 *
 * The caveat is printed at the top rather than in a footnote, because an
 * uncalibrated conversion presented without one is how a brand ends up with a
 * shopfront in the wrong green.
 */
export function productionArtboard(system, { brandName = 'Brand', logo = {} } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const r = (k) => resolveToken(system.semantic.light[k], system, 'light');
  const muted = r('text.secondary');
  const rule = r('border.subtle');

  const cell = (v, { mono = true, dim = false } = {}) =>
    `<td class="${mono ? 'mono' : ''}" style="padding: 8px 10px 8px 0; border-bottom: 1px solid ${rule}; font-size: 11px; ${dim ? `color: ${muted};` : ''}">${v ?? '<span style="opacity:.45">not matched</span>'}</td>`;

  const swatchRows = system.print.swatches.map((w) => `      <tr>
        <td style="padding: 8px 10px 8px 0; border-bottom: 1px solid ${rule};">
          <span style="display: inline-flex; align-items: center; gap: 9px;">
            <span style="width: 26px; height: 26px; background: ${w.hex}; border: 1px solid ${rule}; flex: none;"></span>
            <span class="mono" style="font-size: 11px;">${esc(w.role)}</span>
          </span>
        </td>
        ${cell(w.hex)}
        ${cell(`${w.cmykString}${w.computed ? '<span style="opacity:.5"> c</span>' : ''}`)}
        ${cell(w.pantoneCoated)}
        ${cell(w.pantoneUncoated)}
        ${cell(w.ral)}
        ${cell(w.vinyl)}
        ${cell(w.thread)}
      </tr>`).join('\n');

  const minSizes = logo.minSizes?.length
    ? logo.minSizes
    : [{ variant: 'primary', printMm: logo.minSize?.printMm ?? null, screenPx: logo.minSize?.screenPx ?? null, basis: null }];

  const body = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)} / production</span>
    <h1 class="sheet__title">Off the screen</h1>
    <p class="sheet__sub">This is the sheet for whoever is making the physical thing. Hex is on it for reference only; every other column is what a press, a plotter or a needle actually needs.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>Colour</h2><span class="eyebrow">${system.print.profile ? esc(system.print.profile) : 'no separation profile recorded'}</span></div>
    <p class="block__note" style="color: ${resolveToken(system.semantic.light['danger.text'], system, 'light')};">${esc(system.print.caveat)}</p>
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead><tr>${['Role', 'Hex', 'CMYK', 'Pantone C', 'Pantone U', 'RAL', 'Vinyl', 'Thread']
        .map((h) => `<th class="eyebrow" style="padding: 0 10px 7px 0; border-bottom: 1px solid ${r('text.primary')}; font-weight: 400;">${h}</th>`).join('')}</tr></thead>
      <tbody>
${swatchRows}
      </tbody>
    </table>
    <p class="block__note"><span class="mono">c</span> marks a computed conversion. A cell reading "not matched" is honest: nobody has stood in front of a guide yet, and a guessed Pantone is worse than an absent one because it gets ordered.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>Minimum size</h2><span class="eyebrow">with what fails first</span></div>
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead><tr>${['Variant', 'Print', 'Screen', 'What fails below this']
        .map((h) => `<th class="eyebrow" style="padding: 0 10px 7px 0; border-bottom: 1px solid ${r('text.primary')}; font-weight: 400;">${h}</th>`).join('')}</tr></thead>
      <tbody>
${minSizes.map((m) => `      <tr>
        ${cell(esc(m.variant), { mono: true })}
        ${cell(m.printMm ? `${m.printMm}mm` : null)}
        ${cell(m.screenPx ? `${m.screenPx}px` : null)}
        ${cell(m.basis ? esc(m.basis) : null, { mono: false, dim: true })}
      </tr>`).join('\n')}
      </tbody>
    </table>
  </div>

  <div class="block">
    <div class="block__title"><h2>One colour</h2><span class="eyebrow">embroidery, foil, etching, a stamp</span></div>
    <p class="block__note">${logo.monochrome?.rule ? esc(logo.monochrome.rule) : 'Not recorded yet. Every physical process that cannot hold two inks needs this answered before it starts.'}</p>
    ${logo.monochrome?.knockout ? `<p class="block__note">Reversed: ${esc(logo.monochrome.knockout)}</p>` : ''}
    ${logo.monochrome?.minStrokeMm ? `<p class="block__note">No stroke below <span class="mono">${logo.monochrome.minStrokeMm}mm</span>, which is where thread and etch stop holding a line.</p>` : ''}
  </div>

  <div class="block">
    <div class="block__title"><h2>Chart colour</h2><span class="eyebrow">a different job from the brand ramps</span></div>
    <p class="block__note">${esc(system.dataViz.note)}</p>
    <div style="display: flex; gap: 2px;">
${system.dataViz.categorical.map((hex, i) => `      <div style="flex: 1; background: ${hex}; height: 56px; display: flex; align-items: flex-end; padding: 6px;">
        <span class="mono" style="font-size: 9px; color: ${bestTextOn(hex).color};">${esc(hex)}</span>
      </div>`).join('\n')}
    </div>
    <div style="display: flex; gap: 2px; margin-top: 6px;">
${system.dataViz.sequential.map((hex) => `      <div style="flex: 1; background: ${hex}; height: 26px;"></div>`).join('\n')}
    </div>
  </div>
</div>`;

  return artboard({
    name: 'Production',
    body,
    css: sheetCss(system),
    fonts,
    systemNote: CONTENTS_MARKER,
  });
}

/**
 * Head, three blocks and the sheet's own padding, at 34px a row. The twelve
 * facts sit in two columns, so they are six rows deep. Generous on purpose:
 * surplus frame paints the sheet background, while clipping is the one failure
 * that cannot be recovered without a re-seed.
 */
const contentsHeight = (sheetCount, factCount = 14) =>
  190 + (40 + Math.ceil(factCount / 2) * 34) + (40 + sheetCount * 34) + (40 + 4 * 34) + 3 * 48 + 128 + 160;

/** Every specification sheet, ready to write to disk, contents page first. */
export function specificationSheets(system, opts = {}) {
  // Heights are deliberately generous. Surplus frame simply paints the
  // artboard's background, which these sheets all set; clipping is the only
  // failure that shows, and it is not recoverable without a re-seed.
  const families = Object.keys({ ...system.palettes, ...system.status }).length;
  const brand = opts.brand ?? {};
  const identity = brand.identity ?? {};
  const ratio = opts.ratio ?? identity.colour?.ratio ?? null;

  const covers = [
    ['Palette.dc.html', 'Every ramp, twelve steps, light and dark, the proportion rule drawn, and the measured contrast table.'],
    ['Typography.dc.html', 'The scale, the weights, the faces, the line heights and the measure, set in the real type.'],
    ['Components.dc.html', 'The components in light: buttons, fields, cards, states, focus, waiting.'],
    ['ComponentsDark.dc.html', 'The same components in dark, because a theme is not a filter.'],
    ['Tokens.dc.html', 'The semantic token layer, which is the layer to build against.'],
    ['Logo.dc.html', 'Wordmark construction: tracking, clear space, minimum size, misuse.'],
    ['Production.dc.html', 'For the printer, the signwriter and the embroiderer: CMYK, Pantone, RAL, vinyl, thread.'],
    ['Voice.dc.html', 'Boilerplate at three lengths, the pitch, key messages by audience, tagline rules.'],
    ['Icons.dc.html', 'Eight primitives on the brand grid, and the rules the next fifty are drawn to.'],
  ];
  const contents = contentsArtboard(system, { ...opts, sheets: covers });
  return [
    { file: 'Main.dc.html', source: contents, w: FRAMES.sheet.w, h: contentsHeight(covers.length) },
    { file: 'Palette.dc.html', source: paletteArtboard(system, { ...opts, ratio }), w: FRAMES.sheet.w, h: 900 + families * 2 * 172 + (parseRatio(ratio) ? 190 : 0) + 700 },
    { file: 'Typography.dc.html', source: typographyArtboard(system, opts), w: FRAMES.sheet.w, h: 900 + system.type.scale.steps.length * 88 + system.type.weights.length * 44 + 460 },
    { file: 'Components.dc.html', source: componentsArtboard(system, { ...opts, mode: 'light' }), w: FRAMES.sheet.w, h: 2140 },
    { file: 'ComponentsDark.dc.html', source: componentsArtboard(system, { ...opts, mode: 'dark' }), w: FRAMES.sheet.w, h: 2140 },
    { file: 'Tokens.dc.html', source: tokenSheetArtboard(system, opts), w: FRAMES.sheet.w, h: 980 + system.space.length * 22 + system.layout.breakpoints.length * 26 + 300 },
    { file: 'Logo.dc.html', source: wordmarkArtboard(system, opts), w: FRAMES.sheet.w, h: 2000 },
    {
      file: 'Production.dc.html',
      source: productionArtboard(system, { ...opts, logo: identity.logo ?? {} }),
      w: FRAMES.sheet.w,
      h: 700 + system.print.swatches.length * 44 + (identity.logo?.minSizes?.length ?? 1) * 44 + 620,
    },
    {
      file: 'Voice.dc.html',
      source: voiceArtboard(system, { ...opts, voice: brand.voice ?? {}, strategy: brand.strategy ?? {} }),
      w: FRAMES.sheet.w,
      h: 900 + Math.max((brand.voice?.keyMessages ?? brand.strategy?.audiences ?? []).length, 1) * 60 + 780,
    },
    {
      file: 'Icons.dc.html',
      source: iconsArtboard(system, { ...opts, iconography: identity.iconography ?? {} }),
      w: FRAMES.sheet.w,
      h: 1180,
    },
  ];
}

export default {
  paletteArtboard, typographyArtboard, componentsArtboard, tokenSheetArtboard,
  wordmarkArtboard, contentsArtboard, specificationSheets, googleFontsUrl,
  primaryButtonLabel, BUTTON_STATES,
};

// ---------------------------------------------------------------------------
// Wordmark and logo construction
// ---------------------------------------------------------------------------

/**
 * A logo construction sheet built from a typeset wordmark.
 *
 * This is the honest answer to "there is no logo yet". Brandi cannot draw a
 * mark, and a generated one would be worse than none. What it can do is what an
 * agency does first: set the name properly in the brand's display face, fix the
 * tracking, and specify the construction, so there is something correct to use
 * on day one and a brief for whoever draws the real mark later.
 *
 * A typeset wordmark is a legitimate identity. Plenty of serious brands never
 * have anything else. What makes it look typeset-by-accident rather than
 * typeset-on-purpose is untouched default tracking, so the tracking here is
 * deliberate and stated.
 *
 * Cap height is approximated at 0.72em because the real value needs the font
 * file. The sheet says so: measure it against the outlined mark before this
 * goes to a signwriter.
 */
export function wordmarkArtboard(system, { brandName = 'Brand', tracking = '-0.03em', capHeightEm = 0.72 } = {}) {
  const fonts = googleFontsUrl([system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]);
  const { display, body, mono } = fontStacks(system);
  const mode = 'light';
  const s = system.semantic[mode];
  const r = (k) => resolveToken(s[k], system, mode);
  const ink = r('text.primary');
  const paper = r('surface.page');
  const muted = r('text.secondary');
  const rule = r('border.subtle');
  const brand = r('accent.solid');
  const onBrand = s['accent.on-solid'];

  const mark = (size, color, extra = '') =>
    `<span style="font-family: ${display}; font-size: ${size}px; font-weight: 700; letter-spacing: ${tracking}; line-height: 1; color: ${color}; white-space: nowrap; ${extra}">${esc(brandName)}</span>`;

  // Clear space is drawn as a dashed frame one cap height out from the mark.
  const clearSpacePx = Math.round(88 * capHeightEm);

  // Captions are imperative, because the template puts "Never " in front of
  // them. They used to be past participles, which shipped eight captions
  // reading "do not rotated". The style is keyed by `id` so the caption can be
  // rewritten without breaking the drawing.
  const misuse = [
    { id: 'stretch', label: 'stretch it', style: `transform: scaleX(1.45); transform-origin: left center;` },
    { id: 'squash', label: 'squash it', style: `transform: scaleY(0.62); transform-origin: left center;` },
    { id: 'rotate', label: 'rotate it, at any angle', style: `transform: rotate(-7deg); transform-origin: left center;` },
    { id: 'recolour', label: 'recolour it outside the approved variants', style: `color: #C026D3;` },
    { id: 'shadow', label: 'add a shadow, glow or bevel', style: `text-shadow: 2px 3px 0 rgba(0,0,0,.35);` },
    { id: 'outline', label: 'outline it', style: `-webkit-text-stroke: 1px ${brand}; color: transparent;` },
    { id: 'crowd', label: 'crowd it: the clear space is a rule', style: '' },
    { id: 'retype', label: 'retype it in the body face', style: `font-family: ${body};` },
  ];

  const body_ = `<div class="sheet">
  <div class="sheet__head">
    <span class="eyebrow">${esc(brandName)} / logo</span>
    <h1 class="sheet__title">Wordmark and construction</h1>
    <p class="sheet__sub">Set in ${esc(system.type.fonts.display ?? 'the display face')} at ${esc(tracking)} tracking. A typeset wordmark is a real identity, not a placeholder, as long as the tracking is a decision rather than a default. When a drawn mark arrives, everything below still applies to it.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>Primary</h2><span class="eyebrow">the one to use</span></div>
    <div style="background: ${paper}; border: 1px solid ${rule}; padding: 56px 48px;">${mark(88, ink)}</div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Clear space</h2><span class="eyebrow">one cap height, every side</span></div>
    <p class="block__note">Nothing enters the dashed frame: no type, no rule, no edge of a photograph, no other logo. The measure is the cap height of the wordmark, so it scales with the mark instead of being a fixed number that stops making sense at billboard size. Cap height here is approximated at ${capHeightEm}em; measure it against the outlined mark before this reaches a signwriter.</p>
    <div style="background: ${paper}; border: 1px solid ${rule}; padding: 40px; display: flex; justify-content: center;">
      <div style="border: 1px dashed ${brand}; padding: ${clearSpacePx}px; position: relative;">
        ${mark(88, ink)}
        <span class="mono" style="position: absolute; top: 6px; left: 8px; font-size: 10px; color: ${brand};">1 cap height</span>
      </div>
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Treatments</h2><span class="eyebrow">four, and only four</span></div>
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;">
      <div style="background: ${paper}; border: 1px solid ${rule}; padding: 30px; display: flex; flex-direction: column; gap: 12px;">
        ${mark(44, ink)}<span class="eyebrow">positive, on paper</span>
      </div>
      <div style="background: ${ink}; padding: 30px; display: flex; flex-direction: column; gap: 12px;">
        ${mark(44, paper)}<span class="eyebrow" style="color: ${paper}; opacity: .7;">reversed, on ink</span>
      </div>
      <div style="background: ${brand}; padding: 30px; display: flex; flex-direction: column; gap: 12px;">
        ${mark(44, onBrand)}<span class="eyebrow" style="color: ${onBrand}; opacity: .7;">on the brand colour</span>
      </div>
      <div style="position: relative; background: ${r('accent.solid-hover')}; padding: 30px; display: flex; flex-direction: column; gap: 12px; overflow: hidden;">
        <div style="position: absolute; inset: 0; background: repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 10px, rgba(255,255,255,0) 10px 20px);"></div>
        <div style="position: absolute; inset: 0; background: rgba(0,0,0,.45);"></div>
        <div style="position: relative;">${mark(44, '#FFFFFF')}</div>
        <span class="eyebrow" style="position: relative; color: #FFFFFF; opacity: .75;">over a scrim, on [PHOTOGRAPH]</span>
      </div>
    </div>
    <p class="block__note">On a photograph the mark always sits on a darkened scrim, never straight on the image. A logo that is legible on one photograph and invisible on the next is not a logo, it is a coincidence.</p>
  </div>

  <div class="block">
    <div class="block__title"><h2>Minimum size</h2><span class="eyebrow">shown at actual size</span></div>
    <p class="block__note">Below these the counters close up and the tracking stops reading. Print at ${Math.round(88 * 0.2)}px is roughly 4.7mm cap height at 96 pixels per inch; check it on the actual stock before committing.</p>
    <div style="display: flex; align-items: flex-end; gap: 40px; background: ${paper}; border: 1px solid ${rule}; padding: 32px;">
      ${[[36, 'digital, comfortable'], [24, 'digital, minimum'], [18, 'print, minimum']]
        .map(([size, label]) => `<div style="display: flex; flex-direction: column; gap: 10px;">
        ${mark(size, ink)}
        <span class="mono" style="font-size: 10px; color: ${muted};">${size}px, ${esc(label)}</span>
      </div>`).join('')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>Misuse</h2><span class="eyebrow">${misuse.length} specific ways to get it wrong</span></div>
    <p class="block__note">These are drawn rather than described, because a rule people have seen broken is a rule they remember. Everything here is forbidden without exception.</p>
    <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; background: ${rule};">
      ${misuse.map((m) => `<div style="background: ${paper}; padding: 22px 18px; display: flex; flex-direction: column; gap: 14px; min-height: 116px; overflow: hidden;">
        <div style="flex: 1; display: flex; align-items: center; ${m.id === 'crowd' ? `gap: 4px;` : ''}">
          ${m.id === 'crowd' ? `<span style="font-family: ${body}; font-size: 13px; color: ${muted};">Est.</span>` : ''}
          ${mark(26, ink, m.style)}
          ${m.id === 'crowd' ? `<span style="font-family: ${body}; font-size: 13px; color: ${muted};">2019</span>` : ''}
        </div>
        <span class="mono" style="font-size: 10px; color: ${muted};">Never ${esc(m.label)}</span>
      </div>`).join('')}
    </div>
  </div>

  <div class="block">
    <div class="block__title"><h2>If a drawn mark is coming</h2><span class="eyebrow">the brief</span></div>
    <p class="block__note">Everything above survives the arrival of a real mark: the clear space rule, the colourways, the minimum sizes and the misuse page all still apply. What changes is what sits inside the frame. Whoever draws it needs to know it must work at 16 pixels, in one colour, embroidered, on a photograph, and when somebody describes it over the phone.</p>
  </div>
</div>`;

  return artboard({
    name: 'Logo',
    body: body_,
    css: sheetCss(system),
    fonts,
    systemNote: 'Specification sheet, generated from the resolved system.',
  });
}
