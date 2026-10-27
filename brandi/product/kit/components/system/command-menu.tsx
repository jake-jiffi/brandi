"use client"

import * as React from "react"

import { Button as ButtonBase } from "@/components/ui/button"
import { Dialog as DialogRoot, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { formatNumber } from "@/lib/format"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { useOverlayOpener } from "./dialog"
import { Icon } from "./icon"
import { Kbd } from "./kbd"

/** One result: a record to jump to or an action to run. */
export interface CommandAction {
  label: string
  icon?: IconName
  /** A few words after the label, in the muted colour. */
  description?: string
  /** Other words that find it. Matching is a plain "contains" on the label and these. */
  keywords?: string[]
  /** Shown as a key, when the action has one elsewhere. */
  shortcut?: string
  /** A short fact on the right, such as the record's type. */
  meta?: string
  onSelect?: () => void
}

export interface CommandGroup {
  /** In this order: Jump to, Actions. Ask comes last on its own when `onAsk` is passed. */
  label: string
  items: CommandAction[]
}

export interface CommandMenuProps {
  groups: CommandGroup[]
  /** "Search or ask" when `onAsk` is passed, otherwise "Search". */
  placeholder?: string
  /** The words each opening starts with, for a design on a canvas. Every opening starts empty without it. */
  query?: string
  /** Called with the result that ran, after its own onSelect. */
  onSelect?: (item: CommandAction) => void
  /** Escape, the scrim and running a result call it. */
  onClose?: () => void
  /** The line shown when nothing matches and there is no `onAsk`. */
  emptyText?: string
  /** Wires the assistant: an Ask result comes last, and Enter asks when nothing else matches. */
  onAsk?: (query: string) => void
  /** Opens it near the top of the page as a dialog that holds focus. Without it, it sits in place. */
  modal?: boolean
  /** Shows the modal palette. The shell owns the state, and Cmd or Ctrl K. For a design on a canvas, leave modal off and it draws in place. */
  open?: boolean
  /** Names the search field and the dialog. */
  label?: string
  /** Where focus goes on close when nothing had focus as it opened, as when a shortcut opened it. */
  returnFocus?: React.RefObject<HTMLElement | null>
  className?: string
}

type Result = CommandAction & { ask?: boolean }
type Section = { label: string; items: Result[] }

/** Matching is a plain "contains" on labels and keywords, and keeps the order people learnt: never ranked. */
function resultsFor(groups: CommandGroup[], query: string, onAsk?: (query: string) => void): Section[] {
  const needle = query.trim().toLocaleLowerCase()
  const hit = (item: CommandAction) => [item.label, ...(item.keywords ?? [])].some((text) => text.toLocaleLowerCase().includes(needle))
  const sections: Section[] = groups
    .map((g) => ({ label: g.label, items: needle ? g.items.filter(hit) : g.items }))
    .filter((g) => g.items.length > 0)
  const asked = query.trim()
  if (onAsk && asked) sections.push({ label: "Ask", items: [{ label: `Ask about “${asked}”`, icon: "Sparkles", ask: true, onSelect: () => onAsk(asked) }] })
  return sections
}

/** What the live region says after a keystroke: the count, or that nothing matched. */
function countWords(sections: Section[], query: string, asks: boolean) {
  const asked = query.trim()
  if (!asked) return ""
  const found = sections.reduce((n, s) => n + s.items.filter((r) => !r.ask).length, 0)
  if (found) return `${formatNumber(found, "number")} ${found === 1 ? "result" : "results"}`
  return asks ? `No matches. Enter asks about “${asked}”.` : `No matches for “${asked}”.`
}

function Palette({
  groups,
  placeholder,
  initialQuery,
  onSelect,
  onClose,
  emptyText,
  onAsk,
  label,
  closeButton,
  modal,
}: {
  groups: CommandGroup[]
  placeholder: string
  initialQuery: string
  onSelect?: (item: CommandAction) => void
  onClose?: () => void
  emptyText?: string
  onAsk?: (query: string) => void
  label: string
  closeButton: boolean
  modal: boolean
}) {
  const [query, setQuery] = React.useState(initialQuery)
  const [chosen, setActive] = React.useState(0)
  const [spoken, setSpoken] = React.useState("")
  const id = React.useId()

  const sections = resultsFor(groups, query, onAsk)
  const flat = sections.flatMap((s) => s.items)
  // Held inside the results, so a list that shrinks while open (results arriving) never points past its end.
  const active = Math.min(chosen, Math.max(flat.length - 1, 0))
  const optionId = (i: number) => `${id}-option-${i}`

  // Every keystroke puts the first result in hand, so the input's aria-activedescendant follows it from
  // the first one, and the live region gives the count. Nothing is spoken for the state an opening starts in.
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setQuery(next)
    setActive(0)
    setSpoken(countWords(resultsFor(groups, next, onAsk), next, Boolean(onAsk)))
  }

  // Keep the result in hand in view, with its group's label when it is the group's first.
  React.useEffect(() => {
    const option = document.getElementById(optionId(active))
    if (!option) return
    if (option.parentElement?.firstElementChild === option) option.parentElement.previousElementSibling?.scrollIntoView({ block: "nearest" })
    option.scrollIntoView({ block: "nearest" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, query])

  const run = (result: Result) => {
    result.onSelect?.()
    if (!result.ask) onSelect?.(result)
    onClose?.()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    const last = flat.length - 1
    const to = (i: number) => {
      event.preventDefault()
      if (flat.length) setActive(Math.max(0, Math.min(last, i)))
    }
    if (event.key === "ArrowDown") to(active + 1)
    else if (event.key === "ArrowUp") to(active - 1)
    else if (event.key === "Home") to(0)
    else if (event.key === "End") to(last)
    else if (event.key === "Enter") {
      event.preventDefault()
      if (flat[active]) run(flat[active])
    } else if (event.key === "Escape" && !modal && onClose) {
      event.preventDefault()
      onClose()
    }
  }

  let index = -1
  return (
    <div data-slot="command" className="flex min-h-0 flex-col">
      <div className="p-2">
        <div
          data-slot="command-input-wrapper"
          className="flex h-12 items-center gap-2.5 rounded-control border border-line-control bg-surface px-3 has-[input:focus-visible]:border-focus has-[input:focus-visible]:shadow-[0_0_0_1px_var(--focus)]"
        >
          <Icon name="Search" className="text-text-subtle" />
          <input
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={flat.length ? optionId(active) : undefined}
            aria-label={label}
            data-slot="command-input"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={placeholder}
            value={query}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="h-full min-w-0 flex-1 bg-transparent type-body-lg text-text-strong placeholder:text-text-subtle focus-visible:outline-hidden"
          />
          {closeButton ? (
            <ButtonBase variant="ghost" size="icon-sm" aria-label="Close" className="-mr-1.5 hidden text-text-muted pointer-coarse:inline-flex" onClick={onClose}>
              <Icon name="X" />
            </ButtonBase>
          ) : null}
        </div>
      </div>
      {/* Out of the Tab order: the input moves through the results, so focus never leaves it. */}
      <div id={`${id}-list`} role="listbox" tabIndex={-1} aria-label="Results" data-slot="command-list" className="max-h-[min(24rem,55vh)] overflow-y-auto overscroll-contain px-2 pb-2 empty:hidden">
        {sections.map((section, s) => (
          <div key={`${s}-${section.label}`} role="presentation" data-slot="command-group" className={s > 0 ? "mt-1" : undefined}>
            <div id={`${id}-group-${s}`} aria-hidden="true" data-slot="command-group-heading" className="px-2.5 pt-2 pb-1.5 type-eyebrow text-text-subtle">
              {section.label}
            </div>
            <div role="group" aria-labelledby={`${id}-group-${s}`} data-slot="command-group-items">
              {section.items.map((item, n) => {
                index += 1
                const i = index
                const inHand = i === active
                return (
                  <div
                    key={`${s}-${n}`}
                    id={optionId(i)}
                    role="option"
                    aria-selected={inHand}
                    data-slot="command-item"
                    data-selected={inHand}
                    className="flex min-h-9 items-center gap-3 rounded-control px-2.5 py-1.5 type-body text-text select-none data-[selected=true]:bg-hover data-[selected=true]:shadow-[inset_0_0_0_1px_var(--line-control)] pointer-coarse:min-h-11"
                    onPointerMove={() => (inHand ? undefined : setActive(i))}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => run(item)}
                  >
                    {item.icon ? <Icon name={item.icon} className={item.ask ? "text-ai" : "text-text-muted"} /> : null}
                    <span className="min-w-0 flex-1">
                      <span data-slot="command-item-label" className="text-text-strong">{item.label}</span>
                      {item.description ? <span data-slot="command-item-description" className="ml-2 type-meta text-text-muted">{item.description}</span> : null}
                    </span>
                    {item.meta ? <span data-slot="command-item-meta" className="shrink-0 type-meta text-text-muted">{item.meta}</span> : null}
                    {item.shortcut ? <Kbd>{item.shortcut}</Kbd> : null}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {flat.length === 0 && query.trim() ? (
        <p data-slot="command-empty" className="px-4 pt-6 pb-8 text-center type-body text-text-muted">
          {emptyText ?? `No matches for “${query.trim()}”`}
        </p>
      ) : null}
      <div aria-hidden="true" data-slot="command-hints" className="flex items-center gap-4 border-t border-line px-4 py-2.5 type-caption text-text-muted pointer-coarse:hidden">
        <span className="flex items-center gap-1.5">
          <Kbd>
            <Icon name="ArrowUp" size={12} />
          </Kbd>
          <Kbd>
            <Icon name="ArrowDown" size={12} />
          </Kbd>
          to move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Enter</Kbd>
          to run
        </span>
        {modal || onClose ? (
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            to close
          </span>
        ) : null}
      </div>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {spoken}
      </p>
    </div>
  )
}

/** The palette: jump to any record, run an action or ask the assistant, from anywhere, on Cmd or Ctrl K. */
export const CommandMenu = React.forwardRef<HTMLDivElement, CommandMenuProps>(function CommandMenu(
  { groups, placeholder, query = "", onSelect, onClose, emptyText, onAsk, modal = false, open = false, label = "Search", returnFocus, className },
  ref
) {
  const { restoreFocus, themeProps, contentRef } = useOverlayOpener(modal && open, returnFocus)
  const overlayRef = useMergedRef<HTMLElement>(ref as React.Ref<HTMLElement>, contentRef)
  const palette = (
    <Palette
      key={query}
      groups={groups}
      placeholder={placeholder ?? (onAsk ? "Search or ask" : "Search")}
      initialQuery={query}
      onSelect={onSelect}
      onClose={onClose}
      emptyText={emptyText}
      onAsk={onAsk}
      label={label}
      closeButton={modal || Boolean(onClose)}
      modal={modal}
    />
  )

  if (!modal) {
    return (
      <div ref={ref} data-slot="command-menu" className={cn("flex w-full max-w-[640px] flex-col overflow-hidden rounded-lg border border-line bg-surface-raised text-text shadow-xl", className)}>
        {palette}
      </div>
    )
  }

  // The palette mounts afresh on every opening, so every opening starts empty.
  return (
    <DialogRoot open={open} onOpenChange={(next) => (next ? undefined : onClose?.())}>
      <DialogContent
        ref={overlayRef}
        placement="top"
        showCloseButton={false}
        overlayProps={themeProps}
        onCloseAutoFocus={restoreFocus}
        className={cn("max-w-[640px] overflow-hidden border border-line p-0", className)}
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        {palette}
      </DialogContent>
    </DialogRoot>
  )
})
