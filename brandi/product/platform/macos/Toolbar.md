# Toolbar on macOS

Toolbar is the macOS toolbar, `NSToolbar`, in the window frame, and the product's row of search, filters and view controls maps onto its sections.

```yaml
component: Toolbar
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
| Native control | `NSToolbar` in AppKit [APL-11]. It sits in the frame at the top of the window, below or merged with the title bar, and its items take no bezel [APL-11]. |
| Target and spacing | Items meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Too many items crowd it, so pick them deliberately [APL-11]. |
| Type | Item labels in sentence case. Prefer symbols over text, except for actions symbols do not show well [APL-11]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Keep custom backgrounds and tinted controls to a minimum [APL-11]. Over colourful content, keep item labels monochrome [APL-11]. The app accent shows only while the person's accent setting is Multicolor. Any other choice replaces it [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Filters, or bulk actions while rows are selected. System symbols get hover and selection appearances [APL-11]. An unavailable item's text takes `disabledControlTextColor` [APL-4]. |
| Motion | System controls bring their own motion, quieter under a trackpad than under touch [APL-6]. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. The toolbar's `label` names the group ("[Record] filters") [APL-19]. Every item carries its own label [APL-19]. |
| Navigation placement | Leading edge: back, sidebar toggle and title, not customisable [APL-11]. Centre: common controls, customisable, folding into the overflow menu [APL-11]. Trailing edge: search, inspectors and the primary, always visible [APL-11]. Three groups at most [APL-11]. Every item is also a menu bar command [APL-11]. |
| Keyboard, pointer, trackpad | Control-F5 moves focus to the toolbar [APL-16]. Option-Command-T shows or hides it [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Which filters and controls appear. The product puts its row above the table. Apple puts window commands in the frame [APL-11], and buttons for a table's own rows beneath it as square buttons [APL-2]. |
| Platform owns | The overflow menu, customisation and corner radii concentric with the bar [APL-11]. |
| Not confirmed | Whether the product's sticky row above a table should move into the window toolbar or stay in the content. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
