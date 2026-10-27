"use client"

import * as React from "react"

import { Card, List, OnboardingChecklist, PageHeader, SampleBadge, TextLink, type ListItem } from "@/components/system"
import { formatNumber } from "@/lib/format"
import { JOB_STATUS, PERSON, SETUP_TASKS } from "@/lib/sample"

import { useExample } from "./example-store"

const plural = (n: number, one: string, many: string) => `${formatNumber(n)} ${n === 1 ? one : many}`

/** The greeting, with what is waiting in one line, as it stands now. */
export function HomeHeader() {
  const { jobs } = useExample()
  const needYou = jobs.filter((j) => j.status === "needs-you").length
  const overdue = jobs.filter((j) => j.status === "overdue").length
  const summary =
    needYou + overdue === 0
      ? "All caught up. Nothing is waiting on you."
      : `${plural(needYou, "job is", "jobs are")} waiting on you${overdue ? `, and ${plural(overdue, "is", "are")} overdue` : ""}.`
  return <PageHeader title={`Morning, ${PERSON.firstName}.`} description={summary} meta={<SampleBadge size="md" />} />
}

const NEXT_STEP: Partial<Record<string, string>> = { "needs-you": "Approve the quote", overdue: "Rebook the visit" }

/** Up to five jobs waiting on the reader, each with its badge and next step, then the rest. */
export function WaitingOnYou() {
  const { jobs } = useExample()
  const waiting = jobs.filter((j) => j.status === "needs-you" || j.status === "overdue")
  const items: ListItem[] = waiting.slice(0, 5).map((j) => ({
    id: j.id,
    title: j.customer,
    meta: `${j.id} · ${NEXT_STEP[j.status]}`,
    badge: JOB_STATUS[j.status],
    href: `/jobs/${j.id}`,
  }))
  return (
    <Card
      title="Waiting on you"
      flush
      footer={waiting.length > 5 ? <TextLink href="/jobs?status=needs-you,overdue">See all {formatNumber(waiting.length)} jobs waiting on you</TextLink> : undefined}
    >
      <List items={items} empty={{ title: "Nothing is waiting on you.", description: "Quotes to approve and visits to rebook show here." }} />
    </Card>
  )
}

/** First-run tasks. The morning summary counts as done once Settings turns it on. */
export function SetupChecklist() {
  const { morningSummary } = useExample()
  const tasks = SETUP_TASKS.map((t) => (t.id === "summary" ? { ...t, done: morningSummary } : t))
  return <OnboardingChecklist title="Finish setting up" description="A few things that make the product work for you." tasks={tasks} />
}
