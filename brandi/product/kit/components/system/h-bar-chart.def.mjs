// HBarChart's one definition: its README, its preview board and its scripted checks all come from here.
import { chartChecks as c } from "./chart-figure.def.mjs"

const clients = [
  { label: "[Harbour Electrical]", value: 8240 },
  { label: "[Northside Plumbing]", value: 21480.5 },
  { label: "[Westgate Builders]", value: 7910 },
  { label: "[Bayview Strata]", value: 5120 },
  { label: "[Kingsford Cafe]", value: 2380.75 },
  { label: "[Elm Street Dental]", value: 1960 },
]
const ranked = [...clients].sort((a, b) => b.value - a.value)
const suburbs = ["Newtown", "Marrickville", "Glebe", "Leichhardt", "Annandale", "Petersham", "Stanmore", "Enmore", "Camperdown", "Erskineville", "Tempe", "Dulwich Hill", "Lewisham", "Summer Hill"]

export default {
  name: "HBarChart",
  group: "Charts",
  job: "A ranked top N with direct labels and values: the clearest way to compare named things.",
  status: "proven",
  props: [
    { name: "data", type: "Array<{ label: string; value: number | null }>", doc: "The named things and their values, in any order: the chart sorts them descending. null or missing is no data, said in words and drawn as no bar." },
    { name: "format", type: "NumberStyle", default: '"number"', doc: "The style for the printed values. Exact: they are the numbers a screen reader hears." },
    { name: "max", type: "number", doc: "The value a full-length bar stands for, such as 100 for percentages. Defaults to the largest value." },
    { name: "color", type: "ChartSlot", default: "1", doc: "The series slot for the bars, 1 to 6. Other is always grey." },
    { name: "title", type: "string", doc: "What the list ranks: its accessible name. Inside a ChartFigure, the figure's heading does this." },
    { name: "summary", type: "string", doc: "The takeaway in one sentence: the list's accessible description. Inside a ChartFigure, the figure's takeaway." },
    { name: "state", type: '"ready" | "loading" | "empty" | "error"', default: '"ready"', doc: "loading shows skeleton rows. empty and error show their message in their place." },
    { name: "empty", type: "string", default: '"No data for this period."', doc: "What the empty state says. It shows by itself whenever there is no data." },
    { name: "error", type: "string", doc: "What the error state says. Name the system that failed." },
    { name: "onRetry", type: "() => void", doc: "Adds Try again to the error state." },
  ],
  notes: {
    Behaviour: [
      "An ordered list to a screen reader, each label read with its value: \"[Northside Plumbing]: $21,480.50\". The bars are hidden from it.",
      "It takes no focus: every label and value is printed, so there is nothing for the keyboard to reveal and no tooltip to open.",
    ],
    Layout: [
      "Labels in a column up to 40% of the width, wrapping rather than cut short. Each value sits 8px past its bar's tip, and the scale leaves room for the widest one.",
      "Under 480px of its own width, each label moves above its bar.",
    ],
    States: [
      "loading shows five skeleton rows. empty shows its message by itself. error shows its message, with Try again when onRetry is given.",
      "A missing value says No data and draws no bar, and sorts last. A real zero prints 0.",
    ],
    Rules: [
      "Sorted descending, ten rows at most: the rest folds into a grey Other row with its count. When the rest matters, link to the full table beside the chart.",
      "One colour for every bar, series-1 by default: the length carries the value, so colour never ranks.",
      "Bars are 12px with a 4px rounded tip, square at the baseline. Negative values extend left of a zero line.",
      "Pass `max` when the values have a known ceiling, such as utilisation out of 100%.",
    ],
    Review: [
      "Charts drew missing data as zero, and negative values vanished (round 1).",
      "Charts had no text alternative (round 3). Here the printed list is the alternative.",
      "Chart text fell under 4.5:1 in dark (round 4): labels and values are measured in both themes.",
    ],
  },
  frame: { width: 960, height: 2250 },
  logic: "retry: () => {}",
  examples: [
    {
      id: "ranked",
      title: "Ranked, in a figure",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Top clients by revenue" summary="[Northside Plumbing] brought in more than the next two clients together.">
<x-import component-from-global-scope="NS.HBarChart" data="{{clients}}" format="currency"></x-import>
</x-import>`,
      vals: { clients },
    },
    {
      id: "other",
      title: "More than ten rows fold into Other",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Jobs by suburb" summary="Five suburbs account for most jobs this quarter.">
<x-import component-from-global-scope="NS.HBarChart" data="{{suburbs}}"></x-import>
</x-import>`,
      vals: { suburbs: suburbs.map((s, i) => ({ label: `[${s}]`, value: [64, 58, 51, 47, 40, 22, 19, 17, 15, 12, 9, 8, 6, 4][i] })) },
    },
    {
      id: "max",
      title: "Against a fixed maximum, with a real zero and a missing value",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Booking utilisation by groomer" summary="[Sam] is close to fully booked; [Alex]'s roster has not synced.">
<x-import component-from-global-scope="NS.HBarChart" data="{{utilisation}}" format="percent" max="{{hundred}}"></x-import>
</x-import>`,
      vals: {
        hundred: 100,
        utilisation: [
          { label: "[Sam]", value: 94.5 },
          { label: "[Priya]", value: 81 },
          { label: "[Alex]", value: null },
          { label: "[Jordan]", value: 66.25 },
          { label: "[Mei]", value: 0 },
        ],
      },
    },
    {
      id: "negative",
      title: "Negative values",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Profit by service" summary="Emergency call-outs lost money this quarter.">
<x-import component-from-global-scope="NS.HBarChart" data="{{profit}}" format="currency"></x-import>
</x-import>`,
      vals: {
        profit: [
          { label: "Maintenance plans", value: 12400 },
          { label: "Installations", value: 8650 },
          { label: "Repairs", value: 3120 },
          { label: "Emergency call-outs", value: -2340.5 },
        ],
      },
    },
    {
      id: "narrow",
      title: "A narrow container",
      width: 320,
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Top clients by revenue" summary="[Northside Plumbing] leads.">
<x-import component-from-global-scope="NS.HBarChart" data="{{clients}}" format="currency"></x-import>
</x-import>`,
    },
    {
      id: "states",
      title: "Loading, empty and error",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;">
<x-import component-from-global-scope="NS.ChartFigure" title="Top clients by revenue" summary="The clients who paid most this quarter.">
<x-import component-from-global-scope="NS.HBarChart" data="{{clients}}" state="loading"></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Top clients by revenue" summary="The clients who paid most this quarter.">
<x-import component-from-global-scope="NS.HBarChart" data="{{noClients}}" empty="No paid invoices in this period."></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Top clients by revenue" summary="The clients who paid most this quarter.">
<x-import component-from-global-scope="NS.HBarChart" data="{{clients}}" state="error" error="[Accounting system] is not responding." on-retry="{{retry}}"></x-import>
</x-import>
</div>`,
      vals: { noClients: [] },
    },
  ],
  checks: [
    {
      name: "An ordered list to a screen reader, named by the figure, each label read with its value",
      example: "ranked",
      async run({ scope, expect }) {
        const list = scope.getByRole("list", { name: "Top clients by revenue" })
        expect.equal(await list.evaluate((el) => el.tagName), "OL", "an ordered list")
        const items = await list.locator("li").allTextContents()
        expect.equal(JSON.stringify(items), JSON.stringify(ranked.map((r) => `${r.label}: ${c.formatNumber(r.value, "currency")}`)), "each label with its exact value")
        expect.equal(await scope.locator('[data-slot="chart-bar"][aria-hidden="true"], [aria-hidden="true"] [data-slot="chart-bar"]').count(), 6, "the bars are hidden from screen readers")
      },
    },
    {
      name: "Sorted descending, whatever order the data came in, with the longest bar for the largest",
      example: "ranked",
      async run({ scope, expect }) {
        expect.equal((await scope.locator('[data-slot="h-bar-label"]').allTextContents()).join("|"), ranked.map((r) => `${r.label}: `).join("|"), "largest first")
        const widths = await scope.locator('[data-slot="chart-bar"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width))
        for (let k = 1; k < widths.length; k++) expect(widths[k] <= widths[k - 1] + 0.5, "each bar is no longer than the one above")
      },
    },
    {
      name: "Each value sits 8px past its bar's tip",
      example: "ranked",
      async run({ scope, expect }) {
        for (const row of await scope.locator('[data-slot="h-bar-row"]').all()) {
          const bar = await row.locator('[data-slot="chart-bar"]').boundingBox()
          const value = await row.locator('[data-slot="h-bar-value"]').boundingBox()
          expect(Math.abs(value.x - (bar.x + bar.width + 8)) <= 1.5, `the value starts 8px past the tip (${Math.round(value.x - bar.x - bar.width)}px)`)
        }
      },
    },
    {
      name: "Ten rows at most: the rest folds into a grey Other row",
      example: "other",
      async run({ page, scope, expect }) {
        const items = await scope.locator("ol > li").allTextContents()
        expect.equal(items.length, 10, "ten rows")
        expect.equal(items[9], "Other (5): 39", "the last five fold into Other, summed")
        const other = scope.locator('[data-slot="h-bar-row"]').last().locator('[data-slot="chart-bar"] rect').first()
        expect.equal(await c.paint(other, "fill"), await c.colour(page, "--chart-compare"), "Other is grey")
      },
    },
    {
      name: "A missing value says No data and draws no bar, a real zero prints 0, and a full bar stands for max",
      example: "max",
      async run({ scope, expect }) {
        const rows = scope.locator('[data-slot="h-bar-row"]')
        expect.equal(await rows.last().textContent(), "[Alex]: No data", "the missing value sorts last and says so")
        expect.equal(await rows.last().locator('[data-slot="chart-bar"]').count(), 0, "no bar for the missing value")
        expect.equal(await rows.nth(3).textContent(), "[Mei]: 0%", "a real zero prints 0")
        expect.equal(await rows.nth(3).locator('[data-slot="chart-bar"]').count(), 0, "and draws no bar")
        const share = await rows.first().locator('[data-slot="chart-bar"]').evaluate((el) => el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width)
        expect(Math.abs(share - 0.945) < 0.005, `94.5 of a max of 100 fills 94.5% of the scale (${share.toFixed(3)})`)
      },
    },
    {
      name: "Negative values extend left of a zero line, with their value on the left",
      example: "negative",
      async run({ scope, expect }) {
        const zero = await scope.locator('[data-slot="chart-zero"]').first().boundingBox()
        const row = scope.locator('[data-slot="h-bar-row"]').last()
        const bar = await row.locator('[data-slot="chart-bar"]').boundingBox()
        const value = await row.locator('[data-slot="h-bar-value"]').boundingBox()
        expect(Math.abs(bar.x + bar.width - zero.x) <= 1.5, "the negative bar ends at the zero line")
        expect(value.x + value.width <= bar.x, "its value sits past its tip, on the left")
        const up = await scope.locator('[data-slot="h-bar-row"]').first().locator('[data-slot="chart-bar"]').boundingBox()
        expect(Math.abs(up.x - zero.x) <= 1.5, "a positive bar starts at the zero line")
      },
    },
    {
      name: "Labels and values hold 4.5:1 against the surface, in both themes",
      themes: ["light", "dark"],
      async run({ page, expect }) {
        const ratios = await c.contrast(page.locator('[data-slot="h-bar-label"], [data-slot="h-bar-value"]'))
        expect.atLeast(ratios.length, 50, "chart text measured")
        for (const r of ratios) expect.atLeast(r.ratio, 4.5, `"${r.text}"`)
      },
    },
    {
      name: "In a narrow container each label sits above its bar, by its own width",
      example: "narrow",
      async run({ scope, expect }) {
        for (const row of await scope.locator('[data-slot="h-bar-row"]').all()) {
          const label = await row.locator('[data-slot="h-bar-label"]').boundingBox()
          const bar = await row.locator('[data-slot="chart-bar"]').boundingBox()
          expect(label.y + label.height <= bar.y + 0.5, "the label is above the bar")
        }
      },
    },
    {
      name: "Loading, empty and error render in the list's place",
      example: "states",
      async run({ scope, expect }) {
        expect.atLeast(await scope.locator('[data-slot="chart-status"][data-state="loading"] [data-slot="skeleton"]').count(), 5, "loading is skeleton rows")
        expect.equal(await scope.locator('[data-slot="chart-status"][data-state="empty"]').innerText(), "No paid invoices in this period.", "empty shows its message by itself")
        const error = scope.locator('[data-slot="chart-status"][data-state="error"]')
        expect((await error.innerText()).includes("[Accounting system] is not responding."), "error names the system")
        expect.equal(await error.getByRole("button", { name: "Try again" }).count(), 1, "Try again, when onRetry is given")
        expect.equal(await scope.locator("ol").count(), 0, "no list in any of the three")
      },
    },
    {
      name: "Under reduced motion the loading rows hold still",
      example: "states",
      reducedMotion: true,
      async run({ scope, expect }) {
        const names = await scope.locator('[data-slot="skeleton"]').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName))
        expect(names.length && names.every((n) => n === "none"), "no pulse")
      },
    },
    {
      name: "In forced colours the bars keep their colour, and the text takes the system's",
      example: "ranked",
      forcedColors: true,
      async run({ page, scope, expect }) {
        expect.equal(await c.paint(scope.locator('[data-slot="chart-bar"] rect').first(), "fill"), await c.colour(page, "--series-1"), "a bar keeps series-1")
        expect.equal(await c.paint(scope.locator('[data-slot="h-bar-label"]').first(), "color"), await c.colour(page, "CanvasText"), "labels are CanvasText")
      },
    },
  ],
}
