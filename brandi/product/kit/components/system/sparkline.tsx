"use client"

// A client component only because the chart parts it shares are: a server component importing a
// "use client" module gets references, not the class maps.
import * as React from "react"

import { cn } from "@/lib/utils"

import { halo, paintFill, paintStroke, type ChartState, type ChartSlot } from "./chart"

export interface SparklineProps extends Omit<React.ComponentPropsWithoutRef<"svg">, "children" | "width" | "height" | "color"> {
  /** The trend, oldest first. `null` breaks the line; nothing is drawn as zero. */
  data: Array<number | null>
  /** Width in px. */
  width?: number
  /** Height in px. */
  height?: number
  /** The series slot. Keep it series-1: the Delta beside it says whether the trend is good. */
  color?: ChartSlot
  /** The trend in words. Without it the line is decoration and screen readers skip it. */
  label?: string
  /** `loading` shows a skeleton its size; `empty` and `error` keep its space and draw nothing. */
  state?: ChartState
}

const PAD = 4

/** A tiny trend with its last point marked, inside a MetricCard or a table cell. No axes. */
export const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(function Sparkline(
  { data, width = 96, height = 28, color = 1, label, state = "ready", className, ...rest },
  ref
) {
  const values = data.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null))
  const known = values.filter((v): v is number => v !== null)
  const view: ChartState = state === "ready" && !known.length ? "empty" : state
  const lo = Math.min(...known)
  const hi = Math.max(...known)
  const n = values.length
  const x = (i: number) => (n > 1 ? PAD + (i * (width - PAD * 2)) / (n - 1) : width / 2)
  const y = (v: number) => (hi === lo ? height / 2 : PAD + ((hi - v) / (hi - lo)) * (height - PAD * 2))
  const r = (v: number) => Math.round(v * 100) / 100

  const runs: Array<Array<[number, number]>> = []
  if (view === "ready") {
    let run: Array<[number, number]> = []
    values.forEach((v, i) => {
      if (v === null) {
        if (run.length) runs.push(run)
        run = []
      } else run.push([r(x(i)), r(y(v))])
    })
    if (run.length) runs.push(run)
  }
  let last = -1
  for (let i = n - 1; i >= 0 && last < 0; i--) if (values[i] !== null) last = i

  const name = label ? (view === "empty" ? `${label}: no data` : view === "error" ? `${label}: could not load` : view === "loading" ? `${label}: loading` : label) : undefined
  return (
    <svg
      ref={ref}
      data-slot="sparkline"
      data-state={view}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={label ? "img" : undefined}
      aria-label={name}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={cn("block shrink-0 overflow-visible", className)}
      {...rest}
    >
      {view === "loading" ? <rect data-slot="skeleton" width={width} height={height} rx="4" className="animate-pulse fill-chart-track" /> : null}
      {runs.map((run, k) =>
        run.length > 1 ? (
          <path
            key={k}
            data-slot="sparkline-line"
            d={`M${run.map(([a, b]) => `${a},${b}`).join("L")}`}
            fill="none"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={paintStroke[color]}
          />
        ) : (
          <circle key={k} data-slot="sparkline-dot" cx={run[0][0]} cy={run[0][1]} r="2" className={paintFill[color]} />
        )
      )}
      {view === "ready" && last >= 0 ? (
        <circle
          data-slot="sparkline-end"
          cx={r(x(last))}
          cy={r(y(values[last] as number))}
          r="3"
          strokeWidth="3"
          paintOrder="stroke"
          className={cn(paintFill[color], halo)}
        />
      ) : null}
    </svg>
  )
})
