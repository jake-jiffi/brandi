// ShareBar's one definition: its README, its preview board and its scripted checks all come from here.
import { chartChecks as c } from "./chart-figure.def.mjs"

const methods = [
  { label: "Card", value: 6480.5 },
  { label: "Bank transfer", value: 3600 },
  { label: "Cash", value: 1920 },
]
const sources = [
  { label: "Search", value: 412 },
  { label: "Referral", value: 268 },
  { label: "Social", value: 96 },
  { label: "Repeat", value: 0 },
  { label: "Email", value: 74 },
  { label: "Partner", value: null },
  { label: "Walk-in", value: 31 },
  { label: "Flyer", value: 12 },
]

export default {
  name: "ShareBar",
  group: "Charts",
  job: "Shares of a whole as one segmented bar, with a legend that prints every share.",
  status: "proven",
  props: [
    { name: "data", type: "Array<{ label: string; value: number | null; color?: ChartSlot }>", doc: "The parts of one whole, in a fixed order, never by size. Zero and negative values are left out. null or missing is no data, and the legend says so. A seventh part and beyond fold into Other." },
    { name: "format", type: "NumberStyle", default: '"number"', doc: "The style for each part's value in the legend, printed exact beside its share." },
    { name: "title", type: "string", doc: "What the whole is: the legend's accessible name. Inside a ChartFigure, the figure's heading does this." },
    { name: "summary", type: "string", doc: "The takeaway in one sentence: the legend's accessible description. Inside a ChartFigure, the figure's takeaway." },
    { name: "state", type: '"ready" | "loading" | "empty" | "error"', default: '"ready"', doc: "loading shows a skeleton bar and legend. empty and error show their message in their place." },
    { name: "empty", type: "string", default: '"No data for this period."', doc: "What the empty state says. It shows by itself whenever there is nothing to share out." },
    { name: "error", type: "string", doc: "What the error state says. Name the system that failed." },
    { name: "onRetry", type: "() => void", doc: "Adds Try again to the error state." },
  ],
  notes: {
    Behaviour: [
      "The legend is the text alternative: a list a screen reader reads, each part with its share and value (\"Card: 54%, $6,480.50\"). The bar is hidden from it.",
      "It takes no focus: every share is printed, so there is no tooltip to open.",
    ],
    Layout: [
      "One 16px bar across the width, its outer ends rounded, with 2px gaps in the surface colour between parts. The legend wraps under it.",
      "Under 400px of its own width the legend becomes a column, the share and value right-aligned.",
    ],
    States: [
      "loading shows a skeleton bar and legend. empty shows its message by itself, and so does a whole with nothing above zero. error shows its message, with Try again when onRetry is given.",
      "A part with no data is listed as No data and takes no space in the bar.",
    ],
    Rules: [
      "It replaces pie and donut charts, which the system does not use. Five parts or fewer reads best. A seventh and beyond fold into a grey Other.",
      "Shares are printed to one decimal place and always add up to exactly 100%: the largest remainders round up.",
      "Slots follow the order given, before anything is left out, so a part never changes colour when another drops to zero. Pin `color` to keep a part's slot across charts.",
      "Text never takes a series colour: the swatch beside the name carries it.",
    ],
    Review: [
      "Charts had no text alternative (round 3). Here the printed legend is the alternative.",
      "Chart text fell under 4.5:1 in dark (round 4): the legend is measured in both themes.",
    ],
  },
  frame: { width: 960, height: 1100 },
  logic: "retry: () => {}",
  examples: [
    {
      id: "default",
      title: "Parts of a whole, in a figure",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Payments by method" summary="Card is more than half of this month's payments.">
<x-import component-from-global-scope="NS.ShareBar" data="{{methods}}" format="currency"></x-import>
</x-import>`,
      vals: { methods },
    },
    {
      id: "folding",
      title: "A seventh part folds into Other, zero is left out, and missing says so",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Bookings by source" summary="Search and referrals bring in three quarters of bookings.">
<x-import component-from-global-scope="NS.ShareBar" data="{{sources}}"></x-import>
</x-import>`,
      vals: { sources },
    },
    {
      id: "narrow",
      title: "A narrow container",
      width: 320,
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ChartFigure" title="Payments by method" summary="Card leads.">
<x-import component-from-global-scope="NS.ShareBar" data="{{methods}}" format="currency"></x-import>
</x-import>`,
    },
    {
      id: "states",
      title: "Loading, empty and error",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;">
<x-import component-from-global-scope="NS.ChartFigure" title="Payments by method" summary="How this month's payments were made.">
<x-import component-from-global-scope="NS.ShareBar" data="{{methods}}" state="loading"></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Payments by method" summary="How this month's payments were made.">
<x-import component-from-global-scope="NS.ShareBar" data="{{noPayments}}" empty="No payments in this period."></x-import>
</x-import>
<x-import component-from-global-scope="NS.ChartFigure" title="Payments by method" summary="How this month's payments were made.">
<x-import component-from-global-scope="NS.ShareBar" data="{{methods}}" state="error" error="[Payments system] is not responding." on-retry="{{retry}}"></x-import>
</x-import>
</div>`,
      vals: { noPayments: [] },
    },
  ],
  checks: [
    {
      name: "The legend prints every share and value, and a screen reader reads it as a list named by the figure",
      example: "default",
      async run({ scope, expect }) {
        const list = scope.getByRole("list", { name: "Payments by method" })
        const items = await list.locator("li").allTextContents()
        const money = (v) => c.formatNumber(v, "currency")
        expect.equal(JSON.stringify(items), JSON.stringify([`Card: 54%, ${money(6480.5)}`, `Bank transfer: 30%, ${money(3600)}`, `Cash: 16%, ${money(1920)}`]), "each part, its share and its exact value")
        expect.equal(await scope.locator('svg[aria-hidden="true"] [data-slot="chart-bar"]').count(), 3, "the bar is hidden from screen readers")
      },
    },
    {
      name: "Shares add up to exactly 100%, and each part's width is its share",
      example: "folding",
      async run({ scope, expect }) {
        const shares = (await scope.locator('[data-slot="share-bar-share"]').allTextContents()).map((s) => Number(s.replace("%", "")))
        expect.equal(Math.round(shares.reduce((a, b) => a + b, 0) * 10) / 10, 100, "the printed shares add to 100%")
        const bar = await scope.locator('svg:has([data-slot="chart-bar"])').boundingBox()
        const widths = await scope.locator('[data-slot="chart-bar"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width))
        widths.forEach((w, k) => expect(Math.abs(w / bar.width - shares[k] / 100) < 0.002, `part ${k + 1} is ${shares[k]}% of the bar`))
      },
    },
    {
      name: "Zero is left out, missing says No data, and a seventh part folds into Other",
      example: "folding",
      async run({ scope, expect }) {
        const items = await scope.locator('[data-slot="share-bar-item"]').allTextContents()
        expect(!items.some((t) => t.startsWith("Repeat")), "the zero part is left out")
        expect(items.includes("Partner: No data"), "the missing part says so")
        expect(items.some((t) => t.startsWith("Other: ") && t.endsWith(", 43")), "Walk-in and Flyer fold into Other, summed")
        expect.equal(await scope.locator('[data-slot="chart-bar"]').count(), 5, "five parts take space in the bar")
      },
    },
    {
      name: "Slots follow the order given, so a part keeps its colour when another drops to zero",
      example: "folding",
      async run({ page, scope, expect }) {
        const fills = await Promise.all((await scope.locator('[data-slot="chart-bar"]').all()).map((b) => c.paint(b, "fill")))
        const slot = (n) => c.colour(page, `--series-${n}`)
        expect.equal(fills[0], await slot(1), "Search is series-1")
        expect.equal(fills[3], await slot(5), "Email keeps series-5 though Repeat, before it, is zero")
        expect.equal(fills[4], await c.colour(page, "--chart-compare"), "Other is grey")
      },
    },
    {
      name: "Legend text holds 4.5:1 against the surface, in both themes",
      themes: ["light", "dark"],
      async run({ page, expect }) {
        const ratios = await c.contrast(page.locator('[data-slot="share-bar-item"] span:not(:has(*)):not(.sr-only)'))
        expect.atLeast(ratios.length, 30, "legend text measured")
        for (const r of ratios) expect.atLeast(r.ratio, 4.5, `"${r.text}"`)
      },
    },
    {
      name: "In a narrow container the legend becomes a column, by its own width",
      example: "narrow",
      async run({ scope, expect }) {
        const boxes = await scope.locator('[data-slot="share-bar-item"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))
        for (let k = 1; k < boxes.length; k++) expect(boxes[k].top >= boxes[k - 1].bottom - 0.5, "each part on its own line")
        const share = await scope.locator('[data-slot="share-bar-value"]').first().boundingBox()
        const item = await scope.locator('[data-slot="share-bar-item"]').first().boundingBox()
        expect(Math.abs(share.x + share.width - (item.x + item.width)) <= 1, "share and value are right-aligned")
      },
    },
    {
      name: "Loading, empty and error render in the bar's place",
      example: "states",
      async run({ scope, expect }) {
        expect.atLeast(await scope.locator('[data-slot="chart-status"][data-state="loading"] [data-slot="skeleton"]').count(), 2, "loading is a skeleton bar and legend")
        expect.equal(await scope.locator('[data-slot="chart-status"][data-state="empty"]').innerText(), "No payments in this period.", "empty shows its message by itself")
        const error = scope.locator('[data-slot="chart-status"][data-state="error"]')
        expect((await error.innerText()).includes("[Payments system] is not responding."), "error names the system")
        expect.equal(await error.getByRole("button", { name: "Try again" }).count(), 1, "Try again, when onRetry is given")
      },
    },
    {
      name: "Under reduced motion the loading skeleton holds still",
      example: "states",
      reducedMotion: true,
      async run({ scope, expect }) {
        const names = await scope.locator('[data-slot="skeleton"]').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName))
        expect(names.length && names.every((n) => n === "none"), "no pulse")
      },
    },
    {
      name: "In forced colours the parts keep their colours, and the legend takes the system's",
      example: "default",
      forcedColors: true,
      async run({ page, scope, expect }) {
        expect.equal(await c.paint(scope.locator('[data-slot="chart-bar"]').first(), "fill"), await c.colour(page, "--series-1"), "a part keeps series-1")
        expect.equal(await c.paint(scope.locator('[data-slot="share-bar-share"]').first(), "color"), await c.colour(page, "CanvasText"), "the legend is CanvasText")
      },
    },
  ],
}
