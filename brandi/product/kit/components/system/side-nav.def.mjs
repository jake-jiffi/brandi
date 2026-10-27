// SideNav's one definition: its README, its preview board and its scripted checks all come from here.

const sections = ["Profile", "Notifications", "Billing", "Security", "Integrations"]

export default {
  name: "SideNav",
  group: "Navigation",
  job: "In-page navigation for settings and long documents.",
  status: "proven",
  props: [
    { name: "items", type: "Array<string | { label: string; href: string; icon?: IconName }>", doc: "A string links to #its-slug on the same page: Billing goes to #billing." },
    { name: "value", type: "string", doc: "The current item: its href, or for a string item its slug. Nothing is current until it is set." },
    { name: "label", type: "string", default: "\"On this page\"", doc: "Names the navigation for a screen reader: Settings sections." },
  ],
  notes: {
    Behaviour: [
      "A nav landmark named by label, over a list of links. The current item carries aria-current.",
      "The page decides what is current through value. The component never guesses from the scroll position, so a scroll spy lives in the page, where it can be tested with the sections.",
      "Links render through the system's link, so production gets client navigation.",
    ],
    Layout: ["It sticks 24px from the top beside the sections it lists, and fills the column it is given. Items are 36px tall, 44px on a touch screen."],
    States: ["The current item takes selected-strong and a 1px ring in selected-line, and stays outlined in forced colours."],
    Rules: ["Beside a settings page's sections or a long document. For sections of one record, use Tabs."],
    Review: ["The current item had no ring (round 4).", "A scroll-spy bug followed (round 5)."],
  },
  frame: { width: 960, height: 760 },
  examples: [
    {
      id: "settings",
      title: "With the current section",
      width: 240,
      markup: `<x-import component-from-global-scope="NS.SideNav" label="Settings sections" items="{{sections}}" value="billing"></x-import>`,
      layout: "block",
      vals: { sections },
    },
    {
      id: "unset",
      title: "Before anything is current",
      width: 240,
      markup: `<x-import component-from-global-scope="NS.SideNav" label="Document sections" items="{{sections}}"></x-import>`,
      layout: "block",
    },
    {
      id: "links",
      title: "Links to other pages, with icons",
      width: 240,
      markup: `<x-import component-from-global-scope="NS.SideNav" label="Workspace settings" items="{{workspace}}" value="/settings/team"></x-import>`,
      layout: "block",
      vals: {
        workspace: [
          { label: "Account", href: "/settings/account", icon: "User" },
          { label: "Team", href: "/settings/team", icon: "Users" },
          { label: "Billing", href: "/settings/billing", icon: "CreditCard" },
          { label: "Notifications", href: "/settings/notifications", icon: "Bell" },
        ],
      },
    },
  ],
  checks: [
    {
      name: "A nav named by its label, with a link per item; a string links to #its-slug",
      example: "settings",
      async run({ scope, expect }) {
        const nav = scope.getByRole("navigation", { name: "Settings sections" })
        expect.equal(await nav.count(), 1, "a nav named Settings sections")
        expect.equal(await nav.getByRole("link").count(), sections.length, "a link per item")
        expect.equal(await nav.getByRole("link", { name: "Billing" }).getAttribute("href"), "#billing", "Billing links to #billing")
      },
    },
    {
      name: "The current item takes selected-strong and a ring (round 4)",
      example: "settings",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("[aria-current]").count(), 1, "one current item")
        const current = scope.getByRole("link", { name: "Billing" })
        expect.equal(await current.getAttribute("aria-current"), "true", "Billing is current")
        const [bg, want, shadow] = await current.evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.backgroundColor = "var(--selected-strong)"
          el.appendChild(probe)
          const fill = getComputedStyle(probe).backgroundColor
          probe.remove()
          return [getComputedStyle(el).backgroundColor, fill, getComputedStyle(el).boxShadow]
        })
        expect.equal(bg, want, "the current item's fill")
        expect(shadow.includes("inset"), `a ring (${shadow})`)
      },
    },
    {
      name: "In forced colours the current item stays outlined",
      example: "settings",
      forcedColors: true,
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "Billing" }).evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "the current item's outline")
        expect.equal(await scope.getByRole("link", { name: "Profile" }).evaluate((el) => getComputedStyle(el).outlineStyle), "none", "nothing else is outlined at rest")
      },
    },
    {
      name: "Nothing is current until value is set (round 5)",
      example: "unset",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("[aria-current]").count(), 0, "no item is current")
      },
    },
    {
      name: "value matches an item's href",
      example: "links",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "Team" }).getAttribute("aria-current"), "true", "Team is current")
        expect.equal(await scope.locator("[aria-current]").count(), 1, "and nothing else")
      },
    },
    {
      name: "Items are 36px tall, and it sticks beside the sections it lists",
      example: "settings",
      async run({ scope, expect }) {
        for (const link of await scope.getByRole("link").all()) expect.equal(Math.round((await link.boundingBox()).height), 36, "item height")
        expect.equal(await scope.getByRole("navigation").evaluate((el) => getComputedStyle(el).position), "sticky", "it sticks")
      },
    },
    {
      name: "Items are 44px tall on a touch screen",
      example: "settings",
      touch: true,
      async run({ scope, expect }) {
        for (const link of await scope.getByRole("link").all()) expect.equal(Math.round((await link.boundingBox()).height), 44, "item height on touch")
      },
    },
    {
      name: "Links show the system's focus ring, in both themes",
      example: "settings",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const outline = await scope.getByRole("link", { name: "Profile" }).evaluate((el) => (el === document.activeElement ? getComputedStyle(el).outlineStyle : "not focused"))
        expect.equal(outline, "solid", "the first link's focus ring")
      },
    },
  ],
}
