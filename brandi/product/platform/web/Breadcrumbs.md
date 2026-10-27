# Breadcrumbs on the web

Breadcrumbs show where a record sits, for pages two or more levels deep, built as an ordered list of links in a `nav` landmark.

```yaml
component: Breadcrumbs
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
| Native control | An HTML `nav` named "Breadcrumb" over an ordered list of links [WEB-7] [WEB-8]. The APG patterns index lists a Breadcrumb pattern [WEB-2]. |
| Target and spacing | Every link has a 24 CSS px target (2.5.8) [WEB-1]. The Inline exception covers links in a sentence, not a trail. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Long names are cut at 28 characters. |
| Colour and theme | Link text 4.5:1 (1.4.3) [WEB-1]. Separators identify no control (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Links, then the current page as plain text. The current item carries `aria-current="page"` [WEB-8]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | A `nav` named "Breadcrumb", holding a `list` of links [WEB-7] [WEB-8]. The last item is the current page and not a link. Separators are hidden [WEB-8]. |
| Navigation placement | In the PageHeader, above the title [WEB-7]. |
| Keyboard, pointer, trackpad | Tab moves through the links (2.1.1) [WEB-1]. A cut name keeps a route to its full text that works without a mouse (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The 28-character cut, the separator glyph and the type, inside the floors [WEB-1]. The full name shows only on hover in the reference, which leaves keyboard and touch users out, an open gap. |
| Platform owns | The link role and landmark exposure [WEB-7] [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the APG Breadcrumb key and labelling guidance, since its page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
