// Spacer's one definition: its README, its preview board and its scripted checks all come from here.

export default {
  name: "Spacer",
  group: "Navigation",
  job: "A flexible gap inside a Toolbar that pushes what follows to the far end.",
  status: "proven",
  props: [],
  notes: {
    Behaviour: ["Hidden from screen readers and never focusable: it is space, not content."],
    Layout: [
      "It takes whatever room the row has left, so everything after it sits at the far end.",
      "When the row wraps, it fills what is left of its own line and never pushes a control past the edge. In a footer aligned to the end, the primary lands under Cancel at the right edge.",
    ],
    Rules: [
      "One per row. In a Toolbar it sits after the filter chips, before the view switcher and secondary actions.",
      "It also works in a ButtonGroup: a destructive action on the left, Cancel and the primary on the right.",
    ],
  },
  examples: [
    {
      id: "toolbar",
      title: "In a toolbar",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Toolbar" label="[Report] controls">
<x-import component-from-global-scope="NS.FilterChip" count="{{n8}}">This month</x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n23}}">Last month</x-import>
<x-import component-from-global-scope="NS.Spacer"></x-import>
<x-import component-from-global-scope="NS.Button" variant="ghost" size="sm" icon="Download">Export</x-import>
</x-import>`,
      vals: { n8: 8, n23: 23 },
    },
    {
      id: "footer",
      title: "In a button row",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.ButtonGroup" label="[Invoice 1042] actions" align="end">
<x-import component-from-global-scope="NS.Button" variant="danger" icon="Archive">Archive</x-import>
<x-import component-from-global-scope="NS.Spacer"></x-import>
<x-import component-from-global-scope="NS.Button">Cancel</x-import>
<x-import component-from-global-scope="NS.Button" variant="primary">Save changes</x-import>
</x-import>`,
    },
    {
      id: "narrow",
      title: "In a narrow space the row wraps, the primary under Cancel",
      layout: "block",
      width: 240,
      markup: `<x-import component-from-global-scope="NS.ButtonGroup" label="[Invoice 1043] actions" align="end">
<x-import component-from-global-scope="NS.Button" variant="danger" icon="Archive">Archive</x-import>
<x-import component-from-global-scope="NS.Spacer"></x-import>
<x-import component-from-global-scope="NS.Button">Cancel</x-import>
<x-import component-from-global-scope="NS.Button" variant="primary">Save changes</x-import>
</x-import>`,
    },
  ],
  frame: { width: 960, height: 380 },
  checks: [
    {
      name: "What follows the Spacer sits at the far end of the toolbar",
      example: "toolbar",
      async run({ scope, expect }) {
        const row = await scope.locator('[data-slot="toolbar-row"]').boundingBox()
        const exportButton = await scope.getByRole("button", { name: "Export" }).boundingBox()
        const first = await scope.locator('[data-slot="filter-chip"]').first().boundingBox()
        expect.equal(Math.round(exportButton.x + exportButton.width), Math.round(row.x + row.width), "Export at the far end")
        expect.equal(Math.round(first.x), Math.round(row.x), "the chips at the start")
      },
    },
    {
      name: "In a button row it pushes Cancel and the primary to the right, Archive staying left",
      example: "footer",
      async run({ scope, expect }) {
        const group = await scope.getByRole("group").boundingBox()
        const archive = await scope.getByRole("button", { name: "Archive" }).boundingBox()
        const save = await scope.getByRole("button", { name: "Save changes" }).boundingBox()
        expect.equal(Math.round(archive.x), Math.round(group.x), "Archive at the start")
        expect.equal(Math.round(save.x + save.width), Math.round(group.x + group.width), "Save changes at the end")
      },
    },
    {
      name: "Hidden from screen readers and never focusable",
      example: "toolbar",
      async run({ page, scope, expect }) {
        const spacer = scope.locator('[data-slot="spacer"]')
        expect.equal(await spacer.getAttribute("aria-hidden"), "true", "hidden from screen readers")
        expect.equal(await spacer.getAttribute("tabindex"), null, "no tab stop")
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => document.activeElement?.textContent), "Export", "Tab goes from the last chip straight to Export")
      },
    },
    {
      name: "In a narrow space the row wraps, nothing is pushed past the edge, and the primary stays right",
      example: "narrow",
      async run({ scope, expect }) {
        const group = scope.getByRole("group")
        expect(await group.evaluate((el) => el.scrollWidth <= el.clientWidth), "nothing spills past the row")
        const g = await group.boundingBox()
        for (const b of await Promise.all((await scope.getByRole("button").all()).map((x) => x.boundingBox()))) expect(b.x + b.width <= g.x + g.width + 0.5, "every button inside the row")
        const save = await scope.getByRole("button", { name: "Save changes" }).boundingBox()
        expect.equal(Math.round(save.x + save.width), Math.round(g.x + g.width), "the primary stays at the right edge")
      },
    },
  ],
}
