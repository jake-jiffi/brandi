# EditableCell on macOS

EditableCell changes a value in place in a table on macOS.

```yaml
component: EditableCell
platform: macos
checked_against: macOS 27 Golden Gate
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
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
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
    read: 2026-10-27
  - key: APL-19
    url: https://developer.apple.com/design/human-interface-guidelines/voiceover
    marker: 2025-03-07
    read: 2026-10-27
  - key: APL-26
    url: https://developer.apple.com/documentation/swiftui/table
    marker: iOS 16.0+, macOS 12.0+
    read: 2026-10-27
  - key: APL-30
    url: https://developer.apple.com/documentation/appkit/nsaccessibility-swift.struct/role/row
    marker: macOS
    read: 2026-10-27
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A cell in a SwiftUI `Table` or `NSTableView` [APL-26] [APL-14], holding a system text field while it edits [APL-5]. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. |
| Type | Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Editing text in `textColor` on `textBackgroundColor` [APL-4]. A failed save has an icon, never colour alone [APL-1]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Rest, editing, saving and failed. A failed save leaves the cell open with the typed value. Editing shows a focus ring, as a text field does [APL-15]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. AppKit table and row roles [APL-30]. Report a failed save with `AccessibilityNotification` [APL-19]. |
| Navigation placement | Inside a DataTable [APL-26]. |
| Keyboard, pointer, trackpad | Control-arrow moves focus between cells [APL-16]. Esc cancels the edit [APL-16]. Return starts an edit, the product's rule. The native behaviour: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | The edit affordance and error wording. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Table focus movement [APL-16]. Selection colours [APL-4]. |
| Not confirmed | How a native table starts and commits an edit. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
