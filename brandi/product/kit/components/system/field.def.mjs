// Field's one definition: its README, its preview board and its scripted checks all come from here.

// The board lays fields out three to a row, as a form would.
const row = (inner) => `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`

// A plain input, styled like the system's, to prove the Field wires markup it does not own.
const PLAIN = "h-9 w-full min-w-0 rounded-control border border-line-control bg-surface px-3 type-body text-text placeholder:text-text-subtle focus-visible:border-focus focus-visible:shadow-[0_0_0_1px_var(--focus)] focus-visible:outline-hidden"

export default {
  name: "Field",
  group: "Inputs",
  job: "One control with its label above it, an optional marker, a hint and an error, wired together.",
  status: "proven",
  props: [
    { name: "label", type: "ReactNode", doc: "A noun in sentence case, with no colon." },
    { name: "hint", type: "ReactNode", doc: "The format, or why it matters. An error replaces it." },
    { name: "error", type: "ReactNode", doc: "What is wrong and how to fix it. Set it when the person leaves the field or saves, never while they type." },
    { name: "optional", type: "boolean", default: "false", doc: "Shows (optional) after the label. Mark optional fields, not required ones." },
    { name: "required", type: "boolean", default: "false", doc: "Sets required and aria-required on the control, with no visible marker." },
    { name: "htmlFor", type: "string", doc: "The id to give the control. A control that already has an id keeps it, and the label follows it." },
    { name: "children", type: "ReactNode", doc: "One control: TextInput, TextArea, Select, NumberInput, or plain markup." },
  ],
  notes: {
    Behaviour: [
      "Gives the control its id, aria-describedby, invalid and required, and keeps an id the control already has, so an ErrorSummary can link to it.",
      "Finds the control inside whatever wraps it. A canvas wraps every mounted component in a plain element, and a library's control or plain markup is wired the same way.",
      "Clicking the label focuses the control. A Select is focused, not opened, as a native select is.",
      "A screen reader hears the label, the control, then the hint, or the error in its place. Required is read as required.",
      "The error is announced through a polite live region that is there from the start, so it speaks when an error appears and never for the state the page loads in.",
    ],
    Layout: ["The label sits 6px above the control, the hint or error 6px below. Size the control inside with max-w-*: the Field fills its column."],
    Copy: [
      "Labels are nouns in sentence case with no colon: Invoice email, Purchase order.",
      "Hints give the format or why it matters: 11 digits, from the [business] registration.",
      "Errors say what is wrong and how to fix it: Enter an ABN with 11 digits.",
    ],
    Rules: [
      "Labels go above fields. Mark optional fields, not required ones.",
      "An error replaces the hint, carries an icon as well as colour, and appears when the person leaves the field or saves, never while they type.",
      "A read-only value says where it comes from and where to change it, in the hint.",
    ],
    Review: ["A settings field validated only on save, and field errors gained their icon (round 4)."],
  },
  examples: [
    {
      id: "basics",
      title: "Label, hint and the optional marker",
      layout: "block",
      markup: row(`<x-import component-from-global-scope="NS.Field" label="Invoice email" hint="Invoices and receipts go here.">
<x-import component-from-global-scope="NS.TextInput" type="email" autocomplete="email" placeholder="[name]@example.com"></x-import>
</x-import>
<x-import component-from-global-scope="NS.Field" label="Purchase order" optional="{{yes}}">
<x-import component-from-global-scope="NS.TextInput" id="purchase-order" placeholder="[PO-1042]"></x-import>
</x-import>
<x-import component-from-global-scope="NS.Field" label="Legal name" required="{{yes}}" hint="As it appears on the [business] registration.">
<x-import component-from-global-scope="NS.TextInput" autocomplete="organization"></x-import>
</x-import>`),
      vals: { yes: true },
    },
    {
      id: "states",
      title: "Error, read-only and disabled",
      layout: "block",
      markup: row(`<x-import component-from-global-scope="NS.Field" label="ABN" error="Enter an ABN with 11 digits">
<x-import component-from-global-scope="NS.TextInput" inputmode="numeric" default-value="51 824 753"></x-import>
</x-import>
<x-import component-from-global-scope="NS.Field" label="Payroll ID" hint="Set in [payroll system]. Change it there.">
<x-import component-from-global-scope="NS.TextInput" readonly="{{yes}}" default-value="[PR-20391]"></x-import>
</x-import>
<x-import component-from-global-scope="NS.Field" label="Cost centre" hint="Only finance can change this.">
<x-import component-from-global-scope="NS.TextInput" disabled="{{yes}}" default-value="[Operations]"></x-import>
</x-import>`),
    },
    {
      id: "wrapper",
      title: "Any control, found inside its wrapper",
      layout: "block",
      markup: row(`<x-import component-from-global-scope="NS.Field" label="Category" hint="Sets the account it posts to.">
<x-import component-from-global-scope="NS.Select" placeholder="Choose a [category]" options="{{categories}}"></x-import>
</x-import>
<x-import component-from-global-scope="NS.Field" label="Quantity" hint="From 1 to 99.">
<x-import component-from-global-scope="NS.NumberInput" min="{{one}}" max="{{ninetyNine}}" default-value="{{three}}"></x-import>
</x-import>
<x-import component-from-global-scope="NS.Field" label="Reference" hint="Plain markup, wired by the Field." required="{{yes}}">
<div data-plain=""><input class="${PLAIN}" placeholder="[INV-0042]"></div>
</x-import>`),
      vals: { categories: ["Travel", "Meals", "Equipment", "Software"], one: 1, ninetyNine: 99, three: 3 },
    },
    {
      id: "blur",
      title: "Checked when the person leaves the field",
      layout: "block",
      markup: row(`<x-import component-from-global-scope="NS.Field" label="Mobile" hint="10 digits, starting 04." error="{{mobileError}}">
<x-import component-from-global-scope="NS.TextInput" type="tel" inputmode="numeric" autocomplete="tel" on-blur="{{checkMobile}}"></x-import>
</x-import>
<x-import component-from-global-scope="NS.Field" label="Postcode">
<x-import component-from-global-scope="NS.TextInput" inputmode="numeric" autocomplete="postal-code"></x-import>
</x-import>`),
    },
  ],
  state: { mobileError: "" },
  logic:
    'mobileError: self.state.mobileError, checkMobile: (event) => self.setState({ mobileError: /^04\\d{8}$/.test(event.target.value.replace(/\\s/g, "")) ? "" : "Enter a mobile number with 10 digits, starting 04" })',
  frame: { width: 960, height: 600 },
  checks: [
    {
      name: "Clicking the label focuses the control: an input, a Select (not opened) and plain markup",
      example: "wrapper",
      async run({ page, scope, expect }) {
        await scope.getByText("Category", { exact: true }).click()
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("role")), "combobox", "the Select's trigger has focus")
        expect.equal(await page.getByRole("listbox").count(), 0, "the list stays closed")
        await scope.getByText("Reference", { exact: true }).click()
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("placeholder")), "[INV-0042]", "the plain input has focus")
        await page.locator('[data-example="basics"]').getByText("Invoice email", { exact: true }).click()
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("type")), "email", "the email input has focus")
      },
    },
    {
      name: "The Field finds its control inside the wrapper and gives it an id, the hint and required",
      example: "wrapper",
      async run({ scope, expect }) {
        const wired = await scope.evaluate((root) =>
          [...root.querySelectorAll('[data-slot="field"]')].map((field) => {
            const label = field.querySelector('[data-slot="label"]')
            const control = document.getElementById(label.getAttribute("for"))
            const hint = field.querySelector('[data-slot="field-hint"]')
            const wrapper = control?.closest("[data-x-import], [data-plain]")
            return {
              found: Boolean(control) && field.contains(control),
              wrapped: Boolean(wrapper) && field.contains(wrapper) && wrapper !== control,
              described: (control?.getAttribute("aria-describedby") ?? "").split(" ").includes(hint?.id),
            }
          })
        )
        expect.equal(wired.length, 3, "three fields")
        for (const [i, w] of wired.entries()) {
          expect(w.found, `field ${i + 1}: the label points at the control inside it`)
          expect(w.wrapped, `field ${i + 1}: the control sits inside a wrapper element`)
          expect(w.described, `field ${i + 1}: the control is described by the hint`)
        }
        const plain = scope.locator("[data-plain] input")
        expect.equal(await plain.getAttribute("aria-required"), "true", "the plain input is required for screen readers")
        expect(await plain.evaluate((el) => el.required), "and for the browser")
      },
    },
    {
      name: "A control that has its own id keeps it, and the label follows, so an ErrorSummary can link to it",
      example: "basics",
      async run({ page, scope, expect }) {
        const po = scope.getByRole("textbox", { name: "Purchase order" })
        expect.equal(await po.getAttribute("id"), "purchase-order", "the control keeps its id")
        expect.equal(await scope.locator('[data-slot="label"]', { hasText: "Purchase order" }).getAttribute("for"), "purchase-order", "the label points at it")
        await page.evaluate(() => document.getElementById("purchase-order").focus())
        expect(await po.evaluate((el) => document.activeElement === el), "a link to #purchase-order lands in the field")
      },
    },
    {
      name: "Required sets required and aria-required with no visible marker; optional says so",
      example: "basics",
      async run({ scope, expect }) {
        const legal = scope.getByRole("textbox", { name: "Legal name" })
        expect.equal(await legal.getAttribute("aria-required"), "true", "aria-required")
        expect(await legal.evaluate((el) => el.required), "required")
        const label = await scope.getByText("Legal name", { exact: true }).evaluate((el) => el.textContent)
        expect(!/[*]|required/i.test(label), "no visible marker on the required label")
        expect(await scope.getByText("(optional)").isVisible(), "the optional field says (optional)")
      },
    },
    {
      name: "An error replaces the hint, carries an icon, and is read with the control",
      example: "states",
      async run({ scope, expect }) {
        const abn = scope.getByRole("textbox", { name: "ABN" })
        expect.equal(await abn.getAttribute("aria-invalid"), "true", "the control is invalid")
        const read = await abn.evaluate((el) => (el.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent?.trim()).join(" "))
        expect.equal(read, "Enter an ABN with 11 digits", "the control is described by the error alone")
        const error = scope.locator('[data-slot="field-error"]')
        expect.equal(await error.locator("svg").count(), 1, "the error carries an icon")
        expect.equal(await error.evaluate((el) => el.closest("[aria-live]")?.getAttribute("aria-live")), "polite", "inside a polite live region")
      },
    },
    {
      name: "An error appears when the person leaves the field, never while they type, and is announced",
      example: "blur",
      async run({ page, scope, expect }) {
        const mobile = scope.getByRole("textbox", { name: "Mobile" })
        const region = scope.locator('[data-slot="field"]').first().locator('[data-slot="field-message"]')
        expect.equal(await region.getAttribute("aria-live"), "polite", "a polite live region is there before any error")
        await mobile.click()
        await page.keyboard.type("0412 34")
        expect.equal((await region.textContent()).trim(), "", "nothing while they type")
        expect.equal(await mobile.getAttribute("aria-invalid"), null, "not invalid while they type")
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("autocomplete")), "postal-code", "Tab moved on to the next field")
        expect.equal((await region.textContent()).trim(), "Enter a mobile number with 10 digits, starting 04", "the error appears in the live region on leaving")
        expect.equal(await mobile.getAttribute("aria-invalid"), "true", "the control is invalid")
        await mobile.fill("0412 345 678")
        await page.keyboard.press("Tab")
        expect.equal((await region.textContent()).trim(), "", "a fixed value clears the error on leaving")
      },
    },
    {
      name: "Read-only shows a dashed edge and a lock; disabled keeps its hint saying why",
      example: "states",
      async run({ scope, expect }) {
        const payroll = scope.getByRole("textbox", { name: "Payroll ID" })
        expect(await payroll.evaluate((el) => el.readOnly), "read-only")
        expect.equal(await payroll.evaluate((el) => getComputedStyle(el.closest('[data-slot="text-input"]')).borderTopStyle), "dashed", "a dashed edge")
        expect.equal(await payroll.evaluate((el) => el.closest('[data-slot="text-input"]').querySelectorAll('[data-icon="Lock"]').length), 1, "a lock")
        const cost = scope.getByRole("textbox", { name: "Cost centre" })
        expect(await cost.isDisabled(), "disabled")
        const why = await cost.evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent)
        expect.equal(why, "Only finance can change this.", "the hint says why")
      },
    },
  ],
}
