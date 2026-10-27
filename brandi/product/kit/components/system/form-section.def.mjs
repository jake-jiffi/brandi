// FormSection's one definition. The board's fields are the system's Field and TextInput.
const field = (id, label) => `<div class="flex min-w-0 flex-col"><x-import component-from-global-scope="NS.Field" label="${label}">
<x-import component-from-global-scope="NS.TextInput" id="${id}" name="${id}" autocomplete="off"></x-import>
</x-import></div>`
const actions = (primary) =>
  `<x-import component-from-global-scope="NS.FormActions"><x-import component-from-global-scope="NS.Button">Cancel</x-import><x-import component-from-global-scope="NS.Button" variant="primary">${primary}</x-import></x-import>`

const box = (locator) => locator.boundingBox()
// Tailwind composes box-shadow from several layers, so "no shadow" computes as transparent layers.
const shadowShows = (value) =>
  value !== "none" && value.split(/,(?![^(]*\))/).some((layer) => !/rgba\(\d+, \d+, \d+, 0\)/.test(layer))

export default {
  name: "FormSection",
  group: "Forms",
  job: "Related fields in a card, with the title and description beside them or above.",
  status: "proven",
  props: [
    { name: "title", type: "ReactNode", doc: "One topic, in sentence case." },
    { name: "description", type: "ReactNode", doc: 'Why the fields matter or who sees them: "Only finance can see this".' },
    { name: "layout", type: '"split" | "stacked"', default: '"split"', doc: "Split: the title beside the fields, stacking above them when the section is narrow. Stacked: always above." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "2 by default; 3 under another heading." },
    { name: "children", type: "ReactNode", doc: "The fields, rows of fields and the section's FormActions." },
  ],
  notes: {
    Layout: [
      "Split puts the title and description in a third and the fields in a card in the other two. Under 640px of its own width the title goes above the fields, whatever the window.",
      "Inside a card it draws no second card: the fields sit straight in the card around it.",
      "The title's size follows its level, as a Card's does: heading-lg at h2, heading at h3, heading-sm at h4.",
    ],
    Rules: [
      "One topic per section. The description says why the fields matter or who sees them.",
      "A settings page is one column of sections beside a sticky SideNav, and each section saves on its own.",
    ],
    Review: ["It collapsed by the window's width, not its own (round 1)."],
  },
  frame: { width: 960, height: 1640 },
  examples: [
    {
      id: "split",
      title: "Split",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.FormSection" title="Billing" description="Where invoices go. Only finance can see this.">
${field("billing-name", "Business name")}
${field("billing-email", "Billing email")}
${field("billing-suburb", "Suburb")}
<x-import component-from-global-scope="NS.FormRow">${field("billing-state", "State")}${field("billing-postcode", "Postcode")}</x-import>
${actions("Save billing")}
</x-import>`,
    },
    {
      id: "stacked",
      title: "Stacked, under another heading",
      layout: "block",
      markup: `<div class="max-w-xl"><x-import component-from-global-scope="NS.FormSection" title="Notifications" description="Sent to you, and nobody else." layout="stacked" heading-level="{{h3}}">
${field("alerts-email", "Email for alerts")}
${field("alerts-mobile", "Mobile for urgent alerts")}
${actions("Save notifications")}
</x-import></div>`,
      vals: { h3: 3 },
    },
    {
      id: "narrow",
      title: "Split, in a narrow pane",
      layout: "block",
      markup: `<div style="width: 480px"><x-import component-from-global-scope="NS.FormSection" title="Address" description="Printed on every invoice.">
${field("address-street", "Street address")}
<x-import component-from-global-scope="NS.FormRow">${field("address-suburb", "Suburb")}${field("address-postcode", "Postcode")}</x-import>
${actions("Save address")}
</x-import></div>`,
    },
    {
      id: "in-card",
      title: "Inside a card",
      layout: "block",
      markup: `<div class="max-w-xl"><x-import component-from-global-scope="NS.Card" title="Account">
<x-import component-from-global-scope="NS.FormSection" title="Password" description="At least 12 characters." layout="stacked" heading-level="{{h3}}">
${field("account-password", "New password")}
${actions("Change password")}
</x-import>
</x-import></div>`,
    },
  ],
  checks: [
    {
      name: "Split follows its own width, not the window's",
      example: "narrow",
      viewport: { width: 1440, height: 900 },
      async run({ page, expect }) {
        const narrow = page.locator('[data-example="narrow"] [data-slot="form-section"]')
        const nHead = await box(narrow.locator('[data-slot="form-section-header"]'))
        const nFields = await box(narrow.locator('[data-slot="form-section-fields"]'))
        expect(nHead.y + nHead.height <= nFields.y, "in a 480px pane the title sits above the fields")
        const wide = page.locator('[data-example="split"] [data-slot="form-section"]')
        const wHead = await box(wide.locator('[data-slot="form-section-header"]'))
        const wFields = await box(wide.locator('[data-slot="form-section-fields"]'))
        expect(wHead.x + wHead.width <= wFields.x && Math.abs(wHead.y - wFields.y) < 1, "in a wide section the title sits beside the fields")
      },
    },
    {
      name: "The title is a heading at the level asked",
      async run({ page, expect }) {
        expect.equal(await page.getByRole("heading", { level: 2, name: "Billing" }).count(), 1, "the default level")
        expect.equal(await page.getByRole("heading", { level: 3, name: "Notifications" }).count(), 1, "headingLevel 3")
      },
    },
    {
      name: "The fields sit in a card with the system's corners, hairline and shadow, in both themes",
      example: "split",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const [radius, token, border, line, shadow] = await scope.locator('[data-slot="form-section-fields"]').evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.borderColor = "var(--line)"
          el.append(probe)
          const s = getComputedStyle(el)
          const out = [s.borderTopLeftRadius, getComputedStyle(document.documentElement).getPropertyValue("--radius-md").trim(), s.borderTopWidth, s.borderTopColor === getComputedStyle(probe).borderTopColor, s.boxShadow]
          probe.remove()
          return out
        })
        expect.equal(radius, token, "corner radius against radius-md")
        expect.equal(border, "1px", "the hairline")
        expect(line, "the hairline is the line role")
        expect(shadowShows(shadow), "the card's shadow")
      },
    },
    {
      name: "Inside a card it draws no second card",
      example: "in-card",
      async run({ scope, expect }) {
        const [border, shadow] = await scope.locator('[data-slot="form-section-fields"]').evaluate((el) => [getComputedStyle(el).borderTopWidth, getComputedStyle(el).boxShadow])
        expect.equal(border, "0px", "the inner box's border")
        expect(!shadowShows(shadow), "the inner box has no shadow")
      },
    },
  ],
}
