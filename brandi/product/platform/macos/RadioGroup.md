# RadioGroup on macOS

RadioGroup is a set of radio buttons on macOS, though no page in the registry covers them.

```yaml
component: RadioGroup
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Not confirmed. No page in the registry names radio buttons for macOS. Apple's Buttons page lists toggles and segmented controls as separate components [APL-2], and does not say where radio buttons belong. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt, with about 12 pt of padding around a bezelled control and about 24 pt around one without a bezel [APL-1]. |
| Type | Option labels in `controlContentFont(ofSize:)`, the legend in `labelFont(ofSize:)` [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | A custom option draws its selected surface in `selectedControlColor` [APL-4]. Never colour alone: a word, shape or icon carries the meaning too [APL-1]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Whether the accent colours a radio button: not confirmed. |
| States | Selected, unselected and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. |
| Motion | None of its own [APL-6]. Reduce Motion applies to any custom transition [APL-1]. |
| Accessibility API | VoiceOver. The chosen option carries `isSelected` [APL-23]. The legend names the group, so group the options under it [APL-19]. |
| Navigation placement | In a form or a settings window. Command-Comma opens the app's settings window [APL-16]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches it [APL-16]. Arrow-key movement inside the group: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Option layout and the preselected option. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | The native radio button control, its API and its keyboard behaviour. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
