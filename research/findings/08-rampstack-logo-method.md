# 08. Rampstack logo method, distilled to a machine-usable spec

Source: `research/benchmarks/rampstackco_claude-skills/skills/logo-design/` (1988 lines across 7 files).
Citations below use `FILE:LINE`, where FILE is one of:

| Key | Path | Lines |
|---|---|---|
| `SKILL` | `logo-design/SKILL.md` | 206 |
| `ARCH` | `references/architectures-explained.md` | 165 |
| `TYPE` | `references/typographic-registers.md` | 263 |
| `SYM` | `references/symbol-approaches.md` | 266 |
| `APP` | `references/application-contexts.md` | 312 |
| `CAT` | `references/category-conventions.md` | 489 |
| `VAR` | `references/example-variant-spec.md` | 100 |
| `PKG` | `references/client-package.md` | 187 |

Sibling skills checked. `brand-ideation` adds nothing logo-specific beyond a single field, "Visual potential: how it could render as a wordmark, monogram, icon" (`brand-ideation/references/ideation-output-template.md:69`), and an explicit boundary: ideation must not design logos (`brand-ideation/SKILL.md:154`). `brand-identity` adds a fourth design principle Rampstack's logo skill omits, **construction grid** ("every curve and angle is intentional, document the construction", `brand-identity/SKILL.md:67`), a shorter variant table keyed by use rather than by architecture (`brand-identity/references/identity-system-spec.md:30-38`), a misuse-rules block capped at ten rules (`identity-system-spec.md:41-48`), and clear-space expressed as a multiple of a logo element, "1x cap height" (`identity-system-spec.md:28`). Everything else is a subset of the logo skill.

Throughout, `stated` marks a value Rampstack asserts with a line cite; `derived` marks a value I computed from a stated constraint, and is flagged inline. A generator should treat `derived` numbers as defaults it may tune, and `stated` ones as the benchmark.

---

## 0. The pipeline the taxonomies imply

Rampstack's five considerations (`SKILL:52-134`) are not parallel. They are a dependency chain, and a generator should run them in this order:

```
name + category + tone + constraints
  -> ARCHITECTURE          (SKILL:142, "foundational decision; everything else flows from it")
  -> REGISTER              (constrained by category default, CAT)
  -> SYMBOL_APPROACH       (constrained by name type, SYM:259-265)
  -> render 3 assets       (ARCH:157-165, the three-asset pattern)
  -> CONTEXT_MATRIX test   (SKILL:148, eliminate if >2 fails)
  -> RESTRAINT tests       (SKILL:125-134)
  -> per-variant spec x9   (SKILL:182-193)
  -> client package        (PKG)
```

Two hard rules govern the whole run:

- **`RULE_SMALLEST_FIRST`**: design the small-grade fallback before the lockup, so the harshest application drives the construction of the largest (`ARCH:165`, restated `APP:5`). This inverts the obvious generation order and is the single most load-bearing instruction in the corpus.
- **`RULE_SHARED_DNA`**: all three assets share letterform language, construction grid and optical weight class. Three marks that read as three brands is a system problem, not a logo problem (`ARCH:164`).

Generation quotas (`stated`):

```js
const QUOTAS = {
  variantsForReview:      { min: 6,  max: 12 },   // SKILL:150
  wordmarkExplorations:   { min: 3,  max: 4  },   // SKILL:144, distinct registers
  symbolsPerWordmark:     { min: 1,  max: 2  },   // SKILL:146
  architecturesShown:     3,                       // SKILL:173
  typeOptionsPerArch:     { min: 2, max: 3 },      // SKILL:173
  productionSpecTop:      3,                       // SKILL:154
  mockupContextsPerTop:   { min: 3, max: 5 },      // SKILL:156
  contextFailBudget:      2,   // fail 3+ contexts => not a primary mark. SKILL:119,148; APP:310
  conceptStageVariants:   { min: 2, max: 3 },      // PKG:13, concept deck is NOT a package
};
```

Note `variantsForReview` and `architecturesShown x typeOptionsPerArch` agree: 3 x (2..3) = 6..9, inside the 6..12 band. A generator should sample the grid, not produce 12 wordmarks in 12 typefaces (`SKILL:173`).

---

## 1. Architecture taxonomy as data

```js
const ARCHITECTURES = [
  {
    id: "wordmark",
    name: "Wordmark only",
    def: "Brand name set in a chosen typeface, possibly with custom letterform interventions. No standalone symbol.", // ARCH:9
    refs: ["Stripe", "Google", "Pinterest", "FedEx", "eBay", "Coca-Cola", "Visa"], // ARCH:9
    nameLengthFit: { ideal: [4, 8], upperEdge: [9, 12], fails: 10 }, // ARCH:17, ARCH:25 (note: the two bands overlap in the source; treat 9-12 as "needs justification")
    fits: [
      "Name is short, 4-8 letters best, 9-12 upper edge",              // ARCH:17
      "Name has at least one distinguishing letter or combination",     // ARCH:18
      "Brand recognition already high enough that type alone signals",  // ARCH:19
      "Category rewards type-led restraint (editorial, financial, professional services)", // ARCH:20
      "Budget and willingness for custom letterform work"               // ARCH:21
    ],
    fails: [
      "Name 10+ letters, wordmark cannot fit common contexts",          // ARCH:25
      "Category demands instant visual recognition (shelf, app icons)", // ARCH:26
      "Letterforms generic and no budget for custom drawing",           // ARCH:27
      "No fallback mark for square, social, embroidery contexts",       // ARCH:28
      "Wordmark looks identical to category peers"                      // ARCH:29
    ],
    requiredFallbacks: ["letterform-as-symbol", "monogram"],            // ARCH:33
    fallbackRule: "Fallback shares visual DNA with the wordmark: same weight class, same custom letterform language. Pinterest P-in-circle; Stripe custom geometric S for favicon.", // ARCH:33
    discipline: "Letter by letter. Kerning is not optional. Optical adjustments at every weight.", // ARCH:11
    earnedDetail: "Stripe's optical adjustment on lowercase r; FedEx arrow in E/x negative space; Google's Product Sans redraw." // ARCH:11
  },
  {
    id: "lockup",
    name: "Lockup (wordmark plus symbol)",
    def: "A wordmark and a symbol in a fixed relationship.", // ARCH:39
    refs: ["Slack", "Airbnb", "Asana", "Spotify", "MasterCard"], // ARCH:39
    isDefault: true, // ARCH:39 "default architecture for most brands"; SKILL:142
    orientations: [
      { id: "symbol-left",  frequency: "most common", why: "LTR reading pulls eye to symbol then wordmark" }, // ARCH:41
      { id: "symbol-above", frequency: "common",      why: "symbol is tall/narrow, or vertically constrained space" }, // ARCH:41
      { id: "symbol-right", frequency: "rare",        why: "editorial or signature treatments only" }, // ARCH:41
      { id: "stacked-centred", frequency: "required alternate", why: "square contexts" } // ARCH:41
    ],
    constructionRules: [
      "Symbol optical weight matches wordmark stroke weight",           // ARCH:43
      "Gap between symbol and wordmark tied to wordmark x-height or cap height, e.g. gap = 1 x-height", // ARCH:43
      "Without this, the lockup stretches at large sizes and crowds at small ones" // ARCH:43
    ],
    fits: [
      "Brand needs a symbol-grade asset alongside the wordmark",        // ARCH:47
      "Wordmark alone not distinctive at small sizes",                  // ARCH:48
      "Symbol must travel beyond text contexts (apps, signage, merch)", // ARCH:49
      "Both symbol and lockup will deploy in different contexts",       // ARCH:50
      "Budget for two finished assets"                                  // ARCH:51
    ],
    fails: [
      "Symbol carries detail that disappears at small size",            // ARCH:55
      "Symbol and wordmark compete: different weight class or optical density", // ARCH:56
      "No stacked alternate for square contexts",                       // ARCH:57
      "Lockup used at favicon scale where the fallback should carry",   // ARCH:58
      "Symbol too literal or too abstract for the wordmark's register"  // ARCH:60
    ],
    requiredFallbacks: ["symbol-only", "letterform-as-symbol", "monogram"], // ARCH:63
    fallbackRule: "Lockup primary; symbol-only for square and 24-32px; letterform-as-symbol or monogram for embroidery and 16px. Slack ships exactly this.", // ARCH:63
  },
  {
    id: "symbol-only",
    name: "Symbol only",
    def: "A symbol with no wordmark in the primary asset.", // ARCH:69
    refs: ["Apple", "Twitter", "Target", "Nike", "Mercedes-Benz", "Mastercard"], // ARCH:69
    availability: "Almost never available to new brands. Requires recognition the audience already holds.", // ARCH:69,71
    fits: [
      "Decades of recognition; symbol carries alone",                   // ARCH:77
      "Category where symbols travel further than wordmarks (sports apparel, automotive, luxury)", // ARCH:78
      "Symbol distinctive enough that no other brand is close",         // ARCH:79
      "Secondary contexts where wordmark space is unavailable",         // ARCH:80
      "Can afford the multi-decade recognition investment"              // ARCH:81
    ],
    fails: [
      "Brand is new and lacks recognition",                             // ARCH:85
      "Symbol is generic (hexagon, triangle, circle)",                  // ARCH:86
      "No investment in recognition through advertising or distribution", // ARCH:87
      "Chosen because the wordmark is too long (wrong solution to that problem)", // ARCH:88
      "Category demands wordmark presence (B2B SaaS, professional services)" // ARCH:89
    ],
    requiredFallbacks: ["wordmark"], // ARCH:93, for legal and contextual surfaces
    fallbackRule: "Symbol primary; wordmark for legal and contextual surfaces; lockup for select marketing. The symbol carries, the wordmark supports.", // ARCH:93
    generatorNote: "Its failure mode is strategic, not mechanical. It passes every application context and fails the brand-maturity gate. Gate on brand age / recognition input, not on rendering."
  },
  {
    id: "letterform-as-symbol",
    name: "Letterform-as-symbol",
    def: "A single letter from the name, custom-drawn to read as both letter and visual element.", // ARCH:99
    refs: ["Beats b", "McDonald's M", "Underscore _", "Atlas Coffee A-as-peak (hypothetical)"], // ARCH:99
    goodLetters: ["M", "A", "B", "S", "D"], hardLetters: ["I", "L", "J", "T"], // ARCH:107
    fits: [
      "First letter is visually rich",                                  // ARCH:107
      "Symbol and wordmark should read as one identity",                // ARCH:108
      "Budget for custom letterform drawing",                           // ARCH:109
      "Category rewards type-led over symbol-led brands",               // ARCH:110
      "Needs a small-size and embroidery-friendly fallback derived from the wordmark" // ARCH:111
    ],
    fails: [
      "Letterform reads as just a typed letter, adds nothing",          // ARCH:115
      "Styling overshoots, no longer reads as the letter",              // ARCH:116
      "Chosen letter structurally weak (thin stem, complex curve, confusing crossbar)", // ARCH:117
      "Custom letterform fights the wordmark",                          // ARCH:118
      "Used at sizes where it is illegible"                             // ARCH:119
    ],
    gate: "DOUBLE_READ: silhouette must read as the letter AND as the metaphor. One-directional read = fail.", // ARCH:103, SYM:163
    requiredFallbacks: ["wordmark"], // ARCH:123, for legal and large-format
    fallbackRule: "Lockup primary; letterform-as-symbol for square contexts and embroidery; full wordmark for legal and large format. Beats does this." // ARCH:123
  },
  {
    id: "monogram",
    name: "Monogram",
    def: "Multiple letters combined as a symbol, often ligature, tight kerning, or geometric framing.", // ARCH:129
    refs: ["Chanel CN", "Gucci GG", "HBO", "VW", "YSL"], // ARCH:129
    flavours: [
      { id: "pure-ligature",  desc: "letters share strokes, drawn as one shape", refs: ["CN", "GG"] },      // ARCH:133, SYM:209
      { id: "framed",         desc: "letters inside ring, shield, diamond, rectangle", refs: ["HBO", "YSL"] }, // ARCH:133, SYM:210
      { id: "tight-kerned",   desc: "set together with optical adjustments, no frame", refs: ["VW", "AOL"] }  // ARCH:133, SYM:211
    ],
    fits: [
      "Long name: 3+ words, or a single word over 10 letters",          // ARCH:137
      "Category where institutional gravity is the positioning (legal, financial, hospitality, luxury, academic)", // ARCH:138
      "Initials visually rich enough to read as a unit (M+N, C+N, V+W work; I+J, O+U harder)", // ARCH:139
      "Applications where the wordmark cannot fit (apron, foil-stamped book, signet ring, wax seal)", // ARCH:140
      "Positioning that signals tradition or heritage"                  // ARCH:141
    ],
    fails: [
      "Initials clash, fail to read as two distinct shapes",            // ARCH:145
      "Category is allergic to monograms (consumer tech, modern startup tier, anti-establishment)", // ARCH:146
      "Over-framed until it reads as a fake-heritage template",         // ARCH:147
      "Under-styled, reads as just typed initials",                     // ARCH:148
      "Used alone before the audience recognises the initials"          // ARCH:149
    ],
    requiredFallbacks: ["wordmark"], // ARCH:153
    fallbackRule: "Full wordmark marketing primary; monogram for square, embroidery, foil, signet, wax seal; lockup with both for letterhead, card, signage. Chanel and Gucci ship exactly this." // ARCH:153
  }
];
```

### 1b. The three-asset working pattern (`ARCH:157-165`)

```js
const ASSET_HIERARCHY = [
  { tier: 1, id: "primary-lockup",   uses: ["marketing", "web", "packaging", "signage"] },     // ARCH:161
  { tier: 2, id: "square-alternate", uses: ["social profile", "app icon", "square contexts"],
    def: "Same elements as the lockup, recomposed for square." },                              // ARCH:162
  { tier: 3, id: "small-grade",      uses: ["favicon", "embroidery", "foil stamp"],
    def: "A single element (symbol-only, letterform-as-symbol, or monogram) derived from the lockup.",
    buildOrder: "FIRST" }                                                                      // ARCH:163, ARCH:165
];
```

### 1c. Architecture x application-context matrix

Legend: `PASS` = ships as-is. `COND` = passes only if a stated numeric or construction condition holds. `FALLBACK` = fails, the hierarchy must supply a different asset. `NA-STRAT` = mechanically fine, gated on brand maturity instead.

| architecture | favicon-16 | app-icon-28 | patch-1.5in | mono-1c | reverse-dark | signage | motion | social-square | apparel-embroidery | foil-stamp |
|---|---|---|---|---|---|---|---|---|---|---|
| wordmark | FALLBACK `ARCH:13` | FALLBACK `APP:60` | COND `APP:93` | PASS | COND `APP:141` | COND `APP:168` | PASS `APP:189` | FALLBACK *derived from `APP:224`* | COND `APP:253` | COND `APP:281` |
| lockup | FALLBACK `APP:23` | FALLBACK `APP:51` | FALLBACK `VAR:52` | COND | COND | PASS `VAR:44` | PASS | FALLBACK `APP:224` | FALLBACK *derived* | COND |
| symbol-only | PASS `APP:32` | PASS `APP:61` | PASS | COND `APP:111` | COND `APP:142` | PASS | PASS `APP:189` | PASS `APP:212` | PASS `APP:263` | PASS |
| letterform-as-symbol | PASS `SKILL:108` | PASS | PASS `ARCH:111` | PASS | COND | PASS | PASS | PASS | PASS `VAR:52` | PASS `ARCH:140` |
| monogram | PASS `SKILL:109` | PASS `APP:61` | PASS `CAT:162` | PASS | COND | PASS | COND *derived: framed monograms have less natural assembly, `APP:196`* | PASS `APP:232` | PASS `CAT:447` | PASS `ARCH:140` |

The `COND` conditions are the numeric constraints in section 4. `symbol-only` scores a clean sheet mechanically and still loses on `ARCH:85` for any new brand, which is why the matrix alone cannot pick the architecture.

---

## 2. Typographic register taxonomy as data

Rampstack names 46 typefaces across 7 registers. Six are already on Google Fonts. The rest need substitutes, because brandi's canvas can only load `fonts.googleapis.com` CSS plus `fonts.gstatic.com` font files under CSP, and every other font host (Fontshare, Adobe Fonts, Klim, Commercial Type, Grilli Type, Hoefler) is blocked with no visible error.

```js
const REGISTERS = [
  {
    id: "geometric-sans",
    name: "Geometric sans",
    construction: "Built from circles and verticals; primitive shapes, consistent stroke weight, minimal optical adjustment.", // TYPE:9
    named: ["Futura", "Avenir", "Avenir Next", "Cabinet Grotesk", "ITC Avant Garde", "Gotham", "Proxima Nova"], // TYPE:9
    signals: ["modern", "considered", "optimistic", "deliberate"],  // TYPE:11
    categoryFit: ["tech-startups", "architecture-design-firms", "modern-hospitality", "wellness-considered-end", "real-estate-modern"], // TYPE:15-21
    exampleBrands: ["Spotify (Circular-derived)", "Airbnb (Cereal)", "Headspace (Apercu Pro)", "Nike (Futura-derived)"], // TYPE:24-28
    risks: [
      { id: "trend-chasing", desc: "Cabinet Grotesk codes as 2022-23 startup; using it now reads as late to a trend." }, // TYPE:36
      { id: "cold-tech",     desc: "Pure geometry feels emotionally distant." },  // TYPE:37
      { id: "interchangeable", desc: "Geometric wordmarks converge once a category saturates." } // TYPE:38
    ],
    deRisk: ["warm with colour", "custom letterform", "strong context", "specific weight and proportion choices, not just typeface selection"] // TYPE:37-38
  },
  {
    id: "humanist-sans",
    name: "Humanist sans",
    construction: "Serif-like calligraphic gestures without serifs; subtle thick-thin contrast, letterforms have movement.", // TYPE:44
    named: ["Gill Sans", "Optima", "Frutiger", "Source Sans Pro", "Inter (at higher optical sizes)", "Kabel", "Bliss"], // TYPE:44
    signals: ["professional", "warm", "timeless-not-dated", "restraint with personality"], // TYPE:46
    categoryFit: ["professional-services", "education-academic", "healthcare-calm-end", "civic-institutional", "editorial-modern-restrained"], // TYPE:50-56
    exampleBrands: ["BBC (Gill Sans, then BBC Reith)", "BMW Group", "One Medical (FF Tisa Sans)", "Penn / Stanford / MIT"], // TYPE:60-63
    risks: [
      { id: "british-civic", desc: "Gill Sans is so coded British-civic that non-British brands read anachronistic." }, // TYPE:71
      { id: "dated",  desc: "Frutiger reads 1990s transit; Optima reads 1970s pharmaceutical." }, // TYPE:72
      { id: "lukewarm", desc: "Safest choice, therefore the most forgettable." } // TYPE:73
    ],
    deRisk: ["custom letterform", "strong colour discipline", "deliberate period deployment"] // TYPE:72-73
  },
  {
    id: "neo-grotesque-sans",
    name: "Neo-grotesque sans",
    construction: "Even stroke weight, closed apertures, neutral letterform construction. 19th-century grotesque rationalised.", // TYPE:79
    named: ["Helvetica", "Inter", "Aktiv Grotesk", "Söhne", "GT America", "Univers", "Akzidenz-Grotesk"], // TYPE:79
    signals: ["competent", "contemporary", "defensible"], // TYPE:81
    metaphor: "The typographic equivalent of a black t-shirt. Tasteful, and everyone else is wearing it.", // TYPE:81
    categoryFit: ["b2b-saas", "modern-financial-services", "tech-at-scale", "modern-professional-services", "editorial-contemporary"], // TYPE:85-91
    exampleBrands: ["Stripe (Söhne)", "Ramp (Söhne)", "Linear (Inter)", "Vercel (Inter then Geist)", "Notion (Söhne)"], // TYPE:95-99
    risks: [
      { id: "interchangeable", desc: "Highest interchangeability risk of any register. B2B SaaS wordmarks blur together.", severity: "high" }, // TYPE:107
      { id: "helvetica-problem", desc: "Helvetica now reads as 'we did not make a typographic decision'." }, // TYPE:108
      { id: "screen-vs-print", desc: "Some cuts are screen-optimised and look thin in print; others the reverse." } // TYPE:109
    ],
    deRisk: ["custom letterforms", "strong supporting elements", "modern cut over Helvetica (Inter, Söhne, GT America)", "pick the cut for the primary application"] // TYPE:107-109
  },
  {
    id: "transitional-serif",
    name: "Transitional serif",
    construction: "High contrast: thick stems, thin transitions, sharp brackets. Between old-style and Didone.", // TYPE:115
    named: ["Source Serif", "Charter", "Lyon", "IBM Plex Serif", "Mrs Eaves", "Caslon Pro (small sizes)"], // TYPE:115
    signals: ["editorial", "considered", "intellectual", "serif gravity without heritage claim"], // TYPE:117
    categoryFit: ["legal-modern", "editorial-publications", "financial-considered-end", "academic-publishing", "luxury-editorial-end"], // TYPE:121-127
    exampleBrands: ["The Atlantic", "Vox Media (Lyon)", "Apple editorial (New York)", "IBM (Plex Serif)"], // TYPE:131-134
    risks: [
      { id: "magazine-costume", desc: "So coded editorial that non-editorial brands read as wearing a costume." }, // TYPE:142
      { id: "screen-rendering", desc: "Thin strokes break at small screen sizes if the cut is not screen-optimised." }, // TYPE:143
      { id: "trying-too-hard", desc: "Over-styling (italic, weight contrast, custom ligatures) flips restraint into ornate." } // TYPE:144
    ],
    deRisk: ["pick a screen-optimised cut (Charter, Source Serif, Plex Serif)", "set the wordmark large enough that thin strokes survive"] // TYPE:143
  },
  {
    id: "old-style-serif",
    name: "Old-style serif",
    construction: "Low contrast, warm organic shapes, diagonal stress, bracketed serifs. References 16th-18th century book type.", // TYPE:150
    named: ["Garamond", "Caslon", "Sabon", "Adobe Garamond", "Bembo", "Janson Text"], // TYPE:150
    signals: ["heritage", "traditional", "institutional"], // TYPE:152
    categoryFit: ["legal-heritage", "academic-institutions", "heritage-luxury", "editorial-literary", "whiskey-wine-generational"], // TYPE:156-162
    exampleBrands: ["The Economist (Caslon-derived)", "The New Yorker", "Yale / Oxford / Princeton presses", "Wachtell / Cravath / Latham"], // TYPE:166-169
    risks: [
      { id: "dated", desc: "Without deliberate restraint, reads old-fashioned. Goal or failure, depending." }, // TYPE:177
      { id: "thin-stroke-screen", desc: "Hairline serifs disappear at small screen sizes." }, // TYPE:178
      { id: "fake-heritage", desc: "Garamond on a brand founded last year reads as costume. Typography alone does not carry a heritage claim." } // TYPE:179
    ],
    deRisk: ["screen-optimised cut (Adobe Garamond Pro, EB Garamond)", "set the wordmark large", "the rest of the brand system must carry the heritage claim"] // TYPE:178-179
  },
  {
    id: "slab-serif",
    name: "Slab serif",
    construction: "Blocky rectangular serifs, often near-equal in weight to the stems.", // TYPE:185
    named: ["Sentinel", "Adelle", "Roboto Slab", "Tisa", "Rockwell", "Archer", "Vitesse"], // TYPE:185
    signals: ["strong", "structural", "declarative", "authority without heritage baggage"], // TYPE:187
    categoryFit: ["editorial-publishing-heavier", "sports", "journalistic", "industrial-engineering", "outdoor-adventure"], // TYPE:191-197
    exampleBrands: ["Mailchimp (Cooper-derived)", "WSJ (older treatments)", "NFL / college athletics", "Filson"], // TYPE:201-204
    risks: [
      { id: "newspaper-1985", desc: "Some slabs read 1980s editorial unless paired with current systems." }, // TYPE:212
      { id: "clunky", desc: "Structural weight overpowers the letterforms at large sizes." }, // TYPE:213
      { id: "genre-trapped", desc: "So coded sports/journalism/industrial that outside use reads as borrowing gravity." } // TYPE:214
    ],
    deRisk: ["size the wordmark so the slabs do not overpower", "pair with a current typographic system"], // TYPE:212-213
    bonus: "Survives embroidery where thin sans and Garamond do not." // APP:93
  },
  {
    id: "display-custom",
    name: "Display custom",
    construction: "Custom-drawn or heavily-modified typeface, letterforms that exist nowhere else.", // TYPE:220
    named: [], // by definition none
    signals: ["highest distinctiveness tier", "competitive moat"], // TYPE:222,228
    categoryFit: ["mature-brands-at-scale", "tech-with-type-design-budget", "heritage-luxury", "editorial-mastheads", "sports-leagues"], // TYPE:226-232
    exampleBrands: ["Stripe", "Google Product Sans", "Spotify (Circular variant, then Spotify Mix)", "Airbnb Cereal", "Pinterest"], // TYPE:236-240
    risks: [
      { id: "cost", desc: "Five to six figure engagements. Investment must match the recognition trajectory." }, // TYPE:248
      { id: "over-customisation", desc: "Custom glyphs should solve specific problems, not announce themselves." }, // TYPE:249
      { id: "aging", desc: "Custom faces age with the era they were drawn in. Plan to redraw every 5-10 years." } // TYPE:250
    ],
    pairingNote: "Rarely paired in lockup; the custom face IS the wordmark. Choose body/metadata type for small-size legibility, not visual harmony.", // TYPE:244
    brandiAdaptation: "Not reachable by font selection. Implement as: pick a Google Fonts base in an adjacent register, convert the wordmark to outlines, then apply path-level surgery to one or two glyphs. See section 2c."
  }
];
```

### 2a. Register pairing matrix (`TYPE:32,67,103,138,173,208,244`)

Directly usable as a validity check when a variant proposes a wordmark register plus a supporting register.

```js
const PAIRING = {                    // "ok" | "avoid"; symmetric
  "geometric-sans":     { "old-style-serif": "ok",  "slab-serif": "ok", "neo-grotesque-sans": "avoid", "humanist-sans": "avoid" },
  "humanist-sans":      { "old-style-serif": "ok",  "transitional-serif": "ok", "geometric-sans": "avoid", "neo-grotesque-sans": "avoid" },
  "neo-grotesque-sans": { "transitional-serif": "ok", "old-style-serif": "ok", "slab-serif": "ok",
                          "geometric-sans": "avoid", "humanist-sans": "avoid" },
  "transitional-serif": { "neo-grotesque-sans": "ok", "humanist-sans": "ok", "old-style-serif": "avoid" },
  "old-style-serif":    { "humanist-sans": "ok", "neo-grotesque-sans": "ok", "geometric-sans": "avoid", "transitional-serif": "avoid" },
  "slab-serif":         { "neo-grotesque-sans": "ok", "geometric-sans": "ok", "old-style-serif": "avoid" },
  "display-custom":     { "*": "not-paired-in-lockup" }
};
```

The rationale for every `avoid`: the two registers are too close and the pairing reads as indecisive (`TYPE:32,67,103`), or the contrast reads as a mistake rather than an intention (`TYPE:138,173,208`). Both are mechanically checkable, since the check is on the pair of register ids, not on the render.

### 2b. Google Fonts availability and substitutes

Availability is `YES` where the family ships on Google Fonts (some under a renamed release, noted). Substitutes are my proposals, not Rampstack's; each carries the reason it is the nearest match.

**Already available, use directly:**

| Rampstack name | GF family | Note |
|---|---|---|
| Inter | `Inter` | Named at `TYPE:44,79,83,98`. Also `Inter Tight` for tighter lockups. |
| Source Sans Pro | `Source Sans 3` | Renamed release, same design. `TYPE:44,48` |
| Source Serif | `Source Serif 4` | Renamed release. `TYPE:115,119`. Screen-optimised cut, so it de-risks `screen-rendering`. |
| IBM Plex Serif | `IBM Plex Serif` | `TYPE:115,119,134`. `IBM Plex Sans` also on GF, and is the wordmark face in the worked example `VAR:17`. |
| Roboto Slab | `Roboto Slab` | `TYPE:185,189` |
| EB Garamond | `EB Garamond` | Named by Rampstack itself as the screen-safe old-style cut, `TYPE:178`. |
| Geist | `Geist` | `TYPE:98`. Vercel's face shipped to the public Google Fonts catalogue; verified serving from `/s/geist/`. Removes the need to substitute Inter for it. |

**Availability has three tiers, and only one is usable.** Verified 2026-08-30 by probing `https://fonts.googleapis.com/css2?family=<Family>` and inspecting the returned `@font-face` src paths. A 200 response is **not** proof a family is usable, which is the trap a naive availability probe falls into:

| Tier | Signature in the returned CSS | Usable by brandi | Rampstack-named families that land here |
|---|---|---|---|
| Public catalogue | src from `fonts.gstatic.com/s/<family>/` | **yes**, OFL or Apache | Inter, Source Sans 3, Source Serif 4, IBM Plex Sans/Serif, Roboto Slab, EB Garamond, Geist, and all 43 proposed substitutes |
| Google restricted | src from `/s/`, plus a `See: https://fonts.google.com/license/googlerestricted` banner | **no**, Google-only licence | Product Sans |
| Commercial licensed delivery | src from `fonts.gstatic.com/l/font?kit=...&skey=...` | **no**, Monotype and similar licences; served for Workspace, not for third-party brand use | Avenir, Proxima Nova, Gill Sans, Helvetica, Garamond, Rockwell |

The last row matters most. Those six return HTTP 200 and would load fine past CSP, so the platform will not stop you. The licence will. Encode the check as a path test, not a status test:

```js
function isUsableGoogleFont(cssBody) {
  if (/googlerestricted/.test(cssBody)) return false;           // Google-only licence
  if (/fonts\.gstatic\.com\/l\/font\?kit=/.test(cssBody)) return false; // commercial delivery path
  return /fonts\.gstatic\.com\/s\//.test(cssBody);              // public catalogue
}
```

Because those six still fail the licence test, every substitution proposed for them below stands.

**Substitution table for everything else:**

| Register | Rampstack name | On GF | Proposed GF substitute | Why this one |
|---|---|---|---|---|
| geometric | Futura `TYPE:9` | no | **Jost** | Direct Futura revival, variable weights, closest geometric proportions available free. |
| geometric | Avenir / Avenir Next `TYPE:9` | licensed-only (`/l/` path) | **Mulish** (alt: `Nunito Sans`) | Avenir's warmed geometry with humanist proportions; Mulish keeps the round bowls without Poppins' monoline flatness. |
| geometric | Cabinet Grotesk `TYPE:9` | no (Fontshare, blocked) | **Space Grotesk** (alt: `Familjen Grotesk`) | Same display-grotesk-with-geometric-quirks lane. Note `TYPE:36`: this face is the trend-dated one, so prefer not selecting the lane at all. |
| geometric | ITC Avant Garde `TYPE:9` | no | **Poppins** | Monoline, near-circular bowls, single-storey feel; the standard free Avant Garde stand-in. |
| geometric | Gotham `TYPE:13` | no | **Montserrat** | Both derive from urban vernacular signage (NY vs Buenos Aires), same grounded geometric warmth. |
| geometric | Proxima Nova `TYPE:9` | licensed-only (`/l/` path) | **Montserrat** (alt: `Mulish`) | The long-standing free Proxima substitute; matching x-height and aperture. |
| geometric | Circular (Spotify) `TYPE:25` | no | **Outfit** | Clean contemporary geometric with even stroke and circular bowls. |
| geometric | Cereal (Airbnb) `TYPE:26` | no | **DM Sans** | Geometric-humanist hybrid, which is exactly Cereal's position. |
| geometric | Apercu Pro `TYPE:27` | no | **Work Sans** | Grotesque-geometric hybrid with slightly quirky terminals. |
| humanist | Gill Sans `TYPE:44` | licensed-only (`/l/` path) | **Cabin** | Cabin was explicitly drawn from the Johnston/Gill humanist lineage. Best structural match on GF. |
| humanist | Optima `TYPE:44` | no | **Julius Sans One** (display only, 1 weight; alt: `Marcellus` for a flared roman) | The only flared, high-contrast humanist sans on GF. Single weight is acceptable for a wordmark, not for a system. |
| humanist | Frutiger `TYPE:44` | no | **Open Sans** (alt: `Nunito Sans`) | Open Sans descends from the Frutiger-influenced humanist line via Droid Sans; matching aperture and signage legibility. |
| humanist | Kabel `TYPE:44` | no | **Josefin Sans** | Josefin is drawn in the Kabel/geometric-Art-Deco idiom. |
| humanist | Bliss `TYPE:44` | no | **Nunito Sans** | Same soft humanist neutrality. |
| neo-grotesque | Helvetica `TYPE:79` | licensed-only (200 but `/l/` path) | **Inter** (alt: `Archivo`; `Arimo` if metric compatibility with Arial matters) | Note `TYPE:108` says do not pick Helvetica anyway. Substitute forward, to a modern cut. |
| neo-grotesque | Aktiv Grotesk `TYPE:79` | no | **Archivo** | Neutral grotesque with tighter apertures than Inter. |
| neo-grotesque | Söhne `TYPE:79,95,99` | no | **Archivo** (alt: `Inter Tight`) | Söhne is an Akzidenz descendant; Archivo is the nearest Akzidenz-lineage grotesque on GF. |
| neo-grotesque | GT America `TYPE:79` | no | **Libre Franklin** | GT America crosses American gothic with Swiss; Libre Franklin is the American gothic (Franklin) half, on GF. |
| neo-grotesque | Univers `TYPE:79` | no | **Roboto** (alt: `Archivo`) | Closest rationalised neo-grotesque with a full weight range. |
| neo-grotesque | Akzidenz-Grotesk `TYPE:79,83` | no | **Archivo** | As above. |
| neo-grotesque | Product Sans (Google) `TYPE:89` | restricted licence | **Jost** (alt: `Poppins`) | Product Sans is neo-grotesque-influenced geometric; Jost lands closest. |
| neo-grotesque | San Francisco (Apple) `TYPE:89` | no (system font) | **Inter** | Inter was drawn against the same screen-UI brief. |
| transitional | Charter `TYPE:115,119` | no (Bitstream Charter) | **Charis SIL** | Charis SIL is a direct Charter derivative and is on GF. Highest-fidelity substitution in this table. |
| transitional | Lyon `TYPE:115,132` | no | **Newsreader** (alt: `Literata`) | Contemporary editorial transitional with the same high-contrast display cut. |
| transitional | Mrs Eaves `TYPE:115,131` | no | **Baskervville** (alt: `Libre Baskerville`) | Mrs Eaves is a Baskerville revival; Baskervville is the closest free Baskerville with the low x-height. |
| transitional | Caslon Pro `TYPE:115` | no | **Libre Caslon Text** / **Libre Caslon Display** | Direct Caslon revivals, text and display cuts. |
| old-style | Garamond / Adobe Garamond `TYPE:150,154` | licensed-only (`/l/` path) | **EB Garamond** (alt: `Cormorant Garamond` for display-only, higher contrast) | EB Garamond is the canonical free Garamond and Rampstack already endorses it at `TYPE:178`. |
| old-style | Caslon `TYPE:150,154` | no | **Libre Caslon Text** | Direct revival. |
| old-style | Sabon `TYPE:150,154` | no | **EB Garamond** | Sabon is a modernised Garamond; substituting to the Garamond root is closer than any other GF face. |
| old-style | Bembo `TYPE:150,154` | no | **Cardo** (alt: `Gentium Book Plus`) | Cardo is drawn in the Aldine/Bembo humanist tradition. |
| old-style | Janson Text `TYPE:150` | no | **Crimson Pro** (alt: `Libre Caslon Text`) | Dutch old-style with similar sturdy serifs and moderate contrast. |
| old-style | ITC New Baskerville `TYPE:167` | no | **Libre Baskerville** | Direct Baskerville revival, screen-optimised. |
| slab | Sentinel `TYPE:185,189` | no | **Bitter** | Contemporary Clarendon-ish slab, which is Sentinel's lane. |
| slab | Adelle `TYPE:185,189` | no | **Zilla Slab** | Both are screen-optimised editorial slabs with squared serifs. |
| slab | Tisa `TYPE:185,189` | no | **Bitter** (alt: `Zilla Slab`) | Humanist-warmed slab. |
| slab | Rockwell `TYPE:185,189` | licensed-only (`/l/` path) | **Rokkitt** | Rokkitt is explicitly a Rockwell-idiom geometric slab. |
| slab | Archer `TYPE:185` | no | **Bree Serif** | Archer's defining feature is ball terminals; Bree Serif is the nearest free face with soft rounded terminals. |
| slab | Vitesse `TYPE:185` | no | **Zilla Slab** | Squared-off, engineered slab. |
| slab | Cooper (Mailchimp) `TYPE:201` | no | **Bree Serif** (weak match) | No true Cooper Black equivalent on GF. Flag this substitution to the user rather than shipping it silently. |
| display-custom | Stripe / Product Sans / Spotify Mix / Cereal / Pinterest `TYPE:236-240` | n/a | See 2c | Not substitutable by font choice. |

Two substitutions are weak enough to warn on: **Cooper** (no free equivalent) and **Optima** (`Julius Sans One` is display-weight-only). Everything else is close enough that the register signal survives.

### 2c. How brandi implements `display-custom` under CSP

The register is the highest-distinctiveness tier (`TYPE:222`) and is unreachable by font selection. The implementable equivalent, and it matches what Rampstack says custom work is actually for (`SKILL:169`, custom letterforms solve a specific problem):

1. Pick the GF base in the adjacent register the brief implies.
2. Set the wordmark, then convert the glyphs to outlines (`<path>`), which is also the licensing-safe delivery form, `PKG:181`.
3. Apply path-level surgery to **one or two glyphs only**, each solving a named problem. Rampstack's own examples of legitimate surgery: a flat-bottomed `g` that conflicts with a descender, an `a` that breaks the rhythm, an `A` that becomes a mountain peak (`SKILL:169`); Stripe's optical adjustment on the lowercase `r` (`ARCH:11`).
4. Record the surgery in the `typography` field of the variant spec as a delta from the base face, the way `VAR:18` records the custom `A`.

Two useful side effects. Outlining removes the font dependency from the delivered SVG entirely, which is `PKG:181`'s requirement. And the "custom for novelty reads as gimmicky" failure (`SKILL:169`) becomes checkable: count the modified glyphs, and require each to name the problem it solves.

---

## 3. Symbol approach taxonomy as data

```js
const SYMBOL_APPROACHES = [
  {
    id: "literal",
    name: "Literal",
    def: "The symbol depicts the thing the brand name refers to.", // SYM:9
    recognition: "fast", ambiguity: "low", distinctiveness: "low-by-default", // SYM:11
    cognitiveLoad: "Audience learns that THIS peak is THIS brand, not what the symbol means. Smaller load than abstract, which is why it works for new brands without large budgets.", // SYM:11
    refs: ["Apple (the bite is the execution)", "Patagonia Fitz Roy", "Twitter bird era", "Shell", "Burger King"], // SYM:17-21
    patternVocabulary: [
      "single-object silhouette (peak, rocket, leaf, bird, fish, tree, building)", // SYM:25
      "stylised object reduction (apple bite, burger as stacked rectangle, shell as fan)", // SYM:26
      "object-plus-frame (mountain in a circle, tree in a shield)", // SYM:27
      "repeated-object pattern (multiple peaks, paired forms)", // SYM:28
      "object combined with letterform (see letterform-derived)" // SYM:29
    ],
    fits: ["descriptive name", "category rewards fast recognition (shelf, street signage)", "brand wants approachable not institutional", "audience reads symbols faster than wordmarks"], // SYM:34-37
    fails: ["abstract name forces an uninvited metaphor", "category saturated with literal symbols", "the depiction cliches the category", "brand needs premium/institutional and the depiction reads childlike"], // SYM:40-43
    cliches: ["leaf-as-natural", "swoosh-as-growth", "mountain-as-aspiration", "bullseye-as-precision", "shield-as-security"], // SYM:47-51
    escape: "Specific execution. Draw a specific leaf with specific construction, so the audience reads 'this leaf' not 'a leaf'." // SYM:53
  },
  {
    id: "abstract-gesture",
    name: "Abstract gesture",
    def: "The symbol suggests a quality without literal depiction. Rising arc for growth, opposing forms for balance, loop for integrity.", // SYM:59
    recognition: "slow", ambiguity: "medium", distinctiveness: "high", // SYM:61
    payoff: "Once associated, delivers more brand-specific recognition than literal, because no other brand can use the same specific gesture.", // SYM:61
    refs: ["Nike swoosh", "Mastercard circles", "Audi four rings", "Adidas three stripes", "PBS"], // SYM:67-71
    patternVocabulary: ["arcs and curves (rising, descending, S-curve, spiral)", "repeated forms (stripes, circles, bars)", "opposing forms (two halves meeting, mirrored, yin-yang variants)", "implied motion", "geometric primitives at scale used as the gesture"], // SYM:75-79
    fits: ["abstract name", "brand claims a quality without depicting it", "category rewards distinctiveness over fast recognition (B2B, professional services, mature brands)", "brand has recognition runway to teach the association"], // SYM:84-87
    fails: ["new brand without recognition to associate the gesture", "gesture borrowed from a saturated vocabulary", "construction does not support the claim (a swoosh that does not swoop)", "over-complicated, no single quality extractable"], // SYM:90-93
    cliches: ["swoosh-as-growth", "hexagon-as-blockchain", "three-bars-as-tech-startup", "infinity-as-continuous", "ascending-arc-as-progress"], // SYM:97-101
    singleIdeaRule: "One gesture. A swoosh for motion is fine; motion AND innovation AND momentum AND speed is over-loaded.", // SYM:63, restated SKILL:167
    escape: "Specific construction: specific weight, angle and proportion, so the gesture is the brand's, not the category's." // SYM:103
  },
  {
    id: "geometric-reduction",
    name: "Geometric reduction",
    def: "Formal abstraction with no specific referent. Hexagon, triangle, stacked lines, bisected circle, square with a corner removed.", // SYM:109
    recognition: "medium", ambiguity: "high", distinctiveness: "lowest-by-default", // SYM:111
    signals: ["modern", "confident", "technical", "infrastructural"], // SYM:111,135
    refs: ["Microsoft four-square", "Adidas three stripes (reduction reading)", "Mastercard two circles", "Audi four rings", "Linear stacked bars"], // SYM:117-121
    patternVocabulary: ["polygons (hexagon, octagon, triangle, square, diamond)", "primitive intersections (overlapping circles, intersecting squares)", "linear primitives (stacked bars, parallel lines, grids)", "single primitive at scale", "negative-space primitives"], // SYM:125-129
    fits: ["budget for distinctive construction", "brand wants modern/technical/infrastructural", "category rewards reduction over expression (B2B SaaS, infrastructure, fintech, distributed systems)", "wordmark distinctive enough that the symbol can be quietly supportive"], // SYM:134-137
    fails: ["new brand with generic construction", "the primitive is the category's most common one", "reduction too far from any narrative the brand wants", "not paired with a distinctive wordmark, so the system reads interchangeable"], // SYM:140-143
    cliches: ["hexagon-as-blockchain", "triangle-as-direction", "square-as-foundation", "stacked-three-bars-as-tech-startup", "bisected-circle-as-balance"], // SYM:147-151
    escape: "Proportional specificity: regular vs wide vs tall hexagon, this angle, this stroke or fill discipline, paired with a specific wordmark." // SYM:153
  },
  {
    id: "letterform-derived",
    name: "Letterform-derived",
    def: "The symbol is built from the name's letterforms. A custom letter that doubles as a visual element.", // SYM:159
    coherence: "highest", // SYM:161, wordmark and symbol ARE the same construction language
    refs: ["McDonald's M", "Beats b", "Underscore _", "Hoover Dam H"], // SYM:167-170
    patternVocabulary: ["first-letter exaggeration", "letter-inside-frame", "punctuation-as-symbol (underscore, asterisk, ampersand)", "letter-as-object (M as arches, A as peak)", "stacked or overlapping letterforms, ligature-style"], // SYM:174-178
    fits: ["first letter visually rich (M, A, B, S, D)", "symbol and wordmark should share construction", "budget for custom letterform drawing", "category rewards type-led over symbol-led"], // SYM:183-186
    fails: ["reads as just a typed letter", "styling overshoots and it no longer reads as the letter", "chosen letter structurally weak (thin stem, complex curve, confusing crossbar)", "custom letterform fights the wordmark"], // SYM:189-192
    cliches: ["letter-inside-circle without distinctive letterform construction", "letter-with-an-angled-corner (decoration, not metaphor)", "letter-with-extreme-styling that fails the silhouette test"], // SYM:196-198
    gate: "DOUBLE_READ. The silhouette must read as the letter AND as the metaphor. If only one direction reads, the metaphor is not earning its place.", // SYM:163, ARCH:103, SKILL:172
    escape: "Specific letterform decisions that produce the double reading. The double read is the only thing that justifies the custom drawing investment." // SYM:200
  },
  {
    id: "monogram",
    name: "Monogram",
    def: "Multiple letters combined as a symbol, with ligature, tight kerning, or geometric framing.", // SYM:206
    signals: ["institutional gravity", "we have a long name", "we own its initials", "we are old enough that abbreviating is acceptable"], // SYM:213
    flavours: ["pure-ligature", "geometrically-framed", "tight-kerned-unframed"], // SYM:209-211
    refs: ["Chanel CN", "Gucci GG", "HBO", "YSL", "Volkswagen VW"], // SYM:217-221
    patternVocabulary: ["ligature pairs with shared counters or strokes", "stacked initials with a horizontal divider", "framed initials (ring, shield, diamond, oval)", "overlapping initials", "crowned or filigreed (heritage luxury)"], // SYM:225-229
    fits: ["long name, 3+ words or 10+ letters", "category where institutional gravity is positioning", "initials visually rich enough to read as a unit", "applications where the wordmark cannot fit (apron, foil-stamped book, signet ring, wax seal)", "positioning signals tradition or heritage"], // SYM:234-238
    fails: ["initials clash and fail to read as two distinct shapes", "category allergic to monograms (consumer tech, modern startup tier)", "over-framed until it reads as a fake-heritage template", "under-styled, reads as typed initials"], // SYM:241-244
    cliches: ["monogram-inside-a-heavy-ring", "heritage-shield-with-a-year", "ornamental-monogram-with-filigree", "monogram-with-a-serif-crown"], // SYM:248-251
    escape: "Restrained execution: specific letterform construction, specific kerning, minimal framing. The discipline is what makes CN read as Chanel and not as a costume version of Chanel." // SYM:253
  }
];
```

### 3a. Name-type to symbol-approach mapping (`SYM:259-265`, `SKILL:100`)

The selector. This is the single rule that keeps a symbol connected to a name; `SYM:266` is explicit that the wrong approach disconnects them ("a literal peak on Stripe would read as a brand mistake").

```js
const NAME_TYPE_TO_APPROACH = {
  descriptive: { prefer: ["literal", "letterform-derived"],
                 examples: ["Atlas","Forge","Pulse","Anchor","Falcon","Mountain"] },   // SYM:261, SKILL:100
  abstract:    { prefer: ["abstract-gesture", "geometric-reduction"],
                 examples: ["Stripe","Anthropic","Linear","Notion"] },                  // SYM:262, SKILL:100
  heritage:    { prefer: ["monogram"],
                 examples: ["founder surname","place name","multi-word firm"] },        // SYM:263, SKILL:100
  techModern:  { prefer: ["geometric-reduction"],
                 warning: "highest interchangeability risk; save with specific proportions and pairing" } // SYM:264
};
```

### 3b. The full cliche blocklist, deduplicated

Twenty-nine banned motifs across `SYM` and `CAT`. A generator should refuse any of these at symbol-brief time, not at review time. Grouped by trigger.

```js
const CLICHE_BLOCKLIST = [
  // universal (SYM:47-51, 97-101, 147-151, 196-198, 248-251)
  { motif: "leaf",                      banFor: ["sustainability","wellness","organic","cpg"] },
  { motif: "swoosh",                    banFor: ["*"], note: "growth claim, borrowed from Nike" },
  { motif: "mountain-as-aspiration",    banFor: ["wellness","productivity"], allowFor: ["outdoor"], note: "allowed only with a specific named peak, SYM:13" },
  { motif: "bullseye",                  banFor: ["analytics","targeting"] },
  { motif: "shield",                    banFor: ["security","finance","*"] },
  { motif: "hexagon",                   banFor: ["crypto","web3","distributed-systems","tech"], note: "most overused primitive in tech" },
  { motif: "three-stacked-bars",        banFor: ["saas","developer-tools"] },
  { motif: "infinity-loop",             banFor: ["always-on"] },
  { motif: "ascending-arc",             banFor: ["analytics","growth","financial-services"] },
  { motif: "triangle-pointing",         banFor: ["productivity","navigation","strategy","saas"] },
  { motif: "square-as-foundation",      banFor: ["platform","infrastructure"] },
  { motif: "bisected-circle",           banFor: ["wellness","productivity","balance"] },
  { motif: "letter-inside-circle",      banFor: ["saas"], note: "banned only when the letterform is not distinctively constructed" },
  { motif: "letter-with-angled-corner", banFor: ["*"] },
  { motif: "monogram-in-heavy-ring",    banFor: ["*"] },
  { motif: "shield-with-year-founded",  banFor: ["*"], note: "reads as craft beer label; CAT:177, CAT:462" },
  { motif: "filigree-monogram",         banFor: ["*"], note: "Renaissance Faire, not Hermes" },
  { motif: "crown",                     banFor: ["luxury","hospitality","fashion"] },
  // category-specific (CAT)
  { motif: "roman-pillar",              banFor: ["legal"] },        // CAT:34
  { motif: "scales-of-justice",         banFor: ["legal"] },        // CAT:35
  { motif: "gavel",                     banFor: ["legal"] },        // CAT:36
  { motif: "lady-justice",              banFor: ["legal"] },        // CAT:37
  { motif: "dot-or-circle-as-modernity",banFor: ["cpg"] },          // CAT:82
  { motif: "brushstroke-under-wordmark",banFor: ["cpg"] },          // CAT:83
  { motif: "crossed-keys",              banFor: ["hospitality"] },  // CAT:178
  { motif: "resort-palm-or-mountain",   banFor: ["hospitality"] },  // CAT:179
  { motif: "medical-cross",             banFor: ["healthcare"], note: "Red Cross trademark exposure in some uses" }, // CAT:224
  { motif: "caduceus",                  banFor: ["healthcare"], note: "misread as Hermes; not the medical symbol" }, // CAT:225
  { motif: "heartbeat-line",            banFor: ["healthcare","fitness"] }, // CAT:226
  { motif: "eagle",                     banFor: ["financial-services"] },   // CAT:270
  { motif: "bull",                      banFor: ["financial-services"] },   // CAT:272
  { motif: "chevron-pointing-up",       banFor: ["financial-services"] },   // CAT:273
  { motif: "blackletter-masthead",      banFor: ["editorial"] },            // CAT:317
  { motif: "drop-cap-decorative",       banFor: ["editorial"] },            // CAT:318
  { motif: "pen-nib",                   banFor: ["editorial","writing"] },  // CAT:319
  { motif: "book-and-ribbon",           banFor: ["editorial"] },            // CAT:320
  { motif: "neural-network-circles",    banFor: ["ai","tech"] },            // CAT:364
  { motif: "brain-with-circuit-traces", banFor: ["ai","tech"] },            // CAT:365
  { motif: "triangle-with-eye",         banFor: ["ai","tech"] },            // CAT:366
  { motif: "bear-silhouette",           banFor: ["outdoor","lifestyle"] },  // CAT:411
  { motif: "peak-with-rising-sun",      banFor: ["outdoor"] },              // CAT:412
  { motif: "compass-rose",              banFor: ["outdoor","travel"] },     // CAT:413
  { motif: "pnw-cabin-aesthetic",       banFor: ["outdoor"] },              // CAT:414, VAR:70
  { motif: "tent-silhouette",           banFor: ["outdoor"] }               // CAT:415
];

const PALETTE_BLOCKLIST = [
  { pattern: "blue-green-gradient", banFor: ["healthcare"] },   // CAT:227
  { pattern: "blue-gold-gradient",  banFor: ["financial-services"] }, // CAT:274
  { pattern: "purple-gradient",     banFor: ["tech","ai"], note: "the 2018-2022 tech tier" }, // CAT:367
  { pattern: "old-english-on-gold-foil", banFor: ["fashion","luxury"] } // CAT:463
];
```

---

## 4. Application context test matrix as data

Every field below is stated by Rampstack except where marked `derived`. The `svgCheck` column is my translation into a check against a normalised SVG (viewBox `0 0 100 100` for symbols, or the mark's own bounding box), which is what makes these mechanical rather than advisory.

```js
const CONTEXTS = [
  {
    id: "favicon-16",
    name: "16px favicon",
    size: { px: 16, note: "32x32 in some browsers; 16 is the historical baseline and reveals construction problems first" }, // APP:11
    constraints: {
      maxDistinguishableElements: 6,      // APP:15, "roughly 4 to 6"
      minStrokePx: 2,                     // APP:16, "lines under 2px disappear"
      gradientsAllowed: false,            // APP:17
      maxColours: 4                       // APP:18, "no more than 3 to 4 before the algorithm dithers"
    },
    svgCheck: "At a 100-unit viewBox: min stroke/limb width >= 12.5 units (2/16). Count unique fill+stroke colours <= 4. Assert no <linearGradient>/<radialGradient>. Count distinct closed regions <= 6. Assert zero <text> elements.", // derived from APP:15-19
    passFail: "Symbol or letterform reads at thumbnail scale, not as a logo.", // APP:19
    mechanical: true,
    visionPass: "Render at 16px, upscale 8x nearest-neighbour, ask: is this one identifiable shape or pixel mush?",
    failureModes: ["lockups almost always fail","fine letterform details disappear","multi-colour symbols dither","internal cutouts lost","multiple primitives blur together"], // APP:23-27
    mitigation: ["ship a dedicated 16x16 asset, never a downscaled lockup","use a single element from the lockup","test on real browser tabs, not a design-tool preview","if no clean 16x16 fallback can be derived, the lockup itself is over-detailed"] // APP:31-34
  },
  {
    id: "app-icon-28",
    name: "28px app icon",
    size: { px: [28, 60], iosSizes: [29,40,60,76,80,87,120,152,167,180,1024] }, // APP:44, APP:63
    constraints: {
      maskShapes: ["rounded-square-ios","circle-ios","rounded-square-android","circle-android-launcher"], // APP:45, APP:63
      maxDistinguishableElements: 8,      // APP:46
      minStrokePx: 3,                     // APP:48
      requiresBackgroundField: true       // APP:47, icons have visible bounds
    },
    svgCheck: "min stroke >= 10.7% of icon width (3/28). Elements <= 8. Assert an explicit background fill (not transparent). Assert the safe area: all marks inside a circle of r=45 in a 100-unit box survives the circle mask.", // derived from APP:44-48
    passFail: "Mark works inside rounded-square AND circle masks, at every required size.", // APP:63
    mechanical: true,
    extraDeliverable: "monochrome/tinted variant for iOS dark mode and tinted home screens", // APP:64
    failureModes: ["lockups fail nearly as often as at favicon","thin strokes lose definition","multi-colour clashes with the icon background","negative-space cutouts lost","square-ratio marks fail in a circle mask"] // APP:52-56
  },
  {
    id: "patch-1.5in",
    name: "1.5 inch embroidery patch",
    size: { inches: 1.5, mm: 38.1, alternatives: [2, 2.5] }, // APP:74
    constraints: {
      maxColours: 6,                      // APP:75, "4 to 6 maximum, each thread colour is a setup cost"
      minStrokeMm: 1,                     // APP:76
      minLetterHeightMm: 2,               // APP:79
      gradientsAllowed: false,            // APP:77
      sharpInsideCorners: false           // APP:80, acute angles fail under the needle path
    },
    svgCheck: "min stroke >= 2.6% of mark width (1/38.1). min cap height >= 5.2% (2/38.1). unique colours <= 6. no gradients. flag interior angles < 30 degrees.", // derived from APP:74-80
    passFail: "Embroiderable at 4-6 thread colours with chunky strokes.", // APP:301
    mechanical: true,
    typefaceRule: "Slab serifs, heavy sans, custom thick letterforms survive. Thin sans and Garamond do not.", // APP:93
    failureModes: ["over 6 colours gets silently simplified by the embroiderer","fine letterforms go muddy","gradient marks are dropped or the job refused","thin internal lines lost under thread weight"] // APP:83-87
  },
  {
    id: "single-colour",
    name: "Single-colour reproduction",
    media: ["etching","foil stamp","letterpress","offset 1c","fax","engraving","1c screen print"], // APP:100
    constraints: { colours: 1, gradientsAllowed: false, colourDependentMeaning: false, subtleTonalContrast: false }, // APP:104-107
    svgCheck: "Collapse every fill and stroke to #000 on #fff. Assert the number of distinct closed regions is unchanged, i.e. no two regions that were distinguished only by hue have merged into one silhouette.", // derived from APP:112-113
    passFail: "Reads as the brand in pure black on white. If not, colour is doing too much work.", // SKILL:130, APP:119
    mechanical: true,
    mechanicalCaveat: "Region-merge detection is mechanical. Whether the merged silhouette still 'reads as the brand' is a vision judgement.",
    deliverable: "a dedicated single-colour version with stroke weights and proportions adjusted for monochrome, not just a desaturated primary" // APP:120
  },
  {
    id: "reverse-dark",
    name: "Reverse on dark",
    surfaces: ["dark-mode web header","signage at night","product photography on black","black envelope letterhead"], // APP:128
    constraints: { contrastMustHold: true, gradientDirectionMayNeedInverting: true, negativeSpaceMarksNeedCarefulInversion: true }, // APP:132-135
    svgCheck: "Compute WCAG contrast of every fill against the dark background; require >= 3:1 for non-text graphical elements. Assert the mark is not defined by a white-only knockout that vanishes on dark.", // derived from APP:141-143; threshold from brand-identity/references/contrast-and-accessibility.md
    passFail: "Holds up inverted, without reading as a different mark.", // APP:139
    mechanical: true,
    mechanicalCaveat: "Contrast is computable. 'Reads as a different mark' is a vision judgement.",
    deliverable: "either a direction-neutral construction grid (Apple, Nike) or two tuned variants, light-on-dark and dark-on-light" // APP:149-150
  },
  {
    id: "signage-large",
    name: "Large-format signage",
    size: { widthFeet: [8, 12], readingDistanceFeet: [50, 200] }, // APP:164, APP:175
    constraints: { vectorOnly: true, pantoneSpecRequired: true, thinStrokesLookAnemic: true, gridIntegrityAtAllScales: true }, // APP:160-163
    svgCheck: "Assert pure vector, no <image>. Assert stroke-to-height ratio above a floor so the mark does not go anemic (derived floor: min limb width >= 4% of mark height). Assert Pantone values are present in the colour tokens.", // derived from APP:160-168, APP:177
    passFail: "Survives scaling to 12 feet and reads at street distance.", // APP:304
    mechanical: "partly",
    illuminationNote: "Front-lit, halo-lit and edge-lit render differently; test with the actual illumination direction." // APP:178
  },
  {
    id: "motion",
    name: "Motion lockup",
    timing: { brandEntrySec: [1, 3], appLaunchSec: [0.5, 1], fpsWeb: [30, 60], fpsFilm: 24 }, // APP:190-191
    constraints: { naturalEntryAndExit: true, stagedReveal: true, intentionalEasing: true }, // APP:188-192
    revealGrammar: { wordmark: "letter by letter, following the letterform construction", symbol: "rotate, scale, or assemble from parts" }, // APP:189, APP:197-198
    passFail: "The construction suggests its own assembly; the mark does not merely snap into place.", // APP:196, APP:203
    mechanical: false,
    visionPass: "partly, from a rendered sequence",
    humanCall: "Whether the easing 'feels intentional' is human.", // APP:192
    failureModes: ["arbitrary construction has no natural animation","random letter entrance reads generic","rotate-or-scale-only reads obvious","too long is annoying, too short does not register"] // APP:196-199
  },
  {
    id: "social-square",
    name: "Social profile picture (square)",
    size: { px: [400, 800], notificationFeedPx: [60, 80] }, // APP:217, APP:219
    constraints: { aspect: "1:1", circleMaskLikely: true, mustReadAtNotificationScale: true, mustHoldOnLightAndDarkPlatformUI: true }, // APP:216-220
    svgCheck: "Assert a stacked or symbol-only asset exists for this context. Assert all marks fit inside the inscribed circle (r=50 in a 100-unit square). Re-run the favicon element/stroke checks at 80px.", // derived from APP:224-234
    passFail: "Works inside a circle mask at 80px.", // APP:306
    mechanical: true,
    failureModes: ["horizontal lockups crop, losing the wordmark's left and right edges","corners lost to the circle mask","detail that survives at 200px dies at 60-80px","colours that work on white clash with dark platform UI"] // APP:224-227
  },
  {
    id: "apparel-embroidery",
    name: "Apparel embroidery",
    substrate: "thread directly into fabric, no patch backing; polos, hats, beanies, tees, aprons", // APP:240
    constraints: {
      maxColours: 6,             // APP:244
      minStrokeMm: [1.5, 2],     // APP:245, heavier than patch because the fabric is the substrate
      minLetterHeightMm: 2.5,    // APP:247
      gradientsAllowed: false,   // APP:246
      mustSurviveWashing: true   // APP:249
    },
    svgCheck: "min stroke >= 3.9-5.2% of a 38.1mm mark. min cap height >= 6.6%. colours <= 6. Strictly tighter than the patch check, so a mark that passes apparel passes patch.", // derived from APP:244-247
    passFail: "Survives thread on fabric and repeated washing.", // APP:307
    mechanical: "partly",
    threadSpec: "Specify thread brand and code (Madeira, Robison-Anton), not CMYK or hex. Worked example: Madeira Polyneon 1842 primary, 1338 accent.", // APP:261, VAR:56
    humanCall: "Wash durability is only knowable from a physical sample." // APP:262
  },
  {
    id: "foil-stamp",
    name: "Foil stamp on paper or leather",
    surfaces: ["business cards","letterhead","bound books","leather portfolios","signet rings","wax-seal stamps"], // APP:269
    constraints: { colours: 1, minStrokeMm: 1, thinSerifsDisappear: true, substrateDependent: true }, // APP:273-276
    svgCheck: "colours == 1. min stroke >= 1mm at the applied physical size. Flag any serif bracket thinner than the min stroke.", // derived from APP:273-275
    passFail: "Survives single-colour metallic impression.", // APP:308
    mechanical: true,
    spec: "Specify foil colour (PMS gold, silver, copper) and finish (matte vs glossy).", // APP:289
    failureModes: ["thin letterforms uneven or gone","colour-contrast-dependent marks lose meaning","heavy fills bleed at the edges"] // APP:281-283
  }
];
```

### 4a. Scoring rule

```js
// SKILL:119, SKILL:148, APP:310
function classify(variant) {
  const fails = CONTEXTS.filter(c => !passes(variant, c)).length;
  if (fails >= 3) return "not-a-primary-mark";   // may still serve as secondary or display lockup
  return "contender";
}
```

Note the asymmetry a generator must respect: a `FALLBACK` result in the architecture matrix (section 1c) is **not** a fail if the hierarchy supplies a covering asset. A lockup that fails favicon, app icon, patch and social is still a legitimate primary, because tiers 2 and 3 cover all four (`ARCH:63`). The fail count applies to the **system**, not to any single asset. This is easy to get wrong and would reject every lockup, which is the default architecture.

### 4b. Constraint constants worth hard-coding

Sorted by strictness, so the tightest constraint governs. Apparel embroidery is the binding constraint on stroke weight in physical media; the 16px favicon binds in digital.

| Constraint | Value | Binding context |
|---|---|---|
| min stroke, digital | 2px at 16px = 12.5% of mark width | favicon `APP:16` |
| min stroke, digital, icon | 3px at 28px = 10.7% | app icon `APP:48` |
| min stroke, physical | 2mm at 38.1mm = 5.2% | apparel embroidery `APP:245` |
| min cap height, physical | 2.5mm = 6.6% | apparel embroidery `APP:247` |
| max colours, digital small | 4 | favicon `APP:18` |
| max colours, physical | 6 | embroidery `APP:75`, `APP:244` |
| max colours, foil | 1 | `APP:273` |
| max distinct elements | 6 | favicon `APP:15` |
| gradients | forbidden in 5 of 10 contexts | `APP:17,77,110,246,273` |

Gradients fail favicon, patch, single-colour, apparel and foil. That is half the matrix, which effectively makes gradient marks non-viable under Rampstack's own scoring rule. Worth encoding as a default refusal rather than a warning.

---

## 5. Category conventions as data

Ten categories at parity (`CAT:5`). Compressed from 489 lines. `cliches` are indexed into `CLICHE_BLOCKLIST` above rather than repeated.

```js
const CATEGORIES = [
  {
    id: "legal", name: "Legal firms", // CAT:9-52
    audience: "General counsel, founders raising or selling, CFOs. High stakes, trusts visual signals of institutional gravity.", // CAT:11
    defaultRegisters: ["old-style-serif", "transitional-serif"],
    defaultArchitecture: "lockup-with-monogram | wordmark-with-monogram-fallback", // CAT:16, firm names are long
    defaultSymbolApproach: "monogram",
    palette: ["navy","deep charcoal","oxblood","deep forest green"], forbidden: ["primary red","bright blue","anything casual"], // CAT:17
    honour: ["heritage signal via old-style serif and monogram", "single-colour reproducibility from day one", "geometric framing only in restrained execution"], // CAT:22-24
    break: ["geometric sans wordmark => modern, accessible (boutique, tech-adjacent, plaintiff-side)", "lighter palette => approachability", "asymmetric lockup => contemporary"], // CAT:28-30
    contexts: ["court filings (1c black on white, small)","embossed letterhead and cards","engraved brass / etched glass lobby signage","email signature with firm wordmark plus attorney name","billable-hours invoices at low reproduction quality"], // CAT:41-45
    refs: ["Latham & Watkins (LW serif monogram)","Wachtell (full firm name, no symbol, 'we don't need a symbol')","Skadden"] // CAT:49-51
  },
  {
    id: "cpg", name: "Consumer goods / CPG", // CAT:55-97
    audience: "Shelf competition. Must register at 10-15 feet, at thumbnail, and in a 2-second scan.", // CAT:57
    defaultRegisters: ["display-custom"],
    defaultArchitecture: "lockup-with-literal-symbol | strong-wordmark-only", // CAT:62
    defaultSymbolApproach: "literal",
    palette: ["bold","bright"], note: "Colour is the first signal on shelf, before the wordmark reads.", // CAT:63, CAT:70
    honour: ["distinctiveness at 80x80 thumbnail","simplified versions for embossed packaging, foil, hot-metal print","colour recognition ahead of wordmark recognition"], // CAT:68-70
    break: ["restrained typography => premium (Method, Brandless, Aesop)","black-and-white only => minimalist/anti-CPG","hand-drawn letterforms => craft/small-batch"], // CAT:74-76
    contexts: ["retail packaging at shelf scale","online product thumbnails 80x80 to 200x200","print catalogue, sometimes 1c","in-store signage and end-caps","branded merch the brand sells"], // CAT:87-91
    refs: ["Method","Hu Chocolate","Brandless"] // CAT:95-97
  },
  {
    id: "b2b-saas", name: "B2B SaaS", // CAT:101-145
    audience: "Category dominated by visual interchangeability: neo-grotesque type, geometric reduction, blue-to-purple primary.", // CAT:103
    defaultRegisters: ["neo-grotesque-sans"],
    defaultArchitecture: "lockup",
    defaultSymbolApproach: "abstract-gesture | geometric-reduction", // CAT:108
    palette: ["single accent plus monochrome"], // CAT:109
    mandatoryDeRisk: "custom letterform in the wordmark, to escape the interchangeable default", // CAT:110
    honour: ["screen rendering at every size and DPI","app icon construction for rounded-square and circle masks","monochrome and reverse-on-dark both working"], // CAT:114-116
    break: ["old-style serif => 'we take ourselves seriously'","bright primary (red, orange, yellow) => energy in a blue-and-grey category","display custom => long-term brand investment"], // CAT:120-122
    contexts: ["app icons (iOS, Android, web app, browser extension)","marketing site at desktop scale","docs site favicon/header/footer","in-product loading screens, empty states, account avatars","Slack and email integration thumbnails"], // CAT:134-138
    refs: ["Stripe","Linear","Vercel","Notion"] // CAT:142-145
  },
  {
    id: "hospitality", name: "Hospitality (hotels, restaurants, resorts)", // CAT:149-195
    audience: "Experiences the brand across many surfaces at once. Multi-surface coherence is the discipline.", // CAT:151
    defaultRegisters: ["display-custom","transitional-serif"],
    defaultArchitecture: "lockup-with-monogram-fallback", // CAT:156
    defaultSymbolApproach: "monogram",
    palette: ["restrained, single signature colour, extending to interior design, materials, lighting"], // CAT:157
    mandatoryVariant: "embroidery-grade, from day one", // CAT:158
    honour: ["embroidery on uniforms, towels, robes, sheets","foil stamp on stationery and room keys","engraved/etched exterior and wayfinding signage","palette restraint"], // CAT:162-165
    break: ["modern geometric sans => boutique, design-forward (Ace, Standard)","bold colour => contemporary/playful","asymmetric lockup","display custom"], // CAT:169-172
    contexts: ["illuminated channel-letter building signage","room key cards (foil on plastic or paper)","towels, robes, sheets (embroidery)","glassware, china, silverware (etched, engraved)","stationery suite (foil)","uniforms, name tags, lapel pins","bag tags and luggage labels"], // CAT:183-189
    refs: ["Aman","Soho House","Ace Hotel"] // CAT:193-195
  },
  {
    id: "healthcare", name: "Healthcare", // CAT:199-241
    audience: "May be anxious, stressed, or grieving. Must read competent and calm without reading cold or clinical.", // CAT:201
    defaultRegisters: ["humanist-sans"],
    defaultArchitecture: "lockup",
    defaultSymbolApproach: "abstract-gesture", // CAT:206, suggests care/balance/healing without depicting it
    palette: ["blue","green","soft warm neutrals"], forbidden: ["aggressive red, reads as emergency"], // CAT:207, CAT:213
    honour: ["WCAG AA contrast on every brand colour combination", "restrained palette", "avoid symbols that misread as religious or as a specific specialty when the brand is generalist"], // CAT:212-214
    break: ["modern geometric sans => tech-forward primary care (One Medical, Forward)","warmer palette (coral, peach, soft yellow)","display custom"], // CAT:218-220
    contexts: ["clinic and hospital wayfinding","patient-facing intake forms, reminders, billing statements","medical equipment branding, on-screen and on printed reports","insurance and billing communications","uniforms and badges"], // CAT:231-235
    refs: ["One Medical","Forward","Hims"], // CAT:239-241
    hardConstraint: "WCAG AA is a floor, not a preference, in this category." // CAT:212
  },
  {
    id: "financial", name: "Financial services", // CAT:245-288
    split: "heritage vs fintech-modern; the split is itself the positioning decision", // CAT:247
    defaultRegisters: { heritage: ["old-style-serif"], fintech: ["neo-grotesque-sans"] }, // CAT:251
    defaultArchitecture: { heritage: "lockup-with-monogram-fallback", fintech: "wordmark-with-abstract-symbol" }, // CAT:252
    defaultSymbolApproach: { heritage: "monogram", fintech: "abstract-gesture" },
    palette: { heritage: ["navy","gold","deep green"], fintech: ["black","white","single electric accent"] }, // CAT:253
    honour: ["single-colour reproducibility (foil, regulatory filings, embossed cheques)","trust via restraint and material quality","colour choice as the heritage/fintech signal"], // CAT:258-260
    break: ["geometric sans in heritage => boutique contemporary (rare, high stakes)","bright colour in heritage => 'not your father's bank' (high risk)","old-style serif in fintech => 'we take compliance seriously'"], // CAT:264-266
    contexts: ["embossed credit and debit cards (impressed, not printed)","regulatory filings and disclosures (1c)","bank cheques (1c, MICR)","illuminated branch signage","ATM screens and branded interfaces"], // CAT:278-282
    refs: ["Goldman Sachs","Ramp","Mercury"] // CAT:286-288
  },
  {
    id: "editorial", name: "Editorial / publishing", // CAT:292-334
    thesis: "The masthead IS the logo. Most editorial brands have no separate symbol.", // CAT:294
    defaultRegisters: ["display-custom","old-style-serif","transitional-serif"],
    defaultArchitecture: "wordmark | wordmark-with-monogram-fallback", // CAT:299
    defaultSymbolApproach: null,
    palette: ["black on white default","single accent"], // CAT:300-301
    honour: ["1c reproducibility at masthead scale","custom letterform investment, the masthead is the most-rendered asset","typographic heritage referencing the founding era"], // CAT:305-307
    break: ["geometric sans => contemporary editorial (Vox, BuzzFeed, Vice)","bold colour","modern asymmetric layouts"], // CAT:311-313
    contexts: ["newsstand at 50-100 feet","print body and headline systems","digital masthead at desktop and mobile","subscription direct mail (1c)","masthead overlaying cover photography"], // CAT:324-328
    refs: ["The Atlantic","The New Yorker","Cereal"] // CAT:332-334
  },
  {
    id: "tech-ai", name: "Tech / AI", // CAT:338-381
    thesis: "Two modes dominate: neo-grotesque plus abstract gesture, or aggressive geometric reduction. Visual fatigue in the category is real.", // CAT:340
    defaultRegisters: ["neo-grotesque-sans","geometric-sans"],
    defaultArchitecture: "lockup",
    defaultSymbolApproach: "abstract-gesture | geometric-reduction", // CAT:345
    palette: ["signature colour plus monochrome"], // CAT:346
    honour: ["screen rendering at every size","app icon construction across every iOS/Android size and mask","monochrome and reverse-on-dark variants"], // CAT:351-353
    break: ["old-style serif","hand-drawn or organic letterforms => craft, human-centred","bright primary in a sea of muted palettes"], // CAT:357-359
    contexts: ["developer documentation sites, dense technical context","API and CLI, the brand appears in terminal output, error messages, log lines","in-product loading and empty states","open-source repo profile pictures","conference slide branding"], // CAT:371-375
    refs: ["Anthropic (lowercase wordmark plus slanted-A glyph, no separate symbol)","OpenAI","Hugging Face (emoji-as-symbol, distinctive where the category does not usually allow it)"] // CAT:379-381
  },
  {
    id: "outdoor", name: "Outdoor / lifestyle / apparel", // CAT:385-430
    thesis: "Intersection of illustration, heritage and embroidery. The mark is frequently embroidered, so it must survive thread on fabric.", // CAT:387
    defaultRegisters: ["display-custom","slab-serif"],
    defaultArchitecture: "lockup-with-literal-symbol", // CAT:392
    defaultSymbolApproach: "literal",
    palette: ["earth tones","warm reds","deep greens","cream and coffee"], // CAT:393
    mandatoryVariant: "embroidery-grade, inside the primary system not as an afterthought", // CAT:394, APP:94
    honour: ["embroidery at 4-6 thread colours","patch-friendly construction","hand-drawn or vintage execution signalling craft","palette referencing the brand's actual environment"], // CAT:398-401
    break: ["modern geometric sans => contemporary outdoor (Topo Designs, Outdoor Voices)","bright colour => younger/athletic","wordmark-only => premium design-led (rare)"], // CAT:405-407
    contexts: ["apparel embroidery (hats, polos, jackets, packs)","patch embroidery","heat-transfer on technical fabrics","hangtags and care labels","small specialty retail signage"], // CAT:419-423
    refs: ["Patagonia","REI","Filson","Topo Designs"] // CAT:427-430
  },
  {
    id: "luxury", name: "Fashion / luxury", // CAT:434-479
    thesis: "Dominated by monogram and ligature. Heritage houses use monograms; modern accessible-luxury uses display custom. The split is the positioning question.", // CAT:436
    defaultRegisters: ["old-style-serif","display-custom"],
    defaultArchitecture: "lockup-with-monogram-fallback | wordmark-with-monogram-on-goods", // CAT:441
    defaultSymbolApproach: "monogram",
    palette: ["black","white","gold","one signature accent"], // CAT:442
    mandatoryVariant: "embroidery-grade for apparel and accessories", // CAT:443
    honour: ["embroidery on apparel and accessories","foil stamp and emboss on packaging","material quality (heavy paper, leather, metallic foil)","restraint in palette and ornamentation"], // CAT:447-450
    break: ["modern geometric sans => accessible luxury (The Row, Aime Leon Dore)","bright colour (rare, risky)","hand-drawn or expressive letterforms => craft"], // CAT:454-456
    contexts: ["apparel embroidery","hardware embossing (buttons, rivets, zipper pulls, leather goods)","foil stamp on boxes, dust bags, ribbon","engraved or etched hardware (jewellery, watches)","vellum and tissue printing","flagship window displays"], // CAT:467-472
    refs: ["Chanel","Gucci","The Row","Aime Leon Dore"] // CAT:474-479
  }
];
```

### 5a. The in-category / out-of-category rule (`TYPE:258-260`, `CAT:3`, `CAT:485-489`)

```js
// The default is the starting point, not the answer.
// In-category choice  => reads as competence, "this brand understands the category". TYPE:258
// Out-of-category     => reads as positioning, and the REST OF THE SYSTEM must support it. TYPE:259, CAT:487
// Neither by accident => the actual trap. CAT:3
//
// Gate on a break: "Breaking type without breaking the rest of the system reads as random." CAT:487
// Closing calibration: "Distinctiveness without belonging reads as outsider;
//                       belonging without distinctiveness reads as forgettable." CAT:489
```

For a generator this means every out-of-category register selection must carry a `positioningJustification` string, and the colour, imagery and voice fields must also depart from the category default. A lone type departure should be rejected.

---

## 6. The per-variant spec: nine fields

Shape (`SKILL:182-193`), example filled from `VAR:9-84`. The example is worth reproducing at this fidelity because it sets the specificity bar: `VAR:94` says "IBM Plex Sans Medium with tracking +5" is specific, "modern sans-serif" is not.

```js
const VARIANT_SPEC = {
  // 1. SKILL:184 - descriptive identifier with index
  name: "Variant 07, Mountain peak A lockup, IBM Plex Sans",

  // 2. SKILL:185 - one of ARCHITECTURES, plus the full asset hierarchy
  architecture: {
    id: "lockup",
    composition: "Wordmark right of a custom letterform-as-symbol A. The A reads as the first letter of Atlas and as a stylised mountain peak.",
    stackedAlternate: "A centred above the wordmark, for square contexts",
    smallGradeFallback: "A alone, for favicon, embroidery, stamping"
  },                                                                        // VAR:13

  // 3. SKILL:186 - typeface, weight, custom letterform notes, tracking and kerning
  typography: {
    face: "IBM Plex Sans",
    weight: "Medium (500)",
    tracking: "+5 (10 units on a 1000-unit em)",
    customLetterform: {
      glyph: "A",
      problem: "must read as both letter and peak",
      construction: "crossbar replaced with a single horizontal stroke at 38% height; apex rises to a sharp peak; legs splayed 8 degrees from vertical to suggest mountain base width without exaggeration",
      appliedTo: "replaces the typed A in the wordmark so the whole wordmark reads as a unit"
    },
    composition: "'Atlas Coffee' set as one word with a half-x-height gap between words, so the eye reads both words as parallel parts of one name without a hyphen or a stack",
    opticalAdjustments: [
      "'t' of Atlas shortened by 4 units to balance against the rising A to its left",
      "'f' of Coffee terminal pulled inward by 3 units to stop it reading as an extra bar"
    ]
  },                                                                        // VAR:17-20

  // 4. SKILL:187 - approach plus visual description plus construction grid
  symbol: {
    approach: "letterform-derived",
    grid: "4-unit",
    construction: {
      apexHeight: "4 units, sharp peak",
      crossbar: "at 1.5 unit height, single horizontal stroke",
      legWidthAtBase: "4 units, splayed 8 degrees from vertical",
      strokeWeight: "matches the wordmark at Medium, approximately 90 units on a 1000-unit em"
    },
    silhouetteRules: ["apex ungenerous, sharp not rounded", "crossbar single-stroke, no double bars", "legs end flat, no serif"],
    doubleReadTest: "At every scale the silhouette reads first as a peak, then as the letter A. PASS."
  },                                                                        // VAR:24-31

  // 5. SKILL:188 - primary, mono black, mono white, reverse
  colourTokens: {
    primary:   { name: "Warm charcoal", hex: "#2A2521", use: "wordmark and symbol in standard reproduction" },
    accent:    { name: "Rust", hex: "#B85C38", use: "marketing surfaces and packaging trim, NOT in the lockup itself" },
    monoBlack: { hex: "#000000", use: "embossed letterhead, foil on paper, 1c print, fax" },
    monoWhite: { hex: "#FFFFFF", use: "reverse on dark, dark-mode header, night signage, dark leather emboss" },
    reverse:   { note: "the symbol's negative-space inversion is direction-neutral, so the mark reads identically either way" }
  },                                                                        // VAR:35-39

  // 6. SKILL:189 - contexts it excels in, contexts needing a fallback, embroidery notes
  applicationNotes: {
    excelsAt: [
      { context: "signage-large", note: "peak silhouette reads at street scale; the wordmark holds at 8-12 feet wide" },
      { context: "retail-packaging", note: "lockup at 4 inches on the bag front; wordmark anchors the side panel" },
      { context: "ceramic-stamping", note: "lockup with stacked alternate works on cylindrical surfaces" },
      { context: "embossed-letterhead", note: "custom A embossed at the top, wordmark printed below" },
      { context: "web-header", note: "clean at 200-400px wide" }
    ],
    needsFallback: [
      { context: "favicon-16", fallback: "symbol-only A" },
      { context: "patch-1.5in", fallback: "symbol-only A with the wordmark stacked below in IBM Plex Sans Bold; the lockup is too wide" },
      { context: "app-icon-28", fallback: "symbol-only A in a warm charcoal field, white A" },
      { context: "social-square", fallback: "stacked alternate, A above wordmark, centred" }
    ],
    embroidery: {
      threads: [{ colour: "primary", code: "Madeira Polyneon 1842" }, { colour: "accent", code: "Madeira Polyneon 1338" }],
      minStroke: "3 units, scaled for 1.5 inch patch reproduction"
    }
  },                                                                        // VAR:43-56

  // 7. SKILL:190 - what it communicates, the features it foregrounds
  signals: [
    { id: "considered-craft", evidence: "optical adjustments (shortened t, pulled-in f) signal the brand thinks about every letterform, therefore about every other detail" },
    { id: "outdoor-adjacency-without-literal-imagery", evidence: "peak silhouette references outdoor without a trail, tree, or campsite" },
    { id: "warmth-without-rusticity", evidence: "warm charcoal plus rust avoids both heritage-coffee brown and third-wave-minimalist white" },
    { id: "single-origin-discipline", evidence: "one symbol, one wordmark, one accent; the same discipline as single-origin sourcing" }
  ],                                                                        // VAR:60-63

  // 8. SKILL:191 - what it explicitly is NOT; the negative space it creates
  rejects: [
    "Not a coffee shop laurel mark. No wreath, bean, or cup.",
    "Not a third-wave-minimalist wordmark with no symbol; Atlas needs a symbol-grade asset for embroidery, hardware stamping and merch.",
    "Not a literal coffee bean. The category cliche is rejected.",
    "Not a Pacific-Northwest-cabin aesthetic. The outdoor adjacency is structural (peak inside the letter), not stylistic."
  ],                                                                        // VAR:67-70

  // 9. SKILL:192 - rendered in 3 to 5 contexts; minimum web header, business card, favicon
  mockups: [
    { context: "storefront-signage", desc: "lockup as illuminated channel letters on stained wood above the cafe entrance" },
    { context: "retail-bag",         desc: "12oz bag, lockup at 4 inches on the front, wordmark plus origin on the side panel" },
    { context: "espresso-cup",       desc: "symbol-only A stamped in warm charcoal at 1 inch on a double-walled glass cup; lockup on the saucer rim" },
    { context: "embroidered-apron",  desc: "symbol-only A in rust on the chest pocket; wordmark in warm charcoal at the back hem, smaller" },
    { context: "social-profile",     desc: "stacked alternate, white on warm charcoal, inside a circle mask at 80-400px" }
  ]                                                                         // VAR:76-84
};
```

**Spec-writing discipline** (`VAR:92-98`), five rules a generator should enforce on its own output:

1. Be specific. Named face plus weight plus numeric tracking, never "modern sans-serif". `VAR:94`
2. Show the system. Each variant is a primary plus its fallbacks; document the hierarchy, not just the primary. `VAR:95`
3. Justify with signals AND rejects. The negative space sharpens the positive selection. `VAR:96`
4. Render mockups, in image or in prose. A spec without mockups is half-finished. `VAR:97`
5. Prepare for production. Colour tokens, thread matches, foil specs and minimum sizes are the bridge from decision to manufacture. `VAR:98`

Note what the example does that the field list does not require, and that is worth copying: every number is a unit on a stated grid (4-unit symbol grid, 1000-unit em, degrees of splay, percentage heights). That is what makes the spec renderable rather than descriptive.

---

## 7. Client package matrix

```js
const FILE_FORMATS = [                                                       // PKG:23-31
  { ext: "svg",  use: "web, scalable applications, modern email clients", kind: "vector", role: "primary delivery format", brandiCanProduce: true },
  { ext: "ai|eps", use: "editable source for designers", kind: "vector", role: "source, layered if multi-component", brandiCanProduce: false },
  { ext: "pdf",  use: "print, vector applications, archival", kind: "vector", role: "embedded fonts or outlined", brandiCanProduce: "via-svg-to-pdf" },
  { ext: "png",  use: "web, decks, raster where the background is unknown", kind: "raster", sizes: [64,128,256,512,1024,2048], transparent: true, brandiCanProduce: true },
  { ext: "jpg",  use: "email signatures, contexts without transparency", kind: "raster", sizes: [1024], background: "solid, usually white", brandiCanProduce: true },
  { ext: "ico",  use: "favicon", kind: "raster", sizes: [16,32,48], note: "multi-resolution packed into one file", brandiCanProduce: "via-png" },
  { ext: "png",  use: "iOS home-screen bookmark", name: "apple-touch-icon", sizes: [180], brandiCanProduce: true }
];
// PKG:33 - the asymmetry: vector is the source of truth, raster is derived at delivery time.
// Never deliver only raster; clients eventually need to scale up and cannot.

const VARIANT_MATRIX = {                                                     // PKG:39-53
  colourTreatment: ["primary", "reverse", "mono-black", "mono-white", "mono-brand"],
  composition:     ["primary-lockup", "stacked", "symbol-only", "with-tagline", "without-tagline"],
  rule: "Every relevant combination. A simple wordmark may be 5 variants; a complex lockup with tagline and symbol variants may be 30+. Exhaustive within the system, not arbitrary." // PKG:53
};

const NAMING = {                                                             // PKG:106-117
  pattern: "{variant}-{color}-{size|context}.{ext}",
  examples: ["primary-color.svg", "primary-color-2048.png", "reverse-white.svg",
             "mono-black-1024.png", "stacked-color.pdf", "symbol-color.svg"],
  rationale: "The client can guess a filename before looking." // PKG:118
};
```

Folder structure (`PKG:59-98`), numbered so folders open in use order; documentation last because nobody reads it first, applications second-to-last because they are reference not deliverable (`PKG:100`):

```
{brand-name}-logo-package/
  01-primary/          primary-color.{svg,ai,pdf,jpg} + png at 2048,1024,512,256,128,64
  02-reverse/          same format set, white-on-dark
  03-mono/             mono-black/ mono-white/ mono-brand/  (full set each)
  04-stacked/          same format set, vertical lockup
  05-symbol/           symbol-only variants if applicable
  06-favicon/          favicon.ico, apple-touch-icon.png, favicon-16.png, favicon-32.png, favicon-48.png
  07-applications/     business-card-mockup.pdf, letterhead-mockup.pdf, email-signature.png, social-avatar.png
  08-documentation/    usage-guide.pdf, brand-colors.pdf, license.pdf
  README.md
```

Documentation layer (`PKG:122-155`):

| File | Contents | Note |
|---|---|---|
| `usage-guide.pdf` | clear space (as a multiple of a recurring element, often wordmark x-height or symbol diameter); minimum size in px and mm/in; do's; don'ts (stretch, recolour outside the variant set, rotate, effects, busy photography without contrast, replacing the wordmark's typography); co-branding rules including spacing and order | `PKG:127-131`. "A usage guide that just lists the variants is documentation theatre. The do's-and-don'ts section is what protects the mark in the wild." `PKG:133` |
| `brand-colors.pdf` | Hex, RGB, CMYK, Pantone, HSL. Gradient stops and direction documented explicitly if used | `PKG:137-144`. Gradients vary unpredictably across rendering engines. |
| `license.pdf` | who owns the mark; designer attribution; usage terms; modification rights and warranty period; successor terms on sale or merger | `PKG:148-155`. Target a signed 1-pager, between the skipped and the over-formatted extremes. |

Delivery (`PKG:159-167`): ZIP over email under ~50MB; cloud link (most common, view-only with download enabled, expiry if warranty is time-bound); brand portal (Frontify, Brandfolder, Brandkit) worth it above 10 internal stakeholders or dozens of marks. `PKG:167` is the useful cynicism: match the mechanism to the client's actual workflow, since clients ask for a portal then download the ZIP and never log in.

Done condition (`PKG:185-187`): the client opens the link, opens `01-primary/primary-color.svg`, and ships to production within 5 minutes. If they email asking "do you have a white version / is there an SVG / can you send the favicon", the package was incomplete.

**Gaps for brandi.** AI and EPS cannot be produced without Illustrator, so the source-file row needs either an SVG-is-the-source substitution stated in the README, or an explicit omission note. PDF is reachable by SVG conversion. ICO is reachable by packing PNGs. Everything else is native.

---

## 8. Failure patterns as checks

Deduplicated across `SKILL:164-175`, the `when this fails` blocks in `ARCH`, the `Common pitfalls` in `TYPE`, the `cliches` in `SYM`, the `Failure modes` in `APP`, and `PKG:171-181`. `check` values: `mech` = computable from the SVG, spec object, or file listing; `vision` = a VLM pass over a rendered PNG; `human` = needs the client, the market, or a physical sample.

| # | Failure | Source | Check | The concrete test |
|---|---|---|---|---|
| 1 | Designing for the founder's taste, not the audience's perception | `SKILL:164` | human | The audience-side test wins. No proxy exists. |
| 2 | Skipping the silhouette test | `SKILL:127,165` | vision | Render type-stripped, fill flat black, blur or downscale. Ask: identifiable? |
| 3 | Not distinctive vs category | `SKILL:128` | human | Rampstack's test is a Google Images search for "[category] logo"; fails if it matches 3+ existing marks. Needs external search, so not offline-checkable. Partially reachable: match against `CLICHE_BLOCKLIST` (mech). |
| 4 | Fails the sketchability test | `SKILL:129` | human | 7-year-old redraws it from memory after 30 seconds. |
| 5 | Ignoring small-size legibility at 16px | `SKILL:166`, `APP:23` | mech | `CONTEXTS.favicon-16.svgCheck`. Stroke, colour count, element count, no `<text>`. |
| 6 | Trying to depict everything the brand does | `SKILL:167`, `SYM:63` | vision | Count extractable ideas in the symbol. 1 is right, 2 is the ceiling, 3+ reads as committee work. |
| 7 | Picking a typeface for trend | `SKILL:168`, `TYPE:36` | mech | Blocklist trend-dated faces and their substitutes (Cabinet Grotesk / Space Grotesk, monoline geometric of the 2020-23 wave) unless explicitly justified. |
| 8 | Over-customising letterforms | `SKILL:169`, `TYPE:249` | mech | Count modified glyphs; require <= 2, each naming the problem it solves. |
| 9 | Lockup falls apart across sizes | `SKILL:170` | mech + vision | Render at 200/100/50/25 percent. Mech: assert the symbol-to-wordmark gap stays a fixed multiple of x-height and nothing overlaps. Vision: proportions and clash. |
| 10 | Colour-dependent mark | `SKILL:171`, `APP:111` | mech | Collapse to `#000`; assert the distinct-region count is unchanged. |
| 11 | Letterform-as-symbol fails the letter's silhouette | `SKILL:172`, `ARCH:103`, `SYM:163` | vision | Two prompts on the same render: "what letter is this" and "what object is this". Both must answer correctly. |
| 12 | Reviewing too many similar variants | `SKILL:173` | mech | Assert 3 distinct `architecture.id` values across the set, 2-3 register options each. Reject a set of N wordmarks differing only by typeface. |
| 13 | Skipping the embroidery test | `SKILL:174`, `APP:83-87` | mech | `patch-1.5in` and `apparel-embroidery` svgChecks: stroke %, cap height %, colour count, no gradients. |
| 14 | Gradient anywhere in the mark | `APP:17,77,110,246,273` | mech | Assert no `<linearGradient>` or `<radialGradient>` in the primary or any small-grade asset. Fails 5 of 10 contexts, so refuse by default. |
| 15 | No stacked alternate for square | `ARCH:57`, `APP:224` | mech | Assert an asset exists with aspect ratio between 0.9 and 1.1. |
| 16 | No small-grade fallback exists | `ARCH:28,58`, `APP:34` | mech | Assert all three hierarchy tiers exist. If tier 3 cannot be derived from tier 1, the lockup is over-detailed. |
| 17 | Three marks read as three brands | `ARCH:164` | vision | Show all three side by side, ask whether they are one system. |
| 18 | Symbol and wordmark weight mismatch | `ARCH:56`, `SKILL:146` | mech | Compare symbol stroke width to wordmark stem width; require within a tolerance band (derived: ±15%). |
| 19 | Lockup gap not tied to x-height | `ARCH:43` | mech | Assert `gap == k * xHeight` for a declared k. |
| 20 | Symbol-only chosen by a new brand | `ARCH:85` | mech | Gate on the brand-maturity input; refuse symbol-only-primary without stated recognition. |
| 21 | Monogram initials clash | `ARCH:145`, `SYM:241` | vision | Render the pair, ask whether two distinct shapes are readable. Partial mech: flag known-hard pairs (I+J, O+U) and hard single letters (I, L, J, T) from `ARCH:107,139`. |
| 22 | Monogram over-framed into fake heritage | `ARCH:147`, `SYM:248` | mech + vision | Mech: frame stroke as a fraction of letter stroke; flag above a ratio. Also flag `heritage-shield-with-year`, `crown`, `filigree` from the blocklist. |
| 23 | Register interchangeable within category | `TYPE:38,107` | mech | If register == category default AND no custom letterform AND no distinctive symbol, warn. Highest severity for `neo-grotesque-sans` in `b2b-saas` (`TYPE:107`, `CAT:103`). |
| 24 | Indecisive register pairing | `TYPE:32,67,103,138,173,208` | mech | Look up `PAIRING[a][b]`; reject `avoid`. |
| 25 | Thin serifs break on screen or under foil | `TYPE:143,178`, `APP:281` | mech | Measure the thinnest path segment; compare against the context minimum. |
| 26 | Fake heritage: old-style serif on a brand founded last year | `TYPE:179` | human | Needs founding date plus the rest of the system. Partial mech: warn if register is `old-style-serif` and founding year is within 5 years. |
| 27 | Cliche symbol motif | `SYM:47,97,147,196,248`, `CAT` | mech | Match the symbol brief and generated shape tags against `CLICHE_BLOCKLIST` filtered by category. |
| 28 | Cliche palette | `CAT:227,274,367,463` | mech | Match against `PALETTE_BLOCKLIST` by category. |
| 29 | Symbol approach disconnected from name | `SYM:266` | mech | Classify the name (descriptive / abstract / heritage / tech-modern); assert the chosen approach appears in `NAME_TYPE_TO_APPROACH[type].prefer`. |
| 30 | Reverse-on-dark contrast fails | `APP:141-143` | mech | WCAG contrast of every fill against the dark background >= 3:1. |
| 31 | Marks lost to a circle mask | `APP:56,225` | mech | Assert all geometry falls inside the inscribed circle. |
| 32 | Detail dies at notification scale | `APP:226` | mech + vision | Re-run the favicon element and stroke checks at 80px. |
| 33 | No natural entry or exit animation | `APP:196` | human | Whether the construction "suggests its own assembly" and the easing "feels intentional" is a design judgement. |
| 34 | Anemic strokes at signage scale | `APP:168` | mech | Assert min limb width >= a fraction of mark height (derived floor 4%). |
| 35 | Screen colours do not match the material | `APP:170`, `PKG:141` | human | Vinyl, paint, acrylic, backlit. Partial mech: assert Pantone values are present. |
| 36 | Embroidery does not survive washing | `APP:249,256` | human | Physical sample only. |
| 37 | Delivering only raster | `PKG:171` | mech | Assert at least one vector format per variant folder. |
| 38 | Delivering only the primary variant | `PKG:173` | mech | Assert the full `VARIANT_MATRIX` cross-product is present. |
| 39 | Source files without a license document | `PKG:175` | mech | Assert `08-documentation/license.pdf` exists. |
| 40 | Variant naming drift across the package | `PKG:177` | mech | Regex every filename against `NAMING.pattern`. |
| 41 | Skipping the favicon | `PKG:179` | mech | Assert `06-favicon/` exists with ico, apple-touch-icon, and 16/32/48 PNGs. |
| 42 | Embedding licensed font glyphs in the SVG | `PKG:181` | mech | Assert no `<text>` and no `@font-face` in delivered SVGs; all type outlined. |

Tally: 30 mechanical or partly mechanical, 5 vision, 7 human. The mechanical majority is the finding that matters. Roughly three quarters of Rampstack's quality bar is enforceable in code against an SVG plus a spec object, before any model is asked to judge anything.

---

## 9. What Rampstack does not give you

Honest gaps a generator has to fill itself, since none of this is in the 1988 lines:

- **No generation method.** The corpus is entirely evaluative: taxonomies, fit and fail conditions, tests. It never says how to produce a symbol, only how to judge one. Every "escape" is "specific execution" or "specific construction" (`SYM:53,103,153,200,253`), which is a demand, not a procedure.
- **No SVG or path-level guidance.** Construction grids are described in prose and only ever quantified in the worked example (`VAR:24-31`). The 4-unit grid there is the only concrete construction spec in the whole corpus.
- **No colour selection method.** Palettes appear as category defaults and as blocklists. Nothing on deriving a palette from a brief. `brand-identity/SKILL.md:74-95` covers this and is the better source.
- **No kerning or optical-adjustment algorithm.** "Kerning is not optional" (`ARCH:11`) and two example nudges in units (`VAR:20`). No rule for producing them.
- **Contradiction to resolve.** `ARCH:17` says the wordmark upper edge is 9-12 letters; `ARCH:25` says a 10+ letter name fails. Treat 9-12 as "needs justification", 13+ as a hard fail.
- **The `variantsForReview` band and the review-dilution rule are in tension at the top end.** 12 variants (`SKILL:150`) against 3 architectures x 3 type options = 9 (`SKILL:173`). Prefer 9 and treat 12 as the ceiling for a brief with an unusually wide architectural range.
