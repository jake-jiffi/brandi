// ListRow's one definition. On a canvas, rows go in a List as its items: a List renders each one as a list
// item, which a row mounted on its own inside a list could not be.

const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement)
async function tabTo(page, locator, max = 30) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await isFocused(locator)) return true
  }
  return false
}
/** A role's colour as the browser computes it in the current theme. */
const colourOf = (page, role, prop = "color") =>
  page.evaluate(([r, p]) => {
    const probe = document.createElement("span")
    probe.style[p] = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe)[p]
    probe.remove()
    return value
  }, [role, prop])
const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)
const channels = (css) => {
  const rgb = /rgba?\(([^)]+)\)/.exec(css)
  if (rgb) return rgb[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number)
  const srgb = /color\(srgb ([^)]+)\)/.exec(css)
  if (srgb) return srgb[1].split(/\s+/).slice(0, 3).map((v) => Number(v) * 255)
  throw new Error(`cannot read the colour ${css}`)
}
const luminance = (css) => {
  const [r, g, b] = channels(css).map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const row = (scope, name) => scope.locator('[data-slot="list-row"]', { hasText: name })

const anatomy = [
  { id: "t1", avatar: "[Priya Nair]", title: "[Priya Nair]", meta: "Timesheet for [3 to 9 June] · [38.5 h]", badge: { label: "Needs you", tone: "highlight" }, unread: true, href: "#timesheet-priya" },
  { id: "i1", icon: "Receipt", title: "Invoice [1042]", meta: "[Harbour Physio] · due [Friday]", trailing: "[$4,280.00]", chevron: true, href: "#invoice-1042" },
  { id: "l1", avatar: "[Sam Lee]", title: "[Sam Lee]", meta: "Leave from [14 July] · [3] days", badge: { label: "Approved", tone: "success" }, href: "#leave-sam" },
  { id: "n1", icon: "Bell", title: "Payroll closes on [Thursday]", meta: "Anything approved after [5 pm] goes in the next pay run." },
]

const queue = [
  { id: "q1", avatar: "[Priya Nair]", title: "[Priya Nair]", meta: "Timesheet · [38.5 h] · waiting [2] days", badge: { label: "Needs you", tone: "highlight" }, href: "#queue-priya" },
  { id: "q2", avatar: "[Marcus Chen]", title: "[Marcus Chen]", meta: "Timesheet · [41 h] · [3 h] overtime", badge: { label: "Overtime", tone: "warning" }, href: "#queue-marcus", selected: true },
  { id: "q3", avatar: "[Ana Silva]", title: "[Ana Silva]", meta: "Timesheet · [36 h]", badge: { label: "Ready", tone: "info" }, href: "#queue-ana" },
]

const LONG_TITLE = "Superannuation guarantee statement for [Harbour Physio Pty Ltd], [April to June]"
const long = [
  { id: "s1", icon: "FileText", title: LONG_TITLE, meta: "Lodged by [Sam Lee] · due [28 July] · [12] staff", badge: { label: "Needs approval", tone: "highlight" }, href: "#statement-1" },
  { id: "s2", icon: "FileText", title: "BAS for [April to June]", meta: "Drafted by the assistant · [3] questions", badge: { label: "Draft", tone: "ai" }, href: "#statement-2" },
  { id: "s4", icon: "Receipt", title: "Invoice [1047] for [Bayside Dental]", meta: "Sent [4 June] · due [30 June]", trailing: "[$880.00]", href: "#statement-4" },
  { id: "s3", icon: "Receipt", title: "Invoice [1046] for [Hillcrest Pharmacy]", meta: "Sent [3 June] · due [28 June]", badge: { label: "Waiting on finance approval", tone: "warning" }, trailing: "[$12,640.75]", chevron: true, href: "#statement-3" },
]

export default {
  name: "ListRow",
  group: "Data",
  job: "One record in a List: a lead, a bold title, a meta line, and a trailing badge, value or chevron.",
  status: "proven",
  props: [
    { name: "title", type: "ReactNode", required: true, doc: "Names the record, in bold." },
    { name: "meta", type: "ReactNode", doc: "What it is, and what is next: \"Invoice 1042 · due Friday\"." },
    { name: "avatar", type: "string | { name: string; src?: string }", doc: "A person: their name, which draws their initials on a tint, or a name and a photo." },
    { name: "icon", type: "IconName", doc: "An icon tile, for a record that is not a person. Ignored beside an avatar." },
    { name: "badge", type: '{ label: string; tone?: "success" | "warning" | "danger" | "info" | "ai" | "highlight" | "neutral" } | ReactNode', doc: "One badge at the end of the row. Under 480px of list it moves under the text, whole." },
    { name: "badges", type: 'Array<{ label: string; tone?: "success" | "warning" | "danger" | "info" | "ai" | "highlight" | "neutral" }>', doc: "Badges on a line of their own under the meta line, as a table's phone list shows them." },
    { name: "trailing", type: "ReactNode", doc: "A value at the end, such as an amount, in tabular figures." },
    { name: "chevron", type: "boolean", default: "false", doc: "A chevron at the end, for a row that opens a record." },
    { name: "selected", type: "boolean", default: "false", doc: "The open row: the record shown beside the list. The strong tint, an edge, and aria-current." },
    { name: "unread", type: "boolean", default: "false", doc: "Shows a dot, and adds (unread) for screen readers." },
    { name: "href", type: "string", doc: "Opens a record: the whole row is one link, named by its title." },
    { name: "onClick", type: "() => void", doc: "Opens a record or acts: the whole row is one button." },
    { name: "leading", type: "ReactNode", doc: "A control before the lead, such as a selection checkbox. Pressing it never opens the row." },
    { name: "action", type: "ReactNode", doc: "A control at the far end, such as the row's menu. It stays pressable and stays on the right." },
  ],
  notes: {
    Behaviour: [
      "With href or onClick the whole row is one link or button, named by its title and described by its meta line and badge. Tab reaches it once; Enter opens it.",
      "A leading checkbox and an action at the end sit above the row's link and stay pressable. Pressing them never opens the row.",
      "unread shows a dot and adds (unread) to the row's name for screen readers.",
      "The open row carries aria-current, so a screen reader says which record is beside the list.",
    ],
    Layout: [
      "On a wide list, long text in a row that opens is cut with an ellipsis, and shows in full on hover, on keyboard focus and on a long press. A row that opens nothing wraps instead, because nothing could show the rest.",
      "Under 480px of list the row wraps: the text runs to as many lines as it needs, and a badge, or a value beside a badge, moves under it, whole. A short value alone stays on the right, beside the title. The action stays on the right. On a wider row the text keeps at least 192px, and a badge that would take it moves under the text, whole, too.",
      "16px in from the list's edges, 24px inside a card, lining up with its title; 12px above and below. An avatar is 40px beside a meta line, 32px without one. A leading checkbox sits on the title's line.",
    ],
    States: [
      "Hover takes the hover wash and a press the pressed wash, on rows that open.",
      "selected marks the open row: selected-strong with a selected-line edge, and quiet text turns text-muted. Focus draws 4px inside that edge, in text-strong, so a focused open row shows both, at 3:1 or better in both themes.",
      "unread adds the dot, in the highlight role, which forced colours keep as a marked area.",
    ],
    Copy: ["The meta line answers what it is, and what is next: \"Timesheet · 38.5 h · waiting 2 days\"."],
    Rules: [
      "The meta line answers \"what is it, and what is next\". A badge is never squeezed to its dot.",
      "One badge at the end. More than one state belongs in badges, on a line of their own.",
      "In a list beside its detail, the open row is selected. Up and Down between rows is left to the page, as the reference left it.",
    ],
    Review: [
      "The selected row showed no focus (round 2): a check tabs to the open row and measures the ring against its tint, in both themes.",
      "Badges were squeezed to their dots (round 4): a check measures the badge whole beside a long title, and under it on a narrow list.",
    ],
    Accepted: [
      "Focus on the open row draws in text-strong rather than the focus colour. The fixture's dark focus colour held 2.8:1 on the dark selected tint, under the 3:1 a focus ring needs; text-strong holds it in both themes.",
    ],
  },
  frame: { width: 960, height: 1500 },
  state: { approved: "" },
  logic: `withAction: [
  {
    id: "a1",
    avatar: "[Priya Nair]",
    title: "[Priya Nair]",
    meta: "Timesheet for [3 to 9 June] · [38.5 h]",
    href: "#approve-priya",
    action: window.React.createElement(NS.Button, { size: "sm", icon: "Check", onClick: () => self.setState({ approved: "[Priya Nair]" }) }, "Approve"),
  },
  { id: "a2", avatar: "[Ana Silva]", title: "[Ana Silva]", meta: "Timesheet for [3 to 9 June] · [36 h]", href: "#approve-ana", badge: { label: "Approved", tone: "success" } },
],
approvedLine: self.state.approved ? "Approved " + self.state.approved + "." : "Nothing approved yet."`,
  examples: [
    {
      id: "anatomy",
      title: "Lead, title, meta, and a badge, a value or a chevron",
      layout: "block",
      markup: `<div class="max-w-xl"><x-import component-from-global-scope="NS.List" items="{{anatomy}}"></x-import></div>`,
      vals: { anatomy },
    },
    {
      id: "selected",
      title: "The open row, beside its record",
      layout: "block",
      markup: `<div style="width: 520px"><x-import component-from-global-scope="NS.List" items="{{queue}}"></x-import></div>`,
      vals: { queue },
    },
    {
      id: "wide",
      title: "On a wide list, long text is cut and shows in full on hover and focus",
      layout: "block",
      markup: `<div style="width: 520px"><x-import component-from-global-scope="NS.List" items="{{long}}"></x-import></div>`,
      vals: { long },
    },
    {
      id: "narrow",
      title: "Under 480px of list it wraps, and the badge moves under the text",
      layout: "block",
      markup: `<div style="width: 360px"><x-import component-from-global-scope="NS.List" items="{{long}}"></x-import></div>`,
    },
    {
      id: "action",
      title: "An action at the end stays pressable",
      layout: "block",
      markup: `<div class="max-w-xl"><x-import component-from-global-scope="NS.List" items="{{withAction}}"></x-import></div>
<p data-slot="example-status" class="type-meta text-text-muted">{{approvedLine}}</p>`,
      vals: {},
    },
  ],
  checks: [
    {
      name: "A row that opens is one link across the whole row, named by its title, and Enter opens it",
      example: "anatomy",
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link", { name: "Invoice [1042]", exact: true })
        expect(await tabTo(page, link), "Tab reaches the row's link")
        const [l, r] = [await link.boundingBox(), await row(scope, "Invoice [1042]").boundingBox()]
        expect(l.width >= r.width - 1 && l.height >= r.height - 1, `the link covers the row (${Math.round(l.width)}x${Math.round(l.height)} of ${Math.round(r.width)}x${Math.round(r.height)})`)
        await page.keyboard.press("Enter")
        await page.waitForFunction(() => location.hash === "#invoice-1042", null, { timeout: 3000 })
      },
    },
    {
      name: "Unread shows a dot and says (unread) to screen readers",
      example: "anatomy",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "[Priya Nair] (unread)", exact: true }).count(), 1, "the row's name says unread")
        const dot = row(scope, "[Priya Nair]").locator('[data-slot="list-row-unread"]')
        expect(await dot.isVisible(), "the dot shows")
        expect.equal(await style(dot, "backgroundColor"), await colourOf(page, "highlight", "backgroundColor"), "the dot is the highlight role")
      },
    },
    {
      name: "A row that opens nothing is no link, and its text wraps rather than being cut",
      example: "anatomy",
      async run({ scope, expect }) {
        const plain = row(scope, "Payroll closes on [Thursday]")
        expect.equal(await plain.locator("a, button").count(), 0, "nothing to press in it")
        expect(await style(plain.locator('[data-slot="list-row-title"]'), "whiteSpace") !== "nowrap", "its title wraps")
      },
    },
    {
      name: "A row that opens is read once, through its link: its content is hidden and inert, so nothing in it takes focus",
      example: "anatomy",
      async run({ scope, expect }) {
        const content = row(scope, "Invoice [1042]").locator('[data-slot="list-row-content"]')
        expect.equal(await content.getAttribute("aria-hidden"), "true", "hidden from screen readers")
        expect(await content.evaluate((el) => el.hasAttribute("inert")), "and inert")
        const plain = row(scope, "Payroll closes on [Thursday]").locator('[data-slot="list-row-content"]')
        expect(await plain.evaluate((el) => !el.hasAttribute("inert") && !el.hasAttribute("aria-hidden")), "a row that opens nothing is read as it is")
      },
    },
    {
      name: "Focus shows on the open row, inside its edge, at 3:1 or better against its tint, in both themes",
      example: "selected",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const link = scope.getByRole("link", { name: "[Marcus Chen]", exact: true })
        expect(await tabTo(page, link), "Tab reaches the open row")
        const ring = await link.evaluate((el) => {
          const s = getComputedStyle(el)
          return { style: s.outlineStyle, width: s.outlineWidth, offset: s.outlineOffset, colour: s.outlineColor }
        })
        expect.equal(ring.style, "solid", "the ring's style")
        expect.equal(ring.width, "2px", "the ring's width")
        expect.equal(ring.offset, "-4px", "the ring draws inside the row's edge")
        const tint = await style(row(scope, "[Marcus Chen]"), "backgroundColor")
        expect.equal(tint, await colourOf(page, "selected-strong", "backgroundColor"), "the open row keeps its tint while focused")
        expect.atLeast(Math.round(contrast(ring.colour, tint) * 100) / 100, 3, "the ring against the tint")
      },
    },
    {
      name: "The open row says so: aria-current, the strong tint and its edge, and its meta turns text-muted",
      example: "selected",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("link", { name: "[Marcus Chen]", exact: true }).getAttribute("aria-current"), "true", "the open row")
        expect.equal(await scope.getByRole("link", { name: "[Ana Silva]", exact: true }).getAttribute("aria-current"), null, "another row")
        const open = row(scope, "[Marcus Chen]")
        expect((await style(open, "boxShadow")).includes(await colourOf(page, "selected-line")), "its edge is the selected-line role")
        expect.equal(await style(open.locator('[data-slot="list-row-meta"]'), "color"), await colourOf(page, "text-muted"), "the open row's meta")
        expect.equal(await style(row(scope, "[Ana Silva]").locator('[data-slot="list-row-meta"]'), "color"), await colourOf(page, "text-subtle"), "another row's meta")
      },
    },
    {
      name: "Beside a long title a badge keeps its whole word, and the title is cut instead",
      example: "wide",
      async run({ scope, expect }) {
        const first = row(scope, "Superannuation")
        const label = first.locator('[data-slot="badge-label"]')
        expect.equal((await label.innerText()).trim(), "Needs approval", "the badge's word")
        expect(await label.evaluate((el) => el.scrollWidth <= el.clientWidth), "the badge's word is not cut")
        const badge = await first.locator('[data-slot="badge"]').boundingBox()
        expect.atLeast(Math.round(badge.width), 90, "the badge is wider than a dot")
        expect(await first.locator('[data-slot="list-row-title"]').evaluate((el) => el.scrollWidth > el.clientWidth), "the title gives way, cut with an ellipsis")
      },
    },
    {
      name: "On a crowded row the title keeps its room, and the badge and value move under it, whole",
      example: "wide",
      async run({ scope, expect }) {
        const crowded = row(scope, "Invoice [1046]")
        const title = await crowded.locator('[data-slot="list-row-title"]').boundingBox()
        expect.atLeast(Math.round(title.width), 192, "the title's width")
        const meta = await crowded.locator('[data-slot="list-row-meta"]').boundingBox()
        const side = await crowded.locator('[data-slot="list-row-side"]').boundingBox()
        expect(side.y >= meta.y + meta.height - 0.5, "the badge and the value sit under the text")
        expect(await crowded.locator('[data-slot="badge-label"]').evaluate((el) => el.scrollWidth <= el.clientWidth), "the badge's words are whole")
      },
    },
    {
      name: "A cut title shows in full on hover, and on keyboard focus",
      example: "wide",
      async run({ page, scope, expect }) {
        const tip = page.locator('[data-slot="tooltip-content"]')
        await row(scope, "Superannuation").hover({ position: { x: 120, y: 20 } })
        await tip.first().waitFor({ state: "visible", timeout: 3000 })
        expect((await tip.first().innerText()).includes("Superannuation guarantee statement for [Harbour Physio Pty Ltd]"), "the full title on hover")
        // A person's way out: several moves, which Radix reads as leaving the trigger and its grace area.
        await page.mouse.move(900, 20, { steps: 6 })
        await tip.first().waitFor({ state: "hidden", timeout: 3000 })
        const link = scope.getByRole("link", { name: LONG_TITLE, exact: true })
        expect(await tabTo(page, link), "Tab reaches the row")
        await tip.first().waitFor({ state: "visible", timeout: 3000 })
        expect((await tip.first().innerText()).includes("[April to June]"), "the full title on keyboard focus")
      },
    },
    {
      name: "Under 480px of list the row wraps, and the badge moves under the text, whole",
      example: "narrow",
      async run({ scope, expect }) {
        const first = row(scope, "Superannuation")
        const title = first.locator('[data-slot="list-row-title"]')
        expect(await title.evaluate((el) => el.scrollWidth <= el.clientWidth), "the title is not cut")
        expect.atLeast(Math.round((await title.boundingBox()).height), 40, "the title runs to two lines")
        const meta = await first.locator('[data-slot="list-row-meta"]').boundingBox()
        const badge = await first.locator('[data-slot="badge"]').boundingBox()
        expect(badge.y >= meta.y + meta.height - 0.5, "the badge sits under the text")
        expect(await first.locator('[data-slot="badge-label"]').evaluate((el) => el.scrollWidth <= el.clientWidth), "the badge's word is whole")
      },
    },
    {
      name: "Under 480px of list a short value alone stays on the right, beside the title",
      example: "narrow",
      async run({ scope, expect }) {
        const r = row(scope, "Invoice [1047]")
        const title = await r.locator('[data-slot="list-row-title"]').boundingBox()
        const meta = await r.locator('[data-slot="list-row-meta"]').boundingBox()
        const value = await r.locator('[data-slot="list-row-side"]').boundingBox()
        expect(value.x >= title.x + title.width - 0.5, "the value is to the right of the title")
        expect(value.y < meta.y + meta.height, "and not on a line of its own under the meta line")
        expect(await r.locator('[data-slot="list-row-side"] span').evaluate((el) => el.scrollWidth <= el.clientWidth), "the value is whole")
      },
    },
    {
      name: "An action at the end stays pressable, and a press elsewhere on the row opens it",
      example: "action",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Approve" }).click()
        expect.equal(await scope.locator('[data-slot="example-status"]').innerText(), "Approved [Priya Nair].", "the action ran")
        expect(await page.evaluate(() => location.hash !== "#approve-priya"), "pressing the action did not open the row")
        await row(scope, "[Priya Nair]").click({ position: { x: 200, y: 20 } })
        await page.waitForFunction(() => location.hash === "#approve-priya", null, { timeout: 3000 })
      },
    },
    {
      name: "Forced colours keep the open row and focus visible, with no outline at rest",
      example: "selected",
      forcedColors: true,
      async run({ page, scope, expect }) {
        expect.equal(await style(row(scope, "[Marcus Chen]"), "outlineStyle"), "solid", "an outline on the open row")
        expect.equal(await style(row(scope, "[Ana Silva]"), "outlineStyle"), "none", "no outline on a row at rest")
        const link = scope.getByRole("link", { name: "[Priya Nair]", exact: true })
        expect(await tabTo(page, link), "Tab reaches a row")
        expect.equal(await style(link, "outlineStyle"), "solid", "focus shows")
      },
    },
    {
      name: "On a touch screen the row and its action are big enough to press",
      example: "action",
      touch: true,
      async run({ scope, expect }) {
        expect.atLeast(Math.round((await row(scope, "[Priya Nair]").boundingBox()).height), 48, "the row's height")
        expect.atLeast(Math.round((await scope.getByRole("button", { name: "Approve" }).boundingBox()).height), 40, "the action's height")
      },
    },
  ],
}
