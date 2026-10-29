// DatePicker's one definition: its README, its preview board and its scripted checks all come from here.

const row = (inner) => `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`
const field = (label, props, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.DatePicker" ${props}></x-import>\n</x-import>`

const focusedDay = (page) => page.evaluate(() => document.activeElement?.getAttribute("aria-label"))
const livePanel = '[data-radix-popper-content-wrapper] [data-slot="date-picker-panel"]'
const openPanels = (page) => page.evaluate(() => document.querySelectorAll("[data-radix-popper-content-wrapper]").length)
// The calendar puts focus on a day once it opens; wait for that before pressing anything else.
const dayInHand = (page) => page.waitForFunction(() => document.activeElement?.getAttribute("data-slot") === "calendar-day-button", null, { timeout: 3000 })
// The panel fades and grows in; measure it once that has finished.
const settled = (page) =>
  page.waitForFunction(() => {
    const panel = document.querySelector('[data-radix-popper-content-wrapper] [data-slot="date-picker-panel"]')
    return panel && panel.getAnimations({ subtree: true }).every((a) => a.playState !== "running")
  }, null, { timeout: 3000 })

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export default {
  name: "DatePicker",
  group: "Inputs",
  job: "A date, typed in the market's format or chosen from a calendar.",
  status: "to build",
  props: [
    { name: "value", type: "string", doc: "The chosen date as yyyy-mm-dd, when the page holds it." },
    { name: "defaultValue", type: "string", doc: "The date to start with, as yyyy-mm-dd, when the DatePicker holds it." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the chosen date as yyyy-mm-dd, or an empty string when the field is cleared." },
    { name: "min", type: "string", doc: "The earliest date that can be chosen, as yyyy-mm-dd. Earlier days are struck through and cannot be pressed." },
    { name: "max", type: "string", doc: "The latest date that can be chosen, as yyyy-mm-dd." },
    { name: "placeholder", type: "string", doc: "The shape a typed date takes. The locale's own by default: dd/mm/yyyy in en-AU." },
    { name: "open", type: "boolean", default: "false", doc: "Design mode: draws the calendar open in place, for a board. It takes no focus and blocks nothing. Never in a product." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen, with 16px text there." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this, and so does a typed date that does not read." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded, and the calendar does not open. Say why in the Field's hint." },
    { name: "required", type: "boolean", default: "false", doc: "Must be filled before the form saves. Inside a Field, the Field's required sets it." },
    { name: "name", type: "string", doc: "The form field's name: a hidden input carries the date as yyyy-mm-dd, for a native form post." },
    { name: "id", type: "string", doc: "The input's id. Inside a Field, the Field gives one." },
    { name: "ariaLabel", type: "string", doc: "The name of a DatePicker outside a Field (aria-label in a product)." },
  ],
  notes: {
    Behaviour: [
      "Typing a date always works, in the market's order (day first in en-AU): 21/10/2026, 21.10.26, 21 10, 21102026 from a number pad, 21 Oct 2026 or 2026-10-21. A missing year is this year; a two-digit year more than 20 years ahead is last century (85 is 1985); four digits first is a year first (2026/10/21). It is checked when the person leaves the field or presses Enter, never while they type.",
      "A date that does not read, or falls outside min and max, stays as typed and says what to enter, through the Field around it and the browser's own validity.",
      "The calendar button at the end of the field opens the calendar in a portal, and so does Down in the field. It opens on the chosen day, or today, with focus on that day.",
      "The calendar is a grid. Left and Right move a day, Up and Down a week, Page Up and Page Down a month (with Shift, a year), Home and End to the start and end of the week. The month is announced as it changes.",
      "Enter or Space chooses the day; the field shows it and focus is back in the field. Escape closes the calendar without choosing, with focus back in the field; a second Escape is left to the page.",
      "It closes at once, with no fade. Tab from the end of the calendar goes on to what follows the field, Shift Tab from its start goes back to the calendar button, and either closes it.",
      "The week starts on the locale's first day: Monday in en-AU. Weekday names and month names come from the locale, and each day is read in full: Today, Wednesday 28 October 2026.",
    ],
    States: [
      "Empty with the date's shape as a placeholder, filled, open, a typed date that does not read, invalid and disabled.",
      "In the calendar: the chosen day in the primary fill, today with a dot under the number, days outside min and max struck through, and days from the next or last month in the subtle text.",
    ],
    Copy: [
      "Errors say what to enter: Enter a date as dd/mm/yyyy. Choose a date from 02/11/2026 to 27/11/2026.",
      "The calendar button is named so it reads with any label, as the label is written: Open calendar, Due date (never Choose starts). The calendar is Calendar, Due date.",
      "A chosen date shows its day of the week beside it (Thu), and a screen reader hears it after the date (Thursday): a date in numbers alone leaves people counting.",
    ],
    Detector: ["Inside a Card or a FormSection the design detector reads the field box as a nested card. The box carries data-impeccable-ignore=\"nested-cards\", because it is a field. axe and every scripted check still run on it."],
    Rules: [
      "A date people know by heart (a birthday) is quicker typed: say the shape in the hint.",
      "Days are 36px, 44px on touch. The value is always yyyy-mm-dd; only what people read and type follows the locale.",
    ],
  },
  examples: [
    {
      id: "basics",
      title: "Empty, filled, and between two dates",
      layout: "block",
      markup: row(
        [
          field("Due date", "", ' hint="The invoice is due on this day."'),
          field("Start date", 'default-value="2026-11-02" name="start"'),
          field("Delivery date", 'min="2026-11-02" max="2026-11-27"', ' hint="Any day in November from the 2nd to the 27th."'),
        ].join("\n")
      ),
    },
    {
      id: "states",
      title: "Sizes, invalid and disabled",
      layout: "block",
      markup: row(
        [
          field("From", 'size="sm" default-value="2026-10-05"'),
          field("Review date", 'size="lg" default-value="2026-12-14"'),
          field("Date of birth", "", ' error="Enter a date as dd/mm/yyyy"'),
          field("Payment date", 'disabled="{{yes}}" default-value="2026-10-30"', ' hint="Set by the payment run."'),
        ].join("\n")
      ),
      vals: { yes: true },
    },
    {
      id: "open",
      title: "Drawn open for a design",
      layout: "block",
      markup: `<div style="width: 300px; height: 404px;">
${field("Visit date", 'open="{{yes}}" default-value="2026-10-21"')}
</div>`,
    },
  ],
  frame: { width: 960, height: 830 },
  checks: [
    {
      name: "A chosen date shows its day of the week and is read with it; the button reads with any label",
      async run({ page, expect }) {
        const start = page.getByRole("textbox", { name: "Start date" })
        expect.equal(await start.inputValue(), "02/11/2026", "the date in the market's numbers")
        const box = start.locator("xpath=ancestor::*[@data-slot='date-picker'][1]")
        // 2 November 2026 is a Monday, in the market's own words for it.
        const short = (await box.locator('[data-slot="date-picker-day"]').textContent()).trim()
        expect(short.length > 0 && short.length <= 4, `the short weekday beside it (${short})`)
        const described = await start.evaluate((el) => (el.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent.trim()).filter(Boolean).join(" "))
        expect(described.length > short.length && described.toLowerCase().startsWith(short.toLowerCase().replace(/\.$/, "")), `the weekday in full in its description (${described})`)
        expect.equal(await page.getByRole("textbox", { name: "Due date" }).evaluate((el) => el.closest('[data-slot="date-picker"]').querySelectorAll('[data-slot="date-picker-day"]').length), 0, "no weekday before a date is chosen")
        expect.equal(await page.getByRole("button", { name: "Open calendar, Due date" }).count(), 1, "the button names the field as it is written")
      },
    },
    {
      name: "The day of the week holds 4.5:1 on the field, in both themes, and a disabled field shows none",
      themes: ["light", "dark"],
      async run({ page, expect, theme }) {
        const days = await page.locator('[data-slot="date-picker-day"]').evaluateAll((all) =>
          all.map((el) => {
            // The ground is the nearest box with a fill, and anything faded on the way is faded with it.
            let ground = "rgba(0, 0, 0, 0)"
            let opacity = 1
            for (let at = el; at; at = at.parentElement) {
              opacity *= Number(getComputedStyle(at).opacity)
              const bg = getComputedStyle(at).backgroundColor
              if (ground === "rgba(0, 0, 0, 0)" && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) ground = bg
            }
            return { ink: getComputedStyle(el).color, ground, opacity }
          })
        )
        expect.atLeast(days.length, 3, "the chosen dates show their day")
        for (const d of days) {
          expect.equal(d.opacity, 1, "never faded")
          expect.atLeast(Math.round(contrast(d.ink, d.ground) * 100) / 100, 4.5, `${theme}: the day on its field`)
        }
        expect.equal(await page.getByRole("textbox", { name: "Payment date" }).evaluate((el) => el.closest('[data-slot="date-picker"]').querySelectorAll('[data-slot="date-picker-day"]').length), 0, "a disabled field shows no day")
      },
    },
    {
      name: "The calendar opens on the chosen day; arrows move by day and week, Page Up and Page Down by month, Home and End to the week's ends",
      example: "basics",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Open calendar, Start date" }).focus()
        await page.keyboard.press("Enter")
        await dayInHand(page)
        expect.equal(await focusedDay(page), "Monday 2 November 2026", "focus is on the chosen day")
        expect.equal(await page.locator(livePanel).getAttribute("role"), "dialog", "the calendar is a dialog")
        expect.equal(await page.locator(livePanel).getAttribute("aria-label"), "Calendar, Start date", "named for its field")
        await page.keyboard.press("ArrowRight")
        expect.equal(await focusedDay(page), "Tuesday 3 November 2026", "Right moves a day")
        await page.keyboard.press("ArrowDown")
        expect.equal(await focusedDay(page), "Tuesday 10 November 2026", "Down moves a week")
        await page.keyboard.press("PageDown")
        expect.equal(await focusedDay(page), "Thursday 10 December 2026", "Page Down moves a month")
        expect.equal((await page.locator(`${livePanel} [role="status"]`).first().textContent()).trim(), "December 2026", "the month shown is announced")
        await page.keyboard.press("PageUp")
        expect.equal(await focusedDay(page), "Tuesday 10 November 2026", "Page Up moves back a month")
        await page.keyboard.press("Home")
        expect.equal(await focusedDay(page), "Monday 9 November 2026", "Home goes to the start of the week, a Monday in en-AU")
        await page.keyboard.press("End")
        expect.equal(await focusedDay(page), "Sunday 15 November 2026", "End goes to the end of the week")
      },
    },
    {
      name: "Enter chooses the day, the calendar closes at once, and focus is back in the field",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("textbox", { name: "Start date" })
        await input.focus()
        await page.keyboard.press("ArrowDown")
        await dayInHand(page)
        await page.keyboard.press("ArrowRight")
        await page.keyboard.press("ArrowRight")
        await page.keyboard.press("Enter")
        const right = await page.evaluate(() => ({ focus: document.activeElement?.getAttribute("type"), panels: document.querySelectorAll("[data-radix-popper-content-wrapper]").length, guards: document.querySelectorAll("[data-radix-focus-guard]").length }))
        expect.equal(`${right.focus} ${right.panels} ${right.guards}`, "text 0 0", "focus in the field, the calendar and its guards gone at once")
        expect.equal(await input.inputValue(), "04/11/2026", "the field shows the day chosen, day first")
        expect.equal(await scope.locator('input[type="hidden"][name="start"]').inputValue(), "2026-11-04", "the value is yyyy-mm-dd")
      },
    },
    {
      name: "Tab from the end of the calendar goes on to the next field, Shift Tab from its start goes back to its button, and either closes it",
      example: "basics",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "Open calendar, Start date" })
        await button.focus()
        await page.keyboard.press("Enter")
        await dayInHand(page)
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => `${document.activeElement?.getAttribute("placeholder")} ${document.querySelectorAll("[data-radix-popper-content-wrapper]").length}`), "dd/mm/yyyy 0", "Tab from the grid went on to the next date field, and the calendar closed")
        expect.equal(await page.evaluate(() => document.activeElement?.closest('[data-slot="field"]')?.querySelector("label")?.textContent), "Delivery date", "the field after it")
        await button.focus()
        await page.keyboard.press("Enter")
        await dayInHand(page)
        await page.keyboard.press("Shift+Tab")
        await page.keyboard.press("Shift+Tab")
        await page.keyboard.press("Shift+Tab")
        // The button's own tooltip opens on focus, so count the calendar itself.
        expect.equal(await page.evaluate(() => `${document.activeElement?.getAttribute("aria-label")} ${document.querySelectorAll('[data-radix-popper-content-wrapper] [data-slot="date-picker-panel"]').length}`), "Open calendar, Start date 0", "Shift Tab past the month buttons went back to the calendar button, and the calendar closed")
      },
    },
    {
      name: "Escape closes the calendar without choosing, focus is back in the field, and a second Escape reaches the page",
      example: "basics",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__escapes = []
          window.addEventListener("keydown", (e) => e.key === "Escape" && window.__escapes.push(e.defaultPrevented))
        })
        await scope.getByRole("button", { name: "Open calendar, Start date" }).click()
        await dayInHand(page)
        await page.keyboard.press("PageDown")
        await page.keyboard.press("Escape")
        expect.equal(await openPanels(page), 0, "the calendar closed at once")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("type")), "text", "focus is in the field")
        expect.equal(await scope.getByRole("textbox", { name: "Start date" }).inputValue(), "02/11/2026", "nothing changed")
        await page.keyboard.press("Escape")
        expect.equal(JSON.stringify(await page.evaluate(() => window.__escapes)), "[true,false]", "the first Escape closed the calendar; the second reached the page")
      },
    },
    {
      name: "A typed date reads in the locale's order, and one that does not read is caught when the person leaves the field",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("textbox", { name: "Due date" })
        expect.equal(await input.getAttribute("placeholder"), "dd/mm/yyyy", "the placeholder shows the shape, day first")
        await input.click()
        await page.keyboard.type("3/4/27")
        expect.equal(await input.getAttribute("aria-invalid"), null, "nothing is checked while they type")
        await page.keyboard.press("Tab")
        expect.equal(await input.inputValue(), "03/04/2027", "3 April 2027, day first, written out in full")
        await input.fill("21 Oct")
        await page.keyboard.press("Enter")
        expect.equal(await input.inputValue(), `21/10/${new Date().getFullYear()}`, "a month name works, and a missing year is this year")
        await input.fill("1/1/85")
        await page.keyboard.press("Enter")
        expect.equal(await input.inputValue(), "01/01/1985", "a two-digit year more than 20 years ahead is last century: a birthday reads right")
        await input.fill("2026/10/21")
        await page.keyboard.press("Enter")
        expect.equal(await input.inputValue(), "21/10/2026", "four digits first is a year first")
        await input.fill("31/02/2026")
        await page.keyboard.press("Tab")
        expect.equal(await input.getAttribute("aria-invalid"), "true", "a day that does not exist is caught")
        expect.equal(await input.inputValue(), "31/02/2026", "and stays as typed")
        const message = await input.evaluate((el) => el.closest('[data-slot="field"]').querySelector('[data-slot="field-message"]').textContent.trim())
        expect.equal(message, "Enter a date as dd/mm/yyyy", "the Field says what to enter")
        await input.fill("28/02/2026")
        await page.keyboard.press("Tab")
        expect.equal(await input.getAttribute("aria-invalid"), null, "a good date clears the error")
      },
    },
    {
      name: "Days outside min and max cannot be chosen, and a typed date outside them says the range",
      example: "basics",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Open calendar, Delivery date" }).click()
        await dayInHand(page)
        const panel = page.locator(livePanel)
        expect.equal((await panel.locator('[role="status"]').first().textContent()).trim(), "November 2026", "it opens on the first month it allows")
        expect.equal(await panel.locator('button[data-day="2026-11-01"]').isDisabled(), true, "1 November is before min")
        expect.equal(await panel.locator('button[data-day="2026-11-28"]').isDisabled(), true, "28 November is after max")
        expect.equal(await panel.getByRole("button", { name: "Previous month" }).getAttribute("aria-disabled"), "true", "it does not page back past min")
        await page.keyboard.press("Escape")
        const input = scope.getByRole("textbox", { name: "Delivery date" })
        await input.fill("1/12/2026")
        await page.keyboard.press("Tab")
        const message = await input.evaluate((el) => el.closest('[data-slot="field"]').querySelector('[data-slot="field-message"]').textContent.trim())
        expect.equal(message, "Choose a date from 02/11/2026 to 27/11/2026", "the range in words")
      },
    },
    {
      name: "The week starts on Monday in en-AU, with the locale's weekday names",
      example: "basics",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Open calendar, Start date" }).click()
        await dayInHand(page)
        const head = await page.locator(`${livePanel} th`).evaluateAll((els) => els.map((el) => `${el.textContent.trim()}:${el.getAttribute("aria-label")}`))
        expect.equal(head.join(","), "Mon:Monday,Tue:Tuesday,Wed:Wednesday,Thu:Thursday,Fri:Friday,Sat:Saturday,Sun:Sunday", "Monday first, each named in full")
        const today = await page.evaluate(() => new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()))
        await page.getByRole("button", { name: "Previous month" }).click()
        const todayLabel = await page.locator(`${livePanel} button[aria-label^="Today, "]`).getAttribute("aria-label").catch(() => null)
        expect(todayLabel === null || todayLabel === `Today, ${today}`, "today is read as today, in full")
      },
    },
    {
      name: "The chosen day keeps the focus outline 2px clear of its fill, in both themes",
      example: "basics",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Open calendar, Start date" }).focus()
        await page.keyboard.press("Enter")
        await dayInHand(page)
        const day = await page.evaluate(() => {
          const button = document.activeElement
          const cell = button.closest("td")
          const s = getComputedStyle(button)
          const probe = document.createElement("span")
          document.body.append(probe)
          probe.style.color = "var(--focus)"
          const focus = getComputedStyle(probe).color
          probe.style.color = "var(--primary)"
          const primary = getComputedStyle(probe).color
          probe.remove()
          return { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineOffset}`, colour: s.outlineColor, focus, fill: getComputedStyle(cell).backgroundColor, primary, selected: cell.getAttribute("aria-selected") }
        })
        expect.equal(day.selected, "true", "the chosen day says so")
        expect.equal(day.fill, day.primary, "in the primary fill")
        expect.equal(day.outline, "solid 2px 2px", "the system's outline, 2px clear")
        expect.equal(day.colour, day.focus, "in the focus colour")
      },
    },
    {
      name: "Touch: 44px days and a 40px calendar button",
      example: "basics",
      touch: true,
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "Open calendar, Start date" })
        const b = await button.boundingBox()
        expect.atLeast(Math.round(Math.min(b.width, b.height)), 40, "the calendar button is a 40px target")
        await button.click()
        await dayInHand(page)
        await settled(page)
        const sizes = await page.locator(`${livePanel} [data-slot="calendar-day-button"]`).evaluateAll((els) => els.slice(0, 7).map((el) => Math.round(Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height))))
        for (const s of sizes) expect.atLeast(s, 44, "a 44px day on touch")
        const nav = await page.getByRole("button", { name: "Next month" }).boundingBox()
        expect.atLeast(Math.round(nav.height), 40, "the month buttons are 40px on touch")
      },
    },
    {
      name: "Forced colours keep the chosen day and the focused day visible",
      example: "basics",
      forcedColors: true,
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Open calendar, Start date" }).focus()
        await page.keyboard.press("Enter")
        await dayInHand(page)
        const chosen = await page.locator(`${livePanel} td[aria-selected="true"]`).evaluate((el) => getComputedStyle(el).forcedColorAdjust)
        expect.equal(chosen, "none", "the chosen day keeps its own Highlight fill")
        await page.keyboard.press("ArrowRight")
        expect.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), "solid", "the focused day is outlined")
        const rest = await page.locator(`${livePanel} [data-slot="calendar-day-button"]:not(:focus)`).first().evaluate((el) => getComputedStyle(el).outlineStyle)
        expect.equal(rest, "none", "a day at rest draws no outline")
      },
    },
    {
      name: "Drawn open for a design, it is a still picture: no focus guards, no tab stops in the calendar",
      example: "open",
      async run({ page, scope, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards")
        const panel = scope.locator('[data-slot="date-picker-panel"]')
        expect.equal(await panel.getAttribute("aria-label"), "Calendar, Visit date", "the drawn calendar is named for its field")
        expect.equal(await panel.locator("button, [tabindex]").count(), 0, "nothing in it can take focus")
        expect.equal(await panel.locator('td[data-selected]').count(), 1, "the chosen day is marked")
        expect.equal((await panel.locator('[data-selected]').textContent()).trim(), "21", "on the 21st")
        await scope.getByRole("textbox", { name: "Visit date" }).focus()
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "Open calendar, Visit date", "Tab reaches the field's own button")
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => (document.activeElement === document.body ? "body" : document.activeElement.tagName)), "body", "and then nothing else")
      },
    },
  ],
}
