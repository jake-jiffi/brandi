# Claude skills for end-to-end brand guidelines

Research notes, 29 August 2026.

## Two things to know first

**Nothing targets `/design` specifically.** Claude Design (the canvas) doesn't have a skills ecosystem yet. Everything in this space is written as a Claude Code / agent skill that outputs self-contained HTML and PDF, which you open in a browser. So you do get visual artifacts, just rendered as files rather than inside the Design canvas.

Anthropic's own repo ([anthropics/skills](https://github.com/anthropics/skills), ~17.9k stars) has `canvas-design` and a `brand-guidelines` skill, but that one just applies Anthropic's own colours and type. It is not a generator.

**Traction and "real brand book" don't overlap.** The 500–800 star repos are mostly design-system-for-code tools: they extract tokens from an existing site so your AI builds on-brand UI. The ones that actually produce logo rules, clear space, misuse pages, voice do/don'ts and product mockups are new and near zero stars.

## The shortlist

| Repo | Stars | What it outputs |
|---|---|---|
| [dominikmartn/hue](https://github.com/dominikmartn/hue) | 813 | Learns a brand from a URL, name or screenshot; outputs `design-model.yaml` + rendered landing page, component library, app screens. 17 worked examples you can open in a browser. Design system, not a brand book. |
| [rampstackco/claude-skills](https://github.com/rampstackco/claude-skills) | 783 | 103 skills across brand, design, content, SEO, dev. Installs as a plugin marketplace. Includes logo design. Broad rather than deep. |
| [ItsssssJack/power-design](https://github.com/ItsssssJack/power-design) | 643 | Brand DNA pulled from a URL, plus 20 codified slide rules and 20 web rules, into HTML decks and sites. Best for making the guidelines document itself look non-AI. |
| [arnabbagxd/Brand-building-skills](https://github.com/arnabbagxd/Brand-building-skills) | 581 | Strategy, naming, positioning, voice, messaging, brand-guidelines. Thorough thinking, but markdown only. No visuals. |
| [echowang97/brandbook-skill](https://github.com/echowang97/brandbook-skill) | 4 | Closest to the brief. URL or screenshots in; out comes a browsable `brandbook.html` with palettes, type specimens, logo rules, voice do/don't pairs, imagery treatments, plus social card, slide cover and email mockups. Renders deterministically from YAML so it's cheap to re-run. |
| [AbdulkareemKR/brand-identity-generator](https://github.com/AbdulkareemKR/brand-identity-generator) | 1 | A 10–45 slide 16:9 guidelines deck as HTML and PDF, plus AI product mockups with your real logo composited in (cups, packaging, storefronts, uniforms, business cards). Needs a Gemini key for the mockups. Full worked example deck in `examples/terra`. |

### Also seen, lower priority

| Repo | Stars | Note |
|---|---|---|
| [SpaceZephyr/brand-design-md](https://github.com/SpaceZephyr/brand-design-md) | 108 | Design language of 62 world-class brands, on demand. Reference material rather than a generator. |
| [cofoundy/brand-skills](https://github.com/cofoundy/brand-skills) | 25 | 15 skills, idea to brand book, saved as a reusable `brand.yaml`. Text-led. |
| [designrique/ai-graphic-design-skill](https://github.com/designrique/ai-graphic-design-skill) | 22 | Logos and visual assets via AI image tools; prompt engineering focused. |

## What I'd actually do

Look at the two low-star ones first, since they're the only ones that produce a document a client would recognise as brand guidelines. Both ship example output in the repo, so you can judge the visual quality in about two minutes without installing anything. The Terra example deck in particular is the honest test of whether the output is client-presentable.

For You Dirty Dog specifically, the shape fits well: there's an existing logo and a Facebook/Instagram back catalogue to feed in as source material, and the brand book output would then drive the site build rather than being a separate exercise.

- `brand-identity-generator` gives you the deck to hand over.
- `hue` gives you the tokens the site is actually built from.

Running both isn't unreasonable.

## Caution

These are one-person repos, some with a single commit, and they run scripts locally. Read the `SKILL.md` before installing.

## Install commands

```bash
# hue
git clone https://github.com/dominikmartn/hue ~/.claude/skills/hue

# brandbook
git clone https://github.com/echowang97/brandbook-skill ~/.claude/skills/brandbook
cd ~/.claude/skills/brandbook && npm i yaml

# brand-identity-generator
git clone https://github.com/AbdulkareemKR/brand-identity-generator.git \
  ~/.claude/skills/brand-identity

# rampstack (plugin marketplace, run inside Claude Code)
# /plugin marketplace add rampstackco/claude-skills
# /plugin install rampstack-skills@rampstack
```
