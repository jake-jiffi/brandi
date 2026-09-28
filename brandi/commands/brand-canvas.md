---
description: Rebuild and republish the brand canvas from the working artboard files
argument-hint: [an optional title for the canvas]
---

Rebuild the canvas from `brand/canvas/`.

```bash
A="$(command -v brandi || true)"
[ -z "$A" ] && A="$(ls -d "$HOME"/.claude/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
[ -z "$A" ] && A="$(ls -d "${CODEX_HOME:-$HOME/.codex}"/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
```
```bash
"$A" validate --dir brand/canvas
"$A" canvas --dir brand/canvas --title "$ARGUMENTS" --json
```

Fix every validation error first. Then follow "Publishing a canvas" in the `brand-system` skill:
the command writes the canvas folder and prints the `Artifact` calls that send it.

If this canvas was published before, send the changed artboards to its existing url so it updates
in place rather than creating a second one. Without that url, `Artifact` with action `list` finds
it by title.
