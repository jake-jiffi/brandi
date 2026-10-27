"use client"

import * as React from "react"

import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { toSlug } from "./tabs"

/** One destination. A plain string links to `#its-slug` on the same page. */
export interface SideNavLink {
  label: string
  href: string
  icon?: IconName
}

export interface SideNavProps {
  items: Array<string | SideNavLink>
  /**
   * The current item: its href, or for a string item its slug. Nothing is current until it is set, so
   * the page decides, and the component never guesses from the scroll position.
   */
  value?: string
  /** Names the navigation for a screen reader: "Settings sections". */
  label?: string
  className?: string
}

/** In-page navigation for settings and long documents, sticky beside the sections it lists. */
export const SideNav = React.forwardRef<HTMLElement, SideNavProps>(function SideNav({ items, value, label = "On this page", className }, ref) {
  const Link = useLink()
  return (
    <nav ref={ref} aria-label={label} data-slot="side-nav" className={cn("sticky top-6 w-full self-start", className)}>
      <ul className="flex flex-col gap-0.5">
        {items.map((item, i) => {
          // A label with no Latin letters or digits has no slug; its place keeps the anchor unique.
          const link = typeof item === "string" ? { label: item, href: `#${toSlug(item) || `section-${i + 1}`}` } : item
          const key = link.href.startsWith("#") ? link.href.slice(1) : link.href
          const current = value !== undefined && (value === key || value === link.href)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                data-slot="section-nav-link"
                aria-current={current ? "true" : undefined}
                className={cn(
                  "flex min-h-9 items-center gap-2.5 rounded-control px-3 py-1.5 type-label text-text-muted transition-colors duration-(--duration-fast) hover:bg-hover hover:text-text-strong pointer-coarse:min-h-11",
                  current && "bg-selected-strong text-text-strong shadow-[inset_0_0_0_1px_var(--selected-line)] hover:bg-selected-strong"
                )}
              >
                {link.icon ? <Icon name={link.icon} className={current ? undefined : "text-text-subtle"} /> : null}
                <span className="min-w-0">{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
})
