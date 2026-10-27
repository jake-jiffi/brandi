// Tooltip's one definition: its README, its preview board and its scripted checks all come from here.

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}
// The tooltip a person opened, in its portal, by its words: never a design's picture, and never another
// tooltip still fading out after focus moved on.
const floating = (page, words) => page.locator('[data-slot="tooltip-content"]:not([data-example] *)').filter({ hasText: words })
// A real touch held down, through Chrome's own input pipeline.
async function longPress(page, locator, ms = 700) {
  const box = await locator.boundingBox()
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] })
  await page.waitForTimeout(ms)
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
}

export default {
  name: "Tooltip",
  group: "Status",
  job: "A short label on hover or keyboard focus.",
  status: "proven",
  props: [
    { name: "content", type: "ReactNode", doc: "One short sentence at most. Never the only home for something people need, and never interactive." },
    { name: "placement", type: '"top" | "bottom" | "right"', default: '"top"', doc: "Where it opens. It shifts to stay on screen." },
    { name: "open", type: "boolean", doc: "Design mode: shows it open, in place, for a board." },
    { name: "children", type: "ReactNode", doc: "The control it describes. It must be focusable; when nothing inside is, the wrapper takes focus instead." },
  ],
  notes: {
    Behaviour: [
      "Shows on keyboard focus at once, and on hover after the provider's delay. It stays while the pointer is over it, and Escape closes it.",
      "On a touch screen a long press shows it without pressing the control, and a tap elsewhere hides it.",
      "It describes the control it wraps, which on a canvas sits inside a wrapper of its own, so it finds that control inside. A tooltip that repeats the control's name (IconButton's label) is not read a second time.",
      "Around a disabled control, which cannot take focus, the wrapper takes focus instead, so the reason is still reachable from the keyboard.",
      "It opens in a portal above everything and shifts to stay 8px clear of the screen's edge. Empty content mounts nothing, so it can never swallow a key.",
      "Shown open for a design, it is a still picture beside its control: it mounts no layer, so it takes no key, press or focus from the board. A picture does not shift, so give it room on the board.",
    ],
    States: [
      "Closed, open on each side, and open in place for a design. It fades in and goes at once, so a tooltip on its way out never holds the next Escape. Reduced motion keeps the fade and drops the zoom. Forced colours give it an edge.",
    ],
    Copy: ['One short sentence, no full stop when it is a fragment: "Exports the rows you can see, as a CSV file".'],
    Rules: [
      "Never the only home for essential information, and never interactive: no links or buttons inside.",
      "The child must be focusable, so keyboard users get it too.",
      "A definition people need on touch is a Toggletip, as MetricCard's hint is.",
    ],
    Review: ["An invisible tooltip swallowed Escape in the phone drawer (round 3)."],
  },
  examples: [
    {
      id: "on-controls",
      title: "On controls",
      markup: `<x-import component-from-global-scope="NS.Tooltip" content="Exports the rows you can see, as a CSV file"><x-import component-from-global-scope="NS.Button" icon="Download">Export</x-import></x-import>
<x-import component-from-global-scope="NS.Tooltip" content="Last synced 8:50 am from [the accounting system]" placement="bottom"><x-import component-from-global-scope="NS.Button" variant="ghost" icon="RefreshCw">Sync now</x-import></x-import>
<x-import component-from-global-scope="NS.Tooltip" content="Only [finance leads] can approve"><x-import component-from-global-scope="NS.Button" variant="primary" disabled="{{yes}}">Approve</x-import></x-import>`,
      vals: { yes: true },
    },
    {
      id: "placements",
      title: "Open in place, on each side, for a design",
      markup: `<div style="display: flex; align-items: center; gap: 96px; padding: 48px 0 52px 24px;"><x-import component-from-global-scope="NS.Tooltip" content="Moves it out of the inbox" open="{{yes}}"><x-import component-from-global-scope="NS.Button" icon="Archive">Archive</x-import></x-import><x-import component-from-global-scope="NS.Tooltip" content="Sends it to [Northside Plumbing] by email" placement="bottom" open="{{yes}}"><x-import component-from-global-scope="NS.Button" icon="Send">Send</x-import></x-import><x-import component-from-global-scope="NS.Tooltip" content="Anyone in [your team] with the link can view it" placement="right" open="{{yes}}"><x-import component-from-global-scope="NS.Button" icon="Share2">Share</x-import></x-import></div>`,
      vals: { yes: true },
    },
    {
      id: "edge",
      title: "At the edge of the screen",
      markup: `<div style="display: flex; justify-content: flex-end; width: 100%;"><x-import component-from-global-scope="NS.Tooltip" content="Downloads every invoice from this financial year as one PDF file"><x-import component-from-global-scope="NS.Button" icon="Download">Download all</x-import></x-import></div>`,
    },
  ],
  frame: { width: 960, height: 420 },
  checks: [
    {
      name: "Shows on keyboard focus, describes the control, and Escape hides it while focus stays",
      example: "on-controls",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "Export" })
        expect(await tabTo(page, button), "Tab reaches Export")
        const tip = floating(page, "Exports the rows you can see, as a CSV file")
        await tip.waitFor({ state: "visible", timeout: 2000 })
        const described = await button.getAttribute("aria-describedby")
        expect(described, "the button is described")
        expect.equal((await page.locator(`[id="${described}"]`).textContent()).trim(), "Exports the rows you can see, as a CSV file", "what a screen reader hears after the name")
        await page.keyboard.press("Escape")
        await tip.waitFor({ state: "hidden", timeout: 2000 })
        expect(await button.evaluate((el) => document.activeElement === el), "focus stays on the button")
      },
    },
    {
      name: "Around a disabled control the wrapper takes focus, so the reason is reachable from the keyboard",
      example: "on-controls",
      async run({ page, scope, expect }) {
        const wrapper = scope.locator('[data-slot="tooltip-trigger"]').filter({ has: page.getByRole("button", { name: "Approve" }) })
        expect.equal(await wrapper.getAttribute("tabindex"), "0", "the wrapper is in the tab order")
        expect(await tabTo(page, wrapper), "Tab reaches it")
        await floating(page, "Only [finance leads] can approve").waitFor({ state: "visible", timeout: 2000 })
        const described = await wrapper.getAttribute("aria-describedby")
        expect.equal((await page.locator(`[id="${described}"]`).textContent()).trim(), "Only [finance leads] can approve", "and is read after the control's words")
      },
    },
    {
      name: "Stays while the pointer is over it",
      example: "on-controls",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Export" }).hover()
        const tip = floating(page, "Exports the rows")
        await tip.waitFor({ state: "visible", timeout: 2000 })
        const box = await tip.boundingBox()
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 })
        await page.waitForTimeout(500)
        expect(await tip.isVisible(), "still showing with the pointer on it")
      },
    },
    {
      name: "A long press on a touch screen shows it without pressing the control, and a tap elsewhere hides it",
      example: "on-controls",
      touch: true,
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__pressed = 0
          // Bubbling, so it counts only a press that reached the page unhandled.
          document.addEventListener("click", (e) => { if (e.target.closest?.("button") && !e.defaultPrevented) window.__pressed++ })
        })
        await longPress(page, scope.getByRole("button", { name: "Export" }))
        const tip = floating(page, "Exports the rows")
        await tip.waitFor({ state: "visible", timeout: 2000 })
        expect.equal(await page.evaluate(() => window.__pressed), 0, "the long press did not also press Export")
        await page.touchscreen.tap(8, 590)
        await tip.waitFor({ state: "hidden", timeout: 2000 })
      },
    },
    {
      name: "Escape is never swallowed by a tooltip that is not showing",
      example: "on-controls",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__escapes = 0
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented) window.__escapes++ })
        })
        expect(await tabTo(page, scope.getByRole("button", { name: "Export" })), "Tab reaches Export")
        await floating(page, "Exports the rows").waitFor({ state: "visible", timeout: 2000 })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escapes), 0, "the first Escape closes the showing tooltip")
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escapes), 1, "the next Escape reaches the page")
        await page.keyboard.press("Tab")
        await floating(page, "Last synced").waitFor({ state: "visible", timeout: 2000 })
        await page.keyboard.press("Escape")
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escapes), 2, "every tooltip lets the page have the Escape after it closes")
      },
    },
    {
      name: "It shifts to stay on screen",
      example: "edge",
      viewport: { width: 960, height: 600 },
      async run({ page, scope, expect }) {
        expect(await tabTo(page, scope.getByRole("button", { name: "Download all" })), "Tab reaches Download all")
        const tip = floating(page, "Downloads every invoice")
        await tip.waitFor({ state: "visible", timeout: 2000 })
        await page.waitForTimeout(200)
        const box = await tip.boundingBox()
        expect(box.x + box.width <= 960 - 7, `the tooltip ends inside the screen (right edge at ${Math.round(box.x + box.width)})`)
        expect(box.x >= 0, "and starts inside it")
      },
    },
    {
      name: "Open in place for a design, on each side, taking no focus, no key and no press from the page",
      example: "placements",
      async run({ page, scope, expect }) {
        const tips = scope.locator('[data-slot="tooltip-content"]')
        expect.equal(await tips.count(), 3, "three tooltips show without anyone pointing")
        const sides = []
        for (const tip of await tips.all()) sides.push(await tip.getAttribute("data-side"))
        expect.equal(sides.join(","), "top,bottom,right", "each on its side")
        expect(await page.evaluate(() => document.activeElement === document.body), "nothing took focus")
        await page.evaluate(() => {
          window.__escapes = 0
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented) window.__escapes++ })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escapes), 1, "Escape reaches the page past the pictures")
        await page.mouse.click(900, 400)
        expect.equal(await tips.count(), 3, "a press elsewhere leaves the pictures as they are")
      },
    },
    {
      name: "Its words hold 4.5:1 against its fill, in both themes",
      example: "placements",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const { ink, bg } = await scope.locator('[data-slot="tooltip-content"]').first().evaluate((el) => ({ ink: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor }))
        expect.atLeast(Math.round(contrast(ink, bg) * 100) / 100, 4.5, "tooltip text contrast")
      },
    },
    {
      name: "Forced colours give it an edge",
      example: "placements",
      forcedColors: true,
      async run({ scope, expect }) {
        const edge = await scope.locator('[data-slot="tooltip-content"]').first().evaluate((el) => `${getComputedStyle(el).borderTopStyle} ${getComputedStyle(el).borderTopColor}`)
        expect(edge.startsWith("solid") && !edge.includes("rgba(0, 0, 0, 0)"), `the edge is drawn (${edge})`)
      },
    },
  ],
}
