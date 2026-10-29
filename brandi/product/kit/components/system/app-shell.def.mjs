// AppShell's one definition: its README, its preview board and its scripted checks all come from here.

// An overlay is ready for keys once it has finished opening: Radix registers its Escape and focus
// handling a beat after it shows, so a check waits for the opening animation and two frames first.
const ready = async (locator) => {
  await locator.waitFor()
  await locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
  await locator.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}
// Brings an element into view before it takes focus: focus that scrolls the page closes a tooltip as it opens.
const inView = async (page, locator) => {
  await locator.scrollIntoViewIfNeeded()
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}
// The live drawer, in its portal: never the picture a design shows in place.
const liveDrawer = (page) => page.locator('[role="dialog"][data-slot="sheet-content"]:not([data-inline])')
// A preview carries a <base> pointing at its source folder, so an in-page link would load that folder
// instead. Taking it out makes these links behave as they do on a product's page.
const samePage = (page) => page.evaluate(() => document.querySelector("base")?.remove())
const shell = (scope, name) => scope.locator(`[data-shell="${name}"]`)
const active = (page) => page.evaluate(() => {
  const el = document.activeElement
  return { tag: el?.tagName ?? "", id: el?.id ?? "", name: el?.getAttribute("aria-label") ?? el?.textContent?.trim() ?? "", body: el === document.body }
})
async function openDrawer(page, scope, name = "live") {
  // Found by its slot, not its role: behind the open drawer it is hidden from the accessibility tree.
  const menu = shell(scope, name).locator('[data-slot="phone-top-bar-menu"]')
  await menu.focus()
  await page.keyboard.press("Enter")
  const drawer = liveDrawer(page)
  await ready(drawer)
  return { menu, drawer }
}

const groups = [
  {
    items: [
      { label: "Home", href: "#home", icon: "House" },
      { label: "Inbox", href: "#inbox", icon: "Inbox", count: 2, attention: true },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Approvals", href: "#approvals", icon: "ClipboardCheck", current: true, count: 3, attention: true },
      { label: "Bookings", href: "#bookings", icon: "Calendar" },
      { label: "Invoices", href: "#invoices", icon: "Receipt", count: 12 },
      { label: "Clients", href: "#clients", icon: "Users" },
    ],
  },
  { label: "Insights", items: [{ label: "Reports", href: "#reports", icon: "ChartColumn" }] },
]
const footer = [
  { label: "Settings", href: "#settings", icon: "Settings" },
  { label: "Help", href: "#help", icon: "LifeBuoy" },
]
const workspaces = [
  { value: "muddy-paws", name: "[Muddy Paws Grooming]", role: "Owner" },
  { value: "northside", name: "[Northside Paws]", role: "Manager" },
  { value: "bark-avenue", name: "[Bark Avenue Spa]", role: "Staff" },
]
const tabs = [
  { label: "Home", href: "#home", icon: "House" },
  { label: "Approvals", href: "#approvals", icon: "ClipboardCheck", count: 3, attention: true },
  { label: "Bookings", href: "#bookings", icon: "Calendar" },
  { label: "Clients", href: "#clients", icon: "Users" },
]

const waiting = [
  ["[Priya Nair]", "Timesheet, 38.5 hours", "2 days"],
  ["[Tom Becker]", "Refund, [$120.00]", "1 day"],
  ["[Ana Silva]", "Timesheet, 41 hours", "4 hours"],
  ["[Leo Martin]", "Leave, 3 days in [December]", "4 hours"],
  ["[Grace Kim]", "Timesheet, 22 hours", "2 hours"],
  ["[Omar Haddad]", "Refund, [$64.50]", "1 hour"],
]
// The page in each shell: a header, then the list it is about, as a board would draw it.
const page = (id) => `<x-import component-from-global-scope="NS.PageHeader" title="Approvals" description="Timesheets, refunds and leave waiting on you, oldest first." heading-level="{{h2}}" meta="{{ui.meta}}" actions="{{ui.actions}}" primary="{{ui.primary}}">
<x-import component-from-global-scope="NS.Tabs" label="Approval queues" tabs="{{queues}}"></x-import>
</x-import>
<ul class="mt-6 overflow-hidden rounded-md border border-line bg-surface shadow-xs">${waiting
  .map(
    ([who, what, when], i) =>
      `<li class="flex items-center gap-4 px-4 py-3${i ? " border-t border-line" : ""}"><div class="flex min-w-0 flex-1 flex-col"><a href="#${id}-${i + 1}" class="self-start rounded-xs type-label text-text-strong underline-offset-4 hover:underline">${who}</a><span class="type-meta text-text-muted">${what}</span></div><span class="shrink-0 type-meta text-text-muted">Waiting ${when}</span></li>`
  )
  .join("")}</ul>`
const frame = (name, width, height, attrs, id) =>
  `<div data-shell="${name}" class="shrink-0 overflow-hidden outline outline-line" style="width: ${width}px; height: ${height}px;"><x-import component-from-global-scope="NS.AppShell" style="display: block; height: 100%;" class="h-full" main-id="${id}" sidebar="{{ui.sidebar}}" product="[Front desk]" home="#home" ${attrs}>
${page(id)}
</x-import></div>`
const caption = (text) => `<p class="m-0 type-meta text-text-muted">${text}</p>`

export default {
  name: "AppShell",
  group: "Navigation",
  job: "The frame of every product: a skip link, the canvas, the rail and the main column.",
  status: "proven",
  props: [
    { name: "sidebar", type: "ReactNode", doc: "A Sidebar. It is the rail from 1024px, and the drawer's contents under that. Built in the board's script on a canvas." },
    { name: "product", type: "string", default: "the name in lib/product.ts", doc: "The product's name, for the lockup in the top bar under 1024px." },
    { name: "home", type: "string", doc: "Where the top bar's lockup links." },
    { name: "navOpen", type: "boolean", doc: "Controls the drawer, with onNavOpenChange. Leave both out and the menu button opens it." },
    { name: "onNavOpenChange", type: "(open: boolean) => void", doc: "Called as the drawer opens and closes." },
    { name: "navInline", type: "boolean", default: "false", doc: "Draws the drawer open in place, for a design on a canvas: a still picture with no live layer, so the board keeps its Escape key and its tab order." },
    { name: "topBar", type: "ReactNode", doc: "Replaces the top bar, for a detail screen: a PhoneTopBar with Back and the screen's title." },
    { name: "tabBar", type: "ReactNode", doc: "A PhoneTabBar for the foot under 640px. With one, PageHeader's primary stays in the header." },
    { name: "mainId", type: "string", default: '"main"', doc: "The main region's id, which the skip link and route focus target. One per page." },
    { name: "children", type: "ReactNode", doc: "A PageHeader, then panes and cards. The column scrolls; the rail stays put." },
  ],
  tables: [
    {
      title: "Layouts",
      head: ["Width of the shell", "What it shows"],
      rows: [
        ["1280px and up", "The full rail, with the product lockup, labels and counts. It meets the window edge, or floats 8px in when the brand's shell is floating"],
        ["1024 to 1279px", "The rail as 72px of icons, each label a tooltip on hover and keyboard focus"],
        ["640 to 1023px", "The rail becomes a drawer from the left, behind a top bar that carries the menu button and the product lockup"],
        ["Under 640px", "The phone layout: the top bar and the drawer, with a tab bar or the page's primary at the foot"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "Skip to content comes first and takes focus to main.",
      "The drawer is a dialog named Navigation. It takes focus as it opens, on its Close navigation button, and keeps it: Tab and Shift Tab stay inside, and the page behind is hidden from screen readers. Escape, the close button and a tap on the scrim close it at once, and focus is back on the menu button the moment it closes.",
      "Choosing a destination in the drawer closes it, and focus lands on main, where a route change puts it: never on the menu button or the page body. In the product, RouteFocus moves focus to main after every client navigation, so main keeps its id and takes focus from script only.",
      "On a phone, PageHeader's primary moves to a bar at the foot, unless a tab bar has that place. The bars sit outside the scrolling column, so neither can hide whatever has focus.",
      "The drawer serves every width under 1024px, so moving between the phone layout and the one above it leaves it open. Widening the shell to 1024px or more closes it, and focus goes to main, since the menu button goes with the top bar. The open drawer takes the theme of the shell it opened from.",
    ],
    Layout: [
      "It measures itself, not the window, so a board, a split view and a browser tab of the same width match: the look switches by container queries, which the server and a canvas draw before any script runs.",
      "The rail stays put and the main column scrolls. The column's padding steps down with the shell: 32px, then 24px under 1280px, then 16px on a phone.",
      "The drawer comes in from the left in the rail's form, against the edge or 8px in when the rail floats, up to 320px wide. Under reduced motion it fades in without sliding.",
    ],
    Rules: [
      "Pages go in a route group whose layout holds the shell, so the rail stays mounted between pages.",
      "On a phone the foot belongs to the tab bar or to the page's primary, never both: decide per product.",
    ],
    Review: [
      "There was no working phone layout, the only P0 in round 1.",
      "The drawer dropped focus and let it escape behind (round 2).",
      "An invisible tooltip swallowed Escape in the drawer, and the action bar could hide focus (round 3).",
    ],
  },
  frame: { width: 1488, height: 3440 },
  examples: [
    {
      id: "full",
      title: "The full rail, at 1440",
      markup: frame("full", 1440, 900, "", "main-1440"),
      layout: "block",
      vals: { h2: 2, queues: [{ label: "Waiting", count: 3, attention: true }, "Approved", "Sent back"] },
    },
    {
      id: "icons",
      title: "The rail as icons, with the labels as tooltips, at 1100",
      markup: frame("icons", 1100, 700, "", "main-1100"),
      layout: "block",
    },
    {
      id: "tablet",
      title: "At 820, the rail becomes a drawer behind a top bar",
      markup: frame("tablet", 820, 700, "", "main-820"),
      layout: "block",
    },
    {
      id: "phone",
      title: "On a phone, at 390",
      markup: `<div class="flex items-start gap-6">
<div class="flex flex-col gap-2">${caption("The menu opens the drawer, and the primary moves to the foot")}${frame("live", 390, 844, "", "main-390")}</div>
<div class="flex flex-col gap-2">${caption("With a tab bar, the primary stays in the header")}${frame("tabs", 390, 844, 'tab-bar="{{ui.tabBar}}"', "main-390-tabs")}</div>
<div class="flex flex-col gap-2">${caption("The drawer open, drawn for a design")}${frame("open", 390, 844, 'nav-inline="{{yes}}"', "main-390-open")}</div>
</div>`,
      layout: "block",
      vals: { yes: true },
    },
  ],
  state: { ws: "muddy-paws", searches: 0 },
  logic: `ui: (() => {
    const h = React.createElement;
    const account = h(NS.WorkspaceSwitcher, {
      user: { name: "[Sam Lee]", role: "Owner" },
      workspaces: ${JSON.stringify(workspaces)},
      value: self.state.ws,
      onChange: (ws) => self.setState({ ws }),
      items: [{ label: "Account settings", icon: "Settings" }, { label: "Sign out", icon: "LogOut" }],
    });
    return {
      sidebar: h(NS.Sidebar, { product: "[Front desk]", home: "#home", groups: ${JSON.stringify(groups)}, footer: ${JSON.stringify(footer)}, account, onSearch: () => self.setState((s) => ({ searches: s.searches + 1 })) }),
      tabBar: h(NS.PhoneTabBar, { items: ${JSON.stringify(tabs)}, value: "#approvals" }),
      meta: h(NS.SampleBadge, null),
      actions: h(NS.Button, { icon: "Download" }, "Export"),
      primary: h(NS.Button, { variant: "primary", icon: "Check" }, "Approve 3"),
    };
  })()`,
  checks: [
    {
      name: "Four layouts by the shell's own width: the full rail at 1440, icons at 1100, a drawer behind a top bar at 820, the phone at 390 (round 1)",
      async run({ page, expect }) {
        const at = (name) => page.locator(`[data-shell="${name}"] [data-slot="app-shell"]`)
        expect.equal(await at("full").getAttribute("data-layout"), "full", "1440 is the full rail")
        expect.equal(await at("icons").getAttribute("data-layout"), "icons", "1100 is icons")
        expect.equal(await at("tablet").getAttribute("data-layout"), "drawer", "820 is the drawer behind a top bar")
        expect.equal(await at("live").getAttribute("data-layout"), "phone", "390 is the phone")
        const rail = (name) => page.locator(`[data-shell="${name}"] [data-slot="app-shell-rail"] [data-slot="sidebar"]`)
        expect.equal(Math.round((await rail("full").boundingBox()).width), 240, "the full rail is 240px")
        expect.equal(Math.round((await rail("icons").boundingBox()).width), 72, "the icons-only rail is 72px")
        expect(!(await rail("tablet").isVisible()), "no rail at 820")
        expect(!(await rail("live").isVisible()), "no rail on the phone")
        const box = await rail("full").boundingBox()
        const frame = await at("full").boundingBox()
        // The rail takes the brand's form: set in by shell-inset when it floats, against the window edge when it does not.
        const form = await rail("full").evaluate((el) => {
          const s = getComputedStyle(el)
          return { inset: parseFloat(s.getPropertyValue("--shell-inset")) || 0, radius: parseFloat(s.borderTopLeftRadius) || 0, want: parseFloat(s.getPropertyValue("--radius-rail")) || 0, line: parseFloat(s.borderLeftWidth) || 0 }
        })
        expect(Math.abs(box.x - frame.x - form.inset) <= 1 && Math.abs(box.y - frame.y - form.inset) <= 1, `the rail sits ${form.inset}px in from the window edge`)
        expect.equal(form.radius, form.want, "its corners are the rail's radius")
        if (!form.inset) expect.equal(form.line, 0, "a rail against the edge draws no line on the window's side")
        const topBar = (name) => page.locator(`[data-shell="${name}"] [data-slot="phone-top-bar"]`)
        expect(await topBar("tablet").isVisible() && await topBar("live").isVisible(), "820 and 390 have the top bar")
        expect(!(await topBar("icons").isVisible()) && !(await topBar("full").isVisible()), "1100 and 1440 have none")
        expect(await page.locator('[data-shell="full"] [data-slot="product-lockup-name"]').first().isVisible(), "the full rail shows the product's name")
        const actionBar = (name) => page.locator(`[data-shell="${name}"] [data-slot="app-shell-action-bar"]`)
        expect(await actionBar("live").isVisible(), "the phone has the bar at the foot")
        expect(!(await actionBar("tablet").isVisible()), "820 has none")
      },
    },
    {
      name: "At 1100 every icon on the rail shows its words as a tooltip on keyboard focus, and keeps them in its name",
      example: "icons",
      async run({ page, scope, expect }) {
        const nav = scope.getByRole("navigation", { name: "Main" })
        const icons = [
          [nav.getByRole("button", { name: "Search or ask", exact: true }), "Search or ask"],
          ...["Home", "Inbox, 2 need you", "Approvals, 3 need you", "Bookings", "Invoices, 12 waiting on others", "Clients", "Reports", "Settings", "Help"].map((w) => [nav.getByRole("link", { name: w, exact: true }), w]),
          [nav.getByRole("button", { name: "[Sam Lee], [Muddy Paws Grooming], Owner, account menu" }), "[Sam Lee], [Muddy Paws Grooming]"],
        ]
        expect.equal(await nav.locator("ul a").count(), 9, "nine destinations on the rail")
        for (const [target, words] of icons) {
          expect.equal(await target.count(), 1, `${words} is named`)
          await inView(page, target)
          await target.focus()
          const tip = page.locator('[data-slot="tooltip-content"]:not([data-example] *)').filter({ hasText: words })
          expect(await tip.waitFor({ state: "visible", timeout: 3000 }).then(() => true, () => false), `${words} shows as a tooltip`)
          const box = await target.boundingBox()
          expect(box.width <= 44 && box.height <= 44, `${words} is an icon, ${Math.round(box.width)}x${Math.round(box.height)}`)
        }
      },
    },
    {
      name: "Skip to content comes first, and takes focus to main",
      example: "full",
      async run({ page, scope, expect }) {
        await samePage(page)
        const skip = scope.getByRole("link", { name: "Skip to content" })
        await page.keyboard.press("Tab")
        expect(await skip.evaluate((el) => el === document.activeElement), "the first Tab lands on Skip to content")
        expect(await skip.evaluate((el) => el.getBoundingClientRect().width > 40), "it shows while it has focus")
        await page.keyboard.press("Enter")
        const now = await active(page)
        expect.equal(now.id, "main-1440", "focus is on main")
      },
    },
    {
      name: "At 820 the top bar carries the menu button and the lockup, and the menu button opens the drawer from the keyboard, with focus on its close button",
      example: "tablet",
      async run({ page, scope, expect, brand }) {
        const bar = shell(scope, "tablet").locator('[data-slot="phone-top-bar"]')
        expect.equal(await bar.getByRole("button", { name: "Open navigation" }).getAttribute("aria-haspopup"), "dialog", "the menu button is named Open navigation and opens a dialog")
        expect.equal(await bar.getByRole("link", { name: `${brand.name} [Front desk]` }).count(), 1, "the lockup is beside it")
        const { menu, drawer } = await openDrawer(page, scope, "tablet")
        expect.equal(await page.getByRole("dialog", { name: "Navigation" }).count(), 1, "a dialog named Navigation")
        expect.equal(await menu.getAttribute("aria-expanded"), "true", "the menu button says it is open")
        expect.equal((await active(page)).name, "Close navigation", "focus is on Close navigation")
        expect(await drawer.getByRole("navigation", { name: "Main" }).isVisible(), "the rail's navigation is inside")
      },
    },
    {
      name: "At 820 the drawer keeps focus: Tab and Shift Tab stay inside, and the page behind is hidden from screen readers (round 2)",
      example: "tablet",
      async run({ page, scope, expect }) {
        const { drawer } = await openDrawer(page, scope, "tablet")
        const inside = () => drawer.evaluate((d) => d.contains(document.activeElement))
        for (let i = 0; i < 16; i++) {
          await page.keyboard.press("Tab")
          expect(await inside(), `focus is inside after Tab ${i + 1}`)
        }
        for (let i = 0; i < 4; i++) {
          await page.keyboard.press("Shift+Tab")
          expect(await inside(), `focus is inside after Shift Tab ${i + 1}`)
        }
        const hidden = await shell(scope, "tablet").locator('[data-slot="app-shell-main"]').evaluate((el) => Boolean(el.closest('[aria-hidden="true"], [inert]')))
        expect(hidden, "the page behind is hidden from screen readers")
      },
    },
    {
      name: "At 820 Escape closes the drawer at once, and so does its close button, each with focus back on the menu button",
      example: "tablet",
      async run({ page, scope, expect }) {
        let { menu, drawer } = await openDrawer(page, scope, "tablet")
        await page.keyboard.press("Tab")
        await page.keyboard.press("Escape")
        expect.equal(await drawer.count(), 0, "Escape: the drawer is gone straight away")
        expect(await menu.evaluate((el) => el === document.activeElement), "Escape: focus is on the menu button")
        ;({ menu, drawer } = await openDrawer(page, scope, "tablet"))
        await page.keyboard.press("Enter")
        expect.equal(await drawer.count(), 0, "the close button: the drawer is gone")
        expect(await menu.evaluate((el) => el === document.activeElement), "the close button: focus is on the menu button")
      },
    },
    {
      name: "At 820 choosing a destination in the drawer closes it, and focus lands on main, never the page body",
      example: "tablet",
      async run({ page, scope, expect }) {
        await samePage(page)
        const { drawer } = await openDrawer(page, scope, "tablet")
        await drawer.getByRole("link", { name: "Invoices, 12 waiting on others" }).focus()
        await page.keyboard.press("Enter")
        await drawer.waitFor({ state: "detached" })
        const now = await active(page)
        expect(!now.body, "focus is not on the page body")
        expect.equal(now.id, "main-820", "focus is on main, where a route change puts it")
      },
    },
    {
      name: "At 820 the primary stays in the header: the bar at the foot belongs to the phone layout",
      example: "tablet",
      async run({ scope, expect }) {
        const tablet = shell(scope, "tablet")
        expect.equal(await tablet.locator('[data-slot="page-header-actions"]').getByRole("button", { name: "Approve 3" }).count(), 1, "the primary is in the header")
        expect(!(await tablet.locator('[data-slot="app-shell-foot"]').isVisible()), "nothing at the foot")
      },
    },
    {
      name: "Widening the shell to 1024px or more closes the drawer, and focus goes to main, never the page body",
      example: "tablet",
      async run({ page, scope, expect }) {
        const { drawer } = await openDrawer(page, scope, "tablet")
        await page.evaluate(() => (document.querySelector('[data-shell="tablet"]').style.width = "1100px"))
        await drawer.waitFor({ state: "detached", timeout: 5000 })
        expect.equal(await shell(scope, "tablet").locator('[data-slot="app-shell"]').getAttribute("data-layout"), "icons", "the shell is the icons layout now")
        expect(await page.waitForFunction(() => document.activeElement?.id === "main-820", null, { timeout: 3000 }).then(() => true, () => false), "focus is on main")
      },
    },
    {
      name: "At 390 the menu button opens the drawer from the keyboard, and the drawer takes focus on its close button",
      example: "phone",
      async run({ page, scope, expect }) {
        expect.equal(await shell(scope, "live").getByRole("button", { name: "Open navigation" }).getAttribute("aria-haspopup"), "dialog", "the menu button is named Open navigation and opens a dialog")
        const { menu, drawer } = await openDrawer(page, scope)
        expect.equal(await drawer.getAttribute("role"), "dialog", "a dialog")
        // The design's picture is hidden behind the open drawer, so only the live one is named.
        expect.equal(await page.getByRole("dialog", { name: "Navigation" }).count(), 1, "named Navigation")
        expect.equal(await menu.getAttribute("aria-expanded"), "true", "the menu button says it is open")
        const now = await active(page)
        expect.equal(now.name, "Close navigation", "focus is on Close navigation")
        expect(await drawer.getByRole("navigation", { name: "Main" }).isVisible(), "the rail's navigation is inside")
      },
    },
    {
      name: "The drawer keeps focus: Tab and Shift Tab stay inside, and the page behind is hidden from screen readers (round 2)",
      example: "phone",
      async run({ page, scope, expect }) {
        const { drawer } = await openDrawer(page, scope)
        const inside = () => drawer.evaluate((d) => d.contains(document.activeElement))
        for (let i = 0; i < 16; i++) {
          await page.keyboard.press("Tab")
          expect(await inside(), `focus is inside after Tab ${i + 1}`)
        }
        for (let i = 0; i < 4; i++) {
          await page.keyboard.press("Shift+Tab")
          expect(await inside(), `focus is inside after Shift Tab ${i + 1}`)
        }
        const hidden = await shell(scope, "live").locator('[data-slot="app-shell-main"]').evaluate((el) => Boolean(el.closest('[aria-hidden="true"], [inert]')))
        expect(hidden, "the page behind is hidden from screen readers")
      },
    },
    {
      name: "The drawer's first Escape closes it at once, with no tooltip inside to hold it, and focus is back on the menu button (round 3)",
      example: "phone",
      async run({ page, scope, expect }) {
        const { menu, drawer } = await openDrawer(page, scope)
        await page.keyboard.press("Tab")
        await page.waitForTimeout(400)
        expect.equal(await page.locator('[data-slot="tooltip-content"]').count(), 0, "no tooltip opened in the drawer")
        await page.keyboard.press("Escape")
        expect.equal(await drawer.count(), 0, "the drawer is gone straight away")
        expect(await menu.evaluate((el) => el === document.activeElement), "focus is on the menu button")
        expect.equal(await menu.getAttribute("aria-expanded"), "false", "which says it is closed")
      },
    },
    {
      name: "The close button closes the drawer, and focus is back on the menu button",
      example: "phone",
      async run({ page, scope, expect }) {
        const { menu, drawer } = await openDrawer(page, scope)
        await page.keyboard.press("Enter")
        expect.equal(await drawer.count(), 0, "the drawer is gone")
        expect(await menu.evaluate((el) => el === document.activeElement), "focus is on the menu button")
      },
    },
    {
      name: "Choosing a destination in the drawer closes it, and focus lands on main, never the page body",
      example: "phone",
      async run({ page, scope, expect }) {
        await samePage(page)
        const { drawer } = await openDrawer(page, scope)
        const link = drawer.getByRole("link", { name: "Bookings" })
        await link.focus()
        await page.keyboard.press("Enter")
        await drawer.waitFor({ state: "detached" })
        const now = await active(page)
        expect(!now.body, "focus is not on the page body")
        expect.equal(now.id, "main-390", "focus is on main, where a route change puts it")
      },
    },
    {
      name: "Widening from the phone to 820 leaves the drawer open, with focus inside it: both layouts use it",
      example: "phone",
      async run({ page, scope, expect }) {
        const { drawer } = await openDrawer(page, scope)
        await page.evaluate(() => (document.querySelector('[data-shell="live"]').style.width = "820px"))
        const at = shell(scope, "live").locator('[data-slot="app-shell"]')
        expect(await page.waitForFunction(() => document.querySelector('[data-shell="live"] [data-slot="app-shell"]')?.dataset.layout === "drawer", null, { timeout: 3000 }).then(() => true, () => false), "the shell is the drawer layout now")
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
        expect.equal(await drawer.count(), 1, "the drawer is still open")
        expect(await drawer.evaluate((d) => d.contains(document.activeElement)), "focus is still inside it")
        expect.equal(await at.getAttribute("data-layout"), "drawer", "and the layout held")
      },
    },
    {
      name: "A tap on the scrim closes the drawer, and focus is back on the menu button",
      example: "phone",
      touch: true,
      viewport: { width: 390, height: 844 },
      async run({ page, scope, expect }) {
        const { menu, drawer } = await openDrawer(page, scope)
        const box = await drawer.boundingBox()
        const inset = await drawer.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--shell-inset")) || 0)
        expect(Math.abs(box.x - inset) <= 1 && box.width <= 320 + 1, `the drawer comes in from the left, ${inset}px in like the rail, up to 320px wide (left ${box.x}, width ${box.width})`)
        await page.waitForTimeout(150)
        await page.touchscreen.tap(370, 420)
        await drawer.waitFor({ state: "detached" })
        expect(await menu.evaluate((el) => el === document.activeElement), "focus is on the menu button")
      },
    },
    {
      name: "On a touch screen the menu button and the drawer's close button are 44px",
      example: "phone",
      touch: true,
      async run({ page, scope, expect }) {
        const size = async (l) => {
          const b = await l.boundingBox()
          return `${Math.round(b.width)}x${Math.round(b.height)}`
        }
        expect.equal(await size(shell(scope, "live").getByRole("button", { name: "Open navigation" })), "44x44", "the menu button")
        const { drawer } = await openDrawer(page, scope)
        expect.equal(await size(drawer.getByRole("button", { name: "Close navigation" })), "44x44", "the close button")
      },
    },
    {
      name: "The open drawer takes the theme of the shell it opened from",
      example: "phone",
      themes: ["light", "dark"],
      async run({ page, scope, expect, theme }) {
        // The rail's colour in this theme, read inside the shell: a brand's rail can be navy in light.
        const rail = await scope.evaluate((el) => {
          const probe = document.createElement("div")
          probe.style.background = "var(--rail)"
          el.appendChild(probe)
          const colour = getComputedStyle(probe).backgroundColor
          probe.remove()
          return colour
        })
        const { drawer } = await openDrawer(page, scope)
        expect.equal(await drawer.evaluate((el) => getComputedStyle(el).backgroundColor), rail, `the drawer takes the ${theme} rail`)
      },
    },
    {
      name: "Under reduced motion the drawer fades in without sliding",
      example: "phone",
      reducedMotion: true,
      async run({ page, scope, expect }) {
        const { drawer } = await openDrawer(page, scope)
        const shift = await drawer.evaluate((el) => getComputedStyle(el).getPropertyValue("--tw-enter-translate-x").trim())
        expect(shift === "" || shift === "0" || shift === "0px", `no slide (${shift || "unset"})`)
      },
    },
    {
      name: "With motion, the drawer slides in from the left",
      example: "phone",
      async run({ page, scope, expect }) {
        const { drawer } = await openDrawer(page, scope)
        const shift = await drawer.evaluate((el) => getComputedStyle(el).getPropertyValue("--tw-enter-translate-x").trim())
        expect(shift !== "" && shift !== "0" && shift !== "0px", `it slides (${shift || "unset"})`)
      },
    },
    {
      name: "On a phone the primary moves to the bar at the foot, and nothing that takes focus in main hides behind it (round 3)",
      example: "phone",
      async run({ page, scope, expect }) {
        const live = shell(scope, "live")
        const bar = live.locator('[data-slot="app-shell-action-bar"]')
        expect.equal(await bar.getByRole("button", { name: "Approve 3" }).count(), 1, "the primary is in the bar")
        expect.equal(await live.getByRole("region", { name: "Page actions" }).count(), 1, "the bar is a landmark, so the primary is never outside one")
        expect.equal(await live.locator('[data-slot="page-header-actions"]').getByRole("button", { name: "Approve 3" }).count(), 0, "and not in the header")
        const top = (await bar.boundingBox()).y
        const main = live.locator('[data-slot="app-shell-main"]')
        const stops = await main.locator("a[href], button").all()
        expect.atLeast(stops.length, 6, "things to focus in main")
        for (const stop of stops) {
          await stop.focus()
          const b = await stop.boundingBox()
          expect(b.y + b.height <= top + 0.5, `${(await stop.textContent()).trim()} sits above the bar when it has focus`)
        }
      },
    },
    {
      name: "With a tab bar at the foot, the primary stays in the header",
      example: "phone",
      async run({ scope, expect }) {
        const tabs = shell(scope, "tabs")
        const bar = tabs.locator('[data-slot="phone-tab-bar"]')
        expect(await bar.isVisible(), "the tab bar is at the foot")
        expect.equal(await bar.getAttribute("aria-label"), "Main", "named as navigation")
        expect.equal(await tabs.locator('[data-slot="page-header-actions"]').getByRole("button", { name: "Approve 3" }).count(), 1, "the primary is in the header")
        expect.equal(await tabs.locator('[data-slot="app-shell-action-bar"]').count(), 0, "there is no action bar")
      },
    },
    {
      name: "In the phone layout controls take the touch sizes with a mouse too, and a wide shell keeps the desktop sizes",
      example: "phone",
      async run({ page, scope, expect }) {
        // A phone board on a canvas has a mouse, and drew 36px controls where a phone has 44px.
        const bar = shell(scope, "live").locator('[data-slot="app-shell-action-bar"]')
        expect.atLeast(await bar.getByRole("button").count(), 1, "the foot bar has its buttons")
        for (const b of await bar.getByRole("button").all()) expect.atLeast(Math.round((await b.boundingBox()).height), 44, "a foot-bar button at 390")
        const wide = page.locator('[data-shell="full"] [data-slot="page-header-actions"]').getByRole("button", { name: "Approve 3" })
        expect.equal(Math.round((await wide.boundingBox()).height), 36, "the same button in the 1440 shell")
      },
    },
    {
      name: "The drawer drawn for a design takes no Escape and adds no tab stop or focus guard",
      example: "phone",
      async run({ page, scope, expect }) {
        const open = shell(scope, "open")
        expect(await open.getByRole("dialog", { name: "Navigation" }).isVisible(), "the drawer shows open, in place")
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
      name: "main is the one region route focus moves to: a unique id, focusable from script only",
      async run({ page, expect }) {
        for (const id of ["main-1440", "main-1100", "main-820", "main-390", "main-390-tabs", "main-390-open"]) {
          expect.equal(await page.locator(`[id="${id}"]`).count(), 1, `one ${id}`)
          const [tag, tabindex] = await page.locator(`[id="${id}"]`).evaluate((el) => [el.tagName, el.getAttribute("tabindex")])
          expect.equal(`${tag} ${tabindex}`, "MAIN -1", `${id} is main, focusable from script only`)
        }
      },
    },
    {
      name: "In forced colours the current page in the rail stays outlined",
      example: "full",
      forcedColors: true,
      async run({ scope, expect }) {
        const current = scope.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Approvals, 3 need you" })
        expect.equal(await current.evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "the current page's outline")
      },
    },
  ],
}
