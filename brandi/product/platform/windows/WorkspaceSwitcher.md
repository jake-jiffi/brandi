# WorkspaceSwitcher on Windows

The menu for choosing the account, workspace or client someone is working in.

```yaml
component: WorkspaceSwitcher
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: FLU-5
    url: https://fluent2.microsoft.design/motion/
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
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
| Native control | A `MenuFlyout` [WIN-12] from the account item in NavigationView's footer, where Microsoft's sample puts an Account item [WIN-15]. |
| Target and spacing | Items take the 40 × 40 px touch target [WIN-2]. 8 epx between the trigger and its flyout [WIN-4]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Overlay corners 8 px [WIN-12]. In contrast themes, the current workspace takes the highlight pair and the surface a 2 px border [WIN-9]. |
| States | The current workspace marked, the others, and disabled ones, with the highlight pair in contrast themes [WIN-9]. |
| Motion | Enter and exit [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The trigger is named "[name], [role], account menu" [WIN-19]. Item control types: not confirmed. |
| Navigation placement | NavigationView's `FooterMenuItems` or `PaneFooter` [WIN-15]. |
| Keyboard, pointer, trackpad | Up and Down move through items, cycling in the popup [WIN-17]. Esc closes it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | It opens from the account button, the current workspace shows on every screen, and switching says where the person is now. Microsoft's popup keyboard model applies [WIN-17]. |
| Platform owns | Popup behaviour [WIN-17]. |
| Not confirmed | How the switch is announced. Menu item control types. Haptic guidance. |
