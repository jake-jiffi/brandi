import type { Metadata } from "next"

import { ShortcutList } from "@/components/app/example-help"
import { Accordion, Card, PageHeader, TextLink } from "@/components/system"
import { ACCOUNTING, PERSON } from "@/lib/sample"

export const metadata: Metadata = { title: "Help" }

const QUESTIONS = [
  {
    id: "approve",
    title: "How do I approve a quote?",
    content: "Open the job from Jobs or from Waiting on you on Home, check the Quote tab, then press Approve quote. The message that follows has Undo for 8 seconds.",
  },
  {
    id: "unavailable",
    title: "Why does a figure say unavailable?",
    content: `The system it comes from is not answering. The page keeps the last figures it had and says when they are from, so nothing shows as a zero nobody measured. Invoices come from ${ACCOUNTING.name}.`,
  },
  {
    id: "export",
    title: "How do I export jobs?",
    content: "On Jobs, search and filter to the jobs you want, then press Export. The file has every job that matches, on every page, with exact amounts.",
  },
  {
    id: "shortcuts",
    title: "Can I turn off single-key shortcuts?",
    content: "Yes. In Settings, under Keyboard, turn off Single-key shortcuts. Shortcuts with Cmd or Ctrl keep working.",
  },
]

/** Answers to the common questions first, as the page's own sections, then the keys and who to ask. */
export default function HelpPage() {
  return (
    <div className="@container flex max-w-content flex-col gap-8">
      <PageHeader title="Help" description="Answers to common questions, the keyboard shortcuts, and who to ask." />
      <Accordion items={QUESTIONS} headingLevel={2} />
      <div className="grid items-start gap-6 @min-[880px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ShortcutList />
        <Card title="Still stuck?">
          <p className="max-w-measure type-body text-text">
            Ask your workspace owner, {PERSON.name}, or write to the support team at <TextLink href="mailto:support@example.com">support@example.com</TextLink>. Replies
            come within one working day.
          </p>
        </Card>
      </div>
    </div>
  )
}
