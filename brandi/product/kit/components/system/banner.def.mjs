// Banner's one definition: its README, its preview board and its scripted checks all come from here.

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
  name: "Banner",
  group: "Feedback",
  job: "A one-line Alert across the top of the page's content: sample data, read only, a source that is down, offline.",
  status: "proven",
  props: [
    { name: "tone", type: '"neutral" | "info" | "success" | "warning" | "danger" | "ai"', default: '"neutral"', doc: "As Alert. Offline is neutral." },
    { name: "title", type: "ReactNode", doc: 'The state, in a few words: "[Source] is not responding".' },
    { name: "children", type: "ReactNode", doc: 'The consequence, on the same line: "Invoices below are from 9:42 am."' },
    { name: "icon", type: "IconName", doc: "Replaces the tone's icon: WifiOff for offline, Lock for read only." },
    { name: "actions", type: "ReactNode | FeedbackAction[]", doc: "Buttons, or the same as data ({ label, variant, icon, href, onClick }). Under the text below 640px of the banner's width, beside it from 640px." },
    { name: "onDismiss", type: "() => void", doc: "Shows a dismiss button. Leave it out while the state still applies." },
    { name: "dismissLabel", type: "string", default: '"Dismiss: [title]"', doc: "The dismiss button's accessible name." },
    { name: "role", type: '"alert" | "status"', default: '"status"', doc: "status, because a banner is usually there on arrival. alert when it appears because something broke while the person was on the page." },
  ],
  notes: {
    Behaviour: [
      'role="status" by default: a banner is usually there when the page arrives, and must not interrupt on every visit. role="alert" when it appears because something broke while the person was on the page.',
      "The dismiss button moves focus on to the next control, never the page body.",
    ],
    Layout: [
      "One line from 640px of its own width: the title in the label style, the consequence after it, the action at the end. Below 640px the action moves under the text.",
      "48px tall with an action, and the dismiss button centred on the line.",
      "In a column that scrolls it keeps its height: the 48px floor is on its content, so it never replaces the banner's automatic minimum.",
    ],
    States: ["Sample data, read only, a source that is down, offline, and a source that is back (dismissible)."],
    Copy: [
      'Name the state, then the consequence: "[Source] is not responding. Invoices below are from 9:42 am." A time is real, never in brackets.',
      'Offline: "You\'re offline. Changes will save when the connection is back."',
    ],
    Rules: [
      "One at a time, under the page header.",
      "Dismissible unless the state still applies: sample data and read only stay.",
      "Under a down source, the last good data stays on screen, marked with its time.",
      "A source behind the page that is down is warning, never danger: nothing the person did failed, its last good data still shows and the rest of the page works.",
      "Offline is a neutral banner that says changes will save when the connection is back.",
    ],
    Review: [
      "A starter showed its down source as a danger banner, against the pattern (a pilot's round 1). A down source is warning.",
      "A min-height on the banner let a short column that scrolls squash a two-line banner to 48px, its words over what came next (found beside a proof run's round 2).",
    ],
  },
  frame: { width: 960, height: 720 },
  examples: [
    {
      id: "uses",
      title: "Uses",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Banner" title="Sample data">Figures and names on this screen are made up.</x-import>
<x-import component-from-global-scope="NS.Banner" icon="Lock" title="Read only">You can view this pay run but not change it.</x-import>
<x-import component-from-global-scope="NS.Banner" tone="warning" title="[Source] is not responding" actions="{{bannerRetry}}">Invoices below are from 9:42 am.</x-import>
<x-import component-from-global-scope="NS.Banner" icon="WifiOff" title="You're offline">Changes will save when the connection is back.</x-import>`,
      vals: { bannerRetry: [{ label: "Try again", icon: "RotateCcw" }] },
    },
    {
      id: "narrow",
      title: "Below 640px of its own width",
      layout: "stack",
      markup: `<div style="width: 360px; max-width: 100%;">
<x-import component-from-global-scope="NS.Banner" tone="warning" title="[Source] is not responding" actions="{{bannerRetry}}">Invoices below are from 9:42 am.</x-import>
</div>`,
    },
    {
      id: "broke",
      title: "Broke while the person was on the page",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Banner" tone="warning" role="alert" title="[Source] stopped responding" actions="{{bannerRetry}}">Invoices below are from 9:42 am.</x-import>`,
    },
    {
      id: "dismissible",
      title: "Dismissible once the state has passed",
      layout: "stack",
      markup: `<sc-if value="{{backShown}}"><x-import component-from-global-scope="NS.Banner" tone="success" title="[Source] is back" on-dismiss="{{dismissBack}}">Invoices are up to date as of 9:58 am.</x-import></sc-if>
<x-import component-from-global-scope="NS.Button" icon="Receipt">View invoices</x-import>`,
    },
  ],
  state: { backDismissed: false },
  logic: `backShown: !self.state.backDismissed,
    dismissBack: () => self.setState({ backDismissed: true })`,
  checks: [
    {
      name: "A banner is a polite status, and an alert only when something broke while the person was there",
      example: "uses",
      async run({ page, scope, expect }) {
        for (const banner of await scope.locator('[data-slot="banner"]').all()) expect.equal(await banner.getAttribute("role"), "status", "a banner on arrival")
        expect.equal(await page.locator('[data-example="broke"] [data-slot="banner"]').getAttribute("role"), "alert", "a banner that broke while the person was there")
      },
    },
    {
      name: "A source that is down is a warning, never danger, with its own icon",
      async run({ page, expect }) {
        const down = page.locator('[data-slot="banner"]').filter({ hasText: /not responding|stopped responding/ })
        expect.atLeast(await down.count(), 3, "the down-source banners on the board")
        for (const banner of await down.all()) {
          expect.equal(await banner.getAttribute("data-tone"), "warning", "a down source is a warning")
          expect.equal(await banner.locator('[data-slot="alert-grid"] > svg').getAttribute("data-icon"), "TriangleAlert", "with the warning's icon, so it never rides on colour")
        }
      },
    },
    {
      name: "From 640px a banner is one line, 48px tall at most",
      example: "uses",
      async run({ scope, expect }) {
        for (const banner of await scope.locator('[data-slot="banner"]').all()) {
          const { height } = await banner.boundingBox()
          expect(height <= 48, `a banner is ${height}px tall`)
        }
      },
    },
    {
      name: "In a short column that scrolls, a banner keeps its height and its words, and a one-line banner is still 48px",
      example: "narrow",
      async run({ page, scope, expect }) {
        // A copy of the narrow banner, as a flex item and as a grid item of a column too short for what it holds. A
        // min-height on the banner replaced its automatic minimum, so the column squashed it to 48px and its words
        // ran over whatever came next.
        const banner = scope.locator('[data-slot="banner"]')
        const natural = Math.round((await banner.boundingBox()).height)
        expect(natural > 48, `the narrow banner runs to more than one line (${natural}px)`)
        for (const kind of ["flex", "grid"]) {
          const { height, spill } = await banner.evaluate((el, kind) => {
            const column = document.createElement("div")
            column.style.cssText = `display: ${kind}; flex-direction: column; width: ${el.getBoundingClientRect().width}px; height: 40px; overflow: auto`
            const after = document.createElement("p")
            after.style.cssText = "height: 120px; margin: 0; flex-shrink: 0"
            const copy = el.cloneNode(true)
            column.append(copy, after)
            el.parentElement.append(column)
            const box = copy.getBoundingClientRect()
            const out = { height: Math.round(box.height), spill: Math.round(Math.max(...[...copy.querySelectorAll("*")].map((d) => d.getBoundingClientRect().bottom)) - box.bottom) }
            column.remove()
            return out
          }, kind)
          expect.equal(height, natural, `${kind}: the banner's height in the short column`)
          expect(spill <= 0, `${kind}: its words run ${spill}px past its foot`)
        }
        for (const one of await page.locator('[data-example="uses"] [data-slot="banner"]').all()) {
          expect.equal(Math.round((await one.boundingBox()).height), 48, "a one-line banner is 48px tall")
        }
      },
    },
    {
      name: "Below 640px of its own width the action moves under the text",
      example: "narrow",
      async run({ scope, expect }) {
        const text = await scope.locator('[data-slot="alert-description"]').boundingBox()
        const actions = await scope.locator('[data-slot="alert-action"]').boundingBox()
        expect.atLeast(actions.y, text.y + text.height, "the action starts below the text")
      },
    },
    {
      name: "Offline and read only carry their own icons, so the state never rides on colour",
      example: "uses",
      async run({ scope, expect }) {
        const icons = await scope.locator('[data-slot="alert-grid"] > svg').evaluateAll((all) => all.map((svg) => svg.getAttribute("data-icon")))
        expect(icons.includes("WifiOff") && icons.includes("Lock"), `icons were ${icons.join(", ")}`)
      },
    },
    {
      name: "Dismiss moves focus on to the next control, never the page body",
      example: "dismissible",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Dismiss: [Source] is back" }).focus()
        await page.keyboard.press("Enter")
        expect.equal(await scope.locator('[data-slot="banner"]').count(), 0, "the banner is gone")
        expect.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), "View invoices", "focus moved on")
      },
    },
    {
      name: "Words hold 4.5:1 on each banner's tint, in both themes",
      example: "uses",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const banner of await scope.locator('[data-slot="banner"]').all()) {
          const ground = await style(banner, "backgroundColor")
          expect.atLeast(contrast(await style(banner.locator("strong"), "color"), ground), 4.5, `${theme} title`)
          expect.atLeast(contrast(await style(banner.locator('[data-slot="alert-description"]'), "color"), ground), 4.5, `${theme} consequence`)
        }
      },
    },
  ],
}
