# AIAnswer on macOS

AIAnswer is what the assistant made on macOS: the question as its heading, the steps, the answer, its sources, its status and the next move.

```yaml
component: AIAnswer
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
| Native control | None in the registry. Text, links and push buttons in the content, under a heading [APL-19] [APL-33]. |
| Target and spacing | Footer buttons and source links meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | The question as a heading in Title 3 or Headline, the answer in Body 13 pt [APL-3]. Avoid tight leading on three or more lines [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. Only the newest answer's main action takes the prominent style, one or two per view [APL-2]. |
| States | Thinking, streaming, drafted, answered, stopped and failed. A failure reads Failed and offers one Try again. Status is always a word, never colour alone [APL-1]. |
| Motion | The streaming caret stops blinking under Reduce Motion, which asks for less repeating animation [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. One status line speaks when the work starts and when it ends, through `AccessibilityNotification` [APL-19]. An answer that loads finished stays quiet. After Try again or Stop, focus moves to the steps line or the question, never the page. Each move follows the person's press, as Apple's focus guidance asks [APL-15]. |
| Navigation placement | In one column with the AskBar, newest answer last. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches its buttons and links [APL-16]. Apple gives Esc the meaning "cancel the current action or process" [APL-16], so whether Esc should also stop a running answer is open. |
| Haptics | None [APL-18]. |
| Brand may change | Status words, the caveat, suggestions and footer wording. Apple asks for one or two prominent buttons per view [APL-2]. |
| Platform owns | VoiceOver announcement timing [APL-19]. |
| Not confirmed | Announcement priority on macOS. Whether Esc should stop a running answer. Placement guidance for an answer. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
