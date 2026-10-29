"use client"

import * as React from "react"

import { textareaBare, textareaBox } from "@/components/ui/textarea"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { AIDraftedMarker, type BrandCheck } from "./ai-drafted-marker"
import { useGrow } from "./ask-bar"
import { Avatar } from "./avatar"
import { Button } from "./button"
import { Field } from "./field"
import { Icon } from "./icon"
import { Skeleton } from "./skeleton"

export type ConversationStatus = "sending" | "sent" | "failed"

export interface ConversationMessage {
  /** Stable and unique: Try again names the message by it. */
  id: string
  /** Who sent it. */
  author: string
  /** What they said. */
  text: React.ReactNode
  /** When, as people read it: "Today, 9:41 am". */
  time: string
  /** The same moment for machines, for the time element: "2026-10-27T09:41". */
  dateTime?: string
  /** Sent by the person reading. */
  own?: boolean
  /** Sent by the assistant: it carries the assistant's tone and says so in words. */
  assistant?: boolean
  /** Not read yet: a dot, and "(unread)" to screen readers. */
  unread?: boolean
  /** The person's own message on its way: sending, sent, or failed with Try again. */
  status?: ConversationStatus
  /** A photo. Initials show until it loads. */
  avatar?: string
}

export interface ConversationProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** The messages, oldest first. */
  messages: ConversationMessage[]
  /** Names the thread: "Messages with [Northside Plumbing]". */
  label: string
  /** What the reply is for, as the composer's label: "Reply to [Northside Plumbing]". */
  composerLabel?: string
  /** An example, never an instruction. */
  placeholder?: string
  /** Called with the text on Send, or Cmd or Ctrl Enter. Enter adds a line. */
  onSend?: (text: string) => void
  sendLabel?: string
  /** Sends a failed message again. Focus moves to the message. */
  onRetry?: (id: string) => void
  retryLabel?: string
  /** What the person can still do while the thread loads; the messages are skeletons. */
  loading?: boolean
  /** What shows when nothing has been said yet. */
  empty?: React.ReactNode
  /** The thread could not load: say which system failed. Any messages given stay, as the last good copy. */
  error?: React.ReactNode
  /**
   * A reply the assistant drafted, put in the composer to check, edit and send: one composer and one Send, never a
   * second. It is marked as drafted until it is sent, and it goes only when the person sends it. `name` is who asked
   * for it, or `trigger` what started it; `check` how the brand check went.
   */
  draft?: { text: string; name?: string; trigger?: React.ReactNode; check?: BrandCheck }
}

/**
 * Messages between people, with a composer: support, comments, messaging. Each message names who sent it and
 * when, and a new one is announced politely, once.
 */
export const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(function Conversation(
  {
    messages,
    label,
    composerLabel = "Message",
    placeholder,
    onSend,
    sendLabel = "Send",
    onRetry,
    retryLabel = "Try again",
    loading = false,
    empty = "No messages yet",
    error,
    draft,
    className,
    ...rest
  },
  ref
) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const log = React.useRef<HTMLDivElement | null>(null)
  const field = React.useRef<HTMLTextAreaElement | null>(null)
  const rows = React.useRef(new Map<string, HTMLLIElement | null>())
  const [value, setValue] = React.useState(draft?.text ?? "")
  // A reply drafted for the person stays marked as drafted until it is sent. A new draft takes the composer's place.
  const [drafted, setDrafted] = React.useState(Boolean(draft?.text))
  const draftText = draft?.text
  React.useEffect(() => {
    if (!draftText) return
    setValue(draftText)
    setDrafted(true)
  }, [draftText])
  const markerId = `${React.useId()}-drafted`
  const list = Array.isArray(messages) ? messages : []
  // "Messages with [client]" reads on as "Loading messages with [client]".
  const name = String(label ?? "")
  const loadingLabel = name ? `Loading ${name.charAt(0).toLowerCase()}${name.slice(1)}` : "Loading messages"
  useGrow(field, value)

  // The newest message stays in view while the person is reading the end of the thread.
  const atEnd = React.useRef(true)
  React.useLayoutEffect(() => {
    const el = log.current
    if (el && atEnd.current) el.scrollTop = el.scrollHeight
  }, [list.length])

  const send = () => {
    const text = value.trim()
    if (!text) {
      field.current?.focus()
      return
    }
    atEnd.current = true
    // The text is handed over before the composer empties, so nothing typed is lost if sending fails.
    onSend?.(text)
    setValue("")
    setDrafted(false)
  }
  const retry = (id: string) => {
    // The message stays as it sends again, so focus lands on it.
    rows.current.get(id)?.focus()
    onRetry?.(id)
  }

  return (
    <div ref={merged} data-slot="conversation" className={cn("@container flex h-full min-h-0 w-full min-w-0 flex-col", className)} {...rest}>
      {/* A polite log: each message added at the end is read once. Changes inside a message are not, except a failure, which arrives as a line of its own. */}
      <div
        ref={log}
        role="log"
        aria-label={label}
        aria-relevant="additions"
        aria-busy={loading || undefined}
        tabIndex={0}
        data-slot="conversation-log"
        onScroll={(event) => {
          const el = event.currentTarget
          atEnd.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
        }}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:outline-offset-[-2px]"
      >
        {error ? (
          <p data-slot="conversation-error" className="flex items-start gap-2 px-4 pt-4 type-body text-text">
            <span aria-hidden="true" className="flex h-5 items-center text-danger">
              <Icon name="CircleAlert" />
            </span>
            <span className="min-w-0">{error}</span>
          </p>
        ) : null}
        {loading ? (
          <div data-slot="conversation-loading" className="flex flex-col gap-6 p-4">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-3">
                <Skeleton circle width={32} />
                <Skeleton lines={row === 1 ? 1 : 2} className="flex-1" label={row === 0 ? loadingLabel : undefined} />
              </div>
            ))}
          </div>
        ) : list.length ? (
          // Newest nearest the composer: a short thread sits at the foot of the log, as in any messaging app.
          <ol data-slot="conversation-messages" className="flex min-h-full flex-col justify-end gap-6 p-4">
            {list.map((m) => (
              <li
                key={m.id}
                ref={(el) => {
                  rows.current.set(m.id, el)
                }}
                tabIndex={-1}
                data-slot="conversation-message"
                data-own={m.own || undefined}
                data-assistant={m.assistant || undefined}
                data-unread={m.unread || undefined}
                className="flex gap-3 rounded-xs"
              >
                <Avatar name={m.author} src={m.assistant ? undefined : m.avatar} assistant={Boolean(m.assistant)} size={32} aria-hidden="true" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 type-meta text-text-muted">
                    <span className="type-label text-text-strong">{m.author}</span>
                    {/* Said in words, unless its name already says it. */}
                    {m.assistant && m.author.trim().toLowerCase() !== "assistant" ? <span className="text-ai">Assistant</span> : null}
                    <time dateTime={m.dateTime}>{m.time}</time>
                    {m.unread ? <span aria-hidden="true" data-slot="conversation-unread" className="size-2 shrink-0 rounded-full bg-highlight" /> : null}
                  </p>
                  <div data-slot="conversation-text" className="flex max-w-measure flex-col gap-2 type-body text-pretty text-text wrap-break-word">
                    {typeof m.text === "string" ? <p>{m.text}</p> : m.text}
                    {m.unread ? <span className="sr-only">(unread)</span> : null}
                  </div>
                  {m.status === "failed" ? (
                    <div key="failed" data-slot="conversation-failed" className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="flex items-center gap-1.5 type-meta text-danger">
                        <Icon name="CircleAlert" size={14} />
                        Not sent.
                      </p>
                      {onRetry ? (
                        <Button size="sm" variant="ghost" icon="RotateCcw" onClick={() => retry(m.id)}>
                          {retryLabel}
                        </Button>
                      ) : null}
                    </div>
                  ) : m.status ? (
                    <p key="delivery" data-slot="conversation-delivery" className="type-meta text-text-muted">
                      {m.status === "sending" ? "Sending…" : "Sent"}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : !error ? (
          <div className="flex min-h-full items-center justify-center p-6">
            <p data-slot="conversation-empty" className="max-w-measure text-center type-body text-pretty text-text-muted">
              {empty}
            </p>
          </div>
        ) : null}
      </div>

      {/* After the thread, so Tab moves from the thread's controls to the composer. */}
      <form
        data-slot="conversation-composer"
        className="shrink-0 border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <Field label={composerLabel}>
          <div className={cn(textareaBox, "items-end gap-2 py-1 pr-1 pl-3")}>
            <textarea
              ref={field}
              rows={2}
              value={value}
              placeholder={placeholder}
              aria-keyshortcuts="Meta+Enter Control+Enter"
              aria-describedby={drafted && draft ? markerId : undefined}
              data-slot="conversation-field"
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                // Enter adds a line, as it does in any field with more than one. Cmd or Ctrl Enter sends.
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  send()
                }
              }}
              className={cn(textareaBare, "py-1.5")}
            />
            <Button type="submit" size="sm" variant="primary" icon="Send" aria-disabled={!value.trim() || undefined}>
              {sendLabel}
            </Button>
          </div>
        </Field>
        {drafted && draft ? (
          <AIDraftedMarker
            id={markerId}
            name={draft.name}
            trigger={draft.trigger}
            check={draft.check}
            editedBy={value !== draft.text ? "you" : undefined}
            className="mt-2"
          />
        ) : null}
      </form>
    </div>
  )
})
