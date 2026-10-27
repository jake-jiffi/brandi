# Checkbox on Android

On Android, Checkbox is a Material checkbox in Compose, for a choice saved with a form.

```yaml
component: Checkbox
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
| Native control | Material checkbox, which lets people select one or more items or turn an item on or off [MAT-4]: Compose `Checkbox`, with `TriStateCheckbox` as its three-state form for the product's indeterminate state [AND-9]. Checkbox size and colours moved to the spec behind the `isCheckboxStylingFixEnabled` flag in the 1.5.0 pre-releases [AND-9]. |
| Target and spacing | Touch target at least 48 × 48 dp, pointer target at least 44 × 44 dp, and 8 dp or more between targets [MAT-7]. The box and its label can form one toggleable node [AND-2]. |
| Type | Roboto is the default for both the brand and the plain typeface [MAT-16]. Text in sp, scaled nonlinearly up to 200% since Android 14 [AND-5]. The label's text style comes from the product's ramp. Material's is not confirmed. |
| Colour and theme | One set of colour roles serves light and dark [MAT-18]. Medium contrast (3:1) and high contrast (7:1) arrive through the same roles [MAT-18]. Graphics keep at least 3:1 against the background [MAT-8]. Material's colour roles for the checkbox are not confirmed. |
| States | Checked, unchecked, indeterminate and disabled. Checkboxes take hovered, focused, pressed and disabled states [MAT-9]. Disabled components cannot be focused, dragged or pressed [MAT-9], and need not meet contrast [MAT-8]. |
| Motion | Material motion runs on springs, in an expressive or a standard scheme [MAT-17]. People can turn on Remove animations [AND-10]. `ValueAnimator.areAnimatorsEnabled()` returns false when the animator duration scale is 0 or Battery Saver is on [AND-6]. Whether Remove animations sets that scale is not confirmed. |
| Accessibility API | In Compose a checkbox reads as role Checkbox with a checked or not-checked state, as Material specifies for multi-select list items [MAT-21]. `stateDescription` can rename the state [AND-2]. The label states the outcome and names the node. |
| Navigation placement | In forms, beside its label, by the product's rule. In a list, a checkbox can sit in the leading or the trailing slot [MAT-20]. |
| Keyboard, pointer, trackpad | Keyboard focus shows Material's ring-like focus indicator [MAT-9]. In a selectable list, Space or Enter selects [MAT-21]. The keys for a standalone checkbox are not confirmed. A cursor shows the hover state layer, one element at a time [MAT-9]. |
| Haptics | The closest constants are `TOGGLE_ON` and `TOGGLE_OFF`, from API 34, for a switch or button toggled on or off [AND-4]. Whether a Material checkbox plays one is not confirmed. |
| Brand may change | An 18 px box with a 24 px hit area, 40 to 44 px on touch, in the web build. Those sizes are not converted here, and Material asks 48 × 48 dp [MAT-7]. The label states the outcome, "Email the [client] a copy". A setting that applies at once is a Switch. Material also lets a checkbox turn an item on or off [MAT-4], which the product leaves to the Switch. |
| Platform owns | The 48 dp touch target [MAT-7]. How TalkBack merges nodes and phrases them [AND-2]. |
| Not confirmed | Type: Material's text style for the label. Colour and theme: Material's colour roles for the checkbox. Motion: whether Remove animations sets the animator duration scale that `areAnimatorsEnabled()` reads. Keyboard, pointer, trackpad: the keys for a standalone checkbox. Haptics: whether a Material checkbox plays a toggle haptic. |
