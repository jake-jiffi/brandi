# Alert on Windows

A message inside a page or card that says what happened, what it means and what to do.

```yaml
component: Alert
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
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
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
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Closest WinUI control: `InfoBar`, named in the Windows App SDK release notes' API lists [WIN-25]. No registry page gives its guidance. Problems tied to a place on the page stay on the page canvas, not in dialogs [WIN-14]. |
| Target and spacing | Actions and the dismiss button take the 40 × 40 px touch target [WIN-2]. 16 epx between the surface and its edge text [WIN-4]. |
| Type | Title in Body Strong, message in Body [WIN-4] [FLU-3]. Wraps as text scales [WIN-6]. |
| Colour and theme | Tones never carry meaning alone, so each has an icon [WIN-7]. In contrast themes, `SystemColorWindowTextColor` on `SystemColorWindowColor`, with buttons in the `SystemColorButtonFaceColor` pair [WIN-9]. |
| States | Shown or dismissed. Tone colours give way to system colours in contrast themes [WIN-9]. |
| Motion | Enter and exit is Fluent's pattern for elements that appear and disappear [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Title and message are static text [WIN-19]. The dismiss button shows only an icon, so its name ("Dismiss: [title]") comes from `AutomationProperties.Name` [WIN-19]. How danger and warning interrupt while the rest stay polite: not confirmed. |
| Navigation placement | Inside the page or card it concerns. A lone action in a container right-aligns [WIN-13]. |
| Keyboard, pointer, trackpad | Actions and dismiss are buttons, activated by Enter or Space [WIN-13]. Tab reaches them [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | State, consequence, then the fix, never "Something went wrong" and never blaming the person, with actions as Buttons ("Try again"). A partial outage names the source and when it was last checked. Microsoft's split between buttons and links holds here too [WIN-13]. |
| Platform owns | Contrast theme colours [WIN-9]. |
| Not confirmed | `InfoBar` guidance, severity styling and automation. How a new alert is announced, interrupting or polite. Haptic guidance. |
