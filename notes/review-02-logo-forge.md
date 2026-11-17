# Adversarial review: the logo forge

Reviewer: Fable, adversary. Date: 2026-08-30. Suite confirmed green at the start (1485 pass) and
again at the end (1505 pass, 226 suites, 0 fail).

**Moving target warning.** The forge was being edited by another session *while I attacked it*.
`scripts/logo.mjs`, `scripts/logogen.mjs` and `scripts/logospec.mjs` all changed under me between
02:05 and 02:14. One of my findings (the planner pair-repeat, F7 below) was fixed mid-review; I have
re-run every other finding against the code as it stood at the end. Anything I call CONFIRMED was
reproduced against the tree on disk after the last change I saw. If the tree has moved again since,
re-run the reproductions.

I attacked: hostile/malformed SVG, the planner guarantee, the audit's honesty, the approval
invariant, path safety, the font parser, the `brandi assets` seam, and the docs. What I could break
is below. What I could not is at the end, and that list matters as much as the breakages.

---

## CONFIRMED, ranked by consequence

### F1. The boards assert measurement that never happened (the honesty invariant, broken)

`buildBoards` does not require, check, or trigger an audit. If `logo board` runs on a round whose
candidates were never audited, it fabricates a passing verdict for every one of them and prints it
as fact on the artefact the person decides from.

The mechanism is `scripts/logo.mjs` in `buildBoards`:

```js
const audits = entry.candidates.map((c) => c.audit ?? { id: c.id, verdict: 'contender', findings: [], contexts: [] })
```

A missing `c.audit` becomes `verdict: 'contender'`. `logoboard.mjs` then renders that as "clears
every test", "none" failed, "nothing" noted, and the index board prints a summary sentence and the
line *"Every mark here was generated, then measured, then kept or dropped on the measurement."*

REPRODUCTION:
```
cd $(mktemp -d)
L=/Users/jakeshelley/dev/jiffi-design-branding-skill/brandi/scripts/logo.mjs
node $L plan --count 4 --name Edgeco >/dev/null
printf '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="#000"/></svg>' > brand/logo/concepts/round-01/A1.svg
node $L import brand/logo/concepts/round-01/A1.svg >/dev/null
node $L board          # no warning; writes 5 artboards including Audit.dc.html
grep -oE '[0-9]+ clear every mechanical test[^.]*\.' brand/logo/canvas/Main.dc.html
grep -oE 'then measured, then kept or dropped on the measurement' brand/logo/canvas/Main.dc.html
grep -oE 'clears every test|What the arithmetic found' brand/logo/canvas/Audit.dc.html
```
Observed: `1 clear every mechanical test, 0 ... ruled out`, plus the "then measured, then kept or
dropped on the measurement" sentence, and an "Audit" board titled "What the arithmetic found"
showing the mark as "clears every test". No arithmetic ran. `logo board` prints no warning.

What should happen: `board` should refuse (or loudly caveat) when the round has no `auditedOn`,
because the boards make measurement claims in their own copy. As it is, the one artefact whose whole
job is "measured before anybody says what they like" will state that measurement happened when it
did not. This is the exact invariant the product is sold on.

Related, same root, reachable in the *correct* flow: see F4 (no browser).

---

### F2. The documented mechanical single-colour test is dead code

`auditOneColour` and `countColourRegions` — the "collapse every paint to one, render both, count
regions, and if the colour render has more regions than the black one then hue was doing structural
work" test — are never called by the audit pipeline. `auditCandidates` calls only `auditStructure`,
`auditContexts` and `auditRenderMetrics`.

```
$ grep -rln auditOneColour scripts/ tests/
scripts/logoaudit.mjs        # definition only
tests/logoaudit.test.mjs     # its only caller
```

The `colourRegions` metric is computed per cell in `measure()` and serialised into the JSON, but no
finding and no verdict reads it. The only reader is `auditOneColour`, which nothing in the pipeline
calls. The single-colour verdict a user actually gets comes solely from `paintCount(source) >
ctx.maxColours` in `auditContexts`. The `colour-carries` finding id **cannot be produced by `logo
audit`.**

This directly contradicts three places that present it as a live capability:
- `README.md:84` "measured: ... whether two areas were only being told apart by hue"
- `references/11-logo-craft.md:563` single-colour row: "Mechanical (`auditOneColour`)"
- `references/11-logo-craft.md:653` documents the `colour-carries` error, and `:842` again names
  `auditOneColour`.
- `logoaudit.mjs` line ~618 docblock: "The single-colour test, mechanically."

It is also the precise failure pattern the author names in `handoff.md` under "A bug pattern worth
naming": a check whose passing condition is guaranteed by how it was built rather than by the thing
it claims to measure. The colour-aware counter was written specifically to fix the greyscale
version, and then never wired in.

REPRODUCTION: the grep above, plus running any audit and confirming no `colour-carries` finding and
no consumption of `colourRegions` ever occurs (`grep -n colourRegions scripts/logoaudit.mjs` shows
it computed at line 531 and read only inside `auditOneColour` at 637).

Consequence: two areas told apart by hue alone, sitting apart so `paintCount` is the only signal,
are judged by paint-attribute counting, not by the render test the docs promise. The nuanced case
the whole function exists for is not evaluated in production.

---

### F3. Incremental / re-import silently drops every other candidate

`importConcepts` replaces the round's candidate list rather than merging into it:

```js
// scripts/logo.mjs
entry.candidates = imported;
```

So the natural action "one mark came back wrong, re-import just the corrected file" wipes every
other candidate from the round state. The SVGs stay on disk, but `audit`, `board` and `pick` read
`entry.candidates`, so the dropped marks vanish from the round with no warning.

REPRODUCTION:
```
node $L plan --count 4 --name Inc >/dev/null
printf '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="#000"/></svg>' | tee brand/logo/concepts/round-01/{A1,B1,C1}.svg >/dev/null
node $L import brand/logo/concepts/round-01           # "Imported 3 concepts"
node $L import brand/logo/concepts/round-01/A1.svg    # "Imported 1 concepts" — no warning
# state now lists only A1; B1 and C1 are gone from the round though their files remain
```
Same trap hits a fan-out where agents finish at different times and someone imports each file as it
lands. The message "Imported 1 concepts into round 1" reads like a successful add, not a
replacement that discarded two.

---

### F4. Without a browser, favicon-killing marks are recorded as "clears every test"

The geometry pass (`auditContexts`) only measures *stroke* widths (`strokeRatio` reads
`s.strokeWidth`), so a hairline drawn as a thin *filled rectangle* is invisible to it — the code
says so itself: "where there is a render, it decides." When there is no render (no Chrome, or Chrome
failed), the render pass is skipped and the verdict defaults to `contender`.

REPRODUCTION:
```js
import { auditCandidates } from '.../logoaudit.mjs';
const hairline = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="0" y="49.8" width="100" height="0.4" fill="#000"/></svg>';
const r = await auditCandidates([{id:'H1', svg:hairline, architecture:'symbol-only'}], {chrome:null});
// => verdict 'contender', findings [], context fails []
```
The CLI line does print "(no browser, so nothing was rendered)", but the *verdict* is `contender`
and the boards built from it say "clears every test" with none of that caveat (F1's boards inherit
this). A Chrome-less machine that runs the whole flow correctly gets a confidently green audit that
measured almost nothing. At minimum the verdict of an un-rendered candidate should not be
`contender`; it should carry an explicit "not rendered, unverified" state that the board surfaces.

---

### F5. The 512KB structure ceiling does not guard; large SVGs OOM the audit

`auditStructure` reports `too-big` over `maxBytes` (512KB) but does not `return` — it falls straight
into `const d = describeSvg(source)`, which fully parses the file. The ceiling is cosmetic.

```
scripts/logoaudit.mjs:114  if (Buffer.byteLength(source) > maxBytes) { out.push(... 'too-big' ...); }
scripts/logoaudit.mjs:120  const d = describeSvg(source);   // runs regardless
```

REPRODUCTION (over the ceiling, survives but proves the parse runs):
```
# 4.8MB file, 10x the 512KB ceiling
node -e "const f='<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\">'+'<rect width=\"1\" height=\"1\"/>'.repeat(180000)+'</svg>';
import('.../logoaudit.mjs').then(m=>{const o=m.auditStructure(f);console.log(o.map(x=>x.id).join(','))})"
# => too-big,viewbox-slack,node-count   (viewbox-slack and node-count can only come from a full parse; ~865ms)
```
At ~50MB it does not survive — `auditStructure` on a 56MB SVG dies with `FATAL ERROR: Reached heap
limit Allocation failed - JavaScript heap out of memory`. Reachable through the real CLI: `logo
import` reads and normalises the file, and `logo audit` renders and parses it; a 3MB traced-raster
SVG audits in ~7.5s, a tens-of-MB one crashes the run. In the batch path `renderBatch` parses every
source *before* `auditStructure` runs, so one oversized candidate takes down the whole round's
audit, not just itself. A traced raster is exactly the input the ceiling names in its own fix text.

Fix is one line: `return out;` after pushing `too-big`, and/or bail before `renderBatch`/`tighten`
on any source over the ceiling.

---

### F6. `within()` is lexical only — a symlink inside the project reads and writes outside it

`within()` resolves the path as a string and checks the prefix. It never calls `realpath`, so it
blocks `../` segments and absolute paths but follows any symlink whose *name* sits inside the
project. `logo import` both reads through such a symlink (pulling outside content into the round) and
writes the normalised master back through it (overwriting the outside target).

REPRODUCTION:
```
node $L plan --count 4 --name Symtest >/dev/null
mkdir -p /tmp/sekret && printf '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#000"/></svg>' > /tmp/sekret/real.svg
ln -sf /tmp/sekret/real.svg brand/logo/concepts/round-01/A1.svg   # symlink named like a slot, target outside
node $L import brand/logo/concepts/round-01/A1.svg --round 1       # "Imported 1 concepts"
# /tmp/sekret/real.svg is now overwritten with the normalised master — write followed the symlink out of the project
```
The `within()` docblock claims it stops `../../.ssh/id_rsa` "rather than in whatever reads it next".
True for lexical `..`; false for symlinks. Lower severity because it needs a symlink already placed
inside the project, but a plugin whose stated guard is "the only thing keeping reads inside the
project" should `realpath`-check, or `lstat` and refuse symlinks in the concept/slot directories.

---

### F7. (CONFIRMED, then FIXED mid-review) Planner pair-repeat at counts 15–24

The central guarantee — "no two slots share the same register and symbol approach pair" — broke for
founder-type names (e.g. "Hale & Byrne", which collapses the symbolic family to `letterform-derived`
alone) at counts of 15 and up. I measured it before the fix: clean at 4–14, then 20/800 at 15,
rising to ~180/800 (about 22%) at 24. `--count` accepts up to 24, so the CLI exposed it.

The other session fixed this while I was writing the reproduction: `planConcepts` now does a two-pass
widening (preferred approaches, then the family's full set) and records any genuinely exhausted grid
in a new `repeatedPairs` field. My full sweep after the fix — 152,880 plans across 14 names, 13
categories, counts 4–24, 40 seeds each — reports `pairFail: 0`. Recording it because it was real,
it was the headline guarantee, and it is the kind of thing a later refactor can reintroduce; keep
the property test that now covers 15–24.

---

### F8. (minor) `pick` does not dedupe ids

`logo pick A1 A1 B1` records a shortlist of `['A1','A1','B1']` and `logo refine` then deals a
refinement round with duplicate slot ids (`A1sm, A1p, A1w, A1sq, A1sm, ...`). Harmless in practice
because two files cannot share a name on import, but the shortlist and slot list carry the
duplicate. Dedupe in `pickDirections`.

---

## SUSPECTED (reasoned, not triggered as a user-visible failure)

- **`maxp numGlyphs = 65535` throws a generic DataView error.** Mutating a real font's `numGlyphs`
  to 65535 makes `parseFont` throw `Offset is outside the bounds of the DataView` from the `loca`
  loop, rather than the parser's own "missing/truncated table" message. It throws (no OOB read, no
  hang), so it is safe, but the error is not the clear one the rest of the parser is careful to give.

---

## Attacked and could NOT break (re-attack elsewhere)

- **The approval invariant held against everything.** `--approved-by ""`, `--approved-by "   "`,
  `--approved-by --json` (flag-swallow), promoting with a real approver then re-promoting a
  different concept without one, and hand-editing `logo.json` — every path recorded "candidate, not
  approved" / "NOBODY YET" in both `logo.json` and the generation manifest. (The empty/whitespace
  handling was hardened by the other session mid-review; I re-verified after.)

- **Path safety against lexical attacks.** `../`, absolute paths, a NUL byte in a filename, and a
  hand-edited state file pointing a candidate at `../../../../etc/hosts` were all refused by
  `within()`. (Symlinks are the exception — F6.)

- **SVG geometry DoS.** 10,000-deep group nesting (iterative `walk`/`collectShapes`, ~15ms),
  100,000-segment path (parse ~33ms, describe ~127ms), billion-laughs entity expansion (DOCTYPE
  ENTITY declarations are skipped and undefined entities are left literal — no expansion),
  `viewBox="0 0 1e308 1e308"`, negative width, `NaN`/`Infinity` coordinates, and
  `<use href="#self">` — all returned a result with no hang, no stack overflow, no crash.

- **Regex-metachar id injection.** `id="a.*b(c)"`, `id="a+b"`, unbalanced-paren ids, and unicode ids
  fed through `inlineSvg` and `composeLockup` are correctly escaped before the regex is built
  (`id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`), re-prefixed correctly, and cause no ReDoS.

- **Font parser hostile binary.** Empty, 4-byte, all-zero, 9999-table-count-in-a-12-byte-file,
  table offsets past EOF, a self-referencing composite glyph (caught by the depth-8 guard), a
  runaway `MORE_COMPONENTS` flag, and an unknown cmap subtable format — every one throws a clear
  message or terminates. No infinite loop, no out-of-bounds read.

- **The `brandi assets` seam holds end to end.** `logo master` writes `identity.logo.files` with
  roles `primary` / `mono-black` / `mono-white`; `brandi assets` builds ONE pack from the primary
  and `DERIVED_ROLES` correctly skips the two mono colourways (no "five colourways of a colourway").
  `brandi validate` passes afterwards.

- **The font catalogue is real.** All 38 faces named in `logospec.mjs` REGISTERS return HTTP 200
  from Google Fonts. Spot-checking the riskier ones (Geist, Instrument Sans, Bricolage Grotesque,
  Familjen Grotesk, Syne, Charis SIL, Julius Sans One) through the actual code: every one is
  `tier=public`, downloads, and parses as a static (non-variable) TrueType font.

- **Clean marks are not falsely rejected.** A tidy single-ink symbol got `contender` /
  `contender-with-notes` on legitimate grounds (viewbox-slack when the ink genuinely underfills the
  box); no spurious rejection.

- **Malformed-but-tolerated SVG on import.** An unquoted `viewBox` (renders blank in strict XML) is
  repaired by `normaliseMaster` on the way in, so it does not silently ship as a blank box; the
  `no-xmlns` / `unquoted-attribute` / `renders-empty` structure checks are present and fire.

- **Nonexistent round, unknown concept id, and a bumped state version** are all rejected with clear
  messages (`there is no round 99`, `round 1 has no concept called ZZ`, `logo.json is version 99...`).

---

## Documentation drift

- **F2 above is also a doc defect:** README:84, `11-logo-craft.md:563/653/842` all present the
  `auditOneColour` / `colour-carries` single-colour test as live; it is not wired in.

- **`11-logo-craft.md:654` describes the wrong near-duplicate method.** It states near-duplicate =
  "two 64-bit perceptual hashes within 12 bits at 64px". The code abandoned perceptual hashing for
  exactly this and uses silhouette distance ≤ 0.08 (`findNearDuplicates` → `silhouetteDistance`,
  `DERIVED.nearDuplicate = 0.08`). `handoff.md` records the switch; the reference table did not
  follow. Both the method and the threshold in the doc are wrong.

- **Threshold cross-check that DID hold:** `too-big` 512KB, `node-count` 400, `too-heavy` 65%,
  gradient/fail-budget-of-two, and the context matrix in `11-logo-craft.md` match the code
  constants. `CONSTRAINTS.contextFailBudget = 2` matches the prose. SKILL.md's command list (`plan,
  refine, wordmark, lockup, import, audit, board, pick, master, status`, plus `--oneLiner`) all
  exist and dispatch.
