// FilterChip's one definition: its README, its preview board and its scripted checks all come from here.

/** A role's colour as the browser computes it in the current theme. */
const colourOf = (page, role) =>
  page.evaluate((r) => {
    const probe = document.createElement("span")
    probe.style.color = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, role)

/** What Chrome hands a screen reader for one element: its role, name and description. */
async function heard(page, locator) {
  const mark = `probe-${Math.random().toString(36).slice(2)}`
  await locator.evaluate((el, m) => el.setAttribute("data-probe", m), mark)
  const cdp = await page.context().newCDPSession(page)
  try {
    const { root } = await cdp.send("DOM.getDocument", { depth: -1 })
    const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-probe="${mark}"]` })
    const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false })
    return { role: nodes[0].role?.value, name: nodes[0].name?.value ?? "", description: nodes[0].description?.value ?? "" }
  } finally {
    await cdp.detach()
  }
}

const chip = (scope, label) => scope.locator('[data-slot="filter-chip"]', { hasText: label })

export default {
  name: "FilterChip",
  group: "Actions",
  job: "A filter over what is already on screen, pressed on and off.",
  status: "proven",
  props: [
    { name: "selected", type: "boolean", doc: "Whether the filter is on, when the parent holds it. Filters live in the URL." },
    { name: "defaultSelected", type: "boolean", default: "false", doc: "Whether the filter starts on, when the chip holds it." },
    { name: "onChange", type: "(selected: boolean) => void", doc: "Called with the new state on every press." },
    { name: "count", type: "number", doc: "How many items match if the chip is applied. Missing means unknown, and shows nothing." },
    { name: "attention", type: "boolean", default: "false", doc: "The count is waiting on the reader: it takes the highlight and is read as 12 need you." },
    { name: "noun", type: "[string, string]", doc: 'What the count counts, one and many: ["job", "jobs"] reads Needs you, 2 jobs.' },
    { name: "icon", type: "IconName", doc: "An icon before the label. The check takes its place while the chip is on." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and unpressable. Say why nearby." },
    { name: "children", type: "ReactNode", doc: "The label: what the filter keeps, in a word or two." },
  ],
  notes: {
    Behaviour: [
      "A toggle button: screen readers hear its label, its count and whether it is pressed. Enter and Space toggle it.",
      "A count is read in words, once: 4 items, or with attention 12 need you (1 needs you), or with a noun 2 jobs. A label that already says needs you is never followed by need you again.",
    ],
    States: [
      "Pressed takes selected-strong, a selected-line edge and a check. An attention count takes the highlight.",
      "A count of zero shows 0 and never takes the highlight. A missing count shows nothing, never 0.",
      "In forced colours a pressed chip is outlined in Highlight, doubled when it also has focus.",
    ],
    Rules: [
      "One row, above the list or table it filters, in the Toolbar.",
      "The count is how many items match if the chip is applied. Only needs-you counts get attention.",
      "32px tall, 40px on touch, 8px apart.",
    ],
    Review: [
      "The starter's controls lost their state in forced colours (round 2, section 2.9): a pressed chip is checked there, and one at rest draws no outline.",
      'A "Needs you" chip was read "Needs you, 2 need you" (a second brand\'s round 2): a noun says the count once, and a label that says needs you is never followed by it again.',
    ],
    Accepted: ["Chips are 40px on touch rather than 44px (section 2.5). At 44px they crowd a phone toolbar for no gain in accuracy."],
  },
  examples: [
    {
      id: "chips",
      title: "Off, on, and counts that need you",
      markup: `<x-import component-from-global-scope="NS.FilterChip" count="{{n12}}" attention="{{yes}}">Needs approval</x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n4}}" default-selected="{{yes}}">Draft</x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n1284}}">Paid</x-import>
<x-import component-from-global-scope="NS.FilterChip" icon="User" count="{{n1}}" attention="{{yes}}">Assigned to me</x-import>`,
      vals: { n12: 12, n4: 4, n1284: 1284, n1: 1, yes: true },
    },
    {
      id: "nouns",
      title: "Saying what it counts, once",
      markup: `<x-import component-from-global-scope="NS.FilterChip" count="{{n2}}" attention="{{yes}}" noun="{{jobs}}">Needs you</x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n1}}" noun="{{jobs}}">Overdue</x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n3}}" attention="{{yes}}">Needs you</x-import>`,
      vals: { n2: 2, n1: 1, n3: 3, yes: true, jobs: ["job", "jobs"] },
    },
    {
      id: "states",
      title: "No count, and disabled",
      markup: `<x-import component-from-global-scope="NS.FilterChip">Overdue</x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n0}}" disabled="{{yes}}">Archived</x-import>
<span class="type-meta text-text-muted">Archived opens after [the year-end close]</span>`,
      vals: { n0: 0 },
    },
    {
      id: "controlled",
      title: "Held by the page",
      markup: `<div data-on="{{mine}}" style="display: contents;"><x-import component-from-global-scope="NS.FilterChip" icon="Flag" count="{{n7}}" selected="{{mine}}" on-change="{{setMine}}">Flagged</x-import></div>`,
      vals: { n7: 7 },
    },
  ],
  frame: { width: 960, height: 360 },
  state: { mine: false },
  logic: "mine: self.state.mine, setMine: (v) => self.setState({ mine: v })",
  checks: [
    {
      name: "A toggle button that says whether it is on",
      example: "chips",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("button", { name: "Draft, 4 items", pressed: true }).count(), 1, "Draft is pressed")
        expect.equal(await scope.getByRole("button", { name: "Paid, 1,284 items", pressed: false }).count(), 1, "Paid is not")
      },
    },
    {
      name: "Enter and Space toggle it, and a check marks it on",
      example: "chips",
      async run({ page, scope, expect }) {
        const paid = chip(scope, "Paid")
        await paid.focus()
        await page.keyboard.press("Space")
        expect.equal(await paid.getAttribute("aria-pressed"), "true", "Space turned it on")
        expect.equal(await paid.locator('svg[data-icon="Check"]').count(), 1, "a check while on")
        await page.keyboard.press("Enter")
        expect.equal(await paid.getAttribute("aria-pressed"), "false", "Enter turned it off")
        expect.equal(await paid.locator('svg[data-icon="Check"]').count(), 0, "no check while off")
        expect(await paid.evaluate((el) => document.activeElement === el), "focus stays on the chip")
      },
    },
    {
      name: "Counts are read in words, and an attention count as need you",
      example: "chips",
      async run({ page, scope, expect }) {
        const names = []
        for (const c of await scope.locator('[data-slot="filter-chip"]').all()) names.push((await heard(page, c)).name)
        expect.equal(names.join(" | "), "Needs approval, 12 need you | Draft, 4 items | Paid, 1,284 items | Assigned to me, 1 needs you", "what a screen reader hears")
      },
    },
    {
      name: "A noun says the count once, and a label that says needs you is not followed by it again",
      example: "nouns",
      async run({ page, scope, expect }) {
        const names = []
        for (const c of await scope.locator('[data-slot="filter-chip"]').all()) names.push((await heard(page, c)).name)
        expect.equal(names.join(" | "), "Needs you, 2 jobs | Overdue, 1 job | Needs you, 3 items", "what a screen reader hears")
      },
    },
    {
      name: "Pressed takes selected-strong, and an attention count the highlight, in both themes",
      example: "chips",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        expect.equal(await chip(scope, "Draft").evaluate((el) => getComputedStyle(el).backgroundColor), await colourOf(page, "selected-strong"), "pressed fill")
        expect.equal(await chip(scope, "Draft").evaluate((el) => getComputedStyle(el).borderColor), await colourOf(page, "selected-line"), "pressed edge")
        const count = chip(scope, "Needs approval").locator('[data-slot="filter-chip-count"]')
        expect.equal(await count.evaluate((el) => getComputedStyle(el).backgroundColor), await colourOf(page, "highlight"), "attention fill")
        expect.equal(await count.evaluate((el) => getComputedStyle(el).color), await colourOf(page, "on-highlight"), "attention text")
      },
    },
    {
      name: "A missing count shows nothing, never zero",
      example: "states",
      async run({ scope, expect }) {
        expect.equal(await chip(scope, "Overdue").locator('[data-slot="filter-chip-count"]').count(), 0, "no count drawn")
        expect.equal(await scope.getByRole("button", { name: "Overdue", exact: true }).count(), 1, "named by its label alone")
      },
    },
    {
      name: "A disabled chip cannot be pressed, by pointer or key",
      example: "states",
      async run({ page, scope, expect }) {
        const archived = chip(scope, "Archived")
        expect(await archived.isDisabled(), "disabled")
        await archived.click({ force: true })
        await archived.press("Space").catch(() => {})
        expect.equal(await archived.getAttribute("aria-pressed"), "false", "still off")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-slot")), null, "a disabled chip takes no focus")
      },
    },
    {
      name: "Chips are 32px tall",
      example: "chips",
      async run({ scope, expect }) {
        for (const c of await scope.locator('[data-slot="filter-chip"]').all()) expect.equal(Math.round((await c.boundingBox()).height), 32, "chip height")
      },
    },
    {
      name: "Chips are 40px tall on touch",
      example: "chips",
      touch: true,
      async run({ scope, expect }) {
        for (const c of await scope.locator('[data-slot="filter-chip"]').all()) expect.equal(Math.round((await c.boundingBox()).height), 40, "touch height")
      },
    },
    {
      name: "Focus shows the system's outline in the focus colour, in both themes",
      example: "chips",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const first = chip(scope, "Needs approval")
        expect(await first.evaluate((el) => document.activeElement === el), "Tab reaches the first chip")
        const o = await first.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth, color: getComputedStyle(el).outlineColor }))
        expect.equal(o.style, "solid", "outline style")
        expect.equal(o.width, "2px", "outline width")
        expect.equal(o.color, await colourOf(page, "focus"), "outline colour")
      },
    },
    {
      name: "In forced colours a pressed chip is outlined, and one at rest is not",
      example: "chips",
      forcedColors: true,
      async run({ scope, expect }) {
        expect.equal(await chip(scope, "Draft").evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "pressed chip outlined")
        expect.equal(await chip(scope, "Paid").evaluate((el) => getComputedStyle(el).outlineStyle), "none", "chip at rest has no outline")
      },
    },
    {
      name: "onChange hears the new state",
      example: "controlled",
      async run({ scope, expect }) {
        await chip(scope, "Flagged").click()
        expect.equal(await scope.locator("[data-on]").getAttribute("data-on"), "true", "the page heard it turn on")
        expect.equal(await chip(scope, "Flagged").getAttribute("aria-pressed"), "true", "and the chip shows it")
      },
    },
  ],
}
