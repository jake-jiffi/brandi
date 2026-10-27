# List on Android

On Android, List is a Material expressive list, a column of ListRows for records on phones, inboxes, queues and the list pane.

```yaml
component: List
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
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
| Native control | Material lists, continuous vertical indexes of text and images [MAT-4]: the expressive list, in a standard or segmented style, with the baseline list no longer recommended [MAT-20]. Compose `ListItem` rows [AND-1], with expressive list items out of experimental status in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | Anything tappable meets 48 × 48 dp [MAT-20]. Compose Material components such as `Button`, `IconButton` and `ListItem` already enforce the 48 dp minimum [AND-1]. |
| Type | Labels in body large, 16 on 24, and supporting text in body medium, 14 on 20 [MAT-20] [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Items on `surface`, and a selected item on `secondary container` [MAT-20]. Dividers are 1 dp `outline` lines inset 16 dp [MAT-20]. |
| States | A list has one selection mode at a time: single-action, multi-action, single-select or multi-select [MAT-20]. Lists can expand and collapse [MAT-20]. |
| Motion | Selected items morph their corners [MAT-20]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | `collectionInfo` gives the row count and `collectionItemInfo` each row's place [AND-2]. Items in a list that is not selectable read without a role. Selectable items take Checkbox or Radio button on the whole item [MAT-21]. Each repeated item gets a description of its own, such as each row of a list [AND-1]. |
| Navigation placement | The list pane of list and detail, recommended at expanded and large widths [MAT-10]. At compact widths it fills the screen as the single pane [MAT-10]. |
| Keyboard, pointer, trackpad | Tab lands on the first item, or the selected one. The arrow keys move and wrap at the ends. Space or Enter activates [MAT-21]. A cursor shows the hover state layer, one element at a time [MAT-9]. |
| Haptics | `SEGMENT_TICK`, from API 34, is for stepping through choices such as list items [AND-4]. Whether Material lists play it is not confirmed. |
| Brand may change | `boxed` by default, or `divided`, with its rows given as data. Material's standard and segmented styles are a visual choice [MAT-20], and the product's boxed list maps onto them. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | The list key map, which wraps at the ends [MAT-21]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Haptics: whether Material lists play `SEGMENT_TICK`. |
