"use client"

import * as React from "react"

import { textareaBare, textareaBox } from "@/components/ui/textarea"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { focusAnswer } from "./ai-answer"
import { Button } from "./button"
import { Icon } from "./icon"
import { Kbd } from "./kbd"
import { useKeepFocus } from "./status-line"

/** Enter sends and Shift+Enter adds a line. The Enter that finishes a word in an input method never sends. */
export function enterSends(send: () => void) {
  return (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    send()
  }
}

/** Grows a textarea with its lines, up to a limit, then lets it scroll. */
export function useGrow(ref: React.RefObject<HTMLTextAreaElement | null>, value: string, maxLines = 6) {
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    // Not laid out yet (inside something hidden): leave its rows to set the height, rather than pin it at nothing.
    if (!el.scrollHeight) {
      el.style.height = ""
      return
    }
    const s = getComputedStyle(el)
    const max = (parseFloat(s.lineHeight) || 20) * maxLines + parseFloat(s.paddingTop) + parseFloat(s.paddingBottom)
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden"
  }, [ref, value, maxLines])
}

/** The newest answer inside an element, if any. */
export const newestAnswer = (root: Element | null | undefined) => {
  const all = root?.querySelectorAll('[data-slot="ai-answer"]')
  return all && all.length ? all[all.length - 1] : null
}

function isApplePlatform() {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform || nav.platform || "")
}

export interface AskBarProps extends Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onSubmit"> {
  /** What can be found, in the product's words. It is a hint, not the field's name. */
  placeholder?: string
  /** The field's accessible name. The placeholder by default. */
  label?: string
  /** The button's label. */
  action?: string
  /** Shows the key and lets Cmd K (Ctrl K off Apple devices) focus the field, even from another field. */
  shortcut?: boolean
  /** Called with the question when the person presses Enter or the button. */
  onAsk?: (question: string) => void
  defaultValue?: string
  /** The answers, oldest first: the bar and the answers share one column, newest answer last. Focus moves to each new one. */
  children?: React.ReactNode
}

/** Search and ask in one field, on Home: records, people, actions, or a question for the assistant. */
export const AskBar = React.forwardRef<HTMLDivElement, AskBarProps>(function AskBar(
  { placeholder = "Search or ask", label, action = "Ask", shortcut = true, onAsk, defaultValue = "", children, className, onFocus, onBlur, ...rest },
  ref
) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const merged = useMergedRef(ref, own)
  const field = React.useRef<HTMLTextAreaElement | null>(null)
  const answers = React.useRef<HTMLDivElement | null>(null)
  const [value, setValue] = React.useState(String(defaultValue ?? ""))
  // The server cannot know the device, so the first render assumes Apple and the browser corrects it.
  const [apple, setApple] = React.useState(true)
  React.useEffect(() => setApple(isApplePlatform()), [])
  useGrow(field, value)

  React.useEffect(() => {
    if (!shortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || event.altKey || event.shiftKey || event.defaultPrevented) return
      if (!(apple ? event.metaKey : event.ctrlKey)) return
      const input = field.current
      if (!input || !input.isConnected || input.disabled) return
      // Behind an open modal the field is out of reach: leave the keys to the dialog.
      const modal = document.querySelector('[aria-modal="true"]')
      if (modal && !modal.contains(input)) return
      event.preventDefault()
      input.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [shortcut, apple])

  // Each new answer takes focus after Ask or a follow-up (Rule 12), while the person is still here: someone who
  // moved on to the page by the time it arrives is left where they went.
  const seen = React.useRef<number | null>(null)
  React.useEffect(() => {
    const count = answers.current?.querySelectorAll('[data-slot="ai-answer"]').length ?? 0
    const before = seen.current
    seen.current = count
    if (before === null || count <= before) return
    if (!own.current?.contains(document.activeElement) && document.activeElement !== document.body) return
    focusAnswer(newestAnswer(answers.current))
  })
  // An answer going away with focus in it leaves focus in the field, never the page body.
  const keep = useKeepFocus(own, () => field.current)

  // A board passes the whitespace between its answers as text: that is not an answer.
  const hasAnswers = React.Children.toArray(children).some((c) => typeof c !== "string" || c.trim() !== "")

  const send = () => {
    const question = value.trim()
    if (!question) {
      field.current?.focus()
      return
    }
    // The question is handed over before the field empties, so nothing typed is lost if asking fails.
    onAsk?.(question)
    setValue("")
  }

  return (
    <div
      ref={merged}
      data-slot="ask-bar"
      onFocus={(event) => {
        keep.onFocus()
        onFocus?.(event)
      }}
      onBlur={(event) => {
        keep.onBlur(event)
        onBlur?.(event)
      }}
      className={cn("@container flex w-full max-w-[880px] min-w-0 flex-col", className)}
      {...rest}
    >
      <form
        role="search"
        data-slot="ask-bar-form"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        {/* 44px, the large control, and 48px on a touch screen; it grows as lines are added. */}
        <div className={cn(textareaBox, "items-end gap-2 pr-1.5 pl-3 pointer-coarse:pr-1")}>
          {/* On the first line as the question grows; the key and Ask stay on the last. */}
          <span aria-hidden="true" className="flex h-10.5 shrink-0 items-center self-start text-text-muted pointer-coarse:h-11.5">
            <Icon name="Search" />
          </span>
          <textarea
            ref={field}
            rows={1}
            value={value}
            placeholder={placeholder}
            aria-label={label ?? placeholder}
            aria-keyshortcuts={shortcut ? (apple ? "Meta+K" : "Control+K") : undefined}
            enterKeyHint="send"
            autoComplete="off"
            data-slot="ask-bar-field"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={enterSends(send)}
            className={cn(textareaBare, "peer py-2.75")}
          />
          {shortcut ? (
            // The advertised keys, hidden once the field has focus or words, and on touch screens.
            <span aria-hidden="true" className="flex h-10.5 shrink-0 items-center peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden pointer-coarse:hidden">
              <Kbd>⌘K</Kbd>
            </span>
          ) : null}
          <span className="flex h-10.5 shrink-0 items-center pointer-coarse:h-11.5">
            <Button type="submit" variant="brand" size="sm" icon="Sparkles" aria-disabled={!value.trim() || undefined}>
              {action}
            </Button>
          </span>
        </div>
      </form>
      {hasAnswers ? (
        <div ref={answers} data-slot="ask-bar-answers" className="mt-10 flex min-w-0 flex-col gap-12">
          {children}
        </div>
      ) : null}
    </div>
  )
})
