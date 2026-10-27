# Tabs on the web

Tabs split one page or record into sections with optional counts, and on the web they are the ARIA tablist, since HTML has no tabs element.

```yaml
component: Tabs
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
| Native control | No native tabs. Roles `tablist`, `tab` and `tabpanel` [WEB-8]. The APG patterns index lists a Tabs pattern [WEB-2]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. The product sets 40 CSS px tabs on touch. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. When the tabs do not fit, the row scrolls sideways. |
| Colour and theme | The selected tab takes `text-strong` and a 2px `primary` underline, a cue beyond colour (1.4.1) at 3:1 (1.4.11) [WEB-1]. An `attention` count takes the highlight. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Selected, unselected, hover, focus and disabled. The selected tab has `aria-selected="true"` [WEB-8]. ARIA asks that unselected panels stay hidden [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | A `tablist`, horizontal by default and named by `label` [WEB-8]. Each `tab` has presentational children, `aria-selected` and `aria-controls` [WEB-8]. Each `tabpanel` needs a name, which it takes from its tab through `aria-labelledby` [WEB-8]. The count is read as `countLabel` ("12 overdue"). |
| Navigation placement | Under the PageHeader's title [WEB-7]. The open tab is in the URL. |
| Keyboard, pointer, trackpad | ARIA requires a tablist to manage focus [WEB-8]. The product's map: Tab enters at the selected tab, and Left, Right, Home and End move the selection and the focus together. The full APG key map: not confirmed. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The underline, the counts and the sideways scroll, inside the floors [WEB-1]. Tabs are 40 CSS px on touch, an accepted choice above 2.5.8 (AA) and below the 44 that 2.5.5 (AAA) sets [WEB-1]. Two to seven tabs, each keeping its own scroll and filters. |
| Platform owns | Reporting the tab roles and selection [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Tabs key map, including manual or automatic activation, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
