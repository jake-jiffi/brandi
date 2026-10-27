"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { NavItem, useRail, type NavItemProps } from "./nav-item"

export interface NavGroupProps {
  /** A short label, shown in capitals: "Work". Leave it out for the group at the top of the rail. */
  label?: string
  /** The label becomes a button that opens and closes the group. */
  collapsible?: boolean
  /** Whether a collapsible group starts open. */
  defaultOpen?: boolean
  /** The items as data, for a canvas: each is a NavItem's props. */
  items?: NavItemProps[]
  /** NavItems, when they are not given as `items`. */
  children?: React.ReactNode
  className?: string
}

/** NavItems on the rail under a short uppercase label, optionally collapsible. */
export const NavGroup = React.forwardRef<HTMLDivElement, NavGroupProps>(function NavGroup(
  { label, collapsible = false, defaultOpen = true, items, children, className },
  ref
) {
  const { collapsed } = useRail()
  const [open, setOpen] = React.useState(defaultOpen)
  const id = React.useId()
  const labelId = `${id}-label`
  const listId = `${id}-list`
  // The icons-only rail has no label to press, so every group shows its items there.
  const shown = collapsed || !collapsible || open
  const entries = items
    ? items.map((item, i) => <NavItem key={`${i}-${item.href}`} {...item} />)
    : React.Children.toArray(children).filter(Boolean)
  // Nested items have no icon to show on the icons-only rail, so they leave it, list item and all.
  const isSub = (entry: React.ReactNode) => React.isValidElement<{ sub?: boolean }>(entry) && Boolean(entry.props.sub)

  return (
    <div
      ref={ref}
      data-slot="nav-group"
      className={cn(
        "flex min-w-0 flex-col gap-1",
        // Icons only, a hairline stands in for the label between groups.
        "@max-[160px]/rail:items-center @max-[160px]/rail:not-first:border-t @max-[160px]/rail:not-first:border-rail-line @max-[160px]/rail:not-first:pt-3",
        className
      )}
    >
      {label ? (
        collapsible && !collapsed ? (
          <button
            type="button"
            id={labelId}
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((was) => !was)}
            data-slot="nav-group-label"
            className="flex h-7 w-full items-center justify-between gap-2 rounded-action px-3 text-left type-eyebrow text-rail-muted transition-colors duration-(--duration-fast) hover:bg-rail-hover hover:text-rail-text-strong focus-visible:outline-rail-focus focus-visible:outline-offset-[-2px] pointer-coarse:h-10 @max-[160px]/rail:sr-only"
          >
            <span className="min-w-0 truncate">{label}</span>
            <Icon name="ChevronDown" size={14} className={cn("motion-safe:transition-transform motion-safe:duration-(--duration-fast)", !open && "-rotate-90")} />
          </button>
        ) : (
          <div id={labelId} data-slot="nav-group-label" className="flex h-7 items-center px-3 type-eyebrow text-rail-muted @max-[160px]/rail:sr-only">
            {label}
          </div>
        )
      ) : null}
      <ul
        id={listId}
        aria-labelledby={label ? labelId : undefined}
        hidden={!shown}
        data-slot="nav-group-list"
        className="flex min-w-0 flex-col gap-0.5 @max-[160px]/rail:items-center"
      >
        {entries.map((entry, i) => (
          <li key={React.isValidElement(entry) && entry.key != null ? entry.key : i} className={cn("flex min-w-0", isSub(entry) && "@max-[160px]/rail:hidden")}>
            {entry}
          </li>
        ))}
      </ul>
    </div>
  )
})
