# HBarChart on Windows

A ranked top N as horizontal bars with direct labels and values.

```yaml
component: HBarChart
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
| Native control | Stable WinUI has no chart control in the registry's pages. Windows App SDK 2.5.4-Experimental adds an experimental `Chart` for line, area and bar series, with axes, legends, data labels and data markers [WIN-25]. Experimental APIs may change, be removed or never ship [WIN-24]. Horizontal bars there are `BarSeries` with `BarOrientation` [WIN-25]. |
| Target and spacing | Not pressable point by point. Layout in multiples of 4 epx [WIN-16]. |
| Type | Labels and values in Body or Caption [WIN-4] [FLU-3], never below 12 px Regular [WIN-5]. |
| Colour and theme | Series colours need 3:1 against adjacent colours [FLU-4] and never carry meaning alone [WIN-7]. Hard-coded colours break in contrast themes, so map them to `SystemColor` resources [WIN-9]. |
| States | Empty, shown by itself when there is no data. Empty text never uses `SystemColorGrayTextColor` [WIN-9]. |
| Motion | None required. Check `UISettings.AnimationsEnabled` before any entrance [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Charts need a text alternative [WIN-19], and here it is an ordered list with each label read with its value. Narrator can read it item by item [WIN-17]. |
| Navigation placement | Cards and report pages, on a surface, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | The product's chart contract moves through the points with Left and Right, Home and End. Microsoft maps arrow keys to a control's visual orientation [WIN-18], so Up and Down should also step through the stacked bars. |
| Haptics | Not confirmed. |
| Brand may change | Sorted descending, ten rows at most, the rest as "Other" or a link to the full table, and direct labels and values. Microsoft's colour-blindness guidance backs the direct labels [WIN-7]. |
| Platform owns | Contrast themes, which replace chart colours unless they map to `SystemColor` resources [WIN-9]. |
| Not confirmed | A stable chart control. Exposing the bars as an ordered list. Haptics. |
