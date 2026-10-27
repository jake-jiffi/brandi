# Progress on Android

On Android, Progress is a Material linear progress indicator toward a known end, with its numbers in words beside it.

```yaml
component: Progress
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
  - key: AND-6
    url: https://developer.android.com/reference/android/animation/ValueAnimator
    marker: updated 2026-08-03
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
| Native control | Material progress indicators, which show the status of a process in real time [MAT-4]: Compose `LinearProgressIndicator`, or `LinearWavyProgressIndicator` in the expressive set [AND-9]. |
| Target and spacing | None. It is not a control. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The numbers beside it in words, "34 of 40 h", by the product's rule. |
| Colour and theme | The tone's colour on its track. Graphics keep at least 3:1 against the background [MAT-8]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. |
| States | Determinate or indeterminate, plus the product's target marker and tones. The track's stop indicator draws correctly in right-to-left layouts since a 1.5.0 pre-release fix [AND-9]. |
| Motion | The indeterminate bar moves for as long as the work runs. The product slows it right down under reduced motion rather than stopping it. At a duration scale of 0, Animator-based animations end immediately [AND-6]. Whether Compose's endless animations follow that scale is not confirmed. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | `progressBarRangeInfo` gives TalkBack the current value and its range [AND-2]. The label is the accessible name, and `valueLabel` is what TalkBack hears, through `stateDescription` [AND-2]. An unknown length is indeterminate, never a made-up percentage. |
| Navigation placement | Beside or under the thing it measures, by the product's rule. Material's progress indicators report a process in real time [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus, which Material gives to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Label, value, max, target and tone (success, warning, danger, info, brand), with the numbers in words beside it. The slow indeterminate bar under reduced motion is the product's accepted departure, and Android's animator scale can still stop it [AND-6]. |
| Platform owns | Animator-based animations end at once at a duration scale of 0 [AND-6]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Motion: whether Compose's endless animations follow the animator duration scale, and whether Remove animations sets that scale. |
