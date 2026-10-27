# TimePicker on Android

On Android, TimePicker is a Material time picker, by dial, scroll or typed input, in a dialog or inline.

```yaml
component: TimePicker
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
  - key: MAT-9
    url: https://m3.material.io/foundations/interaction/states/applying-states
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-14
    url: https://m3.material.io/components/dialogs/overview
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
  - key: AND-4
    url: https://developer.android.com/reference/android/view/HapticFeedbackConstants
    marker: updated 2026-08-03
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
| Native control | Material time pickers, which help people select and set a specific time [MAT-4]: Compose `TimePicker`, `TimeInput` and `TimePickerDialog` [AND-9]. The 1.5.0 pre-releases add an expressive time picker with a scroll variant [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. AM and PM no longer truncate at large font sizes since a fix in the 1.5.0 pre-releases [AND-9]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Date and time pickers take hovered and focused states [MAT-9]. `TimePickerState` keeps the active selection mode across state restoration [AND-9]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | TalkBack reads formatted time values in the scrolling picker since a fix in the 1.5.0 pre-releases [AND-9]. Keyboard focus no longer drops when switching from hours to minutes on the dial [AND-9]. |
| Navigation placement | In a basic dialog, which Material uses for time pickers [MAT-14], or inline in a form. |
| Keyboard, pointer, trackpad | The clock face responds to keyboard navigation and input since the 1.5.0 pre-releases [AND-9]. Typed input always works through `TimeInput` [AND-9]. |
| Haptics | `CLOCK_TICK`, from API 21, is for an hour or minute tick of a clock [AND-4], and apps should use the same constants as the system's own time pickers [AND-3]. Whether Material's `TimePicker` plays it by default is not confirmed. |
| Brand may change | Times and durations use the formatter's `hours` style, so what people type and what they read agree. Material's time picker dialog confirms with OK [MAT-14], where the product's buttons never say "OK". Unproven: no review round has checked it. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. The person's touch feedback setting [AND-4]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Haptics: whether Material's `TimePicker` plays `CLOCK_TICK` by default. |
