// Email's one definition: its README, its preview board and its scripted checks all come from here.

const email = {
  preheader: "[14] timesheets from last week are waiting on you.",
  heading: "[14] timesheets need your approval",
  body: [
    "[Sam Lee] and [13] others sent their timesheets for the week of [27 October]. Approve them by [Thursday] so the pay run goes out on time.",
    "If one looks wrong, send it back with a note and they will see it straight away.",
  ],
  action: { label: "Review timesheets", href: "https://app.example.com/timesheets" },
  footer: [
    "You are getting this because you approve timesheets for [Kestrel Maintenance].",
    { label: "Manage email settings", href: "https://app.example.com/settings/email" },
    "[12 Example Street, Sydney NSW 2000]",
  ],
}

const ns = () => Object.values(window).find((v) => v && typeof v === "object" && v.ICON_NAMES && v.Root)
// What the lockup is called, as ProductLockup names it: the brand once when the product carries its name.
const lockupWords = (brand, product) => (product.trim().toLowerCase() === brand.name.trim().toLowerCase() ? brand.name : `${brand.name} ${product}`)

const rgb = (s) => (String(s).match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luminance = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export default {
  name: "Email",
  group: "Feedback",
  job: "The system's layout for product emails: the lockup, one heading, the body, one action and the footer.",
  status: "to build",
  props: [
    { name: "heading", type: "string", required: true, doc: "What happened, as the email's one heading: [14] timesheets need your approval." },
    { name: "body", type: "string | string[]", required: true, doc: "A paragraph, or several. Plain text." },
    { name: "action", type: "{ label: string; href: string }", doc: "The one primary action, verb first. A link, because it goes somewhere." },
    { name: "preheader", type: "string", doc: "The line inboxes show after the subject. Hidden in the email itself." },
    { name: "footer", type: "Array<string | { label: string; href: string }>", doc: "Small print under the card: why they got it, a settings link, who sent it." },
    { name: "product", type: "string", doc: "The product's name in the lockup. The name in lib/product.ts by default. A product named for the brand shows the mark alone." },
    { name: "logoSrc", type: "string", doc: "The logo as a hosted image, for sending: a PNG of the wordmark from public/brand/. Without it the mark is drawn inline, which a board and Apple Mail show and Gmail does not." },
    { name: "scheme", type: '"light" | "dark"', default: '"light"', doc: "Shows how a mail app in light or dark mode draws it. A sent email carries both." },
    { name: "headingLevel", type: "1 | 2 | 3 | 4", default: "1", doc: "The heading's level on a board. In a sent email it is always the one h1." },
  ],
  statics: [
    { name: "html", type: "(props: EmailProps) => string", doc: "The whole email to send: a document with the language set, both schemes (the dark one for mail apps that ask for it) and a narrow-screen inset." },
    { name: "text", type: "(props: EmailProps) => string", doc: "The plain-text part every email carries: the same words in the same order, with each link written out." },
  ],
  notes: {
    Behaviour: [
      "Mail clients honour no stylesheet the email cannot carry and no custom property, so every colour, size and corner is written inline as its value, read from the system's tokens. The board shows the very markup that is sent.",
      "Layout tables carry role=\"presentation\". The button is a link, because it goes somewhere. Only http, https and mailto addresses reach the markup.",
      "Email.html() wraps the body in a document: the language, the character set, color-scheme for light and dark, and a stylesheet that mail apps which honour it use for dark mode and a 24px inset on a phone. Email.text() is its plain-text part.",
    ],
    Layout: [
      "Up to 600px wide and fluid below it: the lockup, then a card holding the heading, the body and the action, then the footer under it. Reading order matches the layout.",
      "Reading sizes: the body at body-lg (16px on 24px), the heading at heading-lg, the footer at meta. The button is the action's pill, 16px, 48px tall.",
    ],
    States: ["Light and dark. With or without an action. An email has no state of its own: it is static."],
    Copy: [
      "The heading says what happened or what is waiting: [14] timesheets need your approval. The subject line says the same in fewer words (3 jobs need you).",
      "One action, verb first: Review timesheets. The footer says why the person got it, and where to change that.",
    ],
    Rules: [
      "One primary action per email. Anything more is a link in the body.",
      "Send logoSrc: Gmail and Outlook draw no inline SVG. Check each email in light and dark mail apps before it ships.",
    ],
  },
  frame: { width: 960, height: 1620 },
  logic: `brandName: NS.BRAND.name`,
  examples: [
    {
      id: "timesheets",
      title: "Timesheets waiting on approval",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Email" heading="${email.heading}" body="{{emailBody}}" action="{{emailAction}}" preheader="${email.preheader}" footer="{{emailFooter}}" scheme="{{theme}}" heading-level="{{h3}}"></x-import>`,
      vals: { emailBody: email.body, emailAction: email.action, emailFooter: email.footer, h3: 3 },
    },
    {
      id: "same-name",
      title: "A product named for the brand: the mark alone",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.Email" product="{{brandName}}" heading="${email.heading}" body="{{emailBody}}" scheme="{{theme}}" heading-level="{{h3}}"></x-import>`,
    },
    {
      id: "phone",
      title: "On a phone",
      markup: `<div style="width: 375px;"><x-import component-from-global-scope="NS.Email" heading="${email.heading}" body="{{emailBody}}" action="{{emailAction}}" footer="{{emailFooter}}" scheme="{{theme}}" heading-level="{{h3}}"></x-import></div>`,
    },
  ],
  checks: [
    {
      name: "A product named for the brand is the mark alone, in the email and its plain text; another product keeps its name",
      async run({ page, expect, brand }) {
        const lockup = await page.locator('[data-example="same-name"] [data-slot="email"]').evaluate((el) => {
          const mark = el.querySelector('[role="img"], img')
          const row = mark.closest("table")
          return { words: row.innerText.replace(/\s+/g, " ").trim(), rule: row.querySelectorAll(".em-rule").length, name: mark.getAttribute("aria-label") ?? mark.getAttribute("alt") }
        })
        expect.equal(lockup.words, "", "no name beside the mark")
        expect.equal(lockup.rule, 0, "and no hairline")
        expect.equal(lockup.name, brand.name, "the mark names the brand, once")
        const [same, other] = await page.evaluate(([props, find, name]) => {
          const kit = new Function(`return (${find})`)()()
          return [kit.Email.text({ ...props, product: name }).split("\n")[0], kit.Email.text({ ...props, product: "[Rosters]" }).split("\n")[0]]
        }, [email, ns.toString(), brand.name])
        expect.equal(same, brand.name, "the plain text names the brand once")
        expect.equal(other, `${brand.name} [Rosters]`, "another product keeps its name")
      },
    },
    {
      name: "Layout tables carry no table meaning, and every style is inline: no stylesheet, no class style, no custom property",
      example: "timesheets",
      async run({ scope, expect }) {
        const root = scope.locator('[data-slot="email"]')
        const report = await root.evaluate((el) => {
          const tables = [...el.querySelectorAll("table")]
          const styled = [...el.querySelectorAll("[style]")].map((n) => n.getAttribute("style"))
          const texts = [...el.querySelectorAll("h1, h2, h3, h4, p, a, td")].filter((n) => [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()))
          const unstyled = texts.filter((n) => !/font-family:/.test(n.getAttribute("style") ?? "") && !/font-family:/.test(n.closest("[style*='font-family']")?.getAttribute("style") ?? ""))
          return {
            tables: tables.length,
            presentation: tables.every((t) => t.getAttribute("role") === "presentation"),
            styleTags: el.querySelectorAll("style, link").length,
            customProperties: styled.filter((s) => /var\(/.test(s)).length,
            flexOrGrid: styled.filter((s) => /display:\s*(inline-)?(flex|grid)/.test(s)).length,
            unstyled: unstyled.map((n) => n.textContent.trim().slice(0, 30)),
            width: Math.round(el.querySelector("table table").getBoundingClientRect().width),
          }
        })
        expect.atLeast(report.tables, 3, "nested layout tables")
        expect(report.presentation, "every table is role=presentation")
        expect.equal(report.styleTags, 0, "no stylesheet in the body")
        expect.equal(report.customProperties, 0, "no custom property in any inline style")
        expect.equal(report.flexOrGrid, 0, "no flex or grid, which mail clients drop")
        expect.equal(report.unstyled.join(" | "), "", "every line of text carries its own inline type")
        expect.equal(report.width, 600, "the email is 600px wide at most")
      },
    },
    {
      name: "The colours are the system's own values, written in, in both schemes",
      example: "timesheets",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const [card, surface, heading, strong, corner, radius] = await scope.locator('[data-slot="email"]').evaluate((el) => {
          const probe = document.createElement("span")
          el.parentElement.append(probe)
          probe.style.color = "var(--surface)"
          const s = getComputedStyle(probe).color
          probe.style.color = "var(--text-strong)"
          const t = getComputedStyle(probe).color
          probe.remove()
          const cardCell = el.querySelector(".em-card")
          return [getComputedStyle(cardCell).backgroundColor, s, getComputedStyle(el.querySelector("h3")).color, t, getComputedStyle(cardCell).borderTopLeftRadius, getComputedStyle(document.documentElement).getPropertyValue("--radius-md").trim()]
        })
        expect.equal(card, surface, `the card is the ${theme} surface`)
        expect.equal(heading, strong, `the heading is the ${theme} strong text`)
        expect.equal(corner, radius, "the card's corners are radius-md, and they draw, since the tables keep separate borders")
        expect.equal(await scope.locator('[data-slot="email"]').getAttribute("data-scheme"), theme, "the scheme follows the board's theme here")
      },
    },
    {
      name: "One action, a link labelled verb first, in the primary at 3:1 against the card, its label at 4.5:1, in both themes",
      example: "timesheets",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const links = scope.locator('[data-slot="email"] .em-card a')
        expect.equal(await links.count(), 1, "one action in the card")
        const action = scope.getByRole("link", { name: "Review timesheets" })
        expect.equal(await action.getAttribute("href"), "https://app.example.com/timesheets", "it goes where the action says")
        const [fill, label, card] = await action.evaluate((a) => [getComputedStyle(a).backgroundColor, getComputedStyle(a.querySelector("span")).color, getComputedStyle(a.closest(".em-card")).backgroundColor])
        expect.atLeast(Math.round(contrast(fill, card) * 100) / 100, 3, `${theme} button against the card`)
        expect.atLeast(Math.round(contrast(label, fill) * 100) / 100, 4.5, `${theme} label on the button`)
      },
    },
    {
      name: "Reading text holds 4.5:1 on its ground, in both themes",
      example: "timesheets",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        const pairs = await scope.locator('[data-slot="email"]').evaluate((el) => {
          const ground = (n) => {
            let up = n
            while (up && /rgba\(0, 0, 0, 0\)/.test(getComputedStyle(up).backgroundColor)) up = up.parentElement
            return getComputedStyle(up).backgroundColor
          }
          return [...el.querySelectorAll("h3, p, .em-strong, .em-link")].map((n) => [n.textContent.trim().slice(0, 24), getComputedStyle(n).color, ground(n)])
        })
        for (const [what, colour, ground] of pairs) expect.atLeast(Math.round(contrast(colour, ground) * 100) / 100, 4.5, `${theme} "${what}"`)
      },
    },
    {
      name: "The lockup leads, named as ProductLockup names it, then the heading, the body, the action and the footer, in reading order",
      example: "timesheets",
      async run({ scope, expect, brand }) {
        const order = await scope.locator('[data-slot="email"]').evaluate((el) => {
          const named = el.querySelector('[role="img"], img')
          const parts = [named, el.querySelector(".em-card h3"), el.querySelector(".em-card p"), el.querySelector(".em-card a"), el.querySelector(".em-muted")]
          const sorted = parts.every((p, i) => i === 0 || (parts[i - 1].compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING))
          return { sorted, logo: named.getAttribute("aria-label") ?? named.getAttribute("alt"), lockup: named.closest("table").innerText.replace(/\s+/g, " ").trim() }
        })
        expect(order.sorted, "lockup, heading, body, action, footer, in that order")
        expect.equal([order.logo, order.lockup].filter(Boolean).join(" "), lockupWords(brand, brand.product), "the lockup reads as [Brand] [product], or the brand once")
      },
    },
    {
      name: "Email.html() is a whole document for mail clients, and Email.text() carries the same words with each link written out",
      example: "timesheets",
      async run({ page, expect, brand }) {
        const out = await page.evaluate(([props, find]) => {
          const kit = new Function(`return (${find})`)()()
          return { html: kit.Email.html(props), text: kit.Email.text(props) }
        }, [email, ns.toString()])
        const html = out.html
        expect(html.startsWith("<!doctype html>"), "a doctype first")
        expect(/<html lang="[a-z]{2}/.test(html), "the language is set")
        expect(html.includes('<meta charset="utf-8">'), "the character set")
        expect(html.includes('<meta name="color-scheme" content="light dark">'), "light and dark")
        expect.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, "one h1")
        expect(/@media \(prefers-color-scheme:dark\)\{\.em-canvas\{background-color:#[0-9a-f]{3,8}!important\}/i.test(html), "a dark scheme in real values")
        expect(!/var\(--/.test(html), "no custom property anywhere")
        expect(/display:none[^"]*">\[14\] timesheets from last week are waiting on you\.<\/div>/.test(html), "the preheader is there, hidden")
        expect.equal((html.match(/<table /g) ?? []).length, (html.match(/<table role="presentation"/g) ?? []).length, "every table is presentation")
        const text = out.text.split("\n")
        expect.equal(text[0], lockupWords(brand, brand.product), "the plain text opens with the lockup's words")
        expect(text.includes("[14] timesheets need your approval"), "the heading")
        expect(text.includes(email.body[1]), "every paragraph")
        expect(text.includes("Review timesheets: https://app.example.com/timesheets"), "the action, with its link written out")
        expect(text.includes("Manage email settings: https://app.example.com/settings/email"), "the footer's link, written out")
      },
    },
    {
      name: "Only http, https and mailto addresses reach the markup",
      example: "timesheets",
      async run({ page, expect, brand }) {
        const [html, logo, scripted] = await page.evaluate(([props, find]) => {
          const kit = new Function(`return (${find})`)()()
          return [
            kit.Email.html({ ...props, action: { label: "Open", href: "javascript:alert(1)" }, footer: [{ label: "Settings", href: " data:text/html,hi" }] }),
            kit.Email.html({ ...props, logoSrc: "data:image/png;base64,iVBORw0KGgo=" }),
            kit.Email.html({ ...props, logoSrc: "javascript:alert(1)", heading: '<img src=x onerror="alert(1)">' }),
          ]
        }, [email, ns.toString()])
        expect(!/javascript:|data:text/i.test(html), "no script or data address")
        expect.equal((html.match(/href="#"/g) ?? []).length, 2, "an unsafe address becomes a harmless #")
        const img = /<img src="data:image\/png;base64,iVBORw0KGgo=" alt="([^"]*)" width="\d+" height="\d+"/.exec(logo)
        expect(img, "a raster logo written in is kept, with both dimensions")
        expect.equal(img?.[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), brand.name, "named for the brand")
        expect(!/javascript:/i.test(scripted) && !/<img src=x/.test(scripted), "a hostile logo address is dropped and a hostile heading is escaped")
      },
    },
    {
      name: "On a touch screen the action is a 44px target, and forced colours keep its edge",
      example: "timesheets",
      touch: true,
      forcedColors: true,
      async run({ scope, expect }) {
        const action = scope.getByRole("link", { name: "Review timesheets" })
        expect.atLeast(Math.round((await action.boundingBox()).height), 44, "the action's height")
        const edge = await action.evaluate((a) => `${getComputedStyle(a).borderTopStyle} ${getComputedStyle(a).borderTopWidth}`)
        expect.equal(edge, "solid 1px", "the button keeps its edge once its fill is gone")
      },
    },
    {
      name: "On a phone it stays inside its width, with nothing running past the edge",
      example: "phone",
      async run({ scope, expect }) {
        const widths = await scope.locator('[data-slot="email"]').evaluate((el) => ({ own: el.getBoundingClientRect().width, scroll: el.scrollWidth, card: el.querySelector(".em-card").getBoundingClientRect().width }))
        expect.equal(Math.round(widths.own), 375, "the email takes the phone's width")
        expect(widths.scroll <= Math.ceil(widths.own), `nothing runs past the edge (${widths.scroll}px)`)
        expect(widths.card <= 343 + 1, `the card sits inside 16px either side (${Math.round(widths.card)}px)`)
      },
    },
  ],
}
