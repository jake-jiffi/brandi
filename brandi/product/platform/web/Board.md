# Board on the web

The board shows records in columns by stage, for work that moves through steps, built from labelled lists with a Move to menu on every card.

```yaml
component: Board
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
| Native control | None, and APG's patterns index lists no board [WEB-2]. Each column is a `list` named by its stage and count [WEB-8]. Each card is a `listitem` holding a link and a "Move to" menu button [WEB-3] [WEB-8]. |
| Target and spacing | Each card's link and menu button meet 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. The reflow exception covers only parts that need a two-dimensional layout (1.4.10) [WEB-1]. |
| Colour and theme | Card text 4.5:1 (1.4.3), and a card being moved shows by more than colour (1.4.1) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Rest, focus, being moved and moved. Column counts are said in words, and zero shows nothing (1.4.1) [WEB-1]. |
| Motion | A card's move animates. Under `prefers-reduced-motion` it appears in place [WEB-9]. |
| Accessibility API | Columns are `list`s named "[Stage], 4 [records]" [WEB-8]. Cards follow ListRow's title, meta and badge rules [WEB-8]. A move is a status message ("Moved to [stage]") (4.1.3) [WEB-1]. |
| Navigation placement | Page content, inside `main` [WEB-7]. |
| Keyboard, pointer, trackpad | Moving never depends on dragging: the Move to menu is the keyboard and single-pointer path (2.5.7, 2.1.1) [WEB-1]. After a move, focus stays on the card in its new column [WEB-8]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Column width, card layout and the dragging look, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Menu and list roles [WEB-8]. |
| Not confirmed | Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
