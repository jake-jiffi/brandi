"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/popover.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Popover as PopoverPrimitive } from "radix-ui"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

const PopoverTrigger = React.forwardRef(function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>, ref: React.ForwardedRef<any>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props}
      ref={ref} />
})

// Patched (07-starter.md, popover): two looks at the popover layer, kept 8px clear of the screen's edge.
// `panel` is the raised surface with a hairline and shadow, for a quick filter or a short edit. `tip` is
// the toggletip's small inverse bubble, with an arrow. The looks are shared with a design's still picture
// of an open popover, which mounts no layer of its own.
const popoverContentVariants = cva("z-(--z-popover) max-w-[calc(100vw-16px)]", {
  variants: {
    look: {
      panel: "flex w-72 flex-col gap-3 rounded-md border border-line bg-surface-raised p-4 type-body text-text shadow-lg",
      tip: "w-max max-w-60 rounded-xs border border-transparent bg-surface-inverse px-2.5 py-1.5 type-meta text-pretty text-text-inverse shadow-md",
    },
  },
  defaultVariants: { look: "panel" },
})

// It fades in (slides and zooms drop out under reduced motion through the base styles) and goes at once:
// a popover still fading out keeps its dismiss layer, which would swallow the next Escape meant for the
// layer under it.
const PopoverContent = React.forwardRef(function PopoverContent({
  className,
  align = "center",
  sideOffset = 6,
  collisionPadding = 8,
  look = "panel",
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & VariantProps<typeof popoverContentVariants>, ref: React.ForwardedRef<any>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        data-look={look}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          popoverContentVariants({ look }),
          "origin-(--radix-popover-content-transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
        {look === "tip" ? <PopoverPrimitive.Arrow width={10} height={5} className="fill-surface-inverse" /> : null}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})

const PopoverAnchor = React.forwardRef(function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>, ref: React.ForwardedRef<any>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props}
      ref={ref} />
})

const PopoverHeader = React.forwardRef(function PopoverHeader({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
      ref={ref}
    />
  )
})

const PopoverTitle = React.forwardRef(function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">, ref: React.ForwardedRef<any>) {
  return (
    // Patched (07-starter.md, popover): the title in the system's small heading style.
    <div
      data-slot="popover-title"
      className={cn("type-heading-sm text-text-strong", className)}
      {...props}
      ref={ref}
    />
  )
})

const PopoverDescription = React.forwardRef(function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">, ref: React.ForwardedRef<any>) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
      ref={ref}
    />
  )
})

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  popoverContentVariants,
}
