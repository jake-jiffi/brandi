# Accordion on macOS

Accordion opens and closes sections in place on macOS, through disclosure controls.

```yaml
component: Accordion
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
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-10
    url: https://developer.apple.com/design/human-interface-guidelines/sidebars
    marker: 2026-06-08
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
    read: 2026-10-27
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-18
    url: https://developer.apple.com/design/human-interface-guidelines/playing-haptics
    marker: 2024-05-07
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
| Native control | Disclosure controls, which Apple uses to fold long content [APL-10]. An outline view shows nested rows with disclosure triangles [APL-14]. |
| Target and spacing | Each header meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Headers in Headline, 13 pt, content in Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | The triangle's direction shows the state, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Open and closed. Opening one leaves the others as they were, the product's rule. How macOS draws each state: not confirmed. |
| Motion | Opening fades instead of sliding under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Each header carries `isButton` [APL-23]. Its expanded state: not confirmed. |
| Navigation placement | In help, common questions and long settings pages. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each header [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Header style and the triangle. Apple asks that a branded component keep familiar sizing, placement and behaviour [APL-8]. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | The disclosure control API and how it reports its state. Placement guidance for sections that open in place. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
