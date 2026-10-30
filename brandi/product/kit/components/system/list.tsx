"use client"

import * as React from "react"

import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import type { FeedbackAction } from "./alert"
import { cardNesting } from "./card"
import { EmptyState } from "./empty-state"
import { ListRow, listRowContext, type ListRowProps } from "./list-row"
import { Skeleton } from "./skeleton"

/** One row as data: ListRow's props, and an id that keeps it steady while the list changes. */
export interface ListItem extends Omit<ListRowProps, "children" | "id"> {
  id?: string | number
}

/** An empty or error state as data, so a board can pass it. */
export interface ListStateText {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: FeedbackAction[]
}

export interface ListProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** The rows as data, which a canvas needs. ListRows as children work too. */
  items?: ListItem[]
  /** The surface, a hairline and radius-md around the rows. Inside a card the card is the box, so it draws none. */
  boxed?: boolean
  /** Hairlines between rows. */
  divided?: boolean
  /** The rows wait as skeletons, and the list says it is loading. */
  loading?: boolean
  /** How many skeleton rows stand in while it loads. */
  loadingRows?: number
  /** What leads each skeleton row: the rows' avatar or icon tile, or nothing. Taken from the items when there are any. */
  loadingLeading?: "avatar" | "icon" | "none"
  /** What an empty list says: a sentence, the same as data, or an EmptyState. */
  empty?: React.ReactNode | ListStateText
  /** What it says when its rows could not load, naming the system: a sentence, the same as data, or an EmptyState. */
  error?: React.ReactNode | ListStateText
  /** Adds Try again to the error. */
  onRetry?: () => void
  /** The level of an empty or error state's title. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** ListRows. */
  children?: React.ReactNode
}

const shows = (node: unknown) => node !== undefined && node !== null && node !== false && node !== ""
const isItem = (item: unknown): item is ListItem => typeof item === "object" && item !== null && !React.isValidElement(item)

/**
 * An empty or error state in place of rows, from a sentence, the same as data, or an element. Shared with
 * DataTable, whose empty and error states read the same way.
 */
export function stateView(
  node: React.ReactNode | ListStateText,
  { kind, headingLevel = 3, onRetry, fallback }: { kind: "empty" | "error"; headingLevel?: 2 | 3 | 4 | 5 | 6; onRetry?: () => void; fallback: string }
): React.ReactNode {
  if (React.isValidElement(node)) return node
  const retry: FeedbackAction[] = kind === "error" && onRetry ? [{ label: "Try again", icon: "RefreshCw", onClick: onRetry }] : []
  const icon: IconName | undefined = kind === "error" ? "CloudOff" : undefined
  // Data of the wrong shape (an object with no title, actions that are no list) reads as the fallback, never a crash.
  const data = typeof node === "object" && node !== null && !Array.isArray(node) ? (node as Partial<ListStateText>) : null
  const title = data ? (shows(data.title) ? data.title : fallback) : shows(node) ? (node as React.ReactNode) : fallback
  const actions = data && Array.isArray(data.actions) ? data.actions : []
  return (
    <EmptyState size="section" flat icon={icon} title={title} actions={[...actions, ...retry]} headingLevel={headingLevel}>
      {data?.description}
    </EmptyState>
  )
}

/** A column of ListRows: records on phones, inboxes, queues, and the left pane of list and detail. */
export const List = React.forwardRef<HTMLElement, ListProps>(function List(
  { items, boxed = true, divided = true, loading = false, loadingRows = 3, loadingLeading, empty, error, onRetry, headingLevel = 3, className, children, onKeyDown, ...rest },
  ref
) {
  const nested = React.useContext(cardNesting)
  // Never a card inside a card: inside one, the card is the box.
  const box = boxed && !nested
  const rows = Array.isArray(items) ? items.filter(isItem) : []
  const hasChildren = React.Children.toArray(children).length > 0
  const frame = cn("@container flex flex-col", box && "rounded-md border border-line bg-surface", className)
  const context = React.useMemo(() => ({ inList: true, divided }), [divided])

  if (loading) {
    const count = Math.max(1, Math.min(12, Math.floor(Number(loadingRows)) || 3))
    // A skeleton is the shape of the rows to come, so it leads with an avatar only where they have one.
    const first = Array.isArray(items) ? items[0] : undefined
    const lead = loadingLeading ?? (first?.avatar ? "avatar" : first?.icon ? "icon" : "none")
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} data-slot="list" data-boxed={box || undefined} aria-busy="true" className={frame} {...rest}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            data-slot="list-skeleton-row"
            className={cn("flex items-center gap-3 py-3", nested ? "px-6 @max-[359px]:px-4" : "px-4", divided && i > 0 && "border-t border-line")}
          >
            {lead === "avatar" ? <Skeleton circle width={40} /> : lead === "icon" ? <Skeleton width={40} height={40} className="rounded-md" /> : null}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton height={12} width={["55%", "40%", "48%"][i % 3]} />
              <Skeleton height={10} width={["35%", "50%", "28%"][i % 3]} />
            </div>
          </div>
        ))}
        <span role="status" className="sr-only">
          Loading
        </span>
      </div>
    )
  }

  if (shows(error) || (!rows.length && !hasChildren)) {
    const failed = shows(error)
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} data-slot="list" data-boxed={box || undefined} data-state={failed ? "error" : "empty"} className={frame} {...rest}>
        {failed
          ? stateView(error as React.ReactNode | ListStateText, { kind: "error", headingLevel, onRetry, fallback: "These rows could not load." })
          : stateView(empty as React.ReactNode | ListStateText, { kind: "empty", headingLevel, fallback: "Nothing to show yet." })}
      </div>
    )
  }

  // Up and Down move between the rows that open something, Home and End to the first and last, so a queue is worked
  // from the keyboard row by row; Tab still leaves the list. Queues and Help promised the keys and the list had none.
  const moveBetweenRows = (event: React.KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    const list = event.currentTarget
    const from = (event.target as HTMLElement).closest('[data-slot="list-row-action"]')
    const actions = [...list.querySelectorAll<HTMLElement>('[data-slot="list-row-action"]')].filter((el) => el.closest('[data-slot="list"]') === list)
    const at = from ? actions.indexOf(from as HTMLElement) : -1
    if (at < 0) return
    const to = event.key === "Home" ? 0 : event.key === "End" ? actions.length - 1 : at + (event.key === "ArrowDown" ? 1 : -1)
    if (to < 0 || to >= actions.length || to === at) return
    event.preventDefault()
    actions[to].focus()
  }

  return (
    <ul
      ref={ref as React.Ref<HTMLUListElement>}
      // A list with its bullets taken off loses its role in some screen readers, so it says it.
      role="list"
      data-slot="list"
      data-boxed={box || undefined}
      className={frame}
      onKeyDown={moveBetweenRows}
      {...rest}
    >
      <listRowContext.Provider value={context}>
        {rows.map((row, i) => {
          const { id, ...props } = row
          return <ListRow key={id ?? i} {...props} />
        })}
        {children}
      </listRowContext.Provider>
    </ul>
  )
})
