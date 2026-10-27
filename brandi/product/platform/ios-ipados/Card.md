# Card on iOS and iPadOS

A card on iOS is a grouped region in the content layer, with a title, a body and optional actions.

```yaml
component: Card
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
| Native control | None named in the registry. The closest pattern is a grouped region on the secondary background, which groups content within the overall view [APL-4]. |
| Target and spacing | With `href`, the whole card is the target, at least the 44 × 44 pt default [APL-1]. Buttons inside keep their own hit regions [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. The title takes a heading style and scales with the body [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | `secondarySystemBackground` groups content within the view, and `tertiarySystemBackground` groups within that [APL-4]. Dark Mode lifts foreground layers onto elevated backgrounds, and system backgrounds keep that distinction [APL-5]. It sits in the content layer, so it takes a standard material, never Liquid Glass [APL-7]. |
| States | Rest, pressed when it has `href` [APL-2], and `selected`, shown by more than colour [APL-1]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Its title takes `isHeader` in SwiftUI or `.header` in UIKit [APL-23] [APL-29]. With `href`, the card reads as one element that opens, and the buttons inside stay separate [APL-19]. |
| Navigation placement | The content layer of a page or pane [APL-7]. |
| Keyboard, pointer, trackpad | On iPadOS, cards in a collection can join the focus system as a focus group [APL-15]. An `interactive` card takes the hover effect for large elements, with scale and shadow together [APL-17]. |
| Haptics | None specified for cards. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Radius, shadow, padding, and the `flat` and `flush` options. Never a card inside a card, and no small uppercase label above the title. The product's `interactive` lift maps to Apple's hover effect for large elements [APL-17]. |
| Platform owns | Base and elevated backgrounds in Dark Mode [APL-5]. |
| Not confirmed | A card or box control for iOS, and its corner radius: no registry page covers them. |
