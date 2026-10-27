# AvatarGroup on Android

On Android, AvatarGroup is a row of overlapping avatars for the people on a record, with "+N" standing for the rest.

```yaml
component: AvatarGroup
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | None. Material 3 has no avatar group component [MAT-4]. Build it from avatars styled like a list item's leading avatar [MAT-20]. |
| Target and spacing | None unless it opens the full list of people, and then at least 48 × 48 dp [MAT-7]. |
| Type | The "+N" in sp, scaled with the font setting [AND-5]. |
| Colour and theme | Each avatar on its tinted circle [MAT-20]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | None. Material's states show the interaction status of interactive components [MAT-9], and this is not one. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | One merged node for the group [AND-2], whose description names the people, including the hidden ones behind "+N" [AND-1]. |
| Navigation placement | On a record's header or row, by the product's rule. Material places nothing like it [MAT-4]. |
| Keyboard, pointer, trackpad | None. It never takes focus unless it opens the list. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | `people`, `max` (4 by default) and `size`. The "+N" names the hidden people on hover and to screen readers. Material sets nothing for a group of avatars [MAT-4]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Nothing: the sources settle every field. |
