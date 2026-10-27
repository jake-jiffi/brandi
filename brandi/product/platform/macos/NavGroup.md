# NavGroup on macOS

NavGroup is a titled group of sidebar items on macOS, optionally folded behind a disclosure control.

```yaml
component: NavGroup
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-4
    url: https://developer.apple.com/design/human-interface-guidelines/color
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
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
| Native control | A group in the sidebar with a short title. Disclosure controls fold a long hierarchy [APL-10]. |
| Target and spacing | The disclosure control meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Succinct, descriptive group titles [APL-10]. The product writes short uppercase labels over sentence-case words. |
| Colour and theme | Group titles in `secondaryLabelColor` [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Open and collapsed, through a disclosure control [APL-10]. |
| Motion | Disclosure fades instead of sliding under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The title is a heading [APL-19]. The expanded or collapsed state: not confirmed. |
| Navigation placement | In the sidebar, two levels deep at most [APL-10]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the disclosure control [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Label style and whether it collapses. Apple asks for succinct titles and two levels at most [APL-10]. |
| Platform owns | Sidebar sizing from General settings [APL-10]. |
| Not confirmed | The disclosure control API and how it reports its state. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
