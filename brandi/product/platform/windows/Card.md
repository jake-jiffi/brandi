# Card on Windows

The container on the page, with a title, description, actions, body and footer, built from plain layout because WinUI has no card control.

```yaml
component: Card
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
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
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
| Native control | No card control. A layout container with a theme brush background, set through `{ThemeResource}` so contrast themes can swap it [WIN-9]. |
| Target and spacing | 16 epx between a surface and its edge text, 12 epx between content areas [WIN-4]. Sizes, margins and positions in multiples of 4 epx [WIN-16]. |
| Type | Title in Body Strong where space is tight, or Subtitle, 20 on 28 epx [WIN-4] [FLU-3]. Sentence case and no all caps [WIN-5] [FLU-3]. |
| Colour and theme | Darker surfaces read as less important, lighter and brighter ones as more [WIN-7]. In contrast themes, `SystemColorWindowColor`, with a border only where the card's boundary matters [WIN-9]. |
| States | Static. An interactive card adds pointer over and selected, the kind of change Fluent's elevation pattern covers [FLU-5]. |
| Motion | Elevation changes for hover and drag [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The container exposes no name, and its title and content carry the meaning [WIN-19]. Narrator's headings view needs the title marked as a heading [WIN-17]. How: not confirmed. |
| Navigation placement | Page content in NavigationView's content area, with 24 px margins, or 12 px in Minimal mode [WIN-15]. |
| Keyboard, pointer, trackpad | Not focusable unless `href` makes its title a link [WIN-18]. Buttons inside stay their own tab stops [WIN-17]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Never a card in a card, a sentence-case title with no small uppercase label above it, one idea per card, `flat` inside panes, and `interactive` cards that lift on hover. Sentence-case titles match Microsoft's casing [WIN-5]. |
| Platform owns | Contrast theme colours [WIN-9]. Content margins in NavigationView [WIN-15]. |
| Not confirmed | Card corner radius and shadow. A whole-card link pattern. Heading semantics in UI Automation. |
