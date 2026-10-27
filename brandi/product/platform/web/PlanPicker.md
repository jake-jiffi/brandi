# PlanPicker on the web

The plan picker chooses one plan from two to five, shown as cards that say what each includes, built as a radio group.

```yaml
component: PlanPicker
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-2
    url: https://www.w3.org/WAI/ARIA/apg/
    marker: APG 1.2, undated
    read: 2026-10-27
  - key: WEB-7
    url: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
    marker: undated
    read: 2026-10-27
  - key: WEB-8
    url: https://www.w3.org/TR/wai-aria-1.2/
    marker: Recommendation 2023-06-06, 1.3 Working Draft 2026-06-04
    read: 2026-10-27
  - key: WEB-9
    url: https://www.w3.org/TR/mediaqueries-5/
    marker: Working Draft 2026-02-19
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A radio group: an HTML `input[type="radio"]` for each card, the related concept of `radio`, or role `radiogroup` owning `radio` cards [WEB-8]. The APG patterns index lists a Radio Group pattern [WEB-2]. |
| Target and spacing | Each card is its radio's target, well over 24 × 24 CSS px (2.5.8) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Prices use the `currency` style. |
| Colour and theme | The chosen card shows by more than colour (1.4.1), with its edge at 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Unchosen, chosen, focus and disabled, with `aria-checked` on each radio [WEB-8]. The safest plan starts chosen. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Each card is a `radio`, named by the plan's name through `aria-labelledby` and described by what it includes through `aria-describedby` [WEB-8]. A radio's children are presentational, so only the card's text reaches assistive tech, not its parts [WEB-8]. |
| Navigation placement | On plan and checkout screens, in a named `form` [WEB-7]. |
| Keyboard, pointer, trackpad | ARIA requires a radiogroup to manage focus: one Tab stop, with the arrows inside [WEB-8]. A paid plan is a financial commitment, so the step it starts is reversible, checked or confirmed (3.3.4) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Card layout, what each card lists and the preselected safest plan, inside the floors [WEB-1]. Five plans at most, and more is a Select. Not yet proven: no review round has checked it. |
| Platform owns | Role mapping and the checked state's exposure [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the radio key map, since neither the APG Radio Group page nor the HTML standard is in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
