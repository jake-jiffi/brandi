"use client"

import * as React from "react"

import { formatNumber } from "@/lib/format"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Badge, type BadgeTone } from "./badge"
import { Button } from "./button"
import { Icon } from "./icon"
import { textOf, useKeepFocus, useLiveLine } from "./status-line"
import { Thinking } from "./thinking"

export type AIProposalState = "asking" | "working" | "done" | "failed" | "dismissed"

export interface AIProposalItem {
  /** The record it will touch: "[Invoice 1042], [Northside Plumbing]". */
  title: React.ReactNode
  /** A line under it: the amount, the date, the person. */
  meta?: React.ReactNode
  /** The record's state, as a status word and its tone, or the word alone (neutral). */
  badge?: string | { label: string; tone?: BadgeTone }
}

const STATE: Record<AIProposalState, { word: string; tone: BadgeTone }> = {
  asking: { word: "Needs you", tone: "highlight" },
  working: { word: "In progress", tone: "info" },
  done: { word: "Done", tone: "success" },
  failed: { word: "Failed", tone: "danger" },
  dismissed: { word: "Not done", tone: "neutral" },
}
// Every record it will touch is listed, five at most, with the rest counted in the note.
const SHOWN = 5

export interface AIProposalProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title" | "children"> {
  /** A question with the thing and the count: "Send reminders for 2 invoices?" */
  title: React.ReactNode
  /** What the person asked, when the proposal stands apart from the answer it came from. */
  question?: React.ReactNode
  /** Why the assistant proposes it, with a Source on every figure. */
  children?: React.ReactNode
  /** Every record it will touch: { title, meta, badge }. Five show; the rest are counted in the note. */
  items?: AIProposalItem[]
  /** The line under the records. "Nothing happens until you press [the action]." by default. */
  note?: React.ReactNode
  /** It deletes, or does something that cannot be undone: the action takes the danger style. */
  danger?: boolean
  /** The title's heading level, so no page skips one. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** The verb and the count: "Send 2 reminders". */
  confirmLabel?: string
  onConfirm?: () => void
  /** Opens the draft. */
  onEdit?: () => void
  editLabel?: string
  onDismiss?: () => void
  dismissLabel?: string
  /** One Try again after a failure, a secondary button. */
  onRetry?: () => void
  retryLabel?: string
  /** Undoes Not now. */
  onUndo?: () => void
  undoLabel?: string
  /** The rule behind the action, in plain words, shown before anyone saves it: "When an invoice is [14] days overdue, send a reminder." */
  rule?: React.ReactNode
  /** Approves the rule, so the assistant can act on it from now on. */
  onApproveRule?: () => void
  ruleLabel?: string
  /** asking, working, done, failed or dismissed: Needs you, In progress, Done, Failed and Not done. */
  state?: AIProposalState
  /** What happened, naming the system. While it works, the work: "Sending 2 reminders…". */
  result?: React.ReactNode
}

/**
 * Whether a waiting AIProposal sits anywhere in these children (an answer's, a thread's), read from the elements
 * themselves, so the first render already knows and nothing changes, or speaks, a moment after a page loads.
 */
export function hasAskingProposal(node: React.ReactNode): boolean {
  let found = false
  const visit = (nodes: React.ReactNode) =>
    React.Children.forEach(nodes, (child) => {
      if (found || !React.isValidElement(child)) return
      const props = child.props as { state?: unknown; children?: React.ReactNode }
      if (child.type === AIProposal) found = props.state === undefined || props.state === "asking"
      else if (props.children) visit(props.children)
    })
  visit(node)
  return found
}

/** The assistant asks before it acts, and nothing happens until a person presses the button. */
export const AIProposal = React.forwardRef<HTMLElement, AIProposalProps>(function AIProposal(
  {
    title,
    question,
    children,
    items,
    note,
    danger = false,
    headingLevel = 3,
    confirmLabel = "Approve",
    onConfirm,
    onEdit,
    editLabel = "Edit",
    onDismiss,
    dismissLabel = "Not now",
    onRetry,
    retryLabel = "Try again",
    onUndo,
    undoLabel = "Undo",
    rule,
    onApproveRule,
    ruleLabel = "Approve as a rule",
    state = "asking",
    result,
    className,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const own = React.useRef<HTMLElement | null>(null)
  const merged = useMergedRef(ref, own)
  const titleId = `${React.useId()}-title`
  const s: AIProposalState = state in STATE ? state : "asking"
  // A board writes the level as text ("3").
  const level = [2, 3, 4, 5, 6].includes(Number(headingLevel)) ? Number(headingLevel) : 3
  const Heading = `h${level}` as "h3"
  const list = Array.isArray(items) ? items : []
  const shown = list.slice(0, SHOWN)
  const more = list.length - shown.length
  const heading = React.useRef<HTMLHeadingElement | null>(null)
  const outcome = React.useRef<HTMLElement | null>(null)
  const [line, say] = useLiveLine()
  // A button that goes away without a press (the work moving on) leaves focus on the outcome, or the question.
  const keep = useKeepFocus(own, () => outcome.current ?? heading.current)

  // After a press the buttons make way for the outcome, which takes focus: a screen reader reads it there. After
  // Undo the question takes focus. A change nobody pressed for (the work finishing) is said by the live line.
  const pending = React.useRef<"outcome" | "question" | null>(null)
  const seen = React.useRef<AIProposalState | null>(null)
  React.useLayoutEffect(() => {
    const before = seen.current
    seen.current = s
    if (before === null || before === s) return
    const press = pending.current
    pending.current = null
    // Focus follows the press only while the person is still here: someone who moved on is left where they went.
    const here = Boolean(own.current?.contains(document.activeElement)) || document.activeElement === document.body
    if (press && here && (press === "question" || s === "asking")) {
      heading.current?.focus()
      return
    }
    if (press && here && outcome.current) {
      outcome.current.focus()
      return
    }
    if (s !== "asking") say(() => `${STATE[s].word}. ${textOf(outcome.current)}`)
  })
  // A second press within a second, before the state moves on, is ignored, so a double press never acts twice. Work
  // that takes longer sets state to working at once; a proposal left asking can be pressed again after that second.
  const pressedAt = React.useRef(0)
  const pressed = (handler: (() => void) | undefined, to: "outcome" | "question" = "outcome") => () => {
    if (pending.current && Date.now() - pressedAt.current < 1000) return
    pending.current = to
    pressedAt.current = Date.now()
    handler?.()
  }

  const outcomeText = s === "working" ? null : (result ?? (s === "done" ? "Done." : "Nothing has changed."))
  const mark = s === "done" ? { icon: "CircleCheck" as const, tone: "text-success" } : s === "failed" ? { icon: "CircleAlert" as const, tone: "text-danger" } : { icon: "CircleSlash" as const, tone: "text-text-muted" }

  return (
    <section
      ref={merged}
      aria-labelledby={titleId}
      data-slot="ai-proposal"
      data-state={s}
      onFocus={(event) => {
        keep.onFocus()
        onFocus?.(event)
      }}
      onBlur={(event) => {
        keep.onBlur(event)
        onBlur?.(event)
      }}
      className={cn(
        "@container flex min-w-0 flex-col gap-4 rounded-md border bg-surface p-5 shadow-xs @max-[399px]:p-4",
        // While it waits, the assistant's colour runs round the card as well as the Needs you badge.
        s === "asking" ? "border-ai-line ring-1 ring-ai-line" : "border-line",
        className
      )}
      {...rest}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          {/* On its own the question leads at 20px. Inside an answer (level 4 and down) it sits under the answer's question. */}
          <Heading
            ref={heading}
            id={titleId}
            tabIndex={-1}
            data-slot="ai-proposal-title"
            className={cn(
              "min-w-0 flex-1 basis-48 rounded-xs text-pretty text-text-strong wrap-break-word",
              level <= 3 ? "type-heading-lg @max-[399px]:type-heading" : "type-heading @max-[399px]:type-heading-sm"
            )}
          >
            {title}
          </Heading>
          <Badge tone={STATE[s].tone}>{STATE[s].word}</Badge>
        </div>
        {question ? <p className="type-meta text-text-muted">You asked: {question}</p> : null}
      </div>

      {children ? (
        <div data-slot="ai-proposal-why" className="flex max-w-measure flex-col gap-2 type-body text-pretty text-text">
          {children}
        </div>
      ) : null}

      {shown.length ? (
        <ul data-slot="ai-proposal-items" className="flex flex-col divide-y divide-line border-y border-line">
          {shown.map((item, i) => {
            const badge = typeof item.badge === "string" ? { label: item.badge, tone: "neutral" as const } : item.badge
            return (
              <li key={i} className="flex min-h-12 items-center justify-between gap-3 py-2">
                <span className="flex min-w-0 flex-col">
                  <span className="type-label text-text-strong wrap-break-word">{item.title}</span>
                  {item.meta ? <span className="type-meta text-text-muted">{item.meta}</span> : null}
                </span>
                {badge?.label ? (
                  <Badge tone={badge.tone ?? "neutral"} size="sm">
                    {badge.label}
                  </Badge>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      {s === "asking" ? (
        <div className="flex flex-col gap-1">
          <p data-slot="ai-proposal-note" className="type-meta text-pretty text-text-muted">
            {more > 0 ? `And ${formatNumber(more)} more. ` : null}
            {note ?? `Nothing happens until you press ${confirmLabel}.`}
          </p>
          {rule ? (
            <p data-slot="ai-proposal-rule" className="type-meta text-pretty text-text-muted">
              Or approve the rule behind it: {rule}
            </p>
          ) : null}
        </div>
      ) : more > 0 ? (
        <p className="type-meta text-text-muted">And {formatNumber(more)} more.</p>
      ) : null}

      {s !== "asking" ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* One element from the press to the end, so focus stays put as the work finishes and only the live line speaks. */}
          <div
            ref={outcome as React.Ref<HTMLDivElement>}
            tabIndex={-1}
            data-slot="ai-proposal-outcome"
            className="flex min-w-0 flex-1 basis-56 items-start gap-2 rounded-xs type-body text-pretty text-text"
          >
            {s === "working" ? (
              <Thinking live={false}>{result}</Thinking>
            ) : (
              <>
                <span aria-hidden="true" className={cn("flex h-5 shrink-0 items-center", mark.tone)}>
                  <Icon name={mark.icon} />
                </span>
                <span className="min-w-0 wrap-break-word">{outcomeText}</span>
              </>
            )}
          </div>
          {s === "dismissed" && onUndo ? (
            <Button size="sm" variant="ghost" icon="Undo2" onClick={pressed(onUndo, "question")}>
              {undoLabel}
            </Button>
          ) : null}
        </div>
      ) : null}

      {s === "asking" || s === "failed" ? (
        // Reading order: Not now, Edit, then the action. The quiet ones are described by the question they act on.
        <div data-slot="ai-proposal-actions" className="flex flex-wrap items-center justify-end gap-2 @max-[399px]:flex-col @max-[399px]:items-stretch">
          {onDismiss ? (
            <Button variant="ghost" aria-describedby={titleId} onClick={pressed(onDismiss)}>
              {dismissLabel}
            </Button>
          ) : null}
          {onEdit ? (
            <Button icon="Pencil" aria-describedby={titleId} onClick={onEdit}>
              {editLabel}
            </Button>
          ) : null}
          {s === "asking" && rule && onApproveRule ? <Button onClick={pressed(onApproveRule)}>{ruleLabel}</Button> : null}
          {s === "asking" ? (
            <Button variant={danger ? "danger" : "primary"} onClick={pressed(onConfirm)}>
              {confirmLabel}
            </Button>
          ) : onRetry ? (
            <Button icon="RotateCcw" aria-describedby={titleId} onClick={pressed(onRetry)}>
              {retryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}

      <span role="status" aria-atomic="true" data-slot="ai-proposal-live" className="sr-only">
        {line}
      </span>
    </section>
  )
})
