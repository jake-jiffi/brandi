"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { ProductLockup } from "./product-lockup"

export interface PhoneTopBarProps {
  /** The screen's title, for a detail screen. One line, cut with an ellipsis; the page's heading below carries it whole. */
  title?: string
  /** Makes the title a heading at this level, for a task screen with no page header below it: 1 when it is the page's one h1. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  /** Back to the screen above: `{ href, label }`, where label names it: "[Invoices]". Read as "Back to [Invoices]". */
  back?: { href: string; label: string }
  /** Shows the menu button, which opens the navigation drawer. AppShell passes it. */
  onMenu?: () => void
  /** Whether the drawer the menu button opens is open. */
  menuExpanded?: boolean
  /** The menu button, so focus can come back to it when the drawer closes. */
  menuRef?: React.Ref<HTMLButtonElement>
  /** The product's name for the lockup, shown when there is no title. */
  product?: string
  /** Where the lockup links. Without it the lockup is not a link. */
  home?: string
  /** Icon buttons at the far end, one or two. Built in the board's script on a canvas. */
  actions?: React.ReactNode
  className?: string
}

/** The top bar under 1024px of shell: the menu button and the lockup, or Back and the screen's title. */
export const PhoneTopBar = React.forwardRef<HTMLElement, PhoneTopBarProps>(function PhoneTopBar(
  { title, headingLevel, back, onMenu, menuExpanded = false, menuRef, product, home, actions, className },
  ref
) {
  const Link = useLink()
  // On the rail's own colours: under 1024px of shell this bar does the rail's job.
  const control = "text-rail-text-strong hover:bg-rail-hover focus-visible:outline-rail-focus"
  return (
    <header
      ref={ref}
      data-slot="phone-top-bar"
      // on-rail: the actions a product passes in are ghost buttons drawn in the page's roles, so the bar
      // points those roles at the rail's.
      className={cn("on-rail flex h-14 min-w-0 shrink-0 items-center gap-1 border-b border-rail-line bg-rail px-2 text-rail-text-strong", className)}
    >
      {back ? (
        <ButtonBase asChild variant="ghost" size="icon" className={control}>
          <Link href={back.href} aria-label={`Back to ${back.label}`} data-slot="phone-top-bar-back">
            <Icon name="ChevronLeft" size={20} />
          </Link>
        </ButtonBase>
      ) : onMenu ? (
        // No tooltip: one left open as the drawer takes focus would hold the drawer's first Escape.
        <ButtonBase
          ref={menuRef}
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          aria-haspopup="dialog"
          aria-expanded={menuExpanded}
          data-slot="phone-top-bar-menu"
          className={control}
          onClick={onMenu}
        >
          <Icon name="Menu" size={20} />
        </ButtonBase>
      ) : null}
      <div className={cn("flex min-w-0 flex-1 items-center", back || onMenu ? "px-1" : "px-2")}>
        {title ? (
          // A paragraph by default, because the page header below holds the heading; a heading when nothing does.
          // As the page's h1 it steps up to heading-lg, so the page keeps a hierarchy above its body text.
          React.createElement(
            headingLevel && Number(headingLevel) >= 1 && Number(headingLevel) <= 6 ? `h${Number(headingLevel)}` : "p",
            { "data-slot": "phone-top-bar-title", className: cn("min-w-0 truncate", Number(headingLevel) === 1 ? "type-heading-lg" : "type-heading") },
            title
          )
        ) : (
          // The rendition made for the rail's ground, picked in CSS from the rail's tone, so a direction's class moves it.
          <ProductLockup tone="rail" color="rail" product={product} href={home} height={20} />
        )}
      </div>
      {actions ? (
        <div data-slot="phone-top-bar-actions" className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  )
})
