# Card on macOS

Card has no native control in the registry's macOS pages: it is a titled container in the content layer, on a standard material, never on Liquid Glass.

```yaml
component: Card
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-7
    url: https://developer.apple.com/design/human-interface-guidelines/materials
    marker: 2025-09-09
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
| Native control | None in the registry. The closest pattern is a titled group in the content layer. Content-layer surfaces use standard materials, never Liquid Glass, which belongs to controls and navigation [APL-7]. |
| Target and spacing | With `href`, the title link meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Buttons inside keep their own targets. |
| Type | Title in Title 3, 15 pt on 20 pt, or Headline, 13 pt bold [APL-3], in sentence case. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | A standard material or `controlBackgroundColor` behind it, never Liquid Glass [APL-7] [APL-4]. Under the graphite accent, a custom background in a neutral state can carry some transparency to pick up desktop tinting [APL-5]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Rest, hover lift when `interactive`, and selected. Selected uses `selectedContentBackgroundColor` in the key window and `unemphasizedSelectedContentBackgroundColor` elsewhere [APL-4]. |
| Motion | The hover lift stops under Reduce Motion, which asks apps not to animate depth changes [APL-1]. `accessibilityReduceMotion` asks UI to avoid large animations, especially ones that suggest a third dimension [APL-24]. |
| Accessibility API | VoiceOver. The title is a heading [APL-19]. Group the card's parts so they read together [APL-19]. |
| Navigation placement | In the window's content, under the toolbars and sidebars that float on Liquid Glass [APL-7]. Never a card inside a card. |
| Keyboard, pointer, trackpad | With `href`, the title link takes focus, and buttons inside stay separate stops [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Radius, shadow, padding, the hover lift and the title. Content-layer surfaces use standard materials, never Liquid Glass, which belongs to controls and navigation [APL-7]. |
| Platform owns | Desktop tinting [APL-5]. Selection colours by window state [APL-4]. |
| Not confirmed | A native card or box container. Hover effects on macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
