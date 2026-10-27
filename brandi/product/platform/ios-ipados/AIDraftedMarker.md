# AIDraftedMarker on iOS and iPadOS

On iOS, one line on a draft says who asked the assistant for it and how the brand check went.

```yaml
component: AIDraftedMarker
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
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
| Native control | None. Static text tied to the draft and grouped with it [APL-19]. |
| Target and spacing | Only the issues link is pressed: the 44 × 44 pt default where it can, never below 28 × 28 pt [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. The `ai` tone is kept for that one meaning, and the words say it too [APL-4] [APL-1]. |
| States | Passed, issues, checking, not checked and edited, each in words [APL-19]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads it with the draft, as part of the draft's description, never as an announcement [APL-19]. The issues link takes `isLink` or `.link` [APL-23] [APL-29]. |
| Navigation placement | On the draft itself, grouped with it [APL-19]. |
| Keyboard, pointer, trackpad | The issues link: Full Keyboard Access reaches controls [APL-16]. Nothing else is focusable. |
| Haptics | None specified for the drafted marker. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The wording, "Drafted with AI by [name], brand check passed", in the brand's voice [APL-8]. |
| Platform owns | VoiceOver's grouping of the line with the draft [APL-19]. |
| Not confirmed | How to tie the line to the draft as its description in SwiftUI or UIKit: the registry names no description or hint API. |
