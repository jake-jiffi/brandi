# SegmentedControl on the web

The segmented control switches between two to five views of the same content, and on the web it is a radio group, since there is no native segmented control.

```yaml
component: SegmentedControl
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
  - key: WEB-8
    url: https://www.w3.org/TR/wai-aria-1.2/
    marker: Recommendation 2023-06-06, 1.3 Working Draft 2026-06-04
    read: 2026-10-27
  - key: WEB-9
    url: https://www.w3.org/TR/mediaqueries-5/
    marker: Working Draft 2026-02-19
    read: 2026-10-27
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No native segmented control. The closest is a radio group: HTML `input[type="radio"]` elements, the related concept of the `radio` role, or role `radiogroup` owning `radio` [WEB-8]. The APG patterns index lists a Radio Group pattern [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. The product sets 40 CSS px options on touch. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The selected option shows by more than colour (1.4.1), with its indicator 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Unchecked, checked, hover, focus and disabled, through `:checked`, `:focus-visible` and `:disabled` [WEB-10]. The chosen option carries `aria-checked="true"` [WEB-8]. |
| Motion | The selection slides to the chosen option. Under `prefers-reduced-motion` it fades instead [WEB-9]. |
| Accessibility API | Role `radiogroup`, named by `label`, which ARIA requires, owning `radio` options with `aria-checked` [WEB-8]. Options have presentational children, so an icon inside adds only its text [WEB-8]. |
| Navigation placement | Beside or above the view it switches, often at the Toolbar's trailing end. It changes content, not context, so changing it at once is allowed (3.2.2) [WEB-1]. |
| Keyboard, pointer, trackpad | ARIA requires a radiogroup to manage focus: Tab enters it once and the arrows move within it [WEB-8]. The product's map: Tab enters at the selected option, and the arrows, Home and End move the selection and the focus together. The full APG key map: not confirmed. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The pill, the sliding indicator and the sizes, inside the target and 3:1 floors [WEB-1]. Options are 40 CSS px on touch, an accepted choice above 2.5.8 (AA) and below the 44 that 2.5.5 (AAA) sets [WEB-1]. Home and End are the product's addition to the radio keys. Not for moving between pages (Tabs) or for settings (RadioGroup). |
| Platform owns | Role mapping and the checked state's exposure [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Radio Group key map, including whether Home and End belong and whether arrows wrap, since that page and the HTML standard are not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
