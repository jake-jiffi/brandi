# Button on Android

On Android, Button is a Material 3 button in Compose, with the filled style kept for the one primary action and the other styles for the rest.

```yaml
component: Button
platform: android
checked_against: Android 17 (API 37), Compose Material 3 1.4.0 and 1.5.0-beta02, Material design-system data 38.2.9
checked_on: 2026-10-27
status: current
sources:
  - key: MAT-3
    url: https://m3.material.io/blog/material-is-compose-first
    marker: posted 2026-05-19
    read: 2026-10-27
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
| Native control | Material 3 button [MAT-4]: Compose `Button` for the filled style, and `FilledTonalButton`, `OutlinedButton`, `TextButton` and `ElevatedButton` for the others [AND-9]. Five colour styles: elevated, filled (the default), tonal, outlined and text. Sizes XS 32, S 40 (the default), M 56, L 96 and XL 136 dp, round by default with square as an option [MAT-5]. Build in Compose, since Material Views is in maintenance [MAT-3]. |
| Target and spacing | At least 48 × 48 dp. The XS and S sizes need extra target area to reach it [MAT-5] [MAT-7]. Compose Material buttons enforce the minimum [AND-1]. 8 dp or more between targets [MAT-7]. Padding 16 dp each side on S and 12 dp on XS [MAT-5]. |
| Type | Label large, 14 on 20, on XS and S. Title medium on M, headline small on L and headline large on XL [MAT-5] [MAT-16]. Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The label fits in two lines at 200%, or the full label is reachable in a single tap [MAT-6]. |
| Colour and theme | Filled: container `primary`, label `on primary`. Tonal: `secondary container` and `on secondary container`. Outlined: an `outline variant` edge and an `on surface variant` label. Text: a `primary` label [MAT-5]. Other roles are allowed while container and text keep 3:1 [MAT-5]. Enabled buttons keep 3:1 against the background, measured from the container, or from the label on outlined and text buttons [MAT-6]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. |
| States | Enabled, disabled, hovered, focused and pressed [MAT-5]. State layers at 8% for hover and 10% for focus and press. Disabled: container `on surface` at 10% and label at 38% [MAT-5], with no hover, focus or press [MAT-9]. Pressing morphs the corners squarer [MAT-5]. Because a disabled button cannot take focus [MAT-9], the product's loading button stays enabled, ignores further presses and says "Saving" through `stateDescription` [AND-2]. |
| Motion | Small components such as buttons use the fast spatial and effects springs, in the expressive or the standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | `Role.Button` [AND-1]. The accessibility label matches the visible label, such as Done or Send [MAT-6], and never adds "button" [AND-1]. `Button` merges its children into one node, so an icon beside the label takes `contentDescription = null` [AND-2]. |
| Navigation placement | Content area. For a screen's main action Material offers floating action buttons as a separate component [MAT-4]. In a dialog, buttons sit at the trailing edge with the confirming action nearest it [MAT-14]. |
| Keyboard, pointer, trackpad | Tab focuses, Space or Enter activates [MAT-6]. Focus ring 3 dp thick, 2 dp outside, in `secondary` [MAT-5]. A cursor shows the hover state layer, one element at a time [MAT-9]. Compose 1.11 adds trackpad and mouse support, with native focus rings [AND-8]. |
| Haptics | `CONFIRM` and `REJECT` report an outcome, from API 30 [AND-4]. Android names click feedback for a button press as a haptic use, and no haptic beats a buzzy one [AND-3]. Since API 33 only privileged apps can ignore the user's touch feedback setting [AND-4]. Whether Material buttons play a haptic by default is not confirmed. |
| Brand may change | The product's variants: primary once per view, secondary as the default, ghost for toolbars and dense rows, brand for brand moments, danger in flow, danger-solid only for a destructive dialog's final confirm, and link inline. Material's default style is filled [MAT-5]. The product's default is secondary, with filled kept for the one primary. The product keeps the pill as its only pressable shape, where Material also offers square [MAT-5]. Colour roles may change while container and label keep 3:1 [MAT-5]. Labels are one to three words, verb first, in sentence case, never "Submit", "OK" or "Click here". The product's sm, md and lg sizes are CSS px for the web build and are not converted here. On Android the brand picks from Material's sizes [MAT-5]. The product draws its one focus ring in its `focus` colour, where Material uses `secondary` [MAT-5]. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | The 48 dp touch target, which Compose Material components enforce [AND-1]. State layer opacities [MAT-5]. The focus ring's geometry, 3 dp thick and 2 dp outside [MAT-5]. The press ripple [MAT-9]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Haptics: whether Material buttons play a haptic by default. |
