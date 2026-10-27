# RuleLine on the web

The rule line shows which approved rule acted, wherever it acted, built as a line of text with one link.

```yaml
component: RuleLine
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
| Native control | None. Text with one HTML `a`, the related concept of `link` [WEB-8]. |
| Target and spacing | The link meets 2.5.8, or the Inline exception inside a sentence [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. A failure or a paused rule says so in words (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Acted, failed, or the rule changed or paused since, where the line stays and says so. A failure names the step and the system, offers one Try again, and is a status message when it happens (4.1.3) [WEB-1]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Plain text: "Done by the rule "[rule name]", approved by [name] on [date]." The link opens the rule view and names where it goes (2.4.4) [WEB-1] [WEB-8]. |
| Navigation placement | On the item the rule changed, in its history, and in the steps log when the rule ran steps [WEB-7]. |
| Keyboard, pointer, trackpad | The link is the one Tab stop, with Try again when it fails (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Wording and placement, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | The link role and how the browser follows it [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the keys that follow a link, since the APG Link pattern page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
