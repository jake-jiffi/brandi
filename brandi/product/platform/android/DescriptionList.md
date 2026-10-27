# DescriptionList on Android

On Android, DescriptionList is a record's label and value pairs, in two columns or stacked, each pair read as one.

```yaml
component: DescriptionList
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
  - key: MAT-10
    url: https://m3.material.io/foundations/layout/breakpoints/overview
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
| Native control | None. Material 3 has no description list [MAT-4]. The closest pattern is a non-interactive list item, a variant Compose Material 3 added in the 1.5.0 pre-releases [AND-9], with an overline or supporting text as the label [MAT-20]. |
| Target and spacing | None. It is read, not pressed. Touch targets are the parts of the screen that respond to input [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's lists set overlines in label small and labels in body large [MAT-20]. |
| Colour and theme | Labels in `text-subtle` and values in `text`, by the product's rule. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | None. A missing value says "Not set", never blank. Material's states are for interactive components [MAT-9]. |
| Motion | None. It does not move, so Remove animations changes nothing [AND-10]. |
| Accessibility API | Each label and its value merge into one node, so TalkBack reads them together [AND-2]. |
| Navigation placement | In a record's detail or a side pane, by the product's rule. At compact widths Material recommends one pane [MAT-10]. |
| Keyboard, pointer, trackpad | None. It holds no controls. Material gives focus to interactive components [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Two columns, or stacked for side panes, stacking by itself under 420 px in the web build, not converted here. Missing values say so. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Nothing: the sources settle every field. |
