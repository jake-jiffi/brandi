// TextInput's one definition: its README, its preview board and its scripted checks all come from here.

const row = (inner) => `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 24px; width: 100%;">\n${inner}\n</div>`
const field = (label, input, extra = "") => `<x-import component-from-global-scope="NS.Field" label="${label}"${extra}>\n<x-import component-from-global-scope="NS.TextInput" ${input}></x-import>\n</x-import>`

// Runs in the page: the edge a control draws (on its wrapper when it has one), and the system's colours to compare.
function readEdge(el) {
  const box = el.closest('[data-slot="text-input"], [data-slot="search-field"], [data-slot="number-input"]') ?? el
  const s = getComputedStyle(box)
  const probe = document.createElement("span")
  document.body.append(probe)
  const colour = (role) => ((probe.style.color = `var(--${role})`), getComputedStyle(probe).color)
  const out = { border: s.borderTopColor, width: parseFloat(s.borderTopWidth), style: s.borderTopStyle, shadow: s.boxShadow, outline: s.outlineStyle, fill: s.backgroundColor, focus: colour("focus"), danger: colour("danger") }
  probe.remove()
  let up = box.parentElement
  while (up && /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(up).backgroundColor)) up = up.parentElement
  out.behind = up ? getComputedStyle(up).backgroundColor : "rgb(255, 255, 255)"
  return out
}

const channel = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/[\d.]+/g).map(Number)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
// A 2px edge: the 1px border in the colour, plus a 1px ring in the same colour.
const twoPx = (e, colour) => e.border === colour && e.width === 1 && e.shadow.includes(colour) && /0px 0px 0px 1px/.test(e.shadow)

export default {
  name: "TextInput",
  group: "Inputs",
  job: "A single-line field.",
  status: "proven",
  props: [
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', doc: "32, 36 or 44px tall; 40, 44 or 48px on a touch screen, always with 16px text there." },
    { name: "icon", type: "IconName", doc: "An icon at the start, in the muted text colour." },
    { name: "prefix", type: "ReactNode", doc: "Text before the value, such as $ or https://. Read with the field." },
    { name: "suffix", type: "ReactNode", doc: "Text after the value, such as kg, % or per hour. Read with the field." },
    { name: "invalid", type: "boolean", default: "false", doc: "A danger edge that stays danger when focused. Inside a Field, its error sets this." },
    { name: "disabled", type: "boolean", default: "false", doc: "Faded and unchangeable. Say why in the Field's hint." },
    { name: "readOnly", type: "boolean", default: "false", doc: "A dashed edge and a lock. The hint says where the value comes from and where to change it." },
    { name: "type, inputMode, autoComplete", type: "native", doc: "Set them, so phones show the right keyboard and browsers can fill the field. Every native input prop passes through." },
  ],
  notes: {
    Behaviour: [
      "The prefix and suffix are read with the field, before any hint or error.",
      "A press on the icon, prefix or suffix puts the caret in the field.",
      "The ref is the input, so a Field, an ErrorSummary or a page can focus it.",
    ],
    States: [
      "Focus is a 2px focus edge: the border in focus plus a 1px ring, in place of the outline.",
      "Invalid is a danger edge that stays danger when focused.",
      "Read-only is a dashed edge and a lock. Disabled fades.",
    ],
    Copy: ["A placeholder shows an example ([name]@example.com), never the label or an instruction."],
    Rules: [
      "36px, or 44px on touch with 16px text, so iOS never zooms.",
      "The border is line-control, 3:1 on every surface it sits on.",
      "Set type, inputMode and autoComplete. A read-only value says where it comes from and where to change it.",
      "Put it in a Field, which names it.",
    ],
  },
  examples: [
    {
      id: "sizes",
      title: "Sizes",
      layout: "block",
      markup: row(
        [
          field("Reference", 'size="sm" placeholder="[INV-0042]"'),
          field("Client name", 'autocomplete="organization" placeholder="[Harbour Street Bakery]"'),
          field("Email", 'size="lg" type="email" autocomplete="email" placeholder="[name]@example.com"'),
        ].join("\n")
      ),
    },
    {
      id: "adornments",
      title: "Icon, prefix and suffix",
      layout: "block",
      markup: row(
        [
          field("Work email", 'icon="Mail" type="email" autocomplete="email" placeholder="[name]@example.com"'),
          field("Rate", 'prefix="$" suffix="per hour" inputmode="decimal" default-value="85"'),
          field("Website", 'prefix="https://" type="url" autocomplete="url" placeholder="[business].com.au"'),
        ].join("\n")
      ),
    },
    {
      id: "states",
      title: "Empty, filled, invalid, read-only and disabled",
      layout: "block",
      markup: row(
        [
          field("Suburb", 'autocomplete="address-level2" placeholder="[Fitzroy]"'),
          field("Street address", 'autocomplete="street-address" default-value="[12 Harbour Street]"'),
          field("BSB", 'inputmode="numeric" default-value="06-20"', ' error="Enter a BSB with 6 digits, such as [062-000]"'),
          field("Account name", 'readonly="{{yes}}" default-value="[Harbour Street Bakery]"', ' hint="From your bank feed. Change it in Banking."'),
          field("Branch", 'disabled="{{yes}}" default-value="[Sydney]"', ' hint="Fixed for this account."'),
        ].join("\n")
      ),
      vals: { yes: true },
    },
  ],
  frame: { width: 960, height: 524 },
  checks: [
    {
      name: "Focus is a 2px edge in the focus colour, on a plain input and on one with a prefix, in both themes",
      example: "sizes",
      themes: ["light", "dark"],
      async run({ page, expect }) {
        await page.keyboard.press("Tab")
        const plain = await page.evaluate(() => document.activeElement.getAttribute("placeholder"))
        expect.equal(plain, "[INV-0042]", "Tab reached the first field")
        const first = await page.evaluateHandle(() => document.activeElement)
        const e = await first.evaluate(readEdge)
        expect(twoPx(e, e.focus), `a 2px focus edge (border ${e.border}, ring ${e.shadow})`)
        expect.equal(e.outline, "none", "the edge replaces the outline")
        const rate = page.getByRole("textbox", { name: "Rate" })
        await rate.focus()
        const r = await rate.evaluate(readEdge)
        expect(twoPx(r, r.focus), `the wrapper draws the 2px focus edge (border ${r.border}, ring ${r.shadow})`)
      },
    },
    {
      name: "Invalid is a danger edge that stays danger when focused",
      example: "states",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const bsb = scope.getByRole("textbox", { name: "BSB" })
        const rest = await bsb.evaluate(readEdge)
        expect.equal(rest.border, rest.danger, "a danger border at rest")
        await bsb.focus()
        const focused = await bsb.evaluate(readEdge)
        expect(twoPx(focused, focused.danger), `still danger, and 2px, when focused (border ${focused.border}, ring ${focused.shadow})`)
      },
    },
    {
      name: "The edge holds 3:1 against the field's fill and the surface behind it, in both themes",
      example: "states",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        for (const name of ["Suburb", "Account name"]) {
          const e = await scope.getByRole("textbox", { name }).evaluate(readEdge)
          expect.atLeast(Number(contrast(e.border, e.fill).toFixed(2)), 3, `${name}: the edge against the fill`)
          expect.atLeast(Number(contrast(e.border, e.behind).toFixed(2)), 3, `${name}: the edge against the surface behind`)
        }
      },
    },
    {
      name: "The prefix and suffix are read with the field, and pressing them puts the caret in it",
      example: "adornments",
      async run({ page, scope, expect }) {
        const rate = scope.getByRole("textbox", { name: "Rate" })
        const read = await rate.evaluate((el) => (el.getAttribute("aria-describedby") ?? "").split(" ").map((id) => document.getElementById(id)?.textContent).join("|"))
        expect.equal(read, "$|per hour", "described by its prefix and suffix")
        await scope.getByText("$", { exact: true }).click()
        expect(await rate.evaluate((el) => document.activeElement === el), "a press on the prefix focuses the field")
        expect.equal(await page.evaluate(() => document.activeElement.getAttribute("inputmode")), "decimal", "phones show the decimal keypad")
      },
    },
    {
      name: "Read-only is a dashed edge and a lock, and says where the value comes from",
      example: "states",
      async run({ scope, expect }) {
        const account = scope.getByRole("textbox", { name: "Account name" })
        expect(await account.evaluate((el) => el.readOnly), "read-only")
        expect.equal((await account.evaluate(readEdge)).style, "dashed", "a dashed edge")
        expect.equal(await account.evaluate((el) => el.parentElement.querySelectorAll('[data-icon="Lock"]').length), 1, "a lock")
        const hint = await account.evaluate((el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent)
        expect.equal(hint, "From your bank feed. Change it in Banking.", "the hint says where it comes from")
      },
    },
    {
      name: "Forced colours keep focus visible, on a plain input and on one inside a wrapper",
      example: "adornments",
      forcedColors: true,
      async run({ page, expect }) {
        const outline = () => page.evaluate(() => `${getComputedStyle(document.activeElement).outlineStyle} ${parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2}`)
        await page.keyboard.press("Tab")
        expect.equal(await outline(), "solid true", "a 2px outline on the plain input")
        await page.getByRole("textbox", { name: "Rate" }).focus()
        expect.equal(await outline(), "solid true", "a 2px outline on the input inside the wrapper")
      },
    },
    {
      name: "32, 36 and 44px tall with 14 and 16px text on a desktop",
      example: "sizes",
      async run({ scope, expect }) {
        const sizes = await scope.getByRole("textbox").evaluateAll((els) => els.map((el) => `${Math.round((el.closest('[data-slot="text-input"]') ?? el).getBoundingClientRect().height)}/${getComputedStyle(el).fontSize}`))
        expect.equal(sizes.join(","), "32/14px,36/14px,44/16px", "heights and text")
      },
    },
    {
      name: "Touch: 40, 44 and 48px tall, always with 16px text",
      example: "sizes",
      touch: true,
      async run({ scope, expect }) {
        const sizes = await scope.getByRole("textbox").evaluateAll((els) => els.map((el) => `${Math.round(el.getBoundingClientRect().height)}/${getComputedStyle(el).fontSize}`))
        expect.equal(sizes.join(","), "40/16px,44/16px,48/16px", "touch heights and text")
      },
    },
  ],
}
