// WorkspaceSwitcher's one definition: its README, its preview board and its scripted checks all come from here.

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
const luminance = (rgb) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).map(Number)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}
// The item in hand is the focused menu item; Radix moves focus in a timeout, so wait for it.
const inHand = (page, label) =>
  page
    .waitForFunction(
      (want) => {
        const el = document.activeElement
        return Boolean(el?.getAttribute("role")?.startsWith("menuitem")) && el.querySelector("[data-slot=menu-action-label]")?.textContent === want
      },
      label,
      { timeout: 5000 }
    )
    .then(() => true, () => false)

const user = { name: "[Sam Lee]", role: "Owner" }
const workspaces = [
  { value: "muddy-paws", name: "[Muddy Paws Grooming]", role: "Owner" },
  { value: "northside", name: "[Northside Paws]", role: "Manager" },
  { value: "bark-avenue", name: "[Bark Avenue Spa]", role: "Staff" },
]
const TRIGGER = "[Sam Lee], [Muddy Paws Grooming], Owner, account menu"
const groups = [{ items: [{ label: "Home", href: "#home", icon: "House" }, { label: "Bookings", href: "#bookings", icon: "Calendar", current: true }] }]
// A short rail with room above it, so the menu opens upward as it does at the foot of a full-height rail.
const rail = (account) =>
  `<div style="padding-top: 150px;"><x-import component-from-global-scope="NS.Sidebar" style="display: block; width: 256px;" auto-height="{{yes}}" product="[Front desk]" groups="{{groups}}" account="${account}"></x-import></div>`

export default {
  name: "WorkspaceSwitcher",
  group: "Navigation",
  job: "Choosing the account, workspace or client someone is working in, from the account button.",
  status: "to build",
  props: [
    { name: "user", type: "{ name: string, role?: string, src?: string }", doc: "The signed-in person: the account button shows them." },
    { name: "workspaces", type: "Array<{ value: string, name: string, role?: string }>", doc: "Every workspace the person can switch to, the current one included. role is theirs there, shown under its name." },
    { name: "value", type: "string", doc: "The current workspace's value. It shows on the account button." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the chosen workspace's value. The product switches, then sets value." },
    { name: "items", type: "MenuEntry[]", doc: "More of the account menu after a separator: settings, help, sign out. As Menu's items." },
    { name: "label", type: "string", default: '"Workspaces"', doc: "The workspaces' group label in the menu." },
    { name: "open", type: "boolean", default: "false", doc: "Shows the menu open, for a design on a canvas: a still picture with no live layer, so the board keeps its Escape key and its tab order." },
  ],
  notes: {
    Behaviour: [
      'From Sidebar: it opens from the account button, named "[name], [workspace], [role], account menu": the two lines it shows come first, then the person\'s role there.',
      "From Menu: the menu opens in a portal and flips to stay on screen. From the keyboard focus moves to the first workspace; Up, Down, Home and End move, and Enter chooses. Escape closes it at once and focus is back on the account button.",
      "The current workspace carries a check. Choosing another calls onChange, focus goes back to the account button, which now shows the new workspace, and a polite status says where the person is now: Now in [workspace]. Never for the workspace the page loads in.",
      "On the icons-only rail the account button is the avatar alone, with the person and the workspace as its tooltip, and the menu opens beside the rail.",
    ],
    Layout: [
      "At the foot of the rail the menu opens above the button, lined up with its left edge; outside a rail, below it. It is at least as wide as the button.",
      "The name and the workspace wrap rather than cut short, and the button grows past 48px to hold them, so they read whole under WCAG 1.4.12 text spacing.",
    ],
    Review: ["Under WCAG 1.4.12 text spacing the account button cut the person's name short, readable whole only in its accessible name (a pilot's round 1)."],
    Rules: [
      "(practice) The current workspace shows on every screen where the rail does. Under 1024px of shell it is in the drawer, so name the workspace on the page when it matters there.",
      "Workspaces first, then the account's own actions after a separator, with sign out last.",
    ],
    Open: ["Under 1024px of shell the current workspace shows only with the drawer open. A product whose people switch often should name it on the page as well."],
  },
  frame: { width: 960, height: 1260 },
  examples: [
    {
      id: "rail",
      title: "At the foot of the rail",
      markup: `${rail("{{ui.railAccount}}")}
<p style="margin: 12px 0 0; color: var(--text-muted);" data-switcher-output="">In the product: {{ws}}</p>`,
      layout: "block",
      vals: { yes: true, groups },
    },
    {
      id: "open",
      title: "Open, drawn for a design, below the button where nothing is under it",
      markup: `<div style="padding-bottom: 300px;"><div style="box-sizing: border-box; width: 256px;" class="@container/rail rounded-lg border border-rail-line bg-rail p-2"><x-import component-from-global-scope="NS.WorkspaceSwitcher" open="{{yes}}" user="{{user}}" workspaces="{{workspaces}}" value="bark-avenue" items="{{accountItems}}"></x-import></div></div>`,
      layout: "block",
      vals: { user, workspaces, accountItems: [{ label: "Account settings", icon: "Settings" }, { label: "Sign out", icon: "LogOut" }] },
    },
    {
      id: "icons",
      title: "On the icons-only rail",
      markup: `<x-import component-from-global-scope="NS.Sidebar" style="display: block;" collapsed="{{yes}}" auto-height="{{yes}}" product="[Front desk]" groups="{{groups}}" account="{{ui.collapsedAccount}}"></x-import>`,
      layout: "block",
    },
  ],
  state: { ws: "muddy-paws" },
  logic: `ws: self.state.ws,
  ui: (() => {
    const h = React.createElement;
    const items = [{ label: "Account settings", icon: "Settings" }, { label: "Sign out", icon: "LogOut" }];
    const base = { user: ${JSON.stringify(user)}, workspaces: ${JSON.stringify(workspaces)}, items };
    return {
      railAccount: h(NS.WorkspaceSwitcher, { ...base, value: self.state.ws, onChange: (ws) => self.setState({ ws }) }),
      collapsedAccount: h(NS.WorkspaceSwitcher, { ...base, value: "northside" }),
    };
  })()`,
  checks: [
    {
      name: "Under WCAG 1.4.12 text spacing the name and the workspace wrap and read whole, never cut",
      example: "rail",
      async run({ page, scope, expect }) {
        // The spacing the success criterion asks text to survive.
        await page.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }" })
        const button = scope.getByRole("button", { name: TRIGGER })
        const lines = await button.locator(":scope > span:not([data-slot]) > span").all()
        expect.equal(lines.length, 2, "the name and the workspace")
        for (const line of lines) {
          const [cut, text] = await line.evaluate((el) => [el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1, el.textContent])
          expect(!cut, `"${text}" reads whole`)
        }
        const [inner, outer] = await button.evaluate((el) => [el.scrollHeight, el.clientHeight])
        expect(inner <= outer + 1, "the button grows to hold the lines")
      },
    },
    {
      name: "The account button is named [name], [workspace], [role], account menu, and shows the current workspace",
      example: "rail",
      async run({ scope, expect }) {
        const button = scope.getByRole("button", { name: TRIGGER })
        expect.equal(await button.count(), 1, "the account button's name")
        expect.equal(await button.getAttribute("aria-haspopup"), "menu", "it opens a menu")
        expect((await button.innerText()).includes("[Muddy Paws Grooming]"), "it shows the current workspace")
      },
    },
    {
      name: "From the keyboard: Enter opens on the current workspace's group, arrows move, Enter switches, and focus returns to the account button",
      example: "rail",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: TRIGGER })
        await button.focus()
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: TRIGGER })
        await ready(menu)
        expect(await inHand(page, "[Muddy Paws Grooming]"), "the first workspace is in hand")
        expect.equal(await menu.getByRole("menuitemcheckbox", { name: "[Muddy Paws Grooming]" }).getAttribute("aria-checked"), "true", "the current workspace is checked")
        await page.keyboard.press("ArrowDown")
        expect(await inHand(page, "[Northside Paws]"), "Down moves to the next workspace")
        await page.keyboard.press("Enter")
        await menu.waitFor({ state: "hidden" })
        expect.equal(await scope.locator("[data-switcher-output]").textContent(), "In the product: northside", "onChange switched the workspace")
        const now = scope.getByRole("button", { name: "[Sam Lee], [Northside Paws], Manager, account menu" })
        expect(await now.evaluate((el) => el === document.activeElement), "focus is back on the account button, which names the new workspace")
        // The status speaks after the switch has rendered, a beat later.
        const status = scope.getByRole("status")
        await status.evaluate((el) => new Promise((done) => {
          const start = Date.now()
          const look = () => (el.textContent.trim() || Date.now() - start > 2000 ? done() : setTimeout(look, 25))
          look()
        }))
        expect.equal((await status.textContent()).trim(), "Now in [Northside Paws]", "a polite status says where the person is now")
      },
    },
    {
      name: "The status is quiet for the workspace the page loads in",
      example: "rail",
      async run({ scope, expect }) {
        expect.equal((await scope.getByRole("status").textContent()).trim(), "", "nothing is said on load")
      },
    },
    {
      name: "End reaches sign out, and Escape closes the menu at once with focus on the account button",
      example: "rail",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: TRIGGER })
        await button.focus()
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: TRIGGER })
        await ready(menu)
        await page.keyboard.press("End")
        expect(await inHand(page, "Sign out"), "End moves to Sign out")
        await page.keyboard.press("Escape")
        expect.equal(await menu.count(), 0, "the menu is gone straight away")
        expect(await button.evaluate((el) => el === document.activeElement), "focus is on the account button")
      },
    },
    {
      name: "At the foot of the rail the menu opens above the button, at least as wide",
      example: "rail",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: TRIGGER })
        // Measured before it opens: an open menu hides the rest of the page from the accessibility tree.
        const b = await button.boundingBox()
        await button.click()
        const menu = page.getByRole("menu", { name: TRIGGER })
        await ready(menu)
        const m = await menu.boundingBox()
        expect(m.y + m.height <= b.y + 1, "the menu is above the button")
        expect(m.width >= b.width - 1, "at least as wide as the button")
        expect.equal(await menu.getAttribute("data-side"), "top", "it opened on top")
      },
    },
    {
      name: "The open menu takes the theme of the rail, in both themes",
      example: "rail",
      themes: ["light", "dark"],
      async run({ page, scope, expect, theme }) {
        const button = scope.getByRole("button", { name: TRIGGER })
        await button.focus()
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: TRIGGER })
        await ready(menu)
        const l = luminance(await menu.evaluate((el) => getComputedStyle(el).backgroundColor))
        expect(theme === "dark" ? l < 0.25 : l > 0.85, `the menu is ${theme} (luminance ${l.toFixed(2)})`)
      },
    },
    {
      name: "On a touch screen the account button is 44px tall at least",
      example: "rail",
      touch: true,
      async run({ scope, expect }) {
        expect.atLeast(Math.round((await scope.getByRole("button", { name: TRIGGER }).boundingBox()).height), 44, "the account button's height")
      },
    },
    {
      name: "Open for a design, it is a still picture: no focus guard, no swallowed Escape, no hidden tab stop",
      example: "open",
      async run({ page, scope, expect }) {
        expect(await scope.getByRole("menu").isVisible(), "the menu shows open, in place")
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards")
        await page.evaluate(() => {
          window.__escape = "not pressed"
          document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.__escape = e.defaultPrevented ? "swallowed" : "free" })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escape), "free", "Escape reaches the page")
      },
    },
    {
      name: "On the icons-only rail the account button is the avatar, with a tooltip, and the menu opens beside the rail",
      example: "icons",
      async run({ page, scope, expect }) {
        const name = "[Sam Lee], [Northside Paws], Manager, account menu"
        const button = scope.getByRole("button", { name })
        const box = await button.boundingBox()
        expect.equal(`${Math.round(box.width)}x${Math.round(box.height)}`, "40x40", "the avatar alone")
        await inView(page, button)
        await button.focus()
        const tip = page.locator('[data-slot="tooltip-content"]:not([data-example] *)').filter({ hasText: "[Sam Lee], [Northside Paws]" })
        expect(await tip.waitFor({ state: "visible", timeout: 3000 }).then(() => true, () => false), "the tooltip names the person and the workspace")
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name })
        await ready(menu)
        expect.equal(await menu.getAttribute("data-side"), "right", "the menu opens beside the rail")
        await page.keyboard.press("Escape")
        expect(await button.evaluate((el) => el === document.activeElement), "Escape takes focus back to the avatar")
      },
    },
  ],
}
