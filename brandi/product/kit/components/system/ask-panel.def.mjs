// AskPanel's one definition: its README, its preview board and its scripted checks all come from here.

async function wait(page, ms) {
  await page.clock.runFor(ms)
  await page.waitForTimeout(120)
}
const focused = (page) =>
  page.evaluate(() => ({
    slot: document.activeElement?.getAttribute("data-slot") ?? document.activeElement?.tagName.toLowerCase(),
    text: (document.activeElement?.textContent ?? "").replace(/\s+/g, " ").trim(),
    label: document.activeElement?.getAttribute("aria-label") ?? "",
  }))

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

const FIRST = "[3] invoices are overdue, worth [$4,280] in total. The oldest, [Invoice 1042] for [Northside Plumbing], is [18] days late."
// A crop of a window: square corners, because the panel docks to the edge of a page, never floats in it.
const FRAME = "height: 600px; border: 1px solid var(--line); overflow: hidden; background: var(--canvas); box-sizing: border-box;"
const PANEL = 'class="border-l-0" style="display: block; height: 100%;"'
const ROW = "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; width: 100%;"

export default {
  name: "AskPanel",
  group: "The assistant",
  job: "The assistant's docked panel: a thread of answers, the empty state and the composer, beside the page and never in front of it.",
  status: "to build",
  props: [
    { name: "title", type: "string", default: '"Assistant"', doc: "The panel's name: the assistant, or the product's own name for it. It names the panel's region." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "The title's heading level, so no page skips one." },
    { name: "children", type: "ReactNode", doc: "The thread, oldest first: AIAnswers, with any AIProposal inside the answer it belongs to." },
    { name: "greeting", type: "ReactNode", default: '"No questions yet"', doc: 'The empty thread\'s title: "Morning, [Sam]".' },
    { name: "suggestions", type: "string[]", doc: "Up to three questions for an empty thread, as quiet buttons. A viewer sees none that create anything." },
    { name: "onSuggest", type: "(suggestion: string) => void", doc: "Called with the suggestion the person pressed, to ask it." },
    { name: "onSend", type: "(question: string) => void", doc: "Called with the question on Enter or Send. Focus then moves to the new answer." },
    { name: "working", type: "boolean", default: "false", doc: "An answer is running: Send becomes Stop." },
    { name: "onStop", type: "() => void", doc: 'Stops the running answer. Focus moves to its "Stopped at step N of M" line. The answers inside show no Stop of their own.' },
    { name: "stopLabel", type: "string", default: '"Stop"', doc: "Stop's label." },
    { name: "sendLabel", type: "string", default: '"Send"', doc: "Send's label." },
    { name: "composerLabel", type: "string", default: '"Ask the assistant"', doc: "What the composer is for: its accessible name." },
    { name: "placeholder", type: "string", doc: "An example question, never an instruction." },
    { name: "onClose", type: "() => void", doc: "Shows a close button and lets Escape close the panel. Focus goes back to what opened it." },
    { name: "closeLabel", type: "string", default: '"Close the assistant"', doc: "The close button's name." },
    { name: "autoFocus", type: "boolean", default: "false", doc: "Moves focus to the composer when it opens, for a panel a person just opened. Leave it off for a panel open when the page loads." },
  ],
  notes: {
    Behaviour: [
      "Docked, not modal: a complementary region named by its title, beside the page. It traps nothing and hides nothing, so people keep working in the page behind it, and Tab moves on from it into the page.",
      "Enter sends and Shift+Enter adds a line. After Send or a suggestion, focus moves to the new answer's question. The thread is not a live region: each answer has its own status line.",
      'While an answer runs, Send becomes Stop, and Stop moves focus to that answer\'s "Stopped at step N of M" line. While a proposal waits in the thread, Send drops to secondary, so the proposal\'s action is the only primary.',
      "Close, or Escape inside the panel, closes it at once and returns focus to what opened it, then the page title, then main. It remembers what had focus as it mounts, so mount it when it opens.",
      "The composer comes after the thread in the tab order, so it is the next stop after the newest answer's own controls.",
    ],
    Layout: ["The title bar, the thread (scrolling, newest last) and the composer at the foot. It fills the height it is given and takes its width from the page beside it."],
    States: ["Empty, with a greeting and up to three suggestions. Replying, with Stop in place of Send. Waiting on a proposal, with Send secondary. Done, stopped and failed come from the answers."],
    Copy: ["The greeting is short and in the brand's voice. Suggestions are things the person can do, in their words. The placeholder is an example question, never an instruction."],
    Rules: [
      "No model picker, no tabs of tools, no agent desktop.",
      "A viewer sees no suggestion that creates anything.",
      "On a phone the same panel fills the screen; on a wide screen it docks beside the page.",
    ],
  },
  frame: { width: 1200, height: 1360 },
  examples: [
    {
      id: "docked",
      title: "Docked beside the page: people keep working behind it",
      layout: "block",
      markup: `<div style="${FRAME} display: flex;">
<div style="flex: 1; min-width: 0; padding: 28px 32px; display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
<p class="type-heading-lg" style="margin: 0; color: var(--text-strong);">[Invoices]</p>
<p class="type-body" style="margin: 0; max-width: 30em; color: var(--text-muted);">[12] invoices are overdue. Ask the assistant to check them or draft the reminders.</p>
<x-import component-from-global-scope="NS.Button" icon="Sparkles" on-click="{{openPanel}}">Ask the assistant</x-import>
</div>
<sc-if value="{{panelOpen}}">
<x-import component-from-global-scope="NS.AskPanel" style="display: block; width: 400px; height: 100%; flex-shrink: 0;" auto-focus="{{reopened}}" placeholder="Which client owes the most?" on-close="{{closePanel}}" on-send="{{send}}">
<x-import component-from-global-scope="NS.AIAnswer" question="Which invoices are overdue?" status="Answered" sources="{{firstSources}}" caveat="Check [the March payments] first.">${FIRST}</x-import>
<sc-for list="{{asked}}" as="a">
<x-import component-from-global-scope="NS.AIAnswer" question="{{a.question}}" thinking="{{a.thinking}}" status="Answered" sources="{{a.sources}}" caveat="{{a.caveat}}">{{a.text}}</x-import>
</sc-for>
</x-import>
</sc-if>
</div>`,
      vals: { firstSources: [{ label: "[Aged receivables] report", icon: "ChartColumn", href: "#aged-receivables" }] },
    },
    {
      id: "states",
      title: "Empty, replying, and waiting on a proposal",
      layout: "block",
      markup: `<div style="${ROW}">
<div data-panel="empty" style="${FRAME}">
<x-import component-from-global-scope="NS.AskPanel" ${PANEL} greeting="Morning, [Sam]" suggestions="{{ideas}}" on-suggest="{{noop}}" on-send="{{noop}}" placeholder="Who has not paid this month?"></x-import>
</div>
<div data-panel="working" style="${FRAME}">
<x-import component-from-global-scope="NS.AskPanel" ${PANEL} working="{{running}}" on-stop="{{stop}}" on-send="{{noop}}">
<x-import component-from-global-scope="NS.AIAnswer" question="Why is [Northside Plumbing] paying late?" steps="{{lateSteps}}" streaming="{{running}}" status="{{lateStatus}}">[Northside Plumbing] has paid [4] of its last [6] invoices late</x-import>
</x-import>
</div>
<div data-panel="waiting" style="${FRAME}">
<x-import component-from-global-scope="NS.AskPanel" ${PANEL} on-send="{{noop}}">
<x-import component-from-global-scope="NS.AIAnswer" question="Chase the overdue invoices" status="Answered" caveat="Check [Invoice 1042] first.">
<p>[2] invoices can be chased today.</p>
<x-import component-from-global-scope="NS.AIProposal" title="Send reminders for 2 invoices?" heading-level="4" items="{{two}}" confirm-label="Send 2 reminders" on-confirm="{{noop}}" on-dismiss="{{noop}}"></x-import>
</x-import>
</x-import>
</div>
</div>`,
      vals: {
        ideas: ["Which invoices are overdue?", "Draft a reminder for [Kim's Cafe]", "What did we invoice in [October]?"],
        two: [
          { title: "[Invoice 1042], [Northside Plumbing]", meta: "[$1,280], [18] days overdue" },
          { title: "[Invoice 1047], [Kim's Cafe]", meta: "[$2,100], [15] days overdue" },
        ],
      },
    },
  ],
  state: { panelOpen: true, reopened: false, asked: [], stopped: false },
  logic: `noop: () => {},
    panelOpen: self.state.panelOpen,
    reopened: self.state.reopened,
    openPanel: () => self.setState({ panelOpen: true, reopened: true }),
    closePanel: () => self.setState({ panelOpen: false }),
    asked: self.state.asked,
    send: (question) => {
      const at = self.state.asked.length
      self.setState((s) => ({ asked: s.asked.concat({ question, thinking: "Reading [12] invoices from [accounting system]…" }) }))
      setTimeout(() => self.setState((s) => ({ asked: s.asked.map((a, i) => (i === at ? { question: a.question, text: "[Northside Plumbing] owes the most: [$1,280] across [2] invoices.", caveat: "Check [Invoice 1042] first.", sources: [{ label: "[Invoice 1042]", icon: "Receipt", href: "#invoice-1042" }] } : a)) })), 1500)
    },
    running: !self.state.stopped,
    stop: () => self.setState({ stopped: true }),
    lateStatus: self.state.stopped ? "Stopped" : "Answered",
    lateSteps: [{ label: "Found [6] invoices for [Northside Plumbing]", status: "done" }, { label: "Comparing each due date with its payment", status: "running" }]`,
  checks: [
    {
      name: "Docked, not modal: a named complementary region that traps nothing, so Tab moves on into the page",
      example: "docked",
      async run({ page, scope, expect }) {
        const panel = scope.getByRole("complementary", { name: "Assistant" })
        expect.equal(await panel.count(), 1, "a complementary region named by its title")
        expect.equal(await panel.getAttribute("aria-modal"), null, "never modal")
        expect.equal(await page.locator('[aria-modal="true"], [data-radix-focus-guard]').count(), 0, "no focus trap anywhere")
        await panel.getByRole("button", { name: "Close the assistant" }).focus()
        await page.keyboard.press("Shift+Tab")
        expect(await scope.getByRole("button", { name: "Ask the assistant" }).evaluate((el) => el === document.activeElement), "Shift+Tab from its first control reaches the page beside it")
        await panel.getByRole("button", { name: "Send", exact: true }).focus()
        await page.keyboard.press("Tab")
        const left = await panel.evaluate((el) => !el.contains(document.activeElement) && document.activeElement !== document.body)
        expect(left, "and Tab from its last control moves on past it")
      },
    },
    {
      name: "Enter sends and Shift+Enter adds a line, and focus moves to the new answer",
      example: "docked",
      async run({ page, scope, expect }) {
        const field = scope.getByRole("textbox", { name: "Ask the assistant" })
        await field.click()
        await page.keyboard.type("Which client")
        await page.keyboard.press("Shift+Enter")
        expect.equal(await field.inputValue(), "Which client\n", "Shift+Enter adds a line")
        await field.fill("Which client owes the most?")
        await page.keyboard.press("Enter")
        await page.waitForTimeout(150)
        const f = await focused(page)
        expect.equal(f.slot, "ai-answer-question", "focus lands on the new answer")
        expect.equal(f.text, "Which client owes the most?", "the one just asked")
        expect.equal(await field.inputValue(), "", "the composer empties")
      },
    },
    {
      name: "While an answer runs, Send becomes Stop, and Stop moves focus to that answer's steps line",
      example: "states",
      async run({ page, scope, expect }) {
        const panel = scope.locator('[data-panel="working"]')
        expect.equal(await panel.getByRole("button", { name: "Send", exact: true }).count(), 0, "no Send while it runs")
        expect.equal(await panel.locator('[data-slot="ai-answer"]').getByRole("button", { name: "Stop" }).count(), 0, "and the answer shows no Stop of its own")
        await panel.getByRole("button", { name: "Stop" }).focus()
        await page.keyboard.press("Enter")
        await page.waitForTimeout(200)
        const f = await focused(page)
        expect.equal(f.slot, "ai-steps-summary", "focus lands on the steps line")
        expect.equal(f.text, "Stopped at step 2 of 2", "which says where it stopped")
        expect.equal(await panel.getByRole("button", { name: "Send", exact: true }).count(), 1, "and Send is back")
      },
    },
    {
      name: "While a proposal waits in the thread, Send drops to secondary",
      example: "states",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-panel="waiting"]').getByRole("button", { name: "Send", exact: true }).getAttribute("data-variant"), "secondary", "Send steps aside for the proposal")
        expect.equal(await scope.locator('[data-panel="waiting"] [data-slot="button"][data-variant="default"]').count(), 1, "the proposal's action is the only primary")
        expect.equal(await scope.locator('[data-panel="empty"]').getByRole("button", { name: "Send", exact: true }).getAttribute("data-variant"), "default", "otherwise Send is the primary")
      },
    },
    {
      name: "Escape and Close shut it at once and send focus back to what opened it",
      example: "docked",
      async run({ page, scope, expect }) {
        const opener = scope.getByRole("button", { name: "Ask the assistant" })
        await scope.getByRole("textbox", { name: "Ask the assistant" }).focus()
        await page.keyboard.press("Escape")
        await page.waitForTimeout(100)
        expect.equal(await scope.getByRole("complementary").count(), 0, "Escape closes it at once")
        await opener.focus()
        await page.keyboard.press("Enter")
        await page.waitForTimeout(150)
        expect.equal((await focused(page)).slot, "ask-panel-field", "opened by a person, focus moves to the composer")
        await page.keyboard.press("Escape")
        await page.waitForTimeout(100)
        expect(await opener.evaluate((el) => el === document.activeElement), "Escape sends focus back to what opened it")
        await page.keyboard.press("Enter")
        await page.waitForTimeout(150)
        await scope.getByRole("button", { name: "Close the assistant" }).focus()
        await page.keyboard.press("Enter")
        await page.waitForTimeout(100)
        expect.equal(await scope.getByRole("complementary").count(), 0, "Close closes it")
        expect(await opener.evaluate((el) => el === document.activeElement), "and focus goes back to what opened it")
      },
    },
    {
      name: "An empty thread greets the person and offers up to three suggestions, as quiet buttons",
      example: "states",
      async run({ scope, expect }) {
        const panel = scope.locator('[data-panel="empty"]')
        expect.equal(await panel.getByRole("heading", { level: 3, name: "Morning, [Sam]" }).count(), 1, "the greeting, a level under the title")
        const ideas = panel.locator('[data-slot="ask-panel-thread"] [data-slot="button"]')
        expect.equal(await ideas.count(), 3, "three suggestions")
        for (const b of await ideas.all()) expect.equal(await b.getAttribute("data-variant"), "ghost", "quiet buttons")
      },
    },
    {
      name: "The composer comes after the thread in the tab order",
      example: "docked",
      async run({ page, scope, expect }) {
        await scope.locator('[data-slot="ask-panel-thread"] [data-slot="source"]').last().focus()
        await page.keyboard.press("Tab")
        expect.equal((await focused(page)).slot, "ask-panel-field", "the next stop after the newest answer's own controls")
      },
    },
    {
      name: "Send, Stop and the suggestions are at least 40px on a touch screen",
      example: "states",
      touch: true,
      async run({ scope, expect }) {
        for (const b of await scope.getByRole("button").all()) expect.atLeast(Math.round((await b.boundingBox()).height), 40, `${(await b.innerText()).trim()} on touch`)
      },
    },
    {
      name: "Its title and placeholder hold their contrast, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const panel = scope.locator('[data-panel="empty"] [data-slot="ask-panel"]')
        const surface = await panel.evaluate((el) => getComputedStyle(el).backgroundColor)
        expect.atLeast(contrast(await panel.getByRole("heading", { level: 2 }).evaluate((el) => getComputedStyle(el).color), surface), 4.5, `${theme} title`)
        const field = panel.locator('[data-slot="ask-panel-field"]')
        expect.atLeast(contrast(await field.evaluate((el) => getComputedStyle(el, "::placeholder").color), surface), 4.5, `${theme} placeholder`)
      },
    },
  ],
}
