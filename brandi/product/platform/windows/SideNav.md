# SideNav on Windows

In-page navigation for settings and long documents, sticky beside the sections.

```yaml
component: SideNav
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
  - key: WIN-5
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/typography
    marker: 2026-04-14, ms.date 2021-06-24
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
| Native control | No in-page navigation control in the registry's pages. Closest pattern: a single-selection `ListView` [WIN-22] whose items jump to sections. |
| Target and spacing | Items take the 40 × 40 px touch target [WIN-2]. |
| Type | Body [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | In contrast themes the current item takes `SystemColorHighlightColor` with `SystemColorHighlightTextColor` [WIN-9]. |
| States | Current item, pointer over and pressed, with the highlight pair in contrast themes [WIN-9]. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. The region takes a name through `AutomationProperties.Name` [WIN-18]. Items are list items named by their labels [WIN-21]. How the current item is exposed: not confirmed. |
| Navigation placement | Beside the sections it indexes. F6 moves between it and the content when the app builds it [WIN-18]. |
| Keyboard, pointer, trackpad | Up and Down move through items, and Enter or Space activates one [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | The current item in `selected-strong` with a ring, sticky beside a settings page's sections, and nothing current until `value` is set. Microsoft's single-column list keys apply [WIN-17]. |
| Platform owns | List keyboard behaviour [WIN-17] [WIN-18]. |
| Not confirmed | Sticky positioning in a scrolling page. How the current item is exposed. Haptic guidance. |
