// NotificationCentre's one definition: its README, its preview board and its scripted checks all come from here.

const items = [
  { id: "n1", text: "[Sam Lee] asked you to approve [14] timesheets", time: "Today, 9:41 am", icon: "ClipboardCheck", unread: true, href: "#n1" },
  { id: "n2", text: "The assistant drafted the [June] pay run from the approved timesheets", time: "Today, 9:12 am", tone: "ai", unread: true },
  { id: "n3", text: "[Priya Nair] commented on [Invoice 1042]", time: "Yesterday, 4:05 pm", icon: "MessageSquare", unread: true },
  { id: "n4", text: "The export to [the bank] failed: [the bank] did not respond", time: "Mon 2 Nov, 11:20 am", tone: "danger" },
  { id: "n5", text: "[Alex Chen] approved your leave for [14 to 18 December]", time: "Mon 2 Nov, 9:03 am", tone: "success" },
]
const arrival = { id: "n6", text: "[Jordan Kaur] swapped her Saturday shift with [Sam Lee]", time: "Just now", icon: "Repeat", unread: true }
const allRead = items.map((item) => ({ ...item, unread: false }))

async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}
// An overlay is ready for keys once it has finished opening (see Popover's checks).
const ready = async (locator) => {
  await locator.waitFor()
  await locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
  await locator.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}
const status = (scope) => scope.locator('[data-slot="notification-status"]').first().evaluate((el) => el.textContent.replace(/\s+/g, " ").trim())
// A status is written a beat after the change, once React's effect has run, so a check waits for it.
const said = (scope, want) =>
  scope
    .locator('[data-slot="notification-status"]')
    .first()
    .evaluate(
      (el, text) =>
        new Promise((done) => {
          const end = Date.now() + 3000
          const tick = () => (el.textContent.replace(/\s+/g, " ").trim() === text || Date.now() > end ? done(el.textContent.replace(/\s+/g, " ").trim()) : requestAnimationFrame(tick))
          tick()
        }),
      want
    )
// The live panel opens in a portal, outside every example; the design pictures sit inside theirs.
const livePanel = (page) => page.locator('[role="dialog"]:not([data-example] *)')
const nameOf = (page) => page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.replace(/\s+/g, " ").trim() ?? null)

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export default {
  name: "NotificationCentre",
  group: "Feedback",
  job: "The events for the signed-in person, opened from the header or the rail.",
  status: "to build",
  props: [
    { name: "items", type: "{ id: string; text: string; time: string; icon?: IconName; tone?: \"neutral\" | \"success\" | \"warning\" | \"danger\" | \"info\" | \"ai\"; unread?: boolean; href?: string }[]", doc: "Newest first. Each names who did what, and the assistant's take the ai tone." },
    { name: "onRead", type: "(ids: string[]) => void", doc: "Called with the ids marked read: one as it is opened, every unread one from Mark all as read. Keep it in your data here." },
    { name: "onOpen", type: "(id: string) => void", doc: "Opens a notification that has no href, and closes the panel." },
    { name: "label", type: "string", default: '"Notifications"', doc: "The trigger's name and the panel's title." },
    { name: "open", type: "boolean", doc: "Design mode: shows the panel open under its trigger, as a still picture with no live layer." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "The panel title's level." },
    { name: "loading", type: "boolean", default: "false", doc: "Skeleton rows in the panel, said once as Loading notifications." },
    { name: "error", type: "ReactNode", doc: "The notifications could not load: name the system that failed. Items given stay, as the last good copy." },
    { name: "empty", type: "ReactNode", default: '"No notifications yet."', doc: "What the panel says when there is nothing in it." },
  ],
  notes: {
    Behaviour: [
      "A bell button opens it: a Popover on a wide screen, and a Sheet from the side on a phone, where the window is under 640px. Enter, Space or a press opens it; Escape closes it and focus goes back to the bell.",
      "The bell's name carries the unread count in words: Notifications, 3 unread. When the count changes, a polite status says so once: 1 new notification. 4 unread, then 3 unread as one is read, and No unread notifications.",
      "Each notification is one link or button, named by what happened and when, then unread while it is, so the name starts with what is on screen. Opening one marks it read. One with somewhere to go closes the panel as it goes; one with nowhere to go is only marked read, and focus stays on it.",
      "Mark all as read marks every unread one, and focus moves to the first notification, because the button goes.",
      "Shown open for a design, it is the Popover's still picture: no layer, so the board keeps its keys and tab order.",
    ],
    Layout: [
      "The popover is 384px, never wider than the screen less 16px, and its list scrolls past 384px. The sheet fills a phone inside its 8px inset, with Mark all as read at its foot.",
      "Each line is its icon tile, by kind and tone as a Timeline's, then what happened, then when. Unread lines are in the label weight with a dot in the highlight; read lines are quieter.",
    ],
    States: [
      "A count in the highlight, and zero shows nothing. Unread, read. Loading shows skeleton rows and says Loading notifications once. Empty says so. An error names the system and keeps the items given.",
      "Forced colours keep the count and the unread dots, as marked areas.",
    ],
    Copy: [
      "Each line names who did what, in the past tense or as a request: [Sam Lee] asked you to approve [14] timesheets. The assistant's lines name the assistant, so the ai tone is never the only clue.",
      "Times as people read them: Today, 9:41 am.",
    ],
    Rules: [
      "For events that concern the person signed in. Something that went wrong while they were there is an Alert or a Toast, not a notification.",
      "A highlight count is waiting on the reader: unread notifications are. Zero shows nothing.",
    ],
  },
  frame: { width: 960, height: 1720 },
  examples: [
    {
      id: "live",
      title: "From the header: three unread, and all read",
      markup: `<x-import component-from-global-scope="NS.NotificationCentre" items="{{notificationItems}}"></x-import>
<x-import component-from-global-scope="NS.Button" size="sm" icon="Plus" on-click="{{addNotification}}">Send a test notification</x-import>
<x-import component-from-global-scope="NS.NotificationCentre" label="Team notifications" items="{{allRead}}"></x-import>`,
      vals: { allRead },
    },
    {
      id: "open",
      title: "Open, for a design",
      markup: `<div style="display: flex; justify-content: flex-end; width: 400px; padding-bottom: 470px;"><x-import component-from-global-scope="NS.NotificationCentre" items="{{items}}" open="{{yes}}" heading-level="{{h3}}"></x-import></div>`,
      vals: { items, yes: true, h3: 3 },
    },
    {
      id: "states",
      title: "Loading, nothing yet, and could not load",
      layout: "block",
      markup: `<div style="display: flex; flex-direction: column; gap: 32px;">
<div style="display: flex; justify-content: flex-end; width: 400px; padding-bottom: 268px;"><x-import component-from-global-scope="NS.NotificationCentre" items="{{none}}" loading="{{yes}}" open="{{yes}}" heading-level="{{h3}}"></x-import></div>
<div style="display: flex; justify-content: flex-end; width: 400px; padding-bottom: 214px;"><x-import component-from-global-scope="NS.NotificationCentre" items="{{none}}" open="{{yes}}" heading-level="{{h3}}"></x-import></div>
<div style="display: flex; justify-content: flex-end; width: 400px; padding-bottom: 320px;"><x-import component-from-global-scope="NS.NotificationCentre" items="{{lastGood}}" error="{{centreError}}" open="{{yes}}" heading-level="{{h3}}"></x-import></div>
</div>`,
      vals: { none: [], lastGood: items.slice(3), centreError: "[The notification service] did not respond. Showing what arrived before 9:12 am." },
    },
  ],
  state: { arrived: 0 },
  logic: `notificationItems: [${JSON.stringify(arrival)}].slice(0, self.state.arrived).concat(${JSON.stringify(items)}),
  addNotification: () => self.setState({ arrived: 1 })`,
  checks: [
    {
      name: "The bell's name carries the unread count in words, the count takes the highlight, and zero shows nothing",
      example: "live",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const bell = scope.getByRole("button", { name: "Notifications, 3 unread" })
        expect.equal(await bell.count(), 1, "the count is in the name, in words")
        const count = bell.locator('[data-slot="notification-count"]')
        expect.equal((await count.textContent()).trim(), "3", "the figure shows")
        const [fill, text, highlight] = await count.evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.color = "var(--highlight)"
          el.append(probe)
          const out = [getComputedStyle(el).backgroundColor, getComputedStyle(el).color, getComputedStyle(probe).color]
          probe.remove()
          return out
        })
        expect.equal(fill, highlight, "the count is the highlight")
        expect.atLeast(Math.round(contrast(text, fill) * 100) / 100, 4.5, `${theme} count text on the highlight`)
        const quiet = scope.getByRole("button", { name: "Team notifications", exact: true })
        expect.equal(await quiet.count(), 1, "all read: the name has no count")
        expect.equal(await quiet.locator('[data-slot="notification-count"]').count(), 0, "and no figure shows")
      },
    },
    {
      name: "Enter opens the panel and focus moves in; Escape closes it and focus goes back to the bell",
      example: "live",
      async run({ page, scope, expect }) {
        const bell = scope.getByRole("button", { name: "Notifications, 3 unread" })
        expect(await tabTo(page, bell), "Tab reaches the bell")
        await page.keyboard.press("Enter")
        const panel = livePanel(page)
        await ready(panel)
        expect.equal(await panel.getAttribute("aria-label"), "Notifications", "the panel is a dialog named Notifications")
        expect.equal(await bell.getAttribute("aria-expanded"), "true", "the bell says it is open")
        expect.equal(await nameOf(page), "Mark all as read", "focus moved to the panel's first control")
        expect.equal(await panel.getByRole("list", { name: "Notifications" }).getByRole("listitem").count(), 5, "the notifications are a named list")
        await page.keyboard.press("Escape")
        await panel.waitFor({ state: "hidden" })
        expect(await bell.evaluate((el) => document.activeElement === el), "focus is back on the bell")
      },
    },
    {
      name: "Opening a notification marks it read: its unread words go, the count drops, and the change is said",
      example: "live",
      async run({ page, scope, expect }) {
        const bell = scope.getByRole("button", { name: "Notifications, 3 unread" })
        expect(await tabTo(page, bell), "Tab reaches the bell")
        await page.keyboard.press("Enter")
        const panel = livePanel(page)
        await ready(panel)
        const drafted = panel.getByRole("button", { name: "The assistant drafted the [June] pay run from the approved timesheets, Today, 9:12 am, unread" })
        expect.equal(await drafted.count(), 1, "an unread notification says when, then that it is unread")
        for (let i = 0; i < 6 && !(await drafted.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab")
        expect(await drafted.evaluate((el) => el === document.activeElement), "Tab reaches the notification")
        await page.keyboard.press("Enter")
        expect.equal(await said(scope, "2 unread."), "2 unread.", "the new count is said")
        expect.equal(await nameOf(page), "The assistant drafted the [June] pay run from the approved timesheets, Today, 9:12 am", "it is read, and focus stays on it")
        expect.equal(await scope.getByRole("button", { name: "Notifications, 2 unread" }).count(), 1, "the bell's count dropped")
        expect(await panel.isVisible(), "with nowhere to go, the panel stays open")
      },
    },
    {
      name: "Mark all as read clears the count, says so, and puts focus on the first notification",
      example: "live",
      async run({ page, scope, expect }) {
        const bell = scope.getByRole("button", { name: "Notifications, 3 unread" })
        expect(await tabTo(page, bell), "Tab reaches the bell")
        await page.keyboard.press("Enter")
        const panel = livePanel(page)
        await ready(panel)
        await page.keyboard.press("Enter")
        expect.equal(await said(scope, "No unread notifications."), "No unread notifications.", "the change is said")
        expect.equal(await scope.getByRole("button", { name: "Notifications", exact: true }).count(), 1, "the bell has no count")
        expect.equal(await panel.getByRole("button", { name: "Mark all as read" }).count(), 0, "the button has gone")
        expect.equal(await nameOf(page), "[Sam Lee] asked you to approve [14] timesheets, Today, 9:41 am", "focus is on the first notification, not the page")
        expect.equal(await panel.locator('[data-slot="notification"][data-unread]').count(), 0, "nothing is unread")
      },
    },
    {
      name: "A notification that arrives is said politely, once, and the count goes up",
      example: "live",
      async run({ scope, expect }) {
        expect.equal(await status(scope), "", "nothing is said on load")
        await scope.getByRole("button", { name: "Send a test notification" }).click()
        expect.equal(await said(scope, "1 new notification. 4 unread."), "1 new notification. 4 unread.", "the arrival is said")
        expect.equal(await scope.getByRole("button", { name: "Notifications, 4 unread" }).count(), 1, "the bell's count went up")
        expect.equal(await scope.locator('[data-slot="notification-status"]').first().getAttribute("role"), "status", "a polite status")
      },
    },
    {
      name: "On a phone it opens as a sheet that fills the width, and Escape gives focus back to the bell",
      example: "live",
      touch: true,
      viewport: { width: 390, height: 844 },
      async run({ page, scope, expect }) {
        const bell = scope.getByRole("button", { name: "Notifications, 3 unread" })
        expect.atLeast(Math.round((await bell.boundingBox()).height), 44, "the bell is 44px on touch")
        await bell.click()
        const sheet = livePanel(page)
        await ready(sheet)
        expect.equal(await sheet.getAttribute("data-slot"), "sheet-content", "it is a sheet")
        expect.equal(await sheet.getByRole("heading", { name: "Notifications" }).count(), 1, "titled Notifications")
        const box = await sheet.boundingBox()
        expect(Math.abs(box.x - 8) <= 1 && Math.abs(box.width - (390 - 16)) <= 1, `a sheet inside the 8px inset (left ${box.x}, width ${box.width})`)
        expect.equal(await sheet.getByRole("button", { name: "Mark all as read" }).count(), 1, "Mark all as read sits at its foot")
        const rows = await sheet.locator('[data-slot="notification-action"]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
        expect.atLeast(Math.round(Math.min(...rows)), 44, "every notification is 44px at least")
        await page.keyboard.press("Escape")
        await sheet.waitFor({ state: "hidden" })
        expect(await bell.evaluate((el) => document.activeElement === el), "focus is back on the bell")
      },
    },
    {
      name: "Forced colours keep the count and the unread dots as marked areas",
      example: "open",
      forcedColors: true,
      async run({ scope, expect }) {
        const count = await scope.locator('[data-slot="notification-count"]').evaluate((el) => [getComputedStyle(el).forcedColorAdjust, getComputedStyle(el).backgroundColor])
        expect.equal(count[0], "none", "the count keeps its own colours")
        expect(count[1] !== "rgba(0, 0, 0, 0)", `the count is filled (${count[1]})`)
        const dots = await scope.locator('[data-unread] [data-slot="notification-dot"]').evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor))
        expect.equal(dots.length, 3, "three unread dots")
        expect(dots.every((c) => c !== "rgba(0, 0, 0, 0)"), "each dot is filled")
      },
    },
    {
      name: "Shown open for a design, it takes no focus, no key and no tab stop",
      example: "open",
      async run({ page, scope, expect }) {
        expect(await scope.getByRole("dialog", { name: "Notifications" }).isVisible(), "the panel shows without anyone pressing")
        expect(await page.evaluate(() => document.activeElement === document.body), "nothing took focus")
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards on the page")
        await page.evaluate(() => {
          window.__escapes = 0
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented) window.__escapes++ })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escapes), 1, "Escape reaches the page past the picture")
      },
    },
    {
      name: "Line text holds 4.5:1 on the panel, in both themes",
      example: "open",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const panel = scope.locator('[data-slot="popover-content"]')
        const ground = await panel.evaluate((el) => getComputedStyle(el).backgroundColor)
        for (const slot of ["notification-text", "notification-time"]) {
          for (const colour of await panel.locator(`[data-slot="${slot}"]`).evaluateAll((els) => els.map((el) => getComputedStyle(el).color))) {
            expect.atLeast(Math.round(contrast(colour, ground) * 100) / 100, 4.5, `${theme} ${slot}`)
          }
        }
      },
    },
    {
      name: "Loading says so once, empty says so, and an error names the system and keeps the last good items",
      example: "states",
      async run({ scope, expect }) {
        const panels = scope.locator('[data-slot="popover-content"]')
        expect.equal((await panels.nth(0).getByRole("status").textContent()).trim(), "Loading notifications", "loading is said")
        expect.equal((await panels.nth(1).locator('[data-slot="empty-title"]').textContent()).trim(), "No notifications yet.", "empty says so")
        expect((await panels.nth(2).locator('[data-slot="notification-error"]').textContent()).includes("[The notification service] did not respond"), "the error names the system")
        expect.equal(await panels.nth(2).locator('[data-slot="notification"]').count(), 2, "the last good items stay")
      },
    },
  ],
}
