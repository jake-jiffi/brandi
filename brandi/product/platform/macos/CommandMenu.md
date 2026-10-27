# CommandMenu on macOS

CommandMenu is the product's Command-K palette on macOS, with no native command palette in the registry.

```yaml
component: CommandMenu
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
| Native control | None in the registry. The closest patterns it covers: a search field [APL-11], and the menu bar, where every toolbar command also lives [APL-11]. |
| Target and spacing | Anything pressable in a result meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Input in Body 13 pt, results in `menuFont(ofSize:)` or Body [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The active result in the selected-content colours, `selectedContentBackgroundColor` in the key window [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | Open, filtered and no results. How macOS draws these states: not confirmed. |
| Motion | It opens without a slide under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Report the active result as it changes with `AccessibilityNotification` [APL-19]. |
| Navigation placement | Near the top of the window, as a modal palette. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Command-K is not among Apple's standard shortcuts [APL-16], and it leads with Command as Apple asks [APL-16]. Esc cancels and closes it [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Groups, wording and the ask row. Apple asks custom shortcuts to lead with Command [APL-16], which Command-K does. |
| Platform owns | The standard shortcuts, which the palette never overrides [APL-16]. |
| Not confirmed | A native command palette. Placement guidance for a palette. How macOS draws its states. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
