// Toolbar's one definition: its README, its preview board and its scripted checks all come from here.

/** A role's colour as the browser computes it in the current theme. */
const colourOf = (page, role) =>
  page.evaluate((r) => {
    const probe = document.createElement("span")
    probe.style.color = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, role)

const boxes = async (locator) => Promise.all((await locator.all()).map((el) => el.boundingBox()))

const FILTERS = `<x-import component-from-global-scope="NS.SearchField" placeholder="Search [invoices]" shortcut="/" size="sm" class="w-56"></x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n12}}" attention="{{yes}}">Needs approval</x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n4}}">Draft</x-import>
<x-import component-from-global-scope="NS.FilterChip" count="{{n31}}">Overdue</x-import>
<x-import component-from-global-scope="NS.Spacer"></x-import>
<x-import component-from-global-scope="NS.SegmentedControl" label="[Invoice] layout" options="{{layouts}}" default-value="list" size="sm"></x-import>
<x-import component-from-global-scope="NS.Button" variant="ghost" size="sm" icon="Download">Export</x-import>`

export default {
  name: "Toolbar",
  group: "Navigation",
  job: "One row of search, filters and view controls above a table or list, wrapping on narrow screens.",
  status: "proven",
  props: [
    { name: "label", type: "string", doc: "Required. Names the group for screen readers ([Record] filters)." },
    { name: "children", type: "ReactNode", doc: "Search first, then filter chips, a Spacer, then the view switcher and secondary actions." },
    { name: "selectedCount", type: "number", default: "0", doc: "How many rows are selected. Above zero, the filters give way to the bulk actions." },
    { name: "bulkActions", type: "Array<{ label: string; icon?: IconName; variant?: \"secondary\" | \"primary\" | \"danger\"; disabled?: boolean; onSelect?: () => void }>", doc: "The actions for the selected rows, as data, so a board can pass them. They act only on rows on screen." },
    { name: "onClearSelection", type: "() => void", doc: "Clears the selection. Focus then goes back to the filters, never to the page body." },
    { name: "summary", type: "ReactNode", doc: "With no filters, what the row says while nothing is selected: the count of what it acts on (12 issues), in the quiet text style. DataTable gives its own." },
    { name: "sticky", type: "boolean", default: "true", doc: "Sticks to the top of the scrolling area on the canvas colour while the table scrolls, except on a screen under 560px tall." },
  ],
  notes: {
    Behaviour: [
      "A group named by its label. Tab moves through its controls in reading order; each control keeps its own keys (arrows in a segmented control).",
      "It is a group rather than an ARIA toolbar, because that role promises arrow keys between controls, which would fight the search field's caret.",
      "With rows selected, the filters give way to a selection row: the count, the bulk actions and Clear selection. The count is announced politely as it changes.",
      "Pressing Clear selection, or a bulk action that ends the selection, puts focus on the first control in the filters, never on the page body.",
    ],
    Layout: [
      "Wraps by its own width, never the window. Controls stay 8px apart, and rows 8px apart when they wrap.",
      "12px of padding above and below its controls: it sits 12px above its table, and rows sliding under it while it sticks never touch the controls.",
      "At least 36px tall in both modes, 44px on touch, so selecting rows never moves the table.",
      "With no filters its row holds the summary, the count of what it acts on in the quiet text style, where the selected count will stand: never a blank band, and the same height when rows are selected. Clearing the selection then puts focus on the next control, the table's select-all.",
      "While it sticks, its scroller's scroll-padding-top reaches its foot, so a control Tab or Shift+Tab brings into view never comes to rest beneath it. On a screen under 560px tall (200% zoom on a laptop, a phone on its side) it stops sticking, because it would take most of the screen.",
    ],
    States: ["The filters stay mounted while rows are selected, so a search someone typed or a chip they pressed is still there when the selection clears."],
    Rules: [
      "Search first, then filter chips, a Spacer, then the view switcher and secondary actions.",
      "Keep the row to one size of control: chips are 32px, so the switcher and buttons beside them are sm.",
      "Bulk actions act only on rows on screen, and the count says how many.",
    ],
    Review: [
      "Focus fell to the page body after clearing a selection (rounds 3 and 4, section 2.6): a scripted check presses Clear selection from the keyboard.",
      "At 200% and 400% zoom, Shift+Tab up a list left the focused row under the sticking toolbar (WCAG 2.4.11, a pilot's round 1): checks tab up a list under it, and look on a short screen.",
      "A selectable table with bulk actions and no filters kept an empty row for them, a blank band above the table at 390 (a proof run, rounds 1 to 3). Collapsing it moved the table under the pointer at the moment of selection, which is worse, so the row says how many there are.",
    ],
  },
  examples: [
    {
      id: "filters",
      title: "Filters, then the view controls at the far end",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Toolbar" label="[Invoice] filters">
${FILTERS}
</x-import>`,
      vals: {
        n12: 12,
        n4: 4,
        n31: 31,
        yes: true,
        layouts: [
          { value: "list", label: "List", icon: "List" },
          { value: "board", label: "Board", icon: "Kanban" },
        ],
      },
    },
    {
      id: "selection",
      title: "With rows selected, the bulk actions take the filters' place",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Toolbar" label="[Invoice] filters, with a selection" selected-count="{{selected}}" bulk-actions="{{bulk}}" on-clear-selection="{{clearSelection}}">
${FILTERS}
</x-import>`,
      vals: { bulk: [{ label: "Send reminders", icon: "Send" }, { label: "Export", icon: "Download" }] },
    },
    {
      id: "scrolling",
      title: "Sticking over a list that scrolls",
      layout: "block",
      markup: `<div data-scroller="" style="height: 240px; overflow-y: auto; padding: 0 12px; border: 1px solid var(--line); border-radius: var(--radius-md);">
<x-import component-from-global-scope="NS.Toolbar" label="[Job] filters, over a list">
${FILTERS}
</x-import>
${Array.from({ length: 12 }, (_, i) => `<p style="margin: 0; padding: 8px 0;"><a href="#job-${1040 + i}">[Job ${1040 + i}]</a></p>`).join("\n")}
</div>`,
    },
    {
      id: "narrow",
      title: "In a narrow space it wraps",
      layout: "block",
      width: 380,
      markup: `<x-import component-from-global-scope="NS.Toolbar" label="[Invoice] filters, narrow">
${FILTERS}
</x-import>`,
    },
    {
      id: "bare",
      title: "With no filters, the count until rows are selected",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Toolbar" label="[Issue] actions" summary="[12] issues" selected-count="{{picked}}" bulk-actions="{{assign}}" on-clear-selection="{{clearPicked}}"></x-import>
<x-import component-from-global-scope="NS.Checkbox" label="Select all [issues]"></x-import>`,
      vals: { assign: [{ label: "Assign", icon: "UserCheck" }] },
    },
  ],
  frame: { width: 960, height: 860 },
  state: { selected: 3, picked: 2 },
  logic: "selected: self.state.selected, clearSelection: () => self.setState({ selected: 0 }), picked: self.state.picked, clearPicked: () => self.setState({ picked: 0 })",
  checks: [
    {
      name: "A group named by its label",
      example: "filters",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("group", { name: "[Invoice] filters", exact: true }).count(), 1, "the named group")
      },
    },
    {
      name: "The Spacer pushes the view controls to the far end",
      example: "filters",
      async run({ scope, expect }) {
        const row = await scope.locator('[data-slot="toolbar-row"]').boundingBox()
        const first = await scope.locator('[data-slot="search-field"]').first().boundingBox()
        const exportButton = await scope.getByRole("button", { name: "Export" }).boundingBox()
        expect.equal(Math.round(first.x), Math.round(row.x), "the search, first in the row, at the start")
        expect.equal(Math.round(exportButton.x + exportButton.width), Math.round(row.x + row.width), "Export at the far end")
      },
    },
    {
      name: "Controls sit 8px apart",
      example: "filters",
      async run({ scope, expect }) {
        const b = await boxes(scope.locator('[data-slot="filter-chip"]'))
        for (let i = 1; i < b.length; i++) expect.equal(Math.round(b[i].x - (b[i - 1].x + b[i - 1].width)), 8, "gap between chips")
      },
    },
    {
      name: "In a narrow space it wraps, and nothing overflows",
      example: "narrow",
      async run({ scope, expect }) {
        const row = scope.locator('[data-slot="toolbar-row"]')
        expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth), "nothing spills past the row")
        const tops = new Set((await boxes(scope.locator('[data-slot="filter-chip"], [data-slot="segmented-control"], [data-slot="button"]'))).map((b) => Math.round(b.y)))
        expect.atLeast(tops.size, 2, "rows of controls")
      },
    },
    {
      name: "Selecting rows swaps the filters for the count and the bulk actions",
      example: "selection",
      async run({ scope, expect }) {
        expect(!(await scope.locator('[data-slot="filter-chip"]').first().isVisible()), "the filters are out of sight")
        expect.equal(await scope.locator('[data-slot="toolbar-count"]').innerText(), "3 selected", "the count shows")
        for (const name of ["Send reminders", "Export", "Clear selection"]) expect(await scope.getByRole("button", { name }).isVisible(), `${name} shows`)
      },
    },
    {
      name: "Clearing the selection from the keyboard puts focus back in the filters, never on the page body",
      example: "selection",
      async run({ page, scope, expect }) {
        const clear = scope.getByRole("button", { name: "Clear selection" })
        await clear.focus()
        await page.keyboard.press("Enter")
        await scope.locator('[data-slot="toolbar-selection"]').waitFor({ state: "detached", timeout: 3000 })
        const where = await page.evaluate(() => ({ body: document.activeElement === document.body, placeholder: document.activeElement?.getAttribute("placeholder") }))
        expect(!where.body, "focus is not on the page body")
        expect.equal(where.placeholder, "Search [invoices]", "focus is on the first control in the filters, the search")
      },
    },
    {
      name: "With no filters it shows the count, not a blank band, keeps its height through a selection, and clearing puts focus on the next control",
      example: "bare",
      async run({ page, scope, expect }) {
        const toolbar = scope.locator('[data-slot="toolbar"]')
        expect.equal(await scope.locator('[data-slot="toolbar-count"]').innerText(), "2 selected", "the selection shows while rows are selected")
        const selecting = Math.round((await toolbar.boundingBox()).height)
        await scope.getByRole("button", { name: "Clear selection" }).focus()
        await page.keyboard.press("Enter")
        await scope.locator('[data-slot="toolbar-selection"]').waitFor({ state: "detached", timeout: 3000 })
        const summary = scope.locator('[data-slot="toolbar-summary"]')
        expect.equal((await summary.innerText()).trim(), "[12] issues", "the count stands where the selection was, so the row is never blank")
        expect.equal(Math.round((await toolbar.boundingBox()).height), selecting, "the same height with and without a selection, so the table never moves")
        const [ink, muted] = await summary.evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.color = "var(--text-muted)"
          el.append(probe)
          const out = [getComputedStyle(el).color, getComputedStyle(probe).color]
          probe.remove()
          return out
        })
        expect.equal(ink, muted, "in the quiet text colour")
        expect(await scope.getByRole("checkbox", { name: "Select all [issues]" }).evaluate((el) => el === document.activeElement), "focus is on the control after it, not the page body or the toolbar")
      },
    },
    {
      name: "The selected count is announced politely",
      example: "selection",
      async run({ scope, expect }) {
        const status = scope.locator('[data-slot="toolbar-status"]')
        expect.equal(await status.getAttribute("aria-live"), "polite", "polite")
        expect.equal(await status.textContent(), "3 selected", "says how many")
      },
    },
    {
      name: "It sticks to the top on an opaque canvas while the table scrolls, in both themes",
      example: "filters",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const s = await scope.locator('[data-slot="toolbar"]').evaluate((el) => ({ position: getComputedStyle(el).position, top: getComputedStyle(el).top, bg: getComputedStyle(el).backgroundColor }))
        expect.equal(s.position, "sticky", "position")
        expect.equal(s.top, "0px", "top")
        expect.equal(s.bg, await colourOf(page, "canvas"), "an opaque canvas behind the controls")
      },
    },
    {
      name: "While it sticks, Shift+Tab up the list never leaves the focused row under it",
      example: "scrolling",
      async run({ page, scope, expect }) {
        const toolbar = scope.locator('[data-slot="toolbar"]')
        const scroller = scope.locator("[data-scroller]")
        const height = Math.round((await toolbar.boundingBox()).height)
        expect.equal(await scroller.evaluate((el) => el.style.scrollPaddingTop), `${height}px`, "the scroller keeps the toolbar's height clear")
        await scope.getByRole("link", { name: "[Job 1051]" }).focus()
        for (let i = 0; i < 11; i++) {
          await page.keyboard.press("Shift+Tab")
          const where = await page.evaluate(() => {
            const el = document.activeElement
            const bar = el.closest('[data-scroller]')?.querySelector('[data-slot="toolbar"]')
            if (!bar || bar.contains(el)) return null
            const r = el.getBoundingClientRect()
            return { name: el.textContent.trim(), top: Math.round(r.top), under: Math.round(bar.getBoundingClientRect().bottom), hit: el.contains(document.elementFromPoint(r.left + 4, r.top + r.height / 2)) }
          })
          if (!where) break
          expect(where.top >= where.under - 1 && where.hit, `${where.name} came to rest at ${where.top}px, under the toolbar's foot at ${where.under}px`)
        }
      },
    },
    {
      name: "On a screen under 560px tall it stops sticking, and keeps nothing clear for itself",
      example: "scrolling",
      viewport: { width: 1280, height: 480 },
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="toolbar"]').evaluate((el) => getComputedStyle(el).position), "static", "it scrolls with the list")
        expect.equal(await scope.locator("[data-scroller]").evaluate((el) => el.style.scrollPaddingTop), "", "no scroll padding for a toolbar that does not stick")
      },
    },
    {
      name: "Selecting rows never changes its height",
      async run({ page, expect }) {
        const filters = await page.locator('[data-example="filters"] [data-slot="toolbar"]').boundingBox()
        const selection = await page.locator('[data-example="selection"] [data-slot="toolbar"]').boundingBox()
        expect.equal(Math.round(selection.height), Math.round(filters.height), "the same height in both modes")
      },
    },
    {
      name: "On touch the controls grow and stay 8px apart",
      example: "filters",
      touch: true,
      async run({ scope, expect }) {
        const b = await boxes(scope.locator('[data-slot="filter-chip"]'))
        for (const x of b) expect.equal(Math.round(x.height), 40, "chip height on touch")
        for (let i = 1; i < b.length; i++) expect.equal(Math.round(b[i].x - (b[i - 1].x + b[i - 1].width)), 8, "gap on touch")
      },
    },
  ],
}
