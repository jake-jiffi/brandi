# Spacer on Android

On Android, Spacer is a flexible gap inside a Toolbar that pushes what follows to the far end.

```yaml
component: Spacer
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
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
    marker: snapshot 2026-10-13_06-10-19
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
| Native control | Compose `Spacer` [AND-2]. |
| Target and spacing | None. It takes no input, and touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | None. It carries no text for the font size setting to scale [AND-5]. |
| Colour and theme | None. It draws nothing for the colour roles to colour [MAT-18]. |
| States | None. Material's states show the interaction status of interactive components [MAT-9], and this is not one. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | None. A composable with no semantics properties stays out of the semantics tree, so TalkBack never lands on it [AND-2]. |
| Navigation placement | Inside a Toolbar, between the filters and the view controls, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Only inside a Toolbar. Material sets nothing for it [MAT-4]. |
| Platform owns | Leaving it out of the semantics tree, since it carries no semantics [AND-2]. |
| Not confirmed | Nothing: the sources settle every field. |
