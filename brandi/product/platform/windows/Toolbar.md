# Toolbar on Windows

One row of search, filters and view controls above a table or list.

```yaml
component: Toolbar
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
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
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
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-18
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility
    marker: 2026-10-04
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | WinUI `CommandBar` for the command buttons, where people expect arrow keys between `AppBarButtons` [WIN-17]. Search and filters sit in the same row, outside it. |
| Target and spacing | Every control takes the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | Body for controls [WIN-5] [FLU-3]. Caption suits command buttons in very confined space [WIN-4]. |
| Colour and theme | Bars keep `SystemColorWindowColor` in contrast themes [WIN-9]. |
| States | Filtering, or bulk actions when rows are selected. Bars keep `SystemColorWindowColor` in contrast themes [WIN-9]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The group's name ("[Record] filters") goes on its root through `AutomationProperties.Name` [WIN-18]. Its control type: not confirmed. |
| Navigation placement | Above its table or list as one block, sticking while it scrolls. The touch keyboard stays open when focus moves from search into a toolbar [WIN-17]. |
| Keyboard, pointer, trackpad | Arrow keys move between command buttons [WIN-17]. A `CommandBar` overflow menu opens as a popup, with Down going to the first item and Up to the last [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Search first, then filter chips, a Spacer, then the view switcher and secondary actions, with bulk actions replacing filters on selection and the toolbar sitting close above its table as one block. The `CommandBar` covers only the buttons [WIN-17]. |
| Platform owns | `CommandBar` overflow and arrow keys [WIN-17]. |
| Not confirmed | Hosting search and chips inside a `CommandBar`. Sticky behaviour. Its UI Automation control type. Haptic guidance. |
