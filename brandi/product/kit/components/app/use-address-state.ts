"use client"

import { useSearchParams } from "next/navigation"
import * as React from "react"

/**
 * State people would share, held here and kept in the address with history.replaceState (07-starter.md,
 * section 4): changes show at once, never waiting on a round trip, and never fill the back button.
 *
 * The address can also change from outside: a link to the same page with another query, back and forward. Each
 * write this page makes is remembered until the address catches up with it, so an address it did not write
 * (and only that) starts the state again from the address. Typing faster than the router keeps up stays smooth.
 */
export function useAddressState<T>(initial: T, fromAddress: (params: URLSearchParams) => T, toAddress: (value: T) => string) {
  const address = useSearchParams().toString()
  const [value, setValue] = React.useState(initial)
  const [pending, setPending] = React.useState<string[]>([])
  const [seen, setSeen] = React.useState(address)
  if (address !== seen) {
    setSeen(address)
    const at = pending.indexOf(address)
    if (at >= 0) setPending(pending.slice(at + 1))
    else {
      setValue(fromAddress(new URLSearchParams(address)))
      setPending([])
    }
  }

  React.useEffect(() => {
    const search = toAddress(value)
    const next = `${window.location.pathname}${search ? `?${search}` : ""}`
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", next)
  }, [value, toAddress])

  const set = React.useCallback(
    (next: T) => {
      setValue(next)
      setPending((was) => [...was, toAddress(next)].slice(-20))
    },
    [toAddress]
  )
  return [value, set] as const
}
