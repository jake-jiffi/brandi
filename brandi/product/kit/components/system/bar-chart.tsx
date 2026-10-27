"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import type { NumberStyle } from "@/lib/format"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import {
  axisStyleFor,
  axisText,
  barPath,
  chart,
  describePoint,
  exact,
  gridLine,
  halo,
  labelText,
  niceScale,
  paintFill,
  paintStroke,
  spreadLabels,
  thinLabels,
  tickLabels,
  toTracks,
  useArrived,
  useChartText,
  usePoints,
  useTextWidth,
  useWidth,
  zeroLine,
  type ChartDatum,
  type ChartLabels,
  type ChartSeries,
  type ChartState,
  type ChartPaint,
  type ChartTrack,
} from "./chart"

export interface BarChartProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title" | "children"> {
  /** `{ label, value }` for one series, or `{ label, values: { [key]: n } }` with `series`. `null` or a missing key is no data, never zero. */
  data: ChartDatum[]
  /** `{ key, label, color, compare }`. Slots go series-1 to series-6 in this order; a comparison is a grey dashed marker. */
  series?: ChartSeries[]
  /** One bar per category with the series stacked in it. Only when the parts make a whole. */
  stacked?: boolean
  /** For a stack: `auto` names two to four stacked series beside the last bar, `end` names every one, `none` leaves it to the legend. */
  labels?: ChartLabels
  /** What the chart shows: its accessible name and the hidden table's caption. Inside a ChartFigure, the figure's heading. */
  title?: string
  /** The takeaway in one sentence: the chart's accessible description. Inside a ChartFigure, the figure's takeaway. */
  summary?: string
  /** `loading` shows a skeleton the chart's size; `empty` and `error` show their message in its place. */
  state?: ChartState
  /** What the empty state says. Shown by itself whenever there is no data. */
  empty?: string
  /** What the error state says. Name the system that failed. */
  error?: string
  /** Adds Try again to the error state. */
  onRetry?: () => void
  /** The chart's height in px, category labels included. */
  height?: number
  /** The exact number style: tooltip, announcement and hidden table. */
  format?: NumberStyle
  /** The rounded style on the axis. Defaults to the compact form of `format`. */
  axisFormat?: NumberStyle
  /** The hidden table's first column heading. */
  labelHeading?: string
}

const TOP = 10
const AXIS = 24
const BAR_MAX = 26
const GAP = 2
const RADIUS = 4

interface Bar {
  key: string
  d: string
  paint: ChartPaint
  series: string
  index: number
}

function layout(
  tracks: ChartTrack[],
  categories: string[],
  width: number,
  height: number,
  stacked: boolean,
  labels: ChartLabels,
  measure: (text: string) => number,
  axisFormat: NumberStyle,
  format: NumberStyle
) {
  const n = categories.length
  const plain = tracks.filter((t) => !t.compare)
  const compare = tracks.filter((t) => t.compare)
  const domain: number[] = []
  for (let i = 0; i < n; i++) {
    let pos = 0
    let neg = 0
    for (const t of plain) {
      const v = t.values[i]
      if (v === null) continue
      if (!stacked) domain.push(v)
      else if (v > 0) pos += v
      else neg += v
    }
    if (stacked) domain.push(pos, neg)
    for (const t of compare) if (t.values[i] !== null) domain.push(t.values[i] as number)
  }

  const plotH = Math.max(48, height - TOP - AXIS)
  const scale = niceScale(domain, plotH)
  const tickText = tickLabels(scale.ticks, axisFormat, format)
  const gutter = Math.ceil(Math.max(16, ...tickText.map(measure))) + 8
  const y = (v: number) => TOP + ((scale.hi - v) / (scale.hi - scale.lo)) * plotH

  // A stack of two to four is named beside its last bar, when the chart is wide enough to keep the plot.
  let last = -1
  for (let i = n - 1; i >= 0 && last < 0; i--) if (plain.some((t) => t.values[i] !== null && t.values[i] !== 0)) last = i
  const named = stacked && labels !== "none" && last >= 0 && (labels === "end" || (plain.length >= 2 && plain.length <= 4))
  const labelW = named ? Math.max(...plain.map((t) => measure(t.label))) : 0
  const barWidth = (band: number) => (stacked ? Math.min(BAR_MAX, band * 0.6) : Math.max(1, Math.min(BAR_MAX, (band * 0.72 - GAP * (plain.length - 1)) / Math.max(1, plain.length))))
  let right = 0
  let direct = named && width >= 280
  if (direct) {
    right = labelW + 8
    for (let k = 0; k < 3; k++) {
      const band = (width - gutter - right) / n
      const slack = (band - barWidth(band)) / 2 + band * (n - 1 - last)
      right = Math.max(0, Math.ceil(8 + labelW - slack))
    }
    if (width - gutter - right < width * 0.55) {
      direct = false
      right = 0
    }
  }
  const plotW = Math.max(24, width - gutter - right)
  const band = plotW / n
  const bw = barWidth(band)
  const groupW = stacked ? bw : bw * plain.length + GAP * (plain.length - 1)
  const groupLeft = (i: number) => gutter + band * i + (band - groupW) / 2
  const zero = y(0)

  const bars: Bar[] = []
  const ends: Array<{ key: string; label: string; mid: number; right: number }> = []
  for (let i = 0; i < n; i++) {
    if (!stacked) {
      plain.forEach((t, j) => {
        const v = t.values[i]
        if (v === null) return
        const x = groupLeft(i) + j * (bw + GAP)
        // A real zero is a flat mark on the baseline; a missing value has no mark at all.
        const d = v === 0 ? barPath(x, bw, zero, zero - 2, 0) : barPath(x, bw, zero, y(v), RADIUS)
        bars.push({ key: `${t.key}-${i}`, d, paint: t.paint, series: t.key, index: i })
      })
      continue
    }
    let pos = 0
    let neg = 0
    const parts: Array<{ t: ChartTrack; from: number; to: number }> = []
    for (const t of plain) {
      const v = t.values[i]
      if (v === null || v === 0) continue
      const from = v > 0 ? pos : neg
      if (v > 0) pos += v
      else neg += v
      parts.push({ t, from, to: from + v })
    }
    const outerUp = [...parts].reverse().find((p) => p.to > 0)
    const outerDown = [...parts].reverse().find((p) => p.to < 0)
    const x = groupLeft(i)
    for (const p of parts) {
      const up = p.to > 0
      const end = y(p.to)
      const base = y(p.from) + (p.from === 0 ? 0 : up ? -GAP : GAP)
      if ((up ? base - end : end - base) < 0.75) continue
      bars.push({ key: `${p.t.key}-${i}`, d: barPath(x, bw, base, end, p === outerUp || p === outerDown ? RADIUS : 0), paint: p.t.paint, series: p.t.key, index: i })
      if (i === last) ends.push({ key: p.t.key, label: p.t.label, mid: (base + end) / 2, right: x + bw })
    }
  }

  const markers = compare.flatMap((t) =>
    t.values.flatMap((v, i) => (v === null ? [] : [{ key: `${t.key}-${i}`, x1: groupLeft(i) - 4, x2: groupLeft(i) + groupW + 4, y: y(v) }]))
  )

  const placed = direct ? spreadLabels(ends.map((e) => e.mid), 16, TOP, TOP + plotH) : []
  const named2 = direct
    ? ends.map((e, k) => {
        const x = e.right + 8
        const moved = Math.abs(placed[k] - e.mid) > 2
        return { key: e.key, text: e.label, x, y: placed[k], leader: moved ? ([e.right + 1, e.mid, x - 3, placed[k]] as const) : null }
      })
    : []

  const centres = categories.map((_, i) => gutter + band * (i + 0.5))
  const widths = categories.map((c) => measure(c))
  // A label centred under its bar unless that would push it out of the chart; thinning measures each
  // label where it will actually sit.
  const anchors = centres.map((c, i): "start" | "middle" | "end" => (c - widths[i] / 2 < 0 ? "start" : c + widths[i] / 2 > width ? "end" : "middle"))
  const middles = centres.map((c, i) => (anchors[i] === "start" ? widths[i] / 2 : anchors[i] === "end" ? width - widths[i] / 2 : c))
  const xLabels = thinLabels(middles, widths).map((i) => ({ i, anchor: anchors[i], x: anchors[i] === "start" ? 0 : anchors[i] === "end" ? width : centres[i] }))

  return {
    gutter,
    plotW,
    plotH,
    band,
    zero,
    groupLeft,
    groupW,
    ticks: scale.ticks.map((v, k) => ({ value: v, y: Math.round(y(v)) + 0.5, label: tickText[k] })),
    bars,
    markers,
    direct: named2,
    xLabels,
    indexAt: (x: number) => Math.max(0, Math.min(n - 1, Math.floor((x - gutter) / band))),
  }
}

/** Amounts across categories or days, grouped or stacked, drawn in SVG from data. */
export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {
    data,
    series,
    stacked = false,
    labels = "auto",
    title,
    summary,
    state = "ready",
    empty,
    error,
    onRetry,
    height = 240,
    format = "number",
    axisFormat,
    labelHeading = "Category",
    className,
    ...rest
  },
  ref
) {
  const [own, width] = useWidth<HTMLDivElement>()
  const merged = useMergedRef(ref, own)
  const probe = React.useRef<HTMLSpanElement | null>(null)
  const measure = useTextWidth(probe)
  const text = useChartText(title, summary, "Use the Left and Right arrow keys to move through the bars.")
  // One series with no `series` list is named after the chart, the figure's heading inside a ChartFigure.
  const tracks = React.useMemo(() => toTracks(data, series, text.caption ?? "Value"), [data, series, text.caption])
  const plain = tracks.filter((t) => !t.compare)
  const single = tracks.length === 1
  const withTotal = stacked && plain.length > 1
  const categories = data.map((d) => d.label)
  const hasData = tracks.some((t) => t.values.some((v) => v !== null))
  const view: ChartState = state === "ready" && !hasData ? "empty" : state
  const announce = useArrived(view === "error")
  const style = axisFormat ?? axisStyleFor(format)

  const totalAt = (i: number) => {
    const parts = plain.map((t) => t.values[i]).filter((v): v is number => v !== null)
    return parts.length ? parts.reduce((a, b) => a + b, 0) : null
  }
  const points = usePoints(data.length, (i) =>
    describePoint(
      categories[i],
      tracks.map((t) => ({ label: t.label, value: exact(t.values[i], format) })),
      i,
      data.length,
      single,
      withTotal ? exact(totalAt(i), format) : undefined
    )
  )

  const geo = React.useMemo(
    () => (view === "ready" ? layout(tracks, categories, width, height, stacked, labels, measure, style, format) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, tracks, data, width, height, stacked, labels, measure, style, format]
  )

  // A point past the end of new data is no point at all.
  const active = points.active !== null && points.active < data.length ? points.active : null
  return (
    <div ref={merged} data-slot="bar-chart" data-state={view} className={cn("@container relative flex w-full min-w-0 flex-col gap-3", className)} {...rest}>
      <span ref={probe} aria-hidden="true" className="invisible absolute type-caption tabular-nums" />
      {text.hidden}
      {view !== "ready" || !geo ? (
        <chart.Status
          state={view === "ready" ? "empty" : view}
          height={height}
          icon="ChartColumn"
          empty={empty}
          error={error}
          onRetry={onRetry}
          label={text.caption}
          announce={announce}
          loading={
            // Bars where the bars will be, rather than one block the chart's size: less mass in dark.
            <div aria-hidden="true" className="flex size-full items-end justify-around pb-6">
              {[46, 64, 52, 78, 60, 88, 70].map((h, i) => (
                <Skeleton key={i} className="w-6 rounded-t-xs rounded-b-none" style={{ height: `${h}%` }} />
              ))}
            </div>
          }
        />
      ) : (
        <>
          {tracks.length > 1 ? <chart.Legend tracks={tracks} mark="bar" /> : null}
          <div className="relative w-full" style={{ height }}>
            <div
              data-slot="chart-plot"
              role="application"
              aria-roledescription="chart"
              aria-labelledby={text.labelledBy}
              aria-label={text.labelledBy ? undefined : "Bar chart"}
              aria-describedby={text.describedBy}
              tabIndex={0}
              onKeyDown={points.onKeyDown}
              onBlur={points.onBlur}
              onPointerMove={(e) => points.fromPointer(e, geo.indexAt)}
              onPointerDown={(e) => points.fromPointer(e, geo.indexAt)}
              onPointerLeave={points.onPointerLeave}
              className="absolute inset-0 touch-pan-y rounded-xs"
            >
              <svg width={width} height={height} aria-hidden="true" focusable="false" className="block overflow-visible">
                {active !== null ? (
                  <rect
                    data-slot="chart-active"
                    x={geo.gutter + geo.band * active + 1}
                    y={TOP}
                    width={Math.max(0, geo.band - 2)}
                    height={geo.plotH}
                    rx="4"
                    className="fill-hover forced-colors:fill-none forced-colors:stroke-[Highlight]"
                  />
                ) : null}
                {geo.ticks.map((t) =>
                  t.value === 0 ? null : (
                    <line key={t.value} data-slot="chart-grid" x1={geo.gutter} x2={geo.gutter + geo.plotW} y1={t.y} y2={t.y} className={gridLine} shapeRendering="crispEdges" />
                  )
                )}
                {geo.ticks.map((t) => (
                  <text key={t.value} data-slot="chart-axis-label" x={geo.gutter - 8} y={t.y} dy="0.32em" textAnchor="end" className={axisText}>
                    {t.label}
                  </text>
                ))}
                {geo.bars.map((b) => (
                  <path key={b.key} data-slot="chart-bar" data-series={b.series} data-index={b.index} d={b.d} className={paintFill[b.paint]} />
                ))}
                {geo.markers.map((m) => (
                  <line
                    key={m.key}
                    data-slot="chart-compare"
                    x1={m.x1}
                    x2={m.x2}
                    y1={m.y}
                    y2={m.y}
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className={paintStroke.compare}
                  />
                ))}
                <line data-slot="chart-zero" x1={geo.gutter} x2={geo.gutter + geo.plotW} y1={Math.round(geo.zero) + 0.5} y2={Math.round(geo.zero) + 0.5} className={zeroLine} shapeRendering="crispEdges" />
                {geo.xLabels.map((l) => (
                  <text key={l.i} data-slot="chart-axis-label" x={l.x} y={TOP + geo.plotH + 7} dy="0.71em" textAnchor={l.anchor} className={axisText}>
                    {categories[l.i]}
                  </text>
                ))}
                {geo.direct.map((l) => (
                  <g key={l.key}>
                    {l.leader ? <line x1={l.leader[0]} y1={l.leader[1]} x2={l.leader[2]} y2={l.leader[3]} className="stroke-line-strong forced-colors:stroke-[CanvasText]" /> : null}
                    <text data-slot="chart-direct-label" x={l.x} y={l.y} dy="0.32em" strokeWidth="4" strokeLinejoin="round" paintOrder="stroke" className={cn(labelText, halo)}>
                      {l.text}
                    </text>
                  </g>
                ))}
              </svg>
              {active !== null ? (
                <chart.Tooltip
                  from={geo.groupLeft(active)}
                  to={geo.groupLeft(active) + geo.groupW}
                  top={TOP}
                  left={geo.gutter}
                  right={geo.gutter + geo.plotW}
                  title={categories[active]}
                  single={single}
                  rows={tracks.map((t) => ({
                    key: t.key,
                    paint: t.paint,
                    mark: t.compare ? "dash" : "bar",
                    label: t.label,
                    value: exact(t.values[active], format),
                    missing: t.values[active] === null,
                  }))}
                  total={withTotal ? exact(totalAt(active), format) : undefined}
                />
              ) : null}
            </div>
          </div>
          <div data-slot="chart-live" aria-live="polite" aria-atomic="true" className="sr-only">
            {points.said}
          </div>
          <chart.Table
            caption={text.caption}
            labelHeading={labelHeading}
            labels={categories}
            columns={[
              ...tracks.map((t) => ({ key: t.key, label: t.label, cells: t.values.map((v) => exact(v, format)) })),
              ...(withTotal ? [{ key: "total", label: "Total", cells: categories.map((_, i) => exact(totalAt(i), format)) }] : []),
            ]}
          />
        </>
      )}
    </div>
  )
})
