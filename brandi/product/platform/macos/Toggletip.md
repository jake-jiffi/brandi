# Toggletip on macOS

Toggletip is a definition behind an info button on macOS, opened by a press as well as by hovering.

```yaml
component: Toggletip
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
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
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
| Native control | An info button [APL-2] that opens a popover, which Apple names as its own component [APL-12]. Its page is not in the registry. |
| Target and spacing | The info button meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. Apple's Buttons page also asks for a 44 × 44 pt hit region on every platform except visionOS [APL-2]. The pages do not say how the two combine. |
| Type | Body 13 pt, a sentence or two [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Closed, open after a short hover, and open on a press. macOS shows tooltips after a short hover too [APL-2]. |
| Motion | It opens without a slide under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. The info button carries `isButton` and a label naming what it explains [APL-23] [APL-19]. A press reads the definition out, reported with `AccessibilityNotification` [APL-19]. |
| Navigation placement | Beside the term or figure it explains. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches the button [APL-16]. Esc cancels and closes it [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Icon, wording and delay. Apple asks a tooltip to be a brief phrase [APL-2], and a toggletip may run a little longer. |
| Platform owns | Tooltip timing on hover [APL-2]. |
| Not confirmed | The popover API. Whether a popover that opens on hover is a macOS pattern. Placement guidance for a toggletip. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
