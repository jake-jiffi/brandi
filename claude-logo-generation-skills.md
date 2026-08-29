# Claude skills for logo generation (from nothing)

Research notes, 30 August 2026. Companion to `claude-brand-guidelines-skills.md`.

## The constraint that shapes everything

**Claude can't generate raster images.** So logo skills split into two families that behave completely differently.

**SVG-native.** Claude writes vector code directly. Free, no API key, output is a real editable SVG, and it scales to a favicon cleanly. The limit is aesthetic range: geometric marks, letterforms, monograms and simple pictorials come out well; illustrative or textured marks don't.

**Raster via external API.** The skill shells out to Gemini's Nano Banana or gpt-image-2. Wider visual range, but you need an API key, you get a PNG, and you have to vectorise it afterwards before it's usable as a logo.

For "generate a range when nothing was supplied," the SVG family is the better starting point. Concepts are cheap, so you can look at 5 and iterate, and you're not paying per idea.

## SVG-native (concept galleries)

| Repo | Stars | What it does |
|---|---|---|
| [neonwatty/logo-designer-skill](https://github.com/neonwatty/logo-designer-skill) | 74 | Four phases: interview, 3–5 distinct SVG concepts in a side-by-side preview, refine the one you pick, export PNGs at 16/32/48/192/512/1024/2048. Installs as a proper plugin (`claude plugin add`). Most polished of the SVG group. |
| [qiguangyang/logo-generator-skill](https://github.com/qiguangyang/logo-generator-skill) | 0 | Closest to the brief. 3–5 parallel agents each write a distinct concept, then a local browser gallery with dark/light preview and a 64/32/16px favicon strip where you click Refine or Finalize. Exports the full kit: PNGs, `favicon.ico`, apple-touch-icon, maskable PWA icons, `site.webmanifest`, paste-ready `<head>` snippet. Zero dependencies. |
| [atypica-ai/logo-design-skill](https://github.com/atypica-ai/logo-design-skill) | 1 | 9-phase workflow, delivers 3 concepts with written rationale. The letterform analysis phase is the interesting bit: letter anatomy, ligature opportunities, negative-space discoveries. Good if the name itself should carry the mark. |
| [wcgordon1/logo-skills](https://github.com/wcgordon1/logo-skills) | 1 | Five concept routes (mascot, pictorial, abstract, monogram, emblem) as an explicit axis, with rendering treatment as a separate axis. Requires a viable one-colour mark and small-size inspection before delivery. |
| [GKjohns/logo-design-skill](https://github.com/GKjohns/logo-design-skill) | 1 | HTML gallery of 5+ SVG concepts, then ships the chosen one. Simpler than the above. |
| [pranavred/claude-code-logodesign-skill](https://github.com/pranavred/claude-code-logodesign-skill) | 0 | Bare-bones SVG logo skill. Listed for completeness. |

## Raster via image APIs

| Repo | Stars | What it does |
|---|---|---|
| [AgriciDaniel/banana-claude](https://github.com/AgriciDaniel/banana-claude) | 998 | Claude as creative director over Gemini Nano Banana. Not logo-specific, but the best-maintained image-gen bridge. Free Google AI Studio key. |
| [kingbootoshi/nano-banana-2-skill](https://github.com/kingbootoshi/nano-banana-2-skill) | 408 | Gemini 3 Pro image CLI. Green-screen transparency and reference images matter here — transparency is what makes output usable as a mark. |
| [SpaceZephyr/design-buddy](https://github.com/SpaceZephyr/design-buddy) | 150 | Visual production skills including logo, via GPT-image-2. Docs mostly Chinese. |
| [ziguishian/brand-design-skill](https://github.com/ziguishian/brand-design-skill) | 97 | Image-first Codex brand skill: Socratic brief, logo image exploration, VI application scenes, HTML brand book. Chinese docs. |
| [designrique/ai-graphic-design-skill](https://github.com/designrique/ai-graphic-design-skill) | 22 | Not a generator, a method. Written by a graphic designer with a CS masters. Tool selection matrix, per-tool prompt formulas, and critically a vectorisation pipeline (upscale → Vectorizer.ai or Chat2SVG → Bezier cleanup). This is the piece the raster skills all leave out. |
| [anniebuildz/iconwall](https://github.com/anniebuildz/iconwall) | 1 | Wall of 9 variations for a theme via Gemini. Crude but exactly the "show me a range" shape. |
| [htuzel/gemini-svg-creator](https://github.com/htuzel/gemini-svg-creator) | 2 | Hybrid: Gemini 3.1 Pro via MCP, but outputs SVG rather than raster. Worth watching. |

## Adjacent, worth knowing

| Repo | Stars | Note |
|---|---|---|
| [alonw0/web-asset-generator](https://github.com/alonw0/web-asset-generator) | 489 | Highest traction in the whole search, but it's the step *after*: takes an existing logo and produces favicons, app icons and social images. Pair with whatever generates the mark. |
| [dungnotnull/startup-brand-identity-guidelines-agent-skill](https://github.com/dungnotnull/startup-brand-identity-guidelines-agent-skill) | 5 | Scores a mark rather than making one. Five weighted dimensions against Gestalt, Itten, WCAG 2.2, Bringhurst, brand archetypes. Useful as a second opinion on concepts from elsewhere. |
| [Paldom/icon-designer-skills](https://github.com/Paldom/icon-designer-skills) | 1 | Minimalist app and package icons, symmetric marks on dark grey. Narrow but disciplined. |
| [DiegoAmorimDev/brandpress](https://github.com/DiegoAmorimDev/brandpress) | 1 | Brief → vector logos in outlines, multi-page brand manual, press-ready files. Ties logo and guidelines together. |

## What I'd actually do

1. Start with `logo-generator-skill` or `logo-designer-skill` to get 5 SVG directions on screen for nothing.
2. Judge them at 16px in the favicon strip. This kills most weak concepts immediately.
3. If the SVG output feels too geometric for the brand, bring in `banana-claude` for exploration.
4. If you go the raster route, take `ai-graphic-design-skill`'s vectorisation pipeline seriously. A PNG logo is not a deliverable.
5. Optionally score the finalists with the startup brand identity skill for an independent read.

## Cautions

- Near-zero-star repos, single maintainers, local scripts. Read the `SKILL.md` before installing.
- `neonwatty/logo-designer-skill` and `qiguangyang/logo-generator-skill` trigger on similar phrases. Don't install both.
- AI-generated marks have unsettled IP status and none of these run a similarity check against existing trademarks. For client work, search IP Australia's trade mark database on the final direction yourself.

## Install commands

```bash
# logo-designer (plugin)
claude plugin add neonwatty/logo-designer-skill

# logo-generator (gallery + favicon kit)
git clone https://github.com/qiguangyang/logo-generator-skill
cd logo-generator-skill && ./install.sh

# banana-claude (Gemini image gen)
# /plugin marketplace add AgriciDaniel/banana-claude
# /plugin install banana-claude@banana-claude-marketplace
# free key: https://aistudio.google.com/apikey

# web-asset-generator (favicons/app icons from a finished logo)
git clone https://github.com/alonw0/web-asset-generator ~/.claude/skills/web-asset-generator
```
