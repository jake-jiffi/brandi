"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import * as React from "react"

/**
 * Light by default. Dark is a whole theme people choose, never a per-screen decision, so the system
 * preference does not decide it. The class and data-theme both follow, as the tokens read either.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute={["class", "data-theme"]} defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}

/**
 * ?theme=dark or ?theme=light on any page sets the theme before the first paint, so the detector and
 * axe can scan a route in dark without a dark build. Runs inline in the head.
 */
export const THEME_FROM_URL = `try{var t=new URLSearchParams(location.search).get("theme");if(t==="dark"||t==="light"){localStorage.setItem("theme",t);var d=document.documentElement;d.classList.toggle("dark",t==="dark");d.dataset.theme=t;d.style.colorScheme=t}}catch(e){}`
