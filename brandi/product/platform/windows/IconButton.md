# IconButton on Windows

An icon-only button, named by its label and explained by a tooltip, built on the WinUI `Button`.

```yaml
component: IconButton
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-4
    url: https://fluent2.microsoft.design/accessibility/
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
| Native control | WinUI `Button` with icon content such as a `FontIcon` [WIN-13], and its tooltip through `ToolTipService.ToolTip`, as the DropDownButton and SplitButton samples set it [WIN-13]. |
| Target and spacing | Touch target 7.5 mm, which is 40 × 40 px at 135 PPI and 1.0x scale [WIN-2]. 8 epx between buttons [WIN-4]. Sizes, margins and positions in multiples of 4 epx [WIN-16]. |
| Type | No visible text. The tooltip text follows the ramp [WIN-5] and scales with text [WIN-6]. Font icons used for emphasis or decoration keep their size, `IsTextScaleFactorEnabled` false [WIN-6]. |
| Colour and theme | Lightweight styling through `ButtonBackground`, `ButtonBackgroundPointerOver` and `ButtonBackgroundPressed`, as on any button [WIN-8]. The icon needs 3:1 against adjacent colours [FLU-4]. In contrast themes, `SystemColorButtonFaceColor` with `SystemColorButtonTextColor`, `SystemColorHighlightColor` with `SystemColorHighlightTextColor` for hover and press, and `SystemColorGrayTextColor` when disabled [WIN-9]. Corners 4 px through `ControlCornerRadius` [WIN-12]. |
| States | Rest, pointer over, pressed and disabled through theme resources [WIN-8]. Disabled leaves the tab order [WIN-18]. Keyboard focus draws a 2 px outer and 1 px inner border, 1 px outside the control [WIN-3]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Control type Button [WIN-20]. A button that shows only an image takes its name from `AutomationProperties.Name`, a text version of its action without the word "button" [WIN-19]. An image-labelled button must carry that alternate text [WIN-20]. Help text matches the tooltip and says what activation does [WIN-20]. |
| Navigation placement | Toolbars, rows and headers. In a `CommandBar`, people expect arrow keys between its `AppBarButtons` [WIN-17]. |
| Keyboard, pointer, trackpad | Enter or Space raises Click [WIN-13]. In a related group, arrow keys can move between buttons through `XYFocusKeyboardNavigation` [WIN-17]. Accelerators are documented in tooltips [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Which actions earn an icon alone (more, close, refresh, copy, previous, next), a label that names what it acts on ("More actions for [record]"), and ghost as the default variant. The pressable shape departs from the 4 px `ControlCornerRadius` default [WIN-12], and the product's guidelines apply (2.3). |
| Platform owns | The tooltip service [WIN-13]. Activation keys [WIN-13]. Contrast theme colours [WIN-9]. |
| Not confirmed | Tooltip delay, placement and keyboard behaviour. Subtle styling for the ghost variant. Whether a functional icon should scale with text. Haptic guidance. |
