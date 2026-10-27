# EditableCell on Windows

A value changed in place in a table row.

```yaml
component: EditableCell
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
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-19
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-21
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdataitemcontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-22
    url: https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview
    marker: 2026-09-19
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
| Native control | No stable grid with editing. A `TextBox` [WIN-19] in a `ListView` row template [WIN-22]. The experimental `TableView` has edit events, `TableViewBeginningEditEventArgs` and `TableViewCellEditEndingEventArgs` [WIN-25], and experimental APIs may change or never ship [WIN-24]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | In contrast themes the editing cell takes the `SystemColorButtonFaceColor` pair, and selected rows the highlight pair [WIN-9]. |
| States | Reading, editing, saving and failed, with errors inline in the cell, never in a dialog [WIN-14]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. A data item whose primary text can be edited must support the Value pattern [WIN-21]. Name from the column and row [WIN-19]. |
| Navigation placement | Inside a DataTable row, in page content [WIN-22]. |
| Keyboard, pointer, trackpad | Enter starts an edit and Esc cancels it, as Esc cancels transient UI across Windows [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Selecting a row never edits it, the first column names the record, an error says what is wrong and how to fix it, and a failed save leaves the cell open with the typed value. Microsoft keeps such errors inline [WIN-14]. |
| Platform owns | The Value pattern requirement [WIN-21]. |
| Not confirmed | Editing in the stable channel. How a saved or failed edit is announced. Haptic guidance. |
