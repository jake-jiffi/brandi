"use client"

import * as React from "react"

/**
 * Under the system's tablet breakpoint (1024px), from a media query, and false on the server. The
 * shell itself measures its container; this is for the few things that only the window can decide.
 */
export function useIsMobile(breakpoint = 1024) {
  const [mobile, setMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [breakpoint])
  return mobile
}
