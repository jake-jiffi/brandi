# RuleLine on Windows

One line saying which approved rule acted, with a link to the rule.

```yaml
component: RuleLine
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
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-19
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No control. A `TextBlock` [WIN-19] holding a `Hyperlink` [WIN-17]. |
| Target and spacing | The link takes the 40 × 40 px touch target where it stands alone [WIN-2]. |
| Type | Caption or Body [WIN-4] [FLU-3]. |
| Colour and theme | In contrast themes the text takes `SystemColorWindowTextColor` and the link `SystemColorHotlightColor` [WIN-9]. |
| States | Acted, failed, and rule changed or paused since, each in words [WIN-7]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Static text with one link named by its text [WIN-19]. |
| Navigation placement | On the item the rule changed, in its history and in the steps log, as static text [WIN-19]. |
| Keyboard, pointer, trackpad | Tab reaches the link, and Enter activates it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | "Done by the rule "[rule name]", approved by [name] on [date].", one Try again on a failure that names the step and the system, and the line kept when the rule changes. Hyperlinks keep their own colour in contrast themes [WIN-9]. |
| Platform owns | Hyperlink colour [WIN-9]. |
| Not confirmed | Date formats. Haptic guidance. |
