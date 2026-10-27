# NotificationCentre on Android

On Android, NotificationCentre is the signed-in person's events, opened from the header or the rail, as a list in a sheet or a menu.

```yaml
component: NotificationCentre
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
  - key: MAT-10
    url: https://m3.material.io/foundations/layout/breakpoints/overview
    marker: snapshot 2026-10-13_06-10-19
    read: 2026-10-27
  - key: MAT-15
    url: https://m3.material.io/components/bottom-sheets/overview
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
| Native control | None as a Material component [MAT-4]. A Material list [MAT-20] in a bottom sheet at compact widths [MAT-10] [MAT-15] or a menu from medium up [MAT-10]. The trigger's count is a Material badge, Compose `Badge` in a `BadgedBox` [MAT-4] [AND-9]. |
| Target and spacing | The trigger and each event keep at least 48 × 48 dp [MAT-7]. |
| Type | Events as list items, in body large, 16 on 24, with body medium, 14 on 20, for the meta line [MAT-20] [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | The assistant's lines carry the `ai` tone, by the product's rule. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Unread and read, by the product's rule. List items take hovered, focused and pressed states [MAT-20]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The trigger reads its count as words, "3 need you" [AND-1]. `collectionInfo` gives the number of events [AND-2]. A bottom sheet takes `paneTitle` [AND-2]. |
| Navigation placement | Opened from the header or the rail, by the product's rule. Material uses a bottom sheet at compact widths and a menu from medium up for supplementary content [MAT-10]. |
| Keyboard, pointer, trackpad | Tab lands on the first event, the arrows move and wrap, and Space or Enter opens one [MAT-21]. Focus returns to the trigger on close, by the product's rule. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | A highlight count is waiting on the reader, a grey one on others, and zero shows nothing. Each line names who did what, and the assistant's lines carry the `ai` tone. Unproven: no review round has checked it. Material's badges carry counts [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. |
