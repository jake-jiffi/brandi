// Dialog's one definition: its README, its preview board and its scripted checks all come from here.

// An overlay is ready for keys once it has finished opening. Radix registers a layer's Escape and focus
// handling in effects that run a beat after it shows, and on a busy machine a key sent in between
// reaches the layer beneath, so a check waits for the opening animation and two frames first.
const ready = async (locator) => {
  await locator.waitFor()
  await locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
  await locator.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
}

// The board builds its footers in script, as a canvas board does, through the bundle's own exports.
const ns = `Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)`

// Waits for an element's animations to finish, so a measurement sees where it comes to rest.
const settled = (locator) => locator.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => null))))
const focusIs = (page, id) => page.waitForFunction((want) => document.activeElement?.id === want, id, { timeout: 5000 }).then(() => true, () => false)
const luminance = (rgb) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).map(Number)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export default {
  name: "Dialog",
  group: "Overlays",
  job: "A focused decision or a short form over the page.",
  status: "proven",
  props: [
    { name: "open", type: "boolean", default: "false", doc: "Shows it. The page owns the state and closes it in onClose." },
    { name: "inline", type: "boolean", default: "false", doc: "Draws it in place, with no scrim, portal or focus trap, for a design on a canvas." },
    { name: "title", type: "ReactNode", doc: "For a confirmation, a question with the thing and the count: Delete 3 draft invoices?" },
    { name: "description", type: "ReactNode", doc: "One or two sentences under the title: what happens, and to what." },
    { name: "footer", type: "ReactNode", doc: "The buttons, secondary then primary. On a canvas, built in the board's script." },
    { name: "footnote", type: "ReactNode", doc: "One line beside the buttons, such as what is recorded." },
    { name: "onClose", type: "() => void", doc: "Escape, the close button and a click on the scrim call it." },
    { name: "width", type: "400 | 520 | 720", default: "520", doc: "Its widest. Full width under 640px, where it rises from the bottom." },
    { name: "scrimClose", type: "boolean", default: "true", doc: "false once a form inside has changes, so a stray click cannot lose them. Escape still closes it." },
    { name: "headingLevel", type: "2 | 3 | 4", default: "2", doc: "The title's heading level, so no page or board skips one." },
    { name: "returnFocus", type: "RefObject<HTMLElement>", doc: "Where focus goes on close when nothing had focus as it opened, such as a dialog a shortcut opened." },
    { name: "children", type: "ReactNode", doc: "The body: up to five fields, or the before and after of a change." },
  ],
  notes: {
    Behaviour: [
      "Focus moves to the first control inside and stays there: Tab and Shift Tab wrap within the dialog.",
      "Escape, the close button and a click on the scrim cancel it. Focus goes back to what opened it, or to returnFocus when nothing had focus, unless something else has taken focus by then.",
      "Escape closes only the top layer: a menu inside the dialog closes first, then the dialog.",
      "It fades in and closes at once: an exit animation would keep it live, and swallow an Escape meant for the layer beneath. Focus is back on the opener the moment it closes, and a dialog opened from a menu's action hands focus to the menu's trigger.",
      "It opens in a portal above everything, and copies the theme of the place it opened from where that differs from the page's. Drawn inline for a design, it has no live layer at all.",
    ],
    Layout: [
      "Centred over the scrim on a wide screen. Under 640px of screen it rises from the bottom, full width, with its buttons stacked full width in reading order and clear of the phone's safe area.",
      "Drawn in place, it measures its container instead, so a phone-width board shows the phone form.",
    ],
    Copy: [
      "The primary repeats the verb with the count: Delete 3 invoices. Never OK or Yes.",
      "The secondary says what staying means: Cancel, or Keep editing.",
    ],
    Rules: [
      "It is the heaviest feedback there is, so it comes last: if the action can be undone, do it and offer Undo instead.",
      "A destructive confirm uses danger-solid. A change to a customer's account shows the before and after, and says what is recorded.",
      "Up to five fields fit a dialog; longer edits take a Sheet or a page. Never a dialog on a dialog.",
    ],
    Review: ["It neither trapped nor returned focus (round 1).", "The starter's backdrop blur came out (round 4)."],
  },
  frame: { width: 960, height: 960 },
  examples: [
    {
      id: "confirm",
      title: "A confirmation",
      markup: `<x-import component-from-global-scope="NS.Dialog" inline="{{yes}}" heading-level="{{h3}}" width="{{w400}}" title="Delete 3 draft invoices?" description="[Invoice 1042], [Invoice 1043] and [Invoice 1044] go for good. None of them has been sent." footer="{{ui.deleteFooter}}"></x-import>`,
      vals: { yes: true, h3: 3, w400: 400 },
    },
    {
      id: "change",
      title: "A change to an account, with what is recorded",
      markup: `<x-import component-from-global-scope="NS.Dialog" inline="{{yes}}" heading-level="{{h3}}" title="Change the billing email?" description="Invoices for [Muddy Paws Grooming] go to the new address from the next run." footnote="The change is recorded in the client's history." footer="{{ui.changeFooter}}">
<dl style="margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 8px 24px;">
<dt style="color: var(--text-muted);">Now</dt><dd style="margin: 0; color: var(--text-strong);">[accounts@muddypaws.example]</dd>
<dt style="color: var(--text-muted);">From the next run</dt><dd style="margin: 0; color: var(--text-strong);">[billing@muddypaws.example]</dd>
</dl>
</x-import>`,
    },
    {
      id: "phone",
      title: "On a phone",
      width: 375,
      markup: `<x-import component-from-global-scope="NS.Dialog" inline="{{yes}}" heading-level="{{h3}}" title="Discard your changes?" description="Your edits to [Invoice 1042] have not been saved." footer="{{ui.discardFooter}}"></x-import>`,
    },
    {
      id: "live",
      title: "Open one",
      markup: `<x-import component-from-global-scope="NS.Button" id="dialog-share-button" icon="Share2" on-click="{{openShare}}">Share [Invoice 1042]</x-import>
<x-import component-from-global-scope="NS.Button" icon="Pencil" on-click="{{openEdit}}">Edit the reference</x-import>
<x-import component-from-global-scope="NS.Button" variant="ghost" icon="Keyboard" on-click="{{openBlind}}">Show shortcuts</x-import>
<x-import component-from-global-scope="NS.Dialog" open="{{share}}" on-close="{{closeShare}}" title="Share [Invoice 1042]" description="Anyone with the link can view the invoice and pay it." footer="{{ui.shareFooter}}">
<div style="display: flex; align-items: center; gap: 12px; padding: 4px 4px 4px 12px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--surface-subtle);">
<span style="flex: 1; min-width: 0; overflow-wrap: anywhere; color: var(--text-strong);">[pay.example/i/1042]</span>
<x-import component-from-global-scope="NS.Menu" label="Link options" items="{{linkItems}}"></x-import>
</div>
</x-import>
<x-import component-from-global-scope="NS.Dialog" open="{{edit}}" on-close="{{closeEdit}}" scrim-close="{{no}}" title="Edit the reference" description="Clients see the reference on the invoice and in their bank." footer="{{ui.editFooter}}">
<input aria-label="Reference" value="[INV-1042-MARCH]" style="box-sizing: border-box; width: 100%; height: 36px; padding: 0 12px; border: 1px solid var(--line-control); border-radius: var(--radius-control); background: var(--surface); color: var(--text-strong); font: inherit;">
</x-import>
<x-import component-from-global-scope="NS.Dialog" open="{{blind}}" on-close="{{closeBlind}}" return-focus="{{returnTarget}}" width="{{w400}}" title="Keyboard shortcuts" description="Press ? anywhere to see these again." footer="{{ui.blindFooter}}"></x-import>`,
      vals: {
        no: false,
        linkItems: [
          { label: "Copy link", icon: "Copy", shortcut: "C" },
          { label: "Email the link", icon: "Mail" },
          "separator",
          { label: "Turn off the link", icon: "Ban", danger: true },
        ],
      },
    },
  ],
  state: { share: false, edit: false, blind: false },
  logic: `ui: (() => {
    const A = ${ns};
    const h = React.createElement;
    const F = React.Fragment;
    return {
      deleteFooter: h(F, null, h(A.Button, null, "Cancel"), h(A.Button, { variant: "danger-solid" }, "Delete 3 invoices")),
      changeFooter: h(F, null, h(A.Button, null, "Cancel"), h(A.Button, { variant: "primary" }, "Change email")),
      discardFooter: h(F, null, h(A.Button, null, "Keep editing"), h(A.Button, { variant: "danger-solid" }, "Discard changes")),
      shareFooter: h(A.Button, { variant: "primary", onClick: () => self.setState({ share: false }) }, "Done"),
      editFooter: h(F, null, h(A.Button, { onClick: () => self.setState({ edit: false }) }, "Cancel"), h(A.Button, { variant: "primary", onClick: () => self.setState({ edit: false }) }, "Save reference")),
      blindFooter: h(A.Button, { variant: "primary", onClick: () => self.setState({ blind: false }) }, "Done"),
    };
  })(),
  share: self.state.share,
  edit: self.state.edit,
  blind: self.state.blind,
  openShare: () => self.setState({ share: true }),
  closeShare: () => self.setState({ share: false }),
  openEdit: () => self.setState({ edit: true }),
  closeEdit: () => self.setState({ edit: false }),
  openBlind: () => { if (document.activeElement) document.activeElement.blur(); self.setState({ blind: true }); },
  closeBlind: () => self.setState({ blind: false }),
  returnTarget: { get current() { return document.getElementById("dialog-share-button"); } }`,
  checks: [
    {
      name: "Focus moves into the dialog, and Tab and Shift Tab wrap inside it",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Share [Invoice 1042]" }).focus()
        await page.keyboard.press("Enter")
        const dialog = page.getByRole("dialog", { name: "Share [Invoice 1042]" })
        await ready(dialog)
        const inside = () => dialog.evaluate((d) => d.contains(document.activeElement))
        expect(await inside(), "focus moved into the dialog")
        const stops = await dialog.evaluate((d) => d.querySelectorAll("button, [href], input").length)
        for (let i = 0; i <= stops; i++) {
          await page.keyboard.press("Tab")
          expect(await inside(), `focus is still inside after Tab ${i + 1}`)
        }
        for (let i = 0; i <= stops; i++) {
          await page.keyboard.press("Shift+Tab")
          expect(await inside(), `focus is still inside after Shift Tab ${i + 1}`)
        }
      },
    },
    {
      name: "Escape closes a menu inside the dialog first, then the dialog: nothing swallows the second Escape",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Share [Invoice 1042]" }).focus()
        await page.keyboard.press("Enter")
        const dialog = page.getByRole("dialog", { name: "Share [Invoice 1042]" })
        await ready(dialog)
        const trigger = dialog.getByRole("button", { name: "Link options" })
        await trigger.focus()
        await page.keyboard.press("Enter")
        const menu = page.getByRole("menu")
        await ready(menu)
        await page.keyboard.press("Escape")
        expect.equal(await menu.count(), 0, "the menu is gone straight away")
        expect(await trigger.evaluate((el) => el === document.activeElement), "focus is already back on the menu's trigger")
        expect(await dialog.waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false), "the dialog stays open")
        // A frame later, as a quick second press would come: no fading layer is left to swallow it.
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
        await page.keyboard.press("Escape")
        expect.equal(await page.locator("[data-slot=dialog-overlay]").count(), 0, "the second Escape closed the dialog straight away")
        expect.equal(await page.evaluate(() => document.activeElement?.id), "dialog-share-button", "focus is on the opener")
      },
    },
    {
      name: "Focus returns to the button that opened it",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Share [Invoice 1042]" }).focus()
        await page.keyboard.press("Enter")
        const dialog = page.getByRole("dialog", { name: "Share [Invoice 1042]" })
        await ready(dialog)
        await page.keyboard.press("Escape")
        await dialog.waitFor({ state: "hidden" })
        expect(await focusIs(page, "dialog-share-button"), "focus is back on Share [Invoice 1042]")
      },
    },
    {
      name: "Focus goes to the return target when nothing had focus as it opened",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Show shortcuts" }).click()
        const dialog = page.getByRole("dialog", { name: "Keyboard shortcuts" })
        await ready(dialog)
        expect(await dialog.evaluate((d) => d.contains(document.activeElement)), "focus moved into the dialog")
        await page.keyboard.press("Escape")
        await dialog.waitFor({ state: "hidden" })
        expect(await focusIs(page, "dialog-share-button"), "focus went to the return target, never the page body")
      },
    },
    {
      name: "A click on the scrim closes it, unless a form inside has changes",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Share [Invoice 1042]" }).click()
        const share = page.getByRole("dialog", { name: "Share [Invoice 1042]" })
        await ready(share)
        await settled(share)
        await page.mouse.click(8, 8)
        await share.waitFor({ state: "hidden" })
        expect(await focusIs(page, "dialog-share-button"), "focus is back on the opener after the scrim closed it")
        await scope.getByRole("button", { name: "Edit the reference" }).click()
        const edit = page.getByRole("dialog", { name: "Edit the reference" })
        await ready(edit)
        await settled(edit)
        await page.mouse.click(8, 8)
        await page.waitForTimeout(400)
        expect(await edit.isVisible(), "scrimClose false keeps it open")
      },
    },
    {
      name: "On a phone it rises from the bottom, full width, buttons stacked in reading order clear of the safe area",
      example: "live",
      touch: true,
      viewport: { width: 390, height: 844 },
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Edit the reference" }).click()
        const dialog = page.getByRole("dialog", { name: "Edit the reference" })
        await ready(dialog)
        await settled(dialog)
        const box = await dialog.boundingBox()
        expect(Math.abs(box.y + box.height - 844) <= 1, `it sits on the bottom edge (bottom at ${box.y + box.height})`)
        expect(Math.abs(box.width - 390) <= 1, `it is full width (${box.width}px)`)
        const buttons = await dialog.locator("[data-slot=dialog-footer] button").all()
        expect.equal(buttons.length, 2, "two footer buttons")
        const [a, b] = await Promise.all(buttons.map((el) => el.boundingBox()))
        expect.equal(await buttons[0].textContent(), "Cancel", "the first in reading order comes first")
        expect(b.y > a.y && Math.abs(a.x - b.x) < 1 && Math.abs(a.width - b.width) < 1, "they stack, one above the other, the same width")
        expect.atLeast(a.width, 390 - 48 - 1, "each button fills the width inside the padding")
        expect.atLeast(a.height, 44, "touch height")
        const padding = await dialog.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom))
        expect.atLeast(padding, 24, "padding under the buttons")
      },
    },
    {
      name: "The scrim has no backdrop blur (round 4)",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Share [Invoice 1042]" }).click()
        await ready(page.getByRole("dialog", { name: "Share [Invoice 1042]" }))
        const blur = await page.locator("[data-slot=dialog-overlay]").evaluate((el) => getComputedStyle(el).backdropFilter)
        expect.equal(blur, "none", "backdrop-filter on the scrim")
      },
    },
    {
      name: "The open dialog takes the theme of the page it opened from",
      example: "live",
      themes: ["light", "dark"],
      async run({ page, scope, expect, theme }) {
        await scope.getByRole("button", { name: "Share [Invoice 1042]" }).click()
        const dialog = page.getByRole("dialog", { name: "Share [Invoice 1042]" })
        await ready(dialog)
        const l = luminance(await dialog.evaluate((el) => getComputedStyle(el).backgroundColor))
        expect(theme === "dark" ? l < 0.25 : l > 0.85, `the dialog's surface is ${theme} (luminance ${l.toFixed(2)})`)
      },
    },
    {
      name: "Escape closes it at once, and focus is on the opener the moment it closes",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Share [Invoice 1042]" }).focus()
        await page.keyboard.press("Enter")
        const dialog = page.getByRole("dialog", { name: "Share [Invoice 1042]" })
        await ready(dialog)
        await page.keyboard.press("Escape")
        expect.equal(await page.locator("[data-slot=dialog-overlay]").count(), 0, "the dialog and its scrim are gone straight away, with no exit animation")
        expect.equal(await page.evaluate(() => document.activeElement?.id), "dialog-share-button", "focus is already on the opener, never the page body")
      },
    },
    {
      name: "A dialog drawn inline for a design takes no Escape and adds no tab stop",
      example: "confirm",
      async run({ page, expect }) {
        expect.equal(await page.locator("[data-radix-focus-guard]").count(), 0, "no focus guards on the page")
        await page.evaluate(() => {
          window.__escape = "not pressed"
          document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.__escape = e.defaultPrevented ? "swallowed" : "free" })
        })
        await page.keyboard.press("Escape")
        expect.equal(await page.evaluate(() => window.__escape), "free", "Escape reaches the page")
      },
    },
    {
      name: "Switching the page's theme while it is open switches the dialog too",
      example: "live",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Share [Invoice 1042]" }).click()
        const dialog = page.getByRole("dialog", { name: "Share [Invoice 1042]" })
        await ready(dialog)
        await page.evaluate(() => {
          document.documentElement.dataset.theme = "dark"
          document.documentElement.classList.add("dark")
        })
        const l = luminance(await dialog.evaluate((el) => getComputedStyle(el).backgroundColor))
        expect(l < 0.25, `the open dialog followed the page to dark (luminance ${l.toFixed(2)})`)
      },
    },
    {
      name: "The close button is 32px, 40px on a touch screen",
      example: "confirm",
      async run({ scope, expect }) {
        const box = await scope.getByRole("button", { name: "Close" }).boundingBox()
        expect.equal(Math.round(box.height), 32, "close button height")
      },
    },
    {
      name: "On a touch screen the close button and the footer buttons are 40px at least",
      example: "confirm",
      touch: true,
      async run({ scope, expect }) {
        for (const button of await scope.getByRole("button").all()) expect.atLeast((await button.boundingBox()).height, 40, `${await button.textContent() || "Close"} height`)
      },
    },
    {
      name: "headingLevel sets the title's level",
      example: "confirm",
      async run({ scope, expect }) {
        expect.equal(await scope.locator("h3", { hasText: "Delete 3 draft invoices?" }).count(), 1, "the title is an h3")
        expect.equal(await scope.getByRole("dialog", { name: "Delete 3 draft invoices?" }).count(), 1, "the dialog is named by its title")
      },
    },
  ],
}
