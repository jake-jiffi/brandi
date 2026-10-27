# Select on iOS and iPadOS

One option from a short list on iOS is a pop-up button or a picker, both system controls.

```yaml
component: Select
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
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
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
| Native control | A pop-up button, which Apple lists among button-like components [APL-2], or a picker, which plays system haptics on supported iPhones [APL-18]. Their pages and API: not confirmed. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Keep truncation to a minimum as text grows [APL-3]. |
| Colour and theme | Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. |
| States | The product's states are closed, open, the option in hand, chosen, invalid and disabled. How the system control draws each: not confirmed. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads the field's label and its current value [APL-19]. A Select outside a form row still needs its own label [APL-19]. The system control's traits: not confirmed. |
| Navigation placement | In a form. Toolbars hold menus among their items [APL-11]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | A picker plays system haptics on supported iPhones [APL-18]. A pop-up button: not confirmed. |
| Brand may change | The placeholder says what to choose, never "Select...". Option labels, descriptions and icons. Fewer than five options people should compare are a RadioGroup. A restyle keeps the control familiar [APL-8]. |
| Platform owns | The list the system presents, where it opens, and its handling under Full Keyboard Access [APL-16]. |
| Not confirmed | Which control suits which case, their API, how they draw each state, their VoiceOver traits, and whether a pop-up button plays a haptic: the Pop-up buttons and Pickers pages are not in the registry. |
