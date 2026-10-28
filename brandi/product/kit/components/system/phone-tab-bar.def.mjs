// PhoneTabBar's one definition: its README, its preview board and its scripted checks all come from here.

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const four = [
  { label: "Home", href: "#home", icon: "House" },
  { label: "Approvals", href: "#approvals", icon: "ClipboardCheck", count: 3, attention: true },
  { label: "Bookings", href: "#bookings", icon: "Calendar" },
  { label: "Clients", href: "#clients", icon: "Users" },
]
const five = [
  { label: "Today", href: "#today", icon: "CalendarCheck" },
  { label: "Inbox", href: "#inbox", icon: "Inbox", count: 1, attention: true },
  { label: "Invoices", href: "#invoices", icon: "Receipt", count: 12 },
  { label: "Clients", href: "#clients", icon: "Users", count: 0 },
  { label: "Settings", href: "#settings", icon: "Settings" },
]
const phone = (inner) => `<div style="width: 390px;" class="outline outline-line">${inner}</div>`

export default {
  name: "PhoneTabBar",
  group: "Navigation",
  job: "Three to five top-level places at the foot of a phone app.",
  status: "to build",
  props: [
    { name: "items", type: "Array<{ label: string, href: string, icon: IconName, count?: number, attention?: boolean }>", doc: "Three to five places, each a link." },
    { name: "value", type: "string", doc: 'The current place\'s href: it takes aria-current="page". Nothing is current until it is set.' },
    { name: "label", type: "string", default: '"Main"', doc: "Names the navigation for a screen reader." },
  ],
  notes: {
    Behaviour: [
      'From NavItem: a nav landmark over a list of links, aria-current="page" on the current place, counts read as words after the label (Approvals, 3 need you; Invoices, 12 waiting on others), and zero shows nothing.',
      "Links render through the system's link, so production gets client navigation.",
    ],
    Layout: [
      "Each place is 48px tall, at least the 44px a thumb needs, with 8px between places and the icon over a one-word label. The current place's icon sits in rail-selected with a hairline, under a 3px bar in rail-text-strong along the top: the fill is a step off the bar, about 1.3:1, so the bar carries the state at 3:1 or more (WCAG 1.4.11).",
      "It keeps clear of a phone's home indicator. Inside AppShell it takes the foot on a phone, and the page's primary stays in its header.",
    ],
    States: [
      "The current place takes rail-text-strong, and in forced colours an outline. A count sits on the icon's corner: the highlight with on-highlight text when it waits on the reader, the rail edged in rail-muted when it waits on someone else, so it reads as a count and not a stray figure.",
    ],
    Review: [
      "The current place was marked by the icon's fill alone, 1.32:1 on a dark bar, and a grey count's hairline edge did not show, so it read as a stray digit (a second brand's round 2).",
    ],
    Rules: [
      "Three to five places, each one word. More than five belong in the drawer.",
      "(practice) The phone's foot belongs to the tab bar or to the page's primary, never both. Decide per product.",
    ],
  },
  frame: { width: 960, height: 420 },
  examples: [
    {
      id: "four",
      title: "Four places, one with work waiting on you",
      markup: phone(`<x-import component-from-global-scope="NS.PhoneTabBar" items="{{four}}" value="#approvals"></x-import>`),
      layout: "block",
      vals: { four },
    },
    {
      id: "five",
      title: "Five places, with a grey count and a zero",
      markup: phone(`<x-import component-from-global-scope="NS.PhoneTabBar" label="Sections" items="{{five}}" value="#today"></x-import>`),
      layout: "block",
      vals: { five },
    },
    {
      id: "unset",
      title: "Before anything is current",
      markup: phone(`<x-import component-from-global-scope="NS.PhoneTabBar" label="Places" items="{{four}}"></x-import>`),
      layout: "block",
    },
  ],
  checks: [
    {
      name: 'A nav named by its label, with a link per place and aria-current="page" on the current one',
      example: "four",
      async run({ scope, expect }) {
        const nav = scope.getByRole("navigation", { name: "Main" })
        expect.equal(await nav.count(), 1, "a nav named Main")
        expect.equal(await nav.getByRole("link").count(), 4, "a link per place")
        expect.equal(await nav.locator("[aria-current]").count(), 1, "one current place")
        expect.equal(await nav.getByRole("link", { name: "Approvals, 3 need you" }).getAttribute("aria-current"), "page", "Approvals is the current page")
      },
    },
    {
      name: "Nothing is current until value is set",
      example: "unset",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("[aria-current]").count(), 0, "no current place")
      },
    },
    {
      name: "Counts are read as words, and zero shows nothing",
      example: "five",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "Inbox, 1 needs you" }).count(), 1, "Inbox, 1 needs you")
        expect.equal(await scope.getByRole("link", { name: "Invoices, 12 waiting on others" }).count(), 1, "Invoices, 12 waiting on others")
        const clients = scope.getByRole("link", { name: "Clients", exact: true })
        expect.equal(await clients.count(), 1, "a zero count leaves the label alone")
        expect.equal(await clients.locator('[data-slot="phone-tab-count"]').count(), 0, "and shows nothing")
      },
    },
    {
      name: "On a touch screen every place is 44px tall at least, with 8px between places",
      example: "five",
      touch: true,
      async run({ scope, expect }) {
        const boxes = await Promise.all((await scope.getByRole("link").all()).map((l) => l.boundingBox()))
        for (const b of boxes) expect.atLeast(Math.round(b.height), 44, "a place's height")
        for (let i = 1; i < boxes.length; i++) expect.atLeast(Math.round(boxes[i].x - (boxes[i - 1].x + boxes[i - 1].width)), 8, "the gap between places")
      },
    },
    {
      name: "The needs-you count holds 4.5:1, in both themes",
      example: "four",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const chip = scope.getByRole("link", { name: "Approvals, 3 need you" }).locator('[data-slot="phone-tab-count"]')
        const [fg, bg] = await chip.evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el).backgroundColor])
        expect.atLeast(Number(contrast(fg, bg).toFixed(2)), 4.5, `the count's contrast in ${theme}`)
      },
    },
    {
      name: "The current place is marked at 3:1 or more against the bar and the icon's fill, and a grey count's chip edge shows, in both themes",
      themes: ["light", "dark"],
      async run({ page, expect, theme }) {
        const four = page.locator('[data-example="four"]')
        const bar = await four.locator('[data-slot="phone-tab-bar"]').evaluate((el) => getComputedStyle(el).backgroundColor)
        const current = four.getByRole("link", { name: "Approvals, 3 need you" })
        const [mark, height, fill] = await current.evaluate((el) => [getComputedStyle(el, "::before").backgroundColor, getComputedStyle(el, "::before").height, getComputedStyle(el.querySelector('[data-slot="phone-tab-icon"]')).backgroundColor])
        expect.equal(height, "3px", "a 3px bar")
        expect.atLeast(Number(contrast(mark, bar).toFixed(2)), 3, `${theme}: the bar against the tab bar`)
        expect.atLeast(Number(contrast(mark, fill).toFixed(2)), 3, `${theme}: the bar against the icon's fill`)
        expect.equal(await four.locator('[data-slot="phone-tab"]:not([aria-current])').evaluateAll((all) => all.filter((el) => getComputedStyle(el, "::before").content !== "none").length), 0, "no other place carries a bar")
        const grey = page.locator('[data-example="five"]').getByRole("link", { name: "Invoices, 12 waiting on others" }).locator('[data-slot="phone-tab-count"]')
        // The edge is rail-muted: read the role where the chip sits, and find it in the chip's shadow.
        const [edge, shadow] = await grey.evaluate((el) => {
          const p = document.createElement("span")
          p.style.color = "var(--rail-muted)"
          el.appendChild(p)
          const colour = getComputedStyle(p).color
          p.remove()
          return [colour, getComputedStyle(el).boxShadow]
        })
        expect(shadow.includes(edge) && /inset/.test(shadow), `the chip is edged in rail-muted (${shadow})`)
        expect.atLeast(Number(contrast(edge, bar).toFixed(2)), 3, `${theme}: the grey count's chip edge against the bar`)
      },
    },
    {
      name: "Each label holds 4.5:1 on the bar, in both themes",
      example: "five",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const bg = await scope.locator('[data-slot="phone-tab-bar"]').evaluate((el) => getComputedStyle(el).backgroundColor)
        for (const link of await scope.getByRole("link").all()) {
          const fg = await link.evaluate((el) => getComputedStyle(el).color)
          expect.atLeast(Number(contrast(fg, bg).toFixed(2)), 4.5, `a label's contrast in ${theme}`)
        }
      },
    },
    {
      name: "The keyboard reaches each place, with the focus ring drawn inside it",
      example: "four",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const home = scope.getByRole("link", { name: "Home" })
        expect(await home.evaluate((el) => el === document.activeElement), "the first Tab lands on Home")
        expect.equal(await home.evaluate((el) => `${getComputedStyle(el).outlineStyle} ${getComputedStyle(el).outlineOffset}`), "solid -2px", "a ring drawn inside")
        await page.keyboard.press("Tab")
        expect(await scope.getByRole("link", { name: "Approvals, 3 need you" }).evaluate((el) => el === document.activeElement), "Tab moves on to Approvals")
      },
    },
    {
      name: "In forced colours the current place is outlined, and nothing else is at rest",
      example: "four",
      forcedColors: true,
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "Approvals, 3 need you" }).evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "the current place's outline")
        expect.equal(await scope.getByRole("link", { name: "Home" }).evaluate((el) => getComputedStyle(el).outlineStyle), "none", "no outline at rest")
      },
    },
  ],
}
