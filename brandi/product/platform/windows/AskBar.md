# AskBar on Windows

Search and ask in one field, for records, people, actions or a question for the assistant.

```yaml
component: AskBar
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
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | WinUI `AutoSuggestBox` [WIN-17] with an Ask `Button` [WIN-13]. It is the same box NavigationView hosts for app-level search [WIN-15]. |
| Target and spacing | The field and the button take the 40 × 40 px touch target [WIN-2]. 8 epx between them [WIN-4]. |
| Type | Segoe UI Variable, Body 14 on 20 epx [WIN-5] [FLU-3]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | Theme brushes, as `AutoSuggestBox` uses by default [WIN-8]. In contrast themes, the `SystemColorButtonFaceColor` pair [WIN-9]. |
| States | Empty, typing, and suggestions open. The list is a popup menu [WIN-17]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The field is named by its placeholder words through `AutomationProperties.Name` [WIN-19]. The Ask row in the suggestions carries the text: "Ask the assistant: [text]" [WIN-19]. Narrator has a suggestions view [WIN-17]. |
| Navigation placement | Home, in page content [WIN-15]. Elsewhere, the pane's search slot does the job [WIN-15]. |
| Keyboard, pointer, trackpad | Ctrl+K focuses it, an accelerator that works across the app [WIN-17]. Enter submits [WIN-17]. In the suggestions, Down goes to the first and Up to the last, cycling at the ends, and Space does not choose [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | One per product, on Home, a placeholder that says what can be found in the product's words, the "Ask" action and the shortcut shown. Identifiers and email addresses find the record first and never offer Ask. Microsoft's accelerator model covers Ctrl+K [WIN-17]. |
| Platform owns | Enter to submit, and popup keyboard behaviour [WIN-17]. |
| Not confirmed | Mixing results and an Ask row in one suggestion list. Focus moving to the new answer. Haptic guidance. |
