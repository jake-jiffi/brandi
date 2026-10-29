"use client"

import { useSearchParams } from "next/navigation"
import * as React from "react"

/**
 * State people would share, held here and kept in the address with the history API (07-starter.md, section 4):
 * changes show at once, never waiting on a round trip. A change replaces the entry, so typing never fills the
 * back button; a change set with `{ push: true }` (a new page of results) adds one, so Back returns to the page
 * before.
 *
 * The address can also change from outside: a link to the same page with another query, back and forward. Each
 * write this page makes is remembered until the address catches up with it, so an address it did not write
 * (and only that) starts the state again from the address. Typing faster than the router keeps up stays smooth.
 */
export function useAddressState<T>(initial: T, fromAddress: (params: URLSearchParams) => T, toAddress: (value: T) => string) {
  const address = useSearchParams().toString()
  // The server read the same address, so the two agree, except on a page Back brings back: Next draws it again
  // with the props it was first drawn with, under the address it was left at. The address wins, or the page would
  // write its first state over the one people came back for.
  const [value, setValue] = React.useState(() => (toAddress(initial) === address ? initial : fromAddress(new URLSearchParams(address))))
  const [pending, setPending] = React.useState<string[]>([])
  const [seen, setSeen] = React.useState(address)
  const push = React.useRef(false)
  // The page's own path, as it mounted. A page on its way out after Back or a link never writes to another's address.
  const home = React.useRef<string | null>(null)
  if (address !== seen) {
    setSeen(address)
    const at = pending.indexOf(address)
    if (at >= 0) setPending(pending.slice(at + 1))
    else {
      setValue(fromAddress(new URLSearchParams(address)))
      setPending([])
    }
  }

  // Back and forward are also heard directly: a push and the Back that undoes it can both land before the router
  // has drawn either, and then the address it reports never changes.
  React.useEffect(() => {
    home.current = window.location.pathname
    const onPop = () => {
      if (window.location.pathname !== home.current) return
      setValue(fromAddress(new URLSearchParams(window.location.search)))
      setPending([])
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [fromAddress])

  React.useEffect(() => {
    if (window.location.pathname !== home.current) return
    const search = toAddress(value)
    // An address that already says this state is left as typed: "?status=needs-you,overdue" and the written
    // "status=needs-you%2Coverdue" are one state, and rewriting it on every load of a filtered list churned the
    // history while the page drew.
    if (toAddress(fromAddress(new URLSearchParams(window.location.search))) === search) {
      push.current = false
      return
    }
    const next = `${window.location.pathname}${search ? `?${search}` : ""}`
    if (push.current) window.history.pushState(null, "", next)
    else window.history.replaceState(null, "", next)
    push.current = false
  }, [value, toAddress, fromAddress])

  const set = React.useCallback(
    (next: T, options?: { push?: boolean }) => {
      push.current = Boolean(options?.push)
      setValue(next)
      setPending((was) => [...was, toAddress(next)].slice(-20))
    },
    [toAddress]
  )
  return [value, set] as const
}
