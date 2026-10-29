"use client"

import * as React from "react"

import { Toggle } from "@/components/ui/toggle"
import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export interface FilterChipProps extends Omit<React.ComponentPropsWithoutRef<"button">, "onChange" | "children"> {
  /** Whether the filter is on, when the parent holds it (filters live in the URL). */
  selected?: boolean
  /** Whether the filter starts on, when the chip holds it. */
  defaultSelected?: boolean
  onChange?: (selected: boolean) => void
  /** How many items match if the chip is applied. Missing means unknown, and shows nothing. */
  count?: number
  /** The count is waiting on the reader: it takes the highlight and is read as "12 need you". */
  attention?: boolean
  /** What the count counts, one and many: ["job", "jobs"] reads "Needs you, 2 jobs", saying the count once. */
  noun?: [string, string]
  /** An icon before the label. A check takes its place while the chip is on. */
  icon?: IconName
  /** The label: what the filter keeps, in a word or two. */
  children: React.ReactNode
}

/** A filter over what is already on screen, pressed on and off. */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(function FilterChip(
  { selected, defaultSelected = false, onChange, count, attention = false, noun, icon, className, children, ...rest },
  ref
) {
  const [inner, setInner] = React.useState(defaultSelected)
  const on = selected ?? inner
  const known = typeof count === "number" && Number.isFinite(count)
  const needsYou = attention && known && count > 0
  const figure = known ? formatNumber(count) : ""
  // A text label gets an exact name ("Overdue, 12 need you"): a hidden span after it would be read with a
  // stray pause, because browsers treat it as a block. Anything else falls back to the hidden span.
  const textLabel = typeof children === "string" || typeof children === "number" ? String(children) : null
  // The count is said once: in the noun it counts when there is one, and never "need you" again after a label
  // that already says it ("Needs you, 2 need you" said it twice).
  const said = textLabel !== null && /\bneeds? you\b/i.test(textLabel)
  const spoken = !known
    ? null
    : Array.isArray(noun) && noun.length === 2
      ? `${figure} ${count === 1 ? noun[0] : noun[1]}`
      : needsYou && !said
        ? `${figure} ${count === 1 ? "needs" : "need"} you`
        : `${figure} ${count === 1 ? "item" : "items"}`

  return (
    <Toggle
      ref={ref}
      variant="outline"
      size="sm"
      pressed={on}
      onPressedChange={(next) => {
        if (selected === undefined) setInner(next)
        onChange?.(next)
      }}
      data-slot="filter-chip"
      aria-label={spoken && textLabel ? `${textLabel}, ${spoken}` : undefined}
      className={cn("gap-1.5 px-3", needsYou && "pr-1.5", className)}
      {...rest}
    >
      {on ? <Icon name="Check" className="size-3.5" /> : icon ? <Icon name={icon} className="size-3.5" /> : null}
      <span data-slot="filter-chip-label">{children}</span>
      {/* A space between the word and the count, so the visible text reads "Draft 1" and stays inside the name (WCAG 2.5.3). */}
      {known ? " " : null}
      {known ? (
        <span
          aria-hidden="true"
          data-slot="filter-chip-count"
          className={cn(
            "tabular-nums",
            needsYou ? "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-highlight px-1.5 type-caption text-on-highlight" : "type-meta text-text-muted"
          )}
        >
          {figure}
        </span>
      ) : null}
      {spoken && !textLabel ? <span className="sr-only">, {spoken}</span> : null}
    </Toggle>
  )
})
