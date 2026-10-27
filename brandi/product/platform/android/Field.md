# Field on Android

On Android, Field ties one control to its label, hint and error so TalkBack reads them together.

```yaml
component: Field
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
| Native control | Material text fields [MAT-4]. Compose `TextField` and `OutlinedTextField` attach the label to the field, inside it or cut into the outline, through `TextFieldLabelPosition` [AND-9]. Whether `TextFieldLabelPosition` offers a position above the field is not confirmed. An error reaches TalkBack through `Modifier.semantics { error(...) }` [AND-2]. |
| Target and spacing | The control's target, at least 48 × 48 dp [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Line heights in sp, and no sp for padding or fixed heights, because nonlinear scaling breaks the sums [AND-5]. Material's text styles for the label and supporting text are not confirmed. |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. The error carries an icon and words as well as colour, by the product's rule. |
| States | Text fields take hovered, focused, pressed and disabled states [MAT-9]. With an error, TalkBack reads the field's own text, then the expanded message set through `error()` [AND-2]. Disabled components cannot be focused, dragged or pressed [MAT-9], and need not meet contrast [MAT-8]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The label must sit on the control's node. A label drawn above the field as separate text is tied to it by merging the two [AND-2]. The error goes through `error()` [AND-2]. |
| Navigation placement | Label above the control, hint below, and the error in place of the hint, by the product's rule. In dialogs, Material puts field errors inline beside the field [MAT-14]. |
| Keyboard, pointer, trackpad | Focus moves from field to field with Tab, shown by Material's focused state [MAT-9]. The error appears when the person leaves the field or saves, never while they type. The action key on the on-screen keyboard is not confirmed. |
| Haptics | None. On Android less is more with haptics, and no haptic beats a buzzy one [AND-3]. |
| Brand may change | Labels above fields, in sentence case, with no colons. Mark optional fields, not required ones. An error replaces the hint, says what is wrong and how to fix it, and carries an icon. Material attaches the label inside the field or in its outline [AND-9], and the product's label above departs from that. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | How TalkBack merges nodes and phrases them [AND-2]. Text scaling, nonlinear to 200% [AND-5]. |
| Not confirmed | Native control: whether `TextFieldLabelPosition` offers a position above the field. Type: Material's text styles for the label and supporting text. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the action key on the on-screen keyboard. |
