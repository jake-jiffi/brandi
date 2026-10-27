# Banner on Windows

A one-line alert across the top of the page's content, under the header.

```yaml
component: Banner
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
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
| Native control | Closest WinUI control: `InfoBar`, named in the Windows App SDK release notes' API lists [WIN-25], with no guidance in the registry. It sits under NavigationView's header [WIN-15]. |
| Target and spacing | Its buttons take the 40 × 40 px touch target [WIN-2]. It spans the content area inside the 24 px margins, or 12 px in Minimal mode [WIN-15]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Wraps as text scales [WIN-6]. |
| Colour and theme | Tones never carry meaning alone [WIN-7]. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. |
| States | Shown or dismissed. In contrast themes it takes the window colours [WIN-9]. |
| Motion | Enter and exit is Fluent's pattern for elements that appear and disappear [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Static text [WIN-19], and a dismiss button named through `AutomationProperties.Name` [WIN-19]. A banner already there on arrival stays quiet, and one that appears because something broke speaks up. How either reaches Narrator: not confirmed. |
| Navigation placement | Under the page header, one at a time [WIN-15]. |
| Keyboard, pointer, trackpad | Its buttons take Enter or Space [WIN-13]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | One at a time, and dismissible unless the state still applies. Under a down source the last good data stays, marked with its time. Offline is a neutral banner saying changes will save when the connection is back. The header slot above it is NavigationView's [WIN-15]. |
| Platform owns | The header's position [WIN-15]. Contrast theme colours [WIN-9]. |
| Not confirmed | `InfoBar` guidance and automation. How a banner is announced. Haptic guidance. |
