// LoadingState's one definition: its README, its preview board and its scripted checks all come from here.

// Installed before the board runs. Records every change made inside a live region after that region was on
// the page: what a screen reader would announce. Content a region arrives with is not recorded.
function recordLiveRegions() {
  window.__liveChanges = []
  const live = '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"]'
  new MutationObserver((records) => {
    // One batch is one change to announce, however many nodes React touched to make it.
    const changed = new Set()
    for (const r of records) {
      const node = r.target.nodeType === 1 ? r.target : r.target.parentElement
      const region = node && node.closest(live)
      if (region) changed.add(region)
    }
    for (const region of changed) window.__liveChanges.push({ slot: region.getAttribute("data-slot"), text: (region.textContent || "").trim() })
  }).observe(document, { subtree: true, childList: true, characterData: true })
}

const channels = (css) => {
  const rgb = /rgba?\(([^)]+)\)/.exec(css)
  if (rgb) return rgb[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number)
  const srgb = /color\(srgb ([^)]+)\)/.exec(css)
  if (srgb) return srgb[1].split(/\s+/).slice(0, 3).map((v) => Number(v) * 255)
  throw new Error(`cannot read the colour ${css}`)
}
const luminance = (css) => {
  const [r, g, b] = channels(css).map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)
// The colour actually behind an element: the first ancestor with a background of its own.
const groundOf = (locator) =>
  locator.evaluate((el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor
      if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c
    }
    return getComputedStyle(document.body).backgroundColor
  })
const barTiming = (scope) =>
  scope
    .locator('[data-slot="progress-indicator"]')
    .first()
    .evaluate((el) => {
      const run = el.getAnimations()[0]
      return run ? { duration: run.effect.getTiming().duration, state: run.playState } : null
    })

// Reloads the board with its clock stopped from the first moment, so a wait only passes when the check moves time.
async function reloadStopped(page) {
  await page.clock.install()
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 10)
  await page.reload()
  await page.waitForSelector('[data-slot="loading-state"]')
  await page.waitForTimeout(150)
  await page.clock.runFor(100)
  await page.waitForSelector("html[data-dc-ready]")
}

const CARD = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md);"
const TITLE = "Pulling this week's [jobs] from [booking system]"

export default {
  name: "LoadingState",
  group: "Feedback",
  job: "An area waiting on another system for more than a second: what is happening, an indeterminate bar, and the character working when there is one.",
  status: "proven",
  props: [
    { name: "title", type: "ReactNode", default: '"Loading"', doc: `What is happening, naming the system: "${TITLE}". "Loading" is a fallback, not copy.` },
    { name: "children", type: "ReactNode", doc: "A second line." },
    { name: "picture", type: "string | ReactNode", doc: "The brand's character at work: its file, or an element. Decorative." },
    { name: "usually", type: "ReactNode", doc: 'How long it usually takes, shown and said once the wait passes ten seconds: "This usually takes about [2] minutes."' },
    { name: "actions", type: "ReactNode | FeedbackAction[]", doc: "A way to leave, shown once the wait passes ten seconds: Run in background, Cancel." },
    { name: "slow", type: "boolean", default: "false", doc: "Shows the over-ten-seconds form at once, for a design or a wait known to be long." },
  ],
  tables: [
    {
      title: "Timing",
      head: ["Waited", "What shows", "What a screen reader hears"],
      rows: [
        ["Under a second", "Nothing", "Nothing"],
        ["From a second", "The bar, the title and the second line, fading in", "The title and the second line, once"],
        ["Over ten seconds", "How long it usually takes, and the way to leave", "How long it usually takes"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "A polite live region that starts empty and fills at one second, so the line is read out without speaking for a load that finished sooner.",
      "The bar, the picture and the visible words are hidden from screen readers; the status says the words once.",
    ],
    Layout: ["Centred in the area it waits in: the picture, a 192px bar, the title, the second line, then the way to leave."],
    States: ["Waiting, from one second. Long, from ten seconds or at once with slow."],
    Copy: [
      `Name the system and the work: "${TITLE}".`,
      'Over ten seconds, say how long it usually takes: "This usually takes about [2] minutes. It carries on if you leave this page."',
    ],
    Rules: [
      "Under a second, show nothing.",
      "Content arriving in place takes a Skeleton in its shape instead.",
      "Over ten seconds, say how long it usually takes and let people leave. A long job can run in the background.",
    ],
    Review: ["Reduced motion missed the loops people watch while waiting (round 1)."],
    Accepted: ["Under reduced motion the bar slows to 2.4 seconds a pass instead of stopping. A bar standing still looks like a hang, and the words carry the state."],
  },
  frame: { width: 960, height: 560 },
  examples: [
    {
      id: "waiting",
      title: "Waiting on another system",
      layout: "block",
      markup: `<div style="${CARD}">
<x-import component-from-global-scope="NS.LoadingState" title="${TITLE}" usually="This usually takes about [30] seconds. It carries on if you leave this page." actions="{{runInBackground}}">Your rosters stay as they are until it finishes.</x-import>
</div>`,
      vals: { runInBackground: [{ label: "Run in background" }] },
    },
    {
      id: "slow",
      title: "Over ten seconds, shown at once for a design",
      layout: "block",
      markup: `<div style="${CARD}">
<x-import component-from-global-scope="NS.LoadingState" slow="{{yes}}" title="Matching [March] payments to invoices" usually="This usually takes about [2] minutes. It carries on if you leave this page." actions="{{leaveOrCancel}}"></x-import>
</div>`,
      vals: { yes: true, leaveOrCancel: [{ label: "Run in background" }, { label: "Cancel", variant: "ghost" }] },
    },
  ],
  checks: [
    {
      name: "Under a second it shows and says nothing; at a second it names the work, once",
      example: "waiting",
      async run({ page, scope, expect }) {
        await page.addInitScript(recordLiveRegions)
        await reloadStopped(page)
        const first = scope.locator('[data-slot="loading-state"]').first()
        const status = first.locator('[data-slot="loading-state-status"]')
        expect.equal((await status.textContent()).trim(), "", "nothing said in the first moment")
        const delay = await first.evaluate((el) => el.getAnimations().find((a) => a.animationName === "appear-late")?.effect.getTiming().delay)
        expect.equal(delay, 800, "it stays out of sight for the first 800ms")
        expect.equal((await page.evaluate(() => window.__liveChanges)).length, 0, "nothing spoke on load")
        await page.clock.runFor(1000)
        await page.waitForTimeout(120)
        expect((await status.textContent()).startsWith(TITLE), "at a second the status names the work")
        const spoken = await page.evaluate((title) => window.__liveChanges.filter((c) => c.text.startsWith(title)), TITLE)
        expect.equal(spoken.length, 1, "it was said once")
      },
    },
    {
      name: "Over ten seconds it says how long it usually takes and offers a way to leave",
      example: "waiting",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const first = scope.locator('[data-slot="loading-state"]').first()
        await page.clock.runFor(9700)
        await page.waitForTimeout(120)
        expect.equal(await first.getByRole("button").count(), 0, "no way out before ten seconds")
        await page.clock.runFor(400)
        await page.waitForTimeout(120)
        expect.equal(await first.getByRole("button", { name: "Run in background" }).count(), 1, "a way to leave")
        expect((await first.locator('[data-slot="loading-state-status"]').textContent()).includes("This usually takes about [30] seconds."), "the status says how long it usually takes")
      },
    },
    {
      name: "The slow form shows at once on request, for a design",
      example: "slow",
      async run({ scope: slow, expect }) {
        expect.equal(await slow.getByRole("button").count(), 2, "both ways out show at once")
        expect((await slow.innerText()).includes("This usually takes about [2] minutes."), "and how long it usually takes")
      },
    },
    {
      name: "The bar slows right down under reduced motion and never stops",
      example: "waiting",
      reducedMotion: true,
      async run({ scope, expect }) {
        const timing = await barTiming(scope)
        expect.equal(timing?.duration, 2400, "2.4 seconds a pass")
        expect.equal(timing?.state, "running", "still moving")
      },
    },
    {
      name: "With motion welcome, the bar takes 1.4 seconds a pass",
      example: "waiting",
      async run({ scope, expect }) {
        expect.equal((await barTiming(scope))?.duration, 1400, "1.4 seconds a pass")
      },
    },
    {
      name: "The bar and the visible words are hidden from screen readers, and the status says the words once",
      example: "waiting",
      async run({ page, scope, expect }) {
        await page.waitForTimeout(1200)
        const tree = await scope.locator('[data-slot="loading-state"]').first().ariaSnapshot()
        expect.equal(tree.split("Pulling this week's").length - 1, 1, `the title is heard once in:\n${tree}`)
        expect(!/progressbar|img/.test(tree), "the bar and picture are not in the tree")
      },
    },
    {
      name: "The words hold their contrast on the area they wait in, in both themes",
      example: "waiting",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        await scope.page().waitForTimeout(1100)
        const state = scope.locator('[data-slot="loading-state"]').first()
        const ground = await groundOf(state)
        const lines = await state.locator("p:not([role])").all()
        for (const line of lines) expect.atLeast(contrast(await style(line, "color"), ground), 4.5, `${theme} words`)
        expect.atLeast(contrast(await style(state.locator('[data-slot="progress-indicator"]'), "backgroundColor"), ground), 3, `${theme} bar`)
      },
    },
  ],
}
