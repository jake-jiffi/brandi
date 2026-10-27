// AvatarGroup's one definition: its README, its preview board and its scripted checks all come from here.

const SIX = [
  { name: "[Mia Chen]" },
  { name: "[Sam Patel]" },
  { name: "[Lena Brooks]" },
  { name: "[Tom Okafor]" },
  { name: "[Eve Marsh]" },
  { name: "[Finn Hale]" },
]

async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}

export default {
  name: "AvatarGroup",
  group: "Status",
  job: "Overlapping avatars for the people on a record, with \"+N\" past max.",
  status: "proven",
  props: [
    { name: "people", type: "{ name: string; src?: string; status?: AvatarStatus }[]", doc: "The people on the record, in order." },
    { name: "max", type: "number", default: "4", doc: 'How many avatars show before "+N".' },
    { name: "size", type: "24 | 28 | 32 | 40", default: "32", doc: "Every avatar's size, and the count's." },
  ],
  notes: {
    Behaviour: [
      'A group named by its count in words ("6 people"). Each avatar is named by its person.',
      '"+N" names the hidden people to screen readers ("2 more: [Eve Marsh] and [Finn Hale]"), and shows them in a tooltip on hover, on keyboard focus and on a long press.',
    ],
    States: ["Under max: no count. Past max: max avatars, then +N. Every size."],
    Rules: [
      "For the people on one record. A list of people with their details is a List.",
      "The avatars part with a ring in the surface colour, so put the group on a surface.",
    ],
  },
  examples: [
    {
      id: "past-max",
      title: "Six people, four shown",
      markup: `<x-import component-from-global-scope="NS.AvatarGroup" people="{{six}}"></x-import>`,
      vals: { six: SIX },
    },
    {
      id: "sizes",
      title: "Sizes",
      markup: `<x-import component-from-global-scope="NS.AvatarGroup" people="{{six}}" size="{{s24}}" max="{{m3}}"></x-import>
<x-import component-from-global-scope="NS.AvatarGroup" people="{{six}}" size="{{s40}}"></x-import>`,
      vals: { six: SIX, s24: 24, s40: 40, m3: 3 },
    },
    {
      id: "few",
      title: "Under max",
      markup: `<x-import component-from-global-scope="NS.AvatarGroup" people="{{three}}"></x-import>`,
      vals: { three: SIX.slice(0, 3) },
    },
  ],
  frame: { width: 960, height: 360 },
  checks: [
    {
      name: "The group is counted in words, and +N names the hidden people to screen readers",
      example: "past-max",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("group", { name: "6 people" }).count(), 1, "the group's name")
        expect.equal(await scope.locator('[data-slot="avatar"]').count(), 4, "four avatars show")
        expect.equal(await scope.getByRole("img", { name: "2 more: [Eve Marsh] and [Finn Hale]" }).count(), 1, "+N names who is hidden")
        expect.equal((await scope.locator('[data-slot="avatar-group-count"]').innerText()).trim(), "+2", "what people see")
      },
    },
    {
      name: "+N shows the hidden names on keyboard focus and on hover, and Escape hides them",
      example: "past-max",
      async run({ page, scope, expect }) {
        const more = scope.locator('[data-slot="avatar-group-count"]')
        expect(await tabTo(page, more), "Tab reaches +N")
        const tip = page.locator('[data-slot="tooltip-content"]')
        await tip.waitFor({ state: "visible", timeout: 2000 })
        expect((await tip.innerText()).includes("[Eve Marsh] and [Finn Hale]"), "the tooltip names them")
        await page.keyboard.press("Escape")
        await tip.waitFor({ state: "hidden", timeout: 2000 })
        await page.mouse.move(1, 1)
        await more.hover()
        await tip.waitFor({ state: "visible", timeout: 2000 })
      },
    },
    {
      name: "Under max there is no count, and the count matches its avatars' size",
      async run({ page, expect }) {
        expect.equal(await page.locator('[data-example="few"] [data-slot="avatar-group-count"]').count(), 0, "no +N under max")
        const sizes = page.locator('[data-example="sizes"] [data-slot="avatar-group"]')
        for (const [i, px] of [[0, 24], [1, 40]]) {
          const count = await sizes.nth(i).locator('[data-slot="avatar-group-count"]').boundingBox()
          expect.equal(Math.round(count.width), px, `the count is ${px}px`)
        }
      },
    },
  ],
}
