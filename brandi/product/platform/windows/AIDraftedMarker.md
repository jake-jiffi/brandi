# AIDraftedMarker on Windows

One line on a draft saying who asked for it and how the brand check went.

```yaml
component: AIDraftedMarker
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
| Native control | No control. A `TextBlock` [WIN-19], with a `Hyperlink` to the issues when there are any [WIN-17]. |
| Target and spacing | The issues link takes the 40 × 40 px touch target where it stands alone [WIN-2]. |
| Type | Caption, 12 on 16 epx [WIN-4] [FLU-3]. |
| Colour and theme | In contrast themes, never `SystemColorGrayTextColor`, since secondary text has to stay readable [WIN-9]. The link takes `SystemColorHotlightColor` [WIN-9]. |
| States | Passed, issues, checking, not checked and edited, each in words [WIN-7]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The line describes the draft, so it goes in `AutomationProperties.HelpText` on the draft, which Narrator reads on demand with CapsLock+F [WIN-19]. It is not a live region. |
| Navigation placement | On the draft, as its description [WIN-19]. |
| Keyboard, pointer, trackpad | Only the issues link is focusable. Tab reaches it, and Enter activates it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | "Drafted with AI by [name], brand check passed", the five states, and an auto-draft naming its trigger in place of a person. On Windows, help text is the accessible description [WIN-19]. |
| Platform owns | Narrator's on-demand reading of help text [WIN-19]. |
| Not confirmed | Whether help text is the right home for a description people should hear at once. Haptic guidance. |
