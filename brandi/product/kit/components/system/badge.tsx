"use client"

import * as React from "react"

import { Badge as BadgeBase, BadgeDot } from "@/components/ui/badge"
import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"

import { Icon } from "./icon"
import { Tooltip, useTruncated } from "./tooltip"

export type BadgeTone = "success" | "warning" | "danger" | "info" | "ai" | "highlight" | "neutral"
export type BadgeSize = "sm" | "md"

/** Each tone's own icon, for `icon={true}`. The word still carries the meaning. */
const TONE_ICON: Record<BadgeTone, IconName> = {
  success: "CircleCheck",
  warning: "TriangleAlert",
  danger: "CircleX",
  info: "Info",
  ai: "Sparkles",
  highlight: "CircleDot",
  neutral: "CircleDashed",
}

export interface BadgeProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  /** What the state is to the person reading it. See Tones. */
  tone?: BadgeTone
  /** A small dot in the badge's colour before the word. */
  dot?: boolean
  /** An icon before the word: a name, or `true` for the tone's own icon. */
  icon?: IconName | boolean
  /** 20 or 24px tall. */
  size?: BadgeSize
  /** A count shown as a figure and read with `countLabel` ("3 need you"). */
  count?: number
  /** The words a screen reader hears after the count: "need you", "unread". */
  countLabel?: string
  /** One or two words of state, in sentence case, with no full stop. */
  children?: React.ReactNode
}

/** One or two words of state on a record. Read, not pressed. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", dot = false, icon, size = "md", count, countLabel, className, children, ...rest },
  ref
) {
  const [label, setLabel] = React.useState<HTMLSpanElement | null>(null)
  const cut = useTruncated(label)
  const glyph = icon === true ? TONE_ICON[tone] : icon || undefined
  // A canvas attribute arrives as text ("3"), so text that reads as a number counts as one.
  const raw: unknown = count
  const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw
  const counted = typeof n === "number" && Number.isFinite(n)

  const badge = (
    <BadgeBase ref={ref} variant={tone} size={size} data-tone={tone} className={className} {...rest}>
      {dot ? <BadgeDot /> : null}
      {glyph ? <Icon name={glyph} size={12} /> : null}
      {counted ? (
        <>
          <span aria-hidden="true" className="tabular-nums">
            {formatNumber(n, Math.abs(n) >= 10000 ? "compact" : "number")}
          </span>
          <span className="sr-only">{`${formatNumber(n)} ${countLabel ?? ""}`.trim()}</span>
        </>
      ) : (
        <span ref={setLabel} data-slot="badge-label" className="max-w-48 min-w-0 truncate">
          {children}
        </span>
      )}
    </BadgeBase>
  )
  // A label cut short shows in full on hover, on keyboard focus and on a long press.
  return cut ? <Tooltip content={children}>{badge}</Tooltip> : badge
})
