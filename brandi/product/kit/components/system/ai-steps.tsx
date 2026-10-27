"use client"

import * as React from "react"

import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { Icon } from "./icon"
import { textOf, useKeepFocus, useLiveLine } from "./status-line"

export type AIStepStatus = "done" | "running" | "waiting" | "failed" | "skipped" | "approval"

export interface AIStep {
  /** What the step does, in the person's words: "Comparing [records] with [source]". Anything that is not text is read as its words. */
  label: React.ReactNode
  /** done, running, waiting (not started yet), failed, skipped, or approval (the step that would act, waiting for a person). */
  status: AIStepStatus
  /** Where a figure came from and when, or what failed and in which system. */
  detail?: React.ReactNode
}

export interface AIStepsProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  /** The steps, in order. */
  steps: AIStep[]
  /** The folded line once the run has finished: "Checked [12] invoices in [accounting system]". It never hides a failure or a stop. */
  title?: React.ReactNode
  /** Open at first. By default it is open while it works and folded once it has finished. */
  defaultOpen?: boolean
  /** Shows Try again on the failed step. Focus then moves to that step. */
  onRetry?: () => void
  retryLabel?: string
  /** The person stopped the run: the steps say where. */
  stopped?: boolean
  /** true says the start, a failure, a stop and the end. false inside something with a status line of its own (AIAnswer), which says them instead. */
  announceEnd?: boolean
}

type Phase = "running" | "waiting" | "failed" | "stopped" | "done"

const SUMMARY_MARK: Record<Exclude<Phase, "running">, { icon: IconName; tone: string }> = {
  waiting: { icon: "CircleDot", tone: "text-ai" },
  failed: { icon: "CircleAlert", tone: "text-danger" },
  stopped: { icon: "Square", tone: "text-text-muted" },
  done: { icon: "CircleCheck", tone: "text-success" },
}

/** Where a run stands, and the step in hand, from its steps. An empty run is still starting. */
export function stepsPhase(steps: AIStep[] | undefined, stopped = false) {
  const list = Array.isArray(steps) ? steps : []
  const failedAt = list.findIndex((s) => s.status === "failed")
  const approvalAt = list.findIndex((s) => s.status === "approval")
  const runningAt = list.findIndex((s) => s.status === "running")
  const openAt = list.findIndex((s) => s.status !== "done" && s.status !== "skipped")
  let phase: Phase
  let at: number
  if (failedAt >= 0) [phase, at] = ["failed", failedAt]
  else if (stopped) [phase, at] = ["stopped", openAt >= 0 ? openAt : list.length - 1]
  else if (approvalAt >= 0) [phase, at] = ["waiting", approvalAt]
  else if (!list.length || runningAt >= 0 || openAt >= 0) [phase, at] = ["running", runningAt >= 0 ? runningAt : openAt]
  else [phase, at] = ["done", list.length - 1]
  return { phase, at, total: list.length, list }
}

/** The summary line's words, in the catalogue's shape: "Working, step 2 of 4", "Failed at step 2 of 3". */
function summaryWords(phase: Phase, at: number, total: number, title: React.ReactNode) {
  const of = `step ${formatNumber(at + 1)} of ${formatNumber(total)}`
  if (phase === "failed") return `Failed at ${of}`
  if (phase === "stopped") return total ? `Stopped at ${of}` : "Stopped"
  if (phase === "waiting") return `Waiting for your approval, ${of}`
  if (phase === "running") return total && at >= 0 ? `Working, ${of}` : "Working"
  return title ?? `Finished ${formatNumber(total)} ${total === 1 ? "step" : "steps"}`
}

/** Each step's state in words, so it never rides on the icon or its colour. */
function rowState(status: AIStepStatus, stopped: boolean): { word: string; icon: IconName; tone: string; spin?: boolean } {
  switch (status) {
    case "done":
      return { word: "Done", icon: "CircleCheck", tone: "text-success" }
    case "running":
      return stopped ? { word: "Stopped", icon: "Square", tone: "text-text-muted" } : { word: "Running", icon: "LoaderCircle", tone: "text-ai", spin: true }
    case "failed":
      return { word: "Failed", icon: "CircleAlert", tone: "text-danger" }
    case "skipped":
      return { word: "Skipped", icon: "ChevronsRight", tone: "text-text-muted" }
    case "approval":
      return { word: "Waiting for your approval", icon: "CircleDot", tone: "text-ai" }
    default:
      return stopped ? { word: "Not run", icon: "CircleDashed", tone: "text-text-subtle" } : { word: "Not started", icon: "CircleDashed", tone: "text-text-subtle" }
  }
}

/**
 * What the assistant is doing, step by step, and how each step went: open while it works, folded to one line
 * once it has finished, so the answer stays the main thing.
 */
export const AISteps = React.forwardRef<HTMLDivElement, AIStepsProps>(function AISteps(
  { steps, title, defaultOpen, onRetry, retryLabel = "Try again", stopped = false, announceEnd = true, className, onFocus, onBlur, ...rest },
  ref
) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const listId = React.useId()
  const { phase, at, total, list } = stepsPhase(steps, stopped)
  const [open, setOpen] = React.useState(defaultOpen ?? phase !== "done")
  const touched = React.useRef(false)
  const lastPhase = React.useRef(phase)
  // It follows the run (open while it works, folded once it has finished) until the person opens or closes it.
  React.useEffect(() => {
    if (lastPhase.current === phase) return
    lastPhase.current = phase
    if (!touched.current) setOpen(phase !== "done")
  }, [phase])

  const summary = summaryWords(phase, at, total, title)
  const inHand = at >= 0 ? list[at] : undefined
  const summaryRef = React.useRef<HTMLElement | null>(null)
  const handRef = React.useRef<HTMLSpanElement | null>(null)
  const rowRefs = React.useRef<Array<HTMLLIElement | null>>([])
  // When the list folds itself with a step in focus, focus moves to the summary line.
  const keep = useKeepFocus(own, () => summaryRef.current)

  // On its own it says the start, a failure, a stop, a wait and the end, never every step. Not the phase it loads in.
  const [line, say] = useLiveLine()
  const heard = React.useRef<Phase | null>(null)
  React.useEffect(() => {
    if (!announceEnd) return
    const before = heard.current
    heard.current = phase
    if (before === null || before === phase) return
    const now = phase
    // Read when it is said, by which time a failure has opened the list and its detail is on the page.
    say(() => {
      const words = textOf(summaryRef.current?.querySelector('[data-slot="ai-steps-summary-words"]'))
      if (now === "done") return words
      const step = now === "stopped" ? "" : textOf(handRef.current)
      const detail = now === "failed" ? textOf(rowRefs.current[at]?.querySelector('[data-slot="ai-steps-detail"]')) : ""
      return `${words}${step ? `: ${step}` : ""}.${detail ? ` ${detail}` : ""}`
    })
  })

  const retry = () => {
    // The failed step stays in the list as it runs again, so focus lands on the step being retried.
    rowRefs.current[at]?.focus()
    onRetry?.()
  }

  const spinSummary = phase === "running" && !open
  const mark = spinSummary ? (
    <Icon name="LoaderCircle" className="animate-spin text-ai" />
  ) : phase === "running" ? (
    <Icon name="ListChecks" className="text-text-muted" />
  ) : (
    <Icon name={SUMMARY_MARK[phase].icon} className={SUMMARY_MARK[phase].tone} />
  )

  return (
    <div
      ref={merged}
      data-slot="ai-steps"
      data-phase={phase}
      onFocus={(event) => {
        keep.onFocus()
        onFocus?.(event)
      }}
      onBlur={(event) => {
        keep.onBlur(event)
        onBlur?.(event)
      }}
      className={cn("flex min-w-0 flex-col", className)}
      {...rest}
    >
      {list.length ? (
        <button
          ref={summaryRef as React.Ref<HTMLButtonElement>}
          type="button"
          data-slot="ai-steps-summary"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => {
            touched.current = true
            setOpen((o) => !o)
          }}
          className="-mx-2 inline-flex min-h-9 max-w-full items-start gap-2 self-start rounded-control px-2 py-2 text-left type-body text-text-muted transition-colors hover:bg-hover hover:text-text-strong active:bg-pressed pointer-coarse:min-h-11 pointer-coarse:py-3"
        >
          <span aria-hidden="true" className="flex h-5 shrink-0 items-center">
            {mark}
          </span>
          <span data-slot="ai-steps-summary-words" className="min-w-0 wrap-break-word">
            {summary}
          </span>
          <span aria-hidden="true" className="flex h-5 shrink-0 items-center">
            <Icon name="ChevronDown" className={cn("motion-safe:transition-transform motion-safe:duration-(--duration-base)", open && "rotate-180")} />
          </span>
        </button>
      ) : (
        // Before the first step there is nothing to show or hide: the line says so, and spins, as Thinking does.
        <p
          ref={summaryRef as React.Ref<HTMLParagraphElement>}
          tabIndex={-1}
          data-slot="ai-steps-summary"
          className="inline-flex min-h-9 max-w-full items-start gap-2 self-start rounded-xs py-2 type-body text-text-muted pointer-coarse:min-h-11 pointer-coarse:py-3"
        >
          <span aria-hidden="true" className="flex h-5 shrink-0 items-center">
            {phase === "running" ? <Icon name="LoaderCircle" className="animate-spin text-ai" /> : mark}
          </span>
          <span data-slot="ai-steps-summary-words" className="min-w-0 wrap-break-word">
            {summary}
          </span>
        </p>
      )}
      {/* The step in hand, as words for the live line, even while the list is folded. */}
      <span ref={handRef} hidden>
        {inHand?.label}
      </span>
      {open && list.length ? (
        <ol id={listId} data-slot="ai-steps-list" className="mt-1 flex flex-col">
          {list.map((s, i) => {
            const state = rowState(s.status, stopped)
            const last = i === list.length - 1
            return (
              <li
                key={i}
                ref={(el) => {
                  rowRefs.current[i] = el
                }}
                tabIndex={-1}
                data-slot="ai-steps-step"
                data-status={s.status}
                className="flex min-h-9 gap-3 rounded-xs pointer-coarse:min-h-11"
              >
                <span aria-hidden="true" className="flex w-4 shrink-0 flex-col items-center">
                  <span className="flex h-7 items-center pointer-coarse:h-8">
                    <Icon name={state.icon} className={cn(state.tone, state.spin && "animate-spin")} />
                  </span>
                  {/* A border, not a fill, so the thread survives forced colours. */}
                  {last ? null : <span className="w-0 flex-1 border-l border-line" />}
                </span>
                <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5 pt-1 pointer-coarse:pt-1.5", !last && "pb-3")}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span data-slot="ai-steps-label" className={cn("min-w-0 type-body wrap-break-word", s.status === "waiting" ? "text-text-muted" : "text-text")}>
                      {s.label}
                    </span>
                    <span data-slot="ai-steps-state" className={cn("type-meta", s.status === "failed" ? "text-danger" : "text-text-muted")}>
                      {state.word}
                    </span>
                  </div>
                  {s.detail ? (
                    <div data-slot="ai-steps-detail" className="type-meta text-pretty text-text-muted wrap-break-word">
                      {s.detail}
                    </div>
                  ) : null}
                  {s.status === "failed" && onRetry ? (
                    <div className="mt-2 flex">
                      <Button size="sm" icon="RotateCcw" onClick={retry}>
                        {retryLabel}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}
      {announceEnd ? (
        <span role="status" aria-atomic="true" data-slot="ai-steps-live" className="sr-only">
          {line}
        </span>
      ) : null}
    </div>
  )
})
