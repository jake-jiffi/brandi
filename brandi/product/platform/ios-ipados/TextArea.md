# TextArea on iOS and iPadOS

Multi-line text on iOS is the system text view, for notes and messages.

```yaml
component: TextArea
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
```

| Field | Spec |
|---|---|
| Native control | A system text view. Apple asks apps to draw text views with system views, which keep text legible on every background [APL-5]. The SwiftUI and UIKit API: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Three or more lines never take tight leading, and long passages read better with loose leading [APL-3]. Let text grow to at least 200 percent [APL-1]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. Placeholder text takes `placeholderText` [APL-4]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Focused: a focus ring on iPadOS [APL-15]. Invalid and disabled as TextInput. Disabled styling: not confirmed. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The label says what the text is for, such as "Notes for finance" [APL-19]. A character count, shown only for a hard limit, is read with the field [APL-19]. |
| Navigation placement | In a form or a composer. A grouped list separates groups with headers, footers and space [APL-14]. |
| Keyboard, pointer, trackpad | iPadOS includes text views in its focus system [APL-16] [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | None specified for text areas. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The starting height, the label wording and the count. Restyled, it keeps familiar sizing and behaviour [APL-8]. |
| Platform owns | Text editing and the I-beam pointer [APL-17]. The focus ring [APL-15]. |
| Not confirmed | The text view API, and how it grows or resizes: the Text views page is not in the registry. Disabled styling. |
