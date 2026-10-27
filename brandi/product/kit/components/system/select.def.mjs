// Select's one definition: its README, its preview board and its scripted checks all come from here.

const row = (inner) => `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`
const field = (label, select, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.Select" ${select}></x-import>\n</x-import>`

// Runs in the page: an element's edge, ring and outline, with the system's colours to compare.
function readStyle(el) {
  const s = getComputedStyle(el)
  const probe = document.createElement("span")
  document.body.append(probe)
  const colour = (role) => ((probe.style.color = `var(--${role})`), getComputedStyle(probe).color)
  const out = {
    border: s.borderTopColor,
    width: parseFloat(s.borderTopWidth),
    shadow: s.boxShadow,
    outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineOffset}`,
    outlineColour: s.outlineColor,
    focus: colour("focus"),
    danger: colour("danger"),
    lineControl: colour("line-control"),
    list: getComputedStyle(el.closest('[role="listbox"]') ?? document.body).backgroundColor,
  }
  probe.remove()
  return out
}

const channel = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/[\d.]+/g).map(Number)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const twoPx = (e, colour) => e.border === colour && e.width === 1 && e.shadow.includes(colour) && /0px 0px 0px 1px/.test(e.shadow)

// Radix moves focus into the list once it is placed; wait for that before pressing anything else.
const optionInHand = (page, text) =>
  page.waitForFunction((t) => document.activeElement?.getAttribute("role") === "option" && (!t || document.activeElement.textContent.trim() === t), text, { timeout: 3000 })
// The list fades and grows in; measure it once that has finished.
const settled = (page) => page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"), null, { timeout: 3000 })
const tabTo = async (page, test, limit = 20) => {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press("Tab")
    if (await page.evaluate(test)) return
  }
  throw new Error("Tab never reached the control")
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default {
  name: "Select",
  group: "Inputs",
  job: "One option from a short list, up to about 15.",
  status: "proven",
  props: [
    { name: "options", type: "Array<string | { value: string; label: string; description?: string; icon?: IconName; disabled?: boolean }>", doc: "Up to about 15. A description sits under its label in the list only." },
    { name: "value", type: "string", doc: "The chosen option, when the page holds it." },
    { name: "defaultValue", type: "string", doc: "The option chosen to start with, when the Select holds it." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the chosen option's value." },
    { name: "placeholder", type: "string", doc: "Says what to choose (Choose a [category]), never Select..." },
    { name: "open", type: "boolean", default: "false", doc: "Design mode: draws the list open in place, for a board. It takes no focus and blocks nothing. Never in a product." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen, with 16px text there." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and closed. Say why in the Field's hint." },
    { name: "required", type: "boolean", default: "false", doc: "Must be chosen before the form saves. Inside a Field, the Field's required sets it." },
    { name: "name", type: "string", doc: "The form field's name, for a native form post." },
    { name: "id", type: "string", doc: "The trigger's id. Inside a Field, the Field gives one." },
    { name: "aria-label", type: "string", doc: "The name of a Select outside a Field. A canvas board writes aria-label, which arrives as ariaLabel; both work." },
    { name: "aria-labelledby", type: "string", doc: "Or the id of visible text that names it, outside a Field (ariaLabelledby on a canvas)." },
  ],
  notes: {
    Behaviour: [
      "A select-only combobox: the field reads its name, then its current value.",
      "Enter, Space, Up or Down open it. Up, Down, Home, End and typing a letter move through the options, and the active option scrolls into view. Enter or Space chooses, and focus returns to the trigger.",
      "Typing a letter on the closed trigger moves the choice, as a native select does.",
      "Escape closes without choosing. The list is named like the field, opens in a portal above everything, and flips up when there is no room below.",
      "It closes at once, with no fade, and focus is back on the trigger before the next key, so an Escape meant for a dialog behind it is never swallowed.",
      "Drawn open for a design (open), it is a still picture: no live layer, no focus guards, no extra tab stops, and Escape left to the page.",
      "Clicking a Field's label focuses it without opening it.",
    ],
    States: [
      "Closed, open, the option in hand (a 1px edge in line-control, with a 2px ring from the keyboard), chosen (a check), invalid and disabled.",
      "The trigger has the input's edge: a 2px focus edge in place of the outline, and a danger edge that stays danger when focused.",
    ],
    Copy: ["The placeholder says what to choose: Choose a [category]. Never Select..."],
    Rules: [
      "Fewer than five options people should compare: a RadioGroup. Past about 15, a Combobox.",
      "Outside a Field, give it aria-label or aria-labelledby.",
      "Options are 36px tall, 44px on touch.",
    ],
    Review: [
      "Its card clipped the list (round 1).",
      "The active option did not scroll into view, and a Select outside a Field had no name (round 2).",
      "The option in hand was marked by a 1.14:1 tint. It now has a visible edge and a 2px ring (round 3).",
    ],
    Accepted: [
      "Tab inside the open list stays in the list, as Radix keeps it; Escape or a choice closes it. A Tab handler that fought Radix would break on its next release (07-starter.md, section 5).",
    ],
  },
  examples: [
    {
      id: "basics",
      title: "Placeholder and value",
      layout: "block",
      markup: row(
        [
          field("Category", 'placeholder="Choose a [category]" options="{{categories}}"'),
          field("Payment terms", 'default-value="14 days" options="{{terms}}"', ' hint="From the invoice date."'),
        ].join("\n")
      ),
      vals: { categories: ["Travel", "Meals", "Equipment", "Software"], terms: ["7 days", "14 days", "30 days"] },
    },
    {
      id: "standalone",
      title: "Outside a Field, named by aria-label",
      markup: `<x-import component-from-global-scope="NS.Select" aria-label="Sort by" default-value="Newest first" options="{{sorts}}" style="display: block; width: 220px;"></x-import>`,
      vals: { sorts: ["Newest first", "Oldest first", "Amount, high to low", "Amount, low to high"] },
    },
    {
      id: "sizes",
      title: "Sizes, invalid and disabled",
      layout: "block",
      markup: row(
        [
          field("Region", 'size="sm" default-value="Metro" options="{{regions}}"'),
          field("Team", 'default-value="Kitchen" options="{{teams}}"'),
          field("Plan", 'size="lg" default-value="Standard" options="{{plans}}"'),
          field("State", 'placeholder="Choose a state" options="{{states}}"', ' error="Choose the state the [business] trades in"'),
          field("Currency", 'disabled="{{yes}}" default-value="AUD" options="{{currencies}}"', ' hint="Set when the account was opened."'),
        ].join("\n")
      ),
      vals: {
        regions: ["Metro", "Regional"],
        teams: ["Kitchen", "Front of house", "Delivery"],
        plans: ["Starter", "Standard", "Plus"],
        states: ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"],
        currencies: ["AUD", "NZD"],
        yes: true,
      },
    },
    {
      id: "clipped",
      title: "In a card that clips, with a longer list",
      layout: "block",
      markup: `<div data-card="" style="box-sizing: border-box; width: 300px; height: 112px; overflow: hidden; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface);">
<x-import component-from-global-scope="NS.Field" label="Month">
<x-import component-from-global-scope="NS.Select" default-value="March" options="{{months}}"></x-import>
</x-import>
</div>`,
      vals: { months: MONTHS },
    },
    {
      id: "open",
      title: "Drawn open for a design, with descriptions and icons",
      layout: "block",
      markup: `<div style="width: 300px; height: 260px;">
<x-import component-from-global-scope="NS.Field" label="Approver">
<x-import component-from-global-scope="NS.Select" open="{{yes}}" default-value="finance" options="{{approvers}}"></x-import>
</x-import>
</div>`,
      vals: {
        approvers: [
          { value: "finance", label: "Finance", description: "Anything over [$5,000]", icon: "Wallet" },
          { value: "operations", label: "Operations", description: "Stock and equipment", icon: "Truck" },
          { value: "owner", label: "Owner", description: "Everything else", icon: "User" },
        ],
      },
    },
  ],
  frame: { width: 960, height: 964 },
  checks: [
    {
      name: "Enter opens it, Down moves, Enter chooses, and focus returns to the trigger",
      example: "basics",
      async run({ page, scope, expect }) {
        const trigger = scope.getByRole("combobox", { name: "Category" })
        await trigger.focus()
        await page.keyboard.press("Enter")
        await page.getByRole("listbox", { name: "Category" }).waitFor()
        await optionInHand(page, "Travel")
        await page.keyboard.press("ArrowDown")
        await optionInHand(page, "Meals")
        await page.keyboard.press("Enter")
        await page.getByRole("listbox", { name: "Category" }).waitFor({ state: "detached" })
        expect.equal((await trigger.textContent()).trim(), "Meals", "the trigger reads the choice")
        expect(await trigger.evaluate((el) => document.activeElement === el), "focus is back on the trigger")
      },
    },
    {
      name: "A typed letter, Home and End move through the options",
      example: "basics",
      async run({ page, scope, expect }) {
        await scope.getByRole("combobox", { name: "Category" }).focus()
        await page.keyboard.press("Space")
        await optionInHand(page, "Travel")
        await page.keyboard.press("s")
        await optionInHand(page, "Software")
        await page.keyboard.press("Home")
        await optionInHand(page, "Travel")
        await page.keyboard.press("End")
        await optionInHand(page, "Software")
        expect(true, "each key moved the option in hand")
      },
    },
    {
      name: "Escape closes it without choosing, and focus returns",
      example: "basics",
      async run({ page, scope, expect }) {
        const trigger = scope.getByRole("combobox", { name: "Payment terms" })
        await trigger.focus()
        await page.keyboard.press("ArrowDown")
        await optionInHand(page, "14 days")
        await page.keyboard.press("ArrowDown")
        await optionInHand(page, "30 days")
        await page.keyboard.press("Escape")
        await page.getByRole("listbox", { name: "Payment terms" }).waitFor({ state: "detached" })
        expect.equal((await trigger.textContent()).trim(), "14 days", "the choice is unchanged")
        expect(await trigger.evaluate((el) => document.activeElement === el), "focus is back on the trigger")
      },
    },
    {
      name: "Escape closes the list at once: focus is back on the trigger before the next key, which nothing swallows",
      example: "basics",
      async run({ page, scope, expect }) {
        // A listener at the window hears every Escape that no open layer kept for itself.
        await page.evaluate(() => {
          window.__escapes = []
          window.addEventListener("keydown", (e) => e.key === "Escape" && window.__escapes.push(e.defaultPrevented))
        })
        const trigger = scope.getByRole("combobox", { name: "Category" })
        await trigger.focus()
        await page.keyboard.press("Enter")
        await optionInHand(page, "Travel")
        await page.keyboard.press("Escape")
        // No waiting: whatever happens next, a person can press another key straight away.
        const right = await page.evaluate(() => ({
          focus: document.activeElement?.getAttribute("role"),
          // The live list sits in Radix's popper wrapper, in a portal; the list drawn for a design has none.
          lists: document.querySelectorAll("[data-radix-popper-content-wrapper]").length,
          layers: document.querySelectorAll("[data-radix-focus-guard]").length,
        }))
        expect.equal(right.focus, "combobox", "focus is on the trigger at once")
        expect.equal(right.lists, 0, "the list is gone at once, with no fade to keep its layer")
        expect.equal(right.layers, 0, "no focus guards left behind")
        await page.keyboard.press("Escape")
        expect.equal(JSON.stringify(await page.evaluate(() => window.__escapes)), "[true,false]", "the first Escape closed the list; the second reached the page")
        await page.keyboard.press("Enter")
        await optionInHand(page, "Travel")
        await page.keyboard.press("ArrowDown")
        await optionInHand(page, "Meals")
        await page.keyboard.press("Enter")
        const chose = await page.evaluate(() => ({ focus: document.activeElement?.getAttribute("role"), lists: document.querySelectorAll("[data-radix-popper-content-wrapper]").length }))
        expect.equal(chose.focus, "combobox", "a choice gives focus back at once too")
        expect.equal(chose.lists, 0, "and Enter does not press the trigger and open the list again")
        expect.equal((await trigger.textContent()).trim(), "Meals", "the choice stands")
      },
    },
    {
      name: "Choosing with the pointer closes at once, gives focus back, and the click goes nowhere else",
      example: "basics",
      async run({ page, scope, expect }) {
        const trigger = scope.getByRole("combobox", { name: "Category" })
        await trigger.click()
        await settled(page)
        await page.getByRole("option", { name: "Software" }).click()
        const lists = await page.evaluate(() => document.querySelectorAll("[data-radix-popper-content-wrapper]").length)
        expect.equal(lists, 0, "the list closed, and nothing under it opened another")
        expect.equal((await trigger.textContent()).trim(), "Software", "the choice stands")
        expect(await trigger.evaluate((el) => document.activeElement === el), "focus is on the trigger")
      },
    },
    {
      name: "Drawn open for a design, it is a still picture: no focus guards, no extra tab stops, Escape left alone",
      example: "open",
      async run({ page, scope, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards on the page")
        await page.evaluate(() => {
          window.__escapes = []
          window.addEventListener("keydown", (e) => e.key === "Escape" && window.__escapes.push(e.defaultPrevented))
        })
        const trigger = scope.getByRole("combobox", { name: "Approver" })
        await trigger.focus()
        await page.keyboard.press("Escape")
        expect.equal(JSON.stringify(await page.evaluate(() => window.__escapes)), "[false]", "Escape reaches the page")
        await page.keyboard.press("Tab")
        const next = await page.evaluate(() => (document.activeElement === document.body ? "body" : `${document.activeElement.tagName} ${document.activeElement.getAttribute("role") ?? ""}`))
        expect.equal(next, "body", "the drawn list adds no tab stops after the trigger")
        expect.equal(await scope.getByRole("option").evaluateAll((els) => els.filter((el) => el.tabIndex >= 0).length), 0, "its options take no focus")
      },
    },
    {
      name: "It and its list are named like the field; a Select outside a Field has its name",
      example: "standalone",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("combobox", { name: "Sort by" }).count(), 1, "the standalone Select is named")
        const category = page.getByRole("combobox", { name: "Category", exact: true })
        expect.equal(await category.count(), 1, "the Field's label names the Select")
        expect.equal((await category.textContent()).trim(), "Choose a [category]", "and the field reads its current value apart from its name")
        await category.focus()
        await page.keyboard.press("Enter")
        expect.equal(await page.getByRole("listbox", { name: "Category" }).count(), 1, "the open list is named like the field")
      },
    },
    {
      name: "The list opens in a portal, so the card around it never clips it",
      example: "clipped",
      async run({ page, scope, expect }) {
        const card = scope.locator("[data-card]")
        await scope.getByRole("combobox", { name: "Month" }).click()
        const list = page.getByRole("listbox", { name: "Month" })
        await list.waitFor()
        await settled(page)
        expect.equal(await card.locator('[role="listbox"]').count(), 0, "the list is not inside the card")
        const c = await card.boundingBox()
        const l = await list.boundingBox()
        // Below the trigger, or flipped above it when there is more room there: either way past the card's edge.
        expect(l.y + l.height > c.y + c.height + 1 || l.y < c.y - 1, "the list reaches past the card's edge")
        const topmost = await list.evaluate((el) => {
          const r = el.getBoundingClientRect()
          return el.contains(document.elementFromPoint(r.left + r.width / 2, r.bottom - 12))
        })
        expect(topmost, "nothing covers the foot of the list")
      },
    },
    {
      name: "The active option scrolls into view",
      example: "clipped",
      viewport: { width: 1280, height: 420 },
      async run({ page, scope, expect }) {
        const trigger = scope.getByRole("combobox", { name: "Month" })
        await trigger.scrollIntoViewIfNeeded()
        await trigger.focus()
        await page.keyboard.press("Enter")
        await optionInHand(page, "March")
        const list = page.getByRole("listbox", { name: "Month" })
        expect(await list.evaluate((el) => el.querySelector("[data-radix-select-viewport]").scrollHeight > el.querySelector("[data-radix-select-viewport]").clientHeight), "the list is long enough to scroll")
        await page.keyboard.press("End")
        await optionInHand(page, "December")
        const shown = await page.evaluate(() => {
          const option = document.activeElement.getBoundingClientRect()
          const view = document.activeElement.closest("[data-radix-select-viewport]").getBoundingClientRect()
          return option.top >= view.top - 1 && option.bottom <= view.bottom + 1
        })
        expect(shown, "December is inside the visible part of the list")
      },
    },
    {
      name: "The option in hand has a 1px edge at 3:1, and a 2px ring from the keyboard, in both themes",
      example: "basics",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        // At rest in hand (the list drawn open for a design shows it): the tint and a 1px inset edge in line-control.
        const drawn = await page.locator('[data-example="open"] [role="option"][data-highlighted]').evaluate(readStyle)
        expect.equal(drawn.outline, "solid 1px -1px", "a 1px edge drawn inside the option")
        expect.equal(drawn.outlineColour, drawn.lineControl, "in line-control")
        expect.atLeast(Number(contrast(drawn.lineControl, drawn.list).toFixed(2)), 3, "the edge against the list")
        // From the keyboard, in the live list: a 2px ring in the focus colour.
        await scope.getByRole("combobox", { name: "Category" }).focus()
        await page.keyboard.press("Enter")
        await optionInHand(page, "Travel")
        await page.keyboard.press("ArrowDown")
        await optionInHand(page, "Meals")
        expect(await page.evaluate(() => document.activeElement.hasAttribute("data-highlighted")), "the option in hand is marked")
        const e = await page.evaluateHandle(() => document.activeElement).then((h) => h.evaluate(readStyle))
        expect.equal(e.outline, "solid 2px -2px", "a 2px ring drawn inside the option")
        expect.equal(e.outlineColour, e.focus, "in the focus colour")
        expect.atLeast(Number(contrast(e.focus, e.list).toFixed(2)), 3, "the ring against the list")
      },
    },
    {
      name: "With a pointer the option in hand shows its edge, and the ring returns with the first key",
      example: "basics",
      async run({ page, scope, expect }) {
        await scope.getByRole("combobox", { name: "Category" }).click()
        await settled(page)
        await page.getByRole("option", { name: "Equipment" }).hover()
        await optionInHand(page, "Equipment")
        const pointer = await page.evaluateHandle(() => document.activeElement).then((h) => h.evaluate(readStyle))
        expect.equal(pointer.outline, "solid 1px -1px", "the 1px edge, no ring, under the pointer")
        expect.equal(pointer.outlineColour, pointer.lineControl, "in line-control")
        await page.keyboard.press("ArrowDown")
        await optionInHand(page, "Software")
        const keys = await page.evaluateHandle(() => document.activeElement).then((h) => h.evaluate(readStyle))
        expect.equal(keys.outline, "solid 2px -2px", "the 2px ring once a key is pressed")
      },
    },
    {
      name: "The trigger's focus is a 2px edge, and invalid stays danger when focused",
      example: "sizes",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await tabTo(page, () => document.activeElement?.getAttribute("role") === "combobox")
        const first = await page.evaluateHandle(() => document.activeElement).then((h) => h.evaluate(readStyle))
        expect(twoPx(first, first.focus), `a 2px focus edge (border ${first.border}, ring ${first.shadow})`)
        await tabTo(page, () => document.activeElement?.getAttribute("aria-invalid") === "true")
        const state = await page.evaluateHandle(() => document.activeElement).then((h) => h.evaluate(readStyle))
        expect(twoPx(state, state.danger), `danger and 2px when focused (border ${state.border}, ring ${state.shadow})`)
        expect.equal(await scope.getByRole("combobox", { name: "Currency" }).isDisabled(), true, "disabled")
      },
    },
    {
      name: "Touch: 40, 44 and 48px triggers with 16px text, and 44px options",
      example: "sizes",
      touch: true,
      async run({ page, scope, expect }) {
        const sizes = []
        for (const name of ["Region", "Team", "Plan"]) {
          const t = scope.getByRole("combobox", { name })
          sizes.push(`${Math.round((await t.boundingBox()).height)}/${await t.evaluate((el) => getComputedStyle(el).fontSize)}`)
        }
        expect.equal(sizes.join(","), "40/16px,44/16px,48/16px", "touch triggers")
        await scope.getByRole("combobox", { name: "Team" }).focus()
        await page.keyboard.press("Enter")
        await optionInHand(page)
        await settled(page)
        for (const option of await page.getByRole("listbox", { name: "Team" }).getByRole("option").all()) expect.atLeast(Math.round((await option.boundingBox()).height), 44, "option height on touch")
      },
    },
    {
      name: "Drawn open for a design, the list shows in place and takes no focus",
      example: "open",
      async run({ page, scope, expect }) {
        const list = scope.getByRole("listbox", { name: "Approver" })
        expect.equal(await list.count(), 1, "the list is drawn inside the board, named like the field")
        expect((await scope.getByRole("option", { selected: true }).textContent()).startsWith("Finance"), "the chosen option is marked")
        expect.equal(await scope.locator('[role="option"][data-highlighted]').count(), 1, "one option in hand")
        expect.equal(await page.evaluate(() => document.activeElement === document.body), true, "nothing took focus")
        expect.equal(await scope.getByRole("combobox", { name: "Approver" }).getAttribute("aria-expanded"), "true", "the trigger says it is open")
      },
    },
    {
      name: "Forced colours keep the trigger's focus and the option in hand visible",
      example: "basics",
      forcedColors: true,
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => `${document.activeElement.getAttribute("role")} ${getComputedStyle(document.activeElement).outlineStyle}`), "combobox solid", "the focused trigger is outlined")
        await scope.getByRole("combobox", { name: "Category" }).focus()
        await page.keyboard.press("Enter")
        await optionInHand(page, "Travel")
        await page.keyboard.press("ArrowDown")
        await optionInHand(page, "Meals")
        const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)
        expect.equal(outline, "solid", "outlined in forced colours")
      },
    },
  ],
}
