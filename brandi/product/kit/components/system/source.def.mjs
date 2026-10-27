// Source's one definition: its README, its preview board and its scripted checks all come from here.

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
async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}

const ANSWER = "display: flex; flex-direction: column; gap: 12px; max-width: 560px;"
const ROW = "display: flex; flex-wrap: wrap; gap: 8px;"

export default {
  name: "Source",
  group: "The assistant",
  job: "A citation chip under an answer: where a figure came from, linking to it.",
  status: "proven",
  props: [
    { name: "href", type: "string", required: true, doc: "Where the figure came from: the record, the report, the document." },
    { name: "icon", type: "IconName", default: '"FileText"', doc: "What kind of source it is. Decoration: the label says what it is." },
    { name: "children", type: "ReactNode", doc: 'The document and the place in it: "[March] ledger, [accounting system]", "[Invoice 1042], line 3".' },
    { name: "target", type: '"_blank"', doc: "Opens in a new tab, and says so to screen readers." },
  ],
  notes: {
    Behaviour: [
      "A link named by its label, which says where it goes. The icon is hidden from screen readers.",
      'A source that opens in a new tab shows the external icon and adds "(opens in a new tab)" to its name.',
      "A label cut short shows in full on hover, on keyboard focus and on a long press. Its name is the full label either way.",
    ],
    Layout: ["28px tall on a desktop and 44px on a touch screen: the chip itself is the target. Chips sit 8px apart and wrap."],
    States: ["Rest, hover, pressed and focus. Its edge holds 3:1 and its label 4.5:1 on the surface, in both themes."],
    Copy: ["Name the document and the place, not only the system: a row, a page, a record. A figure the assistant worked out names its inputs (from [12] invoices)."],
    Rules: [
      "Every figure in an answer has a source. AIAnswer lays them out under the answer; one can also sit in the sentence it supports.",
      "It navigates, so it is a link, never a button.",
    ],
    Review: ["Its touch area was 2px short (round 6c)."],
  },
  frame: { width: 960, height: 300 },
  examples: [
    {
      id: "under-answer",
      title: "Under the figures they back",
      layout: "block",
      markup: `<div style="${ANSWER}">
<p class="type-body" style="margin: 0; color: var(--text);">[3] invoices are overdue, worth [$4,280] in total. The oldest is [18] days late.</p>
<div style="${ROW}">
<x-import component-from-global-scope="NS.Source" href="#march-ledger" icon="BookOpen">[March] ledger, [accounting system]</x-import>
<x-import component-from-global-scope="NS.Source" href="#invoice-1042" icon="Receipt">[Invoice 1042], line 3</x-import>
<x-import component-from-global-scope="NS.Source" href="#aged-receivables" icon="ChartColumn" target="_blank">[Aged receivables] report</x-import>
</div>
</div>`,
    },
    {
      id: "long",
      title: "A long label, cut short",
      layout: "block",
      markup: `<div style="${ROW} max-width: 320px;">
<x-import component-from-global-scope="NS.Source" href="#statement">[Northside Plumbing and Gas] statement, [September] to [October]</x-import>
</div>`,
    },
  ],
  checks: [
    {
      name: "A link named by its label, with the icon hidden",
      example: "under-answer",
      async run({ scope, expect }) {
        const link = scope.getByRole("link", { name: "[March] ledger, [accounting system]", exact: true })
        expect.equal(await link.count(), 1, "named by its label alone")
        expect.equal(await link.getAttribute("href"), "#march-ledger", "it links to the source")
        expect.equal(await link.locator("svg").first().getAttribute("aria-hidden"), "true", "the icon is decoration")
      },
    },
    {
      name: "A source that opens a new tab says so",
      example: "under-answer",
      async run({ scope, expect }) {
        const link = scope.getByRole("link", { name: "[Aged receivables] report (opens in a new tab)", exact: true })
        expect.equal(await link.count(), 1, "the name says it opens a new tab")
        expect.equal(await link.getAttribute("rel"), "noopener noreferrer", "and it opens safely")
      },
    },
    {
      name: "28px on a desktop, above the 24px floor",
      example: "under-answer",
      async run({ scope, expect }) {
        for (const chip of await scope.locator('[data-slot="source"]').all()) expect.equal(Math.round((await chip.boundingBox()).height), 28, "desktop height")
      },
    },
    {
      name: "44px on a touch screen, the full target, 8px apart",
      example: "under-answer",
      touch: true,
      async run({ scope, expect }) {
        const boxes = await Promise.all((await scope.locator('[data-slot="source"]').all()).map((chip) => chip.boundingBox()))
        for (const box of boxes) expect.equal(Math.round(box.height), 44, "touch height")
        const sameRow = boxes.filter((b) => Math.abs(b.y - boxes[0].y) < 2)
        for (let i = 1; i < sameRow.length; i++) expect.atLeast(Math.round(sameRow[i].x - (sameRow[i - 1].x + sameRow[i - 1].width)), 8, "space between chips")
      },
    },
    {
      name: "The label holds 4.5:1 and the edge 3:1 on the surface, in both themes",
      example: "under-answer",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const chip of await scope.locator('[data-slot="source"]').all()) {
          const c = await chip.evaluate((el) => {
            const s = getComputedStyle(el)
            const probe = document.createElement("span")
            probe.style.background = "var(--canvas)"
            document.body.append(probe)
            const ground = getComputedStyle(probe).backgroundColor
            probe.remove()
            return { ink: s.color, fill: s.backgroundColor, edge: s.borderTopColor, ground }
          })
          expect.atLeast(contrast(c.ink, c.fill), 4.5, `${theme} label`)
          expect.atLeast(contrast(c.edge, c.ground), 3, `${theme} edge against the ground`)
        }
      },
    },
    {
      name: "Focus shows the system's outline",
      example: "under-answer",
      async run({ page, scope, expect }) {
        const first = scope.locator('[data-slot="source"]').first()
        expect(await tabTo(page, first), "Tab reaches the first source")
        expect.equal(await first.evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "the outline shows")
      },
    },
    {
      name: "A label cut short shows in full on keyboard focus",
      example: "long",
      async run({ page, scope, expect }) {
        const label = scope.locator('[data-slot="source-label"]')
        expect(await label.evaluate((el) => el.scrollWidth > el.clientWidth), "the label is cut short")
        expect(await tabTo(page, scope.locator('[data-slot="source"]')), "Tab reaches the source")
        const tip = page.locator('[data-slot="tooltip-content"]')
        await tip.waitFor({ state: "visible", timeout: 2000 })
        expect((await tip.innerText()).includes("[Northside Plumbing and Gas] statement"), "the tooltip holds the full label")
        const name = await scope.getByRole("link").first().evaluate((el) => el.textContent)
        expect(name.includes("[October]"), "the link's name is the full label")
      },
    },
  ],
}
