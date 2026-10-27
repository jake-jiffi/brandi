# DataTable on Windows

Records in rows and columns, declared by column type, built as a templated `ListView` because stable WinUI 3 has no first-party data grid.

```yaml
component: DataTable
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1 and 2.5.4-experimental
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: WIN-2
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-targeting
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
    read: 2026-10-27
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-18
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility
    marker: 2026-10-04
    read: 2026-10-27
  - key: WIN-21
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdataitemcontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-22
    url: https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview
    marker: 2026-09-19
    read: 2026-10-27
  - key: WIN-23
    url: https://learn.microsoft.com/en-us/windows/communitytoolkit/controls/datagrid
    marker: 2024-06-07
    read: 2026-10-27
  - key: WIN-24
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-channels
    marker: 2026-09-29
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No first-party data grid in stable WinUI 3. The Community Toolkit DataGrid is not offered for WinUI 3 in Toolkit 8.0 and later, per a page last updated 7 June 2024 [WIN-23]. The ListView page conflicts with that: it sends table-like data to a DataGrid, not ListView [WIN-22]. Windows App SDK 2.5.4-Experimental adds an experimental `TableView` with sorting, filtering, column resizing and a density setting [WIN-25], and experimental APIs may change or never ship [WIN-24]. Closest stable pattern: a `ListView` item templated into columns [WIN-22]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. Layout in multiples of 4 epx [WIN-16]. |
| Type | Body and Caption on multi-line rows, 32 epx icons, and Body Strong for section headers [WIN-4]. Sentence case for all UI text [WIN-5], and Fluent avoids all caps [FLU-3]. |
| Colour and theme | List backplates take 4 px corners [WIN-12]. In contrast themes, hovered, pressed and selected rows take `SystemColorHighlightColor`. Never set `TextBlock.Foreground` directly in a row template, or selected rows lose their inversion [WIN-9]. |
| States | `SelectionMode` None, Single, Multiple or Extended. `IsItemClickEnabled` raises `ItemClick` before `SelectionChanged` [WIN-22]. |
| Motion | Check `UISettings.AnimationsEnabled` before any row animation [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each row is a DataItem named by its primary text, with GridItem and TableItem inside a grid with headers, SelectionItem when selectable, and ScrollItem when the list scrolls. A selectable row can be a ListItem instead [WIN-21]. The experimental `TableView` ships automation peers for the table, its rows, cells and column headers [WIN-25]. |
| Navigation placement | Page content. F6 moves between panes once the app builds it [WIN-18]. |
| Keyboard, pointer, trackpad | Up and Down move through a single column, Home and End go to the first and last rows, and Page Up and Page Down move a page [WIN-17]. Enter selects like Space unless the row has an extra action [WIN-17]. `ListView` has arrow keys built in [WIN-18]. In Multiple or Extended mode, Shift with a click or the arrows selects a run of rows [WIN-22]. Ctrl+A selects all [WIN-17]. |
| Haptics | Not confirmed. |
| Brand may change | Column types, a first column that names the record, and seven columns at most. Right-aligned exact figures, hairlines with no zebra stripes, and comfortable or compact density. The list form under the product's 640 px threshold, measured on its own width, and bulk actions only on rows on screen. Its short uppercase heads depart from Microsoft's sentence case [WIN-5] and from Fluent's advice against all caps [FLU-3], and the product's guidelines apply (2.3). |
| Platform owns | Selection modes and their modifier keys [WIN-22]. UI Automation patterns [WIN-21]. Contrast theme colours [WIN-9]. |
| Not confirmed | Column headers and sorting in the stable channel. A sticky header, and a frozen actions column, which only the experimental `TableView` names (`TableViewFrozenEdge`) [WIN-25]. Row heights. Haptics. |
