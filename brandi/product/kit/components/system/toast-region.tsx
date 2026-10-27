"use client"

import * as React from "react"

import type { IconName } from "@/lib/icons"
import { useMergedRef } from "@/lib/refs"
import { cn } from "@/lib/utils"

import { focusFirst } from "./alert"
import { Toast, toastDock, toastLift, type ToastTone } from "./toast"

export interface ToastItem {
  id: string
  /** One sentence, past tense, with a full stop: "[3] invoices sent." */
  message: React.ReactNode
  tone?: ToastTone
  icon?: IconName
  /** "Undo", when the action can be reversed. A toast with an action stays 8 seconds instead of 5. */
  action?: string
  onAction?: () => void
}

export type ToastOptions = Omit<ToastItem, "id" | "message"> & { id?: string }

// The queue every region without `items` shows. Module state, so code anywhere can add to it.
let queue: ToastItem[] = []
let made = 0
const listeners = new Set<() => void>()
const NONE: ToastItem[] = []
const read = () => queue
const readOnServer = () => NONE
function publish(next: ToastItem[]) {
  queue = next
  listeners.forEach((listener) => listener())
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Adds a toast to the queue and returns its id. A toast shown with an id already queued replaces it. */
function show(message: React.ReactNode, options: ToastOptions = {}) {
  const id = options.id ?? `toast-${++made}`
  publish([...queue.filter((t) => t.id !== id), { ...options, id, message }])
  return id
}

/** Removes one toast, or every toast when no id is given. */
function dismiss(id?: string) {
  publish(id === undefined ? [] : queue.filter((t) => t.id !== id))
}

/** Three at once at most; the rest wait their turn, oldest first. */
const SHOWN = 3
/** 5 seconds, or 8 with an action such as Undo. */
const lifetime = (t: ToastItem) => (t.action ? 8000 : 5000)

export interface ToastRegionProps extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> {
  /** The toasts as data, for a board or a product that keeps them in its own state. Without it the region shows the queue `ToastRegion.show()` fills. */
  items?: ToastItem[]
  /** Called with an item's id when its time is up, its action ran or Escape closed it. With `items`, remove it here. */
  onDismiss?: (id: string) => void
  /** Called with an item's id when its action is pressed, after the item's own onAction. */
  onAction?: (id: string) => void
  /** Renders in place instead of fixed to the window, for a board. */
  inline?: boolean
  /** The region's accessible name. */
  label?: string
}

/** The queue that shows, times and pauses toasts. */
const Region = React.forwardRef<HTMLElement, ToastRegionProps>(function ToastRegion(
  { items, onDismiss, onAction, inline = false, label = "Notifications", className, ...rest },
  ref
) {
  const queued = React.useSyncExternalStore(subscribe, read, readOnServer)
  const shown = (items ?? queued).slice(0, SHOWN)

  const own = React.useRef<HTMLElement | null>(null)
  const merged = useMergedRef(ref, own)
  const list = React.useRef<HTMLOListElement | null>(null)
  // Where focus came from, so it can go back there when the toast holding it goes.
  const returnTo = React.useRef<HTMLElement | null>(null)
  const clocks = React.useRef(new Map<string, { left: number; since: number }>())
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  // A toast is a time limit (WCAG 2.2.1), so nobody loses one while they are reading it, reaching for it, or away
  // in another tab.
  const paused = hovered || focused || hidden

  React.useEffect(() => {
    const update = () => setHidden(document.visibilityState === "hidden")
    update()
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])

  // Timers and the document's key listener outlive a render, so they read the latest committed props from here.
  const latest = React.useRef({ items, onDismiss, onAction })
  React.useLayoutEffect(() => {
    latest.current = { items, onDismiss, onAction }
  })

  // Focus goes back where it came from, then to the page title, main, or the region itself: never the page body.
  const focusBack = React.useCallback((back: HTMLElement | null) => {
    focusFirst([back, document.querySelector<HTMLElement>('[data-slot="page-title"]'), document.querySelector<HTMLElement>("main"), own.current], { preventScroll: true })
  }, [])

  const remove = React.useCallback((id: string) => {
    const item = list.current?.querySelector(`[data-toast-id="${CSS.escape(id)}"]`)
    if (item?.contains(document.activeElement)) {
      const back = returnTo.current
      returnTo.current = null
      focusBack(back)
    }
    clocks.current.delete(id)
    if (latest.current.items) latest.current.onDismiss?.(id)
    else dismiss(id)
  }, [focusBack])

  // Each shown toast keeps the time it has left. Hovering or focusing the region stops every clock, so
  // nothing moves under the pointer or vanishes while someone reaches for Undo; leaving starts them again.
  const shownKey = shown.map((t) => t.id).join("\n")
  React.useEffect(() => {
    // One Map for the region's life, mutated in place; the cleanup reads the same one.
    const all = clocks.current
    // Toasts dismissed from outside never pass through remove(), so their clocks are dropped here.
    for (const id of all.keys()) if (!shown.some((t) => t.id === id)) all.delete(id)
    if (paused) return
    const started = Date.now()
    const timers = shown.map((t) => {
      let clock = all.get(t.id)
      if (!clock) all.set(t.id, (clock = { left: lifetime(t), since: started }))
      clock.since = started
      return window.setTimeout(() => remove(t.id), clock.left)
    })
    return () => {
      const stopped = Date.now()
      timers.forEach((timer) => window.clearTimeout(timer))
      for (const t of shown) {
        const clock = all.get(t.id)
        if (clock) clock.left = Math.max(0, clock.left - (stopped - clock.since))
      }
    }
    // shownKey stands for the shown toasts; remove never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownKey, paused, remove])

  // A toast can go while it holds focus without passing through remove(): ToastRegion.dismiss(), or a parent
  // dropping it from items. React ignores the blur a removed element fires, so the region still thinks it has
  // focus while the browser has put it on the page body. After the commit, send it back and start the clocks.
  React.useLayoutEffect(() => {
    if (!focused) return
    const active = document.activeElement
    if (active && active !== document.body) return
    const back = returnTo.current
    returnTo.current = null
    setFocused(false)
    focusBack(back)
  }, [shownKey, focused, focusBack])

  // Alt T reaches the newest toast from anywhere: its action if it has one, otherwise the toast itself. The
  // shortcut belongs to the region fixed to the window; a board's inline regions leave it alone.
  React.useEffect(() => {
    if (inline) return
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.code !== "KeyT") return
      const toasts = list.current?.querySelectorAll<HTMLElement>("[data-toast-id]")
      const newest = toasts?.[toasts.length - 1]
      if (!newest) return
      event.preventDefault()
      const active = document.activeElement
      if (!list.current?.contains(active)) returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null
      ;(newest.querySelector<HTMLElement>("button, a[href]") ?? newest).focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [inline])

  const act = (t: ToastItem) => {
    t.onAction?.()
    latest.current.onAction?.(t.id)
    remove(t.id)
  }

  return (
    <section
      ref={merged}
      data-slot="toast-region"
      aria-label={label}
      aria-keyshortcuts={inline ? undefined : "Alt+T"}
      tabIndex={-1}
      className={cn(inline ? "relative flex w-full flex-col items-center" : toastDock, className)}
      {...rest}
    >
      <ol
        ref={list}
        data-slot="toast-list"
        aria-live="polite"
        className={cn("pointer-events-auto m-0 flex w-fit max-w-full list-none flex-col items-center gap-2 p-0", !inline && toastLift)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !returnTo.current) {
            returnTo.current = event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null
          }
          setFocused(true)
        }}
        onBlur={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
          returnTo.current = null
          setFocused(false)
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return
          const item = (event.target as HTMLElement).closest<HTMLElement>("[data-toast-id]")
          if (!item?.dataset.toastId) return
          event.stopPropagation()
          remove(item.dataset.toastId)
        }}
      >
        {shown.map((t) => (
          <li
            key={t.id}
            data-toast-id={t.id}
            tabIndex={-1}
            className="flex max-w-full justify-center rounded-md animate-in fade-in-0 duration-(--duration-base) motion-safe:slide-in-from-bottom-2"
          >
            <Toast tone={t.tone} icon={t.icon} action={t.action} onAction={() => act(t)}>
              {t.message}
            </Toast>
          </li>
        ))}
      </ol>
    </section>
  )
})

/** The queue that shows, times and pauses toasts. Mount one near the root; `ToastRegion.show()` adds to it from anywhere. */
export const ToastRegion = Object.assign(Region, { show, dismiss })
