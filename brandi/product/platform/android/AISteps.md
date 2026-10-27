# AISteps on Android

On Android, AISteps is the assistant's steps log, open while it works and folded to one line when it is done, with each step's state in words.

```yaml
component: AISteps
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
  - key: AND-6
    url: https://developer.android.com/reference/android/animation/ValueAnimator
    marker: updated 2026-08-03
    read: 2026-10-27
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no steps log component [MAT-4]. Build it as a list that expands and collapses, as Material lists can [MAT-20]. |
| Target and spacing | The summary line and Try again keep at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Each step's state shows as a word and an icon, never colour alone, by the product's rule. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Each step is done, running, waiting, failed or skipped. The run is working, finished, failed or stopped, by the product's rule. The summary line takes focused, hovered and pressed states [MAT-9]. |
| Motion | One spinner at a time: the summary spins only while the list is folded. At a duration scale of 0, Animator-based animations end immediately [AND-6]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The summary line is `Role.Button` [AND-1], with its open or closed state through `stateDescription` [AND-2]. It reads "Working, step 2 of 4", and each step says its state in words [AND-2]. `collectionInfo` gives the step count [AND-2]. The start, a failure and the end are announced politely, never every change [AND-2]. |
| Navigation placement | Inside an AIAnswer, above the answer, or alone in a Card titled with the job's name for a long job, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | The summary takes Tab, then Space or Enter, as a button [MAT-6]. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. After Try again, focus moves to the summary line, by the product's rule. The Compose API for moving focus is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Steps are named by what they do, in the person's words, and `detail` says where a figure came from and when, or what failed. "Failed at step 2 of 3" and "Stopped at step 2 of 3". `title` never hides a failure or a stop. Material sets nothing for a steps log [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the Compose API for moving focus. |
