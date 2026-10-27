# FormSection on macOS

FormSection groups related fields under a title on macOS, with no native control in the registry.

```yaml
component: FormSection
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
  - key: APL-32
    url: https://developer.apple.com/documentation/macos-release-notes
    marker: newest 27.2 Golden Gate
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None in the registry. The closest pattern is a titled group of fields in a window or the settings window, which Command-Comma opens [APL-16]. |
| Target and spacing | Controls inside meet the 28 × 28 pt default and the 20 × 20 pt minimum, about 12 pt apart when bezelled [APL-1]. |
| Type | Title in Title 3, 15 pt on 20 pt, or Headline [APL-3]. Description in Body or Callout, 12 pt on 15 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Content-layer surfaces use standard materials, never Liquid Glass, which belongs to controls and navigation [APL-7]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | No states. Each section saves on its own. |
| Motion | None. The split layout stacks without animation. |
| Accessibility API | VoiceOver. The title is a heading, so the rotor can reach it [APL-19]. Group the fields under it [APL-19]. |
| Navigation placement | One column of sections in a window, beside a SideNav on a settings page, the product's layout. Apple's settings window guidance: not confirmed. |
| Keyboard, pointer, trackpad | Tab moves through the controls, and Control-Tab moves to the next group of controls [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Split or stacked layout, the card surface and the title. Content-layer surfaces use standard materials, never Liquid Glass, which belongs to controls and navigation [APL-7]. |
| Platform owns | Control-Tab group movement [APL-16]. |
| Not confirmed | Apple's settings window and form layout guidance. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
