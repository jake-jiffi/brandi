# DescriptionList on Windows

Label and value pairs for a record's details, in two columns or stacked.

```yaml
component: DescriptionList
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
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
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
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
| Native control | No control. Label and value `TextBlock`s in a `Grid` with `Auto` and `*` columns [WIN-6]. |
| Target and spacing | Not pressable. 12 epx between content areas [WIN-4]. |
| Type | Labels and values in Body, 14 on 20 epx [WIN-5] [FLU-3]. Values wrap as text scales [WIN-6]. |
| Colour and theme | Labels in a quieter theme brush [WIN-8]. In contrast themes, both take `SystemColorWindowTextColor`, since `SystemColorGrayTextColor` is only for disabled content [WIN-9]. |
| States | None. Static text has no interactive states, and in contrast themes it takes `SystemColorWindowTextColor` [WIN-9]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Static text, named by its own words [WIN-19]. Narrator can read it by item or by line [WIN-17]. |
| Navigation placement | Record detail panes. A grid's visual order can differ from its reading order, so test it [WIN-18]. |
| Keyboard, pointer, trackpad | Not tab stops, since labels and static text never are [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Labels in `text-subtle`, values in `text`, "Not set" for a missing value, and stacking under the product's 420 px threshold. Microsoft keeps grey system text for disabled content [WIN-9], so `text-subtle` maps to a theme brush, never `SystemColorGrayTextColor`. |
| Platform owns | Contrast theme colours [WIN-9]. Text scaling [WIN-6]. |
| Not confirmed | A layout that stacks by its own width. How Narrator pairs a label with its value. |
