// Schedule's one definition: its README, its preview board and its scripted checks all come from here.

// Times and spans as this product writes them (TIME in lib/format-locale.js), the way Schedule does.
const on = (h, m = 0) => new Date(2026, 10, 5, h, m)
const tm = (format, h, m = 0) => format.formatTime(on(h, m), { onTheHour: "drop" })
const span = (format, [h1, m1 = 0], [h2, m2 = 0]) => format.formatTimeRange(on(h1, m1), on(h2, m2), { onTheHour: format.TIME?.onTheHour === "drop" ? "drop" : "pair" })

// A café's roster for the week of Monday 2 November 2026. Colours follow the role, as a Tag's would.
const shift = (id, title, start, end, meta, color) => ({ id, title, start, end, meta, color, href: `#${id}` })
const roster = [
  shift("s1", "[Sam Lee]", "2026-11-02T07:00", "2026-11-02T15:00", "Front of house", 1),
  shift("s2", "[Priya Nair]", "2026-11-02T09:00", "2026-11-02T17:00", "Kitchen", 2),
  shift("s3", "[Alex Chen]", "2026-11-03T07:00", "2026-11-03T12:30", "Deliveries", 3),
  shift("s4", "[Sam Lee]", "2026-11-03T12:00", "2026-11-03T18:00", "Front of house", 1),
  shift("s5", "[Priya Nair]", "2026-11-04T08:00", "2026-11-04T12:00", "Kitchen", 2),
  shift("s6", "[Jordan Kaur]", "2026-11-04T08:00", "2026-11-04T10:00", "Training", 4),
  shift("s7", "[Sam Lee]", "2026-11-04T13:00", "2026-11-04T17:30", "Front of house", 1),
  shift("s8", "[Alex Chen]", "2026-11-05T10:00", "2026-11-05T14:00", "Deliveries", 3),
  shift("s9", "[Sam Lee]", "2026-11-06T07:00", "2026-11-06T15:00", "Front of house", 1),
  shift("s10", "[Priya Nair]", "2026-11-06T15:00", "2026-11-06T19:00", "Kitchen", 2),
  shift("s11", "[Jordan Kaur]", "2026-11-07T09:00", "2026-11-07T13:00", "Front of house", 1),
]
// A tradesperson's jobs, from half an hour to an hour and a half, so an event has room for one line, two or three, and two
// side by side on the hour.
const job = (id, title, start, end, meta, color) => ({ id, title, start, end, meta, color, href: `#${id}` })
const jobs = [
  job("j1", "[Service the boiler]", "2026-11-04T09:00", "2026-11-04T10:00", "[Lee household]", 1),
  job("j2", "[Replace a tap]", "2026-11-04T10:30", "2026-11-04T11:00", "[Okafor household]", 2),
  job("j3", "[Quote a kitchen]", "2026-11-04T11:15", "2026-11-04T12:00", "[Martin household]", 3),
  job("j4", "[Fix a leak under the sink]", "2026-11-04T13:00", "2026-11-04T14:30", "[Chen household]", 4),
  job("j5", "[Check smoke alarms]", "2026-11-04T15:00", "2026-11-04T16:00", "[Nair household]", 1),
  job("j6", "[Hang a door]", "2026-11-04T15:00", "2026-11-04T16:00", "[Kaur household]", 2),
  job("j7", "[Bleed the radiators]", "2026-11-05T08:00", "2026-11-05T09:00", "[Lee household]", 3),
]

// Each line of every event drawn on a grid: whether any of it shows inside the event's edge, whether it sits wholly
// inside the event's padding, and whether it is a whole number of its own lines tall, not squeezed to part of one.
const eventLines = (scope) =>
  scope.locator('[data-slot="schedule-event"]').evaluateAll((els) =>
    els.flatMap((el, n) => {
      const r = el.getBoundingClientRect()
      // An event in a grid that is not shown, as under 640px.
      if (!r.width || !r.height) return []
      const s = getComputedStyle(el)
      const px = (v) => parseFloat(v) || 0
      const edge = { top: r.top + px(s.borderTopWidth), bottom: r.bottom - px(s.borderBottomWidth), left: r.left + px(s.borderLeftWidth), right: r.right - px(s.borderRightWidth) }
      const box = { top: edge.top + px(s.paddingTop), bottom: edge.bottom - px(s.paddingBottom) }
      return [...el.querySelectorAll("[data-measure]")].map((line, i) => {
        const b = line.getBoundingClientRect()
        const lh = px(getComputedStyle(line).lineHeight)
        const count = lh ? line.clientHeight / lh : 0
        return {
          event: n,
          name: el.getAttribute("aria-label").replace(/\s+/g, " "),
          // The tooltip's words wait in a hidden span beside the event, and only an event with something cut or left
          // out has any.
          tip: Boolean(el.parentElement?.querySelector(":scope > [hidden]")?.textContent.trim()),
          i,
          text: line.textContent.replace(/\s+/g, " ").trim(),
          shown: b.width > 0 && b.height > 0 && b.left < edge.right && b.right > edge.left && b.top < edge.bottom && b.bottom > edge.top,
          inside: b.top >= box.top - 0.5 && b.bottom <= box.bottom + 0.5,
          whole: Math.round(count) >= 1 && Math.abs(count - Math.round(count)) < 0.05,
        }
      })
    })
  )

async function wholeLines({ page, expect }) {
  const lines = await eventLines(page.locator("body"))
  expect(new Set(lines.map((l) => l.event)).size >= 20, `the preview's events are measured (${new Set(lines.map((l) => l.event)).size})`)
  const cut = lines.filter((l) => l.shown && !(l.inside && l.whole))
  expect.equal(cut.map((l) => `${l.name}: "${l.text}"`).join("; "), "", "every line that shows is whole and inside its event")
  const untitled = lines.filter((l) => l.i === 0 && !l.shown)
  expect.equal(untitled.map((l) => l.name).join("; "), "", "every event shows its title")
  // In order: a line shows only when the one before it does, so the time goes before the event's line does.
  const skipped = lines.filter((l) => l.i > 0 && l.shown && !lines.find((m) => m.event === l.event && m.i === l.i - 1).shown)
  expect.equal(skipped.map((l) => `${l.name}: "${l.text}"`).join("; "), "", "no line shows after one left out")
  const short = [...new Set(lines.filter((l) => !l.shown && !l.tip).map((l) => l.name))]
  expect.equal(short.join("; "), "", "an event with a line left out shows in full in its tooltip")
}

async function tabTo(page, locator, max = 60) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}
// What has focus, as a screen reader names it, with every kind of space read as one.
const inHand = (page) =>
  page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    if (el.getAttribute("aria-label")) return el.getAttribute("aria-label").replace(/\s+/g, " ")
    return `slot ${el.dataset.target ?? el.tagName}`
  })
const words = (locator) => locator.evaluate((el) => el.textContent.replace(/\s+/g, " ").trim())
// A status is written a beat after the change, once the new period has rendered, so a check waits for it.
const said = (locator, want) =>
  locator.evaluate(
    (el, text) =>
      new Promise((done) => {
        const end = Date.now() + 3000
        const read = () => el.textContent.replace(/\s+/g, " ").trim()
        const tick = () => (read() === text || Date.now() > end ? done(read()) : requestAnimationFrame(tick))
        tick()
      }),
    want
  )

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
  name: "Schedule",
  group: "Data",
  job: "Shifts or jobs on a time grid, by day or week, in the market's locale.",
  status: "to build",
  props: [
    { name: "events", type: "{ id: string; title: string; start: string | Date; end: string | Date; meta?: string; color?: 1 | 2 | 3 | 4 | 5 | 6 | \"grey\"; href?: string }[]", doc: "The shifts or jobs, in local time (2026-11-03T09:00). color is the category's series slot, as Tag uses it." },
    { name: "label", type: "string", required: true, doc: "Names the schedule: Roster, Bookings." },
    { name: "view", type: '"day" | "week"', doc: "The view, when the page holds it (in the URL)." },
    { name: "defaultView", type: '"day" | "week"', default: '"week"', doc: "The view at first, when the schedule holds it." },
    { name: "onViewChange", type: "(view: \"day\" | \"week\") => void", doc: "Called when Day or Week is chosen." },
    { name: "date", type: "string | Date", doc: "Any day in the period shown, when the page holds it: 2026-11-03." },
    { name: "defaultDate", type: "string | Date", doc: "The day shown at first, when the schedule holds it. Today by default." },
    { name: "onDateChange", type: "(date: Date) => void", doc: "Called with the new day when Today, Previous or Next is pressed." },
    { name: "today", type: "string | Date", doc: "The day to treat as today, for a design pinned to a date. The real today by default." },
    { name: "startHour", type: "number", default: "7", doc: "The grid's first hour. It reaches earlier for an event that starts earlier." },
    { name: "endHour", type: "number", default: "19", doc: "The hour the grid ends at. It reaches later for an event that ends later." },
    { name: "onEventClick", type: "(id: string) => void", doc: "Opens an event that has no href." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "The period's heading level. Each day's heading in the phone list is one below." },
    { name: "loading", type: "boolean", default: "false", doc: "Skeleton blocks in the grid, said once as Loading [label]." },
    { name: "error", type: "ReactNode", doc: "The events could not load: name the system that failed. Events given stay, as the last good copy." },
    { name: "empty", type: "ReactNode", default: '"Nothing scheduled."', doc: "What a period with no events says." },
  ],
  notes: {
    Behaviour: [
      "The week starts on the market's first day, from the locale in lib/format-locale (Monday in en-AU), and every date and time is written in that locale. Ranges are joined with to, and times on the hour drop their minutes: 2 to 8 November 2026, 9 am to 1 pm, 7:00 am to 12:30 pm.",
      "The grid is one tab stop, as a grid: the arrows move from slot to slot and stop at the edges. A slot where events start puts focus on the event itself; events that start together sit side by side, and Right and Left pass through them first. Home and End go to the row's first and last day, and Ctrl with them to the grid's first and last slot.",
      "Each event is a link or a button named by its title, its time and its line: [Sam Lee], 9 am to 1 pm, Front of house. A slot inside a longer event says what continues and until when. Day and time come from the table's column and row headers.",
      "Today, Previous and Next move the period, Day and Week change the view, and the new period is said once, politely.",
      "Today's column carries aria-current=\"date\" and the word today.",
    ],
    Layout: [
      "Events sit on the hours they cover, in the category's quiet fill with its series dot. Events that start in the same hour sit side by side; one that starts later while another runs is drawn over it, indented and ringed in the surface, so both names stay readable. An event shows whole lines only: its title always, then its time, then its line, as its height allows. A line with no room is left out, never cut, and the whole event shows in its tooltip. A title wraps to two lines when there is room for a line under it. The grid starts at startHour and ends at endHour, reaching further to fit any event. Hour rows are 48px, and 64px on a touch screen.",
      "Under 640px of its own width the grid becomes a list by day, as a DataTable becomes a list: each day's heading, then its events, and Nothing scheduled on a free day. Tab moves through the events.",
    ],
    States: [
      "Day and Week. Today. Loading shows skeleton blocks and says Loading [label] once. An empty period says so. An error names the system and keeps the events.",
      "Forced colours keep each event's edge, the today marker and the focused slot.",
    ],
    Copy: ["Events are named the way people say them: the person on a roster, the job on a booking. The line under it is the role, the site or the client."],
    Rules: [
      "Colour follows the category, the same series slot everywhere in the product, and every event names itself, so colour is never the only clue.",
      "For time on a grid. A list of dated records with nothing to place on hours is a DataTable or a List.",
    ],
    Open: ["Month, the reference's third view, is not built: it is a grid of dates, not of hours."],
  },
  frame: { width: 960, height: 4950 },
  examples: [
    {
      id: "week",
      title: "A week of shifts",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Schedule" label="Roster" events="{{roster}}" default-date="2026-11-04" today="2026-11-04" heading-level="{{h3}}"></x-import>`,
      vals: { roster, h3: 3 },
    },
    {
      id: "day",
      title: "One day",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Schedule" label="Roster, by day" events="{{roster}}" default-view="day" default-date="2026-11-04" today="2026-11-04" heading-level="{{h3}}"></x-import>`,
    },
    {
      id: "phone",
      title: "Under 640px of its own width, a list by day",
      markup: `<div style="width: 380px;"><x-import component-from-global-scope="NS.Schedule" label="Roster, narrow" events="{{roster}}" default-date="2026-11-04" today="2026-11-04" heading-level="{{h3}}"></x-import></div>`,
    },
    {
      id: "states",
      title: "Loading, nothing scheduled, and an error that keeps the last good copy",
      layout: "block",
      markup: `<div style="display: flex; flex-direction: column; gap: 40px;">
<x-import component-from-global-scope="NS.Schedule" label="Roster, loading" events="{{none}}" loading="{{yes}}" default-date="2026-11-04" today="2026-11-04" start-hour="{{nine}}" end-hour="{{one}}" heading-level="{{h3}}"></x-import>
<x-import component-from-global-scope="NS.Schedule" label="Roster, empty" events="{{none}}" default-date="2026-11-16" today="2026-11-04" start-hour="{{nine}}" end-hour="{{one}}" empty="No shifts this week. Add one from the roster." heading-level="{{h3}}"></x-import>
<x-import component-from-global-scope="NS.Schedule" label="Roster, stale" events="{{someShifts}}" default-date="2026-11-04" today="2026-11-04" start-hour="{{nine}}" end-hour="{{one}}" error="{{rosterError}}" heading-level="{{h3}}"></x-import>
</div>`,
      vals: { none: [], yes: true, nine: 9, one: 13, someShifts: roster.filter((s) => s.id === "s8" || s.id === "s11"), rosterError: "[The rostering system] did not respond, so this may be out of date. Showing the copy from 9:12 am." },
    },
    {
      id: "short",
      title: "Short jobs show whole lines: the title, then the time and the line as there is room",
      layout: "block",
      markup: `<div style="display: flex; flex-direction: column; gap: 40px;">
<x-import component-from-global-scope="NS.Schedule" label="Jobs, by day" events="{{jobs}}" default-view="day" default-date="2026-11-04" today="2026-11-04" start-hour="{{eight}}" end-hour="{{five}}" heading-level="{{h3}}"></x-import>
<x-import component-from-global-scope="NS.Schedule" label="Jobs, by week" events="{{jobs}}" default-date="2026-11-04" today="2026-11-04" start-hour="{{eight}}" end-hour="{{five}}" heading-level="{{h3}}"></x-import>
</div>`,
      vals: { jobs, eight: 8, five: 17 },
    },
  ],
  checks: [
    {
      name: "Monday comes first in en-AU, dates read in the locale, and today carries aria-current",
      example: "week",
      async run({ scope, expect, format }) {
        expect.equal(await words(scope.locator('[data-slot="schedule-period"]')), "2 to 8 November 2026", "the period, as a range joined with to")
        const days = await scope.locator('[data-slot="schedule-day"] .sr-only').allTextContents()
        expect.equal(days[0].trim(), "Monday 2 November", "the week starts on Monday")
        expect.equal(days[6].trim(), "Sunday 8 November", "and ends on Sunday")
        const today = scope.locator('[data-slot="schedule-day"][aria-current="date"]')
        expect.equal(await today.count(), 1, "one day is today")
        expect.equal(await words(today.locator(".sr-only")), "Wednesday 4 November, today", "today is Wednesday, said in words")
        expect.equal(await words(scope.locator('[data-slot="schedule-hour"]').first()), tm(format, 7), "hours read in the locale")
      },
    },
    {
      name: "The grid is one tab stop, and the arrows move from slot to slot, through events side by side, stopping at the edges",
      example: "week",
      async run({ page, scope, expect, format }) {
        const grid = scope.getByRole("grid", { name: "Roster, 2 to 8 November 2026" })
        expect.equal(await grid.locator('[tabindex="0"]').count(), 1, "one tab stop in the grid")
        expect(await tabTo(page, grid), "Tab reaches the grid")
        expect.equal(await inHand(page), `[Priya Nair], ${span(format, [8], [12])}, Kitchen`, "focus lands on today's first event")
        await page.keyboard.press("ArrowRight")
        expect.equal(await inHand(page), `[Jordan Kaur], ${span(format, [8], [10])}, Training`, "Right goes to the event beside it, in the same slot")
        await page.keyboard.press("ArrowRight")
        expect.equal(await inHand(page), "slot 3-1-0", "then on to Thursday's free 8 am slot")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        expect.equal(await inHand(page), `[Alex Chen], ${span(format, [10], [14])}, Deliveries`, "Down twice lands on Thursday's 10 am shift")
        for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowUp")
        expect.equal(await inHand(page), "slot 3-0-0", "Up stops at the first hour")
        await page.keyboard.press("Home")
        expect.equal(await inHand(page), `[Sam Lee], ${span(format, [7], [15])}, Front of house`, "Home goes to Monday's slot in the same row")
        await page.keyboard.press("ArrowLeft")
        expect.equal(await inHand(page), `[Sam Lee], ${span(format, [7], [15])}, Front of house`, "Left stops at the first day")
        await page.keyboard.press("Control+End")
        expect.equal(await inHand(page), "slot 6-11-0", "Ctrl End goes to the last slot")
        expect.equal(await grid.locator('[tabindex="0"]').count(), 1, "still one tab stop, where focus is")
        await page.keyboard.press("Tab")
        expect(await grid.evaluate((el) => !el.contains(document.activeElement)), "Tab leaves the grid")
      },
    },
    {
      name: "Every event reads its title and time, and a slot inside a longer event says what continues",
      example: "week",
      async run({ scope, expect, format }) {
        const names = await scope.locator('[data-slot="schedule-event"]').evaluateAll((els) => els.map((el) => el.getAttribute("aria-label").replace(/\s+/g, " ")))
        expect.equal(names.length, 11, "every shift in the week is on the grid")
        // On the hour the minutes go, and the locale writes a shared half once: 8 to 10 am, 7:00 am to 12:30 pm,
        // or the brand's own way: 11am to 10.30pm.
        const said = /^\[[^\]]+\], \d{1,2}([:.]\d{2})? ?([ap]m)? to \d{1,2}([:.]\d{2})? ?[ap]m, [A-Z]/
        expect(names.every((n) => said.test(n)), `each names its person, its time and its role (${names.find((n) => !said.test(n))})`)
        expect.equal(await scope.getByRole("link", { name: `[Alex Chen], ${span(format, [7], [12, 30])}, Deliveries` }).count(), 1, "an event with an href is a link, with minutes when they are not on the hour")
        const continues = await words(scope.locator('[data-slot="schedule-slot"][data-target="2-3-0"]'))
        expect.equal(continues, `[Priya Nair], until ${tm(format, 12)}`, "Wednesday's 10 am slot says Priya's shift continues")
      },
    },
    {
      name: "An event cut short in a narrow lane shows in full on keyboard focus",
      example: "week",
      async run({ page, scope, expect, format }) {
        expect(await tabTo(page, scope.getByRole("grid")), "Tab reaches the grid")
        await page.keyboard.press("ArrowRight")
        expect.equal(await inHand(page), `[Jordan Kaur], ${span(format, [8], [10])}, Training`, "focus is on the narrow event beside Priya's")
        const tip = page.locator('[data-slot="tooltip-content"]')
        await tip.waitFor({ state: "visible", timeout: 3000 })
        expect.equal((await tip.innerText()).replace(/\s+/g, " ").trim(), `[Jordan Kaur], ${span(format, [8], [10])}, Training`, "the tooltip holds the whole event")
        const wide = await scope.locator('[data-slot="schedule-event"]', { hasText: "[Alex Chen]" }).last().evaluate((el) => el.closest('[data-slot="tooltip-trigger"]')?.dataset.state ?? "none")
        expect(wide !== "open", "an event shown in full opens no tooltip")
      },
    },
    {
      name: "Next, Today, and Day or Week change the period, and the new one is said once",
      example: "week",
      async run({ page, scope, expect }) {
        const status = scope.locator('[data-slot="schedule-status"]')
        expect.equal(await words(status), "", "nothing is said on load")
        const next = scope.getByRole("button", { name: "Next week" })
        expect(await tabTo(page, next), "Tab reaches Next week")
        await page.keyboard.press("Enter")
        expect.equal(await words(scope.locator('[data-slot="schedule-period"]')), "9 to 15 November 2026", "the next week shows")
        expect.equal(await said(status, "Showing 9 to 15 November 2026."), "Showing 9 to 15 November 2026.", "and is said")
        expect.equal(await scope.locator('[data-slot="schedule-event"]').count(), 0, "with none of last week's shifts")
        await scope.getByRole("button", { name: "Today" }).click()
        expect.equal(await words(scope.locator('[data-slot="schedule-period"]')), "2 to 8 November 2026", "Today comes back to the week holding today")
        await scope.getByRole("radio", { name: "Day" }).click()
        expect.equal(await words(scope.locator('[data-slot="schedule-period"]')), "Wednesday 4 November 2026", "Day shows today alone")
        expect.equal(await said(status, "Showing Wednesday 4 November 2026."), "Showing Wednesday 4 November 2026.", "and says so")
        expect.equal(await scope.getByRole("button", { name: "Next day" }).count(), 1, "Next now moves a day")
      },
    },
    {
      name: "Under 640px of its own width it becomes a list by day, and Tab moves through the events",
      example: "phone",
      async run({ page, scope, expect, format }) {
        expect.equal(await scope.locator('[data-slot="schedule-grid"]').evaluate((el) => getComputedStyle(el).display), "none", "the grid is gone")
        const list = scope.locator('[data-slot="schedule-list"]')
        expect(await list.isVisible(), "the list shows")
        const headings = await list.getByRole("heading", { level: 4 }).allTextContents()
        expect.equal(headings.length, 7, "a heading for every day")
        expect.equal(headings[0].replace(/\s+/g, " ").trim(), "Monday 2 November", "starting on Monday")
        expect.equal(await list.locator('[aria-current="date"]').evaluate((el) => el.textContent.replace(/\s+/g, " ").trim()), "Wednesday 4 November, Today", "today says so")
        expect.equal((await list.locator("p").last().textContent()).trim(), "Nothing scheduled", "a free day says so")
        const first = list.getByRole("link").first()
        expect(await tabTo(page, first), "Tab reaches the first event")
        await page.keyboard.press("Tab")
        expect.equal(await inHand(page), `[Priya Nair], ${span(format, [9], [17])}, Kitchen`, "Tab moves to the next event")
      },
    },
    {
      name: "On a touch screen the controls grow to 40px and an hour to 64px",
      example: "week",
      touch: true,
      async run({ scope, expect }) {
        for (const name of ["Today", "Previous week", "Next week"]) {
          expect.atLeast(Math.round((await scope.getByRole("button", { name }).boundingBox()).height), 40, `${name} on touch`)
        }
        expect.atLeast(Math.round((await scope.getByRole("radio", { name: "Week" }).boundingBox()).height), 40, "Week on touch")
        expect.equal(Math.round((await scope.locator('[data-slot="schedule-slot"]').first().boundingBox()).height), 64, "an hour is 64px tall")
        const shortest = Math.min(...(await scope.locator('[data-slot="schedule-event"]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))))
        expect.atLeast(Math.round(shortest), 24, "every event is a 24px target at least")
      },
    },
    {
      // A one-hour booking at 48px an hour showed its title, then the top half of its time and a sliver of its owner:
      // each line shrank to share what was left, and no gate saw it.
      name: "Every event shows whole lines inside its edge, by day and by week: the title always, then the time and its line as the height allows",
      run: wholeLines,
    },
    {
      name: "Every event shows whole lines on a touch screen, at 64px an hour, too",
      touch: true,
      run: wholeLines,
    },
    {
      name: "Forced colours keep each event's edge, the today marker and the focused slot",
      example: "week",
      forcedColors: true,
      async run({ page, scope, expect }) {
        const edge = await scope.locator('[data-slot="schedule-event"]').first().evaluate((el) => `${getComputedStyle(el).borderTopStyle} ${getComputedStyle(el).borderTopWidth}`)
        expect.equal(edge, "solid 1px", "an event keeps its edge once its fill is gone")
        const marker = await scope.locator('[aria-current="date"] [data-slot="schedule-day-number"]').evaluate((el) => `${getComputedStyle(el).borderTopStyle} ${getComputedStyle(el).borderTopWidth}`)
        expect.equal(marker, "solid 2px", "today's marker keeps a ring")
        expect(await tabTo(page, scope.getByRole("grid")), "Tab reaches the grid")
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("ArrowDown")
        const slot = await page.evaluate(() => `${document.activeElement.dataset.slot} ${getComputedStyle(document.activeElement).outlineStyle}`)
        expect.equal(slot, "schedule-slot solid", "a focused slot, inside a longer event, shows its outline")
      },
    },
    {
      name: "Event text holds 4.5:1 on its colour, in both themes",
      example: "week",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const ev of await scope.locator('[data-slot="schedule-event"]').all()) {
          const [ground, colours] = await ev.evaluate((el) => [getComputedStyle(el).backgroundColor, [...el.querySelectorAll("span:not([aria-hidden])")].filter((s) => !s.children.length).map((s) => getComputedStyle(s).color)])
          for (const c of colours) expect.atLeast(Math.round(contrast(c, ground) * 100) / 100, 4.5, `${theme} event text on ${ground}`)
        }
      },
    },
    {
      name: "A shift past midnight shows on both days, and the grid reaches back to hold it",
      example: "week",
      async run({ page, expect, format }) {
        const out = await page.evaluate(() => {
          const kit = Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)
          const host = document.createElement("div")
          host.style.width = "900px"
          document.body.append(host)
          const late = { id: "late", title: "[Alex Chen]", start: "2026-11-06T22:00", end: "2026-11-07T06:00", meta: "Night fill", color: 3 }
          window.ReactDOM.flushSync(() =>
            window.ReactDOM.createRoot(host).render(window.React.createElement(kit.Root, null, window.React.createElement(kit.Schedule, { label: "Roster", events: [late], defaultDate: "2026-11-04", today: "2026-11-04" })))
          )
          const firstHour = host.querySelector('[data-slot="schedule-hour"]')?.textContent.replace(/\s+/g, " ").trim()
          const parts = [...host.querySelectorAll('[data-slot="schedule-event"]')].map((el) => el.dataset.target.split("-")[0]).sort()
          const listed = host.querySelectorAll('[data-slot="schedule-list-event"]').length
          host.remove()
          return { firstHour, parts, listed }
        })
        expect.equal(out.firstHour, tm(format, 0), "the grid starts at midnight, to hold the shift's second half")
        expect.equal(out.parts.join(","), "4,5", "the shift shows on Friday and on Saturday")
        expect.equal(out.listed, 2, "and under both days in the phone list")
      },
    },
    {
      name: "Loading says so once, an empty week says so, and an error names the system and keeps the events",
      example: "states",
      async run({ scope, expect }) {
        expect.equal((await scope.getByRole("status").filter({ hasText: "Loading" }).textContent()).trim(), "Loading Roster, loading", "loading is said once")
        expect.equal(await scope.locator('[data-slot="schedule"][aria-busy="true"] [data-slot="schedule-event"]').count(), 0, "no events while loading")
        expect.equal((await scope.locator('[data-slot="schedule-empty"]').first().textContent()).trim(), "No shifts this week. Add one from the roster.", "an empty week says so")
        expect((await scope.locator('[data-slot="schedule-error"]').textContent()).includes("[The rostering system] did not respond"), "the error names the system")
        expect.equal(await scope.locator('[data-slot="schedule"]').last().locator('[data-slot="schedule-event"]').count(), 2, "the last good events stay")
      },
    },
  ],
}
