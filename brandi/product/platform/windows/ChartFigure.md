# ChartFigure on Windows

A chart's frame: a heading, the takeaway in one sentence, the chart, and the same numbers as a hidden table.

```yaml
component: ChartFigure
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
| Native control | No figure control. A heading `TextBlock`, the chart, and a hidden table, since charts need a text alternative [WIN-19]. The experimental `Chart` can sit inside [WIN-25], though experimental APIs may change or never ship [WIN-24]. |
| Target and spacing | Not pressable. 12 epx between the heading, the takeaway and the chart [WIN-4]. |
| Type | Heading in Subtitle or Body Strong, and the takeaway in Body [WIN-4] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Series colours are checked at 3:1 against the surface [FLU-4]. In contrast themes, map chart colours to `SystemColor` resources [WIN-9]. |
| States | The chart's own states. Empty and error text never use `SystemColorGrayTextColor` [WIN-9]. |
| Motion | None of its own. Check `UISettings.AnimationsEnabled` before any chart entrance [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The takeaway is the figure's accessible description, which is `AutomationProperties.HelpText` on Windows [WIN-19]. The hidden table's first column names each row, and Narrator has a tables view [WIN-17]. |
| Navigation placement | Cards and report pages, on a surface, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Arrow keys move through the points inside the chart, the way Microsoft maps keys for custom controls [WIN-18]. |
| Haptics | Not confirmed. |
| Brand may change | A heading that names the chart, one sentence of takeaway, the system's own drawing with arrow keys and announced values, a hidden table, and series colours in fixed order on a surface. Microsoft's call for a text alternative on charts backs the hidden table [WIN-19]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | A stable chart control. Hiding a table from sight while Narrator still reads it. Heading semantics. Haptics. |
