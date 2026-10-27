# ErrorSummary on iOS and iPadOS

After a failed save on iOS, a titled list at the top of the form names each problem and moves VoiceOver to it.

```yaml
component: ErrorSummary
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
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
| Native control | None named in the registry. The closest pattern is a section at the top of the form whose lines are buttons that move to each field [APL-2]. Apple warns against alerts that only inform [APL-13], so this stays inline. |
| Target and spacing | Each line is a button. Hit region at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Danger tone with an icon, never colour alone [APL-1] [APL-4]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Shown after a failed save and gone after the next successful one. Its appearance is news, so VoiceOver hears it [APL-19]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Its title takes `isHeader` in SwiftUI or `.header` in UIKit [APL-23] [APL-29]. When the summary appears, post an `AccessibilityNotification` and move VoiceOver to it [APL-19]. Each line is a button, `isButton` or `.button`, that moves to its field [APL-23] [APL-29]. |
| Navigation placement | The top of the form, so VoiceOver reads it first in reading order [APL-19]. |
| Keyboard, pointer, trackpad | It appears after a save, the person's own action, so moving focus there is not the unprompted focus change Apple warns against [APL-15]. Each line then moves to its field. |
| Haptics | A notification haptic can report a failed save [APL-18]. The product sets none, and any haptic stays optional [APL-18]. |
| Brand may change | The title, "Fix these and try again" by default, and the messages, in the brand's voice [APL-8]. Each message matches its field error word for word. Used for forms longer than about five fields, or when an error is out of view. |
| Platform owns | VoiceOver's reading order and how it delivers the notification [APL-19]. |
| Not confirmed | How to move VoiceOver to the summary in code: the registry names `AccessibilityNotification` but no focus API. |
