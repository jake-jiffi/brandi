import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type DescriptionBadgeTone = "success" | "warning" | "danger" | "info" | "ai" | "highlight" | "neutral"

export interface DescriptionItem {
  label: string
  value?: React.ReactNode
  /** A state as a badge instead of a value: the word carries it, the tone backs it up. */
  badge?: { label: string; tone?: DescriptionBadgeTone }
  /** What a missing value says, "Not set" by default. Never blank. */
  empty?: string
}

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: DescriptionItem[]
  /** `columns`: label beside value, stacking under 420px of its own width. `stacked`: label above value, for side panes. */
  layout?: "columns" | "stacked"
  /** The labels stay; the values wait as skeletons. */
  loading?: boolean
}

// Badge's tones, to its card, with the tone's edge so the tint reads on any ground. Badge replaces
// this span when it lands in the kit.
const TONE: Record<DescriptionBadgeTone, string> = {
  success: "border-success-line bg-success-surface text-success",
  warning: "border-warning-line bg-warning-surface text-warning",
  danger: "border-danger-line bg-danger-surface text-danger",
  info: "border-info-line bg-info-surface text-info",
  ai: "border-ai-line bg-ai-surface text-ai",
  highlight: "border-transparent bg-highlight text-on-highlight",
  neutral: "border-line bg-surface-sunken text-text-muted",
}
const SKELETON_WIDTHS = ["w-2/5", "w-3/5", "w-1/3", "w-1/2"]

const missing = (value: React.ReactNode) => value == null || value === "" || value === false

/** Label and value pairs for a record's details, in two columns or stacked. */
export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { items, layout = "columns", loading = false, className, ...rest },
  ref
) {
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
          className={cn(
            "grid grid-cols-1 gap-x-4 gap-y-1 border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0",
            // Columns by the list's own width: under 420px the label goes above its value. Side by
            // side, label and value share a baseline, a badge's word included; a skeleton has no
            // baseline, so a loading row keeps to the top.
            layout === "columns" && "@min-[420px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
            layout === "columns" && !loading && "@min-[420px]:items-baseline"
          )}
        >
          <dt className="type-body text-text-subtle">{item.label}</dt>
          <dd className="min-w-0 type-body text-text wrap-anywhere">
            {loading ? (
              <Skeleton aria-hidden className={cn("my-0.5 h-4 rounded-xs", SKELETON_WIDTHS[index % SKELETON_WIDTHS.length])} />
            ) : item.badge ? (
              <span
                data-slot="badge"
                className={cn("inline-flex h-6 max-w-full items-center truncate rounded-sm border px-2 type-caption", TONE[item.badge.tone ?? "neutral"])}
              >
                {item.badge.label}
              </span>
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
