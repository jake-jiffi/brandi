"use client"

// Vendored from the shadcn/ui registry (https://ui.shadcn.com/r/styles/radix-vega/dialog.json), MIT licence:
// see LICENSE-shadcn.md. Changed by brandi/product/tools/vendor-shadcn.mjs, then patched by hand per
// 07-starter.md. Edit here, never in a product.

import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

const DialogTrigger = React.forwardRef(function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>, ref: React.ForwardedRef<any>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props}
      ref={ref} />
})

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

const DialogClose = React.forwardRef(function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>, ref: React.ForwardedRef<any>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props}
      ref={ref} />
})

// Patched (07-starter.md, dialog): the scrim token, without the stock blur that review took out. The
// dialog and its scrim fade in and close at once: Radix keeps a layer live while an exit animation
// plays, so an Escape pressed during the fade would be swallowed instead of reaching the layer beneath.
const DialogOverlay = React.forwardRef(function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>, ref: React.ForwardedRef<any>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-(--z-dialog) bg-scrim animation-duration-(--duration-slow) data-open:animate-in data-open:fade-in-0",
        className
      )}
      {...props}
      ref={ref}
    />
  )
})

// Patched (07-starter.md, dialog): the system's material (raised surface, radius-lg, shadow-xl), shared
// with a dialog drawn in place on a canvas.
const dialogPanelClass =
  "relative flex w-full max-w-[520px] flex-col rounded-lg bg-surface-raised p-6 text-text shadow-xl @max-[639px]:data-[placement=center]:max-w-none @max-[639px]:data-[placement=center]:rounded-b-none @max-[639px]:data-[placement=center]:pb-[calc(var(--space-6)+env(safe-area-inset-bottom))]"

// Patched (07-starter.md, dialog): the content sits inside the scrim, and the scrim is a container the
// size of the screen, so the dialog measures the screen without a viewport query. Centred on a wide
// screen; under 640px it rises from the bottom, full width, clear of the safe area. placement="top"
// keeps it near the top on every screen, for the command menu, because a phone keyboard takes the
// bottom half. overlayProps lets the scrim, and the dialog inside it, carry the theme of the place it
// opened from.
const DialogContent = React.forwardRef(function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = "Close",
  placement = "center",
  overlayProps,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  closeLabel?: string
  placement?: "center" | "top"
  overlayProps?: React.ComponentProps<typeof DialogPrimitive.Overlay> & Record<`data-${string}`, string | undefined>
}, ref: React.ForwardedRef<any>) {
  return (
    <DialogPortal>
      <DialogOverlay {...overlayProps} className={cn("overflow-y-auto @container", overlayProps?.className)}>
        <div
          data-slot="dialog-frame"
          data-placement={placement}
          className="grid min-h-full justify-items-center p-6 data-[placement=center]:items-center data-[placement=top]:items-start data-[placement=top]:pt-[12vh] @max-[639px]:data-[placement=center]:items-end @max-[639px]:data-[placement=center]:p-0 @max-[639px]:data-[placement=top]:p-2"
        >
          <DialogPrimitive.Content
            data-slot="dialog-content"
            data-placement={placement}
            className={cn(
              dialogPanelClass,
              "animation-duration-(--duration-slow) ease-standard data-open:animate-in data-open:fade-in-0 motion-safe:data-open:zoom-in-95 @max-[639px]:data-[placement=center]:motion-safe:data-open:zoom-in-100 @max-[639px]:data-[placement=center]:motion-safe:data-open:slide-in-from-bottom-10",
              className
            )}
            {...props}
            ref={ref}
          >
            {children}
            {showCloseButton && (
              <DialogPrimitive.Close data-slot="dialog-close" asChild>
                <Button variant="ghost" size="icon-sm" aria-label={closeLabel} className={dialogCloseClass}>
                  <XIcon />
                </Button>
              </DialogPrimitive.Close>
            )}
          </DialogPrimitive.Content>
        </div>
      </DialogOverlay>
    </DialogPortal>
  )
})

// Patched (07-starter.md, dialog): centred on the title's first line (28px) inside 24px of padding, with
// the X lined up on the content's right edge. 32px, 40px on touch.
const dialogCloseClass = "absolute top-6 right-4 -mt-0.5 text-text-muted hover:text-text-strong pointer-coarse:top-5 pointer-coarse:right-3"

const DialogHeader = React.forwardRef(function DialogHeader({ className, ...props }: React.ComponentProps<"div">, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="dialog-header"
      // Patched (07-starter.md, dialog): 6px between the title and its description, as in the sheet.
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
      ref={ref}
    />
  )
})

const DialogFooter = React.forwardRef(function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}, ref: React.ForwardedRef<any>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // Patched (07-starter.md, dialog): secondary then primary on the right; under 640px the buttons
        // stack full width in reading order, never reversed.
        "flex flex-wrap items-center justify-end gap-2 @max-[639px]:flex-col @max-[639px]:items-stretch",
        className
      )}
      {...props}
      ref={ref}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
})

// Patched (07-starter.md, dialog): the system's type, balanced and without stragglers, shared with a dialog drawn in place on a canvas.
const dialogTitleClass = "type-heading-lg text-balance text-text-strong"
const dialogDescriptionClass = "type-body text-pretty text-text-muted"

const DialogTitle = React.forwardRef(function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>, ref: React.ForwardedRef<any>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(dialogTitleClass, className)}
      {...props}
      ref={ref}
    />
  )
})

const DialogDescription = React.forwardRef(function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>, ref: React.ForwardedRef<any>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(dialogDescriptionClass, className)}
      {...props}
      ref={ref}
    />
  )
})

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  // Patched (07-starter.md, dialog): the classes a dialog drawn in place on a canvas shares.
  dialogCloseClass,
  dialogDescriptionClass,
  dialogPanelClass,
  dialogTitleClass,
}
