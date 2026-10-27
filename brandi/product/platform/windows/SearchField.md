# SearchField on Windows

A field that filters what is on screen as the person types, built on `AutoSuggestBox` or a plain `TextBox`.

```yaml
component: SearchField
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
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-18
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility
    marker: 2026-10-04
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
| Native control | WinUI `AutoSuggestBox` [WIN-8] [WIN-17], the control NavigationView hosts for app-level search [WIN-15]. A plain `TextBox` when nothing is suggested [WIN-17]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. Sizes, margins and positions in multiples of 4 epx [WIN-16]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | `AutoSuggestBox` adjusts its contrast for light and dark through theme brushes [WIN-8]. In contrast themes, the field takes the `SystemColorButtonFaceColor` pair and placeholder text `SystemColorWindowTextColor` [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Rest, focused, typing, suggestions open and disabled. The open list is a popup menu [WIN-17]. Disabled leaves the tab order [WIN-18]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The name says what is searched ("Search clients"), set through `AutomationProperties.Name` [WIN-19]. Narrator has a suggestions view, and reaches the search button with Caps Lock plus an arrow key [WIN-17]. |
| Navigation placement | First in the toolbar above the table or list it filters. App-wide search lives in NavigationView's `AutoSuggestBox` slot [WIN-15], which in this product belongs to the ask bar and the command menu. |
| Keyboard, pointer, trackpad | Enter submits the query, so the search button is not a tab stop [WIN-17]. Space does not choose a suggestion [WIN-17]. In the open list, Down goes to the first suggestion and Up to the last, and focus cycles at the ends [WIN-17]. Ctrl+F is the common Find shortcut [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | A placeholder that names what is searched, and a single-key shortcut such as "/" that focuses the field, except while someone types elsewhere or when Root turns shortcuts off. Single-key shortcuts go beyond Microsoft's accelerators, which use Ctrl [WIN-17], and the product's guidelines apply (2.3). |
| Platform owns | Enter to submit, and the search button's place outside the tab order [WIN-17]. Contrast theme colours [WIN-9]. |
| Not confirmed | `AutoSuggestBox`'s UI Automation control type. Clear button behaviour. Filtering as you type with no submit. Haptic guidance. |
