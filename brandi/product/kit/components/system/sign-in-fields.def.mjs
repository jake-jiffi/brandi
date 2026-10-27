// SignInFields' one definition: its README, its preview board and its scripted checks all come from here.

const card = (inner, title) =>
  `<div style="box-sizing: border-box; padding: 24px; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface);">\n<p style="margin: 0 0 20px; font: 700 16px/24px var(--font-sans); color: var(--text-strong);">${title}</p>\n${inner}\n</div>`
const fields = (props) => `<x-import component-from-global-scope="NS.SignInFields" ${props}></x-import>`

const slots = (scope) => scope.locator('[data-slot="code-slot"]').allTextContents().then((all) => all.map((t) => t.trim() || "_").join(""))

export default {
  name: "SignInFields",
  group: "Inputs",
  job: "The fields of a sign-in: an email and a password with show and hide, a new password, or a one-time code.",
  status: "to build",
  props: [
    { name: "mode", type: '"password" | "new-password" | "code"', default: '"password"', doc: "password: an email and the current password. new-password: an email and a new password, with its rule. code: a one-time code." },
    { name: "emailError", type: "ReactNode", doc: "What is wrong with the email and how to fix it." },
    { name: "passwordError", type: "ReactNode", doc: "What is wrong with the password and how to fix it." },
    { name: "codeError", type: "ReactNode", doc: "What is wrong with the code and how to fix it." },
    { name: "defaultEmail", type: "string", doc: "The email to start with, such as the one used last time." },
    { name: "passwordRule", type: "string", doc: "The rule a new password meets, shown under it. At least 12 characters by default." },
    { name: "minLength", type: "number", default: "12", doc: "The shortest new password accepted." },
    { name: "codeLength", type: "number", default: "6", doc: "Digits in the code, from 4 to 8." },
    { name: "sentTo", type: "string", doc: "Where the code was sent, for the code's hint: [name]@example.com." },
    { name: "forgotHref", type: "string", doc: "Where to reset a forgotten password. Adds the link under the password." },
    { name: "onCodeComplete", type: "(code: string) => void", doc: "Called once every box of the code is filled, so the page can check it without a button press." },
    { name: "onChange", type: "(values: { email: string; password: string; code: string }) => void", doc: "Called with the fields' values as the person types." },
    { name: "size", type: '"md" | "lg"', default: '"lg"', doc: "36 or 44px fields; 44 or 48px on a touch screen. Sign-in takes the large size." },
  ],
  notes: {
    Behaviour: [
      "Each field carries the autocomplete token that lets browsers, password managers and phones fill it: email (with an email keyboard), current-password, new-password, and one-time-code (with a number pad).",
      "The password's toggle is named for what it does, Show password, then Hide password. A press keeps focus and the caret where they were, and a screen reader hears whether the password is showing.",
      "Paste is never blocked, anywhere.",
      "The one-time code is drawn as boxes and built as one field, so assistive technology reads it as one input named by its label, the phone offers the code from a message, and pasting fills every box. The box in hand shows the input's focus edge and a caret; Backspace takes the last digit.",
      "Every field sits in a Field, so its label names it and an error says what is wrong and how to fix it, with an icon.",
    ],
    Layout: ["The fields stack 20px apart, at the width the page gives them. The code's boxes are 44px, 48px on touch, 8px apart."],
    States: ["Empty, filled, the password shown and hidden, the code part filled, and each field with its error."],
    Copy: [
      "Labels: Email, Password, New password, Verification code. The code's hint says where it went: Enter the 6-digit code we sent to [name]@example.com.",
      "Errors say what is wrong and how to fix it: That email and password do not match. Check them, or reset your password.",
    ],
    Rules: [
      "The page brings the form, the button and any account links: these are only the fields.",
      "Never block paste, never cap a password below 64 characters, and never ask for a password twice; the toggle lets people check it.",
    ],
    Accepted: [
      "The email field takes autocomplete email, as the default set asks. A product whose sign-in name is not an email changes the label and the token together.",
      "The kit vendors no input-otp primitive (07-starter.md lists the 41 it does), so the code's boxes are drawn here over one plain input, which is the same technique.",
    ],
  },
  examples: [
    {
      id: "modes",
      title: "Signing in, a new password, and a code",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; width: 100%; align-items: start;">
${card(fields('forgot-href="#reset"'), "Sign in to [Product]")}
${card(fields('mode="new-password" default-email="[name]@example.com"'), "Create your account")}
${card(`${fields('mode="code" sent-to="[name]@example.com" on-code-complete="{{codeDone}}"')}\n<p data-code-done="" style="margin: 16px 0 0; font-family: var(--font-sans); font-size: 13px; line-height: 18px; color: var(--text-muted);">{{codeState}}</p>`, "Check your email")}
</div>`,
    },
    {
      id: "errors",
      title: "Errors, and medium fields",
      layout: "block",
      markup: `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; width: 100%; align-items: start;">
${card(fields('default-email="[name]@example" email-error="Enter an email address with an @ and a domain, such as [name]@example.com" password-error="Enter your password"'), "Sign in to [Product]")}
${card(fields('mode="code" sent-to="[name]@example.com" code-error="That code has expired. Request a new one, then enter it here."'), "Check your email")}
${card(fields('size="md" default-email="[name]@example.com" password-error="That email and password do not match. Check them, or reset your password." forgot-href="#reset"'), "Medium fields")}
</div>`,
    },
  ],
  state: { codeState: "The page hears nothing until the code is complete." },
  logic: 'codeState: self.state.codeState, codeDone: (code) => self.setState({ codeState: "Code complete: " + code })',
  frame: { width: 960, height: 1320 },
  checks: [
    {
      name: "Each field carries the autocomplete token and keyboard that lets browsers, managers and phones fill it",
      example: "modes",
      async run({ scope, expect }) {
        const read = (loc) => loc.evaluate((el) => `${el.type}|${el.getAttribute("autocomplete")}|${el.getAttribute("inputmode") ?? "-"}`)
        const [signIn, create, verify] = await scope.locator('[data-slot="sign-in-fields"]').all()
        expect.equal(await read(signIn.getByRole("textbox", { name: "Email" })), "email|email|email", "email, with the email keyboard")
        expect.equal(await read(signIn.getByLabel("Password", { exact: true })), "password|current-password|-", "current-password")
        expect.equal(await read(create.getByLabel("New password", { exact: true })), "password|new-password|-", "new-password")
        expect.equal(await create.getByLabel("New password", { exact: true }).getAttribute("minlength"), "12", "with its minimum length")
        expect.equal(await read(verify.getByRole("textbox", { name: "Verification code" })), "text|one-time-code|numeric", "one-time-code, with the number pad")
      },
    },
    {
      name: "The show-password toggle is named for what it does, keeps focus and the caret, and says which way it went",
      example: "modes",
      async run({ page, scope, expect }) {
        const password = scope.getByLabel("Password", { exact: true })
        await password.click()
        await page.keyboard.type("harbour2026")
        for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowLeft")
        const toggle = scope.locator('[data-slot="sign-in-fields"]').first().getByRole("button", { name: "Show password" })
        // A real press at the toggle, as a person makes it (the toggle sits over the end of the field).
        const at = await toggle.boundingBox()
        await page.mouse.click(at.x + at.width / 2, at.y + at.height / 2)
        expect.equal(await password.getAttribute("type"), "text", "the password shows")
        expect(await password.evaluate((el) => document.activeElement === el), "focus stayed in the field")
        expect.equal(await password.evaluate((el) => `${el.selectionStart},${el.selectionEnd}`), "7,7", "the caret stayed where it was")
        await page.keyboard.type("!")
        expect.equal(await password.inputValue(), "harbour!2026", "typing goes on at the caret")
        const region = scope.locator('[data-slot="password-input"] [aria-live="polite"]').first()
        expect.equal((await region.textContent()).trim(), "Your password is showing.", "a screen reader hears it is showing")
        const hide = scope.locator('[data-slot="sign-in-fields"]').first().getByRole("button", { name: "Hide password" })
        expect.equal(await hide.count(), 1, "the toggle is now named Hide password")
        await hide.focus()
        await page.keyboard.press("Enter")
        expect.equal(await password.getAttribute("type"), "password", "Enter on the toggle hides it again")
        expect.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Show password", "focus stays on the toggle, named for what it will do")
        expect.equal((await region.textContent()).trim(), "Your password is hidden.", "and it says so")
      },
    },
    {
      name: "The code reads as one field, named by its label, with the boxes hidden from screen readers",
      example: "modes",
      async run({ scope, expect }) {
        const verify = scope.locator('[data-slot="sign-in-fields"]').nth(2)
        expect.equal(await verify.getByRole("textbox").count(), 1, "one input")
        const input = verify.getByRole("textbox", { name: "Verification code" })
        expect.equal(await input.getAttribute("maxlength"), null, "no length cap that would cut a pasted code short")
        const hint = await input.evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent.trim())
        expect.equal(hint, "Enter the 6-digit code we sent to [name]@example.com.", "described by where the code went")
        expect.equal(await verify.locator('[data-slot="code-slot"][aria-hidden="true"]').count(), 6, "six boxes, hidden from screen readers")
      },
    },
    {
      name: "Typing fills the boxes in order, Backspace takes the last, and pasting fills every box and says the code is complete",
      example: "modes",
      async run({ page, scope, expect }) {
        const verify = scope.locator('[data-slot="sign-in-fields"]').nth(2)
        const input = verify.getByRole("textbox", { name: "Verification code" })
        await input.click()
        await page.keyboard.type("48a2")
        expect.equal(await slots(verify), "482___", "digits only, in order")
        expect.equal(await verify.locator('[data-slot="code-slot"][data-active]').count(), 1, "one box in hand")
        expect.equal(await verify.locator('[data-slot="code-slot"]').nth(3).getAttribute("data-active"), "true", "the next empty box")
        await page.keyboard.press("Backspace")
        expect.equal(await slots(verify), "48____", "Backspace took the last digit")
        await page.keyboard.press("Backspace")
        await page.keyboard.press("Backspace")
        expect.equal(await slots(verify), "______", "emptied with Backspace")
        await page.keyboard.insertText("917 302")
        expect.equal(await slots(verify), "917302", "a pasted code, spaces and all, fills every box")
        await page.keyboard.type("55")
        expect.equal(await slots(verify), "917302", "and nothing past the last box")
        await page.keyboard.press("ControlOrMeta+A")
        await page.keyboard.press("Backspace")
        expect.equal(await slots(verify), "______", "selecting the whole code and pressing Backspace clears it all")
        expect.equal((await scope.locator("[data-code-done]").textContent()).trim(), "Code complete: 917302", "and the page hears the code is complete")
      },
    },
    {
      name: "Paste is never blocked: a password pasted from a manager goes in",
      example: "modes",
      async run({ page, scope, expect }) {
        const password = scope.getByLabel("Password", { exact: true })
        const blocked = await password.evaluate((el) => {
          const data = new DataTransfer()
          data.setData("text/plain", "correct-horse-battery")
          const event = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true })
          el.dispatchEvent(event)
          return event.defaultPrevented
        })
        expect.equal(blocked, false, "nothing cancels a paste")
        await password.focus()
        await page.keyboard.insertText("correct-horse-battery")
        expect.equal(await password.inputValue(), "correct-horse-battery", "the pasted password is in the field")
      },
    },
    {
      name: "Each field's error says what is wrong, with an icon, and the field is invalid",
      example: "errors",
      async run({ scope, expect }) {
        const first = scope.locator('[data-slot="sign-in-fields"]').first()
        const email = first.getByRole("textbox", { name: "Email" })
        expect.equal(await email.getAttribute("aria-invalid"), "true", "the email is invalid")
        const read = await email.evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent.trim())
        expect.equal(read, "Enter an email address with an @ and a domain, such as [name]@example.com", "described by its error")
        expect.equal(await first.getByLabel("Password", { exact: true }).getAttribute("aria-invalid"), "true", "the password too")
        const code = scope.locator('[data-slot="sign-in-fields"]').nth(1)
        expect.equal(await code.getByRole("textbox", { name: "Verification code" }).getAttribute("aria-invalid"), "true", "the code is invalid")
        expect.equal(await code.locator('[data-slot="code-slot"].border-danger').count(), 6, "and every box takes the danger edge")
        expect.equal(await scope.locator('[data-slot="field-error"] svg').count(), 4, "every error carries an icon")
      },
    },
    {
      name: "The box in hand shows the focus edge, 2px in the focus colour, in both themes",
      example: "modes",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const verify = scope.locator('[data-slot="sign-in-fields"]').nth(2)
        await verify.getByRole("textbox", { name: "Verification code" }).focus()
        await page.keyboard.type("4")
        const look = await verify.locator('[data-slot="code-slot"][data-active]').evaluate((el) => {
          const s = getComputedStyle(el)
          const probe = document.createElement("span")
          document.body.append(probe)
          probe.style.color = "var(--focus)"
          const focus = getComputedStyle(probe).color
          probe.remove()
          return { border: s.borderTopColor, shadow: s.boxShadow, focus }
        })
        expect.equal(look.border, look.focus, "the border in the focus colour")
        expect(look.shadow.includes(look.focus) && /0px 0px 0px 1px/.test(look.shadow), "plus a 1px ring, a 2px edge")
      },
    },
    {
      name: "Touch: 48px fields with 16px text, a 40px toggle and 48px code boxes",
      example: "modes",
      touch: true,
      async run({ scope, expect }) {
        const email = scope.locator('[data-slot="sign-in-fields"]').first().getByRole("textbox", { name: "Email" })
        expect.equal(await email.evaluate((el) => `${Math.round(el.getBoundingClientRect().height)}/${getComputedStyle(el).fontSize}`), "48/16px", "a 48px field with 16px text")
        const toggle = await scope.getByRole("button", { name: "Show password" }).first().boundingBox()
        expect.atLeast(Math.round(Math.min(toggle.width, toggle.height)), 40, "a 40px toggle")
        const box = await scope.locator('[data-slot="code-slot"]').first().boundingBox()
        expect.atLeast(Math.round(box.width), 48, "48px code boxes")
      },
    },
    {
      name: "Forced colours keep the box in hand outlined and the input's own text hidden",
      example: "modes",
      forcedColors: true,
      async run({ page, scope, expect }) {
        const verify = scope.locator('[data-slot="sign-in-fields"]').nth(2)
        const input = verify.getByRole("textbox", { name: "Verification code" })
        await input.focus()
        await page.keyboard.type("12")
        const look = await verify.evaluate((el) => ({
          slot: getComputedStyle(el.querySelector('[data-slot="code-slot"][data-active]')).outlineStyle,
          text: getComputedStyle(el.querySelector("input")).color,
        }))
        expect.equal(look.slot, "solid", "the box in hand is outlined")
        expect.equal(look.text, "rgba(0, 0, 0, 0)", "the input's own text stays hidden behind the boxes")
      },
    },
  ],
}
