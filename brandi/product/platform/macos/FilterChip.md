# FilterChip on macOS

FilterChip filters what is already on screen on macOS, and the closest pattern the registry covers is a toggle.

```yaml
component: FilterChip
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
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
| Native control | Not confirmed. The registry names no filter chip for macOS. The closest pattern it covers is a toggle, which Apple's Buttons page lists as its own component [APL-2]. Its page is not in the registry. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt, with about 12 pt of padding around a bezelled control and about 24 pt around one without a bezel [APL-1]. |
| Type | Label and count in `controlContentFont(ofSize:)` [APL-3], in sentence case. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | On: `selectedControlColor` and `selectedControlTextColor` [APL-4], with a check, so selection never rests on colour alone [APL-1]. The attention highlight means "needs you" only, never a second meaning [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. Outside Multicolor, the person's accent replaces the app's [APL-4]. |
| States | Off, on, pressed and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. |
| Motion | None of its own. Reduce Motion asks for less automatic and repeating animation, and fades in place of slides [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Trait `isButton`, with `isSelected` while on [APL-23]. The count is part of the label, in words: "12 need you" [APL-19]. |
| Navigation placement | One row above the list or table it filters. In a window, the toolbar's centre area holds common controls [APL-11]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each chip [APL-16]. The activation key: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | The pill shape, the check, counts and the attention highlight. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Full Keyboard Access [APL-16]. Selected-control colours per appearance [APL-4]. |
| Not confirmed | A native filter chip. The toggle's own guidance. The activation key. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
