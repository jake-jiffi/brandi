# Sidebar on iOS and iPadOS

The rail on iOS is the iPad sidebar on the leading side, and on most iPhone screens the tab bar takes its place.

```yaml
component: Sidebar
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-2
    url: https://developer.apple.com/design/human-interface-guidelines/buttons
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-3
    url: https://developer.apple.com/design/human-interface-guidelines/typography
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A sidebar, in the `sidebarAdaptable` tab view or the primary column of `NavigationSplitView` or `UISplitViewController` [APL-10]. Outside SwiftUI, a collection view list with the sidebar appearance [APL-10]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Group labels are short and descriptive [APL-10]. |
| Colour and theme | It floats on Liquid Glass, more opaque in a sidebar to keep it legible [APL-4] [APL-10]. Icons take the app accent by default, and fixed icon colours carry meaning, sparingly [APL-10]. |
| States | Shown or hidden, never hidden by default [APL-10]. A focused row on iPadOS draws white text on the accent colour [APL-15]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Group labels take `isHeader` or `.header`, and the current item `isSelected` or `.selected` [APL-23] [APL-29]. The account button is named "[name], [role], account menu" [APL-19]. |
| Navigation placement | iPadOS: the leading side, with content able to extend beneath it [APL-10]. iPhone: the tab bar, since a sidebar needs a large amount of space [APL-9] [APL-10]. iPhone Duo's inner display has room for a split view [APL-20]. |
| Keyboard, pointer, trackpad | iPadOS includes sidebars in its focus system: Tab reaches the sidebar and the arrow keys move within it [APL-15] [APL-16]. People hide and show it with the edge swipe [APL-10]. |
| Haptics | None specified for the sidebar. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The lockup at the top, search or ask, the groups and the signed-in person. Eight top-level items at most, in groups under short uppercase labels, with settings and help in the footer. Apple asks for no more than two levels of hierarchy [APL-10]. The collapsed rail's hover tooltips do not carry over: Apple describes hover tooltips only for macOS and visionOS [APL-2]. |
| Platform owns | The Liquid Glass layer [APL-7], the edge swipe and the tab bar conversion [APL-10]. |
| Not confirmed | Whether uppercase group labels suit the sidebar appearance: the registry sets no case for them. A footer area in an iPadOS sidebar. |
