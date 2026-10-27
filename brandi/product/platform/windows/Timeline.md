# Timeline on Windows

What happened to a record, newest first, shown as a read-only `ListView`.

```yaml
component: Timeline
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
    read: 2026-10-27
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
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
| Native control | A `ListView` with `SelectionMode` None, which keeps it for display only [WIN-22]. |
| Target and spacing | Not pressable unless a line links somewhere. On the 4 epx grid [WIN-16]. |
| Type | Body for each line and Caption for the time [WIN-4] [FLU-3]. Lines wrap as text scales [WIN-6]. |
| Colour and theme | Icons by kind need more than colour [WIN-7]. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. |
| States | None. `SelectionMode` None keeps it for display only [WIN-22]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each line is a list item named by its text and time [WIN-21]. Icons are decorative, `AccessibilityView` Raw [WIN-19]. |
| Navigation placement | Record detail panes and pages, as a read-only list [WIN-22]. |
| Keyboard, pointer, trackpad | Up and Down move through the lines when the list takes focus [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Each line names who did what ("[Name] approved 14 [records]"), and the assistant's actions take the `ai` tone so people can tell them apart. Microsoft's colour-blindness guidance means the tone needs a word or icon too [WIN-7]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | Whether a read-only `ListView` takes keyboard focus. Relative time formats. |
