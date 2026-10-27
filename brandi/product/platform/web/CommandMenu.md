# CommandMenu on the web

The command menu is the palette for jumping to any record, running an action or asking the assistant, built as a combobox over a grouped listbox, in a dialog when modal.

```yaml
component: CommandMenu
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
  - key: WEB-6
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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
| Native control | None. A `combobox` input controlling a `listbox` of grouped `option`s [WEB-8]. The APG patterns index lists Combobox and Listbox patterns [WEB-2]. `modal` puts it in a `dialog` built to the modal pattern [WEB-6]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. Each result clears 24 CSS px too. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The active result has a visible edge as well as a tint (1.4.11) [WEB-1]. Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Closed or open, empty query, results, and no matches. With no matches it offers Ask only when `onAsk` is passed. `aria-expanded` is true while results show [WEB-8]. Every opening starts empty. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | The input is a `combobox` with `aria-controls`, `aria-expanded`, `aria-autocomplete="list"`, and `aria-activedescendant` on the active result [WEB-8]. The results are a `listbox` with `group`s named Jump to, Actions and Ask [WEB-8]. The result count is a polite status (4.1.3) [WEB-1]. Modal, it is a named `dialog` [WEB-6]. |
| Navigation placement | Near the top of the page, over everything, as a modal dialog when `modal` is set [WEB-6]. Groups run Jump to, Actions, then Ask. |
| Keyboard, pointer, trackpad | Cmd or Ctrl K opens and closes it from anywhere, even while typing. A shortcut with a modifier is outside 2.1.4 [WEB-1]. Up, Down, Home and End move the active result while focus stays in the input [WEB-8]. Enter runs it, and Escape closes it, returning focus to where it was [WEB-6]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The placeholder ("Search or ask"), the group order, plain "contains" matching and the empty line, inside the floors [WEB-1]. Without `onAsk`, the empty line promises nothing. Records are found by name. |
| Platform owns | Reporting the active result as focused while DOM focus stays in the input [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Combobox key map, including whether Home and End move the caret or the result, since that page is not in the registry. Keyboard, pointer, trackpad: whether the browser's own Cmd or Ctrl K binding reaches the page first, since no browser documentation is in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
