"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatTime, formatTimeRange } from "@/lib/format"
import { LOCALE, TIME as TIME_STYLE } from "@/lib/format-locale"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Badge } from "./badge"
import { Button } from "./button"
import { Icon } from "./icon"
import { IconButton } from "./icon-button"
import { SegmentedControl } from "./segmented-control"
import { Tooltip } from "./tooltip"

export type ScheduleView = "day" | "week"
export type ScheduleColor = 1 | 2 | 3 | 4 | 5 | 6 | "grey"

export interface ScheduleEvent {
  id: string
  /** Who or what, as people say it: "[Sam Lee]", "[Service the boiler]". */
  title: string
  /** When it starts, in local time: "2026-11-03T09:00", or a Date. */
  start: string | Date
  /** When it ends. */
  end: string | Date
  /** A second line: the role, the site, the client. */
  meta?: string
  /** The category's series slot, 1 to 6, the colour Tag and the charts give it. Grey when unset. */
  color?: ScheduleColor | `${1 | 2 | 3 | 4 | 5 | 6}`
  /** Opens the shift or job. Without it, onEventClick makes it a button. */
  href?: string
}

export interface ScheduleProps {
  /** The shifts or jobs. Those outside the days shown are left out. */
  events: ScheduleEvent[]
  /** Names the schedule: "Roster", "Bookings". */
  label: string
  /** Day or Week, when the page holds it (in the URL). */
  view?: ScheduleView
  /** The view at first, when the schedule holds it. Week by default. */
  defaultView?: ScheduleView
  onViewChange?: (view: ScheduleView) => void
  /** Any day in the period shown, when the page holds it: "2026-11-03". */
  date?: string | Date
  /** The day shown at first, when the schedule holds it. Today by default. */
  defaultDate?: string | Date
  onDateChange?: (date: Date) => void
  /** The day to treat as today, for a design pinned to a date. The real today by default. */
  today?: string | Date
  /** The first hour the grid shows. It reaches earlier for an event that starts earlier. */
  startHour?: number
  /** The hour the grid ends at. It reaches later for an event that ends later. */
  endHour?: number
  /** Opens an event that has no href. */
  onEventClick?: (id: string) => void
  /** The level of the period's heading; each day's heading in the phone list is one below. */
  headingLevel?: 2 | 3 | 4
  /** Skeleton blocks in the grid, said once as Loading. */
  loading?: boolean
  /** The events could not load: say which system failed. Events given stay, as the last good copy. */
  error?: React.ReactNode
  /** What a period with no events says. */
  empty?: React.ReactNode
  className?: string
}

const FILL: Record<string, string> = {
  "1": "bg-tag-1",
  "2": "bg-tag-2",
  "3": "bg-tag-3",
  "4": "bg-tag-4",
  "5": "bg-tag-5",
  "6": "bg-tag-6",
  grey: "bg-tag-grey",
}
const DOT: Record<string, string> = {
  "1": "bg-series-1",
  "2": "bg-series-2",
  "3": "bg-series-3",
  "4": "bg-series-4",
  "5": "bg-series-5",
  "6": "bg-series-6",
  grey: "bg-text-subtle",
}

// Regions whose week starts on Sunday, for a browser without Intl's week data. Everywhere else starts on Monday.
const SUNDAY_FIRST = new Set(["US", "CA", "MX", "BR", "JP", "KR", "TW", "HK", "IL", "PH", "IN", "ZA", "SA"])

/** The first day of the week in the market's locale, as Date.getDay() counts: 1, Monday, in en-AU. */
function firstDayOfWeek(locale: string) {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } }
    const info = typeof loc.getWeekInfo === "function" ? loc.getWeekInfo() : loc.weekInfo
    if (info?.firstDay) return info.firstDay % 7
    const region = loc.maximize().region
    return region && SUNDAY_FIRST.has(region) ? 0 : 1
  } catch {
    return 1
  }
}

/** A date from a prop: "2026-11-03" is that day in local time (Date would read it as UTC), anything else as Date reads it. */
function toDate(v: string | Date | null | undefined): Date | null {
  if (v instanceof Date) return Number.isNaN(+v) ? null : new Date(+v)
  if (typeof v !== "string" || !v.trim()) return null
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim())
  if (day) return new Date(+day[1], +day[2] - 1, +day[3])
  const d = new Date(v)
  return Number.isNaN(+d) ? null : d
}
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const minutesInto = (d: Date, day: Date) => (+d - +day) / 60000

const formats = new Map<string, Intl.DateTimeFormat>()
function fmt(options: Intl.DateTimeFormatOptions) {
  const key = JSON.stringify(options)
  let f = formats.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat(LOCALE, options)
    formats.set(key, f)
  }
  return f
}
// The written system joins ranges with "to" in English; another language keeps its own way.
const ENGLISH = /^en\b/i.test(LOCALE)

/** A range in the locale's own order, joined with "to" in English, as the written system has ranges. */
function range(options: Intl.DateTimeFormatOptions, a: Date, b: Date) {
  const f = fmt(options)
  if (typeof f.formatRangeToParts !== "function") return `${f.format(a)} ${ENGLISH ? "to" : "–"} ${f.format(b)}`
  if (!ENGLISH) return f.formatRange(a, b)
  const parts = f.formatRangeToParts(a, b)
  const end = parts.findIndex((p) => p.source === "endRange")
  return parts.map((p, i) => (i === end - 1 && p.type === "literal" && p.source === "shared" ? " to " : p.value)).join("")
}
const TIME: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" }
const HOUR: Intl.DateTimeFormatOptions = { hour: "numeric" }
/** A time, or a span of time, without minutes when it falls on the hour: 7 am to 3 pm, 7:00 am to 12:30 pm. */
// In English, the brand's own way with times (TIME in lib/format-locale.js), on the hour without minutes
// unless the brand keeps them: 9.30am, 11am to 10.30pm. Another language keeps the locale's own.
const SPAN = TIME_STYLE.onTheHour === "drop" ? "drop" : "pair"
const timeOf = (d: Date) => (ENGLISH ? formatTime(d, { onTheHour: "drop" }) : fmt(d.getMinutes() ? TIME : HOUR).format(d))
const spanOf = (a: Date, b: Date) => (ENGLISH ? formatTimeRange(a, b, { onTheHour: SPAN }) : range(a.getMinutes() || b.getMinutes() ? TIME : HOUR, a, b))
const LONG_DAY: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }
const WEEK_STARTS = firstDayOfWeek(LOCALE)

/** The first day of the week a date falls in. */
const weekOf = (d: Date) => addDays(d, -((d.getDay() - WEEK_STARTS + 7) % 7))
/** The period's name: "2 to 8 November 2026", or "Tuesday 3 November 2026". */
const periodOf = (view: ScheduleView, d: Date) =>
  view === "day" ? fmt(LONG_DAY).format(d) : range({ day: "numeric", month: "long", year: "numeric" }, weekOf(d), addDays(weekOf(d), 6))

interface Placed {
  event: ScheduleEvent
  start: Date
  end: Date
  slot: string
  /** The grid row it starts in, and where in that hour, as a share of it. */
  hour: number
  offset: number
  /** Its length in hours, within the grid. */
  span: number
  /** Its place among the events that start in the same slot, which sit side by side. */
  lane: number
  lanes: number
  /** How many earlier events it overlaps, each drawn under it and showing at its left. */
  depth: number
  time: string
  name: string
}

type Target = { day: number; hour: number; index: number }

/** Whether any line inside is cut short, across or down, kept current as it resizes and as fonts arrive. */
function useCut(box: React.RefObject<HTMLElement | null>) {
  const [cut, setCut] = React.useState(false)
  React.useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      if (!el.isConnected) return
      const lines = Array.from(el.querySelectorAll<HTMLElement>("[data-measure]"))
      setCut(lines.some((s) => s.scrollWidth > s.clientWidth + 1 || s.scrollHeight > s.clientHeight + 1) || el.scrollHeight > el.clientHeight + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    let live = true
    document.fonts?.ready.then(() => {
      if (live) measure()
    })
    return () => {
      live = false
      observer.disconnect()
    }
  }, [box])
  return cut
}

interface GridEventProps {
  p: Placed
  view: ScheduleView
  target: string
  tabbable: boolean
  onFocus: () => void
  link: React.ElementType
  onEventClick?: (id: string) => void
}

/**
 * One event on the grid, placed over the hours it covers. Narrow, its lines end in an ellipsis; with room,
 * the title takes two lines. Anything cut short shows in full in a tooltip, on hover, focus and a long press.
 */
function GridEvent({ p, view, target, tabbable, onFocus, link: Link, onEventClick }: GridEventProps) {
  const box = React.useRef<HTMLElement | null>(null)
  const cut = useCut(box)
  // Container widths here are the event's own, inside its padding.
  const fits = "truncate @min-[64px]/event:line-clamp-2 @min-[64px]/event:whitespace-normal"
  const props: Record<string, unknown> = {
    ref: box,
    "data-slot": "schedule-event",
    "data-color": p.slot,
    "data-target": target,
    tabIndex: tabbable ? 0 : -1,
    onFocus,
    "aria-label": p.name,
    className: cn(
      "@container/event flex size-full min-h-6 flex-col overflow-hidden rounded-sm border border-transparent px-2 py-1 text-left",
      "transition-shadow duration-(--duration-fast) hover:shadow-sm focus-visible:outline-offset-[-2px]",
      // An event drawn over another is ringed in the surface, so the two read apart.
      p.depth > 0 && "ring-2 ring-surface",
      FILL[p.slot]
    ),
  }
  const content = (
    <>
      <span className="flex min-w-0 items-start gap-1.5">
        <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full forced-color-adjust-none @max-[48px]/event:hidden", view === "day" ? "mt-1.5" : "mt-1", DOT[p.slot])} />
        <span data-measure="" className={cn("min-w-0 text-text-strong", view === "day" ? "type-label" : "type-caption", p.span >= 1 ? fits : "truncate")}>
          {p.event.title}
        </span>
      </span>
      {/* Spaces between the lines, so the visible text reads as the name does: "Annual service 9:00 to 10:00" (WCAG 2.5.3). */}
      {p.span >= 0.75 ? " " : null}
      {p.span >= 0.75 ? (
        <span data-measure="" className={cn("min-w-0 text-text", view === "day" ? "type-meta" : "type-caption", p.span >= 1.5 ? fits : "truncate")}>
          {p.time}
        </span>
      ) : null}
      {view === "day" && p.event.meta && p.span >= 1 ? " " : null}
      {view === "day" && p.event.meta && p.span >= 1 ? (
        <span data-measure="" className="truncate type-meta text-text">
          {p.event.meta}
        </span>
      ) : null}
    </>
  )
  return (
    <div
      data-slot="schedule-event-place"
      className="absolute has-[:focus-visible]:z-40!"
      style={{
        top: `calc(var(--hour) * ${p.offset} + 1px)`,
        height: `calc(var(--hour) * ${p.span} - 3px)`,
        // Each overlapped event shows as a strip at the left, up to 24px wide.
        left: `calc(${p.depth} * min(18%, 24px) + ${p.lane} * (100% - ${p.depth} * min(18%, 24px)) / ${p.lanes} + 3px)`,
        width: `calc((100% - ${p.depth} * min(18%, 24px)) / ${p.lanes} - 6px)`,
        zIndex: 10 + p.depth,
      }}
    >
      <Tooltip content={cut ? p.name : null} className="size-full">
        {p.event.href ? (
          <Link href={p.event.href} {...props}>
            {content}
          </Link>
        ) : (
          <button type="button" onClick={() => onEventClick?.(p.event.id)} {...props}>
            {content}
          </button>
        )}
      </Tooltip>
    </div>
  )
}

/** A string a screen reader hears again when it repeats: a live region skips text that has not changed. */
function useAnnouncer() {
  const [message, setMessage] = React.useState("")
  const turn = React.useRef(false)
  const say = React.useCallback((text: string) => {
    turn.current = !turn.current
    setMessage(turn.current ? text : `${text} `)
  }, [])
  return [message, say] as const
}

/**
 * Shifts or jobs on a time grid, by day or week, in the market's locale. The grid is one tab stop: the
 * arrows move from slot to slot, landing on each event, and every event reads its title and time.
 * Under 640px of its own width it becomes a list by day.
 */
export const Schedule = React.forwardRef<HTMLDivElement, ScheduleProps>(function Schedule(
  {
    events,
    label,
    view,
    defaultView = "week",
    onViewChange,
    date,
    defaultDate,
    onDateChange,
    today,
    startHour = 7,
    endHour = 19,
    onEventClick,
    headingLevel = 2,
    loading = false,
    error,
    empty = "Nothing scheduled.",
    className,
  },
  ref
) {
  const Link = useLink() as React.ElementType
  const level = String(headingLevel) === "3" ? 3 : String(headingLevel) === "4" ? 4 : 2
  const Heading = `h${level}` as const
  const DayHeading = (["h3", "h4", "h5"] as const)[level - 2]

  const now = toDate(today) ?? new Date()
  const [ownView, setOwnView] = React.useState<ScheduleView>(defaultView === "day" ? "day" : "week")
  const shown: ScheduleView = view === "day" || view === "week" ? view : ownView
  const [ownDate, setOwnDate] = React.useState(() => startOfDay(toDate(defaultDate) ?? now))
  const anchor = startOfDay(toDate(date) ?? ownDate)
  const first = shown === "week" ? weekOf(anchor) : anchor
  const days = Array.from({ length: shown === "week" ? 7 : 1 }, (_, i) => addDays(first, i))
  const after = addDays(first, days.length)
  const period = periodOf(shown, anchor)
  const step = shown === "week" ? 7 : 1

  const [message, say] = useAnnouncer()
  const list = Array.isArray(events) ? events : []

  // Every event in the days shown, with the hours the grid must cover to hold them all.
  const inPeriod = list
    .map((event) => ({ event, start: toDate(event.start), end: toDate(event.end) }))
    .filter((e): e is { event: ScheduleEvent; start: Date; end: Date } => Boolean(e.start && e.end && +e.end > +e.start && +e.start < +after && +e.end > +first))
    .sort((a, b) => +a.start - +b.start || +b.end - +a.end)
  let fromHour = Math.max(0, Math.min(23, Math.floor(Number(startHour) || 0)))
  let toHour = Math.max(fromHour + 1, Math.min(24, Math.ceil(Number(endHour) || 24)))
  // Each day's part of each event widens the grid, so a shift past midnight shows on both days.
  for (const e of inPeriod) {
    for (const day of days) {
      if (+e.start >= +addDays(day, 1) || +e.end <= +day) continue
      fromHour = Math.min(fromHour, Math.floor(Math.max(0, minutesInto(e.start, day)) / 60))
      toHour = Math.max(toHour, Math.min(24, Math.ceil(Math.min(1440, minutesInto(e.end, day)) / 60)))
    }
  }
  const hours = Array.from({ length: toHour - fromHour }, (_, i) => fromHour + i)

  // Each day's events on the grid. Events that start in the same slot sit side by side, as the arrows
  // pass through them; one that starts later while another runs is drawn over it, indented, so both
  // names stay readable.
  const placed: Placed[][] = days.map((day) => {
    const top = fromHour * 60
    const bottom = toHour * 60
    const dayItems = inPeriod
      .filter((e) => +e.start < +addDays(day, 1) && +e.end > +day)
      .map((e) => {
        const a = Math.max(top, minutesInto(e.start, day))
        const b = Math.min(bottom, minutesInto(e.end, day))
        const slot = String(e.event.color ?? "grey")
        const time = spanOf(e.start, e.end)
        return {
          event: e.event,
          start: e.start,
          end: e.end,
          slot: slot in FILL ? slot : "grey",
          hour: Math.floor((a - top) / 60),
          offset: ((a - top) % 60) / 60,
          span: Math.max(b - a, 15) / 60,
          lane: 0,
          lanes: 1,
          depth: 0,
          time,
          name: [e.event.title, time, e.event.meta].filter(Boolean).join(", "),
          a,
          b,
        }
      })
      .filter((p) => p.b > p.a)
    const groups = new Map<number, typeof dayItems>()
    for (const p of dayItems) groups.set(p.hour, [...(groups.get(p.hour) ?? []), p])
    const done: Array<{ depth: number; end: number }> = []
    for (const [, group] of [...groups].sort((x, y) => x[0] - y[0])) {
      const startsAt = Math.min(...group.map((p) => p.a))
      const under = done.filter((g) => g.end > startsAt)
      // Three indents at most, so a long run of overlaps never squeezes an event to nothing.
      const depth = under.length ? Math.min(3, Math.max(...under.map((g) => g.depth)) + 1) : 0
      group.forEach((p, i) => Object.assign(p, { lane: i, lanes: group.length, depth }))
      done.push({ depth, end: Math.max(...group.map((p) => p.b)) })
    }
    return dayItems
  })
  // What each slot holds: the events that start in it, in lane order, or nothing.
  const starts = placed.map((dayEvents) => hours.map((_, h) => dayEvents.filter((p) => p.hour === h).sort((x, y) => x.lane - y.lane)))
  const targetsIn = (d: number, h: number) => Math.max(1, starts[d]?.[h]?.length ?? 0)

  const [active, setActive] = React.useState<Target | null>(null)
  const table = React.useRef<HTMLTableElement | null>(null)
  const moveFocus = React.useRef(false)
  const todayIndex = days.findIndex((d) => sameDay(d, now))
  const firstIn = (d: number) => {
    const h = starts[d]?.findIndex((s) => s.length > 0) ?? -1
    return h >= 0 ? { day: d, hour: h, index: 0 } : null
  }
  let target: Target
  if (active && active.day < days.length && active.hour < hours.length) {
    target = { ...active, index: Math.min(active.index, targetsIn(active.day, active.hour) - 1) }
  } else if (todayIndex >= 0) {
    target = firstIn(todayIndex) ?? { day: todayIndex, hour: 0, index: 0 }
  } else {
    target = days.map((_, d) => firstIn(d)).find(Boolean) ?? { day: 0, hour: 0, index: 0 }
  }
  const isTarget = (d: number, h: number, i: number) => target.day === d && target.hour === h && target.index === i

  React.useLayoutEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    table.current?.querySelector<HTMLElement>(`[data-target="${target.day}-${target.hour}-${target.index}"]`)?.focus()
  })

  const go = (day: number, hour: number, index: number) => {
    const d = Math.max(0, Math.min(days.length - 1, day))
    const h = Math.max(0, Math.min(hours.length - 1, hour))
    const i = Math.max(0, Math.min(targetsIn(d, h) - 1, index))
    moveFocus.current = true
    setActive({ day: d, hour: h, index: i })
  }
  // The grid pattern: arrows move a slot and stop at the edges. Events that start in the same slot sit
  // side by side, so Right and Left pass through them first.
  const onGridKey = (event: React.KeyboardEvent) => {
    const { day: d, hour: h, index: i } = target
    let handled = true
    switch (event.key) {
      case "ArrowDown":
        go(d, h + 1, 0)
        break
      case "ArrowUp":
        go(d, h - 1, 0)
        break
      case "ArrowRight":
        if (i < targetsIn(d, h) - 1) go(d, h, i + 1)
        else if (d < days.length - 1) go(d + 1, h, 0)
        break
      case "ArrowLeft":
        if (i > 0) go(d, h, i - 1)
        else if (d > 0) go(d - 1, h, targetsIn(d - 1, h) - 1)
        break
      // Home and End go to the first and last day in the row; with Ctrl, to the grid's first and last slot.
      case "Home":
        go(0, event.ctrlKey ? 0 : h, 0)
        break
      case "End":
        go(days.length - 1, event.ctrlKey ? hours.length - 1 : h, 0)
        break
      default:
        handled = false
    }
    if (handled) event.preventDefault()
  }

  // A new period is said once, politely, so the person hears where they are now. It is the period the
  // schedule then shows, so a page holding the date that does not move it never hears a false one.
  const navigated = React.useRef(false)
  React.useEffect(() => {
    if (!navigated.current) return
    navigated.current = false
    say(`Showing ${period}.`)
  }, [period, say])
  const changeDate = (next: Date) => {
    const day = startOfDay(next)
    navigated.current = true
    if (date === undefined) setOwnDate(day)
    setActive(null)
    onDateChange?.(day)
  }
  const changeView = (next: string) => {
    const v: ScheduleView = next === "day" ? "day" : "week"
    navigated.current = true
    if (view === undefined) setOwnView(v)
    setActive(null)
    onViewChange?.(v)
  }

  const eventElement = (p: Placed, key: string | undefined, props: Record<string, unknown>, children: React.ReactNode) =>
    p.event.href ? (
      <Link key={key} href={p.event.href} aria-label={p.name} {...props}>
        {children}
      </Link>
    ) : (
      <button key={key} type="button" aria-label={p.name} onClick={() => onEventClick?.(p.event.id)} {...props}>
        {children}
      </button>
    )

  const total = placed.reduce((n, d) => n + d.length, 0)
  const nothing = !loading && total === 0
  const weekdayShort = fmt({ weekday: "short" })
  const dayNumber = fmt({ day: "numeric" })
  const dayLong = fmt({ weekday: "long", day: "numeric", month: "long" })
  // In English the brand's own way, 7am or 7 am; another language keeps its locale's.
  const hourLabel = ENGLISH ? { format: (d: Date) => formatTime(d, { onTheHour: "drop" }) } : fmt({ hour: "numeric" })

  return (
    <div ref={ref} data-slot="schedule" data-view={shown} aria-busy={loading || undefined} className={cn("@container flex min-w-0 flex-col gap-4", className)}>
      <div data-slot="schedule-header" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <Heading data-slot="schedule-period" className="type-heading-lg text-balance text-text-strong">
          {period}
        </Heading>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => changeDate(now)}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <IconButton icon="ChevronLeft" size="sm" label={shown === "week" ? "Previous week" : "Previous day"} onClick={() => changeDate(addDays(anchor, -step))} />
            <IconButton icon="ChevronRight" size="sm" label={shown === "week" ? "Next week" : "Next day"} onClick={() => changeDate(addDays(anchor, step))} />
          </div>
          <SegmentedControl
            size="sm"
            label="View"
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
            ]}
            value={shown}
            onChange={changeView}
          />
        </div>
      </div>

      {error != null && !loading ? (
        <p data-slot="schedule-error" className="flex items-start gap-2 type-body text-text">
          <span className="flex h-5 items-center text-danger">
            <Icon name="CircleAlert" />
          </span>
          <span>{error}</span>
        </p>
      ) : null}
      {nothing ? (
        <p data-slot="schedule-empty" className="type-body text-text-muted">
          {empty}
        </p>
      ) : null}
      {loading ? (
        <span role="status" className="sr-only">
          Loading {label}
        </span>
      ) : null}

      {/* From 640px of its own width: the time grid. */}
      <div data-slot="schedule-grid" className="overflow-x-auto rounded-md border border-line bg-surface @max-[639px]:hidden">
        <table
          ref={table}
          role="grid"
          aria-label={`${label}, ${period}`}
          aria-readonly="true"
          onKeyDown={onGridKey}
          className="w-full table-fixed border-separate border-spacing-0 [--hour:3rem] pointer-coarse:[--hour:4rem]"
        >
          <colgroup>
            <col className="w-16" />
            {days.map((_, d) => (
              <col key={d} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="border-b border-line">
                <span className="sr-only">Time</span>
              </th>
              {days.map((day, d) => {
                const isToday = sameDay(day, now)
                return (
                  <th
                    key={d}
                    scope="col"
                    aria-current={isToday ? "date" : undefined}
                    data-slot="schedule-day"
                    className="border-b border-l border-line px-3 py-2.5 text-left"
                  >
                    <span aria-hidden="true" className="flex items-center gap-1.5">
                      <span className="type-meta text-text-muted">{weekdayShort.format(day)}</span>
                      <span
                        data-slot="schedule-day-number"
                        className={cn(
                          "type-label tabular-nums",
                          isToday
                            ? "inline-flex size-7 items-center justify-center rounded-full bg-primary text-on-primary forced-colors:border-2 forced-colors:border-[color:Highlight]"
                            : "text-text-strong"
                        )}
                      >
                        {dayNumber.format(day)}
                      </span>
                    </span>
                    <span className="sr-only">
                      {dayLong.format(day)}
                      {isToday ? ", today" : ""}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {hours.map((hourOfDay, h) => (
              <tr key={hourOfDay}>
                <th scope="row" data-slot="schedule-hour" className={cn("border-line pt-1.5 pr-2.5 text-right align-top type-caption text-text-subtle", h > 0 && "border-t")}>
                  {hourLabel.format(new Date(2000, 0, 1, hourOfDay))}
                </th>
                {days.map((day, d) => {
                  const here = starts[d][h]
                  const continuing = placed[d].filter((p) => p.hour < h && p.hour + p.offset + p.span > h)
                  return (
                    <td
                      key={d}
                      data-slot="schedule-slot"
                      data-target={here.length ? undefined : `${d}-${h}-0`}
                      tabIndex={here.length ? undefined : isTarget(d, h, 0) ? 0 : -1}
                      onFocus={(event) => {
                        if (event.target === event.currentTarget) setActive({ day: d, hour: h, index: 0 })
                      }}
                      className={cn(
                        "relative h-(--hour) border-l border-line p-0 align-top",
                        h > 0 && "border-t",
                        "focus-visible:z-20 focus-visible:outline-offset-[-2px]"
                      )}
                    >
                      {continuing.length ? (
                        <span className="sr-only">{continuing.map((p) => `${p.event.title}, until ${timeOf(p.end)}`).join("; ")}</span>
                      ) : null}
                      {loading && h === (d % 3 === 1 ? 1 : 0) ? (
                        <Skeleton className="absolute inset-x-1 top-1 z-10" style={{ height: `calc(var(--hour) * ${Math.min(2, hours.length - h)} - 8px)` }} />
                      ) : null}
                      {here.map((p, i) => (
                        <GridEvent
                          key={p.event.id}
                          p={p}
                          view={shown}
                          target={`${d}-${h}-${i}`}
                          tabbable={isTarget(d, h, i)}
                          onFocus={() => setActive({ day: d, hour: h, index: i })}
                          link={Link}
                          onEventClick={onEventClick}
                        />
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Under 640px of its own width: a list by day. Tab moves through the events. */}
      <div data-slot="schedule-list" className="flex flex-col gap-5 @min-[640px]:hidden">
        {days.map((day, d) => {
          const isToday = sameDay(day, now)
          const dayEvents = placed[d]
          return (
            <div key={d} className="flex flex-col gap-2">
              <DayHeading aria-current={isToday ? "date" : undefined} className="flex items-center gap-2 type-heading-sm text-text-strong">
                {dayLong.format(day)}
                {isToday ? (
                  <>
                    <span className="sr-only">, </span>
                    <Badge tone="info" size="sm">
                      Today
                    </Badge>
                  </>
                ) : null}
              </DayHeading>
              {loading ? (
                <Skeleton className="h-16 rounded-md" />
              ) : dayEvents.length ? (
                <ul className="flex flex-col gap-2">
                  {dayEvents.map((p) => (
                    <li key={p.event.id}>
                      {eventElement(
                        p,
                        undefined,
                        {
                          "data-slot": "schedule-list-event",
                          className: cn(
                            "flex min-h-11 w-full items-start gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-shadow duration-(--duration-fast) hover:shadow-sm",
                            FILL[p.slot]
                          ),
                        },
                        <>
                          <span aria-hidden="true" className={cn("mt-1.5 size-2 shrink-0 rounded-full forced-color-adjust-none", DOT[p.slot])} />
                          <span className="flex min-w-0 flex-col">
                            <span className="type-label text-text-strong">{p.event.title}</span>{" "}
                            <span className="type-meta text-text">
                              {p.time}
                              {p.event.meta ? `, ${p.event.meta}` : ""}
                            </span>
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="type-meta text-text-subtle">Nothing scheduled</p>
              )}
            </div>
          )
        })}
      </div>
      <p role="status" data-slot="schedule-status" className="sr-only">
        {message}
      </p>
    </div>
  )
})
