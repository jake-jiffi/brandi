# MetricCard on iOS and iPadOS

A headline figure on iOS is a card holding the label, the value, its delta and an optional trend, read as one element.

```yaml
component: MetricCard
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
| Native control | None named in the registry. The closest pattern is a Card whose parts VoiceOver reads together [APL-19]. |
| Target and spacing | The `hint` info button keeps a hit region of at least 44 × 44 pt [APL-2]. |
| Type | The figure takes a large text style and stays the most important text as sizes grow [APL-3]. At large sizes, stack the delta under the figure [APL-3]. |
| Colour and theme | The delta's tone pairs with an arrow and words [APL-1]. The figure keeps 4.5:1, or 3:1 at 18 pt and above [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | `ready`, `loading`, and `unavailable`, which says the source is down and when it last answered, never a zero nobody measured. VoiceOver hears the change [APL-19]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads the label, the value and the delta as one element [APL-19]. The trend is described in words [APL-19]. The info button takes `isButton` or `.button` [APL-23] [APL-29]. |
| Navigation placement | In a row of cards in the content layer [APL-7]. |
| Keyboard, pointer, trackpad | The info button: On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. |
| Haptics | None specified for metric cards. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The `hero` treatment, one per row at most, the number formats and the footnote. The label says exactly what is counted. The hint opens on a press, a tap or Enter, as a Toggletip, because Apple describes hover tooltips only for macOS and visionOS [APL-2]. |
| Platform owns | Dynamic Type for the figure [APL-3]. |
| Not confirmed | Tabular figures, and the popover that would hold the hint: the Popovers page is not in the registry. |
