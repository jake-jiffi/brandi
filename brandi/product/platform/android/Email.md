# Email on Android

On Android, the email kit is rendered by the person's mail app rather than the product's Android build, so Material and Android's interface guidance do not reach it.

```yaml
component: Email
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: AND-3
    url: https://developer.android.com/develop/ui/views/haptics/haptics-principles
    marker: updated 2026-10-26
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. An email is HTML that a mail app renders, and Material 3 has no email component [MAT-4]. How Android mail apps render it is not confirmed. |
| Target and spacing | Not confirmed. No source here covers target sizes inside an email on Android. |
| Type | Not confirmed. A mail app's font scaling on Android is not covered by these sources. |
| Colour and theme | Not confirmed. Light and dark mail apps on Android are not covered by these sources. |
| States | Not confirmed. Link states depend on the mail app. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Not confirmed. How TalkBack reads an email depends on the mail app. |
| Navigation placement | None in the product. An email sits in the person's inbox, and Material places nothing for email [MAT-4]. |
| Keyboard, pointer, trackpad | Not confirmed. The mail app owns the keyboard, and no source here covers it. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | All of it: the lockup, the heading, the body, one primary action labelled verb first, and the footer, with inline styles, table layout, a plain-text part and a check in light and dark mail apps. Material sets nothing for email [MAT-4]. |
| Platform owns | Not confirmed. The mail app renders the email, and no source here covers what it does. |
| Not confirmed | Native control: how Android mail apps render HTML email. Target and spacing: target sizes inside an email on Android. Type: a mail app's font scaling on Android. Colour and theme: light and dark mail apps on Android. States: link states in a mail app. Accessibility API: how TalkBack reads an email in a mail app. Keyboard, pointer, trackpad: keyboard use in a mail app. Platform owns: what the mail app does with the email. |
