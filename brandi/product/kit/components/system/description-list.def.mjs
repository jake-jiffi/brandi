// DescriptionList's one definition. Each example sits on a surface, where a record's details live.
const pane = "rounded-md border border-line bg-surface p-5"
const invoice = [
  { label: "Client", value: "[Harbour Physio]" },
  { label: "Status", badge: { label: "Paid", tone: "success" } },
  { label: "Amount", value: "[$4,280.00]" },
  { label: "Due", value: "[14 June 2026]" },
  { label: "Reminder", value: "[Sent 2 June]", badge: { label: "Opened", tone: "info" } },
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
const order = [
  { label: "[2] × [Large flat white]", value: "[$11.00]" },
  { label: "[1] × [Toasted banana bread with whipped butter and honey]", value: "[$8.50]" },
  // Long enough to wrap at a phone's width, as an address or a note does.
  { label: "Deliver to", value: "[Unit 4, 14 Harbour Street, Bondi: leave it with reception]" },
  { label: "Delivery", value: "[$4.90]" },
  { label: "Total", value: "[$24.40]", total: true },
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
    { name: "items", type: "{ label: string; value?: ReactNode; badge?: { label: string; tone?: BadgeTone }; empty?: string; total?: boolean }[]", doc: "The pairs, in order. A missing value shows `empty`, \"Not set\" by default. A badge shows on its own, or after the value when both are given. `total` marks the sum of the items above it: under a rule, in the strong style." },
    { name: "layout", type: '"columns" | "stacked" | "lines"', default: '"columns"', doc: "Columns: label beside value, stacking under 420px of its own width. Stacked: label above value, for side panes. Lines: label and value on one line at any width, the value at the end in tabular figures, for order lines, a receipt or a breakdown." },
    { name: "loading", type: "boolean", default: "false", doc: "The labels stay; each value waits as a skeleton." },
  ],
  notes: {
    Layout: [
      "Columns give the label a third and the value two thirds. Under 420px of its own width the list stacks by itself, label above value, whatever the window.",
      "Long values wrap, unbroken ones (an email, an ID) included, rather than widening the list.",
      "Lines keep each label and its value on one line at any width, a phone's included: the value at the end, in tabular figures, and a long label wraps beside it. A value takes up to two thirds of the line, and a longer one wraps there, left-aligned: its box sits at the end of the line, and its lines start at the box's left. The label is the line itself, so it takes the text colour. A total sits under a rule in text-strong.",
    ],
    States: [
      'A missing value says so: "Not set", or the item\'s own empty text. Never blank, never a zero nobody measured.',
      "Loading keeps the labels and shows a skeleton for each value; the list is marked busy.",
    ],
    Rules: [
      "Labels in text-subtle, values in text.",
      "A state is a badge with its word, so it never rides on colour alone.",
      "Order lines, a receipt, a price breakdown: lines, never columns, a List or a DataTable, which all put the value under its label on a phone.",
    ],
    Review: [
      "A checkout's order lines read as a form at 358px, each price under its label and left-aligned, so a run drew the receipt by hand (a proof run, round 2). Lines hold label and value on one line at any width.",
      "A value that wrapped in lines read right-aligned, its lines ragged on the left (a proof run, round 3). A wrapped value now reads from the left, its box still at the end.",
    ],
  },
  frame: { width: 960, height: 1970 },
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
      id: "lines",
      title: "Lines, for an order on a phone, with its total",
      layout: "block",
      markup: `<div class="${pane} w-fit"><div id="lines-pane" style="width: 318px"><x-import component-from-global-scope="NS.DescriptionList" items="{{order}}" layout="lines"></x-import></div></div>`,
      vals: { order },
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
      name: "An item with a value and a badge shows both, the value first",
      example: "columns",
      async run({ scope, expect }) {
        const item = scope.locator('[data-slot="description-item"]').filter({ hasText: "Reminder" })
        expect.equal((await item.locator("dd").innerText()).replace(/\s+/g, " ").trim(), "[Sent 2 June] Opened", "the value, then its state")
        expect.equal(await item.locator('[data-slot="badge"]').count(), 1, "the state is a badge")
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
      name: "Lines keep each label and value on one line at any width, the value at the end in tabular figures",
      example: "lines",
      async run({ page, scope, expect }) {
        const list = scope.locator('[data-slot="description-list"]')
        for (const width of [600, 318, 240]) {
          await page.locator("#lines-pane").evaluate((el, w) => (el.style.width = `${w}px`), width)
          const lines = await list.evaluate((el) => {
            const end = el.getBoundingClientRect().right
            return [...el.querySelectorAll('[data-slot="description-item"]')].map((item) => {
              const dt = item.querySelector("dt").getBoundingClientRect()
              const dd = item.querySelector("dd").getBoundingClientRect()
              return { label: item.querySelector("dt").textContent, beside: dt.right <= dd.left && dd.top < dt.bottom, atEnd: Math.abs(dd.right - end) <= 1, figures: getComputedStyle(item.querySelector("dd")).fontVariantNumeric, firstLine: Math.abs(dd.top - dt.top) <= 4 }
            })
          })
          expect(await list.evaluate((el) => el.scrollWidth <= el.clientWidth), `nothing runs past the list at ${width}px`)
          for (const l of lines) {
            expect(l.beside, `${l.label}: its value beside it at ${width}px`)
            expect(l.atEnd, `${l.label}: its value at the end of the line at ${width}px`)
            expect(l.figures.includes("tabular-nums"), `${l.label}: its value in tabular figures`)
            expect(l.firstLine, `${l.label}: its value on the label's first line at ${width}px`)
          }
        }
        const long = await list.locator("dt").nth(1).evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)))
        expect.atLeast(long, 2, "at 240px a long label wraps beside its value rather than pushing it out")
      },
    },
    {
      name: "In lines a value that wraps reads left-aligned, its box still at the end of the line (a proof run)",
      example: "lines",
      async run({ scope, expect }) {
        const item = scope.locator('[data-slot="description-item"]').filter({ hasText: "Deliver to" })
        const { starts, left, right, end } = await item.evaluate((el) => {
          const dd = el.querySelector("dd")
          const range = document.createRange()
          range.selectNodeContents(dd)
          // One box per line of text: where each line starts.
          const byLine = new Map()
          for (const r of range.getClientRects()) if (r.width > 0) byLine.set(Math.round(r.top), Math.min(byLine.get(Math.round(r.top)) ?? Infinity, r.left))
          const box = dd.getBoundingClientRect()
          return { starts: [...byLine.values()], left: box.left, right: box.right, end: el.closest('[data-slot="description-list"]').getBoundingClientRect().right }
        })
        expect.atLeast(starts.length, 2, "the value wraps at 318px")
        for (const [i, x] of starts.entries()) expect(Math.abs(x - left) <= 1, `line ${i + 1} starts at the value's left edge (${Math.round(x - left)}px in)`)
        expect(Math.abs(right - end) <= 1, "the value's box still ends at the line's end")
      },
    },
    {
      name: "In lines the total sits under a rule, label and value in text-strong",
      example: "lines",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const total = scope.locator('[data-slot="description-item"][data-total]')
        expect.equal(await total.count(), 1, "one total")
        const look = await total.evaluate((el) => {
          const probe = (v) => {
            const s = document.createElement("span")
            s.style.color = `var(${v})`
            el.append(s)
            const c = getComputedStyle(s).color
            s.remove()
            return c
          }
          const s = getComputedStyle(el)
          const list = el.closest('[data-slot="description-list"]').getBoundingClientRect()
          const box = el.getBoundingClientRect()
          return { edge: s.borderTopWidth, edgeColour: s.borderTopColor, strongLine: probe("--line-strong"), dt: getComputedStyle(el.querySelector("dt")).color, dd: getComputedStyle(el.querySelector("dd")).color, strong: probe("--text-strong"), spans: Math.abs(box.left - list.left) <= 1 && Math.abs(box.right - list.right) <= 1 }
        })
        expect.equal(look.edge, "1px", "a rule above the total")
        expect.equal(look.edgeColour, look.strongLine, "drawn in line-strong")
        expect(look.spans, "the rule runs the list's width")
        expect.equal(look.dt, look.strong, "the total's label")
        expect.equal(look.dd, look.strong, "the total's value")
        expect.equal(await scope.locator('[data-slot="description-item"]:not([data-total])').evaluateAll((els) => els.filter((el) => getComputedStyle(el).borderTopWidth !== "0px").length), 0, "no hairline between the lines above it")
      },
    },
    {
      name: "Loading keeps the labels, marks the list busy and waits with skeletons",
      example: "loading",
      async run({ scope, expect }) {
        const list = scope.locator('[data-slot="description-list"]')
        expect.equal(await list.getAttribute("aria-busy"), "true", "the list is busy")
        expect.equal(await list.locator("dt").first().innerText(), "Client", "the first label")
        expect.equal(await list.locator('dd [data-slot="skeleton"]').count(), invoice.length, "a skeleton for each value")
      },
    },
  ],
}
