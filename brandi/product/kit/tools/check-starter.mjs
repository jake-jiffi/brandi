#!/usr/bin/env node
/**
 * The example product's own behaviour checks, in Chrome with a real keyboard, against the built app running
 * under `next start`. Each check gets a fresh browser context, so nothing one leaves open (a drawer, a toast, a
 * setting in storage) reaches the next.
 *
 *   npm run build && npm start &
 *   node tools/check-starter.mjs [--base http://localhost:3000] [--json results.json]
 *
 * They cover what the shell and the patterns promise (03-fundamentals-first.md, 07-starter.md section 6): the
 * drawer opens, holds focus and gives it back; the phone action bar; focus after every navigation and action,
 * never left on the page body; filters and the open tab in the address; a decision's toast with Undo; and the
 * shortcuts setting turning single keys and their hints off. Prints {"passed": n, "failed": [...]} and exits 1
 * when anything failed.
 */

import { chromium } from "playwright"
import { writeFileSync } from "node:fs"
import path from "node:path"

const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const base = (arg("--base") ?? process.env.STARTER_URL ?? "http://localhost:3000").replace(/\/$/, "")

const PHONE = { width: 390, height: 844 }
const TABLET = { width: 820, height: 1180 }
const DESKTOP = { width: 1440, height: 900 }

function makeExpect() {
  const expect = (value, message) => { if (!value) throw new Error(message ?? "expected a truthy value") }
  expect.equal = (a, b, message) => { if (a !== b) throw new Error(`${message ?? "not equal"}: got ${JSON.stringify(a)}, wanted ${JSON.stringify(b)}`) }
  expect.atLeast = (a, b, message) => { if (!(a >= b)) throw new Error(`${message ?? "too small"}: got ${a}, wanted at least ${b}`) }
  return expect
}

/** Polls until `fn` gives something truthy, or fails with `message`. */
async function until(fn, message, timeout = 5000) {
  const end = Date.now() + timeout
  let last
  while (Date.now() < end) {
    try {
      last = await fn()
      if (last) return last
    } catch {
      // not there yet
    }
    await new Promise((r) => setTimeout(r, 50))
  }
  throw new Error(message)
}

/** What has focus, in words a failure can show. */
const focused = (page) =>
  page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return { body: true, text: "the page body" }
    const name = el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 40) || ""
    return { body: false, id: el.id, slot: el.getAttribute("data-slot"), tag: el.tagName.toLowerCase(), role: el.getAttribute("role"), name, text: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} "${name}"` }
  })

async function expectFocusOff(page, expect, after) {
  const f = await focused(page)
  expect(!f.body, `after ${after}, focus fell to the page body`)
  return f
}

/** Opens a path and waits until React has taken over the page, so a press does what it would for a person. */
async function open(page, route) {
  const res = await page.goto(`${base}${route}`, { waitUntil: "networkidle" })
  await until(() => page.evaluate(() => Object.keys(document.querySelector("main") ?? {}).some((k) => k.startsWith("__react"))), `${route} never hydrated`, 15000)
  // The shell measures itself after hydration; give it a frame to settle its layout.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  return res
}

/** Waits for a client navigation to land, then for route focus to move. */
async function landed(page, pathname) {
  await until(() => new URL(page.url()).pathname === pathname, `the address never became ${pathname}`, 10000)
  await until(() => page.evaluate(() => document.activeElement?.id === "main"), `after going to ${pathname}, focus never reached main`, 5000)
}

const press = async (page, locator, key = "Enter") => {
  await locator.focus()
  await page.keyboard.press(key)
}

const drawerCheck = (viewport, band) => ({
  name: `The drawer opens from the menu button, holds focus, and gives it back on Escape (${band})`,
  viewport,
  async run({ page, expect }) {
    await open(page, "/")
    const menu = page.getByRole("button", { name: "Open navigation" })
    expect(await menu.isVisible(), "the top bar shows the menu button")
    expect.equal(await menu.getAttribute("aria-expanded"), "false", "the menu button says the drawer is closed")
    await press(page, menu)
    const drawer = page.getByRole("dialog", { name: "Navigation" })
    await until(() => drawer.isVisible(), "the drawer never opened")
    await until(() => drawer.evaluate((el) => el.contains(document.activeElement)), "focus did not move into the drawer")
    // Behind the open drawer the page is hidden from screen readers, so the button is found by its label, not its role.
    expect.equal(await page.locator('button[aria-label="Open navigation"]').getAttribute("aria-expanded"), "true", "the menu button says the drawer is open")
    expect.equal(await page.getByRole("heading", { level: 1 }).count(), 0, "the page behind the drawer is hidden from screen readers")
    for (const key of [...Array(24).fill("Tab"), ...Array(6).fill("Shift+Tab")]) {
      await page.keyboard.press(key)
      expect(await drawer.evaluate((el) => el.contains(document.activeElement)), `${key} took focus out of the open drawer`)
    }
    await page.keyboard.press("Escape")
    await until(async () => !(await drawer.isVisible()), "Escape did not close the drawer")
    const f = await expectFocusOff(page, expect, "closing the drawer")
    expect.equal(f.name, "Open navigation", "focus went back to the menu button")
  },
})

const checks = [
  drawerCheck(PHONE, "phone, 390px"),
  drawerCheck(TABLET, "tablet, 820px"),
  {
    name: "Choosing a place in the drawer closes it and puts focus on the new page's main",
    viewport: PHONE,
    async run({ page, expect }) {
      await open(page, "/")
      await press(page, page.getByRole("button", { name: "Open navigation" }))
      const drawer = page.getByRole("dialog", { name: "Navigation" })
      await until(() => drawer.isVisible(), "the drawer never opened")
      await press(page, drawer.getByRole("link", { name: "Help" }))
      await landed(page, "/help")
      expect(!(await drawer.isVisible()), "the drawer closed")
    },
  },
  {
    name: "On a phone the page's primary action sits in the bar at the foot, clear of the page, and its dialog gives focus back",
    viewport: PHONE,
    async run({ page, expect }) {
      await open(page, "/jobs")
      const bar = page.locator('[data-slot="app-shell-action-bar"]')
      const primary = bar.getByRole("button", { name: "New job" })
      await until(() => primary.isVisible(), "the primary action is not in the phone action bar")
      expect.equal(await page.locator('[data-slot="page-header-actions"]').getByRole("button", { name: "New job" }).count(), 0, "the primary is not also in the header")
      const [main, foot] = await Promise.all([page.locator("main").boundingBox(), bar.boundingBox()])
      expect(main.y + main.height <= foot.y + 0.5, "the bar sits under the scrolling page, so it never covers what has focus")
      await press(page, primary)
      const dialog = page.getByRole("dialog", { name: "New job" })
      await until(() => dialog.isVisible(), "New job did not open its dialog")
      await page.keyboard.press("Escape")
      await until(async () => !(await dialog.isVisible()), "Escape did not close the dialog")
      const f = await expectFocusOff(page, expect, "closing the dialog")
      expect.equal(f.name, "New job", "focus went back to the button in the bar")
    },
  },
  {
    name: "Above the phone width the primary action stays in the page header, with no bar at the foot",
    viewport: TABLET,
    async run({ page, expect }) {
      await open(page, "/jobs")
      expect(await page.locator('[data-slot="page-header-actions"]').getByRole("button", { name: "New job" }).isVisible(), "New job is in the header")
      expect(!(await page.locator('[data-slot="app-shell-action-bar"]').isVisible()), "no action bar shows")
    },
  },
  {
    name: "Every navigation puts focus on main: the rail, a row's link and the breadcrumb",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/")
      const rail = page.getByRole("navigation", { name: "Main" })
      await press(page, rail.getByRole("link", { name: /^Jobs/ }))
      await landed(page, "/jobs")
      expect.equal(await rail.getByRole("link", { name: /^Jobs/ }).getAttribute("aria-current"), "page", "the rail marks the page people are on")
      await press(page, page.getByRole("link", { name: "J-1042" }))
      await landed(page, "/jobs/J-1042")
      await press(page, page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Jobs" }))
      await landed(page, "/jobs")
    },
  },
  {
    name: "Cmd or Ctrl K opens the command menu from anywhere; running a command lands focus on main, Escape gives it back",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/help")
      await page.getByRole("link", { name: "support@example.com" }).focus()
      await page.keyboard.press("ControlOrMeta+KeyK")
      const palette = page.getByRole("dialog", { name: "Search" })
      await until(() => palette.isVisible(), "the shortcut did not open the command menu")
      await page.keyboard.press("Escape")
      await until(async () => !(await palette.isVisible()), "Escape did not close the command menu")
      const back = await expectFocusOff(page, expect, "closing the command menu")
      expect.equal(back.name, "support@example.com", "focus went back to where it was")
      await page.keyboard.press("ControlOrMeta+KeyK")
      await until(() => palette.isVisible(), "the shortcut did not open the command menu again")
      await page.keyboard.type("Invoices")
      await page.keyboard.press("Enter")
      await landed(page, "/invoices")
      expect(!(await palette.isVisible()), "running a command closed the menu")
    },
  },
  {
    name: "Search, status filters, sort and page live in the address and survive a reload",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs")
      const chip = page.getByRole("button", { name: /^Overdue, / })
      await press(page, chip, "Space")
      await until(() => new URL(page.url()).searchParams.get("status") === "overdue", "the filter did not reach the address")
      await page.getByRole("searchbox", { name: "Search jobs" }).fill("Riverside")
      await until(() => new URL(page.url()).searchParams.get("q") === "Riverside", "the search did not reach the address")
      await press(page, page.getByRole("button", { name: /^Visit/ }))
      await until(() => new URL(page.url()).searchParams.get("sort") === "date", "the sort did not reach the address")
      await page.reload({ waitUntil: "networkidle" })
      await until(() => page.evaluate(() => Object.keys(document.querySelector("main") ?? {}).some((k) => k.startsWith("__react"))), "the page never hydrated after the reload")
      expect.equal(await page.getByRole("button", { name: /^Overdue, / }).getAttribute("aria-pressed"), "true", "the filter is still on")
      expect.equal(await page.getByRole("searchbox", { name: "Search jobs" }).inputValue(), "Riverside", "the search is still there")
      expect.equal(await page.getByRole("link", { name: "J-1031" }).count(), 1, "the matching job shows")
      expect.equal(await page.getByRole("link", { name: "J-1042" }).count(), 0, "a job outside the filter does not")
      await open(page, "/jobs?page=2")
      expect((await page.locator('[data-slot="pagination-range"]').textContent()).startsWith("11 to 20"), "page 2 opens from the address")
    },
  },
  {
    name: "A link to the list from a filtered view starts it afresh, in the address and on screen",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs")
      await press(page, page.getByRole("button", { name: /^Overdue, / }), "Space")
      await until(() => new URL(page.url()).searchParams.get("status") === "overdue", "the filter did not reach the address")
      await press(page, page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /^Jobs/ }))
      await until(() => new URL(page.url()).search === "", "the address kept the filter")
      await until(async () => (await page.getByRole("button", { name: /^Overdue, / }).getAttribute("aria-pressed")) === "false", "the filter stayed on after the link")
      expect(await page.getByRole("link", { name: "J-1042" }).isVisible(), "every job shows again")
    },
  },
  {
    name: "Bulk actions act on the selected rows on screen, focus returns to the filters, and Undo brings the rows back",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs")
      await press(page, page.getByRole("checkbox", { name: "Select all rows shown" }), "Space")
      await until(async () => (await page.locator('[data-slot="toolbar-count"]').textContent())?.trim() === "10 selected", "select all did not select the 10 rows on screen")
      await press(page, page.getByRole("button", { name: "Clear selection" }))
      await until(async () => (await focused(page)).name === "Search jobs" || (await focused(page)).tag === "input", "clearing the selection did not put focus back in the filters")
      await press(page, page.getByRole("checkbox", { name: "Select J-1042" }), "Space")
      await press(page, page.getByRole("checkbox", { name: "Select J-1043" }), "Space")
      await press(page, page.getByRole("button", { name: "Archive" }))
      const toast = page.locator('[data-slot="toast"]').filter({ hasText: "2 jobs archived." })
      await until(() => toast.isVisible(), "no toast said the jobs were archived")
      expect.equal(await page.getByRole("link", { name: "J-1042" }).count(), 0, "the archived rows left the table")
      const f = await expectFocusOff(page, expect, "a bulk action")
      expect.equal(f.tag, "input", "focus went back to the search, the first of the filters")
      await page.keyboard.press("Alt+KeyT")
      await until(async () => (await focused(page)).name === "Undo", "Alt T did not reach the toast's Undo")
      await page.keyboard.press("Enter")
      await until(() => page.getByRole("link", { name: "J-1042" }).isVisible(), "Undo did not bring the rows back")
      await expectFocusOff(page, expect, "Undo")
    },
  },
  {
    name: "Archiving a row from its own menu moves focus to the job that took its place",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs")
      await press(page, page.getByRole("button", { name: "More actions for J-1042" }))
      await press(page, page.getByRole("menuitem", { name: "Archive" }))
      await until(async () => (await page.getByRole("link", { name: "J-1042" }).count()) === 0, "the row did not go")
      const f = await until(async () => {
        const now = await focused(page)
        return now.body ? null : now
      }, "after archiving from the row's menu, focus fell to the page body")
      expect.equal(f.name, "J-1043", "focus went to the next job")
    },
  },
  {
    name: "Clear filters in the empty state brings the rows back and puts focus in the search",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs?q=no-such-job")
      expect(await page.getByRole("heading", { name: /No jobs match/ }).isVisible(), "the empty state says nothing matches")
      await press(page, page.getByRole("button", { name: "Clear filters" }))
      await until(() => page.getByRole("link", { name: "J-1042" }).isVisible(), "the rows did not come back")
      await until(async () => (await focused(page)).tag === "input", "focus did not go to the search")
      expect(!new URL(page.url()).searchParams.has("q"), "the address dropped the search")
    },
  },
  {
    name: "The open tab lives in the address, arrow keys move it, and a reload keeps it",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs/J-1042")
      const tabs = page.getByRole("tablist", { name: "J-1042 sections" })
      await press(page, tabs.getByRole("tab", { name: "Quote" }))
      await until(() => new URL(page.url()).searchParams.get("tab") === "quote", "the open tab did not reach the address")
      expect(await page.getByRole("tabpanel").getByRole("table", { name: "Quote for J-1042" }).isVisible(), "the quote shows in the panel")
      await page.keyboard.press("ArrowRight")
      await until(() => new URL(page.url()).searchParams.get("tab") === "activity", "ArrowRight did not move to the next tab")
      expect.equal((await focused(page)).name, "Activity", "focus moved with the selection")
      await page.reload({ waitUntil: "networkidle" })
      expect.equal(await page.getByRole("tab", { name: "Activity" }).getAttribute("aria-selected"), "true", "the reload kept the tab")
      await until(() => page.evaluate(() => Object.keys(document.querySelector("main") ?? {}).some((k) => k.startsWith("__react"))), "the page never hydrated after the reload")
      await press(page, page.getByRole("tab", { name: "Activity" }), "Home")
      await until(() => !new URL(page.url()).searchParams.has("tab"), "the overview, the default, left a tab in the address")
    },
  },
  {
    name: "A decision says what happened in a toast with Undo, and focus never drops to the page body",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs/J-1042")
      const status = page.locator('[data-slot="page-header-meta"] [data-slot="badge"]').first()
      expect.equal((await status.textContent()).trim(), "Needs you", "the job starts waiting on the reader")
      await press(page, page.getByRole("button", { name: "Approve quote" }))
      const toast = page.locator('[data-slot="toast"]').filter({ hasText: "Quote for J-1042 approved." })
      await until(() => toast.isVisible(), "no toast said the quote was approved")
      expect.equal((await status.textContent()).trim(), "Scheduled", "the job moved on")
      const f = await expectFocusOff(page, expect, "approving")
      expect.equal(f.slot, "page-title", "focus went to the page title, because the button went")
      await page.keyboard.press("Alt+KeyT")
      await until(async () => (await focused(page)).name === "Undo", "Alt T did not reach Undo")
      await page.keyboard.press("Enter")
      await until(async () => (await status.textContent()).trim() === "Needs you", "Undo did not put the decision back")
      expect(await page.getByRole("button", { name: "Approve quote" }).isVisible(), "the decision can be made again")
      await expectFocusOff(page, expect, "Undo")
    },
  },
  {
    name: "On a phone the decision is in the bar at the foot, and focus still lands on the title",
    viewport: PHONE,
    async run({ page, expect }) {
      await open(page, "/jobs/J-1043")
      const approve = page.locator('[data-slot="app-shell-action-bar"]').getByRole("button", { name: "Approve quote" })
      await until(() => approve.isVisible(), "the decision is not in the phone action bar")
      await press(page, approve)
      await until(() => page.locator('[data-slot="toast"]').filter({ hasText: "Quote for J-1043 approved." }).isVisible(), "no toast said the quote was approved")
      const f = await expectFocusOff(page, expect, "approving on a phone")
      expect.equal(f.slot, "page-title", "focus went to the page title")
      expect(!(await page.locator('[data-slot="app-shell-action-bar"]').isVisible()), "the empty bar went away")
    },
  },
  {
    name: "The shortcuts switch turns single-key shortcuts and their hints off, and on again",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs")
      const hint = page.locator('[data-slot="search-field"] kbd')
      expect(await hint.isVisible(), "the search shows its / hint")
      await page.locator("main").focus()
      await page.keyboard.press("/")
      expect.equal((await focused(page)).tag, "input", "/ moves focus to the search")
      await open(page, "/settings")
      const toggle = page.getByRole("switch", { name: "Single-key shortcuts" })
      expect.equal(await toggle.getAttribute("aria-checked"), "true", "shortcuts start on")
      await press(page, toggle, "Space")
      await until(async () => (await toggle.getAttribute("aria-checked")) === "false", "the switch did not turn off")
      expect.equal(await page.evaluate(() => document.documentElement.dataset.shortcuts), "off", "the setting reached the page, where components read it")
      expect.equal(await page.evaluate(() => localStorage.getItem("shortcuts")), "off", "the setting is kept")
      await press(page, page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /^Jobs/ }))
      await landed(page, "/jobs")
      expect.equal(await hint.count(), 0, "the / hint went with the shortcut")
      await page.keyboard.press("/")
      expect.equal((await focused(page)).id, "main", "/ no longer moves focus")
      await open(page, "/help")
      expect(await page.getByRole("link", { name: "Turn on single-key shortcuts" }).isVisible(), "Help says single keys are off")
      expect.equal(await page.evaluate(() => document.documentElement.dataset.shortcuts), "off", "a fresh page load keeps them off")
      await open(page, "/settings")
      await press(page, page.getByRole("switch", { name: "Single-key shortcuts" }), "Space")
      await open(page, "/jobs")
      await page.locator("main").focus()
      await page.keyboard.press("/")
      expect.equal((await focused(page)).tag, "input", "turned back on, / moves focus to the search again")
    },
  },
  {
    name: "A job that no longer exists says so with one heading and leads back to the list",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs/J-0000")
      expect(await page.getByRole("heading", { level: 1, name: "This job no longer exists." }).isVisible(), "it says the job no longer exists")
      expect.equal(await page.locator("h1").count(), 1, "one h1")
      await press(page, page.getByRole("link", { name: "Back to jobs" }))
      await landed(page, "/jobs")
    },
  },
  {
    name: "A page that failed keeps the rail and offers Try again, a way home and details for support",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs/J-1050")
      await until(() => page.getByRole("heading", { level: 1, name: "This page did not load." }).isVisible(), "the failed page does not say so")
      expect(await page.getByRole("navigation", { name: "Main" }).isVisible(), "the rail stays")
      expect(await page.getByRole("button", { name: "Try again" }).isVisible(), "it offers Try again")
      expect(await page.getByRole("link", { name: "Go to Home" }).isVisible(), "it offers a way home")
      expect(await page.getByRole("button", { name: "Details for support" }).isVisible(), "support details sit in a disclosure")
    },
  },
  {
    name: "An address with no page answers 404, with one heading and a way home",
    viewport: PHONE,
    async run({ page, expect }) {
      const res = await page.goto(`${base}/no-such-page`, { waitUntil: "networkidle" })
      expect.equal(res.status(), 404, "the status is 404")
      expect(await page.getByRole("heading", { level: 1, name: "There is no page at this address." }).isVisible(), "it says there is no page")
      expect(await page.getByRole("link", { name: "Go to Home" }).isVisible(), "it offers a way home")
    },
  },
]

let browser
try {
  browser = await chromium.launch({ channel: "chrome" })
} catch {
  browser = await chromium.launch()
}
const passed = []
const failed = []
for (const check of checks) {
  const context = await browser.newContext({ viewport: check.viewport })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  try {
    await check.run({ page, expect: makeExpect() })
    // The failed page throws on purpose; anything else that throws is a failure.
    const unexpected = errors.filter((m) => !m.includes("[Booking system] did not return"))
    if (unexpected.length) throw new Error(`the page threw: ${unexpected.join("; ")}`)
    passed.push(check.name)
  } catch (e) {
    failed.push({ check: check.name, reason: String(e.message ?? e).split("\n")[0] })
  } finally {
    await context.close()
  }
}
await browser.close()
const result = { passed: passed.length, failed }
if (arg("--json")) writeFileSync(path.resolve(arg("--json")), `${JSON.stringify({ ...result, passedChecks: passed }, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(result)}\n`)
if (failed.length) process.exitCode = 1
