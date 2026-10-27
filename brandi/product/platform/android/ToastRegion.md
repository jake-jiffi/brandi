# ToastRegion on Android

On Android, ToastRegion is the queue that shows, times and pauses toasts, the job `Scaffold`'s snackbar handling does in Compose.

```yaml
component: ToastRegion
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-6
    url: https://m3.material.io/components/buttons/accessibility
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-7
    url: https://m3.material.io/foundations/designing/structure
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-14
    url: https://m3.material.io/components/dialogs/overview
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
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
| Native control | Material snackbars [MAT-4], shown through `Scaffold`, which applies the right insets to them [AND-9]. The Compose queue that shows one snackbar at a time is not confirmed by these sources. |
| Target and spacing | None of its own. Each toast's buttons keep at least 48 × 48 dp [MAT-7]. |
| Type | None of its own. Each toast's text scales with the font size setting [AND-5]. |
| Colour and theme | None of its own. Each toast takes `surface-inverse` from the product's roles, which carry light, dark and the contrast levels [MAT-18]. |
| States | Queued, showing, paused while hovered or focused, and gone, by the product's rule. The Compose snackbar's durations, and how they map to the product's 5 and 8 seconds, are not confirmed. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Each toast is announced through a polite live region [AND-2]. A Compose snackbar no longer announces itself on dismiss when TalkBack is on [AND-9]. |
| Navigation placement | The bottom of the screen, above the phone action bar, by the product's rule. `Scaffold` keeps snackbars clear of the screen's edges when the app draws edge to edge [AND-9]. |
| Keyboard, pointer, trackpad | None of its own. Each toast pauses while it has focus, and its buttons take Tab, then Space or Enter [MAT-6]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | 5 seconds, or 8 with Undo, paused while hovered or focused, above the phone action bar. Unproven: no review round has checked it. Material shows snackbars for low-importance messages [MAT-14]. |
| Platform owns | Inset handling at the screen's edges [AND-9]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Native control: the Compose queue that shows one snackbar at a time. States: the Compose snackbar's durations, and how they map to the product's 5 and 8 seconds. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. |
