# EditableCell on iOS and iPadOS

Changing a value in place in a table on iOS opens a text field in the cell, where Enter saves and Esc cancels.

```yaml
component: EditableCell
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
  - key: APL-26
    url: https://developer.apple.com/documentation/swiftui/table
    marker: iOS 16.0+, macOS 12.0+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A system text field in the row [APL-5]. Apple asks apps to let people edit a table when it makes sense [APL-14], and selecting items on iOS and iPadOS needs edit mode [APL-14]. |
| Target and spacing | Control default 44 × 44 pt, minimum 28 × 28 pt [APL-1]. About 12 pt of padding around a bezelled control [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Keep truncation to a minimum as text grows [APL-3]. |
| Colour and theme | Invalid shows an icon and words, never colour alone [APL-1]. On iPadOS a focused text field shows a focus ring [APL-15]. Every custom colour needs light and dark variants, each with an increased-contrast option [APL-4]. |
| States | Viewing, editing, saving and failed. A failed save leaves the cell open, with the typed value. The error is announced [APL-19]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The field's label names the column and the record [APL-19]. An error posts an `AccessibilityNotification` [APL-19]. |
| Navigation placement | Inside a DataTable row [APL-26]. |
| Keyboard, pointer, trackpad | Esc is Apple's standard key for cancelling the current action [APL-16]. iPadOS includes text fields in its focus system [APL-15]. The pointer becomes an I-beam over text entry, and magnetism keeps it on the line [APL-17]. |
| Haptics | None specified for editable cells. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Enter starts an edit and saves it, and Esc cancels. Errors say what is wrong and how to fix it, in the brand's voice [APL-8]. Selecting a row still never opens or edits it. |
| Platform owns | Edit mode [APL-14]. The focus ring [APL-15]. |
| Not confirmed | Whether `Table` edits cells in place on iOS: the registry's `Table` page does not say. |
