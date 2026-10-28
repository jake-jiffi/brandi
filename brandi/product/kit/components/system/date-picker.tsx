"use client"

import * as React from "react"
import type { DateRange, Matcher } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { inputBare, inputBox } from "@/components/ui/input"
import { Popover as PopoverRoot, PopoverAnchor, PopoverContent, PopoverTrigger, popoverContentVariants } from "@/components/ui/popover"
import { LOCALE } from "@/lib/format-locale"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { useFieldControl } from "./field"
import { IconButton } from "./icon-button"

// --- Dates in the market's locale ------------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, "0")

/** "2026-10-21" to a local date at noon, so no daylight-saving edge moves it; anything else is undefined. */
function fromIso(value?: string | null): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""))
  if (!m) return undefined
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12)
  return d.getMonth() === Number(m[2]) - 1 ? d : undefined
}
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)

const numeric = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" })
const sampleParts = numeric.formatToParts(new Date(2026, 9, 21, 12))
/** The locale's order of day, month and year, as people type them: en-AU is day first. */
const ORDER = sampleParts.filter((p) => p.type === "day" || p.type === "month" || p.type === "year").map((p) => p.type) as Array<"day" | "month" | "year">
const SEPARATOR = sampleParts.find((p) => p.type === "literal")?.value.trim() || "/"
/** The shape a typed date takes, such as dd/mm/yyyy. */
const PATTERN = ORDER.map((t) => (t === "day" ? "dd" : t === "month" ? "mm" : "yyyy")).join(SEPARATOR)

const longDate = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
const monthYear = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" })
const shortWeekday = new Intl.DateTimeFormat(LOCALE, { weekday: "short" })
const longWeekday = new Intl.DateTimeFormat(LOCALE, { weekday: "long" })
const dayNumber = new Intl.DateTimeFormat(LOCALE, { day: "numeric" })

// Month names people may type ("21 Oct", "October 21"), in the market's language.
const MONTH_WORDS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2026, i, 1, 12)
  return [new Intl.DateTimeFormat(LOCALE, { month: "long" }).format(d), new Intl.DateTimeFormat(LOCALE, { month: "short" }).format(d)].map((w) => w.toLowerCase().replace(/\./g, ""))
})

function build(year: number, month: number, day: number): Date | null {
  if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1000 && year <= 9999)) return null
  const d = new Date(year, month - 1, day, 12)
  return d.getMonth() === month - 1 && d.getDate() === day ? d : null
}
/** A two-digit year is this century's, unless that is more than 20 years ahead: 85 is 1985, 30 is 2030. */
function fullYear(y: string, today: Date) {
  const n = Number(y)
  if (y.length > 2) return n
  return 2000 + n > today.getFullYear() + 20 ? 1900 + n : 2000 + n
}

/**
 * A typed date, in the locale's order: 21/10/2026, 21.10.26, 21 10, 21102026, 21 Oct 2026, October 21 or
 * 2026-10-21. A missing year is this year. Null when it is not a date.
 */
function parseTyped(text: string, today = new Date()): Date | null {
  const t = text.trim().toLowerCase()
  if (!t) return null
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t)
  if (isoMatch) return build(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]))
  const nums = t.match(/\d+/g) ?? []
  const word = t.match(/\p{L}+/u)?.[0]
  if (word) {
    const month = MONTH_WORDS.findIndex((names) => names.some((n) => n.startsWith(word) || word.startsWith(n))) + 1
    if (!month || !nums.length || word.length < 3) return null
    return build(nums[1] ? fullYear(nums[1], today) : today.getFullYear(), month, Number(nums[0]))
  }
  let parts: string[] = nums
  if (parts.length === 1 && (parts[0].length === 6 || parts[0].length === 8)) {
    // Digits only, as a phone's number pad types them: two for the day, two for the month, the rest the year.
    const s = parts[0]
    const widths = ORDER.map((k) => (k === "year" ? s.length - 4 : 2))
    let at = 0
    parts = widths.map((w) => s.slice(at, (at += w)))
  }
  if (parts.length < 2 || parts.length > 3) return null
  const got: Record<string, string> = {}
  // Four digits first is a year first, whatever the locale's order: 2026/10/21.
  const yearFirst = parts.length === 3 && parts[0].length === 4
  const order = yearFirst ? (["year", "month", "day"] as const) : parts.length === 3 ? ORDER : ORDER.filter((k) => k !== "year")
  order.forEach((k, i) => (got[k] = parts[i]))
  return build(got.year ? fullYear(got.year, today) : today.getFullYear(), Number(got.month), Number(got.day))
}

/** The locale's first day of the week: Monday in en-AU, Sunday in en-US. */
function weekStart(): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  try {
    const locale = new Intl.Locale(LOCALE) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } }
    const info = locale.getWeekInfo?.() ?? locale.weekInfo
    if (info?.firstDay) return (info.firstDay % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6
  } catch {
    // An engine without week data falls through to the regions that start on Sunday.
  }
  const region = (LOCALE.split("-")[1] ?? "").toUpperCase()
  return ["US", "CA", "JP", "IL", "BR", "MX", "PH", "KR", "TW", "HK", "ZA", "IN"].includes(region) ? 0 : 1
}

function lowerFirst(label: string) {
  return /^[A-Z][a-z]/.test(label) ? label.charAt(0).toLowerCase() + label.slice(1) : label
}

/** Days outside min and max cannot be chosen, and the calendar does not page past them. */
function bounds(min?: Date, max?: Date) {
  const disabled: Matcher[] = []
  if (min) disabled.push({ before: min })
  if (max) disabled.push({ after: max })
  return {
    disabled: disabled.length ? disabled : undefined,
    startMonth: min ? new Date(min.getFullYear(), min.getMonth(), 1) : undefined,
    endMonth: max ? new Date(max.getFullYear(), max.getMonth(), 1) : undefined,
  }
}

/** What is wrong with a typed date, in words, or null. */
function problemWith(date: Date | null, min?: Date, max?: Date) {
  if (!date) return `Enter a date as ${PATTERN}`
  if (min && date < startOfDay(min)) return max ? `Choose a date from ${numeric.format(min)} to ${numeric.format(max)}` : `Choose a date on or after ${numeric.format(min)}`
  if (max && date > startOfDay(max)) return min ? `Choose a date from ${numeric.format(min)} to ${numeric.format(max)}` : `Choose a date on or before ${numeric.format(max)}`
  return null
}

// The calendar's words, in the market's locale, in the system's voice.
const calendarText = {
  formatters: {
    formatCaption: (d: Date) => monthYear.format(d),
    formatWeekdayName: (d: Date) => shortWeekday.format(d),
    formatDay: (d: Date) => dayNumber.format(d),
  },
  labels: {
    labelDayButton: (d: Date, m: { today?: boolean }) => `${m.today ? "Today, " : ""}${longDate.format(d)}`,
    labelGridcell: (d: Date, m?: { today?: boolean }) => `${m?.today ? "Today, " : ""}${longDate.format(d)}`,
    labelGrid: (d: Date) => monthYear.format(d),
    labelNext: () => "Next month",
    labelPrevious: () => "Previous month",
    labelNav: () => "Change month",
    labelWeekday: (d: Date) => longWeekday.format(d),
  },
}

// A still picture's month buttons: the same look, nothing to press, no tab stop.
const StillNavButton = ({ className, children }: React.HTMLAttributes<HTMLElement>) => (
  <span aria-hidden="true" className={className}>
    {children}
  </span>
)

interface PanelCalendarProps {
  /** single: one day. range: the days of a period, with a preview while the end is chosen. */
  mode: "single" | "range"
  selected?: Date | DateRange
  month?: Date
  min?: Date
  max?: Date
  numberOfMonths?: number
  onPick?: (day: Date) => void
  /** Extra modifiers, such as a range's preview. */
  modifiers?: Record<string, Matcher | Matcher[] | undefined>
  onDayHover?: (day: Date | null) => void
  /** Drawn for a design: days are text, the month buttons are pictures, nothing takes focus. */
  still?: boolean
  footer?: React.ReactNode
}

/** The calendar every date field opens: a grid in the locale's week, with the system's labels. */
function PanelCalendar({ mode, selected, month, min, max, numberOfMonths = 1, onPick, modifiers, onDayHover, still, footer }: PanelCalendarProps) {
  const limits = bounds(min, max)
  const common = {
    weekStartsOn: weekStart(),
    lang: LOCALE,
    numberOfMonths,
    // Beside another month, a month shows only its own days, so a period is never drawn twice.
    showOutsideDays: numberOfMonths === 1,
    defaultMonth: month,
    startMonth: limits.startMonth,
    endMonth: limits.endMonth,
    disabled: limits.disabled,
    formatters: calendarText.formatters,
    labels: calendarText.labels,
    footer,
    classNames: { footer: "px-1 pt-2 type-meta text-text-muted" },
  }
  if (still) {
    const range = mode === "range" ? (selected as DateRange | undefined) : undefined
    const picked: Record<string, Matcher | Matcher[] | undefined> =
      mode === "single"
        ? { selected: selected as Date | undefined }
        : range?.from && range.to
          ? { selected: { from: range.from, to: range.to }, range_start: range.from, range_end: range.to, range_middle: { after: range.from, before: range.to } }
          : { selected: range?.from }
    const all = Object.fromEntries(Object.entries({ ...picked, ...modifiers }).filter(([, v]) => v !== undefined)) as Record<string, Matcher | Matcher[]>
    return <Calendar {...common} disableNavigation modifiers={all} components={{ PreviousMonthButton: StillNavButton, NextMonthButton: StillNavButton }} />
  }
  const extra = Object.fromEntries(Object.entries(modifiers ?? {}).filter(([, v]) => v !== undefined)) as Record<string, Matcher | Matcher[]>
  const hover = onDayHover
    ? { onDayMouseEnter: (d: Date) => onDayHover(d), onDayFocus: (d: Date) => onDayHover(d), onDayMouseLeave: () => onDayHover(null) }
    : {}
  if (mode === "range") {
    return (
      <Calendar
        {...common}
        {...hover}
        autoFocus
        mode="range"
        selected={selected as DateRange | undefined}
        modifiers={extra}
        // Two picks, the product's own way: the first starts the period, the second ends it.
        onSelect={(_range, day) => onPick?.(day)}
      />
    )
  }
  return (
    <Calendar
      {...common}
      {...hover}
      autoFocus
      mode="single"
      required
      selected={selected as Date | undefined}
      modifiers={extra}
      onSelect={(_day, day) => onPick?.(day)}
    />
  )
}

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const tabStops = (root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter((el) => el.tabIndex >= 0 && !el.hasAttribute("data-radix-focus-guard") && !el.closest("[inert], [hidden]") && el.getClientRects().length > 0)

/**
 * Tab inside an open calendar panel keeps the page's order: Shift Tab from its first stop goes back to the button that
 * opened it, and Tab from its last goes on to whatever follows the field. Either way the panel closes.
 */
function onPanelTab(event: React.KeyboardEvent<HTMLElement>, field: HTMLElement | null, back: HTMLElement | null, close: () => void) {
  if (event.key !== "Tab" || !field) return
  const panel = event.currentTarget
  const stops = tabStops(panel)
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey ? active === stops[0] || active === panel : active === stops[stops.length - 1]) {
    event.preventDefault()
    if (event.shiftKey) {
      back?.focus()
    } else {
      const page = tabStops(document.body).filter((el) => !panel.contains(el))
      const after = page.filter((el) => field.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !field.contains(el))
      ;(after[0] ?? back)?.focus()
    }
    close()
  }
}

/** The panel's look, shared by the live popover and a design's still picture. */
const panelLook = "w-auto gap-0 p-2"

export const datePickerParts = {
  fromIso,
  toIso,
  parseTyped,
  numeric,
  longDate,
  PATTERN,
  lowerFirst,
  problemWith,
  startOfDay,
  PanelCalendar,
  onPanelTab,
  panelLook,
}

// --- DatePicker ------------------------------------------------------------------------------------------------

export interface DatePickerProps {
  /** The chosen date as yyyy-mm-dd, when the page holds it. */
  value?: string
  /** The date to start with, as yyyy-mm-dd, when the DatePicker holds it. */
  defaultValue?: string
  /** Called with the chosen date as yyyy-mm-dd, or "" when the field is cleared. */
  onChange?: (value: string) => void
  /** The earliest date that can be chosen, as yyyy-mm-dd. */
  min?: string
  /** The latest date that can be chosen, as yyyy-mm-dd. */
  max?: string
  /** The shape a typed date takes. The locale's own (dd/mm/yyyy in en-AU) by default. */
  placeholder?: string
  /** Design mode: draws the calendar open in place, for a board. Never in a product. */
  open?: boolean
  /** 32, 36 or 44px tall; 40, 44 or 48px on a touch screen. */
  size?: "sm" | "md" | "lg"
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  /** The form field's name: a hidden input carries the date as yyyy-mm-dd. */
  name?: string
  id?: string
  "aria-label"?: string
  /** aria-label as a canvas board writes it (attributes arrive in camelCase). */
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * A date, typed in the market's format or chosen from a calendar. The calendar opens in a portal from the button
 * at the end of the field, or from Down in the field; Escape closes it and a choice fills the field, with focus
 * back in the field either way. The ref is the input.
 */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { value, defaultValue, onChange, min: minProp, max: maxProp, placeholder, open: design = false, size = "md", invalid, disabled, required, name, id, "aria-label": ariaLabelProp, ariaLabel, className, style },
  ref
) {
  const [wrong, setWrong] = React.useState(false)
  const dayId = React.useId()
  const label = ariaLabelProp ?? ariaLabel
  const min = fromIso(minProp)
  const max = fromIso(maxProp)

  const input = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, input)
  const box = React.useRef<HTMLDivElement | null>(null)
  const button = React.useRef<HTMLButtonElement | null>(null)

  const [held, setHeld] = React.useState(defaultValue ?? "")
  const current = value ?? held
  const date = fromIso(current)
  const [text, setText] = React.useState(() => (date ? numeric.format(date) : ""))
  const [shown, setShown] = React.useState(false)
  // The day of the week shows beside a chosen date, and is read with it: 29/10/2026 alone leaves people counting.
  const settled = date && text === numeric.format(date) ? date : undefined
  const control = useFieldControl({ id, invalid: invalid || wrong, required, describedBy: settled ? dayId : undefined })
  const field = control.field
  // Named so it reads with any label, as it is written: "Open calendar, Starts", never "Choose starts".
  const named = field?.labelText ?? label
  const buttonName = named ? `Open calendar, ${named}` : "Open calendar"
  const panelName = named ? `Calendar, ${named}` : "Calendar"

  // A value set from outside shows at once, unless the person is typing in the field.
  const shownValue = React.useRef(current)
  React.useEffect(() => {
    if (shownValue.current === current) return
    shownValue.current = current
    if (input.current !== document.activeElement) setText(date ? numeric.format(date) : "")
  }, [current, date])

  const report = (message: string | null) => {
    setWrong(Boolean(message))
    field?.report(message)
    input.current?.setCustomValidity(message ?? "")
  }
  const commit = (next: Date | null) => {
    const iso = next ? toIso(next) : ""
    shownValue.current = iso
    report(null)
    setText(next ? numeric.format(next) : "")
    if (value === undefined) setHeld(iso)
    if (iso !== current) onChange?.(iso)
  }
  // Checked when the person leaves the field or presses Enter, never while they type.
  const check = () => {
    if (!text.trim()) return commit(null)
    const typed = parseTyped(text)
    const problem = problemWith(typed, min, max)
    if (problem) return report(problem)
    commit(typed)
  }
  const close = () => setShown(false)
  const openCalendar = () => {
    if (disabled) return
    // A date typed and not yet checked opens the calendar on that date.
    const typed = text.trim() ? parseTyped(text) : null
    if (typed && !problemWith(typed, min, max)) commit(typed)
    setShown(true)
  }

  const iconSize = size === "sm" ? "size-7 pointer-coarse:size-9" : undefined
  const fieldBox = (
    <div
      ref={box}
      data-slot="date-picker"
      // The design detector reads this field box as a card when it sits in a Card or FormSection and
      // reports "card inside card". It is a field, so the box carries the detector's own ignore. axe and
      // the scripted checks still run on everything inside it.
      data-impeccable-ignore="nested-cards"
      data-size={size}
      data-state={design || shown ? "open" : "closed"}
      className={cn(inputBox, "pr-0.5 pointer-coarse:pr-0.5")}
      onMouseDown={(event) => {
        if (event.target === box.current && !disabled) {
          event.preventDefault()
          input.current?.focus()
        }
      }}
    >
      <input
        ref={merged}
        type="text"
        autoComplete="off"
        value={text}
        placeholder={placeholder ?? PATTERN}
        disabled={disabled}
        aria-label={label}
        className={cn(inputBare, "tabular-nums")}
        {...control.props}
        required={control.required || undefined}
        onChange={(event) => {
          if (!design) setText(event.target.value)
        }}
        onBlur={() => {
          if (!design) check()
        }}
        onKeyDown={(event) => {
          if (design || disabled) return
          if (event.key === "Enter") check()
          else if (event.key === "ArrowDown") {
            event.preventDefault()
            openCalendar()
          }
        }}
      />
      {settled ? (
        <span aria-hidden="true" data-slot="date-picker-day" className="shrink-0 type-meta text-text-muted select-none">
          {shortWeekday.format(settled)}
        </span>
      ) : null}
      <span id={dayId} hidden>
        {settled ? longWeekday.format(settled) : ""}
      </span>
      {design ? (
        <IconButton icon="Calendar" label={buttonName} size="sm" className={iconSize} aria-expanded aria-haspopup="dialog" data-state="open" disabled={disabled} />
      ) : (
        <PopoverTrigger asChild>
          <IconButton ref={button} icon="Calendar" label={buttonName} size="sm" className={iconSize} disabled={disabled} />
        </PopoverTrigger>
      )}
    </div>
  )

  const calendarFor = (still: boolean) => (
    <PanelCalendar
      mode="single"
      selected={date}
      month={date ?? (min && new Date() < min ? min : max && new Date() > max ? max : undefined)}
      min={min}
      max={max}
      still={still}
      onPick={(day) => {
        commit(day)
        // Focus is back in the field before the panel goes, so the next key lands there.
        input.current?.focus()
        close()
      }}
    />
  )

  return (
    <div data-slot="date-picker-field" className={cn("relative w-full min-w-0", className)} style={style}>
      {design ? (
        <>
          {fieldBox}
          <div role="dialog" aria-label={panelName} data-slot="date-picker-panel" className={cn(popoverContentVariants({ look: "panel" }), panelLook, "absolute top-full right-0 mt-1.5")}>
            {calendarFor(true)}
          </div>
        </>
      ) : (
        <PopoverRoot
          open={shown}
          onOpenChange={(next) => {
            if (next) openCalendar()
            else close()
          }}
        >
          <PopoverAnchor asChild>{fieldBox}</PopoverAnchor>
          <PopoverContent
            align="end"
            data-slot="date-picker-panel"
            aria-label={panelName}
            className={panelLook}
            // The calendar puts focus on the chosen day, or today, itself.
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onEscapeKeyDown={() => input.current?.focus()}
            onInteractOutside={(event) => {
              // The button toggles the panel itself; a press on it is not a press outside.
              if (button.current?.contains(event.target as Node)) event.preventDefault()
            }}
            onKeyDown={(event) => onPanelTab(event, box.current, button.current, close)}
          >
            {calendarFor(false)}
          </PopoverContent>
        </PopoverRoot>
      )}
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  )
})
