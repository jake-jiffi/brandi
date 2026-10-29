// Sidebar's one definition: its README, its preview board and its scripted checks all come from here.

const probe = (el, prop, value) => {
  const p = document.createElement("span")
  p.style[prop] = value
  el.appendChild(p)
  const want = getComputedStyle(p)[prop]
  p.remove()
  return want
}
// A tooltip a person opened, in its portal, by its words.
// Brings an element into view before it takes focus: focus that scrolls the page closes a tooltip as it opens.
const inView = async (page, locator) => {
  await locator.scrollIntoViewIfNeeded()
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}
const floating = (page, words) => page.locator('[data-slot="tooltip-content"]:not([data-example] *)').filter({ hasText: words })

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
const user = { name: "[Sam Lee]", role: "Owner" }
const ACCOUNT = "[Sam Lee], Owner, account menu"

export default {
  name: "Sidebar",
  group: "Navigation",
  job: "The rail: the product lockup, search or ask, the navigation groups and the signed-in person.",
  status: "proven",
  props: [
    { name: "product", type: "string", default: "the name in lib/product.ts", doc: "The product's name for the lockup at the top." },
    { name: "home", type: "string", doc: "Where the lockup links. Without it the lockup is not a link." },
    { name: "collapsed", type: "boolean", default: "false", doc: "Icons only, 72px wide, with the labels as tooltips. Inside AppShell the shell's width decides." },
    { name: "search", type: "string | false", default: '"Search or ask"', doc: "The search or ask button's label, or false for none. It shows when onSearch is set." },
    { name: "shortcut", type: "string", default: '"⌘K"', doc: "The key hint, in its Mac form; Ctrl K elsewhere. Command K or Control K runs onSearch from anywhere. An empty string turns both off." },
    { name: "onSearch", type: "() => void", doc: "Opens the command menu." },
    { name: "user", type: "{ name: string, role?: string, src?: string }", doc: "The signed-in person, at the foot." },
    { name: "onUser", type: "() => void", doc: "Pressing the account button. Without it the person shows, and nothing is pressable." },
    { name: "account", type: "ReactNode", doc: "Replaces the account button: a WorkspaceSwitcher. Built in the board's script on a canvas." },
    { name: "groups", type: "NavGroupProps[]", doc: "The navigation as data, for a canvas: each is a NavGroup's props, with its items." },
    { name: "footer", type: "NavItemProps[] | ReactNode", doc: "Settings and help, above the account." },
    { name: "autoHeight", type: "boolean", default: "false", doc: "Its height follows its contents instead of filling its container." },
    { name: "label", type: "string", default: '"Main"', doc: "Names the navigation landmark." },
    { name: "children", type: "ReactNode", doc: "NavGroups, when they are not given as groups." },
  ],
  notes: {
    Behaviour: [
      "One nav landmark named Main holds all of it: the lockup, search, the groups, the footer and the account button.",
      'The account button is named "[name], [role], account menu". Without onUser the person shows and nothing is pressable.',
      "Command K or Control K runs onSearch from anywhere, while typing too. The hint shows the right key for the device and hides on touch; a screen reader hears the shortcut from aria-keyshortcuts, not as part of the button's name.",
      "Icons only, the labels stay for screen readers and show as tooltips on hover, keyboard focus and a long press. The tooltips mount only then: a tooltip left mounted while hidden holds the next Escape.",
    ],
    Layout: [
      "In the brand's shell form: against the window edge, square, with a hairline on its inner side, or floating 8px in with the rail's corners and a hairline all round when the brand floats its panels.",
      "The groups scroll between the top and the foot, and focus is drawn inside the items there. The footer and the account stay put.",
      "Icons only, it is 72px wide: the lockup becomes the brand's symbol in the rail's rendition (a Home control for a brand with no symbol, whose full logo is too wide at its minimum), search an icon button, the items 40px squares and the account its avatar. It switches by its own width, so the server and a canvas draw it right before any script runs.",
    ],
    Rules: [
      "Eight top-level items at most, in groups under short uppercase labels, with settings and help in the footer.",
      "Only rail-* tokens and the highlight count live on the rail, and focus there uses rail-focus. Whether the rail carries the brand is a brand-to-product decision; without one it is a quiet surface.",
    ],
    Review: ["An invisible tooltip swallowed Escape in the drawer (round 3): tooltips mount only on the icons-only rail."],
    Accepted: ["Icons only from 1024 to 1279px of shell, with the labels as tooltips. Full labels at that width take a fifth of a laptop screen from the work."],
  },
  frame: { width: 960, height: 1720 },
  examples: [
    {
      id: "rail",
      title: "The full rail",
      markup: `<x-import component-from-global-scope="NS.Sidebar" style="display: block; width: 256px; height: 620px;" product="[Front desk]" home="#home" groups="{{groups}}" footer="{{footer}}" user="{{user}}" on-user="{{openAccount}}" on-search="{{openSearch}}"></x-import>
<p style="margin: 0; color: var(--text-muted);" data-sidebar-output="">Search opened {{searches}} times. Account opened {{accounts}} times.</p>`,
      layout: "stack",
      vals: { groups, footer, user },
    },
    {
      id: "collapsed",
      title: "Icons only, with the labels as tooltips",
      markup: `<x-import component-from-global-scope="NS.Sidebar" style="display: block; height: 620px;" collapsed="{{yes}}" product="[Front desk]" home="#home" groups="{{groups}}" footer="{{footer}}" user="{{user}}" on-user="{{noop}}" on-search="{{noop}}"></x-import>`,
      vals: { yes: true },
    },
    {
      id: "quiet",
      title: "Without search, with the person not pressable, as tall as its contents",
      markup: `<x-import component-from-global-scope="NS.Sidebar" style="display: block; width: 256px;" auto-height="{{yes}}" product="[Front desk]" groups="{{quietGroups}}" user="{{user}}"></x-import>`,
      vals: { quietGroups: [{ items: [{ label: "Home", href: "#home", icon: "House", current: true }, { label: "Bookings", href: "#bookings", icon: "Calendar" }] }] },
    },
  ],
  state: { searches: 0, accounts: 0 },
  logic: `searches: self.state.searches,
  accounts: self.state.accounts,
  openSearch: () => self.setState((s) => ({ searches: s.searches + 1 })),
  openAccount: () => self.setState((s) => ({ accounts: s.accounts + 1 })),
  noop: () => undefined`,
  checks: [
    {
      name: "A control put on the rail draws in the rail's colours, so it reads on a dark rail, in both themes",
      example: "rail",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        // A ghost button in the page's ink sat close to invisible on a dark rail.
        const [inked, rail] = await scope.locator('[data-slot="sidebar"]').first().evaluate((el) => {
          const probe = document.createElement("span")
          probe.className = "text-text-strong"
          const ref = document.createElement("span")
          ref.style.color = "var(--rail-text-strong)"
          el.append(probe, ref)
          const out = [getComputedStyle(probe).color, getComputedStyle(ref).color]
          probe.remove()
          ref.remove()
          return out
        })
        expect.equal(inked, rail, "text-strong inside the rail is the rail's strong text")
      },
    },
    {
      name: "One nav landmark named Main holds the lockup, search, the groups, the footer and the account button",
      example: "rail",
      async run({ scope, expect, brand }) {
        const nav = scope.getByRole("navigation", { name: "Main" })
        expect.equal(await nav.count(), 1, "a nav named Main")
        expect.equal(await nav.getByRole("link", { name: `${brand.name} [Front desk]` }).count(), 1, "the lockup, as one link")
        expect.equal(await nav.getByRole("button", { name: "Search or ask", exact: true }).count(), 1, "the search button")
        expect.equal(await nav.getByRole("list", { name: "Work" }).count(), 1, "the Work group")
        expect.equal(await nav.getByRole("link", { name: "Settings" }).count(), 1, "the footer")
        expect.equal(await nav.getByRole("button", { name: ACCOUNT }).count(), 1, "the account button")
      },
    },
    {
      name: "The account button is named [name], [role], account menu, and pressing it calls onUser",
      example: "rail",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: ACCOUNT })
        await button.focus()
        await page.keyboard.press("Enter")
        expect.equal(await scope.locator("[data-sidebar-output]").textContent(), "Search opened 0 times. Account opened 1 times.", "onUser ran")
      },
    },
    {
      name: "Command K or Control K runs onSearch from anywhere, while typing in a field too",
      example: "rail",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Meta+k")
        await page.keyboard.press("Control+k")
        await page.evaluate(() => {
          const field = document.createElement("input")
          field.setAttribute("aria-label", "A field")
          document.body.appendChild(field)
          field.focus()
        })
        await page.keyboard.press("Control+k")
        expect.equal(await scope.locator("[data-sidebar-output]").textContent(), "Search opened 3 times. Account opened 0 times.", "each press ran onSearch once")
      },
    },
    {
      name: "The search button is named by its label, with the shortcut in aria-keyshortcuts and the hint on show",
      example: "rail",
      async run({ scope, expect }) {
        const button = scope.getByRole("button", { name: "Search or ask", exact: true })
        expect.equal(await button.getAttribute("aria-keyshortcuts"), "Meta+K Control+K", "the shortcut for a screen reader")
        expect(await button.locator("kbd").isVisible(), "the key hint shows")
      },
    },
    {
      name: "On the full rail no tooltip is mounted, so none can hold an Escape (round 3)",
      example: "rail",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Search or ask", exact: true }).focus()
        await scope.getByRole("link", { name: "Bookings" }).focus()
        await page.waitForTimeout(400)
        expect.equal(await page.locator('[data-slot="tooltip-content"]').count(), 0, "no tooltip opened")
        await page.evaluate(() => {
          window.__escape = "not pressed"
          document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.__escape = e.defaultPrevented ? "swallowed" : "free" })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escape), "free", "Escape reaches the page")
      },
    },
    {
      name: "Icons only, it is 72px wide: the symbol, a search icon, 40px items and the avatar",
      example: "collapsed",
      async run({ scope, expect, brand }) {
        const nav = scope.getByRole("navigation", { name: "Main" })
        expect.equal(Math.round((await nav.boundingBox()).width), 72, "72px wide")
        expect.equal(await nav.getAttribute("data-collapsed"), "true", "it says it is collapsed")
        expect.equal(await nav.locator('[data-slot="product-lockup"]').isVisible(), false, "the lockup gives way")
        const homeLink = nav.getByRole("link", { name: `${brand.name} [Front desk]` })
        if (brand.symbol) {
          expect(await homeLink.isVisible(), "to the symbol, still one link with the same name")
          // A full logo has a minimum width, and a brand with no symbol once had it cut by the window edge here.
          const home = await homeLink.evaluate((el) => {
            const box = el.getBoundingClientRect(), mark = el.firstElementChild.getBoundingClientRect(), rail = el.closest('[data-slot="sidebar"]').getBoundingClientRect()
            return { link: [box.width, box.height].map(Math.round).join("x"), inside: mark.left >= rail.left - 0.5 && mark.right <= rail.right + 0.5 && mark.left >= box.left - 0.5 && mark.right <= box.right + 0.5 }
          })
          expect.equal(home.link, "40x40", "home is a 40px square, so its focus ring goes round what it holds")
          expect(home.inside, "what home holds fits inside it and inside the rail")
        } else {
          // No symbol, and the navigation already goes Home: a second house above it would only repeat it.
          expect.equal(await homeLink.count(), 0, "no logo cut by the edge, and no second Home")
        }
        const search = await nav.getByRole("button", { name: "Search or ask", exact: true }).boundingBox()
        expect.equal(`${Math.round(search.width)}x${Math.round(search.height)}`, "40x40", "search is a 40px icon button")
        for (const link of await nav.getByRole("list").getByRole("link").all()) {
          const box = await link.boundingBox()
          expect.equal(`${Math.round(box.width)}x${Math.round(box.height)}`, "40x40", "each item is a 40px square")
        }
        const account = await nav.getByRole("button", { name: ACCOUNT }).boundingBox()
        expect.equal(`${Math.round(account.width)}x${Math.round(account.height)}`, "40x40", "the account is its avatar")
      },
    },
    {
      name: "Icons only, every label stays in its name and shows as a tooltip on keyboard focus",
      example: "collapsed",
      async run({ page, scope, expect }) {
        const nav = scope.getByRole("navigation", { name: "Main" })
        const names = ["Search or ask", "Home", "Inbox, 2 need you", "Approvals, 3 need you", "Bookings", "Invoices, 12 waiting on others", "Clients", "Reports", "Settings", "Help", "[Sam Lee]"]
        for (const words of names) {
          const target = words === "Search or ask" ? nav.getByRole("button", { name: words, exact: true }) : words === "[Sam Lee]" ? nav.getByRole("button", { name: ACCOUNT }) : nav.getByRole("link", { name: words, exact: true })
          expect.equal(await target.count(), 1, `${words} is named`)
          await inView(page, target)
          await target.focus()
          expect(await floating(page, words).waitFor({ state: "visible", timeout: 3000 }).then(() => true, () => false), `${words} shows as a tooltip`)
        }
      },
    },
    {
      name: "Icons only, a tooltip shows on hover too, and Escape closes it",
      example: "collapsed",
      async run({ page, scope, expect }) {
        await scope.getByRole("link", { name: "Bookings" }).hover()
        const tip = floating(page, "Bookings")
        await tip.waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.press("Escape")
        await tip.waitFor({ state: "hidden", timeout: 3000 })
        expect(true, "closed")
      },
    },
    {
      name: "Focus on the rail is drawn in rail-focus, in both themes",
      example: "rail",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "Search or ask", exact: true })
        for (let i = 0; i < 6 && !(await button.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab")
        const [style, colour, want] = await button.evaluate((el, p) => {
          const f = new Function(`return (${p})`)()
          return [getComputedStyle(el).outlineStyle, getComputedStyle(el).outlineColor, f(el, "color", "var(--rail-focus)")]
        }, probe.toString())
        expect.equal(style, "solid", "a focus ring from the keyboard")
        expect.equal(colour, want, "in rail-focus")
      },
    },
    {
      name: "On a touch screen search, the items and the account button are 44px tall at least",
      example: "rail",
      touch: true,
      async run({ scope, expect }) {
        expect.atLeast(Math.round((await scope.getByRole("button", { name: "Search or ask", exact: true }).boundingBox()).height), 44, "search")
        for (const link of await scope.getByRole("list").getByRole("link").all()) expect.atLeast(Math.round((await link.boundingBox()).height), 44, "an item")
        expect.atLeast(Math.round((await scope.getByRole("button", { name: ACCOUNT }).boundingBox()).height), 44, "the account button")
      },
    },
    {
      name: "Without onUser the person shows, and nothing is pressable; autoHeight follows the contents",
      example: "quiet",
      async run({ scope, expect }) {
        const nav = scope.getByRole("navigation", { name: "Main" })
        expect.equal(await nav.getByRole("button").count(), 0, "no buttons: no search and no account button")
        expect(await nav.getByText("[Sam Lee]", { exact: true }).isVisible(), "the person shows, by name")
        expect.equal(await nav.getByRole("img", { name: "[Sam Lee]" }).count(), 0, "and the avatar beside the name is not read as well")
        const [navBox, last] = await Promise.all([nav.boundingBox(), nav.locator('[data-slot="sidebar-account"]').boundingBox()])
        expect(Math.abs(navBox.y + navBox.height - (last.y + last.height)) <= 2, "the rail ends at its last part")
      },
    },
    {
      name: "In forced colours the current page stays outlined",
      example: "rail",
      forcedColors: true,
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "Approvals, 3 need you" }).evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "the current page's outline")
      },
    },
  ],
}
