# Avatar on Android

On Android, Avatar is a person's photo or initials on a tinted circle, drawn like the leading avatar of a Material list item.

```yaml
component: Avatar
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
  - key: MAT-20
    url: https://m3.material.io/components/lists/specs
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None as a standalone Material component [MAT-4]. The closest is a Material list item's leading avatar: a 40 dp circle in `primary container` with initials in title medium in `on primary container` [MAT-20]. |
| Target and spacing | None. An avatar is not a control. The row or account button that holds it carries the target. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Initials in title medium, 16 on 24, as in a list's leading avatar [MAT-20] [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Initials on a tinted circle. A list's leading avatar uses `primary container` and `on primary container` [MAT-20]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | None. The presence dot (online, away, offline) is the product's, and is read as words. Material's states are for interactive components [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Name and status are read together, "[Name], online", through the content description [AND-1]. When the name shows beside it, merge the two so TalkBack says the name once, with the status [AND-2]. |
| Navigation placement | Always with the person's name nearby, by the product's rule. In a list, the leading slot [MAT-20]. |
| Keyboard, pointer, trackpad | None. It never takes focus by itself. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Photo or initials on a tinted circle, and a separate look for the assistant's avatar. Sizes 24, 28, 32 or 40. The product writes these sizes in CSS px for the web build, and they are not converted here. Circles are the one exception to the product's shape rule. Material's list avatar is 40 dp [MAT-20]. |
| Platform owns | Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. |
| Not confirmed | Nothing: the sources settle every field. |
