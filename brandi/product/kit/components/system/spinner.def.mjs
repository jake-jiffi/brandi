// Spinner's one definition: its README, its preview board and its scripted checks all come from here.

export default {
  name: "Spinner",
  group: "Status",
  job: "A small inline spinner for a busy button or cell.",
  status: "proven",
  props: [
    { name: "size", type: "12 | 14 | 16 | 20 | 24", default: "16", doc: "14 or 16 in a cell or a button; 20 or 24 beside a heading." },
    { name: "label", type: "string | null", default: '"Loading"', doc: "What a screen reader hears. null when the words beside it already say what is happening." },
  ],
  notes: {
    Behaviour: [
      "With a label it is a polite status holding the label; it speaks only if it appears after the page has loaded, never for the state the page loads in.",
      "With label={null} it is decoration: the words beside it carry the state, and nothing is read twice.",
    ],
    States: [
      "Reduced motion: it slows right down (2.4s a turn) instead of stopping, because a spinner that stood still would look like a hang.",
      "Forced colours: it is drawn in the text colour.",
    ],
    Copy: ['The words beside it name the work: "Syncing [Northside Plumbing]…", never "Please wait".'],
    Rules: [
      "Content that is loading takes a Skeleton. An area waiting on another system takes a LoadingState.",
      "One spinner at a time in any one place, extending the assistant's rule. A busy button already shows its own.",
    ],
    Review: ["Two spinners ran at once in the assistant (round 6)."],
  },
  examples: [
    {
      id: "sizes",
      title: "Sizes",
      markup: `<x-import component-from-global-scope="NS.Spinner" size="{{s12}}"></x-import>
<x-import component-from-global-scope="NS.Spinner" size="{{s14}}"></x-import>
<x-import component-from-global-scope="NS.Spinner" size="{{s16}}"></x-import>
<x-import component-from-global-scope="NS.Spinner" size="{{s20}}"></x-import>
<x-import component-from-global-scope="NS.Spinner" size="{{s24}}"></x-import>`,
      vals: { s12: 12, s14: 14, s16: 16, s20: 20, s24: 24 },
    },
    {
      id: "in-place",
      title: "In place: beside its words, in a busy cell, and in a busy button",
      layout: "stack",
      markup: `<div data-place="row" style="display: flex; align-items: center; gap: 8px; color: var(--text-muted); font: 400 14px/20px var(--font-sans);"><x-import component-from-global-scope="NS.Spinner" size="{{s14}}" label="{{none}}"></x-import><span>Syncing [Northside Plumbing]…</span></div>
<div style="display: grid; grid-template-columns: 120px 200px 96px; align-items: center; height: 48px; padding: 0 16px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface); font: 400 14px/20px var(--font-sans); color: var(--text);"><span>[INV-2041]</span><span>[Northside Plumbing]</span><span data-place="cell" style="display: inline-flex; align-items: center; color: var(--text-muted);"><x-import component-from-global-scope="NS.Spinner" size="{{s16}}" label="Loading status"></x-import></span></div>
<div data-place="button"><x-import component-from-global-scope="NS.Button" loading="{{yes}}">Syncing…</x-import></div>`,
      vals: { s14: 14, s16: 16, none: null, yes: true },
    },
  ],
  frame: { width: 960, height: 360 },
  checks: [
    {
      name: "One spinner at a time in any one place, and at most one status there",
      example: "in-place",
      async run({ scope, expect }) {
        for (const place of await scope.locator("[data-place]").all()) {
          const name = await place.getAttribute("data-place")
          // A Spinner, or a busy Button's own ring: either counts as the place's one spinner.
          const spinners = await place.locator('[data-slot="spinner"], [data-icon="LoaderCircle"]:not([data-slot="spinner"] [data-icon])').count()
          expect.equal(spinners, 1, `${name} shows one spinner`)
          expect(await place.locator('[role="status"]').count() <= 1, `${name} announces at most once`)
        }
      },
    },
    {
      name: "A labelled spinner is a polite status; a spinner beside its own words is silent",
      example: "in-place",
      async run({ scope, expect }) {
        const status = scope.getByRole("status")
        expect.equal(await status.count(), 1, "one status in the example")
        expect.equal((await status.textContent()).trim(), "Loading status", "it holds its label")
        const silent = scope.locator('[data-place="row"] [data-slot="spinner"]')
        expect.equal(await silent.getAttribute("role"), null, "the spinner beside its words has no role")
        expect.equal((await silent.textContent()).trim(), "", "and no words of its own")
        expect.equal(await silent.locator("svg").getAttribute("aria-hidden"), "true", "its drawing is hidden")
      },
    },
    {
      name: "Under reduced motion it slows right down instead of stopping",
      example: "sizes",
      reducedMotion: true,
      async run({ scope, expect }) {
        const anim = await scope.locator('[data-slot="spinner"] svg').first().evaluate((el) => ({ name: getComputedStyle(el).animationName, duration: getComputedStyle(el).animationDuration }))
        expect(anim.name !== "none", "it still turns")
        expect.equal(anim.duration, "2.4s", "2.4s a turn")
      },
    },
    {
      name: "Forced colours draw it in the text colour",
      example: "sizes",
      forcedColors: true,
      async run({ scope, expect }) {
        const stroke = await scope.locator('[data-slot="spinner"] svg').first().evaluate((el) => getComputedStyle(el).stroke)
        expect(stroke !== "none" && !/rgba\(0, 0, 0, 0\)/.test(stroke), `the ring is drawn (${stroke})`)
      },
    },
  ],
}
