# NavItem on iOS and iPadOS

One destination on iOS is a tab bar item on iPhone or a sidebar row on iPad, with an icon, a label and an optional count.

```yaml
component: NavItem
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
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
| Native control | A tab in `TabView` or `UITabBar` [APL-9], or a sidebar row [APL-10]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. |
| Type | Tab labels are single words where possible [APL-9]. Tab titles need not grow with the text [APL-3]. |
| Colour and theme | Tab bar symbols are filled [APL-9]. Apple suggests the accent colour for the selected tab's icon [APL-8]. Sidebar icons take the accent by default [APL-10]. |
| States | Current and not current. Never disabled or hidden, even when its section is empty [APL-9]. A count shows waiting work, and zero shows nothing. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The current item carries `isSelected` or `.selected` [APL-23] [APL-29]. Counts are read as words: "Approvals, 3 need you" [APL-19]. |
| Navigation placement | iPhone: the tab bar at the bottom [APL-9]. iPad: the tab bar near the top, or the sidebar [APL-9] [APL-10]. |
| Keyboard, pointer, trackpad | Tab bars take the pointer highlight effect [APL-17]. On iPadOS, sidebar rows are in the focus system [APL-15]. |
| Haptics | None specified for navigation items. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The icon, the label and the count. A highlight count is waiting on the reader, a grey one on someone else. Apple's tab badge is a red oval for critical information only [APL-9]. The product's two counts depart from that, and its guidelines apply (2.3). |
| Platform owns | The tab bar's layout and Liquid Glass [APL-9]. Selection drawing in the sidebar [APL-15]. |
| Not confirmed | How a grey count renders in a system tab bar: the badge API is not in the registry. |
