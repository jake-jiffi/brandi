#!/usr/bin/env node
/**
 * Every canvas board under the Design canvas's own runtime, the way the canvas draws it: inside a frame whose
 * parent is another origin (Playwright driving the installed Chrome, files served from disk, no port opened).
 *
 *   node tools/canvas-runtime.mjs --boards <canvas folder> --runtime <dc-runtime.js> [--json results.json]
 *
 * Brandi's previews draw a board as the top page with a shim, so a board can pass every other gate and still
 * break on the canvas: one that walked window's properties read the cross-origin parent and threw there only.
 * The runtime posts each board's render errors to its parent, which is what the canvas lists; this reports
 * those, any page error, and a board that never boots. The runtime is the canvas type's own file: read
 * artifact-type/dc-runtime.js from any Design canvas and save it (product/.cache/dc-runtime.js).
 */

import { chromium } from "playwright"
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const dir = path.resolve(arg("--boards") ?? "")
const runtime = path.resolve(arg("--runtime") ?? "")
const out = arg("--json")
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2" }
const boards = readdirSync(dir).filter((f) => f.endsWith(".dc.html")).sort()
const runtimeSource = readFileSync(runtime)
// A board settles once fonts and the bundle are in; the canvas waits as long before it lists an error.
const SETTLE_MS = 2500
const AT_ONCE = 6

const browser = await chromium.launch({ channel: "chrome" })
const context = await browser.newContext({ viewport: { width: 1500, height: 1200 } })
// The host page stands in for the canvas: it frames the board from another origin and keeps what the runtime posts.
await context.route("http://host.test/**", (route) => {
  const f = new URL(route.request().url()).searchParams.get("f") ?? ""
  route.fulfill({
    contentType: "text/html",
    body: `<!doctype html><body style="margin:0"><script>window.__got=[];addEventListener("message",(e)=>{if(e.data&&String(e.data.type||"").startsWith("__dc"))window.__got.push(e.data)})</script><iframe src="http://canvas.test/${encodeURIComponent(f)}" style="width:1440px;height:1100px;border:0"></iframe></body>`,
  })
})
await context.route("http://canvas.test/**", async (route) => {
  const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/+/, "")
  if (rel === "support.js") return route.fulfill({ body: runtimeSource, contentType: "text/javascript" })
  const file = path.join(dir, rel)
  if (!file.startsWith(dir + path.sep)) return route.fulfill({ status: 404, body: "" })
  try {
    await route.fulfill({ body: await readFile(file), contentType: types[path.extname(rel).toLowerCase()] ?? "application/octet-stream" })
  } catch {
    await route.fulfill({ status: 404, body: "" })
  }
})

const results = []
const one = async (board) => {
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`page error: ${e.message}`))
  try {
    await page.goto(`http://host.test/?f=${encodeURIComponent(board)}`, { waitUntil: "load", timeout: 30000 })
    await page.waitForTimeout(SETTLE_MS)
    const got = await page.evaluate(() => window.__got)
    if (!got.some((m) => m.type === "__dc_booted")) errors.push("never booted")
    for (const m of got) {
      if (m.type !== "__dc_render_errors" || !m.errors) continue
      for (const e of Array.isArray(m.errors) ? m.errors : Object.values(m.errors)) errors.push(typeof e === "string" ? e : (e?.message ?? JSON.stringify(e)))
    }
  } catch (e) {
    errors.push(`did not load: ${e.message.split("\n")[0]}`)
  }
  await page.close()
  results.push({ board, errors: [...new Set(errors)] })
}
for (let i = 0; i < boards.length; i += AT_ONCE) await Promise.all(boards.slice(i, i + AT_ONCE).map(one))
await browser.close()

results.sort((a, b) => a.board.localeCompare(b.board))
const failed = results.filter((r) => r.errors.length)
const report = { boards: results.length, failed: failed.map((r) => ({ board: r.board, errors: r.errors })) }
if (out) writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`)
console.log(`canvas runtime: ${results.length} boards, ${failed.length} with errors`)
for (const r of failed) console.log(`  ${r.board}: ${r.errors.join("; ")}`)
process.exit(failed.length ? 1 : 0)
