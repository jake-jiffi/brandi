// EditableCell's one definition. In use it sits in a DataTable column marked editable, and the table's
// onCellSave saves it; the board builds those functions in its own script.

const people = [
  { id: "priya", person: "[Priya Nair]", role: "[Senior physio]", hours: 38.5, status: { label: "Open", tone: "info" } },
  { id: "marcus", person: "[Marcus Chen]", role: "[Physio]", hours: 41.25, status: { label: "Open", tone: "info" } },
  { id: "sam", person: "[Sam Lee]", role: "[Reception]", hours: 30, status: { label: "Locked", tone: "neutral" } },
  { id: "ana", person: "[Ana Silva]", role: "[Practice manager]", hours: null, status: { label: "Open", tone: "info" } },
]

const cellBox = (label, inner) =>
  `<div class="flex w-52 flex-col gap-2"><span class="type-meta text-text-muted">${label}</span><div class="rounded-md border border-line bg-surface px-3 py-2">${inner}</div></div>`

const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement)
async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await isFocused(locator)) return true
  }
  return false
}
const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)
const colourOf = (page, role, prop = "color") =>
  page.evaluate(([r, p]) => {
    const probe = document.createElement("span")
    probe.style[p] = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe)[p]
    probe.remove()
    return value
  }, [role, prop])
/** The system's own formatter, from the bundle's namespace, so expected figures follow the market's locale. */
const fmt = (page, value, styleName) =>
  page.evaluate(([v, s]) => {
    for (const key of Object.keys(window)) {
      try {
        const ns = window[key]
        if (ns && typeof ns.formatNumber === "function" && typeof ns.Root === "function") return ns.formatNumber(v, s)
      } catch (e) {}
    }
    return null
  }, [value, styleName])
/** The cell at rest, a button named "Edit hours for [name], [value]". */
const cellFor = (scope, name) => scope.getByRole("button", { name: new RegExp(`^Edit hours for \\[${name}\\],`) })
const fieldFor = (scope, name) => scope.getByRole("textbox", { name: `Hours for [${name}]`, exact: true })
const LOCKED = "[Payroll system] has locked this week. Ask [Ana Silva] to reopen it."

export default {
  name: "EditableCell",
  group: "Data",
  job: "Changes a value in place in a DataTable: Enter saves, Escape cancels and puts the value back.",
  status: "to build",
  props: [
    { name: "value", type: "string | number | null", doc: "The saved value. Missing shows empty." },
    { name: "label", type: "string", required: true, doc: "Names the field with its record: \"Hours for [Priya Nair]\". In a DataTable it is the column's label and the row's name." },
    { name: "format", type: "NumberStyle", doc: "A number style: the value reads through the formatter, sits at the end, and typing opens a number keyboard." },
    { name: "empty", type: "string", default: '"Not set"', doc: "What a missing value says." },
    { name: "align", type: '"start" | "end"', doc: "Numbers sit at the end and text at the start, by default." },
    { name: "validate", type: "(value: string) => string | null | undefined", doc: "Checks what was typed, on Enter or on leaving the cell: return what is wrong and how to fix it." },
    { name: "onSave", type: "(value: string) => void | string | null | undefined | Promise<void | string | null | undefined>", doc: "Saves what was typed. A message, returned or resolved, or a rejected promise, keeps the cell open with what was typed." },
    { name: "state", type: '"editing" | "saving" | "failed"', doc: "Design mode: shows a state in place, for a board, taking no focus." },
    { name: "draft", type: "string", doc: "With state: what was typed." },
    { name: "error", type: "string", doc: "With state \"failed\": the message." },
    { name: "disabled", type: "boolean", default: "false", doc: "Shows the value as plain text, with nothing to edit." },
  ],
  notes: {
    Behaviour: [
      "At rest the cell is a button named \"Edit [label], [value]\". Enter, Space, F2 or a press starts an edit, with the value selected. Typing a character starts an edit with that character, as a spreadsheet does.",
      "Enter saves and puts focus back on the cell. Escape cancels, puts the value back and puts focus back on the cell. Leaving the cell with Tab or a press saves too.",
      "The edit is the top layer: its Escape is taken before a dialog or sheet round the table hears it, so the next Escape closes that.",
      "A wrong value, or a save that failed, keeps the cell open with what was typed and says why under it, in Field's wording: what is wrong and how to fix it. The message is tied to the field and read out politely.",
      "While saving, the cell shows what was typed with a spinner, stays focusable and says it is busy; Saved is read out when it lands.",
      "In a DataTable, selecting a row never opens or edits it, and the first column still names the record.",
      "A number may be typed the way the market writes it, with grouping, a currency symbol or a unit (\"$1,200\", \"7.5 h\"). The value saved is the plain number; an unchanged number is not saved again.",
    ],
    Layout: [
      "The value lines up with the column's other cells; hovering shows the hover wash and a control edge. The cell is 32px tall, 40px on a touch screen, and keeps its width between rest and editing.",
      "The field is the small TextInput, with 16px text on a touch screen. A message wraps under it, up to 256px wide.",
      "On a phone, where the table becomes a list, the value shows as text in the meta line; editing belongs to the record's own view.",
    ],
    States: ["At rest, editing, saving, saved (a check for a moment), and failed (the field with its message). Edit mode shows by the field's edge; a message by its icon and its words, never colour alone."],
    Copy: [
      'Messages say what is wrong and how to fix it: "Enter hours from 0 to 60". A failed save names the system: "[Payroll system] has locked this week. Ask [Ana Silva] to reopen it."',
      "A number that is not a number gets the formatter's own example: \"Enter hours as a number, such as 7.5\".",
    ],
    Rules: [
      "For a value people change often, in place. Anything that needs more than one field, or a reason, is a Sheet.",
      "Selecting a row still never opens or edits it, and the first column still names the record: the naming column is never editable, because it holds the row's link or button.",
      "Never throw away what was typed: a failed save leaves the cell open with the typed value.",
    ],
    Open: [
      "The grid pattern, one tab stop for the whole table with arrows between cells, is not built: each editable cell is its own tab stop, as the table pattern expects of a control in a cell.",
    ],
  },
  frame: { width: 960, height: 560 },
  logic: `hourColumns: [
  { key: "person", label: "Person", type: "person" },
  { key: "role", label: "Role" },
  { key: "status", label: "Week", type: "badge" },
  {
    key: "hours",
    label: "Hours",
    type: "hours",
    editable: true,
    validate: (value) => (value !== "" && (Number(value) < 0 || Number(value) > 60) ? "Enter hours from 0 to 60" : null),
  },
],
saveHours: (row, key, value) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(row.id === "sam" ? "[Payroll system] has locked this week. Ask [Ana Silva] to reopen it." : undefined), 250)
  )`,
  examples: [
    {
      id: "in-table",
      title: "In a table: Enter saves, Escape cancels",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Hours this week" columns="{{hourColumns}}" rows="{{people}}" selectable="{{yes}}" on-cell-save="{{saveHours}}"></x-import>`,
      vals: { people, yes: true },
    },
    {
      id: "states",
      title: "At rest, editing, saving and failed, for a design",
      layout: "block",
      markup: `<div class="flex flex-wrap items-start gap-3">${[
        cellBox("At rest", `<x-import component-from-global-scope="NS.EditableCell" label="Hours for [Priya Nair]" value="{{v385}}" format="hours"></x-import>`),
        cellBox("Editing", `<x-import component-from-global-scope="NS.EditableCell" label="Hours for [Marcus Chen]" value="{{v4125}}" format="hours" state="editing" draft="42"></x-import>`),
        cellBox("Saving", `<x-import component-from-global-scope="NS.EditableCell" label="Hours for [Ana Silva]" value="{{v36}}" format="hours" state="saving" draft="37.5"></x-import>`),
        cellBox("Failed", `<x-import component-from-global-scope="NS.EditableCell" label="Hours for [Sam Lee]" value="{{v30}}" format="hours" state="failed" draft="32" error="[Payroll system] has locked this week. Ask [Ana Silva] to reopen it."></x-import>`),
      ].join("\n")}</div>`,
      vals: { v385: 38.5, v4125: 41.25, v36: 36, v30: 30 },
    },
  ],
  checks: [
    {
      name: "Enter starts an edit with the value selected, Enter saves, and focus comes back to the cell",
      example: "in-table",
      async run({ page, scope, expect }) {
        const cell = cellFor(scope, "Priya Nair")
        expect(await tabTo(page, cell), "Tab reaches the cell")
        await page.keyboard.press("Enter")
        const field = fieldFor(scope, "Priya Nair")
        await field.waitFor({ state: "visible", timeout: 3000 })
        expect(await isFocused(field), "focus is in the field")
        const sel = await field.evaluate((el) => [el.value, el.selectionStart, el.selectionEnd])
        expect.equal(sel.join(","), "38.5,0,4", "the value, all selected")
        await page.keyboard.type("40")
        await page.keyboard.press("Enter")
        const saved = await fmt(page, 40, "hours")
        // Saving shows the typed value too, so wait for the cell to stop being busy.
        await page.waitForFunction((v) => [...document.querySelectorAll('[data-example="in-table"] [data-slot="editable-cell-value"]')].some((b) => b.getAttribute("aria-label")?.endsWith(v) && !b.hasAttribute("aria-busy") && b === document.activeElement), saved, { timeout: 4000 })
        expect.equal((await cellFor(scope, "Priya Nair").innerText()).trim(), saved, "the cell shows what was saved")
        expect.equal((await scope.locator('tr[data-key="priya"] [data-slot="editable-cell"] [role="status"]').textContent()).trim(), "Saved", "and says so")
      },
    },
    {
      name: "Escape cancels: the value comes back and focus returns to the cell",
      example: "in-table",
      async run({ page, scope, expect }) {
        const cell = cellFor(scope, "Priya Nair")
        await cell.focus()
        await page.keyboard.press("Enter")
        await fieldFor(scope, "Priya Nair").waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.type("12")
        await page.keyboard.press("Escape")
        expect.equal(await fieldFor(scope, "Priya Nair").count(), 0, "the field is gone")
        expect.equal((await cellFor(scope, "Priya Nair").innerText()).trim(), await fmt(page, 38.5, "hours"), "the value is back")
        expect(await isFocused(cellFor(scope, "Priya Nair")), "focus is back on the cell")
      },
    },
    {
      name: "Escape is the edit's own: a dialog or sheet listening on the document never hears it",
      example: "in-table",
      async run({ page, scope, expect }) {
        await page.evaluate(() => {
          window.__heard = 0
          // Where a Radix dialog or sheet listens for Escape: the document, as the key comes down.
          document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.__heard++ }, true)
        })
        await cellFor(scope, "Priya Nair").focus()
        await page.keyboard.press("Enter")
        await fieldFor(scope, "Priya Nair").waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__heard), 0, "the edit took its Escape")
        expect(await isFocused(cellFor(scope, "Priya Nair")), "and cancelled, back on the cell")
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__heard), 1, "the next Escape reaches the layer round the table")
      },
    },
    {
      name: "A value that is not a number stays on the cell in Field's wording, keeping what was typed",
      example: "in-table",
      async run({ page, scope, expect }) {
        await cellFor(scope, "Marcus Chen").focus()
        await page.keyboard.press("Enter")
        const field = fieldFor(scope, "Marcus Chen")
        await field.waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.type("abc")
        await page.keyboard.press("Enter")
        expect.equal(await field.inputValue(), "abc", "what was typed is kept")
        expect.equal(await field.getAttribute("aria-invalid"), "true", "the field is marked wrong")
        const error = scope.locator('tr[data-key="marcus"] [data-slot="field-error"]')
        expect.equal((await error.innerText()).trim(), "Enter hours as a number, such as 7.5", "what is wrong and how to fix it")
        expect((await field.getAttribute("aria-describedby")).includes(await error.getAttribute("id")), "the message is tied to the field")
        expect(await isFocused(field), "focus stays in the field")
      },
    },
    {
      name: "A value out of range gets the column's own message",
      example: "in-table",
      async run({ page, scope, expect }) {
        await cellFor(scope, "Marcus Chen").focus()
        await page.keyboard.press("Enter")
        await fieldFor(scope, "Marcus Chen").waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.type("75")
        await page.keyboard.press("Enter")
        expect.equal((await scope.locator('tr[data-key="marcus"] [data-slot="field-error"]').innerText()).trim(), "Enter hours from 0 to 60", "the column's check")
      },
    },
    {
      name: "A failed save keeps the cell open with the typed value, and names the system",
      example: "in-table",
      async run({ page, scope, expect }) {
        await cellFor(scope, "Sam Lee").focus()
        await page.keyboard.press("Enter")
        const field = fieldFor(scope, "Sam Lee")
        await field.waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.type("32")
        await page.keyboard.press("Enter")
        const error = scope.locator('tr[data-key="sam"] [data-slot="field-error"]')
        await error.waitFor({ state: "visible", timeout: 4000 })
        expect.equal((await error.innerText()).trim(), LOCKED, "which system, and what to do")
        expect.equal(await field.inputValue(), "32", "what was typed is kept")
        expect(await isFocused(field), "focus is back in the field")
      },
    },
    {
      name: "Typing on the cell starts an edit with what was typed",
      example: "in-table",
      async run({ page, scope, expect }) {
        await cellFor(scope, "Priya Nair").focus()
        await page.keyboard.press("7")
        const field = fieldFor(scope, "Priya Nair")
        await field.waitFor({ state: "visible", timeout: 3000 })
        expect.equal(await field.inputValue(), "7", "the field holds the typed character, once")
        expect(await isFocused(field), "focus is in the field")
      },
    },
    {
      name: "Leaving the cell with Tab saves it",
      example: "in-table",
      async run({ page, scope, expect }) {
        await cellFor(scope, "Priya Nair").focus()
        await page.keyboard.press("Enter")
        await fieldFor(scope, "Priya Nair").waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.type("39")
        await page.keyboard.press("Tab")
        const saved = await fmt(page, 39, "hours")
        await page.waitForFunction((v) => [...document.querySelectorAll('[data-example="in-table"] [data-slot="editable-cell-value"]')].some((b) => b.textContent?.trim() === v), saved, { timeout: 4000 })
        expect(await page.evaluate(() => document.activeElement !== document.body), "focus moved on, never to the page body")
      },
    },
    {
      name: "A number typed with its unit saves as the number",
      example: "in-table",
      async run({ page, scope, expect }) {
        await cellFor(scope, "Ana Silva").focus()
        await page.keyboard.press("Enter")
        await fieldFor(scope, "Ana Silva").waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.type("37.5 h")
        await page.keyboard.press("Enter")
        const saved = await fmt(page, 37.5, "hours")
        await page.waitForFunction((v) => [...document.querySelectorAll('[data-example="in-table"] [data-slot="editable-cell-value"]')].some((b) => b.getAttribute("aria-label")?.endsWith(v) && !b.hasAttribute("aria-busy")), saved, { timeout: 4000 })
        expect.equal((await cellFor(scope, "Ana Silva").innerText()).trim(), saved, "saved as the number")
      },
    },
    {
      name: "An unchanged number is not saved again, however it is typed",
      example: "in-table",
      async run({ page, scope, expect }) {
        const cell = cellFor(scope, "Priya Nair")
        await cell.focus()
        await page.keyboard.press("Enter")
        await fieldFor(scope, "Priya Nair").waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.type("38.50")
        await page.keyboard.press("Enter")
        expect(await isFocused(cellFor(scope, "Priya Nair")), "focus is back on the cell at once")
        expect.equal(await cellFor(scope, "Priya Nair").getAttribute("aria-busy"), null, "nothing is saving")
        expect.equal((await scope.locator('tr[data-key="priya"] [data-slot="editable-cell"] [role="status"]').textContent()).trim(), "", "nothing was saved")
      },
    },
    {
      name: "Selecting a row never edits it",
      example: "in-table",
      async run({ page, scope, expect }) {
        const box = scope.getByRole("checkbox", { name: "Select [Priya Nair]" })
        await box.focus()
        await page.keyboard.press("Space")
        expect.equal(await box.getAttribute("aria-checked"), "true", "the row is selected")
        expect.equal(await scope.getByRole("textbox").count(), 0, "no cell opened")
      },
    },
    {
      name: "Shown for a design, the states draw in place and take no focus",
      example: "states",
      async run({ page, scope, expect }) {
        expect.equal(await fieldFor(scope, "Marcus Chen").inputValue(), "42", "editing shows the typed value")
        expect.equal(await cellFor(scope, "Ana Silva").getAttribute("aria-busy"), "true", "saving says it is busy")
        expect.equal(await fieldFor(scope, "Sam Lee").inputValue(), "32", "failed keeps the typed value")
        expect.equal((await scope.locator('[data-slot="field-error"]').innerText()).trim(), LOCKED, "and shows its message")
        expect(await page.evaluate(() => document.activeElement === document.body), "nothing took focus")
      },
    },
    {
      name: "On a touch screen the cell is 40px tall and a tap starts an edit",
      example: "in-table",
      touch: true,
      async run({ scope, expect }) {
        const cell = cellFor(scope, "Priya Nair")
        expect.atLeast(Math.round((await cell.boundingBox()).height), 40, "the cell's height on touch")
        await cell.tap()
        await fieldFor(scope, "Priya Nair").waitFor({ state: "visible", timeout: 3000 })
        expect.atLeast(Math.round((await fieldFor(scope, "Priya Nair").boundingBox()).height), 40, "the field's height on touch")
      },
    },
    {
      name: "Forced colours keep the field's edge and the message's icon",
      example: "states",
      forcedColors: true,
      async run({ scope, expect }) {
        expect.equal(await style(fieldFor(scope, "Sam Lee"), "borderTopStyle"), "solid", "the field's edge")
        expect.equal(await scope.locator('[data-slot="field-error"] svg').count(), 1, "the message has its icon, not colour alone")
      },
    },
    {
      name: "A failed cell's message and edge are the danger role, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        expect.equal(await style(scope.locator('[data-slot="field-error"]'), "color"), await colourOf(page, "danger"), "the message")
        expect.equal(await style(fieldFor(scope, "Sam Lee"), "borderTopColor"), await colourOf(page, "danger", "borderTopColor"), "the field's edge")
      },
    },
  ],
}
