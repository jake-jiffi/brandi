"use client"

import * as React from "react"

import { FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { RadioGroup as RadioGroupRoot, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export interface RadioOption {
  value: string
  label: string
  /** A line under the label, read with the option. */
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  /** Names the choice, in sentence case. The group's accessible name. */
  legend: React.ReactNode
  name?: string
  /** Two to five. Strings, or { value, label, description, disabled }. */
  options: ReadonlyArray<string | RadioOption>
  value?: string
  /** Preselect the safest or most common option. */
  defaultValue?: string
  onChange?: (value: string) => void
  /** Why the choice matters, under the legend. */
  hint?: React.ReactNode
  /** What is wrong and how to fix it, with an icon. Announced when it appears. */
  error?: React.ReactNode
  required?: boolean
  disabled?: boolean
  id?: string
  className?: string
  style?: React.CSSProperties
}

const toOption = (o: string | RadioOption): RadioOption => (typeof o === "string" ? { value: o, label: o } : o)

/**
 * One choice from two to five options people should see side by side. Tab enters at the chosen option and the
 * arrow keys move the choice. Short options sit in a row once the group is 480px wide. The ref is the radio group.
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { legend, name, options, value, defaultValue, onChange, hint, error, required, disabled, id, className, style },
  ref
) {
  const base = React.useId()
  const legendId = `${base}-legend`
  const hintId = `${base}-hint`
  const errorId = `${base}-error`
  const items = options.map(toOption)
  const hasError = error !== undefined && error !== null && error !== false && error !== ""
  const inline = items.every((o) => !o.description)

  return (
    <div data-slot="radio-group-field" className={cn("@container flex min-w-0 flex-col", className)} style={style}>
      <div id={legendId} data-slot="radio-group-legend" className="type-label text-text-strong">
        {legend}
      </div>
      {hint ? (
        <p id={hintId} data-slot="radio-group-hint" className="mt-0.5 type-meta text-text-muted">
          {hint}
        </p>
      ) : null}
      <RadioGroupRoot
        ref={ref}
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onChange?.(next)}
        required={required}
        disabled={disabled}
        aria-labelledby={legendId}
        aria-describedby={[hint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined}
        aria-invalid={hasError || undefined}
        data-inline={inline || undefined}
        className="mt-3 flex flex-col gap-3 @min-[480px]:data-inline:flex-row @min-[480px]:data-inline:flex-wrap @min-[480px]:data-inline:gap-x-6"
      >
        {items.map((o, i) => {
          const itemId = `${base}-option-${i}`
          const descriptionId = `${itemId}-description`
          const off = disabled || o.disabled
          return (
            <div key={o.value} data-slot="radio-group-option" className="flex items-start gap-3 pointer-coarse:py-3">
              <RadioGroupItem
                id={itemId}
                value={o.value}
                disabled={o.disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={o.description ? descriptionId : undefined}
                className="mt-px"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <Label htmlFor={itemId} className={cn("block", off && "cursor-not-allowed text-text-subtle")}>
                  {o.label}
                </Label>
                {o.description ? (
                  <p id={descriptionId} data-slot="radio-group-description" className="type-meta text-text-muted">
                    {o.description}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </RadioGroupRoot>
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
