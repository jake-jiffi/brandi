"use client"

import * as React from "react"

import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { hasAskingProposal } from "./ai-proposal"
import { AISteps, stepsPhase, type AIStep } from "./ai-steps"
import { hasActions, renderActions, type FeedbackAction } from "./alert"
import { Avatar } from "./avatar"
import { Badge, type BadgeTone } from "./badge"
import { Button } from "./button"
import { Icon } from "./icon"
import { Source } from "./source"
import { StatusLine, textOf, useKeepFocus, type StatusLineState } from "./status-line"
import { Thinking } from "./thinking"

export type AIAnswerStatus = "Drafted" | "Answered" | "Stopped" | "Failed"

export interface AIAnswerSource {
  /** The document and the place in it. */
  label: React.ReactNode
  icon?: IconName
  href: string
}

/** True inside an AskPanel, whose composer turns Send into Stop: the answer then shows no Stop of its own. */
export const stopInComposer = React.createContext(false)

const has = (node: React.ReactNode) => node !== undefined && node !== null && node !== false && node !== ""

/** Puts focus on an answer's question: where Send, a follow-up and Ask from search land (Rule 12). */
export function focusAnswer(answer: Element | null | undefined) {
  const question = answer?.querySelector<HTMLElement>('[data-slot="ai-answer-question"]')
  question?.focus()
  return Boolean(question && document.activeElement === question)
}

/** After Stop: the steps line, which reads "Stopped at step N of M" once the work stops, or the question. */
export function focusStopped(answer: Element | null | undefined) {
  const target =
    answer?.querySelector<HTMLElement>('[data-slot="ai-steps-summary"]') ?? answer?.querySelector<HTMLElement>('[data-slot="ai-answer-question"]')
  target?.focus()
}

const BADGE: Record<AIAnswerStatus, BadgeTone> = { Drafted: "ai", Answered: "ai", Stopped: "neutral", Failed: "danger" }

export interface AIAnswerProps extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> {
  /** What the person asked, shown in full. It is the answer's heading. */
  question: React.ReactNode
  /** The question's heading level, so no page skips one. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Who made it: the assistant, or the product's own name for it. */
  name?: string
  /** The answer. Plain text becomes a paragraph capped at the measure. */
  children?: React.ReactNode
  /** Where its figures came from: { label, icon, href }. Every figure has one. */
  sources?: AIAnswerSource[]
  /** What to check first: "Check [the March payments] first." "The assistant can be wrong." always follows it. */
  caveat?: React.ReactNode
  /** One step of work, named: "Reading [12] invoices…". */
  thinking?: React.ReactNode
  /** More than one step of work: { label, status, detail }. */
  steps?: AIStep[]
  /** The steps' folded line once they finish. */
  stepsTitle?: React.ReactNode
  /** The answer is still arriving: it ends in a caret, and the status, sources, suggestions and actions wait. */
  streaming?: boolean
  /** Shows Stop while it works. Stop keeps what it found. */
  onStop?: () => void
  stopLabel?: string
  /** Drafted (Use this, Edit and Discard) or Answered (the actions it leads to). Stopped and Failed are set for you. */
  status?: AIAnswerStatus
  /** Buttons, or the same as data. Only the newest answer's main action is primary, and none while a proposal waits. */
  actions?: React.ReactNode | FeedbackAction[]
  /** Up to three follow-ups in the person's words, as quiet buttons. */
  suggestions?: string[]
  onSuggest?: (suggestion: string) => void
  /** What failed, naming the system: "Couldn't reach [accounting system]." */
  failed?: React.ReactNode
  /** One Try again after a failure. Focus moves to the step being retried, or the question. */
  onRetry?: () => void
  retryLabel?: string
}

/**
 * What the assistant made, or is making: who made it, the question, its steps, the answer, its sources, its
 * status and the person's next move. One polite status line says when the work starts and when it ends.
 */
export const AIAnswer = React.forwardRef<HTMLElement, AIAnswerProps>(function AIAnswer(
  {
    question,
    headingLevel = 3,
    name = "Assistant",
    children,
    sources,
    caveat,
    thinking,
    steps,
    stepsTitle,
    streaming = false,
    onStop,
    stopLabel = "Stop",
    status = "Drafted",
    actions,
    suggestions,
    onSuggest,
    failed,
    onRetry,
    retryLabel = "Try again",
    className,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const own = React.useRef<HTMLElement | null>(null)
  const merged = useMergedRef(ref, own)
  // Stop, Try again or an action going away as the work moves on never drops focus to the page body.
  const keep = useKeepFocus(own, () =>
    own.current?.querySelector<HTMLElement>('[data-slot="ai-steps-summary"]') ?? own.current?.querySelector<HTMLElement>('[data-slot="ai-answer-question"]')
  )
  const body = React.useRef<HTMLDivElement | null>(null)
  const ids = React.useId()
  const questionId = `${ids}-question`
  const suggestionsId = `${ids}-suggestions`
  const composerStops = React.useContext(stopInComposer)
  // A board writes the level as text ("3").
  const level = [2, 3, 4, 5, 6].includes(Number(headingLevel)) ? Number(headingLevel) : 3
  const Heading = `h${level}` as "h3"

  const hasSteps = Array.isArray(steps) && steps.length > 0
  const isFailedStatus = has(failed) || status === "Failed"
  const run = stepsPhase(steps, !isFailedStatus && status === "Stopped")
  const isFailed = isFailedStatus || (hasSteps && run.phase === "failed")
  const stopped = !isFailed && status === "Stopped"
  const working = !isFailed && !stopped && (has(thinking) || Boolean(streaming) || (hasSteps && run.phase === "running"))
  const approval = !isFailed && !stopped && hasSteps && run.phase === "waiting"
  const finished = !working && !approval

  // A proposal waiting inside the answer: the line says so, and its action is the only primary on screen (Rule 3).
  // Read from the elements, so an answer that loads with one waiting is already waiting, and says nothing.
  const proposalWaiting = !isFailed && !stopped && hasAskingProposal(children)
  // The answer's first sentence, for the line that says it is ready. It is read when the line speaks, and only once
  // the work is done, so a streaming answer does not render twice for every word.
  const [first, setFirst] = React.useState("")
  // After every render on purpose: the text is read off the page, and setFirst fires only when the sentence changed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(() => {
    if (working) return
    const text = textOf(body.current)
    const sentence = (/^(.+?[.?!…])(\s|$)/.exec(text)?.[1] ?? text).trim()
    if (sentence !== first) setFirst(sentence)
  })

  const word: AIAnswerStatus = isFailed ? "Failed" : stopped ? "Stopped" : status === "Answered" ? "Answered" : "Drafted"
  const lineState: StatusLineState = isFailed ? "failed" : stopped ? "stopped" : working ? "working" : approval || proposalWaiting ? "waiting" : "done"
  const at = run.at >= 0 ? run.at : 0
  const counted = hasSteps && lineState !== "waiting" && lineState !== "done"
  const label = hasSteps ? (lineState === "working" || lineState === "failed" ? run.list[at]?.label : undefined) : thinking
  const message = lineState === "working" && streaming && !has(thinking) && !(hasSteps && run.phase === "running") ? "Writing the answer" : undefined

  const stop = () => {
    focusStopped(own.current)
    onStop?.()
  }
  const retry = () => {
    const root = own.current
    const target =
      root?.querySelector<HTMLElement>('[data-slot="ai-steps-step"][data-status="failed"]') ??
      root?.querySelector<HTMLElement>('[data-slot="ai-steps-summary"]') ??
      root?.querySelector<HTMLElement>('[data-slot="ai-answer-question"]')
    target?.focus()
    onRetry?.()
  }

  const shownActions =
    proposalWaiting && Array.isArray(actions)
      ? (actions as FeedbackAction[]).map((a) => (a && typeof a === "object" && "label" in a && a.variant === "primary" ? { ...a, variant: "secondary" as const } : a))
      : actions
  const follow = Array.isArray(suggestions) ? suggestions.slice(0, 3) : []
  const sourceList = Array.isArray(sources) ? sources : []
  const caret = streaming && working ? (
    // A border, not a fill, so the caret stays visible in forced colours.
    <span aria-hidden="true" data-slot="ai-answer-caret" className="ml-0.5 inline-block h-4 w-0 border-l-2 border-ai align-[-3px]" />
  ) : null

  return (
    <section
      ref={merged}
      aria-labelledby={questionId}
      data-slot="ai-answer"
      data-status={lineState}
      onFocus={(event) => {
        keep.onFocus()
        onFocus?.(event)
      }}
      onBlur={(event) => {
        keep.onBlur(event)
        onBlur?.(event)
      }}
      className={cn("@container flex min-w-0 flex-col gap-4", className)}
      {...rest}
    >
      <header className="flex flex-col gap-1.5">
        {/* The question leads at 20px, and steps down to 16px in a narrow answer, such as one in the AskPanel. It is a
            heading, so it balances its lines: pretty left a run's question ragged, and the detector said so. */}
        <Heading
          id={questionId}
          tabIndex={-1}
          data-slot="ai-answer-question"
          className="rounded-xs type-heading-lg text-balance text-text-strong wrap-break-word @max-[399px]:type-heading"
        >
          {question}
        </Heading>
        <p data-slot="ai-answer-by" className="flex items-center gap-2 type-meta text-text-muted">
          <Avatar name={name} assistant size={24} aria-hidden="true" />
          <span>{name}</span>
        </p>
      </header>

      {hasSteps ? <AISteps steps={steps} title={stepsTitle} stopped={stopped} announceEnd={false} /> : null}
      {!hasSteps && has(thinking) && working ? <Thinking live={false}>{thinking}</Thinking> : null}

      {has(children) || caret ? (
        <div
          ref={body}
          data-slot="ai-answer-body"
          // Reading text, so body-lg at every width (the type scale's own usage), never the interface's body.
          className="flex min-w-0 flex-col gap-3 type-body-lg text-pretty text-text wrap-break-word [&>ol]:max-w-measure [&>p]:max-w-measure [&>ul]:max-w-measure"
        >
          {typeof children === "string" || typeof children === "number" ? (
            <p className="max-w-measure">
              {children}
              {caret}
            </p>
          ) : (
            <>
              {children}
              {caret}
            </>
          )}
        </div>
      ) : null}

      {isFailed && has(failed) && failed !== true ? (
        <p data-slot="ai-answer-failed" className="flex max-w-measure items-start gap-2 type-body text-pretty text-text">
          <span aria-hidden="true" className="flex h-5 shrink-0 items-center text-danger">
            <Icon name="CircleAlert" />
          </span>
          <span className="min-w-0 wrap-break-word">{failed}</span>
        </p>
      ) : null}

      {finished && (sourceList.length || !isFailed) ? (
        // Where it came from and what to check first sit together, apart from the next move.
        <div className="flex flex-col gap-2.5">
          {sourceList.length ? (
            <ul aria-label="Sources" data-slot="ai-answer-sources" className="flex flex-wrap gap-2">
              {sourceList.map((s, i) => (
                <li key={i} className="flex max-w-full min-w-0">
                  <Source href={s.href} icon={s.icon}>
                    {s.label}
                  </Source>
                </li>
              ))}
            </ul>
          ) : null}
          {!isFailed ? (
            <p data-slot="ai-answer-caveat" className="max-w-measure type-meta text-pretty text-text-muted">
              {has(caveat) ? <>{caveat} </> : null}The assistant can be wrong.
            </p>
          ) : null}
        </div>
      ) : null}

      <div data-slot="ai-answer-footer" className="flex flex-wrap items-center gap-x-3 gap-y-2 empty:hidden">
        {finished ? (
          <Badge tone={BADGE[word]} icon>
            {word}
          </Badge>
        ) : null}
        {finished && !isFailed && hasActions(shownActions) ? <div className="flex flex-wrap gap-2">{renderActions(shownActions, "md")}</div> : null}
        <StatusLine
          state={lineState}
          step={counted ? at + 1 : undefined}
          steps={counted ? run.total : undefined}
          label={label}
          reason={isFailed && failed !== true ? failed : undefined}
          message={message}
          summary={first ? `${word}: ${first}` : word}
          showWords={false}
          size="md"
          onStop={onStop && !composerStops ? stop : undefined}
          stopLabel={stopLabel}
          onRetry={onRetry ? retry : undefined}
          retryLabel={retryLabel}
        />
      </div>

      {finished && !isFailed && !stopped && follow.length ? (
        <div role="group" aria-labelledby={suggestionsId} data-slot="ai-answer-suggestions" className="flex flex-col gap-2">
          <p id={suggestionsId} className="type-meta text-text-muted">
            Ask next
          </p>
          <div className="flex flex-wrap gap-2">
            {follow.map((s, i) => (
              <Button
                key={`${i}-${s}`}
                variant="ghost"
                size="sm"
                icon="CornerDownRight"
                onClick={() => onSuggest?.(s)}
                className="h-auto min-h-8 py-1.5 text-left whitespace-normal pointer-coarse:h-auto pointer-coarse:min-h-10"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
})
