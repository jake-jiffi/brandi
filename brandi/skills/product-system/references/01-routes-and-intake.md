# Routes and intake

Read everything you can reach before you ask anything. The person's time goes on the questions only
they can answer: who uses what, and what the products are for.

## Which route

| Route | You have | The reference build | First command |
| --- | --- | --- | --- |
| A | A Brandi brand: `brand/brand.json` | The system you are about to make | `$A system` |
| B | An existing brand: guidelines, a brand repo, the live site | The system you are about to make | `$A product tokens --input input.json` |
| C | A shipped product: its repo and a running build | The shipped product | Copy its tokens as they are |

Routes B and C stand alone. Brandi need never have been run.

## Route A: a Brandi brand

- `$A status` and `$A system`: the resolved system, its audit, the fonts, the shape and motion
  stances.
- The brand file's voice (`voice` in brand.json) feeds the writing section; its applications feed
  the product list; its decision log tells you what is settled.
- The companion brand skill is the guardian: every product repo gets it.
- Note what the brand system does not cover for a product (status and chart colours for a working
  screen, a density type scale, interface copy rules). Those gaps are the brand-to-product section.

## Route B: an existing brand and website

- **The guidelines**: every colour with its name and value, the faces and their licences, the logo
  files and their clear-space rules, the voice and its banned words. Note the source of every value:
  a page of the guidelines, a file in the brand repo, a computed style on the live site.
- **The brand repo**: tokens, fonts, logos, illustrations. Note its formats (a token file the stack
  cannot use is a finding, not a blocker).
- **The live site**: its computed styles show what the brand actually ships, which is not always
  what the guidelines say. Where the two disagree, record both and ask once.
- **Write the input file** for `$A product tokens --input`:

```json
{
  "name": "Acme",
  "primary": "#0F2A4A",
  "accents": ["#FFD84D"],
  "accentCount": 1,
  "neutralHue": "#0F2A4A",
  "type": { "display": "Fraunces", "body": "Karla", "mono": "JetBrains Mono" },
  "shape": "rounded",
  "motion": "fluid"
}
```

Keep a note beside it of where each value came from. `$A check` and `$A fonts` read a brand file,
which route B does not have: confirm the faces load by rendering a preview, and check work against
the brand by reading it against the guidelines.

## Route C: a shipped product

The system sits downstream of what ships, so it cannot drift from it.

- **Tokens copied as they are.** Record the repo, the commit and the method in the tokens' `meta`
  ("copied as-is from the shipped stylesheet at commit abc1234"). Declare each token's pairs, then
  `$A product audit` measures the shipped values honestly.
- **Components read from the running build**, with their production class names, so the docs point
  at the real markup.
- **Rules learned in production** go into each component's README: the behaviour the team found out
  the hard way (a clock that must not reset for automated messages, one unread signal and not two,
  drafting help that never sends).
- **Boards generated from code** once the product has shipped, rather than drawn by hand.

## For every route: the systems and their failure modes

This is the layer most systems skip, and it is where a product earns trust. For each product, list
the outside systems it reads from and writes to, and how each one fails: not responding, a sync that
stopped, a record that exists in one system and not the other, a time window the other system keys
differently, a permission the person does not have. Every failure mode becomes a state on a states
board and a line in the writing section ("[System] is not responding. Figures below are from 9:42
am."). Name the system in the copy; never "the system".

## The intake batch

One message, asked once, each question with a working assumption the person can accept in one word.
If there is no `AskUserQuestion` tool, ask the questions in one plain message.

1. **Surfaces.** Which will the brand ship on: ops console, customer portal, staff tablet tool,
   consumer app, email and messaging, others? Assumption: the ones its products already have, plus
   the ones its plans name.
2. **People and jobs.** Who uses each surface, and for what, in one line each.
3. **Systems.** What each surface reads from and writes to.
4. **The assistant.** What it may draft, what it may do once a person approves, and what it never
   does. Assumption: it drafts and a person sends; anything that sends, pays, approves, changes
   another system or deletes waits for approval.
5. **Platforms.** Which platforms each surface runs on: web, iOS, iPadOS, macOS, Android, Windows.
6. **Market.** The locale and currency for formatting. Assumption: the brand's home market.

The checked widths (1440, 820 and 390, in light and dark), the bar and the sign-off are settled by
the skill, not asked.

## Recording it

Write the answers into `product/product.json` beside the roles, and every assumption into the open
questions with what changes if it is wrong. The CLI reads the keys it needs (`name`, `roles`,
`displayForTitles`, `displayCase`, `charts`, `time`, `brandColours`, `shape`, `lockup`, `brand`,
`surfaces`, `accepted`) and ignores the rest. Give each surface its board prefix (`boards`), the
widths it is drawn at (`widths`) and, once they are known, its modules: the coverage gate holds the
canvas to them (`08-quality-gates.md`, Coverage). A surface with no `widths` is held to the checked
widths, which suit pages. Messages are read at their own widths, so a messaging surface names them:
an email at 600, a notification on a 390 phone.

A surface with modules (a console, or an app with areas of its own) also gets `pages` once its
boards are drawn. It names each of the ten core page patterns, as `04-written-system.md` (Screen
patterns) names them, with the board that shows it. A pattern the surface does not have is skipped
with `{ "skip": "why" }`: a product with no queue has no list and detail. A marketing site or
messages have no modules and need no `pages`. A pattern neither named nor skipped fails the round,
and so does a surface with modules and no `pages` at all, with every pattern listed to name
(`06-canvas.md`, Every core page).

```json
{
  "name": "Acme product system",
  "route": "B",
  "surfaces": [
    { "name": "Ops console", "people": "Store managers", "jobs": "Approve rosters, fix sync failures", "platforms": ["web"],
      "boards": "Console", "widths": [1440, 820, 390], "modules": ["Rosters", "Sync"],
      "pages": { "Home": "ConsoleHome1440", "Records": "ConsoleRosters1440", "List and detail": "ConsoleSync1440",
        "Record": "ConsoleRoster1440", "Report": "ConsoleReport1440", "Settings": "ConsoleSettings1440",
        "Create and edit": "ConsoleRosterEdit1440", "Setup": { "skip": "stores are set up by head office, outside the product" },
        "The assistant": "ConsoleAsk1440", "Sign in": "ConsoleSignIn1440" } },
    { "name": "Staff app", "people": "Floor staff", "jobs": "Check in, see the day", "platforms": ["ios", "android"],
      "boards": "Staff", "widths": [390] },
    { "name": "Messages", "people": "Store managers", "jobs": "Know a roster needs approving", "platforms": ["email", "ios", "android"],
      "boards": "Messaging", "widths": [600, 390] }
  ],
  "systems": [
    { "name": "[Rostering system]", "fails": ["not responding", "shift keyed outside store hours"] }
  ],
  "assistant": { "drafts": ["replies", "reminders"], "approves": "each action, or the rule behind it" },
  "market": { "locale": "en-AU", "currency": "AUD" },
  "roles": {}
}
```
