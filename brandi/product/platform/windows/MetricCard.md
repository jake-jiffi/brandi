# MetricCard on Windows

A headline figure with its label, a delta, an optional trend and a footnote, shown inside a Card.

```yaml
component: MetricCard
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
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
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
| Native control | No control. A card holding text, a delta and a sparkline. The hint is an info `Button` with an attached flyout [WIN-13]. |
| Target and spacing | The info button takes the 40 × 40 px touch target [WIN-2]. 16 epx between the card's edge and its text [WIN-4]. |
| Type | The figure in Title, 28 on 36 epx, or Large Title, 40 on 52, for a hero [WIN-5] [FLU-3]. Label and footnote in Body or Caption [WIN-5]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | Delta colours never carry the judgement alone [WIN-7]. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. |
| States | Ready, loading and unavailable. Unavailable text never uses `SystemColorGrayTextColor`, which is kept for disabled content [WIN-9]. |
| Motion | None of its own. The flyout's entrance and exit are built in [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Label, value and delta read in words [WIN-19]. The info button shows only an icon, so it takes `AutomationProperties.Name` [WIN-19]. The sparkline is decorative unless it has a label [WIN-19]. |
| Navigation placement | Page content, in a row of cards. A flyout sits 8 epx from its button [WIN-4]. |
| Keyboard, pointer, trackpad | Enter or Space on the info button opens the hint [WIN-13], and Esc closes it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | One hero per row, tabular figures, a label that says exactly what is counted, figures rounded on cards and exact in tables, and `unavailable` with a last-answered time when a source is down. The hint also opens on hover after a short delay, which goes beyond the click that opens a button's flyout [WIN-13]. The product's guidelines apply (2.3). |
| Platform owns | Flyout dismissal by Esc [WIN-17]. Contrast theme colours [WIN-9]. |
| Not confirmed | Tabular figures in Segoe UI Variable. A hover-opened flyout. How the figure shrinks with its card. Haptic guidance. |
