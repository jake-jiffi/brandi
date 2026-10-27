# PhoneTopBar on the web

The phone top bar is a detail screen's top bar, with Back and the screen's title, built from a link and the screen's heading.

```yaml
component: PhoneTopBar
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
  - key: WEB-10
    url: https://www.w3.org/TR/selectors-4/
    marker: Working Draft 2026-01-22
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Back is an HTML `a`, since going back navigates [WEB-3] [WEB-8]. The title is the screen's `h1` [WEB-8]. |
| Target and spacing | Back meets 24 × 24 CSS px (2.5.8), and 44 CSS px on touch [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Long titles wrap rather than overflow. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | None of its own beyond Back's rest, hover, focus and active [WEB-10]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Back is a `link` named for where it goes ("Back to [list]") (2.4.4) [WEB-1]. The title is the screen's `h1` [WEB-8]. |
| Navigation placement | The top of a phone screen, under 1024 CSS px, inside `main` [WEB-7]. |
| Keyboard, pointer, trackpad | After navigating, focus moves to the new screen's `main`, which takes `tabindex="-1"` [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Height, Back's icon and label, and the title style, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | The link role and how the browser follows it [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the keys that follow a link, since the APG Link pattern page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
