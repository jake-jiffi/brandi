"use client"

import * as React from "react"

import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { countWords, toCount } from "./nav-item"

/** One top-level place. */
export interface PhoneTab {
  label: string
  href: string
  icon: IconName
  /** Work waiting there. Zero shows nothing. */
  count?: number
  /** The count waits on the reader: highlight, read as "3 need you". */
  attention?: boolean
}

export interface PhoneTabBarProps {
  /** Three to five places. */
  items: PhoneTab[]
  /** The current place's href: it takes aria-current="page". Nothing is current until it is set. */
  value?: string
  /** Names the navigation for a screen reader. */
  label?: string
  className?: string
}

/** Three to five top-level places at the foot of a phone app. */
export const PhoneTabBar = React.forwardRef<HTMLElement, PhoneTabBarProps>(function PhoneTabBar({ items, value, label = "Main", className }, ref) {
  const Link = useLink()
  return (
    <nav
      ref={ref}
      aria-label={label}
      data-slot="phone-tab-bar"
      // The home indicator's strip stays clear on a phone with one.
      className={cn("shrink-0 border-t border-rail-line bg-rail pb-[env(safe-area-inset-bottom)]", className)}
    >
      <ul className="flex gap-2 px-2 py-1.5">
        {items.map((item) => {
          const current = value !== undefined && value === item.href
          const n = toCount(item.count)
          return (
            <li key={item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                // A count is read as words after the label: "Approvals, 3 need you".
                aria-label={n ? `${item.label}, ${countWords(n, Boolean(item.attention))}` : undefined}
                aria-current={current ? "page" : undefined}
                data-slot="phone-tab"
                className={cn(
                  "group/tab relative flex min-h-12 w-full min-w-0 flex-col-reverse items-center justify-center gap-0.5 rounded-control px-1 pt-1 pb-0.5 type-caption text-rail-text transition-colors duration-(--duration-fast) hover:text-rail-text-strong focus-visible:outline-rail-focus focus-visible:outline-offset-[-2px]",
                  // The icon's fill is a step off the bar, about 1.3:1, so a bar along the top in rail-text-strong carries
                  // the state at 3:1 or more (WCAG 1.4.11) in every brand.
                  current && "text-rail-text-strong before:absolute before:inset-x-[calc(50%-16px)] before:top-0 before:h-[3px] before:rounded-full before:bg-rail-text-strong",
                  // Forced colours paint no fills, so the current place is outlined instead.
                  "forced-colors:aria-[current=page]:outline-2 forced-colors:aria-[current=page]:-outline-offset-2 forced-colors:aria-[current=page]:outline-solid forced-colors:aria-[current=page]:outline-[color:Highlight]"
                )}
              >
                {/* The label comes first in the source and draws under the icon, so the visible text reads "Approvals 3"
                    and stays inside the name (WCAG 2.5.3). */}
                <span className="max-w-full truncate">{item.label}</span>
                {n ? " " : null}
                <span
                  data-slot="phone-tab-icon"
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-control transition-colors duration-(--duration-fast)",
                    current ? "bg-rail-selected shadow-[inset_0_0_0_1px_var(--rail-line)]" : "group-hover/tab:bg-rail-hover"
                  )}
                >
                  <span className="relative flex">
                    <Icon name={item.icon} size={20} />
                    {n ? (
                      <span
                        aria-hidden="true"
                        data-slot="phone-tab-count"
                        className={cn(
                          "absolute -top-1.5 left-3 inline-flex h-4 min-w-4 items-center justify-center rounded-sm px-1 type-caption tabular-nums",
                          // A grey count's chip is edged in rail-muted, 3:1 or more on the bar, so it reads as a count and
                          // not a stray figure: rail-line is only a step off the bar.
                          item.attention ? "bg-highlight text-on-highlight" : "bg-rail text-rail-text shadow-[inset_0_0_0_1px_var(--rail-muted)]"
                        )}
                      >
                        {formatNumber(n, "number")}
                      </span>
                    ) : null}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
})
