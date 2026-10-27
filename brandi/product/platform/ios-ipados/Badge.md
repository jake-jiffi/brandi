# Badge on iOS and iPadOS

A status badge on iOS is a short coloured label on a record, read as words, and not the badge Apple puts on tabs.

```yaml
component: Badge
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
| Native control | None for a status label on a record. Apple's badge is the red oval on a tab, reserved for critical information [APL-9], a different job. The closest pattern is a text label with a tone and an icon [APL-1]. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Short labels keep truncation rare as text grows [APL-3]. Nothing under 11 pt, the iOS minimum [APL-1]. |
| Colour and theme | Each tone pairs a word, and optionally an icon, with its colour [APL-1] [APL-4]. A status colour means the same everywhere [APL-4]. Colours carry different meanings across cultures, so the word decides [APL-4]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | None. It is read, not pressed: static text [APL-23]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads the word as static text, `isStaticText` or `.staticText` [APL-23] [APL-29]. A label cut short keeps its full text as the VoiceOver label [APL-19]. |
| Navigation placement | On a record: a list row, a card, or beside a title. Apple's tab bar badge is not used for record status [APL-9]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for badges. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The seven tones and their words, the same in every product, in sentence case with no full stop. The small radius, never the pill. Apple suggests the accent colour for status indicators [APL-8]. The product's tones take their own roles instead. |
| Platform owns | Dynamic Type [APL-3] and Increase Contrast [APL-25]. |
| Not confirmed | A text style and size for badges: no registry page sets them. Showing a cut label in full on touch. |
