# Pagination on iOS and iPadOS

Pagination on iOS stays a custom footer of previous and next buttons, since the system table scrolls through long data by itself.

```yaml
component: Pagination
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
  - key: APL-26
    url: https://developer.apple.com/documentation/swiftui/table
    marker: iOS 16.0+, macOS 12.0+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None named in the registry. `Table` scrolls by itself when rows outgrow the space [APL-26]. Previous and next are buttons [APL-2]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. The range, "1 to 25 of 312", grows with the text [APL-3]. |
| Colour and theme | Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Previous and next are unavailable at the ends. No buttons when everything fits on one page, and "No results" at zero. UIKit marks an unavailable element `.notEnabled` [APL-29]. Disabled styling: not confirmed. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads the range as words [APL-19]. Trait `isButton` in SwiftUI, `.button` in UIKit [APL-23] [APL-29]. Post an `AccessibilityNotification` when the page changes [APL-19]. |
| Navigation placement | Under the table it pages, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for pagination. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The range wording and page sizes. Filters and search beat deep paging, and the page size the person chose is kept. Restyled buttons keep familiar sizing [APL-8]. |
| Platform owns | Scrolling within the table [APL-26]. |
| Not confirmed | An iOS paging pattern for long lists: no registry page covers one. Disabled styling. |
