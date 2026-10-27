"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/sheet.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog as SheetPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

const SheetTrigger = React.forwardRef(function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>, ref: React.ForwardedRef<any>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props}
      ref={ref} />
})

const SheetClose = React.forwardRef(function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>, ref: React.ForwardedRef<any>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props}
      ref={ref} />
})

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

// Patched (07-starter.md, sheet): the scrim token, without the stock blur that review took out. The
// sheet and its scrim come in with motion and close at once: Radix keeps a layer live while an exit
// animation plays, so an Escape pressed during it would be swallowed instead of reaching the layer beneath.
const SheetOverlay = React.forwardRef(function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>, ref: React.ForwardedRef<any>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-(--z-sheet) bg-scrim animation-duration-(--duration-slow) data-open:animate-in data-open:fade-in-0",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, sheet): the system's material (raised surface, radius-lg, shadow-xl), shared
// with a sheet drawn in place on a canvas.
const sheetPanelClass = "flex w-full max-w-[440px] flex-col rounded-lg bg-surface-raised text-text shadow-xl"

// Patched (07-starter.md, sheet): inset 8px from the screen's edges like the rail, never wider than the
// screen less that inset, sliding in only under motion-safe. overlayProps lets the scrim carry the
// theme of the place the sheet opened from.
const SheetContent = React.forwardRef(function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  closeLabel = "Close",
  overlayProps,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  closeLabel?: string
  overlayProps?: React.ComponentProps<typeof SheetPrimitive.Overlay> & Record<`data-${string}`, string | undefined>
}, ref: React.ForwardedRef<any>) {
  return (
    <SheetPortal>
      <SheetOverlay {...overlayProps} />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          sheetPanelClass,
          "fixed z-(--z-sheet) animation-duration-(--duration-slow) ease-standard data-[side=bottom]:inset-x-2 data-[side=bottom]:bottom-2 data-[side=bottom]:max-w-none data-[side=left]:inset-y-2 data-[side=left]:left-2 data-[side=left]:w-[calc(100%-1rem)] data-[side=right]:inset-y-2 data-[side=right]:right-2 data-[side=right]:w-[calc(100%-1rem)] data-[side=top]:inset-x-2 data-[side=top]:top-2 data-[side=top]:max-w-none data-open:animate-in data-open:fade-in-0 data-[side=bottom]:motion-safe:data-open:slide-in-from-bottom-10 data-[side=left]:motion-safe:data-open:slide-in-from-left-10 data-[side=right]:motion-safe:data-open:slide-in-from-right-10 data-[side=top]:motion-safe:data-open:slide-in-from-top-10",
          className
        )}
        {...props}
      ref={ref}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button variant="ghost" size="icon-sm" aria-label={closeLabel} className={sheetCloseClass}>
              <XIcon />
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
})

// Patched (07-starter.md, sheet): centred on the title's first line (28px) inside 24px of padding, with
// the X lined up on the content's right edge. 32px, 40px on touch.
const sheetCloseClass = "absolute top-6 right-4 -mt-0.5 text-text-muted hover:text-text-strong pointer-coarse:top-5 pointer-coarse:right-3"

const SheetHeader = React.forwardRef(function SheetHeader({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="sheet-header"
      // Patched (07-starter.md, sheet): the system's padding, with room for the close button.
      className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-4", className)}
      {...props}
      ref={ref}
    />
  )
})

const SheetFooter = React.forwardRef(function SheetFooter({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="sheet-footer"
      // Patched (07-starter.md, sheet): secondary then primary on the right, above a hairline.
      className={cn("mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4", className)}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, sheet): the system's type, balanced and without stragglers, shared with a sheet drawn in place on a canvas.
const sheetTitleClass = "type-heading-lg text-balance text-text-strong"
const sheetDescriptionClass = "type-body text-pretty text-text-muted"

const SheetTitle = React.forwardRef(function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>, ref: React.ForwardedRef<any>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(sheetTitleClass, className)}
      {...props}
      ref={ref}
    />
  )
})

const SheetDescription = React.forwardRef(function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>, ref: React.ForwardedRef<any>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(sheetDescriptionClass, className)}
      {...props}
      ref={ref}
    />
  )
})

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  // Patched (07-starter.md, sheet): the classes a sheet drawn in place on a canvas shares.
  sheetCloseClass,
  sheetDescriptionClass,
  sheetPanelClass,
  sheetTitleClass,
}
