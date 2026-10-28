import * as React from "react"

import { cn } from "@/lib/utils"

import { Badge } from "./badge"

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `end` by default; `start` for narrow forms. */
  align?: "end" | "start"
  /** A destructive action, a `danger` Button, kept apart from the others. */
  destructive?: React.ReactNode
  /**
   * The section has changes nobody has saved: an "Unsaved changes" warning shows beside the actions and is said
   * once, politely. Make Save `primary` while it is set and `secondary` at rest, so a page with several sections
   * shows one primary, on the section that changed.
   */
  changed?: boolean
  /** The warning's words. */
  changedLabel?: string
}

/** The row that ends a form: Cancel, then the one primary, above a hairline. */
export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(function FormActions(
  { align = "end", destructive, changed = false, changedLabel = "Unsaved changes", className, children, ...rest },
  ref
) {
  const end = align !== "start"
  // The destructive action sits at the far end from the others, and comes in the same place in the
  // tab order as on screen.
  const apart =
    destructive != null ? (
      <div data-slot="form-actions-destructive" className={cn("flex", end ? "mr-auto" : "ml-auto")}>
        {destructive}
      </div>
    ) : null
  return (
    <div
      ref={ref}
      data-slot="form-actions"
      data-align={end ? "end" : "start"}
      className={cn("flex flex-wrap items-center gap-3 border-t border-line pt-5", end ? "justify-end" : "justify-start", className)}
      {...rest}
    >
      {end ? apart : null}
      {/* Here from the start and empty at rest (out of sight, so it takes no room in the row), so the warning is
          read when a change makes it appear. */}
      <span role="status" data-slot="form-actions-status" className={changed ? "inline-flex" : "sr-only"}>
        {changed ? (
          <Badge tone="warning" icon>
            {changedLabel}
          </Badge>
        ) : null}
      </span>
      {children}
      {end ? null : apart}
    </div>
  )
})
