"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/progress.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress as ProgressPrimitive } from "radix-ui"

// Patched (07-starter.md, progress): passes value and max through to Radix, clamped to the range Radix
// accepts, so screen readers hear the value instead of an empty bar. The track is a groove you can see on
// any surface (the hairline in light, the chart track in dark), the indicator takes a tone from
// `indicatorClassName` with a rounded end, and it glides only when motion is welcome.
const Progress = React.forwardRef(function Progress({
  className,
  indicatorClassName,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }, ref: React.ForwardedRef<any>) {
  const top = max > 0 ? max : 100
  const clamped = value == null || !Number.isFinite(value) ? null : Math.min(top, Math.max(0, value))
  const percent = clamped == null ? 0 : (clamped / top) * 100
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-line dark:bg-chart-track",
        className
      )}
      value={clamped}
      max={top}
      {...props}
      ref={ref}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("size-full flex-1 rounded-full bg-primary motion-safe:transition-transform motion-safe:duration-300", indicatorClassName)}
        style={{ transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})

export { Progress }
