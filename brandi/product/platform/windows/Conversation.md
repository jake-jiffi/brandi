# Conversation on Windows

Messages between people with a composer, for support, comments and messaging.

```yaml
component: Conversation
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
| Native control | A `ListView`, which Microsoft names for lists of messages [WIN-22], and a composer `TextBox` with `AcceptsReturn` and wrapping [WIN-6] beside a Send `Button` [WIN-13]. |
| Target and spacing | Send and message actions take the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | Messages in Body, names and times in Caption [WIN-4] [FLU-3]. Wraps as text scales [WIN-6]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. |
| States | Unread and read, sending and sent, each in words [WIN-7]. |
| Motion | Check `UISettings.AnimationsEnabled` before animating a new message [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each message is a DataItem named by sender, time and text [WIN-21], with "(unread)" in the name [WIN-19]. How a new message is announced, once and politely: not confirmed. |
| Navigation placement | A page or a side pane, with the composer below the thread. F6 moves between the thread and the composer when the app builds it [WIN-18]. |
| Keyboard, pointer, trackpad | Up and Down move through messages [WIN-17]. In the composer, keyboard input goes to text first [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Every message names who sent it and when, assistant messages take the `ai` tone, unread messages show a dot and "(unread)", and the composer's label says what the text is for. Microsoft's message list control fits [WIN-22]. |
| Platform owns | List keyboard behaviour [WIN-17] [WIN-18]. |
| Not confirmed | How a new message is announced. Enter to send versus a new line. Haptic guidance. |
