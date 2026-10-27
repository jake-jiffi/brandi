# Timeline on the web

The timeline lists what happened to a record, newest first, built as an ordered list with times.

```yaml
component: Timeline
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
| Native control | An ordered list: `list` and `listitem`, whose base concepts are `ol` and `li` [WEB-8]. Each time is the `time` role, related concept HTML `time` [WEB-8]. |
| Target and spacing | None. Any link in a line meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The tone and the icon are never the only cue, since the text names who did what (1.4.1) [WEB-1]. An icon that carries the kind is 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Tones by kind, with `ai` for the assistant's actions, which the words also name (1.4.1) [WEB-1]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | A `list` of `listitem` [WEB-8]. Each line names who did what ("[Name] approved 14 [records]"), with its `time` [WEB-8]. Icons are hidden or named by kind (1.1.1) [WEB-1]. |
| Navigation placement | On a record's detail, as its history [WEB-7]. |
| Keyboard, pointer, trackpad | None. Any link in a line is its own Tab stop (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The icon for each kind, the tone tints, the connecting line and newest first, inside the floors [WEB-1]. |
| Platform owns | List semantics from `ol` and `li` [WEB-8]. |
| Not confirmed | Accessibility API: a machine-readable date on `time`, since ARIA has no datetime property yet and the HTML standard is not in the registry [WEB-8]. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
