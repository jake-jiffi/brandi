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
      id: "on-brand",
      title: "On a brand-coloured field",
      markup: `<div style="display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 12px; background: var(--brand); color: var(--on-brand);"><span style="font-size: 16px;">Welcome back</span><x-import component-from-global-scope="NS.SampleBadge"></x-import></div>`,
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
      name: "Its words hold 4.5:1 on any ground, a brand-coloured field included, in both themes",
      example: "on-brand",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        // Against the first painted ground under the words: the badge's own, or the field's when it has none.
        const [fg, bg] = await scope.locator('[data-slot="sample-badge"]').evaluate((el) => {
          let ground = "rgb(255, 255, 255)"
          for (let n = el; n; n = n.parentElement) {
            const c = getComputedStyle(n).backgroundColor
            if (c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c)) { ground = c; break }
          }
          return [getComputedStyle(el).color, ground]
        })
        const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
        const lum = ([r, g, b]) => [r, g, b].map((c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((t, c, i) => t + c * [0.2126, 0.7152, 0.0722][i], 0)
        const [hi, lo] = [lum(rgb(fg)), lum(rgb(bg))].sort((a, b) => b - a)
        expect.atLeast(Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100, 4.5, `its words on its own surface in ${theme}`)
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
