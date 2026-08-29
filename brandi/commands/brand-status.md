---
description: Show where the brand system has got to, and what is blocking the next phase
---

```bash
A="$(command -v brandi || true)"
[ -z "$A" ] && A="$(ls -d "$HOME"/.claude/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
```

```bash
"$A" status
```

Report the phase, what is done, and what is blocking. If the system has been resolved, also run
`system` and surface any audit findings. Offer the next command rather than a summary of the last one.
