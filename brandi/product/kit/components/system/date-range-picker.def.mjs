// DateRangePicker's one definition: its README, its preview board and its scripted checks all come from here.

const field = (label, props, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.DateRangePicker" ${props}></x-import>\n</x-import>`

const PRESETS = [
  { label: "This month", from: "2026-10-01", to: "2026-10-31" },
  { label: "Last month", from: "2026-09-01", to: "2026-09-30" },
  { label: "Last 30 days", from: "2026-09-28", to: "2026-10-27" },
  { label: "This quarter", from: "2026-10-01", to: "2026-12-31" },
  { label: "Last financial year", from: "2025-07-01", to: "2026-06-30" },
]

const livePanel = '[data-radix-popper-content-wrapper] [data-slot="date-range-picker-panel"]'
const focusedDay = (page) => page.evaluate(() => document.activeElement?.getAttribute("aria-label"))
const dayInHand = (page) => page.waitForFunction(() => document.activeElement?.getAttribute("data-slot") === "calendar-day-button", null, { timeout: 3000 })
const words = (scope, n = 0) => scope.locator('[data-slot="date-range-words"]').nth(n).textContent().then((t) => t.trim())
const settled = (page) =>
  page.waitForFunction(() => {
    const panel = document.querySelector('[data-radix-popper-content-wrapper] [data-slot="date-range-picker-panel"]')
    return panel && panel.getAnimations({ subtree: true }).every((a) => a.playState !== "running")
  }, null, { timeout: 3000 })

export default {
  name: "DateRangePicker",
  group: "Inputs",
  job: "A period for a report: two dates, typed or picked on a calendar, and said in words.",
  status: "to build",
  props: [
    { name: "value", type: "{ from?: string; to?: string }", doc: "The period's first and last days as yyyy-mm-dd, when the page holds it." },
    { name: "defaultValue", type: "{ from?: string; to?: string }", doc: "The period to start with, when the DateRangePicker holds it." },
    { name: "onChange", type: "(value: { from?: string; to?: string }) => void", doc: "Called with the period whenever either end changes." },
    { name: "min", type: "string", doc: "The earliest day that can be chosen, as yyyy-mm-dd." },
    { name: "max", type: "string", doc: "The latest day that can be chosen, as yyyy-mm-dd." },
    { name: "presets", type: "Array<{ label: string; from: string; to: string }>", doc: "Named periods, chosen in one press beside the calendar: This month, Last financial year." },
    { name: "compare", type: '"previous" | "year"', doc: "Says what the period is compared with: the period just before it (a whole month compares with the month before), or the same dates last year." },
    { name: "open", type: "boolean", default: "false", doc: "Design mode: draws the calendar open in place, for a board. It takes no focus and blocks nothing. Never in a product." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen, with 16px text there." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this, and so does a typed date that does not read." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded, and the calendar does not open. Say why in the Field's hint." },
    { name: "required", type: "boolean", default: "false", doc: "Both days must be filled before the form saves." },
    { name: "name", type: "string", doc: "The form field's name: hidden inputs carry name[from] and name[to] as yyyy-mm-dd." },
    { name: "id", type: "string", doc: "The first day's input id. Inside a Field, the Field gives one." },
    { name: "ariaLabel", type: "string", doc: "The name of a DateRangePicker outside a Field (aria-label in a product)." },
  ],
  notes: {
    Behaviour: [
      "Two dates in one field, each typed in the market's format as a DatePicker's is, and checked when the person leaves either one. An end before the start is caught and said.",
      "The calendar button, or Down in either date, opens the calendar in a portal on the period's first day. Two picks make the period: the first starts it, the second ends it, and a second pick before the first swaps them. While the end is chosen, the days it would take are shown in the light tint as the person moves.",
      "The calendar keeps a DatePicker's keys: arrows by day and week, Page Up and Page Down by month, Home and End to the week's ends, Enter to pick. Escape closes it without changing the period. Focus is back in the field either way.",
      "Named periods sit beside the calendar and set the period in one press. The one that matches the period says it is pressed.",
      "The period is said in words under the field: 1 to 31 October 2026, 31 days. With compare, it says what it is compared with, as a Delta does: vs 1 to 30 September 2026. The words are read with both dates, and spoken when the period changes, never on load.",
      "Two months sit side by side when the screen has room, one when it does not. The calendar footer says what to do next: Choose the last day.",
    ],
    States: ["Empty, a first day only (it asks for the last), a whole period, choosing in the calendar with a preview, a named period pressed, an end before the start, invalid and disabled."],
    Copy: [
      "Named periods are what people call them: This month, Last 30 days, Last financial year.",
      "The words use \"to\" between the days, never a dash, and count the days: 1 day, 31 days.",
    ],
    Detector: ["Inside a Card or a FormSection the design detector reads the field box as a nested card. The box carries data-impeccable-ignore=\"nested-cards\", because it is a field. axe and every scripted check still run on it."],
    Rules: [
      "One date: a DatePicker. A period of whole months only (a report by month): a Select of months.",
      "Give named periods for the periods the product's reports use. The value is always yyyy-mm-dd; only what people read and type follows the locale.",
    ],
    Accepted: [
      "Two months or one depends on the screen's width, not the field's: the calendar opens over the page in a portal, so the screen is the room it has (CONVENTIONS.md asks components to size by their container; a portal's container is the screen).",
    ],
  },
  examples: [
    {
      id: "basics",
      title: "A compared period, empty, and a first day only",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">
${field("Report period", 'default-value="{{october}}" compare="previous" name="report"')}
${field("Leave", "", ' hint="Your first and last days away."')}
${field("Stay", 'default-value="{{arriving}}"')}
${field("Sales period", 'default-value="{{quarter}}" compare="year"')}
</div>`,
      vals: { october: { from: "2026-10-01", to: "2026-10-31" }, arriving: { from: "2026-11-03" }, quarter: { from: "2026-07-01", to: "2026-09-30" } },
    },
    {
      id: "presets",
      title: "Named periods",
      layout: "block",
      markup: `<div style="width: 400px;">
${field("Period", 'presets="{{presets}}" default-value="{{october}}"')}
</div>`,
      vals: { presets: PRESETS },
    },
    {
      id: "states",
      title: "Small, invalid and disabled",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">
${field("Week", 'size="sm" default-value="{{week}}"')}
${field("Promotion", 'default-value="{{promo}}"', ' error="A promotion runs for 14 days at most. Choose an earlier last day."')}
${field("Billing period", 'disabled="{{yes}}" default-value="{{october}}"', ' hint="Set by your plan."')}
</div>`,
      vals: { week: { from: "2026-10-26", to: "2026-11-01" }, promo: { from: "2026-11-10", to: "2026-11-30" }, yes: true },
    },
    {
      id: "open",
      title: "Drawn open for a design, with named periods",
      layout: "block",
      markup: `<div style="width: 400px; height: 410px;">
${field("Reporting period", 'open="{{yes}}" presets="{{presets}}" default-value="{{october}}"')}
</div>`,
    },
  ],
  frame: { width: 960, height: 1084 },
  checks: [
    {
      name: "Two picks make the period, the calendar closes at once, focus is back in the field, and the field says it in words",
      example: "basics",
      async run({ page, scope, expect }) {
        expect.equal(await words(scope), "1 to 31 October 2026, 31 days, vs 1 to 30 September 2026", "a whole month is compared with the month before")
        await scope.getByRole("button", { name: "Choose report period" }).focus()
        await page.keyboard.press("Enter")
        await dayInHand(page)
        expect.equal(await focusedDay(page), "Thursday 1 October 2026", "the calendar opens on the period's first day")
        await page.keyboard.press("Enter")
        const footer = page.locator(`${livePanel} [role="status"]`).last()
        expect.equal((await footer.textContent()).trim(), "From 1 October 2026. Choose the last day.", "the first pick starts the period and asks for the last day")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")
        const right = await page.evaluate(() => `${document.activeElement?.getAttribute("type")} ${document.querySelectorAll("[data-radix-popper-content-wrapper]").length} ${document.querySelectorAll("[data-radix-focus-guard]").length}`)
        expect.equal(right, "text 0 0", "focus in the field, the calendar and its guards gone at once")
        const inputs = scope.locator('[data-slot="date-range-picker"]').first().locator("input")
        expect.equal(`${await inputs.nth(0).inputValue()}|${await inputs.nth(1).inputValue()}`, "01/10/2026|15/10/2026", "both dates, day first")
        expect.equal(await words(scope), "1 to 15 October 2026, 15 days, vs 16 to 30 September 2026", "said in words, against the 15 days before")
        expect.equal(await scope.locator('input[name="report[to]"]').inputValue(), "2026-10-15", "the value is yyyy-mm-dd")
      },
    },
    {
      name: "A second pick before the first swaps them, and the days the period would take are previewed as the person moves",
      example: "basics",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Choose report period" }).click()
        await dayInHand(page)
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")
        expect.equal(await focusedDay(page), "Thursday 15 October 2026", "the first pick is the 15th")
        await page.keyboard.press("ArrowLeft")
        await page.keyboard.press("ArrowLeft")
        await page.keyboard.press("ArrowLeft")
        const previewed = await page.locator(`${livePanel} td`).evaluateAll((cells) => {
          const probe = document.createElement("span")
          document.body.append(probe)
          probe.style.backgroundColor = "var(--selected)"
          const tint = getComputedStyle(probe).backgroundColor
          probe.remove()
          return cells.filter((c) => getComputedStyle(c).backgroundColor === tint).map((c) => c.textContent.trim()).join(",")
        })
        expect.equal(previewed, "12,13,14", "the days between are previewed in the light tint")
        await page.keyboard.press("Enter")
        expect.equal(await words(scope), "12 to 15 October 2026, 4 days, vs 8 to 11 October 2026", "the earlier pick became the first day")
        await scope.getByRole("button", { name: "Choose report period" }).click()
        await dayInHand(page)
        await page.keyboard.press("Enter")
        await page.keyboard.press("Enter")
        expect.equal(await words(scope), "12 October 2026, 1 day, vs 11 October 2026", "two picks on the same day make a one-day period, said once, in the singular")
        await scope.getByRole("button", { name: "Choose report period" }).click()
        await dayInHand(page)
        expect.equal((await page.locator(`${livePanel} [role="status"]`).last().textContent()).trim(), "12 October 2026, 1 day", "the calendar's footer says it in the singular too")
      },
    },
    {
      name: "Escape closes the calendar without changing the period, focus is back in the field, and a second Escape reaches the page",
      example: "basics",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__escapes = []
          window.addEventListener("keydown", (e) => e.key === "Escape" && window.__escapes.push(e.defaultPrevented))
        })
        await scope.getByRole("button", { name: "Choose report period" }).click()
        await dayInHand(page)
        await page.keyboard.press("Enter")
        await page.keyboard.press("PageDown")
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => document.querySelectorAll("[data-radix-popper-content-wrapper]").length), 0, "the calendar closed at once")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("type")), "text", "focus is in the field")
        expect.equal(await words(scope), "1 to 31 October 2026, 31 days, vs 1 to 30 September 2026", "the period is unchanged")
        await page.keyboard.press("Escape")
        expect.equal(JSON.stringify(await page.evaluate(() => window.__escapes)), "[true,false]", "the first Escape closed the calendar; the second reached the page")
      },
    },
    {
      name: "Typed dates work, a first day alone asks for the last, and an end before the start is caught on leaving",
      example: "basics",
      async run({ page, scope, expect }) {
        expect.equal(await words(scope, 2), "From 3 November 2026. Choose the last day.", "a first day alone asks for the last")
        const first = scope.getByRole("textbox", { name: "Leave first day" })
        const last = scope.getByRole("textbox", { name: "Leave last day" })
        expect.equal(await first.count(), 1, "each date is named with the field: Leave first day")
        await first.fill("3/11/2026")
        await last.fill("1/11/2026")
        await page.keyboard.press("Tab")
        expect.equal(await first.getAttribute("aria-invalid"), "true", "an end before the start is caught")
        const message = await first.evaluate((el) => el.closest('[data-slot="field"]').querySelector('[data-slot="field-message"]').textContent.trim())
        expect.equal(message, "End the period on or after its first day", "and said")
        await last.fill("14/11/2026")
        await page.keyboard.press("Tab")
        expect.equal(await first.getAttribute("aria-invalid"), null, "fixed, the error clears")
        expect.equal(await words(scope, 1), "3 to 14 November 2026, 12 days", "and the period is said in words")
      },
    },
    {
      name: "The words are read with both dates, and live, so a change is spoken and the load is not",
      example: "basics",
      async run({ scope, expect }) {
        const region = scope.locator('[data-slot="date-range-words"]').first()
        expect.equal(await region.getAttribute("aria-live"), "polite", "a polite live region, there from the start")
        const id = await region.getAttribute("id")
        for (const name of ["Report period first day", "Report period last day"]) {
          const ids = (await scope.getByRole("textbox", { name }).getAttribute("aria-describedby")).split(" ")
          expect(ids.includes(id), `${name} is described by the words`)
        }
        expect.equal(await scope.getByRole("group", { name: "Report period" }).count(), 1, "the two dates are one group, named by the field")
      },
    },
    {
      name: "A named period sets the period in one press, closes the calendar, and says it is pressed",
      example: "presets",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Choose period" }).click()
        await dayInHand(page)
        const thisMonth = page.locator(livePanel).getByRole("button", { name: "This month" })
        expect.equal(await thisMonth.getAttribute("aria-pressed"), "true", "the period in the field is pressed")
        await page.locator(livePanel).getByRole("button", { name: "Last financial year" }).click()
        expect.equal(await page.evaluate(() => document.querySelectorAll("[data-radix-popper-content-wrapper]").length), 0, "the calendar closed")
        expect.equal(await words(scope), "1 July 2025 to 30 June 2026, 365 days", "the period is set and said")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("type")), "text", "focus is in the field")
      },
    },
    {
      name: "Two months side by side when the screen has room, one when it does not",
      example: "presets",
      viewport: { width: 640, height: 900 },
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Choose period" }).click()
        await dayInHand(page)
        expect.equal(await page.locator(`${livePanel} [role="grid"]`).count(), 1, "one month on a 640px screen")
        const fits = await page.locator(livePanel).evaluate((el) => el.getBoundingClientRect().right <= window.innerWidth)
        expect(fits, "and the panel stays on screen")
        await page.setViewportSize({ width: 1280, height: 900 })
        await page.keyboard.press("Escape")
        await scope.getByRole("button", { name: "Choose period" }).click()
        await dayInHand(page)
        expect.equal(await page.locator(`${livePanel} [role="grid"]`).count(), 2, "two months on a wide screen")
      },
    },
    {
      name: "A period's days hold their colours in both themes: ends in the primary fill, the middle a band with readable text",
      example: "basics",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Choose report period" }).click()
        await dayInHand(page)
        await settled(page)
        const look = await page.locator(livePanel).evaluate((panel) => {
          const probe = document.createElement("span")
          document.body.append(probe)
          const colour = (role) => ((probe.style.color = `var(--${role})`), getComputedStyle(probe).color)
          const roles = { primary: colour("primary"), band: colour("selected-strong"), text: colour("text-strong") }
          probe.remove()
          const cell = (iso) => panel.querySelector(`td[data-day="${iso}"]`)
          const s = (iso) => getComputedStyle(cell(iso))
          return { roles, start: s("2026-10-01").backgroundColor, middle: s("2026-10-15").backgroundColor, middleText: s("2026-10-15").color, end: s("2026-10-31").backgroundColor }
        })
        expect.equal(look.start, look.roles.primary, "the first day in the primary fill")
        expect.equal(look.end, look.roles.primary, "the last day too")
        expect.equal(look.middle, look.roles.band, "the middle a band in the strong selected tint")
        const channel = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        const lum = (rgb) => {
          const [r, g, b] = rgb.match(/[\d.]+/g).map(Number)
          return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
        }
        const [x, y] = [lum(look.middleText), lum(look.middle)].sort((m, n) => n - m)
        expect.atLeast(Number(((x + 0.05) / (y + 0.05)).toFixed(2)), 4.5, "text on the band")
      },
    },
    {
      name: "Touch: 44px days and a 40px calendar button",
      example: "presets",
      touch: true,
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "Choose period" })
        const b = await button.boundingBox()
        expect.atLeast(Math.round(Math.min(b.width, b.height)), 40, "the calendar button is a 40px target")
        await button.click()
        await dayInHand(page)
        await settled(page)
        const sizes = await page.locator(`${livePanel} [data-slot="calendar-day-button"]`).evaluateAll((els) => els.slice(0, 7).map((el) => Math.round(Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height))))
        for (const s of sizes) expect.atLeast(s, 44, "a 44px day on touch")
        const preset = await page.locator(livePanel).getByRole("button", { name: "Last month" }).boundingBox()
        expect.atLeast(Math.round(preset.height), 40, "a named period is a 40px target on touch")
      },
    },
    {
      name: "Forced colours keep the period's ends filled and its middle edged",
      example: "basics",
      forcedColors: true,
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Choose report period" }).click()
        await dayInHand(page)
        const look = await page.locator(livePanel).evaluate((panel) => ({
          start: getComputedStyle(panel.querySelector('td[data-day="2026-10-01"]')).forcedColorAdjust,
          middle: getComputedStyle(panel.querySelector('td[data-day="2026-10-15"]')).borderTopStyle,
        }))
        expect.equal(look.start, "none", "the first day keeps its Highlight fill")
        expect.equal(look.middle, "solid", "the middle days are edged")
      },
    },
    {
      name: "Drawn open for a design, it is a still picture: no focus guards, and nothing in it takes focus",
      example: "open",
      async run({ page, scope, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards")
        const panel = scope.locator('[data-slot="date-range-picker-panel"]')
        expect.equal(await panel.locator('[role="grid"]').count(), 2, "two months drawn")
        expect.equal(await panel.locator("button").evaluateAll((els) => els.filter((el) => el.tabIndex >= 0).length), 0, "the named periods take no focus")
        expect.equal(await panel.locator("td button").count(), 0, "the days are a picture")
        expect.equal(await panel.locator("td[data-selected]:not([data-hidden])").count(), 31, "the whole period is marked, once")
      },
    },
  ],
}
