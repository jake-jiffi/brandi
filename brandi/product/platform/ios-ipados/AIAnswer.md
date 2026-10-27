# AIAnswer on iOS and iPadOS

What the assistant made on iOS is a block in the content: the question as its heading, the steps, the answer, its sources, its status and the person's next move.

```yaml
component: AIAnswer
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
| Native control | None. The closest pattern is a titled region in the content layer [APL-7]. |
| Target and spacing | Stop, Try again, the suggestions and the actions keep hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Three or more lines never take tight leading [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. It sits in the content layer, so it takes a standard material, never Liquid Glass [APL-7]. |
| States | Thinking, streaming, then Drafted, Answered, Stopped or Failed. A failure names the step and the system, with one Try again. Each change of state is reported to VoiceOver [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The question is the heading, `isHeader` or `.header` [APL-23] [APL-29]. One status line speaks when the work starts and when it ends, giving the status and the answer's first sentence: post an `AccessibilityNotification` for each [APL-19]. An answer that loads finished posts nothing. |
| Navigation placement | In the content, in one column with the AskBar, newest answer last. VoiceOver reads it in that order [APL-19]. |
| Keyboard, pointer, trackpad | After Try again or Stop, focus moves to the steps line or the question, never the page. That follows a press, so it is not the unprompted focus change Apple warns against [APL-15]. On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | A notification haptic can report an outcome [APL-18]. The product sets none, and any haptic stays optional [APL-18]. |
| Brand may change | The status words, the caveat, which "The assistant can be wrong." always follows, up to three suggestions as quiet buttons, and the actions. With several answers on screen, only the newest one's main action is primary, which keeps to Apple's one or two prominent buttons per view [APL-2]. No model names, prompts or tokens on screen. |
| Platform owns | How VoiceOver delivers announcements [APL-19]. Reduce Motion [APL-24]. |
| Not confirmed | Apple's guidance for generative features: the Generative AI page is not in the registry. How to move VoiceOver to a given element in code. |
