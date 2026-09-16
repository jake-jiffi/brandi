# Anti-slop linter contract

The machine-readable half of `04-anti-slop.md`. `scripts/slop.mjs` reads the fenced YAML block
below and nothing else in this file; `brandi check`, the artboard validator, `brandi system` and
every emitted companion skill enforce it. Every rule corresponds to a numbered rule in 04, which
says why. Change a rule here and the enforcement changes with it; there is no second list in code.

Severity: `p0` is reported as an error, `p1` as a warning, `p2`, `watch` and `info` as
information. `watch` entries are not failures: they require a recorded justification in the
artefact. A rule may carry `unless`, a second pattern whose presence anywhere in the file stands
the rule down. That is how a removed outline is a fault only when nothing replaced it.

Keep the structure stable and add rules rather than reshaping keys. `slop.mjs` refuses to start
if a required group is missing or a regex does not compile, so a broken edit fails loudly rather
than becoming a rule that silently stops firing.

```yaml
# brandi anti-slop lint contract
version: 1
case_sensitive: false      # global default; a rule may override it with its own case_sensitive key
notes: >
  Strip HTML comments and <script> bodies before matching so documentation
  examples do not self-trigger. Observed brand facts override every ban:
  a finding may be waived by an adjacent justification comment matching
  waiver_pattern.
waiver_pattern: 'anti-slop-waiver:\s*\S+'

banned_fonts:
  severity: p0
  applies_to: [css_font_family, google_fonts_url, font_face_src]
  literals:
    - Inter
    - Roboto
    - Arial
    - system-ui
    - -apple-system
    - BlinkMacSystemFont
    - SF Pro
    - Fraunces
    - Poppins
    - Montserrat
  soft_literals:            # severity p1, defaults rather than bans
    - Playfair Display
    - Space Grotesk
    - Instrument Serif
    - DM Serif Display
    - DM Serif Text
    - Lato
    - Open Sans
    - Nunito
  display_selector_regex: '(?:h1|h2|h3|\.h-?(?:hero|xl|lg|md)|\.display)[^{}]*\{[^}]*font-family\s*:\s*["'']?(?:Inter|Roboto|Arial|-apple-system|system-ui|SF\s+Pro|Poppins|Montserrat|Fraunces)'

banned_hex:
  ai_default_indigo:        # rule 2
    severity: p0
    values: ['#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#8b5cf6', '#7c3aed', '#a855f7']
  purple_violet_family:     # rule 1 and 2, gradient stops
    severity: p1
    values: ['#a855f7', '#9333ea', '#7c3aed', '#6d28d9', '#581c87',
             '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe',
             '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81',
             '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff']
  trust_gradient_blue:      # rule 3, fires only when paired with cyan
    severity: p0
    values: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
             '#60a5fa', '#93c5fd', '#bfdbfe',
             '#0ea5e9', '#0284c7', '#0369a1', '#38bdf8', '#7dd3fc']
  trust_gradient_cyan:
    severity: p0
    values: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
             '#22d3ee', '#67e8f9', '#a5f3fc']
  ai_default_grounds:       # the cream and near-black defaults
    severity: watch
    values: ['#f4f1ea', '#faf9f5', '#f3ead3', '#fdfcf8', '#0a0a0a', '#000000']
  ai_default_accents:       # terracotta and acid families
    severity: watch
    values: ['#d97757', '#b85a3a', '#c2410c', '#e2725b', '#ccff00', '#a3e635', '#00ff66']
  cream_terracotta_pair:    # rule: the Claude-and-slop collision
    severity: watch
    rule: >
      Fires when any ai_default_grounds cream value is used as a page background
      in the same file as any ai_default_accents warm value. Requires a recorded
      justification, not a fix.

css_patterns:
  left_accent_card:         # rule 7
    severity: p0
    rule: >
      A rounded card with a left accent stripe, which is the most-generated
      component on the internet. Declaration order in CSS is arbitrary, so both
      orders are matched; requiring border-left first missed half of them.
    regex: '\{[^}]*border-left\s*:\s*[2-9]\d*px\s+solid\s+[^;}]+;[^}]*border-radius\s*:\s*[1-9]|\{[^}]*border-radius\s*:\s*[1-9][^}]*border-left\s*:\s*[2-9]\d*px\s+solid'
  multi_hue_gradient:       # rule 1
    severity: p1
    regex: '(?:linear|radial|conic)-gradient\([^)]*#[0-9a-f]{6}[^)]*#[0-9a-f]{6}[^)]*#[0-9a-f]{6}'
  gradient_of_banned_hue:   # rule 1 and 2, the two-stop form
    severity: p1
    regex: '(?:linear|radial|conic)-gradient\([^)]*(?:#6366f1|#4f46e5|#4338ca|#3730a3|#8b5cf6|#7c3aed|#a855f7|#9333ea|#6d28d9|#818cf8|#a78bfa)'
    rule: >
      A purple or indigo gradient, which is the most recognisable machine-made
      design tell there is. The three-stop rule above misses the two-stop form,
      and two stops is how it is usually written.
  gradient_keyword:         # rule 1
    severity: p1
    regex: '(?:linear|radial|conic)-gradient\([^)]*\b(?:purple|violet|indigo|fuchsia|magenta)\b'
  gradient_text:            # rule 5
    severity: p1
    regex: '-webkit-background-clip\s*:\s*text|background-clip\s*:\s*text'
  glassmorphism:            # rule 22
    severity: p1
    regex: 'backdrop-filter\s*:\s*blur\([^)]*\)'
  blur_orb:                 # rule 4
    severity: p1
    regex: 'filter\s*:\s*blur\(\s*(?:[5-9]\d|\d{3,})px'
  uniform_shadow:           # rule 20
    severity: p2
    rule: 'More than 4 distinct selectors declaring box-shadow with no other elevation cue present.'
  centred_body:             # rule 26
    severity: p1
    regex: '(?:(?<![\w.-])p(?![\w-])|\barticle\b|\.prose|\.body-copy|\.copy)[^{}]*\{[^}]*text-align\s*:\s*center'
  pure_black_dark_mode:     # rule 30
    severity: p1
    regex: '\[data-theme=["'']?dark["'']?\][^{}]*\{[^}]*(?:background|--bg)\s*:\s*(?:#000000|#000|black)\b'
  focus_outline_removed:    # accessibility floor, not taste
    severity: p0
    regex: 'outline\s*:\s*(?:none|0)\s*(?:!important\s*)?[;}]'
    unless: ':focus-visible[^{}]*\{[^}]*(?:outline\s*:(?!\s*(?:none|0)\s*(?:!important\s*)?[;}])[^;}]+|box-shadow\s*:(?!\s*none\s*(?:!important\s*)?[;}])[^;}]+)'
    rule: >
      A removed focus outline with no replacement fails WCAG 2.2 2.4.7. `unless`
      stands the rule down only when a :focus-visible block in the same file
      actually draws a replacement, an outline or a box-shadow that is not
      none. Merely mentioning :focus-visible is not a replacement, and
      `button:focus-visible { outline: 0 }` is the fault itself, with or
      without an `!important` after the zero.
  animation_without_reduced_motion:
    severity: p2
    regex: '@keyframes'
    unless: 'prefers-reduced-motion'
    rule: >
      Anything that animates has to say what it does when motion is unwelcome.
      2.3.3 is Level AAA, so this is a house rule, and it is one worth keeping.

thresholds:
  raw_hex_outside_root:     # tokens were not honoured
    severity: p1
    max: 12
    scope: 'hex literals inside <style> but outside the :root { } block'
  accent_uses_in_body:      # rule 27
    severity: p1
    max: 6
    recommended: 2
    scope: 'occurrences of var(--accent) in the HTML body with <style> stripped'
  distinct_radii:           # rule 25
    severity: p2
    max: 3
    scope: 'distinct non-zero border-radius values declared in the file'
  uppercase_no_tracking:
    severity: p1
    rule: 'text-transform: uppercase declared without letter-spacing >= 0.06em'

banned_copy:
  filler:                   # rule 21
    severity: p0
    regex:
      - '\blorem\s+ipsum\b'
      - '\bdolor\s+sit\s+amet\b'
      - '\bplaceholder\s+text\b'
      - '\bsample\s+content\b'
      - '\bfeature\s+(?:one|two|three|1|2|3)\b'
      - '\byour\s+(?:headline|tagline)\s+here\b'
      - '\bcompany\s+name\b'
  invented_metric:          # rule 17
    severity: p0
    regex:
      - '\b(?:10|100)\s*[×x]\s+(?:faster|better|easier|cheaper)\b'
      - '\b3\s*[×x]\s+more\s+(?:productive|efficient)\b'
      - '\b99\.\d+%\s+uptime\b'
      - '\bzero[- ]downtime\b'
      - '\btrusted\s+by\s+[\d,]+\+?\s+(?:teams|companies|customers|users)\b'
      - '\b\d[\d,.]*\+?\s+(?:happy\s+customers|satisfied\s+clients)\b'
  generic_marketing:        # rule 15
    severity: p1
    regex:
      - '\bwelcome\s+to\s+(?:our|the)\s+(?:website|site|page)\b'
      - '\btake\s+your\s+\w+\s+to\s+the\s+next\s+level\b'
      - '\bunlock\s+the\s+(?:power|potential)\s+of\b'
      - '\bseamlessly\s+integrat'
      - '\bempowering\s+\w+\s+to\b'
      - '\bin\s+today.s\s+fast[- ]paced\s+world\b'
      - '\bcutting[- ]edge\s+(?:solutions?|technology)\b'
      - '\bone[- ]stop\s+shop\b'
      - '\brevolutioni[sz]e\s+the\s+way\b'
      - '\bgame[- ]chang(?:er|ing)\b'
  ai_punctuation:           # the tell in the punctuation, not the words
    severity: p1
    rule: >
      An em or en dash used as a sentence break. Generated prose reaches for it
      far more than written prose does, and once you have seen it you cannot
      stop seeing it. Written as escapes so this document does not trip its own
      rule. A comma, a full stop or a pair of brackets says the same thing.
      Letters both sides, because a numeric range is what an en dash is for.
    regex:
      - '[A-Za-z]\s*[\u2014\u2013]\s*[A-Za-z]'
  apologetic_error:         # copy section
    severity: p2
    regex:
      - '\b(?:oops|whoops)\b'
      - '\bwe.re\s+sorry\b'
      - '\bsomething\s+went\s+wrong\b'

banned_emoji:               # rule 6
  severity: p0
  scope: 'inside <h1>-<h6>, <button>, <li>, or any element with class matching icon'
  values: ['✨', '🚀', '🎯', '⚡', '🔥', '💡', '📈', '🎨', '🛡️', '🌟',
           '💪', '🎉', '👋', '🙌', '✅', '⭐', '🏆', '🔒', '💎', '🧠']

banned_hosts:               # rule 23
  severity: p1
  values: ['unsplash.com', 'source.unsplash.com', 'picsum.photos',
           'placehold.co', 'placeholder.com', 'placekitten.com',
           'loremflickr.com', 'dummyimage.com']

structural:
  three_column_feature_grid:   # rule 8
    severity: p1
    rule: 'A grid of exactly 3 equal children each containing an icon element plus a heading plus a paragraph.'
  sequence_numbering:          # rule 13
    severity: watch
    regex: '>\s*0?1\s*<[\s\S]{0,4000}?>\s*0?2\s*<[\s\S]{0,4000}?>\s*0?3\s*<'
    rule: >
      Numbers 01/02/03 in sequence. A watch rather than a fault, because the
      rule cannot tell a claimed sequence from a real one and plenty of content
      is genuinely ordered. The failing form is this correlated with a
      three-column equal grid, which the canvas validator checks directly.
  default_skeleton:            # rule 24
    severity: p2
    rule: 'Section headings matching hero, features, pricing, faq, cta in that order with no other section type present.'
  eyebrow_on_every_section:    # rule 14
    severity: p2
    rule: 'More than 2 elements with text-transform uppercase, font-size <= 12px, immediately preceding an h2.'

placeholder_form:
  severity: info
  case_sensitive: true      # overrides the global; the uppercase form is the whole signal
  rule: >
    Matches a conforming placeholder. Two uses. First, a banned_copy or
    invented_metric finding is waived when the offending value is itself a
    conforming placeholder. Second, a page with no real content and no
    conforming placeholder is a page carrying plausible fakes, so report the
    ratio of conforming placeholders to bracketed strings that are not
    conforming and flag files where it is below 1.
  regex: '\[[A-Z][A-Z0-9 %×:/,.-]{2,}\]'
  examples: ['[YOUR PRICE]', '[CUSTOMER NAME, ROLE]', '[PRODUCT HERO 2000×1500]', '[UPTIME %: SOURCE, DATE]']
```
