# FileList on macOS

FileList shows the files after a drop on macOS: name, size, progress and a way to remove each one.

```yaml
component: FileList
platform: macos
checked_against: macOS 27 Golden Gate
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
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A list or table of files [APL-14]. A square button beneath it can remove the selected row, Apple's pattern for adding and removing table rows [APL-2]. |
| Target and spacing | Remove buttons meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Names in Body 13 pt, sizes and progress in Callout 12 pt [APL-3]. A middle ellipsis keeps both ends of a long file name [APL-14]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | A failed file has an icon and words, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Uploading, done and failed, for each file. A failed file says why and what to do, in words [APL-1]. |
| Motion | Progress follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Group each file's name, size and state [APL-19]. Report a finished or failed upload with `AccessibilityNotification` [APL-19]. Remove buttons carry `isButton` [APL-23]. |
| Navigation placement | Under the FileDrop, in a form or a sheet [APL-12]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each remove button [APL-16]. Delete to remove a selected file: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Row layout and wording. Apple places square buttons for row actions within or beneath their view [APL-2]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | The progress indicator for each file. Delete to remove a selected file. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
