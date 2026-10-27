# Tag on iOS and iPadOS

A category on iOS is an outlined label with its colour dot, and a remove button when someone can take it off.

```yaml
component: Tag
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
| Native control | None named in the registry. The closest pattern is a text label, with a button to remove it when `onRemove` is set [APL-2]. |
| Target and spacing | The remove button keeps a hit region of at least 44 × 44 pt [APL-2], however small it draws. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Nothing under 11 pt, the iOS minimum [APL-1]. |
| Colour and theme | The dot matches the category's chart series, and the word carries the meaning, never the dot alone [APL-1]. One colour, one category [APL-4]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Rest, and the remove button's press state [APL-2]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads the category as static text [APL-23]. The remove button is named "Remove [tag]" and takes `isButton` or `.button` [APL-23] [APL-29]. |
| Navigation placement | On a record. Related tags group so VoiceOver reads them together [APL-19]. |
| Keyboard, pointer, trackpad | The remove button: On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for tags. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The outlined shape and the category's dot. A category keeps its colour everywhere, and status is a Badge, never a Tag. One colour never means two things [APL-4]. |
| Platform owns | Full Keyboard Access for the remove button [APL-16]. |
| Not confirmed | A native token or tag control for iOS. |
