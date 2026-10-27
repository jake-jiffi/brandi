// ChartFigure's one definition: its README, its preview board and its scripted checks all come from here.
// It also exports `chartChecks`, the measuring the chart definitions share. Only the default export is
// a definition; loadDefinitions and the check runner read nothing else.
import { formatNumber } from "../../lib/format.js"

/** In the page: a CSS colour of any syntax as [r, g, b, a], through a canvas, so oklch and hex compare alike. */
const IN_PAGE = `
  window.__chartRgba = window.__chartRgba || (() => {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    return (css) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
  })();
`

export const chartChecks = {
  formatNumber,
  /** The WCAG contrast of each element's text against what is painted behind it, composited up to the first opaque background. */
  async contrast(locator) {
    await locator.page().evaluate(IN_PAGE)
    return locator.evaluateAll((els) => {
      const rgba = window.__chartRgba
      const lum = ([r, g, b]) => {
        const f = (v) => {
          const c = v / 255
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const over = (top, base) => {
        const a = top[3]
        return [0, 1, 2].map((k) => top[k] * a + base[k] * (1 - a)).concat(1)
      }
      const behind = (el) => {
        const layers = []
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
          const c = rgba(getComputedStyle(n).backgroundColor)
          if (c[3] > 0) layers.push(c)
          if (c[3] >= 1) break
        }
        let base = layers.length && layers[layers.length - 1][3] >= 1 ? layers.pop() : rgba(getComputedStyle(document.body).backgroundColor)
        for (let k = layers.length - 1; k >= 0; k--) base = over(layers[k], base)
        return base
      }
      return els.map((el) => {
        const s = getComputedStyle(el)
        const paint = el instanceof SVGElement && s.fill && s.fill !== "none" && !s.fill.startsWith("url") ? s.fill : s.color
        const bg = behind(el)
        const fg = over(rgba(paint), bg)
        const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a)
        return { text: el.textContent.trim(), ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100 }
      })
    })
  },
  /**
   * A colour from the page as "r,g,b": a token's value (read from its custom property, which forced
   * colours leave alone), or a CSS colour such as CanvasText (resolved on a probe forced colours
   * cannot repaint, so it gives the system's own value).
   */
  async colour(page, css) {
    await page.evaluate(IN_PAGE)
    return page.evaluate((value) => {
      if (value.startsWith("--")) {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(value).trim()
        return window.__chartRgba(raw).slice(0, 3).join(",")
      }
      const probe = document.createElement("span")
      probe.style.forcedColorAdjust = "none"
      probe.style.color = value
      document.body.append(probe)
      const c = window.__chartRgba(getComputedStyle(probe).color)
      probe.remove()
      return c.slice(0, 3).join(",")
    }, css)
  },
  /** A computed paint (fill or stroke) as "r,g,b". */
  async paint(locator, property) {
    await locator.page().evaluate(IN_PAGE)
    return locator.evaluate((el, prop) => window.__chartRgba(getComputedStyle(el)[prop]).slice(0, 3).join(","), property)
  },
  /** What the chart's live region says now. */
  async said(scope) {
    return ((await scope.locator('[data-slot="chart-live"]').first().textContent()) ?? "").trim()
  },
  /** The hidden table as rows of cell text, the header row first. */
  async table(scope) {
    return scope.locator('[data-slot="chart-table"]').first().evaluate((t) => [...t.querySelectorAll("tr")].map((r) => [...r.children].map((c) => c.textContent.trim())))
  },
}

const revenue = [
  { label: "Jan", value: 12400.5 },
  { label: "Feb", value: 9800 },
  { label: "Mar", value: 13150 },
  { label: "Apr", value: 14920.25 },
  { label: "May", value: 16310 },
  { label: "Jun", value: 18240 },
]

export default {
  name: "ChartFigure",
  group: "Charts",
  job: "A chart's frame: a heading that names it, the takeaway in one sentence, the chart, and the same numbers as a hidden table.",
  status: "proven",
  props: [
    { name: "title", type: "string", doc: "The heading that names the chart, in sentence case. It is the figure's accessible name, and the chart's." },
    { name: "summary", type: "string", doc: "The takeaway in one sentence: what the reader should see. It is the figure's accessible description, and the chart's." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "2", doc: "The heading's level, so no page or board skips one." },
    { name: "children", type: "ReactNode", doc: "One chart: BarChart, LineChart, HBarChart or ShareBar. It takes its name and description from the figure." },
  ],
  notes: {
    Behaviour: [
      "The figure is named by its heading and described by its takeaway. The chart inside takes the same heading and takeaway as its own name and description, so a screen reader hears the takeaway before the numbers.",
      "BarChart and LineChart follow with the same numbers as a visually hidden table: the figure's title as its caption, and a first column that names each row. HBarChart and ShareBar print every number in a list a screen reader reads, so they carry no second copy.",
    ],
    Layout: [
      "A surface with a hairline, the card's radius and shadow, 20px in and 20px between the words and the chart. Under 480px of its own width it tightens to 16px.",
      "The takeaway is capped at the measure and wraps without leaving one word on its own line.",
    ],
    Copy: [
      "The heading says what is measured: \"Revenue by month\", not \"Revenue chart\".",
      "The takeaway is one sentence that states the finding: \"Revenue has grown every month since February.\" Never \"This chart shows revenue\".",
    ],
    Rules: [
      "Charts sit on a surface, because the series colours are checked at 3:1 against it. Put a chart in a ChartFigure, or in a Card, never straight on the canvas.",
      "One chart per figure. A figure that needs tabs or a second chart is a page section.",
      "Never inside a Card: the figure is the card.",
    ],
  },
  frame: { width: 960, height: 1500 },
  examples: [
    {
      id: "bar",
      title: "A bar chart, at heading level 2",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Revenue by month" summary="Revenue has grown every month since February, to [$18,240] in June.">
<x-import component-from-global-scope="NS.BarChart" data="{{revenue}}" format="currency" label-heading="Month"></x-import>
</x-import>`,
      vals: { revenue },
    },
    {
      id: "line",
      title: "A line chart, at heading level 3",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Bookings per week" summary="Bookings have more than doubled in twelve weeks." heading-level="{{three}}">
<x-import component-from-global-scope="NS.LineChart" data="{{bookings}}" area="{{yes}}" label-heading="Week" height="{{h200}}"></x-import>
</x-import>`,
      vals: {
        three: 3,
        yes: true,
        h200: 200,
        bookings: [118, 126, 121, 140, 152, 149, 171, 188, 182, 214, 239, 264].map((value, i) => ({ label: `W${i + 1}`, value })),
      },
    },
    {
      id: "lists",
      title: "A ranking and a share, side by side",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start;">
<x-import component-from-global-scope="NS.ChartFigure" title="Top services by revenue" summary="Maintenance plans earn the most.">
<x-import component-from-global-scope="NS.HBarChart" data="{{services}}" format="compact-currency"></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Payments by method" summary="Card is more than half of this month's payments.">
<x-import component-from-global-scope="NS.ShareBar" data="{{methods}}" format="currency"></x-import>
</x-import>
</div>`,
      vals: {
        services: [
          { label: "Maintenance plans", value: 12400 },
          { label: "Installations", value: 8650 },
          { label: "Repairs", value: 3120 },
        ],
        methods: [
          { label: "Card", value: 6480.5 },
          { label: "Bank transfer", value: 3600 },
          { label: "Cash", value: 1920 },
        ],
      },
    },
    {
      id: "narrow",
      title: "A narrow figure",
      width: 320,
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Revenue by month" summary="Up every month since February.">
<x-import component-from-global-scope="NS.BarChart" data="{{revenue}}" format="currency" height="{{h200}}"></x-import>
</x-import>`,
    },
  ],
  checks: [
    {
      name: "The heading names the figure and the takeaway describes it",
      example: "bar",
      async run({ scope, expect }) {
        const figure = scope.getByRole("figure", { name: "Revenue by month" })
        expect.equal(await figure.count(), 1, "one figure named by its heading")
        const described = await figure.evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent)
        expect.equal(described, "Revenue has grown every month since February, to [$18,240] in June.", "the figure's description")
      },
    },
    {
      name: "headingLevel sets the heading's level",
      async run({ page, expect }) {
        expect.equal(await page.locator('[data-example="bar"] [data-slot="chart-figure-title"]').evaluate((el) => el.tagName), "H2", "level 2 by default")
        expect.equal(await page.locator('[data-example="line"] [data-slot="chart-figure-title"]').evaluate((el) => el.tagName), "H3", "heading-level 3")
      },
    },
    {
      name: "The chart inside takes the figure's heading as its name and the takeaway as its description",
      example: "bar",
      async run({ scope, expect }) {
        const plot = scope.getByRole("application", { name: "Revenue by month" })
        expect.equal(await plot.count(), 1, "the plot is named by the figure's heading")
        const description = await plot.evaluate((el) =>
          el
            .getAttribute("aria-describedby")
            .split(" ")
            .map((id) => document.getElementById(id)?.textContent)
            .join(" ")
        )
        expect(description.startsWith("Revenue has grown every month since February"), `the takeaway describes the plot: ${description}`)
      },
    },
    {
      name: "The same numbers follow the chart as a hidden table whose first column names each row",
      example: "bar",
      async run({ scope, expect }) {
        const table = scope.locator('[data-slot="chart-table"]')
        expect.equal(await table.locator("caption").textContent(), "Revenue by month", "the figure's title is the caption")
        expect.equal(await table.locator('tbody th[scope="row"]').count(), 6, "every row is named by its first cell")
        const after = await scope.evaluate((root) => {
          const plot = root.querySelector('[data-slot="chart-plot"]')
          const t = root.querySelector('[data-slot="chart-table"]')
          return Boolean(plot.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)
        })
        expect(after, "the table comes after the chart")
        const hidden = await table.evaluate((el) => {
          const box = el.parentElement.getBoundingClientRect()
          return box.width <= 1 && box.height <= 1 && getComputedStyle(el.parentElement).overflow === "hidden"
        })
        expect(hidden, "the table is visually hidden, clipped to a 1px box")
      },
    },
    {
      name: "The chart sits on the surface, and its series colour holds 3:1 against it, in both themes",
      example: "bar",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const surface = await chartChecks.colour(page, "--surface")
        const figure = await scope.locator('[data-slot="chart-figure"]').evaluate((el) => getComputedStyle(el).backgroundColor)
        expect.equal(await chartChecks.colour(page, figure), surface, "the figure is painted in the surface role")
        const bar = await chartChecks.paint(scope.locator('[data-slot="chart-bar"]').first(), "fill")
        const lum = (rgb) =>
          rgb
            .split(",")
            .map(Number)
            .map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
            .reduce((sum, c, k) => sum + c * [0.2126, 0.7152, 0.0722][k], 0)
        const [hi, lo] = [lum(bar), lum(surface)].sort((a, b) => b - a)
        expect.atLeast((hi + 0.05) / (lo + 0.05), 3, "series-1 against the surface")
      },
    },
    {
      name: "Heading and takeaway hold 4.5:1, in both themes",
      themes: ["light", "dark"],
      async run({ page, expect }) {
        const ratios = await chartChecks.contrast(page.locator('[data-slot="chart-figure-title"], [data-slot="chart-figure-summary"]'))
        for (const r of ratios) expect.atLeast(r.ratio, 4.5, `"${r.text}"`)
      },
    },
    {
      name: "A narrow figure tightens to 16px by its own width, not the window's",
      async run({ page, expect }) {
        const pad = (id) => page.locator(`[data-example="${id}"] [data-slot="chart-figure"] > div`).evaluate((el) => getComputedStyle(el).paddingLeft)
        expect.equal(await pad("bar"), "20px", "a wide figure")
        expect.equal(await pad("narrow"), "16px", "a 320px figure in a 1280px window")
      },
    },
  ],
}
