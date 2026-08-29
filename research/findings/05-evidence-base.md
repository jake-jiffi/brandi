# Evidence base for a brand and design-system skill

Compiled 29 August 2026. Every substantive claim carries a source URL. Where a widely repeated
claim turns out to be untraceable or misattributed, it is filed under **Claims register** at the end
rather than repeated as fact.

## How to read the confidence tags

| Tag | Meaning |
| --- | --- |
| `[SPEC]` | Normative text in a published standard or specification. Quote it, do not paraphrase loosely. |
| `[PUBLISHED]` | Documented convention from a named, citable organisation. Real practice, not law. |
| `[EMPIRICAL]` | Backed by peer-reviewed or institutional research with a traceable method. |
| `[CONVENTION]` | Widespread industry practice with a traceable origin but no formal authority. |
| `[CONTESTED]` | Genuine disagreement among credible sources. Present both sides. |
| `[FOLKLORE]` | Circulates widely, does not survive tracing. Do not assert. |

---

# 1. Design tokens

## 1.1 The DTCG format specification: current status

`[SPEC]` The Design Tokens Community Group (DTCG) is a **W3C Community Group**, not a W3C Working
Group. Its output is a Community Group Report, explicitly **not a W3C Standard and not on the W3C
Standards Track**.

- Community group home: <https://www.w3.org/community/design-tokens/>
- Current draft: **Design Tokens Format Module 2025.10**, Draft Community Group Report,
  dated **30 July 2026**: <https://www.designtokens.org/TR/drafts/format/>
- Companion Color module: <https://www.designtokens.org/TR/drafts/color/>
- Third Editors' Draft (20 July 2025), the version most tools implemented against:
  <https://www.designtokens.org/tr/third-editors-draft/format/>

Both drafts carry explicit warnings. The 2025.10 draft states: *"This is a preview. Do not attempt to
implement this version of the specification. Do not reference this version as authoritative in any
way."* The Third Editors' Draft says it is *"unstable, and should not be implemented."*

**What the skill should do with this:** treat DTCG as the interchange target because the tooling
ecosystem has converged on it, but say plainly that it is a moving draft, pin the `$schema` version
in generated files, and expect churn. Do not describe it as "the W3C design token standard".

## 1.2 Reserved properties

`[SPEC]` All reserved keys are `$`-prefixed. Token and group names **MUST NOT** begin with `$`, and
**MUST NOT** contain `{`, `}` or `.`.

| Property | Applies to | Required | Purpose |
| --- | --- | --- | --- |
| `$value` | tokens | Yes | The token's data. Presence of `$value` is what makes a node a token rather than a group. |
| `$type` | tokens, groups | Effectively yes | Declares permissible value syntax. Inherited from the nearest ancestor group that sets it. If no explicit type can be resolved, tools **MUST** consider the token invalid and **MUST NOT** infer a type from the value. |
| `$description` | tokens, groups | No | Plain-text explanation. |
| `$extensions` | tokens, groups | No | Vendor data, keyed by reverse-domain notation. |
| `$deprecated` | tokens, groups | No | `true`, or a string giving the reason and replacement. |
| `$extends` | groups only | No | Inherits tokens from another group by deep merge. Circular extension is prohibited. |

Source: <https://www.designtokens.org/TR/drafts/format/>

Groups are containers, identified by the *absence* of `$value`. The spec is explicit that
*"Groups are arbitrary and tools SHOULD NOT use them to infer the type or purpose"* of the tokens
inside. `$root` is a reserved token name for a group's own base value. A node cannot both hold a
`$value` and contain child tokens.

## 1.3 Aliases and references

`[SPEC]` Two syntaxes:

1. **Curly-brace reference** for whole-token aliasing: `"{group.subgroup.token}"`. Resolves to the
   complete `$value` of the target.
2. **JSON Pointer** (`$ref: "#/path/to/target"`, per RFC 6901) for property-level references inside
   composite values.

Circular references are prohibited. An alias with no `$type` of its own takes the resolved type of
its target.

## 1.4 Type catalogue

`[SPEC]` Every token must use one of these types.

**Simple types**

| `$type` | `$value` shape |
| --- | --- |
| `color` | Object: `colorSpace`, `components`, optional `alpha`, optional `hex`. See §1.5. |
| `dimension` | `{ "value": <number>, "unit": "px" \| "rem" }`. Only those two units. |
| `duration` | `{ "value": <number>, "unit": "ms" \| "s" }` |
| `fontFamily` | String, or array of strings (fallback stack) |
| `fontWeight` | Number 1–1000, or a keyword (`thin`, `light`, `normal`, `bold`, `black`, and the rest of the CSS-aligned set) |
| `cubicBezier` | Four-number array `[P1x, P1y, P2x, P2y]` |
| `number` | Plain JSON number |

The spec notes `px` means an idealised viewport pixel, whose equivalents are `dp` on Android and
`pt` on iOS, so translation tools should convert accordingly.

**Composite types**

| `$type` | `$value` shape |
| --- | --- |
| `strokeStyle` | Either a keyword string (`solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `outset`, `inset`) or `{ "dashArray": [<dimension>…], "lineCap": "round" \| "butt" \| "square" }` |
| `border` | `{ "color", "width" (dimension), "style" (strokeStyle) }` |
| `transition` | `{ "duration", "delay", "timingFunction" (cubicBezier) }` |
| `shadow` | A single shadow object, **or an array** of them: `{ "color", "offsetX", "offsetY", "blur", "spread" }` |
| `gradient` | Array of stops: `{ "color", "position" }` where `position` is a number in `[0, 1]`, clamped if outside. If no stop sits at 0 or 1, the nearest stop's colour extends to that end. |
| `typography` | `{ "fontFamily", "fontSize" (dimension), "fontWeight", "letterSpacing" (dimension), "lineHeight" (number) }` |

Note the typography type takes `letterSpacing` as a **dimension** and `lineHeight` as a **unitless
number**. That is a useful constraint: it forces line-height to be expressed as a ratio, which is
also what accessibility guidance wants (see §3.4).

## 1.5 The colour type (the biggest breaking change)

`[SPEC]` Colour is no longer a hex string. It is an object with an explicit colour space.

```json
{
  "$type": "color",
  "$value": {
    "colorSpace": "srgb",
    "components": [1, 0, 1],
    "alpha": 1,
    "hex": "#ff00ff"
  }
}
```

Fourteen colour spaces are allowed, with these component ranges
(<https://www.designtokens.org/TR/drafts/color/>):

| `colorSpace` | Components and ranges |
| --- | --- |
| `srgb`, `srgb-linear`, `display-p3`, `a98-rgb`, `prophoto-rgb`, `rec2020` | R, G, B each `[0, 1]` |
| `hsl` | H `[0, 360)`, S `[0, 100]`, L `[0, 100]` |
| `hwb` | H `[0, 360)`, W `[0, 100]`, B `[0, 100]` |
| `lab` | L `[0, 100]`, a and b unbounded |
| `lch` | L `[0, 100]`, C `[0, ∞)`, H `[0, 360)` |
| `oklab` | L `[0, 1]`, a and b unbounded |
| `oklch` | L `[0, 1]`, C `[0, ∞)`, H `[0, 360)` |
| `xyz-d65`, `xyz-d50` | X, Y, Z each `[0, 1]` |

A component may be the string `"none"`, meaning missing or not applicable. This is not the same as
`0`: in HSL, hue `"none"` and hue `0` interpolate differently.

**Practical consequence for the skill:** because `oklch` is a first-class DTCG colour space, a
perceptually generated palette (§2.4) can be stored losslessly in tokens, with `hex` carried
alongside as a fallback for tools and older targets.

## 1.6 File conventions

`[SPEC]` Media type `application/design-tokens+json` (or `application/json`). Recommended file
extensions `.tokens` or `.tokens.json`. Files are valid JSON per RFC 8259. The 2025.10 examples
carry `"$schema": "https://www.designtokens.org/schemas/2025.10/format.json"`.

## 1.7 A complete, correct example

Written against 2025.10. Demonstrates groups, `$type` inheritance, aliases, composites, deprecation
and extensions.

```json
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",

  "palette": {
    "$type": "color",
    "$description": "Tier 1. Primitive values. Never referenced directly by components.",
    "blue": {
      "500": {
        "$value": {
          "colorSpace": "oklch",
          "components": [0.55, 0.19, 253],
          "alpha": 1,
          "hex": "#0b64d4"
        }
      },
      "900": {
        "$value": {
          "colorSpace": "oklch",
          "components": [0.27, 0.09, 253],
          "hex": "#0a2c56"
        }
      }
    },
    "neutral": {
      "000": { "$value": { "colorSpace": "srgb", "components": [1, 1, 1], "hex": "#ffffff" } },
      "900": { "$value": { "colorSpace": "srgb", "components": [0.07, 0.08, 0.09], "hex": "#121517" } }
    }
  },

  "size": {
    "$type": "dimension",
    "$description": "Tier 1. 4 px base step.",
    "0": { "$value": { "value": 0, "unit": "px" } },
    "1": { "$value": { "value": 0.25, "unit": "rem" } },
    "2": { "$value": { "value": 0.5, "unit": "rem" } },
    "4": { "$value": { "value": 1, "unit": "rem" } },
    "6": { "$value": { "value": 1.5, "unit": "rem" } }
  },

  "font": {
    "family": {
      "$type": "fontFamily",
      "sans": { "$value": ["Inter", "system-ui", "sans-serif"] }
    },
    "weight": {
      "$type": "fontWeight",
      "regular": { "$value": 400 },
      "bold": { "$value": 700 }
    }
  },

  "colour": {
    "$type": "color",
    "$description": "Tier 2. Semantic. Points at tier 1, is what components consume.",
    "surface": {
      "page": { "$value": "{palette.neutral.000}" },
      "inverse": { "$value": "{palette.neutral.900}" }
    },
    "text": {
      "default": { "$value": "{palette.neutral.900}" },
      "on-inverse": { "$value": "{palette.neutral.000}" }
    },
    "action": {
      "default": { "$value": "{palette.blue.500}" },
      "hover": { "$value": "{palette.blue.900}" }
    },
    "brand-primary": {
      "$value": "{palette.blue.500}",
      "$deprecated": "Renamed. Use {colour.action.default}. Removed in v3.0."
    }
  },

  "space": {
    "$type": "dimension",
    "inset-sm": { "$value": "{size.2}" },
    "inset-md": { "$value": "{size.4}" },
    "stack-md": { "$value": "{size.6}" }
  },

  "type": {
    "$type": "typography",
    "body": {
      "$value": {
        "fontFamily": "{font.family.sans}",
        "fontSize": { "value": 1, "unit": "rem" },
        "fontWeight": "{font.weight.regular}",
        "letterSpacing": { "value": 0, "unit": "px" },
        "lineHeight": 1.5
      },
      "$description": "lineHeight 1.5 satisfies WCAG 1.4.12 without user override."
    }
  },

  "elevation": {
    "$type": "shadow",
    "raised": {
      "$value": [
        {
          "color": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0.08 },
          "offsetX": { "value": 0, "unit": "px" },
          "offsetY": { "value": 1, "unit": "px" },
          "blur": { "value": 2, "unit": "px" },
          "spread": { "value": 0, "unit": "px" }
        },
        {
          "color": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0.06 },
          "offsetX": { "value": 0, "unit": "px" },
          "offsetY": { "value": 4, "unit": "px" },
          "blur": { "value": 12, "unit": "px" },
          "spread": { "value": -2, "unit": "px" }
        }
      ]
    }
  },

  "motion": {
    "easing": {
      "$type": "cubicBezier",
      "standard": { "$value": [0.2, 0, 0, 1] }
    },
    "duration": {
      "$type": "duration",
      "fast": { "$value": { "value": 150, "unit": "ms" } }
    },
    "transition": {
      "$type": "transition",
      "control": {
        "$value": {
          "duration": "{motion.duration.fast}",
          "delay": { "value": 0, "unit": "ms" },
          "timingFunction": "{motion.easing.standard}"
        }
      }
    }
  },

  "button": {
    "$description": "Tier 3. Component tokens. Point at tier 2 only.",
    "primary": {
      "background": { "$type": "color", "$value": "{colour.action.default}" },
      "label": { "$type": "color", "$value": "{colour.text.on-inverse}" },
      "padding-inline": { "$type": "dimension", "$value": "{space.inset-md}" },
      "border": {
        "$type": "border",
        "$value": {
          "color": "{colour.action.default}",
          "width": { "value": 1, "unit": "px" },
          "style": "solid"
        }
      }
    }
  }
}
```

## 1.8 Style Dictionary

`[PUBLISHED]` Style Dictionary is the de facto build tool for turning token JSON into platform
artefacts.

- DTCG support page: <https://styledictionary.com/info/dtcg/>. First-class DTCG support landed in
  **v4**; **v5** is current. The page states the *"latest format 2025.10 does not have full support
  yet in Style Dictionary. This is a work in progress in v5."*
- Legacy format uses `value` / `type` / `description`; DTCG uses `$value` / `$type` / `$description`,
  and moves `type` declarations down from groups to individual tokens. Style Dictionary ships a
  converter that renames the keys but deliberately does **not** rewrite type *values* (it will not
  turn `"size"` into `"dimension"` for you).
- Config anatomy: `source` (token globs), `platforms` (each with `transformGroup`, `buildPath`,
  `files`, and per-file `format`): <https://styledictionary.com/getting-started/using_the_npm_module/>
- Predefined transform groups:
  <https://styledictionary.com/reference/hooks/transform-groups/predefined/>

| Transform group | Naming | Typical output |
| --- | --- | --- |
| `css`, `scss`, `less` | kebab-case | Custom properties / variables, with font-family, cubic-bezier and shorthand transforms |
| `web` | kebab-case | px sizes, CSS colours |
| `js` | PascalCase | rem sizes, hex colours |
| `android` | snake_case | Android colour and size resources |
| `compose` | camelCase | Kotlin, `sp` / `dp` / `em` conversions |
| `ios`, `ios-swift` | PascalCase / camelCase | `UIColor`, `UIColorSwift` |
| `flutter`, `flutter-separate` | camelCase | hex8 colours, doubles |
| `react-native` | camelCase | object sizing, CSS colours |
| `assets` | minimal | CTI attributes only |

The `-separate` variants group tokens by category without repeating the category in the name.

**Naming implication:** because transform groups rewrite case per platform, the token *source* names
should be plain, lowercase, dot-separated and free of platform assumptions. Encode meaning in the
path, not in casing.

## 1.9 Naming taxonomy: Nathan Curtis

`[PUBLISHED]` The canonical treatment is Nathan Curtis (EightShapes):

- *Naming Tokens in Design Systems* (October 2020):
  <https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676>
  (mirror, if Medium blocks: <https://blog.bakarema.com/2022/10/05/naming-tokens-in-design-systems-terms-types-and-taxonomy-to-describe-by-nathan-curtis-eightshapes/>)
- *Reimagining a Token Taxonomy* (2022):
  <https://medium.com/eightshapes-llc/reimagining-a-token-taxonomy-462d35b2b033>
- *Tokens in Design Systems* (10 tips):
  <https://medium.com/eightshapes-llc/tokens-in-design-systems-25dd82d58421>

Curtis's four level-groups, in his own terms:

**Namespace** (goes first)
- System (e.g. `esds`, `slds`)
- Theme (e.g. `ocean`, `courtyard`)
- Domain (business unit, e.g. `consumer`, `retail`)

**Object** (subordinate to namespace, establishes context)
- Component group (e.g. `forms`)
- Component (e.g. `input`, `button`)
- Element (nested part, e.g. `left-icon`)

**Base** (the backbone, in the middle)
- Category (e.g. `color`, `font`, `space`)
- Concept (e.g. `feedback`, `action`, `heading`)
- Property (e.g. `text`, `background`, `size`)

**Modifier** (appended last)
- Variant (e.g. `primary`, `success`, `error`)
- State (e.g. `hover`, `focus`, `disabled`)
- Scale (enumerated `1–5`, ordered `50–900`, or proportional `2-x`)
- Mode (e.g. `on-light`, `on-dark`)

His own examples: `$esds-color-neutral-42`, `$esds-space-1-x`,
`$esds-color-feedback-background-error`, `$color-action-text-secondary-focus`,
`$esds-input-color-border`, `$esds-forms-color-border`.

Curtis is explicit that *"there's no prevailing token level order"*. The value of the taxonomy is
that a team picks an order and applies it consistently, not that one order is correct.

## 1.10 Three-tier token architecture

`[PUBLISHED]` The primitive → semantic → component pattern is documented by the two largest
enterprise systems.

- **Salesforce Lightning** distinguishes global, alias and component tokens:
  <https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/tokens_intro.htm>
  and <https://developer.salesforce.com/docs/platform/lwc/guide/create-components-css-design-tokens.html>
- **Adobe Spectrum** uses global tokens (`spectrum-global-color-blue-500`) and alias tokens
  (`spectrum-alias-background-color-default`), with per-component CSS custom properties on top:
  <https://www.npmjs.com/package/@adobe/spectrum-tokens>. The Spectrum Design Data RFC describes a
  richer model where a token name object carries semantic fields (property, component, structure,
  anatomy, variant, state, size, shape) and *dimension* fields that act as cascade axes
  (colorScheme, scale, contrast), layered Foundation < Platform < Product:
  <https://github.com/adobe/spectrum-design-data/discussions/714>

| Tier | Also called | Named by | References | Example |
| --- | --- | --- | --- | --- |
| 1 | Primitive, global, reference, core | The value itself | Nothing | `palette.blue.500` |
| 2 | Semantic, alias, decision | Purpose in the UI | Tier 1 | `colour.action.default` |
| 3 | Component | Component and part | Tier 2 | `button.primary.background` |

The rule that makes it work: **tier 3 never references tier 1**, and product code never references
tier 1. That is what makes theming and dark mode a swap of tier 2 rather than a rewrite. The
zeroheight write-up frames the semantic layer as the theme layer for exactly this reason:
<https://zeroheight.com/learn/how-design-tokens-work-types-structure-and-hierarchy/>

`[CONTESTED]` Three tiers is not universally right. Small systems frequently ship two tiers and add
component tokens only where a component genuinely needs an override. Adding tier 3 for every
component multiplies token count without adding expressive power. The skill should default to two
tiers plus targeted component tokens, and justify tier 3 by need.

---

# 2. Colour

## 2.1 WCAG 2.2 contrast requirements

`[SPEC]` WCAG 2.2 is a **W3C Recommendation dated 12 December 2024**:
<https://www.w3.org/TR/WCAG22/>. The contrast numbers are unchanged from WCAG 2.0 and 2.1.

**1.4.3 Contrast (Minimum) (Level AA)**
<https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum>

> "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1"

Exceptions, verbatim:
- **Large Text:** "Large-scale text and images of large-scale text have a contrast ratio of at least 3:1"
- **Incidental:** "Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement."
- **Logotypes:** "Text that is part of a logo or brand name has no contrast requirement."

**Large scale (text)** is defined in the WCAG glossary as *"at least 18 point or 14 point bold or
font size that would yield equivalent size for Chinese, Japanese and Korean (CJK) fonts"*.
`[CONVENTION]` The near-universal CSS translation is **24 px regular / 18.66 px bold**, derived from
the 1pt = 1.333px ratio. That conversion is convention, not spec text.

**1.4.6 Contrast (Enhanced) (Level AAA)**: 7:1 normal, 4.5:1 large. Same exceptions.

**1.4.11 Non-text Contrast (Level AA)**
<https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html>

> "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s): User Interface Components … Graphical Objects"

This is the one brands most often trip over. It catches input borders, toggle states, focus rings,
icon-only buttons, chart series, and the boundary of any control the user must perceive to operate.

**The logo exemption is a trap.** A logo is exempt from 1.4.3. It is not exempt from being legible,
and any *text set in the brand typeface next to the logo* is fully in scope. Guidance for the skill:
never use the logo exemption to justify a low-contrast brand colour anywhere other than the mark
itself.

## 2.2 APCA and WCAG 3: current status

`[CONTESTED]` `[SPEC-adjacent]` As of April 2026, **WCAG 3 has no chosen contrast algorithm**, and
APCA is not in the specification.

- Adrian Roselli's status review, April 2026:
  <https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html>. The WCAG 3 Editor's
  Draft states: *"The contrast algorithm used in WCAG 3 is yet to be determined."* APCA was marked
  for removal in early 2023 and excluded from the July 2023 working draft after failing to gain
  Working Group support. Roselli's estimate for WCAG 3 completion is *"perhaps 2030 at the soonest"*.
- APCA's own documentation: <https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html>
  and <https://git.apcacontrast.com/documentation/minimum_compliance.html>

APCA outputs a lightness contrast value **Lc** on a scale of roughly 0 to ±106. Positive Lc means
dark text on light; negative means light on dark. Published thresholds:

| Lc | Use |
| --- | --- |
| 90 | Preferred for body text and columns of fluent text (min 18px/300 or 14px/400) |
| 75 | Minimum for body text columns (24px/300, 18px/400, 16px/500, 14px/700) |
| 60 | Minimum for non-body content text (no smaller than 48px/200, 36px/300, 24px/400) |
| 45 | Minimum for headlines and large, heavy text |
| 30 | Absolute minimum for other text: spot-readable, placeholder, disabled |
| 15 | Absolute minimum for non-semantic elements. Below this, treat as invisible. |

APCA's stated critique of WCAG 2 is that it *"overstates contrast for dark colors to the point that
4.5:1 can be functionally unreadable when one of the colors in a pair is near black"*, which is why
dark-mode palettes that pass 2.x can still read badly.

**Recommendation for the skill:** conform to WCAG 2.2 as the legal and testable baseline (it is what
EN 301 549 and every automated tool measures). Use APCA as a *secondary* sanity check, especially for
dark mode and for large display type where 2.x is over-permissive. Never present APCA as a
requirement or as "WCAG 3". If a colour fails 2.x but passes APCA, Roselli's advice is to document
the decision and prepare a response to the automated finding, not to ignore it.

## 2.3 Colour vision deficiency: prevalence and safe pairing

`[EMPIRICAL]` NHS: colour vision deficiency *"affects approximately 1 in 12 men (8%) and 1 in 200
women (0.5%)"*: <https://www.nhs.uk/conditions/colour-vision-deficiency/>. Colour Blind Awareness
puts the worldwide figure at roughly **300 million people**, and around 3 million in the UK
(about 4.5% of the population): <https://www.colourblindawareness.org/colour-blindness/>

Red-green deficiencies account for the overwhelming majority of cases; **deuteranomaly** (reduced
green sensitivity) is the single most common type, at roughly 5% of men.

The UK Space Agency brand guidelines quote the same figures as a design constraint, which is a useful
precedent for putting this in a brand book rather than only in an engineering doc:
<https://assets.publishing.service.gov.uk/media/62c810a9d3bf7f2fffd66c43/2022_brand_guidelines.pdf>

**Safe pairing rules**

1. `[SPEC]` Never encode information by hue alone. WCAG 1.4.1 Use of Color (Level A) requires that
   colour is not the only visual means of conveying information, indicating an action, prompting a
   response, or distinguishing a visual element: <https://www.w3.org/TR/WCAG22/>
2. `[CONVENTION]` Separate categories by **lightness** as well as hue. Two colours with similar
   luminance collapse into the same grey under simulation. The greyscale-print test in the UK Space
   Agency guidelines is a good low-tech check: *"A quick way to check contrast is to view or print
   the design in black and white or greyscale."*
3. `[EMPIRICAL]` For categorical data, use the **Okabe-Ito** palette, created by Masataka Okabe and
   Kei Ito for the Color Universal Design project and popularised by Bang Wong in *Nature Methods*
   (2011). Eight colours designed to stay distinguishable under all common CVD types:
   Orange `#E69F00`, Sky Blue `#56B4E9`, Bluish Green `#009E73`, Yellow `#F0E442`, Blue `#0072B2`,
   Vermillion `#D55E00`, Reddish Purple `#CC79A7`, Black `#000000`.
   Reference: <https://thenode.biologists.com/data-visualization-with-flying-colors/research/>
4. `[CONVENTION]` Avoid red/green as the sole success/error signal. Pair with icon shape and text.
5. `[CONVENTION]` Avoid green/brown, blue/purple, and light-green/yellow adjacencies in charts.

## 2.4 OKLCH, CSS Color 4, and why perceptual uniformity matters

`[SPEC]` `oklch()` is part of CSS Color Module Level 4. Browser support as of 2026:
**93.26% global**, with Chrome 111, Edge 111, Firefox 113, Safari 15.4:
<https://caniuse.com/mdn-css_types_color_oklch>. The related `color()` function sits at ~93.5%:
<https://caniuse.com/css-color-function>

**Why it matters for palette generation.** HSL and HSV are not perceptually uniform: a fixed
lightness value produces wildly different perceived brightness across hues (HSL yellow at L=50% looks
far brighter than HSL blue at L=50%), and a 10% lightness step looks larger in the dark end of a
ramp than in the light end. That is why a hand-built HSL tint/shade ramp always has one or two steps
that look wrong, and why brand palettes generated by naive `lighten()`/`darken()` functions go muddy.

Oklab/OKLCH were designed so that equal numeric changes produce roughly equal perceived changes.
Consequences for a brand system:

- One set of L values produces a tonally *balanced* ramp across every hue in the palette, so the
  brand's blue-500 and its orange-500 actually read as the same weight.
- Contrast behaviour becomes predictable enough to design against before testing.
- Relative colour syntax lets a whole state set derive from one brand token, e.g.
  `oklch(from var(--brand) calc(l - 0.08) c h)` for a hover state.
- Tailwind v4 ships its default palette in OKLCH.

References: Evil Martians, *OKLCH in CSS: why we moved from RGB and HSL*
<https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl>; CSS-Tricks almanac
<https://css-tricks.com/almanac/functions/o/oklch/>; Oklab background
<https://en.wikipedia.org/wiki/Oklab_color_space>

**Caveat:** perceptual uniformity is not the same as accessible. OKLCH lightness correlates with
perceived lightness, but WCAG 2.x contrast is computed from sRGB relative luminance, so an evenly
spaced OKLCH ramp still needs contrast testing at each pair. Also, chroma is unbounded and many
OKLCH values are out of sRGB gamut; always check gamut and provide a hex fallback.

## 2.5 Building an accessible tonal palette

Two documented approaches, both worth knowing.

### 2.5.1 Material 3 HCT tonal palettes

`[PUBLISHED]` Material 3 introduced **HCT** (hue, chroma, tone), where tone is the accessibility
lever. Each key colour expands to a tonal palette of **13 tones: 0, 10, 20, 30, 40, 50, 60, 70, 80,
90, 95, 99, 100**, where 0 is black and 100 is white.

The critical documented property: tones are distributed so that

- a difference of **40 or more** in tone yields a contrast ratio of **3:1 or higher**
- a difference of **50 or more** yields **4.5:1 or higher**

Colour roles then map to tones per theme, so `primary` is tone 40 in light theme and tone 80 in dark
theme, with `on-primary` positioned to keep the pairing above threshold in both.

Sources: <https://developer.android.com/design/ui/mobile/guides/styles/color>;
<https://github.com/material-foundation/material-color-utilities/>;
<https://www.npmjs.com/package/@material/material-color-utilities>

This is the single most useful reusable rule in the whole colour section: **if your ramp is built on
a perceptual tone axis, "tone delta ≥ 50" becomes a design-time proxy for 4.5:1**, which lets a
generator reason about contrast without testing every pair.

### 2.5.2 Radix Colors 12-step scale

`[PUBLISHED]` Radix defines a 12-step scale where each step has a *job*, not just a lightness:
<https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale>

| Step | Documented use |
| --- | --- |
| 1 | App background |
| 2 | Subtle background |
| 3 | UI element background |
| 4 | Hovered UI element background |
| 5 | Active / Selected UI element background |
| 6 | Subtle borders and separators |
| 7 | UI element border and focus rings |
| 8 | Hovered UI element border |
| 9 | Solid backgrounds |
| 10 | Hovered solid backgrounds |
| 11 | Low-contrast text |
| 12 | High-contrast text |

Notes the docs make explicit:
- Step 9 has the **highest chroma** in the scale. It is the purest step, mixed with the least white
  or black, and is the natural home for a brand's signature colour.
- Steps 11 and 12 are guaranteed to hit **Lc 60 and Lc 90 (APCA)** respectively against a step 2
  background from the same scale.
- Radix ships 30-plus scales, each with a matching dark-mode scale, an **alpha** variant
  (*"handy for UI components that need to blend into colored backgrounds"*) and a **P3 wide-gamut**
  variant that *"accounts for the blending differences in the wide gamut color spaces"*:
  <https://www.radix-ui.com/colors> and
  <https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette>
- The step semantics hold across light and dark, which is the property that makes the scale worth
  copying: a semantic token bound to "step 3" keeps meaning the same thing in both themes.

**Recommendation for the skill:** generate ramps in OKLCH, assign step *semantics* using the Radix
12-step vocabulary (because it maps directly onto the semantic token tier), and use the Material tone
delta rules as the generation constraint. Then verify every documented pairing against WCAG 2.2.

---

# 3. Typography

## 3.1 Modular scale: provenance

`[CONVENTION]` The idea is old (Renaissance proportion, musical intervals, Le Corbusier's Modulor),
but the web-typography lineage is specific and citable:

- **Robert Bringhurst**, *The Elements of Typographic Style* is the reference text designers cite for
  proportional type sizing. The web-adapted companion is *The Elements of Typographic Style Applied
  to the Web*: <http://webtypography.net/>
- **Tim Brown**, *More Meaningful Typography*, A List Apart (2011) is the article that put modular
  scales into web practice: <https://alistapart.com/article/more-meaningful-typography/>. Brown's
  framing: a modular scale is *"a sequence of numbers that relate to one another in a meaningful
  way"*, and using one is *"one way to make more conscious, meaningful choices about measurement on
  the web"*.
- **Tim Brown and Scott Kellum** built modularscale.com, which is where most teams first met the
  ratio names: <https://www.modularscale.com/>

Common ratios and their musical names:

| Ratio | Name | Character |
| --- | --- | --- |
| 1.067 | Minor second | Barely a step. Dense editorial. |
| 1.125 | Major second | Very tight. Data-dense UI. |
| 1.200 | Minor third | Restrained. Good default for product UI. |
| 1.250 | Major third | Clear but calm. Good default for marketing sites. |
| 1.333 | Perfect fourth | Distinct hierarchy. The most common web default. |
| 1.414 | Augmented fourth | ISO paper ratio (√2). |
| 1.500 | Perfect fifth | Dramatic. Few steps before it gets huge. |
| 1.618 | Golden ratio | Very dramatic. Editorial and display work only. |

`[CONTESTED]` The claim that the golden ratio is *inherently* more pleasing has no strong empirical
support and is best treated as an aesthetic tradition rather than a fact. Also worth stating: a pure
modular scale generates fractional pixel values that fight a spacing grid. Practical systems round to
the grid and accept that the scale is a starting point, not a constraint. See Chris Krycho,
*Modular scales: fantastic, but don't overdo it*:
<https://v3.chriskrycho.com/web/modular-scales-fantastic-but-dont-overdo-it/index.html>

## 3.2 Measure (line length)

`[CONVENTION]` **45 to 75 characters per line**, with 66 as the frequently cited ideal for a
single-column page in a serifed text face. The source is Bringhurst, *The Elements of Typographic
Style*, restated for the web at <http://webtypography.net/2.1.2>

`[SPEC]` WCAG puts a hard ceiling on it at AAA. **SC 1.4.8 Visual Presentation (Level AAA)** requires
a mechanism by which *"Width is no more than 80 characters or glyphs (40 if CJK)"*:
<https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html>

`[PUBLISHED]` The UK Space Agency accessibility page states *"Around 70 characters per line,
inclusive of spaces, is acceptable"*, which is a useful real-world midpoint from a government brand
book.

Practical CSS: `max-width: 65ch` on body copy gets you inside the range in most faces without
hard-coding a pixel width.

## 3.3 The other four rules from WCAG 1.4.8

`[SPEC]` SC 1.4.8 (AAA) is the most under-used typography spec in existence. Full requirement:

> "For the visual presentation of blocks of text, a mechanism is available to achieve the following:
> • Foreground and background colors can be selected by the user.
> • Width is no more than 80 characters or glyphs (40 if CJK).
> • Text is not justified (aligned to both the left and the right margins).
> • Line spacing (leading) is at least space-and-a-half within paragraphs, and paragraph spacing is at least 1.5 times larger than the line spacing.
> • Text can be resized without assistive technology up to 200 percent in a way that does not require the user to scroll horizontally to read a line of text on a full-screen window."

Note the anti-justification rule. The UK Space Agency book independently reaches the same conclusion:
*"Avoid justified text. Type ranged left with a ragged right margin is easier to read than justified
type."*

## 3.4 WCAG 1.4.12 Text Spacing

`[SPEC]` **SC 1.4.12 Text Spacing (Level AA)**:
<https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html>

> "No loss of content or functionality occurs by setting all of the following:
> • Line height (line spacing) to at least 1.5 times the font size;
> • Spacing following paragraphs to at least 2 times the font size;
> • Letter spacing (tracking) to at least 0.12 times the font size;
> • Word spacing to at least 0.16 times the font size."

Two things a brand system must get right here:

1. This is a **resilience** requirement, not a styling requirement. The page does not have to *ship*
   1.5 line height; it has to **survive** a user forcing it. Fixed-height buttons, `overflow: hidden`
   containers and single-line labels are the usual failures.
2. Because it is a multiplier of font size, **express line-height unitless** (`line-height: 1.5`, and
   in DTCG a `number`, not a `dimension`). A `px` line-height breaks the relationship.

`[CONVENTION]` Practical line-height guidance beyond the floor: 1.5 for body copy at normal measure;
1.6 to 1.7 for long measures above 75 characters; 1.2 to 1.3 for display headings, where the same
ratio would look loose. Tighten as size increases, loosen as measure increases.

## 3.5 Optical sizing and variable fonts

`[SPEC]` OpenType defines five **registered** variation axes, tagged in lowercase:

| Tag | Axis | CSS mapping | Range |
| --- | --- | --- | --- |
| `wght` | Weight | `font-weight` | 1–1000 |
| `wdth` | Width | `font-stretch` (% of normal, commonly 50–200) | |
| `slnt` | Slant | `font-style: oblique <deg>` | degrees, zero or negative |
| `ital` | Italic | `font-style` | 0 or 1 |
| `opsz` | Optical size | `font-optical-sizing` | design-specific |

Custom axes use **uppercase** tags (`GRAD`, `MONO`, `CASL`, `SOFT`, `WONK`) and require
`font-variation-settings`. Sources: <https://web.dev/articles/variable-fonts>;
<https://github.com/microsoft/OpenTypeDesignVariationAxisTags/blob/master/BackgroundOnAxes.md>

**Optical sizing** is the axis brands most often ignore and most benefit from. Optically sized faces
render small text with thicker strokes, larger apertures and more generous spacing, and large display
text with finer hairlines and higher contrast. `font-optical-sizing: auto` is the default in browsers
that support it, and lets the browser pick from the rendered size with no code:
<https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-optical-sizing>

Practical brand implications: a single variable file replaces 6–12 static weights, which usually
*reduces* payload while *increasing* expressive range; and an `opsz` axis is what lets one typeface
work at 12px in a table and 96px in a hero without looking like two different brands.

## 3.6 Fluid type with clamp()

`[CONVENTION]` `clamp(min, preferred, max)`, where the preferred value is a linear function of
viewport width, replaces the stepped breakpoint approach.

The interpolation maths (from Utopia, <https://utopia.fyi/blog/clamp/>):

```
slope       = (maxSize - minSize) / (maxViewport - minViewport)
yIntercept  = minSize - slope * minViewport
preferred   = yIntercept + (slope * 100vw)
```

Calculator: <https://utopia.fyi/type/calculator/>. Typical output shape:
`--step-0: clamp(1.13rem, calc(1.08rem + 0.22vw), 1.25rem);`

`[SPEC-adjacent] Accessibility caveat:` a `vw`-only preferred value does not respond to browser text
zoom, which can break WCAG 1.4.4 Resize Text (AA, 200%). The mitigation is the one Utopia uses:
always include a `rem` term in the preferred value (`calc(1.08rem + 0.22vw)`), never a bare `vw`,
and set the `max` in `rem`. Test at 200% zoom before shipping.

## 3.7 Font licensing: the categories that matter to a brand

`[PUBLISHED]` A brand needs to know which of these it has bought, because they are usually sold
separately and priced separately.

| Licence type | Covers | Typical metric | Brand risk if missing |
| --- | --- | --- | --- |
| **Desktop** | Installing the font to set artwork, print, PDFs | Number of workstations | Agency has it, client does not, files become unusable |
| **Webfont** | Serving WOFF2 from a site | Monthly pageviews or domains | Overage bills, or takedown |
| **App / embedding** | Bundling into a native mobile or desktop app | Per app, per title | Often the single most expensive tier |
| **ePublication** | Embedding into an ebook or digital magazine | Per title | |
| **Broadcast / OEM / server** | Video, on-device firmware, server-side rendering (PDF generation, image services) | Negotiated | Server-side PDF generation frequently uncovered |
| **Logo / trademark** | Using letterforms in a registered mark | Sometimes a separate grant | Some foundries explicitly forbid it |

**SIL Open Font License 1.1** is the licence most open fonts use:
<https://openfontlicense.org/>, SPDX <https://spdx.org/licenses/OFL-1.1.html>,
OSI <https://opensource.org/license/OFL-1.1>

What OFL 1.1 permits and requires:
- Use, study, modify, and redistribute freely, including commercially.
- Bundle and embed in software, apps and websites, including products that are sold.
- **May not** be sold on its own as a font.
- Derivative works must remain under OFL (copyleft), and **must not** use any Reserved Font Name.
- Subsetting for webfonts counts as modification, so a subset is a derivative and stays under OFL.
- No attribution is required in the finished design.
- Logo and branding use is permitted with no additional permission.

**Google Fonts**: all fonts in the library are open source and free for commercial use, including
inside commercially sold products. Most are OFL 1.1; some are Apache 2.0 or the Ubuntu Font Licence.
Neither OFL nor Apache 2.0 requires crediting the designer in the finished design.
FAQ: <https://developers.google.com/fonts/faq>; per-font attributions:
<https://fonts.google.com/attribution>; glossary:
<https://fonts.google.com/knowledge/glossary/licensing>

**Fontshare** (Indian Type Foundry) offers fonts free for personal and commercial use under the ITF
Free Font Licence: <https://www.fontshare.com/>. Check the terms per family; redistribution
(including self-hosting in some readings) is more restricted than OFL.

**Paid foundries** worth checking against before recommending a face: Klim, Commercial Type, Grilli
Type, Dinamo, Colophon, Pangram Pangram, Displaay, ABC Dinamo. All publish per-tier pricing.

**Where to check a licence:** the font's own EULA or `OFL.txt` shipped with the files (authoritative),
then the foundry's licensing page, then SPDX for identifier confirmation. A general primer:
<https://fontsarena.com/licenses-explained/>

**Guidance for the skill:** never recommend a typeface without naming its licence category and
linking the licence. For a brand that will produce native apps or server-rendered PDFs, prefer an
OFL family or budget explicitly for the app and server tiers.

---

# 4. Logo system conventions

## 4.1 What real brand guidelines actually specify

Five published, verifiable examples, summarised with their exact rules.

### 4.1.1 GOV.UK Brand Guidelines (web, UK Government / DSIT)

<https://brand.design-system.service.gov.uk/> · logo detail:
<https://brand.design-system.service.gov.uk/logo-system/logo-elements> · web:
<https://brand.design-system.service.gov.uk/logo-system/web/> · maintained by the GOV.UK brand team
(govuk-brand-team@dsit.gov.uk)

Site structure: **Introduction · Graphic device · Logo system · Colour · Typography · Data ·
Brand in use**, plus an accessibility statement and sitemap.

Rules, verbatim where quoted:
- **Clear space** is *"defined by the dot size within our wordmark"*. The whole logo system is
  measured in **dots**, a relative unit taken from the mark itself.
- **Construction:** *"The spacing between the crown and the wordmark is 3 dots"*; standard crown is
  *"Wordmark dot = 2× crown dot"*; the enlarged crown used in app icons is *"Wordmark dot = 1× crown dot"*.
- **Minimum sizes:** wordmark **50px** minimum width; crown **16px** minimum width. Below the crown
  minimum, a simplified small-crown version is used, for example in favicons.
- **Colour rules:** on Primary blue, use white and Accent teal; on light backgrounds, black and
  Primary blue; white or black wordmark versions are permitted on busy backgrounds or in print.
- **Misuse (five rules):** do not alter colour balance within the wordmark; do not distort, stretch
  or skew; do not apply drop shadows or effects; do not use on overly busy or low-contrast
  backgrounds; do not flip, mirror or rotate.

Notable: it has a dedicated **Data** section for chart and visualisation rules, which most brand
books omit and most brands need.

### 4.1.2 UK Space Agency Brand Guidelines, March 2022 (PDF)

<https://assets.publishing.service.gov.uk/media/62c810a9d3bf7f2fffd66c43/2022_brand_guidelines.pdf>

Contents, as printed: **Introduction (1) · Logo (2): Master logo 3, Icon 4, Exclusion zone 5, Logo
minimum sizes 6, Positioning 7, Co-branding 8 · Typography (9): Primary typeface 10, Secondary
typeface 11 · Colour palette (12): Primary colours 13, Secondary colours 14, Text contrast 15 ·
Graphic elements (16): Shapes and patterns 17, Illustrative elements 19, Icon style 20 ·
Photography (21) · Writing style (23) · Accessibility (25) · Applications (28): Scalable event
banners 29, Professionally printed documents 30, PowerPoint templates 31, Presentations 32, Social
media 33, Posters 34, Pop-up banners 35 · Contact (36)**

Rules:
- **Exclusion zone** *"should be equivalent to the height of the uppercase letters"*, and the same
  zone applies to the icon used alone. *"Whenever possible, leave more space."*
- **Minimum size:** *"never appear smaller than a width of 30mm in print"* and *"never appear smaller
  than a width of 70 pixels on-screen"*.
- **Variants:** master (red/white/blue), black (light backgrounds only), white (dark backgrounds
  only), plus a standalone icon.
- **Co-branding:** UKSA logo at the top, partner logos in a row at the bottom with equal spacing and
  sizing; on web banners, UKSA left and partners right.
- **Colour is documented in four systems per swatch:** Pantone, CMYK, RGB and hex. Example:
  Pantone 7687 / C99 M79 Y13 K1 / R19 G68 B137 / hex `134489`.
- **Text contrast page** names which brand colours may be used for text and states the target is AAA:
  *"It is important that the background and font combinations meet AAA accessibility standards. This
  means that certain colours cannot be used for text."* It also names the checking tool (WebAIM), and
  marks four screen-only colours as unusable in print.
- **Accessibility section** carries typographic minimums: minimum 12pt body type including tables and
  footnotes, 16pt if the audience is visually impaired or older; around 70 characters per line;
  ranged-left, not justified; even word spacing, no condensing or stretching to fit; matte over gloss
  paper; and the 1-in-12 / 1-in-200 colour-blindness figures.

This is the single best template of the five. It puts accessibility inside the brand book rather than
in a separate document, and it constrains the palette by contrast rather than by taste.

### 4.1.3 Louis Armstrong New Orleans International Airport (MSY), Brand Guidelines 2025 (PDF)

<https://flymsy.com/wp-content/uploads/2025/01/250127_MSYBRANDGUIDELINES_PUBLIC.pdf>

Contents: **Governance (04) · Our Brand (05) · Brand Marks (06): Brand Story 07, Logo Anatomy 08,
Logo Variations 09, Logo Clear Space 11, Minimum Logo Size 12, Incorrect Usage 13, Specialty Patterns
14, Partner Brands 17 · Typography (18): Headings & Bold Statements 19, Body Copy 20, Logotype
Anatomy 21 · Color (22)**

Rules:
- **Clear space:** *"The official clear space around the brand mark is at a minimum 50% of the icon
  on all sides of the lockup"*, i.e. the ratio is expressed against the mark, not an absolute value.
- **Minimum sizes**, given in both px and inches per lockup: **45 px / 5⁄8″** for the mark alone,
  **120 px / 1.6875″** for the vertical lockup, **110 px / 1.5″** for the horizontal lockup, with a
  dedicated **"small use logo"** for anything below 110 px / 1.5″.
- **Variants:** horizontal (wider than tall, for web, email, social banners) and vertical (for
  prominence, banners, posters, signage), each available as a single colour on a coloured background
  or photo, plus white for maximum contrast over imagery.
- **Incorrect usage, eight rules:** do not remove elements; do not squish, stretch or condense; do
  not use blurry or pixelated versions; do not rotate or change orientation; do not add drop shadows
  of any kind; do not distort; do not use colours outside the brand palette; do not add an outline.
- **Governance page** names the owning department and contact, and states that guidelines must be
  read before applying the brand.
- **Partner brands:** the airport logo *"should always carry the same visual weight as any partner
  brand's logos"*.

Notable structural feature: a **Logo Anatomy** page that names each part of the mark and what it
signifies, and a **Brand Story** page that explains the mark's derivation. This is what makes a
guideline persuasive rather than merely restrictive.

### 4.1.4 Recreation.gov logo usage (PDF, US federal)

<https://cdn.recreation.gov/Recgov-Logo-Guidelines.pdf>

Single-spread structure: Logo · Logo on Dark Backgrounds · Logo with Tagline · Clear Space ·
Minimum Size · Unacceptable Usage.

Rules:
- **Colour:** *"The logo may be reproduced only in gray and green colors as shown"*, with both
  specified in Pantone, CMYK, RGB and hex (Gray PMS 7450 / `#4d4d4f`; Green PMS 575 / `#64873b`).
- **Reversed:** *"may be reproduced in white and green or all white on dark backgrounds"*.
- **Clear space:** *"Keep a minimum clear space equal to the character height."*
- **Minimum size, expressed in points of height** rather than width: *"no less than 11 pts in height
  without tagline and 16.5 pts with"*, with reference widths of 1″ and 1.5″ shown.
- **Misuse, ten rules** including two that are specific to its lockup and rarely seen elsewhere:
  *"Don't center align the tagline"* and *"Don't right align the tagline"*, alongside insufficient
  contrast, crop, box, remove elements, alter/colour elements, pixelate, distort, alter the type,
  rotate.

### 4.1.5 Johns Hopkins Medicine and NASA (web)

- **Johns Hopkins Medicine**:
  <https://brand.hopkinsmedicine.org/brand/branding-guidelines/logo-guidelines/clear-space-and-minimum-size>
  *"The minimum clear space surrounding the logo is equivalent to the height of the capital H in
  Hopkins."* Minimum print sizes: **1.5″** horizontal, **1.25″** vertical. Below that, the fallback
  is not a smaller logo but the words "Johns Hopkins Medicine" set in Gill Sans.
- **NASA Brand Center**: <https://www.nasa.gov/nasa-brand-center/brand-guidelines/>
  Sections: The NASA Insignia (the "meatball") · Typography · The NASA Logotype (the "worm") ·
  Supporting Elements · Additional Restrictions. Clear space is expressed in the mark's own units:
  *"the minimum width for the protected area is 1N height from the edge of the sphere."* Four
  insignia versions (full colour, one colour, one colour with white rule, mono with white rule);
  *"The full-color Insignia … may not be displayed in reverse."* Alignment is sphere-centred, not
  bounding-box-centred. Print typography is Helvetica and Garamond, with Helvetica required for the
  identifier configuration; digital uses Inter, Public Sans and DM Mono. NASA materials may not be
  used for NFTs.
- The **1975 NASA Graphics Standards Manual** (NHB 1430.2, January 1976) is free to download and is
  the canonical historical example of a full identity manual:
  <https://www.nasa.gov/sites/default/files/atoms/files/nasa_graphics_manual_nhb_1430-2_jan_1976.pdf>

## 4.2 Extracted conventions

`[CONVENTION]` What the five sources agree on, stated as reusable rules.

**Clear space is always expressed as a ratio of an element of the mark, never as an absolute
measure.** Observed units: the dot inside the wordmark (GOV.UK), the cap height of the wordmark
(UK Space Agency), 50% of the icon (MSY), the character height (Recreation.gov), the cap height of a
named letter (Johns Hopkins), 1N from the edge of the sphere (NASA). This is what makes clear space
scale-invariant, and it is the single most reliable marker of a professionally written guideline.

**Minimum sizes are given twice: once for print, once for screen.** Print in mm or inches, screen in
px. Observed: 30mm / 70px (UKSA); 1.5″ / 110px, 1.6875″ / 120px, 5⁄8″ / 45px (MSY); 1.5″ and 1.25″
(Johns Hopkins); 11pt and 16.5pt height (Recreation.gov); 50px wordmark and 16px crown (GOV.UK).
Any guideline that gives only one is incomplete.

**Below-minimum needs a documented fallback, not a smaller logo.** GOV.UK switches to a simplified
crown; Johns Hopkins switches to set type; MSY has a dedicated "small use logo". A skill generating
a logo system should require this.

**Standard lockup set**: primary (horizontal), secondary (stacked/vertical), mark-only, and a
small-use or favicon variant. Each needs a stated *when to use* rule, not just a file.

**Colour variants** are: full colour on light; full colour on brand; one-colour black; one-colour
white (reversed); and an explicit rule on which is allowed over photography. Note the NASA
counter-example: some marks are explicitly forbidden from reversing.

**Colour is specified in four systems** for anything that will be printed: Pantone, CMYK, RGB, hex.
Screen-only colours are marked as such.

**A misuse page runs 5 to 10 rules with a visual for each.** The recurring set is: do not distort,
stretch or condense; do not rotate or flip; do not recolour outside the palette; do not add effects,
shadows or outlines; do not remove or rearrange elements; do not place on low-contrast or busy
backgrounds; do not pixelate or use low-resolution files; do not alter the typography; do not crop
or box. Add lockup-specific rules where the mark has a tagline or a partner arrangement.

**Serious guidelines include a governance page**: who owns the brand, who to contact, and when
approval is required. MSY, GOV.UK and UKSA all have one.

**Increasingly, accessibility is a first-class chapter, not an appendix.** UKSA gives it three pages
and constrains the palette with it. GOV.UK's colour page is titled around *"Core brand colours,
palettes and contrast requirements for accessibility"*.

---

# 5. Accessibility beyond colour

All normative text below from WCAG 2.2, W3C Recommendation, 12 December 2024:
<https://www.w3.org/TR/WCAG22/>

## 5.1 Focus indicators

`[SPEC]` **2.4.7 Focus Visible (Level AA)** (unchanged in 2.2)
<https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html>

> "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible."

**2.4.11 Focus Not Obscured (Minimum) (Level AA)** *(new in 2.2)*

> "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content."

**2.4.12 Focus Not Obscured (Enhanced) (Level AAA)** *(new in 2.2)*

> "When a user interface component receives keyboard focus, no part of the component is hidden by author-created content."

**2.4.13 Focus Appearance (Level AAA)** *(new in 2.2)*

> "When the keyboard focus indicator is visible, an area of the focus indicator meets all the following: is at least as large as the area of a 2 CSS pixel thick perimeter of the unfocused component or sub-component, and has a contrast ratio of at least 3:1 between the same pixels in the focused and unfocused states."

**Brand consequences.** 2.4.11 is the one brands break: sticky headers, cookie banners, chat widgets
and sticky footers routinely cover the focused element. It is a **Level AA** requirement, so it is in
scope for EN 301 549 conformance. The design-system answer is `scroll-margin-block` on focusable
elements sized to the sticky chrome.

For focus ring design, the defensible default is: a **2px** ring at **3:1 against both the component
and the page background**, offset so it does not sit on top of the control's own border, and never
removed without a replacement. `outline: none` with no substitute is a straight 2.4.7 failure. Note
that 2.4.13's 3:1 is measured between the focused and unfocused states of the same pixels, which
means a ring that only changes hue at the same lightness can fail even though it looks different.

## 5.2 Target size

`[SPEC]` **2.5.8 Target Size (Minimum) (Level AA)** *(new in 2.2)*
<https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>

> "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:"

- **Spacing:** "Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target"
- **Equivalent:** "The function can be achieved through a different control on the same page that meets this criterion"
- **Inline:** "The target is in a sentence or its size is otherwise constrained by the line-height of non-target text"
- **User agent control:** "The size of the target is determined by the user agent and is not modified by the author"
- **Essential:** "A particular presentation of the target is essential or is legally required for the information being conveyed"

**2.5.5 Target Size (Enhanced) (Level AAA)**
<https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html>

> "The size of the target for pointer inputs is at least 44 by 44 CSS pixels except when:"
> equivalent, inline, user agent control, essential.

**Design-system consequence:** 24px is the AA floor and it is easy to miss with icon-only buttons,
table row actions, close buttons, pagination and social icons. The *spacing* exception is the escape
hatch that lets a 20px icon pass, but only if nothing else is within the 24px circle. Setting the
minimum interactive token at **44px** (the AAA figure, which also matches long-standing Apple and
Android touch guidance) removes the whole class of problem and costs nothing on desktop if the
visible control stays smaller than its hit area.

See also **2.5.7 Dragging Movements (Level AA, new in 2.2)** in §5.4, which constrains any control
operated by dragging.

## 5.3 Motion

`[SPEC]` **2.3.3 Animation from Interactions (Level AAA)**
<https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html>

> "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed."

Also relevant and at **Level A**: **2.3.1 Three Flashes or Below Threshold**, which prohibits content
flashing more than three times per second (unless below the general and red flash thresholds). That
one is not optional.

`[SPEC]` The implementation mechanism is the CSS media query **`prefers-reduced-motion`**, set at the
operating system level:
<https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The affected population is people with **vestibular disorders**, for whom non-essential movement can
trigger dizziness, nausea and headaches. Parallax scrolling, where foreground and background move at
different rates, is the specific pattern named in W3C guidance as a trigger.

**Brand consequence:** a motion language belongs in the brand book (durations, easing curves, which
elements move and why), and it must state the reduced-motion behaviour for each. "Reduced" does not
mean "none": opacity fades are generally safe; large-displacement, parallax and scale animations are
the ones to drop. Note 2.3.3 is only AAA, but honouring `prefers-reduced-motion` costs nothing and is
now an expected default.

## 5.4 EN 301 549 and the European Accessibility Act

`[SPEC]` **The European Accessibility Act (Directive (EU) 2019/882)** became enforceable on
**28 June 2025**.

- Overview: <https://www.levelaccess.com/compliance-overview/european-accessibility-act-eaa/>
- Standard: <https://www.deque.com/en-301-549-compliance/>

Key facts a brand needs:

- **Scope** is consumer-facing products and services: e-commerce, consumer banking, e-books,
  telecoms, transport ticketing and information, audiovisual media services, and the hardware and
  interfaces that deliver them.
- **Territorial reach is by market, not by headquarters.** A business anywhere selling to EU
  consumers is in scope.
- **Microenterprise exemption** for services: fewer than 10 employees *and* under €2 million annual
  turnover. Note this exempts service providers, not manufacturers of products.
- **Presumption of conformity** comes from meeting the harmonised standard **EN 301 549**.
- **Version matters.** The currently cited harmonised version, **V3.2.1**, incorporates
  **WCAG 2.1 Level AA**. Draft **V4.1.0** went out for public comment in November 2025, and
  **V4.1.1**, which adopts **WCAG 2.2 Level AA** in clauses 9 (web), 10 (documents) and 11 (software),
  is scheduled for citation in the Official Journal around **30 November 2026**.
  Draft: <https://www.etsi.org/deliver/etsi_en/301500_301599/301549/04.01.00_20/en_301549v040100ev.pdf>
  Analysis: <https://www.axall.digital/insights/en301549-version-4-1-1-what-changes-and-when-it-applies>
- WCAG 2.2 adds **nine** new success criteria over 2.1 and obsoletes one
  (<https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/>). The **six at Level A or AA**, which
  are the ones that become mandatory when V4.1.1 is cited:

  | SC | Name | Level |
  | --- | --- | --- |
  | 3.2.6 | Consistent Help | A |
  | 3.3.7 | Redundant Entry | A |
  | 2.4.11 | Focus Not Obscured (Minimum) | AA |
  | 2.5.7 | Dragging Movements | AA |
  | 2.5.8 | Target Size (Minimum) | AA |
  | 3.3.8 | Accessible Authentication (Minimum) | AA |

  The three AAA additions are 2.4.12 Focus Not Obscured (Enhanced), 2.4.13 Focus Appearance and
  3.3.9 Accessible Authentication (Enhanced). **4.1.1 Parsing is obsolete and removed** in 2.2, so a
  system audited against 2.1 may carry findings that no longer exist.
- **2.5.7 Dragging Movements (AA)** deserves its own note because it is easy to miss in a design
  system: any function operated by a dragging movement must also be achievable with a single pointer
  without dragging, unless dragging is essential. That catches sliders, carousels, kanban boards,
  colour pickers, range inputs, sortable lists and map panning. The usual fix is to pair every drag
  affordance with buttons or a text input.
- Penalties are set by each member state's implementing legislation and range from fines to removal
  of a product from the EU market.

**Practical guidance for the skill:** design to **WCAG 2.2 AA** now. It is a superset of the
currently cited 2.1 AA, it is what V4.1.1 will require, and the delta is small if the design system
handles focus, target size and consistent help centrally.

---

# 6. Brand strategy: what the research actually says

## 6.1 Ehrenberg-Bass: the actual claims

`[EMPIRICAL]` Primary sources:

- Byron Sharp, *How Brands Grow: What Marketers Don't Know*, Oxford University Press, 2010
- Jenni Romaniuk and Byron Sharp, *How Brands Grow Part 2*, Oxford University Press, 2015
- Jenni Romaniuk, *Building Distinctive Brand Assets*, Oxford University Press, 2018:
  <https://global.oup.com/academic/product/building-distinctive-brand-assets-9780190311506>
- Institute: <https://marketingscience.info/>

What the research actually claims, stated carefully:

1. **Double jeopardy.** Brands with lower market share have both fewer buyers *and* slightly lower
   loyalty among those buyers. It is an empirical regularity observed across categories and
   countries, and the institute frames it as largely a selection effect of penetration:
   <https://marketingscience.info/news-and-insights/what-causes-the-double-jeopardy-law>
   The practical consequence is that **growth comes overwhelmingly from penetration, not from
   loyalty programmes**.

2. **Mental availability** is the probability that a buyer notices, recognises or thinks of a brand
   in a buying situation. It is not the same as unaided awareness. It is built through **category
   entry points**, the cues and occasions that prompt a purchase.

3. **Physical availability** is being easy to find and buy. The pair is multiplicative: growing one
   while holding the other constant produces a smaller gain than growing both.

4. **Distinctiveness over differentiation.** Sharp's contested claim is that perceived
   differentiation between brands in a category is mild, and that what actually drives choice is
   being *recognisable* and coming to mind. Distinctive assets are the memory hooks that do that:
   colours, logos, characters, packaging shapes, patterns, taglines and audio devices. Framed
   crisply: *differentiation is about meaning; distinctiveness is about memory.*

`[CONTESTED]` Two honest caveats the skill must carry:

- The institute's rebuttal page (<https://marketingscience.info/news-and-insights/answering-critics>)
  asserts that critics have raised *"nothing of substance"*. That is the institute's own
  characterisation of the debate, not a neutral one. There is real ongoing argument, particularly
  around B2B, high-consideration and subscription categories, where the empirical base is thinner
  than in the FMCG panel data the laws were derived from.
- Do not present Ehrenberg-Bass findings as universal laws of all markets. Present them as robust
  regularities in repeat-purchase consumer categories, with weaker evidence elsewhere.

`[FOLKLORE-adjacent]` The frequently quoted figure that doubling mental availability lifts share by
30–50% appears in secondary write-ups but is not traceable in this research to a specific published
study with a stated method. Treat it as illustrative, not as a number to quote.

## 6.2 The Distinctive Asset Grid

`[EMPIRICAL]` Developed by **Jenni Romaniuk** (Ehrenberg-Bass) and set out in *Building Distinctive
Brand Assets* (2018). A 2×2 plotting each candidate asset on two measured dimensions:

- **Fame** (y-axis): of the people shown the asset, what percentage correctly name your brand.
- **Uniqueness** (x-axis): of the people who name *any* brand for that asset, what percentage name
  only yours.

The classification threshold on each axis is **50%**. The four quadrants:

| Quadrant | Fame | Uniqueness | Verdict |
| --- | --- | --- | --- |
| **Ignore or Test** | Low | Low | Neither known nor owned. Do not invest without further testing. |
| **Avoid Solo Use** | High | Low | Widely recognised but shared with competitors. Never use alone without the brand name. |
| **Investment Potential** | Low | High | Owned but not yet known. The growth opportunity. Use consistently and repeatedly. |
| **Use or Lose** | High | High | A genuine distinctive asset. Use it everywhere, protect it, do not refresh it away. |

References: <https://www.the-brand-algorithm.com/distinctive-asset-grid/>;
<https://www.distinctivebat.com/blog/distinctive-brand-asset-grid/>; grid figure from Romaniuk (2018):
<https://www.researchgate.net/figure/Distinctive-Asset-grid-from-Romaniuk-2018-The-Distinctive-Asset-grid-combines_fig1_392496534>

`[EMPIRICAL]` A 2026 peer-reviewed benchmarking study in the *International Journal of Advertising*
gives measured norms rather than anecdote: the **average distinctive asset scores 26% Fame and 54%
Uniqueness**, which places the average asset in the *Investment Potential* quadrant, and the study
finds **shape-based assets perform strongest** across industries:
<https://www.tandfonline.com/doi/full/10.1080/02650487.2026.2637295>

**How the skill should use this.** The grid is the honest counterweight to a rebrand. Before changing
a colour, mark or character, ask which quadrant it sits in. An asset in *Use or Lose* is equity being
destroyed by a refresh. An asset in *Investment Potential* needs consistency, not replacement. Most
rebrands throw away the only asset that was working. Note also that placing an asset on the grid
requires *research with real buyers*, not a workshop opinion. If no research exists, say the position
is an assumption.

## 6.3 Brand archetypes

`[CONTESTED]` Provenance is clear and worth stating honestly.

1. **Carl Jung** proposed archetypes as universal patterns in the collective unconscious. He did not
   propose twelve, and he did not propose them for marketing.
2. **Carol S. Pearson** developed a twelve-archetype system in *Awakening the Heroes Within* (1991).
3. **Margaret Mark and Carol S. Pearson**, *The Hero and the Outlaw: Building Extraordinary Brands
   Through the Power of Archetypes* (McGraw-Hill, 2001) applied it to branding. This is the canonical
   text: <https://carolspearson.com/books-page/the-hero-and-the-outlaw-building-extraordinary-brands-through-the-power-of-archetypes>
   Overview: <https://thebrandarchetypes.com/history/pearson-mark.html>

The twelve: Innocent, Sage, Explorer, Hero, Outlaw, Magician, Everyman, Lover, Jester, Caregiver,
Creator, Ruler, grouped by four motivations (independence, mastery, belonging, stability).

**How seriously to take it.** Jung's archetypes are not empirically testable in the way the
Ehrenberg-Bass laws are, and brand-archetype mapping is almost always done retrospectively: an
analyst looks at a successful brand and assigns an archetype, which is unfalsifiable. There is no
body of predictive evidence that choosing archetype X causes outcome Y.

What it is genuinely good for: it is a **consistency heuristic and a generative constraint**. A brand
that behaves like one coherent character across touchpoints is easier to recognise and remember than
one with no stable personality, which is a claim that *does* connect to the distinctiveness research.
Used as a shared vocabulary that stops a team writing four different tones of voice, it earns its
place.

**Guidance for the skill:** use archetypes as a tone-of-voice and decision-making shorthand. Never
present them as research-backed prediction. Never let an archetype override a measured distinctive
asset.

---

# 7. Naming and trademark screening

**This section is not legal advice.** A preliminary search reduces obvious risk. It does not clear a
name. Clearance is a legal opinion from a qualified trademark attorney, based on a professional
search that reaches beyond the registers a free tool can see.

## 7.1 What a free preliminary check covers

| Register | Tool | URL |
| --- | --- | --- |
| United States | USPTO Trademark Search (cloud) | <https://tmsearch.uspto.gov/> |
| Australia | Australian Trade Mark Search | <https://search.ipaustralia.gov.au/trademarks/search/quick> |
| Australia (quick triage) | IP Australia TM Checker | <https://www.ipaustralia.gov.au/trade-marks/search-existing-trade-marks/tm-checker> |
| EU | EUIPO eSearch plus | <https://www.euipo.europa.eu/> |
| Multi-jurisdiction | WIPO Global Brand Database | <https://branddb.wipo.int/> |
| Multi-jurisdiction | TMview | <https://www.tmdn.org/tmview/> |

`[PUBLISHED]` **TESS is dead.** The USPTO retired the Trademark Electronic Search System on
**30 November 2023** and replaced it with the cloud-based USPTO Trademark Search. Old TESS query
strings do not work without reformatting; the new system uses Boolean operators, field tags,
wildcards and regex:
<https://www.uspto.gov/subscription-center/2023/retiring-tess-what-know-about-new-trademark-search-system>

`[PUBLISHED]` **ATMOSS is dead too.** IP Australia replaced the Australian Trade Mark Online Search
System with **Australian Trade Mark Search**, which adds specification search and image search.
Separately, **TM Checker** is a free availability tool intended as a first pass only, and IP
Australia says explicitly it is less comprehensive than the full search:
<https://www.ipaustralia.gov.au/trade-marks/search-existing-trade-marks>

Note: `atmoss.com.au` is a third-party site, not IP Australia. Cite the `ipaustralia.gov.au` domains.

## 7.2 Classes

`[SPEC]` Trademarks are registered against goods and services classified under the **Nice
Classification** (Nice Agreement, 1957, administered by WIPO). **45 classes: 1–34 goods, 35–45
services.** The classification is revised periodically.

- WIPO / Nice: <https://www.wipo.int/classifications/nice/en/>
- USPTO current edition notes:
  <https://www.uspto.gov/trademarks/trademark-updates-and-announcements/nice-agreement-current-edition-version-general-remarks>

A conflict only matters within (or close to) the classes you intend to trade in, which is why a
search without a class strategy is close to meaningless. Common classes for a modern brand: 9
(software), 35 (advertising, business services, retail), 41 (education, entertainment), 42
(design and development of computer software, SaaS).

## 7.3 What a free check does not cover

State plainly, every time:

1. **Common-law rights.** In the US and Australia, unregistered marks acquire enforceable rights
   through use. They appear in no register.
2. **State and territory registers.** A US federal search misses 50 state registers.
3. **Phonetic and visual similarity.** Exact-string search misses "Kwik" against "Quick", or a mark
   whose logo resembles yours.
4. **The legal test.** Infringement turns on *likelihood of confusion*, a multi-factor judgment
   about mark similarity, goods similarity, channels of trade, sophistication of buyers and evidence
   of actual confusion. It is not keyword matching.
5. **Pending applications and oppositions** may not surface cleanly.
6. **Company and business-name registers** (ASIC in Australia, Companies House in the UK) are
   separate from trademarks, and registering a company name grants no trademark rights.

Sources on these limits:
<https://www.gfrlaw.com/what-we-do/insights/usptos-revamps-trademark-search-interface-tm-clearance-searches-are-vital>

## 7.4 Digital availability

`[CONVENTION]` A name is only usable if the digital footprint is obtainable. Check, in order:

1. **Exact-match domain** in the primary TLD for the market (`.com`, `.com.au`), and defensive
   variants. Registrar WHOIS or any registrar search.
2. **Social handles** across the platforms the brand will actually use. Aggregate checkers:
   <https://namechk.com/>, <https://www.namecheckr.com/>, <https://brandsnag.com/>. Treat these as
   indicative; confirm on the platform itself, since aggregators miss suspended, reserved and
   recently released handles.
3. **App store names** if a mobile app is planned. Both stores enforce uniqueness rules of their own.
4. **Search-result collision:** search the bare name and see what already owns page one. A name that
   is legally clear but permanently outranked is still a bad name.
5. **Package and namespace collisions** for developer-facing brands (npm, PyPI, crates.io, GitHub
   org).

## 7.5 Screening workflow the skill should follow

1. Generate candidates.
2. Reject anything generic or descriptive of the goods (descriptive marks are weak and often
   unregistrable). Prefer arbitrary, fanciful or suggestive marks.
3. Run the free register searches above, in the target jurisdictions, filtered to the relevant Nice
   classes, including phonetic variants and obvious misspellings.
4. Run the digital availability checks.
5. Check pronunciation and meaning in the languages of every target market.
6. Rank survivors and hand the shortlist to a trademark attorney for clearance before any spend on
   identity, packaging or filing.
7. State in writing, in the deliverable, that steps 3–5 are preliminary screening and not legal
   advice.

---

# 8. Claims register: what does not survive tracing

The skill must not repeat these as fact.

## 8.1 "Colour increases brand recognition by 80%"

`[FOLKLORE]` Not traceable to a study about brand recognition.

The claim is usually attributed to "a University of Loyola, Maryland study". The traced findings:
<https://www.insights4print.ceo/2019/02/color-increases-brand-recognition-by-80-the-real-contents-of-the-loyola-study-revealed/>

- The researcher is **Dr Ellen Hoadley** (Loyola University Maryland), and the papers are
  *"Investigating the effects of color"* (1990) and *"Investigating the effects of color, font, and
  bold highlighting in text for the end user"* (2000).
- Both are about **how colour affects information processing in graphs and text**, not brand
  recognition and not marketing.
- **Neither paper contains the 80% figure.**
- The number appears to enter circulation via a **Xerox marketing leaflet from 2005**, *"20 Ways to
  Share the Color Knowledge"*, which in turn drew on earlier material including **Carlton Wagner's
  Color Response Report** (pre-1990), which asserted that *"sixty percent of a customer's decision to
  purchase an item is based on color alone"* with no published method.

**What can be said instead:** colour aids recognition and recall relative to monochrome, and colour
is one of several strong distinctive assets (Romaniuk 2018). Say that, cite Romaniuk, and drop the
percentage.

## 8.2 "62–90% of a snap product judgment is based on colour alone"

`[FOLKLORE]` Misread of a real paper.

The source is **Satyendra Singh (2006), "Impact of color on marketing", *Management Decision***:
<https://www.researchgate.net/publication/235320162_Impact_of_color_on_marketing>. It is a
**literature review**, not a controlled purchase experiment. The figure refers to the proportion of
an initial visual assessment (formed within roughly 90 seconds) attributable to visual factors, in
which colour is **one dominant component alongside shape, layout and typography**. It is not a
colour-to-sales correlation, and "based on colour alone" is a corruption of the original.

## 8.3 "Consistent branding increases revenue by 23% (or 33%)"

`[FOLKLORE]` Survey self-report, not measured revenue.

Both numbers trace to **Lucidpress / Demand Metric** marketer surveys (23% from a 2016 study, 33%
from the 2019 *State of Brand Consistency* report):
<https://pub.lucidpress.com/5026f8f1-6004-496e-b308-71662d214bb3/document.pdf>;
press release: <https://www.prnewswire.com/news-releases/study-finds-companies-with-consistent-branding-can-see-up-to-33-increase-in-revenue-300967219.html>

They are surveys of marketers reporting their own beliefs, not audited financials, from different
years and different samples, so the two figures are not comparable. Cite them, if at all, as vendor
survey data with the method named.

## 8.4 "The golden ratio is objectively the most pleasing proportion"

`[FOLKLORE]` A durable aesthetic tradition with weak experimental support. Use 1.618 because it
produces a dramatic scale you like, not because it is scientifically optimal.

## 8.5 "APCA is the WCAG 3 contrast standard"

`[FOLKLORE]` False as of April 2026. APCA was removed from the WCAG 3 draft in 2023 and the WCAG 3
editor's note states the algorithm is undetermined. See §2.2.

## 8.6 "WCAG requires 4.5:1 for everything"

`[FOLKLORE]` Incomplete. 4.5:1 is normal text at AA. Large text is 3:1, non-text UI is 3:1, AAA is
7:1, and logotypes and incidental content are exempt. See §2.1.

## 8.7 "The DTCG format is a W3C standard"

`[FOLKLORE]` False. It is a Community Group Report, explicitly not a W3C Standard and not on the
Standards Track, and the current draft says not to implement it. See §1.1.

---

# 9. Source index

## Specifications and standards
- WCAG 2.2 (W3C Recommendation, 12 Dec 2024): <https://www.w3.org/TR/WCAG22/>
- WCAG 2.2 Understanding documents: <https://www.w3.org/WAI/WCAG22/Understanding/>
- DTCG Format Module 2025.10: <https://www.designtokens.org/TR/drafts/format/>
- DTCG Color Module: <https://www.designtokens.org/TR/drafts/color/>
- DTCG Third Editors' Draft (20 Jul 2025): <https://www.designtokens.org/tr/third-editors-draft/format/>
- Design Tokens Community Group: <https://www.w3.org/community/design-tokens/>
- EN 301 549 draft V4.1.0 (ETSI): <https://www.etsi.org/deliver/etsi_en/301500_301599/301549/04.01.00_20/en_301549v040100ev.pdf>
- SIL Open Font License 1.1: <https://openfontlicense.org/> · <https://spdx.org/licenses/OFL-1.1.html>
- Nice Classification (WIPO): <https://www.wipo.int/classifications/nice/en/>
- OpenType variation axis background: <https://github.com/microsoft/OpenTypeDesignVariationAxisTags/blob/master/BackgroundOnAxes.md>

## Tooling and systems
- Style Dictionary, DTCG support: <https://styledictionary.com/info/dtcg/>
- Style Dictionary, predefined transform groups: <https://styledictionary.com/reference/hooks/transform-groups/predefined/>
- Salesforce Lightning design tokens: <https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/tokens_intro.htm>
- Adobe Spectrum tokens: <https://www.npmjs.com/package/@adobe/spectrum-tokens>
- Spectrum Design Data RFC: <https://github.com/adobe/spectrum-design-data/discussions/714>
- Material Color Utilities (HCT): <https://github.com/material-foundation/material-color-utilities/>
- Android colour guide (tonal palettes): <https://developer.android.com/design/ui/mobile/guides/styles/color>
- Radix Colors, understanding the scale: <https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale>
- Radix Colors, composing a palette: <https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette>
- caniuse `oklch()`: <https://caniuse.com/mdn-css_types_color_oklch>
- Utopia fluid type calculator: <https://utopia.fyi/type/calculator/> · clamp maths <https://utopia.fyi/blog/clamp/>

## Writing and reference
- Nathan Curtis, Naming Tokens in Design Systems: <https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676>
- Nathan Curtis, Reimagining a Token Taxonomy: <https://medium.com/eightshapes-llc/reimagining-a-token-taxonomy-462d35b2b033>
- Nathan Curtis, Tokens in Design Systems: <https://medium.com/eightshapes-llc/tokens-in-design-systems-25dd82d58421>
- Tim Brown, More Meaningful Typography (A List Apart): <https://alistapart.com/article/more-meaningful-typography/>
- The Elements of Typographic Style Applied to the Web: <http://webtypography.net/2.1.2>
- Evil Martians, OKLCH in CSS: <https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl>
- Adrian Roselli, WCAG3 Contrast as of April 2026: <https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html>
- APCA in a Nutshell: <https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html>
- MDN, prefers-reduced-motion: <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
- MDN, font-optical-sizing: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-optical-sizing>

## Brand guidelines examined
- GOV.UK Brand Guidelines: <https://brand.design-system.service.gov.uk/>
- UK Space Agency Brand Guidelines, March 2022 (PDF): <https://assets.publishing.service.gov.uk/media/62c810a9d3bf7f2fffd66c43/2022_brand_guidelines.pdf>
- Louis Armstrong New Orleans International Airport Brand Guidelines 2025 (PDF): <https://flymsy.com/wp-content/uploads/2025/01/250127_MSYBRANDGUIDELINES_PUBLIC.pdf>
- Recreation.gov Logo Guidelines (PDF): <https://cdn.recreation.gov/Recgov-Logo-Guidelines.pdf>
- Johns Hopkins Medicine brand: <https://brand.hopkinsmedicine.org/brand/branding-guidelines/logo-guidelines/clear-space-and-minimum-size>
- NASA Brand Guidelines: <https://www.nasa.gov/nasa-brand-center/brand-guidelines/>
- NASA Graphics Standards Manual 1975/76 (PDF): <https://www.nasa.gov/sites/default/files/atoms/files/nasa_graphics_manual_nhb_1430-2_jan_1976.pdf>

## Brand strategy
- Ehrenberg-Bass Institute: <https://marketingscience.info/>
- Romaniuk, Building Distinctive Brand Assets (OUP 2018): <https://global.oup.com/academic/product/building-distinctive-brand-assets-9780190311506>
- Distinctive asset benchmarking study, Int. Journal of Advertising 2026: <https://www.tandfonline.com/doi/full/10.1080/02650487.2026.2637295>
- Mark & Pearson, The Hero and the Outlaw: <https://carolspearson.com/books-page/the-hero-and-the-outlaw-building-extraordinary-brands-through-the-power-of-archetypes>

## Accessibility and health
- NHS, colour vision deficiency: <https://www.nhs.uk/conditions/colour-vision-deficiency/>
- Colour Blind Awareness: <https://www.colourblindawareness.org/colour-blindness/>
- Okabe-Ito palette in practice: <https://thenode.biologists.com/data-visualization-with-flying-colors/research/>

## Trademark
- USPTO Trademark Search: <https://tmsearch.uspto.gov/>
- USPTO TESS retirement notice: <https://www.uspto.gov/subscription-center/2023/retiring-tess-what-know-about-new-trademark-search-system>
- IP Australia, search existing trade marks: <https://www.ipaustralia.gov.au/trade-marks/search-existing-trade-marks>
- IP Australia TM Checker: <https://www.ipaustralia.gov.au/trade-marks/search-existing-trade-marks/tm-checker>
- WIPO Global Brand Database: <https://branddb.wipo.int/>
- TMview: <https://www.tmdn.org/tmview/>

## Claims traced and rejected
- Loyola "80%" claim traced: <https://www.insights4print.ceo/2019/02/color-increases-brand-recognition-by-80-the-real-contents-of-the-loyola-study-revealed/>
- Singh (2006), Impact of color on marketing: <https://www.researchgate.net/publication/235320162_Impact_of_color_on_marketing>
- Lucidpress, State of Brand Consistency: <https://pub.lucidpress.com/5026f8f1-6004-496e-b308-71662d214bb3/document.pdf>
