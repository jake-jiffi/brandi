# FormRow on iOS and iPadOS

Two or three short fields side by side on iOS share one row, and stack when the width or the text size leaves no room.

```yaml
component: FormRow
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
| Native control | None. The closest pattern is a row of fields that stacks when space runs out, as Apple asks of layouts at large text sizes [APL-3]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control and about 24 pt around an unbezelled one [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large text sizes, reduce the number of columns rather than truncate [APL-3]. |
| Colour and theme | Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | None of its own. Each field keeps its own states, including the iPadOS focus ring [APL-15]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads the fields in reading order, leading to trailing [APL-19]. Each keeps its own label [APL-19]. |
| Navigation placement | Inside a FormSection, only for fields that belong together, such as suburb, state and postcode. Size classes decide how much room it has [APL-20]. |
| Keyboard, pointer, trackpad | On iPadOS, focus moves in reading order, leading to trailing and top to bottom [APL-15]. |
| Haptics | None specified for form rows. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The column count and the point where the row drops to one column, from the product's tokens. The stacking itself follows Apple's ask [APL-3]. |
| Platform owns | The size classes and text sizes that trigger stacking [APL-20] [APL-3]. |
| Not confirmed | Field widths in points: no registry page sets them. |
