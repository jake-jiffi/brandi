# Schedule on the web

The schedule shows records on a day, week or month grid, for rosters, bookings and appointments, built as a table of days with events as links.

```yaml
component: Schedule
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
  - key: WEB-4
    url: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
    marker: undated
    read: 2026-10-27
  - key: WEB-5
    url: https://www.w3.org/WAI/ARIA/apg/patterns/table/
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
| Native control | None, and APG's patterns index lists no calendar [WEB-2]. The closest is a `table` with days as column headers and times as row headers [WEB-5], or a `grid` when people move cell by cell [WEB-4]. Under 640 CSS px it becomes a `list` by day [WEB-8]. |
| Target and spacing | Each event meets 2.5.8 [WEB-1]. |
| Type | No platform font or ramp, so the brand ramp applies. Text survives 200% resize (1.4.4) and the text spacing overrides (1.4.12) [WEB-1]. Data tables may scroll in two directions under reflow (1.4.10, note 2) [WEB-1]. |
| Colour and theme | Event colours are never the only cue, since each event names itself (1.4.1). Event text is 4.5:1 (1.4.3) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Day, Week or Month, through a SegmentedControl. Today carries `aria-current="date"` [WEB-8]. |
| Motion | Transitions stop or shorten under `prefers-reduced-motion` [WEB-9]. Letting people turn off interaction motion is 2.3.3, AAA [WEB-1]. |
| Accessibility API | Each event is a link or button named by its time and title [WEB-8]. Day and time headers come from the table's `columnheader` and `rowheader` cells [WEB-5]. |
| Navigation placement | Page content, under its Toolbar with the view switcher [WEB-7]. |
| Keyboard, pointer, trackpad | Every event is reachable by keyboard and reads its time and title (2.1.1) [WEB-1]. As a table, Tab moves through the events [WEB-5]. As a grid, the arrows move a cell and stop at the edges [WEB-4]. |
| Haptics | None. WCAG 2.2 has no haptics criterion [WEB-1]. |
| Brand may change | Grid density, event styles and the 640 CSS px switch to a list by day, inside the floors [WEB-1]. Not yet proven: no review round has checked it. |
| Platform owns | Table semantics from the native elements [WEB-5]. |
| Not confirmed | Keyboard, pointer, trackpad: the choice between a static table and a grid for a calendar, which no registry page settles. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
