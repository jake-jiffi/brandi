---
name: brand-guardian
description: Keep work on brand and catch drift. Checks pages, components, copy and designs against a project's brand system for off-palette colours, off-brand typefaces, banned vocabulary, accessibility failures and the patterns that make output look machine-generated. Use when asked "is this on brand", "check this against our brand", "brand audit", "did we drift", or before shipping anything that carries a brand name. Also use proactively after building UI in a project that has a brand/brand.json. For creating a brand from scratch, use the brand-system skill instead.
---

# Brand guardian

A brand book is a document somebody read once. A brand is a rule that keeps applying. This skill is
the second thing.

## First, find the brand

```bash
ls brand/brand.json
```

If it exists, that project has a Brandi brand system and everything below applies.

If it does not, look for what the project does have: a `tokens.css`, a `tailwind.config.*` theme, a
`theme.ts`, a design-system folder, a Storybook. Check against that instead and say what you used
as the standard. If there is nothing at all, say so plainly and offer `/brandi:brand` rather than
inventing a standard and grading against it.

## Run the check

Resolve the command first. An installed plugin's `bin` reaches PATH only from the session after
install, so the glob matters:

```bash
A="$(command -v brandi || true)"
[ -z "$A" ] && A="$(ls -d "$HOME"/.claude/plugins/cache/*/brandi/*/bin/brandi 2>/dev/null | sort -V | tail -1)"
[ -z "$A" ] && A="<this skill's base directory>/../../bin/brandi"
"$A" check <paths>
```

It reads real source files and reports:

| Finding | Level | Why it matters |
| --- | --- | --- |
| Off-palette colour | error | A colour nobody chose, which nobody will maintain |
| Nearly-palette colour | warn | `#1F6F4B` beside `#1F6F4A` is drift starting |
| Off-brand typeface | warn | Or error, if it is one of the banned defaults |
| Banned vocabulary | warn | The voice guide exists for a reason |
| Focus outline removed | error | Fails WCAG 2.2 2.4.7 Focus Visible outright |
| Lorem ipsum | error | Shipped placeholder text |
| Purple or indigo gradient | warn | The most recognisable machine-generated tell there is |
| Gradient orb | warn | The most over-used signifier in tech design |
| Card with a left accent stripe | warn | The most-generated component on the internet |
| Animation with no reduced-motion handling | info | WCAG 2.2 2.3.3, Level AAA, and a house rule here |

It reports. It does not edit. That is deliberate: the user decides what is a mistake and what is a
choice.

## What the tool cannot see

Run these yourself. They are where the real failures are.

**Is the hierarchy the brand's hierarchy?** The right colours applied in the wrong proportions is
still off brand. If the system says the accent appears once per screen and this screen has eleven
accents, every individual value passes and the page is wrong.

**Does the copy sound like the brand?** Read `voice` in brand.json. Check the tone against the
situation, not just the vocabulary list. A cheerful error message can use no banned words and still
be completely wrong.

**Do the states exist?** Default, hover, active, focus-visible, disabled, loading, empty and error.
Empty and error are where design systems are found out, and they are the two nobody designs.

**Would this be recognisable with the logo removed?** If the answer is no, the distinctive assets
are not being used, and the work is generic even when it is compliant.

**Is anything invented?** Statistics, testimonials, client logos, founding dates, customer counts.
A bracketed placeholder is honest. A plausible-looking fabrication is not, and it will be believed.

## Reporting

Rank by consequence, not by count. Three off-palette hexes in a prototype matter less than one
removed focus outline in production.

For each finding say what is wrong, where, and what to do instead. Separate the ones that are
genuinely wrong from the ones that are defensible, and say which is which. A report that flags
everything equally gets ignored, and then nothing is checked at all.

## When something should change

Sometimes the finding is right and the brand is wrong. Extending a system is normal; drifting is not,
and the only difference is the record.

To extend it deliberately:

1. Add the value to `brand/brand.json`.
2. Add a decision to `governance.decisions` with the reason, and what was rejected.
3. Bump `meta.version`.
4. Regenerate: `brandi tokens && ... book && ... guardian`.

A change nobody wrote down becomes an inconsistency the next person has to guess about.
