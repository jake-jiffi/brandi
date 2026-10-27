# Email on iOS and iPadOS

The product's transactional emails reach people on iOS in their mail app, not inside the product, so few platform rules apply.

```yaml
component: Email
platform: ios-ipados          # web | ios-ipados | macos | android | windows
checked_against: iOS 27, iPadOS 27
checked_on: 2026-10-27
status: current
sources:
  - key: APL-8
    url: https://developer.apple.com/design/human-interface-guidelines/branding
    marker: 2026-09-09
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Not confirmed: an email renders in the person's mail app, and no registry page covers email content. |
| Target and spacing | Not confirmed: no registry page sets targets inside an email. |
| Type | Not confirmed: whether a mail app applies Dynamic Type to an email is outside the registry. |
| Colour and theme | Not confirmed: how mail apps render an email in Dark Mode is outside the registry. The product checks every email in light and dark mail apps. |
| States | Not confirmed: the registry covers no interactive states in email. |
| Motion | Not confirmed: the registry does not cover motion in email. |
| Accessibility API | Not confirmed: how VoiceOver reads an email in a mail app is outside the registry. Every email carries a plain-text part. |
| Navigation placement | Not confirmed: an email sits outside the app's navigation. |
| Keyboard, pointer, trackpad | Not confirmed: input in a mail app belongs to the mail app. |
| Haptics | Not confirmed: the registry does not cover haptics in email. |
| Brand may change | The lockup, heading, body, button and footer, with one primary action labelled verb first. The brand's voice runs through all written communication, as Apple asks [APL-8]. |
| Platform owns | Not confirmed: the mail app owns rendering, and the registry does not describe it. |
| Not confirmed | Every platform field above: no registry page covers email shown in iOS mail apps. Inline styles, table layout and the plain-text part come from the product's own email practice. |
