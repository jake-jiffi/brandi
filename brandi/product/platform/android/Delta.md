# Delta on Android

On Android, Delta shows a change against a comparison as an arrow and a value, read aloud as the whole judgement.

```yaml
component: Delta
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no component for it [MAT-4]. It is an icon and a text label merged into one node [AND-2]. |
| Target and spacing | None. It is read, not pressed. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Tabular figures, by the product's rule. |
| Colour and theme | Success when good, danger when bad, neutral when flat, with the arrow giving direction so colour is never the only cue. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. Graphics keep at least 3:1 against the background [MAT-8]. |
| States | None. Material's states show the interaction status of interactive components [MAT-9], and this is not one. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | One node whose description is the whole judgement, "Up 6.2%, better vs last month" [AND-1] [AND-2]. The arrow icon takes `contentDescription = null` [AND-1]. |
| Navigation placement | Beside the figure it qualifies, in a MetricCard or a table cell, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus, which Material gives to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | `goodWhen` sets the judgement: costs, overdue amounts and churn are good when down. A rate changes in points ("3 pts"), never a percent of a percent. Always say what it is compared with. Material sets nothing for it [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Colour inversion, which reverses every colour on screen, media included, and colour correction [AND-10]. |
| Not confirmed | Nothing: the sources settle every field. |
