# DataTable on macOS

DataTable is a table view on macOS, SwiftUI `Table` from macOS 12.0 or AppKit `NSTableView`, with sortable, resizable columns.

```yaml
component: DataTable
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
  - key: APL-26
    url: https://developer.apple.com/documentation/swiftui/table
    marker: iOS 16.0+, macOS 12.0+
    read: 2026-10-27
  - key: APL-28
    url: https://developer.apple.com/documentation/swiftui/view/accessibilityaction(named:_:
    marker: iOS 16.0+, macOS 13.0+
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
| Native control | SwiftUI `Table`, macOS 12.0 and later, or AppKit `NSTableView` [APL-26] [APL-14]. Hierarchical rows take an outline view [APL-14]. On macOS, `BorderedTableStyle` alternates row backgrounds [APL-26] [APL-14]. |
| Target and spacing | Controls in a row meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Row height: not confirmed. |
| Type | Body 13 pt [APL-3]. Headers in `headerTextColor` [APL-4]. Column headings are nouns with no ending punctuation [APL-14]. Apple asks for title-style headings [APL-14], and the product sets short uppercase labels over sentence-case words (2.3). A middle ellipsis keeps both ends of a long value [APL-14]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Selection in `selectedContentBackgroundColor` in the key window and `unemphasizedSelectedContentBackgroundColor` elsewhere, text on it in `alternateSelectedControlTextColor` [APL-4]. Grid lines in `gridColor`, stripes in `alternatingContentBackgroundColors` [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | Selected in the key window, selected in another window, sorted, resized, loading, empty and error [APL-4] [APL-14]. A navigation table keeps the selected row highlighted [APL-14]. The empty state keeps the header. |
| Motion | Any row animation follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. AppKit table and row roles [APL-30]. Selected rows carry `isSelected` [APL-23]. Row actions are also named accessibility actions [APL-28]. Group each row's parts [APL-19]. |
| Navigation placement | In the window's content, often in a split view beside a sidebar [APL-14]. The toolbar holds search and common controls such as filters [APL-11]. |
| Keyboard, pointer, trackpad | Click a heading to sort, click again to reverse [APL-14]. Columns resize [APL-14]. Control-arrow moves focus between cells, and Control-Tab moves to the next table when Tab moves between cells [APL-16]. Command-A selects every row [APL-16]. A focused row draws white text on an accent highlight [APL-15]. |
| Haptics | None for rows [APL-18]. |
| Brand may change | Density, hairlines in place of stripes, the header style, seven columns at most and the narrow-width list. Apple suggests alternating row colours in a wide table and title-style headings [APL-14]. The product's guidelines apply (2.3). |
| Platform owns | Sorting and resizing [APL-14]. Selection and stripe colours [APL-4]. Scroll bars by the "Show scroll bars" preference, and horizontal scrolling for extra columns [APL-26]. |
| Not confirmed | Row height. Shift-click range selection on the native table. Multiple selection binds to a set [APL-26], and the gesture for it is not settled here. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
