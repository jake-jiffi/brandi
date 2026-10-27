# Switch on macOS

Switch is a toggle on macOS: a setting that applies at once, with no Save.

```yaml
component: Switch
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
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
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
| Native control | A toggle, which Apple's Buttons page lists as its own component [APL-2]. A toggle in the content layer takes on Liquid Glass while people activate it [APL-7]. The toggle's own page is not in the registry. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt, with about 12 pt of padding around a bezelled control and about 24 pt around one without a bezel [APL-1]. |
| Type | The label names the setting, in `controlContentFont(ofSize:)` [APL-3], never "On" or "Off". No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | A custom switch draws its on surface in `selectedControlColor` [APL-4]. The thumb's position carries the state, never colour alone [APL-1]. The app accent shows only while the person's accent setting is Multicolor. Any other choice replaces it [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | On, off and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. It takes Liquid Glass while people activate it [APL-7]. |
| Motion | The thumb moves. Under Reduce Motion it fades instead of sliding [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver reads the label and the on or off value [APL-19]. The toggle trait is not in the registry. |
| Navigation placement | On a settings page, before its label, the product's placement. Command-Comma opens the settings window [APL-16]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches it [APL-16]. The key that flips it: not confirmed. |
| Haptics | None. Apple lists system haptics for switches on iPhone only [APL-18]. |
| Brand may change | Track and thumb colours, and the switch before its label. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | The Liquid Glass moment on activation [APL-7]. Full Keyboard Access [APL-16]. |
| Not confirmed | The toggle API, its sizes and the key that flips it. Where macOS places a switch relative to its label. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
