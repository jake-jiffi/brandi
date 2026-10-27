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
  { title, back, onMenu, menuExpanded = false, menuRef, product, home, actions, className },
  ref
) {
  const Link = useLink()
  // On the rail's own colours: under 1024px of shell this bar does the rail's job.
  const control = "text-rail-text-strong hover:bg-rail-hover focus-visible:outline-rail-focus"
  return (
    <header
      ref={ref}
      data-slot="phone-top-bar"
      className={cn("flex h-14 min-w-0 shrink-0 items-center gap-1 border-b border-rail-line bg-rail px-2 text-rail-text-strong", className)}
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
          <p data-slot="phone-top-bar-title" className="min-w-0 truncate type-heading">
            {title}
          </p>
        ) : (
          <ProductLockup product={product} href={home} height={20} />
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
