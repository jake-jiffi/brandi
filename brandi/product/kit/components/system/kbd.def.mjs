// Kbd's one definition: its README, its preview board and its scripted checks all come from here.

/** A role's colour as the browser computes it in the current theme. */
const colourOf = (page, role) =>
  page.evaluate((r) => {
    const probe = document.createElement("span")
    probe.style.color = `var(--${r})`
    document.body.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, role)

/** Reloads the board as if on another device, so platform="auto" reads it. */
async function onDevice(page, platform, uaPlatform) {
  await page.addInitScript(
    ([p, u]) => {
      Object.defineProperty(Navigator.prototype, "platform", { get: () => p, configurable: true })
      Object.defineProperty(Navigator.prototype, "userAgentData", { get: () => ({ platform: u }), configurable: true })
    },
    [platform, uaPlatform]
  )
  await page.reload()
  await page.waitForSelector("html[data-dc-ready]", { timeout: 15000 })
}

const shown = (scope) => scope.locator('[data-slot="kbd"] > span[aria-hidden="true"]').allTextContents()
const spoken = (scope) => scope.locator('[data-slot="kbd"] > .sr-only').allTextContents()

export default {
  name: "Kbd",
  group: "Status",
  job: "A key, for shortcuts in menus, the command menu and hints.",
  status: "proven",
  props: [
    { name: "children", type: "string", doc: "The shortcut in its Mac form: ⌘K, ⇧⌘P, ⌘↵. Anything that is not a string is shown as it is." },
    { name: "variant", type: '"default" | "rail"', default: '"default"', doc: "rail takes the rail's own colours, for a hint on the rail." },
    { name: "platform", type: '"auto" | "mac" | "other"', default: '"auto"', doc: "auto reads the device after the first render. mac and other fix the form, for a board that shows one." },
  ],
  tables: [
    {
      title: "The two forms",
      head: ["Written", "On a Mac", "On Windows and Linux", "Screen readers hear"],
      rows: [
        ["⌘K", "⌘K", "Ctrl K", "Command K, or Control K"],
        ["⇧⌘P", "⇧⌘P", "Ctrl Shift P", "Shift Command P, or Control Shift P"],
        ["⌘↵", "⌘↵", "Ctrl Enter", "Command Return, or Control Enter"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "Write the Mac form. On Windows and Linux it shows Ctrl, Alt and Shift in that order, spaced: Ctrl Shift P.",
      "Screen readers hear the keys in words (Command K), because the symbols are read as symbols or not at all.",
      "The server cannot know the device, so the first render is the Mac form and the browser corrects it.",
      "A single-character hint (/ or G) hides while Root's shortcuts setting is off, since the key does nothing then. Hints with Cmd or Ctrl, and named keys such as Esc, stay.",
    ],
    Layout: ["Hidden on touch screens, where nobody has the keys. It sits inline in a sentence, a menu row or a tooltip."],
    Rules: [
      "Only for a shortcut that works.",
      "One key style everywhere. No hand-styled kbd in product code.",
    ],
  },
  examples: [
    {
      id: "keys",
      title: "Shortcuts, read from the device",
      markup: `<x-import component-from-global-scope="NS.Kbd">⌘K</x-import>
<x-import component-from-global-scope="NS.Kbd">⇧⌘P</x-import>
<x-import component-from-global-scope="NS.Kbd">⌘↵</x-import>
<x-import component-from-global-scope="NS.Kbd">/</x-import>`,
    },
    {
      id: "other",
      title: "On Windows and Linux",
      markup: `<x-import component-from-global-scope="NS.Kbd" platform="other">⌘K</x-import>
<x-import component-from-global-scope="NS.Kbd" platform="other">⇧⌘P</x-import>
<x-import component-from-global-scope="NS.Kbd" platform="other">⌘↵</x-import>`,
    },
    {
      id: "sentence",
      title: "In a sentence",
      layout: "block",
      markup: `<p style="margin: 0;">Press <x-import component-from-global-scope="NS.Kbd" platform="mac">⌘K</x-import> to search or ask from anywhere.</p>`,
    },
    {
      id: "rail",
      title: "On the rail",
      markup: `<div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--rail); border: 1px solid var(--rail-line); border-radius: var(--radius-md); color: var(--rail-text);">
<span>Search or ask</span>
<x-import component-from-global-scope="NS.Kbd" variant="rail" platform="mac">⌘K</x-import>
</div>`,
    },
  ],
  frame: { width: 960, height: 420 },
  checks: [
    {
      name: "Written in the Mac form, it shows Ctrl, Alt and Shift on Windows and Linux",
      example: "other",
      async run({ scope, expect }) {
        expect.equal((await shown(scope)).join(" | "), "Ctrl K | Ctrl Shift P | Ctrl Enter", "the other form")
      },
    },
    {
      name: "On an Apple device it keeps the Mac form",
      example: "keys",
      async run({ page, scope, expect }) {
        await onDevice(page, "MacIntel", "macOS")
        expect.equal((await shown(scope)).join(" | "), "⌘K | ⇧⌘P | ⌘↵ | /", "the Mac form")
      },
    },
    {
      name: "On a Windows device it corrects itself to the Ctrl form",
      example: "keys",
      async run({ page, scope, expect }) {
        await onDevice(page, "Win32", "Windows")
        expect.equal((await shown(scope)).join(" | "), "Ctrl K | Ctrl Shift P | Ctrl Enter | /", "the other form, read from the device")
      },
    },
    {
      name: "Screen readers hear the keys in words, and never the symbols",
      async run({ page, expect }) {
        expect.equal((await spoken(page.locator('[data-example="other"]'))).join(" | "), "Control K | Control Shift P | Control Enter", "the other form, in words")
        expect.equal((await spoken(page.locator('[data-example="sentence"]'))).join(" | "), "Command K", "the Mac form, in words")
        expect.equal(await page.locator('[data-slot="kbd"] > span:not(.sr-only):not([aria-hidden="true"])').count(), 0, "every symbol is hidden from screen readers")
      },
    },
    {
      name: "A single-key hint hides while single-key shortcuts are off, and the rest stay",
      example: "keys",
      async run({ page, scope, expect }) {
        await page.evaluate(() => { document.documentElement.dataset.shortcuts = "off" })
        const seen = () => scope.locator('[data-slot="kbd"]').evaluateAll((els) => els.map((el) => (getComputedStyle(el).display === "none" ? "hidden" : "shown")).join(","))
        expect.equal(await seen(), "shown,shown,shown,hidden", "only the / hint hides")
        await page.evaluate(() => { document.documentElement.dataset.shortcuts = "on" })
        expect.equal(await seen(), "shown,shown,shown,shown", "and it comes back when they are on")
      },
    },
    {
      name: "Hidden on touch screens",
      touch: true,
      async run({ page, expect }) {
        const kbds = await page.locator('[data-slot="kbd"]').all()
        expect.atLeast(kbds.length, 9, "keys on the board")
        for (const k of kbds) expect.equal(await k.evaluate((el) => getComputedStyle(el).display), "none", "hidden on touch")
      },
    },
    {
      name: "The rail variant takes the rail's colours, in both themes",
      example: "rail",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const s = await scope.locator('[data-slot="kbd"]').evaluate((el) => ({ colour: getComputedStyle(el).color, border: getComputedStyle(el).borderTopColor }))
        expect.equal(s.colour, await colourOf(page, "rail-muted"), "text in rail-muted")
        expect.equal(s.border, await colourOf(page, "rail-line"), "edge in rail-line")
      },
    },
    {
      name: "The default key reads clearly on its own fill, in both themes",
      example: "keys",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const s = await scope.locator('[data-slot="kbd"]').first().evaluate((el) => ({ colour: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor, size: getComputedStyle(el).fontSize }))
        expect.equal(s.colour, await colourOf(page, "text-muted"), "text in text-muted")
        expect.equal(s.bg, await colourOf(page, "surface-subtle"), "on surface-subtle")
        expect.atLeast(parseFloat(s.size), 12, "at least 12px")
      },
    },
  ],
}
