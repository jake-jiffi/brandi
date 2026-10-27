# TextArea on the web

The text area takes multi-line text for notes and messages, built on the HTML `textarea` element.

```yaml
component: TextArea
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | HTML `textarea`, a related concept of the `textbox` role, multi-line through `aria-multiline` semantics [WEB-8]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. It starts at 96 CSS px tall and grows vertically. |
| Colour and theme | Text 4.5:1 (1.4.3) and a 3:1 border on every surface (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Default, hover, focus, invalid, read-only and disabled, as TextInput, through `:focus-visible`, `:user-invalid` and `:read-only` [WEB-10]. `aria-invalid` and `aria-readonly` expose them [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Role `textbox`, multi-line, named by its label, which says what the text is for (3.3.2) [WEB-1]. A character count, shown only under a hard limit, is tied by `aria-describedby` [WEB-8]. It is a status message when it warns, never a voice on every keystroke (4.1.3) [WEB-1]. |
| Navigation placement | Inside a Field, in a form [WEB-7]. |
| Keyboard, pointer, trackpad | Enter inserts a line break in a multi-line field, as ARIA's `textbox` note records [WEB-8]. Tab still leaves it, so it is never a keyboard trap (2.1.2) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Starting height, vertical resizing, the count's look and the label's wording, inside the contrast floors [WEB-1]. |
| Platform owns | Line breaks on Enter, editing and the caret [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the resize handle and whether it works from the keyboard, since the HTML standard and CSS Basic User Interface are not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
