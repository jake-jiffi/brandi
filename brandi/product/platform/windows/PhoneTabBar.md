# PhoneTabBar on Windows

Three to five top-level places at the foot of a phone app, which has no counterpart in Windows' layout guidance.

```yaml
component: PhoneTabBar
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
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
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
| Native control | None. Windows' breakpoint table has no phone class: Small, up to 640 px, is typical of TVs, and Medium of tablets [WIN-16]. Closest pattern: NavigationView's `Top` pane, for five or fewer equal categories [WIN-15]. |
| Target and spacing | Each place takes the 40 × 40 px touch target [WIN-2]. 8 epx between targets [WIN-4]. |
| Type | Body or Caption labels [WIN-4] [FLU-3]. |
| Colour and theme | The selection indicator sits on the bottom edge in Top mode [WIN-15]. In contrast themes the current place takes the highlight pair [WIN-9]. |
| States | Current and not current, one selected at a time [WIN-15]. |
| Motion | Top-level moves use a quick fade, not a slide [FLU-5]. |
| Accessibility API | Narrator through UI Automation. Each place is named by its label, with counts in words [WIN-19]. |
| Navigation placement | Not a Windows pattern. On narrow windows NavigationView collapses to `LeftMinimal`, a menu button [WIN-15]. |
| Keyboard, pointer, trackpad | In Top mode, Left and Right move between items [WIN-15]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Three to five places, the current one marked, counts in words, zero showing nothing, and a per-product decision on whether the tab bar or the action bar owns the foot. On Windows, NavigationView's adaptive modes take its place [WIN-15]. |
| Platform owns | NavigationView's adaptive modes [WIN-15]. |
| Not confirmed | A bottom navigation pattern on Windows. Haptic guidance. |
