// BarChart's one definition: its README, its preview board and its scripted checks all come from here.
import { chartChecks as c } from "./chart-figure.def.mjs"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
const revenue = [12400.5, 9800, 13150, 14920.25, 16310, 18240]
const callbacks = [3, 2, 0, 4, null, 1, 2, 3]
const money = (v) => c.formatNumber(v, "currency")

export default {
  name: "BarChart",
  group: "Charts",
  job: "Amounts across categories or days, grouped or stacked.",
  status: "proven",
  props: [
    { name: "data", type: "Array<{ label, value } | { label, values: { [key]: number | null } }>", doc: "One item per category or day. null or a missing key is no data: the bar is skipped, never drawn as zero." },
    { name: "series", type: "Array<{ key, label, color?, compare? }>", doc: "The series in `values`. Slots go series-1 to series-6 in this order, never by rank. `color` pins a slot so a thing keeps its colour. A seventh series folds into Other. `compare` draws a grey dashed marker." },
    { name: "stacked", type: "boolean", default: "false", doc: "One bar per category, the series stacked in it. Only when the parts make a whole." },
    { name: "labels", type: '"auto" | "end" | "none"', default: '"auto"', doc: "For a stack: auto names two to four stacked series beside the last bar, end names every one, none leaves it to the legend." },
    { name: "title", type: "string", doc: "What the chart shows: its accessible name and the hidden table's caption. Inside a ChartFigure, the figure's heading does this." },
    { name: "summary", type: "string", doc: "The takeaway in one sentence: the chart's accessible description. Inside a ChartFigure, the figure's takeaway." },
    { name: "state", type: '"ready" | "loading" | "empty" | "error"', default: '"ready"', doc: "loading shows a skeleton the chart's size. empty and error show their message in its place." },
    { name: "empty", type: "string", default: '"No data for this period."', doc: "What the empty state says. It shows by itself whenever there is no data." },
    { name: "error", type: "string", doc: "What the error state says. Name the system that failed and what happens next." },
    { name: "onRetry", type: "() => void", doc: "Adds Try again to the error state." },
    { name: "height", type: "number", default: "240", doc: "The chart's height in px, category labels included. The legend sits above it." },
    { name: "format", type: "NumberStyle", default: '"number"', doc: "The exact style for the tooltip, the announcement and the hidden table." },
    { name: "axisFormat", type: "NumberStyle", doc: "The rounded style on the axis. Defaults to the compact form of format: currency becomes compact-currency, number becomes compact." },
    { name: "labelHeading", type: "string", default: '"Category"', doc: "The hidden table's first column heading, such as Month." },
  ],
  notes: {
    Behaviour: [
      "The plot takes focus. Left and Right step through the bars, Home and End jump to the ends, and Escape hides the tooltip. Each step shows the tooltip and is announced through a polite live region: \"Jun: Online 205, Phone 80, Walk-in 36, total 321. 6 of 6.\"",
      "The pointer shows the same tooltip and announces nothing. A tap shows it on a touch screen. The hit area is the whole category band, not the bar.",
      "Screen readers hear the plot's name, the title, then its description: the takeaway and the keys to use. Every number is in the hidden table, whose first column names each row.",
    ],
    Layout: [
      "Fills its container and measures it, never the window. The gutter fits the widest tick, bars stay 26px at most, and category labels thin out so neighbours keep 8px apart.",
      "Direct labels sit beside the last bar, spread apart with leader lines when parts are thin. They drop out under 280px, or when they would squeeze the plot below 55% of the width. The legend always stays.",
    ],
    States: [
      "loading shows skeleton bars the chart's height, and says \"Loading\" and the title once to screen readers. empty shows its message by itself, in the chart's box. error shows its message, with Try again when onRetry is given. It is announced only when it arrives while the person is there.",
      "A missing value has no mark, and says No data in the tooltip, the announcement and the table. A real zero is a flat mark on the baseline, so the two never look alike.",
    ],
    Copy: [
      "The tooltip leads with the value, then the series: \"$12,400.50 This year\". The period heads it.",
      "Empty names the period: \"No invoices in this period.\" Error names the system: \"[Accounting system] is not responding.\"",
    ],
    Rules: [
      "Stack only when the parts make a whole. Bars up to 26px wide, with 4px rounded data ends, square at the baseline, and 2px gaps between stacked parts.",
      "The scale always starts at zero and runs below it for negatives, which hang below a zero line darker than the grid. Horizontal gridlines only, one axis only.",
      "Values are rounded on the axis and exact in the tooltip and the hidden table. They are not printed on the bars.",
      "Series colours go series-1 to series-6 in order and follow the thing. Text never takes a series colour. A comparison is a grey dashed marker in chart-compare.",
      "Sit it on a surface: a ChartFigure or a Card.",
    ],
    Review: [
      "Charts drew missing data as zero, and negative values vanished (round 1).",
      "Charts had no keyboard focus and no text alternative (round 3).",
      "Axis labels fell to 3.07:1 in dark when a chart library renamed its tick element, and neither axe nor the token audit reads SVG text (round 4). The text here is measured in both themes by its own check.",
      "The formatter rounded cents away (round 1): the hidden table must carry $12,400.50, not $12,401.",
    ],
    Accepted: [
      "The plot is role application with the role description chart, so arrow keys reach it while a screen reader is in browse mode. Its description says which keys to use.",
      "Drawn in SVG by the system, not a chart library: the canvas bundle stays light, and the text alternative and contrast are ours to prove.",
      "In forced colours the bars keep their series colours, while text, gridlines and the zero line take the system's colours.",
    ],
  },
  frame: { width: 960, height: 3560 },
  // The arrival example steps through error, ready, error, so a check can prove which errors interrupt.
  state: { phase: 0 },
  logic: 'retry: () => {}, nextPhase: () => self.setState({ phase: self.state.phase + 1 }), livePhase: ["error", "ready", "error"][Math.min(self.state.phase, 2)]',
  examples: [
    {
      id: "single",
      title: "One series, in a figure",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Revenue by month" summary="Revenue has grown every month since February, to [$18,240] in June.">
<x-import component-from-global-scope="NS.BarChart" data="{{revenue}}" format="currency" label-heading="Month"></x-import>
</x-import>`,
      vals: { revenue: months.map((label, i) => ({ label, value: revenue[i] })) },
    },
    {
      id: "stacked",
      title: "Stacked, named beside the last bar",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Bookings by channel" summary="Online bookings now make up more than half of all bookings.">
<x-import component-from-global-scope="NS.BarChart" data="{{channels}}" series="{{channelSeries}}" stacked="{{yes}}" label-heading="Month"></x-import>
</x-import>`,
      vals: {
        yes: true,
        channels: months.map((label, i) => ({ label, values: { online: [120, 132, 150, 171, 188, 205][i], phone: [96, 90, 94, 88, 85, 80][i], walkin: [40, 38, 45, 41, 39, 36][i] } })),
        channelSeries: [
          { key: "online", label: "Online" },
          { key: "phone", label: "Phone" },
          { key: "walkin", label: "Walk-in" },
        ],
      },
    },
    {
      id: "grouped",
      title: "Grouped, with a target and a missing month",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Jobs completed" summary="[Northside] has beaten its target since March. April's figures for [Harbour] are missing.">
<x-import component-from-global-scope="NS.BarChart" data="{{jobs}}" series="{{jobSeries}}" label-heading="Month"></x-import>
</x-import>`,
      vals: {
        jobs: months.map((label, i) => ({ label, values: { north: [42, 38, 51, 47, 58, 61][i], harbour: [35, 33, 40, null, 44, 49][i], target: [45, 45, 50, 50, 55, 55][i] } })),
        jobSeries: [
          { key: "north", label: "[Northside]" },
          { key: "harbour", label: "[Harbour]" },
          { key: "target", label: "Target", compare: true },
        ],
      },
    },
    {
      id: "zero",
      title: "A real zero, and a missing week",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Call-backs per week" summary="No call-backs in week 3. Week 5 has no data: the job system was offline.">
<x-import component-from-global-scope="NS.BarChart" data="{{callbacks}}" height="{{h200}}" label-heading="Week"></x-import>
</x-import>`,
      vals: { h200: 200, callbacks: callbacks.map((value, i) => ({ label: `W${i + 1}`, value })) },
    },
    {
      id: "negative",
      title: "Negative values",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Net cash flow" summary="Cash flow turned negative in March and April, then recovered.">
<x-import component-from-global-scope="NS.BarChart" data="{{cash}}" format="currency" label-heading="Month"></x-import>
</x-import>`,
      vals: { cash: months.map((label, i) => ({ label, value: [4200, 2600, -1800, -3150.75, 1900, 5400][i] })) },
    },
    {
      id: "narrow",
      title: "A narrow container",
      width: 340,
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Daily bookings" summary="Bookings peak on Saturdays.">
<x-import component-from-global-scope="NS.BarChart" data="{{daily}}" height="{{h200}}" label-heading="Day"></x-import>
</x-import>`,
      vals: { daily: Array.from({ length: 14 }, (_, i) => ({ label: `${i + 1} Oct`, value: [18, 22, 25, 21, 30, 44, 12, 19, 23, 27, 24, 33, 47, 14][i] })) },
    },
    {
      id: "bare",
      title: "On its own, with a title and a summary",
      layout: "block",
      markup: `<div style="background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 20px;">
<x-import component-from-global-scope="NS.BarChart" data="{{quotes}}" title="Quotes sent per month" summary="Quotes have held steady at about [40] a month." height="{{h200}}" label-heading="Month"></x-import>
</div>`,
      vals: { quotes: months.map((label, i) => ({ label, value: [41, 38, 44, 40, 39, 42][i] })) },
    },
    {
      id: "states",
      title: "Loading, empty and error",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;">
<x-import component-from-global-scope="NS.ChartFigure" title="Revenue by month" summary="Revenue, January to June.">
<x-import component-from-global-scope="NS.BarChart" data="{{revenue}}" state="loading" height="{{h160}}"></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Revenue by month" summary="Revenue, January to June.">
<x-import component-from-global-scope="NS.BarChart" data="{{none}}" height="{{h160}}" empty="No invoices in this period."></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Revenue by month" summary="Revenue, January to June.">
<x-import component-from-global-scope="NS.BarChart" data="{{revenue}}" state="error" height="{{h160}}" error="[Accounting system] is not responding." on-retry="{{retry}}"></x-import>
</x-import>
</div>`,
      vals: { h160: 160, none: [] },
    },
    {
      id: "arrival",
      title: "An error that arrives while you are here",
      layout: "block",
      markup: `<div style="display: flex; flex-direction: column; gap: 12px;">
<div><x-import component-from-global-scope="NS.Button" on-click="{{nextPhase}}">Change state</x-import></div>
<x-import component-from-global-scope="NS.ChartFigure" title="Quotes sent per month" summary="Quotes, January to June.">
<x-import component-from-global-scope="NS.BarChart" data="{{quotes}}" state="{{livePhase}}" height="{{h160}}" error="[Quoting system] stopped responding." on-retry="{{retry}}"></x-import>
</x-import>
</div>`,
    },
  ],
  checks: [
    {
      name: "An error already there on arrival is quiet, and one that arrives while the person is there is announced",
      example: "arrival",
      async run({ scope, expect }) {
        const change = scope.getByRole("button", { name: "Change state" })
        expect.equal(await scope.getByRole("alert").count(), 0, "loaded in error: not announced")
        await change.click()
        await scope.getByRole("application").waitFor({ timeout: 3000 })
        await change.click()
        const alert = scope.getByRole("alert")
        await alert.waitFor({ timeout: 3000 }).catch(() => {})
        expect.equal(await alert.count(), 1, "failed again while the person was there: announced")
        expect.equal(await alert.innerText(), "[Quoting system] stopped responding.", "the alert says which system failed")
      },
    },
    {
      name: "Left and Right step through the bars and announce each one, and Home and End jump to the ends",
      example: "single",
      async run({ page, scope, expect }) {
        const plot = scope.getByRole("application", { name: "Revenue by month" })
        await plot.focus()
        expect.equal(await scope.locator('[data-slot="chart-live"]').getAttribute("aria-live"), "polite", "the live region is polite")
        expect.equal(await c.said(scope), "", "nothing is announced on arrival")
        await page.keyboard.press("ArrowRight")
        expect.equal(await c.said(scope), `Jan: ${money(12400.5)}. 1 of 6.`, "Right from rest goes to the first bar")
        await page.keyboard.press("ArrowRight")
        expect.equal(await c.said(scope), `Feb: ${money(9800)}. 2 of 6.`, "Right steps on")
        await page.keyboard.press("End")
        expect.equal(await c.said(scope), `Jun: ${money(18240)}. 6 of 6.`, "End goes to the last bar")
        await page.keyboard.press("ArrowRight")
        expect.equal(await c.said(scope), `Jun: ${money(18240)}. 6 of 6.`, "Right stops at the last bar")
        await page.keyboard.press("Home")
        await page.keyboard.press("ArrowLeft")
        expect.equal(await c.said(scope), `Jan: ${money(12400.5)}. 1 of 6.`, "Home, then Left stops at the first bar")
        expect(await plot.evaluate((el) => document.activeElement === el), "focus stays on the plot")
      },
    },
    {
      name: "The focused bar shows its tooltip inside the plot, and Escape hides it",
      example: "single",
      async run({ page, scope, expect }) {
        const plot = scope.locator('[data-slot="chart-plot"]')
        await plot.focus()
        const inside = async () => {
          const tip = await scope.locator('[data-slot="chart-tooltip"]').boundingBox()
          const box = await plot.boundingBox()
          return tip.x >= box.x - 0.5 && tip.x + tip.width <= box.x + box.width + 0.5 && tip.y >= box.y - 0.5
        }
        await page.keyboard.press("ArrowRight")
        expect.equal((await scope.locator('[data-slot="chart-tooltip"]').innerText()).replace(/\s+/g, " "), `Jan ${money(12400.5)}`, "the tooltip shows the period and the exact value")
        expect(await inside(), "the first bar's tooltip stays inside the plot")
        await page.keyboard.press("End")
        expect(await inside(), "the last bar's tooltip flips to stay inside the plot")
        await page.keyboard.press("Escape")
        expect.equal(await scope.locator('[data-slot="chart-tooltip"]').count(), 0, "Escape hides the tooltip")
        expect(await plot.evaluate((el) => document.activeElement === el), "focus stays on the plot")
      },
    },
    {
      name: "Hovering a stack shows every series at that bar, and the total",
      example: "stacked",
      async run({ scope, expect }) {
        const plot = scope.locator('[data-slot="chart-plot"]')
        const box = await plot.boundingBox()
        await plot.hover({ position: { x: box.width * 0.62, y: box.height / 2 } })
        const tip = scope.locator('[data-slot="chart-tooltip"]')
        // Pointer updates render a moment later than key presses: wait for the tooltip, then read it.
        await tip.waitFor({ timeout: 3000 })
        expect.equal(await tip.locator("li").count(), 3, "a row for each series")
        expect((await tip.innerText()).includes("Total"), "a stack's tooltip carries its total")
        expect.equal(await c.said(scope), "", "the pointer announces nothing")
      },
    },
    {
      name: "The hidden table carries every number exactly, cents included",
      example: "single",
      async run({ scope, expect }) {
        const rows = await c.table(scope)
        expect.equal(rows[0].join("|"), "Month|Revenue by month", "the header row: the label heading, then the series")
        expect.equal(JSON.stringify(rows.slice(1)), JSON.stringify(months.map((m, i) => [m, money(revenue[i])])), "every value, exact")
        expect(rows[1][1].includes("12,400.50"), `cents are kept: ${rows[1][1]}`)
      },
    },
    {
      name: "A stack's table adds the total, and its series are named beside the last bar",
      example: "stacked",
      async run({ scope, expect }) {
        const rows = await c.table(scope)
        expect.equal(rows[0].join("|"), "Month|Online|Phone|Walk-in|Total", "a column per series, then the total")
        expect.equal(rows[6].join("|"), "Jun|205|80|36|321", "June, exact")
        const labels = scope.locator('[data-slot="chart-direct-label"]')
        expect.equal((await labels.allTextContents()).join("|"), "Online|Phone|Walk-in", "two to four stacked series are named")
        const lastBar = await scope.locator('[data-slot="chart-bar"][data-index="5"]').first().boundingBox()
        for (const box of await Promise.all((await labels.all()).map((l) => l.boundingBox()))) expect(box.x > lastBar.x + lastBar.width, "each name sits beside the last bar")
      },
    },
    {
      name: "A missing value is never drawn as zero, and a real zero is a flat mark on the baseline",
      example: "zero",
      async run({ page, scope, expect }) {
        expect.equal(await scope.locator('[data-slot="chart-bar"][data-index="4"]').count(), 0, "the missing week has no mark")
        const zero = await scope.locator('[data-slot="chart-bar"][data-index="2"]').boundingBox()
        expect(zero && zero.height <= 2.5 && zero.height > 0, "the real zero is a flat mark")
        const rows = await c.table(scope)
        expect.equal(rows[3][1], "0", "the table prints a real zero as 0")
        expect.equal(rows[5][1], "No data", "the table says the missing week has no data")
        await scope.locator('[data-slot="chart-plot"]').focus()
        for (const key of ["Home", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]) await page.keyboard.press(key)
        expect.equal(await c.said(scope), "W5: No data. 5 of 8.", "the missing week is announced as no data")
      },
    },
    {
      name: "A missing bar in a group is skipped, and the target is a grey dashed marker",
      example: "grouped",
      async run({ page, scope, expect }) {
        expect.equal(await scope.locator('[data-slot="chart-bar"][data-series="harbour"][data-index="3"]').count(), 0, "no bar for the missing month")
        expect.equal(await scope.locator('[data-slot="chart-bar"][data-series="north"][data-index="3"]').count(), 1, "its neighbour still draws")
        expect.equal((await c.table(scope))[4].join("|"), "Apr|47|No data|50", "the table says No data")
        const marker = scope.locator('[data-slot="chart-compare"]').first()
        expect((await marker.evaluate((el) => getComputedStyle(el).strokeDasharray)) !== "none", "the target is dashed")
        expect.equal(await c.paint(marker, "stroke"), await c.colour(page, "--chart-compare"), "the target is in chart-compare")
      },
    },
    {
      name: "Negative values hang below a zero line darker than the grid",
      example: "negative",
      async run({ page, scope, expect }) {
        const zeroLine = scope.locator('[data-slot="chart-zero"]')
        const z = await zeroLine.boundingBox()
        for (const i of [2, 3]) {
          const bar = await scope.locator(`[data-slot="chart-bar"][data-index="${i}"]`).boundingBox()
          expect(Math.abs(bar.y - (z.y + z.height / 2)) <= 1.5 && bar.height > 10, `month ${i + 1} hangs from the zero line`)
        }
        const up = await scope.locator('[data-slot="chart-bar"][data-index="0"]').boundingBox()
        expect(Math.abs(up.y + up.height - (z.y + z.height / 2)) <= 1.5, "a positive bar stands on the zero line")
        expect.equal(await c.paint(zeroLine, "stroke"), await c.colour(page, "--line-strong"), "the zero line is line-strong")
        expect.equal(await c.paint(scope.locator('[data-slot="chart-grid"]').first(), "stroke"), await c.colour(page, "--chart-grid"), "the grid is chart-grid")
      },
    },
    {
      name: "Axis and label text hold 4.5:1 against what is behind it, in both themes",
      themes: ["light", "dark"],
      async run({ page, expect }) {
        const ratios = await c.contrast(page.locator('[data-slot="chart-axis-label"], [data-slot="chart-direct-label"], [data-slot="chart-legend"] li'))
        expect.atLeast(ratios.length, 40, "chart text measured")
        for (const r of ratios) expect.atLeast(r.ratio, 4.5, `"${r.text}"`)
      },
    },
    {
      name: "Category labels thin out in a narrow container and never overlap",
      example: "narrow",
      async run({ scope, expect }) {
        const boxes = (await Promise.all((await scope.locator('text[data-slot="chart-axis-label"][text-anchor]').all()).map((l) => l.boundingBox())))
          .filter((b) => b.y > 0)
        const below = boxes.filter((b) => b.y === Math.max(...boxes.map((x) => x.y))).sort((a, b) => a.x - b.x)
        expect(below.length < 14 && below.length >= 3, `some labels give way: ${below.length} of 14 shown`)
        for (let k = 1; k < below.length; k++) expect(below[k].x >= below[k - 1].x + below[k - 1].width + 4, "neighbouring labels keep apart")
        const svg = await scope.locator('[data-slot="bar-chart"] svg').first().boundingBox()
        const frame = await scope.locator('[data-slot="chart-figure"]').boundingBox()
        expect(svg.x + svg.width <= frame.x + frame.width, "nothing spills out of the figure")
      },
    },
    {
      name: "On its own, the chart is named by its title and described by its summary",
      example: "bare",
      async run({ scope, expect }) {
        const plot = scope.getByRole("application", { name: "Quotes sent per month" })
        expect.equal(await plot.count(), 1, "named by its title")
        const description = await plot.evaluate((el) => el.getAttribute("aria-describedby").split(" ").map((id) => document.getElementById(id)?.textContent).join(" "))
        expect(description.startsWith("Quotes have held steady at about [40] a month."), `described by its summary: ${description}`)
        expect.equal(await scope.locator('[data-slot="chart-table"] caption').textContent(), "Quotes sent per month", "the title is the table's caption")
      },
    },
    {
      name: "Loading, empty and error render in the chart's place",
      example: "states",
      async run({ scope, expect }) {
        const loading = scope.locator('[data-slot="chart-status"][data-state="loading"]')
        expect.equal(await loading.locator('[data-slot="skeleton"]').count(), 7, "loading is skeleton bars where the bars will be")
        expect.equal(Math.round((await loading.boundingBox()).height), 160, "the skeleton is the chart's height")
        expect.equal(await loading.locator(".sr-only").textContent(), "Loading Revenue by month", "loading is said once to screen readers")
        expect.equal(await scope.locator('[data-slot="chart-status"][data-state="empty"]').innerText(), "No invoices in this period.", "empty shows its message by itself")
        const error = scope.locator('[data-slot="chart-status"][data-state="error"]')
        expect((await error.innerText()).includes("[Accounting system] is not responding."), "error names the system")
        await error.getByRole("button", { name: "Try again" }).click()
        expect.equal(await error.getByRole("alert").count(), 0, "an error already there on arrival is not announced")
        expect.equal(await scope.getByRole("application").count(), 0, "no plot is drawn in any of the three")
      },
    },
    {
      name: "Under reduced motion the loading skeleton holds still",
      example: "states",
      reducedMotion: true,
      async run({ scope, expect }) {
        const name = await scope.locator('[data-slot="skeleton"]').first().evaluate((el) => getComputedStyle(el).animationName)
        expect.equal(name, "none", "no pulse")
      },
    },
    {
      name: "In forced colours the bars keep their colours, and text and gridlines take the system's",
      example: "single",
      forcedColors: true,
      async run({ page, scope, expect }) {
        expect.equal(await c.paint(scope.locator('[data-slot="chart-bar"]').first(), "fill"), await c.colour(page, "--series-1"), "a bar keeps series-1")
        expect.equal(await c.paint(scope.locator('[data-slot="chart-axis-label"]').first(), "fill"), await c.colour(page, "CanvasText"), "axis text is CanvasText")
        expect.equal(await c.paint(scope.locator('[data-slot="chart-grid"]').first(), "stroke"), await c.colour(page, "GrayText"), "gridlines are GrayText")
      },
    },
    {
      name: "A tap shows the tooltip on a touch screen, and lifting the finger leaves it there",
      example: "single",
      touch: true,
      async run({ page, scope, expect }) {
        const plot = scope.locator('[data-slot="chart-plot"]')
        const box = await plot.boundingBox()
        await plot.tap({ position: { x: box.width * 0.5, y: box.height * 0.6 } })
        const tip = scope.locator('[data-slot="chart-tooltip"]')
        await tip.waitFor({ timeout: 3000 }).catch(() => {})
        expect.equal(await tip.count(), 1, "the tapped bar's tooltip shows")
        // A lifted finger leaves the element: React hears it as pointerout with nowhere to go. Pointer
        // updates render a moment later, so give a wrong one time to land before saying it stayed.
        await plot.dispatchEvent("pointerout", { pointerType: "touch" })
        await page.waitForTimeout(200)
        expect.equal(await tip.count(), 1, "the tooltip stays when the finger lifts")
        await plot.dispatchEvent("pointerout", { pointerType: "mouse" })
        await tip.waitFor({ state: "detached", timeout: 3000 }).catch(() => {})
        expect.equal(await tip.count(), 0, "a mouse leaving hides it")
      },
    },
    {
      name: "Keyboard focus on the plot shows the system's outline",
      example: "single",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const plot = scope.locator('[data-slot="chart-plot"]')
        expect(await plot.evaluate((el) => document.activeElement === el), "Tab reaches the plot")
        expect.equal(await plot.evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "the outline shows")
      },
    },
  ],
}
