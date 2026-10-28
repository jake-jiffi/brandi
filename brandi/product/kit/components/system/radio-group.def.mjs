// RadioGroup's one definition: its README, its preview board and its scripted checks all come from here.

const channel = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/[\d.]+/g).map(Number)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

// Runs in the page: is the point this far outside the circle's edge still the circle?
function hitsAt(el, dx) {
  const r = el.getBoundingClientRect()
  return el.contains(document.elementFromPoint(r.left - dx, r.top + r.height / 2))
}
// Radix moves focus a tick after an arrow key: wait for the option expected, then report the one that has focus.
const focused = async (page, expected) => {
  await page.waitForFunction((t) => document.activeElement?.closest('[data-slot="radio-group-option"]')?.textContent === t, expected, { timeout: 2000 }).catch(() => {})
  return page.evaluate(() => document.activeElement?.closest('[data-slot="radio-group-option"]')?.textContent ?? null)
}

export default {
  name: "RadioGroup",
  group: "Inputs",
  job: "One choice from two to five options that people should see side by side.",
  status: "proven",
  props: [
    { name: "legend", type: "ReactNode", doc: "Names the choice, in sentence case. The group's accessible name." },
    { name: "name", type: "string", doc: "The form field's name, for a native form post." },
    { name: "options", type: "Array<string | { value: string; label: string; description?: string; disabled?: boolean }>", doc: "Two to five. A description sits under its label and is read with it." },
    { name: "value", type: "string", doc: "The chosen option, when the page holds it." },
    { name: "defaultValue", type: "string", doc: "The option chosen to start with. Preselect the safest or most common one." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the chosen option's value." },
    { name: "hint", type: "ReactNode", doc: "Why the choice matters, under the legend, read with the group." },
    { name: "error", type: "ReactNode", doc: "What is wrong and how to fix it, with an icon. Announced when it appears." },
    { name: "required", type: "boolean", default: "false", doc: "A choice must be made before the form saves." },
    { name: "disabled", type: "boolean", default: "false", doc: "The whole group, faded and unchangeable. One option can be disabled on its own." },
  ],
  notes: {
    Behaviour: [
      "A radio group: Tab enters at the chosen option (or the first), the arrow keys move the choice and focus together and skip a disabled option, and Space chooses the focused one.",
      "A screen reader hears the legend as the group's name, then each option as a radio button with its place (1 of 3) and its description. The hint and any error are read with the group.",
      "The error is announced through a polite live region that is there from the start.",
    ],
    Layout: ["Options without descriptions sit side by side once the group itself is 480px wide, and stack below that. Options with descriptions always stack."],
    States: ["Chosen, not chosen, a disabled option, a disabled group, and invalid (a danger edge on every circle, with the error under the options)."],
    Rules: [
      "Preselect the safest or most common option. More than five options: a Select.",
      "An 18px circle with a 24px hit area, 44px on touch, where each option grows to 44px.",
    ],
  },
  examples: [
    {
      id: "basics",
      title: "Side by side, and stacked with descriptions",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: 520px minmax(0, 1fr); gap: 24px 40px; width: 100%;">
<x-import component-from-global-scope="NS.RadioGroup" legend="Pay run" name="frequency" options="{{frequencies}}" default-value="Fortnightly"></x-import>
<x-import component-from-global-scope="NS.RadioGroup" legend="When to send invoices" hint="You can change this for each [client]." name="sending" options="{{sending}}" default-value="approved"></x-import>
</div>`,
      vals: {
        frequencies: ["Weekly", "Fortnightly", "Monthly"],
        sending: [
          { value: "approved", label: "As soon as they are approved", description: "Each invoice goes out on its own." },
          { value: "daily", label: "Once a day", description: "One batch at 5 pm." },
          { value: "manual", label: "When I send them", description: "Nothing goes out until you press Send." },
        ],
      },
    },
    {
      id: "states",
      title: "A disabled option, an error, and stacked when narrow",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: 300px 260px 1fr; gap: 24px 40px; width: 100%;">
<x-import component-from-global-scope="NS.RadioGroup" legend="Delivery" name="delivery" options="{{delivery}}" default-value="email"></x-import>
<x-import component-from-global-scope="NS.RadioGroup" legend="Account type" name="account" options="{{accounts}}" required="{{yes}}" error="Choose an account type"></x-import>
<x-import component-from-global-scope="NS.RadioGroup" legend="Reminder" name="reminder" options="{{reminders}}" default-value="After 7 days"></x-import>
</div>`,
      vals: {
        delivery: [
          { value: "post", label: "Post" },
          { value: "email", label: "Email" },
          { value: "courier", label: "Courier", description: "Not available for this address.", disabled: true },
        ],
        accounts: ["Savings", "Cheque"],
        reminders: ["Never", "After 7 days", "After 14 days"],
        yes: true,
      },
    },
  ],
  frame: { width: 960, height: 468 },
  checks: [
    {
      name: "Tab enters at the chosen option, and the arrow keys move the choice and focus together",
      example: "basics",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        expect.equal(await focused(page, "Fortnightly"), "Fortnightly", "Tab lands on the chosen option")
        // Held a moment, as a key is: Radix selects on focus only while the arrow is still down, and a
        // keydown and keyup sent back to back sometimes moved focus without choosing.
        await page.keyboard.press("ArrowRight", { delay: 40 })
        expect.equal(await focused(page, "Monthly"), "Monthly", "Right moves focus")
        const chose = await scope.getByRole("radio", { name: "Monthly", checked: true }).waitFor({ timeout: 2000 }).then(() => true, () => false)
        expect(chose, "and the choice")
        await page.keyboard.press("ArrowDown", { delay: 40 })
        expect.equal(await focused(page, "Weekly"), "Weekly", "Down wraps to the first")
        await page.keyboard.press("ArrowLeft", { delay: 40 })
        expect.equal(await focused(page, "Monthly"), "Monthly", "Left wraps back")
        await scope.getByRole("radio", { name: "Monthly", checked: true }).waitFor({ timeout: 2000 }).catch(() => {})
        expect.equal(await scope.getByRole("radio", { name: "Fortnightly" }).getAttribute("aria-checked"), "false", "only one is chosen")
      },
    },
    {
      name: "The arrow keys skip a disabled option",
      example: "states",
      async run({ page, scope, expect }) {
        await scope.getByRole("radio", { name: "Email" }).focus()
        await page.keyboard.press("ArrowDown")
        expect.equal(await focused(page, "Post"), "Post", "Courier is skipped and the choice wraps to Post")
        expect.equal(await scope.getByRole("radio", { name: "Courier" }).isDisabled(), true, "Courier is disabled")
      },
    },
    {
      name: "Space chooses the focused option in a group with no choice yet",
      example: "states",
      async run({ page, scope, expect }) {
        await scope.getByRole("radio", { name: "Email" }).focus()
        await page.keyboard.press("Tab")
        expect.equal(await focused(page, "Savings"), "Savings", "Tab enters at the first option")
        await page.keyboard.press("Space")
        expect.equal(await scope.getByRole("radio", { name: "Savings" }).getAttribute("aria-checked"), "true", "Space chooses it")
      },
    },
    {
      name: "Each option's description is tied to its radio, so a screen reader hears it with the option",
      async run({ page, expect }) {
        const radio = page.getByRole("radio", { name: "Once a day" })
        expect.equal(await radio.evaluate((el) => (el.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent.trim()).join(" ")), "One batch at 5 pm.", "described by the line under it")
        expect.equal(await page.getByRole("radio", { name: "Courier" }).evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent.trim()), "Not available for this address.", "a disabled option says why")
      },
    },
    {
      name: "The legend names the group, and the hint and error are read with it and announced",
      example: "states",
      async run({ page, scope, expect }) {
        expect.equal(await page.getByRole("radiogroup", { name: "When to send invoices" }).count(), 1, "named by its legend")
        const sending = await page.getByRole("radiogroup", { name: "When to send invoices" }).evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent)
        expect.equal(sending, "You can change this for each [client].", "the hint is read with the group")
        const account = scope.getByRole("radiogroup", { name: "Account type" })
        expect.equal(await account.getAttribute("aria-invalid"), "true", "invalid")
        expect.equal(await account.getAttribute("aria-required"), "true", "required")
        const error = await account.evaluate((el) => document.getElementById(el.getAttribute("aria-describedby")))
        expect(error, "the error is read with the group")
        const live = await account.evaluate((el) => {
          const message = document.getElementById(el.getAttribute("aria-describedby"))
          return { text: message.textContent.trim(), icon: message.querySelectorAll("svg").length, live: message.closest("[aria-live]")?.getAttribute("aria-live") }
        })
        expect.equal(live.text, "Choose an account type", "the error's words")
        expect.equal(live.icon, 1, "an icon")
        expect.equal(live.live, "polite", "in a polite live region")
      },
    },
    {
      name: "Short options sit side by side when there is room, and stack when narrow",
      example: "states",
      async run({ page, scope, expect }) {
        const tops = async (group) => [...new Set(await group.locator('[data-slot="radio-group-option"]').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top))))].length
        expect.equal(await tops(page.locator('[data-example="basics"] [data-slot="radio-group-field"]').first()), 1, "Pay run, 520px wide, sits in a row")
        expect.equal(await tops(scope.locator('[data-slot="radio-group-field"]').nth(1)), 2, "Account type, 260px wide, stacks")
        expect.equal(await tops(page.locator('[data-example="basics"] [data-slot="radio-group-field"]').nth(1)), 3, "options with descriptions stack")
      },
    },
    {
      name: "An 18px circle with a 24px hit area",
      example: "basics",
      async run({ scope, expect }) {
        const radio = scope.getByRole("radio").first()
        const b = await radio.boundingBox()
        expect.equal(`${Math.round(b.width)}x${Math.round(b.height)}`, "18x18", "an 18px circle")
        expect(await radio.evaluate(hitsAt, 2), "a press 2px outside still lands on it")
        expect(!(await radio.evaluate(hitsAt, 5)), "the hit area stops at 24px")
      },
    },
    {
      name: "Touch: the hit area grows to 44px and each option to 44px",
      example: "basics",
      touch: true,
      async run({ scope, expect }) {
        expect(await scope.getByRole("radio").first().evaluate(hitsAt, 12), "a press 12px outside still lands on it")
        for (const h of await scope.locator('[data-slot="radio-group-option"]').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)))) expect.atLeast(h, 44, "option height on touch")
      },
    },
    {
      name: "The circle edge holds 3:1, and focus shows the outline, in both themes",
      example: "basics",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const radio = scope.getByRole("radio", { name: "Weekly" })
        const s = await radio.evaluate((el) => {
          let up = el.parentElement
          while (up && /rgba\(0, 0, 0, 0\)/.test(getComputedStyle(up).backgroundColor)) up = up.parentElement
          return { edge: getComputedStyle(el).borderTopColor, fill: getComputedStyle(el).backgroundColor, behind: getComputedStyle(up).backgroundColor }
        })
        expect.atLeast(Number(contrast(s.edge, s.fill).toFixed(2)), 3, "the edge against the circle's fill")
        expect.atLeast(Number(contrast(s.edge, s.behind).toFixed(2)), 3, "the edge against the surface behind")
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => `${getComputedStyle(document.activeElement).outlineStyle} ${getComputedStyle(document.activeElement).outlineWidth}`), "solid 2px", "the focus outline")
      },
    },
    {
      name: "Forced colours keep the chosen dot visible",
      example: "basics",
      forcedColors: true,
      async run({ scope, expect }) {
        const dot = scope.getByRole("radio", { name: "Fortnightly" }).locator('[data-slot="radio-group-indicator"] span')
        const s = await dot.evaluate((el) => ({ width: getComputedStyle(el).borderTopWidth, colour: getComputedStyle(el).borderTopColor, behind: getComputedStyle(el.closest("button")).backgroundColor }))
        expect.equal(s.width, "4px", "the dot is drawn as a border, which forced colours keep")
        expect(s.colour !== s.behind, `the dot stands apart from the circle (${s.colour} on ${s.behind})`)
      },
    },
  ],
}
