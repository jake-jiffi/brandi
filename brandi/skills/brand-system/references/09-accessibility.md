# 09 · Accessibility

> `$A` is the Brandi command line, resolved once at the start of the session: `brandi` when the
> plugin is installed, or `node <this skill's base directory>/../../scripts/brandi.mjs` from a clone.
> It is never a bare relative path: the working directory is the user's project, not the plugin.

The floor. Not the ceiling, and not a chapter that lives at the back of the book after the mood
board.

Everything here is written as something to do, with the clause number attached so you can defend it
when somebody asks. The clause number is the part that survives a disagreement. The instruction is
the part that changes the work.

Three framing decisions this skill has made, stated up front so they are not re-argued in every
project:

1. **WCAG 2.2 Level AA is the target.** It is a W3C Recommendation dated 12 December 2024
   (<https://www.w3.org/TR/WCAG22/>), it is a superset of the 2.1 AA that EN 301 549 currently
   cites, and it is what the next cited version of EN 301 549 will require. Designing to 2.1 now
   buys nothing and costs a re-audit later.
2. **APCA is reported, never enforced.** It is a useful second opinion, particularly in dark mode.
   It is not normative anywhere. Section 3 is the honest version.
3. **The brand system owns a specific subset of WCAG.** A brand cannot make your form labels
   correct or your heading order sensible. It can make every colour pair, every focus ring, every
   target size and every motion default either right or wrong by construction, everywhere, at once.
   That subset is section 2, and it is the whole of what this file covers.

---

## 1. What the brand system controls, and what it does not

| The brand system decides it | Somebody else decides it |
|---|---|
| Every colour pair a component can produce | Whether the alt text is any good |
| The focus ring's colour, thickness and offset | Whether the tab order is sensible |
| The minimum target size token | Whether the button is a `<button>` |
| The body size, line height and measure | Whether headings are nested correctly |
| Whether motion is on by default and what "reduced" means | Whether the video has captions |
| Whether status is ever carried by colour alone | Whether the error message says anything useful |

The left column is the one you can fix once. Fix it once.

---

## 2. The criteria

Each entry: the requirement in the spec's own words, what it actually means for a brand decision,
and how to test it. Quoted text is from WCAG 2.2 unless stated.

### 2.1 · SC 1.4.1 Use of Color · Level A

> "Color is not used as the only visual means of conveying information, indicating an action,
> prompting a response, or distinguishing a visual element."

<https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html>

**What it means for a brand decision.** Your status colours are not a status system. Red, amber and
green are four-fifths of a system: they need a shape and a word to be the whole thing. This is
Level A, which means it is the lowest bar in the standard and there is no argument available.

The places it breaks, in order of how often:

- Form validation shown as a red border and nothing else.
- Required fields marked by a coloured label.
- Chart series distinguished only by hue.
- Links inside body text distinguished from surrounding text only by colour. (The specific
  requirement here: if colour is the only difference, the contrast between the link text and the
  surrounding text must be at least 3:1 **and** the link must get a non-colour indicator on hover
  and focus. Underlining body links is the answer that always works.)
- A "selected" state shown only as a tint.
- Availability, capacity and progress shown as coloured bars with no label.

**How to test.** Screenshot the screen, convert to greyscale, and try to complete the task. If you
cannot tell required from optional, error from success, or selected from unselected, it fails. UK
Space Agency's brand guidelines recommend the same low-tech check: "A quick way to check contrast is
to view or print the design in black and white or greyscale."
<https://assets.publishing.service.gov.uk/media/62c810a9d3bf7f2fffd66c43/2022_brand_guidelines.pdf>

**What to do in the system.** Every status token ships as a triple: colour, icon, and a text label
pattern. Brandi's system audit emits an informational finding on exactly this, because success and
danger are the pair that collapses for the most common colour vision deficiencies and also the pair
that carries the most consequence:

> Never carry success or failure in colour alone: pair every status with an icon and a word.

---

### 2.2 · SC 1.4.3 Contrast (Minimum) · Level AA

> "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1"

with three exceptions, verbatim:

> **Large Text:** "Large-scale text and images of large-scale text have a contrast ratio of at least 3:1"
>
> **Incidental:** "Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement."
>
> **Logotypes:** "Text that is part of a logo or brand name has no contrast requirement."

<https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum>

**"Large scale"** is defined in the WCAG glossary as "at least 18 point or 14 point bold". The
near-universal CSS translation is **24px regular / 18.66px bold**, derived from the 1pt = 1.333px
ratio. That conversion is convention, not spec text, so if you are within a hair of the boundary,
round the safe way.

**What it means for a brand decision.** This is the constraint that should shape the palette, not
the thing you check after choosing it. A brand colour that cannot carry text on the page surface is
a brand colour you may only use for fills, borders and shapes, and the book has to say so.

Brandi resolves this at build time rather than at review time. The system audit fails, with a
non-zero exit code, if any of these pairs miss their floor in either theme:

| Pair | Floor | Why |
|---|---|---|
| `text.primary` on `surface.page` | 4.5 | Body copy |
| `text.secondary` on `surface.page` | 4.5 | Secondary text is still text |
| `text.primary` on `surface.raised` | 4.5 | Cards are a different background |
| `text.brand` on `surface.page` | 4.5 | The one people get wrong |
| `focus.ring` on `surface.page` | 3.0 | SC 1.4.11, below |
| `border.strong` on `surface.page` | 1.4 | Perceptibility, not a WCAG floor |

**The logotype exemption is a trap.** It exempts the mark. It does not exempt the tagline set in the
brand typeface beside it, the navigation, the button label, or anything else. Never use it to
justify a low-contrast brand colour anywhere except the mark itself. See `08-logo-system.md` §4.3.

**The other trap: placeholder text.** Placeholder text is text. It is not decoration and it is not
an inactive component. The grey-on-grey placeholder is one of the most common AA failures in
existence, and it usually arrives as a browser default nobody overrode.

**How to test.** `$A system` audits the token pairs. For anything the tokens
do not cover, use a checker that measures rendered pixels rather than declared values: browser
devtools' contrast readout, or WebAIM's checker (<https://webaim.org/resources/contrastchecker/>).
Test the actual rendered state, including hover, disabled and the state after a translucent overlay
has been composited.

---

### 2.3 · SC 1.4.6 Contrast (Enhanced) · Level AAA

> 7:1 for normal text, 4.5:1 for large text. Same three exceptions as 1.4.3.

<https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html>

**What it means for a brand decision.** AAA is not the legal floor and conformance to it across a
whole site is rarely achievable. It is still the right target for two specific things:

1. **Body copy.** Getting body text to 7:1 costs nothing except a slightly darker neutral, and it is
   the single highest-value accessibility decision a palette makes. Brandi's ramps place steps 11
   and 12 at fixed lightnesses chosen to clear WCAG AA and AAA against the zone A surfaces
   (steps 1 to 8).
2. **Anything a person has to read for a long time or under stress**: legal terms, medical
   information, forms, error recovery.

The UK Space Agency book sets AAA as the palette constraint and accepts the consequence out loud:
"It is important that the background and font combinations meet AAA accessibility standards. This
means that certain colours cannot be used for text." That is the right shape for a brand book. The
palette is constrained by contrast rather than by taste, and the exclusions are stated rather than
discovered.

**How to test.** Same tools. Set the target to AAA for the body pair and AA for everything else,
and record which brand colours failed and are therefore fill-only. That list belongs in the book.

---

### 2.4 · SC 1.4.4 Resize Text · Level AA

> "Except for captions and images of text, text can be resized without assistive technology up to
> 200 percent without loss of content or functionality."

<https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html>

**What it means for a brand decision.** Three concrete rules, all of them typography decisions:

1. **Never set a font size in `px` for anything a user reads.** Use `rem`, which respects the
   browser's font size setting. `px` sizes do still zoom in modern browsers, but they ignore a user
   who has set a larger default font size, and that user is exactly the one this criterion exists
   for.
2. **Never use a bare `vw` term in a fluid type formula.** `clamp(1rem, 4vw, 2rem)` does not respond
   to text zoom at most viewport widths, because `vw` is not a font-relative unit. The fix, which is
   Utopia's and which Brandi implements, is to always keep a `rem` term in the preferred value:

   ```
   slope      = (maxSize - minSize) / (maxViewport - minViewport)
   yIntercept = minSize - slope * minViewport
   preferred  = yIntercept + (slope * 100vw)
   ```

   producing `clamp(1.125rem, 1.08rem + 0.22vw, 1.25rem)`, where the `rem` term carries the zoom.
   <https://utopia.fyi/blog/clamp/>

   Brandi's `fluid()` in `scripts/type.mjs` emits exactly this shape and the code says why.
3. **Never fix the height of anything that contains text.** Fixed-height buttons, cards, table rows
   and navigation bars are the way this criterion actually fails: the text scales, the container
   does not, and the text is clipped.

**How to test.** Set the browser's default font size to 200% (in Chrome: Settings, Appearance, Font
size, or `chrome://settings/fonts`). Not the zoom control, which is a different mechanism. Then use
the page. Nothing may be clipped, overlapped or unreachable.

---

### 2.5 · SC 1.4.10 Reflow · Level AA

> "Content can be presented without loss of information or functionality, and without requiring
> scrolling in two dimensions for:
> • Vertical scrolling content at a width equivalent to 320 CSS pixels;
> • Horizontal scrolling content at a height equivalent to 256 CSS pixels.
> Except for parts of the content which require two-dimensional layout for usage or meaning."

<https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>

**What it means for a brand decision.** 320 CSS pixels is not "mobile". It is what a 1280px window
becomes at 400% zoom, which is how a low-vision user on a desktop reads. A design that works on a
phone often still fails this, because the phone layout assumes touch and short content while the
zoomed desktop keeps the desktop content and the desktop mouse.

The brand decisions that break it:

- A minimum width on a container, a table, or a hero.
- Fixed-width sidebars that do not collapse.
- Large display type with no fluid minimum, which forces horizontal scroll on a single word.
- Wide data tables. These are the legitimate exception ("require two-dimensional layout"), but only
  the table scrolls. The page must not.
- Negative margins and absolute positioning used to build a layout effect.

**How to test.** Set the browser window to 1280 × 1024 and zoom to 400%. Read and use the page.
There must be no horizontal scrollbar on the document. Then check the same at 320px wide directly,
which catches the same class of bug faster.

**The system-level fix.** Wide content gets its own `overflow-x: auto` container so it scrolls
inside itself rather than pushing the page. Set `max-width: 100%` on media by default. Express
display type with a fluid minimum small enough to fit 320px.

---

### 2.6 · SC 1.4.11 Non-text Contrast · Level AA

> "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent
> color(s): **User Interface Components** … **Graphical Objects**"

<https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html>

**What it means for a brand decision.** This is the criterion brands trip over most, because it
applies to things nobody thinks of as text:

- Input and select borders, in every state. The default border is the usual failure: a light grey
  hairline on white is often below 2:1.
- Checkbox and radio outlines, and the checked indicator against the box.
- Toggle switch tracks and thumbs, including in the off state.
- Focus rings (also covered by 2.4.7 and 2.4.11).
- Icon-only buttons, where the icon *is* the control.
- Chart series, sparklines, meters and progress bars.
- The boundary of any surface a user must perceive to operate the thing.

Note "against adjacent colour(s)", plural. A focus ring drawn on the boundary between a white card
and a grey page must clear 3:1 against both.

**What it does not cover.** Decorative graphics, and anything where "a particular presentation is
essential". Disabled controls are exempt under the inactive-component clause of 1.4.3, but a
disabled control nobody can see is still a usability failure. Brandi's neutral ramp places
`text.disabled` at step 8, which is perceptible without reading as active.

**How to test.** Pick every interactive component in the system. For each state (default, hover,
active, focus-visible, disabled, error), measure the boundary that carries the meaning against what
is behind it. Six components at six states is thirty-six measurements, which is why it belongs in
the token audit rather than in review.

---

### 2.7 · SC 1.4.12 Text Spacing · Level AA

> "No loss of content or functionality occurs by setting all of the following:
> • Line height (line spacing) to at least 1.5 times the font size;
> • Spacing following paragraphs to at least 2 times the font size;
> • Letter spacing (tracking) to at least 0.12 times the font size;
> • Word spacing to at least 0.16 times the font size."

<https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html>

**What it means for a brand decision.** Two things, and the first one is the one everybody gets
wrong.

1. **This is a resilience requirement, not a styling requirement.** The page does not have to *ship*
   1.5 line height. It has to **survive** a user forcing it. What fails: fixed-height buttons,
   `overflow: hidden` containers, single-line labels with an ellipsis, badges sized to their
   content, and any card grid that assumes equal heights.
2. **Express line height as a unitless number.** `line-height: 1.5`, never `line-height: 24px`. In
   DTCG, line height is a `number`, not a `dimension`, which is a constraint the spec gets right:
   a px line height breaks the relationship to font size that this whole criterion is built on.

Brandi's `lineHeightFor()` never returns less than the body value (default 1.55) for anything at or
below body size, and tightens only as sizes grow, which is what large type needs typographically and
what the criterion permits.

**How to test.** Apply this stylesheet in devtools and use the page. `scripts/type.mjs` exports
`textSpacingStressCss()` so it can be dropped into a test rather than remembered:

```css
body * {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
body p {
  margin-bottom: 2em !important;
}
```

Nothing may be clipped, overlapped or hidden. Bookmarklet versions of the same test exist and are
worth keeping in the toolbar.

**Related, and worth knowing even though it is AAA:** SC 1.4.8 Visual Presentation requires a
mechanism for user-selected colours, a measure of no more than 80 characters, **text that is not
justified**, line spacing of at least 1.5 within paragraphs and paragraph spacing 1.5× the line
spacing, and 200% resize with no horizontal scrolling.
<https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html>
The anti-justification rule is the useful one: ranged-left with a ragged right edge is easier to
read than justified type, because justification opens irregular rivers of white space. UK Space
Agency's book reaches the same conclusion independently: "Avoid justified text."

---

### 2.8 · SC 2.3.3 Animation from Interactions · Level AAA

> "Motion animation triggered by interaction can be disabled, unless the animation is essential to
> the functionality or the information being conveyed."

<https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html>

**And, at Level A and not optional:** SC 2.3.1 Three Flashes or Below Threshold prohibits content
that flashes more than three times in any one second period, unless it is below the general flash
and red flash thresholds.

**What it means for a brand decision.** A brand's motion language belongs in the brand book:
durations, easing curves, which elements move, and why. Every entry needs a stated reduced-motion
behaviour. "Reduced" does not mean "none". Opacity fades are generally safe. What to drop:
large-displacement movement, parallax (specifically named in W3C guidance as a vestibular trigger,
because foreground and background moving at different rates simulates self-motion), scale
animations, spinning, and anything that moves when the user did not ask it to.

The affected population is people with vestibular disorders, for whom non-essential movement can
cause dizziness, nausea and headaches.

2.3.3 is only AAA. Honouring the preference costs nothing and is an expected default in 2026, so
this skill treats it as a floor regardless of level.

**How to test.** Turn on the OS setting (macOS: System Settings, Accessibility, Display, Reduce
motion. Windows: Settings, Accessibility, Visual effects, Animation effects. iOS and Android have
equivalents), then use the site. Anything that still moves a long distance is a finding.

**What the system does.** Brandi writes this into every generated `tokens.css`:

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

<https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>

This blunt version is the right default, because it fails safe. Where a specific animation is
essential to conveying information, override it deliberately in that component and say why. The
guardian flags any file containing `@keyframes` with no `prefers-reduced-motion` anywhere in it.

---

### 2.9 · SC 2.4.7 Focus Visible · Level AA

> "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator
> is visible."

<https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html>

**What it means for a brand decision.** The focus ring is a brand element and it should be designed
like one. It is also the single most commonly deleted accessibility feature in existence, because
`outline: none` is the first thing people write when a browser default ring looks wrong.

The defensible default:

- **2px thick**, solid.
- **3:1 against both the component and the page background**, since it sits on the boundary between
  them (1.4.11).
- **Offset**, so it does not sit on top of the control's own border and become indistinguishable
  from it. `outline-offset: 2px`.
- **Applied with `:focus-visible`**, not `:focus`, so it appears for keyboard users and not on
  mouse click.
- **Never removed without a replacement.** `outline: none` with nothing else is a straight failure.

Brandi writes a `focus.ring` semantic token, picks its ramp step to clear 3:1 against the page in
both themes, audits that, and emits:

```css
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

The guardian raises an **error**, not a warning, on any file containing `outline: none` or
`outline: 0` with no `:focus-visible` rule anywhere in it.

**Related, at AAA:** SC 2.4.13 Focus Appearance asks for a focus indicator at least as large as a
2px perimeter of the component, with 3:1 contrast **between the focused and unfocused states of the
same pixels**. That last part catches a ring that changes hue at the same lightness: it looks
different but measures as barely different, and it fails.

**How to test.** Unplug the mouse. Tab through the whole page. At every stop you must be able to see
where you are without hunting. Do it in both themes.

---

### 2.10 · SC 2.4.11 Focus Not Obscured (Minimum) · Level AA · new in 2.2

> "When a user interface component receives keyboard focus, the component is not entirely hidden due
> to author-created content."

<https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html>

**What it means for a brand decision.** This is the new criterion brands break, and they break it
with the things brands like: sticky headers, cookie banners, chat widgets, sticky footers, promo
bars and floating CTAs. Tab to a link that sits just under the sticky header and it is invisible.

It is **Level AA**, so it is in scope for EN 301 549 conformance.

The design-system fix is one line, applied globally, sized to whatever sticky chrome the brand has:

```css
:root { --sticky-chrome: 4rem; }        /* the real height of the sticky header */
:where(a, button, input, select, textarea, summary, [tabindex]) {
  scroll-margin-block-start: calc(var(--sticky-chrome) + 1rem);
  scroll-margin-block-end: 1rem;
}
```

If the brand also has a sticky footer or a chat bubble, add to the block-end value. If the sticky
header collapses on scroll, use the taller of its two heights.

**The AAA version**, 2.4.12 Focus Not Obscured (Enhanced), requires that *no part* of the component
is hidden, not merely that it is not entirely hidden. Meeting the enhanced version is what the CSS
above actually does, so aim there and get the AA one for free.

**How to test.** Tab through the page from the top with a sticky element present. Then do it again
after scrolling halfway down, and again with a cookie banner open. Every focused element must be
fully visible.

---

### 2.11 · SC 2.5.8 Target Size (Minimum) · Level AA · new in 2.2

> "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:"
>
> **Spacing:** "Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if a
> 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect
> another target or the circle for another undersized target"
>
> **Equivalent:** "The function can be achieved through a different control on the same page that
> meets this criterion"
>
> **Inline:** "The target is in a sentence or its size is otherwise constrained by the line-height of
> non-target text"
>
> **User agent control:** "The size of the target is determined by the user agent and is not modified
> by the author"
>
> **Essential:** "A particular presentation of the target is essential or is legally required for the
> information being conveyed"

<https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>

### 2.12 · SC 2.5.5 Target Size (Enhanced) · Level AAA

> "The size of the target for pointer inputs is at least 44 by 44 CSS pixels", with the equivalent,
> inline, user agent control and essential exceptions.

<https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html>

**What it means for a brand decision.** 24px is the AA floor and it is easy to miss with icon-only
buttons, table row actions, close buttons, pagination, social icons and dense toolbars. The spacing
exception is the escape hatch that lets a 20px icon pass, but only if nothing else falls within its
24px circle, which is exactly the condition a toolbar violates.

**Set the token at 44, not 24.** The AAA figure also matches long-standing Apple and Android touch
guidance, it removes the whole class of problem rather than managing it, and it costs nothing on
desktop because the *hit area* can be 44px while the *visible control* stays 24px:

```css
.icon-button {
  --target: 2.75rem;              /* 44px. FLOORS.targetComfortablePx */
  inline-size: var(--target);
  block-size: var(--target);
  display: grid;
  place-items: center;            /* the visible 20px icon sits in the middle */
}
```

Brandi exports both numbers from `scripts/type.mjs` so a generator can check itself:
`FLOORS.targetMinPx = 24`, `FLOORS.targetComfortablePx = 44`.

**Also new in 2.2, and easy to miss:** SC 2.5.7 Dragging Movements (Level AA) requires that any
function operated by dragging is also achievable with a single pointer without dragging, unless
dragging is essential. That catches sliders, carousels, kanban boards, colour pickers, range inputs,
sortable lists and map panning. The usual fix is to pair every drag affordance with buttons or a
text input.

**How to test.** In devtools, inspect each interactive element and read its rendered box, not its
icon. For undersized ones, check whether a 24px circle centred on it intersects a neighbour. On a
real phone, try the whole flow one-handed with a thumb.

---

## 3. APCA: what it is, and what it is not

**What it is.** The Accessible Perceptual Contrast Algorithm. It computes a lightness contrast
value, **Lc**, on a scale of roughly 0 to ±106. Positive Lc means dark text on a light background,
negative means light on dark. Unlike the WCAG 2 ratio, argument order matters, and the algorithm
accounts for font size and weight rather than treating all text as equivalent.

<https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html>

**Why it exists.** APCA's own critique of WCAG 2 is that the 2.x formula "overstates contrast for
dark colors to the point that 4.5:1 can be functionally unreadable when one of the colors in a pair
is near black". That is why a dark-mode palette can pass every automated check and still read badly,
and it is a real effect that anybody who has built a dark theme has felt.

**What it is not: normative.** As of April 2026, WCAG 3 has no chosen contrast algorithm and APCA
is not in the specification. The WCAG 3 Editor's Draft states that "the contrast algorithm used in
WCAG 3 is yet to be determined". APCA was marked for removal in early 2023 and excluded from the
July 2023 working draft after failing to gain Working Group support. Adrian Roselli's status review
puts WCAG 3 completion at "perhaps 2030 at the soonest".

<https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html>

**"APCA is the WCAG 3 contrast standard" is false.** Do not repeat it, and correct it when a client
or a vendor tool says it.

**The Lc thresholds**, from APCA's own minimum-compliance documentation
(<https://git.apcacontrast.com/documentation/minimum_compliance.html>):

| Lc | Use |
|---|---|
| 90 | Preferred for body text and columns of fluent text (minimum 18px/300 or 14px/400) |
| 75 | Minimum for body text columns (24px/300, 18px/400, 16px/500, 14px/700) |
| 60 | Minimum for non-body content text (no smaller than 48px/200, 36px/300, 24px/400) |
| 45 | Minimum for headlines and large, heavy text |
| 30 | Absolute minimum for other text: spot-readable, placeholder, disabled |
| 15 | Absolute minimum for non-semantic elements. Below this, treat as invisible |

**Why Brandi reports both.** `scripts/color.mjs` implements WCAG 2.2 relative luminance and
contrast ratio, and separately implements APCA Lc at W3 revision 0.1.9, with the deliberate note in
the code that APCA uses a simple 2.4 power curve rather than the sRGB piecewise transfer function.
`contrastReport()` returns both, and `apcaGuidance()` returns the tier as *guidance*, explicitly not
as pass or fail.

The division of labour:

- **WCAG 2.2 is the gate.** It fails the build. It is what EN 301 549 cites, what every automated
  tool measures, and what a complaint or an audit will be assessed against.
- **APCA is the second opinion.** Use it where 2.x is known to be over-permissive: dark mode, and
  large display type. Brandi's audit uses it in exactly one place, as a warning: a label sitting on
  the raw brand colour that reaches less than Lc 60 triggers a recommendation to use
  `accent.solid-strong` for filled buttons instead. That is a case where 2.x would often pass and
  the button would still be hard to read.

**If a colour fails 2.x but passes APCA**, the honest move is Roselli's: document the decision and
prepare a response to the automated finding. Not ignore it, and not claim the tool is wrong.

---

## 4. Colour vision deficiency

### 4.1 Prevalence

The NHS states that colour vision deficiency "affects approximately 1 in 12 men (8%) and 1 in 200
women (0.5%)". <https://www.nhs.uk/conditions/colour-vision-deficiency/>

Colour Blind Awareness puts the worldwide figure at roughly **300 million people**, and around
3 million in the UK (about 4.5% of the population).
<https://www.colourblindawareness.org/colour-blindness/>

Red-green deficiencies account for the overwhelming majority of cases. **Deuteranomaly**, reduced
green sensitivity, is the single most common type at roughly 5% of men.

Putting these figures in the brand book rather than in an engineering document has published
precedent: the UK Space Agency guidelines quote them as a design constraint.

### 4.2 Which pairs collapse

| Pair | What happens |
|---|---|
| **Red / green** | The classic. Under deuteranopia and protanopia they converge on a muddy yellow-brown. This is also success/danger, which is the pair carrying the most consequence |
| **Green / brown** | Indistinguishable for most red-green types |
| **Blue / purple** | Purple loses its red component and reads as blue |
| **Light green / yellow** | Similar lightness plus similar post-simulation hue |
| **Pink / grey** | Pink desaturates toward grey |
| **Any two colours at the same lightness** | Whatever their hues. This is the general rule the others are instances of |

That last row is the useful one. **Separate categories by lightness as well as hue.** Two colours
with similar luminance collapse into the same grey under simulation regardless of how different
they look to you.

Brandi's `cvdSafePair()` simulates the three common dichromacies (Machado 2009) and measures OKLab
Euclidean distance, with a deliberately conservative threshold of 0.10, well above the roughly 0.02
just-noticeable difference, because two brand colours that merely differ are not enough: they must
read as different. The system audit runs it on `success.solid` against `danger.solid` and reports
the expected finding rather than pretending the hues can be fixed.

### 4.3 The rule

> **Colour is never the only carrier.**

Not a preference. WCAG 2.2 SC 1.4.1, Level A. See §2.1. The implementation is always the same:
colour plus shape plus text.

| Signal | Colour | Shape | Text |
|---|---|---|---|
| Success | `success.solid` | Tick | "Saved" |
| Warning | `warning.solid` | Triangle | "Check this before continuing" |
| Error | `danger.solid` | Circle with an exclamation | What went wrong and what to do |
| Info | `info.solid` | Circle with an "i" | The information |

For categorical data specifically, use the **Okabe-Ito** palette, created by Masataka Okabe and
Kei Ito for the Color Universal Design project and popularised by Bang Wong in *Nature Methods*
(2011). Eight colours designed to stay distinguishable under all common CVD types:

```
Orange          #E69F00
Sky Blue        #56B4E9
Bluish Green    #009E73
Yellow          #F0E442
Blue            #0072B2
Vermillion      #D55E00
Reddish Purple  #CC79A7
Black           #000000
```

<https://thenode.biologists.com/data-visualization-with-flying-colors/research/>

If the brand palette must carry the chart series, order the series by lightness rather than by hue,
cap the number of categories at five, and label directly on the marks rather than in a legend.

### 4.4 How to test

1. **The greyscale test.** Convert the screen to greyscale and try to complete the task. Catches
   most of it, needs no tools.
2. **Simulation.** Chrome devtools: Rendering panel, Emulate vision deficiencies (protanopia,
   deuteranopia, tritanopia, achromatopsia, blurred vision). Firefox has the same under
   Accessibility.
3. **The palette check.** Run every pair of colours that must be told apart through
   `cvdSafePair()` before the palette is signed off, not after the charts are built.

---

## 5. The law: the European Accessibility Act, EN 301 549, and Australia

### 5.1 The European Accessibility Act

Directive (EU) 2019/882 became enforceable on **28 June 2025**.

- Overview: <https://www.levelaccess.com/compliance-overview/european-accessibility-act-eaa/>
- Standard: <https://www.deque.com/en-301-549-compliance/>

What matters:

- **Scope** is consumer-facing products and services: e-commerce, consumer banking, e-books,
  telecoms, transport ticketing and information, audiovisual media services, and the hardware and
  interfaces that deliver them.
- **Territorial reach is by market, not by headquarters.** A business anywhere that sells to EU
  consumers is in scope. This is the sentence an Australian business needs to read twice.
- **Microenterprise exemption** for services: fewer than 10 employees **and** under €2 million
  annual turnover. It exempts service providers, not manufacturers of products.
- **Presumption of conformity** comes from meeting the harmonised standard **EN 301 549**.
- Penalties are set by each member state's implementing legislation and range from fines to removal
  of a product from the EU market.

### 5.2 Which version of EN 301 549, and therefore which WCAG

Version matters and is moving.

| Version | WCAG it incorporates | Status |
|---|---|---|
| **V3.2.1** | WCAG 2.1 Level AA | The currently cited harmonised version |
| **V4.1.0** | (draft) | Went out for public comment November 2025 |
| **V4.1.1** | **WCAG 2.2 Level AA** in clauses 9 (web), 10 (documents) and 11 (software) | Scheduled for citation in the Official Journal around **30 November 2026** |

Draft: <https://www.etsi.org/deliver/etsi_en/301500_301599/301549/04.01.00_20/en_301549v040100ev.pdf>

WCAG 2.2 adds nine success criteria over 2.1 and obsoletes one
(<https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/>). The six at Level A or AA become
mandatory when V4.1.1 is cited:

| SC | Name | Level | Covered here |
|---|---|---|---|
| 3.2.6 | Consistent Help | A | Not a brand system decision |
| 3.3.7 | Redundant Entry | A | Not a brand system decision |
| **2.4.11** | Focus Not Obscured (Minimum) | AA | §2.10 |
| **2.5.7** | Dragging Movements | AA | §2.11 |
| **2.5.8** | Target Size (Minimum) | AA | §2.11 |
| 3.3.8 | Accessible Authentication (Minimum) | AA | Not a brand system decision |

Three of the six are things a design system fixes centrally, once. Also note that **4.1.1 Parsing is
obsolete and removed in 2.2**, so a system audited against 2.1 may be carrying findings that no
longer exist.

### 5.3 Why an Australian business should care anyway

Four reasons, in order of how directly they bite.

1. **You may already be in scope.** The EAA reaches by market. If you sell to consumers in the EU,
   headquarters in Melbourne changes nothing.
2. **Australian law has covered this since 2000.** The Disability Discrimination Act 1992 (Cth)
   makes it unlawful to discriminate in the provision of goods and services. In *Maguire v Sydney
   Organising Committee for the Olympic Games*, the Human Rights and Equal Opportunity Commission
   found that a website is a "service" under the Act and that SOCOG had unlawfully discriminated
   against a blind complainant, ordering the site fixed and awarding $20,000 in damages. It is the
   foundational Australian digital accessibility decision.
   <https://www.w3.org/WAI/business-case/archive/socog-case-study> ·
   <https://humanrights.gov.au/our-work/disability-rights/chapter-1-legal-and-human-rights-obligations>
3. **The Australian Human Rights Commission publishes guidance under s 67(1)(k) of the DDA.** Its
   *Guidelines on equal access to digital goods and services* (2025) update the 2014 *World Wide Web
   Access: Disability Discrimination Act Advisory Notes* ver 4.1, and recommend WCAG 2.2 Level AA or
   higher to minimise the risk of discrimination.
   <https://humanrights.gov.au/our-work/disability-rights/publications/guidelines-equal-access-digital-goods-and-services>
4. **Procurement.** Government and enterprise tenders increasingly ask for a conformance statement.
   Not having one removes you from the shortlist before anyone reads the pitch.

**The practical conclusion:** design to WCAG 2.2 AA now. It is a superset of what is currently
cited, it is what the next citation requires, it is what the AHRC recommends, and the delta is small
if the design system handles contrast, focus, target size and motion centrally. Which is what
sections 2 and 6 are for.

---

## 6. Pre-flight checklist

Run this before shipping. It is ordered so the cheap automated checks fail first.

### 6.1 Automated, from the token system

```bash
# 1. Resolve and audit the design system.
#    Non-zero exit means a contrast pair below its floor in one of the themes.
$A system

# 2. Regenerate the tokens so what ships is what was audited.
$A tokens

# 3. Hold the real work against the real system.
#    Off-palette colour, off-brand type, banned vocabulary,
#    outline: none with no :focus-visible, @keyframes with no reduced-motion.
$A check src

# Machine-readable, for CI:
$A check src --json
```

`brandi check` exits non-zero when there is at least one error-level finding, so it wires into CI
as-is. What it catches that matters here: `outline: none` without a `:focus-visible` replacement is
an **error**; a file with `@keyframes` and no `prefers-reduced-motion` is an **info**; a colour that
is not on the palette is an **error**, which is how a low-contrast one-off gets caught before a
human sees it.

**What these commands do not check**, stated plainly so nobody mistakes a green build for
conformance: keyboard order, focus obscuring by sticky chrome, target size in your markup, reflow at
320px, whether alt text is meaningful, heading structure, form labels, or anything about the actual
DOM. Those need the manual checks below.

### 6.2 Automated, in the browser

- [ ] Run axe DevTools or Lighthouse on every template. Zero violations at "serious" or "critical".
      Automated tools catch roughly a third of issues, so a clean run is a starting point.
- [ ] Run it again in dark mode. Different tokens, different results.
- [ ] Run it again on a page in an error state and a page in an empty state, which is where the
      contrast failures actually live (see `10-implementation.md` §7).

### 6.3 Manual, fifteen minutes per template

- [ ] **Keyboard only.** Unplug the mouse. Reach every control, in a sensible order, and see the
      focus ring at every stop. (2.4.7)
- [ ] **Sticky chrome.** Tab through with the sticky header, the cookie banner and the chat widget
      all present. Nothing focused is hidden. (2.4.11)
- [ ] **200% text.** Browser default font size at 200%, not zoom. Nothing clipped. (1.4.4)
- [ ] **400% zoom at 1280px.** No horizontal document scroll. Wide tables scroll inside themselves.
      (1.4.10)
- [ ] **Text spacing stress test.** Apply the CSS from §2.7. Nothing clipped or overlapped. (1.4.12)
- [ ] **Greyscale.** Complete every task with colour removed. (1.4.1)
- [ ] **CVD simulation.** Deuteranopia and protanopia in devtools. Status still legible. (1.4.1)
- [ ] **Reduced motion.** OS setting on. Nothing travels a long distance. (2.3.3)
- [ ] **Target size.** Every icon-only control, table row action, close button and pagination link
      has a 44px hit area. (2.5.8)
- [ ] **Drag alternatives.** Every slider, carousel and sortable list is operable without dragging.
      (2.5.7)
- [ ] **Both themes.** Everything above, twice.

### 6.4 Record it

- [ ] Write down which brand colours are fill-only because they cannot carry text. That list is a
      brand decision and belongs in the book, not in a ticket.
- [ ] Write down every deliberate exception, with the reason, in the decision log. An undocumented
      exception is indistinguishable from a bug in six months.
- [ ] State the conformance target in the brand book: "WCAG 2.2 Level AA, with AAA contrast for body
      copy." A target that is not written down is not a target.

---

## 7. The three things worth remembering

1. **Do it at authoring time, not review time.** A palette that cannot fail its own contrast audit
   never ships a contrast failure. A palette checked at the end ships a redesign.
2. **Colour is never the only carrier.** It is Level A, it is the cheapest fix in the standard, and
   it is the one brands break because status colours feel like a complete system on their own.
3. **The accessibility chapter goes in the brand book, not in an appendix.** UK Space Agency gives
   it three pages and constrains the palette with it. GOV.UK titles its colour page around contrast
   requirements. That is the shape of a brand book that will still be accessible in three years,
   because the constraint is written where the decisions are made.
