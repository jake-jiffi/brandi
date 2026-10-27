// FileDrop's one definition: its README, its preview board and its scripted checks all come from here.

// Runs in the page: drop files on a zone, as a browser does when someone lets go of them over it.
function drop(zone, files) {
  const data = new DataTransfer()
  for (const [name, type] of files) data.items.add(new File(["sample"], name, { type }))
  for (const kind of ["dragenter", "dragover", "drop"]) zone.dispatchEvent(new DragEvent(kind, { bubbles: true, cancelable: true, dataTransfer: data }))
}

export default {
  name: "FileDrop",
  group: "Inputs",
  job: "A drop zone with a real button, so keyboard, screen-reader and touch users never depend on dragging.",
  status: "proven",
  props: [
    { name: "title", type: "ReactNode", doc: "What to drop, and where it goes: Drop the [bank statements] here." },
    { name: "description", type: "ReactNode", doc: "The rule in words: CSV or XLSX, up to 20 MB." },
    { name: "browseLabel", type: "string", default: '"Choose files"', doc: "The real button's label. Choose a file when multiple is off." },
    { name: "accept", type: "string", doc: "The types it takes, as an input's accept: .csv,.xlsx or image/*. Checked on a drop as well as on choosing." },
    { name: "multiple", type: "boolean", default: "false", doc: "Takes several files at once." },
    { name: "error", type: "ReactNode", doc: "What went wrong and how to fix it: a file too big, an upload that failed. Announced when it appears." },
    { name: "onFiles", type: "(files: File[]) => void", doc: "The files that passed the type and count check." },
    { name: "dragOver", type: "boolean", default: "false", doc: "Design mode: draws the zone as a file is dragged over it, for a board." },
  ],
  notes: {
    Behaviour: [
      "The button opens the file picker, from a press, Enter or Space. The zone takes a drop as well.",
      "A screen reader hears the button's label, then the title, the rule and any error.",
      "A wrong type, or several files where it takes one, is turned away with the reason and the fix. The error is announced through a polite live region that is there from the start.",
    ],
    Layout: ["A row from 520px of its own width: icon, words, then the button. Below that it stacks and centres."],
    States: ["At rest a dashed line-control edge. Dragged over, a solid primary edge on the selected tint; forced colours keep the solid edge. An error turns the edge danger and shows under the rule."],
    Copy: ["The title says what to drop. The description gives the rule in words. Errors name the file, the reason and the fix: [march].pdf is the wrong type. Choose CSV or XLSX."],
    Rules: [
      "After a drop, list each file with its progress and a way to remove it (the file list is to build, 05-components.md section 4).",
      "Reject a wrong file with the reason and the fix, never silently. Size limits are the product's to check, through error.",
    ],
    Accepted: ["browseLabel says Choose a file when multiple is off, where the reference always said Choose files: one file is what the button does."],
  },
  examples: [
    {
      id: "basics",
      title: "Several files, and one",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; width: 100%;">
<x-import component-from-global-scope="NS.FileDrop" title="Drop the [bank statements] here" description="CSV or XLSX, up to 20 MB each" accept=".csv,.xlsx" multiple="{{yes}}" on-files="{{addStatements}}"></x-import>
<p data-added="" style="margin: 0; font-family: var(--font-sans); font-size: 13px; line-height: 18px; color: var(--text-muted);">{{added}}</p>
<x-import component-from-global-scope="NS.FileDrop" title="Drop the signed [contract] here" description="PDF, up to 10 MB" accept=".pdf"></x-import>
</div>`,
      vals: { yes: true },
    },
    {
      id: "states",
      title: "Dragged over, an error, and narrow",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px 24px; width: 100%;">
<div style="display: grid; gap: 16px;">
<x-import component-from-global-scope="NS.FileDrop" title="Drop the [bank statements] here" description="CSV or XLSX, up to 20 MB each" accept=".csv,.xlsx" multiple="{{yes}}" drag-over="{{yes}}"></x-import>
<x-import component-from-global-scope="NS.FileDrop" title="Drop the [bank statements] here" description="CSV or XLSX, up to 20 MB each" accept=".csv,.xlsx" multiple="{{yes}}" error="[march-statement].csv is 24 MB. Split it by month, or export it without attachments."></x-import>
</div>
<x-import component-from-global-scope="NS.FileDrop" title="Drop a [receipt] here" description="JPG, PNG or PDF" accept="image/jpeg,image/png,.pdf" browse-label="Choose a receipt"></x-import>
</div>`,
    },
  ],
  state: { added: "No statements added yet." },
  logic: 'added: self.state.added, addStatements: (files) => self.setState({ added: "Added " + files.map((f) => f.name).join(", ") })',
  frame: { width: 960, height: 600 },
  checks: [
    {
      name: "The button opens the file picker from the keyboard",
      example: "basics",
      async run({ page, expect }) {
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => document.activeElement.textContent.trim()), "Choose files", "Tab reached the button")
        const [chooser] = await Promise.all([page.waitForEvent("filechooser", { timeout: 10000 }), page.keyboard.press("Enter")])
        expect(chooser.isMultiple(), "the picker takes several files")
      },
    },
    {
      name: "A file of the right type reaches onFiles",
      example: "basics",
      async run({ scope, expect }) {
        await scope.locator('[data-slot="file-drop"]').first().evaluate(drop, [["march.csv", "text/csv"]])
        expect.equal((await scope.locator("[data-added]").textContent()).trim(), "Added march.csv", "the board heard the file")
        expect.equal(await scope.locator('[data-slot="field-error"]').count(), 0, "no error")
      },
    },
    {
      name: "A wrong file is turned away with the reason and the fix, read with the button and announced",
      example: "basics",
      async run({ scope, expect }) {
        const zone = scope.locator('[data-slot="file-drop"]').first()
        const region = zone.locator('[data-slot="field-message"]')
        expect.equal(await region.getAttribute("aria-live"), "polite", "a polite live region is there before any error")
        await zone.evaluate(drop, [["statement.pdf", "application/pdf"]])
        expect.equal((await region.textContent()).trim(), "statement.pdf is the wrong type. Choose CSV or XLSX.", "the reason and the fix")
        expect.equal((await scope.locator("[data-added]").textContent()).trim(), "No statements added yet.", "the wrong file went nowhere")
        const read = await zone.getByRole("button").evaluate((el) => el.getAttribute("aria-describedby").split(" ").map((id) => document.getElementById(id)?.textContent.trim()).join(" | "))
        expect.equal(read, "Drop the [bank statements] here | CSV or XLSX, up to 20 MB each | statement.pdf is the wrong type. Choose CSV or XLSX.", "the button is read with the title, the rule and the error")
      },
    },
    {
      name: "Several files on a zone that takes one are turned away, saying to drop one",
      example: "basics",
      async run({ scope, expect }) {
        const zone = scope.locator('[data-slot="file-drop"]').nth(1)
        await zone.evaluate(drop, [["one.pdf", "application/pdf"], ["two.pdf", "application/pdf"]])
        expect.equal((await zone.locator('[data-slot="field-error"]').textContent()).trim(), "This takes one file at a time. Drop or choose one.", "says to drop one")
        expect.equal((await zone.getByRole("button").textContent()).trim(), "Choose a file", "the one-file button says a file")
      },
    },
    {
      name: "Dragging files over shows a solid edge, and leaving clears it",
      example: "basics",
      async run({ scope, expect }) {
        const zone = scope.locator('[data-slot="file-drop"]').first()
        expect.equal(await zone.evaluate((el) => getComputedStyle(el).borderTopStyle), "dashed", "dashed at rest")
        await zone.evaluate((el) => {
          const data = new DataTransfer()
          data.items.add(new File(["x"], "march.csv", { type: "text/csv" }))
          el.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: data }))
        })
        expect.equal(await zone.evaluate((el) => getComputedStyle(el).borderTopStyle), "solid", "solid while files are over it")
        await zone.evaluate((el) => el.dispatchEvent(new DragEvent("dragleave", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() })))
        expect.equal(await zone.evaluate((el) => getComputedStyle(el).borderTopStyle), "dashed", "dashed again when they leave")
      },
    },
    {
      name: "Forced colours keep the dragged-over edge apart from the resting one",
      example: "states",
      forcedColors: true,
      async run({ scope, expect }) {
        const [over, error] = await scope.locator('[data-slot="file-drop"]').evaluateAll((els) => els.slice(0, 2).map((el) => getComputedStyle(el).borderTopStyle))
        expect.equal(`${over} ${error}`, "solid dashed", "solid while dragged over, dashed otherwise")
      },
    },
    {
      name: "A product's error is read with the button, with an icon",
      example: "states",
      async run({ scope, expect }) {
        const zone = scope.locator('[data-slot="file-drop"]').nth(1)
        const read = await zone.getByRole("button").evaluate((el) => document.getElementById(el.getAttribute("aria-describedby").split(" ").pop())?.textContent.trim())
        expect.equal(read, "[march-statement].csv is 24 MB. Split it by month, or export it without attachments.", "the error is read with the button")
        expect.equal(await zone.locator('[data-slot="field-error"] svg').count(), 1, "an icon")
      },
    },
    {
      name: "A file turned away shows over an older error from the product",
      example: "states",
      async run({ scope, expect }) {
        const zone = scope.locator('[data-slot="file-drop"]').nth(1)
        await zone.evaluate(drop, [["notes.txt", "text/plain"]])
        expect.equal((await zone.locator('[data-slot="field-error"]').textContent()).trim(), "notes.txt is the wrong type. Choose CSV or XLSX.", "the newest message is the one shown")
      },
    },
    {
      name: "It sits in a row when wide and stacks when narrow",
      example: "states",
      async run({ scope, expect }) {
        const layout = await scope.locator('[data-slot="file-drop"]').evaluateAll((els) =>
          els.map((el) => {
            const title = el.querySelector('[data-slot="file-drop-title"]').getBoundingClientRect()
            const button = el.querySelector("button").getBoundingClientRect()
            return button.top < title.bottom ? "row" : "stacked"
          })
        )
        expect.equal(layout.join(","), "row,row,stacked", "wide zones in a row, the 300px one stacked")
      },
    },
    {
      name: "Touch: the button is 44px tall",
      example: "basics",
      touch: true,
      async run({ scope, expect }) {
        expect.equal(Math.round((await scope.getByRole("button").first().boundingBox()).height), 44, "a 44px button on touch")
      },
    },
  ],
}
