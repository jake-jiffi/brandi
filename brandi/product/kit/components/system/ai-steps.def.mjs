// AISteps' one definition: its README, its preview board and its scripted checks all come from here.

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
const spoken = (page) => page.evaluate(() => window.__liveChanges.filter((c) => c.slot === "ai-steps-live" && c.text).map((c) => c.text))
// The elements in a scope that are animating, by name and length.
const moving = (scope) =>
  scope.evaluate((root) =>
    [...root.querySelectorAll("*")]
      .map((el) => getComputedStyle(el))
      .filter((s) => s.animationName !== "none")
      .map((s) => `${s.animationName} ${s.animationDuration}`)
  )
const summaryOf = (scope) => scope.locator('[data-slot="ai-steps-summary"]').first()

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

const FOUND = { label: "Found [12] overdue invoices", status: "done", detail: "From [accounting system], today at 9:41 am" }
const CHECKING = { label: "Checking the totals against [bank feed]", status: "running" }
const DRAFTING = { label: "Drafting the reminders", status: "waiting" }
const PANE = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px 20px; box-sizing: border-box;"
const steps = (attrs) => `<x-import component-from-global-scope="NS.AISteps" ${attrs}></x-import>`
const GRID = "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; width: 100%; align-items: start;"

export default {
  name: "AISteps",
  group: "The assistant",
  job: "What the assistant is doing, step by step, and how each step went: open while it works, folded to one line once it has finished.",
  status: "proven",
  types: ['type AIStep = { label: ReactNode; status: "done" | "running" | "waiting" | "failed" | "skipped" | "approval"; detail?: ReactNode }'],
  props: [
    { name: "steps", type: "AIStep[]", required: true, doc: "The steps in order: { label, status, detail }. status is done, running, waiting (not started yet), failed, skipped, or approval (the step that would act, waiting for a person)." },
    { name: "title", type: "ReactNode", doc: 'The folded line once the run has finished: "Checked [12] invoices in [accounting system]". It never hides a failure or a stop.' },
    { name: "defaultOpen", type: "boolean", doc: "Open at first. By default it is open while it works and folded once it has finished." },
    { name: "onRetry", type: "() => void", doc: "Shows Try again on the failed step. Focus then moves to that step." },
    { name: "retryLabel", type: "string", default: '"Try again"', doc: "Try again's label." },
    { name: "stopped", type: "boolean", default: "false", doc: "The person stopped the run: the steps say where." },
    { name: "announceEnd", type: "boolean", default: "true", doc: "true says the start, a failure, a stop and the end. false inside something with a status line of its own (AIAnswer), which says them instead." },
  ],
  tables: [
    {
      title: "What each step says",
      head: ["Status", "The step says", "Icon"],
      rows: [
        ["done", "Done", "CircleCheck"],
        ["running", "Running, or Stopped once the person stops the run", "A spinner, or a square"],
        ["waiting", "Not started, or Not run once the person stops the run", "CircleDashed"],
        ["failed", "Failed, with what failed and one Try again", "CircleAlert"],
        ["skipped", "Skipped", "ChevronsRight"],
        ["approval", "Waiting for your approval, while the proposal card waits", "CircleDot"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      'The summary line is a button that shows or hides the steps, with aria-expanded. While it runs it reads "Working, step 2 of 4", and the list names the step in hand.',
      'A failure reads "Failed at step 2 of 3" and a stop "Stopped at step 2 of 3". The title shows only once the run has finished, and never hides a failure or a stop. An empty run reads "Working", never "step 0 of 0".',
      "It folds itself when the run finishes, unless the person has opened or closed it. Folded steps are not rendered, so they leave the tab order; when the list folds with a step in focus, focus moves to the summary line.",
      "Each step says its state in words, and a label that is not plain text is read as its words. The start, a failure, a stop and the end are announced politely, never every step.",
      "Try again moves focus to the step being retried, which stays in the list as it runs again.",
    ],
    Layout: ["The summary line, then an ordered list joined by a thin rule. Each step's state sits at the end of its line, and its detail under it. The summary line and every step are 44px on a touch screen."],
    States: [
      "Working open, working folded, waiting for approval, failed, stopped, finished and empty.",
      "One spinner at a time: the summary spins only while the list is folded. Under reduced motion it slows to 2.4 seconds a turn.",
    ],
    Copy: [
      'Name each step by what it does, in the person\'s words, and the step in hand as it happens: "Comparing [records] with [source]".',
      "detail says where a figure came from and when, or what failed and in which system. Never a model's name, a prompt or a tool call.",
    ],
    Rules: [
      "Work of more than one step. One step of work is a Thinking line.",
      "A failed step offers Try again and leaves the steps after it not started. Inside an AIAnswer the answer's footer holds the one Try again instead.",
      "On its own, for a long job, it sits in a Card titled with the job's name.",
    ],
    Review: [
      "Two spinners ran at once (round 6).",
      "The steps line was 36px on touch (round 6).",
      'A step label that was not plain text was read out as "[object Object]" (round 6).',
      "A step title could hide a failure (round 6b).",
      'An empty run read "Working, step 0 of 0" (round 6c).',
    ],
  },
  frame: { width: 960, height: 1700 },
  examples: [
    {
      id: "working",
      title: "Working: open, one spinner, on the step in hand",
      layout: "block",
      markup: `<div style="${GRID}">
<div style="${PANE}">${steps('steps="{{working}}" default-open="{{yes}}"')}</div>
<div style="${PANE}">${steps('steps="{{working}}" default-open="{{no}}"')}</div>
</div>`,
      vals: { yes: true, no: false, working: [FOUND, CHECKING, DRAFTING] },
    },
    {
      id: "finished",
      title: "Finished: folded to its title",
      layout: "block",
      markup: `<div style="${GRID}">
<div style="${PANE}">${steps('steps="{{finished}}" title="Checked [12] invoices in [accounting system]"')}</div>
<div style="${PANE}">${steps('steps="{{finished}}" title="Checked [12] invoices in [accounting system]" default-open="{{yes}}"')}</div>
</div>`,
      vals: { finished: [FOUND, { label: "Checked the totals against [bank feed]", status: "done", detail: "[3] invoices do not match: [Invoice 1042], [1047] and [1051]" }, { label: "Drafted [3] reminders", status: "done" }] },
    },
    {
      id: "failed",
      title: "Failed, with one Try again: the title never hides it",
      layout: "block",
      markup: `<div style="${PANE}">${steps('steps="{{retrySteps}}" title="Checked [12] invoices in [accounting system]" on-retry="{{retryRun}}"')}</div>`,
    },
    {
      id: "stopped",
      title: "Stopped, and waiting for approval",
      layout: "block",
      markup: `<div style="${GRID}">
<div style="${PANE}">${steps('steps="{{working}}" stopped="{{yes}}" title="Checked [12] invoices in [accounting system]"')}</div>
<div style="${PANE}">${steps('steps="{{approval}}"')}</div>
</div>`,
      vals: { approval: [FOUND, { label: "Checked the totals against [bank feed]", status: "done" }, { label: "Sending [3] reminders by email", status: "approval", detail: "The proposal below lists them" }] },
    },
    {
      id: "empty",
      title: "Before the first step",
      layout: "block",
      markup: `<div style="${PANE} max-width: 460px;">${steps('steps="{{none}}"')}</div>`,
      vals: { none: [] },
    },
    {
      id: "long-job",
      title: "A long job on its own, in a card titled with the job",
      layout: "block",
      markup: `<div style="max-width: 560px;">
<x-import component-from-global-scope="NS.Card" title="Matching [March] payments to invoices">
${steps('steps="{{longJob}}" default-open="{{yes}}"')}
</x-import>
</div>`,
      vals: {
        longJob: [
          { label: "Read [214] payments from [bank feed]", status: "done", detail: "[1 March] to [31 March]" },
          { label: "Matched [198] payments to invoices", status: "done" },
          { label: "Looking for the other [16]", status: "running" },
          { label: "Draft a note for each one that does not match", status: "waiting" },
          { label: "Check the notes against the brand", status: "skipped", detail: "Not needed for internal notes" },
        ],
      },
    },
  ],
  state: { retried: false, finished: false },
  logic: `retrySteps: self.state.finished
      ? [${JSON.stringify(FOUND)}, { label: React.createElement("span", null, "Checked the totals against ", React.createElement("strong", null, "[bank feed]")), status: "done" }, { label: "Drafted [3] reminders", status: "done" }]
      : [${JSON.stringify(FOUND)}, { label: React.createElement("span", null, "Checking the totals against ", React.createElement("strong", null, "[bank feed]")), status: self.state.retried ? "running" : "failed", detail: self.state.retried ? undefined : "Couldn't reach [bank feed]. It has not answered since 9:42 am." }, { label: "Drafting the reminders", status: "waiting" }],
    retryRun: () => {
      self.setState({ retried: true })
      setTimeout(() => self.setState({ finished: true }), 1500)
    }`,
  checks: [
    {
      name: "One spinner at a time: on the step in hand while open, on the summary while folded",
      example: "working",
      async run({ scope, expect }) {
        const [open, folded] = await scope.locator('[data-slot="ai-steps"]').all()
        expect.equal((await moving(open)).join(", "), "spin 1s", "one spinner while open")
        expect.equal(await open.locator('[data-slot="ai-steps-step"][data-status="running"] .animate-spin').count(), 1, "and it is on the step in hand")
        expect.equal((await moving(folded)).join(", "), "spin 1s", "one spinner while folded")
        expect.equal(await folded.locator('[data-slot="ai-steps-summary"] .animate-spin').count(), 1, "and it is on the summary")
      },
    },
    {
      name: "It reads Working, step 2 of 3, and the list names the step in hand",
      example: "working",
      async run({ scope, expect }) {
        const open = scope.locator('[data-slot="ai-steps"]').first()
        expect.equal((await summaryOf(open).innerText()).trim(), "Working, step 2 of 3", "the summary")
        const running = open.locator('[data-slot="ai-steps-step"][data-status="running"]')
        expect.equal((await running.locator('[data-slot="ai-steps-label"]').innerText()).trim(), "Checking the totals against [bank feed]", "the step in hand, named")
      },
    },
    {
      name: "The summary is a button that shows and hides the steps with Enter and Space, and folded steps leave the tab order",
      example: "working",
      async run({ page, scope, expect }) {
        const folded = scope.locator('[data-slot="ai-steps"]').nth(1)
        const summary = summaryOf(folded)
        expect.equal(await summary.getAttribute("aria-expanded"), "false", "folded")
        expect.equal(await folded.locator('[data-slot="ai-steps-step"]').count(), 0, "folded steps are not rendered")
        await summary.focus()
        await page.keyboard.press("Enter")
        expect.equal(await summary.getAttribute("aria-expanded"), "true", "Enter opens it")
        const list = folded.locator('[data-slot="ai-steps-list"]')
        expect.equal(await summary.getAttribute("aria-controls"), await list.getAttribute("id"), "the summary names the list it controls")
        expect.equal(await folded.locator('[data-slot="ai-steps-step"]').count(), 3, "the steps show")
        await page.keyboard.press(" ")
        expect.equal(await summary.getAttribute("aria-expanded"), "false", "Space closes it")
        expect.equal(await folded.locator('[data-slot="ai-steps-step"]').count(), 0, "and the steps leave the tab order")
      },
    },
    {
      name: "Each step says its state in words",
      async run({ page, expect }) {
        const words = (example) => page.locator(`[data-example="${example}"] [data-slot="ai-steps-state"]`).allInnerTexts()
        expect.equal((await words("working")).slice(0, 3).join(", "), "Done, Running, Not started", "working")
        expect.equal((await words("failed")).join(", "), "Done, Failed, Not started", "failed")
        expect.equal((await words("stopped")).join(", "), "Done, Stopped, Not run, Done, Done, Waiting for your approval", "stopped, and waiting for approval")
        expect((await words("long-job")).includes("Skipped"), "skipped")
      },
    },
    {
      name: "A failure and a stop are never hidden by the title",
      async run({ page, expect }) {
        expect.equal((await summaryOf(page.locator('[data-example="failed"]')).innerText()).trim(), "Failed at step 2 of 3", "the failure shows")
        expect.equal((await summaryOf(page.locator('[data-example="stopped"]')).innerText()).trim(), "Stopped at step 2 of 3", "the stop shows")
        expect.equal((await summaryOf(page.locator('[data-example="finished"]')).innerText()).trim(), "Checked [12] invoices in [accounting system]", "the title shows once the run has finished")
      },
    },
    {
      name: "An empty run reads Working, never step 0 of 0, with nothing to open",
      example: "empty",
      async run({ page, scope, expect }) {
        expect.equal((await summaryOf(scope).innerText()).trim(), "Working", "the summary")
        expect.equal(await scope.getByRole("button").count(), 0, "nothing to show or hide")
        expect(!(await page.locator("main").innerText()).includes("0 of 0"), "never step 0 of 0")
      },
    },
    {
      name: "A label that is not plain text is read as its words, never [object Object]",
      example: "failed",
      async run({ page, scope, expect }) {
        expect.equal((await scope.locator('[data-slot="ai-steps-step"][data-status="failed"] [data-slot="ai-steps-label"]').innerText()).trim(), "Checking the totals against [bank feed]", "the element label shows as words")
        expect(!(await page.locator("main").innerText()).includes("[object"), "no label is read as an object")
      },
    },
    {
      name: "Try again moves focus to the step being retried, and the start and the end are said once each",
      example: "failed",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        await scope.getByRole("button", { name: "Try again" }).focus()
        await page.keyboard.press("Enter")
        await wait(page, 300)
        const step = await page.evaluate(() => ({ slot: document.activeElement?.getAttribute("data-slot"), text: document.activeElement?.textContent }))
        expect.equal(step.slot, "ai-steps-step", "focus lands on the step being retried")
        expect(step.text.startsWith("Checking the totals against [bank feed]"), `the step: ${step.text}`)
        await wait(page, 1600)
        const back = await page.evaluate(() => document.activeElement?.getAttribute("data-slot"))
        expect.equal(back, "ai-steps-summary", "as the finished list folds, focus moves to its line, never the page body")
        const said = await spoken(page)
        expect.equal(said.join(" | "), "Working, step 2 of 3: Checking the totals against [bank feed]. | Checked [12] invoices in [accounting system]", "the start and the end, once each")
      },
    },
    {
      name: "The summary and every step are 44px on a touch screen",
      example: "working",
      touch: true,
      async run({ scope, expect }) {
        for (const s of await scope.locator('[data-slot="ai-steps-summary"]').all()) expect.atLeast(Math.round((await s.boundingBox()).height), 44, "summary line")
        for (const row of await scope.locator('[data-slot="ai-steps-step"]').all()) expect.atLeast(Math.round((await row.boundingBox()).height), 44, "step")
      },
    },
    {
      name: "Under reduced motion the spinner slows to 2.4 seconds",
      example: "working",
      reducedMotion: true,
      async run({ scope, expect }) {
        for (const pane of await scope.locator('[data-slot="ai-steps"]').all()) expect.equal((await moving(pane)).join(", "), "spin 2.4s", "one slow spinner")
      },
    },
    {
      name: "Forced colours keep each step's mark and the thread between them",
      example: "finished",
      forcedColors: true,
      async run({ scope, expect }) {
        const open = scope.locator('[data-slot="ai-steps"]').nth(1)
        for (const icon of await open.locator('[data-slot="ai-steps-step"] svg').all()) {
          const stroke = await icon.evaluate((el) => getComputedStyle(el).color)
          expect(!/rgba\(0, 0, 0, 0\)|transparent/.test(stroke), `each mark is drawn (${stroke})`)
        }
        const thread = await open.locator('[data-slot="ai-steps-step"] span.border-l').first().evaluate((el) => getComputedStyle(el).borderLeftStyle)
        expect.equal(thread, "solid", "the thread is a border, so it survives")
      },
    },
    {
      name: "The summary, the steps and their details hold 4.5:1, in both themes",
      example: "finished",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const open = scope.locator('[data-slot="ai-steps"]').nth(1)
        for (const sel of ['[data-slot="ai-steps-summary"]', '[data-slot="ai-steps-label"]', '[data-slot="ai-steps-state"]', '[data-slot="ai-steps-detail"]']) {
          const el = open.locator(sel).first()
          expect.atLeast(contrast(await el.evaluate((n) => getComputedStyle(n).color), await groundOf(el)), 4.5, `${theme} ${sel}`)
        }
      },
    },
  ],
}
