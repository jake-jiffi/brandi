import * as React from "react"

import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export interface ThinkingProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** The work, named: "Reading [12] invoices…". Thinking… only until the work is known. */
  children?: React.ReactNode
  /** A polite status, so each new line is read out. false inside something with a status line of its own, as AIAnswer and AIProposal have. */
  live?: boolean
}

/** The assistant's working line: a small spinner, then what it is doing. */
export const Thinking = React.forwardRef<HTMLDivElement, ThinkingProps>(function Thinking({ children, live = true, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      data-slot="thinking"
      role={live ? "status" : undefined}
      className={cn("inline-flex max-w-full items-start gap-2 type-body text-text-muted", className)}
      {...rest}
    >
      {/* The words carry the status; the spinner only says the work is still going. */}
      <Icon name="LoaderCircle" className="mt-1 animate-spin text-ai" />
      <span data-slot="thinking-work" className="min-w-0 py-0.5 wrap-break-word">
        {children || "Thinking…"}
      </span>
    </div>
  )
})
