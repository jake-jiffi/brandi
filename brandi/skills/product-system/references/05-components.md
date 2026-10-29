# 05 · Components

Every product system carries the whole catalogue below, built before any product asks for it. A
team that needs a combobox in its third month should find one waiting, already reviewed.

Seventy-four of these components come from a reference build: a library and starter that went
through five review rounds, plus a sixth for the assistant pieces. Their behaviour is proven, and
every rule given for them traces to that build or to its reviews.

The reference passed the bar of its day: 32 of 40 on the craft critique overall, and 34 for the
assistant pieces. This skill's bar is higher (`08-quality-gates.md`), so a fresh system still runs
every gate on them.

Section 4 lists what a wider product family needs and the reference never built. Those entries are
marked "to build, not yet proven", and none of them is finished until a round has checked it.

Three framing decisions, stated once so they are not re-argued per component:

1. **One implementation, built twice.** Every component is written once, in the starter's
   `components/system/`, on the shadcn primitives in `components/ui/`. The product ships those
   files, and the canvas bundle is built from the same files, with React pointed at the page's copy.
   A board then shows exactly what production renders. The reference built every component twice
   and kept the copies in step by scripts, and they still drifted (`07-starter.md`).
2. **Data components take data, not markup.** Tables take column types, charts take series lists,
   lists take their rows as items. A board on the canvas and a page in production then describe the
   same thing.
3. **One definition per component.** Its README, its preview and its scan pages are generated from
   that definition, so they cannot disagree, and the build stops on an em dash (section 6).

## How to read an entry

Each entry opens with the component's job in one line. The labels after it:

| Label | What it holds |
|---|---|
| **Contract** | The main props, with values and defaults. The type file carries the full surface |
| **Behaviour** | The keyboard path, where focus goes, and what a screen reader hears |
| **Layout** | What changes at the component's own width thresholds, and on phones |
| **States** | States beyond the shared set in section 2.1 |
| **Copy** | Example strings, and the words the component never uses |
| **Sizes**, **Column types** and the like | Named options, one line each, where each needs its own meaning |
| **Rules** | When to use it, when to use something else, and its limits |
| **Review** | A rule a review round found broken in the reference, then fixed. Check these first: they are what a fresh build gets wrong |
| **Accepted** | A deviation the reference made on purpose, with its reason on record |
| **Open** | A gap the reference left. Close it, or record why not |
| *(practice)* | Added from general practice. No round has checked it |

Prop names are the reference's, with brand-specific values generalised. Invented names in examples
go in [brackets], as they do on every screen.

---

## 1. The catalogue at a glance

| Group | Count | Components |
|---|---|---|
| Foundations | 2 | Root, Icon |
| Brand | 3 | Logo, ProductLockup, brand character or illustration |
| Actions | 6 | Button, IconButton, TextLink, ButtonGroup, SegmentedControl, FilterChip |
| Inputs | 9 | Field, TextInput, TextArea, SearchField, Select, Checkbox, RadioGroup, Switch, FileDrop |
| Forms | 4 | ErrorSummary, FormSection, FormRow, FormActions |
| Status | 10 | Avatar, AvatarGroup, Kbd, Spinner, Badge, SampleBadge, Tag, Delta, Progress, Tooltip |
| Data | 8 | Card, MetricCard, DataTable, Pagination, List, ListRow, DescriptionList, Timeline |
| Charts | 5 | BarChart, LineChart, HBarChart, ShareBar, Sparkline |
| Feedback | 7 | Alert, Banner, Toast, EmptyState, LoadingState, Skeleton, Thinking |
| Overlays | 4 | Dialog, Sheet, Menu, CommandMenu |
| Navigation | 11 | AppShell, Sidebar, NavGroup, NavItem, PageHeader, Breadcrumbs, Tabs, SideNav, Toolbar, Spacer, Stepper |
| The assistant | 5 | AskBar, AIAnswer, AISteps, AIProposal, Source |

A brand with neither a character nor an illustration set has two brand components, and the library
has 73.

The bundle is one script under a namespace named for the system, with its stylesheet and a type
file. Load the tokens' CSS, then the bundle's CSS, then the bundle. It also exports the number
formatter (`03-fundamentals-first.md` §4 owns its contract), the list of bundled icon names, and the
character's state names when there is a character.

---

## 2. Contracts that hold across the library

Every component meets these. The entries in section 3 add only what is particular to each.

### 2.1 Tokens, shape, status and the shared states

- Components use role tokens, never the brand's raw values (`02-brand-to-product.md`). Token names
  in this file are the product roles.
- One shape means "you can press this", and nothing else takes it. The reference kept the pill for
  buttons, filter chips, segmented controls and the switch. Badges, tags and tooltips took small
  radii, because they are read, not pressed. Avatars are circles, the one exception.
- Every class that sets a corner or a shadow names a role (`rounded-action`, `rounded-list`,
  `rounded-rail`, `shadow-rail`), and `cn` knows those names, so a later class replaces an earlier one
  of its kind. Unknown to the merger, `rounded-md rounded-action` kept both and the cascade drew a
  segmented control as a 16px pill on a 6px brand.
- A field that holds a number is never narrower than its longest bound as it shows: three digits once
  sat in a 22px field on a full-width menu at phone width.
- Status never rides on colour alone. Every status carries a word or an icon, and a state has the
  same word in every product. The status-words table lives in the written system
  (`04-written-system.md`).
- Interactive components draw default, hover, pressed, focus-visible and disabled from tokens. Hover
  is the `hover` wash, or a filled button's own hover token. Disabled fades, loses its shadow and
  says why nearby. Data components add loading, empty and error. Brand-system's eight-state contract
  is the floor (`<brandi>/skills/brand-system/references/10-implementation.md` §7).
- A state keeps a least step from the colour it changes, and every state of one fill moves the same
  way from it. A fixed step of lightness rounds back to black, so a black rail's selected row and a
  black button's press came out invisible, and a dark navy that darkened on hover and lightened on
  press read as two buttons. The tokens solve both, and the audit measures each step.

### 2.2 Both themes, every component

Light is the default. Dark is a full theme people choose, never a per-screen switch, and every
component is previewed and scanned in both. Root sets the theme. Anything that opens in a portal
copies the theme of the place it opened from.

**Review.** The reference's first dark theme lost its hierarchy: the rail sat at 1.05:1 on the
canvas. Dark needs values of its own, not an inversion.

### 2.3 Data in, not markup

Data components take data, so a design on the canvas and the shipped product describe the same
thing.

- DataTable takes `columns`, each with a `type`, and plain `rows`. Charts take `data` and a `series`
  list. MetricCard takes a value, a number style and a delta. List takes its rows as `items`.
- Every number goes through the one formatter by named style: `number`, `currency`, `compact`,
  `compact-currency`, `percent`, `points`, `hours`. Exact in tables, rounded on cards and axes.
- The definition carries its own phone form. A DataTable column says where it goes when the table
  becomes a list.

**Review.** The formatter gave wrong figures (0.8% shown as "80%", cents rounded away), and the
bundle and the starter disagreed (round 1). A parity table now proves they agree
(`03-fundamentals-first.md` §4).

### 2.4 Sized by its own container

Components respond to their own width through container queries, never to the window. An artboard,
a split view and a browser tab of the same width then render alike.

| Component | Threshold | What changes |
|---|---|---|
| AppShell | 1280, 1024 and 640px | Rail to icons, then a drawer, then one column |
| DataTable | 640px | Shows its rows as a list |
| ListRow | 480px of list | Wraps to two lines; a badge or action moves under the text, whole |
| DescriptionList | 420px | `columns` stacks; `lines` never does |
| FormRow | 180px a field | Drops to one column |
| FormSection | Its own width | The split layout stacks the title above the fields |
| MetricCard | Its card | The figure shrinks with the card |

**Open.** The reference never scripted 820px. Tablet portrait is unproven until a round checks every
component there, which the bar now asks for.

**A column that scrolls.** A phone screen is usually a column whose main fills what is left and
scrolls. Its flex or grid items shrink to fit unless something stops them, and an `overflow:
hidden` box is a scroll container, whose automatic minimum size is 0. Cards shrank to fit a phone's
main and clipped their own content, the checkout's total included (a proof run, round 2). A
container that rounds its corners clips with `overflow: clip`, which is not a scroll container, and
a floor on a container's height goes on its content, never as the container's `min-height`, which
replaces the automatic minimum: a two-line Banner was squashed to its 48px floor the same way.

### 2.5 Touch

Touch sizing follows the pointer, and the phone layout: a touch screen of any size gets it, and so
does anything inside an app shell under 640px of its own width, so a phone board drawn with a mouse
shows the phone's sizes. The kit's `pointer-coarse:` variant carries both.

| What | Size |
|---|---|
| Controls, small, default and large | 32, 36 and 44px; on touch 40, 44 and 48px |
| Anything pressable on touch | 40px at least. Chips, tabs and segmented options are 40px |
| Checkbox, switch and toast buttons | 24px hit areas; 40 to 44px on touch |
| Links in a sentence or a breadcrumb trail | 24px, the WCAG minimum, everywhere |
| Space between neighbouring targets | 8px |
| Input text on touch | 16px, so iOS never zooms |
| Table rows | 48px comfortable, 40px compact |

**Review.** Three targets came in short across the rounds: the toast's Undo, the assistant's steps
line and a source chip. Measure every pressable thing. A control inside a bordered group loses the
border from its height: NumberInput's step buttons, and the list button at the end of a Combobox
or a TimePicker, were 38px tall in a 40px small field on touch, and 2px short at every size. Inner controls reach over the group's 1px edge (a clear border of
their own and `bg-clip-padding`, so the edge still shows), and the definition measures them.

**Accepted.** Small controls are 40px on touch rather than 44px. At 44px, chips, tabs and segmented
options crowd a phone toolbar for no gain in accuracy.

### 2.6 Focus, Escape and portals

The focus model is `03-fundamentals-first.md` §3. What it asks of each component:

- One focus style everywhere: the outline ring in the `focus` colour. Inputs show a 2px `focus` edge
  instead. The rail uses `rail-focus`.
- Overlays move focus in, hold it, and return it to what opened it. When nothing opened them (a
  drawer, a palette opened by shortcut), the component is handed a return target.
- Escape closes only the top layer: a menu inside a dialog first, then the dialog.
- After an action removes what had focus, focus goes to the next item, the page title or the control
  that started it. Never the page body.
- Menus, selects, tooltips, dialogs and sheets open in a portal above everything, so nothing clips
  them, and they flip to stay on screen.
- Every composite widget has its keyboard pattern, given in its entry. Focus moves with the
  selection, not only the highlight.
- Single-key shortcuts obey Root's `shortcuts` setting. Cmd and Ctrl shortcuts stay on.

**Review.** Dialog and Sheet neither trapped nor returned focus, and dropdowns were clipped by their
cards (round 1). Focus fell to the page body after approving, sending back, clearing filters and
clearing a selection (rounds 3 and 4). The phone action bar could hide what had focus (round 3).

### 2.7 What a screen reader hears

- Only news interrupts. `role="alert"` is for something that went wrong while the person was there.
  A warning already on the page when it loads is a polite status.
- Counts and changes are read as words: "3 need you", "12 items", "Up 6.2%, better vs last month".
- Live regions are polite and speak when the state changes. Never on every change, and never for the
  state a component loads in.
- Decoration is hidden: an icon without a label, the brand character, skeletons, a sparkline without
  a label.
- Anything that shows data as a picture has a text alternative (section 3.8).

**Review.** A grey tab count meant nothing to a screen reader (Tabs). A finished answer was never
announced, and spoken lines stayed in the accessibility tree (AIAnswer).

### 2.8 Reduced motion

Under reduced motion, state changes still fade so they stay visible, but nothing slides, lifts or
loops. The character's loop and the skeleton's shimmer stop.

**Accepted.** Spinners and the indeterminate bar slow right down instead of stopping (2.4s a turn in
the reference). A loading indicator that stood still would look like a hang, and the words beside it
carry the state.

**Review.** Reduced motion missed the two loops people watch while waiting (round 1).

In the starter, reduced motion zeroes the animation library's shared translate and scale variables.
Movement that bypasses them breaks the rule without anyone noticing.

### 2.9 Forced colours

- Focus, the current page, the open tab, selected rows, pressed chips and the menu item in hand stay
  visible. The reference's stylesheet ends with a forced-colours block that outlines each one.
- Nothing draws an outline at rest, because forced colours turns it into a box round every control.
- An SVG keeps its own colour in forced colours, so the logo takes `currentColor` from its parent.
- The assistant's streaming caret and a proposal's outcome stay visible.

**Review.** The starter's form controls lost focus and state in Windows High Contrast (round 2). A
proposal's outcome showed an outline at rest (round 6b).

### 2.10 Loading, empty and error

Tables, metric cards and charts take all three states as props (`loading`, `empty` and `error`, or
`state`), so a board can show them and the product cannot forget them.

- Under a second: show nothing.
- Content arriving in place: a Skeleton in its shape.
- Waiting on another system: a LoadingState that names the system and the work.
- Over ten seconds: say how long it usually takes, and let people leave.
- A missing value says so. It is never drawn or printed as zero.
- A source that is down leaves the rest of the screen working. Say which source, and keep the last
  good data, marked with its time.

### 2.11 Long text

Long and unbroken text wraps, or truncates with the full text reachable by touch and keyboard as
well as by mouse (`03-fundamentals-first.md` §2). ListRow wraps under 480px of list. DataTable
becomes a list under 640px.

**Open.** In the reference bundle, text cut short on a wide screen (breadcrumbs, clipped cells,
chart end labels under 300px) showed in full only in a `title` tooltip, which needs a mouse.

**Review.** Long names overflowed the phone title (round 3). Text was truncated with no touch access
(round 4). A name cut by a single pixel got an ellipsis and no tooltip: any overflow counts as cut.
A badge cut by a narrow grid column hung the board in a render loop (React error 185, a proof run):
the Tooltip wrapped round the cut badge would not shrink, so it widened the column, the badge
fitted and was unwrapped, and was cut again. A cut label's Tooltip (Badge, Tag, Source) now sizes
as the label's own box does (`cutTrigger`), so wrapping it never changes the width that was
measured. Anything that measures itself and then changes its own markup must hold this.

### 2.12 On the canvas

Boards mount the real components (`06-canvas.md`), which asks four things of each one.

1. The canvas wraps every mounted component in a plain element. A component that wires itself to a
   child (Field to its control, Tooltip to its trigger) finds that child inside the wrapper.
2. Anything that takes a list of children also takes them as data. List takes `items`. Tables and
   charts take data already.
3. Every transient state renders in place on request, for designs: `open` on Select, Menu, Tooltip
   and CommandMenu; `inline` on Dialog, Sheet and Menu; `dragOver` on FileDrop; `state` on
   MetricCard, the charts and AIProposal. A board shows the open menu without anyone clicking.
4. Anything that renders a heading takes `headingLevel`, so no board or page skips a level.

Props that take elements, such as the shell's sidebar and the header's actions, are built in the
board's own script. A detector finding on a board is fixed in the component, never hidden on the
board.

**Review.** The assistant board showed nested cards, a skipped heading level and a broken heading
rhythm. All three were fixed in the components: the steps log lost its box, heading levels became a
prop, and the attribution line became the answer's heading.

### 2.13 One implementation, two builds

- A component is done when its file in `components/system/` builds into both the product and the
  canvas bundle, and its definition is complete. The reference built every component twice, its
  starter lacked RadioGroup, SegmentedControl and the assistant cards, and neither copy had a
  combobox or a date picker. One source closes that gap by construction.
- The two builds run on different React versions: the product on the starter's, the canvas on React
  18.3.1 from the page. So every component forwards its ref, uses no API only React 19 has, and
  imports nothing from Next.js. The kit's `CONVENTIONS.md` has the full list.
- The type file describes every prop and compiles under strict TypeScript.
- Scripted checks prove the behaviour on the built components in a real browser with a real
  keyboard: keyboard paths, focus return, Escape order, focus after an action, the phone drawer and
  action bar, touch sizes, reduced motion and forced colours. The reference finished with 97 checks
  on its bundle and 126 on its starter.
- Every rule marked Review gets a scripted check, so it cannot regress quietly.
- Each check runs on a fresh page. A test page left with a modal open broke every check after it.

---

## 3. The catalogue

### 3.1 Foundations

#### Root

Theme, base type and the shortcut setting for everything inside. Wrap every app, preview and
artboard in one.

- **Contract.** `theme` (`light` default, `dark`). `background` (`canvas`, `surface`, `none`).
  `shortcuts` (`false` turns off single-key shortcuts inside).
- **Behaviour.** Sets the body face, the text colour, font smoothing, `font-synthesis: none`, the
  selection colour and quiet scrollbars. Adds no padding.
- **Rules.** A screen is one theme. A nested Root may flip one region, such as a dark preview inside
  a light page, and nothing more. Products offer the shortcut setting in their own settings, for
  speech-input and switch users.
- **Review.** Single-key shortcuts had no off switch (round 3).

#### Icon

One icon set, by name, drawn in `currentColor` at the set's stroke.

- **Contract.** `name`, `size` (12, 14, 16, 18, 20 or 24), `strokeWidth`, `label`.
- **Behaviour.** Hidden from screen readers unless it has a `label`.
- **Sizes.** 12 in badges. 14 in chips and meta lines. 16 in buttons, inputs, menus and tables. 18
  on the rail. 20 to 24 in empty states and drop zones.
- **Rules.** One set only: never emoji, never a second library. A lone icon needs a label and a
  tooltip, which IconButton supplies. Colour comes from the text beside it, and status icons take
  the status text colour. The reference used Lucide, the shadcn default, so the bundle and the
  starter share one set.

### 3.2 Brand

#### Logo

The brand's mark, from the master artwork. Never set in type, never redrawn.

- **Contract.** `mark` (`full` or `symbol`). `color` (`auto`, then only the brand's approved
  renditions). `height` (the logo system's preferred size, the symbol's own 24px for the symbol;
  values under its minimum, the symbol's for the symbol, are raised to it). `clearspace`. `title`
  (its accessible name; `""` when a parent link already names it).
- **Rules.** In product it lives in the rail lockup and on sign-in, never repeated in page headers.
  Use tight-viewBox copies: with the clear space inside the viewBox, the reference's letters were
  9px tall in a 20px logo. Never stretch, rotate, add effects or recolour it outside its renditions.
  Variants, clear space and minimums come from
  `<brandi>/skills/brand-system/references/08-logo-system.md`.
- **Review.** The symbol took the full logo's height, which the starter had raised to a wide logo's
  45px minimum. A signature used as the symbol was drawn 107px wide in the icons rail's 40px home
  square. The symbol now has its own size, and a mark over 1.5 times as wide as it is tall is never
  taken as one.

#### ProductLockup

The mark with the product's name, for the top of the rail, sign-in and product emails.

- **Contract.** `product` (the name as people say it). `color` (as Logo). `layout` (`inline`, with a
  hairline, or `stacked`). `height`. `href` (the whole lockup becomes one link, named "[Brand]
  [product]"). `tone` (`rail` on the rail and the top bar: the name takes the rail's strong text,
  and a dark rail gets the mark drawn for dark grounds).
- **Rules.** The name is never larger than the mark, and a long name is cut with an ellipsis rather
  than widening the rail. One per screen, top left. How the name is set is a brand-to-product
  decision. A product named for the brand, in any case, shows the name once and is named once.
- **Review.** On a dark rail the name took the page's strong text, navy on navy. A product named
  for its brand showed the name twice, and a screen reader read it twice.

#### Brand character or illustration

Only when the brand has one. It marks a state and never decorates: welcome, working, done, all
caught up, needs a person, nothing found, help.

- **Contract.** `pose` (one per state the system names). `size`. `flat` (the 2D rendition).
  `motion` (a gentle loop for working and calm). `label`.
- **Behaviour.** Decorative, so hidden from screen readers: the words beside it carry the meaning.
  Its motion stops under reduced motion. A pose in one dark ink is drawn in `currentColor`, so it
  takes the text colour and reads on a dark ground. A pose in a colour or several keeps its colours,
  and the pack has no dark rendition, so keep it off dark grounds.
- **Rules.** One per screen, and only in empty, loading, done, error, welcome and help moments.
  Never in tables, forms or a busy dashboard. Never recoloured, flipped, rotated, cropped or
  squashed, and never two renditions on one screen. A character for mess or trouble stands for the
  system's mess, never the person's own mistake, so it never appears on a form error.

### 3.3 Actions

#### Button

The pressable action.

| Variant | Use |
|---|---|
| `primary` | The one thing the view is for. Once per view |
| `secondary` | The default. Every other action |
| `ghost` | Toolbars, dense rows, tertiary actions |
| `brand` | Brand moments only (ask, a first run, a finish). Never beside a primary |
| `danger` | A destructive action in flow. Archive can be undone, so it is a normal button |
| `danger-solid` | Only a destructive dialog's final confirm, with the count |
| `link` | An inline text action |

- **Contract.** `variant` (`secondary` default). `size` (`sm` 32, `md` 36, `lg` 44px). `icon`,
  `iconRight`, `loading`, `block`, `href`, `disabled`, `disabledReason`.
- **States.** Loading keeps the width, shows a spinner, sets `aria-busy` and `aria-disabled`, and
  ignores further presses. It stays focusable, so focus never drops. Disabled says why, nearby or in
  a tooltip: `disabledReason` ("Confirm 2 checks first") keeps the button focusable and
  `aria-disabled`, shows the reason in a tooltip and its description, and ignores presses. A bare
  `aria-disabled` still hears the press, for a control that explains itself when pressed. Disabled
  and `aria-disabled` fade alike, to `opacity-disabled`.
- **Rules.** Secondary then primary, right-aligned, with Cancel immediately left of the primary.
  Prefer an enabled button that explains the problem when pressed to a disabled one.
- **Copy.** One to three words, verb first, in sentence case: Approve, Save draft, Delete 3
  invoices. Never "Submit", "OK" or "Click here". While loading, the label says what is happening
  ("Saving…").
- **Review.** `loading` did not block a second press (round 1). A disabled primary said nothing
  about why.

#### IconButton

An icon-only button.

- **Contract.** `icon`. `label` (required: its accessible name and its tooltip). `variant` (`ghost`
  default). `size`.
- **Rules.** Only for actions people know by their icon: more, close, refresh, copy, previous,
  next. The label names what it acts on ("More actions for [record]"). Anything less obvious is a
  text Button.

#### TextLink

An underlined inline link in the `link` colour.

- **Contract.** `href`, `icon`, `iconRight`. `standalone` for a link on its own (a card's "See
  all", "Forgot your password?"): its tap area grows to 40px on touch, looking no different.
- **Rules.** The text says where it goes and is unique on the page, never "here" or "more". Links
  navigate and buttons act, so "Try again" is a Button, even inside an alert.
- **Review.** Standalone links were 26 to 28px on touch. In a sentence a link keeps the 24px WCAG
  target, so it never reaches over the lines beside it; on its own it is pressable like any
  control, and takes 40px.

#### ButtonGroup

Related buttons with an 8px gap, wrapping on narrow screens. Secondary first, the primary last, and
Cancel immediately left of the primary.

#### SegmentedControl

Two to five views of the same content: Day, Week, Month; List, Board.

- **Contract.** `options` (strings, or `{ value, label, icon }`). `value` or `defaultValue`,
  `onChange`. `size`. `label` (the group's name).
- **Behaviour.** A radio group. Tab enters at the selected option. Arrows, Home and End move the
  selection and the focus together.
- **States.** The selection slides to the chosen option; under reduced motion it fades.
- **Rules.** Changes the view at once. Not for moving between pages (Tabs) or for settings
  (RadioGroup). Options are 40px on touch.

#### FilterChip

A filter over what is already on screen, pressed on and off.

- **Contract.** `selected` or `defaultSelected`, `onChange`. `count`, `attention`, `noun`, `icon`.
- **States.** Pressed takes `selected-strong` and a check. An `attention` count takes the highlight.
- **Behaviour.** The count is read once: "12 need you" with `attention`, or in its `noun`
  ("Needs you, 2 jobs"). A label that already says "needs you" is never followed by it again.
- **Rules.** One row, above the list or table it filters. The count is how many items match if the
  chip is applied. Only "needs you" counts get `attention`. 40px on touch.

### 3.4 Inputs

#### Field

One control with its label above it, an optional marker, a hint and an error, wired together.

- **Contract.** `label`, `hint`, `error`. `optional` (shows "(optional)"). `required` (sets
  `required` and `aria-required`, with no visible marker). `htmlFor`.
- **Behaviour.** Gives the control its `id`, `aria-describedby`, invalid and required, and keeps an
  id the control already has, so an ErrorSummary can link to it. The error is announced. On a
  canvas, it finds the control inside the wrapper.
- **Rules.** Labels go above fields, in sentence case, with no colons. Mark optional fields, not
  required ones. An error replaces the hint and says what is wrong and how to fix it ("Enter an [ID]
  with 11 digits"). It carries an icon as well as colour, and appears when the person leaves the
  field or saves, never while they type. A form holding a required field sets `noValidate`:
  without it, the browser's bubble stops the submit before the form's own errors and ErrorSummary
  can show, and the gates' axe pass fails it (`form-without-novalidate`) on a board, a preview or a
  route.
- **Review.** A settings field validated only on save, and field errors gained their icon (round 4).

#### TextInput

A single-line field.

- **Contract.** `size` (`sm`, `md`, `lg`). `icon`, `prefix`, `suffix`. `invalid`, `disabled`,
  `readOnly`. Every native input prop.
- **States.** Focus is a 2px `focus` edge. Invalid is a danger edge that stays danger when focused.
  Read-only is a dashed edge and a lock.
- **Behaviour.** The prefix and suffix are read with the field.
- **Rules.** 36px, or 44px on touch with 16px text. The border is `line-control`, 3:1 on every
  surface it sits on. Set `type`, `inputMode` and `autoComplete`, so phones show the right keyboard
  and browsers can fill it. A placeholder shows an example, never the label or an instruction. A
  read-only value says where it comes from and where to change it.

#### TextArea

Multi-line text for notes and messages. It starts at 96px and resizes vertically: `rows`,
`invalid` and the native props. The label says what the text is for ("Notes for finance"). Show a
character count only when there is a hard limit.

#### SearchField

Filters what is on screen as the person types.

- **Contract.** `placeholder` (says what is searched, and is the accessible name unless
  `aria-label` is set: "Search clients"). `shortcut` (a single key, such as "/", that focuses it).
  `size`.
- **Behaviour.** The shortcut never fires while someone types in another field, or when Root turns
  shortcuts off.
- **Rules.** Searching everything (records, people, actions, the assistant) is the AskBar's job or
  the CommandMenu's, not this field's.
- **Review.** Shortcuts were advertised and not wired (round 2).

#### Select

One option from a short list, up to about 15.

- **Contract.** `options` (strings, or `{ value, label, description, icon }`). `value` or
  `defaultValue`, `onChange`, `placeholder`. `open` (design mode). `size`, `invalid`, `disabled`.
  `id`, and `aria-label` or `aria-labelledby` for a Select outside a Field.
- **Behaviour.** A select-only combobox, and the field reads its current value. Up, Down, Home, End
  and typing a letter move through the options, and the active option scrolls into view. Enter or
  Space chooses. Escape and Tab close. The list is named like the field, opens in a portal, and
  flips up when there is no room below.
- **States.** Closed, open, the option in hand (a visible edge, with a 2px ring from the keyboard),
  chosen, invalid and disabled.
- **Rules.** Fewer than five options people should compare: a RadioGroup. The placeholder says what
  to choose ("Choose a [category]"), never "Select...".
- **Review.** Its card clipped the list (round 1). The active option did not scroll into view, and a
  Select outside a Field had no name (round 2). The option in hand was marked by a 1.14:1 tint. It
  now has a visible edge and a 2px ring (round 3).

#### Checkbox

A choice saved with a form.

- **Contract.** `label`, `description`. `checked` or `defaultChecked`, `onChange`. `indeterminate`
  (some selected). `disabled`.
- **States.** Checked, unchecked, indeterminate and disabled.
- **Rules.** An 18px box with a 24px hit area, 40 to 44px on touch. A setting that applies at once
  is a Switch. The label states the outcome ("Email the [client] a copy").

#### RadioGroup

One choice from two to five options that people should see side by side.

- **Contract.** `legend`, `name`. `options` (strings, or `{ value, label, description, disabled }`).
  `value` or `defaultValue`, `onChange`.
- **Behaviour.** *(practice)* A native radio group: arrows move the choice. The reference left this
  to the platform and did not document it.
- **Rules.** Preselect the safest or most common option. More than five options: a Select.
- **Review.** A rules review measured the radios at 18px (a proof run, rounds 1 to 3). The circle
  is 18px; its hit area, drawn round it, is 24px, and 44px on touch, which the definition checks.
  Measure a target by what a press reaches (`elementFromPoint` round its centre), never by the
  element's box.

#### Switch

A setting that applies at once, with no Save.

- **Contract.** `label`, `checked` or `defaultChecked`, `onChange`, `disabled`.
- **States.** On, off and disabled. The off track is drawn in `line-control`, so it stays visible.
- **Rules.** The label names the setting, never "On" or "Off". If turning it on needs a confirmation
  or a save, use a Checkbox in a form. 44px hit area on touch. On a settings page the switch sits
  before its label.

#### FileDrop

A drop zone with a real button, so keyboard, screen-reader and touch users never depend on
dragging.

- **Contract.** `title`. `description` (the rule in words: "CSV or XLSX, up to 20 MB").
  `browseLabel` ("Choose files" default). `accept`, `multiple`. `error`. `onFiles`. `dragOver`
  (design mode).
- **Behaviour.** The error is announced.
- **Rules.** After a drop, list each file with its progress and a way to remove it (the file list
  is to build, section 4). Reject a wrong file with the reason and the fix, never silently.

### 3.5 Forms

#### ErrorSummary

After a failed save: a titled list of what stopped it, each line a link to its field.

- **Contract.** `title` ("Fix these and try again" default). `errors` (`{ id, message }`, where
  `id` is the control's id). `autoFocus` (on by default).
- **Behaviour.** Takes focus when it appears, so a screen reader reads it first and the keyboard is
  one Tab from the first problem.
- **Rules.** For forms longer than about five fields, or whenever a failed save leaves an error out
  of view. Short forms need only Field errors. Each message matches its Field error word for word.
  Keep everything the person typed. The summary goes on the next successful save.

#### FormSection

Related fields in a card, with the title and description beside them (`split`, the default) or
above (`stacked`).

- **Contract.** `title`, `description`, `layout`. `headingLevel` (2 by default; 3 under another
  heading).
- **Rules.** One topic per section. The description says why the fields matter or who sees them
  ("Only finance can see this"). A settings page is one column of sections beside a sticky SideNav,
  and each section saves on its own.
- **Review.** It collapsed by the window's width, not its own (round 1).

#### FormRow

Two or three short fields side by side (`columns`), dropping to one column when a field would be
narrower than 180px. Only for fields that belong together, such as suburb, state and postcode.

#### FormActions

The row that ends a form: Cancel, then the one primary, right-aligned above a hairline. `align`
(`end` default, `start` for narrow forms). A destructive action sits apart, on the left, as a
`danger` button. The primary names the result ("Save billing"), never "Submit". Save stays quiet
until the section has changes: `changed` makes Save the one primary and shows an "Unsaved changes"
warning beside it, said once; at rest Save is secondary. A page of sections then never shows two
live primaries, and says which one is unsaved.

### 3.6 Status

#### Avatar

A person, as a photo or initials on a tinted circle. The assistant has an avatar of its own.

- **Contract.** `name`, `src`. `size` (24, 28, 32 or 40). `assistant`. `status` (`online`, `away`,
  `offline`).
- **Behaviour.** The status is read with the name: "[Name], online".
- **Rules.** Always with the person's name nearby. A name's tint is drawn from the tag tints, never
  one on a hue the brand keeps off its grounds (`charts.avoid`, recorded as the tokens' `avoidTags`).
  The initials are in `foreground`, the page's text colour, which a rail's remapping never reaches.

#### AvatarGroup

Overlapping avatars for the people on a record, with "+N" past `max` (4 by default). The "+N" names
the hidden people on hover and to screen readers. `people`, `max`, `size`.

#### Kbd

A key, for shortcuts in menus, the command menu and hints. Write the Mac form ("⌘K"). It shows
"Ctrl K" on Windows and Linux. A `rail` variant sits on the rail. Hidden on touch screens.

#### Spinner

A small inline spinner for a busy button or cell.

- **Contract.** `size`. `label` ("Loading" default; `null` when the words beside it already say
  what is happening).
- **Rules.** Content that is loading takes a Skeleton. An area waiting on another system takes a
  LoadingState. *(practice)* One spinner at a time in any one place, extending the assistant's
  rule.
- **Review.** Two spinners ran at once in the assistant (round 6).

#### Badge

One or two words of state on a record. A badge is read, not pressed, so it never takes the
pressable shape.

| Tone | Means |
|---|---|
| `success` | Approved, paid, sent, live, connected, on track |
| `warning` | Due soon, stale, near a limit, behind |
| `danger` | Failed, blocked, overdue |
| `info` | In progress, syncing, scheduled |
| `ai` | Drafted or suggested by the assistant |
| `highlight` | Needs you; new since the last visit |
| `neutral` | Archived, draft, snoozed, inactive |

- **Contract.** `tone`, `dot`, `icon` (a name, or `true` for the tone's own icon), `size`.
- **Rules.** The word carries the meaning, and a state has the same word in every product. Sentence
  case, no full stop. A long label is cut with an ellipsis and shows in full on hover.
- **Review.** Badge and Tag looked alike (round 1). The highlight and the warning shared a colour,
  so "needs you" blurred with "heads up" (round 1). They are told apart by 2:1 in lightness or a
  plain difference in colour: a highlighter yellow beside a pale warning tint is close in lightness
  and still reads as different. One state had five names at two severities
  (round 3). A badge cut by a narrow column looped (React error 185, section 2.11).

#### SampleBadge

Marks a screen or card that shows sample data, beside the page title, until the real connection is
live. It covers every figure on the screen, and invented names on that screen go in [brackets].

#### Tag

A category someone assigned: an outlined label with the category's colour dot, so it never reads
as a status.

- **Contract.** `color` (one per chart series slot, matching the series colour so a category looks
  the same in a table and in a chart; grey for unknown or unset). `onRemove` (adds a remove button
  named "Remove [tag]", with a 24px hit area).
- **Rules.** A category keeps its colour everywhere in the product. Status is a Badge, never a Tag.
  If the system fills tags with the `tag-N` tints, keep them visibly different from Badge's status
  tints, or the round 1 finding returns.

#### Delta

Change against a comparison, as an arrow and a value.

- **Contract.** `value` (signed). `format` (`percent` default, `points`, or any number style).
  `goodWhen` (`up`, `down`, `neither`). `suffix`.
- **Behaviour.** Read as the whole judgement: "Up 6.2%, better vs last month".
- **Rules.** The success colour when the change is good, danger when bad, neutral when flat or
  neither. Always say what it is compared with. Costs, overdue amounts and churn are
  `goodWhen="down"`. A change in a rate is in points ("3 pts"), never a percent of a percent.
- **Review.** Better or worse showed only in colour outside forced colours, and whether up is
  good depends on `goodWhen`, which no arrow shows. The word now sits beside the figure in every
  mode: "↑ 6.2% better vs last month".

#### Progress

Progress toward a known end, with an optional target marker.

- **Contract.** `label` (also its accessible name). `value`, `max`, `target`. `tone` (`success`,
  `warning`, `danger`, `info`, `brand`). `indeterminate`. `showValue`, and `valueLabel` (what screen
  readers hear). `size`.
- **Rules.** Say the numbers in words beside it ("34 of 40 h"). An unknown length is
  `indeterminate`, never a made-up percentage.
- **Review.** The default tone drew in the brand fill, and a light brand colour reached 2.17:1 on a
  light track. It draws in `primary`, which is solved against the tracks a meter fills.

#### Tooltip

A short label on hover or keyboard focus.

- **Contract.** `content`. `placement` (`top`, `bottom`, `right`). `open` (design mode).
- **Behaviour.** Stays while the pointer is over it. Escape closes it. It shifts to stay on screen.
- **Rules.** Never the only home for essential information, and never interactive. One short
  sentence at most. The child must be focusable, so keyboard users get it too. A definition people
  need on touch is a toggletip, as MetricCard's hint is. Wrapped round a cut label, it takes
  `cutTrigger`, so it sizes as the label does (section 2.11).
- **Review.** An invisible tooltip swallowed Escape in the phone drawer (round 3).

### 3.7 Data

#### Card

The container on the canvas: a title, an optional description and actions, a body and a footer.

- **Contract.** `title`, `description`, `actions`, `footer`, `icon`. `href` (the title becomes a
  link that covers the card; buttons inside stay pressable). `flat` (inside a pane: no shadow).
  `interactive` (lifts on hover). `selected`. `flush` (no body padding, for tables and lists).
  `headingLevel` (2 by default). `as`. `chevron` (with `href`: a chevron at the end of the title's
  line, the cue that the whole card opens something, as ListRow has).
- **Layout.** In a column that scrolls, as a flex or a grid item, a card keeps its content's height
  and the column scrolls. It clips its corners with `overflow: clip`, never `hidden` (section 2.4).
- **Rules.** Never a card inside a card. The title says what the card shows, in sentence case, with
  no small uppercase label above it. One idea per card: a card that needs tabs is a page.
- **Review.** An uppercase kicker sat above card titles, which the craft gate bans (round 1). Cards
  shrank inside a phone's scrolling main and hid the checkout's total (a proof run, round 2).

#### MetricCard

A headline figure: its label, the value, a delta with its comparison, an optional trend and a
footnote.

- **Contract.** `label`, `value`, `format`. `delta`, `deltaFormat` (`percent`, or `points` for
  rates), `goodWhen`, `context`. `trend` (numbers, `null` for a gap) and `trendLabel`. `footnote`,
  `hint`. `hero`. `state` (`ready`, `loading`, or `unavailable` with `unavailableText`).
- **Behaviour.** `hint` is a toggletip behind an info button. Hover shows it after a short delay. A
  press, a tap or Enter opens it and reads it out. Escape or a press elsewhere closes it. The figure
  shrinks with its card, not the window. `context` is the delta's comparison and shows only beside a
  delta; `footnote` is the line that always shows. A `value` given as text that is not a number ("7
  of 8") shows as written; a number given as text goes through the formatter.
- **Rules.** One `hero` per row at most. Tabular figures. The label says exactly what is counted,
  and the footnote or hint says what is left out. Rounded for reading on cards ($18K), exact in
  tables. When a source is down, show `unavailable` and when it last answered, never a zero nobody
  measured.
- **Review.** The hint could not be opened on touch (round 4). The reference's toggletip waits
  150ms on hover. A figure in words read No data, and a context given with no delta never showed:
  both were found only by rendering a board.

#### DataTable

Records in rows and columns, declared by column type, so a design and the product share one
definition.

- **Contract.**
  - Data: `columns` (each `{ key, label, type, sortable, align, width, wrap, maxWidth, empty,
    items, render, phone }`), `rows`, `rowKey`, and `labelKey` (the column that names a row, the
    first by default).
  - Selection: `selectable`, `selectedKeys` or `defaultSelected`, `onSelectionChange`.
  - Sorting: `sort` with `onSortChange` (server side), or `defaultSort`.
  - Display: `density` (`comfortable` 48px rows, `compact` 40px), `caption`, `maxHeight` (the head
    sticks), `footer` (put Pagination here).
  - States: `loading`, `error`, `empty`.
  - Opening: `onRowClick` or `rowHref`.
- **Column types.** `text`, `strong`, `stack` (a title and a sub-line), `person`, `badge`, `tags`,
  every number style, `delta`, `progress`, and `actions` (an overflow Menu named "More actions for
  [record]").
- **Behaviour.** With `onRowClick` or `rowHref`, the naming cell becomes the row's link or button,
  so rows open from the keyboard. Selecting a row never opens it: checkboxes, menus and links inside
  a row never open the row. Sorting is announced. A table wider than its box becomes a named region
  that takes focus, so the keyboard can scroll it, and the actions column sticks to the right edge.
- **Layout.** Under 640px of its own width it shows the same rows as a list. The naming column is
  the title, the others make a meta line, badges sit on a line of their own, and the row's menu
  stays on the right. A column's `phone` sends it to `meta` (the default), `labelled` (the meta
  line with the column's name in front, so two figures on one row can be told apart), `badge`,
  `action` or `hidden`. `action` keeps a row's one primary action (a column whose cell is a Button)
  on the row, beside its menu, rather than letting it disappear into More actions. Sorting moves to
  the page's own controls.
- **States.** The empty state replaces the rows and keeps the header and the toolbar.
- **Rules.**
  - The first column names the record. Seven columns at most; the rest belong in the detail view.
  - Numbers are right-aligned in tabular figures, and exact. Heads are short uppercase labels, with
    hairlines between rows and no zebra stripes.
  - One density per table, never tighter than compact. Keep the phone list's meta line short.
  - Selecting rows swaps the toolbar's filters for bulk actions. Those act only on rows on screen,
    with a selection bar that says how many.
- **Review.** Selecting a row opened it, rows could not be reached by keyboard, and some data
  crashed it (round 1). Bulk approve acted on rows that were not on screen (round 3). Tables kept
  their desktop layout at phone width (round 4). On a touch tablet the sort buttons and the row's
  link were 16 and 20px; each now takes its whole cell. A search that emptied the table said
  nothing, because the count in the footer unmounted; the footer stays mounted, out of sight. A
  selectable table with bulk actions and no filters had a blank band above it at 390 (a proof run,
  rounds 1 to 3): with no filters the toolbar takes no room until rows are selected. Order lines
  went label over price at 358px: a receipt is a DescriptionList in `lines`, never a table.
- **Open.** No shift-click range selection. Up and Down between a list and its detail, which
  `03-fundamentals-first.md` §5 requires, was left to each product.

#### Pagination

The footer of a long table: "1 to 25 of 312", with previous and next. "No results" at zero, and no
buttons when everything fits on one page. `page`, `pageSize`, `total`, `onPage`. Prefer filters and
search to deep paging. Keep the page size the person chose, and keep the page in the URL.

#### List

A column of ListRows: records on phones, inboxes, queues, and the left pane of list and detail.
`boxed` (on by default), `divided`, and `items`, the rows as data, which a canvas needs.

#### ListRow

One record in a List: a lead (an avatar or icon tile), a bold title, a meta line, and a trailing
badge, value or chevron.

- **Contract.** `title`, `meta`. `avatar` or `icon`. `badge`, `trailing`, `chevron`. `selected`,
  `unread`. `href` or `onClick`.
- **Behaviour.** `unread` shows a dot and adds "(unread)" for screen readers.
- **Layout.** On a wide list, long text is cut with an ellipsis and shows in full on hover. Under
  480px of list it wraps to two lines, and a badge or action moves under the text, whole.
- **States.** `selected` marks the open row, the record beside the list: `selected-strong` with a
  `selected-line` edge, and quiet text switches to `text-muted`. `unread` adds the dot.
- **Rules.** The meta line answers "what is it, and what is next". A badge is never squeezed to its
  dot.
- **Review.** The selected row showed no focus (round 2). Badges were squeezed to their dots
  (round 4).

#### DescriptionList

Label and value pairs for a record's details, in two columns, or stacked for side panes. It stacks
by itself under 420px. As lines it holds a receipt: order lines, fees and a total.

- **Contract.** `items` (`{ label, value }`, `{ label, badge }`, `{ label, value, badge }`, or
  `{ label, value, empty }`, any of them with `total`). `layout` (`columns`, `stacked`, `lines`).
- **Layout.** `lines` keeps each label and its value on one line at any width, a phone's included:
  the value at the end, in tabular figures, on the label's first line, and a long label wraps
  beside it. A value takes up to two thirds of the line; a longer one wraps there. No hairlines
  between lines. An item with `total` sits under a rule in `line-strong`, label and value in
  `text-strong`.
- **Rules.** Labels in `text-subtle`, values in `text`; in `lines` the label is the line itself, so
  it takes `text`. A missing value says so ("Not set"), never blank. An item with a value and a
  badge shows both, the value first. Order lines, a receipt or a price breakdown are `lines`: List,
  DataTable and `columns` all put the value under its label on a phone.
- **Review.** An item with both dropped its value. A checkout's order lines read as a form at
  358px, each price under its label and left-aligned, so a run drew its receipt by hand (a proof
  run, round 2).

#### Timeline

What happened to a record, newest first, with an icon by kind and a time. `items` (`{ text, time,
icon, tone }`). Each line names who did what ("[Name] approved 14 [records]"). The assistant's
actions use the `ai` tone, so people can tell them apart.

### 3.8 Charts

The five charts take data, never drawn markup. BarChart and LineChart share their props:

- Data: `data` (`{ label, value }`, or `{ label, values: { [key]: n } }`) and `series` (`{ key,
  label, color, compare }`).
- Words: `title`, `summary`, `labels`.
- States: `state`, `empty`, `error`.
- Display: `height`, `format`, `axisFormat`.

HBarChart, ShareBar and Sparkline take a plain list. All five hold this contract wherever it
applies:

| Rule | Detail |
|---|---|
| Missing data | `null` or a missing key is no data. Lines break and bars are skipped. Nothing is drawn as zero |
| Negative values | The domain runs from zero or below, and negatives hang below a darker zero line |
| Series colours | `series-1` to `series-6`, in that order, never by rank. A seventh series folds into "Other". Status colours stay for status, and comparisons are grey and dashed |
| Labels | Two or more series show a legend. Two to four are also labelled directly |
| Text alternative | An accessible name built from `title` and `summary` (the takeaway in words), and a hidden data table |
| Keyboard | The plot takes focus. Left and Right, with Home and End for the ends, move through the points, show the pointer's tooltip and announce the point through a polite live region |
| Tooltips | Stay inside the plot |
| States | `loading` (a skeleton the chart's size), `error`, and `empty`, shown by itself when there is no data |
| Axes | One y-axis, never two. Axis text follows the theme and is measured in both |
| Never | A pie or donut chart. ShareBar does that job |

The reference's starter charts showed each point in the tooltip and carried the numbers in the
hidden table. Only the bundle's charts announced each point.

The series tokens are solved to 3:1 on the surface in both themes. The token audit reports
neighbours that collapse under a colour-vision deficiency: label those lines directly, or reorder
(`02-brand-to-product.md`).

**Review.** Charts drew missing data as zero, and negative values vanished (round 1). They had no
keyboard focus and no text alternative (round 3). The starter's axis labels fell to 3.07:1 in dark
after the chart library renamed its tick element. Neither axe nor the token check reads SVG text,
so chart text now has a check of its own (round 4).

#### BarChart

Amounts across categories or days, grouped or stacked.

- **Contract.** The shared chart props, plus `stacked`, and `labels` (`auto` labels two to four
  stacked series beside the last bar; `end`, `none`).
- **Rules.** Stack only when the parts make a whole. Bars up to 26px wide, with 4px rounded data
  ends and 2px gaps between stacked parts. Values are in the hover and in the hidden table.

#### LineChart

A trend over time, with an optional comparison series.

- **Contract.** The shared chart props, plus `area` (a light fill under the first series) and
  `labels` (`auto` names two to four lines at their ends; `end`, `none`). A series with `compare` is
  drawn dashed in `chart-compare`.
- **Rules.** Lines are 2.25px. Hover shows every series at that point, inside the plot. A comparison
  (last period, a target) is always dashed and always grey. Two to four lines are named at their
  ends as well as in the legend, down to 280px wide. Five or more is too many for one chart: split
  it.

#### HBarChart

A ranked top N with direct labels and values: the clearest way to compare named things.

- **Contract.** `data` (`{ label, value }`), `format`, `max`, `color` (`series-1` by default),
  `empty`.
- **Behaviour.** An ordered list to a screen reader, each label read with its value.
- **Rules.** Sorted descending, ten rows at most. The rest is "Other", or a link to the full table.

#### ShareBar

Shares of a whole as one segmented bar, with a legend that prints every share. It replaces pie and
donut charts, which the system does not use. `data` (`{ label, value }`; zero and negative values
are left out), `format`, `empty`.

#### Sparkline

A tiny trend with its last point marked, inside a MetricCard or a table cell. No axes.

- **Contract.** `data` (numbers; `null` breaks the line), `width`, `height`, `color`. `label` (the
  trend in words; without it the line is hidden from screen readers).
- **Rules.** It supports a figure and never stands in for one. Keep it in `series-1`: the Delta
  beside it says whether the trend is good, so a trend is never coloured red or green.

### 3.9 Feedback

Use the lightest feedback that works. An inline Field message first, then an Alert, a Banner and a
Toast, and a Dialog last. The written system's screen patterns carry the full ladder
(`04-written-system.md`).

#### Alert

A message inside a page or card: what happened, what it means, what to do.

- **Contract.** `tone` (`neutral`, `info`, `success`, `warning`, `danger`, `ai`). `title`,
  `children`, `icon`, `actions`. `onDismiss`, `dismissLabel` ("Dismiss: [title]" default). `role`.
- **Behaviour.** `danger` and `warning` default to `role="alert"`, the rest to `role="status"`.
  Pass `role="status"` for a warning that is already there when the page loads, so a screen reader
  does not interrupt with it on every visit.
- **Rules.** State, then consequence, then the fix: "[Source] is not responding. Invoices below are
  from 9:42 am." Never "Something went wrong", and never blame the person. A partial outage leaves
  the rest of the screen working: say which source is down and when it was last checked. Actions are
  Buttons ("Try again"). A link only when it goes somewhere.

#### Banner

A one-line Alert across the top of the page's content: sample data, read-only mode, a source that
is down, offline.

- **Contract.** As Alert. `role` defaults to `status`, because a banner is usually there on arrival.
  Pass `alert` when it appears because something broke while the person was on the page.
- **Rules.** One at a time, under the page header. Dismissible unless the state still applies. Under
  a down source, the last good data stays, marked with its time. Offline is a `neutral` banner
  saying changes will save when the connection is back.
- **Review.** A starter showed its down source as `danger`. A source behind the page that is down
  is `warning`: nothing the person did failed, and the rest of the page works. `danger` is for a
  section that could not load or a save that did not go through.

#### Toast

A brief confirmation after an action, at the bottom centre on `surface-inverse`, with Undo when the
action can be reversed.

- **Contract.** `tone` (`neutral`, `success`, `warning`, `danger`). `icon`. `action`, `onAction`.
  `onClose` (a close button only when it is given). `floating` (fixed at the bottom centre, never
  wider than the screen).
- **Rules.** One sentence, past tense, with a full stop: "3 invoices sent." It goes after 5 seconds,
  or 8 with Undo, and pauses while hovered or focused. It sits above the phone action bar and shows
  where focus is. Errors that need action are Alerts, never toasts.
- **Review.** Undo was 46 by 24px on touch (round 3).
- **Open.** The reference bundle's Toast was static. Timing and pausing lived in the production
  toast library. The queue is to build (section 4).

#### EmptyState

Says what is empty and what to do next.

| Kind | Example | Character state, if any |
|---|---|---|
| Nothing yet | "No clients yet." with Add client | Building or reading |
| No results | "No invoices match these filters." with Clear filters | Inspecting |
| All done | "All caught up. Nothing is waiting on you." | Calm |
| Could not load | "We couldn't load [records]. [Source] is not responding." with Try again | Needs a person |
| No access | Who can grant access, and a link back | Neutral |
| Not found | A link to the list it belonged to | Inspecting |

- **Contract.** `character` (a state name, or `none`). `size` (`page`, `section`, `compact`).
  `title`, `children`, `actions`. `flat`. `headingLevel` (2 for `page`, 3 otherwise).
- **Rules.** `page` when the empty thing is the whole page, `section` inside a card or pane,
  `compact` in narrow places. Inside a table it replaces the rows and keeps the header and the
  toolbar. A `page` title takes the display style when the brand uses one for titles. Smaller titles
  take the heading style.

#### LoadingState

An area waiting on another system for more than a second: what is happening, an indeterminate bar,
and the brand character working, when there is one.

- **Contract.** `title` (what is happening, naming the system: "Pulling this week's [records] from
  [source]"; "Loading" is a fallback, not copy). `children` (a second line). `character`.
- **Behaviour.** A polite live region, so the line is read out.
- **Rules.** Under a second, show nothing. Content arriving in place takes a Skeleton. Over ten
  seconds, say how long it usually takes and let people leave. A long job can run in the background.
- **Review.** Reduced motion missed the loops people watch while waiting (round 1).

#### Skeleton

Grey shapes where content is about to appear, in that content's layout. `width`, `height`,
`circle`, `lines`. It shimmers unless reduced motion is on. It is hidden from screen readers, so say
"Loading" once, nearby. The shapes take `line-strong`, a step past the hairline: on a tinted canvas
the hairline left them at 1.15:1.

#### Thinking

The assistant's working line: a small spinner, then what it is doing, in the same shape as the
AISteps summary line.

- **Contract.** `children` (the work). `live` (true by default, a polite status; false inside
  something with its own status line, as AIAnswer and AIProposal have).
- **Rules.** Name the work ("Reading 12 [records]"), never "Thinking…" on its own once the work is
  known. No pulsing dots: the words carry the status.

### 3.10 Overlays

#### Dialog

A focused decision or a short form over the page. It is the heaviest feedback there is, so it comes
last: if the action can be undone, do it and offer Undo instead.

- **Contract.** `open`, and `inline` (design mode). `title`, `description`, `footer`, `footnote`.
  `onClose`. `width` (400, 520 default, 720). `scrimClose` (`false` once a form inside has changes,
  so a stray click cannot lose them).
- **Behaviour.** Focus moves in and stays. Escape, the close button and a click on the scrim cancel,
  and focus returns to what opened it. Escape closes only the top layer, so a menu inside the dialog
  closes first.
- **Layout.** On phones it rises from the bottom, with full-width buttons.
- **Rules.** A confirmation is a question with the thing and the count ("Delete 3 draft
  invoices?"). The primary repeats the verb with the count ("Delete 3 invoices"). Destructive
  confirms use `danger-solid`. A change to a customer's account shows the before and after, and says
  what is recorded. Up to five fields fit a dialog; longer edits take a Sheet or a page. Never a
  dialog on a dialog.
- **Review.** It neither trapped nor returned focus (round 1). The starter's backdrop blur came out
  (round 4).

#### Sheet

A panel from the right, inset from the edges like the rail, for a record or a longer edit without
leaving the list.

- **Contract.** `open`, `inline`. `title`, `description`, `footer`. `onClose`. `width` (440
  default).
- **Behaviour.** As Dialog: focus moves in and stays, Escape and the scrim close it, and focus
  returns to the row that opened it.
- **Rules.** On wide screens the detail pane sits beside the list instead. Under 1280px it becomes
  this sheet. A sheet may open a confirmation dialog.

#### Menu

Actions on one thing, opened from an overflow button or any trigger.

- **Contract.** `items` (each `{ label, icon, description, shortcut, danger, disabled, checked,
  onSelect }`, or `'separator'`, or `{ group }`). `trigger`. `label` (names the trigger: "More
  actions for [record]"). `align`, `placement`. `inline`, `open`.
- **Behaviour.** Opens in a portal, never clipped by a table or card, and flips to stay on screen.
  Focus moves to the first item. Up, Down, Home and End move, and Enter chooses. An item's
  single-key `shortcut` runs it while the menu is open. Escape closes and returns focus to the
  trigger. Tab closes and moves on from the trigger. Disabled items stay visible and do nothing.
- **States.** The item in hand takes the hover wash and a visible edge, with a 2px ring from the
  keyboard. Checked items show a check, and destructive items are in danger text.
- **Rules.** Six items or fewer is best. Destructive items go last, after a separator, and open a
  confirmation.
- **Review.** Tab out of an open menu jumped to the top of the page (round 2). The item in hand
  needed a visible edge and a 2px ring (round 3).
- **Accepted.** In the starter, the menu library keeps Tab inside an open menu. Escape and a choice
  both close it, so it is safe from the keyboard, and overriding the library would break on its
  next release.

#### CommandMenu

The palette: jump to any record, run an action or ask the assistant, from anywhere, on Cmd or
Ctrl K.

- **Contract.** `groups` (each `{ label, items }`, where an item is `{ label, icon, description,
  keywords, shortcut, meta, onSelect }`). `placeholder` ("Search or ask" default). `query`,
  `onSelect`, `onClose`, `emptyText`. `onAsk` (gets the query when nothing matches and Enter is
  pressed). `modal`. `open`.
- **Behaviour.** Typing filters every group. Up, Down, Home and End move the active result. Enter
  runs it, and Escape closes. The input is a combobox, so screen readers follow the active result.
  `modal` opens it near the top of the page as a dialog that holds focus.
- **Rules.** Groups in this order: Jump to, Actions, Ask. With no matches, offer to ask the
  assistant, but only when `onAsk` is passed. Without it, the empty line promises nothing. Records
  are found by name.
- **Review.** It did not filter (round 1). The active result did not scroll into view (round 2).
  The starter's palette could not find records (round 5).

### 3.11 Navigation

#### AppShell

The frame of every product: a skip link, the canvas, the rail and the main column.

- **Contract.** `sidebar` (a Sidebar). `product` (for the top bar on small screens). `navOpen` and
  `onNavOpenChange` (to control the drawer). `children` (a PageHeader, then panes and cards).
- **Layout.** By its own width. The full rail from 1280px. Icons with tooltips from 1024 to 1279px.
  Under 1024px, a drawer behind a top bar with the menu button and the lockup. Under 640px, one
  column, touch-size controls, tables as lists, and the PageHeader's primary in a bar at the foot.
- **Behaviour.** "Skip to content" comes first and targets `main`. The open drawer holds focus: the
  page behind it is inert, a Close navigation button sits at its top, Escape and the scrim close it,
  and focus returns to the menu button. Scroll padding keeps focus clear of the phone action bar.
  The bar is a region named "Page actions", so a primary moved into it is never outside a landmark.
- **Review.** There was no working phone layout, the only P0 in round 1. The drawer dropped focus
  and let it escape behind (round 2). An invisible tooltip swallowed Escape in the drawer, and the
  action bar could hide focus (round 3).

The full shell contract is in `03-fundamentals-first.md` §1 and §2.

#### Sidebar

The rail: the product lockup, search or ask, the navigation groups and the signed-in person.

- **Contract.** `product`, `collapsed`. `search` (the trigger's label, or `false`), `shortcut`,
  `onSearch` (also bound to Cmd or Ctrl K; the key hint shows only when it is set). `user` (`{ name,
  role, src }`), `onUser`. `footer`, `autoHeight`.
- **Behaviour.** A `nav` landmark named "Main". The account button is named "[name], [role],
  account menu". Collapsed, the labels stay for screen readers and show as tooltips on hover and
  keyboard focus.
- **Rules.** Eight top-level items at most, in groups under short uppercase labels, with settings
  and help in the footer. Only `rail-*` tokens and the highlight count live on the rail, and focus
  there uses `rail-focus`. Whether the rail carries the brand is a brand-to-product decision.
  Without one it is a quiet surface.
- **Accepted.** Icons only from 1024 to 1279px, with the labels as tooltips. Full labels at that
  width take a fifth of a laptop screen from the work.

#### NavGroup

NavItems on the rail under a short uppercase label, optionally collapsible. `label`,
`collapsible`, `defaultOpen`.

#### NavItem

One destination on the rail: an icon, a label and an optional count.

- **Contract.** `icon`, `label`, `href`. `current`. `count`, `attention`. `sub` (a nested item).
- **States.** The current page takes `rail-selected` with a hairline, and a 3px bar in
  `rail-text-strong` at its start: the fill is a step off the rail, about 1.3:1, so the bar carries
  the state at 3:1 or more. PhoneTabBar marks its current place the same way, with the bar along the
  top. A count is highlight with `attention` and grey without, and zero shows nothing.
- **Behaviour.** The current page carries `aria-current="page"`. Counts are read as words:
  "Approvals, 3 need you" ("1 needs you") with `attention`, and "[Place], 12 waiting on others"
  without.
- **Rules.** Counts mean work: a highlight count is waiting on the reader, a grey count on someone
  else.
- **Review.** The needs-you count was white on the highlight, at 1.12:1 (round 1). The count's text
  is `on-highlight`, solved for contrast. The current page was marked by its fill alone, 1.32:1 on
  a dark rail.

#### PageHeader

The top of every page: breadcrumbs, the title with its status badges, a description, the actions,
and Tabs underneath.

- **Contract.** `title`, `description`, `breadcrumbs`. `actions` (the secondary ones). `primary`
  (the one primary action). `meta` (badges, such as SampleBadge). `children` (Tabs).
- **Layout.** On phones the actions drop below the title, and inside AppShell `primary` moves to the
  bar at the foot. Long titles wrap.
- **Rules.** One title per screen, the page's only `h1`, in the title style. The title is the noun
  people use ("Clients", "[Client name]"), never "Dashboard". One primary at most, on the right.
  Where the display face is set in capitals (`displayCase`), a title over 40 characters reads in
  the face's own case: a long line of capitals is hard going, and the detector reports it as
  all-caps body text.
- **Review.** Long names overflowed the phone title (round 3).

#### Breadcrumbs

Where a record sits, for pages two or more levels deep. The last item is the current page and not a
link. `items`. Long names are cut at 28 characters, with the full name on hover.

- **Open.** The full name needs a mouse (section 2.11).

#### Tabs

Sections of one page or record, with optional counts.

- **Contract.** `tabs` (strings, or `{ value, label, count, countLabel, attention, icon, id,
  panelId }`). `value` or `defaultValue`, `onChange`. `label`.
- **Behaviour.** Tab enters at the selected tab. Left, Right, Home and End move the selection and
  the focus together. Each tab has an `id` and a `panelId`, and its panel has `role="tabpanel"` and
  `aria-labelledby`. `countLabel` is what a screen reader hears for the count ("12 overdue"). The
  default is "12 items", or "3 need you" with `attention`. When the tabs do not fit, the row scrolls
  sideways.
- **States.** The selected tab takes `text-strong` and a 2px `primary` underline. An `attention`
  count takes the highlight, as on the rail.
- **Rules.** Two to seven tabs. Each keeps its own scroll and filters, and the open tab is in the
  URL.
- **Review.** Arrows moved the selection but not the focus (round 1). A tab opened from the URL
  showed an empty record in the starter (round 4). A grey count meant nothing to a screen reader
  (round 5).

#### SideNav

In-page navigation for settings and long documents.

- **Contract.** `items` (strings, which link to `#their-slug`, or `{ label, href, icon }`). `value`
  (the current item; nothing is current until it is set). `label`.
- **Rules.** The current item takes `selected-strong` and a ring. It is sticky beside a settings
  page's sections.
- **Review.** The current item had no ring (round 4). A scroll-spy bug followed (round 5).

#### Toolbar

One row of search, filters and view controls above a table or list, wrapping on narrow screens.
`label` names the group ("[Record] filters"). Search first, then filter chips, a Spacer, then the
view switcher and secondary actions. Selecting rows swaps the filters for bulk actions. It sits 12px
above its table, as one block, and sticks while the table scrolls. On a screen under 560px tall, a
laptop at 200% zoom, it stops sticking: there a sticky bar hid the focused row under it. It keeps
its height when rows are selected, so the table never moves; with no filters it takes no room until
rows are selected, because the row kept for them read as a blank band (a proof run, rounds 1 to 3),
and clearing the selection then puts focus on the next control, the table's select-all.

#### Spacer

A flexible gap inside a Toolbar that pushes what follows to the far end.

#### Stepper

Progress through a short setup: finished steps take a check, the current step a ring.

- **Contract.** `steps` (strings, or `{ label, description }`). `current`. `orientation`.
- **Behaviour.** Each label is read with its state: "Completed", "Current step" or "Not started".
- **Rules.** Five steps at most. Each label is the outcome ("Connect [source]"). Finished steps can
  be revisited.

### 3.12 The assistant

These are the reference's five proven pieces, with Thinking under Feedback. The house rules and
every AI pattern, including the core pieces still to build (a composer, an ask panel, a drafted
marker), are in `10-ai-catalogue.md`. Build those from that file. This section is the component
contract for what is proven.

#### AskBar

Search and ask in one field: records, people, actions, or a question for the assistant.

- **Contract.** `placeholder` ("Search or ask" default; on Home, say what can be found, in the
  product's words). `action` ("Ask" default). `shortcut` (shown; Cmd or Ctrl K focuses the field).
  `onAsk`, `defaultValue`.
- **Rules.** One per product, on Home. Everywhere else the same thing opens from the rail's search
  or the palette. Once there are answers, the AskBar and the answers share one column no wider than
  880px, newest answer last.

#### AIAnswer

What the assistant made, or is making: who made it, the question, its steps, the answer, its
sources, its status and the person's next move.

- **Contract.**
  - Content: `question` (shown in full; the answer's heading), `headingLevel` (3 by default),
    `name`, `children`, `sources` (`{ label, icon, href }`), `caveat`.
  - Work: `thinking`, `steps` and `stepsTitle`, `streaming`, `onStop` and `stopLabel`.
  - Outcome: `status` ("Drafted" by default, "Answered", "Stopped", "Failed"), `actions`,
    `suggestions` and `onSuggest`, `failed`, `onRetry` and `retryLabel`.
- **Behaviour.**
  - While it thinks or streams, the status, sources, suggestions and actions wait for the finished
    answer, and streaming text ends in a caret.
  - One polite status line says when the work starts. When it ends, the line gives the status and
    the answer's first sentence. An answer that loads in finished stays quiet. The same failure
    twice is heard twice, and the line empties itself once spoken.
  - A failure reads Failed, drops the caveat and suggestions, and puts one Try again in the footer.
    After Try again or Stop, focus moves to the steps line or the question, never the page.
- **Rules.**
  - The assistant drafts and a person sends. To act on another system, it asks first with an
    AIProposal.
  - A draft is "Drafted", with Use this, Edit and Discard. An answer is "Answered", with the actions
    it leads to. With several answers on screen, only the newest one's main action is primary.
  - Every figure has a Source. The caveat says what to check first, and "The assistant can be
    wrong." always follows it.
  - Up to three suggestions, in the person's words, each under about 60 characters. They never ask
    what the answer already says and never read "Tell me more". They are quiet buttons, so the
    actions stay the next move.
  - More than one step of work passes `steps`, not `thinking`. Stop keeps what it found. No model
    names, prompts, tokens or raw tool calls on screen. Footer buttons are the default size, as in
    AIProposal.
- **Review.** In round 6: a finished answer was never announced, Try again dropped focus to the
  page, and a failed answer read "Drafted" with an empty body and no retry. Follow-ups looked like
  the actions, the footer broke apart on phones, and nothing could stop a running answer. In round
  6b, the same failure twice was silent, and spoken lines stayed in the accessibility tree.

#### AISteps

What the assistant is doing, step by step, and how each step went. Open while it works, folded to
one line when it is done, so the answer stays the main thing.

- **Contract.** `steps` (`{ label, status, detail }`, with `status` one of `done`, `running`,
  `waiting`, `failed`, `skipped`). `title` (the folded line once done). `defaultOpen`. `onRetry` and
  `retryLabel`. `stopped`. `announceEnd` (true by default; AIAnswer turns it off and says the end
  itself).
- **Behaviour.**
  - The summary line is a button that shows or hides the steps (`aria-expanded`). While it runs it
    reads "Working, step 2 of 4", and the list names the step in hand. It folds itself when the run
    finishes, unless the person has opened or closed it.
  - A failure reads "Failed at step 2 of 3" and a stop "Stopped at step 2 of 3". `title` shows only
    once the run has finished, and never hides a failure or a stop.
  - Each step says its state in words. The start, a failure and the end are announced politely,
    never every change. After Try again, focus moves to the summary line.
  - One spinner at a time: the summary spins only while the list is folded.
- **Rules.** Name each step by what it does, in the person's words, and the step in hand as it
  happens ("Comparing [records] with [source]"). `detail` says where a figure came from and when, or
  what failed. A failed step offers Try again and leaves the steps after it not started. On its own,
  for a long job, it sits in a Card titled with the job's name.
- **Review.** In round 6, two spinners ran at once, the steps line was 36px on touch, and a step
  label that was not plain text was read out as "[object Object]". In round 6b, a step title could
  hide a failure. In round 6c, an empty run read "Working, step 0 of 0".

#### AIProposal

The assistant asks before it acts, and nothing happens until a person presses the button.

- **Contract.**
  - Asking: `title` (a question with the thing and the count: "Send reminders for 2 invoices?"),
    `question` (what the person asked), `children` (why) and `items` (`{ title, meta, badge }`).
  - Framing: `note` ("Nothing happens until you press [button]" by default), `danger`, and
    `headingLevel` (3 by default).
  - Acting: `confirmLabel` (the verb and the count: "Send 2 reminders") with `onConfirm`, plus
    `onEdit`, `onDismiss` ("Not now" by default), `onRetry` and `onUndo`.
  - Outcome: `state` (`asking`, `working`, `done`, `failed`, `dismissed`, shown as Needs you, In
    progress, Done, Failed and Not done) and `result` (what happened; while working, the work).
- **Behaviour.**
  - While it waits, the assistant's colour runs round the card as well as the Needs you badge.
  - Once pressed, the buttons make way for the outcome, which is announced and takes focus. The
    question takes focus when there is nothing to read.
  - The buttons run in reading order: Not now, Edit, then the action. Not now, Edit and Try again
    are described by the question, so a screen reader knows what they act on.
  - A failure keeps Not now, Edit and Try again, and Not now can be undone.
  - Not now, Edit and Try again show only with `onDismiss`, `onEdit` and `onRetry`, and Undo only
    with `onUndo` after Not now. Done shows no Undo: an action already taken is undone where the
    product can reverse it.
  - `question` shows under the title as "You asked: [question]", so it is the person's own words,
    never the assistant's question, which is the title.
- **Copy.** Its badge words are its own: Needs you, In progress, Done, Failed and Not done. The
  written system's status table carries all five with these meanings.
- **Rules.** Use it whenever the assistant would send, pay, approve, change another system or
  delete. One proposal waits at a time, and its action is the only primary on screen while it waits.
  List every record it will touch, five at most, with "and 12 more" in the note. Try again after a
  failure is a secondary button.
- **Review.** A failed proposal was a dead end, and Not now focused an empty status (round 6). The
  outcome showed an outline at rest in forced colours (round 6b).

#### Source

A citation chip under an answer: where a figure came from, linking to it. `icon`, `href`, and its
label as children. It meets the touch size.

- **Review.** Its touch area was 2px short (round 6c).

**Left out on purpose.** Confidence meters, because they invite people to trust a number. A model
picker, because it puts the model's workings on screen. An agent desktop, because it shows
internals and does not fit "the assistant drafts, a person sends". Do not build them.

---

## 4. To build, not yet proven

The reference served one family of internal tools: records, queues, reports and an assistant. A
brand's products also run as customer portals, tablet and phone tools, and consumer apps. These are
the components that wider family needs and the reference never built.

None of them is proven. No review round has checked them, so every heading carries the mark. Each
entry says what it takes from a proven component, which is sourced, and what comes from general
practice, which is marked. Build the default set with the rest of the library. Build the on-demand
set when intake names a surface that needs it.

### 4.1 The default set

#### Combobox · to build, not yet proven

One option from a long or searchable list, including options fetched as the person types. Every
surface.

- From Select: the list opens in a portal, flips up, scrolls the active option into view and is
  named like its field. Past about 15 options, it replaces Select.
- From CommandMenu: typing filters, and screen readers follow the active option.
- *(practice)* It says when nothing matches, and keeps what was typed.

#### Multi-select · to build, not yet proven

Several options, shown as removable tokens: assignees, categories, people to invite. Ops and
portals.

- From Combobox: everything above.
- From Tag: each token's remove button is named "Remove [value]", with a 24px hit area, and 40px on
  touch (section 2.5).
- *(practice)* Backspace in the empty input removes the last token.

#### Date, time and range pickers · to build, not yet proven

A date, a time, or a period for a report. Every surface.

- The reference's own record names the date picker as missing.
- From the overlay rules: the calendar opens in a portal, Escape closes it, and focus returns to
  the field.
- From Delta: a period says what it is compared with ("vs last month").
- From the formatter: times and durations use the `hours` style, so what people type and what they
  read agree.
- From NumberInput: the button that opens the list or calendar is named after its field ("Show
  times for Start"), so seven pickers on a board never read the same. Combobox and MultiSelect
  name theirs the same way ("Show options for Supplier").
- Limit: the name comes from a Field label given as plain text, or the control's own aria-label. A
  label given as an element leaves the button at "Show times" or "Show options" (a NumberInput's
  steppers at "value"), so give that control an aria-label.
- *(practice)* Typing a date always works, in the product's date format. Arrows move by day, and
  Page Up and Page Down by month.

#### Number input · to build, not yet proven

A quantity or an amount, with step buttons. Ops and consumer apps.

- From TextInput: the right `inputMode`, and a prefix or suffix read with the field.
- From IconButton: the step buttons are named by what they change ("Increase quantity").
- From Touch: the step buttons and the field are the control's full height, over the group's edge.
- From Field: a typed value is checked when the person leaves the field, never while they type.
- *(practice)* Up and Down step the value.

#### Sign-in fields · to build, not yet proven

A password with show and hide, and a one-time code. Portals and consumer apps.

- From TextInput: the right `autoComplete` (`current-password`, `new-password`, `one-time-code`).
- From IconButton: the show and hide toggle is named for what it does.
- From Field: an error says what is wrong and how to fix it.
- *(practice)* Never block paste. A code reads as one field to assistive technology, and pasting
  fills every box.

#### File list · to build, not yet proven

The files after a drop: name, size, progress and a remove action. Every surface.

- FileDrop's own rule asks for it: after a drop, show each file with its progress and a way to
  remove it.
- From Progress: the numbers in words beside the bar. From FileDrop: a failed file says why and
  what to do.

#### Plan picker · to build, not yet proven

One plan or option from two to five, shown as cards that say what each includes. Portals and
consumer apps.

- From RadioGroup: one choice from options seen side by side, with the safest preselected. More
  than five is a Select.
- From the formatter: prices use the `currency` style.

#### Popover and toggletip · to build, not yet proven

A non-modal panel anchored to a control: a definition, a quick filter, a short edit. Every surface.

- From MetricCard's hint, where it is proven: hover shows it after a short delay. A press, a tap or
  Enter opens it and reads it out. Escape or a press elsewhere closes it.
- From Menu: a portal, flipping to stay on screen, and focus back to the trigger.

#### Notification centre · to build, not yet proven

The events for the signed-in person, opened from the header or the rail. Ops and portals.

- From NavItem: a highlight count is waiting on the reader, a grey one on others, and zero shows
  nothing. Counts are read as words.
- From Timeline: each line names who did what, and the assistant's lines carry the `ai` tone.
- From Menu: a portal, and focus back to the trigger.
- From colour and contrast: an unread line says Unread in a word on screen. The dot, the weight
  and the colour step are extras: a brand dot can sit at 2:1, and forced colours keep only the
  dot and the weight.

#### Board · to build, not yet proven

Records in columns by stage, for work that moves through steps. Ops.

- From FileDrop's principle: moving a card never depends on dragging. A "Move to" menu on every
  card does the same job.
- From ListRow: a card follows the row's title, meta line and badge rules. Column counts follow
  NavItem.

#### Calendar and schedule · to build, not yet proven

Records on a day, week or month grid: rosters, bookings, appointments. Ops, portals and consumer
apps.

- From SegmentedControl: Day, Week, Month is its own example.
- From DataTable's phone rule: under 640px of its own width, the grid becomes a list by day.
- *(practice)* Every event is reachable by keyboard and reads its time and title.

#### Editable cells · to build, not yet proven

Changing a value in place in a DataTable. Ops.

- From DataTable: selecting a row still never opens or edits it, and the first column still names
  the record.
- From Field: an error says what is wrong and how to fix it, and everything typed is kept.
- *(practice)* Enter starts an edit and Escape cancels it. A failed save leaves the cell open, with
  the typed value.

#### Range selection · to build, not yet proven

Shift-click to select a run of rows in a DataTable. Ops. The reference left it open. Bulk actions
still act only on rows on screen.

#### Conversation · to build, not yet proven

Messages between people, with a composer: support, comments, messaging. Portals and consumer apps.
The assistant's own ask panel is in `10-ai-catalogue.md`.

- From Avatar and Timeline: every message names who sent it and when. A message from the assistant
  carries the `ai` tone.
- From ListRow: an unread message shows a dot and says "(unread)" to screen readers.
- From TextArea: the composer's label says what the text is for.
- From section 2.7: a new message is announced politely, once.

#### Accordion · to build, not yet proven

Sections that open and close in place: help, frequently asked questions, long settings. Portals and
consumer apps.

- From AISteps: the header is a button with `aria-expanded`.
- *(practice)* Opening one section leaves the others as they were.

#### Phone tab bar · to build, not yet proven

Three to five top-level places at the foot of a phone app. Consumer apps, and tablet and phone
tools.

- From NavItem: `aria-current` on the current place, counts read as words, and zero shows nothing.
- From section 2.5: 40px at least, 44px by default, and 8px between targets.
- *(practice)* The reference put the primary action in a bar at the foot. A tab bar wants the same
  place, so decide per product which one owns it.

#### Phone top bar · to build, not yet proven

A detail screen's top bar, with Back and the screen's title. Every surface, on phones.

- From AppShell: under 1024px, list and detail become two screens with a back button, and a top bar
  holds the menu button and the lockup. This makes that bar a component.
- From the focus model: after navigating, focus moves to the new screen's `main`.
- Its actions and its focus take the rail's colours (the on-rail scope), so an icon reads on a dark
  rail. In the page's ink one read at 1.6:1, and axe, which reads no icon, passed it.

#### Workspace switcher · to build, not yet proven

Choosing the account, workspace or client someone is working in. Portals and ops.

- From Sidebar: it opens from the account button, named "[name], [role], account menu".
- From Menu: a portal, arrow keys, and focus back to the trigger.
- *(practice)* The current workspace shows on every screen, and switching says where the person is
  now.

#### Onboarding checklist · to build, not yet proven

First-run tasks someone can do in any order. Portals and consumer apps.

- Not a Stepper: a Stepper is linear, and five steps at most.
- From Stepper: each task is named by its outcome, and finished ones can be revisited.
- From Progress: progress in words ("2 of 5 done").

#### Toast region · to build, not yet proven

The queue that shows, times and pauses toasts. Every surface.

- From Toast: 5 seconds, or 8 with Undo, paused while hovered or focused, above the phone action
  bar.
- The reference left this to the production toast library, and its bundle's Toast was static.

#### Email kit · to build, not yet proven

The product's transactional emails: lockup, heading, body, button and footer. Every surface.

- From ProductLockup: the lockup is meant for product emails.
- From the principles: one primary action per email, labelled verb first.
- The logo's own class rules are written onto its elements, because mail clients strip a
  stylesheet, the brand export's included.
- *(practice)* Inline styles and table layout for mail clients, a plain-text part, and a check in
  light and dark mail apps.

### 4.2 On demand · to build, not yet proven

Every row here is unproven, like the default set.

| Component | Build it when | What it holds |
|---|---|---|
| Slider | A product sets a value on a range | A typed value beside it *(practice)*; a 40px target on touch (section 2.5) |
| Tree | Records nest: folders, locations, an org chart | Arrows move, Right opens a branch, Left closes it *(practice)* |
| Heatmap | A report compares a value across two dimensions, such as hour by day | The whole chart contract (section 3.8) |
| Rich text editor | People write formatted content in the product | Every toolbar control labelled, as IconButton is |
| PIN pad | A kiosk or shared tablet signs people in | 48px keys, and the PIN never read aloud *(practice)* |
| Camera scanner | A field tool reads barcodes or codes | A typed fallback for every scan, by FileDrop's principle |
| Map | Records have places | A list of the same records beside it, as a chart has its table |

### 4.3 Across the library · to build, not yet proven

| Gap | What the reference left |
|---|---|
| Strings and locales | Interface strings were English only, with no way to override them. Give every component its words from one place |
| Right-to-left | Not supported |
| 820px | Never scripted. The bar now checks every component there |
| Truncation | The bundle's full text needed a mouse (section 2.11) |
| Starter parity | RadioGroup, SegmentedControl and the assistant cards were missing from the starter, and neither implementation had a combobox or a date picker |

---

## 5. The README

Every component has one README, generated from its definition (section 6). The reference's 74
READMEs passed both gates in this shape. The sections run in this order:

| Section | What it holds | Leave it out when |
|---|---|---|
| Title and job | `# Name`, then the job in one sentence someone could repeat | Never |
| Named options | **Variants**, **Tones**, **Column types** or **Sizes**: one line per option that needs its own meaning | No option needs a sentence |
| **Props.** | Each prop, its values and its default. Design-mode props say so | Never |
| **Behaviour.** | The keyboard path, where focus goes, what a screen reader hears, and the portal | Nothing about it is interactive or announced |
| **Layout.** | What changes at its own width thresholds, on phones and on touch | Nothing changes |
| **Reading it without the picture.** | The accessible name, the hidden table, the keyboard path through the data | It shows no data as a picture |
| **States.** | Every state the preview shows, and what changes in each | Never |
| **Copy.** | Example strings in the system's voice, and the words it never uses | It carries no words of its own |
| **Rules** | When to use it, when to use something else, its limits, and the review rules | Never |

Write behaviour as facts a script can check: "Escape closes it and returns focus to the trigger",
never "accessible". Use the writing system: sentence case, digits, no em dashes, and invented names
in [brackets]. Name other components by their component names, so the docs link up. Native platform
specs live in `11-platform-layer.md`, keyed by the same names.

The preview sits beside the README and shows the variants and the states that matter, side by side,
with real copy.

### 5.1 A worked example

A fictional component, to show the shape:

```markdown
# CopyField

A read-only value with a copy button: an invite link, an API key, a reference number.

**Props.** `label`, `value`, `masked` (shows the last four characters until revealed),
`copyLabel` (default "Copy [label]"), `onCopy`, `copied` (shows the copied state, for a design).

**Behaviour.** The value sits in a read-only input, so people can select it and a screen reader
reads it with its label. The copy button is an IconButton named by `copyLabel`. Pressing it
copies the value, swaps the icon for a check and says "Copied" once, through a polite status.
Focus stays on the button. When the browser blocks the clipboard, the value is selected instead,
and the status names the copy shortcut for the person's platform.

**Layout.** On touch the button keeps a 44px target and stays beside the value.

**States.** Default. Copied: a check for two seconds, then back. Masked, and revealed. Clipboard
blocked. The read-only edge and lock come from TextInput.

**Copy.** The label names the thing ("Invite link"), never "Value" or "Key".

**Rules**
- A masked secret reveals on request and says who else can see it.
- Say where the value comes from and where to change it.
- When people need to open the link rather than share it, use a TextLink.
```

Its preview would show the default, masked and copied states side by side, with a bracketed sample
value.

---

## 6. One definition, every output

Each component's definition sits beside it, in `components/system/<name>.def.mjs`. Its README, its
Design System preview, its preview board and its entry in the type file all come from it, through
`$A product bundle`. Edit the definition, rebuild, and every output changes together. Never edit a
generated file: the next build silently undoes the correction.

### 6.1 What a definition holds

| Field | Feeds |
|---|---|
| `name`, `group` | The README's title, the card's group, the catalogue |
| `job` | The README's first line, which the Design System shows as the summary |
| `status` | `proven` for the reference's components, `to build` for section 4's, which the README marks |
| `props` | The README's props table and the type file |
| `tables`, `notes` | The README's sections, in the order of section 5 |
| `examples` | Board markup mounting through `NS.<Export>`: the preview board, the Design System preview, and the README's canvas example |
| `checks` | The scripted checks, run in Chrome with a real keyboard |
| `frame`, `card`, `state`, `logic` | The preview's size, the card's height, and the board's own state and element props |

The kit's `CONVENTIONS.md` and `button.def.mjs` show the shape.

### 6.2 What the bundle step writes

```text
product/components/
  <Name>/README.md                   generated
  <Name>/preview.html                generated: the card header, the examples, the runtime inline
  previews/<Name>Preview.dc.html     generated: the examples on a board, with a dark tweak
  bundle.js, bundle.css              built from the starter's own components
  manifest.json, index.d.ts          every export, and the types for every prop
```

- `<Name>/README.md` and `<Name>/preview.html` match the Design System artifact's
  `project/components/` layout, so publishing them is a copy (`12-design-system-artifact.md`).
- The preview's first line is the card header the Design System type reads: the group and the
  height. Check its format against the type's instructions at publish time.
- A Design System preview never sets its own theme: the card viewer shows it in both. The preview
  board takes `?props={"dark":true}`, so the gates scan both themes from one board.
- Each preview is a document of its own, with one main landmark and a visually hidden heading, so a
  page-level accessibility scan reads it as a page.
- A preview is a product surface. The detector and the writing rules apply to it as they do to a
  screen.

### 6.3 What the bundle step refuses

`$A product bundle` stops, naming the file, on a definition with an em dash, a job that is not one
sentence, an example that does not mount through `NS.<Export>`, a check that names an example that
does not exist, a definition for a component the bundle does not export, a type file that does not
compile under strict TypeScript, or a bundle holding a literal `</script`.

### 6.4 Keeping the copies honest

- The bundle, its CSS and the tokens are copied into the Design System artifact, onto the canvas and
  beside the preview boards. `$A product drift` compares every copy by checksum. In the reference, a
  missed copy made a fix invisible in the screenshots.
- Never patch a generated file. Fix the definition, the component or the tokens, and rebuild.
- The manifest lists every export. `$A product drift` fails when a board mounts a component or a prop
  the definitions do not have, or when the starter has a component with no card.
- `$A product gates` renders every preview in both themes and runs the detector, axe and the checks on
  them. Render them to PNG with `preview.mjs` and tile them for reviewers: the reference's first craft
  review worked from 24 contact sheets.
