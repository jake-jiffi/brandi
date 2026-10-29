#!/usr/bin/env node
/**
 * Run the scripted behaviour checks in each component's definition, in a real browser with a real
 * keyboard: Playwright driving the installed Chrome, so nothing is downloaded. Every check gets a
 * fresh page, because a modal left open by one check breaks every check after it.
 *
 *   node tools/check-components.mjs [--previews <dir>] [--only Button,Dialog] [--json results.json]
 *
 * <dir> holds each component's rendered preview (<Name>Preview.preview.html, written by Brandi's
 * preview.mjs). A check receives { page, scope, expect, theme, brand, format }: scope is the example's
 * section, brand is { name, product, symbol }, the names the bundle was built with and whether it has a symbol mark, and format is lib/format.js
 * with the product's TIME style, so an expected time reads the way the product writes times.
 * Prints {"passed": n, "failed": [...]} and exits 1 when anything failed.
 *
 * Without --previews it reads canvas/previews, which `brandi product bundle` renders along with
 * definitions.json: { "sha256", "files" }, the hash of the definitions the previews came from. That
 * folder must exist, carry the file, and match the definitions as they are now, or every check
 * fails at once: a stale preview would test components that no longer exist. When canvas/dist holds
 * this starter's own build (`npm run canvas`), its bundle replaces the copy the previews mount, so
 * the checks run on the code as it is. A folder named with --previews is one its caller has just
 * rendered (Brandi's try loop and its gates), checked against its definitions.json when it has one.
 */

import { chromium } from "playwright"
import { createHash } from "node:crypto"
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const ownPreviews = path.join(root, "canvas", "previews")
const previews = arg("--previews") ? path.resolve(arg("--previews")) : ownPreviews
const only = arg("--only")?.split(",").map((s) => s.trim()).filter(Boolean)

function makeExpect() {
  const expect = (value, message) => { if (!value) throw new Error(message ?? "expected a truthy value") }
  expect.equal = (a, b, message) => { if (a !== b) throw new Error(`${message ?? "not equal"}: got ${JSON.stringify(a)}, wanted ${JSON.stringify(b)}`) }
  expect.atLeast = (a, b, message) => { if (!(a >= b)) throw new Error(`${message ?? "too small"}: got ${a}, wanted at least ${b}`) }
  return expect
}

// The starter's own formatter and time style, so a check expects a time the way this product writes it.
const format = { ...(await import(pathToFileURL(path.join(root, "lib", "format.js")).href)), TIME: (await import(pathToFileURL(path.join(root, "lib", "format-locale.js")).href)).TIME }

const dir = path.join(root, "components", "system")
const files = readdirSync(dir).filter((x) => x.endsWith(".def.mjs")).sort()
const defs = []
for (const f of files) {
  const def = (await import(pathToFileURL(path.join(dir, f)).href)).default
  if (!only || only.includes(def.name)) defs.push(def)
}

// The hash `brandi product bundle` records: each definition in filename order, as "<filename>\n<contents>\n".
const hash = createHash("sha256")
for (const f of files) hash.update(`${f}\n${readFileSync(path.join(dir, f), "utf8")}\n`)
const current = hash.digest("hex")
const stamp = path.join(previews, "definitions.json")
let stale = null
if (!existsSync(previews) || (previews === ownPreviews && !existsSync(stamp))) {
  stale = "Run brandi product bundle to render the previews"
} else if (existsSync(stamp)) {
  let recorded = null
  try {
    recorded = JSON.parse(readFileSync(stamp, "utf8"))
  } catch {
    // An unreadable record proves nothing about the previews, so it counts as out of date.
  }
  if (recorded?.sha256 !== current) stale = "The previews are older than the definitions: run brandi product bundle"
}
if (stale) {
  const result = { passed: 0, failed: [{ check: "previews", reason: `${stale} (${path.relative(process.cwd(), previews) || "."})` }] }
  if (arg("--json")) writeFileSync(path.resolve(arg("--json")), `${JSON.stringify({ ...result, passedChecks: [] }, null, 2)}\n`)
  // Written before exiting, so a piped reader gets the whole line.
  await new Promise((resolve) => process.stdout.write(`${JSON.stringify(result)}\n`, resolve))
  process.exit(1)
}

// The previews mount the system from ds/<namespace>/components, a copy of the bundle as it was when they
// were rendered. Once this starter has built its own (`npm run canvas` writes canvas/dist), that copy is
// refreshed first, so the checks always run on the components as they are now.
const dist = path.join(root, "canvas", "dist")
if (previews === ownPreviews && existsSync(path.join(dist, "bundle.js"))) {
  const { namespace } = JSON.parse(readFileSync(path.join(root, "system", "system.json"), "utf8"))
  const installed = path.join(previews, "ds", namespace, "components")
  mkdirSync(installed, { recursive: true })
  for (const f of ["bundle.js", "bundle.css"]) copyFileSync(path.join(dist, f), path.join(installed, f))
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
        // A starter has the brand's own names, not the kit's placeholders, so checks read them from the bundle.
        const brand = await page.evaluate(() => {
          const kit = Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)
          return { name: kit?.BRAND?.name ?? "Product", product: kit?.PRODUCT?.name ?? "Product", symbol: Boolean(kit?.BRAND?.marks?.symbol) }
        })
        await check.run({ page, scope, expect: makeExpect(), theme, brand, format })
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
