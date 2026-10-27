"use client"

import * as React from "react"

import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { hasActions, renderActions, type FeedbackAction } from "./alert"
import { Icon } from "./icon"

export type EmptyStateSize = "page" | "section" | "compact"

// Icons stay at 20 to 24px, the empty-state sizes the icon set names, and sit in flow with no tile.
const SIZE = {
  page: { root: "gap-5 px-6 py-16", icon: "size-6", picture: "h-40", button: "md" },
  section: { root: "gap-4 px-6 py-10", icon: "size-5", picture: "h-28", button: "md" },
  compact: { root: "gap-3 px-4 py-6", icon: "size-5", picture: "h-16", button: "sm" },
} as const

export interface EmptyStateProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  /** page when the empty thing is the whole page, section inside a card or pane, compact in narrow places. */
  size?: EmptyStateSize
  /** The brand's character or illustration for this state: its file, or an element. Decorative: the words carry the meaning. */
  picture?: string | React.ReactNode
  /** An icon above the title, in a quiet colour, for a brand with no character. Ignored when there is a picture. */
  icon?: IconName
  /** What is empty, as a sentence: "No clients yet." */
  title: React.ReactNode
  /** What to do next, in a line. */
  children?: React.ReactNode
  /** Buttons, or the same as data: [{ label, variant, icon, href, onClick }]. */
  actions?: React.ReactNode | FeedbackAction[]
  /** Drops its own surface and edge, for inside a card, a pane or a table body. */
  flat?: boolean
  /** The title's level: 2 for page and 3 otherwise. Pass 1 when the empty state is the whole page. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

/** Says what is empty and what to do next. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { size = "section", picture, icon, title, children, actions, flat = false, headingLevel, className, ...rest },
  ref
) {
  const s = SIZE[size]
  const level = headingLevel ?? (size === "page" ? 2 : 3)
  let media: React.ReactNode = null
  if (typeof picture === "string" && picture) {
    media = (
      <img
        src={picture}
        alt=""
        loading={size === "compact" ? "lazy" : "eager"}
        data-slot="empty-state-picture"
        className={cn("w-auto max-w-full object-contain", s.picture)}
      />
    )
  } else if (picture) {
    media = (
      <div aria-hidden="true" data-slot="empty-state-picture" className={cn("flex items-end justify-center", s.picture)}>
        {picture}
      </div>
    )
  } else if (icon) {
    media = (
      <EmptyMedia variant="icon" className="mb-0">
        <Icon name={icon} className={s.icon} />
      </EmptyMedia>
    )
  }
  return (
    <Empty
      ref={ref}
      data-slot="empty-state"
      data-size={size}
      className={cn(s.root, !flat && "border border-line bg-surface", className)}
      {...rest}
    >
      {media}
      <div className="flex max-w-measure flex-col items-center gap-1.5">
        <EmptyTitle as={`h${level}` as const}>{title}</EmptyTitle>
        {children ? <EmptyDescription>{children}</EmptyDescription> : null}
      </div>
      {hasActions(actions) ? (
        <EmptyContent data-slot="empty-state-actions" className="mt-1 max-w-none flex-row flex-wrap justify-center gap-2">
          {renderActions(actions, s.button)}
        </EmptyContent>
      ) : null}
    </Empty>
  )
})
