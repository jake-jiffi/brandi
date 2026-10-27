# DataTable on the web

The data table shows records in rows and columns declared by column type, built on the HTML `table` element.

```yaml
component: DataTable
platform: web
checked_against: WCAG 2.2 AA, WAI-ARIA 1.2, APG 1.2, Media Queries Level 5 (Working Draft)
checked_on: 2026-10-27
status: current
sources:
  - key: WEB-1
    url: https://www.w3.org/TR/WCAG22/
    marker: Recommendation 2024-12-12, errata 2026-10-01
    read: 2026-10-27
  - key: WEB-4
    url: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
    marker: undated
    read: 2026-10-27
  - key: WEB-5
    url: https://www.w3.org/WAI/ARIA/apg/patterns/table/
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
| Native control | `tr` rows in an HTML `table` for static data, with `caption`, `th` and `td`. Cells are not focusable, and each control in a row is its own tab stop. Prefer the native `table` to role `table` [WEB-5]. Cell-by-cell navigation would be the grid pattern [WEB-4], which EditableCell needs and this table does not. |
| Target and spacing | Every control in a row meets 24 × 24 CSS px (2.5.8) [WEB-1]. Neither pattern sets a row height [WEB-4] [WEB-5]. |
| Type | Brand ramp. Data tables may scroll in two directions under reflow (1.4.10, note 2) [WEB-1]. Under 640 CSS px of its own width the product shows the rows as a list instead. |
| Colour and theme | Selection is never shown by colour alone (1.4.1), and the selected indicator keeps 3:1 against adjacent colours (1.4.11) [WEB-1]. Light, dark and contrast modes through `prefers-color-scheme`, `prefers-contrast` and `forced-colors` [WEB-9]. |
| States | Loading, empty and error. The empty state replaces the rows and keeps the header and the toolbar. The sorted column's header carries `aria-sort` [WEB-5], one header at a time [WEB-8]. Rows are chosen with a checkbox in each row, a control with its own tab stop, as the table pattern expects of widgets in cells [WEB-5]. |
| Motion | Any row animation respects `prefers-reduced-motion` [WEB-9]. |
| Accessibility API | Native table roles. `caption` names it, or `aria-labelledby` or `aria-label` [WEB-5]. Set `aria-rowcount` and `aria-rowindex` when rows are missing from the DOM [WEB-5]. A sort change is a status message (4.1.3) [WEB-1]. A table wider than its box sits in a named `region` that takes focus, so the keyboard can scroll it [WEB-8]. |
| Navigation placement | Page content, under its Toolbar, with Pagination in its footer. A table is a static structure, not a widget [WEB-5]. |
| Keyboard, pointer, trackpad | No key handling of its own [WEB-5]. Tab moves through the controls in each row. With `onRowClick` or `rowHref`, the naming cell holds the row's link or button, so rows open from the keyboard (2.1.1) [WEB-1]. Selecting a row never opens it. |
| Haptics | None [WEB-1]. |
| Brand may change | Row height (48 CSS px comfortable, 40 compact), dividers, hover tint and density, none of which the patterns set [WEB-4] [WEB-5]. Short uppercase heads, hairlines and no zebra stripes. Seven columns at most. |
| Platform owns | Roles and structure from the native table elements [WEB-5] [WEB-8]. |
| Not confirmed | Keyboard, pointer, trackpad: how browsers scroll a focused box from the keyboard, and sticky heads and columns, since no browser or CSS Positioned Layout page is in the registry. Colour and theme: the system colour keywords that forced colours mode supplies, since CSS Color 4 and CSS Color Adjustment 1 were not read. |
