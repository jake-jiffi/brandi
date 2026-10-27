# BarChart on Windows

Amounts across categories or days, grouped or stacked, drawn by the system because stable WinUI has no chart control.

```yaml
component: BarChart
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1 and 2.5.4-experimental
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: FLU-4
    url: https://fluent2.microsoft.design/accessibility/
    marker: undated
    read: 2026-10-27
  - key: WIN-4
    url: https://learn.microsoft.com/en-us/windows/apps/design/style/spacing
    marker: 2026-10-14
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
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
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
| Native control | Stable WinUI has no chart control in the registry's pages. Windows App SDK 2.5.4-Experimental adds an experimental `Chart` for line, area and bar series, with axes, legends, data labels and data markers [WIN-25]. Experimental APIs may change, be removed or never ship [WIN-24]. Bars there are `BarSeries` [WIN-25]. |
| Target and spacing | Not pressable point by point. Layout in multiples of 4 epx [WIN-16]. |
| Type | Axis and data labels in Caption, 12 on 16 epx [WIN-4] [FLU-3], never below 12 px Regular [WIN-5]. |
| Colour and theme | Series colours need 3:1 against adjacent colours [FLU-4] and never carry meaning alone [WIN-7]. Hard-coded colours break in contrast themes, so map them to `SystemColor` resources [WIN-9]. |
| States | Loading, empty and error. Empty and error text never use `SystemColorGrayTextColor`, which is kept for disabled content [WIN-9]. |
| Motion | None required. Check `UISettings.AnimationsEnabled` before any entrance [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Charts need a text alternative, set through `AutomationProperties.Name` [WIN-19]. The takeaway in words and a hidden table carry the numbers, and Narrator has a tables view [WIN-17]. |
| Navigation placement | Cards and report pages, on a surface, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | The plot takes focus, and Left and Right move through the bars. Microsoft's guidance for custom controls maps arrow keys to spatially related parts [WIN-18]. |
| Haptics | Not confirmed. |
| Brand may change | Stack only when the parts make a whole. Rounded data ends, gaps between stacked parts, series colours in fixed order, direct labels for two to four stacked series, values in the hover and the hidden table, and never a pie or donut. Microsoft's colour-blindness guidance backs the direct labels [WIN-7]. |
| Platform owns | Contrast themes, which replace chart colours unless they map to `SystemColor` resources [WIN-9]. |
| Not confirmed | A stable chart control. Chart text under text scaling. How a focused bar is announced. Haptics. |
