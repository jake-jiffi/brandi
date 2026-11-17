# Claude Logo Generation Research

**Research date:** 29 August 2026  
**Objective:** Identify the best GitHub repositories, Claude skills and vector-generation tools for creating a strong range of original logo directions when no logo has been supplied.

## Executive summary

There is no official Anthropic logo-generation skill and no single high-traction repository that handles professional logo strategy, broad concept generation, refinement, production files, application testing and trade mark checks end to end.

There are, however, strong components that can be combined into a very capable Claude workflow.

The recommended stack is:

1. **Rampstack Logo Design** for logo strategy, architecture and evaluation.
2. **Recraft V4.1 Vector through its official MCP server** for broad, native SVG concept generation.
3. **Neonwatty Logo Designer** for interactive comparison and refinement.
4. **LogoLoom** for final SVG cleaning, text-to-outline conversion and the complete production kit.
5. **Claude `/design`** for concept boards, stakeholder presentation and real-world application mock-ups.
6. **IP Australia and WIPO searches** before final approval.

The important distinction is:

> Claude should direct the logo design process. A specialist vector model should expand the creative range. Claude and deterministic tools should then rebuild, refine, test and package the approved mark.

## What Claude can actually do

Claude can create logos in three different ways.

### 1. Claude writes the SVG directly

Claude can construct a logo using SVG shapes, paths and actual type. This gives clean, editable output and complete control over the code.

This approach is strongest for:

- Geometric symbols
- Monograms
- Simple letterform marks
- Minimal wordmarks
- Icons
- Logo systems with strict mathematical construction

Its limitation is visual range. Claude can reason very well about a logo but hand-coded curves and custom typography can become mechanical or generic without a strong process and visual feedback.

### 2. Claude calls a vector-generation model

Through an MCP connection, Claude can call a model such as Recraft or SVGMaker to generate native SVG concepts from carefully structured prompts.

This produces more visual variety and can explore expressive marks that are difficult to hand-code. The generated files still require inspection, simplification and production refinement.

### 3. Claude uses a raster image model and vectorises the result

Claude can call a general image model through an MCP service, select a promising concept and convert it to SVG.

This is useful for loose visual exploration but is the weakest production route because:

- Lettering may be incorrect
- Small details often become messy paths
- Auto-tracing can create thousands of unnecessary points
- The mark may fail in one colour
- The resulting vector may be difficult to edit

Raster models should be treated as sketching tools, not final logo engines.

## Strongest GitHub repositories and services

Traction figures were checked on 29 August 2026 and will change over time.

| Repository or service | Approximate traction | Primary role | Native vector | Range and refinement | Production kit |
| --- | ---: | --- | --- | --- | --- |
| [Rampstack Claude Skills](https://github.com/rampstackco/claude-skills) | 781 stars, 110 forks | Professional logo strategy and decision framework | Depends on connected renderer | Excellent methodology | Detailed hand-off specification |
| [SVGMaker MCP](https://github.com/GenWaveLLC/Svgmaker-mcp) | 86 stars, 10 forks | AI SVG generation, editing and conversion from Claude | Yes | Good generation and natural-language editing | Limited logo-specific packaging |
| [Neonwatty Logo Designer Skill](https://github.com/neonwatty/logo-designer-skill) | 74 stars, 9 forks | Iterative Claude logo workflow with visual review | Yes, Claude-authored SVG | Strong review and refinement loop | Standard PNG exports |
| [Recraft MCP](https://github.com/recraft-ai/mcp-recraft-server) | 60 stars, 12 forks | Native raster and vector generation from Claude | Yes | Strongest external visual-generation engine found | Requires a separate packaging layer |
| [LogoLoom](https://github.com/mcpware/logoloom) | 29 stars, 4 forks | Local MCP production and brand-kit export | Yes | Generates 6 to 8 Claude-authored SVG concepts | Excellent, 31-file package |
| [Pranavred Logo Design Skill](https://github.com/pranavred/claude-code-logodesign-skill) | 0 stars | Professional hand-coded SVG workflow | Yes | Strong structure and preview system | Good optimisation and variants |
| [Qiguangyang Logo Generator Skill](https://github.com/qiguangyang/logo-generator-skill) | 0 stars | Parallel SVG concepts, browser selection and export | Yes | Strong multi-agent workflow | Excellent web and favicon outputs |

## Detailed assessment

### 1. Rampstack Logo Design

Repository: <https://github.com/rampstackco/claude-skills>

Logo skill: <https://github.com/rampstackco/claude-skills/blob/main/skills/logo-design/SKILL.md>

This is the strongest professional design methodology found. It treats a logo as a system of marks rather than a single image.

It is designed to produce 6 to 12 decision-ready variants across different logo architectures:

- Wordmark
- Wordmark and symbol lock-up
- Symbol-only mark
- Letterform-as-symbol
- Monogram

It also forces consideration of:

- Brand name and exact spelling
- Audience perception
- Industry conventions
- Formal versus casual tone
- Restrained versus expressive tone
- Heritage versus modern positioning
- References the owner likes and dislikes
- Required use cases
- Hard technical constraints

Every serious candidate is tested against:

- 16-pixel favicon
- Mobile app icon
- Single-colour reproduction
- Reverse logo on dark backgrounds
- Embroidery
- Foil stamping
- Large-format signage
- Social profile images
- Motion applications

Its strongest principle is that the first round is decision material rather than a falsely polished final answer. The owner chooses a direction, then the system completes production refinement.

**Assessment:** The best orchestration and quality-control layer. Its weakness is that it does not contain a specialist visual-generation engine.

### 2. Recraft MCP and Recraft V4.1 Vector

Archived GitHub implementation: <https://github.com/recraft-ai/mcp-recraft-server>

Current official MCP documentation: <https://www.recraft.ai/docs/mcp-reference/tools>

Current MCP endpoint:

```bash
claude mcp add --transport http recraft https://mcp.recraft.ai/mcp
```

The GitHub repository was archived on 13 July 2026 because Recraft replaced it with an official remote MCP server. The remote connection is now the supported route.

Recraft can:

- Generate native SVG files from prompts
- Generate multiple images in one call
- Edit an existing vector or raster image
- Create and reuse a custom visual style
- Vectorise raster concepts
- Control colour and background
- Generate related variations from a reference

The current Recraft V4 and V4.1 vector models return editable SVG files rather than raster images hidden inside an SVG wrapper.

Official model information: <https://www.recraft.ai/docs/api-reference/models/recraft-v4>

Recraft V4 Vector is listed at US$0.08 per standard vector and US$0.30 per Pro vector. Pricing should be checked before implementation because it may change.

Recraft can also be accessed through Replicate. The Recraft V4.1 SVG model had approximately 14,300 public runs when checked:

<https://replicate.com/recraft-ai/recraft-v4.1-svg>

Commercial use requires care. Recraft states that assets made under its free plan remain public, are owned by Recraft and are not available for commercial use. A paid plan gives the user ownership and commercial rights over assets generated while subscribed.

Official ownership terms: <https://www.recraft.ai/docs/plans-and-billing/commercial-rights-and-ownership>

**Assessment:** Best visual-generation engine found for broad logo exploration inside Claude. Use a paid account for business work and record the plan and generation date in the asset manifest.

### 3. SVGMaker MCP

Repository: <https://github.com/GenWaveLLC/Svgmaker-mcp>

This is a maintained MCP server that connects Claude Code directly to SVGMaker. It supports:

- Text-to-SVG generation
- Natural-language SVG editing
- Image-to-SVG conversion
- Raster generation
- Background removal
- Inline previews
- Transparent-background control
- Style, colour and composition controls
- Local file output through the standard input/output connection
- Remote OAuth connection through its hosted MCP endpoint

Claude Code installation:

```bash
claude mcp add --transport http svgmaker https://mcp.svgmaker.io/mcp
```

The local form can save directly to a project path:

```bash
claude mcp add svgmaker --env SVGMAKER_API_KEY=your_api_key_here -- npx -y @genwave/svgmaker-mcp
```

Paid users receive commercial rights to generated SVGs, according to SVGMaker's licensing page. Free generations are restricted to personal use.

Licensing information: <https://svgmaker.io/refund-licensing>

**Assessment:** Strong alternative to Recraft, particularly for direct Claude-controlled SVG generation and editing. Recraft currently appears stronger as the primary creative engine, while SVGMaker is attractive for iterative natural-language vector editing.

### 4. Neonwatty Logo Designer Skill

Repository: <https://github.com/neonwatty/logo-designer-skill>

Installation:

```bash
claude plugin add neonwatty/logo-designer-skill
```

The workflow has four clear phases:

1. Interview the owner about the brand, audience and aesthetic preferences.
2. Generate 3 to 5 distinct SVG concepts.
3. Display the options in a side-by-side preview and refine the chosen direction.
4. Export final PNGs at 16, 32, 48, 192, 512, 1024 and 2048 pixels.

The repository includes a real example with five initial concepts and 37 iterations across ten design phases.

Its most valuable contribution is not the raw generation method. It is the visual selection and refinement loop that keeps the owner involved without asking them to edit code.

**Assessment:** Best existing installable Claude plugin for an iterative logo conversation. It is a good starting point if simplicity matters, but it should be strengthened with Rampstack's logo architecture and application tests.

### 5. LogoLoom

Repository: <https://github.com/mcpware/logoloom>

Installation:

```bash
npx @mcpware/logoloom
```

LogoLoom reads the project, asks brand questions, has Claude write 6 to 8 SVG concepts and then generates a complete 31-file brand kit.

Its production tools include:

- `text_to_path` to turn type into font-independent vector outlines
- `optimize_svg` to clean and compress paths
- `export_brand_kit` to produce all required formats
- `image_to_svg` for raster-to-vector conversion

The final package can include:

- Full horizontal logo
- Icon-only mark
- Wordmark-only logo
- Light and dark versions
- Black and white versions
- PNGs from favicon size to app-store size
- Browser favicon
- WebP versions
- Open Graph image
- GitHub social preview
- X header
- `BRAND.md`

**Assessment:** Best production and packaging layer. Its direct Claude-authored concept generation is useful, but the design-quality methodology is not as strong as Rampstack's and the creative range may be less than Recraft's.

### 6. Pranavred Logo Design Skill

Repository: <https://github.com/pranavred/claude-code-logodesign-skill>

This early project provides a well-considered, hand-coded SVG process:

- Guided discovery with curated options
- Multiple structural categories
- Wordmarks, symbols, geometric marks and letterform hybrids
- Clean SVG construction
- Live-reloading browser preview
- Small-size testing
- Light and dark contexts
- Favicon and navigation-bar mock-ups
- Dark-mode variants
- SVGO optimisation

**Assessment:** Very good design instructions, but it has no meaningful community validation yet. Its preview and SVG construction principles are worth borrowing.

### 7. Qiguangyang Logo Generator Skill

Repository: <https://github.com/qiguangyang/logo-generator-skill>

This project has little traction but a strong technical workflow:

- Reads the project and writes `logos/brief.md`
- Launches 3 to 5 parallel agents to produce intentionally different SVG concepts
- Presents them in an interactive gallery
- Supports choose, refine and finalise actions
- Produces new rounds without losing the selected direction
- Exports PNGs, `favicon.ico`, PWA icons, `site.webmanifest` and an HTML head snippet
- Uses no external runtime dependencies beyond Node's built-in capabilities

**Assessment:** Best example of parallel concept generation and browser-led selection, but too new to adopt without testing.

## What Claude `/design` should do

Claude `/design` is useful in this process, but it should not be treated as the specialist logo-generation engine.

Its best roles are:

- Present the initial concept range professionally
- Create a visual rationale for each territory
- Show horizontal, stacked and symbol-only versions
- Place the logo in realistic application mock-ups
- Compare concepts on equal backgrounds and at equal sizes
- Capture stakeholder feedback
- Test how each mark works with the wider brand identity
- Generate a final logo selection board and brand-guideline pages

Recommended use:

```text
Logo strategy
    -> vector concept generation
    -> technical filtering
    -> /design presentation and mock-ups
    -> stakeholder selection
    -> vector refinement
    -> production package
```

`/design` is the presentation, testing and collaboration surface. The approved SVG master files and documented construction rules remain the permanent authority.

## Recommended professional workflow

### Phase 1: Build the brief

Do not begin drawing until the following have been defined:

- Exact business name and preferred capitalisation
- Business category
- Primary audience
- Customer problem
- Positioning
- Brand promise
- Personality and tone
- Desired perception
- Perceptions to avoid
- Main logo applications
- Competitor landscape
- Reference logos that are liked
- Reference logos that are disliked
- Legal or cultural constraints

The brief should distinguish facts, owner preferences, assumptions and open questions.

### Phase 2: Define the range before generating

Generate 12 initial concepts across four controlled families:

| Family | Quantity | Purpose |
| --- | ---: | --- |
| Wordmark | 3 | Explore distinctive typography and custom letterforms |
| Letterform or monogram | 3 | Create strong small-format and social-profile marks |
| Symbolic mark | 3 | Explore meaningful literal or metaphor-driven ideas |
| Abstract mark | 3 | Explore distinctive shapes that communicate the intended feeling |

This prevents the system from generating twelve versions of the same idea.

Each family should receive a different creative brief and should be produced independently. The generator should not see previous concepts until the first round is complete, reducing visual convergence.

### Phase 3: Generate in black first

Every first-round concept should be generated and assessed in pure black on white.

This exposes whether the geometry and silhouette work without colour. Colour should not rescue a weak mark.

Recraft V4.1 Vector is the recommended engine for broad concept generation. Claude-authored SVG should also produce at least one concept in each family as a more controlled comparison.

### Phase 4: Automated technical filtering

Before stakeholder review, every candidate should pass:

- Valid SVG parsing
- No embedded raster images
- No clipping outside the view box
- No accidental transparent shapes
- Reasonable path and node count
- One-colour reproduction
- Reverse white-on-black reproduction
- 16, 24, 32 and 64-pixel rendering
- Clear silhouette
- Minimum stroke-width rules
- Horizontal and square placement tests
- Basic contrast checks
- No dependency on an unavailable font

Failed candidates should either be repaired or removed.

### Phase 5: Distinctiveness filtering

Claude should compare the candidates against:

- Major competitors
- Common category logo patterns
- Search-engine image results
- Known icon libraries
- Previous generated concepts

The system should flag generic patterns such as:

- Unexplained gradient loops
- Generic sparkle symbols
- Three overlapping circles
- Basic hexagons
- Growth arrows
- Handshake icons
- Letter inside a rounded square
- Default geometric sans wordmarks

A concept should be rejected if its main idea is already strongly associated with another organisation or if it resembles several common category marks.

### Phase 6: `/design` concept presentation

Present the strongest six to eight candidates using one consistent board.

For each candidate include:

- Concept name
- Logo architecture
- Strategic idea
- What it communicates
- What it deliberately avoids
- Primary strength
- Known weakness
- Horizontal version
- Square or symbol-only version
- Black version
- Reverse version
- 16 and 32-pixel previews
- Two realistic application mock-ups

Do not present a single preferred option before the owner has seen a credible range.

### Phase 7: Select directions, not final logos

Select two or three directions for refinement. Do not choose a final winner from the first concept round.

For each selected direction, create:

- Three symbol refinements
- Three wordmark refinements
- Two lock-up proportions
- One stacked lock-up
- One symbol-only fallback
- One favicon-specific simplification

The goal is to preserve the idea while improving proportion, spacing, rhythm and reproduction.

### Phase 8: Real-world testing

Test the finalists in the contexts the business will actually use. The standard test set should include:

- Website header
- Mobile website
- Favicon
- Social profile image
- Sales presentation
- Proposal or report cover
- Email signature
- Business card
- Signage
- Embroidered shirt or hat
- Vehicle signage where relevant
- Black-and-white office printer
- Dark background
- Small digital advertisement

The owner should choose based on how the system performs, not only how the large logo looks on a white page.

### Phase 9: Trade mark and similarity checks

An AI-generated logo is not automatically original or safe to register.

Before final approval, conduct preliminary searches using:

- [IP Australia Trade Mark Search](https://search.ipaustralia.gov.au/trademarks/search)
- [WIPO Global Brand Database](https://www.wipo.int/en/web/global-brand-database)
- Reverse-image search
- Exact business-name search
- Similar spellings and phonetic variants
- Image-only searches without the wordmark
- Searches within the relevant goods and services classes

IP Australia supports visual-similarity searches by uploading the proposed image. It also warns that preliminary search results are not a substitute for the examination process. A trade mark professional should review any commercially important final mark.

### Phase 10: Production refinement

The approved logo should be rebuilt or carefully cleaned rather than accepted directly from the generation model.

The production step should:

- Simplify unnecessary paths
- Remove hidden and duplicate geometry
- Correct optical alignment
- Refine curves and corner radii
- Correct wordmark kerning
- Convert approved lettering to outlines
- Retain an editable construction master
- Define clear space
- Define minimum sizes
- Create small-size adaptations
- Create one-colour and reverse versions
- Confirm that every file contains the same approved geometry

LogoLoom's text-to-path, SVG optimisation and export tools are well suited to this stage.

## Recommended deliverables

```text
brand/logo/
├── brief/
│   ├── logo-brief.md
│   ├── competitor-audit.md
│   └── decision-log.md
├── concepts/
│   ├── round-01/
│   ├── round-02/
│   └── finalist-comparisons/
├── master/
│   ├── construction-master.svg
│   ├── primary-horizontal.svg
│   ├── primary-stacked.svg
│   ├── symbol.svg
│   ├── wordmark.svg
│   └── favicon-simplified.svg
├── colour/
│   ├── full-colour-light.svg
│   ├── full-colour-dark.svg
│   ├── mono-black.svg
│   └── mono-white.svg
├── raster/
│   ├── png/
│   └── webp/
├── digital/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── pwa-icons/
│   └── site.webmanifest
├── social/
│   ├── profile-images/
│   └── share-images/
├── testing/
│   ├── size-tests.html
│   ├── contrast-tests.html
│   └── mock-ups/
├── legal/
│   ├── similarity-search-record.md
│   ├── generation-manifest.md
│   └── licence-record.md
└── LOGO-GUIDELINES.md
```

## Generation manifest

For every model-generated candidate, store:

- Model and version
- Service used
- Date generated
- Account or licence tier
- Exact prompt
- Input references
- Generation identifier
- Original output file
- Editing history
- Final relationship to the approved logo

This provides traceability and helps demonstrate that the final mark was deliberately developed rather than copied from an unknown source.

## Recommended combined skill architecture

```text
/logo-system
    |
    +-- brief and category research
    |
    +-- four independent concept families
    |      +-- Claude-authored SVG
    |      +-- Recraft native SVG
    |
    +-- technical and distinctiveness filters
    |
    +-- /design review board and mock-ups
    |
    +-- stakeholder selection
    |
    +-- focused refinement rounds
    |
    +-- trade mark and similarity review
    |
    +-- production rebuild and LogoLoom export
    |
    +-- logo guidelines and brand-system hand-off
```

## Best options by need

| Need | Best choice |
| --- | --- |
| Best logo methodology | Rampstack Logo Design |
| Best installable Claude logo plugin | Neonwatty Logo Designer |
| Best visual range | Recraft V4.1 Vector through MCP |
| Best native SVG editing alternative | SVGMaker MCP |
| Best final file package | LogoLoom |
| Best parallel-agent example | Qiguangyang Logo Generator |
| Best fully local approach | Claude-authored SVG plus LogoLoom |
| Best stakeholder presentation | Claude `/design` |

## Recommended practical setup

For the strongest business-grade result:

1. Adapt Rampstack's `logo-design` skill as the main decision framework.
2. Add Recraft's official remote MCP as the primary vector-generation engine.
3. Generate 12 black-only concepts across four independent logo families.
4. Use the Neonwatty or Qiguangyang gallery pattern for comparison and refinement.
5. Use `/design` to present the shortlist and test real business applications.
6. Refine two or three directions before choosing the winner.
7. Run image-similarity and trade mark checks.
8. Rebuild or clean the approved SVG.
9. Use LogoLoom to convert type to outlines and create the production package.
10. Feed the approved logo files and rules into the broader brand-guidelines system.

For the quickest working solution with minimal integration:

1. Install Neonwatty Logo Designer.
2. Add the Recraft MCP connection.
3. Use LogoLoom for final export.

## Final conclusion

Claude can generate logos today, but the best result does not come from asking it to produce one logo in a single prompt.

The strongest system separates four responsibilities:

1. **Claude reasons about the brand and defines the logo directions.**
2. **Recraft or another vector model expands the visual possibilities.**
3. **Claude `/design` presents and stress-tests the options.**
4. **Deterministic SVG tooling cleans and packages the approved result.**

The best overall combination is:

> **Rampstack Logo Design + Recraft V4.1 Vector + Neonwatty's refinement loop + LogoLoom production export + Claude `/design` application testing.**

This would create a credible range of original directions from nothing more than a business idea and brand name, while still producing the controlled vector files, usage rules and evidence trail required for a logo the business can safely use into the future.
