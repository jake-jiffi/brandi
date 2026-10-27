# StatusLine on macOS

StatusLine holds the answer's one live status on macOS: it speaks when work starts, changes step, waits, stops, fails or finishes.

```yaml
component: StatusLine
platform: macos
checked_against: macOS 27 Golden Gate
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
| Native control | None in the registry. A line of text that reports its changes to VoiceOver through `AccessibilityNotification` [APL-19]. With no composer, Stop sits at its end as a push button [APL-33]. |
| Target and spacing | Stop meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Working, waiting, done, stopped and failed, each in words [APL-1]. A finished answer that loads says nothing. |
| Motion | The grid and shimmer stop under Reduce Motion [APL-1] [APL-24]. The timer keeps counting. |
| Accessibility API | VoiceOver. Report each change of step or state with `AccessibilityNotification` [APL-19], never each tick of the timer. Numbers go in as words, "step 2 of 3". The grid, shimmer and timer are hidden [APL-19]. |
| Navigation placement | In each answer. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches Stop [APL-16]. Apple gives Esc the meaning "cancel the current action or process" [APL-16], so whether Esc also stops the work is open. |
| Haptics | None [APL-18]. |
| Brand may change | The moments it speaks and their words. Apple asks apps to tell VoiceOver about visible changes [APL-19], which the line does. |
| Platform owns | VoiceOver announcement timing [APL-19]. |
| Not confirmed | How to repeat an identical announcement on macOS. Announcement priority. Whether Esc should stop the work. Placement guidance for the line. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
