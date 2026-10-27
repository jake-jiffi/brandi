# PhoneTopBar on Windows

A detail screen's top bar with Back and the screen's title, built on the WinUI `TitleBar`.

```yaml
component: PhoneTopBar
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
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
    read: 2026-10-27
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
    read: 2026-10-27
  - key: WIN-8
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming
    marker: 2026-02-19
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
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
| Native control | WinUI's `TitleBar` control, which owns the back button and the pane toggle above NavigationView [WIN-15]. The back button is system-provided UI for going back [WIN-13]. |
| Target and spacing | Back takes the 40 × 40 px touch target [WIN-2]. |
| Type | The title in Subtitle or Title [WIN-5] [FLU-3]. Microsoft's truncation guidance conflicts. Typography asks for ellipses in most cases in one table and shows clipping as the Do in another section [WIN-5]. Text scaling prefers clipping, with a tooltip carrying the full text [WIN-6]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes the bar takes `SystemColorWindowColor` [WIN-9]. |
| States | Back enabled or disabled. `IsBackEnabled` can be bound to the frame's `CanGoBack`, and no back request fires while it is false [WIN-15]. |
| Motion | Page transitions are WinUI's own [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Back is named by a text equivalent of its action [WIN-19]. The title is static text [WIN-19]. |
| Navigation placement | Top of the window, above NavigationView [WIN-15]. With `ExtendsContentIntoTitleBar` and `SetTitleBar`, it owns the drag region [WIN-15]. |
| Keyboard, pointer, trackpad | Back raises `BackRequested`, which the app handles [WIN-15]. Esc does not go back, since it only cancels transient UI [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Back and the title only, long names wrapped or cut by the product's rules, and focus moving to the new screen's main region after navigating. Microsoft asks that initial focus land on the most logical element [WIN-17]. |
| Platform owns | Back button events and the drag region [WIN-15]. |
| Not confirmed | Title wrapping in a `TitleBar`. Where focus lands after navigation. Haptic guidance. |
