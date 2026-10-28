// TextLink's one definition: its README, its preview board and its scripted checks all come from here.

/** A role's colour as the browser computes it in the current theme. */
const colourOf = (page, role) =>
  page.evaluate((r) => {
    const probe = document.createElement("span")
    probe.style.color = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, role)

export default {
  name: "TextLink",
  group: "Actions",
  job: "An underlined inline link in the link colour.",
  status: "proven",
  props: [
    { name: "href", type: "string", doc: "Where it goes. It renders through the product's link component, so the starter gets client navigation." },
    { name: "icon", type: "IconName", doc: "An icon before the text, such as ArrowLeft for a way back." },
    { name: "iconRight", type: "IconName", doc: "An icon after the text, such as ArrowRight, or ExternalLink for another site." },
    { name: "target", type: "string", doc: "_blank opens a new tab: screen readers hear that it does, and rel gets noopener." },
    { name: "standalone", type: "boolean", default: "false", doc: "On its own, not in a sentence: a card's See all, Forgot your password?. Its tap area grows to 40px on touch, looking no different." },
  ],
  notes: {
    Behaviour: [
      "A real link: Enter follows it, and screen readers hear its text and that it is a link.",
      "With target _blank it adds \"(opens in a new tab)\" for screen readers and sets rel to noopener noreferrer.",
      "Icons are decoration and hidden from screen readers. The text carries the meaning.",
    ],
    Layout: [
      "It flows inside a sentence and wraps with it. Vertical padding gives every link a 24px target without moving the line it sits on.",
      "A standalone link (a card's See all, Forgot your password?) is pressable like any control, so on touch its tap area is 40px, centred on it. In a sentence it stays 24px, so it never reaches over the lines beside it.",
    ],
    Rules: [
      "The text says where it goes and is unique on the page, never here or more.",
      "Links navigate and buttons act, so Try again is a Button, even inside an alert.",
      "Underlined at rest, always: colour alone never marks a link.",
      "Its colour and underline are fixed. Neither a className nor a canvas board's base styles can turn it back into plain text.",
    ],
    Review: [
      "Links in a sentence or a breadcrumb trail need a 24px target everywhere (section 2.5): it is measured inside a sentence, on a desktop and on touch.",
      "A standalone See all and Forgot your password? were 26 to 28px on touch (a pilot's round 1): standalone grows the tap area to 40px.",
    ],
  },
  examples: [
    {
      id: "sentence",
      title: "In a sentence",
      layout: "block",
      markup: `<p style="margin: 0; max-width: 34em;">Invoices sent after 5 pm go out the next morning. Read <x-import component-from-global-scope="NS.TextLink" href="#how-sending-works">how sending works</x-import> for the full schedule.</p>`,
    },
    {
      id: "icons",
      title: "With icons",
      markup: `<x-import component-from-global-scope="NS.TextLink" href="#invoices" icon="ArrowLeft">Back to [invoices]</x-import>
<x-import component-from-global-scope="NS.TextLink" href="#all-invoices" icon-right="ArrowRight">View all [invoices]</x-import>
<x-import component-from-global-scope="NS.TextLink" href="https://portal.example.com" icon-right="ExternalLink" target="_blank">Open [supplier portal]</x-import>`,
    },
    {
      id: "standalone",
      title: "On its own, under a card or a form",
      layout: "block",
      markup: `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 16px;"><x-import component-from-global-scope="NS.TextLink" href="#all-jobs" standalone="{{yes}}">See all [12] jobs that need you</x-import><x-import component-from-global-scope="NS.TextLink" href="#reset" standalone="{{yes}}">Forgot your password?</x-import></div>`,
      vals: { yes: true },
    },
    {
      id: "wrapping",
      title: "A long link wraps with its sentence",
      layout: "block",
      width: 300,
      markup: `<p style="margin: 0;">Payments from <x-import component-from-global-scope="NS.TextLink" href="#overdue">[Northern Rivers Veterinary Partners] overdue invoices</x-import> are listed first.</p>`,
    },
  ],
  frame: { width: 960, height: 480 },
  checks: [
    {
      name: "A real link, named by its text, that Enter follows",
      example: "sentence",
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link", { name: "how sending works" })
        expect.equal(await link.count(), 1, "one link named by its text")
        await link.focus()
        await page.keyboard.press("Enter")
        await page.waitForFunction(() => location.hash === "#how-sending-works", null, { timeout: 3000 })
        expect.equal(await page.evaluate(() => location.hash), "#how-sending-works", "Enter followed the link")
      },
    },
    {
      name: "Every link has a 24px target, in a sentence too",
      async run({ page, expect }) {
        const links = await page.locator('[data-slot="text-link"]').all()
        expect.equal(links.length, 7, "seven links on the board")
        for (const link of links) {
          const rects = await link.evaluate((el) => [...el.getClientRects()].map((r) => r.height))
          for (const h of rects) expect.atLeast(Math.round(h), 24, "link target height")
        }
      },
    },
    {
      name: "Links keep a 24px target on touch",
      touch: true,
      async run({ page, expect }) {
        for (const link of await page.locator('[data-slot="text-link"]').all()) {
          for (const h of await link.evaluate((el) => [...el.getClientRects()].map((r) => r.height))) expect.atLeast(Math.round(h), 24, "touch target height")
        }
      },
    },
    {
      name: "On touch a standalone link takes a 40px tap, looking no different; a link in a sentence keeps its 24px",
      touch: true,
      async run({ page, expect }) {
        const reach = (link) =>
          link.evaluate((el) => {
            const r = el.getBoundingClientRect()
            const x = r.left + 4
            const mid = r.top + r.height / 2
            return { own: r.height, top: document.elementFromPoint(x, mid - 19)?.closest('[data-slot="text-link"]') === el, foot: document.elementFromPoint(x, mid + 19)?.closest('[data-slot="text-link"]') === el }
          })
        for (const link of await page.locator('[data-example="standalone"] [data-slot="text-link"]').all()) {
          const r = await reach(link)
          expect(r.own < 40, `the link itself stays ${Math.round(r.own)}px tall`)
          expect(r.top && r.foot, `a tap 19px above and below the middle of "${(await link.textContent()).trim()}" reaches it`)
        }
        const inline = await page.locator('[data-example="sentence"] [data-slot="text-link"]').evaluate((el) => getComputedStyle(el, "::after").position)
        expect(inline !== "absolute", "a link in a sentence grows no tap area over the lines beside it")
      },
    },
    {
      name: "Underlined at rest, in the link colour, in both themes",
      example: "sentence",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const s = await scope.getByRole("link").evaluate((el) => ({ line: getComputedStyle(el).textDecorationLine, colour: getComputedStyle(el).color }))
        expect(s.line.includes("underline"), "underlined at rest")
        expect.equal(s.colour, await colourOf(page, "link"), "the theme's link colour")
      },
    },
    {
      name: "A link that opens a new tab says so, and sets rel",
      example: "icons",
      async run({ scope, expect }) {
        const link = scope.getByRole("link", { name: "Open [supplier portal] (opens in a new tab)" })
        expect.equal(await link.count(), 1, "the new tab is part of what screen readers hear")
        expect.equal(await link.getAttribute("rel"), "noopener noreferrer", "rel")
        expect.equal(await scope.locator("svg[aria-hidden='true']").count(), 3, "icons are decoration")
      },
    },
    {
      name: "Focus shows the system's outline in the focus colour, in both themes",
      example: "sentence",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const link = scope.getByRole("link")
        expect(await link.evaluate((el) => document.activeElement === el), "Tab reaches the link")
        const o = await link.evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth, color: getComputedStyle(el).outlineColor }))
        expect.equal(o.style, "solid", "outline style")
        expect.equal(o.width, "2px", "outline width")
        expect.equal(o.color, await colourOf(page, "focus"), "outline colour")
      },
    },
    {
      name: "A long link wraps inside its sentence instead of overflowing",
      example: "wrapping",
      async run({ scope, expect }) {
        const link = scope.getByRole("link")
        expect.atLeast(await link.evaluate((el) => el.getClientRects().length), 2, "the link runs over more than one line")
        const fits = await scope.evaluate((el) => el.scrollWidth <= el.clientWidth)
        expect(fits, "nothing spills past the column")
      },
    },
  ],
}
