#!/usr/bin/env node
/**
 * Measure rendered boards, so a frame on the canvas is exactly as tall as its content: a frame smaller
 * than its content clips, and only a republish fixes it.
 *
 *   node tools/measure-boards.mjs --pages pages.json
 *
 * pages.json is a list of { url, width, label, height?, frame? }. Prints { "<label>": height } once every board has
 * rendered through the runtime shim, and under "__sections" each board's [data-board-section] heights in
 * order, so a board too tall for the canvas can be split between its sections.
 *
 * `height` is the window a board opens in, the device's (900 when not given). A shell page fills the window and
 * its main scrolls, so measured as it opened it was always the window's height: the window grows until main no
 * longer scrolls, and the page measures as the shell's bars plus main's whole content, never less than the window.
 *
 * `frame` is the board's declared { w, h }. Given one, the board is first drawn at that size, as the canvas draws it,
 * and every box that clips content taller than itself is listed under "__clipped": a Card squeezed inside a phone
 * frame hid a checkout's total, and nothing said so. Text cut short on purpose (an ellipsis, a line clamp), a box
 * that scrolls, a visually hidden one, an overlay drawn open (positioned, as a menu's panel is) and a page under a
 * dialog's scrim (inert or aria-hidden) are left out.
 */

import { chromium } from "playwright"
import { readFileSync } from "node:fs"
import path from "node:path"

const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : undefined }
const pages = JSON.parse(readFileSync(path.resolve(arg("--pages")), "utf8"))
// A few pixels over is rounding, not a hidden line: the smallest line of text is twice this.
const CLIP_TOLERANCE = 4

/** Every box on the page that clips content taller than itself (run in the page). */
function clippedBoxes(tolerance) {
  const replaced = new Set(["INPUT", "TEXTAREA", "SELECT", "IMG", "VIDEO", "CANVAS", "IFRAME", "OBJECT", "EMBED", "PICTURE"])
  const found = []
  for (const el of document.querySelectorAll("body *")) {
    if (!(el instanceof HTMLElement) || replaced.has(el.tagName)) continue
    const s = getComputedStyle(el)
    if (s.overflowY !== "hidden" && s.overflowY !== "clip") continue
    if (el.clientHeight <= 1 || el.clientWidth <= 1) continue
    if (s.textOverflow === "ellipsis" || (s.webkitLineClamp && s.webkitLineClamp !== "none")) continue
    if (s.position === "absolute" || s.position === "fixed") continue
    if (el.closest("[inert], [aria-hidden='true']")) continue
    if (el.scrollHeight - el.clientHeight <= tolerance) continue
    // The outermost box is enough: whatever it holds is hidden with it.
    if (found.some((f) => f.el.contains(el))) continue
    found.push({ el, what: el.getAttribute("data-slot") ?? `${el.tagName.toLowerCase()}${el.classList.length ? `.${[...el.classList].slice(0, 2).join(".")}` : ""}`, shown: el.clientHeight, content: el.scrollHeight, text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 40) })
  }
  return found.map(({ el, ...f }) => f)
}

/** How much more a shell's main holds than it shows, for a shell as tall as the window (run in the page). */
function shellOverflow() {
  return Math.max(0, ...[...document.querySelectorAll("[data-slot='app-shell-main']")]
    .filter((main) => Math.abs((main.closest("[data-slot='app-shell']")?.getBoundingClientRect().height ?? -1) - innerHeight) <= 1)
    .map((main) => main.scrollHeight - main.clientHeight))
}

const settle = (page) => page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))

let browser
try { browser = await chromium.launch({ channel: "chrome", args: ["--allow-file-access-from-files"] }) } catch { browser = await chromium.launch({ args: ["--allow-file-access-from-files"] }) }
const heights = {}
const sections = {}
const clipped = {}
for (const p of pages) {
  const window = p.height ?? 900
  const context = await browser.newContext({ viewport: { width: p.width, height: p.frame?.h ?? window } })
  const page = await context.newPage()
  try {
    await page.goto(p.url, { waitUntil: "load", timeout: 60000 })
    // Attached, not visible: a dialog drawn over its page leaves the document no height, so it never counts as visible.
    // A board drawn through the runtime shim says when it is ready, or that it failed; a static board has no runtime
    // and never says, so it gets a moment and is measured as it is.
    const shimmed = Boolean(await page.$("script[src*='dc-shim']"))
    await page.waitForSelector("html[data-dc-ready], html[data-dc-error]", { state: "attached", timeout: shimmed ? 20000 : 2000 }).catch((e) => { if (shimmed) throw e })
    const failed = await page.evaluate(() => document.documentElement.getAttribute("data-dc-error"))
    if (failed) throw new Error(`the board did not render: ${failed}`)
    // Its unmounted tags are no static board: offline, with React not yet fetched, a board renders without the
    // runtime, and measured as it stands its size would be the bare tags'.
    if (!shimmed && await page.$("x-import, dc-import, sc-for, sc-if")) throw new Error("the board mounts components and rendered without its runtime: React could not be fetched, so connect once and run the gates again")
    await page.evaluate(() => document.fonts?.ready)
    if (p.frame) {
      await settle(page)
      const boxes = await page.evaluate(clippedBoxes, CLIP_TOLERANCE)
      if (boxes.length) clipped[p.label] = boxes
      if (p.frame.h !== window) {
        await page.setViewportSize({ width: p.width, height: window })
        await settle(page)
      }
    }
    // Content that keeps a window's height of its own grows with the window and never stops scrolling: once growing
    // has not helped, the page is measured as it stands.
    for (let i = 0, last = Infinity; i < 4; i++) {
      const extra = await page.evaluate(shellOverflow)
      if (extra <= 1 || extra >= last) break
      last = extra
      await page.setViewportSize({ width: p.width, height: page.viewportSize().height + extra })
      await settle(page)
    }
    heights[p.label] = await page.evaluate(() => {
      const root = document.querySelector("[data-dc-root]") ?? document.body
      root.style.minHeight = "0"
      return Math.ceil(Math.max(root.scrollHeight, root.getBoundingClientRect().height))
    })
    const parts = await page.evaluate(() => [...document.querySelectorAll("[data-board-section]")].map((el) => [el.getAttribute("data-board-section"), Math.ceil(el.getBoundingClientRect().height)]))
    if (parts.length) sections[p.label] = Object.fromEntries(parts)
  } catch (e) {
    heights[p.label] = { error: String(e.message ?? e).split("\n")[0] }
  } finally {
    await context.close()
  }
}
await browser.close()
process.stdout.write(`${JSON.stringify({ ...heights, __sections: sections, __clipped: clipped })}\n`)
