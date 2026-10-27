# SearchField on iOS and iPadOS

A search field on iOS filters what is on screen from a toolbar, or at app level from a search tab at the trailing end of the tab bar.

```yaml
component: SearchField
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
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A search field. Toolbars hold search fields among their navigation controls [APL-11], and an iOS tab bar can end in a dedicated search tab [APL-9]. The Search fields page and the API: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Placeholder text takes `placeholderText` [APL-4]. |
| Colour and theme | Standard fields take corner radii concentric with the bar [APL-11]. Keep the field's colours clear of colourful content behind the bar [APL-11]. Every custom colour needs light, dark and increased-contrast variants [APL-4]. |
| States | Focused: a focus ring on iPadOS [APL-15]. Other states: not confirmed. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Trait `isSearchField` in SwiftUI or `.searchField` in UIKit [APL-23] [APL-29]. Its label says what is searched, such as "Search clients" [APL-19]. When the results change, post an `AccessibilityNotification` [APL-19]. |
| Navigation placement | In the toolbar, on the trailing edge [APL-11]. At app level on iPhone, a search tab at the trailing end of the tab bar [APL-9]. |
| Keyboard, pointer, trackpad | Apple's standard shortcuts include Command-F to open Find and Option-Command-F to jump to the search field [APL-16]. iPadOS includes search fields in its focus system, with a focus ring [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | None specified for search fields. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The placeholder wording and the `shortcut` key. The product's single-key shortcut, such as "/", obeys Root's setting and never fires while someone types elsewhere. Apple's standard shortcut for reaching a search field is Option-Command-F [APL-16]. Searching everything is the AskBar's or the CommandMenu's job. |
| Platform owns | The search tab and its place in the tab bar [APL-9]. Bar corner radii [APL-11]. The focus ring [APL-15]. |
| Not confirmed | The search field API, its states, scope controls and suggestions: the Search fields and Searching pages are not in the registry. |
