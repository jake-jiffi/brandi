// CommandMenu's one definition: its README, its preview board and its scripted checks all come from here.

// An overlay is ready for keys once it has finished opening. Radix registers a layer's Escape and focus
// handling in effects that run a beat after it shows, and on a busy machine a key sent in between
// reaches the layer beneath, so a check waits for the opening animation and two frames first.
const ready = async (locator) => {
  await locator.waitFor()
  await locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
  await locator.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}

const groups = [
  {
    label: "Jump to",
    items: [
      { label: "Home", icon: "House", meta: "Page" },
      { label: "Invoices", icon: "Receipt", meta: "Page" },
      { label: "Payments", icon: "Wallet", meta: "Page" },
      { label: "Clients", icon: "Users", meta: "Page" },
      { label: "Reports", icon: "ChartColumn", meta: "Page" },
      { label: "[Invoice 1042]", icon: "FileText", description: "[Northside Dental]", meta: "Invoice", keywords: ["northside dental"] },
      { label: "[Northside Dental]", icon: "Store", meta: "Client" },
    ],
  },
  {
    label: "Actions",
    items: [
      { label: "New invoice", icon: "Plus", shortcut: "N", keywords: ["create", "bill"] },
      { label: "Record a payment", icon: "CreditCard" },
      { label: "Export invoices", icon: "Download" },
      { label: "Invite a teammate", icon: "UserPlus" },
      { label: "Turn on the dark theme", icon: "Moon" },
    ],
  },
]
const ALL = groups.reduce((n, g) => n + g.items.length, 0)

const settled = (locator) => locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
const luminance = (rgb) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).map(Number)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

async function open(page, scope) {
  await scope.getByRole("button", { name: "Search", exact: true }).click()
  const dialog = page.getByRole("dialog", { name: "Search" })
  await ready(dialog)
  return { dialog, input: dialog.getByRole("combobox", { name: "Search" }) }
}
const optionTexts = (dialog) => dialog.getByRole("option").evaluateAll((els) => els.map((el) => el.querySelector("[data-slot=command-item-label]")?.textContent ?? ""))

export default {
  name: "CommandMenu",
  group: "Overlays",
  job: "The palette: jump to any record, run an action or ask the assistant, from anywhere, on Cmd or Ctrl K.",
  status: "proven",
  types: [
    "type CommandAction = { label: string; icon?: IconName; description?: string; keywords?: string[]; shortcut?: string; meta?: string; onSelect?: () => void }",
  ],
  props: [
    { name: "groups", type: "Array<{ label: string; items: CommandAction[] }>", doc: "Each item is { label, icon, description, keywords, shortcut, meta, onSelect }. Groups in this order: Jump to, Actions." },
    { name: "placeholder", type: "string", default: "\"Search or ask\"", doc: "\"Search\" when there is no onAsk, so the field promises nothing it cannot do." },
    { name: "query", type: "string", doc: "The words each opening starts with, for a design on a canvas. Without it, every opening starts empty." },
    { name: "onSelect", type: "(item: CommandAction) => void", doc: "Called with the result that ran, after its own onSelect. The shell navigates here and closes the phone drawer." },
    { name: "onClose", type: "() => void", doc: "Escape, the scrim and running a result call it." },
    { name: "emptyText", type: "string", doc: "The line shown when nothing matches and there is no onAsk." },
    { name: "onAsk", type: "(query: string) => void", doc: "Wires the assistant: an Ask result comes last, and Enter asks when nothing else matches." },
    { name: "modal", type: "boolean", default: "false", doc: "Opens it near the top of the page as a dialog that holds focus. Without it, it sits in place." },
    { name: "open", type: "boolean", default: "false", doc: "Shows the modal palette. The shell owns the state, and binds Cmd or Ctrl K. For a design on a canvas, leave modal off and the palette draws in place." },
    { name: "label", type: "string", default: "\"Search\"", doc: "Names the search field and the dialog." },
    { name: "returnFocus", type: "RefObject<HTMLElement>", doc: "Where focus goes on close when nothing had focus as it opened, as when a shortcut opened it." },
  ],
  notes: {
    Behaviour: [
      "Typing filters every group with a plain \"contains\" on labels and keywords, so results keep the order people learnt.",
      "The first result is in hand from the first keystroke, and the field's aria-activedescendant follows it, so screen readers follow the result in hand. Up, Down, Home and End move it, and it scrolls into view. Enter runs it.",
      "A polite live region gives the count after each keystroke, and says nothing for the state an opening starts in.",
      "Every opening starts empty. Running a result closes the palette. Escape closes it at once, and focus is back on whatever had it the moment it closes, or on returnFocus when a shortcut opened it.",
      "For a design on a canvas, leave modal off: the palette then draws in place, with no live layer to take the board's Escape key or add a tab stop.",
    ],
    Layout: ["It opens near the top on every screen, because a phone keyboard takes the bottom half. On a touch screen the key hints hide and a close button shows."],
    States: ["The result in hand takes the hover tint and a control edge. With no matches and no onAsk, one line says so and promises nothing."],
    Copy: ["The Ask result says what it will ask: Ask about “pay run”."],
    Rules: [
      "Groups in this order: Jump to, Actions, then Ask, which the palette adds last when onAsk is passed.",
      "Offer to ask the assistant only when onAsk is passed. Records are found by name, and by any keywords given.",
    ],
    Review: ["It did not filter (round 1).", "The active result did not scroll into view (round 2).", "The starter's palette could not find records (round 5)."],
  },
  frame: { width: 960, height: 1260 },
  examples: [
    {
      id: "start",
      title: "As it opens: everything, in the order given",
      markup: `<x-import component-from-global-scope="NS.CommandMenu" groups="{{groups}}" on-select="{{run}}" on-ask="{{ask}}"></x-import>`,
      vals: { groups },
    },
    {
      id: "typed",
      title: "After a few letters, with the assistant last",
      markup: `<x-import component-from-global-scope="NS.CommandMenu" query="pay" groups="{{groups}}" on-select="{{run}}" on-ask="{{ask}}"></x-import>`,
    },
    {
      id: "empty",
      title: "Nothing matches, and there is no assistant",
      markup: `<x-import component-from-global-scope="NS.CommandMenu" query="zebra" groups="{{groups}}"></x-import>`,
    },
    {
      id: "live",
      title: "As the shell's search",
      markup: `<x-import component-from-global-scope="NS.Button" id="command-search-button" icon="Search" on-click="{{openMenu}}">Search</x-import>
<x-import component-from-global-scope="NS.Button" variant="ghost" icon="Keyboard" on-click="{{openByKey}}">Open with Cmd K</x-import>
<p style="margin: 0; color: var(--text-muted);" data-command-output="">Last run: {{ran}}</p>
<x-import component-from-global-scope="NS.CommandMenu" modal="{{yes}}" open="{{menuOpen}}" on-close="{{closeMenu}}" on-select="{{run}}" on-ask="{{ask}}" return-focus="{{searchButton}}" groups="{{groups}}"></x-import>
<x-import component-from-global-scope="NS.Dialog" open="{{newInvoice}}" on-close="{{closeNewInvoice}}" width="{{w400}}" title="New invoice" description="Choose the client first. You can add line items after." footer="{{ui.newFooter}}"></x-import>`,
      vals: { yes: true, w400: 400 },
    },
  ],
  state: { menu: false, ran: "nothing yet", newInvoice: false },
  logic: `menuOpen: self.state.menu,
  ran: self.state.ran,
  openMenu: () => self.setState({ menu: true }),
  openByKey: () => { if (document.activeElement) document.activeElement.blur(); self.setState({ menu: true }); },
  closeMenu: () => self.setState({ menu: false }),
  run: (item) => self.setState({ ran: item.label, newInvoice: item.label === "New invoice" }),
  newInvoice: self.state.newInvoice,
  closeNewInvoice: () => self.setState({ newInvoice: false }),
  ui: (() => {
    // NS. names the bundle's own global: walking window's properties reads the canvas's parent frame, which throws.
    const A = { Button: NS.Button };
    const h = React.createElement;
    return { newFooter: h(React.Fragment, null, h(A.Button, { onClick: () => self.setState({ newInvoice: false }) }, "Cancel"), h(A.Button, { variant: "primary" }, "Choose client")) };
  })(),
  ask: (query) => self.setState({ ran: "Asked about " + query }),
  searchButton: { get current() { return document.getElementById("command-search-button"); } }`,
  checks: [
    {
      name: "The first result is chosen from the first keystroke, and aria-activedescendant follows it",
      example: "live",
      async run({ page, scope, expect }) {
        const { dialog, input } = await open(page, scope)
        expect(await input.evaluate((el) => el === document.activeElement), "focus is in the field")
        const inHand = () => input.evaluate((el) => {
          const id = el.getAttribute("aria-activedescendant")
          const option = id && document.getElementById(id)
          return option ? `${option.getAttribute("aria-selected")} ${option.querySelector("[data-slot=command-item-label]")?.textContent}` : "none"
        })
        await page.keyboard.type("i")
        expect.equal(await inHand(), "true Invoices", "after the first keystroke")
        await page.keyboard.press("ArrowDown")
        expect.equal(await inHand(), "true Clients", "Down moves the result in hand")
        await page.keyboard.type("n")
        expect.equal(await inHand(), "true Invoices", "the next keystroke puts the first result back in hand")
        expect.equal(await dialog.getByRole("option", { selected: true }).count(), 1, "one result in hand")
      },
    },
    {
      name: "Enter runs the result in hand, closes the palette and returns focus to the opener",
      example: "live",
      async run({ page, scope, expect }) {
        const { dialog } = await open(page, scope)
        await page.keyboard.type("export")
        await page.keyboard.press("Enter")
        await dialog.waitFor({ state: "hidden" })
        expect.equal(await scope.locator("[data-command-output]").textContent(), "Last run: Export invoices", "Enter ran Export invoices")
        await page.waitForFunction(() => document.activeElement?.id === "command-search-button", null, { timeout: 5000 }).catch(() => {})
        expect(await page.evaluate(() => document.activeElement?.id === "command-search-button"), "focus is back on Search")
      },
    },
    {
      name: "Matching is a plain contains on labels and keywords, in the order given (round 1)",
      example: "live",
      async run({ page, scope, expect }) {
        const { dialog, input } = await open(page, scope)
        await page.keyboard.type("voice")
        expect.equal((await optionTexts(dialog)).join(", "), "Invoices, [Invoice 1042], New invoice, Export invoices, Ask about “voice”", "the results for voice")
        await input.fill("")
        await page.keyboard.type("bill")
        expect.equal((await optionTexts(dialog)).join(", "), "New invoice, Ask about “bill”", "a keyword finds New invoice")
      },
    },
    {
      name: "Records are found by name and by their keywords (round 5)",
      example: "live",
      async run({ page, scope, expect }) {
        const { dialog } = await open(page, scope)
        await page.keyboard.type("northside")
        expect.equal((await optionTexts(dialog)).join(", "), "[Invoice 1042], [Northside Dental], Ask about “northside”", "the results for northside")
      },
    },
    {
      name: "A polite live region gives the count after each keystroke",
      example: "live",
      async run({ page, scope, expect }) {
        const { dialog, input } = await open(page, scope)
        const region = dialog.locator("[aria-live=polite]")
        expect.equal(await region.textContent(), "", "nothing is said as it opens")
        await page.keyboard.type("voice")
        expect.equal(await region.textContent(), "4 results", "the count")
        await input.fill("")
        await page.keyboard.type("zebra")
        expect.equal(await region.textContent(), "No matches. Enter asks about “zebra”.", "no matches, with the assistant")
      },
    },
    {
      name: "Escape closes it at once, and focus is on the opener the moment it closes",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Search", exact: true }).focus()
        await page.keyboard.press("Enter")
        await ready(page.getByRole("dialog", { name: "Search" }))
        await page.keyboard.press("Escape")
        expect.equal(await page.locator("[data-slot=dialog-overlay]").count(), 0, "the palette and its scrim are gone straight away")
        expect.equal(await page.evaluate(() => document.activeElement?.id), "command-search-button", "focus is already on Search")
      },
    },
    {
      name: "Palettes drawn in place for a design take no Escape and add no tab stop",
      example: "start",
      async run({ page, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards on the page")
        await page.evaluate(() => {
          window.__escape = "not pressed"
          document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.__escape = e.defaultPrevented ? "swallowed" : "free" })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escape), "free", "Escape reaches the page")
      },
    },
    {
      name: "Every opening starts empty",
      example: "live",
      async run({ page, scope, expect }) {
        let { dialog, input } = await open(page, scope)
        await page.keyboard.type("export")
        await page.keyboard.press("Escape")
        await dialog.waitFor({ state: "hidden" })
        ;({ dialog, input } = await open(page, scope))
        expect.equal(await input.inputValue(), "", "the field is empty")
        expect.equal(await dialog.getByRole("option").count(), ALL, "every result shows")
      },
    },
    {
      name: "Up, Down, Home and End move the result in hand, and it scrolls into view (round 2)",
      example: "live",
      async run({ page, scope, expect }) {
        const { dialog, input } = await open(page, scope)
        const list = dialog.getByRole("listbox")
        expect(await list.evaluate((el) => el.scrollHeight > el.clientHeight), "the list scrolls")
        await page.keyboard.press("End")
        const last = dialog.getByRole("option").last()
        expect.equal(await last.getAttribute("aria-selected"), "true", "End puts the last result in hand")
        expect.equal(await input.getAttribute("aria-activedescendant"), await last.getAttribute("id"), "aria-activedescendant follows it")
        const [l, o] = await Promise.all([list.boundingBox(), last.boundingBox()])
        expect(o.y >= l.y - 1 && o.y + o.height <= l.y + l.height + 1, "the last result is in view")
        await page.keyboard.press("Home")
        const first = dialog.getByRole("option").first()
        expect.equal(await first.getAttribute("aria-selected"), "true", "Home puts the first result in hand")
        const f = await first.boundingBox()
        expect(f.y >= l.y - 1, "the first result is back in view")
        await page.keyboard.press("ArrowUp")
        expect.equal(await first.getAttribute("aria-selected"), "true", "Up at the top stays on the first result")
      },
    },
    {
      name: "With no matches, Enter asks the assistant, and without onAsk the empty line promises nothing",
      example: "live",
      async run({ page, scope, expect }) {
        const { dialog } = await open(page, scope)
        await page.keyboard.type("zebra")
        expect.equal((await optionTexts(dialog)).join(", "), "Ask about “zebra”", "only the Ask result")
        await page.keyboard.press("Enter")
        await dialog.waitFor({ state: "hidden" })
        expect.equal(await scope.locator("[data-command-output]").textContent(), "Last run: Asked about zebra", "Enter asked about zebra")
        const empty = page.locator("[data-example=empty]")
        expect.equal(await empty.getByRole("option").count(), 0, "no results without onAsk")
        expect.equal(await empty.locator("[data-slot=command-empty]").textContent(), "No matches for “zebra”", "the empty line")
      },
    },
    {
      name: "Opened by a shortcut, focus goes to the return target when it closes",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Open with Cmd K" }).click()
        const dialog = page.getByRole("dialog", { name: "Search" })
        await ready(dialog)
        await page.keyboard.press("Escape")
        await dialog.waitFor({ state: "hidden" })
        await page.waitForFunction(() => document.activeElement?.id === "command-search-button", null, { timeout: 5000 }).catch(() => {})
        expect(await page.evaluate(() => document.activeElement?.id === "command-search-button"), "focus went to Search, never the page body")
      },
    },
    {
      name: "A command that opens a dialog hands focus back to Search when that dialog closes",
      example: "live",
      async run({ page, scope, expect }) {
        await open(page, scope)
        await page.keyboard.type("new")
        await page.keyboard.press("Enter")
        const created = page.getByRole("dialog", { name: "New invoice" })
        await ready(created)
        expect(await created.evaluate((d) => d.contains(document.activeElement)), "focus moved into the new dialog")
        await page.keyboard.press("Escape")
        expect.equal(await created.count(), 0, "the dialog is gone straight away")
        expect.equal(await page.evaluate(() => document.activeElement?.id), "command-search-button", "focus is on Search, which opened the palette, never the page body")
      },
    },
    {
      name: "On a phone it opens near the top, the key hints hide and a close button shows",
      example: "live",
      touch: true,
      viewport: { width: 390, height: 844 },
      async run({ page, scope, expect }) {
        const { dialog } = await open(page, scope)
        await settled(dialog)
        const box = await dialog.boundingBox()
        expect(box.y < 844 * 0.1, `it opens near the top (at ${box.y}px)`)
        expect.equal(await dialog.locator("[data-slot=command-hints]").isVisible(), false, "the key hints hide")
        const close = dialog.getByRole("button", { name: "Close" })
        expect.atLeast((await close.boundingBox()).height, 40, "the close button's height")
        expect.atLeast((await dialog.getByRole("option").first().boundingBox()).height, 44, "a result's height on touch")
        await close.click()
        await dialog.waitFor({ state: "hidden" })
      },
    },
    {
      name: "Results are 36px tall, with the hints shown, on a desktop",
      example: "start",
      async run({ scope, expect }) {
        expect.equal(Math.round((await scope.getByRole("option").first().boundingBox()).height), 36, "a result's height")
        expect(await scope.locator("[data-slot=command-hints]").isVisible(), "the key hints show")
      },
    },
    {
      name: "In forced colours the result in hand stays outlined",
      example: "start",
      forcedColors: true,
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("option", { selected: true }).evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "the result in hand's outline")
        expect.equal(await scope.getByRole("option").nth(1).evaluate((el) => getComputedStyle(el).outlineStyle), "none", "the others have none")
      },
    },
    {
      name: "The open palette takes the theme of the page it opened from",
      example: "live",
      themes: ["light", "dark"],
      async run({ page, scope, expect, theme }) {
        const { dialog } = await open(page, scope)
        const l = luminance(await dialog.evaluate((el) => getComputedStyle(el).backgroundColor))
        expect(theme === "dark" ? l < 0.25 : l > 0.85, `the palette's surface is ${theme} (luminance ${l.toFixed(2)})`)
      },
    },
  ],
}
