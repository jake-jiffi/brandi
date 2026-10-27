"use client"

import * as React from "react"

import { inputBare, inputBox } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { useFieldControl } from "./field"
import { Icon } from "./icon"

export interface SearchFieldProps extends Omit<React.ComponentPropsWithoutRef<"input">, "size" | "type" | "prefix"> {
  /** Says what is searched ("Search clients"). It is the accessible name unless aria-label is set. */
  placeholder: string
  /** A single key, such as "/", that focuses the field. Never while someone types elsewhere, or when Root turns shortcuts off. */
  shortcut?: string
  /** 32, 36 or 44px tall; 40, 44 or 48px on a touch screen. */
  size?: "sm" | "md" | "lg"
  /** aria-label as a canvas board writes it (attributes arrive in camelCase). */
  ariaLabel?: string
}

/** Whether single keys are on, as html[data-shortcuts] says, kept current as Root or Settings changes it. */
function watchShortcuts(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-shortcuts"] })
  return () => observer.disconnect()
}
const shortcutsOn = () => document.documentElement.dataset.shortcuts !== "off"

// Typing in any of these is typing, not a shortcut.
const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"], [role="searchbox"], [role="combobox"], [role="spinbutton"]'

/** Filters what is on screen as the person types. The ref is the input. */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { placeholder, shortcut, size = "md", ariaLabel, "aria-label": ariaLabelProp, disabled, id, className, style, ...rest },
  ref
) {
  const own = React.useRef<HTMLInputElement | null>(null)
  const merged = useMergedRef(ref, own)
  const control = useFieldControl({ id })

  React.useEffect(() => {
    if (!shortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== shortcut || event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return
      // Root's shortcuts setting: speech-input and switch users turn single keys off (WCAG 2.1.4).
      if (document.documentElement.dataset.shortcuts === "off") return
      const target = event.target as Element | null
      if (target?.closest?.(EDITABLE)) return
      const input = own.current
      if (!input || input.disabled || !input.isConnected) return
      // Behind an open modal the field is out of reach: leave the key to the dialog.
      const modal = document.querySelector('[aria-modal="true"]')
      if (modal && !modal.contains(input)) return
      event.preventDefault()
      input.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [shortcut])
  // With single keys off, the key is neither shown nor announced: it would advertise a key that does nothing.
  const on = React.useSyncExternalStore(watchShortcuts, shortcutsOn, () => true)
  const key = shortcut && on ? shortcut : undefined

  return (
    <div
      data-slot="search-field"
      data-size={size}
      className={cn(inputBox, "group/search", className)}
      style={style}
      onMouseDown={(event) => {
        if (event.target !== own.current && !disabled) {
          event.preventDefault()
          own.current?.focus()
        }
      }}
    >
      <Icon name="Search" className="text-text-muted" />
      <input
        ref={merged}
        type="search"
        placeholder={placeholder}
        // Inside a Field, the Field's label names it instead.
        aria-label={ariaLabelProp ?? ariaLabel ?? (control.field ? undefined : placeholder)}
        aria-keyshortcuts={key}
        autoComplete="off"
        disabled={disabled}
        className={cn(inputBare, "peer [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none")}
        {...rest}
        {...control.props}
      />
      {key ? (
        // The advertised key, hidden once the field has focus or a value, and on touch screens.
        <Kbd aria-hidden="true" className="pointer-coarse:hidden peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden">
          {shortcut}
        </Kbd>
      ) : null}
    </div>
  )
})
