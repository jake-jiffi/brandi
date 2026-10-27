# FormRow on the web

The form row sets two or three short fields side by side, dropping to one column, and the web has no element for it.

```yaml
component: FormRow
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
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
| Native control | None. A layout wrapper with the `generic` role, which takes no name [WEB-8]. Fields that answer one question can share a named `group` [WEB-8]. |
| Target and spacing | None of its own. The fields inside meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | None of its own. Each field keeps its floors (1.4.3, 1.4.11) [WEB-1]. |
| States | None of its own. Each field carries its own states [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | No role of its own [WEB-8]. Each field keeps its own label (3.3.2), and the DOM order matches the visual order when it drops to one column (1.3.2) [WEB-1]. |
| Navigation placement | Inside a FormSection, for fields that belong together, such as suburb, state and postcode [WEB-7]. |
| Keyboard, pointer, trackpad | Tab runs across the row, then down, in DOM order (2.4.3) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Two or three columns and the 180 CSS px threshold a field, inside the reflow floor (1.4.10) [WEB-1]. |
| Platform owns | The fields' native semantics [WEB-8]. |
| Not confirmed | Brand may change: container queries, since no CSS specification that defines them is in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
