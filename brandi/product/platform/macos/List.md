# List on macOS

List is a column of rows on macOS, a SwiftUI `List` or a single-column table, often the list pane of a split view.

```yaml
component: List
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
| Native control | A list or a single-column table: SwiftUI `List` or AppKit `NSTableView` [APL-14]. A bordered style alternates row backgrounds [APL-14]. |
| Target and spacing | Controls in rows meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Row height: not confirmed. |
| Type | Body 13 pt [APL-3]. Keep row text short to avoid truncation [APL-14]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | A focused row draws white text on an accent highlight [APL-15]. Without focus, selection is standard text on a grey highlight [APL-15]. Stripes, when used, in `alternatingContentBackgroundColors` [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | Selected, focused and empty. A navigation list keeps the selected row highlighted [APL-14]. |
| Motion | Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. AppKit table and row roles [APL-30]. Group each row [APL-19]. The selected row carries `isSelected` [APL-23]. |
| Navigation placement | The list pane of a split view, between sidebar and detail [APL-10] [APL-14]. |
| Keyboard, pointer, trackpad | List items take keyboard focus as content, shown with a highlight, not a ring [APL-15]. Control-arrow moves focus within a table [APL-16]. |
| Haptics | None for rows [APL-18]. |
| Brand may change | Boxed or divided style and the selected look. Apple asks for the accent highlight with white text on focused list items [APL-15]. The product's guidelines apply (2.3). |
| Platform owns | Selection colours by window state [APL-4]. Full Keyboard Access [APL-16]. |
| Not confirmed | Row height. Arrow-key movement between rows. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
