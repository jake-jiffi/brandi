"use client"

import * as React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

// Whether a Root is already above: a nested Root flips its own region and leaves the page alone.
const InsideRoot = React.createContext(false)

/**
 * Wraps every board and preview. Sets the theme on the page as well as on itself, because anything
 * that opens in a portal (a menu, a dialog, a toast) renders outside this element and has to match
 * the board it opened from. Adds no padding and no box of its own. A Root inside another sets its
 * own region only: the outer one owns the page, which an inner one used to overwrite.
 */
export function Root({
  theme,
  background = "canvas",
  shortcuts = true,
  children,
}: {
  /** Light or dark for the whole board. Leave it out where the host page sets the theme (a Design System preview). */
  theme?: "light" | "dark"
  background?: "canvas" | "surface" | "none"
  shortcuts?: boolean
  children?: React.ReactNode
}) {
  const nested = React.useContext(InsideRoot)
  React.useLayoutEffect(() => {
    if (nested) return
    const el = document.documentElement
    el.dataset.shortcuts = shortcuts ? "on" : "off"
    if (theme) {
      el.dataset.theme = theme
      el.classList.toggle("dark", theme === "dark")
      el.style.colorScheme = theme
      document.body.style.background = background === "none" ? "transparent" : `var(--${background})`
    }
  }, [nested, theme, background, shortcuts])
  return (
    <InsideRoot.Provider value={true}>
      <TooltipProvider delayDuration={300}>
        <div data-slot="root" data-theme={theme} className={theme === "dark" ? "dark contents" : "contents"}>
          {children}
        </div>
      </TooltipProvider>
    </InsideRoot.Provider>
  )
}
