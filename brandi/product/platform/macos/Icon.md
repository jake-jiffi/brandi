# Icon on macOS

Icon is an SF Symbol on macOS, or a custom symbol drawn to match, tinted by the text beside it.

```yaml
component: Icon
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
    marker: 2025-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
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
| Native control | SF Symbols, which align with the system font in every weight and size [APL-3]. Where no system symbol fits, draw a custom symbol rather than a bitmap [APL-10]. Symbols adapt to Dark Mode by themselves [APL-5]. |
| Target and spacing | None alone. An icon that acts sits in a button: control default 28 × 28 pt, minimum 20 × 20 pt [APL-1]. An image button keeps about 10 pixels of padding between the image and its edges [APL-2]. |
| Type | Symbols use the same weights as SF Pro, so they match the text beside them [APL-3]. The product's icon sizes stay, since macOS has no Dynamic Type to scale them [APL-3]. |
| Colour and theme | Tint symbols with dynamic colours so they read in both appearances [APL-5]. Never colour alone: a word, shape or icon carries the meaning too [APL-1]. In a sidebar, icons take the app accent, and the person's accent replaces it unless a fixed colour carries meaning [APL-4] [APL-10]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | None of its own. In a toolbar, system symbols get hover and selection appearances from the system [APL-11]. |
| Motion | None by default. SF Symbols 5 and later can animate [APL-6]. Any symbol animation stops under Reduce Motion [APL-1], read through `accessibilityReduceMotion` [APL-24]. |
| Accessibility API | VoiceOver. A decorative icon is hidden with `accessibilityHidden(_:)` [APL-19]. An icon that means something needs a label, and so does a control that shows only an icon, for Voice Control as well [APL-19] [APL-1]. |
| Navigation placement | Wherever its parent sits. In a toolbar, prefer system symbols without borders [APL-11]. |
| Keyboard, pointer, trackpad | None. An icon is never focusable alone. Its parent control takes focus [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | One icon set by name, drawn in `currentColor` at the product's sizes. Apple asks for SF Symbols wherever possible and familiar icons for familiar actions [APL-5] [APL-2]. A set other than SF Symbols loses the automatic weight match with SF Pro [APL-3]. The product's guidelines apply (2.3). |
| Platform owns | Symbol rendering in each appearance [APL-5]. Toolbar hover and selection appearances for system symbols [APL-11]. The accent replacement on sidebar icons outside Multicolor [APL-4]. |
| Not confirmed | Symbol sizes per control size: the registry gives none for macOS. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
