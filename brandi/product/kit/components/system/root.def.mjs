// Root's one definition. Root lives in canvas/root.tsx: it wraps every board and preview, and the
// product's app/layout.tsx does the same job with its providers.
export default {
  name: "Root",
  group: "Foundations",
  job: "The theme and the shortcut setting for everything inside, around every board and preview.",
  status: "proven",
  props: [
    { name: "theme", type: '"light" | "dark"', doc: "Light or dark for the whole board. Leave it out where the host page sets the theme, as a Design System preview does." },
    { name: "background", type: '"canvas" | "surface" | "none"', default: '"canvas"', doc: "The page colour behind the board, set with the theme." },
    { name: "shortcuts", type: "boolean", default: "true", doc: "False turns single-key shortcuts off inside, for speech-input and switch users." },
    { name: "touch", type: "boolean", default: "false", doc: "Draws everything inside at the touch sizes, a portal's dialog or menu included. Set it on every board under 640px: the canvas is viewed with a mouse." },
  ],
  notes: {
    Behaviour: [
      "Sets the theme on the page as well as on itself, because a menu, dialog or toast opens in a portal outside the board and has to match the board it opened from.",
      "Carries the tooltip provider, so a tooltip works anywhere inside.",
      "Adds no padding and no box of its own.",
    ],
    Rules: [
      "A screen is one theme. A nested Root may flip one region, such as a dark preview inside a light page, and nothing more.",
      "Products offer the shortcut setting in their own settings, for speech-input and switch users.",
    ],
    Review: ["Single-key shortcuts had no off switch (round 3)."],
  },
  examples: [
    {
      id: "touch",
      title: "A region drawn as a phone",
      markup: `<x-import component-from-global-scope="NS.Button">With a mouse</x-import>
<x-import component-from-global-scope="NS.Root" touch="{{yes}}" background="none"><x-import component-from-global-scope="NS.Button">As on a phone</x-import></x-import>`,
      vals: { yes: true },
    },
    {
      id: "region",
      title: "A dark region inside a light board",
      markup: `<x-import component-from-global-scope="NS.Button">From the page</x-import>
<x-import component-from-global-scope="NS.Root" theme="dark" background="none"><x-import component-from-global-scope="NS.Button">Its own region</x-import></x-import>`,
    },
  ],
  checks: [
    {
      name: "touch draws what is inside at the touch sizes, with a mouse",
      example: "touch",
      async run({ scope, expect }) {
        const height = async (name) => Math.round((await scope.getByRole("button", { name }).boundingBox()).height)
        expect.equal(await height("With a mouse"), 36, "outside, the mouse size")
        expect.equal(await height("As on a phone"), 44, "inside, the phone's size")
      },
    },
    {
      name: "Root sets the board's theme and shortcut setting on the page, so a portal matches the board",
      example: "region",
      async run({ page, expect }) {
        const html = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, shortcuts: document.documentElement.dataset.shortcuts }))
        expect.equal(html.theme, "light", "the page carries the board's theme")
        expect.equal(html.shortcuts, "on", "the page carries the shortcut setting")
      },
    },
    {
      name: "A nested Root flips its own region and leaves the page alone",
      example: "region",
      async run({ page, scope, expect }) {
        expect.equal(await scope.locator('[data-slot="root"].dark').count(), 1, "the region is dark")
        expect.equal(await page.evaluate(() => document.documentElement.dataset.theme), "light", "the page stays light")
        const fill = (name) => scope.getByRole("button", { name }).evaluate((el) => getComputedStyle(el).backgroundColor)
        expect(await fill("From the page") !== await fill("Its own region"), "the region's button takes the dark values")
      },
    },
  ],
}
