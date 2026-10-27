# The production starter

Every product on the system ships on one stack: Next.js with the App Router, Tailwind CSS 4 and
shadcn/ui on Radix, in TypeScript strict. The starter is that stack already dressed in the system's
tokens. It carries the shell, the page-level states, the composites the patterns need, and a small
working example product.

A product starts from it. Nobody restyles shadcn by hand, and nobody hard-codes a colour, radius or
shadow the tokens already name.

The starter ships inside the Design System artifact, under `project/starter/`
(`12-design-system-artifact.md`).

Three framing decisions, made once here so no project argues them again:

1. **One implementation, built twice.** The starter's components are the system's components. The
   product ships them, and `tools/build-canvas.mjs` builds the canvas bundle from the same files,
   so a board on the canvas shows exactly what production renders (`05-components.md`).
2. **One generator writes `globals.css`.** The skill runs it and the starter ships a copy, so the
   system and every product regenerate the same file the same way. The canvas bundle's stylesheet
   is that same `globals.css`, compiled.
3. **The kit carries shadcn already patched.** The primitives are vendored from shadcn's registry by
   a script that makes the mechanical changes every one needs, and the per-component patches in
   section 3 are edits marked in the file, which a re-vendor leaves alone. Nobody patches a
   component in a product: a product that re-adds a component copies the kit's version back.

Versions live in the kit's `package.json`, pinned exactly and tested together (section 8).

## 1. What is in it

### Generated, hand-written and example

| Kind | What | How it changes |
| --- | --- | --- |
| Generated | `app/globals.css`, `app/fonts.ts`, `system/tokens.json`, `system/system.json`, `lib/format-locale.js`, `lib/product.ts`, `tools/build-globals.mjs` and `components/system/index.ts` | `$A product starter` rewrites them on every run. A hand edit is undone by the next run |
| Generated until taken over | `PRODUCT.md` and `DESIGN.md` | Rewritten while they end on the generated marker, kept once it is deleted (section 7) |
| Generated from the brand's files | `lib/brand.ts` | Its types stay; its `BRAND` comes from the marks product.json's `brand` block names, or from brand.json's logo master. Without either, the kit's placeholder mark stays and the starter says so |
| Kit | `components/ui/` (shadcn, patched), `components/system/` (the system's components and their definitions), `lib/`, `hooks/`, `canvas/` and `tools/` | Copied on the first run, then the product's. `$A product starter --kit` copies them again |
| Example | The example product's routes and sample data | A real product replaces it |

A few things are the product's own to set: its name and locale in `product/product.json` (which
`$A product starter` writes into `lib/product.ts` and `lib/format-locale.js`), the font files, and the
characters, illustrations and favicon under `public/`.

The marks go in product.json's `brand` block, paths relative to `product/`:

```json
"brand": {
  "name": "Acme",
  "marks": { "full": "assets/logo/full.svg", "full-on-dark": "assets/logo/reversed.svg", "full-ink": "assets/logo/black.svg", "symbol": "assets/logo/symbol.svg" },
  "logo": { "height": 24, "minHeight": 16, "clearSpace": 0.5 },
  "character": { "name": "[Character]", "poses": { "welcome": "assets/characters/wave.svg", "working": "assets/characters/working.png" } }
}
```

Each SVG is inlined after a safety pass: no scripts, handlers or outside references, and no fixed
size. An `-ink` rendition is turned to `currentColor` whatever its file's ink. A still (PNG, WebP) is
copied to `public/brand/`. On route A with no block, the logo master in brand.json supplies `full`,
`full-on-dark` (the reversed master) and `full-ink`, the clear space and the minimum size. A value
the record lacks keeps the kit default, and the file says which. The tight-viewBox wordmark files ship in
`public/brand/`, for email and Open Graph.

The example product shows the patterns working end to end. Home has figures and a chart. A records
page has search and filters in the URL, bulk actions on the rows on screen, and an export. One
record has tabs, a decision and Undo. One page's outside source is down. Then Settings, Help, and a
kit page with every control.

To run it, copy its `app/(app)`, `components` and `lib` folders into the app.

### The layout

```
starter/
  app/
    globals.css               generated from tokens.json
    fonts.ts                  generated: the brand's faces through next/font
    layout.tsx                locale, theme, tooltips, toasts, route focus, the title template
    loading.tsx, error.tsx, not-found.tsx
  components/
    ui/                       shadcn, patched (section 3)
    system/                   the system's components, each with its definition
  canvas/
    entry.tsx, root.tsx       what the canvas bundle exports, and the board provider
    shims/                    React and ReactDOM resolved to the page's copy
  hooks/
    use-mobile.ts, use-shortcuts.ts
  lib/
    format.js, format.d.ts    the one number formatter, shared by both builds
    format-locale.js          generated: the market's locale and currency
    icons.ts                  the icon vocabulary
    link.tsx                  plain <a> on a board, next/link in the product
    product.ts                generated: the product's name and language
    brand.ts                  the brand's marks and character
  system/
    tokens.json, system.json  generated: the tokens, and the namespace and global
  tools/
    build-globals.mjs         the generator, shipped
    build-canvas.mjs          the canvas bundle, from these components
    build-index.mjs           components/system/index.ts
    check-components.mjs      every definition's scripted checks, in Chrome
    axe-pages.mjs             axe on a list of pages
  public/brand/               the wordmark as files
```

`app/fonts.ts` sets the variables the generated theme reads: `--font-brand-sans`,
`--font-brand-display` and `--font-brand-mono`. A face the system ships as a file loads through
next/font/local, a hosted face through next/font/google, each with only the weights the type styles
use. Load upright styles only, unless a product really needs italics. An italic file nobody uses is
a wasted preload.

### How the tokens become `globals.css`

One generator, used in two places, so the two cannot drift. The skill runs it:

```
$A product globals --tokens product/tokens.json --out product/globals.css
```

The starter ships the same file as `tools/build-globals.mjs` (copied as it is: it uses Node's
built-ins and nothing else), so a product regenerates `app/globals.css` from a newer `tokens.json`
without the skill, and CI checks it has not drifted:

```
node tools/build-globals.mjs tokens.json app/globals.css
node tools/build-globals.mjs tokens.json app/globals.css --check
```

`--check` writes nothing and exits 1 when the file differs from what the tokens produce. Never edit
a value in `globals.css`. The next run silently undoes it, and the check fails until it is
regenerated (`09-operate.md`).

It writes seven parts, in this order:

1. **Imports and the dark variant.** Tailwind, tw-animate-css and shadcn's Tailwind layer. Dark
   follows a `.dark` class (next-themes) or `data-theme="dark"` (the canvas), so the product and a
   canvas agree.
2. **The tokens.** Every colour in light. In dark, every colour whose value differs, plus every
   alias: an alias has to resolve inside the dark scope, or it picks up the light value. Shadows per
   theme. Spacing, radius, size, z-index, duration, easing and opacity once.
3. **shadcn's variables, pointed at roles.** They are declared on every theme scope, so a nested
   dark region resolves its own values. This is why a copied shadcn example still lands on brand.
4. **A Tailwind theme with only the system in it.** `--color-*: initial` removes Tailwind's
   palette, then each role becomes a utility. `brand-*` values stay CSS variables, so nobody writes
   a brand colour as text. Radii and shadows reset too, keeping the larger radius names so later
   components still have corners. `max-w-measure` caps prose and `max-w-content` caps reading
   pages. Breakpoints stay Tailwind's: 640, 1024, 1280 and 1536.
5. **Type styles as `type-*` utilities**, used instead of stacking size, weight and leading
   classes. The display face gets `font-synthesis: none`, the figure styles get tabular figures,
   and the eyebrow is uppercase.
6. **Base styles.** Borders and the outline colour from the tokens, the body style, the focus
   outline (section 3), and selection in the highlight. The pointer cursor on anything pressable,
   `not-allowed` on disabled, `progress` on busy. Reduced motion keeps fades, zeroes
   tw-animate-css's movement variables, stops skeleton pulses and slows spinners rather than
   stopping them. `appear-late` holds a skeleton back 800ms, so a fast page never flashes one.
7. **Forced colours, unlayered**, so they win over every utility. Focus becomes a `CanvasText`
   outline. The current or chosen thing is outlined in `Highlight`: the page in the rail, the open
   tab, a selected row, a pressed chip, the menu option in hand. When it also has focus, the line
   doubles. Switches, progress, highlight counts, chart text and the wordmark move to system
   colours.

| shadcn variable | Role |
| --- | --- |
| `background`, `foreground` | `canvas`, `text` |
| `card`, `popover` | `surface`, `surface-raised`, each with `text` on it |
| `primary-foreground` | `on-primary` (`primary` is a role of its own) |
| `secondary`, `muted`, `accent` | `surface-sunken` |
| `secondary-foreground`, `accent-foreground`, `muted-foreground` | `text-strong`, `text-strong`, `text-muted` |
| `destructive`, `destructive-foreground` | `danger-solid`, `on-danger` |
| `border`, `input`, `ring` | `line`, `line-control`, `focus` |
| `chart-1` to `chart-6` | `series-1` to `series-6` |
| `sidebar` and its parts | `rail`, `rail-text`, `brand`, `on-brand`, `rail-selected`, `rail-text-strong`, `rail-line`, `rail-focus` |

The generator refuses to run when the tokens lack a role this table needs, and names the missing
ones.

## 2. Starting a product

The system's Building it section carries these steps (`04-written-system.md`). The fresh-install
check runs them on an empty folder before every publish (section 6).

```
$A product starter
cd product/starter && npm install
$A product bundle
npm run typecheck && npm run build
```

1. `$A product starter` copies the kit and writes the generated files from the system. A second run
   rewrites only those, so a product's own work survives.
2. `npm install` installs the pinned stack. Nothing outside the starter's folder changes.
3. `$A product bundle` builds the canvas bundle from the starter's components and writes every
   card. It needs the install, because it uses the starter's own esbuild and Tailwind.
4. The type check and the build pass with no changes, and `next dev` shows no warnings.
5. Pages go in a route group whose layout holds the shell, `app/(app)/layout.tsx`, so the rail stays
   mounted between pages. Sign-in, and anything else without the rail, lives outside the group.

The kit vendors 41 primitives from shadcn's registry: accordion, alert, avatar, badge, breadcrumb,
button, button-group, calendar, card, checkbox, collapsible, command, dialog, dropdown-menu, empty,
field, hover-card, input, input-group, item, kbd, label, native-select, pagination, popover,
progress, radio-group, scroll-area, select, separator, sheet, skeleton, sonner, spinner, switch,
table, tabs, textarea, toggle, toggle-group and tooltip. The vendoring script, kept with the kit,
rewrites the registry's imports, swaps its icon placeholders for Lucide, takes out the classes that
hide the system's focus outline, and converts each wrapper to `React.forwardRef`, because the canvas
runs React 18, which drops a ref passed any other way.

## 3. The patches

Each patch brings a stock component into line with the system: a rule it broke, a check it failed,
or a card it didn't match. The generator applies them. A product never edits them in place.

### Focus, in every component

The ring is the outline the generated base styles draw on `:focus-visible`: the `focus` colour at
the token's width and offset (`03-fundamentals-first.md`). An outline follows the radius and
survives forced colours, where it turns `CanvasText`. It can still be clipped. Inside anything that
scrolls or clips, draw focus inside the element, as the line tabs do.

So the patch takes out whatever would hide it. Stock shadcn components set `outline-none` and draw
a box-shadow ring of their own. Tailwind's utilities beat base styles, so `outline-none`, left in,
cancels the outline everywhere except forced colours, and the ring draws a second indicator on top.
(That is how shadcn and Tailwind behave in general, not a finding from the last build.)

A few components draw focus their own way on purpose, and the table lists each. Inputs show a 2px
edge, menu options and line tabs draw it inside themselves, toasts use their own text colour, and
the rail uses its own focus colour.

Never leave a transparent outline on an element at rest. Forced colours paint it, and every control
wears a box. The last system drew a box-shadow ring, with Tailwind's `outline-hidden` (a transparent
outline only forced colours paint) for High Contrast. That held only while `outline-none` kept it
off at rest. Review still found an outline showing at rest in forced colours, and a title's ring
clipped.

### Component by component

| Component | Change | Why |
| --- | --- | --- |
| input, textarea, select trigger | Border in `line-control`. A 2px focus edge: the border in `focus` plus a 1px ring. A danger edge that stays danger when focused. 44px tall on touch screens. 16px text on phones and touch screens, 14px on a desktop | The edge holds 3:1 against the surface, at rest and focused (WCAG 1.4.11). iOS zooms into any field set smaller than 16px |
| checkbox, switch | A box bordered in `line-control`, and the switch's off track in `line-control`. A 44px hit area on touch | The off state has to be visible |
| dropdown-menu, select, command | The option in hand gets the hover tint and a 1px inset edge in `line-control`, plus a 2px inset ring in `focus` from the keyboard. Options 36px tall, 44 on touch. Destructive options in danger text. Give `SelectContent` an `aria-labelledby` with its label's id, so the open list is named | Round three measured keyboard focus on the stock option, a tint alone, at 1.14:1 (a P1). The edge holds 3:1, and forced colours outline the option in `Highlight` |
| sidebar, with `hooks/use-mobile.ts` | The drawer threshold is the system's tablet breakpoint, read from the media query, false on the server. Rail, icon and drawer widths from the system. The drawer is a dialog named "Navigation" that gives focus back to the menu button. Cmd or Ctrl B is ignored while typing. Rows 36px, 44 on touch. Eyebrow group labels and an `attention` badge in the highlight | The system's rail. shadcn's own hook switches at a narrower width (general knowledge). The drawer opens from a button outside it, so Radix has no trigger to return focus to |
| button | The system's shape (pills, where the radius rule says a pill is pressable). Variants: `default` (the one primary per view), `outline` and `secondary`, `ghost`, `brand`, `destructive` (tinted, in flow), `destructive-solid` (only a destructive dialog's final confirm) and `link`. `loading` keeps the width, shows a spinner, sets `aria-busy` and `aria-disabled`, and ignores presses. A client component, with touch sizes | One primary per view. A loading button must block a second press without dropping keyboard focus, which `disabled` would do |
| badge | Gentle corners, the status tones, an optional `dot` | Badges are read, not pressed |
| avatar | Initials in bold on a tag tint, in the strong text colour, sized to the circle. Always with the name nearby | Matches the Avatar card |
| kbd | The system's key style, a rail variant, hidden on touch screens. The command menu's shortcuts use it | One key style everywhere, and no hand-styled `kbd` in product code |
| alert | The status tones. Only danger and warning interrupt (`role="alert"`). The rest are `role="status"`. An alert already showing when the page loads, such as a source that is down, takes `role="status"` too. `AlertAction` sits in the grid: under the text on phones, beside it from 640px | Only news interrupts. shadcn's action floats over the text once it is wider than an icon |
| card | `radius-md`, a hairline, `shadow-sm`. `CardTitle` is an `h2`, with `as` for `h3` and `h4` | A real outline under the page's one `h1` |
| label, field | The label in `text-strong`. Errors in danger text with an icon, announced, without turning the whole field red. Hints in the meta style | The label stays readable when there is an error |
| tabs | Underline by default: a full-width row on a hairline, tabs flush with the title, the active one underlined in `primary`. Focus drawn inside the tab. The panel has its own focus ring | A grey pill row reads as a segmented control. The row scrolls sideways, which clips anything drawn outside a tab |
| dialog, sheet | The scrim token, `radius-lg`, `shadow-xl`, and the sheet inset like the rail. On phones a dialog rises from the bottom, full width, with its buttons stacked in reading order and clear of the safe area | Within reach of a thumb, in the system's material |
| command, input-group | A tall search row with a 2px focus edge, eyebrow group labels, the active result in the hover tint with a control edge, and a foot of key hints. On touch the hints hide and a close button shows. Opens near the top on every screen. Gives focus back to whatever had it | The phone keyboard takes the bottom half. Opened from a shortcut, the dialog has no trigger for Radix to return focus to |
| tooltip | On `surface-inverse`, small and medium weight | Matches the Tooltip card |
| sonner | Not used: the layout mounts the system's ToastRegion. Sonner pauses on hover but never on focus, which WCAG 2.2.1 needs, so ToastRegion keeps its own clocks: bottom centre, clear of the phone action bar, 5 seconds or 8 with Undo, paused by hover, focus, Alt T or a hidden page, Undo 44px on touch | Sonner could not pause on focus without a fork. Undo is never the only way back from a bulk action |
| table | The head on `surface-subtle` in the eyebrow style, rows at the system's row height, tabular figures | Matches the DataTable card |
| progress | Passes `value` through to Radix | Upstream dropped it, so screen readers heard an empty bar |
| skeleton | Token colours, and no shimmer under reduced motion | Matches the Skeleton card |

## 4. The composites

Hand-written, in `components/<namespace>/`. Each matches a card in the system, and the card is the
spec: its README says what the component must do, and its preview shows it in both themes. Where a
product needs something the starter has no composite for, the card is still the spec.

### The app shell

`AppShell` is the frame every page sits in. It lives in the route group's layout, so it stays
mounted between pages.

It takes the product's name, the navigation as labelled sections of links, the footer links and a
name for their list, and the signed-in person. It also takes the command menu's actions, and
`onAsk`, which wires the product's assistant. With no `onAsk` there is no Ask group and no AskBar.

It renders, in order:

1. A skip link to `#main`.
2. The rail, whose whole contents are the Main navigation landmark: lockup, search-or-ask button,
   groups, footer and account.
3. Under 1024px, a top bar with the menu button and the lockup.
4. `<main id="main" tabIndex={-1}>`.
5. The command menu. Cmd K or Ctrl K opens and closes it from anywhere, even while typing.

- **The rail** is full from 1280px and icons only from 1024 to 1279px, with labels as tooltips that
  screen readers still read. Below 1024px it is a drawer, with its own close button first in its
  focus order. Escape and a tap on the scrim close it too.
- **Counts read as words.** A highlighted count waits on the reader ("3 need you"), a grey one on
  someone else ("3 waiting on others"). Zero shows nothing. The collapsed rail keeps a dot for
  highlighted counts only. On the current row a grey count switches to the rail's text colour: the
  muted one measured 3.9:1 on the selected fill.
- **The current page** gets `aria-current="page"`, worked out from the path inside Suspense. The
  fallback renders the links with none current.
- **The phone action bar.** Under 640px, PageHeader's primary action moves to a sticky bar at the
  foot. Anything that takes focus underneath it scrolls up above it (WCAG 2.4.11).
- **The key hint** says Cmd K on Apple devices and Ctrl K elsewhere, and hides on touch screens.
  The server assumes one, and the browser corrects it after hydration.
- **The search button's tooltip** is mounted only while the rail is collapsed on a desktop. A hidden
  tooltip swallows the drawer's first Escape.
- `useAppShell()` gives a page `openCommand`, `ask` and `setPhoneAction`, or null outside the shell.

**Measure the shell, not the window.** The shell's breakpoints are container queries on its root
(`03-fundamentals-first.md`). The last system chose that after round one found no working phone
layout. Its starter still read the viewport, through `lg:` and `sm:` utilities for the top bar and
the action bar.

Write those as container queries at the system's breakpoints, with arbitrary values such as
`@max-[1023px]:`. Tailwind's named container sizes are not its viewport breakpoints (general
Tailwind behaviour). The rail's two switches, icons and drawer, are state in JavaScript. The last
starter set them from the window, with a media query and `use-mobile.ts`, which shadcn's Sidebar
reads. That agrees while the shell fills the window.

### The other composites

| Composite | Contract |
| --- | --- |
| `RouteFocus` | After a client navigation, moves focus to `#main`, so keyboard and screen-reader users start at the top of the new page. Skips the first render. Rendered once in the root layout, inside Suspense, because it reads the path. Needs `<main id="main" tabIndex={-1}>` in the shell and in every full-page state |
| `PageHeader` | Breadcrumbs, the title, one line of description capped at the measure, meta badges (status, the sample-data badge), actions, `primaryAction`, and tabs as children. The title is the page's one `h1`, focusable from script only (`tabIndex={-1}`, `data-slot="page-title"`). `primaryAction` sits last among the actions and moves to the shell's foot bar on phones. `focusPageTitle()` puts focus on the title after an action removes the control people pressed, unless focus is already somewhere useful |
| `Breadcrumbs` | From two levels deep. A `nav` named Breadcrumb over an ordered list. The last item is the current page (`aria-current="page"`), and every link has a 24px target. A name cut short keeps a route to the full text that works without a mouse. The last starter relied on `title`, which needs one (`03-fundamentals-first.md`) |
| `MetricCard`, `Delta` | MetricCard shows what is counted, the figure through the formatter, the change, what it is compared with, and a footnote. Its state is `ready`, `loading`, or `unavailable` when a source is down, which says so instead of drawing a zero nobody measured. A container query drops the figure to the smaller style when the card itself is narrow. In Delta the arrow gives the direction and the colour the judgement, and screen readers hear both in words ("Up 6.2%, better vs last month"). Costs and churn are `goodWhen="down"`. Rates change in points |
| `ChartFigure` | A chart's frame: a heading that names it, and the takeaway in one sentence, which is also the figure's accessible description. Then the chart, the system's own SVG, where arrow keys move through the points and each value is announced. Then the same numbers as a visually hidden table whose first column names each row. Charts sit on a surface, because the series colours are checked at 3:1 against it. Series use `var(--chart-1)` to `var(--chart-6)` in fixed order |
| `EmptyState` | A picture, a title, a line of body and actions. The picture marks the state and the words carry the meaning, so it is decorative (`alt=""`). It loads at once unless the state is compact, because it is often the largest thing on screen. `headingLevel={1}` when the empty state is the whole page, so the page keeps one `h1`. A brand with no characters or illustrations passes none |
| `ErrorSummary` | After a failed save, a titled list of problems at the top of the form, each a link that focuses its field. It takes focus when it appears (`role="alert"`, `tabIndex={-1}`, named by its title), so screen readers read it first. Messages match the field errors word for word |
| `CommandMenu` | Rendered by the shell. Pages (the rail's links), Actions (with a key shown when an action has one), and Ask, always last, when the product has an assistant. Matching is a plain "contains" on labels and keywords, so results keep the order people learnt. The first result is chosen from the first keystroke, and the input's `aria-activedescendant` follows it (cmdk only sets it after an arrow key). A live region gives the count. Every opening starts empty. Running a command closes the menu and the phone drawer |
| `SampleBadge` | "Sample data" beside the page title on any screen whose figures are not live. It covers every figure on the screen. Invented names (clients, people, places) go in square brackets, so nobody takes them for real ones |
| `FilterChip` | A pill toggle (`aria-pressed`) with a check when on, the number of records it would match, and a highlighted count when the matches need the reader. Filters live in the URL |
| `AskBar` | Home's question box for the assistant, from the shell's `onAsk`. It renders nothing when the product has no assistant. The assistant drafts and shows its sources. A person sends, approves, pays and deletes (`10-ai-catalogue.md`) |
| `Wordmark` | The brand's wordmark as inline SVG in `currentColor`, with a tight viewBox and the brand name as its accessible name. Its colour is set on the parent, and forced colours turn it `CanvasText`. Never redrawn, recoloured outside the brand's single-ink colours, stretched or given effects |

### Page-level states, hooks and helpers

| File | Contract |
| --- | --- |
| `app/layout.tsx` | `lang` in the brand's locale. Light by default, through next-themes on the class attribute: dark is a whole theme people choose, never a per-screen decision. The tooltip provider, the toaster, and `RouteFocus` inside Suspense. The title template, `%s · <product>`, with the product's name as the default |
| `app/loading.tsx` | `role="status"`, a hidden "Loading", and a skeleton shaped like the content, held back by `appear-late`. A page that loads in under a second shows nothing |
| `app/error.tsx` | The whole page failed. A `main` with one `h1`, Try again, a way home, and a reference for support in a disclosure. Never "Something went wrong", and never a cause or a promise nobody can know. Inside the shell, `app/(app)/error.tsx` catches first and keeps the rail |
| `app/not-found.tsx` | A `main` with one `h1` and a way home. A record that no longer exists gets its own `not-found.tsx` beside its page, linking back to its list |
| `hooks/use-shortcuts.ts` | Whether single-key shortcuts are on (WCAG 2.1.4). Settings turns them off, and shortcuts with Cmd or Ctrl stay on. Anything bound to a single key checks it first. It is kept in browser storage, with an in-memory fallback when storage is blocked. A product with user settings stores it there instead |
| `lib/format.ts` | `formatNumber(value, style, { currency, digits })` with the styles `03-fundamentals-first.md` lists, in the market's locale and currency. Identical output to the bundle's formatter, proven by the parity table. Dates use `Intl.DateTimeFormat` in the business's own time zone |
| `lib/product.ts` | The product's name, set once. The title template and the rail's lockup read it, so every tab says "Page · Product", the home page and the 404 included |
| `lib/utils.ts` | Re-exports `cn` (section 5) |

### Rules the starter's code follows

The system's Building it section states these in full. Every product inherits them.

- Server components by default. `"use client"` goes only on the leaf that needs state or effects,
  and helpers a server page calls live in `lib/`, never in a client file.
- Every page exports `metadata` with a title, so the browser tab and the route announcer name it.
- State people would share lives in the URL: the tab, filters, search, sort, page and the open
  record. Read it on the server inside Suspense, and keep it in step on the client with
  `history.replaceState`.
- No raw values. Text sizes come from the `type-*` utilities, everything else from the tokens. Only
  a component's own file may set a size its card names. A value the tokens lack goes into the
  system first.
- Numbers go through `lib/format.ts`. Images go through `next/image` with their real width and
  height. Brand marks and characters come from the system's asset groups, never redrawn or
  recoloured.

## 5. Pitfalls

Each is a rule, then the cause that taught it. All of them come from the last build.

### In the generator

- **Take every file the generator patches out of its pass-through copy.** The last generator
  patched `label.tsx`, then overwrote it with the pristine copy later in the same run. Give each
  patch a test that checks the output still carries it.
- **A chart library's class names are not a contract.** Recharts 3 renamed its axis tick element,
  shadcn's colour override stopped matching, and dark mode shipped axis labels at 3.07:1. That is
  part of why the system draws its charts in SVG itself. A product that adds a chart library styles
  its text through the class the library uses today, and re-runs the axis contrast check in both
  themes after every upgrade.
- **Check SVG text with its own test.** Neither axe nor the token audit reads text drawn in SVG, so
  chart labels can fail in one theme while everything else reports clean.

### In Next.js

- **Keep the title template in the root layout.** In a route group's layout it misses the page
  beside it and the 404.
- **With Cache Components on, read the URL and the request inside Suspense.** Outside a Suspense
  boundary, `params`, `searchParams`, `connection()`, `usePathname` and `useSearchParams` fail the
  build or block navigation. The shell already wraps its nav links and `RouteFocus`. Give each page
  that reads the URL a `loading.tsx`, or a `<Suspense>` with a skeleton shaped like it. `next dev`
  names anything that would block.
- **Give focus back from a dialog that opened without a trigger.** Radix returns focus to a
  dialog's trigger, and the drawer and the command menu have none. The starter's two record what
  had focus in a layout effect, which runs before the dialog moves focus in. On close,
  `onCloseAutoFocus` restores it, unless something else has taken focus by then. Copy that for any
  dialog a shortcut opens.
- **Move focus on client navigation.** Next.js leaves focus where it was. `RouteFocus` moves it to
  `main`, so keep `<main id="main" tabIndex={-1}>` in the shell.
- **Check the record before the page streams, where a real 404 matters.** Once a `loading.tsx` or
  Suspense fallback has shown (Cache Components makes that the norm), `notFound()` can't change the
  status. Next.js shows the not-found page with `noindex`, but monitors and API clients get a 200.
  An internal tool can accept that as a recorded deviation (`08-quality-gates.md`). Anything else
  checks before anything suspends, or in `proxy`.

### In shadcn, Tailwind and the libraries

- **Write colours as roles.** `--color-*: initial` removes Tailwind's palette, so `bg-blue-500`
  silently does nothing. shadcn's own names still work, because they point at roles.
- **Import `cn` the way shadcn now does.** shadcn imports `cn` from the `cn` package. `lib/utils.ts`
  re-exports it, so `@/lib/utils` keeps working.
- **Size a control inside a Field with `max-w-*`.** shadcn's Field stretches its children
  (`*:w-full`).
- **Re-copy `hooks/use-mobile.ts` after re-adding `sidebar`.** shadcn's add command brings its own
  hook back, and the drawer moves to shadcn's threshold. Re-apply the patches as well, or copy the
  starter's `sidebar.tsx`.
- **Leave Radix's Tab behaviour in menus alone.** Radix keeps Tab inside an open menu or select,
  and Escape or a choice closes it. That is safe from the keyboard, and it is a recorded deviation.
  A Tab handler that fights it would break on the library's next release.
- **Override Sonner's styles with `!`.** Its CSS sits outside any cascade layer, so it beats every
  Tailwind utility.
- **Don't name a page section "Notifications".** Sonner gives its toast region that name.
- **Route movement through tw-animate-css's variables.** Reduced motion zeroes them. Movement that
  bypasses them keeps moving.

### In the brand assets

- **Set an SVG's colour on its parent.** Forced colours leave an SVG's own colours alone. The
  wordmark draws in `currentColor` and `globals.css` turns it `CanvasText` there, so colour the
  parent, never the `svg`.
- **Never let the browser fake a weight.** `font-synthesis: none` stops it bolding or slanting a
  display face that has one weight. Keep figures out of any face whose figures are old-style.

## 6. The tests it carries

The last system kept its suites in its build tree, in session storage, outside any repo. The
starter carries them, so the system's rounds and every product repo run the same checks.

- **The behaviour suite.** `tools/check-components.mjs` runs every definition's checks on the built
  components in Chrome, with a real keyboard, touch emulation, reduced motion and forced colours on
  request. The example product's routes get their own checks: the phone drawer and the action bar,
  focus after every action, tab state in the URL, and toasts. Each check runs on a fresh page. One
  page left with a modal open broke the checks after it.
- **Chart axis contrast, in both themes.** Read the computed fill of every axis label and measure
  it against the chart's surface, light and dark, at 4.5:1. Axe and the token audit can't see this
  text (section 5).
- **The detector** on every route and state at the bar's widths, light and dark
  (`08-quality-gates.md`). The detector can't set a theme, so a route takes `?theme=dark` and a board
  takes `?props={"dark":true}`, and `$A product gates` scans both. The detector skips a 404 page: say
  so in the record rather than counting it clean.
- **Screenshots** at three widths in both themes, each with a sideways-scroll check.
- **The formatter's case table.** Both builds import one `lib/format.js`, and the table (every style
  against the same values) proves it keeps the contract (`03-fundamentals-first.md`).
- **The fresh-install check.** Run section 2 on an empty project, by script, before every publish
  (`12-design-system-artifact.md`). The build and the linter pass with no changes, the type check is
  clean, and `next dev` shows no warnings.

## 7. What a product repo gets

A product repo starts from the starter and gets these with it.

- **PRODUCT.md and DESIGN.md**, Impeccable's context files, written by `$A product starter` from the
  system when brand becomes product (`02-brand-to-product.md`). Each ends on a generated marker; while
  it is there the next run rewrites the file, and once someone deletes it the file is theirs. A
  definition can carry `design` rows (role names for `backgroundColor`, `textColor`, `typography` and
  `rounded`, plus `padding`, `size`, `height` and `width`), which become DESIGN.md's component tokens.
  The `.impeccable/design.json` sidecar is left to Impeccable's `document`. PRODUCT.md holds the users, the purpose and the
  accessibility target. The intake in `product/product.json` fills it: people and their jobs, the
  systems they touch, and what the assistant may do (`01-routes-and-intake.md`). DESIGN.md records
  the visual system the code ships: roles, type, shape, components and accepted deviations.
- **One token owner.** DESIGN.md records values but never owns them. A value changes in the
  system's tokens and arrives through the generator. Nobody changes it in DESIGN.md first. Once a
  product ships, Impeccable's `extract` and `document` bring new components back from code
  (`09-operate.md`). Read Impeccable's current instructions for the files' format, which moves
  between releases.
- **CI that fails on any finding.** It runs the build, the linter and the type check, then the
  behaviour suite. It runs the detector at the bar's widths in both themes, dark pass included. It
  runs axe against WCAG 2.2 AA and best practice on every route and state, through the browser
  automation the suite already uses (general practice).
- **The drift check's `globals.css` row, on every change.** CI regenerates `app/globals.css` with
  the shipped generator and fails on any difference.
- **The detector in CI as root.** Point `PUPPETEER_EXECUTABLE_PATH` at a script that starts Chrome
  with `--no-sandbox`, and `IMPECCABLE_BIN` at the engine the round recorded.
- **Impeccable's hooks**, installed as its current instructions describe.
- **The brand's guardian**, the companion skill Brandi emits, so later work is checked against the
  brand.
- **The assistant components in the core set** (`10-ai-catalogue.md`, section 5). The last starter
  had the AskBar and none of the assistant cards.

## 8. Versions

This file pins nothing, because a pinned version here would be wrong within months. The kit's
`package.json` pins every package exactly, tested together, and the system's Building it section
names them. Each round's record writes down every tool that ran (`08-quality-gates.md`), and
`standards` checks the stack monthly (`09-operate.md`). A library upgrade re-runs the full gates:
the chart tick rename in section 5 is what an unchecked upgrade costs.

Before using a framework API remembered from an older version, read the docs that ship with the
installed framework, in `node_modules/next/dist/docs/`.
