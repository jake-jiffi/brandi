# Fundamentals first

A template earns its keep on the first screen someone builds with it, or it doesn't. The last system
built this way was reviewed in rounds from a rough first build, and round one's biggest findings were
all things a template should start with: no working phone layout, figures formatted wrongly (0.8%
shown as "80%", $2,490.50 rounded to "$2,491"), focus that escaped dialogs and never came back, and
table rows nobody could reach by keyboard. Fixing them took longer than the first build.

So these come first, before any decorative component, and round one gates them before it looks at
anything else.

## 1. The shell

The shell is the frame every screen sits in: a skip link, the canvas, the navigation rail, and the
main column.

**It measures itself, not the window.** The shell uses container queries, so an artboard on the
canvas, a split view and a browser tab of the same width behave identically. Window media queries
make every canvas board lie about how the product behaves.

| Width of the shell | What changes |
| --- | --- |
| 1280px and up | Full rail; list and detail side by side |
| 1024 to 1279px | Rail collapses to icons (72px), each with a tooltip; detail panes become sheets |
| 640 to 1023px | Rail becomes a drawer behind a top bar carrying the menu button and the product lockup; list and detail become two screens with a back button |
| Under 640px | One column; see the phone layout below |

**The rail, top to bottom:** the product lockup; the search or ask trigger (opens the command menu,
Cmd K or Ctrl K); navigation groups under labels, eight top-level destinations at most; a footer with
settings and help; the signed-in person, which opens the account menu. Rail counts mean work: a
highlighted count is waiting on the reader, a grey one on someone else, and zero shows nothing.

**The drawer** makes everything behind it inert, traps focus, has a visible close button, closes on
Escape, and returns focus to the menu button. A drawer opened without a trigger element does not get
focus back from the dialog library on its own: hand it the return target.

**The main column:** the page header (breadcrumbs from two levels deep, the title, a one-line
description, meta badges, actions on the right, tabs underneath), then panes and cards. The rail
stays put; the main column scrolls; toolbars and table heads stick. Reading, settings and form pages
cap at `content-max`; tables, boards and reports use the full width.

**Skip link first**, on every page, targeting `main`.

## 2. The phone layout

Under 640px, and on any touch screen whatever its width:

- **Tables become lists.** A table that must stay a table on a phone becomes a named, focusable
  scroll region, so a keyboard or screen-reader user knows it scrolls and can reach it.
- **The primary action moves to a sticky bar at the foot.** The page gets scroll padding equal to the
  bar's height, so the bar never hides whatever has focus.
- **Dialogs rise from the bottom**, with full-width buttons.
- **Controls grow:** 40, 44 and 48px for small, default and large, and nothing pressable is under
  40px. Links inside a sentence or a breadcrumb trail keep a 24px target, the WCAG minimum. Keep 8px
  between neighbouring targets.
- **Inputs are 16px**, so iOS never zooms into a field.
- **Long text never hides information behind a mouse.** Anything truncated has a touch route to the
  full text: a toggletip that opens on tap, or a wrap. A `title` attribute alone needs a mouse.

Body text stays at the interface size on phones (14/20 in the default type set): interface text is
labels, rows and values, and a reading size pushes a third of a list below the fold. That is a
deliberate deviation from the usual 16px advice. Record it as one, with the reason.

## 3. The focus model

**The ring is an outline with an offset**, in the `focus` colour (`focus-width` and `focus-offset`
in the tokens). An outline follows the border radius in current browsers and survives Windows forced
colours, where a box-shadow ring disappears entirely. In forced colours the outline becomes
`CanvasText`.

Neither kind of ring escapes an ancestor that clips its overflow: a scroll container, a card with
`overflow: hidden`, a row of tabs that scrolls sideways. Inside one of those, inset the ring with a
negative offset so it draws inside the control. The last system's ring was found clipped in review
for exactly this reason. Check focus inside every scroll container, not only on open ground.

Shadcn's stock components hide the outline (`outline-none`) and draw a box-shadow ring with utility
classes, and utilities beat base styles. The starter's patches remove both, or the outline the
globals file sets never shows (`07-starter.md`).

**Escape closes only the top layer.** A menu inside a dialog closes first, then the dialog.

**Focus moves into an overlay and back out.** Dialogs and sheets trap focus while open and return it
to whatever opened them. Menus, selects, tooltips and the command menu open in a portal above
everything, so a card, table, sheet or dialog never clips them, and they flip to stay on screen.

**Focus never lands on the page body.** After an action removes what had focus (approving the last
row, Undo, closing a dialog that had no trigger, clearing filters, clearing a selection), move focus
somewhere that makes sense: the next item, the page title, or the control that started it. Round
four of the last build found focus dropping to the body after five separate actions, every one of
them a fix from the round before.

**A route change moves focus to `main`**, so people start at the top of the new page. Client-side
navigation in a single-page framework does not do this on its own: the starter carries a component
that does.

**Composite widgets use arrow keys.** Lists, tabs, segmented controls and menus move with the arrow
keys, and focus moves with the selection, not just the highlight. Tab order follows reading order.

**Single-key shortcuts can be turned off** in settings (WCAG 2.1.4): speech input and switch users
need that. Cmd K or Ctrl K opens the command menu everywhere; the key hint shows the right modifier
for the platform.

**Sticky things never hide focus** (WCAG 2.4.11): scroll padding for the phone action bar and sticky
table heads.

## 4. Number formatting

One formatter, one contract, in two places: the component bundle (for the canvas and the previews)
and the starter (for production). If the two disagree, a figure reads one way on the canvas and
another in the product, and nobody notices until a client does.

| Style | Input | Output | Where |
| --- | --- | --- | --- |
| `number` | 1234.5 | 1,234.5 | Counts and plain values. Up to 2 decimals |
| `currency` | 2490.5 | $2,490.50 | Tables and detail. Cents only when there are cents: 2490 is $2,490 |
| `compact` | 1300 | 1.3K | Cards and axes |
| `compact-currency` | 36120 | $36K | Cards and axes |
| `percent` | 12.5 | 12.5% | The input is already in percentage points: never multiply by 100 |
| `points` | 3 | 3 pts | A change in a rate (78% to 81% is 3 pts). 1 is "1 pt" |
| `hours` | 37.75 | 37.75 h | Up to 2 decimals |

Missing and non-finite values format to an empty string, never "NaN" or "0". Negative money is
"-$1,200", never "($1,200)". The locale and the currency come from the brand's market (an Australian
brand formats with en-AU and AUD), and the writing section states the same rules in words.

**Parity is proven, not assumed.** A case table (every style against the same set of values,
including zero, negatives, fractions of a cent, very large numbers, null and NaN) runs against both
implementations, and any difference fails the build. The last system ran 7 styles by 17 values, 119
cases.

## 5. Keyboard paths for tables and menus

Round one also found tables nobody could use without a mouse. These are part of the foundation:

- **Every row is reachable**, and the naming cell is the row's link, so a row opens from the keyboard
  as well as by click.
- **Selecting a row never opens it.** The checkbox selects; the link opens.
- **Bulk actions apply only to rows on screen**, and the selection bar says how many.
- **After a decision, move on.** In a queue, approving a record moves to the next item that needs
  the person, and a toast says so.
- **Up and Down move between rows** in a list beside its detail, and the detail follows.

## Gate them first

Round one checks these before anything else, with a scripted check per item where a script can see
it: the shell at each width, drawer focus, Escape order, focus after each action, route focus, touch
sizes, the phone action bar against focus, the formatter parity table, and table keyboard paths.
A fundamentals failure is at least a P1. Decoration on a broken frame is wasted work.
