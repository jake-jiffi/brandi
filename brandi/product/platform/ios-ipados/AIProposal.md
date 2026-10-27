# AIProposal on iOS and iPadOS

On iOS the assistant asks before it acts with a card in the content, and nothing happens until a person presses the button.

```yaml
component: AIProposal
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
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
| Native control | None. The closest pattern is a card in the content layer [APL-7]. An alert can confirm an important action a person started [APL-13], but a proposal comes from the assistant and waits in place. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | While it waits, the assistant's colour runs round the card and a "Needs you" badge says so in words, so colour is never alone [APL-1]. A `danger` proposal's action takes the destructive role, system red [APL-2]. |
| States | Asking, working, done, failed and dismissed, shown as Needs you, In progress, Done, Failed and Not done. Each change is reported to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Its title takes `isHeader` in SwiftUI or `.header` in UIKit [APL-23] [APL-29]. Not now, Edit and Try again are described by the question, so VoiceOver says what they act on [APL-19]. Once pressed, the outcome is announced and takes focus [APL-19]. |
| Navigation placement | In the answer that proposed it, in the content layer [APL-7]. One proposal waits at a time. |
| Keyboard, pointer, trackpad | The buttons run Not now, Edit, then the action, with the default trailing as Apple's order asks [APL-13]. Return activates the primary [APL-2]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | A notification haptic can report the outcome [APL-18]. The product sets none, and any haptic stays optional [APL-18]. |
| Brand may change | The title, a question with the thing and the count, and `confirmLabel`, the verb and the count. Its action is the only primary on screen while it waits, within Apple's one or two prominent buttons per view [APL-2]. Up to five records, with "and 12 more" in the note. Button labels are in sentence case. Apple asks for title-style capitalisation on buttons [APL-2] and sentence-style on alert buttons [APL-13]. The product's guidelines apply (2.3). |
| Platform owns | How VoiceOver delivers the outcome [APL-19]. |
| Not confirmed | Apple's guidance on actions taken by generative features: the Generative AI page is not in the registry. |
