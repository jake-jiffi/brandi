# SegmentedControl on macOS

SegmentedControl is a segmented control on macOS, which Apple treats as a component of its own.

```yaml
component: SegmentedControl
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | A segmented control, which Apple's Buttons page lists as distinct from buttons [APL-2]. Its own page is not in the registry, so the native API is not confirmed. |
| Target and spacing | Control default 28 × 28 pt, minimum 20 × 20 pt, with about 12 pt of padding around a bezelled control and about 24 pt around one without a bezel [APL-1]. Segment sizing: not confirmed. |
| Type | Segment labels in `controlContentFont(ofSize:)` [APL-3], short, in the product's sentence case. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | A custom control draws the selected segment in `selectedControlColor` with `selectedControlTextColor` [APL-4]. Never colour alone: a word, shape or icon carries the meaning too [APL-1]. The app accent shows only while the person's accent setting is Multicolor. Any other choice replaces it [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Selected, unselected, pressed and unavailable. Unavailable: text in `disabledControlTextColor` [APL-4]. The product's selection slides, and fades under Reduce Motion [APL-1]. |
| Motion | The selection slides to the chosen segment. Under Reduce Motion it fades instead, as Apple asks [APL-1]. Read `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. Each segment reads its label, and the chosen one carries `isSelected` [APL-23]. The group carries the product's `label` [APL-19]. |
| Navigation placement | Above or inside the content it switches. In a toolbar, common controls sit in the centre area [APL-11]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches every control, so custom focus is only for content such as list items, text fields and search fields [APL-15] [APL-16]. Whether a native segmented control moves selection with the arrow keys, as the product's does, is not confirmed. |
| Haptics | None for a selection [APL-18]. |
| Brand may change | The pill shape, the selection colour and the slide. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Full Keyboard Access [APL-16]. The accent replacement outside Multicolor [APL-4]. |
| Not confirmed | The native control's API, sizes and arrow-key behaviour: Apple's segmented control page is not in the registry. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
