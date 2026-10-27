// NumberInput's one definition: its README, its preview board and its scripted checks all come from here.

const row = (inner) => `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`
const field = (label, input, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.NumberInput" ${input}></x-import>\n</x-import>`

// Runs in the page: the wrapper's edge and the system's colours.
function readEdge(el) {
  const s = getComputedStyle(el.closest('[data-slot="number-input"]'))
  const probe = document.createElement("span")
  document.body.append(probe)
  const colour = (role) => ((probe.style.color = `var(--${role})`), getComputedStyle(probe).color)
  const out = { border: s.borderTopColor, width: parseFloat(s.borderTopWidth), shadow: s.boxShadow, focus: colour("focus"), danger: colour("danger") }
  probe.remove()
  return out
}
const twoPx = (e, colour) => e.border === colour && e.width === 1 && e.shadow.includes(colour) && /0px 0px 0px 1px/.test(e.shadow)
const message = (scope, label) => scope.locator('[data-slot="field"]').filter({ hasText: label }).locator('[data-slot="field-message"]')

export default {
  name: "NumberInput",
  group: "Inputs",
  job: "A quantity or an amount, with step buttons.",
  status: "to build",
  props: [
    { name: "value", type: "number | null", doc: "The number, when the page holds it. null is empty." },
    { name: "defaultValue", type: "number | null", default: "null", doc: "The number to start with, when the NumberInput holds it." },
    { name: "onChange", type: "(value: number | null) => void", doc: "Called on a step, an arrow key, or when a typed value is checked on leaving the field." },
    { name: "min", type: "number", doc: "The lowest it takes. Its step button turns off there." },
    { name: "max", type: "number", doc: "The highest it takes. Its step button turns off there." },
    { name: "step", type: "number", default: "1", doc: "How far a step button or an arrow key moves the value." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen, with 16px text and 44px step buttons there." },
    { name: "prefix", type: "ReactNode", doc: "Text before the value, such as $. Read with the field." },
    { name: "suffix", type: "ReactNode", doc: "Text after the value, such as kg or %. Read with the field." },
    { name: "stepLabel", type: "string", doc: "What the step buttons change, for their names: quantity gives Increase quantity. The Field's label by default." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this." },
    { name: "disabled, readOnly", type: "boolean", default: "false", doc: "Disabled fades everything. Read-only is a dashed edge and a lock, with no step buttons." },
    { name: "inputMode", type: "string", doc: "numeric for whole numbers and decimal for amounts by default; text only when the range goes below zero, because phone keypads have no minus sign." },
    { name: "name, readOnly, disabled and the rest", type: "native", doc: "Every native input prop it does not set itself passes through to the input." },
  ],
  notes: {
    Behaviour: [
      "A spin button: a screen reader hears the label, spin button, and the value, with the prefix and suffix read with the field.",
      "Up and Down step the value, within min and max.",
      "The step buttons are named by what they change (Increase quantity). They sit out of the tab order, because Up and Down do the same from the field, and a press keeps the caret in the field and says the new value politely.",
      "On a desktop the two step buttons sit together at the end. On touch, Decrease moves to the start, so the two 44px targets sit apart with the value between them.",
      "A typed value is checked when the person leaves the field or presses Enter, never while they type. Not a number, or out of range, stays as typed, turns the field invalid, and the Field around it says what to enter (Enter a number from 1 to 99).",
      "Numbers show through the system's formatter, and what people type is read with the market's separators, so 1,250.5 and 1250.5 are the same.",
    ],
    States: ["The input's edge: a 2px focus edge, a danger edge that stays danger when focused, dashed with a lock when read-only. A step button turns off at its limit."],
    Copy: ["The hint gives the range (From 1 to 99) so the check never surprises anyone."],
    Rules: [
      "Put it in a Field: the Field names it, names its step buttons and shows its message.",
      "For a range of values, use two NumberInputs or a slider; for a year or a code that only looks like a number, use a TextInput.",
    ],
    Open: ["To build, not yet proven: no review round has checked it. Page Up, Page Down, Home and End are left to the text field rather than stepping."],
  },
  examples: [
    {
      id: "basics",
      title: "A quantity, an amount and a percentage",
      layout: "block",
      markup: row(
        [
          field("Quantity", 'min="{{one}}" max="{{ninetyNine}}" default-value="{{three}}"', ' hint="From 1 to 99."'),
          field("Amount", 'prefix="$" min="{{zero}}" step="{{cent}}" default-value="{{amount}}"'),
          field("Discount", 'suffix="%" min="{{zero}}" max="{{hundred}}" step="{{five}}" default-value="{{ten}}"'),
        ].join("\n")
      ),
      vals: { one: 1, ninetyNine: 99, three: 3, zero: 0, cent: 0.01, amount: 1250.5, hundred: 100, five: 5, ten: 10 },
    },
    {
      id: "states",
      title: "At the limit, invalid, read-only and disabled",
      layout: "block",
      markup: row(
        [
          field("Seats", 'min="{{one}}" max="{{ten}}" default-value="{{ten}}"', ' hint="Your plan has 10."'),
          field("Hours", 'suffix="h" min="{{zero}}" max="{{twentyFour}}" step="{{quarter}}" default-value="{{twentySix}}"', ' error="Enter hours from 0 to 24"'),
          field("Award rate", 'prefix="$" readonly="{{yes}}" default-value="{{rate}}"', ' hint="Set by the award. Change it in Pay rates."'),
          field("Units", 'disabled="{{yes}}" default-value="{{four}}"', ' hint="Locked once the order ships."'),
        ].join("\n")
      ),
      vals: { twentyFour: 24, quarter: 0.25, twentySix: 26, yes: true, rate: 31.86, four: 4 },
    },
    {
      id: "sizes",
      title: "Sizes",
      layout: "block",
      markup: row(
        [
          field("Packs", 'size="sm" min="{{one}}" default-value="{{two}}"'),
          field("Boxes", 'min="{{one}}" max="{{twenty}}" default-value="{{two}}"'),
          field("Guests", 'size="lg" min="{{one}}" default-value="{{two}}"'),
        ].join("\n")
      ),
      vals: { two: 2, twenty: 20 },
    },
  ],
  frame: { width: 960, height: 548 },
  checks: [
    {
      name: "It reads as a spin button with its value and range, and its label focuses it",
      example: "basics",
      async run({ scope, expect }) {
        const quantity = scope.getByRole("spinbutton", { name: "Quantity" })
        expect.equal([await quantity.getAttribute("aria-valuenow"), await quantity.getAttribute("aria-valuemin"), await quantity.getAttribute("aria-valuemax")].join(","), "3,1,99", "value and range")
        await scope.getByText("Quantity", { exact: true }).click()
        expect(await quantity.evaluate((el) => document.activeElement === el), "the label focuses it")
      },
    },
    {
      name: "Up and Down step the value, within its range",
      example: "basics",
      async run({ page, scope, expect }) {
        const quantity = scope.getByRole("spinbutton", { name: "Quantity" })
        await quantity.focus()
        await page.keyboard.press("ArrowUp")
        expect.equal(await quantity.inputValue(), "4", "Up adds one")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        expect.equal(await quantity.inputValue(), "1", "Down stops at the minimum")
        expect.equal(await quantity.getAttribute("aria-valuenow"), "1", "and says so")
        const discount = scope.getByRole("spinbutton", { name: "Discount" })
        await discount.focus()
        await page.keyboard.press("ArrowUp")
        expect.equal(await discount.inputValue(), "15", "a step of 5")
      },
    },
    {
      name: "The step buttons are named by what they change, keep the caret in the field, and say the new value",
      example: "basics",
      async run({ scope, expect }) {
        const quantity = scope.getByRole("spinbutton", { name: "Quantity" })
        await quantity.focus()
        await scope.getByRole("button", { name: "Increase quantity" }).click()
        expect.equal(await quantity.inputValue(), "4", "Increase adds one")
        expect(await quantity.evaluate((el) => document.activeElement === el), "the caret stays in the field")
        expect.equal((await scope.locator('[data-slot="number-input"]').first().locator('[aria-live="polite"]').textContent()).trim(), "4", "the new value is said")
        expect.equal(await scope.getByRole("button", { name: "Decrease quantity" }).getAttribute("tabindex"), "-1", "out of the tab order")
        await scope.getByRole("button", { name: "Decrease amount" }).click()
        expect.equal(await scope.getByRole("spinbutton", { name: "Amount" }).inputValue(), "1,250.49", "a step of one cent, through the formatter")
      },
    },
    {
      name: "A typed value is checked when the person leaves the field, never while they type",
      example: "basics",
      async run({ page, scope, expect }) {
        const quantity = scope.getByRole("spinbutton", { name: "Quantity" })
        const region = message(scope, "Quantity")
        await quantity.fill("")
        await page.keyboard.type("150")
        expect.equal((await region.textContent()).trim(), "", "nothing while they type")
        expect.equal(await quantity.getAttribute("aria-invalid"), null, "not invalid while they type")
        await page.keyboard.press("Tab")
        expect.equal((await region.textContent()).trim(), "Enter a number from 1 to 99", "checked on leaving, and announced")
        expect.equal(await quantity.getAttribute("aria-invalid"), "true", "invalid")
        expect.equal(await quantity.inputValue(), "150", "what they typed stays")
        await quantity.fill("12")
        await page.keyboard.press("Tab")
        expect.equal((await region.textContent()).trim(), "", "a good value clears the message")
        expect.equal(await quantity.getAttribute("aria-valuenow"), "12", "and is the new value")
        await quantity.fill("about 12")
        await page.keyboard.press("Enter")
        expect.equal((await region.textContent()).trim(), "Enter a number from 1 to 99", "Enter checks it too")
      },
    },
    {
      name: "The prefix and suffix are read with the field, and phones get the right keypad",
      example: "basics",
      async run({ scope, expect }) {
        const read = async (name) => scope.getByRole("spinbutton", { name }).evaluate((el) => (el.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent).join("|"))
        expect.equal(await read("Amount"), "$", "Amount is read with its $")
        expect.equal(await read("Discount"), "%", "Discount is read with its %")
        const modes = await scope.getByRole("spinbutton").evaluateAll((els) => els.map((el) => el.getAttribute("inputmode")).join(","))
        expect.equal(modes, "numeric,decimal,numeric", "digits for whole numbers, a decimal point for the amount")
      },
    },
    {
      name: "At a limit, that step button is off; read-only has no step buttons",
      example: "states",
      async run({ scope, expect }) {
        expect(await scope.getByRole("button", { name: "Increase seats" }).isDisabled(), "Increase is off at the maximum")
        expect(!(await scope.getByRole("button", { name: "Decrease seats" }).isDisabled()), "Decrease still works")
        const rate = scope.getByRole("spinbutton", { name: "Award rate" })
        expect.equal(await rate.evaluate((el) => el.closest('[data-slot="number-input"]').querySelectorAll("button").length), 0, "no step buttons when read-only")
        expect.equal(await rate.evaluate((el) => getComputedStyle(el.closest('[data-slot="number-input"]')).borderTopStyle), "dashed", "a dashed edge")
      },
    },
    {
      name: "Focus is a 2px edge, and invalid stays danger when focused, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const quantity = page.getByRole("spinbutton", { name: "Quantity" })
        await quantity.focus()
        const e = await quantity.evaluate(readEdge)
        expect(twoPx(e, e.focus), `a 2px focus edge (border ${e.border}, ring ${e.shadow})`)
        const hours = scope.getByRole("spinbutton", { name: "Hours" })
        await hours.focus()
        const d = await hours.evaluate(readEdge)
        expect(twoPx(d, d.danger), `danger and 2px when focused (border ${d.border}, ring ${d.shadow})`)
      },
    },
    {
      name: "Touch: 40, 44 and 48px tall with 16px text, and step buttons at least 44px wide",
      example: "sizes",
      touch: true,
      async run({ scope, expect }) {
        const sizes = await scope.getByRole("spinbutton").evaluateAll((els) => els.map((el) => `${Math.round(el.closest('[data-slot="number-input"]').getBoundingClientRect().height)}/${getComputedStyle(el).fontSize}`))
        expect.equal(sizes.join(","), "40/16px,44/16px,48/16px", "touch heights and text")
        for (const b of await scope.getByRole("button").all()) expect.atLeast(Math.round((await b.boundingBox()).width), 44, "step button width on touch")
        const down = await scope.getByRole("button", { name: "Decrease boxes" }).boundingBox()
        const up = await scope.getByRole("button", { name: "Increase boxes" }).boundingBox()
        expect.atLeast(Math.round(up.x - (down.x + down.width)), 8, "the two step buttons sit at least 8px apart on touch")
      },
    },
  ],
}
