"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import {
  Sheet as SheetRoot,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  sheetCloseClass,
  sheetDescriptionClass,
  sheetPanelClass,
  sheetTitleClass,
} from "@/components/ui/sheet"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { useOverlayOpener, type OverlayHeadingLevel } from "./dialog"
import { Icon } from "./icon"

export interface SheetProps {
  /** Shows it. The page owns the state and closes it in `onClose`. */
  open?: boolean
  /** Draws it in place, with no scrim, portal or focus trap, for a design on a canvas. */
  inline?: boolean
  /** The record's name, or what the edit is. */
  title: React.ReactNode
  description?: React.ReactNode
  /** The buttons, secondary then primary, under a hairline at the foot. */
  footer?: React.ReactNode
  /** Escape, the close button and a click on the scrim call it. */
  onClose?: () => void
  /** Its widest, in pixels. Never wider than the screen less 8px each side. */
  width?: number
  headingLevel?: OverlayHeadingLevel
  /** Where focus goes on close when nothing had focus as it opened. */
  returnFocus?: React.RefObject<HTMLElement | null>
  children?: React.ReactNode
  className?: string
}

/** A panel from the right, inset like the rail, for a record or a longer edit without leaving the list. */
export const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(function Sheet(
  { open = false, inline = false, title, description, footer, onClose, width = 440, headingLevel = 2, returnFocus, children, className },
  ref
) {
  const { restoreFocus, themeProps, contentRef } = useOverlayOpener(open && !inline, returnFocus)
  const overlayRef = useMergedRef<HTMLElement>(ref as React.Ref<HTMLElement>, contentRef)
  const ids = React.useId()
  const titleRef = React.useRef<HTMLHeadingElement | null>(null)
  const Heading = `h${headingLevel}` as const

  // The body scrolls between a fixed header and footer, so the actions never leave the screen.
  const rest = (
    <>
      <div data-slot="sheet-body" className="min-h-0 flex-1 overflow-y-auto px-6 pt-1 pb-6 type-body text-text">
        {children}
      </div>
      {footer ? <SheetFooter>{footer}</SheetFooter> : null}
    </>
  )

  if (inline) {
    return (
      <div
        ref={ref}
        role="dialog"
        aria-labelledby={`${ids}-title`}
        aria-describedby={description ? `${ids}-description` : undefined}
        data-slot="sheet-content"
        data-side="right"
        data-inline=""
        className={cn(sheetPanelClass, "relative h-full", className)}
        style={{ maxWidth: width }}
      >
        <SheetHeader className="pr-14">
          <Heading id={`${ids}-title`} data-slot="sheet-title" className={sheetTitleClass}>
            {title}
          </Heading>
          {description ? (
            <p id={`${ids}-description`} data-slot="sheet-description" className={sheetDescriptionClass}>
              {description}
            </p>
          ) : null}
        </SheetHeader>
        {rest}
        <ButtonBase variant="ghost" size="icon-sm" aria-label="Close" className={sheetCloseClass} onClick={onClose}>
          <Icon name="X" />
        </ButtonBase>
      </div>
    )
  }

  return (
    <SheetRoot open={open} onOpenChange={(next) => (next ? undefined : onClose?.())}>
      <SheetContent
        ref={overlayRef}
        side="right"
        className={cn(themeProps.className, className)}
        data-theme={themeProps["data-theme"]}
        style={{ maxWidth: width }}
        overlayProps={themeProps}
        onCloseAutoFocus={restoreFocus}
        // Focus lands on the title, not the first button: a record's footer often starts with a
        // destructive action, and a screen reader hears the record's name first. Tab then moves on.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          titleRef.current?.focus()
        }}
      >
        <SheetHeader className="pr-14">
          <SheetTitle asChild>
            <Heading ref={titleRef} tabIndex={-1} className="rounded-xs">
              {title}
            </Heading>
          </SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        {rest}
      </SheetContent>
    </SheetRoot>
  )
})
