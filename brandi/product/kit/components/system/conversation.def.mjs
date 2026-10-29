// Conversation's one definition: its README, its preview board and its scripted checks all come from here.

function recordLiveRegions() {
  window.__liveChanges = []
  const live = '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"]'
  new MutationObserver((records) => {
    const changed = new Set()
    for (const r of records) {
      const node = r.target.nodeType === 1 ? r.target : r.target.parentElement
      const region = node && node.closest(live)
      if (region) changed.add(region)
    }
    for (const region of changed) window.__liveChanges.push({ slot: region.getAttribute("data-slot"), text: (region.textContent || "").trim() })
  }).observe(document, { subtree: true, childList: true, characterData: true })
}

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
const groundOf = (locator) =>
  locator.evaluate((el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor
      if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c
    }
    return getComputedStyle(document.body).backgroundColor
  })

const THREAD = [
  { id: "m1", author: "[Jo Ellis]", time: "Yesterday, 4:12 pm", dateTime: "2026-10-26T16:12", text: "Hi, can you resend [Invoice 1042]? I can't find the original email." },
  { id: "m2", author: "You", own: true, status: "sent", time: "Yesterday, 4:30 pm", dateTime: "2026-10-26T16:30", text: "Of course. I've resent it to [jo@northside.example]. Let me know if it doesn't arrive." },
  { id: "m3", author: "Assistant", assistant: true, time: "Today, 8:02 am", dateTime: "2026-10-27T08:02", text: "[Jo Ellis] opened the invoice email at 7:58 am. The invoice is still unpaid." },
  { id: "m4", author: "[Jo Ellis]", unread: true, time: "Today, 9:41 am", dateTime: "2026-10-27T09:41", text: "Got it, thanks. We'll pay it on Friday." },
]
const FRAME = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; box-sizing: border-box;"
const GRID = "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; width: 100%;"

export default {
  name: "Conversation",
  group: "Data",
  job: "Messages between people, with a composer: support, comments and messaging.",
  status: "to build",
  types: ['type ConversationMessage = { id: string; author: string; text: ReactNode; time: string; dateTime?: string; own?: boolean; assistant?: boolean; unread?: boolean; status?: "sending" | "sent" | "failed"; avatar?: string }'],
  props: [
    { name: "messages", type: "ConversationMessage[]", required: true, doc: "The messages, oldest first: { id, author, text, time, dateTime, own, assistant, unread, status, avatar }." },
    { name: "label", type: "string", required: true, doc: 'Names the thread: "Messages with [Northside Plumbing]".' },
    { name: "composerLabel", type: "string", default: '"Message"', doc: 'What the reply is for, as the composer\'s label: "Reply to [Jo Ellis]".' },
    { name: "placeholder", type: "string", doc: "An example, never an instruction." },
    { name: "onSend", type: "(text: string) => void", doc: "Called with the text on Send, or Cmd or Ctrl Enter. Enter adds a line. Focus stays in the composer." },
    { name: "sendLabel", type: "string", default: '"Send"', doc: "Send's label." },
    { name: "onRetry", type: "(id: string) => void", doc: "Sends a failed message again. Focus moves to the message." },
    { name: "retryLabel", type: "string", default: '"Try again"', doc: "Try again's label." },
    { name: "loading", type: "boolean", default: "false", doc: "The thread is loading: skeletons, and one polite status." },
    { name: "empty", type: "ReactNode", default: '"No messages yet"', doc: "What shows when nothing has been said yet." },
    { name: "error", type: "ReactNode", doc: "The thread could not load: say which system failed. Any messages given stay, as the last good copy." },
    { name: "draft", type: "{ text: string; name?: string; trigger?: ReactNode; check?: \"passed\" | \"issues\" | \"checking\" | \"not-run\" }", doc: "A reply the assistant drafted, in the one composer to check, edit and send, marked as drafted until it is sent. Never a second composer or a second Send: a run drew both, and nobody could tell which sent the draft." },
  ],
  notes: {
    Behaviour: [
      'The thread is a log named by label: polite, and only additions are read, so a new message is announced once and changes inside a message are not. A failure arrives as a line of its own, so "Not sent" is heard.',
      "Every message names who sent it and when, with a time element. An unread message shows a dot and says (unread) to screen readers.",
      "The log scrolls, takes focus from the keyboard, and keeps the newest message in view while the person reads the end.",
      "Enter adds a line, as in any field with more than one. Cmd or Ctrl Enter, or Send, sends, and focus stays in the composer. Try again on a failed message moves focus to that message.",
      "The composer comes after the thread, so Tab moves from the thread's controls to it.",
    ],
    Layout: ["Each message is a line: the sender's avatar, their name and the time, then the text capped at the measure. The composer sits at the foot, with its label above it."],
    States: ["Unread, read, sending, sent and failed. Loading, empty, and could not load."],
    Copy: ["The composer's label says what the text is for. The assistant's messages carry its tone and say Assistant in words."],
    Rules: [
      "For people talking to people: support, comments, messaging. The assistant's own thread is the AskPanel.",
      "A message from the assistant carries the ai tone and says so in words, never by colour alone.",
    ],
  },
  frame: { width: 960, height: 1060 },
  examples: [
    {
      id: "thread",
      title: "A support thread",
      layout: "block",
      markup: `<div style="${FRAME} height: 600px; max-width: 640px;">
<x-import component-from-global-scope="NS.Conversation" style="display: block; height: 100%;" label="Messages with [Northside Plumbing]" composer-label="Reply to [Jo Ellis]" messages="{{thread}}" on-send="{{send}}" on-retry="{{retry}}"></x-import>
</div>`,
    },
    {
      id: "states",
      title: "Empty, loading, and could not load",
      layout: "block",
      markup: `<div style="${GRID}">
<div style="${FRAME} height: 300px;"><x-import component-from-global-scope="NS.Conversation" style="display: block; height: 100%;" label="Messages with [Harbour Physio]" composer-label="Message to [Harbour Physio]" messages="{{none}}" empty="No messages with [Harbour Physio] yet."></x-import></div>
<div style="${FRAME} height: 300px;"><x-import component-from-global-scope="NS.Conversation" style="display: block; height: 100%;" label="Messages with [Kim's Cafe]" composer-label="Reply to [Kim Tran]" messages="{{none}}" loading="{{yes}}"></x-import></div>
<div style="${FRAME} height: 300px;"><x-import component-from-global-scope="NS.Conversation" style="display: block; height: 100%;" label="Messages with [Willow Vets]" composer-label="Reply to [Ana Ruiz]" messages="{{none}}" error="Couldn't load the messages from [help desk]. New replies still send."></x-import></div>
</div>`,
      vals: { none: [], yes: true },
    },
    {
      id: "drafted",
      title: "A reply the assistant drafted, waiting in the composer",
      layout: "block",
      markup: `<div style="${FRAME} height: 600px; max-width: 640px;">
<x-import component-from-global-scope="NS.Conversation" style="display: block; height: 100%;" label="Messages with [Northside Dental]" composer-label="Reply to [Jo Ellis]" messages="{{draftThread}}" on-send="{{sendDraft}}" draft="{{reply}}"></x-import>
</div>`,
      vals: { reply: { text: "Thanks, [Jo]. Friday suits us, and we'll send the receipt once it's paid.", name: "[Sam Lee]" } },
    },
  ],
  state: { thread: THREAD, sent: 0, draftThread: THREAD },
  logic: `thread: self.state.thread,
    send: (text) => {
      const id = "new-" + (self.state.sent + 1)
      self.setState((s) => ({ sent: s.sent + 1, thread: s.thread.concat({ id, author: "You", own: true, status: "sending", time: "Today, 9:45 am", dateTime: "2026-10-27T09:45", text }) }))
      // The first try fails, so the board shows the way on.
      setTimeout(() => self.setState((s) => ({ thread: s.thread.map((m) => (m.id === id ? Object.assign({}, m, { status: "failed" }) : m)) })), 1200)
    },
    draftThread: self.state.draftThread,
    sendDraft: (text) => self.setState((s) => ({ draftThread: s.draftThread.concat({ id: "drafted-" + s.draftThread.length, author: "You", own: true, status: "sent", time: "Today, 9:45 am", dateTime: "2026-10-27T09:45", text }) })),
    retry: (id) => {
      self.setState((s) => ({ thread: s.thread.map((m) => (m.id === id ? Object.assign({}, m, { status: "sending" }) : m)) }))
      setTimeout(() => self.setState((s) => ({ thread: s.thread.map((m) => (m.id === id ? Object.assign({}, m, { status: "sent" }) : m)) })), 1200)
    }`,
  checks: [
    {
      name: "A named, polite log of messages, each naming who sent it and when",
      example: "thread",
      async run({ scope, expect }) {
        const log = scope.getByRole("log", { name: "Messages with [Northside Plumbing]" })
        expect.equal(await log.count(), 1, "a log named for the thread")
        expect.equal(await log.getAttribute("aria-relevant"), "additions", "only additions are read")
        const messages = log.locator('[data-slot="conversation-message"]')
        expect.equal(await messages.count(), 4, "every message")
        for (const m of await messages.all()) {
          expect((await m.locator(".type-label").innerText()).trim().length > 0, "it names who sent it")
          expect(/^\d{4}-\d{2}-\d{2}T/.test(await m.locator("time").getAttribute("datetime")), "and when, as a time element")
        }
      },
    },
    {
      name: "An unread message shows a dot and says (unread), and the dot survives forced colours",
      example: "thread",
      forcedColors: true,
      async run({ scope, expect }) {
        const unread = scope.locator('[data-slot="conversation-message"][data-unread]')
        expect.equal(await unread.count(), 1, "one unread message")
        expect.equal((await unread.locator(".sr-only").innerText()).trim(), "(unread)", "said to screen readers")
        const dot = await unread.locator('[data-slot="conversation-unread"]').evaluate((el) => getComputedStyle(el).backgroundColor)
        expect(!/rgba\(0, 0, 0, 0\)|transparent/.test(dot), `the dot is still drawn (${dot})`)
      },
    },
    {
      name: "The assistant's messages carry its tone and say so in words",
      example: "thread",
      async run({ scope, expect }) {
        const message = scope.locator('[data-slot="conversation-message"][data-assistant]')
        expect.equal(await message.count(), 1, "one from the assistant")
        expect.equal((await message.locator(".type-label").innerText()).trim(), "Assistant", "it says so in words")
        expect.equal(await message.locator('[data-slot="avatar-assistant"]').count(), 1, "with the assistant's own avatar, in its tone")
      },
    },
    {
      name: "A drafted reply waits in the one composer, described as drafted, and goes only on Send",
      example: "drafted",
      async run({ scope, expect }) {
        const field = scope.getByRole("textbox", { name: "Reply to [Jo Ellis]" })
        expect.equal(await scope.getByRole("textbox").count(), 1, "one composer")
        expect.equal(await scope.getByRole("button", { name: "Send", exact: true }).count(), 1, "one Send")
        expect.equal(await field.inputValue(), "Thanks, [Jo]. Friday suits us, and we'll send the receipt once it's paid.", "the draft is in the composer")
        const described = await field.evaluate((el) => (el.getAttribute("aria-describedby") ?? "").split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" "))
        expect(/Drafted with AI by \[Sam Lee\]/.test(described), `the composer is described as drafted: got "${described}"`)
        expect.equal(await scope.locator('[data-slot="conversation-message"]').count(), 4, "nothing is sent before the person sends it")
        await field.fill("Thanks, [Jo]. Friday suits us.")
        expect(/edited by you/i.test(await scope.locator("form").innerText()), "an edited draft says so")
        await scope.getByRole("button", { name: "Send", exact: true }).click()
        expect.equal(await scope.locator('[data-slot="conversation-message"]').count(), 5, "Send sends it")
        expect.equal(await field.inputValue(), "", "the composer empties")
        expect.equal(await field.getAttribute("aria-describedby"), null, "and is no longer described as drafted")
      },
    },
    {
      name: "Enter adds a line, Cmd or Ctrl Enter sends, and the new message is announced once",
      example: "thread",
      async run({ page, scope, expect }) {
        await page.addInitScript(recordLiveRegions)
        await page.clock.install()
        await page.reload()
        await page.waitForSelector("html[data-dc-ready]")
        const field = scope.getByRole("textbox", { name: "Reply to [Jo Ellis]" })
        await field.click()
        await page.keyboard.type("Thanks, [Jo].")
        await page.keyboard.press("Enter")
        expect.equal(await field.inputValue(), "Thanks, [Jo].\n", "Enter adds a line")
        await page.keyboard.type("See you Friday.")
        await page.keyboard.press("ControlOrMeta+Enter")
        await page.waitForTimeout(150)
        expect.equal(await scope.locator('[data-slot="conversation-message"]').count(), 5, "Cmd or Ctrl Enter sends")
        expect.equal(await field.inputValue(), "", "the composer empties")
        expect(await field.evaluate((el) => el === document.activeElement), "and keeps focus")
        const heard = await page.evaluate(() => window.__liveChanges.filter((c) => c.slot === "conversation-log" && c.text.includes("See you Friday.")).length)
        expect.equal(heard, 1, "the new message is announced once")
      },
    },
    {
      name: "A failed message says so and offers Try again, which keeps focus on the message",
      example: "thread",
      async run({ page, scope, expect }) {
        await page.clock.install()
        await page.reload()
        await page.waitForSelector("html[data-dc-ready]")
        await scope.getByRole("textbox", { name: "Reply to [Jo Ellis]" }).fill("See you Friday.")
        await scope.getByRole("button", { name: "Send", exact: true }).click()
        await page.clock.runFor(1300)
        await page.waitForTimeout(120)
        const last = scope.locator('[data-slot="conversation-message"]').last()
        expect.equal((await last.locator('[data-slot="conversation-failed"] p').innerText()).trim(), "Not sent.", "it says it did not send")
        await last.getByRole("button", { name: "Try again" }).focus()
        await page.keyboard.press("Enter")
        await page.waitForTimeout(120)
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-slot")), "conversation-message", "focus stays on the message")
        await page.clock.runFor(1300)
        await page.waitForTimeout(120)
        expect.equal((await last.locator('[data-slot="conversation-delivery"]').innerText()).trim(), "Sent", "and it sends")
      },
    },
    {
      name: "The composer's label says what it is for, and it comes after the thread",
      example: "thread",
      async run({ page, scope, expect }) {
        expect.equal(await scope.getByRole("textbox", { name: "Reply to [Jo Ellis]" }).count(), 1, "the label names the reply")
        await scope.getByRole("log").focus()
        await page.keyboard.press("Tab")
        expect.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-slot")), "conversation-field", "Tab moves from the thread to the composer")
      },
    },
    {
      name: "Loading, empty and could not load each say so",
      example: "states",
      async run({ scope, expect }) {
        const [empty, loading, error] = await scope.locator('[data-slot="conversation"]').all()
        expect.equal((await empty.locator('[data-slot="conversation-empty"]').innerText()).trim(), "No messages with [Harbour Physio] yet.", "empty says so")
        expect.equal(await loading.getByRole("log").getAttribute("aria-busy"), "true", "loading marks the log busy")
        expect.equal((await loading.getByRole("status").innerText()).trim(), "Loading messages with [Kim's Cafe]", "and says what is loading")
        expect((await error.locator('[data-slot="conversation-error"]').innerText()).includes("[help desk]"), "the failure names the system")
      },
    },
    {
      name: "Send is 40px and the text 16px on a touch screen",
      example: "thread",
      touch: true,
      async run({ scope, expect }) {
        expect.equal(Math.round((await scope.getByRole("button", { name: "Send", exact: true }).boundingBox()).height), 40, "Send")
        expect.equal(await scope.locator('[data-slot="conversation-field"]').evaluate((el) => getComputedStyle(el).fontSize), "16px", "16px text")
      },
    },
    {
      name: "Names, times and messages hold their contrast, in both themes",
      example: "thread",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const m = scope.locator('[data-slot="conversation-message"]').first()
        for (const el of [m.locator(".type-label"), m.locator("time"), m.locator('[data-slot="conversation-text"]')]) {
          expect.atLeast(contrast(await el.evaluate((n) => getComputedStyle(n).color), await groundOf(el)), 4.5, theme)
        }
        const ai = scope.locator('[data-slot="conversation-message"][data-assistant] .text-ai')
        if (await ai.count()) expect.atLeast(contrast(await ai.evaluate((n) => getComputedStyle(n).color), await groundOf(ai)), 4.5, `${theme} assistant word`)
      },
    },
  ],
}
