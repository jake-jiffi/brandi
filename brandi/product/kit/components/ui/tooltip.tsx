"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/tooltip.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip as TooltipPrimitive } from "radix-ui"

// Patched (07-starter.md, tooltip): a tooltip outside any provider brings its own, so a page that forgot
// the provider gets a working tooltip instead of an error.
const HasTooltipProvider = React.createContext(false)

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasTooltipProvider.Provider value>
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delayDuration={delayDuration}
        {...props}
      />
    </HasTooltipProvider.Provider>
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />
  return React.useContext(HasTooltipProvider) ? root : <TooltipProvider delayDuration={300}>{root}</TooltipProvider>
}

const TooltipTrigger = React.forwardRef(function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>, ref: React.ForwardedRef<any>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props}
      ref={ref} />
})

// Patched (07-starter.md, tooltip): on surface-inverse, small and medium weight, above every other layer,
// kept 8px clear of the screen's edge, and outlined in forced colours (a transparent edge they paint).
// The look is shared with a design's still picture of an open tooltip, which mounts no layer of its own.
const tooltipBubble =
  "z-(--z-tooltip) inline-flex w-max max-w-64 items-center gap-1.5 rounded-xs border border-transparent bg-surface-inverse px-2 py-1 type-caption text-pretty text-text-inverse shadow-sm has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm"
const tooltipArrow = "z-50 size-2.5 rotate-45 rounded-[2px] bg-surface-inverse fill-surface-inverse"

// It fades in (slides and zooms drop out under reduced motion through the base styles) and goes at once:
// a tooltip still fading out keeps its dismiss layer, which would swallow the next Escape (05-components.md,
// Tooltip, round 3).
const TooltipContent = React.forwardRef(function TooltipContent({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>, ref: React.ForwardedRef<any>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          tooltipBubble,
          "origin-(--radix-tooltip-content-transform-origin) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
        <TooltipPrimitive.Arrow className={cn(tooltipArrow, "translate-y-[calc(-50%_-_2px)]")} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, tooltipArrow, tooltipBubble }
