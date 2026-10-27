"use client"

import * as React from "react"

import { FieldError } from "@/components/ui/field"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Badge } from "./badge"
import { Icon } from "./icon"

export interface Plan {
  value: string
  name: string
  /** The price, a number in the market's currency, read through the formatter. 0 reads as Free; null as Price on request. */
  price: number | null
  /** What the price buys: per month, per person per month. */
  period?: string
  /** Who it suits, in a line. */
  description?: string
  /** What it includes, one short line each. */
  features?: string[]
  /** A short flag beside the name: Most popular, Current plan. */
  badge?: string
  /** Shown but not choosable. Say why in the description. */
  disabled?: boolean
}

export interface PlanPickerProps {
  /** Names the choice, in sentence case: Choose a plan. The group's accessible name. */
  legend: React.ReactNode
  /** Two to five plans. More than five is a Select. */
  plans: Plan[]
  value?: string
  /** Preselect the safest or most common plan. */
  defaultValue?: string
  onChange?: (value: string) => void
  /** Why the choice matters, under the legend: You can change plans at any time. */
  hint?: React.ReactNode
  /** What is wrong and how to fix it. Announced when it appears. */
  error?: React.ReactNode
  /** The radios' name, for a native form post. */
  name?: string
  /** The currency, when it is not the market's own. */
  currency?: string
  required?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * One plan from two to five, as cards that say what each includes. A native radio group: Tab enters at the chosen
 * plan, the arrow keys move the choice, and a press anywhere on a card chooses it. Cards sit side by side from 560px
 * of their own width and stack below that. The ref is the radio group.
 */
export const PlanPicker = React.forwardRef<HTMLDivElement, PlanPickerProps>(function PlanPicker(
  { legend, plans, value, defaultValue, onChange, hint, error, name, currency, required, className, style },
  ref
) {
  const base = React.useId()
  const legendId = `${base}-legend`
  const hintId = `${base}-hint`
  const errorId = `${base}-error`
  const group = name ?? `${base}-plan`
  const [held, setHeld] = React.useState(defaultValue ?? "")
  const current = value ?? held
  const hasError = error !== undefined && error !== null && error !== false && error !== ""

  const price = (p: Plan) => (p.price === null ? "Price on request" : p.price === 0 ? "Free" : formatNumber(p.price, "currency", currency ? { currency } : undefined))

  return (
    <div data-slot="plan-picker" className={cn("@container flex min-w-0 flex-col", className)} style={style}>
      <div id={legendId} data-slot="plan-picker-legend" className="type-label text-text-strong">
        {legend}
      </div>
      {hint ? (
        <p id={hintId} data-slot="plan-picker-hint" className="mt-0.5 type-meta text-text-muted">
          {hint}
        </p>
      ) : null}
      <div
        ref={ref}
        role="radiogroup"
        aria-labelledby={legendId}
        aria-describedby={[hint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        data-slot="plan-picker-group"
        className="mt-3 grid grid-cols-1 gap-3 @min-[560px]:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] @min-[560px]:gap-4"
      >
        {plans.map((p) => {
          const id = `${base}-${p.value}`
          const chosen = p.value === current
          const read = [`${id}-price`, p.description ? `${id}-description` : null, p.features?.length ? `${id}-features` : null, p.badge ? `${id}-badge` : null].filter(Boolean).join(" ")
          return (
            <div
              key={p.value}
              data-slot="plan-card"
              data-state={chosen ? "checked" : "unchecked"}
              data-disabled={p.disabled || undefined}
              // The card draws the radio's state: a primary edge when chosen, the focus ring around the whole card
              // from the keyboard, and in forced colours a Highlight outline for the chosen plan.
              className={cn(
                "relative flex flex-col gap-3 rounded-lg border border-line-control bg-surface p-5 transition-colors @max-[559px]:p-4",
                "hover:border-text-subtle has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus has-[input:focus-visible]:outline-solid",
                "data-[state=checked]:border-primary data-[state=checked]:bg-selected data-[state=checked]:shadow-[inset_0_0_0_1px_var(--primary)] forced-colors:data-[state=checked]:outline-2 forced-colors:data-[state=checked]:-outline-offset-4 forced-colors:data-[state=checked]:outline-[Highlight] forced-colors:data-[state=checked]:outline-solid",
                // Not offered: a dashed edge on the subtle surface, its words in the subtle text, and its reason (the
                // description) kept readable, never faded.
                "data-disabled:cursor-not-allowed data-disabled:border-dashed data-disabled:bg-surface-subtle data-disabled:hover:border-line-control",
                hasError && !chosen && "border-danger"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                  {/* The name labels the radio, and its box covers the card, so a press anywhere on the card chooses. */}
                  <label
                    htmlFor={id}
                    data-slot="plan-card-name"
                    className={cn("type-heading after:absolute after:inset-0 after:rounded-[inherit]", p.disabled ? "text-text-subtle after:cursor-not-allowed" : "text-text-strong after:cursor-pointer")}
                  >
                    {p.name}
                  </label>
                  {p.badge ? (
                    <Badge id={`${id}-badge`} tone="info" size="sm">
                      {p.badge}
                    </Badge>
                  ) : null}
                </div>
                <input
                  id={id}
                  type="radio"
                  name={group}
                  value={p.value}
                  checked={chosen}
                  disabled={p.disabled}
                  required={required}
                  aria-describedby={read}
                  className="peer sr-only"
                  onChange={() => {
                    if (value === undefined) setHeld(p.value)
                    onChange?.(p.value)
                  }}
                />
                {/* The radio as people see it; the real one is above, for keyboards and screen readers. */}
                <span
                  aria-hidden="true"
                  data-slot="plan-card-radio"
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    chosen ? "border-primary bg-primary" : p.disabled ? "border-dashed border-line-control bg-surface-subtle" : "border-line-control bg-surface"
                  )}
                >
                  {chosen ? <span className="size-2 rounded-full bg-on-primary forced-colors:border-4 forced-colors:border-solid" /> : null}
                </span>
              </div>
              <p id={`${id}-price`} data-slot="plan-card-price" className="flex flex-wrap items-baseline gap-x-1.5">
                <span className={cn("type-kpi-sm", p.disabled ? "text-text-subtle" : "text-text-strong")}>{price(p)}</span>
                {p.period && p.price !== null && p.price !== 0 ? <span className="type-meta text-text-muted">{p.period}</span> : null}
              </p>
              {p.description ? (
                <p id={`${id}-description`} data-slot="plan-card-description" className="type-meta text-text-muted">
                  {p.description}
                </p>
              ) : null}
              {p.features?.length ? (
                <ul id={`${id}-features`} data-slot="plan-card-features" className="flex flex-col gap-1.5 border-t border-line pt-3">
                  {p.features.map((f) => (
                    <li key={f} className={cn("flex items-start gap-2 type-body", p.disabled ? "text-text-subtle" : "text-text")}>
                      <Icon name="Check" size={16} className={cn("mt-0.5", p.disabled ? "text-text-subtle" : "text-success")} />
                      {/* Read as a list of items, each ending, rather than run together. */}
                      <span>
                        {f}
                        <span className="sr-only">.</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )
        })}
      </div>
      <div data-slot="field-message" aria-live="polite">
        {hasError ? (
          <FieldError id={errorId} role={undefined} className="mt-2">
            {error}
          </FieldError>
        ) : null}
      </div>
    </div>
  )
})
