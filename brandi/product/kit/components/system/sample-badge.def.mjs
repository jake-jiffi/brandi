// SampleBadge's one definition: its README, its preview board and its scripted checks all come from here.

export default {
  name: "SampleBadge",
  group: "Status",
  job: "Marks a screen or card that shows sample data, beside the page title, until the real connection is live.",
  status: "proven",
  props: [
    { name: "size", type: '"sm" | "md"', default: '"md"', doc: "24px beside a page title; 20px on a card." },
    { name: "children", type: "ReactNode", default: '"Sample data"', doc: "The words, when the product's own differ." },
  ],
  notes: {
    Behaviour: ["Read as its words, \"Sample data\", right after the title it sits beside."],
    States: ["Dashed and muted, so it never reads as a record's status. Forced colours keep the dashed edge."],
    Rules: [
      "It covers every figure on the screen. Invented names on that screen go in [brackets], so nobody takes them for real ones.",
      "It stays until the real connection is live, then goes, with nothing in its place.",
      "One per screen, beside the page title, or one per card when only some cards are samples.",
    ],
  },
  examples: [
    {
      id: "beside-a-title",
      title: "Beside a page title",
      markup: `<div style="display: flex; align-items: center; gap: 12px;"><span style="font-family: var(--font-display); font-size: 26px; line-height: 32px; color: var(--text-strong);">Revenue</span><x-import component-from-global-scope="NS.SampleBadge"></x-import></div>`,
    },
    {
      id: "sizes",
      title: "Sizes, and beside a status",
      markup: `<x-import component-from-global-scope="NS.SampleBadge" size="sm"></x-import>
<x-import component-from-global-scope="NS.SampleBadge"></x-import>
<x-import component-from-global-scope="NS.Badge" tone="neutral">Archived</x-import>`,
    },
  ],
  frame: { width: 960, height: 260 },
  checks: [
    {
      name: "It reads as its words and is dashed, so it never passes for a status",
      async run({ page, expect }) {
        const badge = page.locator('[data-example="sizes"] [data-slot="sample-badge"]').nth(1)
        expect.equal((await badge.innerText()).trim(), "Sample data", "its words")
        const own = await badge.evaluate((el) => getComputedStyle(el).borderTopStyle)
        const status = await page.locator('[data-example="sizes"] [data-slot="badge"]').evaluate((el) => getComputedStyle(el).borderTopStyle)
        expect.equal(own, "dashed", "the sample badge is dashed")
        expect.equal(status, "solid", "a status badge is solid")
        expect.equal(await badge.locator("svg").getAttribute("aria-hidden"), "true", "its icon is decoration")
      },
    },
    {
      name: "Forced colours keep the dashed edge",
      example: "beside-a-title",
      forcedColors: true,
      async run({ scope, expect }) {
        const edge = await scope.locator('[data-slot="sample-badge"]').evaluate((el) => `${getComputedStyle(el).borderTopStyle} ${getComputedStyle(el).borderTopWidth}`)
        expect.equal(edge, "dashed 1px", "the edge is still drawn")
      },
    },
  ],
}
