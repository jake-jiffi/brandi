# AvatarGroup on Windows

Overlapping avatars for the people on a record, with a count for the rest.

```yaml
component: AvatarGroup
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
  - key: WIN-8
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming
    marker: 2026-02-19
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
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
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
| Native control | No control. Avatars in a horizontal stack, as the theming sample lays out its picture and text [WIN-8], with the "+N" as text. Overlap: not confirmed. |
| Target and spacing | The "+N" takes the 40 × 40 px touch target if it opens anything [WIN-2]. Sizes on the 4 epx grid [WIN-16]. |
| Type | The count in Caption, 12 on 16 epx, the style for very confined spaces [WIN-4] [FLU-3]. |
| Colour and theme | As Avatar. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. |
| States | None of its own. In contrast themes it keeps the window colours above [WIN-9]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The group reads as one name listing the people, or the visible ones plus "and 3 more" with their names, through `AutomationProperties.Name` [WIN-19]. A tooltip names the hidden people on hover [WIN-13]. |
| Navigation placement | Record headers, list rows and table cells. In a multi-line list row, pictures sit at 32 epx [WIN-4]. |
| Keyboard, pointer, trackpad | Not focusable. If the "+N" opens a list, it becomes a `Button` and gains keyboard activation [WIN-18]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | The overlap, four visible by default, and the hidden people named on hover and to screen readers. Microsoft asks that pointer-only behaviour have a keyboard equal [WIN-18], which a hover-only list lacks. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | An overlapping layout. Keyboard access to the hidden names. A first-party person picture control. |
