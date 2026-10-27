"use client"

import * as React from "react"

import { Alert as AlertBase, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button as ButtonBase } from "@/components/ui/button"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Button, type ButtonSize, type ButtonVariant } from "./button"
import { Icon } from "./icon"

export type AlertTone = "neutral" | "info" | "success" | "warning" | "danger" | "ai"

/** An action as data, so a board can pass it as a value. Elements (Buttons) work too. */
export interface FeedbackAction {
  label: string
  variant?: ButtonVariant
  icon?: IconName
  href?: string
  onClick?: () => void
}

/** Each tone's primitive variant and default icon. The icon is what keeps a tone from riding on colour alone. */
export const alertTones = {
  neutral: { variant: "default", icon: "Info" },
  info: { variant: "info", icon: "Info" },
  success: { variant: "success", icon: "CircleCheck" },
  warning: { variant: "warning", icon: "TriangleAlert" },
  danger: { variant: "destructive", icon: "CircleAlert" },
  ai: { variant: "ai", icon: "Sparkles" },
} as const satisfies Record<AlertTone, { variant: string; icon: IconName }>

const isAction = (a: unknown): a is FeedbackAction =>
  typeof a === "object" && a !== null && !React.isValidElement(a) && typeof (a as FeedbackAction).label === "string"

/** Actions given as data become Buttons; anything else renders as it is. */
export function renderActions(actions: React.ReactNode | FeedbackAction[], size: ButtonSize = "sm"): React.ReactNode {
  if (!Array.isArray(actions) || !actions.length || !actions.every(isAction)) return actions as React.ReactNode
  return actions.map((a, i) => (
    <Button key={`${a.label}-${i}`} size={size} variant={a.variant ?? "secondary"} icon={a.icon} href={a.href} onClick={a.onClick}>
      {a.label}
    </Button>
  ))
}

/** A line that runs on into another, as one sentence: a full stop when it has no closing punctuation. */
export const sentence = (line: React.ReactNode) => (typeof line === "string" && !/[.?!…]$/.test(line.trim()) ? `${line.trim()}.` : line)

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Focuses the first candidate that actually takes focus: a hidden element or a main without tabindex is skipped. */
export function focusFirst(candidates: Array<HTMLElement | null | undefined>, options?: FocusOptions) {
  for (const el of candidates) {
    if (!el?.isConnected) continue
    el.focus(options)
    if (document.activeElement === el) return true
  }
  return false
}

/** After something removes itself, focus goes to what comes next, then the page title, then main: never the page body. */
export function focusOnward(from: HTMLElement) {
  const following = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !from.contains(el) && Boolean(from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) && el.getClientRects().length > 0
  )
  focusFirst([...following, document.querySelector<HTMLElement>('[data-slot="page-title"]'), document.querySelector<HTMLElement>("main")])
}

/** Whether there are any actions to show: an empty list is none. */
export const hasActions = (actions: React.ReactNode | FeedbackAction[] | undefined) =>
  Array.isArray(actions) ? actions.length > 0 : Boolean(actions)

/** The dismiss control both Alert and Banner carry: 32px, 40px on touch, named for what it dismisses. */
export function dismissButton(label: string, onDismiss: () => void, root: React.RefObject<HTMLElement | null>, className?: string) {
  return (
    <ButtonBase
      type="button"
      variant="ghost"
      size="icon-sm"
      data-slot="alert-dismiss"
      aria-label={label}
      className={cn("absolute text-text-muted hover:text-text-strong", className)}
      onClick={() => {
        if (root.current?.contains(document.activeElement)) focusOnward(root.current)
        onDismiss()
      }}
    >
      <Icon name="X" />
    </ButtonBase>
  )
}

export interface AlertProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title" | "role"> {
  /** neutral, info, success, warning, danger or ai. Each has its own icon, so colour is never the only signal. */
  tone?: AlertTone
  /** What happened, in a few words. */
  title?: React.ReactNode
  /** Replaces the tone's icon, for a more specific one (Lock for read only, WifiOff for offline). */
  icon?: IconName
  /** Buttons, or the same as data: [{ label, variant, icon, href, onClick }]. Under the text below 640px of the alert's width, beside it from 640px. */
  actions?: React.ReactNode | FeedbackAction[]
  /** Shows a dismiss button. Focus moves on to what comes next, never the page body. */
  onDismiss?: () => void
  /** The dismiss button's name. "Dismiss: [title]" by default. */
  dismissLabel?: string
  /** alert for danger and warning, status for the rest. Pass status for a problem already showing when the page loads. */
  role?: "alert" | "status"
  /** What it means and what to do. */
  children?: React.ReactNode
}

/** A message inside a page or card: what happened, what it means, what to do. */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = "neutral", title, icon, actions, onDismiss, dismissLabel, role, className, children, ...rest },
  ref
) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const { variant, icon: toneIcon } = alertTones[tone]
  const label = dismissLabel ?? (typeof title === "string" ? `Dismiss: ${title}` : "Dismiss")
  return (
    <AlertBase
      ref={merged}
      variant={variant}
      role={role ?? (tone === "danger" || tone === "warning" ? "alert" : "status")}
      data-tone={tone}
      className={cn(onDismiss && "pr-12 pointer-coarse:pr-14", className)}
      {...rest}
    >
      <Icon name={icon ?? toneIcon} />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children ? <AlertDescription>{children}</AlertDescription> : null}
      {hasActions(actions) ? <AlertAction>{renderActions(actions)}</AlertAction> : null}
      {onDismiss ? dismissButton(label, onDismiss, own, "top-1.5 right-1.5 pointer-coarse:top-0.5") : null}
    </AlertBase>
  )
})
