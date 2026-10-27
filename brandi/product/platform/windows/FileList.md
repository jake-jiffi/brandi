# FileList on Windows

The files after a drop, each with its name, size, progress and a remove action.

```yaml
component: FileList
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
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
  - key: WIN-7
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/color
    marker: 2026-10-13
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
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
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A `ListView` of files [WIN-22], each row with a `ProgressBar` [WIN-12] and a remove `Button` [WIN-13]. |
| Target and spacing | Remove buttons take the 40 × 40 px touch target [WIN-2]. On the 4 epx grid [WIN-16]. |
| Type | The name in Body, size and status in Caption [WIN-4] [FLU-3]. |
| Colour and theme | Failures need an icon and words, not colour [WIN-7]. In contrast themes, progress takes `SystemColorHighlightColor` [WIN-9]. |
| States | Uploading, done and failed, each in words [WIN-7]. |
| Motion | The progress fill moves. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each file is a DataItem named by its file name, with `ItemStatus` carrying the upload status as it changes [WIN-21]. Remove buttons are named "Remove [file]" [WIN-19]. |
| Navigation placement | Under its FileDrop. A lone button in a list item right-aligns [WIN-13]. |
| Keyboard, pointer, trackpad | Up and Down move through the files [WIN-17]. Remove takes Enter or Space [WIN-13]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Each file with its progress in words beside the bar, a failed file saying why and what to do, and a remove action. Microsoft's `ItemStatus` gives the status a home in UI Automation [WIN-21]. |
| Platform owns | Item status events in UI Automation [WIN-21]. |
| Not confirmed | How a finished or failed upload is announced. Haptic guidance. |
