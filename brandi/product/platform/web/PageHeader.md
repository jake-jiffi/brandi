# PageHeader on the web

The page header is the top of every page, with breadcrumbs, the title, a description, the actions and tabs, built around the page's one `h1`.

```yaml
component: PageHeader
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
| Native control | None. A `heading` at level 1, whose base concepts are `h1` to `h6`, with the page's actions [WEB-8]. It is not the `banner` landmark, which holds site-wide content [WEB-7]. |
| Target and spacing | Each action meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Long titles wrap. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | None of its own. On phones the actions drop below the title, and inside AppShell `primary` moves to the bar at the foot, which never hides the focused control (2.4.11) [WEB-1]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | The title is the page's only `h1`, with `tabindex="-1"` so script can focus it [WEB-8]. The browser tab's title names the same thing (2.4.2) [WEB-1]. `meta` badges read after the title. |
| Navigation placement | The top of `main`, above the content [WEB-7]. One primary at most, on the right. |
| Keyboard, pointer, trackpad | When an action removes the control people pressed, focus moves to the title, a logical element [WEB-8]. Actions are Tab stops in DOM order (2.4.3) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The title style, the description capped at the measure, and the action layout, inside the floors [WEB-1]. The title is the noun people use, never "Dashboard". |
| Platform owns | Exposing the heading [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
