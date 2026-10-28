// Card's one definition. The board builds the header actions in its own script, through the
// bundle's namespace, which it finds on the page.
const body = (text) => `<p class="max-w-measure type-body text-text">${text}</p>`
const list = `<ul class="flex flex-col">
<li class="flex items-center justify-between gap-4 border-t border-line px-6 py-3"><span class="type-body text-text">[Harbour Physio]</span><span class="type-body text-text-muted tabular-nums">[$4,280.00]</span></li>
<li class="flex items-center justify-between gap-4 border-t border-line px-6 py-3"><span class="type-body text-text">[Northside Vets]</span><span class="type-body text-text-muted tabular-nums">[$1,960.50]</span></li>
<li class="flex items-center justify-between gap-4 border-t border-line px-6 py-3"><span class="type-body text-text">[Coastal Dental]</span><span class="type-body text-text-muted tabular-nums">[$812.00]</span></li>
</ul>`

const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)
// Tailwind composes box-shadow from several layers, so "no shadow" computes as transparent layers.
const shadowShows = (value) =>
  value !== "none" && value.split(/,(?![^(]*\))/).some((layer) => !/rgba\(\d+, \d+, \d+, 0\)/.test(layer))

export default {
  name: "Card",
  group: "Data",
  job: "The container on the canvas: a title, an optional description and actions, a body and a footer.",
  status: "proven",
  props: [
    { name: "title", type: "ReactNode", doc: "Says what the card shows, in sentence case. Never a small uppercase label above it." },
    { name: "description", type: "ReactNode", doc: "One line under the title." },
    { name: "actions", type: "ReactNode", doc: "Buttons at the top right. They stay pressable when the card is a link." },
    { name: "footer", type: "ReactNode", doc: "A row under a hairline, on the subtle surface." },
    { name: "icon", type: "IconName", doc: "An icon before the title, in the muted text colour." },
    { name: "href", type: "string", doc: "The title becomes a link that covers the card; buttons inside stay pressable." },
    { name: "chevron", type: "boolean", default: "false", doc: "A chevron at the end of the title's line, the cue that the whole card opens something, as ListRow has. Use it with href." },
    { name: "flat", type: "boolean", default: "false", doc: "Inside a pane: no shadow." },
    { name: "interactive", type: "boolean", default: "false", doc: "Lifts on hover." },
    { name: "selected", type: "boolean", default: "false", doc: "The selected tint and a 2px edge. Say it in words in the card too." },
    { name: "flush", type: "boolean", default: "false", doc: "No body padding, for tables and lists." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "The title is an h2 by default. Its size follows the level." },
    { name: "as", type: '"div" | "section" | "article" | "li"', default: '"div"', doc: "The element the card is." },
  ],
  notes: {
    Behaviour: [
      "With href the title is the link and it covers the whole card, so a press anywhere opens it. Buttons in the header and footer sit above it and stay pressable.",
      "The title is a real heading, an h2 unless headingLevel says otherwise, so cards sit in the page's outline.",
    ],
    Layout: [
      "The title's size follows its level, so the outline shows on screen too: heading-lg for a card that is a section of the page (h2), heading for a card under a section heading (h3), heading-sm below that (h4).",
      "Header actions centre on the title's line. The inset steps from 24px to 16px when the card itself is under 360px wide.",
    ],
    States: [
      "selected takes the selected tint with a 2px edge, outlined in forced colours. interactive lifts on hover, the movement only under motion-safe. flat drops the shadow.",
    ],
    Rules: [
      "Never a card inside a card: a card inside another draws its content without a box.",
      "The title says what the card shows, with no small uppercase label above it. One idea per card: a card that needs tabs is a page.",
    ],
    Review: ["An uppercase kicker sat above card titles, which the craft gate bans (round 1)."],
  },
  frame: { width: 960, height: 1700 },
  logic: `els: (() => {
  for (const key of Object.keys(window)) {
    try {
      const ns = window[key]
      if (ns && typeof ns.Root === "function" && ns.Button) {
        const h = window.React.createElement
        return {
          exportAction: h(ns.Button, { size: "sm", variant: "ghost", icon: "Download" }, "Export"),
          menuAction: h(ns.Button, { size: "sm", variant: "ghost", icon: "Pencil" }, "Edit"),
        }
      }
    } catch (e) {}
  }
  return {}
})()`,
  examples: [
    {
      id: "anatomy",
      title: "Title, description, actions and footer",
      layout: "block",
      markup: `<div class="max-w-lg"><x-import component-from-global-scope="NS.Card" title="June pay run" description="Approved by [Sam Lee] on [3 June]." actions="{{els.exportAction}}" footer="Synced with [the payroll system] 2 hours ago">${body("[14] payslips are ready to send. Staff get theirs by email the moment you send them.")}</x-import></div>`,
    },
    {
      id: "link",
      title: "A link that covers the card",
      markup: `<div class="w-80"><x-import component-from-global-scope="NS.Card" title="Timesheets" icon="Clock" href="#" interactive="{{yes}}" actions="{{els.menuAction}}">${body("[6] need your approval before Friday.")}</x-import></div>`,
      vals: { yes: true },
    },
    {
      id: "chevron",
      title: "A linked card with its chevron",
      markup: `<div class="w-80"><x-import component-from-global-scope="NS.Card" title="[Northside] team" href="#team" chevron="{{yes}}" interactive="{{yes}}">${body("[12] people, [3] on leave this week.")}</x-import></div>`,
    },
    {
      id: "states",
      title: "Selected and flat",
      markup: `<div class="flex flex-wrap items-stretch gap-3">
<div class="w-72"><x-import component-from-global-scope="NS.Card" class="h-full" title="Monthly plan" selected="{{yes}}">${body("Your current plan. [$49] a month, billed on the 1st.")}</x-import></div>
<div class="w-72"><x-import component-from-global-scope="NS.Card" class="h-full" title="Yearly plan" flat="{{yes}}">${body("[$490] a year, two months free.")}</x-import></div>
</div>`,
    },
    {
      id: "flush",
      title: "Flush, for a list",
      layout: "block",
      markup: `<div class="max-w-lg"><x-import component-from-global-scope="NS.Card" title="Unpaid invoices" description="Oldest first." flush="{{yes}}">${list}</x-import></div>`,
    },
    {
      id: "levels",
      title: "Heading levels",
      markup: `<div class="flex flex-wrap items-start gap-3">
<div class="w-60"><x-import component-from-global-scope="NS.Card" title="Level two">${body("The default, under the page title.")}</x-import></div>
<div class="w-60"><x-import component-from-global-scope="NS.Card" title="Level three" heading-level="{{h3}}">${body("Under a section heading.")}</x-import></div>
<div class="w-60"><x-import component-from-global-scope="NS.Card" title="Level four" heading-level="{{h4}}">${body("Under a level three.")}</x-import></div>
</div>`,
      vals: { h3: 3, h4: 4 },
    },
    {
      id: "nested",
      title: "Never a card inside a card",
      layout: "block",
      markup: `<div class="max-w-lg"><x-import component-from-global-scope="NS.Card" title="Leave balance">
${body("[Priya Nair] has [11.5] days of annual leave.")}
<x-import component-from-global-scope="NS.Card" title="Booked" heading-level="{{h3}}">${body("[3 days] from [14 July].")}</x-import>
</x-import></div>`,
    },
    {
      id: "narrow",
      title: "A narrow card",
      markup: `<div class="w-72"><x-import component-from-global-scope="NS.Card" title="Overtime" description="This week.">${body("[12.5] hours across [4] people.")}</x-import></div>`,
    },
  ],
  checks: [
    {
      name: "A linked card's chevron ends the title's line, is decoration, and the card is still one link",
      example: "chevron",
      async run({ scope, expect }) {
        const card = await scope.locator('[data-slot="card"]').first().boundingBox()
        const chevron = scope.locator('[data-slot="card-chevron"]')
        expect.equal(await chevron.getAttribute("aria-hidden"), "true", "decoration: the link says where it goes")
        const c = await chevron.boundingBox()
        const title = await scope.getByRole("heading", { name: "[Northside] team" }).boundingBox()
        expect(Math.abs(c.y + c.height / 2 - (title.y + title.height / 2)) <= 2, "on the title's line")
        expect(card.x + card.width - (c.x + c.width) <= 32, "at the end of the card, inside its inset")
        expect.equal(await scope.getByRole("link").count(), 1, "one link")
        expect.equal(await scope.getByRole("link", { name: "[Northside] team" }).count(), 1, "named by the title alone")
      },
    },
    {
      name: "Titles are h2 by default, and h3 or h4 when asked",
      example: "levels",
      async run({ scope, expect }) {
        for (const [level, name] of [[2, "Level two"], [3, "Level three"], [4, "Level four"]]) {
          expect.equal(await scope.getByRole("heading", { level, name }).count(), 1, `the ${name} title`)
        }
      },
    },
    {
      name: "No kicker above the title: the title opens the card, in sentence case",
      example: "anatomy",
      async run({ scope, expect }) {
        const header = scope.locator('[data-slot="card-header"]')
        expect.equal(await header.evaluate((el) => el.firstElementChild?.dataset.slot), "card-title", "the header's first element")
        expect(await style(scope.locator('[data-slot="card-title"]'), "textTransform") !== "uppercase", "the title is not uppercase")
      },
    },
    {
      name: "Never a card inside a card",
      example: "nested",
      async run({ scope, expect }) {
        const inner = scope.locator('[data-slot="card"][data-nested]')
        expect.equal(await inner.count(), 1, "the inner card is marked nested")
        expect.equal(await style(inner, "borderTopWidth"), "0px", "the inner card's border")
        expect(!shadowShows(await style(inner, "boxShadow")), "the inner card has no shadow")
      },
    },
    {
      name: "As a link it opens from anywhere on the card, and its buttons stay pressable",
      example: "link",
      async run({ page, scope, expect }) {
        const card = await scope.locator('[data-slot="card"]').boundingBox()
        const hit = (x, y) => page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("a, button")?.textContent.trim() ?? null, [x, y])
        expect.equal(await hit(card.x + 20, card.y + card.height - 12), "Timesheets", "a press near the bottom corner")
        const edit = await scope.getByRole("button", { name: "Edit" }).boundingBox()
        expect.equal(await hit(edit.x + edit.width / 2, edit.y + edit.height / 2), "Edit", "a press on the Edit button")
        expect.equal(await scope.getByRole("link", { name: "Timesheets" }).count(), 1, "one link, named by the title")
      },
    },
    {
      name: "The keyboard reaches the title link, then the button, with the system's outline",
      example: "link",
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link", { name: "Timesheets" })
        for (let i = 0; i < 20 && !(await link.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab")
        expect(await link.evaluate((el) => el === document.activeElement), "Tab reaches the title link")
        expect.equal(await style(link, "outlineStyle"), "solid", "the link's outline")
        await page.keyboard.press("Tab")
        expect(await scope.getByRole("button", { name: "Edit" }).evaluate((el) => el === document.activeElement), "then the Edit button")
      },
    },
    {
      name: "Its hairline and shadow come from the theme, in both themes",
      example: "anatomy",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const [line, radius, shadow] = await scope.locator('[data-slot="card"]').evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.borderColor = "var(--line)"
          el.append(probe)
          const s = getComputedStyle(el)
          const out = [s.borderTopColor === getComputedStyle(probe).borderTopColor, s.borderTopLeftRadius === getComputedStyle(document.documentElement).getPropertyValue("--radius-md").trim(), s.boxShadow]
          probe.remove()
          return out
        })
        expect(line, "the hairline is the line role")
        expect(radius, "the corners are radius-md")
        expect(shadowShows(shadow), "it has the small shadow")
      },
    },
    {
      name: "A narrow card steps its inset down to 16px",
      async run({ page, expect }) {
        const inset = (ex) => page.locator(`[data-example="${ex}"] [data-slot="card-content"]`).evaluate((el) => getComputedStyle(el).paddingLeft)
        expect.equal(await inset("anatomy"), "24px", "a wide card's inset")
        expect.equal(await inset("narrow"), "16px", "a 288px card's inset")
      },
    },
    {
      name: "Selected stays visible in forced colours",
      example: "states",
      forcedColors: true,
      async run({ scope, expect }) {
        const selected = scope.locator('[data-slot="card"][data-selected]')
        expect.equal(await style(selected, "outlineStyle"), "solid", "an outline on the selected card")
        expect.equal(await style(scope.locator('[data-slot="card"]:not([data-selected])'), "outlineStyle"), "none", "no outline on the other card at rest")
      },
    },
  ],
}
