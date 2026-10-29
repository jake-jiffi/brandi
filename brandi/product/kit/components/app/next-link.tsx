"use client"

import NextLink from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { LinkProvider, type LinkProps } from "@/lib/link"

import { holdLeaving, UnsavedChangesDialog } from "./unsaved-changes"

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, ...props }, ref) {
  const router = useRouter()
  // Next calls onNavigate only for a plain click that stays in the product: a new tab or window, a download
  // and a link out are left to the browser.
  return (
    <NextLink
      ref={ref}
      href={href}
      {...props}
      onNavigate={(event) => {
        if (holdLeaving(href, () => router.push(href))) event.preventDefault()
      }}
    />
  )
})

/**
 * Every system component renders its links through next/link in the product, and a link that would lose a
 * section's unsaved changes asks first (unsaved-changes.tsx).
 */
export function NextLinkProvider({ children }: { children: React.ReactNode }) {
  return (
    <LinkProvider component={Link}>
      {children}
      <React.Suspense fallback={null}>
        <UnsavedChangesDialog />
      </React.Suspense>
    </LinkProvider>
  )
}
