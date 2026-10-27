// Progress's one definition: its README, its preview board and its scripted checks all come from here.

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
  name: "Progress",
  group: "Status",
  job: "Progress toward a known end, with an optional target marker.",
  status: "proven",
  props: [
    { name: "label", type: "string", doc: "What is progressing. Shown above the bar, and the bar's accessible name." },
    { name: "value", type: "number | null", doc: "How far along, from 0 to max. Missing says so; it is never drawn as zero." },
    { name: "max", type: "number", default: "100", doc: "The end." },
    { name: "target", type: "number", doc: "A marker on the bar, in the same units as value." },
    { name: "targetLabel", type: "string", doc: 'What a screen reader hears for the target. "Target 90%" by default.' },
    { name: "tone", type: '"success" | "warning" | "danger" | "info" | "brand"', default: '"brand"', doc: "The bar's colour. Each holds 3:1 against the track in both themes." },
    { name: "indeterminate", type: "boolean", default: "false", doc: "An unknown length: a sweep, never a made-up percentage." },
    { name: "showValue", type: "boolean", default: "false", doc: "Shows valueLabel beside the label." },
    { name: "valueLabel", type: "string", doc: 'The value in words, shown and read: "34 of 40 h". The percentage by default.' },
    { name: "size", type: '"sm" | "md"', default: '"md"', doc: "A 4 or 8px bar." },
  ],
  notes: {
    Behaviour: [
      "A progressbar named by its label. It passes value and max through to screen readers, which hear valueLabel, and the target as a description.",
      "An unknown length has no value at all, so nothing reads a percentage that is not real.",
    ],
    States: [
      "Five tones. With and without a target. Indeterminate. Missing: \"Not available\".",
      "Reduced motion: the sweep slows right down instead of stopping, so it never looks like a hang. The fill no longer glides.",
      "Forced colours: the track gets an edge, the fill is drawn in the highlight colour, and the target marker stays.",
    ],
    Copy: ['Say the numbers in words beside it: "34 of 40 h", "92 of 100 GB".'],
    Rules: [
      "An unknown length is indeterminate, never a made-up percentage.",
      "Content that is loading takes a Skeleton; a wait on another system takes a LoadingState.",
    ],
  },
  examples: [
    {
      id: "tones",
      title: "Tones, with the numbers in words",
      layout: "stack",
      width: 420,
      markup: `<x-import component-from-global-scope="NS.Progress" label="Hours this week" value="{{h34}}" max="{{h40}}" target="{{h36}}" target-label="Target 36 h" show-value="{{yes}}" value-label="34 of 40 h"></x-import>
<x-import component-from-global-scope="NS.Progress" label="Invoices sent" value="{{s18}}" max="{{s18}}" tone="success" show-value="{{yes}}" value-label="18 of 18"></x-import>
<x-import component-from-global-scope="NS.Progress" label="Storage used" value="{{g92}}" tone="warning" show-value="{{yes}}" value-label="92 of 100 GB"></x-import>
<x-import component-from-global-scope="NS.Progress" label="Payments retried" value="{{r2}}" max="{{r9}}" tone="danger" show-value="{{yes}}" value-label="2 of 9 succeeded"></x-import>
<x-import component-from-global-scope="NS.Progress" label="Contacts imported" value="{{c45}}" tone="info" show-value="{{yes}}"></x-import>`,
      vals: { yes: true, h34: 34, h40: 40, h36: 36, s18: 18, g92: 92, r2: 2, r9: 9, c45: 45 },
    },
    {
      id: "states",
      title: "Indeterminate, missing and small",
      layout: "stack",
      width: 420,
      markup: `<x-import component-from-global-scope="NS.Progress" label="Importing [contacts.csv]" indeterminate="{{yes}}" tone="info"></x-import>
<x-import component-from-global-scope="NS.Progress" label="Jobs closed this month" value="{{none}}" show-value="{{yes}}"></x-import>
<x-import component-from-global-scope="NS.Progress" label="Profile complete" value="{{p60}}" size="sm" show-value="{{yes}}"></x-import>`,
      vals: { yes: true, none: null, p60: 60 },
    },
  ],
  frame: { width: 960, height: 640 },
  checks: [
    {
      name: "Screen readers hear the value: the bar passes value, max and the words through",
      example: "tones",
      async run({ scope, expect }) {
        const bar = scope.getByRole("progressbar", { name: "Hours this week" })
        expect.equal(await bar.getAttribute("aria-valuenow"), "34", "aria-valuenow")
        expect.equal(await bar.getAttribute("aria-valuemax"), "40", "aria-valuemax")
        expect.equal(await bar.getAttribute("aria-valuetext"), "34 of 40 h", "aria-valuetext")
        const described = await bar.getAttribute("aria-describedby")
        expect.equal((await scope.locator(`[id="${described}"]`).textContent()).trim(), "Target 36 h", "the target, in words")
        expect.equal(await scope.getByRole("progressbar", { name: "Contacts imported" }).getAttribute("aria-valuetext"), "45%", "the percentage by default")
      },
    },
    {
      name: "An unknown length is indeterminate and reads no made-up value; a missing value says so",
      example: "states",
      async run({ scope, expect }) {
        const sweep = scope.getByRole("progressbar", { name: "Importing [contacts.csv]" })
        expect.equal(await sweep.getAttribute("aria-valuenow"), null, "no value for an unknown length")
        expect.equal(await sweep.getAttribute("aria-valuetext"), null, "no words for an unknown length")
        expect.equal(await sweep.getAttribute("data-state"), "indeterminate", "Radix marks it indeterminate")
        const missing = scope.getByRole("progressbar", { name: "Jobs closed this month" })
        expect.equal(await missing.getAttribute("aria-valuenow"), null, "no value when it is missing")
        expect.equal(await missing.getAttribute("aria-valuetext"), "Not available", "missing reads as missing")
      },
    },
    {
      name: "Every tone's fill holds 3:1 against the track, in both themes",
      example: "tones",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        for (const bar of await scope.locator('[data-slot="progress"]').all()) {
          const { fill, track, tone } = await bar.evaluate((el) => ({
            fill: getComputedStyle(el.querySelector("[data-slot='progress-indicator']")).backgroundColor,
            track: getComputedStyle(el).backgroundColor,
            tone: el.dataset.tone,
          }))
          expect.atLeast(Math.round(contrast(fill, track) * 100) / 100, 3, `${tone} fill against the track`)
        }
      },
    },
    {
      name: "Under reduced motion the sweep slows right down instead of stopping",
      example: "states",
      reducedMotion: true,
      async run({ scope, expect }) {
        const timing = await scope.locator('[data-slot="progress"][aria-busy="true"] [data-slot="progress-indicator"]').evaluate((el) => {
          const a = el.getAnimations()[0]
          return a ? { duration: a.effect.getTiming().duration, state: a.playState } : null
        })
        expect(timing, "the sweep still runs")
        expect.equal(timing.state, "running", "it is moving")
        expect.equal(timing.duration, 4800, "it takes three times as long")
      },
    },
    {
      name: "Forced colours keep the fill, the track's edge and the target marker",
      example: "tones",
      forcedColors: true,
      async run({ scope, expect }) {
        const bar = scope.locator('[data-slot="progress"]').first()
        const fill = await bar.locator('[data-slot="progress-indicator"]').evaluate((el) => getComputedStyle(el).backgroundColor)
        expect(!/rgba\(0, 0, 0, 0\)/.test(fill), `the fill is drawn (${fill})`)
        expect.equal(await bar.evaluate((el) => getComputedStyle(el).borderTopStyle), "solid", "the track has an edge")
        const marker = await scope.locator('[data-slot="progress-target"]').evaluate((el) => ({ style: getComputedStyle(el).borderLeftStyle, width: getComputedStyle(el).borderLeftWidth }))
        expect.equal(`${marker.style} ${marker.width}`, "solid 2px", "the target marker keeps a visible edge")
      },
    },
  ],
}
