# FormSection on Windows

Related fields under a title and description, laid out in a plain container because WinUI has no section control.

```yaml
component: FormSection
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
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
| Native control | No section control. A titled group of fields in a layout container. Microsoft's spacing page also shows related controls grouped in an expander control [WIN-4]. |
| Target and spacing | 12 epx between content areas, 16 epx between a surface and its edge text [WIN-4]. Inside an expander, controls indent 48 epx [WIN-4]. |
| Type | Title, Subtitle and Body with 12 epx between them [WIN-4]. Subtitle is 20 on 28 epx, Body 14 on 20 [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Darker surfaces read as less important, lighter and brighter ones as more [WIN-7]. In contrast themes, panes take `SystemColorWindowColor`, with a border only where the boundary matters [WIN-9]. |
| States | None of its own. Each control inside draws its own states, and a disabled one leaves the tab order [WIN-18]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Containers expose no name, and the fields carry name and role [WIN-19]. Narrator's headings view needs the title marked as a heading [WIN-17]. How: not confirmed. |
| Navigation placement | Page content. A settings page is one column of sections, and F6 can move between major regions if the app builds it [WIN-18]. |
| Keyboard, pointer, trackpad | Tab order runs top to bottom and left to right [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | `split` or `stacked` layout, one topic per section, a description that says why the fields matter, a heading level that never skips, and each section saving on its own. Sentence-case titles match Microsoft's casing [WIN-5]. |
| Platform owns | Contrast theme colours [WIN-9]. Text scaling [WIN-6]. |
| Not confirmed | Card corner radius and elevation. Heading semantics in UI Automation. A layout that responds to its own width rather than the window's. |
