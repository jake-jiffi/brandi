"use client"

import * as React from "react"
import { flushSync } from "react-dom"

import {
  Badge,
  Button,
  Card,
  DataTable,
  DescriptionList,
  EmptyState,
  List,
  Menu,
  PageHeader,
  SampleBadge,
  Tabs,
  Timeline,
  ToastRegion,
  type MenuEntry,
} from "@/components/system"
import { formatDate } from "@/lib/dates"
import { formatNumber } from "@/lib/format"
import { JOB_TABS, jobTab } from "@/lib/jobs-query"
import { JOB_STATUS, jobActivity, quoteLines, type Job, type JobStatus } from "@/lib/sample"

import { restoreJobStatus, setJobStatus, useExample } from "./example-store"
import { useAddressState } from "./use-address-state"

const readTab = (params: URLSearchParams) => jobTab(params.get("tab") ?? undefined)
// Overview is the default, so it needs nothing in the address.
const writeTab = (tab: string) => (tab === "overview" ? "" : `tab=${tab}`)

const NEXT_STEP: Record<JobStatus, string> = {
  "needs-you": "Approve or decline the quote",
  overdue: "Rebook the visit",
  "in-progress": "Nothing yet: work is under way",
  scheduled: "Nothing yet: the visit is booked",
  waiting: "Nothing yet: the customer is deciding",
  done: "Nothing: the job is finished",
  archived: "Nothing: the job is archived",
}

/** One job in full: its state, the decision on its quote with Undo, and its sections as tabs in the address. */
export function JobRecord({ job: sample, initialTab }: { job: Job; initialTab: string }) {
  const { jobs } = useExample()
  const job = jobs.find((j) => j.id === sample.id) ?? sample
  // The open tab is in the address, so a link opens the same section.
  const [tab, changeTab] = useAddressState(initialTab, readTab, writeTab)

  // After a decision the button that was pressed goes, so focus moves to the page's title, never the page body.
  const decide = (status: JobStatus, words: string) => {
    let before = new Map<string, JobStatus>()
    flushSync(() => {
      before = setJobStatus([job.id], status)
    })
    PageHeader.focusTitle()
    ToastRegion.show(`Quote for ${job.id} ${words}.`, { tone: "success", action: "Undo", onAction: () => restoreJobStatus(before) })
  }
  const archive = () => {
    const before = setJobStatus([job.id], "archived")
    ToastRegion.show(`${job.id} archived.`, { action: "Undo", onAction: () => restoreJobStatus(before) })
  }
  const markDone = () => {
    const before = setJobStatus([job.id], "done")
    ToastRegion.show(`${job.id} marked done.`, { tone: "success", action: "Undo", onAction: () => restoreJobStatus(before) })
  }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      ToastRegion.show("Link copied.")
    } catch {
      ToastRegion.show("The link could not be copied. Copy it from the address bar instead.")
    }
  }

  const menu: MenuEntry[] = [
    { label: "Copy link", icon: "Link", onSelect: copyLink },
    ...(job.status === "done" || job.status === "archived"
      ? []
      : [{ label: "Mark done", icon: "CircleCheck" as const, onSelect: markDone }]),
    ...(job.status === "archived" ? [] : ["separator" as const, { label: "Archive job", icon: "Archive" as const, onSelect: archive }]),
  ]
  const needsYou = job.status === "needs-you"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Jobs", href: "/jobs" }, { label: job.id }]}
        title={`${job.service} for ${job.customer}`}
        description={`${job.id}, booked for ${formatDate(job.date, "sentence")}${job.technician ? ` with ${job.technician}` : ""}.`}
        meta={
          <>
            <Badge tone={JOB_STATUS[job.status].tone}>{JOB_STATUS[job.status].label}</Badge>
            <SampleBadge />
          </>
        }
        actions={
          <>
            {needsYou ? (
              <Button icon="X" onClick={() => decide("waiting", "declined")}>
                Decline
              </Button>
            ) : null}
            <Menu label={`More actions for ${job.id}`} items={menu} />
          </>
        }
        primary={
          needsYou ? (
            <Button variant="primary" icon="Check" onClick={() => decide("scheduled", "approved")}>
              Approve quote
            </Button>
          ) : undefined
        }
      >
        <Tabs label={`${job.id} sections`} tabs={JOB_TABS} value={tab} onChange={changeTab} />
      </PageHeader>
      <div role="tabpanel" id={`job-panel-${tab}`} aria-labelledby={`job-tab-${tab}`} tabIndex={0} className="rounded-xs">
        {tab === "quote" ? <QuoteTab job={job} /> : tab === "activity" ? <ActivityTab job={job} /> : <OverviewTab job={job} jobs={jobs} />}
      </div>
    </div>
  )
}

function OverviewTab({ job, jobs }: { job: Job; jobs: Job[] }) {
  const related = jobs.filter((j) => j.customer === job.customer && j.id !== job.id && j.status !== "archived")
  return (
    <div className="@container">
      <div className="grid items-start gap-6 @min-[880px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6">
          <Card title="Details" headingLevel={2}>
            <DescriptionList
              items={[
                { label: "Customer", value: job.customer },
                { label: "Site", value: job.site },
                { label: "Service", value: job.service },
                { label: "Booked for", value: formatDate(job.date, "sentence") },
                { label: "Technician", value: job.technician, empty: "Unassigned" },
                { label: "Reference", value: job.id },
              ]}
            />
          </Card>
          <Card title={`Other jobs for ${job.customer}`} flush>
            <List
              items={related.map((j) => ({
                id: j.id,
                title: `${j.id} ${j.service}`,
                meta: formatDate(j.date, "day"),
                badge: JOB_STATUS[j.status],
                href: `/jobs/${j.id}`,
              }))}
              empty={{ title: `No other jobs for ${job.customer}.` }}
            />
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card title="Summary">
            <DescriptionList
              layout="stacked"
              items={[
                { label: "Quote", value: job.amount === null ? null : formatNumber(job.amount, "currency"), empty: "Not quoted yet" },
                { label: "Status", badge: JOB_STATUS[job.status] },
                { label: "Next step", value: NEXT_STEP[job.status] },
              ]}
            />
          </Card>
          <Card title="Latest activity">
            <Timeline items={jobActivity(job).slice(0, 3)} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function QuoteTab({ job }: { job: Job }) {
  const lines = quoteLines(job)
  if (!lines.length) {
    return (
      <EmptyState title="Not quoted yet." icon="FileText" headingLevel={2}>
        {`The quote follows the visit on ${formatDate(job.date, "sentence")}.`}
      </EmptyState>
    )
  }
  return (
    <DataTable
      caption={`Quote for ${job.id}`}
      columns={[
        { key: "item", label: "Item", type: "strong" },
        { key: "quantity", label: "Quantity", type: "number" },
        { key: "unit", label: "Unit price", type: "currency" },
        { key: "amount", label: "Amount", type: "currency" },
      ]}
      rows={lines.map((l) => ({ ...l }))}
      footer={
        <p className="flex items-baseline justify-between gap-4 type-label text-text-strong">
          <span>Total, before GST</span>
          <span className="tabular-nums">{formatNumber(job.amount, "currency")}</span>
        </p>
      }
    />
  )
}

function ActivityTab({ job }: { job: Job }) {
  return (
    <Card title="Activity">
      <Timeline items={jobActivity(job)} />
    </Card>
  )
}
