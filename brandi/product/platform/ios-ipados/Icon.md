# Icon on iOS and iPadOS

An icon on iOS is a symbol drawn in the text colour, from the product's one set rather than Apple's SF Symbols.

```yaml
component: Icon
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
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
| Native control | SF Symbols, which Apple suggests for familiar actions, such as `square.and.arrow.up` for sharing [APL-2]. A custom icon is better drawn as a custom symbol than as a bitmap [APL-10]. The product's own set is not SF Symbols, so it carries the behaviours below itself. |
| Target and spacing | An icon alone takes no hit area. Inside a control it takes that control's hit region of at least 44 × 44 pt [APL-2]. |
| Type | Meaningful icons grow with the text size. SF Symbols do this by themselves and match the weight of the text beside them [APL-3]. A custom set has to scale the same way [APL-3]. |
| Colour and theme | Tint icons with dynamic colours so they work in both appearances [APL-5]. Draw separate light and dark versions only when one drawing fails in one appearance [APL-5]. Status icons pair colour with shape, never colour alone [APL-1]. |
| States | An icon has no states of its own. It takes its control's. System symbols get the right colouring and vibrancy at rest and in response to interaction [APL-11]. |
| Motion | Symbols can animate with SF Symbols 5 or later [APL-6]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. A decorative icon is hidden with `accessibilityHidden(_:)` [APL-19]. One with a `label` is described for what it shows, and takes `isImage` in SwiftUI or `.image` in UIKit [APL-19] [APL-23] [APL-29]. |
| Navigation placement | Wherever its control sits. Tab bars prefer filled symbols [APL-9]. Toolbars prefer system symbols without borders [APL-11]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for icons. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The product uses one icon set by name, never emoji and never a second library. That set replaces SF Symbols, which Apple suggests for familiar actions [APL-2]. The product's guidelines apply (2.3), so its icons must grow with the text as symbols do [APL-3]. Icon sizes come from the product's tokens. |
| Platform owns | Dynamic Type, which drives icon size when icons follow the text [APL-3]. The vibrancy system symbols take on materials [APL-11]. |
| Not confirmed | Symbol sizes per text style, and how a custom set scales with Dynamic Type in code: the SF Symbols and Icons pages are not in the registry. |
