import type { Metadata } from "next"
import { Suspense } from "react"

import { NextLinkProvider } from "@/components/app/next-link"
import { RouteFocus } from "@/components/app/route-focus"
import { THEME_FROM_URL, ThemeProvider } from "@/components/app/theme-provider"
import { ToastRegion } from "@/components/system"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SHORTCUTS_FROM_STORAGE } from "@/hooks/use-shortcuts"
import { PRODUCT } from "@/lib/product"

import { fontVariables } from "./fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: { template: `%s · ${PRODUCT.name}`, default: PRODUCT.name },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={PRODUCT.lang} className={fontVariables || undefined} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_FROM_URL }} />
        <script dangerouslySetInnerHTML={{ __html: SHORTCUTS_FROM_STORAGE }} />
      </head>
      {/* Text wraps so a paragraph never ends on one stranded word. It inherits, so every line of copy gets it. */}
      <body className="text-pretty">
        <ThemeProvider>
          <NextLinkProvider>
            <TooltipProvider delayDuration={300}>
              {children}
              <ToastRegion />
            </TooltipProvider>
          </NextLinkProvider>
        </ThemeProvider>
        <Suspense fallback={null}>
          <RouteFocus />
        </Suspense>
      </body>
    </html>
  )
}
