# EmptyState on Windows

Says what is empty and what to do next, in place of the content.

```yaml
component: EmptyState
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
| Native control | No control. A title, a line of text, optional character art and action `Button`s [WIN-13]. |
| Target and spacing | Actions take the 40 × 40 px touch target [WIN-2]. Title, text and actions sit 12 epx apart [WIN-4]. |
| Type | A page-sized title in Title, 28 on 36 epx, and smaller ones in Subtitle [WIN-5] [FLU-3]. Body text [WIN-5]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Theme brushes [WIN-8]. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor` [WIN-9]. |
| States | One per kind, each said in words rather than colour [WIN-7]. |
| Motion | None of its own. A character loop stops when `UISettings.AnimationsEnabled` is false [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Title and text are static text [WIN-19], and the character is decorative, `AccessibilityView` Raw [WIN-19]. Narrator's headings view needs the title marked as a heading [WIN-17]. How: not confirmed. |
| Navigation placement | Page content, a card or a pane. Inside a table it replaces the rows and keeps the header and toolbar. Microsoft left-aligns a lone button on a page [WIN-13]. |
| Keyboard, pointer, trackpad | Actions take Enter or Space [WIN-13]. Initial focus goes to the most logical element, often the main action [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The six kinds and their copy ("No clients yet." with Add client), the character state for each, and the size: `page`, `section` or `compact`. A `page` title takes the display style when the brand uses one. Microsoft's type ramp carries the sizes [WIN-5]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | Heading semantics. Haptic guidance. |
