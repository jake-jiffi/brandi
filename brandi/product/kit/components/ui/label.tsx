"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/label.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label as LabelPrimitive } from "radix-ui"

const Label = React.forwardRef(function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>, ref: React.ForwardedRef<any>) {
  return (
    // Patched (07-starter.md, label): the label style in text-strong, so it stays readable beside an error.
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 type-label text-text-strong select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

export { Label }
