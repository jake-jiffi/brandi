// Checkbox's one definition: its README, its preview board and its scripted checks all come from here.

const channel = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/[\d.]+/g).map(Number)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

// Runs in the page: is the point this far outside the box's edge still the box?
function hitsAt(el, dx) {
  const r = el.getBoundingClientRect()
  return el.contains(document.elementFromPoint(r.left - dx, r.top + r.height / 2))
}

export default {
  name: "Checkbox",
  group: "Inputs",
  job: "A choice saved with a form.",
  status: "proven",
  props: [
    { name: "label", type: "ReactNode", doc: "States the outcome: Email the [client] a copy." },
    { name: "description", type: "ReactNode", doc: "A line under the label, read with the box." },
    { name: "checked", type: "boolean", doc: "Ticked, when the page holds it." },
    { name: "defaultChecked", type: "boolean", doc: "Ticked to start with, when the Checkbox holds it." },
    { name: "onChange", type: "(checked: boolean) => void", doc: "Called with the new state." },
    { name: "indeterminate", type: "boolean", default: "false", doc: "Some selected: a dash, read as mixed. Its parent decides when it ends." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and unchangeable. Say why in the description." },
    { name: "required", type: "boolean", default: "false", doc: "Must be ticked before the form saves." },
    { name: "error", type: "ReactNode", doc: "What is wrong and how to fix it, with an icon. Announced when it appears." },
    { name: "name, value, id", type: "string", doc: "For a native form post, and for an ErrorSummary to link to the box." },
  ],
  notes: {
    Behaviour: [
      "Space toggles it. Clicking the label toggles it too.",
      "A screen reader hears the label, checkbox, its state (checked, not checked or mixed), then the description and any error.",
      "The error is announced through a polite live region that is there from the start.",
    ],
    States: ["Checked, unchecked, indeterminate (a dash), disabled, and invalid (a danger edge with the error under the label)."],
    Rules: [
      "An 18px box with a 24px hit area, 44px on touch, where each row grows to 44px so neighbouring targets never overlap.",
      "A setting that applies at once is a Switch. The label states the outcome.",
    ],
  },
  examples: [
    {
      id: "states",
      title: "Unchecked, checked, some selected and disabled",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Checkbox" label="Email the [client] a copy"></x-import>
<x-import component-from-global-scope="NS.Checkbox" label="Attach the receipt" default-checked="{{yes}}"></x-import>
<x-import component-from-global-scope="NS.Checkbox" label="All invoices on this page" description="2 of 5 selected" indeterminate="{{yes}}"></x-import>
<x-import component-from-global-scope="NS.Checkbox" label="Send a payment reminder" description="Reminders are off for this [client]." disabled="{{yes}}"></x-import>
<x-import component-from-global-scope="NS.Checkbox" label="Copy the bookkeeper in" disabled="{{yes}}" default-checked="{{yes}}"></x-import>`,
      vals: { yes: true },
    },
    {
      id: "form",
      title: "Required, with a description and an error",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Checkbox" label="I have checked the bank details" description="We pay into this account from the next pay run." required="{{yes}}" error="Tick this to confirm the bank details"></x-import>`,
    },
  ],
  frame: { width: 960, height: 388 },
  checks: [
    {
      name: "Space toggles it, and so does its label",
      example: "states",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const box = scope.getByRole("checkbox", { name: "Email the [client] a copy" })
        expect(await box.evaluate((el) => document.activeElement === el), "Tab reached the first box")
        await page.keyboard.press("Space")
        expect.equal(await box.getAttribute("aria-checked"), "true", "Space ticks it")
        await page.keyboard.press("Space")
        expect.equal(await box.getAttribute("aria-checked"), "false", "Space unticks it")
        await scope.getByText("Email the [client] a copy", { exact: true }).click()
        expect.equal(await box.getAttribute("aria-checked"), "true", "the label ticks it")
      },
    },
    {
      name: "Some selected reads as mixed and shows a dash",
      example: "states",
      async run({ scope, expect }) {
        const all = scope.getByRole("checkbox", { name: "All invoices on this page" })
        expect.equal(await all.getAttribute("aria-checked"), "mixed", "read as mixed")
        expect(await all.locator("[data-slot=checkbox-indicator] svg").nth(1).isVisible(), "a dash")
        expect(!(await all.locator("[data-slot=checkbox-indicator] svg").first().isVisible()), "no tick")
        const read = await all.evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent)
        expect.equal(read, "2 of 5 selected", "the description is read with it")
      },
    },
    {
      name: "Disabled cannot be changed, by key or by its label",
      example: "states",
      async run({ scope, expect }) {
        const reminder = scope.getByRole("checkbox", { name: "Send a payment reminder" })
        expect(await reminder.isDisabled(), "disabled")
        await scope.getByText("Send a payment reminder", { exact: true }).click({ force: true })
        expect.equal(await reminder.getAttribute("aria-checked"), "false", "the label leaves it alone")
      },
    },
    {
      name: "An 18px box with a 24px hit area",
      example: "states",
      async run({ scope, expect }) {
        const box = scope.getByRole("checkbox").first()
        const b = await box.boundingBox()
        expect.equal(`${Math.round(b.width)}x${Math.round(b.height)}`, "18x18", "an 18px box")
        expect(await box.evaluate(hitsAt, 2), "a press 2px outside the box still lands on it")
        expect(!(await box.evaluate(hitsAt, 5)), "the hit area stops at 24px")
      },
    },
    {
      name: "Touch: the hit area grows to 44px and each row to 44px",
      example: "states",
      touch: true,
      async run({ scope, expect }) {
        const box = scope.getByRole("checkbox").first()
        expect(await box.evaluate(hitsAt, 12), "a press 12px outside the box still lands on it")
        const rows = await scope.locator('[data-slot="checkbox-field"] > div:first-child').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)))
        for (const h of rows) expect.atLeast(h, 44, "row height on touch")
      },
    },
    {
      name: "The box edge holds 3:1, and focus shows the outline, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const box = scope.getByRole("checkbox").first()
        const s = await box.evaluate((el) => {
          let up = el.parentElement
          while (up && /rgba\(0, 0, 0, 0\)/.test(getComputedStyle(up).backgroundColor)) up = up.parentElement
          return { edge: getComputedStyle(el).borderTopColor, fill: getComputedStyle(el).backgroundColor, behind: getComputedStyle(up).backgroundColor }
        })
        expect.atLeast(Number(contrast(s.edge, s.fill).toFixed(2)), 3, "the edge against the box's fill")
        expect.atLeast(Number(contrast(s.edge, s.behind).toFixed(2)), 3, "the edge against the surface behind")
        await page.keyboard.press("Tab")
        expect.equal(await box.evaluate((el) => `${getComputedStyle(el).outlineStyle} ${getComputedStyle(el).outlineWidth}`), "solid 2px", "the focus outline")
      },
    },
    {
      name: "The error is read with the box, carries an icon and is announced",
      example: "form",
      async run({ scope, expect }) {
        const box = scope.getByRole("checkbox", { name: "I have checked the bank details" })
        expect.equal(await box.getAttribute("aria-invalid"), "true", "invalid")
        expect.equal(await box.getAttribute("aria-required"), "true", "required")
        const read = await box.evaluate((el) => el.getAttribute("aria-describedby").split(" ").map((id) => document.getElementById(id)?.textContent.trim()).join(" | "))
        expect.equal(read, "We pay into this account from the next pay run. | Tick this to confirm the bank details", "description, then error")
        const error = scope.locator('[data-slot="field-error"]')
        expect.equal(await error.locator("svg").count(), 1, "an icon")
        expect.equal(await error.evaluate((el) => el.closest("[aria-live]").getAttribute("aria-live")), "polite", "in a polite live region")
      },
    },
    {
      name: "Forced colours keep the tick visible",
      example: "states",
      forcedColors: true,
      async run({ scope, expect }) {
        const tick = scope.getByRole("checkbox", { name: "Attach the receipt" }).locator("[data-slot=checkbox-indicator] svg").first()
        expect(await tick.isVisible(), "the tick is drawn")
        const s = await tick.evaluate((el) => ({ stroke: getComputedStyle(el).stroke, colour: getComputedStyle(el).color, fill: getComputedStyle(el.closest("button")).backgroundColor }))
        expect(s.colour !== s.fill, `the tick's colour stands apart from the box (${s.colour} on ${s.fill})`)
      },
    },
  ],
}
