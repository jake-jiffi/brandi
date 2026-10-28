"use client"

import * as React from "react"

import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export interface TextLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Where it goes. The text says where, and is unique on the page: never "here" or "more". */
  href: string
  /** An icon before the text, such as ArrowLeft for a way back. */
  icon?: IconName
  /** An icon after the text, such as ArrowRight or ExternalLink. */
  iconRight?: IconName
  /** On its own rather than in a sentence (a card's See all, Forgot your password?): its tap area grows to 40px on touch. */
  standalone?: boolean
  children: React.ReactNode
}

/** An underlined inline link in the link colour. Links navigate; buttons act. */
export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(function TextLink(
  { href, icon, iconRight, standalone = false, target, rel, className, children, ...rest },
  ref
) {
  const Link = useLink() as React.ElementType
  const newTab = target === "_blank"
  return (
    <Link
      ref={ref}
      href={href}
      target={target}
      rel={newTab ? (rel ?? "noopener noreferrer") : rel}
      data-slot="text-link"
      // Vertical padding on an inline box grows its target to 24px without moving the line it sits on.
      // The colour and the underline are important because a canvas board's base styles reset every link
      // outside any layer, which beats a layered utility: without it a board would draw the link as text.
      // On its own, a link is pressable like any control, so on touch its tap area is 40px, centred on it, with no
      // change to how it looks. In a sentence it keeps the 24px WCAG target, so it never reaches over the lines
      // beside it.
      className={cn(
        "py-1 text-link! underline decoration-auto! underline-offset-4! transition-colors hover:text-link-hover!",
        standalone && "relative pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:inset-y-[calc(50%-20px)]",
        className
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} size={14} className="mr-1 inline-block align-[-2px]" /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={14} className="ml-1 inline-block align-[-2px]" /> : null}
      {newTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </Link>
  )
})
