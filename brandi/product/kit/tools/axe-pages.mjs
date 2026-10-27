#!/usr/bin/env node
/**
 * Run axe-core on a list of pages in a real browser (Playwright driving the installed Chrome).
 *
 *   node tools/axe-pages.mjs --pages pages.json [--json results.json]
 *
 * pages.json is a list of { url, width, height, theme, label }. A board rendered through Brandi's runtime
 * shim is scanned once it says it is ready. Every violation is reported with its impact; the gate
 * counts any violation as a failure, whatever its impact.
 */

import { chromium } from "playwright"
import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

const require = createRequire(import.meta.url)
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const pages = JSON.parse(readFileSync(path.resolve(arg("--pages")), "utf8"))
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8")
const axeVersion = JSON.parse(readFileSync(require.resolve("axe-core/package.json"), "utf8")).version

let browser
try { browser = await chromium.launch({ channel: "chrome", args: ["--allow-file-access-from-files"] }) } catch { browser = await chromium.launch({ args: ["--allow-file-access-from-files"] }) }
const results = []
for (const p of pages) {
  const context = await browser.newContext({ viewport: { width: p.width ?? 1440, height: p.height ?? 900 }, colorScheme: p.theme === "dark" ? "dark" : "light" })
  const page = await context.newPage()
  try {
    await page.goto(p.url, { waitUntil: "load", timeout: 60000 })
    if (await page.$("x-dc, [data-dc-root]")) await page.waitForSelector("html[data-dc-ready]", { timeout: 20000 })
    await page.addScriptTag({ content: axeSource })
    const r = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const res = await axe.run(document, { resultTypes: ["violations"] })
      return res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) }))
    })
    results.push({ ...p, violations: r })
  } catch (e) {
    results.push({ ...p, violations: [], error: String(e.message ?? e).split("\n")[0] })
  } finally {
    await context.close()
  }
}
await browser.close()
const violations = results.reduce((n, r) => n + r.violations.length, 0)
const errors = results.filter((r) => r.error).length
const out = { axe: axeVersion, pages: results.length, violations, errors, results }
if (arg("--json")) writeFileSync(path.resolve(arg("--json")), `${JSON.stringify(out, null, 2)}\n`)
process.stdout.write(`${JSON.stringify({ axe: axeVersion, pages: results.length, violations, errors })}\n`)
if (violations || errors) process.exitCode = 1
