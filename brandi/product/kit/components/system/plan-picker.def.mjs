// PlanPicker's one definition: its README, its preview board and its scripted checks all come from here.

const PLANS = [
  { value: "starter", name: "Starter", price: 19, period: "per month", description: "For one location finding its feet.", features: ["Up to [5] people", "Rosters and timesheets", "Email support"] },
  { value: "standard", name: "Standard", price: 49, period: "per month", description: "For a team that runs on rosters.", features: ["Up to [25] people", "Everything in Starter", "Payroll exports", "Phone support"], badge: "Most popular" },
  { value: "plus", name: "Plus", price: 99.5, period: "per month", description: "For several locations under one account.", features: ["Unlimited people", "Everything in Standard", "[3] locations included", "A named account manager"] },
]
const MORE = [
  { value: "solo", name: "Solo", price: 0, description: "For one person trying it out.", features: ["[1] person", "Rosters"] },
  { value: "team", name: "Team", price: 12.5, period: "per person per month", description: "Pay for the people you roster.", features: ["Rosters and timesheets", "Payroll exports"] },
  { value: "group", name: "Group", price: null, description: "For [10] or more locations. We quote on your rosters.", features: ["Everything in Team", "Single sign-on"] },
  { value: "legacy", name: "Classic", price: 29, period: "per month", description: "No longer offered. Your account can stay on it.", features: ["Rosters"], disabled: true, badge: "Current plan" },
]

const checked = (scope) => scope.locator('input[type="radio"]:checked').evaluate((el) => el.value)

export default {
  name: "PlanPicker",
  group: "Inputs",
  job: "One plan from two to five, shown as cards that say what each includes and costs.",
  status: "to build",
  props: [
    { name: "legend", type: "ReactNode", doc: "Names the choice, in sentence case: Choose a plan. The group's accessible name." },
    { name: "plans", type: "Array<{ value: string; name: string; price: number | null; period?: string; description?: string; features?: string[]; badge?: string; disabled?: boolean }>", doc: "Two to five plans. The price is a number in the market's currency, read through the formatter; 0 reads as Free and null as Price on request." },
    { name: "value", type: "string", doc: "The chosen plan, when the page holds it." },
    { name: "defaultValue", type: "string", doc: "The plan chosen to start with. Preselect the safest or most common." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the chosen plan's value." },
    { name: "hint", type: "ReactNode", doc: "Why the choice matters, under the legend." },
    { name: "error", type: "ReactNode", doc: "What is wrong and how to fix it, with an icon. Announced when it appears." },
    { name: "name", type: "string", doc: "The radios' name, for a native form post." },
    { name: "currency", type: "string", doc: "The currency code, when it is not the market's own." },
    { name: "required", type: "boolean", default: "false", doc: "A plan must be chosen before the form saves." },
  ],
  notes: {
    Behaviour: [
      "A native radio group drawn as cards: Tab enters at the chosen plan, the arrow keys move the choice and skip a plan that is not offered, and a press anywhere on a card chooses it.",
      "Each plan's name is its radio's label, and its price, description, features and flag are read with it: Standard, radio button, $49 per month.",
      "Prices go through the formatter's currency style, in the market's locale: $49, $99.50. A price of 0 reads as Free, and a price people ask for reads as Price on request; neither is drawn as zero.",
      "The chosen card takes a primary edge on the selected tint, and its radio fills. Focus from the keyboard draws the system's ring around the whole card. Forced colours outline the chosen card in Highlight.",
    ],
    Layout: ["Side by side from 560px of its own width, each card at least 160px and all the same height; one column below that."],
    States: ["Unchosen, chosen, hover, focus, not offered (faded, with the reason in its description), and the group's error."],
    Copy: [
      "Names are a word or two. The description says who it suits. Features are short lines without full stops, and each card lists what is different, starting with Everything in [plan].",
      "Flags are a word or two of fact: Most popular, Current plan.",
    ],
    Rules: [
      "Two to five plans people compare side by side. More than five, or plans that need no comparing: a Select.",
      "Preselect the safest or most common plan, as a RadioGroup does.",
    ],
    Accepted: ["Prices are formatted numbers, so the sample prices on the board carry no [brackets]; the features' sample figures do."],
  },
  examples: [
    {
      id: "basics",
      title: "Three plans, side by side",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.PlanPicker" legend="Choose a plan" hint="Change plans at any time. We work out the difference on your next bill." plans="{{plans}}" default-value="standard" name="plan"></x-import>`,
      vals: { plans: PLANS },
    },
    {
      id: "states",
      title: "Free, per person, on request, not offered, and an error",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.PlanPicker" legend="Plan" plans="{{more}}" error="Choose a plan to start your trial"></x-import>`,
      vals: { more: MORE },
    },
    {
      id: "narrow",
      title: "360px wide: stacked",
      layout: "block",
      markup: `<div style="width: 360px;"><x-import component-from-global-scope="NS.PlanPicker" legend="Choose a plan" plans="{{two}}" default-value="starter"></x-import></div>`,
      vals: { two: PLANS.slice(0, 2) },
    },
  ],
  frame: { width: 960, height: 1320 },
  checks: [
    {
      name: "Tab enters at the chosen plan and the arrow keys move the choice, skipping a plan that is not offered",
      example: "basics",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => `${document.activeElement.type}:${document.activeElement.value}`), "radio:standard", "Tab lands on the chosen plan")
        await page.keyboard.press("ArrowRight")
        expect.equal(await checked(scope), "plus", "Right moves the choice")
        await page.keyboard.press("ArrowLeft")
        await page.keyboard.press("ArrowLeft")
        expect.equal(await checked(scope), "starter", "Left moves it back")
        const states = page.locator('[data-example="states"]')
        await states.getByRole("radio", { name: "Group" }).focus()
        await page.keyboard.press("ArrowDown")
        expect.equal(await checked(states), "solo", "past the last offered plan the choice wraps, skipping the one not offered")
      },
    },
    {
      name: "Each plan is named by its name, and read with its price, description, features and flag",
      example: "basics",
      async run({ scope, expect }) {
        const radio = scope.getByRole("radio", { name: "Standard" })
        expect.equal(await radio.count(), 1, "the radio is named Standard")
        const read = await radio.evaluate((el) => el.getAttribute("aria-describedby").split(" ").map((id) => document.getElementById(id).textContent.trim()).join(" | "))
        expect.equal(read, "$49per month | For a team that runs on rosters. | Up to [25] people.Everything in Starter.Payroll exports.Phone support. | Most popular", "price, description, features and flag")
        expect.equal(await scope.getByRole("radiogroup", { name: "Choose a plan" }).count(), 1, "the group is named by its legend")
      },
    },
    {
      name: "Prices read through the formatter in the market's currency; 0 is Free and a quoted price says so",
      example: "states",
      async run({ page, scope, expect }) {
        const basics = await page.locator('[data-example="basics"] [data-slot="plan-card-price"]').allTextContents()
        expect.equal(basics.map((t) => t.trim()).join("|"), "$19per month|$49per month|$99.50per month", "dollars, and cents only when there are cents")
        const more = await scope.locator('[data-slot="plan-card-price"]').allTextContents()
        expect.equal(more.map((t) => t.trim()).join("|"), "Free|$12.50per person per month|Price on request|$29per month", "Free, per person, and on request, never zero")
      },
    },
    {
      name: "A press anywhere on a card chooses it; a plan not offered cannot be chosen",
      example: "basics",
      async run({ page, scope, expect }) {
        // A real press on a feature line, which the card's label covers.
        const line = await scope.getByText("A named account manager").boundingBox()
        await page.mouse.click(line.x + line.width / 2, line.y + line.height / 2)
        expect.equal(await checked(scope), "plus", "a press on a feature chose the card")
        const states = page.locator('[data-example="states"]')
        await states.locator('[data-slot="plan-card"][data-disabled]').click({ force: true })
        expect.equal(await states.locator('input[type="radio"]:checked').count(), 0, "the plan not offered stays unchosen")
        expect.equal(await states.getByRole("radio", { name: "Classic" }).isDisabled(), true, "and its radio says so")
      },
    },
    {
      name: "The chosen card takes a primary edge at 3:1, and keyboard focus rings the whole card, in both themes",
      example: "basics",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const look = await scope.locator('[data-slot="plan-card"][data-state="checked"]').evaluate((el) => {
          const s = getComputedStyle(el)
          const probe = document.createElement("span")
          document.body.append(probe)
          probe.style.color = "var(--primary)"
          const primary = getComputedStyle(probe).color
          probe.remove()
          let up = el.parentElement
          while (up && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(up).backgroundColor)) up = up.parentElement
          return { border: s.borderTopColor, primary, behind: up ? getComputedStyle(up).backgroundColor : "rgb(255, 255, 255)" }
        })
        expect.equal(look.border, look.primary, "the chosen card's edge is primary")
        const channel = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        const lum = (rgb) => {
          const [r, g, b] = rgb.match(/[\d.]+/g).map(Number)
          return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
        }
        const [x, y] = [lum(look.border), lum(look.behind)].sort((m, n) => n - m)
        expect.atLeast(Number(((x + 0.05) / (y + 0.05)).toFixed(2)), 3, "the edge against the page")
        await page.keyboard.press("Tab")
        const ring = await scope.locator('[data-slot="plan-card"][data-state="checked"]').evaluate((el) => `${getComputedStyle(el).outlineStyle} ${getComputedStyle(el).outlineWidth}`)
        expect.equal(ring, "solid 2px", "the focus ring is drawn around the card")
      },
    },
    {
      name: "Side by side from 560px of its own width, the same height, and stacked below it",
      example: "narrow",
      async run({ page, scope, expect }) {
        const wide = await page.locator('[data-example="basics"] [data-slot="plan-card"]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))
        expect(wide.every((r) => Math.abs(r.top - wide[0].top) < 1), "three in a row")
        expect(wide.every((r) => Math.abs(r.height - wide[0].height) < 1), "all the same height")
        const narrow = await scope.locator('[data-slot="plan-card"]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))
        expect(narrow.every((r, i) => i === 0 || r.top > narrow[i - 1].bottom), "stacked at 360px")
      },
    },
    {
      name: "The group's error is announced and carries an icon",
      example: "states",
      async run({ scope, expect }) {
        const region = scope.locator('[data-slot="field-message"]')
        expect.equal(await region.getAttribute("aria-live"), "polite", "a polite live region")
        expect.equal((await region.textContent()).trim(), "Choose a plan to start your trial", "the error")
        expect.equal(await region.locator("svg").count(), 1, "with an icon")
        const group = scope.getByRole("radiogroup", { name: "Plan" })
        expect.equal(await group.getAttribute("aria-invalid"), "true", "the group is invalid")
        expect(await group.evaluate((el) => el.getAttribute("aria-describedby").split(" ").some((id) => document.getElementById(id)?.textContent.includes("trial"))), "and described by the error")
      },
    },
    {
      name: "Forced colours outline the chosen card and keep focus visible",
      example: "basics",
      forcedColors: true,
      async run({ page, scope, expect }) {
        const chosen = await scope.locator('[data-slot="plan-card"][data-state="checked"]').evaluate((el) => getComputedStyle(el).outlineStyle)
        expect.equal(chosen, "solid", "the chosen card is outlined")
        const rest = await scope.locator('[data-slot="plan-card"][data-state="unchecked"]').first().evaluate((el) => getComputedStyle(el).outlineStyle)
        expect.equal(rest, "none", "a card at rest draws no outline")
        await page.keyboard.press("Tab")
        await page.keyboard.press("ArrowLeft")
        const focused = await scope.locator('[data-slot="plan-card"][data-state="checked"]').evaluate((el) => `${getComputedStyle(el).outlineStyle} ${parseFloat(getComputedStyle(el).outlineWidth) >= 2}`)
        expect.equal(focused, "solid true", "the focused, chosen card stays outlined")
      },
    },
    {
      name: "Touch: every card is a target far past 44px, with room between them",
      example: "narrow",
      touch: true,
      async run({ scope, expect }) {
        const boxes = await scope.locator('[data-slot="plan-card"]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))
        for (const b of boxes) expect.atLeast(Math.round(b.height), 44, "a card is a big target")
        for (let i = 1; i < boxes.length; i++) expect.atLeast(Math.round(boxes[i].top - boxes[i - 1].bottom), 8, "8px between cards")
      },
    },
  ],
}
