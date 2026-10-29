// MultiSelect's one definition: its README, its preview board and its scripted checks all come from here.

const row = (inner) => `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`
const field = (label, props, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.MultiSelect" ${props}></x-import>\n</x-import>`

const PEOPLE = [
  { value: "amira", label: "[Amira Haddad]", description: "Kitchen lead" },
  { value: "ben", label: "[Ben Okafor]", description: "Front of house" },
  { value: "chloe", label: "[Chloe Martin]", description: "Front of house" },
  { value: "harriet", label: "[Harriet Lee]", description: "Finance" },
  { value: "hamish", label: "[Hamish Grant]", description: "Owner" },
  { value: "jun", label: "[Jun Park]", description: "Deliveries" },
  { value: "lena", label: "[Lena Novak]", description: "Kitchen" },
  { value: "priya", label: "[Priya Raman]", description: "On leave until [3 November]", disabled: true },
  { value: "tom", label: "[Tom Walsh]", description: "Kitchen" },
]
const CATEGORIES = [
  { value: "travel", label: "Travel", color: 1 },
  { value: "meals", label: "Meals", color: 2 },
  { value: "equipment", label: "Equipment", color: 3 },
  { value: "software", label: "Software", color: 4 },
  { value: "stock", label: "Stock", color: 5 },
  { value: "repairs", label: "Repairs", color: 6 },
]
const TOPICS = ["Rosters", "Payroll", "Leave", "Stock", "Suppliers", "Invoices", "Training", "Safety", "Maintenance", "Events"]

const inHand = (page) =>
  page.evaluate(() => {
    const id = document.activeElement?.getAttribute("aria-activedescendant")
    return id ? (document.getElementById(id)?.textContent ?? "").trim() : null
  })
const tokens = (locator) => locator.locator('[data-slot="tag-label"]').allTextContents()
const openLists = (page) => page.evaluate(() => document.querySelectorAll("[data-radix-popper-content-wrapper]").length)

export default {
  name: "MultiSelect",
  group: "Inputs",
  job: "Several options, shown as removable tokens: assignees, categories, people to invite.",
  status: "to build",
  props: [
    { name: "options", type: "Array<string | { value: string; label: string; description?: string; icon?: IconName; color?: 1 | 2 | 3 | 4 | 5 | 6 | \"grey\"; disabled?: boolean }>", doc: "The options. A colour gives the token its category's dot, as a Tag does." },
    { name: "value", type: "string[]", doc: "The chosen options, when the page holds them, in the order they were chosen." },
    { name: "defaultValue", type: "string[]", doc: "The options chosen to start with, when the MultiSelect holds them." },
    { name: "onChange", type: "(values: string[]) => void", doc: "Called with every chosen value after each add or removal." },
    { name: "onInputChange", type: "(text: string) => void", doc: "Called as the person types, to fetch options. Pair it with filter={false} when the options come back already filtered." },
    { name: "filter", type: "boolean", default: "true", doc: "Filters the options to what is typed, ignoring case and accents." },
    { name: "loading", type: "boolean", default: "false", doc: "Options are being fetched: the list says Searching." },
    { name: "placeholder", type: "string", doc: "Says what to type, shown while nothing is chosen: Type a name. Never Select..." },
    { name: "emptyText", type: "string", doc: "What the list says when nothing matches." },
    { name: "query", type: "string", doc: "The text typed to start with. On a board, with open, it shows the list filtered to it." },
    { name: "open", type: "boolean", default: "false", doc: "Design mode: draws the list open in place, for a board. Never in a product." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px at least; 40, 44 or 48px on a touch screen. It grows with its tokens." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and closed, and the tokens lose their remove buttons. Say why in the Field's hint." },
    { name: "required", type: "boolean", default: "false", doc: "At least one must be chosen. Inside a Field, the Field's required sets it." },
    { name: "name", type: "string", doc: "The form field's name: one hidden input per chosen value, for a native form post." },
    { name: "id", type: "string", doc: "The input's id. Inside a Field, the Field gives one." },
    { name: "ariaLabel", type: "string", doc: "The name of a MultiSelect outside a Field (aria-label in a product)." },
    { name: "ariaLabelledby", type: "string", doc: "Or the id of visible text that names it (aria-labelledby in a product)." },
  ],
  notes: {
    Behaviour: [
      "Everything a Combobox does: typing filters with the first match in hand, Up and Down move, Escape closes and keeps focus on the input, and the list opens in a portal, named like its field.",
      "Enter adds the option in hand, or takes it away if it is already chosen. The list stays open, the typed text clears, and the whole list shows again, so the next one is a few keys away. A press on an option does the same.",
      "Backspace in the empty input removes the last token. A press on the field opens the list; a press on the Field's label only focuses it. The chevron is named after its field (Show options for Assignees), so lists on one page never share a name.",
      "Each token is a Tag with a remove button named Remove [value]. Removing one moves focus to the next token's button, or to the input after the last.",
      "The listbox says several can be chosen, and each option says whether it is chosen. A box at the start of each option is ticked when it is.",
      "A screen reader hears what is chosen with the input (2 chosen: [Amira Haddad], [Harriet Lee]), and hears each add or removal as it happens, with the new count.",
    ],
    Layout: ["The box grows with its tokens, wrapping onto new lines; the chevron stays centred at the end. Tokens keep the order they were chosen in."],
    States: ["Empty with a placeholder, with tokens, open, the option in hand, nothing matched, searching, invalid and disabled."],
    Copy: ["The placeholder says what to type: Type a name. It shows only while nothing is chosen."],
    Rules: [
      "One choice: a Combobox. A handful of options that all fit on screen: checkboxes.",
      "Each token's remove button is a 24px target, and 40px on touch, with 8px between targets there.",
    ],
  },
  examples: [
    {
      id: "basics",
      title: "Tokens, colours, and empty",
      layout: "block",
      markup: row(
        [
          field("Assignees", 'default-value="{{assigned}}" name="assignees" options="{{people}}"', ' hint="Everyone here gets a reminder."'),
          field("Categories", 'default-value="{{picked}}" options="{{categories}}"'),
          field("Invite", 'placeholder="Type a name" options="{{people}}"'),
        ].join("\n")
      ),
      vals: { people: PEOPLE, categories: CATEGORIES, assigned: ["amira", "harriet"], picked: ["travel", "software", "stock"] },
    },
    {
      id: "states",
      title: "Sizes, many tokens, invalid and disabled",
      layout: "block",
      markup: row(
        [
          field("Teams", 'size="sm" default-value="{{teams}}" options="{{teamOptions}}"'),
          field("Topics", 'default-value="{{topics}}" options="{{topicOptions}}"', ' hint="Wraps onto new lines as it grows."'),
          field("Reviewers", 'size="lg" placeholder="Type a name" options="{{people}}"'),
          field("Approvers", 'placeholder="Type a name" options="{{people}}"', ' error="Choose at least one approver"'),
          field("Locations", 'disabled="{{yes}}" default-value="{{locations}}" options="{{locationOptions}}"', ' hint="Set by the account owner."'),
        ].join("\n")
      ),
      vals: {
        teams: ["Kitchen"],
        teamOptions: ["Kitchen", "Front of house", "Deliveries"],
        topics: ["Rosters", "Payroll", "Leave", "Stock", "Suppliers", "Training"],
        topicOptions: TOPICS,
        locations: ["[Fitzroy]", "[Brunswick]"],
        locationOptions: ["[Fitzroy]", "[Brunswick]", "[Carlton]"],
        yes: true,
      },
    },
    {
      id: "open",
      title: "Drawn open for a design",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; width: 100%; height: 300px;">
${field("Owners", 'open="{{yes}}" default-value="{{assigned}}" options="{{people}}"')}
${field("Watchers", 'open="{{yes}}" query="ha" default-value="{{watching}}" options="{{people}}"')}
</div>`,
      vals: { watching: ["harriet"] },
    },
  ],
  frame: { width: 960, height: 872 },
  checks: [
    {
      name: "Touch: the list button is a 40px square at least at sm, md and lg, inside the box's edge with no clear border taking its tint",
      example: "states",
      touch: true,
      async run({ scope, expect }) {
        const rows = await scope.locator('[data-slot="combobox-toggle"]').evaluateAll((els) =>
          els.map((button) => {
            const r = button.getBoundingClientRect()
            const box = button.closest("[data-size]").getBoundingClientRect()
            return { size: button.closest("[data-size]").dataset.size, w: Math.round(r.width), h: Math.round(r.height), inside: r.top >= box.top + 1 && r.bottom <= box.bottom - 1, border: getComputedStyle(button).borderTopWidth }
          })
        )
        expect.equal([...new Set(rows.map((r) => r.size))].sort().join(" "), "lg md sm", "every size is measured")
        for (const r of rows) {
          expect(r.w >= 40 && r.h >= 40, `${r.size}: ${r.w}x${r.h}, a 40px square at least`)
          expect(r.inside, `${r.size}: the button sits inside the box's edge`)
          expect.equal(r.border, "0px", `${r.size}: no clear border shrinks the button's tint`)
        }
      },
    },
    {
      name: "Each list button is named after its field, so two MultiSelects on a page never share a name",
      example: "basics",
      async run({ page, scope, expect }) {
        const names = await scope.locator('[data-slot="combobox-toggle"]').evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")))
        expect.equal(names.join(" | "), "Show options for Assignees | Show options for Categories | Show options for Invite", "each button names its field")
        expect.equal(new Set(names).size, names.length, "no two buttons share a name")
        await scope.getByRole("button", { name: "Show options for Assignees", exact: true }).click()
        await page.getByRole("listbox", { name: "Assignees" }).waitFor()
        expect.equal(await scope.getByRole("button", { name: "Hide options for Assignees", exact: true }).count(), 1, "open, the Assignees button hides the Assignees options")
      },
    },
    {
      name: "Typing filters, Enter adds the option in hand, the list stays open, and the text clears for the next one",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Invite" })
        await input.focus()
        await page.keyboard.type("ha")
        const list = page.getByRole("listbox", { name: "Invite" })
        await list.waitFor()
        expect.equal(await list.getAttribute("aria-multiselectable"), "true", "the list says several can be chosen")
        expect.equal(await inHand(page), "[Amira Haddad]Kitchen lead", "the first match is in hand")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")
        const field = scope.locator('[data-slot="multi-select-field"]').nth(2)
        expect.equal((await tokens(field)).join("|"), "[Harriet Lee]", "Enter added the option in hand as a token")
        expect.equal(await input.inputValue(), "", "the typed text cleared")
        expect.equal(await list.count(), 1, "the list stays open")
        expect.equal(await list.getByRole("option").count(), 9, "the whole list shows again")
        expect.equal(await list.getByRole("option", { name: /Harriet Lee/ }).getAttribute("aria-selected"), "true", "the option says it is chosen")
        expect.equal(await inHand(page), "[Harriet Lee]Finance", "and it is still in hand")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")
        expect.equal((await tokens(field)).join("|"), "[Harriet Lee]|[Hamish Grant]", "tokens keep the order they were chosen in")
        const region = field.locator('[aria-live="polite"]')
        expect.equal((await region.textContent()).trim(), "Added [Hamish Grant]. 2 chosen.", "the add is spoken with the new count")
        await page.keyboard.press("ArrowUp")
        await page.keyboard.press("Enter")
        expect.equal((await tokens(field)).join("|"), "[Hamish Grant]", "Enter on a chosen option takes it away")
        expect(await input.evaluate((el) => document.activeElement === el), "focus stayed on the input")
      },
    },
    {
      name: "Backspace in the empty input removes the last token, and says so",
      example: "basics",
      async run({ page, scope, expect }) {
        const field = scope.locator('[data-slot="multi-select-field"]').nth(1)
        const input = scope.getByRole("combobox", { name: "Categories" })
        expect.equal((await tokens(field)).join("|"), "Travel|Software|Stock", "three tokens to start")
        await input.focus()
        await page.keyboard.type("x")
        await page.keyboard.press("Backspace")
        expect.equal((await tokens(field)).length, 3, "Backspace that deletes typed text leaves the tokens alone")
        await page.keyboard.press("Backspace")
        expect.equal((await tokens(field)).join("|"), "Travel|Software", "Backspace in the empty input removed the last token")
        expect.equal((await field.locator('[aria-live="polite"]').textContent()).trim(), "Removed Stock. 2 chosen.", "the removal is spoken")
        await page.keyboard.press("Backspace")
        await page.keyboard.press("Backspace")
        await page.keyboard.press("Backspace")
        expect.equal((await tokens(field)).length, 0, "and keeps going until none are left")
        expect.equal(await input.getAttribute("placeholder"), null, "a field with no placeholder of its own shows none")
      },
    },
    {
      name: "Each token's remove button is named for it with a 24px target; removing one moves focus to the next, then the input",
      example: "basics",
      async run({ page, scope, expect }) {
        const field = scope.locator('[data-slot="multi-select-field"]').nth(1)
        const travel = field.getByRole("button", { name: "Remove Travel" })
        const box = await travel.boundingBox()
        expect.atLeast(Math.round(box.width), 24, "the remove target is 24px wide")
        expect.atLeast(Math.round(box.height), 24, "and 24px tall")
        await travel.focus()
        await page.keyboard.press("Enter")
        expect.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Remove Software", "focus moved to the next token's button")
        await page.keyboard.press("Enter")
        await page.keyboard.press("Enter")
        expect.equal(await page.evaluate(() => document.activeElement.getAttribute("role")), "combobox", "after the last token, focus is on the input")
        expect.equal((await tokens(field)).length, 0, "all three removed")
      },
    },
    {
      name: "What is chosen is read with the input, and a form post carries every value",
      example: "basics",
      async run({ scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Assignees" })
        const read = await input.evaluate((el) => el.getAttribute("aria-describedby").split(" ").map((id) => document.getElementById(id)?.textContent.trim()).join(" | "))
        expect.equal(read, "2 chosen: [Amira Haddad], [Harriet Lee]. | Everyone here gets a reminder.", "the chosen tokens, then the hint")
        const posted = await scope.locator('input[type="hidden"][name="assignees"]').evaluateAll((els) => els.map((el) => el.value).join(","))
        expect.equal(posted, "amira,harriet", "one hidden input per value")
      },
    },
    {
      name: "Escape closes the list at once and keeps focus on the input; a second Escape reaches the page",
      example: "basics",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__escapes = []
          window.addEventListener("keydown", (e) => e.key === "Escape" && window.__escapes.push(e.defaultPrevented))
        })
        // A press on the label only focuses the input; Down opens the list.
        await scope.getByText("Assignees", { exact: true }).click()
        expect.equal(await page.evaluate(() => `${document.activeElement?.getAttribute("role")} ${document.querySelectorAll("[data-radix-popper-content-wrapper]").length}`), "combobox 0", "the label focused the input and opened nothing")
        await page.keyboard.press("ArrowDown")
        await page.getByRole("listbox", { name: "Assignees" }).waitFor()
        await page.keyboard.press("Escape")
        const right = await page.evaluate(() => ({ focus: document.activeElement?.getAttribute("role"), lists: document.querySelectorAll("[data-radix-popper-content-wrapper]").length, guards: document.querySelectorAll("[data-radix-focus-guard]").length }))
        expect.equal(`${right.focus} ${right.lists} ${right.guards}`, "combobox 0 0", "focus on the input, the list and its guards gone at once")
        await page.keyboard.press("Escape")
        expect.equal(JSON.stringify(await page.evaluate(() => window.__escapes)), "[true,false]", "the first Escape closed the list; the second reached the page")
      },
    },
    {
      name: "A press on an option adds it and keeps the list open; a disabled option says so and does nothing",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Invite" })
        await input.click()
        const list = page.getByRole("listbox", { name: "Invite" })
        await list.waitFor()
        await list.getByRole("option", { name: /Jun Park/ }).click()
        await list.getByRole("option", { name: /Priya Raman/ }).click({ force: true })
        const field = scope.locator('[data-slot="multi-select-field"]').nth(2)
        expect.equal((await tokens(field)).join("|"), "[Jun Park]", "the press added one token; the disabled option added none")
        expect.equal(await list.getByRole("option", { name: /Priya Raman/ }).getAttribute("aria-disabled"), "true", "the disabled option says so")
        expect.equal(await openLists(page), 1, "the list stays open")
        expect(await input.evaluate((el) => document.activeElement === el), "focus is on the input")
      },
    },
    {
      name: "Touch: remove buttons are 40px targets with 8px between them, and the field is 44px at least",
      example: "states",
      touch: true,
      async run({ scope, expect }) {
        const field = scope.locator('[data-slot="multi-select-field"]').nth(1)
        const boxes = await field.locator('[data-slot="tag-remove"]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))
        for (const b of boxes) expect.atLeast(Math.round(Math.min(b.width, b.height)), 40, "a 40px remove target on touch")
        expect.atLeast(boxes.length, 6, "six tokens to measure")
        // Any two targets: side by side they are 8px apart; one above the other, 8px apart too.
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const [a, b] = [boxes[i], boxes[j]]
            const across = Math.max(b.left - a.right, a.left - b.right)
            const down = Math.max(b.top - a.bottom, a.top - b.bottom)
            expect.atLeast(Math.round(Math.max(across, down)), 8, `8px between the remove targets of tokens ${i + 1} and ${j + 1}`)
          }
        }
        const height = await scope.getByRole("combobox", { name: "Reviewers" }).evaluate((el) => el.closest('[data-slot="multi-select"]').getBoundingClientRect().height)
        expect.atLeast(Math.round(height), 48, "a large field is 48px on touch")
        expect.equal(await scope.getByRole("combobox", { name: "Reviewers" }).evaluate((el) => getComputedStyle(el).fontSize), "16px", "16px text on touch")
      },
    },
    {
      name: "Invalid is a danger edge; disabled tokens have no remove buttons",
      example: "states",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const edge = await scope.getByRole("combobox", { name: "Approvers" }).evaluate((el) => {
          const box = getComputedStyle(el.closest('[data-slot="multi-select"]'))
          const probe = document.createElement("span")
          document.body.append(probe)
          probe.style.color = "var(--danger)"
          const danger = getComputedStyle(probe).color
          probe.remove()
          return box.borderTopColor === danger
        })
        expect(edge, "the field's edge is danger")
        const locations = scope.locator('[data-slot="multi-select-field"]').nth(4)
        expect.equal(await locations.locator('[data-slot="tag-remove"]').count(), 0, "a disabled field's tokens cannot be removed")
        expect.equal(await scope.getByRole("combobox", { name: "Locations" }).isDisabled(), true, "and its input is disabled")
      },
    },
    {
      name: "Drawn open for a design, it is a still picture: no focus guards, no extra tab stops, chosen options ticked",
      example: "open",
      async run({ page, scope, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards")
        expect.equal(await page.evaluate(() => document.activeElement === document.body), true, "nothing took focus")
        const owners = scope.getByRole("listbox", { name: "Owners" })
        expect.equal((await owners.getByRole("option", { selected: true }).allTextContents()).join("|"), "[Amira Haddad]Kitchen lead|[Harriet Lee]Finance", "chosen options are marked")
        expect.equal(await owners.locator('[data-slot="combobox-option-box"] svg').count(), 2, "and ticked")
        expect.equal((await scope.getByRole("listbox", { name: "Watchers" }).getByRole("option").allTextContents()).join("|"), "[Amira Haddad]Kitchen lead|[Harriet Lee]Finance|[Hamish Grant]Owner", "filtered to what was typed")
        await scope.getByRole("combobox", { name: "Watchers" }).focus()
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => (document.activeElement === document.body ? "body" : document.activeElement.tagName)), "body", "no tab stops after the last field")
      },
    },
    {
      name: "Forced colours keep the option in hand outlined, and a chosen option's box filled",
      example: "basics",
      forcedColors: true,
      async run({ page, scope, expect }) {
        await scope.getByRole("combobox", { name: "Assignees" }).focus()
        await page.keyboard.press("ArrowDown")
        const option = await page.evaluate(() => {
          const el = document.getElementById(document.activeElement.getAttribute("aria-activedescendant"))
          return `${getComputedStyle(el).outlineStyle} ${parseFloat(getComputedStyle(el).outlineWidth) >= 2}`
        })
        expect.equal(option, "solid true", "the option in hand is outlined")
        const ticks = await page.getByRole("listbox", { name: "Assignees" }).locator('[aria-selected="true"] [data-slot="combobox-option-box"] svg').count()
        expect.equal(ticks, 2, "the chosen options keep their ticks")
      },
    },
  ],
}
