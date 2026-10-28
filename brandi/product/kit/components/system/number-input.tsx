"use client"

import * as React from "react"

import { inputBare, inputBox } from "@/components/ui/input"
import { formatNumber } from "@/lib/format"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { useFieldControl } from "./field"
import { Icon } from "./icon"

export interface NumberInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "size" | "prefix" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "type"> {
  value?: number | null
  defaultValue?: number | null
  /** A number, or null when the field is empty. Called on a step, an arrow key, or when a typed value is checked. */
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  /** How far a step button or an arrow key moves the value. 1 by default. */
  step?: number
  /** Whole numbers only, for a count: a typed decimal is refused and says so. */
  integer?: boolean
  /** 32, 36 or 44px tall; 40, 44 or 48px on a touch screen, with 16px text there. */
  size?: "sm" | "md" | "lg"
  /** Text before the value, such as $. Read with the field. */
  prefix?: React.ReactNode
  /** Text after the value, such as kg or %. Read with the field. */
  suffix?: React.ReactNode
  invalid?: boolean
  /** What the step buttons change, for their names: "quantity" gives Increase quantity. The Field's label by default. */
  stepLabel?: string
}

// The market's separators, read from the system's own formatter so typing and reading agree.
function separators() {
  const sample = formatNumber(1234.5)
  return { group: sample.charAt(1), decimal: sample.charAt(sample.length - 2) }
}

function decimals(n: number) {
  const s = String(n)
  return s.includes(".") ? s.split(".")[1].length : 0
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** "1,234.5", "$1,234.5" or "-12" to a number; null when it is not a number. */
function parse(text: string, prefix?: React.ReactNode, suffix?: React.ReactNode) {
  const { group, decimal } = separators()
  let s = text.trim()
  if (typeof prefix === "string" && s.startsWith(prefix)) s = s.slice(prefix.length)
  if (typeof suffix === "string" && s.endsWith(suffix)) s = s.slice(0, -suffix.length)
  s = s.replace(new RegExp(`[\\s${escape(group)}]`, "g"), "").replace(decimal, ".").replace(/^−/, "-")
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function lowerFirst(label: string) {
  // "Quantity" reads as "quantity", while "GST rate" keeps its capitals.
  return /^[A-Z][a-z]/.test(label) ? label.charAt(0).toLowerCase() + label.slice(1) : label
}

/**
 * A quantity or an amount, with step buttons. Up and Down step the value. A typed value is checked when the
 * person leaves the field, never while they type. The ref is the input.
 */
// A canvas board's literal attribute arrives as a string ("3"), so every number prop is read as a number.
const toNumber = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : Number.isFinite(Number(v)) ? Number(v) : undefined)

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value: valueProp,
    defaultValue: defaultProp = null,
    onChange,
    min: minProp,
    max: maxProp,
    step: stepProp = 1,
    integer = false,
    size = "md",
    prefix,
    suffix,
    invalid,
    stepLabel,
    required,
    readOnly,
    disabled,
    inputMode,
    id,
    className,
    style,
    onBlur,
    onKeyDown,
    "aria-describedby": describedBy,
    ...rest
  },
  ref
) {
  const value = valueProp === null ? null : toNumber(valueProp)
  const defaultValue = toNumber(defaultProp) ?? null
  const min = toNumber(minProp)
  const max = toNumber(maxProp)
  const step = toNumber(stepProp) || 1
  const own = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, own)
  const base = React.useId()
  const prefixId = `${base}-prefix`
  const suffixId = `${base}-suffix`
  const [wrong, setWrong] = React.useState(false)
  const control = useFieldControl({
    id,
    invalid: invalid || wrong,
    required,
    describedBy: [prefix ? prefixId : null, suffix ? suffixId : null, describedBy].filter(Boolean).join(" ") || undefined,
  })
  const field = control.field

  const [inner, setInner] = React.useState<number | null>(defaultValue)
  const current = value !== undefined ? value : inner
  const places = Math.max(2, decimals(step))
  const show = (n: number | null) => (n === null ? "" : formatNumber(n, "number", { digits: places }))
  const [text, setText] = React.useState(() => show(current))
  const [spoken, setSpoken] = React.useState("")

  // A value set from outside shows at once, unless the person is typing in the field.
  React.useEffect(() => {
    if (own.current !== document.activeElement) setText(show(current))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const kind = integer ? "a whole number" : "a number"
  const range =
    min !== undefined && max !== undefined
      ? `Enter ${kind} from ${formatNumber(min)} to ${formatNumber(max)}`
      : min !== undefined
        ? integer ? `Enter a whole number, ${formatNumber(min)} or more` : `Enter ${formatNumber(min)} or more`
        : max !== undefined
          ? integer ? `Enter a whole number, ${formatNumber(max)} or less` : `Enter ${formatNumber(max)} or less`
          : `Enter ${kind}`

  const commit = (next: number | null) => {
    setWrong(false)
    field?.report(null)
    own.current?.setCustomValidity("")
    setText(show(next))
    if (value === undefined) setInner(next)
    if (next !== current) onChange?.(next)
  }

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
  const stepBy = (direction: 1 | -1) => {
    const typed = parse(text, prefix, suffix)
    const from = typed ?? current
    const next = from === null ? clamp(min ?? 0) : clamp(from + direction * step)
    commit(Number(next.toFixed(Math.max(decimals(step), decimals(from ?? 0)))))
    return next
  }

  // Checked when the person leaves the field: a value that is not a number, or is out of range, stays as typed and
  // says what to enter, through the Field around it and the browser's own validity.
  const check = () => {
    if (text.trim() === "") return commit(null)
    const n = parse(text, prefix, suffix)
    if (n === null || n !== clamp(n) || (integer && !Number.isInteger(n))) {
      setWrong(true)
      field?.report(range)
      own.current?.setCustomValidity(range)
      return
    }
    commit(n)
  }

  const what = stepLabel ?? (field?.labelText ? lowerFirst(field.labelText) : "value")
  const atMin = current !== null && min !== undefined && current <= min
  const atMax = current !== null && max !== undefined && current >= max
  // Phone keypads: digits for whole numbers, a decimal point for amounts. Only a range below zero needs the full
  // keyboard, because the keypads have no minus sign.
  const mode = inputMode ?? (min !== undefined && min < 0 ? "text" : integer || decimals(step) === 0 ? "numeric" : "decimal")

  const stepButton = (direction: 1 | -1) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`${direction > 0 ? "Increase" : "Decrease"} ${what}`}
      disabled={disabled || (direction > 0 ? atMax : atMin)}
      // Keeps the caret in the field: Up and Down are the keyboard's way to step.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        const next = stepBy(direction)
        setSpoken(`${typeof prefix === "string" ? prefix : ""}${show(next)}${typeof suffix === "string" ? ` ${suffix}` : ""}`)
      }}
      data-slot="number-input-step"
      // Decrease at the start and Increase at the end, on every screen, so it reads minus, value, plus, and on
      // touch the two targets sit apart.
      className={cn(
        "grid h-full w-9 shrink-0 place-items-center border-line text-text-muted transition-colors hover:bg-hover hover:text-text-strong active:bg-pressed disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent pointer-coarse:w-11",
        direction > 0 ? "rounded-r-[calc(var(--radius-control)-1px)] border-l" : "rounded-l-[calc(var(--radius-control)-1px)] border-r"
      )}
    >
      <Icon name={direction > 0 ? "Plus" : "Minus"} />
    </button>
  )

  return (
    <div
      data-slot="number-input"
      data-size={size}
      className={cn(inputBox, !readOnly && "px-0", className)}
      style={style}
      onMouseDown={(event) => {
        if (event.target !== own.current && !(event.target as Element).closest("button") && !disabled) {
          event.preventDefault()
          own.current?.focus()
        }
      }}
    >
      {readOnly ? null : stepButton(-1)}
      {prefix ? (
        <span id={prefixId} data-slot="number-input-prefix" className="shrink-0 text-text-muted select-none">
          {prefix}
        </span>
      ) : null}
      <input
        ref={merged}
        type="text"
        role="spinbutton"
        inputMode={mode}
        autoComplete="off"
        value={text}
        readOnly={readOnly}
        disabled={disabled}
        aria-valuenow={current ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        className={cn(inputBare, "tabular-nums")}
        {...rest}
        {...control.props}
        required={control.required || undefined}
        onChange={(event) => setText(event.target.value)}
        onBlur={(event) => {
          if (!readOnly) check()
          onBlur?.(event)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || readOnly || disabled) return
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault()
            stepBy(event.key === "ArrowUp" ? 1 : -1)
          } else if (event.key === "Enter") {
            check()
          }
        }}
      />
      {suffix ? (
        <span id={suffixId} data-slot="number-input-suffix" className="shrink-0 text-text-muted select-none">
          {suffix}
        </span>
      ) : null}
      {readOnly ? <Icon name="Lock" size={14} className="text-text-subtle" /> : stepButton(1)}
      <span className="sr-only" aria-live="polite">
        {spoken}
      </span>
    </div>
  )
})
