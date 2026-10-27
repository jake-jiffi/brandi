# AskPanel on Windows

The assistant's panel, holding the thread, the empty state and the composer.

```yaml
component: AskPanel
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
| Native control | No control. A pane holding the thread as a `ListView` [WIN-22], a composer `TextBox` with `AcceptsReturn` [WIN-6], and a Send `Button` [WIN-13] that becomes Stop while an answer runs. |
| Target and spacing | Send, Stop and suggestions take the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | Body for the thread and composer [WIN-5] [FLU-3], the greeting in Subtitle [WIN-5]. Wraps as text scales [WIN-6]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes the pane takes `SystemColorWindowColor`, with a border where it meets the page [WIN-9]. |
| States | Empty, replying, done, stopped and failed, each said in words [WIN-7]. |
| Motion | Check `UISettings.AnimationsEnabled` before animating arrivals [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The pane region takes a name through `AutomationProperties.Name` [WIN-18]. Header buttons get names of their own [WIN-19]. The thread is not a live region, and each answer has its own status line, whose announcement is not confirmed. |
| Navigation placement | A side pane or a page. F6 moves between the panel and the page once the app builds it [WIN-18]. |
| Keyboard, pointer, trackpad | Keyboard input goes to text entry first [WIN-17]. The composer follows the thread in the tab order. After Send, code moves focus to the new answer, the most logical element [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | A greeting and up to three suggestions as quiet buttons, none that create anything for a viewer. Send becomes Stop, and drops to secondary while a proposal waits. Enter sends, Shift+Enter adds a line, and focus follows the house table. Tabs, if kept, are a tab list. Microsoft's F6 pane movement suits a side panel [WIN-18]. |
| Platform owns | Text entry priority [WIN-17]. |
| Not confirmed | How answers are announced. Tab list control types in the panel. Enter versus Shift+Enter in a `TextBox`. Haptic guidance. |
