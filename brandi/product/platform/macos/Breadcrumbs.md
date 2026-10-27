# Breadcrumbs on macOS

Breadcrumbs show where a record sits on macOS, where the registry has no path control and the closest pattern is the toolbar's back control and title.

```yaml
component: Breadcrumbs
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-14
    url: https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
    marker: 2023-06-21
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
| Native control | Not confirmed. The registry has no page on a path or breadcrumb control. The closest pattern it covers is the toolbar's leading edge: a back control, then the view title [APL-11]. |
| Target and spacing | Each link meets the 28 × 28 pt default and the 20 × 20 pt minimum where it can [APL-1]. |
| Type | Body or Callout [APL-3]. Long names cut at 28 characters, with the full name on hover. A middle ellipsis keeps both ends of a long name [APL-14]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Links in `linkColor` [APL-4]. The current page is plain text. System colours adapt to light, dark and Increase Contrast by themselves [APL-4]. |
| States | Each link at rest and on hover, with the pointing hand [APL-17]. The last item is the current page, not a link. |
| Motion | None [APL-6]. |
| Accessibility API | VoiceOver. Group the trail under a label [APL-19]. The current page is marked as current: the API is not confirmed. |
| Navigation placement | Above the title, for pages two or more levels deep. On macOS the back control and title sit at the toolbar's leading edge [APL-11]. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches each link [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Separator, truncation and placement. Apple asks for the standard Back button rather than a custom one [APL-11]. |
| Platform owns | The toolbar's leading edge, which people cannot customise [APL-11]. |
| Not confirmed | A native path control. How VoiceOver marks the current page. Full names for truncated items without a mouse. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
