// Sheet's one definition: its README, its preview board and its scripted checks all come from here.

// An overlay is ready for keys once it has finished opening. Radix registers a layer's Escape and focus
// handling in effects that run a beat after it shows, and on a busy machine a key sent in between
// reaches the layer beneath, so a check waits for the opening animation and two frames first.
const ready = async (locator) => {
  await locator.waitFor()
  await locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
  await locator.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}

// NS. names the bundle's own global. Never walk window's properties to find it: on the canvas a board
// runs in a frame whose parent is another origin, and reading a property of that parent throws.
const ns = `{ Button: NS.Button }`

const settled = (locator) => locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
const focusOn = (page, name) => page.waitForFunction((want) => document.activeElement?.textContent?.trim() === want, name, { timeout: 5000 }).then(() => true, () => false)
const luminance = (rgb) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).map(Number)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

// A record's details, as a board would draw them: plain markup inside the sheet.
const details = `<dl style="margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 12px 24px;">
<dt style="color: var(--text-muted);">Client</dt><dd style="margin: 0; color: var(--text-strong);">[Muddy Paws Grooming]</dd>
<dt style="color: var(--text-muted);">Amount</dt><dd style="margin: 0; color: var(--text-strong); font-variant-numeric: tabular-nums;">[$2,490.50]</dd>
<dt style="color: var(--text-muted);">Status</dt><dd style="margin: 0; color: var(--text-strong);">Overdue by 4 days</dd>
<dt style="color: var(--text-muted);">Issued</dt><dd style="margin: 0; color: var(--text-strong);">[3 October]</dd>
<dt style="color: var(--text-muted);">Due</dt><dd style="margin: 0; color: var(--text-strong);">[17 October]</dd>
<dt style="color: var(--text-muted);">Reference</dt><dd style="margin: 0; color: var(--text-strong);">[INV-1042-MARCH]</dd>
</dl>`

export default {
  name: "Sheet",
  group: "Overlays",
  job: "A panel from the right, in the shell's form like the rail, for a record or a longer edit without leaving the list.",
  status: "proven",
  props: [
    { name: "open", type: "boolean", default: "false", doc: "Shows it. The page owns the state and closes it in onClose." },
    { name: "inline", type: "boolean", default: "false", doc: "Draws it in place, with no scrim, portal or focus trap, for a design on a canvas." },
    { name: "title", type: "ReactNode", doc: "The record's name, or what the edit is." },
    { name: "description", type: "ReactNode", doc: "One line under the title." },
    { name: "footer", type: "ReactNode", doc: "The buttons, secondary then primary, under a hairline at the foot. On a canvas, built in the board's script." },
    { name: "onClose", type: "() => void", doc: "Escape, the close button and a click on the scrim call it." },
    { name: "width", type: "number", default: "440", doc: "Its widest, in pixels. Never wider than the screen less the shell's inset each side." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "The title's heading level, so no page or board skips one." },
    { name: "returnFocus", type: "RefObject<HTMLElement>", doc: "Where focus goes on close when nothing had focus as it opened." },
    { name: "children", type: "ReactNode", doc: "The body. It scrolls between the header and the footer." },
  ],
  notes: {
    Behaviour: [
      "As Dialog: focus moves in and stays, Escape and the scrim close it, and focus returns to the row that opened it.",
      "Focus lands on the title, so a screen reader hears the record's name first and no action is in hand as it opens (a record's footer may start with a destructive one). Tab moves on from there.",
      "Escape closes only the top layer: a confirmation the sheet opened closes first, then the sheet.",
      "It slides in and closes at once: an exit animation would keep it live, and swallow an Escape meant for the layer beneath. Focus is back on the row the moment it closes. Drawn inline for a design, it has no live layer at all.",
      "It opens in a portal and copies the theme of the place it opened from.",
    ],
    Layout: [
      "In the shell's form, as the rail is: against the top, right and bottom of the screen and square when the rail meets the window edge, or 8px in with the rail's corners when it floats. Never wider than the screen less that inset, so on a phone it fills the width.",
      "The header and the footer stay put while the body scrolls, so the actions never leave the screen.",
    ],
    Rules: [
      "On wide screens a record's detail sits beside the list instead. Under 1280px it becomes this sheet.",
      "A sheet may open a confirmation dialog. It never opens another sheet.",
    ],
  },
  frame: { width: 960, height: 720 },
  examples: [
    {
      id: "record",
      title: "A record",
      // Drawn against the right edge of a page, as it opens: a sheet is attached to the window, never loose on a board.
      markup: `<div style="position: relative; box-sizing: border-box; width: 760px; height: 520px; overflow: hidden; background: var(--canvas); border: 1px solid var(--line);"><x-import component-from-global-scope="NS.Sheet" style="position: absolute; top: var(--shell-inset, 0px); right: var(--shell-inset, 0px); bottom: var(--shell-inset, 0px); width: 440px;" inline="{{yes}}" heading-level="{{h3}}" title="[Invoice 1039]" description="Sent to [Muddy Paws Grooming] on [3 October]" footer="{{ui.recordFooter}}">
${details}
</x-import></div>`,
      vals: { yes: true, h3: 3 },
    },
    {
      id: "live",
      title: "Open one from a list",
      markup: `<x-import component-from-global-scope="NS.Button" variant="ghost" icon="FileText" on-click="{{open1042}}">[Invoice 1042]</x-import>
<x-import component-from-global-scope="NS.Button" variant="ghost" icon="FileText" on-click="{{open1043}}">[Invoice 1043]</x-import>
<x-import component-from-global-scope="NS.Button" variant="ghost" icon="FileText" on-click="{{open1044}}">[Invoice 1044]</x-import>
<x-import component-from-global-scope="NS.Sheet" open="{{sheetOpen}}" on-close="{{closeSheet}}" title="{{sheetTitle}}" description="Sent to [Muddy Paws Grooming] on [3 October]" footer="{{ui.liveFooter}}">
${details}
<p style="margin: 24px 0 0; color: var(--text-muted); max-width: 34em;">The client opened the invoice twice and has not paid. A reminder goes out on the due date unless you send one now.</p>
<p style="margin: 12px 0 0; color: var(--text-muted); max-width: 34em;">Payments recorded here reach the bank feed overnight.</p>
</x-import>
<x-import component-from-global-scope="NS.Dialog" open="{{confirmOpen}}" on-close="{{closeConfirm}}" width="{{w400}}" title="{{confirmTitle}}" description="It goes for good, with its payment history." footer="{{ui.confirmFooter}}"></x-import>`,
      vals: { w400: 400 },
    },
  ],
  state: { sheet: null, confirm: false },
  logic: `ui: (() => {
    const A = ${ns};
    const h = React.createElement;
    const F = React.Fragment;
    return {
      recordFooter: h(F, null, h(A.Button, null, "Send reminder"), h(A.Button, { variant: "primary" }, "Record payment")),
      liveFooter: h(F, null, h(A.Button, { variant: "danger", onClick: () => self.setState({ confirm: true }) }, "Delete invoice"), h(A.Button, { variant: "primary" }, "Record payment")),
      confirmFooter: h(F, null, h(A.Button, { onClick: () => self.setState({ confirm: false }) }, "Cancel"), h(A.Button, { variant: "danger-solid", onClick: () => self.setState({ confirm: false, sheet: null }) }, "Delete invoice")),
    };
  })(),
  sheetOpen: self.state.sheet !== null,
  sheetTitle: "[Invoice " + (self.state.sheet || "1042") + "]",
  confirmOpen: self.state.confirm,
  confirmTitle: "Delete [Invoice " + (self.state.sheet || "1042") + "]?",
  open1042: () => self.setState({ sheet: "1042" }),
  open1043: () => self.setState({ sheet: "1043" }),
  open1044: () => self.setState({ sheet: "1044" }),
  closeSheet: () => self.setState({ sheet: null }),
  closeConfirm: () => self.setState({ confirm: false })`,
  checks: [
    {
      name: "Focus moves into the sheet, and Tab wraps inside it",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "[Invoice 1043]" }).focus()
        await page.keyboard.press("Enter")
        const sheet = page.getByRole("dialog", { name: "[Invoice 1043]" })
        await ready(sheet)
        const inside = () => sheet.evaluate((d) => d.contains(document.activeElement))
        expect(await inside(), "focus moved into the sheet")
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press("Tab")
          expect(await inside(), `focus is still inside after Tab ${i + 1}`)
        }
      },
    },
    {
      name: "Escape closes it and focus returns to the row that opened it",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "[Invoice 1043]" }).focus()
        await page.keyboard.press("Enter")
        const sheet = page.getByRole("dialog", { name: "[Invoice 1043]" })
        await ready(sheet)
        await page.keyboard.press("Escape")
        await sheet.waitFor({ state: "hidden" })
        expect(await focusOn(page, "[Invoice 1043]"), "focus is back on the row for [Invoice 1043]")
      },
    },
    {
      name: "Escape closes a confirmation the sheet opened first, then the sheet: nothing swallows the second Escape",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "[Invoice 1044]" }).focus()
        await page.keyboard.press("Enter")
        const sheet = page.getByRole("dialog", { name: "[Invoice 1044]" })
        await ready(sheet)
        await sheet.getByRole("button", { name: "Delete invoice" }).focus()
        await page.keyboard.press("Enter")
        const confirm = page.getByRole("dialog", { name: "Delete [Invoice 1044]?" })
        await ready(confirm)
        expect(await confirm.evaluate((d) => d.contains(document.activeElement)), "focus moved into the confirmation")
        await page.keyboard.press("Escape")
        expect.equal(await confirm.count(), 0, "the confirmation is gone straight away")
        expect.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "Delete invoice", "focus is already back on Delete invoice")
        expect(await sheet.waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false), "the sheet stays open")
        // A frame later, as a quick second press would come: no fading layer is left to swallow it.
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
        await page.keyboard.press("Escape")
        expect.equal(await sheet.count(), 0, "the second Escape closed the sheet straight away")
        expect.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "[Invoice 1044]", "focus is on the row, never the page body")
      },
    },
    {
      name: "When the confirmation closes the sheet too, focus goes back to the row, never the page body",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "[Invoice 1044]" }).focus()
        await page.keyboard.press("Enter")
        const sheet = page.getByRole("dialog", { name: "[Invoice 1044]" })
        await ready(sheet)
        expect(await sheet.evaluate((d) => document.activeElement?.closest("[role=dialog]") === d && /^H[2-4]$/.test(document.activeElement.tagName)), "focus starts on the sheet's title, not its first button")
        await sheet.getByRole("button", { name: "Delete invoice" }).focus()
        await page.keyboard.press("Enter")
        const confirm = page.getByRole("dialog", { name: "Delete [Invoice 1044]?" })
        await ready(confirm)
        await confirm.getByRole("button", { name: "Delete invoice" }).focus()
        await page.keyboard.press("Enter")
        await confirm.waitFor({ state: "hidden" })
        await sheet.waitFor({ state: "hidden" })
        expect(await focusOn(page, "[Invoice 1044]"), "focus is on the row that opened the sheet")
      },
    },
    {
      name: "A sheet drawn inline for a design takes no Escape and adds no tab stop",
      example: "record",
      async run({ page, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards on the page")
        await page.evaluate(() => {
          window.__escape = "not pressed"
          document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.__escape = e.defaultPrevented ? "swallowed" : "free" })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escape), "free", "Escape reaches the page")
      },
    },
    {
      name: "A click on the scrim closes it",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "[Invoice 1042]" }).click()
        const sheet = page.getByRole("dialog", { name: "[Invoice 1042]" })
        await ready(sheet)
        await settled(sheet)
        await page.mouse.click(20, 450)
        await sheet.waitFor({ state: "hidden" })
        expect(await focusOn(page, "[Invoice 1042]"), "focus is back on the row")
      },
    },
    {
      name: "It sits at the shell's inset from the screen's edges with the rail's corners, and the actions stay on screen while the body scrolls",
      example: "live",
      viewport: { width: 1280, height: 440 },
      async run({ scope, page, expect }) {
        await scope.getByRole("button", { name: "[Invoice 1042]" }).click()
        const sheet = page.getByRole("dialog", { name: "[Invoice 1042]" })
        await ready(sheet)
        await settled(sheet)
        const box = await sheet.boundingBox()
        const form = await sheet.evaluate((el) => { const s = getComputedStyle(el); return { inset: parseFloat(s.getPropertyValue("--shell-inset")) || 0, radius: parseFloat(s.borderTopLeftRadius) || 0, want: parseFloat(s.getPropertyValue("--radius-rail")) || 0 } })
        const i = form.inset
        expect(Math.abs(box.y - i) <= 1 && Math.abs(1280 - (box.x + box.width) - i) <= 1 && Math.abs(440 - (box.y + box.height) - i) <= 1, `${i}px in (top ${box.y}, right ${1280 - box.x - box.width}, bottom ${440 - box.y - box.height})`)
        expect.equal(form.radius, form.want, "its corners are the rail's")
        expect.equal(Math.round(box.width), 440, "its width")
        const body = sheet.locator("[data-slot=sheet-body]")
        expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight), "the body scrolls")
        const foot = await sheet.locator("[data-slot=sheet-footer]").boundingBox()
        expect(foot.y + foot.height <= 440 - i + 1, "the footer is on screen")
      },
    },
    {
      name: "On a phone it fills the width inside the same inset",
      example: "live",
      touch: true,
      viewport: { width: 390, height: 844 },
      async run({ scope, page, expect }) {
        await scope.getByRole("button", { name: "[Invoice 1042]" }).click()
        const sheet = page.getByRole("dialog", { name: "[Invoice 1042]" })
        await ready(sheet)
        await settled(sheet)
        const box = await sheet.boundingBox()
        const i = await sheet.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--shell-inset")) || 0)
        expect(Math.abs(box.x - i) <= 1 && Math.abs(box.width - (390 - 2 * i)) <= 1, `${i}px in each side (left ${box.x}, width ${box.width})`)
        expect.equal(Math.round((await sheet.getByRole("button", { name: "Close" }).boundingBox()).height), 40, "close button height on touch")
      },
    },
    {
      name: "The open sheet takes the theme of the page it opened from",
      example: "live",
      themes: ["light", "dark"],
      async run({ page, scope, expect, theme }) {
        await scope.getByRole("button", { name: "[Invoice 1042]" }).click()
        const sheet = page.getByRole("dialog", { name: "[Invoice 1042]" })
        await ready(sheet)
        const l = luminance(await sheet.evaluate((el) => getComputedStyle(el).backgroundColor))
        expect(theme === "dark" ? l < 0.25 : l > 0.85, `the sheet's surface is ${theme} (luminance ${l.toFixed(2)})`)
      },
    },
    {
      name: "headingLevel sets the title's level, and the sheet is named by it",
      example: "record",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("h3", { hasText: "[Invoice 1039]" }).count(), 1, "the title is an h3")
        expect.equal(await scope.getByRole("dialog", { name: "[Invoice 1039]" }).count(), 1, "named by its title")
      },
    },
  ],
}
