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
  touch = false,
  reading = false,
  children,
}: {
  /** Light or dark for the whole board. Leave it out where the host page sets the theme (a Design System preview). */
  theme?: "light" | "dark"
  background?: "canvas" | "surface" | "none"
  shortcuts?: boolean
  /** Draws everything inside at touch sizes, overlays included: a phone board, viewed with a mouse. */
  touch?: boolean
  /** A surface people read rather than work in (a participant portal, an email): no text under 16/24, components included. */
  reading?: boolean
  children?: React.ReactNode
}) {
  const nested = React.useContext(InsideRoot)
  React.useLayoutEffect(() => {
    if (nested) return
    const el = document.documentElement
    el.dataset.shortcuts = shortcuts ? "on" : "off"
    // On the page as well, because a dialog, sheet or menu opens in a portal outside the board.
    el.toggleAttribute("data-touch", touch)
    el.toggleAttribute("data-reading", reading)
    if (theme) {
      el.dataset.theme = theme
      el.classList.toggle("dark", theme === "dark")
      el.style.colorScheme = theme
      document.body.style.background = background === "none" ? "transparent" : `var(--${background})`
    }
  }, [nested, theme, background, shortcuts, touch, reading])
  return (
    <InsideRoot.Provider value={true}>
      <TooltipProvider delayDuration={300}>
        <div data-slot="root" data-theme={theme} data-touch={touch ? "" : undefined} data-reading={reading ? "" : undefined} className={theme === "dark" ? "dark contents" : "contents"}>
          {children}
        </div>
      </TooltipProvider>
    </InsideRoot.Provider>
  )
}
