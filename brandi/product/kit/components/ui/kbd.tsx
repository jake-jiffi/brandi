// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/kbd.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Patched (07-starter.md, kbd): the system's key style (a read shape, so small corners, a hairline and the
// caption type), a rail variant in the rail's own tokens, and hidden on touch screens, where nobody has the
// keys. Inside a tooltip it drops its edge and takes the tooltip's inverse text.
const kbdVariants = cva(
  "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-xs border px-1.5 type-caption whitespace-nowrap select-none pointer-coarse:hidden in-data-[slot=tooltip-content]:border-transparent in-data-[slot=tooltip-content]:bg-text-inverse/15 in-data-[slot=tooltip-content]:text-text-inverse [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "border-line bg-surface-subtle text-text-muted",
        rail: "border-rail-line bg-transparent text-rail-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Kbd = React.forwardRef(function Kbd({ className, variant, ...props }: React.ComponentProps<"kbd"> & VariantProps<typeof kbdVariants>, ref: React.ForwardedRef<any>) {
  return (
    <kbd
      data-slot="kbd"
      data-variant={variant ?? "default"}
      className={cn(kbdVariants({ variant }), className)}
      {...props}
      ref={ref}
    />
  )
})

const KbdGroup = React.forwardRef(function KbdGroup({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
      ref={ref}
    />
  )
})

export { Kbd, KbdGroup, kbdVariants }
