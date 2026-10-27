# Thinking on Android

On Android, Thinking is the assistant's working line: a small spinner and the words for what it is doing.

```yaml
component: Thinking
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
| Native control | None as a component [MAT-4]. A Compose `CircularProgressIndicator` beside a line of text [AND-9]. |
| Target and spacing | None. It takes no input, and touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Name the work, "Reading 12 [records]", never "Thinking" on its own once the work is known. |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. Graphics keep at least 3:1 against the background [MAT-8]. |
| States | Working, then it gives way to the steps or the answer, by the product's rule. It is not interactive, so Material's interaction states do not apply [MAT-9]. |
| Motion | The spinner turns, with no pulsing dots. At a duration scale of 0, Animator-based animations end immediately [AND-6]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | A polite live region by default [AND-2]. `live` is off inside something with its own status line. The spinner is hidden with `hideFromAccessibility` [AND-1]. |
| Navigation placement | Where the answer or the steps will appear, by the product's rule. Material's loading indicators cover short waits [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus, which Material gives to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | The words carry the status, in the same shape as the AISteps summary line. One spinner at a time. Material sets nothing for an assistant's working line [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Animator-based animations end at once at a duration scale of 0 [AND-6]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. |
