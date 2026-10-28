"use client"

import * as React from "react"

import {
  Button,
  DataTable,
  DatePicker,
  Dialog,
  Field,
  FilterChip,
  PageHeader,
  Pagination,
  SampleBadge,
  SearchField,
  Select,
  Spacer,
  TextArea,
  ToastRegion,
  type DataTableColumn,
  type DataTableMenuEntry,
  type DataTableRow,
} from "@/components/system"
import { useShortcuts } from "@/hooks/use-shortcuts"
import { formatDate, todayIn } from "@/lib/dates"
import { formatNumber } from "@/lib/format"
import { jobsQueryString, matchesSearch, PAGE_SIZE, parseJobsQuery, sortJobs, type JobSortKey, type JobsQuery } from "@/lib/jobs-query"
import { CUSTOMERS, JOB_FILTERS, JOB_STATUS, JOBS, SERVICES, TIME_ZONE, TODAY, type Job, type JobStatus } from "@/lib/sample"

import { addJob, nextJobId, removeJob, requestNewJob, restoreJobStatus, setJobStatus, useExample } from "./example-store"
import { useAddressState } from "./use-address-state"

// Jobs added while trying the example live only in this visit, so they have no page of their own to open.
const SAMPLE_IDS = new Set(JOBS.map((j) => j.id))

const readQuery = (params: URLSearchParams) => parseJobsQuery(Object.fromEntries(params))
const writeQuery = (query: JobsQuery) => jobsQueryString(query).slice(1)

/** "J-1042" for one job, "3 jobs" for more. */
const named = (ids: string[]) => (ids.length === 1 ? ids[0] : `${formatNumber(ids.length)} jobs`)

/**
 * A cell as a CSV field, quoted when it has to be. Text that a spreadsheet would run as a formula (it starts with
 * =, +, -, @ or a tab) is led by an apostrophe, so an export never carries a formula someone typed into a name.
 */
const csvText = (value: string) => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** The rows that open a job, in the layout showing now: the table's links, or the phone list's. */
function visibleOpeners() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-slot="data-table-open"], [data-slot="data-table-list"] a[href]')).filter(
    (el) => el.getClientRects().length > 0
  )
}

/** The index of jobs: search, status filters and sort in the address, bulk actions on the rows on screen, and an export. */
export function JobsBoard({ initial }: { initial: JobsQuery }) {
  const { jobs, newJob } = useExample()
  const [shortcuts] = useShortcuts()
  const [query, apply] = useAddressState(initial, readQuery, writeQuery)
  const [selected, setSelected] = React.useState<string[]>([])
  const [creating, setCreating] = React.useState(false)
  const search = React.useRef<HTMLInputElement | null>(null)

  // The form is open when New job here was pressed, or when the command menu asked for it from anywhere.
  const formOpen = creating || newJob
  const closeForm = () => {
    setCreating(false)
    requestNewJob(false)
  }

  const active = jobs.filter((j) => j.status !== "archived")
  const searched = active.filter((j) => matchesSearch(j, query.q))
  const filtered = query.status.length ? searched.filter((j) => query.status.includes(j.status)) : searched
  const sorted = sortJobs(filtered, query.sort)
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const page = Math.min(query.page, pages)
  const onScreen = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const count = (status: JobStatus) => searched.filter((j) => j.status === status).length
  const none = query.q ? `No jobs match “${query.q}”` : "No jobs match these filters"
  const needYou = active.filter((j) => j.status === "needs-you").length

  const change = (next: Partial<JobsQuery>) => apply({ ...query, page: 1, ...next })
  const toggleStatus = (status: JobStatus, on: boolean) =>
    change({ status: on ? [...query.status, status] : query.status.filter((s) => s !== status) })
  const clearFilters = () => {
    change({ q: "", status: [] })
    // The empty state's button goes as the rows come back, so focus goes to the search, never the page.
    requestAnimationFrame(() => search.current?.focus())
  }

  const markDone = (ids: string[]) => {
    const before = setJobStatus(ids, "done")
    setSelected([])
    ToastRegion.show(`${named(ids)} marked done.`, { tone: "success", action: "Undo", onAction: () => restoreJobStatus(before) })
  }
  const archive = (ids: string[], fromRow = false) => {
    const index = onScreen.findIndex((j) => j.id === ids[0])
    const before = setJobStatus(ids, "archived")
    setSelected([])
    ToastRegion.show(`${named(ids)} archived.`, { action: "Undo", onAction: () => restoreJobStatus(before) })
    // A row's own menu goes with its row, so focus moves to the job that took its place.
    if (fromRow) {
      requestAnimationFrame(() => {
        const openers = visibleOpeners()
        const next = openers[Math.min(index, openers.length - 1)]
        if (next) next.focus()
        else search.current?.focus()
      })
    }
  }

  const exportCsv = () => {
    const head = ["Job", "Service", "Customer", "Technician", "Booked for", "Status", "Quote"]
    const lines = sorted.map((j) =>
      // Exact values: the date as the record holds it, the amount to the cent with no symbol, so a spreadsheet can add it up.
      [...[j.id, j.service, j.customer, j.technician].map(csvText), j.date, csvText(JOB_STATUS[j.status].label), j.amount === null ? "" : j.amount.toFixed(2)].join(",")
    )
    const file = `jobs-${todayIn(TIME_ZONE)}.csv`
    // A byte order mark first, so a spreadsheet reads the names' accents as they are.
    const url = URL.createObjectURL(new Blob([`﻿${[head.join(","), ...lines].join("\n")}\n`], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = file
    link.click()
    // Let go of the file once the download has it.
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    ToastRegion.show(`Exported ${named(sorted.map((j) => j.id))} to ${file}.`, { tone: "success" })
  }

  const rowMenu = (id: string): DataTableMenuEntry[] => {
    const job = jobs.find((j) => j.id === id)
    return [
      ...(job && job.status !== "done" ? [{ label: "Mark done", icon: "CircleCheck" as const, onSelect: () => markDone([id]) }] : []),
      { label: "Archive", icon: "Archive", onSelect: () => archive([id], true) },
    ]
  }

  // Six columns, so a tablet shows every one without scrolling sideways: the visit carries its technician under it.
  const columns: DataTableColumn[] = [
    { key: "job", label: "Job", type: "stack", sortable: true },
    { key: "customer", label: "Customer", sortable: true },
    { key: "date", label: "Visit", type: "stack", sortable: true },
    { key: "status", label: "Status", type: "badge", sortable: true },
    { key: "amount", label: "Quote", type: "currency", sortable: true, empty: "Not quoted" },
    { key: "actions", label: "Actions", type: "actions", items: (row) => rowMenu(String(row.id)) },
  ]
  const rows: DataTableRow[] = onScreen.map((j) => ({
    id: j.id,
    job: { title: j.id, sub: j.service },
    customer: j.customer,
    date: { title: formatDate(j.date, "day"), sub: j.technician || "No technician yet" },
    status: JOB_STATUS[j.status],
    amount: j.amount,
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jobs"
        description={`${formatNumber(active.length)} jobs, ${formatNumber(needYou)} waiting on you.`}
        meta={<SampleBadge />}
        primary={
          <Button variant="primary" icon="Plus" onClick={() => setCreating(true)}>
            New job
          </Button>
        }
      />
      <DataTable
        caption="Jobs"
        columns={columns}
        rows={rows}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        sort={query.sort}
        onSortChange={(next) => change({ sort: { key: next.key as JobSortKey, direction: next.direction } })}
        rowHref={(row) => (SAMPLE_IDS.has(String(row.id)) ? `/jobs/${row.id}` : undefined)}
        headingLevel={2}
        toolbar={{
          label: "Job filters",
          bulkActions: [
            { label: "Mark done", icon: "CircleCheck", onSelect: markDone },
            { label: "Archive", icon: "Archive", onSelect: (ids) => archive(ids) },
          ],
          children: (
            <>
              <SearchField
                ref={search}
                placeholder="Search jobs"
                // A single key works only while single-key shortcuts are on (WCAG 2.1.4), and its hint goes with it.
                shortcut={shortcuts ? "/" : undefined}
                value={query.q}
                onChange={(event) => change({ q: event.target.value })}
                className="w-72 max-w-full @max-[639px]:w-full"
              />
              {JOB_FILTERS.map((f) => (
                <FilterChip
                  key={f.value}
                  selected={query.status.includes(f.value)}
                  onChange={(on) => toggleStatus(f.value, on)}
                  count={count(f.value)}
                  attention={f.value === "needs-you"}
                  noun={["job", "jobs"]}
                >
                  {f.label}
                </FilterChip>
              ))}
              <Spacer />
              <Button icon="Download" onClick={exportCsv} disabled={!sorted.length}>
                Export
              </Button>
            </>
          ),
        }}
        empty={{
          title: none,
          description: "Try another search, or clear the filters to see every job.",
          actions: [{ label: "Clear filters", icon: "X", onClick: clearFilters }],
        }}
        // The count is the one live region for results, so it stays mounted at zero and says nothing matches; the
        // table keeps it out of sight under the empty state, which says so on screen. A new page of results adds a
        // history entry, so Back returns to the page before.
        footer={<Pagination page={page} pageSize={PAGE_SIZE} total={sorted.length} empty={none} onPage={(p) => apply({ ...query, page: p }, { push: true })} />}
      />
      <NewJobDialog
        open={formOpen}
        onClose={closeForm}
        onCreate={(job) => {
          addJob(job)
          closeForm()
          ToastRegion.show(`${job.id} created for ${job.customer}.`, { tone: "success", action: "Undo", onAction: () => removeJob(job.id) })
        }}
      />
    </div>
  )
}

type Errors = Partial<Record<"customer" | "service" | "date", string>>

/**
 * A short form, so a dialog: customer, service, the day and a note. The form lives inside the dialog, which
 * drops it on closing, so every opening starts empty. Once something is typed, a stray click on the scrim
 * cannot lose it.
 */
function NewJobDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (job: Job) => void }) {
  const [dirty, setDirty] = React.useState(false)
  const close = () => {
    setDirty(false)
    onClose()
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      title="New job"
      description="It goes on the board as scheduled, with no technician yet."
      scrimClose={!dirty}
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button variant="primary" type="submit" form="new-job">
            Create job
          </Button>
        </>
      }
    >
      <NewJobForm
        onTyped={() => setDirty(true)}
        onCreate={(job) => {
          setDirty(false)
          onCreate(job)
        }}
      />
    </Dialog>
  )
}

/** The fields. Errors show on save, never while typing, and each clears as soon as its field is right. */
function NewJobForm({ onTyped, onCreate }: { onTyped: () => void; onCreate: (job: Job) => void }) {
  const [customer, setCustomer] = React.useState("")
  const [service, setService] = React.useState("")
  const [date, setDate] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [errors, setErrors] = React.useState<Errors>({})
  const form = React.useRef<HTMLFormElement | null>(null)

  const check = (values = { customer, service, date }): Errors => ({
    ...(values.customer ? {} : { customer: "Choose the customer the job is for." }),
    ...(values.service ? {} : { service: "Choose a service." }),
    ...(values.date ? {} : { date: `Enter the day of the visit, such as ${formatDate(TODAY, "sentence")}.` }),
  })
  const settle = (key: keyof Errors, value: string) => {
    onTyped()
    if (errors[key] && value) setErrors((was) => ({ ...was, [key]: undefined }))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const found = check()
    setErrors(found)
    if (Object.values(found).some(Boolean)) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    onCreate({ id: nextJobId(), service, customer, site: "", technician: "", date, status: "scheduled", amount: null })
  }

  return (
    <form id="new-job" ref={form} noValidate onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Customer" error={errors.customer} required>
        <Select
          options={CUSTOMERS}
          value={customer}
          onChange={(v) => {
            setCustomer(v)
            settle("customer", v)
          }}
          placeholder="Choose a customer"
        />
      </Field>
      <Field label="Service" error={errors.service} required>
        <Select
          options={SERVICES}
          value={service}
          onChange={(v) => {
            setService(v)
            settle("service", v)
          }}
          placeholder="Choose a service"
        />
      </Field>
      <Field label="Booked for" error={errors.date} required>
        <DatePicker
          value={date}
          min={TODAY}
          onChange={(v) => {
            setDate(v)
            settle("date", v)
          }}
        />
      </Field>
      <Field label="Notes" optional hint="What the technician should know before they arrive.">
        <TextArea
          rows={3}
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value)
            onTyped()
          }}
        />
      </Field>
    </form>
  )
}
