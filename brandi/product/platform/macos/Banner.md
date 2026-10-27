# Banner on macOS

Banner is a one-line message across the top of a window's content on macOS, with no native control in the registry.

```yaml
component: Banner
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
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
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
| Native control | None in the registry. For a problem such as no network connection at launch, Apple suggests cached or placeholder data with a non-intrusive label instead of an alert [APL-13]. The closest pattern is that label, across the top of the content under the toolbar [APL-11]. |
| Target and spacing | Dismiss and action buttons meet the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | Body 13 pt, one line [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | Every tone has an icon, never colour alone [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | Shown, and dismissed unless the state still applies. People dismiss it themselves, the explicit action Apple prefers to a timer [APL-1]. |
| Motion | No slide under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. A banner present on arrival stays quiet. One that appears because something broke is reported with `AccessibilityNotification` [APL-19]. |
| Navigation placement | Under the toolbar, at the top of the content [APL-11]. One at a time. |
| Keyboard, pointer, trackpad | Full Keyboard Access reaches its buttons [APL-16]. |
| Haptics | None [APL-18]. |
| Brand may change | Tone and wording. Offline is a neutral banner saying changes will save when the connection is back. Apple's own example pairs cached data with a non-intrusive label [APL-13], which the product's rule matches. |
| Platform owns | VoiceOver announcement timing [APL-19]. |
| Not confirmed | A native banner control. Announcement priority. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
