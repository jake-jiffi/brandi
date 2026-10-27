// StatusLine's one definition: its README, its preview board and its scripted checks all come from here.

// Installed before the board runs. Records every change made inside a live region after that region was on
// the page: what a screen reader would announce. Content a region arrives with is not recorded.
function recordLiveRegions() {
  window.__liveChanges = []
  const live = '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"]'
  new MutationObserver((records) => {
    const changed = new Set()
    for (const r of records) {
      const node = r.target.nodeType === 1 ? r.target : r.target.parentElement
      const region = node && node.closest(live)
      if (region) changed.add(region)
    }
    for (const region of changed) window.__liveChanges.push({ slot: region.getAttribute("data-slot"), text: (region.textContent || "").trim() })
  }).observe(document, { subtree: true, childList: true, characterData: true })
}
// Reloads the board with its clock stopped, recording what the live regions say.
async function reloadStopped(page) {
  await page.addInitScript(recordLiveRegions)
  await page.clock.install()
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 10)
  await page.reload()
  // The board marks itself ready on a timer, so the stopped clock moves a little first.
  await page.waitForSelector("[data-x-import]")
  await page.waitForTimeout(150)
  await page.clock.runFor(100)
  await page.waitForSelector("html[data-dc-ready]")
}
async function wait(page, ms) {
  await page.clock.runFor(ms)
  await page.waitForTimeout(120)
}
const spoken = (page, slot = "status-line-live") => page.evaluate((s) => window.__liveChanges.filter((c) => c.slot === s && c.text).map((c) => c.text), slot)

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
const groundOf = (locator) =>
  locator.evaluate((el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor
      if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c
    }
    return getComputedStyle(document.body).backgroundColor
  })
const moving = (scope) =>
  scope.evaluate((root) =>
    [...root.querySelectorAll("*")]
      .map((el) => getComputedStyle(el))
      .filter((s) => s.animationName !== "none")
      .map((s) => `${s.animationName} ${s.animationDuration}`)
  )

// A strip of a table under a bulk fill: the line's real home when there is no composer.
const PANE = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 14px 20px; display: flex; flex-direction: column; gap: 14px; width: 100%; box-sizing: border-box;"
const line = (attrs) => `<x-import component-from-global-scope="NS.StatusLine" ${attrs}></x-import>`

export default {
  name: "StatusLine",
  group: "The assistant",
  job: "The answer's one live region: what the work is doing, in the catalogue's words, with Stop while it runs and one Try again after a failure.",
  status: "to build",
  props: [
    { name: "state", type: '"idle" | "working" | "waiting" | "done" | "stopped" | "failed"', default: '"idle"', doc: "What the work is doing. idle shows nothing and says nothing: the line waits, empty, for the first change." },
    { name: "step", type: "number", doc: "The step in hand, counting from 1." },
    { name: "steps", type: "number", doc: "How many steps the work has." },
    { name: "label", type: "ReactNode", doc: 'The step in hand, in the person\'s words: "checking the totals". Anything that is not text is read as its words.' },
    { name: "reason", type: "ReactNode", doc: 'On failure, what went wrong, naming the system: "Couldn\'t reach [accounting system]."' },
    { name: "message", type: "ReactNode", doc: 'Words in place of the ones the state and the step make, for work the table does not cover: "Writing the answer".' },
    { name: "summary", type: "ReactNode", doc: 'Said after "Answer ready" when the work finishes. AIAnswer passes its status and its first sentence.' },
    { name: "showWords", type: "boolean", default: "true", doc: "false when the words already show nearby (a steps log, a Thinking line): the line still says them, and shows only its timer and buttons." },
    { name: "onStop", type: "() => void", doc: 'Shows Stop while the work runs. With the words shown, focus then moves to the "Stopped at step N of M" line.' },
    { name: "stopLabel", type: "string", default: '"Stop"', doc: "Stop's label." },
    { name: "onRetry", type: "() => void", doc: "Shows one Try again after a failure. The same failure after it is said again." },
    { name: "retryLabel", type: "string", default: '"Try again"', doc: "Try again's label." },
    { name: "size", type: '"sm" | "md"', default: '"sm"', doc: "The buttons' size: sm on a line of its own, md in an answer's footer beside its other buttons." },
  ],
  tables: [
    {
      title: "What the line says",
      head: ["Moment", "The line says"],
      rows: [
        ["Work starts", "Working. Step 1 of 3: finding the invoices"],
        ["A step changes", "Step 2 of 3: checking the totals"],
        ["A proposal waits", "Waiting for your approval"],
        ["Done", "Answer ready, then the summary"],
        ["Stopped", "Stopped at step 2 of 3"],
        ["Failed", "Step 2 of 3, checking the totals, failed. Couldn't reach [system]."],
        ["The same failure after Try again", "The same words, said again"],
        ["A finished answer loads", "Nothing"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      'One role="status" element, polite and atomic, in the page from the start and empty until something changes. It speaks only on a change, never as the clock ticks.',
      "To say the same words again it clears the line, then writes them a moment later, so a repeat registers. Several changes inside that moment are said once, with the last words.",
      "The line empties itself once spoken, so spoken words never stay behind in the accessibility tree.",
      "The visible words sit outside the region as plain text, so a finished answer that loads shows its state and says nothing.",
      'Stop moves focus to the "Stopped at step N of M" line, which takes tabindex -1. Try again moves it to the line as it names the step being retried. The region itself never takes focus.',
      "Numbers go in as words (step 2 of 3), and a label that is not plain text is read as its words.",
    ],
    Layout: ["The spinner or the state's icon, the words, the timer, then Stop or Try again. A long failure wraps, and the button follows it."],
    States: ["Idle, working, waiting for approval, done, stopped and failed. Under reduced motion the spinner slows to 2.4 seconds a turn and the timer keeps counting."],
    Copy: ["The catalogue's words, exactly: see What the line says. Name the system that failed, never the system."],
    Rules: [
      "One per answer. AIAnswer holds one and shows only its buttons, because its steps log or Thinking line shows the words.",
      "Stop sits at the end of the line, except in the AskPanel, where it takes the place of Send.",
      "Spinners, shimmer and timers are hidden from screen readers and never sit inside the region.",
    ],
  },
  frame: { width: 960, height: 560 },
  examples: [
    {
      id: "states",
      title: "Each state, in the catalogue's words",
      layout: "block",
      markup: `<div style="${PANE}">
${line('state="working" step="{{two}}" steps="{{three}}" label="checking the totals" on-stop="{{noop}}"')}
${line('state="waiting"')}
${line('state="done"')}
${line('state="stopped" step="{{two}}" steps="{{three}}"')}
${line('state="failed" step="{{two}}" steps="{{three}}" label="checking the totals" reason="Couldn\'t reach [accounting system]." on-retry="{{noop}}"')}
</div>`,
      vals: { two: 2, three: 3 },
    },
    {
      id: "stop",
      title: "Stop keeps what was found and says where it stopped",
      layout: "block",
      markup: `<div style="${PANE}">
${line('state="{{stopState}}" step="{{two}}" steps="{{three}}" label="matching payments to invoices" on-stop="{{stopWork}}"')}
</div>`,
    },
    {
      id: "retry",
      title: "Try again, and the same failure said again",
      layout: "block",
      markup: `<div style="${PANE}">
${line('state="{{retryState}}" step="{{two}}" steps="{{three}}" label="{{richLabel}}" reason="Couldn\'t reach [bank feed]." on-retry="{{retryWork}}"')}
</div>`,
    },
  ],
  state: { stop: "working", retry: "failed" },
  logic: `noop: () => {},
    stopState: self.state.stop,
    stopWork: () => self.setState({ stop: "stopped" }),
    retryState: self.state.retry,
    retryWork: () => {
      self.setState({ retry: "working" })
      setTimeout(() => self.setState({ retry: "failed" }), 1500)
    },
    richLabel: React.createElement("span", null, "matching ", React.createElement("strong", null, "[March]"), " payments")`,
  checks: [
    {
      name: "The region is in the page from the start, empty, and nothing speaks on load",
      async run({ page, expect }) {
        await reloadStopped(page)
        await wait(page, 1500)
        const regions = page.locator('[data-slot="status-line-live"]')
        expect.equal(await regions.count(), 7, "one region per line, there before anything changes")
        for (const r of await regions.all()) expect.equal((await r.textContent()).trim(), "", "empty until something changes")
        expect.equal((await spoken(page)).length, 0, "a line that loads in its state says nothing")
      },
    },
    {
      name: "Each state shows the catalogue's words",
      example: "states",
      async run({ scope, expect }) {
        const words = await scope.locator('[data-slot="status-line-words"]').allInnerTexts()
        expect.equal(
          words.map((w) => w.trim()).join(" | "),
          "Step 2 of 3: checking the totals | Waiting for your approval | Answer ready | Stopped at step 2 of 3 | Step 2 of 3, checking the totals, failed. Couldn't reach [accounting system].",
          "the words"
        )
        expect.equal(await scope.getByRole("button", { name: "Stop" }).count(), 1, "Stop while it works")
        expect.equal(await scope.getByRole("button", { name: "Try again" }).count(), 1, "one Try again after the failure")
      },
    },
    {
      name: "Stop moves focus to the line, which says where it stopped, once",
      example: "stop",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        await scope.getByRole("button", { name: "Stop" }).focus()
        await page.keyboard.press("Enter")
        await wait(page, 300)
        const focused = await page.evaluate(() => ({ slot: document.activeElement?.getAttribute("data-slot"), text: document.activeElement?.textContent?.trim() }))
        expect.equal(focused.slot, "status-line-words", "focus lands on the line, never the page")
        expect.equal(focused.text, "Stopped at step 2 of 3", "the line says where it stopped")
        expect.equal((await spoken(page)).join(" | "), "Stopped at step 2 of 3", "said once")
      },
    },
    {
      name: "Try again names the step being retried, a label that is not text is read as words, and the same failure is said each time",
      example: "retry",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        for (let round = 0; round < 2; round++) {
          await scope.getByRole("button", { name: "Try again" }).focus()
          await page.keyboard.press("Enter")
          await wait(page, 300)
          expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-slot")), "status-line-words", "focus stays on the line")
          await wait(page, 1500)
        }
        const said = await spoken(page)
        expect.equal(said.filter((s) => s === "Working. Step 2 of 3: matching [March] payments").length, 2, `the start is said in words each time: ${said.join(" | ")}`)
        expect.equal(said.filter((s) => s === "Step 2 of 3, matching [March] payments, failed. Couldn't reach [bank feed].").length, 2, "the same failure is said twice")
        expect(!said.some((s) => s.includes("[object")), "no label read as an object")
      },
    },
    {
      name: "The line empties itself once spoken",
      example: "stop",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        await scope.getByRole("button", { name: "Stop" }).click()
        await wait(page, 300)
        const region = scope.locator('[data-slot="status-line-live"]')
        expect.equal((await region.textContent()).trim(), "Stopped at step 2 of 3", "spoken")
        await wait(page, 5200)
        expect.equal((await region.textContent()).trim(), "", "and emptied, so it does not stay in the tree")
      },
    },
    {
      name: "The spinner and the timer are hidden and sit outside the region",
      example: "states",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="status-line-live"] svg, [data-slot="status-line-live"] [data-slot="status-line-timer"]').count(), 0, "nothing that moves inside the region")
        expect.equal(await scope.locator('[data-slot="status-line-timer"]').getAttribute("aria-hidden"), "true", "the timer is hidden")
        expect.equal(await scope.locator('[data-slot="status-line-words"] svg').first().evaluate((el) => el.closest('[aria-hidden="true"]') !== null), true, "the spinner is hidden")
      },
    },
    {
      name: "Under reduced motion the spinner slows to 2.4 seconds and the timer keeps counting",
      example: "stop",
      reducedMotion: true,
      async run({ page, scope, expect }) {
        expect.equal((await moving(scope)).join(", "), "spin 2.4s", "one slow spinner")
        await page.clock.install()
        await page.reload()
        await page.waitForSelector("html[data-dc-ready]")
        const timer = scope.locator('[data-slot="status-line-timer"]')
        const first = (await timer.textContent()).trim()
        await page.clock.runFor(3000)
        await page.waitForTimeout(100)
        expect((await timer.textContent()).trim() !== first, "the timer keeps counting")
      },
    },
    {
      name: "A state it does not know shows and says nothing, and nothing breaks",
      async run({ page, expect }) {
        const shown = await page.evaluate(() => {
          const ns = Object.keys(window)
            .map((k) => {
              try {
                return window[k]
              } catch {
                return null
              }
            })
            .find((v) => v && typeof v === "object" && v.StatusLine && v.Root)
          const host = document.createElement("div")
          document.body.append(host)
          window.ReactDOM.flushSync(() => window.ReactDOM.createRoot(host).render(window.React.createElement(ns.StatusLine, { state: "busy", step: 2, steps: 3, onStop: () => {} })))
          const out = { words: host.querySelectorAll('[data-slot="status-line-words"]').length, buttons: host.querySelectorAll("button").length, region: host.querySelectorAll('[role="status"]').length }
          host.remove()
          return out
        })
        expect.equal(`${shown.words} ${shown.buttons} ${shown.region}`, "0 0 1", "no words, no buttons, and the region still waits")
      },
    },
    {
      name: "Forced colours keep every state's mark, and the words carry the state",
      example: "states",
      forcedColors: true,
      async run({ scope, expect }) {
        for (const w of await scope.locator('[data-slot="status-line-words"]').all()) {
          const mark = await w.locator("svg").evaluate((el) => getComputedStyle(el).color)
          expect(!/rgba\(0, 0, 0, 0\)|transparent/.test(mark), `the mark is drawn (${mark})`)
          expect((await w.innerText()).trim().length > 4, "and the state is in words")
        }
      },
    },
    {
      name: "Stop and Try again are 40px on a touch screen",
      example: "states",
      touch: true,
      async run({ scope, expect }) {
        for (const b of await scope.getByRole("button").all()) expect.equal(Math.round((await b.boundingBox()).height), 40, "touch height")
      },
    },
    {
      name: "The words hold 4.5:1 on what they sit on, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const w of await scope.locator('[data-slot="status-line-words"]').all()) {
          expect.atLeast(contrast(await w.evaluate((el) => getComputedStyle(el).color), await groundOf(w)), 4.5, `${theme} words`)
        }
      },
    },
  ],
}
