# EmptyState on the web

The empty state says what is empty and what to do next, built from a heading, text and actions with a decorative picture.

```yaml
component: EmptyState
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
| Native control | None. A heading at `headingLevel`, text and buttons [WEB-8]. The picture is decorative (1.1.1) [WEB-1]. |
| Target and spacing | Actions meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. A `page` title takes the display style when the brand uses one for titles. |
| Colour and theme | Text 4.5:1, or 3:1 for large text (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Nothing yet, no results, all done, could not load, no access and not found, each with its own words and actions. "No results" after a filter is a status message (4.1.3) [WEB-1]. |
| Motion | A character loop stops under `prefers-reduced-motion` [WEB-9]. Motion that runs past five seconds beside other content needs a pause, stop or hide control (2.2.2) [WEB-1]. |
| Accessibility API | The title is a `heading`, 2 for `page` and 3 otherwise [WEB-8]. As the whole page, the starter makes it the page's one `h1`. The picture is pure decoration, hidden with `aria-hidden="true"` (1.1.1) [WEB-1] [WEB-8]. |
| Navigation placement | `page` for a whole page, `section` inside a card or pane, `compact` in narrow places [WEB-7]. Inside a table it replaces the rows and keeps the header and the toolbar. |
| Keyboard, pointer, trackpad | Actions are Tab stops (2.1.1) [WEB-1]. After an action such as Clear filters, focus moves to a logical element, never the page body [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The character pose for each kind, sizes, flat, and the display style for page titles, inside the floors [WEB-1]. A brand with no character or illustration passes none. |
| Platform owns | Exposing the heading [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
