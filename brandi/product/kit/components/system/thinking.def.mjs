// Thinking's one definition: its README, its preview board and its scripted checks all come from here.

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
const groundOf = (locator) =>
  locator.evaluate((el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor
      if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c
    }
    return getComputedStyle(document.body).backgroundColor
  })
// Every element in the scope that is animating, with its animation's name and length.
const moving = (scope) =>
  scope.evaluate((root) =>
    [...root.querySelectorAll("*")]
      .map((el) => getComputedStyle(el))
      .filter((s) => s.animationName !== "none")
      .map((s) => `${s.animationName} ${s.animationDuration}`)
  )

const CARD = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px 20px; width: 460px; display: flex; flex-direction: column; gap: 8px;"

export default {
  name: "Thinking",
  group: "Feedback",
  job: "The assistant's working line: a small spinner, then what it is doing, in the same shape as the AISteps summary line.",
  status: "proven",
  props: [
    { name: "children", type: "ReactNode", default: '"Thinking…"', doc: 'The work, named: "Reading [12] invoices…". Thinking… only until the work is known.' },
    { name: "live", type: "boolean", default: "true", doc: "A polite status, so each new line is read out. false inside something with a status line of its own, as AIAnswer and AIProposal have." },
  ],
  notes: {
    Behaviour: [
      'role="status" by default: each new line of work is read out when the reader is free. The line it arrives with is not.',
      "With live false it says nothing, so the answer or proposal around it speaks once for both.",
      "The spinner is decoration; the words carry the status.",
    ],
    Layout: ["A 16px spinner in the assistant's colour, then the work in muted body text. A long line wraps under itself, with the spinner on the first line."],
    Copy: [
      'Name the work: "Reading [12] invoices…", "Comparing [March] with [February]…". The ellipsis only while the work is running.',
      "Never Thinking… on its own once the work is known, and never a model's name, a prompt or a tool call.",
    ],
    Rules: [
      "No pulsing dots: the words carry the status, and the spinner is the only thing that moves.",
      "Work of more than one step is a steps log (AISteps), folded to this line once it has answered.",
    ],
    Accepted: ["Under reduced motion the spinner slows to 2.4 seconds a turn instead of stopping, so the line never looks hung."],
  },
  frame: { width: 960, height: 380 },
  examples: [
    {
      id: "working",
      title: "Naming the work",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Thinking">Reading [12] invoices…</x-import>
<x-import component-from-global-scope="NS.Thinking">Comparing [March] with [February]…</x-import>`,
    },
    {
      id: "unknown",
      title: "Before the work is known",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Thinking"></x-import>`,
    },
    {
      id: "inside",
      title: "Inside an answer with a status line of its own",
      layout: "row",
      markup: `<div style="${CARD}">
<h3 class="type-heading-sm" style="margin: 0; color: var(--text-strong);">Which invoices are overdue?</h3>
<x-import component-from-global-scope="NS.Thinking" live="{{off}}">Checking [3] sources…</x-import>
</div>`,
      vals: { off: false },
    },
  ],
  checks: [
    {
      name: "A polite status by default, and silent inside a line that has a status of its own",
      example: "working",
      async run({ page, scope, expect }) {
        for (const line of await scope.locator('[data-slot="thinking"]').all()) expect.equal(await line.getAttribute("role"), "status", "a polite status")
        expect.equal(await page.locator('[data-example="inside"] [data-slot="thinking"]').getAttribute("role"), null, "no status of its own")
      },
    },
    {
      name: "It names the work, and says Thinking… only before the work is known",
      example: "unknown",
      async run({ page, scope, expect }) {
        expect.equal((await scope.locator('[data-slot="thinking"]').innerText()).trim(), "Thinking…", "the fallback")
        const named = await page.locator('[data-example="working"] [data-slot="thinking-work"]').allInnerTexts()
        expect.equal(named.join(" | "), "Reading [12] invoices… | Comparing [March] with [February]…", "the work, named")
      },
    },
    {
      name: "The spinner is the only moving part, and slows under reduced motion instead of stopping",
      example: "working",
      reducedMotion: true,
      async run({ scope, expect }) {
        expect.equal((await moving(scope)).join(", "), "spin 2.4s, spin 2.4s", "one slow spinner per line, nothing else moving")
      },
    },
    {
      name: "With motion welcome the spinner turns once a second, and nothing pulses",
      example: "working",
      async run({ scope, expect }) {
        expect.equal((await moving(scope)).join(", "), "spin 1s, spin 1s", "one spinner per line, no pulsing dots")
      },
    },
    {
      name: "The words hold 4.5:1 and the spinner 3:1 on what they sit on, in both themes",
      example: "inside",
      themes: ["light", "dark"],
      async run({ page, expect, theme }) {
        for (const line of await page.locator('[data-slot="thinking"]').all()) {
          const ground = await groundOf(line)
          expect.atLeast(contrast(await style(line.locator('[data-slot="thinking-work"]'), "color"), ground), 4.5, `${theme} words`)
          expect.atLeast(contrast(await style(line.locator("svg"), "color"), ground), 3, `${theme} spinner`)
        }
      },
    },
  ],
}
