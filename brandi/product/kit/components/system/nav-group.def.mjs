// NavGroup's one definition: its README, its preview board and its scripted checks all come from here.

const rail = (inner) => `<div style="box-sizing: border-box; width: 256px;" class="rounded-rail border border-rail-line bg-rail p-3">${inner}</div>`

const work = [
  { label: "Approvals", href: "#approvals", icon: "ClipboardCheck", current: true, count: 3, attention: true },
  { label: "Bookings", href: "#bookings", icon: "Calendar" },
  { label: "Invoices", href: "#invoices", icon: "Receipt", count: 12 },
]
const reports = [
  { label: "Revenue", href: "#revenue", icon: "ChartColumn" },
  { label: "Utilisation", href: "#utilisation", icon: "ChartLine" },
]

export default {
  name: "NavGroup",
  group: "Navigation",
  job: "NavItems on the rail under a short uppercase label, optionally collapsible.",
  status: "proven",
  props: [
    { name: "label", type: "string", doc: "A short label, shown in capitals: Work. Leave it out for the group at the top of the rail." },
    { name: "collapsible", type: "boolean", default: "false", doc: "The label becomes a button that opens and closes the group." },
    { name: "defaultOpen", type: "boolean", default: "true", doc: "Whether a collapsible group starts open." },
    { name: "items", type: "NavItemProps[]", doc: "The items as data, for a canvas: each is a NavItem's props." },
    { name: "children", type: "ReactNode", doc: "NavItems, when they are not given as items." },
  ],
  notes: {
    Behaviour: [
      "A list named by its label, so a screen reader hears Work, list, 3 items. A group with no label is a plain list.",
      "A collapsible group's label is a button with aria-expanded and aria-controls. Enter or Space opens and closes it, and the list it controls stays in the page while closed, hidden.",
      "On the icons-only rail the label stays for screen readers, a hairline stands in for it between groups, and every group shows its items, because there is no label to press.",
    ],
    Layout: ["The label is 28px tall, in the eyebrow style and rail-muted, lined up with the items' icons. Items sit 2px apart. A nested item leaves the icons-only rail with its list item."],
    Rules: ["Eight top-level items at most across the rail, in groups under short labels: Work, Money, Insights. Settings and help go in the Sidebar's footer, not a group."],
  },
  frame: { width: 960, height: 980 },
  examples: [
    {
      id: "labelled",
      title: "Under a label",
      markup: rail(`<x-import component-from-global-scope="NS.NavGroup" label="Work" items="{{work}}"></x-import>`),
      layout: "block",
      vals: { work },
    },
    {
      id: "collapsible",
      title: "Collapsible, one starting closed",
      markup: rail(`<div class="flex flex-col gap-4"><x-import component-from-global-scope="NS.NavGroup" label="Work" collapsible="{{yes}}" items="{{work}}"></x-import>
<x-import component-from-global-scope="NS.NavGroup" label="Reports" collapsible="{{yes}}" default-open="{{no}}" items="{{reports}}"></x-import></div>`),
      layout: "block",
      vals: { yes: true, no: false, reports },
    },
    {
      id: "icons",
      title: "On the icons-only rail",
      markup: `<x-import component-from-global-scope="NS.Sidebar" style="display: block;" collapsed="{{yes}}" auto-height="{{yes}}" product="[Bookings]" groups="{{groups}}"></x-import>`,
      layout: "block",
      vals: { groups: [{ label: "Work", items: work }, { label: "Reports", collapsible: true, defaultOpen: false, items: reports }] },
    },
  ],
  checks: [
    {
      name: "A list named by its label, with an item per destination",
      example: "labelled",
      async run({ scope, expect }) {
        const list = scope.getByRole("list", { name: "Work" })
        expect.equal(await list.count(), 1, "a list named Work")
        expect.equal(await list.getByRole("listitem").count(), 3, "three items")
        expect.equal(await list.getByRole("link").count(), 3, "a link in each")
      },
    },
    {
      name: "A collapsible group opens and closes from the keyboard, and says which it is",
      example: "collapsible",
      async run({ page, scope, expect }) {
        const toggle = scope.getByRole("button", { name: "Reports" })
        expect.equal(await toggle.getAttribute("aria-expanded"), "false", "Reports starts closed")
        const controls = await toggle.getAttribute("aria-controls")
        expect(await scope.locator(`[id="${controls}"]`).count(), "the list it controls stays in the page")
        expect(!(await scope.getByRole("link", { name: "Revenue" }).isVisible()), "its items are hidden")
        await toggle.focus()
        await page.keyboard.press("Enter")
        expect.equal(await toggle.getAttribute("aria-expanded"), "true", "Enter opens it")
        expect(await scope.getByRole("link", { name: "Revenue" }).isVisible(), "its items show")
        expect(await toggle.evaluate((el) => el === document.activeElement), "focus stays on the label")
        await page.keyboard.press("Space")
        expect.equal(await toggle.getAttribute("aria-expanded"), "false", "Space closes it")
      },
    },
    {
      name: "Under reduced motion the chevron turns at once, without the transition",
      example: "collapsible",
      reducedMotion: true,
      async run({ scope, expect }) {
        const chevron = scope.getByRole("button", { name: "Reports" }).locator('[data-slot="icon"]')
        const [property, duration] = await chevron.evaluate((el) => [getComputedStyle(el).transitionProperty, getComputedStyle(el).transitionDuration])
        expect(!property.includes("transform") || duration.split(",").every((d) => parseFloat(d) === 0), `no turning transition (${property} ${duration})`)
      },
    },
    {
      name: "With motion, the chevron turns as the group opens",
      example: "collapsible",
      async run({ scope, expect }) {
        const chevron = scope.getByRole("button", { name: "Reports" }).locator('[data-slot="icon"]')
        const property = await chevron.evaluate((el) => getComputedStyle(el).transitionProperty)
        expect(property.includes("transform"), `a turning transition (${property})`)
      },
    },
    {
      name: "A collapsible label is 28px, 40px on a touch screen",
      example: "collapsible",
      touch: true,
      async run({ scope, expect }) {
        for (const name of ["Work", "Reports"]) expect.atLeast(Math.round((await scope.getByRole("button", { name }).boundingBox()).height), 40, `${name} on touch`)
      },
    },
    {
      name: "On the icons-only rail the labels still name the lists, a hairline stands in for them, and closed groups show their items",
      example: "icons",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("list", { name: "Work" }).count(), 1, "Work still names its list")
        expect.equal(await scope.getByRole("list", { name: "Reports" }).count(), 1, "and Reports its list")
        expect.equal(await scope.getByRole("button", { name: "Reports" }).count(), 0, "no label to press")
        expect(await scope.getByRole("link", { name: "Revenue" }).isVisible(), "the closed group's items show")
        const second = scope.locator('[data-slot="nav-group"]').nth(1)
        expect.equal(await second.evaluate((el) => getComputedStyle(el).borderTopStyle), "solid", "a hairline above the second group")
      },
    },
    {
      name: "The label is the eyebrow style in rail-muted, lined up with the items' icons",
      example: "labelled",
      async run({ scope, expect }) {
        const label = scope.locator('[data-slot="nav-group-label"]')
        const [transform, colour, want, labelX] = await label.evaluate((el) => {
          const p = document.createElement("span")
          p.style.color = "var(--rail-muted)"
          el.appendChild(p)
          const w = getComputedStyle(p).color
          p.remove()
          const range = document.createRange()
          range.selectNodeContents(el)
          return [getComputedStyle(el).textTransform, getComputedStyle(el).color, w, range.getBoundingClientRect().x]
        })
        expect.equal(transform, "uppercase", "in capitals")
        expect.equal(colour, want, "in rail-muted")
        const icon = await scope.getByRole("link", { name: "Bookings" }).locator('[data-slot="icon"]').boundingBox()
        expect(Math.abs(labelX - icon.x) <= 1, `the label starts where the items' icons do (${labelX} and ${icon.x})`)
      },
    },
  ],
}
