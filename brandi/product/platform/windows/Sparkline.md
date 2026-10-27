# Sparkline on Windows

A tiny trend with its last point marked, inside a MetricCard or a table cell.

```yaml
component: Sparkline
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1 and 2.5.4-experimental
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-4
    url: https://fluent2.microsoft.design/accessibility/
    marker: undated
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
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-19
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-24
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-channels
    marker: 2026-09-29
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Stable WinUI has no chart control in the registry's pages. Windows App SDK 2.5.4-Experimental adds an experimental `Chart` for line, area and bar series, with axes, legends, data labels and data markers [WIN-25]. Experimental APIs may change, be removed or never ship [WIN-24]. A sparkline would be a `LineSeries` with its axes hidden. Whether the experimental `Chart` can hide its axes: not confirmed. |
| Target and spacing | Not pressable. Layout in multiples of 4 epx [WIN-16]. |
| Type | None. A sparkline has no axes and no text of its own, so text scaling has nothing to resize [WIN-6]. |
| Colour and theme | Kept in one series colour at 3:1 against its surface [FLU-4]. Hard-coded colours break in contrast themes, so map it to a `SystemColor` resource [WIN-9]. |
| States | None. It supports a figure and never stands in for one, and it is never a tab stop [WIN-17]. |
| Motion | None required. Check `UISettings.AnimationsEnabled` before any entrance [WIN-11]. |
| Accessibility API | Narrator through UI Automation. With a label, the trend in words through `AutomationProperties.Name` [WIN-19]. Without one it is decorative, `AccessibilityView` Raw [WIN-19]. |
| Navigation placement | Inside a MetricCard or a table cell, beside the figure it supports. Its size sits on the 4 epx grid [WIN-16]. |
| Keyboard, pointer, trackpad | Not a tab stop, since non-interactive controls never are [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Always in `series-1`, never red or green, its last point marked, no axes, and never a figure's replacement. Keeping red and green out agrees with Microsoft's colour-blindness guidance [WIN-7]. |
| Platform owns | Contrast themes, which replace chart colours unless they map to `SystemColor` resources [WIN-9]. |
| Not confirmed | A stable chart control. Hiding axes in the experimental `Chart`. |
