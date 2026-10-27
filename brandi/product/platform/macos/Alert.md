# Alert on macOS

Alert is a message inside a window's content on macOS, which is not Apple's alert: on macOS an alert is a modal view that interrupts.

```yaml
component: Alert
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
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None for an inline message. Apple's alert, `NSAlert`, is modal and interrupts the task [APL-13], so it matches the product's Dialog. Apple asks that information people need without acting stay in context, as Mail's connection indicator does [APL-13]. The closest pattern is a message view in the content. |
| Target and spacing | Action and dismiss buttons meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Title in Headline, 13 pt bold, body in Body 13 pt [APL-3]. A title that is a full sentence takes sentence case and its ending punctuation, the same as Apple asks of alert titles [APL-13]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Every tone has an icon, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. Use a caution symbol such as `exclamationmark.triangle` only when extra attention is really needed [APL-13]. |
| States | Shown and dismissed. The dismiss button draws a press state [APL-2]. |
| Motion | It appears without sliding under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Danger and warning interrupt, the rest wait. Report the message with `AccessibilityNotification` [APL-19]. How macOS separates an interrupting announcement from a polite one: not confirmed. |
| Navigation placement | Inside the page or card it concerns, the in-context place Apple prefers for information that needs no interruption [APL-13]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches its buttons [APL-16]. |
| Haptics | None. Mac trackpad haptics do not cover messages [APL-18]. |
| Brand may change | Tones, icons, actions and wording: state, consequence, then the fix, never blaming the person. Apple asks alert copy to be direct and neutral, never accusatory [APL-13], and keeps the caution symbol for real risk [APL-13]. |
| Platform owns | VoiceOver announcement timing [APL-19]. |
| Not confirmed | Announcement priority on macOS, interrupting or polite. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
