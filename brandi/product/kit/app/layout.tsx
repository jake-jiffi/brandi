import type { Metadata } from "next"

import { PRODUCT } from "@/lib/product"

import "./globals.css"

export const metadata: Metadata = {
  title: { template: `%s · ${PRODUCT.name}`, default: PRODUCT.name },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={PRODUCT.lang} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
