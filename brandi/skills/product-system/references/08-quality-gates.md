# Quality gates

Every component and screen goes through two review gates, Impeccable for craft and ui-ux-pro-max
for rules, after a set of deterministic checks the main agent runs itself. A gate is passed by
evidence, never by assertion. This file is the method: who owns what, how a round runs, how
reviewers are briefed, and what goes in the record.

## The bar

| Gate | Pass |
| --- | --- |
| Detector | No findings at 1440, 820 and 390 wide, in light and dark: every component preview, every starter route and state, every canvas board |
| Craft (Impeccable critique) | 34/40 or better on Nielsen's ten heuristics, none under 3, each under 4 with a note on what cost the point, no P0, P1 or P2 open |
| Rules (ui-ux-pro-max) | No Critical, High or Medium open |
| Accessibility | axe clean on every page, none left unscanned, every image loaded; nothing scrolls sideways or is cut off at 320px wide on a fluid board or route; every scripted behaviour check passing |
| Tokens | `$A product audit` reports no fails |
| Drift | Canvas, system and code agree (`09-operate.md`) |
| Canvas runtime | Every board renders without an error under the Design canvas's own runtime, in a cross-origin frame (`06-canvas.md` step 3) |
| Board sizes | Every board's frame fits its content, a page at its whole height, nothing on a board hides its own content, and every hole names a value the board's script gives (Board sizes, below) |
| Coverage | Every surface `product.json` lists has a board at each of its widths and a states board for each of its modules (one for the surface when it has none, unless it only sends messages or skips them with a reason), and a surface with modules shows each core page on a board or skips it with a reason (Coverage, below) |
| Record | Every tool's version pinned and written down |

The two review scales map onto one another, so "nothing Medium or above" means the same thing in
both:

| Impeccable | ui-ux-pro-max | Open at sign-off? |
| --- | --- | --- |
| P0 | Critical | Never |
| P1 | High | Never |
| P2 | Medium | Never |
| P3 | Low | Allowed, listed with an owner |

A raised bar takes more rounds. The last system needed six to reach 32/40 on a lower bar; plan for
more, and do not lower the bar to finish.

## Who owns what

| Owner | Does |
| --- | --- |
| The main agent | The deterministic checks: the detector, axe, the behaviour suites, `$A product audit`, the drift check. Before every round, so reviewers spend their time on judgement |
| Impeccable reviewer | Critique (Nielsen's ten, cognitive load, personas), audit (five dimensions), harden (long text, empty and error states, internationalisation, forced colours), clarify (the copy) and polish. Uses the Operate task mode for dashboards and consoles |
| ui-ux-pro-max reviewer | Its rules by domain (ux, chart, icons) and by stack (shadcn, nextjs), searched and logged. Never its style generator once a brand exists |
| The person running the skill | Signs off the round |

## How a round runs

1. **Deterministic checks first.** `$A product gates` runs the token audit, the drift check, the
   detector on every preview and board (and a running starter's routes, with `--route`) at 1440, 820
   and 390, light and dark, axe on every one of those renders, and every scripted check. Fix what
   they find before the reviewers start. A fluid board is drawn afresh at each width it is scanned
   at: drawn once at its frame's width, every fluid 1440 board scrolled sideways at 390 and 820. A board can show a page frame more than once (a shell at
   four widths, a flow of screens), so there axe skips the three rules about one page's landmarks.
   The routes run every rule, and the round record names what was skipped. The detector skips a page
   that answers 404, so the not-found page is scanned through a proxy on this machine that answers
   200 for it; the record says so. Any other error status is a broken route, listed as not scanned. axe scans a route once its
   h1 shows; a route with none after ten seconds is loaded once more and waited for again, its result
   marked `retried`, counted in the summary line and named in the round record, so a slow page stays on
   the record even when its second load passes. One with no h1 on the second load is scanned anyway and
   fails. Every page is scanned at rest: axe waits for its animations to end (two seconds at most, a
   spinner excepted), since a dialog read mid-fade failed a contrast that passes once it settles. A
   scripted check that fails is run once more, alone with its component's other checks: one
   that passes then counts as passed and is named in the record with its first failure, and one that
   fails again fails the gate. A run's Board check, pressing keys before a menu took focus on a loaded
   machine, failed its gates and passed alone. Every fluid board and
   route is also opened at 320px wide (WCAG 1.4.10: 1280 at 400% zoom, and a small phone) and fails
   when the page scrolls sideways, or when content runs past the window's edge inside a box that clips
   it or a region that scrolls both ways; no detector or axe there, just the overflow, with what sticks
   out named in the record. A portal's home cut its cards 96px off a phone's edge, and the page itself
   never scrolled, so the check that read only the page passed it. What is meant to scroll sideways is
   left out: a table, code, tabs, and a Board, whose columns snap one at a time on a phone. Both wait for a board to say it is ready (`data-dc-ready` on `html`), not
   for it to be visible: a dialog drawn over its page (`06-canvas.md`) has no height of its own, so
   it never counts as visible, and that board went unscanned at every width for two rounds. Only a
   board drawn through the runtime shim says it is ready, or that it failed (`data-dc-error`, which
   the record prints as "the board did not render"). A static board, with nothing to mount, renders
   without the runtime and never says, so it is scanned and measured as it loads. Waiting for it
   left every static board unscanned after 20 seconds. A board that mounts components but rendered
   without the runtime (offline, with React not yet fetched) is not static: it fails unscanned,
   since its bare tags would pass. A page axe could not scan fails the Accessibility gate, and its
   line says how many ("6 not scanned").
   Every board is also measured once against its frame (Board sizes, below). The summary the
   command prints ends with a line for every machine gate, the canvas runtime and board sizes
   included: one run's board failed under the canvas runtime and only a progress line said so.
2. **Reviewers in parallel, each in its own context and its own folder.** Each reads its own skill's
   instructions and references first, then judges against the system's docs and the bar.
3. **Evidence only.** A finding is backed by a screenshot, the DOM, a computed style or a keyboard
   path, or it is not a finding. Reviewers fix nothing, never start or stop servers, and work only in
   their own folder.
4. **Save every report.** Reviewers usually cannot write files, so their reports come back as
   messages. Write each one to `product/rounds/round-N/<gate>.md` the moment it arrives. The last build kept
   only round one's reports as files; the rest survived only in a conversation that later compacted.
5. **Write the fix plan before fixing.** `product/rounds/round-N/fix-plan.md`: every finding, fixed or
   recorded with a decision, before the next round starts.
6. **Verify in the next round.** The next round checks the previous round's findings item by item:
   fixed, still open (with what is left) or accepted, each with evidence. Fixes break things. In the last build, two of
   one round's three P1s were caused by the previous round's fixes, and a later round found a Medium
   introduced by a fix and a High that fix had only half solved.

Every fix that mattered gets a scripted check, so it cannot quietly regress.

**Plan for the time.** Give the first full `$A product gates` of a run up to 90 minutes, and each
later one about 30: one run's first round took 86 minutes for 539 renders, and its next two 27
minutes each for the same renders; a later run's three took 25, 26 and 33 minutes for about 500. The trait loop (`09-operate.md`) takes about 8 minutes a trait.
Run nothing else that drives Chrome beside either: other browser work beside the gates makes checks
flaky, and a scripted check that passed the rounds before it failed once on the same kit. Start the
gates, then do work that needs no browser (the written system, the reviewer briefs, the fix plan),
and run the traits before the gates or after them.

## Coverage

Every gate above checks what was drawn, and none checks what was not. A run drew the console in
depth and almost nothing of the website, the app or the messages, and every gate passed. So
`$A product gates` holds the canvas to the surfaces `product/product.json` lists
(`01-routes-and-intake.md`), and the round is not met until each is covered:

| Key on a surface | What it says | Unset |
| --- | --- | --- |
| `boards` | The prefix every board of the surface starts with (`06-canvas.md`, Names): `"Console"` | The surface's name in PascalCase, `OpsConsole`. Set a short one |
| `widths` | The widths the surface is drawn at: `[1440, 820, 390]` for a console, `[390]` for a phone app | The three checked widths |
| `modules` | The surface's modules: `["Rosters", "Opening hours"]` | None |
| `pages` | Each core page pattern (`04-written-system.md`, Screen patterns) and the board that shows it, or `{ "skip": "why" }`: `{ "Home": "ConsoleHome1440", "Setup": { "skip": "stores are set up by head office" } }` | Unchecked, and the Coverage line says so, on a surface with modules. Nothing to check on one without |
| `states` | For a surface with no modules that has no states to draw, why: `{ "skip": "one fixed page: nothing loads, empties or fails" }` | A surface with no modules needs a states board, unless it only sends messages |
| `platforms` | Where the surface runs: `["web"]`, `["email", "sms"]` (`01-routes-and-intake.md`) | Read here only to tell a surface that only sends messages |

Each surface needs at least one board at each of its widths (the width is the last number in a
board's name, before `Dark`), and each module a states board: a board whose name holds the prefix,
a word of the module of five letters or more, and `States`, as `ConsoleOpeningHoursStates1440`. A
module of short words only ("Menu") is matched by its whole name. A board belongs to the longest
prefix it starts with, so `AppStaffShift820` counts for `AppStaff`, not for `App`, and two surfaces
cannot share a prefix. The Coverage line names what is missing, and the record lists it surface by
surface. Add each new module to its surface's `modules` when it opens (`09-operate.md`), so the gate
asks for its states board.

A surface with no modules (a booking flow, a portal of a few pages, a staff app with one job) needs
a states board of its own: a board whose name holds the prefix and `States`, as `BookingStates390`,
or one per screen, as `BookingTimesStates390`. It draws the surface's empty, loading and
could-not-load states and the failure modes of the systems it touches (`06-canvas.md`, section 3).
A surface with nothing that loads, empties or fails skips them with `"states": { "skip": "why" }`,
and the record prints the reason. A run's booking pages had no modules, so coverage asked for no
states, and neither "no times this week" nor "booking failed" was drawn. A `product.json` from
before this rule is told, surface by surface, which states board each surface now lacks.

A surface that only sends messages, its `platforms` only `email` or `sms`, needs none. An email or a
text is written once and sent: nothing on it loads, empties or fails to load, and what goes wrong
with one (a bounce, a text that never arrived) shows on the surface that sent it, so its states are
drawn there. A messages surface that also has pages of its own (an approval page, an unsubscribe
page, `web` among its platforms) is held to a states board, and so is one that names no platforms.

A surface with modules (a console, or an app with areas of its own) is also held to the eleven core
page patterns. They are Home, Records, List and detail, Record, Report, Settings, Create and edit,
Setup, The assistant, Sign in and Help, the names `04-written-system.md` gives them. A key matches without
its case or a leading "the". Its `pages` names the board that shows each, one of the surface's own
boards on the canvas, or skips the pattern with a reason. Coverage fails on a pattern neither named
nor skipped, a board not on the canvas or of another surface, a skip with no reason, or a name that
is no pattern. Each is listed by surface.

A run drew no create and edit screen at all, every gate passed, and its craft review then lost
points on error prevention and user control, which those screens carry. So a surface with modules
and no `pages` fails Coverage with every pattern listed, and a `product.json` from before the key
needs it before its next round. Help joined the patterns the same way: every proof run scored Help
and documentation 3 of 4, because Help sat in the rail and no board showed what it opens. A surface without modules (a marketing site, messages) has none to check unless it names its
own. The gates read `pages` when they run, so name each page as its board is drawn, before
`$A product gates`.

The record's Coverage section also says, surface by surface, which modules drew options A to D and
which reused a written pattern (`06-canvas.md`, section 4), read from the option boards' names: a
module with two or more boards ending in a letter before the width (`ConsoleRostersC1440`) drew a
set. It is a record, not a pass or a fail: a module that reused a pattern needs nothing drawn. Under
each surface it lists each core page on its board and each skip with its reason, so a reviewer can
open the screen or question the skip.

## Board sizes

`$A product gates` draws every board at its declared frame, as the canvas does, then measures it at
its width in its device's window (900 at 1440, 1180 at 820, 844 at 390), a page in a shell at its
whole height (`06-canvas.md`, Sizes). The gate fails on:

| Finding | What it means | The fix |
| --- | --- | --- |
| A frame clipped | The content runs more than 8px past the frame's height | `$A product boards --heights` |
| A frame blank | The frame is more than a tenth, and 64px, taller than its content | `$A product boards --heights` |
| A box hiding content | Inside the board, a box that clips (`overflow` hidden or clip) holds content more than 4px taller or wider than itself (the record says "across" for wider) | The board's markup (A phone frame, `06-canvas.md`) or the component |
| A hole never given | The board names `{{noop}}` and neither its props nor `renderVals()` give `noop` | Return it from `renderVals()` (`06-canvas.md`, The mount) |
| Not measured | The board did not render, or gave no height | The board, from the error the record prints |

The box check leaves out text cut short on purpose (an ellipsis across, a line clamp after a whole
line), a box that scrolls, a visually hidden one, an overlay drawn open (a positioned menu, listbox,
picker panel, popover, dialog or tooltip, by its role or the kit's name for its panel) and a page
under a dialog's scrim. A run's checkout drew its cards in a phone frame whose main was the flex
column: the cards shrank, the order's total sat hidden inside one, and every other gate passed it.
The same shrinking hid a schedule's one-hour bookings, and the check passed those too: their time
and owner lines each kept the top 8px of an 18px line, and an ellipsis line was read as cut on
purpose. An ellipsis only cuts across, so a line squeezed below its own height is listed, and so
is any positioned box in the page's own layout, such as an event placed on its hours. The round
folder gets `heights.json`, each board's wanted height, for a script that writes the boards. A
starter whose `tools/measure-boards.mjs` predates the gate, its hole check or its check across,
reports it not run, and the round is not met until `brandi product starter --kit` refreshes it.

Across, the same boxes are left out, and an ellipsis is the cut made on purpose. A run's board drew
three cards 240px wide at 820: one card's header action ran 13px past its edge, the card's clip cut
it off, and the check, comparing heights only, listed nothing. How far the content runs is read
from where it ends, not from `scrollWidth` alone: an `overflow: hidden` box is a scroll container,
which counts its end padding as content, so a child that only reached into that padding, in full
view, read as hidden.

Holes are checked as the board renders through the runtime shim, which names on the page each hole
whose first name the board's props and `renderVals()` never give (a loop's own variables count
inside the loop). The gate's line names the board and each hole: "1 board names a value its script
never gives (AppProposal390: noop)". A run's proposal bound `on-edit="{{noop}}"` and
`on-dismiss="{{noop}}"` on a board that never returned `noop`. Both holes drew nothing, the
component quietly left out Edit and Not now, every gate passed, and the craft review found it a
round later. A first name given whose later parts are null is data (`{{booking.note}}` before there
is a booking), not a fault. A hole inside a branch the board does not draw is not checked.
`$A product boards --heights` says the same as it measures the boards, so a fix is caught before
the gates run.

## Reviewers cannot start reviewers

Impeccable's critique wants two isolated assessments: a design review and a detector pass. A
reviewer running as a subagent cannot start its own subagents, so its critique runs single-context.
Cover for that: the main agent runs the detector, the Impeccable and ui-ux-pro-max reviewers stay
separate, and the record says "single-context" against those scores: the review's `method` (The
round record, below).

Without a subagent tool at all, run each gate yourself, one at a time, starting each from the
evidence rather than from your memory of the build, and say in each review's `method` that the
isolation was procedural.

## The reviewer brief

Set guardrails and the bar, and leave room to think. Every brief carries:

- **The role and its skill.** Read that skill's instructions and references first (for Impeccable:
  critique, audit, the craft floor and Operate mode; for ui-ux-pro-max: its rules by domain and stack,
  searched with the installed skill's own `scripts/search.py` as its instructions say. That script
  imports from its own folder, so Python's isolated mode (`python3 -I`) stops it).
- **The bar, and the system's own rules to judge against** (the README and the relevant sections).
- **Where everything is:** component pages in both themes, the starter's routes and their port, the
  canvas boards and their port, the source folders, and which board widths are fluid and which fixed.
  The generated component boards are the kit's specimens in its own sample copy, and each says so:
  judge their behaviour and states there, and the product's words on its own boards.
- **The previous round's findings**, each marked `fixed`, `open` (with a note on what is left) or
  `accepted` (with the recorded deviation), and the evidence.
- **The three status words.** A finding's status is `open`, `fixed` or `accepted`, nothing else: a
  reviewer's "closed" or "partly fixed" counts as open, and the gate names every finding that used one.
- **What the scripts already verified**, so the reviewer does not repeat it.
- **The accepted deviations**, so they are not reported again.
- **What scripts miss:** real keyboard and touch use, forced colours, screen-reader output, and
  anything the last fixes broke.
- **Working rules:** fix nothing; never start or stop the servers; work only in your folder; back
  every finding with evidence; grade on your skill's own scale, and for each heuristic under 4 name
  the board, route or finding that cost the point; return the report as text; aim for 20 to 25
  minutes.

## What scripts miss, and the checks that cover it

- **SVG text.** Neither axe nor a token check reads text drawn in SVG, so chart axis labels can fail
  contrast in one theme while everything reports clean. The last build shipped 3.07:1 axis labels in
  dark because a chart library renamed its tick class and the theme override stopped matching. Chart
  text gets its own check, in both themes.
- **Dark mode under the detector.** The detector cannot set a theme. Build a temporary dark variant,
  run the detector, then restore light, or set the theme attribute on each page before it is scanned.
- **An image that did not load.** axe passes it (`alt=""` is fine, a 0px picture draws nothing to
  judge) and so does the detector. A character pose given as a path from the page root broke on
  every board that way. `axe-pages.mjs` reports every image that does not load and decode as
  `image-not-loaded`.
- **A browser bubble instead of the system's errors.** A form with a required (or aria-required)
  field and no `noValidate` passes axe and the detector, yet an empty submit stops at the
  browser's own bubble, before the submit event, so the ErrorSummary and the Field errors never
  show. Board forms did it. `axe-pages.mjs` reports such a form as `form-without-novalidate`, on
  boards, component previews and routes alike. Limit: it counts every required control, so a form
  whose only required field is disabled, or whose every submit button has `formnovalidate`, fails
  too, though no bubble shows. Give that form `noValidate` as well.
- **An element drawn as a string.** Two holes in one text node, or a hole beside words, are joined
  into text, and an element there reads "[object Object]" (`06-canvas.md`, The mount). axe and the
  detector read it as words. `axe-pages.mjs` reports text or an attribute that reads
  "[object Object]" as `object-as-text`, naming the element.
- **A class the bundle never built.** The system's `bundle.css` holds only the Tailwind classes the
  kit's components use, so a board's own class can select nothing and change nothing on screen.
  `$A validate` names each class no stylesheet the board loads selects (`06-canvas.md`, Five
  limits).
- **A board that works as a page and breaks in a frame.** On the canvas each board runs in a frame
  whose parent is another origin, while Brandi's previews and the gates draw it as the top page. A
  board script that walked `window`'s properties to find the bundle read that parent and threw, so a
  menu got no items and the board showed an error, on the canvas only. `$A validate` refuses a script
  that walks `window`: name the bundle outright, `NS.<Export>` in a definition's logic.
- **State bleeding between checks.** A test page left with a modal open breaks every check after it.
  Run each stateful check on a fresh page.
- **An example wider than its board.** A board clips what runs past its edge, and nothing reports
  it. `$A product boards` draws a wide example down to fit, layout box and all, and says so.
- **A frame the canvas cannot take.** The Design canvas takes a frame of 40 to 8000px each way. A
  generated group board once ran to 20,251px, and nothing said so until the publish. `$A product
  boards` splits a tall group into parts under 7,600px, and `$A validate` refuses a frame outside
  the range.
- **Copies that drift.** When the bundle CSS lives in three places (source, the system, the canvas),
  a missed copy makes a fix invisible in screenshots. Compare checksums of every copy after every build.

## Pin the tools

`$A product gates` writes these into the round's `gates.json` itself, and the record prints them.
Re-run the full gates when any of them changes:

- The Impeccable skill version and the detector engine version (`impeccable engine-probe` prints it).
  More than one engine can be installed side by side, and the launcher the plugin uses may resolve an
  older engine than the newest one on the machine. Point `IMPECCABLE_BIN` at the engine you mean.
- The ui-ux-pro-max release.
- axe-core, the browser automation library and the browser build.
- Node, and the starter's framework and library versions.

A score is only comparable with a score from the same tools. "Detector clean" on an older engine says
nothing about a newer one, which has more checks.

## Accepted deviations

A deviation is allowed when it is deliberate, recorded with its reason, and listed in the reviewer
brief. The last system's are good examples of the kind: interface body text at 14px on phones; 40px
small controls on touch rather than 44; spinners that slow down rather than stop under reduced
motion, because a stopped spinner looks like a hang; a menu that keeps Tab inside it because the
underlying library does; a streamed page keeping a 200 status for a missing record in an internal
tool. A deviation nobody wrote down is a defect.

A judged finding is accepted with the status `accepted` and a `reason` (The round record, below). A
detector finding is accepted in `product/product.json`, because the detector writes no file a
person edits, and a finding a generator causes otherwise blocks the bar with no fix on the
product's side except giving up a brand decision:

```json
"accepted": [
  { "rule": "gray-on-color", "page": "ConsoleRail", "selector": "rail-group", "reason": "The rail's group labels are the brand rail tint, 4.6:1 measured, decided in pd5" }
]
```

- `rule` is the detector's rule, as the record prints it.
- `page` is a board or route name, or the start of one: `ConsoleRail` takes `ConsoleRail1440` and
  `ConsoleRail1440Dark`. `*` takes every page, for a rule the brand decided against everywhere: a
  brand set in one family meets the detector's overused-font on every render, and one run listed 69
  entries, a board family or component page each, before `*` said it once.
- `selector`, optional, is part of the selector the record prints; leave it out to accept the rule
  everywhere on those pages.
- `reason` says why, with a measurement where there is one. An entry without a rule, a page or a
  reason accepts nothing.

The gates leave a matching finding out of the Detector verdict, say on its line how many they
accepted, and list each entry with its reason under "Accepted deviations" in the record. An entry
that matches nothing in the round, or accepts nothing, is named on the Detector line and in the
record, so a stale one does not linger: delete it, or fix it. It does not fail the gate, since a
round run with `--only` scans part of the canvas. The acceptances are read when the round is
judged, so `$A product round` takes a reason written after the gates ran without running them
again. Accept only what the brand decided or a generator causes and cannot yet avoid, and take the
generator's share back into Brandi (`09-operate.md`, After every round).

## The round record

One folder per round, `product/rounds/round-N/`. `$A product gates` writes `gates.json`; write each
reviewer's report beside it, then turn the two judged reports into the files the round reads. The
drift check cannot compare screens with their patterns, so do it by eye, page by page, and write
what you compared and found in `by-eye.md` in the same folder: `$A product round` carries it into
the record, and says it is still to do when the file is not there.

```json
{ "method": "single-context, isolation by procedure: each gate started from the round's evidence",
  "heuristics": [{ "name": "Visibility of system status", "score": 4 },
                 { "name": "Consistency and standards", "score": 3, "note": "ConsoleHome390Dark: the title clipped at 390 (C2)" }],
  "findings": [{ "id": "C2", "severity": "P2", "title": "Title clipped at 390 in dark", "status": "open",
                 "where": "ConsoleHome390Dark", "evidence": "shots/home-390-dark.png: the title ends in an ellipsis",
                 "owner": "Sam", "class": "kit" }] }
```

`critique.json` holds all ten heuristics. Each one scored under 4 carries a `note` saying what cost
the point: the board, route or finding that took it, so the next round knows what to fix. One run
scored five heuristics 3 of 4 and gave no reason for any, and nobody could tell where the points
went. A score under 4 with no note fails the Craft gate, named on its line: a lost point with no
reason cannot be acted on in the next round. `record.md` prints each note beside its score.
`rules.json` holds `findings` alone, with ui-ux-pro-max's severities. Both carry:

- `method`: how the review ran, in a sentence: single-context, or isolation by procedure (Reviewers
  cannot start reviewers, above).
- On each finding, `severity`, `title` and `status`: `open`, `fixed` (verified in this round) or
  `accepted` (a recorded deviation, with its `reason`).
- `where` (the board, route or component), `evidence` (the screenshot, DOM, computed style or
  keyboard path behind it), `owner` (who fixes it, or owns it while it stays open) and `class`
  (kit, generator, gate, reference or brand only: `09-operate.md`, After every round).

A record written before these fields still judges and prints, with less to say, but a score under 4
still needs its note. Then
`$A product round --round N --critique critique.json --rules rules.json --sign-off "<name>"` holds
every gate against the bar and writes `record.md` and `record.json`. It exits 1 until the bar is
met. `record.md` prints each review's method above its scores, each finding with its where,
evidence, owner and class, an "Accepted deviations" section (the detector's acceptances from
`product.json` and every accepted finding, each with its reason) and a "Still open" section
(every finding not fixed or accepted, at any severity, with its owner or "none named"). The record
carries, with a summary row in the quality-gates section:

- Round number, date, and what was in scope.
- Tools and versions.
- Scores per gate (critique /40 with each heuristic and, under 4, what cost the point; audit /20),
  and whether each ran single-context.
- Detector findings by target, axe results, behaviour check counts, the token audit line.
- Coverage: each surface, its prefix, how many boards it has, what it is missing, where a surface
  with no modules keeps its states (its states boards, its skip and reason, or that it only sends
  messages), which modules drew options and which reused a written pattern, and each core page on
  its board or skipped with its reason.
- Board sizes: each frame off its content, each box that hides content, each hole a script never
  gives, each board not measured.
- Findings by severity, each with its status and evidence.
- Accepted deviations, each with its reason.
- Shape the kit chose: every radius, the shell and any missing shape move the brand did not set, each
  with how the kit chose it (`$A product gates` writes them; 02-brand-to-product.md, Shape).
- What changed this round.
- Still open, each with an owner.
- Sign-off: who, and when.

A system that misses the bar is published as a draft, with the record saying so, or not published.
It is never published as if it had passed.
