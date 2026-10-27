# Menu on Windows

Actions on one thing from an overflow button or any trigger, built on the WinUI `MenuFlyout`.

```yaml
component: Menu
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-19
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-20
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportbuttoncontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | WinUI `MenuFlyout` with `MenuFlyoutItem`s [WIN-13] [WIN-17], attached through a button's `Flyout` property, as `DropDownButton` does [WIN-13]. |
| Target and spacing | Items take the 40 × 40 px touch target [WIN-2]. 8 epx between a button and its flyout [WIN-4]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Corners 8 px through `OverlayCornerRadius`, with no rounding on the side joined to the trigger [WIN-12]. In contrast themes, popups take `SystemColorWindowColor` with a 2 px border, and the item in hand takes the highlight pair [WIN-9]. |
| States | Item in hand, checked and disabled. In contrast themes the item in hand takes `SystemColorHighlightColor` with `SystemColorHighlightTextColor` [WIN-9]. |
| Motion | Enter and exit [FLU-5]. Surfaces that share an entry point open and close the same way [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The trigger is a button named by its label ("More actions for [record]") [WIN-19] [WIN-20]. Item control types and the trigger's expanded state: not confirmed. |
| Navigation placement | Anchored to its trigger. Set the flyout's `Placement`, since the default algorithm may not place it as intended [WIN-13]. |
| Keyboard, pointer, trackpad | Up and Down move focus inside a `MenuFlyout` [WIN-17]. On opening, Down goes to the first item and Up to the last, and focus cycles at the ends [WIN-17]. Esc closes it [WIN-17]. Accelerators are documented beside items [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Six items or fewer, with destructive items last after a separator, opening a confirmation. Disabled items stay visible, single-key item shortcuts work while it is open, and the item in hand shows a visible edge and a ring from the keyboard. Microsoft documents shortcuts in menus too [WIN-17]. |
| Platform owns | Popup cycling and Esc [WIN-17]. Contrast theme colours [WIN-9]. |
| Not confirmed | Menu item control types. What Tab does inside an open `MenuFlyout`. Checked and destructive item styles. Haptic guidance. |
