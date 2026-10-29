"use client"

import * as React from "react"

import { inputBox } from "@/components/ui/input"
import { Popover as PopoverRoot, PopoverAnchor } from "@/components/ui/popover"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { comboboxParts, fold, stepOption, type ComboboxOption } from "./combobox"
import { useFieldControl } from "./field"
import { Spinner } from "./spinner"
import { Tag, type TagColor } from "./tag"

const { OptionList, Panel, PanelPicture, Toggle, nothingFor, useSettledAnnouncement } = comboboxParts

export interface MultiSelectOption extends ComboboxOption {
  /** The token's colour dot: the category's chart series slot, 1 to 6. Grey by default. */
  color?: TagColor
}

const toOption = (o: string | MultiSelectOption): MultiSelectOption => (typeof o === "string" ? { value: o, label: o } : o)

// The box grows with its tokens: the input's edge and sizes as a minimum height, never a fixed one.
const growingBox =
  "h-auto min-h-9 py-1 pointer-coarse:h-auto pointer-coarse:min-h-11 data-[size=sm]:h-auto data-[size=sm]:min-h-8 data-[size=sm]:pointer-coarse:h-auto data-[size=sm]:pointer-coarse:min-h-10 data-[size=lg]:h-auto data-[size=lg]:min-h-11 data-[size=lg]:pointer-coarse:h-auto data-[size=lg]:pointer-coarse:min-h-12"

export interface MultiSelectProps {
  /** Strings, or { value, label, description, icon, color, disabled }. */
  options: ReadonlyArray<string | MultiSelectOption>
  value?: string[]
  defaultValue?: string[]
  /** Called with every chosen value, in the order they were chosen. */
  onChange?: (values: string[]) => void
  /** Called as the person types, to fetch options. Pair it with `filter={false}` when the options come back filtered. */
  onInputChange?: (text: string) => void
  /** Filters the options to what is typed. Off when the product filters them itself. */
  filter?: boolean
  /** Options are being fetched: the list says so. */
  loading?: boolean
  /** Says what to type ("Type a name"), never "Select...". Shown while nothing is chosen. */
  placeholder?: string
  /** What the list says when nothing matches. */
  emptyText?: string
  /** The text typed to start with. On a board, with `open`, it shows the list filtered to it. */
  query?: string
  /** Design mode: draws the list open in place, for a board. Never in a product. */
  open?: boolean
  /** 32, 36 or 44px at least; 40, 44 or 48px on a touch screen. It grows with its tokens. */
  size?: "sm" | "md" | "lg"
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  /** The form field's name: one hidden input per chosen value. */
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
 * Several options, shown as removable tokens. Typing filters, Up and Down move, Enter adds or takes away the
 * option in hand and keeps the list open, and Backspace in the empty input removes the last token. The ref is
 * the input.
 */
export const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(function MultiSelect(
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
  const items = React.useMemo(() => options.map(toOption), [options])
  const base = React.useId()
  const listId = `${base}-list`
  const chosenId = `${base}-chosen`
  const control = useFieldControl({ id, invalid, required, describedBy: chosenId })
  const label = ariaLabelProp ?? ariaLabel
  const labelledBy = ariaLabelledbyProp ?? ariaLabelledby
  const listLabelledBy = labelledBy ?? (label ? undefined : control.field?.labelId)
  // The toggle is named after its field, as NumberInput names its steppers: every list on a form read "Show options".
  const what = label ?? control.field?.labelText
  const index = React.useMemo(() => new Map(items.map((o, i) => [o.value, i])), [items])
  const optionId = React.useCallback((v: string) => `${base}-option-${index.get(v) ?? "x"}`, [base, index])

  const input = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, input)
  const anchor = React.useRef<HTMLDivElement | null>(null)
  const tokens = React.useRef<HTMLDivElement | null>(null)

  // A board can hand over anything; only a list counts as values.
  const [held, setHeld] = React.useState<string[]>(Array.isArray(defaultValue) ? defaultValue : [])
  const chosen = React.useMemo(() => (Array.isArray(value) ? value : held), [value, held])
  const [text, setText] = React.useState(query ?? "")
  const [filtering, setFiltering] = React.useState(Boolean(query))
  const [shown, setShown] = React.useState(false)
  const [active, setActive] = React.useState<string | null>(null)
  const [keyboard, setKeyboard] = React.useState(false)
  // What the live region says: an add or a removal at once, the count of matches once typing settles.
  const [said, setSaid] = React.useState("")
  // After a token's own remove button takes it away, focus moves to the next token's button, or the input.
  const [refocus, setRefocus] = React.useState<number | null>(null)

  // Every option seen, so a token keeps its name and colour after fetched options that held it have moved on.
  const seen = React.useRef(new Map<string, MultiSelectOption>())
  for (const o of items) seen.current.set(o.value, o)
  const optionOf = (v: string) => items.find((o) => o.value === v) ?? seen.current.get(v)
  const labelOf = (v: string) => optionOf(v)?.label ?? v
  const visibleFor = (typed: string, filtered: boolean) => (filter && filtered && fold(typed) ? items.filter((o) => fold(o.label).includes(fold(typed))) : items)
  const visible = visibleFor(text, filtering)
  const isOpen = design || shown

  const update = (next: string[], message: string) => {
    if (!Array.isArray(value)) setHeld(next)
    onChange?.(next)
    setSaid(`${message}. ${next.length} chosen.`)
  }
  const toggle = (v: string) => {
    const option = items.find((o) => o.value === v)
    if (!option || option.disabled) return
    if (chosen.includes(v)) update(chosen.filter((c) => c !== v), `Removed ${option.label}`)
    else update([...chosen, v], `Added ${option.label}`)
    // Ready for the next one: the typed text clears and the whole list shows again, with this option still in hand.
    setText("")
    setFiltering(false)
    setActive(v)
  }
  const remove = (v: string, from: "button" | "backspace") => {
    const at = chosen.indexOf(v)
    if (at < 0) return
    update(chosen.filter((c) => c !== v), `Removed ${labelOf(v)}`)
    if (from === "button") setRefocus(at)
  }

  React.useLayoutEffect(() => {
    if (refocus === null) return
    const buttons = Array.from(tokens.current?.querySelectorAll<HTMLButtonElement>('[data-slot="tag-remove"]') ?? [])
    ;(buttons[refocus] ?? input.current)?.focus()
    setRefocus(null)
  }, [refocus])

  const closeList = () => {
    setShown(false)
    setActive(null)
    setKeyboard(false)
  }
  const openList = (toward: string | null) => {
    if (disabled) return
    setShown(true)
    setActive(toward)
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
  const settledCount = useSettledAnnouncement(count, !design && shown && filtering)
  React.useEffect(() => {
    if (settledCount) setSaid(settledCount)
  }, [settledCount])

  const pictureActive = design ? (visible.find((o) => chosen.includes(o.value) && !o.disabled) ?? visible.find((o) => !o.disabled))?.value ?? null : null
  const inHand = design ? pictureActive : active

  const field = (
    <div
      ref={anchor}
      data-slot="multi-select"
      data-size={size}
      data-state={isOpen ? "open" : "closed"}
      // Disabled, the box says so, so the faded chosen values count as part of an inactive control.
      aria-disabled={disabled || undefined}
      className={cn(inputBox, growingBox, "gap-1 pr-1", chosen.length ? "pl-1" : "pl-3")}
      // A press on the box, away from a token's button, puts the caret in the field.
      onMouseDown={(event) => {
        const target = event.target as HTMLElement
        if (target !== input.current && !target.closest("button") && !disabled) {
          event.preventDefault()
          input.current?.focus()
        }
      }}
    >
      <div ref={tokens} data-slot="multi-select-tokens" className="flex min-w-0 flex-1 flex-wrap items-center gap-1 pointer-coarse:gap-2">
        {chosen.map((v) => {
          const option = optionOf(v)
          return (
            <Tag
              key={v}
              color={option?.color}
              // Drawn for a design, a token keeps its remove button, as it would look, and a press does nothing.
              onRemove={disabled ? undefined : design ? () => undefined : () => remove(v, "button")}
              // The dot is a category's colour. A token with none (a person, a team) draws no grey dot.
              dot={option?.color !== undefined}
              className="max-w-full pointer-coarse:h-10 pointer-coarse:pr-2.5"
            >
              {labelOf(v)}
            </Tag>
          )
        })}
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
          placeholder={chosen.length ? undefined : placeholder}
          disabled={disabled}
          data-slot="multi-select-input"
          className={cn(
            "h-6 flex-1 bg-transparent text-text placeholder:text-text-subtle focus-visible:outline-hidden disabled:cursor-not-allowed",
            // Room for the placeholder when empty; beside the last token, room for a few letters, so it rarely takes
            // a line of its own. A disabled field takes no typing, so it takes no room.
            !chosen.length ? "min-w-24" : disabled ? "w-0 min-w-0" : "min-w-12 pl-1.5"
          )}
          {...control.props}
          onChange={(event) => {
            if (design) return
            const next = event.target.value
            setText(next)
            setFiltering(true)
            onInputChange?.(next)
            setKeyboard(true)
            setShown(true)
            setActive(stepOption(visibleFor(next, true), null, 1))
          }}
          // A press opens the list; a press on the Field's label (which clicks the input) only focuses it.
          onMouseDown={() => {
            if (!design && !shown) openList(null)
          }}
          onBlur={() => {
            if (design) return
            closeList()
            // A name typed in full and left in the field is added; anything else typed stays as typed.
            const exact = items.find((o) => !o.disabled && fold(o.label) === fold(text))
            if (text.trim() && exact) {
              if (!chosen.includes(exact.value)) update([...chosen, exact.value], `Added ${exact.label}`)
              setText("")
              setFiltering(false)
            }
          }}
          onKeyDown={(event) => {
            if (design || disabled || event.defaultPrevented) return
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault()
              setKeyboard(true)
              const direction = event.key === "ArrowDown" ? 1 : -1
              if (!shown) {
                if (event.altKey && direction < 0) return
                openList(event.altKey ? null : stepOption(visibleFor(text, filtering), null, direction))
                return
              }
              if (event.altKey && direction < 0) {
                closeList()
                return
              }
              setActive(stepOption(visible, active, direction))
            } else if (event.key === "Enter" && shown) {
              event.preventDefault()
              if (active) toggle(active)
            } else if (event.key === "Backspace" && text === "" && chosen.length) {
              // An empty input: Backspace takes the last token away.
              event.preventDefault()
              remove(chosen[chosen.length - 1], "backspace")
            }
          }}
        />
      </div>
      <Toggle
        open={isOpen}
        controls={listId}
        label={`${shown ? "Hide" : "Show"} options${what ? ` for ${what}` : ""}`}
        disabled={disabled}
        // A square inside the growing box, not the segment at a field's end: it keeps clear of the edge, at 40px on touch.
        className="my-0 h-7 w-7 self-center rounded-control border-0 pointer-coarse:size-10"
        onToggle={() => {
          if (design) return
          if (shown) closeList()
          else {
            input.current?.focus()
            openList(null)
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
      isChosen={(v) => chosen.includes(v)}
      optionId={optionId}
      multiple
      keyboard={keyboard}
      label={label}
      labelledBy={listLabelledBy}
      onHover={(v) => {
        setKeyboard(false)
        setActive(v)
      }}
      onPick={toggle}
      highlight={filtering && filter ? text : undefined}
      status={status}
      still={still}
    />
  )

  return (
    <div data-slot="multi-select-field" className={cn("relative w-full min-w-0", className)} style={style}>
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
      {/* What is chosen, read with the input: the tokens themselves are only their remove buttons to a screen reader. */}
      <span id={chosenId} hidden>
        {chosen.length ? `${chosen.length} chosen: ${chosen.map(labelOf).join(", ")}.` : "None chosen."}
      </span>
      <span aria-live="polite" className="sr-only">
        {said}
      </span>
      {name ? chosen.map((v) => <input key={v} type="hidden" name={name} value={v} />) : null}
    </div>
  )
})

