# TextInput on Android

On Android, TextInput is a single-line Material text field in Compose.

```yaml
component: TextInput
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
| Native control | Material text field [MAT-4]: Compose `TextField` or `OutlinedTextField`, with overloads built on `TextFieldState` [AND-9]. Prefix and suffix text are supported, and TalkBack's reading order with them was fixed in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Line heights in sp, and no sp for padding or fixed heights, because nonlinear scaling breaks the sums [AND-5]. Material's text style for the input is not confirmed. |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. The border keeps 3:1 on every surface, by the product's rule, as Material asks of graphics [MAT-8]. One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. |
| States | Text fields take hovered, focused, pressed and disabled states [MAT-9]. Invalid reads through `error()` [AND-2]. Read-only is a dashed edge and a lock, by the product's rule. Material's read-only treatment is not confirmed. Disabled components cannot be focused, dragged or pressed [MAT-9], and need not meet contrast [MAT-8]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The label names the field, and prefix and suffix are read with it [AND-9]. TalkBack reads an error after the field's text [AND-2]. A placeholder never stands in for the label. |
| Navigation placement | In a Field, under its label, by the product's rule. Material moves a dialog that needs keyboard input to full screen at compact widths [MAT-14]. |
| Keyboard, pointer, trackpad | Keyboard focus shows Material's ring-like focus indicator [MAT-9]. A cursor shows the hover state layer, one element at a time [MAT-9]. The on-screen keyboard type and the autofill hints for Compose text fields are not confirmed. |
| Haptics | None from the product. `TEXT_HANDLE_MOVE` belongs to moving a text selection handle [AND-4]. |
| Brand may change | Sizes sm, md and lg, with a prefix, suffix or icon. The product writes these sizes in CSS px for the web build, and they are not converted here. The border is `line-control`. A placeholder shows an example, and Compose's `alwaysMinimize` label position shows a label and a placeholder at once [AND-9]. A read-only value says where it comes from and where to change it. The product's label above the field departs from Material's attached label [AND-9]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Type: Material's text style for the input. States: Material's read-only treatment. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the on-screen keyboard type and autofill hints for Compose text fields. |
