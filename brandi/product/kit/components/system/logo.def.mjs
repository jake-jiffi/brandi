// Logo's one definition.
// The rendition actually on screen: a hidden group's children keep their own display value, so this
// asks the browser what it draws.
const shown = (logo) =>
  logo.evaluate((el) => [...el.querySelectorAll('[data-slot="logo-rendition"]')].find((r) => r.checkVisibility())?.dataset.rendition)
// Whether the rail is darker than its words where `el` sits: the test the tokens use to set the rail's marks.
const railIsDark = (el) => {
  const lum = (value) => {
    const p = document.createElement("span")
    p.style.color = value
    el.appendChild(p)
    const [r, g, b] = (getComputedStyle(p).color.match(/[\d.]+/g) ?? []).slice(0, 3).map((c) => {
      const s = Number(c) / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    p.remove()
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  return lum("var(--rail)") < lum("var(--rail-text-strong)")
}
// The rendition drawn for dark grounds, as Logo picks it: the brand's own, else its single ink, else the full logo.
const onDarkOf = (page) =>
  page.evaluate(() => {
    const marks = Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)?.BRAND?.marks ?? {}
    return marks["full-on-dark"] ? "full-on-dark" : marks["full-ink"] ? "full-ink" : "full"
  })

const tile = "flex flex-col items-start gap-3 rounded-md border border-line bg-surface p-5"

export default {
  name: "Logo",
  group: "Brand",
  job: "The brand's mark, from the master artwork: never set in type, never redrawn.",
  status: "proven",
  props: [
    { name: "mark", type: '"full" | "symbol"', default: '"full"', doc: "The full logo, or the symbol alone for square and narrow places such as the collapsed rail. A brand without a symbol shows its full logo. A mark much wider than tall (over 1.5 times) is never taken as the symbol: the starter leaves it out, and the icons rail shows its Home control." },
    { name: "color", type: '"auto" | "on-light" | "on-dark" | "ink" | "rail"', default: '"auto"', doc: "Which of the brand's approved renditions. See Renditions." },
    { name: "height", type: "number", doc: "Height in px. Defaults to the logo system's preferred size, and the symbol to its own, 24px, never the full logo's. Anything under its minimum (the symbol's, for the symbol) is raised to it." },
    { name: "clearspace", type: "boolean", default: "false", doc: "Adds the logo system's clear space around the mark as padding. Off where layout already keeps it clear." },
    { name: "title", type: "string", default: "the brand's name", doc: 'Its accessible name. Pass "" when a parent link already names it.' },
  ],
  tables: [
    {
      title: "Renditions",
      head: ["color", "What it draws"],
      rows: [
        ["auto", "The light-ground rendition, the dark-ground one in the dark theme (or the single ink when the brand has none), and the single ink in forced colours"],
        ["on-light", "The rendition approved on light grounds, whatever the theme"],
        ["on-dark", "The rendition approved on dark grounds, or the single ink"],
        ["ink", "One ink in currentColor: the parent sets it, such as the label colour on a brand-coloured rail"],
        ["rail", "The rendition made for the rail's ground, from the rail's tone in each theme: the dark-ground one on a rail darker than its words. A direction's class that recolours the rail moves it too"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      'An image named by its title, the brand\'s name by default. With title="" it is hidden, for a link that already names it.',
      "The theme picks the rendition in CSS, so the server, the canvas and the product agree. Forced colours show the single ink as CanvasText, because an SVG keeps its own colours there.",
      "On the rail the rail's tone picks it, through --rail-mark-on-light and --rail-mark-on-dark, which the tokens set in each theme and a direction's class flips with the rail. Chosen when the bundle was built, a green-rail direction drew the mark made for dark grounds on green.",
    ],
    Layout: [
      "The height is set and the width follows the artwork, so it is never stretched. Clear space is padding worked out from the height and the logo system's ratio.",
      "The symbol has a size of its own, 24px or its minimum if that is larger, so it fits the icons rail's 40px home control. The full logo's preferred height, raised to a wide logo's minimum, once drew a symbol 107px wide there.",
    ],
    Rules: [
      "In product it lives in the rail lockup and on sign-in, never repeated in page headers.",
      "Tight-viewBox copies only: with the clear space inside the viewBox, the reference's letters were 9px tall in a 20px logo.",
      "Never stretch, rotate, add effects or recolour it outside its renditions. Variants, clear space and minimums come from the brand's logo system (brand-system's 08-logo-system.md).",
    ],
  },
  frame: { width: 960, height: 640 },
  examples: [
    {
      id: "renditions",
      title: "Renditions",
      markup: `<div class="flex flex-wrap items-stretch gap-4">
<div class="${tile}"><x-import component-from-global-scope="NS.Logo"></x-import><span class="type-meta text-text-muted">auto, follows the theme</span></div>
<div data-theme="light" class="${tile}"><x-import component-from-global-scope="NS.Logo" color="on-light"></x-import><span class="type-meta text-text-muted">on-light</span></div>
<div data-theme="dark" class="dark ${tile}"><x-import component-from-global-scope="NS.Logo" color="on-dark"></x-import><span class="type-meta text-text-muted">on-dark</span></div>
<div class="flex flex-col items-start gap-3 rounded-md bg-brand p-5 text-on-brand"><x-import component-from-global-scope="NS.Logo" color="ink"></x-import><span class="type-meta">ink, on the brand colour</span></div>
</div>`,
    },
    {
      id: "sizes",
      title: "Sizes and the minimum",
      markup: `<div class="flex flex-wrap items-end gap-10">
<div class="flex flex-col items-start gap-2"><x-import component-from-global-scope="NS.Logo" height="{{h16}}"></x-import><span class="type-meta text-text-muted">16px, the minimum</span></div>
<div class="flex flex-col items-start gap-2"><x-import component-from-global-scope="NS.Logo" height="{{h24}}"></x-import><span class="type-meta text-text-muted">24px, preferred</span></div>
<div class="flex flex-col items-start gap-2"><x-import component-from-global-scope="NS.Logo" height="{{h40}}"></x-import><span class="type-meta text-text-muted">40px, sign-in</span></div>
<div class="flex flex-col items-start gap-2"><x-import component-from-global-scope="NS.Logo" height="{{h10}}" id="logo-raised"></x-import><span class="type-meta text-text-muted">Asked for 10px, drawn at 16px</span></div>
<div class="flex flex-col items-start gap-2"><x-import component-from-global-scope="NS.Logo" mark="symbol" id="logo-symbol-own"></x-import><span class="type-meta text-text-muted">The symbol alone, at its own size</span></div>
</div>`,
      vals: { h10: 10, h16: 16, h24: 24, h40: 40 },
    },
    {
      id: "clearspace",
      title: "Clear space",
      markup: `<div class="flex items-center gap-4">
<div class="inline-flex rounded-xs bg-surface-sunken"><x-import component-from-global-scope="NS.Logo" height="{{h40}}" clearspace="{{yes}}"></x-import></div>
<span class="max-w-measure type-meta text-text-muted">A quarter of the logo's height on every side, kept by padding rather than inside the file</span>
</div>`,
      vals: { yes: true },
    },
    {
      id: "rail",
      title: "On the rail",
      markup: `<div data-rail-tile="" class="flex flex-col items-start gap-3 rounded-md bg-rail p-5"><x-import component-from-global-scope="NS.Logo" color="rail"></x-import><span class="type-meta text-rail-muted">rail, follows the rail's tone</span></div>`,
    },
    {
      id: "link",
      title: "Inside a link that names it",
      markup: `<a href="#" aria-label="Product home" class="inline-flex rounded-xs"><x-import component-from-global-scope="NS.Logo" title=""></x-import></a>`,
    },
  ],
  checks: [
    {
      name: "It is an image named for the brand, drawn from the artwork and never set in type",
      example: "renditions",
      async run({ scope, expect, brand }) {
        const logo = scope.locator('[data-slot="logo"]').first()
        expect.equal(await logo.getAttribute("role"), "img", "its role")
        expect.equal(await logo.getAttribute("aria-label"), brand.name, "its accessible name")
        expect.equal((await logo.innerText()).trim(), "", "text inside the logo")
        expect.atLeast(await logo.locator("svg").count(), 1, "SVG renditions")
      },
    },
    {
      name: "Inside a link that names it, it is hidden, so nothing is read twice",
      example: "link",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="logo"]').getAttribute("aria-hidden"), "true", "hidden from screen readers")
        expect.equal(await scope.getByRole("link", { name: "Product home" }).count(), 1, "the link carries the name")
        expect.equal(await scope.getByRole("img").count(), 0, "images named inside the link")
      },
    },
    {
      name: "A height under the logo system's minimum is raised to it",
      example: "sizes",
      async run({ page, expect }) {
        const box = await page.locator("#logo-raised").boundingBox()
        // The brand's own minimum, as the bundle carries it: 16px is only the kit's placeholder.
        const min = await page.evaluate(() => Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)?.BRAND?.logo?.minHeight ?? 16)
        expect.equal(Math.round(box.height), Math.round(min), "drawn height for a 10px ask")
      },
    },
    {
      name: "The symbol is drawn at its own size, held to the symbol's minimum, never the full logo's height",
      example: "sizes",
      async run({ page, expect }) {
        const logo = await page.evaluate(() => Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)?.BRAND?.logo)
        const symbol = await page.evaluate(() => Boolean(Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)?.BRAND?.marks?.symbol))
        const box = await page.locator("#logo-symbol-own").boundingBox()
        // With no symbol the full logo stands in, at its own preferred size.
        const want = symbol ? Math.max(24, logo.symbolMinHeight) : Math.max(logo.height, logo.minHeight)
        expect.equal(Math.round(box.height), Math.round(want), "drawn height with no height asked")
      },
    },
    {
      name: "The theme picks the rendition, in both themes",
      example: "renditions",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const auto = scope.locator('[data-slot="logo"][data-color="auto"]')
        expect.equal(await shown(auto), theme === "dark" ? "full-on-dark" : "full", "the rendition on screen")
        expect.equal(await shown(scope.locator('[data-slot="logo"][data-color="on-light"]')), "full", "on-light, whatever the theme")
      },
    },
    {
      name: "On the rail it draws the rendition made for the rail's ground, and a direction's class flips it with the rail, in both themes",
      example: "rail",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const tile = scope.locator("[data-rail-tile]")
        const logo = tile.locator('[data-slot="logo"]')
        const onDark = await onDarkOf(page)
        const dark = await tile.evaluate(railIsDark)
        expect.equal(await shown(logo), dark ? onDark : "full", `the rendition on this ${dark ? "dark" : "light"} rail`)
        // What a direction's class does when its rail's tone is the other one.
        await tile.evaluate((el, d) => {
          el.style.setProperty("--rail-mark-on-light", d ? "flex" : "none")
          el.style.setProperty("--rail-mark-on-dark", d ? "none" : "flex")
        }, dark)
        expect.equal(await shown(logo), dark ? "full" : onDark, "the rendition once a direction turns the rail's tone over")
      },
    },
    {
      name: "In forced colours the single ink stands in, drawn in CanvasText",
      example: "renditions",
      forcedColors: true,
      async run({ page, scope, expect }) {
        const auto = scope.locator('[data-slot="logo"][data-color="auto"]')
        expect.equal(await shown(auto), "full-ink", "the rendition on screen")
        const [ink, canvasText] = await page.evaluate(() => {
          const probe = document.createElement("span")
          probe.style.color = "CanvasText"
          document.body.append(probe)
          const r = document.querySelector('[data-slot="logo"][data-color="auto"] [data-rendition="full-ink"]')
          return [getComputedStyle(r).color, getComputedStyle(probe).color]
        })
        expect.equal(ink, canvasText, "the ink's colour")
      },
    },
    {
      name: "The ink rendition takes the colour of the text around it",
      example: "renditions",
      async run({ scope, expect }) {
        const ink = scope.locator('[data-slot="logo"][data-color="ink"]')
        expect.equal(await shown(ink), "full-ink", "the rendition on screen")
        const [own, parent] = await ink.evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el.parentElement.parentElement).color])
        expect.equal(own, parent, "its colour against the tile's text colour")
      },
    },
  ],
}
