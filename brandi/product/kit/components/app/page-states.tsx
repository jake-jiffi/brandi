"use client"

import * as React from "react"

import { Accordion, DescriptionList, EmptyState, ProductLockup, Skeleton } from "@/components/system"
import { formatDate } from "@/lib/dates"
import { formatTime } from "@/lib/format"
import { PRODUCT } from "@/lib/product"

/**
 * A page on its own, outside the shell: the lockup to say where people are, and main for the skip link and
 * route focus. The page-level states use it when the shell itself is not there.
 */
export function StandalonePage({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="@container flex min-h-dvh flex-col bg-canvas text-text focus-visible:outline-offset-[-2px]">
      {/* The shell's own insets: 16px on a phone, 32px from 640px. */}
      <div className="flex flex-1 flex-col px-4 py-6 @min-[640px]:px-8">
        <ProductLockup product={PRODUCT.name} href="/" height={20} />
        <div className="flex flex-1 items-center justify-center py-10">{children}</div>
      </div>
    </main>
  )
}

/**
 * While a page loads: said once as Loading, and drawn as the shape of a page (its header, a row of figures,
 * then the body), held back for the first second by the skeleton's own appear-late, so a fast page shows nothing.
 */
export function PageSkeleton() {
  return (
    <div className="@container flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton width="min(18rem, 60%)" height={28} label="Loading" />
        <Skeleton width="min(28rem, 85%)" height={14} />
      </div>
      <div className="grid gap-4 @min-[600px]:grid-cols-2 @min-[1120px]:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={132} />
        ))}
      </div>
      <Skeleton height={320} />
    </div>
  )
}

// A retry that fails again draws this page afresh, and the button that was pressed goes with the page it was on.
// So the press is noted here, outside the page, and the page that comes back says so. A minute is long enough for
// any retry to answer, and short enough that a later, separate failure on the same address starts plainly.
let retried: { path: string; at: number } | null = null

/** The line for a page drawn after a Try again on this address that failed, or nothing. */
function stillNotLoading() {
  if (typeof window === "undefined" || !retried || retried.path !== window.location.pathname || Date.now() - retried.at > 60000) return ""
  return `Still not loading. Tried again at ${formatTime(new Date())}.`
}

/**
 * The page failed. One heading, Try again, a way home, and a reference for support in a disclosure. Never a
 * cause or a promise nobody can know. When Try again fails too, focus goes to the heading, never the page body,
 * and one polite line says it was tried, so a retry that failed never sounds like one that did nothing.
 */
export function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  const root = React.useRef<HTMLDivElement | null>(null)
  const line = React.useRef<HTMLParagraphElement | null>(null)
  // A server error carries a digest that support can find in the logs; an error in the browser has none.
  const digest = typeof error === "object" && error !== null && "digest" in error ? String((error as { digest?: unknown }).digest ?? "") : ""
  // When it happened, read once, in the product's date and time styles. It shows only inside the closed
  // disclosure, which the server never draws.
  const [at] = React.useState(() => {
    const now = new Date()
    const day = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, "0")).join("-")
    return `${formatDate(day, "sentence")}, ${formatTime(now)}`
  })
  React.useEffect(() => {
    // Where a product reports errors. The example logs them.
    console.error(error)
    const words = stillNotLoading()
    if (!words) return
    retried = null
    // Written into the status after it is on the page, never drawn with it: a live region that arrives already
    // holding its words is not read out. It has no children of React's, so a later render leaves the words be.
    if (line.current) line.current.textContent = words
    const heading = root.current?.querySelector<HTMLElement>("h1")
    if (heading) {
      heading.tabIndex = -1
      heading.focus()
    }
  }, [error])
  const tryAgain = () => {
    retried = { path: window.location.pathname, at: Date.now() }
    retry()
  }
  const details = [
    { label: "Reference", value: digest, empty: "None: it happened in this browser" },
    { label: "When", value: at },
  ]
  return (
    <div ref={root} className="mx-auto flex w-full max-w-measure flex-col gap-4">
      <EmptyState
        size="page"
        headingLevel={1}
        icon="CloudOff"
        title="This page did not load."
        actions={[
          { label: "Try again", icon: "RotateCcw", variant: "primary", onClick: tryAgain },
          { label: "Go to Home", icon: "House", href: "/" },
        ]}
      >
        Try again, or go back to Home. If it keeps happening, send the details below to your support team.
      </EmptyState>
      {/* Here from the start and empty (out of sight, so it takes no room), so the line is read when a retry fails and never on load. */}
      <p ref={line} role="status" data-slot="page-error-retry" className="text-center type-meta text-text-muted empty:sr-only" />
      <Accordion items={[{ id: "support", title: "Details for support", content: <DescriptionList items={details} /> }]} headingLevel={2} />
    </div>
  )
}
