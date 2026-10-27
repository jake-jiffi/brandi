# Kbd on Android

On Android, Kbd shows a keyboard shortcut beside a command, only when a hardware keyboard is attached.

```yaml
component: Kbd
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-7
    url: https://m3.material.io/foundations/designing/structure
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: AND-1
    url: https://developer.android.com/guide/topics/ui/accessibility/apps
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-2
    url: https://developer.android.com/develop/ui/compose/accessibility/semantics
    marker: updated 2026-10-22
    read: 2026-10-27
  - key: AND-3
    url: https://developer.android.com/develop/ui/views/haptics/haptics-principles
    marker: updated 2026-10-26
    read: 2026-10-27
  - key: AND-5
    url: https://developer.android.com/about/versions/14/features
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-8
    url: https://developer.android.com/about/versions/17
    marker: page 2026-07-01, post 2026-06-16
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no key-hint component [MAT-4]. It is text inside a menu item or a hint. |
| Target and spacing | None. It is not a control. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Key names are text, so they scale with the font setting [AND-5]. |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | None. Material's states show the interaction status of interactive components [MAT-9], and this is not one. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Read as part of the command it sits in, merged into that node [AND-2]. How TalkBack phrases modifier keys is not confirmed. |
| Navigation placement | Inside menu items, the command menu and hints, by the product's rule. Since Android 17, attaching or removing a keyboard no longer restarts the activity. The change arrives through `onConfigurationChanged()` [AND-8], so a hint can appear or vanish in place. |
| Keyboard, pointer, trackpad | None of its own. The modifier Android uses for app shortcuts, and so the key form to show, is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | The product writes the Mac form, "⌘K", and shows "Ctrl K" on Windows and Linux. Hidden on touch screens. A `rail` variant sits on the rail. Material sets nothing for key hints [MAT-4]. |
| Platform owns | Whether a hardware keyboard is attached, and the configuration change Android sends when that changes [AND-8]. |
| Not confirmed | Accessibility API: how TalkBack phrases modifier keys. Keyboard, pointer, trackpad: the modifier Android uses for app shortcuts, and so the key form to show. |
