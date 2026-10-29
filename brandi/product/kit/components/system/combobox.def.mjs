// Combobox's one definition: its README, its preview board and its scripted checks all come from here.

const row = (inner, columns = 3) => `<div style="display: grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`
const field = (label, props, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.Combobox" ${props}></x-import>\n</x-import>`

const SUPPLIERS = [
  "[Alpine Linen Hire]",
  "[Bayside Seafood]",
  "[Blue Gum Dairy]",
  "[Coastal Cleaning Co]",
  "[Corner Store Wholesale]",
  "[Eastside Butchers]",
  "[Fernvale Eggs]",
  "[Golden Crust Flour]",
  "[Harbour Street Bakery]",
  "[Harbourside Produce]",
  "[Hart and Sons Meats]",
  "[Ironbark Coffee]",
  "[Kingfisher Packaging]",
  "[Lighthouse Beverages]",
  "[Marlow Gas and Electric]",
  "[Northern Rivers Fruit]",
  "[Paperbark Print]",
  "[Redgum Firewood]",
  "[Saltbush Spices]",
  "[Wattle Waste Services]",
]
// The fetched example's whole client list; the board hands back the first five that match.
const CLIENTS = [
  "[Andy Moreau]",
  "[Anika Shah]",
  "[Brandon Lee]",
  "[Danielle Ford]",
  "[Evan Brooks]",
  "[Hannah Kim]",
  "[Ian Walsh]",
  "[Joanna Pike]",
  "[Mandy Cole]",
  "[Nathan Price]",
  "[Olivia Grant]",
  "[Priya Nair]",
  "[Rosa Diaz]",
  "[Sam Okafor]",
  "[Uma Patel]",
  "[Victor Hale]",
]
const CATEGORIES = ["Travel", "Meals", "Equipment", "Software", "Stock", "Repairs", "Rent", "Utilities", "Insurance", "Training", "Subscriptions", "Fuel", "Uniforms", "Cleaning", "Marketing", "Bank fees"]
const PEOPLE = [
  { value: "amira", label: "[Amira Haddad]", description: "Kitchen lead", icon: "User" },
  { value: "ben", label: "[Ben Okafor]", description: "Front of house", icon: "User" },
  { value: "harriet", label: "[Harriet Lee]", description: "Finance", icon: "User" },
  { value: "hamish", label: "[Hamish Grant]", description: "Owner", icon: "User" },
  { value: "priya", label: "[Priya Raman]", description: "Deliveries", icon: "User", disabled: true },
]

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
    panel: getComputedStyle(el.closest('[data-slot="combobox-panel"]') ?? document.body).backgroundColor,
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

// The option the focused input points at, by its text.
const inHand = (page) =>
  page.evaluate(() => {
    const id = document.activeElement?.getAttribute("aria-activedescendant")
    return id ? (document.getElementById(id)?.textContent ?? "").trim() : null
  })
const openLists = (page) => page.evaluate(() => document.querySelectorAll("[data-radix-popper-content-wrapper]").length)
// The live panel fades and grows in; measure it once that has finished. (A spinner drawn on the board never stops.)
const settled = (page) =>
  page.waitForFunction(() => {
    const panel = document.querySelector('[data-radix-popper-content-wrapper] [data-slot="combobox-panel"]')
    return panel && panel.getAnimations({ subtree: true }).every((a) => a.playState !== "running")
  }, null, { timeout: 3000 })

export default {
  name: "Combobox",
  group: "Inputs",
  job: "One option from a long or searchable list, including options fetched as the person types.",
  status: "to build",
  props: [
    { name: "options", type: "Array<string | { value: string; label: string; description?: string; icon?: IconName; disabled?: boolean }>", doc: "The options. Past about 15, a Combobox replaces a Select. A description sits under its label in the list only." },
    { name: "value", type: "string", doc: "The chosen option, when the page holds it." },
    { name: "defaultValue", type: "string", doc: "The option chosen to start with, when the Combobox holds it." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the chosen option's value, or an empty string when the field is cleared." },
    { name: "onInputChange", type: "(text: string) => void", doc: "Called as the person types, to fetch options. Pair it with filter={false} when the options come back already filtered." },
    { name: "filter", type: "boolean", default: "true", doc: "Filters the options to what is typed, ignoring case and accents. Off when the product filters them itself." },
    { name: "loading", type: "boolean", default: "false", doc: "Options are being fetched: the list says Searching." },
    { name: "placeholder", type: "string", doc: "Says what to type: Type a [supplier] name. Never Select..." },
    { name: "emptyText", type: "string", doc: "What the list says when nothing matches. By default it repeats what was typed and suggests fewer letters." },
    { name: "query", type: "string", doc: "The text typed to start with. On a board, with open, it shows the list filtered to it." },
    { name: "open", type: "boolean", default: "false", doc: "Design mode: draws the list open in place, for a board. It takes no focus and blocks nothing. Never in a product." },
    { name: "icon", type: "IconName", doc: "An icon at the start of the field, such as Search or User." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen, with 16px text there." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and closed. Say why in the Field's hint." },
    { name: "required", type: "boolean", default: "false", doc: "Must be chosen before the form saves. Inside a Field, the Field's required sets it." },
    { name: "name", type: "string", doc: "The form field's name: a hidden input carries the chosen value, for a native form post." },
    { name: "id", type: "string", doc: "The input's id. Inside a Field, the Field gives one." },
    { name: "ariaLabel", type: "string", doc: "The name of a Combobox outside a Field. A board writes aria-label, which arrives as ariaLabel; both work." },
    { name: "ariaLabelledby", type: "string", doc: "Or the id of visible text that names it, outside a Field (aria-labelledby in a product)." },
  ],
  notes: {
    Behaviour: [
      "An editable combobox with a list (the APG pattern). Focus stays on the input throughout; the input points at the option in hand, so a screen reader follows it.",
      "Typing filters the options, ignoring case and accents, and opens the list with the first match in hand, so Enter takes it. Up and Down move through the options and stop at the ends; the option in hand scrolls into view.",
      "Down or Up opens the list at the chosen option. Alt and Down opens it without moving; Alt and Up closes it. A press on the field or its chevron opens it too; a press on the Field's label only focuses it, as it does a Select. The chevron is named after its field (Show options for Supplier), so lists on one page never share a name. Home and End move the caret, as in any text field.",
      "Enter chooses the option in hand and closes the list. Escape closes it without choosing and keeps what was typed; a second Escape is left to the page, so a dialog behind it can close. With the list closed, Enter settles the field first (as leaving it does) and lets the form send.",
      "It closes at once, with no fade, so no layer is left behind to swallow the next Escape.",
      "Leaving the field chooses an option whose name was typed in full. Anything else typed stays as typed, and the field stops claiming a choice its text no longer shows; the form's own check then asks for one. Clearing the text clears the choice.",
      "When nothing matches, the list says so, repeats what was typed, and keeps it in the field. A screen reader hears the count of matches once typing settles, never on every key.",
      "Fetching as the person types: onInputChange hears each change, loading shows Searching in the list, and filter={false} shows the options as the product returns them.",
      "The list is named like the field, opens in a portal above everything, and flips up when there is no room below. Drawn open for a design (open), it is a still picture: no live layer, no focus guards, no extra tab stops.",
    ],
    States: [
      "Closed, open, the option in hand (the hover tint and a 1px line-control edge, a 2px focus ring while keys drive), chosen (a check), nothing matched, searching, invalid and disabled.",
      "The field has the input's edge: a 2px focus edge in place of the outline, and a danger edge that stays danger when focused.",
    ],
    Copy: [
      "The placeholder says what to type: Type a [supplier] name. Never Select...",
      "Nothing matched: No matches for ‘[harb]’. Try fewer letters.",
    ],
    Rules: [
      "Up to about 15 options people can scan: a Select. Fewer than five to compare: a RadioGroup. Several to choose: a MultiSelect.",
      "Outside a Field, give it aria-label or aria-labelledby.",
      "Options are 36px tall, 44px on touch. Keep the list in the order people learnt; filtering never reorders it.",
    ],
    Accepted: [
      "Leaving the field with text that names no option keeps the text and clears the choice, rather than putting the old choice back. Nothing typed is thrown away, and the field never shows one thing while holding another (05-components.md, Combobox: keep what was typed).",
    ],
  },
  examples: [
    {
      id: "basics",
      title: "Typed to filter, and a value",
      layout: "block",
      markup: row(
        [
          field("Supplier", 'placeholder="Type a [supplier] name" options="{{suppliers}}"', ' hint="20 suppliers. Type part of a name."'),
          field("Category", 'default-value="Travel" name="category" options="{{categories}}"'),
          field("Assign to", 'icon="User" placeholder="Type a name" options="{{people}}"'),
        ].join("\n")
      ),
      vals: { suppliers: SUPPLIERS, categories: CATEGORIES, people: PEOPLE },
    },
    {
      id: "states",
      title: "Sizes, invalid and disabled",
      layout: "block",
      markup: row(
        [
          field("Region", 'size="sm" default-value="Metro" options="{{regions}}"'),
          field("Team", 'default-value="Kitchen" options="{{teams}}"'),
          field("Supplier", 'size="lg" placeholder="Type a [supplier] name" options="{{suppliers}}"'),
          field("Cost centre", 'options="{{categories}}" placeholder="Type a cost centre"', ' error="Choose a cost centre from the list"'),
          field("Account", 'disabled="{{yes}}" default-value="Rent" options="{{categories}}"', ' hint="Set by finance when the account was opened."'),
        ].join("\n")
      ),
      vals: { regions: ["Metro", "Regional", "Remote"], teams: ["Kitchen", "Front of house", "Deliveries", "Office"], yes: true },
    },
    {
      id: "standalone",
      title: "Outside a Field, named by aria-label",
      markup: `<x-import component-from-global-scope="NS.Combobox" aria-label="Filter by supplier" icon="Search" placeholder="Type a [supplier] name" options="{{suppliers}}" style="display: block; width: 280px;"></x-import>`,
    },
    {
      id: "clipped",
      title: "In a card that clips",
      layout: "block",
      markup: `<div data-card="" style="box-sizing: border-box; width: 300px; height: 112px; overflow: hidden; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface);">
<x-import component-from-global-scope="NS.Field" label="Supplier">
<x-import component-from-global-scope="NS.Combobox" placeholder="Type a [supplier] name" options="{{suppliers}}"></x-import>
</x-import>
</div>`,
    },
    {
      id: "fetched",
      title: "Options the product fetches as the person types",
      layout: "block",
      markup: `<div style="width: 300px;">
${field("Client", 'filter="{{no}}" options="{{found}}" on-input-change="{{findClients}}" on-change="{{clearClients}}" name="client" placeholder="Type a [client] name"', ' hint="The product searches its clients as you type."')}
</div>`,
    },
    {
      id: "open",
      title: "Drawn open for a design: filtered, nothing matched, and searching",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; width: 100%; height: 240px;">
${field("Approver", 'open="{{yes}}" query="ha" default-value="harriet" options="{{people}}"')}
${field("Expense type", 'open="{{yes}}" query="parking" options="{{categories}}"')}
${field("Customer", 'open="{{yes}}" query="mar" loading="{{yes}}" filter="{{no}}" options="{{none}}"')}
</div>`,
      vals: { no: false, none: [] },
    },
  ],
  // The fetched example stands in for a search: the board filters a long list and hands back the first five.
  state: { found: [] },
  logic: `found: self.state.found, clearClients: () => self.setState({ found: [] }), findClients: (text) => setTimeout(() => self.setState({ found: text.trim() ? ${JSON.stringify(CLIENTS)}.filter((c) => c.toLowerCase().includes(text.trim().toLowerCase())).slice(0, 5) : [] }), 120)`,
  frame: { width: 960, height: 1104 },
  checks: [
    {
      name: "Touch: the list button is the control's full height, 40, 44 and 48px at sm, md and lg, and the box keeps its edge",
      example: "states",
      touch: true,
      async run({ scope, expect }) {
        const want = { sm: 40, md: 44, lg: 48 }
        const rows = await scope.locator('[data-slot="combobox-toggle"]').evaluateAll((els) =>
          els.map((button) => {
            const box = button.closest("[data-size]")
            const edge = getComputedStyle(box)
            return { size: box.dataset.size, tall: Math.round(button.getBoundingClientRect().height), edge: `${edge.borderTopWidth} ${edge.borderTopStyle}`, clip: getComputedStyle(button).backgroundClip }
          })
        )
        // The box's 1px edge used to come out of the button's height: 38px in a 40px small field on touch.
        expect.equal(rows.map((r) => `${r.size} ${r.tall}`).join(", "), rows.map((r) => `${r.size} ${want[r.size]}`).join(", "), "size and button height, in px")
        expect.equal([...new Set(rows.map((r) => r.size))].sort().join(" "), "lg md sm", "every size is measured")
        for (const r of rows) {
          expect.equal(r.edge, "1px solid", `${r.size} keeps the box's edge`)
          expect.equal(r.clip, "padding-box", `${r.size}: the button's tint stays inside the edge`)
        }
      },
    },
    {
      name: "Each list button is named after its field, so two Comboboxes on a page never share a name",
      example: "basics",
      async run({ page, scope, expect }) {
        const names = await scope.locator('[data-slot="combobox-toggle"]').evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")))
        expect.equal(names.join(" | "), "Show options for Supplier | Show options for Category | Show options for Assign to", "each button names its field")
        expect.equal(new Set(names).size, names.length, "no two buttons share a name")
        await scope.getByRole("button", { name: "Show options for Supplier", exact: true }).click()
        await page.getByRole("listbox", { name: "Supplier" }).waitFor()
        expect.equal(await scope.getByRole("button", { name: "Hide options for Supplier", exact: true }).count(), 1, "open, the Supplier button hides the Supplier options")
      },
    },
    {
      name: "Options the product fetches as the person types are shown as they come, and the input never points at one that has gone",
      example: "fetched",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Client" })
        await input.focus()
        await page.keyboard.press("ArrowDown")
        const status = page.locator('[data-radix-popper-content-wrapper] [data-slot="combobox-status"]')
        expect.equal((await status.textContent()).trim(), "Type to search.", "before any typing, it asks for some")
        await page.keyboard.type("an")
        const list = page.getByRole("listbox", { name: "Client" })
        // The board answers a moment after each key, as a search would.
        await page.waitForFunction(() => document.querySelectorAll('[data-radix-popper-content-wrapper] [role="option"]').length === 5, null, { timeout: 3000 })
        expect.equal(await inHand(page), "[Andy Moreau]", "when the answers arrive, the first is in hand, as typing would put it")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        expect.equal(await inHand(page), "[Danielle Ford]", "Down moves through them")
        await page.keyboard.type("dy")
        await page.waitForFunction(() => document.querySelectorAll('[data-radix-popper-content-wrapper] [role="option"]').length === 2, null, { timeout: 3000 })
        const pointsAt = await page.evaluate(() => {
          const id = document.activeElement.getAttribute("aria-activedescendant")
          return id ? (document.getElementById(id)?.textContent ?? "gone") : "nothing"
        })
        expect.equal(pointsAt, "[Andy Moreau]", "after new answers, the input points at one that is there")
        expect.equal((await list.getByRole("option").allTextContents()).join("|"), "[Andy Moreau]|[Mandy Cole]", "only what the product returned, unfiltered by the field")
        await page.keyboard.press("Enter")
        expect.equal(await input.inputValue(), "[Andy Moreau]", "Enter takes the option in hand")
        // The board clears its answers once a choice is made, as many products do.
        await page.keyboard.press("Tab")
        expect.equal(await input.inputValue(), "[Andy Moreau]", "leaving the field keeps the choice, though the options no longer hold it")
        expect.equal(await scope.locator('input[type="hidden"][name="client"]').inputValue(), "[Andy Moreau]", "and so does the form value")
      },
    },
    {
      name: "A press on the Field's label focuses the input without opening the list; a press on the input opens it",
      example: "basics",
      async run({ page, scope, expect }) {
        await scope.getByText("Category", { exact: true }).click()
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("role")), "combobox", "the label put focus in the input")
        expect.equal(await openLists(page), 0, "and opened nothing")
        await scope.getByRole("combobox", { name: "Category" }).click()
        expect.equal(await openLists(page), 1, "a press on the input opens the list")
      },
    },
    {
      name: "Typing filters with the first match in hand, Down moves, Enter chooses, and focus stays on the input",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Supplier", exact: true })
        await input.focus()
        await page.keyboard.type("harb")
        const list = page.getByRole("listbox", { name: "Supplier" })
        await list.waitFor()
        const shown = await list.getByRole("option").allTextContents()
        expect.equal(shown.join("|"), "[Harbour Street Bakery]|[Harbourside Produce]", "the list holds only the matches, in their order")
        expect.equal(await inHand(page), "[Harbour Street Bakery]", "the first match is in hand from the first key")
        await page.keyboard.press("ArrowDown")
        expect.equal(await inHand(page), "[Harbourside Produce]", "Down moved to the next match")
        await page.keyboard.press("ArrowDown")
        expect.equal(await inHand(page), "[Harbourside Produce]", "Down stops at the end")
        await page.keyboard.press("Enter")
        expect.equal(await openLists(page), 0, "the list closed at once")
        expect.equal(await input.inputValue(), "[Harbourside Produce]", "the field shows the choice")
        expect.equal(await input.getAttribute("aria-expanded"), "false", "and says it is closed")
        expect(await input.evaluate((el) => document.activeElement === el), "focus stayed on the input")
      },
    },
    {
      name: "Escape closes the list at once without choosing and keeps what was typed; a second Escape reaches the page",
      example: "basics",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__escapes = []
          window.addEventListener("keydown", (e) => e.key === "Escape" && window.__escapes.push(e.defaultPrevented))
        })
        const input = scope.getByRole("combobox", { name: "Category" })
        await input.focus()
        await page.keyboard.press("ArrowDown")
        await page.getByRole("listbox", { name: "Category" }).waitFor()
        expect.equal(await inHand(page), "Travel", "Down opened the list at the chosen option")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Escape")
        const right = await page.evaluate(() => ({
          focus: document.activeElement?.getAttribute("role"),
          lists: document.querySelectorAll("[data-radix-popper-content-wrapper]").length,
          guards: document.querySelectorAll("[data-radix-focus-guard]").length,
        }))
        expect.equal(right.focus, "combobox", "focus is on the input")
        expect.equal(right.lists, 0, "the list is gone at once")
        expect.equal(right.guards, 0, "no focus guards left behind")
        expect.equal(await input.inputValue(), "Travel", "the choice is unchanged")
        await page.keyboard.press("Escape")
        expect.equal(JSON.stringify(await page.evaluate(() => window.__escapes)), "[true,false]", "the first Escape closed the list; the second reached the page")
        await input.fill("")
        await page.keyboard.type("tra")
        await page.keyboard.press("Escape")
        expect.equal(await input.inputValue(), "tra", "Escape keeps what was typed")
      },
    },
    {
      name: "When nothing matches, the list says so, keeps what was typed, and a screen reader hears it once typing settles",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Supplier", exact: true })
        await input.focus()
        await page.keyboard.type("zzq")
        const status = page.locator('[data-radix-popper-content-wrapper] [data-slot="combobox-status"]')
        await status.waitFor()
        expect.equal((await status.textContent()).trim(), "No matches for ‘zzq’. Try fewer letters.", "the list says nothing matched, with what was typed")
        expect.equal(await input.inputValue(), "zzq", "what was typed stays")
        expect.equal(await page.getByRole("listbox", { name: "Supplier" }).getByRole("option").count(), 0, "no options")
        const region = scope.locator('[data-slot="combobox-field"]').first().locator('[aria-live="polite"]')
        await page.waitForFunction((el) => el.textContent.trim() !== "", await region.elementHandle(), { timeout: 3000 })
        expect.equal((await region.textContent()).trim(), "No matches", "the count is spoken")
        await page.keyboard.press("Backspace")
        await page.keyboard.press("Backspace")
        await page.keyboard.press("Backspace")
        await page.keyboard.type("bay")
        await page.waitForFunction((el) => el.textContent.trim() === "1 match", await region.elementHandle(), { timeout: 3000 })
        expect(true, "the new count is spoken once")
      },
    },
    {
      name: "Leaving the field chooses a name typed in full; other text stays, and the choice is cleared",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Category" })
        const hidden = scope.locator('input[type="hidden"][name="category"]')
        expect.equal(await hidden.inputValue(), "Travel", "the form value starts as the default")
        await input.fill("")
        await input.focus()
        await page.keyboard.type("meals")
        await page.keyboard.press("Tab")
        expect.equal(await input.inputValue(), "Meals", "a name typed in full is chosen, in its own case")
        expect.equal(await hidden.inputValue(), "Meals", "and the form value follows")
        await input.focus()
        await page.keyboard.press("Backspace")
        await page.keyboard.press("Tab")
        expect.equal(await input.inputValue(), "Meal", "other text stays as typed")
        expect.equal(await hidden.inputValue(), "", "and the field no longer claims a choice")
        await input.focus()
        await page.keyboard.type("s")
        await page.keyboard.press("Escape")
        await page.keyboard.press("Enter")
        expect.equal(await hidden.inputValue(), "Meals", "Enter on a closed list settles the field before a form would send it")
        await page.keyboard.press("Backspace")
        await page.keyboard.press("Escape")
        await page.keyboard.press("Enter")
        expect.equal(await hidden.inputValue(), "", "and never sends a choice the field no longer shows")
      },
    },
    {
      name: "It and its list are named like the field; a Combobox outside a Field has its name",
      example: "standalone",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("combobox", { name: "Filter by supplier" }).count(), 1, "the standalone Combobox is named")
        const supplier = page.locator('[data-example="basics"]').getByRole("combobox", { name: "Supplier", exact: true })
        expect.equal(await supplier.getAttribute("aria-autocomplete"), "list", "it says it filters a list")
        await supplier.focus()
        await page.keyboard.press("ArrowDown")
        expect.equal(await page.getByRole("listbox", { name: "Supplier" }).count(), 1, "the open list is named like the field")
        expect.equal(await supplier.getAttribute("aria-controls"), await page.getByRole("listbox", { name: "Supplier" }).getAttribute("id"), "the input controls the list")
      },
    },
    {
      name: "The list opens in a portal, so the card around it never clips it",
      example: "clipped",
      async run({ page, scope, expect }) {
        const card = scope.locator("[data-card]")
        await scope.getByRole("combobox", { name: "Supplier", exact: true }).click()
        const list = page.getByRole("listbox", { name: "Supplier" })
        await list.waitFor()
        await settled(page)
        expect.equal(await card.locator('[role="listbox"]').count(), 0, "the list is not inside the card")
        const c = await card.boundingBox()
        const live = page.locator('[data-radix-popper-content-wrapper] [data-slot="combobox-panel"]')
        const panel = await live.boundingBox()
        expect(panel.y + panel.height > c.y + c.height + 1 || panel.y < c.y - 1, "the list reaches past the card's edge")
        const topmost = await live.evaluate((el) => {
          const r = el.getBoundingClientRect()
          return el.contains(document.elementFromPoint(r.left + r.width / 2, r.bottom - 12))
        })
        expect(topmost, "nothing covers the foot of the list")
      },
    },
    {
      name: "The option in hand scrolls into view",
      example: "clipped",
      viewport: { width: 1280, height: 900 },
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Supplier", exact: true })
        await input.focus()
        await page.keyboard.press("ArrowUp")
        await page.getByRole("listbox", { name: "Supplier" }).waitFor()
        expect.equal(await inHand(page), "[Wattle Waste Services]", "Up opened the list at the last option")
        const shown = await page.evaluate(() => {
          const option = document.getElementById(document.activeElement.getAttribute("aria-activedescendant")).getBoundingClientRect()
          const panel = document.querySelector('[data-radix-popper-content-wrapper] [data-slot="combobox-panel"]')
          const view = panel.getBoundingClientRect()
          return { inView: option.top >= view.top - 1 && option.bottom <= view.bottom + 1, scrolls: panel.scrollHeight > panel.clientHeight }
        })
        expect(shown.scrolls, "the list is long enough to scroll")
        expect(shown.inView, "the last option is inside the visible part of the list")
      },
    },
    {
      name: "Choosing with the pointer closes the list at once and leaves focus on the input",
      example: "basics",
      async run({ page, scope, expect }) {
        const input = scope.getByRole("combobox", { name: "Assign to" })
        await input.click()
        await page.getByRole("listbox", { name: "Assign to" }).waitFor()
        await settled(page)
        await page.getByRole("listbox", { name: "Assign to" }).getByRole("option", { name: /Harriet Lee/ }).click()
        expect.equal(await openLists(page), 0, "the list closed")
        expect.equal(await input.inputValue(), "[Harriet Lee]", "the choice stands")
        expect(await input.evaluate((el) => document.activeElement === el), "focus is on the input")
        await page.keyboard.press("ArrowDown")
        expect.equal(await page.getByRole("listbox", { name: "Assign to" }).getByRole("option", { name: /Priya Raman/ }).getAttribute("aria-disabled"), "true", "a disabled option says so")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        expect.equal(await inHand(page), "[Hamish Grant]Owner", "Down skips the disabled option and stops at the end")
      },
    },
    {
      name: "The option in hand has a 1px edge at 3:1, and a 2px ring while keys drive, in both themes",
      example: "basics",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const drawn = await page.locator('[data-example="open"] [role="option"][data-highlighted]').first().evaluate(readStyle)
        expect.equal(drawn.outline, "solid 1px -1px", "a 1px edge drawn inside the option")
        expect.equal(drawn.outlineColour, drawn.lineControl, "in line-control")
        expect.atLeast(Number(contrast(drawn.lineControl, drawn.panel).toFixed(2)), 3, "the edge against the list")
        await scope.getByRole("combobox", { name: "Category" }).focus()
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        const keys = await page.evaluateHandle(() => document.getElementById(document.activeElement.getAttribute("aria-activedescendant"))).then((h) => h.evaluate(readStyle))
        expect.equal(keys.outline, "solid 2px -2px", "a 2px ring drawn inside the option")
        expect.equal(keys.outlineColour, keys.focus, "in the focus colour")
        expect.atLeast(Number(contrast(keys.focus, keys.panel).toFixed(2)), 3, "the ring against the list")
      },
    },
    {
      name: "The field's focus is a 2px edge, and invalid stays danger when focused",
      example: "states",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const region = scope.getByRole("combobox", { name: "Region" })
        await region.focus()
        const first = await region.evaluate((el) => {
          const box = el.closest('[data-slot="combobox"]')
          const s = getComputedStyle(box)
          const probe = document.createElement("span")
          document.body.append(probe)
          probe.style.color = "var(--focus)"
          const focus = getComputedStyle(probe).color
          probe.style.color = "var(--danger)"
          const danger = getComputedStyle(probe).color
          probe.remove()
          return { border: s.borderTopColor, width: parseFloat(s.borderTopWidth), shadow: s.boxShadow, focus, danger }
        })
        expect(twoPx(first, first.focus), `a 2px focus edge (border ${first.border}, ring ${first.shadow})`)
        const cost = scope.getByRole("combobox", { name: "Cost centre" })
        await cost.focus()
        const state = await cost.evaluate((el) => {
          const s = getComputedStyle(el.closest('[data-slot="combobox"]'))
          const probe = document.createElement("span")
          document.body.append(probe)
          probe.style.color = "var(--danger)"
          const danger = getComputedStyle(probe).color
          probe.remove()
          return { border: s.borderTopColor, width: parseFloat(s.borderTopWidth), shadow: s.boxShadow, danger }
        })
        expect(twoPx(state, state.danger), `danger and 2px when focused (border ${state.border}, ring ${state.shadow})`)
        expect.equal(await scope.getByRole("combobox", { name: "Account" }).isDisabled(), true, "disabled")
      },
    },
    {
      name: "Touch: 40, 44 and 48px fields with 16px text, and 44px options",
      example: "states",
      touch: true,
      async run({ page, scope, expect }) {
        const sizes = []
        for (const name of ["Region", "Cost centre", "Supplier"]) {
          const input = scope.getByRole("combobox", { name, exact: true })
          const box = await input.evaluate((el) => el.closest('[data-slot="combobox"]').getBoundingClientRect().height)
          sizes.push(`${Math.round(box)}/${await input.evaluate((el) => getComputedStyle(el).fontSize)}`)
        }
        expect.equal(sizes.join(","), "40/16px,44/16px,48/16px", "touch fields")
        await scope.getByRole("combobox", { name: "Cost centre" }).focus()
        await page.keyboard.press("ArrowDown")
        await page.getByRole("listbox", { name: "Cost centre" }).waitFor()
        await settled(page)
        for (const option of (await page.getByRole("listbox", { name: "Cost centre" }).getByRole("option").all()).slice(0, 4)) expect.atLeast(Math.round((await option.boundingBox()).height), 44, "option height on touch")
        const toggle = await scope.getByRole("combobox", { name: "Cost centre" }).evaluate((el) => el.closest('[data-slot="combobox"]').querySelector('[data-slot="combobox-toggle"]').getBoundingClientRect())
        expect.atLeast(Math.round(toggle.width), 40, "the chevron is a 40px target on touch")
      },
    },
    {
      name: "Drawn open for a design, it is a still picture: no focus guards, no extra tab stops, Escape left alone",
      example: "open",
      async run({ page, scope, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards on the page")
        expect.equal(await page.evaluate(() => document.activeElement === document.body), true, "nothing took focus")
        const lists = scope.getByRole("listbox")
        expect.equal(await lists.count(), 3, "three lists drawn in place")
        const approver = scope.getByRole("listbox", { name: "Approver" })
        expect.equal((await approver.getByRole("option").allTextContents()).join("|"), "[Amira Haddad]Kitchen lead|[Harriet Lee]Finance|[Hamish Grant]Owner", "filtered to what was typed, in their order")
        expect.equal((await approver.locator('[data-slot="combobox-match"]').allTextContents()).join("|"), "Ha|Ha|Ha", "the typed part is marked in each")
        expect.equal((await approver.getByRole("option", { selected: true }).textContent()).trim(), "[Harriet Lee]Finance", "the chosen option is marked, and in hand")
        expect.equal((await scope.locator('[data-slot="combobox-status"]').allTextContents()).map((t) => t.trim()).join("|"), "No matches for ‘parking’. Try fewer letters.|Searching…", "nothing matched, and searching")
        await page.evaluate(() => {
          window.__escapes = []
          window.addEventListener("keydown", (e) => e.key === "Escape" && window.__escapes.push(e.defaultPrevented))
        })
        await scope.getByRole("combobox", { name: "Customer" }).focus()
        await page.keyboard.press("Escape")
        expect.equal(JSON.stringify(await page.evaluate(() => window.__escapes)), "[false]", "Escape reaches the page")
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => (document.activeElement === document.body ? "body" : document.activeElement.tagName)), "body", "the drawn lists add no tab stops")
        expect.equal(await scope.getByRole("option").evaluateAll((els) => els.filter((el) => el.tabIndex >= 0).length), 0, "the options take no focus")
      },
    },
    {
      name: "Forced colours keep the field's focus and the option in hand visible",
      example: "basics",
      forcedColors: true,
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const focused = await page.evaluate(() => `${document.activeElement.getAttribute("role")} ${getComputedStyle(document.activeElement).outlineStyle} ${parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2}`)
        expect.equal(focused, "combobox solid true", "the focused input is outlined")
        await scope.getByRole("combobox", { name: "Category" }).focus()
        await page.keyboard.press("ArrowDown")
        const option = await page.evaluate(() => {
          const el = document.getElementById(document.activeElement.getAttribute("aria-activedescendant"))
          const s = getComputedStyle(el)
          return `${s.outlineStyle} ${parseFloat(s.outlineWidth) >= 2}`
        })
        expect.equal(option, "solid true", "the option in hand is outlined in forced colours")
        const rest = await page.locator('[data-example="open"] [role="option"]:not([data-highlighted])').first().evaluate((el) => getComputedStyle(el).outlineStyle)
        expect.equal(rest, "none", "an option at rest draws no outline")
      },
    },
  ],
}
