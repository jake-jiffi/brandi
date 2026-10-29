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
 * failure, whatever its impact. An image that did not load is reported the same way (image-not-loaded),
 * because axe passes it, and so is a form with a required field and no noValidate (form-without-novalidate), and
 * text or an attribute that reads [object Object], an element joined into a string (object-as-text).
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
  // A route is known by its kind, as reflow-pages.mjs knows it: the gates' page list marks it no other way.
  // Keyed on a flag that only --routes set, every route a round scanned went to axe at load, with no wait at all.
  const route = p.kind === "route"
  let retried
  try {
    await page.goto(p.url, { waitUntil: route ? "networkidle" : "load", timeout: 60000 })
    // Attached, not visible: a dialog drawn over its page (06-canvas.md) leaves the document no height, so html never
    // counts as visible, and waiting for that left the board unscanned at every width. Only a board drawn through the
    // runtime shim says it is ready, or that it failed, as measure-boards.mjs reads it: a static board has no runtime
    // and never says, and waiting for it left every one unscanned after 20 seconds.
    if (await page.$("script[src*='dc-shim']")) {
      await page.waitForSelector("html[data-dc-ready], html[data-dc-error]", { state: "attached", timeout: 20000 })
      const failed = await page.evaluate(() => document.documentElement.getAttribute("data-dc-error"))
      if (failed) throw new Error(`the board did not render: ${failed}`)
    } else if (await page.$("x-import, dc-import, sc-for, sc-if")) {
      // Its unmounted tags are no static board: offline, with React not yet fetched, a board renders without the
      // runtime, and scanned as it stands it would pass.
      throw new Error("the board mounts components and rendered without its runtime: React could not be fetched, so connect once and run the gates again")
    }
    // A route is scanned as people meet it: hydrated, measured and settled, not as the server's first draft.
    // Every page has one h1, and a streamed page's loading skeleton has none, so wait for it. Under load a
    // record page was still streaming after network idle, and axe reported a page with no heading. A page
    // that shows none in ten seconds is loaded once more and waited for again, and its result says so, so a
    // slow page stays on the record. One that still shows none is scanned anyway, and fails for it.
    if (route) {
      const heading = () => page.waitForSelector("h1", { timeout: 10000 }).then(() => true, () => false)
      if (!(await heading())) {
        retried = "no h1 after 10s on first load"
        await page.goto(p.url, { waitUntil: "networkidle", timeout: 60000 })
        await heading()
      }
      await page.waitForTimeout(800)
    }
    await page.addScriptTag({ content: axeSource })
    // Label in name is WCAG 2.5.3, Level A, but axe ships it switched off as experimental.
    const rules = { "label-content-name-mismatch": { enabled: true } }
    if (SPECIMEN.includes(p.kind)) for (const id of PAGE_RULES) rules[id] = { enabled: false }
    const r = await page.evaluate(async (rules) => {
      const res = await axe.run(document, { resultTypes: ["violations"], rules })
      return res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) }))
    }, rules)
    // Neither axe nor the detector sees an image that did not load: alt="" passes, and a 0px picture draws
    // nothing to judge. A character pose given as a path from the page root broke on every board that way. Every
    // image, lazy ones included, has to load and decode.
    const broken = await page.evaluate(async () => {
      const images = [...document.images]
      for (const img of images) img.loading = "eager"
      const late = () => new Promise((done) => setTimeout(() => done(true), 10000))
      const failed = await Promise.all(images.map((img) => Promise.race([img.decode().then(() => false, () => true), late()])))
      return images.filter((img, i) => failed[i] && img.naturalWidth === 0).map((img) => (img.currentSrc || img.getAttribute("src") || "(no src)").slice(0, 120))
    })
    if (broken.length) r.push({ id: "image-not-loaded", impact: "serious", help: "Every image loads: one that failed passes axe and the detector unseen", nodes: broken.slice(0, 5) })
    // A form with a required field and no noValidate hands an empty field to the browser's own bubble: a submit
    // (requestSubmit included) stops before the submit event, so the system's ErrorSummary and the Field's error
    // never show. Board forms did that, and axe and the detector passed them.
    const bubbling = await page.evaluate(() =>
      [...document.forms]
        .filter((form) => !form.noValidate)
        .flatMap((form) => {
          const required = [...new Set([...form.querySelectorAll("[required], [aria-required='true']"), ...[...form.elements].filter((el) => el.required || el.getAttribute("aria-required") === "true")])]
          if (!required.length) return []
          const names = required.slice(0, 3).map((el) => (el.labels?.[0]?.textContent || el.getAttribute("aria-label") || el.getAttribute("name") || el.tagName.toLowerCase()).trim())
          return [`form${form.id ? `#${form.id}` : ""} (required: ${names.join(", ")})`.slice(0, 120)]
        })
    )
    if (bubbling.length) r.push({ id: "form-without-novalidate", impact: "moderate", help: "A form with a required field sets noValidate, so the system's errors, not the browser's bubble, say what is missing", nodes: bubbling.slice(0, 5) })
    // A text node that is one {{hole}} draws its value as it is, an element included; two holes in one text node, or a
    // hole beside other words, are joined as a string, and an element reads "[object Object]". axe reads it as text.
    const objects = await page.evaluate(() => {
      const where = (el) => el.getAttribute("data-slot") ?? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}`
      const found = []
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        if (n.nodeValue.includes("[object Object]") && !n.parentElement.closest("script, style, template")) found.push(`${where(n.parentElement)}: ${n.nodeValue.trim().slice(0, 60)}`)
      }
      for (const el of document.body.querySelectorAll("*")) {
        for (const a of el.attributes) if (a.value.includes("[object Object]")) found.push(`${where(el)} ${a.name}="${a.value.slice(0, 60)}"`)
      }
      return found
    })
    if (objects.length) r.push({ id: "object-as-text", impact: "serious", help: "A value drawn as text reads [object Object]: give each element its own {{hole}}, alone in its text node (06-canvas.md)", nodes: objects.slice(0, 5) })
    results.push({ ...p, ...(retried && { retried }), violations: r })
  } catch (e) {
    results.push({ ...p, ...(retried && { retried }), violations: [], error: String(e.message ?? e).split("\n")[0] })
  } finally {
    await context.close()
  }
}
await browser.close()
const violations = results.reduce((n, r) => n + r.violations.length, 0)
const errors = results.filter((r) => r.error).length
const retries = results.filter((r) => r.retried).length
const out = { axe: axeVersion, pages: results.length, violations, errors, retried: retries, skipped: { kinds: SPECIMEN, rules: PAGE_RULES }, results }
if (arg("--json")) writeFileSync(path.resolve(arg("--json")), `${JSON.stringify(out, null, 2)}\n`)
process.stdout.write(`${JSON.stringify({ axe: axeVersion, pages: results.length, violations, errors, retried: retries })}\n`)
if (violations || errors) process.exitCode = 1
