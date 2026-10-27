# ErrorSummary on macOS

ErrorSummary has no native control on macOS: it is a titled list at the top of a form that failed to save, each line taking focus to its field.

```yaml
component: ErrorSummary
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
  - key: APL-12
    url: https://developer.apple.com/design/human-interface-guidelines/sheets
    marker: 2026-03-24
    read: 2026-10-27
  - key: APL-13
    url: https://developer.apple.com/design/human-interface-guidelines/alerts
    marker: 2024-02-02
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
| Native control | None. The registry names no error summary. The closest pattern is a titled list in the window's content, each line a link to its field. An alert would interrupt, and Apple keeps alerts for critical information that needs action now [APL-13]. |
| Target and spacing | Each link meets the 28 × 28 pt default and the 20 × 20 pt minimum where it can [APL-1]. |
| Type | Title in a heading style such as Headline, 13 pt bold, messages in Body 13 pt [APL-3]. No Dynamic Type on macOS [APL-3]. The layout survives the app's own text size up to the 200 percent Apple asks for [APL-1]. |
| Colour and theme | An error carries an icon as well as colour [APL-1]. Dynamic system colours adapt to light, dark and Increase Contrast. Custom colours need light, dark and increased-contrast variants [APL-4]. |
| States | No control states. It appears after a failed save and goes on the next good one. |
| Motion | It appears in place, with no slide under Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Apple asks apps not to move focus without the person's action [APL-15]. Here the person's save moves it, so focus lands on the summary. Report it with `AccessibilityNotification` [APL-19], and mark the title as a heading for the rotor [APL-19]. |
| Navigation placement | At the top of the form, inside its window or sheet [APL-12]. |
| Keyboard, pointer, trackpad | Tab reaches each link under Full Keyboard Access [APL-16]. Choosing one moves focus to its field. |
| Haptics | None. Mac trackpad haptics do not cover errors [APL-18]. |
| Brand may change | Title and message wording, and when it appears. Apple asks alert copy to be direct and neutral, never accusatory [APL-13], and the product's rule never blames the person either. |
| Platform owns | Full Keyboard Access [APL-16]. |
| Not confirmed | A native error summary. The macOS API for moving focus to it. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
