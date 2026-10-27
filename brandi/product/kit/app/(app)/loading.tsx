import { PageSkeleton } from "@/components/app/page-states"

/** A page inside the shell is loading: the rail stays, and the page's shape waits in main. */
export default function Loading() {
  return <PageSkeleton />
}
