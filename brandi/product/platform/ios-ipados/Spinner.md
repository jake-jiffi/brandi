# Spinner on iOS and iPadOS

A small inline spinner on iOS is an activity indicator, for a busy button or cell.

```yaml
component: Spinner
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
  - key: APL-25
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | An activity indicator. Apple asks for one inside a button whose action does not finish at once [APL-2]. The Progress indicators page and API: not confirmed. |
| Target and spacing | Nothing here is pressed, so no hit area applies. Any control inside meets the 44 × 44 pt default and the 28 × 28 pt minimum [APL-1]. |
| Type | None of its own. The words beside it follow Dynamic Type [APL-3]. |
| Colour and theme | Apple asks for enough contrast for icons as well as text [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. |
| States | Spinning while the work runs, shown when a delay follows a press [APL-2], then gone. |
| Motion | The product slows its spinners right down under reduced motion rather than stopping them, so a wait never looks like a hang. Apple asks for less automatic and repetitive animation under Reduce Motion [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. `label` "Loading" by default. Hidden with `accessibilityHidden(_:)` when the words beside it already say what is happening [APL-19]. |
| Navigation placement | Inside the busy button [APL-2] or cell. One spinner at a time in any one place. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for spinners. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Size and colour. Content that is loading takes a Skeleton, and an area waiting on another system a LoadingState. The product's label swap, such as "Saving…", matches Apple's [APL-2]. |
| Platform owns | The system activity indicator's look, when the product uses it [APL-2]. |
| Not confirmed | The activity indicator API and its sizes: the Progress indicators page is not in the registry. Whether slowing counts as reducing motion in Apple's sense. |
