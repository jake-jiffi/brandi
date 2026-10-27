"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { Tooltip, useTruncated } from "./tooltip"

export type TagColor = 1 | 2 | 3 | 4 | 5 | 6 | "grey"

/** One chart series slot per colour, so a category looks the same in a table and in a chart. */
const DOT: Record<string, string> = {
  "1": "bg-series-1",
  "2": "bg-series-2",
  "3": "bg-series-3",
  "4": "bg-series-4",
  "5": "bg-series-5",
  "6": "bg-series-6",
  grey: "bg-text-subtle",
}

export interface TagProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children" | "color"> {
  /** The category's chart series slot, 1 to 6. Grey for unknown or unset. */
  color?: TagColor | `${1 | 2 | 3 | 4 | 5 | 6}`
  /** Adds a remove button with a 24px hit area, 40px on a touch screen. */
  onRemove?: () => void
  /** The remove button's name. "Remove [tag]" by default. */
  removeLabel?: string
  /** The category's name. */
  children: React.ReactNode
}

/** A category someone assigned: an outlined label with the category's colour dot, so it never reads as a status. */
export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { color = "grey", onRemove, removeLabel, className, children, ...rest },
  ref
) {
  const [label, setLabel] = React.useState<HTMLSpanElement | null>(null)
  const cut = useTruncated(label)
  const slot = String(color) in DOT ? String(color) : "grey"
  const named = removeLabel ?? (typeof children === "string" || typeof children === "number" ? `Remove ${children}` : "Remove tag")

  const tag = (
    <span
      ref={ref}
      data-slot="tag"
      data-color={slot}
      className={cn(
        "inline-flex h-6 max-w-full min-w-0 shrink-0 items-center gap-1.5 rounded-xs border border-line-strong bg-surface pl-2 type-meta whitespace-nowrap text-text-strong",
        onRemove ? "pr-0.5" : "pr-2",
        className
      )}
      {...rest}
    >
      {/* Forced colours keep the series colour, as a chart's marks do. */}
      <span aria-hidden="true" data-slot="tag-dot" className={cn("size-2 shrink-0 rounded-full forced-color-adjust-none", DOT[slot])} />
      <span ref={setLabel} data-slot="tag-label" className="max-w-48 min-w-0 truncate">
        {children}
      </span>
      {onRemove ? (
        <button
          type="button"
          data-slot="tag-remove"
          aria-label={named}
          onClick={onRemove}
          className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-hover hover:text-text-strong active:bg-pressed pointer-coarse:-my-2 pointer-coarse:-mr-2 pointer-coarse:size-10"
        >
          <Icon name="X" size={12} />
        </button>
      ) : null}
    </span>
  )
  // A name cut short shows in full on hover, on keyboard focus and on a long press.
  return cut ? <Tooltip content={children}>{tag}</Tooltip> : tag
})
