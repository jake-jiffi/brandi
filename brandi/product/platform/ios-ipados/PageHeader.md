# PageHeader on iOS and iPadOS

The top of a screen on iOS is its toolbar, which iOS also calls a navigation bar, with the title, Back and the screen's actions.

```yaml
component: PageHeader
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
| Native control | The toolbar, holding the title, navigation controls and actions [APL-11]. In iOS a navigation toolbar is sometimes called a navigation bar [APL-11]. A large title shrinks to a standard one as people scroll, `prefersLargeTitles` [APL-11]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. |
| Type | A concise title, under 15 characters, never the app's name [APL-11]. The title follows Dynamic Type [APL-3]. |
| Colour and theme | Few custom toolbar backgrounds or tinted controls: the content layer informs the toolbar's colour [APL-11]. One `.prominent` action takes the tint [APL-11]. |
| States | A large title at the top, a standard title once people scroll [APL-11]. |
| Motion | The title's change on scroll is the system's [APL-11]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The title is the first thing people hear on a screen, so it is unique and says what the screen holds [APL-19]. Its title takes `isHeader` in SwiftUI or `.header` in UIKit [APL-23] [APL-29]. |
| Navigation placement | The top of the screen: navigation and the title leading, actions trailing [APL-11]. On iPhone Duo's outer display the toolbar moves to the side [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. Bar buttons take the highlight effect [APL-17]. |
| Haptics | None specified for the page header. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The title is the noun people use, never "Dashboard". Long titles wrap in the product, where Apple asks for under 15 characters [APL-11]. The product's guidelines apply (2.3). Breadcrumbs give way to the Back button on iOS [APL-11]. Badges and the description sit under the title. |
| Platform owns | The large title's behaviour [APL-11]. The toolbar's Liquid Glass and placement [APL-7] [APL-11]. |
| Not confirmed | Where meta badges and a description sit relative to a toolbar title: no registry page covers them. |
