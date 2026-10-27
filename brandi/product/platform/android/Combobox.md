# Combobox on Android

On Android, Combobox is an editable Material exposed dropdown, a text field that filters a long or searchable list as the person types.

```yaml
component: Combobox
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
| Native control | Material menus [MAT-4]: Compose `ExposedDropdownMenuBox` with an editable text field and `ExposedDropdownMenu` [AND-9]. Switch Access can activate an editable field inside `ExposedDropdownMenuBox` since a fix in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Material's text styles for the field and the menu items are not confirmed. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. The option in hand has a visible edge, not a faint tint, as on Select. |
| States | Closed, open and filtering, the option in hand, chosen, no matches, invalid and disabled, by the product's rule. Text fields take hovered, focused, pressed and disabled states [MAT-9]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The field is named like its label [AND-1]. The number of matches is announced politely as it changes, never on every keystroke [AND-2]. The role, expanded state and active-option semantics `ExposedDropdownMenuBox` exposes are not confirmed. |
| Navigation placement | Anchored to its field, in a popup that flips to stay on screen, by the product's rule. At compact widths Material uses a bottom sheet for supplementary selection [MAT-10]. |
| Keyboard, pointer, trackpad | Typing filters. Up and Down move the active option and keep it in view. Enter chooses. Escape closes and keeps what was typed, by the product's rule. The key map `ExposedDropdownMenu` supports is not confirmed. Keyboard focus shows Material's ring-like focus indicator [MAT-9]. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Replaces Select past about 15 options, including options fetched as the person types. It says when nothing matches and keeps what was typed, and the list is named like its field. Unproven: no review round has checked it. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Type: Material's text styles for the field and the menu items. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Accessibility API: the role, expanded state and active-option semantics `ExposedDropdownMenuBox` exposes. Keyboard, pointer, trackpad: the key map `ExposedDropdownMenu` supports. |
