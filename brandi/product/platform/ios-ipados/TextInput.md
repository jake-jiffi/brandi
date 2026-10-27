# TextInput on iOS and iPadOS

A single-line field on iOS is the system text field, drawn by the system so its text stays legible on every background.

```yaml
component: TextInput
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
| Native control | A system text field. Apple asks apps to use system views for text fields, which adjust to vibrancy and backgrounds [APL-5]. An alert can hold one, including a secure text field for a password [APL-13]. The SwiftUI and UIKit API: not confirmed. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Body is 17 pt at the default size and 53 pt at AX5 [APL-3]. Let text grow to at least 200 percent [APL-1]. |
| Colour and theme | Placeholder text takes `placeholderText` [APL-4]. Apple asks for enough contrast between foreground elements and their backgrounds [APL-1]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. Read Increase Contrast with `colorSchemeContrast` [APL-25]. |
| States | Focused: a focus ring on iPadOS [APL-15]. Invalid keeps its danger edge while focused, and read-only shows a dashed edge and a lock, so neither rides on colour alone [APL-1]. UIKit marks an unavailable element `.notEnabled` [APL-29]. Disabled styling: not confirmed. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The field's label is its name, kept current [APL-19]. The prefix and suffix are read with it, grouped [APL-19]. Traits for a text field: not confirmed. |
| Navigation placement | In a form or a toolbar. Standard text fields in a bar get corner radii concentric with the bar [APL-11]. |
| Keyboard, pointer, trackpad | iPadOS includes text fields in its focus system, with a focus ring [APL-16] [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | None specified for text fields. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The border, the focus edge colour, the prefix, suffix and icon. A placeholder shows an example, never the label or an instruction. A read-only value says where it comes from and where to change it. A restyle keeps the field's sizing and behaviour familiar [APL-8]. |
| Platform owns | The focus ring on iPadOS [APL-15]. The I-beam pointer and magnetism [APL-17]. The keyboard and text editing: not confirmed in the registry. |
| Not confirmed | The text field API, its VoiceOver traits, keyboard types, content types for autofill, text editing, and secure entry outside alerts: the Text fields and Virtual keyboards pages are not in the registry. Disabled styling. |
