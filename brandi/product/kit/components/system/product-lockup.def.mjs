// ProductLockup's one definition.
export default {
  name: "ProductLockup",
  group: "Brand",
  job: "The mark with the product's name, for the top of the rail, sign-in and product emails.",
  status: "proven",
  props: [
    { name: "product", type: "string", default: "the name in lib/product.ts", doc: "The product's name as people say it." },
    { name: "color", type: '"auto" | "on-light" | "on-dark" | "ink" | "rail"', default: '"auto"', doc: "As Logo. With ink, the name takes the text colour around it too." },
    { name: "layout", type: '"inline" | "stacked"', default: '"inline"', doc: "Inline, with a hairline between mark and name, or stacked, the name under the mark." },
    { name: "height", type: "number", doc: "The mark's height in px, the logo system's preferred size by default." },
    { name: "href", type: "string", doc: 'Makes the whole lockup one link, named "[Brand] [product]", or the brand alone when the product has its name.' },
    { name: "tone", type: '"default" | "rail"', default: '"default"', doc: "`rail` on the rail and the top bar: the name takes the rail's strong text colour, and the rail asks for the mark drawn for its ground." },
  ],
  notes: {
    Behaviour: [
      'With href the whole lockup is one link named "[Brand] [product]", and the logo inside it is hidden, so nothing is read twice.',
      "A product that carries the brand's own name is the mark alone, with no hairline and no name beside it, and its link is named for the brand once.",
    ],
    Review: ['A product named for its brand read "[Brand] / [BRAND]", and its link was named twice (a pilot\'s round 1).'],
    Layout: [
      "A long name is cut with an ellipsis rather than widening the rail. The link's name keeps it whole for screen readers.",
      "Under a 24px mark the name steps down from the heading style to the label style.",
    ],
    Rules: [
      "The name is never larger than the mark. One per screen, top left.",
      "How the name is set is a brand-to-product decision: the body face in bold by default.",
    ],
    Open: [
      "A name cut short is whole for screen readers but still cut for sighted keyboard and touch users. Keep product names short enough to fit the rail.",
    ],
  },
  frame: { width: 960, height: 640 },
  logic: `brandName: NS.BRAND.name`,
  examples: [
    {
      id: "layouts",
      title: "Inline and stacked",
      markup: `<div class="flex flex-wrap items-start gap-12">
<x-import component-from-global-scope="NS.ProductLockup" product="[Rosters]"></x-import>
<x-import component-from-global-scope="NS.ProductLockup" product="[Rosters]" layout="stacked" height="{{h32}}"></x-import>
</div>`,
      vals: { h32: 32 },
    },
    {
      id: "link",
      title: "As one link",
      markup: `<x-import component-from-global-scope="NS.ProductLockup" product="[Rosters]" href="#"></x-import>`,
    },
    {
      id: "rail",
      title: "A long name in the rail",
      markup: `<div class="w-60 rounded-lg border border-line bg-rail px-4 py-5"><x-import component-from-global-scope="NS.ProductLockup" tone="rail" product="[Workforce planning and rostering]" href="#"></x-import></div>`,
    },
    {
      id: "ink",
      title: "Ink, on a brand-coloured rail",
      markup: `<div class="flex rounded-lg bg-brand px-4 py-5 text-on-brand"><x-import component-from-global-scope="NS.ProductLockup" product="[Rosters]" color="ink"></x-import></div>`,
    },
    {
      id: "same-name",
      title: "A product named for the brand: the mark alone",
      markup: `<x-import component-from-global-scope="NS.ProductLockup" product="{{brandName}}" href="#"></x-import>`,
    },
    {
      id: "sizes",
      title: "Sizes",
      markup: `<div class="flex flex-wrap items-center gap-12">
<x-import component-from-global-scope="NS.ProductLockup" product="[Rosters]" height="{{h16}}"></x-import>
<x-import component-from-global-scope="NS.ProductLockup" product="[Rosters]"></x-import>
<x-import component-from-global-scope="NS.ProductLockup" product="[Rosters]" height="{{h32}}"></x-import>
</div>`,
      vals: { h16: 16 },
    },
  ],
  checks: [
    {
      name: "With href it is one link, named for the brand and the product",
      example: "link",
      async run({ scope, expect, brand }) {
        expect.equal(await scope.getByRole("link").count(), 1, "links in the lockup")
        expect.equal(await scope.getByRole("link", { name: `${brand.name} [Rosters]` }).count(), 1, "the link's name")
        expect.equal(await scope.locator('[data-slot="logo"]').getAttribute("aria-hidden"), "true", "the logo inside is hidden")
      },
    },
    {
      name: "A product named for the brand shows the name once and is named once",
      example: "same-name",
      async run({ scope, expect, brand }) {
        expect.equal(await scope.getByRole("link", { name: brand.name, exact: true }).count(), 1, "one link, named for the brand once")
        expect.equal(await scope.locator('[data-slot="product-lockup-rule"]').count(), 0, "no hairline")
        expect.equal(await scope.locator('[data-slot="logo"]').count(), 1, "one mark")
        // The kit's stand-in spells PRODUCT, so with it the name is in words; a drawn logo says the name itself.
        const named = scope.locator('[data-slot="product-lockup-name"]')
        if (brand.standIn) expect.equal(await named.innerText(), brand.name, "the brand's name in words, once")
        else expect.equal(await named.count(), 0, "no name beside the mark: the mark says it")
      },
    },
    {
      name: "With no drawn logo, the stand-in's symbol stands beside the brand's name in words, never the stand-in's PRODUCT",
      example: "link",
      async run({ scope, expect, brand }) {
        // A brand with its own logo shows it; this holds the lockup a brand with none gets.
        if (!brand.standIn) return
        const logo = scope.locator('[data-slot="logo"]')
        const shown = await logo.evaluate((el) => [...el.querySelectorAll('[data-slot="logo-rendition"]')].find((r) => r.checkVisibility())?.dataset.rendition)
        expect.equal(shown?.startsWith("symbol"), true, `the symbol, not the full stand-in: got ${shown}`)
        expect.equal(await logo.getAttribute("aria-hidden"), "true", "hidden: the words carry the name")
        expect.equal(await scope.locator('[data-slot="product-lockup-name"]').innerText(), `${brand.name} [Rosters]`, "the brand and the product, in words")
        expect.equal(await scope.locator('[data-slot="product-lockup-rule"]').count(), 0, "no hairline between a symbol and words")
      },
    },
    {
      name: "The keyboard reaches it and it shows the system's outline",
      example: "link",
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link")
        for (let i = 0; i < 10 && !(await link.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab")
        expect(await link.evaluate((el) => el === document.activeElement), "Tab reaches the lockup")
        expect.equal(await link.evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "outline when focused from the keyboard")
      },
    },
    {
      name: "A long name is cut with an ellipsis and stays inside the rail",
      example: "rail",
      async run({ scope, expect, brand }) {
        const name = scope.locator('[data-slot="product-lockup-name"]')
        const cut = await name.evaluate((el) => el.scrollWidth > el.clientWidth && getComputedStyle(el).textOverflow === "ellipsis")
        expect(cut, "the name is cut with an ellipsis")
        const rail = await scope.locator(".w-60").boundingBox()
        const lockup = await scope.locator('[data-slot="product-lockup"]').boundingBox()
        expect(lockup.x + lockup.width <= rail.x + rail.width, "the lockup stays inside the rail")
        expect.equal(await scope.getByRole("link", { name: `${brand.name} [Workforce planning and rostering]` }).count(), 1, "the whole name in the link's name")
      },
    },
    {
      name: "The name is never larger than the mark",
      example: "sizes",
      async run({ scope, expect }) {
        for (const lockup of await scope.locator('[data-slot="product-lockup"]').all()) {
          const mark = (await lockup.locator('[data-slot="logo"]').boundingBox()).height
          const size = await lockup.locator('[data-slot="product-lockup-name"]').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
          expect(size <= mark, `a ${size}px name beside a ${mark}px mark`)
        }
      },
    },
    {
      name: "On a touch screen the link is 40px tall at least",
      example: "link",
      touch: true,
      async run({ scope, expect }) {
        expect.atLeast((await scope.getByRole("link").boundingBox()).height, 40, "link height on touch")
      },
    },
  ],
}
