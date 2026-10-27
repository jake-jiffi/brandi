# Spacer on the web

The spacer is a flexible gap inside a Toolbar that pushes what follows to the far end, and it is layout only on the web.

```yaml
component: Spacer
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
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
| Native control | None. An empty `generic` element, which has no meaning of its own [WEB-8]. |
| Target and spacing | None. It is never pressable [WEB-1]. |
| Type | None. It holds no text [WEB-1]. |
| Colour and theme | None. It draws nothing [WEB-1]. |
| States | None. When the Toolbar wraps, it collapses, so nothing reflows into two-way scrolling (1.4.10) [WEB-1]. |
| Motion | None. It has nothing to animate, so `prefers-reduced-motion` changes nothing [WEB-9]. |
| Accessibility API | None. A `generic` element takes no name and adds no meaning [WEB-8]. |
| Navigation placement | Inside a Toolbar, between the filters and the view controls. It moves things on screen, never the reading order (1.3.2) [WEB-1]. |
| Keyboard, pointer, trackpad | None. It never takes focus (2.1.1) [WEB-1]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Its flex behaviour, inside the reflow floor (1.4.10) [WEB-1]. |
| Platform owns | Nothing. It carries no semantics [WEB-8]. |
| Not confirmed | Nothing for this component. |
