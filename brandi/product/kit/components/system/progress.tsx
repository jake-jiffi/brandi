"use client"

import * as React from "react"

import { Progress as ProgressBase } from "@/components/ui/progress"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

export type ProgressTone = "success" | "warning" | "danger" | "info" | "brand"
export type ProgressSize = "sm" | "md"

// The tone's text colour, which holds 3:1 against the track in both themes; the solid tints do not.
const TONE: Record<ProgressTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  // The primary colour, which is solved against the track. The brand fill is not, and a light one cannot
  // hold 3:1 on a light track.
  brand: "bg-primary",
}

/** A number, from a prop or from a canvas attribute's text ("34"); anything else is missing. */
function numberOf(v: unknown): number | null {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v
  return typeof n === "number" && Number.isFinite(n) ? n : null
}

export interface ProgressProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** What is progressing. Shown above the bar, and the bar's accessible name. */
  label: string
  /** How far along, from 0 to `max`. Missing says so; it is never drawn as zero. */
  value?: number | null
  max?: number
  /** A marker on the bar, in the same units as `value`. */
  target?: number
  /** What a screen reader hears for the target. "Target 90%" by default. */
  targetLabel?: string
  tone?: ProgressTone
  /** An unknown length. Never a made-up percentage. */
  indeterminate?: boolean
  /** Shows `valueLabel` beside the label. */
  showValue?: boolean
  /** The value in words, shown and read: "34 of 40 h". The percentage by default. */
  valueLabel?: string
  /** A 4 or 8px bar. */
  size?: ProgressSize
}

/** Progress toward a known end, with an optional target marker. */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { label, value, max = 100, target, targetLabel, tone = "brand", indeterminate = false, showValue = false, valueLabel, size = "md", className, ...rest },
  ref
) {
  const labelId = React.useId()
  const targetId = React.useId()
  const bar = React.useRef<HTMLDivElement | null>(null)
  const end = numberOf(max)
  const top = end !== null && end > 0 ? end : 100
  const amount = indeterminate ? null : numberOf(value)
  const mark = numberOf(target)
  const share = (n: number) => Math.min(100, Math.max(0, (n / top) * 100))
  const words = amount !== null ? (valueLabel ?? formatNumber(share(amount), "percent", { digits: 0 })) : indeterminate ? "" : "Not available"
  const targetWords = mark !== null ? (targetLabel ?? `Target ${formatNumber(share(mark), "percent", { digits: 0 })}`) : ""

  // An unknown length sweeps a short segment across the track. Under reduced motion it slows right down
  // instead of stopping, so it never looks like a hang (05-components.md, 2.8).
  React.useEffect(() => {
    const indicator = bar.current?.querySelector<HTMLElement>("[data-slot='progress-indicator']")
    if (!indeterminate || !indicator || typeof indicator.animate !== "function") return
    const slow = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    indicator.style.transformOrigin = "left"
    const sweep = indicator.animate(
      [{ transform: "translateX(-40%) scaleX(0.4)" }, { transform: "translateX(100%) scaleX(0.4)" }],
      { duration: slow ? 4800 : 1600, iterations: Infinity, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
    )
    return () => {
      sweep.cancel()
      indicator.style.transformOrigin = ""
    }
  }, [indeterminate])

  return (
    <div ref={ref} data-slot="progress-field" className={cn("flex w-full min-w-0 flex-col gap-1.5", className)} {...rest}>
      <div className="flex items-baseline justify-between gap-3">
        <span id={labelId} className="min-w-0 type-label text-text-strong">
          {label}
        </span>
        {showValue && words ? (
          <span aria-hidden="true" className="shrink-0 type-meta tabular-nums text-text-muted">
            {words}
          </span>
        ) : null}
      </div>
      <div className="relative">
        <ProgressBase
          ref={bar}
          aria-labelledby={labelId}
          aria-describedby={mark !== null ? targetId : undefined}
          aria-valuetext={indeterminate ? undefined : words}
          aria-busy={indeterminate || undefined}
          value={amount}
          max={top}
          data-tone={tone}
          className={size === "sm" ? "h-1" : "h-2"}
          indicatorClassName={TONE[tone]}
        />
        {mark !== null ? (
          <span
            aria-hidden="true"
            data-slot="progress-target"
            // A transparent edge, so forced colours still draw the marker once its fill is gone.
            className={cn("absolute w-0.5 -translate-x-1/2 rounded-full border-l-2 border-transparent bg-text-strong", size === "sm" ? "-top-1 -bottom-1" : "-top-1.5 -bottom-1.5")}
            style={{ left: `${share(mark)}%` }}
          />
        ) : null}
      </div>
      {mark !== null ? (
        <span id={targetId} hidden>
          {targetWords}
        </span>
      ) : null}
    </div>
  )
})
