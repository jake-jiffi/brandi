# Logo on macOS

Logo is the brand's master artwork on macOS, placed as an image, never set in type and never redrawn.

```yaml
component: Logo
platform: macos
checked_against: macOS 27 Golden Gate
checked_on: 2026-10-27
status: current
sources:
  - key: APL-1
    url: https://developer.apple.com/design/human-interface-guidelines/accessibility
    marker: 2025-06-09
    read: 2026-10-27
  - key: APL-5
    url: https://developer.apple.com/design/human-interface-guidelines/dark-mode
    marker: 2024-08-06
    read: 2026-10-27
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
  - key: APL-11
    url: https://developer.apple.com/design/human-interface-guidelines/toolbars
    marker: 2025-12-16
    read: 2026-10-27
  - key: APL-15
    url: https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
    marker: 2023-10-24
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
| Native control | None. The registry names no logo control: it is an image. Apple asks apps to show the logo only where it gives context, and to let branding defer to content [APL-8]. |
| Target and spacing | None. A logo is not a target. A parent link that wraps it meets the 28 × 28 pt default and the 20 × 20 pt minimum [APL-1]. |
| Type | None. The logo is artwork from the master files, never type. |
| Colour and theme | Only the product's approved renditions. Artwork that suits one appearance may need a separate dark version [APL-5]. Combine the light and dark versions into a single named image [APL-5]. The accent never touches the logo. Whether a logo needs an increased-contrast rendition: not confirmed. |
| States | None. The logo has no states. |
| Motion | None. A logo does not animate here, and any motion would follow Reduce Motion [APL-1]. |
| Accessibility API | VoiceOver. As a meaningful image it carries a label naming the brand [APL-19]. Hide it with `accessibilityHidden(_:)` when a parent link already names it [APL-19]. |
| Navigation placement | The top of the sidebar's lockup and the sign-in window. Apple asks apps not to repeat the logo through the interface [APL-8], and never to title a window with the app's name [APL-11]. |
| Keyboard, pointer, trackpad | None. A logo takes no focus of its own [APL-15]. |
| Haptics | None [APL-18]. |
| Brand may change | Everything the logo system sets: renditions, clear space and minimum sizes. Apple's guidance limits where the logo appears, not how it looks: only where it gives context, with branding deferring to content [APL-8]. |
| Platform owns | Switching between light and dark renditions with the appearance, when one named image holds both [APL-5]. |
| Not confirmed | Logo use in the menu bar, the Dock or an About window: the registry covers none of them. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
