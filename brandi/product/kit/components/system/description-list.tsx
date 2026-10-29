import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { Badge, type BadgeTone } from "./badge"

export type DescriptionBadgeTone = BadgeTone

export interface DescriptionItem {
  label: string
  value?: React.ReactNode
  /** A state as a badge: on its own, or after the value. The word carries it, the tone backs it up. */
  badge?: { label: string; tone?: DescriptionBadgeTone }
  /** What a missing value says, "Not set" by default. Never blank. */
  empty?: string
  /** The sum of the items above it: under a rule, in the strong style. */
  total?: boolean
}

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: DescriptionItem[]
  /**
   * `columns`: label beside value, stacking under 420px of its own width. `stacked`: label above value, for side panes.
   * `lines`: label and value on one line at any width, the value at the end in tabular figures, for order lines.
   */
  layout?: "columns" | "stacked" | "lines"
  /** The labels stay; the values wait as skeletons. */
  loading?: boolean
}

const SKELETON_WIDTHS = ["w-2/5", "w-3/5", "w-1/3", "w-1/2"]

const missing = (value: React.ReactNode) => value == null || value === "" || value === false

/** Label and value pairs for a record's details, in two columns, stacked, or as lines with a total. */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { items, layout = "columns", loading = false, className, ...rest },
  ref
) {
  const lines = layout === "lines"
  return (
    <dl
      ref={ref}
      data-slot="description-list"
      data-layout={layout}
      aria-busy={loading || undefined}
      className={cn("@container flex flex-col", className)}
      {...rest}
    >
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          data-slot="description-item"
          data-total={item.total || undefined}
          className={cn(
            lines
              ? // Lines never stack: a long label wraps beside its value, which keeps to the label's first line.
                // No hairlines between them; the total alone sits under a rule.
                cn("flex items-baseline justify-between gap-4 py-1 first:pt-0 last:pb-0", item.total && "mt-2 border-t border-line-strong pt-3")
              : cn(
                  "grid grid-cols-1 gap-x-4 gap-y-1 border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0",
                  item.total && "border-line-strong",
                  // Columns by the list's own width: under 420px the label goes above its value. Side by
                  // side, label and value share a baseline, a badge's word included; a skeleton has no
                  // baseline, so a loading row keeps to the top.
                  layout === "columns" && "@min-[420px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
                  layout === "columns" && !loading && "@min-[420px]:items-baseline"
                ),
            lines && loading && "items-start"
          )}
        >
          {/* In lines the label is the line itself, so it reads in the text colour; a total reads in text-strong. */}
          <dt className={cn(item.total ? "type-label text-text-strong" : cn("type-body", lines ? "text-text" : "text-text-subtle"), lines && "min-w-0 wrap-anywhere")}>{item.label}</dt>
          <dd
            className={cn(
              "min-w-0",
              item.total ? "type-label text-text-strong" : "type-body text-text",
              // A value never gives way to its label, up to two thirds of the line; past that a long one wraps
              // there rather than pushing the line off a phone.
              lines ? "max-w-2/3 shrink-0 text-end tabular-nums wrap-anywhere" : "wrap-anywhere"
            )}
          >
            {loading ? (
              <Skeleton aria-hidden className={cn("my-0.5 h-4 rounded-xs", lines ? "w-16" : SKELETON_WIDTHS[index % SKELETON_WIDTHS.length])} />
            ) : item.badge && !missing(item.value) ? (
              // Both given, both shown: the value, then its state. A badge once replaced the value unseen.
              <span className="inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="min-w-0">{item.value}</span>
                <Badge tone={item.badge.tone ?? "neutral"} className="max-w-full">
                  {item.badge.label}
                </Badge>
              </span>
            ) : item.badge ? (
              <Badge tone={item.badge.tone ?? "neutral"} className="max-w-full">
                {item.badge.label}
              </Badge>
            ) : missing(item.value) ? (
              <span data-slot="description-empty" className="text-text-subtle">
                {item.empty ?? "Not set"}
              </span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
})
