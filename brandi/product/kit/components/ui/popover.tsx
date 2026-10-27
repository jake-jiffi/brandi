"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/popover.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
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

const PopoverContent = React.forwardRef(function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>, ref: React.ForwardedRef<any>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-4 rounded-md bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      ref={ref}
      />
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
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
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
}
