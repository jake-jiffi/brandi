# LoadingState on Android

On Android, LoadingState shows an area waiting on another system: a line naming the work, an indeterminate bar and, when the brand has one, its character working.

```yaml
component: LoadingState
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
| Native control | None as a component [MAT-4]. Material's loading indicators cover short waits and its progress indicators show a process in real time [MAT-4]. Compose `LinearProgressIndicator`, indeterminate [AND-9]. |
| Target and spacing | None. It holds no controls unless a long wait offers a way to leave, which is a button with the 48 dp minimum [AND-1]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The title names the system and the work: "Pulling this week's [records] from [source]". |
| Colour and theme | Graphics keep at least 3:1 against the background [MAT-8]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Under a second nothing shows. Over ten seconds it says how long the work usually takes and lets people leave, by the product's rule. It is not interactive, so Material's interaction states do not apply [MAT-9]. |
| Motion | The bar runs while the work runs, and the character loops. At a duration scale of 0, Animator-based animations end immediately [AND-6]. Whether Compose's endless animations follow that scale is not confirmed. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The line is a polite live region, so it is read out [AND-2]. It never updates on a timer, because live regions are not for content that changes often [AND-2]. The bar and the character are hidden with `hideFromAccessibility` [AND-1]. |
| Navigation placement | In place of the area that is waiting, by the product's rule. Material's loading indicator is for short waits [MAT-4]. |
| Keyboard, pointer, trackpad | None, unless it offers a way to leave, which takes Tab, then Space or Enter [MAT-6]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | "Loading" is a fallback, not copy. Under a second, show nothing. Content arriving in place takes a Skeleton. A long job can run in the background. The slow indeterminate bar under reduced motion is the product's accepted departure, and Android's animator scale can still stop it [AND-6]. |
| Platform owns | Animator-based animations end at once at a duration scale of 0 [AND-6]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Compose's endless animations follow the animator duration scale, and whether Remove animations sets that scale. |
