# Sheet on macOS

Sheet is the product's side panel from the right, which on macOS is an inspector or a panel, because Apple's sheet is modal and attached to its window.

```yaml
component: Sheet
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
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
```

| Field | Spec |
|---|---|
| Native control | None by that name. Apple's sheet is modal and dims its window [APL-12], which suits the product's Dialog instead. For a record beside the list, the closest pattern is an inspector opened from the toolbar's trailing section [APL-11], or a panel when people repeat input and watch results [APL-12]. |
| Target and spacing | Its controls meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Title in Title 3, 15 pt, or Headline, body in Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Liquid Glass's regular variant suits components with a lot of text, such as sidebars and popovers [APL-7]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Open and closed. Unlike a sheet, a panel is not modal, so the window behind stays usable [APL-12]. |
| Motion | It enters from the trailing edge, and fades instead under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The title is a heading [APL-19]. Report the panel opening with `AccessibilityNotification` [APL-19]. |
| Navigation placement | The trailing side of the window, opened by a toolbar button on the trailing edge [APL-11]. In a wide window the detail sits beside the list, as a split view does [APL-10]. |
| Keyboard, pointer, trackpad | Esc, which cancels the current action, closes it [APL-16]. Control-F6 moves focus to the first or next panel [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Width, the inset from the window's edges and the trailing placement. Apple keeps the word "sheet" for a modal view on its window [APL-12]. |
| Platform owns | Panel focus with Control-F6 [APL-16]. |
| Not confirmed | The inspector API and Apple's guidance on panels. Whether the product's held focus suits a panel that is not modal. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
