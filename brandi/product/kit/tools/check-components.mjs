#!/usr/bin/env node
/**
 * Run the scripted behaviour checks in each component's definition, in a real browser with a real
 * keyboard: Playwright driving the installed Chrome, so nothing is downloaded. Every check gets a
 * fresh page, because a modal left open by one check breaks every check after it.
 *
 *   node tools/check-components.mjs --previews <dir> [--only Button,Dialog] [--json results.json]
 *
 * <dir> holds each component's rendered preview (<Name>Preview.preview.html, written by Brandi's
 * preview.mjs). A check receives { page, scope, expect, theme }: scope is the example's section.
 * Prints {"passed": n, "failed": [...]} and exits 1 when anything failed.
 */

import { chromium } from "playwright"
import { existsSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const previews = path.resolve(arg("--previews") ?? "canvas/previews")
const only = arg("--only")?.split(",").map((s) => s.trim()).filter(Boolean)

function makeExpect() {
  const expect = (value, message) => { if (!value) throw new Error(message ?? "expected a truthy value") }
  expect.equal = (a, b, message) => { if (a !== b) throw new Error(`${message ?? "not equal"}: got ${JSON.stringify(a)}, wanted ${JSON.stringify(b)}`) }
  expect.atLeast = (a, b, message) => { if (!(a >= b)) throw new Error(`${message ?? "too small"}: got ${a}, wanted at least ${b}`) }
  return expect
}

const dir = path.join(root, "components", "system")
const defs = []
for (const f of readdirSync(dir).filter((x) => x.endsWith(".def.mjs")).sort()) {
  const def = (await import(pathToFileURL(path.join(dir, f)).href)).default
  if (!only || only.includes(def.name)) defs.push(def)
}

let browser
try {
  browser = await chromium.launch({ channel: "chrome", args: ["--allow-file-access-from-files"] })
} catch {
  browser = await chromium.launch({ args: ["--allow-file-access-from-files"] })
}
const passed = []
const failed = []
for (const def of defs) {
  const file = path.join(previews, `${def.name}Preview.preview.html`)
  for (const check of def.checks ?? []) {
    for (const theme of check.themes ?? ["light"]) {
      const label = `${def.name}: ${check.name}${theme === "light" ? "" : ` (${theme})`}`
      if (!existsSync(file)) { failed.push({ check: label, reason: `no preview at ${file}` }); continue }
      const context = await browser.newContext({ viewport: check.viewport ?? { width: 1280, height: 900 }, hasTouch: Boolean(check.touch), reducedMotion: check.reducedMotion ? "reduce" : "no-preference", forcedColors: check.forcedColors ? "active" : "none" })
      const page = await context.newPage()
      const errors = []
      page.on("pageerror", (e) => errors.push(e.message))
      try {
        await page.goto(`${pathToFileURL(file).href}?props=${encodeURIComponent(JSON.stringify({ dark: theme === "dark" }))}`)
        await page.waitForSelector("html[data-dc-ready]", { timeout: 15000 })
        const boardError = await page.getAttribute("html", "data-dc-error")
        if (boardError) throw new Error(`the preview failed to render: ${boardError}`)
        const scope = check.example ? page.locator(`[data-example="${check.example}"]`) : page.locator("body")
        await check.run({ page, scope, expect: makeExpect(), theme })
        if (errors.length) throw new Error(`the page threw: ${errors.join("; ")}`)
        passed.push(label)
      } catch (e) {
        failed.push({ check: label, reason: String(e.message ?? e).split("\n")[0] })
      } finally {
        await context.close()
      }
    }
  }
}
await browser.close()
const result = { passed: passed.length, failed }
if (arg("--json")) writeFileSync(path.resolve(arg("--json")), `${JSON.stringify({ ...result, passedChecks: passed }, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(result)}\n`)
if (failed.length) process.exitCode = 1
