# Sheet on the web

The sheet is a panel from the right for a record or a longer edit without leaving the list, built to the APG modal dialog pattern.

```yaml
component: Sheet
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
| Native control | APG has no sheet pattern [WEB-2]. System rule, not APG's: build sheets to the modal dialog pattern, as role `dialog` with `aria-modal="true"` [WEB-6]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The scrim dims the page behind it [WEB-6]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Open or closed, with `inline` for designs. `aria-modal="true"` holds only while it is open and the page behind is inert [WEB-6]. |
| Motion | It slides in from the right. Under `prefers-reduced-motion` it fades instead [WEB-9]. |
| Accessibility API | Role `dialog`, named by its title through `aria-labelledby`, with `aria-modal="true"` [WEB-6]. ARIA requires the name [WEB-8]. |
| Navigation placement | From the right, inset from the edges like the rail, 440 CSS px wide by default. From 1280 CSS px the detail pane sits beside the list instead, inside `main` [WEB-7]. |
| Keyboard, pointer, trackpad | As Dialog: focus moves in and stays, Tab wraps inside, and Escape and the scrim close it. Focus returns to the row that opened it [WEB-6]. A sheet may open a confirmation dialog, and Escape then closes the dialog first. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Width, inset, radius and the 1280 CSS px switch from pane to sheet, none of which APG sets, since it has no sheet pattern [WEB-2]. Its floors stay [WEB-1]. |
| Platform owns | How assistive tech limits reading to the sheet under `aria-modal` [WEB-8]. |
| Not confirmed | Native control: the HTML `dialog` element and `inert`, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
