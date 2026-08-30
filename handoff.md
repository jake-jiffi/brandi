# Handoff: Brandi brand system plugin

Last updated: 2026-08-30, session aa2b5aa0. **Built, reviewed, fixed, installed. 1551 tests passing. v1.14.1.**

## The goal (verbatim intent)

Build the ultimate design/branding skill system for Claude Code. It must take Jake from "here is a
logo and a vague idea", or from literally nothing, through to a complete, durable **design
system** usable for websites, product builds, everything, at the level a very capable professional
branding agency would deliver.

Hard rules: runs in Claude Code; visual steps use `/design`; decisions backed by research; as
automated as possible; fully tested end to end; nothing half baked; fan-out agents allowed with
Fable 5 as boss/reviewer and Opus 5 for workers; write this handoff before compacting.

## What exists now

A Claude Code **plugin** called `brandi` at `./brandi/`, installable from the local marketplace at
`.claude-plugin/marketplace.json`.

```
brandi/
  .claude-plugin/plugin.json
  commands/           brand.md, brand-check.md, brand-status.md, brand-canvas.md
  skills/
    brand-system/     SKILL.md (the harness) + references/01..10
    brand-guardian/   SKILL.md (enforcement, generic)
  scripts/            all zero-dependency Node ESM
    color.mjs         OKLCH, WCAG 2.2, APCA 0.1.9, gamut mapping, CVD, 12-step ramps
    type.mjs          modular scale, fluid clamp, measure, WCAG floors
    system.mjs        buildSystem: the whole resolved design system + audit
    tokens.mjs        DTCG / CSS / Tailwind v4 / TypeScript emitters
    canvas.mjs        .dc.html emitter + validator + canvas.json manifest
    artboards.mjs     the four generated specification sheets
    brandbook.mjs     brand.json -> brand-book.html (prints to A4 PDF)
    brandfile.mjs     brand.json schema, validation, phases, provenance
    guardian.mjs      checkFiles + emitGuardianSkill
    design-locate.mjs finds the ephemeral /design helper
    preview.mjs       .dc.html -> standalone HTML + PNG via headless Chrome
    brandi.mjs       the CLI: init/status/scan/set/system/tokens/sheets/validate/
                      canvas/book/guardian/check/complete
  tests/              803 tests, all passing. Run: cd brandi && node --test "tests/*.test.mjs"
                      colour, type, system, tokens, canvas, artboards, brandfile, guardian,
                      brandbook, tooling, e2e, fuzz (property), robustness, docs (drift)
    fixtures/muddy-paws.json   a complete worked brand, used by many tests
research/benchmarks/  15 cloned reference repos
research/findings/    01..05, ~7500 lines of extracted benchmark analysis
```

## The journey the skill runs

Eight phases, three user touchpoints. `brandi status` is the cursor.

```
recon      scan disk + live site. No questions.
intake     ONE batched AskUserQuestion, <=4 questions, under 90 seconds.
strategy   positioning, audiences, messaging, distinctive assets. No questions.
territories 3 schools from DIFFERENT families -> /design canvas -> USER PICKS.
identity   colour ramps, type scale, shape, motion, logo rules. Audited.
voice      attributes, tone matrix, vocabulary, from evidence.
proof      canvas: Main/Product/Mobile/Deck/Social/Print + 5 generated spec sheets.
publish    tokens + brand book + PDF + companion enforcement skill.
```

Split of labour that matters: **code generates the specification artboards** (palette, typography,
components, tokens) because they must be exactly right; **Claude authors the expressive artboards**
(directions, landing page, app screen, poster) because that is where design judgement lives.

## Critical technical findings (do not re-derive)

**`/design` canvas contract**, captured by invoking `Skill(design)`:
- Base dir is EPHEMERAL and version-pinned:
  `/private/tmp/claude-<uid>/bundled-skills/<cliVersion>/<hash>/design/`, and only exists after
  `/design` has run in the session. NEVER hardcode. `scripts/design-locate.mjs` globs and picks
  newest by mtime. Verified working.
- Helper flags: `--template --out --title --artboard --image --canvas --check --extract --to --force`
- NEVER read `payload.template.html` (~2.4 MB).
- Every `.dc.html` = one artboard. A missing `Main.dc.html` is a WARNING, not a refusal: the
  helper falls back to the first artboard as the entry (verified against helper 2.1.251).
- `.dc.html` shape: exact `<script src="./support.js"></script>` head line; `<x-dc>` root;
  `<helmet><style>`; optional `<script data-dc-script data-props='...'>class Component extends DCLogic{}`.
  `{{holes}}` are dotted lookups ONLY. `data-props` single-quoted, `&`->`&amp;`, `'`->`&#39;`.
- **CSP: no network egress except Google Fonts.** Images = bare base64 (NO `data:` prefix),
  `<img src="file.png">` double-quoted.
- Publish via `Artifact` with `contract: "0.1.31"` + favicon; first publish declares capabilities
  from the `artifact-capabilities` roster.
- Print at 96 px/inch: A4 794x1123, Letter 816x1056, A5 559x794.
- All of the above is enforced by `canvas.mjs validateArtboard`, with tests.

**Name collision**: `~/.claude/skills/skills/design` is an unrelated Apple/SwiftUI skill. The
built-in canvas skill is what `/design` resolves to.

**Environment**: node v24.13.0, bun 1.3.9, Chrome at
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (headless, for PDF and previews).
Zero npm dependencies is a hard constraint. Tests are `node:test`.

**Design decisions worth not re-litigating**:
- Ramps are three-zone: 1-8 surfaces (fixed lightness spine, monotonic), 9-10 solids (step 9 IS the
  brand colour), 11-12 text. Lightness is deliberately NOT monotonic across 8->9; Radix does the
  same thing, and forcing it either moves the brand colour or crushes the surface band.
- Type scale uses the full ratio above body size and its square root below, because there is only
  ~4px of room between 16px and the 12px floor. Steps under 12px are dropped, not shipped.
- CSS re-declares primitive ramps per theme (Radix pattern) and declares semantics per theme too,
  so a role can point at a different step in each theme.
- `accessibleSolid` finds the nearest colour on the brand hue where a label reaches Lc 75, because
  mid-lightness greens/teals/oranges cannot carry a readable label at their raw value.

## Status: done

- [x] Research read, 15 benchmark repos cloned, 5 findings files written
- [x] `/design` canvas contract captured and encoded in a validator
- [x] Every module built: colour, type, system, tokens, canvas, artboards, brandfile,
      guardian, brandbook, preview, design-locate, CLI
- [x] 855 tests passing: unit, property/fuzz, robustness, documentation-drift,
      per-finding regressions, and a real end-to-end CLI run
- [x] SKILL.md harness, brand-guardian skill, brand-critic agent, 4 commands, manifests
- [x] All 10 reference files (~7,000 lines)
- [x] Fable adversarial review (`review-01.md`): 18 confirmed findings, 5 suspected.
      ALL addressed, each with a regression test in `tests/regressions.test.mjs`
- [x] Installed as `brandi@brandi` v1.14.1, user scope. `brandi` is on PATH next session
- [x] Live canvas published twice through the real Artifact tool
      https://claude.ai/code/artifact/dc48ba49-0d94-4924-b0c1-2257dbd77548
- [x] Every command re-walked against the INSTALLED plugin at v1.7.3, not just the source tree:
      init, status, system, tokens, sheets, validate, book, book --pdf (23 pages), fonts,
      guardian, check, canvas. The canvas seeds and passes its own check with 7 artboards.

## Bugs found and fixed

Mine, from my own adversarial pass:
- `validateBrand` threw on a list field holding a non-list. Everything reads through `asArray` now.
- `completePhase` did not name the valid phases in its error.
- `artboard()` silently dropped a `$preview` hint when no other props were passed.
- `new URL(import.meta.url).pathname` and string-built `file://` URLs broke on paths with spaces.
- The skill told Claude to call `addEvidence`, a JS function with no CLI surface.
- `brand.json` declared a `$schema` that did not exist.
- The demo landing page used a three-column feature grid with 01/02/03 numbering, which the
  project's own anti-slop rules forbid. The validator now warns on that combination.
- `04-anti-slop.md` did not name every font in `BANNED_FONTS`.

From the review (see review-01.md for the full write-up):
- C1 The book asserted WCAG conformance its own audit had just disproved. The accessibility
  section is now rendered from live measurement, with verdicts, and admits failure at the top.
- C2 The audit gated nothing downstream. `assertPublishable` now blocks book/tokens/sheets/
  guardian/canvas unless `--force`, which records the failures.
- C3 Six validator false negatives (quoted fonts, css `url()`, `@import`, iframe/video/object/
  embed, reordered dc-script attributes, second logic block) and one false positive (a question
  mark after a hole blocked publishing). All fixed. The spacing rule the recipe promised is now
  actually implemented as `findCrowding`.
- C4 `brandi sheets` rewrote canvas.json from scratch, giving every authored artboard a 1440x900
  frame and clipping them. It now merges, preserving sizes.
- C5 `canvasManifest` accepted a missing width and turned the whole layout to NaN.
- C6 The focus ring was verified against the brand ramp's step 1, not the neutral page it sits on.
- C7 The components sheet's hover state broke its own Lc 60 rule, and printed a rationale for an
  adjustment it had not made.
- C9 The dark contrast table was pale grey on white at 1.8:1.
- C10 Boolean flags swallowed the next positional argument.
- C11 `brandi set` confirmed writes it discarded, and coerced "2024" to a number.
- C12 The book never rendered applications and never showed a supplied logo.
- C13 Four wrong WCAG citations in client-facing output.
- C14 Reference files told Claude to run paths that do not resolve from a user's project.
- C15 Label colours were picked by WCAG and judged by APCA, and lost on mid-tone colours.
- C16 The guardian only understood hex, so `rgb(...)` walked past it.
- C17 NaN and negative chroma passed through the colour engine.
- S1 The Territories round published without a Main artboard.
- S2 `${ARGUMENTS:-.}` in a command file.
- S4 A typeface Google Fonts does not serve failed silently. `brandi fonts` now checks.

From the reviewer's addendum and the evidence agent, after the first round of fixes:
- DTCG was described as a W3C standard across the README, both manifests, SKILL.md, the book and
  the token emitter. It is a Community Group Report, NOT on the W3C Standards Track, and the
  current draft says "Do not attempt to implement this version." Corrected everywhere, with the
  status stated in the emitted tokens.json itself.
- `toTailwind` emitted self-referential declarations (`--text-base: var(--text-base)`), which
  resolved only by accident of import order. Now aliases where the namespace differs and carries
  literal values where it does not.
- The book rendered a structured `logo.misuse` entry as `[object Object]`. It now renders either
  shape, and an unusable entry produces no bullet rather than an empty one.
- S1 settled empirically against helper 2.1.251: a Main-less seed WARNS and falls back to the first
  artboard. It is not a hard requirement, and the docs no longer claim it is.
- The demo poster omitted the brand's own declared distinctive asset. The mark was also too thin to
  read. Both fixed: three weighted arcs with shrinking droplets, at poster scale, cropped past two
  edges, plus an in-artefact justification for sitting near the cream-and-serif hazard.

## Round three: the gaps Jake spotted on the published canvas

- **canvasManifest laid out every artboard on ONE cursor** while the canvas splits them by page, so
  each page rendered with the other page's slots as holes. The Design page spanned 7,531px for
  3,600px of content. Each page now lays out independently. This was the visible "gaps".
- The merge preserved positions when SIZES had changed, which put artboards through each other.
  Positions are now only kept when the sizes they were computed against are unchanged, and an
  overlapping layout falls back to a fresh pass instead of asking the user to delete a file.
- The demo carried 3 of the 6 proof artboards the skill itself specifies. Product (a dense screen
  with a real table, every field state, an empty state and an error), Deck and Social now exist.
- **The book was dropping supplied content**: narrative, category, schoolRationale, the whole voice
  mechanics table, how-we-say-hard-things, the change log, the legal name, the colour proportion
  rule, open questions' changesIf, and the ENTIRE messaging hierarchy. 15 sections became 19, with
  new Messaging and Direction chapters.
- `tests/brandbook.test.mjs` now walks every prose leaf in the fixture and fails if it does not
  reach the page. That is the guard against this whole class of problem, not just these instances.

## Every artboard rendered and looked at

Two of the six proof artboards were wrong in ways the validator cannot see, and only looking found
them:
- The Deck put `max-width: 24ch` on the flex column rather than on each child. 24ch of a 96px
  display face is about four times 24ch of a 30px body face, so the paragraph wrapped at fourteen
  characters and the three-step footer was pushed off the slide entirely.
- The Social post cropped the mark past two edges, cutting off the droplets that make it read as a
  shake rather than a smudge.

Both fixed. More importantly, SKILL.md's Proof phase and `05-canvas-recipes.md` now REQUIRE
rendering every artboard through `preview.mjs` and looking at it before publishing, with both traps
written down. The validator is structural; it cannot tell you a layout is merely bad.

## The journey itself, dry-run

The machinery was tested exhaustively; the JOURNEY never was. Running phase 4 as a user would
found two more things:

- **`brandi` is not on PATH in the session you install it in.** Claude Code adds a plugin's `bin`
  to PATH from the NEXT session, which is exactly the session someone installs in. Every skill and
  command now resolves with `command -v brandi`, then a glob of
  `~/.claude/plugins/cache/*/brandi/*/bin/brandi` sorted by version, then the skill's own base
  directory. No restart needed.
- **A Territories round was built end to end** for a from-nothing brief (a two-person structural
  engineering practice): three schools from three different families, each carrying the same six
  parts, plus a Main contents page. It works, and it produced a genuine choice rather than three
  shades of the same idea. Published at
  https://claude.ai/code/artifact/a968b37d-3c16-4765-beb4-58fa550f4d53
  Two authoring mistakes surfaced and are worth knowing: a `flex:1` hero whose content used
  `margin-top:auto` left a 250px void, and a swatch the same colour as the ground vanished without
  an outline on the strip.

## The headline case, tested at last

The stated use case is "a logo and some light concepts". Only from-nothing and a fully-specified
fixture had ever been run. Testing the middle found four things, all now fixed with tests:

- **Recon read nothing out of the logo.** It found the file and ignored its contents, so someone
  handing over an SVG containing their entire palette was told nothing was found to build on.
  `scan` now extracts colours and typefaces from vector logos, and ranks them far above anything
  merely repeated in a stylesheet: a colour in the logo is a decision, one in CSS may be an
  accident. It says so in the output.
- **`loadLogoAssets` only looked inside `brand/`**, and its own security guard prevented finding a
  logo at `assets/logo.svg`, which is where it actually lives. Now resolved against `brand/` then
  the project root, stopping at the project root. Traversal and absolute paths are still refused,
  with a test that proves it.
- **A banned typeface passed the audit.** Fraunces could be set as the display face and nothing said
  a word until an artboard was validated, by which point it is in the brand file and in everyone's
  head. `auditSystem` now warns at the point of decision, for every role.
- `stat` was not checking `isFile()` before reading.

## The three paths I had named as untested, now walked

1. **Resuming a half-finished journey.** Works. `status` reports which phases are done, which is
   current, and exactly what is blocking the next one. Phases advance correctly from a resumed file.
2. **A real codebase rather than a synthetic one.** Found a significant gap. `scan` only read
   colour from `.css` and `.scss`, so against a real repository (dominikmartn/hue, twenty-one HTML
   files full of hex) it reported "nothing to build on". It now reads markup and components
   (html, jsx, tsx, vue, svelte, astro) as well, sorted so shallower files win. Two follow-on fixes:
   arbitrary `.ts`/`.js` modules are NOT mined, because a hex in a constant is not a brand decision,
   and an unresolved template literal is no longer reported as a typeface called `${body}`.
3. **The guardian skill in a fresh project.** Works. Valid frontmatter, description parses as a
   quoted scalar, the embedded absolute CLI path runs from any directory, and it correctly flags a
   fresh project's off-palette colours, banned font and removed focus outline.

## v1.6.0: what a 566MB monorepo taught it

`check` was pointed at `research/benchmarks/nexu_open-design` (13,158 files, 9,615 of them
checkable). It ran in ten seconds and returned 48,200 findings as a flat list, which is not a
report: it is the exact failure the guardian skill warns about, produced by the guardian. Two
defects, both invisible at fixture scale:

1. **Hex heuristics that are fine on a stylesheet are wrong on TypeScript and markdown.** `#3408`,
   `#847` in `see #847`, `[PR #194]` and `(#648)` were all being read as colours. Four-digit `#RGBA`
   is now dropped outright (legal CSS, vanishingly rare, indistinguishable from an issue reference).
   Three digits are accepted only on evidence, any one of which suffices: a hex letter (issue
   numbers are decimal), a value position (`:`, `=`, quote, `(`, `,` immediately before), or a
   declaration run on the same line, which is what `border: 1px solid #111` needs. Three things
   veto it at any length: brackets on both sides (`(#648)`, `url(#123)`), a reference word before it
   (`issue #744`, `closes #784`), and a fragment reference (`href="#abc"`, `url(#fade)`, those
   point at elements, not colours). Two of the four cases were found by the tests, not the design.

   Measured, not argued: over the 6,000 style, markup and prose files in that repo, the accepted
   all-decimal three-digit hexes went from thousands of ticket numbers to 548, of which a hand count
   found three still wrong, all in markdown prose and all warn-level.
2. **The report shape.** `check` now leads with counts by rule, then the worst ten files, then the
   forty most consequential findings (`--limit N` for more), and says plainly that a count this
   large usually means the target is wider than the brand. `--json` is never truncated, and now
   carries `byRule` and `worstFiles` for anything scripting it.

Also hardened: `--limit` and `--depth` go through `intFlag`, which refuses junk loudly. `--limit
abc` used to become `NaN`, and `slice(0, NaN)` printed an empty report that read as a clean pass;
a bare `--limit` parsed as `true`, and `Number(true)` is 1.

**Found by attacking the fix rather than confirming it** (the adversarial-review pass, which is the
part worth keeping):
- The declaration rule read the whole line prefix, and minified CSS is one line. That made colour
  extraction quadratic: 115KB took 1.2s, so a 1MB bundle would have taken about ninety seconds and
  looked like a hang. The lookback is now bounded to 240 characters, which is further than any
  property name sits from its value. 13ms for the same input, and ten times the input takes ten
  times as long. There is a test that fails if it ever goes quadratic again.
- `fixed` was in the reference-word veto, and `fixed` is a real keyword in the `background`
  shorthand: `background: fixed #333` would have silently lost a colour. Removed.
- `href="#abc"` and `url(#fade)` are fragment references, not colours, at every hex length. They
  were being counted. Now vetoed, while `fill` and `stroke` on the same element still work.

## v1.7.0: the specification set has a front page

`brandi sheets` wrote six artboards and no `Main.dc.html`, so the tool's own output failed the
tool's own validator and the canvas seeder warned about the missing entry. It now writes a seventh:
a contents page stating the resolved system in one screen (primary, accent, the three faces, the
scale, the measure, the spacing base, shape and motion stances, focus, ramp counts), then what each
sheet covers, then where the same system lives in other forms.

The behaviour around it is the part worth knowing:
- It sits on the **Design** page, not the Specification page, because it is the entry to the canvas.
  With it there, the launch view lands on Design as it always intended to.
- A rerun **regenerates** it, because a contents page that states a system the system no longer has
  is exactly the drift this tool exists to stop. It is recognised by a marker string in its own
  source, not by its filename.
- An **authored** `Main.dc.html` is kept untouched, and `sheets` says so. `--force` overwrites it.
- When an authored Main replaces the generated one, the recorded frame is **discarded** rather than
  inherited. That was a real trap found by attacking the feature: a 1440x1600 home page would have
  been put in the contents page's 1200x1286 frame and clipped 300px in silence, which is the one
  canvas failure that cannot be recovered without a re-seed. It now falls back to 1440x900 and says
  out loud that nothing told it the size.

Rendered and checked at both extremes: the default brand, and a deliberately long brand name with
the wordiest shape and motion stances, which wraps two rows and still leaves 140px of frame.

## v1.7.1: the guardian stopped auditing its own output

Generating a clean brand and running `brandi check .` immediately afterwards, which is the most
natural first thing anyone does, reported **27 errors and 14 warnings against the tool's own
output**. Every one was a false positive of the same kind: the brand book's misuse pages quote the
banned vocabulary in order to ban it, the palette sheet renders colour-blindness simulations that
are off-palette by definition, and the "what not to do" examples contain lorem and "Welcome to".

Everything Brandi generates now declares itself in its head (`generated from the resolved system`,
carried as a `<meta name="generator">` in the book and in the artboard's system note), and `check`
skips those files and says how many it skipped. Authored artboards in the same directory carry no
marker and are still checked, because those are the design work. The marker only counts in the
first 4KB, so a file that merely quotes the phrase is not exempt.

Result on the same fresh brand: one file reported, which is the one file that was actually off-brand.

Every user-facing count now goes through a `plural` helper, because a tool whose whole subject is
craft should not print "Checked 1 files".

## v1.8.0: what a design critic found, and what of it was the tool's fault

A `general-purpose` agent read all six authored artboards as rendered PNGs, ran both mechanical
passes, and returned thirteen ranked findings. Most were about the worked example's own content.
**Four were defects in what the tool generates**, and those are fixed:

1. **The misuse captions were ungrammatical.** The logo sheet prefixed "do not " to past
   participles, so it shipped "do not rotated" eight times over. Captions are now imperative behind
   "Never", and the drawings are keyed by `id` so a caption can be rewritten without breaking one.
2. **Loading did not exist anywhere in the system.** Rest, hover, active, focus and disabled were
   all drawn; the state a control is in while it fetches was not, and that is the one every
   developer then invents differently. There is now a sixth button state with `aria-busy`, and a
   "Waiting" block with a skeleton, a rule against animating faster than 1.5s, and what to do under
   `prefers-reduced-motion`.
3. **No breakpoints at all.** A developer got a 1440 artboard, a 390 artboard and no rule joining
   them. `system.layout` now carries four breakpoints, each saying what changes at it, plus a
   content column computed from the measure the system already resolved rather than copied from a
   framework. `xl` is the fluid type scale's own ceiling, so type and layout stop growing together.
   They reach CSS, Tailwind v4, TypeScript and DTCG, the token sheet, the contents page and the
   book. The CSS carries the caveat that a custom property cannot be used inside a media query.
4. **The component sheet was boilerplate wearing the palette.** Its buttons said "Get started" while
   the brand file said, in its own words, "A verb the person would use. 'Book a groom', not
   'Submit'." The primary label is now taken from that sentence: the first quoted phrase before the
   counter-example, falling back rather than inventing when the rule has no example in it.

**And one new pass, which is the critic's method turned into code.** Its three strongest findings
were not about how anything looked. They were contradictions between two things `brand.json` already
contained: four logo variants documented and one drawn, a favicon pointing at a file that does not
exist, an art direction written and no image anywhere. `brandi validate` now reports those
separately from the rendering checks, under "The brief and the deliverable disagree":

- a logo file or variant that is documented but not on disk (error)
- a favicon pointing at nothing (error)
- a written art direction with no image or captioned `[PHOTOGRAPH: ...]` on any **authored**
  artboard, and silent until there is authored work to judge (error)
- an application named in the brief and never drawn, where the generated contents page standing at
  `Main.dc.html` does not count as the home page being drawn (warning)

Deleting the claim from `brand.json` clears the finding as legitimately as doing the work. Leaving
both standing is the only thing it refuses.

**A bug this found in itself.** The first wiring of that pass sat behind a bare `catch {}`, which
swallowed a `ReferenceError` from a missing import and printed "Clean." over eight real errors. The
catch now only forgives a brand file that will not parse, and rethrows everything else. A checker
that reports clean when it is broken is worse than no checker.

## Renamed: Atelier became Brandi (v1.8.1)

Jake's call, and the right one: "brandi", Jiffi-esque, the brand word with the i. Mechanical but
total. The directory, the binary, the CLI module, the plugin, the marketplace, the four slash
commands and all 269 textual references moved together, and the old plugin was uninstalled before
the new one went in, so `/atelier:*` is gone rather than shadowing `/brandi:*`.

- `brandi/` (was `atelier/`), `brandi/bin/brandi`, `brandi/scripts/brandi.mjs`
- `/brandi:brand`, `/brandi:brand-status`, `/brandi:brand-check`, `/brandi:brand-canvas`
- installed as `brandi@brandi`, marketplace `brandi`
- `system.meta.builtBy` is now `brandi`, so brand files built by the old name will read as
  `atelier` and that is correct history, not drift
- the repository directory is still `jiffi-design-branding-skill`, which is Jake's to rename

One trap worth recording: zsh does not word-split an unquoted `$var`, so a `for f in $FILES` loop
handed `sed` one enormous argument and silently renamed nothing but the directory. The rename ran
properly through `grep -rIl ... | while IFS= read -r f`. This is the fifth time that has cost
something in this project.

## v1.9.0: the anti-slop contract now runs

A Palate review found the biggest defect in this build, and it was mine. `04-anti-slop.md` has
always carried a 193-line YAML block that opens with "this is the linter contract", covering roughly
forty rules with severities, regexes and a waiver syntax. **Nothing parsed it.** The only code that
touched the file was a docs test checking that some font names appeared in the prose.

Meanwhile the rules were implemented twice, by hand, in two places that disagreed:
`guardian.mjs` had seven patterns and `canvas.mjs` had a third overlapping set, and a comment in
canvas.mjs recorded the day `font-family: 'Inter', sans-serif` passed one validator and failed the
other. Forty rules were specified. Seven were enforced. Two implementations drifted.

`scripts/slop.mjs` now parses the document and is the only reader. Both validators call it, the
hand-maintained copies are deleted, and `BANNED_FONTS` is a view of the contract rather than a
fourth list. Coverage went from 7 rules to 36. On the 566MB monorepo, `check` now reports 219 banned
faces, 240 glassmorphism blocks, 227 multi-hue gradients and 827 trust-gradient blues that it
previously could not see, in 24 seconds against the old 9.

What the wiring itself forced, all of which are improvements to the rules rather than to the code:

- **Only the first family in a stack is a choice.** `'Karla', system-ui, sans-serif` is correct
  practice, and reading it as a violation flagged Brandi's own sheets sixteen times over. A ban on a
  fallback is a ban on graceful degradation.
- **A ban and a default are different claims.** The contract separates `literals` (p0) from
  `soft_literals` (p1, "defaults rather than bans"); flattening them turned "Instrument Serif is a
  default you should argue for" into "Instrument Serif is forbidden".
- **The waiver works, and needs a reason.** `/* anti-slop-waiver: the client licences Inter */`
  stands a rule down. `/* anti-slop-waiver: */` does not, and is itself reported: a waiver with no
  argument is how a rule set quietly stops meaning anything. This is also the answer to Inter, which
  Palate's own corpus says is the right off-the-shelf choice when a bespoke face is out of budget.
- **The left-accent-card regex only matched one declaration order.** CSS declaration order is
  arbitrary, so it missed half of them.
- **A purple gradient is usually written with two stops**, and the rule required three.
- **A rule whose own text says "flag unless a human judges otherwise" is a `watch`, not a `p2`.**
- **`raw_hex_outside_root` ignored its own stated scope** and counted the whole document, so every
  swatch sheet was a violation for printing swatches.
- **A ground rule fires on grounds**, not on a hex printed in a table.
- Repeats collapse: three per rule per file, one for a `watch`. A rule that fired 138 times in one
  file was not a report.

Two accessibility rules that only existed in code moved into the document, so the contract is now
the whole specification: `focus_outline_removed` and `animation_without_reduced_motion`, both using
a new `unless` key that stands a rule down when the file answered it.

The parser is a deliberately small YAML subset. Its failure mode would be silence, so `assertContract`
states what the document must contain and throws on load if a group vanishes or a regex stops
compiling. There are 29 tests on the parser alone, including the one that matters: a `#` inside a
quoted string is a colour, not a comment, and getting that wrong deletes every hex in the contract
and leaves a linter that bans nothing while reporting clean.

**One more rule, from the same review.** The em-dash house rule was enforced only by tests over
Brandi's own documents and its own generated output. Nothing stopped an authored artboard, or a
client's page, from carrying them. It is now `ai_punctuation` in the contract, so `check` and
`validate` both enforce it on anything a person writes. Letters both sides, because a numeric range
is what an en dash is for, and the rule is written as unicode escapes so the document does not trip
itself.

**A migration the rename broke, and its fix.** The brand file's top-level block was called `atelier`
and the sed renamed the validator to expect `brandi`, which rejected every brand file written before
the rename. `migrateBrand` now reads either and keeps the block in its original position. An older
file is an older file, not a broken one.

### v1.10.1: the waiver did not actually waive

Found by a follow-up pass, and it was a bug introduced the same day as the mechanism it broke. The
contract was wired into `checkFiles`, but the guardian's own typeface loop kept running beside it
with its own copy of the judgement. One `font-family: Inter` produced two findings from two code
paths: a waivable `banned-font` from the contract, and an unwaivable `off-brand-type` error carrying
the same "machine-generated" message. A correct, reasoned waiver silenced one and the run still
failed on the other.

A waiver that does not waive is worse than no waiver, because it teaches people the mechanism does
not work. The typeface loop now reports only what the contract does not: a face that is off-brand
but on no slop list. The slop judgement belongs to the contract, where it is waivable and where the
reason gets recorded.

The doctrine had to move with it. `SKILL.md` said Inter and the rest were "banned outright", which
was false once the waiver existed and contradicted the same file's rule that existing usage beats
fresh invention. Refused is not forbidden: a face the client already licences is evidence, and
evidence beats a general rule. Both the harness and every emitted guardian skill now say so, and
both point at `$A decision` so the reason lands in the brand book rather than in a CSS comment.

## The agency gap review: what Brandi is not, and the ranked list

A Fable reviewer generated the full Muddy Paws output, rendered the artboards through headless
Chrome, and measured the result against what an independent agency hands over. Verdict: **not a
final product.** A strong digital design-system core and governance apparatus, with the
identity-asset, production and application layers largely absent.

Its framing is the useful part. A brand programme ships six layers, and Brandi ships:

| Layer | State |
| --- | --- |
| Strategy | about a third |
| Identity assets | almost none |
| Design system | high standard |
| Applications and templates | almost none |
| Written apparatus | about 70% |
| Governance and rollout | above most agencies |

Clients judge the engagement on identity assets and applications, because those are the things they
can hold.

**The structural finding, which explains most of the rest.** The reference layer already knows what
a full handover is: `06-brand-book-outline.md` is a 23-section spec with hard audit gates, and
`08-logo-system.md` specifies the favicon package, embroidery constraints and four-system print
colour. `schemas/brand.schema.json` is the bottleneck. The references name fields that do not exist
(`logo.placement`, `logo.monochrome`, `minSize.basis`, `colors[].cmyk`, `colors[].pantone`,
`signatureMoves`, `motion.principle`, `misuse[].source/image`), so the knowledge dies in the
coaching layer and never reaches the deliverable. Even the flagship fixture fails its own reference's
gates: three copy pairs against fifteen, three decisions against six, misuse as plain strings. The
fix is unglamorous, and it is not more reference prose: schema fields plus render blocks.

Ranked by consequence, with the reviewer's effort estimates:

1. Asset export pack from an SVG master: rasters at sizes, mono and reversed as separate files,
   favicon/ICO/maskable, a circular-crop-safe avatar. Generatable. 1 to 2 days. Highest value,
   lowest risk on the list. Today `scan` reads assets in and nothing writes assets out.
2. Print colour. There is no CMYK, Pantone or spot guidance anywhere in the deliverable, verified by
   grep returning zero across all generated output. The worked example is a physical shop whose
   applications are a 400mm shopfront wordmark and an A4 flyer, specified only in hex. 1 day for
   conversion plus schema fields; honest Pantone needs a human and a press proof.
3. Channel-conditioned proof set plus card, signage and vehicle recipes. The harness contradicts
   itself here: intake Q2 says a word-of-mouth business needs a card, a sign and a vehicle before a
   social kit, and the mandated proof set is home page, product, mobile, deck, social, flyer. A
   `businessCard` frame preset exists at `canvas.mjs:42` and is used nowhere. 1 to 2 days.
4. Verbal identity production layer: boilerplate at 25/50/100 words, elevator pitch, per-audience
   messages, tagline usage rules. 1 day.
5. Schema-to-reference reconciliation, including a signature-moves section and the misuse grid
   rendered in the book rather than printed as prose. 2 to 4 days.
6. Icon starter set (hours to scaffold; bespoke is human).
7. Shot list generated from `imagery.direction` (hours).
8. Trademark and rights block plus a colophon (hours; the search is a lawyer).
9. Templates: deck master, email signature, invoice (days as artboards).
10. The logo itself stays human, and the product should keep saying so as plainly as
    `artboards.mjs:799` already does.

**Fixed on the spot (v1.9.2), because it was a hole in a check written the same day.** The promise
pass only validated applications that already carried a file, so an application with no file at all
silently passed the check built to catch unkept promises. In the worked example the two that slipped
through were the shopfront and the bay instructions: the physical work, which is the part a client
checks first. `application-not-assigned` now catches it.

**Also fixed (v1.10.0): the type system had no weights.** Buried in the nice-to-have tier, but it is
a hole in the part of the tool that is supposed to be strongest. Five token formats carried sizes,
line heights and letter spacing, and nothing said what weight a heading is: `system.type` had no
weight key at all. Worse, the sheets set `font-weight: 600` inline while the font request asked for
400/500/700, so the one weight the components used was the one weight never downloaded and the
browser was synthesising it. There is now a three-step ladder in `system.type.weights`, tied to the
same list `googleFontsUrl` requests so the two cannot drift, emitted in all four token formats, shown
on the Typography sheet and documented in the book. Three steps rather than six, because a weight
that is not loaded is a weight the browser fakes, and a faked bold is thinner and wider than a real
one. A test now fails if any sheet sets a weight the system does not load.

One claim in the review did not hold: it reported the fixture stale after the rename. It was reading
output generated before the rename, and `migrateBrand` handles that case regardless.

## IN PROGRESS: the ranked gap list, authorised

Jake authorised all five ranked items plus extras, with two conditions: everything must be present
**in the artifact** so he can review and approve it, and then it packages up for handoff. Progress:

**Done**
- Schema extended with every field the references named and the schema lacked: `colour.print`
  (four systems per swatch plus RAL, vinyl and thread), `colour.dataViz`, `logo.minSizes[].basis`,
  `logo.placement`, `logo.monochrome`, `logo.misuse` as objects, `signatureMoves`, `motionPrinciple`,
  `motionSignature`, `imagery.shotList`, `imagery.rights`, `iconography.starterSet`,
  `voice.boilerplate`, `voice.elevatorPitch`, `voice.keyMessages`, `voice.tagline`,
  `governance.trademark`, `governance.colophon`. This was the bottleneck the review identified.
- **Item 2, print colour.** `toCmyk` in color.mjs, uncalibrated and labelled so. Pantone, RAL, vinyl
  and thread are recorded, never computed, because a guessed Pantone gets ordered. `system.print`
  resolves it; a new **Production.dc.html** sheet is what a printer, signwriter or embroiderer
  receives; a "Colour off the screen" book chapter carries the same table plus the caveat.
- **Item 4, verbal identity.** A new **Voice.dc.html** sheet and book section: boilerplate at 25, 50
  and 100 words with live word counts, the elevator pitch, key messages by audience each with its
  proof, tagline usage and lockup rules. Anything unwritten shows as a bracketed slot at the right
  length rather than being invented.
- **Item 5, mostly.** Signature moves as a schema field, a book chapter and an eight-site check; the
  colour proportion rule **drawn as a bar** on the palette sheet and in the book (both reviewers
  independently flagged this, and the research corpus called it the single best move a brand book
  can make); per-variant minimum sizes with the failure basis; monochrome behaviour; logo placement;
  motion principle and signature; trademark and colophon; and misuse **drawn as a grid with crosses**
  in the book rather than printed as a bulleted list.
- **Extra: chart colour.** `dataVizPalette` walks the hue circle from the brand hue and keeps only
  colours that stay apart under protanopia, deuteranopia and tritanopia. The sequential ramp is
  sorted by lightness, because the brand ramp deliberately breaks monotonicity at 8 to 9 and a
  sequential scale that goes dark, light, dark reads as three categories.
- The worked example now exercises every one of these, so the artifact demonstrates them.

- **Item 1, the asset pack.** `scripts/assets.mjs` derives everything from one master SVG: five
  vector variants, PNGs at seven sizes with correct safe areas, a reversed avatar, a real multi-size
  `favicon.ico` assembled by hand, and `site.webmanifest`. `brandi assets` builds a pack per master,
  so stacked and mark-only get their own. A simplified favicon SVG, when supplied, is used for the 16
  and 32 slots and the output says so. With no browser it still writes every vector and reports the
  rasters as missing rather than claiming a complete pack.
- **Item 3, the proof set.** Four artboards are always required; the rest are selected by the answer
  to intake question 2, which the harness had been asking and then ignoring. Five physical frames
  added (`signage`, `aFrame`, `vehicle`, `garment`, `sticker`) alongside the `businessCard` that
  existed and was never used.
- **`brandi handoff`.** One directory with a front page addressed to people rather than filenames:
  what is here, who needs it, what it is. It assembles and never generates, because the one thing a
  handover must be is the thing that was approved. Anything absent is named with the command that
  produces it.
- **The shot list**, derived from the applications that carry an image, with the rights and model
  release question raised before the shoot rather than after.

**Found by rendering the sheet rather than reading the code**: the production sheet showed
`accent1.solid` as `#B56514`, the variant adjusted so a label on it stays readable, sitting next to a
Pantone matched against `#D4823A`. That adjustment is a screen problem and a printer wants the brand
colour, so print swatches now use step 9, the colour itself. Ordering ink off the wrong swatch is the
kind of mistake nobody finds until the van is wrapped.

**Two performance bugs found while building this**
- `--user-data-dir` on headless Chrome costs 120+ seconds per invocation on a machine with Chrome
  already open, fresh profile or shared, against 2.2 seconds with the flag omitted. It was costing
  the asset pack eight minutes to write fifteen small files. Fixed in `assets.mjs` and `preview.mjs`,
  so the PDF and every artboard preview got faster too.
- Browser discovery now covers Windows and more Linux paths, with `CHROME_PATH` taking precedence,
  because this ships on other people's machines.

- **The icon starter set**, which completes the ranked list. Eight primitives drawn to whatever grid,
  stroke and terminal style the brand recorded, plus the size ladder showing where the stroke breaks
  and the rules the next fifty are drawn to. Deliberately drawn rather than borrowed: shipping a
  third-party set would hand a licence obligation to everyone who installs the plugin, and it would
  break the brand's own "do not mix icon sets" rule on the first day. One bug caught by its own test:
  a brand recording "square terminals" got round caps anyway, because the shape stance was being
  consulted before the recorded style. A recorded statement beats an inferred one, always.

**Still to do**
- Integration with the `logo-work` session, which is building logo generation upstream. The seam is
  agreed: it produces `brand/logo/master/*.svg` plus a simplified favicon and writes
  `identity.logo.files` with roles; `brandi assets` consumes them. File ownership is split so the two
  sessions do not clobber each other: this session holds `handoff.md`, the plugin manifests,
  `brandi.mjs` and `SKILL.md`; logo-work holds `brand.schema.json`, `brandfile.mjs` and `README.md`.

## v1.13.0: the logo forge

Written by the `logo-work` session, pasted here as its record. Brandi generates marks now. The
doctrine in `08-logo-system.md` section 7.1 said it could not and should not, and that changes here
on Jake's instruction, but the honest half of it survives intact: a person picks, always; every
candidate carries a provenance record; and the product keeps saying plainly that a generated mark is
a starting point somebody approved rather than a drawn one.

The two failures a logo generator normally has, and what prevents each:

**Twelve concepts that are one idea twelve times.** Variety is dealt, not requested. `logo plan`
writes twelve slot briefs across four families, no two sharing a register and symbol approach pair,
with the category default used at most twice so the round is mostly a position and partly a
reassurance. Each brief goes to a different agent and each agent sees only its own. A property test
runs eight seeds across four counts and fails if any pair repeats. The first implementation excluded
the category register from the deck entirely, which shrank it to six cards and let a sixteen-slot
round repeat a pair; the test caught it.

**A decision made on preference before anybody ran a test.** `logo audit` renders every candidate at
16, 32, 64 and 256 pixels in ONE browser pass (forty-eight images from one launch, about three
seconds against two minutes) and measures: stroke ratios against each application context, colour
counts, whether the counters close at favicon size, whether two areas were only being told apart by
hue, and whether any two concepts are the same idea twice.

Findings worth not re-deriving:

- **A file that parses loosely can render as nothing.** `svg.mjs` is deliberately tolerant; an SVG
  loaded as an image is parsed as strict XML. An unquoted attribute measures fine and then draws a
  blank box everywhere, silently. Both the direct check and a "geometry says ink, browser drew none"
  check now catch it, and the second one catches every cause rather than the ones I thought of.
- **Greyscale region counting can never detect hue separation.** The first single-colour test
  compared region counts of the colour render against the mono render, both in greyscale. Greyscale
  has already thrown the hue away, so the two numbers were equal by construction and the test always
  passed. There is now a colour-aware region counter, and two touching squares in different inks
  correctly report as two shapes in colour and one in black.
- **A perceptual hash is the wrong tool for a silhouette.** dHash records horizontal gradient, and a
  black shape on white has almost none, so unrelated marks agree on most bits by both being sparse.
  On a real twelve-concept round it put five unrelated pairs inside the threshold, including two
  horizontal bars against a leaf. Comparing 16x16 downsampled silhouettes directly: identical marks
  score 0.0000 and the closest genuinely different pair scored 0.2238.
- **Artboard frame heights must be measured, not estimated.** Every one of my five estimates was
  short, Range by 462px, which is a whole row clipped. `fitFrames` stacks every board in one page
  and asks the browser, in one launch, and only ever grows a frame.
- **The minimum-size arithmetic gives a floor, not an answer,** and printing it as "minimum" is
  misleading. A ring mark measured 10px, which is true (the thinnest feature is one pixel there) and
  useless. The output now says what it is and tells you to render at it and look.
- **`toISOString` is UTC.** On a provenance record read as evidence of when work was done, an
  Australian morning records the previous day. Local date everywhere.
- **Nobody says "pets".** They say dog grooming. Matching only on the taxonomy key sent a dog groomer
  to the generic bucket and therefore never told it not to draw a paw print. There is an alias table.
- Google Fonts serves three licence tiers and HTTP 200 distinguishes none of them. Avenir, Gill Sans
  and Helvetica all return 200 and serve from `fonts.gstatic.com/l/font?kit=`, which is commercial
  delivery for Workspace, not a licence to put a wordmark on a building. The test is the path, not
  the status. Separately, `/l/` also appears for public OFL fonts when css2 is asked with an old
  User-Agent, so the licence check and the TTF download are two different requests and must stay so.

### What the adversarial review found, and what it says about our testing

Written by the `logo-work` session. Eight confirmed defects in the forge, every one invisible to a
suite that was green at 1485 tests. Ranked by what a user hits.

- **The boards asserted measurement that never happened.** `logo board` fabricated a passing verdict
  for any candidate with no audit and rendered it as fact on the one artefact a person decides from,
  under its own copy saying "measured before anybody said what they like". It now refuses to build
  from an unaudited round and names the concepts that are missing.
- **An unrendered mark was called a contender.** Without a browser the geometry pass runs alone and
  sees only DECLARED stroke widths, so a hairline drawn as a filled rectangle is invisible to it.
  There is a fifth verdict, `unverified`. A Chrome-less machine used to get a confidently green audit
  that had measured almost nothing.
- **The single-colour test was dead code, and then wrong three times.** `auditOneColour` had no
  caller outside its own test while the README and three places in the reference presented it as
  live. Wiring it in took three more attempts, because the check was wrong in a way its own fixture
  could not see: the two-colour case passed while a single-ink ring reported 1,103 colour regions,
  every antialiased edge shade counting as its own area. The fixture that proved it worked was the
  only input it worked on.
- **Re-importing one file wiped the rest of the round.** `entry.candidates = imported` meant the
  natural "one mark came back wrong, import the fix" dropped every other candidate while leaving the
  files on disk, and printed "Imported 1 concepts" as though it had added one. It merges by id now.
- **The 512KB ceiling did not guard.** It reported `too-big` and then parsed the file anyway, so a
  56MB traced raster exhausted the heap inside the check that existed to stop it. 4.8MB went from
  865ms to 3ms.
- **`within()` was lexical only.** A symlink inside the project pointing outside it passed the string
  test and was then read AND WRITTEN through. Confirmed: a file containing "PRIVATE KEY MATERIAL" was
  copied into a round, and a file outside the project was overwritten with the normalised master. Now
  realpath-checked, with every expanded file re-checked because the directory expansion bypassed the
  guard entirely. Independently re-verified from this session: the escape is refused and nothing is
  copied in.
- **`master` could not find a concept once a refinement round existed**, failing with "round 2 has no
  concept called A1", which is the exact command somebody types next. It searches every round now.
- **`pick` did not dedupe.**

Two more found by attacking it first: `parsePath` was quadratic (16,000 segments took 2.1 seconds,
100,000 took 108; now 200,000 in 63ms), and both tree walks blew the stack at about 5,000 levels of
nesting. And the planner's headline guarantee did not hold: over 29,232 plans, 435 repeated a
register and approach pair, every one at a count of twenty or more. Zero over 32,928 after the fix.

### The pattern worth naming, because it caught us nine times in one day

**A green test tells you the input you chose behaves the way you expected. It tells you nothing about
the inputs you did not choose, and the inputs you did not choose are where every one of these lived.**

Of the forge's ten defects: four were found by property sweeps over thousands of generated inputs
rather than by cases, three by attacking with hostile input, two by rendering the output and looking
at it, and one by a reviewer reading the code and asking who calls this.

The same species, on this side of the seam:

1. The greyscale region counter compared two numbers equal by construction, so the single-colour test
   could never fail.
2. The anti-slop contract specified forty rules and parsed none, so a linter enforcing seven reported
   the same "clean" as one enforcing forty.
3. `brandi logo` was handed the parsed positional array with every flag stripped, and it looked
   correct because the only two subcommands anybody tries first take no flags. `logo master A1
   --approved-by "Jake"` would have recorded that nobody approved it.
4. A version number matching between source and install does not mean the FILES match. Byte-compare
   the installed cache against the tree, every time, or you ship a stale plugin under a fresh number.
5. And the byte-compare itself has to be proven independent, or it is one of these too.
6. A font serving from a public path with no restriction banner can still be proprietary. There is
   no structural signal, so it is a deny-list, and a deny-list rots.
7. A path guard written as a string comparison. A symlink is not a string, and this shape appeared
   independently in both sessions' code on the same day.
8. `grep -r` does not follow symlinks, so the check for the symlink leak could not see the symlink
   leak. Twice now the flaw has been in the verification rather than in the code.
9. A finding asserted off one command, where the command's answer was decided by the environment it
   ran in. The forge reported that the source `bin` was on Jake's PATH, so the resolver would prefer
   the tree over the cache. It did not reproduce here, and `env -i HOME=$HOME /bin/zsh -lc` settled
   it: the entry is in that session's own tool process, not in any shell config, and the `-l` test
   had inherited it and reported it back. Withdrawn before it reached this document, because the
   claim was checked rather than pasted. The general habit that saved it: record what you proved,
   not what you were told.

The useful question to ask of any green check: what input would make this fail, and has anyone run
it? And of any finding handed to you: what would it look like if this were false, and has anyone
looked?

Four of the nine were found by one session checking the other's work. Two sessions cost more than
one and found things one would not have.

### Type licensing: HTTP 200 and a public path are still not a licence

The last finding of the day, and a licence one, so it matters more than its size. Avenir and Gill
Sans are caught by the `/l/font?kit=` serving path and Product Sans by its `googlerestricted`
banner. But **Google Sans and its four siblings (Text, Display, Flex, Code) serve from the public
`/s/` path with no banner at all**, and are Google's proprietary brand typeface, not licensed for
anyone else's logo. The classifier passed them.

There is no structural signal to gate on, and that was checked rather than assumed: the metadata
API's `isBrandFont` is true for Roboto and all 221 Noto families, and `isOpenSource` is true for all
1,946 entries. So it is a deny-list of one regex, documented as a list that will rot, with
`allowUnlicensed` as the way past it for anyone who holds a licence the tool cannot see.

Verified from the INSTALLED copy against the live service, not from the tree: Google Sans, Google
Sans Text and Product Sans classify as `restricted`; Gill Sans and Avenir as `commercial`; Roboto
and Bitter as `public`; a bogus name as `missing`.

Found by sweeping the catalogue rather than spot-checking, which is the sixth instance of the
pattern below.

### v1.13.3: the same lexical path bug was on this side too

The logo forge's reviewer found that its `within()` was a string comparison a symlink walked
straight through. That prompted the obvious question here, and the answer was yes, twice.

**`loadLogoAssets` had it, and it was worse.** The guard was `path.resolve` plus `startsWith`, which
is a string test, and a symlink is not a string. A link inside a project pointing anywhere on disk
passed it, and the file was then read and inlined into the brand book, which is the document handed
to a client. Demonstrated rather than reasoned about: a marker placed in a file outside the project
appeared in the rendered book. Now realpath-checked. A symlink that stays inside the project still
works, because the rule is about leaving, not about links.

**`buildHandoff` had it in a different shape.** `cp` copied symlinks as symlinks, so `handover/assets`
came out as an absolute link to a directory outside the project, and reading through it returned the
outside file. Two rules follow from a handover being something people zip and send, and neither was
there: a link pointing out must not be packaged, and a link pointing in must be resolved to the real
file, because a link survives neither the zip nor the machine at the other end. Both now hold.

**And the check that missed the second one was wrong the same way the code was.** The first pass used
`grep -r` over the package, which does not follow symlinks, so it reported clean while
`cat handover/assets/leak.txt` returned the secret. That is the eighth instance of the pattern below
and the second one where the flaw was in the verification rather than in the thing verified.

### A verification method that was nearly equal by construction

The install was checked all day by byte-comparing the plugin cache against the source tree. That
check is only meaningful if the cache is an independent copy, and after the forge twice reported the
cache carrying edits made close to an install, it was worth proving rather than assuming. Different
inodes, and a probe appended to a source file did NOT appear in the cache, so the copy is genuinely
independent and the comparison is a real check.

It nearly was not. Had the cache been hard-linked to the tree, every "install verified byte-identical
to source" in this document would have been a tautology, and the version-mismatch trap the forge
caught at 1.13.1 would have been invisible in exactly the way everything else in this section was.

### Drift made impossible to reintroduce quietly

The last thing the forge added is the piece most worth copying elsewhere in this project: three tests
asserting that every finding the audit can produce appears in the reference table, that the reference
documents no finding nothing can produce, and that every threshold it names matches the constant
behind it. Documentation drift stops being something a reviewer has to catch.

It also caught its own over-eager assertion immediately: the first version refused the phrase
"perceptual hash" anywhere in the file, which would have banned the reference from EXPLAINING that a
perceptual hash was tried and abandoned. The signal is the units, not the words, so it refuses the
threshold being stated "within N bits" instead. A rule that bans discussing the thing it bans is a
rule that makes the documentation worse.

The canvas the forge publishes to:
https://claude.ai/code/artifact/35f9c5fb-ae70-42e4-b664-cc2a03deb0f2

### The seam between the two sessions

`brandi logo` delegates in-process to `scripts/logo.mjs` (its `main` is exported; `cmdLogo` forwards
the raw argv tail so the forge parses its own arguments). The forge writes masters plus
`identity.logo.files` with a `role`; `brandi assets` reads those roles and derives the pack.

One integration bug caught before it landed: `assets` would have built a full derived pack from
every recorded file, so `mono-black.svg` and `mono-white.svg` (which `assets` itself produces) would
each have gained five colourways of a colourway. `DERIVED_ROLES` now skips them, and a brand whose
recorded files are all colourways is refused with what to record instead.

The Identity phase in `SKILL.md` runs the forge before any colour is decided, because colour comes
after the silhouette is right: a weak mark rescued by a good palette is a decision you find out
about eighteen months later on a one-colour press.

## v1.14.0: measure the photographs before planning what to do with them

Jake pointed at Palate, which solved this first in `skill/scripts/palate-assets.mjs`, and at a live
engagement where the images were "maybe not being handled as best they could be". Both were right.

Recon read logos, tokens and copy and never measured a photograph, so every decision about how
photography would be used was made from an assumption about what client photography looks like.

**What the live folder turned out to be**, measured in 0.3 seconds: 528 photographs, of which 269
portrait, 192 square and 67 landscape. A shopfront band would destroy 487 of them and a vehicle
panel 462, which are the two surfaces a mobile dog-washing business most needs. Only SEVEN could be
printed at A4 or larger, and all seven were the HEIC phone photographs shot last week. Of the 521
JPEGs in the social archive, **zero** can be printed at A4: at 300dpi they are business-card sized.

The HEIC detail is the one worth keeping. The newest and most deliberate photographs, the ones
somebody went out and shot on purpose, arrive straight off a phone as HEIC while the thousand-file
archive is JPEG. A tool that reads JPEG and skips HEIC measures the client's history and ignores
their intent, and would have concluded there was no print-capable photography at all.

**What was taken from Palate**, with credit: the crop arithmetic (`min/max` of the two aspects, so a
2:3 portrait in a 3:1 band shows 22% of the frame), the photograph-versus-furniture split so a
favicon is never judged on crop loss, and the `subject: null` / `reviewed: false` mechanism, which is
the best idea in that file. Pixels cannot tell you where the subject is; a crop that keeps two faces
and one that slices them measure identically. `--check` exits non-zero while any photograph is
unreviewed, so "nobody looked" is a visible state rather than a silent default.

**What is different here.** No dependency: Palate uses `sharp`, and Brandi reads PNG, JPEG, GIF,
WebP, HEIC and AVIF dimensions straight from the header in pure JS, because a brand tool that cannot
measure a photograph until somebody runs npm is a brand tool that does not measure photographs.
Slots that are brand surfaces rather than website sections, since a shopfront is 3:1 and a phone
screen is 0.46:1 and no photograph serves both. Print resolution at 300dpi in millimetres, which is
the question a website never asks and a flyer, a shopfront and a vehicle wrap all do. And a summary
that survives five hundred files, because a per-file report of five hundred photographs is a listing
rather than a catalogue.

One bug the tests caught: the ISOBMFF bounds check was `i + 20 < length` where the fields end at
`i + 16`, which silently dropped the LAST `ispe` box in the buffer. In a real HEIC the thumbnail
comes first and the full-size entry last, so it read every iPhone photograph at thumbnail size.

## v1.14.1: a measurement that was confidently wrong, found by looking

Jake said he was disappointed there were no real-world assets showing how the brand applies. Going
to look at the live run found three things, and the first is the one that matters.

**Rotation. The measurement was wrong for exactly the photographs that mattered most.** A phone
stores a portrait photograph as landscape plus a rotation flag. JPEG puts that in EXIF tag 0x0112.
HEIC does not use EXIF for it at all: it carries an ISOBMFF `irot` box, which is why
`sips -g orientation` reports `<nil>` on a rotated HEIC and means nothing by it. The catalogue was
reading the stored dimensions and calling seven 5712x4284 files landscape. With `irot` applied they
are 4284x5712 and PORTRAIT, and those seven are the only photographs in a 535-file library that can
be printed at A4. So the only print-capable photography the client has is the wrong shape for the
shopfront band and the vehicle panel, which are the two surfaces a mobile business most needs. The
first reading said the opposite.

Found by converting one and looking at it: the van was on its side.

**HEIC cannot go in an artboard at all.** Chrome does not decode it, confirmed by rendering one and
reading back `naturalWidth`. An artboard referencing a HEIC shows a broken image and says nothing.
The catalogue now names the count and gives the `sips` and `magick` commands, because the format
that blocks is also the format the client's best photographs arrive in.

**And the gap Jake actually pointed at.** The application artboards show artwork on flat colour
fields. `Signage.dc.html` is an orange rectangle with type on it. `Vehicle.dc.html` puts a real
photograph beside a spec drawing, which documents the van as it exists rather than showing the brand
applied to it. Nothing in the set composites brand artwork onto a real photograph.

Attempting one by hand demonstrated why that is not a small feature. Artwork placed on coordinates
estimated from the image landed on grass and a tow bar, and two rotation corrections both went the
wrong way. Placement on a photograph cannot be computed: it needs the same mechanism as `subject`,
where somebody looks, records where the panel is, and the record is what gets rendered. That is the
next piece of work rather than something this version claims.

## If more work is wanted

Nothing is outstanding. Ideas, not obligations:
- A second review pass against the current tree.
- `brandi extract <url>` to pull a live site's computed styles into the brand file.
- Territory sketches generated as a starting point rather than authored from scratch.

## Resume instructions

Read this file, then `cd brandi && node --test "tests/*.test.mjs"`. Do not re-clone, do not
re-invoke `/design` for the contract, and do not rebuild anything that has tests.
Version bumps need BOTH `brandi/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`,
then `claude plugin marketplace update brandi && claude plugin update brandi`.
`CLAUDE_PLUGIN_ROOT` is NOT set in the Bash environment: do not reintroduce it in a SKILL.md body.
