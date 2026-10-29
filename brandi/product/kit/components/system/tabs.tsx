"use client"

import * as React from "react"

import { Tabs as TabsRoot, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"

/** One tab. A plain string is its label, and its value is the label as a slug. */
export interface TabOption {
  /** URL-friendly, so the open tab can live in the address: "line-items". The label as a slug by default. */
  value?: string
  label: string
  /** Shown beside the label. Zero shows nothing. */
  count?: number
  /** What a screen reader hears for the count: "12 overdue". "12 items" by default, or "3 need you" with `attention`. */
  countLabel?: string
  /** The count waits on the reader, so it takes the highlight, as on the rail. */
  attention?: boolean
  icon?: IconName
  /** The tab's id, for a panel the page renders elsewhere. */
  id?: string
  /** The id of that panel, which the tab controls. */
  panelId?: string
}

export interface TabsProps {
  /** Two to seven tabs. */
  tabs: Array<string | TabOption>
  /** The open tab, from the URL. */
  value?: string
  defaultValue?: string
  /** Called with the new value: put it in the URL. */
  onChange?: (value: string) => void
  /** Names the row of tabs for a screen reader: "Invoice sections". */
  label: string
  /** The open tab's panel. Leave it out when the page renders the panel itself, with the tab's `id` and `panelId`. */
  children?: React.ReactNode
  className?: string
}

/** A label as a URL-friendly value: "Line items" becomes "line-items". */
export function toSlug(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Sections of one page or record, with optional counts. */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { tabs, value, defaultValue, onChange, label, children, className },
  ref
) {
  const base = React.useId()
  const list = tabs.map((tab, i) => {
    const t = typeof tab === "string" ? { label: tab } : tab
    // A label with no Latin letters or digits has no slug; its place keeps the value unique.
    const v = t.value ?? (toSlug(t.label) || `tab-${i + 1}`)
    return { ...t, value: v, id: t.id ?? `${base}-tab-${v}`, panelId: t.panelId ?? `${base}-panel-${v}`, controls: Boolean(t.panelId) || children !== undefined }
  })
  const [own, setOwn] = React.useState(defaultValue ?? list[0]?.value)
  const selected = value ?? own
  const current = list.find((t) => t.value === selected) ?? list[0]

  return (
    <TabsRoot
      ref={ref}
      value={current?.value}
      onValueChange={(next) => {
        setOwn(next)
        onChange?.(next)
      }}
      className={cn("min-w-0 gap-0", className)}
    >
      {/* The row starts 12px out, so the first label sits flush with the title above it; the hairline
          is drawn from the flush edge, under the tabs, so the open tab's underline covers it. */}
      <TabsList
        aria-label={label}
        className="-ml-3 w-auto bg-[linear-gradient(var(--line),var(--line))] bg-[length:calc(100%-0.75rem)_1px] bg-right-bottom bg-no-repeat shadow-none"
      >
        {list.map((t) => {
          const count = t.count && t.count > 0 ? t.count : 0
          const words = t.countLabel ?? (t.attention ? `${formatNumber(count, "number")} ${count === 1 ? "needs" : "need"} you` : `${formatNumber(count, "number")} ${count === 1 ? "item" : "items"}`)
          // A count is read as words ("Line items, 12 items"), never as a bare grey number.
          return (
            <TabsTrigger key={t.value} value={t.value} id={t.id} aria-controls={t.controls ? t.panelId : undefined} aria-label={count ? `${t.label}, ${words}` : undefined}>
              {t.icon ? <Icon name={t.icon} /> : null}
              <span>{t.label}</span>
              {/* A space between the word and the figure, so the visible text reads "Waiting 4" and stays inside the name (WCAG 2.5.3). */}
              {count ? " " : null}
              {count ? (
                <span
                  aria-hidden="true"
                  data-slot="tabs-count"
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 type-caption tabular-nums",
                    t.attention ? "bg-highlight text-on-highlight" : "bg-tag-grey text-text-muted"
                  )}
                >
                  {formatNumber(count, "number")}
                </span>
              ) : null}
            </TabsTrigger>
          )
        })}
      </TabsList>
      {children !== undefined && current ? (
        <TabsContent value={current.value} id={current.panelId} aria-labelledby={current.id} className="mt-4">
          {children}
        </TabsContent>
      ) : null}
    </TabsRoot>
  )
})
