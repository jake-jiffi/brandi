# Quality gates

Every component and screen goes through two review gates, Impeccable for craft and ui-ux-pro-max
for rules, after a set of deterministic checks the main agent runs itself. A gate is passed by
evidence, never by assertion. This file is the method: who owns what, how a round runs, how
reviewers are briefed, and what goes in the record.

## The bar

| Gate | Pass |
| --- | --- |
| Detector | No findings at 1440, 820 and 390 wide, in light and dark: every component preview, every starter route and state, every canvas board |
| Craft (Impeccable critique) | 34/40 or better on Nielsen's ten heuristics, none under 3, no P0, P1 or P2 open |
| Rules (ui-ux-pro-max) | No Critical, High or Medium open |
| Accessibility | axe clean, every image loaded; nothing scrolls sideways at 320px wide on a fluid board or route; every scripted behaviour check passing |
| Tokens | `$A product audit` reports no fails |
| Drift | Canvas, system and code agree (`09-operate.md`) |
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
   they find before the reviewers start. A board can show a page frame more than once (a shell at
   four widths, a flow of screens), so there axe skips the three rules about one page's landmarks.
   The routes run every rule, and the round record names what was skipped. Every fluid board and
   route is also opened at 320px wide (WCAG 1.4.10: 1280 at 400% zoom, and a small phone) and fails
   when the page scrolls sideways; no detector or axe there, just the overflow, with what sticks out
   named in the record.
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
   fixed, partly fixed or not fixed, each with evidence. Fixes break things. In the last build, two of
   one round's three P1s were caused by the previous round's fixes, and a later round found a Medium
   introduced by a fix and a High that fix had only half solved.

Every fix that mattered gets a scripted check, so it cannot quietly regress.

## Reviewers cannot start reviewers

Impeccable's critique wants two isolated assessments: a design review and a detector pass. A
reviewer running as a subagent cannot start its own subagents, so its critique runs single-context.
Cover for that: the main agent runs the detector, the Impeccable and ui-ux-pro-max reviewers stay
separate, and the record says "single-context" against those scores.

Without a subagent tool at all, run each gate yourself, one at a time, starting each from the
evidence rather than from your memory of the build, and say in the record that the isolation was
procedural.

## The reviewer brief

Set guardrails and the bar, and leave room to think. Every brief carries:

- **The role and its skill.** Read that skill's instructions and references first (for Impeccable:
  critique, audit, the craft floor and Operate mode; for ui-ux-pro-max: its rules by domain and stack).
- **The bar, and the system's own rules to judge against** (the README and the relevant sections).
- **Where everything is:** component pages in both themes, the starter's routes and their port, the
  canvas boards and their port, the source folders, and which board widths are fluid and which fixed.
- **The previous round's findings**, each to be marked fixed, partly fixed or not fixed, with evidence.
- **What the scripts already verified**, so the reviewer does not repeat it.
- **The accepted deviations**, so they are not reported again.
- **What scripts miss:** real keyboard and touch use, forced colours, screen-reader output, and
  anything the last fixes broke.
- **Working rules:** fix nothing; never start or stop the servers; work only in your folder; back
  every finding with evidence; grade on your skill's own scale; return the report as text; aim for
  20 to 25 minutes.

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
- **State bleeding between checks.** A test page left with a modal open breaks every check after it.
  Run each stateful check on a fresh page.
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

## The round record

One folder per round, `product/rounds/round-N/`. `$A product gates` writes `gates.json`; write each
reviewer's report beside it, then turn the two judged reports into the files the round reads:

```json
{ "heuristics": [{ "name": "Visibility of system status", "score": 4 }],
  "findings": [{ "severity": "P2", "title": "Title clipped at 390 in dark", "status": "open" }] }
```

`critique.json` holds all ten heuristics; `rules.json` holds `findings` alone, with ui-ux-pro-max's
severities. A finding's `status` is `open`, `fixed` (verified in this round) or `accepted` (a recorded
deviation). Then `$A product round --round N --critique critique.json --rules rules.json --sign-off
"<name>"` holds every gate against the bar and writes `record.md` and `record.json`. It exits 1 until
the bar is met. The record carries, with a summary row in the quality-gates section:

- Round number, date, and what was in scope.
- Tools and versions.
- Scores per gate (critique /40 with each heuristic, audit /20), and whether each ran single-context.
- Detector findings by target, axe results, behaviour check counts, the token audit line.
- Findings by severity, each with its status and evidence.
- Accepted deviations, each with its reason.
- What changed this round.
- Still open, each with an owner.
- Sign-off: who, and when.

A system that misses the bar is published as a draft, with the record saying so, or not published.
It is never published as if it had passed.
