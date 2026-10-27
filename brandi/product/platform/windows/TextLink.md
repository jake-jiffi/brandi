# TextLink on Windows

An inline link that navigates, built on `HyperlinkButton` or a `Hyperlink` inside text.

```yaml
component: TextLink
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
  - key: WIN-3
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-visualfeedback
    marker: 2026-09-27
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
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
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
| Native control | `HyperlinkButton` when it stands alone, since Microsoft keeps `Button` for actions and hyperlink buttons for navigation [WIN-13]. Inside running text, a `Hyperlink`, which Enter activates [WIN-17]. |
| Target and spacing | A standalone link takes the 40 × 40 px touch target [WIN-2]. Spacing on the 4 epx grid [WIN-16]. |
| Type | The surrounding text style, Body 14 on 20 epx by default [WIN-5] [FLU-3], scaling with it [WIN-6]. |
| Colour and theme | Hyperlinks use the accent colour by default [WIN-8]. One colour signals interactivity, as blue link text does on the web [WIN-7]. In contrast themes, `SystemColorHotlightColor`, which nothing but hyperlinks may use [WIN-9]. |
| States | Keyboard focus draws a 2 px outer and 1 px inner border, 1 px outside the control [WIN-3]. Pointer over, pressed and visited styling: not confirmed. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Name from the visible text, like any button or link [WIN-19]. Narrator offers a links view for quick navigation [WIN-17]. |
| Navigation placement | Paragraphs, alerts and hints. A `Hyperlink` sits in running text and a `HyperlinkButton` stands alone [WIN-13] [WIN-17]. |
| Keyboard, pointer, trackpad | Tab reaches it and Enter activates it [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The `link` colour, the underline, and text that says where it goes and is unique on the page, never "here" or "more". Links navigate and buttons act, which matches Microsoft's own split [WIN-13]. A `link` colour other than the accent departs from the hyperlink default [WIN-8], and the product's guidelines apply (2.3). |
| Platform owns | `SystemColorHotlightColor` in contrast themes [WIN-9]. Activation by Enter [WIN-17]. |
| Not confirmed | The UI Automation control type for links. Underline, pointer over and visited styling. Target size for a link inside a sentence. Haptic guidance. |
