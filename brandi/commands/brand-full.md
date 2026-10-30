---
description: Build the brand, then the product system on it, in one run: one batch of questions, no stop between
argument-hint: [brand name, a URL, a description, or nothing at all]
---

Run both journeys, one after the other, as one job: the `brand-system` skill to its Publish phase,
then the `product-system` skill on the brand it made (route A). Invoke each skill when its half
starts and follow it exactly. This command only changes how the two are joined.

What the user said, which may be empty: $ARGUMENTS

```bash
A="$(command -v brandi || true)"
[ -z "$A" ] && A="$(ls -d "$HOME"/.claude/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
[ -z "$A" ] && A="$(ls -d "${CODEX_HOME:-$HOME/.codex}"/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
```

**Where to start.** Run `"$A" status`. With no brand file, `init` and begin the brand at Recon.
With a brand short of Publish, resume it at the phase it reports. With the brand published and
`product/tokens.json` present, resume the product system from its last round record. With the brand
published and no product yet, start the product system at its Recon.

**Ask once, for both.** The brand journey's intake and the product system's intake go in one
batched question at the start, each with a working assumption so one word answers it: the brand's
four questions, then the surfaces the brand will ship on, who uses each and for what, the systems
each touches, the AI stance and the platforms. Add one more: may every canvas, page and Design
System artifact be published as it is ready (private until they share it)? Assume yes. After that
batch, ask nothing until the end: decide, record each decision with its reason, and file every gap
as an open question with a stated assumption. Picks the person would normally make (a territory, a
product direction, an option A to D) are made on their behalf, recorded as decided by the run, and
listed for them to confirm.

**No stop between the halves.** When the brand's Publish is done, report it in two lines and go
straight on to the product system's Recon on the same brand. The brand's own publish gate is the
yes given in the batch.

**Check the disk before the product half.** The product starter's install and the gates' renders
need about 2GB free. Run `df -h .` first. Short of it, say what is using the space among the run's
own outputs (scene originals, npm caches, screenshots), and stop with that list rather than
failing half way: never delete anything the person has not said may go.

**Done means both bars.** The brand is done when `"$A" status` shows Publish complete. The product
system is done when `"$A" product round` reports the bar met, the Design System artifact and the
product canvas are published, and the round record says so. A product system that misses the bar
is published as a draft, with the record saying so, never as if it passed. Then give one closing
report: the links, what was decided on the person's behalf, and the open questions for the brand
owner.
