# Popover on iOS and iPadOS

A non-modal panel anchored to a control on iOS is a popover, for a definition, a quick filter or a short edit.

```yaml
component: Popover
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A popover. Apple's materials page gives popovers the regular Liquid Glass variant, which suits text [APL-7], and Dark Mode lifts a popover onto the elevated background [APL-5]. The Popovers page and the API: not confirmed. |
| Target and spacing | Its trigger keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | The regular Liquid Glass variant blurs what is behind it so text stays legible [APL-7]. Dark Mode moves it to the elevated background by itself [APL-5]. |
| States | Open and closed. Esc, Apple's standard cancel key, or a press elsewhere closes it [APL-16]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The trigger takes `isButton` or `.button` [APL-23] [APL-29]. When it opens, post an `AccessibilityNotification` so its content is read [APL-19]. |
| Navigation placement | Anchored to its control. On iPhone Duo, custom components move clear of the fold with `ReservedRegion` or `UIView.ReservedRegion` [APL-20]. |
| Keyboard, pointer, trackpad | Esc, Apple's standard cancel key, closes it [APL-16], and focus goes back to the trigger. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for popovers. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The content and the width. A press or tap opens it. The product's hover opening is not confirmed on iOS. A restyle keeps familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | The elevated background in Dark Mode [APL-5] and the Liquid Glass variant [APL-7]. |
| Not confirmed | The popover API, how a popover presents on iPhone, and pointer hover opening on iPadOS: the Popovers page is not in the registry. |
