"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/radio-group.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

const RadioGroup = React.forwardRef(function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>, ref: React.ForwardedRef<any>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-3", className)}
      {...props}
      ref={ref}
    />
  )
})

const RadioGroupItem = React.forwardRef(function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>, ref: React.ForwardedRef<any>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      // Patched (07-starter.md, checkbox and radio): an 18px circle bordered in line-control, so the off state
      // is visible, a 24px hit area that grows to 44px on touch, and a danger edge when invalid. Focus is the
      // base outline. The chosen dot is a border in forced colours, where a background would vanish.
      className={cn(
        "group/radio-group-item peer relative flex size-4.5 shrink-0 items-center justify-center rounded-full border border-line-control bg-surface transition-colors after:absolute after:-inset-[3px] after:rounded-full pointer-coarse:after:-inset-[13px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        className
      )}
      {...props}
      ref={ref}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <span className="size-2 rounded-full bg-on-primary forced-colors:border-4 forced-colors:border-solid" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})

export { RadioGroup, RadioGroupItem }
