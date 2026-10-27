#!/usr/bin/env node
/**
 * The pinned Impeccable detector over every route in tools/routes.json, at 1440, 820 and 390, light and dark,
 * against the built app running under `next start`. The detector cannot set a theme, so a dark render asks
 * for it in the address (?theme=dark), which the root layout reads before the first paint.
 *
 *   IMPECCABLE_BIN=/path/to/impeccable node tools/detect.mjs [--base http://localhost:3000] [--json results.json]
 *
 * IMPECCABLE_BIN is the detector engine: the binary the round recorded, pinned by version. CI downloads it from
 * the engine's release and checks its sha256. Prints {"detector", "renders", "findings", "skipped", "errors"}
 * and exits 1 on any finding or any render it could not read. A page that answers 404 is one the detector
 * skips, so it is listed as skipped, never counted as clean; any other error status fails the run.
 */

import { spawn, spawnSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const base = (arg("--base") ?? process.env.STARTER_URL ?? "http://localhost:3000").replace(/\/$/, "")
const WIDTHS = [1440, 820, 390]
const HEIGHT = 900

const engine = process.env.IMPECCABLE_BIN
if (!engine) {
  process.stderr.write(
    "The detector needs IMPECCABLE_BIN: the path to the Impeccable detector engine this product pins.\n" +
      "Download it from https://github.com/pbakaus/impeccable/releases (engine-v<version>), check its .sha256, and set IMPECCABLE_BIN to the file.\n"
  )
  process.exit(2)
}
if (!existsSync(engine)) {
  process.stderr.write(`IMPECCABLE_BIN is set, but there is no file at ${engine}.\n`)
  process.exit(2)
}
const version = spawnSync(engine, ["--version"], { encoding: "utf8", timeout: 20000 }).stdout?.trim().split("\n")[0] || "unknown"

const routes = JSON.parse(readFileSync(path.join(root, "tools", "routes.json"), "utf8"))
const renders = []
for (const r of routes) {
  for (const width of WIDTHS) {
    for (const theme of ["light", "dark"]) {
      const url = `${base}${r.path}${theme === "dark" ? `${r.path.includes("?") ? "&" : "?"}theme=dark` : ""}`
      renders.push({ label: r.label, path: r.path, url, width, theme })
    }
  }
}

// The status of each route, once: a 404 is skipped by the detector, so it is reported as skipped.
const statuses = new Map()
for (const r of routes) {
  try {
    statuses.set(r.path, (await fetch(`${base}${r.path}`, { redirect: "manual" })).status)
  } catch (e) {
    process.stderr.write(`Nothing answered at ${base}${r.path} (${e.message}). Start the app first: npm run build && npm start.\n`)
    process.exit(2)
  }
}

const findings = []
const skipped = []
const errors = []

/** One render, exactly as Brandi's gates run it: `<engine> detect --json --no-config --viewport WxH <url>`. */
const detect = (render) =>
  new Promise((resolve) => {
    const child = spawn(engine, ["detect", "--json", "--no-config", "--viewport", `${render.width}x${HEIGHT}`, render.url])
    let out = ""
    let err = ""
    child.stdout.on("data", (d) => { out += d })
    child.stderr.on("data", (d) => { err += d })
    child.on("close", () => {
      try {
        for (const f of JSON.parse(out || "[]")) findings.push({ page: render.label, width: render.width, theme: render.theme, rule: f.antipattern, severity: f.severity, selector: f.selector, snippet: f.snippet })
      } catch {
        errors.push({ page: render.label, width: render.width, theme: render.theme, output: (out || err).slice(0, 300) })
      }
      resolve()
    })
  })

// The detector reports nothing for a page that answers with an error, which would read as clean. A 404 is a page
// people can reach (the not-found page), so it is listed as skipped; any other error status is a broken route.
const queue = renders.filter((render) => {
  const status = statuses.get(render.path)
  if (status < 400) return true
  if (status === 404) skipped.push({ page: render.label, width: render.width, theme: render.theme, reason: "answers 404, which the detector skips" })
  else errors.push({ page: render.label, width: render.width, theme: render.theme, output: `answers ${status}` })
  return false
})
let next = 0
await Promise.all(
  Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (next < queue.length) await detect(queue[next++])
  })
)

const result = { detector: version, renders: renders.length, findings: findings.length, skipped: skipped.length, errors: errors.length }
if (arg("--json")) writeFileSync(path.resolve(arg("--json")), `${JSON.stringify({ ...result, base, widths: WIDTHS, findings, skipped, errors }, null, 2)}\n`)
for (const f of findings) process.stderr.write(`${f.page} at ${f.width}, ${f.theme}: ${f.rule} on ${f.selector ?? "?"} (${f.snippet ?? ""})\n`)
for (const e of errors) process.stderr.write(`${e.page} at ${e.width}, ${e.theme}: the detector could not read it: ${e.output}\n`)
for (const s of [...new Set(skipped.map((x) => x.page))]) process.stderr.write(`${s}: skipped, it answers 404\n`)
process.stdout.write(`${JSON.stringify(result)}\n`)
if (findings.length || errors.length) process.exitCode = 1
