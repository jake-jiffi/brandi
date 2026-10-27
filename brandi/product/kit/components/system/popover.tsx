"use client"

import * as React from "react"

import { Popover as PopoverRoot, PopoverContent, PopoverTitle, PopoverTrigger, popoverContentVariants } from "@/components/ui/popover"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Button } from "./button"

export type PopoverPlacement = "bottom" | "top" | "right" | "left"

export interface PopoverProps {
  /** The trigger's words, and the panel's name when it has no title. */
  label: string
  /** An icon before the trigger's words. */
  icon?: IconName
  /** The trigger's look. */
  variant?: "secondary" | "ghost"
  /** A title at the top of the panel, which also names it. */
  title?: string
  /** The panel: a definition, a quick filter, a short edit. A function gets `close`, for a Save that closes it. */
  children?: React.ReactNode | ((close: () => void) => React.ReactNode)
  /** Where it opens. It flips to stay on screen. */
  placement?: PopoverPlacement
  align?: "start" | "center" | "end"
  /** Shows it open, in place, for a design on a board. */
  open?: boolean
  /** A control of your own to open it, in place of the Button. It must take a ref. Built in script on a board. */
  trigger?: React.ReactElement
  onOpenChange?: (open: boolean) => void
  /** Classes for the panel. */
  className?: string
}

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex], [contenteditable="true"]'

// Where a still picture of the open panel sits against its trigger, for a design on a board.
const PANEL_PICTURE: Record<PopoverPlacement, Record<"start" | "center" | "end", string>> = {
  bottom: { start: "absolute top-full left-0 mt-1.5", center: "absolute top-full left-1/2 mt-1.5 -translate-x-1/2", end: "absolute top-full right-0 mt-1.5" },
  top: { start: "absolute bottom-full left-0 mb-1.5", center: "absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2", end: "absolute bottom-full right-0 mb-1.5" },
  right: { start: "absolute top-0 left-full ml-1.5", center: "absolute top-1/2 left-full ml-1.5 -translate-y-1/2", end: "absolute bottom-0 left-full ml-1.5" },
  left: { start: "absolute top-0 right-full mr-1.5", center: "absolute top-1/2 right-full mr-1.5 -translate-y-1/2", end: "absolute right-full bottom-0 mr-1.5" },
}

/** The page's tab stops in order, the way the browser walks them: a radio group is one stop. */
function tabbables(root: HTMLElement) {
  const stops = Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.hasAttribute("data-radix-focus-guard") &&
      !el.closest("[inert], [hidden]") &&
      el.getClientRects().length > 0
  )
  return stops.filter((el) => {
    if (!(el instanceof HTMLInputElement) || el.type !== "radio" || !el.name) return true
    const group = stops.filter((o): o is HTMLInputElement => o instanceof HTMLInputElement && o.type === "radio" && o.name === el.name)
    return el === (group.find((o) => o.checked) ?? group[0])
  })
}

/**
 * A non-modal panel anchored to a control. It traps nothing: in the tab order it sits right after its
 * trigger, though it opens in a portal. Escape closes it and focus goes back to the trigger.
 */
export const Popover = React.forwardRef<HTMLButtonElement, PopoverProps>(function Popover(
  { label, icon, variant = "secondary", title, children, placement = "bottom", align = "start", open, trigger, onOpenChange, className },
  ref
) {
  const [shown, setShown] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const mergedTrigger = useMergedRef(ref, triggerRef)
  const panel = React.useRef<HTMLDivElement | null>(null)
  const titleId = React.useId()
  const design = open !== undefined
  const isOpen = open ?? shown

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (design) return
      setShown(next)
      onOpenChange?.(next)
    },
    [design, onOpenChange]
  )
  const close = React.useCallback(() => setOpen(false), [setOpen])
  const body = (
    <>
      {title ? <PopoverTitle id={titleId}>{title}</PopoverTitle> : null}
      {typeof children === "function" ? children(close) : children}
    </>
  )
  const button = trigger ?? (
    <Button variant={variant} icon={icon} iconRight="ChevronDown">
      {label}
    </Button>
  )

  // Design mode draws a still picture: the trigger, and the open panel under it, with nothing listening,
  // so a board never loses a key, a press or a tab stop to it.
  if (design) {
    return (
      <span data-slot="popover" className="relative inline-flex align-top">
        {React.cloneElement(button, {
          ref: mergedTrigger,
          "aria-haspopup": "dialog",
          "aria-expanded": isOpen,
          "data-state": isOpen ? "open" : "closed",
        } as React.Attributes & Record<string, unknown>)}
        {isOpen ? (
          <div
            role="dialog"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : label}
            data-slot="popover-content"
            data-side={placement}
            className={cn(popoverContentVariants({ look: "panel" }), (PANEL_PICTURE[placement] ?? PANEL_PICTURE.bottom)[align] ?? PANEL_PICTURE.bottom.start, className)}
          >
            {body}
          </div>
        ) : null}
      </span>
    )
  }

  return (
    <PopoverRoot open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        ref={mergedTrigger}
        onKeyDown={(event: React.KeyboardEvent) => {
          // Tab from an open trigger goes into the panel, as if the panel came next in the page.
          if (event.key !== "Tab" || event.shiftKey || !isOpen || !panel.current) return
          const first = tabbables(panel.current)[0]
          if (first) {
            event.preventDefault()
            first.focus()
          }
        }}
      >
        {button}
      </PopoverTrigger>
      <PopoverContent
        ref={panel}
        side={placement}
        align={align}
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        // Focus goes back to the trigger before the panel goes, so it never rests on the page body, even
        // for the moment Radix would take to return it.
        onEscapeKeyDown={() => triggerRef.current?.focus()}
        onKeyDown={(event) => {
          if (event.key !== "Tab" || !panel.current || !triggerRef.current) return
          const inside = tabbables(panel.current)
          const active = document.activeElement
          if (event.shiftKey) {
            // Shift Tab from the start of the panel goes back to the trigger, which keeps it open.
            if (!inside.length || active === inside[0] || active === panel.current) {
              event.preventDefault()
              triggerRef.current.focus()
            }
            return
          }
          if (inside.length && active !== inside[inside.length - 1]) return
          // Tab from the end of the panel goes on to whatever follows the trigger, and the panel closes.
          const page = tabbables(document.body).filter((el) => !panel.current?.contains(el))
          const at = page.indexOf(triggerRef.current)
          const next = at >= 0 ? page[at + 1] : undefined
          if (next) {
            event.preventDefault()
            next.focus()
          }
        }}
        className={className}
      >
        {body}
      </PopoverContent>
    </PopoverRoot>
  )
})
