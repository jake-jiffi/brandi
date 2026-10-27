# ButtonGroup on Android

On Android, ButtonGroup is a row of Material buttons in a fixed order and spacing that wraps when the width runs out.

```yaml
component: ButtonGroup
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
  - key: MAT-14
    url: https://m3.material.io/components/dialogs/overview
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
  - key: AND-4
    url: https://developer.android.com/reference/android/view/HapticFeedbackConstants
    marker: updated 2026-08-03
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
| Native control | A row of Material buttons [MAT-4]. Material's button group, Compose `ButtonGroup`, adds interactions between its buttons and was promoted to stable in the 1.5.0 pre-releases [MAT-4] [AND-9]. The product's group is only order and spacing, so a plain row is the closer match. |
| Target and spacing | Each button keeps the 48 dp minimum Compose enforces [AND-1], with 8 dp or more between them [MAT-7]. Dialog buttons sit 8 dp apart [MAT-14]. |
| Type | Each label as on Button: label large, 14 on 20, at the default size [MAT-5] [MAT-16]. At 200% a label may take two lines [MAT-6], and the group wraps to a new line rather than squeezing. |
| Colour and theme | Each button in its own style [MAT-5]. Clustered buttons each keep 3:1 against the background [MAT-8]. |
| States | Each button keeps its own states [MAT-5]. Disabled components cannot be focused, dragged or pressed [MAT-9], and need not meet contrast [MAT-8]. |
| Motion | Compose's `ButtonGroup` animates its buttons' widths through `animateWidth`, with a compression animation [AND-9]. The product's group does not move. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | Each button is its own node with `Role.Button` [AND-1], read in the layout's top-down order [MAT-7]. Each label matches what its button shows [MAT-6]. |
| Navigation placement | In dialogs, at the trailing edge with the confirming action nearest it, mirrored for right-to-left languages [MAT-14]. Elsewhere, where the form or card ends. |
| Keyboard, pointer, trackpad | Tab moves from button to button, and Space or Enter activates [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. |
| Haptics | As on Button: `CONFIRM` and `REJECT` report outcomes, from API 30 [AND-4]. Whether Material buttons play a haptic by default is not confirmed. |
| Brand may change | Secondary first, the primary last, and Cancel immediately left of the primary, the order Material uses in dialogs [MAT-14]. An 8 px gap in the web build, not converted here. Material asks 8 dp or more between targets [MAT-7]. Material's group interactions [MAT-4] are not part of the product's group. |
| Platform owns | The 48 dp touch target, which Compose Material components enforce [AND-1]. Right-to-left mirroring of button order [MAT-14]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Haptics: whether Material buttons play a haptic by default. |
