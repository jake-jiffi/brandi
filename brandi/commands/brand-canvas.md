---
description: Rebuild and republish the brand canvas from the working artboard files
argument-hint: [an optional title for the canvas]
---

Rebuild the canvas from `brand/canvas/`.

```bash
A="$(command -v brandi || true)"
[ -z "$A" ] && A="$(ls -d "$HOME"/.claude/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
```
```bash
"$A" validate --dir brand/canvas
"$A" canvas --dir brand/canvas --title "$ARGUMENTS" --out brand-canvas.html
```

Fix every validation error before seeding. If the design helper is missing, invoke the `design`
skill once so Claude Code extracts it, then retry.

Publish the seeded file with the `Artifact` tool using `contract: "0.1.31"` and the same favicon the
canvas already has. If this canvas was published before, pass its existing URL so it updates in
place rather than creating a second one.
