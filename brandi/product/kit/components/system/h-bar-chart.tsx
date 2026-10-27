"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, type NumberStyle } from "@/lib/format"
import { cn } from "@/lib/utils"

import { chart, paintFill, useArrived, useChartText, useTextWidth, type ChartState, type ChartPaint, type ChartSlot } from "./chart"

export interface HBarDatum {
  label: string
  /** `null` or missing is no data: the row says so and draws no bar. */
  value: number | null | undefined
}

export interface HBarChartProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title" | "children" | "color"> {
  /** `{ label, value }`. Sorted descending for you; ten rows at most, the rest folded into "Other". */
  data: HBarDatum[]
  /** The number style for the printed values. They are exact. */
  format?: NumberStyle
  /** The value a full-length bar stands for, such as 100 for percentages. Defaults to the largest value. */
  max?: number
  /** The series slot for the bars. series-1 by default; "Other" is grey. */
  color?: ChartSlot
  /** What the list ranks: its accessible name. Inside a ChartFigure, the figure's heading. */
  title?: string
  /** The takeaway in one sentence: its accessible description. Inside a ChartFigure, the figure's takeaway. */
  summary?: string
  /** `loading` shows skeleton rows; `empty` and `error` show their message in their place. */
  state?: ChartState
  /** What the empty state says. Shown by itself whenever there is no data. */
  empty?: string
  /** What the error state says. Name the system that failed. */
  error?: string
  /** Adds Try again to the error state. */
  onRetry?: () => void
}

const ROWS = 10
const BAR = 12
const GAP = 8

interface Row {
  label: string
  value: number | null
  paint: ChartPaint
  other: boolean
}

/** A ranked top ten with direct labels and values: the clearest way to compare named things. */
export const HBarChart = React.forwardRef<HTMLDivElement, HBarChartProps>(function HBarChart(
  { data, format = "number", max, color = 1, title, summary, state = "ready", empty, error, onRetry, className, ...rest },
  ref
) {
  const probe = React.useRef<HTMLSpanElement | null>(null)
  const measure = useTextWidth(probe)
  const text = useChartText(title, summary)
  const rows = React.useMemo<Row[]>(() => {
    const all = data.map((d) => ({ label: d.label, value: typeof d.value === "number" && Number.isFinite(d.value) ? d.value : null, paint: color as ChartPaint, other: false }))
    const ranked = [...all.filter((r) => r.value !== null).sort((a, b) => (b.value as number) - (a.value as number)), ...all.filter((r) => r.value === null)]
    if (ranked.length <= ROWS) return ranked
    const rest = ranked.slice(ROWS - 1)
    const known = rest.map((r) => r.value).filter((v): v is number => v !== null)
    return [...ranked.slice(0, ROWS - 1), { label: `Other (${rest.length})`, value: known.length ? known.reduce((a, b) => a + b, 0) : null, paint: "other", other: true }]
  }, [data, color])
  const values = rows.map((r) => r.value).filter((v): v is number => v !== null)
  const view: ChartState = state === "ready" && !values.length ? "empty" : state
  const announce = useArrived(view === "error")
  const lo = Math.min(0, ...values)
  const hi = Math.max(0, max ?? 0, ...values) || 1
  const at = (v: number) => ((v - lo) / (hi - lo)) * 100
  const zero = at(0)
  const printed = rows.map((r) => (r.value === null ? "No data" : formatNumber(r.value, format)))
  // Each value sits at its bar's tip, so the scale leaves room for the widest one on each side of zero.
  const widest = (keep: (v: number | null) => boolean) => Math.max(0, ...rows.map((r, i) => (keep(r.value) ? measure(printed[i]) : 0)))
  const right = Math.ceil(widest((v) => v === null || v >= 0)) + GAP
  const left = lo < 0 ? Math.ceil(widest((v) => v !== null && v < 0)) + GAP : 0

  return (
    <div ref={ref} data-slot="h-bar-chart" data-state={view} className={cn("@container relative w-full min-w-0", className)} {...rest}>
      <span ref={probe} aria-hidden="true" className="invisible absolute type-label tabular-nums" />
      {text.hidden}
      {view !== "ready" ? (
        <chart.Status
          state={view}
          height={Math.min(ROWS, Math.max(3, data.length || 5)) * 30}
          icon="ChartBarDecreasing"
          empty={empty}
          error={error}
          onRetry={onRetry}
          label={text.caption}
          announce={announce}
          loading={
            <div aria-hidden="true" className="flex flex-col gap-4 pt-1">
              {[78, 64, 52, 40, 28].map((w) => (
                <div key={w} className="grid grid-cols-[30%_minmax(0,1fr)] items-center gap-4">
                  <Skeleton className="h-3 rounded-xs" />
                  <Skeleton className="h-3 rounded-xs" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          }
        />
      ) : (
        <ol
          role="list"
          aria-labelledby={text.labelledBy}
          aria-describedby={text.describedBy}
          className="grid grid-cols-[fit-content(40%)_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 @max-[479px]:grid-cols-1 @max-[479px]:gap-y-3"
        >
          {rows.map((r, i) => {
            const v = r.value
            const neg = v !== null && v < 0
            const tip = v === null ? zero : at(v)
            return (
              <li key={`${i}-${r.label}`} data-slot="h-bar-row" className="col-span-full grid grid-cols-subgrid items-center gap-y-1">
                <span data-slot="h-bar-label" className={cn("min-w-0 break-words type-body", r.other ? "text-text-muted" : "text-text")}>
                  {r.label}
                  <span className="sr-only">: </span>
                </span>
                <span className="relative block h-5 min-w-0">
                  <span aria-hidden="true" className="absolute inset-y-0 block" style={{ left, right }}>
                    {v !== null && v !== 0 ? (
                      <svg
                        data-slot="chart-bar"
                        focusable="false"
                        height={BAR}
                        className="absolute top-1/2 -translate-y-1/2 overflow-visible"
                        style={{ left: `${neg ? tip : zero}%`, width: `${(Math.abs(v) / (hi - lo)) * 100}%` }}
                      >
                        <rect width="100%" height={BAR} rx="4" className={paintFill[r.paint]} />
                        {/* Square the baseline end: only the data end is rounded. */}
                        <rect x={neg ? "50%" : "0"} width="50%" height={BAR} className={paintFill[r.paint]} />
                      </svg>
                    ) : null}
                    {lo < 0 ? <span data-slot="chart-zero" className="absolute -inset-y-0.5 border-l border-line-control" style={{ left: `${zero}%` }} /> : null}
                  </span>
                  <span
                    data-slot="h-bar-value"
                    className={cn("absolute top-0 whitespace-nowrap tabular-nums", v === null ? "type-body text-text-muted" : "type-label text-text-strong")}
                    style={neg ? { right: `calc(${right}px + (100% - ${left + right}px) * ${(100 - tip) / 100} + ${GAP}px)` } : { left: `calc(${left}px + (100% - ${left + right}px) * ${tip / 100} + ${v === null ? 0 : GAP}px)` }}
                  >
                    {printed[i]}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
})
