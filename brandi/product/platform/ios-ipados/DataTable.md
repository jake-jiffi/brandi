# DataTable on iOS and iPadOS

Records in rows and columns on iOS use the SwiftUI table, which shows every column in a regular width and collapses to its first column in a compact one.

```yaml
component: DataTable
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | SwiftUI `Table`, iOS 16.0 and later [APL-26]. In a regular width, on iPad or iPhone Duo's inner display, it shows the headers and every column. In a compact width it hides the headers and every column after the first [APL-26]. A `List` for simple data [APL-14]. |
| Target and spacing | A row tap meets the 44 × 44 pt default [APL-1]. Controls in a row keep their own 44 × 44 pt hit regions [APL-2]. Row height: not confirmed. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items and drop columns [APL-3]. A middle ellipsis keeps both ends of a clipped name [APL-14]. |
| Colour and theme | System background colours, plain or grouped [APL-4]. Selection never rides on colour alone [APL-1]. A focused row on iPadOS draws white text on the accent colour [APL-15]. |
| States | Selection binds to one row id, or to a set for several [APL-26]. Selecting table items on iOS and iPadOS needs edit mode [APL-14]. Sorting binds to sort comparators: the headers show the sort, and the app re-sorts the data [APL-26]. Loading, empty and error come from the product. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Group each row so its cells read together [APL-19]. `isSelected` or `.selected` marks selection [APL-23] [APL-29]. Swipe actions are also named accessibility actions [APL-28], with an on-screen alternative [APL-1]. Announce a new sort with an `AccessibilityNotification` [APL-19]. |
| Navigation placement | Content. On iPad, the content column of a split view, between the sidebar and the detail [APL-10]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. A focused list row draws white text on an accent-colour highlight [APL-15]. Pointer hover on a row takes tint, not scale or shadow, because a row cannot grow without overlapping its neighbours [APL-17]. |
| Haptics | None specified for table rows. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Density, dividers and the column set: seven columns at most, the first naming the record. Heads are short uppercase labels, where Apple asks for nouns in title-style capitalisation with no ending punctuation [APL-14]. The product selects rows with checkboxes at any time, where Apple asks for edit mode first [APL-14]. The product's guidelines apply (2.3). Its phone list matches the table's compact form, with a richer first column [APL-26]. |
| Platform owns | The compact-width collapse [APL-26]. Edit mode [APL-14]. Scrolling, with scroll bars as needed [APL-26]. |
| Not confirmed | Row height. Tabular figures. Sticky headers and a sticky actions column. Whether `Table` exposes its column headers to VoiceOver as headers. |
