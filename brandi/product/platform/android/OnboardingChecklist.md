# OnboardingChecklist on Android

On Android, OnboardingChecklist is first-run tasks someone can do in any order, with progress in words.

```yaml
component: OnboardingChecklist
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-16
    url: https://m3.material.io/styles/typography/type-scale-tokens
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-20
    url: https://m3.material.io/components/lists/specs
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-21
    url: https://m3.material.io/components/lists/accessibility
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
| Native control | None as a Material component [MAT-4]. A Material list [MAT-20] with a check per task, and a Compose `LinearProgressIndicator` for the total [AND-9]. |
| Target and spacing | Each task at least 48 × 48 dp [MAT-20]. |
| Type | Tasks in body large, 16 on 24 [MAT-20] [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Finished tasks show a check as well as colour [MAT-21]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | To do and done, by the product's rule. List items take hovered, focused and pressed states [MAT-20]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Each task reads its outcome and its state [AND-2]. Progress reads in words, "2 of 5 done", with `progressBarRangeInfo` on the bar [AND-2]. `collectionInfo` gives the number of tasks [AND-2]. |
| Navigation placement | On a first-run screen or a home card, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | Tab lands on the first item, the arrows move and wrap, and Space or Enter opens a task [MAT-21]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Not a Stepper: tasks in any order, each named by its outcome, finished ones open to revisit, and progress in words. Unproven: no review round has checked it. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. |
