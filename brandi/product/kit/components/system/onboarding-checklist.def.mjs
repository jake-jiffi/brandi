// OnboardingChecklist's one definition: its README, its preview board and its scripted checks all come from here.

const tasks = [
  { id: "details", label: "Add your business details", done: true, href: "#details" },
  { id: "team", label: "Invite your team", description: "[3] people have joined.", done: true, href: "#team" },
  { id: "bank", label: "Connect [your bank]", description: "So payments match their invoices without you.", href: "#bank" },
  { id: "service", label: "Set up your first service", description: "What you sell, and what it costs." },
  { id: "invoice", label: "Send yourself a test invoice", description: "See exactly what your clients will get." },
]
const allDone = tasks.map((t) => ({ ...t, done: true }))

async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}
const nameOf = (page) => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.trim() ?? null)

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export default {
  name: "OnboardingChecklist",
  group: "Navigation",
  job: "First-run tasks someone can do in any order, with their progress in words.",
  status: "to build",
  props: [
    { name: "title", type: "string", default: '"Get set up"', doc: "What finishing gets the person, as the card's heading." },
    { name: "description", type: "ReactNode", doc: "One line under the title." },
    { name: "tasks", type: "{ id: string; label: string; description?: string; done?: boolean; href?: string }[]", doc: "First-run tasks, done in any order. Each label is the outcome, verb first." },
    { name: "onTask", type: "(id: string) => void", doc: "Opens a task that has no href." },
    { name: "onDismiss", type: "() => void", doc: "Called once it is dismissed, which it can be only when every task is done. Remember it, so it stays gone." },
    { name: "progressLabel", type: "string", default: '"Setup progress"', doc: "Names the progress bar." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "The title's heading level, so no page skips one." },
  ],
  notes: {
    Behaviour: [
      "Not a Stepper: the order is free. Every task is a link or a button, done or not, so a finished one can be revisited, and Tab moves through them in order.",
      "Each task's name is its outcome and its state: Connect [your bank], Not started. A description is read as its description.",
      "The progress bar is named for the setup and reads in words: 2 of 5 done.",
      "Dismiss appears only once every task is done. It takes the checklist off the page and moves focus to what follows it, then the page title, then main, never the page body.",
    ],
    Layout: [
      "A Card: the title and a line, the progress in words over its bar, then the tasks as rows under hairlines. The inset steps from 24px to 16px when the card is under 360px wide.",
      "A task's mark is a check in a filled circle when done, an empty ring when not. A done task says Done, in the success colour, and its label quietens; one still to do has a chevron.",
    ],
    States: ["Each task not started or done. In progress, then complete, when the bar turns to success and Dismiss appears. Forced colours keep each mark's ring and check."],
    Copy: [
      "Tasks are outcomes, verb first: Connect [your bank], Invite your team. The line under one says why it matters or what it takes.",
      "The title says what finishing gets the person: Get set up.",
    ],
    Rules: [
      "First-run tasks only, and five or so at most. A process in order is a Stepper.",
      "Once dismissed, keep it gone: remember it in onDismiss.",
    ],
  },
  frame: { width: 960, height: 1580 },
  examples: [
    {
      id: "progress",
      title: "Two of five done",
      layout: "block",
      markup: `<div style="max-width: 560px;"><x-import component-from-global-scope="NS.OnboardingChecklist" title="Get set up" description="Finish these and you are ready to send your first invoice." tasks="{{tasks}}" on-task="{{openTask}}"></x-import></div>`,
      vals: { tasks },
    },
    {
      id: "complete",
      title: "All done, and ready to dismiss",
      layout: "stack",
      markup: `<div style="width: 560px;"><x-import component-from-global-scope="NS.OnboardingChecklist" title="Get set up" description="Everything is in place. Your first invoice is a press away." tasks="{{allDone}}" on-dismiss="{{dismissed}}"></x-import></div>
<x-import component-from-global-scope="NS.Button" variant="primary" icon="Plus">New invoice</x-import>`,
      vals: { allDone },
    },
    {
      id: "narrow",
      title: "A narrow card",
      markup: `<div style="width: 320px;"><x-import component-from-global-scope="NS.OnboardingChecklist" title="Get set up" tasks="{{someTasks}}"></x-import></div>`,
      vals: { someTasks: tasks.slice(0, 3) },
    },
  ],
  logic: `openTask: (id) => { window.__task = id },
  dismissed: () => { window.__dismissed = (window.__dismissed || 0) + 1 }`,
  checks: [
    {
      name: "Progress reads in words, and the bar is named for the setup",
      example: "progress",
      async run({ scope, expect }) {
        const bar = scope.getByRole("progressbar", { name: "Setup progress" })
        expect.equal(await bar.getAttribute("aria-valuetext"), "2 of 5 done", "the value in words")
        expect.equal(await bar.getAttribute("aria-valuenow"), "2", "aria-valuenow")
        expect.equal(await bar.getAttribute("aria-valuemax"), "5", "aria-valuemax")
        expect.equal((await scope.locator('[data-slot="progress-field"]').innerText()).replace(/\s+/g, " ").trim(), "Setup progress 2 of 5 done", "and shown in words beside it")
      },
    },
    {
      name: "Each task is named by its outcome and its state, and a finished one stays open to revisit",
      example: "progress",
      async run({ scope, expect }) {
        const names = await scope.locator('[data-slot="onboarding-task"] > *').evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")))
        expect.equal(names.join(" | "), "Add your business details, Done | Invite your team, Done | Connect [your bank], Not started | Set up your first service, Not started | Send yourself a test invoice, Not started", "each name carries its state in words")
        expect.equal(await scope.getByRole("link", { name: "Add your business details, Done" }).count(), 1, "a done task is still a link")
        const described = await scope.getByRole("link", { name: "Connect [your bank], Not started" }).evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent)
        expect.equal(described, "So payments match their invoices without you.", "the line under it is its description")
        expect.equal((await scope.locator('[data-done] [data-slot="onboarding-task-done"]').allTextContents()).join(","), "Done,Done", "done tasks say Done in words")
      },
    },
    {
      name: "Tab moves through the tasks in order, and Enter opens one",
      example: "progress",
      async run({ page, scope, expect }) {
        expect(await tabTo(page, scope.getByRole("link", { name: "Add your business details, Done" })), "Tab reaches the first task")
        const order = [await nameOf(page)]
        for (let i = 0; i < 4; i++) {
          await page.keyboard.press("Tab")
          order.push(await nameOf(page))
        }
        expect.equal(order.map((n) => n.split(",")[0]).join(" | "), "Add your business details | Invite your team | Connect [your bank] | Set up your first service | Send yourself a test invoice", "the tasks, in order")
        await page.keyboard.press("Enter")
        expect.equal(await page.evaluate(() => window.__task), "invoice", "Enter opened the task in hand")
        expect.equal(await scope.getByRole("button", { name: /^Dismiss/ }).count(), 0, "no Dismiss while tasks remain")
      },
    },
    {
      name: "Once every task is done, Dismiss takes it off the page and focus moves on to what follows",
      example: "complete",
      async run({ page, scope, expect }) {
        const bar = scope.getByRole("progressbar", { name: "Setup progress" })
        expect.equal(await bar.getAttribute("aria-valuetext"), "5 of 5 done", "complete, in words")
        const dismiss = scope.getByRole("button", { name: "Dismiss: Get set up" })
        expect(await tabTo(page, dismiss), "Tab reaches Dismiss")
        await page.keyboard.press("Enter")
        expect.equal(await scope.locator('[data-slot="onboarding-checklist"]').count(), 0, "the checklist has gone")
        expect.equal(await page.evaluate(() => window.__dismissed), 1, "onDismiss was called once")
        expect.equal(await nameOf(page), "New invoice", "focus moved on to the next control, not the page body")
      },
    },
    {
      name: "On a touch screen every task is 44px tall at least, and Dismiss is 40px",
      example: "complete",
      touch: true,
      async run({ scope, expect }) {
        const heights = await scope.locator('[data-slot="onboarding-task"] > *').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
        expect.atLeast(Math.round(Math.min(...heights)), 44, "the shortest task")
        expect.atLeast(Math.round((await scope.getByRole("button", { name: "Dismiss: Get set up" }).boundingBox()).height), 40, "Dismiss on touch")
      },
    },
    {
      name: "Forced colours keep each mark's ring, and the check on a done task",
      example: "progress",
      forcedColors: true,
      async run({ scope, expect }) {
        const marks = await scope.locator('[data-slot="onboarding-mark"]').evaluateAll((els) => els.map((el) => `${getComputedStyle(el).borderTopStyle} ${el.querySelector("svg") ? "check" : "empty"}`))
        expect.equal(marks.join(","), "solid check,solid check,solid empty,solid empty,solid empty", "every mark keeps its ring; done ones their check")
      },
    },
    {
      name: "Task text holds 4.5:1 on the card, in both themes",
      example: "progress",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const ground = await scope.locator('[data-slot="onboarding-checklist"]').evaluate((el) => getComputedStyle(el).backgroundColor)
        for (const slot of ["onboarding-task-label", "onboarding-task-description", "onboarding-task-done"]) {
          for (const colour of await scope.locator(`[data-slot="${slot}"]`).evaluateAll((els) => els.map((el) => getComputedStyle(el).color))) {
            expect.atLeast(Math.round(contrast(colour, ground) * 100) / 100, 4.5, `${theme} ${slot}`)
          }
        }
      },
    },
    {
      name: "A narrow card steps its inset down to 16px",
      example: "narrow",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="onboarding-task"] > *').first().evaluate((el) => getComputedStyle(el).paddingLeft), "16px", "a 320px card's task inset")
      },
    },
  ],
}
