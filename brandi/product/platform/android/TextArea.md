# TextArea on Android

On Android, TextArea is a multi-line Material text field for notes and messages.

```yaml
component: TextArea
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
| Native control | Material text field [MAT-4], allowed to grow over several lines: Compose `TextField` or `OutlinedTextField` [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. Line heights in sp, and no sp for padding or fixed heights, because nonlinear scaling breaks the sums [AND-5]. Material's text style for the input is not confirmed. |
| Colour and theme | Text keeps 4.5:1 below 18 sp, or below 14 sp in bold, and 3:1 otherwise [AND-1]. The border keeps 3:1 on every surface [MAT-8]. |
| States | Hovered, focused, pressed and disabled, as for every text field [MAT-9]. An error reads through `error()` [AND-2]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | The label says what the text is for, "Notes for finance", and names the field [AND-1]. TalkBack reads an error after the field's text [AND-2]. |
| Navigation placement | In a Field, under its label, by the product's rule. Material moves a dialog that needs keyboard input to full screen at compact widths [MAT-14]. |
| Keyboard, pointer, trackpad | Keyboard focus shows Material's ring-like focus indicator [MAT-9]. A cursor shows the hover state layer, one element at a time [MAT-9]. How Enter and the on-screen keyboard's action key behave in a multi-line Compose field is not confirmed. |
| Haptics | None from the product. `TEXT_HANDLE_MOVE` belongs to moving a text selection handle [AND-4]. |
| Brand may change | Starts at 96 px in the web build, not converted here, and grows vertically. Show a character count only when there is a hard limit. The product's typefaces replace Roboto [MAT-16]. |
| Platform owns | Text scaling, nonlinear to 200% [AND-5]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Type: Material's text style for the input. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: how Enter and the on-screen keyboard's action key behave in a multi-line Compose field. |
