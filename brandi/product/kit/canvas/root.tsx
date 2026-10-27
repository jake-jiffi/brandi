"use client"

import * as React from "react"

import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * Wraps every board and preview. Sets the theme on the page as well as on itself, because anything
 * that opens in a portal (a menu, a dialog, a toast) renders outside this element and has to match
 * the board it opened from. Adds no padding and no box of its own.
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
  React.useLayoutEffect(() => {
    const el = document.documentElement
    el.dataset.shortcuts = shortcuts ? "on" : "off"
    if (theme) {
      el.dataset.theme = theme
      el.classList.toggle("dark", theme === "dark")
      el.style.colorScheme = theme
      document.body.style.background = background === "none" ? "transparent" : `var(--${background})`
    }
  }, [theme, background, shortcuts])
  return (
    <TooltipProvider delayDuration={300}>
      <div data-slot="root" data-theme={theme} className={theme === "dark" ? "dark contents" : "contents"}>
        {children}
      </div>
    </TooltipProvider>
  )
}
