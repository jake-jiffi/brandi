// Badge's one definition: its README, its preview board and its scripted checks all come from here.

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
// How far apart two colours look: their distance in OKLab, where 0.1 is a plainly different colour.
const oklab = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [R, G, B] = [f(r), f(g), f(b)]
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
const apart = (a, b) => {
  const [p, q] = [oklab(rgb(a)), oklab(rgb(b))]
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])
}
async function tabTo(page, locator, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab")
    if (await locator.evaluate((el) => el === document.activeElement || el.contains(document.activeElement))) return true
  }
  return false
}

export default {
  name: "Badge",
  group: "Status",
  job: "One or two words of state on a record, read and never pressed.",
  status: "proven",
  // Declared here because other components' props use it (DescriptionList's badge).
  types: ['type BadgeTone = "success" | "warning" | "danger" | "info" | "ai" | "highlight" | "neutral"'],
  props: [
    { name: "tone", type: "BadgeTone", default: '"neutral"', doc: "What the state is to the person reading it. See Tones." },
    { name: "dot", type: "boolean", default: "false", doc: "A small dot in the badge's colour before the word." },
    { name: "icon", type: "IconName | boolean", doc: "An icon before the word: a name, or true for the tone's own icon." },
    { name: "size", type: '"sm" | "md"', default: '"md"', doc: "20 or 24px tall. sm in tables and dense rows." },
    { name: "count", type: "number", doc: "A count, shown as a figure (compact from 10,000) and read with countLabel." },
    { name: "countLabel", type: "string", doc: 'What a screen reader hears after the count: "need you" makes 3 read as "3 need you".' },
    { name: "children", type: "ReactNode", doc: "One or two words, in sentence case, with no full stop." },
  ],
  tables: [
    {
      title: "Tones",
      head: ["Tone", "Means", "Words"],
      rows: [
        ["success", "Finished well, or going to plan", "Approved, Paid, Sent, Live, Connected, On track"],
        ["warning", "Heads up", "Due soon, Stale, Near limit, Behind"],
        ["danger", "Something is wrong", "Failed, Overdue, Blocked, Disconnected, Sync failed"],
        ["info", "Happening now", "In progress, Syncing, Scheduled"],
        ["ai", "Made by the assistant", "Drafted, Answered, Suggested"],
        ["highlight", "Waiting on the reader, or new since the last visit. Solid, never tinted", "Needs you"],
        ["neutral", "Out of play, or waiting on someone else", "Archived, Draft, Paused, Snoozed, Waiting on [client]"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "Read, not pressed: no focus, no hover, and never the pressable shape. Its corners are the small radius.",
      'A count is read as words. count={3} with countLabel="need you" shows 3 and reads "3 need you".',
      "A label cut short shows in full on hover, on keyboard focus and on a long press. Only a cut badge takes focus, and its full text is read once.",
    ],
    States: [
      "Seven tones, each with a dot, an icon or neither. Two sizes. A count. A label cut short.",
      "Forced colours: the tint goes, the edge and the word stay, the dot is drawn in the text colour, and highlight becomes a marked area.",
    ],
    Copy: [
      "The word comes from the written system's status words, and a state has the same word in every product.",
      "Draft in neutral is the person's unfinished work. Drafted in ai, with its icon, is the assistant's.",
    ],
    Rules: [
      "The word carries the meaning. Tone, dot and icon only add to it, so status never rides on colour alone.",
      "Sentence case, one or two words, no full stop.",
      "A category someone assigned is a Tag, never a Badge.",
    ],
    Review: [
      "Badge and Tag looked alike (round 1). A badge is tinted in its tone; a tag is outlined, on the surface, with a category dot.",
      'The highlight and the warning shared a colour, so "needs you" blurred with "heads up" (round 1). Highlight is solid; warning is a tint.',
      "One state had five names at two severities (round 3). Each word belongs to one tone.",
      "A badge cut by a narrow grid column hung its board (React error 185, a proof run): the tooltip wrapped round it widened the column, so it fitted, unwrapped and was cut again. The wrapper now sizes as the badge does.",
    ],
  },
  examples: [
    {
      id: "tones",
      title: "Tones",
      markup: `<x-import component-from-global-scope="NS.Badge" tone="success">Paid</x-import>
<x-import component-from-global-scope="NS.Badge" tone="warning">Due soon</x-import>
<x-import component-from-global-scope="NS.Badge" tone="danger">Overdue</x-import>
<x-import component-from-global-scope="NS.Badge" tone="info">Syncing</x-import>
<x-import component-from-global-scope="NS.Badge" tone="ai">Drafted</x-import>
<x-import component-from-global-scope="NS.Badge" tone="highlight">Needs you</x-import>
<x-import component-from-global-scope="NS.Badge" tone="neutral">Archived</x-import>`,
    },
    {
      id: "marks",
      title: "With a dot or the tone's icon",
      markup: `<x-import component-from-global-scope="NS.Badge" tone="success" dot="{{yes}}">Live</x-import>
<x-import component-from-global-scope="NS.Badge" tone="info" dot="{{yes}}">In progress</x-import>
<x-import component-from-global-scope="NS.Badge" tone="neutral" dot="{{yes}}">Paused</x-import>
<x-import component-from-global-scope="NS.Badge" tone="success" icon="{{yes}}">Approved</x-import>
<x-import component-from-global-scope="NS.Badge" tone="warning" icon="{{yes}}">Stale</x-import>
<x-import component-from-global-scope="NS.Badge" tone="danger" icon="{{yes}}">Sync failed</x-import>
<x-import component-from-global-scope="NS.Badge" tone="ai" icon="{{yes}}">Suggested</x-import>`,
      vals: { yes: true },
    },
    {
      id: "sizes",
      title: "Sizes",
      markup: `<x-import component-from-global-scope="NS.Badge" tone="success" size="sm">Sent</x-import>
<x-import component-from-global-scope="NS.Badge" tone="success">Sent</x-import>`,
    },
    {
      id: "counts",
      title: "Counts, read as words",
      markup: `<x-import component-from-global-scope="NS.Badge" tone="highlight" count="{{three}}" count-label="need you"></x-import>
<x-import component-from-global-scope="NS.Badge" count="{{twelve}}" count-label="unread"></x-import>
<x-import component-from-global-scope="NS.Badge" tone="info" count="{{many}}" count-label="queued"></x-import>`,
      vals: { three: 3, twelve: 12, many: 12840 },
    },
    {
      id: "long",
      title: "A long label, cut short",
      markup: `<x-import component-from-global-scope="NS.Badge" tone="neutral">Waiting on [Northside Plumbing and Gas]</x-import>`,
    },
    {
      // Two TimePickers and a badge in a row with a fixed label column, in a Card 200px wide: the badge's auto
      // column has about 10px. Wrapping the cut badge in its tooltip once made that column wide enough to uncut it,
      // which unwrapped it, which cut it again: React stopped the loop with error 185 and the board never drew.
      id: "squeezed",
      title: "A row too narrow for what it holds: the badge is cut and the board still draws",
      markup: `<div style="width: 200px;"><x-import component-from-global-scope="NS.Card" title="Regular week">
<div class="flex flex-col gap-3">
<div data-row style="display: grid; grid-template-columns: 120px minmax(0, 1fr) minmax(0, 1fr) auto; gap: 12px; align-items: center;"><span class="type-label text-text-strong">Monday</span><x-import component-from-global-scope="NS.TimePicker" default-value="10:00" aria-label="Monday opens"></x-import><x-import component-from-global-scope="NS.TimePicker" default-value="23:00" aria-label="Monday closes"></x-import><span aria-hidden="true"></span></div>
<div data-row style="display: grid; grid-template-columns: 120px minmax(0, 1fr) minmax(0, 1fr) auto; gap: 12px; align-items: center;"><span class="type-label text-text-strong">Thursday</span><x-import component-from-global-scope="NS.TimePicker" default-value="10:00" aria-label="Thursday opens"></x-import><x-import component-from-global-scope="NS.TimePicker" default-value="22:00" aria-label="Thursday closes"></x-import><x-import component-from-global-scope="NS.Badge" tone="info">Syncing</x-import></div>
</div>
</x-import></div>`,
    },
    {
      id: "badge-or-tag",
      title: "A badge is a state; a tag is a category",
      markup: `<x-import component-from-global-scope="NS.Badge" tone="success">Paid</x-import>
<x-import component-from-global-scope="NS.Tag" color="{{one}}">[Wholesale]</x-import>`,
      vals: { one: 1 },
    },
  ],
  frame: { width: 960, height: 860 },
  checks: [
    {
      name: "Every badge carries a word, so status never rides on colour alone",
      example: "tones",
      async run({ scope, expect }) {
        const badges = await scope.locator('[data-slot="badge"]').all()
        expect.equal(badges.length, 7, "one badge per tone")
        for (const b of badges) expect((await b.innerText()).trim().length > 1, "each badge says its state in words")
      },
    },
    {
      name: "Highlight is solid and warning is a tint, so needs you never blurs with heads up, in both themes (2:1 apart or plainly different in colour)",
      example: "tones",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const fill = (tone) => scope.locator(`[data-slot="badge"][data-tone="${tone}"]`).evaluate((el) => getComputedStyle(el).backgroundColor)
        const [highlight, warning] = [await fill("highlight"), await fill("warning")]
        // Apart in lightness (2:1) or plainly different in colour: a light, saturated highlight such as a
        // highlighter yellow sits close in lightness to a pale warning tint and still never reads as one.
        const ratio = Math.round(contrast(highlight, warning) * 100) / 100
        const distance = Math.round(apart(highlight, warning) * 1000) / 1000
        expect(ratio >= 2 || distance >= 0.1, `the highlight and warning fills: ${ratio}:1 apart and ${distance} in OKLab, wanted 2:1 or 0.1`)
      },
    },
    {
      name: "Every badge's word holds 4.5:1 against its fill, in both themes",
      example: "tones",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        for (const b of await scope.locator('[data-slot="badge"]').all()) {
          const { color, bg, tone } = await b.evaluate((el) => ({ color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor, tone: el.dataset.tone }))
          expect.atLeast(Math.round(contrast(color, bg) * 100) / 100, 4.5, `${tone} badge text contrast`)
        }
      },
    },
    {
      name: "Each status word belongs to one tone",
      async run({ page, expect }) {
        const seen = new Map()
        for (const b of await page.locator('[data-slot="badge"][data-tone]').all()) {
          const word = (await b.innerText()).trim()
          const tone = await b.getAttribute("data-tone")
          if (!word || /^\d/.test(word)) continue
          if (seen.has(word)) expect.equal(seen.get(word), tone, `"${word}" keeps one tone`)
          seen.set(word, tone)
        }
        expect(seen.size >= 7, "the preview shows the status words")
      },
    },
    {
      name: "A badge is tinted and a tag is outlined with a category dot, so the two never look alike",
      example: "badge-or-tag",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const look = (sel) => scope.locator(sel).first().evaluate((el) => {
          const s = getComputedStyle(el)
          return { bg: s.backgroundColor, edge: s.borderTopColor, ink: s.color, radius: s.borderTopLeftRadius }
        })
        const badge = await look('[data-slot="badge"]')
        const tag = await look('[data-slot="tag"]')
        const surface = await scope.evaluate(() => {
          const probe = document.createElement("span")
          probe.style.background = "var(--surface)"
          document.body.append(probe)
          const value = getComputedStyle(probe).backgroundColor
          probe.remove()
          return value
        })
        expect.equal(tag.bg, surface, "the tag sits on the plain surface")
        expect(badge.bg !== tag.bg, "the badge is tinted in its tone")
        expect(badge.ink !== tag.ink, "the badge's word is in its tone colour")
        expect.equal(await scope.locator('[data-slot="tag"] [data-slot="tag-dot"]').count(), 1, "the tag carries its category's dot")
        expect.equal(await scope.locator('[data-slot="badge"] [data-slot="badge-dot"]').count(), 0, "this badge has no dot to confuse with a category")
      },
    },
    {
      name: "A count is read as words, and the bare figure is hidden from screen readers",
      example: "counts",
      async run({ scope, expect }) {
        const first = scope.locator('[data-slot="badge"]').first()
        expect.equal((await first.locator(".sr-only").textContent()).trim(), "3 need you", "what a screen reader hears")
        expect.equal((await first.locator('[aria-hidden="true"]').textContent()).trim(), "3", "what people see")
        const snapshot = await scope.ariaSnapshot()
        expect(snapshot.includes("3 need you") && snapshot.includes("12 unread") && snapshot.includes("12,840 queued"), `the accessibility tree reads every count in words: ${snapshot}`)
        expect.equal((await scope.locator('[data-slot="badge"]').nth(2).locator('[aria-hidden="true"]').textContent()).trim(), "13K", "a large count is compact on screen")
      },
    },
    {
      name: "A label cut short shows in full on keyboard focus, is read once, and Escape hides it",
      example: "long",
      async run({ page, scope, expect }) {
        const label = scope.locator('[data-slot="badge-label"]')
        expect(await label.evaluate((el) => el.scrollWidth > el.clientWidth), "the long label is cut short")
        const trigger = scope.locator('[data-slot="tooltip-trigger"]')
        expect(await tabTo(page, trigger), "Tab reaches the cut badge")
        const tip = page.locator('[data-slot="tooltip-content"]')
        await tip.waitFor({ state: "visible", timeout: 2000 })
        expect((await tip.innerText()).includes("Waiting on [Northside Plumbing and Gas]"), "the tooltip holds the full label")
        expect.equal(await trigger.getAttribute("aria-describedby"), null, "the full text is not read a second time as a description")
        await page.keyboard.press("Escape")
        await tip.waitFor({ state: "hidden", timeout: 2000 })
      },
    },
    {
      name: "A badge squeezed by its row is cut and settles, wrapped in its tooltip",
      example: "squeezed",
      async run({ page, scope, expect }) {
        // A board that loops never draws, and the preview fails before any check runs. Past that, the badge
        // must also hold still: a ResizeObserver can keep a loop going a frame at a time without an error.
        const row = scope.locator("[data-row]").nth(1)
        const badge = row.locator('[data-slot="badge"]')
        expect(await badge.locator('[data-slot="badge-label"]').evaluate((el) => el.scrollWidth > el.clientWidth), "the label is cut short")
        const frames = await badge.evaluate(
          (el) =>
            new Promise((resolve) => {
              const seen = []
              const tick = () => {
                seen.push(`${Boolean(el.isConnected && el.closest('[data-slot="tooltip-trigger"]'))} ${Math.round(el.getBoundingClientRect().width)}`)
                if (seen.length < 20) requestAnimationFrame(tick)
                else resolve(seen)
              }
              requestAnimationFrame(tick)
            })
        )
        expect.equal(new Set(frames).size, 1, `the same over 20 frames (${[...new Set(frames)].join(", ")})`)
        expect(frames[0].startsWith("true"), "wrapped in its tooltip, so the full label is there on hover and focus")
      },
    },
    {
      name: "Forced colours keep the edge, the dot and the marked highlight",
      example: "marks",
      forcedColors: true,
      async run({ page, scope, expect }) {
        const dot = await scope.locator('[data-slot="badge-dot"]').first().evaluate((el) => getComputedStyle(el).backgroundColor)
        expect(!/rgba\(0, 0, 0, 0\)|transparent/.test(dot), `the dot is still drawn (${dot})`)
        const edge = await scope.locator('[data-slot="badge"]').first().evaluate((el) => getComputedStyle(el).borderTopStyle)
        expect.equal(edge, "solid", "the badge keeps its edge")
        const marked = await page.locator('[data-slot="badge"][data-tone="highlight"]').first().evaluate((el) => getComputedStyle(el).forcedColorAdjust)
        expect.equal(marked, "none", "highlight keeps its marked area")
      },
    },
  ],
}
