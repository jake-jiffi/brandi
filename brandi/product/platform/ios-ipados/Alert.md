# Alert on iOS and iPadOS

An inline message on iOS is a custom view inside the page or card it concerns, since Apple's own alert is modal.

```yaml
component: Alert
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
| Native control | None. Apple's alert is a modal view that interrupts [APL-13]. For information that needs no decision, Apple prefers a message in context, such as Mail's indicator when the server cannot be reached [APL-13]. That is this component. |
| Target and spacing | Its action and dismiss buttons keep hit regions of at least 44 × 44 pt [APL-2]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Each tone pairs its colour with an icon and words [APL-1] [APL-4]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. It sits in the content layer, so it takes a standard material, never Liquid Glass [APL-7]. |
| States | Six tones: `neutral`, `info`, `success`, `warning`, `danger` and `ai`. Each shows by icon and words as well as colour [APL-1]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. When a `danger` or `warning` message appears while the person is there, post an `AccessibilityNotification` so it is heard [APL-19]. A message already on screen when the page loads posts nothing. The dismiss button is labelled "Dismiss: [title]" [APL-19]. |
| Navigation placement | Inside the page or card it concerns, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | Its buttons: On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | A notification haptic can report an outcome [APL-18]. The product sets none, and any haptic stays optional [APL-18]. |
| Brand may change | The tones, icons and copy: state, consequence, then the fix, never "Something went wrong" and never blaming the person. Apple's alert copy guidance agrees: direct, neutral and specific, never a bare "Error" [APL-13]. Actions are Buttons, and a link only when it goes somewhere. |
| Platform owns | How VoiceOver delivers the announcement [APL-19]. |
| Not confirmed | Announcement priority for an urgent message, the counterpart of the web's `role="alert"`: the registry names `AccessibilityNotification` but not its priorities. |
