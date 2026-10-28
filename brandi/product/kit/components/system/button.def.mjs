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
    { name: "disabledReason", type: "string", doc: "Why it cannot be pressed yet: Confirm 2 checks first. It stays focusable and aria-disabled, says why in a tooltip and its description, and ignores presses. Prefer it to disabled." },
    { name: "block", type: "boolean", default: "false", doc: "Fills its container's width." },
    { name: "href", type: "string", doc: "Renders a link that looks like a button. Links navigate; buttons act." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and unpressable. Say why nearby or in a tooltip." },
    { name: "onClick, form, name and the rest", type: "native", doc: "Every native button prop passes through to the button." },
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
  // DESIGN.md's rows: the roles and the type style the base variants use (components/ui/button.tsx).
  design: {
    "button-primary": { backgroundColor: "primary", textColor: "on-primary", typography: "label", rounded: "radius-control", height: "36px", padding: "0 14px" },
    "button-primary-hover": { backgroundColor: "primary-hover" },
    "button-secondary": { backgroundColor: "surface", textColor: "text-strong", typography: "label", rounded: "radius-control", height: "36px", padding: "0 14px" },
    "button-secondary-hover": { backgroundColor: "hover" },
    "button-ghost": { textColor: "text-strong", typography: "label", rounded: "radius-control", height: "36px", padding: "0 14px" },
    "button-brand": { backgroundColor: "brand", textColor: "on-brand", typography: "label", rounded: "radius-control", height: "36px", padding: "0 14px" },
    "button-danger": { backgroundColor: "danger-surface", textColor: "danger", typography: "label", rounded: "radius-control", height: "36px", padding: "0 14px" },
    "button-danger-solid": { backgroundColor: "danger-solid", textColor: "on-danger", typography: "label", rounded: "radius-control", height: "36px", padding: "0 14px" },
  },
  notes: {
    States: [
      "Loading keeps the width, shows a spinner, sets aria-busy and aria-disabled, and ignores further presses. It stays focusable, so focus never drops.",
      "Disabled says why, nearby or in a tooltip. It keeps pointer events, so the tooltip still shows.",
      "disabledReason is the way to say not yet: the button stays focusable and aria-disabled, its reason shows in a tooltip on hover, focus and a long press, a screen reader hears it after the name, and presses do nothing. A bare aria-disabled still hears the press, for a control that explains itself when pressed (an empty Ask moves focus to its field).",
      "Disabled and aria-disabled fade alike, to the opacity-disabled token.",
    ],
    Copy: [
      "One to three words, verb first, in sentence case: Approve, Save draft, Delete 3 invoices.",
      "Never Submit, OK or Click here. While loading, the label says what is happening (Saving…).",
    ],
    Rules: [
      "Secondary then primary, right-aligned, with Cancel immediately left of the primary.",
      "Prefer an enabled button that explains the problem when pressed to a disabled one.",
    ],
    Review: [
      "loading did not block a second press (round 1).",
      "A disabled Approve said nothing about why (a pilot's round 1): disabledReason says why, stays focusable and swallows the press.",
    ],
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
    {
      id: "reason",
      title: "Not yet, saying why",
      markup: `<x-import component-from-global-scope="NS.Button" variant="primary" icon="Check" disabled-reason="Confirm 2 checks first" on-click="{{press}}">Approve pay run</x-import>
<p data-slot="example-status" class="type-meta text-text-muted">{{pressedLine}}</p>`,
    },
  ],
  state: { pressed: 0 },
  logic: `press: () => self.setState({ pressed: self.state.pressed + 1 }),
pressedLine: "Pressed " + self.state.pressed + " times."`,
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
      name: "A button that cannot be pressed yet stays focusable, says why, and ignores presses",
      example: "reason",
      async run({ page, scope, expect }) {
        const button = scope.getByRole("button", { name: "Approve pay run" })
        await button.focus()
        expect(await button.evaluate((el) => document.activeElement === el), "it takes focus")
        const tip = page.getByRole("tooltip")
        const shown = await tip.waitFor({ timeout: 3000 }).then(() => true, () => false)
        expect(shown, "the tooltip opens on focus")
        expect.equal((await tip.textContent()).trim(), "Confirm 2 checks first", "and says why")
        expect.equal(await button.getAttribute("aria-disabled"), "true", "it says it is unavailable")
        expect.equal(await button.evaluate((el) => el.disabled), false, "without dropping out of the tab order")
        const described = await button.evaluate((el) => (el.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent.trim()).join(" "))
        expect.equal(described, "Confirm 2 checks first", "a screen reader hears why after the name")
        await page.keyboard.press("Enter")
        await page.keyboard.press("Space")
        await button.click({ force: true })
        expect.equal((await scope.locator('[data-slot="example-status"]').textContent()).trim(), "Pressed 0 times.", "no press went through")
      },
    },
    {
      name: "Disabled and aria-disabled fade alike, to the opacity-disabled token",
      async run({ page, expect }) {
        const token = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--opacity-disabled").trim())
        const faded = await page.locator('[data-example="states"] button:disabled, [data-example="reason"] button[aria-disabled="true"]').evaluateAll((all) => all.map((el) => getComputedStyle(el).opacity))
        expect.equal(faded.length, 2, "a disabled and an aria-disabled button")
        for (const o of faded) expect.equal(o, String(Number(token)), "faded to the token")
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
