// Icon's one definition.
export default {
  name: "Icon",
  group: "Foundations",
  job: "One icon set, by name, drawn in currentColor at the set's stroke.",
  status: "proven",
  props: [
    { name: "name", type: "IconName", doc: "A name from the system's icon vocabulary (ICON_NAMES)." },
    { name: "size", type: "12 | 14 | 16 | 18 | 20 | 24", default: "16", doc: "12 in badges, 14 in chips and meta lines, 16 in buttons, inputs, menus and tables, 18 on the rail, 20 to 24 in empty states." },
    { name: "strokeWidth", type: "number", default: "2", doc: "The set's stroke. Change it only for a whole family of icons at once." },
    { name: "label", type: "string", doc: "Its accessible name. Without one the icon is decoration and screen readers skip it." },
  ],
  notes: {
    Behaviour: ["Hidden from screen readers unless it has a label."],
    Rules: [
      "One set only: never emoji, never a second library. Add a name to the vocabulary before using it.",
      "A lone icon needs a label and a tooltip, which IconButton supplies.",
      "Colour comes from the text beside it; status icons take the status text colour.",
    ],
  },
  examples: [
    {
      id: "sizes",
      title: "Sizes",
      markup: `<x-import component-from-global-scope="NS.Icon" name="Bell" size="{{s12}}"></x-import>
<x-import component-from-global-scope="NS.Icon" name="Bell" size="{{s16}}"></x-import>
<x-import component-from-global-scope="NS.Icon" name="Bell" size="{{s20}}"></x-import>
<x-import component-from-global-scope="NS.Icon" name="Bell" size="{{s24}}" label="Notifications"></x-import>`,
      vals: { s12: 12, s16: 16, s20: 20, s24: 24 },
    },
  ],
  checks: [
    {
      name: "An icon without a label is hidden; one with a label is an image with that name",
      example: "sizes",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("svg[aria-hidden='true']").count(), 3, "decorative icons hidden")
        expect.equal(await scope.getByRole("img", { name: "Notifications" }).count(), 1, "the labelled icon is named")
      },
    },
  ],
}
