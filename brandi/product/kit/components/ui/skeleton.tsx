// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/skeleton.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

// Patched (07-starter.md, skeleton): the line colour, a step darker than the surface in light and lighter in dark
// (shadcn's muted is surface-sunken, near black in dark, so a large skeleton read as a hole). The pulse only when
// motion is welcome, hidden from screen readers (say "Loading" once nearby instead), and a dashed edge in forced
// colours, where the fill disappears.
const Skeleton = React.forwardRef(function Skeleton({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("rounded-sm bg-line motion-safe:animate-pulse forced-colors:border forced-colors:border-dashed", className)}
      {...props}
      ref={ref}
    />
  )
})

export { Skeleton }
