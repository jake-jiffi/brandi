"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/collapsible.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

const Collapsible = React.forwardRef(function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>, ref: React.ForwardedRef<any>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props}
      ref={ref} />
})

const CollapsibleTrigger = React.forwardRef(function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>, ref: React.ForwardedRef<any>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
      ref={ref}
    />
  )
})

const CollapsibleContent = React.forwardRef(function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>, ref: React.ForwardedRef<any>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
      ref={ref}
    />
  )
})

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
