import type { Metadata } from "next"

import { JobsBoard } from "@/components/app/example-jobs"
import { parseJobsQuery } from "@/lib/jobs-query"

export const metadata: Metadata = { title: "Jobs" }

/** The index of jobs: search, filters, sort and page come from the address, so a view can be shared. */
export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <JobsBoard initial={parseJobsQuery(await searchParams)} />
}
