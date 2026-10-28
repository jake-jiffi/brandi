import * as React from "react"

import { formatNumber, type NumberStyle } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export type DeltaGoodWhen = "up" | "down" | "neither"

export interface DeltaProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  /** The change, signed. Missing says so; it is never drawn as zero. */
  value: number | null | undefined
  /** Any number style. A change in a rate is `points`, never a percent of a percent. */
  format?: NumberStyle
  /** Which way is better. Costs, overdue amounts and churn are `down`. */
  goodWhen?: DeltaGoodWhen
  /** What it is compared with, always: "vs last month". */
  suffix?: string
}

/** Change against a comparison, as an arrow and a value, read as the whole judgement. */
export const Delta = React.forwardRef<HTMLSpanElement, DeltaProps>(function Delta(
  { value, format = "percent", goodWhen = "up", suffix, className, ...rest },
  ref
) {
  // A canvas attribute arrives as text ("6.2"), so text that reads as a number counts as one.
  const raw: unknown = value
  const change = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw
  if (typeof change !== "number" || !Number.isFinite(change)) {
    return (
      <span ref={ref} data-slot="delta" data-direction="none" className={cn("inline-flex items-center type-body text-text-muted", className)} {...rest}>
        No comparison
      </span>
    )
  }

  const figure = formatNumber(Math.abs(change), format)
  // Flat is decided on the figure people see, so 0.04% shown as 0% is no change, not "up".
  const direction = figure === formatNumber(0, format) ? "flat" : change > 0 ? "up" : "down"
  // Anything but down or neither means up, so a mistyped value never calls every change worse.
  const good = goodWhen === "down" || goodWhen === "neither" ? goodWhen : "up"
  const judgement = direction === "flat" || good === "neither" ? null : direction === good ? "better" : "worse"
  const spoken =
    direction === "flat"
      ? ["No change", suffix].filter(Boolean).join(" ")
      : `${direction === "up" ? "Up" : "Down"} ${figure}${judgement ? `, ${judgement}` : ""}${suffix ? ` ${suffix}` : ""}`

  return (
    <span
      ref={ref}
      data-slot="delta"
      data-direction={direction}
      data-judgement={judgement ?? "none"}
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-center gap-0.5 type-label tabular-nums",
          judgement === "better" ? "text-success" : judgement === "worse" ? "text-danger" : "text-text-muted"
        )}
      >
        <Icon name={direction === "up" ? "ArrowUp" : direction === "down" ? "ArrowDown" : "Minus"} size={14} strokeWidth={2.25} />
        {figure}
      </span>
      {/* The word says better or worse in every mode: colour alone fails anyone who cannot tell success from danger,
          and whether up is good depends on goodWhen, which no arrow shows. */}
      {judgement || suffix ? (
        <span aria-hidden="true" className="type-body text-text-muted">
          {judgement ? <span data-slot="delta-judgement">{judgement}</span> : null}
          {judgement && suffix ? " " : null}
          {suffix}
        </span>
      ) : null}
      <span className="sr-only">{spoken}</span>
    </span>
  )
})
