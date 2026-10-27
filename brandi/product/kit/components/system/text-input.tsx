"use client"

import * as React from "react"

import { Input, inputBare, inputBox } from "@/components/ui/input"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { useFieldControl } from "./field"
import { Icon } from "./icon"

export type TextInputSize = "sm" | "md" | "lg"

export interface TextInputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "size" | "prefix"> {
  /** 32, 36 or 44px tall; 40, 44 or 48px on a touch screen, always with 16px text there. */
  size?: TextInputSize
  /** An icon at the start, in the muted text colour. */
  icon?: IconName
  /** Text before the value, such as $ or https://. Read with the field. */
  prefix?: React.ReactNode
  /** Text after the value, such as kg, % or AUD. Read with the field. */
  suffix?: React.ReactNode
  /** A danger edge that stays danger when focused. Inside a Field, its error sets this. */
  invalid?: boolean
}

/** A single-line field. Every native input prop passes through; the ref is the input. */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { size = "md", icon, prefix, suffix, invalid, required, readOnly, disabled, id, className, style, "aria-describedby": describedBy, ...rest },
  ref
) {
  const own = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, own)
  const base = React.useId()
  const prefixId = `${base}-prefix`
  const suffixId = `${base}-suffix`
  const control = useFieldControl({
    id,
    invalid,
    required,
    // The prefix and suffix are read with the field, before any hint or error.
    describedBy: [prefix ? prefixId : null, suffix ? suffixId : null, describedBy].filter(Boolean).join(" ") || undefined,
  })
  const shared = { ...rest, ...control.props, required: control.required || undefined, readOnly, disabled }

  if (!icon && !prefix && !suffix && !readOnly) {
    return <Input ref={merged} data-size={size} className={className} style={style} {...shared} />
  }

  return (
    <div
      data-slot="text-input"
      data-size={size}
      className={cn(inputBox, className)}
      style={style}
      // A press on the icon, prefix or suffix puts the caret in the field.
      onMouseDown={(event) => {
        if (event.target !== own.current && !disabled) {
          event.preventDefault()
          own.current?.focus()
        }
      }}
    >
      {icon ? <Icon name={icon} className="text-text-muted" /> : null}
      {prefix ? (
        <span id={prefixId} data-slot="text-input-prefix" className="shrink-0 text-text-muted select-none">
          {prefix}
        </span>
      ) : null}
      <input ref={merged} data-slot="input" className={inputBare} {...shared} />
      {suffix ? (
        <span id={suffixId} data-slot="text-input-suffix" className="shrink-0 text-text-muted select-none">
          {suffix}
        </span>
      ) : null}
      {readOnly ? <Icon name="Lock" size={14} className="text-text-subtle" /> : null}
    </div>
  )
})
