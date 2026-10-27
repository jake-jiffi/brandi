"use client"

import * as React from "react"

import { Textarea } from "@/components/ui/textarea"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useFieldControl } from "./field"

export interface TextAreaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  /** A danger edge that stays danger when focused. Inside a Field, its error sets this. */
  invalid?: boolean
}

/** Multi-line text for notes and messages. It starts at 96px and resizes vertically; the ref is the textarea. */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { invalid, required, id, maxLength: maxProp, value, defaultValue, onChange, className, style, "aria-describedby": describedBy, ...rest },
  ref
) {
  const countId = `${React.useId()}-count`
  // A canvas board's literal attribute arrives as a string ("200").
  const maxLength = maxProp === undefined ? undefined : Number(maxProp)
  const limited = maxLength !== undefined && Number.isFinite(maxLength) && maxLength > 0
  const control = useFieldControl({ id, invalid, required, describedBy: [describedBy, limited ? countId : null].filter(Boolean).join(" ") || undefined })
  const [typed, setTyped] = React.useState(() => String(defaultValue ?? "").length)
  const count = value !== undefined ? String(value).length : typed

  const area = (
    <Textarea
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      maxLength={maxLength}
      onChange={(event) => {
        setTyped(event.target.value.length)
        onChange?.(event)
      }}
      className={limited ? undefined : className}
      style={limited ? undefined : style}
      {...rest}
      {...control.props}
      required={control.required || undefined}
    />
  )
  if (!limited) return area

  // A count only when there is a hard limit. It is read with the field, and spoken once when the limit is hit.
  return (
    <div data-slot="text-area" className={cn("flex w-full min-w-0 flex-col gap-1.5", className)} style={style}>
      {area}
      <p id={countId} data-slot="text-area-count" className="self-end type-meta text-text-muted tabular-nums">
        {formatNumber(count)} of {formatNumber(maxLength)}
        <span className="sr-only"> characters</span>
      </p>
      <span className="sr-only" aria-live="polite">
        {count >= maxLength ? `You have reached the limit of ${formatNumber(maxLength)} characters.` : ""}
      </span>
    </div>
  )
})
