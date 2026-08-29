# 08 · Logo system

> `$A` is the Brandi command line, resolved once at the start of the session: `brandi` when the
> plugin is installed, or `node <this skill's base directory>/../../scripts/brandi.mjs` from a clone.
> It is never a bare relative path: the working directory is the user's project, not the plugin.

A logo is not a system. A logo system is a set of files, plus rules about which file goes where,
plus the numbers that stop the rules being opinions. This file is how to work those numbers out.

`06-brand-book-outline.md` §7 and §8 say what the brand book must *contain*. This file says how to
*derive* it, and what to do in the case the outline cannot cover: there is no logo at all, and there
is not going to be one this week.

Two rules run through everything below.

> **Every measurement is a ratio of something in the mark, or it is a number you tested.**
> Absolute measurements that came from neither are decoration.

> **Brandi does not draw logos.** It specifies them, typesets wordmarks, writes briefs and judges
> candidates. Section 7 is the honest version of what that means.

---

## 1. The variant set

### 1.1 Derive the variants from the surfaces, not from a checklist

The wrong way to build a variant set is to copy the list from another brand book. The right way is
to write down every surface the mark will actually appear on this year, note the aspect ratio and
the minimum size each one imposes, and let the variants fall out.

A typical small-business surface list:

| Surface | Shape | Constraint it imposes |
|---|---|---|
| Website header | Wide, short, 32 to 48px tall | Needs a horizontal lockup that reads at 40px height |
| Website footer, reversed | Wide, on a dark ground | Needs a white knockout |
| Favicon and browser tab | 16px square | Needs a redrawn symbol, not a scaled lockup |
| Social avatar | Circular crop of a square | Needs a symbol that survives a circle |
| Social banner / OG image | 1200 × 630 | Needs the lockup with clear space at a large size |
| Email signature | Wide, tiny, often rendered from a compressed PNG | Sets the real screen minimum |
| Invoice and letterhead | Wide, printed, mono capable | Sets the print minimum |
| Van, shopfront, signage | Very large, single colour vinyl | Sets the minimum stroke weight and gap |
| Uniform, embroidered | Small, coarse, single or two colour | Usually the hardest constraint in the whole set |
| Partner and sponsor strips | Fixed height, next to other marks | Needs an optical sizing rule, not a fixed height |

Half the variant set is now decided, and each variant has a reason attached to it, which is what
stops it being deleted in a redesign by someone who could not see why it existed.

### 1.2 The standard set

| Variant | Geometry | Use it for | Do not use it for |
|---|---|---|---|
| **Primary lockup** | Horizontal, symbol and wordmark side by side | The default everywhere there is width. Web headers, email, letterhead, social banners | Square and near-square spaces, where it strands whitespace |
| **Secondary lockup** | Stacked, symbol above wordmark | Prominence: posters, signage, banners, vertical formats, anything that wants presence over efficiency | Narrow horizontal bands, where it forces the wordmark too small |
| **Symbol alone** | The mark without words | Contexts where the name is already established on the surface: app icon, avatar, favicon, product stamp, a repeated element | First contact with a new audience, where the name is the point |
| **Wordmark alone** | The name without the symbol | Small horizontal spaces, partner strips, contexts where a symbol at that size would be mush | Contexts requiring a square crop |
| **Descriptor lockup** | Primary plus tagline or division name | Introductory and formal contexts, first year of a new brand, sub-brands | Anywhere the descriptor would fall below its own minimum size |
| **Small-use variant** | Simplified, fewer nodes, thicker strokes | Below the primary's minimum size | Anywhere the full version fits |
| **Social avatar** | Symbol positioned inside a circular safe area | Every platform avatar | Anything not circular-cropped |
| **Favicon and app icon** | A redraw on a pixel grid | Browser tabs, home screens, PWA installs | Nothing else. It is not a small logo |

Two published examples of the "when to use" rule being written properly rather than implied.

Louis Armstrong New Orleans International Airport (MSY) splits by function: horizontal is for
"web, email, social banners", vertical is for "prominence, banners, posters, signage".
<https://flymsy.com/wp-content/uploads/2025/01/250127_MSYBRANDGUIDELINES_PUBLIC.pdf>

GOV.UK specifies a distinct construction for small use rather than a scale-down: the standard crown
is built at "wordmark dot = 2 × crown dot", and the enlarged crown for app icons at
"wordmark dot = 1 × crown dot", with a simplified small crown for favicons.
<https://brand.design-system.service.gov.uk/logo-system/logo-elements>

### 1.3 The rule that makes a variant real

A declared variant that does not exist as a file at a path is a lie the brand book tells for two
years. Brandi's own brand file check enforces the weaker version of this: `identity.logo.files`
must include at least one vector master, or you get a warning.

```
Every variant in the book: name, file path, format, and the sentence saying when to use it.
No path, no variant. Declare it out of scope with a reason instead.
```

---

## 2. Clear space

### 2.1 The principle

Clear space is expressed as a ratio of an element of the mark. Never as an absolute measurement.
An absolute value (`always leave 20mm`) is correct at exactly one size and wrong everywhere else.

This is the single most reliable marker of a professionally written guideline. All six of the
published guidelines examined for this skill do it, and they each pick a different element, which
tells you the choice of element is free but the ratio form is not.

| Organisation | Clear space rule | Source |
|---|---|---|
| **GOV.UK** | Defined by "the dot size within our wordmark". The entire logo system is measured in dots, a unit taken from the mark itself | <https://brand.design-system.service.gov.uk/logo-system/logo-elements> |
| **UK Space Agency** | Exclusion zone "should be equivalent to the height of the uppercase letters", and the same zone applies to the icon used alone. "Whenever possible, leave more space" | <https://assets.publishing.service.gov.uk/media/62c810a9d3bf7f2fffd66c43/2022_brand_guidelines.pdf> |
| **MSY (New Orleans airport)** | "The official clear space around the brand mark is at a minimum 50% of the icon on all sides of the lockup" | <https://flymsy.com/wp-content/uploads/2025/01/250127_MSYBRANDGUIDELINES_PUBLIC.pdf> |
| **Recreation.gov** | "Keep a minimum clear space equal to the character height" | <https://cdn.recreation.gov/Recgov-Logo-Guidelines.pdf> |
| **Johns Hopkins Medicine** | "The minimum clear space surrounding the logo is equivalent to the height of the capital H in Hopkins" | <https://brand.hopkinsmedicine.org/brand/branding-guidelines/logo-guidelines/clear-space-and-minimum-size> |
| **NASA** | "The minimum width for the protected area is 1N height from the edge of the sphere", using a letter from the logotype as the unit | <https://www.nasa.gov/nasa-brand-center/brand-guidelines/> |

### 2.2 Choosing the measuring element

Three criteria. The element must be:

1. **Present in every variant you will apply the rule to.** The cap height of the wordmark is useless
   as a clear-space unit for the symbol used alone. Either pick something in both, or write two
   rules and say which applies where (UKSA writes one rule and states that it applies to the icon
   as well, which works because the icon is sized against the wordmark anyway).
2. **Unambiguous to point at.** "The x-height of the wordmark", "the diameter of the counter in the
   O", "the width of the vertical stem", "the height of the symbol". Not "the logo's visual weight"
   and not "a proportional margin".
3. **Roughly one eighth to one quarter of the lockup height.** Smaller than that and the resulting
   clear space is too tight to protect anything. Larger and the mark strands so much whitespace that
   people will break the rule on the first crowded layout, and once one rule is broken the rest
   follow.

Cap height, x-height and symbol height are the three that satisfy all three criteria most often.
Pick one, then divide.

### 2.3 Writing it

```
Clear space = 1 × the cap height of the wordmark, on all four sides.
Measured from the outermost ink of the lockup, not from the artboard or the file's bounding box.
Applies at every size, in every medium, to every variant.
More is always allowed. Less never is.
```

Four things that sentence gets right, each of which is a real failure when it is missing.

- **"Outermost ink, not the bounding box."** SVG and EPS files routinely carry padded artboards.
  If the rule is measured from the file edge, the clear space is whatever the exporter felt like
  that day, and two files with different padding produce different results from the same rule.
- **"On all four sides."** Otherwise someone will apply it left and right only, and crowd the mark
  against a heading above.
- **"At every size, in every medium."** This is the ratio doing its work. Say it, because people
  read a diagram at one size and assume the diagram is the rule.
- **"More is always allowed."** Otherwise the clear space becomes a target rather than a minimum,
  and marks get placed with exactly one cap height of air in a layout that had room for four.

### 2.4 It is not a rule until it is a diagram

A clear-space paragraph with no drawing is a rule nobody applies. The diagram needs: the lockup,
the measuring element called out and labelled with its name, the four clear-space bands drawn as a
tinted region, and a caption repeating the ratio in words. Brandi emits this as a specification
artboard, so the diagram ships with the numbers rather than being redrawn later from the prose.

### 2.5 Implementing it in code

Clear space is padding derived from the rendered logo height, so it scales with the logo:

```css
.logo {
  /* The ratio, measured once from the artwork, then applied everywhere. */
  --logo-clear-ratio: 0.28;      /* cap height ÷ lockup height, from the SVG */
  --logo-height: 2rem;

  block-size: var(--logo-height);
  padding: calc(var(--logo-height) * var(--logo-clear-ratio));
  box-sizing: content-box;
}
```

In Figma or a similar tool, the same thing is a component with the mark inside a frame that has
that padding, so nobody can place the raw mark by accident. Ship the padded component, keep the
unpadded one in a locked source page.

### 2.6 The four failures

| Failure | What it looks like | Fix |
|---|---|---|
| Absolute value | "Leave 15mm clear space" | Convert to a ratio of a named element |
| Measured from the file edge | Inconsistent results from the same rule | Say "outermost ink" |
| A different rule per variant, with no stated reason | Nobody remembers which is which | One rule, or two with a one-line reason each |
| No diagram | The rule is never applied correctly | Draw it, label the unit |

---

## 3. Minimum sizes

### 3.1 Two numbers, two different failures

Print and screen minimums are not conversions of one another. They describe different failure
modes, and neither derives from the other.

- **Print** fails when a feature closes up in ink: a counter fills, a hairline drops below the
  press's reproducible line weight, two elements bleed into one. It depends on the process, the
  stock and the ink.
- **Screen** fails when a feature drops below one physical pixel and gets antialiased into a grey
  smear, or when subpixel rendering shifts a stroke onto a half-pixel boundary. It depends on the
  device pixel ratio and the compression the image survives on the way to the viewer.

Any guideline that gives only one of the two is incomplete. All five published guidelines examined
give both, in the units of their medium:

| Organisation | Print minimum | Screen minimum |
|---|---|---|
| UK Space Agency | "never appear smaller than a width of 30mm in print" | "never appear smaller than a width of 70 pixels on-screen" |
| MSY | 1.5″ horizontal lockup, 1.6875″ vertical, 5⁄8″ mark alone | 110px horizontal, 120px vertical, 45px mark alone |
| Johns Hopkins Medicine | 1.5″ horizontal, 1.25″ vertical | (Falls back to set type instead) |
| Recreation.gov | 11pt height without tagline, 16.5pt with (reference widths 1″ and 1.5″) | |
| GOV.UK | | 50px wordmark width, 16px crown width |

Note Recreation.gov specifies **height**, not width, and MSY specifies width. Say which dimension
you mean. A rule that does not say is unusable for any mark that is not a fixed aspect ratio.

### 3.2 Derive the screen minimum from the thinnest stroke

This is arithmetic, not judgement, and it should be done before any visual test.

Find the thinnest stroke, gap or hairline anywhere in the artwork. Measure it in the same units as
the lockup width. Then:

```
minimum lockup width (px) = lockup width ÷ thinnest feature width

Worked example
  Lockup width in the SVG          1400 units
  Thinnest stroke (the rule under
  the wordmark)                       10 units
  Ratio                             140 : 1
  Minimum lockup width              140px, at which point that rule is exactly 1px
```

At 140px the hairline occupies one CSS pixel, which on a 1× display is one physical pixel and
renders cleanly if it lands on a whole-pixel boundary. Below 140px it is a fraction of a pixel and
the browser renders it as a lighter grey than the rest of the mark, which reads as a printing
error. Add headroom: the practical minimum is that number rounded up, usually to the next
multiple of ten.

Do the same calculation for the smallest **gap** (the space between two elements that must stay
separate) and for the smallest **counter** (the enclosed white space in an "e" or an "a"). The
minimum is the largest of the three results. Record which one won, because that is what the number
means, and it is what tells the next designer what they may not change.

### 3.3 Then test it, because the arithmetic is a floor and not an answer

**Screen protocol.**

1. Render the lockup at 1× on a standard-density display. Not on the retina laptop it was designed
   on, which hides exactly the failure you are looking for. If you only have a high-density display,
   render at half the target size and view at 100%.
2. Test in the actual delivery path, not in the design tool. The email signature goes through a
   PNG compressor. The Slack unfurl gets resampled. The favicon gets downscaled by the browser.
   Each of those is a different renderer with different rounding.
3. Step back to about arm's length, which is where a logo in a header actually gets looked at.
4. Find the first size at which any feature closes, greys out or merges. That is the failure size.
   The minimum is one step above it.

**Print protocol.**

1. Print at descending widths on the **actual stock**, from the actual process. A laser proof on
   copy paper does not predict offset on uncoated 300gsm, and neither predicts screen print on
   cotton.
2. View at about 40cm in normal office light. Not under a loupe, and not at arm's length on a
   bright screen.
3. Find the first size where a feature fills in or a hairline drops out.
4. Ask the supplier for their minimum reproducible line weight and minimum gap, per process, and
   check your artwork against it. Trade convention puts offset litho hairlines below about 0.25pt
   at real risk of dropping out, but this is a workshop rule of thumb rather than a published
   standard, so get the number from the printer who is actually running the job.
5. Embroidery and single-colour vinyl are usually the hardest constraint any small brand has.
   Get the embroiderer's minimum stitch width and minimum gap before you finalise the mark, not
   after. It is the one constraint that can force a redraw.

### 3.4 Below the minimum, use a different artefact

Never a smaller logo. Three published patterns:

- **GOV.UK** switches to a simplified small crown below 16px width.
- **Johns Hopkins Medicine** stops using the logo entirely and sets the words "Johns Hopkins
  Medicine" in Gill Sans.
- **MSY** ships a dedicated "small use logo" for anything below 110px / 1.5″.

Pick one and specify it. "Do not use the logo below X" with nothing after it means somebody will
use the logo below X, because they still have a 60px slot to fill.

---

## 4. Colour renditions and behaviour on photography

### 4.1 The required renditions

Four, as separate files, not as CSS filters or effects applied at layout time.

| Rendition | Where | Rule |
|---|---|---|
| **Full colour on light** | The default | Specify the light grounds it is approved on, by token, not by "white or light backgrounds" |
| **Full colour on brand or dark** | Coloured panels, dark UI | Some marks need a different internal colour balance here. GOV.UK specifies white and Accent teal on Primary blue, black and Primary blue on light |
| **100% black** | One-colour print, faxes, stamps, legal documents, newspaper | A real one-colour file. Not the colour version desaturated, which produces mid-greys that print as texture |
| **100% white knockout** | Dark grounds, photography, video | Same: drawn as a knockout, not the colour file with a filter |

Add **single-colour brand** (the whole mark in one brand colour) if the brand will ever be screen
printed, embroidered, etched, foiled or cut in vinyl. It will.

**Not every mark may be reversed.** NASA's rule is explicit: "The full-color Insignia … may not be
displayed in reverse." If the mark has an internal figure-ground relationship that inverts into
nonsense, say so and forbid it, rather than shipping a reversed file that is quietly wrong.

### 4.2 Specify print colour in four systems

Anything that will be printed needs Pantone, CMYK, RGB and hex, per swatch. UKSA's format is the
model: `Pantone 7687 / C99 M79 Y13 K1 / R19 G68 B137 / hex 134489`. Mark screen-only colours as
such: UKSA names four colours that are unusable in print, which prevents the specific failure of a
designer picking a screen-only brand colour for a printed brochure.

### 4.3 Photography

This is where logo systems fail in practice, because the mark is fixed and the photograph is not.

**The default should be a ban.** Most brands are better served by a solid plate: place the mark on
a rectangle of a brand colour or of white, sitting on top of the photograph. It is reliable at
every size, in every crop, in every future photograph nobody has taken yet. It costs nothing except
a little visual sophistication.

If the mark does go directly onto photography, the rule needs three parts and all three are
numbers.

1. **A tonal window.** State the luminance band the mark may sit on, and how to check it. Working
   rule: convert the crop under the mark's footprint plus its clear space to greyscale, and require
   every pixel in that region to sit within a stated band (for a white knockout, below 40% lightness;
   for a dark mark, above 75%). If any pixel is outside, the placement is invalid.
2. **A scrim, specified numerically.** Not "add a scrim". A gradient scrim from a named token at a
   named opacity over a named distance, or a solid overlay at a named opacity. Then re-check the
   tonal window over the scrimmed image, because a scrim over a bright sky does less than you think.
3. **An exclusion list.** Never over faces. Never over the subject of the photograph. Never over an
   area of high-frequency detail (foliage, crowds, text, textiles), where the mark's counters fill
   with visual noise even at acceptable luminance.

WCAG's logotype exemption is worth understanding precisely here, because it is routinely misused.
WCAG 2.2 SC 1.4.3 exempts "text that is part of a logo or brand name" from contrast requirements
(<https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum>). That exemption covers the mark.
It does not cover the tagline set in the brand typeface next to it, the navigation, the button, or
anything else on the image. And it does not make an illegible mark a good idea. Use the exemption
to avoid a false compliance failure, never as an argument for a low-contrast placement.

---

## 5. The misuse page

At least twelve, each phrased as a rule a person could break. Not "do not alter the logo in any
way", which is unenforceable and which everybody ignores because it prohibits things that are
obviously fine.

### 5.1 Sixteen rules

1. **Do not recolour the mark outside the palette.** The colour is part of the asset. A green that
   is not the green is a different brand, and the difference is invisible to the person making the
   change and obvious next to a correct one.
2. **Do not scale the mark non-uniformly.** Stretched or squashed. Almost always a placeholder box
   in a template that somebody dragged a corner handle on without holding shift.
3. **Do not rotate the mark.** Including "just a few degrees, to look casual", and including
   vertical set on a spine unless the book explicitly provides a vertical lockup.
4. **Do not mirror or flip the mark.** GOV.UK lists this explicitly, which tells you it happens.
5. **Do not add an outline or stroke to the mark.** It adds a weight the mark was not drawn with,
   and it is almost always an attempt to force contrast that the correct reversed file would have
   provided.
6. **Do not apply drop shadows, glows, bevels, gradients or any other effect.** Four of the five
   published guidelines examined name effects specifically. Recreation.gov, MSY and GOV.UK all
   forbid them outright.
7. **Do not alter the colour balance between elements within the mark.** GOV.UK's first misuse
   rule. Recolouring one element and not the others is more common than recolouring the whole thing.
8. **Do not remove, rearrange or re-lockup the elements.** Somebody rebuilt the lockup in Canva
   because the file was not to hand. Give them the file.
9. **Do not retype the wordmark in any typeface.** The wordmark is drawn artwork, even when it
   started life as set type. Retyping it is a redraw, and it will be off by a kern pair that only
   shows up at billboard size.
10. **Do not place the mark below its stated minimum size.** Usually a footer or a partner strip.
    Use the small-use variant instead.
11. **Do not crowd the mark inside its clear space.** Against a page edge, a heading, a rule, or
    another logo.
12. **Do not place the mark on a busy or low-contrast background without the specified treatment.**
    The most common real failure, because photographs change and the mark does not.
13. **Do not use the reversed version on light, or the light version on dark.** Ships as a grey
    mark on grey and nobody notices until it is printed.
14. **Do not use a raster file where a vector is available, and never a raster that has been
    upscaled.** Pixelation and JPEG haloes around the mark. Four of five guidelines name this.
15. **Do not tile the mark as a pattern or a watermark** unless the book explicitly provides a
    pattern built from it. A mark repeated is a texture, and a texture made from a mark devalues it.
16. **Do not alter the alignment of the descriptor or tagline.** Recreation.gov's two lockup-specific
    rules are "don't center align the tagline" and "don't right align the tagline", which are the
    kind of rules that only exist because somebody did it.

Add rules that are specific to your mark. If the symbol has a fixed relationship to the wordmark,
name the ways it gets broken. If there is a partner lockup, specify the weight relationship
("the airport logo should always carry the same visual weight as any partner brand's logos", MSY).

### 5.2 At least three must be real

A real misuse is one this team has actually shipped, or one a supplier has actually produced.
Generic misuses are table stakes that any template can generate, and nobody has ever stretched a
logo on purpose. Real ones come with receipts, and they are the ones that get prevented.

How to find them: search the shared drive for the logo filename and look at what came back;
look at the last three print proofs; look at the supplier-made assets (the sign writer, the uniform
supplier, the trade show stand, the sponsor's version of your logo on their site); look at what the
CRM or invoicing tool did to it. Screenshot each one with a date and where it appeared. Do not name
the person.

Format each as: the image, a cross badge, and one line saying what happened and when.

> ✕ Retyped in Poppins for the invoice template, March 2026. The wordmark is drawn artwork. Use the SVG.

not

> ✕ Do not alter the logo.

---

## 6. The favicon and app-icon pack

The favicon is a redraw, not a scale-down. Treat it as its own piece of artwork with its own
constraints, and the rest of this section becomes straightforward.

### 6.1 The files a brand needs in 2026

The legacy twenty-file packs are obsolete. Modern browsers downscale well, and the maintained
minimum is small. The reference for the reduced set is Evil Martians' favicon guide, which is
updated in place: <https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs>

| File | Size | Format | Purpose |
|---|---|---|---|
| `favicon.ico` | 32 × 32 | ICO | The fallback. Browsers and crawlers that request `/favicon.ico` at the site root regardless of your markup. One 32px entry is enough |
| `icon.svg` | any | SVG | The primary icon in modern browsers. Scales to every tab size, and can respond to the viewer's colour scheme |
| `apple-touch-icon.png` | 180 × 180 | PNG, opaque | iOS home screen. Must have a baked-in background: transparency renders black. Do not round the corners, iOS masks it |
| `icon-192.png` | 192 × 192 | PNG | Web app manifest, `purpose: any` |
| `icon-512.png` | 512 × 512 | PNG | Web app manifest, `purpose: any`, and install splash screens |
| `icon-maskable-512.png` | 512 × 512 | PNG, opaque, full bleed | Web app manifest, `purpose: maskable`. Android and other platforms crop this to their own shape |
| `og.png` | 1200 × 630 | PNG or JPEG | Open Graph and Twitter/X `summary_large_image` link previews |

**The maskable safe zone is a hard number.** Keep everything that matters inside a circle at the
centre of the icon with a radius of 40% of the icon width (so a 512px icon has a 409.6px diameter
safe circle). The outer 10% edge may be cropped on some platforms. The background must bleed to
all four edges.
<https://web.dev/articles/maskable-icon>

**Google's constraints for search results**: the favicon should be a multiple of 48px square
(48, 96, 144), must be square and at least 8 × 8, the URL must be stable, and Google supports one
favicon per hostname. An SVG satisfies this without a size.
<https://developers.google.com/search/docs/appearance/favicon-in-search>

### 6.2 The HTML

Four lines in `<head>`. That is the whole thing.

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png"><!-- 180×180 -->
<link rel="manifest" href="/manifest.webmanifest">
```

Order matters less than it used to, but keep the `.ico` first: some older parsers take the first
`rel="icon"` they find. Everything else that used to be in this block (`msapplication-*`,
`browserconfig.xml`, `rel="mask-icon"`, the fifteen sized PNGs) can go.

### 6.3 The manifest

```json
{
  "name": "Acme",
  "short_name": "Acme",
  "icons": [
    { "src": "/icon-192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "/icon-512.png", "type": "image/png", "sizes": "512x512" },
    { "src": "/icon-maskable-512.png", "type": "image/png", "sizes": "512x512", "purpose": "maskable" }
  ],
  "theme_color": "#134489",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

`theme_color` and `background_color` are brand decisions, so they belong in the token file and get
written here from it. `background_color` is the splash screen behind the icon during launch, so it
should be the brand's page surface, not white by default.

### 6.4 The dark-mode SVG favicon

An SVG favicon can carry its own stylesheet, so one file covers both browser themes:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    path { fill: #134489 }
    @media (prefers-color-scheme: dark) { path { fill: #ffffff } }
  </style>
  <path d="…"/>
</svg>
```

Support varies and the `.ico` covers what does not honour it, so treat this as a bonus rather than
the primary rendition. Test it: some browsers cache favicons aggressively enough that you will need
a hard reload or a query string to see a change at all.

### 6.5 The Open Graph image

```html
<meta property="og:image" content="https://example.com/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Acme. Commercial laundry, Melbourne.">
<meta name="twitter:card" content="summary_large_image">
```

`og:image` must be an absolute URL, including the scheme and host. Relative paths silently produce
no preview. Declaring width and height lets platforms render a placeholder at the right aspect
ratio before the image loads.

Design the OG image at 1200 × 630 but keep everything essential inside a centred safe area of about
1200 × 600, because some surfaces crop the top and bottom. Set type at a size that survives being
displayed at 300px wide in a chat client, which in practice means nothing smaller than about 40px
in the source file.

### 6.6 Redrawing the mark for 16px

The favicon is drawn on a pixel grid, not scaled onto one. What changes:

- **Drop detail.** Anything that will not survive at 16px is noise at 16px. A three-element mark
  usually becomes one element.
- **Thicken strokes.** Draw them at whole-pixel widths on the 16px grid, then scale the artwork up
  for the larger sizes rather than the reverse.
- **Open the counters.** Enclosed white space closes first. Enlarge it past what looks right at
  large sizes.
- **Reduce to one or two colours.** Colour transitions read as mud at 16px.
- **Consider cropping.** A single letter, or the strongest shape from the symbol, often reads better
  than the whole mark shrunk. GOV.UK's simplified small crown is the published precedent.
- **Snap to the grid.** Every edge on a whole pixel boundary at 16px. Half-pixel edges antialias into
  grey and the mark looks blurred while every other tab looks sharp.

Test by rendering at 16px next to eight real favicons from sites the audience uses. If you cannot
pick it out in under a second, it has failed the only job it has.

---

## 7. When there is no logo

Most small businesses arriving at a brand system have no usable mark. They have a raster with a
white matte, a Canva file nobody can find, or nothing at all. This section is how to work honestly
in that situation, because the dishonest options are easy and expensive.

### 7.1 What Brandi cannot do

**It cannot draw a finished logo.** It has no drawing surface, no curve editor, and no way to
iterate visually on a mark at the resolution real logo work requires. Saying otherwise produces a
worse outcome than saying so.

**A generated raster mark is not a logo.** Even if it looks acceptable in the chat window:

- There is no vector source, so it cannot be reproduced at other sizes, cut in vinyl, embroidered,
  or printed as a spot colour.
- Traced paths from a raster are not drawn paths. They carry hundreds of nodes, wobbling curves and
  antialiasing artefacts baked into the outline, and they fall apart at large sizes.
- It cannot be defended in a trademark application if it resembles something in the training data,
  and you have no way to check whether it does.
- It will read as generated to anybody in the industry, which is the opposite of the job.

`01-evidence-protocol.md` states the same rule from the evidence side: **logo is binary**. If a
usable file exists, use it. If it does not, stop and ask. Never generate one, never redraw one by
eye, never trace a raster and present the trace as the mark. A traced logo is a fabrication with
vector points.

### 7.2 What Brandi can do

Four things, all of them real work:

1. **Specify the system.** Variants, clear space, minimum sizes, renditions, misuse, the favicon
   pack, placement. All of section 1 to 6 can be written before the mark exists, as constraints the
   mark must satisfy. This is genuinely useful: it turns "we need a logo" into a brief with numbers.
2. **Build a wordmark from a licensed typeface.** Covered below. This is a legitimate answer, not a
   placeholder.
3. **Write the brief** that a human designer or illustrator can execute against, or that an image
   model can generate reference material for.
4. **Evaluate candidates** against the tests in section 8, which is where most logo decisions
   actually go wrong.

### 7.3 The four honest answers, ranked

| Option | What it is | When it is right |
|---|---|---|
| **1. Typeset wordmark** | The name set in a licensed face, spaced by eye, outlined to curves | Almost always the right first answer. Ship it, use it consistently, and it accrues equity while you decide whether you need more |
| **2. Modified wordmark** | A typeset wordmark with one deliberate intervention (a joined pair, a replaced counter, a custom terminal), made by a person | When the name is short and there is budget for a few hours of a designer's time |
| **3. Commissioned mark** | A designer or illustrator draws it, working from the brief | When the brand has a symbol-shaped job to do (an app icon, a product stamp, a category where everyone has a mark) and there is real budget |
| **4. Image-model concepts** | Raster concept sketches used as reference material only | Only as input to option 2 or 3. Never shipped, never presented as the mark |

### 7.4 The typeset wordmark is a legitimate answer

Say this to the client plainly, because they will assume it is a compromise. It is not. A large
share of the world's most recognised identities are wordmarks set in, or derived from, an existing
typeface. What makes a wordmark an asset is not that it was drawn from scratch, it is that it is
applied consistently for long enough to be recognised. Distinctiveness comes from memory, not from
originality of construction (Romaniuk, *Building Distinctive Brand Assets*, OUP 2018,
<https://global.oup.com/academic/product/building-distinctive-brand-assets-9780190311506>).

A typeset wordmark beats a bad generated mark on every axis that matters:

- It is honest. Nobody has to pretend an image model designed a brand.
- It is reproducible. Real vector outlines from a real font, at any size, in any process.
- It is legally cleaner. The typeface's licence is known and checkable, and the mark is your
  arrangement of it.
- It does not look like a stock icon, because it is not one. A generated mark almost always lands
  in the same visual territory as thousands of others.
- It can be upgraded without losing equity. Adding a symbol later to an established wordmark keeps
  everything the wordmark has earned. Replacing a bad mark starts again.

### 7.5 The typeset wordmark protocol

**Step 1. Check the licence before you set anything.**

Logo and trademark use is a separate grant at some foundries, and some explicitly forbid it. Check
the EULA or the `OFL.txt` shipped with the files first, then the foundry's licensing page.

SIL Open Font License 1.1 permits logo and branding use with no additional permission, permits
commercial use and embedding, and requires only that derivatives stay under OFL and avoid any
Reserved Font Name. <https://openfontlicense.org/> · SPDX: <https://spdx.org/licenses/OFL-1.1.html>

Google Fonts are all open source and free for commercial use, most under OFL 1.1, some under
Apache 2.0 or the Ubuntu Font Licence. Neither OFL nor Apache 2.0 requires crediting the designer
in the finished design. <https://developers.google.com/fonts/faq>

Paid foundries vary. Assume a separate logo grant is required until the EULA says otherwise, and
get it in writing before the mark goes on a building.

**Step 2. Choose the face for the wordmark specifically.**

Not the same decision as the body face. A wordmark face needs character at large sizes, a
distinctive treatment of at least one letter in the actual name, and a complete set of the glyphs
the name uses (including any diacritics, ampersands or numerals). A face that is perfect at 16px is
often bland at 200px, which is where the wordmark lives.

**Step 3. Do the four things that turn typing into a wordmark.**

1. **Space it optically.** Metric kerning is designed for running text at reading sizes. A wordmark
   is a single object at display size, and it needs the letter spacing adjusted by eye, pair by
   pair, until the rhythm of white space between letters is even. This is the step that separates a
   wordmark from a heading, and it is the step that gets skipped.
2. **Decide case and weight deliberately.** All caps, sentence case and lower case are three
   different brands. Say why you chose one.
3. **Make at most one structural intervention.** A tightened pair, a shortened crossbar, a replaced
   terminal, a ligature. One. Two is a redesign and needs a designer.
4. **Outline the paths.** Convert to curves so the mark is artwork rather than text, and so it
   cannot silently change when the font updates or is missing.

**Step 4. Archive the recipe.** Record the font name, the exact version, the weight, the optical
size axis value if there is one, the size it was set at, and the final tracking and kerning values.
Keep the live-text source file alongside the outlined one. Without this the wordmark cannot be
rebuilt or extended, and adding a new sub-brand name later becomes guesswork.

**Step 5. Declare it in the book.** Name the face, name the licence, name the tier of licence held,
and state what would trigger commissioning a drawn mark ("when we need an app icon", "when we open
a second location", "at $X revenue"). A typeset wordmark declared as a deliberate stage is a
decision. The same wordmark undeclared is an omission somebody will find.

### 7.6 The logo brief template

This is the deliverable when the answer is "commission it". Fill every field. The empty fields are
where the money goes.

```markdown
# Logo brief · [Brand name]
Date: [YYYY-MM-DD] · Owner: [name, role] · Decision-maker: [name] · Budget: [$] · Deadline: [date]

## 1. The brand in one sentence
[What it is, who it is for, what it does that the alternatives do not. No adjectives.]

## 2. The name, exactly as it must be set
Spelling:            [Acme Laundry Co.]
Capitalisation:      [Title case. Never all caps. Never "ACME".]
Spacing and marks:   [One word or two. Ampersand or "and". Diacritics. Punctuation.]
Pronunciation:       [If it is not obvious, say it, because it affects letterform choices.]

## 3. What the mark must not be
[The most useful section in the brief. Be specific and name names.]
- Not: [the category cliché, e.g. a swoosh, a leaf, a house outline, an abstract globe]
- Not: [visually adjacent to a named competitor]
- Not: [any AI-default look. See 04-anti-slop.md]
- Not: [anything that stops working in one colour or at 16px]

## 4. Required variants
[From section 1.2. List only the ones this brand actually needs, with the surface each serves.]

## 5. Hard constraints
Minimum screen size:     [px, and which surface sets it]
Minimum print size:      [mm, and which process sets it]
One-colour requirement:  [yes/no, and which processes: embroidery, vinyl, foil, etching]
Favicon:                 [must survive a redraw to 16px]
Circular crop:           [must survive, for social avatars]
Reversal:                [must work knocked out of the dark surface token]
Longest word to set:     [the constraint a stacked lockup has to solve]

## 6. Colour
Palette:                 [the tokens, with hex, from the resolved system]
One-colour version:      [which brand colour, or black]
Do not use:              [colours the mark may not be rendered in]

## 7. Typography
Brand faces:             [display / body / mono, with licence tier held]
Relationship required:   [must relate to the brand faces / must contrast with them / free choice]

## 8. Distinctive assets to preserve
[Anything already recognised: an existing colour, a shape, a hand-lettered wordmark, a character.
Say which quadrant of the Romaniuk grid it sits in, and say plainly if that placement is an
assumption rather than research. Destroying a Use-or-Lose asset in a rebrand is the most expensive
mistake available here.]

## 9. References, with reasons
[Three. For each: what to take from it, and what NOT to take. "Make it like this" is not a brief.]
1. [ref]. Take: [the specific thing]. Do not take: [the obvious thing].
2. …
3. …

## 10. Deliverables
- Vector masters: SVG and either AI or EPS, paths outlined, no embedded rasters
- Every variant in section 4, as separate files
- Colour, black, white knockout and single-colour renditions of each
- A favicon redraw at 16px, drawn on the grid
- Written back to us: the clear-space ratio (named element), the minimum sizes with the
  feature that determined each, and the construction geometry

## 11. Rights
Full assignment of copyright to [entity], in writing, on final payment.
Working files included. Confirm the designer holds any licence needed for typefaces used.
Confirm the mark is original work and not derived from stock or generated assets.

## 12. How it will be judged
The eleven tests in section 8 of the brand system, applied to every candidate before any
discussion of preference.
```

### 7.7 If an image model is in the loop

It can be, with three rules.

1. **It produces reference, never the mark.** The output is input to a person who will draw the
   real thing. Say this in writing to the client so nobody is surprised.
2. **No text in the image.** Image models mangle letterforms in ways that are hard to see and
   impossible to fix. Generate silhouettes, shapes and compositions. Set the name separately.
3. **Check the output against the exclusion list** in brief section 3 before showing it to anyone.
   The first ten results from any concept prompt cluster on the category cliché, which is exactly
   what the brief said not to do.

A workable prompt shape, kept deliberately narrow:

```
A single flat vector-style symbol, black on white, no text, no letters, centred,
[the concrete subject: "a folded sheet seen edge-on", not "innovation"],
geometric construction, even stroke weight, high contrast, readable at 16 pixels,
no gradient, no shadow, no 3D, no perspective.
```

Then apply the section 8 tests. Most of what comes back fails the one-colour and 16px tests, which
is the fastest way to make the point that this is reference material.

---

## 8. How to evaluate a logo

Run these before anybody says whether they like it. Preference discussions before the tests waste
the tests, because a mark that has been praised is hard to fail on arithmetic.

| # | Test | How | Pass condition |
|---|---|---|---|
| 1 | **16px** | Render at 16 × 16 on a 1× display, next to eight real favicons | Identifiable in under a second, no grey mush |
| 2 | **One colour** | Fill every path 100% black on white, and again white on black | Reads as the same mark. Nothing disappears, nothing merges |
| 3 | **Photograph** | Place over five different photographs including a bright sky, a dark interior and a crowd | Works over at least the specified tonal window with the specified treatment |
| 4 | **Embroidery** | Send it to the uniform supplier at chest-badge size before signing off | Comes back readable, with the gaps still open |
| 5 | **Distance** | Print at signage scale, view at 20 metres. Or blur the digital file by 5% of its width | Silhouette still identifiable |
| 6 | **Telephone** | Describe it in one sentence to somebody who has not seen it. Ask them to draw it | Their drawing is recognisably the same idea |
| 7 | **Inversion** | Rotate 180°, mirror horizontally | Does not become a different, unwanted object |
| 8 | **Stack** | Line it up in greyscale with six competitor marks at the same height | Findable without reading the words |
| 9 | **Cheap reproduction** | Thermal receipt printer, single-colour vinyl, a photocopy of a photocopy | Survives all three |
| 10 | **Five year** | Name the visual devices it depends on. Are any of them a current effect | No gradients, glass, long shadows or other datable treatment carrying the identity |
| 11 | **Distinctiveness** | Plot it on the Romaniuk fame × uniqueness grid | Honest placement, with the note that a real placement needs research with buyers, not a workshop opinion |

Two more things worth being explicit about.

**Tests that do not matter.** Whether the team likes it on day one (new marks always feel wrong,
and the feeling is uninformative). Whether it "means" something (nobody will ever be told the
meaning). Whether it can be reconstructed on a golden-ratio grid (those diagrams are almost always
drawn after the mark is finished, and the golden ratio's claim to be inherently more pleasing has
weak experimental support at best).

**The one test that actually predicts success** is none of the above: it is whether the
organisation will apply it consistently for five years. A mediocre mark applied consistently beats
an excellent mark applied four different ways, which is why the misuse page and the guardian matter
more than the mark does.

---

## 9. Recording it

Everything above lands in `brand.json` under `identity.logo`:

```
identity.logo.files[]          { path, variant, format }  vector master required
identity.logo.variants[]       { name, use, file }
identity.logo.clearSpace       the ratio sentence, naming the measuring element
identity.logo.minSize.printMm  number, with the failing feature recorded in the decision log
identity.logo.minSize.screenPx number, likewise
identity.logo.misuse[]         one entry per rule
identity.logo.favicon          the redraw, not the lockup
```

Note on the misuse shape: the brand book renderer currently reads each entry as a plain string and
prefixes it with "Do not", so write them as bare rules (`"stretch or squash the mark"`). The richer
form in `06-brand-book-outline.md` §8, carrying `what`, `why`, `source` and `image`, is the target
shape and needs a renderer change before it will render.

Brandi's brand-file validation warns when there is no vector master, no clear-space rule, no
minimum size, or fewer than six documented misuses. Those are floors, not targets. Twelve misuses,
three of them real, is the standard this file is written to.

Then hold the work against it:

```bash
$A check <paths>
```

The guardian reports off-palette colours and off-brand typefaces, which catches the two most common
ways a logo system leaks: a mark recoloured to something almost right, and a wordmark retyped in
whatever face was loaded. It reports, it does not edit. Fix what it finds, or record a deliberate
exception in the decision log rather than letting the system quietly drift.
