# EditableCell on the web

The editable cell changes a value in place in a DataTable, built to the grid pattern's editing keys.

```yaml
component: EditableCell
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-4
    url: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
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
| Native control | The grid pattern's editable cells: role `gridcell` in a `grid` [WEB-4]. Cells that cannot be edited carry `aria-readonly="true"` [WEB-4]. |
| Target and spacing | The cell meets 24 × 24 CSS px (2.5.8) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Edit mode shows by a visible edge as well as a tint (1.4.11), and an error by an icon and words (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, focused, editing, saving, saved and failed. A failed save leaves the cell open with the typed value. `aria-invalid="true"` marks a wrong value [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | A `gridcell` whose input is named by the column header [WEB-4]. The error is tied to the input with `aria-describedby` [WEB-8] and says what is wrong and how to fix it (3.3.1, 3.3.3) [WEB-1]. |
| Navigation placement | Inside a DataTable that becomes a `grid` for editing [WEB-4]. The first column still names the record. |
| Keyboard, pointer, trackpad | Enter or F2 puts focus in the cell's input, and Escape restores grid navigation and can undo the edit [WEB-4]. Typing a character also starts an edit [WEB-4]. Selecting a row never opens or edits it. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The editing look and when a value saves, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Reporting the grid and its cells [WEB-4]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
