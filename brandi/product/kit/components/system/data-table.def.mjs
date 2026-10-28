// DataTable's one definition. Functions (opening a row, a bulk action, the toolbar's filters) are built in the
// board's own script, through the bundle's namespace.

const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement)
async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await isFocused(locator)) return true
  }
  return false
}
const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)
/** A role's value as the browser computes it in the current theme. */
const roleValue = (page, role, prop = "color") =>
  page.evaluate(([r, p]) => {
    const probe = document.createElement("span")
    probe.style[p] = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe)[p]
    probe.remove()
    return value
  }, [role, prop])
/** The system's own formatter, from the bundle's namespace, so expected figures follow the market's locale. */
const fmt = (page, value, styleName) =>
  page.evaluate(([v, s]) => {
    for (const key of Object.keys(window)) {
      try {
        const ns = window[key]
        if (ns && typeof ns.formatNumber === "function" && typeof ns.Root === "function") return ns.formatNumber(v, s)
      } catch (e) {}
    }
    return null
  }, [value, styleName])
const statusLine = (scope) => scope.locator('[data-slot="example-status"]').innerText()
const amounts = (scope) => scope.locator('tbody [data-slot="data-table-cell"][data-type="currency"]').allInnerTexts()
const checkedRows = (scope) =>
  scope.locator('[data-slot="data-table-wide"] tbody [role="checkbox"]').evaluateAll((boxes) => boxes.map((b) => b.getAttribute("aria-checked")))

const MENU = [{ label: "Send reminder", icon: "Send" }, { label: "Download PDF", icon: "Download" }, "separator", { label: "Void invoice", icon: "Ban", danger: true }]

const invoiceColumns = [
  { key: "client", label: "Client", type: "stack", sortable: true },
  { key: "status", label: "Status", type: "badge" },
  { key: "due", label: "Due", sortable: true, empty: "Not sent", phone: "labelled" },
  { key: "owner", label: "Owner", type: "person", phone: "hidden" },
  { key: "amount", label: "Amount", type: "currency", sortable: true },
  { key: "actions", label: "Actions", type: "actions", items: MENU },
]
const invoices = [
  { id: "1042", client: { title: "[Harbour Physio]", sub: "Invoice [1042]" }, status: { label: "Overdue", tone: "danger" }, due: "[14 June]", owner: "[Priya Nair]", amount: 4280 },
  { id: "1043", client: { title: "[Northside Vets]", sub: "Invoice [1043]" }, status: { label: "Due soon", tone: "warning" }, due: "[21 June]", owner: "[Sam Lee]", amount: 1960.5 },
  { id: "1044", client: { title: "[Coastal Dental]", sub: "Invoice [1044]" }, status: { label: "Paid", tone: "success" }, due: "[2 June]", owner: "[Ana Silva]", amount: 812 },
  { id: "1045", client: { title: "[Bayside Yoga]", sub: "Invoice [1045]" }, status: { label: "Draft", tone: "neutral" }, due: null, owner: "[Marcus Chen]", amount: 2350 },
  { id: "1046", client: { title: "[Hillcrest Pharmacy]", sub: "Invoice [1046]" }, status: { label: "Sent", tone: "info" }, due: "[28 June]", owner: "[Priya Nair]", amount: 12640.75 },
  { id: "1047", client: { title: "[Riverside Cafe]", sub: "Invoice [1047]" }, status: { label: "Paid", tone: "success" }, due: "[30 May]", owner: "[Sam Lee]", amount: 486.2 },
]

const teamColumns = [
  { key: "person", label: "Person", type: "person", sortable: true },
  { key: "hours", label: "Hours", type: "hours", sortable: true },
  { key: "change", label: "Change", type: "delta", goodWhen: "neither" },
  { key: "billable", label: "Billable", type: "progress", phone: "hidden" },
  { key: "sites", label: "Sites", type: "tags", phone: "hidden" },
  { key: "rate", label: "Rate", type: "currency", sortable: true },
]
const team = [
  { id: "priya", person: "[Priya Nair]", hours: 38.5, change: 4.2, billable: 82, sites: [{ label: "[Bondi]", color: 1 }], rate: 96 },
  { id: "marcus", person: "[Marcus Chen]", hours: 41.25, change: 9.8, billable: 74, sites: [{ label: "[Bondi]", color: 1 }, { label: "[Manly]", color: 3 }], rate: 88.5 },
  { id: "ana", person: "[Ana Silva]", hours: 36, change: -2.5, billable: 91, sites: [{ label: "[Manly]", color: 3 }], rate: 92 },
  { id: "sam", person: "[Sam Lee]", hours: null, change: null, billable: null, sites: [], rate: 79.5 },
]

const shifts = Array.from({ length: 12 }, (_, i) => ({
  id: `shift-${i + 1}`,
  who: ["[Priya Nair]", "[Marcus Chen]", "[Ana Silva]", "[Sam Lee]"][i % 4],
  day: ["[Mon 3 June]", "[Tue 4 June]", "[Wed 5 June]", "[Thu 6 June]", "[Fri 7 June]", "[Sat 8 June]"][i % 6],
  site: ["[Bondi]", "[Manly]"][i % 2],
  hours: [7.5, 8, 6.25, 9.5, 4, 7.75][i % 6],
}))
const shiftColumns = [
  { key: "who", label: "Person", type: "strong" },
  { key: "day", label: "Day" },
  { key: "site", label: "Site" },
  { key: "hours", label: "Hours", type: "hours" },
]

const wideColumns = [
  { key: "client", label: "Client", type: "strong" },
  { key: "contact", label: "Contact" },
  { key: "email", label: "Email" },
  { key: "plan", label: "Plan" },
  { key: "renews", label: "Renews" },
  { key: "mrr", label: "Monthly", type: "currency" },
  { key: "actions", label: "Actions", type: "actions", items: MENU },
]
const wide = [
  { id: "w1", client: "[Harbour Physio Pty Ltd]", contact: "[Priya Nair]", email: "[accounts@harbourphysio.example]", plan: "[Clinic, 12 seats]", renews: "[1 August 2026]", mrr: 1188 },
  { id: "w2", client: "[Northside Veterinary Hospital]", contact: "[Sam Lee]", email: "[sam.lee@northsidevets.example]", plan: "[Clinic, 8 seats]", renews: "[14 September 2026]", mrr: 792 },
  { id: "w3", client: "[Coastal Dental Group]", contact: "[Ana Silva]", email: "[reception@coastaldental.example]", plan: "[Practice, 4 seats]", renews: "[3 March 2027]", mrr: 396 },
]

export default {
  name: "DataTable",
  group: "Data",
  job: "Records in rows and columns, declared by column type, so a design and the product share one definition.",
  status: "proven",
  props: [
    { name: "columns", type: "DataTableColumn[]", required: true, doc: "Each { key, label, type, sortable, align, width, wrap, maxWidth, empty, items, render, phone, format, goodWhen, max, editable, validate }. See Column types." },
    { name: "rows", type: "Array<Record<string, unknown>>", required: true, doc: "Plain data, as an API returns it. A value of the wrong shape reads as missing; it never breaks the table." },
    { name: "caption", type: "string", required: true, doc: "Names the table for screen readers: what the rows are. Also the name of its scroll region." },
    { name: "rowKey", type: "string", default: '"id"', doc: "The field that keys each row." },
    { name: "labelKey", type: "string", doc: "The column that names a row, the first by default. It holds the row's link or button, and titles the row on a phone." },
    { name: "selectable", type: "boolean", default: "false", doc: "A checkbox on every row and in the head. Shift selects a run. Selecting a row never opens it." },
    { name: "selectedKeys", type: "string[]", doc: "The selection, when the page keeps it. Rows that leave the screen leave it." },
    { name: "defaultSelected", type: "string[]", doc: "The first selection, when the table keeps it." },
    { name: "onSelectionChange", type: "(keys: string[]) => void", doc: "Called with the keys of the selected rows on screen." },
    { name: "sort", type: "{ key: string; direction: \"ascending\" | \"descending\" } | null", doc: "Sorted by the server: pass the sort, and change it in onSortChange." },
    { name: "defaultSort", type: "{ key: string; direction: \"ascending\" | \"descending\" }", doc: "Sorted here, starting from this." },
    { name: "onSortChange", type: "(sort: { key: string; direction: \"ascending\" | \"descending\" }) => void", doc: "Called when a head is pressed." },
    { name: "density", type: '"comfortable" | "compact"', default: '"comfortable"', doc: "48px rows, or 40px. One density per table, never tighter than compact." },
    { name: "maxHeight", type: "number | string", doc: "The rows scroll under a head that sticks. px, or any CSS length." },
    { name: "footer", type: "ReactNode", doc: "Under the rows, on the subtle surface: put Pagination here." },
    { name: "toolbar", type: "{ label: string; bulkActions?: Array<{ label: string; icon?: IconName; variant?: \"secondary\" | \"primary\" | \"danger\"; disabled?: boolean; onSelect?: (keys: string[]) => void }>; children?: ReactNode; sticky?: boolean }", doc: "A Toolbar above the table. Selecting rows hands it the count, and its bulk actions get the keys of the selected rows on screen." },
    { name: "loading", type: "boolean", default: "false", doc: "The head stays; the rows wait as skeletons, and the table says it is loading." },
    { name: "loadingRows", type: "number", default: "5", doc: "How many skeleton rows stand in." },
    { name: "error", type: "ReactNode | { title: ReactNode; description?: ReactNode; actions?: FeedbackAction[] }", doc: "Replaces the rows when they could not load, keeping the head. Name the system that failed." },
    { name: "onRetry", type: "() => void", doc: "Adds Try again to the error." },
    { name: "empty", type: "ReactNode | { title: ReactNode; description?: ReactNode; actions?: FeedbackAction[] }", doc: "Replaces the rows when there are none, keeping the head and the toolbar. \"No [caption] yet.\" by default." },
    { name: "onRowClick", type: "(row: Record<string, unknown>) => void", doc: "Opens a row: the naming cell becomes the row's button, and a press anywhere else on the row opens it too." },
    { name: "rowHref", type: "(row: Record<string, unknown>) => string | undefined", doc: "Opens a row: the naming cell becomes the row's link." },
    { name: "onCellSave", type: "(row: Record<string, unknown>, key: string, value: string) => void | string | null | undefined | Promise<void | string | null | undefined>", doc: "Saves an editable cell (EditableCell). Return or resolve a message when the save failed." },
    { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", doc: "The level of an empty or error state's title." },
  ],
  types: [
    'type DataTableColumn = { key: string; label: string; type?: "text" | "strong" | "stack" | "person" | "badge" | "tags" | NumberStyle | "delta" | "progress" | "actions"; sortable?: boolean; align?: "start" | "end"; width?: number | string; wrap?: boolean; maxWidth?: number | string; empty?: string; items?: Array<{ label: string; icon?: IconName; danger?: boolean; disabled?: boolean; onSelect?: (row: Record<string, unknown>) => void } | "separator" | { group: string }> | ((row: Record<string, unknown>) => Array<{ label: string; icon?: IconName; danger?: boolean; disabled?: boolean; onSelect?: (row: Record<string, unknown>) => void } | "separator" | { group: string }>); render?: (row: Record<string, unknown>) => ReactNode; phone?: "meta" | "labelled" | "badge" | "action" | "hidden"; format?: NumberStyle; goodWhen?: "up" | "down" | "neither"; max?: number; editable?: boolean; validate?: (value: string, row: Record<string, unknown>) => string | null | undefined }',
  ],
  tables: [
    {
      title: "Column types",
      head: ["Type", "Value", "Reads as"],
      rows: [
        ["text", "A string", "The body style. The default"],
        ["strong", "A string", "The label style, in text-strong"],
        ["stack", "{ title, sub } or a string", "A title over a sub-line in meta"],
        ["person", "A name, or { name, src }", "A 28px Avatar beside the name"],
        ["badge", "{ label, tone } or a string", "A Badge. On a phone, on the badge line"],
        ["tags", "Strings, or { label, color }", "Tags, wrapping"],
        ["number, currency, compact, compact-currency, percent, points, hours", "A number", "Right-aligned, through the formatter, in tabular figures. Exact in a table: prefer number and currency to the compact styles"],
        ["delta", "A signed number", "A Delta, in format (percent by default), right-aligned"],
        ["progress", "A number, out of max (100 by default)", "A small Progress with its figure in words"],
        ["actions", "Nothing: items, on the column", "The row's menu, named \"More actions for [record]\", sticking to the right edge while a wide table scrolls"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "With onRowClick or rowHref, the naming cell holds the row's button or link, so every row is reachable from the keyboard and opens with Enter. A press anywhere else on the row opens it too.",
      "Selecting a row never opens it: presses on a checkbox, its cell, a menu, a link or an editable cell are their own. Space toggles a row's checkbox. Shift with a press or with Space selects the run from the last row pressed.",
      "Selecting rows hands the count to the Toolbar, which swaps its filters for the bulk actions. Only rows on screen can be selected; rows that leave the screen leave the selection.",
      "A sortable head is a button. Enter or Space sorts by it, ascending first; aria-sort on that head says which way, and the change is read out (\"Sorted by amount, descending\").",
      "A table wider or taller than its box becomes a region named by the caption that takes focus, so the arrow keys scroll it. The head sticks while the rows scroll under it, and scrolling to a focused row keeps it clear of the head.",
      "The row's menu is a Menu named \"More actions for [record]\": it opens in a portal, never clipped by the table, closes at once, and gives focus back to its button.",
    ],
    Layout: [
      "Under 640px of its own width it shows the same rows as a list (ListRow): the naming column is the title, the others make a meta line, badges sit on a line of their own, the checkbox leads and the row's menu stays on the right. A column's phone sends it to meta (the default), labelled (the meta line with the column's name in front, so two figures can share it), badge, action (the row's one primary action, beside its menu) or hidden. A stack column keeps its second line there too: the naming column's leads the meta line, and another stack reads title · second line. Sorting moves to the page's own controls.",
      "The head is on surface-subtle in short uppercase labels, with hairlines between rows and no zebra stripes. Rows are 48px, or 40px compact; on a touch screen too.",
      "Cells sit 16px in from the table's edges, and 24px inside a card, lining up with its title; the toolbar then sticks on the card's surface. Text that is capped by maxWidth wraps inside the cap rather than being cut, so nothing needs a mouse to read.",
      "An editable column marks its head with a pencil, so its cells can be found without hovering.",
    ],
    States: [
      "Loading keeps the head and the toolbar, and waits with skeleton rows in the columns' shape.",
      "Empty and could not load replace the rows and keep the head and the toolbar. Could not load names the system and offers Try again.",
      "A selected row takes the selected tint, and its checkbox says so; forced colours outline it.",
    ],
    Copy: [
      'Heads are short nouns: Client, Due, Amount. Empty says what is empty: "No invoices match these filters."',
      'Could not load names the system: "[Accounting system] is not responding."',
    ],
    Rules: [
      "The first column names the record. Seven columns at most; the rest belong in the detail view.",
      "Numbers are right-aligned in tabular figures, and exact.",
      "One density per table, never tighter than compact. Keep the phone list's meta line short.",
      "Selecting rows swaps the toolbar's filters for bulk actions. Those act only on rows on screen, with a count that says how many.",
    ],
    Review: [
      "Selecting a row opened it, rows could not be reached by keyboard, and some data crashed it (round 1): checks select with Space and with a press, open with Enter, and tab through every row.",
      "Bulk approve acted on rows that were not on screen (round 3): bulk actions get the keys of selected rows on screen, and a check reads them.",
      "Tables kept their desktop layout at phone width (round 4): a check at 390px finds the list and nothing scrolling sideways.",
      "On a touch tablet the sort buttons were 16px and the row's name 20px, the only control that opens the row for a screen reader (a pilot's round 1): each now takes its whole cell as the tap area, and a check taps the top and the foot of the cell.",
      "A search that emptied the table said nothing, because the count in the footer unmounted with the rows (a pilot's round 1): the footer stays mounted under the empty state, out of sight.",
    ],
    Accepted: [
      "The actions column's menu stands in for Menu until it lands in the kit: the same props and behaviour on the same primitive. Swapping it is one import.",
    ],
    Open: [
      "Up and Down between a list and its detail is still left to the page, as the reference left it.",
    ],
  },
  frame: { width: 960, height: 3520 },
  state: { opened: "", reminded: "", retried: 0 },
  logic: `openedLine: self.state.opened ? "Opened " + self.state.opened + "." : "No invoice open.",
openInvoice: (row) => self.setState({ opened: (row.client && row.client.title) || String(row.id) }),
remindedLine: self.state.reminded ? "Reminders queued for invoices " + self.state.reminded + "." : "No reminders queued.",
toolbar: {
  label: "[Invoice] filters",
  bulkActions: [
    { label: "Send reminders", icon: "Send", onSelect: (keys) => self.setState({ reminded: keys.join(", ") }) },
    { label: "Export", icon: "Download" },
  ],
  children: [
    window.React.createElement(NS.SearchField, { key: "search", placeholder: "Search [invoices]", size: "sm", className: "w-56" }),
    window.React.createElement(NS.FilterChip, { key: "overdue", count: 1, attention: true }, "Overdue"),
    window.React.createElement(NS.FilterChip, { key: "draft", count: 1 }, "Draft"),
  ],
},
filtered: {
  label: "[Invoice] filters, with nothing matching",
  children: [
    window.React.createElement(NS.SearchField, { key: "search", placeholder: "Search [invoices]", size: "sm", className: "w-56", defaultValue: "[Kingsford]" }),
    window.React.createElement(NS.FilterChip, { key: "overdue", defaultSelected: true }, "Overdue"),
  ],
},
pages: window.React.createElement(NS.Pagination, { page: 1, pageSize: 6, total: 48 }),
noMatchPages: window.React.createElement(NS.Pagination, { page: 1, pageSize: 6, total: 0, empty: "No invoices match these filters." }),
remindColumns: ${JSON.stringify(invoiceColumns.filter((c) => c.key !== "actions"))}.concat([
  { key: "remind", label: "Remind", phone: "action", render: (row) => window.React.createElement(NS.Button, { size: "sm", icon: "Send", "aria-label": "Remind " + row.client.title, onClick: () => self.setState({ reminded: row.client.title }) }, "Remind") },
  { key: "actions", label: "Actions", type: "actions", items: ${JSON.stringify(MENU)} },
]),
personHref: (row) => "#person-" + row.id,
shiftHref: (row) => "#" + row.id,
retry: () => self.setState({ retried: self.state.retried + 1 }),
retriedLine: self.state.retried ? "Tried again " + self.state.retried + (self.state.retried === 1 ? " time." : " times.") : "Not tried again yet."`,
  examples: [
    {
      id: "invoices",
      title: "Selectable, sortable, with a toolbar, a row menu and a footer",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Invoices" columns="{{invoiceColumns}}" rows="{{invoices}}" selectable="{{yes}}" toolbar="{{toolbar}}" footer="{{pages}}" on-row-click="{{openInvoice}}"></x-import>
<p data-slot="example-status" class="type-meta text-text-muted">{{openedLine}} {{remindedLine}}</p>`,
      vals: { invoiceColumns, invoices, yes: true },
    },
    {
      id: "types",
      title: "Column types: a person, hours, a delta, progress, tags and money",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Hours this week" columns="{{teamColumns}}" rows="{{team}}" row-href="{{personHref}}" default-sort="{{byHours}}"></x-import>`,
      vals: { teamColumns, team, byHours: { key: "hours", direction: "descending" } },
    },
    {
      id: "in-card",
      title: "Inside a card, the card is the box",
      layout: "block",
      markup: `<div class="max-w-2xl"><x-import component-from-global-scope="NS.Card" title="Unpaid invoices" description="Oldest first." flush="{{yes}}"><x-import component-from-global-scope="NS.DataTable" caption="Unpaid invoices" columns="{{cardColumns}}" rows="{{unpaid}}" on-row-click="{{openInvoice}}"></x-import></x-import></div>`,
      vals: {
        cardColumns: [
          { key: "client", label: "Client", type: "stack" },
          { key: "due", label: "Due", empty: "Not sent" },
          { key: "amount", label: "Amount", type: "currency" },
        ],
        unpaid: invoices.slice(0, 3),
      },
    },
    {
      id: "sticky",
      title: "Compact rows under a head that sticks",
      layout: "block",
      markup: `<div class="max-w-2xl"><x-import component-from-global-scope="NS.DataTable" caption="Shifts this week" columns="{{shiftColumns}}" rows="{{shifts}}" density="compact" max-height="{{h248}}" row-href="{{shiftHref}}"></x-import></div>`,
      vals: { shiftColumns, shifts, h248: 248 },
    },
    {
      id: "phone",
      title: "At 390px the rows become a list",
      layout: "block",
      width: 390,
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Invoices on a phone" columns="{{invoiceColumns}}" rows="{{invoices}}" selectable="{{yes}}" on-row-click="{{openInvoice}}"></x-import>
<p data-slot="example-status" class="type-meta text-text-muted">{{openedLine}}</p>`,
    },
    {
      id: "phone-action",
      title: "At 390px a row's primary action stays on the row",
      layout: "block",
      width: 390,
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Invoices to chase" columns="{{remindColumns}}" rows="{{chase}}"></x-import>
<p data-slot="example-status" class="type-meta text-text-muted">{{remindedLine}}</p>`,
      vals: { chase: invoices.slice(0, 2) },
    },
    {
      id: "wide",
      title: "Wider than its box, it scrolls inside it and the menu sticks to the edge",
      layout: "block",
      width: 720,
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Subscriptions" columns="{{wideColumns}}" rows="{{wide}}"></x-import>`,
      vals: { wideColumns, wide },
    },
    {
      id: "loading",
      title: "Loading",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Invoices" columns="{{invoiceColumns}}" rows="{{none}}" selectable="{{yes}}" loading="{{yes}}" loading-rows="{{three}}"></x-import>`,
      vals: { none: [], three: 3 },
    },
    {
      id: "empty",
      title: "Empty, keeping the head and the toolbar",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Invoices" columns="{{invoiceColumns}}" rows="{{none}}" toolbar="{{filtered}}" empty="{{noMatch}}" footer="{{noMatchPages}}"></x-import>`,
      vals: { noMatch: { title: "No invoices match these filters.", description: "Try another search, or clear the filters to see every invoice.", actions: [{ label: "Clear filters", icon: "X" }] } },
    },
    {
      id: "error",
      title: "Could not load",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.DataTable" caption="Invoices" columns="{{invoiceColumns}}" rows="{{none}}" error="{{down}}" on-retry="{{retry}}"></x-import>
<p data-slot="example-status" class="type-meta text-text-muted">{{retriedLine}}</p>`,
      vals: { down: { title: "We couldn't load invoices.", description: "[Accounting system] is not responding. The rest of this page still works." } },
    },
  ],
  checks: [
    {
      name: "Enter on a head sorts by it, aria-sort says which way, and the change is read out",
      example: "invoices",
      async run({ page, scope, expect }) {
        const sort = scope.getByRole("button", { name: "Amount" })
        expect(await tabTo(page, sort), "Tab reaches the Amount head")
        const head = sort.locator("xpath=ancestor::th")
        expect.equal(await head.getAttribute("aria-sort"), null, "unsorted at first")
        await page.keyboard.press("Enter")
        expect.equal(await head.getAttribute("aria-sort"), "ascending", "ascending after Enter")
        const up = await Promise.all([486.2, 812, 1960.5, 2350, 4280, 12640.75].map((v) => fmt(page, v, "currency")))
        expect.equal((await amounts(scope)).join(" | "), up.join(" | "), "the rows, smallest first")
        expect.equal(await scope.locator('[data-slot="data-table-status"]').textContent(), "Sorted by amount, ascending", "read out")
        await page.keyboard.press("Space")
        expect.equal(await head.getAttribute("aria-sort"), "descending", "descending after Space")
        expect.equal((await amounts(scope)).join(" | "), [...up].reverse().join(" | "), "the rows, largest first")
        expect.equal(await scope.locator('[data-slot="data-table-status"]').textContent(), "Sorted by amount, descending", "read out again")
        expect(await isFocused(sort), "focus stays on the head")
        expect.equal(await scope.locator("th[aria-sort]").count(), 1, "one head says it is sorted")
      },
    },
    {
      name: "Space selects a row and the toolbar shows the count, and selecting never opens the row",
      example: "invoices",
      async run({ page, scope, expect }) {
        const box = scope.getByRole("checkbox", { name: "Select [Harbour Physio]" })
        expect(await tabTo(page, box), "Tab reaches the first row's checkbox")
        await page.keyboard.press("Space")
        expect.equal(await box.getAttribute("aria-checked"), "true", "the row is selected")
        expect.equal(await scope.locator('[data-slot="toolbar-count"]').innerText(), "1 selected", "the toolbar's count")
        expect.equal(await scope.locator('[data-slot="toolbar-status"]').textContent(), "1 selected", "said politely")
        expect(await isFocused(box), "focus stays on the checkbox")
        expect((await statusLine(scope)).startsWith("No invoice open."), "the row did not open")
      },
    },
    {
      name: "Shift with Space selects the run from the last row pressed",
      example: "invoices",
      async run({ page, scope, expect }) {
        await scope.getByRole("checkbox", { name: "Select [Harbour Physio]" }).focus()
        await page.keyboard.press("Space")
        await scope.getByRole("checkbox", { name: "Select [Bayside Yoga]" }).focus()
        await page.keyboard.press("Shift+Space")
        expect.equal((await checkedRows(scope)).join(","), "true,true,true,true,false,false", "the first four rows")
        expect.equal(await scope.locator('[data-slot="toolbar-count"]').innerText(), "4 selected", "the count")
      },
    },
    {
      name: "Shift with a press selects the run too, and selects no text",
      example: "invoices",
      async run({ page, scope, expect }) {
        await scope.getByRole("checkbox", { name: "Select [Northside Vets]" }).click()
        await scope.getByRole("checkbox", { name: "Select [Hillcrest Pharmacy]" }).click({ modifiers: ["Shift"] })
        expect.equal((await checkedRows(scope)).join(","), "false,true,true,true,true,false", "rows two to five")
        expect.equal(await page.evaluate(() => String(window.getSelection())), "", "no text selected")
      },
    },
    {
      name: "Enter on a row's name opens it",
      example: "invoices",
      async run({ page, scope, expect }) {
        const name = scope.getByRole("button", { name: "[Northside Vets]", exact: true })
        expect(await tabTo(page, name), "Tab reaches the row's name")
        await page.keyboard.press("Enter")
        expect((await statusLine(scope)).startsWith("Opened [Northside Vets]."), "the row opened")
      },
    },
    {
      name: "Every row is reachable from the keyboard, in order",
      example: "invoices",
      async run({ page, expect }) {
        const seen = []
        for (let i = 0; i < 80 && seen.length < 6; i++) {
          await page.keyboard.press("Tab")
          const key = await page.evaluate(() => {
            const el = document.activeElement
            return el && el.getAttribute("data-slot") === "data-table-open" ? el.closest("tr")?.getAttribute("data-key") : null
          })
          if (key && !seen.includes(key)) seen.push(key)
        }
        expect.equal(seen.join(","), "1042,1043,1044,1045,1046,1047", "each row's name, in order")
      },
    },
    {
      name: "A press anywhere on a row opens it, but never a press on its checkbox, its cell or its menu",
      example: "invoices",
      async run({ page, scope, expect }) {
        const row = scope.locator('tr[data-key="1044"]')
        await row.getByRole("checkbox").click()
        const cell = await row.locator('[data-slot="data-table-select"]').boundingBox()
        await page.mouse.click(cell.x + cell.width - 6, cell.y + 6)
        expect.equal(await row.getByRole("checkbox").getAttribute("aria-checked"), "false", "a press beside the box toggles it back")
        await row.getByRole("button", { name: "More actions for [Coastal Dental]" }).click()
        await page.getByRole("menu").waitFor({ state: "visible", timeout: 3000 })
        await page.keyboard.press("Escape")
        await page.getByRole("menu").waitFor({ state: "detached", timeout: 3000 })
        expect((await statusLine(scope)).startsWith("No invoice open."), "none of those opened the row")
        await row.locator('[data-type="currency"]').click()
        expect((await statusLine(scope)).startsWith("Opened [Coastal Dental]."), "a press on the amount opened it")
      },
    },
    {
      name: "Bulk actions get the selected rows on screen, and only those",
      example: "invoices",
      async run({ scope, expect }) {
        await scope.getByRole("checkbox", { name: "Select [Harbour Physio]" }).click()
        await scope.getByRole("checkbox", { name: "Select [Coastal Dental]" }).click()
        await scope.getByRole("button", { name: "Send reminders" }).click()
        expect((await statusLine(scope)).includes("Reminders queued for invoices 1042, 1044."), "the two rows' keys")
      },
    },
    {
      name: "Numbers sit right-aligned, exact, through the formatter, in tabular figures",
      example: "invoices",
      async run({ page, scope, expect }) {
        const expected = await Promise.all([4280, 1960.5, 812, 2350, 12640.75, 486.2].map((v) => fmt(page, v, "currency")))
        expect.equal((await amounts(scope)).join(" | "), expected.join(" | "), "each amount, exact")
        const cell = scope.locator('tbody [data-type="currency"]').first()
        expect.equal(await style(cell, "textAlign"), "right", "right-aligned")
        expect((await style(cell, "fontVariantNumeric")).includes("tabular-nums"), "tabular figures")
        expect.equal(await style(scope.getByRole("button", { name: "Amount" }).locator("xpath=ancestor::th"), "textAlign"), "right", "its head is right-aligned too")
      },
    },
    {
      name: "A missing value says so, never zero",
      example: "types",
      async run({ scope, expect }) {
        const sam = scope.locator('tr[data-key="sam"]')
        expect.equal((await sam.locator('[data-type="hours"]').innerText()).trim(), "Not set", "missing hours")
        expect.equal((await sam.locator('[data-type="delta"]').innerText()).trim(), "Not set", "a missing change")
      },
    },
    {
      name: "With rowHref each row's name is its link, and Enter follows it",
      example: "types",
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link", { name: "[Priya Nair]", exact: true })
        expect.equal(await link.getAttribute("href"), "#person-priya", "the row's link")
        expect(await tabTo(page, link, 80), "Tab reaches it")
        await page.keyboard.press("Enter")
        await page.waitForFunction(() => location.hash === "#person-priya", null, { timeout: 3000 })
      },
    },
    {
      name: "The head sticks while the rows scroll, and a focused row is never hidden under it",
      example: "sticky",
      async run({ page, scope, expect }) {
        const region = scope.getByRole("region", { name: "Shifts this week" })
        await region.evaluate((el) => { el.scrollTop = 200 })
        const box = await region.boundingBox()
        const head = await scope.locator("th").first().boundingBox()
        expect(Math.abs(head.y - box.y) <= 1.5, `the head stays at the top of its box (${Math.round(head.y)} and ${Math.round(box.y)})`)
        await region.focus()
        await page.keyboard.press("Tab")
        const focused = page.locator(":focus")
        expect.equal(await focused.getAttribute("href"), "#shift-1", "Tab moves to the first row's link")
        await page.waitForTimeout(400)
        const link = await focused.boundingBox()
        const headNow = await scope.locator("th").first().boundingBox()
        expect(link.y >= headNow.y + headNow.height - 1, `the focused row is clear of the head (${Math.round(link.y)} under ${Math.round(headNow.y + headNow.height)})`)
      },
    },
    {
      name: "A table taller than its box is a region named by its caption, which the arrow keys scroll",
      example: "sticky",
      async run({ page, scope, expect }) {
        const region = scope.getByRole("region", { name: "Shifts this week" })
        expect.equal(await region.getAttribute("tabindex"), "0", "it takes focus")
        expect(await tabTo(page, region, 90), "Tab reaches it")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        await page.waitForFunction((el) => el.scrollTop > 0, await region.elementHandle(), { timeout: 3000 })
      },
    },
    {
      name: "At 390px of its own width the rows are a list, and nothing scrolls sideways",
      example: "phone",
      async run({ page, scope, expect }) {
        expect.equal(await style(scope.locator('[data-slot="data-table-wide"]'), "display"), "none", "no table on screen")
        expect.equal(await scope.getByRole("table").count(), 0, "no table for screen readers either")
        expect.equal(await scope.getByRole("listitem").count(), 6, "a list item for each row")
        const fits = await scope.locator('[data-slot="data-table"]').evaluate((el) => ({ width: el.getBoundingClientRect().width, scroll: el.scrollWidth, client: el.clientWidth }))
        expect(fits.width <= 390.5, `it fits its 390px column (${fits.width}px)`)
        expect(fits.scroll <= fits.client + 1, "nothing inside spills sideways")
        const first = await scope.getByRole("listitem").first().innerText()
        expect(first.includes(await fmt(page, 4280, "currency")), "the amount is on the meta line")
        expect(first.includes("Due [14 June]"), "a labelled column carries its name")
        expect(first.includes("Overdue"), "the badge is on its own line")
        expect(!first.includes("[Priya Nair]"), "a column sent nowhere stays off the phone")
      },
    },
    {
      name: "At 390px a stack column keeps its second line: the naming column's leads the meta line",
      example: "phone",
      async run({ scope, expect }) {
        const row = scope.locator('[data-slot="data-table-list"] [data-key="1042"]')
        expect.equal((await row.locator('[data-slot="list-row-title"]').innerText()).trim(), "[Harbour Physio]", "the title is the stack's first line")
        const meta = (await row.locator('[data-slot="list-row-meta"]').innerText()).trim()
        expect(meta.startsWith("Invoice [1042]"), `its second line leads the meta line (${meta})`)
      },
    },
    {
      name: "At 390px, Space selects a row, Tab moves on to the row, and Enter opens it",
      example: "phone",
      async run({ page, scope, expect }) {
        const box = scope.getByRole("checkbox", { name: "Select [Harbour Physio]" })
        await box.focus()
        await page.keyboard.press("Space")
        expect.equal(await box.getAttribute("aria-checked"), "true", "the row is selected")
        expect.equal(await scope.getByRole("checkbox", { name: "Select all" }).getAttribute("aria-checked"), "mixed", "select all says some are")
        await page.keyboard.press("Tab")
        expect(await isFocused(scope.getByRole("button", { name: "[Harbour Physio]", exact: true })), "Tab moves on to the row")
        await page.keyboard.press("Enter")
        expect.equal(await statusLine(scope), "Opened [Harbour Physio].", "the row opened")
      },
    },
    {
      name: "On a touch screen at 390px the checkbox, the row and its menu are big enough to press",
      example: "phone",
      touch: true,
      async run({ page, scope, expect }) {
        const box = scope.getByRole("checkbox", { name: "Select [Harbour Physio]" })
        await box.scrollIntoViewIfNeeded()
        const b = await box.boundingBox()
        const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[role="checkbox"]')?.getAttribute("aria-label") ?? null, [b.x + b.width / 2 + 20, b.y + b.height / 2])
        expect.equal(hit, "Select [Harbour Physio]", "a tap 20px from the box still reaches it")
        expect.atLeast(Math.round((await scope.getByRole("button", { name: "More actions for [Harbour Physio]" }).boundingBox()).height), 40, "the menu button")
        expect.atLeast(Math.round((await scope.getByRole("listitem").first().boundingBox()).height), 48, "the row")
        await box.tap()
        expect.equal(await box.getAttribute("aria-checked"), "true", "a tap selects it")
      },
    },
    {
      name: "At 390px a column marked phone action stays on its row, beside the menu, and still works",
      example: "phone-action",
      async run({ page, scope, expect }) {
        const row = scope.locator('[data-slot="data-table-list"] [data-key="1042"]')
        const remind = row.getByRole("button", { name: "Remind [Harbour Physio]" })
        expect(await remind.isVisible(), "the primary action shows on the row")
        expect(await row.getByRole("button", { name: "More actions for [Harbour Physio]" }).isVisible(), "beside the row's menu")
        const [action, menu] = await Promise.all([remind.boundingBox(), row.getByRole("button", { name: "More actions for [Harbour Physio]" }).boundingBox()])
        expect(action.x + action.width <= menu.x, "the action comes before the menu")
        await remind.focus()
        await page.keyboard.press("Enter")
        expect.equal((await scope.locator('[data-slot="example-status"]').textContent()).trim(), "Reminders queued for invoices [Harbour Physio].", "the press runs the action, not the row")
      },
    },
    {
      name: "Loading keeps the head, says so once, and waits with skeleton rows",
      example: "loading",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("table").getAttribute("aria-busy"), "true", "the table is busy")
        expect.equal(await scope.getByRole("columnheader").count(), 7, "the head stays")
        expect.equal(await scope.locator('[data-slot="data-table-skeleton-row"]').count(), 3, "three skeleton rows")
        expect.equal((await scope.locator('[data-slot="data-table-status"]').textContent()).trim(), "Loading invoices", "one polite status")
      },
    },
    {
      name: "Empty keeps the head and the toolbar, and says what is empty",
      example: "empty",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("group", { name: "[Invoice] filters, with nothing matching" }).count(), 1, "the toolbar stays")
        expect.equal(await scope.getByRole("columnheader").count(), 6, "the head stays")
        expect.equal(await scope.getByRole("heading", { name: "No invoices match these filters." }).count(), 1, "what is empty")
        expect.equal(await scope.locator("tr[data-key]").count(), 0, "no rows")
        expect.equal(await scope.getByRole("button", { name: "Clear filters" }).count(), 1, "what to do next")
      },
    },
    {
      name: "Under the empty state the footer stays mounted, out of sight, so its live count says nothing matches",
      example: "empty",
      async run({ scope, expect }) {
        const footer = scope.locator('[data-slot="data-table-footer"]')
        expect.equal(await footer.count(), 1, "the footer is still there")
        const box = await footer.boundingBox()
        expect(!box || (box.width <= 1 && box.height <= 1), "out of sight: the empty state already says so on screen")
        expect.equal((await footer.getByRole("status").textContent()).trim(), "No invoices match these filters.", "the count, a live region that never unmounted, says nothing matches")
        const foot = await scope.locator('[data-slot="table-container"]').evaluate((el) => getComputedStyle(el).borderBottomLeftRadius)
        expect(foot !== "0px", "the rows round off the box's foot, with the footer out of sight")
      },
    },
    {
      name: "On a touch screen the sort buttons and each row's name take their whole cell, 40px at least, looking no different",
      example: "invoices",
      touch: true,
      async run({ scope, expect }) {
        // A tap just inside the top and the bottom of the cell, beside the control: which control does it reach?
        const reach = (control, slot) =>
          control.evaluate((el, slot) => {
            const cell = el.closest("td, th").getBoundingClientRect()
            const x = el.getBoundingClientRect().left + 2
            const at = (y) => document.elementFromPoint(x, y)?.closest(`[data-slot="${slot}"]`)?.textContent.trim() ?? null
            return { cell: cell.height, own: el.getBoundingClientRect().height, hits: [at(cell.top + 1), at(cell.bottom - 2)] }
          }, slot)
        const sort = scope.locator('[data-slot="data-table-sort"]').first()
        const s = await reach(sort, "data-table-sort")
        expect.atLeast(Math.round(s.cell), 40, "the head's cell")
        expect(s.own < 40, `the sort button itself stays ${Math.round(s.own)}px tall`)
        expect(s.hits.every((t) => t === "Client"), `a tap at the top and the foot of its cell reaches the sort button (${s.hits.join(" | ")})`)
        for (const name of ["[Harbour Physio]", "[Northside Vets]"]) {
          const n = await reach(scope.locator('[data-slot="data-table-wide"] [data-slot="data-table-open"]').filter({ hasText: name }), "data-table-open")
          expect.atLeast(Math.round(n.cell), 40, `${name}'s cell`)
          expect(n.hits.every((t) => t === name), `a tap at the top and the foot of its cell reaches ${name}'s link (${n.hits.join(" | ")})`)
        }
      },
    },
    {
      name: "Could not load names the system, keeps the head, and offers Try again",
      example: "error",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("heading", { name: "We couldn't load invoices." }).count(), 1, "what failed")
        expect((await scope.locator('[data-slot="data-table"]').innerText()).includes("[Accounting system] is not responding."), "which system")
        expect.equal(await scope.getByRole("columnheader").count(), 6, "the head stays")
        await scope.getByRole("button", { name: "Try again" }).focus()
        await page.keyboard.press("Enter")
        expect.equal(await statusLine(scope), "Tried again 1 time.", "Try again ran")
      },
    },
    {
      name: "The row menu opens from the keyboard, Escape closes it at once, and focus goes back to its button",
      example: "invoices",
      async run({ page, scope, expect }) {
        const trigger = scope.getByRole("button", { name: "More actions for [Harbour Physio]" })
        expect(await tabTo(page, trigger), "Tab reaches the row's menu")
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu")
        await menu.waitFor({ state: "visible", timeout: 3000 })
        expect.equal(await menu.getByRole("menuitem").count(), 3, "its actions")
        expect(await page.evaluate(() => ["menuitem", "menu"].includes(document.activeElement?.getAttribute("role") ?? "")), "focus moved into the menu")
        await page.keyboard.press("Escape")
        await menu.waitFor({ state: "detached", timeout: 3000 })
        expect(await isFocused(trigger), "focus is back on the menu's button")
        expect((await statusLine(scope)).startsWith("No invoice open."), "the row did not open")
      },
    },
    {
      name: "Selected rows stay visible in forced colours, with no outline on a row at rest",
      example: "invoices",
      forcedColors: true,
      async run({ scope, expect }) {
        await scope.getByRole("checkbox", { name: "Select [Northside Vets]" }).click()
        expect.equal(await style(scope.locator('tr[data-key="1043"]'), "outlineStyle"), "solid", "the selected row is outlined")
        expect.equal(await style(scope.locator('tr[data-key="1044"]'), "outlineStyle"), "none", "a row at rest is not")
      },
    },
    {
      name: "The head sits on surface-subtle in short uppercase labels, over hairlines in the line role, in both themes",
      example: "invoices",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const head = scope.locator("th").first()
        expect.equal(await style(head, "backgroundColor"), await roleValue(page, "surface-subtle", "backgroundColor"), "the head's surface")
        expect.equal(await style(head, "textTransform"), "uppercase", "short uppercase heads")
        expect.equal(await style(scope.locator("tbody td").first(), "borderBottomColor"), await roleValue(page, "line", "borderBottomColor"), "the hairline between rows")
      },
    },
    {
      name: "Select all selects the rows shown, and says mixed once one is cleared",
      example: "invoices",
      async run({ scope, expect }) {
        const all = scope.getByRole("checkbox", { name: "Select all rows shown" })
        await all.click()
        expect.equal((await checkedRows(scope)).join(","), "true,true,true,true,true,true", "every row on screen")
        expect.equal(await scope.locator('[data-slot="toolbar-count"]').innerText(), "6 selected", "the count")
        await scope.getByRole("checkbox", { name: "Select [Northside Vets]" }).click()
        expect.equal(await all.getAttribute("aria-checked"), "mixed", "select all says some are selected")
      },
    },
    {
      name: "Wider than its box, it scrolls inside a named region, and the row menu sticks to the right edge",
      example: "wide",
      async run({ scope, expect }) {
        const region = scope.getByRole("region", { name: "Subscriptions" })
        expect.equal(await region.getAttribute("tabindex"), "0", "it takes focus")
        expect(await region.evaluate((el) => el.scrollWidth > el.clientWidth), "the table is wider than its box")
        const gap = async () => {
          const r = await region.boundingBox()
          const menu = await scope.getByRole("button", { name: "More actions for [Coastal Dental Group]" }).boundingBox()
          return r.x + r.width - (menu.x + menu.width)
        }
        const before = await gap()
        await region.evaluate((el) => { el.scrollLeft = 240 })
        const after = await gap()
        expect(Math.abs(after - before) <= 1, `the menu keeps its place (${Math.round(before)} and ${Math.round(after)} from the edge)`)
        expect(after >= 0 && after <= 24, "at the right edge")
      },
    },
    {
      name: "Inside a card it draws no box, and its cells line up with the card's inset",
      example: "in-card",
      async run({ scope, expect }) {
        expect.equal(await style(scope.locator('[data-slot="data-table-box"]'), "borderTopWidth"), "0px", "no box of its own")
        const title = await scope.locator('[data-slot="card-title"]').boundingBox()
        const name = await scope.getByRole("button", { name: "[Harbour Physio]", exact: true }).boundingBox()
        expect(Math.abs(name.x - title.x) <= 1, `the first column lines up with the card's title (${Math.round(name.x)} and ${Math.round(title.x)})`)
      },
    },
    {
      name: "Reduced motion stands the skeletons still",
      example: "loading",
      reducedMotion: true,
      async run({ scope, expect }) {
        const shapes = await scope.locator('[data-slot="data-table-wide"] [data-slot="skeleton"]').all()
        expect.atLeast(shapes.length, 1, "skeletons")
        for (const shape of shapes) expect.equal(await style(shape, "animationName"), "none", "no shimmer")
      },
    },
  ],
}
