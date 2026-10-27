# FormRow on Windows

Two or three short fields side by side in a `Grid`, dropping to one column when space runs out.

```yaml
component: FormRow
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
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
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
| Native control | No row control. A `Grid` with `Auto` and `*` columns, so the platform sizes them [WIN-6]. |
| Target and spacing | Each input takes the 40 × 40 px touch target [WIN-2]. 12 epx between content areas [WIN-4]. |
| Type | Labels and inputs in Body, 14 on 20 epx [WIN-5] [FLU-3]. As text scales to 225% the columns have to give way [WIN-6]. |
| Colour and theme | Its fields' own colours. In contrast themes, labels take `SystemColorWindowTextColor` [WIN-9]. |
| States | None of its own. Each control inside draws its own states, and a disabled one leaves the tab order [WIN-18]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. The row exposes no name, and each field carries its own label [WIN-19]. |
| Navigation placement | Form content, for fields that belong together, such as suburb, state and postcode. Grid layouts can split visual order from tab order, so test both [WIN-18]. |
| Keyboard, pointer, trackpad | Tab runs left to right, then down, by locale [WIN-17]. Grids are a common source of mismatch between reading order and focus order [WIN-18]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Only fields that belong together, and the drop to one column when a field would get too narrow. Windows' breakpoints are window widths, at 640 and 1008 px [WIN-16], while the product measures the row's own width. |
| Platform owns | Text scaling [WIN-6]. |
| Not confirmed | A layout that responds to a container's width rather than the window's. The gap between side-by-side fields. |
