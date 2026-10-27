"use client"

import * as React from "react"

import { inputBare, inputBox } from "@/components/ui/input"
import { Popover as PopoverRoot, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { selectItemClassName } from "@/components/ui/select"
import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { useFieldControl } from "./field"
import { Icon } from "./icon"
import { Spinner } from "./spinner"

export interface ComboboxOption {
  value: string
  label: string
  /** A line under the label, in the list only. */
  description?: string
  icon?: IconName
  disabled?: boolean
}

export const toComboboxOption = (o: string | ComboboxOption): ComboboxOption => (typeof o === "string" ? { value: o, label: o } : o)

/** Case and accents aside, so "cafe" finds "Café". */
export const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim()

const foldChar = (c: string) => c.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()

/** The label with the typed part marked, so people see why each option matched. */
function withMatch(label: string, typed?: string): React.ReactNode {
  const q = typed ? fold(typed) : ""
  if (!q) return label
  // Fold one character at a time, so a match found in the folded text maps back onto the label's own characters.
  const chars = Array.from(label)
  const at: number[] = []
  let folded = ""
  for (const c of chars) {
    at.push(folded.length)
    folded += foldChar(c)
  }
  const hit = folded.indexOf(q)
  if (hit < 0) return label
  let start = 0
  while (start + 1 < chars.length && at[start + 1] <= hit) start++
  let end = start
  while (end < chars.length && at[end] < hit + q.length) end++
  return (
    <>
      {chars.slice(0, start).join("")}
      <span data-slot="combobox-match" className="type-heading-sm text-text-strong">
        {chars.slice(start, end).join("")}
      </span>
      {chars.slice(end).join("")}
    </>
  )
}

/** The next option that can be chosen, from `from`, stopping at either end of the list. */
export function stepOption(options: ComboboxOption[], from: string | null, direction: 1 | -1): string | null {
  const open = options.filter((o) => !o.disabled)
  if (!open.length) return null
  const at = from === null ? -1 : open.findIndex((o) => o.value === from)
  if (at < 0) return (direction > 0 ? open[0] : open[open.length - 1]).value
  return open[Math.min(open.length - 1, Math.max(0, at + direction))].value
}

// The list's panel: the Select's raised surface, hairline and shadow, as wide as its field, flipping up when
// there is no room below. It fades in and goes at once (the popover primitive has no exit animation).
const panelClassName =
  "w-(--radix-popover-trigger-width) min-w-48 max-h-[min(20rem,var(--radix-popover-content-available-height,20rem))] gap-0 overflow-y-auto overscroll-contain p-1 shadow-md"

// The Select's option: 36px rows (44 on touch), the hover tint and a 1px line-control edge on the option in hand,
// and a 2px focus ring once keys are driving. Forced colours outline the option in hand in Highlight, because
// these options are never focused: the input keeps focus and points at them.
const optionClassName = cn(
  selectItemClassName,
  "forced-colors:data-highlighted:outline-2 forced-colors:data-highlighted:outline-solid forced-colors:data-highlighted:outline-[Highlight] forced-colors:data-highlighted:-outline-offset-2"
)

const statusClassName = "flex items-center gap-2 px-2.5 py-2 type-meta text-text-muted"

interface OptionListProps {
  id: string
  options: ComboboxOption[]
  active: string | null
  isChosen: (value: string) => boolean
  optionId: (value: string) => string
  multiple?: boolean
  /** Keys are driving: the option in hand shows the 2px ring. */
  keyboard?: boolean
  label?: string
  labelledBy?: string
  onHover?: (value: string) => void
  onPick?: (value: string) => void
  /** Text at the end of an option's row, such as a duration. */
  meta?: (option: ComboboxOption) => React.ReactNode
  /** What was typed, marked in each label. */
  highlight?: string
  /** A line under the options: nothing matches, or still searching. */
  status?: React.ReactNode
  /** Drawn for a design: nothing listens. */
  still?: boolean
}

/** The options of a combobox: a listbox the input points into, never focused itself. */
function OptionList({ id, options, active, isChosen, optionId, multiple, keyboard, label, labelledBy, onHover, onPick, meta, highlight, status, still }: OptionListProps) {
  const list = React.useRef<HTMLDivElement>(null)
  const placed = React.useRef(false)

  // The option in hand stays in view inside the scrolling panel, without moving the page: centred when the list
  // opens, so what comes either side of it shows, then only as far as it takes as keys move it.
  React.useLayoutEffect(() => {
    if (!active || !list.current) return
    const option = document.getElementById(optionId(active))
    const box = list.current.closest<HTMLElement>('[data-slot="combobox-panel"]')
    if (!option || !box || box.scrollHeight <= box.clientHeight) return
    const o = option.getBoundingClientRect()
    const b = box.getBoundingClientRect()
    if (!placed.current) {
      placed.current = true
      box.scrollTop += o.top + o.height / 2 - (b.top + b.height / 2)
      return
    }
    if (o.top < b.top + 4) box.scrollTop -= b.top + 4 - o.top
    else if (o.bottom > b.bottom - 4) box.scrollTop += o.bottom - (b.bottom - 4)
  }, [active, optionId, options.length])

  return (
    <>
      <div
        ref={list}
        id={id}
        role="listbox"
        aria-label={label}
        aria-labelledby={label ? undefined : labelledBy}
        aria-multiselectable={multiple || undefined}
        data-slot="combobox-list"
        data-keyboard={keyboard || undefined}
        className="group/select-list flex flex-col"
      >
        {options.map((o) => {
          const chosen = isChosen(o.value)
          return (
            <div
              key={o.value}
              id={optionId(o.value)}
              role="option"
              aria-selected={multiple ? chosen : chosen || undefined}
              aria-disabled={o.disabled || undefined}
              data-slot="combobox-option"
              data-state={chosen ? "checked" : "unchecked"}
              data-highlighted={o.value === active ? "" : undefined}
              data-disabled={o.disabled ? "" : undefined}
              className={cn(optionClassName, multiple && "pl-9")}
              onPointerMove={still || o.disabled ? undefined : (event) => event.pointerType === "mouse" && o.value !== active && onHover?.(o.value)}
              onClick={still || o.disabled ? undefined : () => onPick?.(o.value)}
            >
              {multiple ? (
                // Several can be chosen: a box at the start, ticked when chosen. aria-selected carries the state.
                <span
                  aria-hidden="true"
                  data-slot="combobox-option-box"
                  className={cn(
                    "pointer-events-none absolute top-2.5 left-2.5 flex size-4 items-center justify-center rounded-xs border pointer-coarse:top-3.5",
                    chosen ? "border-primary bg-primary text-on-primary" : "border-line-control bg-surface"
                  )}
                >
                  {chosen ? <Icon name="Check" size={12} strokeWidth={3} /> : null}
                </span>
              ) : chosen ? (
                <span className="pointer-events-none absolute top-2.5 right-2.5 flex size-4 items-center justify-center text-primary pointer-coarse:top-3.5">
                  <Icon name="Check" />
                </span>
              ) : null}
              <span className="flex min-w-0 items-center gap-2">
                {o.icon ? <Icon name={o.icon} className="text-text-muted" /> : null}
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{withMatch(o.label, highlight)}</span>
                {meta ? meta(o) : null}
              </span>
              {o.description ? <span className={cn("type-meta text-text-muted", o.icon && "pl-6")}>{o.description}</span> : null}
            </div>
          )
        })}
      </div>
      {status ? (
        <div data-slot="combobox-status" className={statusClassName}>
          {status}
        </div>
      ) : null}
    </>
  )
}

interface PanelProps {
  /** The field the panel hangs from: a press there is not a press outside. */
  anchor: React.RefObject<HTMLElement | null>
  className?: string
  children?: React.ReactNode
}

/**
 * The live panel, in a portal so no card clips it. Focus stays in the field: the panel never takes it, never
 * hands it back, and a press inside it keeps it where it is.
 */
function Panel({ anchor, className, children }: PanelProps) {
  return (
    <PopoverContent
      // A wrapper for the listbox and its status line, not a dialog.
      role={undefined}
      data-slot="combobox-panel"
      align="start"
      sideOffset={4}
      onOpenAutoFocus={(event) => event.preventDefault()}
      onCloseAutoFocus={(event) => event.preventDefault()}
      onInteractOutside={(event) => {
        const target = event.target as Node | null
        if (target && anchor.current?.contains(target)) event.preventDefault()
      }}
      onMouseDown={(event) => event.preventDefault()}
      className={cn(panelClassName, className)}
    >
      {children}
    </PopoverContent>
  )
}

/** The panel drawn open in place for a design: the same look, under the field, with no layer of its own. */
function PanelPicture({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      data-slot="combobox-panel"
      data-state="open"
      className={cn("absolute top-full left-0 z-(--z-popover) mt-1 flex max-h-80 w-full min-w-48 flex-col overflow-hidden rounded-md border border-line bg-surface-raised p-1 type-body text-text shadow-md", className)}
    >
      {children}
    </div>
  )
}

/** The chevron that opens and closes the list. Out of the tab order: the input is the control. */
const Toggle = React.forwardRef<
  HTMLButtonElement,
  { open: boolean; controls: string; label: string; disabled?: boolean; onToggle?: () => void; className?: string; icon?: IconName }
>(function Toggle({ open, controls, label, disabled, onToggle, className, icon = "ChevronDown" }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      aria-label={label}
      aria-expanded={open}
      aria-controls={controls}
      disabled={disabled}
      data-slot="combobox-toggle"
      // Keeps the caret in the field.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
      className={cn(
        "grid h-full w-9 shrink-0 place-items-center rounded-r-[calc(var(--radius-control)-1px)] text-text-muted transition-colors hover:bg-hover hover:text-text-strong disabled:pointer-events-none pointer-coarse:w-11",
        className
      )}
    >
      <Icon name={icon} className={cn(icon === "ChevronDown" && "motion-safe:transition-transform", icon === "ChevronDown" && open && "rotate-180")} />
    </button>
  )
})

/** The words for an empty list: what was typed, kept, and the next step. */
const nothingFor = (text: string) => `No matches for ‘${text.trim()}’. Try fewer letters.`

/** A screen reader hears the count once typing settles, never on every key. */
function useSettledAnnouncement(message: string, enabled: boolean) {
  const [said, setSaid] = React.useState("")
  React.useEffect(() => {
    if (!enabled) {
      setSaid("")
      return
    }
    const timer = window.setTimeout(() => setSaid(message), 450)
    return () => window.clearTimeout(timer)
  }, [message, enabled])
  return said
}

export const comboboxParts = { OptionList, Panel, PanelPicture, Toggle, nothingFor, statusClassName, useSettledAnnouncement }

export interface ComboboxProps {
  /** Strings, or { value, label, description, icon, disabled }. Past about 15 options, a Combobox replaces a Select. */
  options: ReadonlyArray<string | ComboboxOption>
  value?: string
  defaultValue?: string
  /** Called with the chosen option's value, or "" when the field is cleared. */
  onChange?: (value: string) => void
  /** Called as the person types, to fetch options. Pair it with `filter={false}` when the options come back filtered. */
  onInputChange?: (text: string) => void
  /** Filters the options to what is typed. Off when the product filters them itself. */
  filter?: boolean
  /** Options are being fetched: the list says so. */
  loading?: boolean
  /** Says what to type ("Type a [supplier] name"), never "Select...". */
  placeholder?: string
  /** What the list says when nothing matches. It says what was typed and to try fewer letters by default. */
  emptyText?: string
  /** The text typed to start with. On a board, with `open`, it shows the list filtered to it. */
  query?: string
  /** Design mode: draws the list open in place, for a board. Never in a product. */
  open?: boolean
  /** An icon at the start of the field, such as Search or User. */
  icon?: IconName
  /** 32, 36 or 44px tall; 40, 44 or 48px on a touch screen. */
  size?: "sm" | "md" | "lg"
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  /** The form field's name: a hidden input carries the chosen value. */
  name?: string
  id?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  /** aria-label as a canvas board writes it (attributes arrive in camelCase). */
  ariaLabel?: string
  /** aria-labelledby as a canvas board writes it. */
  ariaLabelledby?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * One option from a long or searchable list. Typing filters, Up and Down move, Enter chooses, and Escape closes,
 * with focus on the input throughout. The ref is the input.
 */
export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    options,
    value,
    defaultValue,
    onChange,
    onInputChange,
    filter = true,
    loading = false,
    placeholder,
    emptyText,
    query,
    open: design = false,
    icon,
    size = "md",
    invalid,
    disabled,
    required,
    name,
    id,
    "aria-label": ariaLabelProp,
    "aria-labelledby": ariaLabelledbyProp,
    ariaLabel,
    ariaLabelledby,
    className,
    style,
  },
  ref
) {
  const items = React.useMemo(() => options.map(toComboboxOption), [options])
  const control = useFieldControl({ id, invalid, required })
  const label = ariaLabelProp ?? ariaLabel
  const labelledBy = ariaLabelledbyProp ?? ariaLabelledby
  const listLabelledBy = labelledBy ?? (label ? undefined : control.field?.labelId)
  const base = React.useId()
  const listId = `${base}-list`
  const index = React.useMemo(() => new Map(items.map((o, i) => [o.value, i])), [items])
  const optionId = React.useCallback((v: string) => `${base}-option-${index.get(v) ?? "x"}`, [base, index])

  const input = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, input)
  const anchor = React.useRef<HTMLDivElement | null>(null)

  const [chosen, setChosen] = React.useState(defaultValue ?? "")
  const current = value ?? chosen
  // Every label seen, so a choice keeps its name after fetched options that held it have moved on.
  const seen = React.useRef(new Map<string, string>())
  for (const o of items) seen.current.set(o.value, o.label)
  const labelOf = React.useCallback((v: string) => items.find((o) => o.value === v)?.label ?? seen.current.get(v) ?? "", [items])
  const [text, setText] = React.useState(() => query ?? labelOf(current))
  const [filtering, setFiltering] = React.useState(Boolean(query))
  const [shown, setShown] = React.useState(false)
  const [active, setActive] = React.useState<string | null>(null)
  const [keyboard, setKeyboard] = React.useState(false)

  // A value set from outside shows at once, unless the person is typing in the field.
  const shownValue = React.useRef(current)
  const typing = React.useRef(filtering)
  typing.current = filtering
  React.useEffect(() => {
    if (shownValue.current === current) return
    shownValue.current = current
    // Focused but not typed in, the field takes the new value too, so leaving it never puts the old one back.
    if (input.current !== document.activeElement || !typing.current) setText(labelOf(current))
  }, [current, labelOf])

  const visibleFor = React.useCallback(
    (typed: string, filtered: boolean) => (filter && filtered && fold(typed) ? items.filter((o) => fold(o.label).includes(fold(typed))) : items),
    [filter, items]
  )
  const visible = visibleFor(text, filtering)
  const isOpen = design || shown

  // Options that arrive after the keys that asked for them (fetched as the person types) put the first one in hand,
  // as typing does, and never leave the input pointing at an option that has gone.
  React.useEffect(() => {
    if (!shown) return
    const there = active !== null && visible.some((o) => o.value === active)
    if (!there && (active !== null || (filtering && visible.length))) setActive(stepOption(visible, null, 1))
  }, [shown, active, visible, filtering])

  const commit = (next: string) => {
    // The field already shows what it chose, so the sync above leaves it alone.
    shownValue.current = next
    if (value === undefined) setChosen(next)
    if (next !== current) onChange?.(next)
  }

  const openList = (toward: string | null) => {
    if (disabled) return
    setShown(true)
    setActive(toward)
  }
  const closeList = () => {
    setShown(false)
    setActive(null)
    setKeyboard(false)
  }

  const pick = (v: string) => {
    const option = items.find((o) => o.value === v)
    if (!option || option.disabled) return
    commit(v)
    setText(option.label)
    setFiltering(false)
    closeList()
  }

  // Leaving the field: an exact match is chosen; anything else typed is kept, and the field stops claiming a choice
  // its text no longer shows. An empty field is cleared.
  const reconcile = () => {
    closeList()
    const typed = text.trim()
    if (!typed) {
      if (current) commit("")
      setText("")
      setFiltering(false)
      return
    }
    // The choice's own name, untouched, stands, whether or not the options still hold it.
    if (current && typed === labelOf(current)) {
      setFiltering(false)
      return
    }
    const exact = items.find((o) => !o.disabled && fold(o.label) === fold(typed))
    if (exact) {
      commit(exact.value)
      setText(exact.label)
      setFiltering(false)
      return
    }
    if (current && typed !== labelOf(current)) commit("")
  }

  const status = loading ? (
    <>
      <Spinner size={14} label={null} />
      Searching…
    </>
  ) : visible.length === 0 ? (
    (emptyText ?? (filtering && text.trim() ? nothingFor(text) : onInputChange ? "Type to search." : "Nothing to choose from yet."))
  ) : null
  const count = loading ? "Searching" : visible.length === 0 ? "No matches" : `${visible.length} ${visible.length === 1 ? "match" : "matches"}`
  const said = useSettledAnnouncement(count, !design && shown && filtering)

  // Design mode: the option in hand is the first match, or the chosen one.
  const pictureActive = design ? (visible.find((o) => o.value === current && !o.disabled) ?? visible.find((o) => !o.disabled))?.value ?? null : null
  const inHand = design ? pictureActive : active

  const field = (
    <div
      ref={anchor}
      data-slot="combobox"
      data-size={size}
      data-state={isOpen ? "open" : "closed"}
      className={cn(inputBox, "pr-0")}
      // A press on the icon or the edge puts the caret in the field.
      onMouseDown={(event) => {
        if (event.target !== input.current && !disabled) {
          event.preventDefault()
          input.current?.focus()
        }
      }}
    >
      {icon ? <Icon name={icon} className="text-text-muted" /> : null}
      <input
        ref={merged}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && inHand ? optionId(inHand) : undefined}
        aria-label={label}
        aria-labelledby={labelledBy}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        className={inputBare}
        {...control.props}
        required={control.required || undefined}
        onChange={(event) => {
          if (design) return
          const next = event.target.value
          setText(next)
          setFiltering(true)
          onInputChange?.(next)
          setKeyboard(true)
          setShown(true)
          // The first match is in hand from the first key, so Enter takes it.
          setActive(stepOption(visibleFor(next, true), null, 1))
        }}
        // A press on the field opens the list. Not a click: a press on the Field's label sends the input a click too,
        // and the label only focuses, as it does a Select.
        onMouseDown={() => {
          if (!design && !shown) openList(current || null)
        }}
        onBlur={() => {
          if (!design) reconcile()
        }}
        onKeyDown={(event) => {
          if (design || disabled || event.defaultPrevented) return
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            setKeyboard(true)
            const direction = event.key === "ArrowDown" ? 1 : -1
            if (!shown) {
              if (event.altKey && direction < 0) return
              const list = visibleFor(text, filtering)
              const start = list.some((o) => o.value === current && !o.disabled) ? current : null
              openList(event.altKey ? start : (start ?? stepOption(list, null, direction)))
              return
            }
            if (event.altKey && direction < 0) {
              closeList()
              return
            }
            setActive(stepOption(visible, active, direction))
          } else if (event.key === "Enter" && shown) {
            event.preventDefault()
            if (active) pick(active)
          } else if (event.key === "Enter") {
            // A closed list lets Enter send the form; the field settles first, so the form never sends a choice the
            // field no longer shows.
            reconcile()
          }
        }}
      />
      <Toggle
        open={isOpen}
        controls={listId}
        label={shown ? "Hide options" : "Show options"}
        disabled={disabled}
        onToggle={() => {
          if (design) return
          if (shown) closeList()
          else {
            input.current?.focus()
            openList(current || null)
          }
        }}
      />
    </div>
  )

  const list = (still: boolean) => (
    <OptionList
      id={listId}
      options={visible}
      active={inHand}
      isChosen={(v) => v === current}
      optionId={optionId}
      keyboard={keyboard}
      label={label}
      labelledBy={listLabelledBy}
      onHover={(v) => {
        setKeyboard(false)
        setActive(v)
      }}
      onPick={pick}
      highlight={filtering && filter ? text : undefined}
      status={status}
      still={still}
    />
  )

  return (
    <div data-slot="combobox-field" className={cn("relative w-full min-w-0", className)} style={style}>
      {design ? (
        <>
          {field}
          <PanelPicture>{list(true)}</PanelPicture>
        </>
      ) : (
        <PopoverRoot open={shown} onOpenChange={(next) => (next ? setShown(true) : closeList())}>
          <PopoverAnchor asChild>{field}</PopoverAnchor>
          <Panel anchor={anchor}>{list(false)}</Panel>
        </PopoverRoot>
      )}
      <span aria-live="polite" className="sr-only">
        {said}
      </span>
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </div>
  )
})
