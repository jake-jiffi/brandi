// Avatar's one definition: its README, its preview board and its scripted checks all come from here.

// A sample photo, drawn here so the preview needs nothing from the network.
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#c8a17c'/><stop offset='1' stop-color='#5f4536'/></linearGradient></defs><rect width='80' height='80' fill='url(#g)'/><circle cx='40' cy='33' r='15' fill='#efd2b6'/><path d='M13 80c2-17 13-26 27-26s25 9 27 26z' fill='#2e4a5b'/></svg>"
)}`

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const named = (avatar, name) =>
  `<div style="display: flex; align-items: center; gap: 8px; font: 400 14px/20px var(--font-sans); color: var(--text-strong);">${avatar}<span>${name}</span></div>`

export default {
  name: "Avatar",
  group: "Status",
  job: "A person, as a photo or initials on a tinted circle. The assistant has an avatar of its own.",
  status: "proven",
  types: [
    'type AvatarStatus = "online" | "away" | "offline"',
  ],
  props: [
    { name: "name", type: "string", doc: "The person's name: their initials, and what a screen reader hears." },
    { name: "src", type: "string", doc: "A photo. Initials show until it loads, and instead of it when it fails." },
    { name: "size", type: "24 | 28 | 32 | 40", default: "32", doc: "24 in dense rows, 28 in lists, 32 by default, 40 in a header." },
    { name: "assistant", type: "boolean", default: "false", doc: "The assistant's own avatar, in the ai tone." },
    { name: "status", type: '"online" | "away" | "offline"', doc: 'Read with the name: "[Name], online".' },
  ],
  notes: {
    Behaviour: [
      'An image named by the person\'s name, with the status read after it: "[Name], online". The photo and the initials inside it are decoration.',
    ],
    States: [
      "Photo, initials and the assistant. Online is a full dot, away a half dot and offline an empty ring, so status never rides on colour alone.",
      "The same name always gets the same tag tint. Forced colours keep the status dot's drawing.",
    ],
    Rules: [
      "Always with the person's name nearby: an avatar alone names nobody to a sighted person.",
      "Initials come from the first and last words of the name, without a sample name's brackets.",
    ],
  },
  examples: [
    {
      id: "sizes",
      title: "Sizes",
      markup: `<x-import component-from-global-scope="NS.Avatar" name="[Ada Lovelace]" size="{{s24}}"></x-import>
<x-import component-from-global-scope="NS.Avatar" name="[Ada Lovelace]" size="{{s28}}"></x-import>
<x-import component-from-global-scope="NS.Avatar" name="[Ada Lovelace]" size="{{s32}}"></x-import>
<x-import component-from-global-scope="NS.Avatar" name="[Ada Lovelace]" size="{{s40}}"></x-import>`,
      vals: { s24: 24, s28: 28, s32: 32, s40: 40 },
    },
    {
      id: "kinds",
      title: "Photo, initials and the assistant, each with the name beside it",
      markup: [
        named(`<x-import component-from-global-scope="NS.Avatar" name="[Priya Raman]" src="{{photo}}"></x-import>`, "[Priya Raman]"),
        named(`<x-import component-from-global-scope="NS.Avatar" name="[Tom Okafor]"></x-import>`, "[Tom Okafor]"),
        named(`<x-import component-from-global-scope="NS.Avatar" name="Assistant" assistant="{{yes}}"></x-import>`, "Assistant"),
      ].join("\n"),
      vals: { photo: PHOTO, yes: true },
    },
    {
      id: "status",
      title: "Status: full, half and empty",
      markup: [
        named(`<x-import component-from-global-scope="NS.Avatar" name="[Mia Chen]" status="online" size="{{s40}}"></x-import>`, "[Mia Chen]"),
        named(`<x-import component-from-global-scope="NS.Avatar" name="[Sam Patel]" status="away" size="{{s40}}"></x-import>`, "[Sam Patel]"),
        named(`<x-import component-from-global-scope="NS.Avatar" name="[Lena Brooks]" status="offline" size="{{s40}}"></x-import>`, "[Lena Brooks]"),
      ].join("\n"),
      vals: { s40: 40 },
    },
  ],
  frame: { width: 960, height: 400 },
  checks: [
    {
      name: "The status is read with the name, and the photo inside is decoration",
      async run({ page, expect }) {
        expect.equal(await page.getByRole("img", { name: "[Mia Chen], online" }).count(), 1, "online is read with the name")
        expect.equal(await page.getByRole("img", { name: "[Sam Patel], away" }).count(), 1, "away is read with the name")
        expect.equal(await page.getByRole("img", { name: "[Lena Brooks], offline" }).count(), 1, "offline is read with the name")
        const photo = page.getByRole("img", { name: "[Priya Raman]" })
        await photo.locator("img").waitFor({ state: "visible", timeout: 3000 })
        expect.equal(await photo.locator("img").getAttribute("alt"), "", "the photo has an empty alt")
        expect.equal(await page.getByRole("img", { name: "Assistant" }).count(), 1, "the assistant is named")
      },
    },
    {
      name: "The four sizes are 24, 28, 32 and 40px, and one name keeps one tint",
      example: "sizes",
      async run({ scope, expect }) {
        const avatars = await scope.locator('[data-slot="avatar"]').all()
        const sizes = []
        const tints = new Set()
        for (const a of avatars) {
          sizes.push(Math.round((await a.boundingBox()).width))
          tints.add(await a.locator('[data-slot="avatar-fallback"]').evaluate((el) => getComputedStyle(el).backgroundColor))
        }
        expect.equal(sizes.join(","), "24,28,32,40", "sizes")
        expect.equal(tints.size, 1, "the same name has the same tint at every size")
        // Drawn as generated content, so read from the drawing rather than the text.
        const drawn = await avatars[0].locator("[data-initials]").evaluate((el) => getComputedStyle(el, "::before").content)
        expect.equal(drawn, '"AL"', "initials without the brackets")
      },
    },
    {
      name: "Status is a shape as well as a colour: full, half and empty",
      example: "status",
      async run({ scope, expect }) {
        const dot = (i) => scope.locator('[data-slot="avatar-status"]').nth(i).evaluate((el) => {
          const s = getComputedStyle(el)
          return { edge: s.borderTopWidth, image: s.backgroundImage }
        })
        const [online, away, offline] = [await dot(0), await dot(1), await dot(2)]
        expect(online.edge === "0px" && online.image === "none", "online is a full dot")
        expect(away.image.includes("linear-gradient"), "away is half filled")
        expect(offline.edge === "2px" && offline.image === "none", "offline is an empty ring")
      },
    },
    {
      name: "Initials hold 4.5:1 on their tint, in both themes",
      example: "kinds",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const fallback = scope.locator('[data-slot="avatar-fallback"]').first()
        const { ink, bg } = await fallback.evaluate((el) => ({ ink: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor }))
        expect.atLeast(Math.round(contrast(ink, bg) * 100) / 100, 4.5, "initials contrast")
      },
    },
    {
      name: "Forced colours keep the status dot's drawing",
      example: "status",
      forcedColors: true,
      async run({ scope, expect }) {
        const adjust = await scope.locator('[data-slot="avatar-status"]').first().evaluate((el) => getComputedStyle(el).forcedColorAdjust)
        expect.equal(adjust, "none", "the dot keeps its fill and shape")
      },
    },
  ],
}
