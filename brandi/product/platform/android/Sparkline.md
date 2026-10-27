# Sparkline on Android

On Android, Sparkline is a tiny trend line with its last point marked, inside a MetricCard or a table cell, with no axes.

```yaml
component: Sparkline
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
  - key: MAT-8
    url: https://m3.material.io/foundations/designing/color-contrast
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
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
  - key: AND-7
    url: https://developer.android.com/reference/android/app/UiModeManager
    marker: updated 2026-08-03
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no chart component [MAT-4]. It is a small custom drawing, which adds its own semantics [AND-2]. |
| Target and spacing | None. It is read, not pressed. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | None. A sparkline has no text for the font size setting to scale [AND-5]. |
| Colour and theme | Only `series-1`, never red or green, because the Delta beside it gives the judgement, by the product's rule. Graphics keep at least 3:1 against the background [MAT-8]. A custom drawing reads `UiModeManager.getContrast()`, from API 34, to follow the person's contrast level [AND-7]. |
| States | A `null` value breaks the line, by the product's rule. It is not interactive, so Material's interaction states do not apply [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | With a `label`, the trend in words is its content description [AND-1]. Without one it is hidden with `hideFromAccessibility` [AND-1]. |
| Navigation placement | Inside a MetricCard or a table cell, beside the figure it supports, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus, which Material gives to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | It supports a figure and never stands in for one. `data`, `width`, `height`, `color` and `label`. Material sets nothing for charts [MAT-4]. |
| Platform owns | The person's contrast level, which a custom drawing reads for itself [AND-7]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. |
| Not confirmed | Nothing: the sources settle every field. |
