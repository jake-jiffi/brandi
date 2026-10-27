"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

/**
 * After a client navigation, focus moves to the page's main region, so keyboard and screen-reader
 * users start at the top of the new page. Next.js does not move focus itself. Skips the first render.
 * Needs <main id="main" tabIndex={-1}> in the shell and every full-page state; render it inside Suspense.
 */
export function RouteFocus() {
  const pathname = usePathname()
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    document.getElementById("main")?.focus({ preventScroll: false })
  }, [pathname])
  return null
}
