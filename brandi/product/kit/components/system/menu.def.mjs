// Menu's one definition: its README, its preview board and its scripted checks all come from here.

// An overlay is ready for keys once it has finished opening. Radix registers a layer's Escape and focus
// handling in effects that run a beat after it shows, and on a busy machine a key sent in between
// reaches the layer beneath, so a check waits for the opening animation and two frames first.
const ready = async (locator) => {
  await locator.waitFor()
  await locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
  await locator.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}

// NS. names the bundle's own global. Never walk window's properties to find it: on the canvas a board
// runs in a frame whose parent is another origin, and reading a property of that parent throws.
const ns = `{ Button: NS.Button }`

// The action in hand is the focused menu item; its label has its own slot. Radix moves focus in a
// timeout, so a check waits for the action it expects rather than reading straight after a key press.
const waitInHand = (page, label) =>
  page
    .waitForFunction(
      (want) => {
        const el = document.activeElement
        return Boolean(el?.getAttribute("role")?.startsWith("menuitem")) && el.querySelector("[data-slot=menu-action-label]")?.textContent === want
      },
      label,
      { timeout: 5000 }
    )
    .then(() => true, () => false)
const luminance = (rgb) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).map(Number)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}
// Waits for an element's animations to finish, so a measurement sees where it comes to rest.
const settled = (locator) => locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
const OVERFLOW = "More actions for [Invoice 1042]"

async function openByKeyboard(page, scope) {
  await scope.getByRole("button", { name: OVERFLOW }).focus()
  await page.keyboard.press("Enter")
  const menu = page.getByRole("menu", { name: OVERFLOW })
  await ready(menu)
  return menu
}

const pictureItems = [
  { label: "Edit", icon: "Pencil", shortcut: "E" },
  { label: "Duplicate", icon: "Copy", shortcut: "D" },
  { label: "Download PDF", icon: "Download", description: "With the payment link on it" },
  { label: "Mark as sent", icon: "Send", disabled: true },
  "separator",
  { label: "Delete invoice", icon: "Trash2", danger: true },
]

export default {
  name: "Menu",
  group: "Overlays",
  job: "Actions on one thing, opened from an overflow button or any trigger.",
  status: "proven",
  types: [
    "type MenuAction = { label: string; icon?: IconName; description?: string; shortcut?: string; danger?: boolean; disabled?: boolean; checked?: boolean; onSelect?: () => void }",
    'type MenuEntry = MenuAction | "separator" | { group: string }',
  ],
  props: [
    { name: "items", type: "Array<MenuAction | \"separator\" | { group: string }>", doc: "Each action is { label, icon, description, shortcut, danger, disabled, checked, onSelect }. Six or fewer is best." },
    { name: "trigger", type: "ReactElement", doc: "What opens it, such as a Button. Without one, a ghost icon button with three dots. On a canvas, built in the board's script." },
    { name: "label", type: "string", doc: "Names the trigger: More actions for [record]. Needed when the trigger has no text." },
    { name: "align", type: "\"start\" | \"center\" | \"end\"", default: "\"end\"", doc: "Which edge of the trigger it lines up with." },
    { name: "placement", type: "\"top\" | \"right\" | \"bottom\" | \"left\"", default: "\"bottom\"", doc: "The side it prefers. It flips to stay on screen." },
    { name: "inline", type: "boolean", default: "false", doc: "Draws the open menu in place, with no trigger and no portal, for a design on a canvas." },
    { name: "open", type: "boolean", default: "false", doc: "Shows it open under its trigger, for a design on a canvas: a still picture with no live layer, so the board keeps its Escape key and its tab order." },
  ],
  notes: {
    Behaviour: [
      "Opens in a portal, never clipped by a table or card, and flips to stay on screen. It copies the theme of its trigger.",
      "From the keyboard, focus moves to the first action. Up, Down, Home and End move, typing a letter moves to the action that starts with it, and Enter chooses.",
      "An action's single-key shortcut runs it while the menu is open, unless Root turns single-key shortcuts off.",
      "Escape closes it at once, with no exit animation that would keep it live, and focus is back on the trigger the moment it closes. Disabled actions stay visible, are skipped and do nothing.",
      "An action that opens a confirmation hands focus back to the menu's trigger when the confirmation closes.",
      "Drawn for a design (inline or open), it is a still picture with no live layer, so the board keeps its Escape key and gains no hidden tab stops.",
    ],
    States: [
      "The action in hand takes the hover tint and a 1px control edge, with a 2px focus ring drawn inside it from the keyboard.",
      "A checked action shows a check in the icon's place. Destructive actions are in danger text.",
    ],
    Copy: ["Actions are verbs, one to three words, in sentence case: Download PDF, Move to folder, Delete invoice."],
    Rules: [
      "Six actions or fewer is best. Destructive actions go last, after a separator, and open a confirmation.",
      "Group labels only when there are two kinds of action. A menu is for actions; a choice of value is a Select.",
    ],
    Review: ["Tab out of an open menu jumped to the top of the page (round 2).", "The action in hand needed a visible edge and a 2px ring (round 3)."],
    Accepted: [
      "Tab inside an open menu keeps focus in the menu, as the menu library does. Escape and a choice both close it, so it is safe from the keyboard, and overriding the library would break on its next release.",
    ],
  },
  frame: { width: 960, height: 900 },
  examples: [
    {
      id: "overflow",
      title: "From an overflow button",
      markup: `<x-import component-from-global-scope="NS.Menu" label="${OVERFLOW}" items="{{overflowItems}}"></x-import>
<p style="margin: 0; color: var(--text-muted);" data-menu-output="">Last chosen: {{chose}}</p>
<x-import component-from-global-scope="NS.Dialog" open="{{confirm}}" on-close="{{closeConfirm}}" width="{{w400}}" title="Delete [Invoice 1042]?" description="It goes for good, with its payment history." footer="{{ui.confirmFooter}}"></x-import>`,
      vals: { w400: 400 },
    },
    {
      id: "trigger",
      title: "From any trigger, with a choice that keeps its check",
      markup: `<x-import component-from-global-scope="NS.Menu" align="start" trigger="{{ui.exportTrigger}}" items="{{exportItems}}"></x-import>`,
    },
    {
      id: "inline",
      title: "Drawn in place, for a design",
      markup: `<x-import component-from-global-scope="NS.Menu" inline="{{yes}}" label="More actions for [Invoice 1044]" items="{{pictureItems}}"></x-import>`,
      vals: { yes: true, pictureItems },
    },
    {
      id: "region",
      title: "Opened from a dark region, it stays dark",
      markup: `<div data-theme="dark" class="dark" style="display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 16px; border-radius: var(--radius-md); background: var(--surface); color: var(--text-strong);">
<span>[Invoice 1045]</span>
<x-import component-from-global-scope="NS.Menu" label="More actions for [Invoice 1045]" items="{{pictureItems}}"></x-import>
</div>`,
    },
    {
      id: "open",
      title: "Shown open at its trigger, for a design",
      // Room under the trigger for the picture, so on a board it never lies over what comes next.
      markup: `<div style="padding-bottom: 280px;"><x-import component-from-global-scope="NS.Menu" open="{{yes}}" align="start" label="More actions for [Invoice 1043]" items="{{pictureItems}}"></x-import></div>`,
    },
  ],
  state: { chose: "nothing yet", format: "csv", confirm: false },
  logic: `ui: (() => {
    const A = ${ns};
    const h = React.createElement;
    return {
      exportTrigger: h(A.Button, { iconRight: "ChevronDown" }, "Export"),
      confirmFooter: h(React.Fragment, null, h(A.Button, { onClick: () => self.setState({ confirm: false }) }, "Cancel"), h(A.Button, { variant: "danger-solid", onClick: () => self.setState({ confirm: false }) }, "Delete invoice")),
    };
  })(),
  chose: self.state.chose,
  confirm: self.state.confirm,
  closeConfirm: () => self.setState({ confirm: false }),
  overflowItems: [
    { label: "Edit", icon: "Pencil", shortcut: "E", onSelect: () => self.setState({ chose: "Edit" }) },
    { label: "Duplicate", icon: "Copy", shortcut: "D", onSelect: () => self.setState({ chose: "Duplicate" }) },
    { label: "Download PDF", icon: "Download", onSelect: () => self.setState({ chose: "Download PDF" }) },
    { label: "Move to folder", icon: "Folder", onSelect: () => self.setState({ chose: "Move to folder" }) },
    { label: "Mark as sent", icon: "Send", disabled: true, onSelect: () => self.setState({ chose: "Mark as sent" }) },
    "separator",
    { label: "Delete invoice", icon: "Trash2", danger: true, onSelect: () => self.setState({ chose: "Delete invoice", confirm: true }) },
  ],
  exportItems: [
    { group: "Format" },
    { label: "CSV", checked: self.state.format === "csv", onSelect: () => self.setState({ format: "csv" }) },
    { label: "PDF", checked: self.state.format === "pdf", onSelect: () => self.setState({ format: "pdf" }) },
    "separator",
    { label: "Email it to me", icon: "Mail", description: "It arrives within a few minutes", onSelect: () => self.setState({ chose: "Email it to me" }) },
  ]`,
  checks: [
    {
      name: "From the keyboard it opens on the first action, and Up, Down, Home and End move, skipping a disabled one",
      example: "overflow",
      async run({ page, scope, expect }) {
        await openByKeyboard(page, scope)
        expect(await waitInHand(page, "Edit"), "Edit is in hand first")
        for (const [key, want, what] of [
          ["ArrowDown", "Duplicate", "Down moves to Duplicate"],
          ["End", "Delete invoice", "End moves to the last action"],
          ["Home", "Edit", "Home moves to the first action"],
          ["ArrowDown", "Duplicate", "Down again"],
          ["ArrowDown", "Download PDF", "and again"],
          ["ArrowDown", "Move to folder", "and again"],
          ["ArrowDown", "Delete invoice", "Down skips the disabled Mark as sent"],
          ["ArrowUp", "Move to folder", "Up skips it too"],
        ]) {
          await page.keyboard.press(key)
          expect(await waitInHand(page, want), what)
        }
      },
    },
    {
      name: "Typing a letter moves to the action that starts with it",
      example: "overflow",
      async run({ page, scope, expect }) {
        await openByKeyboard(page, scope)
        await page.keyboard.press("m")
        expect(await waitInHand(page, "Move to folder"), "m moves to Move to folder")
        await page.keyboard.press("Escape")
      },
    },
    {
      name: "A single-key shortcut runs its action while the menu is open, then the menu closes and focus returns to the trigger",
      example: "overflow",
      async run({ page, scope, expect }) {
        const menu = await openByKeyboard(page, scope)
        await page.keyboard.press("d")
        await menu.waitFor({ state: "hidden" })
        expect.equal(await scope.locator("[data-menu-output]").textContent(), "Last chosen: Duplicate", "the shortcut ran Duplicate")
        expect(await scope.getByRole("button", { name: OVERFLOW }).evaluate((el) => el === document.activeElement), "focus is back on the trigger")
      },
    },
    {
      name: "With single-key shortcuts turned off in Root, a key only moves to the action that starts with it",
      example: "overflow",
      async run({ page, scope, expect }) {
        await page.evaluate(() => (document.documentElement.dataset.shortcuts = "off"))
        const menu = await openByKeyboard(page, scope)
        await waitInHand(page, "Edit")
        await page.keyboard.press("d")
        expect(await waitInHand(page, "Duplicate"), "d moves to Duplicate")
        expect(await menu.isVisible(), "the menu stays open")
        expect.equal(await scope.locator("[data-menu-output]").textContent(), "Last chosen: nothing yet", "nothing ran")
      },
    },
    {
      name: "Enter chooses the action in hand; Escape closes it and returns focus to the trigger",
      example: "overflow",
      async run({ page, scope, expect }) {
        let menu = await openByKeyboard(page, scope)
        await waitInHand(page, "Edit")
        await page.keyboard.press("ArrowDown")
        await waitInHand(page, "Duplicate")
        await page.keyboard.press("ArrowDown")
        expect(await waitInHand(page, "Download PDF"), "Download PDF is in hand")
        await page.keyboard.press("Enter")
        await menu.waitFor({ state: "hidden" })
        expect.equal(await scope.locator("[data-menu-output]").textContent(), "Last chosen: Download PDF", "Enter chose Download PDF")
        menu = await openByKeyboard(page, scope)
        await page.keyboard.press("Escape")
        await menu.waitFor({ state: "hidden" })
        expect(await scope.getByRole("button", { name: OVERFLOW }).evaluate((el) => el === document.activeElement), "focus is back on the trigger")
      },
    },
    {
      name: "Tab in an open menu keeps focus in the menu, never the top of the page (round 2)",
      example: "overflow",
      async run({ page, scope, expect }) {
        const menu = await openByKeyboard(page, scope)
        await page.keyboard.press("Tab")
        expect(await menu.evaluate((m) => m.contains(document.activeElement)), "focus stays in the menu")
        await page.keyboard.press("Escape")
        await menu.waitFor({ state: "hidden" })
        expect(await scope.getByRole("button", { name: OVERFLOW }).evaluate((el) => el === document.activeElement), "and Escape takes it back to the trigger")
      },
    },
    {
      name: "The action in hand takes the hover tint and a control edge, with a 2px ring inside it from the keyboard (round 3)",
      example: "overflow",
      async run({ page, scope, expect }) {
        const menu = await openByKeyboard(page, scope)
        await waitInHand(page, "Edit")
        const look = (el) => {
          const s = getComputedStyle(el)
          return { bg: s.backgroundColor, shadow: s.boxShadow, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineOffset}` }
        }
        const keyed = await page.evaluate(`(${look.toString()})(document.activeElement)`)
        expect(keyed.bg !== "rgba(0, 0, 0, 0)", `the hover tint (${keyed.bg})`)
        expect(keyed.shadow.includes("inset"), `a control edge (${keyed.shadow})`)
        expect.equal(keyed.outline, "solid 2px -2px", "a 2px ring drawn inside it")
        const second = menu.getByRole("menuitem", { name: "Duplicate" })
        await second.hover()
        const hovered = await second.evaluate(look)
        expect(hovered.bg !== "rgba(0, 0, 0, 0)" && hovered.shadow.includes("inset"), "under the pointer it takes the tint and the edge too")
      },
    },
    {
      name: "Actions are 36px tall",
      example: "inline",
      async run({ scope, expect }) {
        for (const label of ["Edit", "Duplicate", "Mark as sent", "Delete invoice"]) {
          expect.equal(Math.round((await scope.getByRole("menuitem", { name: label }).boundingBox()).height), 36, `${label} height`)
        }
      },
    },
    {
      name: "Actions are 44px tall on a touch screen, and the keys hide",
      example: "inline",
      touch: true,
      async run({ scope, expect }) {
        for (const label of ["Edit", "Duplicate", "Delete invoice"]) {
          expect.equal(Math.round((await scope.getByRole("menuitem", { name: label }).boundingBox()).height), 44, `${label} height on touch`)
        }
        expect.equal(await scope.locator("kbd").first().isVisible(), false, "shortcut keys hide on touch")
      },
    },
    {
      name: "A destructive action is in danger text, and a disabled one stays visible",
      example: "inline",
      async run({ scope, expect }) {
        const [colour, danger] = await scope.getByRole("menuitem", { name: "Delete invoice" }).evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.color = "var(--danger)"
          el.appendChild(probe)
          const want = getComputedStyle(probe).color
          probe.remove()
          return [getComputedStyle(el).color, want]
        })
        expect.equal(colour, danger, "Delete invoice's text colour")
        const disabled = scope.getByRole("menuitem", { name: "Mark as sent" })
        expect(await disabled.isVisible(), "Mark as sent is visible")
        expect.equal(await disabled.getAttribute("aria-disabled"), "true", "and says it is disabled")
      },
    },
    {
      name: "A disabled action does nothing when pressed",
      example: "overflow",
      async run({ page, scope, expect }) {
        const menu = await openByKeyboard(page, scope)
        await menu.getByRole("menuitem", { name: "Mark as sent" }).click({ force: true })
        await page.waitForTimeout(200)
        expect(await menu.isVisible(), "the menu stays open")
        expect.equal(await scope.locator("[data-menu-output]").textContent(), "Last chosen: nothing yet", "nothing ran")
      },
    },
    {
      name: "It opens in a portal, outside its example, and flips to stay on screen",
      example: "overflow",
      async run({ page, scope, expect }) {
        // Room above the trigger and almost none below: the menu has to flip to fit.
        await page.evaluate(() => (document.body.style.paddingTop = "480px"))
        const trigger = scope.getByRole("button", { name: OVERFLOW })
        const box = await trigger.boundingBox()
        await page.setViewportSize({ width: 1280, height: Math.ceil(box.y + box.height + 16) })
        await trigger.focus()
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: OVERFLOW })
        await ready(menu)
        expect.equal(await scope.getByRole("menu", { name: OVERFLOW }).count(), 0, "the menu is not inside its example")
        expect.equal(await menu.getAttribute("data-side"), "top", "it flipped above the trigger")
        await settled(menu)
        const m = await menu.boundingBox()
        expect(m.y >= 0 && m.y + m.height <= box.y + 1, "it sits on screen, above the trigger")
      },
    },
    {
      name: "The open menu takes the theme of its trigger",
      example: "overflow",
      themes: ["light", "dark"],
      async run({ page, scope, expect, theme }) {
        const menu = await openByKeyboard(page, scope)
        const l = luminance(await menu.evaluate((el) => getComputedStyle(el).backgroundColor))
        expect(theme === "dark" ? l < 0.25 : l > 0.85, `the menu's surface is ${theme} (luminance ${l.toFixed(2)})`)
      },
    },
    {
      name: "Opened from a dark region of a light page, the menu copies the region's theme",
      example: "region",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "More actions for [Invoice 1045]" }).focus()
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: "More actions for [Invoice 1045]" })
        await ready(menu)
        const l = luminance(await menu.evaluate((el) => getComputedStyle(el).backgroundColor))
        expect(l < 0.25, `the menu's surface is dark (luminance ${l.toFixed(2)})`)
      },
    },
    {
      name: "In forced colours the action in hand stays outlined",
      example: "overflow",
      forcedColors: true,
      async run({ page, scope, expect }) {
        await openByKeyboard(page, scope)
        await waitInHand(page, "Edit")
        expect.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), "solid", "the action in hand's outline")
      },
    },
    {
      name: "inline and open draw still pictures: no live layer takes Escape, and no hidden tab stop appears",
      example: "inline",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("menu", { name: "More actions for [Invoice 1044]" }).count(), 1, "the inline menu sits inside its example")
        const shown = page.locator("[data-example=open]").getByRole("menu", { name: "More actions for [Invoice 1043]" })
        expect(await shown.isVisible(), "the open menu shows under its trigger, inside its example, without a click")
        expect(await page.evaluate(() => document.activeElement === document.body), "focus stayed where it was")
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards on the page")
        await page.evaluate(() => {
          window.__escape = "not pressed"
          document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.__escape = e.defaultPrevented ? "swallowed" : "free" })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escape), "free", "Escape reaches the page")
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "More actions for [Invoice 1042]", "the first Tab lands on the first real control")
      },
    },
    {
      name: "Escape closes it at once, and focus is on the trigger the moment it closes",
      example: "overflow",
      async run({ page, scope, expect }) {
        const menu = await openByKeyboard(page, scope)
        await page.keyboard.press("Escape")
        expect.equal(await menu.count(), 0, "the menu is gone straight away, with no exit animation")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), OVERFLOW, "focus is already on the trigger")
      },
    },
    {
      name: "An action that opens a confirmation hands focus back to the trigger when the confirmation closes",
      example: "overflow",
      async run({ page, scope, expect }) {
        await openByKeyboard(page, scope)
        await page.keyboard.press("End")
        expect(await waitInHand(page, "Delete invoice"), "Delete invoice is in hand")
        await page.keyboard.press("Enter")
        const confirm = page.getByRole("dialog", { name: "Delete [Invoice 1042]?" })
        await ready(confirm)
        expect(await confirm.evaluate((d) => d.contains(document.activeElement)), "focus moved into the confirmation")
        await page.keyboard.press("Escape")
        expect.equal(await confirm.count(), 0, "the confirmation is gone straight away")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), OVERFLOW, "focus is on the menu's trigger, never the page body")
      },
    },
    {
      name: "A checked action shows its check, and choosing another moves it",
      example: "trigger",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Export" }).focus()
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu", { name: "Export" })
        await ready(menu)
        expect.equal(await menu.getByRole("menuitemcheckbox", { name: "CSV" }).getAttribute("aria-checked"), "true", "CSV is checked")
        await menu.getByRole("menuitemcheckbox", { name: "PDF" }).click()
        await menu.waitFor({ state: "hidden" })
        await scope.getByRole("button", { name: "Export" }).click()
        await ready(menu)
        expect.equal(await menu.getByRole("menuitemcheckbox", { name: "PDF" }).getAttribute("aria-checked"), "true", "PDF is checked now")
        expect.equal(await menu.getByRole("menuitemcheckbox", { name: "CSV" }).getAttribute("aria-checked"), "false", "and CSV is not")
      },
    },
  ],
}
