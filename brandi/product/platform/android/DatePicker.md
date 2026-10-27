# DatePicker on Android

On Android, DatePicker is a Material date picker, in a dialog or inline, where a typed date always works.

```yaml
component: DatePicker
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
| Native control | Material date pickers, which let people select a date or a range of dates [MAT-4]: Compose `DatePicker`, `DatePickerDialog`, and `DateInput` for typing [AND-9]. Its Java Time APIs left experimental status in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | Each day and control at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's text styles for the picker are not confirmed. The picker uses its own locale's digits since a fix in the 1.5.0 pre-releases [AND-9]. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Date and time pickers take hovered and focused states [MAT-9]. Selected, today and disabled days, by the product's rule. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The field reads its date. A calendar grid needs semantics for each day, since a custom calendar without them is read only as "Calendar" [AND-2]. Material's `DatePicker` brings its own. The roles and states it gives each day are not confirmed. |
| Navigation placement | In a basic dialog, which Material uses for date pickers [MAT-14], or inline in a form. Focus returns to the field when the calendar closes, by the product's rule. |
| Keyboard, pointer, trackpad | Keyboard navigation of the date grid and the year grid was fixed in the 1.5.0 pre-releases, along with a focus trap in the picker outside a dialog [AND-9]. The product asks that the arrows move by day and Page Up and Page Down by month. The key map `DatePicker` supports is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Typing a date always works, in the product's date format. A period says what it is compared with ("vs last month"). Material's date picker dialog confirms with OK [MAT-14], where the product's buttons never say "OK" and name the result instead. Unproven: no review round has checked it. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. The locale's digits [AND-9]. |
| Not confirmed | Type: Material's text styles for the picker. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the roles and states Material's `DatePicker` gives each day. Keyboard, pointer, trackpad: the key map `DatePicker` supports. |
