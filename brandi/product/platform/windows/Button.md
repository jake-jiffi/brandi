# Button on Windows

The pressable action, built on the WinUI `Button`.

```yaml
component: Button
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: FLU-5
    url: https://fluent2.microsoft.design/motion/
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
  - key: WIN-8
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/theming
    marker: 2026-02-19
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
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
  - key: WIN-20
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportbuttoncontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | WinUI `Button`, raised by a `Click` event or a `Command` binding [WIN-13]. The `link` variant, and any button with `href`, is a `HyperlinkButton`, because navigation is not an action [WIN-13]. In a ContentDialog, `DefaultButton` gives one button the Accent Button visual treatment [WIN-14]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. Minimum width 120 px for short labels [WIN-13]. 8 epx between buttons [WIN-4]. Sizes, margins and positions in multiples of 4 epx [WIN-16]. A destructive button takes more padding and sits further from the content edge [WIN-2]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. A brand face is allowed when the brand guidelines ask for one [WIN-13]. Sentence case [WIN-5]. Past 26 characters, widen, stack or wrap [WIN-13]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | `SystemAccentColor` follows the user's setting. The app may override it in App.xaml and must check the contrast [WIN-8]. Accent used sparingly [WIN-7]. Lightweight styling recolours a button through `ButtonBackground`, `ButtonBackgroundPointerOver` and `ButtonBackgroundPressed` [WIN-8]. In contrast themes, `SystemColorButtonFaceColor` with `SystemColorButtonTextColor`, `SystemColorHighlightColor` with `SystemColorHighlightTextColor` for hover and press, and `SystemColorGrayTextColor` when disabled [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Rest, pointer over and pressed through theme resources [WIN-8]. Disabled leaves the tab order [WIN-18]. Keyboard focus draws a 2 px outer and 1 px inner border, 1 px outside the control [WIN-3]. Keep control template changes to design intent [WIN-3]. The full state list: not confirmed. |
| Motion | Built-in control motion, no custom animation [WIN-10]. Fluent's elevation transition covers button states [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Control type Button, self-labelled by its content [WIN-20]. Name from the visible text, never including the word "button" [WIN-19]. Invoke pattern, never with Toggle [WIN-20]. Help text says what activation does [WIN-20]. |
| Navigation placement | Page content, dialogs and command areas. Commit order for one decision: OK, Do it or Yes first, then Don't do it or No, then Cancel [WIN-13]. One or two buttons at a time [WIN-13]. A lone button right-aligns in a dialog or container and left-aligns on a page [WIN-13]. An action needed on many pages goes in a bottom app bar [WIN-13]. |
| Keyboard, pointer, trackpad | Enter or Space raises Click on the focused button. `ClickMode` defaults to Release, and Hover cannot be raised by keyboard or touch [WIN-13]. Commit buttons get access keys, Alt plus a letter [WIN-17]. Never put initial focus on a destructive button [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The variants and their jobs: primary once per view, secondary by default, then ghost, brand, danger, danger-solid and link. Labels of one to three words, verb first, never "Submit", "OK" or "Click here". Loading keeps the width and the focus and shows a spinner. Accent and lightweight styling brushes [WIN-8] and the focus visual brushes [WIN-3] carry the colours. The product's pressable shape departs from the 4 px `ControlCornerRadius` default [WIN-12], and the product's guidelines apply (2.3). |
| Platform owns | Commit order, with the "do it" button first and the safe action last [WIN-13] [WIN-14]. The product never shares one order across platforms, so its web order (Cancel immediately left of the primary) stays on the web. Activation keys [WIN-13]. Contrast theme colours [WIN-9]. Text scaling [WIN-6]. |
| Not confirmed | The accent button style's resource key outside dialogs. The full visual state list. A per-control corner radius, since the Geometry page documents only the two global resources. How a busy button is exposed to UI Automation. Subtle styling for the ghost variant. What built-in controls change when animations are off. Haptic guidance. |
