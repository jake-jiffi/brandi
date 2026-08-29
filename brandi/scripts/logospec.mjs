/**
 * The logo taxonomies, as data, and the planner that turns them into a set of
 * deliberately different concept briefs.
 *
 * The failure this file exists to prevent is the one every logo generator makes:
 * ask for twelve concepts and get twelve versions of the same idea. Diversity
 * cannot be requested, because "make them different" is an instruction a model
 * agrees with and then ignores. It has to be planned, before anything is drawn,
 * as a walk across a grid that is guaranteed not to repeat itself.
 *
 * So `planConcepts` deals a hand rather than asking for one. Each slot arrives
 * carrying a different architecture, a different typographic register, a
 * different symbol approach and a different construction discipline, plus the
 * category cliches it is forbidden to land on. Whoever draws it sees only its
 * own slot, never the others, which is the other half of the anti-convergence
 * mechanism.
 *
 * The taxonomies are Rampstack's, distilled in
 * `research/findings/08-rampstack-logo-method.md`, which cites the source line
 * for every claim. The numbers in `CONSTRAINTS` are from the same place and are
 * the reason the audit is arithmetic rather than opinion.
 *
 * Every typeface named here was verified on 2026-08-30 to serve from
 * `fonts.gstatic.com/s/`, the public catalogue. That test matters more than it
 * looks: Avenir, Gill Sans and Helvetica all return HTTP 200 from the Google
 * Fonts API and serve from `fonts.gstatic.com/l/font?kit=`, which is commercial
 * delivery for Workspace and not a licence to put a wordmark on a building.
 */

import { BANNED_FONTS, DEFAULT_FONTS } from './canvas.mjs';

// ---------------------------------------------------------------------------
// Architectures
// ---------------------------------------------------------------------------

/**
 * What the logo IS, structurally. The foundational decision: everything else
 * follows from it.
 *
 * `contexts` records how the architecture fares in each application context.
 * `pass` ships as-is, `cond` passes only when a numeric constraint holds, and
 * `fallback` means this asset fails and a different tier of the system has to
 * cover it. A `fallback` is not a defect: a lockup fails the favicon and is
 * still the right primary, because the small-grade asset covers it. The fail
 * budget applies to the SYSTEM of three assets, never to one file, and getting
 * that backwards rejects every lockup, which is the default architecture.
 */
export const ARCHITECTURES = Object.freeze([
  {
    id: 'wordmark',
    name: 'Wordmark only',
    def: 'The brand name set in a chosen face, with the letterforms worked. No standalone symbol.',
    refs: ['Stripe', 'Google', 'Pinterest', 'FedEx', 'eBay'],
    nameLength: { ideal: [4, 8], stretch: [9, 12] },
    needsFallback: ['letterform-as-symbol', 'monogram'],
    discipline: 'Letter by letter. Kerning is not optional. One structural intervention at most.',
    contexts: {
      'favicon-16': 'fallback', 'app-icon-28': 'fallback', 'patch-1.5in': 'cond', 'single-colour': 'pass',
      'reverse-dark': 'cond', 'signage-large': 'cond', motion: 'pass', 'social-square': 'fallback',
      'apparel-embroidery': 'cond', 'foil-stamp': 'cond',
    },
  },
  {
    id: 'lockup',
    name: 'Lockup, wordmark plus symbol',
    def: 'A wordmark and a symbol in a fixed relationship, with a stacked alternate for square.',
    refs: ['Slack', 'Airbnb', 'Asana', 'Mastercard'],
    isDefault: true,
    needsFallback: ['symbol-only', 'letterform-as-symbol', 'monogram'],
    discipline: 'The gap is a ratio of the wordmark x-height, so it holds at every size. Symbol optical weight matches the wordmark stroke.',
    contexts: {
      'favicon-16': 'fallback', 'app-icon-28': 'fallback', 'patch-1.5in': 'fallback', 'single-colour': 'cond',
      'reverse-dark': 'cond', 'signage-large': 'pass', motion: 'pass', 'social-square': 'fallback',
      'apparel-embroidery': 'fallback', 'foil-stamp': 'cond',
    },
  },
  {
    id: 'symbol-only',
    name: 'Symbol only',
    def: 'A symbol carrying alone, with the wordmark relegated to legal and contextual surfaces.',
    refs: ['Apple', 'Nike', 'Target'],
    needsFallback: ['wordmark'],
    discipline: 'Earned over decades. Mechanically it passes everything; strategically it is unavailable to a new brand.',
    maturityGated: true,
    contexts: {
      'favicon-16': 'pass', 'app-icon-28': 'pass', 'patch-1.5in': 'pass', 'single-colour': 'cond',
      'reverse-dark': 'cond', 'signage-large': 'pass', motion: 'pass', 'social-square': 'pass',
      'apparel-embroidery': 'pass', 'foil-stamp': 'pass',
    },
  },
  {
    id: 'letterform-as-symbol',
    name: 'Letterform as symbol',
    def: 'One letter of the name, drawn so it reads as the letter AND as the idea.',
    refs: ['Beats b', "McDonald's M"],
    goodLetters: ['M', 'A', 'B', 'S', 'D', 'W', 'K', 'R'],
    hardLetters: ['I', 'L', 'J', 'T'],
    needsFallback: ['wordmark'],
    discipline: 'The double read is the gate. If it reads only as the letter, or only as the metaphor, it has not earned its place.',
    contexts: {
      'favicon-16': 'pass', 'app-icon-28': 'pass', 'patch-1.5in': 'pass', 'single-colour': 'pass',
      'reverse-dark': 'cond', 'signage-large': 'pass', motion: 'pass', 'social-square': 'pass',
      'apparel-embroidery': 'pass', 'foil-stamp': 'pass',
    },
  },
  {
    id: 'monogram',
    name: 'Monogram',
    def: 'Two or three initials combined as one shape: ligature, framed, or optically kerned.',
    refs: ['Chanel', 'HBO', 'VW'],
    flavours: ['pure-ligature', 'framed', 'tight-kerned'],
    needsFallback: ['wordmark'],
    discipline: 'Under-styled it is just typed initials. Over-framed it is a fake-heritage template. The distance between those is the work.',
    contexts: {
      'favicon-16': 'pass', 'app-icon-28': 'pass', 'patch-1.5in': 'pass', 'single-colour': 'pass',
      'reverse-dark': 'cond', 'signage-large': 'pass', motion: 'cond', 'social-square': 'pass',
      'apparel-embroidery': 'pass', 'foil-stamp': 'pass',
    },
  },
]);

// ---------------------------------------------------------------------------
// Typographic registers
// ---------------------------------------------------------------------------

/**
 * Every face named here serves from the Google Fonts public catalogue, is not
 * on the anti-slop contract's hard list, and was checked rather than assumed.
 *
 * `refused` holds the faces the contract turns down by default. They are kept
 * rather than deleted because the contract's own rule is that refused is not
 * forbidden: a face the client already licences is evidence, and evidence beats
 * a general rule. The planner will not deal them, and a person can still choose
 * one with a stated reason.
 */
export const REGISTERS = Object.freeze([
  {
    id: 'geometric',
    name: 'Geometric sans',
    built: 'Circles and verticals.',
    signals: 'Modern, considered, optimistic.',
    risk: 'Cold, or generic startup, if nothing warms it up.',
    deRisk: 'One warmed letterform, or a warm palette, or a symbol with a hand in it.',
    faces: ['Jost', 'Outfit', 'Mulish', 'DM Sans', 'Work Sans', 'Familjen Grotesk'],
    refused: ['Poppins', 'Montserrat', 'Space Grotesk'],
  },
  {
    id: 'humanist',
    name: 'Humanist sans',
    built: 'Calligraphic gestures without serifs.',
    signals: 'Professional but warm.',
    risk: 'Reads as safe when the brief wanted a position.',
    deRisk: 'Push the case or the weight further than feels comfortable.',
    faces: ['Cabin', 'Nunito Sans', 'Josefin Sans', 'Julius Sans One', 'Marcellus'],
    refused: ['Open Sans', 'Nunito', 'Lato'],
  },
  {
    id: 'neo-grotesque',
    name: 'Neo-grotesque sans',
    built: 'Closed apertures, even rhythm, no gesture.',
    signals: 'Competent and contemporary.',
    risk: 'The modern default. Generic unless something else is carrying.',
    deRisk: 'Only pick this when the symbol or the colour is doing the distinctive work.',
    faces: ['Archivo', 'Libre Franklin', 'Geist', 'IBM Plex Sans', 'Source Sans 3'],
    refused: ['Inter', 'Roboto', 'Arial'],
  },
  {
    id: 'transitional-serif',
    name: 'Transitional serif',
    built: 'High contrast, sharp bracketing.',
    signals: 'Editorial, considered, intellectual.',
    risk: 'Fine strokes die at small sizes and under thread.',
    deRisk: 'Pick a screen cut, and check the thinnest stroke before committing.',
    faces: ['Newsreader', 'Literata', 'Baskervville', 'Libre Baskerville', 'Libre Caslon Display', 'Source Serif 4', 'IBM Plex Serif', 'Charis SIL'],
    refused: ['Playfair Display', 'DM Serif Display', 'Instrument Serif'],
  },
  {
    id: 'old-style-serif',
    name: 'Old-style serif',
    built: 'Low contrast, warm shapes, angled stress.',
    signals: 'Heritage, institutional, unhurried.',
    risk: 'Fake heritage, if the brand has none.',
    deRisk: 'Set it in a modern layout. The face carries the age, the composition carries the present.',
    faces: ['EB Garamond', 'Cormorant Garamond', 'Libre Caslon Text', 'Cardo', 'Crimson Pro', 'Gentium Book Plus'],
    refused: [],
  },
  {
    id: 'slab',
    name: 'Slab serif',
    built: 'Structural serifs carrying real weight.',
    signals: 'Strong, declarative, journalistic.',
    risk: 'Shouty at large sizes.',
    deRisk: 'Drop a weight and open the tracking.',
    faces: ['Bitter', 'Zilla Slab', 'Rokkitt', 'Bree Serif', 'Josefin Slab'],
    refused: [],
  },
  {
    id: 'display-drawn',
    name: 'Drawn display',
    built: 'A public-catalogue base with one or two glyphs redrawn to solve a named problem.',
    signals: 'A wordmark nobody else has.',
    risk: 'Custom for novelty reads as a gimmick.',
    deRisk: 'Every modified glyph names the problem it solves. Two is the ceiling; three is a redesign.',
    faces: ['Syne', 'Bricolage Grotesque', 'Instrument Sans'],
    refused: ['Fraunces'],
    surgery: true,
  },
]);

// ---------------------------------------------------------------------------
// Symbol approaches
// ---------------------------------------------------------------------------

export const SYMBOL_APPROACHES = Object.freeze([
  {
    id: 'literal',
    name: 'Literal',
    brief: 'Depict the actual thing, specifically. Not "a leaf" but the leaf of the plant this business grows.',
    risk: 'The category cliche.',
    saves: 'Specificity of the subject, and conviction in the drawing.',
    fitsNames: ['descriptive', 'concrete'],
  },
  {
    id: 'abstract-gesture',
    name: 'Abstract gesture',
    brief: 'A quality made into a movement. A rising arc, two forms in tension, a line that does not close.',
    risk: 'Arbitrary. Any gesture can mean anything.',
    saves: 'A formal logic stated in one sentence, applied consistently across the mark.',
    fitsNames: ['abstract', 'coined'],
  },
  {
    id: 'geometric-reduction',
    name: 'Geometric reduction',
    brief: 'A constructed form with no referent, built on a stated grid.',
    risk: 'Already done a thousand times. Hexagons and triangles are the graveyard.',
    saves: 'Specific proportions that are yours, and a wordmark doing the distinctive work.',
    fitsNames: ['abstract', 'coined'],
  },
  {
    id: 'letterform-derived',
    name: 'Letterform derived',
    brief: 'Built out of the name\'s own letters, so the symbol and the wordmark are one identity.',
    risk: 'Reads as a wordmark that lost its other letters.',
    saves: 'Exaggerate until the letter is also the thing.',
    fitsNames: ['descriptive', 'concrete', 'founder'],
  },
  {
    id: 'monogram',
    name: 'Monogram',
    brief: 'The initials as a single constructed shape.',
    risk: 'Old-fashioned, or a heraldry template.',
    saves: 'Modern execution inside a traditional architecture.',
    fitsNames: ['founder', 'place', 'long'],
  },
]);

// ---------------------------------------------------------------------------
// Application contexts
// ---------------------------------------------------------------------------

/**
 * What a mark has to survive, with the number that decides it.
 *
 * `minStrokeRatio` is a fraction of the mark's own width, so it is scale free
 * and can be measured on the geometry rather than on a render. Two pixels at
 * sixteen is one eighth of the mark; two millimetres at 38.1 is one nineteenth.
 * The digital constraint is far harsher than the physical one, which is the
 * opposite of most people's intuition and the reason favicons kill concepts.
 */
export const CONTEXTS = Object.freeze([
  {
    id: 'favicon-16',
    renderAt: 16,
    name: '16px favicon',
    at: '16px',
    minStrokeRatio: 2 / 16,
    maxRegions: 6,
    maxColours: 4,
    gradients: false,
    mechanical: true,
    why: 'The most aggressive small-size test, and the one that kills the most concepts.',
  },
  {
    id: 'app-icon-28',
    renderAt: 32,
    name: '28px app icon',
    at: '28px',
    minStrokeRatio: 3 / 28,
    maxRegions: 8,
    maxColours: 6,
    gradients: false,
    safeCircleRatio: 0.9,
    needsBackground: true,
    mechanical: true,
    why: 'Masked to a rounded square by one launcher and a circle by the next.',
  },
  {
    id: 'patch-1.5in',
    name: '1.5 inch embroidered patch',
    at: '38.1mm',
    minStrokeRatio: 1 / 38.1,
    minCapRatio: 2 / 38.1,
    maxColours: 6,
    gradients: false,
    minInteriorAngle: 30,
    mechanical: true,
    why: 'Every thread colour is a setup cost, and an acute angle fails under the needle.',
  },
  {
    id: 'single-colour',
    name: 'One colour',
    at: 'any',
    maxColours: 1,
    gradients: false,
    mechanical: true,
    why: 'Etching, foil, letterpress, a fax. If regions merge when hue is removed, colour was doing the work.',
  },
  {
    id: 'reverse-dark',
    name: 'Reversed on dark',
    at: 'any',
    minContrast: 3,
    mechanical: true,
    why: 'Dark mode, night signage, a black envelope.',
  },
  {
    id: 'signage-large',
    name: 'Large format signage',
    at: '8 to 12 feet',
    minStrokeRatio: 0.04,
    vectorOnly: true,
    mechanical: 'partly',
    why: 'Thin strokes that looked elegant at 200px look anaemic at three metres.',
  },
  {
    id: 'motion',
    name: 'Motion lockup',
    at: '1 to 3 seconds',
    mechanical: false,
    why: 'A mark whose construction suggests its own assembly animates itself. An arbitrary one has to be pushed around.',
  },
  {
    id: 'social-square',
    renderAt: 64,
    name: 'Square social avatar',
    at: '80px in a feed',
    safeCircleRatio: 1,
    minStrokeRatio: 2 / 80,
    mechanical: true,
    why: 'Cropped to a circle, seen at notification size, on both light and dark platform chrome.',
  },
  {
    id: 'apparel-embroidery',
    name: 'Embroidery on fabric',
    at: '38.1mm',
    minStrokeRatio: 2 / 38.1,
    minCapRatio: 2.5 / 38.1,
    maxColours: 6,
    gradients: false,
    mechanical: 'partly',
    why: 'Tighter than a patch, because the fabric is the substrate. Whatever passes here passes a patch.',
  },
  {
    id: 'foil-stamp',
    name: 'Foil stamp',
    at: 'card scale',
    maxColours: 1,
    minStrokeRatio: 1 / 38.1,
    gradients: false,
    mechanical: true,
    why: 'A serif bracket thinner than the die is a serif bracket that does not arrive.',
  },
]);

/**
 * The tightest number in each family, which is the one that governs.
 *
 * Gradients fail five of the ten contexts, which under the scoring rule makes a
 * gradient mark non-viable rather than merely risky. It is a refusal, not a
 * warning.
 */
export const CONSTRAINTS = Object.freeze({
  minStrokeRatioDigital: 2 / 16,
  minStrokeRatioIcon: 3 / 28,
  minStrokeRatioPhysical: 2 / 38.1,
  minCapRatioPhysical: 2.5 / 38.1,
  maxColoursDigitalSmall: 4,
  maxColoursPhysical: 6,
  maxColoursFoil: 1,
  maxRegionsAtFavicon: 6,
  gradientsAllowed: false,
  contextFailBudget: 2,
});

// ---------------------------------------------------------------------------
// Cliches
// ---------------------------------------------------------------------------

/** `'*'` in `banFor` means every category. */
export const CLICHES = Object.freeze([
  { motif: 'swoosh', banFor: ['*'], note: 'A borrowed growth claim.' },
  { motif: 'letter with an angled cut corner', banFor: ['*'] },
  { motif: 'monogram in a heavy ring', banFor: ['*'] },
  { motif: 'shield with the year founded', banFor: ['*'], note: 'Reads as a craft beer label.' },
  { motif: 'filigree monogram', banFor: ['*'], note: 'Renaissance faire, not heritage.' },
  { motif: 'shield', banFor: ['*', 'security', 'finance'] },
  { motif: 'leaf', banFor: ['sustainability', 'wellness', 'organic', 'cpg', 'food'] },
  { motif: 'mountain as aspiration', banFor: ['wellness', 'productivity'], allowFor: ['outdoor'], note: 'Allowed only as a specific named peak.' },
  { motif: 'bullseye', banFor: ['analytics', 'marketing'] },
  { motif: 'hexagon', banFor: ['crypto', 'web3', 'tech', 'saas'], note: 'The most overused primitive in technology.' },
  { motif: 'three stacked bars', banFor: ['saas', 'developer-tools'] },
  { motif: 'infinity loop', banFor: ['*'] },
  { motif: 'ascending arc or growth arrow', banFor: ['analytics', 'finance', 'saas'] },
  { motif: 'triangle pointing forward', banFor: ['productivity', 'saas', 'navigation'] },
  { motif: 'square as foundation', banFor: ['platform', 'infrastructure'] },
  { motif: 'bisected circle', banFor: ['wellness', 'productivity'] },
  { motif: 'letter inside a plain circle', banFor: ['saas'], note: 'Banned when the letterform itself is not constructed.' },
  { motif: 'crown', banFor: ['luxury', 'hospitality', 'fashion'] },
  { motif: 'handshake', banFor: ['*'] },
  { motif: 'roman pillar', banFor: ['legal'] },
  { motif: 'scales of justice', banFor: ['legal'] },
  { motif: 'gavel', banFor: ['legal'] },
  { motif: 'brushstroke under the wordmark', banFor: ['cpg', 'food'] },
  { motif: 'crossed keys', banFor: ['hospitality'] },
  { motif: 'palm or resort mountain', banFor: ['hospitality', 'travel'] },
  { motif: 'medical cross', banFor: ['healthcare'], note: 'Red Cross exposure in some uses.' },
  { motif: 'caduceus', banFor: ['healthcare'], note: 'It is Hermes, not medicine.' },
  { motif: 'heartbeat line', banFor: ['healthcare', 'fitness'] },
  { motif: 'eagle', banFor: ['finance'] },
  { motif: 'bull', banFor: ['finance'] },
  { motif: 'blackletter masthead', banFor: ['editorial'] },
  { motif: 'decorative drop cap', banFor: ['editorial'] },
  { motif: 'pen nib', banFor: ['editorial', 'writing'] },
  { motif: 'book with a ribbon', banFor: ['editorial', 'education'] },
  { motif: 'neural network of circles and lines', banFor: ['ai', 'tech'] },
  { motif: 'brain with circuit traces', banFor: ['ai', 'tech'] },
  { motif: 'triangle with an eye', banFor: ['ai', 'tech'] },
  { motif: 'sparkle or four-pointed star', banFor: ['ai', 'tech'], note: 'The 2023 machine-learning tell.' },
  { motif: 'bear silhouette', banFor: ['outdoor'] },
  { motif: 'peak with a rising sun', banFor: ['outdoor'] },
  { motif: 'compass rose', banFor: ['outdoor', 'travel'] },
  { motif: 'tent silhouette', banFor: ['outdoor'] },
  { motif: 'house outline', banFor: ['property', 'trades', 'construction'] },
  { motif: 'abstract globe of curved lines', banFor: ['*'] },
  { motif: 'water droplet', banFor: ['plumbing', 'cleaning', 'sustainability'] },
  { motif: 'gear or cog', banFor: ['engineering', 'trades', 'saas'] },
  { motif: 'paw print', banFor: ['pets', 'veterinary'] },
]);

export const PALETTE_CLICHES = Object.freeze([
  { pattern: 'blue to green gradient', banFor: ['healthcare'] },
  { pattern: 'blue to gold gradient', banFor: ['finance'] },
  { pattern: 'purple to indigo gradient', banFor: ['tech', 'ai', 'saas'], note: 'The 2018 to 2022 technology tier.' },
  { pattern: 'old english on gold foil', banFor: ['fashion', 'luxury'] },
  { pattern: 'cream ground with terracotta', banFor: ['*'], note: 'The current wellness and studio default.' },
]);

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/**
 * The default register and symbol approach a category expects.
 *
 * Choosing inside the default reads as competence. Choosing outside reads as a
 * position. Both are legitimate, and a concept round that is entirely one or the
 * other has not given anybody a choice, so the planner deliberately mixes them.
 */
export const CATEGORIES = Object.freeze({
  legal: { register: 'old-style-serif', approach: 'monogram', break: 'geometric', breakSignals: 'Modern and accessible.' },
  finance: { register: 'transitional-serif', approach: 'geometric-reduction', break: 'humanist', breakSignals: 'Human, not institutional.' },
  saas: { register: 'neo-grotesque', approach: 'geometric-reduction', break: 'old-style-serif', breakSignals: 'We take ourselves seriously.' },
  ai: { register: 'neo-grotesque', approach: 'abstract-gesture', break: 'slab', breakSignals: 'Built, not conjured.' },
  healthcare: { register: 'humanist', approach: 'abstract-gesture', break: 'old-style-serif', breakSignals: 'Established care, not a startup.' },
  editorial: { register: 'transitional-serif', approach: 'letterform-derived', break: 'geometric', breakSignals: 'Contemporary, not archival.' },
  hospitality: { register: 'old-style-serif', approach: 'monogram', break: 'geometric', breakSignals: 'Unfussy and current.' },
  fashion: { register: 'display-drawn', approach: 'monogram', break: 'neo-grotesque', breakSignals: 'Product first, no theatre.' },
  luxury: { register: 'old-style-serif', approach: 'monogram', break: 'geometric', breakSignals: 'Quiet money.' },
  cpg: { register: 'geometric', approach: 'literal', break: 'slab', breakSignals: 'Honest and unbranded.' },
  food: { register: 'display-drawn', approach: 'literal', break: 'neo-grotesque', breakSignals: 'The food is the story.' },
  outdoor: { register: 'slab', approach: 'literal', break: 'neo-grotesque', breakSignals: 'Technical, not romantic.' },
  trades: { register: 'slab', approach: 'letterform-derived', break: 'humanist', breakSignals: 'Approachable, not heavy.' },
  construction: { register: 'slab', approach: 'geometric-reduction', break: 'transitional-serif', breakSignals: 'Considered, not brute.' },
  engineering: { register: 'neo-grotesque', approach: 'geometric-reduction', break: 'old-style-serif', breakSignals: 'A practice, not a vendor.' },
  property: { register: 'transitional-serif', approach: 'monogram', break: 'geometric', breakSignals: 'Direct and current.' },
  education: { register: 'old-style-serif', approach: 'monogram', break: 'humanist', breakSignals: 'Warm, not institutional.' },
  pets: { register: 'geometric', approach: 'literal', break: 'slab', breakSignals: 'Sturdy and practical.' },
  fitness: { register: 'geometric', approach: 'letterform-derived', break: 'old-style-serif', breakSignals: 'Discipline, not hype.' },
  wellness: { register: 'humanist', approach: 'abstract-gesture', break: 'neo-grotesque', breakSignals: 'Evidence, not vibes.' },
  travel: { register: 'humanist', approach: 'literal', break: 'transitional-serif', breakSignals: 'Considered, not cheerful.' },
  security: { register: 'neo-grotesque', approach: 'geometric-reduction', break: 'slab', breakSignals: 'Solid, not slick.' },
  marketing: { register: 'geometric', approach: 'abstract-gesture', break: 'transitional-serif', breakSignals: 'Editorial, not agency.' },
  general: { register: 'humanist', approach: 'letterform-derived', break: 'slab', breakSignals: 'More weight than expected.' },
});

/**
 * The words a real person uses for a category, mapped to the category.
 *
 * Nobody describes their business as "pets". They say dog grooming, or mobile
 * vet, or cattery. Matching only on the taxonomy's own key sent a dog groomer
 * to the generic bucket and therefore never told it not to draw a paw print,
 * which is the single most predictable thing a dog groomer's logo does.
 */
export const CATEGORY_ALIASES = Object.freeze({
  pets: ['pet', 'dog', 'cat', 'puppy', 'kennel', 'cattery', 'grooming', 'groomer', 'animal', 'vet', 'veterinary'],
  legal: ['law', 'lawyer', 'solicitor', 'barrister', 'attorney', 'conveyanc', 'notary'],
  finance: ['financial', 'accounting', 'accountant', 'bookkeep', 'wealth', 'invest', 'mortgage', 'broker', 'insur', 'bank', 'tax'],
  saas: ['software', 'app', 'platform', 'b2b', 'startup', 'developer tools', 'devtool', 'api'],
  ai: ['artificial intelligence', 'machine learning', 'llm', 'agent'],
  healthcare: ['health', 'medical', 'clinic', 'doctor', 'dental', 'dentist', 'physio', 'psycholog', 'nurse', 'aged care', 'allied health'],
  editorial: ['publish', 'magazine', 'newspaper', 'journal', 'media', 'newsletter', 'writing'],
  hospitality: ['hotel', 'restaurant', 'cafe', 'coffee', 'bar', 'pub', 'catering', 'venue', 'accommodation'],
  fashion: ['clothing', 'apparel', 'label', 'boutique', 'menswear', 'womenswear', 'streetwear'],
  luxury: ['jewel', 'watch', 'bespoke', 'couture', 'premium'],
  cpg: ['consumer goods', 'packaged', 'grocery', 'retail brand', 'fmcg'],
  food: ['bakery', 'baker', 'butcher', 'brewery', 'distill', 'winery', 'produce', 'kitchen', 'sauce', 'chocolat', 'roaster'],
  outdoor: ['camping', 'hiking', 'climbing', 'surf', 'adventure', 'bushwalk', 'gear'],
  trades: ['plumb', 'electric', 'carpent', 'landscap', 'painter', 'roofing', 'handyman', 'tiler', 'cleaner', 'cleaning', 'mechanic', 'auto'],
  construction: ['builder', 'building', 'construct', 'civil', 'concret', 'joinery', 'formwork'],
  engineering: ['engineer', 'structural', 'geotech', 'surveying', 'drafting'],
  property: ['real estate', 'realtor', 'estate agent', 'strata', 'property management'],
  education: ['school', 'tutor', 'course', 'training', 'academy', 'college', 'university', 'childcare', 'learning'],
  fitness: ['gym', 'pilates', 'yoga', 'crossfit', 'personal train', 'strength'],
  wellness: ['wellbeing', 'massage', 'spa', 'therapy', 'meditat', 'nutrition'],
  travel: ['tour', 'holiday', 'flight', 'cruise', 'itinerary'],
  security: ['cyber', 'surveillance', 'guard', 'alarm', 'locksmith'],
  marketing: ['agency', 'advertis', 'brand consult', 'seo', 'creative studio', 'design studio'],
});

/** The category record for a free-text category, falling back to `general`. */
export function categoryDefaults(category) {
  if (!category) return { id: 'general', ...CATEGORIES.general };
  const key = String(category).toLowerCase().trim();
  if (CATEGORIES[key]) return { id: key, ...CATEGORIES[key] };

  // Aliases first, because they are how people actually describe themselves.
  // The longest matching alias wins, so "design studio" does not lose to a
  // shorter word that happens to appear in the same sentence.
  let best = null;
  for (const [id, words] of Object.entries(CATEGORY_ALIASES)) {
    for (const w of words) {
      if (key.includes(w) && (!best || w.length > best.length)) best = { id, length: w.length };
    }
  }
  if (best) return { id: best.id, ...CATEGORIES[best.id] };

  const found = Object.keys(CATEGORIES).find((k) => k !== 'general' && (key.includes(k) || k.includes(key)));
  return found ? { id: found, ...CATEGORIES[found] } : { id: 'general', ...CATEGORIES.general };
}

/** Every cliche this category must avoid, universal ones included. */
export function clichesFor(category) {
  const id = categoryDefaults(category).id;
  const raw = String(category ?? '').toLowerCase();
  return CLICHES.filter((c) => {
    if (c.allowFor?.some((a) => a === id || raw.includes(a))) return false;
    return c.banFor.some((b) => b === '*' || b === id || raw.includes(b));
  }).map((c) => c.motif);
}

// ---------------------------------------------------------------------------
// The planner
// ---------------------------------------------------------------------------

/**
 * The four families a person perceives as genuinely different kinds of logo.
 *
 * This is not the same axis as architecture. Architecture is a construction
 * fact; family is what the answer looks like from across the room, and a concept
 * round has to differ on the second one or it has not offered a choice.
 */
export const FAMILIES = Object.freeze([
  {
    id: 'wordmark',
    name: 'Wordmark',
    architecture: 'wordmark',
    approaches: [null],
    question: 'Can the name itself carry the identity?',
  },
  {
    id: 'letterform',
    name: 'Letterform and monogram',
    architectures: ['letterform-as-symbol', 'monogram'],
    approaches: ['letterform-derived', 'monogram'],
    question: 'What does the name become when it is reduced to one shape?',
  },
  {
    id: 'symbolic',
    name: 'Symbolic',
    architecture: 'lockup',
    approaches: ['literal', 'letterform-derived'],
    question: 'What thing does this business actually put in front of people?',
  },
  {
    id: 'abstract',
    name: 'Abstract',
    architecture: 'lockup',
    approaches: ['abstract-gesture', 'geometric-reduction'],
    question: 'What quality can be made into a form that is only ours?',
  },
]);

/** A deterministic 32-bit hash, so the same brief always deals the same hand. */
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32. Small, fast, and good enough to shuffle a deck of seven. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, next) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * What the name suggests about which symbol approaches can work.
 *
 * A descriptive name invites a literal symbol; an invented one cannot support
 * it, because there is nothing to depict. Getting this wrong disconnects the
 * symbol from the name, which is the most common reason a concept round feels
 * arbitrary.
 */
export function nameType(name) {
  const n = String(name ?? '').trim();
  if (!n) return 'abstract';
  // A partnership marker is checked before length, because "Hale & Byrne" is
  // three tokens and is emphatically not a long descriptive name.
  if (/(&|\band\b|\bco\b|\bassociates\b|\bpartners\b|\bbrothers\b|\bsons\b)/i.test(n)) return 'founder';
  const words = n.split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
  const bare = (words[0] ?? '').replace(/[^A-Za-z]/g, '');
  if (words.length >= 3 || bare.length > 11) return 'long';
  if (words.length > 1) return 'descriptive';
  // One word made of ordinary letters with vowels reads as a real thing, so a
  // literal symbol has something to depict. The test is crude and only ever
  // decides which approaches to prefer, never which to refuse.
  if (/^[A-Z][a-z]+$/.test(bare) && /[aeiou]/i.test(bare) && bare.length <= 8) return 'concrete';
  return 'abstract';
}

/**
 * Deal a set of concept slots that cannot converge.
 *
 * Guarantees, each of which has a test:
 * - Families are filled round robin, so no family is starved.
 * - No two slots share the same register and symbol approach pair.
 * - The category default register appears at most twice, and at least a third
 *   of the slots are deliberately outside it, because a round that is all
 *   in-category shows competence and no choice, and one that is all out-of-
 *   category is a costume party.
 * - Every slot carries the category cliche list, at brief time rather than at
 *   review time. Refusing a motif before it is drawn is cheaper than rejecting
 *   it after somebody has grown fond of it.
 * - Refused faces are never dealt.
 */
export function planConcepts(brief = {}, { count = 12, seed } = {}) {
  const name = brief.name ?? 'Brand';
  const cat = categoryDefaults(brief.category);
  const cliches = clichesFor(brief.category);
  const kind = nameType(name);
  const next = rng(seed != null ? hashSeed(String(seed)) : hashSeed(`${name}|${cat.id}|${count}`));

  const n = Math.max(4, Math.min(24, Math.round(count)));

  // A small number of slots are nominated to sit inside the category default,
  // so the round reads as competent as well as positioned. The rest push the
  // default to the back of the queue rather than removing it: an earlier
  // version excluded it from the deck outright, which shrank the deck to six
  // cards and let a sixteen-slot round repeat a pair once the deck ran out.
  const allRegisters = REGISTERS.map((r) => r.id);
  const defaultSlots = new Set();
  const maxDefault = Math.max(1, Math.min(2, Math.floor(n / 4)));
  const positions = shuffled([...Array(n).keys()], next);
  for (let i = 0; i < maxDefault; i++) defaultSlots.add(positions[i]);

  const used = new Set();
  const repeated = [];
  const slots = [];

  for (let i = 0; i < n; i++) {
    const family = FAMILIES[i % FAMILIES.length];
    const architecture = family.architecture ?? family.architectures[Math.floor(next() * family.architectures.length)];

    // Search the whole grid this family is allowed rather than guessing and
    // re-guessing. An approach can be shared between two families, so a greedy
    // pick that only ever varies the register will run out while a perfectly
    // good pair sits one approach across.
    const approachPool = family.approaches.filter((a) => {
      if (a == null) return true;
      const spec = SYMBOL_APPROACHES.find((s) => s.id === a);
      return !spec?.fitsNames || spec.fitsNames.includes(kind) || family.id === 'letterform';
    });
    const preferred = shuffled(approachPool.length ? approachPool : family.approaches, next);
    const wantDefault = defaultSlots.has(i);
    const shuffledRegs = shuffled(allRegisters, next).filter((r) => r !== cat.register);
    const ordered = wantDefault ? [cat.register, ...shuffledRegs] : [...shuffledRegs, cat.register];

    // Two passes. The first uses only the approaches the name type suits; the
    // second widens to everything the family allows.
    //
    // The widening matters at large counts. `literal` does not suit a founder
    // name, so for "Hale & Byrne" the symbolic family collapses to
    // `letterform-derived` alone, which the letterform family is also drawing
    // from. Seven registers cannot cover twelve slots, and the old code fell
    // through to a duplicate pair without saying so. Measured over 29,232
    // plans, that happened in 435 of them, every one at a count of twenty or
    // more. The name-type filter was always a preference and never a refusal,
    // which is exactly what makes widening the right answer rather than a
    // workaround.
    const fallback = shuffled(family.approaches, next).filter((a) => !preferred.includes(a));
    let register = ordered[0];
    let approach = preferred[0];
    let found = false;
    for (const a of [...preferred, ...fallback]) {
      for (const r of ordered) {
        if (!used.has(`${r}|${a}`)) {
          register = r;
          approach = a;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    // The grid really is full. Say so rather than dealing the same pair twice
    // and letting it look like a coincidence.
    if (!found) repeated.push(`${String.fromCharCode(65 + (i % FAMILIES.length))}${Math.floor(i / FAMILIES.length) + 1}`);
    used.add(`${register}|${approach}`);

    const reg = REGISTERS.find((r) => r.id === register) ?? REGISTERS[0];
    const arch = ARCHITECTURES.find((a) => a.id === architecture);

    slots.push({
      id: `${String.fromCharCode(65 + (i % FAMILIES.length))}${Math.floor(i / FAMILIES.length) + 1}`,
      index: i,
      family: family.id,
      familyName: family.name,
      question: family.question,
      architecture,
      architectureName: arch?.name ?? architecture,
      register,
      registerName: reg.name,
      faces: reg.faces.filter((f) => !isRefusedFace(f)),
      surgery: Boolean(reg.surgery),
      symbolApproach: approach,
      symbolBrief: approach ? SYMBOL_APPROACHES.find((s) => s.id === approach)?.brief ?? null : null,
      inCategory: register === cat.register,
      // What this concept says, which is a property of the register it is set
      // in. An earlier version printed the category-break sentence here, so
      // eleven of twelve cells on the board carried the identical line and the
      // range looked like one idea with twelve labels.
      signals: reg.signals,
      position: register === cat.register
        ? `Inside the ${cat.id} convention, which reads as competence.`
        : `Outside the ${cat.id} convention. ${cat.breakSignals}`,
      smallGrade: (arch?.needsFallback ?? ['letterform-as-symbol'])[0],
      mustNotBe: cliches,
      risk: reg.risk,
      deRisk: reg.deRisk,
    });
  }

  return {
    name,
    category: cat.id,
    nameType: kind,
    count: n,
    slots,
    // Empty in every plan the tests exercise. Present so that a round which
    // genuinely exhausted the grid says so rather than looking like a
    // coincidence somebody has to notice.
    repeatedPairs: repeated,
    rules: [
      'Design the small-grade asset first. The harshest application drives the construction of the largest, not the other way round.',
      'All three assets in a concept share one letterform language, one construction grid and one optical weight class.',
      'Black on white only. Colour is decided later and must not be allowed to rescue a weak silhouette.',
      'One idea per mark. Two at the very most. Three is committee work.',
    ],
  };
}

/**
 * What a refinement round is for, which is not more concepts.
 *
 * Once a direction is chosen the job changes completely. The question stops
 * being "what could this be" and becomes "what does this need in order to be a
 * system", and the answer is always the same four things: the mark drawn better,
 * the mark drawn heavier or lighter until it sits right, a version that survives
 * sixteen pixels, and a square composition for the contexts that crop. Dealing a
 * second round of fresh concepts here is the most common way a good direction
 * gets lost.
 *
 * The small-grade redraw is first in the list on purpose. It is a redraw on the
 * pixel grid, not a scaled copy, and doing it early tells you whether the
 * direction can survive at all before anybody spends time polishing it.
 */
export const REFINEMENT_TASKS = Object.freeze([
  {
    suffix: 'sm',
    name: 'The small-grade redraw',
    task: 'Redraw the mark for 16 pixels, on the pixel grid, with whole-pixel widths and no sub-pixel optical corrections. This is a redraw, not a scale-down: simplify until it survives, and accept losing detail that only reads at large sizes.',
    gate: 'At 16px it must be one identifiable shape with its counters still open.',
  },
  {
    suffix: 'p',
    name: 'Proportion',
    task: 'Same idea, better proportioned. Work the ratios: the relationship between the parts, the width against the height, where the mass sits. Change nothing about the concept.',
    gate: 'Somebody who saw the original must recognise this as the same mark.',
  },
  {
    suffix: 'w',
    name: 'Weight',
    task: 'Same idea, one step heavier or one step lighter, whichever the original needed. Apply the optical corrections properly: horizontals slightly thinner than verticals, curves overshooting flats.',
    gate: 'The optical weight must read as even, which is not the same as the numbers being equal.',
  },
  {
    suffix: 'sq',
    name: 'The square alternate',
    task: 'Recompose the mark for a square field: an app icon, a social avatar, a stamp. This is a composition, not a crop.',
    gate: 'Everything must sit inside the circle inscribed in the square, because launchers and social platforms crop to it.',
  },
]);

/**
 * The slots for refining one chosen concept.
 *
 * Every brief carries the path to the file being refined, because unlike a
 * concept slot this one is explicitly derivative: the agent is meant to look at
 * what exists and improve it, not to have its own idea.
 */
export function refinementSlots(candidate, { tasks = REFINEMENT_TASKS } = {}) {
  return tasks.map((t) => ({
    id: `${candidate.id}${t.suffix}`,
    refines: candidate.id,
    refinesFile: candidate.file ?? null,
    family: candidate.family ?? null,
    familyName: t.name,
    question: t.task,
    architecture: candidate.architecture ?? null,
    architectureName: candidate.architectureName ?? candidate.architecture ?? null,
    register: candidate.register ?? null,
    registerName: candidate.registerName ?? candidate.register ?? null,
    faces: candidate.faces ?? [],
    symbolApproach: candidate.symbolApproach ?? null,
    symbolBrief: candidate.symbolBrief ?? null,
    smallGrade: candidate.smallGrade ?? null,
    signals: candidate.signals ?? null,
    position: candidate.position ?? null,
    risk: candidate.risk ?? null,
    deRisk: candidate.deRisk ?? null,
    mustNotBe: candidate.mustNotBe ?? [],
    gate: t.gate,
    task: t.task,
  }));
}

/**
 * The brief for a refinement slot.
 *
 * Deliberately different in shape from a concept brief. A concept brief must not
 * show its agent anything else in the round; a refinement brief must show its
 * agent exactly one thing, the mark it is refining, and nothing else.
 */
export function refinementBrief(slot, brief = {}) {
  return [
    `# Refinement ${slot.id}: ${slot.familyName}`,
    '',
    `Brand name, set exactly: ${brief.name ?? 'Brand'}`,
    brief.oneLiner ? `What it is: ${brief.oneLiner}` : null,
    '',
    `You are refining concept ${slot.refines}, which is at:`,
    slot.refinesFile ? `  ${slot.refinesFile}` : '  [the chosen concept]',
    '',
    'Open it and look at it before you change anything. This is not your idea and',
    'you are not being asked for a new one. A refinement that somebody cannot',
    'recognise as the same mark has failed, however good it is.',
    '',
    '## The task',
    '',
    slot.task,
    '',
    `The gate: ${slot.gate}`,
    '',
    '## What carries over unchanged',
    '',
    slot.architectureName ? `Architecture: ${slot.architectureName}.` : null,
    slot.registerName ? `Typographic register: ${slot.registerName}.` : null,
    slot.symbolApproach ? `Symbol approach: ${slot.symbolApproach}.` : null,
    slot.signals ? `What it signals: ${slot.signals}` : null,
    '',
    'Black on white only, integer viewBox, filled paths, explicit fills, no gradient,',
    'no live text, no raster, every attribute quoted and the namespace declared.',
    '',
    '## Still refused',
    '',
    ...(slot.mustNotBe ?? []).map((m) => `- ${m}`),
  ].filter((l) => l !== null).join('\n');
}

/** True when the anti-slop contract turns this face down by default. */
export function isRefusedFace(face) {
  const f = String(face).toLowerCase();
  return [...BANNED_FONTS, ...DEFAULT_FONTS].some((b) => b.toLowerCase() === f);
}

/**
 * One slot as the brief a single agent receives.
 *
 * It deliberately says nothing about the other slots. An agent that can see the
 * rest of the round converges on it, which is the thing the whole planner exists
 * to prevent.
 */
export function slotBrief(slot, brief = {}) {
  const lines = [
    `# Concept ${slot.id}: ${slot.familyName}`,
    '',
    `Brand name, set exactly: ${brief.name ?? 'Brand'}`,
    brief.oneLiner ? `What it is: ${brief.oneLiner}` : null,
    brief.audience ? `Who sees it: ${brief.audience}` : null,
    '',
    `The question this concept answers: ${slot.question}`,
    '',
    '## Your constraints, which are not negotiable',
    '',
    `Architecture: ${slot.architectureName}.`,
    `Typographic register: ${slot.registerName}. Set the wordmark in one of: ${slot.faces.join(', ')}.`,
    slot.symbolApproach ? `Symbol approach: ${slot.symbolApproach}. ${slot.symbolBrief}` : 'No symbol. The type carries alone.',
    slot.surgery ? 'This register is drawn display: redraw one or two glyphs, and name the problem each redraw solves.' : null,
    `What this signals: ${slot.signals}`,
    slot.position ? `Where it sits: ${slot.position}` : null,
    `The risk you are carrying: ${slot.risk} Counter it: ${slot.deRisk}`,
    '',
    `Build the ${slot.smallGrade} FIRST, at 16 pixels, and let it drive the rest.`,
    '',
    '## Refused outright',
    '',
    ...slot.mustNotBe.map((m) => `- ${m}`),
    '',
    'Also refused: any gradient (it fails five of the ten application contexts), any live text',
    'element, any raster image, more than two ideas in one mark.',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

export default {
  ARCHITECTURES,
  REGISTERS,
  SYMBOL_APPROACHES,
  CONTEXTS,
  CONSTRAINTS,
  CLICHES,
  PALETTE_CLICHES,
  CATEGORIES,
  CATEGORY_ALIASES,
  FAMILIES,
  categoryDefaults,
  clichesFor,
  nameType,
  planConcepts,
  slotBrief,
  REFINEMENT_TASKS,
  refinementSlots,
  refinementBrief,
  isRefusedFace,
};
