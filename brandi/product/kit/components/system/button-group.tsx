import * as React from "react"

import { cn } from "@/lib/utils"

export interface ButtonGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Names the group for screen readers ("[Invoice] actions"). Without one it is a plain row. */
  label?: string
  /** `end` for a footer: the primary at the right edge, and wrapped rows aligned under it. */
  align?: "start" | "end"
}

/** Related buttons 8px apart, wrapping when the space runs out. Secondary first, the primary last, Cancel immediately left of it. */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { label, align = "start", className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      role={label ? "group" : undefined}
      aria-label={label}
      data-slot="button-group"
      data-align={align}
      className={cn("flex flex-wrap items-center gap-2", align === "end" && "justify-end", className)}
      {...rest}
    >
      {children}
    </div>
  )
})
