# Stepper on Android

On Android, Stepper shows progress through a short setup, with a check on finished steps and a ring on the current one.

```yaml
component: Stepper
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
  - key: MAT-17
    url: https://m3.material.io/styles/motion/overview/how-it-works
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-20
    url: https://m3.material.io/components/lists/specs
    marker: data 38.2.9
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
| Native control | None. Material 3 has no stepper component [MAT-4]. Build it from a list of steps [MAT-20]. |
| Target and spacing | Finished steps can be revisited, so each keeps at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | A check on finished steps and a ring on the current one, so colour is never the only cue, by the product's rule. Graphics keep at least 3:1 against the background [MAT-8]. |
| States | Completed, current and not started, by the product's rule. Finished steps, which can be revisited, take focused, hovered and pressed states [MAT-9]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Each label reads with its state, "Completed", "Current step" or "Not started", through `stateDescription` [AND-2]. `collectionInfo` and `collectionItemInfo` give the count and each step's place [AND-2]. |
| Navigation placement | At the top of the setup flow, horizontal or vertical, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | Finished steps take focus [MAT-9]. The keys that open one are not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Five steps at most, each named by its outcome ("Connect [source]"), with finished steps open to revisit. Material sets nothing for steppers [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the keys that open a finished step. |
