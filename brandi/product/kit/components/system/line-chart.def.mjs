// LineChart's one definition: its README, its preview board and its scripted checks all come from here.
import { chartChecks as c } from "./chart-figure.def.mjs"

const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`)
const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]
const now = [14200, 13900, 15100, 16800, 17250, 18900, 15400, 16100, 17800, 18200, 19650, 20400.5]
const last = [13800, 14100, 14600, 15200, 15900, 17100, 14800, 15000, 15600, 16000, 16900, 17300]
const callbacks = [6, 5, 7, null, 4, null, null, null, 3, 4, 2, 3]
const margin = [4.2, -1.8, -0.6, 2.4, 5.1, 6.8, 3.9, 0.8]
const money = (v) => c.formatNumber(v, "currency")

export default {
  name: "LineChart",
  group: "Charts",
  job: "A trend over time, with an optional comparison series.",
  status: "proven",
  props: [
    { name: "data", type: "Array<{ label, value } | { label, values: { [key]: number | null } }>", doc: "One item per period, oldest first. null or a missing key is no data: the line breaks there, never dropping to zero." },
    { name: "series", type: "Array<{ key, label, color?, compare? }>", doc: "The series in `values`. Slots go series-1 to series-6 in this order, never by rank. `color` pins a slot. `compare` draws the series grey and dashed in chart-compare." },
    { name: "area", type: "boolean", default: "false", doc: "A light fill under the first series. The scale then starts at zero, because the fill stands for an amount." },
    { name: "labels", type: '"auto" | "end" | "none"', default: '"auto"', doc: "auto names two to four lines at their ends, end names every line, none leaves it to the legend." },
    { name: "title", type: "string", doc: "What the chart shows: its accessible name and the hidden table's caption. Inside a ChartFigure, the figure's heading does this." },
    { name: "summary", type: "string", doc: "The takeaway in one sentence: the chart's accessible description. Inside a ChartFigure, the figure's takeaway." },
    { name: "state", type: '"ready" | "loading" | "empty" | "error"', default: '"ready"', doc: "loading shows a skeleton the chart's size. empty and error show their message in its place." },
    { name: "empty", type: "string", default: '"No data for this period."', doc: "What the empty state says. It shows by itself whenever there is no data." },
    { name: "error", type: "string", doc: "What the error state says. Name the system that failed and what happens next." },
    { name: "onRetry", type: "() => void", doc: "Adds Try again to the error state." },
    { name: "height", type: "number", default: "240", doc: "The chart's height in px, period labels included. The legend sits above it." },
    { name: "format", type: "NumberStyle", default: '"number"', doc: "The exact style for the tooltip, the announcement and the hidden table." },
    { name: "axisFormat", type: "NumberStyle", doc: "The rounded style on the axis. Defaults to the compact form of format." },
    { name: "labelHeading", type: "string", default: '"Period"', doc: "The hidden table's first column heading, such as Month." },
  ],
  notes: {
    Behaviour: [
      "The plot takes focus. Left and Right step through the points, Home and End jump to the ends, and Escape hides the tooltip. Each step moves the crosshair, shows every series at that point, and is announced through a polite live region: \"Jun: This year $20,400.50, Last year $17,300. 12 of 12.\"",
      "The pointer snaps to the nearest point anywhere over the plot and announces nothing. A tap shows it on a touch screen.",
      "Screen readers hear the plot's name, the title, then its description: the takeaway and the keys to use. Every number is in the hidden table.",
    ],
    Layout: [
      "Fills its container's width and measures it, never the window. Period labels thin out from the latest one back, so neighbours keep 8px apart.",
      "Two to four lines are named at their ends as well as in the legend, down to 280px wide, while the plot keeps 55% of the width. Names that would collide spread apart with a leader line back to their point.",
    ],
    States: [
      "loading shows a skeleton area the chart's height. empty shows its message by itself in the chart's box. error shows its message, with Try again when onRetry is given, and is announced only when it arrives while the person is there.",
      "A missing value breaks the line and says No data in the tooltip, the announcement and the table. A point with no neighbour on either side still shows, as a dot.",
    ],
    Copy: ["The tooltip leads with each value, then its series, under the period: \"$20,400.50 This year\"."],
    Rules: [
      "Lines are 2.25px with round joins. The latest point of each series is marked. Values are not printed along the line.",
      "A comparison (last period, a target) is always grey and dashed, in chart-compare, and drawn under the series.",
      "The scale holds zero under an area, across negatives, and when the values sit near zero, with a zero line darker than the grid. Otherwise it fits the values, so a trend is not flattened against the floor. Bars always start at zero. Lines need not.",
      "Five or more lines is too many for one chart: split it. A seventh series folds into Other, which only makes sense for amounts.",
      "Sit it on a surface: a ChartFigure or a Card.",
    ],
    Review: [
      "Charts drew missing data as zero, and negative values vanished (round 1).",
      "Charts had no keyboard focus and no text alternative (round 3).",
      "Axis labels fell to 3.07:1 in dark when a chart library renamed its tick element, and neither axe nor the token audit reads SVG text (round 4). The text here is measured in both themes by its own check.",
      "The formatter showed 0.8% as 80% (round 1): a percent series must print 0.8%.",
    ],
    Accepted: [
      "The plot is role application with the role description chart, so arrow keys reach it while a screen reader is in browse mode. Its description says which keys to use.",
      "In forced colours the lines keep their series colours, while text, gridlines and the zero line take the system's colours.",
    ],
  },
  frame: { width: 960, height: 2950 },
  logic: "retry: () => {}",
  examples: [
    {
      id: "area",
      title: "One series with an area",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Bookings per week" summary="Bookings have more than doubled in twelve weeks, to [264] last week.">
<x-import component-from-global-scope="NS.LineChart" data="{{bookings}}" area="{{yes}}" label-heading="Week"></x-import>
</x-import>`,
      vals: { yes: true, bookings: weeks.map((label, i) => ({ label, value: [118, 126, 121, 140, 152, 149, 171, 188, 182, 214, 239, 264][i] })) },
    },
    {
      id: "compare",
      title: "Against last year, named at the ends",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Revenue, this year and last" summary="Revenue has run ahead of last year since September.">
<x-import component-from-global-scope="NS.LineChart" data="{{revenueYears}}" series="{{yearSeries}}" format="currency" label-heading="Month"></x-import>
</x-import>`,
      vals: {
        revenueYears: months.map((label, i) => ({ label, values: { now: now[i], last: last[i] } })),
        yearSeries: [
          { key: "now", label: "This year" },
          { key: "last", label: "Last year", compare: true },
        ],
      },
    },
    {
      id: "three",
      title: "Three lines, named at their ends",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="First response time by team" summary="[Harbour] has answered fastest every month, in under [2 hours] since March.">
<x-import component-from-global-scope="NS.LineChart" data="{{response}}" series="{{teamSeries}}" format="hours" label-heading="Month"></x-import>
</x-import>`,
      vals: {
        response: months.slice(6).map((label, i) => ({ label, values: { north: [3.5, 3.25, 3.1, 2.8, 2.9, 2.6][i], harbour: [2.6, 2.4, 1.9, 1.75, 1.6, 1.5][i], west: [4.2, 4.4, 3.9, 3.6, 3.75, 3.4][i] } })),
        teamSeries: [
          { key: "north", label: "[Northside]" },
          { key: "harbour", label: "[Harbour]" },
          { key: "west", label: "[Westgate]" },
        ],
      },
    },
    {
      id: "gaps",
      title: "Missing values break the line",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Call-backs per week" summary="Weeks 4 and 6 to 8 have no data: the job system was offline.">
<x-import component-from-global-scope="NS.LineChart" data="{{callbacks}}" label-heading="Week" height="{{h200}}"></x-import>
</x-import>`,
      vals: { h200: 200, callbacks: weeks.map((label, i) => ({ label, value: callbacks[i] })) },
    },
    {
      id: "negative",
      title: "Negative values, in percent",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Net margin" summary="Margin dipped below zero in August and September.">
<x-import component-from-global-scope="NS.LineChart" data="{{margin}}" format="percent" label-heading="Month" height="{{h200}}"></x-import>
</x-import>`,
      vals: { margin: months.slice(0, 8).map((label, i) => ({ label, value: margin[i] })) },
    },
    {
      id: "narrow",
      title: "A narrow container, still named at the ends",
      width: 320,
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Revenue, this year and last" summary="Ahead of last year since September.">
<x-import component-from-global-scope="NS.LineChart" data="{{revenueYears}}" series="{{yearSeries}}" format="currency" height="{{h200}}" label-heading="Month"></x-import>
</x-import>`,
    },
    {
      id: "narrowest",
      title: "Under 280px, the legend alone names the lines",
      width: 290,
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Revenue, this year and last" summary="Ahead of last year since September.">
<x-import component-from-global-scope="NS.LineChart" data="{{revenueYears}}" series="{{yearSeries}}" format="currency" height="{{h200}}" label-heading="Month"></x-import>
</x-import>`,
    },
    {
      id: "states",
      title: "Loading, empty and error",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;">
<x-import component-from-global-scope="NS.ChartFigure" title="Bookings per week" summary="Bookings, the last twelve weeks.">
<x-import component-from-global-scope="NS.LineChart" data="{{bookings}}" state="loading" height="{{h160}}"></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Bookings per week" summary="Bookings, the last twelve weeks.">
<x-import component-from-global-scope="NS.LineChart" data="{{noBookings}}" height="{{h160}}" empty="No bookings in this period."></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Bookings per week" summary="Bookings, the last twelve weeks.">
<x-import component-from-global-scope="NS.LineChart" data="{{bookings}}" state="error" height="{{h160}}" error="[Booking system] is not responding." on-retry="{{retry}}"></x-import>
</x-import>
</div>`,
      vals: { h160: 160, noBookings: weeks.map((label) => ({ label, value: null })) },
    },
  ],
  checks: [
    {
      name: "Left and Right step through the points and announce every series at each, and Home and End jump to the ends",
      example: "compare",
      async run({ page, scope, expect }) {
        const plot = scope.getByRole("application", { name: "Revenue, this year and last" })
        await plot.focus()
        expect.equal(await c.said(scope), "", "nothing is announced on arrival")
        await page.keyboard.press("ArrowRight")
        expect.equal(await c.said(scope), `Jul: This year ${money(now[0])}, Last year ${money(last[0])}. 1 of 12.`, "Right from rest goes to the first point")
        await page.keyboard.press("ArrowRight")
        expect.equal(await c.said(scope), `Aug: This year ${money(now[1])}, Last year ${money(last[1])}. 2 of 12.`, "Right steps on")
        await page.keyboard.press("End")
        expect.equal(await c.said(scope), `Jun: This year ${money(now[11])}, Last year ${money(last[11])}. 12 of 12.`, "End goes to the last point")
        await page.keyboard.press("Home")
        expect.equal(await c.said(scope), `Jul: This year ${money(now[0])}, Last year ${money(last[0])}. 1 of 12.`, "Home goes to the first point")
        expect.equal(await scope.locator('[data-slot="chart-marker"]').count(), 2, "a marker on each series at the point")
        expect.equal(await scope.locator('[data-slot="chart-active"]').count(), 1, "the crosshair shows")
      },
    },
    {
      name: "The tooltip shows every series at the point, stays inside the plot, and Escape hides it",
      example: "compare",
      async run({ page, scope, expect }) {
        const plot = scope.locator('[data-slot="chart-plot"]')
        const box = await plot.boundingBox()
        await plot.hover({ position: { x: box.width - 60, y: box.height / 2 } })
        const tip = scope.locator('[data-slot="chart-tooltip"]')
        // Pointer updates render a moment later than key presses: wait for the tooltip, then read it.
        await tip.waitFor({ timeout: 3000 })
        expect.equal(await tip.locator("li").count(), 2, "a row for each series")
        const t = await tip.boundingBox()
        expect(t.x >= box.x && t.x + t.width <= box.x + box.width, "near the right edge, the tooltip flips to stay inside")
        expect.equal(await c.said(scope), "", "the pointer announces nothing")
        await plot.focus()
        await page.keyboard.press("End")
        await page.keyboard.press("Escape")
        expect.equal(await tip.count(), 0, "Escape hides it")
      },
    },
    {
      name: "The hidden table carries every number exactly",
      example: "compare",
      async run({ scope, expect }) {
        const rows = await c.table(scope)
        expect.equal(rows[0].join("|"), "Month|This year|Last year", "the header row")
        expect.equal(JSON.stringify(rows.slice(1)), JSON.stringify(months.map((m, i) => [m, money(now[i]), money(last[i])])), "every value, exact")
        expect(rows[12][1].includes("20,400.50"), `cents are kept: ${rows[12][1]}`)
      },
    },
    {
      name: "A comparison is grey and dashed, under the series",
      example: "compare",
      async run({ page, scope, expect }) {
        const lines = scope.locator('[data-slot="chart-series"]')
        const order = await lines.evaluateAll((gs) => gs.map((g) => g.getAttribute("data-series")))
        expect.equal(order.join(","), "last,now", "the comparison is drawn first, under the series")
        const compare = scope.locator('[data-series="last"] [data-slot="chart-line"]').first()
        const series = scope.locator('[data-series="now"] [data-slot="chart-line"]').first()
        expect((await compare.evaluate((el) => getComputedStyle(el).strokeDasharray)) !== "none", "the comparison is dashed")
        expect.equal(await series.evaluate((el) => getComputedStyle(el).strokeDasharray), "none", "the series is solid")
        expect.equal(await c.paint(compare, "stroke"), await c.colour(page, "--chart-compare"), "the comparison is chart-compare")
        expect.equal(await c.paint(series, "stroke"), await c.colour(page, "--series-1"), "the first series is series-1")
      },
    },
    {
      name: "Two to four lines are named at their ends, down to 280px",
      async run({ page, expect }) {
        const names = (id) => page.locator(`[data-example="${id}"] [data-slot="chart-direct-label"]`)
        expect.equal((await names("three").allTextContents()).sort().join("|"), "[Harbour]|[Northside]|[Westgate]", "three lines named")
        const ends = await page.locator('[data-example="three"] [data-slot="chart-end"]').evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().right)))
        for (const box of await Promise.all((await names("three").all()).map((l) => l.boundingBox()))) expect(box.x > ends, "each name sits past the line ends")
        expect.equal(await names("narrow").count(), 2, "a 320px figure still names both")
        expect.equal(await names("narrowest").count(), 0, "under 280px of chart, the names give way")
        expect.equal(await page.locator('[data-example="narrowest"] [data-slot="chart-legend"] li').count(), 2, "the legend stays")
      },
    },
    {
      name: "A missing value breaks the line and is never drawn as zero",
      example: "gaps",
      async run({ page, scope, expect }) {
        expect.equal(await scope.locator('[data-slot="chart-line"]').count(), 2, "two runs of line either side of the gaps")
        expect.equal(await scope.locator('[data-slot="chart-dot"]').count(), 1, "the lone point between gaps is a dot")
        const rows = await c.table(scope)
        expect.equal(rows.slice(1).map((r) => r[1]).join(","), "6,5,7,No data,4,No data,No data,No data,3,4,2,3", "the table says No data, never 0")
        await scope.locator('[data-slot="chart-plot"]').focus()
        for (const key of ["Home", "ArrowRight", "ArrowRight", "ArrowRight"]) await page.keyboard.press(key)
        expect.equal(await c.said(scope), "W4: No data. 4 of 12.", "the missing week is announced as no data")
        expect.equal(await scope.locator('[data-slot="chart-marker"]').count(), 0, "no marker is drawn where there is no value")
      },
    },
    {
      name: "Negative values dip below a zero line darker than the grid, and percent is printed as given",
      example: "negative",
      async run({ page, scope, expect }) {
        const z = await scope.locator('[data-slot="chart-zero"]').boundingBox()
        const lowest = await scope.locator('[data-slot="chart-line"]').evaluate((el) => {
          const b = el.getBoundingClientRect()
          return b.y + b.height
        })
        expect(lowest > z.y + 5, "the line goes below zero")
        expect.equal(await c.paint(scope.locator('[data-slot="chart-zero"]'), "stroke"), await c.colour(page, "--line-strong"), "the zero line is line-strong")
        const rows = await c.table(scope)
        expect.equal(rows[2][1], "-1.8%", "a negative percent, as given")
        expect.equal(rows[8][1], "0.8%", "0.8 is 0.8%, never 80%")
      },
    },
    {
      name: "A fitted scale for values far from zero, and zero under an area",
      async run({ page, expect }) {
        // Ticks are drawn from the lowest up, so the first right-aligned label is the scale's floor.
        const bottom = (id) => page.locator(`[data-example="${id}"] text[data-slot="chart-axis-label"][text-anchor="end"]`).first().textContent()
        expect((await bottom("compare")) !== "$0", "revenue between $13K and $21K is not flattened against zero")
        expect.equal(await bottom("area"), "0", "an area starts at zero")
        expect.equal(await page.locator('[data-example="compare"] [data-slot="chart-zero"]').count(), 0, "no zero line where zero is off the scale")
      },
    },
    {
      name: "Axis and label text hold 4.5:1 against what is behind it, in both themes",
      themes: ["light", "dark"],
      async run({ page, expect }) {
        const ratios = await c.contrast(page.locator('[data-slot="chart-axis-label"], [data-slot="chart-direct-label"], [data-slot="chart-legend"] li'))
        expect.atLeast(ratios.length, 60, "chart text measured")
        for (const r of ratios) expect.atLeast(r.ratio, 4.5, `"${r.text}"`)
      },
    },
    {
      name: "Period labels thin out in a narrow container, keep the latest, and never overlap",
      example: "narrow",
      async run({ scope, expect }) {
        const labels = scope.locator('text[data-slot="chart-axis-label"]')
        const boxes = await Promise.all((await labels.all()).map(async (l) => ({ text: await l.textContent(), box: await l.boundingBox() })))
        const y = Math.max(...boxes.map((b) => b.box.y))
        const row = boxes.filter((b) => b.box.y === y).sort((a, b) => a.box.x - b.box.x)
        expect(row.length < 12 && row.length >= 3, `some labels give way: ${row.length} of 12 shown`)
        expect.equal(row[row.length - 1].text, "Jun", "the latest period keeps its label")
        for (let k = 1; k < row.length; k++) expect(row[k].box.x >= row[k - 1].box.x + row[k - 1].box.width + 4, "neighbours keep apart")
      },
    },
    {
      name: "Loading, empty and error render in the chart's place",
      example: "states",
      async run({ scope, expect }) {
        const loading = scope.locator('[data-slot="chart-status"][data-state="loading"]')
        expect.equal(await loading.locator('[data-slot="skeleton"]').count(), 1, "loading is a skeleton area where the line will be")
        expect.equal(Math.round((await loading.boundingBox()).height), 160, "the skeleton is the chart's height")
        expect.equal(await scope.locator('[data-slot="chart-status"][data-state="empty"]').innerText(), "No bookings in this period.", "a chart of nothing but missing values shows the empty state by itself")
        const error = scope.locator('[data-slot="chart-status"][data-state="error"]')
        expect((await error.innerText()).includes("[Booking system] is not responding."), "error names the system")
        expect.equal(await error.getByRole("button", { name: "Try again" }).count(), 1, "Try again, when onRetry is given")
      },
    },
    {
      name: "Under reduced motion the loading skeleton holds still",
      example: "states",
      reducedMotion: true,
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="skeleton"]').first().evaluate((el) => getComputedStyle(el).animationName), "none", "no pulse")
      },
    },
    {
      name: "In forced colours the lines keep their colours, and text and gridlines take the system's",
      example: "compare",
      forcedColors: true,
      async run({ page, scope, expect }) {
        expect.equal(await c.paint(scope.locator('[data-series="now"] [data-slot="chart-line"]').first(), "stroke"), await c.colour(page, "--series-1"), "the line keeps series-1")
        expect.equal(await c.paint(scope.locator('[data-slot="chart-axis-label"]').first(), "fill"), await c.colour(page, "CanvasText"), "axis text is CanvasText")
        expect.equal(await c.paint(scope.locator('[data-slot="chart-direct-label"]').first(), "fill"), await c.colour(page, "CanvasText"), "end names are CanvasText")
        expect.equal(await c.paint(scope.locator('[data-slot="chart-grid"]').first(), "stroke"), await c.colour(page, "GrayText"), "gridlines are GrayText")
      },
    },
    {
      name: "A tap shows the tooltip on a touch screen",
      example: "area",
      touch: true,
      async run({ scope, expect }) {
        const plot = scope.locator('[data-slot="chart-plot"]')
        const box = await plot.boundingBox()
        await plot.tap({ position: { x: box.width * 0.5, y: box.height * 0.5 } })
        const tip = scope.locator('[data-slot="chart-tooltip"]')
        await tip.waitFor({ timeout: 3000 }).catch(() => {})
        expect.equal(await tip.count(), 1, "the tooltip shows")
      },
    },
  ],
}
