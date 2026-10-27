"use client"

import * as React from "react"

import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { Button } from "./button"
import { Icon } from "./icon"
import { IconButton } from "./icon-button"
import { Progress } from "./progress"

export type FileStatus = "queued" | "uploading" | "done" | "failed"

export interface FileListItem {
  /** Stable across updates; the name is used when there is none. */
  id?: string
  name: string
  /** The size in bytes. */
  size?: number
  /** How far the upload is, from 0 to 100. Leave it out while the length is unknown. */
  progress?: number | null
  status?: FileStatus
  /** For a failed file: what went wrong, then what to do. */
  error?: string
}

export interface FileListProps {
  files: FileListItem[]
  /** Adds a remove button to each file, named "Remove [file]". */
  onRemove?: (id: string) => void
  /** Adds a Retry button to each failed file. */
  onRetry?: (id: string) => void
  /** The list's name for screen readers. "Files" by default. */
  label?: string
  /** What the list says when it holds no files. */
  empty?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const UNITS = ["bytes", "KB", "MB", "GB"] as const

/** A file's size in the unit that suits it: 820 KB, 2.4 MB. Missing says so; it is never drawn as zero. */
function unitFor(bytes: number) {
  let unit = 0
  while (unit < UNITS.length - 1 && bytes >= 1024 ** (unit + 1)) unit++
  return unit
}
const inUnit = (bytes: number, unit: number) => formatNumber(bytes / 1024 ** unit, "number", { digits: unit >= 2 ? 1 : 0 })
export function fileSize(bytes?: number | null) {
  if (bytes === undefined || bytes === null || !Number.isFinite(bytes)) return ""
  const unit = unitFor(bytes)
  return `${inUnit(bytes, unit)} ${UNITS[unit]}`
}

const idOf = (f: FileListItem) => f.id ?? f.name

function kindIcon(name: string): IconName {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (["png", "jpg", "jpeg", "gif", "webp", "heic", "svg"].includes(ext)) return "Image"
  if (["csv", "xls", "xlsx", "numbers"].includes(ext)) return "Table2"
  return "FileText"
}

// Each state's word and icon: status never rides on colour alone.
const STATUS: Record<Exclude<FileStatus, "uploading">, { word: string; icon: IconName; tone: string }> = {
  queued: { word: "Waiting to upload", icon: "Clock", tone: "text-text-muted" },
  done: { word: "Uploaded", icon: "CircleCheck", tone: "text-success" },
  failed: { word: "Upload failed", icon: "CircleAlert", tone: "text-danger" },
}

/**
 * The files after a drop, each with its size, its progress while it uploads, a way to remove it, and a retry after
 * a failure that says what went wrong. Lays out by its own width.
 */
export const FileList = React.forwardRef<HTMLDivElement, FileListProps>(function FileList({ files, onRemove, onRetry, label = "Files", empty, className, style }, ref) {
  const list = React.useRef<HTMLDivElement | null>(null)
  const setRefs = (node: HTMLDivElement | null) => {
    list.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }
  const [news, setNews] = React.useState("")
  // After a file's own button takes it away, focus goes to the next file's remove button (or the one before, or the
  // list when it is empty); after Retry takes the button away, to the same file's remove button.
  const pending = React.useRef<{ removed: string; index: number } | { retried: string } | null>(null)

  // Speak when a file finishes or fails, never for the state the list loads in, and never on every percent.
  const seen = React.useRef<Map<string, { status?: FileStatus; name: string }> | null>(null)
  React.useEffect(() => {
    const before = seen.current
    const now = new Map(files.map((f) => [idOf(f), { status: f.status, name: f.name }]))
    seen.current = now
    if (!before) return
    const lines: string[] = []
    for (const f of files) {
      const was = before.get(idOf(f))
      if (!was || was.status === f.status) continue
      if (f.status === "done") lines.push(`${f.name} uploaded.`)
      if (f.status === "failed") lines.push(`${f.name} failed to upload.${f.error ? ` ${f.error}` : ""}`)
      if (f.status === "uploading" && was.status === "failed") lines.push(`Uploading ${f.name} again.`)
    }
    for (const [id, was] of before) if (!now.has(id)) lines.push(`${was.name} removed.`)
    if (lines.length) setNews(lines.join(" "))
  }, [files])

  // Focus moves only once the product has done what was asked (the file is gone, or uploading again), and only when
  // it was left on the page or in the list: a product that removes a file later, after a confirmation, never has
  // focus pulled back here from wherever the person has gone.
  React.useLayoutEffect(() => {
    const want = pending.current
    const root = list.current
    if (!want || !root) return
    const done = "removed" in want ? !files.some((f) => idOf(f) === want.removed) : files.find((f) => idOf(f) === want.retried)?.status !== "failed"
    if (!done) return
    pending.current = null
    const active = document.activeElement
    if (active && active !== document.body && !root.contains(active)) return
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-slot="file-list-item"]'))
    const removeIn = (row?: HTMLElement) => row?.querySelector<HTMLElement>('[data-slot="file-list-remove"]') ?? row
    if ("retried" in want) {
      removeIn(rows.find((r) => r.dataset.id === want.retried))?.focus()
      return
    }
    ;(removeIn(rows[Math.min(want.index, rows.length - 1)]) ?? root).focus()
  }, [files])

  return (
    <div
      ref={setRefs}
      data-slot="file-list"
      // Focus lands here when the last file is removed, so it never falls to the page.
      tabIndex={-1}
      className={cn("@container rounded-md border border-line bg-surface focus-visible:outline-offset-[-2px]", className)}
      style={style}
    >
      {files.length ? (
        <ul aria-label={label} className="divide-y divide-line">
          {files.map((f, index) => {
            const id = idOf(f)
            const status = f.status ?? "done"
            const known = typeof f.progress === "number" && Number.isFinite(f.progress)
            const unit = unitFor(f.size ?? 0)
            // The numbers in words, never past the file's own size.
            const done = known ? Math.min(100, Math.max(0, f.progress as number)) : 0
            const amount = known && f.size ? `${inUnit((f.size * done) / 100, unit)} of ${fileSize(f.size)}` : undefined
            const state = status === "uploading" ? null : STATUS[status]
            return (
              <li key={id} data-slot="file-list-item" data-id={id} data-status={status} className="flex items-start gap-3 px-4 py-3 @max-[399px]:px-3">
                <Icon name={kindIcon(f.name)} size={20} className="mt-px text-text-muted" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {status === "uploading" ? (
                    <Progress
                      label={f.name}
                      value={known ? f.progress : null}
                      indeterminate={!known}
                      showValue
                      valueLabel={amount ?? (known ? undefined : "Uploading")}
                      size="sm"
                      tone="brand"
                      className="[&>div:first-child>span:first-child]:[overflow-wrap:anywhere]"
                    />
                  ) : (
                    <div className="flex items-baseline justify-between gap-3">
                      <span data-slot="file-list-name" className="min-w-0 type-label [overflow-wrap:anywhere] text-text-strong">
                        {f.name}
                      </span>
                      <span data-slot="file-list-size" className="shrink-0 type-meta tabular-nums text-text-muted">
                        {fileSize(f.size)}
                      </span>
                    </div>
                  )}
                  {state ? (
                    <p data-slot="file-list-status" className={cn("flex items-start gap-1.5 type-meta", state.tone)}>
                      <Icon name={state.icon} size={14} className="mt-0.5" />
                      <span>
                        {state.word}
                        {status === "failed" && f.error ? <span className="text-text-muted">. {f.error}</span> : null}
                      </span>
                    </p>
                  ) : null}
                  {status === "failed" && onRetry ? (
                    // Under the reason, where it reads as the next step, at any width.
                    <Button
                      size="sm"
                      icon="RotateCcw"
                      aria-label={`Retry ${f.name}`}
                      className="mt-1 self-start"
                      onClick={() => {
                        pending.current = { retried: id }
                        onRetry(id)
                      }}
                    >
                      Retry
                    </Button>
                  ) : null}
                </div>
                {onRemove ? (
                  <IconButton
                    icon="X"
                    label={`Remove ${f.name}`}
                    size="sm"
                    data-slot="file-list-remove"
                    className="-my-1.5 pointer-coarse:-my-2.5"
                    onClick={() => {
                      pending.current = { removed: id, index }
                      onRemove(id)
                    }}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p data-slot="file-list-empty" className="px-4 py-3 type-meta text-text-muted">
          {empty ?? "No files added yet."}
        </p>
      )}
      <span aria-live="polite" className="sr-only">
        {news}
      </span>
    </div>
  )
})
