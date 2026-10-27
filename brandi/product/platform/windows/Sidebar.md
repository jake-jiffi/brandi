# Sidebar on Windows

The navigation pane, holding the lockup, search, the navigation groups and the signed-in person.

```yaml
component: Sidebar
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
| Native control | WinUI `NavigationView`'s pane [WIN-15]: `PaneHeader` for the lockup, the `AutoSuggestBox` slot for search, `MenuItems` grouped under `NavigationViewItemHeader`s, `FooterMenuItems` for settings and help, and `PaneFooter` for the person [WIN-15]. |
| Target and spacing | Items take the 40 × 40 px touch target [WIN-2]. On the 4 epx grid [WIN-16]. |
| Type | Item labels in Body, 14 on 20 epx [WIN-5] [FLU-3]. Sentence case for all UI text [WIN-5]. |
| Colour and theme | Pane backgrounds through `NavigationViewExpandedPaneBackground` and `NavigationViewDefaultPaneBackground`, with Default and HighContrast dictionaries at least [WIN-15]. A border for contrast themes only keeps the pane apart from a page of the same colour [WIN-9]. |
| States | Expanded, compact and minimal [WIN-15]. One selection indicator in the whole pane [WIN-15]. |
| Motion | Use WinUI's built-in control motion and avoid custom animation [WIN-10]. Check `UISettings.AnimationsEnabled`, which reports whether animations are on [WIN-11]. |
| Accessibility API | Narrator through UI Automation. The pane region takes a name through `AutomationProperties.Name` [WIN-18]. Collapsed, the labels stay as names and show as tooltips, the way NavigationView's sample sets `ToolTipService.ToolTip` on each item [WIN-15]. The account button is named "[name], [role], account menu" [WIN-19]. |
| Navigation placement | Left of the content: the full pane from 1008 px, icons from 641 px, and a menu button below that [WIN-15]. |
| Keyboard, pointer, trackpad | In Left mode, Up and Down move through items, Space or Enter invokes, and focus moves on from the last item to Settings [WIN-15]. `KeyboardAccelerator` binds Ctrl+K to search [WIN-18]. |
| Haptics | None specified. WinUI 3 apps can use OS touchpad and mouse haptics through `Windows.Devices.Haptics` from Windows App SDK 2.4.0, where the OS and hardware support them [WIN-25]. When to play one: not confirmed. |
| Brand may change | Eight top-level items at most, groups under short uppercase labels, settings and help in the footer, rail tokens with `rail-focus`, and a decision on whether the pane carries the brand. Left mode suits 5 to 10 categories [WIN-15], and eight fits. Uppercase group labels depart from Microsoft's sentence case [WIN-5] and from Fluent's advice against all caps [FLU-3], and the product's guidelines apply (2.3). |
| Platform owns | Pane display modes [WIN-15]. Contrast theme colours [WIN-9]. |
| Not confirmed | Naming the navigation landmark beyond the region name. Account button patterns in `PaneFooter`. Haptic guidance. |
