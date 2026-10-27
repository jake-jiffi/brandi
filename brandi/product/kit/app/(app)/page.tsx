import type { Metadata } from "next"

import { HomeHeader, SetupChecklist, WaitingOnYou } from "@/components/app/example-home"
import { Card, ChartFigure, LineChart, MetricCard, Timeline } from "@/components/system"
import { formatNumber } from "@/lib/format"
import { ACCOUNTING, COMPLETED_BY_DAY, HOME_FIGURES, RECENT_ACTIVITY } from "@/lib/sample"

export const metadata: Metadata = { title: "Home" }

const change = ((COMPLETED_BY_DAY.total - COMPLETED_BY_DAY.before) / COMPLETED_BY_DAY.before) * 100

/** What needs me, and how are we tracking: the only page with a greeting. */
export default function HomePage() {
  const { completed, revenue, callBacks } = HOME_FIGURES
  return (
    <div className="@container flex flex-col gap-8">
      <HomeHeader />

      <div className="grid items-start gap-6 @min-[960px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <WaitingOnYou />
        <SetupChecklist />
      </div>

      <section aria-labelledby="figures" className="flex flex-col gap-4">
        <h2 id="figures" className="type-heading text-text-strong">
          This week in figures
        </h2>
        <div className="grid gap-4 @min-[600px]:grid-cols-2 @min-[1120px]:grid-cols-4">
          <MetricCard
            hero
            label="Jobs completed this week"
            value={completed.value}
            delta={completed.delta}
            context="vs last week"
            trend={completed.trend}
            trendLabel={`Up from ${formatNumber(completed.trend[0])} to ${formatNumber(completed.value)} over 8 weeks`}
            footnote="Excludes follow-up visits."
          />
          <MetricCard
            label="Revenue this month"
            value={revenue.value}
            format="compact-currency"
            delta={revenue.delta}
            context="vs last month"
            footnote="Month to date against the same days last month, before GST."
          />
          <MetricCard
            label="Call-back rate, last 30 days"
            value={callBacks.value}
            format="percent"
            delta={callBacks.delta}
            deltaFormat="points"
            goodWhen="down"
            context="vs the 30 days before"
            footnote="Excludes warranty work."
          />
          <MetricCard
            label="Overdue invoices"
            format="compact-currency"
            state="unavailable"
            unavailableText={`${ACCOUNTING.name} last answered at ${ACCOUNTING.lastAnswered}.`}
          />
        </div>
      </section>

      <div className="grid items-start gap-6 @min-[960px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ChartFigure
          title="Jobs completed each day"
          summary={`${formatNumber(COMPLETED_BY_DAY.total)} jobs completed in the last 14 days, up ${formatNumber(change, "percent", { digits: 0 })} on the 14 days before.`}
        >
          <LineChart data={COMPLETED_BY_DAY.data} series={COMPLETED_BY_DAY.series} format="number" labelHeading="Day" />
        </ChartFigure>
        <Card title="Recent activity">
          <Timeline items={RECENT_ACTIVITY} />
        </Card>
      </div>
    </div>
  )
}
