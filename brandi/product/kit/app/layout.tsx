import type { Metadata } from "next"

import { PRODUCT } from "@/lib/product"

import { fontVariables } from "./fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: { template: `%s · ${PRODUCT.name}`, default: PRODUCT.name },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={PRODUCT.lang} className={fontVariables || undefined} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
