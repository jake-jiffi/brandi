"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

import { useShell } from "./app-shell"
import { Breadcrumbs, type Crumb } from "./breadcrumbs"

export interface PageHeaderProps {
  /** The noun people use: "Clients", "[Client name]". Never "Dashboard". */
  title: React.ReactNode
  /** One line under the title, capped at the measure. */
  description?: React.ReactNode
  /** From two levels deep: the trail down to this page, which comes last. */
  breadcrumbs?: Crumb[]
  /** The secondary actions, as Buttons. Built in the board's script on a canvas. */
  actions?: React.ReactNode
  /** The one primary action, last on the right. On a phone inside AppShell it moves to the bar at the foot. */
  primary?: React.ReactNode
  /** Badges beside the title, such as SampleBadge or a status. */
  meta?: React.ReactNode
  /** The title's level. 1 on a page, where it is the only h1. */
  headingLevel?: 1 | 2 | 3
  /** Tabs, under the header. */
  children?: React.ReactNode
  className?: string
}

/**
 * Puts focus on the page's title, after an action removed the control people pressed, so focus never
 * falls to the page body. Leaves focus alone when it is already somewhere other than the body.
 */
function focusTitle() {
  const now = document.activeElement
  if (now && now !== document.body) return false
  const title = document.querySelector<HTMLElement>('[data-slot="page-title"]')
  title?.focus()
  return Boolean(title)
}

const Header = React.forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, description, breadcrumbs, actions, primary, meta, headingLevel = 1, children, className },
  ref
) {
  const shell = useShell()
  const Heading = `h${headingLevel}` as const

  // On a phone a long title is cut at two lines. Its whole text stays in the heading, so a screen reader
  // hears it all, and once it is cut the title becomes a button that shows it whole, for touch and keys.
  const [expanded, setExpanded] = React.useState(false)
  const [cut, setCut] = React.useState(false)
  const [text, setText] = React.useState<HTMLSpanElement | null>(null)
  React.useLayoutEffect(() => {
    if (!text || expanded) return
    const measure = () => setCut(text.scrollHeight > text.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(text)
    let live = true
    document.fonts?.ready.then(() => {
      if (live) measure()
    })
    return () => {
      live = false
      observer.disconnect()
    }
  }, [text, expanded])
  const toggles = cut || expanded

  const words = (
    <span ref={setText} data-slot="page-title-text" className={cn("block break-words", !expanded && "@max-[640px]/page-header:line-clamp-2")}>
      {title}
    </span>
  )

  // Inside AppShell on a phone, with no tab bar at the foot, the primary moves to the bar there.
  const bar = shell?.actionBar ?? null
  const hasActions = Boolean(actions) || (Boolean(primary) && !bar)

  return (
    <header ref={ref} data-slot="page-header" className={cn("@container/page-header flex min-w-0 flex-col gap-3", className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div data-slot="page-header-row" className="flex min-w-0 items-start gap-6 @max-[640px]/page-header:flex-col @max-[640px]/page-header:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1 @max-[640px]/page-header:w-full">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
            {/* Focusable from script only, so focus can land here after an action removes what had it. */}
            {/* A display face set in capitals keeps them for short titles; a long one reads in its own case, since
                a line of capitals is hard going past a few words. */}
            <Heading tabIndex={-1} data-slot="page-title" className={cn("min-w-0 max-w-full rounded-xs type-title text-balance text-text-strong", typeof title === "string" && title.length > 40 && "normal-case")}>
              {toggles ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  data-slot="page-title-toggle"
                  onClick={() => setExpanded((was) => !was)}
                  className="block max-w-full rounded-action text-left"
                >
                  {words}
                </button>
              ) : (
                words
              )}
            </Heading>
            {meta ? (
              <div data-slot="page-header-meta" className="flex flex-wrap items-center gap-2">
                {meta}
              </div>
            ) : null}
          </div>
          {description ? (
            <p data-slot="page-header-description" className="max-w-measure type-body text-pretty text-text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {hasActions ? (
          <div data-slot="page-header-actions" className="flex shrink-0 flex-wrap items-center gap-2 @max-[640px]/page-header:w-full">
            {actions}
            {bar ? null : primary}
          </div>
        ) : null}
      </div>
      {children ? <div data-slot="page-header-tabs" className="min-w-0">{children}</div> : null}
      {primary && bar ? createPortal(primary, bar) : null}
    </header>
  )
})

/** The top of every page: breadcrumbs, the title with its badges, a description, the actions, and Tabs underneath. */
export const PageHeader = Object.assign(Header, { focusTitle })
