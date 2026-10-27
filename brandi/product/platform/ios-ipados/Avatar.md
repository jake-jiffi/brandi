# Avatar on iOS and iPadOS

A person on iOS is a circular photo or initials image, read by VoiceOver with the person's name and status.

```yaml
component: Avatar
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
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
| Native control | None named in the registry. The closest pattern is an image with a label [APL-19]. |
| Target and spacing | Not pressed on its own. As a button, such as the account menu, it takes a hit region of at least 44 × 44 pt [APL-2]. |
| Type | Initials use a text style. Apple notes that not every word on screen has to grow with text size [APL-3]. |
| Colour and theme | Photos look right in both appearances [APL-5]. Initials keep 4.5:1 against their tint [APL-1]. A status shows by shape as well as colour [APL-1]. |
| States | Status: online, away, offline. Each differs in shape, not only colour [APL-1]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads the name with the status: "[Name], online" [APL-19]. Alone it takes `isImage` or `.image` [APL-23] [APL-29]. Beside a visible name, group the two so the name is read once [APL-19]. |
| Navigation placement | Beside the person's name. In a list row it takes the leading end, one of Apple's row layouts [APL-14]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for avatars. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The initials tints, the sizes and the assistant's own avatar. Circles are the one exception to the product's shape rule. A restyle keeps the familiar leading place in a row [APL-14]. |
| Platform owns | Dynamic Type for the name beside it [APL-3]. |
| Not confirmed | Avatar sizes in points, and an iOS convention for status marks: no registry page covers them. |
