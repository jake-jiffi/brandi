# 07 - Logo production, export and scoring

Research target: the production and evaluation layer for the logo engine in `brandi`
(`/Users/jakeshelley/dev/jiffi-design-branding-skill/brandi`). Hard constraint: zero npm
dependencies, Node 18+ built-ins only, plus the headless Chrome already used for PDF export.

Repos read (source, not just READMEs), all under
`/Users/jakeshelley/dev/jiffi-design-branding-skill/research/benchmarks/`:

| Key | Repo | What it actually contributes |
|---|---|---|
| LL | `mcpware_logoloom` | MCP export/optimise/text-to-path tools. Depends on sharp, svgo, opentype.js. |
| WAG | `alonw0_web-asset-generator` | Python/Pillow favicon and OG generator. |
| PAL | `Paldom_icon-designer-skills` | The most rigorous source. Pure-stdlib SVG lint, ICO writer, cited platform matrix. |
| QGY | `qiguangyang_logo-generator-skill` | **Zero-dependency Node**. Real ICO encoder, manifest, canvas rasterisation. Not on the original list but it is the closest match to brandi's constraints, so it is included. |
| BP | `DiegoAmorimDev_brandpress` | Print pipeline, ink-coverage QA, WCAG contrast, outline QA. |
| DR | `designrique_ai-graphic-design-skill` | Vectorisation pipeline and prompt formulas. |
| DNN | `dungnotnull_startup-brand-identity-guidelines-agent-skill` | The five-dimension weighted rubric. |

Three claims in this document were verified by running code rather than by reading it. They are
marked **[verified]** and the method is stated inline.

---

## 0. Executive position

The two repos the brief named for the export matrix disagree, and **both are wrong in ways that
ship broken files**:

- **LL writes a PNG and names it `favicon.ico`.** `export-brand-kit.mjs:95-98` renders a 32px PNG
  and writes it to `favicon.ico` with the comment "browsers accept this". **[verified]**
  `docs/favicon.ico` in that repo is byte-identical to `docs/icon-32.png` (`cmp` reports no
  difference; `file(1)` reports `PNG image data, 32 x 32`). It is not an ICO container.
- **WAG writes a real ICO that silently contains only one size.**
  `scripts/generate_favicons.py:134-136` resizes to 16px, then calls
  `icon_16.save(ico_path, format='ICO', sizes=[(16,16),(32,32)])`. Pillow's ICO plugin drops any
  requested size larger than the source image, so the 32px entry is discarded. `icon_32`
  (line 135) is computed and never used. Line 138 nonetheless prints
  `"✓ Generated favicon.ico (16x16, 32x32)"`. **[verified]** on Pillow 11.3.0: the resulting file
  reports `1 icon, 16x16`.

The repos that get it right are **PAL** (`icon-export/scripts/export_icons.py:203-228`) and
**QGY** (`scripts/lib/ico.js:10-44`). Two independent implementations of the same layout, one
Python and one pure Node. QGY's is directly usable in brandi: it is dependency-free, 46 lines, and
already `module.exports`-shaped.

**Recommendation: take QGY's ICO encoder and PAL's platform matrix. Ignore LL's and WAG's
favicon handling entirely.**

---

## 1. The complete export matrix

### 1.1 What each repo actually writes

**LL** (`src/tools/export-brand-kit.mjs`, filenames pushed to `results[]`):

| File | Line | Notes |
|---|---|---|
| `logo-full-light.svg` | 26 | input SVG, passed through unchanged |
| `logo-full-dark.svg` | 30 | only if a `darkSvg` argument was supplied |
| `logo-full-800w.png`, `logo-full-400w.png` | 35-39 | width-constrained, height auto |
| `logo-full-mono-black.svg`, `logo-full-mono-white.svg` | 42-44 | |
| `icon-light.svg` / `icon-dark.svg` | 55, 61 | only if icon extraction succeeded |
| `icon-mono-black.svg`, `icon-mono-white.svg` | 68-70 | |
| `icon-{16,32,48,64,128,180,192,256,512,1024}.png` | 81-85 | ten sizes, one loop |
| `icon-512.webp` | 88-93 | quality 90 |
| `favicon.ico` | 96-98 | **a 32px PNG, see section 0** |
| `wordmark-light.svg` / `wordmark-dark.svg` | 109, 115 | |
| `wordmark-600w.png`, `wordmark-300w.png` | 122-126 | |
| `wordmark-mono-black.svg`, `wordmark-mono-white.svg` | 129-131 | |
| `og-image.png` 1200x630 | 141-143 | |
| `twitter-header.png` 1500x500 | 146-148 | |
| `github-social-preview.png` 1280x640 | 151-153 | |
| `preview.html` | 159-161 | contact sheet |
| `BRAND.md` | 167-169 | guidelines |

No `site.webmanifest`. No maskable variant. No head snippet. No square/rounded distinction.

**WAG** (`scripts/generate_favicons.py:46-57`, `scripts/generate_og_images.py:22-26`):

`favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png`, `favicon.ico` (broken),
`apple-touch-icon.png` (180), `android-chrome-192x192.png`, `android-chrome-512x512.png`,
`og-image.png` (1200x630), `twitter-image.png` (1200x675), `og-square.png` (1200x1200).

Head tags are emitted by `generate_html_tags()` at `generate_favicons.py:252-270`. No manifest,
no maskable, no SVG icon.

**PAL** (`icon-export/scripts/export_icons.py:320-341` build the render plan):

```
web:     apple-touch-icon.png (180, SQUARE source)
         icon-192.png, icon-512.png   (ROUNDED source)
         icon-mask-512.png (512, SQUARE source, purpose:maskable)
         favicon.ico (16+32+48, rounded source)   -- lines 388-404
         icon.svg (master copy)                   -- line 405
         snippet.html, manifest.webmanifest       -- lines 407-409
apple:   appstore-1024.png (SQUARE, alpha flattened at line 384-386)
         icon.iconset/{10 iconutil-named files}   -- ICONSET, lines 46-52
         icon.icns via iconutil                   -- lines 411-421
android: play-store-512.png (SQUARE, alpha flattened)
github:  social-preview-1280x640.png, avatar-512.png (SQUARE)
```

**QGY** (`scripts/logo-studio.js:20-33` and `209-240`):

`logo-{16,32,48,64,128,256,512,1024}.png` (padding 0), `apple-touch-icon.png` (180, padding 0),
`icon-192.png` and `icon-512.png` (padding 0.1), `logo.svg`, `favicon.ico` (16+32+48),
`site.webmanifest`, `head-snippet.html`.

**BP** delivers a directory shape rather than a filename list (`skills/brandpress/SKILL.md:99-111`):

```
brand/
  logo/   symbol, wordmark, lockups - svg + pdf + png, every version
  icon/   16 -> 1024 px, plus the source vector
  print/  pieces with bleed and TrimBox in the filename
  manual/ the brand manual PDF
  fonts/  the typefaces used, with their licence
  pipeline/ the generators
  README.md
```

Naming convention, `SKILL.md:110-111`: `brand-piece-variant.ext`, lowercase, hyphens; print files
carry trim size and bleed in the name (`card_85x55mm_bleed3mm.pdf`).

### 1.2 Reconciling the disagreements

**(a) Rounded master versus square master. This is the difference that matters most, and only PAL
gets it right.**

`icon-export/references/platform-targets.md:83-88`:

| Surface | Variant | Why |
|---|---|---|
| `favicon.ico`, `icon.svg`, 192/512, README/docs, avatars, `.icns` | rounded master | nothing else will round it |
| `apple-touch-icon`, App Store 1024, Play 512, maskable | square (`rx=0`) | platform applies its own mask; pre-rounding double-masks and leaves transparent corner slivers |

The mechanism is `square_variant()` at `export_icons.py:258-270`: deep-copy the tree, set the
background rect's `rx` and `ry` to 0. LL, WAG and QGY all export one icon to every surface, so
their `apple-touch-icon.png` will be double-masked by iOS if the mark has rounded corners baked in.
`icon-draw/references/icon-geometry.md:16-20` states the same rule from the drawing side.

**(b) `favicon.ico` contents.** PAL and QGY both embed 16+32+48
(`export_icons.py:45`, `logo-studio.js:215`). PAL cites the reason at
`platform-targets.md:78-81`: those are "the sizes Windows actually picks for
tabs/taskbar/desktop". WAG's `references/specifications.md:9` says 16+32 only; its code delivers
16 alone. **16+32+48 is right.**

**(c) Social image sizes.** Three different answers:

| Size | LL | WAG | PAL | Verdict |
|---|---|---|---|---|
| 1200x630 og-image | yes (`:141`) | yes (`:23`) | no | Correct and universal. Facebook, LinkedIn, WhatsApp, and Twitter's `summary_large_image` all accept it. |
| 1200x675 twitter-image | no | yes (`:24`) | no | 16:9. Optional. Adds a file for a case the 1200x630 already covers. |
| 1200x1200 og-square | no | yes (`:25`) | no | Optional. |
| 1280x640 github social preview | yes (`:151`) | no | yes (`:335`) | Correct, and it is the one with a primary citation: `platform-targets.md:67-69` links GitHub's own docs (1280x640 recommended, 640x320 minimum). |
| 1500x500 twitter-header | yes (`:146`) | no | no | **Category error.** This is a profile banner, not a link-share card. LL files it under "SOCIAL MEDIA SIZES" beside the OG image, which conflates two unrelated jobs. Keep it if you want, but do not treat it as a share image. |

**(d) `icon-256.png` labelled "Windows tile".** LL asserts this at `export-brand-kit.mjs:78` and
again in the generated `BRAND.md` (`export-brand-kit.mjs:373`). Windows tiles are declared through
`browserconfig.xml` at 70/150/310x150/310 px. 256 is not a tile size. This is my assessment, not a
repo claim, and the tile mechanism is largely obsolete anyway. Treat `icon-256.png` as a
general-purpose high-DPI size and drop the label.

**(e) Naming conventions.** Three in play: LL's `icon-{n}.png`, WAG's
`favicon-16x16.png` / `android-chrome-192x192.png` (the RealFaviconGenerator convention), PAL and
QGY's `icon-{n}.png` plus role-named files. PAL's set is the smallest that covers every surface and
is the one with citations behind it (`platform-targets.md:9-35`, sourced to Evil Martians' "How to
Favicon"). Prefer it.

### 1.3 The matrix I would ship in brandi

Grouped by what produces it, so the zero-dependency cost is visible. "R" = rounded master,
"S" = square master (`rx=0`).

**Vector (string manipulation only, no rasteriser):**

```
logo/  logo-full-light.svg      logo-full-dark.svg
       logo-full-mono-black.svg logo-full-mono-white.svg
       wordmark-light.svg       wordmark-dark.svg
       wordmark-mono-black.svg  wordmark-mono-white.svg
       icon-light.svg           icon-dark.svg
       icon-mono-black.svg      icon-mono-white.svg
       icon-square.svg          (rx=0 variant, source for masked targets)
```

**Raster (headless Chrome, one page, one canvas call per file):**

```
web/   favicon.ico              (16+32+48 PNG-in-ICO, R)
       icon.svg                 (copy of icon-light.svg)
       apple-touch-icon.png     180   S, opaque
       icon-192.png             192   R
       icon-512.png             512   R
       icon-mask-512.png        512   S, 40% safe radius, opaque
       site.webmanifest
       head-snippet.html
icon/  icon-{16,32,48,64,128,256,512,1024}.png   R
logo/  logo-full-{400,800}w.png    wordmark-{300,600}w.png
social/og-image.png             1200x630
       github-social-preview.png 1280x640
docs/  preview.html             contact sheet (LL's is a good model, :261-340)
       BRAND.md
```

Optional, gated on a flag, because each costs a real amount of work:
`appstore-1024.png` (S, alpha flattened), `play-store-512.png` (S, alpha flattened),
`icon.iconset/` + `.icns` (macOS only, needs `iconutil`), `twitter-image.png` 1200x675,
`og-square.png` 1200x1200.

Two rules worth writing into the skill, both from PAL:

- **Opaque where the store demands it.** Play Store rejects transparency
  (`platform-targets.md:58-60`); App Store artwork must be flattened
  (`platform-targets.md:43-44`). PAL implements this as `flatten_appstore_png()` called at
  `export_icons.py:384-386`, and detects alpha by reading IHDR colour type 4 or 6 directly from the
  PNG header (`export_icons.py:178-180`), which is a zero-dependency technique brandi can copy
  verbatim.
- **Verify every raster after writing it.** `export_icons.py:377-381` re-reads each PNG's IHDR and
  fails if the dimensions are not exactly what was asked for. `png_size()` at
  `export_icons.py:168-175` does it with `struct.unpack(">II", head[16:24])` after checking the
  8-byte signature and the `IHDR` literal at offset 12. In Node: `buf.readUInt32BE(16)` and
  `buf.readUInt32BE(20)`. This catches silent renderer failures, which is the single most common
  way an export pipeline ships a broken kit.

---

## 2. favicon.ico: the container format, byte by byte

Neither LL nor WAG explains the format. PAL documents it in prose at
`icon-export/references/platform-targets.md:75-81` and implements it at
`icon-export/scripts/export_icons.py:203-214`. QGY implements it in pure Node at
`scripts/lib/ico.js:10-44`, with the header comment at `ico.js:3-6`:

> Layout: ICONDIR header (6 bytes) + one ICONDIRENTRY (16 bytes) per image + raw PNG blobs.
> Hand-encoded, no image libraries.

Two independent implementations agreeing byte for byte is strong evidence. I also built one and
parsed it back.

### 2.1 PNG-in-ICO versus BMP-in-ICO

An ICO entry's payload may be either:

1. **A BMP-ish blob**: a `BITMAPINFOHEADER` (40 bytes) whose `biHeight` is **double** the real
   height, followed by the XOR colour mask and then a 1-bit AND transparency mask, each row padded
   to a 4-byte boundary. No `BITMAPFILEHEADER`. This is the original 1985 format.
2. **A complete PNG file**, signature and all, stored verbatim. Supported by Windows Vista and
   later and by every current browser.

**Write PNG-in-ICO.** PAL's implementation comment (`export_icons.py:204`) says
"ICO container with PNG-compressed entries (supported since Vista)"; QGY's (`ico.js:4`) says
"supported by all modern browsers and Windows Vista+". The doubled-height quirk and the padded AND
mask are the two things people get wrong in BMP-in-ICO, and PNG-in-ICO avoids both. There is no
reason to write BMP entries in 2026.

Historical caveat if you ever need it: 256x256 entries are conventionally always PNG, because the
BMP path has no way to express 256 in the single width byte.

### 2.2 Byte layout

Little-endian throughout. `n` = number of images.

**ICONDIR, 6 bytes at offset 0:**

| Offset | Size | Type | Value | Meaning |
|---|---|---|---|---|
| 0 | 2 | uint16LE | `0` | Reserved, must be 0 |
| 2 | 2 | uint16LE | `1` | Type. 1 = icon, 2 = cursor |
| 4 | 2 | uint16LE | `n` | Image count |

**ICONDIRENTRY, 16 bytes each, starting at offset 6, one per image in order:**

| Offset (within entry) | Size | Type | Value | Meaning |
|---|---|---|---|---|
| +0 | 1 | uint8 | width, or `0` if 256 | Width in px. 256 does not fit in a byte, so 0 means 256 |
| +1 | 1 | uint8 | height, or `0` if 256 | Same rule |
| +2 | 1 | uint8 | `0` | Palette colour count. 0 for truecolour |
| +3 | 1 | uint8 | `0` | Reserved, must be 0 |
| +4 | 2 | uint16LE | `1` | Colour planes |
| +6 | 2 | uint16LE | `32` | Bits per pixel |
| +8 | 4 | uint32LE | `png.length` | Byte length of this image's data |
| +12 | 4 | uint32LE | absolute offset | Offset from the **start of the file** to this image's data |

**Image data** follows all `n` entries, concatenated in the same order. First blob starts at
`6 + 16 * n`.

Both implementations write the `0 if 256` rule the same way:
`export_icons.py:209` uses `0 if size >= 256 else size`; `ico.js:32-33` uses
`e.size === 256 ? 0 : e.size`.

### 2.3 Verified output

**[verified]** I ported `ico.js` into a standalone Node script, fed it the real 16/32/48 PNGs from
`mcpware_logoloom/docs/`, and parsed the result back with `file(1)` and Pillow.

```
bytes: 2502
header:  00 0000 0100 0300          reserved=0, type=1, count=3
entry 0: 1010 00 00 0100 2000 7f010000 36000000
         w=16 h=16 planes=1 bpp=32 len=383  off=54
entry 1: 2020 00 00 0100 2000 16030000 b5010000
         w=32 h=32 planes=1 bpp=32 len=790  off=437
entry 2: 3030 00 00 0100 2000 fb040000 cb040000
         w=48 h=48 planes=1 bpp=32 len=1275 off=1227
```

`6 + 16*3 = 54`, matching entry 0's offset. `54 + 383 = 437`, matching entry 1. `437 + 790 = 1227`,
matching entry 2. `file(1)` reports `MS Windows icon resource - 3 icons`; Pillow reports
`sizes: [(16,16), (32,32), (48,48)]`.

### 2.4 The encoder, and how to validate it

QGY's `ico.js:10-44` is the reference. Its input validation is worth keeping: it rejects a
non-array or empty input (`:11-13`), a size outside 1..256 (`:15-17`), and any buffer whose first
eight bytes are not the PNG signature `89 50 4E 47 0D 0A 1A 0A` (`:18-20`). That last check is what
would have caught LL's bug.

PAL adds a structural read-back at `export_icons.py:217-228`, and calls it before declaring success
(`:400-402`). Worth copying, it is nine lines:

- header unpacks to exactly `(0, 1, expected_count)`;
- for each entry, seek to its declared offset and confirm the eight PNG signature bytes are there;
- confirm `offset + length` does not run past the end of the file.

That validates the two failure modes that actually occur (wrong count, wrong offset arithmetic) and
costs nothing.

---

## 3. Maskable PWA icons, `site.webmanifest`, apple-touch, and the `<head>` snippet

### 3.1 The safe zone, and the mistake everyone makes

`Paldom_icon-designer-skills/skills/icon-export/references/platform-targets.md:23-26`, tagged
[primary] and cited to web.dev and the W3C manifest spec:

> Maskable safe zone: the guaranteed-visible region is a centered circle with radius = **40% of the
> icon's minimum dimension** (diameter 80%); outer 10% ring is routinely cropped.

Restated at `icon-draw/references/icon-geometry.md:52-55`, which adds the Android cross-check: the
adaptive icon spec's 66dp safe diameter on a 108dp canvas is the same band.

So on a 512px maskable icon: **safe circle centred at (256, 256), radius 204.8px.** On PAL's
1024 master: radius 409.6, which the lint rounds to `r=409` (`icon-geometry.md:57`).

**The mistake:** "80% diameter" gets implemented as "scale the logo to 80% of the canvas", which is
a *square*, not a circle. QGY does exactly this: `logo-studio.js:31-32` sets `padding: 0.1` for
`icon-192.png` and `icon-512.png` with the comment "maskable PWA icons: logo occupies the central
80% safe zone", and `scripts/gallery.html:154` computes `const inner = size * (1 - 2 * padding)`,
giving a centred square of side 80%.

That square's corners lie outside the safe circle. **[verified]** by computation:

- A centred square of side `s` has half-diagonal `s·√2/2`.
- It fits inside a circle of radius `0.40·canvas` only when `s ≤ 0.40·√2·canvas = 0.5657·canvas`.
- So the largest **square** glyph bounding box that is fully safe is **56.6% of the canvas**, not 80%.
- QGY's 80% square has a half-diagonal of `0.8·√2/2 = 56.6%` of the canvas, well beyond the 40% radius.

PAL is the only repo that handles this correctly, and states it explicitly at
`icon-geometry.md:58-61`:

> The circle **overrides the 45-64% size band**: a square-ish bbox fits the circle only up to ~578
> units (409·√2), so glyphs whose filled geometry reaches the bbox corners must stay below that
> even though the band allows 655.

The lint enforces it at `icon-draw/scripts/check_svg.py:345` and `:350-351`, computing the glyph
bbox half-diagonal and warning when it exceeds `MASKABLE_SAFE_RADIUS` (`check_svg.py:30`,
`0.40 * CANVAS`).

**Rule for brandi:** the constraint is on the glyph's *half-diagonal*, not its width.

```
half_diag = sqrt((bbox_w/2)^2 + (bbox_h/2)^2)
safe      = half_diag <= 0.40 * min(canvas_w, canvas_h)
```

An 80% square is acceptable only when the mark is round enough that its ink does not reach the bbox
corners. For a circular or near-circular mark, 80% width is fine. For a square, diamond, or
X-shaped mark, cap the bbox at 56.6%. Measuring the actual ink extent rather than the bbox is
better still, and is cheap in Chrome via `getBBox()` on the glyph group.

### 3.2 The manifest

Two shapes in the corpus, and they differ on a point that matters.

**QGY** (`scripts/logo-studio.js:219-228`) declares `purpose: 'any maskable'` on both icons:

```json
{
  "name": "App",
  "short_name": "App",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "display": "standalone"
}
```

**PAL** (`icon-export/scripts/export_icons.py:69-76`) separates them:

```json
{
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-mask-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**PAL is right, and QGY's version is actively harmful.** `purpose: "any maskable"` tells the
platform one bitmap serves both jobs. It cannot. A maskable icon must be full-bleed (background
extends to every edge, glyph confined to the inner circle); an `any` icon is drawn unmasked, so a
full-bleed maskable used as `any` appears as an oversized square with the glyph looking too small
inside it. Declaring both purposes on one asset guarantees one of the two surfaces looks wrong.
Note also that QGY's `icon-192/512` are padded to 80% (`logo-studio.js:31-32`) and therefore are
already compromised as `any` icons before the purpose flag is considered.

Ship three icons: two normal (rounded master, no padding) and one maskable (square master,
full-bleed background, glyph inside the 40% radius).

Manifest to write:

```json
{
  "name": "<Brand name>",
  "short_name": "<Short name>",
  "icons": [
    { "src": "/icon-192.png",      "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png",      "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-mask-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "<brand primary>",
  "background_color": "<brand surface>",
  "display": "standalone",
  "start_url": "/"
}
```

`theme_color`, `background_color` and `start_url` appear in neither repo's manifest. They are
standard and brandi already knows the palette, so include them. Serve as
`application/manifest+json`; the `.webmanifest` extension is conventional and both repos use it
(PAL as `manifest.webmanifest`, QGY as `site.webmanifest`). Either name works, the `<link>` decides.

### 3.3 apple-touch-icon rules

From `platform-targets.md:19` and `:37-44`:

- **180x180**, PNG, named `apple-touch-icon.png` at the site root.
- **Opaque.** iOS composites the icon onto black, so transparency reads as black gaps.
  `platform-targets.md:19` says "opaque, full-square (iOS rounds it)".
- **Full-square, never pre-rounded.** iOS applies its own mask. `icon-geometry.md:24-26` cites
  Apple's Icon Composer docs: developers submit full-square 1024 icons and the system masks them.
  Pre-rounding double-masks and leaves transparent slivers at the corners
  (`platform-targets.md:88`).
- The mask's corner radius is **≈22.37% of the side** (≈229/1024). `icon-geometry.md:27-30` is
  careful to tag this [community]: Apple has never published it. The true corner is a
  continuous-curvature Bézier, roughly Figma's "corner smoothing 60%", not a plain arc and not a
  superellipse (`icon-geometry.md:31-35`). PAL's house ruling at `icon-geometry.md:36-37`:
  use `rx="229"` and do not hand-build squircle paths, because "the payoff is sub-pixel and the path
  is unmaintainable". Sound advice, adopt it.
- One `apple-touch-icon.png` is enough. Both PAL (`export_icons.py:324`) and QGY
  (`logo-studio.js:29`) ship exactly one, at 180, with no `sizes` attribute on the link. iOS
  downsamples.

### 3.4 The `<head>` snippet

PAL's, from `export_icons.py:62-67`, matching `platform-targets.md:30-35`:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
```

QGY's, from `logo-studio.js:231-238`, is the same four lines with `sizes="48x48"` on the ICO and
`/site.webmanifest`.

The `sizes` attribute on the ICO line is a deliberate trick, not a description of the file: it stops
the browser preferring the ICO over the SVG. Since the ICO contains 16, 32 and 48, either value is
defensible. WAG's `generate_favicons.py:252-270` emits six `<link>` tags with no SVG icon and no
manifest, which is the pre-2019 pattern and larger than it needs to be.

**Ship this**, which is PAL's plus the OG tags brandi already has the assets for:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="<brand primary>">

<meta property="og:image" content="https://example.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

OG tag shapes from `alonw0_web-asset-generator/skills/web-asset-generator/references/specifications.md:90-108`,
which is that repo's genuinely useful contribution. Note its warning at
`specifications.md:158`: OG image URLs must be absolute, not root-relative. That is a real and
common bug, and it means brandi must either ask for the site origin or emit a clearly marked
placeholder.

---

## 4. SVG optimisation without SVGO

### 4.1 What the corpus does

LL wraps SVGO (`src/tools/optimize-svg.mjs:1-55`). The interesting part is what it **disables**:

```js
// optimize-svg.mjs:14-18
overrides: {
  // Disable convertPathData — crashes on opentype.js generated paths
  convertPathData: false,
},
```

`convertPathData` is the plugin that does most of SVGO's actual shrinking (coordinate rounding,
command shortening, relative/absolute selection). LL turns it off, so its "30-60% reduction" claim
(`optimize-svg.mjs:5`, `server.mjs:30`) is coming almost entirely from whitespace, metadata and
comment removal. That is the honest read: **most of SVGO's safe value on a hand-authored logo is
achievable without SVGO.**

Its `aggressive` mode (`optimize-svg.mjs:31-41`) adds `removeUselessDefs`,
`cleanupEnableBackground`, `removeEmptyContainers`, and strips `class` and `style`. Note that
`removeAttrs` appears twice in the plugin list when aggressive is on (`:24-27` and `:35-39`), with
the second occurrence stripping `class`/`style` and the first stripping `data-*`.

PAL takes the opposite approach: instead of optimising after the fact, it **lints the source into a
shape that needs no optimisation**. `icon-draw/scripts/check_svg.py` enforces an allow-list of
elements (`:34-37`) and attributes (`:39-44`), bans `class` and `style` outright
(`:248-250`), caps decimals at 2 (`:277-281`), caps colours at 3 (`:330-331`) and stroke widths at 2
(`:332-333`). `icon-geometry.md:41-43`: "Round everything to ≤ 2 decimals, over-precision is
invisible complexity and a known LLM failure smell."

**For brandi this is the better model.** brandi generates the SVG itself, so it can emit clean
output rather than clean up dirty output. Optimisation then only has to handle SVGs that arrive
from outside.

### 4.2 Safe without a path parser

Each of these is a string or XML-tree operation with no geometric reasoning. Node's built-ins are
enough; there is no XML parser in Node core, but for SVG that brandi generated a careful regex pass
is adequate, and for foreign SVG the safer route is to parse in headless Chrome via `DOMParser` and
serialise back with `XMLSerializer`.

| Operation | Safe? | Notes |
|---|---|---|
| Strip XML comments `<!--...-->` | Yes | Watch for `--` inside; comments cannot nest. |
| Remove `<metadata>`, `<sodipodi:namedview>`, `<inkscape:*>`, `<sodipodi:*>`, Adobe `<i:pgf>` | Yes | Editor cruft, no render effect. Remove the matching `xmlns:` declarations too or you leave dangling prefixes. |
| Remove `data-*` attributes | Yes | LL does this (`optimize-svg.mjs:24-27`). |
| Remove `<?xml ... ?>` prolog and `<!DOCTYPE svg ...>` | Yes | Optional for `image/svg+xml`. PAL bans DOCTYPE outright as an XXE surface (`check_svg.py:84-85`). |
| Collapse inter-tag whitespace | Yes, with one exception | Not inside `<text>`, `<tspan>`, or anything with `xml:space="preserve"`, where whitespace is content. |
| Round coordinate precision | Yes, **if scaled to the viewBox** | See 4.3. |
| Remove `<title>` / `<desc>` | Qualified | Free for a file referenced via `<img>` or `background-image`. For **inline** SVG they are the accessible name. LL strips both unconditionally (`optimize-svg.mjs:20-21`). Keep `<title>` on the primary logo. |
| Remove truly empty `<g></g>` | Qualified | Only when the group has **no attributes at all**. See 4.4. |
| Deduplicate identical `<linearGradient>` / `<radialGradient>` definitions | Yes, with rewriting | Requires updating every `url(#old)` to `url(#kept)`. Do the reference scan in 4.5 first. |
| Drop default-valued attributes (`fill-opacity="1"`, `stroke-width="1"`, `opacity="1"`) | Yes | These are the spec defaults. |

### 4.3 Precision rounding: the trap in "2 decimals"

PAL errors on any coordinate with more than 2 decimals (`check_svg.py:277-281`). That rule is only
safe because PAL **fixes the canvas at 1024** (`check_svg.py:26`, `:216-218` enforce
`viewBox="0 0 1024 1024"`).

The quantity that matters is the rounding error **as a fraction of the viewBox**, and then as
rendered pixels at the smallest target size:

```
error_px = 10^(-decimals) / viewBox_size * target_px
```

- viewBox 1024, 2 dp, rendered at 16px: `0.01 / 1024 * 16 = 0.00016 px`. Utterly invisible.
- viewBox 100, 2 dp, at 16px: `0.0016 px`. Still invisible.
- viewBox 1, 2 dp, at 16px: `0.16 px`. Visible on a fine join.
- viewBox 1, 2 dp, at 1024px: `10 px`. Destroys the shape.

**Rule:** choose decimals so that `10^(-d) / viewBox_size <= 1/4096`, i.e.
`d >= log10(4096 / viewBox_size)`. For a 1024 canvas that gives `d >= 0.6`, so 1 decimal would
technically do and 2 is comfortable. For a viewBox of 1, it demands 4 decimals. Never hard-code
2 without checking the viewBox, and never round the `viewBox` attribute itself.

### 4.4 Empty groups: mostly not empty

A `<g>` with no children still does work if it carries any of:

`transform`, `clip-path`, `mask`, `filter`, `opacity`, `style`, `class`, `id` (something may
reference it), `fill`/`stroke` (inherited by children added later, irrelevant for a static file but
relevant if the group is `<use>`d).

A group with children and only a `transform` can sometimes be dissolved by pushing the transform
onto each child's own `transform` attribute (composing, not replacing). That is safe because it does
not touch path data. What is **not** safe is baking the transform into the coordinates, which is
section 4.6.

One renderer landmine, from `DiegoAmorimDev_brandpress/skills/brandpress/SKILL.md:144-147`:

> **Group `opacity` is ignored by some SVG renderers**, MuPDF among them.

So group opacity is both a reason not to remove the group and a reason not to rely on it. If a mark
needs transparency, put it on the leaf shapes.

### 4.5 Stripping ids: the operation that quietly breaks logos

This is the one on the brief's list that most deserves a warning. An `id` can be referenced from at
least these places, and missing any one of them produces a logo that renders as a black silhouette
or vanishes entirely:

| Reference form | Attributes it appears in |
|---|---|
| `url(#id)` | `fill`, `stroke`, `clip-path`, `mask`, `filter`, `marker-start`, `marker-mid`, `marker-end`, and the `-opacity` variants |
| `href="#id"` / `xlink:href="#id"` | `<use>`, `<textPath>`, `<mpath>`, `<animate>` and friends |
| `#id` in a CSS selector | inside `<style>` |
| `id` as an animation target | `<animate attributeName=... xlink:href="#id">` |
| `aria-labelledby="id"` / `aria-describedby="id"` | accessibility wiring on the root `<svg>` |
| `begin="id.click"` | SMIL event syntax, references an id without `#` |

PAL validates the `<use>` direction of this at `check_svg.py:296-298`: collect every `id` while
walking, collect every `href`, then error on any `href` pointing at a missing id. It also refuses
non-local hrefs at `check_svg.py:257-258`. brandi needs the inverse check before deleting anything:
**collect the set of referenced ids first, then remove only ids not in that set.**

The `<defs>` case is the common one. `export-brand-kit.mjs:209-220` (`extractIconSvg`) knows this:
it copies the whole `<defs>` block into the extracted icon, and LL's skill file records why at
`skills/design-logo/SKILL.md:136`:

> **Icon extraction must include `<defs>`** — if the icon uses gradients, the extracted icon SVG
> must copy the `<defs>` block too, otherwise gradients disappear.

Related, and worth knowing about because brandi will want mono variants: LL's `createMonoVariant()`
at `export-brand-kit.mjs:244-252` replaces gradient fills with a flat colour and then deletes
`<defs>` entirely (`:250`). That ordering is correct and deliberate. But the regex at `:248`,
`/fill="(?!none)[^"]*"/g`, will also rewrite a `fill` inside a `<stop>` element if any survived,
and it does not handle `fill` expressed in a `style` attribute or a presentation CSS rule. For
brandi-generated SVG that is fine because brandi controls the shape of its own output; for imported
SVG it is not.

### 4.6 Collapsing transforms: do not do this with regex

Baking a `transform` into path coordinates requires a full path-data parser plus a geometric
rewrite. The specific hazards:

- **Shorthand commands.** `H` and `V` carry a single coordinate. Under a rotation or a non-uniform
  scale they must become `L` with two. `S` and `T` carry implied reflected control points that must
  be materialised. BP hits this exact problem from the other direction and documents it at
  `skills/brandpress/references/geometry.md:96-98`:

  > Never derive a bounding box by parsing a path string. Path data contains shorthand commands
  > (`H`, `V`) that carry a single coordinate and break any assumed x,y pairing.

  and again at `skills/brandpress/SKILL.md:148`: "`SVGPathPen` emits shorthand `H` and `V`, which
  carry one coordinate."

- **Elliptical arcs.** `A rx ry x-axis-rotation large-arc sweep x y` under a non-uniform scale is no
  longer expressible as a single arc with the same parameters. You must recompute `rx`, `ry` and the
  rotation from the transformed conic, and flip the sweep flag when the transform has negative
  determinant. This is where naive implementations silently corrupt shapes.

- **Stroke width.** A scale changes the rendered stroke width. Baking geometry without scaling
  `stroke-width` by the transform's average scale factor changes the drawing. Under a non-uniform
  scale, a uniform stroke is not even representable, so the transform genuinely cannot be collapsed.

- **`fill-rule` across merged subpaths.** Concatenating two paths into one changes which regions are
  inside under `nonzero`. This is exactly how counters (the hole in an "o", the gap in a ring) fill
  in. It is the most damaging optimisation because the file still parses and still looks plausible
  at 512px.

LL's `convertPathData: false` (`optimize-svg.mjs:15-16`) is a tacit admission of this class of
problem, even though the stated reason there is a crash rather than corruption.

**Position for brandi: never collapse transforms and never merge paths.** The upside is a few
hundred bytes. The downside is a silently wrong logo. If brandi generates coordinates directly
(PAL's model), there is nothing to collapse in the first place.

### 4.7 A safe optimiser for brandi, in order

1. Reject or quarantine anything with `<script>`, event handlers (`on*`), `<foreignObject>`,
   `javascript:` URLs, external `http(s)` references, `data:` URLs, or a DOCTYPE. PAL's list is at
   `check_svg.py:84-102` and again as `UNSAFE_PATTERNS` at `export_icons.py:231-232`. Do this
   **first**, because everything downstream (including handing the file to Chrome) is a renderer
   attack surface. PAL calls this a "security preflight" at `export_icons.py:240-246`.
2. Remove comments, `<metadata>`, editor namespaces and their `xmlns:` declarations, `data-*`.
3. Build the referenced-id set (4.5). Remove unreferenced ids and unreferenced `<defs>` children.
4. Round coordinates to the viewBox-appropriate precision (4.3).
5. Drop default-valued presentation attributes.
6. Remove attribute-free empty groups (4.4).
7. Collapse inter-tag whitespace outside text content.
8. **Render before and after and compare.** See section 7.3; an ink-coverage delta is a cheap and
   effective regression check on an optimiser, and it is the only thing that catches a `fill-rule`
   or reference-stripping mistake.

Expect 20-40% on a hand-authored logo and more on Illustrator or Figma output, without ever
touching path geometry.

---

## 5. text-to-path

### 5.1 What LL actually does

`src/tools/text-to-path.mjs`, 92 lines. It requires `opentype.js` (`:1`) and a font binary.
`:6-7` resolve a bundled `src/fonts/Inter-Bold.ttf`, which is present in the repo; `:13-14` prefer a
caller-supplied `fontPath` and fall back to the bundle; `:16-22` return `success: false` with the
original SVG unchanged if no font file exists.

The conversion, `:32-79`: regex out each `<text>` element, pull `x`, `y`, `font-size`, `fill`,
`text-anchor`, `font-weight`, `letter-spacing` (`:36-42`), flatten `<tspan>` children to plain text
(`:45`), call `font.getPath(plainText, 0, 0, fontSize)` and `path.toPathData(2)` (`:50-51`), then
emit `<path d="..." fill="..." transform="translate(offsetX, y)"/>` (`:76`).

**So yes, it needs a font binary. There is no way around that in its design.**

### 5.2 LL's own skill says not to use it

`skills/design-logo/SKILL.md:58`:

> **DO NOT run text_to_path** on the final SVG. Keep original `<text>` elements — they render
> perfectly in browsers (GitHub, npm, websites). text_to_path degrades quality (wrong kerning,
> loses gradient fills on tspan, font mismatch). Only use text_to_path if user specifically needs
> print/offline use.

Repeated at `SKILL.md:130`. A tool whose own documentation tells you not to run it is a strong
signal about the difficulty of the problem, not about this implementation's laziness.

### 5.3 Specific defects, because they show what a correct implementation must do

Reading the code against the skill file, five distinct problems:

1. **Existing `transform` on the `<text>` element is dropped.** `:36-42` extract seven attributes;
   `transform` is not one of them. `:76` then writes its own
   `transform="translate(${offsetX}, ${y})"`. Any pre-existing transform is lost. This is not
   hypothetical for LL's own output: `export-brand-kit.mjs:235` searches for
   `<text ... transform="translate(130...)">`, so LL's generated logos put the wordmark in place
   with a transform. Running `text_to_path` on a LogoLoom logo moves the wordmark to the wrong
   position.

2. **Centring uses the ink bounding box, not the advance width.** `:54-55` take
   `path.getBoundingBox()` and compute `bbox.x2 - bbox.x1`. For `text-anchor="middle"` the correct
   quantity is the advance width, which includes side bearings. Using the ink box shifts the text by
   `(leftSideBearing - rightSideBearing) / 2`. The skill file *knows* the right method and spells it
   out at `SKILL.md:100-111` using `glyph.advanceWidth / font.unitsPerEm * fontSize`, and warns at
   `SKILL.md:115` that a fixed `x` "will look off-center". The code does not follow its own
   documentation.

3. **Non-zero `letter-spacing` silently discards kerning.** `:63-74` re-render character by
   character, advancing by `glyph.advanceWidth` plus the spacing. Per-character `getPath` calls
   apply no kerning pairs, so the moment `letter-spacing` is non-zero the text is set differently
   from the `letter-spacing: 0` branch at `:50`, which does kern. This matches the skill file's
   "wrong kerning" complaint.

4. **`font-family` is ignored.** It is never read. Whatever font the SVG asks for, the bundled
   Inter-Bold (or the caller's single `fontPath`) is used. A two-typeface lockup cannot be converted.

5. **`font-weight` is extracted at `:41` and never used.** Weight comes from whichever binary was
   loaded.

A correct implementation needs: a font *set* keyed by family and weight, per-run shaping with
kerning, advance-width-based anchoring, transform composition rather than replacement, `tspan`
positioning (`dx`, `dy`, per-tspan `x`/`y`, and per-tspan fills), and `textLength`/`lengthAdjust`.
That is a shaping engine.

### 5.4 What a zero-dependency approach can and cannot do

**Cannot, honestly:** produce true glyph outlines without a font parser. Reading outlines means
parsing the SFNT table directory, `cmap` (at minimum format 4 and format 12), `loca`, `glyf`
(simple and composite glyphs, including the component transform variants), `hmtx` for advances, and
`kern` or GPOS for kerning. For TrueType that is roughly 300-500 lines of `DataView` work and it is
genuinely feasible in pure Node: quadratic B-spline contours map onto SVG `Q` commands almost
directly. For OpenType/CFF fonts the outlines live in a `CFF ` table as Type 2 charstrings, which
needs a stack-based charstring interpreter with subroutine handling, hint operators, and seac
legacy accents. That is where I would stop. **A TrueType-only parser is a weekend; a
general-purpose one is not, and neither gives you shaping.**

Two things people expect to work and do not: headless Chrome has **no** API that returns text
outlines. Canvas has no text-to-path. Chrome's `printToPDF` embeds subsetted fonts and keeps text as
text, so it does not outline either.

**Can, and this is the better answer:**

1. **Measure text exactly in Chrome and keep it live.** Chrome will give you, for real, with real
   shaping and kerning and the real font as it will actually render:
   - `SVGTextContentElement.getComputedTextLength()` for the advance width of the whole run;
   - `getSubStringLength(i, n)` for any substring;
   - `getStartPositionOfChar(i)` / `getEndPositionOfChar(i)` / `getExtentOfChar(i)` per glyph;
   - `getBBox()` for the ink box;
   - Canvas `measureText()` with `actualBoundingBoxAscent/Descent/Left/Right`.

   This solves the problem LL's skill calls the number one mistake (`SKILL.md:115`: "Using a fixed x
   value (e.g. x="125") without measuring") and solves it **better than opentype.js**, because it
   measures the shaped result rather than summing advance widths. brandi already runs Chrome for
   PDF export, so the marginal cost is one `page.evaluate`.

2. **Follow LL's own advice and ship live text as the primary artefact.**
   `SKILL.md:58` and `:85` ("Don't use external fonts (won't render without internet)") together
   point at: use `system-ui, -apple-system, sans-serif` or a self-hosted face, keep `<text>`, and
   measure to place.

3. **Where a font-independent file is genuinely required, pick one of three, in order:**
   - **Rasterise.** For favicons, app icons, OG images and social previews the output is a PNG
     anyway, so the font question never arises. This covers most of the export matrix in section 1.3.
   - **Inline the font as a base64 `@font-face` inside the SVG.** Makes the SVG self-contained
     without outlining. Browsers honour it; librsvg, resvg and Inkscape's importer largely do not,
     and it embeds the whole face, so licence terms matter. Note BP's warning at
     `skills/brandpress/assets/pipeline/fonts.py:87-90`: fonts are software, ship the licence file
     and confirm commercial terms.
   - **Shell out to an optional external tool, degrading gracefully.** `inkscape
     --export-text-to-path`, `fontforge`, or `rsvg-convert` to PDF. LL already uses this pattern for
     vectorisation: `src/tools/image-to-svg.mjs:31-55` tries `vtracer`, then `npx vtracer-cli`,
     then `potrace`, and returns a structured error naming the install command when none is present
     (`:44-46`, `:50-52`). PAL uses the same shape for rasterisers, probing six tools in preference
     order at `export_icons.py:157-165` with install hints at `:53-60`. **This is the right pattern
     for brandi**: zero dependencies in the happy path, better output when a tool happens to exist,
     and an honest message when it does not.

4. **Verify the outcome mechanically.** BP has the one-line check at
   `skills/brandpress/assets/pipeline/qa.py:49-54`:

   ```python
   def svg_is_outlined(path):
       """A logo SVG must not contain <text>. If it does, it renders differently
       on any machine without that font — including the printer's."""
       return "<text" not in content and "<tspan" not in content
   ```

   PAL bans `<text>` from icon masters entirely (`check_svg.py:91`: "`<text>`/`<textPath>` are
   banned (draw letterforms as paths if needed)"). Both treat the presence of `<text>` as a fact to
   be reported, not a failure to be hidden. brandi should state plainly in `BRAND.md` which files
   contain live text and which do not.

**Bottom line for the brief's question:** LL needs a font binary, and its conversion is wrong in at
least five ways including one (dropped transform) that misplaces the wordmark on LL's own logos.
Without a font parser brandi cannot produce outlines. It does not need to: Chrome gives exact
measurement, rasterisation covers most deliverables, and an optional external tool covers print.
The one thing brandi must not do is pretend a `<text>`-bearing SVG is outlined.

---

## 6. The dungnotnull scoring rubric

### 6.1 The rubric as written

Stated identically in three places: `README.md:29-37`, `PROJECT-detail.md:81-89`, and canonically in
`skills/sub-scoring-engine.md:19-27`.

| Dimension | Weight | What is assessed | Framework behind it |
|---|---|---|---|
| Logo / mark concept | **25%** | distinctiveness, scalability, Gestalt soundness | Gestalt principles |
| Colour system | **20%** | harmony (60-30-10), contrast/accessibility (WCAG 2.2 AA), semantics | 60-30-10, WCAG 2.2 |
| Typography system | **20%** | hierarchy, pairing, legibility | Bringhurst, Tschichold |
| Brand voice & archetype | **20%** | clear personality, consistent tone, archetype fit | Mark & Pearson archetypes |
| Consistency & application | **15%** | coherence across touchpoints | Aaker brand identity model |

Weights sum to 100. Each dimension is scored 0-100. Out-of-scope dimensions are excluded and the
remaining weights are **renormalised** so the total stays 0-100 (`sub-scoring-engine.md:27`,
`:62`). Total is `Σ(score_i · normalised_weight_i)` (`:68`).

Grade bands (`sub-scoring-engine.md:69-73`): **A** 90-100, **B** 75-89, **C** 60-74, **D** below 60.

Per-dimension bands are given in full at `sub-scoring-engine.md:31-59`. The logo one, which is the
25% that matters most to brandi (`:31-35`):

- **90-100**: distinctive mark, reproduces at favicon scale and in one colour, rests on a single
  clear Gestalt principle (figure-ground stable, closure intentional).
- **75-89**: strong mark, minor scalability issues (loses detail below 24px) or relies on two
  principles but holds together.
- **60-74**: recognisable but generic, weak figure-ground, or fails one-colour reproduction.
- **below 60**: indistinct, fails at small scale, or violates multiple Gestalt laws.

Output schema at `sub-scoring-engine.md:77-92`: per dimension a `score`, `band`, `rationale`,
`citations[]`, and a `certainty` of high/medium/low, plus `weights_normalized`, `weighted_total`,
`grade`, `notes`.

Quality gate at `sub-scoring-engine.md:94-103`, six checks, of which four are pure arithmetic and
mechanically enforceable: every in-scope dimension has a score and ≥1 citation; weights sum to 1.0;
`weighted_total` recomputes correctly; the grade matches its band exactly. The other two
("certainty is recorded", "no score from taste alone") are process assertions.

### 6.2 Mechanical versus judgement, dimension by dimension

The brief asks which half can be automated. My apportionment, not the repo's:

| Dimension | Mechanically checkable | Judgement | My split of the weight |
|---|---|---|---|
| **Logo / mark (25)** | "reproduces at favicon scale" (reduction ladder + ink coverage, section 7.3); "reproduces in one colour" (generate the mono variant, re-run the ladder, check contrast); stroke minimums; safe-zone fit; node budget | "distinctive"; "rests on a single clear Gestalt principle"; figure-ground reading | **10 mechanical / 15 judgement** |
| **Colour (20)** | WCAG ratios for every pair, exactly (`qa.py:17-45`); 60-30-10 area split, by counting pixels per palette colour in a rendered application mock; palette size; dark-mode variant present | "semantic intent"; "dark-mode variant defensible" | **15 mechanical / 5 judgement** |
| **Typography (20)** | "legible at 12px" (render and measure); hierarchy levels present (does the token set define display/heading/body/caption?); measure in characters; leading ratio vs the ~120% rule (`SECOND-KNOWLEDGE-BRAIN.md:27`); count of display families | "defensible pairing"; tone fit | **8 mechanical / 12 judgement** |
| **Voice (20)** | Almost nothing. At most: is exactly one primary archetype declared, and at most one secondary (`sub-scoring-engine.md:50`)? Are voice rules written down? | Everything that matters | **2 mechanical / 18 judgement** |
| **Consistency (15)** | Token conformance: do the shipped artefacts use only declared palette colours and only the declared type scale? Every asset present in every required variant? Naming convention followed? | "product/organisation/person/symbol perspectives mutually reinforce" | **8 mechanical / 7 judgement** |

**Roughly 43 of the 100 weighted points are mechanically checkable**, and they cluster in colour and
consistency rather than in the logo dimension that carries the most weight. That is the honest
shape of it: the rubric's heaviest dimension is its least automatable.

Three consequences for brandi:

1. **Report the mechanical half as measurements, not as a score.** A 4.31:1 contrast ratio is a
   fact. Converting it into "colour system: 82" adds nothing and hides the fact.
2. **Never present the total as an aesthetic verdict.** PAL says this better than DNN does, at
   `icon-critique/references/critique-rubric.md:58-60`:

   > **Taste is out of scope**: operational axes above are checkable; "beautiful" is not. VLM
   > aesthetic judgment against creative-director standards is an unsolved problem, never present
   > rubric scores as proof of beauty.

3. **Separate the generator from the critic.** `critique-rubric.md:53-57`:

   > **Self-serving bias**: the drawer grading its own work scores high. Ground scores in visible
   > pixels; prefer a fresh session/subagent or the human for final judgment. Shipped pipelines that
   > separate generator from critic do so deliberately.

   Concretely: the agent that drew the mark must not be the agent that scores it.

### 6.3 PAL's rubric is the better one for a logo specifically

DNN scores a whole identity system; PAL scores a mark. For brandi's logo engine, PAL's is more
directly usable because it is a **gate order** rather than a weighted sum
(`icon-critique/references/critique-rubric.md:10-28`), scored 1-5 per axis:

1. Renders at all sizes (blank or broken = automatic fail)
2. **16px silhouette** (hard gate, must score ≥4 to ship)
3. One dominant Gestalt device, nameable in one sentence at 512px
4. Stroke and geometry consistency (one weight, two max)
5. Optical centring and balance
6. Distinctiveness against the category clichés named in the brief
7. Contrast on dark

Ship bar at `critique-rubric.md:49-50`: "16px ≥ 4, every other axis ≥ 3, and a human approval
(headless runs: state that the bar was applied automatically)."

The fix ladder at `critique-rubric.md:30-41` is the part worth stealing wholesale, because it is
ordered by preference and it names the trap at the end:

1. Delete the detail that dies smallest (a hidden element must read at 16-32px or vanish gracefully,
   never half-read).
2. Thicken strokes (≥48/1024 units; step in 8s), widen counters and gaps.
3. Enlarge the glyph within the 45-64% band, re-check the r=409 safe circle.
4. Rebalance shapes for optical centring (move weight, not just position).
5. Simplify the silhouette (**last resort**, re-check distinctiveness after: simplification pulls
   toward generic).

Plus: one fix per iteration, re-render the whole 512/64/32/16 ladder after each, three iterations
maximum per candidate, then report the residuals (`critique-rubric.md:40-41`).

The same trap is stated from the brief side at
`icon-brief/references/design-principles.md:53`: "Optimizing only for simplicity (shape count, path
count) converges on generic." Worth holding in mind against everything in section 7: the mechanical
measures all push toward simpler, and simpler eventually means anonymous. **They are a floor, not an
objective function.**

---

## 7. What can be measured mechanically on an SVG

Everything here runs on Node built-ins plus one headless Chrome page. Chrome does the rasterising
(`canvas.drawImage` on a blob URL, then `getImageData`), which is exactly QGY's technique at
`scripts/gallery.html:131-162` and needs no native module.

### 7.1 Static checks (parse only, no rendering)

| # | Measure | Threshold | Provenance and reasoning |
|---|---|---|---|
| 1 | **Distinct fill/stroke colours** | error above 3 | `check_svg.py:330-331`. Three is enough for figure, ground and one accent. More is a wordmark pretending to be an icon. |
| 2 | **Distinct stroke widths** | error above 2 | `check_svg.py:332-333`; `critique-rubric.md:20-21` ("one stroke weight, two max"). Mixed weights read as inconsistency at every size. |
| 3 | **Minimum stroke width** | see formula below | `check_svg.py:334-336` warns below 40/1024; `icon-geometry.md:46-48` sets the house floor at 48/1024 ≈ 0.75px at 16px. |
| 4 | **Coordinate precision** | ≤2 dp on a 1024 canvas, scaled otherwise | `check_svg.py:277-281`, `icon-geometry.md:41-43`. Scaling rule in section 4.3. |
| 5 | **Glyph bbox as a fraction of canvas** | warn below 35%, warn above 64% | `check_svg.py:31-32` (`GLYPH_MIN 0.35`, `GLYPH_MAX 0.66`); `icon-geometry.md:44-46` narrows the target band to 45-64%: "Under ~35% reads empty at 512 px; over ~64% crowds the corners and breaks safe zones." |
| 6 | **Maskable safe-zone fit** | `half_diag ≤ 0.40 × min(W,H)` | `check_svg.py:30`, `:345`, `:350-351`; `platform-targets.md:23-26`. Caps a *square* bbox at 56.6%, see section 3.1. |
| 7 | **Axis symmetry offset** | bbox centre within ±0.6% of the axis | `check_svg.py:27` (`TOL 6.0` on 1024 = 0.586%), `:353-356`. Only meaningful for marks intended to be symmetric; pass an axis flag. |
| 8 | **Reference integrity** | every `#id` reference resolves | `check_svg.py:296-298`. Non-negotiable, and it is the check that catches a bad optimiser pass. |
| 9 | **Path node budget** | warn above ~40 commands / ~12 subpaths for an icon | **My proposal.** No repo gives a number. DR's Box Method (`SKILL.md` section 6, step 3) sets the goal as "numero minimo de pontos de ancoragem"; PAL bounds complexity only indirectly. Reasoning: a 16px render is 256 pixels total, so a feature needs roughly 2x2px to read at all, capping distinguishable features far below 40. A mark above that budget is encoding detail that provably dies. Count command *occurrences* (a `L 1 2 3 4` is two), not characters. Treat as a warning that triggers the reduction test, never a hard fail: measure 9 is the one most likely to punish a good complex wordmark. |
| 10 | **Live text present** | report, do not fail | `qa.py:49-54` (`svg_is_outlined`); `check_svg.py:91` bans `<text>` in icon masters. State it in `BRAND.md` rather than silently converting. See section 5.4. |

**Stroke minimum, generalised.** PAL's 48/1024 is a specific case of:

```
rendered_px = stroke_units / viewBox_size * target_px
```

- 48/1024 at 16px = **0.750 px** (PAL's house floor)
- 64/1024 at 16px = **1.000 px**

So: `min_stroke_units >= 0.75 * viewBox_size / smallest_target_px`. On a 100-unit viewBox exported
down to 16px, that is 4.7 units. Below ~0.75 rendered px a stroke is fighting antialiasing and will
read as grey rather than as a line. If the smallest target is 32px rather than 16px, the constraint
halves. **Compute it from the actual smallest export size, do not hard-code 48.**

### 7.2 Colour and contrast

Use BP's implementation at `assets/pipeline/qa.py:17-27`, which is correct:

```python
def relative_luminance(hex_colour):
    def channel(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = [channel(c) for c in to_rgb(hex_colour)]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(a, b):
    la, lb = relative_luminance(a), relative_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)
```

**Do not copy PAL's `luminance()` at `check_svg.py:74-79`.** It omits the sRGB gamma
linearisation and returns `0.2126R + 0.7152G + 0.0722B` on raw channel values. **[verified]** by
computation, the divergence is large:

| Colour | Correct WCAG L | PAL's naive L | Ratio |
|---|---|---|---|
| `#2A2A2E` | 0.0235 | 0.1658 | 7.1x |
| `#26262B` | 0.0197 | 0.1504 | 7.6x |
| `#777777` | 0.1845 | 0.4667 | 2.5x |
| `#808080` | 0.2159 | 0.5020 | 2.3x |

PAL uses it only for a house gate ("background must be dark", threshold 0.25 at `check_svg.py:29`
and `:324-325`), where the error does not change the verdict for the colours it targets. Reused for
WCAG it would be badly wrong.

**Thresholds.** From `sub-scoring-engine.md:38` and `SECOND-KNOWLEDGE-BRAIN.md:20`: body text ≥4.5:1,
large text ≥3:1, UI components and graphical objects ≥3:1. For a logo mark specifically:

- Require **≥3:1 for the mark against each background it is specified for** (light surface, dark
  surface, and the maskable icon's own background). This is the WCAG 1.4.11 non-text threshold and
  it is the right one for a graphical object.
- Be honest that WCAG 1.4.3 **exempts logotypes** from contrast requirements. A mark below 3:1 is
  not a conformance failure. It is still invisible, which is the actual problem.
- Report every pair rather than gating on them. BP's framing at `skills/brandpress/SKILL.md:92-95`
  is exactly right and worth reproducing in `BRAND.md`:

  > Contrast failures are normal and informative. A saturated accent on a light ground usually fails
  > body-text contrast; that is not a reason to change the colour, it is a rule to write down:
  > *this colour is for shapes, never for paragraphs.*

For the 60-30-10 check (`sub-scoring-engine.md:38`): render an application mock, bucket every pixel
to its nearest palette colour, and report the area split. A dominant colour below ~50% or an accent
above ~20% means the discipline has not been applied. Proportions from
`SECOND-KNOWLEDGE-BRAIN.md:17`; the tolerance band is my proposal.

### 7.3 The reduction ladder: the single most valuable mechanical test

Both PAL and BP converge on this independently, which is the strongest signal in the corpus.

BP, `references/anti-patterns.md:98-105`:

> Render the mark at 128, 64, 32, 24 and 16 px and look at all five. Counters fill in, thin joins
> weld shut, gaps disappear. A mark that only works above 100 px is not finished.

Implemented as `reduction_proof()` at `qa.py:77-96` and `counter_closes_at()` at `qa.py:113-129`.
PAL renders a 512/64/32/16 ladder (`critique-rubric.md:40`).

**Ink coverage** (`qa.py:99-110`) is the fraction of non-background pixels. **Coverage should stay
roughly flat as size drops.** A jump means counters are closing and joins are welding.
`counter_closes_at()` walks the ladder from largest to smallest and returns the last size whose
coverage is within `tolerance=0.06` (six percentage points, `qa.py:113`) of the 128px reference,
stopping at the first size that breaks. That size is the mark's practical minimum.

Two improvements for brandi:

- BP takes the background colour from the top-left pixel (`qa.py:106`, `bg = data[0:3]`). If ink
  reaches that corner the reference inverts and the measurement is nonsense. In Chrome, use the
  **alpha channel** instead: coverage = fraction of pixels with `alpha > 128`. Direct, and it does
  not need a background at all.
- BP's comment at `qa.py:118-119` is the right posture: "Treat it as a strong hint to verify by eye,
  not as a verdict."

**Proposed gate:** compute coverage at 512, 128, 64, 32, 24, 16. Require
`|coverage(16) − coverage(512)| ≤ 0.06`. Warn between 0.06 and 0.12. Fail above 0.12 and report the
size at which it broke. The 0.06 figure is BP's; the 0.12 second band is mine.

### 7.4 Two measures I would add that no repo has

Both fall out of the alpha mask the ladder already produces, so they are nearly free.

**(a) Connected-component count across the ladder.** Flood-fill the thresholded alpha mask and count
distinct ink blobs at 512 and at 16.

- Count **drops** between 512 and 16: separate shapes have welded together. This is the failure
  `anti-patterns.md:100-102` describes as "thin joins weld shut" and it is what actually kills a
  mark at favicon size.
- Count **rises**: a thin connector has broken, and the mark has fragmented.
- **Threshold: require the count to be identical at 512 and 16.** Any change is a finding. This is
  a sharper and cheaper test than coverage drift, because it detects topology change rather than
  area change, and topology is what "is it still this mark" actually means.

Counting holes as well as blobs (components of the *inverted* mask, minus the outer region) directly
measures counters closing, which is the thing BP's tolerance is a proxy for.

**(b) Ink centroid versus geometric centre, for optical balance.** Compute the first moment of the
alpha mask.

BP, `references/geometry.md:78-79`:

> A shape's optical centre sits **above** its geometric centre. Content inside a container usually
> needs to move up by 1-3% of the height.

In SVG coordinates y grows downward, so "up" is a smaller y. **Proposed threshold: ink centroid y in
[0.470, 0.495] × H; centroid x within ±0.5% of W for marks declared symmetric.** A centroid at or
below 0.500 means the mark will read as sinking. Bands derived from BP's 1-3% rule; the exact
numbers are my proposal and want calibrating on real marks.

Note this **conflicts with PAL's axis check** (measure 7 above) and the conflict is real, not a
mistake in either. `check_svg.py:353-356` errors when the *bbox* centre deviates from the axis by
more than 6 units, but `icon-geometry.md:65-68` explicitly instructs a deliberate optical nudge of
up to 8 units. Resolve it by keeping them separate:

- **bbox centre** on the symmetry axis, tight tolerance: this is a *construction* check for marks
  that are meant to be symmetric.
- **ink centroid** against the optical target: this is a *perception* check, and it is allowed and
  expected to deviate from geometric centre.

Also from `icon-geometry.md:66-68`: white-on-dark marks read smaller and more cramped than the same
mark dark-on-light (the Dansky reversal test). So run the balance check on **both** polarities, and
expect the numbers to differ.

**(c) Silhouette IoU between candidates, not within one.** Threshold each candidate's 16px alpha
mask to binary and compute intersection-over-union between every pair. When brandi presents 6-8
concepts (LL's `skills/design-logo/SKILL.md:31-35` prescribes exactly that), any pair with
**IoU > 0.90 is the same mark at favicon size** and one of them should be replaced. This turns
"each concept should have a different personality" (`SKILL.md:34`) from an instruction into a
measurement. Threshold is my proposal.

### 7.5 What none of this measures

Stated plainly because the corpus states it plainly. `critique-rubric.md:58-60` on taste being out
of scope; `design-principles.md:53` on simplicity metrics converging on generic;
`anti-patterns.md:104-105`, "the eye decides"; `geometry.md:83-84`, "Make the change, re-render, and
compare, never reason about it abstractly"; BP's `SKILL.md:27`, "Look at every render before moving
on."

Distinctiveness, category-cliché avoidance, accidental resemblance to an existing brand, and whether
a silhouette accidentally spells a letter or becomes an unintended object (`anti-patterns.md:111`)
are all unmeasurable here. BP's pre-commit checklist at `anti-patterns.md:107-115` is a good shape
for the human-judgement half:

- Rendered and looked at, not just described
- Checked against the hazard collisions
- Silhouette does not accidentally spell a letter or become an object
- Not the category cliché
- Does not resemble a known brand in this market
- Survives to 16px
- Works in one colour

The last two are mechanical. The first five are not, and pretending otherwise is the failure mode
this whole section is trying to avoid.

---

## 8. What to lift, in priority order

1. **`qiguangyang_logo-generator-skill/scripts/lib/ico.js:10-44`.** 46 lines, zero dependencies,
   correct, verified. Add PAL's structural read-back (`export_icons.py:217-228`).
2. **`Paldom_icon-designer-skills/skills/icon-export/references/platform-targets.md`.** The only
   cited platform matrix in the corpus, and the only source that gets the rounded-versus-square rule
   right (`:83-88`).
3. **`Paldom .../icon-draw/scripts/check_svg.py`.** Pure stdlib, 386 lines. Port the geometry and
   budget checks; skip its `luminance()` (section 7.2).
4. **`DiegoAmorimDev_brandpress/skills/brandpress/assets/pipeline/qa.py:17-129`.** Correct WCAG
   maths, ink coverage, the reduction ladder, `svg_is_outlined`.
5. **`qiguangyang .../scripts/gallery.html:131-162`.** SVG to PNG via canvas in the browser. This is
   how brandi rasterises with no npm dependency, using the Chrome it already has.
6. **`Paldom .../icon-critique/references/critique-rubric.md`.** The gate order and the ordered fix
   ladder, better suited to a logo than DNN's weighted sum.
7. **`dungnotnull .../skills/sub-scoring-engine.md:19-103`.** Use for the whole-identity score, with
   the mechanical half reported as measurements (section 6.2).
8. **`mcpware_logoloom/src/tools/export-brand-kit.mjs:261-340`** (preview contact sheet) and
   **`:342-418`** (BRAND.md template). Good models. Take nothing else from that file.

### Rejected, with reasons

- **LL's `favicon.ico`** (`export-brand-kit.mjs:95-98`): a renamed PNG. Verified.
- **WAG's `favicon.ico`** (`generate_favicons.py:132-138`): Pillow drops the 32px entry; the
  success message is wrong. Verified.
- **LL's `text_to_path`** (`text-to-path.mjs`): needs a font binary and drops any existing
  `transform`, which misplaces the wordmark on LL's own logos. Its own skill file says not to use it
  (`skills/design-logo/SKILL.md:58`).
- **QGY's `purpose: "any maskable"`** (`logo-studio.js:223-224`): one bitmap cannot serve both
  purposes; one of the two surfaces will be wrong.
- **QGY's `padding: 0.1` as "the 80% safe zone"** (`logo-studio.js:31-32`,
  `gallery.html:154`): that is a square, and its corners fall outside the 40%-radius circle.
  Verified by computation.
- **PAL's `luminance()`** (`check_svg.py:74-79`): missing sRGB linearisation, off by up to 7.6x on
  dark colours. Fine for its own house gate, wrong for WCAG.
- **LL's "Windows tile" label on `icon-256.png`** (`export-brand-kit.mjs:78`): not a tile size.
