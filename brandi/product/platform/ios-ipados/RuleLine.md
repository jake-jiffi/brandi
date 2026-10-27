# RuleLine on iOS and iPadOS

On iOS, a plain line on an item that an approved rule changed says which rule acted, who approved it and when, with a link to the rule.

```yaml
component: RuleLine
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
  - key: APL-20
    url: https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-23
    url: https://developer.apple.com/documentation/swiftui/accessibilitytraits/isbutton
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-24
    url: https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
    marker: iOS 13.0+, macOS 10.15+
    read: 2026-10-27
  - key: APL-29
    url: https://developer.apple.com/documentation/uikit/uiaccessibilitytraits/button
    marker: iOS, no version listed
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Static text with one link: `isStaticText` and `isLink` in SwiftUI, `.staticText` and `.link` in UIKit [APL-23] [APL-29]. |
| Target and spacing | The link meets the 44 × 44 pt default where it can, and never drops below 28 × 28 pt [APL-1]. |
| Type | SF Pro through a text style, so it follows Dynamic Type [APL-3]. At large sizes, stack secondary items under the text instead of truncating [APL-3]. |
| Colour and theme | Text takes the system label colours, which adapt to both appearances [APL-5]. The link takes the `link` colour [APL-4]. |
| States | Acted, failed, or changed since. A failure names the step and the system, with one Try again. A rule changed or paused since says so. Each state is in words [APL-19]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver reads the line, then the link, named for the rule [APL-19] [APL-23]. |
| Navigation placement | On the item the rule changed, in its history, and in the steps log when the rule ran steps, near the content it affects [APL-20]. |
| Keyboard, pointer, trackpad | The link: Full Keyboard Access reaches controls [APL-16]. |
| Haptics | None specified for rule lines. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | The wording: "Done by the rule "[rule name]", approved by [name] on [date]." In the brand's voice [APL-8]. |
| Platform owns | Date formatting by locale: not confirmed in the registry. |
| Not confirmed | Date formats by locale: no registry page covers them. |
