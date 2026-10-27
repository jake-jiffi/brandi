// ErrorSummary's one definition. The board's fields are the system's Field and TextInput, wired by id.
const field = (id, label, error) => `<x-import component-from-global-scope="NS.Field" label="${label}"${error ? ` error="${error}"` : ""}>
<x-import component-from-global-scope="NS.TextInput" id="${id}" name="${id}" autocomplete="off"></x-import>
</x-import>`
const saveField = (id, label, key) => `<x-import component-from-global-scope="NS.Field" label="${label}" error="{{${key}}}">
<x-import component-from-global-scope="NS.TextInput" id="${id}" name="${id}" autocomplete="off"></x-import>
</x-import>`

const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement)
async function until(test, ms = 2000) {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 25))) if (await test()) return true
  return false
}

export default {
  name: "ErrorSummary",
  group: "Forms",
  job: "After a failed save: a titled list of what stopped it, each line a link to its field.",
  status: "proven",
  props: [
    { name: "title", type: "string", default: '"Fix these and try again"', doc: "Its heading, and its accessible name." },
    { name: "errors", type: "{ id: string; message: string }[]", doc: "One per problem: the id of its control, and the message its field shows, word for word. Empty renders nothing." },
    { name: "autoFocus", type: "boolean", default: "true", doc: "Takes focus when it appears and whenever the errors change, so a screen reader reads it first." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "The title's heading level. Its size follows the level, as a Card's does." },
  ],
  notes: {
    Behaviour: [
      "Takes focus when it appears (role alert, tabIndex -1, named by its title), so a screen reader reads it first and the keyboard is one Tab from the first problem.",
      "Each line is a link that focuses its control, the first inside a group, with the label scrolled into view. The address stays as it was.",
      "Another failed save with different errors takes focus again. A re-render with the same errors does not.",
    ],
    Copy: [
      'The title says what to do: "Fix these and try again". Each line says what is wrong and how to fix it: "Enter an ABN with 11 digits".',
    ],
    Rules: [
      "For forms longer than about five fields, or whenever a failed save leaves an error out of view. Short forms need only their Field errors.",
      "Each message matches its Field error word for word. Keep everything the person typed.",
      "Give it new errors on save, never while the person types: every new set takes focus.",
      "The summary goes on the next successful save. Never a character on a form error: the mistake is the person's, so the field says it plainly.",
    ],
  },
  frame: { width: 960, height: 900 },
  state: { saved: false },
  logic: `saved: self.state.saved,
save: () => self.setState({ saved: true }),
contactNameError: self.state.saved ? "Enter the contact's name" : "",
contactPhoneError: self.state.saved ? "Enter a phone number, like 0400 000 000" : ""`,
  examples: [
    {
      id: "failed",
      title: "After a failed save",
      layout: "block",
      markup: `<div class="flex max-w-lg flex-col gap-5">
<x-import component-from-global-scope="NS.ErrorSummary" errors="{{failedErrors}}"></x-import>
${field("billing-name", "Business name")}
${field("billing-abn", "ABN", "Enter an ABN with 11 digits")}
${field("billing-email", "Billing email", "Enter an email address, like name@example.com")}
</div>`,
      vals: {
        failedErrors: [
          { id: "billing-abn", message: "Enter an ABN with 11 digits" },
          { id: "billing-email", message: "Enter an email address, like name@example.com" },
        ],
      },
    },
    {
      id: "save",
      title: "Press save, and it takes focus",
      layout: "block",
      markup: `<div class="flex max-w-lg flex-col gap-5">
<sc-if value="{{saved}}"><x-import component-from-global-scope="NS.ErrorSummary" errors="{{saveErrors}}"></x-import></sc-if>
${saveField("contact-name", "Contact name", "contactNameError")}
${saveField("contact-phone", "Phone", "contactPhoneError")}
<x-import component-from-global-scope="NS.FormActions"><x-import component-from-global-scope="NS.Button" variant="primary" on-click="{{save}}">Save contact</x-import></x-import>
</div>`,
      vals: {
        saveErrors: [
          { id: "contact-name", message: "Enter the contact's name" },
          { id: "contact-phone", message: "Enter a phone number, like 0400 000 000" },
        ],
      },
    },
  ],
  checks: [
    {
      name: "It is an alert named by its title, and focusable from script only",
      example: "failed",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("alert", { name: "Fix these and try again" }).count(), 1, "an alert named by its title")
        expect.equal(await scope.locator('[data-slot="error-summary"]').getAttribute("tabindex"), "-1", "its tabindex")
      },
    },
    {
      name: "Pressing save makes it appear and take focus, one Tab from the first problem",
      example: "save",
      async run({ page, scope, expect }) {
        const save = scope.getByRole("button", { name: "Save contact" })
        await save.focus()
        await page.keyboard.press("Enter")
        const summary = scope.locator('[data-slot="error-summary"]')
        expect(await until(() => summary.count().then((n) => n === 1 && isFocused(summary))), "the summary appears with focus")
        await page.keyboard.press("Tab")
        expect(await isFocused(scope.getByRole("link", { name: "Enter the contact's name" })), "one Tab reaches the first problem")
        await page.keyboard.press("Enter")
        expect.equal(await page.evaluate(() => document.activeElement?.id), "contact-name", "Enter on the link focuses its field")
      },
    },
    {
      name: "Every link focuses its own field, and the address stays put",
      example: "failed",
      async run({ page, scope, expect }) {
        const before = page.url()
        for (const link of await scope.locator('[data-slot="error-summary-link"]').all()) {
          const id = (await link.getAttribute("href")).slice(1)
          await link.focus()
          await page.keyboard.press("Enter")
          expect.equal(await page.evaluate(() => document.activeElement?.id), id, "the focused field")
        }
        expect.equal(page.url(), before, "the address after following the links")
      },
    },
    {
      name: "Each message matches its field's error word for word",
      example: "failed",
      async run({ scope, expect }) {
        for (const link of await scope.locator('[data-slot="error-summary-link"]').all()) {
          const id = (await link.getAttribute("href")).slice(1)
          // Field names its error by its own id, and points the control at it.
          const describedBy = await scope.locator(`#${id}`).getAttribute("aria-describedby")
          expect.equal((await scope.locator(`[id="${describedBy}"]`).innerText()).trim(), (await link.innerText()).trim(), `the error under ${id}`)
        }
      },
    },
  ],
}
