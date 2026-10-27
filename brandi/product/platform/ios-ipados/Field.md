# Field on iOS and iPadOS

A field on iOS is a control wired to its label, hint and error and read as one, since the registry names no wrapper control.

```yaml
component: Field
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
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
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None as a single control. The closest pattern composes a label, a system control and a hint. Apple asks apps to draw text fields and text views with system views [APL-5]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control and about 24 pt around an unbezelled one [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. The label, hint and error all use text styles, so the field grows as one [APL-3]. Keep truncation to a minimum as text grows [APL-3]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. Placeholder text takes `placeholderText` [APL-4]. The error carries an icon as well as colour [APL-1] [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. |
| States | Default, focused, invalid, disabled and read-only. On iPadOS a focused text field shows a focus ring [APL-15]. The error replaces the hint. UIKit marks an unavailable element `.notEnabled` [APL-29]. Disabled styling: not confirmed. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The label is the control's label, kept current [APL-19]. The hint and the error are read with the control. When an error appears, post an `AccessibilityNotification` so it is heard [APL-19]. |
| Navigation placement | In a form. A grouped list separates groups with headers, footers and space [APL-14]. |
| Keyboard, pointer, trackpad | iPadOS includes text fields in its focus system [APL-16] [APL-15]. A text or search field takes a focus ring. A list row takes a highlight [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | None specified for fields. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Labels above fields, in sentence case, with no colons. Optional fields say "(optional)" and required ones carry no visible marker. An error says what is wrong and how to fix it, in the brand's voice, as Apple asks of all written communication [APL-8]. It appears when the person leaves the field or saves, never while they type. |
| Platform owns | The focus ring on iPadOS [APL-15]. The I-beam pointer and its magnetism [APL-17]. |
| Not confirmed | Label placement and form layout on iOS, keyboard types and content types: the Text fields, Entering data and Virtual keyboards pages are not in the registry. How VoiceOver marks a required field. Disabled styling. |
