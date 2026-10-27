"use client"

import * as React from "react"

import type { IconName } from "@/lib/icons"
import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { Tooltip, useTruncated } from "./tooltip"

export interface SourceProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> {
  /** Where the figure came from: the record, the report, the document. */
  href: string
  /** What kind of source it is. Decoration: the label says what it is. */
  icon?: IconName
  /** The document and the place in it: "[March] ledger, [accounting system]", "[Invoice 1042], line 3". */
  children: React.ReactNode
}

/** A citation chip under an answer: where a figure came from, linking to it, with a full touch target. */
export const Source = React.forwardRef<HTMLAnchorElement, SourceProps>(function Source(
  { href, icon = "FileText", target, rel, className, children, ...rest },
  ref
) {
  const Link = useLink() as React.ElementType
  const [label, setLabel] = React.useState<HTMLSpanElement | null>(null)
  const cut = useTruncated(label)
  const newTab = target === "_blank"

  const chip = (
    <Link
      ref={ref}
      href={href}
      target={target}
      rel={newTab ? (rel ?? "noopener noreferrer") : rel}
      data-slot="source"
      // Pressable, so the control corners. 28px on a desktop, 44px on a touch screen: the chip itself is the target.
      className={cn(
        "inline-flex h-7 max-w-full min-w-0 shrink-0 items-center gap-1.5 rounded-control border border-line-control bg-surface px-2.5 type-meta text-text-strong no-underline transition-colors hover:bg-hover active:bg-pressed pointer-coarse:h-11 pointer-coarse:px-3.5",
        className
      )}
      {...rest}
    >
      <Icon name={icon} size={14} className="text-text-muted" />
      <span ref={setLabel} data-slot="source-label" className="max-w-64 min-w-0 truncate">
        {children}
      </span>
      {newTab ? (
        <>
          <Icon name="ExternalLink" size={12} className="text-text-muted" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      ) : null}
    </Link>
  )
  // A label cut short shows in full on hover, on keyboard focus and on a long press. Its name is the full label either way.
  return cut ? <Tooltip content={children}>{chip}</Tooltip> : chip
})
