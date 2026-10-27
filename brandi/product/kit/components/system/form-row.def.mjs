// FormRow's one definition. The fields are stand-ins until Field and TextInput land in the kit.
const field = (id, label) => `<div class="flex flex-col gap-1.5" data-field="${id}">
<label for="${id}" class="type-label text-text-strong">${label}</label>
<input id="${id}" name="${id}" type="text" autocomplete="off" class="h-9 w-full min-w-0 rounded-control border border-line-control bg-surface px-3 type-body text-text">
</div>`

const boxes = (scope) => scope.locator("[data-field]").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))
const oneRow = (b) => b.every((x) => Math.abs(x.top - b[0].top) < 1)
const oneColumn = (b) => b.every((x, i) => Math.abs(x.left - b[0].left) < 1 && (i === 0 || x.top >= b[i - 1].bottom))

export default {
  name: "FormRow",
  group: "Forms",
  job: "Short fields that belong together, side by side, dropping to one column before any is narrower than 180px.",
  status: "proven",
  props: [
    { name: "columns", type: "2 | 3", default: "2", doc: "How many fields sit side by side." },
    { name: "children", type: "ReactNode", doc: "The fields, in reading order." },
  ],
  notes: {
    Layout: [
      "Side by side while every field has 180px of its own: 376px of row for two, 572px for three. Below that, one column, never two of three. It measures its own width, not the window's.",
    ],
    Rules: [
      "Only for short fields that belong together, such as suburb, state and postcode, or first and last name.",
      "Everything else stacks, one field to a line.",
    ],
  },
  frame: { width: 960, height: 520 },
  examples: [
    {
      id: "three",
      title: "Three fields",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.FormRow" columns="{{c3}}">${field("three-suburb", "Suburb")}${field("three-state", "State")}${field("three-postcode", "Postcode")}</x-import>`,
      vals: { c3: 3 },
    },
    {
      id: "two",
      title: "Two fields",
      layout: "block",
      markup: `<div class="max-w-xl"><x-import component-from-global-scope="NS.FormRow">${field("two-first", "First name")}${field("two-last", "Last name")}</x-import></div>`,
    },
    {
      id: "narrow",
      title: "Three fields in a 400px pane",
      layout: "block",
      markup: `<div id="row-pane" style="width: 400px"><x-import component-from-global-scope="NS.FormRow" columns="{{c3}}">${field("narrow-suburb", "Suburb")}${field("narrow-state", "State")}${field("narrow-postcode", "Postcode")}</x-import></div>`,
    },
  ],
  checks: [
    {
      name: "Three fields sit side by side while each has 180px",
      example: "three",
      async run({ scope, expect }) {
        const b = await boxes(scope)
        expect(oneRow(b), "the fields share one row")
        for (const x of b) expect.atLeast(Math.round(x.width), 180, "each field's width")
      },
    },
    {
      name: "In a narrow pane they drop to one column, never two of three",
      example: "narrow",
      async run({ scope, expect }) {
        expect(oneColumn(await boxes(scope)), "one column at 400px")
      },
    },
    {
      name: "The switch happens at the row's own width: 572px for three",
      example: "narrow",
      viewport: { width: 1440, height: 900 },
      async run({ page, scope, expect }) {
        const pane = page.locator("#row-pane")
        await pane.evaluate((el) => (el.style.width = "571px"))
        expect(oneColumn(await boxes(scope)), "one column at 571px")
        await pane.evaluate((el) => (el.style.width = "572px"))
        const b = await boxes(scope)
        expect(oneRow(b), "three columns at 572px")
        for (const x of b) expect.atLeast(Math.round(x.width), 180, "each field's width at 572px")
      },
    },
  ],
}
