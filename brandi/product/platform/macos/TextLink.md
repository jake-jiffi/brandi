# TextLink on macOS

TextLink is inline link text on macOS, drawn in `linkColor`, with the pointing-hand pointer over it.

```yaml
component: TextLink
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
  - key: APL-16
    url: https://developer.apple.com/design/human-interface-guidelines/keyboards
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-17
    url: https://developer.apple.com/design/human-interface-guidelines/pointing-devices
    marker: 2023-06-21
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
| Native control | Link text in `linkColor` [APL-4], under the pointing-hand pointer that marks a link to a page, document or other item [APL-17]. The registry names no link control or SwiftUI link API. |
| Target and spacing | Apple's control sizes, 28 × 28 pt default and 20 × 20 pt minimum, are written for controls [APL-1]. Whether they bind link text in a sentence is not confirmed. |
| Type | The text it sits in, Body 13 pt by default [APL-3]. The words say where it goes and are unique in the window. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | `linkColor` adapts to light, dark and increased contrast [APL-4]. Never put the link colour, or one like it, on text that does not act [APL-4]. The underline keeps meaning off colour alone [APL-1]. |
| States | Rest and hover. Over a link the pointer becomes `pointingHand` [APL-17]. A visited state: not confirmed. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. People move by links with the rotor, so expose each link to it [APL-19]. The label is the link text. The link trait is not in the registry. |
| Navigation placement | Inline in content. A button starts an action [APL-2], so "Try again" is a Button, even inside an alert. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches links [APL-16]. Primary click follows it, and secondary click opens its contextual menu [APL-17]. |
| Haptics | None [APL-18]. |
| Brand may change | The link colour role and the underline. Apple asks for the system link colour and for no similar colour on text that does not act [APL-4]. A brand link colour needs light, dark and increased-contrast variants [APL-4]. |
| Platform owns | The pointing-hand pointer [APL-17]. `linkColor` values per appearance [APL-4]. Rotor navigation by link [APL-19]. |
| Not confirmed | A native link control or SwiftUI link API. Visited styling. Whether control sizes apply to link text in a sentence. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
