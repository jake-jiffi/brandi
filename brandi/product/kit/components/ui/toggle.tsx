"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/toggle.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Toggle as TogglePrimitive } from "radix-ui"

// Patched (07-starter.md, toggle): the system's type, pressable shape and washes, pressed in
// selected-strong with a selected-line edge, the control heights with touch sizes, and a disabled state
// that keeps pointer events, so a tooltip can still say why. Focus is the base styles' outline.
const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1.5 rounded-control type-label whitespace-nowrap text-text-strong transition-colors select-none hover:bg-hover active:bg-pressed disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-line aria-pressed:bg-selected-strong [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-line-control bg-surface aria-pressed:border-selected-line",
      },
      size: {
        default:
          "h-9 min-w-9 px-3 pointer-coarse:h-11 pointer-coarse:min-w-11 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-8 min-w-8 px-2.5 pointer-coarse:h-10 pointer-coarse:min-w-10 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-11 min-w-11 px-3.5 pointer-coarse:h-12 pointer-coarse:min-w-12 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef(function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>, ref: React.ForwardedRef<any>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
      ref={ref}
    />
  )
})

export { Toggle, toggleVariants }
