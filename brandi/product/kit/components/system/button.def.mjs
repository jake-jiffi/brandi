// Button's one definition: its README, its preview board and its scripted checks all come from here.
export default {
  name: "Button",
  group: "Actions",
  job: "The pressable action.",
  status: "proven",
  props: [
    { name: "variant", type: '"primary" | "secondary" | "ghost" | "brand" | "danger" | "danger-solid" | "link"', default: '"secondary"', doc: "What the action is to the view. See Variants." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen." },
    { name: "icon", type: "IconName", doc: "An icon before the label." },
    { name: "iconRight", type: "IconName", doc: "An icon after the label, for a menu or a step forward." },
    { name: "loading", type: "boolean", default: "false", doc: "Keeps the width, shows a spinner, sets aria-busy and ignores presses. It stays focusable." },
    { name: "block", type: "boolean", default: "false", doc: "Fills its container's width." },
    { name: "href", type: "string", doc: "Renders a link that looks like a button. Links navigate; buttons act." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and unpressable. Say why nearby or in a tooltip." },
  ],
  tables: [
    {
      title: "Variants",
      head: ["Variant", "Use"],
      rows: [
        ["primary", "The one thing the view is for. Once per view"],
        ["secondary", "The default. Every other action"],
        ["ghost", "Toolbars, dense rows, tertiary actions"],
        ["brand", "Brand moments only (ask, a first run, a finish). Never beside a primary"],
        ["danger", "A destructive action in flow. Archive can be undone, so it is a normal button"],
        ["danger-solid", "Only a destructive dialog's final confirm, with the count"],
        ["link", "An inline text action"],
      ],
    },
  ],
  notes: {
    States: [
      "Loading keeps the width, shows a spinner, sets aria-busy and aria-disabled, and ignores further presses. It stays focusable, so focus never drops.",
      "Disabled says why, nearby or in a tooltip. It keeps pointer events, so the tooltip still shows.",
    ],
    Copy: [
      "One to three words, verb first, in sentence case: Approve, Save draft, Delete 3 invoices.",
      "Never Submit, OK or Click here. While loading, the label says what is happening (Saving…).",
    ],
    Rules: [
      "Secondary then primary, right-aligned, with Cancel immediately left of the primary.",
      "Prefer an enabled button that explains the problem when pressed to a disabled one.",
    ],
    Review: ["loading did not block a second press (round 1)."],
  },
  examples: [
    {
      id: "variants",
      title: "Variants",
      markup: `<x-import component-from-global-scope="NS.Button" variant="primary" icon="Check">Approve</x-import>
<x-import component-from-global-scope="NS.Button">Save draft</x-import>
<x-import component-from-global-scope="NS.Button" variant="ghost" icon="Pencil">Edit</x-import>
<x-import component-from-global-scope="NS.Button" variant="brand" icon="Sparkles">Ask</x-import>
<x-import component-from-global-scope="NS.Button" variant="danger" icon="Archive">Archive</x-import>
<x-import component-from-global-scope="NS.Button" variant="danger-solid">Delete 3 invoices</x-import>
<x-import component-from-global-scope="NS.Button" variant="link">View invoice</x-import>`,
    },
    {
      id: "sizes",
      title: "Sizes",
      markup: `<x-import component-from-global-scope="NS.Button" size="sm">Small</x-import>
<x-import component-from-global-scope="NS.Button">Default</x-import>
<x-import component-from-global-scope="NS.Button" size="lg" variant="primary">Large</x-import>`,
    },
    {
      id: "states",
      title: "Loading and disabled",
      markup: `<x-import component-from-global-scope="NS.Button" variant="primary" loading="{{yes}}">Saving…</x-import>
<x-import component-from-global-scope="NS.Button" disabled="{{yes}}">Export</x-import>`,
      vals: { yes: true },
    },
  ],
  checks: [
    {
      name: "A loading button ignores a second press and keeps focus",
      example: "states",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "Saving…" })
        await button.focus()
        await page.keyboard.press("Enter")
        expect(await button.evaluate((el) => document.activeElement === el), "focus stays on the loading button")
        expect.equal(await button.getAttribute("aria-busy"), "true", "it says it is busy")
      },
    },
    {
      name: "Every button is at least 32px tall, and 40px on a touch screen",
      example: "sizes",
      async run({ scope, expect }) {
        for (const b of await scope.getByRole("button").all()) expect.atLeast((await b.boundingBox()).height, 32, "button height")
      },
    },
    {
      name: "Touch sizes grow to 40, 44 and 48px",
      example: "sizes",
      touch: true,
      async run({ scope, expect }) {
        const heights = await Promise.all((await scope.getByRole("button").all()).map(async (b) => Math.round((await b.boundingBox()).height)))
        expect.equal(heights.join(","), "40,44,48", "touch heights")
      },
    },
    {
      name: "Focus shows the system's outline, in both themes",
      example: "variants",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const outline = await scope.getByRole("button").first().evaluate((el) => getComputedStyle(el).outlineStyle)
        expect.equal(outline, "solid", "outline style when focused from the keyboard")
      },
    },
  ],
}
