# PhoneTabBar on the web

The phone tab bar holds three to five top-level places at the foot of a phone app, built as links in a `nav` landmark.

```yaml
component: PhoneTabBar
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
| Native control | An HTML `nav` holding one link for each place [WEB-7] [WEB-8]. Not a `tablist`: these are destinations, and a link navigates [WEB-3]. |
| Target and spacing | 44 CSS px by default, 40 at least, with 8 between, all above the 24 CSS px floor (2.5.8) [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | The current place shows by more than colour (1.4.1), at 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Current or not. Counts are read as words, and zero shows nothing. The current place carries `aria-current="page"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `nav` named for its job, distinct from any other `nav` [WEB-7]. Each link is named by its label with its count in words [WEB-8]. |
| Navigation placement | Fixed at the foot of a phone layout. It never hides the control that has focus (2.4.11), and its order is the same on every page (3.2.3) [WEB-1]. |
| Keyboard, pointer, trackpad | Tab moves through the places (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Icons, labels and sizes, inside the floors [WEB-1]. Whether the tab bar or the action bar owns the foot is decided per product. Not yet proven: no review round has checked it. |
| Platform owns | The link role and `aria-current` exposure [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the keys that follow a link, since the APG Link pattern page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
