// Character's one definition. The kit carries a placeholder pack (lib/brand.ts) with four poses.
const pose = (name, caption) =>
  `<div class="flex flex-col items-center gap-2"><x-import component-from-global-scope="NS.Character" pose="${name}"></x-import><span class="type-meta text-text-muted">${caption}</span></div>`

export default {
  name: "Character",
  group: "Brand",
  job: "The brand's character, marking a state: welcome, working, done, all caught up, nothing found, help.",
  status: "proven",
  props: [
    { name: "pose", type: '"welcome" | "working" | "done" | "caught-up" | "needs-person" | "nothing-found" | "could-not-load" | "help"', doc: "The moment it marks. A moment the brand's pack has no pose for renders nothing, and the words carry it." },
    { name: "size", type: "number", default: "96", doc: "Height in px. The width follows the drawing, so it is never squashed." },
    { name: "flat", type: "boolean", default: "false", doc: "The 2D rendition, when the pack also has 3D stills." },
    { name: "motion", type: "boolean", default: "false", doc: "A gentle bob, for working and calm moments only: three swings, under five seconds, then still. It never runs under reduced motion." },
  ],
  notes: {
    Behaviour: [
      "Decorative, so hidden from screen readers: the words beside it carry the meaning.",
      "Its loop never runs under reduced motion, and stops or starts when the setting changes while it is on screen.",
      "Renders nothing when the brand has no character, or no pose for the moment.",
    ],
    Rules: [
      "One per screen, and only in empty, loading, done, error, welcome and help moments. Never in tables, forms or a busy dashboard.",
      "Never recoloured, flipped, rotated, cropped or squashed, and never two renditions on one screen.",
      "A character for mess or trouble stands for the system's mess, never the person's own mistake, so it never appears on a form error.",
      "Never invent a pose the pack does not have. A moment with no pose gets no picture.",
    ],
  },
  frame: { width: 960, height: 760 },
  examples: [
    {
      id: "poses",
      title: "The pack's poses",
      markup: `<div class="flex flex-wrap items-end gap-10">
${pose("welcome", "welcome")}
${pose("working", "working")}
${pose("done", "done")}
${pose("nothing-found", "nothing-found")}
</div>`,
    },
    {
      id: "moment",
      title: "In its moment",
      markup: `<div class="flex w-full max-w-md flex-col items-center gap-4 py-2 text-center">
<x-import component-from-global-scope="NS.Character" pose="nothing-found" size="{{s120}}"></x-import>
<div class="flex flex-col gap-1"><h2 class="type-heading-lg text-text-strong">No clients match [ruby]</h2><p class="type-body text-text-muted">Check the spelling, or clear the filters to see every client.</p></div>
</div>`,
      vals: { s120: 120 },
    },
    {
      id: "working",
      title: "Working, with its loop",
      markup: `<div class="flex items-center gap-4">
<x-import component-from-global-scope="NS.Character" pose="working" size="{{s64}}" motion="{{yes}}"></x-import>
<div class="flex flex-col gap-0.5"><p class="type-label text-text-strong">Importing [1,204] timesheets from [the payroll system]</p><p class="type-meta text-text-muted">This usually takes about a minute. You can leave this page.</p></div>
</div>`,
      vals: { s64: 64, yes: true },
    },
    {
      id: "no-pose",
      title: "A moment with no pose",
      markup: `<div class="flex items-center gap-4">
<x-import component-from-global-scope="NS.Character" pose="caught-up" size="{{s64}}"></x-import>
<div class="flex flex-col gap-0.5"><p class="type-label text-text-strong">All caught up</p><p class="type-meta text-text-muted">The pack has no pose for this moment, so the words carry it alone.</p></div>
</div>`,
    },
  ],
  checks: [
    {
      name: "It is decoration, hidden from screen readers",
      async run({ page, expect }) {
        const characters = page.locator('[data-slot="character"]')
        expect.atLeast(await characters.count(), 1, "characters on the board")
        for (const c of await characters.all()) expect.equal(await c.getAttribute("aria-hidden"), "true", "hidden from screen readers")
        expect.equal(await page.getByRole("img").count(), 0, "images a screen reader would announce")
      },
    },
    {
      name: "A moment the pack has no pose for renders nothing",
      example: "no-pose",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="character"]').count(), 0, "characters drawn")
      },
    },
    {
      name: "Its loop runs when asked for",
      example: "working",
      async run({ scope, expect }) {
        const running = await scope.locator('[data-slot="character"]').evaluate((el) => el.getAnimations().filter((a) => a.playState === "running").length)
        expect.equal(running, 1, "running animations")
      },
    },
    {
      name: "Its loop stops by itself inside five seconds",
      example: "working",
      async run({ scope, expect }) {
        const timing = await scope.locator('[data-slot="character"]').evaluate((el) => el.getAnimations()[0]?.effect.getComputedTiming())
        expect(timing && Number.isFinite(timing.endTime) && timing.endTime <= 5000, `it ends by 5 s (ends at ${timing?.endTime})`)
      },
    },
    {
      name: "Its loop never runs under reduced motion",
      example: "working",
      reducedMotion: true,
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="character"]').evaluate((el) => el.getAnimations().length), 0, "animations under reduced motion")
      },
    },
    {
      name: "It keeps the drawing's proportions at every size",
      async run({ page, expect }) {
        for (const c of await page.locator('[data-slot="character"]').all()) {
          const ratio = await c.evaluate((el) => {
            const svg = el.querySelector("svg")
            const [, , w, h] = svg.getAttribute("viewBox").split(/\s+/).map(Number)
            const box = svg.getBoundingClientRect()
            return box.width / box.height / (w / h)
          })
          expect(Math.abs(ratio - 1) < 0.02, `drawn at ${ratio.toFixed(3)} of its own aspect ratio`)
        }
      },
    },
  ],
}
