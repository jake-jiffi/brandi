"use client"

import * as React from "react"

import { Checkbox as CheckboxBox } from "@/components/ui/checkbox"
import { FieldError } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface CheckboxProps {
  /** States the outcome ("Email the [client] a copy"). */
  label: React.ReactNode
  /** A line under the label, read with the box. */
  description?: React.ReactNode
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  /** Some selected: a dash, read as mixed. Its parent decides when it ends. */
  indeterminate?: boolean
  disabled?: boolean
  /** Must be ticked before the form saves. */
  required?: boolean
  /** What is wrong and how to fix it, with an icon. Announced when it appears. */
  error?: React.ReactNode
  name?: string
  value?: string
  id?: string
  className?: string
  style?: React.CSSProperties
}

/** A choice saved with a form. An 18px box with a 24px hit area, 44px on touch; the label toggles it too. The ref is the box. */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { label, description, checked, defaultChecked, onChange, indeterminate = false, disabled = false, required, error, name, value, id, className, style },
  ref
) {
  const base = React.useId()
  const boxId = id ?? `${base}-box`
  const descriptionId = `${base}-description`
  const errorId = `${base}-error`
  const hasError = error !== undefined && error !== null && error !== false && error !== ""
  const state = indeterminate ? { checked: "indeterminate" as const } : checked !== undefined ? { checked } : { defaultChecked }

  return (
    <div data-slot="checkbox-field" className={cn("flex min-w-0 flex-col", className)} style={style}>
      <div className="flex items-start gap-3 pointer-coarse:py-3">
        <CheckboxBox
          ref={ref}
          id={boxId}
          {...state}
          onCheckedChange={(next) => onChange?.(next === true)}
          disabled={disabled}
          required={required}
          name={name}
          value={value}
          aria-invalid={hasError || undefined}
          aria-describedby={[description ? descriptionId : null, hasError ? errorId : null].filter(Boolean).join(" ") || undefined}
          className="mt-px"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Label htmlFor={boxId} className={cn("block", disabled && "cursor-not-allowed text-text-subtle")}>
            {label}
          </Label>
          {description ? (
            <p id={descriptionId} data-slot="checkbox-description" className="type-meta text-text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div data-slot="field-message" aria-live="polite">
        {hasError ? (
          <FieldError id={errorId} role={undefined} className="mt-1.5 pl-7.5">
            {error}
          </FieldError>
        ) : null}
      </div>
    </div>
  )
})
