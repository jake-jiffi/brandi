// EmptyState's one definition: its README, its preview board and its scripted checks all come from here.

const channels = (css) => {
  const rgb = /rgba?\(([^)]+)\)/.exec(css)
  if (rgb) return rgb[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number)
  const srgb = /color\(srgb ([^)]+)\)/.exec(css)
  if (srgb) return srgb[1].split(/\s+/).slice(0, 3).map((v) => Number(v) * 255)
  throw new Error(`cannot read the colour ${css}`)
}
const luminance = (css) => {
  const [r, g, b] = channels(css).map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)

const CARD = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden;"

export default {
  name: "EmptyState",
  group: "Feedback",
  job: "Says what is empty and what to do next.",
  status: "proven",
  props: [
    { name: "size", type: '"page" | "section" | "compact"', default: '"section"', doc: "page when the empty thing is the whole page, section inside a card or pane, compact in narrow places." },
    { name: "picture", type: "string | ReactNode", doc: "The brand's character or illustration for this state: its file, or an element. Decorative, so it never carries the meaning." },
    { name: "icon", type: "IconName", doc: "An icon in a quiet tile, for a brand with no character. Ignored when there is a picture." },
    { name: "title", type: "ReactNode", required: true, doc: 'What is empty, as a sentence: "No clients yet."' },
    { name: "children", type: "ReactNode", doc: "What to do next, in a line." },
    { name: "actions", type: "ReactNode | FeedbackAction[]", doc: "Buttons, or the same as data ({ label, variant, icon, href, onClick }). The way out of the empty state." },
    { name: "flat", type: "boolean", default: "false", doc: "Drops its own surface and edge, for inside a card, a pane or a table body." },
    { name: "headingLevel", type: "1 | 2 | 3 | 4 | 5 | 6", default: "2 for page, 3 otherwise", doc: "The title's level. Pass 1 when the empty state is the whole page, so the page keeps one h1." },
  ],
  tables: [
    {
      title: "Kinds",
      head: ["Kind", "Example", "Character state, if any"],
      rows: [
        ["Nothing yet", '"No clients yet." with Add client', "Building or reading"],
        ["No results", '"No invoices match these filters." with Clear filters', "Inspecting"],
        ["All done", '"All caught up. Nothing is waiting on you."', "Calm"],
        ["Could not load", '"We couldn\'t load invoices. [Source] is not responding." with Try again', "Needs a person"],
        ["No access", "Who can grant access, and a link back", "Neutral"],
        ["Not found", "A link to the list it belonged to", "Inspecting"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      'The title is a real heading at headingLevel. The picture and the icon are decoration (alt="", aria-hidden): the words carry the state.',
      "A picture loads at once, because it is often the largest thing on screen, unless the state is compact.",
    ],
    Layout: [
      "Centred. The title, then a line of body capped at the measure, then the actions, which wrap under each other when they run out of room.",
      "page: the display title style when the brand uses one for titles, and a 160px picture. section: the large heading and 112px. compact: the heading, meta text, small buttons and 64px.",
      "Without a picture, an icon sits in flow above the title: 24px on a page, 20px otherwise, in a quiet colour and with no tile. A tile above a heading is the generic feature-card template.",
    ],
    States: ["The six kinds in the table, in three sizes, standing alone or flat inside a card."],
    Copy: [
      'Say what is empty, then what to do: "No clients yet. Add your first client to start sending invoices."',
      'Could not load names the system: "We couldn\'t load invoices. [Source] is not responding." Never a vague apology in place of the cause.',
    ],
    Rules: [
      "page when the empty thing is the whole page, section inside a card or pane, compact in narrow places.",
      "Inside a table it replaces the rows and keeps the header and the toolbar.",
      "A brand with no character or illustrations passes neither picture nor icon, or an icon only.",
      "The character for mess stands for the system's mess, never the person's own mistake.",
    ],
    Open: [
      "The reference's character prop took a state name from the brand's pack. The kit carries no pack, so picture takes the pose's file or element instead.",
    ],
  },
  frame: { width: 960, height: 1220 },
  examples: [
    {
      id: "page",
      title: "Page",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.EmptyState" size="page" icon="Users" title="No clients yet." actions="{{addClient}}">Add your first client to start sending invoices.</x-import>`,
      vals: { addClient: [{ label: "Add client", variant: "primary", icon: "Plus" }, { label: "Import clients", icon: "Upload" }] },
    },
    {
      id: "card",
      title: "Section, flat inside a card",
      layout: "block",
      markup: `<div style="${CARD}">
<div style="padding: 12px 16px; border-bottom: 1px solid var(--line);"><h3 class="type-heading-sm" style="margin: 0; color: var(--text-strong);">Invoices</h3></div>
<x-import component-from-global-scope="NS.EmptyState" flat="{{yes}}" icon="ListFilter" title="No invoices match these filters." actions="{{clearFilters}}" heading-level="{{four}}">Try a wider date range, or clear the filters.</x-import>
</div>`,
      vals: { yes: true, four: 4, clearFilters: [{ label: "Clear filters", icon: "X" }] },
    },
    {
      id: "compact",
      title: "Compact, in a narrow pane",
      layout: "row",
      markup: `<div style="${CARD} width: 300px;">
<x-import component-from-global-scope="NS.EmptyState" size="compact" flat="{{yes}}" icon="CircleCheck" title="All caught up.">Nothing is waiting on you.</x-import>
</div>`,
    },
    {
      id: "kinds",
      title: "Could not load, no access, not found",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: start;">
<x-import component-from-global-scope="NS.EmptyState" icon="CloudOff" title="We couldn't load invoices." actions="{{tryAgain}}">[Source] is not responding. Last checked at [9:42 am].</x-import>
<x-import component-from-global-scope="NS.EmptyState" icon="Lock" title="You don't have access to pay runs." actions="{{backHome}}">Ask [Sam Lee], your admin, to give you access.</x-import>
<x-import component-from-global-scope="NS.EmptyState" icon="Search" title="This invoice no longer exists." actions="{{backToList}}">It may have been deleted or merged with another.</x-import>
</div>`,
      vals: {
        tryAgain: [{ label: "Try again", icon: "RotateCcw" }],
        backHome: [{ label: "Back to home", variant: "link", href: "#home" }],
        backToList: [{ label: "Back to invoices", variant: "link", href: "#invoices" }],
      },
    },
  ],
  checks: [
    {
      name: "headingLevel sets the title's level: 2 for a page, 3 otherwise, or the level it is given",
      example: "page",
      async run({ page, expect }) {
        const level = (example) => page.locator(`[data-example="${example}"] [data-slot="empty-title"]`).first().evaluate((el) => el.tagName)
        expect.equal(await level("page"), "H2", "a page, by default")
        expect.equal(await level("card"), "H4", "given 4, under the card's h3")
        expect.equal(await level("compact"), "H3", "compact, by default")
        expect.equal(await level("kinds"), "H3", "a section, by default")
        // The board keeps its own one h1, so the whole-page level is proven off the board.
        const wholePage = await page.evaluate(() => {
          const ns = Object.keys(window)
            .map((k) => {
              try {
                return window[k]
              } catch {
                return null
              }
            })
            .find((v) => v && typeof v === "object" && v.EmptyState && v.Root)
          const host = document.createElement("div")
          document.body.append(host)
          window.ReactDOM.flushSync(() => window.ReactDOM.createRoot(host).render(window.React.createElement(ns.EmptyState, { size: "page", headingLevel: 1, title: "No jobs yet." })))
          const tag = host.querySelector('[data-slot="empty-title"]').tagName
          host.remove()
          return tag
        })
        expect.equal(wholePage, "H1", "given 1, as the whole page")
      },
    },
    {
      name: "Title sizes step down: display for a page, heading in a section, the small heading when compact",
      example: "page",
      async run({ page, expect }) {
        const size = (example) => page.locator(`[data-example="${example}"] [data-slot="empty-title"]`).first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
        const [pageSize, section, compact] = [await size("page"), await size("kinds"), await size("compact")]
        expect(pageSize > section && section > compact, `title sizes were ${pageSize}, ${section} and ${compact}`)
      },
    },
    {
      name: "The picture is decoration, loading at once unless the state is compact; an icon is hidden too, and has no tile",
      example: "page",
      async run({ page, scope, expect }) {
        expect.equal(await scope.locator('[data-slot="empty-icon"] svg').getAttribute("aria-hidden"), "true", "the icon is hidden")
        expect.equal(await style(scope.locator('[data-slot="empty-icon"]'), "backgroundColor"), "rgba(0, 0, 0, 0)", "no tile behind the icon")
        const pictures = await page.evaluate(() => {
          const ns = Object.keys(window)
            .map((k) => {
              try {
                return window[k]
              } catch {
                return null
              }
            })
            .find((v) => v && typeof v === "object" && v.EmptyState && v.Root)
          const host = document.createElement("div")
          document.body.append(host)
          const dot = "data:image/gif;base64,R0lGODlhAQABAAAAACw="
          const h = window.React.createElement
          window.ReactDOM.flushSync(() =>
            window.ReactDOM.createRoot(host).render(
              h("div", null, h(ns.EmptyState, { size: "section", picture: dot, title: "No jobs yet." }), h(ns.EmptyState, { size: "compact", picture: dot, title: "No jobs yet." }))
            )
          )
          return [...host.querySelectorAll("img")].map((img) => [img.getAttribute("alt"), img.getAttribute("loading")].join(" "))
        })
        expect.equal(pictures.join(", "), " eager,  lazy", "alt is empty; compact loads lazily")
      },
    },
    {
      name: "Flat drops its own surface and edge; on its own it sits on the surface with a hairline",
      example: "card",
      async run({ page, scope, expect }) {
        const flat = scope.locator('[data-slot="empty-state"]')
        expect.equal(await style(flat, "backgroundColor"), "rgba(0, 0, 0, 0)", "flat has no surface of its own")
        expect.equal(await style(flat, "borderTopWidth"), "0px", "flat has no edge")
        const alone = page.locator('[data-example="kinds"] [data-slot="empty-state"]').first()
        expect.equal(await style(alone, "borderTopStyle"), "solid", "alone it has an edge")
        expect(await style(alone, "backgroundColor") !== "rgba(0, 0, 0, 0)", "alone it sits on the surface")
      },
    },
    {
      name: "Actions sit centred under the words, the primary first",
      example: "page",
      async run({ scope, expect }) {
        const root = await scope.locator('[data-slot="empty-state"]').boundingBox()
        const actions = await scope.locator('[data-slot="empty-state-actions"]').boundingBox()
        const title = await scope.locator('[data-slot="empty-title"]').boundingBox()
        expect(Math.abs(actions.x + actions.width / 2 - (root.x + root.width / 2)) <= 1, "the actions are centred")
        expect.atLeast(actions.y, title.y + title.height, "the actions are under the words")
        expect.equal(await scope.locator('[data-slot="empty-state-actions"] [data-slot="button"]').first().getAttribute("data-variant"), "default", "the primary comes first")
      },
    },
    {
      name: "Title and body hold 4.5:1 on the surface, in both themes",
      example: "kinds",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const state of await scope.locator('[data-slot="empty-state"]').all()) {
          const ground = await style(state, "backgroundColor")
          expect.atLeast(contrast(await style(state.locator('[data-slot="empty-title"]'), "color"), ground), 4.5, `${theme} title`)
          expect.atLeast(contrast(await style(state.locator('[data-slot="empty-description"]'), "color"), ground), 4.5, `${theme} body`)
        }
      },
    },
  ],
}
