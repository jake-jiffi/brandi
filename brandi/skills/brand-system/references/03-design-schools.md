# 03. Design schools

A catalogue of visual directions a brand can commit to. Read this when the brief leaves the visual
direction open, when you are running a territory round, or when a draft has come back reading
"generic". It is a menu of commitments, not a mood board.

The point of a school is not to copy it. The point is that a school gives you a **reason** for every
decision, so the palette, the type and the grid all argue for the same thing. Work without a named
school and you will average toward the defaults catalogued in `04-anti-slop.md`.

---

## Protocol

### Running a territory round

When you need to show directions rather than a finished artefact:

1. **Pick three schools from three different families.** Not three flavours of minimalism. Not three
   maximalist swings. Spread matters more than each being the perfect fit, because the user is
   choosing a direction of travel, not a layout. If two candidates share a family, replace one.
2. **Per direction, give exactly four things:** a one-sentence pitch that names a lineage the user
   will recognise, three keywords, the single signature move you would build the work around, and
   one sentence on what it means concretely for *this* brief. No more. A paragraph per direction is
   already too much for a decision.
3. **Sketch, do not build.** Three hero treatments at low fidelity. If you are 30 minutes into
   previews you have overshot, because the user is picking a direction, not approving a page.
4. **Ask which one, or which blend.** Then commit hard.

Adapted from the Design Direction Advisor protocol in `jiji262_claude-design-skill`
(`references/design-styles.md`).

### The commitment rule

> Do **more** of what defines a style, not less. A style executed at 30% reads as hesitant. At 80%
> it reads as deliberate.

This is the single most important line in this file. Swiss editorial without numbered sections and
hairline rules is just "generic minimal". Japanese emptiness without 70% negative space is just "a
bit sparse". Brutalist web with rounded corners and a nice shadow is a normal website with an
attitude problem.

The averaging instinct is the failure mode. When you are unsure whether the display size is too
large, whether the negative space is too much, whether the accent is too loud, the answer is almost
always to push further, because your uncertainty is a symptom of the style working, not failing.

Corollary: **a school you are not willing to commit to is the wrong school.** If the brief cannot
take 70% whitespace, do not pick Japanese emptiness and then use 40%. Pick a different school.

### Blending

Blending is allowed and often correct, under two constraints:

- **One school is the base, the other contributes exactly one named dimension** (colour, or type, or
  layout, or texture, or motion). "Warm humanist colour on a technical utility layout" is a blend.
  "A bit of everything" is a mush.
- **Comment which part came from where** in the generated code, so the next session can maintain it.
  (Pattern taken from `SpaceZephyr_brand-design-md`, which requires multi-brand blends to annotate
  provenance inline.)

### The mini-system as a comment

Once a school is chosen, write the system into the top of the artefact **before** you write any
layout code, and hold every subsequent decision to it. If you need a value that is not in the
system, extend the comment explicitly rather than adding it ad hoc.

```html
<!--
  School:    Technical utility (Otl Aicher / ERCO lineage)
  Type:      Recursive Mono Casual 13/1.6 (body) · Recursive Sans Linear 44/1.05 (display)
             one superfamily, weight contrast 400/700, no third face
  Colour:    #14161A ink on #F2F1ED paper · signal #E2483D used only on live values
  Grid:      Fixed 8px baseline, 12 col, 24px gutter, rules at every module boundary
  Rhythm:    Every number is tabular, every label is a unit, nothing is centred
  Signature: The calibration strip in the header, always showing real state
-->
```

Three things this buys you: the next session inherits the decisions instead of re-deriving them, a
reviewer can see whether the code matches its own stated system, and you can be caught adding an
off-system colour. Same move as the provenance headers in `shaharsha_claude-skills` `tokens.css`
and the rationale block in `nexu_open-design` `design-systems/apple/tokens.css`.

### Family index

| Family | Schools | Reach for it when |
|---|---|---|
| A · Structural modernism | 1 Swiss editorial · 2 Constructivist geometric | The content has real structure and the brand wants authority |
| B · Quiet minimalism | 3 Japanese emptiness · 4 Functionalist industrial | The product is the hero and the design should get out of the way |
| C · Editorial and narrative | 5 Magazine editorial · 6 Zine and risograph | Words carry the brand and there is a point of view to argue |
| D · Motion and digital-native | 7 Generative motion · 8 Brutalist web | The medium is the message, screen-first, no print heritage |
| E · Expressive and experimental | 9 Expressive concept · 10 Y2K futurist-retro | The brand's job is to be noticed and remembered, not trusted |
| F · Trust and institution | 11 Corporate trust · 12 Technical utility | Someone is handing over money, data, health or compliance |
| G · Material and human | 13 Craft heritage · 14 Warm humanist | The brand needs to feel made by people rather than shipped by a platform |
| H · Restraint and nature | 15 Luxury restraint · 16 Organic naturalism | Desire, provenance or place is doing the selling |

---

## Family A · Structural modernism

### 1. Swiss editorial

- **Feeling:** precision, authority, editorial gravity. The design is not asking to be liked.
- **Keywords:** structural · monochrome · grid-disciplined · quiet
- **Lineage:** Josef Müller-Brockmann and Emil Ruder at Zurich and Basel; Massimo Vignelli's Unimark
  work (the 1970 NYC Subway Graphics Standards Manual); Muriel Cooper's MIT Press; Pentagram's
  editorial and wayfinding practice.
- **Typography:** one grotesque family, three or four sizes, hierarchy by weight and scale rather
  than colour. Licensed: Neue Haas Grotesk, Helvetica Now, Söhne (Klim), GT America (Grilli Type).
  Free: **Archivo** (Omnibus-Type) or **Public Sans** (US Web Design System), both of which hold up
  at display sizes where most free grotesques collapse.
- **Colour:** achromatic by default, with exactly one saturated accent that is allowed to appear in
  no more than two places per screen. The accent means "look here", so if it appears five times it
  means nothing. Never a second accent.
- **Layout:** a real grid you can see, not a grid you can only infer. Columns are declared, gutters
  are consistent, rules divide sections, and the left flush is absolute.
- **Signature moves:**
  1. Oversized folio numerals set in the margin, at 3 to 5 times body size, in a light weight.
  2. Hairline rules (1px, full-bleed) as the only section divider, no cards and no shadows.
  3. Section labels in the outer margin, rotated or baseline-aligned to the first line of body copy.
  4. A body measure of 60 to 66 characters held even on a 1600px viewport, with the empty column
     left visibly empty.
- **Motion:** almost none. Transitions at 120 to 180ms, ease-out, opacity and position only. Motion
  is a state change, never an ornament.
- **Avoid:** gradients, drop shadows, 3D, blur, rounded corners above 4px, centred body text.
- **Right for:** editorial and publishing, B2B professional services, research and data products,
  wayfinding, anything where the reader needs to trust the hierarchy.
- **Wrong for:** anything that needs warmth, humour or emotional arousal. It cannot do playful.
- **Tell that it has been done badly:** the grid is decorative rather than structural. Rules appear
  where there is no real division, section numbers count things that are not a sequence, and the
  negative space is uniform padding rather than composed emptiness. Diagnostic: delete every rule
  and numeral. If nothing is lost, they were ornament.

### 2. Constructivist geometric

- **Feeling:** primary, architectural, confident to the point of blunt. Shape carries the message.
- **Keywords:** geometric · flat · rhythmic · type-as-shape
- **Lineage:** Bauhaus (Herbert Bayer, László Moholy-Nagy), Russian constructivism (Rodchenko, El
  Lissitzky), Wim Crouwel at Total Design, Karel Martens' letterpress monoprints, Paula Scher's
  Public Theater posters.
- **Typography:** geometric sans at scale, often rotated, often cropped by the frame. Licensed:
  Futura, Avenir Next, PP Neue Montreal (Pangram Pangram). Free: **Jost\*** (Owen Earl,
  indestructible type) which is an honest open Futura, or **Chivo** for a heavier grotesque voice.
- **Colour:** primaries plus black on white, or one fluorescent pushed to the edge of comfort. The
  palette is flat and unmixed. No tints, no ramps, no midtones doing the work.
- **Layout:** circles, squares, triangles and diagonals as primary composition elements, sized at
  page scale. The type sits inside the geometry rather than being decorated by it.
- **Signature moves:**
  1. One circle or square at 40 to 70% of the viewport width, used as the composition anchor.
  2. Type rotated 90 degrees along a hard edge, reading bottom-to-top.
  3. A headline cropped by the canvas edge, so the reader completes the word.
  4. Colour blocks that bleed off two sides, never floating.
- **Motion:** rotation and hard translation, no easing that softens the geometry. 250 to 400ms,
  linear or a steep cubic-bezier. Elements arrive by sliding, not by fading.
- **Avoid:** photography (use shape and illustration), perspective, soft shadows, gradients.
- **Right for:** posters, arts and cultural programming, festivals, education, campaigns with a
  stance.
- **Wrong for:** corporate contexts, dense product UI, anything needing subtlety or long-form
  reading.
- **Tell that it has been done badly:** the shapes are small and decorative, sitting in corners as
  "accents" rather than structuring the page. Also: pastel primaries. Constructivism with washed-out
  colour is just a memphis-flavoured template.

---

## Family B · Quiet minimalism

### 3. Japanese emptiness

- **Feeling:** quiet, patient, reverent. Deliberately un-full, so the viewer supplies the meaning.
- **Keywords:** emptiness · warm-neutral · patient · reduced
- **Lineage:** Kenya Hara's art direction for MUJI and his writing on *ma* (emptiness); Naoto
  Fukasawa's product work; Taku Satoh; Shiseido's editorial tradition; the Japanese photobook.
- **Typography:** one face, two sizes, no bold. Licensed: Tsukushi Mincho, Yu Gothic. Free: **Zen
  Old Mincho** or **Shippori Mincho** for Japanese and Latin together, **EB Garamond** or **Source
  Serif 4** for Latin only. Set at a size that looks slightly too small, then leave it there.
- **Colour:** off-white dominant, never pure white. Ink is warm charcoal, never `#000000`. One
  natural colour may appear, and it should look like it came from a material (clay, indigo, unbleached
  paper) rather than from a colour picker.
- **Layout:** 70 to 80% empty. Small content islands with vertical rhythm that you can feel. The
  emptiness must be composed, meaning it has shape and asymmetry, not just generous padding.
- **Signature moves:**
  1. A single object photographed against infinite white, occupying under 25% of the frame.
  2. Captions set smaller than feels comfortable, positioned far from what they caption.
  3. A page that scrolls a long way with very little on it, so the scroll itself becomes pacing.
  4. Type positioned off-centre by a specific, repeated offset rather than centred.
- **Motion:** slow and few. 400 to 700ms, ease-out, opacity only. One reveal per screen at most.
- **Avoid:** saturated accents, more than two type sizes, borders, cards, any element that
  announces itself.
- **Right for:** lifestyle and homeware, wellness, high-end product reveals, galleries, retreats,
  slow media.
- **Wrong for:** dashboards, dense UI, marketing that has to fight for attention in a feed, anything
  with more than a handful of things to say.
- **Tell that it has been done badly:** the whitespace is uniform padding rather than composed
  emptiness, and the page is still full. Second tell: pure white and pure black, which turns
  emptiness into a blank CSS reset. Third: a saturated CTA dropped into the middle of it, which
  breaks the entire premise.

### 4. Functionalist industrial

- **Feeling:** useful, honest, unobtrusive. Quietly confident that the object is good.
- **Keywords:** functional · tactile · specified · long-lasting
- **Lineage:** Dieter Rams and Hans Gugelot at Braun; Vitsœ's 606 shelving system and its website;
  Jasper Morrison and Naoto Fukasawa's Super Normal; pre-2013 Apple product marketing.
- **Typography:** one neutral sans in one or two weights, set small and set precisely. Licensed:
  Akzidenz-Grotesk, Söhne, Untitled Sans (Klim). Free: **IBM Plex Sans**, which is a genuine
  industrial face rather than a UI default.
- **Colour:** greyscale carrying almost everything, with one functional colour reserved for a real
  function (a warning, a live state, a control). Colour is never mood. If it is not doing a job it
  is not there.
- **Layout:** product-first. One hero object, framed generously, with specification tables treated as
  quiet compositions rather than data dumps.
- **Signature moves:**
  1. A specification table set as a designed object: aligned columns, tabular numerals, hairlines
     only between groups.
  2. Isometric or orthographic line drawings used as diagrams instead of icons.
  3. Callout labels connected to the product by a 1px leader line.
  4. Physical units everywhere (mm, g, dB, W) rather than adjectives.
- **Motion:** mechanical. 150 to 250ms, ease-in-out, movement along a single axis. Things slide the
  way a drawer slides.
- **Avoid:** decorative flourishes, marketing bombast, coloured backgrounds, lifestyle photography
  with models.
- **Right for:** hardware, tools, furniture, instruments, B2B products with real craft, anything
  where the buyer reads specifications.
- **Wrong for:** consumer entertainment, maximalist brands, services with no physical object.
- **Tell that it has been done badly:** it becomes a grey template. The giveaway is that the
  restraint is applied to the chrome but not to the copy, so you get Rams-grade layout carrying
  "Innovative solutions for the modern workplace". Second tell: a spec table with invented specs.

---

## Family C · Editorial and narrative

### 5. Magazine editorial

- **Feeling:** opinionated, layered, alive. Someone has a view and is prepared to argue it.
- **Keywords:** layered · photographic · type-driven · hierarchical
- **Lineage:** New York Magazine (Milton Glaser and Walter Bernard's founding grid); Bloomberg
  Businessweek under Richard Turley; The California Sunday Magazine; Fabien Baron's Harper's Bazaar.
- **Typography:** a real pairing with real contrast. A display serif or condensed grotesque against
  a humanist body face. Licensed: Druk or Austin (Commercial Type), Chronicle Display (Hoefler&Co),
  Publico, GT Sectra. Free: **Newsreader** (Production Type) for body and **Bodoni Moda** for
  display, which gives you the high-contrast masthead voice without the overused defaults.
- **Colour:** taken from the photography, not chosen against it. Rich neutrals as the ground, with
  one or two colours pulled directly out of the images so the palette changes issue to issue.
- **Layout:** a magazine grid with real furniture: pull quotes, drop caps, sidebars, bylines,
  standfirsts, folios. Hierarchy is deep, four or five levels, and each level is visibly distinct.
- **Signature moves:**
  1. A pull quote at 2 to 3 times body size, breaking the measure and hanging into the margin.
  2. A drop cap of three lines, optically aligned to the text edge rather than the box edge.
  3. Captions in a condensed sans or mono, deliberately mismatched to the body serif.
  4. A colour-blocked sidebar that interrupts the column rather than sitting beside it.
  5. A standfirst set at 1.5 times body, in the display face, at a different measure.
- **Motion:** editorial pacing rather than animation. Scroll-linked reveals on images at most, no
  motion on type.
- **Avoid:** generic stock photography, centred layouts, icons used as decoration, uniform section
  spacing.
- **Right for:** long-form content, opinion-led brands, publications, newsletters, rich storytelling
  marketing, anywhere the writing is genuinely good.
- **Wrong for:** short-attention interfaces, dashboards, anything where the copy is thin (the layout
  will expose it immediately).
- **Tell that it has been done badly:** the editorial furniture is present but empty. Pull quotes
  that quote nothing memorable, drop caps on two-sentence paragraphs, a sidebar with no real aside.
  Editorial layout amplifies content, so applied to filler it amplifies the filler.

### 6. Zine and risograph

- **Feeling:** handmade, immediate, low-fidelity on purpose, warm and a bit rude.
- **Keywords:** risograph · spot-colour · textured · hand-placed
- **Lineage:** the independent zine tradition; risograph studios such as Hato Press (London) and
  Colorama (Berlin); Art Chantry's Seattle poster work; skate and hardcore flyer culture.
- **Typography:** one distinctive display face plus a plain workhorse, both allowed to look
  photocopied. Licensed: Tusker Grotesk (Displaay), PP Editorial New. Free: the Velvetyne library
  (**Karrik**, **Basteleur**, **Pilowlava**) and **Redaction**, all genuinely libre and none of them
  a default.
- **Colour:** two or three spot colours with the flat, slightly wrong quality of riso ink
  (fluorescent pink, teal, forest, mustard). Overprint where they meet. Registration should be
  visibly imperfect, by 1 to 3 pixels, consistently in one direction.
- **Layout:** collage. Elements are hand-placed, slightly rotated, allowed to overlap and to run off
  the edge. Alignment exists but is not obeyed everywhere.
- **Signature moves:**
  1. Halftone dot screens over photography at a coarse frequency (6 to 10px), so the dots are
     visible as dots.
  2. Spot-colour overprint on overlapping elements, using `mix-blend-mode: multiply`.
  3. A 1 to 3 degree rotation applied to a few elements, never all of them.
  4. Typewriter or condensed-mono captions, hand-positioned rather than aligned to a caption slot.
  5. Visible paper texture or photocopy grain at 4 to 8% opacity across the whole surface.
- **Motion:** none, or deliberately janky. Step transitions with `steps()` easing rather than smooth
  curves. Motion here should look like a flick-book, not a product.
- **Avoid:** pixel-perfect precision, gradients, gloss, drop shadows, anything that reads as
  expensive.
- **Right for:** independent brands, music, culture, merchandise, event marketing, "made by humans"
  positioning, anything anti-corporate.
- **Wrong for:** enterprise, financial services, healthcare, any brand that needs to feel premium or
  safe.
- **Tell that it has been done badly:** the imperfection is uniform. Every element rotated by the
  same 2 degrees, grain applied as a single flat overlay, halftone rendered so finely it just looks
  like noise. Real riso is inconsistent, so a systematic imperfection reads as a filter.

---

## Family D · Motion and digital-native

### 7. Generative motion

- **Feeling:** alive, computational, mesmerising. The screen is a window onto a running system.
- **Keywords:** generative · motion-first · light-as-material · continuous
- **Lineage:** Field.io, Universal Everything (Matt Pyke), Active Theory, Moniker, onformative; the
  Processing lineage through Casey Reas and Zach Lieberman.
- **Typography:** restrained deliberately, because motion is the hero. One geometric or neo-grotesque
  sans in a single weight. Licensed: PP Neue Montreal, Söhne. Free: **Archivo** or **Anybody**
  (Velvetyne, variable) if you want the axis to animate.
- **Colour:** either near-monochrome with light as the only chroma, or a genuinely computed palette
  (colours sampled from the simulation, not chosen for it). Whatever you do, avoid the
  indigo-to-magenta default, which is the entire reason this school has a bad reputation.
- **Layout:** full-bleed. The motion occupies the whole canvas, and the UI floats over it as a thin,
  semi-transparent layer with a hard legibility floor.
- **Signature moves:**
  1. One continuous ambient system that never resolves, running at low amplitude behind everything.
  2. Type that emerges from or is masked by the motion, rather than sitting on top of it.
  3. A cursor or pointer that participates in the simulation.
  4. A single orchestrated page-load sequence, timed as one event rather than as a dozen staggered
     fades.
- **Motion:** continuous rather than triggered. 60fps ambient at low amplitude, with discrete
  interactions at 200 to 400ms. Must degrade to a static composition under
  `prefers-reduced-motion: reduce`, and that static state has to be good on its own.
- **Avoid:** traditional section-stacked layouts, static hero images, scroll-jacking, motion on
  every element.
- **Right for:** launch moments, cultural institutions, installations, technology brands whose
  product genuinely is computational.
- **Wrong for:** content-heavy sites, purchase funnels, anything the user needs to read, decide on,
  or return to repeatedly.
- **Tell that it has been done badly:** the motion is decorative and separable. If you could
  screenshot it, delete the animation, and lose nothing but the vibe, it was a gradient with extra
  steps. Second tell: the reduced-motion fallback is a blank dark rectangle.

### 8. Brutalist web

- **Feeling:** raw, direct, anti-polish. The document is the design.
- **Keywords:** unstyled · monospace · text-dense · structural-HTML
- **Lineage:** Are.na, Craigslist, the Bloomberg Terminal transplanted to the browser, Hacker News;
  catalogued by Pascal Deville's brutalistwebsites.com.
- **Typography:** monospace or a default serif, used at document scale rather than display scale.
  Free: **IBM Plex Mono**, **JetBrains Mono**, **Fragment Mono**, or plain Times New Roman used
  honestly. Headings are two steps up from body, not ten.
- **Colour:** black on white, one saturated link colour, nothing else. Colour is a hyperlink
  affordance, not a brand asset.
- **Layout:** dense text, real tables, horizontal rules, long scroll, no hero apparatus. Content
  starts at the top of the page because there is no reason for it not to.
- **Signature moves:**
  1. Actual `<table>` markup, with visible borders, used for content that is tabular.
  2. Underlined links in default blue or a single chosen link colour, with visited states preserved.
  3. A plain `<pre>` block used for something real: a schema, a log, a config, a diff.
  4. Navigation as a flat unstyled list, no active-state pill, no highlight bar.
  5. Zero border-radius, zero shadow, `1px solid` for every boundary.
- **Motion:** none. Instant state changes. Hover is a colour or underline change, nothing more.
- **Avoid:** animation, skeuomorphism, cards, gradients, any attempt to soften or polish.
- **Right for:** tools for thought, developer-facing products, archives and indexes, independent
  publications, anything where credibility comes from density.
- **Wrong for:** consumer retail, emotional storytelling, visual-led brands, anything sold on desire.
- **Tell that it has been done badly:** it is a normal modern layout with the CSS turned down, so
  you get an unstyled page that reads as broken rather than as chosen. The real distinction is
  density: brutalist web is *more* information per screen than the alternative, not less.

---

## Family E · Expressive and experimental

### 9. Expressive concept

- **Feeling:** provocative, hand-made, emotional. It wants a reaction, not agreement.
- **Keywords:** expressive · concept-led · theatrical · handmade
- **Lineage:** Stefan Sagmeister; Paula Scher in her expressive mode; David Carson at Ray Gun;
  Neville Brody at The Face; Ed Fella's post-design lettering.
- **Typography:** type as image. Custom, drawn, photographed, distorted, or a display face pushed
  well past its comfortable size. Licensed: Ogg or Sharp Grotesk (Sharp Type). Free: **Syne**
  (Bonjour Monde, distributed by Velvetyne) and the wider Velvetyne catalogue.
- **Colour:** saturated and deliberately clashing. Pairs that a colour theory tool would reject.
  There is no fear of bad taste, but there is a rule: the clash must be consistent, appearing across
  every surface, or it reads as a mistake.
- **Layout:** the concept dictates the grid, not the reverse. Scale shifts are extreme, from 10px to
  300px on the same page.
- **Signature moves:**
  1. Photographed physical type or objects standing in for digital type.
  2. A single element at absurd scale, cropped so it cannot be read all at once.
  3. A deliberate "mistake" repeated enough times to read as a decision.
  4. Text set in a way that makes it slightly hard to read, where slowing the reader is the point.
- **Motion:** theatrical. Long, over-timed, occasionally uncomfortable. 600ms to 1.2s with
  overshoot. Motion is performance here, not feedback.
- **Avoid:** restraint. This school punishes hedging more than any other. Half-committed
  expressiveness reads as confusion, not boldness.
- **Right for:** cultural work, campaigns, festivals, strong personalities, one-off moments, brands
  whose risk is being ignored.
- **Wrong for:** functional UI, ongoing design systems, B2B, anything with a compliance review.
- **Tell that it has been done badly:** one expressive element floating in an otherwise conventional
  layout. A wild hero over a standard three-column feature grid is not expressive design, it is a
  template wearing a hat.

### 10. Y2K futurist-retro

- **Feeling:** optimistic, technological, nostalgic for a future that did not arrive.
- **Keywords:** chrome · glossy · iridescent · interface-as-ornament
- **Lineage:** The Designers Republic (Warp Records, WipEout); early-2000s consumer tech and
  software packaging; the contemporary revival across music and fashion.
- **Typography:** either a pixel or bitmap face, or a stretched rounded geometric, and often both in
  the same composition. Free: **Departure Mono** (Helena Zhang), **Silkscreen**, **VT323**.
  Licensed: PP Mondwest.
- **Colour:** chrome and iridescence as materials rather than colours, plus acid green, electric
  blue and hot pink. Gradients are permitted here and only here, because they are the period
  reference rather than a default.
- **Layout:** HUD overlays, visible interface metaphors, panels with bevels, progress bars that are
  not measuring anything real.
- **Signature moves:**
  1. A chrome or liquid-metal 3D object as the hero, rendered rather than illustrated.
  2. Scan lines or CRT curvature over a section.
  3. Bevelled panel edges (light top-left, dark bottom-right) instead of shadows.
  4. Type with a hard offset drop-shadow at 2 to 4px, no blur.
- **Motion:** looping and mechanical. Marquees, blinking cursors, stepped counters. Nothing eased.
- **Avoid:** mixing with genuine modernism. Half-Y2K reads as a dated template rather than a
  reference.
- **Right for:** gaming, music, fashion aimed young, crypto-native projects, nostalgia-forward
  campaigns.
- **Wrong for:** professional tools, healthcare, finance, anything whose job is to be trusted.
- **Tell that it has been done badly:** the references are era-mixed. Vaporwave palette with Web 2.0
  glossy buttons and a 2016 flat icon set is three decades in a blender. Pick one year and stay in
  it.

---

## Family F · Trust and institution

### 11. Corporate trust

- **Feeling:** established, accountable, unexciting on purpose. The design signals that the
  organisation will still exist in ten years.
- **Keywords:** institutional · calm · systematic · durable
- **Lineage:** Chermayeff & Geismar (Chase 1960, Mobil 1964, NBC, PBS); Saul Bass (the 1969 Bell
  System mark, the 1983 AT&T globe, United Airlines' tulip); Pentagram's Mastercard identity (2016,
  led by Michael Bierut); Siegel+Gale's simplicity practice.
- **Typography:** one neutral sans across the whole system, with a serif permitted for long-form
  only. Licensed: Graphik or Guardian Sans (Commercial Type), Söhne, National 2 (Klim). Free:
  **Public Sans**, **Libre Franklin**, or **Source Sans 3**, all of which read institutional rather
  than startup.
- **Colour:** one owned primary that appears on every surface, a disciplined neutral ramp, and
  semantic colours that are only ever semantic. The primary should be a colour the organisation can
  defend in a trademark filing, not a trend.
- **Layout:** predictable and repeated. The same section shape used consistently, generous margins,
  no surprises. Consistency is the message, so novelty within the system is a bug.
- **Signature moves:**
  1. A geometric brandmark used as a repeated structural device (as a bullet, a corner crop, a
     section marker) rather than only as a logo.
  2. A single owned colour applied at full strength to one large surface per page.
  3. Photography of real named people doing real work, credited, never stock.
  4. Numbers set in tabular figures with the unit always attached.
  5. A visible, dated footer with real registration details, which is a trust signal in itself.
- **Motion:** minimal and consistent. 200ms ease-out on everything, one easing curve for the entire
  system, no exceptions and no hero animation.
- **Avoid:** trend chasing, playful illustration, three type families, decorative gradients,
  anything that will look dated in eighteen months.
- **Right for:** banking, insurance, healthcare providers, utilities, government and public sector,
  legal, enterprise infrastructure, B2B with long sales cycles.
- **Wrong for:** brands competing on personality, early-stage products that need to be memorable
  more than credible, culture and entertainment.
- **Tell that it has been done badly:** it becomes anonymous. Blue primary, rounded cards, stock
  photography of a diverse team laughing at a laptop, and a headline about empowerment. The fix is
  the signature move: a corporate-trust system without one owned, repeated structural device is
  indistinguishable from every competitor.

### 12. Technical utility

- **Feeling:** instrumented, precise, load-bearing. This is a tool that reports real state.
- **Keywords:** instrumented · tabular · monospaced · high-density
- **Lineage:** Otl Aicher's Munich 1972 wayfinding system and his work for ERCO; the NASA Graphics
  Standards Manual (Danne & Blackburn, 1975); Braun's measuring instruments; Teenage Engineering;
  the Bloomberg Terminal.
- **Typography:** a mono or a superfamily with a mono cut, used for anything that is a value.
  Licensed: Berkeley Mono, Söhne Mono. Free: **Recursive** (Arrow Type, one superfamily spanning
  mono to sans, which solves the pairing problem outright), **IBM Plex Mono**, **Martian Mono**
  (Evil Martians).
- **Colour:** a restrained ground with signal colours that map to actual states (nominal, warning,
  fault). Colour is data, so a colour with no state behind it does not appear. Never encode state by
  hue alone, always pair it with a label, shape or weight.
- **Layout:** dense and modular. Fixed baseline grid, panels divided by rules, high information per
  square inch. Whitespace is a division tool, not a luxury.
- **Signature moves:**
  1. Tabular numerals everywhere, with units in a lighter weight immediately after the value.
  2. A live status strip or calibration bar that shows real state, always visible.
  3. Labels in uppercase mono at 10 to 11px with 0.08em tracking, treated as an instrument legend.
  4. Panels divided by 1px rules on a fixed 8px baseline, no gaps, no radii.
  5. A monospaced identifier (build hash, version, timestamp) shown honestly in the chrome.
- **Motion:** functional only. Values update by counting or stepping rather than fading, at 100 to
  200ms. Nothing eases in a way that would make a reading feel imprecise.
- **Avoid:** rounded cards, soft shadows, decorative charts, marketing adjectives, any element that
  implies more precision than the data has.
- **Right for:** developer tools, observability, logistics, energy and grid, scientific and
  laboratory products, hardware controllers, trading and market data.
- **Wrong for:** consumer lifestyle, anything sold on emotion, brands with no real numbers to show.
- **Tell that it has been done badly:** the instruments are fake. A dashboard hero with charts that
  plot nothing, a status light that is always green, a version string that is invented. Technical
  utility is the school most damaged by fabricated data, because the whole aesthetic is a claim of
  accuracy.

---

## Family G · Material and human

### 13. Craft heritage

- **Feeling:** made, aged, particular. There is a person and a place behind this.
- **Keywords:** letterpress · engraved · material · provenance
- **Lineage:** Hatch Show Print (Nashville letterpress); Louise Fili's lettering and restaurant
  identities; the apothecary and pharmacy label tradition; Fortnum & Mason; Aesop's retail and
  packaging system.
- **Typography:** an old-style or transitional serif with real history, plus small caps and a
  spurred or engraved secondary. Licensed: Adobe Caslon, Sackers Gothic, Canela (Commercial Type).
  Free: **Libre Caslon Text** and **Libre Caslon Display**, **EB Garamond**, **Cardo**, all of which
  carry genuine historical form rather than a nostalgic pastiche.
- **Colour:** pigment rather than light. Colours that a printer would mix: oxblood, ochre, verdigris,
  bone, ink. Two colours plus paper, in the tradition of a two-plate press run.
- **Layout:** symmetrical and centred where a label would be centred, with a strong outer frame or
  rule border. This is the one school where centring is correct rather than lazy, because it is a
  direct reference to label and title-page typography.
- **Signature moves:**
  1. A ruled border or double-rule frame around the whole composition or a key block.
  2. Small caps with generous letter-spacing (0.1em plus) for secondary lines.
  3. An engraved or hairline-outline illustration, botanical or mechanical, used once at scale.
  4. A tiny "established" or provenance line set in the smallest type on the page.
  5. Ink texture: slight edge irregularity on rules and type, at a subtlety that only registers up
     close.
- **Motion:** almost none, and never on type. If something moves it should feel like a page turning
  rather than an interface responding.
- **Avoid:** modern geometric sans, flat icons, gradients, pure black, anything with a radius above
  2px.
- **Right for:** food and drink, spirits, skincare and apothecary, hospitality, bookshops, makers,
  local businesses with genuine history, anything where provenance is the selling point.
- **Wrong for:** software, anything positioned as new or fast, brands with no story to tell (the
  heritage cues will read as invented, because they will be).
- **Tell that it has been done badly:** manufactured heritage. "Est. 2024" in a laurel wreath,
  distressed texture applied as a Photoshop filter, an ornate badge logo for a three-month-old
  startup. Craft heritage without a real story is the most transparently dishonest school in this
  catalogue.

### 14. Warm humanist

- **Feeling:** friendly, competent, human-scale. Approachable without being childish.
- **Keywords:** rounded · warm-neutral · illustrated · conversational
- **Lineage:** Airbnb's 2014 identity (DesignStudio) and the Cereal typeface (with Dalton Maag);
  Slack's 2019 Pentagram rebrand; Mailchimp's 2018 Collins rebrand; Headspace; Duolingo.
- **Typography:** a geometric or humanist sans with soft terminals, set larger than you would set a
  corporate face. Licensed: GT Walsheim (Grilli Type), Sharp Grotesk. Free: **Figtree**, **Work
  Sans**, or **Hanken Grotesk**. Do not reach for Poppins or Montserrat, which are the defaults this
  school is most often flattened into.
- **Colour:** warm neutrals as the ground (never cool grey), a saturated but unclashing primary, and
  a secondary palette wide enough to support illustration. Warmth comes from the neutral, not from
  the accent.
- **Layout:** generous, roomy, with a consistent radius that is used deliberately at one or two
  values rather than everywhere. Sections breathe. Nothing is dense.
- **Signature moves:**
  1. A proprietary illustration style with a consistent, unusual constraint (one line weight, a
     fixed three-colour limit, a shared horizon line) so it cannot be mistaken for stock.
  2. A single soft radius value used at a size large enough to be a decision (20px plus), not the
     default 8.
  3. Copy that speaks in second person and uses contractions, treated as a design element.
  4. Photography of real people at real scale, cropped tight, not smiling at a laptop.
  5. An empty state that is genuinely funny or generous, and clearly written by a person.
- **Motion:** springy but short. 250 to 350ms with a mild overshoot, applied to one or two elements
  per interaction, not to the whole page.
- **Avoid:** cool greys, corporate blue, stock illustration (the flat pastel figures with no faces
  are the strongest slop tell in this school), icon-per-bullet lists.
- **Right for:** consumer apps, marketplaces, education, health and wellbeing services, HR and
  people tools, any product with a support burden.
- **Wrong for:** anything sold on authority or exclusivity, enterprise security, luxury, technical
  products where friendliness reads as evasion.
- **Tell that it has been done badly:** it becomes the default SaaS look. Rounded cards, pastel
  blobs, faceless illustrated figures, Poppins, and a purple gradient. This is the school with the
  narrowest gap between "warm" and "generic", so the illustration constraint and the copy have to do
  the identifying work.

---

## Family H · Restraint and nature

### 15. Luxury restraint

- **Feeling:** expensive, withheld, self-assured. It does not explain itself and it does not sell.
- **Keywords:** withheld · high-contrast · spacious · wordmark-led
- **Lineage:** Hermès; the Céline identity under Phoebe Philo and its 2018 wordmark reset under
  Hedi Slimane (accent dropped, tracking tightened); Bottega Veneta under Daniel Lee; Fabien Baron's
  work for Calvin Klein and Burberry; Peter Saville; M/M Paris.
- **Typography:** a wordmark-quality display face and very little else. A high-contrast didone or a
  refined humanist, set large and tracked wide, with the body face almost invisible by comparison.
  Licensed: Didot, Optima, Canela, Neue Haas Unica. Free: **Bodoni Moda** for the didone voice,
  **Cormorant Garamond** for a lighter one, **Italiana** for a display-only wordmark.
- **Colour:** two values and one material. Black, bone, and a single metal or leather tone. No
  semantic colours in the marketing surface. Restraint in the palette *is* the luxury signal, and
  each additional colour subtracts from it.
- **Layout:** enormous margins, small type, and photography allowed to be the only thing on the
  screen. Content density is deliberately below what the viewport could hold.
- **Signature moves:**
  1. The wordmark set at 0.2em to 0.4em tracking, in caps, at a size that feels restrained rather
     than large.
  2. A full-bleed image with the only text placed in a corner at 12px.
  3. Navigation reduced to three or four words with no icons, no cart badge styling, no hover fills.
  4. Product presented with no price on the primary view, and no persuasion copy anywhere.
  5. A vertical rhythm so slow that a section occupies more than one full viewport.
- **Motion:** slow fades only. 500 to 800ms, ease-out, opacity. Nothing bounces, nothing slides
  fast, nothing draws attention to itself as an effect.
- **Avoid:** badges, discounts, urgency copy, social proof, testimonials, icons, more than two type
  sizes on a page.
- **Right for:** fashion, fine jewellery, high-end hospitality, architecture and interiors, private
  services, art and collectibles.
- **Wrong for:** anything with a conversion target on a short timescale, mass-market products, any
  brand that needs to explain what it does.
- **Tell that it has been done badly:** it is minimal but not confident. The giveaway is persuasion
  leaking back in: a "Shop now" button, a trust badge row, a newsletter modal. Luxury restraint
  fails the moment it asks for something. Second tell: a high-contrast didone at small sizes, which
  simply looks broken on screen.

### 16. Organic naturalism

- **Feeling:** grounded, seasonal, of a place. Made from something that grew.
- **Keywords:** earth-toned · textural · cartographic · seasonal
- **Lineage:** Patagonia; Massimo Vignelli's 1977 National Park Service Unigrid brochure system;
  Kinfolk; Studioilse (Ilse Crawford) for material warmth in space.
- **Typography:** a serif with warmth and an honest sans for labels. Licensed: Freight Text, Tiempos
  Text (Klim). Free: **Literata** (TypeTogether), **Petrona**, **Alegreya**, or **Gentium** for text,
  with **Public Sans** for utility. Avoid Fraunces, which has become the default "natural brand"
  signal.
- **Colour:** derived from an actual place or material rather than a palette generator. Take the
  colours from a specific photograph, soil, coast, forest, or season, and name them after their
  source in the tokens so the derivation survives.
- **Layout:** horizon-led. Strong horizontal divisions, full-bleed landscape imagery, content that
  sits low in the frame as though weighted by gravity.
- **Signature moves:**
  1. A cartographic device: contour lines, a grid reference, a map fragment, an elevation profile,
     used as real information rather than decoration.
  2. Full-bleed photography with a horizon line aligned to a grid division, repeated across sections.
  3. Colour names in the token layer that reference their source ("basalt", "kelp", "hakea"), so the
     palette's origin is documented in the code.
  4. A seasonal or dated element that is genuinely updated, which turns the naturalism into a
     commitment rather than a look.
  5. Paper or canvas texture at 3 to 6% opacity, warm rather than grey.
- **Motion:** slow parallax on landscape imagery only, 600ms plus, and nothing else. Motion should
  feel like weather, not like interface.
- **Avoid:** leaf icons, green-on-green, gradient meshes standing in for sky, generic
  sustainability iconography, stock nature photography.
- **Right for:** outdoor and apparel, food and agriculture, climate and energy, tourism and place
  brands, conservation, hospitality tied to a location.
- **Wrong for:** dense product UI, financial services, anything urban and fast, brands with no real
  connection to a place (the naturalism will be decorative and will read that way).
- **Tell that it has been done badly:** the nature is generic. Sage green, a leaf icon, a soft
  gradient sky, and stock photography of a forest that could be anywhere. The corrective is
  specificity: name the place, use its actual colours, and show real photographs of it.

---

## Category to school map

Three candidates per category, drawn from at least two families so a territory round has real spread.
These are starting points for the advisor round, not verdicts. The brief always wins.

| Business category | Candidate A | Candidate B | Candidate C |
|---|---|---|---|
| B2B SaaS and developer tools | 12 Technical utility | 1 Swiss editorial | 8 Brutalist web |
| Fintech and payments | 11 Corporate trust | 12 Technical utility | 1 Swiss editorial |
| Banking and insurance | 11 Corporate trust | 4 Functionalist industrial | 1 Swiss editorial |
| Healthcare and medtech | 11 Corporate trust | 14 Warm humanist | 4 Functionalist industrial |
| Wellness and mental health | 3 Japanese emptiness | 14 Warm humanist | 16 Organic naturalism |
| Legal and professional services | 1 Swiss editorial | 11 Corporate trust | 13 Craft heritage |
| Food and drink (CPG) | 13 Craft heritage | 6 Zine and risograph | 16 Organic naturalism |
| Beauty and skincare | 3 Japanese emptiness | 13 Craft heritage | 15 Luxury restraint |
| Fashion and apparel | 15 Luxury restraint | 5 Magazine editorial | 10 Y2K futurist-retro |
| Hospitality (hotels, restaurants) | 13 Craft heritage | 15 Luxury restraint | 16 Organic naturalism |
| Property and real estate | 1 Swiss editorial | 15 Luxury restraint | 4 Functionalist industrial |
| Education and edtech | 2 Constructivist geometric | 14 Warm humanist | 5 Magazine editorial |
| Non-profit and advocacy | 2 Constructivist geometric | 5 Magazine editorial | 11 Corporate trust |
| Music, events and culture | 6 Zine and risograph | 9 Expressive concept | 10 Y2K futurist-retro |
| Gaming, crypto and Web3 | 10 Y2K futurist-retro | 7 Generative motion | 8 Brutalist web |
| Hardware and industrial products | 4 Functionalist industrial | 12 Technical utility | 1 Swiss editorial |
| Agencies, studios and portfolios | 9 Expressive concept | 7 Generative motion | 5 Magazine editorial |
| Media, publishing and newsletters | 5 Magazine editorial | 8 Brutalist web | 1 Swiss editorial |
| Trades and local services | 11 Corporate trust | 13 Craft heritage | 2 Constructivist geometric |
| Logistics and supply chain | 12 Technical utility | 11 Corporate trust | 4 Functionalist industrial |
| Energy and climate tech | 12 Technical utility | 16 Organic naturalism | 1 Swiss editorial |
| Agriculture and food production | 16 Organic naturalism | 13 Craft heritage | 12 Technical utility |
| Marketplaces and consumer apps | 14 Warm humanist | 5 Magazine editorial | 2 Constructivist geometric |
| Recruitment and HR | 14 Warm humanist | 11 Corporate trust | 1 Swiss editorial |
| Fitness and sport | 2 Constructivist geometric | 9 Expressive concept | 16 Organic naturalism |

---

## When none of these fit

Real briefs exceed any catalogue. If the user rejects all three directions, do not improvise a
fourth from intuition, because intuition here means the defaults. Instead ask for:

- One reference artefact (a site, a cover, a package, a screenshot) that captures the feeling.
- Three words for the feeling they want.
- One adjacent brand whose look they admire, and one they specifically do not.

Then reverse-engineer a mini-system from those anchors using the same twelve fields as the entries
above. Write it down in the same schema. A school you derived and documented is a commitment. A
school you felt your way toward is a default with better marketing.
