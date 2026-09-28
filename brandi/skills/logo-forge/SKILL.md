---
name: logo-forge
description: Generate a real range of logo concepts and take one through to a production master. Deals concept slots that cannot converge, drives parallel agents to draw them, measures every candidate mechanically before anybody says what they like, presents them on a Design canvas, traces a sketch the person picks into a clean vector and gives options on that exact drawing, and turns the chosen direction into outlined vector masters with clear space, minimum sizes and a provenance record. Use when someone needs a logo, a mark, a wordmark, a monogram, a lockup, a symbol, a favicon, a brand mark, or has no logo at all and needs one. Trigger on "design a logo", "we need a logo", "make me a mark", "logo concepts", "logo options", "wordmark", "monogram", "lockup", "brand mark", "rebrand the logo", "our logo is terrible", "options on this one", "variations of this logo", "trace this sketch", "vectorise this", or when a brand build reaches the point of needing a mark and none exists. Runs inside the brand-system journey at the start of Identity, and also stands alone.
---

# Logo forge

You are running a concept round the way a studio does, and the studio's whole reputation is that
its work does not look like everybody else's. Two things go wrong in this job and both are
preventable.

**Twelve concepts that are one idea twelve times.** Asking for variety produces agreement and then
repetition. So variety is not requested here, it is dealt: `logo plan` writes twelve slot briefs,
each with a different architecture, register and symbol approach, and no two sharing a pair. Each
one goes to a different agent, and each agent sees only its own brief. An agent that can see the
round converges on it.

**A decision made on preference before anybody ran a test.** Once somebody has said they like a
mark it is very hard to fail it on arithmetic. So the arithmetic runs first, on everything, and the
concepts that cannot survive a favicon or a one-colour press never reach the conversation.

One rule holds the whole thing together, and it does not bend: **a person picks.** Nothing becomes
the mark because a machine liked it. A generated mark is a starting point somebody approved, not a
drawn one, and every deliverable says so.

## Resolve the command line

```bash
A="$(command -v brandi || true)"
[ -z "$A" ] && A="$(ls -d "$HOME"/.claude/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
[ -z "$A" ] && A="$(ls -d "${CODEX_HOME:-$HOME/.codex}"/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
[ -z "$A" ] && A="<this skill's base directory>/../../bin/brandi"
"$A" logo status
```

If none of those resolve, say so plainly rather than improvising a path. Wherever this file writes
`<brandi>`, it means the plugin root, `$(dirname "$A")/..`; put the resolved absolute path into
anything you hand to another agent.

```bash
"$A" logo plan     --count 12 [--seed x] [--name "X"] [--category "X"] [--oneLiner "X"]
"$A" logo wordmark --font "Bitter" --weight 700 [--case upper] [--tracking -15]
"$A" logo lockup   --symbol s.svg --wordmark w.svg [--stacked]
"$A" logo trace    brand/media/ideation/idea-C2-2.png --crop x,y,w,h [--from C2] [--architecture symbol-only]
"$A" logo import   brand/logo/concepts/round-01 --model "<the drawing agents' model id>"
"$A" logo audit
"$A" logo board
"$A" logo pick     A2 C1 D3
"$A" logo refine                            # four tasks per shortlisted direction
"$A" logo master   C1p --approved-by "Jake"
"$A" logo colour   plan | audit | board | approve <id> --approved-by "Jake"
"$A" logo status
```

Add `--json` to any of them to read the result as data.

## Where this sits

Inside the brand-system journey it runs at the **start of Identity**, after a direction has been
chosen in Territories and before any colour is decided. That order is deliberate: every concept is
drawn and judged in black on white, because a weak silhouette rescued by a good palette is a
decision you find out about eighteen months later on a one-colour press.

It also runs alone. With no `brand/brand.json` it takes what it needs from arguments, and with
neither it asks once and gets on with it.

## The journey

Eight steps. Three of them stop for the user. Everything else runs on its own, and the concept
round is about eight minutes of waiting.

### 1. The brief (one question at most)

Run `"$A" logo status`. If a round exists, resume it rather than starting over.

The forge reads `brand/brand.json` for the name, category, positioning and audience. If those are
there, ask nothing.

If they are not, you need exactly two facts: **the name, spelled exactly as it must be set**, and
**what the business does, in one line**. Get both in one `AskUserQuestion` (one plain message where
there is no such tool), or from the prompt if it already said. Never ask a third.

If nobody answers, do not stall. Infer the name from the directory or `package.json`, commit to one
reading of what the business does, state the assumption in a line, and carry on. A round delivered
under stated assumptions is useful; a round that never happened is not.

### 2. Plan the range (no questions)

```bash
"$A" logo plan --count 12
```

Every slot brief carries the chosen direction and its drawing style from `brand.json`, so the
round varies the idea and keeps the hand. Write `identity.illustration.style` first if the brand
illustrates: a mark that could not sit beside the illustrations is off-brief, however good it is.

Twelve is the default and the right number. Fewer than eight is not a range; more than sixteen is
a wall nobody reads. It writes one brief per slot to `brand/logo/brief/slots/round-01/`.

Read two or three of them so you know what you are dispatching. Do not edit them.

### Sparks from image models (the default when Higgsfield is ready)

When Higgsfield is ready (`"$A" media status`), the round starts from sparks without being asked:
each slot brief rendered by a different image model, black on white, before anybody draws. Two
sources of variety at once: the briefs cannot converge, and no two sparks share a model's house
style. A person reacts to pictures far faster than to descriptions. On one run the owner rejected
a whole drawn round and had to ask for this wall; everything they liked came out of it.

```bash
"$A" media plan --kinds ideation     # one spark slot per concept slot, models rotated from the live catalogue
"$A" media cost && "$A" media run
"$A" media board --kind ideation     # publish it like any board
"$A" media pick idea-C1-1 idea-D2-2  # the ones the person thinks are worth pursuing
```

Each prompt carries the brand's own hand when `identity.illustration.style` is written, so the wall
is sketched in the family the brand already draws in. When the brand has a finished illustration
library, add two or three sparks that take a library drawing as their style reference:

```bash
"$A" media add idea-house-1 --kind ideation --count 2 \
  --refs '{"image_references":["brand/illustration/png/illo-birthday.png"]}' \
  --prompt "A logo mark for \"<name>\" drawn in exactly this hand: the same line, the same weight. Black on white."
```

Check each spark against its own slot's refusals before the person sees the wall; image models
sometimes draw the cliche they were told to avoid. A spark is never approved into the brand:
`media approve` refuses them.

**When they pick, ask what they picked.** Straight after the pick, one `AskUserQuestion` with one
question per picked spark: *this drawing, or its idea?* Skip it for a spark they have already
answered for ("I like C2-2" about how it looks is "this drawing"). The two answers take different
paths, and guessing wrong costs rounds.

- **This drawing.** Trace it (below). The trace is the concept. Every option after that is an
  option on it.
- **Its idea.** The slot's agent gets the spark with its brief in step 3 and redraws the idea under
  the brief.

Once they have picked, step 3 draws only the slots picked for their idea. When every pick is "this
drawing", there is no drawing step: trace, audit, board, and the options come from refining the
trace.

### A reference they picked: trace it, then give options on it

This path covers a picked spark, and equally a sketch, a photo of a napkin or any image the person
hands over and says "like this one".

```bash
"$A" logo trace brand/media/ideation/idea-C2-2.png --crop 0.34,0.17,0.33,0.39 --from C2
```

Look at the image first and crop to the mark with a margin of paper all round. Fractions of the
image are fine. `--from` carries the slot's brief with it. `--architecture symbol-only` when the
crop is a symbol out of a lockup sketch. It writes the trace as a concept of the round, with its
overlap with the reference and an overlay PNG: black where both have ink, red where only the
reference does, blue where only the trace does. Read the overlay before going on. It warns when the
crop cuts through the mark. Under 95% means the crop caught something else.

If the sketch has lettering they like, set the name in the nearest real face with `logo wordmark`
and put the candidates beside the sketch's lettering. Wordmarks are set, not traced. Trace the
lettering only when no face comes close, and say that is what happened.

Then `audit`, `board` and publish. `board` adds a Reference artboard: the picked image, the trace
and the overlay side by side, which is the comparison the person is making. A trace can fail the 16 pixel
test, because an image model draws for a poster. That is the 16 pixel refinement's job. Never a
reason to drop the person's pick.

When they confirm it is the drawing, the options come from refining it, never from a new concept
round:

```bash
"$A" logo pick T1
"$A" logo refine
```

A trace gets five refinement tasks, not four. The first is the clean-up: straighten what was
plainly meant to be straight, even out an accidental wobble, change nothing else. The refinement
boards show the trace first, labelled as the original, so every option is judged against the thing
they picked.

With Higgsfield there, add image-model variations of the spark itself. Each gets the spark as its
reference image and a prompt that names the one thing to vary:

```bash
"$A" media add vary-c2-weight --kind ideation --count 2 \
  --refs '{"image_references":["brand/media/ideation/idea-C2-2.png"]}' \
  --prompt "The same K, same construction, same rounded terminals, one step heavier. Black on white."
```

Trace whichever one they pick, the same way. Every variation is a spark, never a mark.

Two rules for this path, from a real engagement that cost five rounds:

- **Options on one thing are options on that thing.** Fresh concepts, "in the style of" rebuilds
  and parametric look-alikes are a different question from the one they asked.
- **Never hand-build a board.** `logo board` rebuilds every board from the files on disk. A board
  patched by hand showed the old mark in half its cells, and the person saw it before anyone
  else did.

### 3. Draw (parallel agents, and this is the part that matters)

Dispatch **one agent per slot**, or one agent per two slots if you want to halve the cost, with
the `Agent` tool and `model: "opus"`. Each agent gets:

- The contents of **its own slot brief only**. Never the plan, never another slot, never the
  round. This is the anti-convergence mechanism and it is trivially easy to break by helpfully
  adding context.
- The path it must write to: `brand/logo/concepts/round-01/<ID>.svg`.
- `references/11-logo-craft.md` to read first, which is how to draw an SVG mark that is not
  amateur: the construction grid, optical correction, stroke versus fill, node discipline.

Without a subagent tool, draw the slots yourself one at a time, and never re-read another slot's
brief or your own earlier marks while drawing; say in the handover that isolation was procedural,
not enforced.

Every agent is told, verbatim:

> Read `<brandi>/skills/brand-system/references/11-logo-craft.md` before drawing anything.
> Draw ONE mark. Write it to `<path>`. Then stop.
> Black on white only: `fill="#111111"`, nothing else. No colour, no gradient, no `<text>`, no
> raster, no CSS classes, no `currentColor`. Integer `viewBox`, `0 0 100 100` for a symbol.
> Every painted node carries an explicit `fill`. The file must declare
> `xmlns="http://www.w3.org/2000/svg"` and every attribute must be quoted, or it renders as
> nothing and you will not be told.
> Build the small-grade asset first, at 16 pixels, and let it drive the rest.
> Tens of path nodes, not hundreds. Hundreds means a traced raster and it wobbles at large sizes.
> Return only: the path you wrote, one sentence on what the mark signals, and one sentence on what
> it deliberately is not.

For a slot whose picked spark is wanted for its idea, add, verbatim:

> `<spark path>` is a raster sketch from an image model. Redraw its idea as a vector mark under
> your brief. Do not trace it: build it on the construction grid from the craft reference. Where
> the sketch breaks your brief, the brief wins. A redraw nobody would connect to the sketch has
> lost the reason it was picked.

Then import that slot's file on its own, with a model string naming both, so its provenance record
carries it: `"$A" logo import brand/logo/concepts/round-01/C1.svg --model "<the agents' model id>,
redrawn from a Higgsfield spark"`. One import call gives every file in it the same string. When a redrawn concept becomes
the master, the generation manifest lists the picked sparks with their models and job ids. They
belong in the similarity search, because an image model can reproduce a mark that already exists.

For a wordmark slot, the agent does not hand-draw letters. It calls:

```bash
"$A" logo wordmark --font "Cabin" --weight 600 --tracking -15 --out brand/logo/concepts/round-01/A1.svg
```

which sets the name in a real licensed face and converts it to outlines. Hand-drawn letterforms
from a language model are the single most reliable way to make a wordmark look machine-made.

### 4. Measure, then present (no questions)

```bash
"$A" logo import brand/logo/concepts/round-01 --model "<the drawing agents' model id>"
"$A" logo audit
"$A" logo board
```

`audit` renders every candidate at 16, 32, 64 and 256 pixels in one browser pass and measures it:
stroke ratios, colour counts, whether the counters close at favicon size, whether two areas were
only being told apart by hue, and whether any two concepts are the same idea twice. `board` writes
five artboards.

**Read the audit output before you present.** If more than half the round was rejected, the brief
or the draw instructions are wrong, not the concepts. Fix that and rerun rather than presenting a
round with two survivors.

Then publish the canvas, exactly as `brand-system` does it under "Publishing a canvas":

1. `$A validate --dir brand/logo/canvas` and fix every error.
2. `$A canvas --dir brand/logo/canvas --title "<Brand> logo round 1" --json`. It writes the canvas
   folder and prints the Artifact calls.
3. A new canvas: `Artifact` quickstart with intent `design` gives the Design type's `type_url`.
   Publish with that `type_url`, the title, `auto_open: "after_first_write"` and nothing else.
4. Make each call the command printed, in order, to the url step 3 returned.

A later round of the same forge is a new canvas. A change to this round goes to the same url.

If there is no `Artifact` tool (Codex, or any session without it), stop after step 1 and render the
boards with `node <brandi>/scripts/preview.mjs --dir brand/logo/canvas --out <dir>`;
it frames each artboard the way canvas.json records it and writes an index page beside the PNGs.
Hand that page over instead of a link.

**Render the boards and look at them before publishing.** The validator is structural; it cannot
see a layout that is merely bad.

```bash
node <brandi>/scripts/preview.mjs brand/logo/canvas/Range.dc.html --out /tmp/p --width 1440 --height 1900
```

### 5. The user picks (STOP HERE)

Show the link. Say, in three or four sentences: how many concepts, how they were split, what the
audit ruled out and why, and that the job today is to keep two or three alive rather than to choose
a winner.

Point them at the **Favicons** board specifically. It settles most rounds, and it is the test
everybody agrees matters and nobody runs.

```bash
"$A" logo pick A2 C1 D3
```

If they name one, take it, and say once that a single direction out of a first round is usually the
safest thing in the set. Do not argue twice.

### 6. Refine

```bash
"$A" logo refine
```

It takes the shortlist and deals four slots per direction: the 16-pixel redraw, proportion, weight,
and the square alternate. That is what a refinement round is, and it is not a second concept round:
dealing fresh concepts here is how a good direction gets lost.

Dispatch these the same way, one agent per slot, but with the opposite rule about context. A
concept agent must not see anything else in the round; a **refinement agent must see exactly one
thing, the mark it is refining**, and the brief already names the file. Tell each one plainly that a
refinement nobody recognises as the same mark has failed, however good it is.

Then `import`, `audit`, `board`, publish, and let them choose. The boards put each original first,
so the refinements are judged against it. The audit knows this is a refinement round: two
refinements of one parent are supposed to look alike, so it only reports them when they are the
same artwork, which means the task was not done.

When they say "closer to the original", the answer is another refinement of the same parent, not a
new round. When they point at one cell and say "that, but", refine that cell.

Where a direction needs a symbol and a wordmark locked up, compose rather than draw:

```bash
"$A" logo wordmark --font "Archivo" --weight 600 --tracking -20
"$A" logo lockup --symbol brand/logo/concepts/round-02/C1p.svg --wordmark brand/logo/master/wordmark.svg
"$A" logo lockup --symbol brand/logo/concepts/round-02/C1p.svg --wordmark brand/logo/master/wordmark.svg --stacked
```

The gap and the symbol size are multiples of the wordmark's cap height, so the horizontal and the
stacked version cannot drift apart and neither one stretches at large sizes or crowds at small ones.

### 7. Master

```bash
"$A" logo master C1p --approved-by "<the person's name>"
```

That normalises the artwork, writes the mono and reversed renditions, computes the clear-space rule
and the minimum sizes from the real geometry, writes the outcome into `brand.json`, and produces
the generation manifest and the search record.

**`--approved-by` is not optional in spirit.** Without it the record says nobody approved it, and it
should stay that way until somebody actually did.

### 8. Colour (STOP HERE, at the end)

Colour is a stage of this journey and it is the last one. It does not open until a person has
approved the silhouette and the brand's palette has resolved, and `logo colour` refuses to run
until both are true rather than explaining that they should be.

```bash
"$A" logo colour plan
"$A" logo colour audit
"$A" logo colour board
```

`plan` deals four to six treatments from the brand's own palette: the mark in the brand colour on
paper, reversed out of the brand ground, in ink on that ground, and in one ink for press, plus a
two-colour treatment for each boundary the mark actually contains. A treatment is recorded as a
mapping from an ink the mark was drawn in to a role in the palette, never as a colour. Change the
palette and every treatment follows.

A mark drawn in one ink has one region. The plan says so and deals only what a one-region mark can
take. Nobody invents a boundary so the set can reach six.

`audit` measures the paint count against each application context ceiling, the contrast of every
colour against every ground the brand uses, how each treatment reads under protanopia, deuteranopia
and tritanopia, and the one-colour test: the mark is rendered in its colourway and again with every
ink collapsed to one, and if it reads as more separate shapes in colour than in ink, colour is
carrying a split the shape is not. That treatment is ruled out and the finding names the regions.

`board` writes four artboards. Publish them the same way as the concept round. On the Colourways
board every treatment sits beside its own greyscale and its own 16 pixel render, in that order,
because that is where a person sees whether the silhouette is still carrying the mark.

Show the link, then record the choice:

```bash
"$A" logo colour approve brand-on-paper --approved-by "<the person's name>"
```

Without `--approved-by` nothing is recorded, exactly as with `master`. The approved treatment goes
into `brand.json` as `identity.logo.colourways`, `brandi assets` derives its rendition alongside the
five it already writes, and the brand book gains a colourway page.

Hand off to `brandi assets` for the raster pack, the favicon and the manifest, which derives all of
it from the master.

## The parts that are not negotiable

**A person picks.** Never adopt a generated mark because the audit liked it. The audit rules things
out; it never rules anything in.

**When they point at one thing, give options on that thing.** A picked drawing is traced and
refined. It is never handed to an agent to reinterpret, and never answered with a fresh range.

**Black first, and the tool enforces it.** You have to love the mark as a silhouette before colour
enters. The concept round is black on white because a silhouette that only works in colour is a mark
that fails on a one-colour press, and you find that out eighteen months later on an invoice, a stamp
and a shirt. Colour is a stage, and it comes after a person has approved the shape. A colourway
never carries meaning the silhouette cannot carry alone, and the audit rules out any that does.

If someone asks to see it in colour during the concept round, say that colour is step 8, that it is
gated on an approved mark and a resolved palette, and that it takes about a minute once both exist.

**Say what the mark is.** In the book, in the manifest, out loud: a generated mark is a starting
point a person approved. It has not been searched, it has not been cleared, and an AI-assisted mark
is not automatically original. `brand/logo/rights/` holds the checklist. For anything going on a
building, a vehicle or a registration, a trade mark professional looks at it first. The links are in
the search record.

**A typeset wordmark is a real answer.** If the round produces nothing worth keeping, say so, and
set the name properly instead. A wordmark applied consistently for five years beats a mediocre
symbol every time, and it can gain a symbol later without losing anything it has earned.

**Do not narrate the machinery.** The user wants to look at marks. They do not want to hear about
perceptual distance or erosion rounds unless they ask.

## Reference files

| File | When |
| --- | --- |
| `../brand-system/references/11-logo-craft.md` | Before drawing anything. The construction craft, the taxonomies, the refusal list |
| `../brand-system/references/08-logo-system.md` | Once a mark exists: variants, clear space, misuse, the favicon pack |
| `../brand-system/references/04-anti-slop.md` | Before every visual round |
| `../brand-system/references/05-canvas-recipes.md` | Any time you author an artboard |
| `../brand-system/references/12-media-generation.md` | Sparks, and the logo sting once a master exists |
