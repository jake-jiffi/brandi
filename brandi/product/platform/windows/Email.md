# Email on Windows

The product's transactional emails, which render in the reader's mail app rather than in a WinUI surface.

```yaml
component: Email
platform: windows
checked_against: Windows 11 26H2, Windows App SDK 2.5.1
checked_on: 2026-10-27
status: current
sources:
  - key: WIN-13
    url: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/buttons
    marker: 2026-10-13
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. The closest pattern is not confirmed, since email renders in the reader's mail app, outside any WinUI surface, and no registry page covers it. |
| Target and spacing | Not confirmed, since no registry page sets targets for email. |
| Type | Not confirmed, since no registry page covers type in email. |
| Colour and theme | Not confirmed. The mail app, not the email, decides light and dark. |
| States | Not confirmed. An email has no states beyond its links, and the mail app draws those. |
| Motion | Not confirmed. Motion in an email is the mail app's call. |
| Accessibility API | Not confirmed. Narrator reads the mail app's rendering, which no registry page covers. |
| Navigation placement | Not confirmed. The mail app owns placement. |
| Keyboard, pointer, trackpad | Not confirmed. The mail app owns the keyboard. |
| Haptics | Not confirmed. The mail app owns input. |
| Brand may change | Everything in the email: the lockup, one primary action labelled verb first, inline styles and table layout, a plain-text part, and checks in light and dark mail apps. A verb-first button label matches Microsoft's button text advice for apps [WIN-13], though no registry page covers email. |
| Platform owns | Not confirmed. The reader's mail app owns rendering, theme and input. |
| Not confirmed | Every field but Brand may change, haptics included. Rendering, dark mode and Narrator behaviour in Windows mail apps need sources the registry lacks. |
