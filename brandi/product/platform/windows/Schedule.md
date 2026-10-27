# Schedule on Windows

Records on a day, week or month grid, such as rosters, bookings and appointments.

```yaml
component: Schedule
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
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
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
| Native control | No calendar grid control in the registry's pages. Closest pattern: a `GridView`, which lays items out in rows and columns [WIN-22]. |
| Target and spacing | Every event takes the 40 × 40 px touch target [WIN-2]. |
| Type | Event titles in Body and times in Caption [WIN-4] [FLU-3]. |
| Colour and theme | Event colours never carry meaning alone [WIN-7]. In contrast themes the selected event takes the highlight pair [WIN-9]. |
| States | Day, week or month views, with a selected event in the highlight pair in contrast themes [WIN-9]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each event is a DataItem named by its time and title, with the GridItem pattern in a grid people move through item by item [WIN-21]. |
| Navigation placement | Page content in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | In a multi-column grid all four arrow keys move [WIN-17]. In row-major order, Right from a row's last item goes to the next row's first [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Day, Week and Month through a SegmentedControl, a list by day under the product's 640 px threshold, measured on its own width, and every event reachable by keyboard and read with its time and title. Microsoft's grid keyboard model applies [WIN-17]. |
| Platform owns | Grid keyboard behaviour [WIN-17]. |
| Not confirmed | A first-party calendar grid. Time slot layout. Haptic guidance. |
