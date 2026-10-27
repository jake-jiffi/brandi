"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

import { inputBare, inputBox } from "@/components/ui/input"
import { Popover as PopoverRoot, PopoverAnchor, PopoverContent, PopoverTrigger, popoverContentVariants } from "@/components/ui/popover"
import { LOCALE } from "@/lib/format-locale"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { datePickerParts } from "./date-picker"
import { useFieldControl } from "./field"
import { IconButton } from "./icon-button"

const { fromIso, toIso, parseTyped, numeric, PATTERN, lowerFirst, problemWith, PanelCalendar, onPanelTab, panelLook } = datePickerParts

const DAY = 86400000
const full = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", year: "numeric" })
const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / DAY) + 1
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12)

/** A period in words, in the market's order: 1 to 31 October 2026. */
function periodWords(from: Date, to: Date) {
  if (from.getTime() === to.getTime()) return full.format(from)
  // The locale writes a period with a dash; the system's copy says "to".
  return full.formatRange(from, to).replace(/\s*–\s*/, " to ")
}

const lastOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)

/**
 * The period a report compares with: the same dates a year before, or the period just before. A whole month
 * compares with the whole month before it (October with September); any other period with the same number of days.
 */
function comparison(from: Date, to: Date, compare: "previous" | "year") {
  if (compare === "year") return { from: new Date(from.getFullYear() - 1, from.getMonth(), from.getDate(), 12), to: new Date(to.getFullYear() - 1, to.getMonth(), Math.min(to.getDate(), lastOfMonth(new Date(to.getFullYear() - 1, to.getMonth(), 1)).getDate()), 12) }
  const months = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1
  if (from.getDate() === 1 && to.getTime() === lastOfMonth(to).getTime()) {
    const start = new Date(from.getFullYear(), from.getMonth() - months, 1, 12)
    return { from: start, to: lastOfMonth(new Date(from.getFullYear(), from.getMonth() - 1, 1)) }
  }
  const end = addDays(from, -1)
  return { from: addDays(end, -(daysBetween(from, to) - 1)), to: end }
}

export interface DateRangeValue {
  /** The first day, as yyyy-mm-dd. */
  from?: string
  /** The last day, as yyyy-mm-dd. */
  to?: string
}

export interface DateRangePreset {
  /** What the period is called: Last 7 days, This month, Last financial year. */
  label: string
  from: string
  to: string
}

export interface DateRangePickerProps {
  /** The period, as { from, to } in yyyy-mm-dd, when the page holds it. */
  value?: DateRangeValue
  /** The period to start with, when the DateRangePicker holds it. */
  defaultValue?: DateRangeValue
  /** Called with { from, to } whenever either end changes. */
  onChange?: (value: DateRangeValue) => void
  /** The earliest day that can be chosen, as yyyy-mm-dd. */
  min?: string
  /** The latest day that can be chosen, as yyyy-mm-dd. */
  max?: string
  /** Named periods to choose in one press, shown beside the calendar. */
  presets?: DateRangePreset[]
  /** Says what the period is compared with: the same number of days before it, or the same dates last year. */
  compare?: "previous" | "year"
  /** Design mode: draws the calendar open in place, for a board. Never in a product. */
  open?: boolean
  /** 32, 36 or 44px tall; 40, 44 or 48px on a touch screen. */
  size?: "sm" | "md" | "lg"
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  /** The form field's name: hidden inputs carry name[from] and name[to] as yyyy-mm-dd. */
  name?: string
  id?: string
  "aria-label"?: string
  /** aria-label as a canvas board writes it (attributes arrive in camelCase). */
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * A period for a report: two dates, typed or chosen with two picks on a calendar, and said in words under the
 * field (1 to 31 October 2026, 31 days), with what it is compared with when it is compared. The ref is the first
 * date's input.
 */
export const DateRangePicker = React.forwardRef<HTMLInputElement, DateRangePickerProps>(function DateRangePicker(
  { value, defaultValue, onChange, min: minProp, max: maxProp, presets, compare, open: design = false, size = "md", invalid, disabled, required, name, id, "aria-label": ariaLabelProp, ariaLabel, className, style },
  ref
) {
  const base = React.useId()
  const wordsId = `${base}-words`
  const startWord = `${base}-start`
  const endWord = `${base}-end`
  const [wrong, setWrong] = React.useState(false)
  const control = useFieldControl({ id, invalid: invalid || wrong, required, describedBy: wordsId })
  const field = control.field
  const label = ariaLabelProp ?? ariaLabel
  const what = field?.labelText ? lowerFirst(field.labelText) : label ? lowerFirst(label) : "dates"
  const min = fromIso(minProp)
  const max = fromIso(maxProp)

  const startInput = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, startInput)
  const endInput = React.useRef<HTMLInputElement | null>(null)
  const box = React.useRef<HTMLDivElement | null>(null)
  const button = React.useRef<HTMLButtonElement | null>(null)

  const [held, setHeld] = React.useState<DateRangeValue>(defaultValue ?? {})
  const current = value ?? held
  const from = fromIso(current.from)
  const to = fromIso(current.to)
  const [startText, setStartText] = React.useState(() => (from ? numeric.format(from) : ""))
  const [endText, setEndText] = React.useState(() => (to ? numeric.format(to) : ""))
  const [shown, setShown] = React.useState(false)
  // The calendar's own draft: the first pick starts a period, the second ends it.
  const [draft, setDraft] = React.useState<DateRange | undefined>()
  const [hover, setHover] = React.useState<Date | null>(null)

  const shownValue = React.useRef(`${current.from ?? ""}|${current.to ?? ""}`)
  React.useEffect(() => {
    const key = `${current.from ?? ""}|${current.to ?? ""}`
    if (shownValue.current === key) return
    shownValue.current = key
    const active = document.activeElement
    if (active !== startInput.current) setStartText(from ? numeric.format(from) : "")
    if (active !== endInput.current) setEndText(to ? numeric.format(to) : "")
  }, [current.from, current.to, from, to])

  const report = (message: string | null) => {
    setWrong(Boolean(message))
    field?.report(message)
    startInput.current?.setCustomValidity(message ?? "")
  }
  const commit = (next: { from?: Date; to?: Date }) => {
    const out: DateRangeValue = { from: next.from ? toIso(next.from) : undefined, to: next.to ? toIso(next.to) : undefined }
    shownValue.current = `${out.from ?? ""}|${out.to ?? ""}`
    report(null)
    setStartText(next.from ? numeric.format(next.from) : "")
    setEndText(next.to ? numeric.format(next.to) : "")
    if (value === undefined) setHeld(out)
    if (out.from !== current.from || out.to !== current.to) onChange?.(out)
  }
  // Both typed dates are checked when the person leaves either one or presses Enter, never while they type.
  const check = () => {
    const a = startText.trim() ? parseTyped(startText) : undefined
    const b = endText.trim() ? parseTyped(endText) : undefined
    const problem = (a !== undefined ? problemWith(a, min, max) : null) ?? (b !== undefined ? problemWith(b, min, max) : null)
    if (problem) return report(problem)
    if (a && b && b < a) return report("End the period on or after its first day")
    commit({ from: a ?? undefined, to: b ?? undefined })
  }

  const closeCalendar = () => {
    setShown(false)
    setDraft(undefined)
    setHover(null)
  }
  const openCalendar = () => {
    if (disabled) return
    setDraft(undefined)
    setShown(true)
  }
  const finish = (range: { from: Date; to: Date }) => {
    commit(range)
    // Focus is back in the field before the panel goes.
    startInput.current?.focus()
    closeCalendar()
  }
  const pick = (day: Date) => {
    if (!draft?.from || draft.to) {
      setDraft({ from: day, to: undefined })
      return
    }
    const [a, b] = day < draft.from ? [day, draft.from] : [draft.from, day]
    finish({ from: a, to: b })
  }

  // What the calendar shows: its draft while the person is choosing, the field's period otherwise.
  const showing: DateRange | undefined = draft ?? (from ? { from, to } : undefined)
  const previewing = draft?.from && !draft.to && hover ? (hover < draft.from ? { from: hover, to: draft.from } : { from: draft.from, to: hover }) : undefined
  const sentence = from && to ? `${periodWords(from, to)}, ${daysBetween(from, to)} ${daysBetween(from, to) === 1 ? "day" : "days"}` : from ? `From ${full.format(from)}. Choose the last day.` : to ? `Up to ${full.format(to)}. Choose the first day.` : ""
  const versus = from && to && compare ? (() => {
    const c = comparison(from, to, compare)
    return `vs ${periodWords(c.from, c.to)}`
  })() : ""
  const sayDays = (from: Date, to: Date) => `${daysBetween(from, to)} ${daysBetween(from, to) === 1 ? "day" : "days"}`
  const status = draft?.from && !draft.to ? `From ${full.format(draft.from)}. Choose the last day.` : showing?.from && showing.to ? `${periodWords(showing.from, showing.to)}, ${sayDays(showing.from, showing.to)}` : "Choose the first day."
  // The panel opens over the page, so the room it has is the screen's: two months side by side when they fit.
  const roomy = typeof window === "undefined" || window.innerWidth >= 720

  const presetList = (wide: boolean) =>
    presets?.length ? (
    <div role="group" aria-label="Periods" data-slot="date-range-presets" className={cn("flex gap-1 border-line", wide ? "w-40 shrink-0 flex-col border-r pr-2" : "flex-wrap border-b pb-2")}>
      {presets.map((p) => {
        const on = p.from === current.from && p.to === current.to
        const a = fromIso(p.from)
        const b = fromIso(p.to)
        return (
          <Button
            key={p.label}
            variant="ghost"
            size="sm"
            aria-pressed={on}
            // The period in the field is marked by a tick as well as the tint, so it never rides on colour alone.
            iconRight={on ? "Check" : undefined}
            className={cn(
              "justify-start aria-pressed:bg-selected-strong aria-pressed:text-text-strong forced-colors:aria-pressed:outline-2 forced-colors:aria-pressed:outline-solid forced-colors:aria-pressed:-outline-offset-2 [&>svg:last-child]:ml-auto [&>svg:last-child]:text-primary",
              wide && "w-full"
            )}
            // In a still picture the periods are shown, not offered: no tab stops, nothing to press.
            tabIndex={design ? -1 : undefined}
            onClick={design || !a || !b ? undefined : () => finish({ from: a, to: b })}
          >
            {p.label}
          </Button>
        )
      })}
    </div>
  ) : null

  const panelBody = (still: boolean) => {
    const wide = still || roomy
    return (
    <div className={cn("flex gap-2", wide ? "flex-row" : "flex-col")}>
      {presetList(wide)}
      <PanelCalendar
        mode="range"
        selected={showing}
        month={showing?.from ?? (min && new Date() < min ? min : undefined)}
        min={min}
        max={max}
        numberOfMonths={wide ? 2 : 1}
        modifiers={{ preview: previewing }}
        onDayHover={(day) => setHover((was) => (was?.getTime() === day?.getTime() ? was : day))}
        onPick={pick}
        still={still}
        footer={still ? undefined : status}
      />
    </div>
    )
  }

  const iconSize = size === "sm" ? "size-7 pointer-coarse:size-9" : undefined
  const inputProps = {
    type: "text",
    autoComplete: "off",
    placeholder: PATTERN,
    disabled,
    className: cn(inputBare, "w-[11ch] flex-none tabular-nums pointer-coarse:w-[12ch]"),
    onBlur: () => {
      if (!design) check()
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (design || disabled) return
      if (event.key === "Enter") check()
      else if (event.key === "ArrowDown") {
        event.preventDefault()
        openCalendar()
      }
    },
  }
  const namedBy = (word: string) => (field ? `${field.labelId} ${word}` : undefined)

  const fieldBox = (
    <div
      ref={box}
      role="group"
      aria-labelledby={field?.labelId}
      aria-label={field ? undefined : label}
      data-slot="date-range-picker"
      data-size={size}
      data-state={design || shown ? "open" : "closed"}
      className={cn(inputBox, "pr-0.5 pointer-coarse:pr-0.5")}
      onMouseDown={(event) => {
        if (event.target === box.current && !disabled) {
          event.preventDefault()
          startInput.current?.focus()
        }
      }}
    >
      <input
        ref={merged}
        {...inputProps}
        value={startText}
        aria-labelledby={namedBy(startWord)}
        aria-label={field ? undefined : `${label ?? "Period"} first day`}
        {...control.props}
        required={control.required || undefined}
        onChange={(event) => {
          if (!design) setStartText(event.target.value)
        }}
      />
      <span aria-hidden="true" className="shrink-0 text-text-muted">
        to
      </span>
      <input
        ref={endInput}
        {...inputProps}
        value={endText}
        aria-labelledby={namedBy(endWord)}
        aria-label={field ? undefined : `${label ?? "Period"} last day`}
        aria-describedby={control.props["aria-describedby"]}
        aria-invalid={control.props["aria-invalid"]}
        required={control.required || undefined}
        className={cn(inputProps.className, "flex-1")}
        onChange={(event) => {
          if (!design) setEndText(event.target.value)
        }}
      />
      <span id={startWord} hidden>
        first day
      </span>
      <span id={endWord} hidden>
        last day
      </span>
      {design ? (
        <IconButton icon="CalendarRange" label={`Choose ${what}`} size="sm" className={iconSize} aria-expanded aria-haspopup="dialog" data-state="open" disabled={disabled} />
      ) : (
        <PopoverTrigger asChild>
          <IconButton ref={button} icon="CalendarRange" label={`Choose ${what}`} size="sm" className={iconSize} disabled={disabled} />
        </PopoverTrigger>
      )}
    </div>
  )

  return (
    <div data-slot="date-range-picker-field" className={cn("relative flex w-full min-w-0 flex-col", className)} style={style}>
      {design ? (
        <>
          {fieldBox}
          {/* Drawn under the period's words, which stay readable on the board. */}
          <div role="dialog" aria-label={`Choose ${what}`} data-slot="date-range-picker-panel" className={cn(popoverContentVariants({ look: "panel" }), panelLook, "absolute top-full left-0 mt-1.5 w-max max-w-none")}>
            {panelBody(true)}
          </div>
        </>
      ) : (
        <PopoverRoot open={shown} onOpenChange={(next) => (next ? openCalendar() : closeCalendar())}>
          <PopoverAnchor asChild>{fieldBox}</PopoverAnchor>
          <PopoverContent
            align="start"
            data-slot="date-range-picker-panel"
            aria-label={`Choose ${what}`}
            className={panelLook}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onEscapeKeyDown={() => startInput.current?.focus()}
            onInteractOutside={(event) => {
              if (button.current?.contains(event.target as Node)) event.preventDefault()
            }}
            onKeyDown={(event) => onPanelTab(event, box.current, button.current, closeCalendar)}
          >
            {panelBody(false)}
          </PopoverContent>
        </PopoverRoot>
      )}
      {/* The period in words, read with both dates, and spoken when it changes, never on load. */}
      <p id={wordsId} data-slot="date-range-words" aria-live="polite" className="mt-1.5 type-meta text-text-muted empty:mt-0">
        {sentence}
        {versus ? <span className="text-text-subtle">{`, ${versus}`}</span> : null}
      </p>
      {name ? (
        <>
          <input type="hidden" name={`${name}[from]`} value={current.from ?? ""} />
          <input type="hidden" name={`${name}[to]`} value={current.to ?? ""} />
        </>
      ) : null}
    </div>
  )
})
