---
description: Hold work against the brand: off-palette colours, off-brand type, banned vocabulary, generic patterns
argument-hint: [paths to check, defaults to the whole project]
---

Run the brand check over: $ARGUMENTS

```bash
A="$(command -v brandi || true)"
[ -z "$A" ] && A="$(ls -d "$HOME"/.claude/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
```

```bash
"$A" check $ARGUMENTS
```

If the user named no paths, check the whole project: `brandi check .`

Generated artefacts (the specification sheets, the brand book, the token files) are skipped and the
report says how many: they come from the brand, so auditing them against it proves nothing, and the
misuse pages are wrong on purpose. A run
returning thousands means the target is wider than the brand, not that the work is that broken:
narrow it to the directories the team actually authors, and say so rather than reciting the count.

Report what it finds, ranked by how much it actually matters, and say plainly which findings are
real problems and which are worth accepting. Do not silently fix anything: the user decides. If they
ask you to fix, fix the causes rather than the symptoms, and where a finding turns out to be a
deliberate choice, record it in the decision log in `brand/brand.json` instead of suppressing it.

If there is no brand file yet, say so and offer to run `/brandi:brand`.
