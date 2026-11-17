# Logo forge: working notes

Session `logo-work`, 30 August 2026. Written for my own continuity across a compaction.
The canonical build record goes into `handoff.md`, which the OTHER session owns: a full block was
sent to it via SendMessage and it pastes it. Do not edit `handoff.md` from this session.

## The goal

Add the ultimate logo generation step to Brandi. From "here is a name" through to "here is nothing
at all", to the standard a very capable branding agency would deliver. Must run in Claude Code, use
`/design` for the visual step, be research backed, be as automated as possible, be fully tested end
to end, and be finished rather than half built.

## File ownership, agreed with the other session

MINE: everything new below, plus `schemas/brand.schema.json`, `scripts/brandfile.mjs` (read only in
practice), `README.md`.

THEIRS, do not touch until they hand over: `handoff.md`, `.claude-plugin/plugin.json`,
`.claude-plugin/marketplace.json`, `scripts/brandi.mjs`, `skills/brand-system/SKILL.md`.

Two things are waiting on them:
1. `scripts/brandi.mjs`: add a `logo` case delegating to `scripts/logo.mjs`. Re-read from disk first.
2. `skills/brand-system/SKILL.md`: add the forge to the **Identity** phase, at the top, before
   colour is decided. Deliberately NOT a new phase, so `PHASES` in brandfile.mjs never changes and
   their tests do not churn.

## What is built

| File | What it is |
| --- | --- |
| `scripts/svg.mjs` | SVG geometry. Tolerant XML scanner, path parsing with arcs to cubics, exact bezier bounding boxes, transforms, ink bounds, structural description |
| `scripts/png.mjs` | PNG decode and encode, greyscale, ink coverage, connected regions, min feature width by erosion, dHash, bounding box |
| `scripts/font.mjs` | TrueType parser. Google Fonts TTF to outlined SVG path. glyf, loca, cmap, hmtx, GPOS kerning, composites |
| `scripts/logospec.mjs` | Taxonomies as data plus the concept planner |
| `scripts/logoaudit.mjs` | The mechanical judge: structure, geometry, rendered |
| `scripts/logoboard.mjs` | Five `.dc.html` boards plus `fitFrames` |
| `scripts/logogen.mjs` | Master normalisation, typeset wordmark, lockup composition, clear space, minimum sizes, provenance |
| `scripts/logo.mjs` | The CLI and state |
| `skills/logo-forge/SKILL.md` | The harness |
| `commands/brand-logo.md` | The slash command |
| `research/findings/06,07,08` | Benchmark analysis. 08 is the one that matters, Rampstack distilled to data |

## The journey

```
plan      deal N slots that cannot converge -> one brief file per slot
draw      one agent per slot, each seeing ONLY its own brief
import    normalise on the way in, record provenance
audit     one browser pass, 4 sizes, every candidate, before anybody says what they like
board     5 artboards -> /design canvas -> publish
pick      A PERSON PICKS. two or three, not one
refine    round 2 on the shortlist
master    normalise, mono variants, clear space, minimum sizes, write into brand.json, rights record
```

## Things that cost real time, do not re-derive

- **Google Fonts serves three licence tiers and HTTP 200 distinguishes none.** Avenir, Gill Sans and
  Helvetica return 200 and serve from `fonts.gstatic.com/l/font?kit=`, which is commercial delivery
  for Workspace. Test the PATH not the status. Separately, `/l/` also appears for public OFL fonts
  when css2 is asked with an OLD User-Agent, so the licence check (css2, modern UA) and the TTF
  download (css v1, `Mozilla/4.0`) are two different requests and must stay so.
- **A file that parses loosely can render as nothing.** An SVG loaded as an image is parsed as strict
  XML. An unquoted attribute measures fine and draws a blank box, silently.
- **Greyscale region counting cannot detect hue separation.** Greyscale has already thrown the hue
  away. `countColourRegions` exists for that one question.
- **dHash is the wrong tool for a silhouette.** Use `silhouette` and `silhouetteDistance`. Measured:
  identical marks 0.0000, closest genuinely different pair 0.2238, threshold 0.08.
- **Artboard frame heights must be measured.** `fitFrames`, one browser launch, only ever grows.
- **`toISOString` is UTC.** Use `localDate` from logogen.mjs.
- **No `--user-data-dir` on headless Chrome here.** Two minutes against two seconds.
- **Bounding boxes verified against Chrome's own `getBBox`** to within 0.004 user units.

## What the adversarial pass broke, and the fixes

Every one of these was found by attacking the work rather than by a test going green.

- **`parsePath` was quadratic.** The NaN guard rescanned the whole accumulated path on every
  command. 16,000 segments took 2.1 seconds and 100,000 took 108. Now checks only what the command
  just pushed: 200,000 segments in 63ms. There is a test that fails if it ever goes quadratic again.
- **Both tree walks blew the stack at about 5,000 levels of nesting.** `RangeError: Maximum call
  stack size exceeded` is a useless thing to hand somebody who asked whether their logo was any
  good. Both are iterative now and 200,000 deep is fine.
- **The planner's central guarantee did not hold at large counts.** Over 29,232 plans, 435 repeated
  a register and approach pair, every one at a count of twenty or more. Cause: `literal` does not
  suit a founder name, so the symbolic family collapses to `letterform-derived` alone, which the
  letterform family also draws from, and seven registers cannot cover twelve slots. The name-type
  filter was always a preference and never a refusal, so the search now widens to the family's full
  approach list before giving up, and reports `repeatedPairs` if the grid is genuinely exhausted
  rather than dealing a duplicate silently. Zero duplicates over 32,928 plans afterwards.
- **`--approved-by ""` rendered the manifest's approval row as a blank** rather than the loud
  refusal, because `??` passes an empty string through. Trimmed and normalised to null now.
- **A missing glyph named the wrong font.** A Google static instance cut from a variable font
  carries the default instance's name, so asking for Bitter 700 and being told "Bitter Thin has no
  glyph" sends somebody looking in entirely the wrong place. The layer that knows what was
  requested now says it.
- **Artboards named a page the manifest did not list.** The design helper refuses the entire seed
  for this. A single-page canvas omits `pages` rather than naming its one page.

What was attacked and held: entity expansion (nothing resolves a DOCTYPE entity), regex
metacharacters in ids through both prefixing paths, duplicate ids across two marks composed into
one lockup, negative and NaN geometry, a viewBox of 1e308, nested `<svg>`, path traversal including
a sibling directory whose name is a prefix of the project's, the font parser against empty,
truncated at eight fractions, random noise, a PNG, a lying `maxp` and an unmapped character (clear
throws every time, no hangs, no out-of-bounds garbage), and re-promoting a master without an
approval (correctly clears the old one rather than inheriting a sign-off nobody gave).

## What the Fable review broke, and the fixes

`review-02-logo-forge.md` has the full report with reproductions. Eight confirmed findings, all
real, all mine, all fixed.

- **The boards asserted measurement that never happened.** `board` fabricated a passing verdict for
  any candidate with no audit and printed it as fact on the one artefact a person decides from,
  under copy that says "measured before anybody said what they like". It now refuses to build from
  an unaudited round and names what is missing.
- **An unrendered mark was called a contender.** Without a browser the geometry pass runs alone and
  only sees DECLARED stroke widths, so a hairline drawn as a filled rectangle is invisible to it.
  There is a fifth verdict now, `unverified`, and the index board says how many and why.
- **The single-colour test was dead code.** `auditOneColour` had no caller outside its own test,
  while the README and three places in the reference presented it as live. That is precisely the
  bug pattern this project keeps hitting: a check that passes because of how it was built.
  Wiring it in then took three more attempts, because the check itself was wrong in a way its own
  two-colour fixture could not see: a single-ink ring reported 1,103 colour regions, because every
  antialiased edge shade was its own region. Fixed by eroding to the solid interiors, then counting
  BOTH sides off the same mask, then classifying by HUE rather than quantised RGB, because a thin
  stroke's eroded interior is still partly antialiased. Verified against all seven real
  agent-drawn marks plus synthetic cases both ways.
- **Re-importing one file wiped the rest of the round.** The natural "one mark came back wrong, import
  the fix" dropped every other candidate from the state while leaving the files on disk. Merges by
  id now, drops the stale audit of anything replaced, and says what it did.
- **The 512KB ceiling did not guard.** It reported `too-big` and then parsed the file anyway, so a
  56MB traced raster exhausted the heap inside the check meant to prevent it, and in a batch took
  the whole round's audit with it. Returns early now: 4.8MB went from 865ms to 3ms.
- **`within()` was lexical only.** A symlink inside the project pointing outside it passed the string
  test and was then read AND written through. Confirmed: a file containing "PRIVATE KEY MATERIAL"
  was copied into a round under a slot's name. Now realpath-checked, every expanded file re-checked
  (the directory expansion bypassed the guard entirely), and a file named `.svg` that is not one is
  refused rather than copied in.
- **A concept could not be mastered once a refinement round existed.** `master A1` looked only in the
  latest round and failed with "round 2 has no concept called A1". It searches every round now and
  says which one it found it in.
- **`pick` did not dedupe**, so `pick A1 A1` dealt duplicate refinement slot ids.

Documentation drift the review caught: the reference described near-duplicate detection as a
perceptual hash within 12 bits, which the code abandoned; and named `auditOneColour` in three
places for a test that did not run. Both corrected, and the single-colour row now states its real
scope (hue separation, not tonal).

## Verification done

- Full suite green: 1525 tests including the other session's.
- CLI walked end to end three times: from nothing, from a brand file, and with deliberately flawed
  marks to prove the audit bites.
- Boards rendered and looked at, not just validated.
- Outlined wordmarks rendered and looked at across four faces including composites and ligatures.
- Eight real agents drew a live round for a structural engineering practice.

- A canvas published through the real `/design` helper and the Artifact tool:
  <https://claude.ai/code/artifact/35f9c5fb-ae70-42e4-b664-cc2a03deb0f2>
- The seam with `brandi assets` walked end to end: 15 files from 1 master, the mono variants
  correctly not re-derived, and a 16px favicon that is still legible.
- A refinement round dealt, drawn, imported, audited and boarded.

- The whole journey walked once more, clean, after every fix: init, plan, draw, board-refuses,
  audit, board, validate, pick, refine, master, assets, wordmark, lockup, book, status.

## Still to do

Nothing. The other session bumps the version once for the pair of us.
