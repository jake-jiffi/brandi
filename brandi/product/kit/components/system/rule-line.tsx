"use client"

import * as React from "react"

import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { StatusLine } from "./status-line"
import { TextLink } from "./text-link"

export type RuleLineState = "acted" | "failed" | "changed" | "paused"

export interface RuleLineProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** The rule's name, as people approved it. It links to the rule. */
  rule: string
  /** The rule view. */
  href: string
  /** Who approved the rule. */
  approvedBy: string
  /** When, as people read it: "[3 March]". */
  approvedOn: string
  /** acted; failed, which names the step and the system; or changed or paused since, where the line stays and says so. */
  state?: RuleLineState
  /** On failure, the step that failed: "sending the reminder". */
  step?: React.ReactNode
  /** On failure, what went wrong, naming the system: "Couldn't reach [email system]." */
  reason?: React.ReactNode
  /** One Try again after a failure. */
  onRetry?: () => void
  retryLabel?: string
}

const STATES: RuleLineState[] = ["acted", "failed", "changed", "paused"]

/** Which approved rule acted, wherever it acted: on the item it changed, in its history, and in the steps log. */
export const RuleLine = React.forwardRef<HTMLDivElement, RuleLineProps>(function RuleLine(
  { rule, href, approvedBy, approvedOn, state = "acted", step, reason, onRetry, retryLabel = "Try again", className, ...rest },
  ref
) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const line = React.useRef<HTMLParagraphElement | null>(null)
  const s: RuleLineState = STATES.includes(state) ? state : "acted"
  const failure = (name: React.ReactNode) => (
    <>
      The rule “{name}” failed{step ? <> at {step}</> : null}.{reason ? <> {reason}</> : null}
    </>
  )
  const retry = () => {
    // The line stays as the rule runs again, so focus has somewhere real to land.
    line.current?.focus()
    onRetry?.()
  }

  return (
    <div ref={merged} data-slot="rule-line" data-state={s} className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2", className)} {...rest}>
      <p ref={line} tabIndex={-1} data-slot="rule-line-text" className="flex min-w-0 flex-1 basis-60 items-start gap-2 rounded-xs type-meta text-pretty text-text-muted">
        <span aria-hidden="true" className={cn("flex h-4.5 shrink-0 items-center", s === "failed" ? "text-danger" : "text-text-muted")}>
          <Icon name={s === "failed" ? "CircleAlert" : s === "paused" ? "CirclePause" : "Workflow"} size={14} />
        </span>
        <span className="min-w-0 wrap-break-word">
          {s === "failed" ? (
            failure(<TextLink href={href}>{rule}</TextLink>)
          ) : (
            <>
              Done by the rule “<TextLink href={href}>{rule}</TextLink>”, approved by {approvedBy} on {approvedOn}.
              {s === "changed" ? " The rule has changed since." : s === "paused" ? " The rule has been paused since." : null}
            </>
          )}
        </span>
      </p>
      {/* A failure is a status message when it happens, never on load, and one Try again sits beside it. */}
      <StatusLine state={s === "failed" ? "failed" : "idle"} message={failure(rule)} showWords={false} onRetry={onRetry ? retry : undefined} retryLabel={retryLabel} />
    </div>
  )
})
