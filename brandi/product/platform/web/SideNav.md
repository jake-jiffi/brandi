# SideNav on the web

The side navigation is in-page navigation for settings and long documents, built as a list of links in a `nav` landmark.

```yaml
component: SideNav
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
| Native control | An HTML `nav` with a name, holding a list of in-page links [WEB-7] [WEB-8]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The current item takes `selected-strong` and a ring, a cue beyond colour (1.4.1) at 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, hover, focus and current. Nothing is current until `value` is set. The current item carries `aria-current`, as `true` or `location` [WEB-8]. `:target` matches the section the URL points to [WEB-10]. |
| Motion | Any scroll to a section stops animating under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | A `nav` named by `label`, distinct from the rail's "Main" [WEB-7]. Its links name their sections [WEB-8]. |
| Navigation placement | Sticky beside a settings page's sections, inside `main` [WEB-7]. |
| Keyboard, pointer, trackpad | Tab moves through the links (2.1.1) [WEB-1]. Following one moves to its section. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The current item's look and the sticky placement, inside the floors [WEB-1]. |
| Platform owns | In-page link targets and `:target` matching [WEB-10]. |
| Not confirmed | Keyboard, pointer, trackpad: where focus lands after following an in-page link, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
