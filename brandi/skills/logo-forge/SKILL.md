---
name: logo-forge
description: Generate a real range of logo concepts and take one through to a production master. Deals concept slots that cannot converge, drives parallel agents to draw them, measures every candidate mechanically before anybody says what they like, presents them on a /design canvas, and turns the chosen direction into outlined vector masters with clear space, minimum sizes and a provenance record. Use when someone needs a logo, a mark, a wordmark, a monogram, a lockup, a symbol, a favicon, a brand mark, or has no logo at all and needs one. Trigger on "design a logo", "we need a logo", "make me a mark", "logo concepts", "logo options", "wordmark", "monogram", "lockup", "brand mark", "rebrand the logo", "our logo is terrible", or when a brand build reaches the point of needing a mark and none exists. Runs inside the brand-system journey at the start of Identity, and also stands alone.
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
[ -z "$A" ] && A="<this skill's base directory>/../../bin/brandi"
LOGO="$(dirname "$A")/../scripts/logo.mjs"
node "$LOGO" status
```

If none of those resolve, say so plainly rather than improvising a path.

```bash
node "$LOGO" plan     --count 12 [--seed x] [--name "X"] [--category "X"] [--oneLiner "X"]
node "$LOGO" wordmark --font "Bitter" --weight 700 [--case upper] [--tracking -15]
node "$LOGO" lockup   --symbol s.svg --wordmark w.svg [--stacked]
node "$LOGO" import   brand/logo/concepts/round-01 --model "claude-opus-5"
node "$LOGO" audit
node "$LOGO" board
node "$LOGO" pick     A2 C1 D3
node "$LOGO" refine                            # four tasks per shortlisted direction
node "$LOGO" master   C1p --approved-by "Jake"
node "$LOGO" status
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

Seven steps. Two of them stop for the user. Everything else runs on its own, and the whole thing is
about eight minutes of waiting.

### 1. The brief (one question at most)

Run `node "$LOGO" status`. If a round exists, resume it rather than starting over.

The forge reads `brand/brand.json` for the name, category, positioning and audience. If those are
there, ask nothing.

If they are not, you need exactly two facts: **the name, spelled exactly as it must be set**, and
**what the business does, in one line**. Get both in one `AskUserQuestion`, or from the prompt if it
already said. Never ask a third.

If nobody answers, do not stall. Infer the name from the directory or `package.json`, commit to one
reading of what the business does, state the assumption in a line, and carry on. A round delivered
under stated assumptions is useful; a round that never happened is not.

### 2. Plan the range (no questions)

```bash
node "$LOGO" plan --count 12
```

Twelve is the default and the right number. Fewer than eight is not a range; more than sixteen is
a wall nobody reads. It writes one brief per slot to `brand/logo/brief/slots/round-01/`.

Read two or three of them so you know what you are dispatching. Do not edit them.

### 3. Draw (parallel agents, and this is the part that matters)

Dispatch **one agent per slot**, or one agent per two slots if you want to halve the cost. Use
Opus. Each agent gets:

- The contents of **its own slot brief only**. Never the plan, never another slot, never the
  round. This is the anti-convergence mechanism and it is trivially easy to break by helpfully
  adding context.
- The path it must write to: `brand/logo/concepts/round-01/<ID>.svg`.
- `references/11-logo-craft.md` to read first, which is how to draw an SVG mark that is not
  amateur: the construction grid, optical correction, stroke versus fill, node discipline.

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

For a wordmark slot, the agent does not hand-draw letters. It calls:

```bash
node "$LOGO" wordmark --font "Cabin" --weight 600 --tracking -15 --out brand/logo/concepts/round-01/A1.svg
```

which sets the name in a real licensed face and converts it to outlines. Hand-drawn letterforms
from a language model are the single most reliable way to make a wordmark look machine-made.

### 4. Measure, then present (no questions)

```bash
node "$LOGO" import brand/logo/concepts/round-01 --model "claude-opus-5"
node "$LOGO" audit
node "$LOGO" board
```

`audit` renders every candidate at 16, 32, 64 and 256 pixels in one browser pass and measures it:
stroke ratios, colour counts, whether the counters close at favicon size, whether two areas were
only being told apart by hue, and whether any two concepts are the same idea twice. `board` writes
five artboards.

**Read the audit output before you present.** If more than half the round was rejected, the brief
or the draw instructions are wrong, not the concepts. Fix that and rerun rather than presenting a
round with two survivors.

Then publish the canvas, exactly as `brand-system` does it:

1. `$A validate --dir brand/logo/canvas` and fix every error.
2. `$A canvas --dir brand/logo/canvas --title "<Brand> logo concepts" --out <brand>-logo.html`
3. Publish with the `Artifact` tool: `contract: "0.1.31"`, a one-line description, a favicon of one
   or two emoji. On a first publish, load `artifact-capabilities` and declare what that user's
   roster lists.
4. Republish to the same path with the same favicon and contract, and no `capabilities`.

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
node "$LOGO" pick A2 C1 D3
```

If they name one, take it, and say once that a single direction out of a first round is usually the
safest thing in the set. Do not argue twice.

### 6. Refine

```bash
node "$LOGO" refine
```

It takes the shortlist and deals four slots per direction: the 16-pixel redraw, proportion, weight,
and the square alternate. That is what a refinement round is, and it is not a second concept round:
dealing fresh concepts here is how a good direction gets lost.

Dispatch these the same way, one agent per slot, but with the opposite rule about context. A
concept agent must not see anything else in the round; a **refinement agent must see exactly one
thing, the mark it is refining**, and the brief already names the file. Tell each one plainly that a
refinement nobody recognises as the same mark has failed, however good it is.

Then `import`, `audit`, `board`, publish, and let them choose. The audit knows this is a refinement
round: two refinements of one parent are supposed to look alike, so it only reports them when they
are the same artwork, which means the task was not done.

Where a direction needs a symbol and a wordmark locked up, compose rather than draw:

```bash
node "$LOGO" wordmark --font "Archivo" --weight 600 --tracking -20
node "$LOGO" lockup --symbol brand/logo/concepts/round-02/C1p.svg --wordmark brand/logo/master/wordmark.svg
node "$LOGO" lockup --symbol brand/logo/concepts/round-02/C1p.svg --wordmark brand/logo/master/wordmark.svg --stacked
```

The gap and the symbol size are multiples of the wordmark's cap height, so the horizontal and the
stacked version cannot drift apart and neither one stretches at large sizes or crowds at small ones.

### 7. Master

```bash
node "$LOGO" master C1p --approved-by "<the person's name>"
```

That normalises the artwork, writes the mono and reversed renditions, computes the clear-space rule
and the minimum sizes from the real geometry, writes the outcome into `brand.json`, and produces
the generation manifest and the search record.

**`--approved-by` is not optional in spirit.** Without it the record says nobody approved it, and it
should stay that way until somebody actually did.

Hand off to `brandi assets` for the raster pack, the favicon and the manifest, which derives all of
it from the master.

## The parts that are not negotiable

**A person picks.** Never adopt a generated mark because the audit liked it. The audit rules things
out; it never rules anything in.

**Black first.** Colour is not applied in a concept round. If someone asks to see it in colour, say
that colour comes after the silhouette is right, and that it takes ten seconds once it is.

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
