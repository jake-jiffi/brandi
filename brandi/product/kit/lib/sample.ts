// The example product's sample data, all of it, in one place. Every invented name (people, customers,
// places, outside systems) is in square brackets, so nobody takes it for a real one. Every figure is a
// plain number that goes through formatNumber where it is shown, and every time of day goes through
// formatTime. A real product deletes this file with the example's pages under app/(app), their parts in
// components/app/example-* and lib/jobs-query.ts, and keeps the shell, the route group's layout and the
// page states.

import type { BadgeTone, ChartDatum, ChartSeries, HBarDatum, NotificationItem, OnboardingTask, TimelineItem } from "@/components/system"

import { addDays, formatDate } from "./dates"
import { formatTime } from "./format"

/** The business the sample belongs to keeps its own clock, so dates and times read in its zone. */
export const TIME_ZONE = "Australia/Sydney"

/** The day the sample stands on. Figures and freshness lines are as at this day. */
export const TODAY = "2026-10-28"

/** A time of day as minutes after midnight, the form formatTime takes. */
export const at = (hour: number, minute = 0) => hour * 60 + minute

export const PERSON = { name: "[Alex Morgan]", firstName: "[Alex]", role: "Owner", email: "owner@example.com" }

export const WORKSPACES = [
  { value: "northside", name: "[Northside]", role: "Owner" },
  { value: "harbour", name: "[Harbour]", role: "Manager" },
]

/** The outside system the invoices come from, and the last time it answered. */
export const ACCOUNTING = { name: "[Accounting system]", lastAnswered: `[${formatTime(at(9, 42))}]` }

/** When the morning summary goes out. */
export const SUMMARY_TIME = formatTime(at(7))

// -- Jobs: the records --

export type JobStatus = "needs-you" | "overdue" | "in-progress" | "scheduled" | "waiting" | "done" | "archived"

/** The words and badge tone for each state, from the status words table: one word per state, everywhere. */
export const JOB_STATUS: Record<JobStatus, { label: string; tone: BadgeTone }> = {
  "needs-you": { label: "Needs you", tone: "highlight" },
  overdue: { label: "Overdue", tone: "danger" },
  "in-progress": { label: "In progress", tone: "info" },
  scheduled: { label: "Scheduled", tone: "info" },
  waiting: { label: "Waiting on customer", tone: "neutral" },
  done: { label: "Done", tone: "success" },
  archived: { label: "Archived", tone: "neutral" },
}

/** The filters on the jobs page, in the order they show. Archived jobs are out of play, so no filter shows them. */
export const JOB_FILTERS: Array<{ value: JobStatus; label: string }> = [
  { value: "needs-you", label: "Needs you" },
  { value: "overdue", label: "Overdue" },
  { value: "in-progress", label: "In progress" },
  { value: "scheduled", label: "Scheduled" },
  { value: "waiting", label: "Waiting" },
  { value: "done", label: "Done" },
]

export interface Job {
  id: string
  service: string
  customer: string
  site: string
  technician: string
  /** The day it is booked, as an ISO date in the business's zone. */
  date: string
  status: JobStatus
  /** The quote, in the market's currency. null before anyone has quoted it. */
  amount: number | null
}

const job = (id: string, service: string, customer: string, site: string, technician: string, date: string, status: JobStatus, amount: number | null): Job => ({
  id,
  service,
  customer,
  site,
  technician,
  date,
  status,
  amount,
})

/** Waiting on the reader first, then what is happening, then what is booked, then what is finished. */
export const JOBS: Job[] = [
  job("J-1042", "Annual service", "[Northside Dental]", "[14 Harbour Street, Northside]", "[Sam Reid]", "2026-10-30", "needs-you", 2490.5),
  job("J-1043", "Leak repair", "[Harbour Café]", "[2 Wharf Road, Harbour]", "[Priya Nair]", "2026-10-31", "needs-you", 640),
  job("J-1044", "Installation", "[Greenway Motors]", "[88 Station Street, Greenway]", "[Tom Walsh]", "2026-11-02", "needs-you", 5120),
  job("J-1045", "Inspection", "[Bayview Apartments]", "[1 Bay Parade, Bayview]", "[Mei Chen]", "2026-11-03", "needs-you", 380),
  job("J-1046", "Repair", "[Kingsford Bakery]", "[40 High Street, Kingsford]", "[Jordan Lee]", "2026-11-04", "needs-you", 1265.75),
  job("J-1031", "Repair", "[Riverside Physio]", "[7 River Lane, Riverside]", "[Sam Reid]", "2026-10-22", "overdue", 890),
  job("J-1034", "Follow-up visit", "[Summit Fitness]", "[120 Summit Road, Hillcrest]", "[Priya Nair]", "2026-10-26", "overdue", 220),
  job("J-1036", "Installation", "[Northside Dental]", "[14 Harbour Street, Northside]", "[Tom Walsh]", "2026-10-28", "in-progress", 6340),
  job("J-1037", "Repair", "[Parkside Vets]", "[9 Park Avenue, Parkside]", "[Mei Chen]", "2026-10-28", "in-progress", 455),
  job("J-1038", "Maintenance", "[Kingsford Bakery]", "[40 High Street, Kingsford]", "[Jordan Lee]", "2026-10-28", "in-progress", 720),
  job("J-1039", "Leak repair", "[Westgate Storage]", "[16 Gate Road, Westgate]", "[Sam Reid]", "2026-10-28", "in-progress", 610.5),
  job("J-1051", "Inspection", "[Elm Street Clinic]", "[31 Elm Street, Northside]", "[Priya Nair]", "2026-10-29", "scheduled", 420),
  job("J-1052", "Repair", "[Westgate Storage]", "[16 Gate Road, Westgate]", "[Tom Walsh]", "2026-10-29", "scheduled", 760),
  job("J-1053", "Annual service", "[Harbour Café]", "[2 Wharf Road, Harbour]", "[Mei Chen]", "2026-10-30", "scheduled", 1180),
  job("J-1054", "Installation", "[Riverside Physio]", "[7 River Lane, Riverside]", "[Jordan Lee]", "2026-11-02", "scheduled", 2975),
  job("J-1055", "Leak repair", "[Bayview Apartments]", "[1 Bay Parade, Bayview]", "[Sam Reid]", "2026-11-03", "scheduled", 515.2),
  job("J-1056", "Maintenance", "[Greenway Motors]", "[88 Station Street, Greenway]", "[Priya Nair]", "2026-11-05", "scheduled", 1340),
  job("J-1057", "Inspection", "[Summit Fitness]", "[120 Summit Road, Hillcrest]", "[Tom Walsh]", "2026-11-10", "scheduled", 390),
  job("J-1058", "Repair", "[Coastline Hotel]", "[300 The Esplanade, Coastline]", "[Mei Chen]", "2026-11-11", "scheduled", 1825),
  job("J-1059", "Maintenance", "[Oakleigh Primary]", "[5 School Road, Oakleigh]", "[Jordan Lee]", "2026-11-13", "scheduled", 980),
  job("J-1047", "Quote visit", "[Oakleigh Primary]", "[5 School Road, Oakleigh]", "[Tom Walsh]", "2026-11-05", "waiting", null),
  job("J-1048", "Installation", "[Parkside Vets]", "[9 Park Avenue, Parkside]", "[Mei Chen]", "2026-11-06", "waiting", 3840),
  job("J-1049", "Annual service", "[Coastline Hotel]", "[300 The Esplanade, Coastline]", "[Jordan Lee]", "2026-11-09", "waiting", 4210.4),
  job("J-1035", "Follow-up visit", "[Northside Dental]", "[14 Harbour Street, Northside]", "[Sam Reid]", "2026-10-27", "done", 0),
  job("J-1032", "Repair", "[Coastline Hotel]", "[300 The Esplanade, Coastline]", "[Mei Chen]", "2026-10-26", "done", 1390.95),
  job("J-1029", "Leak repair", "[Summit Fitness]", "[120 Summit Road, Hillcrest]", "[Priya Nair]", "2026-10-23", "done", 575),
  job("J-1027", "Maintenance", "[Riverside Physio]", "[7 River Lane, Riverside]", "[Jordan Lee]", "2026-10-21", "done", 1050),
  job("J-1025", "Installation", "[Bayview Apartments]", "[1 Bay Parade, Bayview]", "[Tom Walsh]", "2026-10-20", "done", 4490),
  job("J-1024", "Inspection", "[Harbour Café]", "[2 Wharf Road, Harbour]", "[Sam Reid]", "2026-10-19", "done", 360),
  job("J-1022", "Repair", "[Greenway Motors]", "[88 Station Street, Greenway]", "[Priya Nair]", "2026-10-15", "done", 845),
  job("J-1021", "Annual service", "[Elm Street Clinic]", "[31 Elm Street, Northside]", "[Mei Chen]", "2026-10-14", "done", 2210),
]

/** One job whose source always fails, so the example shows the page-level error state inside the shell. */
export const BROKEN_JOB_ID = "J-1050"

export const CUSTOMERS = [...new Set(JOBS.map((j) => j.customer))].sort()
export const SERVICES = [...new Set(JOBS.map((j) => j.service))].sort()
export const TECHNICIANS = [...new Set(JOBS.map((j) => j.technician))].sort()

/** A job by its id. Throws for the one whose source fails, as a real loader would when its system does. */
export function findJob(id: string): Job | undefined {
  if (id === BROKEN_JOB_ID) throw new Error(`[Booking system] did not return ${id}`)
  return JOBS.find((j) => j.id === id)
}

export interface QuoteLine {
  id: string
  item: string
  quantity: number
  unit: number
  amount: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** A quote's lines, adding up to the job's amount to the cent: a call-out, labour by the quarter hour, then parts. */
export function quoteLines(j: Job): QuoteLine[] {
  if (j.amount === null) return []
  if (j.amount < 400) return [{ id: "fixed", item: `${j.service}, fixed price`, quantity: 1, unit: j.amount, amount: j.amount }]
  const callOut = 95
  const rate = 132
  const hours = Math.max(1, Math.round((((j.amount - callOut) * 0.55) / rate) * 4) / 4)
  const labour = round2(hours * rate)
  const parts = round2(j.amount - callOut - labour)
  return [
    { id: "call-out", item: "Call-out", quantity: 1, unit: callOut, amount: callOut },
    { id: "labour", item: "Labour, per hour", quantity: hours, unit: rate, amount: labour },
    { id: "parts", item: "Parts and materials", quantity: 1, unit: parts, amount: parts },
  ]
}

/** A day and a time as an activity line reads them: "Today, 8:15 am", or "Fri 23 Oct, 9:00 am". */
function when(iso: string, minutes: number) {
  const time = formatTime(minutes)
  if (iso === TODAY) return `Today, ${time}`
  if (iso === addDays(TODAY, -1)) return `Yesterday, ${time}`
  return `${formatDate(iso, "day")}, ${time}`
}

/** What happened to a job, newest first, by its state. Created ten days before its visit, booked the day after. */
export function jobActivity(j: Job): TimelineItem[] {
  const created: TimelineItem = { text: `${PERSON.name} created the job for ${j.customer}`, time: when(addDays(j.date, -10), at(10, 5)), icon: "FilePlus" }
  const booked: TimelineItem = { text: `${j.technician} was booked for ${formatDate(j.date, "day")}`, time: when(addDays(j.date, -9), at(14, 40)), icon: "CalendarCheck" }
  switch (j.status) {
    case "needs-you":
      return [{ text: `${j.technician} sent the quote for approval`, time: when(TODAY, at(8, 15)), icon: "FileText" }, booked, created]
    case "overdue":
      return [{ text: "The visit passed its booked day unfinished", time: when(addDays(j.date, 1), at(9)), icon: "TriangleAlert", tone: "warning" }, booked, created]
    case "in-progress":
      return [{ text: `${j.technician} started work on site`, time: when(TODAY, at(7, 30)), icon: "Wrench", tone: "info" }, booked, created]
    case "waiting":
      return [{ text: `The quote went to ${j.customer} to accept`, time: when(addDays(TODAY, -1), at(15, 20)), icon: "Send" }, booked, created]
    case "done":
      return [{ text: `${j.technician} finished the job`, time: when(j.date, at(14, 30)), icon: "CircleCheck", tone: "success" }, booked, created]
    default:
      return [booked, created]
  }
}

// -- Home --

/** The headline figures. The overdue figure comes from the accounting system, which is not answering. */
export const HOME_FIGURES = {
  completed: { value: 46, delta: 8.3, trend: [31, 35, 33, 38, 40, 39, 42, 46] },
  revenue: { value: 36120, delta: 4.8 },
  callBacks: { value: 2.4, delta: -0.6 },
}

const DAYS = ["14 Oct", "15 Oct", "16 Oct", "17 Oct", "18 Oct", "19 Oct", "20 Oct", "21 Oct", "22 Oct", "23 Oct", "24 Oct", "25 Oct", "26 Oct", "27 Oct"]
const THIS_FORTNIGHT = [9, 8, 9, 3, 1, 8, 10, 9, 9, 11, 4, 2, 9, 12]
const LAST_FORTNIGHT = [8, 7, 8, 2, 1, 7, 9, 8, 8, 9, 3, 1, 8, 9]

/** Jobs finished each day for the last 14 days, against the 14 days before. */
export const COMPLETED_BY_DAY: { data: ChartDatum[]; series: ChartSeries[]; total: number; before: number } = {
  data: DAYS.map((label, i) => ({ label, values: { now: THIS_FORTNIGHT[i], before: LAST_FORTNIGHT[i] } })),
  series: [
    { key: "now", label: "Last 14 days" },
    { key: "before", label: "The 14 days before", compare: true },
  ],
  total: THIS_FORTNIGHT.reduce((a, b) => a + b, 0),
  before: LAST_FORTNIGHT.reduce((a, b) => a + b, 0),
}

/** First-run tasks. The morning summary is done when Settings turns it on. */
export const SETUP_TASKS: OnboardingTask[] = [
  { id: "first-job", label: "Add your first job", description: "Every job, quote and visit starts here.", done: true, href: "/jobs" },
  { id: "accounting", label: `Connect ${ACCOUNTING.name}`, description: "Invoices and payments sync from it every 15 minutes.", done: true, href: "/invoices" },
  { id: "summary", label: "Turn on the morning summary", description: `One email at ${SUMMARY_TIME} with what needs you that day.`, href: "/settings#notifications" },
  { id: "shortcuts", label: "Learn the keyboard shortcuts", description: "Search, move between pages and act without the mouse.", href: "/help#keyboard-shortcuts" },
]

export const RECENT_ACTIVITY: TimelineItem[] = [
  { text: "[Sam Reid] sent the quote for J-1042 for approval", time: when(TODAY, at(8, 15)), icon: "FileText" },
  { text: "[Tom Walsh] started work at [Northside Dental]", time: when(TODAY, at(7, 30)), icon: "Wrench", tone: "info" },
  { text: "[Harbour Café] accepted the quote for J-1053", time: when(addDays(TODAY, -1), at(16, 2)), icon: "CircleCheck", tone: "success" },
  { text: "J-1031 at [Riverside Physio] passed its booked day unfinished", time: when("2026-10-23", at(9)), icon: "TriangleAlert", tone: "warning" },
]

export const NOTIFICATIONS: NotificationItem[] = [
  { id: "n-1042", text: "[Sam Reid] asked you to approve the quote for J-1042", time: when(TODAY, at(8, 15)), icon: "FileText", unread: true, href: "/jobs/J-1042" },
  { id: "n-sync", text: `${ACCOUNTING.name} stopped answering at ${ACCOUNTING.lastAnswered}`, time: when(TODAY, at(9, 47)), tone: "danger", unread: true, href: "/invoices" },
  { id: "n-1053", text: "[Harbour Café] accepted the quote for J-1053", time: when(addDays(TODAY, -1), at(16, 2)), tone: "success", unread: true, href: "/jobs/J-1053" },
  { id: "n-1029", text: "[Priya Nair] finished J-1029 at [Summit Fitness]", time: when("2026-10-23", at(14, 30)), tone: "success", href: "/jobs/J-1029" },
  { id: "n-1031", text: "J-1031 at [Riverside Physio] is overdue", time: when("2026-10-23", at(9)), tone: "warning", href: "/jobs/J-1031" },
]

// -- Invoices: the last good copy from the accounting system --

export type InvoiceStatus = "paid" | "sent" | "due-soon" | "overdue"

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Paid", tone: "success" },
  sent: { label: "Sent", tone: "info" },
  "due-soon": { label: "Due soon", tone: "warning" },
  overdue: { label: "Overdue", tone: "danger" },
}

export interface Invoice {
  id: string
  customer: string
  job: string
  due: string
  status: InvoiceStatus
  amount: number
}

export const INVOICES: Invoice[] = [
  { id: "INV-2214", customer: "[Riverside Physio]", job: "J-1012", due: "2026-10-14", status: "overdue", amount: 1460 },
  { id: "INV-2216", customer: "[Summit Fitness]", job: "J-1013", due: "2026-10-16", status: "overdue", amount: 1120 },
  { id: "INV-2219", customer: "[Coastline Hotel]", job: "J-1015", due: "2026-10-20", status: "overdue", amount: 890 },
  { id: "INV-2220", customer: "[Westgate Storage]", job: "J-1016", due: "2026-10-22", status: "overdue", amount: 540 },
  { id: "INV-2221", customer: "[Harbour Café]", job: "J-1018", due: "2026-10-26", status: "overdue", amount: 300 },
  { id: "INV-2224", customer: "[Bayview Apartments]", job: "J-1025", due: "2026-10-30", status: "due-soon", amount: 4490 },
  { id: "INV-2225", customer: "[Elm Street Clinic]", job: "J-1021", due: "2026-11-02", status: "due-soon", amount: 2210 },
  { id: "INV-2226", customer: "[Greenway Motors]", job: "J-1022", due: "2026-11-06", status: "sent", amount: 845 },
  { id: "INV-2227", customer: "[Northside Dental]", job: "J-1020", due: "2026-11-10", status: "sent", amount: 6385.5 },
  { id: "INV-2209", customer: "[Kingsford Bakery]", job: "J-1011", due: "2026-10-09", status: "paid", amount: 1265.75 },
]

/** The figures as at the last answer. Outstanding is every invoice not yet paid. */
export const INVOICE_FIGURES = {
  outstanding: INVOICES.filter((i) => i.status !== "paid").reduce((n, i) => n + i.amount, 0),
  overdue: INVOICES.filter((i) => i.status === "overdue").reduce((n, i) => n + i.amount, 0),
}

/** What each customer owes past its due date, largest first. */
export const OVERDUE_BY_CUSTOMER: HBarDatum[] = INVOICES.filter((i) => i.status === "overdue")
  .map((i) => ({ label: i.customer, value: i.amount }))
  .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
