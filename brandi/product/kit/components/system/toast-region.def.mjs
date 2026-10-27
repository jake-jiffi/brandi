// ToastRegion's one definition: its README, its preview board and its scripted checks all come from here.

// Installed before the board runs. Records every change made inside a live region after that region was on
// the page: what a screen reader would announce. Content a region arrives with is not recorded.
function recordLiveRegions() {
  window.__liveChanges = []
  const live = '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"]'
  new MutationObserver((records) => {
    // One batch is one change to announce, however many nodes React touched to make it.
    const changed = new Set()
    for (const r of records) {
      const node = r.target.nodeType === 1 ? r.target : r.target.parentElement
      const region = node && node.closest(live)
      if (region) changed.add(region)
    }
    for (const region of changed) window.__liveChanges.push({ slot: region.getAttribute("data-slot"), text: (region.textContent || "").trim() })
  }).observe(document, { subtree: true, childList: true, characterData: true })
}

// Stops the page's clock, so a check can move time on exactly.
async function stopClock(page) {
  await page.clock.install()
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 10)
}
// Moves the stopped clock on, then gives React a real moment to render what the timers changed.
async function wait(page, ms) {
  await page.clock.runFor(ms)
  await page.waitForTimeout(120)
}
// Gives React a moment to drop what went, then says whether it did: a timer firing late shows here, not as a flake.
async function goneBy(locator, message, expect) {
  try {
    await locator.first().waitFor({ state: "detached", timeout: 3000 })
  } catch {
    // reported by the assertion below
  }
  expect.equal(await locator.count(), 0, message)
}
// Waits for a toast's entrance to finish, so a measurement is of where it rests, not where it slides from.
const settled = (toast) => toast.evaluate((el) => Promise.all(el.closest("li").getAnimations().map((a) => a.finished)))
const ids = (scope) => scope.locator("[data-toast-id]").evaluateAll((all) => all.map((li) => li.getAttribute("data-toast-id")))
const focusedText = (page) => page.evaluate(() => document.activeElement?.textContent?.trim())
// Shows a toast through the bundle's namespace, whatever the system named it. Undo counts its presses.
const showInPage = (page, message, withUndo) =>
  page.evaluate(
    ([text, undo]) => {
      const ns = Object.keys(window)
        .map((k) => {
          try {
            return window[k]
          } catch {
            return null
          }
        })
        .find((v) => v && typeof v === "object" && v.ToastRegion && typeof v.ToastRegion.show === "function")
      window.__undone = 0
      return ns.ToastRegion.show(text, undo ? { tone: "success", action: "Undo", onAction: () => (window.__undone += 1) } : {})
    },
    [message, withUndo]
  )
// Clears the queue through the namespace, as product code calling ToastRegion.dismiss() would.
const dismissAllInPage = (page) =>
  page.evaluate(() => {
    const ns = Object.keys(window)
      .map((k) => {
        try {
          return window[k]
        } catch {
          return null
        }
      })
      .find((v) => v && typeof v === "object" && v.ToastRegion && typeof v.ToastRegion.dismiss === "function")
    ns.ToastRegion.dismiss()
  })

export default {
  name: "ToastRegion",
  group: "Feedback",
  job: "The queue that shows, times and pauses toasts.",
  status: "to build",
  statics: [
    { name: "show", type: "(message: ReactNode, options?: Omit<ToastItem, \"id\" | \"message\"> & { id?: string }) => string", doc: "Adds a toast to the queue from anywhere and returns its id. The same id replaces a queued toast." },
    { name: "dismiss", type: "(id?: string) => void", doc: "Removes one toast, or every toast when no id is given." },
  ],
  types: [
    'type ToastItem = { id: string; message: ReactNode; tone?: "neutral" | "success" | "warning" | "danger"; icon?: IconName; action?: string; onAction?: () => void }',
  ],
  props: [
    { name: "items", type: "ToastItem[]", doc: "The toasts as data ({ id, message, tone, icon, action, onAction }), for a board or a product that keeps them in its own state. Without it the region shows the queue ToastRegion.show() fills." },
    { name: "onDismiss", type: "(id: string) => void", doc: "Called when a toast's time is up, its action ran or Escape closed it. With items, remove it here." },
    { name: "onAction", type: "(id: string) => void", doc: "Called when a toast's action is pressed, after the item's own onAction." },
    { name: "inline", type: "boolean", default: "false", doc: "Renders in place instead of fixed to the window, for a board." },
    { name: "label", type: "string", default: '"Notifications"', doc: "The region's accessible name." },
  ],
  tables: [
    {
      title: "Showing a toast",
      head: ["Call", "What it does"],
      rows: [
        ['ToastRegion.show("[3] invoices sent.", { tone: "success", action: "Undo", onAction })', "Adds a toast to the queue from anywhere and returns its id"],
        ["ToastRegion.show(message, { id })", "Replaces the queued toast with that id"],
        ["ToastRegion.dismiss(id)", "Removes one toast. With no id, removes them all"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "A region named Notifications holds a polite live list. Each new toast is read once; toasts already there when it loads are not read.",
      "Every clock stops while the pointer is over the toasts, focus is inside them or the page is hidden, and starts again from where it stopped once none of those holds.",
      "Alt T moves focus to the newest toast's action, or to the toast when it has none. The shortcut belongs to the region fixed to the window; a board's inline regions leave it alone. Tab reaches the toasts in reading order too, and Escape closes the toast that has focus.",
      "When the toast holding focus goes (its action, Escape or its time), focus returns to where it came from, then the page title, then main: never the page body.",
    ],
    Layout: [
      "Fixed to the window at the bottom centre, measuring the window as its container.",
      "It sits 24px above the bottom edge, and 88px above it below 640px to clear the phone action bar. The safe area is added to both.",
      "Three at once, oldest at the top, newest nearest the bottom edge. Each toast is as wide as its sentence and never wider than the screen.",
    ],
    States: [
      "Empty, which still renders the live list so the first toast is read. One to three toasts. A queue waiting its turn. inline, in place on a board.",
    ],
    Copy: ["A toast is read aloud on its own, so its sentence must make sense without the screen."],
    Rules: [
      "Mount one region near the root, so toasts outlive navigation.",
      "5 seconds, or 8 when a toast carries an action such as Undo.",
      "Errors that need action are Alerts. The region only confirms what has been done.",
      "A toast that goes on its own is a time limit (WCAG 2.2.1). The clocks stop for hover, focus and a hidden page, and Undo is never the only way back: the action it reverses can also be undone where the record lives.",
    ],
    Open: [
      "Sonner, the starter's toast library, pauses on hover but not on focus, so the region keeps its own clocks. The sonner primitive is left unpatched and unused.",
      "Swipe to dismiss is not built. Toasts go on their own, and Escape closes one from the keyboard.",
    ],
  },
  frame: { width: 960, height: 560 },
  examples: [
    {
      id: "queue",
      title: "Three at once, oldest first: the fourth waits its turn",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.ToastRegion" inline="{{yes}}" items="{{queued}}" label="Notifications (queued)"></x-import>`,
      vals: {
        yes: true,
        queued: [
          { id: "queued-1", message: "Draft saved." },
          { id: "queued-2", message: "[3] invoices sent.", tone: "success", action: "Undo" },
          { id: "queued-3", message: "[Invoice 1042] archived.", action: "Undo" },
          { id: "queued-4", message: "Price list saved." },
        ],
      },
    },
    {
      id: "live",
      title: "In use: send, save and undo",
      layout: "stack",
      markup: `<div style="display: flex; flex-wrap: wrap; gap: 8px;">
<x-import component-from-global-scope="NS.Button" variant="primary" icon="Send" on-click="{{sendInvoices}}">Send invoices</x-import>
<x-import component-from-global-scope="NS.Button" icon="Save" on-click="{{saveDraft}}">Save draft</x-import>
</div>
<x-import component-from-global-scope="NS.ToastRegion" inline="{{yes}}" items="{{liveToasts}}" on-dismiss="{{dropToast}}" on-action="{{undoToast}}" label="Notifications (live)" style="display: block; width: 100%; min-height: 56px;"></x-import>`,
    },
    {
      id: "docked",
      title: "In the product: fixed to the window, at the bottom centre",
      layout: "stack",
      markup: `<p style="margin: 0; max-width: 64ch; color: var(--text-muted);">Mounted once near the root, the region shows what ToastRegion.show() adds from anywhere: at the bottom centre of the window, clear of the phone action bar.</p>
<x-import component-from-global-scope="NS.ToastRegion"></x-import>`,
    },
  ],
  state: { liveToasts: [], made: 0 },
  logic: `liveToasts: self.state.liveToasts,
    sendInvoices: () => self.setState((s) => ({ made: s.made + 1, liveToasts: s.liveToasts.concat({ id: "sent-" + (s.made + 1), message: "[3] invoices sent.", tone: "success", action: "Undo" }) })),
    saveDraft: () => self.setState((s) => ({ made: s.made + 1, liveToasts: s.liveToasts.concat({ id: "saved-" + (s.made + 1), message: "Draft saved." }) })),
    dropToast: (id) => self.setState((s) => ({ liveToasts: s.liveToasts.filter((t) => t.id !== id) })),
    undoToast: () => self.setState((s) => ({ made: s.made + 1, liveToasts: s.liveToasts.concat({ id: "undone-" + (s.made + 1), message: "[3] invoices moved back to drafts." }) }))`,
  checks: [
    {
      name: "A new toast is announced politely, and nothing speaks on load",
      example: "live",
      async run({ page, scope, expect }) {
        await page.addInitScript(recordLiveRegions)
        await page.reload()
        await page.waitForSelector("html[data-dc-ready]")
        expect.equal(await scope.locator('[data-slot="toast-list"]').getAttribute("aria-live"), "polite", "the list is a polite live region")
        expect.equal((await page.evaluate(() => window.__liveChanges)).length, 0, "nothing spoke on load")
        await scope.getByRole("button", { name: "Save draft" }).click()
        await scope.getByText("Draft saved.").waitFor()
        const spoken = await page.evaluate(() => window.__liveChanges)
        expect(spoken.some((c) => c.slot === "toast-list" && c.text.includes("Draft saved.")), "the new toast was announced")
        expect.equal(await scope.locator('[data-slot="toast"][role]').count(), 0, "a toast in the region is not a second live region")
      },
    },
    {
      name: "A toast goes after 5 seconds, or 8 with Undo",
      example: "live",
      async run({ page, scope, expect }) {
        await stopClock(page)
        const toasts = scope.locator('[data-slot="toast"]')
        await scope.getByRole("button", { name: "Save draft" }).click()
        await toasts.first().waitFor()
        await wait(page, 4900)
        expect.equal(await toasts.count(), 1, "still there at 4.9 seconds")
        await wait(page, 200)
        await goneBy(toasts, "gone at 5.1 seconds", expect)
        await scope.getByRole("button", { name: "Send invoices" }).click()
        await toasts.first().waitFor()
        await wait(page, 7900)
        expect.equal(await toasts.count(), 1, "with Undo, still there at 7.9 seconds")
        await wait(page, 200)
        await goneBy(toasts, "with Undo, gone at 8.1 seconds", expect)
      },
    },
    {
      name: "Hovering pauses the toasts, and leaving starts their clocks from where they stopped",
      example: "live",
      async run({ page, scope, expect }) {
        await stopClock(page)
        const toasts = scope.locator('[data-slot="toast"]')
        await scope.getByRole("button", { name: "Save draft" }).click()
        await toasts.first().waitFor()
        await wait(page, 1000)
        await toasts.first().hover()
        await wait(page, 10000)
        expect.equal(await toasts.count(), 1, "still there after 10 seconds under the pointer")
        await page.mouse.move(2, 2)
        await wait(page, 3900)
        expect.equal(await toasts.count(), 1, "the clock restarted with 4 seconds left")
        await wait(page, 200)
        await goneBy(toasts, "gone once its time ran out", expect)
      },
    },
    {
      name: "Focus pauses them too, and Tab reaches Undo in reading order",
      example: "live",
      async run({ page, scope, expect }) {
        await stopClock(page)
        const toasts = scope.locator('[data-slot="toast"]')
        await scope.getByRole("button", { name: "Send invoices" }).click()
        await toasts.first().waitFor()
        await wait(page, 1000)
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        expect.equal(await focusedText(page), "Undo", "Tab reaches Undo")
        await wait(page, 20000)
        expect.equal(await toasts.count(), 1, "still there after 20 seconds with focus inside")
        await scope.getByRole("button", { name: "Save draft" }).focus()
        await wait(page, 6900)
        expect.equal(await toasts.count(), 1, "the clock restarted with 7 seconds left")
        await wait(page, 200)
        await goneBy(toasts, "gone once its time ran out", expect)
      },
    },
    {
      name: "A hidden page pauses the toasts too, so nobody returns to find Undo gone",
      example: "live",
      async run({ page, scope, expect }) {
        await stopClock(page)
        const toasts = scope.locator('[data-slot="toast"]')
        await scope.getByRole("button", { name: "Send invoices" }).click()
        await toasts.first().waitFor()
        await page.mouse.move(2, 2)
        await wait(page, 1000)
        const visibility = (state) =>
          page.evaluate((s) => {
            Object.defineProperty(document, "visibilityState", { configurable: true, get: () => s })
            document.dispatchEvent(new Event("visibilitychange"))
          }, state)
        await visibility("hidden")
        await wait(page, 60000)
        expect.equal(await toasts.count(), 1, "still there after a minute in another tab")
        await visibility("visible")
        await wait(page, 6900)
        expect.equal(await toasts.count(), 1, "the clock restarted with 7 seconds left")
        await wait(page, 200)
        await goneBy(toasts, "gone once its time ran out", expect)
      },
    },
    {
      name: "Undo by keyboard in a board's region: Enter undoes, and focus goes back to where it came from",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Send invoices" }).click()
        await scope.getByText("[3] invoices sent.").waitFor()
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        await page.keyboard.press("Enter")
        await scope.getByText("[3] invoices moved back to drafts.").waitFor()
        expect.equal(await scope.getByText("[3] invoices sent.").count(), 0, "the undone toast is gone")
        expect.equal(await focusedText(page), "Save draft", "focus is back on the control it came from")
      },
    },
    {
      name: "Alt T reaches Undo from anywhere on the page; Enter undoes and focus goes back where it was",
      example: "docked",
      async run({ page, scope, expect }) {
        await page.locator('[data-example="live"]').getByRole("button", { name: "Save draft" }).focus()
        await showInPage(page, "[3] invoices sent.", true)
        await scope.getByText("[3] invoices sent.").waitFor()
        await page.keyboard.press("Alt+KeyT")
        expect.equal(await focusedText(page), "Undo", "Alt T focuses Undo")
        await page.keyboard.press("Enter")
        expect.equal(await page.evaluate(() => window.__undone), 1, "Undo ran once")
        expect.equal(await scope.locator('[data-slot="toast"]').count(), 0, "the toast is gone")
        expect.equal(await focusedText(page), "Save draft", "focus is back where it was")
      },
    },
    {
      name: "Escape closes the toast that has focus and puts focus back",
      example: "docked",
      async run({ page, scope, expect }) {
        await page.locator('[data-example="live"]').getByRole("button", { name: "Send invoices" }).focus()
        await showInPage(page, "Draft saved.", false)
        await scope.getByText("Draft saved.").waitFor()
        await page.keyboard.press("Alt+KeyT")
        expect(await page.evaluate(() => document.activeElement?.hasAttribute("data-toast-id")), "a toast without an action takes focus itself")
        await page.keyboard.press("Escape")
        expect.equal(await scope.getByText("Draft saved.").count(), 0, "the toast is gone")
        expect.equal(await focusedText(page), "Send invoices", "focus is back where it was")
      },
    },
    {
      name: "A toast dismissed from outside while it holds focus still sends focus back, never to the page body",
      example: "docked",
      async run({ page, scope, expect }) {
        await page.locator('[data-example="live"]').getByRole("button", { name: "Save draft" }).focus()
        await showInPage(page, "[3] invoices sent.", true)
        await scope.getByText("[3] invoices sent.").waitFor()
        await page.keyboard.press("Alt+KeyT")
        expect.equal(await focusedText(page), "Undo", "Alt T focuses Undo")
        await dismissAllInPage(page)
        await goneBy(scope.locator('[data-slot="toast"]'), "the toast is gone", expect)
        await page.waitForTimeout(50)
        expect.equal(await focusedText(page), "Save draft", "focus went back where it came from")
      },
    },
    {
      name: "Three show at once and the rest wait their turn, oldest first",
      example: "live",
      async run({ page, scope, expect }) {
        await stopClock(page)
        const save = scope.getByRole("button", { name: "Save draft" })
        for (let i = 0; i < 4; i++) await save.click()
        await page.waitForTimeout(120)
        expect.equal((await ids(scope)).join(","), "saved-1,saved-2,saved-3", "the first three show")
        await wait(page, 5100)
        await goneBy(scope.locator('[data-toast-id="saved-1"]'), "the first has gone", expect)
        await scope.locator('[data-toast-id="saved-4"]').waitFor({ timeout: 3000 })
        expect.equal((await ids(scope)).join(","), "saved-4", "the fourth shows when the others have gone")
      },
    },
    {
      name: "Queued toasts keep Undo at 44px on touch",
      example: "queue",
      touch: true,
      async run({ scope, expect }) {
        for (const undo of await scope.getByRole("button", { name: "Undo" }).all()) {
          const box = await undo.boundingBox()
          expect.atLeast(box.height, 44, "Undo height on touch")
          expect.atLeast(box.width, 44, "Undo width on touch")
        }
      },
    },
    {
      name: "Mounted in the product, a shown toast sits at the bottom centre, clear of the phone action bar",
      example: "docked",
      viewport: { width: 390, height: 844 },
      async run({ page, scope, expect }) {
        await showInPage(page, "Draft saved.", false)
        const toast = scope.locator('[data-slot="toast"]')
        await toast.waitFor()
        await settled(toast)
        const box = await toast.boundingBox()
        expect.atLeast(844 - (box.y + box.height), 88, "space under it on a phone")
        expect(Math.abs(box.x + box.width / 2 - 195) <= 1, "centred in the window")
      },
    },
    {
      name: "On a wider window it sits 24px above the bottom edge",
      example: "docked",
      async run({ page, scope, expect }) {
        await showInPage(page, "[3] invoices sent.", true)
        const toast = scope.locator('[data-slot="toast"]')
        await toast.waitFor()
        await settled(toast)
        const box = await toast.boundingBox()
        const gap = page.viewportSize().height - (box.y + box.height)
        expect(gap >= 24 && gap < 40, `space under it was ${gap}px`)
      },
    },
  ],
}
