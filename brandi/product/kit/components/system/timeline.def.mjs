// Timeline's one definition. Each example sits on a surface, where a record's history lives.
const pane = "rounded-md border border-line bg-surface p-5"
const history = [
  { text: "[Sam Lee] approved [14] timesheets", time: "Today, 9:41 am", icon: "CircleCheck", tone: "success" },
  { text: "The assistant drafted the [June] pay run from the approved timesheets", time: "Today, 9:12 am", icon: "Sparkles", tone: "ai" },
  { text: "[Priya Nair] asked for [Ravi Patel]'s overtime to be checked before Friday", time: "Yesterday, 4:05 pm", icon: "MessageSquare" },
  { text: "The export to [the bank] failed: [the bank] did not respond", time: "Mon 2 June, 11:20 am", icon: "CircleX", tone: "danger" },
  { text: "[Alex Chen] created the pay run", time: "Mon 2 June, 9:03 am", icon: "FilePlus" },
]

export default {
  name: "Timeline",
  group: "Data",
  job: "What happened to a record, newest first, with an icon by kind and a time.",
  status: "proven",
  types: [
    'type TimelineTone = "neutral" | "success" | "warning" | "danger" | "info" | "ai"',
  ],
  props: [
    { name: "items", type: "{ text: ReactNode; time: string; icon?: IconName; tone?: TimelineTone }[]", doc: "Newest first. Each names who did what." },
    { name: "loading", type: "boolean", default: "false", doc: "Three skeleton rows, with Loading activity for screen readers." },
    { name: "empty", type: "ReactNode", default: '"No activity yet"', doc: "What shows when nothing has happened." },
    { name: "error", type: "ReactNode", doc: "The history could not load: name the system that failed. Items given stay, as the last good copy." },
  ],
  tables: [
    {
      title: "Tones",
      head: ["Tone", "Use"],
      rows: [
        ["neutral", "Most events: created, edited, commented. The default"],
        ["success", "Approved, paid, sent"],
        ["warning", "Due soon, changed after approval"],
        ["danger", "Failed, rejected"],
        ["info", "Synced, scheduled"],
        ["ai", "Anything the assistant did, so people can tell it apart"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "An ordered list in reading order, newest first: a screen reader hears each event, then its time. Icons are decoration.",
    ],
    States: [
      "Loading shows three skeleton rows and says Loading activity to screen readers. Empty says so in words.",
      "Error names the system that failed and keeps any items given, as the last good copy.",
    ],
    Copy: ['Each line names who did what: "[Name] approved 14 [records]". Times as people read them: "Today, 9:41 am".'],
    Rules: ["The assistant's actions take the ai tone, and the words still name the assistant, so the tone is never the only clue."],
  },
  frame: { width: 960, height: 1040 },
  examples: [
    {
      id: "history",
      title: "A record's history",
      layout: "block",
      markup: `<div class="${pane} max-w-xl"><x-import component-from-global-scope="NS.Timeline" items="{{history}}"></x-import></div>`,
      vals: { history },
    },
    {
      id: "error",
      title: "Could not load",
      layout: "block",
      markup: `<div class="${pane} max-w-xl"><x-import component-from-global-scope="NS.Timeline" items="{{recent}}" error="{{historyError}}"></x-import></div>`,
      vals: { recent: history.slice(2), historyError: "[The payroll system] did not respond, so this may be out of date. Showing the copy from 9:12 am." },
    },
    {
      id: "states",
      title: "Loading and empty",
      markup: `<div class="${pane} w-80 self-stretch"><x-import component-from-global-scope="NS.Timeline" items="{{none}}" loading="{{yes}}"></x-import></div>
<div class="${pane} w-80 self-stretch"><x-import component-from-global-scope="NS.Timeline" items="{{none}}"></x-import></div>`,
      vals: { none: [], yes: true },
    },
  ],
  checks: [
    {
      name: "It reads in order for a screen reader: each event, then its time",
      example: "history",
      async run({ scope, expect }) {
        const list = scope.locator('[data-slot="timeline-list"]')
        expect.equal(await list.evaluate((el) => el.tagName), "OL", "an ordered list")
        const read = await list.evaluate((el) => [...el.children].map((li) => li.innerText.split("\n").map((s) => s.trim()).filter(Boolean)))
        expect.equal(read.length, 5, "events in the list")
        expect.equal(read[0].join(" | "), "[Sam Lee] approved [14] timesheets | Today, 9:41 am", "the newest first, its time after it")
        expect.equal(read[4].join(" | "), "[Alex Chen] created the pay run | Mon 2 June, 9:03 am", "the oldest last")
        expect.equal(await scope.getByRole("img").count(), 0, "icons a screen reader would announce")
        expect.equal(await list.locator('svg:not([aria-hidden="true"])').count(), 0, "icons not hidden")
      },
    },
    {
      name: "The assistant's events take the ai tone",
      example: "history",
      async run({ scope, expect }) {
        const ai = scope.locator('[data-slot="timeline-item"][data-tone="ai"]')
        expect.equal(await ai.count(), 1, "events in the ai tone")
        expect((await ai.innerText()).includes("The assistant"), "the words name the assistant too")
      },
    },
    {
      name: "Loading and empty say so in words",
      example: "states",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("status").innerText(), "Loading activity", "the loading status")
        expect.equal((await scope.locator('[data-slot="timeline-empty"]').innerText()).trim(), "No activity yet", "the empty text")
      },
    },
    {
      name: "An error names the system and keeps the last good items",
      example: "error",
      async run({ scope, expect }) {
        expect((await scope.locator('[data-slot="timeline-error"]').innerText()).includes("[The payroll system] did not respond"), "the error names the system")
        expect.equal(await scope.locator('[data-slot="timeline-item"]').count(), 3, "the last good items stay")
      },
    },
  ],
}
