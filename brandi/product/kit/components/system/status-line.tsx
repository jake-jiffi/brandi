"use client"

import * as React from "react"

import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { Icon } from "./icon"

// Words go in a moment after the line is cleared, so words said before are heard again, and several changes
// inside that moment are said once, with the last words.
const SAY_AFTER = 150
// The line empties itself once spoken, so spoken words never stay behind in the accessibility tree.
const SPOKEN_FOR = 5000

/**
 * A polite line that speaks only when told to. say() clears the line and writes the words a moment later; the
 * words are read when they are written, so a lazy say(() => text) reads the page as it stands by then. Shared by
 * everything that keeps the assistant's live line: StatusLine, AISteps on its own, AIProposal.
 */
export function useLiveLine(): [string, (words: string | (() => string)) => void] {
  const [line, setLine] = React.useState("")
  const timers = React.useRef<{ write?: number; clear?: number }>({})
  React.useEffect(() => {
    const t = timers.current
    return () => {
      window.clearTimeout(t.write)
      window.clearTimeout(t.clear)
    }
  }, [])
  const say = React.useCallback((words: string | (() => string)) => {
    const t = timers.current
    window.clearTimeout(t.write)
    window.clearTimeout(t.clear)
    setLine("")
    t.write = window.setTimeout(() => {
      const text = (typeof words === "function" ? words() : words).replace(/\s+/g, " ").trim()
      if (!text) return
      setLine(text)
      t.clear = window.setTimeout(() => setLine(""), SPOKEN_FOR)
    }, SAY_AFTER)
  }, [])
  return [line, say]
}

/** The text an element shows, as one line: what a label that is not plain text reads as. */
export const textOf = (el: Element | null | undefined) => (el?.textContent ?? "").replace(/\s+/g, " ").trim()

/**
 * Keeps focus on something real when what had it goes away without a press: Stop when the work finishes, a step
 * when its list folds. Focus then moves to the fallback, never the page body (Rule 12). Spread the handlers on
 * the component's root.
 */
export function useKeepFocus(root: React.RefObject<HTMLElement | null>, fallback: () => HTMLElement | null | undefined) {
  const inside = React.useRef(false)
  const back = React.useRef(fallback)
  back.current = fallback
  const rescue = React.useCallback(() => {
    const active = document.activeElement
    if (!inside.current || (active && active !== document.body)) return
    back.current()?.focus()
  }, [])
  // Removing what has focus moves focus to the body without a blur in some browsers: catch it after each commit.
  React.useLayoutEffect(() => {
    rescue()
  })
  return {
    onFocus: () => {
      inside.current = true
    },
    onBlur: (event: React.FocusEvent) => {
      const to = event.relatedTarget as Node | null
      if (to && root.current?.contains(to)) return
      if (to) {
        inside.current = false
        return
      }
      // Focus went nowhere: either the person clicked away, or what had focus was removed.
      const from = event.target as Element
      queueMicrotask(() => {
        if (from.isConnected) inside.current = false
        else rescue()
      })
    },
  }
}

export type StatusLineState = "idle" | "working" | "waiting" | "done" | "stopped" | "failed"
const STATES: StatusLineState[] = ["idle", "working", "waiting", "done", "stopped", "failed"]

const MARK: Record<Exclude<StatusLineState, "idle" | "working">, { icon: IconName; tone: string }> = {
  waiting: { icon: "CircleDot", tone: "text-ai" },
  done: { icon: "CircleCheck", tone: "text-success" },
  stopped: { icon: "Square", tone: "text-text-muted" },
  failed: { icon: "CircleAlert", tone: "text-danger" },
}

export interface StatusLineProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** What the work is doing. idle shows nothing and says nothing: the line waits, empty, for the first change. */
  state?: StatusLineState
  /** The step in hand, counting from 1. */
  step?: number
  /** How many steps the work has. */
  steps?: number
  /** The step in hand, in the person's words: "checking the totals". Anything that is not text is read as its words. */
  label?: React.ReactNode
  /** On failure, what went wrong, naming the system: "Couldn't reach [accounting system]." */
  reason?: React.ReactNode
  /** Words in place of the ones the state and the step make, for work the table does not cover: "Writing the answer". */
  message?: React.ReactNode
  /** Said after "Answer ready" when the work finishes: AIAnswer passes its status and its first sentence. */
  summary?: React.ReactNode
  /** false when the words already show nearby (a steps log, a Thinking line): the line still says them, and shows only its timer and buttons. */
  showWords?: boolean
  /** Shows Stop while the work runs. With the words shown, focus then moves to the "Stopped at step N of M" line. */
  onStop?: () => void
  stopLabel?: string
  /** Shows one Try again after a failure. The same failure after it is said again. */
  onRetry?: () => void
  retryLabel?: string
  /** sm on a line of its own; md in an answer's footer, beside its other buttons. */
  size?: "sm" | "md"
}

/**
 * The answer's one live region: what the work is doing, in the catalogue's words, said only when it changes,
 * with Stop while it runs and one Try again after a failure.
 */
export const StatusLine = React.forwardRef<HTMLDivElement, StatusLineProps>(function StatusLine(
  {
    state: stateProp = "idle",
    step,
    steps,
    label,
    reason,
    message,
    summary,
    showWords = true,
    onStop,
    stopLabel = "Stop",
    onRetry,
    retryLabel = "Try again",
    size = "sm",
    className,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  // A state the line does not know is idle: it shows nothing rather than guessing.
  const state: StatusLineState = STATES.includes(stateProp) ? stateProp : "idle"
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const wordsRef = React.useRef<HTMLElement | null>(null)
  const summaryRef = React.useRef<HTMLSpanElement | null>(null)
  const [line, say] = useLiveLine()
  // Stop goes when the work finishes: with the words shown, focus moves to them. Otherwise the component around it decides.
  const keep = useKeepFocus(own, () => (showWords ? wordsRef.current : null))

  // A board writes numbers as text ("2").
  const at = Number(step)
  const of = Number(steps)
  const counted = Number.isFinite(at) && Number.isFinite(of) && of > 0 && at > 0
  const count = counted ? `step ${formatNumber(at)} of ${formatNumber(of)}` : ""
  const Count = count.charAt(0).toUpperCase() + count.slice(1)
  const has = (node: React.ReactNode) => node !== undefined && node !== null && node !== false && node !== ""

  let words: React.ReactNode = null
  if (has(message)) words = message
  else if (state === "working") words = counted ? <>{Count}{has(label) ? <>: {label}</> : null}</> : has(label) ? label : "Working"
  else if (state === "waiting") words = "Waiting for your approval"
  else if (state === "done") words = "Answer ready"
  else if (state === "stopped") words = counted ? `Stopped at ${count}` : "Stopped"
  else if (state === "failed")
    words = (
      <>
        {counted ? <>{Count}{has(label) ? <>, {label},</> : null} failed.</> : "Failed."}
        {has(reason) ? <> {reason}</> : null}
      </>
    )

  // Speak on a change only. The state it loads in is never said: a finished answer that loads stays quiet. A
  // repeat after Try again is said again, because the line clears before it writes.
  const said = React.useRef<{ state: StatusLineState; key: string } | null>(null)
  const retried = React.useRef(false)
  React.useEffect(() => {
    const key = `${state}|${textOf(wordsRef.current)}`
    const before = said.current
    said.current = { state, key }
    if (!before) return
    const repeat = retried.current && state === "failed"
    if (key === before.key && !repeat) return
    retried.current = false
    if (state === "idle") return say("")
    // A proposal waited, and was answered: the answer was already ready, so there is nothing new to say.
    if (state === "done" && before.state === "waiting") return
    const starting = state === "working" && before.state !== "working"
    say(() => {
      const words = textOf(wordsRef.current)
      const more = state === "done" ? textOf(summaryRef.current) : ""
      // A line that runs on into another is said as a sentence: "Answer ready. Answered: …".
      return [starting ? "Working." : "", more && !/[.?!…]$/.test(words) ? `${words}.` : words, more].filter(Boolean).join(" ")
    })
  })

  // The timer counts from when the work started, and keeps counting under reduced motion.
  const [started, setStarted] = React.useState<number | null>(null)
  const [now, setNow] = React.useState(0)
  React.useEffect(() => {
    if (state !== "working") {
      setStarted(null)
      return
    }
    const begin = Date.now()
    setStarted(begin)
    setNow(begin)
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(tick)
  }, [state])
  const seconds = started === null ? 0 : Math.max(0, Math.floor((now - started) / 1000))
  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

  const press = (handler?: () => void) => () => {
    // The line holds its place as the work stops or starts again, so focus has somewhere real to land.
    if (showWords) wordsRef.current?.focus()
    if (handler === onRetry) retried.current = true
    handler?.()
  }

  const mark =
    state === "working" ? (
      <Icon name="LoaderCircle" className="animate-spin text-ai" />
    ) : state !== "idle" ? (
      <Icon name={MARK[state].icon} className={MARK[state].tone} />
    ) : null

  return (
    <div
      ref={merged}
      data-slot="status-line"
      data-state={state}
      onFocus={(event) => {
        keep.onFocus()
        onFocus?.(event)
      }}
      onBlur={(event) => {
        keep.onBlur(event)
        onBlur?.(event)
      }}
      // A shown line keeps a button's height, so it holds still as Stop and Try again come and go.
      className={cn("flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2", showWords && words && "min-h-8 pointer-coarse:min-h-10", className)}
      {...rest}
    >
      {showWords && words ? (
        <p
          ref={wordsRef as React.Ref<HTMLParagraphElement>}
          tabIndex={-1}
          data-slot="status-line-words"
          className="flex min-w-0 flex-1 basis-56 items-start gap-2 rounded-xs type-body text-pretty text-text"
        >
          <span aria-hidden="true" className="flex h-5 shrink-0 items-center">
            {mark}
          </span>
          <span className="min-w-0 wrap-break-word">{words}</span>
        </p>
      ) : (
        <span ref={wordsRef} hidden>
          {words}
        </span>
      )}
      {has(summary) ? (
        <span ref={summaryRef} hidden>
          {summary}
        </span>
      ) : null}
      {/* The timer goes with the words or with Stop: on its own it would be a number with nothing to explain it. */}
      {state === "working" && (showWords || onStop) ? (
        <span aria-hidden="true" data-slot="status-line-timer" className="type-meta text-text-muted tabular-nums">
          {timer}
        </span>
      ) : null}
      {state === "working" && onStop ? (
        <Button size={size} icon="Square" onClick={press(onStop)}>
          {stopLabel}
        </Button>
      ) : null}
      {state === "failed" && onRetry ? (
        <Button size={size} icon="RotateCcw" onClick={press(onRetry)}>
          {retryLabel}
        </Button>
      ) : null}
      {/* Polite and atomic, in the page from the start and empty until something changes. Nothing that moves sits inside it. */}
      <span role="status" aria-atomic="true" data-slot="status-line-live" className="sr-only">
        {line}
      </span>
    </div>
  )
})
