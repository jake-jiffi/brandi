# Accordion on the web

The accordion has sections that open and close in place, for help, frequently asked questions and long settings, built from headings that hold disclosure buttons.

```yaml
component: Accordion
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
| Native control | A heading holding a `button` with `aria-expanded` and `aria-controls` [WEB-8]. The APG patterns index lists Accordion and Disclosure patterns [WEB-2]. |
| Target and spacing | Each header button meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Open and closed show by an icon as well as colour (1.4.1), with the icon at 3:1 (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Each section open or closed on its own. `aria-expanded` gives the state, and closed content leaves the tree [WEB-8]. |
| Motion | Sections expand. Under `prefers-reduced-motion` they open without sliding [WEB-9]. |
| Accessibility API | Each header is a `heading` holding a `button` named by the section title, with `aria-expanded` and `aria-controls` [WEB-8]. A panel can be a `region` named by its header when people should jump to it [WEB-8]. |
| Navigation placement | Page content, inside `main` [WEB-7]. |
| Keyboard, pointer, trackpad | Space and Enter toggle a section [WEB-3]. Opening one leaves the others as they were. Closed content leaves the tab order [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The icon, spacing and whether several sections open together, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Button activation [WEB-3]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Accordion key map, including arrows between headers, since its page is not in the registry. Native control: HTML `details` and `summary`, since the HTML standard is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
