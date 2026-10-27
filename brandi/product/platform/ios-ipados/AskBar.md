# AskBar on iOS and iPadOS

Search and ask in one field on iOS, for records, people, actions or a question for the assistant, on the product's Home screen.

```yaml
component: AskBar
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
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
  - key: APL-25
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A search field: toolbars hold them [APL-11], and an iOS tab bar can end in a search tab [APL-9]. The Search fields page and the API: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Placeholder text takes `placeholderText` [APL-4]. |
| Colour and theme | Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. |
| States | Empty, typing, and asking once a question is sent. On iPadOS the focused field shows a focus ring [APL-15]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Trait `isSearchField` or `.searchField` [APL-23] [APL-29]. The "Ask" button takes `isButton` or `.button` [APL-23] [APL-29]. When the answer arrives, post an `AccessibilityNotification` [APL-19]. |
| Navigation placement | One per product, on Home. Elsewhere the same thing opens from the sidebar's search or the palette. iOS's app-level search is a search tab at the trailing end of the tab bar [APL-9]. |
| Keyboard, pointer, trackpad | Command-K focuses it on a hardware keyboard, and Command-K is not a standard shortcut [APL-16]. A text or search field takes a focus ring. A list row takes a highlight [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | None specified for the ask bar. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The placeholder, "Search or ask" by default or the product's own words on Home, and the `action` label, in the brand's voice [APL-8]. Once there are answers, the bar and the answers share one column, newest answer last. |
| Platform owns | The search tab's place in the tab bar, if the product uses one [APL-9]. |
| Not confirmed | The search field API and suggestions: the Search fields page is not in the registry. Apple's Generative AI guidance: that page is not in the registry either. |
