# Sidebar on the web

The sidebar is the rail, with the product lockup, search or ask, the navigation groups and the signed-in person, built as an HTML `nav` landmark.

```yaml
component: Sidebar
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
| Native control | HTML `nav`, the related concept of the `navigation` role, named "Main" [WEB-8] [WEB-7]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Rail text 4.5:1 (1.4.3), and the selected and focus cues 3:1 on the rail surface (1.4.11) [WEB-1]. Focus on the rail uses `rail-focus`. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Full or `collapsed`. Collapsed, the labels stay in the tree and show as tooltips on hover and keyboard focus (1.4.13) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `nav` named "Main", a label that does not repeat the role [WEB-7]. The account button is a `button` with `aria-haspopup="menu"`, named "[name], [role], account menu" [WEB-3] [WEB-8]. |
| Navigation placement | The leading edge of the AppShell, with settings and help in its footer. The same order on every page (3.2.3) [WEB-1]. |
| Keyboard, pointer, trackpad | Tab moves through its links in order (2.4.3) [WEB-1]. With `onSearch`, Cmd or Ctrl K opens search, and the key hint shows only when it is set. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The rail surface and `rail-*` tokens, whether the rail carries the brand, and the group labels, inside the floors [WEB-1]. Eight top-level items at most. Icons only from 1024 to 1279 CSS px, an accepted choice. |
| Platform owns | Exposing the landmark, which screen readers use to move to it [WEB-7]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
