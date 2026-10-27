import { PageSkeleton, StandalonePage } from "@/components/app/page-states"

/** The whole page is loading: a skeleton shaped like a page, said once as Loading. Nothing shows under a second. */
export default function Loading() {
  return (
    <StandalonePage>
      <div className="w-full max-w-content">
        <PageSkeleton />
      </div>
    </StandalonePage>
  )
}
