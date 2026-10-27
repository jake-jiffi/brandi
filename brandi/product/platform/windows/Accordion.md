# Accordion on Windows

Sections that open and close in place, built on Microsoft's expander pattern.

```yaml
component: Accordion
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
  - key: WIN-9
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-10
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/motion
    marker: 2026-02-28
    read: 2026-10-27
  - key: WIN-11
    url: https://learn.microsoft.com/en-us/uwp/api/windows.ui.viewmanagement.uisettings.animationsenabled
    marker: ms.date 2017-02-08
    read: 2026-10-27
  - key: WIN-17
    url: https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
    marker: 2026-09-27
    read: 2026-10-27
  - key: WIN-19
    url: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information
    marker: 2026-08-29
    read: 2026-10-27
  - key: WIN-21
    url: https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-supportdataitemcontroltype
    marker: 2025-07-14
    read: 2026-10-27
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Microsoft's expander control, shown with list styles and common controls [WIN-4]. Its API page is not in the registry. |
| Target and spacing | Each header takes the 40 × 40 px touch target [WIN-2]. Controls inside indent 48 epx, and controls in a header right-align 16 epx from the expander button [WIN-4]. |
| Type | Headers in Body or Body Strong, content in Body [WIN-4] [FLU-3]. |
| Colour and theme | In contrast themes, headers take the `SystemColorButtonFaceColor` pair [WIN-9]. |
| States | Open or closed per section, which UI Automation's ExpandCollapse state tracks [WIN-21]. |
| Motion | Built-in expand and collapse [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. In UI Automation, an item that shows and hides information supports the ExpandCollapse pattern and raises its state-change event [WIN-21]. Each header is named by its text [WIN-19]. |
| Navigation placement | Help and settings pages, in page content [WIN-4]. |
| Keyboard, pointer, trackpad | Enter or Space opens and closes a header [WIN-17]. Tab moves between headers [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Opening one section leaves the others as they were, and each header is a button with an expanded state. Microsoft's expander spacing applies [WIN-4]. |
| Platform owns | Expand and collapse state events [WIN-21]. |
| Not confirmed | The expander control's API, automation and keys. Haptic guidance. |
