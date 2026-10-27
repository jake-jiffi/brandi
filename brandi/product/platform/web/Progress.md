# Progress on the web

The progress bar shows progress toward a known end, and on the web it is the ARIA progressbar.

```yaml
component: Progress
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
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
| Native control | Role `progressbar`, whose related concept is `status` [WEB-8]. ARIA says not to use `meter` for progress, which is the progressbar's job [WEB-8]. |
| Target and spacing | None. A progressbar is never a target [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The numbers are said in words beside it ("34 of 40 h"). |
| Colour and theme | The fill is 3:1 against the track, as a graphic needed to understand it (1.4.11) [WEB-1]. The tone is never the only cue (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Determinate, as `value` of `max`, or indeterminate, with no value. Indeterminate omits `aria-valuenow` [WEB-8] and matches `:indeterminate` where the host supports it [WEB-10]. |
| Motion | The indeterminate bar slows right down under `prefers-reduced-motion` rather than stopping, an accepted choice [WEB-9]. |
| Accessibility API | Role `progressbar`, named by `label` [WEB-8]. `aria-valuenow`, with `aria-valuemin` at 0 and `aria-valuemax` at 100 unless set [WEB-8]. Assistive tech reads the value as a percent unless `aria-valuetext` gives words, so `valueLabel` goes there ("34 of 40 hours") [WEB-8]. A `target` marker is said in words too (1.1.1) [WEB-1]. |
| Navigation placement | In cards, table cells and uploads. A region it reports on takes `aria-busy="true"` until it finishes [WEB-8]. |
| Keyboard, pointer, trackpad | None. A progressbar is read-only and takes no focus [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Height, tones, the target marker and `showValue`, inside the floors [WEB-1]. An unknown length is `indeterminate`, never a made-up percentage. |
| Platform owns | Reading the value as a percent when `aria-valuetext` is absent [WEB-8]. |
| Not confirmed | Native control: the HTML `progress` element, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
