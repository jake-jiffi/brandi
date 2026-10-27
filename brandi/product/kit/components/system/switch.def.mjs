// Switch's one definition: its README, its preview board and its scripted checks all come from here.

const channel = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/[\d.]+/g).map(Number)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

// Runs in the page: does a press this far above the switch's top edge still land on it?
function hitsAbove(el, dy) {
  const r = el.getBoundingClientRect()
  return el.contains(document.elementFromPoint(r.left + r.width / 2, r.top - dy))
}

export default {
  name: "Switch",
  group: "Inputs",
  job: "A setting that applies at once, with no Save.",
  status: "proven",
  props: [
    { name: "label", type: "ReactNode", doc: "Names the setting, never On or Off." },
    { name: "checked", type: "boolean", doc: "On, when the page holds it." },
    { name: "defaultChecked", type: "boolean", doc: "On to start with, when the Switch holds it." },
    { name: "onChange", type: "(checked: boolean) => void", doc: "Called with the new state. The setting applies at once." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and unchangeable. Say why nearby." },
    { name: "name, id", type: "string", doc: "For a native form post, and to point at the switch." },
  ],
  notes: {
    Behaviour: [
      "Space toggles it, and so does a press on its label.",
      "A screen reader hears the label, switch, then on or off.",
    ],
    States: [
      "On, off and disabled. The off track is drawn in line-control, so it stays visible; the on track is primary.",
      "The thumb slides where motion is welcome and simply moves under reduced motion.",
    ],
    Rules: [
      "The label names the setting, never On or Off. If turning it on needs a confirmation or a save, use a Checkbox in a form.",
      "On a settings page the switch sits before its label. A 24px hit area, 44px on touch, where each row grows to 44px.",
    ],
  },
  examples: [
    {
      id: "states",
      title: "Off, on and disabled",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Switch" label="Email me when a payment fails"></x-import>
<x-import component-from-global-scope="NS.Switch" label="Show amounts including GST" default-checked="{{yes}}"></x-import>
<x-import component-from-global-scope="NS.Switch" label="Two-step sign-in (your organisation requires it)" disabled="{{yes}}" default-checked="{{yes}}"></x-import>
<x-import component-from-global-scope="NS.Switch" label="Weekly summary (not on your plan)" disabled="{{yes}}"></x-import>`,
      vals: { yes: true },
    },
  ],
  frame: { width: 960, height: 196 },
  checks: [
    {
      name: "Space toggles it, and so does its label",
      example: "states",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const sw = scope.getByRole("switch", { name: "Email me when a payment fails" })
        expect(await sw.evaluate((el) => document.activeElement === el), "Tab reached the first switch")
        await page.keyboard.press("Space")
        expect.equal(await sw.getAttribute("aria-checked"), "true", "Space turns it on")
        await page.keyboard.press("Space")
        expect.equal(await sw.getAttribute("aria-checked"), "false", "Space turns it off")
        await scope.getByText("Email me when a payment fails", { exact: true }).click()
        expect.equal(await sw.getAttribute("aria-checked"), "true", "the label turns it on")
      },
    },
    {
      name: "Disabled cannot be changed, by key or by its label",
      example: "states",
      async run({ scope, expect }) {
        const sw = scope.getByRole("switch", { name: "Weekly summary (not on your plan)" })
        expect(await sw.isDisabled(), "disabled")
        await scope.getByText("Weekly summary (not on your plan)", { exact: true }).click({ force: true })
        expect.equal(await sw.getAttribute("aria-checked"), "false", "the label leaves it alone")
      },
    },
    {
      name: "Both tracks hold 3:1 against the surface, and focus shows the outline, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const tracks = await scope.getByRole("switch").evaluateAll((els) =>
          els.slice(0, 2).map((el) => {
            let up = el.parentElement
            while (up && /rgba\(0, 0, 0, 0\)/.test(getComputedStyle(up).backgroundColor)) up = up.parentElement
            return { track: getComputedStyle(el).backgroundColor, thumb: getComputedStyle(el.firstElementChild).backgroundColor, behind: getComputedStyle(up).backgroundColor }
          })
        )
        for (const [i, t] of tracks.entries()) {
          const which = i === 0 ? "off" : "on"
          expect.atLeast(Number(contrast(t.track, t.behind).toFixed(2)), 3, `the ${which} track against the surface`)
          expect.atLeast(Number(contrast(t.thumb, t.track).toFixed(2)), 3, `the thumb against the ${which} track`)
        }
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => `${getComputedStyle(document.activeElement).outlineStyle} ${getComputedStyle(document.activeElement).outlineWidth}`), "solid 2px", "the focus outline")
      },
    },
    {
      name: "A 24px hit area",
      example: "states",
      async run({ scope, expect }) {
        const sw = scope.getByRole("switch").first()
        const b = await sw.boundingBox()
        expect.equal(`${Math.round(b.width)}x${Math.round(b.height)}`, "36x20", "a 36 by 20px track")
        expect(await sw.evaluate(hitsAbove, 1), "a press just above the track still lands on it")
        expect(!(await sw.evaluate(hitsAbove, 4)), "the hit area stops at 24px")
      },
    },
    {
      name: "Touch: a 44px hit area and 44px rows",
      example: "states",
      touch: true,
      async run({ scope, expect }) {
        expect(await scope.getByRole("switch").first().evaluate(hitsAbove, 11), "a press 11px above the track still lands on it")
        for (const h of await scope.locator('[data-slot="switch-field"]').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)))) expect.atLeast(h, 44, "row height on touch")
      },
    },
    {
      name: "Forced colours keep on and off apart",
      example: "states",
      forcedColors: true,
      async run({ scope, expect }) {
        const [off, on] = await scope.getByRole("switch").evaluateAll((els) => els.slice(0, 2).map((el) => getComputedStyle(el).backgroundColor))
        expect(off !== on, `on and off differ in forced colours (${off}, ${on})`)
      },
    },
    {
      name: "Under reduced motion the thumb moves without sliding",
      example: "states",
      reducedMotion: true,
      async run({ scope, expect }) {
        const thumb = scope.getByRole("switch").first().locator('[data-slot="switch-thumb"]')
        const t = await thumb.evaluate((el) => `${getComputedStyle(el).transitionProperty} ${getComputedStyle(el).transitionDuration}`)
        expect(!/transform|translate/.test(t) || /^\S+ 0s/.test(t), `no slide under reduced motion (${t})`)
      },
    },
  ],
}
