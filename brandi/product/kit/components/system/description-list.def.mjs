// DescriptionList's one definition. Each example sits on a surface, where a record's details live.
const pane = "rounded-md border border-line bg-surface p-5"
const invoice = [
  { label: "Client", value: "[Harbour Physio]" },
  { label: "Status", badge: { label: "Paid", tone: "success" } },
  { label: "Amount", value: "[$4,280.00]" },
  { label: "Due", value: "[14 June 2026]" },
  { label: "Purchase order", value: null },
  { label: "Delivery note", value: "[Leave at the side entrance and ring the bell twice; the front door is for patients only.]" },
]
const person = [
  { label: "Role", value: "[Senior physiotherapist]" },
  { label: "Email", value: "[priya.nair@harbourphysio.example]" },
  { label: "Started", value: "[2 March 2021]" },
  { label: "Payroll", badge: { label: "Needs you", tone: "highlight" } },
  { label: "Manager", value: "", empty: "No manager yet" },
]

const rows = (scope) =>
  scope.locator('[data-slot="description-item"]').evaluateAll((items) =>
    items.map((item) => {
      const dt = item.querySelector("dt").getBoundingClientRect()
      const dd = item.querySelector("dd").getBoundingClientRect()
      return { beside: dt.right <= dd.left && dt.top < dd.bottom && dd.top < dt.bottom, above: dt.bottom <= dd.top + 0.5 }
    })
  )

export default {
  name: "DescriptionList",
  group: "Data",
  job: "Label and value pairs for a record's details, in two columns or stacked.",
  status: "proven",
  props: [
    { name: "items", type: "{ label: string; value?: ReactNode; badge?: { label: string; tone?: BadgeTone }; empty?: string }[]", doc: "The pairs, in order. A missing value shows `empty`, \"Not set\" by default." },
    { name: "layout", type: '"columns" | "stacked"', default: '"columns"', doc: "Columns: label beside value, stacking under 420px of its own width. Stacked: label above value, for side panes." },
    { name: "loading", type: "boolean", default: "false", doc: "The labels stay; each value waits as a skeleton." },
  ],
  notes: {
    Layout: [
      "Columns give the label a third and the value two thirds. Under 420px of its own width the list stacks by itself, label above value, whatever the window.",
      "Long values wrap, unbroken ones (an email, an ID) included, rather than widening the list.",
    ],
    States: [
      'A missing value says so: "Not set", or the item\'s own empty text. Never blank, never a zero nobody measured.',
      "Loading keeps the labels and shows a skeleton for each value; the list is marked busy.",
    ],
    Rules: [
      "Labels in text-subtle, values in text.",
      "A state is a badge with its word, so it never rides on colour alone.",
    ],
  },
  frame: { width: 960, height: 1640 },
  examples: [
    {
      id: "columns",
      title: "Columns",
      layout: "block",
      markup: `<div class="${pane} max-w-2xl"><x-import component-from-global-scope="NS.DescriptionList" items="{{invoice}}"></x-import></div>`,
      vals: { invoice },
    },
    {
      id: "narrow",
      title: "Columns in a 400px pane stack by themselves",
      layout: "block",
      markup: `<div class="${pane} w-fit"><div id="list-pane" style="width: 400px"><x-import component-from-global-scope="NS.DescriptionList" items="{{person}}"></x-import></div></div>`,
      vals: { person },
    },
    {
      id: "stacked",
      title: "Stacked, for a side pane",
      layout: "block",
      markup: `<div class="${pane} w-80"><x-import component-from-global-scope="NS.DescriptionList" items="{{person}}" layout="stacked"></x-import></div>`,
    },
    {
      id: "loading",
      title: "Loading",
      layout: "block",
      markup: `<div class="${pane} max-w-2xl"><x-import component-from-global-scope="NS.DescriptionList" items="{{invoice}}" loading="{{yes}}"></x-import></div>`,
      vals: { yes: true },
    },
  ],
  checks: [
    {
      name: "Columns sit side by side on a wide list",
      example: "columns",
      async run({ scope, expect }) {
        for (const row of await rows(scope)) expect(row.beside, "label beside its value")
      },
    },
    {
      name: "Under 420px of its own width the list stacks, label above value",
      example: "narrow",
      viewport: { width: 1440, height: 900 },
      async run({ page, scope, expect }) {
        for (const row of await rows(scope)) expect(row.above, "label above its value at 400px")
        const pane = page.locator("#list-pane")
        await pane.evaluate((el) => (el.style.width = "419px"))
        for (const row of await rows(scope)) expect(row.above, "label above its value at 419px")
        await pane.evaluate((el) => (el.style.width = "420px"))
        for (const row of await rows(scope)) expect(row.beside, "label beside its value at 420px")
      },
    },
    {
      name: "A missing value says so, never blank",
      async run({ page, expect }) {
        const value = (example, label) =>
          page.locator(`[data-example="${example}"] [data-slot="description-item"]`, { hasText: label }).locator("dd").innerText()
        expect.equal((await value("columns", "Purchase order")).trim(), "Not set", "the default")
        expect.equal((await value("narrow", "Manager")).trim(), "No manager yet", "an item's own empty text")
      },
    },
    {
      name: "Labels are text-subtle and values text, in both themes",
      example: "columns",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const [label, subtle, value, text] = await scope.locator('[data-slot="description-list"]').evaluate((el) => {
          const probe = (v) => {
            const s = document.createElement("span")
            s.style.color = `var(${v})`
            el.append(s)
            const c = getComputedStyle(s).color
            s.remove()
            return c
          }
          return [getComputedStyle(el.querySelector("dt")).color, probe("--text-subtle"), getComputedStyle(el.querySelector("dd")).color, probe("--text")]
        })
        expect.equal(label, subtle, "the label's colour")
        expect.equal(value, text, "the value's colour")
      },
    },
    {
      name: "Loading keeps the labels, marks the list busy and waits with skeletons",
      example: "loading",
      async run({ scope, expect }) {
        const list = scope.locator('[data-slot="description-list"]')
        expect.equal(await list.getAttribute("aria-busy"), "true", "the list is busy")
        expect.equal(await list.locator("dt").first().innerText(), "Client", "the first label")
        expect.equal(await list.locator('dd [data-slot="skeleton"]').count(), 6, "a skeleton for each value")
      },
    },
  ],
}
