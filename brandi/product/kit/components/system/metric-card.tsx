"use client"

import * as React from "react"

import { formatNumber, type NumberStyle } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Card } from "./card"
import { Delta, type DeltaGoodWhen } from "./delta"
import { Icon } from "./icon"
import { Skeleton } from "./skeleton"
import { Sparkline } from "./sparkline"
import { Toggletip } from "./toggletip"

export type MetricCardState = "ready" | "loading" | "unavailable"

export interface MetricCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Says exactly what is counted: "Net revenue, before GST". */
  label: string
  /** The figure. Text that is not a number ("7 of 8") shows as written. Missing says so; it is never drawn as zero. */
  value?: number | string | null
  /** The number style. Rounded for reading on a card: compact-currency shows $18K. */
  format?: NumberStyle
  /** The change, signed. Missing draws no delta; null says there is no comparison. */
  delta?: number | null
  /** percent, or points for a rate. */
  deltaFormat?: NumberStyle
  /** Which way is better. Costs, overdue amounts and churn are down. */
  goodWhen?: DeltaGoodWhen
  /** What the change is against: "vs last month". It shows only beside a delta; footnote is the line that always shows. */
  context?: string
  /** A trend, oldest first. null breaks the line. */
  trend?: Array<number | null>
  /** The trend in words, for screen readers. Without it the sparkline is decoration. */
  trendLabel?: string
  /** What is left out, under the figure. */
  footnote?: React.ReactNode
  /** A definition behind an info button beside the label: a press, a tap or Enter opens it. */
  hint?: React.ReactNode
  /** The info button's name. "About [label]" by default. */
  hintLabel?: string
  /** Design mode: shows the hint open, in place, for a board. */
  hintOpen?: boolean
  /** The headline figure of its row: a bolder label and a larger trend. One per row at most. */
  hero?: boolean
  /** ready, loading (the label stays, the figure waits as a skeleton), or unavailable when its source is down. */
  state?: MetricCardState
  /** When unavailable: which source is down and when it last answered. */
  unavailableText?: React.ReactNode
  /** The label's heading level. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

/** "Net revenue" becomes "net revenue" inside a sentence; "GST collected" keeps its capitals. */
const inSentence = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s)

/** A headline figure: its label, the value, a delta with its comparison, an optional trend and a footnote. */
export const MetricCard = React.forwardRef<HTMLElement, MetricCardProps>(function MetricCard(
  {
    label,
    value,
    format = "number",
    delta,
    deltaFormat = "percent",
    goodWhen = "up",
    context,
    trend,
    trendLabel,
    footnote,
    hint,
    hintLabel,
    hintOpen,
    hero = false,
    state = "ready",
    unavailableText,
    headingLevel = 3,
    className,
    ...rest
  },
  ref
) {
  // A board passes "4" as text; anything outside 2 to 6 is the default h3, never an element that is no heading.
  const level = [2, 3, 4, 5, 6].includes(Number(headingLevel)) ? Number(headingLevel) : 3
  const Heading = `h${level}` as "h3"
  const view: MetricCardState = state === "loading" || state === "unavailable" ? state : "ready"
  // A number given as text (a board's "4") goes through the formatter. A figure the product wrote in words ("7 of 8")
  // shows as written: it once read No data, as if nobody had measured it.
  const words = typeof value === "string" && value.trim() !== "" && !Number.isFinite(Number(value))
  const figure = words ? value : formatNumber(value, format)
  const points = Array.isArray(trend) ? trend : null
  const hasFootnote = footnote !== undefined && footnote !== null && footnote !== false && footnote !== ""

  return (
    <Card
      ref={ref}
      // The hint's picture, shown open for a design, may rise above the card, so the card does not clip it. The
      // body fills the card, so footnotes sit at the foot of every card in a row, and every card keeps a 20px
      // inset whatever its width, so labels and figures line up along a row of cards of different widths.
      className={cn("h-full overflow-visible [&>[data-slot=card-content]]:flex-1 [&>[data-slot=card-content]]:p-5", className)}
      {...rest}
    >
      <div data-slot="metric-card" data-state={view} data-hero={hero || undefined} aria-busy={view === "loading" || undefined} className="flex h-full flex-col">
        <div className="flex min-h-6 items-center gap-1">
          {/* The hero's label is the row's lead: bolder and in text-strong, at the same size, so labels share a line. */}
          <Heading data-slot="metric-card-label" className={hero ? "type-heading-sm text-text-strong" : "type-label text-text-muted"}>
            {label}
          </Heading>
          {hint ? <Toggletip label={hintLabel ?? `About ${inSentence(label)}`} content={hint} open={hintOpen} /> : null}
        </div>

        {view === "loading" ? (
          <div data-slot="metric-card-loading" className="mt-2 flex flex-col gap-3">
            <Skeleton height={36} width="56%" label={`Loading ${inSentence(label)}`} />
            <Skeleton height={14} width="38%" />
          </div>
        ) : view === "unavailable" ? (
          <div data-slot="metric-card-unavailable" className="mt-2 flex flex-col gap-1">
            <p className="flex items-center gap-2 type-heading text-text-muted">
              <Icon name="CloudOff" size={18} />
              Unavailable
            </p>
            <p className="max-w-measure type-meta text-text-muted">{unavailableText ?? "Its source is not responding."}</p>
          </div>
        ) : (
          <>
            {/* The figure and its trend share a line while there is room, and the trend drops under it when there is not. */}
            <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              {figure ? (
                <p
                  data-slot="metric-card-value"
                  className={cn(
                    // Figures are the body face's kpi styles, in tabular figures, never the display face. The figure
                    // shrinks with its card, never the window.
                    "min-w-0 type-kpi text-text-strong tabular-nums wrap-break-word @max-[199px]:type-kpi-sm"
                  )}
                >
                  {figure}
                </p>
              ) : (
                <p data-slot="metric-card-value" data-missing="" className="type-heading text-text-subtle">
                  No data
                </p>
              )}
              {points ? (
                <Sparkline
                  data={points}
                  label={trendLabel}
                  // The hero's trend is wider, never taller than the figure's line, so figures line up along the row.
                  width={hero ? 176 : 88}
                  height={hero ? 36 : 32}
                  className={hero ? undefined : "mb-1"}
                />
              ) : null}
            </div>
            {delta !== undefined ? (
              <Delta value={delta} format={deltaFormat} goodWhen={goodWhen} suffix={context} className="mt-2 flex-wrap whitespace-normal" />
            ) : null}
          </>
        )}

        {hasFootnote ? (
          <p data-slot="metric-card-footnote" className="mt-auto pt-4 type-meta text-text-subtle">
            {footnote}
          </p>
        ) : null}
      </div>
    </Card>
  )
})
