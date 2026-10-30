#!/usr/bin/env node
/**
 * Reflow at 320 CSS px (WCAG 1.4.10: 1280 at 400% zoom, and a small phone): does anything scroll sideways?
 *
 *   node tools/reflow-pages.mjs --pages pages.json [--json results.json]
 *
 * pages.json is a list of { url, width, height, label, kind }, the fluid boards and the routes. Each is opened
 * at its width (320) and measured once it has settled: the page fails when the document is wider than the
 * window, or when content runs past the window's edge and something inside the page cuts it off or scrolls it
 * sideways (a main that scrolls, a card that clips). A portal's home passed with its cards 96px past a phone's edge,
 * because the page itself never scrolled. No detector and no axe here, just the overflow, with the widest element that sticks out named so a
 * person can find it. Prints {"pages": n, "overflow": n, "errors": n} and exits 1 when anything overflows.
 */

import { chromium } from "playwright"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const pages = JSON.parse(readFileSync(path.resolve(arg("--pages")), "utf8"))

let browser
try { browser = await chromium.launch({ channel: "chrome", args: ["--allow-file-access-from-files"] }) } catch { browser = await chromium.launch({ args: ["--allow-file-access-from-files"] }) }
const results = []
for (const p of pages) {
  const context = await browser.newContext({ viewport: { width: p.width ?? 320, height: p.height ?? 800 } })
  const page = await context.newPage()
  try {
    await page.goto(p.url, { waitUntil: p.kind === "route" ? "networkidle" : "load", timeout: 60000 })
    // Attached, not visible: a board with no height of its own (a dialog over its page) never counts as visible. Only a
    // board drawn through the runtime shim says it is ready or failed; a static board never says, so it is not waited on.
    if (await page.$("script[src*='dc-shim']")) {
      await page.waitForSelector("html[data-dc-ready], html[data-dc-error]", { state: "attached", timeout: 20000 })
      const failed = await page.evaluate(() => document.documentElement.getAttribute("data-dc-error"))
      if (failed) throw new Error(`the board did not render: ${failed}`)
    } else if (await page.$("x-import, dc-import, sc-for, sc-if")) {
      // A board that needed the runtime and rendered without it (React not fetched, offline) is no static board.
      throw new Error("the board mounts components and rendered without its runtime: React could not be fetched, so connect once and run the gates again")
    }
    if (p.kind === "route") await page.waitForSelector("h1", { timeout: 10000 }).catch(() => {})
    await page.evaluate(() => document.fonts?.ready)
    await page.waitForTimeout(300)
    const m = await page.evaluate(() => {
      const root = document.documentElement
      const width = root.clientWidth
      // The element reaching furthest past the right edge, named by its slot, id or tag, for the record.
      let worst = null
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect()
        if (r.width && r.right > width + 1 && (!worst || r.right > worst.right)) worst = { right: Math.round(r.right), what: el.getAttribute("data-slot") ?? (el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${el.classList.length ? `.${[...el.classList].slice(0, 2).join(".")}` : ""}`) }
      }
      // Content past the edge that the page does not scroll to: cut off by a box that clips, or left in a region that
      // scrolls both ways. Left out: what is meant to scroll sideways (a table, code), what is hidden or one pixel wide,
      // and a page drawn behind a dialog (inert).
      let cut = null
      // A Board is one too: under 640px its columns snap one at a time with the next peeking in, as its contract says.
      const meantToScroll = "table, pre, code, [role='table'], [role='grid'], [data-slot='data-table'], [data-slot='tabs-list'], [data-slot='board'], [inert]"
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect()
        if (!(r.width > 1 && r.height > 1 && r.right > width + 1 && r.left < width)) continue
        if (el.closest(meantToScroll) || getComputedStyle(el).visibility === "hidden") continue
        if (!cut || r.right > cut.right) cut = { right: Math.round(r.right), what: el.getAttribute("data-slot") ?? (el.id ? `#${el.id}` : `${el.tagName.toLowerCase()}${el.classList.length ? `.${[...el.classList].slice(0, 2).join(".")}` : ""}`) }
      }
      return { scrollWidth: root.scrollWidth, clientWidth: width, worst: worst ?? cut, cut: root.scrollWidth <= width && cut ? cut : null }
    })
    results.push({ ...p, ...m, overflow: m.scrollWidth > m.clientWidth || Boolean(m.cut) })
  } catch (e) {
    results.push({ ...p, error: String(e.message ?? e).split("\n")[0] })
  } finally {
    await context.close()
  }
}
await browser.close()
const overflow = results.filter((r) => r.overflow).length
const errors = results.filter((r) => r.error).length
if (arg("--json")) writeFileSync(path.resolve(arg("--json")), `${JSON.stringify({ pages: results.length, overflow, errors, results }, null, 2)}\n`)
process.stdout.write(`${JSON.stringify({ pages: results.length, overflow, errors })}\n`)
if (overflow || errors) process.exitCode = 1
