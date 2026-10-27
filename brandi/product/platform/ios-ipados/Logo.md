# Logo on iOS and iPadOS

The brand's mark on iOS is an image asset with light and dark renditions, shown on sign-in and at the top of the sidebar, never repeated in page titles.

```yaml
component: Logo
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
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
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
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
```

| Field | Spec |
|---|---|
| Native control | None. A logo is an image. The closest pattern is a single named image in an asset catalog, holding light and dark versions [APL-5]. |
| Target and spacing | Not pressed on its own, so no hit area applies. Inside a link or button it takes that control's 44 × 44 pt hit region [APL-2]. Clear space and minimum size come from the logo system. |
| Type | Never set in type, so Dynamic Type does not resize it. Apple notes that not every element has to grow with text size [APL-3]. |
| Colour and theme | Make sure a full-colour logo looks right in both appearances, or supply separate light and dark assets [APL-5]. Apply a colour profile so it renders as drawn on every display [APL-4]. |
| States | None. It has no interactive states, and Apple asks that branding stay refined and unobtrusive [APL-8]. |
| Motion | It has no motion of its own. Anything that animates near it follows Reduce Motion [APL-1] [APL-24]. |
| Accessibility API | VoiceOver. Its `title` is its label, describing what the image conveys [APL-19]. With `title` empty, because a parent link already names it, hide it with `accessibilityHidden(_:)` [APL-19]. |
| Navigation placement | Sign-in and the top of the sidebar. Apple asks apps not to show the logo throughout, and not to brand the launch screen. An onboarding or welcome screen can carry it [APL-8]. |
| Keyboard, pointer, trackpad | Not a focus target. iPadOS keyboard focus covers content elements such as list items, text fields and search fields, and Full Keyboard Access covers controls [APL-15] [APL-16]. |
| Haptics | None specified for a logo. Apple names system haptics for toggles, sliders and pickers, and feedback generators for notification, impact and selection [APL-18]. |
| Brand may change | Everything about the mark: its renditions, clear space and minimum size, from the logo system. Never stretched, rotated, given effects or recoloured outside its renditions. The product keeps it out of page headers, which matches Apple's ask [APL-8]. |
| Platform owns | Apple's trademarks, which must not appear in the app name or images [APL-8]. The light or dark appearance the asset is shown in [APL-5]. |
| Not confirmed | Logo sizes in points for each placement: no registry page sets them. |
