# NavItem on the web

The navigation item is one destination on the rail, with an icon, a label and an optional count, built on the HTML `a` element.

```yaml
component: NavItem
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
| Native control | HTML `a`, the related concept of the `link` role [WEB-8]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The current page takes `rail-selected` with a hairline, a cue beyond colour (1.4.1) at 3:1 (1.4.11) [WEB-1]. A count's text is `on-highlight`, 4.5:1 (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, hover, focus and current. A count is highlighted with `attention` and grey without, and zero shows nothing. The current page carries `aria-current="page"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `link` named by its label with the count in words: "Approvals, 3 need you" with `attention`, "[Place], 12 waiting on others" without [WEB-8]. The icon is hidden [WEB-8]. |
| Navigation placement | On the rail, in a NavGroup, inside the `nav` named "Main" [WEB-7]. |
| Keyboard, pointer, trackpad | Tab reaches it (2.1.1) [WEB-1]. It navigates, so it is a link [WEB-3]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The icon, the selected look and the count styles, inside the floors [WEB-1]. A highlighted count waits on the reader, a grey one on someone else. |
| Platform owns | The link role and `aria-current` exposure [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the keys that follow a link, since the APG Link pattern page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
