// Delta's one definition: its README, its preview board and its scripted checks all come from here.

const hexToRgb = (hex) => {
  const h = hex.trim().replace("#", "")
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

export default {
  name: "Delta",
  group: "Status",
  job: "Change against a comparison, as an arrow and a value, read as the whole judgement.",
  status: "proven",
  props: [
    { name: "value", type: "number | null", doc: "The change, signed. Missing says so; it is never drawn as zero." },
    { name: "format", type: "NumberStyle", default: '"percent"', doc: "Any number style, through formatNumber. A change in a rate is points." },
    { name: "goodWhen", type: '"up" | "down" | "neither"', default: '"up"', doc: "Which way is better. Costs, overdue amounts and churn are down." },
    { name: "suffix", type: "string", doc: 'What it is compared with, always: "vs last month".' },
  ],
  tables: [
    {
      title: "Judgements",
      head: ["Change", "goodWhen", "Colour", "A screen reader hears"],
      rows: [
        ["Up", "up", "success", "Up 6.2%, better vs last month"],
        ["Down", "down", "success", "Down 4.1%, better vs last month"],
        ["Up", "down", "danger", "Up 12%, worse vs last week"],
        ["Any", "neither", "neutral", "Up 2.3% vs last quarter"],
        ["None, after rounding", "any", "neutral", "No change vs last month"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      'Read as the whole judgement: direction, figure, better or worse, and the comparison ("Up 6.2%, better vs last month"). The arrow and the figure are hidden from screen readers, so nothing is read twice.',
      "Flat is decided on the figure people see: 0.04% shows as 0%, so it reads as no change, not up.",
    ],
    States: [
      "Better, worse, neither and no change. Every number style. Missing: \"No comparison\", never 0%.",
      "Forced colours take away the colour that says better or worse, so the word appears beside the figure instead.",
    ],
    Copy: ['The suffix names the comparison: "vs last month", "vs the same week last year", "vs target".'],
    Rules: [
      "Success when the change is good, danger when bad, neutral when flat or neither. The arrow says which way; the words say whether that is good.",
      "Always say what it is compared with.",
      "Costs, overdue amounts and churn are goodWhen=\"down\".",
      'A change in a rate is in points ("3 pts"), never a percent of a percent.',
    ],
  },
  examples: [
    {
      id: "judgements",
      title: "Better, worse, neither and no change",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Delta" value="{{up62}}" suffix="vs last month"></x-import>
<x-import component-from-global-scope="NS.Delta" value="{{down41}}" good-when="down" suffix="vs last month"></x-import>
<x-import component-from-global-scope="NS.Delta" value="{{up12}}" good-when="down" suffix="vs last week"></x-import>
<x-import component-from-global-scope="NS.Delta" value="{{down35}}" suffix="vs last month"></x-import>
<x-import component-from-global-scope="NS.Delta" value="{{up23}}" good-when="neither" suffix="vs last quarter"></x-import>
<x-import component-from-global-scope="NS.Delta" value="{{tiny}}" suffix="vs last month"></x-import>`,
      vals: { up62: 6.2, down41: -4.1, up12: 12, down35: -3.5, up23: 2.3, tiny: 0.04 },
    },
    {
      id: "formats",
      title: "Number styles: points for a rate, money, hours",
      layout: "stack",
      markup: `<x-import component-from-global-scope="NS.Delta" value="{{pts}}" format="points" suffix="vs last month"></x-import>
<x-import component-from-global-scope="NS.Delta" value="{{money}}" format="currency" suffix="vs last week"></x-import>
<x-import component-from-global-scope="NS.Delta" value="{{costs}}" format="compact-currency" good-when="down" suffix="vs budget"></x-import>
<x-import component-from-global-scope="NS.Delta" value="{{hours}}" format="hours" good-when="neither" suffix="vs last fortnight"></x-import>`,
      vals: { pts: 3, money: 1240, costs: 18400, hours: -6.5 },
    },
    {
      id: "missing",
      title: "Missing",
      markup: `<x-import component-from-global-scope="NS.Delta" value="{{none}}" suffix="vs last month"></x-import>`,
      vals: { none: null },
    },
  ],
  checks: [
    {
      name: "Each delta is read as the whole judgement, and the arrow and figure are not read twice",
      example: "judgements",
      async run({ scope, expect }) {
        const heard = await scope.locator('[data-slot="delta"] .sr-only').allTextContents()
        expect.equal(
          heard.join(" | "),
          "Up 6.2%, better vs last month | Down 4.1%, better vs last month | Up 12%, worse vs last week | Down 3.5%, worse vs last month | Up 2.3% vs last quarter | No change vs last month",
          "what a screen reader hears"
        )
        const snapshot = await scope.ariaSnapshot()
        expect(snapshot.includes("Up 6.2%, better vs last month"), `the accessibility tree reads the sentence: ${snapshot}`)
        expect.equal(snapshot.split("6.2%").length - 1, 1, "the figure is read once, inside the sentence")
        expect.equal(await scope.locator('[data-slot="delta"] > [aria-hidden="true"]').count(), 12, "figure and suffix are hidden; the sentence is read")
      },
    },
    {
      name: "Colour follows the judgement, not the direction, in both themes",
      example: "judgements",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const vars = await scope.evaluate(() => {
          const s = getComputedStyle(document.documentElement)
          return { good: s.getPropertyValue("--success"), bad: s.getPropertyValue("--danger"), plain: s.getPropertyValue("--text-muted") }
        })
        const ink = (i) => scope.locator('[data-slot="delta"]').nth(i).locator('[aria-hidden="true"]').first().evaluate((el) => getComputedStyle(el).color)
        expect.equal(await ink(0), hexToRgb(vars.good), "up, good when up: success")
        expect.equal(await ink(1), hexToRgb(vars.good), "down, good when down: success")
        expect.equal(await ink(2), hexToRgb(vars.bad), "up, good when down: danger")
        expect.equal(await ink(3), hexToRgb(vars.bad), "down, good when up: danger")
        expect.equal(await ink(4), hexToRgb(vars.plain), "neither: neutral")
        expect.equal(await ink(5), hexToRgb(vars.plain), "no change: neutral")
      },
    },
    {
      name: "A rate changes in points, money and hours go through the formatter",
      example: "formats",
      async run({ scope, expect }) {
        const heard = await scope.locator('[data-slot="delta"] .sr-only').allTextContents()
        expect.equal(heard[0], "Up 3 pts, better vs last month", "a rate in points")
        expect.equal(heard[1], "Up $1,240, better vs last week", "money, with cents only when there are cents")
        expect.equal(heard[2], "Up $18K, worse vs budget", "compact money")
        expect.equal(heard[3], "Down 6.5 h vs last fortnight", "hours, with no judgement")
      },
    },
    {
      name: "Forced colours show better or worse as a word, since the colour is gone",
      example: "judgements",
      forcedColors: true,
      async run({ scope, expect }) {
        const words = await scope.locator('[data-slot="delta-judgement"]').evaluateAll((els) => els.map((el) => (getComputedStyle(el).display === "none" ? "" : el.textContent)))
        expect.equal(words.join(","), "better,better,worse,worse", "each judged change says its judgement")
      },
    },
    {
      name: "Without forced colours the judgement word stays out of sight, and is never read twice",
      example: "judgements",
      async run({ scope, expect }) {
        const shown = await scope.locator('[data-slot="delta-judgement"]').evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== "none").length)
        expect.equal(shown, 0, "colour carries it on screen")
        expect.equal(await scope.locator('[data-slot="delta-judgement"]:not([aria-hidden="true"] *)').count(), 0, "the word sits inside the hidden figure, so the sentence is the only reading")
      },
    },
    {
      name: "A missing value says so and is never drawn as zero",
      example: "missing",
      async run({ scope, expect }) {
        const text = (await scope.locator('[data-slot="delta"]').innerText()).trim()
        expect.equal(text, "No comparison", "missing reads as missing")
        expect(!/0%/.test(text), "no zero is drawn")
      },
    },
  ],
}
