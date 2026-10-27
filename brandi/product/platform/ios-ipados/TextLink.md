# TextLink on iOS and iPadOS

An inline link on iOS is text in the system link colour that navigates, and VoiceOver reads it as a link.

```yaml
component: TextLink
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
  - key: APL-21
    url: https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/glassprominent
    marker: iOS 26.0+, macOS 26.0+
    read: 2026-10-27
  - key: APL-22
    url: https://developer.apple.com/documentation/swiftui/primitivebuttonstyle/borderedprominent
    marker: iOS 15.0+, macOS 12.0+
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
| Native control | Not confirmed: no registry page names an iOS link control. The button style pages list a `link` style "for buttons that emulate links" [APL-21] [APL-22], with no iOS availability given. The system `link` colour is for text that works as a link [APL-4]. |
| Target and spacing | Apple's minimum control size is 28 × 28 pt, and 44 × 44 pt the default [APL-1]. A link inside running text: not confirmed. |
| Type | The link takes the text style of the sentence around it [APL-3]. Let text grow to at least 200 percent [APL-1]. |
| Colour and theme | The system `link` colour, or the product's `link` role with light, dark and increased-contrast variants [APL-4]. Apple warns against styling plain text in the colour that marks interactive elements [APL-4]. The underline means colour is not the only cue [APL-1]. |
| States | Not confirmed: no registry page lists the states of a link. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Trait `isLink` in SwiftUI or `.link` in UIKit [APL-23] [APL-29]. The text says where it goes, so it works as the label [APL-19]. |
| Navigation placement | Running text in the content layer. A link navigates and a button acts, so "Try again" is a button [APL-2]. |
| Keyboard, pointer, trackpad | iPhone has no focus system [APL-15]. Full Keyboard Access reaches controls on iOS and iPadOS [APL-16]. Whether it reaches a link inside text, and the iPadOS pointer over a link: not confirmed. |
| Haptics | None specified for links. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The `link` colour role, the underline and the icon. The text says where it goes and is unique on the page, never "here" or "more". One colour never marks both links and plain text [APL-4]. |
| Platform owns | Not confirmed: no registry page says what the system does when a link opens a web address or another app. |
| Not confirmed | The native link control and its iOS availability. Hit size inside running text. Link states, visited and hover included. Whether Full Keyboard Access reaches a link inside text, and how the pointer looks over one on iPadOS. What happens when a link opens. |
