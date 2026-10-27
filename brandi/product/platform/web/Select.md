# Select on the web

The select picks one option from a short list, built as a select-only combobox over a listbox.

```yaml
component: Select
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
| Native control | HTML `select` is the related concept of both `combobox` and `listbox` [WEB-8]. The product builds a select-only combobox: a `combobox` that shows its value and controls a `listbox` popup [WEB-8]. The APG patterns index lists Combobox and Listbox patterns [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. Each option in the list clears 24 CSS px too. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1 (1.4.3) and a 3:1 border (1.4.11) [WEB-1]. The option in hand has a visible edge and a 2px ring from the keyboard, since a faint tint alone fails 1.4.11 [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Closed, open, the option in hand, chosen, invalid and disabled. `aria-expanded` is true while open [WEB-8]. The option in hand is the combobox's `aria-activedescendant` while focus stays on it, and the chosen option has `aria-selected="true"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `combobox`, with the required `aria-expanded` and `aria-controls` pointing at the listbox. Its `aria-haspopup` is `listbox` by default [WEB-8]. Name from the Field label, or `aria-label` or `aria-labelledby` outside a Field [WEB-8]. Its value is its shown text. The listbox is named like the field, with `option` children [WEB-8]. |
| Navigation placement | In a Field. The list opens in a portal above everything and flips up when there is no room below. `aria-controls` still ties it to its combobox [WEB-8]. |
| Keyboard, pointer, trackpad | ARIA requires the listbox to manage focus, and asks for keys that move between the combobox and its popup, such as Down Arrow [WEB-8]. The product's map: Up, Down, Home, End and a typed letter move, Enter or Space chooses, and Escape and Tab close. The active option scrolls into view. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Field and list styles, the option-in-hand edge and ring, and the placeholder ("Choose a [category]"), inside the floors [WEB-1]. The product builds its own combobox in place of HTML `select` [WEB-8]. Only standard HTML controls meet 4.1.2 by default, so this one carries every role, state and key itself [WEB-1]. |
| Platform owns | Reporting the active option as focused while DOM focus stays on the combobox [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Combobox and Listbox key maps, since those pages are not in the registry. Native control: how HTML `select` renders and which keys it takes, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
