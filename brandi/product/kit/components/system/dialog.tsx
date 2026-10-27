"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import {
  Dialog as DialogRoot,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogCloseClass,
  dialogDescriptionClass,
  dialogPanelClass,
  dialogTitleClass,
} from "@/components/ui/dialog"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export type DialogWidth = 400 | 520 | 720
export type OverlayHeadingLevel = 2 | 3 | 4

const WIDTH: Record<DialogWidth, string> = { 400: "max-w-[400px]", 520: "max-w-[520px]", 720: "max-w-[720px]" }

/** "light" or "dark", from the nearest element that sets a theme, by data-theme (Root) or by class (next-themes). */
function themeOf(el: Element | null | undefined): "light" | "dark" | undefined {
  const scope = el?.closest("[data-theme], .dark, .light")
  if (!scope) return undefined
  const named = scope.getAttribute("data-theme")
  if (named === "dark" || named === "light") return named
  return scope.classList.contains("dark") ? "dark" : "light"
}

/**
 * The theme a portal has to carry: the theme of the place it opened from, only where that differs from
 * the page's own. Otherwise the portal inherits from the document root and keeps following it, so
 * switching the theme from inside an open dialog switches the dialog as well. Shared by Menu.
 */
export function portalTheme(from: Element | null | undefined) {
  const own = themeOf(from)
  return own && own !== (themeOf(document.documentElement) ?? "light") ? own : undefined
}

// Each open overlay's opener, so an overlay opened as another closes can inherit it.
const openers = new WeakMap<Element, HTMLElement>()

/**
 * What opened an overlay. A menu's action goes with its menu, so an overlay opened from one (a
 * destructive action's confirmation) counts the menu's trigger as its opener. An overlay opened from
 * one that is closing at the same moment (a palette's command, a dialog's next step) takes that one's
 * opener, because what had focus is about to go with it.
 */
function openerOf(active: Element | null) {
  if (!(active instanceof HTMLElement) || active === document.body) return null
  const labelledBy = active.closest('[role="menu"]')?.getAttribute("aria-labelledby")
  const trigger = labelledBy ? document.getElementById(labelledBy) : null
  if (trigger) return trigger
  const closing = active.closest('[data-state="closed"]')
  return (closing && openers.get(closing)) || active
}

/**
 * What had focus when an overlay opened, and the theme of the place it opened from, both read in a
 * layout effect, before Radix moves focus in. On close, focus goes straight back to the opener, or to
 * `returnFocus` when nothing had focus (a palette opened by shortcut), unless something else has taken
 * focus by then (a route change, the next dialog). Attach `contentRef` to the overlay. Shared by Sheet
 * and CommandMenu.
 */
export function useOverlayOpener(open: boolean, returnFocus?: React.RefObject<HTMLElement | null>) {
  const opener = React.useRef<HTMLElement | null>(null)
  const content = React.useRef<HTMLElement | null>(null)
  // A callback, because Radix's portal mounts the overlay a commit after it opens: by the time the
  // overlay attaches, its opener is known and can be recorded against it.
  const contentRef = React.useCallback((node: HTMLElement | null) => {
    content.current = node
    if (node && opener.current) openers.set(node, opener.current)
  }, [])
  const wasOpen = React.useRef(false)
  const closing = React.useRef(false)
  const [theme, setTheme] = React.useState<"light" | "dark" | undefined>()
  React.useLayoutEffect(() => {
    // Only on the way from closed to open: Strict Mode runs effects twice, and by the second run focus
    // is already inside the overlay, which would make the overlay its own opener.
    if (open && !wasOpen.current) {
      opener.current = openerOf(document.activeElement)
      setTheme(portalTheme(opener.current ?? returnFocus?.current))
    }
    closing.current = !open && wasOpen.current
    wasOpen.current = open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const giveBack = React.useCallback(() => {
    const now = document.activeElement
    if (now && now !== document.body && !content.current?.contains(now)) return
    const target = opener.current?.isConnected ? opener.current : returnFocus?.current
    target?.focus()
  }, [returnFocus])
  // On close, focus goes back at once, not on Radix's timer, which leaves it on the page body for a
  // moment. A passive effect runs after Radix has let go of its focus trap, so the move holds.
  React.useEffect(() => {
    if (!closing.current) return
    closing.current = false
    giveBack()
  }, [open, giveBack])
  // Radix's own return comes after; by then focus is back, so it only covers an overlay that unmounts
  // with its page.
  const restoreFocus = React.useCallback(
    (event: Event) => {
      event.preventDefault()
      giveBack()
    },
    [giveBack]
  )
  const themeProps: { "data-theme"?: "light" | "dark"; className?: string } = theme
    ? { "data-theme": theme, className: theme === "dark" ? "dark" : undefined }
    : {}
  return { restoreFocus, themeProps, contentRef }
}

export interface DialogProps {
  /** Shows it. The page owns the state and closes it in `onClose`. */
  open?: boolean
  /** Draws it in place, with no scrim, portal or focus trap, for a design on a canvas. */
  inline?: boolean
  /** A question with the thing and the count for a confirmation: "Delete 3 draft invoices?" */
  title: React.ReactNode
  description?: React.ReactNode
  /** The buttons: secondary then primary. A destructive confirm uses `danger-solid` and repeats the verb with the count. */
  footer?: React.ReactNode
  /** One line beside the buttons, such as what is recorded. */
  footnote?: React.ReactNode
  /** Escape, the close button and a click on the scrim call it. */
  onClose?: () => void
  /** 400, 520 or 720px. Full width under 640px, where it rises from the bottom. */
  width?: DialogWidth
  /** `false` once a form inside has changes, so a stray click cannot lose them. Escape still closes it. */
  scrimClose?: boolean
  headingLevel?: OverlayHeadingLevel
  /** Where focus goes on close when nothing had focus as it opened, such as a dialog a shortcut opened. */
  returnFocus?: React.RefObject<HTMLElement | null>
  children?: React.ReactNode
  className?: string
}

/** A focused decision or a short form over the page. If the action can be undone, do it and offer Undo instead. */
export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { open = false, inline = false, title, description, footer, footnote, onClose, width = 520, scrimClose = true, headingLevel = 2, returnFocus, children, className },
  ref
) {
  const { restoreFocus, themeProps, contentRef } = useOverlayOpener(open && !inline, returnFocus)
  const overlayRef = useMergedRef<HTMLElement>(ref as React.Ref<HTMLElement>, contentRef)
  const ids = React.useId()
  const Heading = `h${headingLevel}` as const

  const rest = (
    <>
      {children !== undefined && children !== null ? (
        <div data-slot="dialog-body" className="mt-4 type-body text-text">
          {children}
        </div>
      ) : null}
      {footer || footnote ? (
        <div data-slot="dialog-actions" className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 @max-[639px]:flex-col @max-[639px]:items-stretch">
          {footnote ? <p className="min-w-0 flex-1 type-meta text-pretty text-text-muted">{footnote}</p> : null}
          {footer ? <DialogFooter className="ml-auto @max-[639px]:ml-0">{footer}</DialogFooter> : null}
        </div>
      ) : null}
    </>
  )

  if (inline) {
    return (
      <div className="@container w-full">
        <div
          ref={ref}
          role="dialog"
          aria-labelledby={`${ids}-title`}
          aria-describedby={description ? `${ids}-description` : undefined}
          data-slot="dialog-content"
          data-placement="center"
          data-inline=""
          className={cn(dialogPanelClass, WIDTH[width], className)}
        >
          <DialogHeader className="pr-10">
            <Heading id={`${ids}-title`} data-slot="dialog-title" className={dialogTitleClass}>
              {title}
            </Heading>
            {description ? (
              <p id={`${ids}-description`} data-slot="dialog-description" className={dialogDescriptionClass}>
                {description}
              </p>
            ) : null}
          </DialogHeader>
          {rest}
          <ButtonBase variant="ghost" size="icon-sm" aria-label="Close" className={dialogCloseClass} onClick={onClose}>
            <Icon name="X" />
          </ButtonBase>
        </div>
      </div>
    )
  }

  return (
    <DialogRoot open={open} onOpenChange={(next) => (next ? undefined : onClose?.())}>
      <DialogContent
        ref={overlayRef}
        className={cn(WIDTH[width], className)}
        overlayProps={themeProps}
        onCloseAutoFocus={restoreFocus}
        onPointerDownOutside={scrimClose ? undefined : (event) => event.preventDefault()}
      >
        <DialogHeader className="pr-10">
          <DialogTitle asChild>
            <Heading>{title}</Heading>
          </DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {rest}
      </DialogContent>
    </DialogRoot>
  )
})
