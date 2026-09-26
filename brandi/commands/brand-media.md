---
description: Generate the brand's photography, scenes, motion, sound and logo sparks with Higgsfield, when it is installed
argument-hint: [what to make, e.g. "the photography" or "a logo sting", or nothing at all]
---

Generate media for the brand. Invoke the `brand-system` skill, read
`references/12-media-generation.md`, and follow it exactly.

What the user said, which may be empty: $ARGUMENTS

Start with `brandi media status`. If Higgsfield is not ready, say in one line what it would add and
the command that adds it, and stop. The brand is complete without it.

If it is ready, run `brandi media models` before anything else, and read it. Model choice is live:
the strongest model that can do each job this week, not the one that was strongest when this was
written.

Four things the user cares about, so get them right:

- **Top quality on anything that ships.** The fitted parameters already take the top rung of every
  quality ladder. Do not step them down to save credits without saying so.
- **Trial before committing a job.** Run `brandi media trial` on the first slot of a job, look at the
  results at full size, and pin the winner with its reason before prompting the rest.
- **The mark is never generated.** Scenes are blank and get the real mark composited on; stings end
  on a frame rendered from the master; sparks go back to the forge.
- **A person approves.** Nothing reaches the book until someone approves it by name, and a spark
  never does.

Say what it will cost before the first run, from `brandi media cost`. The plan's budget stops a run
that would pass it. When the work calls for more, raise it with `--budget` and say that you did.
