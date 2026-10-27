# Email on macOS

Email is the product's transactional email, which on macOS renders in the reader's mail app rather than the product's app, so Apple's app guidance barely reaches it.

```yaml
component: Email
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
| Native control | None. Email is HTML that the reader's mail app renders. No page in the registry covers email. |
| Target and spacing | Not confirmed. The mail app draws the button. Apple's control sizes are written for apps [APL-1]. |
| Type | Not confirmed. Inline styles set the type, and the mail app decides the rest. |
| Colour and theme | Not confirmed for mail apps. The product checks every email in light and dark mail apps. Apple asks apps to respect the systemwide appearance [APL-5], which is the mail app's job here. |
| States | No states. One primary action, labelled verb first. |
| Motion | None. |
| Accessibility API | How VoiceOver reads it depends on the mail app: not confirmed. Describe meaningful images and hide decorative ones [APL-19]. |
| Navigation placement | In the reader's inbox. Not confirmed beyond that. |
| Keyboard, pointer, trackpad | Not confirmed. The mail app owns the keyboard. |
| Haptics | None. |
| Brand may change | The lockup, heading, body, button and footer, with inline styles and a plain-text part. Apple guidance on email: not confirmed. |
| Platform owns | Rendering, which the mail app owns. Not confirmed per mail app. |
| Not confirmed | How mail apps on macOS render HTML email in light and dark, and every field above marked so. Whether macOS 27.2 has shipped or is still in beta [APL-32]. |
