import * as React from "react"

import { Badge as BadgeBase } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { BadgeSize } from "./badge"
import { Icon } from "./icon"

export interface SampleBadgeProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  /** 20 or 24px tall. Beside a page title it is 24. */
  size?: BadgeSize
  /** The words, when the product's own differ. */
  children?: React.ReactNode
}

/**
 * Marks a screen or card whose figures are samples, until the real connection is live. Dashed, so it
 * never reads as a record's status.
 */
export const SampleBadge = React.forwardRef<HTMLSpanElement, SampleBadgeProps>(function SampleBadge(
  { size = "md", className, children = "Sample data", ...rest },
  ref
) {
  return (
    <BadgeBase
      ref={ref}
      variant="neutral"
      size={size}
      data-slot="sample-badge"
      // Its own surface under the words, so it reads on any ground: on a brand-coloured field the muted
      // words once fell to 3.4:1.
      className={cn("border-dashed border-line-control bg-surface text-text-muted", className)}
      {...rest}
    >
      <Icon name="FlaskConical" size={12} />
      {children}
    </BadgeBase>
  )
})
