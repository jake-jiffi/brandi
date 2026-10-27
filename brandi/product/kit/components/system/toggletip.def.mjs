// Toggletip's one definition: its README, its preview board and its scripted checks all come from here.

async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}
// The bubble a person opened, in its portal: not the one the design example shows open in place.
const floating = (page) => page.locator('[data-slot="popover-content"]:not([data-example] *)')

const DEFINITION = "Paid invoices less refunds and credit notes, before GST."

const term = (word, tip) =>
  `<div style="display: flex; align-items: center; gap: 4px; font: 500 14px/20px var(--font-sans); color: var(--text-muted);"><span>${word}</span>${tip}</div>`

export default {
  name: "Toggletip",
  group: "Status",
  job: "A definition behind an info button, opened by a press, a tap or Enter, and read out when it opens.",
  status: "to build",
  props: [
    { name: "label", type: "string", doc: 'The info button\'s name, saying what it explains: "About [net revenue]".' },
    { name: "content", type: "ReactNode", doc: "The definition: a sentence or two, never anything to press. A Popover holds controls." },
    { name: "placement", type: '"top" | "bottom" | "right" | "left"', default: '"top"', doc: "Where it opens. It flips to stay on screen." },
    { name: "open", type: "boolean", doc: "Design mode: shows it open, in place, for a board." },
    { name: "icon", type: "IconName", default: '"Info"', doc: "The button's icon." },
  ],
  notes: {
    Behaviour: [
      "Hover shows it after 150ms, and moving away hides it, unless it was pressed open.",
      "A press, a tap, Enter or Space opens it and reads it out through a polite status beside the button. Focus stays on the button, which says it is expanded. Pressing again closes it.",
      "Escape or a press elsewhere closes it. Tab away closes it too.",
      "It opens in a portal, flipping to stay on screen. Shown open for a design, it is a still picture that takes no key, press or tab stop from the board.",
    ],
    Layout: ["The button is 24px, and its hit area grows to 40px on a touch screen without moving the words beside it."],
    States: [
      "Closed, open from hover, open from a press, and open in place for a design. It fades in and goes at once, so it never holds the next Escape on its way out. Reduced motion keeps the fade and drops the zoom.",
    ],
    Copy: ['The button names the term: "About net revenue", never "Info" or "Help". The definition says what is counted and what is left out.'],
    Rules: [
      "For a definition people may need on a touch screen. A label for a control is a Tooltip.",
      "Nothing to press inside. A filter or an edit is a Popover.",
    ],
    Review: ["MetricCard's hint could not be opened on touch (round 4): a tap opens this one, and the button is 40px on touch."],
  },
  examples: [
    {
      id: "beside-a-term",
      title: "Beside the term it explains",
      markup: term("Net revenue", `<x-import component-from-global-scope="NS.Toggletip" label="About net revenue" content="${DEFINITION}"></x-import>`),
    },
    {
      id: "design",
      title: "Open in place, for a design",
      markup: `<div style="padding-top: 56px;">${term("Overdue invoices", `<x-import component-from-global-scope="NS.Toggletip" label="About overdue invoices" content="Unpaid 30 days or more after the due date." open="{{yes}}"></x-import>`)}</div>`,
      vals: { yes: true },
    },
  ],
  frame: { width: 960, height: 320 },
  checks: [
    {
      name: "Enter opens it and reads it out, and focus stays on the button",
      example: "beside-a-term",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "About net revenue" })
        expect(await tabTo(page, button), "Tab reaches the info button")
        await page.keyboard.press("Enter")
        const bubble = floating(page)
        await bubble.waitFor({ state: "visible", timeout: 2000 })
        expect.equal((await bubble.innerText()).trim(), DEFINITION, "the definition shows")
        expect.equal((await scope.getByRole("status").textContent()).trim(), DEFINITION, "the polite status reads it out")
        expect.equal(await button.getAttribute("aria-expanded"), "true", "the button says it is expanded")
        expect(await button.evaluate((el) => document.activeElement === el), "focus stays on the button")
      },
    },
    {
      name: "Escape closes it, the status falls quiet, focus stays on the button, and the next Escape reaches the page",
      example: "beside-a-term",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__escapes = 0
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented) window.__escapes++ })
        })
        const button = scope.getByRole("button", { name: "About net revenue" })
        expect(await tabTo(page, button), "Tab reaches the info button")
        await page.keyboard.press("Space")
        const bubble = floating(page)
        await bubble.waitFor({ state: "visible", timeout: 2000 })
        await page.keyboard.press("Escape")
        await page.keyboard.press("Escape")
        await bubble.waitFor({ state: "hidden", timeout: 2000 })
        expect.equal((await scope.getByRole("status").textContent()).trim(), "", "the status is empty again")
        expect(await button.evaluate((el) => document.activeElement === el), "focus stays on the button")
        expect.equal(await page.evaluate(() => window.__escapes), 1, "the first Escape closed it, and the second reached the page at once")
      },
    },
    {
      name: "A press opens it, a second press closes it, and a press elsewhere closes it",
      example: "beside-a-term",
      async run({ page, scope }) {
        const button = scope.getByRole("button", { name: "About net revenue" })
        const bubble = floating(page)
        await button.click()
        await bubble.waitFor({ state: "visible", timeout: 2000 })
        await button.click()
        await bubble.waitFor({ state: "hidden", timeout: 2000 })
        await button.click()
        await bubble.waitFor({ state: "visible", timeout: 2000 })
        // A person's pace: Radix starts listening for a press elsewhere just after it opens.
        await page.waitForTimeout(150)
        await page.mouse.click(900, 300)
        await bubble.waitFor({ state: "hidden", timeout: 2000 })
      },
    },
    {
      name: "Hover shows it after a short delay, and moving away hides it",
      example: "beside-a-term",
      async run({ page, scope, expect }) {
        const bubble = floating(page)
        await scope.getByRole("button", { name: "About net revenue" }).hover()
        expect(!(await bubble.isVisible()), "not at once")
        await bubble.waitFor({ state: "visible", timeout: 2000 })
        expect.equal((await scope.getByRole("status").textContent()).trim(), "", "hover does not read it out")
        await page.mouse.move(900, 300, { steps: 4 })
        await bubble.waitFor({ state: "hidden", timeout: 2000 })
      },
    },
    {
      name: "A tap opens it on a touch screen, where the button is 40px",
      example: "beside-a-term",
      touch: true,
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "About net revenue" })
        const box = await button.boundingBox()
        expect.atLeast(Math.round(box.width), 40, "touch width")
        expect.atLeast(Math.round(box.height), 40, "touch height")
        await button.tap()
        await floating(page).waitFor({ state: "visible", timeout: 2000 })
      },
    },
    {
      name: "Forced colours give the definition an edge",
      example: "design",
      forcedColors: true,
      async run({ scope, expect }) {
        const edge = await scope.locator('[data-slot="popover-content"]').evaluate((el) => `${getComputedStyle(el).borderTopStyle} ${getComputedStyle(el).borderTopColor}`)
        expect(edge.startsWith("solid") && !edge.includes("rgba(0, 0, 0, 0)"), `the edge is drawn (${edge})`)
      },
    },
    {
      name: "Open in place for a design, taking no focus, no key and no tab stop from the page",
      example: "design",
      async run({ page, scope, expect }) {
        expect(await scope.locator('[data-slot="popover-content"]').isVisible(), "the definition shows without anyone pressing")
        expect(await page.evaluate(() => document.activeElement === document.body), "nothing took focus")
        await page.evaluate(() => {
          window.__escapes = 0
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented) window.__escapes++ })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escapes), 1, "Escape reaches the page past the picture")
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "About net revenue", "the first Tab lands on a real control, not a hidden guard")
      },
    },
  ],
}
