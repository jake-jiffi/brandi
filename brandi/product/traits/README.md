# Trait fixtures

The kit loop ran against one neutral fixture brand for most of its life, and nearly every defect the
pilot brands found came from a trait that brand lacks: a condensed display face, a black rail, times
written "9.30am". Each file here is the kit's fixture brand (`tests/fixtures/muddy-paws.json`) with
one trait laid over it, or a deliberate pair, so a trait that fails differs from the baseline by
that trait alone.

`node brandi/product/tools/traits.mjs` writes each trait's product tokens and runs the kit loop on
them with the components the lessons name, then prints a table: one row a trait. Run it before every
review round (`skills/product-system/references/09-operate.md`, After every round).

| Trait | What it carries | Lessons | Proven to fail |
|---|---|---|---|
| `baseline` | The fixture as it is, nothing decided: what the kit loop has always run on | none | none |
| `black-rail` | A pure black rail in both themes: rail text, focus, the current item, the rail's edge and anything drawn on the rail | L7, L8, L10, L11, L12, L13, L60 | L10, L11, L13 |
| `charts-avoid` | The fixture's orange accent kept off dark grounds (`charts.avoid`): chart series and the tints a name's hash hands out | L17, L18 | not yet |
| `condensed-caps` | A condensed display face set only in capitals (`displayCase: "upper"`): fallbacks, long titles, the detector's all-caps rule | L3, L4, L5 | not yet |
| `navy-primary` | A dark navy primary decided for light: which way hover, pressed and selected move | L9 | not yet |
| `own-name` | A product with its own name, an ampersand in it: checks and lockups that assumed the kit's names | L20 | not yet |
| `pale-primary` | A pale brand colour with a pale yellow accent: fills on light tracks, the highlight beside a warning tint | L14, L15 | L14 |
| `same-name` | A product named for the brand, in another case: a lockup or email that shows the name twice | L19 | not yet |
| `time-dot` | Times written "9.30am" (`time`: minutes after a point, no space, on the hour dropped): every time a check expects | L1, L2 | L1 |

In the kit loop the brand is the kit's placeholder (`lib/brand.ts`), named "Product", so `same-name`
names its product "PRODUCT" and `own-name` names it something else. A trait can change the brand's
colours, faces and product.json, never its name, marks or character, so the lessons those exposed
name no trait.

## A trait file

```json
{
  "trait": "One sentence: what this brand does that the fixture does not.",
  "input": { "type": { "display": "Barlow Condensed" } },
  "product": { "displayCase": "upper" }
}
```

- `input` is laid over the fixture's system input (its colours, faces, shape and motion), `type`
  key by key. Leave it out when the trait lives in product.json alone.
- `product` is the trait's `product.json`, as `$A product tokens` and the starter read it: roles,
  `displayCase`, `time`, `charts`, `productName`. try.mjs writes its name, time style, rail tone
  and barred tags into the scratch starter, as `$A product starter` would.
- `proven`, once a run on an unfixed kit has shown the trait failing where the baseline passes:
  `{ "lessons": [...], "how": "..." }`. A trait without one has not yet been shown to catch anything.
- Values are made up and neutral. No client's name, colours or copy, and Google Fonts faces only,
  so the previews load them.

## Adding one

1. A brand trait broke the kit, and the fixture cannot show it. Write `<trait>.json` here, the
   smallest change that shows it: one trait, or a pair when the defect needs both.
2. Run `traits.mjs --only <trait>` on the kit as it was before the fix, in a scratch copy, beside
   the baseline. The trait should fail and the baseline pass: a trait that passes on the unfixed
   kit guards nothing. Record what it proved as the file's `proven`: the lessons, and how the kit
   was unfixed.
3. Fix the kit, give the fix a check, and add the lesson to `product/lessons.json` naming this
   trait. Run the trait again: it passes.
4. Add a row to the table above with the lessons that name the trait.
   `tests/productlessons.test.mjs` holds the table to lessons.json.
