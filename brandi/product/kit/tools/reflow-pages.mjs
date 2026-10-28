#!/usr/bin/env node
/**
 * Reflow at 320 CSS px (WCAG 1.4.10: 1280 at 400% zoom, and a small phone): does anything scroll sideways?
 *
 *   node tools/reflow-pages.mjs --pages pages.json [--json results.json]
 *
 * pages.json is a list of { url, width, height, label, kind }, the fluid boards and the routes. Each is opened
 * at its width (320) and measured once it has settled: the page fails when the document is wider than the
 * window. No detector and no axe here, just the overflow, with the widest element that sticks out named so a
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
    if (await page.$("x-dc, [data-dc-root]")) await page.waitForSelector("html[data-dc-ready]", { timeout: 20000 })
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
      return { scrollWidth: root.scrollWidth, clientWidth: width, worst }
    })
    results.push({ ...p, ...m, overflow: m.scrollWidth > m.clientWidth })
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
