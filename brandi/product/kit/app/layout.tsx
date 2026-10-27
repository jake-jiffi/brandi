import type { Metadata } from "next"
import { Suspense } from "react"

import { NextLinkProvider } from "@/components/app/next-link"
import { RouteFocus } from "@/components/app/route-focus"
import { THEME_FROM_URL, ThemeProvider } from "@/components/app/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
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
      </head>
      <body>
        <ThemeProvider>
          <NextLinkProvider>
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster />
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
