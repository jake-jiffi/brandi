// Character's one definition. The kit carries a placeholder pack (lib/brand.ts) with five poses, one in a single ink; a
// starter carries the brand's own pack, or none when the brand has no character.
const STATES = ["welcome", "working", "done", "caught-up", "needs-person", "nothing-found", "could-not-load", "help"]
// A Character the check mounts itself, in a pose this brand's pack has ("missing": one it lacks), so the
// checks run on any brand's pack, drawn or still. Resolves to the pose mounted, or null when there is none.
const mount = (page, want, props = {}) =>
  page.evaluate(
    ([want, props, states]) => {
      const kit = Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)
      const have = states.filter((s) => kit.BRAND?.character?.poses?.[s])
      const pose = want === "missing" ? states.find((s) => !have.includes(s)) : have.includes(want) ? want : have[0]
      if (!pose) return null
      const host = document.createElement("div")
      host.id = "check-mount"
      document.body.append(host)
      const root = window.ReactDOM.createRoot(host)
      window.ReactDOM.flushSync(() => root.render(window.React.createElement(kit.Character, { pose, ...props })))
      return pose
    },
    [want, props, STATES]
  )
const mounted = (page) => page.locator('#check-mount [data-slot="character"]')
// Whether the bundle was built with a pack holding any pose: a brand with none draws no character anywhere.
const hasPack = (page) =>
  page.evaluate(() => Object.keys(Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)?.BRAND?.character?.poses ?? {}).length > 0)
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
      "A pose drawn in one dark ink (a brand's black line drawing) is drawn in currentColor by the starter, so it takes the text colour around it and reads on a dark ground as on a light one. A brand's black line drawings vanished on dark grounds before.",
      "A pose in a colour, or in more than one, keeps its own colours, so on a dark ground it can lose contrast or glare: the pack has no dark rendition. Keep such a pose off dark grounds, or ask the brand for one drawn for them. A still (PNG, JPEG, WebP) is a picture and keeps its colours too.",
      "Its loop never runs under reduced motion, and stops or starts when the setting changes while it is on screen.",
      "Renders nothing when the brand has no character, or no pose for the moment.",
      "A brand with no character draws none, and its card says so in place of the poses: the words carry every moment.",
    ],
    Rules: [
      "One per screen, and only in empty, loading, done, error, welcome and help moments. Never in tables, forms or a busy dashboard.",
      "Never recoloured, flipped, rotated, cropped or squashed, and never two renditions on one screen.",
      "A character for mess or trouble stands for the system's mess, never the person's own mistake, so it never appears on a form error.",
      "Never invent a pose the pack does not have. A moment with no pose gets no picture.",
    ],
  },
  frame: { width: 960, height: 760 },
  logic: `hasCharacter: Object.keys(NS.BRAND.character?.poses ?? {}).length > 0,
    noCharacter: !Object.keys(NS.BRAND.character?.poses ?? {}).length,
    brandName: NS.BRAND.name`,
  examples: [
    {
      id: "poses",
      title: "The pack's poses",
      markup: `<sc-if value="{{hasCharacter}}"><div class="flex flex-wrap items-end gap-10">
${pose("welcome", "welcome")}
${pose("working", "working")}
${pose("done", "done")}
${pose("nothing-found", "nothing-found")}
${pose("help", "help, in one ink")}
</div></sc-if>
<sc-if value="{{noCharacter}}"><p class="type-body max-w-measure text-text-muted">{{brandName}} has no character, so Character draws nothing, here or in the product. The words beside it carry each moment, as the examples below show.</p></sc-if>`,
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
        // A brand with no character has none to draw: wanting one failed a characterless brand's Accessibility gate.
        if (await hasPack(page)) expect.atLeast(await characters.count(), 1, "characters on the board")
        else expect.equal(await characters.count(), 0, "characters drawn for a brand with no character")
        for (const c of await characters.all()) expect.equal(await c.getAttribute("aria-hidden"), "true", "hidden from screen readers")
        expect.equal(await page.getByRole("img").count(), 0, "images a screen reader would announce")
      },
    },
    {
      name: "A brand with no character says so on its card, in place of the poses",
      example: "poses",
      async run({ page, scope, expect }) {
        const pack = await hasPack(page)
        expect.equal(await scope.getByText("has no character, so Character draws nothing").count(), pack ? 0 : 1, "the words saying the brand has no character")
        if (!pack) expect.equal(await scope.getByText("help, in one ink").count(), 0, "captions for poses that are not there")
      },
    },
    {
      name: "A moment the pack has no pose for renders nothing",
      async run({ page, expect }) {
        // A pack with every moment drawn has no such moment to test.
        if (!(await mount(page, "missing"))) return
        expect.equal(await page.locator('#check-mount [data-slot="character"]').count(), 0, "characters drawn")
      },
    },
    {
      name: "Its loop runs when asked for",
      async run({ page, expect }) {
        if (!(await mount(page, "working", { motion: true, size: 64 }))) return
        const running = await mounted(page).evaluate((el) => el.getAnimations().filter((a) => a.playState === "running").length)
        expect.equal(running, 1, "running animations")
      },
    },
    {
      name: "Its loop stops by itself inside five seconds",
      async run({ page, expect }) {
        if (!(await mount(page, "working", { motion: true, size: 64 }))) return
        const timing = await mounted(page).evaluate((el) => el.getAnimations()[0]?.effect.getComputedTiming())
        expect(timing && Number.isFinite(timing.endTime) && timing.endTime <= 5000, `it ends by 5 s (ends at ${timing?.endTime})`)
      },
    },
    {
      name: "Its loop never runs under reduced motion",
      reducedMotion: true,
      async run({ page, expect }) {
        if (!(await mount(page, "working", { motion: true, size: 64 }))) return
        expect.equal(await mounted(page).evaluate((el) => el.getAnimations().length), 0, "animations under reduced motion")
      },
    },
    {
      name: "A pose drawn in one ink takes the colour of the text around it, in both themes",
      themes: ["light", "dark"],
      async run({ page, expect }) {
        // A pose in one ink is markup in currentColor and nothing else. A pack with none has nothing to test here.
        const want = await page.evaluate((states) => {
          const kit = Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)
          const poses = kit.BRAND?.character?.poses ?? {}
          return states.find((s) => typeof poses[s] === "string" && /currentColor/i.test(poses[s]) && !/#[0-9a-f]{3,8}\b|rgba?\(|var\(/i.test(poses[s])) ?? null
        }, STATES)
        if (!want || (await mount(page, want)) !== want) return
        const [ink, text] = await mounted(page).evaluate((el) => {
          const painted = [...el.querySelectorAll("svg *")].map((n) => getComputedStyle(n)).find((c) => c.stroke !== "none" || c.fill !== "none")
          return [painted && (painted.stroke !== "none" ? painted.stroke : painted.fill), getComputedStyle(document.body).color]
        })
        expect.equal(ink, text, `the ${want} pose's ink against the text colour`)
      },
    },
    {
      name: "It keeps the drawing's proportions at every size",
      async run({ page, expect }) {
        for (const size of [48, 96, 160]) {
          if (!(await mount(page, "welcome", { size }))) return
          const ratio = await mounted(page).last().evaluate(async (el) => {
            const svg = el.querySelector("svg")
            const img = el.querySelector("img")
            if (img && !img.complete) await new Promise((r) => img.addEventListener("load", r, { once: true }))
            const art = svg ?? img
            const box = art.getBoundingClientRect()
            const [w, h] = svg
              ? svg.getAttribute("viewBox")?.split(/[\s,]+/).slice(2).map(Number) ?? [Number(svg.getAttribute("width")), Number(svg.getAttribute("height"))]
              : [img.naturalWidth, img.naturalHeight]
            return box.width / box.height / (w / h)
          })
          expect(Math.abs(ratio - 1) < 0.02, `drawn at ${ratio.toFixed(3)} of its own aspect ratio at ${size}px`)
        }
      },
    },
  ],
}
