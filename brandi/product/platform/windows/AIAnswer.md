# AIAnswer on Windows

What the assistant made or is making, from the question through its steps, sources and status to the next move.

```yaml
component: AIAnswer
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
| Native control | No control. A region holding a heading (the question), the steps, the answer text, source links and buttons. Selectable answer text in a `RichTextBlock` is not a tab stop but stays readable through the Text pattern [WIN-18]. |
| Target and spacing | Buttons and source chips take the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | The question in Subtitle or Body Strong, the answer in Body [WIN-4] [FLU-3]. Lines of 50 to 60 characters read best [WIN-5]. Wraps as text scales [WIN-6]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes, text takes `SystemColorWindowTextColor` and links `SystemColorHotlightColor` [WIN-9]. |
| States | Thinking, streaming, Drafted, Answered, Stopped and Failed, each said in words [WIN-7]. |
| Motion | The streaming caret and arriving text move on their own. Check `UISettings.AnimationsEnabled` [WIN-11]. Fluent asks for a no-motion setting [FLU-5]. |
| Accessibility API | Narrator through UI Automation. Buttons are named by their text [WIN-19]. Narrator reads the answer by line or paragraph [WIN-17]. The one status line that speaks on changes: how it reaches Narrator is not confirmed. |
| Navigation placement | Page content or the ask panel, in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | After Try again or Stop, code moves focus to the steps line or the question, and Microsoft asks that focus land on the most logical element [WIN-17]. Buttons take Enter or Space [WIN-13]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The house rules: the assistant drafts and a person sends, every figure has a source, and the caveat ends with "The assistant can be wrong." Up to three quiet follow-ups, Stop keeping what was found, and no model names or raw tool calls. Footer buttons run in Windows commit order, "do it" first [WIN-13], so Use this, Edit, then Discard. |
| Platform owns | Commit order [WIN-13]. Contrast theme colours [WIN-9]. |
| Not confirmed | How the status line is announced. Streaming rich text, and the caret in contrast themes. Haptic guidance. |
