"use client"

import * as React from "react"

import { textareaBare, textareaBox } from "@/components/ui/textarea"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { focusAnswer, focusStopped, stopInComposer } from "./ai-answer"
import { focusFirst } from "./alert"
import { enterSends, newestAnswer, useGrow } from "./ask-bar"
import { Button } from "./button"
import { EmptyState } from "./empty-state"
import { Icon } from "./icon"
import { hasAskingProposal } from "./ai-proposal"
import { IconButton } from "./icon-button"
import { useKeepFocus } from "./status-line"

export interface AskPanelProps extends Omit<React.ComponentPropsWithoutRef<"aside">, "title" | "children"> {
  /** The panel's name: the assistant, or the product's own name for it. */
  title?: string
  /** The title's heading level, so no page skips one. */
  headingLevel?: 2 | 3 | 4
  /** The thread, oldest first: AIAnswers, with any AIProposal inside the answer it belongs to. */
  children?: React.ReactNode
  /** The empty thread's title: "Morning, [Sam]". */
  greeting?: React.ReactNode
  /** Up to three questions for an empty thread, as quiet buttons. A viewer sees none that create anything. */
  suggestions?: string[]
  onSuggest?: (suggestion: string) => void
  /** Called with the question on Enter or Ask. Focus then moves to the new answer. */
  onSend?: (question: string) => void
  /** An answer is running: Ask becomes Stop. */
  working?: boolean
  /** Stops the running answer. Focus moves to its "Stopped at step N of M" line. */
  onStop?: () => void
  stopLabel?: string
  /** The composer's button. Ask, the verb AskBar uses, so asking the assistant reads the same everywhere: Send is what a person does to an email. */
  sendLabel?: string
  /** What the composer is for: its accessible name. */
  composerLabel?: string
  /** An example question, never an instruction. */
  placeholder?: string
  /** Shows a close button, and lets Escape close the panel. Focus goes back to what opened it. */
  onClose?: () => void
  closeLabel?: string
  /** Moves focus to the composer when it opens, for a panel a person just opened. Leave it off for one open when the page loads. */
  autoFocus?: boolean
}

/**
 * The assistant's docked panel: a thread of answers, the empty state and the composer, beside the page and never
 * in front of it. It traps nothing: people keep working in the page behind it.
 */
export const AskPanel = React.forwardRef<HTMLElement, AskPanelProps>(function AskPanel(
  {
    title = "Assistant",
    headingLevel = 2,
    children,
    greeting = "No questions yet",
    suggestions,
    onSuggest,
    onSend,
    working = false,
    onStop,
    stopLabel = "Stop",
    sendLabel = "Ask",
    composerLabel = "Ask the assistant",
    placeholder,
    onClose,
    closeLabel = "Close the assistant",
    autoFocus = false,
    className,
    onKeyDown,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const own = React.useRef<HTMLElement | null>(null)
  const merged = useMergedRef(ref, own)
  const thread = React.useRef<HTMLDivElement | null>(null)
  const field = React.useRef<HTMLTextAreaElement | null>(null)
  const ids = React.useId()
  const titleId = `${ids}-title`
  const fieldId = `${ids}-field`
  const [value, setValue] = React.useState("")
  // A board writes the level as text ("2").
  const level = [2, 3, 4].includes(Number(headingLevel)) ? Number(headingLevel) : 2
  const Heading = `h${level}` as "h2"
  const running = Boolean(working)
  useGrow(field, value)
  // Send making way for Stop, or a thread control going away, leaves focus in the composer.
  const keep = useKeepFocus(own, () => field.current)

  // Whatever had focus when the panel opened is where focus goes back to when it closes.
  const opener = React.useRef<HTMLElement | null>(null)
  React.useLayoutEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && active !== document.body && !own.current?.contains(active)) opener.current = active
    if (autoFocus) field.current?.focus()
    // Only when it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A proposal waiting in the thread: its action is the only primary on screen, so Send drops to secondary (Rule 3).
  // Typing re-renders the panel with the same thread, so the thread is only read again when it changes.
  const waiting = React.useMemo(() => hasAskingProposal(children), [children])

  // Each new answer takes focus after Send or a follow-up (Rule 12), while the person is still in the panel: someone
  // who moved on to the page by the time it arrives is left where they went.
  const seen = React.useRef<number | null>(null)
  React.useEffect(() => {
    const count = thread.current?.querySelectorAll('[data-slot="ai-answer"]').length ?? 0
    const before = seen.current
    seen.current = count
    if (before === null || count <= before) return
    if (!own.current?.contains(document.activeElement) && document.activeElement !== document.body) return
    focusAnswer(newestAnswer(thread.current))
  })

  const send = () => {
    if (running) return
    const question = value.trim()
    if (!question) {
      field.current?.focus()
      return
    }
    // The question is handed over before the composer empties, so nothing typed is lost if sending fails.
    onSend?.(question)
    setValue("")
  }
  const stop = () => {
    focusStopped(newestAnswer(thread.current))
    onStop?.()
  }
  const close = () => {
    const back = opener.current
    onClose?.()
    // Closed at once, and focus goes back to what opened it, then the page title, then main.
    focusFirst([back, document.querySelector<HTMLElement>('[data-slot="page-title"]'), document.querySelector<HTMLElement>("main")])
  }

  const ideas = Array.isArray(suggestions) ? suggestions.slice(0, 3) : []
  // A board passes the whitespace between its answers as text: that is not a thread.
  const hasThread = React.Children.toArray(children).some((c) => typeof c !== "string" || c.trim() !== "")

  return (
    <aside
      ref={merged}
      aria-labelledby={titleId}
      data-slot="ask-panel"
      onFocus={(event) => {
        keep.onFocus()
        onFocus?.(event)
      }}
      onBlur={(event) => {
        keep.onBlur(event)
        onBlur?.(event)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key !== "Escape" || !onClose || event.defaultPrevented) return
        event.preventDefault()
        close()
      }}
      className={cn("@container flex h-full min-h-0 w-full min-w-0 flex-col border-l border-line bg-surface", className)}
      {...rest}
    >
      <div data-slot="ask-panel-header" className="flex h-14 shrink-0 items-center gap-2 border-b border-line pr-2 pl-4">
        <Icon name="Sparkles" size={level === 2 ? 18 : 16} className="text-ai" />
        {/* Its size follows its level, as a Card's title does. */}
        <Heading id={titleId} className={cn("min-w-0 flex-1 truncate text-text-strong", level === 2 ? "type-heading-lg" : level === 3 ? "type-heading" : "type-heading-sm")}>
          {title}
        </Heading>
        {onClose ? <IconButton icon="X" label={closeLabel} size="sm" onClick={close} /> : null}
      </div>

      <stopInComposer.Provider value={Boolean(onStop)}>
        <div ref={thread} data-slot="ask-panel-thread" className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          {hasThread ? (
            <div className="flex flex-col gap-10 px-4 py-5">{children}</div>
          ) : (
            <EmptyState
              flat
              size="compact"
              title={greeting}
              headingLevel={(level + 1) as 3}
              className="my-auto"
              actions={ideas.map((idea) => ({ label: idea, variant: "ghost" as const, icon: "CornerDownRight" as const, onClick: () => onSuggest?.(idea) }))}
            />
          )}
        </div>
      </stopInComposer.Provider>

      {/* After the thread in the tab order, so it is the next stop after the newest answer's own controls. */}
      <form
        data-slot="ask-panel-composer"
        className="shrink-0 border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <label htmlFor={fieldId} className="sr-only">
          {composerLabel}
        </label>
        <div className={cn(textareaBox, "items-end gap-2 py-1 pr-1 pl-3")}>
          <textarea
            ref={field}
            id={fieldId}
            rows={1}
            value={value}
            placeholder={placeholder}
            enterKeyHint="send"
            autoComplete="off"
            data-slot="ask-panel-field"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={enterSends(send)}
            className={cn(textareaBare, "py-1.5")}
          />
          {/* Keyed apart: reusing the pressed Stop as a submit button would let the browser send the form from its click. */}
          {running && onStop ? (
            <Button key="stop" type="button" size="sm" icon="CircleStop" onClick={stop}>
              {stopLabel}
            </Button>
          ) : (
            <Button
              key="send"
              type="submit"
              size="sm"
              variant={waiting ? "secondary" : "primary"}
              icon="Send"
              aria-disabled={running || !value.trim() || undefined}
            >
              {sendLabel}
            </Button>
          )}
        </div>
      </form>
    </aside>
  )
})
