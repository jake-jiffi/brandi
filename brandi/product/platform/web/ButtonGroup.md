# ButtonGroup on the web

The button group is a row of related buttons with an 8 CSS px gap, and the web has no group control for it.

```yaml
component: ButtonGroup
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
  - key: WEB-6
    url: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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
| Native control | None needed. A row of HTML `button` elements [WEB-8]. When the set needs a name of its own, role `group`, whose related concept is HTML `fieldset`, carries it [WEB-8]. |
| Target and spacing | At least 24 × 24 CSS px (2.5.8, AA). A smaller target passes only if a 24 CSS px circle centred on it meets no other target or circle. 44 × 44 CSS px meets 2.5.5 (AAA) [WEB-1]. The 8 CSS px gap sits between buttons that already clear 24 CSS px. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The row wraps on narrow screens. At 320 CSS px wide it reflows with no scrolling in two directions (1.4.10) [WEB-1]. |
| Colour and theme | Each button keeps Button's floors: label 4.5:1 (1.4.3) and fill 3:1 against adjacent colours (1.4.11) [WEB-1]. |
| States | Each button keeps its own states. The group has none [WEB-3]. |
| Motion | None of its own. Anything that moves around it stops or shortens under `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Each child is a `button` with its own name [WEB-3]. A named group is role `group`, named by `aria-label` or `aria-labelledby` [WEB-8]. |
| Navigation placement | Form ends, dialog footers and card actions. The web sets no button order [WEB-6], so the product's applies: secondary first, the primary last, and Cancel immediately left of the primary. |
| Keyboard, pointer, trackpad | Each button is its own Tab stop. The DOM order matches the visual order, so focus runs secondary, Cancel, primary (2.4.3) [WEB-1]. Space and Enter activate [WEB-3]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | The gap, the alignment, wrapping and the order, none of which the web sets [WEB-6]. The floors on each button stay [WEB-1]. |
| Platform owns | Space and Enter activation on each button [WEB-3]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
