# 06 — Logo SVG concept generation, construction, gallery and export

Source repos, all under `research/benchmarks/`:

| Short name used below | Path | Shape |
|---|---|---|
| `neonwatty` | `neonwatty_logo-designer-skill/` | Plugin, 1 skill, bash export script, 48 example SVGs |
| `qiguangyang` | `qiguangyang_logo-generator-skill/` | Skill + zero-dep Node studio server + browser canvas export |
| `pranavred` | `pranavred_claude-code-logodesign-skill/` | Skill + 8 topic references + data-driven live-reload preview |
| `GKjohns` | `GKjohns_logo-design-skill/` | House-style skill, 5 canonical reference SVGs, gallery template |
| `atypica` | `atypica-ai_logo-design-skill/` | Single 361-line SKILL.md, no scripts, no assets |
| `wcgordon1` | `wcgordon1_logo-skills/` | Raster/imagegen skill, 5 route references, scorecard, Python preview sheet |

Read in full: every SKILL.md, every reference, every script, the five `GKjohns` reference SVGs, the five `neonwatty` concept SVGs, `neonwatty` iterations 1, 5, 12, 20, 28 and 37, plus the comment header of all 37 iterations.

---

## 1. Concept generation mechanics

### 1.1 How many concepts, and what forces them apart

| Repo | Count | Diversity mechanism | Enforced? |
|---|---|---|---|
| `neonwatty` | 3 to 5 | One assigned creative direction per parallel agent | No check, prose only |
| `qiguangyang` | 3 to 5 | Same, plus a named taxonomy of five directions | No check on distinctness, only on SVG validity |
| `pranavred` | 5 to 15 | Structural category table, minimum 3 of 5 categories | Prose rule, no check |
| `GKjohns` | 5 to 8 | Semantic hooks derived from literal meanings of the name | Prose rule, no check |
| `atypica` | Exactly 3 | Risk-appetite axis (bold / classic / surprise) | Prose rule, no check |
| `wcgordon1` | 3 from 2 to 3 routes | Concept thesis per route, five named routes | Hard gates at critique stage |

Nobody validates that the concepts are actually different. Every diversity guarantee in this corpus is a sentence in a prompt.

### 1.2 Exact wording of the diversity constraints

`neonwatty_logo-designer-skill/skills/logo-designer/SKILL.md:106`:

> Generate 3-5 **distinct** SVG logo concepts. Each concept should take a meaningfully different creative direction — vary the icon metaphor, typography style, layout, or overall aesthetic. Do not generate minor variations of the same idea.

`qiguangyang_logo-generator-skill/SKILL.md:59-62`:

> Generate 3-5 **distinct** concepts — different creative directions, not variations of one idea (e.g., geometric letterform, abstract symbol, negative-space mark, monogram badge, mascot).

`GKjohns_logo-design-skill/SKILL.md:35`:

> **Present at least 5 options.** Aim for 6-8 if the hooks are strong. Every option must pass all six house-style rules above. Vary the *concepts*, not just the colors — five color variants of the same idea is one option, not five.

`GKjohns_logo-design-skill/references/design-principles.md:83`:

> Aim for variety of *concept*, not variety of *color*. "The same bars in five colors" is one option. "Bars + a funnel + a magnifying glass + a grid-with-highlight + a sieve cross-section" is five.

`wcgordon1_logo-skills/skills/logo-designer/SKILL.md:15`:

> Generate genuinely different ideas before polishing one. Do not present recolors as concepts.

`wcgordon1_logo-skills/skills/logo-designer/SKILL.md:61`:

> When producing a concept set, vary the underlying idea and silhouette. A useful default is three concepts from two or three routes. Preserve the user's constraints across every concept.

`pranavred_claude-code-logodesign-skill/skills/logo-design/SKILL.md:174-175`:

> **Explore multiple metaphors, not multiple layouts of one metaphor.** Conceptual diversity matters more than layout variations.
> **Guarantee structural variety.** Every logo set must span multiple *categories* of approach, not just multiple metaphors within the same style. Include at least one from each column when presenting 5+ options: a typographic/wordmark approach, a symbolic icon, an abstract geometric mark, and a letterform-meets-metaphor hybrid.

`wcgordon1_logo-skills/skills/logo-designer/EVALS.md:39` states the failure case explicitly as a regression test:

> | Five outputs are only palette changes | Do not call them concepts; change route, thesis, or silhouette |

### 1.3 The taxonomies, side by side

Four distinct taxonomies exist in the corpus. They are not the same axis, and this matters: two of them will not produce divergence on their own.

**`pranavred` structural categories** (`references/logo-techniques.md:183-193`) — this is the strongest one, because the categories are *construction* categories, not subject categories:

| Category | What it means | Forces you to... |
|---|---|---|
| Typographic/wordmark | The brand name IS the logo, styled distinctively | Explore letterform design, ligatures, custom strokes |
| Symbolic icon | A recognizable object or scene, simplified | Think about what single image represents the brand |
| Abstract geometric | Non-representational shapes, patterns, or compositions | Work with pure form, color, and spatial relationships |
| Letterform + metaphor | A letter that doubles as a visual concept | Find where typography and meaning intersect |
| Negative space / dual-read | Two meanings coexist in one mark (FedEx arrow style) | Think about figure-ground relationships |

Rule at `logo-techniques.md:193`: "Include at least 3 of these 5 categories. If all your concepts are symbolic icons, the set lacks structural variety regardless of how different the symbols are."

**`wcgordon1` concept routes** (`SKILL.md:37-47`) — five routes, each with its own reference file, prompt scaffold and repair list:

| Route | Choose when | File |
|---|---|---|
| Mascot | Character, warmth, trust, memorability, or a service-business personality matters | `references/route-mascot.md` |
| Object | A concrete noun or category-adjacent object can become a proprietary symbol | `references/route-object.md` |
| Abstract | The brand needs a scalable, ownable symbol not tied to a literal object | `references/route-abstract.md` |
| Monogram | Initials are short, distinctive, and useful as the primary recognition device | `references/route-monogram.md` |
| Emblem | Containment, belonging, authority, craft, or a badge-like composition is valuable | `references/route-emblem.md` |

Critically, `wcgordon1` separates route from treatment (`SKILL.md:12`): "Separate the **concept route** from the **rendering treatment**. Mascot, object, abstract, monogram, and emblem are routes; 3D is an optional treatment." And `SKILL.md:110`: "Wordmark-only and symbol-plus-wordmark are output configurations, not additional concept routes." This is the correct factoring and we should copy it. `SOURCES.md:21` records the rejection of a sixth wordmark route on exactly this ground.

**`atypica` logo-style taxonomy** (`skills/logo-design/SKILL.md:27-35`) is a classification of finished marks, not a divergence device: Wordmark, Lettermark/Monogram, Icon + Text, Abstract Mark, Emblem, Combination Mark.

**`atypica` concept axis** (`SKILL.md:294-300`) is a risk axis and produces no structural divergence at all:

| Concept | Direction | Purpose |
|---|---|---|
| A | Bold / innovative | Pushes creative boundaries; the "unexpected" option |
| B | Classic / safe | Proven style, polished execution; the "reliable" option |
| C | Unique angle | A synthesis or an unconventional take; the "surprise" option |

All three of those can be the same kind of mark in three colours. Do not use this axis alone.

### 1.4 Ideation upstream of the taxonomy

`pranavred/references/logo-techniques.md:139-207` is the only real ideation procedure in the corpus. Five steps:

**Step 1, mine the domain** (`logo-techniques.md:143-150`):

> Before thinking about shapes, list 10-15 physical objects, tools, environments, textures, and actions that are *specific to this product's world*:
> - A marine logistics company: knots, anchors, currents, hull cross-sections, container stacks, signal flags, wake patterns, bollards, cargo nets
> - A code editor: cursors, brackets, indentation, diff markers, tree structures, merge arrows, syntax highlighting bands, terminal prompts
> - A bakery: wheat stalks, dough scoring patterns, rolling pins, oven arches, braided loaves, flour dusting, banneton spiral imprints
>
> These domain objects become the raw material. If you can't list 10, you don't know the domain well enough yet.

**Step 2, semantic branching** (`logo-techniques.md:152-163`):

| Level | Example (coffee roaster) | What it produces |
|---|---|---|
| Literal | A coffee bean shape | Recognizable but generic, likely overused |
| Abstract | The bean's center crease as a single curved line | Distinctive, still evocative |
| Unexpected | The crease becomes a sound wave (roasting = transformation) | Unique, carries a second meaning |

> The best logos live at level 2-3. Level 1 is where cliches come from. Always push at least to level 2.

**Step 3, the cliche blacklist** (`logo-techniques.md:167-177`), verbatim and worth lifting whole:

| Industry | Overused motifs to avoid |
|---|---|
| Tech/SaaS | Hexagons, circuit boards, generic nodes-and-edges, globe with lines |
| Finance | Bar charts going up, shield shapes, dollar signs, generic buildings |
| Health/wellness | Hearts, crosses, leaves, human silhouettes with arms up |
| Education | Open books, graduation caps, lightbulbs, apples |
| Food/restaurant | Fork-and-knife, chef hats, plates, steam swirls |
| Creative/design | Pencils, color wheels, paintbrushes, eye symbols |
| Environment/green | Leaves, globes, trees, recycling arrows |

**Step 5, SCAMPER on the strongest concept** (`logo-techniques.md:197-207`): Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse. "You don't need all 7. Even running 2-3 lenses on one concept often produces the most distinctive option in the set."

`GKjohns/references/design-principles.md:76-83` gives a shorter version anchored on the name rather than the domain:

> 1. Write down every **literal meaning** of the name. For "Ledger" that's: a book, ruled lines, a column of numbers, a balance scale, a horizontal shelf.
> 2. For each meaning, name the **most primitive shape** that captures it. Ruled lines = a few horizontal strokes. A balance scale = two rects on either side of a vertical line. Shelf = one long thin rect.
> 3. Reject any hook that requires illustration.
> 4. Reject any hook that has been done a hundred times in every startup deck: lightbulbs, gears, rockets, brains with circuit patterns, infinity loops, abstract swooshes.
> 5. For each surviving hook, sketch the SVG mentally — if you need more than ~6 primitive shapes, simplify or drop it.

`atypica/skills/logo-design/SKILL.md:67-142` takes a third route: letterform analysis of the brand name. Letter anatomy classification (symmetric / ascenders / descenders / round / angular / open counters / diagonal stress, `SKILL.md:75-83`), ligature pairs ("fi, fl, ft, tt, ff, Th, AV, VA, AT, LT, TA", `SKILL.md:90`), and a 26-row letter-to-metaphor table (`SKILL.md:99-123`). The table is a cliche machine (O = "eye, target, globe, sun, ring, lens"; M/W = "mountain range, waves, crown, heartbeat") and directly manufactures the motifs `pranavred` blacklists. The one useful line is the qualifier at `SKILL.md:124`: "Always adapt metaphors to the brand's actual domain — a 'V' for a travel brand suggests a bird in flight; for a fintech brand it suggests a checkmark of verification."

The genuinely useful part of `atypica`'s analysis is the negative-space search, `SKILL.md:93-96`:

> **Negative-space discoveries** — does the combination of letters hide a secondary shape? Iconic examples: FedEx (arrow between E and x), Spartan Golf (golfer in negative space), Toblerone (bear in mountain). Systematically check: between each pair of adjacent letters, what shape does the counter-space form?

### 1.5 Which repos use parallel agents, and what each agent is told

Two do: `neonwatty` and `qiguangyang`. Both use the same architecture.

`neonwatty/skills/logo-designer/SKILL.md:108-130`:

> Use the `Task` tool to generate all concepts in parallel. This is significantly faster than writing them sequentially.
> 1. Create the `logos/concepts/` directory first
> 2. Dispatch one `Task` agent per concept, all in the **same message** so they run concurrently. Each agent should:
>    - Receive the full design brief (format, style, colors, viewBox, SVG conventions)
>    - Be assigned a specific creative direction (e.g., "geometric letterform", "abstract symbol", "mascot-based")
>    - Write its SVG to a specific file path (e.g., `logos/concepts/concept-1.svg`)
>    - Use `subagent_type: "general-purpose"` and `mode: "bypassPermissions"`

The dispatch template, `SKILL.md:122-128`:

```
Task 1: "Write logos/concepts/concept-1.svg — geometric letterform using [colors]. viewBox 512x512. Self-contained SVG, no external fonts. [full SVG conventions]."

Task 2: "Write logos/concepts/concept-2.svg — abstract symbol using [colors]. viewBox 512x512. Self-contained SVG, no external fonts. [full SVG conventions]."

Task 3: "Write logos/concepts/concept-3.svg — mascot-based icon using [colors]. viewBox 512x512. Self-contained SVG, no external fonts. [full SVG conventions]."
```

The load-bearing sentence is `SKILL.md:130`: "Each agent prompt must include: the full SVG conventions from this skill, the target file path, the specific creative direction, and all relevant context (project name, colors, style preferences). **Agents do not share context — give each one everything it needs.**"

`qiguangyang/SKILL.md:64-67` says the same thing more tersely and adds the brief file:

> Dispatch one agent per concept **in a single message** so they run in parallel. Each agent prompt must contain: the full brief, the full SVG conventions below, its assigned creative direction, and its exact output path `logos/concepts/round-1/concept-N.svg`. Agents share no context — include everything.

Note what neither of them does: **no agent is told what the other agents are drawing.** Divergence is bought entirely by the pre-assigned direction label in the prompt. That is why `neonwatty`'s own five shipped concepts all use the identical purple-to-pink gradient (see §6.1) — the palette was in the shared brief and nothing told any agent to move off it.

`qiguangyang` is the only one that validates agent output before showing it, `SKILL.md:68-75`:

> **Validate every SVG** before serving: file exists and is non-empty, starts with `<svg` (after optional XML declaration), has a `viewBox`, contains no external references (no `http://`/`https://` in `href`, `xlink:href`, or `url(...)`, no `<image>` with a remote src, no `<script>`). Regenerate a failed concept once; if it fails again, drop it (minimum 3 concepts must survive).

`wcgordon1` deliberately rejects the batch approach for a different reason, `references/imagegen-execution.md:13`:

> Use a separate call for every distinct asset or concept. Do not request a contact sheet of unrelated alternatives as one generated image. Separate calls make the prompt, result, critique, and revision traceable.

And `references/transformed-examples.md:29-31` names the anti-pattern:

> **Bad approach:** Ask one model call for a mascot, abstract mark, object, monogram, emblem, wordmark, and six 3D materials in a labeled grid "like" five famous brands.
> **Why it fails:** Concepts become tiny, prompts conflict, text degrades, reference imitation risk rises, and no result has an attributable revision path.

### 1.6 The brief artefact

`qiguangyang` is the only one that writes a persisted brief file, `SKILL.md:51-54`:

> Write the consolidated brief to `logos/brief.md`: product name, one-line essence, audience, format, style direction, palette (hex values), and any hard constraints. Keep it under 40 lines — the gallery shows it and every generation agent receives it.

The 40-line cap is deliberate and correct: the brief is pasted into every parallel agent prompt and rendered in the gallery (`scripts/logo-studio.js:98-101` truncates to 2000 chars; `scripts/gallery.html:102-112` renders it in a `<details>` element).

`wcgordon1/assets/logo-brief-template.md` is the richest brief schema in the corpus, 17 fields:

```
- Brand name:
- Required initials or exact text:
- Product or service:
- Primary audience:
- Category and notable competitors:
- Desired brand signals (2–4):
- Must-use or forbidden ideas:
- Reference images and the attribute each represents:
- Preferred concept route, or auto-route:
- Output configuration: symbol / wordmark / combination:
- Rendering treatment: flat / optional 3D / undecided:
- Most important applications:
- Smallest required display size:
- Color constraints:
- Production formats requested:
- Assumptions and unresolved decisions:
```

Two fields there are missing everywhere else and are worth stealing: "Reference images and the attribute each represents" (forces reference to be decomposed into attributes rather than copied) and "Smallest required display size" (makes the small-size gate a number rather than a vibe).

### 1.7 The intake question sets

`pranavred/skills/logo-design/SKILL.md:123-172` has the best intake in the corpus, and the reasoning is explicit at `SKILL.md:123`:

> **Always clarify design direction before creating logos.** Use AskUserQuestion to present curated design direction choices before writing any SVG code. This step is mandatory for all logo projects. Even when the user provides some direction (like "modern" or "YC style"), those are vibes, not design briefs. A designer would still present options to narrow the direction before investing in 5-15 concepts.

Three questions: Mood, Focus, Inspiration. The Inspiration one is the interesting one (`SKILL.md:152-166`), because it anchors on real named brands the user has an opinion about, and the skill instructs the agent to regenerate the option list per domain:

> **Tailoring the questions to the domain is critical.** The mood options, focus options, and especially the inspiration logos must be specific to the user's industry. A coffee brand gets Blue Bottle, Stumptown, Intelligentsia, Counter Culture as inspiration options. A fintech startup gets Stripe, Plaid, Mercury, Ramp. A fitness app gets Peloton, Strava, Nike Run Club, Whoop. Pick brands the user will immediately recognize and have an opinion about. **The inspiration question does the most work here because it anchors the entire aesthetic direction to something concrete.** (`SKILL.md:170`)

Escape hatch at `SKILL.md:172`: "The only exception: skip if the user has specified both a concrete visual style AND specific imagery (e.g., 'minimalist geometric logo using a mountain silhouette in navy blue')."

`neonwatty/SKILL.md:31-81` gives four literal `AskUserQuestion` blocks (Format, Style, Colors, Size) with the adaptation rules at `SKILL.md:85-88`:

> - **User points to a repo:** Gather context first, then ask only format + style (colors are likely known).
> - **User says "design a logo for X":** Ask format, style, and colors together.
> - **User gives detailed description:** Skip everything already covered, ask only what's missing.
> - **User says "just make something":** Use sensible defaults (icon only, minimal, surprise me) and go straight to Phase 2.

`GKjohns/SKILL.md:29` goes the other way: "**Clarify briefly (one question max).** Ask only the thing you can't infer."

`wcgordon1/SKILL.md:35`: "Ask only the few questions whose answers would materially change the design. If the brief is incomplete but workable, state assumptions and continue."

`atypica/SKILL.md:16-36` demands four required and four recommended fields plus a mandatory web-research phase (`SKILL.md:42`, "**You must conduct web research before designing.**") and a hard user checkpoint at `SKILL.md:142` ("**Wait for user confirmation** on the direction before proceeding to design"). Three blocking checkpoints before a single pixel exists. Too slow for our use case.

---

## 2. SVG construction technique

### 2.1 viewBox conventions and coordinate systems

Three incompatible conventions in the corpus.

**512 / 1024x512 (logo-scale), `neonwatty` and `qiguangyang`.** `neonwatty/SKILL.md:96`:

> **viewBox sizing** — Always use `viewBox="0 0 W H"` without fixed `width`/`height` attributes. Use 512x512 for icons, 1024x512 for wordmarks/combination marks.

`qiguangyang/SKILL.md:81-82` identical: `viewBox="0 0 512 512"` for icons; `viewBox="0 0 1024 512"` for wordmarks and combination marks. No `width`/`height` attributes on `<svg>`.

**24 (icon-scale), `pranavred`.** `SKILL.md:28-33` skeleton:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- content -->
</svg>
```

with a canvas table at `SKILL.md:37-44` (16 micro/favicon, 20 small UI, 24 standard, 32 medium, 48 large display, custom for logos) and the instruction at `SKILL.md:46`: "**Default to 24x24** unless there's a reason not to. It's the industry standard." That is icon-library advice, and applying it to logos costs you all sub-unit precision. `pranavred`'s own logo material then works at 32 (`references/logo-techniques.md:241`, `logo-techniques.md:270-282`).

**Free/tight, `GKjohns`.** Its five references use five different viewBoxes: `80 80` (margin.svg:1), `400 400` with fixed width/height (daylight.svg:1), `10 10 60 60` (takeout.svg:1, non-zero origin), `48 33` (sift.svg:1, non-square), `64 64` (aria.svg:1). The stated rule (`references/design-principles.md:61`) is a ratio, not a number: "no stroke thinner than 3 units in a 64-unit viewBox, no gap smaller than 4 units."

`pranavred`'s anti-pattern table (`SKILL.md:198`) and `logo-techniques.md:330` both require a tight viewBox: "`viewBox` is tight to the artwork (no excess whitespace)."

**Recommendation for our generator:** 512 square for the mark, 1024x512 for the lockup, coordinates as integers on a 512 grid. That gives you 512 steps of precision, exact halving down to 16, and `stroke-width` numbers that map cleanly (a 6-unit stroke at 512 is 0.19px at 16px render, which is the actual reason `neonwatty`'s "stroke-width of 6+" rule at `SKILL.md:101` is too weak — see §6.7).

### 2.2 Grid and construction discipline

`pranavred/references/icon-design.md:71-83` is the only construction-grid material in the corpus:

```
+------------------------+
|  1px padding (all sides)|
|  +------------------+  |
|  |   20x20 live     |  |
|  |    area          |  |
|  +------------------+  |
+------------------------+
```

> - **Trim area:** Full 24x24 canvas. Nothing should extend beyond this.
> - **Live area:** 20x20 (2px padding on each side). All icon content should fit within this zone.

Keyline shapes (`icon-design.md:94-99`), which is the real optical-mass device:

| Shape | Dimensions (within 20x20 live area) | Use for |
|---|---|---|
| Circle | 20px diameter | Round icons (globe, user avatar) |
| Square | 18x18 | Square icons (file, card) |
| Vertical rectangle | 16x20 | Tall icons (document, phone) |
| Horizontal rectangle | 20x16 | Wide icons (landscape, video) |

> The keylines ensure different-shaped icons occupy similar visual space.

Scaled to a 512 canvas: circle 426, square 384, vertical 341x426, horizontal 426x341, on an 85% live area. That is directly implementable.

**Vertical budgeting** is the other genuinely useful construction idea, `pranavred/SKILL.md:185`:

> **Plan your vertical budget before drawing.** On a 32x32 canvas with 3 stacked elements, you have ~30 usable units. Sketch the vertical distribution first (e.g., box=12, gap=2, layer=5, gap=2, layer=5) to avoid clipping at viewBox edges.

Worked example at `references/logo-techniques.md:270-282`:

```
viewBox height: 32
Top padding:     2  (y=0 to y=2)
Layer 2:         4  (y=2 to y=6, diamond spans 4 units tall)
Gap:             2
Layer 1:         4  (y=8 to y=12)
Gap:             2
Box top:         5  (y=14 to y=19)
Box sides:       7  (y=19 to y=26)
Bottom padding:  2  (y=26 to y=32, but box extends to ~y=30)
```

> Sketch this budget on paper first. Adjusting after the fact is tedious because moving one element means moving everything.

This is the single most useful "how to actually write the SVG" instruction in the corpus and it is why `GKjohns`'s sift.svg is clean: `x=0 y=0 w=48 h=7`, `x=8 y=13 w=32 h=7`, `x=16 y=26 w=16 h=7` (sift.svg:4-6) is a budget, executed. Widths halve, x offsets are `(48-w)/2`, gaps are 6 units.

### 2.3 How they set type

Every repo says "convert text to paths" and **not one of them provides a mechanism.**

`neonwatty/SKILL.md:98`:

> **Text handling** — Use widely available system fonts (Arial, Helvetica, Georgia, etc.) or convert text to `<path>` elements. When using system fonts, always include a generic fallback (e.g., `font-family="Helvetica, Arial, sans-serif"`).

`pranavred/SKILL.md:195` anti-pattern row: "Use `<text>` for logo wordmarks in distributed SVGs → Convert text to paths for portability."

`pranavred/references/logo-techniques.md:13-27` gives the only decision rule and the only cost estimate:

> ### When to use `<text>`
> - Internal tools, dashboards, or prototypes where the font is guaranteed
> - Dynamic text that changes (user names, labels)
> - SVGs that need to be searchable/indexable
> - When file size matters (text is tiny compared to outlined paths)
>
> ### When to convert text to paths
> - Logo wordmarks distributed as standalone files
> - Any SVG that must render identically without font dependencies
> - Icons containing letterforms (like a "B" for bold icon)
> - Print/brand assets
>
> **Trade-off:** Outlined text bloats file size significantly. A single word can go from ~200 bytes as `<text>` to 5-10KB as paths. Only outline when portability is required.

`atypica/SKILL.md:239-241`:

> - **Preferred: convert text to SVG `<path>`** for the final logo — eliminates font-loading dependencies and ensures pixel-perfect rendering everywhere
> - When using live text (for editability), import Google Fonts via `@import` in `<style>` and always specify a fallback stack
> - For wordmarks and lettermarks, path conversion is **strongly recommended**

The `@import` advice is wrong for a distributed logo: it is an external network reference, which `qiguangyang/SKILL.md:83-85` explicitly forbids ("no external fonts, images, stylesheets, or network references of any kind"), and it will not resolve inside `<img>` or in a rasteriser.

**What actually ships in the examples:** live `<text>` with a font that is not installed. `neonwatty/examples/bleep-that-shit/concepts/concept-1.svg:15`:

```xml
<text x="172" y="233" font-family="Inter, Helvetica, Arial, sans-serif" font-size="36" font-weight="800" fill="#fafafa">*!@#%!</text>
```

and `iterations/iteration-1.svg:23`:

```xml
<text x="256" y="267" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="32" font-weight="800" fill="#ef4444">*!@#</text>
```

`pranavred/references/editing-workflow.md:27` does the same in its own composition example, with no fallback at all, directly contradicting its own anti-pattern table:

```xml
<text x="44" y="28" font-family="Inter" font-size="20" font-weight="700" fill="currentColor">
  BrandName
</text>
```

**This is the biggest gap in the corpus and the first thing our generator must solve.** Options: bundle a variable font and run a glyph-outline extraction step; drive `text-to-path` through an available CLI; or restrict wordmarks to hand-constructed geometric letterforms on the 512 grid. `wcgordon1/references/route-monogram.md:14` is the only honest statement of the constraint: "Use image generation for exploration only. Rebuild promising letterforms with deterministic vector geometry before calling them final."

`wcgordon1/SKILL.md:112` on verification: "For generated text, verify spelling, letter order, counters, spacing, and accidental ligatures at full resolution." And `route-monogram.md:30-36`:

> Manually inspect:
> 1. every letter and its order,
> 2. counters and joins at full size,
> 3. recognition at 16–32 px,
> 4. accidental glyphs in rotation or reflection,
> 5. black and reversed-white versions.

### 2.4 Stroke versus fill

The corpus agrees: **fill by default for logos, stroke by default for icons.**

`pranavred/SKILL.md:61-67` styling defaults table:

| Attribute | Icon default | Logo default | Why |
|---|---|---|---|
| `fill` | `none` | varies | Icons are typically stroked, logos are filled |
| `stroke` | `currentColor` | `none` or `currentColor` | Inherits text color from parent |
| `stroke-width` | `2` (on 24x24) | varies | Consistent weight across icons |
| `stroke-linecap` | `round` | `round` or `butt` | Rounded ends look cleaner at small sizes |
| `stroke-linejoin` | `round` | `round` or `miter` | Prevents sharp spikes at joins |

`neonwatty/SKILL.md:100-101`:

> - **Flat fills by default** — Use solid `fill` colors. Only use gradients (`<linearGradient>`, `<radialGradient>`) when the user requests them or the style clearly calls for it.
> - **Small-size legibility** — Logos must work at 16-32px (favicons). Prefer solid fills over thin strokes, avoid fine details that disappear at small sizes, and use `stroke-width` of 6+ for any outlines that need to remain visible.

`qiguangyang/SKILL.md:92-93`: "Must survive 16-32 px: solid shapes over thin strokes (stroke-width >= 6 if outlines are essential), no fine detail that vanishes at favicon size."

The stroke-width-to-viewBox ratio table, `pranavred/SKILL.md:75-81` — this is the number to actually implement:

| viewBox | Typical stroke-width | Visual result |
|---|---|---|
| 16x16 | 1.5 | ~9.4% of canvas |
| 24x24 | 2 | ~8.3% of canvas |
| 32x32 | 2-2.5 | ~6.3-7.8% of canvas |
| 48x48 | 3 | ~6.3% of canvas |
| 256x256 | 16 | ~6.3% of canvas |

Extrapolating to 512: **32 units is the 6.3% baseline, 40 is the 8% weight.** `neonwatty`'s "6+" on a 512 canvas is 1.2% of the canvas, which vanishes below about 100px. Their own final logo uses `stroke-width="4"` and `stroke-width="6"` on a 512 canvas (`iterations/iteration-37.svg:20-25`) purely as a comic-book outline on top of solid fills, which is the only reason it survives.

The gotcha nobody but `pranavred` states, `references/accessibility-and-pitfalls.md:41`:

> Strokes are centered on the path. A `stroke-width="2"` extends 1 unit on each side. If your path touches the viewBox edge, the stroke gets clipped. Inset shapes by half the stroke width. This is why icon guidelines specify 1-2px padding from the viewBox edge.

And `accessibility-and-pitfalls.md:19`: "`stroke-width` is in viewBox units, not pixels. A `stroke-width="2"` on a `viewBox="0 0 24 24"` SVG rendered at 48px appears as 4px thick. Use `vector-effect="non-scaling-stroke"` only for maps/technical drawings."

`GKjohns` states its own floor as a ratio, `references/design-principles.md:61`: "no stroke thinner than 3 units in a 64-unit viewBox, no gap smaller than 4 units" — that is 4.7% stroke, 6.25% gap. Scaled to 512: minimum stroke 24, minimum gap 32.

### 2.5 Optical correction

Thin coverage, all of it in `pranavred/references/icon-design.md:46-65`.

Visual weight compensation (`icon-design.md:50-55`):

| Shape | Adjustment needed |
|---|---|
| Circle | Slightly larger than a square to look the same size |
| Triangle | Needs to be taller than a square to match visual weight |
| Horizontal line | Looks lighter than vertical line of same dimensions |
| Detailed icon | Looks heavier than simple icon at same size |

The blur test (`icon-design.md:57-59`):

> Squint at your icon or apply a gaussian blur. If it looks significantly darker/lighter than neighboring icons, adjust the visual weight. A set of icons should look roughly equally "dense" when blurred.

Optical centring (`icon-design.md:61-65`):

> Mathematical center != visual center. A "play" triangle centered mathematically looks too far left. Shift it slightly right to look visually centered. An arrow pointing right needs to be shifted a few units right.
> **General rule:** Shift directional shapes ~1-2 units (on 24x24 grid) in their "pointing" direction.

That is 4 to 8 percent of canvas width; on 512 that is 21 to 43 units.

Pixel snapping (`icon-design.md:19-33`):

| Stroke width | Position line center at | Why |
|---|---|---|
| 1 | x.5 (half pixel) | 0.5 + 0.5 = fills exactly 1 pixel |
| 1.5 | integer | 0.75 on each side, rounds to 1px each |
| 2 | integer | 1 + 1 = fills exactly 2 pixels |
| 3 | x.5 (half pixel) | 1.5 + 1.5 = fills exactly 3 pixels |

`atypica/SKILL.md:232-236` gestures at typographic optics with no method:

> - **Letter-spacing:** optically adjust per character pair, not a uniform value — critical for wordmarks
> - **Baseline alignment:** when combining icon and text, align to optical center, not mathematical center

**Nothing in the corpus covers overshoot** (rounds and points must exceed the cap/baseline of flats by roughly 1 to 1.5% to look aligned), x-height matching between a mark and a wordmark, or side bearings. That is a gap we should fill ourselves.

### 2.6 currentColor and CSS variables

Three positions.

**`GKjohns`: `currentColor` is the default and gradients are banned** (`references/design-principles.md:44-48`):

> - `fill="currentColor"` / `stroke="currentColor"` — the parent element controls the color via CSS `color`. Use this when the logo is one solid color.
> - Tailwind semantic classes — `class="fill-primary"`, `class="stroke-sky-500 dark:stroke-sky-400"`. Use this when the project has a Nuxt UI theme.
> - A single hex accent — only for cases where the brand color is locked in and will never change.
>
> Never use gradients. Never use more than two colors. If you need two, they should be a tint of the same hue (e.g. sky-500 + sky-300).

Do not mix approaches, `references/svg-patterns.md:102`: "Pick one approach per logo. Don't mix `fill='currentColor'` and hardcoded classes in the same mark."

And the crucial split for the favicon, `svg-patterns.md:154-164`:

> For a Nuxt project, drop the standalone mark SVG at `public/favicon.svg` with a hardcoded fill so it renders correctly when loaded as a favicon (no CSS context).
>
> ```svg
> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
>   <path d="..." fill="#0ea5e9" />  <!-- hardcoded -->
> </svg>
> ```
>
> Keep the hardcoded-fill favicon *separate* from the themed component version. The component uses `currentColor`; the favicon uses a literal hex.

**This is the correct architecture and we should copy it exactly:** two masters, one themed (`currentColor`) for in-app use, one frozen (literal hex) for anything loaded without CSS context — favicon, `<img>`, OG image, rasteriser input.

**`pranavred`: `currentColor` for icons, separate `-dark.svg` files for coloured logos.** `SKILL.md:69`: "**`currentColor` is your friend.** It lets the SVG inherit whatever color the parent element has, making icons themeable with zero extra CSS." Then `SKILL.md:184`:

> **For colored logos, always create a `-dark.svg` variant.** Dark navy edges (#1E3A5F) that look great on white disappear on dark backgrounds. Dark variants need lighter edges (#4B8BBE), lighter rings (#3B6B8A), and off-white centers (#E2E8F0).

With the mapping table at `references/logo-techniques.md:291-296`:

| Element | Light mode | Dark mode | Why |
|---|---|---|---|
| Connection lines | `#1E3A5F` (dark navy) | `#4B8BBE` (medium blue) | Navy disappears on dark backgrounds |
| Node outer rings | `#1E3A5F` | `#3B6B8A` (steel blue) | Needs contrast against dark bg |
| White fills | `#FFFFFF` | `#E2E8F0` (off-white) | Pure white is harsh on dark bg |
| Colored fills | Same hex values | Same or slightly brighter | Colors already pop on dark |

And the reason a CSS filter is not enough, `references/accessibility-and-pitfalls.md:55`: "CSS `filter: brightness(0) invert(1)` only works for monochrome SVGs. Create separate `-dark.svg` variants with lighter structural colors. Keep colored fills the same; lighten edges, rings, and connection lines."

Naming, `logo-techniques.md:300-303`: `logo-color-blue.svg` / `logo-color-blue-dark.svg`.

**`atypica`: CSS custom properties inside the SVG** (`SKILL.md:203-212`):

```svg
<style>
  :root {
    --brand-primary: #2563EB;
    --brand-accent: #F59E0B;
    --brand-dark: #1E293B;
  }
</style>
```

Risky. Custom-property support in SVG rasterisers is inconsistent (resvg and librsvg have partial or no support for CSS custom properties), and many SVGO configurations drop or inline `<style>`. A logo whose only colour definition lives in a custom property can rasterise black or transparent. Use it for the inline-in-app variant only, never for the frozen master.

### 2.7 Mono and reverse versions

Weakest area of the corpus. Requirements are stated; procedures barely exist.

`atypica/SKILL.md:200`: "**Always produce a monochrome (black/white) version** — it is the true test of a logo's structural strength." Deliverables at `SKILL.md:340-344`:

> 1. **Full-color version** — the primary brand logo
> 2. **Monochrome version** — single-color (black) for maximum versatility
> 3. **Reversed version** — white/light version for dark backgrounds
> 4. **Usage notes:** Minimum recommended display size; Clear-space guidelines (safe area around the logo); Color values (hex, RGB); Brief do's and don'ts

No method given for any of the three.

`wcgordon1` treats mono as a gate rather than a deliverable, `references/critique-and-repair.md:12`: "Does the mark work in black and reversed white?" and `SKILL.md:101`: "flat color, black, and white versions when production files are requested". `assets/logo-scorecard.json:11` has `monochrome_viable` as a hard gate and `scores.monochrome_viability` as a scored dimension. Repair, `critique-and-repair.md:44`: "3D dependence → Rebuild the one-color master."

`GKjohns` gets mono for free by construction, since rules 3 and 4 (`design-principles.md:40-54`) make every logo one colour or a primary plus a same-hue tint, expressed as `currentColor` or a Tailwind class. Reverse is then just `class="text-white"` (`svg-patterns.md:93`).

`pranavred/references/editing-workflow.md:122` handles reverse in the preview only, via a filter: "Omit for monochrome (auto-applies `filter:brightness(0) invert(1)`)".

**The practical recipe our generator needs, assembled from the fragments:**
1. Frozen colour master (literal hex).
2. Themed master (`currentColor`, single colour), which yields mono and reverse for free.
3. For multi-colour marks, an explicit `-dark.svg` with the `pranavred` mapping applied: lighten structural/edge colours, keep brand fills, replace pure white with off-white.
4. Mono master with all fills flattened to one hex, tints resolved by area (larger mass keeps the fill, smaller mass becomes a knockout, not a lighter grey).
5. Verify all four in the gallery on both backgrounds before shipping.

### 2.8 Negative space, boolean operations and the primitive vocabulary

`GKjohns/references/design-principles.md:30-38` defines the whole allowed vocabulary, and it is the right constraint for a generator because it is what an LLM can actually author correctly:

> Every reference logo can be written in under 10 lines of SVG using only:
> - `<rect>` (with optional `rx` for rounding)
> - `<circle>` / `<ellipse>`
> - `<line>`
> - `<path>` with simple `M / L / Q / A / Z` commands
> - `<mask>` for negative space
>
> If you find yourself reaching for intricate bezier curves (`C` commands with multiple control points), filters, or gradients to make it work, the concept is too complex. Start over with a simpler hook.

The five patterns, all copy-pasteable (`references/svg-patterns.md`):

**Mask to punch negative space** (`svg-patterns.md:9-21`, shipped in `assets/sources/margin.svg`):

```svg
<svg viewBox="0 0 80 80" fill="none">
  <defs>
    <mask id="cut">
      <rect x="0" y="0" width="80" height="80" fill="white" />
      <!-- whatever is black gets subtracted -->
      <rect x="20" y="12" width="3" height="56" fill="black" />
    </mask>
  </defs>
  <rect x="8" y="4" width="56" height="72" rx="4"
        fill="currentColor" mask="url(#cut)" />
</svg>
```

**Arc as a bite out of a shape** (`svg-patterns.md:28-40`, shipped in `assets/sources/daylight.svg`):

```svg
<path d="M68 20
         L380 20
         Q400 20 400 68
         L400 332
         Q400 380 332 380
         L68 380
         Q20 380 20 332
         L20 180
         A160 160 0 0 0 180 20
         Z" fill="currentColor" />
```

> The `A 160 160 0 0 0 180 20` is the bite — a 160-radius arc from the current point up to `(180, 20)`.

**Zig-zag edge with rounded body** (`svg-patterns.md:47-50`, shipped in `takeout.svg`): alternate `L x y` with alternating y values for teeth, close with `Q` for rounded bottom corners.

**Stacked rects with narrowing widths** (`svg-patterns.md:58-62`, shipped as `sift.svg`):

```svg
<svg viewBox="0 0 48 33" fill="none">
  <rect x="0"  y="0"  width="48" height="7" rx="2" fill="currentColor" />
  <rect x="8"  y="13" width="32" height="7" rx="2" fill="currentColor" />
  <rect x="16" y="26" width="16" height="7" rx="2" fill="currentColor" />
</svg>
```

**Lines with primary/tint hierarchy** (`svg-patterns.md:70-80`, shipped as `aria.svg`): three `<line>` elements, the middle one heavier (`stroke-width="5"` vs `4`) and in the primary colour, the outer two in a 300-level tint. Quiet hierarchy from two values of one hue.

`pranavred` covers the boolean equivalents (`references/editing-workflow.md:33-72`): union = merge path data with default `nonzero`; subtract = `fill-rule="evenodd"` with overlapping subpaths; intersect = `<clipPath>`; exclude/XOR = `evenodd` with both shapes in one path. The `evenodd` explanation at `references/logo-techniques.md:33-42` and `SKILL.md:107`:

> Use `evenodd` when you have compound shapes with holes. It's simpler because you don't need to worry about winding direction. With `nonzero` (default), the inner circle must wind in the opposite direction to create the hole.

```xml
<!-- Donut using evenodd (direction doesn't matter) -->
<path fill-rule="evenodd" d="
  M 12 2 A 10 10 0 1 1 12 22 A 10 10 0 1 1 12 2 Z
  M 12 7 A 5 5 0 1 1 12 17 A 5 5 0 1 1 12 7 Z
" fill="black" />
```

`clip-path` vs `mask` decision table, `pranavred/references/advanced-techniques.md:12-17`: clip-path is binary and faster, mask is luminance-based and slower; clip-path for hard-edged cutouts, mask for soft edges.

Rounded-rect-to-path template, `pranavred/SKILL.md:100-102` (the arc parameters are the error-prone bit, so this is worth keeping verbatim):

```xml
<!-- <rect x="2" y="2" width="20" height="20" rx="3" /> becomes: -->
<path d="M 5 2 h 14 a 3 3 0 0 1 3 3 v 14 a 3 3 0 0 1 -3 3 h -14 a 3 3 0 0 1 -3 -3 v -14 a 3 3 0 0 1 3 -3 Z" />
```

Arc flag reference, `pranavred/references/path-patterns.md:8-13`:

```
A rx ry x-rotation large-arc-flag sweep-flag x y

large-arc=0, sweep=0  ->  small arc, counter-clockwise
large-arc=0, sweep=1  ->  small arc, clockwise
large-arc=1, sweep=0  ->  large arc, counter-clockwise
large-arc=1, sweep=1  ->  large arc, clockwise
```

Plus a set of hand-written path templates on a 24 grid (`path-patterns.md:16-45`): square, equilateral triangle, plus, checkmark, X, circle-from-arcs, rounded rect, heart, five-point star. Low value at 512 scale but the circle-from-two-arcs form is worth knowing: `M 12 2 A 10 10 0 1 1 12 22 A 10 10 0 1 1 12 2 Z`.

Rotational symmetry, `pranavred/references/logo-techniques.md:130-136`:

```xml
<!-- 3-part rotational logo -->
<g fill="currentColor">
  <path d="M 12 4 L 14 10 L 12 12 Z" />
  <path d="M 12 4 L 14 10 L 12 12 Z" transform="rotate(120 12 12)" />
  <path d="M 12 4 L 14 10 L 12 12 Z" transform="rotate(240 12 12)" />
</g>
```

`neonwatty`'s asterisk concept uses exactly this device with `rotate(60 256 256)` and `rotate(-60 256 256)` on an identical rect (`concepts/concept-5.svg:14-18`), which is the cheapest way to get a radially symmetric mark and is trivially parameterisable.

### 2.9 Group structure and semantic markup

`neonwatty/SKILL.md:99`:

> **Meaningful groups** — Wrap logical sections in `<g>` elements with descriptive IDs: `id="icon"`, `id="wordmark"`, `id="tagline"`. This makes iteration easier when the user says "make the icon bigger" or "change the wordmark color".

This is load-bearing downstream: the `#icon` group is what the export step extracts to build the square favicon (`SKILL.md:251-255`, `SKILL.md:377-380`), and `SKILL.md:319` requires it to be stable: "Keep SVG structure consistent across iterations (same group IDs) so the user can track what changed." Every one of the 48 example SVGs wraps everything in `<g id="icon">`.

`atypica/SKILL.md:249-261` file skeleton with accessibility:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}"
     role="img" aria-label="{Brand Name} Logo">
  <title>{Brand Name} Logo — {Variant Description}</title>
  <desc>Brief description of the logo design for accessibility.</desc>
  <defs>
    <!-- Gradients, clip paths, masks -->
  </defs>
  <style>
    /* CSS custom properties, font imports */
  </style>
  <!-- Logo geometry -->
</svg>
```

`pranavred/references/accessibility-and-pitfalls.md:5-13`:

| SVG role | Implementation |
|---|---|
| Decorative (next to text) | `aria-hidden="true"` on svg |
| Informative (standalone icon) | `role="img"` + `<title>` + `aria-labelledby` |
| Complex (illustration) | `role="img"` + `<title>` + `<desc>` + `aria-labelledby` |
| Inside a button | Button gets `aria-label`, SVG gets `aria-hidden="true"` |

> `<title>` must be the **first child** of its parent element.

`GKjohns/SKILL.md:44` requires a concept comment in the delivered file: "Include a brief comment at the top of the SVG explaining the concept, so future Kyle can read it in six months." Its references do this (`daylight.svg:2-3`, `takeout.svg:2-3`, `sift.svg:2-3`, `aria.svg:2-4`), and so does every `neonwatty` example (`concept-1.svg:2`, `iteration-37.svg:2`). Cheap and genuinely useful for the refine loop, since the comment is what tells the next agent what the mark is supposed to mean.

### 2.10 Cleanliness rules

`neonwatty/SKILL.md:102`: "**Clean markup** — No unnecessary transforms, no empty groups, no default namespace clutter."

`pranavred/SKILL.md:190-199` anti-pattern table:

| Don't | Do instead |
|---|---|
| Hardcode `width="24" height="24"` without `viewBox` | Use `viewBox` always; add width/height only if needed |
| Set `fill="none"` on a `<g>` group | Set fill on individual elements or the root `<svg>` |
| Use `px` units inside SVG | SVG coordinates are unitless; they map to viewBox |
| Include editor metadata (`<sodipodi:*>`, `<inkscape:*>`) | Strip all editor cruft |
| Use `<text>` for logo wordmarks in distributed SVGs | Convert text to paths for portability |
| Nest transforms three levels deep | Flatten transforms into path coordinates |
| Use `xlink:href` | Use `href` (xlink is deprecated) |
| Forget `xmlns` on standalone SVG files | Always include `xmlns="http://www.w3.org/2000/svg"` |
| Use decimal precision beyond 2-3 places for icons | Round to 2 decimals for icons, 3 max for complex art |

SVGO danger list, `pranavred/references/optimization.md:55-60`:

| Plugin | Risk | Fix |
|---|---|---|
| `removeViewBox` | Breaks responsive scaling | Set `removeViewBox: false` |
| `cleanupIds` | Breaks gradient/mask/clipPath references | Disable if using defs |
| `removeHiddenElems` | Can remove elements that are revealed via CSS/JS | Disable for animated SVGs |
| `collapseGroups` | Removes groups that may carry important transforms | Review output |

`collapseGroups` is the one that will bite us specifically, because it will eat `<g id="icon">` and break the favicon extraction step.

The missing-dimensions gotcha, `pranavred/references/accessibility-and-pitfalls.md:25-33` — this contradicts the "never set width/height" rule everyone else states:

> SVGs without `width`/`height` attributes render as 0x0 in:
> - Flexbox containers (Safari)
> - Absolutely positioned elements
> - `<img>` tags without CSS sizing
> - Email clients
>
> For `<img>` usage, always provide `width` and `height` attributes.

`qiguangyang` hits this in practice and patches it at rasterisation time rather than in the file (`scripts/gallery.html:139-141`):

```js
if (!/<svg[^>]*\swidth\s*=/.test(text)) {
  text = text.replace(/<svg/, '<svg width="' + vw + '" height="' + vh + '"');
}
```

`atypica/SKILL.md:282-286` prohibitions:

> - **No** `<image>` tags embedding raster bitmaps
> - **No** complex filter effects (`<filter>`, `feGaussianBlur`, `feTurbulence`) — they degrade at small sizes and increase file weight
> - **No** overly detailed illustrations
> - **No** fonts without fallbacks
> - **No** generic clip-art aesthetics

`pranavred/references/advanced-techniques.md:20-29` on filters: "Almost never. If you need a shadow or glow on a logo, consider: using a slightly offset duplicate shape with reduced opacity; applying the shadow via CSS `filter: drop-shadow()` on the container instead; creating the shadow effect with actual vector shapes." `neonwatty`'s final logo does exactly the first of those, an offset duplicate rect as a hard shadow (`iterations/iteration-37.svg:15-16`), which is the right technique.

---

## 3. Gallery and selection UI

Four distinct designs, in ascending order of usefulness.

### 3.1 `atypica`: no gallery

`SKILL.md:314`: "**Open each SVG in the browser using `open` (macOS) for immediate visual preview**". One tab per file, no comparison, no size ramp, no dark background. Its own quality checklist (`SKILL.md:274`) demands "Renders correctly at 16x16 (favicon), 64x64 (app icon), and 512+ (hero size)" and provides no surface on which to check it.

### 3.2 `GKjohns`: static HTML options gallery

`assets/templates/options-gallery.html`, cloned per project to `logo-options-{name}.html` in cwd (`SKILL.md:31`). Card contents required at `SKILL.md:31-33`:

> - The SVG rendered at ~160px
> - A one-line caption describing the concept ("a page with a margin line")
> - A small label with the option number (1-5+)

The template (`options-gallery.html:113-131`) has each card carry the mark twice: once in a square `.art` cell (`aspect-ratio: 1`, SVG at 60% of the cell, `options-gallery.html:73-84`) and once inline at 22px height next to the project name in a `.name` row (`options-gallery.html:94-97`), which is a cheap nav-bar lockup simulation. Theming via `prefers-color-scheme` on CSS custom properties (`options-gallery.html:8-25`), and the card sets `color: var(--primary)` (`options-gallery.html:64`) so `currentColor` marks pick up the theme automatically.

Selection is manual: `options-gallery.html:108` "Pick a number and tell Claude which to ship." `SKILL.md:36`: "**Show the file path** to the user and wait for them to pick a number. Do NOT proceed to Phase 2 until they choose."

**No 16px cell, no dark-background render of the mark itself.** Its own rule 5 ("Works at 16px and 400px", `design-principles.md:56-61`) cannot be verified in its own gallery.

### 3.3 `neonwatty`: regenerated preview.html plus a favicon strip

Full template at `SKILL.md:155-230`. Self-contained, `file://`-safe, `<img src>` to relative paths, CSS grid `repeat(auto-fill, minmax(280px, 1fr))` (`SKILL.md:189`), card image area `min-height: 240px` with `max-height: 200px` on the image (`SKILL.md:202-208`), and a single light/dark body-class toggle button (`SKILL.md:223`). Cards are `{{PATH}}` + `{{LABEL}}` only (`SKILL.md:259-266`); the label is just the filename.

The favicon strip is added **only in Phase 3 (refine)**, not in Phase 2 (`SKILL.md:232-234`):

> During Phase 3 (Refine), add a "Favicon Size Check" section below the iteration grid. This renders each iteration at 64px, 32px, and 16px so the user can spot legibility issues early.

Exact markup (`SKILL.md:236-249`):

```html
<h2>Favicon Size Check</h2>
<div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:end;">
  <!-- Repeat for each iteration -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
    <div style="font-size:0.8rem;font-weight:500;">{{LABEL}}</div>
    <div style="display:flex;gap:1rem;align-items:end;">
      <div><img src="{{FAVICON_PATH}}" width="64" height="64"><div style="font-size:0.75rem;opacity:0.6;">64px</div></div>
      <div><img src="{{FAVICON_PATH}}" width="32" height="32"><div style="font-size:0.75rem;opacity:0.6;">32px</div></div>
      <div><img src="{{FAVICON_PATH}}" width="16" height="16"><div style="font-size:0.75rem;opacity:0.6;">16px</div></div>
    </div>
  </div>
</div>
```

And the rule that makes it correct, `SKILL.md:251-255`:

> For icon-only logos, `{{FAVICON_PATH}}` is the iteration path. For combination marks, create a standalone square SVG from the meaningful `#icon` group and use its path for `{{FAVICON_PATH}}`. **Never squeeze the full horizontal wordmark into the square favicon cells.** If details disappear at 32px, suggest simplifying (remove fine details, thicken strokes, drop decorative elements).

Note the sizes are `align-items: end` in a flex row, so the three renders sit on a common baseline and you read the degradation left to right. That detail matters and every implementation in the corpus that gets this right uses `align-items: end` or `flex-end`.

### 3.4 `pranavred`: data-driven live-reload preview, richest per-card content

Architecture (`references/editing-workflow.md:78-83`, `SKILL.md:176-183`): a static scaffold `assets/preview.html` copied verbatim into the project (`SKILL.md:177`: "using `cp` with the absolute path from where this skill was loaded (do not read or modify the file)"), plus a project-owned `variants.js` data file. `references/editing-workflow.md:144`: "**Do NOT rewrite `preview.html`.** It is a static scaffold copied from the skill assets. All project-specific data lives in `variants.js`."

`variants.js` schema (`references/editing-workflow.md:86-110`):

```js
window.VARIANTS = {
  projectName: "Acme",
  brandName: "Acme",
  concepts: [
    {
      name: "Geometric",
      variants: [
        {
          id: "01",
          name: "Prism",
          description: "Light refracting through a triangular prism. Suggests transformation.",
          light: "logo-prism.svg",
          dark: "logo-prism-dark.svg"
        },
        {
          id: "02",
          name: "Hexagon Stack",
          description: "Layered hexagons suggesting modularity and structure.",
          light: "logo-hex.svg"
        }
      ]
    }
  ]
};
```

Omitting `dark` is meaningful: `references/editing-workflow.md:122` "Omit for monochrome (auto-applies `filter:brightness(0) invert(1)`)".

What each card renders (`references/editing-workflow.md:126-132`, implemented at `assets/preview.html:88-104`):

> - **Size ramp** (16, 32, 64px) on white background
> - **Dark background row** (16, 32, 64px) using the dark SVG or monochrome filter
> - **Favicon mockup** (16px in a browser tab strip)
> - **Nav bar mockup** (logo + brand name, light and dark)
> - **Click-to-compare** bar (pin up to 4 cards for side-by-side evaluation)
> - **Live reload** (3s poll cache-busts SVG images and reloads `variants.js`, no manual refresh needed)

The size-ramp function (`assets/preview.html:80-86`):

```js
function sizeRamp(src, invert) {
  var sizes = [16, 32, 64];
  var filter = invert ? ' style="filter:brightness(0) invert(1)"' : '';
  return sizes.map(function (s) {
    return '<div class="size-label"><img src="' + src + '" width="' + s + '" height="' + s + '"' + filter + '>' + s + '</div>';
  }).join('');
}
```

The browser-tab mock is the best idea in the corpus for favicon evaluation, because it puts the 16px mark in the actual chrome colour next to actual tab text (`assets/preview.html:33-37`):

```css
.favicon-strip { display: flex; align-items: center; gap: 6px; margin-top: 8px;
  padding: 6px 10px; background: #dee1e6; border-radius: 8px 8px 0 0; }
.favicon-strip .tab { display: flex; align-items: center; gap: 6px; background: white;
  border-radius: 8px 8px 0 0; padding: 6px 12px; font-size: 11px; color: #374151; }
.favicon-strip .tab img { width: 16px; height: 16px; }
```

Dark row background is `#0d1117` (GitHub dark), nav mock dark is `#0d1117` with `#30363d` border and `#f0f6fc` text (`assets/preview.html:24-32`).

Compare bar: fixed to the viewport bottom, 48px thumbnails, maximum four pinned, click toggles a `3px solid #3B82F6` outline on the card (`assets/preview.html:129-154`).

Live reload (`assets/preview.html:159-173`) does two things every 3 seconds: cache-busts every `img[src*=".svg"]` with `?t=<now>`, and re-injects `variants.js?t=<now>` as a script tag, re-rendering only if `JSON.stringify(data)` changed. That means the agent can write SVGs one at a time and the user watches them appear.

**Progressive population is the key workflow difference**, `SKILL.md:176-183`:

> **Set up the preview immediately, then populate it progressively.** Don't design all logos first and then show them. The user should see results as they're created:
> 1. Copy this skill's `assets/preview.html` to the project directory
> 2. Design the first logo and write its SVG file.
> 3. Write `variants.js` with just that first variant.
> 4. Open the preview with `open preview.html` (macOS) or `xdg-open preview.html` (Linux). The user now sees the first logo while you keep working.
> 5. For each subsequent logo: write the SVG file, then update `variants.js` to add it. The preview auto-reloads both every 3 seconds, so new logos appear in the browser as they're completed.
>
> This gives the user visual feedback within seconds of the first logo being ready, rather than waiting for all logos to be designed before seeing anything.

Iteration cost table (`references/editing-workflow.md:136-142`) — every row is "Nothing. Live reload picks it up in 3s."

### 3.5 `qiguangyang`: local HTTP server, click-to-choose, exit-code IPC

The only one where the user's click is machine-readable. Architecture in `docs/superpowers/specs/2026-07-14-logo-generator-skill-design.md:36-43`:

> **Orchestration (Approach A):** one server run per round; the server exits when its job (selection recorded, or export written) is done. Claude runs it as a background task and is re-invoked on exit. No polling, no orphans.

Server: `scripts/logo-studio.js`, pure `node:http`/`node:fs`/`node:path`, binds `127.0.0.1` only (`logo-studio.js:155`), path-traversal guarded (`logo-studio.js:107`: `if (!target.startsWith(root + path.sep)) return send(res, 403, ...)`). Endpoints (`logo-studio.js:281-304`): `GET /`, `GET /api/state`, `GET /concepts/round-N/*.svg`, `POST /api/select`, `POST /api/export`. Exit codes (`logo-studio.js:8`): 0 = selection or export recorded, 2 = idle timeout (default 30 minutes, `logo-studio.js:36`), 1 = error.

Card contents (`scripts/gallery.html:233-243`): large render, favicon strip, name, one-line rationale from the `concepts.json` sidecar, a feedback textarea, and two buttons.

The favicon strip (`scripts/gallery.html:229-232`):

```js
const strip = [[64, '64px'], [32, '32px'], [16, '16px']].map(([s, label]) =>
  '<figure><img src="' + conceptUrl(c.file) + '" width="' + s + '" height="' + s +
  '"><figcaption>' + label + '</figcaption></figure>'
).join('');
```

rendered in a `.strip` with `align-items: flex-end` and a dashed top border, on the same light/dark card background as the big render (`gallery.html:22-26`). So the strip inherits the background toggle, which `pranavred`'s fixed-colour rows do not.

Buttons (`gallery.html:239-242`):

```html
<textarea placeholder="Optional feedback for this direction (e.g. bolder, warmer colors)…"></textarea>
<div class="actions">
  <button class="action refine">Refine this direction</button>
  <button class="action finalize">Finalize this one ✓</button>
</div>
```

Selection state written to `logos/state/selection-round-N.json` (`logo-studio.js:124-131`, `logo-studio.js:166-172`):

```json
{ "round": 1, "concept": "concept-2.svg", "feedback": "bolder, warmer colors", "action": "refine", "at": "…" }
```

The brief is shown collapsed in a `<details>` at the top of the gallery (`gallery.html:102-112`), truncated to 2000 chars server-side (`logo-studio.js:100`).

**Same-tab refine loop** (`docs/superpowers/specs/2026-07-14-persistent-gallery-design.md`): after a refine click the page shows a non-dismissable "Direction recorded, generating variations…" panel with a live mm:ss counter and polls `GET /api/state` with `cache: 'no-store'` every 2 seconds; on a response whose `round` differs it calls `location.reload()` (`gallery.html:65-97`). Gives up at 45 minutes (`gallery.html:61`, `WAIT_LIMIT_MS`). Server side, `FIRST_REQUEST=1` is printed once per run (`logo-studio.js:272-276`) so the agent can tell "the old tab reloaded itself" from "nobody is watching", and `--require-port` retries the same port 10 times at 300ms instead of auto-incrementing (`logo-studio.js:139-147`).

The agent-side lifecycle, `SKILL.md:136-151`:

> Do NOT `open` the URL. After ~15 seconds, read the server's stdout for a `FIRST_REQUEST=1` line:
> - present → the existing tab refreshed itself; tell the user the gallery updated in place.
> - absent → the tab was closed; `open` the URL now.

### 3.6 "Refine this one" without losing the direction

Four mechanisms, and they compose.

**Inline the full base SVG in every variation agent's prompt.** `neonwatty/SKILL.md:283`: "Each agent receives: the base SVG content (copy the full SVG inline in the prompt), the specific variation to apply, the target file path, and the full SVG conventions." Repeated as a hard rule at `SKILL.md:296`: "Always include the full base SVG content in each agent's prompt — agents do not share context."

**Split single tweaks from batch exploration.** `neonwatty/SKILL.md:278-280`:

> **Single iteration** — When the user gives specific feedback ("make the icon bigger", "change the blue to green"), apply the change directly and write the next iteration SVG yourself.
> **Batch variations** — When exploring multiple directions at once ("try different color palettes", "show me 5 variations of the eye shape", "experiment with bar count"), use the `Task` tool to generate variations in parallel.

`SKILL.md:320`: "Use parallel agents for batch exploration (3+ variations), sequential writes for single tweaks."

Batch dispatch template, `SKILL.md:288-294`:

```
Task 1: "Take this base SVG [full SVG content] and create a variation with a warm color palette (reds, oranges, yellows). Write to logos/iterations/iteration-5.svg."

Task 2: "Take this base SVG [full SVG content] and create a variation with a cool color palette (blues, teals, purples). Write to logos/iterations/iteration-6.svg."

Task 3: "Take this base SVG [full SVG content] and create a variation with a monochrome palette (grays + one accent). Write to logos/iterations/iteration-7.svg."
```

**Never destroy a previous state; make any prior version re-selectable as the new base.** `neonwatty/SKILL.md:317`: "If the user says 'go back to iteration N', use that as the new base." Numbered, append-only iteration files make that free. `SKILL.md:319`: "Keep SVG structure consistent across iterations (same group IDs) so the user can track what changed."

**State the invariants explicitly, and treat drift as a repairable failure.** This is `wcgordon1`'s contribution and it is the best idea in the corpus for refinement. `SKILL.md:108`:

> When the user wants more exploration, change the concept thesis or route. When the user wants refinement, preserve the thesis and make one targeted change.

`references/imagegen-execution.md:50`: "Make one targeted change per iteration. State what must remain invariant. If an edit repeatedly drifts, return to the last accepted output or reconstruct deterministically."

`references/critique-and-repair.md:42`, repair matrix row: "Concept drift → Restore the last accepted image and list invariants."

`EVALS.md:40`: "Mascot gains an extra paw during an edit → Repair only anatomy while locking pose, crop, and silhouette."

So the refine prompt template we want is: base SVG inline + one change + an explicit invariant list (silhouette, palette, group IDs, proportions) + the original concept thesis.

`qiguangyang/SKILL.md:127-131` adds the empty-feedback case:

> Generate 3-4 **variations of that direction** applying the feedback — parallel agents again, each receiving: the full base SVG inline, the feedback, the brief, the SVG conventions, and output path `logos/concepts/round-<N+1>/concept-M.svg`. If feedback is empty, explore the same direction more broadly (weights, proportions, palette).

`atypica/SKILL.md:327-336` is the loosest: 2 to 3 rounds, 2 to 3 variations per round, "Progressively narrow toward the final mark."

---

## 4. Export and production kit

### 4.1 File lists

**`qiguangyang`** — the most complete kit, `SKILL.md:160-163` and `docs/superpowers/specs/2026-07-14-logo-generator-skill-design.md:185-193`:

```
logo.svg                          # chosen vector original
logo-16.png … logo-1024.png       # 16, 32, 48, 64, 128, 256, 512, 1024
favicon.ico                       # 16+32+48, PNG-embedded ICO, pure-Node assembly
apple-touch-icon.png              # 180×180
icon-192.png, icon-512.png        # PWA; rendered with maskable-safe padding (80% safe zone)
site.webmanifest                  # name from brief, icons wired
head-snippet.html                 # favicon/manifest/apple-touch <link> block
```

Machine-readable in `scripts/logo-studio.js:20-33`:

```js
const EXPORT_FILES = [
  { file: 'logo-16.png', size: 16, padding: 0 },
  { file: 'logo-32.png', size: 32, padding: 0 },
  { file: 'logo-48.png', size: 48, padding: 0 },
  { file: 'logo-64.png', size: 64, padding: 0 },
  { file: 'logo-128.png', size: 128, padding: 0 },
  { file: 'logo-256.png', size: 256, padding: 0 },
  { file: 'logo-512.png', size: 512, padding: 0 },
  { file: 'logo-1024.png', size: 1024, padding: 0 },
  { file: 'apple-touch-icon.png', size: 180, padding: 0 },
  // maskable PWA icons: logo occupies the central 80% safe zone
  { file: 'icon-192.png', size: 192, padding: 0.1 },
  { file: 'icon-512.png', size: 512, padding: 0.1 },
];
```

**`neonwatty`** — PNG only, no ICO, no manifest. `SKILL.md:395-403`: `logo-16.png`, `logo-32.png`, `logo-48.png`, `logo-192.png`, `logo-512.png`, `logo-1024.png`, `logo-2048.png`, and the same set as `icon-*.png` when a separate icon SVG is supplied. Sizes hardcoded at `scripts/export.sh:10`: `SIZES=(16 32 48 192 512 1024 2048)`.

Repo-integration targets, `neonwatty/SKILL.md:421-429`:

> 1. **Identify target files** — Check the repo for existing icon/logo files: `public/favicon.svg`, `public/favicon.ico`, `public/pwa-*.png`, `public/apple-touch-icon.png`, `assets/logo.svg`, `ios/.../AppIcon.appiconset/`, `public/manifest.json`, etc.
> 3. **Replace files** — Copy the final SVG as the favicon/logo. Generate platform-specific sizes:
>    - `favicon.ico` — 48px (use ImageMagick `convert` or `magick`)
>    - `apple-touch-icon.png` — 180px
>    - `pwa-192x192.png` — 192px
>    - `pwa-512x512.png` — 512px
>    - iOS `AppIcon-512@2x.png` — 1024px
>    - **Only replace files that already exist in the repo — don't add new ones the project doesn't use**

That last clause is a good default and we should keep it.

**`atypica`** — three SVGs, no rasters at all. `SKILL.md:306-308` naming:

```
logos/{brand}-concept-a-{style}.svg    # e.g. logos/acme-concept-a-wordmark.svg
logos/{brand}-concept-b-{style}.svg    # e.g. logos/acme-concept-b-abstract.svg
logos/{brand}-concept-c-{style}.svg    # e.g. logos/acme-concept-c-emblem.svg
```

Final trio per `README.md:112-114`: `{brand}-final-color.svg`, `{brand}-final-mono.svg`, `{brand}-final-reversed.svg`.

**`pranavred`** — `logo-{concept}.svg` plus `logo-{concept}-dark.svg` (`references/logo-techniques.md:300-303`). No raster pipeline at all.

**`GKjohns`** — one file. `SKILL.md:42`: "Default: `{project-root}/public/logo.svg` for Nuxt projects, otherwise `./logo.svg`." Plus an offered `AppLogo.vue` (`SKILL.md:45`).

**`wcgordon1`** — deliberately non-committal, `SKILL.md:101-106`: flat colour, black and white versions; symbol-only and combination lockups; "transparent PNG exports when alpha is verified"; "clean SVG only when the geometry has actually been reconstructed and checked".

### 4.2 Directory conventions

`neonwatty` (`SKILL.md:134-142`, `SKILL.md:300-306`, design doc `docs/plans/2026-02-24-logo-designer-skill-design.md:40-59`):

```
logos/
├── preview.html
├── concepts/concept-1.svg …
├── iterations/iteration-1.svg …
└── export/logo.svg, logo-16.png …
```

`qiguangyang` (`SKILL.md:26-33`) adds rounds and a state directory:

```
logos/
├── brief.md                          # design brief (Phase 1)
├── concepts/round-N/concept-M.svg    # generated concepts per round
├── concepts/round-N/concepts.json    # [{file, name, rationale}] sidecar
├── state/selection-round-N.json      # what the user clicked
└── export/                           # final kit (Phase 5)
```

The `concepts.json` sidecar is the piece worth stealing. It carries the name and one-line rationale for each concept, is what the gallery renders as card copy, and gives us a place to store the concept thesis and the assigned route so the refine step can preserve them.

`qiguangyang/SKILL.md:180-181`: "Never write anything into the skill directory; all output goes under the product's `logos/`."

### 4.3 Rasterisation

Two completely different approaches.

**`neonwatty`: external tool with a fallback chain** (`scripts/export.sh:32-51`). Probe order: `resvg` on PATH, then `npx --yes @aspect-build/resvg`, then Node `require('sharp')`, then `inkscape`, then `rsvg-convert`. Commands (`export.sh:62-88`):

```bash
resvg "$source" "$output" --width "$size"
npx --yes @aspect-build/resvg "$source" "$output" --width "$size"
inkscape "$source" --export-type=png --export-filename="$output" --export-width="$size"
rsvg-convert -w "$size" -o "$output" "$source"
```

Failure message, `SKILL.md:411`: "No SVG-to-PNG converter found. Install one of: `npm install -g @aspect-build/resvg`, or install Inkscape, or install librsvg. Then run export again."

**`qiguangyang`: browser canvas, zero dependencies** (`scripts/gallery.html:131-162`). Fetch the SVG text, patch in `width`/`height` from the viewBox if missing, `URL.createObjectURL` a blob, load it into an `Image`, draw onto a `size × size` canvas with contain-fit and optional padding, `canvas.toDataURL('image/png')`, POST base64 back to the server:

```js
const canvas = document.createElement('canvas');
canvas.width = size;
canvas.height = size;
const ctx = canvas.getContext('2d');
const inner = size * (1 - 2 * padding);
const scale = Math.min(inner / vw, inner / vh);
const w = vw * scale, h = vh * scale;
ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
return canvas.toDataURL('image/png').split(',')[1];
```

The reason the "no external references" SVG rule is non-negotiable here is stated at `SKILL.md:83-85`: "(The browser rasterizes these on a canvas — external refs would break or taint it.)" A tainted canvas throws on `toDataURL`.

Server validates every uploaded PNG by signature before writing (`logo-studio.js:192-199`), against `PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])` (`scripts/lib/ico.js:8`).

### 4.4 favicon.ico construction

`qiguangyang/scripts/lib/ico.js` is the only real implementation, hand-encoded, 46 lines, no dependencies. Header comment (`ico.js:3-6`):

> Assemble a .ico file from pre-rendered PNG buffers (PNG-in-ICO format, supported by all modern browsers and Windows Vista+). Layout: ICONDIR header (6 bytes) + one ICONDIRENTRY (16 bytes) per image + raw PNG blobs. Hand-encoded — no image libraries.

```js
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(entries.length, 4);

let offset = 6 + 16 * entries.length;
const dirs = [];
for (const e of entries) {
  const dir = Buffer.alloc(16);
  dir.writeUInt8(e.size === 256 ? 0 : e.size, 0); // width (0 means 256)
  dir.writeUInt8(e.size === 256 ? 0 : e.size, 1); // height
  dir.writeUInt8(0, 2); // palette entries
  dir.writeUInt8(0, 3); // reserved
  dir.writeUInt16LE(1, 4); // color planes
  dir.writeUInt16LE(32, 6); // bits per pixel
  dir.writeUInt32LE(e.png.length, 8);
  dir.writeUInt32LE(offset, 12);
  dirs.push(dir);
  offset += e.png.length;
}
return Buffer.concat([header, ...dirs, ...entries.map((e) => e.png)]);
```

Called with 16, 32 and 48 (`logo-studio.js:215`):

```js
const ico = buildIco([16, 32, 48].map((size) => ({ size, png: pngs[`logo-${size}.png`] })));
```

Verification contract (`SKILL.md:165-166`): "Spot-check binaries: PNGs start with the PNG signature; `favicon.ico` starts with bytes `00 00 01 00 03 00` (3-entry icon)."

`neonwatty` punts to ImageMagick at 48px only (`SKILL.md:425`), which produces a single-size ICO. Worse.

### 4.5 Maskable PWA icons

`qiguangyang` is the only one that attempts it. `logo-studio.js:30-32` marks `icon-192.png` and `icon-512.png` with `padding: 0.1`, and `gallery.html:132-134` documents the semantics: "padding is the fraction of the canvas left clear on EACH side (0.1 → logo occupies the central 80% — the maskable safe zone)."

That is the correct safe-zone fraction. **The implementation is still wrong** because the canvas is transparent (see §6.5): a maskable icon must be full-bleed with an opaque background, otherwise Android's mask crops nothing and the mark floats on transparency.

### 4.6 site.webmanifest

`logo-studio.js:219-228`:

```js
const manifest = {
  name: opts.name,
  short_name: opts.name,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
  display: 'standalone',
};
```

`purpose: 'any maskable'` is the legacy combined value. Ship two separate entries instead: a `purpose: "any"` transparent icon and a `purpose: "maskable"` full-bleed icon with the 80% safe zone. Also missing: `start_url`, `theme_color`, `background_color`, `id`.

### 4.7 The head snippet

`logo-studio.js:231-239`:

```js
const snippet = [
  `<!-- ${opts.name} logo kit — adjust href paths to where you host these files -->`,
  '<link rel="icon" href="/favicon.ico" sizes="48x48">',
  '<link rel="icon" type="image/svg+xml" href="/logo.svg">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<link rel="manifest" href="/site.webmanifest">',
  '',
].join('\n');
```

Four lines, current best practice, and shipping it as a file the user can paste is a good touch. `SKILL.md:167-168`: "Point the user at `head-snippet.html` for drop-in integration and offer to wire the files into their project (copy into `public/`, update HTML `<head>`)."

### 4.8 Icon extraction from a combination mark

`neonwatty` is the only one that handles it, and it is the right behaviour. `SKILL.md:377-380`:

> Copy the final SVG to `logos/export/logo.svg`. For a combination mark, also create a standalone square `logos/export/icon.svg` from its meaningful `#icon` group. Preserve the icon's appearance and give it a tight square `viewBox`; do not include the wordmark.

Then `export.sh` produces two families (`export.sh:92-100`), and `SKILL.md:404-407`: "Use the `icon-*` assets for favicons and app icons; use the `logo-*` assets where the complete combination mark belongs." Test coverage confirms both families are produced from the correct sources (`tests/export.test.mjs:44-59`).

**Missing from every repo:** OG images (1200x630), social avatars, print formats (PDF, EPS), non-square crops, animated variants. `qiguangyang` names these as explicit v1 descopes (`docs/superpowers/specs/2026-07-14-logo-generator-skill-design.md:224-227`).

### 4.9 Objective inspection sheet

`wcgordon1/scripts/create_logo_preview.py` builds a 5 × 3 contact sheet from a raster: sizes `(256, 128, 64, 32, 16)` (`create_logo_preview.py:17`) across rows Light (`#ffffff`), Dark (`(24, 26, 31)`) and Grayscale (`create_logo_preview.py:63, 79-84`). Emits JSON with warnings (`create_logo_preview.py:56-60`):

```python
if abs(logo.width - logo.height) > max(logo.width, logo.height) * 0.1:
    warnings.append("Source is not approximately square; small-size comparisons include extra whitespace.")
if original_mode not in ("RGBA", "LA", "P"):
    warnings.append("Source has no explicit alpha mode; transparency may not be present.")
```

`SKILL.md:94` is honest about what it is: "This utility exposes small-size, light/dark-background, and grayscale behavior; it does not make aesthetic judgments." A greyscale row is the cheapest possible mono-viability check and none of the SVG-native repos have one.

---

## 5. Prompt scaffolding worth stealing verbatim

### 5.1 `wcgordon1` hard gates (`references/critique-and-repair.md:5-16`)

The single best artefact in the corpus. Binary, pre-scoring, and every one is checkable.

> Critique the logo, not the attractiveness of its mockup. Judge the flat mark first.
>
> ## Hard gates
>
> Reject or repair before scoring if any answer is no:
>
> - Is every required character correct?
> - Is the core silhouette recognizable at 16–32 px?
> - Does the mark work in black and reversed white?
> - Is the idea legible without a caption?
> - Is it structurally distinct from cited brands and obvious competitors?
> - Is it free from stock-icon composition and generic AI visual cliches?
> - Does it avoid unintended symbols, anatomy, tangencies, and rendering artifacts?
> - Would the mark still work if all 3D effects disappeared?

### 5.2 `wcgordon1` repair matrix (`references/critique-and-repair.md:35-46`)

| Failure | Targeted repair |
|---|---|
| Generic | Change topology, silhouette, or concept relationship |
| Busy | Remove tertiary detail and secondary ideas |
| Weak at small size | Enlarge defining feature; merge nearby shapes |
| Text error | Reconstruct exact lettering or isolate a constrained edit |
| Reference resemblance | Change axis, proportion, topology, and negative space—not color alone |
| Concept drift | Restore the last accepted image and list invariants |
| 3D dependence | Rebuild the one-color master |
| Mascot anatomy artifact | Repair only the affected feature while locking pose and silhouette |
| Emblem density | Remove filler text, rings, ornaments, and minor symbols |

### 5.3 `wcgordon1` recommendation format (`references/critique-and-repair.md:49-56`)

Six lines, forces an honest weakness. Adopt as-is.

```text
Recommendation: [concept name]
Why it wins: [specific strategic and visual reason]
Strongest evidence: [two rubric dimensions]
Risk: [one honest weakness or originality concern]
Next refinement: [one targeted change, or "none"]
Production note: [raster/vector/text/transparency limitation]
```

### 5.4 `wcgordon1` scorecard (`assets/logo-scorecard.json`)

```json
{
  "scale": { "minimum": 1, "maximum": 5, "meaning": "1 is unacceptable; 3 is viable; 5 is exceptional" },
  "hard_gates": {
    "text_correct": null,
    "small_size_recognizable": null,
    "monochrome_viable": null,
    "effects_independent": null,
    "no_confusing_brand_resemblance": null,
    "no_artifacts_or_unintended_symbols": null
  },
  "scores": {
    "memorability": null,
    "silhouette_strength": null,
    "small_size_recognition": null,
    "monochrome_viability": null,
    "brand_fit": null,
    "originality_and_competitor_distance": null,
    "construction_coherence": null,
    "effects_independence": null
  },
  "recommendation": { "concept": "", "why_it_wins": "", "risk": "", "next_refinement": "", "production_note": "" }
}
```

Weighting rule, `references/critique-and-repair.md:31`: "Weight originality, silhouette, and small-size recognition more heavily than render polish. Compare concepts side by side only after they pass the hard gates."

### 5.5 `wcgordon1` concept thesis (`SKILL.md:53-59`)

> For each selected route, write a one-sentence concept thesis containing:
> 1. the recognizable visual idea,
> 2. the intended brand signal,
> 3. the distinctive structural move.
>
> Then specify construction: geometric, organic, modular, negative-space, or custom-lettered. **Reject concepts that depend on tiny details, effects, or a verbal explanation.**

Worked example, `references/transformed-examples.md:9`: "a compact, capable beaver whose tail forms a subtle pipe bend, signaling practical problem-solving."

### 5.6 `wcgordon1` route prompt scaffolds

Abstract (`references/route-abstract.md:21-28`):

```text
Create an original abstract logo symbol for [brand/category].
Strategic idea: [relationship or motion]. Brand signal: [traits].
Distinctive topology: [specific cut/fold/path/modular rule].
Construction: restrained geometry, balanced negative space, bold silhouette,
few components, readable at 16 px, flat one-color viability.
Exclude: generic blobs, swooshes, sparks, infinity symbols, stock SaaS marks,
decorative gradients as the concept, text, and resemblance to cited brands.
```

With the structural-move menu at `route-abstract.md:11-15`:

> - modular units forming an unexpected whole
> - a distinctive cut, fold, aperture, or negative-space event
> - controlled repetition with one purposeful exception
> - a continuous path with recognizable rhythm
> - two forces resolving into a stable silhouette

and the ban list at `route-abstract.md:17`: "Do not use a generic gradient blob, orbit, spark, infinity loop, hexagon, or letter-shaped ribbon without a proprietary transformation."

Monogram (`references/route-monogram.md:18-26`):

```text
Explore an original monogram logo using exactly the letters [LETTERS] in that order.
Brand signal: [traits]. Letter relationship: [construction move].
Distinctive feature: [specific shared stroke/counter/negative-space idea].
Construction: custom letterforms, balanced counters, bold silhouette,
one-color viability, readable at 16 px.
Exclude: extra letters, mirrored accidental glyphs, illegible overlap,
off-the-shelf font treatment, decorative mockup, and resemblance to known monograms.
```

Object (`references/route-object.md:26-32`), with the selection criteria at `route-object.md:9-13`:

> Choose an object that is:
> - meaningful to the product, outcome, name, or customer—not merely category decoration
> - recognizable from its outer contour
> - uncommon enough to own, or transformed through an unusual structural move
> - simple enough for a favicon or storefront mark
>
> Avoid the most obvious category object unless the treatment creates a real distinction.

and construction moves at `route-object.md:17-23`: combine two related meanings through negative space; crop or rotate into an unexpected silhouette; convert one functional feature into the brand's initial; reduce to two or three decisive masses; use a consistent construction language.

Emblem (`references/route-emblem.md:16-22`), notable for its exclusion list: "tiny seal text, date/location filler, heraldic clutter, esports aggression, crypto-coin styling, excessive stars or laurels, and mockup presentation."

### 5.7 `wcgordon1` generic prompt schema (`references/imagegen-execution.md:19-31`)

Ten slots. Reads as an image-gen prompt but maps cleanly onto an SVG-authoring agent prompt.

```text
Purpose: logo exploration for [brand and use].
Route and subject: [mascot/object/abstract/monogram/emblem plus concept thesis].
Construction: [silhouette, topology, geometry, negative space, detail budget].
Brand signal: [two or three attributes].
Color: [limited direction]; must also work in one color.
Composition: centered, isolated mark, readable at [smallest size].
Rendering: [flat vector-like or approved 3D treatment].
Text: [none, or exact verified text].
Preserve: [edit-only invariants].
Exclude: mockups, scenes, watermarks, stock-icon cliches, famous-logo resemblance,
unrequested objects, and arbitrary decorative effects.
```

Discipline note at `imagegen-execution.md:33`: "Keep user specificity. Do not invent slogans, animals, symbols, colors, or typography simply to make a prompt longer."

Inspection loop, `imagegen-execution.md:37-46`:

> 1. open the actual output,
> 2. check the requested route and concept thesis,
> 3. inspect silhouette, text, anatomy, negative space, and artifacts,
> 4. compare against references for accidental imitation,
> 5. run small-size and monochrome checks,
> 6. decide whether to accept, repair, or change route.
>
> **Do not present an uninspected output.**

### 5.8 `GKjohns` semantic test (`references/design-principles.md:21`)

The sharpest one-line concept test in the corpus:

> Ask: "If I showed this logo to someone who didn't know the name, and told them one word, what word would it be?" If the answer isn't the product name (or a very close synonym), the concept is wrong.

With the worked good/bad pairs (`design-principles.md:23-26`):

> - **Good:** Margin's vertical line reads as the margin on a piece of notebook paper.
> - **Good:** Daylight's bite-out corner reads as a crescent moon or the edge of dawn.
> - **Bad:** A generic "M" in a circle for Margin. The letter isn't the concept.
> - **Bad:** A lightbulb for an AI product. A lightbulb is decoration, not meaning.

And the disqualifier at `SKILL.md:16`: "A logo that would work equally well for any other company is the wrong logo."

### 5.9 `GKjohns` AI-tell list (`references/design-principles.md:85-95`)

Verbatim. This is the list that catches AI-generated logos.

> ## Anti-patterns (things that look AI-generated)
>
> - Gradients (especially purple-to-pink)
> - Glass-morphism / frosted glass
> - 3D bevels and drop shadows
> - Isometric cubes
> - Abstract swooshes / ribbons
> - Perfectly symmetric hexagons with an icon inside
> - Circuit-board brain imagery
> - Letterforms as the entire mark
> - Two or more unrelated concepts mashed together ("it's a leaf AND a checkmark AND a bar chart")

Plus `SKILL.md:57-63` failure modes:

> - **Generic startup iconography.** Gradients, glass-morphism, 3D gears, abstract swooshes. If the logo would fit on a pitch-deck clip-art slide, throw it out.
> - **Letterform-only marks.** A stylized "M" for Margin is lazy. The logo should show the *concept*, not the first letter.
> - **Detail-overload.** If the SVG has more than ~6 shapes, you're probably illustrating instead of logo-ing.
> - **Unrealized cleverness.** "It's a coffee cup, but also a data chart" — no. One clear idea per logo.
> - **Skipping the gallery.** The gallery is the point of the skill. Never deliver a single logo on the first turn.

### 5.10 `pranavred` small-size technique table (`references/logo-techniques.md:213-222`)

Maps a rendering technique to the reason it survives, which is more useful than a bare rule:

| Technique | Why it works at 16px | Example |
|---|---|---|
| Single bold silhouette | One shape, no detail to lose | Stripe, Spotify |
| Stylized letterform | Instantly recognizable, scales perfectly | Medium, Facebook |
| Overlapping shapes (2-3 max) | Reads as a unit | Mastercard, Olympics |
| Isometric projection | 3 flat faces = 3 colors, very readable | Figma files icon |
| Broken/open shape (gap implies meaning) | The absence carries the concept | OpenAI |
| Abstract mark | Pure shape, no literal meaning needed | Nike, Slack |
| Negative space cutout | Two meanings coexist | FedEx arrow, NBC peacock |
| Contained symbol (shape inside a frame) | Frame provides structure at small sizes | Instagram, App Store |

And the negative list (`logo-techniques.md:226-231`):

> - Thin lines or strokes under 1.5px (on 32x32 viewBox)
> - More than 6-7 distinct elements
> - Text or letterforms with serifs
> - Gradients with more than 2 stops (muddy at small sizes)
> - Details that only appear above 48px

### 5.11 `pranavred` logo file checklist (`references/logo-techniques.md:321-331`)

> - [ ] Works at 16px (favicon), 32px, 64px, and 200px+
> - [ ] Works in monochrome (single color)
> - [ ] Works on both light and dark backgrounds (use `currentColor` or provide dark variants for colored logos)
> - [ ] Dark variants created for any logo with hardcoded colors
> - [ ] No content clipping at viewBox edges (check all coordinates are within bounds)
> - [ ] No embedded fonts (text converted to paths)
> - [ ] No editor metadata or hidden layers
> - [ ] `viewBox` is tight to the artwork (no excess whitespace)
> - [ ] `xmlns` attribute present
> - [ ] File is optimized

### 5.12 `atypica` four principles (`SKILL.md:152-155`)

Terse and usable as a gate:

> - **Simplicity & Recognition** — works at 16x16 favicon AND on a billboard; if you can't describe it in one sentence, simplify
> - **Uniqueness & Memorability** — the viewer should remember it after a single 3-second glance
> - **Strategic Extensibility** — supports the brand's future growth, not just today's product
> - **Storytelling** — every element has a reason; the logo communicates the brand's essence without words

Plus the differentiation instruction at `SKILL.md:198`: "Prioritize differentiation within the industry — if every competitor uses blue, consider the strategic value of not using blue."

### 5.13 `wcgordon1` reference-handling policy (`SKILL.md:114-116`)

Worth adopting verbatim because we will be handed "make it like Stripe" constantly:

> Use references to infer attributes such as softness, confidence, density, geometry, material, or composition. Do not reproduce protected marks, characters, or signature geometry. If a request is imitation-heavy, translate it into neutral design attributes and disclose that redirection. This workflow reduces obvious resemblance; it is not trademark clearance or legal advice.

Worked application, `references/transformed-examples.md:17`: "Translate the references into restraint, geometric confidence, excellent spacing, and limited color—not signature geometry."

And `SKILL.md:16`: "Treat famous logos as attribute references, never tracing targets. Extract qualities such as restraint, geometry, or dimensionality and create original structure."

### 5.14 `wcgordon1` EVALS as a regression suite

`EVALS.md` is a trigger-and-behaviour test file, which none of the others have. The adversarial table (`EVALS.md:35-41`) is directly reusable as our own acceptance tests:

| Query or failure | Expected safeguard |
|---|---|
| "Copy the Linear logo but replace the color and name." | Refuse direct imitation; extract neutral attributes and change topology |
| Generated monogram reads `AJ` instead of `AEJ` | Fail hard gate; reconstruct or tightly edit exact letter geometry |
| 3D mark looks excellent but becomes a blob in black | Reject underlying concept; restore flat-first design |
| Five outputs are only palette changes | Do not call them concepts; change route, thesis, or silhouette |
| Mascot gains an extra paw during an edit | Repair only anatomy while locking pose, crop, and silhouette |

---

## 6. Mistakes and anti-patterns not to copy

### 6.1 `neonwatty`'s example output violates its own conventions on the first line

`SKILL.md:100` says "Flat fills by default. Only use gradients when the user requests them or the style clearly calls for it." All five shipped concepts use the identical `#a855f7 → #ec4899` purple-to-pink linear gradient at the same `x1="0%" y1="0%" x2="100%" y2="100%"` angle (`concepts/concept-1.svg:5-8`, `concept-2.svg:5-8`, `concept-3.svg:5-8`, `concept-4.svg:5-8`, `concept-5.svg:5-8`). That is precisely the top entry on `GKjohns`'s AI-tell list (`design-principles.md:87`: "Gradients (especially purple-to-pink)").

So the shipped example gallery, the artefact the repo advertises, is five different shapes wearing one identical AI-default palette. Five parallel agents received the same brief and none of them was told to vary the colour, so none did.

**Lesson:** the parallel-agent architecture will happily produce five copies of whatever is in the shared brief. Divergence has to be assigned per agent on every axis you care about, not just subject.

### 6.2 The five concepts are all the same structural category

Speech bubble, waveform, megaphone, pixel grid, asterisk (`concepts/concept-1.svg` through `concept-5.svg`). Every one is a symbolic icon on a dark container. No wordmark, no monogram, no negative-space dual-read, no abstract geometric. Measured against `pranavred`'s own rule (`references/logo-techniques.md:193`, "Include at least 3 of these 5 categories"), the set scores 1 of 5.

### 6.3 37 iterations is a failure trace being sold as a feature

`examples/bleep-that-shit/README.md:5` frames it as "37 iterations across 10 distinct design phases". Reading the iteration comment headers in order shows three unrelated concept resets:

- Iterations 1 to 23: waveform plus censor bar.
- Iteration 24: pivots wholesale to a HAL 9000 eye (`iteration-24.svg:2`, "Larger HAL eye, darker ring around it, fewer bars").
- Iteration 28: pivots again to comic-book styling (`iteration-28.svg:2`, "Comic book HAL — thick black outlines, comic red/yellow palette, hard drop shadow").

Iterations 8 through 16 are nine files whose comments literally begin "Like 8 but ...": "Like 8 but more bars", "Like 8 but red block is wider and shorter", "Like 8 but background uses the brand gradient", "Like 8 but circular background instead of rounded square", "Like 8 but red block has a subtle inner asterisk", "Like 8 but bars are taller". Single-variable tweaking with no thesis. That is exactly `wcgordon1`'s named failure (`EVALS.md:39`).

The final logo (`iteration-37.svg`) has no semantic relationship to the brief that generated concepts 1 to 5. The interview never extracted personality or reference points, so the direction was discovered by brute force over 37 rounds. `pranavred`'s inspiration question (`SKILL.md:152-170`) would likely have found "comic book" in round zero.

**Lesson:** count concept resets, not iterations. A reset means the brief failed. Budget for one reset, and if a second is needed, go back to the interview rather than iterating.

### 6.4 `neonwatty` bakes `mode: "bypassPermissions"` into its skill instructions

`SKILL.md:117` and `SKILL.md:296` both instruct: 'Use `subagent_type: "general-purpose"` and `mode: "bypassPermissions"` for each agent.' That is a permission escalation written into a skill file so the workflow does not stall on prompts. Do not copy it. Scope the agents' write paths instead.

### 6.5 `qiguangyang`'s maskable icons are transparent, which defeats the purpose

`logo-studio.js:30-32` renders `icon-192.png` and `icon-512.png` at `padding: 0.1`, and `gallery.html:150-157` draws them onto a fresh, transparent canvas. The manifest then declares `purpose: 'any maskable'` (`logo-studio.js:223-224`).

A maskable icon must be full-bleed and opaque: the platform crops it to a circle, squircle or rounded square and the safe zone only guarantees that the mark survives the crop. Shipping a transparent icon with 10% padding as maskable means Android masks transparency and renders the mark floating on the launcher's fallback, usually a white or grey plate that clashes with the brand. **Fix:** paint an opaque background rect over the full canvas first, then draw the mark inside the central 80%. And split the manifest entry into a `purpose: "any"` transparent icon plus a `purpose: "maskable"` opaque one.

### 6.6 `qiguangyang` builds the favicon from a letterboxed wordmark

`gallery.html:154-157` contain-fits the SVG into a square canvas. For the `1024x512` wordmark viewBox the skill itself mandates (`SKILL.md:82`), `logo-16/32/48.png` are 16-wide by 8-tall smears with transparent bands above and below, and those three PNGs are exactly what `logo-studio.js:215` feeds into `buildIco`. The result is an unusable favicon and the pipeline never notices.

`neonwatty` gets this right and states it as a rule (`SKILL.md:253-255`): "For combination marks, create a standalone square SVG from the meaningful `#icon` group... **Never squeeze the full horizontal wordmark into the square favicon cells.**" Copy `neonwatty` here, not `qiguangyang`.

### 6.7 The corpus's small-size rules are numerically too weak

`neonwatty/SKILL.md:101` and `qiguangyang/SKILL.md:92` both say "stroke-width of 6+" on a 512 viewBox. That is 1.17% of the canvas, which renders as 0.19px at 16px and 0.37px at 32px. Invisible. `pranavred`'s own ratio table (`SKILL.md:75-81`) implies roughly 6.3% as a baseline, which is 32 units at 512. `GKjohns`'s floor (`design-principles.md:61`, 3 units in a 64 viewBox) is 4.7%, or 24 units at 512.

The "6+" number appears to have been transplanted from a 24-unit or 32-unit canvas without rescaling. Use a percentage of the viewBox, never an absolute, and set the floor at 4.5% with a target of 6.5%.

Same problem with gaps: `GKjohns` sets 6.25% minimum (4 units in 64), which at 512 is 32 units. `neonwatty`'s final logo has 10-unit gaps between its bars (`iteration-37.svg:20-22`: bars at x=64, 106, 148, all 32 wide), which is 2% and closes up below about 48px.

### 6.8 `pranavred` contradicts itself on wordmarks and defaults to an icon canvas

`SKILL.md:195` bans `<text>` in distributed logo SVGs. `references/editing-workflow.md:27` then uses `<text ... font-family="Inter" ...>` for a wordmark, with no fallback stack, in the skill's own composition example. `SKILL.md:46` also instructs "Default to 24x24 unless there's a reason not to. It's the industry standard", which is icon-library guidance imported wholesale into a logo skill. At 24 units you cannot do optical centring (`icon-design.md:65` asks for 1 to 2 unit shifts, which is 4 to 8% and far too coarse to be subtle) or overshoot.

### 6.9 `atypica`'s letter-to-metaphor table manufactures the cliches everyone else bans

`SKILL.md:99-123` maps O to "Eye, target, globe, sun, ring, lens", M/W to "Mountain range, waves, crown, heartbeat", T to "Hammer, cross, antenna, tree", Y to "Fork in road, tree, chalice". Following it produces globes, mountains, hearts and trees, which are four of the seven rows in `pranavred`'s blacklist (`references/logo-techniques.md:167-177`) and most of `GKjohns`'s "every startup deck" list (`design-principles.md:81`).

Use the negative-space search (`atypica/SKILL.md:93-96`) and the letter-anatomy classification (`SKILL.md:75-83`). Skip the metaphor table, or invert it into a blacklist.

### 6.10 `atypica`'s CSS custom properties will rasterise wrong

`SKILL.md:203-212` recommends defining brand colours as `:root` custom properties inside the SVG's `<style>` block. Custom-property support across SVG rasterisers is inconsistent (resvg and librsvg have limited or no support), SVGO's `inlineStyles`/`minifyStyles` will mangle them, and a favicon loaded without a CSS context has nothing to cascade from. A mark whose only colour definition lives in a custom property can rasterise black or transparent with no error.

`GKjohns`'s two-master split (`references/svg-patterns.md:154-164`) solves this properly: themed variant for inline app use, frozen literal-hex variant for everything that gets rasterised or loaded as an image.

### 6.11 `GKjohns`'s canonical references break its own rules

Rule 3 (`design-principles.md:44-46`) requires `currentColor` or Tailwind semantic classes. None of the five reference SVGs use either: `margin.svg:8` uses `fill="#1a2433"`, `daylight.svg:14` `fill="#0ea5e9"`, `takeout.svg:5-6` `fill="#1a2433" stroke="#1a2433"`, `sift.svg:4-6` `fill="#0ea5e9"`, `aria.svg:5-7` `stroke="#7dd3fc"` and `stroke="#0ea5e9"`. The `svg-patterns.md` snippets use `currentColor`; the shipped sources that the skill tells you to study (`SKILL.md:55`: "Before designing, skim `assets/previews/`") do not. An agent trained on the examples will hardcode hex.

`daylight.svg:1` also sets `width="400" height="400"` alongside the viewBox, which every other repo forbids. `takeout.svg:1` uses `viewBox="10 10 60 60"`, a non-zero origin that breaks the "tight viewBox" convention and makes coordinate arithmetic in the refine loop error-prone. `takeout.svg:5-8` also fattens a filled shape with a same-coloured 2.5 stroke, which is a trick that breaks the moment you produce a knockout or reverse version because the stroke bleeds past the intended silhouette.

### 6.12 `GKjohns`'s gallery cannot verify `GKjohns`'s own rules

House rule 5 (`design-principles.md:56-59`) is "Test it as a favicon (16×16). No detail should disappear." The gallery template (`assets/templates/options-gallery.html`) renders the mark at 60% of a square card and again at 22px in a name row. There is no 16px cell, no 32px cell, and no dark-background render of the mark. The rule can be stated but never checked on the surface the user is asked to choose from.

### 6.13 `wcgordon1` never produces a vector

`scripts/create_logo_preview.py:26` takes "Source PNG, JPEG, or WebP". `SKILL.md:18`: "Do not claim that an image-generated raster is production vector artwork. Reconstruct clean SVG geometry when practical." `SKILL.md:105`: "clean SVG only when the geometry has actually been reconstructed and checked." `SOURCES.md:26` lists "automated vector tracing or Bézier reconstruction" as deferred, and `SOURCES.md:78` lists "Production SVG reconstruction remains a manual or provider-specific step" as a known gap.

The honesty is admirable and the thinking is the best in the corpus. But the pipeline is raster-first, so the reasoning has to be lifted out and re-fitted onto an SVG-authoring backend. Take the gates, routes, scorecard and repair matrix; leave the execution model.

### 6.14 `neonwatty`'s export.sh has a quality bug in its sharp branch

`scripts/export.sh:70-80` rasterises via `sharp(source).resize(size, size, { fit: 'contain' })` with no `density` set. Sharp rasterises an SVG at its intrinsic size (derived from the viewBox at the default 72dpi) and then resizes the resulting bitmap. For a 512-unit viewBox exported at 1024 and 2048, that is a 2x and 4x bitmap upscale, not a vector render, and the output will be visibly soft. resvg, Inkscape and rsvg-convert all render natively at the target size. Fix by setting `density` proportionally, or drop the sharp branch.

Separately, the detection chain at `export.sh:35` runs `npx --yes @aspect-build/resvg --help` as a probe, which will download the package on every export just to test availability, on a machine that may already have Inkscape.

### 6.15 `neonwatty` buries 45 lines of unrelated tooling in the skill file

`SKILL.md:324-369` is a Lineage canvas-handoff section covering exit code 27, transaction identity preservation, provisional acceptance semantics and "Restore previous document" recovery. It is 46 lines, roughly 11% of the 430-line skill file, describes an external tool the skill explicitly says not to use by default (`SKILL.md:326`: "Do not look for, start, or connect to Lineage merely because it may be installed"), and is loaded into context on every single invocation. Textbook progressive-disclosure failure. Anything conditional belongs in a reference file behind a routing table, like `pranavred/SKILL.md:12-21`.

### 6.16 `qiguangyang` asks the model to hold a port number in working memory

`SKILL.md:108`: "Read the server's stdout for the line `STUDIO_URL=http://127.0.0.1:<port>` and **REMEMBER the port** — refine relaunches must reuse it." Then `SKILL.md:150`: "REMEMBER the new port — subsequent refine rounds must reuse it." Conversational state across background-task restarts, across an arbitrary number of refine rounds, in a long context. Their own design doc enumerates the resulting failure modes (`docs/superpowers/specs/2026-07-14-persistent-gallery-design.md:75-80`). Write the port to the state file instead.

### 6.17 Universal gaps

Not one repo in this set provides:

- **A text-to-path mechanism.** All six require it; none implement it (§2.3). Every wordmark in every example is live `<text>` with a font that will not be present.
- **Overshoot, x-height matching or side bearings.** `atypica/SKILL.md:232` says "optically adjust per character pair" and stops there. Nothing on rounds exceeding flats, on aligning a mark's optical centre to a wordmark's x-height, or on lockup spacing derived from the cap height.
- **Numeric clear space or minimum size.** `atypica/SKILL.md:345-346` lists both as deliverables and gives no values. Nobody derives clear space from a unit of the mark, which is the standard method.
- **OG images, social avatars, print formats.** Explicitly descoped by `qiguangyang` (`docs/superpowers/specs/2026-07-14-logo-generator-skill-design.md:224-227`), silently absent from the rest.
- **Any automated check that concepts actually differ.** `qiguangyang` validates SVG well-formedness and self-containment (`SKILL.md:68-75`) and nothing about the design. A trivially implementable check: compare rendered PNG hashes and mean pixel differences between concepts, and flag any pair over a similarity threshold.
- **Contrast checking of the logo against the backgrounds it is placed on.** `atypica/SKILL.md:199` says "Ensure sufficient contrast for readability on both light and dark backgrounds"; no numbers, no tooling.

---

## Applicability ranking for `brandi`

| What | From | Take it? |
|---|---|---|
| Hard gates, repair matrix, recommendation format, scorecard | `wcgordon1/references/critique-and-repair.md`, `assets/logo-scorecard.json` | Yes, near-verbatim |
| Route/treatment/output-configuration factoring | `wcgordon1/SKILL.md:12`, `:110` | Yes, as the core model |
| Concept thesis (idea + signal + structural move) | `wcgordon1/SKILL.md:53-59` | Yes, store it in the concepts sidecar |
| Structural category diversity, minimum 3 of 5 | `pranavred/references/logo-techniques.md:183-193` | Yes, and enforce it in the dispatcher |
| Domain mining and 3-level semantic branching | `pranavred/references/logo-techniques.md:143-163` | Yes |
| Industry cliche blacklist | `pranavred/references/logo-techniques.md:167-177` | Yes, verbatim, extend it |
| AI-tell list | `GKjohns/references/design-principles.md:85-95` | Yes, verbatim |
| One-word semantic test | `GKjohns/references/design-principles.md:21` | Yes |
| Primitive-SVG-only vocabulary and the five patterns | `GKjohns/references/svg-patterns.md` | Yes, as the default construction language |
| Two-master colour architecture (themed + frozen) | `GKjohns/references/svg-patterns.md:154-164` | Yes |
| Domain-tailored inspiration question | `pranavred/SKILL.md:152-170` | Yes |
| 512 / 1024x512 viewBox, no width/height, `<g id="icon">` | `neonwatty/SKILL.md:96-99` | Yes |
| Icon extraction from `#icon` for the favicon family | `neonwatty/SKILL.md:251-255`, `:377-380` | Yes |
| Favicon strip 64/32/16 at a shared baseline | `neonwatty/SKILL.md:236-249`, `qiguangyang/scripts/gallery.html:229-232` | Yes, and add 16px in a tab mock |
| Browser-tab favicon mock, nav lockup mock, click-to-compare, live reload | `pranavred/assets/preview.html` | Yes, best gallery in the corpus |
| Progressive population of the preview | `pranavred/SKILL.md:176-183` | Yes |
| Pure-Node PNG-in-ICO assembly | `qiguangyang/scripts/lib/ico.js` | Yes, lift the file |
| head-snippet.html and site.webmanifest generation | `qiguangyang/scripts/logo-studio.js:219-239` | Yes, fix the maskable and manifest defects first |
| Pre-serve SVG validation (self-contained, has viewBox, no script) | `qiguangyang/SKILL.md:68-75` | Yes |
| Brief file capped at 40 lines, inlined into every agent prompt | `qiguangyang/SKILL.md:51-54` | Yes |
| Brief template fields, especially reference-attributes and smallest size | `wcgordon1/assets/logo-brief-template.md` | Yes |
| Greyscale row in the inspection sheet | `wcgordon1/scripts/create_logo_preview.py:63` | Yes |
| Reference-handling and imitation-redirect policy | `wcgordon1/SKILL.md:114-116` | Yes, verbatim |
| Adversarial eval cases | `wcgordon1/EVALS.md:35-41` | Yes, as acceptance tests |
| Local HTTP studio with exit-code IPC | `qiguangyang/scripts/logo-studio.js` | Maybe, the click-to-choose is genuinely better than typing a number |
| Letter anatomy and negative-space search | `atypica/SKILL.md:75-96` | Partially |
| Letter-to-metaphor table | `atypica/SKILL.md:99-123` | No, or invert into a blacklist |
| CSS custom properties as the colour source | `atypica/SKILL.md:203-212` | No |
| Concept A/B/C risk axis as the only diversity device | `atypica/SKILL.md:294-300` | No |
| 24x24 default canvas | `pranavred/SKILL.md:46` | No |
| `stroke-width` 6 on a 512 canvas | `neonwatty/SKILL.md:101` | No, use 4.5% to 6.5% of viewBox |
| `mode: "bypassPermissions"` in agent dispatch | `neonwatty/SKILL.md:117` | No |
| Mandatory WebSearch phase and three blocking checkpoints | `atypica/SKILL.md:42`, `:142` | No |
| Raster-first pipeline | `wcgordon1` throughout | No |
