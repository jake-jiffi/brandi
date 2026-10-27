// PhoneTopBar's one definition: its README, its preview board and its scripted checks all come from here.

const probe = (el, prop, value) => {
  const p = document.createElement("span")
  p.style[prop] = value
  el.appendChild(p)
  const want = getComputedStyle(p)[prop]
  p.remove()
  return want
}
const phone = (inner) => `<div style="width: 390px;" class="outline outline-line">${inner}</div>`
const LONG = "[Invoice 1042 for the March grooming package and the late fee]"

export default {
  name: "PhoneTopBar",
  group: "Navigation",
  job: "A phone screen's top bar: the menu button and the lockup, or Back and the screen's title.",
  status: "to build",
  props: [
    { name: "title", type: "string", doc: "The screen's title, for a detail screen. One line, cut with an ellipsis; the page's heading below carries it whole." },
    { name: "back", type: "{ href: string, label: string }", doc: "Back to the screen above, where label names it: [Invoices]. Read as Back to [Invoices]." },
    { name: "onMenu", type: "() => void", doc: "Shows the menu button, which opens the navigation drawer. AppShell passes it." },
    { name: "menuExpanded", type: "boolean", default: "false", doc: "Whether the drawer the menu button opens is open." },
    { name: "menuRef", type: "Ref<HTMLButtonElement>", doc: "The menu button, so focus can come back to it when the drawer closes." },
    { name: "product", type: "string", default: "the name in lib/product.ts", doc: "The product's name for the lockup, shown when there is no title." },
    { name: "home", type: "string", doc: "Where the lockup links. Without it the lockup is not a link." },
    { name: "actions", type: "ReactNode", doc: "Icon buttons at the far end, one or two. Built in the board's script on a canvas." },
  ],
  notes: {
    Behaviour: [
      'The menu button is named Open navigation, says it opens a dialog (aria-haspopup="dialog") and whether it is open (aria-expanded). It has no tooltip: one left open as the drawer takes focus would hold the drawer\'s first Escape.',
      "Back is a link named Back to [the screen above], through the system's link. From the focus model: after it navigates, focus moves to the new screen's main.",
    ],
    Layout: [
      "56px tall on the rail's own colours, with a hairline under it: on a phone it does the rail's job. The menu button and Back are 36px, 44px on a touch screen.",
      "A title takes one line and is cut with an ellipsis. It repeats the page's heading, which carries it whole, so nothing is lost; give the screen a PageHeader under it.",
    ],
    Rules: [
      "From AppShell: under 640px, list and detail become two screens. The list's bar holds the menu button and the lockup; a detail screen's bar holds Back and its title, with AppShell's topBar.",
      "One or two actions at most at the far end, each an IconButton.",
    ],
  },
  frame: { width: 960, height: 560 },
  examples: [
    {
      id: "menu",
      title: "The menu button and the lockup",
      markup: phone(`<x-import component-from-global-scope="NS.PhoneTopBar" product="[Front desk]" home="#home" on-menu="{{openMenu}}" menu-expanded="{{menuOpen}}"></x-import>`),
      layout: "block",
    },
    {
      id: "detail",
      title: "A detail screen: Back and its title, with an action",
      markup: phone(`<x-import component-from-global-scope="NS.PhoneTopBar" title="[Invoice 1042]" back="{{back}}" actions="{{ui.more}}"></x-import>`),
      layout: "block",
      vals: { back: { href: "#invoices", label: "[Invoices]" } },
    },
    {
      id: "long",
      title: "A long title is cut on one line",
      markup: phone(`<x-import component-from-global-scope="NS.PhoneTopBar" title="${LONG}" back="{{back}}"></x-import>`),
      layout: "block",
    },
  ],
  state: { menuOpen: false },
  logic: `menuOpen: self.state.menuOpen,
  openMenu: () => self.setState((s) => ({ menuOpen: !s.menuOpen })),
  ui: { more: React.createElement(NS.Menu, { label: "More actions for [Invoice 1042]", items: [{ label: "Download PDF", icon: "Download" }, { label: "Duplicate", icon: "Copy" }] }) }`,
  checks: [
    {
      name: "The menu button is named Open navigation, says it opens a dialog, and says whether it is open",
      example: "menu",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "Open navigation" })
        expect.equal(await button.getAttribute("aria-haspopup"), "dialog", "it opens a dialog")
        expect.equal(await button.getAttribute("aria-expanded"), "false", "closed")
        await button.focus()
        await page.keyboard.press("Enter")
        expect.equal(await button.getAttribute("aria-expanded"), "true", "onMenu ran, and it says it is open")
        expect.equal(await page.locator('[data-slot="tooltip-content"]').count(), 0, "no tooltip")
      },
    },
    {
      name: "The lockup is one link, named for the brand and the product",
      example: "menu",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "Product [Front desk]" }).count(), 1, "the lockup's link")
      },
    },
    {
      name: "Back is a link named Back to the screen above, with its href",
      example: "detail",
      async run({ scope, expect }) {
        const back = scope.getByRole("link", { name: "Back to [Invoices]" })
        expect.equal(await back.count(), 1, "Back to [Invoices]")
        expect.equal(await back.getAttribute("href"), "#invoices", "it keeps its href")
        expect.equal(await scope.getByRole("button", { name: "Open navigation" }).count(), 0, "no menu button beside Back")
        expect.equal((await scope.locator('[data-slot="phone-top-bar-title"]').textContent()).trim(), "[Invoice 1042]", "the title shows")
      },
    },
    {
      name: "A long title is cut on one line with an ellipsis, and its text stays whole",
      example: "long",
      async run({ scope, expect }) {
        const title = scope.locator('[data-slot="phone-top-bar-title"]')
        const [cut, overflow, text] = await title.evaluate((el) => [el.scrollWidth > el.clientWidth, getComputedStyle(el).textOverflow, el.textContent])
        expect(cut, "the title is cut")
        expect.equal(overflow, "ellipsis", "with an ellipsis")
        expect.equal(text, LONG, "its text is whole")
        const bar = await scope.locator('[data-slot="phone-top-bar"]').boundingBox()
        const box = await title.boundingBox()
        expect(box.x + box.width <= bar.x + bar.width, "nothing overflows the bar")
      },
    },
    {
      name: "On a touch screen the menu button and Back are 44px",
      example: "menu",
      touch: true,
      async run({ page, scope, expect }) {
        const size = async (l) => {
          const b = await l.boundingBox()
          return `${Math.round(b.width)}x${Math.round(b.height)}`
        }
        expect.equal(await size(scope.getByRole("button", { name: "Open navigation" })), "44x44", "the menu button")
        expect.equal(await size(page.locator("[data-example=detail]").getByRole("link", { name: "Back to [Invoices]" })), "44x44", "Back")
      },
    },
    {
      name: "Focus on the bar is drawn in rail-focus, in both themes",
      example: "menu",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const button = scope.getByRole("button", { name: "Open navigation" })
        const [focused, style, colour, want] = await button.evaluate((el, p) => {
          const f = new Function(`return (${p})`)()
          return [el === document.activeElement, getComputedStyle(el).outlineStyle, getComputedStyle(el).outlineColor, f(el, "color", "var(--rail-focus)")]
        }, probe.toString())
        expect(focused, "the first Tab lands on the menu button")
        expect.equal(style, "solid", "a focus ring from the keyboard")
        expect.equal(colour, want, "in rail-focus")
      },
    },
  ],
}
