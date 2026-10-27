"use client"

import * as React from "react"

import { useLink } from "@/lib/link"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { focusOnward } from "./alert"
import { Button } from "./button"
import { Card } from "./card"
import { Icon } from "./icon"
import { Progress } from "./progress"

export interface OnboardingTask {
  id: string
  /** The outcome, verb first: "Connect [your bank]". */
  label: string
  /** Why it matters, or what it takes, in a line. */
  description?: string
  done?: boolean
  /** Where the task is done. Without it, onTask opens it. */
  href?: string
}

export interface OnboardingChecklistProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** What finishing gets the person, as a heading: "Get set up". */
  title?: string
  /** One line under the title. */
  description?: React.ReactNode
  /** First-run tasks, done in any order. */
  tasks: OnboardingTask[]
  /** Opens a task that has no href. */
  onTask?: (id: string) => void
  /** Called once the checklist is dismissed. It can be dismissed only when every task is done. */
  onDismiss?: () => void
  /** Names the progress bar. */
  progressLabel?: string
  headingLevel?: 2 | 3 | 4
}

/** First-run tasks someone can do in any order, with their progress in words, dismissed once all are done. */
export const OnboardingChecklist = React.forwardRef<HTMLElement, OnboardingChecklistProps>(function OnboardingChecklist(
  { title = "Get set up", description, tasks, onTask, onDismiss, progressLabel = "Setup progress", headingLevel = 2, className, ...rest },
  ref
) {
  const Link = useLink() as React.ElementType
  const ids = React.useId()
  const own = React.useRef<HTMLElement | null>(null)
  const merged = useMergedRef(ref, own)
  const [dismissed, setDismissed] = React.useState(false)
  const list = Array.isArray(tasks) ? tasks : []
  const done = list.filter((t) => t.done).length
  const total = list.length
  const complete = total > 0 && done === total
  if (dismissed || !total) return null

  // It goes from the page, so focus moves on first: to what follows it, the page title or main, never the body.
  const dismiss = () => {
    if (own.current?.contains(document.activeElement)) focusOnward(own.current)
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <Card
      ref={merged}
      data-slot="onboarding-checklist"
      data-complete={complete || undefined}
      title={title}
      description={description}
      headingLevel={headingLevel}
      flush
      actions={
        complete ? (
          <Button size="sm" variant="ghost" icon="X" aria-label={`Dismiss: ${title}`} onClick={dismiss}>
            Dismiss
          </Button>
        ) : undefined
      }
      className={className}
      {...rest}
    >
      <div className="px-6 pb-4 @max-[359px]:px-4">
        <Progress
          label={progressLabel}
          value={done}
          max={total}
          showValue
          valueLabel={`${done} of ${total} done`}
          tone={complete ? "success" : "brand"}
        />
      </div>
      <ul data-slot="onboarding-tasks" className="flex flex-col">
        {list.map((task, i) => {
          const descId = `${ids}-${i}`
          // Named from its content, the outcome then its state in words, so the visible label stays inside the
          // name (WCAG 2.5.3): an aria-label left the description outside it. The description is read as one.
          const named = { "aria-describedby": task.description ? descId : undefined }
          const content = (
            <>
              <span
                aria-hidden="true"
                data-slot="onboarding-mark"
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  task.done ? "border-primary bg-primary text-on-primary" : "border-line-control bg-surface"
                )}
              >
                {task.done ? <Icon name="Check" size={12} strokeWidth={3} /> : null}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span data-slot="onboarding-task-label" className={cn("type-label text-pretty", task.done ? "text-text-muted" : "text-text-strong")}>
                  {task.label}
                  <span className="sr-only">, {task.done ? "Done" : "Not started"}</span>
                </span>
                {task.description ? (
                  <span id={descId} aria-hidden="true" data-slot="onboarding-task-description" className="type-meta text-pretty text-text-muted">
                    {task.description}
                  </span>
                ) : null}
              </span>
              {task.done ? (
                <span aria-hidden="true" data-slot="onboarding-task-done" className="flex h-5 shrink-0 items-center type-meta text-success">
                  Done
                </span>
              ) : (
                <span aria-hidden="true" className="flex h-5 shrink-0 items-center text-text-subtle">
                  <Icon name="ChevronRight" />
                </span>
              )}
            </>
          )
          const classes = cn(
            "flex w-full items-start gap-3 px-6 py-3.5 text-left transition-colors duration-(--duration-fast) hover:bg-hover focus-visible:outline-offset-[-2px] @max-[359px]:px-4"
          )
          return (
            <li key={task.id} data-slot="onboarding-task" data-done={task.done || undefined} className="border-t border-line">
              {task.href ? (
                <Link href={task.href} {...named} className={classes}>
                  {content}
                </Link>
              ) : (
                <button type="button" {...named} onClick={() => onTask?.(task.id)} className={classes}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
})
