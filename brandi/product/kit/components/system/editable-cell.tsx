"use client"

import * as React from "react"

import { FieldError } from "@/components/ui/field"
import { formatNumber, type NumberStyle } from "@/lib/format"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { Spinner } from "./spinner"
import { TextInput } from "./text-input"

/**
 * Saves what was typed. Return, or resolve, a message to say the save failed: name the system and the next
 * step. A rejected promise fails it too. Anything else is a save.
 */
export type EditableCellSave = (value: string) => void | string | null | undefined | Promise<void | string | null | undefined>

export type EditableCellState = "editing" | "saving" | "failed"

export interface EditableCellProps {
  /** The saved value. */
  value?: string | number | null
  /** Names the field, with the record: "Hours for [Priya Nair]". */
  label: string
  /** A number style: the value reads through the formatter, and typing opens a number keyboard. */
  format?: NumberStyle
  /** What a missing value says. */
  empty?: string
  /** Numbers sit at the end, text at the start. */
  align?: "start" | "end"
  /** Checks what was typed, on Enter or on leaving: return what is wrong and how to fix it. */
  validate?: (value: string) => string | null | undefined
  /** Saves what was typed. A message, returned or resolved, keeps the cell open with it. */
  onSave?: EditableCellSave
  /** Design mode: shows a state in place, for a board. It takes no focus. */
  state?: EditableCellState
  /** With state: what was typed. */
  draft?: string
  /** With state "failed": the message. */
  error?: string
  /** Shows the value as text, with nothing to edit. */
  disabled?: boolean
  className?: string
}

/** What to type, with an example in the market's own figures, in Field's wording. */
function numberHint(format: NumberStyle) {
  switch (format) {
    case "currency":
    case "compact-currency":
      return `Enter an amount, such as ${formatNumber(120.5, "currency")}`
    case "hours":
      return `Enter hours as a number, such as ${formatNumber(7.5)}`
    case "percent":
      return `Enter a percentage as a number, such as ${formatNumber(12.5)}`
    case "points":
      return `Enter points as a number, such as ${formatNumber(2.5)}`
    default:
      return `Enter a number, such as ${formatNumber(12)}`
  }
}

// The market's decimal mark, as the formatter writes it: "." in en-AU, "," in de-DE.
const decimalMark = () => formatNumber(1.5, "number").replace(/\d/g, "") || "."

/** What a person types for a number, in the market's own marks: "$1,200", "7.5 h" and "12%" are numbers too. */
function cleanNumber(typed: string) {
  const mark = decimalMark()
  const group = mark === "," ? "." : ","
  const bare = typed.replace(/\s/g, "").replace(/(h|pts?|%)$/i, "").replace(/^(-?)(A\$|NZ\$|US\$|\$|€|£|¥)/, "$1")
  return bare.split(group).join("").replace(mark, ".")
}
const textOf = (v: unknown) => (v === null || v === undefined ? "" : String(v))
/** A number as the person edits it: no grouping, the market's decimal mark. */
const editText = (v: unknown, numeric: boolean) => (numeric && typeof v === "number" ? String(v).replace(".", decimalMark()) : textOf(v))
const failure = (e: unknown) => (e instanceof Error && e.message ? e.message : typeof e === "string" && e ? e : "Not saved. Try again.")
const isThenable = (v: unknown): v is PromiseLike<unknown> => typeof (v as PromiseLike<unknown>)?.then === "function"
/** "Hours for [Priya Nair]" reads "hours for [Priya Nair]" inside a sentence; "GST paid" keeps its capitals. */
const inSentence = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s)

/**
 * Changes a value in place, in a table: Enter or a press starts an edit, Enter saves, Escape cancels and puts
 * the value back. A wrong value or a failed save keeps the cell open with what was typed, and says why.
 */
export const EditableCell = React.forwardRef<HTMLDivElement, EditableCellProps>(function EditableCell(
  { value, label, format, empty = "Not set", align, validate, onSave, state, draft, error, disabled = false, className },
  ref
) {
  const numeric = format !== undefined
  const end = (align ?? (numeric ? "end" : "start")) === "end"
  const base = React.useId()
  const errorId = `${base}-error`
  const [shown, setShown] = React.useState<unknown>(value)
  const [mode, setMode] = React.useState<"rest" | "editing" | "saving">(state === "failed" ? "editing" : (state ?? "rest"))
  const [text, setText] = React.useState(draft ?? editText(value, numeric))
  const [message, setMessage] = React.useState<string | null>(state === "failed" ? (error ?? null) : null)
  const [status, setStatus] = React.useState("")
  const [justSaved, setJustSaved] = React.useState(false)
  const cell = React.useRef<HTMLButtonElement | null>(null)
  const input = React.useRef<HTMLInputElement | null>(null)
  // Where focus goes once the next mode has rendered: into the field, back to the cell, or nowhere (the person
  // tabbed away, and focus is theirs).
  const focusNext = React.useRef<"input" | "cell" | null>(null)
  const selectAll = React.useRef(true)
  // Set while the field is being taken away, so its blur is not read as the person leaving it.
  const closing = React.useRef(false)
  const live = React.useRef(true)

  React.useEffect(() => () => { live.current = false }, [])
  React.useEffect(() => setShown(value), [value])
  // A board changing the design state redraws it.
  React.useEffect(() => {
    if (state === undefined) return
    setMode(state === "failed" ? "editing" : state)
    setText(draft ?? editText(value, numeric))
    setMessage(state === "failed" ? (error ?? null) : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, draft, error])
  React.useEffect(() => {
    if (!justSaved) return
    const t = window.setTimeout(() => setJustSaved(false), 1600)
    return () => window.clearTimeout(t)
  }, [justSaved])

  React.useLayoutEffect(() => {
    closing.current = false
    const next = focusNext.current
    focusNext.current = null
    if (next === "input" && input.current) {
      input.current.focus()
      if (selectAll.current) input.current.select()
      else input.current.setSelectionRange(input.current.value.length, input.current.value.length)
    } else if (next === "cell" && cell.current) {
      cell.current.focus()
    }
  }, [mode])

  const show = (v: unknown) => (numeric ? formatNumber(v as number | string | null | undefined, format) : textOf(v))
  const atRest = mode === "saving" ? show(numeric ? cleanNumber(text) : text) : show(shown)

  const begin = (typed?: string) => {
    if (disabled || mode === "saving") return
    setText(typed ?? editText(shown, numeric))
    setMessage(null)
    setStatus("")
    selectAll.current = typed === undefined
    focusNext.current = "input"
    setMode("editing")
  }

  const close = (to: "cell" | null) => {
    closing.current = true
    setMessage(null)
    focusNext.current = to
    setMode("rest")
  }

  const cancel = () => {
    setText(editText(shown, numeric))
    close("cell")
  }
  const cancelNow = React.useRef(cancel)
  cancelNow.current = cancel

  // The edit is the top layer, so Escape cancels it first. A dialog or sheet round the table listens on the
  // document as the key comes down, so the cell listens on the window, which hears it before the document does.
  React.useEffect(() => {
    if (mode !== "editing") return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.target !== input.current) return
      event.preventDefault()
      event.stopPropagation()
      cancelNow.current()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [mode])

  const fail = (why: string, to: "input" | null) => {
    setMessage(why)
    focusNext.current = to
    setMode("editing")
  }

  const commit = async (to: "cell" | null) => {
    const typed = text.trim()
    const next = numeric ? cleanNumber(typed) : typed
    if (numeric && next !== "" && !Number.isFinite(Number(next))) {
      setMessage(numberHint(format as NumberStyle))
      return
    }
    const wrong = validate?.(next)
    if (wrong) {
      setMessage(wrong)
      return
    }
    // Nothing changed, however it was typed ("40" and "40.0" are the same hours): nothing to save.
    const before = textOf(shown)
    if (next === "" ? before === "" : numeric ? before !== "" && Number(next) === Number(before) : next === before) {
      close(to)
      return
    }
    let result: unknown
    try {
      result = onSave?.(next)
    } catch (e) {
      result = failure(e)
    }
    if (isThenable(result)) {
      closing.current = true
      focusNext.current = to
      setMode("saving")
      try {
        result = await result
      } catch (e) {
        result = failure(e)
      }
      if (!live.current) return
      if (typeof result === "string" && result) {
        // Back into the field only if the person is still on this cell; if they moved on, the error waits here.
        fail(result, document.activeElement === cell.current ? "input" : null)
        return
      }
    } else if (typeof result === "string" && result) {
      setMessage(result)
      return
    }
    setShown(next === "" ? null : numeric ? Number(next) : next)
    setStatus("Saved")
    setJustSaved(true)
    close(to)
  }

  if (disabled) {
    return (
      <div ref={ref} data-slot="editable-cell" data-state="read-only" className={cn("min-w-0", end && "text-right", className)}>
        <span className={cn(atRest ? "text-text" : "text-text-subtle", numeric && "tabular-nums")}>{atRest || empty}</span>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-slot="editable-cell"
      data-state={mode === "editing" && message ? "failed" : mode}
      className={cn("flex min-w-0 flex-col", numeric ? "min-w-24" : "min-w-40", end ? "items-end" : "items-start", className)}
    >
      {mode === "editing" ? (
        <>
          <TextInput
            ref={input}
            size="sm"
            value={text}
            aria-label={label}
            invalid={Boolean(message)}
            aria-describedby={message ? errorId : undefined}
            inputMode={numeric ? "decimal" : undefined}
            autoComplete="off"
            className={cn("w-full", end && "text-right")}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void commit("cell")
              }
            }}
            onBlur={() => {
              if (!closing.current) void commit(null)
            }}
          />
          {/* Polite, and here from the start, so a message is read when it appears and never on load. */}
          <div data-slot="editable-cell-message" aria-live="polite" className="w-full">
            {message ? (
              <FieldError id={errorId} role={undefined} className="mt-1.5 max-w-64 text-left whitespace-normal">
                {message}
              </FieldError>
            ) : null}
          </div>
        </>
      ) : (
        <button
          ref={cell}
          type="button"
          data-slot="editable-cell-value"
          aria-label={`Edit ${inSentence(label)}, ${atRest || empty}`}
          aria-busy={mode === "saving" || undefined}
          aria-disabled={mode === "saving" || undefined}
          onClick={() => begin()}
          onKeyDown={(event) => {
            if (event.key === "F2") {
              event.preventDefault()
              begin()
            } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
              // Typing starts an edit with what was typed, as a spreadsheet does.
              event.preventDefault()
              begin(event.key)
            }
          }}
          className={cn(
            // 8px of inset either side, pulled back by the margin, so the value lines up with the column's other cells.
            "-mx-2 inline-flex h-8 max-w-full min-w-0 items-center gap-1.5 rounded-xs px-2 transition-colors hover:bg-hover hover:shadow-[inset_0_0_0_1px_var(--line-control)] pointer-coarse:h-10",
            end ? "flex-row-reverse text-right" : "text-left",
            atRest ? "text-text" : "text-text-subtle",
            numeric && "tabular-nums"
          )}
        >
          <span className="min-w-0 truncate">{atRest || empty}</span>
          {mode === "saving" ? (
            <Spinner size={14} label={null} className="text-text-muted" />
          ) : justSaved ? (
            <Icon name="Check" size={14} className="text-success" />
          ) : null}
        </button>
      )}
      <span role="status" className="sr-only">
        {mode === "saving" ? "Saving" : status}
      </span>
    </div>
  )
})
