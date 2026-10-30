// AIDraftedMarker's one definition: its README, its preview board and its scripted checks all come from here.

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

const DRAFT = "Hi [Sam], a reminder that [Invoice 1042] for [$1,280] was due on [9 October]. You can pay it from the link in the original email. Thanks, [Jo]"
const PANE = "background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;"
const marker = (attrs) => `<x-import component-from-global-scope="NS.AIDraftedMarker" ${attrs}></x-import>`

export default {
  name: "AIDraftedMarker",
  group: "The assistant",
  job: "One line on a draft: who asked the assistant for it, how the brand check went, and who edited it since.",
  status: "to build",
  props: [
    { name: "name", type: "string", doc: "The person who asked for the draft." },
    { name: "trigger", type: "ReactNode", doc: 'An auto-draft has no one who asked: what started it takes the name\'s place, "a new enquiry arrived".' },
    { name: "check", type: '"passed" | "issues" | "checking" | "not-run" | "none"', default: '"not-run"', doc: "How the brand check went. none where no brand check applies, such as a shift note or an incident summary: the line then says only who drafted it." },
    { name: "issues", type: "number", doc: "How many issues the check found." },
    { name: "issuesHref", type: "string", doc: "Where the issues are listed. The line links to them, and the link names what it opens." },
    { name: "editedBy", type: "string", doc: "Who edited the draft since. The product runs the check again." },
    { name: "describes", type: "string", doc: "The id of the draft it labels: the marker becomes that item's description, read with it." },
  ],
  tables: [
    {
      title: "The line",
      head: ["State", "It reads"],
      rows: [
        ["Passed", "Drafted with AI by [name], brand check passed"],
        ["Issues", "Drafted with AI by [name], brand check found 2 issues (a link to them)"],
        ["Checking", "Drafted with AI by [name], checking the brand"],
        ["Not checked", "Drafted with AI by [name], brand check not run"],
        ["Edited", "Drafted with AI by [name], edited by [name], then how the check went again"],
        ["An auto-draft", "Drafted with AI when [trigger], brand check passed"],
      ],
    },
  ],
  notes: {
    Behaviour: [
      "Plain text, tied to the draft as its description (aria-describedby), so a screen reader hears it with the draft. Not a live region: a change of state is not announced.",
      "The issues link is its only focusable part, and it names what it opens.",
    ],
    Layout: ["One line in the meta style on the draft itself, beside its title or its actions, with the assistant's mark."],
    States: ["Passed, issues, checking, not checked, edited, and an auto-draft that names what started it."],
    Copy: ["Each state is a full sentence, in the words of The line. The check's result is in words, never colour alone."],
    Rules: [
      "On anything the assistant writes that a person might send or publish, until a person sends it.",
      "Once a person edits the draft, it says who, and the check runs again.",
      "Draft in neutral is a person's unfinished work. Drafted with AI is the assistant's.",
    ],
  },
  frame: { width: 960, height: 620 },
  examples: [
    {
      id: "on-draft",
      title: "On the draft it labels",
      layout: "block",
      markup: `<div style="${PANE} max-width: 560px;">
<x-import component-from-global-scope="NS.Field" label="Reply to [Sam Lee]">
<x-import component-from-global-scope="NS.TextArea" id="reply-draft" rows="4" default-value="${DRAFT}"></x-import>
</x-import>
${marker('name="[Jo Ellis]" check="passed" describes="reply-draft"')}
</div>`,
    },
    {
      id: "checks",
      title: "Each brand check",
      layout: "block",
      markup: `<div style="${PANE} max-width: 560px;">
${marker('name="[Jo Ellis]" check="passed"')}
${marker('name="[Jo Ellis]" check="issues" issues="{{two}}" issues-href="#brand-issues"')}
${marker('name="[Jo Ellis]" check="checking"')}
${marker('name="[Jo Ellis]"')}
${marker('name="[Jo Ellis]" check="none"')}
</div>`,
      vals: { two: 2 },
    },
    {
      id: "edited",
      title: "Edited since, and an auto-draft",
      layout: "block",
      markup: `<div style="${PANE} max-width: 560px;">
${marker('name="[Jo Ellis]" edited-by="[Sam Lee]" check="checking"')}
${marker('trigger="a new enquiry arrived" check="passed"')}
</div>`,
    },
  ],
  checks: [
    {
      name: "Each state reads as a full sentence, in the catalogue's words",
      async run({ page, expect }) {
        const lines = (await page.locator('[data-slot="ai-drafted-marker"]').allInnerTexts()).map((t) => t.trim())
        expect.equal(
          lines.join(" | "),
          [
            "Drafted with AI by [Jo Ellis], brand check passed",
            "Drafted with AI by [Jo Ellis], brand check passed",
            "Drafted with AI by [Jo Ellis], brand check found 2 issues",
            "Drafted with AI by [Jo Ellis], checking the brand",
            "Drafted with AI by [Jo Ellis], brand check not run",
            "Drafted with AI by [Jo Ellis]",
            "Drafted with AI by [Jo Ellis], edited by [Sam Lee], checking the brand",
            "Drafted with AI when a new enquiry arrived, brand check passed",
          ].join(" | "),
          "the lines"
        )
      },
    },
    {
      name: "It is the draft's description, and not a live region",
      example: "on-draft",
      async run({ scope, expect }) {
        const draft = scope.getByRole("textbox", { name: "Reply to [Sam Lee]" })
        const description = await draft.evaluate((el) => (el.getAttribute("aria-describedby") ?? "").split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim() ?? "").join(" "))
        expect(description.includes("Drafted with AI by [Jo Ellis], brand check passed"), `the draft is described by it: ${description}`)
        const marker = scope.locator('[data-slot="ai-drafted-marker"]')
        const live = await marker.evaluate((el) => Boolean(el.closest('[aria-live], [role="status"], [role="alert"], [role="log"]')))
        expect(!live, "a change of state is not announced")
      },
    },
    {
      name: "The issues link is its only focusable part, and names what it opens",
      example: "checks",
      async run({ scope, expect }) {
        const stops = await scope.evaluate((root) => [...root.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')].map((el) => el.textContent.trim()))
        expect.equal(stops.join(" | "), "brand check found 2 issues", "one focusable part, named for what it opens")
        expect.equal(await scope.getByRole("link", { name: "brand check found 2 issues" }).getAttribute("href"), "#brand-issues", "it opens the issues")
      },
    },
    {
      name: "Its words hold 4.5:1, in both themes",
      example: "checks",
      themes: ["light", "dark"],
      async run({ scope, expect, theme }) {
        for (const m of await scope.locator('[data-slot="ai-drafted-marker"]').all()) {
          expect.atLeast(contrast(await m.evaluate((el) => getComputedStyle(el).color), await groundOf(m)), 4.5, `${theme} words`)
        }
      },
    },
  ],
}
