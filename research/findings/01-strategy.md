# Benchmark recon: the strategy layer

Scope: the brand/strategy skills in three local clones, read in full. Primary target `rampstackco_claude-skills`, secondary `arnabbagxd_Brand-building-skills` and `cofoundy_brand-skills`. Everything below is extracted from files on disk; paths are relative to `/Users/jakeshelley/dev/jiffi-design-branding-skill/research/benchmarks/`.

Headline finding: RampStack is the only one of the three with a real strategy layer. It is a genuine skill *system* (103 skills, enforced authoring contract, CI lint, cross-skill composition graph) and its brand cluster has two pieces of IP that nobody else in the benchmark set has: the **archetype library** (12 aesthetic families x 18 verticals with named brand mappings) and the **divergence check** (a mechanical anti-sameness gate that blocks a brief before it ships). Cofoundy and Arnab are near-identical forks of a common ancestor; their bodies diff by 4 lines on 10 of 12 shared skills. Cofoundy adds two things worth stealing: a **brand package persistence layer** (`brand.yaml` + a discovery contract every skill honours) and an **adapted naming skill** with real availability tooling and a prior-art gate.


**Transcription note:** everything in fenced blocks is quoted from the source files. RampStack bans em dashes by house rule so those quotes are byte-exact. Cofoundy and Arnab use em dashes heavily; I normalised them to hyphens when quoting, so treat those blocks as near-verbatim rather than byte-exact. Nothing else was altered.

---

## 1. Repo map and the pipeline shape

### RampStack brand cluster (`rampstackco_claude-skills/skills/`)

| Skill | Category | display_order | Lines | References |
|---|---|---|---|---|
| `brand-discovery` | strategy-and-discovery | 1 | 203 | discovery-report-template, interview-guide |
| `creative-brief` | strategy-and-discovery | 2 | 158 | creative-brief-template, example-brief, voice-and-tone-guide |
| `creative-direction` | strategy-and-discovery | 3 | 153 | axes-explained, brief-template, example-aesthetic-brief |
| `brand-ideation` | brand | 1 | 181 | ideation-output-template, naming-evaluation-rubric |
| `brand-identity` | brand | 2 | 203 | identity-system-spec, contrast-and-accessibility |
| `brand-style-guide` | brand | 3 | 202 | style-guide-template, maintenance-playbook |
| `brand-voice` | brand | 4 | 180 | voice-document-template, voice-frameworks |
| `brand-archetype-system` | brand | 5 | 143 | 2 overview + 12 core archetypes + 18 verticals (2281 lines total) |
| `logo-design` | brand | 5 | 206 | 7 refs incl. category-conventions (489 lines) |
| `creative-brief-selector` | brand | 6 | 118 | 6 refs + 12-file reference-bank (1317 lines total) |
| `art-direction` | design | - | 199 | creative-brief-template, illustration-brief, photo-shoot-brief |
| `competitor-experience-audit` | research | - | 191 | experience-dimensions-checklist, audit-template |
| `vertical-site-conventions` | design | - | 213 | - |
| `landing-page-copy` | content | - | 266 | - |
| `jtbd-framing` | product | - | 266 | - |

Notably absent from RampStack: no dedicated positioning skill, no messaging-hierarchy skill, no naming skill (naming lives inside `brand-ideation` Stage 2), no brand-architecture skill, no audience/persona skill (audience lives inside `brand-discovery`).

### The declared composition graph

RampStack states hand-offs explicitly in every skill's "When NOT to use". The strategy spine is:

```
brand-discovery  ->  brand-ideation  ->  brand-identity  ->  brand-style-guide
      |                    |                   ^
      |                    v                   |
      +-> creative-brief -> creative-direction -+
                                 |
        brand-archetype-system --+--> creative-brief-selector --> build skills
                                 |
                            brand-voice (parallel, feeds style-guide s6)
```

Verbatim from `brand-archetype-system/SKILL.md`:

```
This skill works upstream of `brand-identity` (provides starting defaults that brand-identity
refines into a finished system) and parallel to `creative-direction` (archetypes can be located
by position on the 4 creative-direction axes).

Typical flow when this skill is invoked:
1. User provides a brief or references a target archetype
2. Agent picks the most relevant core archetype, or composes from 2 adjacent archetypes
3. Agent adapts the archetype's defaults to the brief (color tokens shift, type swaps to
   vertical-appropriate fonts, voice samples rewrite for the brand)
4. Agent flags adaptation choices made
```

The split between `creative-brief` (operational: scope, deliverables, budget, sign-off) and `creative-direction` (aesthetic: four axes) is a deliberate and good separation. From `creative-direction/SKILL.md`:

```
The aesthetic depth layer, distinct from `creative-brief` (operational kickoff: scope, audience,
deliverables, constraints).
```

### Secondary repos

`cofoundy_brand-skills`: 15 skills, brand-genesis only, no go-to-market. `arnabbagxd_Brand-building-skills`: 29 skills, same brand core plus ads/ASO/WhatsApp/influencer.

Provenance check (I diffed them):

```
brand-voice: diff lines=4          brand-positioning: diff lines=4
brand-messaging: diff lines=4      target-audience: diff lines=4
brand-identity: diff lines=4       brand-story: diff lines=4
competitor-branding: diff lines=4  brand-architecture: diff lines=4
brand-guidelines: diff lines=4     rebranding: diff lines=4
brand-audit: diff lines=22         brand-context: diff lines=20
```

The 4-line diff is the "Before You Start" paragraph (Cofoundy points at `brand.yaml`, Arnab points at `.agents/brand-context.md`). Treat these two as one benchmark with two front-ends. `cofoundy_brand-skills/NOTICE` credits `skills/naming/` as adapted from `glacierphonk/naming`.

---

## 2. RampStack skill-by-skill: questions asked, output schema, frameworks

### 2.1 `brand-discovery` (`skills/brand-discovery/SKILL.md`)

**Framework:** 4 dimensions - Audience, Competitors, Category and problem space, Positioning territory.

Audience layers: Demographic / Psychographic / Behavioral / Jobs-to-be-done, with an explicit warning against demographic bloat ("only if relevant; do not over-collect demographics").

The three-layer competitor model is the strongest single idea in this skill:

```
**Three layers of competitor:**

- **Direct:** Solves the same problem the same way (e.g., another SaaS in the category)
- **Indirect:** Solves the same problem a different way (e.g., a spreadsheet replacing a SaaS tool)
- **Status quo:** Doing nothing, doing it manually, or living with the problem

The third is most often forgotten and most often the actual competitor.
```

Per-competitor documentation schema:

```
- Who they target (audience overlap with you)
- How they position (what they claim to be)
- What they actually deliver (often different from positioning)
- Pricing model and structure
- Strengths and weaknesses from the audience's perspective
- Recent moves (launches, pivots, hires, departures)
```

Category mapping asks six questions - the problem, the category, **the conventions**, the shifts, the moats, **the vocabulary**. The two bolded ones are where the distinctiveness leverage sits:

```
- **The conventions.** What does every brand in the category do the same way?
  (These are the conventions you can break.)
- **The vocabulary.** What language does the category use? What is jargon, what is
  meaningful, what is empty?
...
**Sources:** ... Customer language vs. category language (the gap is informative)
```

Positioning territory generation (five sources, 3 to 5 territories, explicitly *not yet* the positioning):

```
**Generate territories from:**

- Underserved audience segments (audiences others ignore)
- Underserved jobs (jobs the category does not do well)
- Category convention violations (what would happen if you broke the rules everyone follows)
- Honest brand truths (what is genuinely true about this brand that competitors cannot also claim)
- Category shifts (where the puck is going)

**Per territory, document:**

- The statement (one sentence)
- Why it could work (proof point)
- Who would resonate (the audience for this territory)
- Who is competing in this territory (often, no one good)
- Risk (what makes it fragile)
```

**Failure patterns worth lifting verbatim:**

```
- **Skipping discovery to "save time."** Every shortcut here costs 10x downstream when the
  brand fails to land.
- **Audience research that confirms what you already believe.** If your audience research
  validates every assumption, you did not actually research. Look for surprises.
- **Demographic-heavy audience profiles.** "Women aged 25 to 45" is not insight. Behavior,
  beliefs, and jobs-to-be-done are.
- **Listing every competitor as if equal.** Most competitors do not matter. Pick the 3 that
  are genuinely dangerous.
- **Forgetting status-quo as competition.** The biggest competitor is usually "doing nothing"
  or "doing it manually."
- **Outputting territories without rejection criteria.** A territory without a "what this
  rejects" is not a territory.
- **Treating discovery as a one-time event.** Categories shift. Audiences evolve. Re-run
  discovery at least every 3 years.
```

**The evidence guardrail** appears on several RampStack skills as a boilerplate block. It is the closest thing in the benchmark set to provenance discipline:

```
## If required data is unavailable

This skill's output depends on data, measurements, or tool results it cannot generate on its
own. When a required input, tool, or data source is unavailable or unverifiable, the sanctioned
output is the deliverable with the gap stated: what was needed, what was actually obtained or
verified, and which parts of the output are affected. Fabricating, estimating, or interpolating
a required number to complete the deliverable is never sanctioned. A stated gap is a complete
answer.
```

### 2.2 `brand-discovery/references/interview-guide.md` - the question battery

This is the single most directly reusable artefact in the RampStack strategy layer. Recruiting spec first:

```
- **Active customers** who have been using the product for 3+ months (deep understanding)
- **Recent customers** who joined in the last 30 days (still remember the buying journey)
- **Lapsed customers** who churned (the most informative; understand why people leave)
- **Prospects who didn't buy** (understand objections)
- **Power users** in adjacent categories (understand alternatives and substitutes)
```

The three-section interview structure, verbatim:

```
### Opening (3 to 5 minutes)

- "Tell me a bit about yourself and what you do."
- "Walk me through a typical day. What does work look like?"
- "How long have you been doing this kind of work?"

### Section 1: Their world (10 minutes)

- "When you think about [the problem area or category], what comes to mind?"
- "What's the part of your work or life this connects to?"
- "How important is [the problem area] in the bigger picture of what you do?"
- "Who else is involved in [the problem area]? Coworkers? Family? Clients?"
- "What's the goal you're trying to hit in this area?"

Listen for: priorities, stakeholders, vocabulary, time pressure.

### Section 2: The problem (10 to 15 minutes)

- "Tell me about the last time you ran into [the problem]. Walk me through what happened."
- "What was frustrating about that?"
- "What did you try to do about it?"
- "What did you wish had happened instead?"
- "What's the cost of this problem? Time? Money? Stress? Relationships?"
- "Have you ever just decided to live with it instead of solving it? Why?"

Listen for: emotional weight, the real cost, the workarounds people invent, the resignation.

The key follow-up: **"Tell me more about that."** Use it relentlessly. Most insight is one or
two layers below the first answer.

### Section 3: How they solve it now (10 to 15 minutes)

- "What do you currently use to address [the problem]?"
- "How did you start using [their current solution]? What were you using before?"
- "What did you consider but not pick? Why not?"
- "What do you wish [your current solution] did better?"
- "If you could wave a magic wand and have [the problem] solved perfectly, what would that
  look like?"
- "Imagine a tool came along that promised to solve [the problem]. What would it have to be
  true for you to switch?"

Listen for: the switching cost, the unmet needs, the specific moments where current solutions fail.

### Closing (3 to 5 minutes)

- "Is there anything I should have asked but didn't?"
- "Is there anyone else you think I should talk to about this?"
- "Would you be open to a follow-up if questions come up later?"
```

The four bad-question patterns, each with the fix, are excellent and short enough to inline into a skill:

```
### Leading questions
**Bad:** "Do you find it frustrating when [your assumption]?"
**Better:** "Tell me about your last experience with [the activity]."

### Asking for solutions
**Bad:** "What features would you want in [the product]?"
**Better:** "What's frustrating about how this works today?"

Users are not product designers. They are the world's leading experts on their own
frustrations. Mine the frustrations; you'll design the solutions.

### Validating instead of investigating
**Bad:** "Would you use [feature description]?"
**Better:** "When was the last time you needed something like that? What did you do?"

Hypothetical answers are useless. Past behavior is informative.

### Closed questions
**Bad:** "Was that frustrating?"
**Better:** "How did you feel about that?"

### Talking too much
If you're talking more than 20 percent of the time, you're talking too much.
```

Synthesis discipline with a hard signal threshold:

```
A theme that appears in 3+ interviews is signal. A theme in 1 interview is interesting but
anecdotal.
...
5 interviews is the minimum to find patterns. 8 is comfortable. 12+ has diminishing returns
for most projects.
```

### 2.3 `brand-discovery/references/discovery-report-template.md` - output schema

Sections: Project metadata / Executive summary (3-5 sentences) / Audience (primary + secondary + verbatim quotes) / Category and competition / Positioning territory / **Brand truths** / Strategic implications / Open questions / Methodology and sources / Sign-off.

Two sections here are better than anything in the other repos.

**Brand truths** (this is the honesty gate):

```
### What is true
- [Fact about the company, founders, product, or community that is real and ownable]

### What is aspirational (and that is OK)
- [Thing we want to be that we are not yet, but are credibly working toward]

### What is not true (and stop saying)
- [Claim the company makes that did not survive scrutiny]
```

**Strategic implications**, written as directives to downstream skills rather than as findings:

```
### For brand identity
- [Implication, e.g., "The visual direction should signal quietness, not loudness; the
  audience is exhausted by category noise."]

### For brand voice
- [Implication, e.g., "Voice should be confident without being clever; the audience equates
  cleverness with sales pressure."]
```

Also note the "category as the audience sees it" prompt, which is the cheapest way to catch a mis-framed category:

```
### The category as the audience sees it

What the audience calls this category. What they group us with. (Often different from how the
company sees it.)
```

And the methodology block, which is the only provenance surface in the whole RampStack brand cluster:

```
- **Stakeholder interviews:** [Number, role mix, format]
- **Customer interviews:** [Number, segment mix, format]
- **Customer surveys:** [Sample size, response rate]
- **Competitive scan:** [Number of brands, depth of review]
- **Search and social listening:** [Sources, time window]
- **Internal docs reviewed:** [Strategy decks, prior research]
- **Caveats:** [What this discovery did not cover, sample limitations]
```

### 2.4 `brand-ideation` (`skills/brand-ideation/SKILL.md`)

**Framework:** 4 stages, each diverge-then-converge. Positioning territories -> Naming directions -> Mood and visual direction -> Narrative and origin.

**Stage 1: six positioning angles, each with its named risk.** This is the closest thing in the set to a positioning framework, and the risk column is what makes it usable:

```
- **Functional benefit.** "The fastest way to X." (Risk: easy to copy.)
- **Emotional benefit.** "The brand that makes you feel Y." (Risk: vague if not earned.)
- **Identity.** "For people who are Z." (Risk: alienates non-Z customers.)
- **Antagonist.** "The opposite of [incumbent]." (Risk: defines you by them.)
- **Originator.** "The first or only one to do W." (Risk: must be defensible.)
- **Worldview.** "We believe V." (Risk: must be lived, not just stated.)

For each territory, write:
- **Statement** (one sentence)
- **Why this is true** (the proof point)
- **What this rejects** (the territory we are NOT going to)
- **Risk** (what makes this fragile)
```

**Stage 2: naming taxonomy (8 approaches) plus a 6-criteria filter.**

```
| Approach | Description | Examples |
|---|---|---|
| Descriptive | Says what it is | "General Electric," "American Airlines" |
| Evocative | Suggests a feeling or quality | "Patagonia," "Oasis," "Stripe" |
| Founder | Person's name | "Disney," "Ford," "Tesla" |
| Acronym | Letters from longer phrase | "IBM," "BMW," "AWS" |
| Coined | Made-up word | "Kodak," "Häagen-Dazs," "Asana" |
| Metaphor | Borrowed concept | "Apple," "Amazon," "Twitch" |
| Compound | Two words combined | "Facebook," "PayPal," "Spotify" |
| Suggestive | Hints at function without describing | "Tide," "Slack," "Sprint" |

Generate 8 to 15 candidates per direction. Apply naming filters before short-listing:

- **Pronounceable** in target languages
- **Spellable** without confusion
- **Available** as a domain (.com or relevant TLD), social handles, and trademark
- **Distinctive** in the category (search the name + category, see what comes up)
- **Stretchable** (does the name still work if the company expands?)
- **Free of negative associations** (run it past native speakers of any major target market)

A short-listable name passes all six. Most names fail at least one. The bar is necessarily high.
```

Volume targets are specified and worth copying: **30 to 50 candidates across at least 4 approaches, filtered to 8 to 12**, plus a separate `naming-explorations.md` "kill file".

**Stage 3: mood direction schema.** The strongest anti-mush device in the skill:

```
For each mood direction (typically 2 to 4):

- **Mood adjectives** (3 to 5 words)
- **Color territory** (warm/cool, saturated/muted, light/dark - not specific hex yet)
- **Type territory** (serif/sans, modern/classical, geometric/humanist)
- **Imagery direction** (photography style, illustration style, iconography)
- **Reference brands or sites** (3 to 5 that exemplify the direction)
- **What this rejects** (the visual territory we are NOT going to)

A mood direction is "Editorial sophistication: Warm cream paper backgrounds, classical serifs,
archival photography. Think: The New York Times Magazine meets a literary journal."

A bad mood direction is "Modern and clean."
```

**Stage 4: six narrative shapes** - Founder / Mission / Discovery / Heritage / Frustration / Vision, each documented with one-sentence summary, **the opening line**, proof points, and **the hero** (who the audience identifies with).

Failure patterns worth lifting:

```
- **Naming before positioning.** Names without positioning end up arbitrary. Position first.
- **Falling in love with one name too early.** Run the full filter on every candidate. The
  clever name that fails the trademark check is not a candidate.
- **"Modern, clean, minimal" mood direction.** Means nothing. Always require specific
  reference brands.
- **Skipping pronunciation tests.** A name that confuses non-English speakers loses search
  volume forever.
- **Mistaking ideation for execution.** The output of this stage is direction, not finished
  assets. Resist the urge to design logos here.
```

### 2.5 `brand-ideation/references/naming-evaluation-rubric.md`

Each of the six criteria carries a **testable procedure**, which is the part most naming advice skips:

```
## 1. Pronounceable
**Test:** Read the name aloud to 5 people who have not seen it written. If 3 of 5 pronounce
it differently, fail.

## 2. Spellable
**Test:** Read the name aloud to 5 people. Ask them to spell it. If 2 of 5 misspell it, fail.

## 3. Available
Check, in this order:
1. **Trademark search** in the relevant jurisdictions. Class matters.
2. **Domain availability.** The .com (or category-relevant TLD) for the exact name.
3. **Social handles.**
4. **Existing brands in the category.** Even if trademark is technically clear, a confusable
   competitor name is a problem.
5. **Negative associations.** Search the name in quotes. See what shows up.

## 4. Distinctive
**Test:** Search the name + category. If your name is buried under unrelated content or
competitor confusion, fail.

Fail: ... A name with words common in the category (e.g., "Pay" in fintech, "Code" in dev
tools, "AI" in AI products) that gets lost in search

## 5. Stretchable
**Test:** Imagine the company in 5 years, expanded into adjacent categories. Does the name
still fit? If not, plan for it.

## 6. Free of negative associations
Check: Translations. Slang. Acronyms. Visual confusions (famous example: "kidsexchange"
spelled as one word). Existing pop culture.
```

Scoring and the walk-away rule:

```
For each candidate name, score 1 to 5 on each of the six criteria, where 5 is "passes cleanly"
and 1 is "definite fail."

A name is short-listable if it scores 4 or 5 on every criterion. A 3 anywhere is a yellow flag
(proceed with eyes open). A 2 or 1 anywhere is disqualifying.

## When to walk away
If the top 3 candidates all fail at least 2 criteria, the naming exploration was not deep
enough. Generate another 30 to 50 candidates before settling. The cost of a bad name is paid
every day for the life of the brand.
```

Pragmatic notes worth keeping: generic names cannot be trademarked; made-up names are easier to clear but need more marketing spend to load with meaning; founder names complicate equity and exits.

### 2.6 `brand-ideation/references/ideation-output-template.md`

Three-round naming structure (divergent table -> filtered shortlist with "why it survived" and "open concerns" -> top 3 with a full one-page case). The finalist case fields:

```
- **Pronunciation:** [How it is said]
- **Type:** [Coined, metaphor, etc.]
- **Meaning:** [What it evokes, intentionally or by association]
- **Why it works:** [Per the 6 criteria]
- **Risks:** [Domain availability, trademark, cultural concerns, audience misreading]
- **Domain status:** [.com / alternative TLDs / acquisition cost estimate]
- **Trademark status:** [Cleared by counsel / preliminary search clean / requires deeper search]
- **Visual potential:** [How it could render as a wordmark, monogram, icon]
```

Territory fields include a genuinely good forcing device:

```
- **Headline examples:** [3-5 sample headlines that could only come from this territory]
- **What it rules out:** [Names, treatments, or messages this territory disqualifies]
```

Narrative angle fields force the abstract into copy immediately:

```
- **First page hero:** [What the homepage hero would say under this angle]
- **About page opening:** [The first paragraph of the about page]
```

And the convergence device at the end, which stops ideation from being a shrug:

```
> **Provisional combination:** Name [X], territory [Y], mood [Z], narrative [W].
> **Why this combination:** [Two sentences.]
> **What we test next:** [Concept board, name validation with audience, treatment exploration]
```

### 2.7 `brand-voice` (`skills/brand-voice/SKILL.md`)

**Framework:** 4 stacked layers, each constraining the one below. Attributes -> Tone shifts -> Vocabulary and grammar -> Examples.

Layer 1 is the "X, not Y" device with an explicit rationale:

```
Pick 3 to 5 attributes. Pair each with what it is NOT (the failure mode if overdone).

Common attribute pairings (NOT a menu - generate your own):
- Confident, not arrogant      - Direct, not blunt
- Warm, not saccharine         - Witty, not sarcastic
- Smart, not academic          - Honest, not harsh
- Playful, not silly           - Practical, not boring
- Bold, not loud               - Curious, not unfocused

The "not" half is what saves writers from overshooting. "Confident" alone produces swagger.
"Confident, not arrogant" tells writers where the line is.
```

Layer 2 is a 14-row context table. This is the most complete tone-shift list in the benchmark set:

```
| Context | Tone shift |
| Onboarding | Warmer, more enthusiastic, slightly slower pace |
| Hero / marketing | Confident, signature voice fully on |
| Product copy / UX | Direct, helpful, brief |
| Error messages | Calm, matter-of-fact, no apology theater |
| Success states | Brief celebration, redirect to next action |
| Empty states | Helpful, slightly playful, suggest action |
| 404 / not found | Self-aware, light, points the way home |
| Account deletion / cancellation | Quiet, respectful, no jokes |
| Pricing | Direct, transparent, confidence-inspiring |
| Legal / TOS | Plain language version sits next to the legal version |
| Support / help center | Patient, thorough, no condescension |
| Crisis communication | Calm, factual, accountable |
| Product announcements | Excited but not breathless |
| Email subject lines | Specific, never click-bait |
```

Layer 3 grammar dials: contractions, sentence length default, punctuation ("the em dash is famously polarizing"), pronouns, capitalisation style, number formatting, Oxford comma, active vs passive.

Layer 4 sets a **quantified floor**, which is unusual and good:

```
The floor is 15 paired examples. One pair per type in the template clears it. Past 25 the
library gets harder to scan than to use, so treat 25 as the practical ceiling, not a hard cap.
This is the most-used part of the voice doc in practice.
```

And a stress test with a pass/fail rule that blames the doc, not the copy:

```
7. **Stress-test.** Pick a fresh writing brief and apply the voice doc. Score the result ...
1 to 5 against each attribute, and anything scoring below 3 on any attribute is off-voice.
Below 3 means the doc is incomplete, not that the copy needs another pass.
```

The competitor test in `references/voice-frameworks.md` is the sharpest distinctiveness check in the whole benchmark set:

```
Take a recent piece of copy. Score it 1 to 5 against each attribute. If it scores below 3 on
any, the copy is off-voice. If it scores 5 across the board, the attributes might be too
generous.

Apply the test to a competitor's copy. If their copy scores high on your attributes, the
attributes are not distinctive enough.
```

Failure patterns:

```
- **Generic attributes ("friendly, professional, approachable").** Every brand says this.
- **Documenting aspirational voice.** If the brand does not actually sound this way today and
  has no plan to shift, the doc is fiction.
- **Examples that are obviously bad and obviously good.** Real voice work shows nuanced
  shifts, not cartoonish before/after.
- **Voice without distribution.** A perfect doc that no one references is worth nothing.
```

### 2.8 `brand-voice/references/voice-frameworks.md` - three frameworks and how to layer them

1. **"We are X, not Y"** - the pragmatic default.
2. **Nielsen Norman 4 dimensions** - funny/serious, formal/casual, respectful/irreverent, matter-of-fact/enthusiastic. Plotted numerically, e.g. `30 funny / 70 casual / 40 respectful / 50 enthusiastic`. Rationale: *"It forces choices. Adjective lists let you claim 'warm AND professional AND witty AND smart.' The dimensions force you to commit to a position, which is what voice actually is."*
3. **Jung/Mark-Pearson 12 archetypes** - Innocent, Sage, Explorer, Outlaw, Magician, Hero, Lover, Jester, Everyman, Caregiver, Ruler, Creator, each with a voice signature and illustrative categories. Weaknesses are stated honestly ("Some archetypes are dated or culturally specific"; "'Pick one' is harder than it sounds").

The combining recipe is the useful part:

```
1. **Archetype** for the high-level character
2. **NN/g dimensions** for the calibration
3. **"We are X, not Y" attributes** for the daily writing guardrails

Example for a fictional brand:
- **Archetype:** Sage (primary) + Everyman (secondary)
- **Dimensions:** 30 funny / 60 casual / 50 respectful / 40 enthusiastic
- **Attributes:**
  - Knowledgeable, not academic
  - Plain-spoken, not basic
  - Honest, not harsh
  - Patient, not condescending

Each layer adds resolution. The archetype gives character. The dimensions give calibration.
The attributes give writers the daily tool.
```

Plus a decision rule for which to start with:

```
If the brand voice is undefined and you need to start from zero, begin with archetypes
(high-level character), move to dimensions (calibration), then derive attributes (daily
guardrails).
If voice work has been done but is too vague, the dimensions framework is the best clarifier.
If voice has been documented but writers do not know how to apply it, the attributes framework
is the missing piece.
```

### 2.9 `brand-voice/references/voice-document-template.md` - the paired-examples list

The canonical 16 content types for the paired library (the SKILL.md deliberately does not duplicate the list, to avoid drift):

```
Headlines / Subheadlines / Hero CTA / Feature description / Testimonial intro /
Email subject line / Email opening / Push notification / Error message / Success message /
Empty state / About page paragraph / Social post / Sales page paragraph / 404 page /
Cancellation flow copy
```

Three of them ship with the off-voice half pre-filled, which is a nice touch:

```
### Error message
**Off-voice:** "An error has occurred. Please try again later."
### Empty state
**Off-voice:** "No items found."
### 404 page
**Off-voice:** "404. Page not found."
```

Grammar decision table (11 rows): contractions, default sentence length, em dashes, Oxford comma, pronouns, headline capitalisation, numbers under 10, active vs passive, hashtags, exclamation points, emoji.

Also has a "Redefined words" table (standard term / we say / why) and a references section framed as *"We are not copying these voices. We are calibrating against them."*

Maintenance trigger list:

```
Voice should be reviewed:
- Annually as a minimum
- After any major audience shift
- After any major positioning change
- When it consistently fails the "stress test"
```

### 2.10 `brand-identity` (`skills/brand-identity/SKILL.md`)

**Framework:** 5 elements - Logo system, Colour system, Typography, Imagery and illustration, Motion.

Logo system is defined as a *system*, not a mark, with a named common failure:

```
- **Primary mark.** ... - **Wordmark.** ... - **Symbol or glyph.** ...
- **Lockup variations.** ... - **Monogram.** ...

- **Legible at 16 pixels.** Test the logo at favicon size. If it falls apart, redesign.
- **Reproducible in single-color.**
- **Distinctive silhouette.** Squint at it. ... If it looks like every other logo in the
  category at silhouette, redesign.
- **Construction grid.** Every curve and angle is intentional.

**Common failure:** Designing only the primary mark and discovering at launch that the
wordmark, glyph, and small-size variants do not exist.
```

Colour per-token documentation requirements (this is the most rigorous colour spec in the set):

```
**Per color, document:**
- Hex, RGB, HSL, CMYK (if print is in scope), and Pantone (if brand-critical print exists)
- WCAG AA contrast against the other colors in the system
- Allowed and disallowed pairings (some brand colors look terrible together)
- Usage notes (when to use, when not to use)

- **Define neutrals carefully.** Neutrals are 80 percent of the surface area in most brand
  applications. They carry more weight than the brand color.
- **Limit the palette.** A 30-color palette is unmanageable. 5 to 8 carefully chosen colors
  beats a sprawling system.
```

Typography flags the two commercial traps agencies actually hit:

```
- **Web licensing.** Confirm web licensing covers expected pageviews. Some popular typefaces
  have prohibitive web licenses.
- **Open-source alternatives.** Document open-source equivalents for situations where
  licensing is impractical (third-party tools, embedded contexts).
```

The best failure pattern in the skill:

```
- **Designing only primary states.** What does the brand look like in error? In dark mode? In
  a localization where the wordmark needs to flip direction? These are not edge cases; they
  are the brand.
```

Output is a file tree, not a document: `identity/logo/`, `identity/colors.md`, `identity/typography.md`, `identity/imagery.md`, `identity/iconography/`, `identity/motion.md`, `identity/applications/` (3 to 5 stress-test mockups).

`references/identity-system-spec.md` carries a full token schema: `color-brand-primary`, a `color-neutral-0..1000` ramp, and semantic tokens (`color-text-primary/secondary/disabled/inverse`, `color-bg-primary/elevated`, `color-border-default`, `color-success/warning/error/info`), plus a 10-step type scale (`text-display-1` through `text-overline`) with size/line-height/weight/use-case columns. The rule *"Never invent a new color. If a use case is not covered, propose a new token"* is worth keeping.

`references/contrast-and-accessibility.md` covers: the standards, the math, common brand colour failures, the "darker variant" strategy, colour blindness, typography contrast, dark mode, icons and graphical elements, and a practical checklist.

### 2.11 `brand-style-guide` (`skills/brand-style-guide/SKILL.md`)

**Framework:** 8 sections - Story, Logo system, Colour, Typography, Imagery and illustration, Voice and tone, Applications, Dos and don'ts. Claim: *"Most guides skip 2 or 3 of them and create downstream confusion."*

Section 1 (Story) is the only place in RampStack where mission/vision/values are named, and it ends with the rejection clause:

```
- Origin / founding story
- Mission and vision
- Values (3 to 5, with what each means in practice)
- Positioning statement
- Audience (with the level of specificity from the brief)
- What we are not (the things we explicitly reject)
```

The dos-and-don'ts section is elevated deliberately:

```
The dos and don'ts section is what people actually reference in practice. Make it the easiest
section to scan.
...
- **Treating "dos and don'ts" as filler.** This section is what people use most. Invest in it.
```

Source-of-truth posture on output format:

```
For consumer-facing presentation, build a web page version that imports from these source
files. The source files are canonical. The presentation is a view of them.
```

Failure patterns:

```
- **Skipping the "what we are not" sections.** Without rejection rules, anything becomes
  acceptable.
- **Document with no examples.** Rules without visual examples are abstract and ignored.
- **Document with only examples.** Examples without rules cannot be applied to new situations.
- **Static PDF that no one opens.**
- **Aspirational rules.** Rules the brand does not actually follow get treated as suggestions.
  Document what is actually true, not what is wished.
```

`references/maintenance-playbook.md` is a governance model most brand skills lack. Four change tiers with escalating authority:

```
Tier 1: clarifications (owner approves directly)
Tier 2: extensions (owner consults, then approves)
Tier 3: changes (council reviews, owner ships)
Tier 4: shifts (executive approval required)
```

Plus audit cadence (monthly surface scan / quarterly sample audit / annual full audit), a change-request template, versioning with a backward-compatibility window, adoption health metrics, and a "when to retire and rewrite" trigger.

### 2.12 `creative-direction` - the four axes (the best abstraction in the repo)

`skills/creative-direction/SKILL.md` plus `references/axes-explained.md`. Four spectra, each with 3-4 named positions, each position carrying **what it signals / reference examples / when to pick / common failure**.

```
1. Tone Register:        Professional | Conversational | Playful | Provocative
2. Aesthetic Philosophy: Editorial Restrained | Polished Standard | Controlled Maximalist
                         | Expressive Maximalist
3. Audience Relationship: Authority | Peer | Companion | Coach
4. Sensory Ambition:     Functional | Considered | Resonant
```

The choosing heuristics are one line each and genuinely useful:

```
Tone: What does the audience already get too much of, and what too little? If the category is
dry, conversational or playful is differentiation. If the category is loud, professional
restraint is differentiation.

Aesthetic: What is the project saying about the brand's relationship to attention? Restrained
earns attention by deserving it. Maximalist captures attention by not letting it leave.

Audience: What does the audience need most? Audiences who feel lost want authority or coach.
Audiences who feel patronized want peer or companion. The wrong choice patronizes or abandons
the reader.

Sensory: What does the audience deserve from this experience? Functional respects time.
Resonant respects feeling.
```

Sample position entries, to show the depth (from `axes-explained.md`):

```
### Conversational
**What this signals:** Approachability without sacrificing competence.
**Reference examples:** Linear's product copy. Vercel's marketing voice. Notion's onboarding.
**When to pick this:** Default for most modern B2B and prosumer brands.
**Common failure:** Sliding into casual. Conversational is still considered. "Hey friend!" is
not conversational, it is performed informality.

### Editorial Restrained
**What this signals:** Confidence and patience. The brand is willing to under-fill space
because it trusts the reader to fill it with attention.
**Reference examples:** Aesop's website. Apple's product pages in their classic era.
Jacquemus. Phaidon's editorial work.
**Common failure:** Restraint that reads as absence. Restraint earns its place when every
remaining element is exquisite. Strip too much and the page reads as unfinished.

### Polished Standard
**Common failure:** Producing work indistinguishable from competitors. Polished Standard is
safe. Safe is forgettable.

### Resonant
**Common failure:** This is the hardest position. Resonance that is forced reads as
manipulation. Resonance that is mistargeted reads as melodrama. Resonance that is vague reads
as pretentious. Most attempts fail.
```

**Combination flagging** is a device I have not seen elsewhere and should be stolen outright:

```
**Common combinations:**
- Conversational / Polished Standard / Peer / Considered = the modern B2B SaaS default
- Professional / Editorial Restrained / Authority / Considered = premium consultancy default
- Conversational / Polished Standard / Companion / Considered = wellness or healthcare default

**Rare but powerful:**
- Provocative / Editorial Restrained / Coach / Resonant = the "Patagonia at full conviction"
- Conversational / Controlled Maximalist / Peer / Resonant = the "top creative agency" register
- Provocative / Controlled Maximalist / Coach / Resonant = "high-stakes brand revival"

**Difficult combinations to flag:**
- Functional + Provocative = rare. Provocation usually requires emotional engagement that pure
  functional work resists.
- Authority + Functional = possible but flat. Often slides into "we are right and you should
  know that."

When the user picks a difficult combination, surface the difficulty. Ask them to confirm or
reconsider. Sometimes the difficulty is the point.
```

**The rejection list** is the brief's most useful section, per the skill itself:

```
## Rejection list
This brief explicitly says no to:
- [Specific decision the brief rejects, e.g. "No testimonial walls."]
- [Another specific decision, e.g. "No stock photography of people."]
- [Another, e.g. "No exclamation marks in body copy."]

The rejection list is often the most useful section. The choices a brief excludes are as
important as the choices it commits to.
```

The worked example (`references/example-aesthetic-brief.md`, "Observatory") is the best filled example in the benchmark set. Its rejection list is what a real brief looks like:

```
- No "trusted by" logo wall, especially above the fold
- No gradient hero. Solid color or a single restrained photograph instead
- No three-column feature grid with checkmark icons
- No product dashboard mockup as the hero image
- No animated chart components scattered through the page
- No exit-intent modal, newsletter popup, or any popup of any kind
- No testimonials with headshots arranged in a grid
- No marketing-speak: "enterprise-grade," "blazing fast," "world-class," "industry-leading"
- No "AI-powered" framing. The product uses ML; that is not the lead
- No corporate stock photography of people in offices
- No vague "join the future" CTAs. Specific verbs only
```

And its synthesis paragraph, written in present tense as the skill demands:

```
This brief produces a marketing site that reads like a thoughtful engineering blog post the
team happened to design well. Body copy is in first-person plural, contractions are fine, and
technical terms appear without quotation marks (the audience uses them naturally, the site
should too). ... The product makes its case through clear documentation links, an honest
comparison page, and a "how this differs from what you are already using" section that is
willing to say what the tool is not for.
```

Failure patterns, including the honest disclaimer:

```
- **Using this to develop taste.** This skill codifies intent. It does not produce judgment. A
  user with no taste who runs this still produces incoherent work; the brief just makes the
  incoherence consistent.
- **Skipping inspiration references.** A user picking "Editorial Restrained" without examples
  often means something different than what an art director means by it.
- **Brief drift mid-project.** The most common failure. The brief gets written, then ignored.
- **Producing a brief no one references.** The test of a good brief is whether the output
  would be different if a different brief were used.
```

### 2.13 `creative-brief` - the ten-question intake

`skills/creative-brief/SKILL.md`. Ten required inputs, ten output sections, hard 1500-word cap.

```
1. What is the project?
2. Why does it exist? What problem does it solve?
3. Who is the audience?
4. What do you want them to do, feel, or know?
5. What is the personality? How does it sound?
6. What is the visual direction? How does it look?
7. What is in scope? What is out?
8. What are the constraints (time, budget, technical, brand)?
9. What does success look like?
10. Who approves?

If you have fewer than five of these, run a quick intake first.
```

The elicitation prompts are the reusable bit:

```
**For audience**
- Who is the single most likely person to land on this site? Walk me through their day.
- If you could pick one type of customer to fill your inbox, who?
- Who do you NOT want to attract?

**For objectives**
- Pretend it is six months after launch. What number tells you it worked?
- What is the one action you most want a visitor to take?

**For voice**
- Pick three brands or people whose tone you would want to borrow.
- If your site were a person at a dinner party, what would they sound like?

**For visuals**
- Show me three sites you love. What do you love about them?
- Show me one site you hate. Why?

**For scope**
- If you only got one page, which one?
- What would you cut if the budget were halved?

Do not ask all of these. Pick the ones that fill the actual gaps.
```

Push-back rules (the skill refuses to write until these are fixed):

```
- **"We want to be the [giant brand] of [our niche]."** Ask what specifically about that brand
  they want to borrow. Probably one or two things, not the whole thing.
- **Audience as "men and women 18-65."** This is not an audience.
- **"Increase awareness" with no metric.** Awareness of what, by whom, measured how?
- **"Modern, clean, minimalist."** These words are meaningless. Ask for three specific URLs.
- **Twenty pages of context, no clear ask.** Ask: "If a designer reads only one paragraph,
  what should it be?" Then make that the snapshot.
```

Template sections worth noting: objectives as a table (Objective / Measurable signal / Timeframe), an **anti-personas** field, a "reference sites we want to feel *different* from" table, and an approval block with `If no sign-off by deadline: [Default action: ship anyway, escalate, pause]`.

### 2.14 `brand-archetype-system` - the archetype library

`skills/brand-archetype-system/` - 2281 lines across 32 reference files. Two layers: **12 core aesthetic archetypes** x **18 vertical applications**.

```
| 01 | Editorial Restrained | Low-saturation, type-led, generous whitespace, considered |
| 02 | Technical Precise    | Monospace and grid prominent, data-dense, system-feeling |
| 03 | Warm Conversational  | Human imagery, mid-saturation, friendly type, approachable |
| 04 | Bold Confident       | High-contrast, large display type, saturated, direct |
| 05 | Playful Energetic    | Bright colors, illustration-led, dynamic, character-driven |
| 06 | Luxe Considered      | Serif-led, generous spacing, restrained palette, premium |
| 07 | Clinical Trustworthy | Cool palette, sans-serif, clean medical or financial register |
| 08 | Rugged Utilitarian   | Earth tones, workwear influence, no-nonsense type |
| 09 | Retro Nostalgic      | Period-specific palette and type, intentional vintage reference |
| 10 | Minimal Essentialist | Black, white, single accent, sans-serif only, sparse |
| 11 | Vibrant Saturated    | High-saturation across full palette, color as character |
| 12 | Documentary Honest   | Photography-led, real people, low-touched imagery |
```

Verticals: B2B SaaS (dev tools, business productivity, marketing/sales, data/analytics), Fintech (consumer, enterprise), DTC (fashion, beauty, home/lifestyle, food/beverage), consumer health, hospitality/travel, media/publishing, edtech, gaming, marketplace, crypto/web3, real estate.

**Each core archetype file contains** (~110-135 lines): aesthetic summary, position on the 4 creative-direction axes, a 9-token colour palette starter with hex + role + **rationale**, a Google-Fonts type pairing with a modular size scale, layout/composition, imagery direction, 5-10 voice samples with a cadence note, component patterns (hero/buttons/cards/tables), when to pick, when to avoid, adaptation guidance, exemplar brands.

Sample rationale from `references/core-archetypes/01-editorial-restrained.md`:

```
| ink        | #0F1B2D | Primary text, body, anchors |
| paper      | #FAF9F6 | Warm off-white background |
| accent     | #5B8B85 | Single accent for links and key actions |
| highlight  | #C9A227 | Numeric callouts, display sizes only |
| highlight-body | #8E6E1A | Same hue at body-text contrast (WCAG AA) |

Rationale:
- Ink at #0F1B2D not pure black. Pure black on warm paper feels harsh; navy ink reads as
  ink-on-paper.
- Paper at #FAF9F6 not pure white. Warm tint signals editorial register versus UI register.
- Accent restricted to one hue. Two-color systems read as institutional; multi-color reads as
  consumer.
- Highlight restricted to display sizes; the body-contrast variant (#8E6E1A) covers WCAG AA at
  smaller scales without losing the warm-gold character.
```

Voice samples plus an explicit cadence rule (this pattern is very strong and easy to copy):

```
- "Built around the question, not against the event stream."
- "Focused, not just smaller."
- "Sample funnel, real benchmarks, your cohort."

Cadence: complete sentences. Comma-separated qualifiers more often than dashed asides. Direct
claims with built-in qualification. No exclamation marks. Numerals over written numbers.
```

**Vertical files** map named brands to archetypes and, critically, carry vertical anti-patterns. From `references/by-vertical/01-b2b-saas-developer-tools.md`:

```
| Stripe    | Technical Precise with Editorial undertones | navy and violet accents |
| Linear    | Editorial Restrained | Single-accent restraint; brutal type hierarchy |
| Vercel    | Editorial Restrained leaning Technical Precise | Black and white; Geist |
| Sentry    | Technical Precise | Dark mode dominant; purple accent; data-dense |
| Resend    | Editorial Restrained | New entrant; serif display; warm paper background |
| Cloudflare| Bold Confident | Orange brand color; energetic; consumer-tilted |
| Supabase  | Bold Confident leaning Technical Precise | Green primary; recently more restrained |

## Vertical anti-patterns
- **Playful Energetic in developer tools**: reads as unserious.
- **Luxe Considered in developer tools**: reads as out-of-touch.
- **Vibrant Saturated in developer tools**: rare and risky.

## Common archetype evolution
Developer brands frequently start Technical Precise and add Editorial Restrained as they
mature. ... The early-stage developer brand archetype shift is almost always: drop the
consumer-tinted color, add a serif, lean into restraint.
```

From `05-fintech-consumer.md`, the vertical tension framing:

```
- **Trust versus energy is the central design tension**: every consumer fintech brand sits
  somewhere on this spectrum. Picking the archetype is picking the position.
- **Regulatory and compliance copy** affects voice. The brand's voice must accommodate
  disclosures, terms, and risk language without breaking the archetype.
- **Money is emotional**: the archetype carries emotional positioning about money (excitement,
  security, freedom, control).
```

**The adaptation discipline** (`references/01-how-to-apply-an-archetype.md`) is what stops the library becoming a template dispenser. Five steps, and step 3 is the key insight:

```
### Step 3: Adapt the color palette
The starter palette is a relationship between values, not absolute hex codes. Preserve the
relationship; shift the values.

- Default: ink #0F1B2D (navy), accent #5B8B85 (muted teal)
- Adaptation for a finance brief: ink #1A1F2E (deeper navy), accent #4A5D6E (slate blue),
  reads more institutional
- Adaptation for a consumer wellness brief: ink #2A2520 (warm dark brown), accent #7A9B7C
  (sage green), reads more grounded and warm

Preserve: low saturation, single accent, paper-not-white background, ink-not-black text.
Shift: specific hues to match emotional direction.
```

Brief-to-dimension mapping heuristics (step 2), including a differentiation rule:

```
- **Audience character**: Younger audience usually wants warmer accent; older wants cooler.
  Technical audience tolerates more density; consumer audience needs more whitespace.
- **Category context**: Crowded categories need stronger contrast; quiet categories can be
  more restrained.
- **Emotional direction**: Trust-needing brands lean cooler; warmth-needing brands lean warmer.
- **Competitive position**: If the closest competitor is in the same archetype, shift one
  adjustable dimension hard to differentiate.
```

Coherence check and abandon rule:

```
## The cross-archetype check
- Color: matches the archetype's saturation and contrast character?
- Type: matches the archetype's display and body relationship?
- Voice: matches the archetype's cadence and register?
- Layout: matches the archetype's density and whitespace tendency?

If two of the four diverge from the archetype, either pick a different archetype or accept
that the brand is a blend (and document which archetype contributes which dimension).

## When to abandon an archetype mid-flow
- Three or more dimensions resist adaptation to the brief
- The audience signals reject the archetype's defaults (for example picking Editorial
  Restrained for a children's app)
- Direct competitors all live in the same archetype and your brief needs differentiation
```

Failure modes named in `00-archetype-system-overview.md`: verbatim copying, archetype mismatch with audience, cross-archetype token mixing, stale exemplars.

**Trademark posture** (worth copying wholesale for any skill that names real brands):

```
Archetypes are NAMED for aesthetic families, NOT for brands. "Editorial Restrained" not
"Stripe-like." Brands are referenced as exemplars in description text using attribution
language: "exemplified by [brands]", "common among [brands]", "characteristic of [brands]".

This is descriptive and nominative fair use territory, durable across brand redesigns. A brand
that pivots its identity does not invalidate the archetype it once exemplified.
```

### 2.15 `creative-brief-selector` - the divergence check (the standout IP)

`skills/creative-brief-selector/`. Purpose stated bluntly in `references/00-overview.md`:

```
Portfolios of brand work drift toward house style. The first demo establishes a default; the
second demo borrows it; the third has the same skeleton with a different name. Without a
deliberate intervention at brief time, every new build leans on the same palette, the same
micro-label tracking, the same hero gradient, the same voice register. The output is competent
and sibling.
```

**The 7-field signature schema** (`references/03-divergence-check.md`) - each shipped build gets one record:

```yaml
- slug: <kebab-case slug, e.g. pinto-mesa-boots>
  archetype: <canonical archetype name, e.g. luxe-considered>
  dominant_hue_family: <named hue family, e.g. leather-bone-saddle>
  voice_register: <named register, e.g. story-forward-third-person>
  primary_structural_pattern: <named pattern, e.g. shoppable-grid-product-forward>
  hero_shape: <named shape, e.g. dual-column-image-and-text>
  footer_shape: <named shape, e.g. single-line-strip>
```

Naming conventions per field are specified so the schema stays mechanical:

```
dominant_hue_family: two to four colour terms separated by hyphens, lowercase. The terms
should be specific enough that two demos with materially different palettes get different
families even if they share an undertone.
Examples: leather-bone-saddle, dawn-navy-coral, dark-linen-amber, warm-walnut-brass,
forest-green-cream, slate-and-amber, stone-and-amber

voice_register examples: story-forward-third-person, atmospheric-second-person,
fitment-first-technical, evidence-and-mission-first, restrained-citation-bearing,
warm-everyday-craft

primary_structural_pattern examples: shoppable-grid-product-forward,
arc-timeline-hero-with-packages-strip, fitment-selector-then-rails,
editorial-hero-then-courses-grid, theory-of-change-hero-then-evidence-band
```

**The 7 overlap rules**, applied in order, first match wins:

```
Rule 1: same archetype + same dominant_hue_family                    => SIBLING (block)
Rule 2: same archetype + same voice_register + same structural pattern => SIBLING (block)
Rule 3: same dominant_hue_family across different archetypes          => WARN
Rule 4: candidate hero_shape matches 2+ shipped demos                 => WARN
Rule 5: hero_shape matches 3+ demos AND any share an archetype family => BLOCK
Rule 6: candidate footer_shape matches 3+ shipped demos               => WARN
Rule 7: nothing else fires                                            => PASSED
```

With the reasoning for each threshold, e.g.:

```
Rule 2 ... This catches the case where the palettes diverge but the underlying skeleton is
identical. The build will look different on first glance and identical on the second.

Rule 4 ... Two demos sharing a hero shape is acceptable for a portfolio of nine to twelve
demos; three or more is the point where the shape starts reading as the engine's house default.

Rule 6 ... Footers tolerate more repetition than heroes since they carry less visual weight
and are more functional than expressive.
```

The mechanical comparison procedure is spelled out as pseudocode, which keeps the agent from vibing it:

```
for candidate in candidates:
  for shipped in shipped_demos:
    if rule_1(...): record_block(fields=['archetype','dominant_hue_family']); continue
    if rule_2(...): record_block(fields=['archetype','voice_register','primary_structural_pattern']); continue
    if rule_3(...): record_warn(fields=['dominant_hue_family']); continue

for candidate in candidates:
  hero_matches = [s for s in shipped_demos if s.hero_shape == candidate.hero_shape]
  if len(hero_matches) >= 3 and any(shares_archetype_family(candidate, s) for s in hero_matches):
    record_block(...)   # rule 5
  elif len(hero_matches) >= 2:
    record_warn(...)    # rule 4
  footer_matches = [s for s in shipped_demos if s.footer_shape == candidate.footer_shape]
  if len(footer_matches) >= 3: record_warn(...)  # rule 6
```

**Run it twice** - input-side (before picking references) and output-side (after rendering the brief). The reason:

```
Input-side alone catches the obvious overlaps ... Output-side catches the subtle drift: an
archetype was picked clean of any sibling demo, but during adaptation the palette quietly
converged on the recurring house family.

The recurring stone-and-amber family is the worked example of this drift. The first build
picked it intentionally; the second build adopted it because it was in the air; the third
build adopted it because it felt like the brand. Without an output-side check, the brief itself
becomes the carrier of the drift.
```

**How to unblock**, spelled out so a block is actionable rather than an argument:

```
- **Shift the dominant_hue_family.** Swap the dominant accent colour, change the page
  background's temperature, or change the accent colour family (saddle to oxblood to navy).
- **Shift the primary_structural_pattern.** A "product-forward" pattern becomes "story-forward"
  by reordering the spine moves.
- **Shift the voice_register.** Change from third-person to second-person, or atmospheric to
  technical.
- **Compose a different archetype pair.**
```

Divergence-check failure modes:

```
- **Filling fields with vibe words.** "vibrant-modern" is not a hue family;
  "saddle-bone-walnut" is.
- **Re-using the same family across builds without recomputing.** A stale signature is worse
  than a missing signature.
- **Treating warns as ignorable.** Three consecutive warns on the same hue family is the
  portfolio adopting a house signature.
- **Hand-waving the rules.** If a candidate blocks under rule 1, it blocks; the answer is to
  adapt, not to argue with the rule.
```

**The section-shapes vocabulary** (`references/05-section-shapes-vocabulary.md`) is a named, open enum with archetype affinities and real reference URLs. Hero shapes:

```
dual-column-image-and-text        (the engine's house default; most prone to overuse)
wide-photograph-with-band-below   (bringatrailer.com, icon4x4.com)
full-bleed-image-with-overlay     (charitywater.org; strongest signal, easiest to over-saturate)
type-led-prose                    (nytimes.com, stripe.com)
centered-single-column            (linear.app, framer.com)
asymmetric-large-image-small-text (magnumphotos.com, aesop.com)
grid-of-elements                  (airbnb.com, unsplash.com)
data-table-or-spec-led            (pricing-table-as-hero variants)
```

Footer shapes: `single-line-strip`, `multi-column-sitemap`, `type-only-no-links`, `editorial-colophon-with-masthead`, `newsletter-band-with-credits`, `dark-cta-then-credits`. Each has "when it fits", references and archetype affinities, plus a documented extension procedure.

Why shapes are checked at all:

```
Heroes carry the most visual weight on a page and the most signal to the visitor. Hero-shape
repetition across a portfolio compresses the perceived distance between builds even when
palette, voice, and structural pattern diverge. The early showcase portfolio surfaced this
drift signal: most builds shipped a `dual-column-image-and-text` or
`full-bleed-image-with-overlay` hero regardless of brief specification, because the engine
pattern-matched the most recently built shape.
```

**The brief template** (`references/02-brief-template.md`) is the most concrete brief format in the whole set. Sections: title as "<Brand> as <archetype position>", "Use this brief for" / "Do NOT use this brief for", **N spine moves**, register (positive and negative reference frames), live reference sites with one-line whys plus negative references, **section shapes with rejected shapes and one-line reasons**, palette token table with an explicit do-not-reuse line, type system with an explicit differentiator from a named shipped demo, **CTA grammar**, an **image-ready spine** (page / aspect / count / source), voice samples, an honesty contract, an acceptance checklist, and the divergence-check result.

Its "common section failures" are a good editorial standard for any template we build:

```
- **Spine moves that are abstract.** "Lead with the product" is not a spine move. "Lead with
  the signature product shown large at 5:6 with one primary CTA and price-forward entry" is.
- **Palette without explicit do-not-reuse lines.** The do-not-reuse line is what makes the
  divergence check checkable.
- **CTA grammar in mood words.** "Welcoming" is not CTA grammar. "Shop the collection" is.
- **Image-ready spine without aspect ratios.** Without the aspect ratios the imagery pass
  cannot generate to the right shape.
- **Acceptance checklist as motivational language.** The checklist is the build's pass/fail
  criteria, not a vibe statement.
```

**The reference bank** (`references/reference-bank/`, 11 combination files plus a README) is institutional memory: one file per archetype-and-vertical combination, 3-6 live URLs each with a one-line why, plus **negative references** ("sites in the same vertical but in the WRONG register"). Curation rules from its README:

```
Each positive reference should be a real live site that:
- Exemplifies the chosen position observably (palette, layout, voice, imagery, or all four).
- Is operating at a quality level the build can credibly aspire to.
- Has been live recently (within the past year if possible).

The one-line why for each reference is what makes the reference usable ... A URL without a why
is decoration.

## When to retire a reference
- The URL stops showing what it was cited for (brand redesign, site shutdown, paywall).
- A more canonical example for the same position emerges.
```

Worth noting as a cautionary example of doc drift: `creative-brief-selector/SKILL.md` still says the bank "ships with three seed combinations" while `reference-bank/README.md` lists eleven. The lint suite checks that reference files are linked, not that their prose stays in sync with the SKILL.md that describes them.

Sample bank entry (`luxe-considered-curated-stays-directory.md`) shows the borrow/do-not-borrow discipline:

```
The references are cited NOMINATIVELY as register exemplars only. A build in this position
inherits the register (curated collections, image-forward discovery, the property-as-monograph,
restrained booking affordances) and pulls NO palette, type, trade dress, photography style, or
grid treatment from any specific real platform.

- [plumguide.com] - Inherit the curated-collection posture and the property-as-monograph
  anatomy; do NOT pull the palette, type, or the specific listing-grid treatment.
```

It also carries an honesty resolution for demo work that is directly reusable:

```
- **Reviews-and-ratings honesty resolution.** A demo-only Verified Host badge with its meaning
  stated plainly, plus an explicit "Demo: no reviews shown" placeholder slot and an
  aggregate-rating placeholder. The full trust UX is visible without fabricating a single
  review, rating, or superhost-style metric.
```

### 2.16 `logo-design/references/category-conventions.md` - the category-convention survey

489 lines, ten categories at parity: legal, CPG, B2B SaaS, hospitality, healthcare, financial services, editorial/publishing, tech/AI, outdoor/lifestyle/apparel, fashion/luxury. Each with the same six headings:

```
### Defaults that work
### Conventions worth honoring
### Conventions worth breaking for positioning
### Common cliches to avoid
### Application contexts unique to the category
### Reference brands
```

The framing sentence is the thesis of the whole file:

```
Every category has a default visual register the audience expects. Working inside the default
signals competence; the brand reads as belonging. Working outside the default signals
positioning; the brand reads as making a deliberate move. Both are legitimate. The trap is
doing either by accident.
```

Sample (legal firms):

```
### Conventions worth breaking for positioning
- Geometric sans for the wordmark signals "modern, accessible" (boutique firms, tech-adjacent
  practices, plaintiff-side firms)
- Lighter color palette signals approachability
- Asymmetric lockup signals contemporary execution

### Common cliches to avoid
- The Roman-pillar-as-justice. Pillars are exhausted.
- The scales-of-justice icon. Done thousands of times; signals nothing.
- The gavel. Cliche.

### Application contexts unique to the category
- Court filings (single-color black on white at small scale)
- Embossed letterhead and business cards (the foil-stamp test is real)
- Lobby and conference room signage (engraved brass, etched glass)
```

The `logo-design` SKILL.md itself carries five distinctiveness tests worth stealing wholesale:

```
- **Silhouette test.** Squint at the logo. If you cannot identify it from silhouette alone
  (with type stripped), the silhouette is too generic.
- **Distinctiveness test.** Search Google Images for "[your category] logo". If your candidate
  looks identical to three or more existing logos, it's not distinctive enough.
- **Sketchability test.** A 7-year-old draws the logo from memory after 30 seconds of looking.
- **Single-color test.** Strip all color. Does it still read?
- **Reproducibility test.** Print at 1 inch on a black-and-white printer.
- **The two-second test.** Show the logo to someone unfamiliar with the brand for two seconds.
  Ask what they remember. The features they recall are the ones doing real work.
```

And the application-context gate: `If a variant fails three or more contexts, it's not a primary mark`. Contexts: 16px favicon, 28px app icon, 1.5in embroidery patch, single-colour, reverse, large-format signage, motion lockup, square social avatar, apparel embroidery, foil stamp.

### 2.17 `competitor-experience-audit` - the honesty guardrail

`skills/competitor-experience-audit/SKILL.md`. Seven observable dimensions, each scored `Pattern present` / `Mixed` / `Gap` / `not_assessable`:

```
1. Primary-task prominence
2. Layout register and density
3. Merchandising and category surface
4. Primary navigation and search paths
5. Brand register and conviction
6. Trust and conversion signals
7. Recurring vertical conventions (the synthesis)
```

The guardrail block is load-bearing and is exactly the rigour that the two secondary repos lack:

```
## The honesty guardrail (load-bearing)

- Report what the leading sites observably do and where they observably fall short, as
  cross-site patterns. Do not render personal aesthetic judgments ("this is ugly", "good
  design", "the typography is clean").
- When the evidence does not support a judgment, say so plainly and mark the dimension
  `not_assessable` for that site or that pattern.
- Do not name a convention from one site. A pattern is a recurrence across the field (3 of N
  or more); one site doing something distinctive is a single-site observation, not a convention.
- The output is a grounded experience bar ... It is not an opinion piece.
```

Plus a static-vs-rendered evidence rule:

```
Some dimensions can be partially assessed from static HTML (primary navigation, the
catalog/category surface count, the presence of search). Most cannot. Layout density, brand
register, motion, trust-signal prominence, and the rendered hierarchy of the first viewport all
need the rendered page to judge honestly. If you only have static HTML for a site, mark every
rendered-only dimension `not_assessable` for that site rather than guessing.
```

And the instruction to name the gap, not just the convention:

```
- **Skipping the gap.** An audit that names only what the leaders do well is half the value.
  The recurring weakness across the field is where a positioning opportunity lives; name it.
- **Generalizing too soon.** A 2-site sample is not the field. If you can only render 2 of 5
  leaders, mark the audit `partial`.
```

### 2.18 `landing-page-copy` - the messaging spine

7 sections in order: Hero (headline = the promise, subheadline = the mechanism, one CTA) / Social proof early / Problem-promise / Solution-mechanism / Proof and detail / Objection handling / Final CTA.

```
**Strong hero patterns:**
- **Outcome + audience + mechanism.** "Ship features 3x faster, for engineering teams who hate
  meetings, with our async-first project tool."
- **Pain reversal.** "Stop losing customers to slow page loads."
- **Surprising claim.** "The note-taking app that gets used. We have data."
- **Direct address.** "You have 47 unread Slack messages. Here's what to do about it."

**Weak hero patterns:**
- Generic adjective stacking ("Powerful, intuitive, scalable")
- "Welcome to our platform"
- Brand-name-only headlines ("Acme: The Future of X")
- Vague benefits ("Streamline your workflow")
```

Six objection types (price, time, trust, risk, comparison, implementation) with four handling formats (FAQ, comparison table, risk reversal, proof of effort needed). CTA grammar rules: action+outcome, first-person ("Show me how" outperforms "Show you how"), specific, low-friction. And the resonance test: *"Read the problem section aloud. Does the target audience nod? If they don't, you don't understand them yet."*

---

## 3. Secondary repos: Cofoundy and Arnab

### 3.1 The one genuinely new idea: a brand persistence layer

`cofoundy_brand-skills/references/brand-package-spec.md` plus `skills/brand-init/`. A brand is a folder on disk with a queryable manifest, not chat output.

```
<brand>/                 # ./brand/ (in-situ) - brands/<slug>/ (portfolio) - <product>/brand/
  brand.yaml             # manifest: the queryable HEAD (name, one-liner, status, paths)
  context.md             # brand DNA - identity, audience, positioning, values, voice
  naming.md   strategy.md   architecture.md   identity.md   voice.md
  messaging.md   positioning.md   story.md   guidelines.md   audit.md
  assets/
```

The manifest carries an `artifacts` flag map so any skill can see what already exists:

```yaml
schema_version: 1
slug: cofoundy
name: Cofoundy
one_liner: One sentence on what it is.
tagline: ""
archetype: ""                  # primary brand archetype (optional until strategy runs)
status: draft                  # draft | active | archived
stage: ""                      # pre-launch | early | growth | established
industry: ""
languages: [en]
created: 2026-06-16
artifacts:
  context: false      naming: false      strategy: false     architecture: false
  identity: false     voice: false       messaging: false    positioning: false
  story: false        guidelines: false  audit: false
```

**The discovery contract** every skill repeats verbatim at the top of its body:

```
**Load the brand package first.** Look for `brand.yaml` (in `./`, `./brand/`, or
`brands/<slug>/`); read it and `context.md` from the same folder before asking anything. Use
that context - don't re-ask for what's already captured. No package yet? Run `brand-init`
first. Legacy fallback: `.agents/brand-context.md`.
```

Rules worth adopting:

```
- **The registry is a SSOT file, never agent memory.** Brand locations + one-liners are data ->
  they belong in `registry.yaml` (git-tracked, shareable), not an LLM's per-machine memory.
  A file is more "brain" than memory: durable, queryable, diffable.
- **Don't pre-create empty section files.** Only `brand.yaml` + `assets/` at init; each skill
  creates its own `*.md` when it runs.
- **Never overwrite an existing package.** The script refuses; respect that.
- Scripts never read the system clock - pass `--date` (keeps runs deterministic/reproducible).
```

`skills/brand-init/scripts/brand.sh` is pure bash, no YAML library: `init` / `list` / `set`. Arnab's equivalent is thinner: a single `.agents/brand-context.md` markdown file with a fixed 6-section template (`arnabbagxd_Brand-building-skills/skills/brand-context/SKILL.md`).

### 3.2 `cofoundy_brand-skills/skills/naming/` - the deepest naming treatment in the set

15 reference files, ~3000 lines, adapted from `glacierphonk/naming` (credited in NOTICE). Seven steps, with **steps 3-6 explicitly internal**:

```
**Steps 3-6 are internal working steps.** Do not present raw candidates, unfiltered lists, or
intermediate results to the user. Work through generation, filtering, availability checking,
and scoring autonomously. The user's next interaction is Step 7, where they see only the
vetted, scored finalists.
```

The **naming brief** questions include two that RampStack's naming stage misses entirely:

```
3. **What should the name feel like?** - TWO axes, capture both: (a) tone and (b)
   **language/locale of the name itself** (English? neutral/Latin? Spanish? coined? must it NOT
   read as bilingual/foreign?). Skipping (b) causes drift into a language the user didn't want.
4. **Competitive calibre - what brands must this stand BESIDE?** Name the aspiration tier
   (e.g. "competes with Notion/Obsidian" vs "a small internal utility"). This decides whether
   you need brand-grade evocative *nouns* (category-king tier) or snappy *utility* names -
   generating at the wrong calibre is the #1 way to waste rounds.
8. **Resolve conflicting criteria NOW, before generating.** If two requirements tension (e.g.
   "verbable/catchy" vs "stands beside Obsidian"), surface the tension and get the user to pick
   the priority. Don't let it oscillate across the whole session.
```

**The prior-art gate** is the sharpest screening discipline anywhere in the benchmark set, and it is the thing every other repo gets wrong:

```
**1. Prior-art / competitor conflict search FIRST (this is the most-skipped, most-fatal step):**

**A free npm/GitHub handle does NOT mean the name is clear** - a registry handle being
available says nothing about a prominent product already using that word. You must look at
*what exists*, not just *whether the slug is taken*.

Run ALL THREE, for every semifinalist:
- **GitHub by name, by stars:** api.github.com/search/repositories?q=[name]+in:name&sort=stars
- **Web search:** "[name]" [product category], "[name]" software, "[name]" company, "[name]" AI
- **Trademark:** quick USPTO/EUIPO pass for anything headed to market.

**Kill / demote rules:**
- **Same category (direct competitor) -> DEAD.**
- **Same namespace + same audience -> DEAD for OSS/dev tooling**, even if it's not a direct
  competitor. ... the same audience installs both from the same ecosystem, so search/discovery
  is permanently poisoned.
- **Large brand in an unrelated industry -> usable but penalized.** You'll fight for search
  forever.

> **Anti-pattern:** checking npm/gh-user/dns for a free handle and calling the name "available"
> WITHOUT the three prior-art searches above.
```

Plus a real platform check matrix (npm / PyPI / GitHub org / crates.io / RubyGems / WP plugin slug / Telegram / app stores / social handles) with the exact shell one-liner per platform, a bundled `scripts/check-availability.sh`, and a dictionary-word shortcut (skip exact TLD checks for common words, go straight to `get[name].com` / `use[name].com` variants).

**Weighted scoring rubric** (`evaluation.md`), out of 110:

```
CORE (high weight):
  Metaphor strength [1-5] x3   Memorability [1-5] x3
  Story [1-5] x2               Distinctiveness [1-5] x2
PRACTICAL:
  Phone test x2   Length x1   Sound alignment x1   Availability x1
CONTEXT:
  Brand fit x1    Global friendliness x1   Longevity x1
  Searchability x2   Competitive density x1

In practice, anything above 75 is strong. Above 85 is exceptional.
```

`Competitive density` is scored on a defined 1-5 scale ("5 = no other orgs in same/adjacent spaces ... 1 = crowded, word is established in the target industry by multiple entities"). Tiebreakers are ordered: metaphor > phone test > origin story > availability > personal preference. And there is a **24-hour test** with instructions (say it aloud through the day, tell someone and watch their face not their words, type it, imagine it on a homepage, sleep on it).

**Contextual sentence tests** - names live in sentences:

```
Introduction: "Have you tried ___?"  "We just launched ___."
Explanation:  "We built ___ to solve [problem]."  "___ is a [category] that [does what]."
Daily use:    "Check the ___ dashboard."  "The ___ API is down."
Marketing:    "___ - [tagline]"  "Why teams switch to ___."
Word of mouth:"You should try this thing called ___."
              This is the most important test. If the name feels awkward spoken aloud,
              word-of-mouth growth is crippled.
```

**AI slop table** (`anti-patterns.md`) - directly relevant to any LLM-driven naming skill:

```
| Suffix addiction | Glidely, Parsify, Chatible, Syncora, Buildly | same -ly/-ify/-able/-ora/-ix |
| Meaningless portmanteau | Brightrix, Nexagen, Vaultora, Intellicore | no story, no image |
| Thesaurus extraction | Apex, Pinnacle, Summit, Zenith, Catalyst | millions already used these |
| Category + modifier | CloudGuard, DataSync, SiteWatch, CodeForge | descriptive but forgettable |
| Vacant corporate language | [Anything] Solutions / Labs / Platform / HQ | empty calories |
| Excessive misspelling | random K-for-C swaps | signals "the real spelling was taken" |
| Fake Latin/Greek mashups | Cognivex, Synaptiq, Quantera, Luminex | means nothing |
| Aspirational adjectives | BrightPath, TrueNorth, ClearView, SwiftBase | generic positivity |

**How to spot slop:** If you can swap the name between three different products in different
categories and it still "works," it's slop.

### Filler-Word First Position
Smart, Auto, Cloud, AI, Data, Cyber, Next, Digital, True, Pure, Open, Fast, Easy, Pro, Ultra,
Hyper, Super, Meta, Omni, Core
### Generic Second Position
Hub, Lab(s), Base, Flow, Sync, Link, Stack, Forge, Shift, Scape, Verse, Craft, Wise, Path, Nest, Box
```

10-item red-flags checklist, two hits disqualifies before scoring even starts. Best items:

```
- [ ] Can you NOT tell a 15-second story about why it's called that?
- [ ] Would swapping it to a different product in a different category still "work"?
- [ ] Is the name's primary virtue that the domain was available?
```

`principles.md` adds two claims with numbers attached: real-word names recall at ~68.8% vs ~38.1% for invented; the "can you draw it?" metaphor test; the compound cover-one-half test. `phonosemantics.md` maps plosives (strength/authority), fricatives (speed/flow), nasals (warmth), liquids (fluidity/energy) and front vs back vowels (small/fast vs large/heavy) to product character, with an honest caveat that the patterns are English-specific.

Key rule at the end of the naming SKILL.md, worth stealing verbatim:

```
9. **Brand-grade != verbable.** Category-defining brands (Notion, Obsidian, Figma, Linear) are
evocative *nouns* with a concrete metaphor, NOT verbs. ... a brand-verb is *earned* through
usage, never designed in.
```

Also note the explicit context budget instruction, which is good progressive-disclosure practice:

```
> **Context budget:** This skill has 15+ reference files totaling 3,000+ lines.
> Do NOT load them all. Load each file only at the step that needs it.
> A simple naming session (Steps 1-3-7) should load 2-3 files, not all 15.
```

### 3.3 The shared brand core (both repos)

Structure is uniform: `description` -> "Before You Start" (load context) -> philosophy -> "Information to Gather" (4-6 questions) -> "Output:" with numbered `### 01 - SECTION` blocks -> red flags -> Related Skills. No "When NOT to use", no failure patterns beyond a short red-flag list, no reference files (except naming), no templates, no evidence guardrails.

**`brand-positioning`** (140 lines) - seven output sections. The best parts:

```
### 01 - CATEGORY DEFINITION
- **Stated category**: What the brand would say it's in
- **Actual category**: What customers compare it against when making a decision
- **Opportunity category**: Is there a more ownable or adjacent category that gives this brand
  more differentiation?

### 04 - POSITIONING STATEMENT
*"For [target audience], [Brand] is the [category] that [key differentiator/benefit] because
[reason to believe]."*
Then write 2 alternative versions: a more strategic version (internal use), a more
human/conversational version (public-facing).

### 06 - WHAT THIS BRAND REFUSES TO BE
- "[Brand] is not for people who want [X]"
- "[Brand] will never compete on [Y]"
- "[Brand] does not try to be [Z]"

## Positioning Red Flags
- Positioning that could apply to any competitor in the category
- A target audience too broad to own (e.g. "everyone who wants quality")
- A differentiator that's a table stake (e.g. "great customer service")
- Positioning the brand can't substantiate with proof points
```

**`brand-messaging`** (144 lines) - the only explicit **messaging hierarchy** in the benchmark set, and RampStack has no equivalent:

```
**Level 1 - Brand Headline** (for hero sections, first impressions)
**Level 2 - Supporting Statement** (the 1-2 sentence expansion)
**Level 3 - Key Messages** (3-4 proof pillars): each with a bold claim (5-8 words),
   2 sentences of supporting copy, and one proof point
**Level 4 - Proof Points** (a bank of 6-8 specific facts: stats, features, credentials,
   social proof)

### 01 - CORE MESSAGE
Format: *"[Brand] helps [audience] [achieve outcome] by [how]."*
This is not a tagline - it's the strategic anchor.

### 03 - TAGLINE OPTIONS
4-5 options, each with: the tagline (3-7 words), Style (functional / emotional / aspirational /
witty), Rationale (1 sentence). Flag the strongest.

### 06 - MESSAGING BY CHANNEL
| Channel | Headline approach | Tone | Length |
| Website hero | Social bio | Email subject lines | Sales deck | Paid ads |

### 07 - THINGS NOT TO SAY
Claims without proof / industry cliches / competitor-adjacent language that creates confusion /
anything that contradicts the positioning
```

**`target-audience`** (169 lines) - persona schema with a section RampStack lacks:

```
### 04 - AUDIENCE LANGUAGE
**Their problem:** [3-5 direct quotes or paraphrases from real customer language]
**Their desired outcome:** [3-5 phrases describing what success looks like to them]
**Why they've chosen competitors:** [What language do they use to justify current choices?]
**Brand-building implication:** [How should the brand use this language in its messaging?]

### 05 - WHO THIS BRAND IS NOT FOR
### 06 - AUDIENCE IMPLICATIONS
Messaging implications / Channel implications / Voice implications / Product implications
```

Persona fields: name+age+role+location, a first-person quote, "Their World", goals, frustrations, what they need from a brand like this, decision triggers, channels, and "How [Brand] solves their problem".

**`brand-voice`** (152 lines) - 8 sections, weaker than RampStack's but two useful extras: a **Voice Essence** one-liner (*"[Brand] sounds like [character] - [quality], [quality], and [quality]"*), and per-quality Do/Don't pairs. Its tone dimensions are Formality, Energy, Humor, Expertise, Warmth (five axes vs NN/g's four).

**`competitor-branding`** (143 lines) - the closest thing these repos have to a competitive audit. Per-competitor fields are decent (positioning, target, core message, tagline with a verdict, personality in 3 words, voice, visual identity, strengths, weaknesses, **brand territory they own**) and the synthesis sections are good:

```
### 04 - MESSAGING ANALYSIS
**What the category keeps saying** - 3-4 messaging patterns almost every competitor uses.
   These are table stakes that no longer differentiate.
**Cliches to avoid**
**What nobody is saying** - 2-3 messages or territories competitors are ignoring

### 05 - VISUAL IDENTITY PATTERNS
Color trends / Typography trends / Imagery patterns / Design differentiation opportunities

### 06 - DIFFERENTIATION OPPORTUNITIES
**Opportunity N**: [gap] - Why it's available - How to take it
```

But it has no evidence rule, no sample-size rule, no static-vs-rendered distinction, and no `not_assessable`. It will happily hallucinate a competitor's palette from memory.

**`brand-strategy`** (293 lines, Arnab and Cofoundy identical) - a 2-mode agency workflow: present an 18-question client questionnaire, or process a filled one into a 12-section report. The questionnaire's **personality sliders** are the reusable bit:

```
**04 / BRAND PERSONALITY SLIDERS**  Rate the brand 1-8 for each pair:
- Playful (1) -> Serious (8)      - Casual (1) -> Formal (8)
- Affordable (1) -> Premium (8)   - Classic (1) -> Innovative (8)
- Muted Tone (1) -> Bold (8)
```

Report sections: What is X / Vision (+4 one-word pillars) / Mission (+4 pillars) / Values / Goals / Target audience (+2-3 personas) / Personality / Voice / Competitor analysis / Positioning (narrative + statement + map) / How X stands out / Tagline suggestions. Its tone guidance is good:

```
Never: Use phrases like "In conclusion", "It's worth noting", "Overall" / Start sentences with
"The brand believes..." / Use hollow adjectives like "unique", "revolutionary", "world-class"
Always: Name the brand throughout / Write personas like real people / Make competitors feel
accurately described, not dismissively burned
```

But it also contains the single worst instruction in the benchmark set, which is a direct licence to fabricate:

```
- Where the client hasn't provided enough info, make intelligent strategic inferences based on
  their category, audience, and positioning - don't leave sections blank.
```

Compare with RampStack's "a stated gap is a complete answer". These are opposite postures, and RampStack's is the right one.

### 3.4 Evals

Arnab ships `skills/<name>/evals/evals.json` for four skills (brand-naming, brand-audit, brand-strategy, brand-positioning). Format: prompt, expected_output prose, and a list of boolean assertions.

```json
{
  "id": 2,
  "prompt": "positioning statement",
  "expected_output": "Should trigger on the keyword phrase. Should recognize there is no brand
    context and ask for the minimum information needed: category, audience, key differentiator,
    and competitors.",
  "assertions": [
    "Triggers on keyword phrase",
    "Asks for context before producing positioning",
    "Does not generate a generic positioning statement without information"
  ]
}
```

Cheap, and worth replicating: a two-eval-per-skill pattern where one eval is a rich scenario and the other is a bare keyword that tests both triggering and refusal-to-guess.

---

## 4. Where these skills are weak (what a real agency would do that they do not)

Ordered by how much it would improve our skill.

**1. No evidence provenance on any claim.** RampStack has the "if required data is unavailable" boilerplate and the competitor-audit honesty guardrail, but neither propagates into the brand deliverables. Nothing in `brand-discovery`'s report template asks for a source per finding, a date, or a confidence level. An agency deck footnotes every stat and dates every screenshot. Fix: a `[source | date | confidence]` triple on every research claim, and a rule that an unsourced claim ships as an explicit hypothesis. Cofoundy/Arnab are worse than weak here: `brand-strategy` instructs the model to invent inferences rather than leave a gap.

**2. Competitive audit is thin outside the one experience-audit skill.** `brand-discovery` says "3 to 8 competitors" and gives a 6-field table, then drops it. Missing: a share-of-voice or traffic proxy (it name-drops Similarweb and Ahrefs but never operationalises them), a message-mapping matrix showing what claim each competitor owns and where claims collide, a price/packaging comparison, an audit-trail of what was actually looked at (URLs + capture dates), and a "who is genuinely dangerous vs who is noise" scoring step. `competitor-experience-audit` has the rigour but is scoped to site UX, not brand.

**3. Distinctiveness testing exists only as anti-sameness against your own portfolio.** The divergence check is excellent but it compares a new brief to *your prior builds*, not to the *category*. An agency tests distinctive assets against competitors: colour ownership (is anyone else in the category already navy?), typographic register collision, symbol-family collision, name-in-search collision, and (in serious work) unbranded recall testing. `logo-design` gets closest with the "search '[category] logo', if you look like 3 or more, redesign" test. Fix: run the divergence schema against a *competitor* signature set as well as a portfolio one, and add a colour/type/shape ownership audit at brief time.

**4. No category-convention reference outside logo design.** `category-conventions.md` is superb but only covers marks, and only ten categories. There is no equivalent for messaging conventions, page conventions, packaging conventions, or naming conventions per category. `vertical-site-conventions` covers site shape only. Fix: extend the honour/break/cliche/context structure across colour, voice and messaging, not just logos.

**5. Naming is a subsection, not a discipline (in RampStack).** RampStack's rubric is good on criteria but has zero tooling: no availability script, no prior-art procedure, no trademark class guidance beyond "get a real attorney", no linguistic screening protocol, no scoring weights. Cofoundy has all of that. Neither has: a formal trademark clearance workflow (knockout search -> class selection -> comprehensive search -> counsel opinion), a linguistic-screening panel spec (how many native speakers, in which markets, asked what), or a name-testing protocol with real users. Fix: merge Cofoundy's prior-art gate and weighted rubric into RampStack's 6-criteria structure, and add a clearance-stage model that is honest about what an agent can and cannot do.

**6. Positioning never gets stress-tested or chosen with a decision rule.** Territories are generated with risks named, and then the recommendation is essentially a vibe. Missing: a scoring model across the territory set (distinctiveness / credibility / relevance / durability / defensibility), a "what would have to be true" pre-mortem, and a competitor-response test (if the incumbent copied this tomorrow, what happens?). Cofoundy's positioning skill has a 2x2 map but no scoring.

**7. No customer-language corpus discipline.** Both repos say "use the customer's language" and Cofoundy's `target-audience` has an "Audience Language" section, but nothing specifies where the corpus comes from, how many sources, how to tag it, or how to check that the final copy actually uses it. `brand-discovery`'s interview guide gets closest with its tagging steps. Fix: a language-mining step with named sources (reviews, tickets, sales calls, forums, search queries), a minimum corpus size, and a back-check that the messaging uses N verbatim phrases.

**8. Nothing measures whether the brand worked.** RampStack has `experimentation-analytics` and `analytics-strategy` elsewhere in the catalog but the brand cluster has no brand-measurement hand-off at all. No baseline capture before a rebrand, no distinctive-asset tracking, no message-recall test, no brand-health metric set. Arnab has a `brand-measurement` skill (198 lines, not read in detail) but it is disconnected from the strategy skills. Fix: a measurement hand-off at the end of style-guide work, with a baseline-before-you-change rule.

**9. Rebrand-specific risk work is missing.** No migration risk register, no equity audit (what existing assets have accrued recognition and must be carried forward), no stakeholder-communication plan, no legal/domain migration checklist, no phased rollout model. RampStack's `maintenance-playbook` covers post-launch governance but not the transition itself.

**10. Accessibility is colour-only.** `contrast-and-accessibility.md` is solid on WCAG contrast and colour blindness, but the brand cluster never touches typographic accessibility beyond line-height, motion sensitivity beyond a `prefers-reduced-motion` mention, or content accessibility (reading level, plain-language pairing for legal copy).

**11. No cost, timeline or effort model.** `brand-discovery` gestures at "1 week for a startup, 4 to 6 weeks for a major rebrand" and `creative-brief` has a budget field, but nothing tells the user what a phase actually costs in time or what can be cut. Agencies scope explicitly.

**12. Cofoundy/Arnab specifically:** no "When NOT to use" sections (so they over-trigger and overlap), no reference files outside naming, no templates, no failure patterns, no worked examples, no length discipline, and heavy structural repetition across 15-29 skills that all emit numbered report sections. They are prompt packs, not skill systems.

---

## 5. Plugin packaging and repo mechanics

### RampStack (`rampstackco_claude-skills/`)

`.claude-plugin/marketplace.json` declares one marketplace with four plugins, three of which point at *separate GitHub repos* (curated subsets) rather than folders:

```json
{
  "name": "rampstack",
  "owner": { "name": "RampStack" },
  "plugins": [
    { "name": "rampstack-skills", "source": "./", "category": "web-development",
      "keywords": ["agent-skills","seo","brand","web-development"] },
    { "name": "rampstack-starter",
      "source": { "source": "github", "repo": "rampstackco/claude-skills-starter" } },
    { "name": "rampstack-seo",
      "source": { "source": "github", "repo": "rampstackco/claude-skills-seo" } },
    { "name": "rampstack-pm",
      "source": { "source": "github", "repo": "rampstackco/claude-skills-pm" } }
  ]
}
```

`.claude-plugin/plugin.json` is minimal (name, description, version 1.2.0, author, homepage, repository, license, keywords). **There is no `skills` array**: skills are auto-discovered from `skills/*/SKILL.md`. No commands, no agents, no hooks, no MCP servers in this repo.

**Frontmatter contract** (five fields, from `SKILL_AUTHORING.md`):

```
name            must match the folder name
description     2 to 4 sentences, quoted; the trigger surface
category        one of: strategy-and-discovery, brand, design, content, seo-foundation,
                seo-audit-suite, product, development, qa, operations, growth, research,
                cross-cutting, process-and-team
catalog_summary one line, under 140 chars, no trailing punctuation (README table column 3)
display_order   integer, position within the category
```

**Eight canonical H2s, enforced by CI**: `## When to use`, `## When NOT to use`, `## Required inputs`, `## The framework`, `## Workflow`, `## Failure patterns`, `## Output format`, `## Reference files`. Colon suffixes allowed (`## The framework: 5 phases`); renaming the canonical word is not. One sanctioned extra pattern: `## Deep dive: [topic]`, for teaching skills, max two.

**Description formula:**

```
Sentence 1: What the skill does and the artifact it produces.
Sentence 2: Explicit "use this skill whenever the user..." with verbs and contexts.
Sentence 3 (optional): "Triggers on X, Y, Z". Be generous. Cover synonyms, common typos,
                       and casual phrasings.
Sentence 4 (optional): "Also triggers when the user [implicit case], even if they do not say
                       [explicit term]."

**Be pushy.** Claude tends to under-trigger skills.
```

**Length rules:** SKILL.md under 250 lines target, 500 hard cap. Reference files under 400 target, 500 cap. "A reader should be able to scan everything in 15 minutes." Bursting the limits is a signal to split the skill.

**Style rules:** punchy declaratives; **no em dashes**; direct address ("you" for the reader, "the user" for the user); no hype words; concrete example after every principle.

**Future-proofing rules** (a genuinely good idea):

```
**Do reference:** W3C/WHATWG specs, Schema.org, WCAG levels, MDN, Nielsen Norman Group,
stable concepts.
**Do NOT reference:** specific framework versions, named algorithm updates, tool versions or
pricing tiers, this year's trending technique, vendor marketing terms.
When you must name a tool, name 2 to 3 alternatives or write "your X tool of choice."
```

**Naming conventions for reference files:** `[noun]-template.md`, `[noun]-checklist.md`, `example-[scenario].md`, `[stack]-patterns.md`, `[topic]-guide.md`. Recommended trio per skill: a template, a checklist, an example.

**CI** (`.github/scripts/lint_skills.py`, ~460 lines, stdlib + PyYAML). Nine checks:

```
check_em_dashes                 check_brand_leaks
check_frontmatter_and_name_match  check_framework_section
check_reference_files_match      check_cross_skill_references
check_line_lengths               check_readme_catalog_count
check_readme_catalog_generated
```

`check_reference_files_match` enforces that every file in `references/` is linked from SKILL.md and vice versa. `check_cross_skill_references` validates that any `skill-name` mentioned actually exists. `check_brand_leaks` loads a watchlist from a private repo via `BRAND_WATCHLIST_FILE` and **fails closed** if the file is missing (except on fork PRs, where it skips loudly and the push-to-main run is the backstop). Other repo machinery: `SKILLS.lock` and `WORKFLOWS.lock` (SHA-256 per file per skill), `scripts/generate_readme_catalog.py --write|--check` (README catalog generated from frontmatter, CI fails if out of sync), `tools/scan_skills.py`, `tools/check_workflow_drift.py`, plus 4 GitHub workflows (lint, skills-lock, workflows-manifest, dist-drift).

Also a `workflows/` directory of 17 multi-skill runbooks (e.g. `content-pipeline-prove-gates.md`, `traffic-drop-triage.md`) with an `AGREEMENT-LOG.md` and `run-records/`. This is a second layer above skills: named end-to-end procedures that compose several skills, with recorded runs.

**Ten-item triggering checklist** before publishing a skill:

```
- [ ] Does the description name the artifact produced?
- [ ] Does the description list at least 5 trigger phrases?
- [ ] Does it cover at least one implicit trigger?
- [ ] Does the SKILL.md have a "When NOT to use" section that points at sibling skills?
- [ ] Is the framework section the durable IP, or is it filler?
- [ ] Does the workflow have numbered steps a reader can follow?
- [ ] Does the failure-patterns section call out specific bad inputs to push back on?
- [ ] Are reference files actually referenced from SKILL.md with guidance on when to read them?
- [ ] Does it work without any specific tool or framework named?
- [ ] Has someone (you) used it on a real project at least once before publishing?
```

### Cofoundy (`cofoundy_brand-skills/`)

`.claude-plugin/plugin.json` + `marketplace.json`, `"strict": true`, and an **explicit `skills` array** listing all 15 paths in intended run order (brand-init first). Frontmatter is minimal: `name`, `description`, `metadata.version`. The naming skill additionally uses `compatibility`, `allowed-tools` and `argument-hint`:

```yaml
allowed-tools: Read, Grep, Glob, Bash(whois *), Bash(curl *), Bash(npm view *),
               Bash(gh repo view *), WebSearch, WebFetch
argument-hint: [describe what needs a name]
compatibility: Availability checks need network access; the bundled
               scripts/check-availability.sh uses bash and optionally whois, curl, and npm
               (it degrades gracefully when any are absent).
```

Ships `scripts/validate-skills.sh`, a `.github/workflows/ci.yml`, an ADR (`docs/adr/0001-public-private-split-and-positioning.md`), a `NOTICE` file for MIT attribution of the adapted naming skill, and shared repo-level `references/` (brand-package-spec, localization-es-latam). No commands, no agents.

### Arnab (`arnabbagxd_Brand-building-skills/`)

`marketplace.json` only, no `plugin.json`, `"strict": false`, explicit 29-path `skills` array. Distributes via `npx skills add arnabbagxd/brand-building-skills` (agentskills.io spec, not Claude-specific). Ships `validate-skills.sh`, `VERSIONS.md`, `AGENTS.md`, `CLAUDE.md`, and per-skill `evals/evals.json` for four skills. No references, no scripts, no CI.

---

## 6. The steal list, ranked

**Take wholesale:**

1. The **divergence check** (7-field signature, 7 rules, run twice, mechanical pseudocode, unblock recipes). Extend it to compare against competitor signatures, not just portfolio siblings. `creative-brief-selector/references/03-divergence-check.md`.
2. The **four creative-direction axes** with position-level "what it signals / references / when to pick / common failure", plus combination flagging. `creative-direction/references/axes-explained.md`.
3. The **archetype library shape**: aesthetic family x vertical, with palette rationale, cadence-annotated voice samples, when-to-avoid, vertical anti-patterns, and the preserve-the-relationship-shift-the-values adaptation rule.
4. The **interview guide** question battery and the four bad-question fixes. `brand-discovery/references/interview-guide.md`.
5. The **rejection list** as a first-class brief section, and "what this rejects" as a required field on every territory, mood and archetype choice.
6. The **voice stress test with the competitor variant** ("apply the test to a competitor's copy; if their copy scores high, the attributes are not distinctive enough").
7. The **paired-examples library** with its 16 content types and a 15-example floor.
8. Cofoundy's **prior-art gate** ("a free handle does not mean the name is clear") and its weighted 110-point rubric with `Searchability` and `Competitive density`.
9. Cofoundy's **brand package + discovery contract** (`brand.yaml`, artifacts flag map, "load the package first, do not re-ask", registry as SSOT file not agent memory).
10. RampStack's **evidence guardrail** wording ("a stated gap is a complete answer") and the **honesty guardrail** from `competitor-experience-audit` (observable patterns, `not_assessable`, 3-of-N convention threshold).

**Take the shape, rebuild the content:**

11. `category-conventions.md`'s honour/break/cliche/context structure, extended beyond logos.
12. The `maintenance-playbook` four-tier change authority model.
13. The `brand-truths` section (what is true / what is aspirational / what is not true and stop saying).
14. Cofoundy's **messaging hierarchy** (4 levels) and channel adaptation table, which RampStack has no equivalent for.
15. The **section-shapes vocabulary** as an open named enum with archetype affinities.
16. The **AI-slop table** and filler-word lists from `naming/anti-patterns.md`.

**Adopt as authoring policy:**

17. The eight canonical H2s + CI lint enforcement, the description formula, the length caps, the future-proofing rules, and the 10-item triggering checklist.
18. `check_reference_files_match` and `check_cross_skill_references` as lint checks. These are cheap and catch the two most common rot patterns.
19. Two evals per skill: one rich scenario, one bare keyword that tests triggering plus refusal to guess without context.
20. The progressive-disclosure instruction pattern from the naming skill ("context budget: do NOT load them all; a simple session loads 2-3 files, not 15").

**Do not copy:**

- Cofoundy/Arnab's "make intelligent strategic inferences ... don't leave sections blank".
- Numbered `### 01 - SECTION` report scaffolds with no templates, no failure patterns and no when-not-to-use.
- Any competitor analysis without an evidence rule, a sample-size rule, and a `not_assessable` state.
