# FileList on the web

The file list shows the files after a drop, with name, size, progress and a remove action, built as a list.

```yaml
component: FileList
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-3
    url: https://www.w3.org/WAI/ARIA/apg/patterns/button/
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
| Native control | A `list` of files [WEB-8], each with a `progressbar` [WEB-8] and a remove `button` [WEB-3]. |
| Target and spacing | Each remove button has a 24 CSS px hit area (2.5.8), and 40 CSS px on touch [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The numbers are said in words beside each bar. |
| Colour and theme | The progress fill is 3:1 against its track (1.4.11), and a failed file says so in words and with an icon (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Waiting, uploading, done and failed. Each `progressbar` carries `aria-valuenow`, or none while the length is unknown [WEB-8]. |
| Motion | The bars move as files upload. An indeterminate bar slows under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | A `list` of `listitem` [WEB-8]. Each bar is a `progressbar` named by its file, with `aria-valuetext` in words ("2 of 5 MB") [WEB-8]. Done and failed are status messages (4.1.3), and a failure says why and what to do (3.3.1, 3.3.3) [WEB-1]. Remove buttons are named "Remove [file]" [WEB-3]. |
| Navigation placement | Under the FileDrop it belongs to [WEB-7]. |
| Keyboard, pointer, trackpad | Remove buttons are Tab stops. After a removal, focus moves to the next file or to the FileDrop's button [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The row layout, the size format and the progress style, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Reading progress as a percent when `aria-valuetext` is absent [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
