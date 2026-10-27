# Tooltip on macOS

Tooltip is the system tooltip on macOS: a brief phrase that appears after people hover over a control for a moment.

```yaml
component: Tooltip
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
| Native control | The system tooltip. macOS shows one after people hover over a button for a moment [APL-2], in `toolTipsFont(ofSize:)` [APL-3]. |
| Target and spacing | None. A tooltip is never a target, and never interactive. |
| Type | `toolTipsFont(ofSize:)` [APL-3]. One brief phrase saying what the control does [APL-2]. |
| Colour and theme | System tooltip colours: not confirmed. A custom tooltip uses dynamic colours [APL-4]. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Hidden, then shown after a short hover [APL-2]. |
| Motion | System timing. Any custom fade follows Reduce Motion [APL-1]. |
| Accessibility API | VoiceOver. A tooltip is never the only home for a control's name: give the control its own label [APL-19]. |
| Navigation placement | Shown by the system for the control it explains [APL-2]. Where it appears relative to the control: not confirmed. |
| Keyboard, pointer, trackpad | System tooltips appear on pointer hover [APL-2]. Whether they also appear on keyboard focus, as the product's do: not confirmed. |
| Haptics | None [APL-18]. |
| Brand may change | Content and placement. Apple asks for a brief phrase that explains what the control does [APL-2], which matches the product's one-sentence limit. |
| Platform owns | Tooltip timing and drawing for system controls [APL-2] [APL-3]. |
| Not confirmed | Tooltips on keyboard focus. Tooltip colours. Apple's guidance on offering help. Where a tooltip appears relative to its control. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
