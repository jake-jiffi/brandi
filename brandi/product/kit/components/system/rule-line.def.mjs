// RuleLine's one definition: its README, its preview board and its scripted checks all come from here.

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
const spoken = (page) => page.evaluate(() => window.__liveChanges.filter((c) => c.text).map((c) => c.text))

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

const RULE = 'rule="[Chase overdue invoices]" href="#rule-chase" approved-by="[Sam Lee]" approved-on="[3 March]"'
// An invoice the rule acted on: the line sits under what it changed.
const ITEM = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;"
const line = (attrs) => `<x-import component-from-global-scope="NS.RuleLine" ${RULE} ${attrs}></x-import>`
const GRID = "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; width: 100%; align-items: start;"

export default {
  name: "RuleLine",
  group: "The assistant",
  job: "Shows which approved rule acted, wherever it acted: on the item it changed, in that item's history, and in the steps log.",
  status: "to build",
  props: [
    { name: "rule", type: "string", required: true, doc: "The rule's name, as people approved it. It links to the rule." },
    { name: "href", type: "string", required: true, doc: "The rule view." },
    { name: "approvedBy", type: "string", required: true, doc: "Who approved the rule." },
    { name: "approvedOn", type: "string", required: true, doc: 'When, as people read it: "[3 March]".' },
    { name: "state", type: '"acted" | "failed" | "changed" | "paused"', default: '"acted"', doc: "acted; failed, which names the step and the system; or changed or paused since, where the line stays and says so." },
    { name: "step", type: "ReactNode", doc: 'On failure, the step that failed: "sending the reminder".' },
    { name: "reason", type: "ReactNode", doc: 'On failure, what went wrong, naming the system: "Couldn\'t reach [email system]."' },
    { name: "onRetry", type: "() => void", doc: "One Try again after a failure. Focus stays on the line." },
    { name: "retryLabel", type: "string", default: '"Try again"', doc: "Try again's label." },
  ],
  notes: {
    Behaviour: [
      'A plain line with one link, the rule\'s name, which opens the rule view: "Done by the rule “[rule name]”, approved by [name] on [date]." The link is its one Tab stop, with Try again when it fails.',
      "A failure names the step and the system and offers one Try again. It is a status message when it happens, through a StatusLine, never on load. Try again keeps focus on the line.",
      "A rule changed or paused since keeps its line and says so in words.",
    ],
    Layout: ["One line in the meta style, wrapping under its icon. Try again sits after it and wraps under it on a narrow item."],
    States: ["Acted, failed, changed since and paused since."],
    Copy: ['Exactly: Done by the rule “[rule name]”, approved by [name] on [date]. A failure: The rule “[rule name]” failed at [step]. Couldn\'t reach [system].'],
    Rules: [
      "Wherever an approved rule acted: on the item it changed, in that item's history, and in the steps log when the rule ran steps.",
      "A rule acts only after a person approves it. Nothing a rule does is unmarked.",
    ],
  },
  frame: { width: 960, height: 680 },
  examples: [
    {
      id: "acted",
      title: "On the item the rule changed",
      layout: "block",
      markup: `<div style="${ITEM} max-width: 560px;">
<p class="type-label" style="margin: 0; color: var(--text-strong);">Reminder sent to [Northside Plumbing] for [Invoice 1042]</p>
${line("")}
</div>`,
    },
    {
      id: "since",
      title: "The rule changed or paused since: the line stays and says so",
      layout: "block",
      markup: `<div style="${GRID}">
<div style="${ITEM}">${line('state="changed"')}</div>
<div style="${ITEM}">${line('state="paused"')}</div>
</div>`,
    },
    {
      id: "failed",
      title: "Failed, with one Try again",
      layout: "block",
      markup: `<div style="${ITEM} max-width: 640px;">
<p class="type-label" style="margin: 0; color: var(--text-strong);">Reminder for [Invoice 1047], [Kim's Cafe]</p>
${line('state="{{failState}}" step="sending the reminder" reason="Couldn\'t reach [email system]." on-retry="{{retry}}"')}
</div>`,
    },
    {
      id: "in-steps",
      title: "In the steps log, when the rule ran steps",
      layout: "block",
      markup: `<div style="${ITEM} max-width: 640px;">
<x-import component-from-global-scope="NS.AISteps" steps="{{ruleSteps}}" default-open="{{yes}}" title="Sent [2] reminders"></x-import>
</div>`,
      vals: { yes: true },
    },
  ],
  state: { fail: "failed" },
  logic: `failState: self.state.fail,
    retry: () => {
      self.setState({ fail: "acted" })
      setTimeout(() => self.setState({ fail: "failed" }), 1500)
    },
    ruleSteps: [
      { label: "Found [2] invoices [14] days overdue", status: "done" },
      { label: "Sent [2] reminders by [email system]", status: "done", detail: React.createElement(NS.RuleLine, { rule: "[Chase overdue invoices]", href: "#rule-chase", approvedBy: "[Sam Lee]", approvedOn: "[3 March]" }) },
    ]`,
  checks: [
    {
      name: "It says which rule acted, who approved it and when, and its one link is the rule",
      example: "acted",
      async run({ scope, expect }) {
        expect.equal((await scope.locator('[data-slot="rule-line-text"]').innerText()).trim(), "Done by the rule “[Chase overdue invoices]”, approved by [Sam Lee] on [3 March].", "the line")
        const link = scope.getByRole("link", { name: "[Chase overdue invoices]" })
        expect.equal(await link.getAttribute("href"), "#rule-chase", "the link opens the rule")
        const stops = await scope.locator('[data-slot="rule-line"]').evaluate((el) => el.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])').length)
        expect.equal(stops, 1, "one Tab stop")
      },
    },
    {
      name: "A rule changed or paused since keeps its line and says so in words",
      example: "since",
      async run({ scope, expect }) {
        const lines = (await scope.locator('[data-slot="rule-line-text"]').allInnerTexts()).map((t) => t.trim())
        expect(lines[0].endsWith("on [3 March]. The rule has changed since."), `changed: ${lines[0]}`)
        expect(lines[1].endsWith("on [3 March]. The rule has been paused since."), `paused: ${lines[1]}`)
      },
    },
    {
      name: "A failure names the step and the system with one Try again, and is said when it happens, never on load",
      example: "failed",
      async run({ page, scope, expect }) {
        await reloadStopped(page)
        await wait(page, 1000)
        expect.equal((await spoken(page)).length, 0, "a failure already showing is not said on load")
        const words = "The rule “[Chase overdue invoices]” failed at sending the reminder. Couldn't reach [email system]."
        expect.equal((await scope.locator('[data-slot="rule-line-text"]').innerText()).trim(), words, "the step and the system, named")
        const retry = scope.getByRole("button", { name: "Try again" })
        expect.equal(await retry.count(), 1, "one Try again")
        await retry.focus()
        await page.keyboard.press("Enter")
        await wait(page, 200)
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-slot")), "rule-line-text", "focus stays on the line")
        await wait(page, 1600)
        expect.equal((await spoken(page)).join(" | "), words, "the failure is said once, when it happens")
      },
    },
    {
      name: "In the steps log, the line sits on the step the rule ran",
      example: "in-steps",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="ai-steps-step"] [data-slot="rule-line"]').count(), 1, "on the step")
      },
    },
    {
      name: "Its words and its link hold 4.5:1, in both themes",
      example: "acted",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const line = scope.locator('[data-slot="rule-line-text"]')
        const ground = await groundOf(line)
        expect.atLeast(contrast(await line.evaluate((el) => getComputedStyle(el).color), ground), 4.5, `${theme} words`)
        expect.atLeast(contrast(await scope.getByRole("link").evaluate((el) => getComputedStyle(el).color), ground), 4.5, `${theme} link`)
      },
    },
  ],
}
