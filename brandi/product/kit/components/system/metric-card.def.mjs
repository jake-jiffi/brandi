// MetricCard's one definition: its README, its preview board and its scripted checks all come from here.

const grid = (cols, inner) => `<div style="display: grid; grid-template-columns: ${cols}; gap: 16px; width: 100%;">\n${inner}\n</div>`

const HINT = "Paid invoices less refunds and credit notes, before GST."
const revenueTrend = [12.1, 13.4, 12.8, 14.9, 15.2, 16.8, 16.1, 17.2, 18.24]

const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)
const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement)
async function tabTo(page, locator, max = 30) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await isFocused(locator)) return true
  }
  return false
}
/** A role's colour as the browser computes it in the current theme. */
const colourOf = (page, role) =>
  page.evaluate((r) => {
    const probe = document.createElement("span")
    probe.style.color = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, role)
/** The system's own formatter, from the bundle's namespace, so the expected figure follows the market's locale. */
const fmt = (page, value, styleName) =>
  page.evaluate(([v, s]) => {
    for (const key of Object.keys(window)) {
      try {
        const ns = window[key]
        if (ns && typeof ns.formatNumber === "function" && typeof ns.Root === "function") return ns.formatNumber(v, s)
      } catch (e) {}
    }
    return null
  }, [value, styleName])
// The bubble a person opened, in its portal: not the one the design example shows open in place.
const floating = (page) => page.locator('[data-slot="popover-content"]:not([data-example] *)')
const card = (scope, label) => scope.locator('[data-slot="metric-card"]', { has: scope.page().getByRole("heading", { name: label, exact: true }) })

export default {
  name: "MetricCard",
  group: "Data",
  job: "A headline figure: its label, the value, a delta with its comparison, an optional trend and a footnote.",
  status: "proven",
  props: [
    { name: "label", type: "string", required: true, doc: "Says exactly what is counted. It is the card's heading." },
    { name: "value", type: "number | string | null", doc: "The figure, through the formatter. Missing says No data; it is never drawn as zero." },
    { name: "format", type: "NumberStyle", default: '"number"', doc: "The number style. Rounded for reading on a card: compact-currency shows $18K." },
    { name: "delta", type: "number | null", doc: "The change, signed. Left out, no delta shows; null says No comparison." },
    { name: "deltaFormat", type: "NumberStyle", default: '"percent"', doc: "percent, or points for a rate: a change in a rate is never a percent of a percent." },
    { name: "goodWhen", type: '"up" | "down" | "neither"', default: '"up"', doc: "Which way is better. Costs, overdue amounts and churn are down." },
    { name: "context", type: "string", doc: "What the change is against, always: \"vs last month\"." },
    { name: "trend", type: "Array<number | null>", doc: "A trend, oldest first, drawn as a Sparkline. null breaks the line." },
    { name: "trendLabel", type: "string", doc: "The trend in words, for screen readers. Without it the sparkline is decoration." },
    { name: "footnote", type: "ReactNode", doc: "What is left out, at the foot of the card." },
    { name: "hint", type: "ReactNode", doc: "A definition behind an info button beside the label, a Toggletip: a press, a tap or Enter opens it and reads it out." },
    { name: "hintLabel", type: "string", default: '"About [label]"', doc: "The info button's name." },
    { name: "hintOpen", type: "boolean", doc: "Design mode: shows the hint open, in place, for a board." },
    { name: "hero", type: "boolean", default: "false", doc: "The headline figure of its row: a bolder label in text-strong and a wider trend. One per row at most." },
    { name: "state", type: '"ready" | "loading" | "unavailable"', default: '"ready"', doc: "Design mode as well as live: loading keeps the label and waits as a skeleton; unavailable says its source is down." },
    { name: "unavailableText", type: "ReactNode", default: '"Its source is not responding."', doc: "When unavailable: which source is down, and when it last answered." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", doc: "The label's heading level: a row of figures usually sits under a section heading." },
  ],
  notes: {
    Behaviour: [
      "The label is a heading, an h3 unless headingLevel says otherwise, so a screen reader can move figure to figure.",
      "hint is a Toggletip behind an info button named \"About [label]\". Hover shows it after 150ms. A press, a tap or Enter opens it and reads it out; Escape or a press elsewhere closes it, and focus stays on the button.",
      "The delta is read as the whole judgement: \"Up 6.2%, better vs last month\". A trend with trendLabel is read in words; without one it is hidden.",
    ],
    Layout: [
      "The figure shrinks with its card, never the window: kpi, and kpi-sm in a card under 200px wide. Figures are the body face's kpi styles in tabular figures, the hero's too: the display face never sets a number.",
      "Every card keeps a 20px inset whatever its width, and a hero's trend is wider but no taller than the figure's line, so labels, figures and deltas line up along a row of cards of different widths.",
      "The trend sits beside the figure while there is room and drops under it when there is not.",
      "The card fills its cell, and the footnote sits at its foot, so footnotes line up along a row.",
    ],
    States: [
      "Ready, loading and unavailable. Loading keeps the label, waits as a skeleton in the figure's shape and says so once. Unavailable shows Unavailable and which source is down, never a zero nobody measured.",
      "A missing figure in a ready card says No data.",
    ],
    Copy: [
      'The label says exactly what is counted: "Net revenue, before GST", never "Revenue".',
      'The footnote says what is left out: "Excludes invoices still in draft."',
      'Unavailable names the source and when it last answered: "[Bank feed] is not responding. Last answered at [9:42 am]."',
    ],
    Rules: [
      "Two to four in a row, and one hero per row at most. Tabular figures.",
      "Rounded for reading on a card ($18K), exact in a table.",
      "When a source is down, show unavailable and when it last answered, never a zero nobody measured.",
    ],
    Review: ["The hint could not be opened on touch (round 4): a check taps it open on a touch screen."],
  },
  frame: { width: 960, height: 1180 },
  examples: [
    {
      id: "row",
      title: "A row of figures",
      layout: "block",
      markup: grid(
        "repeat(3, minmax(0, 1fr))",
        `<x-import component-from-global-scope="NS.MetricCard" label="Net revenue" value="{{revenue}}" format="compact-currency" delta="{{d62}}" context="vs last month" trend="{{revenueTrend}}" trend-label="Up most weeks since [April]" hint="${HINT}" footnote="Excludes invoices still in draft."></x-import>
<x-import component-from-global-scope="NS.MetricCard" label="Overdue invoices" value="{{overdue}}" format="compact-currency" delta="{{dm12}}" good-when="down" context="vs last month" footnote="Unpaid 30 days or more after the due date."></x-import>
<x-import component-from-global-scope="NS.MetricCard" label="Collected on time" value="{{rate}}" format="percent" delta="{{d18}}" delta-format="points" context="vs last quarter" footnote="Paid by the due date, this quarter."></x-import>`
      ),
      vals: { revenue: 18240, revenueTrend, d62: 6.2, overdue: 4310, dm12: -12, rate: 87.5, d18: 1.8 },
    },
    {
      id: "hero",
      title: "One hero in a row",
      layout: "block",
      markup: grid(
        "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)",
        `<x-import component-from-global-scope="NS.MetricCard" label="Hours worked this week" value="{{hours}}" format="hours" hero="{{yes}}" delta="{{d4}}" context="vs last week" trend="{{hoursTrend}}" trend-label="Steady across the last eight weeks" footnote="Approved timesheets only."></x-import>
<x-import component-from-global-scope="NS.MetricCard" label="Overtime" value="{{overtime}}" format="hours" delta="{{dm9}}" good-when="down" context="vs last week"></x-import>
<x-import component-from-global-scope="NS.MetricCard" label="Shifts with nobody" value="{{gaps}}" delta="{{zero}}" good-when="down" context="vs last week"></x-import>`
      ),
      vals: { hours: 1284.5, yes: true, d4: 4.1, hoursTrend: [1198, 1240, 1222, 1263, 1251, null, 1270, 1284.5], overtime: 46.25, dm9: -9.4, gaps: 3, zero: 0 },
    },
    {
      id: "states",
      title: "Loading, unavailable, and no data",
      layout: "block",
      markup: grid(
        "repeat(3, minmax(0, 1fr))",
        `<x-import component-from-global-scope="NS.MetricCard" label="Net revenue" state="loading" format="compact-currency"></x-import>
<x-import component-from-global-scope="NS.MetricCard" label="Cash in the bank" state="unavailable" unavailable-text="[Bank feed] is not responding. Last answered at [9:42 am]."></x-import>
<x-import component-from-global-scope="NS.MetricCard" label="Refunds this month" value="{{nothing}}" format="currency" footnote="No refunds have synced from [the payments system] yet."></x-import>`
      ),
      vals: { nothing: null },
    },
    {
      id: "hint-open",
      title: "The hint open, for a design",
      layout: "block",
      markup: `<div style="padding-top: 72px; width: 300px;"><x-import component-from-global-scope="NS.MetricCard" label="Net revenue" value="{{revenue}}" format="compact-currency" delta="{{d62}}" context="vs last month" hint="${HINT}" hint-open="{{yes}}"></x-import></div>`,
    },
    {
      id: "narrow",
      title: "In a narrow card the figure shrinks",
      layout: "block",
      markup: `<div style="width: 184px;"><x-import component-from-global-scope="NS.MetricCard" label="Overdue invoices" value="{{overdue}}" format="compact-currency" delta="{{dm12}}" good-when="down" context="vs last month"></x-import></div>`,
    },
  ],
  checks: [
    {
      name: "The figure goes through the formatter, rounded for reading, in tabular figures",
      example: "row",
      async run({ page, scope, expect }) {
        const values = scope.locator('[data-slot="metric-card-value"]')
        expect.equal(await values.nth(0).innerText(), await fmt(page, 18240, "compact-currency"), "net revenue")
        expect.equal(await values.nth(1).innerText(), await fmt(page, 4310, "compact-currency"), "overdue invoices")
        expect.equal(await values.nth(2).innerText(), await fmt(page, 87.5, "percent"), "collected on time")
        expect((await style(values.nth(0), "fontVariantNumeric")).includes("tabular-nums"), "tabular figures")
      },
    },
    {
      name: "The change is read as the whole judgement, with what it is compared with",
      example: "row",
      async run({ page, scope, expect }) {
        const spoken = (label) => card(scope, label).locator('[data-slot="delta"] .sr-only').last().textContent()
        expect.equal(await spoken("Net revenue"), `Up ${await fmt(page, 6.2, "percent")}, better vs last month`, "a rise that is good")
        expect.equal(await spoken("Overdue invoices"), `Down ${await fmt(page, 12, "percent")}, better vs last month`, "a fall that is good, for a cost")
        expect.equal(await spoken("Collected on time"), `Up ${await fmt(page, 1.8, "points")}, better vs last quarter`, "a rate, in points")
      },
    },
    {
      name: "The label is the card's heading, an h3 unless told otherwise",
      example: "row",
      async run({ scope, expect }) {
        for (const name of ["Net revenue", "Overdue invoices", "Collected on time"]) {
          expect.equal(await scope.getByRole("heading", { level: 3, name, exact: true }).count(), 1, `the ${name} heading`)
        }
      },
    },
    {
      name: "Enter opens the hint and reads it out; Escape closes it and focus stays on its button",
      example: "row",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "About net revenue" })
        expect(await tabTo(page, button), "Tab reaches the info button")
        await page.keyboard.press("Enter")
        await floating(page).waitFor({ state: "visible", timeout: 3000 })
        expect.equal((await floating(page).innerText()).trim(), HINT, "the hint shows")
        expect.equal((await card(scope, "Net revenue").getByRole("status").textContent()).trim(), HINT, "and is read out")
        await page.keyboard.press("Escape")
        await floating(page).waitFor({ state: "hidden", timeout: 3000 })
        expect(await isFocused(button), "focus stays on the info button")
      },
    },
    {
      name: "The hint opens on a tap, on a touch screen, where its button is 40px",
      example: "row",
      touch: true,
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "About net revenue" })
        const box = await button.boundingBox()
        expect.atLeast(Math.round(box.width), 40, "the button's width on touch")
        expect.atLeast(Math.round(box.height), 40, "the button's height on touch")
        await button.tap()
        await floating(page).waitFor({ state: "visible", timeout: 3000 })
        expect.equal((await floating(page).innerText()).trim(), HINT, "the hint shows")
      },
    },
    {
      name: "A missing figure says No data, never zero",
      example: "states",
      async run({ scope, expect }) {
        const value = card(scope, "Refunds this month").locator('[data-slot="metric-card-value"]')
        expect.equal((await value.innerText()).trim(), "No data", "what a missing figure says")
        expect(!/\d/.test(await value.innerText()), "no figure nobody measured")
      },
    },
    {
      name: "Unavailable says which source is down and when it last answered, with no figure",
      example: "states",
      async run({ scope, expect }) {
        const down = card(scope, "Cash in the bank")
        expect.equal(await down.getAttribute("data-state"), "unavailable", "its state")
        const text = await down.innerText()
        expect(text.includes("Unavailable"), "it says unavailable")
        expect(text.includes("[Bank feed] is not responding. Last answered at [9:42 am]."), "which source, and when it last answered")
        expect.equal(await down.locator('[data-slot="metric-card-value"]').count(), 0, "no figure")
      },
    },
    {
      name: "Loading keeps the label, says so once, and waits as a skeleton",
      example: "states",
      async run({ scope, expect }) {
        const loading = card(scope, "Net revenue")
        expect.equal(await loading.getAttribute("aria-busy"), "true", "it is busy")
        expect.equal((await loading.getByRole("status").textContent()).trim(), "Loading net revenue", "one polite status")
        expect.atLeast(await loading.locator('[data-slot="skeleton"]').count(), 1, "a skeleton in the figure's place")
        expect.equal(await loading.locator('[data-slot="metric-card-value"]').count(), 0, "no figure yet")
      },
    },
    {
      name: "The figure shrinks with its card, not the window",
      async run({ page, expect }) {
        const size = (ex) => page.locator(`[data-example="${ex}"] [data-slot="metric-card-value"]`).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        const wide = await size("row")
        const narrow = await size("narrow")
        expect(narrow < wide, `the figure in a 184px card (${narrow}px) is smaller than in a wider one (${wide}px), in the same window`)
      },
    },
    {
      name: "The hero leads its row with a bolder label and a wider trend, its figure on the others' line",
      example: "hero",
      async run({ scope, expect }) {
        const hero = scope.locator('[data-slot="metric-card"][data-hero]')
        const other = card(scope, "Overtime")
        expect.atLeast(Number(await style(hero.locator('[data-slot="metric-card-label"]'), "fontWeight")), 700, "the hero's label weight")
        expect(Number(await style(other.locator('[data-slot="metric-card-label"]'), "fontWeight")) < 700, "another card's label is lighter")
        const [h, o] = [await hero.locator('[data-slot="metric-card-value"]').boundingBox(), await other.locator('[data-slot="metric-card-value"]').boundingBox()]
        expect(Math.abs(h.y - o.y) <= 1, `the figures share a line (${Math.round(h.y)} and ${Math.round(o.y)})`)
        expect.atLeast(Math.round((await hero.locator('[data-slot="sparkline"]').boundingBox()).width), 160, "the hero's trend width")
      },
    },
    {
      name: "The label is text-muted and the figure text-strong, in both themes",
      example: "row",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const first = card(scope, "Net revenue")
        expect.equal(await style(first.locator('[data-slot="metric-card-label"]'), "color"), await colourOf(page, "text-muted"), "the label")
        expect.equal(await style(first.locator('[data-slot="metric-card-value"]'), "color"), await colourOf(page, "text-strong"), "the figure")
      },
    },
    {
      name: "Forced colours take the delta's colour away, and its judgement still shows as a word",
      example: "row",
      forcedColors: true,
      async run({ scope, expect }) {
        const word = card(scope, "Net revenue").locator('[data-slot="delta-judgement"]')
        expect(await word.isVisible(), "the judgement shows")
        expect.equal((await word.innerText()).trim(), "better", "in words")
      },
    },
    {
      name: "Reduced motion stands the skeleton still",
      example: "states",
      reducedMotion: true,
      async run({ scope, expect }) {
        const shapes = card(scope, "Net revenue").locator('[data-slot="skeleton"]')
        for (const shape of await shapes.all()) expect.equal(await style(shape, "animationName"), "none", "no shimmer")
      },
    },
    {
      name: "Shown open for a design, the hint takes no focus, no key and no tab stop",
      example: "hint-open",
      async run({ page, scope, expect }) {
        expect(await scope.locator('[data-slot="popover-content"]').isVisible(), "the hint shows without a press")
        expect(await page.evaluate(() => document.activeElement === document.body), "nothing took focus")
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards on the page")
        await page.evaluate(() => {
          window.__escapes = 0
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented) window.__escapes++ })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escapes), 1, "Escape reaches the page past the picture")
      },
    },
  ],
}
