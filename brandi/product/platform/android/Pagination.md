# Pagination on Android

On Android, Pagination is the footer of a long table: a count such as "1 to 25 of 312" with previous and next buttons.

```yaml
component: Pagination
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
| Native control | None. Material 3 has no pagination component, and Material's lists are continuous indexes [MAT-4]. Build it from text and two icon buttons, Compose `IconButton` [AND-9]. |
| Target and spacing | Previous and next keep the 48 dp minimum of `IconButton` [AND-1], with 8 dp or more between them [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The count in words, "1 to 25 of 312". |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. Graphics keep at least 3:1 against the background [MAT-8]. |
| States | The buttons take focused, hovered, pressed and disabled states [MAT-9]. On the first or last page the matching button is disabled and cannot take focus [MAT-9], so focus moves to the other button or the count, by the product's focus rule. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | The count reads as text [AND-1]. Previous and next are `Role.Button`, with names such as "Next page" [AND-1]. A page change is announced politely [AND-2]. |
| Navigation placement | In the table's footer, by the product's rule. Material describes its lists as continuous indexes [MAT-4]. |
| Keyboard, pointer, trackpad | The buttons take Tab, then Space or Enter [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | "No results" at zero, and no buttons when everything fits on one page. Prefer filters and search to deep paging, and keep the page size the person chose. Paging departs from Material's continuous lists [MAT-4]. |
| Platform owns | The 48 dp touch target, which Compose Material components enforce [AND-1]. |
| Not confirmed | Nothing: the sources settle every field. |
