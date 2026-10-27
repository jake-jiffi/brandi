#!/usr/bin/env node
/**
 * Run axe-core on a list of pages in a real browser (Playwright driving the installed Chrome).
 *
 *   node tools/axe-pages.mjs --pages pages.json [--json results.json]
 *   node tools/axe-pages.mjs --routes tools/routes.json --base http://localhost:3000 [--json results.json]
 *
 * pages.json is a list of { url, width, height, theme, label, kind }. A board rendered through Brandi's
 * runtime shim is scanned once it says it is ready. --routes scans a running app instead: every route at
 * 1440, 820 and 390, light and dark, a dark render asking for it in the address (?theme=dark), each once the
 * page has settled. Every violation is reported with its impact; the gate counts any violation as a
 * failure, whatever its impact.
 */

import { chromium } from "playwright"
import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

const require = createRequire(import.meta.url)
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }

/** Every route at the bar's widths, light and dark: a phone layout is a different document, not a narrower one. */
function routePages(file, base) {
  const routes = JSON.parse(readFileSync(path.resolve(file), "utf8"))
  const root = base.replace(/\/$/, "")
  return routes.flatMap((r) =>
    [1440, 820, 390].flatMap((width) =>
      ["light", "dark"].map((theme) => ({
        url: `${root}${r.path}${theme === "dark" ? `${r.path.includes("?") ? "&" : "?"}theme=dark` : ""}`,
        width,
        height: 900,
        theme,
        label: r.label ?? r.path,
        kind: "route",
        route: true,
      }))
    )
  )
}

const pages = arg("--routes") ? routePages(arg("--routes"), arg("--base") ?? process.env.STARTER_URL ?? "http://localhost:3000") : JSON.parse(readFileSync(path.resolve(arg("--pages")), "utf8"))
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8")
const axeVersion = JSON.parse(readFileSync(require.resolve("axe-core/package.json"), "utf8")).version
// A board or a component page shows a page frame more than once on purpose: a shell at four widths, or
// a flow of screens side by side. These rules are about one page's own structure, so they run on the
// starter's routes, where a page is one page, and the record says they were skipped everywhere else.
const SPECIMEN = ["component", "board"]
const PAGE_RULES = ["landmark-no-duplicate-main", "landmark-main-is-top-level", "landmark-unique"]

let browser
try { browser = await chromium.launch({ channel: "chrome", args: ["--allow-file-access-from-files"] }) } catch { browser = await chromium.launch({ args: ["--allow-file-access-from-files"] }) }
const results = []
for (const p of pages) {
  const context = await browser.newContext({ viewport: { width: p.width ?? 1440, height: p.height ?? 900 }, colorScheme: p.theme === "dark" ? "dark" : "light" })
  const page = await context.newPage()
  try {
    await page.goto(p.url, { waitUntil: p.route ? "networkidle" : "load", timeout: 60000 })
    if (await page.$("x-dc, [data-dc-root]")) await page.waitForSelector("html[data-dc-ready]", { timeout: 20000 })
    // A route is scanned as people meet it: hydrated, measured and settled, not as the server's first draft.
    if (p.route) await page.waitForTimeout(800)
    await page.addScriptTag({ content: axeSource })
    // Label in name is WCAG 2.5.3, Level A, but axe ships it switched off as experimental.
    const rules = { "label-content-name-mismatch": { enabled: true } }
    if (SPECIMEN.includes(p.kind)) for (const id of PAGE_RULES) rules[id] = { enabled: false }
    const r = await page.evaluate(async (rules) => {
      const res = await axe.run(document, { resultTypes: ["violations"], rules })
      return res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) }))
    }, rules)
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
const out = { axe: axeVersion, pages: results.length, violations, errors, skipped: { kinds: SPECIMEN, rules: PAGE_RULES }, results }
if (arg("--json")) writeFileSync(path.resolve(arg("--json")), `${JSON.stringify(out, null, 2)}\n`)
process.stdout.write(`${JSON.stringify({ axe: axeVersion, pages: results.length, violations, errors })}\n`)
if (violations || errors) process.exitCode = 1
