# Field on Windows

One input wired to its label, hint and error, built from plain parts because WinUI has no field wrapper.

```yaml
component: Field
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
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
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
| Native control | No field control in the registry's pages. The label is a `TextBlock` that the input points to through `AutomationProperties.LabeledBy` [WIN-19]. Hints and errors sit inline on the page, never in a dialog [WIN-14]. |
| Target and spacing | 8 epx between a control and its header, 12 epx between a control and its label [WIN-4]. The input takes the 40 × 40 px touch target [WIN-2]. |
| Type | Label and hint in Body, 14 on 20 epx [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. Text scales to 225%, so hint and error text has to wrap [WIN-6]. |
| Colour and theme | In contrast themes the label takes `SystemColorWindowTextColor` [WIN-9]. Never `SystemColorGrayTextColor` for hint text, which is kept for disabled content [WIN-9]. An error needs more than colour, for people with red-green colour blindness [WIN-7]. |
| States | Default, focused, invalid and disabled. A disabled input leaves the tab order [WIN-18] and takes `SystemColorGrayTextColor` in contrast themes [WIN-9]. Invalid styling: not confirmed. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. The name matches the visible label, through `AutomationProperties.LabeledBy` [WIN-19]. Hint or error text goes in `AutomationProperties.HelpText`, which Narrator reads on demand with CapsLock+F [WIN-19]. How a new error is announced: not confirmed. |
| Navigation placement | Form content. Validation errors stay on the page canvas next to the field, never in a dialog [WIN-14]. |
| Keyboard, pointer, trackpad | The label is not a tab stop, and the input is [WIN-17]. Tab order runs top to bottom and left to right, by locale [WIN-17]. Narrator reads labels with Caps Lock plus the arrow keys [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Labels above inputs, in sentence case with no colon. Optional fields marked, required ones not. An error replaces the hint, says what is wrong and how to fix it, carries an icon, and appears when the person leaves the field or saves, never while they type. Microsoft's header and label spacing applies [WIN-4]. |
| Platform owns | Text scaling [WIN-6]. Contrast theme colours [WIN-9]. |
| Not confirmed | A header property on WinUI inputs. How a new error is announced to Narrator. How required state reaches UI Automation. Invalid styling. |
