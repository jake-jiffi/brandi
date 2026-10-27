// TimePicker's one definition: its README, its preview board and its scripted checks all come from here.

const row = (inner) => `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`
const field = (label, props, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.TimePicker" ${props}></x-import>\n</x-import>`

const inHand = (page) =>
  page.evaluate(() => {
    const id = document.activeElement?.getAttribute("aria-activedescendant")
    return id ? (document.getElementById(id)?.textContent ?? "").trim() : null
  })
const message = (input) => input.evaluate((el) => el.closest('[data-slot="field"]').querySelector('[data-slot="field-message"]').textContent.trim())
const settled = (page) =>
  page.waitForFunction(() => {
    const panel = document.querySelector('[data-radix-popper-content-wrapper] [data-slot="combobox-panel"]')
    return panel && panel.getAnimations({ subtree: true }).every((a) => a.playState !== "running")
  }, null, { timeout: 3000 })

export default {
  name: "TimePicker",
  group: "Inputs",
  job: "A time, typed or chosen from a list, in the market's locale.",
  status: "to build",
  props: [
    { name: "value", type: "string", doc: "The chosen time as HH:mm on the 24-hour clock, when the page holds it." },
    { name: "defaultValue", type: "string", doc: "The time to start with, as HH:mm, when the TimePicker holds it." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the chosen time as HH:mm, or an empty string when the field is cleared." },
    { name: "step", type: "number", default: "15", doc: "Minutes between the times in the list. Any time can still be typed." },
    { name: "min", type: "string", doc: "The earliest time in the list and the earliest accepted, as HH:mm." },
    { name: "max", type: "string", doc: "The latest time in the list and the latest accepted, as HH:mm." },
    { name: "from", type: "string", doc: "A start time, as HH:mm. The list begins after it, each time shows how long from it in hours (8.5 h), and a time typed without am or pm reads as the one after it." },
    { name: "placeholder", type: "string", doc: "An example of a time to type, such as 9:30 am. Never an instruction." },
    { name: "open", type: "boolean", default: "false", doc: "Design mode: draws the list open in place, for a board. It takes no focus and blocks nothing. Never in a product." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen, with 16px text there." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this, and so does a typed time that does not read." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and closed. Say why in the Field's hint." },
    { name: "required", type: "boolean", default: "false", doc: "Must be filled before the form saves. Inside a Field, the Field's required sets it." },
    { name: "name", type: "string", doc: "The form field's name: a hidden input carries the time as HH:mm, for a native form post." },
    { name: "id", type: "string", doc: "The input's id. Inside a Field, the Field gives one." },
    { name: "ariaLabel", type: "string", doc: "The name of a TimePicker outside a Field (aria-label in a product)." },
  ],
  notes: {
    Behaviour: [
      "A combobox whose list suggests and never filters: focus stays on the input, and the input points at the time in hand.",
      "Typing moves the list to the time it starts, or the one it reads as (930, 9.30, 21:30, 9pm), with that time in hand. Of the times that start the same way, the one nearest the chosen time is in hand, so 12 is noon and not midnight.",
      "Enter takes the time typed, even one between the list's steps (9:50 pm); after Up or Down, Enter takes the time in hand. Escape closes the list and keeps what was typed; a second Escape is left to the page.",
      "Down or Up opens the list at the chosen time, or the nearest. Alt and Up closes it. The clock at the end of the field, or a press on the field, opens it; a press on the Field's label only focuses it.",
      "Times read in the market's locale: 9:30 pm in en-AU, 21:30 where the 24-hour clock is the norm. The value is always HH:mm.",
      "With a start time (from), the list begins after it, and each time says how long that is in hours, through the formatter's hours style, so what people type and what they read agree. A finish typed without am or pm reads as the one after the start: 5 after a start of 9 is 5 pm.",
      "A time that does not read, or falls outside min and max, is caught when the person leaves the field, never while they type, and says what to enter through the Field.",
    ],
    States: ["Empty with an example as a placeholder, filled, open with the time in hand and the chosen time ticked, a typed time that does not read, invalid and disabled."],
    Copy: ["Errors say what to enter: Enter a time like 9:30 am. Choose a time after 9:00 am."],
    Rules: [
      "A duration on its own (7.5 hours on a timesheet) is a NumberInput with an h suffix, not a TimePicker.",
      "Times are 36px rows, 44px on touch. Keep the step to what the product records: 15 minutes for shifts, 30 for bookings.",
    ],
  },
  examples: [
    {
      id: "basics",
      title: "A start, a finish that counts the hours, and empty",
      layout: "block",
      markup: row(
        [
          field("Start", 'default-value="09:00" name="start"'),
          field("Finish", 'from="09:00" default-value="17:00" name="finish"', ' hint="Hours are counted from the start."'),
          field("Reminder", 'placeholder="9:30 am" name="reminder"'),
        ].join("\n")
      ),
    },
    {
      id: "states",
      title: "Sizes, a 30-minute step, invalid and disabled",
      layout: "block",
      markup: row(
        [
          field("Opens", 'size="sm" step="{{thirty}}" default-value="07:30"'),
          field("Booking", 'size="lg" step="{{thirty}}" min="10:00" max="21:00" default-value="18:30"', ' hint="From 10:00 am to 9:00 pm."'),
          field("Pick-up", 'placeholder="9:30 am"', ' error="Enter a time like 9:30 am"'),
          field("Cut-off", 'disabled="{{yes}}" default-value="15:00"', ' hint="Set by the delivery partner."'),
        ].join("\n")
      ),
      vals: { thirty: 30, yes: true },
    },
    {
      id: "open",
      title: "Drawn open for a design",
      layout: "block",
      markup: `<div style="width: 300px; height: 316px;">
${field("End of shift", 'open="{{yes}}" from="09:00" default-value="17:30"')}
</div>`,
    },
  ],
  frame: { width: 960, height: 800 },
  checks: [
    {
      name: "Typing moves the list to the time it reads as, and Enter takes what was typed, written in the locale's way",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Reminder" })
        await input.focus()
        await page.keyboard.type("930")
        await page.getByRole("listbox", { name: "Reminder" }).waitFor()
        expect.equal(await inHand(page), "9:30 am", "930 puts 9:30 am in hand")
        await page.keyboard.press("Enter")
        expect.equal(await input.inputValue(), "9:30 am", "the field reads 9:30 am")
        expect.equal(await scope.locator('input[type="hidden"][name="reminder"]').inputValue(), "09:30", "the value is HH:mm")
        expect.equal(await page.evaluate(() => document.querySelectorAll("[data-radix-popper-content-wrapper]").length), 0, "the list closed")
        await input.fill("")
        await page.keyboard.type("12")
        expect.equal(await inHand(page), "12:00 pm", "12 is noon, not midnight")
        await input.fill("")
        await page.keyboard.type("9:50 pm")
        await page.keyboard.press("Enter")
        expect.equal(await input.inputValue(), "9:50 pm", "a time between the list's steps is taken as typed")
        expect(await input.evaluate((el) => document.activeElement === el), "focus stayed on the input")
      },
    },
    {
      name: "Down opens the list at the chosen time, Down moves, and Enter takes the time in hand",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Start" })
        await input.focus()
        await page.keyboard.press("ArrowDown")
        await page.getByRole("listbox", { name: "Start" }).waitFor()
        expect.equal(await inHand(page), "9:00 am", "the chosen time is in hand")
        expect.equal(await page.getByRole("listbox", { name: "Start" }).getByRole("option", { selected: true }).textContent(), "9:00 am", "and marked as chosen")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        expect.equal(await inHand(page), "9:30 am", "Down moved a step at a time")
        await page.keyboard.press("Enter")
        expect.equal(await input.inputValue(), "9:30 am", "Enter took the time in hand")
        expect.equal(await scope.locator('input[type="hidden"][name="start"]').inputValue(), "09:30", "as HH:mm")
      },
    },
    {
      name: "A finish counts the hours from the start, in the hours style, and reads 5 as 5 pm",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Finish" })
        await input.focus()
        await page.keyboard.press("ArrowDown")
        const list = page.getByRole("listbox", { name: "Finish" })
        await list.waitFor()
        const first = (await list.getByRole("option").first().textContent()).trim()
        expect.equal(first, "9:15 am0.25 h", "the list begins a step after the start, with how long that is")
        expect.equal((await list.getByRole("option", { selected: true }).textContent()).trim(), "5:00 pm8 h", "the chosen finish is 8 h after the start")
        await input.fill("")
        await page.keyboard.type("5")
        await page.keyboard.press("Tab")
        expect.equal(await input.inputValue(), "5:00 pm", "5 after a start of 9 is 5 pm")
        expect.equal(await scope.locator('input[type="hidden"][name="finish"]').inputValue(), "17:00", "17:00")
      },
    },
    {
      name: "A time that does not read, or is before the start, is caught when the person leaves the field",
      example: "basics",
      async run({ page, scope, expect }) {
        const reminder = scope.getByRole("combobox", { name: "Reminder" })
        await reminder.focus()
        await page.keyboard.type("25:00")
        expect.equal(await reminder.getAttribute("aria-invalid"), null, "nothing is checked while they type")
        await page.keyboard.press("Escape")
        await page.keyboard.press("Tab")
        expect.equal(await reminder.getAttribute("aria-invalid"), "true", "caught on leaving")
        expect.equal(await message(reminder), "Enter a time like 9:30 am", "the Field says what to enter")
        expect.equal(await reminder.inputValue(), "25:00", "what was typed stays")
        const finish = scope.getByRole("combobox", { name: "Finish" })
        await finish.fill("8:00 am")
        await page.keyboard.press("Tab")
        expect.equal(await message(finish), "Choose a time after 9:00 am", "a finish before the start says so")
        await finish.fill("6pm")
        await page.keyboard.press("Tab")
        expect.equal(await finish.getAttribute("aria-invalid"), null, "a good time clears it")
        expect.equal(await finish.inputValue(), "6:00 pm", "and is written out")
      },
    },
    {
      name: "Escape closes the list and keeps what was typed, focus on the input; a second Escape reaches the page",
      example: "basics",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__escapes = []
          window.addEventListener("keydown", (e) => e.key === "Escape" && window.__escapes.push(e.defaultPrevented))
        })
        const input = scope.getByRole("combobox", { name: "Start" })
        // A press on the label only focuses the input; Down opens the list.
        await scope.getByText("Start", { exact: true }).click()
        expect.equal(await page.evaluate(() => `${document.activeElement?.getAttribute("role")} ${document.querySelectorAll("[data-radix-popper-content-wrapper]").length}`), "combobox 0", "the label focused the input and opened nothing")
        await page.keyboard.press("ArrowDown")
        await page.getByRole("listbox", { name: "Start" }).waitFor()
        await page.keyboard.press("Escape")
        const right = await page.evaluate(() => `${document.activeElement?.getAttribute("role")} ${document.querySelectorAll("[data-radix-popper-content-wrapper]").length} ${document.querySelectorAll("[data-radix-focus-guard]").length}`)
        expect.equal(right, "combobox 0 0", "focus on the input, the list and its guards gone at once")
        await page.keyboard.press("Escape")
        expect.equal(JSON.stringify(await page.evaluate(() => window.__escapes)), "[true,false]", "the first Escape closed the list; the second reached the page")
      },
    },
    {
      name: "The chosen time scrolls into view when the list opens",
      example: "states",
      async run({ page, scope, expect }) {
        await scope.getByRole("combobox", { name: "Booking" }).focus()
        await page.keyboard.press("ArrowDown")
        await page.getByRole("listbox", { name: "Booking" }).waitFor()
        await settled(page)
        const shown = await page.evaluate(() => {
          const option = document.getElementById(document.activeElement.getAttribute("aria-activedescendant")).getBoundingClientRect()
          const panel = document.querySelector('[data-radix-popper-content-wrapper] [data-slot="combobox-panel"]')
          const view = panel.getBoundingClientRect()
          return { inView: option.top >= view.top - 1 && option.bottom <= view.bottom + 1, scrolls: panel.scrollHeight > panel.clientHeight, first: panel.querySelector('[role="option"]').textContent, last: [...panel.querySelectorAll('[role="option"]')].pop().textContent }
        })
        expect(shown.scrolls, "the list is long enough to scroll")
        expect(shown.inView, "6:30 pm is in view")
        expect.equal(`${shown.first}|${shown.last}`, "10:00 am|9:00 pm", "the list keeps to min and max, every 30 minutes")
      },
    },
    {
      name: "Touch: 44px options, a 40px clock and 16px text",
      example: "basics",
      touch: true,
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Start" })
        expect.equal(await input.evaluate((el) => getComputedStyle(el).fontSize), "16px", "16px text on touch")
        const toggle = await input.evaluate((el) => el.closest('[data-slot="time-picker"]').querySelector('[data-slot="combobox-toggle"]').getBoundingClientRect().width)
        expect.atLeast(Math.round(toggle), 40, "the clock is a 40px target")
        await input.focus()
        await page.keyboard.press("ArrowDown")
        await page.getByRole("listbox", { name: "Start" }).waitFor()
        await settled(page)
        for (const option of (await page.getByRole("listbox", { name: "Start" }).getByRole("option").all()).slice(30, 36)) expect.atLeast(Math.round((await option.boundingBox()).height), 44, "a 44px option")
      },
    },
    {
      name: "Forced colours keep the time in hand outlined, in both themes' structure",
      example: "basics",
      forcedColors: true,
      async run({ page, scope, expect }) {
        await scope.getByRole("combobox", { name: "Start" }).focus()
        await page.keyboard.press("ArrowDown")
        const option = await page.evaluate(() => {
          const el = document.getElementById(document.activeElement.getAttribute("aria-activedescendant"))
          return `${getComputedStyle(el).outlineStyle} ${parseFloat(getComputedStyle(el).outlineWidth) >= 2}`
        })
        expect.equal(option, "solid true", "the time in hand is outlined")
      },
    },
    {
      name: "Drawn open for a design, it is a still picture with the chosen time in view and its hours shown",
      example: "open",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards")
        const list = scope.getByRole("listbox", { name: "End of shift" })
        const chosen = list.getByRole("option", { selected: true })
        expect.equal((await chosen.textContent()).trim(), "5:30 pm8.5 h", "5:30 pm is chosen, 8.5 h after the start")
        const inView = await chosen.evaluate((el) => {
          const o = el.getBoundingClientRect()
          const p = el.closest('[data-slot="combobox-panel"]').getBoundingClientRect()
          return o.top >= p.top - 1 && o.bottom <= p.bottom + 1
        })
        expect(inView, "and in view in the drawn list")
        expect.equal(await scope.getByRole("option").evaluateAll((els) => els.filter((el) => el.tabIndex >= 0).length), 0, "the options take no focus")
      },
    },
  ],
}
