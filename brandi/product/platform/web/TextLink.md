# TextLink on the web

The text link is an underlined inline link, built on the HTML `a` element.

```yaml
component: TextLink
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft), Selectors Level 4 (Working Draft)
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
| Native control | HTML `a` with `href`, the related concept of the `link` role [WEB-8]. The APG patterns index lists a Link pattern [WEB-2]. |
| Target and spacing | A link in a sentence is exempt from 2.5.8 under its Inline exception [WEB-1]. The product sets 24 CSS px for links in a sentence or a trail anyway. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. |
| Colour and theme | Link text 4.5:1 (1.4.3) [WEB-1]. Colour is never the only thing that marks a link in running text (1.4.1), and the underline carries it [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, visited, hover, focus and active, through `:link`, `:visited`, `:hover`, `:focus-visible` and `:active` [WEB-10]. Focus is always visible (2.4.7) [WEB-1]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Role `link`, named by its text content [WEB-8]. The text says where it goes, alone or with its programmatic context (2.4.4) [WEB-1]. A leading or trailing icon is hidden [WEB-8]. |
| Navigation placement | Inline in text, alerts, help and empty states. A link navigates and a button acts, so "Try again" is a Button even inside an Alert [WEB-3]. |
| Keyboard, pointer, trackpad | Reached with Tab (2.1.1) [WEB-1]. If following it changes neither focus nor location, ARIA points to the `button` role instead [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The `link` colour, the underline style and the icons, inside 4.5:1 and the not-by-colour-alone floor [WEB-1]. The text is unique on the page and never "here" or "more". |
| Platform owns | The link role, its name computation and how the browser follows it [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: the keys that follow a link, since the APG Link pattern page is not in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
