# 10 · Implementation

> `$A` is the Brandi command line, resolved once at the start of the session: `brandi` when the
> plugin is installed, or `node <this skill's base directory>/../../scripts/brandi.mjs` from a clone.
> It is never a bare relative path: the working directory is the user's project, not the plugin.

Getting the system into real code, and keeping it there.

A brand book is a document somebody read once. A design system is a rule that keeps applying. The
difference is entirely in this file: the token architecture that makes theming a swap rather than a
rewrite, the artefacts that carry it into each platform, and the checks that catch the drift.

Everything below is written against what Brandi actually emits. Where the implementation diverges
from a specification, the divergence is named rather than smoothed over.

---

## 1. The three-tier token architecture

### 1.1 The tiers

| Tier | Also called | Named by | References | Example | Consumed by |
|---|---|---|---|---|---|
| **1** | Primitive, global, reference, core | What it **is** | Nothing | `color.brand.9`, `space.16` | Nobody directly. Always routed through tier 2 |
| **2** | Semantic, alias, decision | What it is **for** | Tier 1 | `surface.page`, `text.primary` | Components, patterns, product code |
| **3** | Component | Component and part | Tier 2 | `button.primary.background` | That component only |

The canonical treatment is Nathan Curtis (EightShapes), *Naming Tokens in Design Systems*:
<https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676>, extended in
*Reimagining a Token Taxonomy*:
<https://medium.com/eightshapes-llc/reimagining-a-token-taxonomy-462d35b2b033>

Curtis's four level-groups, which are what a naming order is assembled from:

```
[namespace]  system, theme, domain           esds, ocean, retail
[object]     component group, component,     forms, input, left-icon
             element
[base]       category, concept, property     color, action, background
[modifier]   variant, state, scale, mode     primary, hover, 500, on-dark
```

Curtis is explicit that "there's no prevailing token level order". The value of the taxonomy is not
that one order is correct. It is that a team picks an order and applies it consistently.

The same pattern is documented by the two largest enterprise systems: Salesforce Lightning
distinguishes global, alias and component tokens
(<https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/tokens_intro.htm>),
and Adobe Spectrum uses global tokens (`spectrum-global-color-blue-500`) and alias tokens
(`spectrum-alias-background-color-default`) with per-component custom properties on top
(<https://www.npmjs.com/package/@adobe/spectrum-tokens>).

### 1.2 The invariant

> **Only tier 2 changes between themes.**
>
> Tier 1 is fixed. Tier 3 inherits. Product code never references tier 1.

That single rule is what makes dark mode a swap of the semantic layer rather than a rewrite of every
component. It is also the rule that breaks first, silently, and takes the whole system with it.

Brandi's `tokens.css` states the rule in its own header, so the constraint ships with the artefact
rather than living in a document somebody has to remember:

```
 * If you find yourself writing var(--color-brand-9) in a component, the
 * semantic layer is missing a token. Add one there instead.
```

**One deliberate refinement.** Brandi re-declares the tier 1 ramps per theme rather than declaring
them once. Light and dark are genuinely different scales, not the same colours rearranged: a dark
surface is not an inverted light one, and the chroma that reads as confident on white reads as
radioactive on near-black. This is how Radix Colors does it, and it does not weaken the invariant,
because components still only ever consume tier 2 and still never learn which theme is active. It
strengthens it: a semantic role can point at a *different step* in each theme, which is how
`surface.raised` sits on step 1 in light and step 2 in dark.

### 1.3 Brandi's tier 2

These are the tokens to consume. This is the complete list, and it is short on purpose.

```
surface.page        surface.subtle      surface.raised      surface.sunken
surface.overlay     surface.inverted

control.bg          control.bg-hover    control.bg-active

border.subtle       border.default      border.strong

text.primary        text.secondary      text.disabled       text.inverted
text.brand          text.link

accent.bg           accent.bg-hover     accent.border       accent.solid
accent.solid-hover  accent.solid-strong accent.on-solid     accent.text

focus.ring

danger.{bg,border,solid,text}     warning.{bg,border,solid,text}
success.{bg,border,solid,text}    info.{bg,border,solid,text}
```

Two of these are not aliases, and the reason is worth knowing because it is the kind of exception
that gets "cleaned up" by someone tidying: `accent.on-solid` and `accent.solid-strong` are computed
from the contrast of the thing they sit on, not chosen from the ramp. `accent.solid` is the raw
brand colour, which frequently cannot carry a label. `accent.solid-strong` is the darkened variant
that can. **Filled buttons use `accent.solid-strong`.**

In CSS they arrive as custom properties with the dots flattened to hyphens:

```css
var(--surface-page)   var(--text-primary)   var(--accent-solid-strong)   var(--focus-ring)
```

### 1.4 Tier 3, and when not to have one

Three tiers is not universally right. Small systems ship two tiers and add component tokens only
where a component genuinely needs an override. Adding tier 3 for every component multiplies token
count without adding expressive power, and every extra token is another thing to keep consistent.

**The rule: promote a component-scoped token to tier 2 only when three or more components need the
same thing.** Before that, keep it local to the component.

### 1.5 The four anti-patterns

| Anti-pattern | Example | Why it breaks |
|---|---|---|
| **Skipping tiers** | `button.primary.bg: #B85A3A` | Component points straight at a raw value. Theming is now a find-and-replace |
| **Primitives with semantic names** | `--color-brand: #B85A3A` | Sounds semantic, is not. What does "brand" mean when the brand has three colours? Name primitives by what they are (`--color-terracotta`, `--color-brand-9`) and semantics by what they do (`--accent-solid`) |
| **Modes in token names** | `--color-bg-light`, `--color-bg-dark` | Now every component has to know which mode it is in. That knowledge belongs in one selector, not in a thousand call sites |
| **No `$description` on ambient primitives** | A ramp step with no stated job | An undocumented 12-step ramp becomes twelve arbitrary blues within a month |

---

## 2. The DTCG format, honestly

### 2.1 What DTCG is, and is not

The Design Tokens Community Group is a **W3C Community Group**, not a Working Group. Its output is a
Community Group Report, explicitly **not a W3C Standard and not on the W3C Standards Track**.

- Community group: <https://www.w3.org/community/design-tokens/>
- Current draft, *Design Tokens Format Module 2025.10*: <https://www.designtokens.org/TR/drafts/format/>
- Companion Color module: <https://www.designtokens.org/TR/drafts/color/>
- Third Editors' Draft (20 July 2025), the version most tools actually implemented against:
  <https://www.designtokens.org/tr/third-editors-draft/format/>

Both drafts carry explicit warnings. The 2025.10 draft says: *"This is a preview. Do not attempt to
implement this version of the specification. Do not reference this version as authoritative in any
way."* The Third Editors' Draft says it is *"unstable, and should not be implemented."*

**"The DTCG format is a W3C standard" is false.** Do not write it in a brand book.

The position this skill takes: treat DTCG as the interchange target because the tooling ecosystem
has converged on it, say plainly that it is a moving draft, and expect churn.

### 2.2 What Brandi emits, and where it diverges

`scripts/tokens.mjs` produces DTCG that most tooling reads. It is not fully conformant to 2025.10,
and the divergences are deliberate. They are listed here so that nobody is surprised by a strict
validator, and so that nobody "fixes" one of them without understanding the trade.

| Area | 2025.10 draft | What Brandi emits | Why |
|---|---|---|---|
| `$schema` | `https://www.designtokens.org/schemas/2025.10/format.json` | `https://tr.designtokens.org/format/` | A stable pointer at the spec rather than a version-pinned JSON Schema. Pin the version when the schema URL stabilises |
| `color` `$value` | An object: `{ colorSpace, components, alpha, hex }` | A hex string: `"#0b64d4"` | The colour object is the biggest breaking change in the draft and almost nothing in the wild reads it yet. The OKLCH values are not lost: they are in `system.json` and in `tokens.css` when `colorFormat: 'oklch'` is used |
| `dimension` `$value` | An object: `{ value, unit }`, units `px` or `rem` only | Object in `tokens.json`, **string** (`"16px"`) in `tokens.style-dictionary.json` | This is the single biggest shape divergence between the spec drafts and the installed tooling. `dimensionStyle` exists for exactly this. See §2.3 |
| `letterSpacing` unit | `px` or `rem` | `em` | Letter spacing must scale with font size or it is wrong at every step of the type scale. `em` is the correct typographic unit and the spec's restriction is the thing that is wrong here. A strict validator will flag it |
| `shadow` | A structured object, or an array of them | `$type: "string"` with a CSS shadow string | The shadows are multi-layer and hue-tinted. `"string"` is **not a DTCG type**. It is an explicit escape hatch so that tooling does not silently mis-parse a composite it cannot represent |
| `typography` composite | `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight` | Same, minus `fontWeight` | Weight is a per-use decision in this system rather than a property of a scale step. Add it in your own layer if your pipeline requires the complete composite |
| Theming | No theming primitive exists in the spec | A sibling `semantic-dark` group, with aliases re-pointed at `color.<family>-dark.<step>` | A sibling group is the shape every build tool already understands. `$extensions` would be more correct and less useful |

Everything else conforms: `$type` inheritance from groups, curly-brace aliases, `cubicBezier` as a
four-number array, `duration` as `{ value, unit: "ms" }`, unitless `lineHeight` as `$type: "number"`,
and `$description` on groups and tokens.

### 2.3 The dimension-shape divergence, specifically

This is worth understanding because it is the thing that breaks a pipeline silently.

Early DTCG drafts expressed a dimension as a string: `"$value": "16px"`. The 2024 revision changed
it to an object: `"$value": { "value": 16, "unit": "px" }`. The current 2025.10 draft keeps the
object form and restricts units to `px` and `rem`.

Style Dictionary, which is where most token JSON actually gets consumed, still reads the string form
in the majority of installed pipelines. Its own DTCG page states that the *"latest format 2025.10
does not have full support yet in Style Dictionary. This is a work in progress in v5."*
<https://styledictionary.com/info/dtcg/>

So Brandi writes both:

```
brand/tokens/tokens.json                    object dimensions   the spec-shaped file
brand/tokens/tokens.style-dictionary.json   string dimensions   the tooling-shaped file
```

Same tokens, same names, same aliases. Pick the one your consumer reads. If you are handing tokens
to a design tool or another team, send `tokens.json` and tell them the divergences in §2.2. If you
are feeding a build, send the Style Dictionary one.

One more Style Dictionary caveat worth knowing: its legacy-to-DTCG converter renames `value` to
`$value` and `type` to `$type`, but deliberately does **not** rewrite type *values*. It will not
turn `"size"` into `"dimension"` for you.

### 2.4 The five files, and what each is for

```bash
$A tokens                     # writes to brand/tokens/
$A tokens --out src/styles    # or wherever
$A tokens --prefix acme       # --acme-surface-page instead of --surface-page
```

| File | Format | Consume it when | Do not |
|---|---|---|---|
| `tokens.json` | DTCG, object dimensions | Handing tokens to another team, a design tool, or a Figma plugin. This is the interchange artefact | Import it into a build without checking your tool reads object dimensions |
| `tokens.style-dictionary.json` | DTCG, string dimensions | Feeding a Style Dictionary build that fans out to iOS, Android, Flutter or React Native | Edit it. It is generated |
| `tokens.css` | CSS custom properties | **The default.** Ship this. Import it once, at the root, before anything else | Duplicate its values anywhere |
| `tailwind.css` | Tailwind v4 `@theme` | Using Tailwind v4. It imports `tokens.css` itself | Use it with Tailwind v3, which has no `@theme` |
| `tokens.ts` | Typed TS module | Something genuinely needs values in JS: a canvas renderer, a chart library, an email builder, a native bridge | Use it for styling a DOM component. Custom properties theme without a re-render; a JS object does not |

**What is in `tokens.css`**, in order: the primitive ramps for light, then spacing, radius, type,
elevation and motion, then the tier 2 semantic layer. Then the same primitives and semantics again
under `[data-theme="dark"]`, and once more inside `@media (prefers-color-scheme: dark)` scoped to
`:root:not([data-theme="light"])`, which is what makes the three-state model in §4 work. Then two
accessibility defaults: the `prefers-reduced-motion` reset and a `:focus-visible` ring.

**A Style Dictionary config that consumes it**, kept minimal:

```js
// config.js
export default {
  source: ['brand/tokens/tokens.style-dictionary.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{ destination: 'variables.css', format: 'css/variables' }],
    },
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      files: [{ destination: 'Tokens.swift', format: 'ios-swift/class.swift', className: 'Tokens' }],
    },
    android: {
      transformGroup: 'android',
      buildPath: 'build/android/',
      files: [{ destination: 'tokens.xml', format: 'android/resources' }],
    },
  },
};
```

Transform groups rewrite case per platform (`css` gives kebab-case, `js` gives PascalCase, `android`
gives snake_case, `compose` gives camelCase). That is why the source token names are plain,
lowercase and dot-separated: encode meaning in the path, never in the casing.
<https://styledictionary.com/reference/hooks/transform-groups/predefined/>

---

## 3. Framework recipes

Each of these is short because the system is doing the work. If a recipe is long, the tokens are
wrong.

### 3.1 Plain CSS

```html
<link rel="stylesheet" href="/brand/tokens/tokens.css">
<link rel="stylesheet" href="/styles/app.css">
```

```css
/* app.css. Consume tier 2 and nothing else. */
body {
  background: var(--surface-page);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-base);
}

.prose { max-inline-size: var(--measure); }

.card {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-24);
  box-shadow: var(--shadow-sm);
}

.button-primary {
  background: var(--accent-solid-strong);   /* not --accent-solid. See §1.3 */
  color: var(--accent-on-solid);
  border-radius: var(--radius-sm);
  padding-block: var(--space-12);
  padding-inline: var(--space-20);
  min-block-size: 2.75rem;                  /* 44px target */
  transition: background var(--duration-fast) var(--ease-standard);
}
```

Nothing else needs to know about themes.

### 3.2 Tailwind v4

Tailwind v4 reads design tokens straight from CSS custom properties inside `@theme`. There is no JS
config to keep in sync, and there should not be one: a `tailwind.config.js` alongside v4 is a v3
habit that will drift from the tokens within a sprint.

`brandi tokens` writes `tailwind.css` for you:

```css
@import "./tokens.css";
@import "tailwindcss";

@theme {
  /* Semantic colours: bg-surface-page, text-text-primary, border-border-subtle */
  --color-surface-page: var(--surface-page);
  --color-text-primary: var(--text-primary);
  /* … one line per tier 2 token … */

  --text-base: var(--text-base);
  --font-body: var(--font-body);
  --spacing-16: var(--space-16);
  --radius-md: var(--radius-md);
  --shadow-sm: var(--shadow-sm);
}
```

The namespaces and what each generates:

| Namespace | Utilities |
|---|---|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*`, and the rest |
| `--font-*` | `font-body`, `font-display` |
| `--text-*` | `text-base`, `text-2xl` (font size) |
| `--spacing-*` | `p-16`, `gap-24`, `max-h-*` |
| `--radius-*` | `rounded-md` |
| `--shadow-*` | `shadow-sm` |

<https://tailwindcss.com/docs/theme>

**The one thing to know about `@theme` and `var()`.** Brandi's `@theme` values reference the
underlying custom properties, and Tailwind resolves theme variables at `:root`. That is correct for
this system because the theme selector (`[data-theme="dark"]`) sits on `<html>`, which *is* `:root`.

If you need a **scoped** theme (a dark panel inside a light page, a preview pane, an email
composer), change one word:

```css
@theme inline {
  --color-surface-page: var(--surface-page);
}
```

> "Using the `inline` option, the utility class will use the theme variable *value* instead of
> referencing the actual theme variable."

With `inline`, `bg-surface-page` compiles to `background-color: var(--surface-page)` directly, which
resolves per element and therefore picks up a `data-theme` set on any ancestor. Without it, the
substitution happens once at `:root` and a scoped override is ignored.

**One sharp edge worth knowing about.** For the namespaces where Tailwind's name matches Brandi's
own (`--text-*`, `--font-*`, `--radius-*`, `--shadow-*`, and the raw ramp steps), the generated
`@theme` line is literally self-referential: `--text-base: var(--text-base)`. It works, and it works
for a specific reason: `tokens.css` is imported unlayered, Tailwind puts its `@theme` output in
`@layer theme`, and an unlayered declaration beats a layered one, so the `tokens.css` value wins and
the self-reference never resolves. That is a load-bearing accident. If you import `tokens.css`
*inside* a cascade layer, both declarations land in the same layer, the reference becomes a cycle,
and those custom properties go invalid with no error message. **Import `tokens.css` unlayered**, or
run `brandi tokens --prefix acme` so the names cannot collide in the first place.

### 3.3 Next.js App Router

**Where the CSS goes.** Import it once, in the root layout, before your app styles.

```tsx
// app/layout.tsx
import '@/brand/tokens/tokens.css';   // or tailwind.css, which imports it
import './globals.css';
```

**The font.** Self-host with `next/font/local` so there is no third-party request, no layout shift,
and no dependency on a font CDN's uptime or privacy posture.

```tsx
// app/layout.tsx
import localFont from 'next/font/local';

const body = localFont({
  src: [
    { path: '../public/fonts/AcmeSans-Variable.woff2', style: 'normal' },
    { path: '../public/fonts/AcmeSans-Italic-Variable.woff2', style: 'italic' },
  ],
  variable: '--font-acme-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],   // the metric-compatible fallback, not a guess
});
```

Then bind the brand token to the generated variable, in one place:

```css
/* globals.css, after tokens.css */
:root { --font-body: var(--font-acme-sans), system-ui, sans-serif; }
```

Do not scatter `body.className` through components. One binding, at the root.

**Check the licence before self-hosting.** Webfont licences are usually metered on pageviews or
domains, and server-side rendering to PDF or images is frequently a separate tier that nobody bought.
See the licence table in the evidence base and `07-voice-framework.md`'s sibling coverage of type.

**Avoiding the flash.** See §4. In App Router it is a blocking inline script in the root layout's
`<head>`, plus `suppressHydrationWarning` on `<html>` because the script mutates an attribute the
server did not render.

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={body.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**What not to do in Next.js specifically:**

- Do not put the theme script in a client component with `useEffect`. It runs after paint, which is
  the flash.
- Do not read `localStorage` during render. It is not available on the server and the mismatch is a
  hydration error.
- Do not import `tokens.ts` into a server component to style something. Use the CSS.

### 3.4 React with CSS Modules

CSS Modules scope class names, not custom properties. Custom properties are global by design, which
is exactly what you want: the module scopes the component, the tokens cross the boundary.

```css
/* Card.module.css */
.card {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-24);
}
.card[data-state='error'] {
  border-color: var(--danger-border);
  background: var(--danger-bg);
}
```

```tsx
import styles from './Card.module.css';

export function Card({ state = 'default', children }) {
  return <div className={styles.card} data-state={state}>{children}</div>;
}
```

**Use data attributes for state, not extra class names.** One selector per state, all of them
visible in the DOM, all of them themeable, and no `clsx` call that grows to nine conditions. It also
makes the component contract in §7 directly inspectable in devtools.

**When to reach for `tokens.ts`.** Only when a value must exist in JS: a chart library's colour
array, a canvas renderer, an email template built as a string. Import it there and nowhere else:

```ts
import { tokens } from '@/brand/tokens/tokens';
const series = [tokens.semantic.light['accent.solid'], tokens.color.accent1.light[9]];
```

Note that this snapshot does not follow the theme. If a chart must theme, read the computed custom
property instead:

```ts
const accent = getComputedStyle(document.documentElement)
  .getPropertyValue('--accent-solid').trim();
```

### 3.5 Astro

```astro
---
// src/layouts/Base.astro
import '../../brand/tokens/tokens.css';
const { title } = Astro.props;
---
<html lang="en-AU">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <script is:inline>
      /* Blocking. is:inline keeps Astro from bundling and deferring it. */
      (function () {
        try {
          var stored = localStorage.getItem('theme');
          var theme = stored === 'light' || stored === 'dark' ? stored : null;
          if (theme) document.documentElement.dataset.theme = theme;
        } catch (e) {}
      })();
    </script>
  </head>
  <body><slot /></body>
</html>
```

`is:inline` is the whole trick. Without it, Astro processes the script and it no longer blocks, so
the flash comes back. Astro's scoped styles work the same way CSS Modules do: the selector is
scoped, the custom property is not.

### 3.6 SwiftUI

Tokens translate to iOS, but not all of them, and pretending otherwise produces a theme that fights
the platform.

**Colour.** Ship the hex values, not OKLCH. Either an asset catalog with Any/Dark appearances (which
gives you free system behaviour), or a generated Swift file:

```swift
import SwiftUI

extension Color {
    /// Tier 2. Light and dark resolved by the trait collection, the same way the CSS does it.
    static let surfacePage  = Color(light: 0xFDFDFC, dark: 0x111113)
    static let textPrimary  = Color(light: 0x1C1C1E, dark: 0xEDEDEF)
    static let accentSolidStrong = Color(light: 0x0B5AC0, dark: 0x3B82F6)

    init(light: UInt32, dark: UInt32) {
        self = Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
    }
}
```

**Spacing and radius.** Plain `CGFloat` constants, same names, same numbers. `px` in DTCG means an
idealised viewport pixel whose iOS equivalent is `pt`, so the numbers carry across unchanged.

**Type.** Do not port the `clamp()` values. Dynamic Type is the platform's answer to the same
problem and it is better than yours. Register the scale steps against text styles:

```swift
extension Font {
    static let brandBody = Font.custom("AcmeSans", size: 16, relativeTo: .body)
    static let brandTitle = Font.custom("AcmeSans", size: 32, relativeTo: .title)
}
```

`relativeTo:` is what makes the custom face scale with the user's text size setting. Without it you
have shipped a fixed-size font and broken the platform's equivalent of WCAG 1.4.4.

**Motion.** `@Environment(\.accessibilityReduceMotion)` is the `prefers-reduced-motion` equivalent.
Read it and branch, the same way the CSS does.

**What does not translate, and should not be forced:**

| Web | iOS | What to do |
|---|---|---|
| CSS custom property cascade | No equivalent | Use the environment or a theme object. Do not build a cascade |
| `clamp()` fluid type | Dynamic Type | Use Dynamic Type. It is the better mechanism |
| `ch` measure | No equivalent | Constrain by frame width, tuned by eye |
| `oklch()` | No native colour space equivalent in SwiftUI's `Color` | Ship sRGB hex. The perceptual work already happened at generation time |
| `rem` | Points are absolute | Points plus Dynamic Type |
| Multi-layer tinted shadows | `.shadow()` composes differently | Approximate with one or two layers. Do not chase pixel parity |
| `:focus-visible` | Focus is a system concern (keyboard, Switch Control, tvOS) | Use `.focused()` and let the system draw the indicator |

### 3.7 Android

**Colour**, as resources with a night qualifier, which is the platform's version of the same swap:

```xml
<!-- res/values/colors.xml -->
<resources>
    <color name="surface_page">#FDFDFC</color>
    <color name="text_primary">#1C1C1E</color>
</resources>

<!-- res/values-night/colors.xml -->
<resources>
    <color name="surface_page">#111113</color>
    <color name="text_primary">#EDEDEF</color>
</resources>
```

**Dimensions** in `dimens.xml`, `dp` for space and radius, `sp` for type. `sp` respects the user's
font size setting; using `dp` for text is the Android equivalent of setting a font size in `px`.

**Compose**, if that is the target: Style Dictionary's `compose` transform group emits camelCase
Kotlin with `sp` / `dp` / `em` conversions already applied. Wire the generated values into a
`MaterialTheme` colour scheme rather than reinventing a theme system.

**What does not translate:** the same list as iOS, plus Material 3's own colour roles. If the app
uses Material components, map the brand's tier 2 tokens onto Material's roles explicitly and write
the mapping down. Half-mapping is what produces an app where the buttons are on-brand and the
dialogs are not.

---

## 4. Theme switching without a flash

### 4.1 The three-state model

Two states is the bug. A user who has chosen "dark" and a user who has expressed no choice are
different users, and collapsing them means one of them gets the wrong thing.

| State | Stored value | Behaviour |
|---|---|---|
| **Light** | `"light"` | Always light, regardless of the OS setting |
| **Dark** | `"dark"` | Always dark, regardless of the OS setting |
| **System** | *nothing stored* | Follows `prefers-color-scheme`, and keeps following it if the OS setting changes mid-session |

Store nothing for the system state. A stored `"system"` string works, but absence is simpler and it
means a user who clears storage lands in the right default rather than in a broken third state.

### 4.2 What the CSS does

`tokens.css` already handles two of the three:

```css
:root                       { color-scheme: light; /* light tokens */ }
[data-theme="dark"]         { color-scheme: dark;  /* dark tokens  */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { color-scheme: dark; /* dark tokens */ }
}
```

The `:not([data-theme="light"])` is the load-bearing part. It means: follow the OS unless the user
has explicitly asked for light. An explicit `data-theme` always wins, in both directions.

`color-scheme` is not decoration. It tells the browser to render form controls, scrollbars and the
canvas background in the matching mode, which is what stops a white flash between paints and what
stops native form controls looking wrong.

### 4.3 The blocking script

The flash happens because the theme is applied after the first paint. The fix is a small synchronous
script in `<head>`, before any stylesheet or content that can paint. It must be inline (a network
request is not synchronous enough) and it must not be deferred or bundled.

```html
<script>
  (function () {
    try {
      var stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        document.documentElement.dataset.theme = stored;
      }
      // No stored value: do nothing. The prefers-color-scheme block in the CSS
      // handles it, with no JavaScript in the path at all.
    } catch (e) {
      // Private mode, blocked storage, sandboxed iframe. Fall through to the
      // OS preference rather than throwing before the page has rendered.
    }
  })();
</script>
```

Four things that script gets right:

1. **It is synchronous and inline.** Nothing else is.
2. **It validates the stored value.** A stale or tampered value cannot put the document into an
   unknown state.
3. **It does nothing in the system case.** The zero-JavaScript path handles the most common state.
4. **It cannot throw.** `localStorage` throws in several real situations, and an exception here
   happens before anything has rendered.

### 4.4 The toggle

```js
function setTheme(next) {           // 'light' | 'dark' | 'system'
  const root = document.documentElement;
  if (next === 'system') {
    delete root.dataset.theme;
    try { localStorage.removeItem('theme'); } catch {}
  } else {
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
  }
}

function currentTheme() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'system';
}
```

The control shows three options, not a two-state switch. If space forces a two-state control, the
third state still has to exist somewhere, because a user who has never touched it must follow the OS.

### 4.5 `theme-color`, and the last flash

The browser chrome on mobile has its own colour, and if you do not set it per scheme the address bar
flashes at exactly the moment the page does not.

```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fdfdfc">
<meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#111113">
```

These take the resolved value of `--surface-page` in each theme. Generate them from the tokens, do
not type them, or they become the first thing to drift.

### 4.6 Testing it

- Hard reload in dark mode with an empty `localStorage`. No white flash.
- Hard reload with `theme` set to `"light"` while the OS is dark. No dark flash.
- Change the OS setting while the page is open with nothing stored. The page follows, live.
- Change the OS setting with `"light"` stored. The page does not move.
- Load with storage blocked (a private window with cookies disabled, or a sandboxed iframe). The
  page renders in the OS preference and nothing throws.
- Throttle the network to Slow 3G and reload. The flash, if there is one, is much easier to see.

---

## 5. Drift

### 5.1 How a design system dies

Never all at once. Always like this:

1. A deadline. Somebody writes `#0B5AC0` instead of `var(--accent-solid-strong)`. It is correct on
   the day.
2. The palette shifts by two points of lightness in a later revision. The hardcoded value is now
   wrong, invisibly, in one place.
3. Somebody copies that component to make a new one. Now it is wrong in two places.
4. A designer works from the running site rather than the tokens, and matches the wrong value.
   The wrong value is now the reference.
5. A new font arrives for one campaign and is never removed.
6. A component reaches past tier 2 into `--color-brand-9` because the semantic token it needed did
   not exist and adding one felt like a bigger change.
7. Dark mode breaks in that component only, because tier 1 does not swap.
8. Somebody adds a `--color-brand-9-dark` to fix it.
9. Twelve months later the brand book and the product are two different brands, and nobody can say
   which is correct, because nothing was ever written down.

Every step is individually reasonable. That is what makes it drift rather than negligence.

### 5.2 The checks that catch it

`$A check <paths>` reads source files (`.css`, `.scss`, `.less`, `.html`, `.js`,
`.mjs`, `.cjs`, `.ts`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`, `.md`, `.mdx`) and reports.
It never edits.

| Check | Level | Catches |
|---|---|---|
| **Off-palette colour** | error | A hex that is not in any ramp, any semantic token, or black/white. Step 1 above |
| **Near-palette colour** | warn | A hex within 0.03 OKLab distance of a palette colour. Since about 0.02 is a just-noticeable difference, this is "almost, but not exactly, the brand blue", which is worse than being obviously wrong because nobody sees it |
| **Off-brand typeface** | warn | Any `font-family` whose first entry is not a brand face |
| **Banned typeface** | error | Inter, Roboto, Arial, Helvetica Neue, Fraunces, Poppins, Montserrat, Open Sans, Lato, Nunito, Raleway. The faces that make work look machine-generated |
| **Banned vocabulary** | warn | Words on the brand's do-not-use list |
| **`outline: none`** | error | With no `:focus-visible` anywhere in the file. WCAG 2.2 2.4.7 |
| **`@keyframes`** | info | With no `prefers-reduced-motion` anywhere in the file |
| **Purple/indigo gradient** | warn | The most recognisable machine-generated design tell |
| **Gradient orb** | warn | Blurred radial gradient in a circle |
| **Lorem ipsum** | error | Placeholder text in shipped work |
| **Rounded card with a left accent stripe** | warn | The most-generated component on the internet |

Exit code is non-zero when there is at least one error, so it wires into CI without a wrapper:

```yaml
# .github/workflows/brand.yml
- run: $A system         # the palette still passes its own audit
- run: $A tokens         # regenerate
- run: git diff --exit-code brand/tokens       # fail if the committed tokens are stale
- run: $A check src      # hold the code against the system
```

That third line is the one people leave out and the one that matters most: it fails the build when
somebody edited a token file by hand instead of editing the brand file, which is drift entering
through the front door.

### 5.3 Drift is bidirectional

The most common mistake in drift tooling is assuming the document is always right. It is not. When a
brand colour appears nowhere in the codebase, there are two possible fixes and the tool cannot pick
between them:

- The code is missing a colour it should be using. Add it.
- The brand book is carrying a colour nobody needs. **Retire it from the brand book.**

Report both, and make the person choose. A palette that keeps a swatch nobody has used in a year is
accumulating the same debt as a codebase with a stray hex, and it is harder to see.

### 5.4 The guardian

```bash
$A guardian
```

writes a Claude Code skill named after the brand (default `~/.claude/skills/<slug>-brand/`),
containing a `SKILL.md` with the colour table, the type rules, the shape and motion stances, the
voice attributes, the banned vocabulary and the check command, plus a `rules.json` with the machine
form: the full palette map, the fonts, the banned fonts, the banned words, the slop patterns as
regular expressions, and the contrast floors.

The point of it is stated in the emitter itself and is worth repeating:

> That is the difference between a brand book and a brand: one is a document somebody read once, the
> other is a rule that keeps applying.

Any future session, in any project, can load the brand and check its own work before shipping.
Which means the enforcement travels with the brand rather than with the person who commissioned it.

### 5.5 When the system genuinely needs to change

It will. Extending a system is normal; drifting is not. The difference is a record.

```
1. Add the decision and the reason to governance.decisions in brand.json.
2. Bump meta.version.
3. Regenerate: brandi system && brandi tokens && brandi guardian.
4. Commit the regenerated files in the same commit as the brand file change.
```

A change nobody wrote down becomes an inconsistency the next person has to guess about. A change
with a dated reason is a system with a history, and it is the thing that lets somebody in two years
tell an intentional exception from a mistake.

---

## 6. Where a component gets its tokens

Before the contract, one rule about the boundary, because it is the rule that decides whether §5.1
happens to you.

```
A component consumes tier 2 and nothing else.

If the token it needs does not exist, the answer is to add it to tier 2,
not to reach into tier 1 "just this once".

If only this component needs it, add a tier 3 token scoped to the component.
Promote it to tier 2 when a third component needs the same thing.
```

The failure mode has a signature that is easy to grep for: `var(--color-` in a component file.
Every colour a component uses should be `var(--surface-*)`, `var(--text-*)`, `var(--border-*)`,
`var(--accent-*)`, `var(--control-*)`, `var(--focus-ring)` or a status token. The guardian does not
check this one, so it is worth a lint rule of your own:

```bash
grep -rn "var(--color-" src/components && echo "Tier 1 reached from a component"
```

---

## 7. The component contract

Every component in the system is documented in eight states. Not six. The last two are the ones that
matter.

| State | What it needs | The usual failure |
|---|---|---|
| **Default** | The resting appearance. Every token named | Fine. This is the one everybody does |
| **Hover** | Pointer only. Must not be the only way to discover the control | Implemented as a colour change too subtle to notice, or as the only affordance |
| **Active / pressed** | The moment of the press. Distinct from hover | Missing entirely, so the control feels dead on touch |
| **Focus-visible** | The ring: 2px, 3:1 against both the control and the page, 2px offset. Keyboard only | Removed with `outline: none`. WCAG 2.2 2.4.7 |
| **Disabled** | Perceptible but clearly inert. `text.disabled`, no hover, no pointer cursor, and an explanation of *why* somewhere reachable | Rendered at 40% opacity, invisible, and unexplained |
| **Loading** | Preserves layout so nothing jumps. Announced to assistive technology. Honours reduced motion | A spinner that replaces the button, collapsing the layout and losing focus |
| **Empty** | See below | Rendered as a blank area, or as "No data" |
| **Error** | See below | An inherited red border and a message written by a validator |

### 7.1 Why empty and error are where systems fail

**They are not designed, they are discovered.** A component is built with realistic data because
realistic data is what makes the design look good in review. The empty state is what a real user
sees on day one, and the error state is what they see on their worst day. Both arrive as an
afterthought in the last sprint, styled by whoever noticed them.

**They are the states with the most content and the least design.** An empty state has to explain
what would be here, why it is not, and what to do about it. An error state has to say what happened,
whether anything was lost, and what to do next. That is more copy than the default state has, which
is why they are the states where the *voice* shows most clearly and where a brand's tone actually
gets tested.

**They break the token contract quietly.** Error states introduce `danger.*` tokens that nobody
contrast-tested, because the contrast audit ran on the default palette. Empty states introduce
muted text on a subtle surface, which is the lowest-contrast pair the system can produce. Both are
the first place a WCAG 1.4.3 failure appears, and both are usually missing from the screenshots the
audit ran against.

**Nobody screenshots them.** They are absent from the design file, from the review, from the
accessibility pass and from the visual regression suite. The system has no record of what they
should look like, so every new one is invented again.

### 7.2 The floor for each

**Empty state.** Three parts, always:

1. What would be here. Not "No results", but "You have not added any invoices yet".
2. Why it is not here, when the reason is not obvious (a filter is on, a sync has not run, the
   account is new).
3. The one action that changes it, as a real control.

Contrast-test it. The tokens are usually `text.secondary` on `surface.subtle`, which is the pair
most likely to miss 4.5:1.

**Error state.** Four parts:

1. What happened, in the user's terms, not the system's.
2. Whether their work was lost.
3. What to do next, as an action they can take.
4. A reference they can quote if they need to ask someone, when the error is one support will see.

Never apologise, never be vague, and never make the colour do the work: the error state needs the
`danger` colour **and** an icon **and** the words (WCAG 2.2 1.4.1, Level A, and see
`09-accessibility.md` §2.1 and §4.3).

### 7.3 The documentation shape

For each component, a table with one row per state, and the tokens named. If a state cannot be
filled in, the component is not finished.

```markdown
### Button, primary

| State | Background | Label | Border | Other |
|---|---|---|---|---|
| Default | `accent.solid-strong` | `accent.on-solid` | none | `radius.sm`, min 44px target |
| Hover | `accent.solid-hover` | `accent.on-solid` | none | `duration.fast`, `ease.standard` |
| Active | `accent.solid-hover` | `accent.on-solid` | none | No transform. Instant |
| Focus-visible | unchanged | unchanged | none | `2px solid focus.ring`, offset 2px |
| Disabled | `control.bg` | `text.disabled` | none | `cursor: not-allowed`, reason available |
| Loading | `accent.solid-strong` | `accent.on-solid` | none | Width preserved, `aria-busy`, reduced-motion safe |
| Empty | n/a | | | |
| Error | `danger.solid` | `accent.on-solid` | none | Icon plus text, never colour alone |
```

Build this table once per component and the review question stops being "does this look right" and
becomes "is every row filled in". Which is a question that has an answer.
