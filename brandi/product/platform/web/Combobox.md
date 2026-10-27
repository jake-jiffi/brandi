# Combobox on the web

The combobox picks one option from a long or searchable list, including options fetched as the person types, built as an editable ARIA combobox over a listbox.

```yaml
component: Combobox
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
| Native control | An editable `combobox` controlling a `listbox` popup [WEB-8]. HTML `select` is its related concept, but the product needs typing and filtering [WEB-8]. The APG patterns index lists a Combobox pattern [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. Each option clears 24 CSS px too. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text and placeholder 4.5:1 (1.4.3), a 3:1 border, and the active option marked by a visible edge as well as a tint (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Collapsed, expanded, filtering, loading, no matches, chosen, invalid and disabled. `aria-expanded` gives the open state [WEB-8]. While options load, the listbox carries `aria-busy="true"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `combobox` with `aria-expanded`, `aria-controls`, and an `aria-autocomplete` value that matches its behaviour, `list` for a filtered popup [WEB-8]. `aria-activedescendant` points at the active option while focus stays in the input [WEB-8]. "No matches" is a status message (4.1.3) [WEB-1]. The listbox is named like the field. |
| Navigation placement | In a Field. The list opens in a portal and flips up when there is no room below, tied to the input by `aria-controls` [WEB-8]. Past about 15 options it replaces Select. |
| Keyboard, pointer, trackpad | ARIA asks for keys that move between the input and the popup, with Down Arrow as its example [WEB-8]. The product follows Select: Up, Down, Home and End move, Enter chooses, and Escape and Tab close. What was typed is kept when nothing matches. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | List styles, the no-match line and the point where it replaces Select, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Reporting the active option as focused while DOM focus stays in the input [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Combobox key map, including Home and End in the input, since that page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
