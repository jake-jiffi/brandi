"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

import { Alert, Button, Dialog } from "@/components/system"
import { LOCALE } from "@/lib/format-locale"

// The words for leaving with unsaved changes, and for a draft that came back. The brand's written system has its
// own lines for these: put them here.
const COPY = {
  title: "Leave without saving?",
  body: (sections: string) => `Your changes to ${sections} will be lost.`,
  keep: "Keep editing",
  leave: "Leave",
  back: (section: string) => `Your unsaved changes to ${section} are back.`,
  discard: "Discard changes",
}

// The sections on the page with changes nobody has saved, and the navigation waiting on the person's answer.
// Held outside React, so a link or a command anywhere in the product can ask.
const unsaved = new Map<symbol, string>()
type Held = { go: () => void; sections: string[]; page: string }
let held: Held | null = null
// The page on screen, as Next names it, so a question knows which page it was asked on.
let page = ""
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function hold(next: Held | null) {
  held = next
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// What a section has typed and not saved, by page and section. Kept here and in sessionStorage, so Back or a
// reload brings it back. `origin` is the mount that typed it: none for a draft read back from storage.
type Draft = { values: Record<string, unknown>; origin?: symbol }
const drafts = new Map<string, Draft | null>()
const draftKey = (path: string, section: string) => `draft:${path}#${section}`

function readDraft(key: string) {
  if (!drafts.has(key)) {
    let found: Draft | null = null
    try {
      const values: unknown = JSON.parse(window.sessionStorage.getItem(key) ?? "null")
      if (values && typeof values === "object") found = { values: values as Record<string, unknown> }
    } catch {
      // storage blocked, or the draft unreadable: no draft
    }
    drafts.set(key, found)
  }
  return drafts.get(key) ?? null
}

function writeDraft(key: string, draft: Draft | null) {
  drafts.set(key, draft)
  try {
    if (draft) window.sessionStorage.setItem(key, JSON.stringify(draft.values))
    else window.sessionStorage.removeItem(key)
  } catch {
    // storage blocked: the draft lasts until the next reload
  }
  emit()
}

/**
 * Guards a section's unsaved changes while `changed` is set: a link or a command that leaves the page asks
 * first, and a reload or closing the tab gets the browser's own prompt. Saving or cancelling clears `changed`,
 * and the guard with it. Back and Forward are not held, because Next handles them after the address has
 * changed: a section that keeps a draft (useDraft) gets its changes back instead.
 */
export function useUnsavedChanges(changed: boolean, section: string) {
  React.useEffect(() => {
    if (!changed) return
    const key = Symbol(section)
    unsaved.set(key, section)
    const prompt = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Chrome before 119 asks only when this is set.
      event.returnValue = true
    }
    window.addEventListener("beforeunload", prompt)
    return () => {
      unsaved.delete(key)
      window.removeEventListener("beforeunload", prompt)
      // Nothing left to lose (a save landed, or Back left the page): a question still open has no answer to wait for.
      if (unsaved.size === 0 && held) hold(null)
    }
  }, [changed, section])
}

/**
 * A section's fields as typed, kept as a draft by page and section while they differ from `saved`, so Back,
 * Forward or a reload brings them back. It guards the page as useUnsavedChanges does. `back` says the draft
 * came back from an earlier visit: show DraftNotice. The draft clears on clear(), on typing back to the saved
 * values, once `saved` catches up with it (a save), and on Leave. Reads the path: inside Suspense on a
 * dynamic route.
 */
export function useDraft<K extends string>(section: string, saved: Record<K, string>) {
  const key = draftKey(usePathname(), section)
  // This mount, so a draft typed here is told from one an earlier visit left.
  const [self] = React.useState(() => Symbol(section))
  const draft = React.useSyncExternalStore(
    subscribe,
    () => readDraft(key),
    () => null
  )
  const fields = Object.keys(saved) as K[]
  const values = { ...saved }
  for (const field of fields) {
    const kept = draft?.values[field]
    if (typeof kept === "string") values[field] = kept
  }
  const differs = (next: Record<K, string>) => fields.some((field) => next[field] !== saved[field])
  const changed = differs(values)
  useUnsavedChanges(changed, section)
  React.useEffect(() => {
    if (draft && !changed) writeDraft(key, null)
  }, [draft, changed, key])
  return {
    values,
    changed,
    back: changed && draft !== null && draft.origin !== self,
    set: (field: K, value: string) => {
      const next = { ...values, [field]: value }
      writeDraft(key, differs(next) ? { values: next, origin: draft ? draft.origin : self } : null)
    },
    clear: () => writeDraft(key, null),
  }
}

/** Says a section's draft came back, with Discard changes to go back to what was saved. */
export function DraftNotice({ section, onDiscard }: { section: string; onDiscard: () => void }) {
  return <Alert tone="info" title={COPY.back(section)} actions={[{ label: COPY.discard, onClick: onDiscard }]} />
}

/**
 * Holds a navigation to `href` that would lose unsaved changes: the dialog asks, and `go` runs if the person
 * discards them. Returns false, holding nothing, when nothing is unsaved or `href` stays on this page.
 */
export function holdLeaving(href: string, go: () => void) {
  if (unsaved.size === 0 || new URL(href, window.location.href).pathname === window.location.pathname) return false
  hold({ go, sections: [...new Set(unsaved.values())], page })
  return true
}

/**
 * The question holdLeaving asks, in the system's words for leaving with unsaved changes. Rendered once, by
 * NextLinkProvider, inside Suspense because it reads the path.
 */
export function UnsavedChangesDialog() {
  const asking = React.useSyncExternalStore(
    subscribe,
    () => held,
    () => null
  )
  const pathname = usePathname()
  React.useEffect(() => {
    page = pathname
  }, [pathname])
  // Where focus goes on Keep editing when what asked has gone, such as the command menu or the drawer.
  const main = React.useRef<HTMLElement | null>(null)
  React.useEffect(() => {
    main.current = document.getElementById("main")
  }, [asking])
  // Back left the page while it asked: the question goes with the page, unmounted rather than closed, so it
  // hands no focus back and focus lands where every route change puts it (RouteFocus).
  if (asking && asking.page !== pathname) return null
  return (
    <Dialog
      open={asking !== null}
      onClose={() => hold(null)}
      width={400}
      returnFocus={main}
      title={COPY.title}
      description={asking ? COPY.body(new Intl.ListFormat(LOCALE).format(asking.sections)) : undefined}
      footer={
        <>
          <Button onClick={() => hold(null)}>{COPY.keep}</Button>
          <Button
            variant="danger-solid"
            onClick={() => {
              if (!asking) return
              hold(null)
              // Leave means losing the changes, so no draft comes back for them.
              for (const section of asking.sections) writeDraft(draftKey(asking.page, section), null)
              asking.go()
            }}
          >
            {COPY.leave}
          </Button>
        </>
      }
    />
  )
}
