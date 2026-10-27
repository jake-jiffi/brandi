# Toast on Windows

A brief confirmation after an action, with Undo when it can be reversed, built as a custom surface because the registry names no in-app toast.

```yaml
component: Toast
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
| Native control | No in-app toast control in the registry's pages. The release notes list `AppNotification` APIs [WIN-25], but no registry page says what they show or where, so nothing here builds on them. Closest pattern: a custom transient surface, which takes 8 px corners like other overlays [WIN-12]. |
| Target and spacing | Undo and close take the 40 × 40 px touch target [WIN-2]. 8 epx between its buttons [WIN-4]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. One sentence, wrapping as text scales [WIN-6]. |
| Colour and theme | An inverse surface from theme brushes [WIN-8]. In contrast themes, popups take `SystemColorWindowColor`, with a 2 px border on transitory surfaces such as flyouts and dialogs [WIN-9]. |
| States | Shown or gone. Its buttons take their contrast theme pair [WIN-9]. |
| Motion | Enter and exit [FLU-5]. Direct entrance at cubic-bezier(0,0,0,1) over 167, 250 or 333 ms, and exit at 167 ms, always with a fade out [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Static text, and buttons named by their text [WIN-19]. How the confirmation is announced: not confirmed. |
| Navigation placement | Bottom centre of the window, above any foot bar. A lone button in a toast right-aligns [WIN-13]. |
| Keyboard, pointer, trackpad | Tab reaches Undo, and Enter or Space activates it [WIN-13] [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | One sentence, past tense, with a full stop ("3 invoices sent."), gone after 5 seconds or 8 with Undo, paused while hovered or focused, and never for errors that need action. The timing and pause rules are the product's own, since Microsoft's mention of toasts covers button alignment only [WIN-13]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | An in-app toast control. How a toast is announced to Narrator. Reaching Undo by keyboard without stealing focus. Haptic guidance. |
