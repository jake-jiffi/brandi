# ShareBar on Windows

Shares of a whole as one segmented bar with a legend that prints every share.

```yaml
component: ShareBar
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
| Native control | No share or proportion control. The experimental `Chart` covers line, area and bar series only [WIN-25], so a segmented share bar stays custom. Experimental APIs may change, be removed or never ship [WIN-24]. |
| Target and spacing | Not pressable. Layout in multiples of 4 epx [WIN-16]. |
| Type | The legend in Body or Caption [WIN-4] [FLU-3], never below 12 px Regular [WIN-5]. |
| Colour and theme | Series colours need 3:1 against adjacent colours [FLU-4] and never carry meaning alone [WIN-7]. Hard-coded colours break in contrast themes, so map them to `SystemColor` resources [WIN-9]. |
| States | Empty, shown by itself when no share is above zero. Empty text never uses `SystemColorGrayTextColor` [WIN-9]. |
| Motion | None required. Check `UISettings.AnimationsEnabled` before any entrance [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Charts need a text alternative [WIN-19], and the legend that prints every share is that alternative. Narrator can read it item by item [WIN-17]. |
| Navigation placement | Cards and report pages, on a surface, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Where the plot takes focus, arrow keys move through the segments, the way Microsoft maps keys for custom controls [WIN-18]. |
| Haptics | Not confirmed. |
| Brand may change | One segmented bar, a legend that prints every share, zero and negative values left out, and a stand-in for the pie and donut charts the system never uses. Each share in words keeps the meaning off colour alone [WIN-7]. |
| Platform owns | Contrast themes, which replace chart colours unless they map to `SystemColor` resources [WIN-9]. |
| Not confirmed | A first-party proportion control. Haptics. |
