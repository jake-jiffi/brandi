# Brandi adversarial review 01

Reviewer: Fable (reviewer of record). Date: 2026-08-29, evening session.

**The tree moved while I reviewed it.** At the start the suite was 492 tests, all passing, and
`brandi/` had no `bin/`, `agents/` or `schemas/`. During the review other agents rewrote
`SKILL.md`, the four command files and several scripts, added `references/09` and `10`, a `bin/brandi`
shim, a `brand-critic` agent, `evidence`/`decision`/`question` CLI commands, a `Logo.dc.html` wordmark
sheet, and ~215 new tests. Every finding below was re-verified against the tree as of roughly 20:35
and is marked accordingly. Findings marked **fixed mid-review** were real when found; they need a
regression test, not re-fixing.

State of the tree at time of writing: **707 tests, 705 pass, 2 fail** (both in the new
`tests/robustness.test.mjs`, both exposing real bugs, listed as C8). The handoff's "492 tests, all
passing" is stale on both counts.

**Post-delivery update (~20:50):** the lead fixed C8 and the C18 items while this file was being
written; I re-ran the suite and confirm **726/726 passing**. C8 is retained below as a record with a
FIXED stamp. The addendum at the end answers the lead's follow-up questions, including the verdict
on the authored proof artboards.

Repro convention: `$A` = `node brandi/scripts/brandi.mjs`, run from a temp project seeded with
`brandi/tests/fixtures/muddy-paws.json` at `brand/brand.json`.

---

## CONFIRMED findings

### C1 · The brand book asserts accessibility claims its own audit disproves — severity: critical (honesty)

**What is wrong.** `scripts/brandbook.mjs:423-427` prints a fixed bullet list in every generated
book: "Body text clears WCAG 2.2 AA at 4.5:1 in both themes", "The ring ... clears 3:1 against the
page (WCAG 2.4.11)", "Layouts survive the text-spacing overrides", "Interactive targets are at least
24px". These are printed verbatim even when the system's own audit has **failed**, and even though no
layout or target exists yet to have survived anything. The failures are relegated to a "Known
caveats" list below the claims, so the flagship deliverable contradicts itself on one page.

**Repro.** `$A init --name Failcorp && $A set identity.colour.primary '#00A692' && $A set
identity.school swiss && $A set identity.type.display Archivo && $A set identity.type.body Karla`.
`$A system` reports `audit ok: false` ("the focus ring against the page is 3.00:1, below the 3:1 it
needs"). `$A book` exits 0 and the HTML contains "Body text clears WCAG 2.2 AA at 4.5:1 in both
themes" and "which clears 3:1 against the page", while its own measured-contrast table prints a FAIL
row. The generated guardian skill makes the same unconditional claim (`scripts/guardian.mjs:306`).

**Also wrong in the same section.** The "2px ring with a 2px offset" is invented; no token or spec
anywhere defines ring width or offset. And the contrast tables in both the book
(`brandbook.mjs:299`) and the palette sheet (`artboards.mjs:114`) grade "Label on the brand fill"
against a 3:1 minimum and print PASS. A button label is normal-size text; WCAG 1.4.3 requires 4.5:1.
A client-facing table blessing 3:1 for a label with the word PASS is the exact "plausible-looking
claim" the system says it refuses to make.

**Fix.** Render the accessibility section from `system.audit` instead of a fixed list: each bullet
becomes "measured, pass/fail, value" and the aspirational items ("layouts survive 1.4.12") become
requirements phrased as requirements, not achievements. Use 4.5 as the label row's minimum, or label
the row "large text / 3:1" honestly. Delete the invented 2px/2px or make it a real token.

### C2 · The audit is advisory in practice, whatever the skill says — severity: critical

**What is wrong.** `SKILL.md:143` says "The audit is not advisory." Only `brandi system` sets a
failing exit code (`scripts/brandi.mjs:404`). `book`, `tokens`, `sheets`, `guardian` and `canvas`
all rebuild the system via `resolveSystem()` and run to completion on a failing audit with exit 0
(demonstrated in C1: the Failcorp book generated cleanly). Nothing mechanical stops a failing system
from being published, tokenised and enforced; only prose does, and prose is exactly what the project
elsewhere refuses to rely on.

**Fix.** In `resolveSystem()`, fail (or require `--force` with a recorded decision) when
`system.audit.ok` is false, for every deliverable-producing command.

### C3 · The canvas validator misses real failure modes and blocks legitimate work — severity: high

The whole `/design` integration leans on `validateArtboard` ("the format fails silently, so the
validator turns silent failures loud", and `cmdCanvas` refuses to seed on errors). I wrote
adversarial artboards against the current `scripts/canvas.mjs`. All of the following reproduce:

**False negatives (invalid or network-reaching artboards pass clean):**

1. `font-family: 'Inter', sans-serif` — a **quoted** banned font evades the check entirely. The
   regex `font-family:[^;}"']*\bInter\b` (canvas.mjs, house-rules block) cannot cross the quote
   character. Quoting the family name is the most common way to write it; `guardian.mjs` strips
   quotes and catches it, so the two validators disagree. Every banned-font test in
   `tests/canvas.test.mjs` ("flags every banned typeface") uses the unquoted form, which is why this
   was never noticed.
2. `background-image: url(https://...)` in CSS — not caught. The canvas has no network egress, so
   this renders as a silently missing image, the validator's founding use case.
3. `@import url("https://...")` inside `<style>` — not caught.
4. `<iframe src="https://...">` (and `<video>`, `<object>`, `<embed>`) — not caught.
5. `<script data-props='...' data-dc-script>` — attribute order defeats the regex at
   `canvas.mjs:339` (`/<script data-dc-script([^>]*)>/`), so an artboard with malformed `data-props`
   or a broken logic block validates clean when the attributes are reordered.
6. Only the **first** `data-dc-script` block is validated; a second (for example an empty one, which
   the validator itself says "will error") passes.

**False positive that blocks the pipeline:**

7. `<p>Ready to go, {{name}}?</p>` — legitimate copy, a hole followed by a question mark — trips the
   ternary heuristic at `canvas.mjs:381` as an **error**, and `cmdCanvas` then refuses to seed the
   canvas. Real headline copy in the brand voice ("Questions, {{firstName}}?") bricks publishing
   until someone finds `--force`.

**Overstated coverage in the docs:**

8. `references/05-canvas-recipes.md:118` says of the 80px/200px spacing rule: "`brandi validate`
   checks this." It does not. `findOverlaps` detects true overlap including a 56px chrome strip;
   two frames 60px apart in a row pass validation while the recipe declares them broken. Of the
   recipe file's "Ten silent failures", numbers 5 (partially), 8 (`<br>` in editable text) and 9
   (frame smaller than content, checkable against the manifest) are not checked at all.

**Fix.** Scan CSS for `url(` and `@import` with non-relative targets; scan `iframe|video|object|embed`
src; strip quotes before the font check (or reuse guardian's normaliser); match the dc-script tag by
attribute presence, not position, and validate all of them; restrict the ternary heuristic to holes
inside attribute values, or demote it to a warning; either implement the spacing rule or correct the
recipe text.

### C4 · `brandi sheets` destroys the canvas layout and mis-sizes every authored artboard — severity: high

**What is wrong.** `cmdSheets` (`scripts/brandi.mjs:447`) rewrites `brand/canvas/canvas.json` from
scratch every run. Any artboard it did not generate gets hardcoded `w: 1440, h: 900`
(`FRAMES.desktop`). The skill's own proof set (SKILL.md phase 7) is `Main` at 1440x1600, `Mobile` at
390x844, `Deck` at 1920x1080, `Social` at 1080x1080, `Print` at 794x1123 — five of the six get a
wrong frame. Recipe trap 9 says a frame smaller than its content "clips... and it is not
recoverable without a re-seed"; the pipeline manufactures exactly that trap.

**Repro.** In the muddy-paws project: author `Main.dc.html` (content 1600px tall), run `$A sheets`,
read `canvas.json`: `{"file": "Main.dc.html", ..., "w": 1440, "h": 900}`. The bottom 700px of the
homepage is clipped on the published canvas. Any hand-tuned x/y layout is also discarded wholesale.

**Fix.** Merge with the existing manifest instead of regenerating: keep position and size for files
already listed, and take sizes for new files from a known-frames table or a `$preview` hint in the
artboard rather than defaulting to desktop.

### C5 · `canvasManifest` accepts entries with no width, then poisons the whole layout — severity: high

**What is wrong.** `canvasManifest` never validates that `w`/`h` are numbers (`canvas.mjs:222`). An
entry missing `w` produces `x += undefined + gapX` = NaN for every subsequent artboard;
`Math.round(NaN)` is NaN and `JSON.stringify` writes it as `null`. `findOverlaps` goes blind (NaN
comparisons are false) and `validateCanvas` says nothing, so `canvas.json` ships with `"x": null`
straight into the seeder.

**Repro.** `canvasManifest([{file:'Main.dc.html'},{file:'B.dc.html',w:400,h:400}])` returns
`[{"file":"Main.dc.html","x":0,"y":0},{"file":"B.dc.html","x":null,...}]`, zero overlaps reported.

**Fix.** Throw on non-finite `w`/`h`/`x`/`y` at manifest build, and have `validateCanvas` check the
manifest's numbers as well as its filenames.

### C6 · The focus-ring guarantee is made against the wrong background, and the failure message contradicts itself — severity: high

**What is wrong.** `tonalRamp` picks the focus ring so it clears 3:1 against **the brand ramp's own
step 1** (`color.mjs:559-560`, documented at :589 as "actually meets WCAG 1.4.11 against step 1").
But the semantic layer puts the ring on `surface.page`, which is **neutral** step 1, a different
colour. Near the boundary the guarantee does not transfer: `buildSystem({primary:'#00A692'})` fails
its own audit on the ring. Worse, the audit message renders the full-precision ratio to two decimals,
producing "the focus ring against the page is 3.00:1, below the 3:1 it needs", which reads as
nonsense to anyone it is shown to.

**Repro.** `node -e "import('./brandi/scripts/system.mjs').then(({buildSystem}) =>
console.log(buildSystem({primary:'#00A692'}).audit))"` — error present on the current tree. A
540-seed sweep found the boundary cases; most hues are fine, which is exactly why this needed an
adversarial input rather than the eight seeds the tests use.

**Fix.** Choose (or at least verify) the ring against the resolved `surface.page` in `buildSemantic`,
where both ramps are in hand; print ratios in failure messages with enough precision that "X below
X" cannot appear.

### C7 · The components sheet breaks its own label rule on hover, and prints a false rationale — severity: high (correctness + honesty)

Two defects in `componentsArtboard`:

1. **Hover state fails Lc 60.** The primary button's rest state correctly uses
   `solidStrong.hex`/`solidStrong.text`, but hover and active jump to raw ramp step 10
   (`artboards.mjs:359-360`) while keeping `solidStrong.text`. For olive/yellow brands in dark mode
   the hover label lands under the sheet's own Lc 60 floor (47 of 1080 swept mode-seeds, e.g. seed
   `#A39000` dark: hover label Lc -59.9). The spec sheet documents a state that violates the rule
   printed two lines above it.
2. **A fabricated explanation when nothing was adjusted.** `artboards.mjs:433` always prints "The
   primary fill uses X, **not the raw brand colour**, because a label on the raw colour reaches only
   Lc Y". For muddy-paws, X *is* the raw brand colour and Y is -85.41, a passing value. The sheet
   (light and dark, verified in rendered PNGs) states a false fact with a self-refuting number in a
   deliverable whose header says "measured, not assumed".

**Fix.** Derive hover from `solidStrong` (darken/lighten it the way `tonalRamp` derives step 10) or
re-run the label check for the hover fill; make the note conditional on `solidStrong.adjusted`.

### C8 · Two failing tests on the current tree, both exposing real bugs — severity: high — **FIXED post-delivery, 726/726 verified**

`node --test` today: 705/707.

1. `validateBrand` **crashes** on a brand.json that is valid JSON with `evidence` as an object
   rather than an array: `(brand.evidence ?? []).entries is not a function`
   (`brandfile.mjs:316`). The non-array case is detected and recorded three blocks earlier, then
   execution walks into the provenance loop anyway. The validator whose one job is surviving a
   malformed file throws on a malformed file.
2. `completePhase('vibing')` errors with `unknown phase: vibing` without listing the real phases;
   the new robustness test requires the list.

**Fix.** Guard the provenance loop on `Array.isArray`; append the phase list to the error. Then make
the suite green before anything else is claimed about it.

### C9 · The palette sheet's "Contrast, dark" table is illegible — severity: medium (but it is the accessibility sheet)

`contrastTable(system,'dark')` resolves its body text and rules from the **dark** semantic layer
(light grey text), but the sheet paints one light background for the whole artboard
(`artboards.mjs:105-153` with `sheetCss(system)` at the light default). Rendered result (verified by
screenshot of the muddy-paws Palette sheet): the dark-theme contrast figures are pale grey on white
at roughly 1.8:1. The table certifying 16.84:1 contrast is itself unreadable. The dark ramp swatches
are fine because they carry their own backgrounds; only the table text breaks.

**Fix.** Either render the dark contrast block on a dark panel, or use the light theme's ink for the
table chrome and only swatch the measured colours.

### C10 · Boolean CLI flags swallow the next positional argument — severity: medium

`parseArgs` (`scripts/brandi.mjs:64`): any `--flag` followed by a non-flag token takes it as a
value. `--json`, `--force` and `--pdf` are boolean in every caller, so `brandi check --json
site/bad.css` sets `json: "site/bad.css"`, loses the path, and silently checks the whole project.

**Repro.** With two source files on disk, `$A check --json site/bad.css` reports `filesChecked: 2`;
`$A check site/bad.css --json` reports 1. Same class of bug in `preview.mjs`'s parser.

**Fix.** Declare the boolean flags (`json`, `force`, `pdf`) and never consume a value for them.

### C11 · `brandi set` can report success for a write that is not in the file, and coerces strings it should not — severity: medium

1. **Silent data loss.** The path-walker at `brandi.mjs:283` uses `keys.indexOf(k)` to look up the
   *next* key, which finds the first occurrence of a duplicated segment. With a repeated segment
   whose occurrences are followed by different key types, an array is created where an object
   belongs, the final property is set on the array, and `JSON.stringify` drops it.
   Repro: `$A set voice.examples.0.examples.title probe` prints `voice.examples.0.examples.title =
   "probe"`; the value is nowhere in the saved brand.json. The source of truth confirmed a write it
   discarded.
2. **Over-eager coercion.** `coerce()` turns any numeric-looking string into a number: `$A set
   meta.tagline 2024` stores the number 2024 (it then rendered as the cover tagline of my test
   book), and a brand named "007" becomes the number 7.

**Fix.** Track the walk index instead of `indexOf`; after writing, read the path back and fail if it
does not round-trip. Coerce numbers only for fields that are numeric in the schema, or require JSON
syntax for non-strings.

### C12 · The book omits content the outline promises, and every brand's book shares identical essay text — severity: medium (design quality)

- `brand.applications` is never rendered: `grep -c applications scripts/brandbook.mjs` = 0. The
  worked applications (the thing that shows the system surviving contact) exist in the schema and
  the fixture and vanish from the book.
- The logo chapter contains no logo. `identity.logo.files` are listed as filenames; neither the book
  nor the sheets embed a supplied mark. On the "from a logo" journey, the logo never appears in any
  generated deliverable unless Claude hand-copies it into `brand/canvas/`. (The new `Logo.dc.html`
  wordmark sheet covers the *no-logo* case; the *has-logo* case is still invisible.)
- `references/06-brand-book-outline.md` promises ~22 sections including signature moves,
  applications and logo construction; the generator produces 14, and the gap is not stated anywhere.
- The distinctive-assets intro, the voice closer ("Copy is design material..."), and the entire
  anti-patterns section are byte-identical across every brand the tool will ever produce. For a
  system whose thesis is "could not be mistaken for anyone else's", its flagship document carries
  several hundred words that will be word-for-word identical in every client's book.

**Fix.** Render applications; embed logo files (SVG inline, raster as data URI) in the logo section;
either generate the missing outline sections from brand.json or state in the book which sections are
not generated; move the boilerplate into per-brand phrasing derived from voice, or trim it.

### C13 · Wrong WCAG citations in code comments and generated output — severity: medium (honesty)

The new `references/09-accessibility.md` gets all of this right (2.4.11 is Focus Not Obscured;
ring contrast is 1.4.11; 2.3.3 is Level AAA, ":341 2.3.3 is only AAA"). The code contradicts it:

- `brandbook.mjs:424` cites the ring's 3:1 as "(WCAG 2.4.11)" — wrong SC; `color.mjs` itself
  correctly says 1.4.11.
- `tokens.mjs:322` labels the focus-visible rule "/* WCAG 2.2 2.4.11. A focus indicator that is
  actually visible. */" — that is 2.4.7 (visible) plus 1.4.11 (contrast).
- `guardian.mjs:81`: removing an outline "fails WCAG 2.2 2.4.11" — it fails 2.4.7. The generated
  brand-guardian SKILL table repeats it.
- `brandbook.mjs:368`: honouring `prefers-reduced-motion` "is a WCAG 2.2 requirement, not a nicety"
  — 2.3.3 is AAA; the flat claim overstates, and the same file cites "(WCAG 2.3.3)" four bullets
  later.

Every one of these ships in client-facing output. **Fix:** correct the four citations to match
reference 09.

### C14 · The reference file tells Claude to run commands that do not resolve — severity: medium

`references/05-canvas-recipes.md:264` and `:273` instruct `node scripts/brandi.mjs validate ...` —
a path relative to the plugin, executed from the user's project, where `scripts/` does not exist.
The rewritten SKILL.md resolves `$A` properly (PATH shim with a stated fallback), but this reference
file, loaded "any time you author a `.dc.html` artboard", still carries the broken form. Same class
of issue in the generated guardian skill's fallback, which names `<clone>/brandi/scripts/brandi.mjs`
— a placeholder that is only correct for someone working inside a clone, while the plugin-installed
path (`${CLAUDE_PLUGIN_ROOT}`) is never used. Note the guardian skill runs in future sessions where
the brandi plugin may not be enabled, so `brandi` will not be on PATH exactly where the guardian is
supposed to work.

**Fix.** Use `$A` in the recipes; in the generated guardian, embed the absolute path of the CLI that
generated it (known at generation time) as the fallback.

### C15 · The label-colour policy uses WCAG to pick and APCA to judge, and loses — severity: medium

`bestTextOn` picks white/black by WCAG ratio (`color.mjs`), but the house standard for labels is
APCA Lc 75/60. The two disagree on exactly the mid-lightness colours the code exists to handle: for
`#338637`-class greens, WCAG picks black (Lc ≈ 55, fails the house bar) while white already reaches
Lc -76.8 (passes). Consequences on the current tree:

- `tonalRamp().onSolid` recommends the perceptually worse label and then warns that the solid needs
  `solidStrong`, when plain white text was already fine.
- `accessibleSolid` starts from the WCAG winner, walks, and returns `adjusted: true, moved: 0` for
  these colours — a no-op labelled as an adjustment.
- The brand book cover paints `accent.on-solid` (the WCAG winner) over the brand colour.

Sweep evidence: 5 of 420 swept mid-tone seeds hit the disagreement exactly; pure `#FF0000` and
`#FF00FF` are the famous cases (black wins WCAG, white wins APCA) and get the WCAG choice.

**Fix.** Pick label colours by |Lc| when APCA is the bar being enforced (or by whichever passes the
declared floor), and only fall back to WCAG ordering when both fail.

### C16 · Guardian enforcement is hex-literal-only — severity: low-medium

`checkFiles` extracts colours with a hex regex only (`guardian.mjs:HEX_RE`). `rgb(31 111 74)`,
`hsl(...)`, `oklch(...)`, and named colours sail through the "off-palette colour" check, so the
enforcement the companion skill advertises is evadable by writing the same wrong colour in a
different notation. Markdown files are also scanned, so a doc quoting a competitor's hex is an
"error" while an off-palette `rgb()` in shipped CSS is invisible. **Fix:** parse the other colour
functions (the conversion code already exists in `color.mjs`), and consider demoting `.md` colour
hits to warnings.

### C17 · Library edge cases: NaN and negative chroma pass through the colour engine — severity: low

`gamutMapOklch({L:0.5, C:0.2, h:NaN})` returns a NaN triple and `oklchToHex` emits the string
`#NANNANNAN`; negative chroma is accepted and silently renders the *opposite* hue
(`{L:.5, C:-0.1, h:200}` → `#944A4B`, a red, from a teal hue). Internal callers currently clamp, so
this is a library-boundary issue, but `toOklch` accepts caller-supplied OKLCH objects, so one
unclamped caller away from garbage hex in a deliverable. **Fix:** validate finiteness and C ≥ 0 at
the public entry points. (Also: Machado deuteranopia row 2 uses 0.28009 vs the published 0.280085 —
harmless, but exactness is the selling point, so carry the published five decimals.)

### C18 · Found and fixed while the review ran (needs tests, not fixes)

These were live, reproduced defects when the review started; other agents fixed them on disk before
it ended. Each needs a regression test so it stays fixed:

1. **preview.mjs wrote Chrome error pages as artboard PNGs.** With a relative `--out`, the
   screenshot URL was built as `file://preview/x.html` → `ERR_INVALID_URL`, and the tool saved the
   error page as the preview PNG with exit 0 (I have the screenshots). Now fixed with
   `pathToFileURL`. The silent-failure-catcher failed silently; a test should open one produced PNG
   and assert it is not the error page (or at least that the URL is absolute).
2. **SKILL.md referenced `references/09` and `10` which did not exist** (written mid-review; 09
   spot-checks as accurate, and is now the corrective for C13).
3. **No CLI existed for evidence, decisions or open questions** while SKILL.md ordered "log
   everything with addEvidence" — the central provenance mechanism had no write path. `evidence`,
   `decision` and `question` commands now exist; none of the four command files or the e2e suite
   exercise `question` yet.
4. **The generated guardian skill embedded a cwd-relative path to brandi.mjs** valid only in the
   generating project. Replaced by the PATH story (see C14 for what is still wrong with it).

---

## SUSPECTED findings (not fully reproducible here)

### S1 · The Territories canvas may violate the captured contract's "Main required on first seed"

The handoff's own contract capture says `Main.dc.html` is required on a first seed. SKILL.md phase 4
has Claude author only `DirectionA/B/C.dc.html` and publish — no Main, and no manifest at that point,
so `validateCanvas` does not even emit its no-Main warning (it only fires when a manifest is
present). If the contract note is right, the first user touchpoint fails or lands in an undefined
state. I could not falsify it against the real seeder (`brandi canvas` with the six-artboard set
including Main succeeded against helper 2.1.251; I did not burn a seed on a Main-less set because the
helper's acceptance may differ by version). Either name one direction `Main.dc.html`, have phase 4
create a cover Main, or demonstrate a Main-less seed working and delete the contract note.

### S2 · `${ARGUMENTS:-.}` in commands/brand-check.md may not substitute

Claude Code substitutes `$ARGUMENTS`; the shell-default form `${ARGUMENTS:-.}` is not that token. If
it passes through unsubstituted, the shell sees an unset variable and defaults to `.`, silently
checking the whole project regardless of what the user passed (the earlier line "Run the brand check
over: $ARGUMENTS" does substitute, so Claude may compensate). Verify against the command-substitution
rules or use a plain `$ARGUMENTS` with a documented default.

### S3 · The pinned Artifact `contract: "0.1.31"` will drift

Hardcoded in SKILL.md, brand-canvas.md and `cmdCanvas` output. When the canvas runtime moves, every
published canvas pins a stale contract with no detection. Consider reading the version from the
located helper (its directory is version-stamped) or documenting how to know when to bump.

### S4 · Fonts not on Google Fonts fail silently in every generated artefact

`googleFontsUrl` builds a css2 URL for whatever family name is in brand.json. A licensed face
("Söhne") produces a 400 stylesheet, the browser falls back, and the book/sheets render in Georgia
with no warning anywhere. The type licences table even records the foundry while the renderer
quietly substitutes. A warning when a family is absent from a known-Google list (or a fetch check)
would close it.

### S5 · plugin.json `"skills"` / `"commands"` keys

Both point at default locations anyway; if the manifest schema does not define these keys they are
dead weight, if it does they are redundant. Harmless either way; worth checking against the plugin
schema once.

---

## What survived attack (verified, not assumed)

- **APCA 0.1.9 is genuinely correct.** All eight canonical Myndex reference pairs (#888/#fff,
  #000/#aaa, #123/#def, #123/#444 and reverses) reproduce to 0.01, exercising all four exponents,
  the black soft-clamp and both offsets. Constants match 0.1.9 exactly. (At review start only the
  two trivial black/white pairs were tested; mid-range anchors were added to the suite mid-review.)
- **OKLab matrices match Ottosson's published values digit for digit**, both directions; round-trip
  over a 350-point RGB sweep is exact. WCAG luminance and ratio match the spec (0.04045 threshold,
  the 2.2 correction) and the canonical #777777 example.
- **The ramp's central accessibility claims hold under sweep.** Across 540 seeds x 2 modes: step 12
  on step 1 clears AAA and step 11 clears AA every time; every stored L/C/h triple is in gamut as
  stored and agrees with its hex; `solidStrong` reaches |Lc| >= 75 on-hue everywhere it claims to.
- **Gamut mapping terminates and is correct at the extremes** (pure black/white seeds, boundary
  primaries, C=5 absurdity) for well-formed input (see C17 for the NaN caveat).
- **The end-to-end canvas seed works against the real helper.** `brandi canvas` on the muddy-paws
  project seeded 6 artboards through design helper 2.1.251 and passed the helper's own `--check`. The
  layout it seeds has the C4 size defects, but the plumbing, flags and validator-gate order are real,
  not aspirational.
- **The rendered deliverables are genuinely presentable.** The palette, typography and components
  sheets and the brand book (rendered and inspected as PNGs) read as competent studio work: real
  hierarchy, real specimen structure, honest "[OWNER NAME]" placeholders, no slop patterns. C7/C9
  are blemishes on good sheets, not lipstick on bad ones.
- **The reference corpus is unusually honest.** Archetypes are explicitly flagged as "a generative
  prompt, not a validated model"; the golden-ratio claim is called out as unsupported; the
  colour-vision prevalence is sourced; modular-scale harmony is labelled a convention; the anti-slop
  calibration names its sources. I went looking for design folklore stated as research and found the
  opposite pattern: claims carefully fenced. The failures of honesty are in the *generated* output
  (C1, C7, C13), not the references.

---

## Verdict

The headline claim is: "this takes someone from a logo and a vague idea, or from nothing, to a
complete durable brand and design system at the level a very capable professional branding agency
would deliver, and everything is tested."

**Not yet true, and the gap is specific.** The deterministic core is better than the claim needs: the
colour mathematics are correct against external references, the ramps keep their promises under
adversarial sweep, the token emitters are coherent across four formats, and the rendered spec sheets
and book are client-presentable. That half genuinely is agency-grade infrastructure.

What fails is the layer the claim actually rests on. The system's one non-negotiable virtue,
"nothing enters a deliverable without being true", is broken in its flagship deliverable: the book
prints accessibility conformance its own audit has just disproved, a fabricated rationale appears on
the components sheet, the audit gates nothing downstream, and the canvas validator both passes
network-reaching artboards it exists to catch and blocks legitimate copy. The workflow the skill
prescribes mangles its own canvas layout (C4), the "from a logo" journey never shows the logo in a
deliverable (C12), and "everything is tested" is false today in the plain sense (705/707) and in the
useful sense: `cmdCanvas` had zero coverage until I ran it, artboards/brandbook rendering had no unit
tests at review start, and the tests that existed validated the unquoted, well-formed, happy-path
form of nearly every input the validators get wrong.

None of this is structural. Every confirmed finding has a local fix, and four findings were fixed by
the team while I was still writing them up, which says the machinery for closing the rest exists.

**The three changes that would most improve it:**

1. **Make the truth machinery actually bind.** Audit failure blocks `book`, `tokens`, `guardian` and
   `canvas` without `--force`; the book's accessibility and contrast sections are rendered from
   measured audit output instead of fixed prose; the components-sheet rationale becomes conditional.
   This single change converts the honesty claim from marketing into behaviour (C1, C2, C7, C13).
2. **Fix the canvas lifecycle end to end.** `sheets` merges the manifest instead of stomping it and
   sizes authored artboards from their real frames; the validator closes the six false negatives,
   demotes the ternary heuristic, and validates manifest numbers; the Territories phase either seeds
   a Main or the contract note is falsified (C3, C4, C5, S1).
3. **Test the seams, not the units.** A regression test for every C18 item; an adversarial fixture
   set for the validator (quoted fonts, css url(), reordered attributes, holes followed by `?`); a
   failing-audit brand run through `book` asserting the output tells the truth; and the two red
   robustness tests fixed. The unit maths did not need more tests; the joints did, and every serious
   finding in this review lives at a joint.

---

## Addendum: answers to the lead's follow-up (written after the 726-green fixes landed)

### A1 · Maths errors a property test will not catch

The colour and type maths are correct as units; I verified them against external references (APCA
canonical pairs, Ottosson matrices, WCAG anchors) and under sweep. What remains wrong lives at the
seams between correct units, which is exactly the blind spot of per-function property tests:

1. **C6.** `tonalRamp` proves its focus ring against the brand ramp's own step 1; `buildSemantic`
   consumes it against neutral step 1. Every property of `tonalRamp` holds forever while the shipped
   system fails 1.4.11 for boundary hues (`#00A692`). The property to add is cross-component:
   *for all seeds, contrast(resolve(focus.ring), resolve(surface.page)) >= 3 in both modes*.
2. **C15.** `bestTextOn` (WCAG-max) chooses the label; `apcaContrast` (the declared floor) judges it.
   Both are individually correct; the composition recommends the perceptually worse label for mid
   greens and pure red/magenta, and mislabels a no-op as `adjusted: true, moved: 0`. Property:
   *onSolid.color is the candidate with the larger |Lc| whenever their |Lc| ordering and WCAG
   ordering disagree.*
3. **C7.** The button hover state pairs `solidStrong.text` with raw step 10. Property over seeds:
   *for every state the components sheet draws, |Lc(label, fill)| >= 60.* Fails today for dark
   olives/yellows.
4. **C1/C13.** The renderers assert conformance in prose while the audit holds the measurements. No
   property test sees prose. The test is: build a failing system, render the book, and assert the
   accessibility section contains no "clears"/"passes" claim the audit contradicts.

One genuine unit-level nit stands (C17): `gamutMapOklch`/`oklchToHex` accept NaN and negative
chroma and emit `#NANNANNAN` or a hue-flipped colour. A fuzz generator that only produces valid
OKLCH will never find it; add the malformed cases explicitly.

### A2 · Tests that would pass even if the implementation were wrong

- **The banned-font tests use the only spelling the regex can match.** Every case in
  `canvas.test.mjs` writes `font-family: Inter, sans-serif` unquoted; the common quoted form evades
  the check entirely (C3.1). The test encodes the implementation's blind spot as the fixture.
- **"Is deterministic" via `deepEqual(f(x), f(x))`.** Both calls share every bug; this only detects
  nondeterminism, which nothing in the code could produce. Harmless but zero-information.
- **The validator is only ever tested against the emitter's own output.** `validateArtboard` tests
  build inputs with `artboard()` and then mutate one thing. Emitter and validator share assumptions
  (attribute order, quoting, single script block), so the mutations can only explore the shapes the
  emitter produces. Real inputs are hand-authored by Claude; none of the six C3 false negatives can
  be reached from `artboard()` output, which is why all six survived 700+ tests.
- **The e2e book assertions are greps for strings the generator hardcodes.** Asserting the HTML
  contains "traceable" or lacks em dashes tests the template literal, not the behaviour. The
  meaningful property (the book tells the truth about a failing system) had no test, and that is
  where C1 lived.
- **"A marginal solid is reported, not hidden" derives its expectation from the code under test.**
  The test recomputes `solidRatio` and `labelLc` with the same functions the warning logic uses, so
  a shared bias in either metric moves both sides identically and the assertion always agrees.
- **The audit tests assert findings exist, never that anything reacts.** `auditSystem` failing is
  tested; no test asserts a failing audit stops `book`/`tokens`/`guardian` (it does not — C2).
- **Single-fixture readiness.** `muddy-paws.json` is one comfortable mid-green brand; "the fixture
  builds a system that passes its own audit" proves the happy path only. The 540-seed sweep that
  found C6 took minutes; a small seed matrix (a yellow, an olive-dark, a near-black, a boundary
  teal) in `system.test.mjs` would have caught it years earlier in project time.

### A3 · Design-director verdict on the rendered work

**Specification sheets and brand book: client-presentable**, comfortably above generated-looking.
Real hierarchy, honest placeholders ("Held by [OWNER NAME]"), a specimen sheet a developer could
build from. Two blemishes already filed: the illegible "Contrast, dark" table (C9) and the
fabricated primary-fill note (C7.2). Fix those and the sheets pass a studio review.

**Authored proof artboards** (Main, Mobile, Print rendered from `scratchpad/mp/_prev/`): honest and
disciplined. Real copy in the brand voice, bracketed placeholders that cannot be mistaken for fact
("[PHOTOGRAPH: a real dog mid-shake in bay two, shot at 5pm]" is exactly right), definition-row
sections instead of the three-card grid, one accent used once on the poster. It would survive being
shown to a client as a direction mock. Four genuine critiques:

1. **The declared distinctive asset is missing from the format it was specified for.** The brand's
   "one thing to remember" is "a dog mid-shake, cropped hard, used at poster scale", and the A4
   poster does not use it; its hero area is empty cream. The system's own signature discipline
   (SKILL.md: "spend the boldness in one place") is not carried into the proof.
2. **The drawn arc silhouette is weak.** In the hero panel it reads as an unfinished squiggle rather
   than a mark, and at wordmark scale it looks like a stray stroke. As an interim asset it needs
   either more drawing or less presence.
3. **Mobile spends the accent on a placeholder.** "[PRICE] a wash" is the only orange on the screen,
   which emphasises the one thing that is not real yet.
4. **Cream ground + high-contrast serif sits inside the anti-slop hazard their own 04 names.** It is
   defensible here (the green is inherited, decision d1), but 04's own rule is to "say in the
   artefact why it was chosen", and no artboard says it.

None of these block the claim; all four are the difference between "good mock" and "agency work".

### A4 · Three highest-value improvements (unchanged from the verdict, restated against the green tree)

1. Make the audit binding and render every conformance claim from measured audit output (C1, C2, C7,
   C13). This is the honesty layer and it is still the largest gap.
2. Fix the canvas lifecycle: manifest merge and real frame sizes in `sheets` (C4), manifest number
   validation (C5), the six validator false negatives and the ternary false positive (C3), and the
   Territories Main question (S1).
3. Test the seams: cross-component contrast properties (A1), adversarial hand-authored validator
   fixtures (A2), and a failing-audit book test. The units are proven; every remaining confirmed
   defect lives at a joint.
