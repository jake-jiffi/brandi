# ErrorSummary on the web

The error summary is a titled list of what stopped a save, each line a link to its field, and the web has no element for it.

```yaml
component: ErrorSummary
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
| Native control | None. A container that script can focus (`tabindex="-1"`) [WEB-8], holding a title and a `list` of links [WEB-8]. |
| Target and spacing | Each link meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. The danger look also comes through the title and an icon, never colour alone (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Shown after a failed save and gone after the next successful one. Its links have rest, hover and focus states [WEB-10]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Named by its title through `aria-labelledby` [WEB-8]. Each message names its field and the fix (3.3.1, 3.3.3) [WEB-1], word for word with the Field error. The starter also gives it `role="alert"`. ARIA says an author who moves focus to a message should use `alertdialog`, not `alert` [WEB-8]. |
| Navigation placement | The top of the form, above the first field, inside the `form` [WEB-7]. |
| Keyboard, pointer, trackpad | It takes focus when it appears, so a screen reader reads it first and the first link is one Tab away (2.4.3) [WEB-1]. Each link moves focus to its field. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The title ("Fix these and try again"), the look, and the rule that it appears for forms of more than about five fields [WEB-1]. The starter's `role="alert"` with a focus move departs from ARIA's alert guidance [WEB-8]. An inline summary is not a dialog, so the focus move carries it. |
| Platform owns | An `alert` is assertive and atomic, so assistive tech speaks it at once [WEB-8]. |
| Not confirmed | Accessibility API: how screen readers treat an `alert` that also takes focus, since no registry page settles it. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
