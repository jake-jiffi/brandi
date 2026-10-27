"use client"

import * as React from "react"

import { FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { Icon } from "./icon"

export interface FileDropProps {
  /** What to drop, and where it goes ("Drop the [bank statement] here"). */
  title: React.ReactNode
  /** The rule in words: "CSV or XLSX, up to 20 MB". */
  description?: React.ReactNode
  /** The real button's label. "Choose files", or "Choose a file" when multiple is off. */
  browseLabel?: string
  /** The types it takes, as an input's accept: ".csv,.xlsx" or "image/*". Checked on drop as well as on choosing. */
  accept?: string
  multiple?: boolean
  /** What went wrong and how to fix it (too big, an upload that failed). Announced when it appears. */
  error?: React.ReactNode
  /** The files that passed the type and count check. */
  onFiles?: (files: File[]) => void
  /** Design mode: draws the zone as a file is dragged over it, for a board. */
  dragOver?: boolean
  id?: string
  className?: string
  style?: React.CSSProperties
}

// ".csv,.xlsx" reads as "CSV or XLSX"; "image/*" as "image files".
function kinds(accept: string) {
  const words = accept
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith(".") ? t.slice(1).toUpperCase() : t.endsWith("/*") ? `${t.slice(0, -2)} files` : (t.split("/")[1] ?? t).replace(/^x-/, "").toUpperCase()))
  return words.length > 1 ? `${words.slice(0, -1).join(", ")} or ${words[words.length - 1]}` : words[0] ?? ""
}

function accepts(file: File, accept?: string) {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .some((t) => (t.startsWith(".") ? name.endsWith(t) : t.endsWith("/*") ? type.startsWith(t.slice(0, -1)) : type === t))
}

/**
 * A drop zone with a real button, so keyboard, screen-reader and touch users never depend on dragging. A wrong
 * file is turned away with the reason and the fix, never silently. Lays out in a row from 520px of its own width.
 */
export const FileDrop = React.forwardRef<HTMLDivElement, FileDropProps>(function FileDrop(
  { title, description, browseLabel, accept, multiple = false, error, onFiles, dragOver = false, id, className, style },
  ref
) {
  const base = React.useId()
  const titleId = `${base}-title`
  const descriptionId = `${base}-description`
  const errorId = `${base}-error`
  const input = React.useRef<HTMLInputElement>(null)
  const depth = React.useRef(0)
  const [dragging, setDragging] = React.useState(false)
  const [turnedAway, setTurnedAway] = React.useState<string | null>(null)
  // The newest message wins: a file turned away here shows over an older error from the product, and a new error
  // from the product clears it.
  const errorKey = typeof error === "string" || typeof error === "number" ? String(error) : error ? "element" : ""
  React.useEffect(() => setTurnedAway(null), [errorKey])
  const shown = turnedAway ?? (error !== undefined && error !== null && error !== false && error !== "" ? error : null)
  const over = dragOver || dragging

  const take = (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (!files.length) return
    if (!multiple && files.length > 1) {
      setTurnedAway("This takes one file at a time. Drop or choose one.")
      return
    }
    const wrong = files.filter((f) => !accepts(f, accept))
    const right = files.filter((f) => accepts(f, accept))
    setTurnedAway(
      wrong.length
        ? `${wrong[0].name}${wrong.length > 1 ? ` and ${wrong.length - 1} more` : ""} ${wrong.length > 1 ? "are" : "is"} the wrong type. Choose ${kinds(accept ?? "")}.`
        : null
    )
    if (right.length) onFiles?.(right)
  }

  const hasFiles = (event: React.DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files")

  return (
    <div
      ref={ref}
      id={id}
      data-slot="file-drop"
      data-drag-over={over || undefined}
      data-invalid={shown ? "" : undefined}
      className={cn(
        "@container rounded-md border border-dashed border-line-control bg-surface transition-colors data-invalid:border-danger data-drag-over:border-solid data-drag-over:border-primary data-drag-over:bg-selected data-drag-over:shadow-[inset_0_0_0_1px_var(--primary)]",
        className
      )}
      style={style}
      onDragEnter={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        depth.current += 1
        setDragging(true)
      }}
      onDragOver={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = "copy"
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1)
        if (depth.current === 0) setDragging(false)
      }}
      onDrop={(event) => {
        if (!hasFiles(event)) return
        event.preventDefault()
        depth.current = 0
        setDragging(false)
        take(event.dataTransfer.files)
      }}
    >
      {/* In a row, everything aligns to the title, so an error under the rule grows downwards only. */}
      <div className="flex flex-col items-center gap-3 px-5 py-6 text-center @min-[520px]:flex-row @min-[520px]:items-start @min-[520px]:gap-4 @min-[520px]:px-6 @min-[520px]:py-5 @min-[520px]:text-left">
        <Icon name="Upload" size={20} className={cn("shrink-0", over ? "text-primary" : "text-text-muted")} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p id={titleId} data-slot="file-drop-title" className="type-label text-text-strong">
            {title}
          </p>
          {description ? (
            <p id={descriptionId} data-slot="file-drop-description" className="type-meta text-text-muted">
              {description}
            </p>
          ) : null}
          <div data-slot="field-message" aria-live="polite">
            {shown ? (
              <FieldError id={errorId} role={undefined} className="mt-1 justify-center @min-[520px]:justify-start">
                {shown}
              </FieldError>
            ) : null}
          </div>
        </div>
        <Button
          icon="FileUp"
          onClick={() => input.current?.click()}
          aria-describedby={[titleId, description ? descriptionId : null, shown ? errorId : null].filter(Boolean).join(" ")}
        >
          {browseLabel ?? (multiple ? "Choose files" : "Choose a file")}
        </Button>
      </div>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          take(event.target.files)
          // The same file chosen again still counts as a change.
          event.target.value = ""
        }}
      />
    </div>
  )
})
