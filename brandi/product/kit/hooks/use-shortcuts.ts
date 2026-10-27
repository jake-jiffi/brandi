"use client"

import * as React from "react"

const KEY = "shortcuts"
let memory: string | null = null

function read() {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return memory
  }
}

/**
 * Whether single-key shortcuts are on (WCAG 2.1.4). Settings turns them off; Cmd and Ctrl shortcuts
 * stay on. Kept in browser storage, with an in-memory fallback where storage is blocked. A product
 * with user settings keeps it there instead.
 */
export function useShortcuts(): [boolean, (on: boolean) => void] {
  const [on, setOn] = React.useState(true)
  React.useEffect(() => {
    setOn(read() !== "off")
  }, [])
  const set = React.useCallback((value: boolean) => {
    memory = value ? "on" : "off"
    try {
      window.localStorage.setItem(KEY, memory)
    } catch {
      // storage blocked: the in-memory value stands for this visit
    }
    document.documentElement.dataset.shortcuts = memory
    setOn(value)
  }, [])
  return [on, set]
}
