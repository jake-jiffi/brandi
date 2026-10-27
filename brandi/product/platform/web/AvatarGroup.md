# AvatarGroup on the web

The avatar group overlaps the avatars of the people on a record, with "+N" past the limit, and the web has no control for it.

```yaml
component: AvatarGroup
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
| Native control | None. A set of avatars with one shared text alternative [WEB-8]. |
| Target and spacing | None for the avatars. A focusable "+N" meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | As Avatar: initials 4.5:1 (1.4.3) and any status dot by more than colour (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | None of its own. Past `max` (4 by default) the rest fold into "+N", which names them in its text alternative (1.1.1) [WEB-1]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | One `img` named by everyone on the record ("[Name], [Name] and 3 more") [WEB-8], so the hidden people are named too (1.1.1) [WEB-1]. |
| Navigation placement | On records and rows, beside the record's title [WEB-7]. |
| Keyboard, pointer, trackpad | Names shown on hover also show on keyboard focus, since hover alone leaves keyboard users out (2.1.1) [WEB-1]. Once shown, they stay while the pointer moves onto them and can be dismissed without moving the pointer or focus (1.4.13) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | `max`, the overlap and the size, inside the contrast floors [WEB-1]. The product names the hidden people on hover and to screen readers. Keyboard focus needs the same names (2.1.1) [WEB-1]. |
| Platform owns | How the browser exposes the shared text alternative [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
