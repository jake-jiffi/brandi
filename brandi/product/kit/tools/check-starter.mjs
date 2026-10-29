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
 * never left on the page body; filters and the open tab in the address, and Back bringing a list back as it was
 * left; a decision's toast with Undo; and the shortcuts setting turning single keys and their hints off. Prints
 * {"passed": n, "failed": [...]} and exits 1 when anything failed.
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

/** Waits for React to take over a page Back or a reload brought back. */
const hydrated = (page, what) => until(() => page.evaluate(() => Object.keys(document.querySelector("main") ?? {}).some((k) => k.startsWith("__react"))), `${what} never hydrated`, 15000)

const contrast = (a, b) => {
  const lum = (css) => {
    const [r, g, b] = (css.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => (Number(v) / 255 <= 0.03928 ? Number(v) / 255 / 12.92 : ((Number(v) / 255 + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** What a fixed or sticky element covers of the focused control, in words, or null when nothing does. */
const covered = (page) =>
  page.evaluate(() => {
    const a = document.activeElement
    if (!a || a === document.body || a.id === "main") return null
    const r = a.getBoundingClientRect()
    if (!r.height) return null
    for (const el of document.querySelectorAll("body *")) {
      if (el.contains(a) || el.getAttribute("data-slot") === "toast-region") continue
      const cs = getComputedStyle(el)
      if (!(cs.position === "fixed" || cs.position === "sticky") || cs.display === "none" || cs.visibility === "hidden") continue
      const b = el.getBoundingClientRect()
      const over = Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top)
      if (b.width && b.height && b.left < r.right && b.right > r.left && over / r.height > 0.05) {
        return `"${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 30)}" is ${Math.round((over / r.height) * 100)}% under ${el.getAttribute("data-slot") ?? el.tagName.toLowerCase()}`
      }
    }
    return null
  })

const zoomCheck = (viewport, band) => ({
  name: `Shift+Tab up the jobs list never leaves the focused control under a bar that sticks (${band})`,
  viewport,
  async run({ page, expect }) {
    await open(page, "/jobs")
    await page.getByRole("button", { name: "Next" }).focus()
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Shift+Tab")
      const under = await covered(page)
      expect(!under, `WCAG 2.4.11: ${under}`)
    }
  },
})

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
    name: "Each filter chip says its count once, in jobs",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs")
      const names = await page.locator('[data-slot="filter-chip"]').evaluateAll((all) => all.map((el) => el.getAttribute("aria-label") ?? el.textContent))
      expect.atLeast(names.length, 1, "chips to read")
      for (const name of names) expect(/^[^,]+, [\d,]+ jobs?$/.test(name) && !/need.*need/i.test(name), `"${name}" says its count once`)
    },
  },
  {
    name: "Loading a filtered address leaves it exactly as typed, and adds nothing to the history",
    viewport: DESKTOP,
    async run({ page, expect }) {
      const typed = `${base}/jobs?status=needs-you,overdue`
      // Every write that changes the address is counted, from before the page's first script.
      await page.addInitScript(() => {
        window.__writes = []
        for (const m of ["pushState", "replaceState"]) {
          const was = history[m].bind(history)
          history[m] = (state, title, url) => {
            if (url !== undefined && url !== null && new URL(url, location.href).href !== location.href) window.__writes.push(String(url))
            return was(state, title, url)
          }
        }
      })
      await page.goto(typed, { waitUntil: "commit" })
      const length = await page.evaluate(() => history.length)
      await hydrated(page, "the filtered list")
      await page.waitForLoadState("networkidle")
      await page.evaluate(() => new Promise((r) => setTimeout(r, 500)))
      expect.equal(page.url(), typed, "the address is exactly as typed")
      expect.equal(await page.evaluate(() => history.length), length, "the history is the same length")
      expect.equal((await page.evaluate(() => window.__writes)).join(" "), "", "the page wrote nothing new to its address")
      expect.equal(await page.getByRole("button", { name: /^Needs you, / }).getAttribute("aria-pressed"), "true", "and the filters are on")
      expect(await page.getByRole("heading", { level: 1, name: "Jobs" }).isVisible(), "the page has its heading")
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
    name: "Leaving Settings with unsaved changes asks first: a link or a command waits, Keep editing keeps the change, Leave drops it, and Back keeps it as a draft that Forward brings back",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/settings")
      const name = page.getByRole("textbox", { name: "Name" })
      const saved = await name.inputValue()
      await name.focus()
      await page.keyboard.type("s")
      const typed = await name.inputValue()
      const unsaved = page.getByText("Unsaved changes", { exact: true })
      await until(() => unsaved.isVisible(), "the Profile section never said it had unsaved changes")
      const help = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Help" })
      const ask = page.getByRole("dialog", { name: "Leave without saving?" })
      const notice = page.getByRole("status").filter({ hasText: "Your unsaved changes to Profile are back." })
      const keep = () => until(async () => (await focused(page)).name === "Keep editing", "Keep editing never took focus")
      await press(page, help)
      await until(() => ask.isVisible(), "the rail's link left the unsaved changes without asking")
      expect.equal(new URL(page.url()).pathname, "/settings", "nothing navigated while it asks")
      expect((await ask.textContent()).includes("Your changes to Profile will be lost."), "it names the section with the changes")
      await keep()
      await page.keyboard.press("Enter")
      await until(async () => !(await ask.isVisible()), "Keep editing did not close it")
      expect.equal(new URL(page.url()).pathname, "/settings", "Keep editing stays on the page")
      expect.equal(await name.inputValue(), typed, "and the change is still there")
      expect.equal((await focused(page)).name, "Help", "focus went back to the link")
      await page.keyboard.press("ControlOrMeta+KeyK")
      await until(() => page.getByRole("dialog", { name: "Search" }).isVisible(), "the shortcut did not open the command menu")
      await page.keyboard.type("Help")
      await page.keyboard.press("Enter")
      await until(() => ask.isVisible(), "the command menu left the unsaved changes without asking")
      await keep()
      await page.keyboard.press("Escape")
      await until(async () => !(await ask.isVisible()), "Escape did not close it")
      expect.equal(new URL(page.url()).pathname, "/settings", "Escape stays on the page")
      await expectFocusOff(page, expect, "Escape on the question")
      await press(page, help)
      await until(() => ask.isVisible(), "the link did not ask a second time")
      await press(page, ask.getByRole("button", { name: "Leave", exact: true }))
      await landed(page, "/help")
      // Leave meant losing the change: coming back finds what was saved, and no draft.
      await press(page, page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Settings" }))
      await landed(page, "/settings")
      expect.equal(await name.inputValue(), saved, "after Leave, the field holds what was saved")
      expect.equal(await notice.count(), 0, "and no draft came back")
      // Back while it asks: the question goes with the page, and focus lands on the new page's main as after any route change.
      await name.focus()
      await page.keyboard.type("s")
      const kept = await name.inputValue()
      await press(page, help)
      await until(() => ask.isVisible(), "the link did not ask on the way back in")
      await page.goBack()
      await landed(page, "/help")
      expect(!(await ask.isVisible()), "Back took the question away with the page")
      // Back kept the change as a draft: Forward brings it back, says so, and the page is guarded again.
      await page.goForward()
      await landed(page, "/settings")
      await until(async () => (await name.inputValue()) === kept, "Forward did not bring the change back")
      expect(await notice.isVisible(), "the section says the changes are back")
      expect(await unsaved.isVisible(), "and shows them as unsaved")
      await press(page, notice.getByRole("button", { name: "Discard changes" }))
      await until(async () => (await name.inputValue()) === saved, "Discard changes did not go back to what was saved")
      expect(!(await notice.isVisible()) && !(await unsaved.isVisible()), "the notice and the warning went with the draft")
      expect.equal((await focused(page)).tag, "input", "focus moved to the first field, not the page body")
      expect.equal(await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("draft:")).length), 0, "no draft is left in the tab")
    },
  },
  {
    name: "Saved settings leave freely, and a reload with unsaved changes gets the browser's own prompt, then brings them back as a draft",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/settings")
      const name = page.getByRole("textbox", { name: "Name" })
      const unsaved = page.getByText("Unsaved changes", { exact: true })
      await name.focus()
      await page.keyboard.type("s")
      await press(page, page.getByRole("button", { name: "Save profile" }))
      await until(async () => !(await unsaved.isVisible()), "saving never cleared the unsaved changes")
      await press(page, page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Help" }))
      await landed(page, "/help")
      await open(page, "/settings")
      await name.focus()
      await page.keyboard.type("s")
      await until(() => unsaved.isVisible(), "the Profile section never said it had unsaved changes")
      const prompt = new Promise((resolve) =>
        page.once("dialog", (dialog) => {
          resolve(dialog.type())
          dialog.accept()
        })
      )
      const typed = await name.inputValue()
      await page.reload()
      expect.equal(await Promise.race([prompt, new Promise((resolve) => setTimeout(() => resolve("no prompt"), 3000))]), "beforeunload", "a reload with unsaved changes asks")
      await hydrated(page, "the reloaded settings")
      await until(async () => (await name.inputValue()) === typed, "the reload lost the change")
      expect(await page.getByRole("status").filter({ hasText: "Your unsaved changes to Profile are back." }).isVisible(), "and says it is back")
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
  {
    name: "Back from a record brings the list back as it was left: filters, search, sort and page",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs")
      await press(page, page.getByRole("button", { name: /^Scheduled, / }), "Space")
      await press(page, page.getByRole("button", { name: /^Done, / }), "Space")
      await page.getByRole("searchbox", { name: "Search jobs" }).fill("a")
      await press(page, page.getByRole("button", { name: /^Customer/ }))
      await until(() => new URL(page.url()).searchParams.get("sort") === "customer", "the sort did not reach the address")
      await press(page, page.getByRole("button", { name: "Next" }))
      await until(() => new URL(page.url()).searchParams.get("page") === "2", "the page did not reach the address")
      const left = new URL(page.url()).search
      const range = await page.locator('[data-slot="pagination-range"]').textContent()
      await press(page, page.locator('[data-slot="data-table-wide"] [data-slot="data-table-open"]').first())
      await until(() => new URL(page.url()).pathname.startsWith("/jobs/J-"), "the record did not open")
      await hydrated(page, "the record")
      await page.goBack()
      await until(() => new URL(page.url()).pathname === "/jobs", "Back did not return to the list")
      await hydrated(page, "the list")
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      expect.equal(new URL(page.url()).search, left, "the address is the one the list was left at")
      expect.equal(await page.getByRole("button", { name: /^Scheduled, / }).getAttribute("aria-pressed"), "true", "the first filter is still on")
      expect.equal(await page.getByRole("button", { name: /^Done, / }).getAttribute("aria-pressed"), "true", "the second filter is still on")
      expect.equal(await page.getByRole("searchbox", { name: "Search jobs" }).inputValue(), "a", "the search is still there")
      expect.equal(await page.getByRole("columnheader", { name: /^Customer/ }).getAttribute("aria-sort"), "ascending", "the sort is still there")
      expect.equal(await page.locator('[data-slot="pagination-range"]').textContent(), range, "the same page of results")
    },
  },
  {
    name: "A new page of results adds a history entry; filters and a record's tab replace theirs",
    viewport: DESKTOP,
    async run({ page }) {
      await open(page, "/")
      await press(page, page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /^Jobs/ }))
      await landed(page, "/jobs")
      await press(page, page.getByRole("button", { name: "Next" }))
      await until(() => new URL(page.url()).searchParams.get("page") === "2", "the page did not reach the address")
      await page.goBack()
      await until(() => new URL(page.url()).pathname === "/jobs" && !new URL(page.url()).searchParams.has("page"), "Back from page 2 did not return to page 1")
      await until(async () => (await page.locator('[data-slot="pagination-range"]').textContent()).startsWith("1 to 10"), "page 1 did not show again")
      await press(page, page.getByRole("button", { name: /^Overdue, / }), "Space")
      await until(() => new URL(page.url()).searchParams.get("status") === "overdue", "the filter did not reach the address")
      await page.goBack()
      await until(() => new URL(page.url()).pathname === "/", "Back after a filter should leave the list, because the filter replaced its entry")
      await open(page, "/jobs/J-1042")
      await press(page, page.getByRole("tablist", { name: "J-1042 sections" }).getByRole("tab", { name: "Quote" }))
      await until(() => new URL(page.url()).searchParams.get("tab") === "quote", "the tab did not reach the address")
      await page.goBack()
      await until(() => new URL(page.url()).pathname === "/", "Back after a tab should leave the record, because the tab replaced its entry")
    },
  },
  zoomCheck({ width: 640, height: 400 }, "200% zoom, 640 by 400"),
  zoomCheck({ width: 320, height: 256 }, "400% zoom, 320 by 256"),
  zoomCheck(PHONE, "phone, where the toolbar sticks"),
  {
    name: "A search that finds nothing says so in the one live count, which never unmounts and speaks again when rows come back",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs")
      await page.locator('[data-slot="pagination-range"]').evaluate((el) => el.setAttribute("data-probe", "count"))
      const search = page.getByRole("searchbox", { name: "Search jobs" })
      await search.fill("zzzz")
      const count = page.locator('[data-slot="pagination-range"]')
      await until(async () => (await count.textContent()) === "No jobs match “zzzz”", "the count did not say nothing matches")
      expect.equal(await count.getAttribute("data-probe"), "count", "the same live region, never unmounted")
      expect.equal(await count.getAttribute("role"), "status", "a polite status")
      const box = await page.locator('[data-slot="data-table-footer"]').boundingBox()
      expect(!box || box.height <= 1, "the footer is out of sight while the empty state says so on screen")
      expect(await page.getByRole("heading", { name: "No jobs match “zzzz”" }).isVisible(), "the empty state shows")
      await search.fill("")
      await until(async () => (await count.textContent()).startsWith("1 to 10 of"), "the count did not come back with the rows")
      expect.equal(await count.getAttribute("data-probe"), "count", "still the same live region")
    },
  },
  {
    name: "Try again that fails again moves focus to the heading and says it tried, never leaving focus on the page body",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/jobs/J-1050")
      await until(() => page.getByRole("heading", { level: 1, name: "This page did not load." }).isVisible(), "the failed page does not say so")
      const line = page.locator('[data-slot="page-error-retry"]')
      expect.equal(await line.getAttribute("role"), "status", "a polite status, there from the start")
      expect.equal((await line.textContent()).trim(), "", "and quiet on arrival")
      await press(page, page.getByRole("button", { name: "Try again" }))
      await until(async () => /^Still not loading\. Tried again at .+\.$/.test(((await line.textContent()) ?? "").trim()), "the retry said nothing")
      const f = await until(async () => {
        const now = await focused(page)
        return now.tag === "h1" ? now : null
      }, "focus did not move to the heading after the retry failed")
      expect.equal(f.name, "This page did not load.", "focus is on the page's one heading")
    },
  },
  {
    name: "A field is checked when it is left, its error goes as soon as it is right, required fields say so, and Save stays quiet until something changes",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/settings")
      expect.equal(await page.getByRole("button", { name: "Save profile" }).getAttribute("data-variant"), "secondary", "Save is quiet while nothing has changed")
      const name = page.getByRole("textbox", { name: "Name" })
      const email = page.getByRole("textbox", { name: "Email" })
      expect.equal(await name.getAttribute("aria-required"), "true", "Name is required for screen readers")
      expect.equal(await email.getAttribute("aria-required"), "true", "Email is required for screen readers")
      await name.fill("")
      expect.equal(await name.getAttribute("aria-invalid"), null, "no error while typing")
      await page.keyboard.press("Tab")
      await until(async () => (await name.getAttribute("aria-invalid")) === "true", "leaving an empty Name did not mark it")
      expect(await page.getByText("Enter your name, as your team knows you.").isVisible(), "and its error shows")
      await name.focus()
      await page.keyboard.type("A")
      await until(async () => (await name.getAttribute("aria-invalid")) === null, "the error stayed after the name was right")
      expect.equal(await page.getByText("Enter your name, as your team knows you.").count(), 0, "the error went at once")
      const save = page.getByRole("button", { name: "Save profile" })
      const status = page.locator('#profile [data-slot="form-actions-status"]')
      expect.equal((await status.textContent()).trim(), "Unsaved changes", "a change says the section is unsaved")
      expect.equal(await save.getAttribute("data-variant"), "default", "and makes Save the primary")
      await email.fill("not an email")
      await press(page, save)
      await until(() => email.evaluate((el) => el === document.activeElement), "Save did not move focus to the first field in error, the email")
      expect.equal(await email.getAttribute("aria-invalid"), "true", "and Save still checks it")
    },
  },
  {
    name: "A source that is down shows as a warning, never danger",
    viewport: DESKTOP,
    async run({ page, expect }) {
      await open(page, "/invoices")
      const banner = page.locator('[data-slot="banner"]')
      expect.equal(await banner.getAttribute("data-tone"), "warning", "the banner")
      expect.equal(await page.locator('[data-slot="page-header-meta"] [data-slot="badge"]').filter({ hasText: "Sync failed" }).getAttribute("data-tone"), "warning", "the header's badge")
      expect.equal(await page.locator('[data-tone="danger"]').filter({ hasText: /not responding|Sync failed|stopped answering/ }).count(), 0, "nothing about the source is danger")
    },
  },
  {
    name: "Home's See all link counts what it opens, and no time wears the brackets that mark invented names",
    viewport: DESKTOP,
    async run({ page, expect }) {
      for (const route of ["/", "/invoices"]) {
        await open(page, route)
        const text = await page.locator("main").innerText()
        expect(!/\[\d{1,2}[:.]\d{2}/.test(text), `${route} shows a time in brackets`)
      }
      await open(page, "/")
      const link = page.getByRole("link", { name: /^See all \d+ jobs that need you or are overdue$/ })
      const n = Number((await link.textContent()).match(/\d+/)[0])
      await press(page, link)
      await until(() => new URL(page.url()).pathname === "/jobs", "See all did not open the jobs")
      await until(async () => ((await page.locator('[data-slot="pagination-range"]').textContent()) ?? "").endsWith(`of ${n}`), `the list it opened does not hold ${n} jobs`)
    },
  },
  {
    name: "On a phone the standalone See all link takes a 40px tap, and the bell's count sits on the bell",
    viewport: PHONE,
    touch: true,
    async run({ page, expect }) {
      await open(page, "/")
      const link = page.getByRole("link", { name: /^See all / })
      await link.scrollIntoViewIfNeeded()
      const reach = await link.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const x = r.left + 4
        const mid = r.top + r.height / 2
        return [mid - 19, mid + 19].every((y) => document.elementFromPoint(x, y)?.closest("a") === el)
      })
      expect(reach, "a tap 19px above and below its middle still reaches it")
      const bar = page.locator('[data-slot="phone-top-bar"]')
      const [top, glyph, count] = await Promise.all([bar.boundingBox(), bar.locator('[data-slot="notification-trigger"] [data-slot="icon"]').boundingBox(), bar.locator('[data-slot="notification-count"]').boundingBox()])
      expect(Math.abs(count.x + count.width / 2 - (glyph.x + glyph.width)) <= 4 && Math.abs(count.y + count.height / 2 - glyph.y) <= 4, "the count is on the bell's corner")
      expect.atLeast(Math.round(count.y - top.y), 8, "and clear of the top of the bar")
    },
  },
  {
    name: "On a touch tablet a tap anywhere in a job's name cell or a sort head reaches its control",
    viewport: TABLET,
    touch: true,
    async run({ page, expect }) {
      await open(page, "/jobs")
      for (const [control, slot] of [[page.getByRole("link", { name: "J-1042" }), "data-table-open"], [page.getByRole("button", { name: /^Customer/ }), "data-table-sort"]]) {
        const r = await control.evaluate((el, slot) => {
          const cell = el.closest("td, th").getBoundingClientRect()
          const x = el.getBoundingClientRect().left + 2
          return { cell: Math.round(cell.height), own: Math.round(el.getBoundingClientRect().height), hits: [cell.top + 1, cell.bottom - 2].map((y) => document.elementFromPoint(x, y)?.closest(`[data-slot="${slot}"]`) === el) }
        }, slot)
        expect.atLeast(r.cell, 40, `${slot}'s cell`)
        expect(r.hits.every(Boolean), `a tap at the top and the foot of the ${r.own}px ${slot}'s cell reaches it`)
      }
    },
  },
  {
    name: "The rail names its lockup once, and the avatar's initials hold 4.5:1 in both themes",
    viewport: DESKTOP,
    async run({ page, expect }) {
      for (const route of ["/", "/?theme=dark"]) {
        await open(page, route)
        const rail = page.getByRole("navigation", { name: "Main" })
        const lockup = rail.locator('[data-slot="product-lockup"]')
        const name = await lockup.getAttribute("aria-label")
        expect(!/^(.+) \1$/i.test(name ?? ""), `the lockup's link is named "${name}", the same name twice`)
        const avatar = rail.locator('[data-slot="sidebar-account"] [data-slot="avatar-fallback"]')
        const [ink, ground] = await avatar.evaluate((el) => [getComputedStyle(el.querySelector("[data-initials]"), "::before").color, getComputedStyle(el).backgroundColor])
        expect.atLeast(Math.round(contrast(ink, ground) * 100) / 100, 4.5, `${route}: the initials on their tint`)
      }
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
  const context = await browser.newContext({ viewport: check.viewport, hasTouch: Boolean(check.touch) })
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
