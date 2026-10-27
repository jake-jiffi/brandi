# NavGroup on iOS and iPadOS

A group of destinations on iOS is a sidebar section with a short label, collapsible with a disclosure control.

```yaml
component: NavGroup
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
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
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
| Native control | A section of the sidebar. Disclosure controls group hierarchy and keep the sidebar's length manageable [APL-10]. The Disclosure controls page and API: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Short, descriptive group labels, with needless words cut [APL-10]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Open or closed when `collapsible` [APL-10]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The label takes `isHeader` or `.header` [APL-23] [APL-29]. How VoiceOver hears open and closed: not confirmed. |
| Navigation placement | In the iPad sidebar, with no more than two levels of hierarchy [APL-10]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. |
| Haptics | None specified for navigation groups. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Short uppercase labels, and whether a group collapses. The registry sets no case for sidebar group labels. Apple asks only that they be succinct [APL-10]. |
| Platform owns | The disclosure control's drawing [APL-10]. |
| Not confirmed | The disclosure control API: the Disclosure controls page is not in the registry. How VoiceOver hears expanded and collapsed: no trait in the registry covers it. |
