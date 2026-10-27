"use client"

import * as React from "react"

import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export type ToastTone = "neutral" | "success" | "warning" | "danger"

// Only text-inverse is measured against surface-inverse, so a tone shows by its icon, never by a colour.
const TONE_ICON: Record<ToastTone, IconName | undefined> = {
  neutral: undefined,
  success: "CircleCheck",
  warning: "TriangleAlert",
  danger: "CircleAlert",
}

/** Where floating toasts sit: fixed to the window at the bottom centre, measured as a container. */
export const toastDock = "pointer-events-none fixed inset-x-0 bottom-0 z-(--z-toast) @container/toasts flex flex-col items-center px-4"
/** The gap beneath them: clear of the safe area, and clear of the phone action bar below 640px. */
export const toastLift = "mb-[calc(--spacing(6)+env(safe-area-inset-bottom))] @max-[639px]/toasts:mb-[calc(--spacing(22)+env(safe-area-inset-bottom))]"

// The toast's own buttons: its text colour for the edge, the wash and the focus outline, because the
// system's focus colour vanishes on the inverse surface. The outline colour is set at rest, where no outline
// is drawn, so focus never fades in from the focus colour. 32px, and 44px on touch.
const ACTION =
  "inline-flex h-8 shrink-0 items-center rounded-control border border-text-inverse/40 px-3 type-label text-text-inverse transition-colors hover:bg-text-inverse/10 active:bg-text-inverse/15 outline-text-inverse pointer-coarse:h-11 pointer-coarse:px-4"
const CLOSE =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-control text-text-inverse transition-colors hover:bg-text-inverse/10 active:bg-text-inverse/15 outline-text-inverse pointer-coarse:size-11"

export interface ToastProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** neutral, success, warning or danger. Shown by the icon; the surface stays the same. */
  tone?: ToastTone
  /** Replaces the tone's icon. */
  icon?: IconName
  /** One sentence, past tense, with a full stop: "[3] invoices sent." */
  children?: React.ReactNode
  /** The action's label, when the action can be reversed: "Undo". */
  action?: string
  onAction?: () => void
  /** Shows a close button. Without it, the toast has none. */
  onClose?: () => void
  /** The close button's name. "Dismiss" by default. */
  closeLabel?: string
  /** Fixed at the bottom centre of the window, never wider than the screen, as a polite status. ToastRegion places its own. */
  floating?: boolean
}

/** A brief confirmation after an action, on the inverse surface, with Undo when the action can be reversed. */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { tone = "neutral", icon, children, action, onAction, onClose, closeLabel = "Dismiss", floating = false, className, ...rest },
  ref
) {
  const glyph = icon ?? TONE_ICON[tone]
  const toast = (
    <div
      ref={ref}
      data-slot="toast"
      data-tone={tone}
      role={floating ? "status" : undefined}
      className={cn(
        "pointer-events-auto flex w-fit max-w-[min(100%,36rem)] items-start gap-3 rounded-md border border-transparent bg-surface-inverse py-2 pl-4 text-text-inverse shadow-lg",
        action || onClose ? "pr-2" : "pr-4",
        className
      )}
      {...rest}
    >
      {glyph ? <Icon name={glyph} className="mt-2 pointer-coarse:mt-3.5" /> : null}
      <div data-slot="toast-message" className="min-w-0 flex-1 py-1.5 type-body wrap-break-word pointer-coarse:py-3">
        {children}
      </div>
      {action ? (
        <button type="button" data-slot="toast-action" className={ACTION} onClick={onAction}>
          {action}
        </button>
      ) : null}
      {onClose ? (
        <button type="button" data-slot="toast-close" aria-label={closeLabel} className={CLOSE} onClick={onClose}>
          <Icon name="X" />
        </button>
      ) : null}
    </div>
  )
  if (!floating) return toast
  return (
    <div data-slot="toast-dock" className={toastDock}>
      <div className={cn(toastLift, "flex max-w-full justify-center")}>{toast}</div>
    </div>
  )
})
