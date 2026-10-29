"use client"

import * as React from "react"

import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Button, type ButtonVariant } from "./button"
import { Spacer } from "./spacer"

export interface ToolbarBulkAction {
  /** One to three words, verb first: "Send reminders". */
  label: string
  icon?: IconName
  variant?: Extract<ButtonVariant, "secondary" | "primary" | "danger">
  disabled?: boolean
  onSelect?: () => void
}

export interface ToolbarProps extends Omit<React.ComponentPropsWithoutRef<"div">, "role"> {
  /** Names the group for screen readers ("[Record] filters"). */
  label: string
  /** How many rows are selected. Above zero, the filters give way to the bulk actions. */
  selectedCount?: number
  /** The actions for the selected rows, as data, so a board can pass them. They act only on rows on screen. */
  bulkActions?: ToolbarBulkAction[]
  /** Clears the selection. Focus then goes back to the filters, never to the page body. */
  onClearSelection?: () => void
  /** Sticks to the top of the scrolling area while the table scrolls. On by default. */
  sticky?: boolean
  /** Search first, then filter chips, a Spacer, then the view switcher and secondary actions. */
  children?: React.ReactNode
  /**
   * With no filters, what the row says while nothing is selected: the count of what it acts on ("12 issues"), in
   * the quiet text style. DataTable gives its own.
   */
  summary?: React.ReactNode
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** The first control after an element in the page's order, outside it and on screen, or null. */
function nextControl(el: HTMLElement): HTMLElement | null {
  for (const c of document.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (!el.contains(c) && el.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING && c.getClientRects().length) return c
  }
  return null
}

/** The nearest ancestor that scrolls up and down, or the page. */
function scrollParent(el: HTMLElement): HTMLElement {
  for (let at = el.parentElement; at; at = at.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(at).overflowY)) return at
  }
  return document.scrollingElement as HTMLElement
}

/** One row of search, filters and view controls above a table or list, wrapping when the space runs out. */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { label, selectedCount = 0, bulkActions = [], onClearSelection, sticky = true, className, children, summary, ...rest },
  ref
) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const filters = React.useRef<HTMLDivElement | null>(null)
  const selecting = selectedCount > 0
  // The row keeps its height whatever it holds, so selecting never moves the table. With no filters it holds the
  // summary: an empty row read as a blank band above the table (a proof run's rounds 1 to 3).
  const hasFilters = React.Children.toArray(children).some((c) => typeof c !== "string" || c.trim() !== "")
  // Set when a button in the selection row is pressed: if that press ends the selection, the button goes
  // with it, and focus has to land somewhere useful.
  const pressedInSelection = React.useRef(false)

  React.useEffect(() => {
    if (selecting) return
    const lost = !document.activeElement || document.activeElement === document.body
    if (pressedInSelection.current && lost) {
      // The first filter; with no control in the row to return to, the first control after the toolbar (the table's
      // select-all checkbox), never the toolbar itself, which has nothing to press.
      const first = filters.current?.querySelector<HTMLElement>(FOCUSABLE) ?? (own.current ? nextControl(own.current) : null)
      if (first) first.focus()
      else if (own.current) {
        own.current.tabIndex = -1
        own.current.focus()
      }
    }
    pressedInSelection.current = false
  }, [selecting])

  // While it sticks, what scrolls under it keeps clear of it: the scroller's scroll-padding-top reaches the
  // toolbar's foot (its height, below the scroller's own top padding, where a sticky box rests), so a control Tab
  // or Shift+Tab brings into view never comes to rest beneath it (WCAG 2.4.11). On a short screen it stops sticking
  // (the class below), because it would take most of it: at 200% zoom on a laptop it and the top bar took 225 of
  // 400px.
  React.useEffect(() => {
    const el = own.current
    if (!sticky || !el) return
    const scroller = scrollParent(el)
    const apply = () => {
      const stuck = getComputedStyle(el).position === "sticky"
      scroller.style.scrollPaddingTop = stuck ? `${el.offsetHeight + parseFloat(getComputedStyle(scroller).paddingTop)}px` : ""
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    // A window that grows or shrinks past the short-screen line flips the position without resizing the toolbar.
    window.addEventListener("resize", apply)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", apply)
      scroller.style.scrollPaddingTop = ""
    }
  }, [sticky])

  const press = (fn?: () => void) => () => {
    pressedInSelection.current = true
    fn?.()
  }

  return (
    <div
      ref={merged}
      role="group"
      aria-label={label}
      data-slot="toolbar"
      data-selecting={selecting ? "" : undefined}
      className={cn("py-3", sticky && "sticky top-0 z-(--z-sticky) bg-canvas [@media(max-height:560px)]:static", className)}
      {...rest}
    >
      {/* The filters stay mounted while rows are selected, so nothing typed into them is lost. */}
      <div ref={filters} data-slot="toolbar-row" hidden={selecting} className="flex min-h-9 flex-wrap items-center gap-2 pointer-coarse:min-h-11">
        {hasFilters ? (
          children
        ) : summary != null && summary !== false && summary !== "" ? (
          // Where the selected count will stand, so the one gives way to the other in place.
          <span data-slot="toolbar-summary" className="px-1 type-meta text-text-muted tabular-nums">
            {summary}
          </span>
        ) : null}
      </div>
      {selecting ? (
        <div data-slot="toolbar-selection" className="flex min-h-9 flex-wrap items-center gap-2 pointer-coarse:min-h-11">
          <span data-slot="toolbar-count" className="px-1 type-label text-text-strong tabular-nums">
            {formatNumber(selectedCount)} selected
          </span>
          {bulkActions.map((action) => (
            <Button key={action.label} variant={action.variant ?? "secondary"} size="sm" icon={action.icon} disabled={action.disabled} onClick={press(action.onSelect)}>
              {action.label}
            </Button>
          ))}
          <Spacer />
          <Button variant="ghost" size="sm" icon="X" onClick={press(onClearSelection)}>
            Clear selection
          </Button>
        </div>
      ) : null}
      {/* Polite, and only on change: it says how many are selected as the count moves. */}
      <p data-slot="toolbar-status" aria-live="polite" aria-atomic="true" className="sr-only">
        {selecting ? `${formatNumber(selectedCount)} selected` : ""}
      </p>
    </div>
  )
})
