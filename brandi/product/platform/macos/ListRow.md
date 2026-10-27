# ListRow on macOS

ListRow is one row in a list on macOS: a leading image, a title, a meta line and a trailing badge or value.

```yaml
component: ListRow
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
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
| Native control | A table row [APL-30] in a list or table view [APL-14]. |
| Target and spacing | Controls inside meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Row height: not confirmed. |
| Type | Title in Headline, 13 pt bold [APL-3]. Meta in Subheadline 11 pt or Callout 12 pt [APL-3]. No tight leading on three or more lines [APL-3]. A middle ellipsis keeps both ends of a long name [APL-14]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Selected in the key window: `selectedContentBackgroundColor`, text on it in `alternateSelectedControlTextColor` [APL-4]. In another window: `unemphasizedSelectedContentBackgroundColor` [APL-4]. Focused: white text on an accent highlight [APL-15]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | Rest, selected, focused and unread. Unread adds a dot, never colour alone [APL-1]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. Row role [APL-30]. Group its parts so they read as one [APL-19]. A selected row carries `isSelected` [APL-23]. Unread adds "(unread)" to the label [APL-19]. |
| Navigation placement | In a List, often the list pane of a split view [APL-10]. |
| Keyboard, pointer, trackpad | Highlighted, not ringed, when focused [APL-15]. Primary click selects or activates, and secondary click opens a contextual menu [APL-17]. |
| Haptics | None [APL-18]. |
| Brand may change | Leading, title, meta and trailing slots, and the selected style. Apple asks for the accent highlight on focused list items [APL-15]. |
| Platform owns | Selection colours by window state [APL-4]. |
| Not confirmed | Row height. Hover appearance on macOS rows. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
