# 11 · Logo craft

> `$A` is the Brandi command line, resolved once at the start of the session: `brandi` when the
> plugin is installed, or `node <this skill's base directory>/../../scripts/brandi.mjs` from a clone.
> It is never a bare relative path: the working directory is the user's project, not the plugin.

Load this when you are drawing concepts. `08-logo-system.md` is the other half: it covers the system
around a mark that already exists (variants, clear space, minimum sizes, renditions, misuse, the
favicon pack, the eleven evaluation tests). This file is about producing the geometry in the first
place, and it stops at the point where a person has picked one. Nothing here repeats 08, and where
the two touch, 08 wins on system questions and this file wins on construction.

---

## 1. The five decisions, in dependency order

Architecture, then register, then symbol approach, then construction, then restraint.

```
name + category + audience + hard constraints
  -> ARCHITECTURE      what the logo IS, structurally
  -> REGISTER          what the letterforms are made of
  -> SYMBOL APPROACH   what the symbol is doing, if there is one
  -> CONSTRUCTION      the grid, the weights, the actual paths
  -> RESTRAINT         what comes back out
```

This is a dependency chain, not a checklist, and the difference is not pedantry. Each decision
narrows the next one's option set, so answering them out of order means answering the same question
twice and getting two different answers.

- Architecture decides whether a symbol exists at all. Asking "what should the symbol be" before
  that is asking a question that may have no answer.
- Register decides the stroke weight and the contrast the symbol has to match. Drawing a symbol
  first and then choosing a face means either the symbol is redrawn or the lockup has two optical
  weights in it, which is the defect at `ARCH:56` and the one people see without being able to name.
- Symbol approach is constrained by the name type. A literal symbol needs something to depict, so an
  invented name cannot carry one. `nameType()` in `scripts/logospec.mjs` classifies the name into
  `descriptive`, `concrete`, `founder`, `long` or `abstract`, and the planner only deals approaches
  whose `fitsNames` includes that classification. A literal peak on Stripe reads as a brand mistake
  (`SYM:266`).
- Construction is where every earlier decision becomes a number. If you arrive here with adjectives
  rather than a register and an approach, you will draw the nearest thing to hand.
- Restraint is last because you cannot remove what has not been built. One idea per mark, two at the
  very most. Three is committee work (`SKILL:167`, `SYM:63`).

### The two rules that govern the whole run

> **Build the small-grade asset first.** The harshest application drives the construction of the
> largest, not the other way round.

Stated at `ARCH:165` and restated at `APP:5`, and it is the single most load-bearing instruction in
the source corpus because it inverts the obvious order. Draw the favicon-grade element first, at
16 pixels, then grow the lockup out of it. Every concept that goes the other way arrives at the
small size with a mark that has to be simplified, and simplification after the fact is a redraw
wearing a different word.

> **All assets in one concept share one letterform language, one construction grid and one optical
> weight class.**

`ARCH:164`. Three assets that read as three brands is a system problem, not a logo problem, and it is
invisible while you look at them one at a time. Put the lockup, the square alternate and the small
grade side by side before you call any of them finished.

Both rules are printed into every slot brief by `slotBrief()`, so an agent drawing one concept sees
them whether or not it has read this file.

---

## 2. Drawing an SVG mark that is not amateur

This is the section that decides whether the output looks drawn or generated. Everything in it is
mechanical, and most of it is arithmetic you do before you write the first path.

### 2.1 The construction grid

**Symbols use `viewBox="0 0 100 100"`. Lockups use `0 0 300 100`.** Integer viewBox, origin at zero,
tight to the ink.

One hundred units is chosen so every number in this file is also a percentage. A 12.5-unit limb is
12.5 per cent of the mark, which is exactly the favicon floor, and you can hold that in your head
while drawing. A non-zero origin (`viewBox="10 10 60 60"`) makes every later coordinate calculation
in a refine loop wrong by an offset that nobody notices for three turns.

Tight means the ink touches the box. `$A logo audit` warns (`viewbox-slack`) when the artwork spans
less than 75 per cent of its own viewBox, because every icon slot downstream scales by the viewBox,
so a mark filling 70 per cent of its box arrives 30 per cent smaller than it needed to be at every
size, and the 16px test is then lost to packaging rather than to drawing.

Draw on a stated grid and state it in a comment at the top of the file:

```xml
<!--
  Atlas · letterform A, small-grade asset
  Grid: 100 units, everything on a 2-unit module
  Stem: 18 horizontal, 16.1 perpendicular (legs splayed 26.6 degrees)
  Counter: 16 wide at the crossbar, tapering to the apex
  Ink: y 6 to 94, apex overshoots the cap line by 2 units
-->
```

The comment is not decoration. It is what tells the next agent, or you in three turns, what may not
be changed. `GKjohns/SKILL.md:44` requires it for exactly this reason and every one of its shipped
reference marks carries one.

**Budget the vertical before you draw.** The most useful construction instruction in the whole
research corpus (`pranavred/SKILL.md:185`, worked at `logo-techniques.md:270-282`) is to write down
the vertical distribution first, because moving one element later means moving everything:

```
viewBox height        100
Top padding             7
Limb 1                 18   (y 7 to 25)
Gap                    16
Limb 2                 18   (y 41 to 59)
Gap                    16
Limb 3                 18   (y 75 to 93)
Bottom padding          7
```

**Keyline shapes**, so differently shaped marks occupy the same visual space inside the same box.
Scaled from `pranavred/references/icon-design.md:94-99` to a 100-unit box with an 88-unit live area:

| Shape | Size on a 100 box | Use for |
|---|---|---|
| Circle | 88 diameter | Round marks (disc, ring, dot) |
| Square | 79 × 79 | Square marks (frame, tile, panel) |
| Vertical rectangle | 70 × 88 | Tall marks (letterform, bottle, document) |
| Horizontal rectangle | 88 × 70 | Wide marks (bar, blade, horizon) |

A circle drawn at 79 next to a square drawn at 79 looks smaller. That is the whole point of the
table.

### 2.2 Optical correction, with numbers

Geometry and perception disagree, and the disagreement is consistent enough to be a set of
constants. Every number below is a correction you apply while drawing, not an effect you add later.

| Correction | The number | Why |
|---|---|---|
| Round against flat | A circle needs a diameter 1.5 to 2 per cent larger than the square's side to read as the same size | A curve touches the boundary at one point, a flat edge along its whole length, so the eye reads the circle as smaller |
| Point against flat | A triangle needs 4 to 8 per cent more height, and more again if the apex is sharp | A point carries almost no mass at the extreme, so it reads as short before it reads as pointed |
| Horizontal against vertical stroke | Draw horizontals at 88 to 94 per cent of the vertical stem width | Equal numbers look top-heavy. A true monoline is a drawing decision that has to be paid for elsewhere |
| Visual centre | Sits above the geometric centre. Shift the artwork up by 2 to 3 per cent of the box height | Applies to any mark placed in a square field: app icon, avatar, favicon |
| Directional shapes | Shift 4 to 8 units on a 100 box in the pointing direction | A play triangle centred mathematically looks pinned to the left |
| Junctions | Notch the join by 3 to 6 per cent of the stem width where two strokes meet at an acute angle | Ink pools at the junction and reads as a dark blot at small sizes and in thread |

Two constraints on the corrections themselves.

**The centre shift has a ceiling.** `$A logo audit` measures the ink centroid against the viewBox
centre and fails any mark more than 8 per cent off (`DERIVED.maxCentreOffset`), because a circular
avatar crop centres on the box and not on the artwork, so an off-centre mark is off-centre on every
social profile it ever appears on and nobody can fix it from outside the file. An optical shift of
2 to 3 per cent sits comfortably inside that. A shift of 10 per cent is not an optical correction,
it is a composition problem.

**Below about 32 pixels, stop correcting and start snapping.** A 6 per cent horizontal-stroke
correction on a 100-unit box is 1 unit, which at 16 pixels is 0.16 of a pixel, so it is not rendered,
it is antialiased into a grey smear that makes the mark look blurred while every other tab looks
sharp. The small-grade redraw is drawn on the pixel grid with whole-pixel widths and no sub-pixel
corrections at all. This is the same rule as `08-logo-system.md` §6.6: the favicon is a redraw, not a
scale-down.

### 2.3 Stroke versus fill

**Draw the mark as filled paths.** The delivered master has no `stroke` attribute anywhere.

Five reasons, each of which is a real failure:

1. **A stroke is a rendering instruction, not geometry.** Nothing downstream can measure it
   reliably. `strokeRatio()` in the audit only sees declared stroke widths, so a hairline drawn as a
   long thin filled rectangle walks straight past it, and a filled mark with no strokes returns
   `null`. Neither measurement is complete on its own (see §7 for what the rendered pass can and
   cannot see), so the fewer ways the mark can be described, the fewer ways it can be measured
   wrongly.
2. **`stroke-width` does not scale with a non-uniform transform the way you expect.** The stroke is
   generated in the element's own user space and the transform is applied to the result, so
   `transform="scale(2 1)"` on a stroked circle gives you an ellipse whose outline is twice as thick
   on the left and right as it is on the top and bottom. Filled geometry transforms honestly.
   `vector-effect="non-scaling-stroke"` is for maps and technical drawings, never for a logo.
   <https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/vector-effect>
3. **Strokes are centred on the path.** A `stroke-width="4"` extends 2 units each side, so any path
   that touches the viewBox edge gets clipped by half its stroke. The audit reports this as `clipped`
   and it is one of the most common reasons a mark looks subtly lopsided.
4. **Every physical process needs an outline.** Embroidery digitising, vinyl cutting, foil dies and
   screen separations all work from a closed contour. A stroked file has to be expanded first, and if
   you do not do it, the supplier does, on their machine, at their tolerance, without telling you.
5. **A knockout version of a stroked mark is a different shape.** Reversing a filled mark inverts the
   ink. Reversing a stroked one requires the stroke expanded first, so you end up doing the work
   anyway, at the worst possible moment.

**The two cases where a stroke is right:**

- **The working file during exploration.** A monoline mark whose whole language is one constant
  weight is far quicker to tune as strokes, because changing the weight is one number. Keep it, ship
  the outlined version, and never let the stroked file be the one recorded in
  `identity.logo.files`.
- **The 16-pixel redraw while you are pinning it to the pixel grid.** A stroke set to a whole number
  of pixels at the target size is easier to keep honest than two filled edges you have to keep in
  step. Convert on export.

The audit treats `currentColor` and CSS-class paint as an error on a master and a warning on a
candidate, for the same underlying reason: a mark whose colour is decided by its container has no
colour of its own, and a favicon loaded without a CSS context has nothing to inherit from.

### 2.4 Curve discipline

**Tens of nodes, not hundreds.** A drawn mark is typically 12 to 60 path segments. The audit warns
above 400 (`node-count`), and that threshold is set where it is because 400 is far past anything a
person draws and squarely inside what an auto-tracer produces. Hundreds of nodes means a raster was
traced, and traced paths carry antialiasing wobble baked into the outline, which is invisible at
100 pixels and obvious at signage scale.

**Put nodes at the extremes and nowhere else.** On any curve, place on-curve points at the top,
bottom, left and right extremities (0, 90, 180 and 270 degrees) and let the handles do the rest. A
node in the middle of a curve is a place where the curvature can break, and it will, the first time
somebody nudges it.

**Smooth continuity means the handles are collinear through the on-curve point.** Where two curves
meet and the join is meant to be invisible, the outgoing handle must lie on the straight line
through the incoming handle and the node. If it does not, there is a kink, and a kink shows up as a
highlight in foil and as a stitch direction change in embroidery long before anybody spots it on
screen.

**Use arcs for circular geometry and cubics for everything else.** The arc command is exact for
circles, and the flags are the only error-prone part:

```
A rx ry x-axis-rotation large-arc-flag sweep-flag x y

large-arc=0 sweep=0  ->  small arc, counter-clockwise
large-arc=0 sweep=1  ->  small arc, clockwise
large-arc=1 sweep=0  ->  large arc, counter-clockwise
large-arc=1 sweep=1  ->  large arc, clockwise
```

A full circle needs two arcs, because a single arc from a point to itself is degenerate:

```xml
<path d="M 50 8 A 42 42 0 1 1 50 92 A 42 42 0 1 1 50 8 Z" fill="#000000"/>
```

**No acute tips.** A shape that tapers to a point has a region near the point where the ink is
narrower than any threshold you set, so it fails the thin-feature check at 16 pixels, fails the
embroidery minimum interior angle of 30 degrees (`patch-1.5in`), and fills in under foil. Two
overlapping circles with the overlap knocked out is a beautiful idea on paper and produces two
crescents whose tips are zero units wide. If a form wants a point, blunt it: a flat cut of 4 to 6
units on a 100 box costs nothing visually and survives everything.

### 2.5 Counters and gaps set the minimum size

The smallest gap in the mark is the mark's minimum size. That is not a rule of thumb, it is
arithmetic, so decide the gap deliberately rather than discovering it later.

On a 100-unit box, a feature of `g` units renders as `g × px / 100` pixels:

| Feature width | At 16px | At 32px | Verdict |
|---|---|---|---|
| 20 units | 3.2px | 6.4px | Comfortable |
| 16 units | 2.6px | 5.1px | Good |
| 12.5 units | 2.0px | 4.0px | The floor. `APP:16`, two pixels at sixteen |
| 10 units | 1.6px | 3.2px | Fails the favicon, survives 32 |
| 8 units | 1.3px | 2.6px | Grey smear at 16, marginal at 32 |
| 5 units | 0.8px | 1.6px | Gone |

Do the calculation for three things separately and take the largest result: the thinnest **limb**,
the smallest **gap** between two elements that must stay apart, and the smallest **counter** (the
enclosed white shape). Record which one won, because that is what the minimum size means and it is
what the next designer may not change. `08-logo-system.md` §3.2 turns the same arithmetic into the
published minimum for the brand book.

**Open notches beat closed counters at small sizes.** A gap that runs off the edge of the mark stays
legible far longer than one enclosed on all four sides, because antialiasing closes an enclosed
counter from every side at once. If a form can be drawn either way, draw it open.

### 2.6 Paint

Explicit `fill` on every painted node, in literal hex. No `currentColor`, no CSS classes, no
`<style>` block, no gradients, no `<text>`, no `<image>`, no filters, no external references of any
kind.

- **Gradients are refused, not warned about.** A gradient fails five of the ten application contexts
  (`favicon-16`, `patch-1.5in`, `single-colour`, `apparel-embroidery`, `foil-stamp`, per
  `APP:17,77,110,246,273`), which under the fail budget of two makes a gradient mark non-viable
  before anybody looks at it. The audit reports `gradient` at error severity.
- **Live text is a font dependency.** A wordmark carrying `<text>` renders in Georgia on any machine
  without the face, and nobody finds out until it is on a sign. Outline it. Outlining is also the
  licensing-safe delivery form (`PKG:181`), because the delivered file then contains your arrangement
  of shapes rather than the foundry's glyph outlines.
- **Concepts are drawn black on white.** Colour is decided later, and it must not be allowed to
  rescue a weak silhouette. This is rule three in `planConcepts()` and it is there because a
  two-colour mark that reads as two shapes is one shape the moment it is etched.

Two masters when the mark ships: a frozen one with literal hex for anything rasterised or loaded
without a CSS context (favicon, `<img>`, OG image), and a themed one for inline use. Never one file
trying to be both.

### 2.7 The primitive vocabulary

Every mark worth shipping can be written with `<rect>` (with `rx`), `<circle>`, `<ellipse>`, `<path>`
using `M L H V Q A Z` plus `C` where a real curve needs it, and `<mask>` for negative space. If you
are reaching for stacked bezier chains with multiple control points to make the concept work, the
concept is too complex. Start again with a simpler hook.

**Knock holes with `fill-rule="evenodd"`**, which does not care about winding direction and is
therefore the one an agent gets right:

```xml
<path fill-rule="evenodd" fill="#000000"
      d="M 50 8 A 42 42 0 1 1 50 92 A 42 42 0 1 1 50 8 Z
         M 24 40 H 76 V 56 H 24 Z"/>
```

<https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule>

**Rotational symmetry is the cheapest structural device there is**, and it is trivially
parameterisable:

```xml
<g fill="#000000">
  <path d="M 50 10 L 58 44 L 50 50 Z"/>
  <path d="M 50 10 L 58 44 L 50 50 Z" transform="rotate(120 50 50)"/>
  <path d="M 50 10 L 58 44 L 50 50 Z" transform="rotate(240 50 50)"/>
</g>
```

Flatten those transforms into coordinates before the file becomes a master. A rotate transform on a
delivered mark is one optimiser pass away from being collapsed wrongly.

### 2.8 Three worked marks

Real path data, drawn on the conventions above. Each one is a small-grade asset, built first.

**A letterform. `A` as a peak, for Atlas Coffee.**

```xml
<!--
  Atlas · letterform-as-symbol, small grade
  Grid: 100 units. Legs splayed 26.6 degrees (dx/dy = 0.5), stem 18 horizontal
  = 16.1 perpendicular = 16.1 per cent of the mark, over the 12.5 favicon floor.
  Crossbar 14 units. Counter 16 wide at its base and tapering to the apex, so
  at 16px it reads as a soft notch rather than a clean hole. The open notch
  between the legs is what carries the letter at that size, which is why it is
  30 units wide and not 20.
  Apex is sharp and overshoots the cap line by 2 units, because a point at the
  cap line reads short. Legs end flat, no serif.
  Double read: peak first, then the letter. Both directions must hold.
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill-rule="evenodd" fill="#000000"
        d="M 50 6 L 94 94 L 76 94 L 65 72 L 35 72 L 24 94 L 6 94 Z
           M 50 42 L 58 58 L 42 58 Z"/>
</svg>
```

The outer subpath traces the silhouette including the notch between the legs, and the second subpath
knocks out the counter above the crossbar. The crossbar exists because the outer boundary is solid
between y 58 and y 72 and the counter stops at 58. Nothing is drawn twice.

**A geometric reduction. A disc with a stopped slot.**

```xml
<!--
  Slot · geometric reduction, small grade
  Grid: 100 units, everything on a 4-unit module.
  One closed form, one interruption. That is the entire formal logic, stated in
  one sentence, which is what stops an abstract mark being arbitrary.
  Disc r=42 (spans 8 to 92). Slot 52 x 16, x 24 to 76, y 40 to 56.
  The slot's centre sits at y=48, two units above the geometric centre, because a
  horizontal element on the true centre reads low.
  Narrowest bridge: 14.8 units at the slot ends, which is 2.4px at 16px.
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill-rule="evenodd" fill="#000000"
        d="M 50 8 A 42 42 0 1 1 50 92 A 42 42 0 1 1 50 8 Z
           M 24 40 H 76 V 56 H 24 Z"/>
</svg>
```

The slot stops short of both edges on purpose. Run it to the edge and the disc becomes two regions,
the region count at 16 pixels drops from 1 to 2 or the two halves merge back into one, and either
way the audit's `regions-collapse` check has something to say. Stopping short also keeps the mark a
single connected shape for embroidery, which halves the thread path.

**A literal symbol. A folded sheet seen edge-on, for a commercial laundry.**

```xml
<!--
  Fold · literal, small grade
  Grid: 100 units. Vertical budget: 7 pad, 18 limb, 16 gap, 18 limb, 16 gap,
  18 limb, 7 pad. Limb 18 per cent, gap 16 per cent, both over the favicon floor.
  Both notches are open at an edge rather than enclosed, so they survive
  antialiasing at 16px where a closed counter of the same size would not.
  One idea: a sheet folded twice. Not a letter S, not three bars.
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill="#000000"
        d="M 12 7 H 88 V 59 H 30 V 75 H 88 V 93 H 12 V 41 H 70 V 25 H 12 Z"/>
</svg>
```

Eleven segments, all horizontal or vertical, one closed contour, no counters at all. It is the
cheapest mark in this file to draw and the hardest of the three to break, which is the trade you are
usually making.

All three were run through `scripts/logoaudit.mjs` on 2026-08-30, rendered at 16, 32, 64 and 256
pixels, and return zero structural findings, zero rendered findings and no failed application
context. That is the floor, not a compliment. Passing the arithmetic is what buys a mark the right to
be looked at, and two of these three are ordinary.

---

## 3. The four families and what each is answering

These are the four things a person perceives as genuinely different kinds of logo, and they match
`FAMILIES` in `scripts/logospec.mjs` exactly. The planner fills them round robin, so no family gets
starved.

| id | Name | Architecture | Symbol approaches | The question it answers |
|---|---|---|---|---|
| `wordmark` | Wordmark | `wordmark` | none | Can the name itself carry the identity? |
| `letterform` | Letterform and monogram | `letterform-as-symbol` or `monogram` | `letterform-derived`, `monogram` | What does the name become when it is reduced to one shape? |
| `symbolic` | Symbolic | `lockup` | `literal`, `letterform-derived` | What thing does this business actually put in front of people? |
| `abstract` | Abstract | `lockup` | `abstract-gesture`, `geometric-reduction` | What quality can be made into a form that is only ours? |

Family is not the same axis as architecture. Architecture is a construction fact. Family is what the
answer looks like from across the room, and a concept round has to differ on the second one or it has
not offered anybody a choice. Four wordmarks in four typefaces is one option shown four times.

---

## 4. The taxonomies as a working reference

Lookup tables. The ids are the ids in `scripts/logospec.mjs` and must be used verbatim, because the
audit and the planner key off them.

### 4.1 Architectures

| id | What it is | Needs as fallback | The discipline |
|---|---|---|---|
| `wordmark` | The name set and worked. No standalone symbol. Best at 4 to 8 letters, 9 to 12 needs justification, 13+ is a hard fail | `letterform-as-symbol`, `monogram` | Letter by letter. Kerning is not optional. One structural intervention at most |
| `lockup` | Wordmark plus symbol in a fixed relationship, with a stacked alternate. **The default** | `symbol-only`, `letterform-as-symbol`, `monogram` | The gap is a ratio of the wordmark x-height, so it holds at every size. Symbol optical weight matches the wordmark stroke |
| `symbol-only` | Symbol carrying alone, wordmark relegated to legal surfaces | `wordmark` | Mechanically it passes everything and strategically it is unavailable to a new brand. Gated on `maturityGated` |
| `letterform-as-symbol` | One letter, drawn so it reads as the letter **and** as the idea | `wordmark` | The double read is the gate. Good letters M A B S D W K R; hard letters I L J T |
| `monogram` | Two or three initials as one shape: `pure-ligature`, `framed`, or `tight-kerned` | `wordmark` | Under-styled it is typed initials, over-framed it is a fake-heritage template. The distance between those is the work |

The three-asset hierarchy every architecture ships: a **primary** (marketing, web, packaging,
signage), a **square alternate** (social profile, app icon), and a **small grade** (favicon,
embroidery, foil). Build the third one first.

### 4.2 Typographic registers

Every face listed serves from the Google Fonts **public catalogue**, verified on 2026-08-30. The
`refused` column holds faces the anti-slop contract turns down by default. Refused is not forbidden:
a face the client already licences is evidence, and evidence beats a general rule. The planner will
not deal them; a person may still choose one with a stated reason.

| id | Built from | Signals | Risk | Faces | Refused |
|---|---|---|---|---|---|
| `geometric` | Circles and verticals | Modern, considered, optimistic | Cold, or generic startup, if nothing warms it | Jost, Outfit, Mulish, DM Sans, Work Sans, Familjen Grotesk | Poppins, Montserrat, Space Grotesk |
| `humanist` | Calligraphic gestures without serifs | Professional but warm | Reads as safe when the brief wanted a position | Cabin, Nunito Sans, Josefin Sans, Julius Sans One, Marcellus | Open Sans, Nunito, Lato |
| `neo-grotesque` | Closed apertures, even rhythm, no gesture | Competent and contemporary | The modern default. Generic unless something else is carrying | Archivo, Libre Franklin, Geist, IBM Plex Sans, Source Sans 3 | Inter, Roboto, Arial |
| `transitional-serif` | High contrast, sharp bracketing | Editorial, considered, intellectual | Fine strokes die at small sizes and under thread | Newsreader, Literata, Baskervville, Libre Baskerville, Libre Caslon Display, Source Serif 4, IBM Plex Serif, Charis SIL | Playfair Display, DM Serif Display, Instrument Serif |
| `old-style-serif` | Low contrast, warm shapes, angled stress | Heritage, institutional, unhurried | Fake heritage, if the brand has none | EB Garamond, Cormorant Garamond, Libre Caslon Text, Cardo, Crimson Pro, Gentium Book Plus | none |
| `slab` | Structural serifs carrying real weight | Strong, declarative, journalistic | Shouty at large sizes | Bitter, Zilla Slab, Rokkitt, Bree Serif, Josefin Slab | none |
| `display-drawn` | A public-catalogue base with one or two glyphs redrawn to solve a named problem | A wordmark nobody else has | Custom for novelty reads as a gimmick | Syne, Bricolage Grotesque, Instrument Sans | Fraunces |

`display-drawn` is how the highest-distinctiveness tier is reachable at all. Set the wordmark in the
base face, convert to outlines, then apply path surgery to **one or two glyphs**, each solving a
named problem. Two is the ceiling. Three is a redesign, and the count is checkable, which is what
turns "do not over-customise" from advice into a rule.

**Do not trust an HTTP 200 from the Google Fonts API.** Avenir, Gill Sans, Helvetica, Proxima Nova,
Garamond and Rockwell all return 200 and would load fine past the canvas CSP. They serve from
`fonts.gstatic.com/l/font?kit=`, which is commercial licensed delivery for Workspace and not a
licence to put a wordmark on a building. Product Sans returns 200 and carries a Google-restricted
banner. Test the path, never the status:

```js
function isUsableGoogleFont(cssBody) {
  if (/googlerestricted/.test(cssBody)) return false;              // Google-only licence
  if (/fonts\.gstatic\.com\/l\/font\?kit=/.test(cssBody)) return false; // commercial delivery
  return /fonts\.gstatic\.com\/s\//.test(cssBody);                 // public catalogue
}
```

<https://developers.google.com/fonts/faq> · <https://openfontlicense.org/>

### 4.3 Symbol approaches

| id | The brief | Risk | What saves it | Fits name types |
|---|---|---|---|---|
| `literal` | Depict the actual thing, specifically. Not "a leaf" but the leaf of the plant this business grows | The category cliche | Specificity of subject, and conviction in the drawing | `descriptive`, `concrete` |
| `abstract-gesture` | A quality made into a movement. A rising arc, two forms in tension, a line that does not close | Arbitrary. Any gesture can mean anything | A formal logic stated in one sentence and applied consistently | `abstract`, `coined` |
| `geometric-reduction` | A constructed form with no referent, built on a stated grid | Already done a thousand times. Hexagons and triangles are the graveyard | Specific proportions that are yours, and a wordmark doing the distinctive work | `abstract`, `coined` |
| `letterform-derived` | Built out of the name's own letters, so symbol and wordmark are one identity | Reads as a wordmark that lost its other letters | Exaggerate until the letter is also the thing | `descriptive`, `concrete`, `founder` |
| `monogram` | The initials as a single constructed shape | Old-fashioned, or a heraldry template | Modern execution inside a traditional architecture | `founder`, `place`, `long` |

The gate on `letterform-derived` and on the `letterform-as-symbol` architecture is the **double
read**: the silhouette must answer both "what letter is this" and "what object is this" correctly. A
one-directional read means the metaphor is not earning the custom drawing.

---

## 5. The refusal list

These are refused **at brief time**, not at review time. `clichesFor(category)` puts the list into
every slot brief before anything is drawn, under the heading "Refused outright".

Refusing before drawing is cheaper for a reason that has nothing to do with compute. Once a mark
exists and somebody has grown fond of it, "this is a category cliche" is an argument, and arguments
about taste are won by whoever cares most. Before it exists, it is a constraint, and constraints are
free.

**Refused everywhere:** swoosh · letter with an angled cut corner · monogram in a heavy ring · shield
with the year founded · filigree monogram · shield · infinity loop · handshake · abstract globe of
curved lines.

**Refused by category:**

| Category | Refused motifs |
|---|---|
| tech, ai, saas | hexagon · three stacked bars · triangle pointing forward · neural network of circles and lines · brain with circuit traces · triangle with an eye · sparkle or four-pointed star (the 2023 machine-learning tell) · letter inside a plain circle (when the letterform is not itself constructed) · gear or cog · ascending arc |
| finance, analytics | ascending arc or growth arrow · bullseye · eagle · bull |
| legal | roman pillar · scales of justice · gavel |
| healthcare, fitness | medical cross (Red Cross exposure in some uses) · caduceus (it is Hermes, not medicine) · heartbeat line |
| editorial, education | blackletter masthead · decorative drop cap · pen nib · book with a ribbon |
| outdoor, travel | bear silhouette · peak with a rising sun · compass rose · tent silhouette · palm or resort mountain |
| hospitality, luxury, fashion | crossed keys · crown |
| cpg, food, wellness, organic | leaf · brushstroke under the wordmark · bisected circle · mountain as aspiration |
| property, trades, construction | house outline · gear or cog · water droplet |
| platform, infrastructure | square as foundation |
| pets, veterinary | paw print |

**Palette cliches**, refused on the same terms:

| Pattern | Refused for |
|---|---|
| purple to indigo gradient | tech, ai, saas. The 2018 to 2022 technology tier |
| blue to green gradient | healthcare |
| blue to gold gradient | finance |
| old english on gold foil | fashion, luxury |
| cream ground with terracotta | everywhere. The current wellness and studio default, and the collision described in `04-anti-slop.md` |

One escape, and it is the only one: `mountain as aspiration` is allowed for `outdoor` when it is a
**specific named peak** drawn with specific construction. The general principle behind that
exception generalises. What lifts a motif out of cliche is never the motif, it is the specificity of
the execution: this leaf, this peak, this angle, this weight, so the audience reads "this thing" and
not "a thing".

---

## 6. The application context matrix

Ten contexts, each with the number that decides it. `renderAt` is the size the audit actually
rasterises at.

| id | The size | The number | What fails | Checked by |
|---|---|---|---|---|
| `favicon-16` | 16px, rendered | min limb 12.5 per cent of the mark, max 6 regions, max 4 paints, no gradient | Lockups almost always. Fine letterform detail, internal cutouts, multi-colour dithering | Mechanical, and the rendered pass at 16 |
| `app-icon-28` | 32px, rendered | min limb 10.7 per cent, max 8 regions, max 6 paints, needs an opaque background field, safe circle | Square-ratio marks inside a circle mask. Thin strokes. Transparent backgrounds rendering black on iOS | Mechanical |
| `patch-1.5in` | 38.1mm | min limb 2.6 per cent, min cap height 5.2 per cent, max 6 colours, min interior angle 30 degrees | Acute angles under the needle. More than six thread colours gets silently simplified by the embroiderer | Limb and colours only. Cap height and interior angle are declared and not yet evaluated |
| `single-colour` | any | 1 colour, no gradient, area count unchanged when hue is removed | Any mark where two areas are told apart by hue alone. They merge in etching, foil, fax and 1c print | Mechanical (`colour-carries`). Detects HUE separation only: two touching tones of one neutral also merge and it will not see that. Whether the merged silhouette still reads as the brand is a person's call |
| `reverse-dark` | any | contrast at least 3:1 against the dark ground | White-only knockouts that vanish. Marks that invert into a different, unwanted shape | Declared and not yet evaluated. Today this is a person's job both ways |
| `signage-large` | 8 to 12 feet | min limb 4 per cent of the mark's larger dimension, vector only | Strokes that looked elegant at 200px look anaemic at three metres | Limb only. Vector-only is covered by the `raster` structural check. Illumination is a person's call |
| `motion` | 1 to 3 seconds | none | A mark whose construction suggests no assembly has to be pushed around | Not mechanical at all |
| `social-square` | 64px, rendered | min limb 2.5 per cent, everything inside the inscribed circle, centred within 8 per cent | Horizontal lockups crop. Corners lost to the circle. Detail that lives at 200px dies at 80 | Limb and centre offset. Circle containment is approximated by the centre test, not measured |
| `apparel-embroidery` | 38.1mm | min limb 5.2 per cent, min cap 6.6 per cent, max 6 colours | Tighter than a patch, because the fabric is the substrate. Whatever passes here passes a patch | Limb and colours. Cap height is declared and not yet evaluated. Wash durability needs a physical sample |
| `foil-stamp` | card scale | 1 colour, min limb 2.6 per cent | Thin serif brackets do not arrive. Heavy fills bleed at the edges | Mechanical |

`auditContexts()` today evaluates five things: gradients, paint count against `maxColours`, limb
width against `minStrokeRatio` (from the geometry and again from the render), centre offset where
`safeCircleRatio` is set, and region counts against `maxRegions` and against the 256px reference.
`minCapRatio`, `minInteriorAngle`, `minContrast` and `needsBackground` are declared on the context
objects and are not read by any check. A `pass` on those four means "not tested", not "fine". Treat
the app-icon background field, the embroidery cap height and the reverse-on-dark contrast as manual
until the checks land.

### How each architecture fares

`pass` ships as-is. `cond` passes only when a numeric constraint holds. `fallback` means this asset
does not serve this context and a different tier of the system does.

| architecture | favicon-16 | app-icon-28 | patch-1.5in | single-colour | reverse-dark | signage | motion | social-square | apparel | foil |
|---|---|---|---|---|---|---|---|---|---|---|
| `wordmark` | fallback | fallback | cond | pass | cond | cond | pass | fallback | cond | cond |
| `lockup` | fallback | fallback | fallback | cond | cond | pass | pass | fallback | fallback | cond |
| `symbol-only` | pass | pass | pass | cond | cond | pass | pass | pass | pass | pass |
| `letterform-as-symbol` | pass | pass | pass | pass | cond | pass | pass | pass | pass | pass |
| `monogram` | pass | pass | pass | pass | cond | pass | cond | pass | pass | pass |

### Deferred is not failed, and getting this backwards rejects every lockup

This is the single easiest thing to get wrong in the whole file, so it is worth being explicit.

A lockup fails the favicon. It also fails the app icon, the patch, the square avatar and apparel
embroidery. That is five of ten, well over the fail budget of two, and it is **still the correct
primary mark**, because the small-grade asset covers all five. `auditContexts()` encodes this: when
the architecture's own expectation for a context is `fallback`, the row comes back as
`deferred` rather than `fail`, and `verdictOf()` only counts rows whose status is `fail`.

> **The fail budget of two applies to the SYSTEM of three assets, never to one file.**

A concept fails when, across the primary, the square alternate and the small grade, more than two
contexts are left uncovered by any asset. A single file failing a context it was never meant to serve
is not a defect, it is the hierarchy working. Count it as a defect and you reject `lockup`, which is
the default architecture for most brands, and you are left recommending symbol-only marks to
businesses with no recognition, which is the strategic failure at `ARCH:85`.

The same asymmetry appears in the rendered pass. `auditRenderMetrics()` downgrades
`regions-collapse`, `thin-at-16` and `empty-at-16` from error to note when the architecture defers
the favicon, and the fix text changes to say so: "Expected for this architecture. The small grade
asset has to carry the favicon, and this confirms it."

---

## 7. What the audit measures, and what it cannot

`$A logo audit` runs `scripts/logoaudit.mjs` in three passes of increasing cost: structure (reading
only), geometry (measured off the path data, so scale free), and rendered (one sprite sheet, one
screenshot, every candidate at 16, 32, 64 and 256 pixels, sliced by coordinates computed before it
was drawn).

### Every check, its threshold, and its basis

| Check | Severity | Threshold | Basis |
|---|---|---|---|
| `empty` | error | no content | Nothing to audit |
| `not-svg` | error | no `<svg>` element | Not a vector file |
| `too-big` | error | over 512KB | A logo this size is a traced raster or an embedded image |
| `no-xmlns` | error | root lacks the SVG namespace | Strict XML parsing when loaded as an image. Renders as a blank box with no error anywhere |
| `unquoted-attribute` | error | any unquoted attribute value | Same. Silent by construction |
| `no-viewbox` | error | no viewBox and no width/height | Every downstream step centres and scales by reading it |
| `no-ink` | error | nothing paints | Nothing to audit |
| `live-text` | error on a master, note on a candidate | any `<text>` | `PKG:181` |
| `raster` | error | any `<image>` | Cannot be cut in vinyl or reproduced at signage scale |
| `script`, `foreign-object` | error | present | Stripped or dropped everywhere it is used |
| `external-ref` | error | any off-file reference | Nothing downstream has network access |
| `script` | error | any `<script>` | Stripped everywhere the mark is used, so anything depending on it is already broken |
| `foreign-object` | error | any `<foreignObject>` | Does not survive rasterising, so it is absent from every PNG the pack produces |
| `dangling-ref` | error | a paint pointing at a missing id | That shape renders as nothing |
| `gradient` | error | any `<linearGradient>` or `<radialGradient>` | `APP:17,77,110,246,273`, five of ten contexts |
| `current-color` | error on a master, warn otherwise | `currentColor` in any paint | A mark whose colour is decided by its container has none of its own |
| `css-classes` | error on a master, warn otherwise | class selectors in a `<style>` block | Class paint does not survive recolouring into mono and reversed variants |
| `clipped` | error | ink outside the viewBox by more than 0.5 units | Silent cropping |
| `viewbox-slack` | warn | mark spans under 75 per cent of its viewBox | Derived. Every icon slot scales by the viewBox |
| `node-count` | warn | over 400 path segments | Derived. A drawn mark is tens; hundreds is a trace |
| `renders-empty` | error | geometry says ink, browser draws none | Nothing else in the report is trustworthy until it is fixed |
| `too-light` | error | under 2 per cent ink coverage at 256px | Derived. Hairlines on white |
| `too-heavy` | warn | over 65 per cent coverage | Derived. Only the outer edge carries the silhouette |
| `regions-collapse` | error, or note when the architecture defers the favicon | fewer separate shapes at 16px than at 256px | `APP:23-27`. The mechanical form of the test everybody says to do and nobody does |
| `thin-at-16` | error, or note when deferred | the mark's limb width under 2px at 16px, by erosion | `APP:16` |
| `empty-at-16` | error, or note when deferred | under 2 per cent coverage at 16px | Derived |
| `busy-at-16` | warn | more than 6 separate shapes at 16px | `APP:15` |
| `colour-carries` | error | more colour regions in the colour render than black regions in the mono render | `APP:112-113` |
| `near-duplicate` | warn | two 16x16 silhouettes within a mean absolute difference of 0.08 at 64px | Derived. Measured on two real rounds: identical marks 0.0000, the closest genuinely different pair 0.2238, and the hardest honest case (two wordmarks of one name in different faces) 0.1656. A perceptual hash was tried first and abandoned: dHash records horizontal gradient and a black shape on white has almost none |
| `unchanged` | warn | two marks refining the SAME parent within 0.01 | Derived. Siblings in a refinement round are supposed to look alike, so the only thing worth reporting between them is that nothing changed |

Verdicts from `verdictOf()`: any error is `rejected`; more than two failed contexts is
`not-a-primary`; any warning or one to two failed contexts is `contender-with-notes`; otherwise
`contender`.

### Two blind spots in the width measurement, and the check that covers them

Neither of the two ways the audit measures thickness sees everything, so know which one is talking.

- **`strokeRatio()` only sees declared stroke widths.** A hairline drawn as a long thin filled
  rectangle has no stroke width at all and is invisible to it. A fully filled mark returns `null` and
  the geometry pass has nothing to say about weight at all.
- **`minFeatureWidth()` reports the heaviest limb, not the thinnest.** It is a Chebyshev distance
  transform, equivalent to eroding one pixel from every side until the last ink disappears, so the
  number that comes back describes the fattest part of the mark. A hairline attached to a heavy blob
  does not move it. It also rounds down on even widths, so a 2px bar reports 1, and the frame edge
  counts as background, so a mark bleeding off the canvas measures as if cropped.

And four constraints declared on the context objects are not read by any check at all
(`minCapRatio`, `minInteriorAngle`, `minContrast`, `needsBackground`), so a `pass` on those means
"not tested". Section 6 says which, and what to do by hand instead.

What actually catches a thin part closing up is **`countRegions()`**, compared between 256px and
16px. When four separate shapes at 256 become one at 16, the counters have closed, and that is the
`regions-collapse` check. Read the three together: `regions-collapse` says detail was lost,
`minFeatureWidth` says whether the whole mark is too light to survive, and `strokeRatio` says whether
the declared construction was ever going to work. Any one of them alone will let something through.

### What it cannot tell you

Be blunt about this, because a green audit is seductive.

The audit can tell you the counters closed at 16 pixels. It cannot tell you the mark is boring,
derivative, or wrong for this brand. It has no idea what the business does.

Needs a **vision pass** over a render, not arithmetic:

- Whether the silhouette is identifiable at all when type-stripped and blurred.
- Whether the letterform-as-symbol double read holds. Two prompts on the same render, "what letter is
  this" and "what object is this", both of which must answer correctly.
- Whether monogram initials read as two distinct shapes or as a tangle.
- Whether the three assets in a concept read as one system or as three brands.
- Whether the mark inverts into a different, unwanted object.
- Whether the collapsed single-colour silhouette still reads as the brand after the arithmetic has
  confirmed that nothing merged.

Needs a **person**, with no proxy available:

- Distinctiveness against the category. The real test is a search for "[category] logo" and a
  judgement about whether this matches three existing marks. The cliche blocklist reaches part of the
  way and no further.
- Whether it is being designed for the founder's taste or the audience's perception.
- Sketchability. Whether somebody can redraw it from memory after thirty seconds.
- Fake heritage. An old-style serif on a brand founded last year needs the founding date and the rest
  of the system to judge.
- Whether the easing in a motion lockup feels intentional.
- Whether the embroidery survives washing. Physical sample only.
- Whether the screen colour matches the vinyl, the paint, the acrylic or the backlit panel.
- Trade mark similarity. Nothing in this pipeline checks it. See section 10.

Roughly three quarters of the quality bar is enforceable in code. The last quarter is the part that
decides whether the mark is any good.

---

## 8. The nine-field variant spec

Every concept that reaches the board carries this. The fields are fixed; the specificity bar is set
by the example. "IBM Plex Sans Medium with tracking +5" is specific. "Modern sans-serif" is not.

```js
{
  // 1. Descriptive identifier with an index
  name: 'A2 · Mountain peak A lockup, IBM Plex Sans',

  // 2. Architecture, plus the whole asset hierarchy
  architecture: {
    id: 'lockup',
    composition: 'Wordmark right of a custom letterform A. The A reads as the first letter of Atlas and as a peak.',
    stackedAlternate: 'A centred above the wordmark, for square contexts',
    smallGradeFallback: 'The A alone, for favicon, embroidery and stamping',
  },

  // 3. Typeface, weight, custom letterform notes, tracking and kerning
  typography: {
    face: 'IBM Plex Sans',
    weight: 'Medium (500)',
    tracking: '+5 (10 units on a 1000-unit em)',
    customLetterform: {
      glyph: 'A',
      problem: 'must read as both letter and peak',
      construction: 'crossbar replaced with a single horizontal stroke at 38 per cent height; apex sharp; legs splayed 26.6 degrees from vertical',
      appliedTo: 'replaces the typed A in the wordmark, so the whole wordmark reads as one unit',
    },
    opticalAdjustments: [
      "the t of Atlas shortened by 4 units to balance against the rising A to its left",
      "the f of Coffee pulled inward by 3 units so it stops reading as an extra bar",
    ],
  },

  // 4. Approach, visual description, construction grid
  symbol: {
    approach: 'letterform-derived',
    grid: '100 units, 2-unit module',
    construction: {
      apex: 'sharp, 2 units of overshoot above the cap line',
      crossbar: '14 units, single horizontal stroke, no double bar',
      stem: '18 horizontal, 16.1 perpendicular',
      counter: '16 wide at the crossbar, tapering to the apex',
    },
    doubleReadTest: 'Peak first, then the letter A, at every scale. PASS.',
  },

  // 5. Primary, mono black, mono white, reverse
  colourTokens: {
    primary:   { name: 'Warm charcoal', hex: '#2A2521', use: 'wordmark and symbol in standard reproduction' },
    accent:    { name: 'Rust', hex: '#B85C38', use: 'marketing surfaces only, NOT inside the lockup' },
    monoBlack: { hex: '#000000', use: 'embossed letterhead, foil, 1c print' },
    monoWhite: { hex: '#FFFFFF', use: 'reverse on dark, night signage' },
    reverse:   { note: 'the construction is direction-neutral, so the mark reads identically either way' },
  },

  // 6. Contexts it excels in, contexts needing a fallback, embroidery notes
  applicationNotes: {
    excelsAt: [
      { context: 'signage-large', note: 'peak silhouette reads at street scale' },
      { context: 'foil-stamp', note: 'flat cuts and a 16-unit stem take a die cleanly' },
    ],
    needsFallback: [
      { context: 'favicon-16', fallback: 'symbol-only A' },
      { context: 'social-square', fallback: 'stacked alternate, A above wordmark' },
    ],
    embroidery: { threads: ['Madeira Polyneon 1842'], minStroke: '3 units at 1.5 inch' },
  },

  // 7. What it communicates, and the evidence in the drawing for each claim
  signals: [
    { id: 'considered-craft', evidence: 'the optical adjustments say the brand thinks about every letterform, therefore about everything else' },
    { id: 'outdoor-adjacency-without-literal-imagery', evidence: 'a peak inside the letter, with no trail, tree or campsite' },
  ],

  // 8. What it explicitly is NOT. The negative space sharpens the positive selection
  rejects: [
    'Not a laurel mark. No wreath, bean or cup.',
    'Not a literal coffee bean. That is the category cliche.',
    'Not a Pacific-Northwest-cabin aesthetic. The outdoor reference is structural, not stylistic.',
  ],

  // 9. Rendered in 3 to 5 contexts. Minimum: web header, business card, favicon
  mockups: [
    { context: 'web-header', desc: 'lockup at 200px wide, 40px tall' },
    { context: 'business-card', desc: 'symbol-only A foil stamped at 12mm' },
    { context: 'favicon', desc: 'A alone at 16px in a real browser tab, next to eight real favicons' },
  ],
}
```

Five rules the spec has to obey, and each one is checkable on the object itself:

1. **Be specific.** Named face plus weight plus numeric tracking, never an adjective.
2. **Show the system.** Each variant is a primary plus its fallbacks. Document the hierarchy, not
   just the primary.
3. **Justify with `signals` and `rejects`.** The negative space sharpens the positive selection, and
   a concept with no `rejects` has not decided anything.
4. **Render mockups.** In image or in prose. A spec without them is half finished.
5. **Prepare for production.** Colour tokens, thread codes, foil specs and minimum sizes are the
   bridge from a decision to a manufactured object.

Note what the worked example does that the field list does not require, and copy it: every number is
a unit on a stated grid. That is what makes a spec renderable rather than descriptive.

---

## 9. Failure patterns, each turned into a check

Deduplicated from the research. `mech` is computable from the SVG or the spec object, `vision` needs
a model looking at a render, `human` needs a person, the market, or a physical sample.

`mech` means a machine can decide it, not that the audit decides it today. What
`scripts/logoaudit.mjs` actually runs is the list in section 7. The rest are checks to run by hand,
or to wire up.

| # | Failure | Check | The concrete test |
|---|---|---|---|
| 1 | Gradient anywhere in the mark | mech | Assert no `<linearGradient>` or `<radialGradient>`. Five of ten contexts, so refuse by default |
| 2 | Counters close at favicon size | mech | Region count at 16px versus 256px. `regions-collapse` |
| 3 | The whole mark is too light to survive 16px | mech | `thin-at-16`, measured by erosion on the render. It reports the heaviest limb, so pair it with check 2 |
| 4 | Colour is doing structural work | mech | `colour-carries`. Connected regions counted WITH hue against the same count in greyscale, which is what the mark becomes on a one-colour press |
| 5 | Off-centre inside a circular crop | mech | Ink centroid against viewBox centre, ceiling 8 per cent |
| 6 | Auto-traced raster presented as a drawn mark | mech | Segment count over 400, plus file size over 512KB |
| 7 | Mark cropped by its own viewBox | mech | Ink bounds against viewBox bounds |
| 8 | Dead margin baked into the file | mech | `viewbox-slack` under 75 per cent |
| 9 | Live text, so the wordmark depends on an installed font | mech | Any `<text>` element. Error on a master |
| 10 | Two entries in the round are the same idea | mech | Silhouette distance within 0.08 at 64px, or within 0.01 when they refine the same parent |
| 11 | Over-customised letterforms | mech | Count modified glyphs. Ceiling of two, each naming the problem it solves |
| 12 | Indecisive register pairing | mech | Two registers too close to read as a decision. Check the pair of ids, not the render |
| 13 | Cliche motif | mech | Match the symbol brief against `clichesFor(category)`, at brief time |
| 14 | Cliche palette | mech | Match against `PALETTE_CLICHES` by category |
| 15 | Symbol approach disconnected from the name | mech | `nameType(name)` must appear in the approach's `fitsNames` |
| 16 | Symbol-only chosen by a brand with no recognition | mech | `maturityGated`. Refuse without stated recognition |
| 17 | No small-grade asset exists | mech | Assert all three hierarchy tiers. If tier three cannot be derived from tier one, the primary is over-detailed |
| 18 | No square alternate | mech | Assert an asset with an aspect ratio between 0.9 and 1.1 |
| 19 | Symbol and wordmark in different weight classes | mech | Symbol limb width against wordmark stem width, within 15 per cent |
| 20 | Lockup gap not tied to x-height | mech | Assert `gap = k × xHeight` for a declared `k`, then re-render at 200, 100, 50 and 25 per cent |
| 21 | Reverse-on-dark contrast fails | mech | Every fill at 3:1 or better against the dark ground |
| 22 | Geometry lost to a circle mask | mech | All ink inside the inscribed circle |
| 23 | Anaemic at signage scale | mech | Minimum limb at 4 per cent of the mark's larger dimension |
| 24 | Acute tips that fail under a needle or a die | mech | Flag interior angles under 30 degrees |
| 25 | Silhouette does not survive | vision | Strip the type, fill flat black, blur or downscale. Is it identifiable? |
| 26 | The letterform double read fails | vision | "What letter is this" and "what object is this" on the same render. Both must be right |
| 27 | Monogram initials clash | vision | Render the pair, ask whether two distinct shapes are readable. Partial mech: flag I, L, J, T and the pairs I+J and O+U |
| 28 | Trying to depict everything the business does | vision | Count extractable ideas. One is right, two is the ceiling, three reads as committee work |
| 29 | Three assets read as three brands | vision | Show them side by side and ask whether they are one system |
| 30 | Reverses or rotates into an unwanted object | vision | Render inverted and at 180 degrees |
| 31 | Not distinctive against the category | human | Search "[category] logo". Fails on a match with three existing marks |
| 32 | Designed for the founder, not the audience | human | No proxy exists. The audience-side test wins |
| 33 | Not sketchable from memory | human | Describe it in one sentence to somebody who has not seen it and ask them to draw it |
| 34 | Fake heritage | human | Needs the founding date and the rest of the system |
| 35 | No natural entry or exit animation | human | Whether the construction suggests its own assembly is a design judgement |
| 36 | Embroidery does not survive washing | human | Physical sample only |
| 37 | Screen colour does not match the material | human | Vinyl, paint, acrylic, backlit. Partial mech: assert Pantone values are present |

---

## 10. Rights, provenance and honesty

Say all of this to the client in writing, before the concepts are shown. It is much cheaper as a
paragraph in a brief than as a conversation eighteen months later.

**A generated mark has unsettled IP status.** Copyright protection generally requires human
authorship. In Australia the Full Federal Court held in *Telstra Corporation Ltd v Phone Directories
Company Pty Ltd* [2010] FCAFC 149 that a work must originate from an identifiable human author, and
the position on machine-generated output has not been settled by an Australian court since. The
United States Copyright Office reached a compatible position in its 2025 report on copyrightability,
holding that material generated by a model without sufficient human authorship is not protected while
human contributions to a work can be. <https://www.copyright.gov/ai/>

The practical consequence is narrower than it sounds, and it is worth stating precisely rather than
alarmingly. Trade mark rights are a separate system from copyright and turn on use in trade and
distinctiveness, not on who drew the artwork, so an unregistrable-by-copyright mark can still be a
registrable trade mark. What you lose is the ability to stop somebody else copying the artwork on
copyright grounds. What you keep, if you use it and register it, is the trade mark.

**No similarity check runs here.** Nothing in this pipeline searches a trade mark register, does
reverse image search, or compares the mark against anything outside the concept round. The
`near-duplicate` check compares candidates in the same round against each other, and that is all it
does. Do not let a clean audit be read as clearance.

**Record this, per concept, in the sidecar:**

```
model            the model id that drew it
prompt           the exact slot brief it received, verbatim
date             ISO date
slot             the planner slot id (family, architecture, register, symbol approach, seed)
edits            every human change after generation, with who made it and when
approved         the name of the person who approved it, and the date
```

The `edits` field is the one that does real work. Human modification is what a copyright argument
would turn on, and it is also what turns a generated shape into a designed one. Record it as it
happens, because reconstructing it later is guesswork and guesswork in this particular record is
worse than nothing.

**Before registration, a person runs these searches.** Not you, and not because of capability, but
because the result is a legal risk decision:

- Australian Trade Mark Search, IP Australia. <https://search.ipaustralia.gov.au/trademarks/search/quick>
- WIPO Global Brand Database, for international registers and the Madrid system.
  <https://branddb.wipo.int/>
- A reverse image search on the mark, and a search of the category's logo galleries.
- A trade marks attorney, if the mark is going on a building, a product, or a register.

**The product's position, stated plainly, and it goes in the deliverable:**

> A generated mark is a starting point that a person approved. It is not a drawn one. What ships is
> vector geometry drawn on a stated grid and audited against numbers, which is a real artefact and a
> real improvement on a traced raster. It is not a substitute for a designer, it has not been checked
> against any trade mark register, and the brand book says so in the logo chapter.

`08-logo-system.md` §7.3 ranks the honest answers: a typeset wordmark first, a modified wordmark
second, a commissioned mark third. A concept round is how you find out which of those three the
brand actually needs, and that is worth doing properly even when the answer turns out to be the
first one.
