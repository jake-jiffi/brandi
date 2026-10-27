// SearchField's one definition: its README, its preview board and its scripted checks all come from here.

// Runs in the page: the wrapper's edge and the system's focus colour.
function readEdge(el) {
  const s = getComputedStyle(el.closest('[data-slot="search-field"]'))
  const probe = document.createElement("span")
  document.body.append(probe)
  probe.style.color = "var(--focus)"
  const focus = getComputedStyle(probe).color
  probe.remove()
  return { border: s.borderTopColor, width: parseFloat(s.borderTopWidth), shadow: s.boxShadow, focus }
}

export default {
  name: "SearchField",
  group: "Inputs",
  job: "Filters what is on screen as the person types.",
  status: "proven",
  props: [
    { name: "placeholder", type: "string", doc: "Says what is searched (Search clients). It is the accessible name unless aria-label is set." },
    { name: "shortcut", type: "string", doc: "A single key, such as /, that focuses the field. Shown in the field until it has focus or a value." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen, with 16px text there." },
    { name: "aria-label", type: "string", doc: "A name other than the placeholder. A canvas board writes aria-label, which arrives as ariaLabel; both work." },
    { name: "value, defaultValue, onChange", type: "native", doc: "Every native input prop passes through; the ref is the input." },
  ],
  notes: {
    Behaviour: [
      "A search field (role searchbox), named by its placeholder. Escape clears it, as the browser does.",
      "The shortcut never fires while someone types in another field, or when Root turns shortcuts off. It is announced as the field's keyboard shortcut.",
      "Inside a Field, the Field's label names it instead of the placeholder.",
    ],
    States: ["The input's edge: a 2px focus edge in place of the outline. The key hint hides on focus, once there is a value, and on touch screens."],
    Rules: ["Searching everything (records, people, actions, the assistant) is the AskBar's job or the CommandMenu's, not this field's."],
    Review: ["Shortcuts were advertised and not wired (round 2)."],
  },
  examples: [
    {
      id: "shortcut",
      title: "With a shortcut, beside a field people type in",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: end; width: 100%;">
<x-import component-from-global-scope="NS.SearchField" placeholder="Search clients" shortcut="/"></x-import>
<x-import component-from-global-scope="NS.Field" label="Note to self">
<x-import component-from-global-scope="NS.TextInput" placeholder="[Call back after 2 pm]"></x-import>
</x-import>
</div>`,
    },
    {
      id: "sizes",
      title: "Sizes",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-items: center; width: 100%;">
<x-import component-from-global-scope="NS.SearchField" size="sm" placeholder="Search invoices"></x-import>
<x-import component-from-global-scope="NS.SearchField" placeholder="Search people"></x-import>
<x-import component-from-global-scope="NS.SearchField" size="lg" placeholder="Search the help centre"></x-import>
</div>`,
    },
  ],
  frame: { width: 960, height: 244 },
  checks: [
    {
      name: "The placeholder is its accessible name, and the shortcut is advertised",
      example: "shortcut",
      async run({ scope, expect }) {
        const search = scope.getByRole("searchbox", { name: "Search clients" })
        expect.equal(await search.count(), 1, "named by its placeholder")
        expect.equal(await search.getAttribute("aria-keyshortcuts"), "/", "the shortcut is announced")
        expect(await scope.locator('[data-slot="kbd"]').isVisible(), "the key is shown in the field")
      },
    },
    {
      name: "With single keys turned off, the key is neither shown nor announced",
      example: "shortcut",
      async run({ page, scope, expect }) {
        await page.evaluate(() => { document.documentElement.dataset.shortcuts = "off" })
        const search = scope.getByRole("searchbox", { name: "Search clients" })
        await page.waitForFunction(() => !document.querySelector('[data-example="shortcut"] [data-slot="kbd"]'), null, { timeout: 2000 }).catch(() => {})
        expect.equal(await search.getAttribute("aria-keyshortcuts"), null, "no shortcut announced")
        expect.equal(await scope.locator('[data-slot="kbd"]').count(), 0, "no key shown")
        await page.evaluate(() => { document.documentElement.dataset.shortcuts = "on" })
        await scope.locator('[data-slot="kbd"]').waitFor({ timeout: 2000 })
        expect.equal(await search.getAttribute("aria-keyshortcuts"), "/", "and back when they are on")
      },
    },
    {
      name: "/ focuses it from the page, without typing a slash",
      example: "shortcut",
      async run({ page, scope, expect }) {
        await page.locator("body").click({ position: { x: 1200, y: 40 } })
        await page.keyboard.press("/")
        const search = scope.getByRole("searchbox", { name: "Search clients" })
        expect(await search.evaluate((el) => document.activeElement === el), "the shortcut focused the field")
        expect.equal(await search.inputValue(), "", "no slash was typed")
        expect(!(await scope.locator('[data-slot="kbd"]').isVisible()), "the key hint hides on focus")
      },
    },
    {
      name: "/ never fires while someone types in another field",
      example: "shortcut",
      async run({ page, scope, expect }) {
        const note = scope.getByRole("textbox", { name: "Note to self" })
        await note.click()
        await page.keyboard.type("a/b")
        expect.equal(await note.inputValue(), "a/b", "the slash was typed into the field in use")
        expect(await note.evaluate((el) => document.activeElement === el), "focus stayed where the person was typing")
      },
    },
    {
      name: "/ does nothing when Root turns single-key shortcuts off",
      example: "shortcut",
      async run({ page, scope, expect }) {
        await page.evaluate(() => (document.documentElement.dataset.shortcuts = "off"))
        await page.locator("body").click({ position: { x: 1200, y: 40 } })
        await page.keyboard.press("/")
        const search = scope.getByRole("searchbox", { name: "Search clients" })
        expect(!(await search.evaluate((el) => document.activeElement === el)), "the shortcut stayed off")
      },
    },
    {
      name: "Focus is a 2px edge in the focus colour, in both themes",
      example: "sizes",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const search = scope.getByRole("searchbox", { name: "Search people" })
        await search.focus()
        const e = await search.evaluate(readEdge)
        expect(e.border === e.focus && e.width === 1 && e.shadow.includes(e.focus) && /0px 0px 0px 1px/.test(e.shadow), `a 2px focus edge (border ${e.border}, ring ${e.shadow})`)
      },
    },
    {
      name: "Touch: 40, 44 and 48px tall with 16px text, and the key hint hides",
      example: "sizes",
      touch: true,
      async run({ page, scope, expect }) {
        const sizes = await scope.getByRole("searchbox").evaluateAll((els) => els.map((el) => `${Math.round(el.closest('[data-slot="search-field"]').getBoundingClientRect().height)}/${getComputedStyle(el).fontSize}`))
        expect.equal(sizes.join(","), "40/16px,44/16px,48/16px", "touch heights and text")
        expect(!(await page.locator('[data-example="shortcut"] [data-slot="kbd"]').isVisible()), "no key hint on a touch screen")
      },
    },
  ],
}
