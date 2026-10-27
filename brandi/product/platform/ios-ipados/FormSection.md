# FormSection on iOS and iPadOS

Related fields on iOS are a section of a grouped list, with the title as its header and the description as its footer.

```yaml
component: FormSection
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A section of a grouped list: the grouped style separates groups with headers, footers and extra space [APL-14]. Grouped lists take the grouped background colours [APL-4]. |
| Target and spacing | A container, so no hit area of its own. Controls inside meet the 44 × 44 pt default [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. The title and the description grow with the fields [APL-3]. |
| Colour and theme | `systemGroupedBackground` behind, and `secondarySystemGroupedBackground` for the section [APL-4]. In Dark Mode, system backgrounds keep base and elevated layers distinct [APL-5]. |
| States | None of its own. The fields inside carry their states, and the grouped style stays fixed [APL-14]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The title takes `isHeader` or `.header` [APL-23] [APL-29], so people can move between sections by heading [APL-19]. |
| Navigation placement | In a form or settings screen, one topic per section, in a grouped list [APL-14]. |
| Keyboard, pointer, trackpad | On iPadOS, Tab moves between focus groups and the arrow keys move within one [APL-15]. |
| Haptics | None specified for form sections. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The `split` layout, with the title beside the fields, and `stacked`. At compact widths and large text sizes the split layout stacks, as Apple asks of layouts at large sizes [APL-3]. The description says why the fields matter or who sees them. Each section saves on its own. |
| Platform owns | The grouped style's spacing and backgrounds [APL-14] [APL-4]. |
| Not confirmed | Header and footer text styles, and whether the `split` layout suits iPad: no registry page covers them. |
