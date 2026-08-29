# 06 · Brand book outline

The canonical deliverable structure. Twenty-three sections, in the order a client reads them.

This is what a real agency hands over: one working document, versioned in git next to the code,
with a printable distillation derived from it and a machine-readable token layer derived from
the same source. The document is canonical. The PDF is a view of it.

**Every section below carries four things:**
- **Must contain.** The content that has to be there.
- **Minimum bar.** The falsifiable threshold. Below it, the section is decoration and should be
  cut rather than shipped thin. Where the bar can be machine-checked, it is written so a script
  can check it.
- **Good / bad.** A one-line example of each, because rules without examples get ignored and
  examples without rules cannot be applied to anything new.
- **`brand.json`.** The machine-readable field that backs it.

**Two rules that govern the whole document:**

1. **The brand book is itself an instance of the brand.** If the book's own styling, spacing,
   typography and writing do not pass the rules it sets, the book is wrong. Not the rules.
2. **Every section carries a confidence label and inherits the provenance discipline in
   `01-evidence-protocol.md`.** A section with nothing behind it says so.

Field names in `brand.json` use `color`, not `colour`, because they map onto CSS custom
property names. Prose everywhere uses Australian spelling.

---

# Front matter

## §0 · Cover and colophon

**Must contain:** brand name, document version, date, aggregate confidence label, who compiled
it, who approved it, where the source file lives, and what the reader should do if something in
here is wrong.

**Minimum bar:** the cover is set in the brand's own type, on the brand's own ground, with the
brand's own mark. A brand book whose cover looks like a template has failed on page one.
Aggregate confidence is on the cover, not buried at the back.

**Good:** `The Wash House · Brand book v1.0 · 29 August 2026 · Confidence: Medium`
**Bad:** `BRAND GUIDELINES` set in Inter on white.

**`brand.json`:** `name`, `_meta.version`, `_meta.date`, `_confidence.overall`

---

## §1 · The idea

**Must contain:** one sentence. The brand's single load-bearing decision, the thing that
everything else in the document is downstream of.

**Minimum bar:** it must pass the strip-everything-else test. Remove the logo, the palette, the
type and the copy, keep only this sentence, and the brand is still recognisably itself. If the
sentence survives being swapped onto a competitor, it is not the idea.

**Good:** `One dog in the salon at a time.`
**Bad:** `The Wash House delivers premium grooming experiences with passion and care.`

**`brand.json`:** `idea`

---

## §2 · How to use this document

**Must contain:** who this is for, which sections are binding versus advisory, how to request a
change, who approves what, and where the derived artefacts live (tokens, printable version,
asset directory).

**Minimum bar:** names a person, not a role that does not exist. States the change process in
three steps or fewer.

**Good:** `Colour, type and logo rules are binding. Applications are worked examples, adapt them. Changes: message Nadia, she decides. Logged in §22.`
**Bad:** `These guidelines should be followed at all times.`

**`brand.json`:** `governance.owner`, `governance.changeProcess`

---

# Strategy

## §3 · Positioning and audience

**Must contain:** the positioning statement in both strategic and human variants, the
competitive frame with all three layers (direct, indirect, status quo), the points of parity
and points of difference table with proof and provenance, the primary audience, and who the
brand is explicitly not for.

**Minimum bar:** the audience is narrow enough to exclude someone. The positioning statement
fails the competitor-swap test (put the two most dangerous competitors' names in it, and it
must stop being true). The "not for" list has at least two entries. Every POD carries proof
with a provenance tag.

**Good:** `Not for: owners who want a $70 walk-in groom, and dogs who are happy anywhere.`
**Bad:** `Our audience is dog owners in Melbourne who value quality.`

**`brand.json`:** `positioning.statement`, `positioning.human`, `positioning.frame`,
`positioning.pop[]`, `positioning.pod[]`, `audience.primary`, `audience.notFor[]`

---

## §4 · Brand truths

**Must contain:** three lists.
- **What is true.** Facts about the business, the founders, the product or the customers that
  are real and ownable. Every line sourced.
- **What is aspirational, and that is fine.** Things the brand intends to be and is credibly
  working toward. Labelled as intentions.
- **What is not true, and stop saying it.** Claims currently being made that did not survive
  scrutiny.

**Minimum bar:** the third list is not empty. If nothing came off the site, the audit was not
performed. Every "true" entry has a tier tag.

**Good:** `Stop saying: "premium pet styling". Nobody searches it, and it contradicts the one-dog positioning.`
**Bad:** a truths section with a "what is true" list and nothing else.

**`brand.json`:** `truths.true[]`, `truths.aspirational[]`, `truths.retired[]`

---

## §5 · Messaging hierarchy

**Must contain:** the one-line promise, three pillars, at least two proof points per pillar
with provenance, the proof bank, the channel adaptation table, and the "things we do not say"
list.

**Minimum bar:** **every pillar has admissible proof or it is not a pillar.** A pillar with
none is demoted to the open-questions register with a recommendation for the cheapest way to
get evidence, and it does not appear in customer-facing copy. The "do not say" list has at
least five entries drawn from the category scan.

**Good:** `Pillar 2: No cage drying, ever. Proof: no cage dryer on the premises (photographed, 2026-08-29); two of four competitors have cage-drying complaints in their reviews.`
**Bad:** `Pillar 2: We genuinely care about your dog's wellbeing.`

**`brand.json`:** `messaging.promise`, `messaging.pillars[]`, `messaging.proofBank[]`,
`messaging.channels[]`, `messaging.neverSay[]`

---

## §6 · Personality

**Must contain:** the personality in behavioural terms, the archetype if one was used, and the
failure mode being guarded against.

**Minimum bar:** the archetype appears with its rationale and is then set aside. It is
scaffolding recorded in the decision log, not a claim about the brand's nature, and it never
appears in customer-facing copy. If no failure mode is named, an archetype was not chosen, a
mood was.

**Good:** `Caregiver, guarding against the patronising failure mode. Practically: specific reassurance ("you get a photo when the dryer goes off") over general warmth ("we'll take great care of them").`
**Bad:** `Our brand archetype is The Caregiver. We are nurturing, generous and compassionate.`

**`brand.json`:** `personality.archetype`, `personality.secondary`, `personality.failureMode`,
`personality.traits[]`

---

# Identity

## §7 · Logo system

The section that gets used most and specified worst. A logo system is not a mark, it is a set
of files with rules about which one goes where.

**Must contain:**

**a. Variants.** Every one of these exists as a real file, or is explicitly declared out of
scope with a reason:
- Primary lockup (usually horizontal)
- Secondary lockup (usually stacked, for square and narrow spaces)
- Symbol alone
- Wordmark alone
- Lockup with tagline or descriptor, if one exists
- Favicon and app icon (these are a redraw, not a scale-down)
- Social avatar (circular safe area, so the mark must survive a circular crop)

**b. Clear space, expressed as a ratio of a logo element.** Never an absolute value, because
an absolute value breaks the moment the logo is scaled.

```
Clear space = 1 × the x-height of the wordmark, on all four sides.
Measured from the outermost ink of the lockup, not from the file's bounding box.
At any size, in any medium.
```

Pick the measuring element from the mark itself: an x-height, the width of a stem, the
diameter of a counter, the height of the symbol. Then draw it. A clear-space rule without a
diagram is a rule nobody applies.

**c. Minimum sizes, in both mm and px.** These are two different measurements for two
different failure modes and one does not derive from the other.

| Variant | Minimum print (mm, width) | Minimum screen (px, width) | Determined by |
|---|---|---|---|
| Primary lockup | 32mm | 140px | The descender in the wordmark fills in below this |
| Stacked lockup | 24mm | 96px | The tagline becomes unreadable below this |
| Symbol alone | 8mm | 24px | The interior gap closes below this |
| Favicon | n/a | 16px | Redrawn, not scaled |

**Method, and put it in the book:** minimum size is set by the first element to fail, not by a
round number. Print the lockup at descending sizes on the actual stock, view at 40cm in office
light, and find where a feature closes up or a counter fills in. On screen, render at 1x on a
standard-density display, not on the retina laptop it was designed on. Record which element
failed, because that is what the number means.

**d. Monochrome and reversed.** Four required renditions:
- 100% black, on light
- 100% white knockout, on dark
- Single-colour brand, on light (for one-colour print, embroidery, etching)
- On photography, with the scrim rule stated (for example: only over an area of continuous
  tone at 40% or darker, with a 30% dark scrim applied, never over faces or over the subject)

**e. Placement rules.** Which variant goes where, and the default position on each surface.

**Minimum bar:** every declared variant exists as a real file at a real path. Clear space is a
ratio of a named element in the mark, with a diagram. Minimum sizes are given in both mm and
px, and the book says which element determined each one. Reversed and single-colour versions
exist as separate files, not as CSS filters.

**Good:** `Clear space = 1 × the x-height of the "W". Minimum symbol width 8mm / 24px, set by the gap between the roof line and the wall closing at smaller sizes.`
**Bad:** `Always leave adequate clear space around the logo. Do not use the logo smaller than is legible.`

**`brand.json`:** `logo.primary`, `logo.secondary`, `logo.symbol`, `logo.wordmark`,
`logo.variants[]`, `logo.clearSpace`, `logo.minSize.print`, `logo.minSize.screen`,
`logo.minSize.basis`, `logo.reversed`, `logo.monochrome`, `logo.placement`

---

## §8 · Logo misuse

**Must contain:** at least eight specific misuses, each rendered as an image with a cross badge
and a one-line reason. Not a list of prose prohibitions.

**Minimum bar:** **at least eight rows, and at least three of them tagged as real.** A real
misuse is one this team has actually shipped, or one a supplier has actually produced. Generic
misuses ("do not stretch the logo") are table stakes that any template generator can produce
and that nobody has ever done on purpose. Real misuses come with receipts and are the ones
that get prevented.

Twelve to draw from, adapt to the actual mark:

| # | Misuse | Reason |
|---|---|---|
| 1 | Recoloured off-palette | The colour is the asset. A green that is not the green is a different brand. |
| 2 | Stretched or squashed | Non-uniform scaling. Almost always a placeholder box in a template. |
| 3 | Rotated | Including "just a few degrees, to look casual". |
| 4 | Outlined or stroked | Adds a weight the mark was not drawn with. |
| 5 | Drop shadow, glow, bevel or gradient applied | Effects added to force contrast that should come from the correct variant. |
| 6 | Placed on a busy photograph with no scrim | The most common real failure, because photos change and the mark does not. |
| 7 | Insufficient clear space | Crowded against a page edge, a heading, or another logo. |
| 8 | Below minimum size | Usually in a footer or a partner strip. |
| 9 | Symbol and wordmark rearranged into a custom lockup | Someone rebuilt the lockup in Canva because the file was not to hand. |
| 10 | Wordmark retyped in a different face | The wordmark is artwork, not text. Retyping it is a redraw. |
| 11 | Reversed version used on light, or vice versa | Ships as a grey mark on grey. |
| 12 | Mark used as a repeating pattern or a watermark tile | Only permitted where the book explicitly permits it. |

**Good:** `✕ Retyped in Poppins for the invoice template, March 2026. The wordmark is drawn artwork. Use the SVG.`
**Bad:** `Do not alter the logo in any way.`

**`brand.json`:** `logo.misuse[]` with `{ "what", "why", "source": "real" | "standard", "image" }`

---

## §9 · Colour system

**Must contain:** core colours, neutral ramp, semantic tokens, a usage proportion, light and
dark parity, and per-colour documentation.

Per colour: role, name, hex, OKLCH, RGB, CMYK and Pantone where print is in scope, the usage
note, allowed and disallowed pairings, and the provenance tag.

**Roles, not hues.** Seven semantic roles map one to one onto token names: background, surface,
border, muted, foreground, accent, and an accent-text variant at body contrast. One accent.
A second accent only ever as a semantic state, never as a second brand colour.

**Usage proportion.** State the intended distribution, for example 62% ground, 30% neutral, 8%
accent. This single line is what separates a colour system from a palette dump, because it
tells a designer how much of each to use and it makes over-use of the accent falsifiable.

**Light and dark parity.** Only the semantic layer swaps. Primitives do not change between
themes, and the accent is identical in both.

**Minimum bar:** every hex is `EXTRACTED` from a real artefact or `DECIDED` with a written
rationale. Never recalled from memory: an unguided model regresses to the same indigo accent
and purple gradient for every brand, which is off-brand for all of them. Five to eight core
colours maximum. Every text-on-ground pair in the system has a stated contrast ratio. Neutrals
are specified deliberately, since they cover most of the surface area.

**Good:** `accent · Signal Green · #2E5A50 · oklch(43.3% 0.052 177) · one element per view, as a fill. Pairs with paper and ink. Never on mist. [EXTRACTED: sign photograph, sampled from the flat panel | 2026-08-29]`
**Bad:** `Primary: #2E5A50. Secondary: #4A7C6F. Accent: #C25A2E.` with no roles, no ratios and no sources.

**`brand.json`:** `colors[]` with `{ role, name, hex, oklch, rgb, cmyk, pantone, usage, pairsWith, neverWith }`, `colorProportion`, `themes.light`, `themes.dark`

---

## §10 · Typography

**Must contain:** the faces (display, body, mono if used) with foundry and licence status, the
weight ladder actually in use, the type scale as a token table, measure, leading, tracking,
number handling, and the open-source substitute for every commercial face.

Scale table columns: token, size, line height, weight, tracking, use case, rendered sample.

**Minimum bar:** licensing is confirmed and recorded, including whether the web licence covers
expected traffic. Naming a face the client cannot legally deploy is a real cost. Tabular
figures are specified wherever numbers align (prices, tables, invoices). The scale has at most
ten steps and every step has a named use case, otherwise steps get invented at build time.
Measure is specified in characters, not pixels.

**Good:** `text-body · 16px / 1.55 / 400 / 0 / body copy and form labels. Body measure 62 to 72 characters. Prices set in tabular figures (font-variant-numeric: tabular-nums).`
**Bad:** `Headings: Poppins Bold. Body: Poppins Regular.`

**`brand.json`:** `typography.display`, `typography.body`, `typography.mono`,
`typography.scale`, `typography.tracking`, `typography.leading`, `typography.measure`,
`typography.licensing`, `typography.fallbacks[]`

---

## §11 · Iconography

**Must contain:** the source or the drawing rules (grid size, stroke weight, terminal style,
corner radius), colour rules, size tokens, and what icons are never used for.

**Minimum bar:** either a named icon set with a version and a licence, or a stated construction
grid. Mixing two icon sets is specifically banned, since it is the most common and most visible
system failure. State whether the accent colour is ever used in icons (usually: no).

**Good:** `Tabler Icons, 24px grid, 1.5px stroke, 2px corner radius, rendered in foreground or muted only. Never in accent. Never as decorative bullets.`
**Bad:** `Use simple, clean line icons that match our brand style.`

**`brand.json`:** `iconography.source`, `iconography.style`, `iconography.stroke`,
`iconography.grid`, `iconography.radius`, `iconography.colorRule`

---

## §12 · Spacing, layout and shape

**Must contain:** the base spacing unit and the scale derived from it, container widths, the
grid, the radius set, and the concentric radius rule (an inner radius equals the outer radius
minus the padding between them, or nested corners look wrong).

**Minimum bar:** one base unit, one scale, no ad-hoc values. Radius values are a named set of
three or four, not a continuum. States whether the brand is sharp, soft or mixed, and holds to
it.

**Good:** `Base 8px. Scale 4, 8, 12, 16, 24, 32, 48, 64, 96. Radius sm 4 / md 8 / lg 16. Nested: inner = outer minus padding.`
**Bad:** `Use consistent spacing throughout.`

**`brand.json`:** `layout.spacingBase`, `layout.scale[]`, `layout.container`, `layout.gutter`,
`layout.radius`, `layout.posture[]`

---

## §13 · Imagery and illustration

**Must contain:** the photographic direction stated as shootable rules (subject, framing,
light, colour treatment, what is in frame, what is never in frame), the illustration style if
one exists, the anti-patterns, and either real examples or a written shot brief with the gap
declared.

**Minimum bar:** the direction is specific enough to brief a photographer who has never met the
client. "Warm and authentic" briefs nothing. Anti-patterns are named specifically. If no real
photography is held, the section says so, carries an asset-gap ID, and ships the shot brief
rather than stock standing in for the real thing.

**Good:** `Natural light only, shot from the dog's height or below, one dog in frame, the salon visible behind. Never: multiple dogs, bows or costumes, top-down "cute" angles, stock photography of any kind.`
**Bad:** `Imagery should be warm, authentic and capture the joy of pet ownership.`

**`brand.json`:** `imagery.style`, `imagery.subjects[]`, `imagery.treatment`,
`imagery.neverShow[]`, `imagery.samples[]`, `imagery.shotBrief`

---

## §14 · Motion

**Must contain:** the motion principle in one sentence, duration and easing tokens, the one
signature animation if there is one, and the reduced-motion behaviour.

**Minimum bar:** `prefers-reduced-motion` behaviour is specified, not assumed. Durations are
tokens, not per-component decisions. If the brand has no motion, say so in one line rather
than inventing a system nobody will build.

**Good:** `Motion confirms, it never entertains. Durations: 120ms micro, 200ms standard, 320ms entrance. Easing: cubic-bezier(.2,0,0,1). Reduced motion: all transitions become instant state changes, no fades.`
**Bad:** `Animations should feel smooth and delightful.`

**`brand.json`:** `motion.principle`, `motion.duration`, `motion.easing`, `motion.signature`,
`motion.reducedMotion`

---

# Expression

## §15 · Voice and tone

**Must contain:** the full framework from `07-voice-framework.md`. Voice attributes with
evidence, the tone matrix by context and reader emotional state, the three vocabulary tables,
the mechanics decisions, the three-levels device, and the paired examples.

**Minimum bar:** three to five attributes, each with a `not` half, a do/don't sentence pair and
an evidence line. The tone matrix covers at minimum onboarding, error, support, billing, legal
and marketing. Fifteen paired examples minimum. **The section is written in the brand's voice,
not about it.**

**Good:** `Plain, not blunt. Do: "He found the dryer hard today, so I stopped early." Don't: "Dog anxious. Groom incomplete."`
**Bad:** `Our tone of voice is friendly, professional and approachable.`

**`brand.json`:** `voice.attributes[]`, `voice.toneMatrix[]`, `voice.vocabulary.use[]`,
`voice.vocabulary.avoid[]`, `voice.hardThings[]`, `voice.mechanics`, `voice.examples[]`

---

## §16 · Signature moves

**Must contain:** five to seven things that identify the brand with the logo removed. Not
values, not adjectives. Specific, repeatable moves.

Include, where they exist:
- **The signature primitive.** One semantic element that recurs across every surface, with at
  least eight named use sites and a statement of where it never appears.
- **One invented proper noun.** A visual or verbal element the brand calls by a name nobody
  else uses. A brand with no proper noun has no landmarks: every element is a generic
  nav/card/button/footer. Naming things is infrastructure, because it is what the team says in
  messages to each other.
- **One best practice deliberately broken**, with the reason. A brand book with zero broken
  rules is almost certainly a template.

**Minimum bar:** five moves minimum. The signature primitive lists eight or more use sites and
one non-site. At least one deliberately broken convention with a written rationale.

**Good:** `The half-round. Every corner that touches an edge is squared; every corner that floats is 16px. Appears on: cards, image crops, the appointment chip, buttons, the price panel, the sign, the van decal, the loyalty card. Never on: the logo, form inputs.`
**Bad:** `We use rounded corners and a consistent colour palette.`

**`brand.json`:** `signatureMoves[]`, `signaturePrimitive.name`,
`signaturePrimitive.useSites[]`, `signaturePrimitive.neverAppears[]`, `brokenConventions[]`

---

## §17 · Applications

**Must contain:** the surfaces this brand actually uses, built out properly, chosen from the
Tier 0 channel answer rather than from a standard list.

Typical set for a local service business: sign or shopfront, vehicle, business card,
appointment card, invoice, email signature, SMS templates, Google Business Profile, Instagram
grid and story, A-frame or window decal, uniform or apron, price list.

Typical set for a digital product: app icon, marketing site hero, product UI shell, email
templates, social cards, slide template, documentation page, OG image.

**Minimum bar:** applications are built with real content, not with placeholder greeking.
A billboard mock shows a complete advertisement, not a logo floating on a colour field.
A social card carries a real post. An invoice shows real line items. **The applications page is
where a brand book proves it survives contact with reality, and lorem ipsum is the sound of it
not doing so.** Three to five applications built properly beat fifteen built as thumbnails.

**Good:** a van decal mock showing the wordmark, "One dog at a time", the phone number at
readable size from 20 metres, and nothing else.
**Bad:** a van rendered with the logo centred on the panel and no other content.

**`brand.json`:** `applications[]`

---

# Governance

## §18 · Accessibility

**Must contain:** the contrast matrix for every text-on-ground pairing in the system, focus
ring specification, target sizes, reduced-motion behaviour, and the colour-independence rule
(no information conveyed by colour alone).

**Minimum bar:** WCAG 2.2 AA as the floor. Body text 4.5:1. Large text (24px, or 18.7px bold)
3:1. UI controls, focus indicators and non-text elements 3:1. Target size 24×24 CSS px minimum.
The matrix is a real table of computed ratios, not a claim that the palette is accessible.

**Expected exception, stated so it does not read as a failure:** a light or mid accent
frequently falls below 4.5:1 against the ground. That is fine, because the accent's job is
fills (where the contrast that matters is the text sitting on the fill) and the signature
primitive (a shape, not text). Prose is never set in accent on ground. Where the accent is
also used at body size, ship a darkened `accent-text` variant that clears 4.5:1 and say what
it was derived from. Write the carve-out down, or someone will "fix" the palette by lightening
the ink.

Use WCAG 2.2. APCA was removed from the WCAG 3 draft in 2023 and WCAG 3 is years away; APCA is
useful as a spot check and is not the standard to certify against.

**Good:** `ink #241F1C on paper #FBF7F2 = 15.29:1 · muted #6E6862 on paper = 5.15:1 · accent #2E5A50 on paper = 7.31:1` (computed, not estimated). Note that contrast is symmetric: a pair has one ratio. A matrix that lists a different number for "text on fill" than for "fill on text" was guessed rather than computed, and every other number in it is suspect.
**Bad:** `All colour combinations meet WCAG AA standards.`

**`brand.json`:** `accessibility.standard`, `accessibility.contrastMatrix[]`,
`accessibility.focusRing`, `accessibility.targetSize`, `accessibility.exceptions[]`

---

## §19 · Anti-patterns

**Must contain:** a list of specific, falsifiable bans. The immune system of the document.

**Minimum bar:** at least eight, each specific enough that someone could point at a shipped
artefact and say "this violates that rule". A ban you cannot fail a review against is a value,
not a rule.

Populate from: the category cliché scan, the rejection list generated with the positioning,
the general anti-slop set, and any mistake this team has actually made.

**Good:**
```
✕ No gradient of any kind, anywhere.
✕ No stock photography. Real dogs, real salon, or a bracketed placeholder.
✕ No more than one dog in any photograph.
✕ No exclamation marks in body copy.
✕ No three-column icon-and-heading feature grid.
✕ No emoji as bullet markers.
✕ No accent colour on more than one element per view.
✕ No "fur baby", "pamper", "spa day", "pooch".
```
**Bad:** `Avoid using the brand in ways that don't reflect our values.`

**`brand.json`:** `antiPatterns[]`

---

## §20 · Implementation and tokens

**Must contain:** the complete token layer in the formats the build actually consumes, and the
three-tier structure.

Three tiers (Nathan Curtis's taxonomy):
1. **Primitive.** Raw values, no semantics. `color.green.700 = #2E5A50`. Consumed by nobody
   directly.
2. **Semantic.** Purpose-driven and themeable. `color.bg.default`. Consumed by components.
3. **Component.** Component-scoped overrides. Optional. Promote to semantic only when three or
   more components need it.

**Only tier 2 changes between themes.** Tier 1 is fixed, tier 3 inherits. That invariant is
what makes theming work.

**Minimum bar:** tokens are emitted, not described. At least a CSS custom-property file and a
DTCG JSON file (a Community Group Report format, not a W3C standard), both generated from `brand.json` rather than hand-maintained. Every colour
carries OKLCH alongside hex, so tints and theme variants can be derived programmatically.
No component-to-primitive shortcuts: everything routes through the semantic layer, or theming
is dead on arrival.

**Token anti-patterns to state in the section:**
- Skipping the semantic tier (`button.primary.bg = #2E5A50`).
- Primitives with semantic names (`--color-brand`, which means nothing once there are three
  brand colours). Name primitives by what they are, semantics by what they do.
- Mode baked into the token name (`--color-bg-light`), which forces every component to know
  which theme it is in.

**Good:** `--color-accent: var(--green-700)` in `:root`, overridden per theme, with the accent identical in both.
**Bad:** a table of hex values in the document and no generated file anywhere.

**`brand.json`:** the whole file is the source. Derived: `tokens.css`, `tokens.json`.

---

## §21 · Evidence, confidence and open questions

**Must contain:** the aggregate confidence score with the per-section breakdown, the full
open-questions register, the asset manifest with its gaps, and the source list with dates.

**Minimum bar:** every open question has all six fields including a recommendation. Every
`Medium` and `Low` section says why and what would raise it. Sources carry a URL or a
description and a capture date. **This section is a feature, not an admission.** A v1 built in
a day on a business with no prior brand material should be `Medium`, and saying so is what
makes the rest of the document credible.

**Good:** `OQ-04 · Repeat-customer rate. Assumed high from review language. Recommendation: export twelve months of bookings, count clients with two or more visits. Ten minutes. Until then pillar 3 does not appear in customer copy.`
**Bad:** an open-questions section that lists three questions and no recommendations.

**`brand.json`:** `_confidence`, `_provenance`, `openQuestions[]`, `assets[]`, `assetGaps[]`,
`sources[]`

---

## §22 · Decision log and non-goals

The section that makes the document durable. Without it, nobody can tell which rules are
load-bearing and which were arbitrary, so a year later everything gets treated as arbitrary.

**Must contain:**

**a. The decision log.** A dated table. One decision per row. Four columns.

| Date | ID | Decision | Rationale, and what it ruled out |
|---|---|---|---|
| 2026-08-29 | DL-001 | Positioned on "one dog at a time" | The only uncontested territory in the local scan. Rules out volume pricing and walk-ins. |
| 2026-08-29 | DL-002 | Rejected "Brunswick's friendliest groomers" | Friendliness is a point of parity; all four competitors claim it. |
| 2026-08-29 | DL-003 | Ink set to `#241F1C`, not the measured `#000000` | Pure black on a warm ground reads harsh. Warm-black holds the paper character. |
| 2026-08-29 | DL-004 | Caregiver archetype, guarding against patronising | Generated the voice attributes. Label not for publication. |
| 2026-08-29 | DL-005 | Dog silhouette icon dropped | 11 of 20 local competitors use one. High category fame, near-zero uniqueness. |
| 2026-08-29 | DL-007 | Clear space set to 1 × wordmark x-height | Scales with the mark. Absolute values break under scaling. |

Machine-checkable shape: ISO date in column one, so an audit script can count dated entries and
fail a log that has none.

**b. Non-goals.** What this document explicitly is not.

```
- Not a component library. This governs how things look, not their API.
- Not a marketing plan. It governs how to write, not what to write about.
- Not a legal document. Trade mark and licensing questions go to counsel.
- Not a PDF for external partners. BRAND.pdf is the derived distillation.
- Not versioned as a product. Update in place, one source of truth.
```

**Minimum bar:** at least six dated decisions, and every one that closed off an alternative
says which alternative. At least four non-goals. Any section that was skipped is listed here
with the reason, so a future reader knows it was a decision rather than an oversight.

**Good:** `DL-005 · Dog silhouette icon dropped · 11 of 20 local competitors use one. High category fame, near-zero uniqueness. Revisit only if the scan changes.`
**Bad:** `2026-08-29 · Finalised the brand.`

**`brand.json`:** `decisions[]` with `{ date, id, decision, rationale, ruledOut }`,
`nonGoals[]`, `skippedSections[]`

---

# Field map

Every section to its backing field, for the derivation pipeline.

| § | Section | Primary `brand.json` field |
|---|---|---|
| 0 | Cover and colophon | `name`, `_meta`, `_confidence.overall` |
| 1 | The idea | `idea` |
| 2 | How to use | `governance` |
| 3 | Positioning and audience | `positioning`, `audience` |
| 4 | Brand truths | `truths` |
| 5 | Messaging hierarchy | `messaging` |
| 6 | Personality | `personality` |
| 7 | Logo system | `logo` |
| 8 | Logo misuse | `logo.misuse[]` |
| 9 | Colour system | `colors[]`, `colorProportion`, `themes` |
| 10 | Typography | `typography` |
| 11 | Iconography | `iconography` |
| 12 | Spacing, layout, shape | `layout` |
| 13 | Imagery | `imagery` |
| 14 | Motion | `motion` |
| 15 | Voice and tone | `voice` |
| 16 | Signature moves | `signatureMoves`, `signaturePrimitive`, `brokenConventions` |
| 17 | Applications | `applications[]` |
| 18 | Accessibility | `accessibility` |
| 19 | Anti-patterns | `antiPatterns[]` |
| 20 | Implementation and tokens | the whole file, derived to `tokens.css` / `tokens.json` |
| 21 | Evidence and open questions | `_provenance`, `_confidence`, `openQuestions[]`, `assets[]`, `sources[]` |
| 22 | Decision log and non-goals | `decisions[]`, `nonGoals[]` |

---

# Audit gates

The thresholds a structural check should enforce before the book ships. Each maps to a minimum
bar above.

| Gate | Rule |
|---|---|
| Sections present | All 23 headings present as `## §N ·` |
| §1 | Exactly one sentence |
| §3 | `audience.notFor[]` has 2 or more entries; every `pod[]` entry has proof |
| §4 | `truths.retired[]` is non-empty |
| §5 | Every pillar has 2 or more proof points, or is absent and registered as an open question |
| §7 | Every declared variant resolves to a file that exists; `clearSpace` references a named element; `minSize` has both print and screen values |
| §8 | 8 or more misuse rows; 3 or more tagged `source: real` |
| §9 | Every colour has `hex`, `oklch`, `role`, `usage` and a provenance entry; 5 to 8 core colours |
| §15 | 3 to 5 attributes, each with `not`, do/don't and evidence; 15 or more paired examples |
| §16 | 5 or more moves; primitive lists 8 or more use sites |
| §18 | Contrast matrix present with computed ratios; body pairs clear 4.5:1 |
| §19 | 8 or more falsifiable bans |
| §21 | Every open question has 6 fields including a recommendation |
| §22 | 6 or more ISO-dated decisions; 4 or more non-goals |
| Everywhere | No unresolved `{{TODO}}`. Bracketed `[PLACEHOLDERS]` are permitted and are counted and reported, since they are the honest form of a gap. |
