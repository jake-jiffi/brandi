# Sheet on Windows

A panel from the right for a record or a longer edit, built as a custom overlay because WinUI has no sheet control.

```yaml
component: Sheet
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: FLU-3
    url: https://fluent2.microsoft.design/typography/
    marker: undated
    read: 2026-10-27
  - key: FLU-4
    url: https://fluent2.microsoft.design/accessibility/
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
  - key: WIN-12
    url: https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/geometry
    marker: 2026-02-19
    read: 2026-10-27
  - key: WIN-14
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/dialogs-and-flyouts/dialogs
    marker: 2026-07-15
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
  - key: WIN-25
    url: https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/release-notes/windows-app-sdk-2-0?pivots=stable
    marker: 2026-09-29
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | No sheet control: the dialog guidance covers `ContentDialog` and flyouts only [WIN-14]. `SplitView` appears on the NavigationView page as a related link, with no guidance [WIN-15]. Closest pattern: a custom overlay pane on the right, held to the overlay rules below. |
| Target and spacing | Its controls take the 40 × 40 px touch target [WIN-2]. 16 epx between the surface and its edge text [WIN-4]. |
| Type | Title in Subtitle, 20 on 28 epx [WIN-4] [FLU-3]. Body content [WIN-5]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Overlay corners 8 px through `OverlayCornerRadius` [WIN-12]. In contrast themes, `SystemColorWindowColor` with a 2 px border, as on other transitory surfaces [WIN-9]. |
| States | Open or closed, like any transient UI that Esc cancels [WIN-17]. |
| Motion | Enter and exit [FLU-5]. Direct entrance at cubic-bezier(0,0,0,1) over 167, 250 or 333 ms, and exit at 167 ms with a fade out [WIN-10]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The pane's region takes a name through `AutomationProperties.Name` on its root [WIN-18]. Focus must not be lost when it closes [FLU-4]. How a custom modal pane is exposed to UI Automation: not confirmed. |
| Navigation placement | The right edge of the window, over the list, below the product's wide-window threshold, with the detail pane beside the list above it. NavigationView's own overlay pane opens as a flyout over content in Minimal and Compact modes [WIN-15]. |
| Keyboard, pointer, trackpad | Esc cancels transient UI [WIN-17]. F6 can move between the sheet and the list when the app builds it [WIN-18]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Inset from the edges like the pane, the product's default width, focus held while open and returned to the row that opened it, and a confirmation dialog allowed on top. One `ContentDialog` per window still applies to that confirmation [WIN-14]. |
| Platform owns | Esc for transient UI [WIN-17]. Contrast theme colours [WIN-9]. |
| Not confirmed | A first-party sheet or side panel. Holding focus inside a custom pane. Dismissing on a press outside. How a custom modal pane is exposed to UI Automation. Haptic guidance. |
