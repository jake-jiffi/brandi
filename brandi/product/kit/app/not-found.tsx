import type { Metadata } from "next"

import { StandalonePage } from "@/components/app/page-states"
import { EmptyState } from "@/components/system"

export const metadata: Metadata = { title: "Page not found" }

/** No page at this address: one heading and a way home. */
export default function NotFound() {
  return (
    <StandalonePage>
      <EmptyState
        size="page"
        headingLevel={1}
        icon="Map"
        title="There is no page at this address."
        actions={[{ label: "Go to Home", icon: "House", variant: "primary", href: "/" }]}
        className="w-full max-w-measure"
      >
        The link may be mistyped, or the page may have moved.
      </EmptyState>
    </StandalonePage>
  )
}
