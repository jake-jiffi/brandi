"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/checkbox.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { CheckIcon, MinusIcon } from "lucide-react"

const Checkbox = React.forwardRef(function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>, ref: React.ForwardedRef<any>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      // Patched (07-starter.md, checkbox): an 18px box bordered in line-control (3:1, so the off state is
      // visible), a 24px hit area that grows to 44px on touch, a dash for some selected, a danger edge when
      // invalid. Focus is the base outline. The check is drawn in currentColor, so forced colours keep it.
      className={cn(
        "peer group/checkbox relative flex size-4.5 shrink-0 items-center justify-center rounded-xs border border-line-control bg-surface text-on-primary transition-colors after:absolute after:-inset-[3px] pointer-coarse:after:-inset-[13px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        className
      )}
      {...props}
      ref={ref}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current [&>svg]:size-3.5"
      >
        <CheckIcon aria-hidden="true" strokeWidth={3} className="group-data-[state=indeterminate]/checkbox:hidden" />
        <MinusIcon aria-hidden="true" strokeWidth={3} className="hidden group-data-[state=indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

export { Checkbox }
