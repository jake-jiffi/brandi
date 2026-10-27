# Pagination on Windows

The footer of a long table, with the range, the total, and previous and next.

```yaml
component: Pagination
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
  - key: WIN-20
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportbuttoncontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | WinUI `PagerControl`, named in the Windows App SDK release notes' API lists [WIN-25]. No registry page gives its guidance. Closest documented pattern: previous and next `Button`s beside the range in text [WIN-13]. |
| Target and spacing | Each button takes the 40 × 40 px touch target [WIN-2]. 8 epx between buttons [WIN-4]. |
| Type | Range text in Body or Caption [WIN-5] [FLU-3]. Text scales from 100% to 225%, and WinUI text controls follow it by default [WIN-6]. |
| Colour and theme | In contrast themes, buttons take the `SystemColorButtonFaceColor` pair and the range `SystemColorWindowTextColor` [WIN-9]. |
| States | A disabled button leaves the tab order [WIN-18], so a disabled Previous on page one is skipped by Tab. |
| Motion | None of its own. Built-in control motion only [WIN-10]. |
| Accessibility API | Narrator through UI Automation. Previous and next are buttons named by their action, with help text that says where they go [WIN-20]. The range is static text [WIN-19]. |
| Navigation placement | The table's footer, below the rows. Page Up and Page Down scroll within a list, and they do not turn pages [WIN-17]. |
| Keyboard, pointer, trackpad | Enter or Space activates a button [WIN-13]. Tab moves between them [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | "1 to 25 of 312", "No results" at zero, no buttons when everything fits, the person's page size kept, and the page kept in the URL. Filters and search over deep paging. Microsoft's button guidance applies to previous and next [WIN-13]. |
| Platform owns | Activation keys [WIN-13]. |
| Not confirmed | `PagerControl` guidance and automation. Where the page is kept when there is no URL. Haptic guidance. |
