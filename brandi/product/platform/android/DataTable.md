# DataTable on Android

On Android, DataTable is a custom list of record rows on the Material expressive list item, carrying its own accessibility semantics because Material has no data table.

```yaml
component: DataTable
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-4
    url: https://m3.material.io/components
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
  - key: AND-8
    url: https://developer.android.com/about/versions/17
    marker: page 2026-07-01, post 2026-06-16
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
| Native control | None. Material 3 has no data table component [MAT-4]. The closest pattern is the expressive list item [MAT-20], Compose `ListItem`, which merges its children's semantics [AND-2] and left experimental status in the 1.5.0 pre-releases [AND-9]. A Material pattern for column headers and sorting is not confirmed. |
| Target and spacing | Anything tappable in a row meets 48 × 48 dp [MAT-20]. Rows are 56, 72 or 88 dp for one, two or three lines, with 16 dp leading and trailing space [MAT-20]. |
| Type | Row labels in body large, 16 on 24, and supporting text in body medium, 14 on 20 [MAT-20] [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | Selection shows with two cues, such as a leading checkmark and a fill [MAT-21]. A selected item takes `secondary container` with `on secondary container` text [MAT-20]. Dividers are 1 dp lines in `outline` [MAT-20]. |
| States | Enabled, disabled, hovered, focused, pressed, dragged and selected [MAT-20]. A selected item morphs to 16 dp corners [MAT-20]. Loading, empty and error are the product's states, and the empty state replaces the rows. |
| Motion | The shape morph on selection [MAT-20]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The table announces its size with `collectionInfo`, rows and columns, and each row its place with `collectionItemInfo` [AND-2]. A row's label is its label text plus its supporting text [MAT-21]. Selectable rows take role Checkbox on the whole row, with a checked state [MAT-21]. Sorting is announced politely [AND-2]. Row actions that need a gesture are also custom actions [AND-2]. |
| Navigation placement | The list pane. Two panes, list and detail, are recommended at expanded and large widths [MAT-10], and Navigation 3's `ListDetailSceneStrategy` builds that layout [AND-8]. |
| Keyboard, pointer, trackpad | Tab lands on the first or the selected row, the arrow keys move and wrap at the ends, and Space or Enter activates [MAT-21]. The focus ring is 3 dp thick, drawn inside the row, in `secondary` [MAT-20]. Selecting a row never opens it, by the product's rule. |
| Haptics | `SEGMENT_TICK`, from API 34, is for stepping through choices such as list items [AND-4]. Whether Material lists play it is not confirmed. |
| Brand may change | Column types, a first column that names the record, seven columns at most, exact right-aligned numbers in tabular figures, short headers, hairlines between rows and no stripes. Comfortable 48 px and compact 40 px rows in the web build, not converted here. Material's items are 56, 72 or 88 dp [MAT-20]. Under its own phone width it becomes the list it is built on. The header row and sort controls are the product's own, since Material has no table [MAT-4]. |
| Platform owns | The 48 dp target inside rows [MAT-20]. The list key map, which wraps at the ends [MAT-21]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Native control: a Material pattern for column headers and sorting. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Haptics: whether Material lists play `SEGMENT_TICK`. |
