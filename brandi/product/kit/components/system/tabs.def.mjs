// Tabs' one definition: its README, its preview board and its scripted checks all come from here.

const probe = (el, prop, value) => {
  const p = document.createElement("span")
  p.style[prop] = value
  el.appendChild(p)
  const want = getComputedStyle(p)[prop]
  p.remove()
  return want
}

const invoiceTabs = [
  "Overview",
  { label: "Line items", count: 12 },
  { label: "Payments", count: 3, attention: true, countLabel: "3 overdue" },
  "Activity",
]

export default {
  name: "Tabs",
  group: "Navigation",
  job: "Sections of one page or record, with optional counts.",
  status: "proven",
  props: [
    { name: "tabs", type: "Array<string | TabOption>", doc: "Strings, or { value, label, count, countLabel, attention, icon, id, panelId }. Two to seven." },
    { name: "value", type: "string", doc: "The open tab, read from the URL." },
    { name: "defaultValue", type: "string", doc: "The tab open at first when nothing controls it. The first tab by default." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the new value. Put it in the URL." },
    { name: "label", type: "string", doc: "Names the row of tabs for a screen reader: Invoice sections." },
    { name: "children", type: "ReactNode", doc: "The open tab's panel. Leave it out when the page renders the panel itself, with the tab's id and panelId." },
  ],
  tables: [
    {
      title: "A tab's fields",
      head: ["Field", "What it does"],
      rows: [
        ["value", "URL-friendly: the label as a slug by default, so Line items is line-items"],
        ["count", "Shown beside the label. Zero shows nothing"],
        ["countLabel", "What a screen reader hears for the count: 3 overdue. 12 items by default, or 3 need you with attention"],
        ["attention", "The count waits on the reader, so it takes the highlight, as on the rail"],
        ["id, panelId", "For a panel the page renders elsewhere: the panel takes role tabpanel and aria-labelledby the tab's id"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "Tab enters at the open tab. Left, Right, Home and End move the selection and the focus together.",
      "Each tab has an id and a panelId, and its panel has role tabpanel and aria-labelledby, with its own focus ring.",
      "A count is read as words: Line items, 12 items. When the tabs do not fit, the row scrolls sideways and the tab in hand scrolls into view.",
    ],
    Layout: ["Underlined: a full-width row on a hairline, with the first label flush with the title above it. Focus is drawn inside the tab, because the row scrolls and would clip a ring drawn outside it."],
    States: ["The open tab takes text-strong and a 2px primary underline. An attention count takes the highlight."],
    Rules: ["Two to seven tabs. Each keeps its own scroll and filters, and the open tab is in the URL."],
    Review: [
      "Arrows moved the selection but not the focus (round 1).",
      "A tab opened from the URL showed an empty record in the starter (round 4).",
      "A grey count meant nothing to a screen reader (round 5).",
    ],
  },
  frame: { width: 960, height: 420 },
  examples: [
    {
      id: "counts",
      title: "With counts, opened from the URL",
      markup: `<x-import component-from-global-scope="NS.Tabs" label="Invoice sections" tabs="{{invoiceTabs}}" value="{{tab}}" on-change="{{setTab}}">
<p style="margin: 0; max-width: 34em;" data-tabs-panel-text="">{{panelText}}</p>
</x-import>
<p style="margin: 12px 0 0; color: var(--text-muted);" data-tabs-output="">In the address: ?tab={{tab}}</p>`,
      layout: "block",
      vals: { invoiceTabs },
    },
    {
      id: "icons",
      title: "With icons, the panel rendered by the page",
      markup: `<x-import component-from-global-scope="NS.Tabs" label="Client sections" tabs="{{iconTabs}}"></x-import>`,
      layout: "block",
      vals: {
        iconTabs: [
          { label: "Details", icon: "FileText" },
          { label: "Invoices", icon: "Receipt", count: 8 },
          { label: "Pets", icon: "Heart", count: 2 },
          { label: "History", icon: "History" },
        ],
      },
    },
    {
      id: "overflow",
      title: "When they do not fit, the row scrolls sideways",
      width: 280,
      markup: `<x-import component-from-global-scope="NS.Tabs" label="Settings sections" tabs="{{manyTabs}}"></x-import>`,
      layout: "block",
      vals: { manyTabs: ["Profile", "Notifications", "Billing", "Security", "Integrations", "Team", "Data and privacy"] },
    },
  ],
  state: { tab: "line-items" },
  logic: `tab: self.state.tab,
  setTab: (value) => self.setState({ tab: value }),
  panelText: ({
    overview: "[Invoice 1042] for [Muddy Paws Grooming], sent on [3 October] and due on [17 October].",
    "line-items": "12 line items, from the March grooming package to a late fee.",
    payments: "3 payments are overdue. The next reminder goes out on the due date.",
    activity: "Opened twice by the client. Sent on [3 October].",
  })[self.state.tab]`,
  checks: [
    {
      name: "Tab enters at the open tab",
      example: "counts",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent)
        expect.equal(focused, "Line items, 12 items", "the first Tab lands on the open tab")
      },
    },
    {
      name: "Left, Right, Home and End move the selection and the focus together (round 1)",
      example: "counts",
      async run({ page, scope, expect }) {
        await scope.getByRole("tab", { selected: true }).focus()
        // Radix moves focus in a timeout, so wait for focus and selection to land together.
        const together = (want) =>
          page
            .waitForFunction(
              (w) => {
                const selected = document.querySelector("[data-example=counts] [role=tab][aria-selected=true]")
                return selected && selected === document.activeElement && selected.id.endsWith(`-tab-${w}`)
              },
              want,
              { timeout: 5000 }
            )
            .then(() => true, () => false)
        for (const [key, want] of [["ArrowRight", "payments"], ["End", "activity"], ["Home", "overview"], ["ArrowLeft", "activity"]]) {
          await page.keyboard.press(key)
          expect(await together(want), `${key}: focus and selection move together to ${want}`)
          expect.equal(await scope.locator("[data-tabs-output]").textContent(), `In the address: ?tab=${want}`, `${key}: the value for the URL`)
        }
      },
    },
    {
      name: "Values are URL-friendly, and the open tab's panel is a tabpanel labelled by its tab (round 4)",
      example: "counts",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("[data-tabs-output]").textContent(), "In the address: ?tab=line-items", "Line items is line-items")
        const tab = scope.getByRole("tab", { selected: true })
        const panel = scope.getByRole("tabpanel")
        expect.equal(await panel.getAttribute("aria-labelledby"), await tab.getAttribute("id"), "the panel is labelled by the open tab")
        expect.equal(await tab.getAttribute("aria-controls"), await panel.getAttribute("id"), "the tab controls the panel")
        expect((await panel.textContent()).trim().startsWith("12 line items"), "the panel opened from the URL shows its content")
        expect.equal(await panel.getAttribute("tabindex"), "0", "the panel takes focus")
      },
    },
    {
      name: "A count is read as words (round 5)",
      example: "counts",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("tab", { name: "Line items, 12 items" }).count(), 1, "Line items, 12 items")
        expect.equal(await scope.getByRole("tab", { name: "Payments, 3 overdue" }).count(), 1, "Payments, 3 overdue")
        expect.equal(await page.locator("[data-example=icons]").getByRole("tab", { name: "Pets, 2 items" }).count(), 1, "Pets, 2 items")
        expect.equal(await scope.getByRole("tab", { name: "Overview", exact: true }).count(), 1, "a tab without a count keeps its label")
      },
    },
    {
      name: "The open tab takes text-strong and a 2px primary underline, and an attention count the highlight",
      example: "counts",
      async run({ scope, expect }) {
        const tab = scope.getByRole("tab", { selected: true })
        const [colour, strong, line, primary, height] = await tab.evaluate((el, p) => {
          const probe = new Function(`return (${p})`)()
          const after = getComputedStyle(el, "::after")
          return [getComputedStyle(el).color, probe(el, "color", "var(--text-strong)"), after.backgroundColor, probe(el, "color", "var(--primary)"), after.height]
        }, probe.toString())
        expect.equal(colour, strong, "the open tab's text colour")
        expect.equal(line, primary, "the underline's colour")
        expect.equal(height, "2px", "the underline's weight")
        const chip = scope.getByRole("tab", { name: "Payments, 3 overdue" }).locator("[data-slot=tabs-count]")
        const [bg, highlight] = await chip.evaluate((el, p) => {
          const probe = new Function(`return (${p})`)()
          return [getComputedStyle(el).backgroundColor, probe(el, "backgroundColor", "var(--highlight)")]
        }, probe.toString())
        expect.equal(bg, highlight, "the attention count's fill")
      },
    },
    {
      name: "Focus is drawn inside the tab, so the scrolling row never clips it, in both themes",
      example: "counts",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const tab = scope.getByRole("tab", { selected: true })
        const [style, offset] = await tab.evaluate((el) => [getComputedStyle(el).outlineStyle, getComputedStyle(el).outlineOffset])
        expect.equal(style, "solid", "a focus ring from the keyboard")
        expect.equal(offset, "-2px", "drawn inside the tab")
      },
    },
    {
      name: "When the tabs do not fit, the row scrolls sideways and the tab in hand scrolls into view",
      example: "overflow",
      async run({ page, scope, expect }) {
        const list = scope.getByRole("tablist", { name: "Settings sections" })
        expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth), "the row is wider than its box")
        await scope.getByRole("tab", { selected: true }).focus()
        await page.keyboard.press("End")
        const last = scope.getByRole("tab", { name: "Data and privacy" })
        const selected = await last.evaluate((el) => new Promise((done) => {
          const start = Date.now()
          const look = () => (el.getAttribute("aria-selected") === "true" && el === document.activeElement ? done(true) : Date.now() - start > 5000 ? done(false) : setTimeout(look, 25))
          look()
        }))
        expect(selected, "End selects and focuses the last tab")
        const [l, t] = await Promise.all([list.boundingBox(), last.boundingBox()])
        expect(t.x >= l.x - 1 && t.x + t.width <= l.x + l.width + 1, "the last tab is in view")
      },
    },
    {
      name: "In forced colours the open tab keeps its underline and nothing else is outlined",
      example: "counts",
      forcedColors: true,
      async run({ scope, expect }) {
        const open = await scope.getByRole("tab", { selected: true }).evaluate((el) => getComputedStyle(el, "::after").backgroundColor)
        expect(open !== "rgba(0, 0, 0, 0)" && open !== "transparent", `the open tab's underline is painted (${open})`)
        expect.equal(await scope.getByRole("tab", { name: "Overview" }).evaluate((el) => getComputedStyle(el).outlineStyle), "none", "a closed tab has no outline at rest")
      },
    },
    {
      name: "Tabs are 40px tall, on a touch screen too",
      example: "icons",
      touch: true,
      async run({ scope, expect }) {
        for (const tab of await scope.getByRole("tab").all()) expect.equal(Math.round((await tab.boundingBox()).height), 40, "tab height on touch")
      },
    },
  ],
}
