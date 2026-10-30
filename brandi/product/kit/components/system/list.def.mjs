// List's one definition: its README, its preview board and its scripted checks all come from here.

const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)
/** A role's value as the browser computes it in the current theme. */
const roleValue = (page, role, prop) =>
  page.evaluate(([r, p]) => {
    const probe = document.createElement("span")
    probe.style[p] = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe)[p]
    probe.remove()
    return value
  }, [role, prop])

const inbox = [
  { id: "1", avatar: "[Priya Nair]", title: "[Priya Nair]", meta: "Timesheet for [3 to 9 June] · [38.5 h]", badge: { label: "Needs you", tone: "highlight" }, href: "#inbox-1", unread: true },
  { id: "2", avatar: "[Marcus Chen]", title: "[Marcus Chen]", meta: "Leave from [14 July] · [3] days", badge: { label: "Needs you", tone: "highlight" }, href: "#inbox-2" },
  { id: "3", icon: "Receipt", title: "Invoice [1042]", meta: "[Harbour Physio] · due [Friday]", trailing: "[$4,280.00]", href: "#inbox-3" },
  { id: "4", icon: "Receipt", title: "Invoice [1039]", meta: "[Coastal Dental] · paid [2 June]", badge: { label: "Paid", tone: "success" }, href: "#inbox-4" },
]
const waiting = [
  { id: "w1", avatar: "[Priya Nair]", title: "[Priya Nair]", meta: "Timesheet · waiting [2] days", badge: { label: "Needs you", tone: "highlight" }, href: "#waiting-1" },
  { id: "w2", avatar: "[Ana Silva]", title: "[Ana Silva]", meta: "Expense claim · [$86.40]", badge: { label: "Needs you", tone: "highlight" }, href: "#waiting-2" },
  { id: "w3", icon: "CalendarClock", title: "Tomorrow's roster", meta: "[2] shifts have nobody on them", chevron: true, href: "#waiting-3" },
]
const notes = [
  { id: "n1", icon: "Info", title: "Pay day moves to [Wednesday]", meta: "The bank is closed on [Thursday 25 April]." },
  { id: "n2", icon: "ShieldCheck", title: "Two-step sign in is on", meta: "Turned on by [Sam Lee] on [3 June]." },
]

export default {
  name: "List",
  group: "Data",
  job: "A column of ListRows: records on phones, inboxes, queues, and the left pane of list and detail.",
  status: "proven",
  props: [
    { name: "items", type: "Array<ListRowProps & { id?: string | number }>", doc: "The rows as data, which a canvas needs: ListRow's props, and an id that keeps a row steady. ListRows as children work too." },
    { name: "boxed", type: "boolean", default: "true", doc: "The surface, a hairline and radius-md around the rows. Inside a card the card is the box, so it draws none." },
    { name: "divided", type: "boolean", default: "true", doc: "Hairlines between rows." },
    { name: "loading", type: "boolean", default: "false", doc: "The rows wait as skeletons, and the list says it is loading, once." },
    { name: "loadingRows", type: "number", default: "3", doc: "How many skeleton rows stand in." },
    { name: "loadingLeading", type: '"avatar" | "icon" | "none"', doc: "What leads each skeleton row: the rows' avatar, their icon tile, or nothing. Taken from the items when there are any, nothing otherwise." },
    { name: "empty", type: "ReactNode | { title: ReactNode; description?: ReactNode; actions?: FeedbackAction[] }", default: '"Nothing to show yet."', doc: "What an empty list says: a sentence, the same as data, or an EmptyState." },
    { name: "error", type: "ReactNode | { title: ReactNode; description?: ReactNode; actions?: FeedbackAction[] }", doc: "What it says when its rows could not load, naming the system: a sentence, the same as data, or an EmptyState." },
    { name: "onRetry", type: "() => void", doc: "Adds Try again to the error." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", doc: "The level of an empty or error state's title." },
    { name: "children", type: "ReactNode", doc: "ListRows, in product code." },
  ],
  notes: {
    Behaviour: [
      "A list, and its rows list items, so a screen reader says how many there are and where each one sits.",
      "Each row that opens a record is one tab stop. Tab moves row to row, through any control a row carries.",
      "Loading says so once, through a polite status; the skeleton rows are hidden from screen readers.",
    ],
    Layout: [
      "Boxed: the surface, a hairline and radius-md, with hairlines between rows. The first and last rows round their corners to the box, so a tint never squares them off.",
      "Inside a card the card is the box: the list draws none, so there is never a card inside a card, and its rows line up with the card's 24px inset.",
      "Rows wrap under 480px of the list's own width (ListRow).",
    ],
    States: [
      "Loading: skeleton rows in the rows' shape, an avatar and two lines.",
      "Empty: what is empty, in place of the rows. Could not load: which system failed, in place of the rows, with Try again when onRetry is given.",
    ],
    Copy: ['Empty says what is empty: "Nothing is waiting on you." Could not load names the system: "[Payroll system] is not responding."'],
    Rules: [
      "Records on a phone, an inbox, a queue, the left pane of list and detail. Records people compare across columns are a DataTable.",
      "Take the rows as items on a canvas: a row mounted on its own inside a list is not a list item.",
    ],
  },
  frame: { width: 960, height: 1720 },
  state: { retried: 0 },
  logic: `retry: () => self.setState({ retried: self.state.retried + 1 }),
retriedLine: self.state.retried ? "Tried again " + self.state.retried + (self.state.retried === 1 ? " time." : " times.") : "Not tried again yet."`,
  examples: [
    {
      id: "boxed",
      title: "Boxed and divided, the default",
      layout: "block",
      markup: `<div class="max-w-xl"><x-import component-from-global-scope="NS.List" items="{{inbox}}"></x-import></div>`,
      vals: { inbox },
    },
    {
      id: "in-card",
      title: "Inside a card, the card is the box",
      layout: "block",
      markup: `<div class="max-w-md"><x-import component-from-global-scope="NS.Card" title="Waiting on you" description="Oldest first." flush="{{yes}}"><x-import component-from-global-scope="NS.List" items="{{waiting}}"></x-import></x-import></div>`,
      vals: { waiting, yes: true },
    },
    {
      id: "plain",
      title: "Unboxed, in a pane",
      layout: "block",
      markup: `<div class="max-w-md"><x-import component-from-global-scope="NS.List" items="{{notes}}" boxed="{{no}}"></x-import></div>`,
      vals: { notes, no: false },
    },
    {
      id: "loading",
      title: "Loading",
      layout: "block",
      markup: `<div class="flex max-w-3xl flex-wrap items-start gap-6"><div class="w-80"><x-import component-from-global-scope="NS.List" loading="{{yes}}"></x-import></div><div class="w-80"><x-import component-from-global-scope="NS.List" loading="{{yes}}" loading-leading="avatar"></x-import></div></div>`,
    },
    {
      id: "empty",
      title: "Empty",
      layout: "block",
      markup: `<div class="max-w-md"><x-import component-from-global-scope="NS.List" items="{{none}}" empty="Nothing is waiting on you."></x-import></div>`,
      vals: { none: [] },
    },
    {
      id: "error",
      title: "Could not load",
      layout: "block",
      markup: `<div class="max-w-md"><x-import component-from-global-scope="NS.List" items="{{none}}" error="{{down}}" on-retry="{{retry}}"></x-import></div>
<p data-slot="example-status" class="type-meta text-text-muted">{{retriedLine}}</p>`,
      vals: { down: { title: "We couldn't load your queue.", description: "[Payroll system] is not responding. The rest of this page still works." } },
    },
  ],
  checks: [
    {
      name: "Up and Down move between the rows that open something, Home and End to the ends, and Tab leaves the list",
      example: "boxed",
      async run({ page, scope, expect }) {
        const rows = scope.locator('[data-slot="list-row-action"]')
        await rows.first().focus()
        const focused = () => page.evaluate(() => document.activeElement?.getAttribute("aria-labelledby") ?? "")
        const first = await focused()
        await page.keyboard.press("ArrowDown")
        const second = await focused()
        expect(second !== first && second !== "", "Down moves to the next row")
        await page.keyboard.press("ArrowUp")
        expect.equal(await focused(), first, "Up moves back")
        await page.keyboard.press("End")
        expect.equal(await focused(), await rows.last().getAttribute("aria-labelledby"), "End goes to the last row")
        await page.keyboard.press("Home")
        expect.equal(await focused(), first, "Home goes to the first row")
      },
    },
    {
      name: "Rows are list items, direct children of one list, as many as there are rows",
      example: "boxed",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("list").count(), 1, "one list")
        expect.equal(await scope.getByRole("listitem").count(), 4, "a list item for each row")
        expect(await scope.locator('[data-slot="list"]').evaluate((ul) => ul.tagName === "UL" && [...ul.children].every((c) => c.tagName === "LI")), "the rows are the list's own items")
      },
    },
    {
      name: "Boxed by default: the surface, a hairline and radius-md, in both themes",
      example: "boxed",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const list = scope.locator('[data-slot="list"]')
        expect.equal(await style(list, "backgroundColor"), await roleValue(page, "surface", "backgroundColor"), "the surface")
        expect.equal(await style(list, "borderTopColor"), await roleValue(page, "line", "borderTopColor"), "the hairline")
        const radius = await list.evaluate((el) => getComputedStyle(el).borderTopLeftRadius === getComputedStyle(document.documentElement).getPropertyValue("--radius-md").trim())
        expect(radius, "the corners are radius-md")
      },
    },
    {
      name: "A hairline between rows, and none above the first",
      example: "boxed",
      async run({ page, scope, expect }) {
        const rows = await scope.locator('[data-slot="list-row"]').evaluateAll((els) => els.map((el) => [getComputedStyle(el).borderTopWidth, getComputedStyle(el).borderTopColor]))
        expect.equal(rows[0][0], "0px", "nothing above the first row")
        const line = await roleValue(page, "line", "borderTopColor")
        for (const [width, colour] of rows.slice(1)) {
          expect.equal(width, "1px", "a hairline above each later row")
          expect.equal(colour, line, "in the line role")
        }
      },
    },
    {
      name: "Inside a card it draws no box, and its rows line up with the card's inset",
      example: "in-card",
      async run({ scope, expect }) {
        const list = scope.locator('[data-slot="list"]')
        expect.equal(await style(list, "borderTopWidth"), "0px", "no hairline of its own")
        expect.equal(await style(list, "backgroundColor"), "rgba(0, 0, 0, 0)", "no surface of its own")
        const title = await scope.locator('[data-slot="card-title"]').boundingBox()
        const lead = await scope.locator('[data-slot="list-row-lead"]').first().boundingBox()
        expect(Math.abs(lead.x - title.x) <= 1, `the first row's lead lines up with the card's title (${Math.round(lead.x)} and ${Math.round(title.x)})`)
      },
    },
    {
      name: "Unboxed, it draws no box",
      example: "plain",
      async run({ scope, expect }) {
        expect.equal(await style(scope.locator('[data-slot="list"]'), "borderTopWidth"), "0px", "no hairline round it")
      },
    },
    {
      name: "Loading says so once, and waits with skeleton rows hidden from screen readers",
      example: "loading",
      async run({ scope, expect }) {
        const list = scope.locator('[data-slot="list"]').first()
        expect.equal(await list.getAttribute("aria-busy"), "true", "it is busy")
        expect.equal((await list.getByRole("status").textContent()).trim(), "Loading", "one polite status")
        expect.equal(await scope.locator('[data-slot="list"]').first().locator('[data-slot="list-skeleton-row"][aria-hidden="true"]').count(), 3, "three hidden skeleton rows")
        // The shape of the rows to come: no avatar circle unless the rows have avatars.
        expect.equal(await scope.locator('[data-slot="list"]').first().locator(".rounded-full").count(), 0, "no avatar where the rows have none")
        expect.equal(await scope.locator('[data-slot="list"]').nth(1).locator('[data-slot="list-skeleton-row"] .rounded-full').count(), 3, "an avatar on each row of a people list")
        expect.equal(await scope.getByRole("listitem").count(), 0, "no rows yet")
      },
    },
    {
      name: "An empty list says what is empty, in place of the rows",
      example: "empty",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("heading", { name: "Nothing is waiting on you." }).count(), 1, "what is empty")
        expect.equal(await scope.getByRole("listitem").count(), 0, "no rows")
      },
    },
    {
      name: "Could not load names the system, and Try again works from the keyboard",
      example: "error",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("heading", { name: "We couldn't load your queue." }).count(), 1, "what failed")
        expect((await scope.locator('[data-slot="list"]').innerText()).includes("[Payroll system] is not responding."), "which system")
        const retry = scope.getByRole("button", { name: "Try again" })
        await retry.focus()
        await page.keyboard.press("Enter")
        expect.equal(await scope.locator('[data-slot="example-status"]').innerText(), "Tried again 1 time.", "Try again ran")
      },
    },
  ],
}
