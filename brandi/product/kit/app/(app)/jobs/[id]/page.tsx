import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JobRecord } from "@/components/app/example-job"
import { jobTab } from "@/lib/jobs-query"
import { BROKEN_JOB_ID, findJob, JOBS } from "@/lib/sample"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const job = JOBS.find((j) => j.id === id)
  // The job whose source fails is still a job; any other unknown address has none to name.
  return { title: job ? `${job.id} ${job.service}` : id === BROKEN_JOB_ID ? id : "Job not found" }
}

/** One job. The open tab comes from the address; an unknown job gets the not-found page beside this one. */
export default async function JobPage({ params, searchParams }: Props) {
  const { id } = await params
  const job = findJob(id)
  if (!job) notFound()
  // Another job is another record: it starts afresh, with the tab its address names.
  return <JobRecord key={job.id} job={job} initialTab={jobTab((await searchParams).tab)} />
}
