// AIProposal's one definition: its README, its preview board and its scripted checks all come from here.

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
const spoken = (page) => page.evaluate(() => window.__liveChanges.filter((c) => c.slot === "ai-proposal-live" && c.text).map((c) => c.text))
const focused = (page) =>
  page.evaluate(() => ({
    slot: document.activeElement?.getAttribute("data-slot") ?? document.activeElement?.tagName.toLowerCase(),
    text: (document.activeElement?.textContent ?? "").replace(/\s+/g, " ").trim(),
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

const TWO = [
  { title: "[Invoice 1042], [Northside Plumbing]", meta: "[$1,280], [18] days overdue", badge: { label: "Overdue", tone: "danger" } },
  { title: "[Invoice 1047], [Kim's Cafe]", meta: "[$2,100], [15] days overdue", badge: { label: "Overdue", tone: "danger" } },
]
const SEVEN = [
  { title: "[Harbour Physio]", meta: "[$240] a month" },
  { title: "[Kim's Cafe]", meta: "[$180] a month" },
  { title: "[Northside Plumbing]", meta: "[$320] a month" },
  { title: "[Park Lane Dental]", meta: "[$410] a month" },
  { title: "[Ridge Electrical]", meta: "[$150] a month" },
  { title: "[Seaview Bakery]", meta: "[$95] a month" },
  { title: "[Willow Vets]", meta: "[$275] a month" },
]
const WHY = "Both are more than 14 days overdue, and neither client has had a reminder this month."
const GRID = "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; width: 100%; align-items: start;"
const proposal = (attrs, why = WHY) => `<x-import component-from-global-scope="NS.AIProposal" ${attrs}>${why}</x-import>`

export default {
  name: "AIProposal",
  group: "The assistant",
  job: "The assistant asks before it acts, and nothing happens until a person presses the button.",
  status: "proven",
  types: ['type AIProposalItem = { title: ReactNode; meta?: ReactNode; badge?: string | { label: string; tone?: "success" | "warning" | "danger" | "info" | "ai" | "highlight" | "neutral" } }'],
  props: [
    { name: "title", type: "ReactNode", required: true, doc: 'A question with the thing and the count: "Send reminders for 2 invoices?" It is the card\'s heading and names it.' },
    { name: "question", type: "ReactNode", doc: 'What the person asked, in their own words, when the proposal stands apart from the answer it came from. It shows under the title as "You asked: [question]", so it is never the assistant\'s question: that is the title.' },
    { name: "children", type: "ReactNode", doc: "Why the assistant proposes it, with a Source on every figure." },
    { name: "items", type: "AIProposalItem[]", doc: "Every record it will touch: { title, meta, badge }. Five show; the rest are counted in the note." },
    { name: "note", type: "ReactNode", default: '"Nothing happens until you press [confirmLabel]."', doc: "The line under the records while it asks." },
    { name: "danger", type: "boolean", default: "false", doc: "It deletes, or does something that cannot be undone: the action takes the danger style." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", doc: "The title's heading level, so no page skips one. 4 inside an answer." },
    { name: "confirmLabel", type: "string", default: '"Approve"', doc: 'The verb and the count: "Send 2 reminders". The only primary on screen while it waits.' },
    { name: "onConfirm", type: "() => void", doc: "Approves the action." },
    { name: "onEdit", type: "() => void", doc: "Shows Edit, which opens the draft. Without it there is no Edit, on a board too: a board that draws Edit passes a handler from its logic." },
    { name: "editLabel", type: "string", default: '"Edit"', doc: "Edit's label." },
    { name: "onDismiss", type: "() => void", doc: "Shows Not now. Without it there is no Not now, on a board too. It can be undone with onUndo." },
    { name: "dismissLabel", type: "string", default: '"Not now"', doc: "Not now's label." },
    { name: "onRetry", type: "() => void", doc: "One Try again after a failure, a secondary button." },
    { name: "retryLabel", type: "string", default: '"Try again"', doc: "Try again's label." },
    { name: "onUndo", type: "() => void", doc: "Shows Undo after Not now, in the dismissed state only. Done shows no Undo, even with onUndo: an action already taken is undone where the product can reverse it, never from here." },
    { name: "undoLabel", type: "string", default: '"Undo"', doc: "Undo's label." },
    { name: "rule", type: "ReactNode", doc: 'The rule behind the action, in plain words, shown before anyone saves it: "When an invoice is [14] days overdue, send a reminder."' },
    { name: "onApproveRule", type: "() => void", doc: "Shows Approve as a rule, a secondary button: the assistant can then act on that rule, and a RuleLine marks what it changed." },
    { name: "ruleLabel", type: "string", default: '"Approve as a rule"', doc: "Its label." },
    { name: "state", type: '"asking" | "working" | "done" | "failed" | "dismissed"', default: '"asking"', doc: "Shown as Needs you, In progress, Done, Failed and Not done: fixed words, which the written system's status table carries. Set it to show any state in place, for a design." },
    { name: "result", type: "ReactNode", doc: 'What happened, naming the system: "Sent 2 reminders by [email system]." While it works, the work: "Sending 2 reminders…".' },
  ],
  tables: [
    {
      title: "States",
      head: ["state", "Badge", "What shows"],
      rows: [
        ["asking", "Needs you", "The records, the note and the buttons, with the assistant's colour round the card"],
        ["working", "In progress", "The work, named, in place of the buttons"],
        ["done", "Done", "What happened, naming the system"],
        ["failed", "Failed", "What failed, with Not now, Edit and Try again"],
        ["dismissed", "Not done", "Nothing has changed, with Undo"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "A region named by its title, a heading at headingLevel. While it waits, the assistant's colour runs round the card as well as the Needs you badge.",
      "Once pressed, the buttons make way for the outcome, which takes focus and is read there. After Undo, the question takes focus. A change nobody pressed for, such as the work finishing, is said once by a polite line. Focus never falls to the page body, and someone who moved on before the proposal heard back is left where they went.",
      "A second press within a second, before the state moves on, is ignored, so a double press never acts twice. Set state to working at once for anything slower.",
      "The buttons run in reading order: Not now, Edit, then the action. Not now, Edit and Try again are described by the question, so a screen reader knows what they act on.",
      "A failure keeps Not now, Edit and Try again, and Not now can be undone.",
      "Not now, Edit and Try again show only with onDismiss, onEdit and onRetry, and Undo only with onUndo after Not now. A board draws them by passing handlers from its logic.",
      "Undo belongs to Not now. The done state shows what happened and no Undo, even with onUndo: undoing an action already taken is the product's own, where it can be reversed.",
    ],
    Layout: ["The title and its badge, why, the records, the note, then the buttons, right-aligned. Under 480px of card the buttons stack in reading order, full width."],
    States: ["Asking, working, done, failed and dismissed. In forced colours the outcome shows no outline until it has keyboard focus."],
    Copy: [
      "It brings its own status words: Needs you, In progress, Done, Failed and Not done. The written system's status table adopts all five with these meanings, rather than another word for the same state.",
      'question shows as "You asked: [question]": the person\'s own words, never the assistant\'s question, which is the title.',
      'The title is a question with the thing and the count. The action repeats the verb and the count, and the note says nothing happens until the person presses it. After Not now: "Nothing has changed."',
      "While it runs, it names the work. Afterwards it says what happened, naming the system.",
    ],
    Rules: [
      "Use it whenever the assistant would send, pay, approve, change another system or delete.",
      "One proposal waits at a time, and its action is the only primary on screen while it waits.",
      'List every record it will touch, five at most, with "And 12 more." in the note. Try again after a failure is a secondary button.',
      "A person approves each action, or the rule behind it. A rule shows in plain words before it is saved.",
    ],
    Review: ["A failed proposal was a dead end, and Not now focused an empty status (round 6).", "The outcome showed an outline at rest in forced colours (round 6b)."],
  },
  frame: { width: 960, height: 2420 },
  examples: [
    {
      id: "asking",
      title: "Asking: what will happen, with Approve and Not now",
      layout: "block",
      // data-approvals counts how often the product was asked to act, so a check can prove one press acts once.
      markup: `<div style="${GRID}" data-approvals="{{approvals}}">
${proposal('title="Send reminders for 2 invoices?" items="{{two}}" confirm-label="Send 2 reminders" state="{{approveState}}" result="{{approveResult}}" on-confirm="{{approve}}" on-edit="{{noop}}" on-dismiss="{{noop}}"')}
${proposal('title="Send reminders for 2 invoices?" items="{{two}}" confirm-label="Send 2 reminders" state="{{dismissState}}" on-confirm="{{noop}}" on-edit="{{noop}}" on-dismiss="{{dismiss}}" on-undo="{{undo}}"')}
</div>`,
      vals: { two: TWO },
    },
    {
      id: "failed",
      title: "Failed: never a dead end",
      layout: "block",
      markup: `<div style="max-width: 460px;">
${proposal('title="Send reminders for 2 invoices?" items="{{two}}" confirm-label="Send 2 reminders" state="{{retryState}}" result="{{retryResult}}" on-retry="{{retry}}" on-edit="{{noop}}" on-dismiss="{{noop}}" on-undo="{{noop}}"')}
</div>`,
    },
    {
      id: "many",
      title: "Five records at most, the rest counted, and the rule behind it",
      layout: "block",
      markup: `<div style="max-width: 560px;">
${proposal('title="Raise the monthly fee for 7 clients?" items="{{seven}}" confirm-label="Raise 7 fees" rule="When a contract renews, raise its fee by [3%]." on-confirm="{{noop}}" on-approve-rule="{{noop}}" on-edit="{{noop}}" on-dismiss="{{noop}}"', "Their contracts renew on [1 November] with a [3%] rise, and none has been raised yet.")}
</div>`,
      vals: { seven: SEVEN },
    },
    {
      id: "danger",
      title: "Danger: it deletes",
      layout: "block",
      markup: `<div style="max-width: 460px;">
${proposal('title="Delete 3 draft invoices?" danger="{{yes}}" confirm-label="Delete 3 drafts" items="{{drafts}}" note="They cannot be brought back. Nothing happens until you press Delete 3 drafts." on-confirm="{{noop}}" on-dismiss="{{noop}}"', "They were made by the import on [2 October] and match invoices that were already sent.")}
</div>`,
      vals: {
        yes: true,
        // A badge can be its word alone, which takes the neutral tone.
        drafts: [
          { title: "[D-311], [Harbour Physio]", meta: "[$240]", badge: "Draft" },
          { title: "[D-312], [Kim's Cafe]", meta: "[$180]", badge: "Draft" },
          { title: "[D-313], [Willow Vets]", meta: "[$275]", badge: "Draft" },
        ],
      },
    },
    {
      id: "outcomes",
      title: "Each outcome, in place for a design",
      layout: "block",
      markup: `<div style="${GRID} align-items: stretch;">
${proposal('title="Send reminders for 2 invoices?" state="working" result="Sending 2 reminders by [email system]…"')}
${proposal('title="Send reminders for 2 invoices?" state="done" result="Sent 2 reminders by [email system] at 10:14 am."')}
${proposal('title="Send reminders for 2 invoices?" state="dismissed" on-undo="{{noop}}"')}
${proposal('title="Send reminders for 2 invoices?" state="failed" result="Couldn\'t send: [email system] did not answer. Nothing was sent." on-retry="{{noop}}" on-edit="{{noop}}" on-dismiss="{{noop}}"')}
</div>`,
    },
  ],
  state: { approve: "asking", approvals: 0, dismiss: "asking", retry: "failed" },
  logic: `noop: () => {},
    approvals: self.state.approvals,
    approveState: self.state.approve,
    approveResult: self.state.approve === "working" ? "Sending 2 reminders by [email system]…" : "Sent 2 reminders by [email system] at 10:14 am.",
    // As a product would: the request goes out, and the proposal hears back a moment later.
    approve: () => {
      self.setState((s) => ({ approvals: s.approvals + 1 }))
      setTimeout(() => self.setState({ approve: "working" }), 300)
      setTimeout(() => self.setState({ approve: "done" }), 1800)
    },
    dismissState: self.state.dismiss,
    dismiss: () => self.setState({ dismiss: "dismissed" }),
    undo: () => self.setState({ dismiss: "asking" }),
    retryState: self.state.retry,
    retryResult: self.state.retry === "working" ? "Sending 2 reminders by [email system]…" : "Couldn't send: [email system] did not answer. Nothing was sent.",
    retry: () => {
      self.setState({ retry: "working" })
      setTimeout(() => self.setState({ retry: "failed" }), 1500)
    }`,
  checks: [
    {
      name: "The buttons run Not now, Edit, then the action, and the quiet ones are described by the question",
      example: "asking",
      async run({ scope, expect }) {
        const card = scope.locator('[data-slot="ai-proposal"]').first()
        const names = (await card.getByRole("button").allInnerTexts()).map((t) => t.trim())
        expect.equal(names.join(" | "), "Not now | Edit | Send 2 reminders", "reading order")
        const title = card.locator('[data-slot="ai-proposal-title"]')
        const id = await title.getAttribute("id")
        for (const name of ["Not now", "Edit"]) expect.equal(await card.getByRole("button", { name }).getAttribute("aria-describedby"), id, `${name} is described by the question`)
        expect.equal((await title.innerText()).trim(), "Send reminders for 2 invoices?", "the question names the thing and the count")
        expect.equal(await scope.getByRole("region", { name: "Send reminders for 2 invoices?" }).count(), 2, "each card is a region named by its question")
      },
    },
    {
      name: "While it waits, its action is the only primary, and the assistant's colour runs round the card with Needs you",
      example: "asking",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const card = scope.locator('[data-slot="ai-proposal"]').first()
        expect.equal(await card.locator('[data-slot="button"][data-variant="default"]').count(), 1, "one primary")
        expect.equal((await card.locator('[data-slot="badge"]').first().innerText()).trim(), "Needs you", "the badge says so in words")
        const look = await card.evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.color = "var(--ai-line)"
          document.body.append(probe)
          const ai = getComputedStyle(probe).color
          probe.remove()
          const s = getComputedStyle(el)
          return { ai, edge: s.borderTopColor, ring: s.boxShadow }
        })
        expect.equal(look.edge, look.ai, `${theme}: the edge is the assistant's colour`)
        expect(look.ring.includes(look.ai), `${theme}: and so is the ring round it (${look.ring})`)
      },
    },
    {
      name: "Approve: the buttons make way for the outcome, which takes focus, and the finish is said once",
      example: "asking",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const card = scope.locator('[data-slot="ai-proposal"]').first()
        await card.getByRole("button", { name: "Send 2 reminders" }).focus()
        await page.keyboard.press("Enter")
        await wait(page, 400)
        let f = await focused(page)
        expect.equal(f.slot, "ai-proposal-outcome", "focus lands on the outcome")
        expect.equal(f.text, "Sending 2 reminders by [email system]…", "which names the work")
        expect.equal(await card.getByRole("button").count(), 0, "the buttons made way")
        await wait(page, 1600)
        f = await focused(page)
        expect.equal(f.slot, "ai-proposal-outcome", "focus stays on the outcome as the work finishes")
        expect.equal((await spoken(page)).join(" | "), "Done. Sent 2 reminders by [email system] at 10:14 am.", "the finish is said once")
      },
    },
    {
      name: "One press acts once: a second press before the proposal hears back is ignored",
      example: "asking",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const confirm = scope.locator('[data-slot="ai-proposal"]').first().getByRole("button", { name: "Send 2 reminders" })
        await confirm.focus()
        await page.keyboard.press("Enter")
        await page.keyboard.press("Enter")
        await confirm.click()
        await wait(page, 400)
        expect.equal(await scope.locator("[data-approvals]").getAttribute("data-approvals"), "1", "the product was asked to act once")
      },
    },
    {
      name: "Someone who moves on before the proposal hears back is left where they went, and the outcome is said",
      example: "asking",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const [first, second] = await scope.locator('[data-slot="ai-proposal"]').all()
        await first.getByRole("button", { name: "Send 2 reminders" }).focus()
        await page.keyboard.press("Enter")
        await second.getByRole("button", { name: "Edit" }).focus()
        await wait(page, 600)
        expect.equal((await focused(page)).text, "Edit", "focus stays where the person went")
        expect.equal((await spoken(page)).join(" | "), "In progress. Sending 2 reminders by [email system]…", "and the change is said instead")
      },
    },
    {
      name: "Not now: focus lands on an outcome that says nothing has changed, and Undo brings the question back",
      example: "asking",
      async run({ page, scope, expect }) {
        const card = scope.locator('[data-slot="ai-proposal"]').nth(1)
        await card.getByRole("button", { name: "Not now" }).focus()
        await page.keyboard.press("Enter")
        await page.waitForTimeout(150)
        let f = await focused(page)
        expect.equal(f.slot, "ai-proposal-outcome", "focus lands on the outcome, never an empty status")
        expect.equal(f.text, "Nothing has changed.", "which says so")
        expect.equal((await card.locator('[data-slot="badge"]').first().innerText()).trim(), "Not done", "the badge says Not done")
        await card.getByRole("button", { name: "Undo" }).focus()
        await page.keyboard.press("Enter")
        await page.waitForTimeout(150)
        f = await focused(page)
        expect.equal(f.slot, "ai-proposal-title", "after Undo the question takes focus")
        expect.equal(await card.getByRole("button", { name: "Send 2 reminders" }).count(), 1, "and the proposal waits again")
      },
    },
    {
      name: "A failed proposal is never a dead end: Not now, Edit and a secondary Try again, which keeps focus",
      example: "failed",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        const card = scope.locator('[data-slot="ai-proposal"]')
        expect.equal((await card.getByRole("button").allInnerTexts()).map((t) => t.trim()).join(" | "), "Not now | Edit | Try again", "the ways on")
        const retry = card.getByRole("button", { name: "Try again" })
        expect.equal(await retry.getAttribute("data-variant"), "secondary", "Try again is secondary")
        expect.equal(await retry.getAttribute("aria-describedby"), await card.locator('[data-slot="ai-proposal-title"]').getAttribute("id"), "and described by the question")
        await retry.focus()
        await page.keyboard.press("Enter")
        await wait(page, 200)
        expect.equal((await focused(page)).slot, "ai-proposal-outcome", "focus lands on the outcome")
        await wait(page, 1600)
        expect.equal((await spoken(page)).join(" | "), "Failed. Couldn't send: [email system] did not answer. Nothing was sent.", "the same failure is said again")
        expect.equal(await card.getByRole("button", { name: "Try again" }).count(), 1, "and Try again is back")
      },
    },
    {
      name: "Five records at most, the rest counted in the note, and the rule shown in plain words",
      example: "many",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="ai-proposal-items"] li').count(), 5, "five records")
        expect.equal((await scope.locator('[data-slot="ai-proposal-note"]').innerText()).trim(), "And 2 more. Nothing happens until you press Raise 7 fees.", "the rest counted")
        expect.equal((await scope.locator('[data-slot="ai-proposal-rule"]').innerText()).trim(), "Or approve the rule behind it: When a contract renews, raise its fee by [3%].", "the rule in plain words")
        expect.equal(await scope.getByRole("button", { name: "Approve as a rule" }).getAttribute("data-variant"), "secondary", "approving the rule is secondary")
      },
    },
    {
      name: "Danger puts the action in the danger style, and nothing else is primary",
      example: "danger",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("button", { name: "Delete 3 drafts" }).getAttribute("data-variant"), "destructive", "the danger style")
        expect.equal(await scope.locator('[data-slot="button"][data-variant="default"]').count(), 0, "no other primary")
        const badges = await scope.locator('[data-slot="ai-proposal-items"] [data-slot="badge"]').evaluateAll((all) => all.map((b) => `${b.textContent.trim()} ${b.getAttribute("data-tone")}`))
        expect.equal(badges.join(", "), "Draft neutral, Draft neutral, Draft neutral", "a badge given as its word alone shows, in the neutral tone")
      },
    },
    {
      name: "Each state says so in words",
      example: "outcomes",
      async run({ scope, expect }) {
        expect.equal((await scope.locator('[data-slot="badge"]').allInnerTexts()).map((t) => t.trim()).join(", "), "In progress, Done, Not done, Failed", "the badges")
      },
    },
    {
      name: "Forced colours: the outcome draws no outline at rest",
      example: "outcomes",
      forcedColors: true,
      async run({ scope, expect }) {
        for (const o of await scope.locator('[data-slot="ai-proposal-outcome"]').all()) expect.equal(await o.evaluate((el) => getComputedStyle(el).outlineStyle), "none", "no outline at rest")
      },
    },
    {
      name: "Its buttons are 44px on a touch screen",
      example: "asking",
      touch: true,
      async run({ scope, expect }) {
        for (const b of await scope.locator('[data-slot="ai-proposal"]').first().getByRole("button").all()) expect.equal(Math.round((await b.boundingBox()).height), 44, "touch height")
      },
    },
    {
      name: "Its words hold 4.5:1 on the card, in both themes",
      example: "asking",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const card = scope.locator('[data-slot="ai-proposal"]').first()
        for (const sel of ['[data-slot="ai-proposal-title"]', '[data-slot="ai-proposal-why"]', '[data-slot="ai-proposal-note"]', '[data-slot="ai-proposal-items"] .type-meta']) {
          const el = card.locator(sel).first()
          expect.atLeast(contrast(await el.evaluate((n) => getComputedStyle(n).color), await card.evaluate((n) => getComputedStyle(n).backgroundColor)), 4.5, `${theme} ${sel}`)
        }
      },
    },
  ],
}
