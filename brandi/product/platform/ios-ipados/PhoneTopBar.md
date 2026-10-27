# PhoneTopBar on iOS and iPadOS

A detail screen's top bar on iOS is the toolbar, which iOS also calls a navigation bar, with Back and the screen's title.

```yaml
component: PhoneTopBar
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
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
| Native control | The toolbar at the top of the view, sometimes called a navigation bar in iOS [APL-11]. The standard Back button uses the standard symbol, never the word "Back" [APL-11]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. |
| Type | A concise title, under 15 characters [APL-11]. A large title can shrink to a standard one on scroll [APL-11]. The title follows Dynamic Type [APL-3]. |
| Colour and theme | Few custom backgrounds. A scroll edge effect separates the bar from the content [APL-11]. |
| States | A large title or a standard one [APL-11]. |
| Motion | The title's change on scroll is the system's [APL-11]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. After navigating, the new screen's title is the first thing heard [APL-19]. Its title takes `isHeader` in SwiftUI or `.header` in UIKit [APL-23] [APL-29]. |
| Navigation placement | The top of the screen, Back on the leading edge [APL-11]. On iPhone Duo's outer display it moves to the side, with Back at the top of the vertical axis [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. Bar buttons take the highlight effect [APL-17]. |
| Haptics | None specified for the top bar. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The title wording. The web shell's top bar carries a menu button and the lockup. Apple asks apps not to use the app's name as a window's title [APL-11], and iOS navigates with a tab bar or sidebar [APL-9] [APL-10]. Where the product keeps them, its guidelines apply (2.3). |
| Platform owns | The Back button, the large title's behaviour and Liquid Glass [APL-11] [APL-7]. |
| Not confirmed | Moving VoiceOver to the new screen's main content in code: the registry names no focus API. |
