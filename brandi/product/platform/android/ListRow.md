# ListRow on Android

On Android, ListRow is one record in a list, built on the Material expressive list item.

```yaml
component: ListRow
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
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
  - key: AND-10
    url: https://support.google.com/accessibility/android/answer/11183305
    marker: no date shown
    read: 2026-10-27
```

| Field | Spec |
|---|---|
| Native control | Material expressive list item [MAT-20], Compose `ListItem`, which merges its children into one node [AND-2]. Its parts: label text, supporting text, overline, trailing text, trailing icon, divider, and a leading avatar, icon or media [MAT-20]. |
| Target and spacing | 48 × 48 dp for anything tappable [MAT-20], which `ListItem` enforces [AND-1]. Rows are 56, 72 or 88 dp for one, two or three lines, with 16 dp leading and trailing space [MAT-20]. |
| Type | Title in body large, 16 on 24, and meta line in body medium, 14 on 20 [MAT-20] [MAT-16]. Material suggests its "emphasized" styles for selected items and unread messages [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. |
| Colour and theme | A selected row takes `secondary container` with `on secondary container` text [MAT-20], plus a second cue such as a check or an edge [MAT-21]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. |
| States | Enabled, disabled, hovered, focused, pressed, dragged and selected [MAT-20]. A selected item morphs to 16 dp corners, and unselected segmented items keep 4 dp inner and 16 dp outer corners [MAT-20]. Unread adds a dot, by the product's rule. |
| Motion | The shape morph on selection [MAT-20]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Its label is the label text plus the supporting text [MAT-21]. Unread adds "(unread)" through `stateDescription` [AND-2]. Its place comes from `collectionItemInfo` [AND-2]. Swipe actions are also custom actions [AND-2], and Material keeps swipe to reveal to Android Views [MAT-20]. |
| Navigation placement | Inside a List. Once an item reaches 88 dp, as large text can make it, the label aligns to the top [MAT-20]. |
| Keyboard, pointer, trackpad | Tab lands on the first or the selected row, the arrows move and wrap, and Space or Enter activates [MAT-21]. The focus ring is 3 dp thick, inside the row, in `secondary` [MAT-20]. |
| Haptics | `SEGMENT_TICK`, from API 34, is for stepping through list items [AND-4]. Whether Material lists play it is not confirmed. |
| Brand may change | A lead (avatar or icon tile), a bold title, a meta line that answers "what is it, and what is next", and a trailing badge, value or chevron. `selected` marks the open row with `selected-strong` and a `selected-line` edge. A badge is never squeezed to its dot. Under 480 px of list in the web build, not converted here, it moves under the text. The bold title departs from Material's body large label [MAT-20]. |
| Platform owns | The 48 dp touch target, which Compose Material components enforce [AND-1]. The list key map [MAT-21]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Haptics: whether Material lists play `SEGMENT_TICK`. |
