# StatusLine on iOS and iPadOS

The answer's one live status line on iOS says in words when work starts, changes step, stops, fails or finishes, and holds Stop when there is no composer.

```yaml
component: StatusLine
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The closest pattern is a line of text that VoiceOver hears when it changes [APL-19]. |
| Target and spacing | Stop, when it sits here, keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Working, a step changing, waiting for approval, done, stopped and failed. Only changes are announced, so a finished answer that loads says nothing [APL-19]. |
| Motion | Under reduced motion the grid holds its dim frame and the timer keeps counting [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Post an `AccessibilityNotification` only when the step or state changes, never as the clock ticks [APL-19]. The grid, shimmer and timer are hidden with `accessibilityHidden(_:)` [APL-19]. The same failure twice is announced twice. |
| Navigation placement | With its answer, near the content it describes [APL-20]. |
| Keyboard, pointer, trackpad | Stop: On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for the status line. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The words for each state, with numbers as words ("step 2 of 3"), in the brand's voice [APL-8]. |
| Platform owns | How VoiceOver delivers each announcement [APL-19]. |
| Not confirmed | How to make a repeated message announce again on iOS: the registry names `AccessibilityNotification` but not how it treats repeats. |
