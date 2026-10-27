"use client"

import * as React from "react"

import { useLink } from "@/lib/link"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

export interface StepperStep {
  /** The outcome of the step: "Connect [source]". */
  label: string
  description?: string
  /** Where a finished step is revisited, when each step has its own address. */
  href?: string
}

export interface StepperProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Five steps at most: strings, or `{ label, description, href }`. */
  steps: Array<string | StepperStep>
  /** The current step, counted from 0. The length of `steps` means every step is finished. */
  current?: number
  /** `horizontal` stacks under 640px of its own width. `vertical` always stacks. */
  orientation?: "horizontal" | "vertical"
  /** Names the list for screen readers ("Setup progress"). */
  label?: string
  /** Revisits a finished step. Without it (or a step's `href`), finished steps are not pressable. */
  onStepClick?: (index: number) => void
}

type StepState = "complete" | "current" | "upcoming"
const STATE_WORDS: Record<StepState, string> = { complete: "Completed", current: "Current step", upcoming: "Not started" }

/** Progress through a short setup: finished steps take a check, the current step a ring. */
export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { steps, current = 0, orientation = "horizontal", label, onStepClick, className, ...rest },
  ref
) {
  const Link = useLink() as React.ElementType
  const list = steps.map((s) => (typeof s === "string" ? { label: s } : s))
  const horizontal = orientation === "horizontal"
  const id = React.useId()
  const currentRef = React.useRef<HTMLSpanElement | null>(null)
  // A revisited step stops being pressable, so the button that had focus goes. Focus stays on that step.
  const revisiting = React.useRef(false)
  React.useEffect(() => {
    if (!revisiting.current) return
    revisiting.current = false
    if (!document.activeElement || document.activeElement === document.body) currentRef.current?.focus()
  }, [current])

  return (
    <div ref={ref} data-slot="stepper" data-orientation={orientation} className={cn("@container w-full", className)} {...rest}>
      <ol aria-label={label} className={cn("flex flex-col", horizontal && "@min-[640px]:flex-row @min-[640px]:gap-3")}>
        {list.map((step, i) => {
          const state: StepState = i < current ? "complete" : i === current ? "current" : "upcoming"
          const last = i === list.length - 1
          const revisit = state === "complete" && (step.href || onStepClick)
          // A pressable step is named from its content, "[Label], Completed", and its description is its description:
          // an aria-label left the description's visible words outside the name (WCAG 2.5.3).
          const named = { "aria-describedby": step.description ? `${id}-${i}` : undefined }

          const indicator = (
            <span
              aria-hidden="true"
              data-slot="stepper-indicator"
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border type-caption tabular-nums transition-colors",
                state === "complete" && "border-primary bg-primary text-on-primary",
                state === "current" && "border-2 border-primary bg-surface text-text-strong forced-colors:border-[color:Highlight]",
                state === "upcoming" && "border-line-control bg-surface text-text-muted"
              )}
            >
              {state === "complete" ? <Icon name="Check" size={14} /> : i + 1}
            </span>
          )
          const text = (
            <span className="flex min-w-0 flex-col pt-0.5">
              <span
                data-slot="stepper-label"
                className={cn(
                  "type-label",
                  state === "upcoming" ? "text-text-muted" : "text-text-strong",
                  revisit && "underline-offset-4 group-hover/step:underline"
                )}
              >
                {step.label}
                <span className="sr-only">, {STATE_WORDS[state]}</span>
              </span>
              {step.description ? (
                <span id={`${id}-${i}`} aria-hidden={revisit ? "true" : undefined} data-slot="stepper-description" className="type-meta text-text-muted">
                  {step.description}
                </span>
              ) : null}
            </span>
          )
          const body = revisit ? (
            step.href ? (
              <Link href={step.href} {...named} className="group/step flex min-w-0 items-start gap-3 rounded-sm pointer-coarse:min-h-10">
                {indicator}
                {text}
              </Link>
            ) : (
              <button
                type="button"
                {...named}
                onClick={() => {
                  revisiting.current = true
                  onStepClick?.(i)
                }}
                className="group/step flex min-w-0 items-start gap-3 rounded-sm text-left pointer-coarse:min-h-10"
              >
                {indicator}
                {text}
              </button>
            )
          ) : (
            <span
              ref={state === "current" ? currentRef : undefined}
              tabIndex={state === "current" ? -1 : undefined}
              className="flex min-w-0 items-start gap-3 rounded-sm"
            >
              {indicator}
              {text}
            </span>
          )

          return (
            <li
              key={i}
              data-slot="stepper-step"
              data-state={state}
              aria-current={state === "current" ? "step" : undefined}
              className={cn("relative flex min-w-0 gap-3", !last && "pb-6", horizontal && "@min-[640px]:pb-0", horizontal && !last && "@min-[640px]:flex-auto")}
            >
              {body}
              {last ? null : (
                <>
                  {/* Under the indicator when stacked, after the label when in a row. Borders, so forced colours keep them. */}
                  <span
                    aria-hidden="true"
                    data-slot="stepper-connector"
                    className={cn(
                      "absolute top-7 bottom-1 left-3 border-l",
                      i < current ? "border-primary" : "border-line-strong",
                      horizontal && "@min-[640px]:hidden"
                    )}
                  />
                  {horizontal ? (
                    <span
                      aria-hidden="true"
                      data-slot="stepper-connector"
                      className={cn(
                        "mt-3 hidden h-0 min-w-6 flex-1 border-t @min-[640px]:block",
                        i < current ? "border-primary" : "border-line-strong"
                      )}
                    />
                  ) : null}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
})
