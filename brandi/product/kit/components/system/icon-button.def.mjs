// IconButton's one definition: its README, its preview board and its scripted checks all come from here.

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

const outlineOf = (locator) =>
  locator.evaluate((el) => {
    const s = getComputedStyle(el)
    return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor }
  })

const isFocused = (locator) => locator.evaluate((el) => document.activeElement === el)

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

export default {
  name: "IconButton",
  group: "Actions",
  job: "An icon-only button.",
  status: "proven",
  props: [
    { name: "icon", type: "IconName", doc: "The icon, from the system's vocabulary." },
    { name: "label", type: "string", doc: "Required. Its accessible name and its tooltip. Name what it acts on: More actions for [record]." },
    { name: "variant", type: '"ghost" | "secondary" | "primary" | "danger"', default: '"ghost"', doc: "What the action is to the view. See Variants." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px square; 40, 44 or 48px on a touch screen." },
    { name: "tooltipOpen", type: "boolean", doc: "Shows the tooltip in place, for a design. Leave it unset in product code." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and unpressable. Say why nearby." },
  ],
  tables: [
    {
      title: "Variants",
      head: ["Variant", "Use"],
      rows: [
        ["ghost", "The default. Toolbars, dense rows, a row's overflow menu"],
        ["secondary", "Standing alone on a surface, such as previous and next"],
        ["primary", "Send, in a composer that has no other primary"],
        ["danger", "Remove one thing in place, such as an attachment"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "A real button: Enter and Space press it, and focus stays on it.",
      "The label is its accessible name, so screen readers hear it once. The tooltip shows the same words on screen and is not read again as a description.",
      "The tooltip shows on hover and on keyboard focus, never on a tap. Escape hides it and focus stays put.",
      "It forwards its ref and passes every other prop to the button, so a Menu or Popover can use it as a trigger.",
    ],
    Rules: [
      "Only for actions people know by their icon: more, close, refresh, copy, previous, next. Anything less obvious is a text Button.",
      "The label names what it acts on: More actions for [record], never More.",
      "Ghost in toolbars and dense rows, 8px from its neighbours.",
    ],
    Review: ["Targets came in short across the rounds (section 2.5): every size is measured, on a desktop and on touch."],
  },
  examples: [
    {
      id: "variants",
      title: "Variants",
      markup: `<x-import component-from-global-scope="NS.IconButton" icon="Ellipsis" label="More actions for [Invoice 1042]"></x-import>
<x-import component-from-global-scope="NS.IconButton" icon="RefreshCw" label="Refresh [invoices]"></x-import>
<x-import component-from-global-scope="NS.IconButton" icon="Copy" label="Copy link to [Invoice 1042]" variant="secondary"></x-import>
<x-import component-from-global-scope="NS.IconButton" icon="Send" label="Send [message]" variant="primary"></x-import>
<x-import component-from-global-scope="NS.IconButton" icon="X" label="Remove [receipt.pdf]" variant="danger"></x-import>`,
    },
    {
      id: "sizes",
      title: "Sizes",
      markup: `<x-import component-from-global-scope="NS.IconButton" icon="ChevronLeft" label="Previous [month]" variant="secondary" size="sm"></x-import>
<x-import component-from-global-scope="NS.IconButton" icon="ChevronLeft" label="Previous [month]" variant="secondary"></x-import>
<x-import component-from-global-scope="NS.IconButton" icon="ChevronLeft" label="Previous [month]" variant="secondary" size="lg"></x-import>`,
    },
    {
      id: "pager",
      title: "Previous and next",
      markup: `<x-import component-from-global-scope="NS.IconButton" icon="ChevronLeft" label="Previous page" variant="secondary" on-click="{{prevPage}}"></x-import>
<span class="type-meta text-text-muted tabular-nums" data-page="{{page}}">Page {{page}} of 12</span>
<x-import component-from-global-scope="NS.IconButton" icon="ChevronRight" label="Next page" variant="secondary" on-click="{{nextPage}}"></x-import>`,
    },
    {
      id: "tooltip",
      title: "Tooltip, shown in place for a design",
      markup: `<div style="padding-top: 36px;"><x-import component-from-global-scope="NS.IconButton" icon="RefreshCw" label="Refresh [bank feed]" variant="secondary" tooltip-open="{{yes}}"></x-import></div>`,
    },
    {
      id: "disabled",
      title: "Disabled, with the reason beside it",
      markup: `<x-import component-from-global-scope="NS.IconButton" icon="RefreshCw" label="Refresh [invoices]" variant="secondary" disabled="{{yes}}"></x-import>
<span class="type-meta text-text-muted">[Bank feed] is reconnecting</span>`,
      vals: { yes: true },
    },
  ],
  frame: { width: 960, height: 560 },
  state: { page: 1 },
  logic: "page: self.state.page, prevPage: () => self.setState({ page: Math.max(1, self.state.page - 1) }), nextPage: () => self.setState({ page: Math.min(12, self.state.page + 1) })",
  checks: [
    {
      name: "Its label is its accessible name, and the tooltip is not read again",
      example: "variants",
      async run({ page, scope, expect }) {
        const more = scope.getByRole("button", { name: "More actions for [Invoice 1042]" })
        expect.equal(await more.count(), 1, "one button named by its label")
        await page.keyboard.press("Tab")
        await page.locator('[data-slot="tooltip-content"]', { hasText: "More actions for [Invoice 1042]" }).waitFor({ state: "visible", timeout: 3000 })
        const ax = await heard(page, more)
        expect.equal(`${ax.role}: ${ax.name}`, "button: More actions for [Invoice 1042]", "what a screen reader hears")
        expect.equal(ax.description, "", "with the tooltip open, no description repeats the name")
        expect.equal(await scope.locator("svg[aria-hidden='true']").count(), 5, "every icon is decoration")
      },
    },
    {
      name: "Keyboard focus shows the label as a tooltip, and Escape hides it while focus stays",
      example: "variants",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const tip = page.locator('[data-slot="tooltip-content"]', { hasText: "More actions for [Invoice 1042]" })
        await tip.waitFor({ state: "visible", timeout: 3000 })
        // Radix listens for Escape from the frame after the tooltip appears; a person is never faster than that.
        await page.waitForTimeout(150)
        await page.keyboard.press("Escape")
        await tip.waitFor({ state: "hidden", timeout: 3000 })
        expect(await isFocused(scope.getByRole("button", { name: "More actions for [Invoice 1042]" })), "focus stays on the button after Escape")
      },
    },
    {
      name: "Enter and Space press it, and focus stays on it",
      example: "pager",
      async run({ page, scope, expect }) {
        const next = scope.getByRole("button", { name: "Next page" })
        await next.focus()
        await page.keyboard.press("Enter")
        await page.keyboard.press("Space")
        expect.equal(await scope.locator("[data-page]").getAttribute("data-page"), "3", "two presses moved two pages")
        expect(await isFocused(next), "focus stays on the button")
      },
    },
    {
      name: "Every size is square: 32, 36 and 44px",
      example: "sizes",
      async run({ scope, expect }) {
        const boxes = await Promise.all((await scope.getByRole("button").all()).map((b) => b.boundingBox()))
        expect.equal(boxes.map((b) => Math.round(b.height)).join(","), "32,36,44", "heights")
        for (const b of boxes) expect.equal(Math.round(b.width), Math.round(b.height), "square")
      },
    },
    {
      name: "Touch sizes grow to 40, 44 and 48px",
      example: "sizes",
      touch: true,
      async run({ scope, expect }) {
        const boxes = await Promise.all((await scope.getByRole("button").all()).map((b) => b.boundingBox()))
        expect.equal(boxes.map((b) => Math.round(b.height)).join(","), "40,44,48", "touch heights")
        for (const b of boxes) expect.equal(Math.round(b.width), Math.round(b.height), "still square")
      },
    },
    {
      name: "Focus shows the system's outline in the focus colour, in both themes",
      example: "variants",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const o = await outlineOf(scope.getByRole("button").first())
        expect.equal(o.style, "solid", "outline style")
        expect.equal(o.width, "2px", "outline width")
        expect.equal(o.color, await colourOf(page, "focus"), "outline colour is the theme's focus role")
      },
    },
    {
      name: "Focus stays visible in forced colours",
      example: "variants",
      forcedColors: true,
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        expect.equal((await outlineOf(scope.getByRole("button").first())).style, "solid", "outline style in forced colours")
      },
    },
    {
      name: "The tooltip renders in place for a design, without hover or focus",
      example: "tooltip",
      async run({ page, expect }) {
        expect(await page.locator('[data-slot="tooltip-content"]', { hasText: "Refresh [bank feed]" }).isVisible(), "the design tooltip is showing")
      },
    },
    {
      name: "A disabled icon button keeps its name and cannot be pressed",
      example: "disabled",
      async run({ scope, expect }) {
        const button = scope.getByRole("button", { name: "Refresh [invoices]" })
        expect.equal(await button.count(), 1, "still named")
        expect(await button.isDisabled(), "disabled")
      },
    },
  ],
}
