"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/switch.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "radix-ui"

const Switch = React.forwardRef(function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}, ref: React.ForwardedRef<any>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      // Patched (07-starter.md, switch): the off track in line-control, so it stays visible (3:1), the on track
      // in primary, the pressable shape, a 24px hit area that grows to 44px on touch. Focus is the base outline.
      // The thumb slides only where motion is welcome. Forced colours: globals.css.
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-control border border-transparent p-px transition-colors after:absolute after:-inset-x-0.5 after:-inset-y-0.5 pointer-coarse:after:-inset-x-1 pointer-coarse:after:-inset-y-3 data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-line-control disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-control bg-on-primary shadow-xs motion-safe:transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 group-data-[size=sm]/switch:data-[state=checked]:translate-x-3"
      />
    </SwitchPrimitive.Root>
  )
})

export { Switch }
