// Board's one definition: its README, its preview board and its scripted checks all come from here.

const columns = [
  { id: "to-quote", title: "To quote", attention: true },
  { id: "quoted", title: "Quoted" },
  { id: "booked", title: "Booked" },
  { id: "done", title: "Done" },
]
const cards = [
  { id: "j1", column: "to-quote", title: "[Replace hot water system]", meta: "[Harbour Physio], site visit Mon", badge: { label: "Overdue", tone: "danger" }, href: "#j1" },
  { id: "j2", column: "to-quote", title: "[Fix leaking tap]", meta: "[Northside Vets], asked 2 days ago", person: "[Priya Nair]", href: "#j2" },
  { id: "j3", column: "quoted", title: "[Rewire the shopfront]", meta: "[Coastal Dental], [$4,280] sent Tue", badge: { label: "Waiting on client", tone: "neutral" }, href: "#j3" },
  { id: "j4", column: "quoted", title: "[Install a split system]", meta: "[Muddy Paws Grooming], [$3,150]", badge: { label: "Due soon", tone: "warning" }, href: "#j4" },
  { id: "j5", column: "booked", title: "[Service the boiler]", meta: "Thu 6 Nov, 9:00 am", person: "[Sam Lee]", badge: { label: "Scheduled", tone: "info" }, href: "#j5" },
  { id: "j6", column: "booked", title: "[Replace smoke alarms]", meta: "Fri 7 Nov, 1:30 pm", person: "[Alex Chen]", href: "#j6" },
]

async function tabTo(page, locator, max = 60) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}
// A menu is ready for keys once it has finished opening (see Menu's checks).
const ready = async (locator) => {
  await locator.waitFor()
  await locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
  await locator.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}
// The column a card sits in, read from the page.
const columnOf = (scope, title) =>
  scope.locator('[data-slot="board-card"]', { hasText: title }).evaluate((el) => el.closest('[data-slot="board-column"]').dataset.column)
const status = (scope) => scope.locator('[data-slot="board-status"]').evaluate((el) => el.textContent.replace(/ /g, " ").trim())
const focused = (page) => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.trim() ?? null)
const centre = async (locator) => {
  const b = await locator.boundingBox()
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}
// Counts presses that would open a card. A click the board swallows never reaches the window; one that
// gets through is counted and stopped here, so the page stays put for the rest of the check.
const watchOpens = (page) =>
  page.evaluate(() => {
    window.__opened = 0
    window.addEventListener("click", (e) => {
      if (!e.target.closest?.('[data-slot="board-card-link"]')) return
      if (!e.defaultPrevented) window.__opened++
      e.preventDefault()
    })
  })
const opened = (page) => page.evaluate(() => new Promise((done) => setTimeout(() => done(window.__opened), 50)))
// Records each card that starts an animation, so a check sees movement however quickly it ends.
const watchMotion = (page) =>
  page.evaluate(() => {
    window.__moved = []
    const animate = Element.prototype.animate
    Element.prototype.animate = function (...args) {
      if (this.dataset?.card && [].concat(args[0]).some((k) => k && k.transform)) window.__moved.push(this.dataset.card)
      return animate.apply(this, args)
    }
  })
// Waits for a card's animations to finish, so a measurement sees where it comes to rest.
const settled = (locator) => locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export default {
  name: "Board",
  group: "Data",
  job: "Records in columns by stage, for work that moves through steps.",
  status: "to build",
  props: [
    { name: "columns", type: "{ id: string; title: string; attention?: boolean }[]", doc: "The stages, in order. attention makes a column's count the highlight, read as 3 need you." },
    { name: "cards", type: "{ id: string; column: string; title: string; meta?: string; badge?: { label: string; tone?: BadgeTone }; person?: string; href?: string }[]", doc: "The records, each naming its column. Their order in the list is their order in the column." },
    { name: "label", type: "string", required: true, doc: "Names the board for screen readers: Jobs by stage." },
    { name: "onMove", type: "(move: { id: string; column: string; index: number }) => void", doc: "Called after a card moves, by its menu or a drag. The board shows the move at once; keep it in your data here." },
    { name: "onOpen", type: "(id: string) => void", doc: "Opens a card that has no href. The title becomes its button." },
    { name: "noun", type: "[string, string]", default: '["item", "items"]', doc: "What a count is read as, one and many: [\"job\", \"jobs\"]." },
    { name: "loading", type: "boolean", default: "false", doc: "Skeleton cards in each column, said once as Loading [label]." },
    { name: "error", type: "ReactNode", doc: "The cards could not load: name the system that failed. Cards given stay, as the last good copy." },
    { name: "empty", type: "ReactNode", default: '"Nothing here yet"', doc: "What an empty column says, in a dashed space a card can be dropped into." },
  ],
  notes: {
    Behaviour: [
      "Moving never depends on dragging. Every card has a Move button, named Move [card], whose menu moves it to any other column, or up and down its own. It is the keyboard path and the single-pointer path (WCAG 2.5.7).",
      "After a move by the menu, focus stays on the card in its new place, on its Move button. A drag keeps focus wherever it was.",
      "Every move is announced politely: Moved [card] to [column], or its place within the column (Moved [card] to 1 of 3 in [column]).",
      "A mouse drags a card from anywhere on it. On a touch screen the grip handle drags, so a swipe on a card still scrolls the page. A line shows where it will land, the column under it takes the hover wash, and the board scrolls when the card nears its edge. Escape puts it back. The press that ends a drag never opens the card.",
      "Each column is a list labelled by its name, with the count in words. Each card's title is its link or button and covers the card; the Move button sits above it.",
    ],
    Layout: [
      "Columns share the board's width, 240px at least, and the board scrolls sideways when they do not fit. Under 640px of its own width each column takes most of the width and snaps into place, with the next one peeking in.",
      "A card follows ListRow: the title in bold, a meta line saying what it is and what is next, then the person and a badge on a line of their own, so a badge is never squeezed to its dot.",
    ],
    States: [
      "Rest, hover, focus, being moved (lifted and following the pointer, outlined in forced colours), and just moved (a moment in the highlight's quiet ground). Under reduced motion a moved card appears in its new place; otherwise it travels there.",
      "A column count is grey, or the highlight with attention, and zero shows nothing. An empty column says so in a dashed space a card can be dropped into.",
      "Loading shows skeleton cards and says Loading [label] once. An error names the system and keeps the cards.",
    ],
    Copy: [
      "Columns are stages in a word or two (To quote, Booked). Cards name the record, then what it is and what is next ([Client], quote due Fri).",
      "The menu's actions are Move to [column], Move up and Move down.",
    ],
    Rules: [
      "For work that moves through stages. A list that only needs sorting or filtering is a DataTable.",
      "One state per card, as a Badge with the system's status words. A count that waits on the reader takes attention; the rest stay grey.",
    ],
  },
  frame: { width: 1120, height: 1460 },
  examples: [
    {
      id: "jobs",
      title: "Jobs by stage",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Board" label="Jobs by stage" columns="{{columns}}" cards="{{cards}}" noun="{{jobNoun}}"></x-import>`,
      vals: { columns, cards, jobNoun: ["job", "jobs"] },
    },
    {
      id: "phone",
      title: "Under 640px of its own width, one column at a time",
      markup: `<div style="width: 360px;"><x-import component-from-global-scope="NS.Board" label="Jobs by stage, narrow" columns="{{columns}}" cards="{{cards}}" noun="{{jobNoun}}"></x-import></div>`,
    },
    {
      id: "states",
      title: "Loading, and an error that keeps the last good copy",
      layout: "stack",
      markup: `<div style="width: 100%;"><x-import component-from-global-scope="NS.Board" label="Jobs by stage, loading" columns="{{threeColumns}}" cards="{{none}}" loading="{{yes}}"></x-import></div>
<div style="width: 100%;"><x-import component-from-global-scope="NS.Board" label="Jobs by stage, stale" columns="{{threeColumns}}" cards="{{someCards}}" error="{{boardError}}"></x-import></div>`,
      vals: {
        threeColumns: columns.slice(0, 3),
        none: [],
        yes: true,
        someCards: cards.slice(0, 3),
        boardError: "[The job system] did not respond, so these may be out of date. Showing the copy from 9:12 am.",
      },
    },
  ],
  checks: [
    {
      name: "The Move menu moves a card by keyboard, the move is announced, and focus stays on the card in its new column",
      example: "jobs",
      async run({ page, scope, expect }) {
        const move = scope.getByRole("button", { name: "Move [Fix leaking tap]" })
        expect(await tabTo(page, move), "Tab reaches the card's Move button")
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: "Move [Fix leaking tap]" })
        await ready(menu)
        const whileOpen = await page.evaluate(() => getComputedStyle(document.body).pointerEvents === "none" && Boolean(document.querySelector('[data-example="jobs"] [data-slot="board"]').closest('[aria-hidden="true"]')))
        expect(whileOpen, "while open, the menu holds the page, as a modal menu does")
        const actions = await menu.getByRole("menuitem").allInnerTexts()
        expect.equal(actions.map((s) => s.trim()).join(" | "), "Move to Quoted | Move to Booked | Move to Done | Move up", "the menu offers every other column, then up")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("Enter")
        await menu.waitFor({ state: "hidden" })
        expect.equal(await columnOf(scope, "[Fix leaking tap]"), "booked", "the card is in Booked")
        expect.equal(await status(scope), "Moved [Fix leaking tap] to Booked.", "the move is announced")
        await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Move [Fix leaking tap]", null, { timeout: 3000 })
        const inBooked = await page.evaluate(() => document.activeElement?.closest('[data-slot="board-column"]')?.dataset.column)
        expect.equal(inBooked, "booked", "focus is on the card's Move button, in its new column")
        expect.equal(await scope.locator('[data-column="booked"] [data-slot="board-card"]').first().innerText().then((t) => t.split("\n")[0]), "[Fix leaking tap]", "it went to the top of Booked")
        // The menu went with the card's old place: nothing it set on the page while open may linger.
        const left = await page.evaluate(() => ({
          pointer: getComputedStyle(document.body).pointerEvents,
          hidden: Boolean(document.querySelector('[data-example="jobs"] [data-slot="board"]').closest('[aria-hidden="true"]')),
        }))
        expect.equal(left.pointer, "auto", "the page takes presses again")
        expect.equal(left.hidden, false, "the board is not left hidden from screen readers")
      },
    },
    {
      name: "Move up and Move down reorder a column from the keyboard, announced with the card's place",
      example: "jobs",
      async run({ page, scope, expect }) {
        const move = scope.getByRole("button", { name: "Move [Install a split system]" })
        expect(await tabTo(page, move), "Tab reaches the second card's Move button")
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: "Move [Install a split system]" })
        await ready(menu)
        await page.keyboard.press("End")
        expect.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "Move up", "End reaches Move up, the last action")
        await page.keyboard.press("Enter")
        await menu.waitFor({ state: "hidden" })
        const titles = await scope.locator('[data-column="quoted"] [data-slot="board-card-link"]').allInnerTexts()
        expect.equal(titles.join(" | "), "[Install a split system] | [Rewire the shopfront]", "the card moved up")
        expect.equal(await status(scope), "Moved [Install a split system] to 1 of 2 in Quoted.", "the new place is announced")
        expect.equal(await focused(page), "Move [Install a split system]", "focus stays on its Move button")
      },
    },
    {
      name: "A card dragged with the mouse lands where it is dropped, the move is announced, and the drop does not open it",
      example: "jobs",
      async run({ page, scope, expect }) {
        await watchOpens(page)
        const card = scope.locator('[data-slot="board-card"]', { hasText: "[Rewire the shopfront]" })
        const from = await centre(card.locator('[data-slot="board-card-meta"]'))
        const empty = await centre(scope.locator('[data-column="done"] [data-slot="board-column-empty"]'))
        await page.mouse.move(from.x, from.y)
        await page.mouse.down()
        await page.mouse.move(from.x + 30, from.y + 6, { steps: 4 })
        expect.equal(await card.getAttribute("data-dragging"), "true", "the card is lifted once it moves")
        await page.mouse.move(empty.x, empty.y, { steps: 12 })
        expect.equal(await scope.locator('[data-column="done"]').getAttribute("data-drop-target"), "", "the column under it is marked as the drop target")
        await page.mouse.up()
        expect.equal(await columnOf(scope, "[Rewire the shopfront]"), "done", "the card is in Done")
        expect.equal(await status(scope), "Moved [Rewire the shopfront] to Done.", "the move is announced")
        expect.equal(await opened(page), 0, "the press that ended the drag did not open the card")
        // Within a column the card keeps its element, so its link is still under the pointer as the press ends.
        const smoke = scope.locator('[data-slot="board-card"]', { hasText: "[Replace smoke alarms]" })
        const grip = await centre(smoke.locator('[data-slot="board-card-link"]'))
        const above = await scope.locator('[data-slot="board-card"]', { hasText: "[Service the boiler]" }).boundingBox()
        await page.mouse.move(grip.x, grip.y)
        await page.mouse.down()
        await page.mouse.move(grip.x, above.y + 6, { steps: 10 })
        await page.mouse.up()
        const titles = await scope.locator('[data-column="booked"] [data-slot="board-card-link"]').allInnerTexts()
        expect.equal(titles.join(" | "), "[Replace smoke alarms] | [Service the boiler]", "the card moved up its column")
        expect.equal(await status(scope), "Moved [Replace smoke alarms] to 1 of 2 in Booked.", "the new place is announced")
        expect.equal(await opened(page), 0, "letting go over its own title did not open it")
        // And a plain press, with no drag, still opens the card.
        await scope.getByRole("link", { name: "[Service the boiler]" }).click()
        expect.equal(await opened(page), 1, "a press that is not a drag opens the card")
      },
    },
    {
      name: "Escape during a drag puts the card back where it was, and nothing is announced",
      example: "jobs",
      async run({ page, scope, expect }) {
        await watchOpens(page)
        const card = scope.locator('[data-slot="board-card"]', { hasText: "[Service the boiler]" })
        const from = await centre(card.locator('[data-slot="board-card-meta"]'))
        const to = await centre(scope.locator('[data-column="to-quote"] [data-slot="board-card"]').first())
        await page.mouse.move(from.x, from.y)
        await page.mouse.down()
        await page.mouse.move(to.x, to.y, { steps: 12 })
        await page.keyboard.press("Escape")
        await page.mouse.up()
        expect.equal(await columnOf(scope, "[Service the boiler]"), "booked", "the card stayed in Booked")
        expect.equal(await card.getAttribute("data-dragging"), null, "it is no longer lifted")
        expect.equal(await status(scope), "", "nothing was announced")
        // Cancelled over its own title, with a pause before letting go: the release still opens nothing.
        await settled(card)
        const title = await centre(card.locator('[data-slot="board-card-link"]'))
        await page.mouse.move(title.x, title.y)
        await page.mouse.down()
        await page.mouse.move(title.x + 24, title.y, { steps: 4 })
        expect.equal(await card.getAttribute("data-dragging"), "true", "the card is lifted again")
        await page.keyboard.press("Escape")
        await page.waitForTimeout(120)
        await settled(card)
        await page.mouse.move(title.x, title.y)
        expect.equal(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.dataset.slot, [title.x, title.y]), "board-card-link", "the release lands on the card's own title")
        await page.mouse.up()
        expect.equal(await opened(page), 0, "letting go after Escape did not open the card")
        expect.equal(await status(scope), "", "still nothing announced")
      },
    },
    {
      name: "A card let go far outside the board goes back where it was, never into the nearest column",
      example: "jobs",
      async run({ page, scope, expect }) {
        const card = scope.locator('[data-slot="board-card"]', { hasText: "[Replace smoke alarms]" })
        const from = await centre(card.locator('[data-slot="board-card-meta"]'))
        const board = await scope.locator('[data-slot="board-columns"]').boundingBox()
        await page.mouse.move(from.x, from.y)
        await page.mouse.down()
        await page.mouse.move(board.x + board.width - 40, board.y + board.height + 160, { steps: 12 })
        await page.mouse.up()
        expect.equal(await columnOf(scope, "[Replace smoke alarms]"), "booked", "the card stayed in Booked")
        expect.equal(await status(scope), "", "nothing was announced")
      },
    },
    {
      name: "Column counts are read in words, the attention count takes the highlight, and an empty column shows no count",
      example: "jobs",
      async run({ scope, expect }) {
        const heading = (col) => scope.locator(`[data-column="${col}"] [data-slot="board-column-title"]`).evaluate((el) => el.textContent.trim())
        expect.equal(await heading("to-quote"), "To quote, 2 need you", "an attention count")
        expect.equal(await heading("quoted"), "Quoted, 2 jobs", "a grey count, in the board's noun")
        expect.equal(await heading("done"), "Done", "zero says nothing")
        expect.equal(await scope.locator('[data-column="done"] [data-slot="board-column-count"]').count(), 0, "zero shows no count")
        expect.equal(await scope.locator('[data-column="to-quote"] [data-slot="board-column-count"]').getAttribute("data-attention"), "true", "the attention count is marked")
        const list = scope.locator('[data-column="quoted"] ul')
        const named = await list.evaluate((ul) => document.getElementById(ul.getAttribute("aria-labelledby"))?.textContent.trim())
        expect.equal(named, "Quoted, 2 jobs", "each column's list is labelled by its name and count")
        expect.equal((await scope.locator('[data-column="done"] [data-slot="board-column-empty"]').innerText()).trim(), "Nothing here yet", "an empty column says so")
      },
    },
    {
      name: "Each card's title is its link, and its Move button names the card",
      example: "jobs",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "[Service the boiler]" }).count(), 1, "the title is the card's link, named by it")
        expect.equal(await scope.getByRole("button", { name: /^Move \[/ }).count(), 6, "every card has a Move button")
        const covers = await scope.locator('[data-slot="board-card"]').first().evaluate((li) => {
          const a = li.querySelector('[data-slot="board-card-link"]')
          const r = li.getBoundingClientRect()
          const hit = document.elementFromPoint(r.left + 8, r.bottom - 8)
          return hit === a || a.contains(hit)
        })
        expect(covers, "a press near the card's bottom corner lands on its link")
      },
    },
    {
      name: "On a touch screen the Move button grows to 40px and the drag handle shows",
      example: "jobs",
      touch: true,
      async run({ scope, expect }) {
        const box = await scope.getByRole("button", { name: "Move [Fix leaking tap]" }).boundingBox()
        expect.atLeast(Math.round(box.height), 40, "Move button height on touch")
        expect.atLeast(Math.round(box.width), 40, "Move button width on touch")
        const handle = scope.locator('[data-slot="board-card-handle"]').first()
        expect(await handle.isVisible(), "the handle shows on touch")
        expect.equal(await handle.evaluate((el) => getComputedStyle(el).touchAction), "none", "the handle takes the touch, so dragging it never scrolls the page")
      },
    },
    {
      name: "A moved card travels to its new place",
      example: "jobs",
      async run({ page, scope, expect }) {
        await watchMotion(page)
        expect(await tabTo(page, scope.getByRole("button", { name: "Move [Replace smoke alarms]" })), "Tab reaches the Move button")
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: "Move [Replace smoke alarms]" })
        await ready(menu)
        await page.keyboard.press("Enter")
        await menu.waitFor({ state: "hidden" })
        expect.equal(await page.evaluate(() => window.__moved.join(",")), "j6", "the moved card, and only it, animates into place")
      },
    },
    {
      name: "Under reduced motion a moved card appears in place, with no movement",
      example: "jobs",
      reducedMotion: true,
      async run({ page, scope, expect }) {
        await watchMotion(page)
        expect(await tabTo(page, scope.getByRole("button", { name: "Move [Replace smoke alarms]" })), "Tab reaches the Move button")
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: "Move [Replace smoke alarms]" })
        await ready(menu)
        await page.keyboard.press("Enter")
        await menu.waitFor({ state: "hidden" })
        expect.equal(await columnOf(scope, "[Replace smoke alarms]"), "to-quote", "it moved to the first other column")
        expect.equal(await page.evaluate(() => window.__moved.length), 0, "no card moved by animation")
      },
    },
    {
      name: "Forced colours keep the card being moved and the drop line visible",
      example: "jobs",
      forcedColors: true,
      async run({ page, scope, expect }) {
        const card = scope.locator('[data-slot="board-card"]', { hasText: "[Fix leaking tap]" })
        const from = await centre(card.locator('[data-slot="board-card-meta"]'))
        const to = scope.locator('[data-column="quoted"] [data-slot="board-card"]').first()
        const b = await to.boundingBox()
        await page.mouse.move(from.x, from.y)
        await page.mouse.down()
        await page.mouse.move(b.x + b.width / 2, b.y + 6, { steps: 12 })
        const lifted = await card.evaluate((el) => `${getComputedStyle(el).outlineStyle} ${getComputedStyle(el).outlineWidth}`)
        expect.equal(lifted, "solid 2px", "the card being moved is outlined")
        const line = await to.evaluate((el) => `${el.dataset.drop} ${getComputedStyle(el, "::before").borderTopStyle} ${getComputedStyle(el, "::before").borderTopWidth}`)
        expect.equal(line, "before solid 2px", "the drop line is a border, which forced colours keep")
        const rest = await scope.locator('[data-slot="board-card"]', { hasText: "[Service the boiler]" }).evaluate((el) => getComputedStyle(el).outlineStyle)
        expect.equal(rest, "none", "no outline on a card at rest")
        await page.mouse.up()
      },
    },
    {
      name: "Card text holds 4.5:1 on the card, in both themes",
      example: "jobs",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const card of await scope.locator('[data-slot="board-card"]').all()) {
          const [ground, title, meta] = await card.evaluate((el) => [
            getComputedStyle(el).backgroundColor,
            getComputedStyle(el.querySelector('[data-slot="board-card-link"]')).color,
            getComputedStyle(el.querySelector('[data-slot="board-card-meta"]')).color,
          ])
          expect.atLeast(Math.round(contrast(title, ground) * 100) / 100, 4.5, `${theme} title`)
          expect.atLeast(Math.round(contrast(meta, ground) * 100) / 100, 4.5, `${theme} meta line`)
        }
      },
    },
    {
      name: "Loading says so once, and an error names the system and keeps the cards",
      example: "states",
      async run({ page, scope, expect }) {
        expect.equal((await scope.getByRole("status").filter({ hasText: "Loading" }).innerText()).trim(), "Loading Jobs by stage, loading", "loading is said once")
        expect.equal(await scope.locator('[data-slot="board"][aria-busy="true"] [data-slot="board-card"]').count(), 0, "no cards while loading")
        expect((await scope.locator('[data-slot="board-error"]').innerText()).includes("[The job system] did not respond"), "the error names the system")
        expect.equal(await scope.locator('[data-slot="board"]:not([aria-busy]) [data-slot="board-card"]').count(), 3, "the last good cards stay")
        // With nothing kept, the columns are unknown rather than empty, so none says Nothing here yet.
        const said = await page.evaluate((cols) => {
          const kit = Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)
          const host = document.createElement("div")
          document.body.append(host)
          window.ReactDOM.flushSync(() => window.ReactDOM.createRoot(host).render(window.React.createElement(kit.Board, { label: "Jobs", columns: cols, cards: [], error: "[The job system] did not respond." })))
          const out = { empty: host.querySelectorAll('[data-slot="board-column-empty"]').length, error: host.querySelector('[data-slot="board-error"]')?.textContent }
          host.remove()
          return out
        }, columns)
        expect.equal(said.empty, 0, "no column claims to be empty when the cards failed to load")
        expect.equal(said.error, "[The job system] did not respond.", "the error says what failed")
      },
    },
    {
      name: "Under 640px of its own width each column takes most of the width and snaps",
      example: "phone",
      async run({ scope, expect }) {
        const columns = scope.locator('[data-slot="board-columns"]')
        const snap = await columns.evaluate((el) => getComputedStyle(el).scrollSnapType)
        expect(snap.startsWith("x"), `the columns snap sideways (${snap})`)
        const first = await scope.locator('[data-slot="board-column"]').first().boundingBox()
        expect(first.width >= 290 && first.width <= 320, `a column is most of the 360px board (${Math.round(first.width)}px)`)
      },
    },
  ],
}
