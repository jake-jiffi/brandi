# NotificationCentre on Windows

The events for the signed-in person, opened from the header or the navigation pane.

```yaml
component: NotificationCentre
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
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
  - key: WIN-15
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    marker: 2026-10-02
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
| Native control | A `Flyout` from a header button [WIN-13] or a pane footer item [WIN-15], holding a `ListView` of events [WIN-22]. The release notes also list `AppNotification` APIs [WIN-25], with no registry guidance on what they show or where. |
| Target and spacing | The trigger and the items take the 40 × 40 px touch target [WIN-2]. |
| Type | Event lines in Body and times in Caption [WIN-4] [FLU-3]. |
| Colour and theme | Corners 8 px through `OverlayCornerRadius` [WIN-12]. In contrast themes, `SystemColorWindowColor` with a 2 px border [WIN-9]. Unread items are marked by more than colour [WIN-7]. |
| States | Unread and read, each marked in words or a dot with words [WIN-7]. |
| Motion | Enter and exit [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each event is a DataItem named by its text, with `ItemStatus` for a read state that changes [WIN-21]. The trigger is named with its count in words [WIN-19]. |
| Navigation placement | From the page header, or from NavigationView's `FooterMenuItems` [WIN-15], anchored through `Placement` [WIN-13]. |
| Keyboard, pointer, trackpad | Up and Down move through the events [WIN-17], and Esc closes the flyout [WIN-17]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | A highlight count waiting on the reader, a grey one on others, nothing at zero, counts in words, each line naming who did what, and the assistant's lines in the `ai` tone. The `AppNotification` APIs in the release notes [WIN-25] are not used, since the registry gives them no guidance. |
| Platform owns | Esc and popup behaviour [WIN-17]. |
| Not confirmed | How a new event is announced. A count badge on the trigger. Haptic guidance. |
