# AppShell on macOS

AppShell is the window on macOS: a sidebar on the leading side, a toolbar in the frame, the content, and the menu bar above it all.

```yaml
component: AppShell
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-3
    url: https://developer.apple.com/design/human-interface-guidelines/typography
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A window with a split view. `NavigationSplitView` in SwiftUI or `NSSplitViewController` in AppKit puts the sidebar in the leading pane [APL-10]. `NSToolbar` sits in the window frame [APL-11]. |
| Target and spacing | Controls meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Window title in `titleBarFont(ofSize:)` [APL-3]. Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The sidebar and toolbar float on Liquid Glass above the content [APL-7] [APL-10]. Desktop tinting under the graphite accent [APL-5]. The app accent shows only while the person's accent setting is Multicolor. Any other choice replaces it [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Sidebar shown or hidden. As the window narrows, the sidebar can collapse by itself [APL-10]. |
| Motion | System window and sidebar motion [APL-6]. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. A unique window title, read first [APL-19] [APL-11]. |
| Navigation placement | The sidebar leads. The toolbar sits in the frame, below or merged with the title bar [APL-10] [APL-11]. Every toolbar command is also in the menu bar [APL-11]. The product's phone layouts do not apply. |
| Keyboard, pointer, trackpad | Control-F2 to the menu bar, Control-F5 to the toolbar, Control-F4 to the active window [APL-16]. Show Sidebar and Hide Sidebar in the View menu [APL-10]. The product's skip link has no counterpart in the registry. |
| Haptics | None [APL-18]. |
| Brand may change | The rail's look and the product's width thresholds. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. The sidebar leads and the toolbar sits in the frame [APL-10] [APL-11]. |
| Platform owns | The window frame, title bar, menu bar and toolbar overflow [APL-11]. Sidebar size from General settings [APL-10]. |
| Not confirmed | Skip links on macOS. The window API itself. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
