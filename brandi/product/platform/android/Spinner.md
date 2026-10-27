# Spinner on Android

On Android, Spinner is a small indeterminate circular indicator for a busy button or cell.

```yaml
component: Spinner
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
  - key: MAT-18
    url: https://m3.material.io/styles/color/system/how-the-system-works
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
| Native control | Material progress indicators show the status of a process, and loading indicators cover short waits [MAT-4]. Compose `CircularProgressIndicator`, indeterminate. The expressive `LoadingIndicator` stays experimental after its promotion to stable was reverted in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | None. A spinner is not a control. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | None. The words beside it carry the state, and they scale with the font size setting [AND-5]. |
| Colour and theme | Graphics keep at least 3:1 against the background [MAT-8]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. |
| States | None. It runs while the work runs. Material's states are for interactive components [MAT-9]. |
| Motion | Compose Material 3 1.4.0 changed the indeterminate circular indicator's motion [AND-9]. The product slows spinners right down under reduced motion rather than stopping them, because a still spinner looks like a hang. At a duration scale of 0, Animator-based animations end immediately [AND-6]. Whether Compose's endless animations follow that scale is not confirmed. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | With its label ("Loading" by default), TalkBack reads it. When words beside it say what is happening, the spinner is hidden with `hideFromAccessibility` [AND-1]. A determinate value would use `progressBarRangeInfo` [AND-2]. The semantics for an indeterminate indicator are not confirmed. |
| Navigation placement | Inside the busy button or cell, by the product's rule. Material's loading indicator covers short waits [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | One spinner at a time in any one place. Content that is loading takes a Skeleton, and an area waiting on another system takes a LoadingState. The slow spin under reduced motion (2.4 s a turn in the reference) is the product's accepted departure from stopping motion, and Android's animator scale can still stop it [AND-6]. |
| Platform owns | Animator-based animations end at once at a duration scale of 0 [AND-6]. Battery Saver turning animators off [AND-6]. |
| Not confirmed | Motion: whether Compose's endless animations follow the animator duration scale, and whether Remove animations sets that scale. Accessibility API: the semantics for an indeterminate indicator. |
