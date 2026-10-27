# EmptyState on iOS and iPadOS

On iOS, an empty view says what is empty and what to do next, in place of the content it stands for.

```yaml
component: EmptyState
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
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
| Native control | Not confirmed: no registry page names an empty-state view. Apple asks that an empty section say why its content is unavailable [APL-9]. |
| Target and spacing | Its action buttons keep hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. A `page` title takes a large heading style [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. The picture looks right in both appearances, or has light and dark versions [APL-5]. |
| States | Six kinds: nothing yet, no results, all done, could not load, no access and not found. Each has its own words, so the state never rests on the picture [APL-1]. |
| Motion | The character's loop stops under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Its title takes `isHeader` in SwiftUI or `.header` in UIKit [APL-23] [APL-29]. The picture is decoration, hidden with `accessibilityHidden(_:)` [APL-19]. |
| Navigation placement | In place of the empty content: a page, a section, or a table's rows, keeping the header and toolbar. A tab whose section is empty stays enabled [APL-9]. |
| Keyboard, pointer, trackpad | Its buttons: On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for empty states. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The character state for each kind, the size (`page`, `section` or `compact`) and the copy. Branding defers to content [APL-8], so the character marks the state and never decorates. |
| Platform owns | Dynamic Type [APL-3]. |
| Not confirmed | A native empty-state view and its layout. |
