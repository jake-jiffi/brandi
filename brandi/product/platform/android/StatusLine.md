# StatusLine on Android

On Android, StatusLine is the answer's one polite live region, saying when the work starts, each step and how it ends, with Stop at its end when there is no composer.

```yaml
component: StatusLine
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-5
    url: https://m3.material.io/components/buttons/specs
    marker: data 38.2.9
    read: 2026-10-27
  - key: MAT-6
    url: https://m3.material.io/components/buttons/accessibility
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None as a Material component [MAT-4]. A line of text with `liveRegion = LiveRegionMode.Polite` [AND-2], with Stop as a Material button [MAT-4]. |
| Target and spacing | Stop keeps the 48 dp minimum [AND-1]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Numbers go in as words: "step 2 of 3", not "2/3". |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Working, a step changing, waiting for approval, answer ready, stopped and failed, by the product's rule. Stop takes Material's button states [MAT-5]. |
| Motion | The grid and the shimmer move while it works and hold still under reduced motion, while the timer keeps counting. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | One polite live region per answer, in place before anything changes and empty until something does [AND-2]. It speaks only on changes, never as the clock ticks, because live regions are not for content that updates often [AND-2]. The grid, the shimmer and the timer are hidden with `hideFromAccessibility` [AND-1]. The product repeats a message by clearing the line and writing it again. Whether TalkBack announces that repeat is not confirmed. A finished answer that loads stays quiet. |
| Navigation placement | At the top of the answer, or at the foot of a long job, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | Stop takes Tab, then Space or Enter [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | The line's words for each moment: "Working. Step 1 of 3: finding the invoices", "Waiting for your approval", "Answer ready", "Stopped at step 2 of 3", and a failure that names the step and the system. Unproven: no review round has checked it. Material sets nothing for it [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: whether TalkBack announces a repeated message after the line is cleared and written again. |
