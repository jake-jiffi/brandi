// The jobs pages' state as people share it, in the URL: the list's search, filters, sort and page, and a job's
// open tab. The server pages read it; the client keeps the address in step through useAddressState.

import { JOB_FILTERS, JOB_STATUS, type Job, type JobStatus } from "./sample"

/** A job's sections. Each tab names the panel the page renders under the header, not inside it. */
export const JOB_TABS = ["overview", "quote", "activity"].map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
  id: `job-tab-${value}`,
  panelId: `job-panel-${value}`,
}))

/** The tab an address asks for, or the overview. */
export function jobTab(asked: string | string[] | undefined) {
  const value = Array.isArray(asked) ? asked[0] : asked
  return JOB_TABS.some((t) => t.value === value) ? (value as string) : "overview"
}

export const PAGE_SIZE = 10

export type JobSortKey = "job" | "customer" | "date" | "status" | "amount"
export const JOB_SORT_KEYS: JobSortKey[] = ["job", "customer", "date", "status", "amount"]

export interface JobsQuery {
  q: string
  status: JobStatus[]
  page: number
  sort: { key: JobSortKey; direction: "ascending" | "descending" } | null
}

type Params = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ""

/** The query in an address, with anything unknown dropped rather than trusted. */
export function parseJobsQuery(params: Params): JobsQuery {
  const known = new Set(JOB_FILTERS.map((f) => f.value))
  const status = one(params.status)
    .split(",")
    .filter((s): s is JobStatus => known.has(s as JobStatus))
  const page = Math.max(1, Math.floor(Number(one(params.page))) || 1)
  const key = one(params.sort) as JobSortKey
  const sort = JOB_SORT_KEYS.includes(key) ? { key, direction: one(params.dir) === "desc" ? ("descending" as const) : ("ascending" as const) } : null
  return { q: one(params.q).slice(0, 100), status: [...new Set(status)], page, sort }
}

/** The address for a query, leaving out whatever is at its default. */
export function jobsQueryString(query: JobsQuery) {
  const p = new URLSearchParams()
  if (query.q) p.set("q", query.q)
  if (query.status.length) p.set("status", query.status.join(","))
  if (query.sort) {
    p.set("sort", query.sort.key)
    if (query.sort.direction === "descending") p.set("dir", "desc")
  }
  if (query.page > 1) p.set("page", String(query.page))
  const s = p.toString()
  return s ? `?${s}` : ""
}

/** Whether a job matches the search: its reference, service, customer, technician or site, ignoring case. */
export function matchesSearch(job: Job, q: string) {
  const needle = q.trim().toLocaleLowerCase()
  if (!needle) return true
  return [job.id, job.service, job.customer, job.technician, job.site].some((text) => text.toLocaleLowerCase().includes(needle))
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
const STATUS_ORDER = Object.keys(JOB_STATUS) as JobStatus[]

/** Jobs in the query's order. A missing value goes last, whichever way the column is sorted. */
export function sortJobs(jobs: Job[], sort: JobsQuery["sort"]) {
  if (!sort) return jobs
  const value = (j: Job): string | number | null => {
    switch (sort.key) {
      case "job":
        return j.id
      case "status":
        return STATUS_ORDER.indexOf(j.status)
      case "amount":
        return j.amount
      default:
        return j[sort.key]
    }
  }
  return [...jobs].sort((a, b) => {
    const x = value(a)
    const y = value(b)
    if (x === null && y === null) return 0
    if (x === null) return 1
    if (y === null) return -1
    const order = typeof x === "number" && typeof y === "number" ? x - y : collator.compare(String(x), String(y))
    return sort.direction === "ascending" ? order : -order
  })
}
