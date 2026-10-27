# Dialog on Windows

A focused decision or a short form over the page, built on the WinUI `ContentDialog`.

```yaml
component: Dialog
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
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
  - key: FLU-5
    url: https://fluent2.microsoft.design/motion/
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
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
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
| Native control | WinUI `ContentDialog`, never the deprecated `MessageDialog` [WIN-14]. Set its `XamlRoot` before `ShowAsync`, or it throws [WIN-14]. Only one may be open per window [WIN-14]. |
| Target and spacing | Buttons take the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | The title is the main instruction and is optional, and the content is required and puts the message plainly [WIN-14]. Body for content [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | Corners 8 px through `OverlayCornerRadius` [WIN-12]. In contrast themes, popups take `SystemColorWindowColor`, with a 2 px border on transitory surfaces such as flyouts and dialogs [WIN-9]. `DefaultButton` takes the Accent Button visual treatment [WIN-14]. |
| States | Open or closed. `ShowAsync` returns `ContentDialogResult` Primary, Secondary or None [WIN-14]. |
| Motion | Enter and exit, Fluent's pattern for dialogs [FLU-5]. Built-in control motion [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Buttons are named by their text [WIN-19] [WIN-20]. The dialog blocks the app window until it is dismissed [WIN-14]. Focus must not be lost when it closes [FLU-4]. |
| Navigation placement | Over the app window, modal [WIN-14]. `PrimaryButton` leftmost, `SecondaryButton` in the middle, `CloseButton` rightmost [WIN-14]. A confirmation puts the affirmative button on the left and Cancel on the right [WIN-14]. |
| Keyboard, pointer, trackpad | Esc, the system back button and Gamepad B all trigger `CloseButton` [WIN-14]. `DefaultButton` answers Enter, and takes focus on open unless the content holds focusable UI [WIN-14]. Arrow keys move between the buttons, and each is also a tab stop [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | A question with the thing and the count ("Delete 3 draft invoices?"), and a primary that repeats the verb with the count. Destructive confirms take `danger-solid`, account changes show before and after, and up to five fields fit. Never a dialog on a dialog, which one-per-window enforces [WIN-14]. Never for validation errors, which stay inline [WIN-14]. |
| Platform owns | Button positions and their keys [WIN-14]. One dialog per window [WIN-14]. Contrast theme colours [WIN-9]. |
| Not confirmed | Dialog width options. Closing on a click outside. The title's text style. A full-screen form at small window sizes. Haptic guidance. |
