// Breadcrumbs' one definition: its README, its preview board and its scripted checks all come from here.

const LONG = "[Northern Beaches Strata Management]"

export default {
  name: "Breadcrumbs",
  group: "Navigation",
  job: "Where a record sits, for pages two or more levels deep.",
  status: "proven",
  props: [
    { name: "items", type: "Array<{ label: string, href?: string }>", doc: "From the top of the product down to the current page, which comes last and needs no href." },
  ],
  notes: {
    Behaviour: [
      "A nav named Breadcrumb over an ordered list. The last item is the current page, with aria-current, and not a link.",
      "Links render through the system's link, so production gets client navigation.",
      "A name over 28 characters is cut, at a word break when there is one near the end, with the full name on hover. It stays reachable without a mouse: the link's accessible name is the full name, the link shows it in full while it has keyboard focus, and a touch screen never cuts it.",
    ],
    Layout: ["The trail wraps instead of scrolling. The current page is never cut: it wraps, and it repeats the page's title."],
    States: ["Links in the muted text colour, underlined on hover. The current page in the body text colour."],
    Rules: ["From two levels deep only. Every link has a 24px target, the WCAG minimum for links in a trail, on every pointer."],
  },
  frame: { width: 960, height: 220 },
  examples: [
    {
      id: "trail",
      title: "Three levels deep",
      markup: `<x-import component-from-global-scope="NS.Breadcrumbs" items="{{trail}}"></x-import>`,
      layout: "block",
      vals: { trail: [{ label: "Clients", href: "#clients" }, { label: "[Northside Dental]", href: "#client" }, { label: "[Invoice 1042]" }] },
    },
    {
      id: "long",
      title: "Long names",
      markup: `<x-import component-from-global-scope="NS.Breadcrumbs" items="{{longTrail}}"></x-import>`,
      layout: "block",
      vals: {
        longTrail: [
          { label: "Clients", href: "#clients" },
          { label: LONG, href: "#client" },
          { label: "Invoices", href: "#invoices" },
          { label: "[Invoice 1042 for the March maintenance plan and the late fee]" },
        ],
      },
    },
  ],
  checks: [
    {
      name: "A nav named Breadcrumb over an ordered list, ending on the current page, which is not a link",
      example: "trail",
      async run({ scope, expect }) {
        const nav = scope.getByRole("navigation", { name: "Breadcrumb" })
        expect.equal(await nav.count(), 1, "a nav named Breadcrumb")
        expect.equal(await nav.locator("ol > li").count(), 5, "three steps and two separators in an ordered list")
        const current = nav.locator("[aria-current=page]")
        expect.equal(await current.textContent(), "[Invoice 1042]", "the current page is last")
        expect.equal(await current.evaluate((el) => el.closest("a")), null, "the current page is not a link")
        expect.equal(await nav.getByRole("link").count(), 2, "the steps above it are links")
        expect.equal(await nav.getByRole("link", { name: "Clients" }).getAttribute("href"), "#clients", "a link keeps its href")
      },
    },
    {
      name: "Every link has a 24px target",
      example: "trail",
      async run({ scope, expect }) {
        for (const link of await scope.getByRole("link").all()) expect.atLeast((await link.boundingBox()).height, 24, `${await link.textContent()} target height`)
      },
    },
    {
      name: "Every link has a 24px target on a touch screen too",
      example: "trail",
      touch: true,
      async run({ scope, expect }) {
        for (const link of await scope.getByRole("link").all()) expect.atLeast((await link.boundingBox()).height, 24, `${await link.textContent()} target height on touch`)
      },
    },
    {
      name: "A long name is cut at 28 characters with the full name on hover, and its accessible name is the full name",
      example: "long",
      async run({ scope, expect }) {
        const link = scope.getByRole("link", { name: LONG })
        expect.equal(await link.count(), 1, "the link is named by the full name")
        expect.equal(await link.getAttribute("title"), LONG, "the full name on hover")
        const shown = await link.locator("[aria-hidden=true]").textContent()
        expect(shown.length <= 28, `the cut name is 28 characters at most (${shown})`)
        expect(shown.endsWith("…") && LONG.startsWith(shown.slice(0, -1)), "it is the start of the name and an ellipsis")
        expect.equal(LONG.charAt(shown.length - 1), " ", "it is cut at a word break")
      },
    },
    {
      name: "A cut name shows in full while its link has keyboard focus",
      example: "long",
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link", { name: LONG })
        const cut = (await link.boundingBox()).width
        await scope.getByRole("link", { name: "Clients" }).focus()
        await page.keyboard.press("Tab")
        expect(await link.evaluate((el) => el === document.activeElement), "the long link has focus")
        expect.equal(await link.locator("[aria-hidden=true]").isVisible(), false, "the cut name hides")
        expect.atLeast((await link.boundingBox()).width, cut + 40, "the link widens to the full name")
      },
    },
    {
      name: "On a touch screen nothing is cut",
      example: "long",
      touch: true,
      async run({ scope, expect }) {
        const link = scope.getByRole("link", { name: LONG })
        expect.equal(await link.locator("[aria-hidden=true]").isVisible(), false, "no cut name on touch")
        expect.atLeast((await link.boundingBox()).width, 240, "the full name shows")
      },
    },
    {
      name: "The current page wraps instead of being cut",
      example: "long",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("[aria-current=page]").textContent(), "[Invoice 1042 for the March maintenance plan and the late fee]", "the whole name")
      },
    },
    {
      name: "Links show the system's focus ring, in both themes",
      example: "trail",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const outline = await scope.getByRole("link", { name: "Clients" }).evaluate((el) => (el === document.activeElement ? getComputedStyle(el).outlineStyle : "not focused"))
        expect.equal(outline, "solid", "the first link's focus ring")
      },
    },
  ],
}
