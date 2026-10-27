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
| `brandColours` | The brand book's named colours, emitted as `brand-*` | The primary and accents |

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
darker series. The audit reports neighbours that collapse under a colour-vision deficiency: label
those lines directly, or reorder.

**Two full themes.** Light is the default. Dark is a theme of its own, not an inversion and not a
per-screen choice: in the last system's first build, dark mode lost its hierarchy (the rail sat at
1.05:1 on the canvas) until dark got its own values. The engine solves every role separately for
each theme.

**A text hierarchy with a floor.** `text-strong` for titles and figures, `text` for body, `text-muted`
for supporting copy, `text-subtle` for meta and placeholders, and nothing quieter than `text-subtle`
(4.5:1 on every ground it sits on). On selected rows, quiet text switches to `text-muted`.

**Every pair measured.** Each token declares what it sits on, and the audit measures every one of
those pairs in both themes, including washes laid over their surface. The last system checked 162
pairs; the engine's default set checks more.

## Type

**The display face, sparingly.** In a product, a display face earns at most three places: the page
title, a greeting or full-page headline, and the sign-in hero. One display moment per screen. Set
`font-synthesis: none` so the browser never fakes a bold or italic the face does not have, and never
use a face with old-style figures for numbers. If the display face cannot sit at 26px in a page
header, set `displayForTitles: false` and titles use the body face, bold.

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

## Shape, space and marks

**Radius as a signal.** Decide what the radii mean and write it down. One proven rule: "if it is a
pill, you can press it", so only buttons, chips, segmented controls and switches are pills, and
people learn the shape. Radii come from the brand's shape stance, renamed for product jobs (`radius-sm`
for badges, `radius-control` for inputs, `radius-md` for cards, `radius-lg` for panes and dialogs).

**Spacing aligned to the code.** A 4px scale whose names match Tailwind's, so `p-5` in code is
`space-5` in a design. A brand scale where `space-5` means 24px makes every handover a translation.

**Controls:** 32, 36 and 44px, growing to 40, 44 and 48 on touch.

**The wordmark at small sizes.** Brand logo files carry clear space inside the viewBox, so at 20px
tall the letters can end up 9px tall. The product uses tight-viewBox copies, and the clear-space rule
is applied by layout instead.

**Icons:** one set, one stroke, sizes set per context. Never mix sets; never use emoji as icons.

**Characters and illustration**, when the brand has them: they mark states (welcome, working, done,
all caught up, nothing found, could not load), one per screen, never in dense working views, always
decorative (`alt=""`), with the words beside them carrying the meaning. A brand character is never
the person's mistake.

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
