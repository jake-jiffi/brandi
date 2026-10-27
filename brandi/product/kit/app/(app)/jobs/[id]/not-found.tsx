import { EmptyState } from "@/components/system"

/** A job that no longer exists: say so, and lead back to the list it came from. */
export default function JobNotFound() {
  return (
    <EmptyState
      size="page"
      headingLevel={1}
      icon="ClipboardList"
      title="This job no longer exists."
      actions={[{ label: "Back to jobs", icon: "ArrowLeft", variant: "primary", href: "/jobs" }]}
    >
      It may have been merged into another job, or its link may be mistyped. Jobs lists every job still on the books.
    </EmptyState>
  )
}
