# Board on Windows

Records in columns by stage, for work that moves through steps.

```yaml
component: Board
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
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
| Native control | No board control. Columns as `ListView`s, which support drag and drop within and between themselves [WIN-22]. Every card also has a "Move to" `MenuFlyout` [WIN-12]. |
| Target and spacing | Cards and their menu buttons take the 40 × 40 px touch target [WIN-2]. 12 epx between columns, as between content areas [WIN-4]. |
| Type | Card titles in Body Strong and meta in Caption [WIN-4] [FLU-3]. |
| Colour and theme | Cards on theme brushes [WIN-8]. In contrast themes, selected and dragged cards take the highlight pair [WIN-9]. |
| States | Rest, selected and dragging, with the highlight pair in contrast themes [WIN-9]. |
| Motion | Fluent's elevation pattern covers drag and drop [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each card is a DataItem named by its title, with `ItemStatus` for a changing stage [WIN-21]. Each column region takes a name with its count [WIN-18]. |
| Navigation placement | Page content in NavigationView's content area [WIN-15]. |
| Keyboard, pointer, trackpad | Several lists that look and act as one can share one tab stop, with arrow keys between them [WIN-17]. Anything done by dragging also needs a keyboard way [WIN-18], which is the "Move to" menu. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Moving a card never depends on dragging, cards follow ListRow's title, meta and badge rules, and column counts follow NavItem. Microsoft's keyboard parity rule backs the menu [WIN-18]. |
| Platform owns | Drag and drop between lists [WIN-22]. |
| Not confirmed | A first-party board. How a moved card is announced. Haptic guidance. |
