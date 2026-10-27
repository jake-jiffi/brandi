# Delta on Windows

Change against a comparison, shown as an arrow and a value and read as one judgement.

```yaml
component: Delta
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
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
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No control. An arrow icon and a `TextBlock` [WIN-19]. |
| Target and spacing | Not pressable. On the 4 epx grid [WIN-16]. |
| Type | Body or Caption, 14 on 20 or 12 on 16 epx [WIN-5] [FLU-3]. The value scales with text, and the arrow, a font icon, does not [WIN-6]. |
| Colour and theme | Good, bad and flat colours never carry the judgement alone [WIN-7]. In contrast themes, `SystemColorWindowTextColor` [WIN-9]. |
| States | Good, bad and flat, each said in words, since red and green alone fail colour-blind people [WIN-7]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. One name for the whole thing, such as "Up 6.2%, better vs last month", through `AutomationProperties.Name` [WIN-19]. The arrow is decorative, `AccessibilityView` Raw [WIN-19]. |
| Navigation placement | Inside MetricCard and table cells. Microsoft aligns text left by default [WIN-5], and the product right-aligns figures in tables. |
| Keyboard, pointer, trackpad | Not a tab stop, since non-interactive controls never are [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Success when good, danger when bad, and neutral when flat or neither, always with the comparison named. Costs, overdue amounts and churn are good when down, and a change in a rate is in points ("3 pts"). Microsoft's colour-blindness guidance backs the words [WIN-7]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | Tabular figures in Segoe UI Variable. |
