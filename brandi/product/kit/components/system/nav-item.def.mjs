// NavItem's one definition: its README, its preview board and its scripted checks all come from here.

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
// What a role resolves to where an element sits, so a check compares against the theme it is in.
const probe = (el, prop, value) => {
  const p = document.createElement("span")
  p.style[prop] = value
  el.appendChild(p)
  const want = getComputedStyle(p)[prop]
  p.remove()
  return want
}
// Brings an element into view before it takes focus: focus that scrolls the page closes a tooltip as it opens.
const inView = async (page, locator) => {
  await locator.scrollIntoViewIfNeeded()
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}
const rail = (inner) => `<div style="box-sizing: border-box; width: 256px;" class="rounded-rail border border-rail-line bg-rail p-3">${inner}</div>`

const states = [
  { label: "Home", href: "#home", icon: "House" },
  { label: "Approvals", href: "#approvals", icon: "ClipboardCheck", current: true, count: 3, attention: true },
  { label: "Timesheets", href: "#timesheets", icon: "Clock", count: 1, attention: true },
  { label: "Invoices", href: "#invoices", icon: "Receipt", count: 12 },
  { label: "Overdue", href: "#overdue", sub: true, count: 4 },
  { label: "Clients", href: "#clients", icon: "Users", count: 0 },
]

export default {
  name: "NavItem",
  group: "Navigation",
  job: "One destination on the rail: an icon, a label and an optional count.",
  status: "proven",
  props: [
    { name: "label", type: "string", doc: "The destination, as people say it: Approvals." },
    { name: "href", type: "string", doc: "Where it goes, through the system's link, so production gets client navigation." },
    { name: "icon", type: "IconName", doc: "18px on the rail. The icons-only rail shows nothing else, so every top-level item has one." },
    { name: "current", type: "boolean", default: "false", doc: 'The page people are on: rail-selected with a hairline, a bar in rail-text-strong, and aria-current="page".' },
    { name: "count", type: "number", doc: "Work waiting there. Zero shows nothing." },
    { name: "attention", type: "boolean", default: "false", doc: "The count waits on the reader: it takes the highlight and reads 3 need you. Without it the count is grey and reads 3 waiting on others." },
    { name: "sub", type: "boolean", default: "false", doc: "A nested item under the one above: indented under its label, without an icon. The icons-only rail leaves it out." },
    { name: "onClick", type: "MouseEventHandler<HTMLAnchorElement>", doc: "Runs as the link is followed, before the navigation." },
  ],
  notes: {
    Behaviour: [
      'The current page carries aria-current="page". Counts are read as words after the label: Approvals, 3 need you (1 needs you) with attention, and Invoices, 12 waiting on others without.',
      "On the icons-only rail the label stays in the link for screen readers and shows as a tooltip to the right on hover, keyboard focus and a long press. The tooltip repeats the link's name, so it is heard once.",
      "Links render through the system's link, so production gets client navigation.",
    ],
    Layout: [
      "36px tall, 44px on a touch screen, with an 18px icon. A long label wraps to a second line rather than hiding words behind a mouse.",
      "On the icons-only rail it is a 40px square, 44px on touch. A highlight count shrinks to a small chip at the icon's corner, still showing its figure; a grey count hides there and is still read.",
      "A nested item lines up under the label of the item above, with no icon.",
    ],
    States: [
      "The current page takes rail-selected with a 1px hairline in rail-line, and its text and icon take rail-text-strong. Hover takes rail-hover.",
      "The fill is a step off the rail, about 1.3:1, so a 3px bar at the item's start, in rail-text-strong, carries the state at 3:1 or more against the rail and the fill (WCAG 1.4.11).",
      "A count takes the highlight with on-highlight text when it waits on the reader, and rail-muted when it waits on someone else. On the current row a grey count switches to rail-text.",
      "Focus is drawn inside the item in rail-focus, because the rail's list scrolls and would clip a ring outside it. In forced colours the current page is outlined, with a double line when it also has focus.",
    ],
    Rules: [
      "Counts mean work: a highlight count is waiting on the reader, a grey count on someone else. Never a count of things nobody has to act on.",
      "Only rail-* tokens and the highlight live on the rail.",
    ],
    Review: [
      "The needs-you count was white on the highlight, at 1.12:1 (round 1). Its text is on-highlight, solved for contrast.",
      "The current page was marked by its fill alone, 1.32:1 on a dark rail (a second brand's round 2): the bar carries it at 3:1 or more.",
    ],
  },
  frame: { width: 960, height: 900 },
  examples: [
    {
      id: "states",
      title: "Current, counts that need you, a grey count, a nested item and a zero",
      markup: rail(`<x-import component-from-global-scope="NS.NavGroup" items="{{states}}"></x-import>`),
      layout: "block",
      vals: { states },
    },
    {
      id: "icons",
      title: "On the icons-only rail",
      markup: `<x-import component-from-global-scope="NS.Sidebar" style="display: block;" collapsed="{{yes}}" auto-height="{{yes}}" product="[Bookings]" groups="{{iconGroups}}"></x-import>`,
      layout: "block",
      vals: { yes: true, iconGroups: [{ items: states }] },
    },
    {
      id: "long",
      title: "A long label wraps",
      markup: rail(`<x-import component-from-global-scope="NS.NavGroup" items="{{longItems}}"></x-import>`),
      layout: "block",
      vals: { longItems: [{ label: "[Grooming packages and add-ons]", href: "#packages", icon: "Package", count: 2, attention: true }] },
    },
  ],
  checks: [
    {
      name: 'The current page carries aria-current="page", and nothing else does',
      example: "states",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("[aria-current]").count(), 1, "one current item")
        expect.equal(await scope.getByRole("link", { name: "Approvals, 3 need you" }).getAttribute("aria-current"), "page", "Approvals is the current page")
      },
    },
    {
      name: "The current page takes rail-selected with a hairline, and rail-text-strong",
      example: "states",
      async run({ scope, expect }) {
        const link = scope.getByRole("link", { name: "Approvals, 3 need you" })
        const [bg, want, colour, strong, shadow] = await link.evaluate((el, p) => {
          const f = new Function(`return (${p})`)()
          const s = getComputedStyle(el)
          return [s.backgroundColor, f(el, "backgroundColor", "var(--rail-selected)"), s.color, f(el, "color", "var(--rail-text-strong)"), s.boxShadow]
        }, probe.toString())
        expect.equal(bg, want, "the current page's fill")
        expect.equal(colour, strong, "the current page's text")
        expect(shadow.includes("inset") && shadow.includes("1px"), `a 1px hairline (${shadow})`)
      },
    },
    {
      name: "The current page is marked at 3:1 or more, against the rail and against its own fill, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const link = scope.getByRole("link", { name: "Approvals, 3 need you" })
        const [bar, width, fill, ground] = await link.evaluate((el, p) => {
          const f = new Function(`return (${p})`)()
          const s = getComputedStyle(el, "::before")
          return [s.backgroundColor, s.width, getComputedStyle(el).backgroundColor, f(el, "backgroundColor", "var(--rail)")]
        }, probe.toString())
        expect.equal(width, "3px", "a 3px bar")
        expect.atLeast(Number(contrast(bar, ground).toFixed(2)), 3, `${theme}: the bar against the rail`)
        expect.atLeast(Number(contrast(bar, fill).toFixed(2)), 3, `${theme}: the bar against the current fill`)
        const others = await scope.locator('[data-slot="sidebar-menu-button"]:not([aria-current])').evaluateAll((all) => all.filter((el) => getComputedStyle(el, "::before").content !== "none").length)
        expect.equal(others, 0, "no other item carries a bar")
      },
    },
    {
      name: "The needs-you count is on-highlight on the highlight, at 4.5:1 or more, in both themes (round 1)",
      example: "states",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const name of ["Approvals, 3 need you", "Timesheets, 1 needs you"]) {
          const chip = scope.getByRole("link", { name }).locator('[data-slot="nav-item-count"]')
          const [fg, bg, wantFg, wantBg] = await chip.evaluate((el, p) => {
            const f = new Function(`return (${p})`)()
            const s = getComputedStyle(el)
            return [s.color, s.backgroundColor, f(el, "color", "var(--on-highlight)"), f(el, "backgroundColor", "var(--highlight)")]
          }, probe.toString())
          expect.equal(fg, wantFg, `${name}: the figure is on-highlight`)
          expect.equal(bg, wantBg, `${name}: the chip is the highlight`)
          const ratio = contrast(fg, bg)
          expect.atLeast(Number(ratio.toFixed(2)), 4.5, `${name}: the count's contrast in ${theme}`)
        }
      },
    },
    {
      name: "Counts are read as words, and zero shows nothing",
      example: "states",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "Approvals, 3 need you" }).count(), 1, "Approvals, 3 need you")
        expect.equal(await scope.getByRole("link", { name: "Timesheets, 1 needs you" }).count(), 1, "1 needs you")
        expect.equal(await scope.getByRole("link", { name: "Invoices, 12 waiting on others" }).count(), 1, "Invoices, 12 waiting on others")
        const clients = scope.getByRole("link", { name: "Clients", exact: true })
        expect.equal(await clients.count(), 1, "Clients, with a zero count, is named by its label alone")
        expect.equal(await clients.locator('[data-slot="nav-item-count"]').count(), 0, "a zero shows nothing")
      },
    },
    {
      name: "A grey count waits in rail-muted, and switches to rail-text on the current row",
      example: "states",
      async run({ scope, expect }) {
        const grey = scope.getByRole("link", { name: "Invoices, 12 waiting on others" }).locator('[data-slot="nav-item-count"]')
        const [colour, muted, fill] = await grey.evaluate((el, p) => {
          const f = new Function(`return (${p})`)()
          return [getComputedStyle(el).color, f(el, "color", "var(--rail-muted)"), getComputedStyle(el).backgroundColor]
        }, probe.toString())
        expect.equal(colour, muted, "the grey count's figure")
        expect.equal(fill, "rgba(0, 0, 0, 0)", "a grey count has no fill")
      },
    },
    {
      name: "A nested item is indented under the label above, without an icon",
      example: "states",
      async run({ scope, expect }) {
        const sub = scope.getByRole("link", { name: "Overdue, 4 waiting on others" })
        const parentLabel = await scope.getByRole("link", { name: "Invoices, 12 waiting on others" }).locator('[data-slot="nav-item-label"]').boundingBox()
        const subLabel = await sub.locator('[data-slot="nav-item-label"]').boundingBox()
        expect(Math.abs(subLabel.x - parentLabel.x) <= 1, `the nested label lines up with the label above (${subLabel.x} and ${parentLabel.x})`)
        expect.equal(await sub.locator('[data-slot="icon"]').count(), 0, "no icon")
      },
    },
    {
      name: "Items are 36px tall",
      example: "states",
      async run({ scope, expect }) {
        for (const link of await scope.getByRole("link").all()) expect.equal(Math.round((await link.boundingBox()).height), 36, "item height")
      },
    },
    {
      name: "Items are 44px tall on a touch screen",
      example: "states",
      touch: true,
      async run({ scope, expect }) {
        for (const link of await scope.getByRole("link").all()) expect.equal(Math.round((await link.boundingBox()).height), 44, "item height on touch")
      },
    },
    {
      name: "Focus is drawn inside the item in rail-focus, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const first = scope.getByRole("link", { name: "Home" })
        const [focused, style, offset, colour, want] = await first.evaluate((el, p) => {
          const f = new Function(`return (${p})`)()
          const s = getComputedStyle(el)
          return [el === document.activeElement, s.outlineStyle, s.outlineOffset, s.outlineColor, f(el, "color", "var(--rail-focus)")]
        }, probe.toString())
        expect(focused, "the first Tab lands on the first item")
        expect.equal(style, "solid", "a focus ring from the keyboard")
        expect.equal(offset, "-2px", "drawn inside the item")
        expect.equal(colour, want, "in rail-focus")
      },
    },
    {
      name: "In forced colours the current page stays outlined, and nothing else is outlined at rest",
      example: "states",
      forcedColors: true,
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "Approvals, 3 need you" }).evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "the current page's outline")
        expect.equal(await scope.getByRole("link", { name: "Home" }).evaluate((el) => getComputedStyle(el).outlineStyle), "none", "no outline at rest")
      },
    },
    {
      name: "On the icons-only rail the label stays in the name, a needs-you count keeps its figure, and a nested item leaves",
      example: "icons",
      async run({ scope, expect }) {
        const link = scope.getByRole("link", { name: "Approvals, 3 need you" })
        expect.equal(await link.count(), 1, "the label and the count are still read")
        const box = await link.boundingBox()
        expect.equal(`${Math.round(box.width)}x${Math.round(box.height)}`, "40x40", "a 40px square")
        expect(!(await link.locator('[data-slot="nav-item-label"]').evaluate((el) => el.getBoundingClientRect().width > 1)), "the label is hidden to the eye")
        expect.equal((await link.locator('[data-slot="nav-item-count"]').textContent()).trim(), "3", "the needs-you figure shows on its chip")
        expect(!(await scope.getByRole("link", { name: "Invoices, 12 waiting on others" }).locator('[data-slot="nav-item-count"]').isVisible()), "the grey count hides")
        expect.equal(await scope.getByRole("link", { name: "Overdue, 4 waiting on others" }).count(), 0, "the nested item is not on the icons-only rail")
      },
    },
    {
      name: "On the icons-only rail keyboard focus shows the label as a tooltip to the right",
      example: "icons",
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link", { name: "Invoices, 12 waiting on others" })
        await inView(page, link)
        await link.focus()
        const tip = page.locator('[data-slot="tooltip-content"]').filter({ hasText: "Invoices, 12 waiting on others" })
        await tip.waitFor({ state: "visible", timeout: 3000 })
        const [l, t] = await Promise.all([link.boundingBox(), tip.boundingBox()])
        expect(t.x >= l.x + l.width, "the tooltip opens to the right of the icon")
        expect.equal(await link.getAttribute("aria-describedby"), null, "the tooltip repeats the name, so it is not read twice")
      },
    },
    {
      name: "A long label wraps to a second line instead of being cut",
      example: "long",
      async run({ scope, expect }) {
        const label = scope.locator('[data-slot="nav-item-label"]')
        const [h, scrollW, clientW] = await label.evaluate((el) => [el.getBoundingClientRect().height, el.scrollWidth, el.clientWidth])
        expect.atLeast(h, 39, "two lines of label")
        expect(scrollW <= clientW, "nothing is cut")
      },
    },
  ],
}
