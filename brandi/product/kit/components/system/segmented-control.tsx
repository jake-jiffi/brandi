"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export type SegmentedControlSize = "sm" | "md" | "lg"

export interface SegmentedControlOption {
  value: string
  label: string
  icon?: IconName
  disabled?: boolean
}

export interface SegmentedControlProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue" | "dir"> {
  /** Two to five views of the same content: strings, or `{ value, label, icon }`. */
  options: Array<string | SegmentedControlOption>
  /** The chosen option, when the parent holds it. */
  value?: string
  /** The option chosen at first, when the control holds it. The first option when neither is set. */
  defaultValue?: string
  onChange?: (value: string) => void
  /** 32, 36 or 44px tall. Options are 40px on a touch screen (48px at `lg`). */
  size?: SegmentedControlSize
  /** The group's name, which screen readers read first ("Calendar view"). */
  label: string
  disabled?: boolean
}

// Keys the roving focus moves with. When one of them moves focus, the selection moves with it.
const NAV_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"])

const ITEM_SIZE: Record<SegmentedControlSize, string> = {
  sm: "h-7 px-2.5 pointer-coarse:h-10",
  md: "h-8 px-3 pointer-coarse:h-10",
  lg: "h-10 px-4 pointer-coarse:h-11",
}

// The thumb's corners sit inside the track's, 2px in.
const INNER_RADIUS = "rounded-[calc(var(--radius-control)-2px)]"

/** Two to five views of the same content, as a radio group. Changes the view at once. */
export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  { options, value, defaultValue, onChange, size = "md", label, disabled = false, className, onKeyDown, onBlur, ...rest },
  ref
) {
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o))
  const [inner, setInner] = React.useState<string | undefined>(defaultValue ?? items[0]?.value)
  const current = value ?? inner
  const index = items.findIndex((o) => o.value === current)
  const fromKeys = React.useRef(false)

  const commit = (next: string) => {
    // Pressing the chosen option again asks Radix to clear it; a segmented control always has one.
    if (!next || next === current) return
    if (value === undefined) setInner(next)
    onChange?.(next)
  }

  return (
    <ToggleGroup
      ref={ref}
      type="single"
      value={current ?? ""}
      onValueChange={commit}
      disabled={disabled}
      aria-label={label}
      data-slot="segmented-control"
      data-size={size}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "group/segmented relative inline-grid w-fit auto-cols-fr grid-flow-col items-stretch gap-0 rounded-control bg-surface-sunken p-0.5 ring-1 ring-line ring-inset",
        className
      )}
      onKeyDown={(event) => {
        if (NAV_KEYS.has(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) fromKeys.current = true
        onKeyDown?.(event)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) fromKeys.current = false
        onBlur?.(event)
      }}
      {...rest}
    >
      {index >= 0 ? (
        // Equal segments, so the thumb is placed by arithmetic: no measuring, and right on the server's first paint.
        <span
          aria-hidden="true"
          data-slot="segmented-control-thumb"
          className={cn(
            "pointer-events-none absolute inset-y-0.5 left-0.5 bg-surface shadow-xs ring-1 ring-line-control ring-inset motion-safe:transition-transform motion-safe:duration-(--duration-base) motion-safe:ease-standard motion-reduce:hidden group-data-[disabled]/segmented:opacity-50",
            INNER_RADIUS
          )}
          style={{ width: `calc((100% - 4px) / ${items.length})`, transform: `translateX(${index * 100}%)` }}
        />
      ) : null}
      {items.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          data-slot="segmented-control-item"
          onFocus={() => {
            if (!fromKeys.current) return
            fromKeys.current = false
            commit(option.value)
          }}
          className={cn(
            "relative min-w-0 text-text-muted hover:text-text-strong data-[state=on]:bg-transparent data-[state=on]:text-text-strong",
            // Under reduced motion nothing slides: the chosen option takes the thumb's look itself, and fades in.
            "motion-reduce:data-[state=on]:bg-surface motion-reduce:data-[state=on]:shadow-xs motion-reduce:data-[state=on]:ring-1 motion-reduce:data-[state=on]:ring-line-control motion-reduce:data-[state=on]:ring-inset",
            // Forced colours drop the thumb's fill and edge, so the chosen option is outlined in Highlight instead.
            "forced-colors:data-[state=on]:outline-2 forced-colors:data-[state=on]:-outline-offset-2 forced-colors:data-[state=on]:outline-[color:Highlight]",
            INNER_RADIUS,
            ITEM_SIZE[size]
          )}
        >
          {option.icon ? <Icon name={option.icon} /> : null}
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
})
