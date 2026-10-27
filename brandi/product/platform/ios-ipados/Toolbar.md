# Toolbar on iOS and iPadOS

The product's row of search, filters and view controls above a table maps on iOS to the toolbar, and to controls kept beside the content they affect.

```yaml
component: Toolbar
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | The system toolbar, holding search fields, buttons and menus: Toolbars in SwiftUI, `UIToolbar` in UIKit [APL-11]. Controls for one content area stay above that area, as Mail keeps its list controls over the list [APL-20]. |
| Target and spacing | Hit region at least 44 × 44 pt [APL-2]. Text-labelled buttons get fixed space between them [APL-11]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. Symbols over text, except for actions such as edit [APL-11]. |
| Colour and theme | Few custom backgrounds or tinted controls. A scroll edge effect separates the bar from the content [APL-11]. Item colours stay clear of colourful content [APL-11]. |
| States | Selecting rows swaps the filters for bulk actions. On iOS, selection happens in edit mode [APL-14]. |
| Motion | Under Reduce Motion, cut automatic and repetitive animation, tighten springs and swap slides for fades [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Its `label` names the group, such as "[Record] filters", and items read in order [APL-19]. |
| Navigation placement | Over the table or list it serves [APL-20]. In a system toolbar, three groups at most: leading, centre and trailing [APL-11]. |
| Keyboard, pointer, trackpad | On iPadOS, Full Keyboard Access reaches controls, so build no custom keyboard focus for them [APL-16] [APL-15]. Bar buttons take the highlight effect [APL-17]. The system overflow menu collects what does not fit [APL-11]. |
| Haptics | None specified for toolbars. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Search first, then filter chips, a Spacer, then the view switcher and secondary actions, sticking while the table scrolls. Apple asks for no overcrowding, and a More menu for the rest [APL-11]. |
| Platform owns | The overflow menu [APL-11] [APL-20]. Bar corner radii and Liquid Glass [APL-11] [APL-7]. |
| Not confirmed | Whether a sticky row in the content or the system toolbar should hold the filters: no registry page decides it. |
