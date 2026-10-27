"use client"

import * as React from "react"

import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  selectContentClassName,
  selectItemClassName,
} from "@/components/ui/select"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { useFieldControl } from "./field"
import { Icon } from "./icon"

export interface SelectOption {
  value: string
  label: string
  /** A line under the label, in the list only. */
  description?: string
  icon?: IconName
  disabled?: boolean
}

export interface SelectProps {
  /** Up to about 15. Strings, or { value, label, description, icon, disabled }. */
  options: ReadonlyArray<string | SelectOption>
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Says what to choose ("Choose a [category]"), never "Select...". */
  placeholder?: string
  /** Design mode: draws the list open in place, for a board. Never in a product. */
  open?: boolean
  /** 32, 36 or 44px tall; 40, 44 or 48px on a touch screen. */
  size?: "sm" | "md" | "lg"
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  /** The name of a Select outside a Field. */
  "aria-label"?: string
  "aria-labelledby"?: string
  /** aria-label as a canvas board writes it (attributes arrive in camelCase). */
  ariaLabel?: string
  /** aria-labelledby as a canvas board writes it. */
  ariaLabelledby?: string
  className?: string
  style?: React.CSSProperties
}

const SIZE = { sm: "sm", md: "default", lg: "lg" } as const
const toOption = (o: string | SelectOption): SelectOption => (typeof o === "string" ? { value: o, label: o } : o)

/** One option from a short list. A select-only combobox: the field reads its current value. The ref is the trigger. */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onChange,
    placeholder,
    open = false,
    size = "md",
    invalid,
    disabled,
    required,
    name,
    id,
    "aria-label": ariaLabelProp,
    "aria-labelledby": ariaLabelledbyProp,
    ariaLabel,
    ariaLabelledby,
    className,
    style,
  },
  ref
) {
  const items = options.map(toOption)
  const control = useFieldControl({ id, invalid, required })
  const label = ariaLabelProp ?? ariaLabel
  // Named like its field: by the Field's label, or by what it was given outside one.
  const labelledBy = ariaLabelledbyProp ?? ariaLabelledby ?? (label ? undefined : control.field?.labelId)
  const listId = `${React.useId()}-list`

  // Design mode keeps the real trigger, closed to the pointer and the keyboard, and draws the list beside it.
  const [chosen, setChosen] = React.useState(defaultValue)
  const current = value ?? chosen
  const inHand = items.find((o) => o.value === current && !o.disabled) ?? items.find((o) => !o.disabled)
  const design = open ? { open: false, onOpenChange: () => undefined } : {}

  return (
    <SelectRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => {
        setChosen(next)
        onChange?.(next)
      }}
      disabled={disabled}
      required={control.required}
      name={name}
      {...design}
    >
      <div data-slot="select-field" className={cn("relative w-full min-w-0", className)} style={style}>
        <SelectTrigger
          ref={ref}
          size={SIZE[size]}
          {...control.props}
          aria-label={label}
          aria-labelledby={labelledBy}
          {...(open ? { "aria-expanded": true, "aria-controls": listId, "data-state": "open" } : {})}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label={label}
            aria-labelledby={labelledBy}
            data-slot="select-content"
            data-state="open"
            className={cn(selectContentClassName, "absolute top-full left-0 mt-1 w-full")}
          >
            {items.map((o) => (
              <div
                key={o.value}
                role="option"
                aria-selected={o.value === current}
                aria-disabled={o.disabled || undefined}
                data-slot="select-item"
                data-state={o.value === current ? "checked" : "unchecked"}
                data-highlighted={o.value === inHand?.value ? "" : undefined}
                data-disabled={o.disabled ? "" : undefined}
                className={selectItemClassName}
              >
                {o.value === current ? (
                  <span className="pointer-events-none absolute top-2.5 right-2.5 flex size-4 items-center justify-center text-primary pointer-coarse:top-3.5">
                    <Icon name="Check" />
                  </span>
                ) : null}
                <span className="flex items-center gap-2">
                  {o.icon ? <Icon name={o.icon} className="text-text-muted" /> : null}
                  {o.label}
                </span>
                {o.description ? <span className={cn("type-meta text-text-muted", o.icon && "pl-6")}>{o.description}</span> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <SelectContent aria-label={label} aria-labelledby={labelledBy}>
        {items.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            disabled={o.disabled}
            // A description lines up with the label, past the icon.
            description={o.description ? <span className={o.icon ? "block pl-6" : undefined}>{o.description}</span> : undefined}
          >
            {o.icon ? <Icon name={o.icon} className="text-text-muted" /> : null}
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
})
