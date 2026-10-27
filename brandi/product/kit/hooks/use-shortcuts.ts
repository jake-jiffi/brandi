"use client"

import * as React from "react"

const KEY = "shortcuts"
let memory: string | null = null
const listeners = new Set<() => void>()

function stored() {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return memory
  }
}

// html[data-shortcuts] is the setting the system's components read, as Root sets it on a board: SearchField and
// Menu ignore single keys while it is "off", and Kbd hides single-key hints.
function apply(value: "on" | "off") {
  document.documentElement.dataset.shortcuts = value
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const isOn = () => document.documentElement.dataset.shortcuts !== "off"

/**
 * Sets html[data-shortcuts] from storage before the first paint, so a hint never shows for a key that is
 * off. Runs inline in the head, beside the theme script.
 */
export const SHORTCUTS_FROM_STORAGE = `try{document.documentElement.dataset.shortcuts=localStorage.getItem("${KEY}")==="off"?"off":"on"}catch(e){}`

/**
 * Whether single-key shortcuts are on (WCAG 2.1.4). Settings turns them off; Cmd and Ctrl shortcuts
 * stay on. Kept in browser storage, with an in-memory fallback where storage is blocked. A product
 * with user settings keeps it there instead. Anything bound to a single key checks it first.
 */
export function useShortcuts(): [boolean, (on: boolean) => void] {
  // Storage decides once the page has loaded, for a page without the head script.
  React.useEffect(() => {
    const value = stored() === "off" ? "off" : "on"
    if (document.documentElement.dataset.shortcuts !== value) apply(value)
  }, [])
  const on = React.useSyncExternalStore(subscribe, isOn, () => true)
  const set = React.useCallback((value: boolean) => {
    const next = value ? "on" : "off"
    memory = next
    try {
      window.localStorage.setItem(KEY, next)
    } catch {
      // storage blocked: the in-memory value stands for this visit
    }
    apply(next)
  }, [])
  return [on, set]
}
