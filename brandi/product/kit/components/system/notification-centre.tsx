"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip as TooltipRoot, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { EmptyState } from "./empty-state"
import { Icon } from "./icon"
import { Popover } from "./popover"
import { Sheet } from "./sheet"
import type { TimelineTone } from "./timeline"

export interface NotificationItem {
  id: string
  /** Who did what: "[Sam Lee] asked you to approve [14] timesheets". The assistant's lines name it. */
  text: string
  /** When, as people read it: "Today, 9:41 am". */
  time: string
  /** By kind of event. Defaults to the tone's own icon. */
  icon?: IconName
  /** `ai` for the assistant's events, so people can tell them apart. */
  tone?: TimelineTone
  unread?: boolean
  /** Where it leads. Without it, onOpen opens it, or a press only marks it read. */
  href?: string
}

export interface NotificationCentreProps {
  /** Newest first. */
  items: NotificationItem[]
  /** Called with the ids marked read: one as it is opened, every unread one from Mark all as read. */
  onRead?: (ids: string[]) => void
  /** Opens a notification that has no href, and closes the panel. */
  onOpen?: (id: string) => void
  /** The trigger's name and the panel's title. */
  label?: string
  /** Shows the panel open under its trigger, for a design on a board: a still picture, with no live layer. */
  open?: boolean
  /** The level of the panel's title. */
  headingLevel?: 2 | 3 | 4
  /** Skeleton rows in the panel, said once as Loading notifications. */
  loading?: boolean
  /** The notifications could not load: say which system failed. Items given stay, as the last good copy. */
  error?: React.ReactNode
  /** What the panel says when there is nothing in it. */
  empty?: React.ReactNode
  className?: string
}

// Each tile takes its tone's tint and edge, as a Timeline's does.
const TONE: Record<TimelineTone, { tile: string; icon: IconName }> = {
  neutral: { tile: "border-line bg-surface text-text-muted", icon: "Bell" },
  success: { tile: "border-success-line bg-success-surface text-success", icon: "CircleCheck" },
  warning: { tile: "border-warning-line bg-warning-surface text-warning", icon: "TriangleAlert" },
  danger: { tile: "border-danger-line bg-danger-surface text-danger", icon: "CircleX" },
  info: { tile: "border-info-line bg-info-surface text-info", icon: "Info" },
  ai: { tile: "border-ai-line bg-ai-surface text-ai", icon: "Sparkles" },
}

/** A string a screen reader hears again when it repeats: a live region skips text that has not changed. */
function useAnnouncer() {
  const [message, setMessage] = React.useState("")
  const turn = React.useRef(false)
  const say = React.useCallback((text: string) => {
    turn.current = !turn.current
    setMessage(turn.current ? text : `${text} `)
  }, [])
  return [message, say] as const
}

interface BellProps extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  count: number
  label: string
}

/** The trigger: a bell, its unread count in the highlight, and the count in words in its name. */
const Bell = React.forwardRef<HTMLButtonElement, BellProps>(function Bell({ count, label, className, ...rest }, ref) {
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <ButtonBase
          ref={ref}
          type="button"
          variant="ghost"
          size="icon"
          className={className}
          {...rest}
          data-slot="notification-trigger"
          aria-label={count > 0 ? `${label}, ${formatNumber(count)} unread` : label}
        >
          <Icon name="Bell" />
          {count > 0 ? (
            <span
              aria-hidden="true"
              data-slot="notification-count"
              className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-highlight px-1 type-caption tabular-nums text-on-highlight"
            >
              {count > 99 ? "99+" : formatNumber(count)}
            </span>
          ) : null}
        </ButtonBase>
      </TooltipTrigger>
      <TooltipContent sideOffset={4} collisionPadding={8}>
        {/* The words are the name again, so they are hidden from screen readers and the name is heard once. */}
        <span aria-hidden="true">{label}</span>
      </TooltipContent>
    </TooltipRoot>
  )
})

/**
 * The events for the signed-in person, opened from the header or the rail: a Popover on a wide screen and
 * a Sheet on a phone. The unread count is in the trigger's name, and a change to it is announced.
 */
export const NotificationCentre = React.forwardRef<HTMLButtonElement, NotificationCentreProps>(function NotificationCentre(
  { items, onRead, onOpen, label = "Notifications", open, headingLevel = 2, loading = false, error, empty = "No notifications yet.", className },
  ref
) {
  const Link = useLink() as React.ElementType
  const level = String(headingLevel) === "3" ? 3 : String(headingLevel) === "4" ? 4 : 2
  const Heading = `h${level}` as const
  const list = Array.isArray(items) ? items : []
  // The panel opens over the window, so the window decides between a popover and a sheet.
  const phone = useIsMobile(640)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [read, setRead] = React.useState<Set<string>>(() => new Set())
  const isUnread = (item: NotificationItem) => Boolean(item.unread) && !read.has(item.id)
  const unread = list.filter(isUnread).length

  const [message, say] = useAnnouncer()
  const before = React.useRef(unread)
  React.useEffect(() => {
    const was = before.current
    before.current = unread
    if (was === unread) return
    const arrived = unread - was
    say(
      arrived > 0
        ? `${arrived === 1 ? "1 new notification" : `${formatNumber(arrived)} new notifications`}. ${formatNumber(unread)} unread.`
        : unread === 0
          ? "No unread notifications."
          : `${formatNumber(unread)} unread.`
    )
  }, [unread, say])

  const listRef = React.useRef<HTMLUListElement | null>(null)
  const focusFirst = React.useRef(false)
  React.useEffect(() => {
    if (!focusFirst.current) return
    focusFirst.current = false
    listRef.current?.querySelector<HTMLElement>("[data-slot=notification-action]")?.focus()
  })

  const markRead = (ids: string[]) => {
    if (!ids.length) return
    setRead((prev) => new Set([...prev, ...ids]))
    onRead?.(ids)
  }
  // Mark all as read goes once nothing is unread, so focus moves to the first notification, never the page.
  const markAll = () => {
    focusFirst.current = true
    markRead(list.filter(isUnread).map((item) => item.id))
  }
  const press = (item: NotificationItem, close: () => void) => {
    if (isUnread(item)) markRead([item.id])
    if (item.href) close()
    else if (onOpen) {
      onOpen(item.id)
      close()
    }
  }

  const body = (close: () => void, inSheet: boolean) => {
    const inset = inSheet ? "px-6" : "px-4"
    return (
      <div data-slot="notification-panel" className="flex min-h-0 flex-col">
        {inSheet ? null : (
          <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line py-2.5 pr-2.5 pl-4">
            {/* The bell that opened the panel can sit straight above this heading, which the design detector
                reads as a decorative icon tile stacked over a heading. It is a button and its panel. */}
            <Heading data-impeccable-ignore="icon-tile-stack" className="type-heading-lg text-text-strong">{label}</Heading>
            {unread > 0 ? (
              <Button size="sm" variant="ghost" icon="CheckCheck" onClick={markAll}>
                Mark all as read
              </Button>
            ) : null}
          </div>
        )}
        {error != null && !loading ? (
          <p data-slot="notification-error" className={cn("flex items-start gap-2 border-b border-line py-3 type-body text-text", inset)}>
            <span className="flex h-5 items-center text-danger">
              <Icon name="CircleAlert" />
            </span>
            <span>{error}</span>
          </p>
        ) : null}
        {loading ? (
          <div className="flex flex-col">
            <span role="status" className="sr-only">
              Loading notifications
            </span>
            {[0, 1, 2].map((row) => (
              <div key={row} aria-hidden="true" className={cn("flex gap-3 py-3", inset, row > 0 && "border-t border-line")}>
                <Skeleton className="size-7 shrink-0 rounded-sm" />
                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <Skeleton className={cn("h-3.5 rounded-xs", row === 1 ? "w-1/2" : "w-4/5")} />
                  <Skeleton className="h-3 w-24 rounded-xs" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length ? (
          <ul ref={listRef} aria-label={label} className={cn("flex flex-col", !inSheet && "max-h-96 overflow-y-auto")}>
            {list.map((item, index) => {
              const fresh = isUnread(item)
              const tone = TONE[item.tone ?? "neutral"] ?? TONE.neutral
              const content = (
                <>
                  <span aria-hidden="true" className={cn("flex size-7 shrink-0 items-center justify-center rounded-sm border", tone.tile)}>
                    <Icon name={item.icon ?? tone.icon} size={14} />
                  </span>
                  {/* The first line sits on the tile's centre line. */}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
                    <span data-slot="notification-text" className={cn("text-pretty", fresh ? "type-label text-text-strong" : "type-body text-text-muted")}>
                      {item.text}
                    </span>
                    {/* A space between the lines, so the visible text reads as the name does (WCAG 2.5.3). */}{" "}
                    <span data-slot="notification-time" className="type-meta text-text-subtle">
                      {item.time}
                    </span>
                  </span>
                  {/* The dot is the unread state for the eye; "(unread)" says it in words. */}
                  <span aria-hidden="true" data-slot="notification-dot" className={cn("mt-2.5 size-2 shrink-0 rounded-full", fresh ? "bg-highlight" : "invisible")} />
                </>
              )
              const classes = cn(
                "flex w-full items-start gap-3 py-3 text-left transition-colors duration-(--duration-fast) hover:bg-hover focus-visible:outline-offset-[-2px]",
                inset
              )
              // An exact name that starts with what is on screen, in its order: what happened, when, then unread while it is.
              const named = `${item.text}, ${item.time}${fresh ? ", unread" : ""}`
              return (
                <li key={item.id} data-slot="notification" data-unread={fresh || undefined} className={cn(index > 0 && "border-t border-line")}>
                  {item.href ? (
                    <Link href={item.href} aria-label={named} data-slot="notification-action" className={classes} onClick={() => press(item, close)}>
                      {content}
                    </Link>
                  ) : (
                    <button type="button" aria-label={named} data-slot="notification-action" className={classes} onClick={() => press(item, close)}>
                      {content}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        ) : error == null ? (
          <EmptyState size="compact" flat icon="BellOff" title={empty} headingLevel={(level + 1) as 3 | 4 | 5}>
            New events for you show here.
          </EmptyState>
        ) : null}
      </div>
    )
  }

  const status = (
    <span role="status" data-slot="notification-status" className="sr-only">
      {message}
    </span>
  )

  if (phone && open === undefined) {
    return (
      <div data-slot="notification-centre" className={cn("relative inline-flex", className)}>
        <Bell ref={ref} count={unread} label={label} aria-haspopup="dialog" aria-expanded={sheetOpen} onClick={() => setSheetOpen(true)} />
        <Sheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={label}
          description={unread > 0 ? `${formatNumber(unread)} unread` : undefined}
          headingLevel={level}
          footer={
            unread > 0 ? (
              <Button icon="CheckCheck" onClick={markAll}>
                Mark all as read
              </Button>
            ) : undefined
          }
        >
          <div className="-mx-6 -mb-6">{body(() => setSheetOpen(false), true)}</div>
        </Sheet>
        {status}
      </div>
    )
  }

  return (
    <div data-slot="notification-centre" className={cn("relative inline-flex", className)}>
      <Popover
        ref={ref}
        label={label}
        trigger={<Bell count={unread} label={label} />}
        open={open}
        align="end"
        // A still picture for a design is part of the board, not a layer: it sits under any real overlay.
        className={cn("w-96 gap-0 overflow-hidden p-0", open !== undefined && "z-10")}
      >
        {(close) => body(close, false)}
      </Popover>
      {status}
    </div>
  )
})
