// FileList's one definition: its README, its preview board and its scripted checks all come from here.

const MB = 1024 * 1024
const FILES = [
  { id: "march", name: "[march-statement].csv", size: 2.4 * MB, status: "uploading", progress: 45 },
  { id: "february", name: "[february-statement].csv", size: 1.9 * MB, status: "done" },
  { id: "january", name: "[january-statement].csv", size: 3.1 * MB, status: "failed", error: "The connection dropped. Retry, or remove the file and choose it again." },
  { id: "receipts", name: "[receipts-q3].pdf", size: 820 * 1024, status: "queued" },
]
const NARROW = [
  { id: "photo", name: "[delivery-docket-2026-10-27-front-and-back].jpg", size: 4.2 * MB, status: "uploading", progress: 70 },
  { id: "scan", name: "[signed-contract].pdf", size: 640 * 1024, status: "failed", error: "The file is 24 MB. Split it, or export it without images." },
  { id: "notes", name: "[site-notes].pdf", status: "uploading" },
]

const rows = (scope) => scope.locator('[data-slot="file-list-item"]')
const names = (scope) => rows(scope).evaluateAll((els) => els.map((el) => el.dataset.id).join(","))

export default {
  name: "FileList",
  group: "Inputs",
  job: "The files after a drop: each with its name, size, progress and a way to remove it.",
  status: "to build",
  props: [
    { name: "files", type: 'Array<{ id?: string; name: string; size?: number; progress?: number | null; status?: "queued" | "uploading" | "done" | "failed"; error?: string }>', doc: "The files. Size in bytes; progress from 0 to 100 while uploading, left out while the length is unknown. A failed file's error says what went wrong, then what to do." },
    { name: "onRemove", type: "(id: string) => void", doc: "Adds a remove button to each file, named Remove [file]. The product takes the file out of files." },
    { name: "onRetry", type: "(id: string) => void", doc: "Adds a Retry button to each failed file. The product starts the upload again and sets the file uploading." },
    { name: "label", type: "string", default: '"Files"', doc: "The list's name for screen readers." },
    { name: "empty", type: "ReactNode", default: '"No files added yet."', doc: "What the list says when it holds no files." },
  ],
  notes: {
    Behaviour: [
      "Each file shows its name in full (a long one wraps), its size, and its state in a word and an icon: Waiting to upload, Uploaded, Upload failed. While it uploads, a Progress bar names it and says the numbers in words beside the bar: 1.1 of 2.4 MB.",
      "A failed file says why and what to do next, with Retry under the reason. Retry starts it again, and focus moves to the file's remove button, since Retry has gone.",
      "Remove is named for the file. Removing one moves focus to the next file's remove button, or the one before after the last, or the list itself once it is empty, so focus never falls to the page. Focus moves only once the product has taken the file out, and only if it was still in the list, so a product that asks first never has focus pulled back.",
      "A screen reader hears a file finish, fail, start again or go, through a polite live region, and never each percent or the state the list loaded in.",
      "An upload of unknown length is an indeterminate bar, never a made-up percentage; a missing size is left out, never shown as zero. Under reduced motion the bar slows right down instead of stopping.",
    ],
    Layout: ["Under 400px of its own width the rows tighten. The actions stay beside the name; the name wraps rather than truncating."],
    States: ["Waiting, uploading (known or unknown length), uploaded, failed with its reason, and empty."],
    Copy: [
      "A failure names what failed and the next step: The connection dropped. Retry, or remove the file and choose it again.",
      "Sizes use the unit that suits them: 820 KB, 2.4 MB.",
    ],
    Rules: [
      "Put it under the FileDrop that takes the files. The FileDrop turns away a wrong type; a size limit or a server's refusal is a failed file here, with its reason.",
      "Remove is a 32px target, 40px on touch, with 8px between it and Retry there.",
    ],
  },
  examples: [
    {
      id: "basics",
      title: "Uploading, uploaded, failed and waiting",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.FileList" files="{{files}}" on-remove="{{removeFile}}" on-retry="{{retryFile}}" label="Bank statements"></x-import>`,
    },
    {
      id: "narrow",
      title: "Under a FileDrop, 360px wide, with a long name and an unknown length",
      layout: "block",
      markup: `<div style="display: grid; gap: 12px; width: 360px;">
<x-import component-from-global-scope="NS.FileDrop" title="Drop [delivery photos] here" description="JPG, PNG or PDF, up to 20 MB each" accept="image/jpeg,image/png,.pdf" multiple="{{yes}}"></x-import>
<x-import component-from-global-scope="NS.FileList" files="{{narrowFiles}}" on-remove="{{removeNarrow}}" on-retry="{{retryNarrow}}" label="Delivery photos"></x-import>
</div>`,
      vals: { yes: true },
    },
    {
      id: "empty",
      title: "Empty",
      layout: "block",
      markup: `<x-import component-from-global-scope="NS.FileList" files="{{none}}" empty="No statements added yet. Drop them above." style="display: block; width: 360px;"></x-import>`,
      vals: { none: [] },
    },
  ],
  state: { files: FILES, narrowFiles: NARROW },
  logic: [
    "files: self.state.files",
    "narrowFiles: self.state.narrowFiles",
    "removeFile: (id) => self.setState({ files: self.state.files.filter((f) => f.id !== id) })",
    'retryFile: (id) => self.setState({ files: self.state.files.map((f) => (f.id === id ? Object.assign({}, f, { status: "uploading", progress: 0, error: undefined }) : f)) })',
    "removeNarrow: (id) => self.setState({ narrowFiles: self.state.narrowFiles.filter((f) => f.id !== id) })",
    'retryNarrow: (id) => self.setState({ narrowFiles: self.state.narrowFiles.map((f) => (f.id === id ? Object.assign({}, f, { status: "uploading", progress: 0, error: undefined }) : f)) })',
  ].join(", "),
  frame: { width: 960, height: 996 },
  checks: [
    {
      name: "Each file shows its size, its progress in words while it uploads, and its state in a word and an icon",
      example: "basics",
      async run({ scope, expect }) {
        expect.equal(await scope.getByRole("list", { name: "Bank statements" }).count(), 1, "a list, named")
        const bar = scope.getByRole("progressbar", { name: "[march-statement].csv" })
        expect.equal(await bar.getAttribute("aria-valuetext"), "1.1 of 2.4 MB", "the bar is named for the file and read in words")
        const states = await rows(scope).evaluateAll((els) =>
          els.map((el) => `${el.querySelector('[data-slot="file-list-status"]')?.textContent.trim() ?? "-"}|${el.querySelector('[data-slot="file-list-size"]')?.textContent.trim() ?? "-"}|${el.querySelectorAll('[data-slot="file-list-status"] svg').length}`)
        )
        expect.equal(states[1], "Uploaded|1.9 MB|1", "uploaded, with its size and an icon")
        expect.equal(states[2], "Upload failed. The connection dropped. Retry, or remove the file and choose it again.|3.1 MB|1", "failed, with why and what to do")
        expect.equal(states[3], "Waiting to upload|820 KB|1", "waiting, in KB")
      },
    },
    {
      name: "Remove takes a file away and moves focus to the next file's remove button, then the one before, then the list",
      example: "basics",
      async run({ page, scope, expect }) {
        await scope.getByRole("button", { name: "Remove [february-statement].csv" }).click()
        expect.equal(await names(scope), "march,january,receipts", "the file is gone")
        expect.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Remove [january-statement].csv", "focus moved to the next file's remove button")
        await page.getByRole("button", { name: "Remove [receipts-q3].pdf" }).focus()
        await page.keyboard.press("Enter")
        expect.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Remove [january-statement].csv", "after the last file, the one before")
        await page.keyboard.press("Enter")
        await page.keyboard.press("Enter")
        expect.equal(await page.evaluate(() => document.activeElement.getAttribute("data-slot")), "file-list", "once empty, focus is on the list, never the page")
        expect.equal((await scope.locator('[data-slot="file-list-empty"]').textContent()).trim(), "No files added yet.", "and it says it is empty")
        const region = scope.locator('[data-slot="file-list"] > [aria-live="polite"]')
        await page.waitForFunction((el) => el.textContent.trim() === "[march-statement].csv removed.", await region.elementHandle(), { timeout: 3000 })
        expect.equal((await region.textContent()).trim(), "[march-statement].csv removed.", "each removal is spoken")
      },
    },
    {
      name: "Retry after a failure starts the upload again, says so, and keeps focus in the row",
      example: "basics",
      async run({ page, scope, expect }) {
        const retry = scope.getByRole("button", { name: "Retry [january-statement].csv" })
        await retry.focus()
        await page.keyboard.press("Enter")
        expect.equal(await scope.locator('[data-id="january"]').getAttribute("data-status"), "uploading", "the file is uploading again")
        expect.equal(await scope.getByRole("progressbar", { name: "[january-statement].csv" }).getAttribute("aria-valuetext"), "0 of 3.1 MB", "from the start, in words")
        expect.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Remove [january-statement].csv", "focus moved to the file's remove button, since Retry has gone")
        const region = scope.locator('[data-slot="file-list"] > [aria-live="polite"]')
        await page.waitForFunction((el) => el.textContent.trim() !== "", await region.elementHandle(), { timeout: 3000 })
        expect.equal((await region.textContent()).trim(), "Uploading [january-statement].csv again.", "and it is spoken")
      },
    },
    {
      name: "Remove and Retry are named for the file, 32px, and 40px on touch with 8px between them",
      example: "basics",
      touch: true,
      async run({ scope, expect }) {
        const remove = await scope.getByRole("button", { name: "Remove [january-statement].csv" }).boundingBox()
        const retry = await scope.getByRole("button", { name: "Retry [january-statement].csv" }).boundingBox()
        expect.atLeast(Math.round(Math.min(remove.width, remove.height)), 40, "remove is 40px on touch")
        expect.atLeast(Math.round(retry.height), 40, "retry is 40px tall on touch")
        const apart = Math.max(remove.x - (retry.x + retry.width), retry.x - (remove.x + remove.width), remove.y - (retry.y + retry.height), retry.y - (remove.y + remove.height))
        expect.atLeast(Math.round(apart), 8, "8px between them")
      },
    },
    {
      name: "An unknown length is an indeterminate bar and a missing size is left out, never zero",
      example: "narrow",
      async run({ scope, expect }) {
        const bar = scope.getByRole("progressbar", { name: "[site-notes].pdf" })
        expect.equal(await bar.getAttribute("aria-busy"), "true", "the bar says it is busy")
        expect.equal(await bar.getAttribute("aria-valuenow"), null, "with no made-up value")
        const text = await scope.locator('[data-id="notes"]').textContent()
        expect(!/\b0\b|0 bytes/.test(text), "no zero anywhere for the missing size")
      },
    },
    {
      name: "Narrow, the actions stay beside the name and a long name wraps in full",
      example: "narrow",
      async run({ scope, expect }) {
        const row = scope.locator('[data-id="photo"]')
        const fits = await row.evaluate((el) => {
          const r = el.getBoundingClientRect()
          const button = el.querySelector('[data-slot="file-list-remove"]').getBoundingClientRect()
          const label = el.querySelector('[data-slot="progress-field"] span').getBoundingClientRect()
          return { inside: button.right <= r.right + 0.5 && label.right <= button.left, wraps: label.height > 24, overflow: el.scrollWidth <= el.clientWidth }
        })
        expect(fits.inside, "the remove button sits beside the name, inside the row")
        expect(fits.wraps, "the long name wraps onto a second line")
        expect(fits.overflow, "nothing spills out of the row")
      },
    },
    {
      name: "A failure reads in danger at 4.5:1 on the list, with its icon, in both themes",
      example: "basics",
      themes: ["light", "dark"],
      async run({ scope, expect }) {
        const look = await scope.locator('[data-id="january"] [data-slot="file-list-status"]').evaluate((el) => ({ fg: getComputedStyle(el).color, bg: getComputedStyle(el.closest('[data-slot="file-list"]')).backgroundColor, icon: el.querySelectorAll("svg").length }))
        const channel = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        const lum = (rgb) => {
          const [r, g, b] = rgb.match(/[\d.]+/g).map(Number)
          return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
        }
        const [x, y] = [lum(look.fg), lum(look.bg)].sort((m, n) => n - m)
        expect.atLeast(Number(((x + 0.05) / (y + 0.05)).toFixed(2)), 4.5, "the failure's words against the list")
        expect.equal(look.icon, 1, "and an icon, so it never rides on colour")
      },
    },
    {
      name: "Under reduced motion, an upload of unknown length slows right down instead of stopping",
      example: "narrow",
      reducedMotion: true,
      async run({ scope, expect }) {
        const timing = await scope.locator('[data-id="notes"] [data-slot="progress-indicator"]').evaluate((el) => el.getAnimations().map((a) => a.effect.getTiming().duration))
        expect.equal(timing.join(","), "4800", "one slow sweep, 4.8 seconds a pass")
      },
    },
    {
      name: "Forced colours keep the bar's fill and every state's icon",
      example: "basics",
      forcedColors: true,
      async run({ scope, expect }) {
        const fill = await scope.locator('[data-id="march"] [data-slot="progress-indicator"]').evaluate((el) => getComputedStyle(el).forcedColorAdjust)
        expect.equal(fill, "none", "the bar keeps its Highlight fill")
        expect.equal(await scope.locator('[data-slot="file-list-status"] svg').count(), 3, "each state keeps its icon")
      },
    },
  ],
}
