// Stepper's one definition: its README, its preview board and its scripted checks all come from here.

/** A role's colour as the browser computes it in the current theme. */
const colourOf = (page, role) =>
  page.evaluate((r) => {
    const probe = document.createElement("span")
    probe.style.color = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, role)

/** What Chrome hands a screen reader for one element: its role, name and description. */
async function heard(page, locator) {
  const mark = `probe-${Math.random().toString(36).slice(2)}`
  await locator.evaluate((el, m) => el.setAttribute("data-probe", m), mark)
  const cdp = await page.context().newCDPSession(page)
  try {
    const { root } = await cdp.send("DOM.getDocument", { depth: -1 })
    const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-probe="${mark}"]` })
    const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false })
    return { role: nodes[0].role?.value, name: nodes[0].name?.value ?? "", description: nodes[0].description?.value ?? "" }
  } finally {
    await cdp.detach()
  }
}

const SETUP = ["Connect [accounting system]", "Invite [your team]", "Choose approvers", "Send a test invoice"]

export default {
  name: "Stepper",
  group: "Navigation",
  job: "Progress through a short setup: finished steps take a check, the current step a ring.",
  status: "proven",
  props: [
    { name: "steps", type: "Array<string | { label: string; description?: string; href?: string }>", doc: "Five steps at most, each named by its outcome. An href revisits a finished step by its address." },
    { name: "current", type: "number", default: "0", doc: "The current step, counted from 0. The number of steps means every step is finished." },
    { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', doc: "horizontal stacks under 640px of its own width. vertical always stacks." },
    { name: "label", type: "string", doc: "Names the list for screen readers (Setup progress)." },
    { name: "onStepClick", type: "(index: number) => void", doc: "Revisits a finished step. Without it, or a step's href, finished steps are not pressable." },
  ],
  tables: [
    {
      title: "Step states",
      head: ["State", "Looks like", "Screen readers hear"],
      rows: [
        ["Finished", "A filled circle with a check, a line in the primary colour after it", "[Label], Completed"],
        ["Current", "A ring in the primary colour round the step's number, the label in the strong text colour", "[Label], Current step"],
        ["Not started", "A hairline circle round the number, the label muted", "[Label], Not started"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "An ordered list. Each label is read with its state: Completed, Current step or Not started. The current step carries aria-current=step.",
      "A finished step is a button (or a link, with href) when it can be revisited. Enter or a press revisits it, and focus stays on that step once it becomes current.",
      "The numbers and the check are decoration: the list gives the position, the words give the state.",
    ],
    Layout: [
      "horizontal puts the steps in a row with a line between them, and stacks them under 640px of its own width, never the window's.",
      "Stacked, the line runs down from each circle to the next. Long labels wrap; nothing is cut short.",
    ],
    States: ["In forced colours the circles and lines are borders, so they stay, and the current ring takes Highlight."],
    Rules: [
      "Five steps at most, one decision each. Each label is the outcome (Connect [source]).",
      "Finished steps can be revisited. Steps not started cannot be jumped to; a safe step is skipped from inside it.",
    ],
    Review: ["Targets came in short across the rounds (section 2.5): revisitable steps are measured, 24px on a desktop and 40px on touch."],
  },
  examples: [
    {
      id: "horizontal",
      title: "In a row, with finished steps to revisit",
      layout: "block",
      markup: `<div data-current="{{setupStep}}" style="display: contents;"><x-import component-from-global-scope="NS.Stepper" label="Setup progress" steps="{{setup}}" current="{{setupStep}}" on-step-click="{{goToStep}}"></x-import></div>`,
      vals: { setup: SETUP },
    },
    {
      id: "vertical",
      title: "Stacked, with descriptions",
      layout: "block",
      width: 420,
      markup: `<x-import component-from-global-scope="NS.Stepper" label="Payroll setup" orientation="vertical" steps="{{payroll}}" current="{{one}}"></x-import>`,
      vals: {
        one: 1,
        payroll: [
          { label: "Add [your business] details", description: "Name, address and tax number", href: "#business-details" },
          { label: "Connect [the bank feed]", description: "We read balances and never move money" },
          { label: "Invite [your team]", description: "They get an email to set a password" },
        ],
      },
    },
    {
      id: "narrow",
      title: "A row in a narrow space stacks",
      layout: "block",
      width: 320,
      markup: `<x-import component-from-global-scope="NS.Stepper" label="Setup progress, narrow" steps="{{setup}}" current="{{two}}"></x-import>`,
      vals: { two: 2 },
    },
    {
      id: "done",
      title: "Every step finished, inside a flex row",
      layout: "row",
      markup: `<x-import component-from-global-scope="NS.Stepper" label="Setup progress, finished" steps="{{setup}}" current="{{four}}"></x-import>`,
      vals: { four: 4 },
    },
  ],
  frame: { width: 960, height: 760 },
  state: { setupStep: 2 },
  logic: "setupStep: self.state.setupStep, goToStep: (i) => self.setState({ setupStep: i })",
  checks: [
    {
      name: "Each label is read with its state",
      example: "horizontal",
      async run({ scope, expect }) {
        const texts = (await scope.locator('[data-slot="stepper-label"]').allTextContents()).map((t) => t.replace(/\s+/g, " ").trim())
        expect.equal(texts.join(" | "), "Connect [accounting system], Completed | Invite [your team], Completed | Choose approvers, Current step | Send a test invoice, Not started", "labels with their states")
        expect.equal(await scope.locator('[data-slot="stepper-indicator"][aria-hidden="true"]').count(), 4, "numbers and checks are decoration")
      },
    },
    {
      name: "The current step carries aria-current=step",
      example: "horizontal",
      async run({ scope, expect }) {
        const current = scope.locator('li[aria-current="step"]')
        expect.equal(await current.count(), 1, "one current step")
        expect((await current.textContent()).includes("Choose approvers"), "it is Choose approvers")
      },
    },
    {
      name: "Finished steps take a check, the current step a ring, in both themes",
      example: "horizontal",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const ind = scope.locator('[data-slot="stepper-indicator"]')
        expect.equal(await ind.nth(0).locator('svg[data-icon="Check"]').count(), 1, "a check on a finished step")
        const ring = await ind.nth(2).evaluate((el) => ({ width: getComputedStyle(el).borderTopWidth, colour: getComputedStyle(el).borderTopColor }))
        expect.equal(ring.width, "2px", "the current ring is 2px")
        expect.equal(ring.colour, await colourOf(page, "primary"), "in the primary colour")
        const later = await ind.nth(3).evaluate((el) => ({ width: getComputedStyle(el).borderTopWidth, colour: getComputedStyle(el).borderTopColor }))
        expect.equal(later.width, "1px", "a hairline on a step not started")
        expect.equal(later.colour, await colourOf(page, "line-control"), "in the control line colour")
      },
    },
    {
      name: "A finished step is revisited from the keyboard, and focus stays on it",
      example: "horizontal",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const first = scope.getByRole("button", { name: /^Connect \[accounting system\] ?, Completed$/ })
        expect(await first.evaluate((el) => document.activeElement === el), "Tab reaches the first finished step")
        const ax = await heard(page, first)
        expect(/^button: Connect \[accounting system\] ?, Completed$/.test(`${ax.role}: ${ax.name}`), `what a screen reader hears: got "${ax.role}: ${ax.name}"`)
        await page.keyboard.press("Enter")
        await page.waitForFunction(() => document.querySelector('[data-example="horizontal"] [data-current]')?.getAttribute("data-current") === "0", null, { timeout: 3000 })
        const focus = await page.evaluate(() => ({ body: document.activeElement === document.body, inCurrent: !!document.activeElement?.closest('li[aria-current="step"]') }))
        expect(!focus.body, "focus is not on the page body")
        expect(focus.inCurrent, "focus is on the step that is now current")
        expect.equal(await scope.getByRole("button").count(), 0, "no step is pressable once the first is current")
      },
    },
    {
      name: "A finished step with an address is a link, named with its state and described by its description",
      example: "vertical",
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link")
        expect.equal(await link.count(), 1, "the finished step is the one link")
        expect.equal(await link.getAttribute("href"), "#business-details", "it goes to the step's address")
        const ax = await heard(page, link)
        // A visually hidden part of a name can arrive with a space before it: "details , Completed" sounds the same.
        expect(/^link: Add \[your business\] details ?, Completed$/.test(`${ax.role}: ${ax.name}`), `its name: got "${ax.role}: ${ax.name}"`)
        expect.equal(ax.description, "Name, address and tax number", "its description")
      },
    },
    {
      name: "In a row from 640px, stacked below it",
      async run({ page, expect }) {
        const row = await Promise.all((await page.locator('[data-example="horizontal"] li').all()).map((li) => li.boundingBox()))
        expect.equal(new Set(row.map((b) => Math.round(b.y))).size, 1, "the wide one is one row")
        const stack = await Promise.all((await page.locator('[data-example="narrow"] li').all()).map((li) => li.boundingBox()))
        expect.equal(new Set(stack.map((b) => Math.round(b.x))).size, 1, "the narrow one lines up on the left")
        for (let i = 1; i < stack.length; i++) expect(stack[i].y > stack[i - 1].y, "and runs downwards")
      },
    },
    {
      name: "Revisitable steps are at least 24px tall, and 40px on touch",
      example: "horizontal",
      touch: true,
      async run({ scope, expect }) {
        for (const b of await scope.getByRole("button").all()) expect.atLeast(Math.round((await b.boundingBox()).height), 40, "touch target height")
      },
    },
    {
      name: "Revisitable steps are at least 24px tall on a desktop",
      example: "horizontal",
      async run({ scope, expect }) {
        for (const b of await scope.getByRole("button").all()) expect.atLeast(Math.round((await b.boundingBox()).height), 24, "target height")
      },
    },
    {
      name: "Focus shows the system's outline in the focus colour, in both themes",
      example: "horizontal",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const o = await scope.getByRole("button").first().evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth, color: getComputedStyle(el).outlineColor }))
        expect.equal(o.style, "solid", "outline style")
        expect.equal(o.width, "2px", "outline width")
        expect.equal(o.color, await colourOf(page, "focus"), "outline colour")
      },
    },
    {
      name: "In forced colours the ring and the lines stay, drawn as borders",
      example: "horizontal",
      forcedColors: true,
      async run({ scope, expect }) {
        const ring = await scope.locator('[data-slot="stepper-indicator"]').nth(2).evaluate((el) => ({ style: getComputedStyle(el).borderTopStyle, width: getComputedStyle(el).borderTopWidth }))
        expect.equal(`${ring.style} ${ring.width}`, "solid 2px", "the current ring")
        for (const line of await scope.locator('[data-slot="stepper-connector"]:visible').all()) {
          expect.equal(await line.evaluate((el) => getComputedStyle(el).borderTopStyle), "solid", "each line between steps")
        }
      },
    },
    {
      name: "When every step is finished, every label says Completed",
      example: "done",
      async run({ scope, expect }) {
        const texts = await scope.locator('[data-slot="stepper-label"]').allTextContents()
        expect(texts.every((t) => t.includes("Completed")), "all completed")
        expect.equal(await scope.locator('li[aria-current="step"]').count(), 0, "nothing is current")
        // It measures its own width, so it must not shrink to nothing as an item in a flex row.
        const row = await scope.locator('[data-slot="stepper"]').evaluate((el) => ({ width: el.getBoundingClientRect().width, parent: el.parentElement.closest("div:not([data-x-import])").getBoundingClientRect().width }))
        expect.equal(Math.round(row.width), Math.round(row.parent), "it fills the row it sits in")
      },
    },
  ],
}
