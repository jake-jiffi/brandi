# List on Windows

A column of rows for records, inboxes, queues and list panes, built on the WinUI `ListView`.

```yaml
component: List
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: WIN-2
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-targeting
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
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
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | WinUI `ListView`, which stacks items in one column and suits text-led items such as messages and search results [WIN-22]. Rows come in as data through `ItemsSource`, and grouped rows bind through `CollectionViewSource` [WIN-22]. |
| Target and spacing | Rows take the 40 × 40 px touch target [WIN-2]. On the 4 epx grid [WIN-16]. |
| Type | Body and Caption for multi-line rows, and Body Strong for section headers [WIN-4]. |
| Colour and theme | List backplates take 4 px corners [WIN-12]. In contrast themes, rows take `SystemColorHighlightColor` on hover, press and selection [WIN-9]. |
| States | `SelectionMode` None, Single, Multiple or Extended. None keeps the list for display only [WIN-22]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Rows are ListItems when selectable, or DataItems for richer records, each named by its primary text [WIN-21]. |
| Navigation placement | Page content, or the list pane beside a detail pane. F6 moves between panes once the app builds it [WIN-18]. |
| Keyboard, pointer, trackpad | Up and Down move through rows, Home and End go to the ends, and Page Up and Page Down move a page [WIN-17]. Arrow keys are built in [WIN-18]. Touchpads pan it with one finger where the OS and hardware support it [WIN-25]. |
| Haptics | Not confirmed. |
| Brand may change | `boxed` by default, `divided`, and rows passed as `items`, which a canvas needs. `ItemsSource` takes data the same way [WIN-22]. |
| Platform owns | Selection modes [WIN-22]. Contrast theme colours [WIN-9]. |
| Not confirmed | Row heights. Haptics. |
