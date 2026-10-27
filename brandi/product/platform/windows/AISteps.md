# AISteps on Windows

The assistant's steps and how each went, open while it works and folded to one line when done.

```yaml
component: AISteps
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
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
  - key: WIN-21
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdataitemcontroltype
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
| Native control | No control. A summary `Button` that shows or hides a list of steps [WIN-13], spaced like Microsoft's expander control [WIN-4]. The steps are a read-only `ListView` [WIN-22]. |
| Target and spacing | The summary line takes the 40 × 40 px touch target [WIN-2]. |
| Type | Summary and step labels in Body, details in Caption [WIN-4] [FLU-3]. Wraps as text scales [WIN-6]. |
| Colour and theme | Step states carry a word, never colour alone [WIN-7]. In contrast themes the running step takes the in-progress colour, `SystemColorHighlightColor` [WIN-9]. |
| States | Done, running, waiting, failed or skipped for each step, and open or folded overall. In-progress UI takes `SystemColorHighlightColor` in contrast themes [WIN-9]. |
| Motion | One spinner at a time. Built-in expand and collapse [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The summary is a button named by its line ("Working, step 2 of 4") [WIN-19] [WIN-20]. In UI Automation, an item that shows and hides information supports the ExpandCollapse pattern [WIN-21]. How the start, a failure and the end are announced: not confirmed. |
| Navigation placement | Inside an answer, or alone in a card in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Enter or Space opens and closes the summary [WIN-13]. After Try again, code moves focus to the summary line [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Steps named by what they do in the person's words, and the step in hand named as it happens. Details say where a figure came from, a failed step offers Try again, and "Failed at step 2 of 3" is never hidden by a title. The spacing follows Microsoft's expander guidance [WIN-4]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | The expander control's own automation. How progress is announced politely. Haptic guidance. |
