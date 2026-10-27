// TextArea's one definition: its README, its preview board and its scripted checks all come from here.

const row = (inner) => `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`
const field = (label, area, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.TextArea" ${area}></x-import>\n</x-import>`

// Runs in the page: the textarea's edge and the system's colours to compare.
function readEdge(el) {
  const s = getComputedStyle(el)
  const probe = document.createElement("span")
  document.body.append(probe)
  const colour = (role) => ((probe.style.color = `var(--${role})`), getComputedStyle(probe).color)
  const out = { border: s.borderTopColor, width: parseFloat(s.borderTopWidth), shadow: s.boxShadow, outline: s.outlineStyle, focus: colour("focus"), danger: colour("danger") }
  probe.remove()
  return out
}
const twoPx = (e, colour) => e.border === colour && e.width === 1 && e.shadow.includes(colour) && /0px 0px 0px 1px/.test(e.shadow)

export default {
  name: "TextArea",
  group: "Inputs",
  job: "Multi-line text for notes and messages.",
  status: "proven",
  props: [
    { name: "rows", type: "number", doc: "Lines to show. It never starts under 96px, and people can drag it taller." },
    { name: "maxLength", type: "number", doc: "A hard limit. Only then does a count show, read with the field." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and unchangeable. Say why in the Field's hint." },
    { name: "readOnly", type: "boolean", default: "false", doc: "A dashed edge. The hint says where the text comes from." },
    { name: "value, defaultValue, onChange", type: "native", doc: "Every native textarea prop passes through; the ref is the textarea." },
  ],
  notes: {
    Behaviour: [
      "It starts at 96px and resizes vertically.",
      "With a hard limit, the count is read with the field, and a polite live region says so once when the limit is reached, never on every key.",
    ],
    States: ["The same edge as TextInput: a 2px focus edge, a danger edge that stays danger when focused, a dashed edge when read-only."],
    Copy: ["The label says what the text is for: Notes for finance, Message to the [client]."],
    Rules: ["Show a character count only when there is a hard limit. 16px text on touch."],
  },
  examples: [
    {
      id: "basics",
      title: "Default, and with a hard limit",
      layout: "block",
      markup: row(
        [
          field("Notes for finance", 'rows="3" placeholder="[Paid by card on the day]"', ' hint="Finance sees these with the invoice."'),
          field("Message to the [client]", 'rows="3" maxlength="{{limit}}" default-value="Thanks for your order. Your invoice is attached."'),
        ].join("\n")
      ),
      vals: { limit: 200 },
    },
    {
      id: "states",
      title: "Invalid, read-only and disabled",
      layout: "block",
      markup: row(
        [
          field("Reason for the refund", 'rows="3"', ' error="Say why, so the [client] knows what changed"'),
          field("Terms", 'rows="3" readonly="{{yes}}" default-value="Payment is due 14 days from the invoice date."', ' hint="From your invoice settings."'),
          field("Internal note", 'rows="3" disabled="{{yes}}" default-value="[Waiting on the signed quote]"', ' hint="Locked once the job is closed."'),
        ].join("\n")
      ),
      vals: { yes: true },
    },
  ],
  frame: { width: 960, height: 428 },
  checks: [
    {
      name: "It starts at 96px and resizes vertically",
      example: "basics",
      async run({ scope, expect }) {
        const area = scope.getByRole("textbox", { name: "Notes for finance" })
        expect.equal(Math.round((await area.boundingBox()).height), 96, "starts at 96px")
        expect.equal(await area.evaluate((el) => getComputedStyle(el).resize), "vertical", "resizes vertically")
      },
    },
    {
      name: "A count shows only with a hard limit, is read with the field, and the limit is said once",
      example: "basics",
      async run({ scope, expect }) {
        expect.equal(await scope.locator('[data-slot="text-area-count"]').count(), 1, "one count, on the limited field only")
        const message = scope.getByRole("textbox", { name: "Message to the [client]" })
        const read = await message.evaluate((el) => document.getElementById((el.getAttribute("aria-describedby") ?? "").split(" ").pop())?.textContent)
        expect.equal(read, "48 of 200 characters", "the count is read with the field")
        await message.fill("x".repeat(200))
        expect.equal((await scope.locator('[data-slot="text-area-count"]').textContent()).trim(), "200 of 200 characters", "the count follows typing")
        expect.equal((await scope.locator('[data-slot="text-area"] [aria-live="polite"]').textContent()).trim(), "You have reached the limit of 200 characters.", "the limit is announced")
      },
    },
    {
      name: "Focus is a 2px edge, and invalid stays danger when focused, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ page, scope, expect }) {
        const notes = page.getByRole("textbox", { name: "Notes for finance" })
        await notes.focus()
        const e = await notes.evaluate(readEdge)
        expect(twoPx(e, e.focus), `a 2px focus edge (border ${e.border}, ring ${e.shadow})`)
        expect.equal(e.outline, "none", "the edge replaces the outline")
        const reason = scope.getByRole("textbox", { name: "Reason for the refund" })
        await reason.focus()
        const d = await reason.evaluate(readEdge)
        expect(twoPx(d, d.danger), `danger and 2px when focused (border ${d.border}, ring ${d.shadow})`)
      },
    },
    {
      name: "Read-only is a dashed edge; disabled cannot be typed in",
      example: "states",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("textbox", { name: "Terms" }).evaluate((el) => getComputedStyle(el).borderTopStyle), "dashed", "a dashed edge")
        expect(await scope.getByRole("textbox", { name: "Internal note" }).isDisabled(), "disabled")
      },
    },
    {
      name: "Touch: 16px text",
      example: "basics",
      touch: true,
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("textbox").first().evaluate((el) => getComputedStyle(el).fontSize), "16px", "16px text on touch")
      },
    },
  ],
}
