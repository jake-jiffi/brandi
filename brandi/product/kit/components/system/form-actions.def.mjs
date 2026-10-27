// FormActions' one definition. The board builds the destructive Button in its own script, through
// the bundle's namespace, which it finds on the page.
const button = (label, variant) =>
  `<x-import component-from-global-scope="NS.Button"${variant ? ` variant="${variant}"` : ""}>${label}</x-import>`

const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement)

export default {
  name: "FormActions",
  group: "Forms",
  job: "The row that ends a form: Cancel, then the one primary, above a hairline.",
  status: "proven",
  props: [
    { name: "align", type: '"end" | "start"', default: '"end"', doc: "Right-aligned by default; start for narrow forms." },
    { name: "destructive", type: "ReactNode", doc: "A destructive action, a danger Button, kept apart at the other end of the row." },
    { name: "children", type: "ReactNode", doc: "Cancel, then the one primary." },
  ],
  notes: {
    Behaviour: ["The tab order follows the screen: the destructive action first when it sits on the left."],
    Layout: ["Buttons wrap rather than overflow a narrow form, and the destructive action keeps its end."],
    Rules: [
      "Cancel immediately left of the one primary, right-aligned above a hairline.",
      "A destructive action sits apart, on the left, as a danger button.",
      'The primary names the result ("Save billing"), never "Submit".',
    ],
  },
  frame: { width: 960, height: 420 },
  logic: `els: (() => {
  for (const key of Object.keys(window)) {
    try {
      const ns = window[key]
      if (ns && typeof ns.Root === "function" && ns.Button) return { remove: window.React.createElement(ns.Button, { variant: "danger" }, "Delete client") }
    } catch (e) {}
  }
  return {}
})()`,
  examples: [
    {
      id: "end",
      title: "Cancel, then the primary",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.FormActions">${button("Cancel")}${button("Save billing", "primary")}</x-import>`,
    },
    {
      id: "destructive",
      title: "With a destructive action",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.FormActions" destructive="{{els.remove}}">${button("Cancel")}${button("Save client", "primary")}</x-import>`,
    },
    {
      id: "start",
      title: "Start, for a narrow form",
      layout: "block",
      markup: `<div class="max-w-sm"><x-import component-from-global-scope="NS.FormActions" align="start">${button("Back")}${button("Continue", "primary")}</x-import></div>`,
    },
  ],
  checks: [
    {
      name: "The primary ends the row, with Cancel immediately left of it",
      example: "end",
      async run({ scope, expect }) {
        const row = await scope.locator('[data-slot="form-actions"]').boundingBox()
        const cancel = await scope.getByRole("button", { name: "Cancel" }).boundingBox()
        const save = await scope.getByRole("button", { name: "Save billing" }).boundingBox()
        expect(Math.abs(save.x + save.width - (row.x + row.width)) < 1, "the primary at the right edge")
        expect(cancel.x + cancel.width < save.x, "Cancel before the primary")
        expect.atLeast(Math.round(save.x - (cancel.x + cancel.width)), 8, "space between the two")
      },
    },
    {
      name: "A destructive action sits apart on the left, first in the tab order",
      example: "destructive",
      async run({ page, scope, expect }) {
        const row = await scope.locator('[data-slot="form-actions"]').boundingBox()
        const remove = scope.getByRole("button", { name: "Delete client" })
        expect(Math.abs((await remove.boundingBox()).x - row.x) < 1, "the destructive action at the left edge")
        await remove.focus()
        await page.keyboard.press("Tab")
        expect(await isFocused(scope.getByRole("button", { name: "Cancel" })), "Tab moves on to Cancel")
        await page.keyboard.press("Tab")
        expect(await isFocused(scope.getByRole("button", { name: "Save client" })), "then to the primary")
      },
    },
    {
      name: "A hairline sits above the row, in both themes",
      example: "end",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const [width, same] = await scope.locator('[data-slot="form-actions"]').evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.borderColor = "var(--line)"
          el.append(probe)
          const out = [getComputedStyle(el).borderTopWidth, getComputedStyle(el).borderTopColor === getComputedStyle(probe).borderTopColor]
          probe.remove()
          return out
        })
        expect.equal(width, "1px", "the hairline's width")
        expect(same, "the hairline is the line role")
      },
    },
    {
      name: "Start alignment puts the buttons at the left edge",
      example: "start",
      async run({ scope, expect }) {
        const row = await scope.locator('[data-slot="form-actions"]').boundingBox()
        const back = await scope.getByRole("button", { name: "Back" }).boundingBox()
        expect(Math.abs(back.x - row.x) < 1, "the first button at the left edge")
      },
    },
  ],
}
