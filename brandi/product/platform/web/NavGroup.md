# NavGroup on the web

The navigation group sets nav items on the rail under a short label, optionally collapsible, and the web has no group control for it.

```yaml
component: NavGroup
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-2
    url: https://www.w3.org/WAI/ARIA/apg/
    marker: APG 1.2, undated
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
| Native control | None. A label tied by `aria-labelledby` to a `list` of links [WEB-8]. Collapsible, the label is a `button` with `aria-expanded` [WEB-8]. The APG patterns index lists a Disclosure pattern [WEB-2]. |
| Target and spacing | A collapsible label meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The label is short and uppercase on screen. |
| Colour and theme | Label text 4.5:1 on the rail (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Open or closed when `collapsible`, with `defaultOpen`. `aria-expanded` gives the state [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `list` named by the group's label [WEB-8]. A collapsible label is a `button` with `aria-expanded` and `aria-controls` [WEB-8]. Closed items leave the tree [WEB-8]. |
| Navigation placement | On the rail, inside the `nav` named "Main" [WEB-7]. |
| Keyboard, pointer, trackpad | A collapsible label toggles with Space and Enter [WEB-3]. Closed items leave the tab order (2.4.3) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The label's look and whether the group collapses, inside the floors [WEB-1]. |
| Platform owns | Button activation and taking closed content out of the tree [WEB-3] [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Disclosure key map, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
