// Pagination's one definition. The first example keeps its page in the board's state.
const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement)
const range = (scope) => scope.getByRole("status").innerText()

export default {
  name: "Pagination",
  group: "Data",
  job: "The footer of a long table: where you are, in words, with previous and next.",
  status: "proven",
  props: [
    { name: "page", type: "number", doc: "The current page, from 1. Keep it in the URL." },
    { name: "pageSize", type: "number", default: "25", doc: "Rows per page. Keep the size the person chose." },
    { name: "total", type: "number", doc: "Rows across every page." },
    { name: "onPage", type: "(page: number) => void", doc: "Called with the page to show." },
  ],
  notes: {
    Behaviour: [
      "Previous and Next are buttons: Tab reaches them, Enter or Space moves a page, and focus stays where it was.",
      "At either end the button stays focusable and says it is unavailable, so focus never drops to the page.",
      'Where you are is a polite status, "26 to 50 of 312": read out when the page changes, never on load.',
    ],
    Layout: [
      "The count on the left, the buttons at the far end. In a narrow footer the buttons wrap under the count, still at the end.",
      "40px targets on a touch screen, 8px apart.",
    ],
    Copy: ['"1 to 25 of 312", in the formatter\'s numbers. "No results" at zero.'],
    Rules: [
      "No buttons when everything fits on one page.",
      "Prefer filters and search to deep paging. Keep the page size the person chose, and keep the page in the URL.",
    ],
  },
  frame: { width: 960, height: 600 },
  state: { page: 1 },
  logic: `tablePage: self.state.page,
setTablePage: (page) => self.setState({ page })`,
  examples: [
    {
      id: "footer",
      title: "In a table footer",
      layout: "block",
      markup: `<div class="max-w-2xl rounded-md border border-line bg-surface-subtle px-4 py-3"><x-import component-from-global-scope="NS.Pagination" page="{{tablePage}}" total="{{t312}}" on-page="{{setTablePage}}"></x-import></div>`,
      vals: { t312: 312 },
    },
    {
      id: "last",
      title: "The last page",
      layout: "block",
      markup: `<div class="max-w-2xl"><x-import component-from-global-scope="NS.Pagination" page="{{p125}}" total="{{t3120}}"></x-import></div>`,
      vals: { p125: 125, t3120: 3120 },
    },
    {
      id: "one-page",
      title: "Everything on one page",
      layout: "block",
      markup: `<div class="max-w-2xl"><x-import component-from-global-scope="NS.Pagination" page="{{p1}}" total="{{t7}}"></x-import></div>`,
      vals: { p1: 1, t7: 7 },
    },
    {
      id: "none",
      title: "No results",
      layout: "block",
      markup: `<div class="max-w-2xl"><x-import component-from-global-scope="NS.Pagination" page="{{p1}}" total="{{t0}}"></x-import></div>`,
      vals: { t0: 0 },
    },
    {
      id: "narrow",
      title: "A narrow footer",
      layout: "block",
      markup: `<div style="width: 260px"><x-import component-from-global-scope="NS.Pagination" page="{{p2}}" total="{{t3120}}"></x-import></div>`,
      vals: { p2: 2 },
    },
  ],
  checks: [
    {
      name: "By keyboard: Tab reaches Next, Enter moves a page, and focus stays put",
      example: "footer",
      async run({ page, scope, expect }) {
        const next = scope.getByRole("button", { name: "Next" })
        for (let i = 0; i < 10 && !(await isFocused(next)); i++) await page.keyboard.press("Tab")
        expect(await isFocused(next), "Tab reaches Next")
        await page.keyboard.press("Enter")
        expect.equal(await range(scope), "26 to 50 of 312", "the range after Enter")
        expect(await isFocused(next), "focus stays on Next")
        await page.keyboard.press("Space")
        expect.equal(await range(scope), "51 to 75 of 312", "the range after Space")
        await page.keyboard.press("Shift+Tab")
        expect(await isFocused(scope.getByRole("button", { name: "Previous" })), "Shift Tab reaches Previous")
        await page.keyboard.press("Enter")
        expect.equal(await range(scope), "26 to 50 of 312", "the range after going back")
      },
    },
    {
      name: "At the last page Next stays focusable, says it is unavailable and does nothing",
      example: "last",
      async run({ page, scope, expect }) {
        const next = scope.getByRole("button", { name: "Next" })
        expect.equal(await next.getAttribute("aria-disabled"), "true", "Next is unavailable")
        await next.focus()
        await page.keyboard.press("Enter")
        expect.equal(await range(scope), "3,101 to 3,120 of 3,120", "the range, through the formatter")
        expect(await isFocused(next), "focus stays on Next")
      },
    },
    {
      name: "It says where you are in words, and shows no buttons it does not need",
      async run({ page, expect }) {
        const at = (ex) => page.locator(`[data-example="${ex}"]`)
        expect.equal(await at("footer").getByRole("status").innerText(), "1 to 25 of 312", "the first page")
        expect.equal(await at("footer").getByRole("navigation", { name: "Pagination" }).count(), 1, "a navigation landmark named Pagination")
        expect.equal(await at("one-page").getByRole("status").innerText(), "1 to 7 of 7", "everything on one page")
        expect.equal(await at("one-page").getByRole("button").count(), 0, "buttons when everything fits")
        expect.equal(await at("none").getByRole("status").innerText(), "No results", "at zero")
        expect.equal(await at("none").getByRole("button").count(), 0, "buttons at zero")
      },
    },
    {
      name: "On a touch screen the buttons are 40px, 8px apart",
      example: "footer",
      touch: true,
      async run({ scope, expect }) {
        const prev = await scope.getByRole("button", { name: "Previous" }).boundingBox()
        const next = await scope.getByRole("button", { name: "Next" }).boundingBox()
        expect.atLeast(Math.round(prev.height), 40, "Previous on touch")
        expect.atLeast(Math.round(next.height), 40, "Next on touch")
        expect.atLeast(Math.round(next.x - (prev.x + prev.width)), 8, "space between them")
      },
    },
    {
      name: "In a narrow footer the buttons wrap under the count and stay inside it",
      example: "narrow",
      async run({ scope, expect }) {
        const nav = await scope.getByRole("navigation").boundingBox()
        const count = await scope.getByRole("status").boundingBox()
        const next = await scope.getByRole("button", { name: "Next" }).boundingBox()
        expect(next.y >= count.y + count.height, "the buttons sit under the count")
        expect(next.x + next.width <= nav.x + nav.width + 0.5, "Next stays inside the footer")
      },
    },
  ],
}
