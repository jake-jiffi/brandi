# Brandi

An agency-grade brand and design system builder for Claude Code, which also runs on Codex.

Give it a logo and a rough idea, or give it nothing at all. It runs the whole engagement: strategy,
three genuinely different visual directions on a canvas you can look at, a real range of logo
concepts if there is no mark yet, a resolved design system with the accessibility work already done,
a brand book, DTCG design tokens, and a companion skill that keeps every future session on brand.

## Install

You need [Claude Code](https://claude.com/claude-code) or Codex. Everything else is built in: Brandi
has no npm dependencies at all. The two hosts are not equal. Claude Code gets all of it, including
the Design canvas, an Artifact you can open, comment on and edit by hand. Codex gets the skills,
the command line and every file Brandi writes. Its visual rounds arrive as PNG previews rather than
a canvas.

**1. Clone it,** in a terminal:

```bash
git clone https://github.com/jake-jiffi/brandi.git
cd brandi
```

**2. Start Claude Code in that folder** and add it as a plugin. These two are typed INSIDE Claude
Code, at its prompt, not in a terminal:

```
/plugin marketplace add .
/plugin install brandi@brandi
```

**3. Restart Claude Code.** Plugins register their commands on the next start.

**4. Go to the project you actually want a brand for**, start Claude Code there, and run:

```
/brandi:brand
```

It writes into `brand/` in whatever directory you started it in, so start it where you want the
brand to live.

**On Codex** the same plugin installs from the same files: in a terminal, `codex plugin marketplace add
<path or owner/repo>` then `codex plugin add brandi@brandi`, and `codex plugin list` should show it.
Codex has no `/brandi:*` commands and no canvas, so you invoke the skills as `$brand-system`,
`$logo-forge` and `$brand-guardian`, and the visual rounds arrive as PNG previews instead of a link.

### Checking it worked

`/brandi:brand-status` should tell you which phase you are in. If the command is not offered,
Claude Code has not picked the plugin up: check `/plugin list` shows `brandi@brandi`, and restart.

After a version bump the installed copy is stale until you refresh it: `/plugin marketplace update
brandi` then `/plugin update brandi@brandi` in Claude Code, or `codex plugin add brandi@brandi` on
Codex (after `codex plugin marketplace upgrade` if you added the marketplace from Git).

### Optional

A Chromium-family browser (Chrome, Chromium, Edge, Brave) is used for the PDF, the asset pack and
artboard previews. Everything else works without one, and Brandi says plainly which outputs it could
not produce rather than reporting a complete set. Set `CHROME_PATH` if yours lives somewhere unusual.

Claude Code puts a plugin's `bin` on PATH from the next session, so `brandi` is not a shell command
until you restart. Nothing depends on that: the skills resolve the command themselves, and fall back
to the installed copy under `~/.claude/plugins/cache/` or `~/.codex/plugins/cache/`. Restart when
convenient, not before you start.

## What you get

```
brand/
  brand.json           the source of truth. Everything else is a view of it
  system.json          the resolved system: every ramp, every token, audited
  brand-book.html      the brand guidelines as a 1920x1080 deck that wears the brand: eight
                       chapters (framework and voice, logo, colour, typography, assets, system,
                       brand in use, rules and decisions), 54 pages for the worked example
  brand-book.pdf       the same, one PDF page per deck page, through headless Chrome
                       (`brandi book --print` writes the earlier A4 print book instead).
                       The deck is a desktop and print document: on a phone the pages
                       reflow, but the PDF is the thing to send
  tokens/
    tokens.json                  Design Tokens Community Group format
    tokens.style-dictionary.json the same, with string dimensions for older pipelines
    tokens.css                   custom properties, three tiers, light and dark
    tailwind.css                 a Tailwind v4 @theme block
    tokens.ts                    typed values for JavaScript
  canvas/              the artboards behind the published canvas, including a
                       generated palette, type specimen, component-state sheet,
                       token reference and logo construction sheet
  assets/logos/
  media/               only with Higgsfield: the plan, every generated file, the boards,
                       and approved/, which is what the book shows and the handover carries
~/.claude/skills/<slug>-brand/   a companion skill that enforces the brand, also linked
                                 into ~/.agents/skills/ when that directory exists, so Codex reads it
```

## The journey

Eight phases. Three of them stop for you. Everything else runs on its own.

| Phase | You do | It does |
| --- | --- | --- |
| Recon | nothing | Finds logos, tokens, colours and typefaces already on disk |
| Intake | answer four questions, once | Logs the evidence and files what is still unknown |
| Strategy | nothing | Positioning, audiences, messaging, distinctive assets |
| Territories | **pick a direction** | Three schools from three different families, on a canvas |
| Identity | **pick a mark**, if there is none | The logo forge, then colour ramps, type scale, shape, motion, audited |
| Voice | nothing | Attributes, tone matrix, vocabulary, from evidence |
| Proof | **look at it** | Website, product screen, mobile, deck, social, print |
| Publish | nothing | Tokens, brand book, PDF, and the enforcement skill |

## Commands

| Command | What it does |
| --- | --- |
| `/brandi:brand` | Start or continue the journey |
| `/brandi:brand-status` | Where it is up to, and what is blocking |
| `/brandi:brand-check [paths]` | Hold real work against the brand |
| `/brandi:brand-canvas` | Rebuild and republish the canvas |
| `/brandi:brand-logo` | Generate a range of marks and take one to a master |
| `/brandi:brand-media` | Photography, scenes, motion, sound and logo sparks, with Higgsfield |

## The logo forge

If there is no usable mark, `/brandi:brand-logo` runs a concept round the way a studio does. It is
the part of this that people expect to be worst, so it is the part with the most machinery behind it.

**A real range, not twelve versions of one idea.** Variety is dealt, not requested. The planner
writes one brief per concept across four families, with no two sharing a typographic register and
symbol approach, the category default used at most twice, and the category's cliches refused at
brief time rather than at review. Each brief goes to a different agent and each agent sees only its
own. Asking for variety produces agreement and then repetition.

**Measured before anybody says what they like.** Every candidate is rendered at 16, 32, 64 and 256
pixels in one browser pass and measured: stroke ratios against ten application contexts, colour
counts, whether the counters close at favicon size, whether two areas were only being told apart by
hue, whether any two concepts are the same idea twice. Once a mark has been praised it is very hard
to fail it on arithmetic, so the arithmetic goes first. Where there is no browser to render with, the
verdict is `unverified` rather than a pass, and the boards say so: the geometry alone cannot see a
hairline drawn as a filled shape.

**A lockup fails the favicon and is still the right primary mark.** The fail budget applies to the
system of three assets, not to any one file. Getting that backwards rejects every lockup, which is
the default architecture.

**Five artboards on a canvas you look at.** The range in black, the same marks in real browser-tab
chrome at 16, 32 and 64 pixels, everything reversed out of a dark ground, and the audit table. The
favicon wall settles most rounds, and it is the test everybody agrees matters and nobody runs.

**Wordmarks are set, not drawn.** A language model drawing letterforms by hand is the most reliable
way to make a wordmark look machine-made. The forge downloads the face, parses it, and converts the
name to outlines, so what ships is artwork with no font dependency. There is a TrueType parser in
here for exactly that reason.

**Then a refinement round, which is not a second concept round.** Each kept direction gets the same
four tasks: the 16-pixel redraw on the pixel grid, proportion, weight, and the square alternate.
Every brief points at the file it is refining and says that a refinement nobody recognises has
failed. The boards show the original first, so every option is judged against it.

**Pick a drawing, get options on that drawing.** When someone points at a sketch, a generated spark
or a photo of a napkin and says "this one", `brandi logo trace` turns it into a clean vector concept
in one command: sub-pixel edges, curves fitted with as few nodes as the tolerance allows, straight
edges made straight, and an overlap score with an overlay against the reference. On the Kinbox
spark it scored 98.9% in under a second, and 96.9% against the master that took five rounds by
hand. The trace then gets a clean-up task ahead of the usual four, and image-model variations can
take the spark itself as their reference.

**A person picks.** Always. `master` normalises the artwork, derives the mono and reversed
renditions, computes the clear-space rule and the minimum sizes from the real geometry, and records
who approved it. Without a name it says nobody has, and keeps saying so. A generated mark is a
starting point somebody approved, not a drawn one; nothing here has been searched or cleared, and
`brand/logo/rights/` holds the checklist with the IP Australia and WIPO links on it.

The `brand-critic` agent reviews a finished canvas adversarially and reports what is wrong, ranked
by consequence. It reads; it never edits.

Everything deterministic is also a command line, if you would rather drive it yourself:

```bash
node brandi/scripts/brandi.mjs --help
```

## What the book ends on

The two things people remember a brand book by are the drawings they loved and the brand on real
things. Brandi used to make both and print neither, so both are now part of the record.

**The illustration library.** `brandi illustration add <files...> --set "Christmas"` records the
finished drawings. The book prints them straight after the Illustration page, two rows of four to
a page and captioned by set, and the handover carries every file. The companion skill tells the
next session where they are, so new work reuses them instead of drawing a new set in another hand.

**Brand in use.** The chapter prints exactly the artboards `applications` names, from `brand/proof`
or `brand/canvas`, and every mockup. Territory sketches and round boards stay out, and `brandi
book` names each artboard it left out. Every brand is put on three real things whatever its
channel: a billboard or poster, a piece of merch, and a card. With Higgsfield, Brandi generates a
blank scene for each (the bus shelter, the tote, the card on a table) and composites the real
artwork onto it through the corners someone read off it. `brandi validate` reports a brand with no
real thing and a style with no recorded drawings, before the book is built.

## Generated media, with Higgsfield

Optional. If the [Higgsfield CLI](https://www.npmjs.com/package/@higgsfield/cli) is installed and
signed in, Brandi says so once in Recon and the pack gains what a language model cannot draw.
If it is not, Brandi says in one line what it would add, and never mentions it again.

**What it makes.** Photography in the art direction, one shot per surface that carries one. Blank
real-world scenes (the shopfront, the van, the sign) that `brandi mockup` then composites the real
mark onto. A logo sting, loops for the hero and for social, a sonic mnemonic, the brand line spoken,
and the mark as a 3D object. Anything else the Higgsfield CLI makes, product shots and marketplace
cards included, comes under the same record with `brandi media import`.

**The mark is never generated.** A sting starts on the brand ground and ends on a frame rendered
from the vector master. Every sting is scored on how exactly its last frame matches that one, so a
model that drifts off the mark is caught before anybody picks it.

**Logo sparks, by default.** With Higgsfield ready, the logo round opens on a spark wall. Each of
the forge's concept briefs goes to a different image model, so a wall of twelve is not one model's
house style twelve times, and every prompt carries the brand's own drawing style. A person picks the sparks
worth pursuing, and says whether they want the drawing or its idea. The drawing is traced; the idea
is redrawn under its brief. The generation manifest records where either came from. A spark can be
picked. It can never be approved into the brand.

**Models are chosen live.** Brandi reads Higgsfield's catalogue and matches models to jobs by what
they take, not what they are called: a sting needs start and end frames, illustration needs hard
palette colours. A newer version of the chosen family is picked up without a code change, and new
models are named the day they appear. `brandi media trial` runs one prompt on the best of every
capable family, so a person can pick the winner and pin it with a reason. Every quality parameter
goes to its top rung on anything that ships.

**Credits are priced before they are spent.** Every run is priced first, and a run that would pass
the plan's budget is refused before a single job starts. Only files inside the project are ever
uploaded.

**A person approves, and the book says what it is.** Approved photography, illustration, motion and
sound get their own pages, each labelled as generated, with the model and the person who approved
it. No generated person is ever presented as a customer or a member of staff.

## What makes it different

**Nothing is invented.** Every statement carries its provenance: supplied, extracted, published,
decided, assumed or open. Assumptions are labelled as assumptions. Gaps are bracketed placeholders,
never plausible-looking fabrications. A brand book with an honest empty section is worth more than
one with an invented full one.

**The maths is real.** Colour ramps are built in OKLCH, because HSL lightness is not perceptual and
ramps built in it are not comparable across hues. Contrast is reported in both WCAG 2.2 and APCA
Lc. Every ramp is gamut mapped by chroma reduction so hue and lightness survive. Colour vision
deficiency is simulated with the Machado matrices. The system audits itself and refuses to advance
when it fails.

**It knows where a system usually breaks.** Filled buttons use an accessible variant of the brand
colour, not the raw one, because most mid-lightness brand colours cannot carry a readable label.
Focus rings are picked to clear 3:1 rather than assumed to. Success and danger are checked for the
red-green collapse and the system says so rather than hoping.

**Code generates the specifications, Claude designs.** The contents page, palette sheet, type
specimen, component states, token sheet and logo construction are generated, because they have to
be exactly right, and a rerun regenerates them rather than letting them drift. The landing page,
the app screen and the poster are authored, because that is where judgement lives, and generating
them from a template is exactly how everything ends up looking the same. The moment you author over
a generated artboard, the generator leaves it alone and says so.

**It fights the defaults.** Sixteen visual schools with real lineage, and a rule set built around
what AI design actually looks like in 2026. Inter, Roboto, Arial, Poppins and Montserrat are banned
outright. Cream and terracotta is called out as the hazard it now is.

**There is always something to hand over.** With no logo, it sets the name properly in the brand's
display face and produces a full construction sheet: clear space as a ratio of the mark, minimum
sizes at actual size, four treatments, and eight misuses drawn rather than described. A typeset
wordmark is a real identity, and it beats a generated mark every time.

**It keeps applying.** Publishing emits a skill named after the brand. Any future session in any
project can load it and check its own work: off-palette colours, off-brand type, banned vocabulary,
removed focus outlines, and the patterns that read as machine-made. The check groups by rule before
it lists instances, skips the artefacts it generated from the brand itself, and tells you when a
result that large means the target is wider than the brand rather than reciting forty thousand
lines at you. It has been run against a 566MB monorepo, which is where most of that was learned.

## Requirements

Node 18 or newer. No npm dependencies at all. A Chromium-family browser is used for the PDF and for
artboard previews, and everything else works without one.

## Development

```bash
cd brandi
node --test "tests/*.test.mjs"
```

1939 tests. They include property tests over the colour and type engines against hundreds of random
seeds, a full end-to-end run of the real command line against the worked example brand in
`tests/fixtures/muddy-paws.json`, and a robustness suite covering corrupt brand files, missing
directories, symlink loops, hostile content and paths with spaces in them.

## Credits

Built from a survey of twenty-seven open brand, design-system and logo projects, kept in
`research/`. The
strongest ideas came from Rampstack's brand pipeline, shaharsha's token taxonomy, Anthropic's own
`frontend-design` and `canvas-design` skills, the Anthropic brand-voice plugin's evidence model, and
Radix Colors' twelve-step scale semantics. The logo forge is built on Rampstack's logo method,
distilled to machine-usable data in `research/findings/08-rampstack-logo-method.md`, which cites a
source line for every number in it. The analysis of each is in `research/findings/`.
