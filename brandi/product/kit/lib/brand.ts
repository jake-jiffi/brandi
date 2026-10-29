// The brand's marks and character, as the product uses them. `brandi product starter` writes this file
// for each brand from its logo system and character pack: it keeps the types and the stand-in mark, and replaces BRAND.
// Components read it (Logo, ProductLockup, Character); nothing redraws or recolours what is here.

/**
 * A mark's renditions, each inline SVG with a tight viewBox: no clear space inside the file, because
 * layout applies it (with the clear space inside, the letters of a 20px logo came out 9px tall).
 *
 * - `full`: the primary logo in its own colours, approved on light grounds. Required.
 * - `full-on-dark`: the same logo in the colours approved on dark grounds, when the brand has them.
 * - `full-ink`: one ink, drawn in currentColor, so it takes the colour of the text around it and
 *   turns CanvasText in forced colours.
 * - `symbol`, `symbol-on-dark`, `symbol-ink`: the symbol alone, for square and narrow places such as
 *   the collapsed rail.
 *
 * The brand's own outlined masters, with no scripts, event attributes or outside references. Logo
 * draws several renditions at once, so it makes each copy's ids (clip paths, gradients) its own.
 */
export type MarkRendition = "full" | "full-on-dark" | "full-ink" | "symbol" | "symbol-on-dark" | "symbol-ink"

/** The moments a character marks. A pack draws only some of them; a moment with no pose gets no picture. */
export type CharacterState =
  | "welcome"
  | "working"
  | "done"
  | "caught-up"
  | "needs-person"
  | "nothing-found"
  | "could-not-load"
  | "help"

export interface BrandCharacter {
  /** The brand's own name for the character. */
  name: string
  /** One pose per state the pack has: inline SVG, or the address of a still. Never invent a pose. */
  poses: Partial<Record<CharacterState, string>>
  /** The 2D renditions, when the pack also has 3D stills. */
  flat?: Partial<Record<CharacterState, string>>
}

export interface Brand {
  /** The brand's name as people say it: the logo's accessible name. */
  name: string
  marks: { full: string } & Partial<Record<MarkRendition, string>>
  logo: {
    /** The preferred height of the logo in product, in px. */
    height: number
    /** The smallest height the full logo may render at on screen, in px. Smaller asks are raised to it. */
    minHeight: number
    /** The smallest height for the symbol alone, in px. */
    symbolMinHeight: number
    /** The clear space on every side, as a share of the logo's rendered height. */
    clearSpace: number
  }
  /** Only when the brand has one. Without it, Character renders nothing. */
  character?: BrandCharacter
}

/**
 * The kit's stand-in mark: a rounded square and the letters PRODUCT, never any brand's artwork. A brand
 * with no drawn logo yet carries it until it has one, and the starter says so where it writes it. Its
 * colours come from the system's roles (brand) and currentColor, so one drawing serves both themes.
 */
const SYMBOL_SHAPE =
  "M6 0h12a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm6 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10Z"
const WORDMARK =
  '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M33.2 16.8V7.2h3.4a2.4 2.4 0 0 1 0 4.8h-3.4"/>' +
  '<path d="M44.2 16.8V7.2h3.4a2.4 2.4 0 0 1 0 4.8h-3.4M46.8 12l3.4 4.8"/>' +
  '<circle cx="60" cy="12" r="4.8"/>' +
  '<path d="M69.8 7.2v9.6h2.4a4.8 4.8 0 0 0 0-9.6Z"/>' +
  '<path d="M82 7.2v6a3.6 3.6 0 0 0 7.2 0v-6"/>' +
  '<path d="M102.09 8.32a4.8 4.8 0 1 0 0 7.36"/>' +
  '<path d="M106.9 7.2h8M110.9 7.2v9.6"/>' +
  "</g>"
const fullMark = (symbolFill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116.2 24"><path fill-rule="evenodd" style="fill:${symbolFill}" d="${SYMBOL_SHAPE}"/>${WORDMARK}</svg>`
const symbolMark = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" style="fill:${fill}" d="${SYMBOL_SHAPE}"/></svg>`
// No rendition for dark grounds: a dark ground takes the one ink, in the text colour around it. Drawn in the brand's
// colour there too, the stand-in vanished on a rail in the brand's colour (1:1).
export const STAND_IN_MARKS: Brand["marks"] = {
  full: fullMark("var(--brand)"),
  "full-ink": fullMark("currentColor"),
  symbol: symbolMark("var(--brand)"),
  "symbol-ink": symbolMark("currentColor"),
}

// PLACEHOLDER. The kit's own brand, for its previews: the stand-in mark and a neutral character. The
// starter replaces everything from here with the brand's own: its marks, or the stand-in under the
// brand's name while none is drawn, and a character only when the brand has one.
//
// The placeholder character: a rounded figure whose face changes with the moment. Not every moment has a
// pose, on purpose, so the previews show that a moment the pack has no pose for gets no picture.
const figure = (face: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 3 96 96"><rect x="14" y="16" width="68" height="70" rx="28" style="fill:var(--brand)"/><g style="fill:var(--on-brand);stroke:var(--on-brand)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${face}</g></svg>`
// One pose in a single ink, in currentColor, as the starter draws a brand's black line drawings: it takes the
// text colour, so it reads on a dark ground as on a light one.
const lineFigure = (face: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 3 96 96"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="16" width="68" height="70" rx="28"/>${face}</g></svg>`

export const BRAND: Brand = {
  name: "Product",
  marks: STAND_IN_MARKS,
  logo: { height: 24, minHeight: 16, symbolMinHeight: 16, clearSpace: 0.25 },
  character: {
    name: "Placeholder",
    poses: {
      welcome: figure('<circle cx="38" cy="46" r="4.5" stroke="none"/><circle cx="58" cy="46" r="4.5" stroke="none"/><path fill="none" d="M38 60q10 8 20 0"/>'),
      working: figure('<circle cx="43" cy="44" r="4.5" stroke="none"/><circle cx="63" cy="44" r="4.5" stroke="none"/><path fill="none" d="M43 62h12"/>'),
      done: figure('<path fill="none" d="M32 47q6-6 12 0M52 47q6-6 12 0M36 58q12 11 24 0"/>'),
      "nothing-found": figure('<circle cx="36" cy="50" r="4.5" stroke="none"/><circle cx="56" cy="50" r="4.5" stroke="none"/><circle fill="none" cx="46" cy="64" r="3.5"/>'),
      help: lineFigure('<circle cx="38" cy="46" r="2"/><circle cx="58" cy="46" r="2"/><path d="M41 62q7 5 14 0"/>'),
    },
  },
}
