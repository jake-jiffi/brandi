# AppShell on Windows

The frame of every product, built on NavigationView with a `TitleBar` above it.

```yaml
component: AppShell
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
| Native control | WinUI `NavigationView` [WIN-15], with the `TitleBar` control above it handling the back button and the pane toggle [WIN-15]. |
| Target and spacing | Pane items take the 40 × 40 px touch target [WIN-2]. Content margins are 12 px in Minimal mode and 24 px otherwise [WIN-15]. |
| Type | The page title sits in the header, which has a fixed height of 52 px [WIN-15], in Title, 28 on 36 epx [WIN-5] [FLU-3]. |
| Colour and theme | The pane is solid when expanded beside content and in-app acrylic when it overlays content, through `NavigationViewExpandedPaneBackground`, `NavigationViewDefaultPaneBackground` and `NavigationViewTopPaneBackground` [WIN-15]. Override them with Default and HighContrast dictionaries at least [WIN-15]. When pane and page share a background, add a border for contrast themes only [WIN-9]. |
| States | `PaneDisplayMode` Auto moves between `Left`, `LeftCompact` and `LeftMinimal`, and in Minimal and Compact the pane opens as a flyout [WIN-15]. |
| Motion | Page transitions and connected animations are WinUI's own [WIN-10]. Top-level moves use a quick fade, not a slide [FLU-5]. Check `UISettings.AnimationsEnabled` [WIN-11]. |
| Accessibility API | Narrator through UI Automation. Each F6 region, the pane and the content, takes a name through `AutomationProperties.Name` on its root [WIN-18]. Narrator offers a landmarks view [WIN-17]. |
| Navigation placement | The whole window. In Auto mode: `LeftMinimal` up to 640 px, `LeftCompact` from 641 to 1007 px, and `Left` from 1008 px [WIN-15] [WIN-16]. `CompactModeThresholdWidth` and `ExpandedModeThresholdWidth` move those points [WIN-15]. |
| Keyboard, pointer, trackpad | F6 moves between the pane and the content, and Shift+F6 goes back, once the app builds it [WIN-18]. Arrow keys move within the pane [WIN-15]. |
| Haptics | None for the shell itself, and the haptics WinUI 3 gained in Windows App SDK 2.4.0 are OS touchpad and mouse haptics [WIN-25]. |
| Brand may change | The product's thresholds (full pane, icons with tooltips, a drawer, one column) and the skip-to-content route. A drawer that holds focus and returns it to the menu button, and the primary in a foot bar on narrow windows. The thresholds go in `CompactModeThresholdWidth` and `ExpandedModeThresholdWidth` [WIN-15]. A skip link has no Windows equivalent in the registry, and F6 is Windows' route between regions [WIN-18]. |
| Platform owns | Pane display modes and their adaptive behaviour [WIN-15]. The back button's events, which the app handles [WIN-15]. Contrast theme colours [WIN-9]. |
| Not confirmed | Whether NavigationView measures its own width or the window's. Focus return to the menu button when the overlay pane closes. A foot bar on narrow windows. |
