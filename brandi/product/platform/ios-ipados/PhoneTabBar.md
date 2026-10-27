# PhoneTabBar on iOS and iPadOS

Three to five top-level places at the foot of a phone app on iOS are the system tab bar, floating on Liquid Glass.

```yaml
component: PhoneTabBar
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-9
    url: https://developer.apple.com/design/human-interface-guidelines/tab-bars
    marker: 2026-06-08
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
| Native control | The tab bar: SwiftUI `TabView`, UIKit `UITabBar` [APL-9]. On iPhone it floats above the content at the bottom, on Liquid Glass [APL-9]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. |
| Type | Tab labels, single words where possible, sit under the icon in compact views and beside it in regular ones [APL-9]. Tab titles need not grow with the text [APL-3]. |
| Colour and theme | Filled symbols [APL-9]. Over colourful content, a monochrome tab bar or an accent with enough contrast [APL-9]. Apple suggests the accent colour for the selected tab's icon [APL-8]. |
| States | Current and not current. Never disabled or hidden: an empty section explains itself [APL-9]. With an accessory, the bar can minimise as people scroll [APL-9]. |
| Motion | Minimising on scroll is the system's [APL-9]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. UIKit marks the bar `.tabBar` [APL-29]. The current tab carries `isSelected` or `.selected` [APL-23] [APL-29]. Counts are read as words [APL-19]. |
| Navigation placement | iPhone: floating at the bottom [APL-9]. iPadOS: near the top, and able to become a sidebar [APL-9]. iPhone Duo's outer display: on the side [APL-20]. A search tab can sit at the trailing end [APL-9]. |
| Keyboard, pointer, trackpad | The tab bar takes the pointer highlight effect [APL-17]. On iPadOS, Full Keyboard Access reaches the tabs [APL-16]. |
| Haptics | None specified for tab bars. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The places, icons, labels and counts. Apple asks for few tabs, warns against the More tab, and keeps the tab bar for navigation, with actions in a toolbar [APL-9]. So the primary action the web shell puts in a foot bar goes in the toolbar on iOS. The highlight and grey counts depart from Apple's red badge for critical information [APL-9]. The product's guidelines apply (2.3). |
| Platform owns | Placement, Liquid Glass, minimising and the More tab [APL-9]. The side bar on iPhone Duo [APL-20]. |
| Not confirmed | The badge API, and how many tabs fit before the More tab appears on each iPhone: the registry gives no number. |
