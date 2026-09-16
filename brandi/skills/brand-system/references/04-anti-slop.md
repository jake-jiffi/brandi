# 04. Anti-slop

The rule set that stops output reading as machine-made. Read it before you write a design plan, and
again before you call anything finished.

Everything here is a default-breaker, not a taste ban. Each rule blocks a pattern **when you reached
for it because it was the nearest thing to hand**. Every one of them is correct somewhere, and the
brief always wins. What is forbidden is arriving at them by gravity.

---

## Calibration: what 2026 AI design actually looks like

As of 2026, AI-generated design clusters around a small number of identifiable defaults. They appear
regardless of subject, which is exactly what makes them defaults rather than choices. Anthropic's own
`frontend-design` skill names three:

> (1) a warm cream background (near **#F4F1EA**) with a high-contrast serif display and a
> **terracotta accent**; (2) a near-black background with a single bright **acid-green or vermilion**
> accent; (3) a **broadsheet-style layout with hairline rules, zero border-radius**, and dense
> newspaper-like columns.
>
> All three are legitimate for some briefs, but they are defaults rather than choices, and they
> appear regardless of subject.

Two more have consolidated since, and are worth naming precisely:

4. **The violet SaaS look.** Near-black or deep navy ground, an indigo-to-violet gradient hero, a
   frosted glass panel, and Inter. Logged as the number one reported AI tell by the Refero design
   reference corpus, and the reason `nexu_open-design` blocks seven specific indigo hexes at P0.
5. **The pastel humanist look.** Warm off-white, one soft radius on everything, faceless flat
   illustrated figures, Poppins or Montserrat, and a rounded three-column feature grid.

### The cream and terracotta hazard

Look 1 deserves a specific warning. Anthropic's own brand is cream `#faf9f5` with terracotta
`#d97757` (from its `brand-guidelines` skill). The AI-default look catalogued in `frontend-design` is
cream near `#F4F1EA` with terracotta. **"Looks like Claude" and "looks like AI slop" now occupy
nearly the same visual space.**

This is live and it cuts both ways. A cream-and-terracotta brand system will be read by a design
audience as either derivative of Anthropic or as unedited model output, and there is no way to
control which. So:

- Do not arrive at cream plus a warm-earth accent by default. If you land there, you did not derive
  it.
- If the brief asks for it, or if the real brand demonstrably uses it, build it, and **say in the
  artefact why it was chosen** so the decision is visible and defensible later.
- If the brand genuinely wants warm and paper-like, move the ground off `#F4F1EA` (try a cooler bone,
  a grey-green paper, or an actual scanned stock colour) and move the accent off terracotta (oxblood,
  ochre, verdigris, a real pigment name).

### The rule

> These looks are legitimate when the brief asks for them, and forbidden as defaults.
>
> Where the brief pins down a visual direction, follow it exactly. Where it leaves an axis free, do
> not spend that freedom on one of these.

Observation beats the ban list. If you are documenting a real brand that genuinely ships Inter on a
violet gradient, document reality. The ban applies to invented and derived decisions, never to
observed fact. (This nuance is taken from `dominikmartn_hue`, which correctly notes that a ban list
overriding observation would produce lies about the brand.)

---

## The rules

Each rule is a ban, the reason it reads as machine-made, and at least two named alternatives you can
actually build.

### 1. No multi-hue gradient backgrounds

Especially not purple to blue, sunset, or conic rainbows.

**Why:** a gradient is the cheapest way to make an empty area look intentional, so it is where a
model goes when it has nothing to say about the surface. Multiple hues in one field also means no
single colour owns the brand.

**Instead:** a flat brand colour at full strength across a full-bleed section; a single-hue gradient
with under 10 degrees of hue variance (which reads as a lighting condition, not a decoration); a
full-bleed photograph; a texture at 3 to 6% opacity over a solid ground.

### 2. No default indigo or violet as the accent

Specifically `#6366f1`, `#4f46e5`, `#4338ca`, `#3730a3`, `#8b5cf6`, `#7c3aed`, `#a855f7`.

**Why:** these are Tailwind's indigo and violet ramps at their default steps. They are the most
reported AI tell in design review because they are literally the framework default that nobody
changed.

**Instead:** derive the accent from the subject (a material, a pigment, a piece of equipment, a
place) and name it after its source; or, if you need a blue-violet, move it off the ramp deliberately
and document why (a desaturated slate-violet around `#5B5F8A`, or a warm-shifted ultramarine).

### 3. No blue-to-cyan "trust" gradient

`linear-gradient(#3b82f6, #06b6d4)` and its neighbours.

**Why:** it signals "technology company" and nothing else, which means it signals nothing. It is the
2019 fintech deck template surviving into 2026.

**Instead:** one saturated blue used flat with a genuine second colour that is not adjacent on the
wheel; or drop the colour claim entirely and let type and structure carry the credibility, as
corporate-trust identities actually do.

### 4. No gradient orbs or blurred blobs "representing AI"

The soft radial glow floating behind the hero.

**Why:** it is the single most over-used signifier in contemporary technology design, and it
represents nothing. It is the visual equivalent of the word "innovative".

**Instead:** a real screenshot of the product doing the thing; a diagram of the actual mechanism; a
photograph of the object or the people; or, if the hero genuinely needs an abstract field, a
generative system whose parameters come from real data.

### 5. No gradient text

`background-clip: text` with a two-stop gradient across a headline.

**Why:** it degrades legibility, breaks in high-contrast mode, and is a 2021 landing-page trope. It
also almost always coincides with rule 1, so it compounds.

**Instead:** a weight or width change on the emphasised words; a single accent colour applied to one
word, which is stronger because it is discrete; or an underline or highlight built from a real
element rather than a fill.

### 6. No emoji as interface icons

`✨ 🚀 🎯 ⚡ 🔥 💡 📈 🎨 🛡️` in headings, buttons, list markers or feature cards.

**Why:** emoji render differently on every platform, carry a tone the brand did not choose, and
signal that no icon system was ever designed. Emoji in a headline is a tell on its own.

**Instead:** a monoline SVG set at 1.6 to 1.8px stroke using `currentColor` (Phosphor, Lucide and
Iconoir are all reasonable starting points, but adjust the stroke and corner radius to match the
brand's type); or no icons at all, with a numbered or ruled list instead. An unmodified default icon
set is only marginally better than emoji.

### 7. No rounded card with a left-border accent stripe

`border-left: 4px solid <accent>` plus `border-radius` on the same element.

**Why:** it is the canonical AI dashboard tile, generated more than any other component shape in the
world. `nexu_open-design` blocks it at P0 with a literal regex.

**Instead:** a full-bleed panel divided by 1px rules with no radius and no border; a numbered
sequence where the numeral carries the emphasis; a framed cell (a full 1px border, square corners); a
receipt or ticket shape with a perforated edge; two overlapping panels with an intentional offset.

### 8. No three-column feature grid as the default structure

Three equal cards, each with an icon, a heading and two lines.

**Why:** it is the pre-trained path of least resistance. It also flattens hierarchy, because three
equal columns assert that three things are equally important, which is almost never true.

**Instead:** a single-column editorial narrative where each point gets a full section at a different
weight; a comparison table against the status quo; one full-bleed product demonstration instead of
three claims; a stacked case study; an asymmetric two-up where one item is deliberately larger.

### 9. No over-iconified bullet lists

A pastel circle with a tiny glyph in front of every line.

**Why:** the icons add noise without adding information, because a tick beside "fast" tells you
nothing that "fast" did not. It is decoration pretending to be structure.

**Instead:** a plain list with a hanging indent and no marker; a definition list where the term is
set in the display face and the description in body; a ruled list where a 1px rule divides items.

### 10. No decoration-by-dataviz

Charts, sparklines, gauges and progress rings with no real data behind them.

**Why:** every number on screen is a claim. A chart with invented values is a fabricated claim
rendered attractively, which is worse than no chart. Readers who look closely will find the axis is
unlabelled.

**Instead:** show real data even if the dataset is small and unflattering; show the empty state
honestly ("No runs yet"); or use a structural device that carries no numeric claim (a rule, a scale
marker, a timeline of real dated events).

### 11. No SVG or CSS stand-ins for real product imagery

Hand-drawn phone outlines, CSS device silhouettes, abstract "app" rectangles.

**Why:** a drawn product always looks like a diagram, not a product. This is the exact signature of
generic AI technology animation: every brand ends up looking the same because no brand actually shows
up.

**Instead:** the real screenshot or render, at 2x, sourced from the product page, press kit, app
store listing or a frame of the official launch video; or an explicit labelled placeholder (a grey
box reading `[PRODUCT HERO 2000×1500]`) which is honest and prompts the user to supply the asset.

### 12. No default font stacks

Banned as chosen display or body faces, and reported as an error: **Inter, Roboto, Arial,
system-ui, -apple-system, BlinkMacSystemFont, SF Pro, Fraunces, Poppins, Montserrat**.
Treated as defaults rather than decisions, and reported as a warning: **Playfair Display, Space
Grotesk, Instrument Serif, DM Serif Display, DM Serif Text, Lato, Open Sans, Nunito**.

Both lists are enforced, not advisory, and they live in `anti-slop.contract.md` under
`banned_fonts` (`literals` and `soft_literals`): `brandi check` and the artboard validator read
them from there, and `BANNED_FONTS` in `scripts/canvas.mjs` is a view of the same file. If you
disagree with an entry, change the contract; there is no second copy to keep in step.

**Why:** these are statistical outcomes, not choices. Inter and `system-ui` on a heading say "no type
decision was made". Fraunces says "natural brand". Poppins and Montserrat say "startup, 2018". A face
that appears on every second site cannot carry an identity.

**Instead**, all free and licensable:

| Reaching for | Use instead (free) | Use instead (licensed) |
|---|---|---|
| Inter, `system-ui` (UI sans) | Archivo, Public Sans, Hanken Grotesk, Figtree | Söhne, Untitled Sans, National 2 |
| Roboto, Arial (neutral sans) | Libre Franklin, Source Sans 3, Chivo | Graphik, GT America, Neue Haas Grotesk |
| Poppins, Montserrat (geometric) | Jost\*, Work Sans, Outfit | GT Walsheim, Sharp Grotesk |
| Fraunces (warm serif) | Literata, Petrona, Alegreya, Newsreader | Freight Text, Tiempos Text |
| Playfair Display (display serif) | Bodoni Moda, Libre Caslon Display, EB Garamond | Canela, Chronicle Display, Austin |
| Space Grotesk (technical display) | Recursive, Anybody, Bricolage Grotesque | PP Neue Montreal, Berkeley Mono |
| Any mono | JetBrains Mono, IBM Plex Mono, Martian Mono, Fragment Mono | Berkeley Mono, Söhne Mono |

Exception, stated once and applying to every rule in this section: if the real brand you are
documenting demonstrably uses Inter, document Inter. Observation wins over the ban list.

### 13. No 01 / 02 / 03 numbering where the content is not a sequence

**Why:** numbering asserts order. If the three items could be reordered without loss, the numbers are
decoration wearing the costume of structure, and a reader who tries to follow the sequence finds
there is none.

**Instead:** number it only when order carries information a reader needs (a real process, a dated
timeline, a ranked list); otherwise use a label that says what the thing is, or nothing at all. If
you want the visual weight of a big numeral, use a real quantity (a year, a count, a measurement).

### 14. No uppercase eyebrow label above every heading

`FEATURES` in 11px tracked caps sitting above each section title.

**Why:** when every section has one, it stops being a signpost and becomes a texture. It is also the
most copied section-header pattern in landing-page templates, so it reads as generated structure.

**Instead:** let the heading do its own work at a size that makes the hierarchy obvious; or use the
eyebrow slot for something real (a section number in a document that genuinely has numbered sections,
a date, a category the reader can filter by).

### 15. No "Welcome to our website" copy

Along with "Get started today", "Take your X to the next level", "Empowering Y to Z", "Seamlessly
integrate", "Unlock the power of", "in today's fast-paced world".

**Why:** these phrases are interchangeable across every brand in every category, which is the
definition of generic. They also consume the most valuable space on the page saying nothing.

**Instead:** state what the thing is and who it is for in the first sentence, in the user's own
words; or open with the most specific true fact you have (a real number, a real constraint, a real
name). Being specific always beats being clever.

### 16. No invented testimonials

No fabricated quotes, no fake names, no stock headshots attributed to invented job titles.

**Why:** it is a fabricated record about a real-sounding person. It is also instantly detectable,
because invented testimonials always praise the exact feature the section is selling.

**Instead:** use real quotes with real attribution; or leave a visibly bracketed placeholder,
`[TESTIMONIAL: name, role, company]`, which is honest and shows the user what to supply; or cut the
section and solve the emptiness with composition.

### 17. No invented statistics

No "10× faster", "99.9% uptime", "3× more productive", "trusted by 10,000+ teams", no percentages
without a source.

**Why:** these are factual claims. Fabricating one puts a false claim into a document the user may
publish, and the specific phrasings above are so common that they are grep-able tells.

**Instead:** use a real number with its source and date attached; or use a visibly bracketed
placeholder, `[YOUR UPTIME %]`; or make the claim qualitative and honest ("runs on the same hardware
you already have").

### 18. No hero built from a big number, a small label and a gradient accent

**Why:** it is the template answer for a hero, and it is the one composition a model produces when it
does not know what the subject is. It also usually depends on rule 17.

**Instead:** open with the most characteristic thing in the subject's world, in whatever form suits
it: a live demonstration, a real screenshot, a photograph of the object, a single sentence set very
large, an interactive moment. The hero is a thesis, so ask what the page is arguing before choosing
its form.

### 19. No symmetric everything

Centred headline, centred subhead, centred button, centred everything, repeated down the page.

**Why:** symmetry is the default when no compositional decision has been made. Worse, near-symmetry
(a layout that is almost balanced but slightly off) is the danger zone, reading as an accident rather
than a choice.

**Instead:** commit fully to one or the other. Either fully symmetric (as in craft heritage, where
centring is a real reference to label typography) or deliberately asymmetric with at least a 15%
offset, so the imbalance is unmistakably intentional. Alternate density down the page: one tight
section, one that breathes.

### 20. No drop shadows as the only depth cue

`box-shadow: 0 4px 12px rgba(0,0,0,0.1)` on every card, and nothing else creating hierarchy.

**Why:** a uniform shadow on everything flattens rather than separates, because if everything is
elevated, nothing is. It is also the default Material-era card that every generator produces.

**Instead:** depth by luminance stepping (each level of surface a measured step lighter or darker, as
Linear does on dark); depth by division (1px rules and borders, no elevation at all); depth by scale
and overlap (one element genuinely overlapping another); depth by inset rather than lift.

### 21. No lorem ipsum

Or "dolor sit amet", "placeholder text", "sample content", "Feature one / two / three".

**Why:** it defers the hardest design decision (what does this actually say) and hides layout problems
that only real copy reveals. Latin filler makes every measure look fine.

**Instead:** write the real copy, even roughly, because copy is design material; or use a visibly
bracketed placeholder that names what is needed, `[BODY: 40 words on how pricing works]`.

### 22. No default glassmorphism

Frosted translucent panel with a 1px white top border, floating over a gradient.

**Why:** it is a 2021 Apple-adjacent trend that became a generator default. It also depends on rule 1,
because a frosted panel needs a busy background to be visible, which is why the two always ship
together.

**Instead:** a solid surface with a real border; a panel defined by a luminance step from its ground;
or genuine transparency where it means something (an overlay over live content, not over a decoration).

### 23. No external placeholder image services

`unsplash.com`, `picsum.photos`, `placehold.co`, `placekitten.com`.

**Why:** they break when offline or blocked, they make the artefact dependent on a third party, and
the resulting stock imagery is the most anonymous material available. A page of Unsplash photographs
looks like every other page of Unsplash photographs.

**Instead:** a local placeholder element styled in the brand's own tokens with a label describing what
belongs there; or real supplied imagery. Placeholders beat fakes, always.

### 24. No default section skeleton

Hero, then features, then pricing, then FAQ, then CTA, with no variation.

**Why:** it is the AI template skeleton. The order carries no argument, it is just the order every
generator emits.

**Instead:** structure the page around what the reader actually needs to work out, in order. Introduce
at least one section that is not on the standard list: a comparison against the status quo instead of
a pricing table, a full-bleed single quote instead of a testimonial wall, an inline working
demonstration, an honest limitations section, a real changelog.

### 25. No single radius on everything

One `border-radius: 12px` applied uniformly to cards, buttons, inputs, images and modals.

**Why:** a uniform radius is the absence of a radius decision. Real systems either commit to sharp,
commit to pill, or use concentric radii where a nested element's radius is the parent's minus the
padding.

**Instead:** pick a stance and hold it (sharp: 0 to 2px everywhere; soft: 4 to 8 with concentric
nesting; pill: 999 on controls and 0 on surfaces); or trim the radius scale to the two values the
brand actually uses and delete the rest from the tokens.

### 26. No centred body text

Paragraphs longer than one line, centre-aligned.

**Why:** every line starts in a different place, so the eye loses the return point. It is a
readability defect, not a style, and it is the default when no alignment decision was made.

**Instead:** left-aligned (or right in RTL) with a measure capped at 45 to 75 characters; centre only
single-line elements such as a standfirst, a pull quote, or a wordmark.

### 27. No accent overuse

More than two visible uses of the accent colour per screen.

**Why:** an accent's job is to say "look here". Used six times, it says nothing, and the page loses
its focal point. `nexu_open-design` fires a lint warning above six uses of `var(--accent)` in the
body and recommends a cap of two.

**Instead:** cap at two visible uses per screenful (one eyebrow plus one CTA, or one accent panel plus
one active tab); carry the rest of the hierarchy with weight, scale and space; if you need more
colour, add a second neutral rather than a second accent.

### 28. No animation on everything

Scroll-triggered fade-and-rise on every section, stagger on every list.

**Why:** motion applied uniformly stops being emphasis and becomes latency. Scattered effects also
read as generated, because a designer chooses one moment rather than animating the whole page.

**Instead:** one orchestrated moment (a page-load sequence, or one reveal that matters) with
everything else static; or motion only where it is functional (state change, value update, position
feedback). Honour `prefers-reduced-motion: reduce`, and make sure the reduced state is good on its
own.

### 29. No stock icon set at its defaults

Lucide or Heroicons dropped in at default stroke, default size, default corner treatment.

**Why:** an unadjusted icon set is the same set on thousands of other sites, and its stroke weight
will not match the brand's type, which is visible even to people who cannot name why.

**Instead:** pick the kit whose stroke weight and form language actually match the type (score it on
stroke, corner treatment, fill style, form language and density rather than defaulting to the
familiar one), then adjust stroke and size to sit correctly against the body face; or draw six icons
properly and use no others.

### 30. No dark mode as a pure inversion

`#ffffff` becoming `#000000`, `#000000` becoming `#ffffff`.

**Why:** pure black causes halation against near-white text and destroys the ability to show
elevation, because there is nothing below black. It is what you get when dark mode was generated
rather than designed.

**Instead:** a near-black with a slight temperature cast matching the brand (`#08090a` cool,
`#0A0907` warm) and a text colour just off white (`#f7f8f8`) to prevent eye strain; build elevation by
stepping the background luminance upward rather than by adding shadow; keep the accent identical in
both modes so only surface and text tokens swap.

### 31. No invented customer logo wall

A "Trusted by" row of made-up or unlicensed company marks.

**Why:** it is a fabricated endorsement, and using a real company's mark without permission is a
trademark problem on top of an honesty problem.

**Instead:** real logos you have permission to use; or a bracketed placeholder row,
`[LOGO WALL: 5 customer marks, SVG, monochrome]`; or replace the section with something you can
substantiate (a named case study, a public repository, a real integration list).

### 32. No AI-generated photographs of people presented as real

**Why:** it puts a synthetic person into a document that implies a real one, which is the same
category of problem as an invented testimonial. Hands, teeth and ears also give it away at full size.

**Instead:** real photographs of real, credited people; illustration that is obviously illustration;
or object and detail photography with no people in it at all, which is often stronger anyway.

---

## Content slop

Visual slop is easier to spot. Content slop is what actually makes an artefact worthless, because it
puts untrue things into a document the user may publish.

**No filler sections.** Every element earns its place. Do not pad with "Our values", "Why choose us",
a team section, or a feature grid the user did not ask for. If a section feels empty, that is a design
problem, so solve it with composition: bigger type, a full-bleed image, real negative space, a larger
hero. Never solve it with invented content.

**No invented facts.** Statistics, uptime figures, customer counts, funding amounts, release dates,
version numbers, awards, certifications and quotes are all factual claims. If you do not have the
fact, you do not have the fact. Before designing anything about a real product, verify its current
state rather than working from memory, and write what you verify to disk so the next session does not
re-derive it.

**Placeholders beat fakes.** A visibly bracketed placeholder is honest, it shows the user exactly what
to supply, and it cannot be published by accident. Use the bracketed uppercase form so it is
impossible to miss and trivial to grep:

```
[YOUR PRICE]              [CUSTOMER NAME, ROLE]        [PRODUCT HERO 2000×1500]
[UPTIME %: SOURCE, DATE] [BODY: 40 words on X]       [LOGO WALL: 5 marks, SVG]
```

Never a plausible-looking fake. `$49/month` in a draft becomes `$49/month` in production.

**One thousand no's for every yes.** When a page feels weak, the instinct is to add. The correct move
is almost always to delete, then make what remains bigger. A page with three things at full commitment
beats a page with nine things hedged.

**Use the user's own words.** If they described their product in a sentence, that sentence is better
than anything you would write for them, because it is true and it is theirs. Do not translate an
understated technical product into marketing language it would never use.

---

## Copy as design material

Words appear in a design for one reason: to make it easier to understand, and therefore easier to use.
They are design material, not decoration. Bring the same intent to copy that you bring to spacing and
colour. (This section follows Anthropic's `frontend-design` skill closely, because it is the sharpest
statement of it anywhere in the benchmark set.)

**Write from the user's side of the screen.** Name things by what people control and recognise, never
by how the system is built. A person manages notifications, not webhook configuration. Describe what
something does in plain terms rather than selling it.

**Specific beats clever.** "Runs on your own hardware" beats "Infrastructure, reimagined". A joke that
costs the reader a beat of comprehension is not worth it.

**Active voice by default.** A control says exactly what happens when it is used: "Save changes", not
"Submit".

**An action keeps its name through the whole flow.** The button that says "Publish" produces a toast
that says "Published", and the history entry says "Published". The vocabulary of an interface is the
signposting, so consistency is how people learn their way around.

**Errors never apologise and are never vague.** Say what happened and how to fix it, in the
interface's voice rather than a person's. "We're sorry, something went wrong" tells the reader
nothing. "Couldn't save: the file is open in another program. Close it and try again" tells them
everything.

**Empty states are invitations.** An empty screen is the best opportunity in the product to show
someone the first useful action. It is not a place for an apology or a shrug illustration.

**One element, one job.** A label labels. An example demonstrates. Nothing quietly does double duty.

---

## The two-pass process

Do not start with code. Do not start with a layout. Start with a plan small enough to criticise.

### Pass 1: the plan

Write four things, and nothing else:

- **Colour:** 4 to 6 named hex values. Named means named after their source ("basalt", "signal",
  "bone"), not "primary-500". State which one is the accent and where it is allowed to appear.
- **Type:** 2 to 3 roles. A characterful display face used with restraint, a complementary body face,
  and a utility face for captions or data if the content needs one. Name the actual faces, and check
  them against rule 12.
- **Layout:** a concept in one or two sentences, plus an ASCII wireframe. Not a component list.
- **Signature:** the single element this page will be remembered by. One. If you cannot name it, you
  do not have a design yet, you have a template with your colours in it.

### Pass 2: the adversarial check

Before writing any code, interrogate the plan:

> **Would I produce this same plan for a different brief in this category?**

Test it properly. Take an adjacent brief in the same category (a different company, a different
product, same industry) and work through what plan you would produce for it. If you arrive somewhere
similar, the plan is a category default, not a design.

Then revise the parts that failed, and **state what you changed and why**, in one line each. That
statement is the deliverable, not a formality, because it is the evidence that a second pass actually
happened:

```
Changed: accent from #C2410C (terracotta) to #2F4F3A (verdigris, from the client's
         patinated-copper signage). Terracotta on cream is AI-default look 1 and I
         arrived at it by gravity, not from the brief.
Changed: hero from stat-block to a full-bleed photograph of the workshop. The stat
         block needed numbers I do not have and would have had to invent.
Kept:    Recursive Mono for values. Justified: every figure on this page is a
         measurement and tabular alignment is load-bearing.
```

Only after the plan survives this should you write code, and then you follow the revised plan exactly,
deriving every colour and type decision from it.

### Spend your boldness in one place

Let the signature element be the one memorable thing, and keep everything around it quiet and
disciplined. Cut any decoration that does not serve the brief. Not taking a risk is itself a risk, but
taking five risks is just noise. Before you ship, apply Chanel's rule: look in the mirror and remove
one accessory.

Aim for roughly 80% proven patterns and 20% distinctive choice. The 20% should live in one bold visual
move, the voice and microcopy, one micro-interaction, and one detail that could only have been put
there by someone who actually used the product.

---

## The gut check

Three questions, asked out loud, before anything is called finished:

1. **Does this look like it came from a real, specific designer, or like it could have come from any
   AI?**
2. **Is there a clear point of view, or did I hedge every decision?**
3. **Is there one thing here a user would remember?**

If the answer to any of them is "generic", rebalance toward specificity: pick the bolder colour,
commit to the heavier weight, make the hero bigger, delete the decorative second section. A
distinctive imperfect artefact beats a safe forgettable one.

The screenshot test is the version of this you can run on someone else: if a person outside the
project can identify which product a screenshot came from, the work has an identity. If they cannot,
you shipped a template.

---

## Machine-checkable rules

The enforced list lives in `anti-slop.contract.md` beside this file: a YAML contract that
`scripts/slop.mjs` reads and `brandi check`, the artboard validator and every companion skill
apply. Every pattern there corresponds to a numbered rule above. `p0` is an error, `p1` a warning,
`p2` and `watch` a note. Change the contract, not a copy of it.
