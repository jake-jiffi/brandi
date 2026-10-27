# MultiSelect on Windows

Several options shown as removable tokens, such as assignees, categories or people to invite.

```yaml
component: MultiSelect
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
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
  - key: WIN-22
    url: https://learn.microsoft.com/en-us/windows/apps/design/controls/listview-and-gridview
    marker: 2026-09-19
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No token box in the registry's pages. Closest pattern: an `AutoSuggestBox` [WIN-17] with the chosen values as tokens, each with a remove `Button` [WIN-13]. A `ListView` in `Multiple` mode is the documented way to pick several [WIN-22], and a button's flyout can hold one [WIN-13]. |
| Target and spacing | Remove buttons take the 40 × 40 px touch target [WIN-2]. 8 epx between tokens [WIN-4]. |
| Type | Body for the input and Caption for tokens [WIN-4] [FLU-3]. |
| Colour and theme | Tokens never rely on colour alone [WIN-7]. In contrast themes, token remove buttons take the `SystemColorButtonFaceColor` pair [WIN-9]. |
| States | Empty, typing, list open, holding tokens, and disabled, which leaves the tab order [WIN-18]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Remove buttons show only an icon, so `AutomationProperties.Name` says "Remove [value]" [WIN-19] [WIN-20]. Name for the field from its label through `AutomationProperties.LabeledBy` [WIN-19]. |
| Navigation placement | Forms and filters, with the header above at 8 epx [WIN-4]. |
| Keyboard, pointer, trackpad | In `Multiple` mode, Space or a click picks the focused item, and arrow keys move focus without changing what is picked. Shift with a click or the arrows picks a run [WIN-22]. Ctrl+A selects all [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Everything Combobox holds, tokens with a remove button named "Remove [value]", and Backspace in the empty input removing the last token. The product's small remove target off touch departs from Microsoft's 7.5 mm target [WIN-2], and the product's guidelines apply (2.3). |
| Platform owns | List selection behaviour [WIN-22]. |
| Not confirmed | A first-party token box. Backspace behaviour in `AutoSuggestBox`. Haptic guidance. |
