"use client"

// The parts every chart shares: the data types, series colours, the scale, the legend, the hidden
// table, the tooltip, keyboard focus through the points, and the loading, empty and error states.
// Nothing here is a component of its own, so only the types reach the system's index: the parts
// travel in the lower-case `chart` object, which tools/build-index.mjs leaves out.

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, type NumberStyle } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { Icon } from "./icon"

/** A series slot, `series-1` to `series-6`. A thing keeps its slot on every chart and after every filter. */
export type ChartSlot = 1 | 2 | 3 | 4 | 5 | 6

/** What a chart shows: its data, a skeleton the chart's size, the empty message, or the error. */
export type ChartState = "ready" | "loading" | "empty" | "error"

/** `auto` names two to four series beside the marks, `end` names every series, `none` leaves it to the legend. */
export type ChartLabels = "auto" | "end" | "none"

export interface ChartSeries {
  /** The key in each datum's `values`. */
  key: string
  label: string
  /** The series slot. Unset series take the free slots in order, never by rank. */
  color?: ChartSlot
  /** A comparison (last period, a target): grey and dashed, in chart-compare. */
  compare?: boolean
}

export interface ChartDatum {
  /** The category or period. */
  label: string
  /** The value, for one series. `null` or missing is no data, never zero. */
  value?: number | null
  /** A value per series key. `null` or a missing key is no data, never zero. */
  values?: Record<string, number | null | undefined>
}

/** What a mark is painted with: a series slot, the comparison grey, or the grey of "Other". */
export type ChartPaint = ChartSlot | "compare" | "other"

/** One series, resolved: its slot, and a value (or null for no data) at every point. */
export interface ChartTrack {
  key: string
  label: string
  paint: ChartPaint
  compare: boolean
  values: Array<number | null>
}

export const paintFill: Record<ChartPaint, string> = {
  1: "fill-series-1",
  2: "fill-series-2",
  3: "fill-series-3",
  4: "fill-series-4",
  5: "fill-series-5",
  6: "fill-series-6",
  compare: "fill-chart-compare forced-colors:fill-[CanvasText]",
  other: "fill-chart-compare",
}

// The series keep their colours in forced colours, but the comparison's grey would sink among the gridlines (which
// take GrayText there), so it takes the system's text colour and stays dashed.
export const paintStroke: Record<ChartPaint, string> = {
  1: "stroke-series-1",
  2: "stroke-series-2",
  3: "stroke-series-3",
  4: "stroke-series-4",
  5: "stroke-series-5",
  6: "stroke-series-6",
  compare: "stroke-chart-compare forced-colors:stroke-[CanvasText]",
  other: "stroke-chart-compare",
}

/** The light fill under a line: the series colour at a tenth. */
export const paintWash: Record<ChartPaint, string> = {
  1: "fill-series-1/10",
  2: "fill-series-2/10",
  3: "fill-series-3/10",
  4: "fill-series-4/10",
  5: "fill-series-5/10",
  6: "fill-series-6/10",
  compare: "fill-chart-compare/10",
  other: "fill-chart-compare/10",
}

/** Text drawn in a chart: a text role that holds 4.5:1 on the surface in both themes, and the system's text colour in forced colours. */
export const axisText = "type-caption fill-text-subtle tabular-nums forced-colors:fill-[CanvasText]"
export const labelText = "type-caption fill-text-muted forced-colors:fill-[CanvasText]"
/**
 * A stroke in the surface colour: the halo round a direct label (so a gridline never strikes through
 * the words), the ring round a marker, the gap between touching parts. In forced colours it follows
 * the system background. Pair with paintOrder="stroke" so it sits under the fill.
 */
export const halo = "stroke-surface forced-colors:stroke-[Canvas]"
/** Gridlines are hairlines in chart-grid; in forced colours they take the system's grey. */
export const gridLine = "stroke-chart-grid forced-colors:stroke-[GrayText]"
/** The zero line is darker than the grid, so negatives read as hanging below it. */
export const zeroLine = "stroke-line-strong forced-colors:stroke-[CanvasText]"

const finite = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null)

/**
 * Resolve the series a chart was given into tracks. Slots go in fixed order, explicit ones first
 * honoured; a seventh series and beyond fold into "Other". Comparisons take the comparison grey.
 */
export function toTracks(data: ChartDatum[], series: ChartSeries[] | undefined, fallbackLabel: string): ChartTrack[] {
  const list: ChartSeries[] = series && series.length ? series : [{ key: "value", label: fallbackLabel }]
  const read = (d: ChartDatum, s: ChartSeries, i: number) => (d.values ? finite(d.values[s.key]) : i === 0 ? finite(d.value) : null)
  const claimed = new Set(list.filter((s) => !s.compare && s.color).map((s) => s.color))
  const free = ([1, 2, 3, 4, 5, 6] as ChartSlot[]).filter((n) => !claimed.has(n))
  const out: ChartTrack[] = []
  const folded: ChartTrack[] = []
  let plain = 0
  list.forEach((s, i) => {
    const values = data.map((d) => read(d, s, i))
    if (s.compare) {
      out.push({ key: s.key, label: s.label, paint: "compare", compare: true, values })
      return
    }
    plain += 1
    if (plain > 6) {
      folded.push({ key: s.key, label: s.label, paint: "other", compare: false, values })
      return
    }
    out.push({ key: s.key, label: s.label, paint: s.color ?? free.shift() ?? "other", compare: false, values })
  })
  if (folded.length) {
    out.push({
      key: "other",
      label: "Other",
      paint: "other",
      compare: false,
      values: data.map((_, j) => {
        const parts = folded.map((t) => t.values[j]).filter((v): v is number => v !== null)
        return parts.length ? parts.reduce((a, b) => a + b, 0) : null
      }),
    })
  }
  return out
}

/**
 * A rounded value scale: steps of 1, 2 or 5 at a power of ten. Of the steps whose gridlines keep
 * 28px apart on this plot, it takes the one that fills the plot best with about one gridline per
 * 48px, so the bars and lines use the space and the axis stays calm. With `zero` (bars, areas,
 * anything near zero) the domain runs from zero or below, so negatives always have room.
 */
export function niceScale(values: number[], plotHeight: number, zero = true): { ticks: number[]; lo: number; hi: number } {
  let lo = zero ? Math.min(0, ...values) : Math.min(...values)
  let hi = zero ? Math.max(0, ...values) : Math.max(...values)
  if (lo === hi) {
    const pad = Math.abs(lo) * 0.1 || 1
    if (zero) hi = lo + pad
    else {
      lo -= pad
      hi += pad
    }
  }
  const span = hi - lo
  const most = Math.max(2, Math.floor(plotHeight / 28))
  const target = Math.max(3, Math.min(5, plotHeight / 48))
  const top = Math.floor(Math.log10(span))
  // Whole numbers (counts) never get a gridline between them: no "0.5 call-backs".
  const whole = values.every(Number.isInteger)
  let best: { step: number; first: number; last: number; score: number } | null = null
  for (let e = top - 2; e <= top + 1; e++) {
    for (const [m, plain] of [[1, 0.05], [2, 0.02], [5, 0.03]] as const) {
      const step = m * 10 ** e
      if (whole && step < 1) continue
      const first = Math.floor(lo / step + 1e-9)
      const last = Math.ceil(hi / step - 1e-9)
      const n = last - first
      if (n < 1 || n > most) continue
      // How much of the scale the data fills, less a cost for straying from the ideal gridline count.
      const score = span / (n * step) - 0.1 * Math.abs(n - target) + plain
      if (!best || score > best.score) best = { step, first, last, score }
    }
  }
  const { step, first, last } = best ?? { step: span, first: Math.floor(lo / span), last: Math.ceil(hi / span) }
  const places = Math.max(0, -Math.floor(Math.log10(step)))
  const ticks: number[] = []
  for (let k = first; k <= last; k++) ticks.push(Number((k * step).toFixed(places)))
  return { ticks, lo: ticks[0], hi: ticks[ticks.length - 1] }
}

/**
 * Whether a line's scale should hold zero: always under an area (its fill stands for an amount from
 * zero), when the values cross zero, and when they sit close enough to zero that the space is cheap.
 * Otherwise the scale fits the values, so a trend is not flattened against the floor.
 */
export function holdsZero(values: number[], area: boolean): boolean {
  if (area || !values.length) return true
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  if (lo <= 0 && hi >= 0) return true
  return Math.min(Math.abs(lo), Math.abs(hi)) <= 0.4 * Math.max(Math.abs(lo), Math.abs(hi))
}

/** The rounded style an axis uses for an exact style: compact for counts and money, the style itself otherwise. */
export function axisStyleFor(format: NumberStyle): NumberStyle {
  if (format === "currency") return "compact-currency"
  if (format === "number") return "compact"
  return format
}

/** Tick labels in the axis style, unless rounding would print two ticks alike; then the exact style. */
export function tickLabels(ticks: number[], style: NumberStyle, exact: NumberStyle): string[] {
  const labels = ticks.map((t) => formatNumber(t, style))
  return new Set(labels).size === labels.length ? labels : ticks.map((t) => formatNumber(t, exact))
}

/** Every nth label, so neighbours keep 8px apart. `fromEnd` keeps the last one, for time running left to right. */
export function thinLabels(centres: number[], widths: number[], fromEnd = false): number[] {
  const n = centres.length
  for (let k = 1; k <= n; k++) {
    const shown: number[] = []
    for (let i = 0; i < n; i++) if ((fromEnd ? n - 1 - i : i) % k === 0) shown.push(i)
    let fits = true
    for (let j = 1; j < shown.length && fits; j++) {
      const a = shown[j - 1]
      const b = shown[j]
      fits = centres[b] - centres[a] >= (widths[a] + widths[b]) / 2 + 8
    }
    if (fits) return shown
  }
  return n ? [fromEnd ? n - 1 : 0] : []
}

/**
 * Spread labels apart vertically so none overlap, keeping each as close to where it wants to be as
 * the others allow, inside [top, bottom]. Returns the placed centres in the input order.
 */
export function spreadLabels(wanted: number[], height: number, top: number, bottom: number): number[] {
  const order = wanted.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  const placed = order.map((o) => o.y)
  for (let j = 0; j < placed.length; j++) placed[j] = Math.max(placed[j], j ? placed[j - 1] + height : top + height / 2)
  const overflow = placed.length ? placed[placed.length - 1] - (bottom - height / 2) : 0
  if (overflow > 0) {
    placed[placed.length - 1] -= overflow
    for (let j = placed.length - 2; j >= 0; j--) placed[j] = Math.min(placed[j], placed[j + 1] - height)
  }
  const out: number[] = new Array(wanted.length)
  order.forEach((o, j) => (out[o.i] = placed[j]))
  return out
}

/** A bar from its baseline to its data end: the data end rounded, the baseline square. */
export function barPath(x: number, w: number, base: number, end: number, r: number): string {
  const h = Math.abs(base - end)
  const rr = Math.max(0, Math.min(r, w / 2, h))
  const n = (v: number) => Math.round(v * 100) / 100
  if (rr === 0) return `M${n(x)},${n(base)}H${n(x + w)}V${n(end)}H${n(x)}Z`
  if (end < base) {
    return `M${n(x)},${n(base)}V${n(end + rr)}A${n(rr)},${n(rr)} 0 0 1 ${n(x + rr)},${n(end)}H${n(x + w - rr)}A${n(rr)},${n(rr)} 0 0 1 ${n(x + w)},${n(end + rr)}V${n(base)}Z`
  }
  return `M${n(x)},${n(base)}V${n(end - rr)}A${n(rr)},${n(rr)} 0 0 0 ${n(x + rr)},${n(end)}H${n(x + w - rr)}A${n(rr)},${n(rr)} 0 0 0 ${n(x + w)},${n(end - rr)}V${n(base)}Z`
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/**
 * The element's own width, kept current by a ResizeObserver: a chart responds to its container,
 * never the window. Reads the layout width, so a zoomed canvas does not change the geometry.
 */
export function useWidth<T extends HTMLElement>(fallback = 640): [React.MutableRefObject<T | null>, number] {
  const ref = React.useRef<T | null>(null)
  const [width, setWidth] = React.useState(fallback)
  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      if (el.clientWidth) setWidth(el.clientWidth)
    }
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

let measuring: CanvasRenderingContext2D | null | undefined

/**
 * Measure text in the font a probe element is set in, so gutters and label spacing follow the
 * system's type tokens. Measures again when a web font finishes loading.
 */
export function useTextWidth(probe: React.RefObject<HTMLElement | null>): (text: string) => number {
  const [font, setFont] = React.useState("")
  const [loaded, setLoaded] = React.useState(0)
  useIsoLayoutEffect(() => {
    const el = probe.current
    if (el) {
      const s = getComputedStyle(el)
      setFont(`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`)
    }
    const fonts = typeof document !== "undefined" ? document.fonts : undefined
    if (!fonts?.addEventListener) return
    const again = () => setLoaded((n) => n + 1)
    fonts.addEventListener("loadingdone", again)
    return () => fonts.removeEventListener("loadingdone", again)
  }, [probe])
  return React.useCallback(
    (text: string) => {
      if (measuring === undefined) measuring = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d")
      if (!measuring || !font) return text.length * 7.5
      measuring.font = font
      // Tabular figures run a little wider than the canvas measures them.
      return Math.ceil(measuring.measureText(text).width * 1.04 + 1)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [font, loaded]
  )
}

/** What a ChartFigure hands the chart inside it: its heading and takeaway, which name and describe the chart. */
interface FigureInfo {
  titleId: string
  summaryId: string
  title: string
}

export const figureContext = React.createContext<FigureInfo | null>(null)

/**
 * The chart's accessible name and description. Inside a ChartFigure they are the figure's heading
 * and takeaway; on its own, the chart's `title` and `summary`, carried in hidden elements.
 */
export function useChartText(title: string | undefined, summary: string | undefined, keys?: string) {
  const figure = React.useContext(figureContext)
  const id = React.useId()
  const titleId = figure ? figure.titleId : title ? `${id}-title` : undefined
  const summaryId = figure ? figure.summaryId : summary ? `${id}-summary` : undefined
  const keysId = keys ? `${id}-keys` : undefined
  const hidden = (
    <>
      {!figure && title ? (
        <span id={titleId} hidden>
          {title}
        </span>
      ) : null}
      {!figure && summary ? (
        <span id={summaryId} hidden>
          {summary}
        </span>
      ) : null}
      {keys ? (
        <span id={keysId} hidden>
          {keys}
        </span>
      ) : null}
    </>
  )
  return {
    caption: figure ? figure.title : title,
    labelledBy: titleId,
    describedBy: [summaryId, keysId].filter(Boolean).join(" ") || undefined,
    hidden,
  }
}

/**
 * Keyboard focus and the pointer through a chart's points. Left and Right step, Home and End jump to
 * the ends, Escape hides the tooltip. Each keyboard step is announced through a polite live region;
 * the pointer shows the same tooltip and announces nothing.
 */
export function usePoints(count: number, describe: (index: number) => string) {
  const [active, setActive] = React.useState<number | null>(null)
  const [said, setSaid] = React.useState("")
  const go = (index: number) => {
    const next = Math.max(0, Math.min(count - 1, index))
    setActive(next)
    setSaid(describe(next))
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!count) return
    if (event.key === "Escape") {
      if (active !== null) {
        event.preventDefault()
        event.stopPropagation()
        setActive(null)
      }
      return
    }
    const next =
      event.key === "ArrowRight" ? (active === null ? 0 : active + 1)
      : event.key === "ArrowLeft" ? (active === null ? count - 1 : active - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? count - 1
      : null
    if (next === null) return
    event.preventDefault()
    go(next)
  }
  /** The pointer's index along the plot, from a pointer event and a function from x to index. */
  const fromPointer = (event: React.PointerEvent<HTMLElement>, indexAt: (x: number) => number) => {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    const scale = rect.width ? el.offsetWidth / rect.width : 1
    setActive(indexAt((event.clientX - rect.left) * scale))
  }
  return {
    active,
    said,
    onKeyDown,
    onBlur: () => setActive(null),
    // A lifted finger counts as leaving, which would hide a tapped tooltip at once: on touch it stays
    // until the next tap, or until a tap elsewhere takes focus away.
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "touch") setActive(null)
    },
    fromPointer,
  }
}

function Swatch({ paint, mark }: { paint: ChartPaint; mark: "bar" | "line" | "dash" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false" className="shrink-0">
      {mark === "bar" ? (
        <rect x="1" y="1" width="10" height="10" rx="2" className={paintFill[paint]} />
      ) : (
        <line
          x1="1"
          x2="11"
          y1="6"
          y2="6"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeDasharray={mark === "dash" ? "2.5 3" : undefined}
          className={paintStroke[paint]}
        />
      )}
    </svg>
  )
}

/** The legend: every series in plot order, its mark beside its name. Text never takes a series colour. */
function Legend({ tracks, mark }: { tracks: ChartTrack[]; mark: "bar" | "line" }) {
  return (
    <ul data-slot="chart-legend" aria-hidden="true" className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {tracks.map((t) => (
        <li key={t.key} className="flex items-center gap-1.5 type-caption text-text-muted">
          <Swatch paint={t.paint} mark={t.compare ? "dash" : mark} />
          {t.label}
        </li>
      ))}
    </ul>
  )
}

interface TableColumn {
  key: string
  label: string
  cells: string[]
}

/**
 * The same numbers as the chart, exact, in a visually hidden table whose first column names each row.
 * The wrapper is what hides it: a table ignores a 1px width and overflow, so `sr-only` on the table
 * itself would leave full-size cells laid out under the plot.
 */
function Table({ caption, labelHeading, labels, columns }: { caption?: string; labelHeading: string; labels: string[]; columns: TableColumn[] }) {
  return (
    <div className="sr-only">
      <table data-slot="chart-table">
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            <th scope="col">{labelHeading}</th>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={`${i}-${label}`}>
              <th scope="row">{label}</th>
              {columns.map((c) => (
                <td key={c.key}>{c.cells[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface TipRow {
  key: string
  paint: ChartPaint
  mark: "bar" | "line" | "dash"
  label: string
  value: string
  missing: boolean
}

/**
 * The tooltip at a point: the period, then each series with its value leading. It sits beside the
 * marks (`from` to `to` across the plot) and flips to stay inside the plot. Screen readers hear the
 * live region instead.
 */
function Tooltip({
  from,
  to,
  top,
  left,
  right,
  title,
  rows,
  total,
  single,
}: {
  from: number
  to: number
  top: number
  left: number
  right: number
  title: string
  rows: TipRow[]
  total?: string
  single: boolean
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const w = el.offsetWidth
    const after = to + 12
    const placed = after + w <= right ? after : Math.max(left, Math.min(from - 12 - w, right - w))
    el.style.left = `${Math.round(placed)}px`
    el.style.visibility = "visible"
  })
  return (
    <div
      ref={ref}
      data-slot="chart-tooltip"
      aria-hidden="true"
      className="pointer-events-none invisible absolute z-10 flex min-w-28 flex-col gap-1 rounded-sm border border-line bg-surface-raised px-3 py-2 shadow-md"
      style={{ top }}
    >
      <p className="type-caption whitespace-nowrap text-text-subtle">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-2 whitespace-nowrap">
            {single ? null : <Swatch paint={r.paint} mark={r.mark === "bar" ? "line" : r.mark} />}
            <span className={cn("tabular-nums", r.missing ? "type-meta text-text-muted" : "type-label text-text-strong")}>{r.value}</span>
            {single ? null : <span className="type-caption text-text-muted">{r.label}</span>}
          </li>
        ))}
      </ul>
      {total ? (
        <p className="flex items-center gap-2 whitespace-nowrap border-t border-line pt-1">
          <span className="type-label tabular-nums text-text-strong">{total}</span>
          <span className="type-caption text-text-muted">Total</span>
        </p>
      ) : null}
    </div>
  )
}

/**
 * True while a chart shows something that arrived after it mounted. An error that was already there
 * when the chart loaded is not announced; one that arrives while the person is there is. Call it in
 * the chart, which stays mounted, never in the status view, which comes and goes with the state.
 */
export function useArrived(flag: boolean) {
  const quiet = React.useRef(flag)
  React.useEffect(() => {
    if (!flag) quiet.current = false
  }, [flag])
  return flag && !quiet.current
}

const emptyDefault = "No data for this period."

/** Loading, empty and error, in the chart's own box so nothing jumps when the data arrives. */
function Status({
  state,
  height,
  icon,
  empty,
  error,
  onRetry,
  label,
  loading,
  announce = false,
}: {
  state: Exclude<ChartState, "ready">
  height: number
  icon: IconName
  empty?: string
  error?: string
  onRetry?: () => void
  label?: string
  loading?: React.ReactNode
  /** The error arrived while the person was there (useArrived), so it interrupts. */
  announce?: boolean
}) {
  if (state === "loading") {
    return (
      <div data-slot="chart-status" data-state="loading" className="relative w-full" style={{ height }}>
        {loading ?? <Skeleton aria-hidden="true" className="size-full rounded-sm" />}
        <span className="sr-only">{label ? `Loading ${label}` : "Loading"}</span>
      </div>
    )
  }
  if (state === "error") {
    return (
      <div data-slot="chart-status" data-state="error" className="flex w-full flex-col items-center justify-center gap-3 px-4 text-center" style={{ minHeight: height }}>
        <p role={announce ? "alert" : undefined} className="flex max-w-measure items-start gap-2 text-left type-body text-text">
          <Icon name="CircleAlert" className="mt-0.5 text-danger" />
          <span>{error || "The figures for this chart could not load."}</span>
        </p>
        {onRetry ? (
          <Button size="sm" icon="RotateCcw" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    )
  }
  return (
    <div data-slot="chart-status" data-state="empty" className="flex w-full flex-col items-center justify-center gap-2 px-4 text-center" style={{ minHeight: height }}>
      <Icon name={icon} size={20} className="text-text-subtle" />
      <p className="max-w-measure type-body text-text-muted">{empty || emptyDefault}</p>
    </div>
  )
}

/** The chart's text for a screen reader: "March: This year $12,400, Last year $10,900. 3 of 12." */
export function describePoint(label: string, parts: Array<{ label: string; value: string }>, index: number, count: number, single: boolean, total?: string) {
  const values = single ? parts[0]?.value ?? "" : parts.map((p) => `${p.label} ${p.value}`).join(", ")
  return `${label}: ${values}${total ? `, total ${total}` : ""}. ${formatNumber(index + 1)} of ${formatNumber(count)}.`
}

/** A value as the table and the tooltip print it: exact, or "No data" when there is none. */
export const exact = (value: number | null, format: NumberStyle) => (value === null ? "No data" : formatNumber(value, format))

/** The parts, together, so one import brings them all and none reaches the system's index. */
export const chart = { Legend, Table, Tooltip, Status, Swatch }
