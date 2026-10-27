# Spacer on Windows

A flexible gap in a toolbar that pushes what follows to the far end.

```yaml
component: Spacer
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: WIN-6
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling
    marker: 2026-03-05
    read: 2026-10-27
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-16
    url: https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
    marker: 2026-07-13
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
| Native control | No control. A `*` column in a `Grid`, which takes the remaining space while `Auto` columns fit their content [WIN-6]. |
| Target and spacing | None. A layout gap is never pressed, and its width comes from star sizing [WIN-6]. |
| Type | None. It holds no text for text scaling to resize [WIN-6]. |
| Colour and theme | None. It is empty space, with nothing for a contrast theme to recolour [WIN-9]. |
| States | None. Layout carries no states and no name [WIN-19]. |
| Motion | None. Nothing on it moves, so the `UISettings.AnimationsEnabled` setting changes nothing [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Layout only, so it adds nothing to the tree, where panels and layout carry no name [WIN-19]. |
| Navigation placement | Inside a Toolbar, between the filters and the view controls. Layout sizes stay in multiples of 4 epx [WIN-16]. |
| Keyboard, pointer, trackpad | None. It is never focusable, since only classes derived from `Control` take focus [WIN-18]. |
| Haptics | None. It is never pressed, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | Where it sits in the toolbar. Star sizing in a `Grid` does the work [WIN-6]. |
| Platform owns | Layout sizing [WIN-6]. |
| Not confirmed | Nothing for a layout gap. |
