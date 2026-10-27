// Toast's one definition: its README, its preview board and its scripted checks all come from here.

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
  name: "Toast",
  group: "Feedback",
  job: "A brief confirmation after an action, on the inverse surface, with Undo when the action can be reversed.",
  status: "proven",
  props: [
    { name: "tone", type: '"neutral" | "success" | "warning" | "danger"', default: '"neutral"', doc: "Shown by the icon: CircleCheck, TriangleAlert or CircleAlert. Neutral has none. The surface stays the same." },
    { name: "children", type: "ReactNode", doc: 'One sentence, past tense, with a full stop: "[3] invoices sent."' },
    { name: "icon", type: "IconName", doc: "Replaces the tone's icon." },
    { name: "action", type: "string", doc: 'The action\'s label when the action can be reversed: "Undo".' },
    { name: "onAction", type: "() => void", doc: "Runs the action." },
    { name: "onClose", type: "() => void", doc: "Shows a close button. Without it there is none." },
    { name: "closeLabel", type: "string", default: '"Dismiss"', doc: "The close button's accessible name." },
    { name: "floating", type: "boolean", default: "false", doc: "Fixed at the bottom centre of the window, never wider than the screen, as a polite status. ToastRegion places its own toasts." },
  ],
  notes: {
    Behaviour: [
      "Shown through ToastRegion, which times it, pauses it and announces it. A floating toast on its own is a polite status.",
      "Undo and close are real buttons. Their focus outline is drawn in the toast's own text colour, because the system's focus colour vanishes on the inverse surface.",
    ],
    Layout: [
      "As wide as its sentence, up to 576px, then it wraps. Never wider than the screen.",
      "Undo and close are 32px, 44px on touch, and the sentence and icon line up with them.",
      "Floating, it sits 24px above the bottom of the window, and 88px below 640px so it clears the phone action bar.",
    ],
    States: ["Four tones, with or without Undo, with or without a close button, in place or floating."],
    Copy: [
      'One sentence, past tense, with a full stop: "[3] invoices sent." Never "Success!" or "Done!".',
      "The action is one word, verb first: Undo, View.",
    ],
    Rules: [
      "Errors that need action are Alerts, never toasts.",
      "It goes after 5 seconds, or 8 with Undo, and pauses while hovered or focused or while the page is hidden. ToastRegion does the timing.",
      "Only text-inverse is measured against surface-inverse, so a tone shows by its icon in the toast's text colour, never by a colour of its own.",
      "If an action can be undone, do it and offer Undo instead of asking first in a Dialog.",
    ],
    Review: ["Undo was 46 by 24px on touch (round 3)."],
    Open: ["The reference bundle's Toast was static and the production toast library timed it. ToastRegion, to build, now times both."],
  },
  frame: { width: 960, height: 780 },
  examples: [
    {
      id: "tones",
      title: "Tones",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Toast">Draft saved.</x-import>
<x-import component-from-global-scope="NS.Toast" tone="success" action="Undo">[3] invoices sent.</x-import>
<x-import component-from-global-scope="NS.Toast" tone="warning">Price list saved with [2] items still unpriced.</x-import>
<x-import component-from-global-scope="NS.Toast" tone="danger">[Invoice 1042] deleted.</x-import>`,
    },
    {
      id: "close",
      title: "With a close button",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Toast" tone="success" action="Undo" on-close="{{closeToast}}">[12] payslips emailed.</x-import>`,
    },
    {
      id: "phone",
      title: "Long sentences on a phone",
      layout: "stack",
      width: 342,
      markup: `<x-import component-from-global-scope="NS.Toast" tone="success" action="Undo">[12] payslips sent to everyone on the [Northside] roster.</x-import>
<x-import component-from-global-scope="NS.Toast" tone="success">Invoice sent to [accounts@northsideplumbingsupplies.com.au].</x-import>`,
    },
    {
      id: "floating",
      title: "Floating, at the bottom centre of the window",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Toast" floating="{{yes}}" tone="success">Pay run approved.</x-import>`,
      vals: { yes: true },
    },
  ],
  logic: `closeToast: () => {}`,
  checks: [
    {
      name: "Long sentences and unbroken addresses wrap inside the toast on a phone",
      example: "phone",
      async run({ scope, expect }) {
        const section = await scope.boundingBox()
        for (const toast of await scope.locator('[data-slot="toast"]').all()) {
          const box = await toast.boundingBox()
          expect(box.x + box.width <= section.x + section.width + 0.5, "the toast fits its 342px column")
          const spill = await toast.locator('[data-slot="toast-message"]').evaluate((el) => el.scrollWidth - el.clientWidth)
          expect(spill <= 0, `the sentence runs ${spill}px out of its box`)
        }
      },
    },
    {
      name: "Undo is at least 44px square on touch",
      example: "tones",
      touch: true,
      async run({ scope, expect }) {
        const undo = await scope.getByRole("button", { name: "Undo" }).boundingBox()
        expect.atLeast(undo.height, 44, "Undo height on touch")
        expect.atLeast(undo.width, 44, "Undo width on touch")
      },
    },
    {
      name: "Undo and close are at least 24px on a desktop, with 8px between them",
      example: "close",
      async run({ scope, expect }) {
        const undo = await scope.getByRole("button", { name: "Undo" }).boundingBox()
        const close = await scope.getByRole("button", { name: "Dismiss" }).boundingBox()
        for (const [name, box] of [["Undo", undo], ["Dismiss", close]]) {
          expect.atLeast(box.height, 24, `${name} height`)
          expect.atLeast(box.width, 24, `${name} width`)
        }
        expect.atLeast(close.x - (undo.x + undo.width), 8, "space between the targets")
      },
    },
    {
      name: "Focus shows in the toast's own text colour, in both themes",
      example: "tones",
      themes: ["light", "dark"],
      async run({ page, scope, expect, theme }) {
        await page.keyboard.press("Tab")
        const undo = scope.getByRole("button", { name: "Undo" })
        expect(await undo.evaluate((el) => document.activeElement === el), "Tab reaches Undo")
        expect.equal(await style(undo, "outlineStyle"), "solid", `${theme} focus outline`)
        const toastText = await style(scope.locator('[data-slot="toast"]').nth(1), "color")
        expect.equal(await style(undo, "outlineColor"), toastText, `${theme} outline in the toast's text colour`)
      },
    },
    {
      name: "The sentence holds 4.5:1 on the inverse surface, in both themes",
      example: "tones",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const toast of await scope.locator('[data-slot="toast"]').all()) {
          const ground = await style(toast, "backgroundColor")
          expect.atLeast(contrast(await style(toast.locator('[data-slot="toast-message"]'), "color"), ground), 4.5, `${theme} sentence`)
        }
      },
    },
    {
      name: "A tone shows by its own icon, drawn in the toast's text colour",
      example: "tones",
      async run({ scope, expect }) {
        const toasts = await scope.locator('[data-slot="toast"]').all()
        const icons = []
        for (const toast of toasts) {
          const tone = await toast.getAttribute("data-tone")
          const icon = toast.locator(':scope > svg[data-slot="icon"]')
          if (tone === "neutral") {
            expect.equal(await toast.locator(":scope > svg").count(), 0, "neutral has no icon")
            continue
          }
          icons.push(await icon.getAttribute("data-icon"))
          expect.equal(await style(icon, "color"), await style(toast, "color"), `the ${tone} icon is in the text colour`)
        }
        expect.equal(new Set(icons).size, 3, "success, warning and danger each have an icon of their own")
      },
    },
    {
      name: "Forced colours keep the toast's edge, and its buttons draw no outline at rest",
      example: "close",
      forcedColors: true,
      async run({ scope, expect }) {
        const toast = scope.locator('[data-slot="toast"]')
        expect.equal(await style(toast, "borderTopStyle"), "solid", "the toast keeps an edge")
        expect.atLeast(parseFloat(await style(toast, "borderTopWidth")), 1, "edge width")
        for (const b of await scope.getByRole("button").all()) expect.equal(await style(b, "outlineStyle"), "none", "no outline at rest")
      },
    },
    {
      name: "A floating toast is a polite status at the bottom centre of the window",
      example: "floating",
      async run({ page, scope, expect }) {
        const toast = scope.locator('[data-slot="toast"]')
        expect.equal(await toast.getAttribute("role"), "status", "a polite status")
        const box = await toast.boundingBox()
        const { width, height } = page.viewportSize()
        expect.atLeast(height - (box.y + box.height), 24, "space under it")
        expect(Math.abs(box.x + box.width / 2 - width / 2) <= 1, "centred in the window")
      },
    },
    {
      name: "Below 640px a floating toast clears the phone action bar and fits the screen",
      example: "floating",
      viewport: { width: 390, height: 844 },
      async run({ page, scope, expect }) {
        const box = await scope.locator('[data-slot="toast"]').boundingBox()
        expect.atLeast(844 - (box.y + box.height), 88, "space under it on a phone")
        expect(box.x >= 16 && box.x + box.width <= 390 - 16, "inside the screen's gutters")
      },
    },
  ],
}
