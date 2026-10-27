# Badge on Android

On Android, Badge is one or two words of state on a record drawn as a small label, because Material's own badge marks counts on icons.

```yaml
component: Badge
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
  - key: AND-3
    url: https://developer.android.com/develop/ui/views/haptics/haptics-principles
    marker: updated 2026-10-26
    read: 2026-10-27
  - key: AND-5
    url: https://developer.android.com/about/versions/14/features
    marker: updated 2026-10-23
    read: 2026-10-27
  - key: AND-9
    url: https://developer.android.com/jetpack/androidx/releases/compose-material3
    marker: updated 2026-10-21
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None for a word of state. Material's badges show notifications, counts or status on navigation items and icons [MAT-4], Compose `Badge` in a `BadgedBox` [AND-9], which suits NavItem counts, not record states. Build the product's badge as a small text label. |
| Target and spacing | None. A badge is read, not pressed. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's "emphasized" type styles work well with badges [MAT-16]. |
| Colour and theme | Each tone keeps its word, so colour is never the only cue, by the product's rule. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | None. Material's badges take no hover, focus, press, drag or disabled state [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Read as text with its record [AND-1]. The word carries the meaning. An icon in the badge takes `contentDescription = null` [AND-1]. |
| Navigation placement | On a record's row or header, beside the title, by the product's rule. Material puts its badges on navigation items and icons [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Tones success, warning, danger, info, ai, highlight and neutral, each with the same word in every product, in sentence case with no full stop. Small radii, never the pressable pill. A long label is cut with an ellipsis, and its full text needs a route that works by touch, since hover needs a cursor [MAT-9]. Material's badge is a count marker on icons [MAT-4], which the product keeps for NavItem. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. |
| Not confirmed | Nothing: the sources settle every field. |
