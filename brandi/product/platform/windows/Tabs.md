# Tabs on Windows

Sections of one page or record, with optional counts, built as a custom row because the registry documents no in-page tab control.

```yaml
component: Tabs
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
| Native control | No in-page tab control in the registry's pages. `TabView` appears only as a related link on the NavigationView page [WIN-15]. Closest documented pattern: NavigationView's `Top` pane, whose items take Left and Right and show selection on the bottom edge, though it is meant for top-level navigation [WIN-15]. |
| Target and spacing | Each tab takes the 40 × 40 px touch target [WIN-2]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Accent shows the selected state, used sparingly [WIN-7]. In contrast themes the selected tab takes the highlight pair [WIN-9]. |
| States | Selected and not selected, with the selected tab in `SystemColorHighlightColor` in contrast themes [WIN-9]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each tab is named by its label, with the count in words ("12 overdue") [WIN-19]. Tab and panel control types: not confirmed. |
| Navigation placement | Under the page title, above the panel it switches, in the page content below NavigationView's header [WIN-15]. |
| Keyboard, pointer, trackpad | A single row of items moves with Left and Right [WIN-17]. Ctrl+Tab is the common next-tab shortcut [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Two to seven tabs, each keeping its own scroll and filters, with the open tab in the URL. The selected tab takes `text-strong` with an underline in `primary`, attention counts take the highlight, and the row scrolls sideways when the tabs do not fit. Microsoft's top pane draws its indicator on the bottom edge too [WIN-15]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | A first-party in-page tab control. Tab and panel control types. Overflow scrolling. Haptic guidance. |
