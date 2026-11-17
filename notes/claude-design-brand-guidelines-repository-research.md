# Claude Design Brand Guidelines Skill Research

**Research date:** 29 August 2026  
**Objective:** Identify GitHub repositories that can help turn an early business idea, an existing logo or a small collection of brand assets into a complete, durable brand system using Claude skills and Claude Design.

## Executive summary

There is not yet one mature, high-traction repository that completes the full workflow exactly as described.

The best available approach is to combine:

1. **Rampstack Claude Skills** for brand discovery, positioning, identity, voice and guideline development.
2. **Claude `/design`** for visual exploration, application design and stress testing.
3. **A version-controlled brand system** based on the strongest ideas from `brand-system`, `brand-book` and OpenDesign.

Claude Design should be the visual workshop, not the permanent source of truth. The approved brand should be stored in machine-readable files, written guidelines, design tokens and controlled assets that Claude Design and other tools can import in the future.

## Strongest GitHub repositories

GitHub traction figures were checked on 29 August 2026 and will change over time.

| Repository | Approximate traction | Strongest capability | Main limitation |
| --- | ---: | --- | --- |
| [nexu-io/open-design](https://github.com/nexu-io/open-design) | 92.5k stars, 10.7k forks | Extracts and generates reusable design systems, brand data and many finished artefact types | It is an alternative to Claude Design rather than a skill built around Anthropic's `/design` command |
| [rampstackco/claude-skills](https://github.com/rampstackco/claude-skills) | 781 stars, 110 forks | Most complete strategic brand workflow from discovery through to identity, guidelines and voice | Tool-agnostic, so `/design` needs to be added as the visual execution layer |
| [jiji262/claude-design-skill](https://github.com/jiji262/claude-design-skill) | 185 stars, 26 forks | Claude-focused design skill with a strong brand asset protocol and visual quality controls | Does not cover the complete business strategy or long-term brand governance process |
| [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/main/partner-built/brand-voice) | 23.7k stars on parent repository | Evidence-backed brand voice guideline generation | Covers verbal identity, not the complete visual identity system |
| [shaharsha/claude-skills: brand-system](https://github.com/shaharsha/claude-skills/blob/main/skills/brand-system/SKILL.md) | 5 stars | Technically comprehensive brand-book, token, accessibility and governance outputs | Very low community traction and does not directly use Claude `/design` |
| [ordinarynerds/brand-book](https://github.com/ordinarynerds/brand-book) | 2 stars | Creates a canonical brand file plus a companion skill for future enforcement | Early project with little community validation |
| [arvindrk/extract-design-system](https://github.com/arvindrk/extract-design-system) | 192 stars, 23 forks | Extracts colours, typography, spacing and other tokens from an existing public website | Useful extraction utility, not an end-to-end brand strategy process |

## Detailed assessment

### 1. Rampstack Claude Skills

Repository: <https://github.com/rampstackco/claude-skills>

This is the strongest foundation for the thinking and decision-making portion of the workflow. It provides an explicit brand pipeline:

```text
brand-discovery
  -> brand-ideation
  -> brand-identity
  -> brand-style-guide
  -> brand-voice
```

Its workflow considers:

- Business and category context
- Target audience and customer needs
- Competitors and positioning opportunities
- Brand territories and narrative
- Naming and messaging
- Logo systems
- Colour and typography
- Imagery and iconography
- Motion principles
- Brand applications
- Voice attributes and tone by context
- Vocabulary, grammar and worked examples
- Dos, don'ts and usage guidance

The `brand-style-guide` skill describes the result as a canonical reference expected to be used for years. That matches the need for a durable business asset.

**Assessment:** Best strategic backbone. It should orchestrate the discovery and brand-definition process before Claude Design starts producing finished visual work.

### 2. OpenDesign

Repository: <https://github.com/nexu-io/open-design>

Relevant skill: <https://github.com/nexu-io/open-design/blob/main/skills/brand-extract/SKILL.md>

OpenDesign has very high traction and a broad design-generation framework. Its `brand-extract` skill can inspect a live website and create:

- `brand.json`
- `BRAND.md`
- Semantic colour roles
- Light, dark and compact token variants
- Typography rules
- Logo candidates and stored assets
- Imagery direction
- Brand voice observations
- Layout and spacing patterns
- A registered, reusable design system

It can then apply the system to landing pages, decks, posters, email, newsletters and forms.

Its strongest concept is measurement before assumption. When an existing website or asset source is available, it attempts to inspect the real implementation rather than guessing the brand.

**Assessment:** Excellent source of schemas, extraction logic and reusable design-system patterns. It does not call Anthropic's `/design` feature, so it should be treated as a reference implementation or alternative engine.

### 3. Claude Design Skill by jiji262

Repository: <https://github.com/jiji262/claude-design-skill>

This portable Claude skill is adapted from Claude Design's design approach. It is focused on creating higher-quality visual artefacts such as:

- Landing pages
- Presentations
- Interactive prototypes
- Posters
- Animated experiences

Its brand asset protocol is particularly useful. It treats logos, product imagery and interface screenshots as primary evidence, with colours and fonts as supporting evidence. It can record the findings in `brand-spec.md` before creating visual work.

It also includes controls intended to prevent generic AI design, including multiple visual schools, deliberate variation and brand-specific fact verification.

**Assessment:** Closest useful design-focused Claude skill, but it needs Rampstack-style discovery and a stronger publication and governance layer around it.

### 4. Anthropic Brand Voice plugin

Repository: <https://github.com/anthropics/knowledge-work-plugins/tree/main/partner-built/brand-voice>

Guideline-generation skill: <https://github.com/anthropics/knowledge-work-plugins/blob/main/partner-built/brand-voice/skills/guideline-generation/SKILL.md>

The Brand Voice plugin accepts source documents such as:

- Founder or stakeholder interviews
- Existing marketing material
- Discovery reports
- Call transcripts
- Brand or product documents

It produces an LLM-readable voice guide with source confidence, open questions and reusable instructions. Its default canonical output is `.claude/brand-voice-guidelines.md`.

**Assessment:** A valuable verbal-identity module. It should complement, not replace, the visual and strategic brand workflow.

### 5. `brand-system` by shaharsha

Skill: <https://github.com/shaharsha/claude-skills/blob/main/skills/brand-system/SKILL.md>

Although it has low traction, this is one of the most complete technical specifications found. Its proposed outputs include:

- A detailed `BRAND.md`
- A self-styled `BRAND.html`
- A PDF brand book
- `tokens.css` for implementation
- `tokens.json` following W3C Design Token conventions
- Logo rules
- Colour and typography systems
- Imagery and iconography
- Spacing, layout and material principles
- Motion standards
- Voice guidance
- Accessibility requirements
- Component examples
- Anti-patterns
- Migration guidance
- A decision log
- Checks for contrast, outline issues and brand drift

**Assessment:** Best technical model for the final deliverables, but not sufficiently established to use without review and adaptation.

### 6. Ordinary Nerds Brand Book

Repository: <https://github.com/ordinarynerds/brand-book>

This project uses a single `brand.json` as the source of truth and generates:

- A structured brand book
- HTML and PDF output
- CSS and JSON tokens
- Stored assets
- A companion `<brand>-brand` skill
- Warnings or blocks for off-palette colours and banned vocabulary

The companion-skill concept directly supports future consistency. Once the brand has been approved, the skill can be loaded by future agents before they design pages, write copy or build products.

**Assessment:** Very relevant long-term operating model, but it is an early, low-traction implementation.

## How Claude `/design` should be used

Official Claude Design information:

- Product: <https://claude.com/product/design>
- Getting started: <https://support.claude.com/en/articles/14604416-get-started-with-claude-design>
- Design system setup: <https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design>

Claude Design can work with Claude Code through `/design`, and `/design-sync` can bring a design system from a local codebase or GitHub repository into Claude Design.

This creates a useful operating model:

1. The brand skill conducts discovery and produces an initial structured definition.
2. `/design` explores distinct visual territories.
3. The territories are tested on realistic business applications.
4. Stakeholders select and refine a direction.
5. The approved system is written back to the repository.
6. `/design-sync` imports the approved system for future work.

Claude Design should help discover, demonstrate and stress-test the brand. It should not be the only place where the final brand exists.

## Recommended end-to-end skill

The ideal solution is a purpose-built orchestrator skill combining the strongest parts of the repositories above.

### Phase 1: Intake and evidence audit

Accept any combination of:

- A business idea
- Founder notes or interviews
- An existing logo
- A website URL
- Existing presentations or documents
- Product screenshots
- Customer research
- Competitor references
- Examples of brands the stakeholders admire or dislike

The system should label each conclusion as:

- Supplied fact
- Extracted evidence
- Stakeholder decision
- Working assumption
- Open question

This helps prevent invented brand history or unsupported claims from entering the final guidelines.

### Phase 2: Brand strategy

Define and obtain approval for:

- Business purpose
- Customer problem
- Primary audiences
- Market category
- Competitor context
- Positioning
- Differentiators
- Brand promise
- Values and behaviours
- Personality
- Narrative
- Messaging hierarchy

### Phase 3: Identity territories

Create two to four genuinely different territories, each with:

- Strategic rationale
- Logo direction
- Colour system
- Typography system
- Image and illustration direction
- Iconography
- Layout principles
- Motion principles
- Voice and messaging examples
- Known strengths and risks

These should be distinct strategic options, not minor colour variations.

### Phase 4: Claude Design application testing

Use `/design` to test every serious territory across representative applications such as:

- Website home page
- Product or service page
- Sales presentation
- Proposal or report
- Social media campaign
- Email communication
- Product interface
- Signage, packaging or uniforms where relevant

Testing should also cover:

- Light and dark backgrounds
- Small and large logo sizes
- Desktop and mobile layouts
- Accessibility and contrast
- Photography and image treatment
- Short and long copy
- Formal and informal communications
- Premium and high-volume use cases

### Phase 5: Approval and codification

Record:

- Approved decisions
- Rejected alternatives
- Reasons behind key decisions
- Remaining open questions
- Approval owners
- Effective date
- Version number

### Phase 6: Publication

The completed system should include:

```text
brand/
├── BRAND.md
├── brand.json
├── brand-book.html
├── brand-book.pdf
├── decision-log.md
├── governance.md
├── assets/
│   ├── logos/
│   ├── icons/
│   ├── imagery/
│   └── fonts/
├── tokens/
│   ├── tokens.json
│   ├── tokens.css
│   └── tailwind.css
├── voice/
│   ├── voice-guidelines.md
│   ├── messaging-framework.md
│   └── examples.md
├── applications/
│   ├── website/
│   ├── presentation/
│   ├── documents/
│   ├── social/
│   └── product/
└── skill/
    ├── SKILL.md
    ├── validation-rules.md
    └── references/
```

### Phase 7: Future governance

The companion brand skill should:

- Load the canonical brand files before generating design or copy
- Check whether a requested output follows approved rules
- Warn when a non-approved colour, font, logo or phrase is introduced
- Distinguish a valid extension from an accidental inconsistency
- Record approved changes in the decision log
- Update version numbers when the source of truth changes
- Detect drift between the brand book, tokens and production code
- Allow explicit exceptions without silently changing the core system

## Recommended source-of-truth structure

The system should separate three different forms of information.

| Layer | Purpose | Recommended format |
| --- | --- | --- |
| Brand meaning | Strategy, personality, narrative, messaging and decisions | Markdown |
| Brand rules | Colours, typography, spacing, assets, voice constraints and component rules | JSON and Markdown |
| Brand implementation | Reusable values that websites and applications can consume | W3C design tokens, CSS and component files |

This prevents the PDF from becoming a beautiful but outdated document. The PDF is a published view of the system, while the structured files remain the editable authority.

## Recommended starting point

If the goal is to create this as a robust Claude skill:

1. Fork or adapt the brand pipeline from [Rampstack Claude Skills](https://github.com/rampstackco/claude-skills).
2. Add the brand-evidence and asset protocol from [jiji262/claude-design-skill](https://github.com/jiji262/claude-design-skill).
3. Use Claude `/design` to create and test the visual territories.
4. Adopt the output and governance structure from [`brand-system`](https://github.com/shaharsha/claude-skills/blob/main/skills/brand-system/SKILL.md).
5. Use a canonical `brand.json` and companion enforcement skill inspired by [ordinarynerds/brand-book](https://github.com/ordinarynerds/brand-book).
6. Add the evidence-backed voice workflow from [Anthropic's Brand Voice plugin](https://github.com/anthropics/knowledge-work-plugins/tree/main/partner-built/brand-voice).
7. Add `/design-sync` so Claude Design always uses the latest approved system.

## Final conclusion

No high-traction repository currently provides the exact complete solution.

The strongest practical foundation is:

> **Rampstack for strategy and identity, Claude `/design` for visual exploration and testing, and a version-controlled brand system for permanent governance.**

This combination can start with very little, including only an idea and a logo, while still producing a professional brand system that people, AI agents, designers and developers can reliably use into the future.
