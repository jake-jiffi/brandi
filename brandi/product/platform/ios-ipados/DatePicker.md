# DatePicker on iOS and iPadOS

A date on iOS is picked with the system date picker, and typing a date always works too.

```yaml
component: DatePicker
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-25
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A picker, which plays system haptics on supported iPhones [APL-18]. The date picker's API and styles: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Let text grow to at least 200 percent [APL-1]. |
| Colour and theme | Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. |
| States | Closed, open and chosen, and invalid when a typed date does not parse. The error is announced [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads the field's label and the chosen date [APL-19]. The system picker's traits: not confirmed. |
| Navigation placement | In a form or a report's controls, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | The product's keys, arrows by day and Page Up and Page Down by month, are its own. On iPadOS, Full Keyboard Access reaches the system control [APL-16]. |
| Haptics | Pickers play system haptics on supported iPhones [APL-18]. |
| Brand may change | The date format, the label, and typing as a fallback. Apple asks brands to work through familiar components [APL-8], so the system picker comes first. |
| Platform owns | The picker's haptics [APL-18] and its handling under Full Keyboard Access [APL-16]. |
| Not confirmed | The date picker API, its styles, its VoiceOver traits and its keyboard handling: the Pickers page is not in the registry. |
