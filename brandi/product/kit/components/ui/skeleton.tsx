// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/skeleton.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef(function Skeleton({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
      ref={ref}
    />
  )
})

export { Skeleton }
