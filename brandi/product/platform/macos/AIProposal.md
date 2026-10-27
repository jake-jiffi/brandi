# AIProposal on macOS

AIProposal is the assistant asking before it acts on macOS: a card in the content where nothing happens until a person presses the button.

```yaml
component: AIProposal
platform: macos
checked_against: macOS 27 Golden Gate
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
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
  - key: APL-33
    url: https://developer.apple.com/documentation/appkit/nsbutton/bezelstyle-swift.enum/push
    marker: macOS
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None in the registry. An inline card with push buttons [APL-33]. Apple's alert confirms important actions people started themselves [APL-13]. Here the assistant started it, and the card stays in the content. |
| Target and spacing | Apple's Buttons page asks for a hit region of at least 44 × 44 pt on every platform except visionOS [APL-2]. Its Accessibility page gives macOS controls a 28 × 28 pt default and a 20 × 20 pt minimum, with about 12 pt of padding around a bezelled control [APL-1]. The pages do not say how the two combine, so both are recorded. |
| Type | The title asks the question with the thing and the count, in Headline [APL-3]. Apple asks for title-style capitalisation on buttons [APL-2]. The product writes sentence case, and its guidelines apply (2.3). |
| Colour and theme | While it waits, the assistant's colour runs round the card as well as the badge, never colour alone [APL-1]. Its action is the only prominent button on screen [APL-2]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Asking, working, done, failed and dismissed. When it would delete, Apple's alert guidance supports the destructive style, because the person did not choose the action themselves [APL-13]. |
| Motion | The outcome replaces the buttons without a slide under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The card is grouped under its heading [APL-19]. Once pressed, the outcome takes focus and is reported with `AccessibilityNotification` [APL-19]. Buttons carry `isButton` [APL-23]. |
| Navigation placement | In the answer column. The buttons run Not now, Edit, then the action, which puts the action on the trailing side, as Apple places the default button [APL-13]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches every button [APL-16]. Return as the action's key equivalent: not confirmed, since the card is not modal. |
| Haptics | None [APL-18]. |
| Brand may change | Wording, the waiting colour and the note. Apple asks for one or two prominent buttons per view [APL-2], and the proposal's action is the only one while it waits. |
| Platform owns | VoiceOver announcement timing [APL-19]. |
| Not confirmed | Whether a non-modal card may own the Return key on macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
