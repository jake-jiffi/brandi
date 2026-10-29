"use client"

import * as React from "react"

import { inputBare, inputBox } from "@/components/ui/input"
import { Popover as PopoverRoot, PopoverAnchor } from "@/components/ui/popover"
import { formatNumber, formatTime } from "@/lib/format"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { comboboxParts, stepOption, type ComboboxOption } from "./combobox"
import { useFieldControl } from "./field"

const { OptionList, Panel, PanelPicture, Toggle } = comboboxParts

const pad = (n: number) => String(n).padStart(2, "0")

/** Minutes after midnight to the market's way of writing a time: 9:30 pm in en-AU, 21:30 in en-GB. */
function label(minutes: number) {
  // Written the way the brand writes times (TIME in lib/format-locale.js): 9:30 am, or 9.30am.
  return formatTime(minutes)
}
const toValue = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
/** "21:30" to minutes after midnight; null for anything else. */
function fromValue(value?: string | null): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? ""))
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null
  return Number(m[1]) * 60 + Number(m[2])
}

/**
 * A typed time: 9, 930, 9:30, 9.30, 0930, 21:30, 2130, 9pm, 9:30 p.m. Without am or pm, a time that would land
 * before `after` reads as the afternoon (a finish of 5 after a start of 9 is 5 pm). Null when it is not a time.
 */
function parseTime(text: string, after: number | null): number | null {
  const t = text.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, "")
  if (!t) return null
  if (t === "noon" || t === "midday") return 12 * 60
  if (t === "midnight") return 0
  const m = /^(\d{1,2})(?:[:h]?(\d{2}))?(am|pm|a|p)?$/.exec(t)
  if (!m) return null
  let hour = Number(m[1])
  const minute = m[2] ? Number(m[2]) : 0
  const half = m[3]?.charAt(0)
  if (minute > 59) return null
  if (half) {
    if (hour < 1 || hour > 12) return null
    hour = (hour % 12) + (half === "p" ? 12 : 0)
  } else if (hour > 23) return null
  let minutes = hour * 60 + minute
  if (!half && after !== null && minutes <= after && hour < 12 && minutes + 720 > after) minutes += 720
  return minutes
}

export interface TimePickerProps {
  /** The chosen time as HH:mm (24 hour), when the page holds it. */
  value?: string
  /** The time to start with, as HH:mm, when the TimePicker holds it. */
  defaultValue?: string
  /** Called with the chosen time as HH:mm, or "" when the field is cleared. */
  onChange?: (value: string) => void
  /** Minutes between the times in the list. 15 by default. Any time can still be typed. */
  step?: number
  /** The earliest time in the list and the earliest accepted, as HH:mm. */
  min?: string
  /** The latest time in the list and the latest accepted, as HH:mm. */
  max?: string
  /** A start time, as HH:mm: the list begins after it and each time shows how long from it, in hours. */
  from?: string
  /** An example of the time to type ("9:30 am"), never an instruction. */
  placeholder?: string
  /** Design mode: draws the list open in place, for a board. Never in a product. */
  open?: boolean
  /** 32, 36 or 44px tall; 40, 44 or 48px on a touch screen. */
  size?: "sm" | "md" | "lg"
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  /** The form field's name: a hidden input carries the time as HH:mm. */
  name?: string
  id?: string
  "aria-label"?: string
  /** aria-label as a canvas board writes it (attributes arrive in camelCase). */
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * A time, typed or chosen from a list. Typing moves the list to the nearest time and any time can be typed; Up and
 * Down move, Enter takes it, Escape closes. Times read in the market's locale. The ref is the input.
 */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { value, defaultValue, onChange, step: stepProp = 15, min: minProp, max: maxProp, from: fromProp, placeholder, open: design = false, size = "md", invalid, disabled, required, name, id, "aria-label": ariaLabelProp, ariaLabel, className, style },
  ref
) {
  const [wrong, setWrong] = React.useState(false)
  const control = useFieldControl({ id, invalid: invalid || wrong, required })
  const field = control.field
  const label_ = ariaLabelProp ?? ariaLabel
  // The clock is named after its field, as NumberInput names its steppers: seven pickers on a board all read
  // "Show times" otherwise.
  const what = label_ ?? field?.labelText
  const base = React.useId()
  const listId = `${base}-list`
  const step = Math.max(1, Math.round(Number(stepProp) || 15))
  const start = fromValue(fromProp)
  // The earliest time accepted, and the earliest the list shows (a step after the start, when there is one).
  const floor = Math.max(fromValue(minProp) ?? 0, start !== null ? start + 1 : 0)
  const lo = Math.max(fromValue(minProp) ?? 0, start !== null ? start + step : 0)
  const hi = fromValue(maxProp) ?? 24 * 60 - 1

  const options = React.useMemo(() => {
    const out: ComboboxOption[] = []
    for (let m = Math.ceil(lo / step) * step; m <= hi; m += step) out.push({ value: toValue(m), label: label(m) })
    return out
  }, [lo, hi, step])
  const optionId = React.useCallback((v: string) => `${base}-option-${v.replace(":", "")}`, [base])

  const input = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, input)
  const anchor = React.useRef<HTMLDivElement | null>(null)

  const [held, setHeld] = React.useState(defaultValue ?? "")
  const current = value ?? held
  const minutes = fromValue(current)
  const [text, setText] = React.useState(() => (minutes !== null ? label(minutes) : ""))
  const [shown, setShown] = React.useState(false)
  const [active, setActive] = React.useState<string | null>(null)
  const [keyboard, setKeyboard] = React.useState(false)
  // Whether the option in hand came from the arrow keys (Enter takes it) or from typing (Enter takes what was typed).
  const [arrowed, setArrowed] = React.useState(false)

  const shownValue = React.useRef(current)
  React.useEffect(() => {
    if (shownValue.current === current) return
    shownValue.current = current
    if (input.current !== document.activeElement) setText(minutes !== null ? label(minutes) : "")
  }, [current, minutes])

  /** The option nearest a time. */
  const nearest = (m: number | null) => {
    if (m === null || !options.length) return null
    let best = options[0]
    for (const o of options) if (Math.abs((fromValue(o.value) ?? 0) - m) < Math.abs((fromValue(best.value) ?? 0) - m)) best = o
    return best.value
  }
  // The time the list leans towards: the chosen one, else an hour after the start, else 9 in the morning.
  const anchorTime = minutes ?? (start !== null ? start + 60 : 9 * 60)
  /**
   * Where the list should stand for what is typed: of the times written the way it starts, the one nearest the time
   * the list leans towards (so 12 is noon, not midnight); failing that, the time nearest what it reads as.
   */
  const towards = (typed: string) => {
    const t = typed.trim().toLowerCase().replace(/\s+/g, " ")
    if (!t) return null
    const starting = options.filter((o) => o.label.toLowerCase().startsWith(t))
    if (starting.length) {
      return starting.reduce((best, o) => (Math.abs((fromValue(o.value) ?? 0) - anchorTime) < Math.abs((fromValue(best.value) ?? 0) - anchorTime) ? o : best)).value
    }
    return nearest(parseTime(typed, start))
  }
  const restingPlace = () => (current && options.some((o) => o.value === current) ? current : nearest(anchorTime))

  const report = (message: string | null) => {
    setWrong(Boolean(message))
    field?.report(message)
    input.current?.setCustomValidity(message ?? "")
  }
  const commit = (m: number | null) => {
    const v = m === null ? "" : toValue(m)
    shownValue.current = v
    report(null)
    setText(m === null ? "" : label(m))
    if (value === undefined) setHeld(v)
    if (v !== current) onChange?.(v)
  }
  const problem = (m: number | null) => {
    if (m === null) return `Enter a time like ${label(9 * 60 + 30)}`
    if (start !== null && m <= start) return `Choose a time after ${label(start)}`
    if (m < floor || m > hi) return `Choose a time from ${label(floor)} to ${label(hi)}`
    return null
  }
  const check = () => {
    if (!text.trim()) return commit(null)
    const m = parseTime(text, start)
    const wrongWith = problem(m)
    if (wrongWith) return report(wrongWith)
    commit(m)
  }
  const closeList = () => {
    setShown(false)
    setActive(null)
    setKeyboard(false)
    setArrowed(false)
  }
  const openList = () => {
    if (disabled) return
    setShown(true)
    setActive(towards(text) ?? restingPlace())
  }
  const pick = (v: string) => {
    commit(fromValue(v))
    closeList()
  }

  const meta = (o: ComboboxOption) =>
    start === null ? null : (
      <span className="shrink-0 type-meta tabular-nums text-text-muted">{formatNumber(((fromValue(o.value) ?? 0) - start) / 60, "hours")}</span>
    )
  const inHand = design ? restingPlace() : active
  const isOpen = design || shown

  const fieldBox = (
    <div
      ref={anchor}
      data-slot="time-picker"
      data-size={size}
      data-state={isOpen ? "open" : "closed"}
      className={cn(inputBox, "pr-0")}
      onMouseDown={(event) => {
        if (event.target !== input.current && !disabled) {
          event.preventDefault()
          input.current?.focus()
        }
      }}
    >
      <input
        ref={merged}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="none"
        aria-activedescendant={isOpen && inHand ? optionId(inHand) : undefined}
        aria-label={label_}
        autoComplete="off"
        spellCheck={false}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(inputBare, "tabular-nums")}
        {...control.props}
        required={control.required || undefined}
        onChange={(event) => {
          if (design) return
          const next = event.target.value
          setText(next)
          setShown(true)
          setKeyboard(true)
          setArrowed(false)
          setActive(towards(next) ?? restingPlace())
        }}
        // A press opens the list; a press on the Field's label (which clicks the input) only focuses it.
        onMouseDown={() => {
          if (!design && !shown) openList()
        }}
        onBlur={() => {
          if (design) return
          closeList()
          check()
        }}
        onKeyDown={(event) => {
          if (design || disabled || event.defaultPrevented) return
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            setKeyboard(true)
            if (!shown) {
              if (!(event.altKey && event.key === "ArrowUp")) openList()
              return
            }
            if (event.altKey && event.key === "ArrowUp") return closeList()
            setArrowed(true)
            setActive(stepOption(options, active, event.key === "ArrowDown" ? 1 : -1))
          } else if (event.key === "Enter") {
            if (!shown) return check()
            event.preventDefault()
            // An option reached with the arrows is taken; otherwise the time typed, or the option it points at.
            if (arrowed && active) return pick(active)
            const typed = parseTime(text, start)
            if (typed !== null && !problem(typed)) {
              commit(typed)
              closeList()
            } else if (active) pick(active)
            else check()
          }
        }}
      />
      <Toggle
        icon="Clock"
        open={isOpen}
        controls={listId}
        label={`${shown ? "Hide" : "Show"} times${what ? ` for ${what}` : ""}`}
        disabled={disabled}
        onToggle={() => {
          if (design) return
          if (shown) closeList()
          else {
            input.current?.focus()
            openList()
          }
        }}
      />
    </div>
  )

  const list = (still: boolean) => (
    <OptionList
      id={listId}
      options={options}
      active={inHand}
      isChosen={(v) => v === current}
      optionId={optionId}
      keyboard={keyboard}
      label={label_}
      labelledBy={label_ ? undefined : field?.labelId}
      onHover={(v) => {
        setKeyboard(false)
        setArrowed(true)
        setActive(v)
      }}
      onPick={pick}
      meta={meta}
      still={still}
    />
  )

  return (
    <div data-slot="time-picker-field" className={cn("relative w-full min-w-0", className)} style={style}>
      {design ? (
        <>
          {fieldBox}
          <PanelPicture className="max-h-64">{list(true)}</PanelPicture>
        </>
      ) : (
        <PopoverRoot open={shown} onOpenChange={(next) => (next ? openList() : closeList())}>
          <PopoverAnchor asChild>{fieldBox}</PopoverAnchor>
          <Panel anchor={anchor} className="max-h-[min(16rem,var(--radix-popover-content-available-height,16rem))]">
            {list(false)}
          </Panel>
        </PopoverRoot>
      )}
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  )
})
