# NavGroup on Windows

Navigation items under a short label, optionally collapsible.

```yaml
component: NavGroup
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
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
| Native control | `NavigationViewItemHeader` labels the group [WIN-15]. A collapsible group is a parent `NavigationViewItem` with child items, raising `Expanding` and `Collapsed` [WIN-15]. `NavigationViewItemSeparator` spaces groups apart [WIN-15]. |
| Target and spacing | A collapsible header takes the 40 × 40 px touch target [WIN-2]. |
| Type | The header's own text style: not confirmed. A short label fits Caption, 12 on 16 epx, the style for confined spaces [WIN-4] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | In contrast themes, header text takes `SystemColorWindowTextColor` [WIN-9]. |
| States | Open or closed when collapsible. A selected child inside a closed group shows its selection on the first visible parent [WIN-15]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The header is static text [WIN-19]. How a collapsible parent exposes its expanded state: not confirmed. |
| Navigation placement | In the pane's `MenuItems` [WIN-15]. Two levels at most is ideal [WIN-15]. |
| Keyboard, pointer, trackpad | In Left mode, Space or Enter on a parent opens or closes it without moving focus [WIN-15]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Short uppercase labels, `collapsible` and `defaultOpen`. Uppercase departs from Microsoft's sentence case [WIN-5] and from Fluent's advice against all caps [FLU-3], and the product's guidelines apply (2.3). |
| Platform owns | Hierarchy behaviour and how selection shows [WIN-15]. |
| Not confirmed | `NavigationViewItemHeader`'s text style. The expanded state in UI Automation. Haptic guidance. |
