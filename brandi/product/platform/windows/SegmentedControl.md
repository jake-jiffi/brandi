# SegmentedControl on Windows

Two to five views of the same content, one chosen at a time, built as a restyled radio group because the registry names no segmented control.

```yaml
component: SegmentedControl
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
  - key: WIN-3
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-visualfeedback
    marker: 2026-09-27
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
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
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
| Native control | None in the registry's WinUI pages. Closest pattern: a `RadioButtons` group styled as segments, with one tab stop and arrow keys between options [WIN-17]. |
| Target and spacing | Each option takes the 40 × 40 px touch target [WIN-2]. Sizes, margins and positions in multiples of 4 epx [WIN-16]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. Text scales to 225%, so options have to grow with it [WIN-6]. |
| Colour and theme | Accent marks the state of an interactive control, used sparingly [WIN-7]. In contrast themes the chosen option takes `SystemColorHighlightColor` with `SystemColorHighlightTextColor`, and the rest the `SystemColorButtonFaceColor` pair [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Chosen, not chosen, pointer over, pressed and disabled, with the contrast pairs above [WIN-9]. Keep control template changes to design intent [WIN-3]. |
| Motion | The selection moving between options is point-to-point motion: cubic-bezier(0.55,0.55,0,1) at 167, 250 or 333 ms [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each option is named by its visible text [WIN-19]. Each option's control type, and how the group's name reaches Narrator: not confirmed. |
| Navigation placement | Above the content it switches, in page content or a toolbar. Moving between pages is NavigationView's job [WIN-15]. |
| Keyboard, pointer, trackpad | One tab stop for the group. Arrow keys move between options, Home goes to the first and End to the last [WIN-17]. On a custom group, `XYFocusKeyboardNavigation`, `TabFocusNavigation`, `FindFirstFocusableElement` and `FindLastFocusableElement` build this [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Two to five options and a change of view at once, never pages (Tabs) or settings (RadioGroup). The selection fades instead of sliding when animations are off. The pressable shape departs from the 4 px `ControlCornerRadius` default [WIN-12], and the product's guidelines apply (2.3). |
| Platform owns | Contrast theme colours [WIN-9]. Text scaling [WIN-6]. |
| Not confirmed | A first-party segmented control. Each option's UI Automation control type. Whether arrow keys in `RadioButtons` move the choice or only the focus. Haptic guidance. |
