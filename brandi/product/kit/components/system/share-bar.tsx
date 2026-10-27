"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, type NumberStyle } from "@/lib/format"
import { cn } from "@/lib/utils"

import { chart, halo, paintFill, useArrived, useChartText, type ChartState, type ChartPaint, type ChartSlot } from "./chart"

export interface ShareBarPart {
  label: string
  /** Zero and negative values are left out. `null` or missing is no data, and the legend says so. */
  value: number | null | undefined
  /** The part's series slot, so it keeps its colour on every chart. Unset parts take the free slots in order. */
  color?: ChartSlot
}

export interface ShareBarProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title" | "children"> {
  /** The parts of one whole, in a fixed order, never by size. A seventh part and beyond fold into "Other". */
  data: ShareBarPart[]
  /** The number style for each part's value in the legend. Exact. */
  format?: NumberStyle
  /** What the whole is: the legend's accessible name. Inside a ChartFigure, the figure's heading. */
  title?: string
  /** The takeaway in one sentence: its accessible description. Inside a ChartFigure, the figure's takeaway. */
  summary?: string
  /** `loading` shows a skeleton bar and legend; `empty` and `error` show their message in their place. */
  state?: ChartState
  /** What the empty state says. Shown by itself whenever there is nothing to share out. */
  empty?: string
  /** What the error state says. Name the system that failed. */
  error?: string
  /** Adds Try again to the error state. */
  onRetry?: () => void
}

const BAR = 16

/** Shares to one decimal place that add up to exactly 100: the largest remainders round up. */
function shares(values: number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0)
  const tenths = values.map((v) => (v / total) * 1000)
  const floors = tenths.map(Math.floor)
  let left = 1000 - floors.reduce((a, b) => a + b, 0)
  const order = tenths.map((t, i) => ({ i, rem: t - Math.floor(t) })).sort((a, b) => b.rem - a.rem)
  for (const o of order) {
    if (left <= 0) break
    floors[o.i] += 1
    left -= 1
  }
  return floors.map((f) => f / 10)
}

/** Shares of a whole as one segmented bar, with a legend that prints every share. It replaces pie and donut charts. */
export const ShareBar = React.forwardRef<HTMLDivElement, ShareBarProps>(function ShareBar(
  { data, format = "number", title, summary, state = "ready", empty, error, onRetry, className, ...rest },
  ref
) {
  const text = useChartText(title, summary)
  const id = React.useId().replace(/[^A-Za-z0-9_-]/g, "")
  const parts = React.useMemo(() => {
    const claimed = new Set(data.filter((d) => d.color).map((d) => d.color))
    const free = ([1, 2, 3, 4, 5, 6] as ChartSlot[]).filter((n) => !claimed.has(n))
    // Slots follow the order given, before anything is left out, so a part never changes colour when another drops to zero.
    const all = data.map((d) => ({
      label: d.label,
      value: typeof d.value === "number" && Number.isFinite(d.value) ? d.value : null,
      paint: (d.color ?? free.shift() ?? "other") as ChartPaint,
    }))
    const head = all.slice(0, 6)
    const tail = all.slice(6)
    if (!tail.length) return head
    const known = tail.map((p) => p.value).filter((v): v is number => v !== null && v > 0)
    return [...head, { label: "Other", value: known.length ? known.reduce((a, b) => a + b, 0) : null, paint: "other" as ChartPaint }]
  }, [data])
  const shown = parts.filter((p) => p.value !== null && p.value > 0)
  const missing = parts.filter((p) => p.value === null)
  const view: ChartState = state === "ready" && !shown.length ? "empty" : state
  const announce = useArrived(view === "error")
  const split = shown.length ? shares(shown.map((p) => p.value as number)) : []
  let start = 0
  const segments = shown.map((p, i) => {
    const seg = { ...p, start, share: split[i] }
    start += split[i]
    return seg
  })

  return (
    <div ref={ref} data-slot="share-bar" data-state={view} className={cn("@container flex w-full min-w-0 flex-col gap-3", className)} {...rest}>
      {text.hidden}
      {view !== "ready" ? (
        <chart.Status
          state={view}
          height={view === "loading" ? BAR + 34 : 96}
          icon="ChartColumn"
          empty={empty}
          error={error}
          onRetry={onRetry}
          label={text.caption}
          announce={announce}
          loading={
            <div aria-hidden="true" className="flex flex-col gap-3">
              <Skeleton className="w-full rounded-xs" style={{ height: BAR }} />
              <div className="flex gap-6">
                {[96, 72, 84].map((w) => (
                  <Skeleton key={w} className="h-3.5 rounded-xs" style={{ width: w }} />
                ))}
              </div>
            </div>
          }
        />
      ) : (
        <>
          <svg aria-hidden="true" focusable="false" width="100%" height={BAR} className="block">
            <defs>
              <clipPath id={`${id}-ends`}>
                <rect width="100%" height={BAR} rx="4" />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id}-ends)`}>
              {segments.map((s, i) => (
                <rect key={i} data-slot="chart-bar" data-share={s.share} x={`${s.start}%`} width={`${s.share}%`} height={BAR} className={paintFill[s.paint]} />
              ))}
              {/* A 2px gap in the surface colour between touching parts, never a border round them. */}
              {segments.slice(1).map((s, i) => (
                <line key={i} x1={`${s.start}%`} x2={`${s.start}%`} y1="0" y2={BAR} strokeWidth="2" className={halo} />
              ))}
            </g>
          </svg>
          <ul
            role="list"
            aria-labelledby={text.labelledBy}
            aria-describedby={text.describedBy}
            className="flex flex-wrap gap-x-6 gap-y-2 @max-[399px]:flex-col @max-[399px]:gap-y-1.5"
          >
            {[...segments, ...missing.map((p) => ({ ...p, start: 0, share: null as number | null }))].map((s, i) => (
              <li key={i} data-slot="share-bar-item" className="flex min-w-0 items-center gap-2 @max-[399px]:justify-between">
                <span className="flex min-w-0 items-center gap-2">
                  <chart.Swatch paint={s.paint} mark="bar" />
                  <span className={cn("min-w-0 break-words type-body", s.share === null ? "text-text-muted" : "text-text")}>{s.label}</span>
                </span>
                <span className="sr-only">: </span>
                {s.share === null ? (
                  <span className="type-body text-text-muted">No data</span>
                ) : (
                  <span className="flex items-baseline gap-2 whitespace-nowrap">
                    <span data-slot="share-bar-share" className="type-label tabular-nums text-text-strong">
                      {formatNumber(s.share, "percent")}
                    </span>
                    <span className="sr-only">, </span>
                    <span data-slot="share-bar-value" className="type-meta tabular-nums text-text-muted">
                      {formatNumber(s.value, format)}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
})
