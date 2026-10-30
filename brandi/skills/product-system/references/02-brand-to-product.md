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
| `directions` | Roles a concept board moves, for the person to pick from: `[{ "name", "roles", "note" }]`, each solved and audited as the system with its roles over these, and drawn by a class (`06-canvas.md`, Directions) | None |
| `displayForTitles` | Whether the display face sets page titles | `true` |
| `displayCase` | `"upper"` when the brand only ever sets its display face in capitals: the hero, display and title styles take capitals, tracked open a little | Unset: the face's own case |
| `time` | How the brand writes a time, `{ "minutes": ":" or ".", "onTheHour": "keep" or "drop", "space": true or false }`. "11am to 10.30pm" is `{ ".", "drop", false }`. Every time the system writes follows it | 9:30 am: minutes kept, a space before am or pm |
| `charts.avoid` | Colours the brand keeps off one theme's grounds, `{ "light": [...], "dark": [...] }`: no chart series takes them or their hue, in either theme, since a series keeps its hue in both | None |
| `brandColours` | The brand book's named colours, emitted as `brand-*`: a list, `[{ "name": "green", "hex": "#2E7D32" }]`, or a map, `{ "green": "#2E7D32" }`. Names are lower case words joined by hyphens, since each becomes a CSS variable | The primary and accents |
| `shape.families` | Each family's radius, measured from the brand's own work, with its source: `press`, `control`, `card`, `pane`, `frame` (Shape, below) | Derived from the brand's scale, never rounder than the largest radius measured, and listed as the kit's |
| `shape.action` | Whatever a person can press, when `press` is not measured: `"pill"`, `"control"` (buttons match the inputs) or a value | The pill, listed as the kit's |
| `shape.shell` | The rail's form, `{ "form": "edge" or "floating", "source" }` | `edge`: the rail meets the window edge, square, listed as the kit's |
| `shape.moves` | The brand's own shape moves the product carries, `[{ "name", "source", "where" }]`. A texture names its file too: `"file": "textures/paper.jpg", "kind": "texture", "strength": 0.3` (Shape, below) | None, and every round record says so |
| `fonts` | The faces the system ships as files, `[{ "family", "file": "fonts/<name>.woff2", "weight": "400" or "300 900", "style" }]`, each file in `product/fonts/` (Type, below) | None: every face is hosted, and boards link Google Fonts for it |

**A role is one colour or two.** Each of the seven roles takes the forms a direction's role takes: a
hex, one of the brand's colours by name (`acme-green` or `brand-acme-green`), or `{ "light", "dark" }`
of those with either left out. One colour is both themes, and it is audited in both. That suits a
highlight, which means the same at night, and a black rail, which already sits back. A rail in a
colour needs a dark value of its own, in its hue at the dark surfaces' lightness: decided once, it
stays put while the dark primary steps lighter, and becomes the brightest large surface on the dark
canvas (Westhaven's WH Blue on #111111). A step darker is not enough: Westhaven's #002E4D still stood
1.26:1 above the surface and read as unchanged; #051F33, at 1.05:1, read as dark mode. The audit warns
at 1.2:1 or more. One colour rarely suits a canvas, an ink or a
primary, which a dark theme needs its own of: the audit fails the theme the value cannot serve, and
`$A product tokens` exits 1. Any other key under `roles` is refused by name, and so is a value in any
other form. A run wrote `"rail": "#1B5D40"` before roles took one colour, and the rail stayed the
surface with no word said.

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

**A series is one hue in both themes.** The hues are chosen once, and only each series' lightness
moves to clear 3:1 on each theme's card, so a legend means the same colour at night. Chosen per
theme, a seventh build's series-3 was an ochre in light and a teal in dark. Two hues never become a
series: one the brand bars from either theme's grounds (`charts.avoid`), since a series barred from
one theme would have to change colour there, and one within 25 degrees of the assistant's violet
(the gap the series keep from each other), where a chart line read as something the assistant
made. A brand whose own colour sits on that violet keeps it out of the chart for the same reason.
Losing the violets costs some colour-vision separation from greens and teals, so more neighbours
get the audit's warning: label those lines directly.

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
give up the rail. A black or grey rail keeps neutral words: the hue and chroma of the page's own text,
solved to the same 7:1 and 4.5:1. Tinted in the brand's hue instead, a black rail's words came out a
pale green beside a vivid green brand.

**Neutrals the brand names in words.** A record that speaks of "sand neutrals" and leaves its
neutral hue as the primary gives a green grey, not sand. `$A product tokens` says so under "To ask
the brand", naming the word. Ask for the value and set `identity.colour.neutralHue`, or record the
gap as an open question: never pick a sand yourself.

**A rail's states step away from its words.** The hovered and selected items step lighter on a dark
rail and darker on a light one, so a black rail's current page shows. On a mid-tone rail that step
went towards the words and took them under their floor: a mid green's selected item held its light
words at 4.06:1, and two runs changed the brand's rail to get past it. Where the step would cost the
words their 4.5:1, the states step the other way. A rail too close to mid-grey to carry words at all
fails on the rail itself, and the audit says so: that one is the person's call.

**The rail's logo follows the rail.** The rail and the top bar draw the logo made for the rail's
ground: the one for dark grounds on a rail darker than its words, the one for light grounds
otherwise, worked out for each theme. `tokens.css` and `globals.css` set it as two variables,
`--rail-mark-on-light` and `--rail-mark-on-dark`, so a direction whose class recolours the rail
moves the mark with it (`06-canvas.md`, Directions).

**Every pair measured.** Each token declares what it sits on, and the audit measures every one of
those pairs in both themes, including washes laid over their surface. The last system checked 162
pairs; the engine's default set checks more.

## Type

**The display face, sparingly.** In a product, a display face earns at most three places: the page
title, a greeting or full-page headline, and the sign-in hero. One display moment per screen. Set
`font-synthesis: none` so the browser never fakes a bold or italic the face does not have, and never
use a face with old-style figures for numbers. If the display face cannot sit at 26px in a page
header, set `displayForTitles: false` and titles use the body face, bold. A brand with one family
needs neither: its display face is its body face, so titles take the headings' 700 rather than a
display face's 400 (at 400 a one-family brand's every title read Regular). Numerals stay out of a
display face the brand never sets them in: a generated board's part number sits under its heading,
in the body face.

**The body face for everything else**, sized for density: body 14/20 at every width including
phones, body-lg 16/24 for reading (answers, notes, help), labels at 500, headings at 700, tabular
figures for every number (`kpi` and `kpi-sm`). Record the 14px body on phones as a deviation, with
the reason: interface text is labels and values, and 16px pushes a third of a list below the fold.

**A surface people read in takes the reading floor.** A participant portal, a customer's own pages
or an email is read, not worked in, and its readers may have low vision or read slowly. There
nothing is under 16/24: Root's `reading` on a board, `data-reading` on the product's own layout,
and every interface style below body-lg (heading-sm, body, label, meta, caption, eyebrow) reads at
16/24, components included, and a list row's lines wrap rather than cut off. Westhaven's portal set its own text at 16px and every component's meta and
labels stayed at 13 to 14px, which the craft review found on every portal board.

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

A face Google Fonts hosts has no file in the brand's material, and `$A product fonts` fetches it. For
each face the product's type names with no file in `product/fonts/`, it writes the woff2 Google serves,
in the latin subset (`--subset latin,latin-ext` adds others, each its own file). A face with a weight
axis comes whole. Any other comes in the weights the type sets, and italics come only where the type
sets them. The licence file from the family's download goes beside them. Each file joins product.json's
`fonts` with a `licence`: its name, its file and where it came from. A weight the type sets that the
face lacks is named.

A face Google does not host is the brand's to supply, files and licence both, and the command records
an open question for it. With no network it says what is missing and gives the stylesheet address to
open by hand. Run it in Translate, before `$A product tokens`. The tokens write an `@font-face` for each
file product.json lists, and the starter, the bundle and the canvas copy the files from `product/fonts/`.

## Shape, space and marks

**Measure the brand's shapes before choosing any.** A product drifts towards the kit's look unless its
shapes come from the brand. Measure each family from the brand's own work and record where. Measure a
drawn shape in a PDF from its path, and a live site from its computed style. Never take a shape from
another brand, however good it looks.

**Which source wins.** Three kinds of value can speak for a family. They rank in this order:

1. What the guidelines state or draw: a rule ("buttons take 4px corners"), or a shape on their pages
   measured from its path.
2. The brand's live work (website, app, signage), for a family the guidelines say nothing about.
3. A decision the brand pass made to fill a gap: the shape stance (`identity.shape`) and the radius
   scale it gives, or a record such as "controls take radius-md". It came from a scale, not a source.
   It stands only where the guidelines and the live work both say nothing.

One brand's record set controls at 10px and cards at 15px from its scale. Its guidelines drew cards
with 12pt corners (16px), and its website's fields were 6px. The cards took 16px and the controls 6px.
`$A product tokens` keeps the same order: a family in product.json wins, and the scale fills only what
is left, listed as the kit's.

On route A, brand.json tells the three apart. Each evidence record names the field it supports
(`"field": "identity.shape"`) and its `provenance`. `supplied` (the brand said it: guidelines, a
brief), `extracted` (measured from a real artefact, such as the guidelines' paths) and `published`
(from its own channels, such as its website) are sources. `decided` and `assumed` fill gaps. A record
in `governance.decisions` is a choice, never a source. Where its rationale cites evidence, take the
value from that evidence: the figure the decision derived from it is a gap-fill. Each family's
`source` in product.json says which kind it is, and a family or a shell the run decided itself
carries `"filled": true` beside its source: the shape board then says "Filled by the run, not the
brand's", and the round record lists it with the kit's choices. A run's own shell and button radius
once printed after "The brand's:" on the shape board.

The one family the scale does not fill is press. With no measured press and no `shape.action`, the
kit's pill stands, listed as the kit's ("if it is a pill, you can press it"). Where the brand's
buttons match its inputs, set `"action": "control"`; where they take a radius of their own, measure
press.

**Reading the live work.** `$A product measure --url <site>` reads a live site in the installed
Chrome. It suggests each family and the shell with its source, counting only the brand's own text
buttons, not app-store badges or icons. One page can mislead: one site's buttons were 6px on its home
page, 10px on its contact page and 7px on its locations page. Give `--url` once for each page, or
`--follow <n>` to take n more of the first page's links.

Taking the first four navigation links once measured four menu pages and no form field. So
`--follow` gives one place to a page likely to hold a form: its link or path says contact, enquiries,
careers, sign up, log in, catering, franchise or the like. The rest go one page per section of the
site in turn, grouped by the first part of the path. It prints each page it took and why.

Each page votes once per family with its own most common radius, and the family takes what most pages
agree on. Counted by element, one page repeating a 7px link 111 times outvoted every other page's 6px.
A tie goes to the page measured first among the tied: the `--url` pages in the order given, then the
followed ones. The source line keeps each page's own radius.

When no page shows a form field, the command says so: give `--url` a contact, careers or sign-up page.
A form embedded from another site sits in a frame the page cannot read, and the command names the
frame rather than reporting no fields.

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

## Motion

**The product moves like the brand.** A brand's motion signature is its own move: a name, what moves,
a duration and a curve (Settle: content rises 8px into place over 240ms on
`cubic-bezier(0.2, 0, 0, 1)`). `$A product tokens` reads it into the product's motion tokens, so
the product's sheets and menus arrive the way the brand's pages do. The tokens once carried the
kit's motion for every brand and read no signature.

**Where the signature lives.** On route A it is `identity.motionSignature` in `brand/brand.json`,
and nowhere else. The system and the brand's own `tokens.json` and `tokens.css` carry the motion
stance's durations and Brandi's four curves, which are the same for every brand at a stance, not the
signature. On route B, write it into the input file as `motionSignature`, in the same form:
`{ "name", "description", "durationMs", "easing" }`, from the guidelines or the live site. A brand
that names none keeps the kit's motion, and the tokens say so.

**How it maps.**

| Product token | The kit's value | What it times | From the signature |
| --- | --- | --- | --- |
| `ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Every transition | Its curve |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving | Never: something leaving accelerates away, and a signature's curve says how things arrive |
| `duration-fast` | 120ms | Hover, press, focus | Its duration, when under 150ms |
| `duration-base` | 180ms | Menus, tabs and toggles | Its duration, from 150ms up to 220ms |
| `duration-slow` | 260ms | Sheets and dialogs | Its duration, from 220ms, and 400ms at most |
| `duration-scene` | 1250ms | A character scene | Never: a signature times the interface |

The duration sets the one job whose kit value is nearest it, and a tie goes to the slower job. The
other durations stay the kit's, so the product keeps a fast, a middle and a slow step.

**Feedback stays quick.** A signature's duration is how long the brand's own move takes, usually
an arrival, and it is rarely a speed for a control's feedback. A hover, press or focus that answers
in 240ms reads as lag, so a signature of 150ms or more never sets `duration-fast`. Settle's 240ms
sets `duration-slow` instead: a sheet or dialog arriving is the job nearest the brand's own
arrival. A signature over 400ms (a slow hero reveal) sets `duration-slow` held to 400ms, past
which a sheet keeps a person waiting in the middle of a task. The held value is recorded as the
kit's, with the brand's figure beside it.

**Whose each value is.** Each duration and curve says where it came from, as a radius does: `source`
for the brand's (the signature's name, the field and the file), `derived` for the kit's (how it
chose). `$A product tokens` prints the six under "Motion", each the brand's or the kit's. A curve
CSS cannot draw (anything but `cubic-bezier(x1, y1, x2, y2)` with both x values from 0 to 1, or a
keyword such as `ease-out`), a duration that is not a number of milliseconds above 0, or a field a
signature does not hold (`duration` for `durationMs`, which would leave the kit's motion with no
word said), stops the run with the reason. Fix it in the brand file or the input file, where the
signature lives.

**The stance is not read.** `identity.motion` (still, restrained, fluid, lively) scales Brandi's
durations for the brand's own surfaces. A working screen keeps its short, calm steps whatever the
stance, and reduced motion still keeps fades and drops movement. A brand that wants its product to
move differently names a signature.

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
4. Shape, space and marks, and motion: whose each duration and curve is.
5. Words.
6. Code.
7. Characters and imagery (only when the brand has them).
8. Worth fixing in the brand repo.
