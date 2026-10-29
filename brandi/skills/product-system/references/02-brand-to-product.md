# From brand book to product

A brand book is written for the brand's own surfaces: a website, a deck, a poster, a social tile. A
product someone works in all day asks different things of the same brand. Colours that are right on
a hero fail as text on a card. A display face with one weight cannot set a dense table. A copy formula
built to persuade gets in the way of someone halfway through a task.

So translation is a set of decisions, and every one is written down, in the system's "From brand book
to product" section, with its reason. That page exists so nobody "fixes" the product back to the
brand book later.

## Where the decisions live

The roles go in `product/product.json`, which `$A product tokens` reads:

| Key | What it decides | Default when undecided |
| --- | --- | --- |
| `roles.primary` | The one primary action per view, `{ light, dark }` | The brand colour's readable solid in light; in dark, the brand colour lifted until it stands off the canvas, with a dark label |
| `roles.brand` | The brand colour as a fill (a secondary emphasis, the selected line, illustration) | The brand colour itself |
| `roles.highlight` | What "needs you" looks like | The brand's accent, the colour it keeps for where an eye needs to land |
| `roles.canvas` | The ground behind everything. A decided canvas tints the surfaces on it | A step down from the surface, tinted with the brand's neutral |
| `roles.ink` | The text colour. Quieter text, lines, tags and the chart comparison are mixed from it towards the surface and then solved, so the whole hierarchy carries its hue | The brand's neutral at its darkest (lightest in dark) |
| `roles.focus` | The focus ring colour | The brand colour, solved to 3:1 on every ground |
| `roles.rail` | A signature navigation surface | None: the rail is a quiet surface |
| `displayForTitles` | Whether the display face sets page titles | `true` |
| `displayCase` | `"upper"` when the brand only ever sets its display face in capitals: the hero, display and title styles take capitals, tracked open a little | Unset: the face's own case |
| `time` | How the brand writes a time, `{ "minutes": ":" or ".", "onTheHour": "keep" or "drop", "space": true or false }`. "11am to 10.30pm" is `{ ".", "drop", false }`. Every time the system writes follows it | 9:30 am: minutes kept, a space before am or pm |
| `charts.avoid` | Colours the brand keeps off one theme's grounds, `{ "light": [...], "dark": [...] }`: no chart series takes them or their hue there | None |
| `brandColours` | The brand book's named colours, emitted as `brand-*`: a list, `[{ "name": "green", "hex": "#2E7D32" }]`, or a map, `{ "green": "#2E7D32" }`. Names are lower case words joined by hyphens, since each becomes a CSS variable | The primary and accents |
| `shape.families` | Each family's radius, measured from the brand's own work, with its source: `press`, `control`, `card`, `pane`, `frame` (Shape, below) | Derived from the brand's scale, never rounder than the largest radius measured, and listed as the kit's |
| `shape.action` | Whatever a person can press, when `press` is not measured: `"pill"`, `"control"` (buttons match the inputs) or a value | The pill, listed as the kit's |
| `shape.shell` | The rail's form, `{ "form": "edge" or "floating", "source" }` | `edge`: the rail meets the window edge, square, listed as the kit's |
| `shape.moves` | The brand's own shape moves the product carries, `[{ "name", "source", "where" }]`. A texture names its file too: `"file": "textures/paper.jpg", "kind": "texture", "strength": 0.3` (Shape, below) | None, and every round record says so |
| `fonts` | The faces the system ships as files, `[{ "family", "file": "fonts/<name>.woff2", "weight": "400" or "300 900", "style" }]`, each file in `product/fonts/` (Type, below) | None: every face is hosted, and boards link Google Fonts for it |

A decided role is used exactly as given. If it fails the audit, resolve it with the person (a
different role, a darker variant, a different label) and record the outcome. Never move it silently.

## Colour

**Roles, never brand values.** Interface code uses role tokens (`primary`, `text-muted`,
`highlight`). The brand book's exact values exist as `brand-*` tokens so roles can alias them, and
nothing in a component touches them directly. Roles are what let dark mode swap values without
touching a component.

**The primary is the action, not the logo colour.** A light brand colour usually cannot carry a white
label (a mid blue with white text is often under 3:1). The common answer is the brand's darkest ink as
the primary in light, the brand colour as the primary in dark with a dark label, and the brand colour
kept as a fill elsewhere. Whatever the answer, record it.

**The brand's ink, on everything it can carry.** A brand with a dark ink (a navy, a deep green)
usually wants it as the text colour and as the label on its fills: navy on the pale brand blue, navy
on the yellow highlight, navy on a light primary at night. Decide `roles.ink`, and the engine prefers
the brand's darkest decided colour for every label wherever it passes, falling back to white or a
neutral only where it does not. A decided canvas works the same way: a navy canvas at night gets
navy surfaces, because grey cards on a coloured ground read as a mistake.

**A highlight is never text.** "Needs you" is a fill with a label on it: counts in the rail, tabs and
filter chips, the needs-you badge, search matches, selected text. It must not look like the warning
colour. The last system first used one yellow for both "look here" and "heads up", and review found
the two meanings blurred; warnings became amber and yellow kept one meaning. The audit warns when
the highlight and the warning colour are close.

**Five status families, four roles each.** Success, warning, danger, info and ai, each with a text
colour (readable on a card and on its own tint), a tint, a solid for dots and fills, and a line for
edges. Status always comes with a word or an icon; colour never carries it alone. The ai family
marks what the assistant made or suggested, so it needs a hue of its own, far from every status hue.

**Badges and tags must not look alike.** Badges show a record's state (a tinted fill in a status
colour). Tags show a category someone assigned (an outlined label with the category's chart colour as
a dot). Review found them identical in the last system's first build. The `tag-1` to `tag-6` tokens
are pale fills on the series hues for the places an outline does not fit, such as a calendar block or
a board card. They are never the Tag component's ground.

**Six chart series, in fixed order.** Checked for colour-vision separation, each 3:1 on a card,
comparisons grey and dashed, status colours reserved for status. The brand's own colours take the
first slots (the brand colour, then its accents), so a chart reads as the brand's; Brandi's
colour-vision-checked palette fills the rest, skipping hues already taken. Each series is then lifted
or dropped until it clears 3:1 in both themes, which turns a pale accent (a yellow) into a usable
darker series. No two slots share a colour: in dark the colour-vision-safe set can come to four
hues, and a sixth slot once wrapped round to the first. The audit reports neighbours that collapse
under a colour-vision deficiency: label those lines directly, or reorder.

**Two full themes.** Light is the default. Dark is a theme of its own, not an inversion and not a
per-screen choice: in the last system's first build, dark mode lost its hierarchy (the rail sat at
1.05:1 on the canvas) until dark got its own values. The engine solves every role separately for
each theme.

**A text hierarchy with a floor.** `text-strong` for titles and figures, `text` for body, `text-muted`
for supporting copy, `text-subtle` for meta and placeholders, and nothing quieter than `text-subtle`
(4.5:1 on every ground it sits on). On selected rows, quiet text switches to `text-muted`.

**A rail in a colour speaks in its colour.** On a decided rail that carries colour (an emerald, a
navy), `rail-text` and `rail-muted` are solved in the rail's own hue, as tints of it, and still clear
7:1 and 4.5:1. Mixed towards the brand's hue instead, an emerald rail's group labels lost its chroma.
The detector reported them as grey on colour 52 times, and the only fix on the product's side was to
give up the rail. A black or grey rail keeps neutral words.

**Every pair measured.** Each token declares what it sits on, and the audit measures every one of
those pairs in both themes, including washes laid over their surface. The last system checked 162
pairs; the engine's default set checks more.

## Type

**The display face, sparingly.** In a product, a display face earns at most three places: the page
title, a greeting or full-page headline, and the sign-in hero. One display moment per screen. Set
`font-synthesis: none` so the browser never fakes a bold or italic the face does not have, and never
use a face with old-style figures for numbers. If the display face cannot sit at 26px in a page
header, set `displayForTitles: false` and titles use the body face, bold. Numerals stay out of a
display face the brand never sets them in: a generated board's part number sits under its heading,
in the body face.

**The body face for everything else**, sized for density: body 14/20 at every width including
phones, body-lg 16/24 for reading (answers, notes, help), labels at 500, headings at 700, tabular
figures for every number (`kpi` and `kpi-sm`). Record the 14px body on phones as a deviation, with
the reason: interface text is labels and values, and 16px pushes a third of a list below the fold.

**Tracking:** tight on display and headings, zero at 13px and below so small text stays open, wider
(+6%) on uppercase labels. A brand's "tight everywhere" rule smudges small text.

**Prose is capped in em, never in ch.** A `ch` is the width of a zero, and a face with a wide zero
makes `65ch` run past 100 characters. The `measure` token is in em; the detector's line-length rule
checks it against the real face.

**Fonts ship as files with the system**, so previews and the canvas never depend on a CDN. One
variable file where the face has one. Record each face's licence in a Licences asset group, and
respect the terms: a face licensed for the brand's own work only stays inside the brand's systems.
Put the files in `product/fonts/` and list them under `fonts` in product.json (the table above).
`tokens.css` then carries an `@font-face` for each, and `$A product bundle` installs the files beside
every copy of it. The starter loads them through next/font/local, and generated boards carry no
Google Fonts link. A face left hosted is asked of Google for the weights its type styles set, and no
italics. Google refuses the whole stylesheet when one face lacks a weight asked of it: a display face
with one weight, asked for four in both styles, left the boards with no face at all.

## Shape, space and marks

**Measure the brand's shapes before choosing any.** A product drifts towards the kit's look unless its
shapes come from the brand. Measure each family from the brand's own work and record where: the
guidelines first, then its live work (website, app, signage) where the guidelines say nothing. Measure a
drawn shape in a PDF from its path, and a live site from its computed style: `$A product measure --url
<site>` reads the site in the installed Chrome and suggests each family and the shell with its source,
counting only the brand's own text buttons (not app-store badges or icons). Keep what the guidelines
settle and take the rest. Never take a shape from another brand, however good it looks.

| Family | Sets | Measure |
| --- | --- | --- |
| `press` | `radius-action` | The brand's buttons and calls to action |
| `control` | `radius-control` | Its form fields. With none to measure, `"action": "control"` gives the inputs the buttons' radius |
| `card` | `radius-md` | Content cards and panels |
| `pane` | `radius-lg` | Dialogs and panels that sit over a page |
| `frame` | `radius-frame` | Photos and the frames round them |

```json
"shape": {
  "action": "control",
  "families": {
    "press": { "px": 4, "source": "the website's buttons, computed style, on the date measured" },
    "card": { "px": 12, "source": "the cards on p12, 9 pt corners measured from the PDF" },
    "frame": { "px": 0, "source": "every photo in the guidelines is square" }
  },
  "shell": { "form": "edge", "source": "the website's navigation: a full-width bar, square" },
  "moves": [{ "name": "The paper ground", "source": "the guidelines' page grounds, the brand's texture file", "where": ["the website hero", "the app welcome"] }]
}
```

**What nobody measured is derived, and held.** A family with no measurement comes from the brand's
scale, never rounder than the largest radius measured: a pane is never rounder than a card, a badge
never rounder than a control. A scale that steps up by half again from a 10px control reaches 23px
panes, rounder than anything the brand draws. That is how two different brands came out looking alike.

**Radius as a signal.** Decide what the radii mean and write it down. One proven rule: "if it is a
pill, you can press it", so only buttons, chips, segmented controls and switches are pills, and
people learn the shape. It is the default for `radius-action` when `press` is not measured, and a
measured press wins over it.

**The shell's form is the brand's.** By default the rail meets the window edge, square, with a line
on its inner side only. It floats (8px in from the edges, rounded with the pane radius, lined all
round, the drawer the same) only when the brand's own product or site draws floating panels.
Its edge takes `rail-edge`: the rail's own line where the rail stands well apart from the page, the
page's hairline where the two sit close (a black rail on a near-black dark canvas). Sheets are attached
to a window edge too, so they take the same form; dialogs, popovers and menus
float over the page and keep their own corners. `shape.shell` records which, with its source.

**Lists sit concentric.** A menu, select or listbox holds its items 4px in, so its corner
(`radius-list`) is the control's plus 4px, never rounder than a card. A 16px panel round 6px items
reads as a pill under a field.

**Carry one of the brand's own shape moves.** Name the shapes only this brand makes (a texture, an
edge, a mark it repeats) and carry at least one into the product where it suits: a website hero, an
app welcome, an email header. Never behind a list, a form or a table, where it is noise. Use the
brand's own file. A move that has no file in the brand's material is a question for the brand's team,
not something to draw. Lay a texture on a layer behind the words (a `::before` multiplied over the band's
own colour), never as the band's background image: the detector reads past a background image to the
page behind it, and reported black words on a green band as 1.1:1 in dark when they were 8:1. Set its
strength so the darkest mark under the words still clears 4.5:1: a full-strength fleck beside a full stop
reads as punctuation.

To carry a texture, copy the brand's file into `product/textures/` and name it on the move with its
kind and strength. Use a JPEG or WebP at about twice the largest size it is drawn, a few hundred KB
at most. `tokens.css` and the starter's `globals.css` then define `.brand-texture`, which lays the
file on a `::before` multiplied over the element's own colour at that strength, under its content.
`$A product bundle` installs the file beside every copy of `tokens.css`, and `$A product starter`
copies it into the starter's `textures/`, where `globals.css` finds it. The starter stops, writing
nothing, when the file is missing. Put the class on the band that carries the move, with the band's
own background colour, never on a list, a form or a table. The class positions the band (relative)
to hold its layer, so give a band positioned any other way a wrapper instead.

**The kit's choices are listed.** `$A product audit` and every round record list each shape and shell
choice the brand did not make, with how the kit made it. Measure what you can; never present the
rest as the brand's.

**Spacing aligned to the code.** A 4px scale whose names match Tailwind's, so `p-5` in code is
`space-5` in a design. A brand scale where `space-5` means 24px makes every handover a translation.

**Controls:** 32, 36 and 44px, growing to 40, 44 and 48 on touch.

**A mark for narrow places.** The icons-only rail is 72px wide, too narrow for most full logos at their
minimum. With a symbol, it shows the symbol in the rail's rendition; without one, a plain Home control,
never a full logo cut by the edge. Ask the brand for a symbol ("Worth fixing in the brand repo").
A symbol has a size of its own, 24px or its own minimum (`symbolMinHeight`), never the full logo's,
which a wide logo's minimum can raise past what the rail's 40px home square holds. A mark more than
1.5 times as wide as it is tall (a signature, a wordmark) is not a symbol. The starter leaves it out,
says why in `lib/brand.ts`, and the rail shows its Home control. A signature 2.38 times its height,
named as the symbol, was drawn 107px wide in the 72px rail.

**The wordmark at small sizes.** Brand logo files carry clear space inside the viewBox, so at 20px
tall the letters can end up 9px tall. The product uses tight-viewBox copies, and the clear-space rule
is applied by layout instead.

**Icons:** one set, one stroke, sizes set per context. Never mix sets; never use emoji as icons.

**Characters and illustration**, when the brand has them: they mark states (welcome, working, done,
all caught up, nothing found, could not load), one per screen, never in dense working views, always
decorative (`alt=""`), with the words beside them carrying the meaning. A brand character is never
the person's mistake. A pose drawn in one dark ink (a black line drawing) is drawn in `currentColor`
by the starter. It takes the text colour and reads on a dark ground, where a brand's black drawings
vanished before. A pose in a colour, or in several, keeps its colours, so keep it off dark
grounds unless the brand supplies one drawn for them, and say so in the system.

## Words

**The dial.** Warm in greetings, first runs and finishes; plain on working screens; straight and
calm on errors, money, permissions and deleting. Never a joke in an error, a confirmation or anything
about money.

**State, meaning, next step.** A marketing copy formula (name the problem, validate it, bring the fix,
show how, invite action) compresses on screen to three beats: what is happening, what it means, what
to do. Most status copy is two short sentences and a button.

**Digits in the interface.** A brand's prose rule of spelling out one to nine stays in emails and
long help; interfaces use digits, because people scan.

**The product's banned words** go on top of the brand's: words that promise rather than inform
(seamless, robust, powerful, effortless, easy, simply), and interface clichés ("Something went
wrong", "Are you sure?", "Invalid", "Submit", "Click here", "Success!").

## Code

Note what the brand repo ships and what the product had to add: a token format the stack cannot use
(a Tailwind 3 preset when the starter is Tailwind 4), no status or chart colours, a marketing type
scale, logo files with clear space baked in. These go in "Worth fixing in the brand repo".

## The section's shape

The "From brand book to product" section has these parts, each a short list of decisions with
reasons:

1. What carries straight over.
2. Colour.
3. Type.
4. Shape, space and marks.
5. Words.
6. Code.
7. Characters and imagery (only when the brand has them).
8. Worth fixing in the brand repo.
