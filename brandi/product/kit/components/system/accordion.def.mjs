// Accordion's one definition: its README, its preview board and its scripted checks all come from here.

const FAQ = [
  { id: "billing", title: "How do I change the billing contact?", content: "Go to Settings, then Billing, and choose Change contact. The new contact gets the next invoice, and the old one gets a copy of the change." },
  { id: "invoices", title: "When are invoices sent?", content: "On the first business day of each month, at 9:00 am in your time zone. Each one is also in Billing, under Invoices." },
  { id: "export", title: "Can I export my records?", content: "Yes. Every table has Export, which downloads the rows you can see as a CSV file." },
  { id: "access", title: "Who can see [Northside Plumbing]'s records?", content: "[Team members] with access to the [Northside] workspace, and anyone an owner invites." },
]

async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}
const focused = (locator) => locator.evaluate((el) => document.activeElement === el)

export default {
  name: "Accordion",
  group: "Navigation",
  job: "Sections that open and close in place: help, frequently asked questions, long settings.",
  status: "to build",
  props: [
    { name: "items", type: "{ id: string; title: string; content: ReactNode }[]", doc: "The sections, as data. A string's content becomes a paragraph capped at the measure." },
    { name: "defaultOpen", type: "string[]", doc: "The ids of the sections open at first." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", doc: "Each section header's heading level, so no page skips one." },
  ],
  notes: {
    Behaviour: [
      "Each header is a button with aria-expanded inside a heading, and controls a region named by it.",
      "Enter or Space opens and closes a section. Down and Up move between headers, Home and End go to the first and last.",
      "Opening one section leaves the others as they were.",
    ],
    Layout: [
      "Headers are at least 48px tall on every screen and wrap long titles. They sit a full type step above the content, which is set at the reading size and capped at the measure.",
    ],
    States: [
      "Closed and open. Reduced motion: a section appears and goes at once, and the chevron flips without turning.",
      "Forced colours: focus is the system outline.",
    ],
    Copy: ["A header is the question people ask, or a noun phrase for settings. The content answers it in a sentence or two."],
    Rules: [
      "For content people scan for one answer. Content everyone needs stays open on the page.",
      "Moving between views is Tabs; steps in order are a Stepper.",
    ],
  },
  examples: [
    {
      id: "faq",
      title: "Frequently asked questions, the first open",
      layout: "block",
      width: 620,
      markup: `<x-import component-from-global-scope="NS.Accordion" items="{{faq}}" default-open="{{first}}"></x-import>`,
      vals: { faq: FAQ, first: ["billing"] },
    },
  ],
  frame: { width: 960, height: 460 },
  checks: [
    {
      name: "Each header is a button with aria-expanded inside a heading at the given level",
      example: "faq",
      async run({ scope, expect }) {
        const headings = scope.getByRole("heading", { level: 3 })
        expect.equal(await headings.count(), 4, "four level 3 headings")
        const first = headings.first().getByRole("button")
        expect.equal(await first.getAttribute("aria-expanded"), "true", "the first section is open")
        expect.equal(await headings.nth(1).getByRole("button").getAttribute("aria-expanded"), "false", "the second is closed")
        const region = scope.getByRole("region", { name: "How do I change the billing contact?" })
        expect(await region.isVisible(), "the open section is a region named by its header")
      },
    },
    {
      name: "Enter and Space open and close a section, and opening one leaves the others as they were",
      example: "faq",
      async run({ page, scope, expect }) {
        const second = scope.getByRole("button", { name: "When are invoices sent?" })
        expect(await tabTo(page, second), "Tab reaches the second header")
        await page.keyboard.press("Enter")
        expect.equal(await second.getAttribute("aria-expanded"), "true", "Enter opens it")
        expect.equal(await scope.getByRole("button", { name: "How do I change the billing contact?" }).getAttribute("aria-expanded"), "true", "the first stays open")
        await page.keyboard.press("Space")
        expect.equal(await second.getAttribute("aria-expanded"), "false", "Space closes it")
        expect(await focused(second), "focus stays on the header")
      },
    },
    {
      name: "Down and Up move between headers, and Home and End go to the ends",
      example: "faq",
      async run({ page, scope, expect }) {
        const headers = scope.locator('[data-slot="accordion-trigger"]')
        expect(await tabTo(page, headers.first()), "Tab reaches the first header")
        await page.keyboard.press("ArrowDown")
        expect(await focused(headers.nth(1)), "Down moves to the next header")
        await page.keyboard.press("End")
        expect(await focused(headers.nth(3)), "End goes to the last")
        await page.keyboard.press("ArrowUp")
        expect(await focused(headers.nth(2)), "Up moves back")
        await page.keyboard.press("Home")
        expect(await focused(headers.first()), "Home goes to the first")
      },
    },
    {
      name: "Under reduced motion a section opens at once",
      example: "faq",
      reducedMotion: true,
      async run({ scope, expect }) {
        await scope.getByRole("button", { name: "Can I export my records?" }).click()
        const content = scope.locator('[data-slot="accordion-content"][data-state="open"]').last()
        expect.equal(await content.evaluate((el) => getComputedStyle(el).animationName), "none", "no height animation")
        expect.equal(await scope.locator('[data-slot="accordion-trigger-icon"]').first().evaluate((el) => getComputedStyle(el).transitionDuration), "0s", "the chevron turns without moving")
      },
    },
    {
      name: "Headers are at least 48px tall, on a touch screen too",
      example: "faq",
      touch: true,
      async run({ scope, expect }) {
        for (const header of await scope.locator('[data-slot="accordion-trigger"]').all()) {
          expect.atLeast(Math.round((await header.boundingBox()).height), 48, "header height")
        }
      },
    },
    {
      name: "Focus shows the system's outline, in both themes",
      example: "faq",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const first = scope.locator('[data-slot="accordion-trigger"]').first()
        expect(await tabTo(page, first), "Tab reaches the first header")
        expect.equal(await first.evaluate((el) => getComputedStyle(el).outlineStyle), "solid", "outline when focused from the keyboard")
      },
    },
    {
      name: "Forced colours keep the focus outline, and no header wears one at rest",
      example: "faq",
      forcedColors: true,
      async run({ page, scope, expect }) {
        const headers = scope.locator('[data-slot="accordion-trigger"]')
        expect.equal(await headers.nth(1).evaluate((el) => getComputedStyle(el).outlineStyle), "none", "no outline at rest")
        expect(await tabTo(page, headers.first()), "Tab reaches the first header")
        const ring = await headers.first().evaluate((el) => `${getComputedStyle(el).outlineStyle} ${getComputedStyle(el).outlineWidth}`)
        expect.equal(ring, "solid 2px", "the system outline on focus")
      },
    },
  ],
}
