// Sparkline's one definition: its README, its preview board and its scripted checks all come from here.
import { chartChecks as c } from "./chart-figure.def.mjs"

const surface = "display: flex; flex-wrap: wrap; gap: 40px; align-items: center; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 20px 24px;"

export default {
  name: "Sparkline",
  group: "Charts",
  job: "A tiny trend with its last point marked, inside a MetricCard or a table cell.",
  status: "proven",
  props: [
    { name: "data", type: "Array<number | null>", doc: "The trend, oldest first. null breaks the line. Nothing is drawn as zero." },
    { name: "width", type: "number", default: "96", doc: "Width in px." },
    { name: "height", type: "number", default: "28", doc: "Height in px." },
    { name: "color", type: "ChartSlot", default: "1", doc: "The series slot, 1 to 6. Keep it series-1: the Delta beside it says whether the trend is good." },
    { name: "label", type: "string", doc: "The trend in words. With it the sparkline is an image with that name. Without it, it is decoration that screen readers skip." },
    { name: "state", type: '"ready" | "loading" | "empty" | "error"', default: '"ready"', doc: "loading shows a skeleton its size. empty and error keep its space, draw nothing, and say so in its name." },
  ],
  notes: {
    Behaviour: [
      "Without a label it is hidden from screen readers, because the figure beside it carries the meaning. With one it is an image named by it: \"Revenue rose over 12 weeks, from [$9.8K] to [$18.2K]\".",
      "It takes no focus and has no tooltip.",
    ],
    Layout: ["A fixed size, 96 by 28 by default, with 4px inside so the end point is never clipped. The scale fits the values: no axes, no zero."],
    States: [
      "loading is a skeleton its size, which holds still under reduced motion. empty and error keep the space and draw nothing. A labelled sparkline adds \"no data\" or \"could not load\" to its name.",
      "null breaks the line. A point with no neighbour still shows, as a dot.",
    ],
    Rules: [
      "It supports a figure and never stands in for one: put the number and its Delta beside it.",
      "Keep it in series-1. A trend is never coloured red or green: the Delta says whether it is good.",
      "The last point is marked with a dot in a ring of the surface colour.",
    ],
    Review: ["Charts drew missing data as zero (round 1)."],
  },
  frame: { width: 960, height: 460 },
  examples: [
    {
      id: "default",
      title: "Decorative, and with a label",
      layout: "block",
      markup: `<div style="${surface}">
<x-import component-from-global-scope="NS.Sparkline" data="{{trend}}"></x-import>
<x-import component-from-global-scope="NS.Sparkline" data="{{trend}}" width="{{w160}}" height="{{h40}}" label="Revenue rose over 12 weeks, from [$9.8K] to [$18.2K]"></x-import>
</div>`,
      vals: { trend: [9.8, 10.4, 10.1, 11.9, 12.6, 12.2, 13.8, 14.1, 15.6, 15.2, 17.1, 18.2], w160: 160, h40: 40 },
    },
    {
      id: "gaps",
      title: "Missing values break the line",
      layout: "block",
      markup: `<div style="${surface}">
<x-import component-from-global-scope="NS.Sparkline" data="{{gappy}}" width="{{w160}}" height="{{h40}}" label="Call-backs per week, with no data for weeks 4, 6, 7 and 9"></x-import>
</div>`,
      vals: { gappy: [6, 5, 7, null, 4, null, null, 3, null, 4, 2, 3] },
    },
    {
      id: "states",
      title: "Loading and empty",
      layout: "block",
      markup: `<div style="${surface}">
<x-import component-from-global-scope="NS.Sparkline" data="{{trend}}" state="loading" width="{{w160}}" height="{{h40}}" label="Revenue trend"></x-import>
<x-import component-from-global-scope="NS.Sparkline" data="{{noTrend}}" width="{{w160}}" height="{{h40}}" label="Revenue trend"></x-import>
</div>`,
      vals: { noTrend: [null, null, null] },
    },
  ],
  checks: [
    {
      name: "Without a label it is hidden from screen readers, and with one it is an image with that name",
      example: "default",
      async run({ scope, expect }) {
        const lines = scope.locator('[data-slot="sparkline"]')
        expect.equal(await lines.first().getAttribute("aria-hidden"), "true", "the unlabelled one is decoration")
        expect.equal(await scope.getByRole("img", { name: "Revenue rose over 12 weeks, from [$9.8K] to [$18.2K]" }).count(), 1, "the labelled one is an image named by its label")
      },
    },
    {
      name: "null breaks the line, a lone point is a dot, and nothing is drawn as zero",
      example: "gaps",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="sparkline-line"]').count(), 2, "two runs of line")
        expect.equal(await scope.locator('[data-slot="sparkline-dot"]').count(), 2, "two lone points, as dots")
        const floor = await scope.locator('[data-slot="sparkline"]').evaluate((svg) => svg.getBoundingClientRect().bottom)
        const lowest = await scope.locator('[data-slot="sparkline-line"], [data-slot="sparkline-dot"]').evaluateAll((els) => Math.max(...els.map((e) => e.getBoundingClientRect().bottom)))
        expect(lowest <= floor - 3, "no mark drops to the floor where a value is missing")
      },
    },
    {
      name: "The last point is marked, in series-1",
      example: "default",
      async run({ page, scope, expect }) {
        const svg = await scope.locator('[data-slot="sparkline"]').last().boundingBox()
        const end = await scope.locator('[data-slot="sparkline-end"]').last().boundingBox()
        expect(Math.abs(end.x + end.width / 2 - (svg.x + svg.width - 4)) <= 1, "the dot sits on the last point")
        expect.equal(await c.paint(scope.locator('[data-slot="sparkline-line"]').first(), "stroke"), await c.colour(page, "--series-1"), "the line is series-1")
      },
    },
    {
      name: "Loading is a skeleton its size that holds still under reduced motion, and empty keeps its space and says so",
      example: "states",
      reducedMotion: true,
      async run({ scope, expect }) {
        const loading = scope.locator('[data-slot="sparkline"][data-state="loading"]')
        expect.equal(await loading.locator('[data-slot="skeleton"]').evaluate((el) => getComputedStyle(el).animationName), "none", "no pulse")
        const empty = scope.getByRole("img", { name: "Revenue trend: no data" })
        expect.equal(await empty.count(), 1, "an empty sparkline says there is no data")
        const box = await empty.boundingBox()
        expect(box.width === 160 && box.height === 40, "and keeps its space")
        expect.equal(await empty.locator("path, circle").count(), 0, "it draws nothing")
      },
    },
    {
      name: "In forced colours the line keeps its colour",
      example: "default",
      forcedColors: true,
      async run({ page, scope, expect }) {
        expect.equal(await c.paint(scope.locator('[data-slot="sparkline-line"]').first(), "stroke"), await c.colour(page, "--series-1"), "the line keeps series-1")
      },
    },
  ],
}
