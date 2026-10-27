// Alert's one definition: its README, its preview board and its scripted checks all come from here.

// Contrast from computed colours, so a check can hold each tone to its ratio in both themes.
const channels = (css) => {
  const rgb = /rgba?\(([^)]+)\)/.exec(css)
  if (rgb) return rgb[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number)
  const srgb = /color\(srgb ([^)]+)\)/.exec(css)
  if (srgb) return srgb[1].split(/\s+/).slice(0, 3).map((v) => Number(v) * 255)
  throw new Error(`cannot read the colour ${css}`)
}
const luminance = (css) => {
  const [r, g, b] = channels(css).map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const style = (locator, prop) => locator.evaluate((el, p) => getComputedStyle(el)[p], prop)

export default {
  name: "Alert",
  group: "Feedback",
  job: "A message inside a page or card: what happened, what it means, what to do.",
  status: "proven",
  // Banner, EmptyState and LoadingState take actions the same way, so the type is declared once, here.
  types: [
    'type FeedbackAction = { label: string; variant?: "primary" | "secondary" | "ghost" | "brand" | "danger" | "danger-solid" | "link"; icon?: IconName; href?: string; onClick?: () => void }',
  ],
  props: [
    { name: "tone", type: '"neutral" | "info" | "success" | "warning" | "danger" | "ai"', default: '"neutral"', doc: "What kind of message it is. Each tone has its own icon, so colour is never the only signal. See Tones." },
    { name: "title", type: "ReactNode", doc: "What happened, in a few words." },
    { name: "children", type: "ReactNode", doc: "What it means and what to do." },
    { name: "icon", type: "IconName", doc: "Replaces the tone's icon with a more specific one: Lock for read only, WifiOff for offline." },
    { name: "actions", type: "ReactNode | FeedbackAction[]", doc: "Buttons, or the same as data ({ label, variant, icon, href, onClick }) so a board can pass them. Under the text below 640px of the alert's width, beside it from 640px." },
    { name: "onDismiss", type: "() => void", doc: "Shows a dismiss button. Focus then moves on to the next control, never the page body." },
    { name: "dismissLabel", type: "string", default: '"Dismiss: [title]"', doc: "The dismiss button's accessible name." },
    { name: "role", type: '"alert" | "status"', default: "alert for danger and warning, status for the rest", doc: "Pass status for a problem already showing when the page loads, so a screen reader does not interrupt with it on every visit." },
  ],
  tables: [
    {
      title: "Tones",
      head: ["Tone", "Icon", "Use"],
      rows: [
        ["neutral", "Info", "Facts with no status: read only, a tip, offline"],
        ["info", "Info", "Something to know before acting"],
        ["success", "CircleCheck", "A finished change worth keeping on screen"],
        ["warning", "TriangleAlert", "Heads up: due soon, stale, near a limit"],
        ["danger", "CircleAlert", "Something is wrong: a source down, a failed sync"],
        ["ai", "Sparkles", "What the assistant made or suggested"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      'danger and warning are role="alert", read out at once. Every other tone is role="status", read when the reader is free.',
      'A problem already showing when the page loads takes role="status", so it does not interrupt on every visit.',
      'The dismiss button is named "Dismiss: [title]". Pressing it moves focus to the next control, then the page title, then main: never the page body.',
      "The icon is decoration: the title and body carry the meaning.",
    ],
    Layout: [
      "Measures its own width. Under 640px the actions sit under the text, lined up with it. From 640px they sit beside it, centred on the text.",
      "Actions and dismiss are 32px tall, 40px on touch.",
    ],
    States: [
      "Six tones, each on its own tint and edge. With or without a title, actions and dismiss.",
    ],
    Copy: [
      'State, then consequence, then the fix: "[Source] is not responding. Invoices below are from [9:42 am]." with Try again.',
      "Name the system that failed and what still works. Never a vague apology in place of the cause, and never blame the person.",
    ],
    Rules: [
      "Use the lightest feedback that works: an inline Field message first, then an Alert, a Banner, a Toast, and a Dialog last.",
      "A partial outage leaves the rest of the screen working: say which source is down and when it was last checked.",
      "Actions are Buttons (Try again). A link only when it goes somewhere.",
      "Errors that need action stay on screen as an Alert, never in a Toast.",
    ],
    Review: [
      "Focus fell to the page body after an action removed what had focus (rounds 3 and 4). Dismiss moves it on.",
    ],
    Open: [
      "A lone icon wants a tooltip as well as a name, which IconButton supplies. The dismiss button is named but has no tooltip until it uses IconButton.",
    ],
  },
  frame: { width: 960, height: 1090 },
  examples: [
    {
      id: "tones",
      title: "Tones",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Alert" icon="Lock" title="Read only">You can view this pay run but not change it. Ask [Sam Lee] for edit access.</x-import>
<x-import component-from-global-scope="NS.Alert" tone="info" title="Pay runs lock at [5 pm] on Thursdays">Changes made after that go into next week's run.</x-import>
<x-import component-from-global-scope="NS.Alert" tone="success" title="[Accounting system] connected">Invoices sync every [15] minutes. The last sync was at [9:40 am].</x-import>
<x-import component-from-global-scope="NS.Alert" tone="warning" title="Your [accounting system] connection expires in [3] days" actions="{{reconnect}}">After that, invoices stop syncing.</x-import>
<x-import component-from-global-scope="NS.Alert" tone="danger" title="[Source] is not responding" actions="{{retry}}">Invoices below are from [9:42 am].</x-import>
<x-import component-from-global-scope="NS.Alert" tone="ai" title="The assistant drafted [3] replies">Read them before they go. Nothing is sent until you press Send.</x-import>`,
      vals: { reconnect: [{ label: "Reconnect", icon: "RefreshCw" }], retry: [{ label: "Try again", icon: "RotateCcw" }] },
    },
    {
      id: "layout",
      title: "Actions under the text below 640px, beside it from 640px",
      layout: "stack",
      markup: `<div style="width: 360px; max-width: 100%;">
<x-import component-from-global-scope="NS.Alert" tone="danger" title="[Source] is not responding" actions="{{retryBoth}}">Invoices below are from [9:42 am].</x-import>
</div>
<x-import component-from-global-scope="NS.Alert" tone="danger" title="[Source] is not responding" actions="{{retryBoth}}">Invoices below are from [9:42 am].</x-import>`,
      vals: { retryBoth: [{ label: "Try again", icon: "RotateCcw" }, { label: "View status", variant: "ghost" }] },
    },
    {
      id: "dismissible",
      title: "Dismissible",
      layout: "stack",
      markup: `<sc-if value="{{approvedShown}}"><x-import component-from-global-scope="NS.Alert" tone="success" title="Pay run approved" on-dismiss="{{dismissApproved}}">[12] payslips go out at [5 pm] today.</x-import></sc-if>
<x-import component-from-global-scope="NS.Button" icon="FileText">View payslips</x-import>`,
    },
    {
      id: "on-load",
      title: "Already showing when the page loads",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Alert" tone="warning" role="status" title="[Payroll system] is running slowly">Pay runs may take a few minutes to open. Everything else works as usual.</x-import>`,
    },
  ],
  state: { approvedDismissed: false },
  logic: `approvedShown: !self.state.approvedDismissed,
    dismissApproved: () => self.setState({ approvedDismissed: true })`,
  checks: [
    {
      name: "Danger and warning interrupt; every other tone is a polite status",
      example: "tones",
      async run({ scope, expect }) {
        const alerts = await scope.locator("[data-tone]").all()
        expect.equal(alerts.length, 6, "six tones")
        for (const alert of alerts) {
          const tone = await alert.getAttribute("data-tone")
          expect.equal(await alert.getAttribute("role"), tone === "danger" || tone === "warning" ? "alert" : "status", `the ${tone} alert's role`)
        }
      },
    },
    {
      name: "A problem already showing when the page loads is a polite status",
      example: "on-load",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-tone="warning"]').getAttribute("role"), "status", "the warning on arrival does not interrupt")
      },
    },
    {
      name: "Every tone carries its own icon and words, never colour alone",
      example: "tones",
      async run({ scope, expect }) {
        const icons = {}
        for (const alert of await scope.locator("[data-tone]").all()) {
          const tone = await alert.getAttribute("data-tone")
          icons[tone] = await alert.locator('[data-slot="alert-grid"] > svg').getAttribute("data-icon")
          expect((await alert.locator('[data-slot="alert-title"]').innerText()).trim().length > 0, `the ${tone} alert has words`)
        }
        const statuses = ["info", "success", "warning", "danger", "ai"].map((t) => icons[t])
        expect.equal(new Set(statuses).size, 5, "each status tone has an icon of its own")
      },
    },
    {
      name: "Actions sit under the text below 640px of the alert's own width, beside it from 640px",
      example: "layout",
      async run({ scope, expect }) {
        const [narrow, wide] = await scope.locator('[data-slot="alert"]').all()
        const box = (alert, slot) => alert.locator(`[data-slot="${slot}"]`).boundingBox()
        const nText = await box(narrow, "alert-description")
        const nActions = await box(narrow, "alert-action")
        expect.atLeast(nActions.y, nText.y + nText.height, "narrow: the actions start below the text")
        expect.equal(Math.round(nActions.x), Math.round(nText.x), "narrow: the actions line up with the text")
        const wText = await box(wide, "alert-description")
        const wActions = await box(wide, "alert-action")
        expect.atLeast(wActions.x, wText.x + wText.width, "wide: the actions sit beside the text")
        expect(wActions.y < wText.y + wText.height, "wide: the actions share the text's rows")
      },
    },
    {
      name: "Dismiss is named for the alert, and focus moves on to the next control, never the page body",
      example: "dismissible",
      async run({ page, scope, expect }) {
        const dismiss = scope.getByRole("button", { name: "Dismiss: Pay run approved" })
        await dismiss.focus()
        await page.keyboard.press("Enter")
        expect.equal(await scope.locator('[data-slot="alert"]').count(), 0, "the alert is gone")
        const focused = await page.evaluate(() => document.activeElement?.textContent?.trim())
        expect.equal(focused, "View payslips", "focus moved on to the next control")
      },
    },
    {
      name: "Each tone's words hold 4.5:1 on its tint and the icon 3:1, in both themes",
      example: "tones",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const alert of await scope.locator("[data-tone]").all()) {
          const tone = await alert.getAttribute("data-tone")
          const ground = await style(alert, "backgroundColor")
          expect.atLeast(contrast(await style(alert.locator('[data-slot="alert-title"]'), "color"), ground), 4.5, `${theme} ${tone} title`)
          expect.atLeast(contrast(await style(alert.locator('[data-slot="alert-description"]'), "color"), ground), 4.5, `${theme} ${tone} body`)
          expect.atLeast(contrast(await style(alert.locator('[data-slot="alert-grid"] > svg'), "color"), ground), 3, `${theme} ${tone} icon`)
        }
      },
    },
    {
      name: "Actions and dismiss grow to 40px on touch",
      example: "dismissible",
      touch: true,
      async run({ page, expect }) {
        const buttons = await page.locator('[data-example="tones"] [data-slot="alert-action"] button, [data-example="dismissible"] [data-slot="alert-dismiss"]').all()
        expect.atLeast(buttons.length, 3, "buttons found")
        for (const b of buttons) expect.atLeast((await b.boundingBox()).height, 40, `${(await b.getAttribute("aria-label")) ?? (await b.innerText())} on touch`)
      },
    },
    {
      name: "Forced colours keep each alert's edge, and no button draws an outline at rest",
      example: "tones",
      forcedColors: true,
      async run({ scope, expect }) {
        for (const alert of await scope.locator("[data-tone]").all()) {
          expect.equal(await style(alert, "borderTopStyle"), "solid", "the alert keeps its edge")
          expect.atLeast(parseFloat(await style(alert, "borderTopWidth")), 1, "edge width")
        }
        for (const b of await scope.getByRole("button").all()) expect.equal(await style(b, "outlineStyle"), "none", "no outline at rest")
      },
    },
  ],
}
