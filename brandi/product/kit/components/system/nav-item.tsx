"use client"

import * as React from "react"

import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { Tooltip } from "./tooltip"

/**
 * What a rail tells the parts on it. `collapsed` is the rail at icons only, measured by Sidebar from its
 * own width, so tooltips mount only then: a hidden tooltip left mounted swallows an Escape. The look of
 * the narrow rail comes from container queries on Sidebar's width (under 160px), so the server and a
 * canvas draw it before any script has measured anything.
 */
interface RailState {
  inRail: boolean
  collapsed: boolean
}
export const railContext = React.createContext<RailState>({ inRail: false, collapsed: false })
export function useRail() {
  return React.useContext(railContext)
}

/** A count in words: "3 need you" waits on the reader, "12 waiting on others" on someone else. */
export function countWords(count: number, attention: boolean) {
  const n = formatNumber(count, "number")
  return attention ? `${n} ${count === 1 ? "needs" : "need"} you` : `${n} waiting on others`
}

/** A count as a positive number, or null. A canvas attribute arrives as text ("3"), so that counts too. */
export function toCount(count: unknown) {
  const n = typeof count === "string" && count.trim() !== "" ? Number(count) : count
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null
}

export interface NavItemProps {
  /** The destination, as people say it: "Approvals". */
  label: string
  href: string
  /** 18px on the rail. The icons-only rail shows nothing else, so every top-level item has one. */
  icon?: IconName
  /** The page people are on: rail-selected with a hairline, a bar in rail-text-strong, and aria-current="page". */
  current?: boolean
  /** Work waiting there. Zero shows nothing. */
  count?: number
  /** The count waits on the reader: it takes the highlight and reads "3 need you". Without it the count is grey and reads "3 waiting on others". */
  attention?: boolean
  /** A nested item under the one above: indented under its label, without an icon. The icons-only rail leaves it out. */
  sub?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  className?: string
}

/** One destination on the rail: an icon, a label and an optional count. */
export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(function NavItem(
  { label, href, icon, current = false, count, attention = false, sub = false, onClick, className },
  ref
) {
  const Link = useLink()
  const { collapsed } = useRail()
  const n = toCount(count)
  const words = n ? countWords(n, attention) : ""

  const link = (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      // A count is read as words after the label, never as a bare figure: "Approvals, 3 need you".
      aria-label={n ? `${label}, ${words}` : undefined}
      aria-current={current ? "page" : undefined}
      // The forced-colours block outlines the rail's current page by this slot.
      data-slot="sidebar-menu-button"
      data-active={current ? "true" : undefined}
      data-sub={sub ? "" : undefined}
      className={cn(
        "group/nav-item relative flex min-h-9 w-full min-w-0 items-center gap-2.5 rounded-control px-3 py-1.5 type-label text-rail-text transition-colors duration-(--duration-fast)",
        "hover:bg-rail-hover hover:text-rail-text-strong [--focus:var(--rail-focus)] focus-visible:outline-rail-focus focus-visible:outline-offset-[-2px] pointer-coarse:min-h-11",
        current && "bg-rail-selected text-rail-text-strong shadow-[inset_0_0_0_1px_var(--rail-line)] hover:bg-rail-selected",
        // The fill is a step off the rail, about 1.3:1, so the bar carries the state at 3:1 or more (WCAG 1.4.11):
        // rail-text-strong holds 4.5:1 on the rail and on the fill in every brand.
        current && "before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-rail-text-strong",
        // Lined up under the label of the item above: 12px in, the 18px icon and its 10px gap.
        sub && "pl-10 @max-[160px]/rail:hidden",
        "@max-[160px]/rail:size-10 @max-[160px]/rail:min-h-10 @max-[160px]/rail:justify-center @max-[160px]/rail:p-0 @max-[160px]/rail:pointer-coarse:size-11",
        className
      )}
    >
      {icon && !sub ? (
        <Icon
          name={icon}
          size={18}
          className={current ? undefined : "text-rail-muted transition-colors duration-(--duration-fast) group-hover/nav-item:text-rail-text-strong"}
        />
      ) : null}
      {/* A long label wraps rather than hiding words behind a mouse. Icons-only, it stays for screen readers. */}
      <span data-slot="nav-item-label" className="min-w-0 flex-1 break-words @max-[160px]/rail:sr-only">
        {label}
      </span>
      {/* A space between the word and the figure, so the visible text reads "Jobs 5" and stays inside the name (WCAG 2.5.3). */}
      {n ? " " : null}
      {n ? (
        <span
          aria-hidden="true"
          data-slot="nav-item-count"
          data-attention={attention ? "" : undefined}
          className={cn(
            "shrink-0 type-caption tabular-nums",
            attention
              ? // Icons-only, the highlight count keeps its figure on a small chip at the icon's corner: a dot alone
                // would sit at under 3:1 on a light rail, and the figure keeps the on-highlight contrast.
                "inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-highlight px-1.5 text-on-highlight @max-[160px]/rail:absolute @max-[160px]/rail:-top-0.5 @max-[160px]/rail:-right-0.5 @max-[160px]/rail:h-4 @max-[160px]/rail:min-w-4 @max-[160px]/rail:px-1"
              : // On the current row the grey count takes the rail's text colour, which holds its contrast on the fill.
                cn("px-1 @max-[160px]/rail:hidden", current ? "text-rail-text" : "text-rail-muted")
          )}
        >
          {formatNumber(n, "number")}
        </span>
      ) : null}
    </Link>
  )

  // Icons only: the label shows as a tooltip on hover, keyboard focus and a long press. It repeats the
  // link's name, so a screen reader hears it once.
  if (!collapsed || sub) return link
  return (
    <Tooltip content={n ? `${label}, ${words}` : label} placement="right">
      {link}
    </Tooltip>
  )
})
