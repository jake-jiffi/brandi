// Popover's one definition: its README, its preview board and its scripted checks all come from here.

async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}
// Whether focus is in the open panel. Asked of the page, so it answers at once after the panel has gone.
const inside = (page) => page.evaluate(() => Boolean(document.activeElement?.closest('[data-slot="popover-content"]:not([data-example] *)')))

const option = (word, checked) =>
  `<label style="display: flex; align-items: center; gap: 8px; min-height: 32px; font: 400 14px/20px var(--font-sans); color: var(--text);"><input type="checkbox"${checked ? " checked" : ""} style="width: 16px; height: 16px; margin: 0; accent-color: var(--primary);">${word}</label>`

export default {
  name: "Popover",
  group: "Overlays",
  job: "A non-modal panel anchored to a control: a definition, a quick filter, a short edit.",
  status: "to build",
  props: [
    { name: "label", type: "string", doc: "The trigger's words, and the panel's name when it has no title." },
    { name: "icon", type: "IconName", doc: "An icon before the trigger's words." },
    { name: "variant", type: '"secondary" | "ghost"', default: '"secondary"', doc: "The trigger's look." },
    { name: "title", type: "string", doc: "A title at the top of the panel, which also names it." },
    { name: "children", type: "ReactNode | (close) => ReactNode", doc: "The panel. A function gets close, for a Save that closes it." },
    { name: "placement", type: '"bottom" | "top" | "right" | "left"', default: '"bottom"', doc: "Where it opens. It flips to stay on screen." },
    { name: "align", type: '"start" | "center" | "end"', default: '"start"', doc: "Which edge of the trigger it lines up with." },
    { name: "open", type: "boolean", doc: "Design mode: shows it open, in place, for a board, without taking focus." },
    { name: "trigger", type: "ReactElement", doc: "A control of your own to open it, in place of the Button. It must take a ref. Built in script on a board." },
    { name: "onOpenChange", type: "(open: boolean) => void", doc: "Called when it opens or closes." },
  ],
  notes: {
    Behaviour: [
      "Enter, Space or a press on the trigger opens it, and focus moves to the first control in the panel.",
      "It traps nothing. In the tab order it sits right after its trigger, though it opens in a portal: Tab from an open trigger goes into the panel, Tab from the end of the panel goes on to whatever follows the trigger and closes it, and Shift Tab from the start goes back to the trigger.",
      "Escape closes it and focus goes back to the trigger. A press elsewhere closes it and leaves focus where the press put it.",
      "A dialog named by its title, or by the trigger's words. It opens in a portal, flipping to stay on screen.",
      "Shown open for a design, it is a still picture under its trigger: it mounts no layer, so it takes no key, press or tab stop from the board.",
    ],
    States: [
      "Closed, open, and open in place for a design. It fades in and goes at once, so a panel on its way out never holds the next Escape. Reduced motion keeps the fade and drops the zoom. Forced colours keep its edge.",
    ],
    Copy: ["The trigger names what the panel holds (Status, Rename), and the title says what it does (Filter by status, Rename view)."],
    Rules: [
      "For a short task beside its control. Anything longer, or anything that must be finished before going on, is a Dialog or a Sheet.",
      "A definition and nothing else is a Toggletip.",
      "One popover open at a time. A Save inside closes it, through the close function.",
    ],
  },
  examples: [
    {
      id: "filter",
      title: "A quick filter, then the next control",
      markup: `<x-import component-from-global-scope="NS.Popover" label="Status" icon="ListFilter" title="Filter by status"><div style="display: flex; flex-direction: column; gap: 4px;">${option("Overdue", true)}${option("Due soon", true)}${option("Paid", false)}</div><div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px;"><x-import component-from-global-scope="NS.Button" size="sm">Clear</x-import><x-import component-from-global-scope="NS.Button" size="sm" variant="primary">Apply</x-import></div></x-import>
<x-import component-from-global-scope="NS.Button" icon="Download">Export</x-import>`,
    },
    {
      id: "edit",
      title: "A short edit, open in place for a design",
      markup: `<div style="padding-bottom: 210px;"><x-import component-from-global-scope="NS.Popover" label="Rename" icon="Pencil" title="Rename view" open="{{yes}}"><label style="display: flex; flex-direction: column; gap: 6px; font: 400 13px/18px var(--font-sans); color: var(--text-muted);">View name<input value="[Overdue this week]" style="box-sizing: border-box; height: 36px; padding: 0 12px; border: 1px solid var(--line-control); border-radius: var(--radius-control); background: var(--surface); color: var(--text); font: 400 14px/20px var(--font-sans);"></label><div style="display: flex; justify-content: flex-end; gap: 8px;"><x-import component-from-global-scope="NS.Button">Cancel</x-import><x-import component-from-global-scope="NS.Button" variant="primary">Save</x-import></div></x-import></div>`,
      vals: { yes: true },
    },
  ],
  frame: { width: 960, height: 520 },
  checks: [
    {
      name: "Enter opens it, and focus moves into the named panel",
      example: "filter",
      async run({ page, scope, expect }) {
        const trigger = scope.getByRole("button", { name: "Status" })
        expect(await tabTo(page, trigger), "Tab reaches the trigger")
        await page.keyboard.press("Enter")
        const panel = page.getByRole("dialog", { name: "Filter by status" })
        await panel.waitFor({ state: "visible", timeout: 2000 })
        expect.equal(await trigger.getAttribute("aria-expanded"), "true", "the trigger says it is open")
        expect(await inside(page), "focus moved into the panel")
      },
    },
    {
      name: "It traps nothing: Tab from the end of the panel goes on to what follows the trigger, and the panel closes",
      example: "filter",
      async run({ page, scope, expect }) {
        expect(await tabTo(page, scope.getByRole("button", { name: "Status" })), "Tab reaches the trigger")
        await page.keyboard.press("Enter")
        const panel = page.getByRole("dialog", { name: "Filter by status" })
        await panel.waitFor({ state: "visible", timeout: 2000 })
        let presses = 0
        while ((await inside(page)) && presses < 10) {
          await page.keyboard.press("Tab")
          presses++
        }
        expect.equal(presses, 5, "Tab walks the panel's five controls, then leaves")
        expect(await scope.getByRole("button", { name: "Export" }).evaluate((el) => document.activeElement === el), "focus went on to Export, the control after the trigger")
        await panel.waitFor({ state: "hidden", timeout: 2000 })
      },
    },
    {
      name: "Shift Tab from the start of the panel goes back to the trigger, and Tab goes back in",
      example: "filter",
      async run({ page, scope, expect }) {
        const trigger = scope.getByRole("button", { name: "Status" })
        expect(await tabTo(page, trigger), "Tab reaches the trigger")
        await page.keyboard.press("Enter")
        const panel = page.getByRole("dialog", { name: "Filter by status" })
        await panel.waitFor({ state: "visible", timeout: 2000 })
        await page.keyboard.press("Shift+Tab")
        expect(await trigger.evaluate((el) => document.activeElement === el), "focus is back on the trigger")
        expect(await panel.isVisible(), "the panel stays open")
        await page.keyboard.press("Tab")
        expect(await inside(page), "Tab from the open trigger goes into the panel")
      },
    },
    {
      name: "Escape closes it, focus goes back to the trigger, and the next Escape goes to the layer below",
      example: "filter",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__escapes = 0
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented) window.__escapes++ })
        })
        const trigger = scope.getByRole("button", { name: "Status" })
        expect(await tabTo(page, trigger), "Tab reaches the trigger")
        await page.keyboard.press("Space")
        const panel = page.getByRole("dialog", { name: "Filter by status" })
        await panel.waitFor({ state: "visible", timeout: 2000 })
        await page.keyboard.press("Tab")
        await page.keyboard.press("Escape")
        await page.keyboard.press("Escape")
        await panel.waitFor({ state: "hidden", timeout: 2000 })
        expect(await trigger.evaluate((el) => document.activeElement === el), "focus is back on the trigger")
        expect.equal(await page.evaluate(() => window.__escapes), 1, "the first Escape closed the panel, and the second reached the page at once")
      },
    },
    {
      name: "A press elsewhere closes it",
      example: "filter",
      async run({ page, scope }) {
        await scope.getByRole("button", { name: "Status" }).click()
        const panel = page.getByRole("dialog", { name: "Filter by status" })
        await panel.waitFor({ state: "visible", timeout: 2000 })
        // A person's pace: Radix starts listening for a press elsewhere just after it opens.
        await page.waitForTimeout(150)
        await page.mouse.click(900, 480)
        await panel.waitFor({ state: "hidden", timeout: 2000 })
      },
    },
    {
      name: "Open in place for a design, named, taking no focus, no key and no tab stop from the page",
      example: "edit",
      async run({ page, scope, expect }) {
        const panel = scope.getByRole("dialog", { name: "Rename view" })
        expect(await panel.isVisible(), "the panel shows without anyone pressing")
        expect.equal(await scope.getByRole("button", { name: "Rename" }).getAttribute("aria-expanded"), "true", "its trigger says it is open")
        expect(await page.evaluate(() => document.activeElement === document.body), "nothing took focus")
        await page.evaluate(() => {
          window.__escapes = 0
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented) window.__escapes++ })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escapes), 1, "Escape reaches the page past the picture")
        await page.keyboard.press("Tab")
        expect(await page.getByRole("button", { name: "Status" }).evaluate((el) => document.activeElement === el), "the first Tab lands on the first real control, not a hidden guard")
      },
    },
    {
      name: "The trigger grows to 44px on a touch screen",
      example: "filter",
      touch: true,
      async run({ scope, expect }) {
        const box = await scope.getByRole("button", { name: "Status" }).boundingBox()
        expect.atLeast(Math.round(box.height), 44, "touch height")
      },
    },
    {
      name: "Forced colours keep the panel's edge",
      example: "edit",
      forcedColors: true,
      async run({ scope, expect }) {
        const edge = await scope.locator('[data-slot="popover-content"]').evaluate((el) => `${getComputedStyle(el).borderTopStyle} ${getComputedStyle(el).borderTopWidth}`)
        expect.equal(edge, "solid 1px", "the panel keeps its edge")
      },
    },
  ],
}
