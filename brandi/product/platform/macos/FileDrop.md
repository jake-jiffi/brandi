# FileDrop on macOS

FileDrop is a drop area with a real Choose files button on macOS, so dragging is never the only way in.

```yaml
component: FileDrop
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
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
  - key: APL-33
    url: https://developer.apple.com/documentation/appkit/nsbutton/bezelstyle-swift.enum/push
    marker: macOS
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None as one control: a drop area plus a push button [APL-33]. Apple asks for an on-screen alternative to any gesture [APL-1]. Command-O shows the standard dialog for choosing a document [APL-16], which the button can open. |
| Target and spacing | The button meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. The drop area is larger than any control. |
| Type | Title and description in SF Pro text styles, Body 13 pt for the description [APL-3]. The button in `controlContentFont(ofSize:)` [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. The drag-over state changes more than colour [APL-1]. |
| States | Rest, drag over, error and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. The pointer shows `dragCopy` when a drop will copy the item, and `operationNotAllowed` when it cannot land [APL-17]. |
| Motion | The drag-over change fades under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reaches the button, so nobody depends on dragging [APL-1]. Report an error when it appears with `AccessibilityNotification` [APL-19]. |
| Navigation placement | In content, or in a sheet that asks for a file to attach [APL-12]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the button [APL-16]. Pointer styles: `dragCopy` when a drop copies, `operationNotAllowed` when it cannot land, `disappearingItem` when a dragged item will vanish [APL-17]. |
| Haptics | None by default. A drag is one of the two moments Mac trackpad haptics cover [APL-18]. Whether a drop area should play one: not confirmed. |
| Brand may change | Title, description and button wording, and the drag-over look. The button is the on-screen alternative to dragging that Apple asks for [APL-1]. |
| Platform owns | Drag pointer styles [APL-17]. The standard open dialog [APL-16]. |
| Not confirmed | The drag and drop API and the open dialog API. Haptics on a drop. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
