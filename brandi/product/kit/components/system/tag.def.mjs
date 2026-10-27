// Tag's one definition: its README, its preview board and its scripted checks all come from here.

const hexToRgb = (hex) => {
  const h = hex.trim().replace("#", "")
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}
async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}

export default {
  name: "Tag",
  group: "Status",
  job: "A category someone assigned: an outlined label with the category's colour dot, so it never reads as a status.",
  status: "proven",
  props: [
    { name: "color", type: '1 | 2 | 3 | 4 | 5 | 6 | "grey"', default: '"grey"', doc: "The category's chart series slot, so it looks the same in a table and in a chart. Grey for unknown or unset." },
    { name: "dot", type: "boolean", default: "true", doc: "False for a token with no category colour, such as a person or a team." },
    { name: "onRemove", type: "() => void", doc: 'Adds a remove button named "Remove [tag]", with a 24px hit area, 40px on a touch screen.' },
    { name: "removeLabel", type: "string", doc: 'The remove button\'s name, when the tag\'s words are not plain text. "Remove [tag]" by default.' },
    { name: "children", type: "ReactNode", doc: "The category's name." },
  ],
  notes: {
    Behaviour: [
      "The remove button is a real button, reached with Tab and pressed with Enter or Space. Moving focus after a removal belongs to the list that holds the tags.",
      "A name cut short shows in full on hover, on keyboard focus and on a long press.",
    ],
    Layout: ["24px tall. On a touch screen the remove button's hit area grows to 40px without changing the tag's size."],
    States: ["Six series colours and grey. Removable. A name cut short. Forced colours keep the dot's series colour, as a chart's marks do."],
    Rules: [
      "A category keeps its colour everywhere in the product, the same slot as its chart series.",
      "Status is a Badge, never a Tag. A tag is outlined on the surface; a badge is tinted in its tone.",
      "Never fill a tag with a tag-N tint: that is how the round 1 lookalike came back.",
    ],
  },
  examples: [
    {
      id: "colours",
      title: "Series colours, and grey for unset",
      markup: `<x-import component-from-global-scope="NS.Tag" color="{{c1}}">[Wholesale]</x-import>
<x-import component-from-global-scope="NS.Tag" color="{{c2}}">[Retail]</x-import>
<x-import component-from-global-scope="NS.Tag" color="{{c3}}">[Online]</x-import>
<x-import component-from-global-scope="NS.Tag" color="{{c4}}">[Events]</x-import>
<x-import component-from-global-scope="NS.Tag" color="{{c5}}">[Corporate]</x-import>
<x-import component-from-global-scope="NS.Tag" color="{{c6}}">[Trade]</x-import>
<x-import component-from-global-scope="NS.Tag">Unassigned</x-import>`,
      vals: { c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6 },
    },
    {
      id: "removable",
      title: "Removable",
      markup: `<x-import component-from-global-scope="NS.Tag" color="{{c1}}" on-remove="{{removeTag}}">[Wholesale]</x-import>
<x-import component-from-global-scope="NS.Tag" color="{{c3}}" on-remove="{{removeTag}}">[Online]</x-import>`,
      vals: { c1: 1, c3: 3 },
    },
    {
      id: "long",
      title: "A long name, cut short",
      markup: `<x-import component-from-global-scope="NS.Tag" color="{{c4}}">[Regional events and trade shows]</x-import>`,
      vals: { c4: 4 },
    },
  ],
  logic: `removeTag: () => { window.__tagRemoved = (window.__tagRemoved || 0) + 1 }`,
  checks: [
    {
      name: "A tag is outlined on the surface, never tinted, and its dot is its series colour, in both themes",
      example: "colours",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const vars = await scope.evaluate(() => {
          const s = getComputedStyle(document.documentElement)
          return { surface: s.getPropertyValue("--surface"), s3: s.getPropertyValue("--series-3") }
        })
        const tag = scope.locator('[data-slot="tag"][data-color="3"]')
        const look = await tag.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, edge: getComputedStyle(el).borderTopWidth }))
        expect.equal(look.bg, hexToRgb(vars.surface), "the tag sits on the plain surface")
        expect.equal(look.edge, "1px", "the tag is outlined")
        const dot = await tag.locator('[data-slot="tag-dot"]').evaluate((el) => getComputedStyle(el).backgroundColor)
        expect.equal(dot, hexToRgb(vars.s3), "the dot is the series 3 colour")
        expect.equal(await scope.locator('[data-slot="tag-dot"]').count(), 7, "every tag carries a dot")
      },
    },
    {
      name: "The remove button is named Remove [tag], has a 24px hit area, and Enter presses it",
      example: "removable",
      async run({ page, scope, expect }) {
        const remove = scope.getByRole("button", { name: "Remove [Wholesale]" })
        const box = await remove.boundingBox()
        expect.atLeast(Math.round(box.width), 24, "hit area width")
        expect.atLeast(Math.round(box.height), 24, "hit area height")
        expect(await tabTo(page, remove), "Tab reaches the remove button")
        await page.keyboard.press("Enter")
        expect.equal(await page.evaluate(() => window.__tagRemoved), 1, "Enter pressed the remove button once")
      },
    },
    {
      name: "On a touch screen the remove button grows to 40px and the tag stays 24px",
      example: "removable",
      touch: true,
      async run({ scope, expect }) {
        const remove = scope.getByRole("button", { name: "Remove [Online]" })
        const box = await remove.boundingBox()
        expect.atLeast(Math.round(box.width), 40, "touch hit area width")
        expect.atLeast(Math.round(box.height), 40, "touch hit area height")
        const tag = await scope.locator('[data-slot="tag"]').nth(1).boundingBox()
        expect.equal(Math.round(tag.height), 24, "the tag keeps its height")
      },
    },
    {
      name: "A name cut short shows in full on keyboard focus",
      example: "long",
      async run({ page, scope, expect }) {
        expect(await scope.locator('[data-slot="tag-label"]').evaluate((el) => el.scrollWidth > el.clientWidth), "the long name is cut short")
        // Said outright, rather than as a 30 s wait: a name cut by a single pixel once got no tooltip at all.
        expect.equal(await scope.locator('[data-slot="tooltip-trigger"]').count(), 1, "the cut tag has its tooltip")
        expect(await tabTo(page, scope.locator('[data-slot="tooltip-trigger"]')), "Tab reaches the cut tag")
        const tip = page.locator('[data-slot="tooltip-content"]')
        await tip.waitFor({ state: "visible", timeout: 2000 })
        expect((await tip.innerText()).includes("[Regional events and trade shows]"), "the tooltip holds the full name")
      },
    },
    {
      name: "Forced colours keep each dot's series colour",
      example: "colours",
      forcedColors: true,
      async run({ scope, expect }) {
        const s1 = await scope.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--series-1"))
        const dot = await scope.locator('[data-slot="tag"][data-color="1"] [data-slot="tag-dot"]').evaluate((el) => getComputedStyle(el).backgroundColor)
        expect.equal(dot, hexToRgb(s1), "the series colour survives forced colours")
      },
    },
  ],
}
