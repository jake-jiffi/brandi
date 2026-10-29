// SegmentedControl's one definition: its README, its preview board and its scripted checks all come from here.

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

/** Waits until the focused element is the checked radio with this label. Roving focus moves on a timer. */
const settleOn = (page, label) =>
  page.waitForFunction(
    (want) => {
      const el = document.activeElement
      return !!el && el.getAttribute("role") === "radio" && el.textContent?.trim() === want && el.getAttribute("aria-checked") === "true"
    },
    label,
    { timeout: 3000 }
  )

export default {
  name: "SegmentedControl",
  group: "Actions",
  job: "Two to five views of the same content: Day, Week, Month; List, Board.",
  status: "proven",
  props: [
    { name: "options", type: "Array<string | { value: string; label: string; icon?: IconName; disabled?: boolean }>", doc: "Two to five views. A string is both the value and the label." },
    { name: "value", type: "string", doc: "The chosen option, when the parent holds it." },
    { name: "defaultValue", type: "string", doc: "The option chosen at first, when the control holds it. The first option when neither is set." },
    { name: "onChange", type: "(value: string) => void", doc: "Called with the new value as soon as the selection moves, by press or by key." },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall. Options are 40px on a touch screen (44px at lg)." },
    { name: "label", type: "string", doc: "Required. The group's name, read before the options (Calendar view)." },
    { name: "disabled", type: "boolean", default: "false", doc: "Fades the whole control and takes it out of the tab order." },
  ],
  notes: {
    Behaviour: [
      "A radio group named by its label. Screen readers hear the group, then each option as a radio, checked or not, with its position.",
      "Tab enters at the selected option, and Tab again leaves the group.",
      "Arrows, Home and End move the selection and the focus together. Left and Up go back, Right and Down go on, and the ends wrap round.",
      "Enter and Space on the chosen option keep it chosen: there is always one.",
    ],
    Layout: [
      "Every option is as wide as the widest, so the thumb is placed by arithmetic and is right on the server's first paint.",
      "It is as wide as its options. Given w-full it fills a narrow column, and the options share the width evenly.",
    ],
    States: [
      "The selection slides to the chosen option. Under reduced motion nothing moves: the chosen option takes the thumb's look itself and fades in.",
      "In forced colours the chosen option is outlined in Highlight, because the thumb's fill and edge are dropped.",
      "Hover darkens an option's text and washes its segment; the chosen option keeps its thumb.",
    ],
    Rules: [
      "Changes the view at once. Not for moving between pages (Tabs) or for settings (RadioGroup).",
      "Two to five options, each one or two words. Options are 40px on touch.",
    ],
    Review: ["The starter's controls lost their state in forced colours (round 2, section 2.9): the chosen option is checked there, with nothing outlined at rest."],
    Accepted: ["Options are 40px on touch rather than 44px (section 2.5). At 44px they crowd a phone toolbar for no gain in accuracy."],
  },
  examples: [
    {
      id: "views",
      title: "Views of the same content",
      markup: `<x-import component-from-global-scope="NS.SegmentedControl" label="Calendar view" options="{{days}}" default-value="Week"></x-import>`,
      vals: { days: ["Day", "Week", "Month"] },
    },
    {
      id: "icons",
      title: "With icons",
      markup: `<x-import component-from-global-scope="NS.SegmentedControl" label="[Invoice] layout" options="{{layouts}}" default-value="list"></x-import>`,
      vals: {
        layouts: [
          { value: "list", label: "List", icon: "List" },
          { value: "board", label: "Board", icon: "Kanban" },
          { value: "calendar", label: "Calendar", icon: "CalendarDays" },
        ],
      },
    },
    {
      id: "sizes",
      title: "Sizes",
      markup: `<x-import component-from-global-scope="NS.SegmentedControl" label="Period, small" options="{{periods}}" default-value="30 days" size="sm"></x-import>
<x-import component-from-global-scope="NS.SegmentedControl" label="Period" options="{{periods}}" default-value="30 days"></x-import>
<x-import component-from-global-scope="NS.SegmentedControl" label="Period, large" options="{{periods}}" default-value="30 days" size="lg"></x-import>`,
      vals: { periods: ["7 days", "30 days", "90 days"] },
    },
    {
      id: "fill",
      title: "Filling a narrow column",
      layout: "block",
      width: 320,
      markup: `<x-import component-from-global-scope="NS.SegmentedControl" class="w-full" label="Roster view" options="{{rosterViews}}" default-value="Team"></x-import>`,
      vals: { rosterViews: ["Mine", "Team", "Open shifts"] },
    },
    {
      id: "controlled",
      title: "Held by the page",
      markup: `<div data-chosen="{{span}}" style="display: contents;"><x-import component-from-global-scope="NS.SegmentedControl" label="Report span" options="{{spans}}" value="{{span}}" on-change="{{setSpan}}"></x-import></div>
<span class="type-meta text-text-muted">Showing this {{spanWord}}</span>`,
      vals: { spans: ["Quarter", "Year"] },
    },
    {
      id: "disabled",
      title: "Disabled",
      markup: `<x-import component-from-global-scope="NS.SegmentedControl" label="Chart type" options="{{charts}}" default-value="Bars" disabled="{{yes}}"></x-import>`,
      vals: { charts: ["Bars", "Lines"], yes: true },
    },
  ],
  frame: { width: 960, height: 640 },
  state: { span: "Quarter" },
  logic: "span: self.state.span, spanWord: self.state.span.toLowerCase(), setSpan: (v) => self.setState({ span: v })",
  checks: [
    {
      name: "Its corners are radius-action at every size, and its options sit 2px inside them",
      example: "sizes",
      async run({ scope, expect }) {
        // A primitive's rounded-md once beat rounded-action in the cascade, and the control came out a pill.
        for (const group of await scope.getByRole("radiogroup").all()) {
          const r = await group.evaluate((el) => {
            const s = getComputedStyle(el), want = parseFloat(s.getPropertyValue("--radius-action")) || 0
            const option = el.querySelector('[role="radio"]')
            return { track: parseFloat(s.borderTopLeftRadius), option: option ? parseFloat(getComputedStyle(option).borderTopLeftRadius) : null, want }
          })
          // Computed radii are not clamped to the box, so a pill brand's 9999px reads as 9999px here.
          expect.equal(Math.round(r.track), Math.round(r.want), "the track takes radius-action")
          if (r.option !== null) expect.equal(Math.round(r.option), Math.round(Math.max(r.want - 2, 0)), "each option is 2px inside it")
        }
      },
    },
    {
      name: "A radio group named by its label, each option a radio",
      example: "views",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("radiogroup", { name: "Calendar view" }).count(), 1, "the named group")
        expect.equal((await scope.getByRole("radio").allInnerTexts()).join(","), "Day,Week,Month", "the options")
        expect.equal(await scope.getByRole("radio", { name: "Week", checked: true }).count(), 1, "Week is checked")
      },
    },
    {
      name: "Tab enters at the selected option",
      example: "views",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        expect(await scope.getByRole("radio", { name: "Week" }).evaluate((el) => document.activeElement === el), "focus lands on Week, the selected option")
      },
    },
    {
      name: "The group is one tab stop: Tab again leaves it",
      example: "views",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        expect(!(await scope.getByRole("radiogroup").evaluate((el) => el.contains(document.activeElement))), "focus has left the group")
        await page.keyboard.press("Shift+Tab")
        expect(await scope.getByRole("radio", { name: "Week" }).evaluate((el) => document.activeElement === el), "Shift+Tab comes back to the selected option")
      },
    },
    {
      name: "Arrow keys move the selection and the focus together, and wrap at the ends",
      example: "views",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        for (const [key, want] of [["ArrowRight", "Month"], ["ArrowLeft", "Week"], ["ArrowDown", "Month"], ["ArrowUp", "Week"], ["ArrowLeft", "Day"], ["ArrowLeft", "Month"], ["ArrowRight", "Day"]]) {
          await page.keyboard.press(key)
          await settleOn(page, want)
        }
        expect.equal(await scope.getByRole("radio", { checked: true }).count(), 1, "one option checked")
      },
    },
    {
      name: "Home and End move the selection and the focus to the first and last option",
      example: "views",
      async run({ page }) {
        await page.keyboard.press("Tab")
        await page.keyboard.press("End")
        await settleOn(page, "Month")
        await page.keyboard.press("Home")
        await settleOn(page, "Day")
      },
    },
    {
      name: "Enter and Space keep the chosen option chosen",
      example: "views",
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        await page.keyboard.press("Space")
        await page.keyboard.press("Enter")
        expect.equal(await scope.getByRole("radio", { name: "Week", checked: true }).count(), 1, "Week is still checked")
      },
    },
    {
      name: "Given the column's width, the options share it evenly and the thumb still fits its option",
      example: "fill",
      async run({ scope, expect }) {
        const group = await scope.getByRole("radiogroup").boundingBox()
        expect.equal(Math.round(group.width), 320, "the control fills the column")
        const widths = await Promise.all((await scope.getByRole("radio").all()).map(async (r) => Math.round((await r.boundingBox()).width)))
        expect(Math.max(...widths) - Math.min(...widths) <= 1, `equal options, got ${widths.join(",")}`)
        const thumb = await scope.locator('[data-slot="segmented-control-thumb"]').boundingBox()
        const team = await scope.getByRole("radio", { name: "Team" }).boundingBox()
        expect.equal(`${Math.round(thumb.x)},${Math.round(thumb.width)}`, `${Math.round(team.x)},${Math.round(team.width)}`, "the thumb sits exactly on Team")
      },
    },
    {
      name: "A press selects at once, and onChange hears the value",
      example: "controlled",
      async run({ scope, expect }) {
        await scope.getByRole("radio", { name: "Year" }).click()
        expect.equal(await scope.locator("[data-chosen]").getAttribute("data-chosen"), "Year", "the page heard Year")
        expect.equal(await scope.getByRole("radio", { name: "Year", checked: true }).count(), 1, "Year is checked")
      },
    },
    {
      name: "Heights are 32, 36 and 44px, and options are 40px on touch",
      example: "sizes",
      async run({ scope, expect }) {
        const heights = await Promise.all((await scope.getByRole("radiogroup").all()).map(async (g) => Math.round((await g.boundingBox()).height)))
        expect.equal(heights.join(","), "32,36,44", "control heights")
      },
    },
    {
      name: "Options grow to 40px on touch, 44px at lg",
      example: "sizes",
      touch: true,
      async run({ scope, expect }) {
        const heights = await Promise.all((await scope.getByRole("radio").all()).map(async (r) => Math.round((await r.boundingBox()).height)))
        expect.equal(heights.join(","), "40,40,40,40,40,40,44,44,44", "option heights on touch")
      },
    },
    {
      name: "Focus shows the system's outline in the focus colour, in both themes",
      example: "views",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        await page.keyboard.press("Tab")
        const o = await scope.getByRole("radio", { name: "Week" }).evaluate((el) => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth, color: getComputedStyle(el).outlineColor }))
        expect.equal(o.style, "solid", "outline style")
        expect.equal(o.width, "2px", "outline width")
        expect.equal(o.color, await colourOf(page, "focus"), "outline colour")
      },
    },
    {
      name: "The selection slides to the chosen option",
      example: "views",
      async run({ page, scope, expect }) {
        const thumb = scope.locator('[data-slot="segmented-control-thumb"]')
        const before = await thumb.evaluate((el) => ({ display: getComputedStyle(el).display, property: getComputedStyle(el).transitionProperty, duration: parseFloat(getComputedStyle(el).transitionDuration), x: el.getBoundingClientRect().x }))
        expect.equal(before.display, "block", "the thumb is drawn")
        expect(before.property.includes("transform") && before.duration > 0, "it transitions its position")
        await scope.getByRole("radio", { name: "Month" }).click()
        await page.waitForTimeout(400)
        const after = await thumb.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, width: r.width } })
        const month = await scope.getByRole("radio", { name: "Month" }).boundingBox()
        expect.equal(Math.round(after.x), Math.round(month.x), "the thumb ends under Month")
        expect.equal(Math.round(after.width), Math.round(month.width), "and is exactly as wide")
        expect(after.x > before.x, "it moved right")
      },
    },
    {
      name: "Under reduced motion nothing slides: the chosen option fades in on its own",
      example: "views",
      reducedMotion: true,
      async run({ page, scope, expect }) {
        expect.equal(await scope.locator('[data-slot="segmented-control-thumb"]').evaluate((el) => getComputedStyle(el).display), "none", "no sliding thumb")
        const week = await scope.getByRole("radio", { name: "Week" }).evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, property: getComputedStyle(el).transitionProperty }))
        expect.equal(week.bg, await colourOf(page, "surface"), "the chosen option carries the surface itself")
        expect(week.property.includes("background-color"), "it fades between options")
      },
    },
    {
      name: "In forced colours the chosen option is outlined, and nothing else draws an outline at rest",
      example: "views",
      forcedColors: true,
      async run({ scope, expect }) {
        const styles = await Promise.all((await scope.getByRole("radio").all()).map((r) => r.evaluate((el) => getComputedStyle(el).outlineStyle)))
        expect.equal(styles.join(","), "none,solid,none", "outline styles for Day, Week, Month")
      },
    },
    {
      name: "Disabled takes the whole control out of the tab order",
      example: "disabled",
      async run({ scope, expect }) {
        for (const r of await scope.getByRole("radio").all()) expect(await r.isDisabled(), "each option is disabled")
        expect.equal(await scope.getByRole("radiogroup").getAttribute("tabindex"), "-1", "the group takes no focus")
      },
    },
  ],
}
