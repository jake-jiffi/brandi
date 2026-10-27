# RadioGroup on iOS and iPadOS

One choice from a few options on iOS becomes a list section whose chosen row carries a checkmark, as iOS Settings does, since the registry names no iOS radio button.

```yaml
component: RadioGroup
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
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
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
| Native control | None named in the registry. The closest pattern is an options list: iOS Settings uses lists to help people choose options [APL-14], and the chosen row takes a checkmark [APL-14]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control and about 24 pt around an unbezelled one [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | The checkmark marks the choice, not colour alone [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Chosen and not chosen: the row highlights briefly, then gains the checkmark [APL-14]. Disabled options: not confirmed. |
| Motion | The brief highlight on choosing [APL-14]. Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The `legend` is the section's header, `isHeader` or `.header` [APL-23] [APL-29]. The chosen row carries `isSelected` or `.selected` [APL-23] [APL-29]. |
| Navigation placement | A section of a grouped list, with a header and footer [APL-14]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. A focused list row draws white text on an accent-colour highlight [APL-15]. |
| Haptics | None specified for options lists. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The legend, the option labels and descriptions, and the preselected option: the safest or most common. More than five options are a Select. The registry names no iOS control for the product's radio circles. Checkmark rows are the system pattern [APL-14], and drawn circles are the product's call (2.3). |
| Platform owns | The row highlight [APL-14] and the iPadOS focus highlight [APL-15]. |
| Not confirmed | A native radio control for iOS. Disabled options. Whether the arrow keys change the choice under Full Keyboard Access. |
