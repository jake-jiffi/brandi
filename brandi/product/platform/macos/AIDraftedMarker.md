# AIDraftedMarker on macOS

AIDraftedMarker is one line on a draft on macOS, saying who asked for it and how the brand check went.

```yaml
component: AIDraftedMarker
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
  - key: APL-6
    url: https://developer.apple.com/design/human-interface-guidelines/motion
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
| Native control | None in the registry. A line of text tied to the item it describes [APL-19]. |
| Target and spacing | The issues link meets the 28 × 28 pt default and the 20 × 20 pt minimum where it can [APL-1]. |
| Type | Callout, 12 pt, or Footnote, 10 pt, never under 10 pt [APL-3] [APL-1]. |
| Colour and theme | `secondaryLabelColor` for the line, `linkColor` for the issues link [APL-4]. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Passed, issues, checking, not checked and edited, each in words [APL-1]. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. It describes its item and reads with it, never as an announcement. Group it with the item [APL-19]. The macOS API for a description: not confirmed. |
| Navigation placement | On the draft itself. Apple placement guidance: not confirmed. |
| Keyboard, pointer, trackpad | Only the issues link takes focus, under Full Keyboard Access [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Wording. Apple guidance on marking AI drafts: not confirmed. |
| Platform owns | Dynamic label colours [APL-4]. |
| Not confirmed | How macOS ties a description to an element. Placement guidance for the marker. Apple guidance on marking AI drafts. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
