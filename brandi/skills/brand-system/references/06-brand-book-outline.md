# 06 · The brand book

What `brandi book` generates, page by page, and which field in `brand.json` each page reads. Read
it at Publish, and whenever a page comes out thin, because a thin page is a field nobody set.

Two rules govern the whole document:

1. **The book is a view of `brand.json`.** It is generated, never hand-edited: the next
   regeneration silently undoes the correction. To change a page, set the field with `$A set`, or
   record the decision with `$A decision`, and run `$A book` again.
2. **The book is itself an instance of the brand.** It is set in the brand's faces, on the brand's
   ground, with the brand's mark, and its own writing has to pass the voice rules it states. If the
   book's styling or copy fails the rules it sets, the book is wrong, not the rules.

Field names in `brand.json` use Australian spelling (`identity.colour`). The paths below are the
ones the deck reads. Every one is in `schemas/brand.schema.json`; the ones `emptyBrand()` in
`scripts/brandfile.mjs` does not pre-create (the tagline, boilerplate, key messages, elevator
pitch, illustration, signature moves, motion principle, the logo's rationale, placement, monochrome
rule, co-branding rule and per-variant minimum sizes) are optional and their pages are omitted or
carry a bracketed prompt until they are set.

## Two forms

| Command | Writes | What it is |
|---|---|---|
| `$A book` | `brand/brand-book.html` | A 1920 × 1080 deck, one idea per page, in eight chapters. This is the deliverable |
| `$A book --pdf` | `brand/brand-book.pdf` as well | One PDF page per deck page, through headless Chrome, fonts embedded |
| `$A book --print` | `brand/brand-book-print.html` (and `.pdf` with `--pdf`) instead of the deck | The earlier flowing A4 document, for anyone who wants paper |

The deck is a desktop and print document. On a phone the pages reflow, but the PDF is the thing to
send. `$A book --json` lists every page with its number, chapter and, for a page that could not be
drawn, an `absent` reason: that list is the checklist for thin data.

## Page types

- **Cover, About this document, Contents.** Front matter. The cover carries the mark, the name,
  "Brand guidelines", the version and the effective date from `meta`.
- **Divider.** One per chapter: the chapter title and a one-line lede on the primary colour.
- **Statement.** One sentence, full page, on the primary colour. Used for the proposition.
- **Content.** A title, a rail of short facts down the side, and the body. A `tight` variant packs
  a grid, a matrix or a wall of tiles.
- **Closing.** The colophon: version, date, who to ask.

## Chapters and pages

The chapter titles and ledes are fixed in `scripts/branddeck.mjs`. Every page reads the fields
named beside it and is omitted, with a reason in `--json`, when they are empty.

### Brand framework

| Page | Reads |
|---|---|
| Purpose | `strategy.purpose` |
| Driver, mission, positioning | `strategy.problem`, `strategy.positioning`, `strategy.promise`, `strategy.competitors[]`, `voice.elevatorPitch` |
| Pillars | `strategy.messaging.pillars[]`, each with `claim`, `why` and `proof[]` |
| Personality | `strategy.personality.attributes[]` |
| Proposition | `strategy.messaging.primary`, as a statement page |
| Tone of voice | `voice.statement` as the headline, bracketed when absent; `voice.attributes[]` with `notThis`, `doThis` and that trait's own `examples[]` |
| Tone by situation | `voice.tone[]`, and `voice.vocabulary.hardThings[]` under "How we say hard things" |
| Key messaging | `strategy.messaging.primary`, `pillars[].proof`, `strategy.differentiators[]`, `strategy.distinctiveAssets[]`, `strategy.promise`, `voice.keyMessages[]` |
| Writing guidance | `voice.mechanics`, `voice.vocabulary.use[]` and `avoid[]`, `voice.examples[]` as `good` and `bad` pairs |

### Logo

| Page | Reads |
|---|---|
| Our logo | `identity.logo.files[]` (the master SVG is drawn from disk), `identity.logo.rationale`, `identity.logo.placement` |
| Variants on backgrounds | `identity.logo.variants[]`, `identity.logo.monochrome` |
| Clear space | `identity.logo.clearSpace`, measured on the real SVG |
| Minimum size | `identity.logo.minSizes[]` per variant, or `identity.logo.minSize.{printMm, screenPx}` |
| Logo misuse | `identity.logo.misuse[]`, drawn as tiles; a string or `{ what, why, source }` |
| Co-branding | `identity.logo.cobranding.rule` |
| Tagline lockup | `voice.tagline` and `voice.tagline.locked` |
| Favicon and app icon | `identity.logo.favicon`, rendered at 16, 32, 64 and 180 |

### Colour

| Page | Reads |
|---|---|
| Primary palette | `system.json` print swatches: hex, RGB, CMYK, Pantone, with a tints strip |
| Extended ramps | every ramp in `system.json`, both themes |
| Colour usage | `identity.colour.ratio` and the semantic roles |
| Colour pairings | the pairing matrix, computed with `wcagCheck()` from the resolved system |
| Dial up, dial down | `identity.colour`, the proportion at each end |

### Typography

| Page | Reads |
|---|---|
| One specimen per face | `identity.type.display`, `body`, `mono`, with `identity.type.licences[]` |
| Typography hierarchy | the type scale in `system.json`, set in the real faces |
| Type scale | `identity.type.basePx`, `ratio`, `baseMaxPx`, `ratioMax` as mobile, desktop and print columns |
| Examples of use | `voice.boilerplate`, `voice.examples[]`, `strategy.messaging.primary` |

### Brand assets

| Page | Reads |
|---|---|
| Imagery | `identity.imagery.direction`, `treatment`, `dos[]`, `donts[]`, `shotList[]` (or one shot per application) |
| Photography | `identity.imagery` and the photographs measured by `$A images` |
| Illustration | `identity.illustration.themes[]` |
| Icons | `identity.iconography.style`, `grid`, `strokePx`, `source` |
| Shape and corners | `identity.shape` and the radius stance from `system.json` |
| Supporting graphic device | `identity.signatureMoves[]`, `identity.signature` |

### System

| Page | Reads |
|---|---|
| Spacing and layout | `identity.spaceBase`, the space and breakpoint scales from `system.json` |
| Motion | `identity.motion`, `identity.motionPrinciple`, `identity.motionSignature` |
| Accessibility | the audit pairs, floors and APCA figures from `system.json` |
| Implementation | the token files under `brand/tokens/` and how to load them |

### Brand in use

An Applications page reads `applications[]` (name, surface, purpose, notes). After it, one page per
proof artboard and per `Mockup*.dc.html` in `brand/canvas`, rendered as it was drawn, with the
purpose and notes of the matching application. With nothing drawn, the Applications page says so.

A mockup page is only brand-in-use if the brand is on it. `identity.mockups[].surfaces[].artwork`
carries what gets composited, either inline markup or a path to an SVG, PNG, JPEG or WebP in the
project. `$A mockup build` refuses a surface without it rather than compositing nothing and
reporting success, so a bare photograph under a caption saying the mark is on it cannot happen.

### Rules and decisions

| Page | Reads |
|---|---|
| What not to do | `governance.antiPatterns[]` when recorded; otherwise the house rules, minus any typeface this brand itself uses. Plus `governance.nonGoals[]` |
| Decisions and open questions | `governance.decisions[]`, `governance.openQuestions[]`, `evidence[]`, `governance.trademark` |

## What makes a page thin

The deck never invents. A page with a dead lower half is a field with one entry where the page
was drawn for several, and the fix is the field, not the layout:

- **Pillars** needs three, each with proof. A pillar with no proof is a slogan; file it with
  `$A question` rather than padding it.
- **Tone of voice** needs `voice.statement` and three to five attributes, each with `notThis`,
  `doThis` and its own `examples[]`. "Warm" says nothing; "warm, not gushing" is a rule. The deck
  will not write the statement for you and will not lend one trait another's lines: an unattributed
  line goes in `voice.vocabulary.hardThings[]` or `voice.examples[]`, where it is not a claim about
  a trait.
- **Writing guidance** needs `voice.examples[]` in pairs: write like this, not like this.
- **Logo misuse** draws at least six tiles. Use the object form so the reason prints beside each.
- **Brand in use** needs the proof artboards. A brand with no `Signage.dc.html` and a shopfront has
  not been proven, and `$A validate` says so.
- **Decisions** needs the decisions. Six dated entries with rationale is the floor a client can
  read as a record rather than a list.

Every statement on every page carries the provenance discipline in `01-evidence-protocol.md`: a
supplied fact, an extracted measurement, a published claim, a dated decision, or a bracketed
placeholder. Never a plausible number.

## The only gates

There is no separate audit of the book. `$A status` refuses to advance a phase whose required
fields are empty, `$A system` refuses a palette that fails its own contrast audit, `$A validate`
refuses a canvas that will not render or contradicts the brief, and `$A book --json` names any page
it could not draw. If all four are clean, the book is as complete as the brand file is, and the
`absent` list is the work that remains.
