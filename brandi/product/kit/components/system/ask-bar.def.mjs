// AskBar's one definition: its README, its preview board and its scripted checks all come from here.

const focused = (page) =>
  page.evaluate(() => ({
    slot: document.activeElement?.getAttribute("data-slot") ?? document.activeElement?.tagName.toLowerCase(),
    text: (document.activeElement?.textContent ?? "").replace(/\s+/g, " ").trim(),
  }))
const answers = (scope) => scope.locator('[data-slot="ai-answer"]')

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

const PLACEHOLDER = "Search [clients], [invoices] and [jobs], or ask"
const FIRST = "[3] invoices are overdue, worth [$4,280] in total. The oldest, [Invoice 1042] for [Northside Plumbing], is [18] days late."

export default {
  name: "AskBar",
  group: "The assistant",
  job: "Search and ask in one field, on Home: records, people, actions, or a question for the assistant.",
  status: "proven",
  props: [
    { name: "placeholder", type: "string", default: '"Search or ask"', doc: "On Home, what can be found, in the product's words. It is a hint, not the field's name." },
    { name: "label", type: "string", doc: "The field's accessible name. The placeholder by default." },
    { name: "action", type: "string", default: '"Ask"', doc: "The button's label." },
    { name: "shortcut", type: "boolean", default: "true", doc: "Shows the key and lets Cmd K (Ctrl K off Apple devices) focus the field, even from another field." },
    { name: "onAsk", type: "(question: string) => void", doc: "Called with the question on Enter or Ask. The field then empties." },
    { name: "defaultValue", type: "string", doc: "The question already typed." },
    { name: "children", type: "ReactNode", doc: "The answers, oldest first. The bar and the answers share one column no wider than 880px, newest last, and focus moves to each new answer." },
  ],
  notes: {
    Behaviour: [
      "A search landmark holding a field named by its label (the placeholder by default) and the Ask button.",
      "Enter asks and Shift+Enter adds a line, and the field grows with its lines. The Enter that finishes a word in an input method never asks.",
      "Cmd K, or Ctrl K off Apple devices, focuses the field from anywhere, even another field, and is announced as its keyboard shortcut. Behind an open modal it does nothing.",
      "After Ask, or a follow-up in an answer under it, focus moves to the new answer's question. An empty Ask asks nothing and leaves focus in the field.",
    ],
    Layout: ["The large control: 44px, and 48px with 16px text on a touch screen, growing to six lines. The answers follow under it in the same column, newest last."],
    States: ["Empty, with the key shown; typing, with the key hidden and Ask ready; asking, as the answer takes over."],
    Copy: ["On Home the placeholder says what can be found, in the product's words. Ask is the button, in the brand's moment."],
    Rules: [
      "One per product, on Home. Everywhere else the same thing opens from the rail's search or the command menu.",
      "Once there are answers, the bar and the answers share one column no wider than 880px, newest answer last.",
    ],
    Accepted: ["Questions run long, so the field is a textarea, where Enter asks and Shift+Enter adds a line, rather than a one-line search input."],
  },
  frame: { width: 960, height: 700 },
  examples: [
    {
      id: "home",
      title: "On Home, with the key to reach it",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.AskBar" placeholder="${PLACEHOLDER}" on-ask="{{noop}}"></x-import>`,
    },
    {
      id: "in-use",
      title: "In use: each answer joins the column, newest last",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.AskBar" placeholder="${PLACEHOLDER}" shortcut="{{off}}" on-ask="{{ask}}">
<x-import component-from-global-scope="NS.AIAnswer" question="Which invoices are overdue?" status="Answered" sources="{{firstSources}}" caveat="Check [the March payments] first.">${FIRST}</x-import>
<sc-for list="{{asked}}" as="a">
<x-import component-from-global-scope="NS.AIAnswer" question="{{a.question}}" thinking="{{a.thinking}}" status="Answered" sources="{{a.sources}}" caveat="{{a.caveat}}">{{a.text}}</x-import>
</sc-for>
</x-import>`,
      vals: { off: false, firstSources: [{ label: "[Aged receivables] report", icon: "ChartColumn", href: "#aged-receivables" }] },
    },
    {
      id: "typed",
      title: "A question typed, in a narrow column",
      layout: "block",
      markup: `<div style="max-width: 400px;">
<x-import component-from-global-scope="NS.AskBar" shortcut="{{off}}" default-value="Which jobs next week have no technician yet?" on-ask="{{noop}}"></x-import>
</div>`,
    },
  ],
  state: { asked: [] },
  logic: `noop: () => {},
    asked: self.state.asked,
    ask: (question) => {
      const at = self.state.asked.length
      self.setState((s) => ({ asked: s.asked.concat({ question, thinking: "Reading [12] invoices from [accounting system]…" }) }))
      setTimeout(() => self.setState((s) => ({ asked: s.asked.map((a, i) => (i === at ? { question: a.question, text: "[Northside Plumbing] owes the most: [$1,280] across [2] invoices.", caveat: "Check [Invoice 1042] first.", sources: [{ label: "[Invoice 1042]", icon: "Receipt", href: "#invoice-1042" }] } : a)) })), 1500)
    }`,
  checks: [
    {
      name: "Enter asks and Shift+Enter adds a line",
      example: "in-use",
      async run({ page, scope, expect }) {
        const field = scope.getByRole("textbox", { name: PLACEHOLDER })
        await field.click()
        await page.keyboard.type("Which client")
        await page.keyboard.press("Shift+Enter")
        await page.keyboard.type("owes the most?")
        expect.equal(await field.inputValue(), "Which client\nowes the most?", "Shift+Enter adds a line")
        expect.equal(await answers(scope).count(), 1, "and asks nothing")
        await page.keyboard.press("Enter")
        await page.waitForTimeout(150)
        expect.equal(await answers(scope).count(), 2, "Enter asks")
        expect.equal(await field.inputValue(), "", "and the field empties")
      },
    },
    {
      name: "After Ask, focus moves to the new answer's question, newest last",
      example: "in-use",
      async run({ page, scope, expect }) {
        const field = scope.getByRole("textbox", { name: PLACEHOLDER })
        await field.fill("Which client owes the most?")
        await field.press("Enter")
        await page.waitForTimeout(150)
        const f = await focused(page)
        expect.equal(f.slot, "ai-answer-question", "focus lands on the new answer")
        expect.equal(f.text, "Which client owes the most?", "the newest, last in the column")
        expect.equal((await answers(scope).last().locator('[data-slot="ai-answer-question"]').innerText()).trim(), "Which client owes the most?", "newest last")
      },
    },
    {
      name: "The Enter that finishes a word in an input method never asks",
      example: "in-use",
      async run({ scope, expect }) {
        const field = scope.getByRole("textbox", { name: PLACEHOLDER })
        await field.fill("Kim")
        await field.evaluate((el) => el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true, cancelable: true })))
        expect.equal(await answers(scope).count(), 1, "nothing was asked")
        expect.equal(await field.inputValue(), "Kim", "the word stays")
      },
    },
    {
      name: "An empty Ask asks nothing and leaves focus in the field",
      example: "in-use",
      async run({ page, scope, expect }) {
        const ask = scope.getByRole("button", { name: "Ask" })
        expect.equal(await ask.getAttribute("aria-disabled"), "true", "Ask says it is not ready yet")
        await ask.focus()
        await page.keyboard.press("Enter")
        expect.equal(await answers(scope).count(), 1, "nothing was asked")
        expect.equal((await focused(page)).slot, "ask-bar-field", "focus goes to the field, never the page")
      },
    },
    {
      name: "Cmd K, or Ctrl K, focuses the field from anywhere, even another field",
      example: "home",
      async run({ page, scope, expect }) {
        await page.locator('[data-example="in-use"] [data-slot="ask-bar-field"]').focus()
        await page.keyboard.press("ControlOrMeta+K")
        const inside = await scope.evaluate((root) => root.contains(document.activeElement) && document.activeElement.getAttribute("data-slot") === "ask-bar-field")
        expect(inside, "the shortcut reached the field from another field")
      },
    },
    {
      name: "It sits in a search landmark, named, with its key advertised and announced",
      example: "home",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("search").count(), 1, "a search landmark")
        const field = scope.getByRole("textbox", { name: PLACEHOLDER })
        expect.equal(await field.count(), 1, "the field is named")
        expect(/^(Meta|Control)\+K$/.test(await field.getAttribute("aria-keyshortcuts")), "the shortcut is announced")
        const key = scope.locator('[data-slot="kbd"]')
        expect(await key.isVisible(), "the key is shown")
        await field.focus()
        expect(!(await key.isVisible()), "and hidden once the field has focus")
      },
    },
    {
      name: "44px on a desktop, growing as lines are added",
      example: "home",
      async run({ page, scope, expect }) {
        const box = scope.locator('[data-slot="ask-bar-form"] > div')
        expect.equal(Math.round((await box.boundingBox()).height), 44, "the large control")
        const typed = page.locator('[data-example="typed"] [data-slot="ask-bar-form"] > div')
        expect.atLeast(Math.round((await typed.boundingBox()).height), 64, "a question on two lines grows the field")
      },
    },
    {
      name: "Opened inside something hidden, the field keeps its height when it is shown",
      async run({ page, expect }) {
        const height = await page.evaluate(() => {
          const ns = Object.keys(window)
            .map((k) => {
              try {
                return window[k]
              } catch {
                return null
              }
            })
            .find((v) => v && typeof v === "object" && v.AskBar && v.Root)
          const host = document.createElement("div")
          host.style.display = "none"
          document.body.append(host)
          window.ReactDOM.flushSync(() => window.ReactDOM.createRoot(host).render(window.React.createElement(ns.AskBar, { shortcut: false })))
          host.style.display = "block"
          const h = host.querySelector('[data-slot="ask-bar-field"]').getBoundingClientRect().height
          host.remove()
          return Math.round(h)
        })
        expect.atLeast(height, 40, "a line high, never pinned at nothing")
      },
    },
    {
      name: "48px with 16px text on a touch screen",
      example: "home",
      touch: true,
      async run({ scope, expect }) {
        expect.equal(Math.round((await scope.locator('[data-slot="ask-bar-form"] > div').boundingBox()).height), 48, "touch height")
        expect.equal(await scope.locator('[data-slot="ask-bar-field"]').evaluate((el) => getComputedStyle(el).fontSize), "16px", "16px text, so iOS never zooms")
        expect.equal(Math.round((await scope.getByRole("button", { name: "Ask" }).boundingBox()).height), 40, "Ask is 40px")
      },
    },
    {
      name: "Focus draws the 2px edge, and the edge holds 3:1, in both themes",
      example: "home",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const box = scope.locator('[data-slot="ask-bar-form"] > div')
        const rest = await box.evaluate((el) => getComputedStyle(el).borderTopColor)
        const ground = await box.evaluate(() => {
          const probe = document.createElement("span")
          probe.style.background = "var(--canvas)"
          document.body.append(probe)
          const c = getComputedStyle(probe).backgroundColor
          probe.remove()
          return c
        })
        expect.atLeast(contrast(rest, ground), 3, `${theme} edge at rest`)
        await scope.locator('[data-slot="ask-bar-field"]').focus()
        const edge = await box.evaluate((el) => {
          const probe = document.createElement("span")
          probe.style.color = "var(--focus)"
          document.body.append(probe)
          const focus = getComputedStyle(probe).color
          probe.remove()
          const s = getComputedStyle(el)
          return { border: s.borderTopColor, ring: s.boxShadow, focus }
        })
        expect.equal(edge.border, edge.focus, `${theme}: the edge turns the focus colour`)
        expect(edge.ring.includes(edge.focus) && /0px 0px 0px 1px/.test(edge.ring), `${theme}: with a 1px ring, 2px in all`)
      },
    },
  ],
}
