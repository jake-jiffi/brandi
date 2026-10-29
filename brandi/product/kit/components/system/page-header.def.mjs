// PageHeader's one definition: its README, its preview board and its scripted checks all come from here.

// Long enough to need cutting at two lines in a condensed face too.
const LONG = "[Invoice 1042 for the March maintenance plan, the late fee, the travel surcharge, the second unit's filter clean and the smoke alarm we replaced on the day]"

export default {
  name: "PageHeader",
  group: "Navigation",
  job: "The top of every page: breadcrumbs, the title with its status badges, a description, the actions, and Tabs underneath.",
  status: "proven",
  statics: [
    { name: "focusTitle", type: "() => boolean", doc: "Puts focus on the page's title after an action removed the control people pressed, unless focus is already somewhere other than the page body. Returns whether it moved focus." },
  ],
  props: [
    { name: "title", type: "ReactNode", doc: "The noun people use: Clients, [Client name]. Never Dashboard." },
    { name: "description", type: "ReactNode", doc: "One line under the title, capped at the measure." },
    { name: "breadcrumbs", type: "Array<{ label: string, href?: string }>", doc: "From two levels deep: the trail down to this page, which comes last." },
    { name: "actions", type: "ReactNode", doc: "The secondary actions, as Buttons. Built in the board's script on a canvas." },
    { name: "primary", type: "ReactNode", doc: "The one primary action, last on the right. On a phone inside AppShell it moves to the bar at the foot." },
    { name: "meta", type: "ReactNode", doc: "Badges beside the title, such as SampleBadge or a status." },
    { name: "headingLevel", type: "1 | 2 | 3", default: "1", doc: "The title's level. 1 on a page, where it is the only h1." },
    { name: "children", type: "ReactNode", doc: "Tabs, under the header." },
  ],
  notes: {
    Behaviour: [
      "The title is the page's only h1, focusable from script only, so focus can land there after an action removes the control people pressed. PageHeader.focusTitle() does that, and leaves focus alone when it is already somewhere useful.",
      "On a phone a long title is cut at two lines. The heading keeps the whole title, so a screen reader hears it all, and once it is cut the title is a button that shows it whole, on a tap or from the keyboard, and says whether it is expanded.",
      "Inside AppShell on a phone, the primary moves to the bar at the foot, unless a tab bar has that place.",
    ],
    Layout: [
      "Breadcrumbs, then the title in the title style with its badges beside it, then the description, capped at the measure. The actions sit on the right, the primary last. Tabs run underneath.",
      "By its own width: under 640px actions with a labelled control drop below the title, filling the row. Icon buttons alone, such as the overflow left once the primary has gone to the foot, stay at the end of the title's row, never on a row of their own.",
    ],
    Rules: [
      "One title per screen, the page's only h1, in the title style. The title is the noun people use, never Dashboard. One primary at most, on the right.",
      "Breadcrumbs from two levels deep only.",
    ],
    Review: [
      "Long names overflowed the phone title (round 3).",
      "Once the primary moved to the foot, the overflow sat alone on a row under the title (a proof run, round 3). Icon buttons alone now stay on the title's row.",
    ],
  },
  frame: { width: 960, height: 1120 },
  examples: [
    {
      id: "page",
      title: "On a page",
      // An h2 here: on a board the example sits under the board's own h1, and a second h1 breaks its outline.
      markup: `<x-import component-from-global-scope="NS.PageHeader" style="display: block; width: 100%;" heading-level="{{h2}}" title="[Northside Dental]" description="A client since [March 2023], with three sites and a service visit every month." breadcrumbs="{{trail}}" meta="{{ui.meta}}" actions="{{ui.actions}}" primary="{{ui.primary}}">
<x-import component-from-global-scope="NS.Tabs" label="Client sections" tabs="{{sections}}"></x-import>
</x-import>`,
      layout: "block",
      vals: {
        h2: 2,
        trail: [{ label: "Clients", href: "#clients" }, { label: "[Northside Dental]" }],
        sections: ["Overview", { label: "Invoices", count: 8 }, { label: "Bookings", count: 2, attention: true }, "Notes"],
      },
    },
    {
      id: "phone",
      title: "A long name on a phone",
      width: 390,
      markup: `<x-import component-from-global-scope="NS.PageHeader" style="display: block; width: 100%;" heading-level="{{h2}}" title="${LONG}" description="Sent to [Northside Dental] on [3 October]." breadcrumbs="{{invoiceTrail}}" meta="{{ui.overdue}}" actions="{{ui.actions}}" primary="{{ui.send}}"></x-import>`,
      layout: "block",
      vals: { h2: 2, invoiceTrail: [{ label: "Invoices", href: "#invoices" }, { label: "[Invoice 1042]" }] },
    },
    {
      id: "foot",
      title: "On a phone in AppShell, the primary at the foot and the overflow beside the title",
      // In a shell, so the primary really moves to the bar at the foot and leaves the overflow alone in the header.
      markup: `<div data-shell="foot" class="shrink-0 overflow-hidden outline outline-line" style="width: 390px; height: 440px;"><x-import component-from-global-scope="NS.AppShell" style="display: block; height: 100%;" class="h-full" main-id="main-foot" sidebar="{{ui.sidebar}}" product="[Front desk]" home="#home">
<x-import component-from-global-scope="NS.PageHeader" style="display: block; width: 100%;" heading-level="{{h2}}" title="[Invoice 1042]" description="Sent to [Northside Dental] on [3 October], and due a fortnight later." breadcrumbs="{{invoiceTrail}}" meta="{{ui.overdue}}" actions="{{ui.more}}" primary="{{ui.send}}"></x-import>
</x-import></div>`,
      layout: "block",
    },
    {
      id: "plain",
      title: "Only a title and a description",
      markup: `<x-import component-from-global-scope="NS.PageHeader" style="display: block; width: 100%;" heading-level="{{h3}}" title="Clients" description="Everyone who has booked in the last two years."></x-import>`,
      layout: "block",
      vals: { h3: 3 },
    },
  ],
  state: { sent: 0 },
  logic: `ui: (() => {
    const h = React.createElement;
    return {
      meta: h(NS.SampleBadge, null),
      overdue: h(NS.Badge, { tone: "danger", icon: true }, "Overdue"),
      actions: h(React.Fragment, null, h(NS.Button, { icon: "Pencil" }, "Edit"), h(NS.Button, { icon: "Download" }, "Download PDF")),
      primary: h(NS.Button, { variant: "primary", icon: "Plus" }, "New booking"),
      send: h(NS.Button, { variant: "primary", icon: "Send", onClick: () => self.setState((s) => ({ sent: s.sent + 1 })) }, "Send reminder"),
      more: h(NS.Menu, { label: "More actions for [Invoice 1042]", items: [{ label: "Download PDF", icon: "Download" }, { label: "Duplicate", icon: "Copy" }, "separator", { label: "Void the invoice", icon: "CircleX", danger: true }] }),
      sidebar: h(NS.Sidebar, { product: "[Front desk]", home: "#home", groups: [{ items: [{ label: "Clients", href: "#clients", icon: "Users" }, { label: "Invoices", href: "#invoices", icon: "Receipt", current: true }] }] }),
    };
  })()`,
  checks: [
    {
      name: "The title is the page's only h1 by default, focusable from script only",
      async run({ page, expect }) {
        // Mounted here, with no level given: the board's own examples sit under its h1, so they take h2 and h3.
        await page.evaluate(() => {
          const kit = Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)
          const host = document.createElement("div")
          host.id = "check-mount"
          document.body.append(host)
          window.ReactDOM.flushSync(() => window.ReactDOM.createRoot(host).render(window.React.createElement(kit.PageHeader, { title: "[Northside Dental]" })))
        })
        const title = page.locator("#check-mount").getByRole("heading", { level: 1, name: "[Northside Dental]" })
        expect.equal(await title.count(), 1, "the title is an h1")
        expect.equal(await title.getAttribute("tabindex"), "-1", "focusable from script only")
        expect.equal(await title.getAttribute("data-slot"), "page-title", "found by its slot")
      },
    },
    {
      name: "headingLevel sets the title's level",
      example: "plain",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("heading", { level: 3, name: "Clients" }).count(), 1, "the title is an h3")
      },
    },
    {
      name: "Wide, breadcrumbs lead, the badges sit beside the title, and the actions sit right with the primary last",
      example: "page",
      async run({ scope, expect }) {
        const header = scope.locator('[data-slot="page-header"]')
        const crumbs = await header.getByRole("navigation", { name: "Breadcrumb" }).boundingBox()
        const title = await header.locator('[data-slot="page-title"]').boundingBox()
        const badge = await header.locator('[data-slot="sample-badge"]').boundingBox()
        expect(crumbs.y + crumbs.height <= title.y, "the breadcrumbs sit above the title")
        expect(badge.x >= title.x + title.width && Math.abs(badge.y + badge.height / 2 - (title.y + title.height / 2)) <= 4, "the badge sits beside the title")
        const buttons = await header.locator('[data-slot="page-header-actions"]').getByRole("button").allTextContents()
        expect.equal(buttons.join(", "), "Edit, Download PDF, New booking", "secondary actions, then the primary")
        const actions = await header.locator('[data-slot="page-header-actions"]').boundingBox()
        expect(actions.x > title.x + title.width, "the actions are to the right of the title")
        expect.equal(await header.getByRole("tablist", { name: "Client sections" }).count(), 1, "Tabs run underneath")
      },
    },
    {
      name: "On a phone a long title is cut at two lines, and the heading's name is the whole title (round 3)",
      example: "phone",
      async run({ scope, expect }) {
        const title = scope.getByRole("heading", { level: 2, name: LONG })
        expect.equal(await title.count(), 1, "the heading is named by the whole title")
        const text = title.locator('[data-slot="page-title-text"]')
        const [cut, height, line] = await text.evaluate((el) => [el.scrollHeight > el.clientHeight + 1, el.getBoundingClientRect().height, parseFloat(getComputedStyle(el).lineHeight)])
        expect(cut, "the title is cut")
        expect(Math.abs(height - 2 * line) <= 1, `at two lines (${height}px of ${line}px lines)`)
        const header = await scope.locator('[data-slot="page-header"]').boundingBox()
        const box = await title.boundingBox()
        expect(box.x + box.width <= header.x + header.width + 0.5, "nothing overflows the header")
      },
    },
    {
      name: "Once cut, the title is a button that shows it whole, from the keyboard",
      example: "phone",
      async run({ page, scope, expect }) {
        const toggle = scope.locator('[data-slot="page-title-toggle"]')
        expect.equal(await toggle.getAttribute("aria-expanded"), "false", "it says it is collapsed")
        await toggle.focus()
        await page.keyboard.press("Enter")
        expect.equal(await toggle.getAttribute("aria-expanded"), "true", "Enter shows the whole title")
        const text = scope.locator('[data-slot="page-title-text"]')
        expect(await text.evaluate((el) => el.scrollHeight <= el.clientHeight + 1), "nothing is cut now")
        await page.keyboard.press("Enter")
        expect.equal(await toggle.getAttribute("aria-expanded"), "false", "Enter cuts it again")
      },
    },
    {
      name: "On a touch screen a tap shows the whole title",
      example: "phone",
      touch: true,
      async run({ scope, expect }) {
        const toggle = scope.locator('[data-slot="page-title-toggle"]')
        await toggle.tap()
        expect.equal(await toggle.getAttribute("aria-expanded"), "true", "the tap shows the whole title")
      },
    },
    {
      name: "On a phone the actions drop below the title and fill the row",
      example: "phone",
      async run({ scope, expect }) {
        const header = scope.locator('[data-slot="page-header"]')
        const title = await header.locator('[data-slot="page-title"]').boundingBox()
        const actions = await header.locator('[data-slot="page-header-actions"]').boundingBox()
        const box = await header.boundingBox()
        expect(actions.y >= title.y + title.height, "the actions are below the title")
        expect(Math.abs(actions.width - box.width) <= 1, "and fill the row")
      },
    },
    {
      name: "On a phone, once the primary has gone to the foot, an overflow left alone stays on the title's row (a proof run)",
      example: "foot",
      async run({ scope, expect }) {
        const shell = scope.locator('[data-shell="foot"]')
        await shell.locator('[data-slot="app-shell-action-bar"]').getByRole("button", { name: "Send reminder" }).waitFor()
        const header = shell.locator('[data-slot="page-header"]')
        expect.equal(await header.locator('[data-slot="page-header-actions"]').getByRole("button").count(), 1, "the overflow is all the header has left")
        const box = await header.boundingBox()
        const title = await header.locator('[data-slot="page-title"]').boundingBox()
        const more = await header.getByRole("button", { name: "More actions for [Invoice 1042]" }).boundingBox()
        expect(more.y < title.y + title.height && more.y + more.height > title.y, `level with the title, not on a row of its own (${Math.round(more.y - title.y)}px below its top)`)
        expect(more.x >= title.x + title.width, "on its right")
        expect(Math.abs(more.x + more.width - (box.x + box.width)) <= 1, "at the end of the row")
      },
    },
    {
      name: "A title that fits is plain text, not a button",
      example: "plain",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="page-title-toggle"]').count(), 0, "no button")
      },
    },
    {
      name: "focusTitle puts focus on the title when focus fell to the page body, and leaves it alone otherwise",
      example: "page",
      async run({ page, scope, expect }) {
        const moved = await page.evaluate(() => {
          const ns = Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)
          document.activeElement?.blur()
          return ns.PageHeader.focusTitle()
        })
        expect(moved, "it moved focus")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-slot")), "page-title", "focus is on the title")
        await scope.getByRole("button", { name: "Edit" }).focus()
        const again = await page.evaluate(() => Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root).PageHeader.focusTitle())
        expect.equal(again, false, "with focus on a button, it leaves it there")
      },
    },
  ],
}
