# Select on Android

On Android, Select is a Material exposed dropdown menu: a field that opens a menu of up to about 15 options.

```yaml
component: Select
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
  - key: MAT-10
    url: https://m3.material.io/foundations/layout/breakpoints/overview
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
| Native control | Material menus, which display a list of choices on a temporary surface [MAT-4]: Compose `ExposedDropdownMenuBox` with `ExposedDropdownMenu`, an extension on `ExposedDropdownMenuBoxScope` from the 1.5.0 pre-releases, and a `DropdownMenuItem` per option [AND-9]. Expressive menus add `SelectableDropdownMenuItem` for selectable items [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's text styles for menu items are not confirmed. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. The option in hand has a visible edge, not a faint tint, by the product's rule. |
| States | Closed, open, the option in hand, chosen, invalid and disabled, by the product's rule. A menu takes no hover, press or drag state as a whole [MAT-9]. Disabled components cannot be focused, dragged or pressed [MAT-9], and need not meet contrast [MAT-8]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The field reads its current value. Switch Access can activate an editable field inside `ExposedDropdownMenuBox` since a fix in the 1.5.0 pre-releases [AND-9]. The role and expanded state `ExposedDropdownMenuBox` exposes are not confirmed. |
| Navigation placement | Anchored to its field. At compact widths Material uses a bottom sheet for supplementary selection, and a menu from medium up [MAT-10]. |
| Keyboard, pointer, trackpad | The product's map: Up, Down, Home, End and typing a letter move through the options. Enter or Space chooses. Escape and Tab close. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. The key map `ExposedDropdownMenu` supports is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | One option from a short list, up to about 15. Fewer than five options people should compare: a RadioGroup. The placeholder says what to choose, "Choose a [category]", never "Select...". The list is named like the field. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Type: Material's text styles for menu items. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the role and expanded state `ExposedDropdownMenuBox` exposes. Keyboard, pointer, trackpad: the key map `ExposedDropdownMenu` supports. |
