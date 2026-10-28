import type { Metadata } from "next"

import { SourceDownBanner } from "@/components/app/example-invoices"
import { Badge, ChartFigure, DataTable, HBarChart, MetricCard, PageHeader, SampleBadge } from "@/components/system"
import { formatDate } from "@/lib/dates"
import { formatNumber } from "@/lib/format"
import { ACCOUNTING, INVOICE_FIGURES, INVOICE_STATUS, INVOICES, OVERDUE_BY_CUSTOMER } from "@/lib/sample"

export const metadata: Metadata = { title: "Invoices" }

const top = OVERDUE_BY_CUSTOMER[0]

/**
 * The page whose outside source is down. The last good figures stay, marked with their time, under a banner that
 * names the system; the one figure that needs the source today says it is unavailable rather than showing a zero.
 */
export default function InvoicesPage() {
  return (
    <div className="@container flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description={`Invoices and payments from ${ACCOUNTING.name}, which syncs every 15 minutes.`}
        meta={
          <>
            <Badge tone="warning" icon>
              Sync failed
            </Badge>
            <SampleBadge />
          </>
        }
      />
      <SourceDownBanner />

      <section aria-labelledby="as-at" className="flex flex-col gap-4">
        <h2 id="as-at" className="type-heading text-text-strong">
          As at {ACCOUNTING.lastAnswered}
        </h2>
        <div className="grid gap-4 @min-[720px]:grid-cols-3">
          <MetricCard label="Outstanding" value={INVOICE_FIGURES.outstanding} format="compact-currency" footnote="Every invoice sent and not yet paid." />
          <MetricCard label="Overdue" value={INVOICE_FIGURES.overdue} format="compact-currency" footnote="Past its due date, unpaid." />
          <MetricCard label="Paid today" format="compact-currency" state="unavailable" unavailableText={`${ACCOUNTING.name} last answered at ${ACCOUNTING.lastAnswered}.`} />
        </div>
      </section>

      <div className="grid items-start gap-6 @min-[1040px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ChartFigure
          title="Overdue by customer"
          summary={`${top.label} owes the most: ${formatNumber(top.value, "currency")} of the ${formatNumber(INVOICE_FIGURES.overdue, "currency")} overdue.`}
        >
          <HBarChart data={OVERDUE_BY_CUSTOMER} format="currency" />
        </ChartFigure>
        <DataTable
          caption={`Invoices as at ${ACCOUNTING.lastAnswered}`}
          headingLevel={2}
          columns={[
            { key: "id", label: "Invoice", type: "strong" },
            { key: "customer", label: "Customer" },
            { key: "due", label: "Due" },
            { key: "status", label: "Status", type: "badge" },
            { key: "amount", label: "Amount", type: "currency" },
          ]}
          rows={INVOICES.map((i) => ({ id: i.id, customer: i.customer, due: formatDate(i.due), status: INVOICE_STATUS[i.status], amount: i.amount }))}
        />
      </div>
      <p className="max-w-measure type-meta text-text-subtle">
        Source: {ACCOUNTING.name}, last updated {ACCOUNTING.lastAnswered} today. Excludes draft invoices and credit notes.
      </p>
    </div>
  )
}
