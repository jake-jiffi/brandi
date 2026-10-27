import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export type TimelineTone = "neutral" | "success" | "warning" | "danger" | "info" | "ai"

export interface TimelineItem {
  /** Who did what: "[Name] approved 14 [records]". */
  text: React.ReactNode
  /** When, as people read it: "Today, 9:41 am". */
  time: string
  /** By kind of event. Defaults to the tone's own icon. */
  icon?: IconName
  /** `ai` for the assistant's actions, so people can tell them apart. */
  tone?: TimelineTone
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Newest first. */
  items: TimelineItem[]
  loading?: boolean
  /** What shows when nothing has happened yet. */
  empty?: React.ReactNode
  /** The history could not load: say which system failed. Any items given stay, as the last good copy. */
  error?: React.ReactNode
}

// Each tile takes its tone's tint and edge, so it reads on a card and on the canvas alike.
const TONE: Record<TimelineTone, { tile: string; icon: IconName }> = {
  neutral: { tile: "border-line bg-surface text-text-muted", icon: "Circle" },
  success: { tile: "border-success-line bg-success-surface text-success", icon: "CircleCheck" },
  warning: { tile: "border-warning-line bg-warning-surface text-warning", icon: "TriangleAlert" },
  danger: { tile: "border-danger-line bg-danger-surface text-danger", icon: "CircleX" },
  info: { tile: "border-info-line bg-info-surface text-info", icon: "Info" },
  ai: { tile: "border-ai-line bg-ai-surface text-ai", icon: "Sparkles" },
}

/** What happened to a record, newest first, with an icon by kind and a time. */
export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(function Timeline(
  { items, loading = false, empty = "No activity yet", error, className, ...rest },
  ref
) {
  return (
    <div ref={ref} data-slot="timeline" aria-busy={loading || undefined} className={cn("flex flex-col gap-4", className)} {...rest}>
      {error != null && !loading ? (
        <p data-slot="timeline-error" className="flex items-start gap-2 type-body text-text">
          <span className="flex h-5 items-center text-danger">
            <Icon name="CircleAlert" />
          </span>
          <span>{error}</span>
        </p>
      ) : null}
      {loading ? (
        <div role="status" data-slot="timeline-loading" className="flex flex-col gap-5">
          <span className="sr-only">Loading activity</span>
          {[0, 1, 2].map((row) => (
            <div key={row} aria-hidden className="flex gap-3">
              <Skeleton className="size-7 shrink-0 rounded-sm" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <Skeleton className={cn("h-3.5 rounded-xs", row === 1 ? "w-1/2" : "w-3/4")} />
                <Skeleton className="h-3 w-24 rounded-xs" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length ? (
        // An ordered list, in reading order: a screen reader hears each event, then its time.
        <ol data-slot="timeline-list" className="flex flex-col">
          {items.map((item, index) => {
            const tone = TONE[item.tone ?? "neutral"] ?? TONE.neutral
            const last = index === items.length - 1
            return (
              <li key={index} data-slot="timeline-item" data-tone={item.tone ?? "neutral"} className="flex gap-3">
                <div aria-hidden className="flex flex-col items-center">
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-sm border", tone.tile)}>
                    <Icon name={item.icon ?? tone.icon} size={14} />
                  </span>
                  {/* A border, not a fill, so the line survives forced colours. */}
                  {last ? null : <span className="my-1 w-0 flex-1 border-l border-line" />}
                </div>
                <div className={cn("flex min-w-0 flex-col gap-0.5 pt-1", !last && "pb-5")}>
                  <p className="type-body text-text">{item.text}</p>
                  <p className="type-meta text-text-subtle">{item.time}</p>
                </div>
              </li>
            )
          })}
        </ol>
      ) : error == null ? (
        <p data-slot="timeline-empty" className="type-body text-text-muted">
          {empty}
        </p>
      ) : null}
    </div>
  )
})
