// Skeleton's one definition: its README, its preview board and its scripted checks all come from here.

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
// The colour actually behind an element: the first ancestor with a background of its own.
const groundOf = (locator) =>
  locator.evaluate((el) => {
    for (let n = el.parentElement; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor
      if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c
    }
    return getComputedStyle(document.body).backgroundColor
  })
const appearDelay = (group) => group.evaluate((el) => el.getAnimations().find((a) => a.animationName === "appear-late")?.effect.getTiming().delay)

const CARD = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px 20px 4px; width: 460px;"
const ROW = "display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid var(--line);"

export default {
  name: "Skeleton",
  group: "Feedback",
  job: "Grey shapes where content is about to appear, in that content's layout.",
  status: "proven",
  props: [
    { name: "width", type: "number | string", default: "the full width", doc: "px, or any CSS length." },
    { name: "height", type: "number | string", default: "16", doc: "px, or any CSS length. Lines set their own." },
    { name: "circle", type: "boolean", default: "false", doc: "A circle the width across, in an avatar's place." },
    { name: "lines", type: "number", doc: "Lines of text: 12px bars on the body text's 20px rhythm, the last one shorter, so nothing jumps when the words arrive." },
    { name: "label", type: "string", doc: 'Said once to screen readers as a polite status: "Loading clients". The shapes themselves are hidden. Give it to one skeleton per area.' },
  ],
  notes: {
    Behaviour: [
      "Every shape is hidden from screen readers. label says Loading once, nearby, as a polite status.",
      "It stays out of sight for the first 800ms and then fades in, so a load that finishes inside a second shows nothing at all.",
      "It shimmers with a slow pulse while motion is welcome, and stands still under reduced motion.",
    ],
    Layout: [
      "Shapes take the layout of what is coming: lines where text will be, a circle where an avatar will be, a block where a chart will be.",
      "Lines are 12px bars 8px apart, which is the body text's 20px line, so the content lands without moving anything.",
      "The fill is the line colour: a step darker than the surface in light, a step lighter in dark. surface-sunken is near black in dark, and a large skeleton in it reads as a hole.",
    ],
    States: ["Shimmering, or still under reduced motion. In forced colours, where fills disappear, each shape keeps a dashed edge."],
    Rules: [
      "Use it when content arrives in place. When waiting on another system, use LoadingState and name the system.",
      "Under a second, show nothing: the fade-in waits for you.",
      "Never draw a skeleton for a value that failed to load. Say it is missing.",
    ],
    Review: ["Reduced motion missed the two loops people watch while waiting, the skeleton's shimmer among them (round 1)."],
  },
  frame: { width: 960, height: 520 },
  examples: [
    {
      id: "shapes",
      title: "Lines, a circle and a block",
      layout: "row",
      markup: `<x-import component-from-global-scope="NS.Skeleton" lines="{{three}}" width="{{w280}}"></x-import>
<x-import component-from-global-scope="NS.Skeleton" circle="{{yes}}" width="{{w40}}"></x-import>
<x-import component-from-global-scope="NS.Skeleton" width="{{w200}}" height="{{h120}}"></x-import>`,
      vals: { three: 3, w280: 280, yes: true, w40: 40, w200: 200, h120: 120 },
    },
    {
      id: "in-shape",
      title: "In the content's shape, with Loading said once",
      layout: "row",
      markup: `<div style="${CARD}">
<h3 class="type-heading-sm" style="margin: 0 0 12px; color: var(--text-strong);">Clients</h3>
<div style="${ROW}"><x-import component-from-global-scope="NS.Skeleton" circle="{{yes}}" width="{{w36}}"></x-import><div style="flex: 1; min-width: 0;"><x-import component-from-global-scope="NS.Skeleton" lines="{{two}}" label="Loading clients"></x-import></div><x-import component-from-global-scope="NS.Skeleton" width="{{w64}}" height="{{h20}}"></x-import></div>
<div style="${ROW}"><x-import component-from-global-scope="NS.Skeleton" circle="{{yes}}" width="{{w36}}"></x-import><div style="flex: 1; min-width: 0;"><x-import component-from-global-scope="NS.Skeleton" lines="{{two}}"></x-import></div><x-import component-from-global-scope="NS.Skeleton" width="{{w64}}" height="{{h20}}"></x-import></div>
<div style="${ROW}"><x-import component-from-global-scope="NS.Skeleton" circle="{{yes}}" width="{{w36}}"></x-import><div style="flex: 1; min-width: 0;"><x-import component-from-global-scope="NS.Skeleton" lines="{{two}}"></x-import></div><x-import component-from-global-scope="NS.Skeleton" width="{{w64}}" height="{{h20}}"></x-import></div>
</div>`,
      vals: { two: 2, w36: 36, w64: 64, h20: 20 },
    },
  ],
  checks: [
    {
      name: "The shapes are hidden from screen readers, and Loading is said once",
      example: "in-shape",
      async run({ scope, expect }) {
        const shapes = await scope.locator('[data-slot="skeleton"]').all()
        expect.atLeast(shapes.length, 12, "shapes found")
        for (const shape of shapes) expect.equal(await shape.getAttribute("aria-hidden"), "true", "a shape is hidden")
        const tree = await scope.ariaSnapshot()
        expect.equal(tree.split("Loading clients").length - 1, 1, `Loading is said once in:\n${tree}`)
        expect(/status/.test(tree), "as a status")
      },
    },
    {
      name: "The shimmer stops under reduced motion, and the first second still shows nothing",
      example: "shapes",
      reducedMotion: true,
      async run({ scope, expect }) {
        for (const shape of await scope.locator('[data-slot="skeleton"]').all()) expect.equal(await style(shape, "animationName"), "none", "a still shape")
        expect.equal(await appearDelay(scope.locator('[data-slot="skeleton-group"]').first()), 800, "the fade-in still waits")
      },
    },
    {
      name: "With motion welcome the shapes shimmer, after a first moment of nothing",
      example: "shapes",
      async run({ scope, expect }) {
        for (const shape of await scope.locator('[data-slot="skeleton"]').all()) expect.equal(await style(shape, "animationName"), "pulse", "a shimmering shape")
        expect.equal(await appearDelay(scope.locator('[data-slot="skeleton-group"]').first()), 800, "out of sight for the first 800ms")
      },
    },
    {
      name: "Lines keep the body text's 20px rhythm",
      example: "shapes",
      async run({ scope, expect }) {
        const lines = await scope.locator('[data-slot="skeleton-group"]').first().boundingBox()
        expect.equal(Math.round(lines.height), 60, "three lines are three 20px lines tall")
      },
    },
    {
      name: "The shapes sit a step from their ground in both themes: darker in light, lighter in dark, never a black hole",
      example: "in-shape",
      themes: ["light", "dark"],
      async run({ page, scope, expect, theme }) {
        const shapes = [...(await scope.locator('[data-slot="skeleton"]').all()), ...(await page.locator('[data-example="shapes"] [data-slot="skeleton"]').all())]
        for (const shape of shapes) {
          const fill = await style(shape, "backgroundColor")
          const ground = await groundOf(shape)
          expect.atLeast(contrast(fill, ground), 1.2, `${theme} shape against its ground`)
          if (theme === "dark") expect(luminance(fill) > luminance(ground), `in dark a shape is lighter than its ground (${fill} on ${ground})`)
          else expect(luminance(fill) < luminance(ground), `in light a shape is darker than its ground (${fill} on ${ground})`)
        }
      },
    },
    {
      name: "In forced colours each shape keeps a dashed edge",
      example: "shapes",
      forcedColors: true,
      async run({ scope, expect }) {
        for (const shape of await scope.locator('[data-slot="skeleton"]').all()) expect.equal(await style(shape, "borderTopStyle"), "dashed", "a dashed edge")
      },
    },
  ],
}
