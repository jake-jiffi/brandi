#!/usr/bin/env node
/**
 * Measure rendered boards, so a frame on the canvas is exactly as tall as its content: a frame smaller
 * than its content clips, and only a republish fixes it.
 *
 *   node tools/measure-boards.mjs --pages pages.json
 *
 * pages.json is a list of { url, width, label }. Prints { "<label>": height } once every board has
 * rendered through the runtime shim.
 */

import { chromium } from "playwright"
import { readFileSync } from "node:fs"
import path from "node:path"

const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const pages = JSON.parse(readFileSync(path.resolve(arg("--pages")), "utf8"))
let browser
try { browser = await chromium.launch({ channel: "chrome", args: ["--allow-file-access-from-files"] }) } catch { browser = await chromium.launch({ args: ["--allow-file-access-from-files"] }) }
const heights = {}
for (const p of pages) {
  const context = await browser.newContext({ viewport: { width: p.width, height: 900 } })
  const page = await context.newPage()
  try {
    await page.goto(p.url, { waitUntil: "load", timeout: 60000 })
    await page.waitForSelector("html[data-dc-ready]", { timeout: 20000 })
    await page.evaluate(() => document.fonts?.ready)
    heights[p.label] = await page.evaluate(() => {
      const root = document.querySelector("[data-dc-root]") ?? document.body
      root.style.minHeight = "0"
      return Math.ceil(Math.max(root.scrollHeight, root.getBoundingClientRect().height))
    })
  } catch (e) {
    heights[p.label] = { error: String(e.message ?? e).split("\n")[0] }
  } finally {
    await context.close()
  }
}
await browser.close()
process.stdout.write(`${JSON.stringify(heights)}\n`)
