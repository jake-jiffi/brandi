// ButtonGroup's one definition: its README, its preview board and its scripted checks all come from here.

const boxes = async (locator) => Promise.all((await locator.all()).map((el) => el.boundingBox()))

export default {
  name: "ButtonGroup",
  group: "Actions",
  job: "Related buttons with an 8px gap, wrapping on narrow screens.",
  status: "proven",
  props: [
    { name: "label", type: "string", doc: "Names the group for screen readers ([Invoice] actions). Without one it is a plain row and nothing is announced." },
    { name: "align", type: '"start" | "end"', default: '"start"', doc: "end for a footer: the primary at the right edge, and wrapped rows aligned under it." },
    { name: "children", type: "ReactNode", doc: "The Buttons, in order: secondary first, the primary last, Cancel immediately left of it." },
  ],
  notes: {
    Behaviour: [
      "Tab moves through the buttons in reading order, which is the order they are written in.",
      "With a label it is a group named by it; without one it adds nothing for screen readers.",
    ],
    Layout: [
      "Wraps by its own width, never the window: when the buttons do not fit, the last ones move to a new row, 8px below.",
      "It never inspects its children, so the canvas's wrapper round each Button changes nothing.",
    ],
    Rules: [
      "Secondary first, the primary last, and Cancel immediately left of the primary.",
      "One primary per view. A destructive action that can be undone stays a normal button.",
      "A Spacer inside the group pushes what follows to the far end, such as Archive on the left and Save on the right.",
    ],
  },
  examples: [
    {
      id: "footer",
      title: "A footer, aligned to the end",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ButtonGroup" label="[Invoice 1042] actions" align="end">
<x-import component-from-global-scope="NS.Button">Save draft</x-import>
<x-import component-from-global-scope="NS.Button">Cancel</x-import>
<x-import component-from-global-scope="NS.Button" variant="primary" icon="Send">Send invoice</x-import>
</x-import>`,
    },
    {
      id: "start",
      title: "In flow, aligned to the start",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ButtonGroup">
<x-import component-from-global-scope="NS.Button" icon="Download">Export</x-import>
<x-import component-from-global-scope="NS.Button" icon="Printer">Print</x-import>
</x-import>`,
    },
    {
      id: "narrow",
      title: "In a narrow space it wraps",
      layout: "block",
      width: 260,
      markup: `<x-import component-from-global-scope="NS.ButtonGroup" label="[Invoice 1043] actions" align="end">
<x-import component-from-global-scope="NS.Button">Save draft</x-import>
<x-import component-from-global-scope="NS.Button">Cancel</x-import>
<x-import component-from-global-scope="NS.Button" variant="primary" icon="Send">Send invoice</x-import>
</x-import>`,
    },
  ],
  frame: { width: 960, height: 380 },
  checks: [
    {
      name: "Buttons sit 8px apart",
      example: "footer",
      async run({ scope, expect }) {
        const b = await boxes(scope.getByRole("button"))
        for (let i = 1; i < b.length; i++) expect.equal(Math.round(b[i].x - (b[i - 1].x + b[i - 1].width)), 8, "gap between buttons")
      },
    },
    {
      name: "Aligned to the end, the primary sits at the right edge",
      example: "footer",
      async run({ scope, expect }) {
        const group = await scope.getByRole("group").boundingBox()
        const last = (await boxes(scope.getByRole("button"))).at(-1)
        expect.equal(Math.round(last.x + last.width), Math.round(group.x + group.width), "the primary's right edge")
        expect.equal(await scope.getByRole("button").last().innerText(), "Send invoice", "the primary is last")
      },
    },
    {
      name: "In a narrow space it wraps instead of overflowing, rows 8px apart",
      example: "narrow",
      async run({ scope, expect }) {
        const group = scope.getByRole("group")
        expect(await group.evaluate((el) => el.scrollWidth <= el.clientWidth), "nothing overflows the group")
        const b = await boxes(scope.getByRole("button"))
        const rows = [...new Set(b.map((x) => Math.round(x.y)))].sort((p, q) => p - q)
        expect.atLeast(rows.length, 2, "rows")
        const firstRowBottom = Math.max(...b.filter((x) => Math.round(x.y) === rows[0]).map((x) => x.y + x.height))
        expect.equal(Math.round(rows[1] - firstRowBottom), 8, "gap between rows")
        const g = await group.boundingBox()
        for (const x of b) expect(x.x + x.width <= g.x + g.width + 0.5, "every button inside the group")
      },
    },
    {
      name: "A labelled group is named for screen readers, and an unlabelled one adds nothing",
      async run({ page, expect }) {
        expect.equal(await page.locator('[data-example="footer"]').getByRole("group", { name: "[Invoice 1042] actions" }).count(), 1, "named group")
        expect.equal(await page.locator('[data-example="start"] [data-slot="button-group"]').getAttribute("role"), null, "no role without a label")
      },
    },
    {
      name: "On touch the buttons grow to 44px and keep 8px apart",
      example: "footer",
      touch: true,
      async run({ scope, expect }) {
        const b = await boxes(scope.getByRole("button"))
        for (const x of b) expect.equal(Math.round(x.height), 44, "touch height")
        for (let i = 1; i < b.length; i++) expect.equal(Math.round(b[i].x - (b[i - 1].x + b[i - 1].width)), 8, "gap on touch")
      },
    },
  ],
}
