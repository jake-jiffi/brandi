// AIAnswer's one definition: its README, its preview board and its scripted checks all come from here.

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
// What the answers' status lines have said, in order.
const spoken = (page) => page.evaluate(() => window.__liveChanges.filter((c) => c.slot === "status-line-live" && c.text).map((c) => c.text))
const focused = (page) =>
  page.evaluate(() => ({
    slot: document.activeElement?.getAttribute("data-slot") ?? document.activeElement?.tagName.toLowerCase(),
    text: (document.activeElement?.textContent ?? "").replace(/\s+/g, " ").trim(),
  }))
const moving = (scope) =>
  scope.evaluate((root) =>
    [...root.querySelectorAll("*")]
      .map((el) => getComputedStyle(el))
      .filter((s) => s.animationName !== "none")
      .map((s) => `${s.animationName} ${s.animationDuration}`)
  )

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

const SOURCES = [
  { label: "[March] ledger, [accounting system]", icon: "BookOpen", href: "#march-ledger" },
  { label: "[Invoice 1042], line 3", icon: "Receipt", href: "#invoice-1042" },
  { label: "[Aged receivables] report", icon: "ChartColumn", href: "#aged-receivables" },
]
const CHECKED = [
  { label: "Found [12] overdue invoices", status: "done", detail: "From [accounting system], today at [9:41 am]" },
  { label: "Checked the totals against [bank feed]", status: "done", detail: "[3] are unpaid, [9] were paid late" },
  { label: "Worked out the amounts", status: "done" },
]
const ANSWER = "[3] invoices are overdue, worth [$4,280] in total. The oldest, [Invoice 1042] for [Northside Plumbing], is [18] days late."
const GRID = "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px; width: 100%; align-items: start;"
const answer = (attrs, body = "") => `<x-import component-from-global-scope="NS.AIAnswer" ${attrs}>${body}</x-import>`

export default {
  name: "AIAnswer",
  group: "The assistant",
  job: "What the assistant made, or is making: who made it, the question, its steps, the answer, its sources, its status and the person's next move.",
  status: "proven",
  types: ["type AIAnswerSource = { label: ReactNode; icon?: IconName; href: string }"],
  props: [
    { name: "question", type: "ReactNode", required: true, doc: "What the person asked, shown in full. It is the answer's heading." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", doc: "The question's heading level, so no page skips one." },
    { name: "name", type: "string", default: '"Assistant"', doc: "Who made it: the assistant, or the product's own name for it." },
    { name: "children", type: "ReactNode", doc: "The answer. Plain text becomes a paragraph capped at the measure." },
    { name: "sources", type: "AIAnswerSource[]", doc: "Where its figures came from: { label, icon, href }, shown as Source chips once it finishes. Every figure has one." },
    { name: "caveat", type: "ReactNode", doc: 'What to check first: "Check [the March payments] first." "The assistant can be wrong." always follows it.' },
    { name: "thinking", type: "ReactNode", doc: 'One step of work, named: "Reading [12] invoices…". Shown as a Thinking line while it works.' },
    { name: "steps", type: "AIStep[]", doc: "More than one step of work: { label, status, detail }, shown as AISteps." },
    { name: "stepsTitle", type: "ReactNode", doc: "The steps' folded line once they finish." },
    { name: "streaming", type: "boolean", default: "false", doc: "The answer is still arriving: it ends in a caret, and the status, sources, suggestions and actions wait." },
    { name: "onStop", type: "() => void", doc: "Shows Stop at the end of the status line while it works. Inside an AskPanel with onStop, Stop is the composer's instead." },
    { name: "stopLabel", type: "string", default: '"Stop"', doc: "Stop's label." },
    { name: "status", type: '"Drafted" | "Answered" | "Stopped" | "Failed"', default: '"Drafted"', doc: "Drafted (Use this, Edit and Discard) or Answered (the actions it leads to). Stopped keeps what it found. failed sets Failed for you." },
    { name: "actions", type: "ReactNode | FeedbackAction[]", doc: "The person's next move, as Buttons or data, at the default size. Only the newest answer's main action is primary, and none while a proposal waits." },
    { name: "suggestions", type: "string[]", doc: "Up to three follow-ups in the person's words, each under about 60 characters, as quiet buttons." },
    { name: "onSuggest", type: "(suggestion: string) => void", doc: "Called with the follow-up the person pressed, to ask it." },
    { name: "failed", type: "ReactNode", doc: 'What failed, naming the system: "Couldn\'t reach [accounting system]." It reads Failed, drops the caveat and the follow-ups, and offers one Try again.' },
    { name: "onRetry", type: "() => void", doc: "One Try again in the footer after a failure. Focus moves to the step being retried, or the question." },
    { name: "retryLabel", type: "string", default: '"Try again"', doc: "Try again's label." },
  ],
  notes: {
    Behaviour: [
      "While it thinks or streams, the status, sources, suggestions and actions wait for the finished answer, and streaming text ends in a caret.",
      'One polite status line (a StatusLine) says when the work starts, each step, and when it ends: "Answer ready", then the status and the answer\'s first sentence. Never word by word. An answer that loads finished stays quiet, the same failure twice is heard twice, and the line empties itself once spoken.',
      "A failure reads Failed, drops the caveat and the follow-ups, and puts one Try again in the footer.",
      'Stop moves focus to the steps line, which reads "Stopped at step N of M", or to the question. Try again moves it to the step being retried, or the question. Never the page body.',
      "The question is the heading, at headingLevel. The section is named by it.",
    ],
    Layout: [
      "No box of its own: answers stack in one column no wider than 880px, newest last, and an AIProposal inside one is the only card.",
      "The question, who made it, the steps, the answer capped at the measure, its sources, the caveat, then the footer: the status, the actions and the line's Stop or Try again. Follow-ups sit last. The footer wraps on a narrow answer.",
      "The answer is reading text, so it is body-lg at every width, phones included.",
    ],
    States: ["Thinking, working through steps, streaming, Drafted, Answered, Stopped, Failed, and waiting while a proposal inside it asks."],
    Copy: [
      'The caveat says what to check first, then "The assistant can be wrong."',
      'Follow-ups are what the person might ask next, in their words. They never ask what the answer already said and never read "Tell me more".',
      "No model names, prompts, tokens or raw tool calls on screen.",
    ],
    Rules: [
      "The assistant drafts and a person sends. To act on another system, it asks first with an AIProposal.",
      "A draft is Drafted, with Use this, Edit and Discard. An answer is Answered, with the actions it leads to. With several answers on screen, only the newest one's main action is primary, and while a proposal waits its action is the only primary.",
      "Every figure has a Source. More than one step of work passes steps, not thinking. Stop keeps what it found.",
    ],
    Review: [
      "A finished answer was never announced (round 6).",
      "Try again dropped focus to the page (round 6).",
      'A failed answer read "Drafted" with an empty body and no retry (round 6).',
      "Follow-ups looked like the actions, the footer broke apart on phones, and nothing could stop a running answer (round 6).",
      "The same failure twice was silent, and spoken lines stayed in the accessibility tree (round 6b).",
    ],
  },
  frame: { width: 960, height: 3260 },
  examples: [
    {
      id: "answered",
      title: "Answered: sources, the caveat, its actions and follow-ups",
      layout: "block",
      markup: answer('question="Which invoices are overdue?" steps="{{checked}}" steps-title="Checked [12] invoices in [accounting system]" sources="{{sources}}" caveat="Check [the March payments] first." status="Answered" actions="{{answeredActions}}" suggestions="{{follow}}" on-suggest="{{noop}}"', ANSWER),
      vals: {
        checked: CHECKED,
        sources: SOURCES,
        answeredActions: [{ label: "Draft reminders", variant: "primary", icon: "Sparkles" }, { label: "Copy answer", icon: "Copy" }],
        follow: ["Which client owes the most?", "Show the same for [February]", "Who paid late last quarter?"],
      },
    },
    {
      id: "drafted",
      title: "Drafted, with Use this, Edit and Discard",
      layout: "block",
      markup: `<div style="max-width: 640px;">${answer('question="Draft a reminder for [Invoice 1042]" sources="{{draftSources}}" caveat="Check the amount against [Invoice 1042] first." actions="{{draftActions}}"', "Hi [Sam], a reminder that [Invoice 1042] for [$1,280] was due on [9 October]. You can pay it from the link in the original email. Thanks, [Jo]")}</div>`,
      vals: {
        draftSources: [{ label: "[Invoice 1042]", icon: "Receipt", href: "#invoice-1042" }],
        draftActions: [{ label: "Use this", variant: "primary", icon: "Check" }, { label: "Edit", icon: "Pencil" }, { label: "Discard", variant: "ghost" }],
      },
    },
    {
      id: "working",
      title: "Working: one step, then Stop",
      layout: "block",
      markup: `<div style="${GRID}">
${answer('question="How much did [Northside Plumbing] pay in [September]?" thinking="{{thinkingA}}" status="{{statusA}}" on-stop="{{stopA}}"', "{{textA}}")}
${answer('question="Why is [Northside Plumbing] paying late?" steps="{{stepsB}}" streaming="{{streamingB}}" status="{{statusB}}" on-stop="{{stopB}}"', "[Northside Plumbing] has paid [4] of its last [6] invoices late, by [11] days on average")}
</div>`,
    },
    {
      id: "failed",
      title: "Failed, with one Try again that keeps focus",
      layout: "block",
      markup: `<div style="${GRID}">
${answer('question="Which invoices are overdue?" steps="{{stepsC}}" steps-title="Checked [12] invoices in [accounting system]" status="{{statusC}}" failed="{{failedC}}" sources="{{sourcesC}}" caveat="{{caveatC}}" on-retry="{{retryC}}"', "{{textC}}")}
${answer('question="What did [Kim\'s Cafe] order last month?" thinking="{{thinkingD}}" failed="{{failedD}}" on-retry="{{retryD}}"')}
</div>`,
    },
    {
      id: "stopped",
      title: "Stopped: it keeps what it found",
      layout: "block",
      markup: `<div style="max-width: 640px;">${answer('question="Which clients have not been invoiced for [October]?" steps="{{stoppedSteps}}" status="Stopped" sources="{{stoppedSources}}" caveat="Check [the October jobs] first." actions="{{stoppedActions}}"', "So far, [Kim's Cafe] and [Harbour Physio] have jobs in [October] with no invoice.")}</div>`,
      vals: {
        stoppedSteps: [
          { label: "Found [41] jobs in [October]", status: "done", detail: "From [booking system], today at [10:02 am]" },
          { label: "Checking each job for an invoice", status: "running" },
          { label: "Listing the clients", status: "waiting" },
        ],
        stoppedSources: [{ label: "[October] jobs, [booking system]", icon: "CalendarDays", href: "#october-jobs" }],
        stoppedActions: [{ label: "Ask again", icon: "RotateCcw" }],
      },
    },
    {
      id: "proposal",
      title: "A proposal waiting inside: its action is the only primary",
      layout: "block",
      markup: `<div style="max-width: 640px;">
<x-import component-from-global-scope="NS.AIAnswer" question="Chase the overdue invoices" sources="{{sources}}" caveat="Check [Invoice 1042] first: a part payment came in on [20 October]." status="Answered" actions="{{answeredActions}}">
<p>[2] of the [3] overdue invoices can be chased today. [Invoice 1051] already has a reminder from [Monday].</p>
<x-import component-from-global-scope="NS.AIProposal" title="Send reminders for 2 invoices?" items="{{proposalItems}}" confirm-label="Send 2 reminders" on-confirm="{{noop}}" on-dismiss="{{noop}}" on-edit="{{noop}}" heading-level="4">Both are more than 14 days overdue, and neither client has had a reminder this month.</x-import>
</x-import>
</div>`,
      vals: {
        proposalItems: [
          { title: "[Invoice 1042], [Northside Plumbing]", meta: "[$1,280], [18] days overdue", badge: { label: "Overdue", tone: "danger" } },
          { title: "[Invoice 1047], [Kim's Cafe]", meta: "[$2,100], [15] days overdue", badge: { label: "Overdue", tone: "danger" } },
        ],
      },
    },
    {
      id: "phone",
      title: "At a phone's width: the footer wraps and holds together",
      layout: "block",
      markup: `<div style="width: 320px;">${answer('question="Draft a reminder for [Invoice 1042]" sources="{{draftSources}}" caveat="Check the amount first." actions="{{draftActions}}" suggestions="{{phoneFollow}}" on-suggest="{{noop}}"', "Hi [Sam], a reminder that [Invoice 1042] for [$1,280] was due on [9 October].")}</div>`,
      vals: { phoneFollow: ["Make it shorter", "Add the payment link"] },
    },
  ],
  state: { stopA: false, stopB: false, retryC: "failed", retryD: "failed" },
  logic: `noop: () => {},
    thinkingA: self.state.stopA ? undefined : "Reading [3] payments from [accounting system]…",
    statusA: self.state.stopA ? "Stopped" : "Answered",
    textA: self.state.stopA ? "Stopped before it finished reading the payments." : undefined,
    stopA: () => self.setState({ stopA: true }),
    stepsB: [{ label: "Found [6] invoices for [Northside Plumbing]", status: "done" }, { label: "Comparing each due date with its payment", status: "running" }],
    streamingB: !self.state.stopB,
    statusB: self.state.stopB ? "Stopped" : "Answered",
    stopB: () => self.setState({ stopB: true }),
    stepsC: self.state.retryC === "done"
      ? ${JSON.stringify(CHECKED)}
      : [${JSON.stringify(CHECKED[0])}, { label: "Checking the totals against [bank feed]", status: self.state.retryC === "working" ? "running" : "failed", detail: self.state.retryC === "working" ? undefined : "It has not answered since [9:42 am]" }, { label: "Working out the amounts", status: "waiting" }],
    statusC: "Answered",
    failedC: self.state.retryC === "failed" ? "Couldn't reach [bank feed], so nothing is checked yet." : undefined,
    sourcesC: self.state.retryC === "done" ? ${JSON.stringify(SOURCES)} : undefined,
    caveatC: self.state.retryC === "done" ? "Check [the March payments] first." : undefined,
    textC: self.state.retryC === "done" ? ${JSON.stringify(ANSWER)} : undefined,
    retryC: () => {
      self.setState({ retryC: "working" })
      setTimeout(() => self.setState({ retryC: "done" }), 1500)
    },
    thinkingD: self.state.retryD === "working" ? "Reading [Kim's Cafe] orders from [ordering system]…" : undefined,
    failedD: self.state.retryD === "failed" ? "Couldn't reach [ordering system]." : undefined,
    retryD: () => {
      self.setState({ retryD: "working" })
      setTimeout(() => self.setState({ retryD: "failed" }), 1500)
    }`,
  checks: [
    {
      name: "Announced once it finishes, never word by word, through a live region there from the start",
      example: "failed",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const answer = scope.locator('[data-slot="ai-answer"]').first()
        const region = answer.locator('[data-slot="status-line-live"]')
        expect.equal(await region.count(), 1, "one live region in the answer, there before anything changes")
        expect.equal((await region.textContent()).trim(), "", "empty until something changes")
        await answer.getByRole("button", { name: "Try again" }).focus()
        await page.keyboard.press("Enter")
        await wait(page, 400)
        await wait(page, 1600)
        const said = await spoken(page)
        const ready = said.filter((s) => s.startsWith("Answer ready"))
        expect.equal(ready.length, 1, `said once it finishes: ${said.join(" | ")}`)
        expect.equal(ready[0], "Answer ready. Answered: [3] invoices are overdue, worth [$4,280] in total.", "its status and its first sentence")
        expect(!said.some((s) => s.includes("The oldest")), "never the rest of the answer")
      },
    },
    {
      name: "Try again keeps focus on something real: the step being retried, then the steps line as they fold",
      example: "failed",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const answer = scope.locator('[data-slot="ai-answer"]').first()
        await answer.getByRole("button", { name: "Try again" }).focus()
        await page.keyboard.press("Enter")
        await wait(page, 200)
        let f = await focused(page)
        expect.equal(f.slot, "ai-steps-step", "focus moves to the step being retried")
        expect(f.text.startsWith("Checking the totals against [bank feed]"), `the step: ${f.text}`)
        await wait(page, 1600)
        f = await focused(page)
        expect.equal(f.slot, "ai-steps-summary", "as the finished steps fold, focus moves to their line, never the page body")
        expect.equal(f.text, "Checked [12] invoices in [accounting system]", "the line says what was done")
      },
    },
    {
      name: "The same failure twice is heard twice, and the line empties itself once spoken",
      example: "failed",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const answer = scope.locator('[data-slot="ai-answer"]').nth(1)
        for (let round = 0; round < 2; round++) {
          await answer.getByRole("button", { name: "Try again" }).focus()
          await page.keyboard.press("Enter")
          await wait(page, 300)
          expect.equal((await focused(page)).slot, "ai-answer-question", "with no steps, focus moves to the question")
          await wait(page, 1600)
        }
        const failures = (await spoken(page)).filter((s) => s.startsWith("Failed."))
        expect.equal(failures.length, 2, `heard twice: ${failures.join(" | ")}`)
        expect.equal(failures[0], "Failed. Couldn't reach [ordering system].", "it names the system")
        await wait(page, 5200)
        expect.equal((await answer.locator('[data-slot="status-line-live"]').textContent()).trim(), "", "the spoken line does not stay in the tree")
      },
    },
    {
      name: "The answer reads in body-lg, the reading style, at every width",
      example: "answered",
      async run({ page, scope, expect }) {
        const want = await page.evaluate(() => {
          const probe = document.createElement("p")
          probe.className = "type-body-lg"
          document.body.append(probe)
          const s = getComputedStyle(probe)
          const out = `${s.fontSize}/${s.lineHeight}`
          probe.remove()
          return out
        })
        for (const body of await page.locator('[data-slot="ai-answer-body"]').all()) {
          expect.equal(await body.evaluate((el) => `${getComputedStyle(el).fontSize}/${getComputedStyle(el).lineHeight}`), want, "the answer's size and leading")
        }
        expect.atLeast(await scope.locator('[data-slot="ai-answer-body"]').count(), 1, "an answer to measure")
      },
    },
    {
      name: "An answer that loads finished stays quiet",
      async run({ page, expect }) {
        await reloadStopped(page)
        await wait(page, 1500)
        expect.equal((await spoken(page)).length, 0, "nothing is said on load")
        expect.equal(await page.locator('[data-slot="ai-answer"] [data-slot="ai-steps-live"]').count(), 0, "steps inside an answer add no live region of their own")
      },
    },
    {
      name: "Stop keeps what it found, and focus moves to the steps line, which says where it stopped",
      example: "working",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const answer = scope.locator('[data-slot="ai-answer"]').nth(1)
        await answer.getByRole("button", { name: "Stop" }).focus()
        await page.keyboard.press("Enter")
        await wait(page, 300)
        const f = await focused(page)
        expect.equal(f.slot, "ai-steps-summary", "focus lands on the steps line")
        expect.equal(f.text, "Stopped at step 2 of 2", "which says where it stopped")
        expect((await answer.locator('[data-slot="ai-answer-body"]').innerText()).includes("has paid [4] of its last [6] invoices late"), "what it found stays")
        expect.equal(await answer.locator('[data-slot="ai-answer-caret"]').count(), 0, "the caret goes")
        expect.equal((await spoken(page)).filter((s) => s === "Stopped at step 2 of 2").length, 1, "the stop is said once")
      },
    },
    {
      name: "Stop on one step of work moves focus to the question",
      example: "working",
      async run({ page, scope, expect }) {
        const answer = scope.locator('[data-slot="ai-answer"]').first()
        await answer.getByRole("button", { name: "Stop" }).focus()
        await page.keyboard.press("Enter")
        await page.waitForTimeout(200)
        const f = await focused(page)
        expect.equal(f.slot, "ai-answer-question", "focus lands on the question, never the page")
        expect.equal((await answer.locator('[data-slot="badge"]').innerText()).trim(), "Stopped", "it reads Stopped")
      },
    },
    {
      name: "While it works the status, sources, follow-ups and actions wait, and streaming text ends in a caret",
      example: "working",
      async run({ scope, expect }) {
        const answer = scope.locator('[data-slot="ai-answer"]').nth(1)
        expect.equal(await answer.locator('[data-slot="badge"], [data-slot="source"], [data-slot="ai-answer-suggestions"], [data-slot="ai-answer-caveat"]').count(), 0, "nothing that waits for the finished answer shows")
        const caret = answer.locator('[data-slot="ai-answer-caret"]')
        expect.equal(await caret.count(), 1, "the text ends in a caret")
        expect.equal(await caret.getAttribute("aria-hidden"), "true", "the caret is hidden from screen readers")
        expect.equal(await answer.getByRole("button", { name: "Stop" }).count(), 1, "Stop sits at the end of the status line")
      },
    },
    {
      name: "A failure reads Failed, drops the caveat and follow-ups, names the system and offers one Try again",
      example: "failed",
      async run({ scope, expect }) {
        for (const answer of await scope.locator('[data-slot="ai-answer"]').all()) {
          expect.equal((await answer.locator('[data-slot="badge"]').innerText()).trim(), "Failed", "it reads Failed, never Drafted")
          expect.equal(await answer.locator('[data-slot="ai-answer-caveat"], [data-slot="ai-answer-suggestions"]').count(), 0, "no caveat and no follow-ups")
          expect.equal(await answer.getByRole("button", { name: "Try again" }).count(), 1, "one Try again")
          expect(/\[(bank feed|ordering system)\]/.test(await answer.locator('[data-slot="ai-answer-failed"]').innerText()), "the failure names the system")
        }
      },
    },
    {
      name: "A finished answer carries its sources and the standing caveat",
      example: "answered",
      async run({ scope, expect }) {
        const sources = scope.getByRole("list", { name: "Sources" })
        expect.equal(await sources.getByRole("link").count(), 3, "every figure has a source")
        expect.equal((await scope.locator('[data-slot="ai-answer-caveat"]').innerText()).trim(), "Check [the March payments] first. The assistant can be wrong.", "what to check first, then the standing line")
      },
    },
    {
      name: "Up to three follow-ups, quiet buttons in a labelled group, apart from the actions",
      example: "answered",
      async run({ scope, expect }) {
        const group = scope.getByRole("group", { name: "Ask next" })
        const follow = group.getByRole("button")
        expect.equal(await follow.count(), 3, "three follow-ups")
        for (const b of await follow.all()) expect.equal(await b.getAttribute("data-variant"), "ghost", "each is a quiet button")
        const actions = await scope.locator('[data-slot="ai-answer-footer"] [data-slot="button"]').evaluateAll((all) => all.map((b) => b.getAttribute("data-variant")))
        expect.equal(actions.join(","), "default,secondary", "the actions stay the next move")
      },
    },
    {
      name: "The question is the heading at its level, and names the answer",
      example: "answered",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("heading", { level: 3, name: "Which invoices are overdue?" }).count(), 1, "an h3 by default")
        expect.equal(await scope.getByRole("region", { name: "Which invoices are overdue?" }).count(), 1, "the answer is named by its question")
      },
    },
    {
      name: "While a proposal waits inside, its action is the only primary on screen",
      example: "proposal",
      async run({ scope, expect }) {
        const primaries = scope.locator('[data-slot="button"][data-variant="default"]')
        expect.equal(await primaries.count(), 1, "one primary")
        expect.equal((await primaries.innerText()).trim(), "Send 2 reminders", "and it is the proposal's action")
        expect.equal(await scope.locator('[data-slot="ai-answer"]').getAttribute("data-status"), "waiting", "the answer's line knows a proposal waits")
      },
    },
    {
      name: "At a phone's width the footer wraps inside the answer, and nothing runs off its edge",
      example: "phone",
      async run({ scope, expect }) {
        const answer = scope.locator('[data-slot="ai-answer"]')
        const edge = await answer.evaluate((el) => el.getBoundingClientRect().right)
        for (const b of await answer.locator('[data-slot="button"], [data-slot="source"], [data-slot="badge"]').all()) {
          expect.atLeast(Math.round(edge - (await b.boundingBox()).x - (await b.boundingBox()).width), 0, "inside the answer")
        }
        expect(await answer.evaluate((el) => el.scrollWidth <= el.clientWidth), "no sideways overflow")
      },
    },
    {
      name: "Footer buttons are 44px, and follow-ups and sources at least 40px, on a touch screen",
      example: "answered",
      touch: true,
      async run({ scope, expect }) {
        for (const b of await scope.locator('[data-slot="ai-answer-footer"] [data-slot="button"]').all()) expect.equal(Math.round((await b.boundingBox()).height), 44, "footer button")
        for (const b of await scope.getByRole("group", { name: "Ask next" }).getByRole("button").all()) expect.atLeast(Math.round((await b.boundingBox()).height), 40, "follow-up")
        for (const s of await scope.locator('[data-slot="source"]').all()) expect.equal(Math.round((await s.boundingBox()).height), 44, "source")
      },
    },
    {
      name: "Under reduced motion the spinner slows to 2.4 seconds, and nothing else moves",
      example: "working",
      reducedMotion: true,
      async run({ scope, expect }) {
        for (const answer of await scope.locator('[data-slot="ai-answer"]').all()) expect.equal((await moving(answer)).join(", "), "spin 2.4s", "one slow spinner per answer")
      },
    },
    {
      name: "The streaming caret stays visible in forced colours",
      example: "working",
      forcedColors: true,
      async run({ scope, expect }) {
        const caret = await scope.locator('[data-slot="ai-answer-caret"]').evaluate((el) => {
          const s = getComputedStyle(el)
          return { style: s.borderLeftStyle, width: s.borderLeftWidth, colour: s.borderLeftColor }
        })
        expect.equal(caret.style, "solid", "a solid edge")
        expect.equal(caret.width, "2px", "2px wide")
        expect(!/rgba\(0, 0, 0, 0\)|transparent/.test(caret.colour), `drawn in a system colour (${caret.colour})`)
      },
    },
    {
      name: "The question, the answer and the caveat hold 4.5:1, in both themes",
      example: "answered",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const slot of ["ai-answer-question", "ai-answer-body", "ai-answer-caveat", "ai-answer-by"]) {
          const el = scope.locator(`[data-slot="${slot}"]`).first()
          expect.atLeast(contrast(await el.evaluate((n) => getComputedStyle(n).color), await groundOf(el)), 4.5, `${theme} ${slot}`)
        }
      },
    },
  ],
}
