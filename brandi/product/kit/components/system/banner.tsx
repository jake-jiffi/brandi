"use client"

import * as React from "react"

import { Alert as AlertBase, AlertAction, AlertDescription } from "@/components/ui/alert"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { alertTones, dismissButton, hasActions, renderActions, sentence, type AlertTone, type FeedbackAction } from "./alert"
import { Icon } from "./icon"

export interface BannerProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title" | "role"> {
  /** neutral, info, success, warning, danger or ai, as Alert. Offline is neutral. */
  tone?: AlertTone
  /** The state, in a few words: "[Source] is not responding". */
  title?: React.ReactNode
  /** Replaces the tone's icon: WifiOff for offline, Lock for read only. */
  icon?: IconName
  /** Buttons, or the same as data. Under the text below 640px of the banner's width, beside it from 640px. */
  actions?: React.ReactNode | FeedbackAction[]
  /** Shows a dismiss button. Leave it out while the state still applies. */
  onDismiss?: () => void
  /** "Dismiss: [title]" by default. */
  dismissLabel?: string
  /** status, because a banner is usually there on arrival. alert when it appears because something broke while the person was on the page. */
  role?: "alert" | "status"
  /** The consequence, on the same line: "Invoices below are from [9:42 am]." */
  children?: React.ReactNode
}

/** A one-line Alert across the top of the page's content: sample data, read only, a source that is down, offline. */
export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { tone = "neutral", title, icon, actions, onDismiss, dismissLabel, role = "status", className, children, ...rest },
  ref
) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const { variant, icon: toneIcon } = alertTones[tone]
  const label = dismissLabel ?? (typeof title === "string" ? `Dismiss: ${title}` : "Dismiss")
  return (
    <AlertBase
      ref={merged}
      data-slot="banner"
      variant={variant}
      role={role}
      data-tone={tone}
      // One line from 640px: 48px tall, with the words and icon centred on the action beside them.
      className={cn(
        "flex min-h-12 flex-col justify-center py-1.5 @min-[640px]/alert:[&>[data-slot=alert-grid]]:items-center @min-[640px]/alert:[&>[data-slot=alert-grid]>svg]:mt-0",
        onDismiss && "pr-12 pointer-coarse:pr-14",
        className
      )}
      {...rest}
    >
      <Icon name={icon ?? toneIcon} />
      <AlertDescription>
        {title ? <strong className="type-label text-text-strong">{children ? sentence(title) : title}</strong> : null}
        {title && children ? " " : null}
        {children}
      </AlertDescription>
      {hasActions(actions) ? <AlertAction>{renderActions(actions)}</AlertAction> : null}
      {onDismiss ? dismissButton(label, onDismiss, own, "top-1/2 right-1.5 -mt-4 pointer-coarse:-mt-5") : null}
    </AlertBase>
  )
})
