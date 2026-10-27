"use client"

import * as React from "react"

import type { NumberStyle } from "@/lib/format"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import {
  axisStyleFor,
  axisText,
  chart,
  describePoint,
  exact,
  gridLine,
  holdsZero,
  halo,
  labelText,
  niceScale,
  paintFill,
  paintStroke,
  paintWash,
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

export interface LineChartProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title" | "children"> {
  /** `{ label, value }` for one series, or `{ label, values: { [key]: n } }` with `series`. `null` or a missing key breaks the line. */
  data: ChartDatum[]
  /** `{ key, label, color, compare }`. Slots go series-1 to series-6 in this order; a comparison is grey and dashed. */
  series?: ChartSeries[]
  /** A light fill under the first series. */
  area?: boolean
  /** `auto` names two to four lines at their ends, `end` names every line, `none` leaves it to the legend. */
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
  /** The chart's height in px, period labels included. */
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
const END = 7

interface Line {
  key: string
  paint: ChartPaint
  compare: boolean
  paths: string[]
  dots: Array<[number, number]>
  wash: string[]
}

function layout(
  tracks: ChartTrack[],
  categories: string[],
  width: number,
  height: number,
  labels: ChartLabels,
  area: boolean,
  measure: (text: string) => number,
  axisFormat: NumberStyle,
  format: NumberStyle
) {
  const n = categories.length
  const domain = tracks.flatMap((t) => t.values.filter((v): v is number => v !== null))
  const plotH = Math.max(48, height - TOP - AXIS)
  const scale = niceScale(domain, plotH, holdsZero(domain, area))
  const tickText = tickLabels(scale.ticks, axisFormat, format)
  const gutter = Math.ceil(Math.max(16, ...tickText.map(measure))) + 8
  const y = (v: number) => TOP + ((scale.hi - v) / (scale.hi - scale.lo)) * plotH

  // Two to four lines are named at their ends, down to 280px wide, while the plot keeps most of the width.
  const named = labels !== "none" && (labels === "end" ? tracks.length >= 1 : tracks.length >= 2 && tracks.length <= 4)
  const labelW = named ? Math.max(...tracks.map((t) => measure(t.label))) : 0
  let right = named && width >= 280 ? END + 6 + labelW : END
  let direct = named && width >= 280
  if (direct && width - gutter - right < width * 0.55) {
    direct = false
    right = END
  }
  const plotW = Math.max(24, width - gutter - right)
  const x = (i: number) => gutter + (n > 1 ? (i * plotW) / (n - 1) : plotW / 2)
  // The zero line only where zero is on the scale; a fitted scale has its lowest gridline instead.
  const zero = scale.lo <= 0 && scale.hi >= 0 ? y(0) : null
  const r = (v: number) => Math.round(v * 100) / 100

  const lines: Line[] = tracks.map((t, ti) => {
    const runs: Array<Array<[number, number]>> = []
    let run: Array<[number, number]> = []
    t.values.forEach((v, i) => {
      if (v === null) {
        if (run.length) runs.push(run)
        run = []
      } else run.push([r(x(i)), r(y(v))])
    })
    if (run.length) runs.push(run)
    const first = !t.compare && tracks.findIndex((u) => !u.compare) === ti
    return {
      key: t.key,
      paint: t.paint,
      compare: t.compare,
      paths: runs.filter((p) => p.length > 1).map((p) => `M${p.map(([a, b]) => `${a},${b}`).join("L")}`),
      // A point with no neighbour still shows: a dot, since a line needs two.
      dots: runs.filter((p) => p.length === 1).map((p) => p[0]),
      wash:
        area && first && zero !== null
          ? runs.filter((p) => p.length > 1).map((p) => `M${p[0][0]},${r(zero)}L${p.map(([a, b]) => `${a},${b}`).join("L")}L${p[p.length - 1][0]},${r(zero)}Z`)
          : [],
    }
  })

  const lastOf = (t: ChartTrack) => {
    for (let i = t.values.length - 1; i >= 0; i--) if (t.values[i] !== null) return i
    return -1
  }
  const ends = tracks.map((t) => {
    const i = lastOf(t)
    return { key: t.key, paint: t.paint, compare: t.compare, label: t.label, i, x: i >= 0 ? x(i) : 0, y: i >= 0 ? y(t.values[i] as number) : 0 }
  }).filter((e) => e.i >= 0)
  const placed = direct ? spreadLabels(ends.map((e) => e.y), 16, TOP, TOP + plotH) : []
  const tags = direct
    ? ends.map((e, k) => {
        const lx = gutter + plotW + END + 6
        const away = Math.abs(placed[k] - e.y) > 2 || e.i < n - 1
        return { key: e.key, text: e.label, x: lx, y: placed[k], leader: away ? ([e.x + 6, e.y, lx - 4, placed[k]] as const) : null }
      })
    : []

  const centres = categories.map((_, i) => x(i))
  const widths = categories.map((c) => measure(c))
  // A label that would slide under the value axis starts at its point instead; one past the edge ends
  // there. Thinning measures each label where it will actually sit.
  const anchors = centres.map((c, i): "start" | "middle" | "end" => (c - widths[i] / 2 < gutter - 2 ? "start" : c + widths[i] / 2 > width ? "end" : "middle"))
  const middles = centres.map((c, i) => (anchors[i] === "start" ? c + widths[i] / 2 : anchors[i] === "end" ? width - widths[i] / 2 : c))
  const xLabels = thinLabels(middles, widths, true).map((i) => ({ i, anchor: anchors[i], x: anchors[i] === "end" ? width : centres[i] }))

  const step = n > 1 ? plotW / (n - 1) : plotW
  return {
    gutter,
    plotW,
    plotH,
    zero,
    x,
    y,
    ticks: scale.ticks.map((v, k) => ({ value: v, y: Math.round(y(v)) + 0.5, label: tickText[k] })),
    lines,
    ends: ends.filter((e) => !e.compare),
    tags,
    xLabels,
    indexAt: (px: number) => (n > 1 ? Math.max(0, Math.min(n - 1, Math.round((px - gutter) / step))) : 0),
  }
}

/** A trend over time, with an optional comparison series, drawn in SVG from data. */
export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(function LineChart(
  {
    data,
    series,
    area = false,
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
    labelHeading = "Period",
    className,
    ...rest
  },
  ref
) {
  const [own, width] = useWidth<HTMLDivElement>()
  const merged = useMergedRef(ref, own)
  const probe = React.useRef<HTMLSpanElement | null>(null)
  const measure = useTextWidth(probe)
  const text = useChartText(title, summary, "Use the Left and Right arrow keys to move through the points.")
  // One series with no `series` list is named after the chart, the figure's heading inside a ChartFigure.
  const tracks = React.useMemo(() => toTracks(data, series, text.caption ?? "Value"), [data, series, text.caption])
  const single = tracks.length === 1
  const categories = data.map((d) => d.label)
  const hasData = tracks.some((t) => t.values.some((v) => v !== null))
  const view: ChartState = state === "ready" && !hasData ? "empty" : state
  const announce = useArrived(view === "error")
  const style = axisFormat ?? axisStyleFor(format)

  const points = usePoints(data.length, (i) =>
    describePoint(
      categories[i],
      tracks.map((t) => ({ label: t.label, value: exact(t.values[i], format) })),
      i,
      data.length,
      single
    )
  )

  const geo = React.useMemo(
    () => (view === "ready" ? layout(tracks, categories, width, height, labels, area, measure, style, format) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, tracks, data, width, height, labels, area, measure, style, format]
  )

  // A point past the end of new data is no point at all.
  const active = points.active !== null && points.active < data.length ? points.active : null
  return (
    <div ref={merged} data-slot="line-chart" data-state={view} className={cn("@container relative flex w-full min-w-0 flex-col gap-3", className)} {...rest}>
      <span ref={probe} aria-hidden="true" className="invisible absolute type-caption tabular-nums" />
      {text.hidden}
      {view !== "ready" || !geo ? (
        <chart.Status
          state={view === "ready" ? "empty" : view}
          height={height}
          icon="ChartLine"
          empty={empty}
          error={error}
          onRetry={onRetry}
          label={text.caption}
          announce={announce}
          loading={
            // A soft area where the line will be, rather than one block the chart's size.
            <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100" preserveAspectRatio="none" className="block size-full">
              <path
                data-slot="skeleton"
                d="M0,72 C10,66 18,74 30,62 S50,46 62,52 S82,36 100,30 L100,90 L0,90 Z"
                className="animate-pulse fill-chart-track"
              />
            </svg>
          }
        />
      ) : (
        <>
          {tracks.length > 1 ? <chart.Legend tracks={tracks} mark="line" /> : null}
          <div className="relative w-full" style={{ height }}>
            <div
              data-slot="chart-plot"
              role="application"
              aria-roledescription="chart"
              aria-labelledby={text.labelledBy}
              aria-label={text.labelledBy ? undefined : "Line chart"}
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
                {geo.zero !== null ? (
                  <line
                    data-slot="chart-zero"
                    x1={geo.gutter}
                    x2={geo.gutter + geo.plotW}
                    y1={Math.round(geo.zero) + 0.5}
                    y2={Math.round(geo.zero) + 0.5}
                    className={zeroLine}
                    shapeRendering="crispEdges"
                  />
                ) : null}
                {geo.lines.flatMap((l) => l.wash.map((d, k) => <path key={`${l.key}-wash-${k}`} data-slot="chart-area" d={d} className={paintWash[l.paint]} />))}
                {active !== null ? (
                  <line
                    data-slot="chart-active"
                    x1={Math.round(geo.x(active)) + 0.5}
                    x2={Math.round(geo.x(active)) + 0.5}
                    y1={TOP}
                    y2={TOP + geo.plotH}
                    className="stroke-line-control forced-colors:stroke-[Highlight]"
                    shapeRendering="crispEdges"
                  />
                ) : null}
                {/* Comparisons first, so the series sit on top of them. */}
                {[...geo.lines.filter((l) => l.compare), ...geo.lines.filter((l) => !l.compare)].map((l) => (
                  <g key={l.key} data-slot="chart-series" data-series={l.key}>
                    {l.paths.map((d, k) => (
                      <path
                        key={k}
                        data-slot="chart-line"
                        d={d}
                        fill="none"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={l.compare ? "4 6" : undefined}
                        className={paintStroke[l.paint]}
                      />
                    ))}
                    {l.dots.map(([cx, cy], k) => (
                      <circle key={k} data-slot="chart-dot" cx={cx} cy={cy} r="4" strokeWidth="4" paintOrder="stroke" className={cn(paintFill[l.paint], halo)} />
                    ))}
                  </g>
                ))}
                {/* Markers wear a 2px ring in the surface colour, painted under the fill so the dot keeps its full size. */}
                {geo.ends.map((e) => (
                  <circle key={e.key} data-slot="chart-end" cx={e.x} cy={e.y} r="4" strokeWidth="4" paintOrder="stroke" className={cn(paintFill[e.paint], halo)} />
                ))}
                {active !== null
                  ? tracks.map((t) =>
                      t.values[active] === null ? null : (
                        <circle
                          key={t.key}
                          data-slot="chart-marker"
                          cx={geo.x(active)}
                          cy={geo.y(t.values[active] as number)}
                          r="4.5"
                          strokeWidth="4"
                          paintOrder="stroke"
                          className={cn(paintFill[t.paint], halo)}
                        />
                      )
                    )
                  : null}
                {geo.xLabels.map((l) => (
                  <text key={l.i} data-slot="chart-axis-label" x={l.x} y={TOP + geo.plotH + 7} dy="0.71em" textAnchor={l.anchor} className={axisText}>
                    {categories[l.i]}
                  </text>
                ))}
                {geo.tags.map((l) => (
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
                  from={geo.x(active)}
                  to={geo.x(active)}
                  top={TOP}
                  left={geo.gutter}
                  right={geo.gutter + geo.plotW}
                  title={categories[active]}
                  single={single}
                  rows={tracks.map((t) => ({
                    key: t.key,
                    paint: t.paint,
                    mark: t.compare ? "dash" : "line",
                    label: t.label,
                    value: exact(t.values[active], format),
                    missing: t.values[active] === null,
                  }))}
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
            columns={tracks.map((t) => ({ key: t.key, label: t.label, cells: t.values.map((v) => exact(v, format)) }))}
          />
        </>
      )}
    </div>
  )
})
